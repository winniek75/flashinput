import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { difficultyManager } from './difficultyManager'
import type { ABTestConfig, ABTestVariant, ABTestResult, GameParameters } from './difficultyManager'
import logger from '@/utils/logger'

// A/B Test Analytics Types
export interface ABTestMetrics {
  testId: string
  variantId: string
  playerId: string
  gameId: string
  timestamp: number
  sessionData: SessionMetrics
  userBehavior: UserBehaviorMetrics
  performance: PerformanceMetrics
}

export interface SessionMetrics {
  duration: number
  completionRate: number
  accuracy: number
  score: number
  retryCount: number
  hintUsage: number
  quitRate: number
  nextGameRate: number
}

export interface UserBehaviorMetrics {
  clickPattern: string[]
  hesitationTime: number[]
  helpRequestFrequency: number
  feedbackRating?: number
  reportedDifficulty?: 'too_easy' | 'just_right' | 'too_hard'
  engagementScore: number
}

export interface PerformanceMetrics {
  averageResponseTime: number
  accuracyTrend: number[]
  learningCurve: number
  strugglingConcepts: string[]
  masteredConcepts: string[]
  improvementRate: number
}

// Statistical Analysis Types
export interface StatisticalResult {
  testId: string
  metric: string
  variants: VariantComparison[]
  winner?: string
  confidence: number
  pValue: number
  sampleSize: number
  effectSize: number
  recommendation: TestRecommendation
}

export interface VariantComparison {
  variantId: string
  mean: number
  standardDeviation: number
  sampleSize: number
  confidenceInterval: [number, number]
}

export interface TestRecommendation {
  action: 'continue' | 'stop' | 'extend' | 'modify'
  reason: string
  suggestedDuration?: number
  suggestedChanges?: Partial<ABTestConfig>
}

// Real-time Monitoring Types
export interface TestMonitoringConfig {
  testId: string
  alertThresholds: AlertThreshold[]
  monitoringInterval: number
  autoStopConditions: AutoStopCondition[]
  dataBounds: DataBounds
}

export interface AlertThreshold {
  metric: string
  condition: 'above' | 'below' | 'change'
  value: number
  severity: 'info' | 'warning' | 'critical'
}

export interface AutoStopCondition {
  condition: 'significance_reached' | 'sample_size_reached' | 'time_elapsed' | 'adverse_effect'
  threshold: number
  action: 'stop_test' | 'notify_only'
}

export interface DataBounds {
  minSampleSizePerVariant: number
  maxTestDuration: number
  minConfidenceLevel: number
  maxAllowedDropout: number
}

/**
 * A/B Test Manager
 * Manages creation, execution, and analysis of A/B tests for difficulty optimization
 */
export class ABTestManager {
  private testMetrics = useStorage<Map<string, ABTestMetrics[]>>('language_galaxy_ab_metrics', new Map())
  private monitoringConfigs = ref<Map<string, TestMonitoringConfig>>(new Map())
  private testResults = ref<Map<string, StatisticalResult[]>>(new Map())
  private realTimeData = ref<Map<string, any>>(new Map())
  
  private monitoringIntervals = new Map<string, NodeJS.Timeout>()

  constructor() {
    this.initializeABTestSystem()
    this.setupEventListeners()
  }

  /**
   * Initialize A/B test system
   */
  private initializeABTestSystem(): void {
    logger.log('A/B Test Manager initialized')
  }

  /**
   * Create and launch a new A/B test
   */
  public async createABTest(config: Omit<ABTestConfig, 'currentParticipants'>): Promise<boolean> {
    try {
      // Validate test configuration
      const validationResult = this.validateTestConfig(config)
      if (!validationResult.valid) {
        throw new Error(`Invalid test config: ${validationResult.errors.join(', ')}`)
      }

      // Create test in difficulty manager
      difficultyManager.createABTest(config)

      // Setup monitoring
      const monitoringConfig = this.createMonitoringConfig(config)
      this.monitoringConfigs.value.set(config.testId, monitoringConfig)

      // Start real-time monitoring
      this.startTestMonitoring(config.testId)

      logger.log(`A/B test created and launched: ${config.testId}`)
      return true
    } catch (error) {
      logger.error('Failed to create A/B test:', error)
      return false
    }
  }

