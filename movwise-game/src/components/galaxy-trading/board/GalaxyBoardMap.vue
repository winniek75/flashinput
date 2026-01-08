<template>
  <div class="galaxy-board-map min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
    <!-- 宇宙背景エフェクト -->
    <div class="absolute inset-0">
      <!-- 星々 -->
      <div
        v-for="star in stars"
        :key="star.id"
        class="absolute rounded-full bg-white animate-pulse"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          animationDelay: `${star.delay}s`
        }"
      ></div>
      
      <!-- 流れ星 -->
      <div
        v-for="meteor in meteors"
        :key="meteor.id"
        class="absolute bg-gradient-to-r from-white to-transparent h-0.5 animate-meteor"
        :style="{
          left: `${meteor.x}%`,
          top: `${meteor.y}%`,
          width: '80px',
          animationDelay: `${meteor.delay}s`
        }"
      ></div>

      <!-- 星雲エフェクト -->
      <div class="nebula-effect nebula-1"></div>
      <div class="nebula-effect nebula-2"></div>
      <div class="nebula-effect nebula-3"></div>
    </div>

    <!-- ゲームボード -->
    <div class="relative z-10 p-4 md:p-8">
      <!-- ヘッダー情報 -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 bg-black/50 backdrop-blur-sm rounded-2xl p-4 gap-4">
        <div class="flex items-center gap-4">
          <button
            @click="$emit('back')"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" />
            <span class="hidden sm:inline">戻る</span>
          </button>
          <div class="text-white text-center md:text-left">
            <div class="text-xl font-bold">Galaxy Trading Empire</div>
            <div class="text-sm opacity-80">ターン {{ currentTurn }} / {{ maxTurns }}</div>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- プレイヤー情報 -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl px-4 py-2">
            <div class="text-white text-sm">所持金</div>
            <div class="text-white text-xl font-bold">{{ playerMoney.toLocaleString() }} EP</div>
          </div>
          
          <!-- 3Dサイコロボタン -->
          <div class="dice-3d-container">
            <button
              @click="rollDice"
              :disabled="isMoving || diceRolling"
              class="dice-3d-button relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 md:px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <div 
                class="dice-3d"
                :class="{ 'dice-rolling': diceRolling }"
              >
                <div class="dice-face dice-front">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
                <div class="dice-face dice-back">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
                <div class="dice-face dice-right">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
                <div class="dice-face dice-left">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
                <div class="dice-face dice-top">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
                <div class="dice-face dice-bottom">{{ diceRolling ? '?' : (diceValue || '🎲') }}</div>
              </div>
              <span class="dice-label hidden md:block">
                {{ diceRolling ? 'サイコロを振っています...' : 'サイコロを振る' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- メインボードエリア -->
      <div class="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-2xl overflow-hidden">
        <!-- 3D宇宙空間コンテナ -->
        <div class="space-3d-container" @wheel="handleCameraZoom" @mousedown="startCameraDrag" @mousemove="handleCameraDrag" @mouseup="stopCameraDrag">
          <div class="space-3d-viewport">
            <!-- 宇宙背景 -->
            <div class="space-background">
              <div class="stars-field"></div>
              <div class="nebula-clouds"></div>
            </div>
            
            <!-- カメラ追従システム -->
            <div 
              ref="cameraSystem"
              class="camera-follow-system"
              :style="cameraFollowStyle"
            >
              <!-- プレイヤーキャラクター -->
              <div class="player-character" :style="playerPositionStyle">
                <div class="character-sprite">🚀</div>
                <div class="character-trail"></div>
                <div class="character-name">プレイヤー</div>
              </div>

              <!-- ボードタイル -->
              <div 
                v-for="tile in boardTiles"
                :key="tile.id"
                class="board-tile"
                :class="[
                  `tile-${tile.type}`,
                  { 'tile-current': tile.id === currentTileId }
                ]"
                :style="getTileStyle(tile)"
                @click="handleTileClick(tile)"
              >
                <div class="tile-content">
                  <div class="tile-icon">{{ tile.icon }}</div>
                  <div class="tile-name">{{ tile.name }}</div>
                  <div v-if="tile.description" class="tile-description">{{ tile.description }}</div>
                </div>
                
                <!-- タイルエフェクト -->
                <div class="tile-effects">
                  <div class="tile-glow"></div>
                  <div class="tile-particles"></div>
                </div>
              </div>

              <!-- 移動パス -->
              <svg class="movement-path" :style="pathStyle">
                <path 
                  :d="movementPath" 
                  fill="none" 
                  stroke="url(#pathGradient)" 
                  stroke-width="3"
                  stroke-dasharray="5,5"
                  class="path-line"
                />
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        <!-- ボードコントロール -->
        <div class="board-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            @click="resetCamera"
            class="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <RotateCcw class="w-4 h-4" />
          </button>
          <button
            @click="toggleFullscreen"
            class="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <Maximize2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- ゲーム情報パネル -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 現在位置情報 -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <h3 class="text-lg font-bold text-white mb-2">現在位置</h3>
          <div class="text-center">
            <div class="text-3xl mb-2">{{ currentTile?.icon || '🚀' }}</div>
            <div class="text-white font-bold">{{ currentTile?.name || '開始地点' }}</div>
            <div class="text-white/80 text-sm">{{ currentTile?.description || 'ボードゲームを開始しましょう！' }}</div>
          </div>
        </div>

        <!-- ゲーム統計 -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <h3 class="text-lg font-bold text-white mb-2">ゲーム統計</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-white/80">移動回数:</span>
              <span class="text-white font-bold">{{ moveCount }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-white/80">訪問惑星:</span>
              <span class="text-white font-bold">{{ visitedPlanets }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-white/80">獲得報酬:</span>
              <span class="text-green-300 font-bold">+{{ totalRewards }} EP</span>
            </div>
          </div>
        </div>

        <!-- 次のターン情報 -->
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <h3 class="text-lg font-bold text-white mb-2">次のターン</h3>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-300 mb-2">{{ nextTurnAction }}</div>
            <div class="text-white/80 text-sm">{{ nextTurnDescription }}</div>
          </div>
        </div>
      </div>

      <!-- イベント通知 -->
      <Transition name="event-notification">
        <div v-if="showEventNotification" class="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-2xl z-50 max-w-sm">
          <div class="flex items-center gap-3">
            <div class="text-2xl">{{ eventNotification.icon }}</div>
            <div>
              <div class="font-bold">{{ eventNotification.title }}</div>
              <div class="text-sm opacity-90">{{ eventNotification.message }}</div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, RotateCcw, Maximize2 } from 'lucide-vue-next'

export default {
  name: 'GalaxyBoardMap',
  components: {
    ArrowLeft,
    RotateCcw,
    Maximize2
  },
  emits: ['back', 'tile-reached', 'event-triggered'],
  setup(props, { emit }) {
    logger.log('🗺️ GalaxyBoardMap setup開始:', { 
      props: !!props, 
      emit: !!emit, 
      emitType: typeof emit,
      emitKeys: emit ? Object.keys(emit) : 'undefined'
    })
    
    // === 状態管理 ===
    const currentTurn = ref(1)
    const maxTurns = ref(20)
    const playerMoney = ref(1000)
    const diceValue = ref(null)
    const diceRolling = ref(false)
    const isMoving = ref(false)
    const currentTileId = ref('start')
    const moveCount = ref(0)
    const visitedPlanets = ref(0)
    const totalRewards = ref(0)
    
    // カメラ制御
    const cameraSystem = ref(null)
    const cameraFollowStyle = ref({})
    const isDragging = ref(false)
    const dragStart = ref({ x: 0, y: 0 })
    const cameraOffset = ref({ x: 0, y: 0 })
    
    // 背景エフェクト
    const stars = ref([])
    const meteors = ref([])
    
    // イベント通知
    const showEventNotification = ref(false)
    const eventNotification = ref({})
    
    // === ボードデータ ===
    const boardTiles = ref([
      { id: 'start', type: 'start', name: '開始地点', icon: '🚀', x: 0, y: 0, description: '冒険の始まり' },
      { id: 'planet1', type: 'planet', name: 'Apple Planet', icon: '🍎', x: 100, y: 50, description: 'りんごの惑星', property: 'apple-planet' },
      { id: 'planet2', type: 'planet', name: 'Robot Planet', icon: '🤖', x: 200, y: 100, description: 'ロボットの惑星', property: 'robot-planet' },
      { id: 'planet3', type: 'planet', name: 'Grammar Moon', icon: '📚', x: 300, y: 150, description: '文法の月', property: 'grammar-moon' },
      { id: 'event1', type: 'event', name: '宇宙イベント', icon: '⭐', x: 150, y: 75, description: '特別な出来事' },
      { id: 'bonus1', type: 'bonus', name: 'ボーナス', icon: '💰', x: 250, y: 125, description: '追加報酬' }
    ])
    
    // === 計算プロパティ ===
    const currentTile = computed(() => 
      boardTiles.value.find(tile => tile.id === currentTileId.value)
    )
    
    const playerPositionStyle = computed(() => ({
      transform: `translate(${currentTile.value?.x || 0}px, ${currentTile.value?.y || 0}px)`
    }))
    
    const nextTurnAction = computed(() => {
      if (isMoving.value) return '移動中...'
      if (diceRolling.value) return 'サイコロを振る'
      return 'サイコロを振る'
    })
    
    const nextTurnDescription = computed(() => {
      if (isMoving.value) return '目的地に向かって移動中です'
      if (diceRolling.value) return 'サイコロの結果を待っています'
      return '次の移動のためにサイコロを振りましょう'
    })
    
    const movementPath = computed(() => {
      // 移動パスの計算（簡略化）
      return 'M 0 0 L 100 50 L 200 100 L 300 150'
    })
    
    const pathStyle = computed(() => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
    }))
    
    // === メソッド ===
    
    /**
     * 背景星の生成
     */
    const generateBackgroundStars = () => {
      stars.value = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 5
      }))
    }
    
    /**
     * 流れ星の生成
     */
    const generateMeteors = () => {
      meteors.value = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 10
      }))
    }
    
    /**
     * サイコロを振る
     */
    const rollDice = async () => {
      logger.log('🎲 rollDice開始:', { 
        diceRolling: diceRolling.value, 
        isMoving: isMoving.value,
        emit: !!emit 
      })
      
      if (diceRolling.value || isMoving.value) {
        logger.log('⚠️ サイコロを振れません:', { diceRolling: diceRolling.value, isMoving: isMoving.value })
        return
      }
      
      try {
        diceRolling.value = true
        logger.log('🔄 サイコロアニメーション開始')
        
        // アニメーション効果（8回のランダム表示）
        for (let i = 0; i < 8; i++) {
          diceValue.value = Math.floor(Math.random() * 6) + 1
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // 最終結果（1-6のランダム値）
        const finalResult = Math.floor(Math.random() * 6) + 1
        diceValue.value = finalResult
        logger.log('🎯 サイコロ結果:', finalResult)
        
        // 移動処理
        logger.log('🚀 移動処理開始')
        await movePlayer(finalResult)
        logger.log('✅ 移動処理完了')
        
      } catch (error) {
        logger.error('❌ サイコロロールエラー:', error)
        // エラー時のフォールバック
        diceValue.value = 1
        showEventNotification.value = true
        eventNotification.value = {
          icon: '⚠️',
          title: 'サイコロエラー',
          message: 'サイコロを振る際にエラーが発生しました。'
        }
        
        setTimeout(() => {
          showEventNotification.value = false
        }, 3000)
      } finally {
        diceRolling.value = false
        logger.log('🎲 rollDice完了')
      }
    }
    
    /**
     * プレイヤーを移動
     */
    const movePlayer = async (steps) => {
      logger.log('🚀 movePlayer開始:', { steps, emit: !!emit, emitType: typeof emit })
      
      isMoving.value = true
      moveCount.value++
      
      try {
        // 移動アニメーション
        for (let i = 0; i < steps; i++) {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 次のタイルに移動
          const nextTile = getNextTile()
          if (nextTile) {
            currentTileId.value = nextTile.id
            logger.log('📍 タイル移動:', nextTile)
            
            // タイル到達イベント
            if (emit && typeof emit === 'function') {
              logger.log('📡 emit実行:', 'tile-reached', nextTile)
              emit('tile-reached', nextTile)
            } else {
              logger.warn('⚠️ emitが利用できません:', { emit, emitType: typeof emit })
            }
            
            // イベント処理
            if (nextTile.type === 'planet') {
              visitedPlanets.value++
              showEventNotification.value = true
              eventNotification.value = {
                icon: '🌍',
                title: '惑星到達！',
                message: `${nextTile.name}に到着しました！`
              }
            } else if (nextTile.type === 'event') {
              showEventNotification.value = true
              eventNotification.value = {
                icon: '⭐',
                title: 'イベント発生！',
                message: '特別な出来事が起こりました！'
              }
            } else if (nextTile.type === 'bonus') {
              const reward = Math.floor(Math.random() * 100) + 50
              totalRewards.value += reward
              playerMoney.value += reward
              
              showEventNotification.value = true
              eventNotification.value = {
                icon: '💰',
                title: 'ボーナス獲得！',
                message: `+${reward} EPを獲得しました！`
              }
            }
            
            setTimeout(() => {
              showEventNotification.value = false
            }, 3000)
          }
        }
      } catch (error) {
        logger.error('❌ プレイヤー移動エラー:', error)
        // エラー時のフォールバック
        showEventNotification.value = true
        eventNotification.value = {
          icon: '⚠️',
          title: '移動エラー',
          message: '移動中にエラーが発生しました。'
        }
        
        setTimeout(() => {
          showEventNotification.value = false
        }, 3000)
      } finally {
        isMoving.value = false
        logger.log('✅ movePlayer完了')
      }
    }
    
    /**
     * 次のタイルを取得
     */
    const getNextTile = () => {
      const currentIndex = boardTiles.value.findIndex(tile => tile.id === currentTileId.value)
      const nextIndex = (currentIndex + 1) % boardTiles.value.length
      return boardTiles.value[nextIndex]
    }
    
    /**
     * タイルクリック処理
     */
    const handleTileClick = (tile) => {
      if (tile.id === currentTileId.value) return
      
      // タイル情報表示
      showEventNotification.value = true
      eventNotification.value = {
        icon: tile.icon,
        title: tile.name,
        message: tile.description
      }
      
      setTimeout(() => {
        showEventNotification.value = false
      }, 2000)
    }
    
    /**
     * カメラズーム処理
     */
    const handleCameraZoom = (event) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? 0.9 : 1.1
      // ズーム処理の実装
    }
    
    /**
     * カメラドラッグ開始
     */
    const startCameraDrag = (event) => {
      isDragging.value = true
      dragStart.value = { x: event.clientX, y: event.clientY }
    }
    
    /**
     * カメラドラッグ処理
     */
    const handleCameraDrag = (event) => {
      if (!isDragging.value) return
      
      const deltaX = event.clientX - dragStart.value.x
      const deltaY = event.clientY - dragStart.value.y
      
      cameraOffset.value.x += deltaX * 0.5
      cameraOffset.value.y += deltaY * 0.5
      
      dragStart.value = { x: event.clientX, y: event.clientY }
      updateCameraPosition()
    }
    
    /**
     * カメラドラッグ終了
     */
    const stopCameraDrag = () => {
      isDragging.value = false
    }
    
    /**
     * カメラ位置更新
     */
    const updateCameraPosition = () => {
      cameraFollowStyle.value = {
        transform: `translate(${cameraOffset.value.x}px, ${cameraOffset.value.y}px)`
      }
    }
    
    /**
     * カメラリセット
     */
    const resetCamera = () => {
      cameraOffset.value = { x: 0, y: 0 }
      updateCameraPosition()
    }
    
    /**
     * フルスクリーン切り替え
     */
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
    
    /**
     * タイルスタイル取得
     */
    const getTileStyle = (tile) => ({
      position: 'absolute',
      left: `${tile.x}px`,
      top: `${tile.y}px`,
      transform: 'translate(-50%, -50%)'
    })
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🗺️ Galaxy Board Map 初期化')
      generateBackgroundStars()
      generateMeteors()
      updateCameraPosition()
    })
    
    return {
      // State
      currentTurn,
      maxTurns,
      playerMoney,
      diceValue,
      diceRolling,
      isMoving,
      currentTileId,
      moveCount,
      visitedPlanets,
      totalRewards,
      cameraSystem,
      cameraFollowStyle,
      stars,
      meteors,
      showEventNotification,
      eventNotification,
      boardTiles,
      
      // Computed
      currentTile,
      playerPositionStyle,
      nextTurnAction,
      nextTurnDescription,
      movementPath,
      pathStyle,
      
      // Methods
      rollDice,
      movePlayer,
      handleTileClick,
      handleCameraZoom,
      startCameraDrag,
      handleCameraDrag,
      stopCameraDrag,
      resetCamera,
      toggleFullscreen,
      getTileStyle
    }
  }
}
</script>

