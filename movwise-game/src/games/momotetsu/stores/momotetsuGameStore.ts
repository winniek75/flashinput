import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import logger from '@/utils/logger'
import type {
  GameState,
  Player,
  Station,
  Property,
  Card,
  GameEvent,
  GamePhase,
  GameSettings,
  GameHistory,
  GameNotification,
  StationType,
  PropertyCategory
} from '../types/game.types'
import { GameMode, CardType } from '../types/game.types'

export const useMomotetsuGameStore = defineStore('momotetsuGame', () => {
  // === 状態管理 ===
  const gameState = ref<GameState | null>(null)
  const notifications = ref<GameNotification[]>([])
  const isLoading = ref(false)
  const gameMode = ref<GameMode>(GameMode.CLASSIC)
  
  // デフォルト設定
  const defaultSettings: GameSettings = {
    playerCount: 2,
    aiDifficulty: 'normal',
    turnLimit: 30,
    startingMoney: 10000,
    mapSize: 'medium',
    enableCards: true,
    enableEvents: true,
    gameSpeed: 1,
    soundEnabled: true,
    musicVolume: 0.5,
    effectVolume: 0.7
  }

  // === 計算プロパティ ===
  const currentPlayer = computed(() => {
    if (!gameState.value) return null
    return gameState.value.players[gameState.value.currentPlayerIndex]
  })

  const currentStation = computed(() => {
    if (!gameState.value || !currentPlayer.value) return null
    return gameState.value.stations.find(s => s.id === `station-${currentPlayer.value.position}`)
  })

  const playerRankings = computed(() => {
    if (!gameState.value) return []
    return [...gameState.value.players].sort((a, b) => b.totalAssets - a.totalAssets)
  })

  const isGameActive = computed(() => {
    return gameState.value && 
           gameState.value.phase !== GamePhase.MENU && 
           gameState.value.phase !== GamePhase.GAME_END
  })

  // === アクション ===
  
  /**
   * 新しいゲームを開始
   */
  const startNewGame = (settings: Partial<GameSettings> = {}) => {
    try {
      logger.log('🎮 新しいゲーム開始中...')
      const finalSettings = { ...defaultSettings, ...settings }
    
    // プレイヤーの初期化
    const players: Player[] = []
    for (let i = 0; i < finalSettings.playerCount; i++) {
      players.push({
        id: `player-${i}`,
        name: i === 0 ? 'プレイヤー' : `CPU ${i}`,
        position: 0,
        money: finalSettings.startingMoney,
        properties: [],
        cards: [],
        isAI: i !== 0,
        color: getPlayerColor(i),
        sprite: getPlayerSprite(i),
        totalAssets: finalSettings.startingMoney,
        rank: i + 1
      })
    }

    // 駅の初期化（簡易版）
    const stations = generateStations(finalSettings.mapSize)

    // ゲーム状態の初期化
    gameState.value = {
      id: generateGameId(),
      turn: 1,
      currentPlayerIndex: 0,
      players,
      stations,
      phase: GamePhase.DICE_ROLL,
      diceValue: null,
      eventQueue: [],
      settings: finalSettings,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

      addNotification('success', 'ゲーム開始', '新しいゲームを開始しました！')
      saveGameState()
      logger.log('🎮 新しいゲーム開始完了')
    } catch (error) {
      logger.error('🎮 ゲーム開始エラー:', error)
      addNotification('error', 'ゲーム開始エラー', 'ゲームの開始に失敗しました')
    }
  }

  /**
   * サイコロを振る
   */
  const rollDice = async (): Promise<number> => {
    if (!gameState.value || gameState.value.phase !== GamePhase.DICE_ROLL) {
      throw new Error('サイコロを振ることができません')
    }

    gameState.value.phase = GamePhase.MOVING
    const diceValue = Math.floor(Math.random() * 6) + 1
    gameState.value.diceValue = diceValue

    addHistory('move', `サイコロで${diceValue}が出ました`)
    
    return diceValue
  }

  /**
   * プレイヤーを移動
   */
  const movePlayer = async (steps: number) => {
    if (!gameState.value || !currentPlayer.value) return

    const player = currentPlayer.value
    const oldPosition = player.position
    const newPosition = (oldPosition + steps) % gameState.value.stations.length
    
    player.position = newPosition
    gameState.value.phase = GamePhase.ACTION

    const station = gameState.value.stations[newPosition]
    addHistory('move', `${player.name}が${station.name}に到着`)

    // 駅のイベント処理
    await processStationEvent(station)
    
    saveGameState()
  }

  /**
   * 物件を購入
   */
  const purchaseProperty = async (property: Property) => {
    if (!gameState.value || !currentPlayer.value) {
      throw new Error('物件を購入できません')
    }

    const player = currentPlayer.value
    
    if (player.money < property.price) {
      throw new Error('資金が不足しています')
    }

    // 購入処理
    player.money -= property.price
    property.owner = player.id
    player.properties.push(property)
    
    // 総資産の更新
    updatePlayerAssets(player)
    
    addHistory('purchase', `${player.name}が${property.name}を購入`)
    addNotification('success', '購入成功', `${property.name}を購入しました！`)
    
    gameState.value.phase = GamePhase.TURN_END
    saveGameState()
  }

  /**
   * カードを使用
   */
  const useCard = async (card: Card, targetPlayerId?: string) => {
    if (!gameState.value || !currentPlayer.value) {
      throw new Error('カードを使用できません')
    }

    const player = currentPlayer.value
    const cardIndex = player.cards.findIndex(c => c.id === card.id)
    
    if (cardIndex === -1) {
      throw new Error('指定されたカードを持っていません')
    }

    // カード効果の適用
    await applyCardEffect(card, player, targetPlayerId)
    
    // カードを手札から削除
    player.cards.splice(cardIndex, 1)
    
    addHistory('card', `${player.name}が${card.name}を使用`)
    addNotification('info', 'カード使用', `${card.name}を使用しました`)
    
    saveGameState()
  }

  /**
   * ターンを終了
   */
  const endTurn = () => {
    if (!gameState.value) return

    // 次のプレイヤーへ
    gameState.value.currentPlayerIndex = 
      (gameState.value.currentPlayerIndex + 1) % gameState.value.players.length

    // ターン数の更新
    if (gameState.value.currentPlayerIndex === 0) {
      gameState.value.turn++
      
      // ターン制限チェック
      if (gameState.value.turn > gameState.value.settings.turnLimit) {
        endGame()
        return
      }

      // 収益計算（ターン終了時）
      calculateIncome()
    }

    gameState.value.phase = GamePhase.DICE_ROLL
    gameState.value.diceValue = null
    
    saveGameState()
  }

  /**
   * ゲームを終了
   */
  const endGame = () => {
    if (!gameState.value) return

    gameState.value.phase = GamePhase.GAME_END
    
    // 最終順位の計算
    const rankings = playerRankings.value
    rankings.forEach((player, index) => {
      player.rank = index + 1
    })

    addNotification('info', 'ゲーム終了', `優勝は${rankings[0].name}です！`)
    
    // リーダーボードに記録
    saveToLeaderboard()
    
    saveGameState()
  }

  // === ヘルパー関数 ===

  /**
   * 駅のイベント処理
   */
  const processStationEvent = async (station: Station) => {
    if (!gameState.value || !currentPlayer.value) return

    switch (station.type) {
      case StationType.PROPERTY:
        // 物件購入の機会
        if (station.properties.some(p => !p.owner)) {
          gameState.value.phase = GamePhase.PURCHASE
        }
        break
        
      case StationType.EVENT:
        // イベント発生
        if (station.event) {
          await processGameEvent(station.event)
        }
        break
        
      case StationType.BONUS:
        // ボーナス獲得
        const bonus = Math.floor(Math.random() * 5000) + 1000
        currentPlayer.value.money += bonus
        addNotification('success', 'ボーナス！', `${bonus}円を獲得しました！`)
        break
        
      case StationType.CARD:
        // カード獲得
        const card = generateRandomCard()
        currentPlayer.value.cards.push(card)
        addNotification('info', 'カード獲得', `${card.name}を手に入れました！`)
        break
    }
  }

  /**
   * ゲームイベントの処理
   */
  const processGameEvent = async (event: GameEvent) => {
    if (!currentPlayer.value) return

    const effect = event.effect
    
    if (effect.money) {
      currentPlayer.value.money += effect.money
      const action = effect.money > 0 ? '獲得' : '失う'
      addNotification(
        effect.money > 0 ? 'success' : 'warning',
        event.name,
        `${Math.abs(effect.money)}円を${action}しました`
      )
    }

    if (effect.movement) {
      await movePlayer(effect.movement)
    }

    if (effect.cards) {
      currentPlayer.value.cards.push(...effect.cards)
    }
  }

  /**
   * カード効果の適用
   */
  const applyCardEffect = async (card: Card, player: Player, targetId?: string) => {
    const effect = card.effect
    
    switch (effect.type) {
      case 'money':
        player.money += effect.value as number
        break
        
      case 'movement':
        await movePlayer(effect.value as number)
        break
        
      case 'steal':
        if (targetId) {
          const target = gameState.value?.players.find(p => p.id === targetId)
          if (target) {
            const amount = Math.min(target.money * 0.1, effect.value as number)
            target.money -= amount
            player.money += amount
          }
        }
        break
    }
  }

  /**
   * 収益計算
   */
  const calculateIncome = () => {
    if (!gameState.value) return

    gameState.value.players.forEach(player => {
      const income = player.properties.reduce((sum, prop) => sum + prop.revenue, 0)
      player.money += income
      
      if (income > 0) {
        addHistory('income', `${player.name}が${income}円の収益を獲得`)
      }
      
      updatePlayerAssets(player)
    })
  }

  /**
   * プレイヤーの総資産を更新
   */
  const updatePlayerAssets = (player: Player) => {
    const propertyValue = player.properties.reduce((sum, prop) => sum + prop.price, 0)
    player.totalAssets = player.money + propertyValue
  }

  /**
   * 通知を追加
   */
  const addNotification = (
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string
  ) => {
    const notification: GameNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration: 3000,
      timestamp: new Date().toISOString()
    }
    
    notifications.value.push(notification)
    
    // 自動削除
    setTimeout(() => {
      const index = notifications.value.findIndex(n => n.id === notification.id)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }, notification.duration)
  }

  /**
   * 履歴を追加
   */
  const addHistory = (type: string, description: string) => {
    if (!gameState.value || !currentPlayer.value) return

    const history: GameHistory = {
      turn: gameState.value.turn,
      playerId: currentPlayer.value.id,
      action: { type: type as any, description },
      details: {},
      timestamp: new Date().toISOString()
    }
    
    gameState.value.history.push(history)
    
    // 履歴の制限（最新100件）
    if (gameState.value.history.length > 100) {
      gameState.value.history = gameState.value.history.slice(-100)
    }
  }

  /**
   * ゲーム状態を保存
   */
  const saveGameState = () => {
    if (!gameState.value) return
    
    gameState.value.updatedAt = new Date().toISOString()
    localStorage.setItem('momotetsu-game-state', JSON.stringify(gameState.value))
  }

  /**
   * ゲーム状態を読み込み
   */
  const loadGameState = () => {
    const saved = localStorage.getItem('momotetsu-game-state')
    if (saved) {
      try {
        gameState.value = JSON.parse(saved)
        addNotification('info', 'ロード完了', '前回のゲームを再開しました')
      } catch (error) {
        logger.error('ゲームの読み込みに失敗しました:', error)
      }
    }
  }

  /**
   * リーダーボードに保存
   */
  const saveToLeaderboard = () => {
    if (!gameState.value) return
    
    const winner = playerRankings.value[0]
    const entry = {
      userId: 'current-user',
      playerName: winner.name,
      score: winner.totalAssets,
      totalAssets: winner.totalAssets,
      turnCount: gameState.value.turn,
      date: new Date().toISOString(),
      mapName: 'デフォルトマップ',
      difficulty: gameState.value.settings.aiDifficulty
    }
    
    // LocalStorageに保存（実際はAPIを使用）
    const leaderboard = JSON.parse(localStorage.getItem('momotetsu-leaderboard') || '[]')
    leaderboard.push(entry)
    leaderboard.sort((a: any, b: any) => b.score - a.score)
    localStorage.setItem('momotetsu-leaderboard', JSON.stringify(leaderboard.slice(0, 100)))
  }

  // === ユーティリティ関数 ===

  const generateGameId = () => `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const getPlayerColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
    return colors[index % colors.length]
  }
  
  const getPlayerSprite = (index: number) => {
    const sprites = ['🚀', '🛸', '🚁', '✈️', '🚂', '🚗']
    return sprites[index % sprites.length]
  }

  const generateStations = (mapSize: string): Station[] => {
    const stationCount = mapSize === 'small' ? 20 : mapSize === 'medium' ? 30 : 40
    const stations: Station[] = []
    
    for (let i = 0; i < stationCount; i++) {
      const angle = (i / stationCount) * Math.PI * 2
      const radius = 300
      
      stations.push({
        id: `station-${i}`,
        name: `駅 ${i + 1}`,
        type: getStationType(i),
        position: {
          x: Math.cos(angle) * radius + 400,
          y: Math.sin(angle) * radius + 300
        },
        properties: generateProperties(i),
        description: `駅 ${i + 1}の説明`,
        icon: getStationIcon(i),
        connections: [`station-${(i + 1) % stationCount}`]
      })
    }
    
    return stations
  }

  const getStationType = (index: number): StationType => {
    if (index === 0) return StationType.START
    if (index % 5 === 0) return StationType.BONUS
    if (index % 7 === 0) return StationType.EVENT
    if (index % 3 === 0) return StationType.PROPERTY
    return StationType.NORMAL
  }

  const getStationIcon = (index: number): string => {
    const icons = ['🏠', '🏢', '🏭', '🏪', '🏦', '🏛️', '🏨', '🏥']
    return icons[index % icons.length]
  }

  const generateProperties = (stationIndex: number): Property[] => {
    if (stationIndex % 3 !== 0) return []
    
    const properties: Property[] = []
    const count = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < count; i++) {
      properties.push({
        id: `property-${stationIndex}-${i}`,
        name: `物件 ${stationIndex}-${i + 1}`,
        stationId: `station-${stationIndex}`,
        price: (Math.floor(Math.random() * 50) + 10) * 1000,
        revenue: (Math.floor(Math.random() * 10) + 1) * 100,
        level: 1,
        maxLevel: 5,
        category: PropertyCategory.COMMERCE,
        description: '商業物件'
      })
    }
    
    return properties
  }

  const generateRandomCard = (): Card => {
    const cards: Card[] = [
      {
        id: `card-${Date.now()}`,
        name: '急行カード',
        type: CardType.MOVEMENT,
        effect: { type: 'movement', value: 6 },
        description: '6マス進める',
        icon: '🚄'
      },
      {
        id: `card-${Date.now()}`,
        name: 'ボーナスカード',
        type: CardType.MONEY,
        effect: { type: 'money', value: 5000 },
        description: '5000円獲得',
        icon: '💰'
      }
    ]
    
    return cards[Math.floor(Math.random() * cards.length)]
  }

  return {
    // State
    gameState,
    notifications,
    isLoading,
    gameMode,
    
    // Computed
    currentPlayer,
    currentStation,
    playerRankings,
    isGameActive,
    
    // Actions
    startNewGame,
    rollDice,
    movePlayer,
    purchaseProperty,
    useCard,
    endTurn,
    endGame,
    loadGameState,
    saveGameState,
    
    // Utilities
    addNotification
  }
})