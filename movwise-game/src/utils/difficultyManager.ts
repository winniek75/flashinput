import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import logger from '@/utils/logger'

// Difficulty management types
export interface DifficultyConfig {
  gameId: string
  baseParameters: GameParameters
  adaptiveSettings: AdaptiveSettings
  playerLevelModifiers: LevelModifierMap
  abTestGroup?: string
}

export interface GameParameters {
  // Core gameplay parameters
  problemCount: number
  timeLimit: number
  hintAvailability: number // 0-100%
  retryLimit: number
  
  // Scoring parameters
  correctAnswerPoints: number
  timeBonus: boolean
  streakMultiplier: boolean
  accuracyThreshold: number // 0-100%
  
  // Content parameters
  vocabularyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  grammarComplexity: 'simple' | 'moderate' | 'complex'
  conceptDensity: number // concepts per minute
  
  // Progression parameters
  difficultyRamp: number // rate of increase 0-100
  adaptiveThreshold: number // success rate to trigger adjustment
  maxAdjustmentStep: number // max difficulty change per adjustment
}

export interface AdaptiveSettings {
  enabled: boolean
  adjustmentFrequency: number // how often to check for adjustments (problems)
  successRateWindow: number // problems to consider for success rate
  minSuccessRate: number // 0-100%
  targetSuccessRate: number // 0-100%
  maxSuccessRate: number // 0-100%
  cooldownPeriod: number // minimum problems between adjustments
}

export interface LevelModifierMap {
  [playerLevel: number]: LevelModifier
}

export interface LevelModifier {
  level: number
  parametersMultiplier: ParametersMultiplier
  unlockFeatures: string[]
  recommendedSettings: Partial<GameParameters>
}

export interface ParametersMultiplier {
  problemCount: number
  timeLimit: number
  correctAnswerPoints: number
  conceptDensity: number
  difficultyRamp: number
}

// Player performance tracking
export interface PlayerPerformance {
  gameId: string
  playerId: string
  currentLevel: number
  recentSessions: GameSession[]
  overallStats: PerformanceStats
  adaptiveHistory: AdaptiveAdjustment[]
}

export interface GameSession {
  sessionId: string
  timestamp: number
  gameId: string
  parameters: GameParameters
  results: SessionResults
  playerFeedback?: PlayerFeedback
}

export interface SessionResults {
  totalProblems: number
  correctAnswers: number
  timeSpent: number
  hintsUsed: number
  retries: number
  score: number
  accuracy: number // 0-100%
  averageResponseTime: number
  conceptsMastered: string[]
  struggledConcepts: string[]
}

export interface PlayerFeedback {
  difficulty: 'too_easy' | 'just_right' | 'too_hard'
  enjoyment: number // 1-5 scale
  engagement: number // 1-5 scale
  suggestion?: string
}

export interface PerformanceStats {
  totalSessions: number
  averageAccuracy: number
  averageScore: number
  learningVelocity: number
  strongAreas: string[]
  improvementAreas: string[]
  preferredDifficulty: string
  consistencyScore: number // how consistent performance is
}

export interface AdaptiveAdjustment {
  timestamp: number
  gameId: string
  reason: AdjustmentReason
  oldParameters: Partial<GameParameters>
  newParameters: Partial<GameParameters>
  playerPerformance: number // success rate that triggered adjustment
  effectiveness?: number // measured after adjustment
}

export enum AdjustmentReason {
  LOW_SUCCESS_RATE = 'low_success_rate',
  HIGH_SUCCESS_RATE = 'high_success_rate',
  PLAYER_FEEDBACK = 'player_feedback',
  LEVEL_UP = 'level_up',
  MANUAL_OVERRIDE = 'manual_override',
  AB_TEST = 'ab_test'
}

// A/B Testing types
export interface ABTestConfig {
  testId: string
  name: string
  description: string
  active: boolean
  startDate: Date
  endDate: Date
  targetGames: string[]
  variants: ABTestVariant[]
  metrics: string[]
  sampleSize: number
  currentParticipants: number
}