  /**
   * Record metrics for A/B test participant
   */
  public recordTestMetrics(
    testId: string,
    variantId: string,
    playerId: string,
    gameId: string,
    sessionData: SessionMetrics,
    userBehavior: UserBehaviorMetrics,
    performance: PerformanceMetrics
  ): void {
    const metrics: ABTestMetrics = {
      testId,
      variantId,
      playerId,
      gameId,
      timestamp: Date.now(),
      sessionData,
      userBehavior,
      performance
    }

    // Store metrics
    let testMetricsArray = this.testMetrics.value.get(testId)
    if (!testMetricsArray) {
      testMetricsArray = []
      this.testMetrics.value.set(testId, testMetricsArray)
    }
    testMetricsArray.push(metrics)

    // Update real-time monitoring data
    this.updateRealTimeData(testId, metrics)

    // Check for alerts and auto-stop conditions
    this.checkMonitoringConditions(testId)
  }

  /**
   * Analyze A/B test results
   */
  public async analyzeABTest(testId: string): Promise<StatisticalResult[]> {
    const testMetricsArray = this.testMetrics.value.get(testId)
    if (!testMetricsArray || testMetricsArray.length === 0) {
      throw new Error(`No data found for test: ${testId}`)
    }

    const results: StatisticalResult[] = []
    const metrics = ['accuracy', 'completionRate', 'engagementScore', 'score']

    for (const metric of metrics) {
      const result = await this.performStatisticalAnalysis(testId, metric, testMetricsArray)
      results.push(result)
    }

    // Store results
    this.testResults.value.set(testId, results)

    return results
  }

  /**
   * Get real-time test dashboard data
   */
  public getTestDashboard(testId: string): TestDashboardData {
    const realTimeData = this.realTimeData.value.get(testId)
    const testMetricsArray = this.testMetrics.value.get(testId) || []
    
    // Group metrics by variant
    const variantData = new Map<string, ABTestMetrics[]>()
    testMetricsArray.forEach(metrics => {
      if (!variantData.has(metrics.variantId)) {
        variantData.set(metrics.variantId, [])
      }
      variantData.get(metrics.variantId)!.push(metrics)
    })

    const variants: VariantDashboardData[] = []
    variantData.forEach((metrics, variantId) => {
      variants.push({
        variantId,
        participantCount: metrics.length,
        averageAccuracy: this.calculateAverage(metrics, 'sessionData.accuracy'),
        averageCompletionRate: this.calculateAverage(metrics, 'sessionData.completionRate'),
        averageEngagement: this.calculateAverage(metrics, 'userBehavior.engagementScore'),
        conversionRate: this.calculateConversionRate(metrics),
        trend: this.calculateTrend(metrics)
      })
    })

    return {
      testId,
      totalParticipants: testMetricsArray.length,
      variants,
      isSignificant: this.checkSignificance(testId),
      recommendedAction: this.getRecommendedAction(testId),
      alerts: this.getActiveAlerts(testId),
      dataQuality: this.assessDataQuality(testMetricsArray)
    }
  }

  /**
   * Stop A/B test and get final results
   */
  public async stopABTest(testId: string, reason: string = 'Manual stop'): Promise<ABTestResult[]> {
    // Stop monitoring
    this.stopTestMonitoring(testId)

    // Get final analysis
    const analysisResults = await this.analyzeABTest(testId)

    // Stop test in difficulty manager
    const results = await difficultyManager.stopABTest(testId)

    // Generate final report
    const finalReport = this.generateFinalReport(testId, analysisResults, reason)
    
    logger.log(`A/B test stopped: ${testId} - ${reason}`)
    logger.log('Final report:', finalReport)

    return results
  }

  /**
   * Get all active A/B tests
   */
  public getActiveTests(): ABTestConfig[] {
    return difficultyManager.activeABTests
  }

