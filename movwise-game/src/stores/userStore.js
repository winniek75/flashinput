import { defineStore } from 'pinia'
import logger from '@/utils/logger'

export const USER_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    // ユーザータイプ
    userType: null, // 'student' | 'teacher' | 'parent'

    // 初回設定フラグ
    hasSelectedUserType: false,

    // 生徒用データ
    dailyMissions: [
      {
        id: 1,
        title: '初回学習ミッション',
        description: '最初のゲームをプレイしよう',
        progress: 0,
        target: 1,
        type: 'phonics',
        reward: 'サウンドジェム +50',
        icon: '🎵'
      },
      {
        id: 2,
        title: '継続学習ミッション',
        description: '3つの異なるゲームを試そう',
        progress: 0,
        target: 3,
        type: 'general',
        reward: '経験値 +100',
        icon: '🌟'
      }
    ],

    // 今日の目標と進捗
    dailyGoal: {
      target: 100, // 今日の目標ポイント
      current: 0, // 現在のポイント
      percentage: 0
    },

    // VRチケット残高
    vrTickets: {
      balance: 1, // 最初は1枚のみ
      maxBalance: 10,
      nextRefresh: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
    },

    // 学習統計
    stats: {
      totalStudyTime: 0, // 分
      streak: 0, // 連続学習日数
      totalXP: 0,
      level: 1
    }
  }),

  getters: {
    // 未完了のミッション数
    incompleteMissions: (state) => {
      return state.dailyMissions.filter(mission => mission.progress < mission.target).length
    },

    // 今日の進捗率
    dailyProgressPercentage: (state) => {
      return Math.min(Math.round((state.dailyGoal.current / state.dailyGoal.target) * 100), 100)
    },

    // 次のレベルまでのXP
    xpToNextLevel: (state) => {
      const currentLevelXP = state.stats.level * 200
      const nextLevelXP = (state.stats.level + 1) * 200
      return nextLevelXP - state.stats.totalXP
    },

    // VRチケット使用可能かどうか
    canUseVRTicket: (state) => {
      return state.vrTickets.balance > 0
    }
  },

  actions: {
    // ユーザータイプを設定
    async setUserType(userType) {
      try {
        if (!Object.values(USER_TYPES).includes(userType)) {
          throw new Error(`Invalid user type: ${userType}`)
        }

        this.userType = userType
        this.hasSelectedUserType = true

        // ローカルストレージに保存
        localStorage.setItem('movwise_user_type', userType)
        localStorage.setItem('movwise_has_selected_user_type', 'true')

        logger.log(`✅ User type set to: ${userType}`)

        // ユーザータイプに応じた初期化
        if (userType === USER_TYPES.STUDENT) {
          await this.initializeStudentData()
        }

      } catch (error) {
        logger.error('Failed to set user type:', error)
        throw error
      }
    },

    // 保存されたユーザータイプを読み込み
    loadUserType() {
      try {
        const savedUserType = localStorage.getItem('movwise_user_type')
        const hasSelected = localStorage.getItem('movwise_has_selected_user_type') === 'true'

        if (savedUserType && hasSelected) {
          this.userType = savedUserType
          this.hasSelectedUserType = true
          logger.log(`📱 Loaded user type: ${savedUserType}`)
        }
      } catch (error) {
        logger.error('Failed to load user type:', error)
      }
    },

    // 生徒用データの初期化
    async initializeStudentData() {
      try {
        // 今日の日付をチェックして、デイリーミッションを更新
        const today = new Date().toDateString()
        const lastUpdate = localStorage.getItem('movwise_last_mission_update')

        if (lastUpdate !== today) {
          // 新しい日なのでミッションをリセット
          await this.resetDailyMissions()
          localStorage.setItem('movwise_last_mission_update', today)
        }

        // 保存されたデータを読み込み
        await this.loadStudentProgress()

      } catch (error) {
        logger.error('Failed to initialize student data:', error)
      }
    },

    // デイリーミッションをリセット
    async resetDailyMissions() {
      // ミッションの進捗をリセットしつつ、ランダムに新しいミッションを生成
      this.dailyMissions = [
        {
          id: 1,
          title: '音韻ミッション',
          description: '3つの音素を習得しよう',
          progress: 0,
          target: 3,
          type: 'phonics',
          reward: 'サウンドジェム +150',
          icon: '🎵'
        },
        {
          id: 2,
          title: '文法チャレンジ',
          description: 'Be動詞を5回練習しよう',
          progress: 0,
          target: 5,
          type: 'grammar',
          reward: 'グラマーポイント +100',
          icon: '🌌'
        },
        {
          id: 3,
          title: 'VR体験ミッション',
          description: 'VRシナリオを1つクリアしよう',
          progress: 0,
          target: 1,
          type: 'vr',
          reward: 'VRチケット +1',
          icon: '🥽'
        }
      ]

      // 今日の目標もリセット
      this.dailyGoal.current = 0
      this.dailyGoal.percentage = 0
    },

    // 生徒の進捗を読み込み
    async loadStudentProgress() {
      try {
        const savedStats = localStorage.getItem('movwise_student_stats')
        if (savedStats) {
          this.stats = { ...this.stats, ...JSON.parse(savedStats) }
        }

        const savedVRTickets = localStorage.getItem('movwise_vr_tickets')
        if (savedVRTickets) {
          this.vrTickets = { ...this.vrTickets, ...JSON.parse(savedVRTickets) }
        }

      } catch (error) {
        logger.error('Failed to load student progress:', error)
      }
    },

    // ミッション進捗を更新
    updateMissionProgress(missionId, progress) {
      const mission = this.dailyMissions.find(m => m.id === missionId)
      if (mission) {
        mission.progress = Math.min(progress, mission.target)

        // 目標達成時の処理
        if (mission.progress >= mission.target) {
          this.addXP(50) // ミッション完了ボーナス
          logger.log(`🎉 Mission completed: ${mission.title}`)
        }

        this.saveProgress()
      }
    },

    // XPを追加
    addXP(amount) {
      this.stats.totalXP += amount
      this.dailyGoal.current += amount
      this.dailyGoal.percentage = this.dailyProgressPercentage

      // レベルアップチェック
      const newLevel = Math.floor(this.stats.totalXP / 200) + 1
      if (newLevel > this.stats.level) {
        this.stats.level = newLevel
        logger.log(`🎉 Level up! New level: ${newLevel}`)
      }

      this.saveProgress()
    },

    // VRチケットを使用
    useVRTicket() {
      if (this.canUseVRTicket) {
        this.vrTickets.balance--
        this.saveProgress()
        logger.log(`🎫 VR ticket used. Remaining: ${this.vrTickets.balance}`)
        return true
      }
      return false
    },

    // 進捗を保存
    saveProgress() {
      try {
        localStorage.setItem('movwise_student_stats', JSON.stringify(this.stats))
        localStorage.setItem('movwise_vr_tickets', JSON.stringify(this.vrTickets))
        localStorage.setItem('movwise_daily_goal', JSON.stringify(this.dailyGoal))
      } catch (error) {
        logger.error('Failed to save progress:', error)
      }
    },

    // ユーザータイプをリセット
    resetUserType() {
      this.userType = null
      this.hasSelectedUserType = false
      localStorage.removeItem('movwise_user_type')
      localStorage.removeItem('movwise_has_selected_user_type')
      logger.log('🔄 User type reset')
    },

    // 全データをリセット
    resetAllData() {
      // 全てのミッションを初期状態にリセット
      this.dailyMissions.forEach(mission => {
        mission.progress = 0
      })

      // 今日の目標をリセット
      this.dailyGoal = {
        target: 100,
        current: 0,
        percentage: 0
      }

      // VRチケットをリセット
      this.vrTickets.balance = 1

      // 統計をリセット
      this.stats = {
        totalStudyTime: 0,
        streak: 0,
        totalXP: 0,
        level: 1
      }

      // localStorage から全てのユーザーデータを削除
      localStorage.removeItem('movwise_student_stats')
      localStorage.removeItem('movwise_vr_tickets')
      localStorage.removeItem('movwise_daily_goal')

      logger.log('🔄 All user data reset to initial state')
    }
  }
})