export interface ABTestVariant {
  id: string
  name: string
  weight: number // 0-100, percentage of traffic
  parameterOverrides: Partial<GameParameters>
  description: string
}

export interface ABTestResult {
  testId: string
  variantId: string
  participants: number
  metrics: Record<string, number>
  significance: number
  winnerProbability: number
}

// Debug mode types
export interface DebugConfig {
  enabled: boolean
  logLevel: 'none' | 'basic' | 'detailed' | 'verbose'
  parameterOverrides: Record<string, any>
  simulationMode: boolean
  playerLevelOverride?: number
  forceAdjustment?: boolean
}

/**
 * Dynamic Difficulty Manager
 * Manages adaptive difficulty adjustment based on player performance
 */
export class DifficultyManager {
  private difficultyConfigs = ref<Map<string, DifficultyConfig>>(new Map())
  private playerPerformance = useStorage<Map<string, PlayerPerformance>>('language_galaxy_performance', new Map())
  private abTests = ref<Map<string, ABTestConfig>>(new Map())
  private debugConfig = ref<DebugConfig>({
    enabled: false,
    logLevel: 'none',
    parameterOverrides: {},
    simulationMode: false
  })
  
  private adjustmentCooldowns = ref<Map<string, number>>(new Map())
  private gameBalance = ref<any>({})

  constructor() {
    this.initializeDifficultySystem()
    this.loadGameBalance()
    this.setupPerformanceTracking()
  }

  /**
   * Initialize difficulty system
   */
  private async initializeDifficultySystem(): Promise<void> {
    try {
      // Load game balance configuration
      await this.loadGameBalance()
      
      // Initialize default difficulty configs for all games
      await this.initializeGameConfigs()
      
      // Setup watchers for real-time adjustments
      this.setupWatchers()
      
      logger.log('Difficulty Manager initialized')
    } catch (error) {
      logger.error('Failed to initialize difficulty system:', error)
    }
  }

  /**
   * Get optimized parameters for a game session
   */
  public async getGameParameters(
    gameId: string, 
    playerId: string, 
    playerLevel: number
  ): Promise<GameParameters> {
    const config = this.difficultyConfigs.value.get(gameId)
    if (!config) {
      throw new Error(`No difficulty config found for game: ${gameId}`)
    }

    // Get base parameters
    let parameters = { ...config.baseParameters }

    // Apply player level modifiers
    parameters = this.applyLevelModifiers(parameters, playerLevel, config.playerLevelModifiers)

    // Apply adaptive adjustments based on performance
    if (config.adaptiveSettings.enabled) {
      parameters = await this.applyAdaptiveAdjustments(parameters, gameId, playerId)
    }

    // Apply A/B test overrides if player is in a test
    parameters = this.applyABTestOverrides(parameters, gameId, playerId)

    // Apply debug overrides if enabled
    if (this.debugConfig.value.enabled) {
      parameters = this.applyDebugOverrides(parameters)
    }

    this.logParameterSelection(gameId, playerId, parameters)
    
    return parameters
  }

  /**
   * Record game session results and update player performance
   */
  public async recordSessionResults(
    gameId: string,
    playerId: string,
    sessionResults: GameSession
  ): Promise<void> {
    // Get or create player performance record
    const performanceKey = `${playerId}_${gameId}`
    let performance = this.playerPerformance.value.get(performanceKey)
    
    if (!performance) {
      performance = this.createInitialPerformance(gameId, playerId)
    }

    // Add session to recent sessions
    performance.recentSessions.push(sessionResults)
    
    // Keep only recent sessions (last 20)
    if (performance.recentSessions.length > 20) {
      performance.recentSessions = performance.recentSessions.slice(-20)
    }

    // Update overall stats
    performance.overallStats = this.calculateOverallStats(performance.recentSessions)

    // Check if adaptive adjustment is needed
    const config = this.difficultyConfigs.value.get(gameId)
    if (config?.adaptiveSettings.enabled) {
      await this.checkAdaptiveAdjustment(gameId, playerId, performance)
    }

    // Store updated performance
    this.playerPerformance.value.set(performanceKey, performance)

    this.logSessionRecorded(gameId, playerId, sessionResults)
  }

