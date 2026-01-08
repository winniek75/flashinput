// src/stores/questStore.js - デイリークエストシステム
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStreakStore } from './streakStore'
import logger from '@/utils/logger'

export const useQuestStore = defineStore('quest', {
  state: () => ({
    // 今日のクエスト
    dailyQuests: [],

    // 週間クエスト
    weeklyQuests: [],

    // 特別イベントクエスト
    eventQuests: [],

    // 完了済みクエスト記録
    completedQuests: {},

    // クエスト進捗
    questProgress: {},

    // 最終更新日
    lastUpdate: null,

    // パフォーマンス最適化用の内部変数
    _saveTimer: null,
    _lastSavedData: null,

    // 設定
    settings: {
      autoGenerate: true,
      difficulty: 'normal', // easy, normal, hard
      categories: ['phonics', 'grammar', 'vocabulary', 'rhythm'],
      dailyQuestCount: 3,
      weeklyQuestCount: 2
    },

    // 報酬システム
    rewards: {
      experience: 0,
      gems: 0,
      badges: [],
      streakShields: 0
    },

    // クエストテンプレート
    questTemplates: {
      daily: [
        {
          id: 'play_games',
          type: 'play',
          category: 'general',
          title: 'ゲームを{count}回プレイしよう',
          description: '任意のゲームを{count}回プレイしてください',
          target: 3,
          reward: { exp: 50, gems: 10 },
          icon: '🎮'
        },
        {
          id: 'perfect_hits',
          type: 'performance',
          category: 'rhythm',
          title: 'パーフェクト判定を{count}回獲得',
          description: 'リズムゲームでパーフェクト判定を{count}回取ろう',
          target: 10,
          reward: { exp: 75, gems: 15 },
          icon: '⭐'
        },
        {
          id: 'phoneme_practice',
          type: 'learning',
          category: 'phonics',
          title: '音素練習を{count}分間',
          description: '音素関連ゲームを{count}分間プレイしよう',
          target: 5,
          reward: { exp: 60, gems: 12 },
          icon: '🔤'
        },
        {
          id: 'grammar_mastery',
          type: 'learning',
          category: 'grammar',
          title: '文法問題を{count}問正解',
          description: '文法ゲームで{count}問連続正解しよう',
          target: 15,
          reward: { exp: 80, gems: 18 },
          icon: '📝'
        },
        {
          id: 'vocabulary_builder',
          type: 'learning',
          category: 'vocabulary',
          title: '新単語を{count}個覚えよう',
          description: 'ボキャブラリーゲームで新単語を{count}個覚えよう',
          target: 8,
          reward: { exp: 70, gems: 14 },
          icon: '📚'
        },
        {
          id: 'streak_maintain',
          type: 'streak',
          category: 'general',
          title: 'ストリークを維持しよう',
          description: '今日もログインして学習を継続しよう',
          target: 1,
          reward: { exp: 40, gems: 8, streakShield: 1 },
          icon: '🔥'
        }
      ],
      weekly: [
        {
          id: 'weekly_champion',
          type: 'cumulative',
          category: 'general',
          title: '今週のチャンピオン',
          description: '週間で{count}ゲーム以上プレイしよう',
          target: 20,
          reward: { exp: 300, gems: 100, badge: 'weekly_champion' },
          icon: '👑'
        },
        {
          id: 'rhythm_master',
          type: 'performance',
          category: 'rhythm',
          title: 'リズムマスター',
          description: 'リズムゲームで週間平均90%以上の精度を維持',
          target: 90,
          reward: { exp: 250, gems: 80, badge: 'rhythm_master' },
          icon: '🎵'
        },
        {
          id: 'perfect_week',
          type: 'streak',
          category: 'general',
          title: 'パーフェクトウィーク',
          description: '7日間連続でデイリークエストを全て完了',
          target: 7,
          reward: { exp: 500, gems: 150, badge: 'perfect_week', streakShield: 3 },
          icon: '💎'
        }
      ]
    }
  }),

  getters: {
    // 今日のクエスト進捗
    todayProgress: (state) => {
      const today = new Date().toDateString()
      const completed = state.dailyQuests.filter(q => q.completed).length
      const total = state.dailyQuests.length
      return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 }
    },

    // 利用可能な報酬
    availableRewards: (state) => {
      const completed = [...state.dailyQuests, ...state.weeklyQuests, ...state.eventQuests]
        .filter(q => q.completed && !q.rewardClaimed)

      return completed.reduce((rewards, quest) => {
        rewards.exp += quest.reward.exp || 0
        rewards.gems += quest.reward.gems || 0
        rewards.streakShields += quest.reward.streakShield || 0
        if (quest.reward.badge) rewards.badges.push(quest.reward.badge)
        return rewards
      }, { exp: 0, gems: 0, streakShields: 0, badges: [] })
    },

    // 今日完了可能なクエスト
    availableQuests: (state) => {
      return state.dailyQuests.filter(q => !q.completed && q.active)
    },

    // 進行中のクエスト統計
    questStats: (state) => {
      const today = new Date().toDateString()
      const thisWeek = getWeekNumber(new Date())

      return {
        dailyCompleted: state.dailyQuests.filter(q => q.completed).length,
        dailyTotal: state.dailyQuests.length,
        weeklyCompleted: state.weeklyQuests.filter(q => q.completed).length,
        weeklyTotal: state.weeklyQuests.length,
        totalExp: state.rewards.experience,
        totalGems: state.rewards.gems
      }
    }
  },

  actions: {
    // ストア初期化
    initializeStore() {
      logger.log('🎯 Initializing quest store')

      const today = new Date().toDateString()

      // 新しい日の場合、デイリークエストを生成
      if (this.lastUpdate !== today) {
        this.generateDailyQuests()
        this.lastUpdate = today
      }

      // 新しい週の場合、ウィークリークエストを生成
      const currentWeek = getWeekNumber(new Date())
      const lastWeek = this.weeklyQuests.length > 0 ? this.weeklyQuests[0]?.week : null

      if (currentWeek !== lastWeek) {
        this.generateWeeklyQuests()
      }

      // 進捗状況を復元
      this.restoreProgress()
    },

    // デイリークエスト生成
    generateDailyQuests() {
      logger.log('📅 Generating daily quests')

      const templates = this.questTemplates.daily
      const selectedTemplates = this.selectQuestTemplates(templates, this.settings.dailyQuestCount)

      this.dailyQuests = selectedTemplates.map((template, index) => ({
        ...template,
        id: `daily_${new Date().toDateString()}_${index}`,
        progress: 0,
        completed: false,
        active: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
        rewardClaimed: false
      }))

      logger.log(`Generated ${this.dailyQuests.length} daily quests`)
    },

    // ウィークリークエスト生成
    generateWeeklyQuests() {
      logger.log('📅 Generating weekly quests')

      const templates = this.questTemplates.weekly
      const selectedTemplates = this.selectQuestTemplates(templates, this.settings.weeklyQuestCount)

      const currentWeek = getWeekNumber(new Date())

      this.weeklyQuests = selectedTemplates.map((template, index) => ({
        ...template,
        id: `weekly_${currentWeek}_${index}`,
        week: currentWeek,
        progress: 0,
        completed: false,
        active: true,
        createdAt: new Date().toISOString(),
        expiresAt: getWeekEndDate().toISOString(),
        rewardClaimed: false
      }))

      logger.log(`Generated ${this.weeklyQuests.length} weekly quests`)
    },

    // クエストテンプレート選択
    selectQuestTemplates(templates, count) {
      const difficulty = this.settings.difficulty
      const categories = this.settings.categories

      // カテゴリでフィルタリング
      let availableTemplates = templates.filter(t =>
        categories.includes(t.category) || t.category === 'general'
      )

      // 難易度調整
      availableTemplates = availableTemplates.map(template => {
        const adjusted = { ...template }

        switch (difficulty) {
          case 'easy':
            adjusted.target = Math.max(1, Math.floor(template.target * 0.7))
            break
          case 'hard':
            adjusted.target = Math.ceil(template.target * 1.5)
            adjusted.reward.exp = Math.floor(template.reward.exp * 1.3)
            adjusted.reward.gems = Math.floor(template.reward.gems * 1.3)
            break
        }

        return adjusted
      })

      // ランダム選択
      const shuffled = availableTemplates.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    },

    // クエスト進捗更新
    updateQuestProgress(questType, data) {
      try {
        const quests = questType === 'daily' ? this.dailyQuests :
                      questType === 'weekly' ? this.weeklyQuests : this.eventQuests

        quests.forEach(quest => {
          if (quest.completed) return

          const oldProgress = quest.progress
          quest.progress = this.calculateQuestProgress(quest, data)

          // 完了判定
          if (quest.progress >= quest.target && !quest.completed) {
            quest.completed = true
            quest.completedAt = new Date().toISOString()

            this.onQuestCompleted(quest)

            logger.log(`🎉 Quest completed: ${quest.title}`)
          } else if (quest.progress > oldProgress) {
            logger.log(`📈 Quest progress: ${quest.title} (${quest.progress}/${quest.target})`)
          }
        })

        // 永続化
        this.saveProgress()

      } catch (error) {
        logger.error('Failed to update quest progress:', error)
      }
    },

    // クエスト進捗計算
    calculateQuestProgress(quest, data) {
      switch (quest.type) {
        case 'play':
          return quest.progress + (data.gameCompleted ? 1 : 0)

        case 'performance':
          if (quest.id.includes('perfect_hits')) {
            return quest.progress + (data.perfectHits || 0)
          }
          if (quest.id.includes('accuracy')) {
            return Math.max(quest.progress, data.accuracy || 0)
          }
          break

        case 'learning':
          if (quest.id.includes('phoneme_practice')) {
            return quest.progress + (data.studyTime || 0)
          }
          if (quest.id.includes('grammar_mastery')) {
            return quest.progress + (data.correctAnswers || 0)
          }
          if (quest.id.includes('vocabulary_builder')) {
            return quest.progress + (data.newWords || 0)
          }
          break

        case 'streak':
          if (quest.id.includes('maintain')) {
            return data.streakMaintained ? 1 : quest.progress
          }
          break

        case 'cumulative':
          return quest.progress + (data.gameCompleted ? 1 : 0)

        default:
          return quest.progress
      }

      return quest.progress
    },

    // クエスト完了処理
    onQuestCompleted(quest) {
      // ストリーク統合
      const streakStore = useStreakStore()

      // 特別報酬の処理
      if (quest.reward.streakShield) {
        streakStore.addStreakShields(quest.reward.streakShield)
      }

      if (quest.reward.badge) {
        this.rewards.badges.push({
          id: quest.reward.badge,
          name: quest.title,
          achievedAt: new Date().toISOString()
        })
      }

      // 実績システムとの連携（将来的に）
      this.triggerAchievement(quest)
    },

    // 報酬受け取り
    claimRewards(questId) {
      const allQuests = [...this.dailyQuests, ...this.weeklyQuests, ...this.eventQuests]
      const quest = allQuests.find(q => q.id === questId)

      if (!quest || !quest.completed || quest.rewardClaimed) {
        return false
      }

      // 報酬を付与
      this.rewards.experience += quest.reward.exp || 0
      this.rewards.gems += quest.reward.gems || 0
      this.rewards.streakShields += quest.reward.streakShield || 0

      quest.rewardClaimed = true
      quest.claimedAt = new Date().toISOString()

      logger.log(`🎁 Rewards claimed for quest: ${quest.title}`)

      this.saveProgress()
      return true
    },

    // 全報酬一括受け取り
    claimAllRewards() {
      const unclaimedQuests = [...this.dailyQuests, ...this.weeklyQuests, ...this.eventQuests]
        .filter(q => q.completed && !q.rewardClaimed)

      let totalRewards = { exp: 0, gems: 0, streakShields: 0, badges: [] }

      unclaimedQuests.forEach(quest => {
        if (this.claimRewards(quest.id)) {
          totalRewards.exp += quest.reward.exp || 0
          totalRewards.gems += quest.reward.gems || 0
          totalRewards.streakShields += quest.reward.streakShield || 0
          if (quest.reward.badge) totalRewards.badges.push(quest.reward.badge)
        }
      })

      return totalRewards
    },

    // 進捗保存（デバウンス付き）
    saveProgress() {
      // 既存のタイマーをクリア
      if (this._saveTimer) {
        clearTimeout(this._saveTimer)
      }

      // 500ms後に保存実行（連続呼び出しを防止）
      this._saveTimer = setTimeout(() => {
        try {
          const progressData = {
            dailyQuests: this.dailyQuests,
            weeklyQuests: this.weeklyQuests,
            eventQuests: this.eventQuests,
            completedQuests: this.completedQuests,
            rewards: this.rewards,
            lastUpdate: this.lastUpdate,
            settings: this.settings
          }

          const dataString = JSON.stringify(progressData)

          // データが変更された場合のみ保存
          if (this._lastSavedData !== dataString) {
            localStorage.setItem('quest_progress', dataString)
            this._lastSavedData = dataString
            logger.log('📱 Quest progress saved')
          }
        } catch (error) {
          logger.error('Failed to save quest progress:', error)
        }
      }, 500)
    },

    // 進捗復元
    restoreProgress() {
      try {
        const saved = localStorage.getItem('quest_progress')
        if (saved) {
          const data = JSON.parse(saved)

          this.dailyQuests = data.dailyQuests || []
          this.weeklyQuests = data.weeklyQuests || []
          this.eventQuests = data.eventQuests || []
          this.completedQuests = data.completedQuests || {}
          this.rewards = { ...this.rewards, ...data.rewards }
          this.settings = { ...this.settings, ...data.settings }

          logger.log('📊 Quest progress restored')
        }
      } catch (error) {
        logger.error('Failed to restore quest progress:', error)
      }
    },

    // 実績トリガー（将来的な拡張）
    triggerAchievement(quest) {
      // 将来的に実績システムと連携
      logger.log(`🏆 Achievement triggered: ${quest.title}`)
    },

    // 設定更新
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }
      this.saveProgress()
    },

    // リセット機能（デバッグ用）
    resetQuests() {
      this.dailyQuests = []
      this.weeklyQuests = []
      this.eventQuests = []
      this.completedQuests = {}
      this.questProgress = {}
      this.lastUpdate = null
      localStorage.removeItem('quest_progress')

      logger.log('🔄 Quest system reset')
    }
  }
}, {
  persist: {
    key: 'quest-store',
    storage: localStorage,
    paths: ['completedQuests', 'rewards', 'settings', 'lastUpdate']
  }
})

// ヘルパー関数
function getWeekNumber(date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - startOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
}

function getWeekEndDate() {
  const now = new Date()
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)
  return endOfWeek
}

// クエスト統合用コンポーザブル
export function useQuestIntegration() {
  const questStore = useQuestStore()

  const recordQuestProgress = (gameData) => {
    questStore.updateQuestProgress('daily', gameData)
    questStore.updateQuestProgress('weekly', gameData)
  }

  const getActiveQuests = () => {
    return questStore.availableQuests
  }

  const getQuestProgress = () => {
    return questStore.todayProgress
  }

  return {
    recordQuestProgress,
    getActiveQuests,
    getQuestProgress,
    questStore
  }
}