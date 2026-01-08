// src/stores/streakStore.js - MovWISE ストリークシステム
import { defineStore } from 'pinia'
import logger from '@/utils/logger'

export const useStreakStore = defineStore('streak', {
  state: () => ({
    // 基本ストリークデータ
    currentStreak: 0,           // 現在の連続日数
    longestStreak: 0,           // 最長記録
    lastActivityDate: null,     // 最後の学習日
    totalDaysPlayed: 0,         // 総学習日数

    // 詳細データ
    dailyGoal: {
      gamesPlayed: 0,           // 今日プレイしたゲーム数
      requiredGames: 3,         // 目標ゲーム数（デフォルト3）
      completed: false,         // 今日の目標達成フラグ
      bonusGames: 0,           // ボーナスゲーム数
      lastReset: null          // 最終リセット日時
    },

    // ストリーク保護
    streakShields: 0,           // ストリーク保護アイテム数
    freezeUsedToday: false,     // 今日フリーズ使用済み
    protectedDays: [],          // 保護された日付リスト

    // 報酬トラッキング
    milestones: [3, 7, 14, 30, 60, 100, 365],
    claimedMilestones: [],
    pendingRewards: [],

    // カレンダーデータ（月ごと）
    activityCalendar: {},        // { '2025-01-06': { completed: true, games: 5, score: 850 } }

    // 統計データ
    statistics: {
      totalGamesPlayed: 0,
      totalPlayTime: 0,         // 分単位
      averageSessionTime: 0,    // 分単位
      favoriteGame: null,
      bestDay: null,            // 最も多くプレイした日
      weeklyPattern: {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
        friday: 0, saturday: 0, sunday: 0
      }
    },

    // 設定
    settings: {
      reminderEnabled: true,
      reminderTime: '20:00',
      soundEnabled: true,
      vibrationEnabled: true,
      autoShieldUse: false      // 自動的にシールドを使用
    }
  }),

  getters: {
    // ストリーク状態の判定
    streakStatus: (state) => {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (state.lastActivityDate === today) {
        return 'active'          // 今日学習済み
      } else if (state.lastActivityDate === yesterday) {
        return 'at_risk'         // 危険！今日やらないと途切れる
      } else if (state.protectedDays.includes(yesterday) && state.lastActivityDate === new Date(Date.now() - 172800000).toISOString().split('T')[0]) {
        return 'protected'       // シールドで保護中
      }
      return 'broken'           // すでに途切れている
    },

    // 今日の進捗率
    todayProgress: (state) => {
      const progress = (state.dailyGoal.gamesPlayed / state.dailyGoal.requiredGames) * 100
      return Math.min(100, Math.round(progress))
    },

    // 次のマイルストーンまで
    nextMilestone: (state) => {
      return state.milestones.find(m => m > state.currentStreak) || null
    },

    // 次のマイルストーンまでの日数
    daysToNextMilestone: (state) => (getters) => {
      const next = getters.nextMilestone
      return next ? next - state.currentStreak : 0
    },

    // ストリーク危機までの残り時間（ミリ秒）
    timeUntilStreakBreak: (state) => {
      if (state.dailyGoal.completed) return null

      const now = new Date()
      const midnight = new Date(now)
      midnight.setDate(midnight.getDate() + 1)
      midnight.setHours(0, 0, 0, 0)
      return midnight.getTime() - now.getTime()
    },

    // 今週の学習日数
    weeklyActivityCount: (state) => {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      let count = 0
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        if (state.activityCalendar[dateStr]?.completed) {
          count++
        }
      }
      return count
    },

    // ストリークレベル（炎の強さ）
    streakLevel: (state) => {
      if (state.currentStreak >= 100) return 'legendary'
      if (state.currentStreak >= 60) return 'epic'
      if (state.currentStreak >= 30) return 'rare'
      if (state.currentStreak >= 14) return 'uncommon'
      if (state.currentStreak >= 7) return 'common'
      if (state.currentStreak >= 3) return 'starter'
      return 'none'
    }
  },

  actions: {
    // ゲーム完了時に呼び出し
    recordActivity(gameId, gameData = {}) {
      const today = new Date().toISOString().split('T')[0]
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

      logger.log(`🎮 Recording activity for game: ${gameId}`)

      // カレンダー更新
      if (!this.activityCalendar[today]) {
        this.activityCalendar[today] = {
          completed: false,
          games: 0,
          gameIds: [],
          totalScore: 0,
          totalTime: 0
        }
      }

      this.activityCalendar[today].games++
      this.activityCalendar[today].gameIds.push(gameId)

      if (gameData.score) {
        this.activityCalendar[today].totalScore += gameData.score
      }

      if (gameData.playTime) {
        this.activityCalendar[today].totalTime += gameData.playTime
        this.statistics.totalPlayTime += gameData.playTime
      }

      // デイリーゴール更新
      this.dailyGoal.gamesPlayed++

      // 統計更新
      this.statistics.totalGamesPlayed++
      this.statistics.weeklyPattern[dayOfWeek]++

      // お気に入りゲーム更新
      this.updateFavoriteGame(gameId)

      // デイリーゴール達成チェック
      if (this.dailyGoal.gamesPlayed >= this.dailyGoal.requiredGames && !this.dailyGoal.completed) {
        this.completeDailyGoal()
      }

      // 効果音再生（設定に応じて）
      if (this.settings.soundEnabled) {
        this.playStreakSound('activity_recorded')
      }

      return {
        progress: this.todayProgress,
        completed: this.dailyGoal.completed,
        streak: this.currentStreak
      }
    },

    // デイリーゴール達成処理
    completeDailyGoal() {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      logger.log('🎯 Daily goal completed!')

      this.dailyGoal.completed = true
      this.activityCalendar[today].completed = true
      this.totalDaysPlayed++

      // ストリーク更新ロジック
      const previousStreak = this.currentStreak

      if (this.lastActivityDate === yesterday || this.lastActivityDate === null) {
        // 連続維持 or 新規開始
        this.currentStreak++
        logger.log(`🔥 Streak increased to ${this.currentStreak}`)
      } else if (this.lastActivityDate !== today) {
        // ストリークが途切れていた場合
        if (this.checkAndUseProtection(yesterday)) {
          // シールドで保護
          this.currentStreak++
          logger.log(`🛡️ Streak protected! Now at ${this.currentStreak}`)
        } else {
          // ストリークリセット
          this.currentStreak = 1
          logger.log('💔 Streak reset to 1')
        }
      }

      // 最長記録更新
      if (this.currentStreak > this.longestStreak) {
        this.longestStreak = this.currentStreak
        logger.log(`🏆 New longest streak: ${this.longestStreak}`)
      }

      this.lastActivityDate = today

      // マイルストーン報酬チェック
      this.checkMilestoneRewards()

      // 効果音再生
      if (this.settings.soundEnabled) {
        this.playStreakSound('goal_complete')
      }

      // バイブレーション（モバイル）
      if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100])
      }

      return {
        streakIncreased: this.currentStreak > previousStreak,
        newStreak: this.currentStreak,
        milestoneReached: this.pendingRewards.length > 0
      }
    },

    // マイルストーン報酬チェック
    checkMilestoneRewards() {
      const newMilestones = this.milestones.filter(
        m => m <= this.currentStreak && !this.claimedMilestones.includes(m)
      )

      newMilestones.forEach(milestone => {
        logger.log(`🎉 Milestone reached: ${milestone} days!`)

        this.claimedMilestones.push(milestone)

        // 報酬を保留リストに追加
        const reward = this.getMilestoneReward(milestone)
        this.pendingRewards.push({
          milestone,
          reward,
          claimed: false,
          date: new Date().toISOString()
        })

        // 効果音
        if (this.settings.soundEnabled) {
          this.playStreakSound('milestone')
        }
      })
    },

    // マイルストーン報酬定義
    getMilestoneReward(days) {
      const rewards = {
        3: {
          cosmicEnergy: 100,
          badge: 'streak_starter',
          title: '🔥 火花',
          message: '3日連続達成！素晴らしいスタート！'
        },
        7: {
          cosmicEnergy: 300,
          badge: 'streak_week',
          shield: 1,
          title: '🔥 炎',
          message: '1週間連続！習慣化への第一歩！'
        },
        14: {
          cosmicEnergy: 500,
          badge: 'streak_2weeks',
          shield: 2,
          vrTicket: 1,
          title: '🔥🔥 火炎',
          message: '2週間達成！あなたは本物です！'
        },
        30: {
          cosmicEnergy: 1000,
          badge: 'streak_month',
          shield: 3,
          vrTicket: 3,
          rareItem: 'golden_star',
          title: '🔥🔥🔥 業火',
          message: '1ヶ月の偉業！トップ5%の学習者！'
        },
        60: {
          cosmicEnergy: 2000,
          badge: 'streak_2months',
          shield: 5,
          vrTicket: 5,
          specialAvatar: 'phoenix',
          title: '🔥🔥🔥🔥 煉獄',
          message: '2ヶ月！あなたは英雄です！'
        },
        100: {
          cosmicEnergy: 5000,
          badge: 'streak_master',
          shield: 10,
          vrTicket: 10,
          legendaryTitle: 'Eternal Flame',
          specialReward: 'lifetime_premium_feature',
          title: '🔥🔥🔥🔥🔥 永遠の炎',
          message: '100日達成！レジェンド誕生！'
        },
        365: {
          cosmicEnergy: 10000,
          badge: 'streak_year',
          shield: 20,
          vrTicket: 50,
          mythicTitle: 'Phoenix Reborn',
          specialReward: 'hall_of_fame_entry',
          title: '🌟 不死鳥',
          message: '1年間！あなたは不滅の存在！'
        }
      }

      return rewards[days] || {
        cosmicEnergy: days * 10,
        message: `${days}日連続達成！`
      }
    },

    // 報酬を請求
    claimReward(rewardIndex) {
      if (this.pendingRewards[rewardIndex]) {
        const reward = this.pendingRewards[rewardIndex]

        // 他のストアと連携して報酬を付与
        if (reward.reward.cosmicEnergy) {
          // gameStoreと連携
          const gameStore = useGameStore?.()
          gameStore?.addCosmicEnergy(reward.reward.cosmicEnergy)
        }

        if (reward.reward.shield) {
          this.streakShields += reward.reward.shield
        }

        if (reward.reward.vrTicket) {
          // VRストアと連携
          const vrStore = useVRStore?.()
          vrStore?.addTickets(reward.reward.vrTicket)
        }

        // 請求済みにマーク
        reward.claimed = true

        logger.log(`🎁 Reward claimed for ${reward.milestone} days streak`)

        return reward.reward
      }

      return null
    },

    // ストリークフリーズ/シールド使用
    useStreakShield(manual = false) {
      if (this.streakShields > 0 && !this.freezeUsedToday) {
        this.streakShields--
        this.freezeUsedToday = true

        const today = new Date().toISOString().split('T')[0]
        this.protectedDays.push(today)

        // 今日のアクティビティを「保護済み」としてマーク
        if (!this.activityCalendar[today]) {
          this.activityCalendar[today] = {
            completed: true,
            games: 0,
            gameIds: [],
            shieldUsed: true,
            protectedAt: new Date().toISOString()
          }
        } else {
          this.activityCalendar[today].shieldUsed = true
        }

        this.lastActivityDate = today

        logger.log(`🛡️ Streak shield used. ${this.streakShields} remaining`)

        return true
      }

      logger.warn('Cannot use shield: ', {
        shields: this.streakShields,
        usedToday: this.freezeUsedToday
      })

      return false
    },

    // 保護チェックと自動使用
    checkAndUseProtection(dateToProtect) {
      if (this.settings.autoShieldUse && this.streakShields > 0) {
        return this.useStreakShield(false)
      }
      return false
    },

    // お気に入りゲーム更新
    updateFavoriteGame(gameId) {
      if (!this.statistics.gameFrequency) {
        this.statistics.gameFrequency = {}
      }

      this.statistics.gameFrequency[gameId] = (this.statistics.gameFrequency[gameId] || 0) + 1

      // 最も頻繁にプレイされるゲームを特定
      let maxCount = 0
      let favorite = null

      for (const [game, count] of Object.entries(this.statistics.gameFrequency)) {
        if (count > maxCount) {
          maxCount = count
          favorite = game
        }
      }

      this.statistics.favoriteGame = favorite
    },

    // 毎日のリセット（アプリ起動時に呼び出し）
    dailyReset() {
      const today = new Date().toISOString().split('T')[0]
      const lastReset = this.dailyGoal.lastReset

      if (!lastReset || lastReset !== today) {
        logger.log('📅 Performing daily reset')

        this.dailyGoal.gamesPlayed = 0
        this.dailyGoal.completed = false
        this.dailyGoal.bonusGames = 0
        this.freezeUsedToday = false
        this.dailyGoal.lastReset = today

        // 昨日のストリーク状態をチェック
        if (this.streakStatus === 'broken') {
          // ストリークが途切れた通知
          this.notifyStreakBroken()
        } else if (this.streakStatus === 'at_risk') {
          // リスク通知
          this.notifyStreakAtRisk()
        }
      }
    },

    // 効果音再生
    playStreakSound(type) {
      // AudioManagerと連携
      try {
        const sounds = {
          activity_recorded: 'soft_chime',
          goal_complete: 'success_fanfare',
          milestone: 'epic_achievement',
          streak_broken: 'sad_trombone'
        }

        // AudioManagerが利用可能な場合
        if (window.AudioManager?.play) {
          window.AudioManager.play(sounds[type] || 'default')
        }
      } catch (error) {
        logger.warn('Could not play sound:', error)
      }
    },

    // 通知関連
    notifyStreakAtRisk() {
      logger.warn('⚠️ Streak at risk!')

      // 通知を送信（実装予定）
      return {
        title: '🔥 ストリークが危険！',
        body: `あと${Math.floor(this.timeUntilStreakBreak / 3600000)}時間で${this.currentStreak}日の記録が途切れます！`,
        action: 'play_now'
      }
    },

    notifyStreakBroken() {
      logger.log('💔 Streak broken')

      return {
        title: '💔 ストリークが途切れました',
        body: '今日から新しくスタートしましょう！',
        action: 'start_fresh'
      }
    },

    // デバッグ用：ストリークを設定
    setStreakForTesting(days) {
      if (import.meta.env.DEV) {
        this.currentStreak = days
        this.lastActivityDate = new Date().toISOString().split('T')[0]
        logger.log(`🧪 Streak set to ${days} for testing`)
      }
    },

    // ストア初期化
    initializeStore() {
      logger.log('🔥 Initializing Streak Store')

      // 毎日のリセットチェック
      this.dailyReset()

      // 定期的な保存（5分ごと）
      setInterval(() => {
        this.saveToLocalStorage()
      }, 5 * 60 * 1000)

      return true
    },

    // ローカルストレージへの保存
    saveToLocalStorage() {
      try {
        const dataToSave = {
          currentStreak: this.currentStreak,
          longestStreak: this.longestStreak,
          lastActivityDate: this.lastActivityDate,
          activityCalendar: this.activityCalendar,
          statistics: this.statistics,
          settings: this.settings
        }

        localStorage.setItem('movwise-streak-backup', JSON.stringify(dataToSave))
      } catch (error) {
        logger.error('Failed to save streak data:', error)
      }
    }
  },

  // Pinia Persistedstate プラグイン設定
  persist: {
    key: 'movwise-streak',
    storage: localStorage,
    paths: [
      'currentStreak',
      'longestStreak',
      'lastActivityDate',
      'totalDaysPlayed',
      'streakShields',
      'claimedMilestones',
      'pendingRewards',
      'activityCalendar',
      'statistics',
      'settings',
      'protectedDays'
    ]
  }
})

// グローバルヘルパー関数
export function useStreakHelper() {
  const streakStore = useStreakStore()

  return {
    // 簡単なゲーム記録
    recordGame: (gameId, data) => streakStore.recordActivity(gameId, data),

    // ストリーク状態の取得
    getStreakInfo: () => ({
      current: streakStore.currentStreak,
      longest: streakStore.longestStreak,
      status: streakStore.streakStatus,
      level: streakStore.streakLevel,
      progress: streakStore.todayProgress
    }),

    // 報酬情報の取得
    getRewards: () => ({
      pending: streakStore.pendingRewards.filter(r => !r.claimed),
      claimed: streakStore.pendingRewards.filter(r => r.claimed),
      nextMilestone: streakStore.nextMilestone
    })
  }
}