/**
 * MovWISE AI Learning Engine
 * 個別最適化・弱点分析・学習推奨システム
 */

export interface LearningProfile {
  userId: string
  grammarStrengths: Record<string, number>
  grammarWeaknesses: Record<string, number>
  learningVelocity: number
  preferredDifficulty: 'easy' | 'normal' | 'hard'
  attentionSpan: number // minutes
  motivationLevel: number // 0-100
  lastActivity: Date
  totalStudyTime: number // minutes
  streakDays: number
}

export interface LearningRecommendation {
  recommendedGames: string[]
  targetDuration: number // minutes
  difficultyAdjustment: number
  focusAreas: string[]
  motivationalMessage: string
  expectedImprovement: number
}

export interface PerformanceData {
  gameId: string
  score: number
  accuracy: number
  reactionTime: number
  mistakePatterns: string[]
  completionTime: number
  timestamp: Date
  grammarTopics: string[]
}

export class AILearningEngine {
  private learningProfiles: Map<string, LearningProfile> = new Map()
  private performanceHistory: Map<string, PerformanceData[]> = new Map()

  /**
   * 学習者プロファイルの初期化
   */
  initializeLearner(userId: string): LearningProfile {
    const profile: LearningProfile = {
      userId,
      grammarStrengths: {},
      grammarWeaknesses: {},
      learningVelocity: 1.0,
      preferredDifficulty: 'normal',
      attentionSpan: 15,
      motivationLevel: 75,
      lastActivity: new Date(),
      totalStudyTime: 0,
      streakDays: 0
    }

    this.learningProfiles.set(userId, profile)
    return profile
  }

  /**
   * パフォーマンスデータの記録と分析
   */
  recordPerformance(userId: string, data: PerformanceData): void {
    if (!this.performanceHistory.has(userId)) {
      this.performanceHistory.set(userId, [])
    }

    const history = this.performanceHistory.get(userId)!
    history.push(data)

    // 最新100件のみ保持（メモリ最適化）
    if (history.length > 100) {
      history.splice(0, history.length - 100)
    }

    this.updateLearningProfile(userId, data)
  }

  /**
   * 学習プロファイルの動的更新
   */
  private updateLearningProfile(userId: string, data: PerformanceData): void {
    const profile = this.learningProfiles.get(userId)
    if (!profile) return

    // 文法強化・弱点エリアの更新
    data.grammarTopics.forEach(topic => {
      if (data.accuracy >= 0.8) {
        profile.grammarStrengths[topic] = (profile.grammarStrengths[topic] || 0) + 1
      } else {
        profile.grammarWeaknesses[topic] = (profile.grammarWeaknesses[topic] || 0) + 1
      }
    })

    // 学習速度の調整
    const recentPerformance = this.getRecentPerformance(userId, 5)
    const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length

    if (avgAccuracy > 0.9) {
      profile.learningVelocity = Math.min(profile.learningVelocity + 0.1, 2.0)
    } else if (avgAccuracy < 0.6) {
      profile.learningVelocity = Math.max(profile.learningVelocity - 0.1, 0.5)
    }

    // 難易度設定の調整
    if (avgAccuracy > 0.95) {
      profile.preferredDifficulty = 'hard'
    } else if (avgAccuracy < 0.5) {
      profile.preferredDifficulty = 'easy'
    } else {
      profile.preferredDifficulty = 'normal'
    }

    // モチベーションレベルの更新
    this.updateMotivationLevel(profile, data)
  }

  /**
   * モチベーションレベルの動的調整
   */
  private updateMotivationLevel(profile: LearningProfile, data: PerformanceData): void {
    if (data.accuracy >= 0.8) {
      profile.motivationLevel = Math.min(profile.motivationLevel + 5, 100)
    } else if (data.accuracy < 0.5) {
      profile.motivationLevel = Math.max(profile.motivationLevel - 3, 0)
    }

    // 連続学習ボーナス
    const daysSinceLastActivity = Math.floor(
      (Date.now() - profile.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActivity <= 1) {
      profile.streakDays++
      profile.motivationLevel = Math.min(profile.motivationLevel + 2, 100)
    } else {
      profile.streakDays = 0
    }

    profile.lastActivity = new Date()
  }

  /**
   * 個別最適化された学習推奨生成
   */
  generateRecommendations(userId: string): LearningRecommendation {
    const profile = this.learningProfiles.get(userId)
    if (!profile) {
      throw new Error(`Learning profile not found for user: ${userId}`)
    }

    const weakestAreas = this.identifyWeakestAreas(profile)
    const recommendedGames = this.selectOptimalGames(profile, weakestAreas)
    const targetDuration = this.calculateOptimalDuration(profile)

    return {
      recommendedGames,
      targetDuration,
      difficultyAdjustment: profile.learningVelocity,
      focusAreas: weakestAreas,
      motivationalMessage: this.generateMotivationalMessage(profile),
      expectedImprovement: this.predictImprovement(profile, weakestAreas)
    }
  }

  /**
   * 弱点エリアの特定
   */
  private identifyWeakestAreas(profile: LearningProfile): string[] {
    const weaknessEntries = Object.entries(profile.grammarWeaknesses)
    const strengthEntries = Object.entries(profile.grammarStrengths)

    // 弱点スコアの計算（弱点 - 強み）
    const weaknessScores = weaknessEntries.map(([topic, weakness]) => {
      const strength = profile.grammarStrengths[topic] || 0
      return {
        topic,
        score: weakness - strength
      }
    })

    return weaknessScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.topic)
  }

