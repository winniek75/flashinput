<template>
  <div class="momotetsu-game-board">
    <!-- ゲームキャンバス -->
    <div ref="pixiContainer" class="pixi-container"></div>
    
    <!-- UI オーバーレイ -->
    <div class="game-ui-overlay">
      <!-- ヘッダー -->
      <div class="game-header">
        <div class="header-left">
          <button @click="$emit('back')" class="btn-back">
            <span>← 戻る</span>
          </button>
          <div class="turn-info">
            <span class="turn-label">ターン</span>
            <span class="turn-value">{{ gameState?.turn || 1 }} / {{ gameState?.settings.turnLimit || 30 }}</span>
          </div>
        </div>
        
        <div class="header-center">
          <h2 class="game-title">🚂 Galaxy桃鉄 🌌</h2>
        </div>
        
        <div class="header-right">
          <button @click="togglePause" class="btn-pause">
            {{ isPaused ? '▶️' : '⏸️' }}
          </button>
          <button @click="toggleSettings" class="btn-settings">
            ⚙️
          </button>
        </div>
      </div>
      
      <!-- プレイヤー情報パネル -->
      <div class="players-panel">
        <div 
          v-for="player in gameState?.players || []" 
          :key="player.id"
          class="player-card"
          :class="{ 'current-player': player.id === currentPlayer?.id }"
        >
          <div class="player-avatar">{{ player.sprite }}</div>
          <div class="player-info">
            <div class="player-name">{{ player.name }}</div>
            <div class="player-money">💰 {{ player.money.toLocaleString() }}円</div>
            <div class="player-properties">🏢 {{ player.properties.length }}件</div>
          </div>
          <div class="player-rank">#{{ player.rank }}</div>
        </div>
      </div>
      
      <!-- アクションパネル -->
      <div class="action-panel" v-if="isGameActive">
        <!-- サイコロ -->
        <div v-if="gameState?.phase === 'dice_roll'" class="dice-section">
          <button @click="handleRollDice" class="dice-button" :disabled="isRolling">
            <div class="dice-3d" :class="{ rolling: isRolling }">
              {{ diceDisplay }}
            </div>
          </button>
          <p class="action-hint">サイコロを振ってください</p>
        </div>
        
        <!-- 物件購入 -->
        <div v-if="gameState?.phase === 'purchase' && availableProperties.length > 0" class="purchase-section">
          <h3>物件購入</h3>
          <div class="properties-list">
            <div 
              v-for="property in availableProperties" 
              :key="property.id"
              class="property-card"
              @click="handlePurchaseProperty(property)"
            >
              <div class="property-name">{{ property.name }}</div>
              <div class="property-price">💰 {{ property.price.toLocaleString() }}円</div>
              <div class="property-revenue">📈 +{{ property.revenue }}/ターン</div>
            </div>
          </div>
          <button @click="skipPurchase" class="btn-skip">スキップ</button>
        </div>
        
        <!-- カード使用 -->
        <div v-if="showCards && currentPlayer?.cards.length > 0" class="cards-section">
          <h3>カード</h3>
          <div class="cards-list">
            <div 
              v-for="card in currentPlayer.cards" 
              :key="card.id"
              class="card-item"
              @click="handleUseCard(card)"
            >
              <div class="card-icon">{{ card.icon }}</div>
              <div class="card-name">{{ card.name }}</div>
              <div class="card-desc">{{ card.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- ターン終了 -->
        <div v-if="gameState?.phase === 'turn_end'" class="turn-end-section">
          <button @click="handleEndTurn" class="btn-end-turn">
            ターン終了
          </button>
        </div>
      </div>
      
      <!-- 通知 -->
      <TransitionGroup name="notification" tag="div" class="notifications">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification"
          :class="`notification-${notification.type}`"
        >
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
      </TransitionGroup>
    </div>
    
    <!-- 設定モーダル -->
    <div v-if="showSettingsModal" class="modal-overlay" @click="toggleSettings">
      <div class="modal-content" @click.stop>
        <h3>ゲーム設定</h3>
        <div class="settings-form">
          <div class="setting-item">
            <label>BGM音量</label>
            <input type="range" min="0" max="100" v-model="musicVolume" />
          </div>
          <div class="setting-item">
            <label>効果音音量</label>
            <input type="range" min="0" max="100" v-model="effectVolume" />
          </div>
          <div class="setting-item">
            <label>ゲーム速度</label>
            <select v-model="gameSpeed">
              <option value="0.5">遅い</option>
              <option value="1">普通</option>
              <option value="2">速い</option>
            </select>
          </div>
        </div>
        <button @click="toggleSettings" class="btn-close">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as PIXI from 'pixi.js'
import gsap from 'gsap'
import { useMomotetsuGameStore } from '../stores/momotetsuGameStore.ts'

export default {
  name: 'MomotetsuGameBoard',
  emits: ['back'],
  setup(props, { emit }) {
    const gameStore = useMomotetsuGameStore()
    
    // Refs
    const pixiContainer = ref(null)
    const app = ref(null)
    const viewport = ref(null)
    
    // Game state
    const isPaused = ref(false)
    const isRolling = ref(false)
    const diceDisplay = ref('🎲')
    const showCards = ref(false)
    const showSettingsModal = ref(false)
    const availableProperties = ref([])
    
    // Settings
    const musicVolume = ref(50)
    const effectVolume = ref(70)
    const gameSpeed = ref(1)
    
    // Graphics containers
    const boardContainer = ref(null)
    const stationsContainer = ref(null)
    const playersContainer = ref(null)
    const effectsContainer = ref(null)
    
    // Computed
    const gameState = computed(() => gameStore.gameState)
    const currentPlayer = computed(() => gameStore.currentPlayer)
    const currentStation = computed(() => gameStore.currentStation)
    const notifications = computed(() => gameStore.notifications)
    const isGameActive = computed(() => gameStore.isGameActive)
    
    // Canvas 2D ゲーム初期化
    const initCanvas2DGame = async () => {
      if (!pixiContainer.value) {
        logger.error('PIXI container not found')
        return
      }
      
      // PIXI.js を使わずにCanvas 2D API を使用
      logger.log('🎮 Canvas 2D API を使用したゲーム描画を開始')
      
      const gameCanvas = document.createElement('canvas')
      gameCanvas.width = pixiContainer.value.clientWidth || 800
      gameCanvas.height = pixiContainer.value.clientHeight || 600
      gameCanvas.style.background = 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)'
      gameCanvas.style.borderRadius = '12px'
      pixiContainer.value.appendChild(gameCanvas)
      
      const ctx = gameCanvas.getContext('2d')
      
      // 簡単なゲーム描画
      drawSimpleBoard(ctx, gameCanvas.width, gameCanvas.height)
      
      logger.log('🎮 Canvas 2D ゲームボード作成完了')
      
      // Canvas 2D API でのゲーム初期化
      setupCanvas2DGame(ctx, gameCanvas)
      
      // リサイズ対応
      window.addEventListener('resize', () => handleCanvasResize(gameCanvas))
    }
    
    // Canvas 2D API用の描画関数
    const drawSimpleBoard = (ctx, width, height) => {
      // 背景をクリア
      ctx.clearRect(0, 0, width, height)
      
      // 宇宙背景
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#0f0f23')
      gradient.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // 星を描画
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 2 + 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // 中央にタイトル
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🚂 Galaxy桃鉄ゲーム', width / 2, height / 2 - 50)
      
      ctx.font = '18px Arial'
      ctx.fillText('ゲーム準備中...', width / 2, height / 2 + 20)
      
      // 円形のボードパスを描画
      drawBoardPath(ctx, width, height)
    }
    
    const drawBoardPath = (ctx, width, height) => {
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.3
      
      // ボードの円形パス
      ctx.strokeStyle = '#4a90e2'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
      
      // 駅を配置
      const stationCount = 12
      for (let i = 0; i < stationCount; i++) {
        const angle = (i / stationCount) * Math.PI * 2 - Math.PI / 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        
        // 駅のアイコン
        ctx.fillStyle = '#ffd700'
        ctx.beginPath()
        ctx.arc(x, y, 15, 0, Math.PI * 2)
        ctx.fill()
        
        // 駅番号
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText((i + 1).toString(), x, y + 4)
      }
      
      // プレイヤー駒（開始位置）
      const startAngle = -Math.PI / 2
      const playerX = centerX + Math.cos(startAngle) * radius
      const playerY = centerY + Math.sin(startAngle) * radius
      
      ctx.fillStyle = '#ff6b6b'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🚀', playerX, playerY - 20)
    }
    
    const setupCanvas2DGame = (ctx, canvas) => {
      // ゲーム状態の初期描画
      if (gameState.value) {
        logger.log('🎮 ゲーム状態で Canvas を更新')
        drawGameState(ctx, canvas)
      }
    }
    
    const drawGameState = (ctx, canvas) => {
      // ゲーム状態に基づいて描画更新
      drawSimpleBoard(ctx, canvas.width, canvas.height)
      
      // プレイヤー情報を描画
      if (currentPlayer.value) {
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(`現在のプレイヤー: ${currentPlayer.value.name}`, 20, 30)
        ctx.fillText(`所持金: ${currentPlayer.value.money.toLocaleString()}円`, 20, 55)
        ctx.fillText(`ターン: ${gameState.value.turn}`, 20, 80)
      }
    }
    
    const handleCanvasResize = (canvas) => {
      if (!canvas || !pixiContainer.value) return
      
      canvas.width = pixiContainer.value.clientWidth || 800
      canvas.height = pixiContainer.value.clientHeight || 600
      
      const ctx = canvas.getContext('2d')
      drawSimpleBoard(ctx, canvas.width, canvas.height)
    }
    
    // 背景作成
    const createBackground = () => {
      const bg = new PIXI.Graphics()
      bg.beginFill(0x0f0f23)
      bg.drawRect(0, 0, 1920, 1080)
      bg.endFill()
      
      // グリッド描画
      bg.lineStyle(1, 0x2a2a3e, 0.3)
      for (let i = 0; i <= 20; i++) {
        bg.moveTo(i * 96, 0)
        bg.lineTo(i * 96, 1080)
        bg.moveTo(0, i * 54)
        bg.lineTo(1920, i * 54)
      }
      
      return bg
    }
    
    // ボード描画
    const drawBoard = () => {
      if (!gameState.value || !stationsContainer.value) return
      
      // 駅を描画
      gameState.value.stations.forEach((station, index) => {
        const stationSprite = createStationSprite(station, index)
        stationsContainer.value.addChild(stationSprite)
        
        // 接続線を描画
        if (index > 0) {
          const prevStation = gameState.value.stations[index - 1]
          const line = createConnectionLine(prevStation, station)
          stationsContainer.value.addChild(line)
        }
      })
      
      // 最後と最初を接続
      if (gameState.value.stations.length > 1) {
        const firstStation = gameState.value.stations[0]
        const lastStation = gameState.value.stations[gameState.value.stations.length - 1]
        const line = createConnectionLine(lastStation, firstStation)
        stationsContainer.value.addChild(line)
      }
      
      // プレイヤー駒を配置
      gameState.value.players.forEach(player => {
        const playerSprite = createPlayerSprite(player)
        playersContainer.value.addChild(playerSprite)
      })
    }
    
    // 駅スプライト作成
    const createStationSprite = (station, index) => {
      const container = new PIXI.Container()
      container.x = station.position.x
      container.y = station.position.y
      
      // 駅の背景
      const bg = new PIXI.Graphics()
      const color = getStationColor(station.type)
      bg.beginFill(color, 0.8)
      bg.drawRoundedRect(-30, -30, 60, 60, 10)
      bg.endFill()
      
      // 駅番号
      const numberText = new PIXI.Text(index + 1, {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        align: 'center'
      })
      numberText.anchor.set(0.5)
      
      // 駅アイコン
      const iconText = new PIXI.Text(station.icon, {
        fontFamily: 'Arial',
        fontSize: 24,
        align: 'center'
      })
      iconText.anchor.set(0.5)
      iconText.y = -40
      
      container.addChild(bg)
      container.addChild(numberText)
      container.addChild(iconText)
      
      // インタラクティブ設定
      container.interactive = true
      container.buttonMode = true
      container.on('pointerover', () => {
        gsap.to(container.scale, { x: 1.1, y: 1.1, duration: 0.2 })
      })
      container.on('pointerout', () => {
        gsap.to(container.scale, { x: 1, y: 1, duration: 0.2 })
      })
      container.on('click', () => {
        showStationInfo(station)
      })
      
      return container
    }
    
    // 駅の色取得
    const getStationColor = (type) => {
      const colors = {
        start: 0x4caf50,
        normal: 0x2196f3,
        property: 0xff9800,
        event: 0x9c27b0,
        bonus: 0xffc107,
        card: 0x00bcd4,
        goal: 0xf44336
      }
      return colors[type] || 0x607d8b
    }
    
    // 接続線作成
    const createConnectionLine = (from, to) => {
      const line = new PIXI.Graphics()
      line.lineStyle(3, 0x4a5568, 0.5)
      line.moveTo(from.position.x, from.position.y)
      line.lineTo(to.position.x, to.position.y)
      return line
    }
    
    // プレイヤースプライト作成
    const createPlayerSprite = (player) => {
      const container = new PIXI.Container()
      container.name = player.id
      
      // プレイヤーアイコン
      const icon = new PIXI.Text(player.sprite, {
        fontFamily: 'Arial',
        fontSize: 32,
        align: 'center'
      })
      icon.anchor.set(0.5)
      
      // プレイヤー名
      const nameText = new PIXI.Text(player.name, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xffffff,
        align: 'center'
      })
      nameText.anchor.set(0.5)
      nameText.y = 25
      
      container.addChild(icon)
      container.addChild(nameText)
      
      // 初期位置設定
      updatePlayerPosition(container, player)
      
      return container
    }
    
    // プレイヤー位置更新
    const updatePlayerPosition = (sprite, player) => {
      if (!gameState.value) return
      
      const station = gameState.value.stations[player.position]
      if (station) {
        sprite.x = station.position.x
        sprite.y = station.position.y - 60
      }
    }
    
    // プレイヤー移動アニメーション
    const animatePlayerMovement = async (player, fromPos, toPos) => {
      const sprite = playersContainer.value?.children.find(c => c.name === player.id)
      if (!sprite || !gameState.value) return
      
      const steps = Math.abs(toPos - fromPos)
      const stations = gameState.value.stations
      
      for (let i = 1; i <= steps; i++) {
        const nextPos = (fromPos + i) % stations.length
        const station = stations[nextPos]
        
        await new Promise(resolve => {
          gsap.to(sprite, {
            x: station.position.x,
            y: station.position.y - 60,
            duration: 0.5 / gameSpeed.value,
            ease: 'power2.inOut',
            onComplete: resolve
          })
        })
        
        // 移動エフェクト
        createMoveEffect(station.position.x, station.position.y)
      }
    }
    
    // 移動エフェクト作成
    const createMoveEffect = (x, y) => {
      if (!effectsContainer.value) return
      
      const circle = new PIXI.Graphics()
      circle.beginFill(0xffeb3b, 0.5)
      circle.drawCircle(0, 0, 20)
      circle.endFill()
      circle.x = x
      circle.y = y
      
      effectsContainer.value.addChild(circle)
      
      gsap.to(circle, {
        alpha: 0,
        width: 60,
        height: 60,
        duration: 0.5,
        onComplete: () => {
          effectsContainer.value.removeChild(circle)
        }
      })
    }
    
    // カメラ設定
    const setupCamera = () => {
      if (!boardContainer.value || !app.value) return
      
      // ビューポートの中心にボードを配置
      boardContainer.value.x = app.value.screen.width / 2 - 960
      boardContainer.value.y = app.value.screen.height / 2 - 540
      
      // ズーム・パン機能
      app.value.stage.interactive = true
      
      let isDragging = false
      let dragStart = { x: 0, y: 0 }
      let containerStart = { x: 0, y: 0 }
      
      app.value.stage.on('pointerdown', (e) => {
        isDragging = true
        dragStart = { x: e.data.global.x, y: e.data.global.y }
        containerStart = { x: boardContainer.value.x, y: boardContainer.value.y }
      })
      
      app.value.stage.on('pointermove', (e) => {
        if (!isDragging) return
        
        const dx = e.data.global.x - dragStart.x
        const dy = e.data.global.y - dragStart.y
        
        boardContainer.value.x = containerStart.x + dx
        boardContainer.value.y = containerStart.y + dy
      })
      
      app.value.stage.on('pointerup', () => {
        isDragging = false
      })
      
      // マウスホイールでズーム
      pixiContainer.value.addEventListener('wheel', (e) => {
        e.preventDefault()
        const scale = e.deltaY > 0 ? 0.9 : 1.1
        const newScale = Math.max(0.5, Math.min(2, boardContainer.value.scale.x * scale))
        
        gsap.to(boardContainer.value.scale, {
          x: newScale,
          y: newScale,
          duration: 0.2
        })
      })
    }
    
    // サイコロを振る
    const handleRollDice = async () => {
      if (isRolling.value) return
      
      isRolling.value = true
      
      // サイコロアニメーション
      for (let i = 0; i < 10; i++) {
        diceDisplay.value = Math.floor(Math.random() * 6) + 1
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 実際のサイコロ処理
      const result = await gameStore.rollDice()
      diceDisplay.value = result
      
      // プレイヤー移動
      const oldPos = currentPlayer.value.position
      await gameStore.movePlayer(result)
      const newPos = currentPlayer.value.position
      
      // アニメーション
      await animatePlayerMovement(currentPlayer.value, oldPos, newPos)
      
      isRolling.value = false
      diceDisplay.value = '🎲'
      
      // 駅の物件確認
      updateAvailableProperties()
    }
    
    // 物件購入
    const handlePurchaseProperty = async (property) => {
      try {
        await gameStore.purchaseProperty(property)
        updateAvailableProperties()
      } catch (error) {
        gameStore.addNotification('error', 'エラー', error.message)
      }
    }
    
    // 購入スキップ
    const skipPurchase = () => {
      gameStore.endTurn()
      availableProperties.value = []
    }
    
    // カード使用
    const handleUseCard = async (card) => {
      try {
        await gameStore.useCard(card)
      } catch (error) {
        gameStore.addNotification('error', 'エラー', error.message)
      }
    }
    
    // ターン終了
    const handleEndTurn = () => {
      gameStore.endTurn()
      availableProperties.value = []
    }
    
    // 利用可能な物件更新
    const updateAvailableProperties = () => {
      if (!currentStation.value) {
        availableProperties.value = []
        return
      }
      
      availableProperties.value = currentStation.value.properties.filter(p => !p.owner)
    }
    
    // 駅情報表示
    const showStationInfo = (station) => {
      gameStore.addNotification('info', station.name, station.description)
    }
    
    // 一時停止切り替え
    const togglePause = () => {
      isPaused.value = !isPaused.value
      if (isPaused.value) {
        gameState.value.phase = 'paused'
      } else {
        gameState.value.phase = 'dice_roll'
      }
    }
    
    // 設定切り替え
    const toggleSettings = () => {
      showSettingsModal.value = !showSettingsModal.value
    }
    
    // リサイズ処理
    const handleResize = () => {
      if (!app.value || !pixiContainer.value) return
      
      app.value.renderer.resize(
        pixiContainer.value.clientWidth,
        pixiContainer.value.clientHeight
      )
    }
    
    // クリーンアップ
    const cleanup = () => {
      window.removeEventListener('resize', handleCanvasResize)
    }
    
    // ライフサイクル
    onMounted(async () => {
      logger.log('🚂 GameBoard mounted')
      
      try {
        // ゲームが開始されていない場合は新規開始
        if (!gameState.value) {
          logger.log('🎮 新しいゲームを開始')
          gameStore.startNewGame()
        }
        
        // Canvas 2D ゲーム初期化
        await initCanvas2DGame()
        
        logger.log('🚂 GameBoard 初期化完了')
      } catch (error) {
        logger.error('🚂 GameBoard 初期化エラー:', error)
        gameStore.addNotification('error', 'エラー', 'ゲームの初期化に失敗しました')
      }
    })
    
    onUnmounted(() => {
      cleanup()
    })
    
    // ゲーム状態の監視
    watch(() => gameState.value?.currentPlayerIndex, () => {
      if (gameState.value && currentPlayer.value?.isAI) {
        // AI の自動プレイ
        setTimeout(() => {
          if (gameState.value.phase === 'dice_roll') {
            handleRollDice()
          }
        }, 1000)
      }
    })
    
    return {
      // Refs
      pixiContainer,
      
      // State
      isPaused,
      isRolling,
      diceDisplay,
      showCards,
      showSettingsModal,
      availableProperties,
      musicVolume,
      effectVolume,
      gameSpeed,
      
      // Computed
      gameState,
      currentPlayer,
      currentStation,
      notifications,
      isGameActive,
      
      // Methods
      handleRollDice,
      handlePurchaseProperty,
      skipPurchase,
      handleUseCard,
      handleEndTurn,
      togglePause,
      toggleSettings
    }
  }
}
</script>

<style scoped>
.momotetsu-game-board {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  overflow: hidden;
}

.pixi-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.game-ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.game-ui-overlay > * {
  pointer-events: auto;
}

/* ヘッダー */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.turn-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.turn-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.turn-value {
  font-size: 1.2rem;
  font-weight: bold;
}

/* ボタン */
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
}

