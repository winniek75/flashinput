import { defineStore } from 'pinia'
import { getDailyMissionGames, getGameById } from '@/data/games'
import { useUserStore } from './userStore'
import logger from '@/utils/logger'

export const useMissionStore = defineStore('mission', {
  state: () => ({
    // デイリーミッション
    dailyMissions: [],

    // ミッション生成日
    missionDate: null,

    // 完了したミッション
    completedMissions: [],

    // 報酬
    rewards: {
      vrTickets: 0,
      xp: 0,
      soundGems: 0
    },

    // 統計
    stats: {
      totalMissionsCompleted: 0,
      consecutiveDays: 0,
      lastCompletionDate: null
    }
  }),

  getters: {
    // 今日のミッション数
    activeMissionsCount: (state) => {
      return state.dailyMissions.filter(m => !m.completed).length
    },

    // 全ミッション完了フラグ
    allMissionsCompleted: (state) => {
      return state.dailyMissions.length > 0 &&
             state.dailyMissions.every(m => m.completed)
    },

    // 進捗率
    missionProgress: (state) => {
      if (state.dailyMissions.length === 0) return 0
      const completed = state.dailyMissions.filter(m => m.completed).length
      return Math.round((completed / state.dailyMissions.length) * 100)
    },

    // 今日のVRチケット獲得可能数
    availableVRTickets: (state) => {
      return state.dailyMissions.filter(m => !m.completed && m.reward.vrTicket).length
    }
  },

  actions: {
    // デイリーミッションを初期化
    async initializeDailyMissions() {
      try {
        const today = new Date().toDateString()

        // 既に今日のミッションが生成されている場合はスキップ
        if (this.missionDate === today && this.dailyMissions.length > 0) {
          logger.log('📅 Daily missions already initialized for today')
          return
        }

        // ユーザー情報を取得
        const userStore = useUserStore()
        const playerLevel = userStore.stats?.level || 1

        // 今日の日付をシードにして一貫性のあるミッションを生成
        const seed = today
        const selectedGames = getDailyMissionGames(playerLevel, seed)

        // ミッションを生成
        this.dailyMissions = selectedGames.map((game, index) => ({
          id: `mission_${game.id}_${today}`,
          gameId: game.id,
          gameName: game.jaName || game.name,
          gameIcon: game.icon,
          description: this.generateMissionDescription(game, index),
          targetScore: this.calculateTargetScore(game.difficulty),
          currentScore: 0,
          completed: false,
          reward: this.generateReward(index),
          startedAt: null,
          completedAt: null
        }))

        this.missionDate = today
        this.saveToLocalStorage()

        logger.log('🎯 Daily missions initialized:', this.dailyMissions)

      } catch (error) {
        logger.error('Failed to initialize daily missions:', error)
      }
    },

    // ミッション説明文を生成
    generateMissionDescription(game, index) {
      const descriptions = [
        `${game.jaName}で${this.calculateTargetScore(game.difficulty)}点以上を獲得`,
        `${game.jaName}をクリアして音素マスターを証明`,
        `${game.jaName}で新しい学習記録を達成`
      ]
      return descriptions[index % descriptions.length]
    },

    // 難易度に基づく目標スコアを計算
    calculateTargetScore(difficulty) {
      const scores = {
        beginner: 70,
        intermediate: 75,
        advanced: 80,
        expert: 85
      }
      return scores[difficulty] || 70
    },

    // 報酬を生成
    generateReward(index) {
      // 3つ目のミッションクリアでVRチケット
      const isVRReward = index === 2

      return {
        vrTicket: isVRReward ? 1 : 0,
        xp: 50 + (index * 25),
        soundGems: 100 + (index * 50),
        description: isVRReward
          ? '🎫 VRチケット×1 + 100XP + 200サウンドジェム'
          : `⚡ ${50 + (index * 25)}XP + 💎 ${100 + (index * 50)}サウンドジェム`
      }
    },

    // ゲームプレイ開始時に呼ぶ
    startMission(gameId) {
      const mission = this.dailyMissions.find(m => m.gameId === gameId)
      if (mission && !mission.completed) {
        mission.startedAt = new Date().toISOString()
        this.saveToLocalStorage()
        logger.log(`🎮 Mission started: ${mission.gameName}`)
      }
    },

    // ゲーム終了時にスコアを更新
    updateMissionProgress(gameId, score) {
      const mission = this.dailyMissions.find(m => m.gameId === gameId)

      if (!mission || mission.completed) return false

      // スコアを更新
      mission.currentScore = Math.max(mission.currentScore, score)

      // 目標達成チェック
      if (mission.currentScore >= mission.targetScore) {
        this.completeMission(mission)
        return true
      }

      this.saveToLocalStorage()
      return false
    },

    // ミッション完了処理
    completeMission(mission) {
      if (mission.completed) return

      mission.completed = true
      mission.completedAt = new Date().toISOString()

      // 報酬を付与
      this.rewards.vrTickets += mission.reward.vrTicket
      this.rewards.xp += mission.reward.xp
      this.rewards.soundGems += mission.reward.soundGems

      // ユーザーストアに反映
      const userStore = useUserStore()
      if (mission.reward.vrTicket > 0) {
        userStore.vrTickets.balance += mission.reward.vrTicket
      }
      userStore.addXP(mission.reward.xp)

      // 統計を更新
      this.stats.totalMissionsCompleted++
      this.stats.lastCompletionDate = new Date().toDateString()

      // 連続日数を更新
      this.updateConsecutiveDays()

      // 完了リストに追加
      this.completedMissions.push({
        ...mission,
        completedDate: new Date().toDateString()
      })

      this.saveToLocalStorage()

      logger.log(`🎉 Mission completed: ${mission.gameName}`)
      logger.log(`🎁 Rewards: ${mission.reward.description}`)

      // 全ミッション完了チェック
      if (this.allMissionsCompleted) {
        this.handleAllMissionsCompleted()
      }
    },

    // 全ミッション完了時の処理
    handleAllMissionsCompleted() {
      logger.log('🏆 All daily missions completed!')

      // ボーナス報酬
      const bonusXP = 200
      const bonusSoundGems = 500

      this.rewards.xp += bonusXP
      this.rewards.soundGems += bonusSoundGems

      const userStore = useUserStore()
      userStore.addXP(bonusXP)

      logger.log(`🎁 Bonus rewards: ${bonusXP}XP + ${bonusSoundGems}サウンドジェム`)
    },

    // 連続日数を更新
    updateConsecutiveDays() {
      const today = new Date().toDateString()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toDateString()

      if (this.stats.lastCompletionDate === yesterdayStr ||
          this.stats.lastCompletionDate === today) {
        if (this.stats.lastCompletionDate !== today) {
          this.stats.consecutiveDays++
        }
      } else {
        this.stats.consecutiveDays = 1
      }
    },

    // ローカルストレージに保存
    saveToLocalStorage() {
      try {
        localStorage.setItem('movwise_daily_missions', JSON.stringify({
          dailyMissions: this.dailyMissions,
          missionDate: this.missionDate,
          completedMissions: this.completedMissions,
          rewards: this.rewards,
          stats: this.stats
        }))
      } catch (error) {
        logger.error('Failed to save missions to localStorage:', error)
      }
    },

    // ローカルストレージから読み込み
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('movwise_daily_missions')
        if (saved) {
          const data = JSON.parse(saved)
          this.dailyMissions = data.dailyMissions || []
          this.missionDate = data.missionDate || null
          this.completedMissions = data.completedMissions || []
          this.rewards = data.rewards || { vrTickets: 0, xp: 0, soundGems: 0 }
          this.stats = data.stats || {
            totalMissionsCompleted: 0,
            consecutiveDays: 0,
            lastCompletionDate: null
          }
        }
      } catch (error) {
        logger.error('Failed to load missions from localStorage:', error)
      }
    },

    // ミッションをリセット（デバッグ用）
    resetMissions() {
      this.dailyMissions = []
      this.missionDate = null
      this.completedMissions = []
      this.rewards = { vrTickets: 0, xp: 0, soundGems: 0 }
      localStorage.removeItem('movwise_daily_missions')
      logger.log('🔄 Missions reset')
    }
  }
})