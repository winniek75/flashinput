/**
 * VR Readiness Assessment Service
 * プレイヤーのVR学習準備度を評価し、適切なタイミングでVRアカデミーへ誘導
 */

import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useStoryState } from '@/stores/storyState'
import logger from '@/utils/logger'

// VR準備度レベル定義
export enum VRReadinessLevel {
  BEGINNER = 'beginner',         // 0-49%
  FOUNDATION = 'foundation',     // 50-74%
  INTERMEDIATE = 'intermediate', // 75-89%
  ADVANCED = 'advanced',         // 90-94%
  MASTER = 'master'             // 95-100%
}

// VR準備度評価カテゴリー
export interface VRSkillCategory {
  id: string
  name: string
  description: string
  weight: number // 重要度（合計1.0）
  currentScore: number // 0-100
  requiredExperiences: string[]
  completedExperiences: string[]
}

// VRスキル評価詳細
export interface VRSkillAssessment {
  category: VRSkillCategory
  score: number
  feedback: string
  recommendations: string[]
  unlockedContent: string[]
}

// VR準備度レポート
export interface VRReadinessReport {
  overallScore: number
  level: VRReadinessLevel
  levelProgress: number // 現在のレベル内での進捗（0-100%）
  assessments: VRSkillAssessment[]
  strengths: string[]
  areasForImprovement: string[]
  nextMilestone: {
    level: VRReadinessLevel
    requiredScore: number
    estimatedGames: number
  }
  vrAcademyRecommendation: {
    isReady: boolean
    recommendedScenarios: VRScenarioRecommendation[]
    message: string
  }
  lastUpdated: string
}

// VRシナリオ推奨
export interface VRScenarioRecommendation {
  scenarioId: string
  title: string
  difficulty: VRReadinessLevel
  estimatedDuration: number
  skills: string[]
  reason: string
  priority: 'high' | 'medium' | 'low'
}

// ゲームごとのVRスキルポイント設定
export interface GameVRSkillConfig {
  gameType: string
  skills: {
    [category: string]: {
      basePoints: number
      bonusConditions: {
        condition: string
        multiplier: number
      }[]
    }
  }
}

// 通知設定
export interface VRReadinessNotification {
  id: string
  timestamp: string
  level: VRReadinessLevel
  title: string
  message: string
  action?: {
    label: string
    route: string
  }
  seen: boolean
  importance: 'high' | 'medium' | 'low'
}

export class VRReadinessAssessmentService {
  // スキルカテゴリー定義
  private skillCategories: VRSkillCategory[] = [
    {
      id: 'basic_interaction',
      name: 'Basic VR Interaction',
      description: '基本的なVR操作と自己表現',
      weight: 0.25,
      currentScore: 0,
      requiredExperiences: [
        'vr_tutorial_complete',
        'basic_gestures_learned',
        'voice_calibration_done',
        'avatar_customization'
      ],
      completedExperiences: []
    },
    {
      id: 'conversational_fluency',
      name: 'Conversational Fluency',
      description: '日常会話と状況説明能力',
      weight: 0.35,
      currentScore: 0,
      requiredExperiences: [
        'daily_conversation_scenarios',
        'situation_explanation',
        'question_formation',
        'active_listening'
      ],
      completedExperiences: []
    },
    {
      id: 'cultural_adaptation',
      name: 'Cultural Adaptation',
      description: '文化的理解と適応能力',
      weight: 0.20,
      currentScore: 0,
      requiredExperiences: [
        'cultural_scenarios',
        'polite_expressions',
        'social_contexts',
        'nonverbal_communication'
      ],
      completedExperiences: []
    },
    {
      id: 'advanced_communication',
      name: 'Advanced Communication',
      description: '複雑な議論と専門分野での会話',
      weight: 0.20,
      currentScore: 0,
      requiredExperiences: [
        'debate_participation',
        'technical_discussions',
        'abstract_concepts',
        'professional_scenarios'
      ],
      completedExperiences: []
    }
  ]

