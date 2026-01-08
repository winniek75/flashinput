import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/database/db'
import logger from '@/utils/logger'

export interface TicketTransaction {
  id?: number
  type: 'earn' | 'use'
  amount: number
  reason: string
  purpose?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface TicketReward {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  category: 'vr' | 'avatar' | 'bonus' | 'special'
  available: boolean
  unlockLevel?: number
}

export const TICKET_EARN_REASONS = {
  LOGIN_BONUS: 'login_bonus',
  GAME_CLEAR: 'game_clear',
  STREAK_BONUS: 'streak_bonus',
  MISSION_COMPLETE: 'mission_complete',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT: 'achievement',
  DAILY_CHALLENGE: 'daily_challenge'
} as const

export const TICKET_USE_PURPOSES = {
  VR_SESSION: 'vr_session',
  AVATAR_UNLOCK: 'avatar_unlock',
  BONUS_GAME: 'bonus_game',
  SPECIAL_EVENT: 'special_event',
  HINT_PURCHASE: 'hint_purchase'
} as const

export const useTicketStore = defineStore('ticket', () => {
  // State
  const currentTickets = ref(0)
  const transactions = ref<TicketTransaction[]>([])
  const lastLoginDate = ref<string | null>(null)
  const consecutiveLogins = ref(0)
  const totalEarned = ref(0)
  const totalUsed = ref(0)

  // 利用可能な特典リスト
  const availableRewards = ref<TicketReward[]>([
    {
      id: 'vr_session_30min',
      name: 'VRセッション（30分）',
      description: 'VR学習モードを30分間利用できます',
      cost: 1,
      icon: '🥽',
      category: 'vr',
      available: true
    },
    {
      id: 'vr_session_60min',
      name: 'VRセッション（60分）',
      description: 'VR学習モードを60分間利用できます',
      cost: 2,
      icon: '🥽',
      category: 'vr',
      available: true
    },
    {
      id: 'avatar_echo_special',
      name: 'ECHO特別アバター',
      description: '限定ECHOアバターを解放',
      cost: 5,
      icon: '🤖',
      category: 'avatar',
      available: true,
      unlockLevel: 10
    },
    {
      id: 'bonus_game_unlock',
      name: 'ボーナスゲーム解放',
      description: '隠しゲームを1つ解放',
      cost: 3,
      icon: '🎮',
      category: 'bonus',
      available: true,
      unlockLevel: 5
    },
    {
      id: 'hint_package',
      name: 'ヒントパッケージ',
      description: 'ゲーム内ヒント10回分',
      cost: 2,
      icon: '💡',
      category: 'bonus',
      available: true
    },
    {
      id: 'special_event_access',
      name: '特別イベント参加権',
      description: '期間限定イベントに参加',
      cost: 10,
      icon: '🎉',
      category: 'special',
      available: false
    }
  ])

  // Getters
  const hasTickets = computed(() => currentTickets.value > 0)

  const canAfford = computed(() => (cost: number) => currentTickets.value >= cost)

  const recentTransactions = computed(() =>
    transactions.value.slice(-10).reverse()
  )

  const todayEarned = computed(() => {
    const today = new Date().toDateString()
    return transactions.value
      .filter(t => t.type === 'earn' && new Date(t.timestamp).toDateString() === today)
      .reduce((sum, t) => sum + t.amount, 0)
  })

  const weeklyStats = computed(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weekTransactions = transactions.value.filter(
      t => new Date(t.timestamp) >= weekAgo
    )

    return {
      earned: weekTransactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.amount, 0),
      used: weekTransactions
        .filter(t => t.type === 'use')
        .reduce((sum, t) => sum + t.amount, 0),
      transactions: weekTransactions.length
    }
  })

  // Actions
  async function initialize() {
    try {
      await loadFromDatabase()
      await checkLoginBonus()
      logger.log('🎫 Ticket system initialized')
    } catch (error) {
      logger.error('Failed to initialize ticket system:', error)
    }
  }

