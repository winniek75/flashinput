// src/services/aiPredictionEngine.js - AI習慣予測エンジン
import logger from '@/utils/logger'

class AIPredictionEngine {
  constructor() {
    this.initialized = false
    this.models = {
      churnPrediction: null,
      engagementForecasting: null,
      difficultyOptimization: null,
      timePreference: null
    }

    // 学習データ蓄積用
    this.trainingData = {
      userSessions: [],
      gameInteractions: [],
      questCompletions: [],
      streakEvents: [],
      reminderResponses: []
    }

    // モデルパラメータ
    this.modelParams = {
      churnThresholds: {
        critical: 0.8,
        high: 0.6,
        medium: 0.4,
        low: 0.2
      },
      engagementFactors: {
        sessionLength: 0.3,
        gameVariety: 0.25,
        questCompletion: 0.2,
        streakMaintenance: 0.15,
        reminderResponse: 0.1
      },
      learningCurve: {
        novice: { sessions: [0, 10], difficultyMultiplier: 0.7 },
        beginner: { sessions: [11, 30], difficultyMultiplier: 0.8 },
        intermediate: { sessions: [31, 100], difficultyMultiplier: 1.0 },
        advanced: { sessions: [101, 300], difficultyMultiplier: 1.2 },
        expert: { sessions: [301, Infinity], difficultyMultiplier: 1.4 }
      }
    }
  }

  // 初期化
  async initialize() {
    if (this.initialized) return

    logger.log('🧠 Initializing AI Prediction Engine')

    // 既存データの読み込み
    await this.loadHistoricalData()

    // モデルの初期化
    this.initializeModels()

    this.initialized = true
    logger.log('✅ AI Prediction Engine initialized')
  }