  // ゲームごとのVRスキルポイント設定
  private gameVRSkillConfigs: Map<string, GameVRSkillConfig> = new Map([
    ['CvPronunciationTrainer', {
      gameType: 'CvPronunciationTrainer',
      skills: {
        basic_interaction: {
          basePoints: 2,
          bonusConditions: [
            { condition: 'perfect_score', multiplier: 1.5 },
            { condition: 'streak_10', multiplier: 1.2 }
          ]
        },
        conversational_fluency: {
          basePoints: 3,
          bonusConditions: [
            { condition: 'speed_bonus', multiplier: 1.3 },
            { condition: 'no_mistakes', multiplier: 1.4 }
          ]
        }
      }
    }],
    ['WordCollector', {
      gameType: 'WordCollector',
      skills: {
        basic_interaction: {
          basePoints: 1,
          bonusConditions: [
            { condition: 'all_words_collected', multiplier: 1.5 }
          ]
        },
        conversational_fluency: {
          basePoints: 4,
          bonusConditions: [
            { condition: 'category_mastery', multiplier: 1.6 },
            { condition: 'speed_collection', multiplier: 1.2 }
          ]
        },
        cultural_adaptation: {
          basePoints: 2,
          bonusConditions: [
            { condition: 'cultural_words', multiplier: 2.0 }
          ]
        }
      }
    }],
    ['GrammarSentenceBuilder', {
      gameType: 'GrammarSentenceBuilder',
      skills: {
        conversational_fluency: {
          basePoints: 3,
          bonusConditions: [
            { condition: 'complex_sentences', multiplier: 1.5 }
          ]
        },
        advanced_communication: {
          basePoints: 5,
          bonusConditions: [
            { condition: 'perfect_grammar', multiplier: 1.4 },
            { condition: 'varied_structures', multiplier: 1.3 }
          ]
        }
      }
    }],
    ['ConversationSimulator', {
      gameType: 'ConversationSimulator',
      skills: {
        conversational_fluency: {
          basePoints: 5,
          bonusConditions: [
            { condition: 'natural_flow', multiplier: 1.5 }
          ]
        },
        cultural_adaptation: {
          basePoints: 4,
          bonusConditions: [
            { condition: 'appropriate_register', multiplier: 1.6 }
          ]
        },
        advanced_communication: {
          basePoints: 3,
          bonusConditions: [
            { condition: 'complex_topics', multiplier: 1.8 }
          ]
        }
      }
    }]
  ])

  // 通知履歴
  private notifications = ref<VRReadinessNotification[]>([])
  
  // 最後の評価レポート
  private lastReport = ref<VRReadinessReport | null>(null)

  // レベル閾値
  private readonly levelThresholds = {
    [VRReadinessLevel.BEGINNER]: 0,
    [VRReadinessLevel.FOUNDATION]: 50,
    [VRReadinessLevel.INTERMEDIATE]: 75,
    [VRReadinessLevel.ADVANCED]: 90,
    [VRReadinessLevel.MASTER]: 95
  }

  constructor() {
    // ゲーム完了時の自動評価
    const gameStore = useGameStore()
    watch(() => gameStore.lastGameResult, (result) => {
      if (result) {
        this.updateSkillsFromGame(result)
      }
    })
  }

  /**
   * ゲーム結果からVRスキルを更新
   */
  async updateSkillsFromGame(gameResult: any): Promise<void> {
    const config = this.gameVRSkillConfigs.get(gameResult.gameType)
    if (!config) return

    for (const [categoryId, skillConfig] of Object.entries(config.skills)) {
      const category = this.skillCategories.find(c => c.id === categoryId)
      if (!category) continue

      let points = skillConfig.basePoints

      // ボーナス条件のチェック
      for (const bonus of skillConfig.bonusConditions) {
        if (this.checkBonusCondition(gameResult, bonus.condition)) {
          points *= bonus.multiplier
        }
      }

      // スコアの更新（最大100）
      category.currentScore = Math.min(100, category.currentScore + points)

      // 経験の記録
      const experienceId = `${gameResult.gameType}_${Date.now()}`
      category.completedExperiences.push(experienceId)
    }

    // 自動評価と通知チェック
    const report = await this.generateReadinessReport()
    await this.checkAndSendNotifications(report)
  }