  async function earnTicket(amount: number, reason: string, metadata: Record<string, any> = {}) {
    if (amount <= 0) return false

    try {
      const transaction: TicketTransaction = {
        type: 'earn',
        amount,
        reason,
        timestamp: new Date(),
        metadata
      }

      // データベースに記録
      const id = await db.tickets.add(transaction)
      transaction.id = id

      // ステート更新
      currentTickets.value += amount
      totalEarned.value += amount
      transactions.value.push(transaction)

      // ローカルストレージにも保存
      saveToLocalStorage()

      logger.log(`🎫 Earned ${amount} ticket(s): ${reason}`)

      // アニメーション通知をトリガー
      emitTicketEarnedEvent(amount, reason)

      return true
    } catch (error) {
      logger.error('Failed to earn ticket:', error)
      return false
    }
  }

  async function useTicket(amount: number, purpose: string, metadata: Record<string, any> = {}) {
    if (amount <= 0 || currentTickets.value < amount) {
      logger.warn(`Cannot use ${amount} tickets. Current: ${currentTickets.value}`)
      return false
    }

    try {
      const transaction: TicketTransaction = {
        type: 'use',
        amount,
        reason: purpose,
        purpose,
        timestamp: new Date(),
        metadata
      }

      // データベースに記録
      const id = await db.tickets.add(transaction)
      transaction.id = id

      // ステート更新
      currentTickets.value -= amount
      totalUsed.value += amount
      transactions.value.push(transaction)

      // ローカルストレージにも保存
      saveToLocalStorage()

      logger.log(`🎫 Used ${amount} ticket(s): ${purpose}`)

      return true
    } catch (error) {
      logger.error('Failed to use ticket:', error)
      return false
    }
  }

  async function checkLoginBonus() {
    const today = new Date().toDateString()

    if (lastLoginDate.value === today) {
      logger.log('Login bonus already claimed today')
      return false
    }

    // 前回のログインが昨日だったら連続ログイン
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isConsecutive = lastLoginDate.value === yesterday.toDateString()

    if (isConsecutive) {
      consecutiveLogins.value++
    } else {
      consecutiveLogins.value = 1
    }

    // ボーナス計算
    let bonusAmount = 1 // 基本ボーナス

    // 連続ログインボーナス
    if (consecutiveLogins.value >= 7) {
      bonusAmount = 3 // 7日連続で3枚
    } else if (consecutiveLogins.value >= 3) {
      bonusAmount = 2 // 3日連続で2枚
    }

    // チケット付与
    await earnTicket(bonusAmount, TICKET_EARN_REASONS.LOGIN_BONUS, {
      consecutiveDays: consecutiveLogins.value
    })

    // 最終ログイン日を更新
    lastLoginDate.value = today
    await saveLoginData()

    return true
  }

  function handleGameClear(gameId: string, score: number) {
    const amount = score >= 90 ? 3 : 2 // 高得点なら3枚、通常は2枚
    earnTicket(amount, TICKET_EARN_REASONS.GAME_CLEAR, { gameId, score })
  }

  function handleStreak(streakCount: number) {
    if (streakCount % 5 === 0 && streakCount > 0) {
      const amount = Math.min(3, Math.floor(streakCount / 5))
      earnTicket(amount, TICKET_EARN_REASONS.STREAK_BONUS, { streakCount })
    }
  }

  async function purchaseReward(rewardId: string) {
    const reward = availableRewards.value.find(r => r.id === rewardId)

    if (!reward) {
      logger.error(`Reward not found: ${rewardId}`)
      return false
    }

    if (!canAfford.value(reward.cost)) {
      logger.warn(`Not enough tickets for ${reward.name}. Need: ${reward.cost}, Have: ${currentTickets.value}`)
      return false
    }

    const success = await useTicket(reward.cost, `reward_${reward.category}`, {
      rewardId: reward.id,
      rewardName: reward.name
    })

    if (success) {
      logger.log(`🎁 Purchased: ${reward.name}`)
      // 報酬に応じた処理
      processReward(reward)
    }

    return success
  }

