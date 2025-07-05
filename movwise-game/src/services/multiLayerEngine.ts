/**
 * MovWISE Multi-Layer Learning Engine
 * Rush Zone + Construction Zone + Battle Zone
 */

export interface LearningLayer {
  id: string
  name: string
  description: string
  targetSkills: string[]
  difficulty: number
  estimatedDuration: number
  gameTypes: string[]
  learningObjectives: string[]
}

export interface ZoneConfiguration {
  rushZone: RushZoneConfig
  constructionZone: ConstructionZoneConfig
  battleZone: BattleZoneConfig
}

export interface RushZoneConfig {
  timeLimit: number
  targetAccuracy: number
  minimumSpeed: number // questions per minute
  bonusMultiplier: number
  feverModeThreshold: number
  comboSystem: boolean
}

export interface ConstructionZoneConfig {
  maxBuildingTime: number
  complexityLevels: number
  collaborativeMode: boolean
  errorCorrection: boolean
  scaffoldingLevel: number
}

export interface BattleZoneConfig {
  playerCount: number
  roundDuration: number
  difficultyScaling: boolean
  teamMode: boolean
  spectatorMode: boolean
}

export interface LearningSession {
  sessionId: string
  userId: string
  zoneType: 'rush' | 'construction' | 'battle'
  grammarTopic: string
  startTime: Date
  endTime?: Date
  configuration: any
  performance: SessionPerformance
  adaptations: AdaptationRecord[]
}

export interface SessionPerformance {
  accuracy: number
  speed: number
  consistency: number
  improvement: number
  engagementLevel: number
  mistakePatterns: string[]
  strongPoints: string[]
  timeSpent: number
}

export interface AdaptationRecord {
  timestamp: Date
  adaptationType: 'difficulty' | 'speed' | 'content' | 'assistance'
  oldValue: any
  newValue: any
  reason: string
  effectiveness: number
}

export class MultiLayerLearningEngine {
  private activeSessions: Map<string, LearningSession> = new Map()
  private zoneConfigurations: ZoneConfiguration
  private adaptationHistory: Map<string, AdaptationRecord[]> = new Map()

  constructor() {
    this.zoneConfigurations = this.initializeZoneConfigurations()
  }

  /**
   * Zone設定の初期化
   */
  private initializeZoneConfigurations(): ZoneConfiguration {
    return {
      rushZone: {
        timeLimit: 120, // 2 minutes
        targetAccuracy: 0.85,
        minimumSpeed: 15, // 15 questions per minute
        bonusMultiplier: 1.5,
        feverModeThreshold: 10, // consecutive correct
        comboSystem: true
      },
      constructionZone: {
        maxBuildingTime: 300, // 5 minutes
        complexityLevels: 5,
        collaborativeMode: true,
        errorCorrection: true,
        scaffoldingLevel: 3
      },
      battleZone: {
        playerCount: 4,
        roundDuration: 180, // 3 minutes
        difficultyScaling: true,
        teamMode: true,
        spectatorMode: true
      }
    }
  }

  /**
   * Rush Zone セッション開始
   */
  startRushZoneSession(
    userId: string,
    grammarTopic: string,
    userLevel: number
  ): LearningSession {
    const sessionId = this.generateSessionId('rush')
    
    // User level-based configuration adaptation
    const adaptedConfig = this.adaptRushZoneConfig(userLevel)
    
    const session: LearningSession = {
      sessionId,
      userId,
      zoneType: 'rush',
      grammarTopic,
      startTime: new Date(),
      configuration: adaptedConfig,
      performance: {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        improvement: 0,
        engagementLevel: 0,
        mistakePatterns: [],
        strongPoints: [],
        timeSpent: 0
      },
      adaptations: []
    }

    this.activeSessions.set(sessionId, session)
    return session
  }

  /**
   * Construction Zone セッション開始
   */
  startConstructionZoneSession(
    userId: string,
    grammarTopic: string,
    collaborativeMode: boolean = false
  ): LearningSession {
    const sessionId = this.generateSessionId('construction')
    
    const adaptedConfig = this.adaptConstructionZoneConfig(collaborativeMode)
    
    const session: LearningSession = {
      sessionId,
      userId,
      zoneType: 'construction',
      grammarTopic,
      startTime: new Date(),
      configuration: adaptedConfig,
      performance: {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        improvement: 0,
        engagementLevel: 0,
        mistakePatterns: [],
        strongPoints: [],
        timeSpent: 0
      },
      adaptations: []
    }

    this.activeSessions.set(sessionId, session)
    return session
  }

