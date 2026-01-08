import { usePlayerProfileStore } from '@/stores/playerProfile'
import type { PlayerProfile } from '@/stores/playerProfile'
import logger from '@/utils/logger'

// VRアカデミー同期用API型定義
interface VRAcademyProfile {
  userId: string
  level: number
  exp: number
  skills: Record<string, number>
  vrReadiness: Record<string, number>
  achievements: string[]
  crystals: Record<string, number>
  preferences: {
    vrDeviceType: string
    learningMode: string
    language: string
  }
}

interface SyncResponse {
  success: boolean
  data?: VRAcademyProfile
  error?: string
  lastSyncTime: string
}

interface DeviceCalibration {
  deviceType: string
  headsetModel: string
  controllerType: string
  playArea: {
    width: number
    height: number
    depth: number
  }
  tracking: {
    headTracking: boolean
    handTracking: boolean
    eyeTracking: boolean
  }
  performance: {
    targetFps: number
    renderScale: number
    foveatedRendering: boolean
  }
}

class VRAcademySync {
  private baseUrl: string
  private apiKey: string | null = null
  private syncInProgress = false
  private retryCount = 0
  private maxRetries = 3

  constructor() {
    // 環境に応じてベースURLを設定
    this.baseUrl = import.meta.env.PROD 
      ? 'https://api.movwise-vr-academy.com/v1'
      : 'http://localhost:3001/api/vr-academy'
  }