  /**
   * Apply level-based modifiers to parameters
   */
  private applyLevelModifiers(
    parameters: GameParameters, 
    playerLevel: number, 
    modifiers: LevelModifierMap
  ): GameParameters {
    const modifier = this.findBestLevelModifier(playerLevel, modifiers)
    if (!modifier) return parameters

    const modified = { ...parameters }
    const multipliers = modifier.parametersMultiplier

    modified.problemCount = Math.round(parameters.problemCount * multipliers.problemCount)
    modified.timeLimit = Math.round(parameters.timeLimit * multipliers.timeLimit)
    modified.correctAnswerPoints = Math.round(parameters.correctAnswerPoints * multipliers.correctAnswerPoints)
    modified.conceptDensity = parameters.conceptDensity * multipliers.conceptDensity
    modified.difficultyRamp = Math.min(100, parameters.difficultyRamp * multipliers.difficultyRamp)

    // Apply recommended settings
    Object.assign(modified, modifier.recommendedSettings)

    return modified
  }

  /**
   * Apply adaptive adjustments based on player performance
   */
  private async applyAdaptiveAdjustments(
    parameters: GameParameters,
    gameId: string,
    playerId: string
  ): Promise<GameParameters> {
    const performanceKey = `${playerId}_${gameId}`
    const performance = this.playerPerformance.value.get(performanceKey)
    
    if (!performance || performance.recentSessions.length < 3) {
      return parameters // Not enough data for adjustment
    }

    const config = this.difficultyConfigs.value.get(gameId)!
    const adaptive = config.adaptiveSettings

    // Check cooldown
    const cooldownKey = `${gameId}_${playerId}`
    const lastAdjustment = this.adjustmentCooldowns.value.get(cooldownKey) || 0
    const sessionCount = performance.recentSessions.length
    
    if (sessionCount - lastAdjustment < adaptive.cooldownPeriod) {
      return parameters // Still in cooldown
    }

    // Calculate recent success rate
    const recentSessions = performance.recentSessions.slice(-adaptive.successRateWindow)
    const successRate = this.calculateSuccessRate(recentSessions)

    let adjustmentNeeded = false
    let adjustmentReason: AdjustmentReason
    const adjustments: Partial<GameParameters> = {}

    // Check if adjustment is needed
    if (successRate < adaptive.minSuccessRate) {
      // Too difficult - make easier
      adjustmentNeeded = true
      adjustmentReason = AdjustmentReason.LOW_SUCCESS_RATE
      
      adjustments.timeLimit = Math.min(
        parameters.timeLimit * 1.2,
        parameters.timeLimit + (parameters.timeLimit * parameters.maxAdjustmentStep / 100)
      )
      
      adjustments.hintAvailability = Math.min(100, parameters.hintAvailability + 10)
      
      if (parameters.problemCount > 3) {
        adjustments.problemCount = Math.max(3, parameters.problemCount - 1)
      }
      
    } else if (successRate > adaptive.maxSuccessRate) {
      // Too easy - make harder
      adjustmentNeeded = true
      adjustmentReason = AdjustmentReason.HIGH_SUCCESS_RATE
      
      adjustments.timeLimit = Math.max(
        parameters.timeLimit * 0.9,
        parameters.timeLimit - (parameters.timeLimit * parameters.maxAdjustmentStep / 100)
      )
      
      adjustments.hintAvailability = Math.max(0, parameters.hintAvailability - 10)
      adjustments.problemCount = parameters.problemCount + 1
      adjustments.conceptDensity = Math.min(5, parameters.conceptDensity + 0.5)
    }

    if (adjustmentNeeded) {
      const oldParameters = { ...parameters }
      const newParameters = { ...parameters, ...adjustments }
      
      // Record adjustment
      const adjustment: AdaptiveAdjustment = {
        timestamp: Date.now(),
        gameId,
        reason: adjustmentReason!,
        oldParameters,
        newParameters: adjustments,
        playerPerformance: successRate
      }
      
      performance.adaptiveHistory.push(adjustment)
      
      // Set cooldown
      this.adjustmentCooldowns.value.set(cooldownKey, sessionCount)
      
      this.logAdaptiveAdjustment(gameId, playerId, adjustment)
      
      return newParameters
    }

    return parameters
  }