<style scoped>
/* 宇宙背景エフェクト */
@keyframes meteor {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100px) translateY(100px);
    opacity: 0;
  }
}

.animate-meteor {
  animation: meteor 2s linear infinite;
}

/* 星雲エフェクト */
.nebula-effect {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(20px);
}

.nebula-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #8B5CF6, transparent);
  top: 10%;
  left: 20%;
  animation: nebula-float 20s ease-in-out infinite;
}

.nebula-2 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #3B82F6, transparent);
  top: 60%;
  right: 30%;
  animation: nebula-float 15s ease-in-out infinite reverse;
}

.nebula-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #EC4899, transparent);
  bottom: 20%;
  left: 50%;
  animation: nebula-float 25s ease-in-out infinite;
}

@keyframes nebula-float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

/* 3Dサイコロ */
.dice-3d-container {
  perspective: 1000px;
}

.dice-3d {
  width: 40px;
  height: 40px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.dice-3d.dice-rolling {
  animation: dice-roll 0.5s infinite;
}

.dice-face {
  position: absolute;
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.dice-front { transform: translateZ(20px); }
.dice-back { transform: translateZ(-20px); }
.dice-right { transform: translateX(20px) rotateY(90deg); }
.dice-left { transform: translateX(-20px) rotateY(-90deg); }
.dice-top { transform: translateY(-20px) rotateX(90deg); }
.dice-bottom { transform: translateY(20px) rotateX(-90deg); }

@keyframes dice-roll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

/* ボードタイル */
.board-tile {
  position: absolute;
  width: 80px;
  height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.board-tile:hover {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 20;
}

.tile-content {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
}

.board-tile:hover .tile-content {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
}

.tile-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tile-name {
  font-size: 10px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.tile-description {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  display: none;
}

.board-tile:hover .tile-description {
  display: block;
}

/* タイルタイプ別スタイル */
.tile-start .tile-content {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.tile-planet .tile-content {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
}

.tile-event .tile-content {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
}

.tile-bonus .tile-content {
  background: rgba(236, 72, 153, 0.2);
  border-color: rgba(236, 72, 153, 0.4);
}

.tile-current .tile-content {
  background: rgba(252, 211, 77, 0.3);
  border-color: rgba(252, 211, 77, 0.6);
  box-shadow: 0 0 20px rgba(252, 211, 77, 0.4);
}

/* プレイヤーキャラクター */
.player-character {
  position: absolute;
  z-index: 30;
  transition: all 0.5s ease;
}

.character-sprite {
  font-size: 32px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.character-trail {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: trail-pulse 2s ease-in-out infinite;
}

.character-name {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  white-space: nowrap;
}

@keyframes trail-pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.5); }
}

/* 移動パス */
.movement-path {
  z-index: 5;
}

.path-line {
  animation: path-flow 3s linear infinite;
}

@keyframes path-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 10; }
}

/* イベント通知 */
.event-notification-enter-active,
.event-notification-leave-active {
  transition: all 0.3s ease;
}

.event-notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.event-notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .board-tile {
    width: 60px;
    height: 60px;
  }
  
  .tile-icon {
    font-size: 18px;
  }
  
  .tile-name {
    font-size: 8px;
  }
  
  .tile-description {
    font-size: 6px;
  }
  
  .character-sprite {
    font-size: 24px;
  }
  
  .character-name {
    font-size: 8px;
    padding: 1px 6px;
  }
}

@media (max-width: 480px) {
  .board-tile {
    width: 50px;
    height: 50px;
  }
  
  .tile-icon {
    font-size: 16px;
  }
  
  .tile-name {
    font-size: 7px;
  }
  
  .character-sprite {
    font-size: 20px;
  }
}
</style>