  /**
   * Get test history and results
   */
  public getTestHistory(): TestHistoryEntry[] {
    const history: TestHistoryEntry[] = []
    
    this.testResults.value.forEach((results, testId) => {
      const metrics = this.testMetrics.value.get(testId) || []
      const winner = results.find(r => r.winner)?.winner || 'inconclusive'
      
      history.push({
        testId,
        startDate: Math.min(...metrics.map(m => m.timestamp)),
        endDate: Math.max(...metrics.map(m => m.timestamp)),
        participantCount: metrics.length,
        winner,
        significantMetrics: results.filter(r => r.confidence > 0.95).map(r => r.metric),
        outcome: this.determineTestOutcome(results)
      })
    })

    return history.sort((a, b) => b.endDate - a.startDate)
  }

  /**
   * Validate A/B test configuration
   */
  private validateTestConfig(config: Omit<ABTestConfig, 'currentParticipants'>): ValidationResult {
    const errors: string[] = []

    // Check test duration
    if (config.endDate <= config.startDate) {
      errors.push('End date must be after start date')
    }

    // Check variants
    if (config.variants.length < 2) {
      errors.push('At least 2 variants required')
    }

    const totalWeight = config.variants.reduce((sum, v) => sum + v.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.1) {
      errors.push('Variant weights must sum to 100')
    }

    // Check sample size
    if (config.sampleSize < 100) {
      errors.push('Minimum sample size is 100')
    }

    // Check target games
    if (config.targetGames.length === 0) {
      errors.push('At least one target game required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Create monitoring configuration for test
   */
  private createMonitoringConfig(config: Omit<ABTestConfig, 'currentParticipants'>): TestMonitoringConfig {
    return {
      testId: config.testId,
      alertThresholds: [
        {
          metric: 'completionRate',
          condition: 'below',
          value: 0.3,
          severity: 'warning'
        },
        {
          metric: 'accuracy',
          condition: 'below',
          value: 0.4,
          severity: 'critical'
        },
        {
          metric: 'engagementScore',
          condition: 'below',
          value: 0.5,
          severity: 'warning'
        }
      ],
      monitoringInterval: 60000, // 1 minute
      autoStopConditions: [
        {
          condition: 'significance_reached',
          threshold: 0.95,
          action: 'notify_only'
        },
        {
          condition: 'adverse_effect',
          threshold: -0.2, // 20% worse performance
          action: 'stop_test'
        },
        {
          condition: 'sample_size_reached',
          threshold: config.sampleSize,
          action: 'notify_only'
        }
      ],
      dataBounds: {
        minSampleSizePerVariant: 50,
        maxTestDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
        minConfidenceLevel: 0.95,
        maxAllowedDropout: 0.5
      }
    }
  }

  /**
   * Start real-time monitoring for test
   */
  private startTestMonitoring(testId: string): void {
    const config = this.monitoringConfigs.value.get(testId)
    if (!config) return

    const interval = setInterval(() => {
      this.performMonitoringCheck(testId)
    }, config.monitoringInterval)

    this.monitoringIntervals.set(testId, interval)
  }

  /**
   * Stop monitoring for test
   */
  private stopTestMonitoring(testId: string): void {
    const interval = this.monitoringIntervals.get(testId)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(testId)
    }
  }

  /**
   * Perform statistical analysis for a metric
   */
  private async performStatisticalAnalysis(
    testId: string,
    metric: string,
    testMetrics: ABTestMetrics[]
  ): Promise<StatisticalResult> {
    // Group data by variant
    const variantData = new Map<string, number[]>()
    
    testMetrics.forEach(metrics => {
      if (!variantData.has(metrics.variantId)) {
        variantData.set(metrics.variantId, [])
      }
      
      const value = this.extractMetricValue(metrics, metric)
      if (value !== null) {
        variantData.get(metrics.variantId)!.push(value)
      }
    })

    // Calculate statistics for each variant
    const variants: VariantComparison[] = []
    variantData.forEach((values, variantId) => {
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      const standardDeviation = Math.sqrt(variance)
      
      // Calculate confidence interval (95%)
      const marginOfError = 1.96 * (standardDeviation / Math.sqrt(values.length))
      const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError]

      variants.push({
        variantId,
        mean,
        standardDeviation,
        sampleSize: values.length,
        confidenceInterval
      })
    })

    // Perform t-test between variants (simplified for two variants)
    let winner: string | undefined
    let confidence = 0
    let pValue = 1
    let effectSize = 0

    if (variants.length === 2) {
      const [variant1, variant2] = variants
      const result = this.performTTest(
        variantData.get(variant1.variantId)!,
        variantData.get(variant2.variantId)!
      )
      
      confidence = result.confidence
      pValue = result.pValue
      effectSize = result.effectSize
      
      if (result.significant) {
        winner = variant1.mean > variant2.mean ? variant1.variantId : variant2.variantId
      }
    }

    return {
      testId,
      metric,
      variants,
      winner,
      confidence,
      pValue,
      sampleSize: testMetrics.length,
      effectSize,
      recommendation: this.generateRecommendation(confidence, effectSize, testMetrics.length)
    }
  }

  /**
   * Perform t-test between two groups
   */
  private performTTest(group1: number[], group2: number[]): TTestResult {
    const mean1 = group1.reduce((sum, v) => sum + v, 0) / group1.length
    const mean2 = group2.reduce((sum, v) => sum + v, 0) / group2.length
    
    const variance1 = group1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (group1.length - 1)
    const variance2 = group2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (group2.length - 1)
    
    const pooledVariance = ((group1.length - 1) * variance1 + (group2.length - 1) * variance2) / 
                          (group1.length + group2.length - 2)
    
    const standardError = Math.sqrt(pooledVariance * (1/group1.length + 1/group2.length))
    const tScore = Math.abs(mean1 - mean2) / standardError
    
    // Simplified p-value calculation (approximation)
    const degreesOfFreedom = group1.length + group2.length - 2
    const pValue = this.calculatePValue(tScore, degreesOfFreedom)
    
    const confidence = 1 - pValue
    const effectSize = Math.abs(mean1 - mean2) / Math.sqrt(pooledVariance)
    
    return {
      tScore,
      pValue,
      confidence,
      effectSize,
      significant: pValue < 0.05
    }
  }

  /**
   * Calculate p-value (simplified approximation)
   */
  private calculatePValue(tScore: number, degreesOfFreedom: number): number {
    // This is a simplified approximation
    // In a real implementation, you would use a proper statistical library
    if (tScore > 2.576) return 0.01
    if (tScore > 1.96) return 0.05
    if (tScore > 1.645) return 0.1
    return 0.2
  }

  /**
   * Extract metric value from test metrics
   */
  private extractMetricValue(metrics: ABTestMetrics, metric: string): number | null {
    switch (metric) {
      case 'accuracy':
        return metrics.sessionData.accuracy
      case 'completionRate':
        return metrics.sessionData.completionRate
      case 'engagementScore':
        return metrics.userBehavior.engagementScore
      case 'score':
        return metrics.sessionData.score
      case 'duration':
        return metrics.sessionData.duration
      default:
        return null
    }
  }

  /**
   * Generate test recommendation
   */
  private generateRecommendation(
    confidence: number,
    effectSize: number,
    sampleSize: number
  ): TestRecommendation {
    if (confidence >= 0.95 && effectSize >= 0.2) {
      return {
        action: 'stop',
        reason: 'Significant result with meaningful effect size detected'
      }
    }
    
    if (sampleSize < 200) {
      return {
        action: 'continue',
        reason: 'Sample size too small for reliable results',
        suggestedDuration: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    }
    
    if (confidence < 0.8) {
      return {
        action: 'extend',
        reason: 'Low confidence, need more data',
        suggestedDuration: 14 * 24 * 60 * 60 * 1000 // 2 weeks
      }
    }
    
    return {
      action: 'continue',
      reason: 'Test progressing normally'
    }
  }

  /**
   * Update real-time monitoring data
   */
  private updateRealTimeData(testId: string, metrics: ABTestMetrics): void {
    let realTimeData = this.realTimeData.value.get(testId)
    if (!realTimeData) {
      realTimeData = {
        participantCounts: new Map<string, number>(),
        recentMetrics: []
      }
      this.realTimeData.value.set(testId, realTimeData)
    }

    // Update participant counts
    const currentCount = realTimeData.participantCounts.get(metrics.variantId) || 0
    realTimeData.participantCounts.set(metrics.variantId, currentCount + 1)

    // Keep recent metrics (last 100)
    realTimeData.recentMetrics.push(metrics)
    if (realTimeData.recentMetrics.length > 100) {
      realTimeData.recentMetrics = realTimeData.recentMetrics.slice(-100)
    }
  }

  /**
   * Check monitoring conditions and trigger alerts
   */
  private checkMonitoringConditions(testId: string): void {
    const config = this.monitoringConfigs.value.get(testId)
    if (!config) return

    const testMetricsArray = this.testMetrics.value.get(testId) || []
    if (testMetricsArray.length === 0) return

    // Check alert thresholds
    config.alertThresholds.forEach(threshold => {
      const values = testMetricsArray.map(m => this.extractMetricValue(m, threshold.metric)).filter(v => v !== null)
      if (values.length === 0) return

      const average = values.reduce((sum, v) => sum + v!, 0) / values.length
      let alertTriggered = false

      switch (threshold.condition) {
        case 'above':
          alertTriggered = average > threshold.value
          break
        case 'below':
          alertTriggered = average < threshold.value
          break
        case 'change':
          // Compare with baseline (first 10% of data)
          const baselineSize = Math.max(1, Math.floor(values.length * 0.1))
          const baseline = values.slice(0, baselineSize).reduce((sum, v) => sum + v!, 0) / baselineSize
          const change = Math.abs(average - baseline) / baseline
          alertTriggered = change > threshold.value
          break
      }

      if (alertTriggered) {
        this.triggerAlert(testId, threshold, average)
      }
    })

    // Check auto-stop conditions
    config.autoStopConditions.forEach(condition => {
      let shouldTrigger = false

      switch (condition.condition) {
        case 'sample_size_reached':
          shouldTrigger = testMetricsArray.length >= condition.threshold
          break
        case 'significance_reached':
          const results = this.testResults.value.get(testId) || []
          const hasSignificantResult = results.some(r => r.confidence >= condition.threshold)
          shouldTrigger = hasSignificantResult
          break
        case 'adverse_effect':
          // Check if any variant is performing significantly worse
          const variants = new Set(testMetricsArray.map(m => m.variantId))
          if (variants.size >= 2) {
            const variantPerformances = new Map<string, number>()
            variants.forEach(variantId => {
              const variantMetrics = testMetricsArray.filter(m => m.variantId === variantId)
              const avgAccuracy = variantMetrics.reduce((sum, m) => sum + m.sessionData.accuracy, 0) / variantMetrics.length
              variantPerformances.set(variantId, avgAccuracy)
            })
            
            const performances = Array.from(variantPerformances.values())
            const maxPerformance = Math.max(...performances)
            const minPerformance = Math.min(...performances)
            const relativeDropVerse = (maxPerformance - minPerformance) / maxPerformance
            shouldTrigger = relativeDropVerse > Math.abs(condition.threshold)
          }
          break
      }

      if (shouldTrigger) {
        this.triggerAutoStopCondition(testId, condition)
      }
    })
  }

  /**
   * Trigger alert
   */
  private triggerAlert(testId: string, threshold: AlertThreshold, value: number): void {
    logger.warn(`A/B Test Alert [${testId}]: ${threshold.metric} ${threshold.condition} ${threshold.value} (current: ${value.toFixed(3)})`)
    
    // In a real implementation, you might send notifications, emails, etc.
  }

  /**
   * Trigger auto-stop condition
   */
  private triggerAutoStopCondition(testId: string, condition: AutoStopCondition): void {
    logger.log(`A/B Test Auto-Stop Condition [${testId}]: ${condition.condition}`)
    
    if (condition.action === 'stop_test') {
      this.stopABTest(testId, `Auto-stopped: ${condition.condition}`)
    }
  }

  // Helper methods for dashboard data
  private calculateAverage(metrics: ABTestMetrics[], path: string): number {
    const values = metrics.map(m => this.getNestedValue(m, path)).filter(v => v !== null)
    if (values.length === 0) return 0
    return values.reduce((sum, v) => sum + v!, 0) / values.length
  }

  private getNestedValue(obj: any, path: string): number | null {
    const keys = path.split('.')
    let current = obj
    for (const key of keys) {
      current = current?.[key]
      if (current === undefined || current === null) return null
    }
    return typeof current === 'number' ? current : null
  }

  private calculateConversionRate(metrics: ABTestMetrics[]): number {
    const completed = metrics.filter(m => m.sessionData.completionRate >= 0.8).length
    return completed / metrics.length
  }

  private calculateTrend(metrics: ABTestMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 10) return 'stable'
    
    const recent = metrics.slice(-10)
    const earlier = metrics.slice(-20, -10)
    
    const recentAvg = this.calculateAverage(recent, 'sessionData.accuracy')
    const earlierAvg = this.calculateAverage(earlier, 'sessionData.accuracy')
    
    const change = (recentAvg - earlierAvg) / earlierAvg
    
    if (change > 0.05) return 'improving'
    if (change < -0.05) return 'declining'
    return 'stable'
  }

  private checkSignificance(testId: string): boolean {
    const results = this.testResults.value.get(testId) || []
    return results.some(r => r.confidence >= 0.95)
  }

  private getRecommendedAction(testId: string): string {
    const results = this.testResults.value.get(testId) || []
    if (results.length === 0) return 'Continue collecting data'
    
    const primaryResult = results[0]
    return primaryResult.recommendation.reason
  }

  private getActiveAlerts(testId: string): string[] {
    // This would return active alerts for the test
    return []
  }

  private assessDataQuality(metrics: ABTestMetrics[]): 'good' | 'fair' | 'poor' {
    if (metrics.length < 50) return 'poor'
    if (metrics.length < 200) return 'fair'
    return 'good'
  }

  private performMonitoringCheck(testId: string): void {
    // This would be called periodically to check test status
    this.checkMonitoringConditions(testId)
  }

  private generateFinalReport(testId: string, results: StatisticalResult[], reason: string): TestFinalReport {
    return {
      testId,
      stopReason: reason,
      duration: 0, // Would calculate actual duration
      totalParticipants: 0, // Would get actual count
      results,
      recommendations: results.map(r => r.recommendation),
      nextSteps: 'Implement winning variant'
    }
  }

  private determineTestOutcome(results: StatisticalResult[]): 'winner' | 'inconclusive' | 'no_difference' {
    const significantResults = results.filter(r => r.confidence >= 0.95)
    if (significantResults.length > 0 && significantResults.some(r => r.effectSize >= 0.2)) {
      return 'winner'
    }
    if (significantResults.length > 0) {
      return 'no_difference'
    }
    return 'inconclusive'
  }

  private setupEventListeners(): void {
    // Setup any necessary event listeners
  }

  // Public getters
  public get testHistory(): TestHistoryEntry[] {
    return this.getTestHistory()
  }

  public get activeTestCount(): number {
    return this.getActiveTests().length
  }
}

// Additional interfaces
interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface TTestResult {
  tScore: number
  pValue: number
  confidence: number
  effectSize: number
  significant: boolean
}

interface TestDashboardData {
  testId: string
  totalParticipants: number
  variants: VariantDashboardData[]
  isSignificant: boolean
  recommendedAction: string
  alerts: string[]
  dataQuality: 'good' | 'fair' | 'poor'
}

interface VariantDashboardData {
  variantId: string
  participantCount: number
  averageAccuracy: number
  averageCompletionRate: number
  averageEngagement: number
  conversionRate: number
  trend: 'improving' | 'declining' | 'stable'
}

interface TestHistoryEntry {
  testId: string
  startDate: number
  endDate: number
  participantCount: number
  winner: string
  significantMetrics: string[]
  outcome: 'winner' | 'inconclusive' | 'no_difference'
}

interface TestFinalReport {
  testId: string
  stopReason: string
  duration: number
  totalParticipants: number
  results: StatisticalResult[]
  recommendations: TestRecommendation[]
  nextSteps: string
}

// Export singleton instance
export const abTestManager = new ABTestManager()
export default abTestManager