  /**
   * Apply A/B test parameter overrides
   */
  private applyABTestOverrides(
    parameters: GameParameters,
    gameId: string,
    playerId: string
  ): GameParameters {
    // Find active A/B tests for this game
    const activeTests = Array.from(this.abTests.value.values()).filter(test => 
      test.active && 
      test.targetGames.includes(gameId) &&
      new Date() >= test.startDate &&
      new Date() <= test.endDate
    )

    if (activeTests.length === 0) return parameters

    // Get player's test variant assignment
    const playerHash = this.hashString(`${playerId}_${gameId}`)
    
    for (const test of activeTests) {
      const variant = this.assignPlayerToVariant(playerHash, test)
      if (variant && Object.keys(variant.parameterOverrides).length > 0) {
        this.logABTestAssignment(gameId, playerId, test.testId, variant.id)
        return { ...parameters, ...variant.parameterOverrides }
      }
    }

    return parameters
  }

  /**
   * Apply debug mode parameter overrides
   */
  private applyDebugOverrides(parameters: GameParameters): GameParameters {
    if (!this.debugConfig.value.enabled) return parameters

    const overrides = this.debugConfig.value.parameterOverrides
    const modified = { ...parameters }

    Object.keys(overrides).forEach(key => {
      if (key in modified) {
        (modified as any)[key] = overrides[key]
      }
    })

    return modified
  }

  /**
   * Create and start A/B test
   */
  public createABTest(config: Omit<ABTestConfig, 'currentParticipants'>): void {
    const testConfig: ABTestConfig = {
      ...config,
      currentParticipants: 0
    }
    
    this.abTests.value.set(config.testId, testConfig)
    this.logABTestCreated(config.testId)
  }

  /**
   * Stop A/B test and get results
   */
  public async stopABTest(testId: string): Promise<ABTestResult[]> {
    const test = this.abTests.value.get(testId)
    if (!test) throw new Error(`A/B test ${testId} not found`)

    test.active = false
    
    // Analyze results for each variant
    const results: ABTestResult[] = []
    
    for (const variant of test.variants) {
      const result = await this.analyzeABTestResults(testId, variant.id)
      results.push(result)
    }

    this.logABTestStopped(testId, results)
    return results
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean, config?: Partial<DebugConfig>): void {
    this.debugConfig.value.enabled = enabled
    
    if (config) {
      Object.assign(this.debugConfig.value, config)
    }

    this.logDebugModeChanged(enabled)
  }

  /**
   * Get player performance analytics
   */
  public getPlayerAnalytics(playerId: string, gameId?: string): PlayerPerformance[] {
    const analytics: PlayerPerformance[] = []
    
    for (const [key, performance] of this.playerPerformance.value.entries()) {
      const [pid, gid] = key.split('_')
      
      if (pid === playerId && (!gameId || gid === gameId)) {
        analytics.push(performance)
      }
    }
    
    return analytics
  }

  /**
   * Force difficulty adjustment for testing
   */
  public forceAdjustment(
    gameId: string,
    playerId: string,
    adjustments: Partial<GameParameters>,
    reason: string = 'Manual override'
  ): void {
    const config = this.difficultyConfigs.value.get(gameId)
    if (!config) return

    const performanceKey = `${playerId}_${gameId}`
    const performance = this.playerPerformance.value.get(performanceKey)
    
    if (performance) {
      const adjustment: AdaptiveAdjustment = {
        timestamp: Date.now(),
        gameId,
        reason: AdjustmentReason.MANUAL_OVERRIDE,
        oldParameters: config.baseParameters,
        newParameters: adjustments,
        playerPerformance: 0
      }
      
      performance.adaptiveHistory.push(adjustment)
      this.playerPerformance.value.set(performanceKey, performance)
    }

    // Apply adjustments to base config temporarily
    Object.assign(config.baseParameters, adjustments)
    
    this.logManualAdjustment(gameId, playerId, adjustments, reason)
  }