  function processReward(reward: TicketReward) {
    switch (reward.category) {
      case 'vr':
        // VRセッション時間を追加
        window.dispatchEvent(new CustomEvent('vr-session-added', {
          detail: { duration: reward.id.includes('60') ? 60 : 30 }
        }))
        break
      case 'avatar':
        // アバター解放処理
        window.dispatchEvent(new CustomEvent('avatar-unlocked', {
          detail: { avatarId: reward.id }
        }))
        break
      case 'bonus':
        // ボーナスゲーム解放
        window.dispatchEvent(new CustomEvent('bonus-unlocked', {
          detail: { bonusId: reward.id }
        }))
        break
      case 'special':
        // 特別イベント参加権
        window.dispatchEvent(new CustomEvent('special-event-access', {
          detail: { eventId: reward.id }
        }))
        break
    }
  }

  async function getHistory(limit = 50): Promise<TicketTransaction[]> {
    try {
      const history = await db.tickets
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray()
      return history
    } catch (error) {
      logger.error('Failed to get ticket history:', error)
      return []
    }
  }

  async function loadFromDatabase() {
    try {
      // IndexedDBから全トランザクションを読み込み
      const allTransactions = await db.tickets.toArray()
      transactions.value = allTransactions

      // 現在のチケット数を計算
      const earned = allTransactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.amount, 0)
      const used = allTransactions
        .filter(t => t.type === 'use')
        .reduce((sum, t) => sum + t.amount, 0)

      currentTickets.value = earned - used
      totalEarned.value = earned
      totalUsed.value = used

      // ログイン情報をローカルストレージから読み込み
      const savedLoginData = localStorage.getItem('movwise_login_data')
      if (savedLoginData) {
        const data = JSON.parse(savedLoginData)
        lastLoginDate.value = data.lastLoginDate
        consecutiveLogins.value = data.consecutiveLogins || 0
      }

    } catch (error) {
      logger.error('Failed to load from database:', error)
      // フォールバック: ローカルストレージから読み込み
      loadFromLocalStorage()
    }
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('movwise_tickets')
    if (saved) {
      const data = JSON.parse(saved)
      currentTickets.value = data.currentTickets || 0
      totalEarned.value = data.totalEarned || 0
      totalUsed.value = data.totalUsed || 0
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('movwise_tickets', JSON.stringify({
        currentTickets: currentTickets.value,
        totalEarned: totalEarned.value,
        totalUsed: totalUsed.value,
        lastUpdate: new Date().toISOString()
      }))
    } catch (error) {
      logger.error('Failed to save to localStorage:', error)
    }
  }

  async function saveLoginData() {
    try {
      localStorage.setItem('movwise_login_data', JSON.stringify({
        lastLoginDate: lastLoginDate.value,
        consecutiveLogins: consecutiveLogins.value
      }))
    } catch (error) {
      logger.error('Failed to save login data:', error)
    }
  }

  function emitTicketEarnedEvent(amount: number, reason: string) {
    window.dispatchEvent(new CustomEvent('ticket-earned', {
      detail: { amount, reason }
    }))
  }

  // デバッグ用
  function addDebugTickets(amount: number) {
    if (import.meta.env.DEV) {
      earnTicket(amount, 'debug_add', { debug: true })
    }
  }

  function resetTickets() {
    if (import.meta.env.DEV) {
      currentTickets.value = 0
      transactions.value = []
      totalEarned.value = 0
      totalUsed.value = 0
      db.tickets.clear()
      localStorage.removeItem('movwise_tickets')
      logger.log('🔄 Tickets reset')
    }
  }

  return {
    // State
    currentTickets,
    transactions,
    lastLoginDate,
    consecutiveLogins,
    totalEarned,
    totalUsed,
    availableRewards,

    // Getters
    hasTickets,
    canAfford,
    recentTransactions,
    todayEarned,
    weeklyStats,

    // Actions
    initialize,
    earnTicket,
    useTicket,
    checkLoginBonus,
    handleGameClear,
    handleStreak,
    purchaseReward,
    getHistory,

    // Debug
    addDebugTickets,
    resetTickets
  }
})