  // API認証の設定
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // VRアカデミーへの接続テスト
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      })
      
      return response.ok
    } catch (error) {
      logger.error('VR Academy connection test failed:', error)
      return false
    }
  }

  // ユーザー認証とプロフィール作成
  async authenticateUser(credentials: {
    email: string
    password?: string
    vrDeviceId: string
    deviceType: string
  }): Promise<{ userId: string; apiKey: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      const data = await response.json()
      
      // APIキーを保存
      this.setApiKey(data.apiKey)
      
      return {
        userId: data.userId,
        apiKey: data.apiKey
      }
    } catch (error) {
      logger.error('VR Academy authentication failed:', error)
      return null
    }
  }

  // プレイヤープロフィールをVRアカデミーに同期
  async syncToVRAcademy(playerData: any): Promise<SyncResponse> {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress', lastSyncTime: new Date().toISOString() }
    }

    if (!this.apiKey) {
      return { success: false, error: 'No API key set', lastSyncTime: new Date().toISOString() }
    }

    this.syncInProgress = true
    this.retryCount = 0

    try {
      const vrProfile = this.transformToVRProfile(playerData)
      
      const response = await this.sendSyncRequest(vrProfile)
      
      if (response.success) {
        // 同期成功時の処理
        const playerStore = usePlayerProfileStore()
        playerStore.updateVirtualAcademyProfile({
          syncStatus: 'connected',
          lastSyncDate: new Date().toISOString()
        })
      }

      return response
    } catch (error) {
      logger.error('Sync to VR Academy failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        lastSyncTime: new Date().toISOString()
      }
    } finally {
      this.syncInProgress = false
    }
  }

  // VRアカデミーからプレイヤーデータを取得
  async syncFromVRAcademy(userId: string): Promise<SyncResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key set', lastSyncTime: new Date().toISOString() }
    }

    try {
      const response = await fetch(`${this.baseUrl}/players/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: VRAcademyProfile = await response.json()
      
      // ローカルプロフィールを更新
      await this.applyVRProfileToLocal(data)

      return {
        success: true,
        data,
        lastSyncTime: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Sync from VR Academy failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        lastSyncTime: new Date().toISOString()
      }
    }
  }

  // VRデバイスのキャリブレーション設定を同期
  async syncDeviceCalibration(calibration: DeviceCalibration): Promise<boolean> {
    if (!this.apiKey) {
      logger.error('No API key for device calibration sync')
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/devices/calibration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(calibration)
      })

      return response.ok
    } catch (error) {
      logger.error('Device calibration sync failed:', error)
      return false
    }
  }

  // VRセッションデータの送信
  async uploadVRSessionData(sessionData: {
    sessionId: string
    startTime: string
    endTime: string
    duration: number
    gameType: string
    score: number
    accuracy: number
    motionData?: any[]
    interactionEvents?: any[]
  }): Promise<boolean> {
    if (!this.apiKey) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(sessionData)
      })

      return response.ok
    } catch (error) {
      logger.error('VR session data upload failed:', error)
      return false
    }
  }

  // VRアカデミーの学習コンテンツを取得
  async fetchVRLearningContent(level: number, category: string): Promise<any[]> {
    if (!this.apiKey) {
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/content?level=${level}&category=${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch VR learning content')
      }

      return await response.json()
    } catch (error) {
      logger.error('VR learning content fetch failed:', error)
      return []
    }
  }

  // リアルタイム同期の開始（WebSocket接続）
  async startRealtimeSync(userId: string): Promise<WebSocket | null> {
    if (!this.apiKey) {
      return null
    }

    try {
      const wsUrl = this.baseUrl.replace('http', 'ws') + `/realtime/${userId}?token=${this.apiKey}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        logger.log('VR Academy realtime sync connected')
        const playerStore = usePlayerProfileStore()
        playerStore.updateVirtualAcademyProfile({ syncStatus: 'connected' })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleRealtimeUpdate(data)
        } catch (error) {
          logger.error('Failed to parse realtime update:', error)
        }
      }

      ws.onerror = (error) => {
        logger.error('VR Academy realtime sync error:', error)
        const playerStore = usePlayerProfileStore()
        playerStore.updateVirtualAcademyProfile({ syncStatus: 'error' })
      }

      ws.onclose = () => {
        logger.log('VR Academy realtime sync disconnected')
        const playerStore = usePlayerProfileStore()
        playerStore.updateVirtualAcademyProfile({ syncStatus: 'disconnected' })
      }

      return ws
    } catch (error) {
      logger.error('Failed to start realtime sync:', error)
      return null
    }
  }

  // プライベートメソッド
  private transformToVRProfile(playerData: any): VRAcademyProfile {
    return {
      userId: playerData.virtualAcademyProfile.userId,
      level: playerData.level,
      exp: playerData.totalExp,
      skills: playerData.skills,
      vrReadiness: playerData.vrReadiness,
      achievements: playerData.achievements
        .filter((a: any) => a.earned)
        .map((a: any) => a.id),
      crystals: playerData.crystals,
      preferences: {
        vrDeviceType: playerData.virtualAcademyProfile.vrDeviceType || 'unknown',
        learningMode: playerData.virtualAcademyProfile.preferredLearningMode,
        language: 'ja' // 日本語固定、将来的には設定可能に
      }
    }
  }

  private async sendSyncRequest(vrProfile: VRAcademyProfile): Promise<SyncResponse> {
    const response = await fetch(`${this.baseUrl}/players/${vrProfile.userId}/sync`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(vrProfile)
    })

    if (!response.ok) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        logger.log(`Retrying sync (${this.retryCount}/${this.maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount))
        return this.sendSyncRequest(vrProfile)
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
      lastSyncTime: new Date().toISOString()
    }
  }

  private async applyVRProfileToLocal(vrProfile: VRAcademyProfile): Promise<void> {
    const playerStore = usePlayerProfileStore()
    
    // VRアカデミーのデータをローカルプロフィールに適用
    playerStore.updateProfile({
      level: Math.max(playerStore.profile.level, vrProfile.level),
      totalExp: Math.max(playerStore.profile.totalExp, vrProfile.exp)
    })

    // スキルの更新（最大値を取る）
    Object.entries(vrProfile.skills).forEach(([skill, value]) => {
      if (skill in playerStore.profile.skills) {
        const currentValue = playerStore.profile.skills[skill as keyof typeof playerStore.profile.skills]
        if (value > currentValue) {
          playerStore.updateSkill(skill as keyof typeof playerStore.profile.skills, value - currentValue)
        }
      }
    })

    // VR準備度の更新
    playerStore.updateVRReadiness(vrProfile.vrReadiness)

    // クリスタルの更新
    playerStore.addCrystals(vrProfile.crystals)

    // 実績の同期
    vrProfile.achievements.forEach(achievementId => {
      playerStore.unlockAchievement(achievementId)
    })
  }

  private handleRealtimeUpdate(data: any): void {
    const playerStore = usePlayerProfileStore()
    
    switch (data.type) {
      case 'achievement_unlocked':
        playerStore.unlockAchievement(data.achievementId)
        break
      
      case 'exp_gained':
        playerStore.addExp(data.amount, data.isVRActivity || false)
        break
      
      case 'crystals_earned':
        playerStore.addCrystals(data.crystals)
        break
      
      case 'vr_readiness_updated':
        playerStore.updateVRReadiness(data.vrReadiness)
        break
      
      case 'profile_updated':
        playerStore.updateProfile(data.updates)
        break
      
      default:
        logger.log('Unknown realtime update type:', data.type)
    }
  }
}

// シングルトンインスタンス
export const vrAcademySync = new VRAcademySync()

// 便利な関数をエクスポート
export const connectToVRAcademy = async (credentials: {
  email: string
  password?: string
  vrDeviceId: string
  deviceType: string
}): Promise<boolean> => {
  const playerStore = usePlayerProfileStore()
  
  try {
    playerStore.updateVirtualAcademyProfile({ syncStatus: 'syncing' })
    
    const authResult = await vrAcademySync.authenticateUser(credentials)
    if (!authResult) {
      playerStore.updateVirtualAcademyProfile({ syncStatus: 'error' })
      return false
    }
    
    // プロフィールストアを更新
    await playerStore.connectToVirtualAcademy(authResult.userId, credentials.deviceType)
    
    // 初回同期
    const syncResult = await vrAcademySync.syncToVRAcademy(playerStore.profile)
    if (syncResult.success) {
      playerStore.updateVirtualAcademyProfile({ syncStatus: 'connected' })
      return true
    } else {
      playerStore.updateVirtualAcademyProfile({ syncStatus: 'error' })
      return false
    }
  } catch (error) {
    logger.error('VR Academy connection failed:', error)
    playerStore.updateVirtualAcademyProfile({ syncStatus: 'error' })
    return false
  }
}

export const syncPlayerData = async (): Promise<boolean> => {
  const playerStore = usePlayerProfileStore()
  
  if (playerStore.academyConnectionStatus !== 'connected') {
    return false
  }
  
  const result = await vrAcademySync.syncToVRAcademy(playerStore.profile)
  return result.success
}

export const uploadVRSession = async (sessionData: any): Promise<boolean> => {
  return await vrAcademySync.uploadVRSessionData(sessionData)
}

export const fetchVRContent = async (level: number, category: string): Promise<any[]> => {
  return await vrAcademySync.fetchVRLearningContent(level, category)
}

export default vrAcademySync