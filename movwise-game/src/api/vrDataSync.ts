// src/api/vrDataSync.ts - VRアカデミーへのデータ送信API
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { useVRReadiness } from '@/services/vrReadinessAssessment'
import logger from '@/utils/logger'

// VRアカデミーデータ同期の型定義
export interface VRGameResult {
  gameId: string
  gameName: string
  playedAt: Date
  duration: number // milliseconds
  score: number
  accuracy: number // 0-100
  completedChallenges: string[]
  phonemeSkills: VRPhonemeSkillData[]
  vrReadinessGain: number
  crystalReward: number
  mistakes: VRMistakeData[]
  sessionData: VRSessionData
}

export interface VRPhonemeSkillData {
  phoneme: string
  accuracy: number
  responseTime: number
  attempts: number
  successes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  vrSkillMapping: string[] // 対応するVRシナリオスキル
}

export interface VRMistakeData {
  phoneme: string
  expectedResponse: string
  actualResponse: string
  timestamp: number
  context: string
  vrScenarioRelevance: string // 関連するVRシナリオ
}

export interface VRSessionData {
  playerLevel: number
  sessionNumber: number
  adaptiveAdjustments: VRAdaptiveAdjustment[]
  spatialAudio: VRSpatialAudioData
  vrReadinessMetrics: VRReadinessMetrics
}

export interface VRAdaptiveAdjustment {
  timestamp: number
  adjustmentType: 'difficulty' | 'speed' | 'phoneme_focus' | 'vr_emphasis'
  oldValue: any
  newValue: any
  reason: string
  vrScenarioImpact: string
}

export interface VRSpatialAudioData {
  spatialAccuracy: number // 3D音源定位精度
  depthPerception: number // 音の距離感認識
  multiSourceTracking: number // 複数音源追跡能力
  environmentalAdaptation: number // 音響環境適応度
}

export interface VRReadinessMetrics {
  overallReadiness: number // 0-100
  skillCategories: {
    basicInteraction: number
    conversationalFluency: number
    culturalAdaptation: number
    advancedCommunication: number
  }
  scenarioReadiness: VRScenarioReadiness[]
  recommendedProgression: string[]
}

export interface VRScenarioReadiness {
  scenarioId: string
  scenarioName: string
  readinessLevel: number // 0-100
  requiredSkills: string[]
  skillGaps: string[]
  estimatedReadyDate: Date | null
}

// VRアカデミー連携APIクラス
export class VRDataSyncAPI {
  private gameStore
  private playerStore
  private vrReadiness
  private syncQueue: VRGameResult[] = []
  private isOnline = ref(true)
  private lastSyncTime = ref<Date | null>(null)

  constructor() {
    this.gameStore = useGameStore()
    this.playerStore = usePlayerProfileStore()
    this.vrReadiness = useVRReadiness()
    
    // ネットワーク状態監視
    this.setupNetworkMonitoring()
    
    // 定期同期
    this.startPeriodicSync()
  }

  /**
   * ゲーム結果をVRアカデミーに送信
   */
  async syncGameResult(gameResult: VRGameResult): Promise<boolean> {
    try {
      logger.log('🔄 VRアカデミーへのデータ同期開始:', gameResult.gameId)

      // オフライン時はキューに追加
      if (!this.isOnline.value) {
        this.addToSyncQueue(gameResult)
        logger.log('📴 オフライン - 同期キューに追加')
        return false
      }

      // VRスキル分析の実行
      const vrSkillAnalysis = await this.analyzeVRSkillGains(gameResult)
      
      // VRシナリオ準備度の更新
      const scenarioReadiness = await this.updateScenarioReadiness(gameResult)
      
      // データペイロードの構築
      const syncPayload = {
        ...gameResult,
        vrSkillAnalysis,
        scenarioReadiness,
        playerProfile: this.getPlayerProfileData(),
        timestamp: new Date().toISOString(),
        syncVersion: '1.0.0'
      }

      // VRアカデミーへの送信（実際のAPIエンドポイント）
      const success = await this.sendToVRAcademy(syncPayload)
      
      if (success) {
        this.lastSyncTime.value = new Date()
        logger.log('✅ VRアカデミー同期完了')
        
        // ローカルストレージの更新
        this.updateLocalVRData(gameResult)
        
        // 同期成功通知
        this.emitSyncSuccess(gameResult)
      }

      return success

    } catch (error) {
      logger.error('❌ VRアカデミー同期エラー:', error)
      this.addToSyncQueue(gameResult)
      return false
    }
  }

