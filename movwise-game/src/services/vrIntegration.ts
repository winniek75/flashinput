/**
 * MovWISE VR Academy Integration
 * Spatial.io連携 + 準備度判定 + シナリオ最適化
 */

import QRCode from 'qrcode'
import logger from '@/utils/logger'

export interface VRSession {
  sessionId: string
  userId: string
  spatialRoomId: string
  grammarLevel: string
  preparationScore: number
  recommendedScenarios: VRScenario[]
  qrCode: string
  startTime: Date
  estimatedDuration: number
  learningObjectives: string[]
}

export interface VRScenario {
  id: string
  name: string
  description: string
  grammarTopics: string[]
  difficulty: number
  minPreparationScore: number
  estimatedDuration: number
  spatialWorldId: string
  avatarRequirements: string[]
  interactionTypes: string[]
}

export interface PreparationAssessment {
  userId: string
  grammarReadiness: Record<string, number>
  vocabularyLevel: number
  communicationConfidence: number
  technicalReadiness: number
  overallScore: number
  recommendations: string[]
  missingSkills: string[]
}

export class VRIntegrationService {
  private vrSessions: Map<string, VRSession> = new Map()
  private availableScenarios: VRScenario[] = []

  constructor() {
    this.initializeScenarios()
  }

  /**
   * VRシナリオの初期化
   */
  private initializeScenarios(): void {
    this.availableScenarios = [
      {
        id: 'basic_intro',
        name: '基本英会話カフェ',
        description: '日常会話の基本をVR空間で練習',
        grammarTopics: ['be_verbs', 'general_verbs', 'basic_questions'],
        difficulty: 1,
        minPreparationScore: 60,
        estimatedDuration: 15,
        spatialWorldId: 'cafe-basic-001',
        avatarRequirements: ['casual_outfit'],
        interactionTypes: ['conversation', 'ordering', 'greeting']
      },
      {
        id: 'shopping_adventure',
        name: 'ショッピングモール探検',
        description: '買い物シーンでの実践英語',
        grammarTopics: ['questions', 'numbers', 'descriptions'],
        difficulty: 2,
        minPreparationScore: 70,
        estimatedDuration: 20,
        spatialWorldId: 'mall-adventure-001',
        avatarRequirements: ['casual_outfit', 'shopping_bag'],
        interactionTypes: ['shopping', 'asking_prices', 'descriptions']
      },
      {
        id: 'office_meeting',
        name: 'オフィス会議室',
        description: 'ビジネス英語とプレゼンテーション',
        grammarTopics: ['future_tense', 'conditionals', 'formal_speech'],
        difficulty: 4,
        minPreparationScore: 85,
        estimatedDuration: 30,
        spatialWorldId: 'office-meeting-001',
        avatarRequirements: ['business_suit', 'presentation_materials'],
        interactionTypes: ['presentation', 'discussion', 'negotiation']
      },
      {
        id: 'english_school',
        name: '英語学校クラスルーム',
        description: '文法集中学習セッション',
        grammarTopics: ['past_tense', 'present_perfect', 'relative_clauses'],
        difficulty: 3,
        minPreparationScore: 75,
        estimatedDuration: 25,
        spatialWorldId: 'classroom-001',
        avatarRequirements: ['student_outfit', 'textbooks'],
        interactionTypes: ['Q&A', 'group_work', 'presentation']
      },
      {
        id: 'cultural_festival',
        name: '国際文化フェスティバル',
        description: '多文化交流と自然な英会話',
        grammarTopics: ['descriptions', 'cultural_expressions', 'storytelling'],
        difficulty: 3,
        minPreparationScore: 80,
        estimatedDuration: 35,
        spatialWorldId: 'festival-001',
        avatarRequirements: ['festival_outfit'],
        interactionTypes: ['cultural_exchange', 'storytelling', 'games']
      }
    ]
  }

