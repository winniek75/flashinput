import { difficultyManager } from './difficultyManager'
import type { GameParameters, DifficultyConfig } from './difficultyManager'
import logger from '@/utils/logger'

/**
 * Game Migration Helper
 * Helps migrate existing games to use the new difficulty management system
 */
export class GameMigrationHelper {
  // Legacy difficulty settings mapping
  private legacyMappings = new Map<string, LegacyGameMapping>([
    ['pronunciation_trainer', {
      component: 'CvPronunciationTrainer',
      legacyProps: ['difficulty', 'timeLimit', 'attempts'],
      parameterMapping: {
        'difficulty': 'vocabularyLevel',
        'timeLimit': 'timeLimit',
        'attempts': 'retryLimit'
      }
    }],
    ['word_rush', {
      component: 'WordRushGame', 
      legacyProps: ['difficulty', 'gameMode', 'timeLimit'],
      parameterMapping: {
        'difficulty': 'vocabularyLevel',
        'timeLimit': 'timeLimit',
        'gameMode': 'conceptDensity'
      }
    }],
    ['grammar_puzzle_cascade', {
      component: 'GrammarPuzzleCascadeGame',
      legacyProps: ['level', 'complexity', 'hints'],
      parameterMapping: {
        'level': 'problemCount',
        'complexity': 'grammarComplexity', 
        'hints': 'hintAvailability'
      }
    }],
    ['pattern_hunter', {
      component: 'PatternHunterGame',
      legacyProps: ['difficulty', 'patternCount', 'timeLimit'],
      parameterMapping: {
        'difficulty': 'grammarComplexity',
        'patternCount': 'problemCount',
        'timeLimit': 'timeLimit'
      }
    }],
    ['phonics_training_hub', {
      component: 'PhonicsTrainingHub',
      legacyProps: ['stage', 'supportLevel', 'repeatCount'],
      parameterMapping: {
        'stage': 'vocabularyLevel',
        'supportLevel': 'hintAvailability',
        'repeatCount': 'retryLimit'
      }
    }],
    ['true_sound_impact', {
      component: 'TrueSoundImpact',
      legacyProps: ['difficulty', 'soundComplexity', 'speed'],
      parameterMapping: {
        'difficulty': 'conceptDensity',
        'soundComplexity': 'grammarComplexity',
        'speed': 'timeLimit'
      }
    }]
  ])

  constructor() {
    logger.log('Game Migration Helper initialized')
  }