  /**
   * VRスキル向上の分析
   */
  private async analyzeVRSkillGains(gameResult: VRGameResult): Promise<any> {
    const skillGains = {
      phonemeAccuracy: 0,
      spatialAudioReadiness: 0,
      reactiveResponse: 0,
      culturalContext: 0
    }

    // ゲーム種別による分析
    switch (gameResult.gameId) {
      case 'pureSoundLabBeatSaber':
        skillGains.phonemeAccuracy = Math.min(gameResult.accuracy * 0.8, 20)
        skillGains.spatialAudioReadiness = Math.min(gameResult.score / 1000 * 5, 15)
        skillGains.reactiveResponse = Math.min(gameResult.completedChallenges.length * 3, 12)
        break
        
      case 'soundBattleArena':
        skillGains.spatialAudioReadiness = Math.min(gameResult.accuracy * 0.6, 25)
        skillGains.reactiveResponse = Math.min(gameResult.score / 500 * 8, 20)
        skillGains.culturalContext = Math.min(gameResult.completedChallenges.length * 2, 10)
        break
        
      case 'rhythmPhonicsDance':
        skillGains.phonemeAccuracy = Math.min(gameResult.accuracy * 0.7, 18)
        skillGains.reactiveResponse = Math.min(gameResult.score / 800 * 6, 16)
        skillGains.culturalContext = Math.min(gameResult.completedChallenges.length * 4, 15)
        break
    }

    return skillGains
  }

  /**
   * VRシナリオ準備度の更新
   */
  private async updateScenarioReadiness(gameResult: VRGameResult): Promise<VRScenarioReadiness[]> {
    const scenarios: VRScenarioReadiness[] = []

    // 各VRシナリオに対する準備度を計算
    const scenarioMappings = {
      'restaurant_ordering': {
        phonemes: ['r', 'l', 'th', 'w'],
        baseReadiness: 40,
        gameBonus: {
          pureSoundLabBeatSaber: 15,
          soundBattleArena: 10,
          rhythmPhonicsDance: 12
        }
      },
      'airport_checkin': {
        phonemes: ['p', 'b', 'f', 'v'],
        baseReadiness: 30,
        gameBonus: {
          pureSoundLabBeatSaber: 12,
          soundBattleArena: 18,
          rhythmPhonicsDance: 8
        }
      },
      'business_meeting': {
        phonemes: ['th', 'z', 's', 'sh'],
        baseReadiness: 20,
        gameBonus: {
          pureSoundLabBeatSaber: 10,
          soundBattleArena: 8,
          rhythmPhonicsDance: 15
        }
      }
    }

    for (const [scenarioId, config] of Object.entries(scenarioMappings)) {
      const phonemeAccuracy = this.calculatePhonemeAccuracy(gameResult, config.phonemes)
      const gameBonus = config.gameBonus[gameResult.gameId] || 0
      const readinessLevel = Math.min(config.baseReadiness + gameBonus + phonemeAccuracy, 100)

      scenarios.push({
        scenarioId,
        scenarioName: this.getScenarioName(scenarioId),
        readinessLevel,
        requiredSkills: config.phonemes,
        skillGaps: this.identifySkillGaps(gameResult, config.phonemes),
        estimatedReadyDate: this.estimateReadyDate(readinessLevel)
      })
    }

    return scenarios
  }

  /**
   * 音素精度の計算
   */
  private calculatePhonemeAccuracy(gameResult: VRGameResult, targetPhonemes: string[]): number {
    const relevantSkills = gameResult.phonemeSkills.filter(skill => 
      targetPhonemes.includes(skill.phoneme)
    )
    
    if (relevantSkills.length === 0) return 0
    
    const averageAccuracy = relevantSkills.reduce((sum, skill) => sum + skill.accuracy, 0) / relevantSkills.length
    return Math.min(averageAccuracy * 0.3, 30)
  }