  /**
   * Battle Zone セッション開始
   */
  startBattleZoneSession(
    userId: string,
    grammarTopic: string,
    battleMode: 'individual' | 'team' = 'individual'
  ): LearningSession {
    const sessionId = this.generateSessionId('battle')
    
    const adaptedConfig = this.adaptBattleZoneConfig(battleMode)
    
    const session: LearningSession = {
      sessionId,
      userId,
      zoneType: 'battle',
      grammarTopic,
      startTime: new Date(),
      configuration: adaptedConfig,
      performance: {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        improvement: 0,
        engagementLevel: 0,
        mistakePatterns: [],
        strongPoints: [],
        timeSpent: 0
      },
      adaptations: []
    }

    this.activeSessions.set(sessionId, session)
    return session
  }

  /**
   * Rush Zone 設定適応
   */
  private adaptRushZoneConfig(userLevel: number): RushZoneConfig {
    const baseConfig = this.zoneConfigurations.rushZone
    
    return {
      ...baseConfig,
      timeLimit: Math.max(60, baseConfig.timeLimit - (userLevel - 1) * 10),
      targetAccuracy: Math.max(0.7, baseConfig.targetAccuracy - (userLevel - 1) * 0.05),
      minimumSpeed: baseConfig.minimumSpeed + (userLevel - 1) * 3,
      bonusMultiplier: baseConfig.bonusMultiplier + (userLevel - 1) * 0.2,
      feverModeThreshold: Math.max(5, baseConfig.feverModeThreshold - (userLevel - 1) * 2)
    }
  }

  /**
   * Construction Zone 設定適応
   */
  private adaptConstructionZoneConfig(collaborativeMode: boolean): ConstructionZoneConfig {
    const baseConfig = this.zoneConfigurations.constructionZone
    
    return {
      ...baseConfig,
      collaborativeMode,
      maxBuildingTime: collaborativeMode ? baseConfig.maxBuildingTime * 1.5 : baseConfig.maxBuildingTime,
      scaffoldingLevel: collaborativeMode ? baseConfig.scaffoldingLevel + 1 : baseConfig.scaffoldingLevel
    }
  }

  /**
   * Battle Zone 設定適応
   */
  private adaptBattleZoneConfig(battleMode: 'individual' | 'team'): BattleZoneConfig {
    const baseConfig = this.zoneConfigurations.battleZone
    
    return {
      ...baseConfig,
      teamMode: battleMode === 'team',
      playerCount: battleMode === 'team' ? 4 : 2,
      roundDuration: battleMode === 'team' ? baseConfig.roundDuration * 1.2 : baseConfig.roundDuration
    }
  }

  /**
   * リアルタイム適応実行
   */
  performRealTimeAdaptation(sessionId: string, currentPerformance: Partial<SessionPerformance>): void {
    const session = this.activeSessions.get(sessionId)
    if (!session) return

    // パフォーマンス更新
    Object.assign(session.performance, currentPerformance)

    // 適応ルール適用
    const adaptations = this.calculateAdaptations(session)
    
    adaptations.forEach(adaptation => {
      this.applyAdaptation(session, adaptation)
      session.adaptations.push(adaptation)
      
      // 適応履歴保存
      const userAdaptations = this.adaptationHistory.get(session.userId) || []
      userAdaptations.push(adaptation)
      this.adaptationHistory.set(session.userId, userAdaptations)
    })
  }