  /**
   * Migrate a game component to use new difficulty system
   */
  public async migrateGameComponent(
    gameId: string,
    playerId: string,
    playerLevel: number,
    legacySettings?: Record<string, any>
  ): Promise<MigrationResult> {
    try {
      // Get mapping for this game
      const mapping = this.legacyMappings.get(gameId)
      if (!mapping) {
        return {
          success: false,
          error: `No migration mapping found for game: ${gameId}`,
          gameId,
          migratedParameters: null
        }
      }

      // Get new parameters from difficulty manager
      const newParameters = await difficultyManager.getGameParameters(gameId, playerId, playerLevel)

      // Apply legacy settings if provided
      if (legacySettings) {
        this.applyLegacySettingsOverrides(newParameters, legacySettings, mapping)
      }

      // Log migration
      logger.log(`[Migration] ${gameId}: Legacy → New System`, {
        legacy: legacySettings,
        new: newParameters
      })

      return {
        success: true,
        gameId,
        migratedParameters: newParameters,
        legacySettingsApplied: legacySettings || {},
        migrationMapping: mapping
      }
    } catch (error) {
      logger.error(`Migration failed for ${gameId}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        gameId,
        migratedParameters: null
      }
    }
  }

  /**
   * Create wrapper function for legacy game initialization
   */
  public createLegacyWrapper(gameId: string): LegacyGameWrapper {
    return {
      async initializeGame(playerId: string, playerLevel: number, legacySettings?: any) {
        const migration = await this.migrateGameComponent(gameId, playerId, playerLevel, legacySettings)
        
        if (!migration.success) {
          throw new Error(`Game migration failed: ${migration.error}`)
        }

        return {
          gameParameters: migration.migratedParameters!,
          legacyCompatibility: this.createLegacyCompatibilityLayer(gameId, migration.migratedParameters!)
        }
      },

      recordGameResults: async (playerId: string, results: any) => {
        // Convert legacy results format to new format
        const convertedResults = this.convertLegacyResults(gameId, results)
        await difficultyManager.recordSessionResults(gameId, playerId, convertedResults)
      },

      getLegacyDifficultyName: (parameters: GameParameters) => {
        return this.getLegacyDifficultyName(gameId, parameters)
      }
    }
  }

  /**
   * Apply legacy settings as overrides to new parameters
   */
  private applyLegacySettingsOverrides(
    newParameters: GameParameters,
    legacySettings: Record<string, any>,
    mapping: LegacyGameMapping
  ): void {
    Object.entries(legacySettings).forEach(([legacyKey, value]) => {
      const newKey = mapping.parameterMapping[legacyKey]
      if (newKey && newKey in newParameters) {
        // Convert legacy values to new format
        const convertedValue = this.convertLegacyValue(legacyKey, value, newKey)
        if (convertedValue !== null) {
          (newParameters as any)[newKey] = convertedValue
        }
      }
    })
  }

  /**
   * Convert legacy value to new format
   */
  private convertLegacyValue(legacyKey: string, legacyValue: any, newKey: string): any {
    // Handle difficulty level conversions
    if (legacyKey === 'difficulty' && newKey === 'vocabularyLevel') {
      const difficultyMap: Record<string, string> = {
        'easy': 'beginner',
        'normal': 'intermediate', 
        'hard': 'advanced',
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
      }
      return difficultyMap[legacyValue] || 'intermediate'
    }

    // Handle complexity conversions
    if (legacyKey === 'complexity' && newKey === 'grammarComplexity') {
      const complexityMap: Record<string, string> = {
        'simple': 'simple',
        'normal': 'moderate',
        'complex': 'complex',
        'easy': 'simple',
        'medium': 'moderate',
        'hard': 'complex'
      }
      return complexityMap[legacyValue] || 'moderate'
    }

    // Handle hint/support level conversions (percentage)
    if ((legacyKey === 'hints' || legacyKey === 'supportLevel') && newKey === 'hintAvailability') {
      if (typeof legacyValue === 'boolean') {
        return legacyValue ? 100 : 0
      }
      if (typeof legacyValue === 'string') {
        const levelMap: Record<string, number> = {
          'none': 0,
          'low': 25,
          'medium': 50,
          'high': 75,
          'full': 100
        }
        return levelMap[legacyValue] ?? 50
      }
      if (typeof legacyValue === 'number') {
        // If it's already a percentage (0-100) or needs scaling
        return legacyValue > 1 ? legacyValue : legacyValue * 100
      }
    }

    // Handle time limit conversions (ensure milliseconds)
    if (legacyKey === 'timeLimit' && newKey === 'timeLimit') {
      if (typeof legacyValue === 'number') {
        // If value is likely in seconds (< 1000), convert to milliseconds
        return legacyValue < 1000 ? legacyValue * 1000 : legacyValue
      }
    }

    // Handle count/level conversions
    if ((legacyKey === 'level' || legacyKey === 'patternCount') && newKey === 'problemCount') {
      return Math.max(1, Math.min(20, Number(legacyValue) || 10))
    }

    // Handle attempts/retry conversions
    if ((legacyKey === 'attempts' || legacyKey === 'repeatCount') && newKey === 'retryLimit') {
      return Math.max(1, Math.min(10, Number(legacyValue) || 3))
    }

    // Handle mode/density conversions
    if (legacyKey === 'gameMode' && newKey === 'conceptDensity') {
      const modeMap: Record<string, number> = {
        'relaxed': 0.5,
        'normal': 1.0,
        'intense': 1.5,
        'blitz': 2.0
      }
      return modeMap[legacyValue] || 1.0
    }

    // Handle speed/time conversions (inverted)
    if (legacyKey === 'speed' && newKey === 'timeLimit') {
      const speedMap: Record<string, number> = {
        'slow': 60000,
        'normal': 30000,
        'fast': 15000,
        'blitz': 10000
      }
      if (typeof legacyValue === 'string') {
        return speedMap[legacyValue] || 30000
      }
      if (typeof legacyValue === 'number') {
        // Higher speed = lower time limit
        return Math.max(5000, 60000 / legacyValue)
      }
    }

    // Default: return as-is if it's a compatible type
    return legacyValue
  }

  /**
   * Convert legacy game results to new format
   */
  private convertLegacyResults(gameId: string, legacyResults: any): any {
    // Common legacy result properties
    const timestamp = Date.now()
    const sessionId = `legacy_${gameId}_${timestamp}`

    // Extract common metrics from legacy results
    const score = legacyResults.score || legacyResults.totalScore || 0
    const correct = legacyResults.correct || legacyResults.correctAnswers || 0
    const total = legacyResults.total || legacyResults.totalQuestions || legacyResults.attempts || 1
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const timeSpent = legacyResults.timeSpent || legacyResults.duration || legacyResults.time || 0

    // Create new format session result
    return {
      sessionId,
      timestamp,
      gameId,
      parameters: {}, // Will be filled by calling code
      results: {
        totalProblems: total,
        correctAnswers: correct,
        timeSpent: timeSpent,
        hintsUsed: legacyResults.hintsUsed || legacyResults.hints || 0,
        retries: legacyResults.retries || legacyResults.attempts - 1 || 0,
        score: score,
        accuracy: accuracy,
        averageResponseTime: timeSpent / Math.max(1, total),
        conceptsMastered: legacyResults.conceptsMastered || legacyResults.masteredConcepts || [],
        struggledConcepts: legacyResults.struggledConcepts || legacyResults.strugglingConcepts || []
      }
    }
  }

  /**
   * Create legacy compatibility layer
   */
  private createLegacyCompatibilityLayer(gameId: string, parameters: GameParameters): LegacyCompatibilityLayer {
    const mapping = this.legacyMappings.get(gameId)!
    
    return {
      // Convert new parameters back to legacy format for old components
      getLegacyParameter: (legacyKey: string) => {
        const newKey = mapping.parameterMapping[legacyKey]
        if (!newKey || !(newKey in parameters)) return null

        return this.convertNewToLegacyValue(legacyKey, (parameters as any)[newKey], newKey)
      },

      // Get all legacy parameters as object
      getAllLegacyParameters: () => {
        const legacyParams: Record<string, any> = {}
        
        mapping.legacyProps.forEach(legacyKey => {
          const value = this.createLegacyCompatibilityLayer(gameId, parameters).getLegacyParameter(legacyKey)
          if (value !== null) {
            legacyParams[legacyKey] = value
          }
        })

        return legacyParams
      },

      // Check if component supports legacy mode
      supportsLegacyMode: () => true,

      // Get migration info
      getMigrationInfo: () => ({
        gameId,
        component: mapping.component,
        migratedParameters: Object.keys(mapping.parameterMapping),
        timestamp: Date.now()
      })
    }
  }

  /**
   * Convert new parameter value back to legacy format
   */  
  private convertNewToLegacyValue(legacyKey: string, newValue: any, newKey: string): any {
    // Reverse the conversion logic from convertLegacyValue
    
    if (legacyKey === 'difficulty' && newKey === 'vocabularyLevel') {
      const reverseMap: Record<string, string> = {
        'beginner': 'easy',
        'intermediate': 'normal',
        'advanced': 'hard'
      }
      return reverseMap[newValue] || 'normal'
    }

    if (legacyKey === 'complexity' && newKey === 'grammarComplexity') {
      const reverseMap: Record<string, string> = {
        'simple': 'easy',
        'moderate': 'medium', 
        'complex': 'hard'
      }
      return reverseMap[newValue] || 'medium'
    }

    if ((legacyKey === 'hints' || legacyKey === 'supportLevel') && newKey === 'hintAvailability') {
      if (newValue >= 75) return 'high'
      if (newValue >= 50) return 'medium'  
      if (newValue >= 25) return 'low'
      return 'none'
    }

    if (legacyKey === 'timeLimit' && newKey === 'timeLimit') {
      // Convert milliseconds to seconds for legacy components
      return Math.round(newValue / 1000)
    }

    if (legacyKey === 'speed' && newKey === 'timeLimit') {
      // Reverse speed calculation
      if (newValue >= 45000) return 'slow'
      if (newValue >= 20000) return 'normal'
      if (newValue >= 12000) return 'fast'
      return 'blitz'  
    }

    return newValue
  }

  /**
   * Get legacy difficulty name for display
   */
  private getLegacyDifficultyName(gameId: string, parameters: GameParameters): string {
    // Generate a user-friendly difficulty name based on key parameters
    const vocab = parameters.vocabularyLevel
    const grammar = parameters.grammarComplexity
    const hints = parameters.hintAvailability

    if (vocab === 'beginner' && hints >= 80) return 'やさしい'
    if (vocab === 'advanced' && grammar === 'complex' && hints <= 30) return 'エキスパート'
    if (vocab === 'intermediate' && grammar === 'moderate') return 'ふつう'
    if (vocab === 'advanced' || grammar === 'complex') return 'むずかしい'
    
    return 'ふつう'
  }

  /**
   * Batch migrate multiple games
   */
  public async batchMigrateGames(
    games: Array<{ gameId: string, playerId: string, playerLevel: number, legacySettings?: any }>
  ): Promise<BatchMigrationResult> {
    const results: MigrationResult[] = []
    const successful: string[] = []
    const failed: string[] = []

    for (const game of games) {
      const result = await this.migrateGameComponent(
        game.gameId, 
        game.playerId, 
        game.playerLevel, 
        game.legacySettings
      )
      
      results.push(result)
      
      if (result.success) {
        successful.push(game.gameId)
      } else {
        failed.push(game.gameId)
      }
    }

    return {
      totalGames: games.length,
      successful,
      failed,
      results,
      summary: {
        successRate: (successful.length / games.length) * 100,
        mostCommonErrors: this.analyzeMigrationErrors(results)
      }
    }
  }

  /**
   * Get all registered games for migration
   */
  public getRegisteredGames(): string[] {
    return Array.from(this.legacyMappings.keys())
  }

  /**
   * Get migration mapping for a game
   */
  public getMigrationMapping(gameId: string): LegacyGameMapping | null {
    return this.legacyMappings.get(gameId) || null
  }

  /**
   * Analyze common migration errors
   */
  private analyzeMigrationErrors(results: MigrationResult[]): string[] {
    const errorCounts = new Map<string, number>()
    
    results.filter(r => !r.success).forEach(result => {
      const error = result.error || 'Unknown error'
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1)
    })

    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error]) => error)
  }

  /**
   * Generate migration report
   */
  public generateMigrationReport(results: BatchMigrationResult): MigrationReport {
    return {
      timestamp: Date.now(),
      totalGames: results.totalGames,
      successfulMigrations: results.successful.length,
      failedMigrations: results.failed.length,
      successRate: results.summary.successRate,
      gameBreakdown: results.results.map(r => ({
        gameId: r.gameId,
        success: r.success,
        error: r.error,
        parametersCount: r.migratedParameters ? Object.keys(r.migratedParameters).length : 0
      })),
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results)
    }
  }

  private generateRecommendations(results: BatchMigrationResult): string[] {
    const recommendations: string[] = []
    
    if (results.summary.successRate < 80) {
      recommendations.push('Review and update migration mappings for failed games')
    }
    
    if (results.failed.length > 0) {
      recommendations.push('Consider creating fallback configurations for failed migrations')
    }
    
    recommendations.push('Test migrated games thoroughly before production deployment')
    recommendations.push('Monitor game performance metrics after migration')
    
    return recommendations
  }

  private generateNextSteps(results: BatchMigrationResult): string[] {
    const steps: string[] = []
    
    steps.push('Update game components to use migrated parameters')
    steps.push('Remove legacy parameter handling code')
    steps.push('Update documentation to reflect new difficulty system')
    
    if (results.failed.length > 0) {
      steps.push('Address failed migrations and retry')
    }
    
    steps.push('Deploy and monitor in staging environment')
    
    return steps
  }
}

// Types
interface LegacyGameMapping {
  component: string
  legacyProps: string[]
  parameterMapping: Record<string, string>
}

interface MigrationResult {
  success: boolean
  gameId: string
  migratedParameters: GameParameters | null
  error?: string
  legacySettingsApplied?: Record<string, any>
  migrationMapping?: LegacyGameMapping
}

interface BatchMigrationResult {
  totalGames: number
  successful: string[]
  failed: string[]
  results: MigrationResult[]
  summary: {
    successRate: number
    mostCommonErrors: string[]
  }
}

interface LegacyGameWrapper {
  initializeGame(playerId: string, playerLevel: number, legacySettings?: any): Promise<{
    gameParameters: GameParameters
    legacyCompatibility: LegacyCompatibilityLayer
  }>
  recordGameResults(playerId: string, results: any): Promise<void>
  getLegacyDifficultyName(parameters: GameParameters): string
}

interface LegacyCompatibilityLayer {
  getLegacyParameter(legacyKey: string): any
  getAllLegacyParameters(): Record<string, any>
  supportsLegacyMode(): boolean
  getMigrationInfo(): {
    gameId: string
    component: string
    migratedParameters: string[]
    timestamp: number
  }
}

interface MigrationReport {
  timestamp: number
  totalGames: number
  successfulMigrations: number
  failedMigrations: number
  successRate: number
  gameBreakdown: Array<{
    gameId: string
    success: boolean
    error?: string
    parametersCount: number
  }>
  recommendations: string[]
  nextSteps: string[]
}

// Export singleton instance
export const gameMigrationHelper = new GameMigrationHelper()
export default gameMigrationHelper