.btn-pause,
.btn-settings {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
}

/* プレイヤーパネル */
.players-panel {
  position: absolute;
  top: 80px;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.player-card.current-player {
  border-color: #ffc107;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.player-avatar {
  font-size: 2rem;
}

.player-info {
  flex: 1;
  color: #fff;
}

.player-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.player-money,
.player-properties {
  font-size: 0.9rem;
  opacity: 0.9;
}

.player-rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffc107;
}

/* アクションパネル */
.action-panel {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  min-width: 300px;
}

.dice-section {
  text-align: center;
}

.dice-button {
  width: 100px;
  height: 100px;
  font-size: 3rem;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dice-3d {
  transition: transform 0.3s ease;
}

.dice-3d.rolling {
  animation: dice-roll 0.5s infinite;
}

@keyframes dice-roll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.action-hint {
  color: #fff;
  opacity: 0.8;
}

/* 物件購入 */
.purchase-section h3,
.cards-section h3 {
  color: #fff;
  margin-bottom: 1rem;
}

.properties-list,
.cards-list {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.property-card,
.card-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.property-card:hover,
.card-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.property-name,
.card-name {
  color: #fff;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.property-price,
.property-revenue,
.card-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.btn-skip {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
}

.btn-end-turn {
  width: 100%;
  font-size: 1.2rem;
  padding: 1rem;
}

/* 通知 */
.notifications {
  position: absolute;
  top: 100px;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 300px;
}

.notification {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  border-left: 4px solid #2196f3;
  color: #fff;
}

.notification-success {
  border-left-color: #4caf50;
}

.notification-warning {
  border-left-color: #ff9800;
}

.notification-error {
  border-left-color: #f44336;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 通知アニメーション */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  border-radius: 1rem;
  padding: 2rem;
  min-width: 400px;
  color: #fff;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  flex: 1;
}

.setting-item input[type="range"],
.setting-item select {
  flex: 1;
  max-width: 150px;
}

.btn-close {
  width: 100%;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .players-panel {
    flex-direction: row;
    top: auto;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    overflow-x: auto;
    max-width: 90%;
  }
  
  .player-card {
    min-width: 150px;
  }
  
  .action-panel {
    bottom: 1rem;
    width: 90%;
    max-width: 400px;
  }
  
  .modal-content {
    min-width: 90%;
    max-width: 400px;
  }
}
</style>