  /**
   * スキルギャップの特定
   */
  private identifySkillGaps(gameResult: VRGameResult, requiredPhonemes: string[]): string[] {
    const gaps: string[] = []
    
    for (const phoneme of requiredPhonemes) {
      const skill = gameResult.phonemeSkills.find(s => s.phoneme === phoneme)
      if (!skill || skill.accuracy < 70) {
        gaps.push(phoneme)
      }
    }
    
    return gaps
  }

  /**
   * 準備完了予想日の推定
   */
  private estimateReadyDate(readinessLevel: number): Date | null {
    if (readinessLevel >= 90) return new Date() // 既に準備完了
    
    const daysNeeded = Math.ceil((90 - readinessLevel) / 2) // 1日2%の向上を想定
    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded)
    
    return estimatedDate
  }

  /**
   * VRアカデミーへの実際の送信
   */
  private async sendToVRAcademy(payload: any): Promise<boolean> {
    try {
      // 開発環境では模擬送信
      if (import.meta.env.DEV) {
        logger.log('🧪 [DEV] VRアカデミー模擬送信:', payload)
        await new Promise(resolve => setTimeout(resolve, 500)) // 模擬遅延
        return true
      }

      // 本番環境でのAPI送信
      const response = await fetch('/api/vr-academy/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(payload)
      })

      return response.ok

    } catch (error) {
      logger.error('VRアカデミー送信エラー:', error)
      return false
    }
  }

  /**
   * プレイヤープロフィールデータの取得
   */
  private getPlayerProfileData() {
    return {
      playerId: this.playerStore.playerId,
      level: this.playerStore.level,
      totalCrystals: this.playerStore.totalCrystals,
      overallVRReadiness: this.playerStore.overallVRReadiness,
      playTime: this.playerStore.totalPlayTime,
      preferredDifficulty: this.playerStore.preferredDifficulty
    }
  }

  /**
   * 認証トークンの取得
   */
  private getAuthToken(): string {
    return localStorage.getItem('vr_academy_token') || 'dev_token'
  }

  /**
   * シナリオ名の取得
   */
  private getScenarioName(scenarioId: string): string {
    const names = {
      'restaurant_ordering': 'レストラン注文体験',
      'airport_checkin': '空港チェックイン',
      'business_meeting': 'ビジネス会議'
    }
    return names[scenarioId] || scenarioId
  }

  /**
   * 同期キューへの追加
   */
  private addToSyncQueue(gameResult: VRGameResult) {
    this.syncQueue.push(gameResult)
    localStorage.setItem('vr_sync_queue', JSON.stringify(this.syncQueue))
  }

  /**
   * ネットワーク監視のセットアップ
   */
  private setupNetworkMonitoring() {
    this.isOnline.value = navigator.onLine
    
    window.addEventListener('online', () => {
      this.isOnline.value = true
      this.processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline.value = false
    })
  }

  /**
   * 定期同期の開始
   */
  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline.value && this.syncQueue.length > 0) {
        this.processSyncQueue()
      }
    }, 30000) // 30秒ごと
  }

  /**
   * 同期キューの処理
   */
  private async processSyncQueue() {
    if (this.syncQueue.length === 0) return

    logger.log(`🔄 同期キューの処理開始: ${this.syncQueue.length}件`)
    
    const results = []
    for (const gameResult of this.syncQueue) {
      const success = await this.syncGameResult(gameResult)
      results.push(success)
    }

    // 成功した項目をキューから削除
    this.syncQueue = this.syncQueue.filter((_, index) => !results[index])
    localStorage.setItem('vr_sync_queue', JSON.stringify(this.syncQueue))
  }

  /**
   * ローカルVRデータの更新
   */
  private updateLocalVRData(gameResult: VRGameResult) {
    const vrData = JSON.parse(localStorage.getItem('vr_academy_data') || '{}')
    
    if (!vrData.gameHistory) vrData.gameHistory = []
    vrData.gameHistory.push({
      gameId: gameResult.gameId,
      playedAt: gameResult.playedAt,
      vrReadinessGain: gameResult.vrReadinessGain
    })

    // 最新100件のみ保持
    if (vrData.gameHistory.length > 100) {
      vrData.gameHistory = vrData.gameHistory.slice(-100)
    }

    localStorage.setItem('vr_academy_data', JSON.stringify(vrData))
  }

  /**
   * 同期成功の通知
   */
  private emitSyncSuccess(gameResult: VRGameResult) {
    window.dispatchEvent(new CustomEvent('vr-academy-sync', {
      detail: {
        gameId: gameResult.gameId,
        vrReadinessGain: gameResult.vrReadinessGain,
        syncTime: new Date()
      }
    }))
  }

  /**
   * 同期状態の取得
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline.value,
      queueSize: this.syncQueue.length,
      lastSync: this.lastSyncTime.value
    }
  }

  /**
   * VRアカデミー準備度の即座更新
   */
  async updateVRReadinessNow() {
    const currentReadiness = await this.vrReadiness.generateReport()
    return this.sendToVRAcademy({
      type: 'readiness_update',
      readiness: currentReadiness,
      timestamp: new Date().toISOString()
    })
  }
}