  /**
   * ボーナス条件のチェック
   */
  private checkBonusCondition(gameResult: any, condition: string): boolean {
    switch (condition) {
      case 'perfect_score':
        return gameResult.score >= gameResult.maxScore
      case 'streak_10':
        return gameResult.streak >= 10
      case 'speed_bonus':
        return gameResult.timeBonus > 0
      case 'no_mistakes':
        return gameResult.mistakes === 0
      case 'all_words_collected':
        return gameResult.wordsCollected === gameResult.totalWords
      case 'category_mastery':
        return gameResult.categoriesCompleted >= 3
      case 'complex_sentences':
        return gameResult.averageSentenceLength > 7
      case 'perfect_grammar':
        return gameResult.grammarErrors === 0
      case 'natural_flow':
        return gameResult.flowScore >= 80
      case 'appropriate_register':
        return gameResult.registerScore >= 85
      case 'complex_topics':
        return gameResult.topicDifficulty === 'advanced'
      default:
        return false
    }
  }

  /**
   * VR準備度レポートの生成
   */
  async generateReadinessReport(): Promise<VRReadinessReport> {
    const assessments: VRSkillAssessment[] = []
    let totalWeightedScore = 0

    // 各カテゴリーの評価
    for (const category of this.skillCategories) {
      const assessment = this.assessCategory(category)
      assessments.push(assessment)
      totalWeightedScore += assessment.score * category.weight
    }

    // 全体スコアとレベルの判定
    const overallScore = Math.round(totalWeightedScore)
    const level = this.getReadinessLevel(overallScore)
    const levelProgress = this.calculateLevelProgress(overallScore, level)

    // 強みと改善点の抽出
    const strengths = assessments
      .filter(a => a.score >= 80)
      .map(a => a.category.name)

    const areasForImprovement = assessments
      .filter(a => a.score < 60)
      .map(a => a.category.name)

    // 次のマイルストーン
    const nextMilestone = this.calculateNextMilestone(overallScore, level)

    // VRアカデミー推奨
    const vrAcademyRecommendation = this.generateVRAcademyRecommendation(
      overallScore,
      level,
      assessments
    )

    const report: VRReadinessReport = {
      overallScore,
      level,
      levelProgress,
      assessments,
      strengths,
      areasForImprovement,
      nextMilestone,
      vrAcademyRecommendation,
      lastUpdated: new Date().toISOString()
    }

    this.lastReport.value = report
    await this.saveReport(report)

    return report
  }

  /**
   * カテゴリーの評価
   */
  private assessCategory(category: VRSkillCategory): VRSkillAssessment {
    const score = category.currentScore
    const completionRate = category.completedExperiences.length / category.requiredExperiences.length

    // フィードバックの生成
    let feedback = ''
    const recommendations: string[] = []
    const unlockedContent: string[] = []

    if (score < 30) {
      feedback = `${category.name}の基礎を構築中です。継続的な練習が重要です。`
      recommendations.push('基本的な練習ゲームを継続してプレイ')
      recommendations.push('チュートリアルの復習')
    } else if (score < 60) {
      feedback = `${category.name}の理解が深まってきています。より複雑な課題に挑戦しましょう。`
      recommendations.push('中級レベルのゲームに挑戦')
      recommendations.push('VRプレビュー機能を試す')
      if (score >= 50) {
        unlockedContent.push('vr_preview_basic')
      }
    } else if (score < 80) {
      feedback = `${category.name}で良い成果を上げています。VR環境での練習を検討しましょう。`
      recommendations.push('上級ゲームでスキルを磨く')
      recommendations.push('VRシナリオのプレビュー')
      unlockedContent.push('vr_scenario_preview')
    } else {
      feedback = `${category.name}で優れた能力を示しています。VRアカデミーでの実践が推奨されます。`
      recommendations.push('VRアカデミーでの実践')
      recommendations.push('他のプレイヤーとの協力学習')
      unlockedContent.push('vr_academy_access')
    }

    return {
      category,
      score,
      feedback,
      recommendations,
      unlockedContent
    }
  }