  /**
   * 最適ゲーム選択
   */
  private selectOptimalGames(profile: LearningProfile, focusAreas: string[]): string[] {
    const gameMap: Record<string, string[]> = {
      'be_verbs': ['BeVerbRush', 'GrammarReflexArena'],
      'general_verbs': ['GrammarReflexArena', 'PatternHunterGame'],
      'questions': ['GrammarReflexArena', 'TimeZoneNavigatorGame'],
      'past_tense': ['TimeZoneNavigatorGame', 'GrammarColorCodeGame'],
      'future_tense': ['TimeZoneNavigatorGame', 'PatternHunterGame'],
      'conditionals': ['GrammarReflexArena', 'PatternHunterGame']
    }

    const recommendedGames = new Set<string>()
    
    focusAreas.forEach(area => {
      const games = gameMap[area] || ['GrammarReflexArena']
      games.forEach(game => recommendedGames.add(game))
    })

    return Array.from(recommendedGames)
  }

  /**
   * 最適学習時間の計算
   */
  private calculateOptimalDuration(profile: LearningProfile): number {
    const baseDuration = profile.attentionSpan
    const motivationFactor = profile.motivationLevel / 100
    const velocityFactor = profile.learningVelocity

    return Math.round(baseDuration * motivationFactor * velocityFactor)
  }

  /**
   * モチベーションメッセージ生成
   */
  private generateMotivationalMessage(profile: LearningProfile): string {
    const messages = {
      high: [
        \"🌟 素晴らしい調子です！今日も頑張りましょう！\",
        \"🚀 あなたの成長速度は驚異的です！\",
        \"💫 完璧なペースで進んでいます！\"
      ],
      medium: [
        \"📚 着実に進歩しています。継続が力になります！\",
        \"🎯 集中して取り組めば、必ず上達します！\",
        \"⭐ 一歩ずつでも前進していますね！\"
      ],
      low: [
        \"🌱 大丈夫です。みんな最初は苦労するものです。\",
        \"💪 諦めずに続ければ、必ず結果がついてきます！\",
        \"🌈 今日は小さな目標から始めてみましょう！\"
      ]
    }

    const level = profile.motivationLevel >= 70 ? 'high' : 
                  profile.motivationLevel >= 40 ? 'medium' : 'low'
    
    const messageArray = messages[level]
    return messageArray[Math.floor(Math.random() * messageArray.length)]
  }

  /**
   * 改善予測
   */
  private predictImprovement(profile: LearningProfile, focusAreas: string[]): number {
    const baseImprovement = 15
    const velocityBonus = (profile.learningVelocity - 1) * 10
    const motivationBonus = (profile.motivationLevel / 100) * 10
    const focusBonus = focusAreas.length * 5

    return Math.round(baseImprovement + velocityBonus + motivationBonus + focusBonus)
  }

  /**
   * 最近のパフォーマンス取得
   */
  private getRecentPerformance(userId: string, count: number): PerformanceData[] {
    const history = this.performanceHistory.get(userId) || []
    return history.slice(-count)
  }

  /**
   * 詳細分析レポート生成
   */
  generateDetailedReport(userId: string): object {
    const profile = this.learningProfiles.get(userId)
    const history = this.performanceHistory.get(userId) || []

    if (!profile) return {}

    const recentHistory = history.slice(-20)
    const avgAccuracy = recentHistory.reduce((sum, p) => sum + p.accuracy, 0) / recentHistory.length || 0
    const avgReactionTime = recentHistory.reduce((sum, p) => sum + p.reactionTime, 0) / recentHistory.length || 0

    return {
      profileSummary: {
        learningVelocity: profile.learningVelocity,
        preferredDifficulty: profile.preferredDifficulty,
        motivationLevel: profile.motivationLevel,
        streakDays: profile.streakDays,
        totalStudyTime: profile.totalStudyTime
      },
      performanceMetrics: {
        averageAccuracy: Math.round(avgAccuracy * 100),
        averageReactionTime: Math.round(avgReactionTime),
        totalGamesPlayed: history.length,
        strongestTopics: this.getTopTopics(profile.grammarStrengths),
        weakestTopics: this.getTopTopics(profile.grammarWeaknesses)
      },
      recommendations: this.generateRecommendations(userId)
    }
  }

  /**
   * トップトピック取得
   */
  private getTopTopics(topics: Record<string, number>): Array<{topic: string, score: number}> {
    return Object.entries(topics)
      .map(([topic, score]) => ({ topic, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }
}

// シングルトンインスタンス
export const aiLearningEngine = new AILearningEngine()