  /**
   * 準備度アセスメント実行
   */
  async assessPreparation(userId: string, grammarScores: Record<string, number>): Promise<PreparationAssessment> {
    // 文法準備度の評価
    const grammarReadiness: Record<string, number> = {}
    const grammarTopics = ['be_verbs', 'general_verbs', 'questions', 'past_tense', 'future_tense', 'conditionals']
    
    let totalGrammarScore = 0
    grammarTopics.forEach(topic => {
      const score = grammarScores[topic] || 0
      grammarReadiness[topic] = Math.min(score * 10, 100) // 0-10 scale to 0-100
      totalGrammarScore += grammarReadiness[topic]
    })

    const avgGrammarScore = totalGrammarScore / grammarTopics.length

    // 語彙レベルの推定（文法スコアベース）
    const vocabularyLevel = Math.min(avgGrammarScore * 0.8, 100)

    // コミュニケーション自信度（模擬計算）
    const communicationConfidence = Math.min(avgGrammarScore * 0.9, 95)

    // 技術的準備度（デバイス・ネットワーク）
    const technicalReadiness = await this.assessTechnicalReadiness()

    // 総合スコア計算
    const overallScore = Math.round(
      (avgGrammarScore * 0.4) + 
      (vocabularyLevel * 0.2) + 
      (communicationConfidence * 0.2) + 
      (technicalReadiness * 0.2)
    )

    // 推奨事項とスキル不足の特定
    const recommendations = this.generatePreparationRecommendations(overallScore, grammarReadiness)
    const missingSkills = this.identifyMissingSkills(grammarReadiness)

    return {
      userId,
      grammarReadiness,
      vocabularyLevel,
      communicationConfidence,
      technicalReadiness,
      overallScore,
      recommendations,
      missingSkills
    }
  }

  /**
   * 技術的準備度評価
   */
  private async assessTechnicalReadiness(): Promise<number> {
    let score = 100

    // WebRTC対応チェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      score -= 30
    }