  /**
   * 準備度レベルの判定
   */
  private getReadinessLevel(score: number): VRReadinessLevel {
    if (score >= this.levelThresholds[VRReadinessLevel.MASTER]) {
      return VRReadinessLevel.MASTER
    } else if (score >= this.levelThresholds[VRReadinessLevel.ADVANCED]) {
      return VRReadinessLevel.ADVANCED
    } else if (score >= this.levelThresholds[VRReadinessLevel.INTERMEDIATE]) {
      return VRReadinessLevel.INTERMEDIATE
    } else if (score >= this.levelThresholds[VRReadinessLevel.FOUNDATION]) {
      return VRReadinessLevel.FOUNDATION
    } else {
      return VRReadinessLevel.BEGINNER
    }
  }

  /**
   * レベル内進捗の計算
   */
  private calculateLevelProgress(score: number, level: VRReadinessLevel): number {
    const currentThreshold = this.levelThresholds[level]
    const nextLevel = this.getNextLevel(level)
    
    if (!nextLevel) return 100 // MASTERレベルの場合

    const nextThreshold = this.levelThresholds[nextLevel]
    const levelRange = nextThreshold - currentThreshold
    const progress = ((score - currentThreshold) / levelRange) * 100

    return Math.max(0, Math.min(100, Math.round(progress)))
  }