// シングルトンインスタンス
let vrDataSyncInstance: VRDataSyncAPI | null = null

export function useVRDataSync(): VRDataSyncAPI {
  if (!vrDataSyncInstance) {
    vrDataSyncInstance = new VRDataSyncAPI()
  }
  return vrDataSyncInstance
}

// VRゲーム結果ビルダーヘルパー
export class VRGameResultBuilder {
  private result: Partial<VRGameResult> = {}

  constructor(gameId: string, gameName: string) {
    this.result = {
      gameId,
      gameName,
      playedAt: new Date(),
      phonemeSkills: [],
      mistakes: [],
      completedChallenges: []
    }
  }

  setBasicStats(score: number, accuracy: number, duration: number) {
    this.result.score = score
    this.result.accuracy = accuracy
    this.result.duration = duration
    return this
  }

  addPhonemeSkill(phoneme: string, accuracy: number, responseTime: number, attempts: number, successes: number, difficulty: 'beginner' | 'intermediate' | 'advanced') {
    this.result.phonemeSkills!.push({
      phoneme,
      accuracy,
      responseTime,
      attempts,
      successes,
      difficulty,
      vrSkillMapping: this.getVRSkillMapping(phoneme)
    })
    return this
  }

  addMistake(phoneme: string, expected: string, actual: string, timestamp: number, context: string) {
    this.result.mistakes!.push({
      phoneme,
      expectedResponse: expected,
      actualResponse: actual,
      timestamp,
      context,
      vrScenarioRelevance: this.getVRScenarioRelevance(phoneme)
    })
    return this
  }

  addCompletedChallenge(challengeId: string) {
    this.result.completedChallenges!.push(challengeId)
    return this
  }

  setVRReadinessGain(gain: number) {
    this.result.vrReadinessGain = gain
    return this
  }

  setCrystalReward(crystals: number) {
    this.result.crystalReward = crystals
    return this
  }

  private getVRSkillMapping(phoneme: string): string[] {
    const mapping = {
      'r': ['restaurant_ordering', 'pronunciation_practice'],
      'l': ['restaurant_ordering', 'casual_conversation'],
      'th': ['business_meeting', 'presentation_skills'],
      'w': ['casual_conversation', 'restaurant_ordering'],
      'v': ['airport_checkin', 'travel_english'],
      'f': ['airport_checkin', 'formal_communication']
    }
    return mapping[phoneme] || ['general_pronunciation']
  }

  private getVRScenarioRelevance(phoneme: string): string {
    const relevance = {
      'r': 'restaurant_ordering',
      'l': 'casual_conversation',
      'th': 'business_meeting',
      'w': 'casual_conversation',
      'v': 'airport_checkin',
      'f': 'formal_communication'
    }
    return relevance[phoneme] || 'general_practice'
  }

  build(): VRGameResult {
    // セッションデータの自動生成
    this.result.sessionData = {
      playerLevel: 1, // 実際の値は外部から設定
      sessionNumber: 1,
      adaptiveAdjustments: [],
      spatialAudio: {
        spatialAccuracy: Math.min(this.result.accuracy! * 0.8, 100),
        depthPerception: Math.random() * 100,
        multiSourceTracking: Math.random() * 100,
        environmentalAdaptation: Math.random() * 100
      },
      vrReadinessMetrics: {
        overallReadiness: this.result.vrReadinessGain || 0,
        skillCategories: {
          basicInteraction: 50,
          conversationalFluency: 40,
          culturalAdaptation: 30,
          advancedCommunication: 20
        },
        scenarioReadiness: [],
        recommendedProgression: []
      }
    }

    return this.result as VRGameResult
  }
}