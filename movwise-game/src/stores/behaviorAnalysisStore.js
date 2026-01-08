// src/stores/behaviorAnalysisStore.js - ユーザー行動パターン分析ストア
import { defineStore } from 'pinia'
import aiPredictionEngine from '@/services/aiPredictionEngine'
import logger from '@/utils/logger'

export const useBehaviorAnalysisStore = defineStore('behaviorAnalysis', {
  state: () => ({
    // ユーザー行動データ
    userProfile: {
      totalSessions: 0,
      totalPlayTime: 0,
      averageSessionLength: 0,
      preferredGameTypes: {},
      learningGoals: [],
      motivationFactors: [],
      skillLevel: 'beginner'
    },

    // 行動パターン
    behaviorPatterns: {
      timePreferences: {
        preferredHours: [],
        weekdayVsWeekend: 'balanced', // 'weekday', 'weekend', 'balanced'
        sessionDurationTrends: [],
        peakProductivityHours: []
      },
      gamePreferences: {
        favoriteGenres: [],
        difficultyPreference: 'adaptive',
        completionRate: 0,
        retryPatterns: {},
        challengeResponse: 'moderate' // 'avoids', 'moderate', 'seeks'
      },
      learningStyle: {
        pace: 'medium', // 'slow', 'medium', 'fast'
        feedbackPreference: 'immediate', // 'immediate', 'summary', 'minimal'
        errorTolerance: 'medium', // 'low', 'medium', 'high'
        motivationType: 'achievement' // 'achievement', 'progress', 'social', 'exploration'
      },
      socialBehavior: {
        competitiveness: 0.5, // 0-1 scale
        collaborationPreference: 0.5,
        sharingTendency: 0.5,
        feedbackSeeking: 0.5
      }
    },

    // リアルタイム状態
    currentSession: {
      startTime: null,
      currentGame: null,
      interactions: [],
      performanceMetrics: {},
      mood: 'neutral', // 'frustrated', 'neutral', 'engaged', 'excited'
      focusLevel: 0.5 // 0-1 scale
    },

    // 予測結果
    predictions: {
      churnRisk: null,
      nextOptimalSession: null,
      recommendedGames: [],
      difficultyAdjustments: {},
      lastUpdated: null
    },

    // 学習統計
    learningAnalytics: {
      streakPatterns: [],
      questCompletionTrends: [],
      skillProgressionCurve: [],
      engagementHistory: [],
      difficultyAdaptationHistory: []
    }
  }),

  getters: {
    // 現在のユーザーレベル
    currentUserLevel: (state) => {
      const sessions = state.userProfile.totalSessions

      if (sessions < 5) return 'newcomer'
      if (sessions < 20) return 'beginner'
      if (sessions < 50) return 'intermediate'
      if (sessions < 150) return 'advanced'
      return 'expert'
    },

    // 主要な行動特性
    keyBehaviorTraits: (state) => {
      const traits = []

      const patterns = state.behaviorPatterns

      // 時間選好
      if (patterns.timePreferences.preferredHours.some(h => h < 12)) {
        traits.push('morning_learner')
      }
      if (patterns.timePreferences.preferredHours.some(h => h >= 18)) {
        traits.push('evening_learner')
      }

      // 学習スタイル
      if (patterns.learningStyle.pace === 'fast') {
        traits.push('quick_learner')
      }
      if (patterns.gamePreferences.challengeResponse === 'seeks') {
        traits.push('challenge_seeker')
      }
      if (patterns.gamePreferences.completionRate > 0.8) {
        traits.push('completionist')
      }

      // ソーシャル傾向
      if (patterns.socialBehavior.competitiveness > 0.7) {
        traits.push('competitive')
      }
      if (patterns.socialBehavior.collaborationPreference > 0.7) {
        traits.push('collaborative')
      }

      return traits
    },

    // 個人化推奨
    personalizedRecommendations: (state) => {
      const recommendations = {
        games: [],
        timing: null,
        difficulty: null,
        sessionLength: null,
        motivationalMessage: ''
      }

      const patterns = state.behaviorPatterns
      const level = state.userProfile.skillLevel

      // ゲーム推奨
      const favoriteGenres = patterns.gamePreferences.favoriteGenres
      if (favoriteGenres.length > 0) {
        recommendations.games = favoriteGenres.slice(0, 3)
      } else {
        // デフォルト推奨
        recommendations.games = ['rhythm', 'quest', 'phonics']
      }

      // タイミング推奨
      const peakHours = patterns.timePreferences.peakProductivityHours
      if (peakHours.length > 0) {
        recommendations.timing = peakHours[0]
      }

      // セッション長推奨
      const avgLength = state.userProfile.averageSessionLength
      if (avgLength > 0) {
        recommendations.sessionLength = Math.max(3, Math.min(20, avgLength * 1.1))
      } else {
        recommendations.sessionLength = 5 // デフォルト
      }

      return recommendations
    },

    // エンゲージメント予測
    engagementForecast: (state) => {
      if (!state.predictions.churnRisk) return null

      const churnRisk = state.predictions.churnRisk.probability
      const engagementLevel = 1 - churnRisk

      return {
        currentLevel: engagementLevel,
        trend: engagementLevel > 0.7 ? 'improving' :
               engagementLevel > 0.4 ? 'stable' : 'declining',
        projectedNext7Days: Math.max(0.1, engagementLevel * 0.95), // 軽微な減衰予測
        interventionNeeded: churnRisk > 0.6
      }
    }
  },

  actions: {
    // 初期化
    async initialize() {
      logger.log('🔍 Initializing behavior analysis store')

      // 既存データの復元
      this.loadBehaviorData()

      // AI エンジンの初期化
      await aiPredictionEngine.initialize()

      // 初回予測実行
      await this.updatePredictions()

      logger.log('✅ Behavior analysis store initialized')
    },

    // セッション開始
    startSession(gameId) {
      this.currentSession = {
        startTime: Date.now(),
        currentGame: gameId,
        interactions: [],
        performanceMetrics: {},
        mood: 'neutral',
        focusLevel: 0.5
      }

      logger.log(`🎮 Session started: ${gameId}`)
    },

    // セッション終了
    endSession(sessionResult) {
      if (!this.currentSession.startTime) return

      const sessionDuration = Math.floor((Date.now() - this.currentSession.startTime) / 1000 / 60)

      // セッションデータを記録
      const sessionData = {
        gameId: this.currentSession.currentGame,
        duration: sessionDuration,
        score: sessionResult.score || 0,
        accuracy: sessionResult.accuracy || 0,
        completed: sessionResult.completed || false,
        timestamp: Date.now(),
        interactions: this.currentSession.interactions.length,
        finalMood: this.currentSession.mood
      }

      // AI エンジンに学習データを提供
      aiPredictionEngine.recordSession(sessionData)

      // 行動パターンを更新
      this.updateBehaviorPatterns(sessionData)

      // ユーザープロフィールを更新
      this.updateUserProfile(sessionData)

      // 予測を更新
      this.updatePredictions()

      logger.log('📊 Session ended and analyzed')

      // セッションをリセット
      this.currentSession = {
        startTime: null,
        currentGame: null,
        interactions: [],
        performanceMetrics: {},
        mood: 'neutral',
        focusLevel: 0.5
      }
    },

    // インタラクション記録
    recordInteraction(interactionData) {
      if (!this.currentSession.startTime) return

      const interaction = {
        type: interactionData.type,
        timestamp: Date.now(),
        details: interactionData.details,
        performance: interactionData.performance
      }

      this.currentSession.interactions.push(interaction)

      // リアルタイムムード推定
      this.estimateCurrentMood(interaction)

      // フォーカスレベル推定
      this.estimateFocusLevel(interaction)
    },

    // 行動パターン更新
    updateBehaviorPatterns(sessionData) {
      const hour = new Date().getHours()
      const dayOfWeek = new Date().getDay()

      // 時間選好の更新
      if (!this.behaviorPatterns.timePreferences.preferredHours.includes(hour)) {
        this.behaviorPatterns.timePreferences.preferredHours.push(hour)
      }

      // ゲーム選好の更新
      const gameType = this.categorizeGame(sessionData.gameId)
      if (!this.behaviorPatterns.gamePreferences.favoriteGenres.includes(gameType)) {
        this.behaviorPatterns.gamePreferences.favoriteGenres.push(gameType)
      }

      // 完了率の更新
      const completions = this.learningAnalytics.questCompletionTrends
      const totalAttempts = completions.length + 1
      const totalCompletions = completions.filter(c => c.completed).length +
                              (sessionData.completed ? 1 : 0)

      this.behaviorPatterns.gamePreferences.completionRate = totalCompletions / totalAttempts

      // 学習ペースの推定
      this.estimateLearningPace(sessionData)

      // チャレンジ応答の分析
      this.analyzeChallengResponse(sessionData)
    },

    // ユーザープロフィール更新
    updateUserProfile(sessionData) {
      this.userProfile.totalSessions++
      this.userProfile.totalPlayTime += sessionData.duration

      // 平均セッション時間の更新
      this.userProfile.averageSessionLength =
        this.userProfile.totalPlayTime / this.userProfile.totalSessions

      // スキルレベルの推定
      this.estimateSkillLevel()

      // 選好ゲームタイプの更新
      const gameType = this.categorizeGame(sessionData.gameId)
      this.userProfile.preferredGameTypes[gameType] =
        (this.userProfile.preferredGameTypes[gameType] || 0) + 1
    },

    // AI予測の更新
    async updatePredictions() {
      try {
        // 特徴量の準備
        const features = this.prepareFeatures()

        // AI予測の取得
        const predictions = await aiPredictionEngine.getPredictions(features)

        this.predictions = {
          churnRisk: predictions.churn,
          nextOptimalSession: predictions.timing.nextSession,
          recommendedGames: this.generateGameRecommendations(predictions),
          difficultyAdjustments: predictions.difficulty,
          lastUpdated: new Date().toISOString()
        }

        logger.log('🔮 AI predictions updated')

      } catch (error) {
        logger.error('Failed to update predictions:', error)
      }
    },

    // 特徴量準備
    prepareFeatures() {
      const now = Date.now()
      const lastSession = this.learningAnalytics.engagementHistory.slice(-1)[0]
      const daysSinceLastSession = lastSession ?
        (now - lastSession.timestamp) / (24 * 60 * 60 * 1000) : 0

      return {
        daysSinceLastSession,
        averageSessionLength: this.userProfile.averageSessionLength,
        totalSessions: this.userProfile.totalSessions,
        averageAccuracy: this.calculateAverageAccuracy(),
        questCompletionRate: this.behaviorPatterns.gamePreferences.completionRate,
        gameVariety: Object.keys(this.userProfile.preferredGameTypes).length,
        weekdayActivity: this.calculateWeekdayActivity(),
        hourlyActivity: this.calculateHourlyActivity(),
        weeklyActivity: this.calculateWeeklyActivity(),
        recentPerformance: this.calculateRecentPerformance()
      }
    },

    // ゲームカテゴリ分類
    categorizeGame(gameId) {
      const categories = {
        'rhythm-phonics-mini': 'rhythm',
        'word-rush': 'vocabulary',
        'grammar-galaxy': 'grammar',
        'phonics-adventure': 'phonics',
        'quest-complete': 'quest'
      }

      return categories[gameId] || 'general'
    },

    // ムード推定
    estimateCurrentMood(interaction) {
      let moodScore = 0

      // パフォーマンスベースのムード推定
      if (interaction.performance) {
        if (interaction.performance.accuracy > 0.9) moodScore += 0.3
        else if (interaction.performance.accuracy < 0.5) moodScore -= 0.2

        if (interaction.performance.speed === 'fast') moodScore += 0.1
        else if (interaction.performance.speed === 'slow') moodScore -= 0.1
      }

      // インタラクションタイプ
      switch (interaction.type) {
        case 'success':
          moodScore += 0.2
          break
        case 'failure':
          moodScore -= 0.2
          break
        case 'retry':
          moodScore -= 0.1
          break
        case 'skip':
          moodScore -= 0.3
          break
        case 'achievement':
          moodScore += 0.4
          break
      }

      // ムード状態の更新
      const currentMoodValue = this.moodToValue(this.currentSession.mood)
      const newMoodValue = Math.max(-1, Math.min(1, currentMoodValue + moodScore * 0.3))

      this.currentSession.mood = this.valueToMood(newMoodValue)
    },

    // フォーカスレベル推定
    estimateFocusLevel(interaction) {
      const timeSinceLastInteraction = this.calculateTimeSinceLastInteraction()

      // 短時間での連続インタラクション = 高フォーカス
      if (timeSinceLastInteraction < 2000) { // 2秒以内
        this.currentSession.focusLevel = Math.min(1, this.currentSession.focusLevel + 0.1)
      } else if (timeSinceLastInteraction > 10000) { // 10秒以上
        this.currentSession.focusLevel = Math.max(0, this.currentSession.focusLevel - 0.2)
      }

      // パフォーマンスベースの調整
      if (interaction.performance?.accuracy > 0.8) {
        this.currentSession.focusLevel = Math.min(1, this.currentSession.focusLevel + 0.05)
      }
    },

    // 学習ペース推定
    estimateLearningPace(sessionData) {
      const interactionRate = sessionData.interactions / sessionData.duration // per minute

      if (interactionRate > 10) {
        this.behaviorPatterns.learningStyle.pace = 'fast'
      } else if (interactionRate < 5) {
        this.behaviorPatterns.learningStyle.pace = 'slow'
      } else {
        this.behaviorPatterns.learningStyle.pace = 'medium'
      }
    },

    // チャレンジ応答分析
    analyzeChallengResponse(sessionData) {
      if (sessionData.accuracy > 0.9 && sessionData.completed) {
        // 高成績完了 = チャレンジ追求
        this.behaviorPatterns.gamePreferences.challengeResponse = 'seeks'
      } else if (sessionData.accuracy < 0.5 || !sessionData.completed) {
        // 低成績や未完了 = チャレンジ回避
        this.behaviorPatterns.gamePreferences.challengeResponse = 'avoids'
      } else {
        this.behaviorPatterns.gamePreferences.challengeResponse = 'moderate'
      }
    },

    // スキルレベル推定
    estimateSkillLevel() {
      const avgAccuracy = this.calculateAverageAccuracy()
      const sessions = this.userProfile.totalSessions

      if (sessions < 10) {
        this.userProfile.skillLevel = 'beginner'
      } else if (sessions < 50 && avgAccuracy > 0.7) {
        this.userProfile.skillLevel = 'intermediate'
      } else if (sessions >= 50 && avgAccuracy > 0.8) {
        this.userProfile.skillLevel = 'advanced'
      } else if (sessions > 100 && avgAccuracy > 0.9) {
        this.userProfile.skillLevel = 'expert'
      }
    },

    // ヘルパーメソッド
    calculateAverageAccuracy() {
      const history = this.learningAnalytics.engagementHistory
      if (history.length === 0) return 0.5

      const totalAccuracy = history.reduce((sum, session) => sum + (session.accuracy || 0.5), 0)
      return totalAccuracy / history.length
    },

    calculateWeekdayActivity() {
      // 曜日別アクティビティパターンを計算
      return this.behaviorPatterns.timePreferences.weekdayVsWeekend
    },

    calculateHourlyActivity() {
      return this.behaviorPatterns.timePreferences.preferredHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {})
    },

    calculateWeeklyActivity() {
      // 週間パターンを計算
      return this.behaviorPatterns.timePreferences.preferredHours.length
    },

    calculateRecentPerformance() {
      const recent = this.learningAnalytics.engagementHistory.slice(-5)
      if (recent.length === 0) return 0.5

      return recent.reduce((sum, s) => sum + (s.accuracy || 0.5), 0) / recent.length
    },

    // ムード変換
    moodToValue(mood) {
      const moodMap = {
        'frustrated': -0.8,
        'bored': -0.4,
        'neutral': 0,
        'engaged': 0.4,
        'excited': 0.8
      }
      return moodMap[mood] || 0
    },

    valueToMood(value) {
      if (value <= -0.6) return 'frustrated'
      if (value <= -0.2) return 'bored'
      if (value <= 0.2) return 'neutral'
      if (value <= 0.6) return 'engaged'
      return 'excited'
    },

    calculateTimeSinceLastInteraction() {
      const interactions = this.currentSession.interactions
      if (interactions.length < 2) return 0

      return interactions[interactions.length - 1].timestamp -
             interactions[interactions.length - 2].timestamp
    },

    // ゲーム推奨生成
    generateGameRecommendations(predictions) {
      const difficulty = predictions.difficulty.difficulty
      const engagement = predictions.engagement.level

      const recommendations = []

      // 難易度に基づく推奨
      if (difficulty < 0.7) {
        recommendations.push('rhythm-phonics-mini') // 易しめ
      } else if (difficulty > 1.2) {
        recommendations.push('grammar-galaxy') // 難しめ
      } else {
        recommendations.push('word-rush') // 中程度
      }

      // エンゲージメントに基づく推奨
      if (engagement === 'low') {
        recommendations.push('quest-complete') // 報酬重視
      } else if (engagement === 'high') {
        recommendations.push('phonics-adventure') // チャレンジ重視
      }

      return [...new Set(recommendations)] // 重複除去
    },

    // データ保存・復元
    saveBehaviorData() {
      try {
        const data = {
          userProfile: this.userProfile,
          behaviorPatterns: this.behaviorPatterns,
          learningAnalytics: this.learningAnalytics,
          lastUpdated: Date.now()
        }
        localStorage.setItem('behavior_analysis', JSON.stringify(data))
      } catch (error) {
        logger.error('Failed to save behavior data:', error)
      }
    },

    loadBehaviorData() {
      try {
        const saved = localStorage.getItem('behavior_analysis')
        if (saved) {
          const data = JSON.parse(saved)
          this.userProfile = { ...this.userProfile, ...data.userProfile }
          this.behaviorPatterns = { ...this.behaviorPatterns, ...data.behaviorPatterns }
          this.learningAnalytics = { ...this.learningAnalytics, ...data.learningAnalytics }
          logger.log('📊 Behavior data restored')
        }
      } catch (error) {
        logger.error('Failed to load behavior data:', error)
      }
    }
  }
}, {
  persist: {
    key: 'behavior-analysis-store',
    storage: localStorage,
    paths: ['userProfile', 'behaviorPatterns', 'learningAnalytics']
  }
})