  /**
   * 次のレベルを取得
   */
  private getNextLevel(currentLevel: VRReadinessLevel): VRReadinessLevel | null {
    const levels = [
      VRReadinessLevel.BEGINNER,
      VRReadinessLevel.FOUNDATION,
      VRReadinessLevel.INTERMEDIATE,
      VRReadinessLevel.ADVANCED,
      VRReadinessLevel.MASTER
    ]
    
    const currentIndex = levels.indexOf(currentLevel)
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1]
    }
    
    return null
  }

  /**
   * 次のマイルストーンの計算
   */
  private calculateNextMilestone(
    currentScore: number,
    currentLevel: VRReadinessLevel
  ): VRReadinessReport['nextMilestone'] {
    const nextLevel = this.getNextLevel(currentLevel)
    
    if (!nextLevel) {
      return {
        level: VRReadinessLevel.MASTER,
        requiredScore: 100,
        estimatedGames: 0
      }
    }

    const requiredScore = this.levelThresholds[nextLevel]
    const scoreGap = requiredScore - currentScore
    const estimatedGames = Math.ceil(scoreGap / 3) // 平均3ポイント/ゲーム

    return {
      level: nextLevel,
      requiredScore,
      estimatedGames
    }
  }

  /**
   * VRアカデミー推奨の生成
   */
  private generateVRAcademyRecommendation(
    score: number,
    level: VRReadinessLevel,
    assessments: VRSkillAssessment[]
  ): VRReadinessReport['vrAcademyRecommendation'] {
    const recommendations: VRScenarioRecommendation[] = []
    let message = ''
    const isReady = score >= this.levelThresholds[VRReadinessLevel.FOUNDATION]

    if (!isReady) {
      message = 'もう少し基礎スキルを向上させてからVRアカデミーに挑戦しましょう。'
    } else {
      message = 'VRアカデミーで学習を始める準備ができています！'

      // レベルに応じたシナリオ推奨
      if (level === VRReadinessLevel.FOUNDATION) {
        recommendations.push({
          scenarioId: 'vr_basic_introduction',
          title: 'VR Basic Introduction',
          difficulty: VRReadinessLevel.FOUNDATION,
          estimatedDuration: 15,
          skills: ['basic_interaction', 'conversational_fluency'],
          reason: '基本的なVR操作と簡単な会話練習',
          priority: 'high'
        })
      } else if (level === VRReadinessLevel.INTERMEDIATE) {
        recommendations.push({
          scenarioId: 'vr_daily_conversations',
          title: 'Daily Conversations in VR',
          difficulty: VRReadinessLevel.INTERMEDIATE,
          estimatedDuration: 20,
          skills: ['conversational_fluency', 'cultural_adaptation'],
          reason: '日常会話スキルの実践的な向上',
          priority: 'high'
        })
        recommendations.push({
          scenarioId: 'vr_shopping_scenario',
          title: 'Shopping in Virtual Store',
          difficulty: VRReadinessLevel.INTERMEDIATE,
          estimatedDuration: 25,
          skills: ['conversational_fluency', 'cultural_adaptation'],
          reason: '実用的な場面での会話練習',
          priority: 'medium'
        })
      } else if (level === VRReadinessLevel.ADVANCED || level === VRReadinessLevel.MASTER) {
        recommendations.push({
          scenarioId: 'vr_business_meeting',
          title: 'Virtual Business Meeting',
          difficulty: VRReadinessLevel.ADVANCED,
          estimatedDuration: 30,
          skills: ['advanced_communication', 'cultural_adaptation'],
          reason: 'プロフェッショナルな場面での高度な会話',
          priority: 'high'
        })
        recommendations.push({
          scenarioId: 'vr_debate_club',
          title: 'VR Debate Club',
          difficulty: VRReadinessLevel.ADVANCED,
          estimatedDuration: 35,
          skills: ['advanced_communication'],
          reason: '議論と説得のスキル向上',
          priority: 'medium'
        })
      }
    }

    return {
      isReady,
      recommendedScenarios: recommendations,
      message
    }
  }

  /**
   * 通知のチェックと送信
   */
  private async checkAndSendNotifications(report: VRReadinessReport): Promise<void> {
    const now = new Date().toISOString()

    // レベルアップ通知
    if (this.lastReport.value && report.level !== this.lastReport.value.level) {
      const notification: VRReadinessNotification = {
        id: `levelup_${now}`,
        timestamp: now,
        level: report.level,
        title: '🎉 VR準備度レベルアップ！',
        message: `${this.getLevelDisplayName(report.level)}レベルに到達しました！`,
        action: {
          label: '詳細を見る',
          route: '/vr-readiness-report'
        },
        seen: false,
        importance: 'high'
      }
      this.addNotification(notification)
    }

    // VRアカデミー準備完了通知
    if (report.vrAcademyRecommendation.isReady && 
        (!this.lastReport.value || !this.lastReport.value.vrAcademyRecommendation.isReady)) {
      const notification: VRReadinessNotification = {
        id: `vr_ready_${now}`,
        timestamp: now,
        level: report.level,
        title: '🚀 VRアカデミーへの準備完了！',
        message: 'VR学習環境で実践的な英語学習を始めましょう',
        action: {
          label: 'VRシナリオを見る',
          route: '/vr-scenarios'
        },
        seen: false,
        importance: 'high'
      }
      this.addNotification(notification)
    }

    // スキル向上通知
    for (const assessment of report.assessments) {
      const previousAssessment = this.lastReport.value?.assessments.find(
        a => a.category.id === assessment.category.id
      )
      
      if (previousAssessment && assessment.score - previousAssessment.score >= 10) {
        const notification: VRReadinessNotification = {
          id: `skill_${assessment.category.id}_${now}`,
          timestamp: now,
          level: report.level,
          title: `📈 ${assessment.category.name}が向上！`,
          message: `スコアが${Math.round(assessment.score)}%に達しました`,
          seen: false,
          importance: 'medium'
        }
        this.addNotification(notification)
      }
    }
  }

  /**
   * 通知の追加
   */
  private addNotification(notification: VRReadinessNotification): void {
    this.notifications.value.unshift(notification)
    
    // 最大50件まで保持
    if (this.notifications.value.length > 50) {
      this.notifications.value = this.notifications.value.slice(0, 50)
    }

    // ローカルストレージに保存
    this.saveNotifications()
  }

  /**
   * レベル表示名の取得
   */
  private getLevelDisplayName(level: VRReadinessLevel): string {
    const names = {
      [VRReadinessLevel.BEGINNER]: 'ビギナー',
      [VRReadinessLevel.FOUNDATION]: 'ファウンデーション',
      [VRReadinessLevel.INTERMEDIATE]: 'インターミディエイト',
      [VRReadinessLevel.ADVANCED]: 'アドバンスド',
      [VRReadinessLevel.MASTER]: 'マスター'
    }
    return names[level] || level
  }

  /**
   * レポートの保存
   */
  private async saveReport(report: VRReadinessReport): Promise<void> {
    const key = `vr_readiness_report_guest`
    localStorage.setItem(key, JSON.stringify(report))
  }

  /**
   * レポートの読み込み
   */
  async loadReport(): Promise<VRReadinessReport | null> {
    const key = `vr_readiness_report_guest`
    const data = localStorage.getItem(key)
    
    if (data) {
      try {
        const report = JSON.parse(data)
        this.lastReport.value = report
        return report
      } catch (error) {
        logger.error('Failed to load VR readiness report:', error)
      }
    }
    
    return null
  }

  /**
   * 通知の保存
   */
  private saveNotifications(): void {
    const key = `vr_readiness_notifications_guest`
    localStorage.setItem(key, JSON.stringify(this.notifications.value))
  }

  /**
   * 通知の読み込み
   */
  async loadNotifications(): Promise<VRReadinessNotification[]> {
    const key = `vr_readiness_notifications_guest`
    const data = localStorage.getItem(key)
    
    if (data) {
      try {
        this.notifications.value = JSON.parse(data)
        return this.notifications.value
      } catch (error) {
        logger.error('Failed to load notifications:', error)
      }
    }
    
    return []
  }

  /**
   * 未読通知の数を取得
   */
  getUnreadNotificationCount(): number {
    return this.notifications.value.filter(n => !n.seen).length
  }

  /**
   * 通知を既読にする
   */
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.seen = true
      this.saveNotifications()
    }
  }

  /**
   * すべての通知を既読にする
   */
  markAllNotificationsAsRead(): void {
    this.notifications.value.forEach(n => n.seen = true)
    this.saveNotifications()
  }

  /**
   * 公開プロパティ
   */
  get currentReport() {
    return computed(() => this.lastReport.value)
  }

  get allNotifications() {
    return computed(() => this.notifications.value)
  }

  get unreadNotifications() {
    return computed(() => this.notifications.value.filter(n => !n.seen))
  }

  get currentLevel() {
    return computed(() => this.lastReport.value?.level || VRReadinessLevel.BEGINNER)
  }

  get currentScore() {
    return computed(() => this.lastReport.value?.overallScore || 0)
  }

  /**
   * デバッグ用：スキルポイントの手動追加
   */
  debugAddSkillPoints(categoryId: string, points: number): void {
    const category = this.skillCategories.find(c => c.id === categoryId)
    if (category) {
      category.currentScore = Math.min(100, category.currentScore + points)
      this.generateReadinessReport()
    }
  }

  /**
   * リセット（開発用）
   */
  reset(): void {
    this.skillCategories.forEach(c => {
      c.currentScore = 0
      c.completedExperiences = []
    })
    this.notifications.value = []
    this.lastReport.value = null
    this.saveReport(null as any)
    this.saveNotifications()
  }
}

// シングルトンインスタンス
export const vrReadinessAssessment = new VRReadinessAssessmentService()

// コンポジション関数
export function useVRReadiness() {
  const service = vrReadinessAssessment
  
  return {
    // Properties
    currentReport: service.currentReport,
    currentLevel: service.currentLevel,
    currentScore: service.currentScore,
    notifications: service.allNotifications,
    unreadNotifications: service.unreadNotifications,
    unreadCount: computed(() => service.getUnreadNotificationCount()),
    
    // Methods
    generateReport: () => service.generateReadinessReport(),
    loadReport: () => service.loadReport(),
    loadNotifications: () => service.loadNotifications(),
    markNotificationAsRead: (id: string) => service.markNotificationAsRead(id),
    markAllAsRead: () => service.markAllNotificationsAsRead(),
    
    // Debug
    debugAddPoints: (categoryId: string, points: number) => 
      service.debugAddSkillPoints(categoryId, points),
    reset: () => service.reset()
  }
}