  // Helper methods
  private async loadGameBalance(): Promise<void> {
    try {
      const response = await fetch('/src/config/gameBalance.json')
      this.gameBalance.value = await response.json()
    } catch (error) {
      logger.warn('Could not load game balance config, using defaults')
      this.gameBalance.value = this.getDefaultGameBalance()
    }
  }

  private async initializeGameConfigs(): Promise<void> {
    const games = this.gameBalance.value.games || []
    
    for (const game of games) {
      const config: DifficultyConfig = {
        gameId: game.id,
        baseParameters: game.baseParameters,
        adaptiveSettings: game.adaptiveSettings || this.getDefaultAdaptiveSettings(),
        playerLevelModifiers: game.levelModifiers || this.getDefaultLevelModifiers()
      }
      
      this.difficultyConfigs.value.set(game.id, config)
    }
  }

  private setupWatchers(): void {
    // Watch for performance changes to trigger real-time adjustments
    watch(this.playerPerformance, () => {
      // Could implement real-time adjustment logic here
    }, { deep: true })
  }

  private setupPerformanceTracking(): void {
    // Set up periodic cleanup of old performance data
    setInterval(() => {
      this.cleanupOldPerformanceData()
    }, 24 * 60 * 60 * 1000) // Daily cleanup
  }

  private cleanupOldPerformanceData(): void {
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
    
    for (const [key, performance] of this.playerPerformance.value.entries()) {
      // Remove old sessions
      performance.recentSessions = performance.recentSessions.filter(
        session => session.timestamp > cutoffDate
      )
      
      // Remove old adjustments
      performance.adaptiveHistory = performance.adaptiveHistory.filter(
        adjustment => adjustment.timestamp > cutoffDate
      )
      
      // If no recent data, remove the entire record
      if (performance.recentSessions.length === 0) {
        this.playerPerformance.value.delete(key)
      }
    }
  }

  private createInitialPerformance(gameId: string, playerId: string): PlayerPerformance {
    return {
      gameId,
      playerId,
      currentLevel: 1,
      recentSessions: [],
      overallStats: {
        totalSessions: 0,
        averageAccuracy: 0,
        averageScore: 0,
        learningVelocity: 0,
        strongAreas: [],
        improvementAreas: [],
        preferredDifficulty: 'balanced',
        consistencyScore: 0
      },
      adaptiveHistory: []
    }
  }