  // 履歴データ読み込み
  async loadHistoricalData() {
    try {
      // localStorage から過去のデータを復元
      const savedData = localStorage.getItem('ai_training_data')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        this.trainingData = { ...this.trainingData, ...parsed }
        logger.log(`📊 Loaded ${this.trainingData.userSessions.length} historical sessions`)
      }

      // 初期サンプルデータ（新規ユーザー用）
      if (this.trainingData.userSessions.length === 0) {
        this.generateSampleData()
      }

    } catch (error) {
      logger.error('Failed to load historical data:', error)
      this.generateSampleData()
    }
  }

  // サンプルデータ生成（冷起動問題対策）
  generateSampleData() {
    logger.log('🎲 Generating sample training data for cold start')

    const now = Date.now()
    const sampleSessions = []

    // 過去30日間のサンプルセッション生成
    for (let i = 0; i < 30; i++) {
      const dayOffset = i * 24 * 60 * 60 * 1000
      const sessionCount = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < sessionCount; j++) {
        sampleSessions.push({
          timestamp: now - dayOffset - (j * 2 * 60 * 60 * 1000),
          duration: Math.floor(Math.random() * 20) + 3, // 3-23分
          gameId: ['rhythm-phonics', 'word-rush', 'quest-complete'][Math.floor(Math.random() * 3)],
          score: Math.floor(Math.random() * 100),
          accuracy: 0.6 + Math.random() * 0.4, // 60-100%
          completed: Math.random() > 0.2, // 80%完了率
          userId: 'sample_user'
        })
      }
    }

    this.trainingData.userSessions = sampleSessions
    logger.log(`🔧 Generated ${sampleSessions.length} sample sessions`)
  }

  // モデル初期化
  initializeModels() {
    logger.log('⚙️ Initializing prediction models')

    // 離脱予測モデル
    this.models.churnPrediction = {
      predict: (features) => this.predictChurn(features),
      updateWeights: (feedback) => this.updateChurnWeights(feedback)
    }

    // エンゲージメント予測モデル
    this.models.engagementForecasting = {
      predict: (features) => this.predictEngagement(features),
      updateWeights: (feedback) => this.updateEngagementWeights(feedback)
    }

    // 難易度最適化モデル
    this.models.difficultyOptimization = {
      predict: (features) => this.predictOptimalDifficulty(features),
      updateWeights: (feedback) => this.updateDifficultyWeights(feedback)
    }

    // 時間選好モデル
    this.models.timePreference = {
      predict: (features) => this.predictOptimalTime(features),
      updateWeights: (feedback) => this.updateTimeWeights(feedback)
    }

    logger.log('✅ All prediction models initialized')
  }

  // 離脱予測（Churn Prediction）
  predictChurn(userFeatures) {
    const features = this.normalizeFeatures(userFeatures)

    // 加重線形組み合わせモデル
    const weights = {
      daysSinceLastSession: 0.25,
      averageSessionLength: -0.15,
      streakBreaks: 0.20,
      questCompletionRate: -0.15,
      gameVariety: -0.10,
      reminderResponseRate: -0.10,
      weekdayActivity: -0.05
    }

    let churnScore = 0.1 // ベースライン

    // 特徴量スコア計算
    Object.entries(weights).forEach(([feature, weight]) => {
      const featureValue = features[feature] || 0
      churnScore += featureValue * weight
    })

    // シグモイド関数で0-1に正規化
    const churnProbability = 1 / (1 + Math.exp(-churnScore * 5))

    // 時系列パターン分析
    const recentActivity = this.analyzeRecentActivity(features)
    const trendMultiplier = recentActivity.isDecreasing ? 1.3 : 0.8

    const finalChurnProb = Math.min(1, churnProbability * trendMultiplier)

    logger.log(`🎯 Churn prediction: ${(finalChurnProb * 100).toFixed(1)}%`)

    return {
      probability: finalChurnProb,
      confidence: this.calculateConfidence(features),
      riskLevel: this.categorizeRisk(finalChurnProb),
      factors: this.identifyChurnFactors(features, weights),
      recommendation: this.generateChurnRecommendation(finalChurnProb, features)
    }
  }

  // エンゲージメント予測
  predictEngagement(userFeatures) {
    const features = this.normalizeFeatures(userFeatures)

    // 多変量回帰モデル
    const engagementWeights = {
      recentGameCount: 0.3,
      averageAccuracy: 0.2,
      questCompletionStreak: 0.25,
      timeSpentLearning: 0.15,
      socialInteraction: 0.1  // 将来のソーシャル機能用
    }

    let engagementScore = 0

    Object.entries(engagementWeights).forEach(([feature, weight]) => {
      const value = features[feature] || 0
      engagementScore += value * weight
    })

    // 時間的減衰を考慮
    const timeDecay = this.calculateTimeDecay(features.daysSinceLastSession)
    engagementScore *= timeDecay

    // 正規化 (0-1)
    const normalizedScore = Math.max(0, Math.min(1, engagementScore))

    return {
      score: normalizedScore,
      level: this.categorizeEngagement(normalizedScore),
      trends: this.analyzeEngagementTrends(features),
      boosters: this.identifyEngagementBoosters(features),
      prediction: this.predictFutureEngagement(normalizedScore, features)
    }
  }

  // 最適難易度予測
  predictOptimalDifficulty(userFeatures) {
    const features = this.normalizeFeatures(userFeatures)

    // 学習曲線分析
    const totalSessions = features.totalSessions || 0
    const averageAccuracy = features.averageAccuracy || 0.5
    const recentPerformance = features.recentPerformance || 0.5

    // 経験レベル判定
    const experienceLevel = this.determineExperienceLevel(totalSessions)
    const baseDifficulty = this.modelParams.learningCurve[experienceLevel].difficultyMultiplier

    // パフォーマンス調整
    let performanceAdjustment = 0
    if (averageAccuracy > 0.9) {
      performanceAdjustment = 0.2 // 難易度上げ
    } else if (averageAccuracy < 0.7) {
      performanceAdjustment = -0.2 // 難易度下げ
    }

    // 最近のトレンド分析
    const recentTrend = recentPerformance - averageAccuracy
    const trendAdjustment = recentTrend * 0.1

    const optimalDifficulty = Math.max(0.3, Math.min(2.0,
      baseDifficulty + performanceAdjustment + trendAdjustment
    ))

    return {
      difficulty: optimalDifficulty,
      experienceLevel,
      reasoning: this.explainDifficultyReasoning(
        baseDifficulty, performanceAdjustment, trendAdjustment
      ),
      alternatives: this.generateAlternativeDifficulties(optimalDifficulty),
      adaptationSpeed: this.calculateAdaptationSpeed(features)
    }
  }

  // 最適時間予測
  predictOptimalTime(userFeatures) {
    const features = this.normalizeFeatures(userFeatures)

    // 時間選好パターン分析
    const hourlyActivity = features.hourlyActivity || {}
    const weeklyPattern = features.weeklyActivity || {}

    // 統計的分析
    const peakHours = this.identifyPeakHours(hourlyActivity)
    const preferredDays = this.identifyPreferredDays(weeklyPattern)

    // 生産性スコア計算
    const productivityByHour = this.calculateProductivityByHour(features)

    // 次回セッションの最適時間予測
    const nextOptimalTime = this.calculateNextOptimalTime(
      peakHours, preferredDays, productivityByHour
    )

    return {
      nextSession: nextOptimalTime,
      peakHours: peakHours.slice(0, 3), // Top 3
      optimalDuration: this.predictOptimalDuration(features),
      dailyCapacity: this.estimateDailyCapacity(features),
      weeklyPattern: this.analyzeWeeklyPattern(weeklyPattern)
    }
  }

  // 特徴量正規化
  normalizeFeatures(features) {
    const normalized = { ...features }

    // 数値特徴量を0-1に正規化
    const numericFeatures = [
      'daysSinceLastSession', 'averageSessionLength', 'totalSessions',
      'averageAccuracy', 'questCompletionRate'
    ]

    numericFeatures.forEach(feature => {
      if (normalized[feature] !== undefined) {
        // Min-max正規化
        const maxValues = {
          daysSinceLastSession: 30,
          averageSessionLength: 60,
          totalSessions: 1000,
          averageAccuracy: 1,
          questCompletionRate: 1
        }

        normalized[feature] = Math.min(1, normalized[feature] / maxValues[feature])
      }
    })

    return normalized
  }

  // 最近のアクティビティ分析
  analyzeRecentActivity(features) {
    const recentSessions = this.trainingData.userSessions
      .filter(session => session.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp)

    if (recentSessions.length < 3) {
      return { isDecreasing: false, trend: 'insufficient_data' }
    }

    // 最近3日間のトレンド分析
    const recent3Days = recentSessions.slice(0, 3)
    const durations = recent3Days.map(s => s.duration)

    const isDecreasing = durations[0] < durations[durations.length - 1]
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length

    return {
      isDecreasing,
      trend: isDecreasing ? 'declining' : 'stable_or_improving',
      recentAverage: avgDuration,
      sessionCount: recent3Days.length
    }
  }

  // 信頼度計算
  calculateConfidence(features) {
    const dataPoints = this.trainingData.userSessions.length
    const featureCompleteness = this.calculateFeatureCompleteness(features)

    let confidence = 0.5 // ベースライン

    // データ量による信頼度向上
    if (dataPoints > 50) confidence += 0.3
    else if (dataPoints > 20) confidence += 0.2
    else if (dataPoints > 10) confidence += 0.1

    // 特徴量完全性
    confidence += featureCompleteness * 0.3

    // 予測モデルの精度（過去の予測との照合）
    const historicalAccuracy = this.getHistoricalAccuracy()
    confidence += historicalAccuracy * 0.2

    return Math.min(1, confidence)
  }

  // リスクレベル分類
  categorizeRisk(probability) {
    const { critical, high, medium, low } = this.modelParams.churnThresholds

    if (probability >= critical) return 'critical'
    if (probability >= high) return 'high'
    if (probability >= medium) return 'medium'
    if (probability >= low) return 'low'
    return 'minimal'
  }

  // 離脱要因特定
  identifyChurnFactors(features, weights) {
    const factors = []

    Object.entries(weights).forEach(([feature, weight]) => {
      const value = features[feature] || 0
      const impact = Math.abs(value * weight)

      if (impact > 0.05) { // 閾値以上の影響
        factors.push({
          factor: feature,
          impact,
          direction: weight > 0 ? 'increases_risk' : 'decreases_risk',
          value: features[feature]
        })
      }
    })

    return factors.sort((a, b) => b.impact - a.impact)
  }

  // 離脱対策推奨
  generateChurnRecommendation(churnProb, features) {
    if (churnProb >= 0.8) {
      return {
        urgency: 'immediate',
        actions: [
          'immediate_engagement_intervention',
          'personalized_challenge',
          'social_reconnection'
        ],
        message: '緊急：積極的な介入が必要'
      }
    } else if (churnProb >= 0.6) {
      return {
        urgency: 'high',
        actions: [
          'increase_reminder_frequency',
          'adjust_difficulty',
          'offer_rewards'
        ],
        message: '警告：学習習慣の再構築が必要'
      }
    } else if (churnProb >= 0.4) {
      return {
        urgency: 'moderate',
        actions: [
          'gentle_nudging',
          'new_content_introduction',
          'progress_highlighting'
        ],
        message: '注意：モチベーション維持サポート'
      }
    } else {
      return {
        urgency: 'low',
        actions: [
          'maintain_current_approach',
          'gradual_challenge_increase'
        ],
        message: '良好：現在のペース維持'
      }
    }
  }

  // 経験レベル判定
  determineExperienceLevel(totalSessions) {
    const levels = Object.entries(this.modelParams.learningCurve)

    for (const [level, config] of levels) {
      const [min, max] = config.sessions
      if (totalSessions >= min && totalSessions <= max) {
        return level
      }
    }

    return 'novice'
  }

  // セッションデータ記録
  recordSession(sessionData) {
    const enrichedData = {
      ...sessionData,
      timestamp: Date.now(),
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours()
    }

    this.trainingData.userSessions.push(enrichedData)

    // 最大保存数制限（メモリ効率）
    if (this.trainingData.userSessions.length > 1000) {
      this.trainingData.userSessions = this.trainingData.userSessions.slice(-500)
    }

    // 定期保存
    this.saveTrainingData()

    // オンライン学習（簡易版）
    this.updateModelsOnline(enrichedData)

    logger.log('📊 Session recorded for AI learning')
  }

  // オンライン学習
  updateModelsOnline(newData) {
    // 簡単な重み更新（完全なML実装の簡易版）
    const feedback = {
      actual_churn: false, // セッションがあるので離脱していない
      engagement_level: this.estimateEngagementLevel(newData),
      difficulty_feedback: this.estimateDifficultyFeedback(newData)
    }

    // モデル重みの微調整
    this.models.churnPrediction.updateWeights(feedback)
    this.models.engagementForecasting.updateWeights(feedback)
    this.models.difficultyOptimization.updateWeights(feedback)
  }

  // トレーニングデータ保存
  saveTrainingData() {
    try {
      const dataToSave = {
        ...this.trainingData,
        lastUpdated: Date.now()
      }
      localStorage.setItem('ai_training_data', JSON.stringify(dataToSave))
    } catch (error) {
      logger.error('Failed to save training data:', error)
    }
  }

  // 予測結果取得（メインAPI）
  async getPredictions(userFeatures) {
    if (!this.initialized) {
      await this.initialize()
    }

    const predictions = {
      churn: this.models.churnPrediction.predict(userFeatures),
      engagement: this.models.engagementForecasting.predict(userFeatures),
      difficulty: this.models.difficultyOptimization.predict(userFeatures),
      timing: this.models.timePreference.predict(userFeatures),
      generatedAt: new Date().toISOString()
    }

    logger.log('🔮 AI predictions generated:', {
      churnRisk: predictions.churn.probability,
      engagementLevel: predictions.engagement.level,
      optimalDifficulty: predictions.difficulty.difficulty
    })

    return predictions
  }

  // ヘルパーメソッド群
  calculateTimeDecay(daysSinceLastSession) {
    return Math.exp(-daysSinceLastSession * 0.1)
  }

  categorizeEngagement(score) {
    if (score >= 0.8) return 'very_high'
    if (score >= 0.6) return 'high'
    if (score >= 0.4) return 'medium'
    if (score >= 0.2) return 'low'
    return 'very_low'
  }

  calculateFeatureCompleteness(features) {
    const requiredFeatures = [
      'daysSinceLastSession', 'averageSessionLength', 'totalSessions',
      'averageAccuracy', 'questCompletionRate'
    ]

    const completedFeatures = requiredFeatures.filter(
      f => features[f] !== undefined && features[f] !== null
    )

    return completedFeatures.length / requiredFeatures.length
  }

  getHistoricalAccuracy() {
    // 簡易版：実際の実装ではより詳細な精度追跡が必要
    return 0.75 // 仮の精度値
  }

  estimateEngagementLevel(sessionData) {
    const accuracy = sessionData.accuracy || 0.5
    const duration = sessionData.duration || 5
    const completed = sessionData.completed ? 1 : 0

    return (accuracy * 0.4 + Math.min(1, duration / 20) * 0.4 + completed * 0.2)
  }

  estimateDifficultyFeedback(sessionData) {
    const accuracy = sessionData.accuracy || 0.5

    if (accuracy > 0.9) return 'too_easy'
    if (accuracy < 0.6) return 'too_hard'
    return 'appropriate'
  }

  // 更新メソッド群（簡易実装）
  updateChurnWeights(feedback) {
    // 実際のML実装では勾配降下法などを使用
    logger.log('🔄 Updating churn model weights')
  }

  updateEngagementWeights(feedback) {
    logger.log('🔄 Updating engagement model weights')
  }

  updateDifficultyWeights(feedback) {
    logger.log('🔄 Updating difficulty model weights')
  }

  updateTimeWeights(feedback) {
    logger.log('🔄 Updating time preference model weights')
  }
}

// シングルトンインスタンス
const aiPredictionEngine = new AIPredictionEngine()

export default aiPredictionEngine

// Vue用のコンポーザブル
import { inject, onMounted } from 'vue'

export function useAIPrediction() {
  const engine = inject('aiPredictionEngine', aiPredictionEngine)

  onMounted(async () => {
    await engine.initialize()
  })

  return {
    getPredictions: (features) => engine.getPredictions(features),
    recordSession: (data) => engine.recordSession(data),
    predictChurn: (features) => engine.models.churnPrediction.predict(features),
    predictEngagement: (features) => engine.models.engagementForecasting.predict(features),
    predictOptimalDifficulty: (features) => engine.models.difficultyOptimization.predict(features)
  }
}