  /**
   * 適応計算
   */
  private calculateAdaptations(session: LearningSession): AdaptationRecord[] {
    const adaptations: AdaptationRecord[] = []
    const performance = session.performance
    
    // 難易度適応
    if (performance.accuracy > 0.95 && performance.speed > session.configuration.minimumSpeed) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'difficulty',
        oldValue: session.configuration.difficulty || 'normal',
        newValue: 'hard',
        reason: 'High accuracy and speed detected',
        effectiveness: 0
      })
    } else if (performance.accuracy < 0.5) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'difficulty',
        oldValue: session.configuration.difficulty || 'normal',
        newValue: 'easy',
        reason: 'Low accuracy detected',
        effectiveness: 0
      })
    }

    // スピード適応
    if (performance.speed < session.configuration.minimumSpeed * 0.7) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'speed',
        oldValue: session.configuration.timeLimit,
        newValue: session.configuration.timeLimit * 1.3,
        reason: 'Slow response time detected',
        effectiveness: 0
      })
    }

    // コンテンツ適応
    if (performance.mistakePatterns.length > 3) {
      const mostCommonMistake = this.findMostCommonMistake(performance.mistakePatterns)
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'content',
        oldValue: session.grammarTopic,
        newValue: `${session.grammarTopic}_remedial_${mostCommonMistake}`,
        reason: `Repeated mistakes in ${mostCommonMistake}`,
        effectiveness: 0
      })
    }

    // アシスタンス適応
    if (performance.engagementLevel < 0.6) {
      adaptations.push({
        timestamp: new Date(),
        adaptationType: 'assistance',
        oldValue: session.configuration.scaffoldingLevel || 0,
        newValue: (session.configuration.scaffoldingLevel || 0) + 1,
        reason: 'Low engagement detected',
        effectiveness: 0
      })
    }

    return adaptations
  }

  /**
   * 適応適用
   */
  private applyAdaptation(session: LearningSession, adaptation: AdaptationRecord): void {
    switch (adaptation.adaptationType) {
      case 'difficulty':
        session.configuration.difficulty = adaptation.newValue
        break
      case 'speed':
        session.configuration.timeLimit = adaptation.newValue
        break
      case 'content':
        // Content adaptation would be handled by the game components
        break
      case 'assistance':
        session.configuration.scaffoldingLevel = adaptation.newValue
        break
    }
  }

  /**
   * 最頻出エラーパターン検出
   */
  private findMostCommonMistake(mistakes: string[]): string {
    const mistakeCounts = mistakes.reduce((acc, mistake) => {
      acc[mistake] = (acc[mistake] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(mistakeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'general'
  }

  /**
   * セッション終了処理
   */
  endSession(sessionId: string): SessionPerformance | null {
    const session = this.activeSessions.get(sessionId)
    if (!session) return null

    session.endTime = new Date()
    session.performance.timeSpent = session.endTime.getTime() - session.startTime.getTime()

    // 最終パフォーマンス計算
    this.calculateFinalPerformance(session)

    // セッション削除
    this.activeSessions.delete(sessionId)

    return session.performance
  }

  /**
   * 最終パフォーマンス計算
   */
  private calculateFinalPerformance(session: LearningSession): void {
    const performance = session.performance
    
    // Consistency calculation
    const recentAccuracies = this.getRecentAccuracies(session.userId, 5)
    if (recentAccuracies.length > 1) {
      const variance = this.calculateVariance(recentAccuracies)
      performance.consistency = Math.max(0, 100 - variance * 100)
    }

    // Improvement calculation
    const historicalAverage = this.getHistoricalAverage(session.userId, session.grammarTopic)
    if (historicalAverage > 0) {
      performance.improvement = ((performance.accuracy - historicalAverage) / historicalAverage) * 100
    }

    // Engagement level calculation (based on time spent and accuracy)
    const expectedTime = session.configuration.timeLimit || 120
    const timeRatio = Math.min(performance.timeSpent / (expectedTime * 1000), 1)
    performance.engagementLevel = (performance.accuracy * 0.7) + (timeRatio * 0.3)
  }

  /**
   * セッションID生成
   */
  private generateSessionId(zoneType: string): string {
    return `${zoneType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * アクティブセッション取得
   */
  getActiveSession(sessionId: string): LearningSession | undefined {
    return this.activeSessions.get(sessionId)
  }

  /**
   * ユーザーのアクティブセッション取得
   */
  getUserActiveSessions(userId: string): LearningSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)
  }

  /**
   * Zone推奨エンジン
   */
  recommendOptimalZone(
    userId: string,
    grammarTopic: string,
    userPreferences: any,
    performanceHistory: any[]
  ): 'rush' | 'construction' | 'battle' {
    // Rush Zone: 高速反復練習が適している場合
    if (userPreferences.prefersFastPaced && performanceHistory.some(p => p.accuracy > 0.8)) {
      return 'rush'
    }

    // Construction Zone: 丁寧な理解が必要な場合
    if (performanceHistory.some(p => p.accuracy < 0.6) || userPreferences.prefersCollaborative) {
      return 'construction'
    }

    // Battle Zone: 競争によるモチベーション向上が期待できる場合
    if (userPreferences.prefersCompetitive && performanceHistory.some(p => p.engagementLevel > 0.8)) {
      return 'battle'
    }

    // デフォルト: Construction Zone (最も汎用的)
    return 'construction'
  }

  /**
   * ユーティリティメソッド群
   */
  private getRecentAccuracies(userId: string, count: number): number[] {
    // 実装: 最近のaccuracy履歴を取得
    return []
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private getHistoricalAverage(userId: string, grammarTopic: string): number {
    // 実装: 過去の平均パフォーマンスを取得
    return 0
  }

  /**
   * 分析レポート生成
   */
  generateAnalyticsReport(userId: string): object {
    const userAdaptations = this.adaptationHistory.get(userId) || []
    const recentSessions = this.getUserActiveSessions(userId)

    return {
      totalSessions: recentSessions.length,
      adaptationCount: userAdaptations.length,
      mostUsedZone: this.getMostUsedZone(recentSessions),
      averagePerformance: this.calculateAveragePerformance(recentSessions),
      adaptationEffectiveness: this.calculateAdaptationEffectiveness(userAdaptations),
      recommendations: this.generateRecommendations(recentSessions, userAdaptations)
    }
  }

  private getMostUsedZone(sessions: LearningSession[]): string {
    const zoneCounts = sessions.reduce((acc, session) => {
      acc[session.zoneType] = (acc[session.zoneType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(zoneCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'construction'
  }

  private calculateAveragePerformance(sessions: LearningSession[]): any {
    if (sessions.length === 0) return {}

    const totals = sessions.reduce((acc, session) => {
      acc.accuracy += session.performance.accuracy
      acc.speed += session.performance.speed
      acc.consistency += session.performance.consistency
      acc.engagement += session.performance.engagementLevel
      return acc
    }, { accuracy: 0, speed: 0, consistency: 0, engagement: 0 })

    return {
      accuracy: totals.accuracy / sessions.length,
      speed: totals.speed / sessions.length,
      consistency: totals.consistency / sessions.length,
      engagement: totals.engagement / sessions.length
    }
  }

  private calculateAdaptationEffectiveness(adaptations: AdaptationRecord[]): number {
    if (adaptations.length === 0) return 0
    
    const totalEffectiveness = adaptations.reduce((sum, adaptation) => sum + adaptation.effectiveness, 0)
    return totalEffectiveness / adaptations.length
  }

  private generateRecommendations(sessions: LearningSession[], adaptations: AdaptationRecord[]): string[] {
    const recommendations: string[] = []

    if (sessions.length === 0) {
      recommendations.push('まずは Construction Zone から始めることをお勧めします')
      return recommendations
    }

    const avgAccuracy = sessions.reduce((sum, s) => sum + s.performance.accuracy, 0) / sessions.length

    if (avgAccuracy > 0.9) {
      recommendations.push('素晴らしい成績です！Rush Zone で速度向上に挑戦してみましょう')
    } else if (avgAccuracy < 0.6) {
      recommendations.push('Construction Zone で基礎をしっかり固めることをお勧めします')
    }

    const mostCommonAdaptation = adaptations.reduce((acc, adaptation) => {
      acc[adaptation.adaptationType] = (acc[adaptation.adaptationType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topAdaptation = Object.entries(mostCommonAdaptation)
      .sort(([, a], [, b]) => b - a)[0]?.[0]

    if (topAdaptation === 'difficulty') {
      recommendations.push('難易度調整が頻繁に行われています。一定のペースで学習を続けましょう')
    }

    return recommendations
  }
}

// シングルトンインスタンス
export const multiLayerEngine = new MultiLayerLearningEngine()