  private calculateOverallStats(sessions: GameSession[]): PerformanceStats {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        averageScore: 0,
        learningVelocity: 0,
        strongAreas: [],
        improvementAreas: [],
        preferredDifficulty: 'balanced',
        consistencyScore: 0
      }
    }

    const totalSessions = sessions.length
    const averageAccuracy = sessions.reduce((sum, s) => sum + s.results.accuracy, 0) / totalSessions
    const averageScore = sessions.reduce((sum, s) => sum + s.results.score, 0) / totalSessions
    
    // Calculate learning velocity (improvement over time)
    const recentAccuracy = sessions.slice(-5).reduce((sum, s) => sum + s.results.accuracy, 0) / Math.min(5, totalSessions)
    const earlierAccuracy = sessions.slice(0, 5).reduce((sum, s) => sum + s.results.accuracy, 0) / Math.min(5, totalSessions)
    const learningVelocity = recentAccuracy - earlierAccuracy

    // Analyze strong and improvement areas
    const conceptPerformance = new Map<string, number[]>()
    sessions.forEach(session => {
      session.results.conceptsMastered.forEach(concept => {
        if (!conceptPerformance.has(concept)) conceptPerformance.set(concept, [])
        conceptPerformance.get(concept)!.push(1)
      })
      
      session.results.struggledConcepts.forEach(concept => {
        if (!conceptPerformance.has(concept)) conceptPerformance.set(concept, [])
        conceptPerformance.get(concept)!.push(0)
      })
    })

    const strongAreas: string[] = []
    const improvementAreas: string[] = []
    
    conceptPerformance.forEach((scores, concept) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      if (average >= 0.8) {
        strongAreas.push(concept)
      } else if (average <= 0.4) {
        improvementAreas.push(concept)
      }
    })

    // Calculate consistency score
    const accuracies = sessions.map(s => s.results.accuracy)
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - averageAccuracy, 2), 0) / totalSessions
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance))

    return {
      totalSessions,
      averageAccuracy,
      averageScore,
      learningVelocity,
      strongAreas,
      improvementAreas,
      preferredDifficulty: this.determinePreferredDifficulty(sessions),
      consistencyScore
    }
  }

  private determinePreferredDifficulty(sessions: GameSession[]): string {
    // Analyze which difficulty settings led to best engagement
    // This is a simplified implementation
    const recentSessions = sessions.slice(-10)
    const averageAccuracy = recentSessions.reduce((sum, s) => sum + s.results.accuracy, 0) / recentSessions.length
    
    if (averageAccuracy > 90) return 'harder'
    if (averageAccuracy < 60) return 'easier'
    return 'balanced'
  }

  private calculateSuccessRate(sessions: GameSession[]): number {
    if (sessions.length === 0) return 50
    
    return sessions.reduce((sum, session) => sum + session.results.accuracy, 0) / sessions.length
  }

  private findBestLevelModifier(playerLevel: number, modifiers: LevelModifierMap): LevelModifier | null {
    const levels = Object.keys(modifiers).map(Number).sort((a, b) => b - a)
    
    for (const level of levels) {
      if (playerLevel >= level) {
        return modifiers[level]
      }
    }
    
    return null
  }

  private async checkAdaptiveAdjustment(
    gameId: string,
    playerId: string,
    performance: PlayerPerformance
  ): Promise<void> {
    const config = this.difficultyConfigs.value.get(gameId)!
    const adaptive = config.adaptiveSettings
    
    if (performance.recentSessions.length % adaptive.adjustmentFrequency === 0) {
      // Time for a potential adjustment check
      const successRate = this.calculateSuccessRate(
        performance.recentSessions.slice(-adaptive.successRateWindow)
      )
      
      // This will be handled in the next parameter request
      this.logAdjustmentCheck(gameId, playerId, successRate)
    }
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  private assignPlayerToVariant(playerHash: number, test: ABTestConfig): ABTestVariant | null {
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0)
    const normalizedHash = playerHash % 100
    
    let cumulativeWeight = 0
    for (const variant of test.variants) {
      cumulativeWeight += (variant.weight / totalWeight) * 100
      if (normalizedHash < cumulativeWeight) {
        return variant
      }
    }
    
    return test.variants[0] // Fallback to first variant
  }

  private async analyzeABTestResults(testId: string, variantId: string): Promise<ABTestResult> {
    // This would analyze actual performance data for the A/B test
    // Simplified implementation for now
    return {
      testId,
      variantId,
      participants: 100,
      metrics: {
        accuracy: 75,
        engagement: 80,
        completion: 90
      },
      significance: 0.95,
      winnerProbability: 0.65
    }
  }

  private getDefaultGameBalance(): any {
    return {
      games: [],
      globalSettings: {
        maxDifficultyLevel: 10,
        adaptiveAdjustmentRate: 0.1,
        abTestParticipationRate: 0.2
      }
    }
  }

  private getDefaultAdaptiveSettings(): AdaptiveSettings {
    return {
      enabled: true,
      adjustmentFrequency: 5,
      successRateWindow: 10,
      minSuccessRate: 60,
      targetSuccessRate: 75,
      maxSuccessRate: 90,
      cooldownPeriod: 3
    }
  }

  private getDefaultLevelModifiers(): LevelModifierMap {
    return {
      1: {
        level: 1,
        parametersMultiplier: {
          problemCount: 0.8,
          timeLimit: 1.5,
          correctAnswerPoints: 1.0,
          conceptDensity: 0.5,
          difficultyRamp: 0.5
        },
        unlockFeatures: ['hints', 'slow_mode'],
        recommendedSettings: {
          hintAvailability: 100,
          retryLimit: 3
        }
      },
      5: {
        level: 5,
        parametersMultiplier: {
          problemCount: 1.0,
          timeLimit: 1.0,
          correctAnswerPoints: 1.0,
          conceptDensity: 1.0,
          difficultyRamp: 1.0
        },
        unlockFeatures: ['time_bonus', 'streak_multiplier'],
        recommendedSettings: {}
      },
      10: {
        level: 10,
        parametersMultiplier: {
          problemCount: 1.2,
          timeLimit: 0.8,
          correctAnswerPoints: 1.5,
          conceptDensity: 1.5,
          difficultyRamp: 1.5
        },
        unlockFeatures: ['advanced_challenges', 'competitive_mode'],
        recommendedSettings: {
          hintAvailability: 50
        }
      }
    }
  }

  // Logging methods
  private logParameterSelection(gameId: string, playerId: string, parameters: GameParameters): void {
    if (this.debugConfig.value.logLevel !== 'none') {
      logger.log(`[DifficultyManager] Parameters for ${gameId}:${playerId}`, parameters)
    }
  }

  private logSessionRecorded(gameId: string, playerId: string, session: GameSession): void {
    if (this.debugConfig.value.logLevel === 'detailed' || this.debugConfig.value.logLevel === 'verbose') {
      logger.log(`[DifficultyManager] Session recorded for ${gameId}:${playerId}`, session.results)
    }
  }

  private logAdaptiveAdjustment(gameId: string, playerId: string, adjustment: AdaptiveAdjustment): void {
    if (this.debugConfig.value.logLevel !== 'none') {
      logger.log(`[DifficultyManager] Adaptive adjustment for ${gameId}:${playerId}`, adjustment)
    }
  }

  private logABTestAssignment(gameId: string, playerId: string, testId: string, variantId: string): void {
    if (this.debugConfig.value.logLevel === 'detailed' || this.debugConfig.value.logLevel === 'verbose') {
      logger.log(`[DifficultyManager] A/B test assignment: ${playerId} → ${testId}:${variantId}`)
    }
  }

  private logABTestCreated(testId: string): void {
    logger.log(`[DifficultyManager] A/B test created: ${testId}`)
  }

  private logABTestStopped(testId: string, results: ABTestResult[]): void {
    logger.log(`[DifficultyManager] A/B test stopped: ${testId}`, results)
  }

  private logDebugModeChanged(enabled: boolean): void {
    logger.log(`[DifficultyManager] Debug mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  private logManualAdjustment(gameId: string, playerId: string, adjustments: Partial<GameParameters>, reason: string): void {
    logger.log(`[DifficultyManager] Manual adjustment for ${gameId}:${playerId}`, { adjustments, reason })
  }

  private logAdjustmentCheck(gameId: string, playerId: string, successRate: number): void {
    if (this.debugConfig.value.logLevel === 'verbose') {
      logger.log(`[DifficultyManager] Adjustment check for ${gameId}:${playerId}: ${successRate}% success rate`)
    }
  }

  // Public getters
  public get configurations(): Map<string, DifficultyConfig> {
    return this.difficultyConfigs.value
  }

  public get activeABTests(): ABTestConfig[] {
    return Array.from(this.abTests.value.values()).filter(test => test.active)
  }

  public get debugSettings(): DebugConfig {
    return this.debugConfig.value
  }

  public getGameConfig(gameId: string): DifficultyConfig | undefined {
    return this.difficultyConfigs.value.get(gameId)
  }

  public updateGameConfig(gameId: string, config: Partial<DifficultyConfig>): void {
    const existingConfig = this.difficultyConfigs.value.get(gameId)
    if (existingConfig) {
      Object.assign(existingConfig, config)
      this.difficultyConfigs.value.set(gameId, existingConfig)
    }
  }
}

// Export singleton instance
export const difficultyManager = new DifficultyManager()
export default difficultyManager