    // カメラ・マイクアクセスチェック
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      score -= 25
    }

    // WebGL対応チェック（VR用）
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      score -= 20
    }

    // 接続速度推定（模擬）
    const connectionSpeed = (navigator as any).connection?.downlink || 10
    if (connectionSpeed < 5) {
      score -= 15
    }

    return Math.max(score, 0)
  }

  /**
   * 準備推奨事項生成
   */
  private generatePreparationRecommendations(overallScore: number, grammarReadiness: Record<string, number>): string[] {
    const recommendations: string[] = []

    if (overallScore < 60) {
      recommendations.push('基本文法の復習をもう少し行ってからVRセッションに参加することをお勧めします')
    }

    if (overallScore < 80) {
      recommendations.push('VRセッション前に10-15分の準備時間を設けることをお勧めします')
    }

    // 弱い文法エリアに基づく推奨
    Object.entries(grammarReadiness).forEach(([topic, score]) => {
      if (score < 50) {
        const topicName = this.getGrammarTopicName(topic)
        recommendations.push(`${topicName}の練習を重点的に行ってください`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('準備は完璧です！VRセッションを楽しんでください！')
    }

    return recommendations
  }

  /**
   * 不足スキル特定
   */
  private identifyMissingSkills(grammarReadiness: Record<string, number>): string[] {
    const missingSkills: string[] = []

    Object.entries(grammarReadiness).forEach(([topic, score]) => {
      if (score < 60) {
        missingSkills.push(this.getGrammarTopicName(topic))
      }
    })

    return missingSkills
  }

  /**
   * 文法トピック名変換
   */
  private getGrammarTopicName(topic: string): string {
    const nameMap: Record<string, string> = {
      'be_verbs': 'Be動詞',
      'general_verbs': '一般動詞',
      'questions': '疑問文',
      'past_tense': '過去形',
      'future_tense': '未来形',
      'conditionals': '仮定法'
    }
    return nameMap[topic] || topic
  }

  /**
   * 最適シナリオ選択
   */
  selectOptimalScenarios(assessment: PreparationAssessment): VRScenario[] {
    return this.availableScenarios.filter(scenario => {
      // 準備度スコアチェック
      if (assessment.overallScore < scenario.minPreparationScore) {
        return false
      }

      // 文法トピックの準備度チェック
      const requiredGrammarReady = scenario.grammarTopics.every(topic => {
        return (assessment.grammarReadiness[topic] || 0) >= 50
      })

      return requiredGrammarReady
    }).sort((a, b) => {
      // 難易度と準備度のマッチング度でソート
      const scoreA = Math.abs(a.difficulty * 20 - assessment.overallScore)
      const scoreB = Math.abs(b.difficulty * 20 - assessment.overallScore)
      return scoreA - scoreB
    })
  }

  /**
   * VRセッション作成
   */
  async createVRSession(userId: string, selectedScenario: VRScenario, assessment: PreparationAssessment): Promise<VRSession> {
    const sessionId = this.generateSessionId()
    const spatialRoomId = `${selectedScenario.spatialWorldId}-${sessionId}`
    
    // Spatial.io URL生成
    const spatialURL = `https://spatial.io/s/${spatialRoomId}?userId=${userId}&scenario=${selectedScenario.id}`
    
    // QRコード生成
    const qrCode = await QRCode.toDataURL(spatialURL)

    const session: VRSession = {
      sessionId,
      userId,
      spatialRoomId,
      grammarLevel: this.determineGrammarLevel(assessment.overallScore),
      preparationScore: assessment.overallScore,
      recommendedScenarios: this.selectOptimalScenarios(assessment),
      qrCode,
      startTime: new Date(),
      estimatedDuration: selectedScenario.estimatedDuration,
      learningObjectives: this.generateLearningObjectives(selectedScenario, assessment)
    }

    this.vrSessions.set(sessionId, session)
    return session
  }

  /**
   * セッションID生成
   */
  private generateSessionId(): string {
    return 'vr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 文法レベル判定
   */
  private determineGrammarLevel(overallScore: number): string {
    if (overallScore >= 90) return 'advanced'
    if (overallScore >= 75) return 'intermediate'
    if (overallScore >= 60) return 'beginner'
    return 'foundation'
  }

  /**
   * 学習目標生成
   */
  private generateLearningObjectives(scenario: VRScenario, assessment: PreparationAssessment): string[] {
    const objectives: string[] = []

    // シナリオベースの目標
    scenario.grammarTopics.forEach(topic => {
      const readiness = assessment.grammarReadiness[topic] || 0
      if (readiness < 80) {
        objectives.push(`${this.getGrammarTopicName(topic)}の実践的な使用をマスターする`)
      } else {
        objectives.push(`${this.getGrammarTopicName(topic)}の流暢性を向上させる`)
      }
    })

    // コミュニケーション目標
    if (assessment.communicationConfidence < 80) {
      objectives.push('自信を持って英語でコミュニケーションを取る')
    }

    objectives.push('自然な会話の流れを身につける')
    objectives.push('文化的な理解を深める')

    return objectives
  }

  /**
   * セッション取得
   */
  getVRSession(sessionId: string): VRSession | undefined {
    return this.vrSessions.get(sessionId)
  }

  /**
   * アクティブセッション一覧
   */
  getActiveSessions(userId: string): VRSession[] {
    return Array.from(this.vrSessions.values())
      .filter(session => session.userId === userId)
      .filter(session => {
        const now = new Date()
        const sessionStart = session.startTime
        const sessionEnd = new Date(sessionStart.getTime() + session.estimatedDuration * 60000)
        return now <= sessionEnd
      })
  }

  /**
   * セッション完了処理
   */
  completeSession(sessionId: string, results: any): void {
    const session = this.vrSessions.get(sessionId)
    if (session) {
      // セッション結果をAI Learning Engineに送信
      logger.log('VR Session completed:', { sessionId, results })
      // 実際の実装では aiEngine.recordPerformance() を呼び出し
    }
  }

  /**
   * 利用可能シナリオ取得
   */
  getAvailableScenarios(): VRScenario[] {
    return [...this.availableScenarios]
  }

  /**
   * Spatial.io接続テスト
   */
  async testSpatialConnection(): Promise<boolean> {
    try {
      // 実際の実装では Spatial.io API を呼び出し
      const response = await fetch('https://spatial.io/api/health', { method: 'HEAD' })
      return response.ok
    } catch (error) {
      logger.error('Spatial.io connection test failed:', error)
      return false
    }
  }

  /**
   * Spatial.io接続状態チェック（詳細版）
   */
  async checkSpatialIOConnection(): Promise<{
    connected: boolean
    latency: number
    status: string
    error?: string
    serverRegion?: string
    capabilities: string[]
  }> {
    const startTime = performance.now()
    
    try {
      // Spatial.io API への接続テスト
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒タイムアウト
      
      const response = await fetch('https://spatial.io/api/v1/status', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      clearTimeout(timeoutId)
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)
      
      if (response.ok) {
        try {
          const data = await response.json()
          return {
            connected: true,
            latency,
            status: 'connected',
            serverRegion: data.region || 'unknown',
            capabilities: data.capabilities || [
              'webrtc',
              'spatial_audio',
              'avatar_system',
              'world_streaming'
            ]
          }
        } catch (jsonError) {
          // JSON解析エラーの場合でも接続は成功
          return {
            connected: true,
            latency,
            status: 'connected_limited',
            capabilities: ['basic_connection']
          }
        }
      } else {
        return {
          connected: false,
          latency,
          status: 'connection_failed',
          error: `HTTP ${response.status}: ${response.statusText}`,
          capabilities: []
        }
      }
    } catch (error) {
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          connected: false,
          latency,
          status: 'timeout',
          error: 'Connection timeout (10s)',
          capabilities: []
        }
      }
      
      // ネットワークエラーまたはその他のエラー
      return {
        connected: false,
        latency,
        status: 'network_error',
        error: error instanceof Error ? error.message : 'Unknown network error',
        capabilities: []
      }
    }
  }

  /**
   * VRデバイス互換性チェック
   */
  async checkDeviceCompatibility(): Promise<{
    compatible: boolean
    webxr: boolean
    webgl: boolean
    camera: boolean
    microphone: boolean
    performance: number
    warnings: string[]
    recommendations: string[]
  }> {
    const result = {
      compatible: true,
      webxr: false,
      webgl: false,
      camera: false,
      microphone: false,
      performance: 0,
      warnings: [] as string[],
      recommendations: [] as string[]
    }

    // WebXR対応チェック
    if ('xr' in navigator && 'isSessionSupported' in (navigator as any).xr) {
      try {
        result.webxr = await (navigator as any).xr.isSessionSupported('immersive-vr')
        
        // 実際のVRデバイス検出を試行
        if (result.webxr) {
          try {
            const session = await (navigator as any).xr.requestSession('immersive-vr')
            result.warnings.push('VRヘッドセットが検出されました')
            session.end() // すぐに終了
          } catch (error) {
            result.warnings.push('VRヘッドセットが接続されていません')
          }
        }
      } catch (error) {
        result.webxr = false
        result.warnings.push('WebXRサポートが不完全です')
      }
    } else {
      result.warnings.push('WebXRがサポートされていません')
    }

    // WebGL対応チェック
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      result.webgl = true
      // パフォーマンス推定
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        result.performance = this.estimateGPUPerformance(renderer)
      } else {
        result.performance = 60 // デフォルト値
      }
    } else {
      result.webgl = false
      result.compatible = false
      result.warnings.push('WebGLがサポートされていません')
      result.recommendations.push('より新しいブラウザまたはデバイスをご利用ください')
    }

    // カメラアクセスチェック
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        result.camera = true
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        result.camera = false
        result.warnings.push('カメラアクセスが許可されていません')
        result.recommendations.push('ブラウザ設定でカメラアクセスを許可してください')
      }
    } else {
      result.camera = false
      result.warnings.push('カメラAPIがサポートされていません')
    }

    // マイクアクセスチェック
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        result.microphone = true
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        result.microphone = false
        result.warnings.push('マイクアクセスが許可されていません')
        result.recommendations.push('ブラウザ設定でマイクアクセスを許可してください')
      }
    } else {
      result.microphone = false
      result.warnings.push('マイクAPIがサポートされていません')
    }

    // 全体的な互換性判定
    if (!result.webgl || !result.camera || !result.microphone) {
      result.compatible = false
    }

    if (result.performance < 30) {
      result.warnings.push('パフォーマンスが低い可能性があります')
      result.recommendations.push('グラフィック設定を低品質に変更することをお勧めします')
    }

    // WebXRが使えない場合の代替案
    if (!result.webxr) {
      result.recommendations.push('VRヘッドセット体験はできませんが、デスクトップ版で練習できます')
    }

    // Bluetoothデバイス検出（実験的）
    if ('bluetooth' in navigator) {
      try {
        // Bluetooth対応VRコントローラーのスキャン
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['battery_service', 'device_information']
        })
        
        if (device) {
          result.recommendations.push(`Bluetoothデバイス "${device.name}" が検出されました`)
        }
      } catch (error) {
        // ユーザーがキャンセルした場合やデバイスが見つからない場合
        result.warnings.push('Bluetoothデバイスが検出されませんでした（VRコントローラーなど）')
      }
    } else {
      result.warnings.push('Bluetooth APIがサポートされていません')
    }

    return result
  }

  /**
   * 実際のVRセッション開始（デバイス接続含む）
   */
  async startRealVRSession(userId: string, scenarioId: string): Promise<{
    success: boolean
    session?: VRSession
    vrSession?: any // WebXR session
    errors: string[]
    deviceInfo: {
      headset?: string
      controllers: string[]
      trackingSpace?: string
    }
  }> {
    const result = {
      success: false,
      errors: [] as string[],
      deviceInfo: {
        controllers: [] as string[],
      }
    }

    try {
      // 1. WebXRセッション開始
      if ('xr' in navigator) {
        try {
          const xrSession = await (navigator as any).xr.requestSession('immersive-vr', {
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['hand-tracking', 'bounded-floor']
          })

          // VRセッション情報を取得
          const referenceSpace = await xrSession.requestReferenceSpace('local-floor')
          
          // デバイス情報を取得
          const inputSources = xrSession.inputSources
          for (const inputSource of inputSources) {
            if (inputSource.hand) {
              result.deviceInfo.controllers.push(`Hand tracking: ${inputSource.handedness}`)
            } else if (inputSource.gamepad) {
              result.deviceInfo.controllers.push(`Controller: ${inputSource.handedness}`)
            }
          }

          // 通常のVRセッションも作成
          const scenario = this.availableScenarios.find(s => s.id === scenarioId)
          if (scenario) {
            const assessment: PreparationAssessment = {
              userId,
              grammarReadiness: { 'be_verbs': 70, 'general_verbs': 70, 'questions': 70 },
              vocabularyLevel: 70,
              communicationConfidence: 70,
              technicalReadiness: 90,
              overallScore: 75,
              recommendations: ['VRデバイスが正常に接続されました'],
              missingSkills: []
            }
            
            const session = await this.createVRSession(userId, scenario, assessment)
            
            return {
              success: true,
              session,
              vrSession: xrSession,
              errors: [],
              deviceInfo: result.deviceInfo
            }
          } else {
            result.errors.push('指定されたシナリオが見つかりません')
          }
        } catch (xrError) {
          result.errors.push(`VRセッション開始エラー: ${xrError instanceof Error ? xrError.message : 'Unknown error'}`)
        }
      } else {
        result.errors.push('WebXRがサポートされていません')
      }
    } catch (error) {
      result.errors.push(`システムエラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return { ...result, success: false }
  }

  /**
   * GPU性能推定
   */
  private estimateGPUPerformance(renderer: string): number {
    const rendererLower = renderer.toLowerCase()
    
    // 高性能GPU
    if (rendererLower.includes('rtx') || rendererLower.includes('gtx 1060') || 
        rendererLower.includes('gtx 1070') || rendererLower.includes('gtx 1080') ||
        rendererLower.includes('radeon rx')) {
      return 90
    }
    
    // 中性能GPU
    if (rendererLower.includes('gtx') || rendererLower.includes('radeon') ||
        rendererLower.includes('iris') || rendererLower.includes('uhd')) {
      return 60
    }
    
    // 低性能GPU/統合GPU
    if (rendererLower.includes('intel') || rendererLower.includes('mesa')) {
      return 30
    }
    
    // 不明な場合
    return 50
  }

  /**
   * VRセッション用QRコード生成
   */
  async generateVRSessionQR(userId: string, scenarioId?: string): Promise<{
    qrCodeDataUrl: string
    sessionUrl: string
    sessionId: string
    expiresAt: Date
  }> {
    try {
      // セッションID生成
      const sessionId = this.generateSessionId()
      
      // シナリオ選択（指定されていない場合はデフォルト）
      const scenario = scenarioId 
        ? this.availableScenarios.find(s => s.id === scenarioId) || this.availableScenarios[0]
        : this.availableScenarios[0]
      
      // Spatial.io URL生成
      const spatialRoomId = `${scenario.spatialWorldId}-${sessionId}`
      const baseUrl = window.location.origin
      const sessionUrl = `${baseUrl}/vr-session?sessionId=${sessionId}&userId=${userId}&scenario=${scenario.id}&room=${spatialRoomId}`
      
      // QRコード生成
      const qrCodeDataUrl = await QRCode.toDataURL(sessionUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      })
      
      // セッション有効期限（1時間）
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      
      // セッション情報を一時保存
      const tempSession: Partial<VRSession> = {
        sessionId,
        userId,
        spatialRoomId,
        startTime: new Date(),
        estimatedDuration: scenario.estimatedDuration,
        qrCode: qrCodeDataUrl
      }
      
      // 一時的にセッション情報を保存（実際のセッション作成は後で行う）
      localStorage.setItem(`vr_temp_session_${sessionId}`, JSON.stringify({
        ...tempSession,
        expiresAt: expiresAt.toISOString()
      }))
      
      return {
        qrCodeDataUrl,
        sessionUrl,
        sessionId,
        expiresAt
      }
    } catch (error) {
      logger.error('QR code generation failed:', error)
      throw new Error(`QRコード生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * QRコードスキャン後のセッション開始
   */
  async startVRSessionFromQR(sessionId: string): Promise<VRSession | null> {
    try {
      // 一時保存されたセッション情報を取得
      const tempSessionData = localStorage.getItem(`vr_temp_session_${sessionId}`)
      if (!tempSessionData) {
        throw new Error('セッション情報が見つかりません')
      }
      
      const tempSession = JSON.parse(tempSessionData)
      
      // 有効期限チェック
      const expiresAt = new Date(tempSession.expiresAt)
      if (new Date() > expiresAt) {
        localStorage.removeItem(`vr_temp_session_${sessionId}`)
        throw new Error('セッションの有効期限が切れています')
      }
      
      // 実際のVRセッションを作成
      const scenario = this.availableScenarios.find(s => s.id === tempSession.scenarioId) || this.availableScenarios[0]
      
      // 簡易的な準備度評価（QRコードからの場合）
      const quickAssessment: PreparationAssessment = {
        userId: tempSession.userId,
        grammarReadiness: {
          'be_verbs': 70,
          'general_verbs': 70,
          'questions': 70,
          'past_tense': 60,
          'future_tense': 60,
          'conditionals': 50
        },
        vocabularyLevel: 65,
        communicationConfidence: 60,
        technicalReadiness: 80,
        overallScore: 65,
        recommendations: ['QRコードからの参加のため、基本的な準備をお勧めします'],
        missingSkills: []
      }
      
      const session = await this.createVRSession(tempSession.userId, scenario, quickAssessment)
      
      // 一時データを削除
      localStorage.removeItem(`vr_temp_session_${sessionId}`)
      
      return session
    } catch (error) {
      logger.error('VR session start failed:', error)
      return null
    }
  }

  /**
   * 期限切れの一時セッションデータをクリーンアップ
   */
  cleanupExpiredTempSessions(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('vr_temp_session_'))
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        const expiresAt = new Date(data.expiresAt)
        
        if (new Date() > expiresAt) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // 破損したデータを削除
        localStorage.removeItem(key)
      }
    })
  }
}

// シングルトンインスタンス
export const vrIntegrationService = new VRIntegrationService()