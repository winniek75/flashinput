import logger from '@/utils/logger'

/**
 * VR Academy Bridge Service
 * バーチャルアカデミーとの連携API
 * Spatial.io統合とWebXR対応を含む
 */

import type {
  VRScenarioData,
  VRAcademyBridgeData,
  VRPlayerProgress,
  AcademyCredentials,
  SpatialIntegration,
  SpatialPermission,
  VRScenarioHistory
} from '@/story/types/StoryTypes'

interface VRAcademyConfig {
  apiEndpoint: string
  spatialioApiKey: string
  webxrEnabled: boolean
  sessionTimeout: number
  maxRetries: number
}

interface VRSessionData {
  sessionId: string
  playerId: string
  scenarioId: string
  spatialSpaceId?: string
  startTime: string
  participants: VRParticipant[]
  status: 'initializing' | 'active' | 'paused' | 'completed' | 'error'
}

interface VRParticipant {
  id: string
  name: string
  role: 'student' | 'teacher' | 'observer'
  avatar?: string
  position?: { x: number; y: number; z: number }
  isConnected: boolean
}

interface WebXRSession {
  session: XRSession | null
  referenceSpace: XRReferenceSpace | null
  isActive: boolean
}

export class VRAcademyBridge {
  private config: VRAcademyConfig
  private currentSession: VRSessionData | null = null
  private webxrSession: WebXRSession = {
    session: null,
    referenceSpace: null,
    isActive: false
  }
  private eventHandlers: Map<string, Function[]> = new Map()
  private reconnectAttempts = 0
  private websocket: WebSocket | null = null

  constructor(config: Partial<VRAcademyConfig> = {}) {
    this.config = {
      apiEndpoint: process.env.VUE_APP_VR_ACADEMY_API || 'https://api.vracademy.example.com',
      spatialioApiKey: process.env.VUE_APP_SPATIAL_API_KEY || '',
      webxrEnabled: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxRetries: 3,
      ...config
    }

    this.initializeWebXR()
  }

  // ======= VR Session Management =======

  async createVRSession(
    scenarioData: VRScenarioData,
    playerData: VRPlayerProgress,
    credentials: AcademyCredentials
  ): Promise<VRSessionData> {
    try {
      const sessionPayload = {
        scenarioId: scenarioData.id,
        playerId: credentials.studentId,
        playerProgress: playerData,
        spatialioId: scenarioData.spatialioId,
        requiredVRReadiness: scenarioData.requiredVRReadiness,
        maxParticipants: scenarioData.participants,
        estimatedDuration: scenarioData.estimatedDuration
      }

      const response = await this.makeAPIRequest('/sessions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionPayload)
      })

      if (!response.ok) {
        throw new Error(`Failed to create VR session: ${response.statusText}`)
      }

      const sessionData: VRSessionData = await response.json()
      this.currentSession = sessionData

      // Initialize WebSocket for real-time communication
      await this.initializeWebSocket(sessionData.sessionId, credentials.apiKey)

      // Setup Spatial.io if available
      if (scenarioData.spatialioId) {
        await this.initializeSpatialIO(scenarioData.spatialioId, sessionData)
      }

      this.emit('sessionCreated', sessionData)
      logger.log('🚀 VR Session created:', sessionData.sessionId)

      return sessionData
    } catch (error) {
      logger.error('Failed to create VR session:', error)
      throw error
    }
  }

  async joinVRSession(
    sessionId: string,
    playerData: VRPlayerProgress,
    credentials: AcademyCredentials
  ): Promise<VRSessionData> {
    try {
      const joinPayload = {
        sessionId,
        playerId: credentials.studentId,
        playerProgress: playerData,
        role: 'student'
      }

      const response = await this.makeAPIRequest('/sessions/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(joinPayload)
      })

      if (!response.ok) {
        throw new Error(`Failed to join VR session: ${response.statusText}`)
      }

      const sessionData: VRSessionData = await response.json()
      this.currentSession = sessionData

      await this.initializeWebSocket(sessionId, credentials.apiKey)

      this.emit('sessionJoined', sessionData)
      logger.log('🤝 Joined VR Session:', sessionId)

      return sessionData
    } catch (error) {
      logger.error('Failed to join VR session:', error)
      throw error
    }
  }

  async startVRExperience(): Promise<boolean> {
    if (!this.currentSession) {
      throw new Error('No active VR session')
    }

    try {
      // Start WebXR session if supported
      if (this.config.webxrEnabled && navigator.xr) {
        await this.startWebXRSession()
      }

      // Notify VR Academy
      await this.updateSessionStatus('active')

      this.emit('vrExperienceStarted', this.currentSession)
      logger.log('🥽 VR Experience started')

      return true
    } catch (error) {
      logger.error('Failed to start VR experience:', error)
      return false
    }
  }

  async endVRSession(): Promise<VRScenarioHistory> {
    if (!this.currentSession) {
      throw new Error('No active VR session')
    }

    try {
      const endTime = new Date().toISOString()
      const duration = Math.round(
        (new Date(endTime).getTime() - new Date(this.currentSession.startTime).getTime()) / 1000 / 60
      )

      // End WebXR session
      if (this.webxrSession.session) {
        await this.webxrSession.session.end()
      }

      // Notify VR Academy
      const response = await this.makeAPIRequest(`/sessions/${this.currentSession.sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endTime,
          duration
        })
      })

      const sessionResults = await response.json()

      // Create history record
      const history: VRScenarioHistory = {
        scenarioId: this.currentSession.scenarioId,
        completedAt: endTime,
        duration,
        participants: this.currentSession.participants.map(p => p.name),
        achievements: sessionResults.achievements || [],
        rating: sessionResults.rating || 0
      }

      // Cleanup
      this.cleanup()

      this.emit('sessionEnded', history)
      logger.log('✅ VR Session ended:', history)

      return history
    } catch (error) {
      logger.error('Failed to end VR session:', error)
      throw error
    }
  }

  // ======= WebXR Integration =======

  private async initializeWebXR(): Promise<void> {
    if (!navigator.xr || !this.config.webxrEnabled) {
      logger.warn('WebXR not supported or disabled')
      return
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      if (supported) {
        logger.log('✅ WebXR VR sessions supported')
        this.emit('webxrReady', true)
      } else {
        logger.warn('⚠️ WebXR VR sessions not supported')
        this.emit('webxrReady', false)
      }
    } catch (error) {
      logger.error('WebXR initialization failed:', error)
      this.emit('webxrReady', false)
    }
  }

  private async startWebXRSession(): Promise<void> {
    if (!navigator.xr) {
      throw new Error('WebXR not available')
    }

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'eye-tracking']
      })

      const referenceSpace = await session.requestReferenceSpace('local-floor')

      this.webxrSession = {
        session,
        referenceSpace,
        isActive: true
      }

      // Setup session event handlers
      session.addEventListener('end', () => {
        this.webxrSession.isActive = false
        this.emit('webxrSessionEnded')
      })

      session.addEventListener('inputsourceschange', (event) => {
        this.handleInputSourcesChange(event)
      })

      // Start render loop
      session.requestAnimationFrame(this.onXRFrame.bind(this))

      this.emit('webxrSessionStarted', session)
      logger.log('🥽 WebXR session started')
    } catch (error) {
      logger.error('Failed to start WebXR session:', error)
      throw error
    }
  }

  private onXRFrame(time: number, frame: XRFrame): void {
    if (!this.webxrSession.session || !this.webxrSession.referenceSpace) {
      return
    }

    const session = this.webxrSession.session
    const pose = frame.getViewerPose(this.webxrSession.referenceSpace)

    if (pose) {
      // Handle VR rendering and interactions
      this.handleVRFrame(time, frame, pose)
    }

    session.requestAnimationFrame(this.onXRFrame.bind(this))
  }

  private handleVRFrame(time: number, frame: XRFrame, pose: XRViewerPose): void {
    // VR rendering logic would go here
    // This is where you'd integrate with Three.js or other 3D libraries
    
    // Handle hand tracking
    if (frame.session.inputSources) {
      for (const inputSource of frame.session.inputSources) {
        if (inputSource.hand) {
          this.handleHandTracking(frame, inputSource)
        }
      }
    }

    // Emit frame data for external handling
    this.emit('vrFrame', { time, frame, pose })
  }

  private handleHandTracking(frame: XRFrame, inputSource: XRInputSource): void {
    if (!inputSource.hand || !this.webxrSession.referenceSpace) return

    const handData: { [key: string]: XRJointPose | undefined } = {}

    for (const [jointName, joint] of inputSource.hand) {
      const pose = frame.getJointPose(joint, this.webxrSession.referenceSpace)
      if (pose) {
        handData[jointName] = pose
      }
    }

    this.emit('handTracking', {
      handedness: inputSource.handedness,
      joints: handData
    })
  }

  private handleInputSourcesChange(event: XRInputSourceChangeEvent): void {
    this.emit('inputSourcesChanged', event)
  }

  // ======= Spatial.io Integration =======

  private async initializeSpatialIO(
    spaceId: string,
    sessionData: VRSessionData
  ): Promise<void> {
    try {
      const spatialConfig: SpatialIntegration = {
        spaceId,
        userId: sessionData.playerId,
        role: 'student',
        permissions: [
          { action: 'interact', resource: 'objects', scope: 'self' },
          { action: 'create', resource: 'content', scope: 'team' }
        ],
        customData: {
          sessionId: sessionData.sessionId,
          vrReadiness: 75, // This would come from player profile
          learningObjectives: []
        }
      }

      // Initialize Spatial.io SDK (pseudo-code as actual SDK would be different)
      if (typeof window !== 'undefined' && (window as any).Spatial) {
        await (window as any).Spatial.initialize({
          apiKey: this.config.spatialioApiKey,
          spaceId,
          userId: sessionData.playerId,
          customData: spatialConfig.customData
        })

        logger.log('🌐 Spatial.io initialized for space:', spaceId)
        this.emit('spatialInitialized', spatialConfig)
      }
    } catch (error) {
      logger.error('Failed to initialize Spatial.io:', error)
    }
  }

  // ======= Real-time Communication =======

  private async initializeWebSocket(sessionId: string, apiKey: string): Promise<void> {
    const wsUrl = this.config.apiEndpoint.replace('http', 'ws') + `/sessions/${sessionId}/ws`
    
    try {
      this.websocket = new WebSocket(wsUrl, ['vr-academy-v1'])
      
      this.websocket.onopen = () => {
        logger.log('📡 WebSocket connected')
        this.websocket?.send(JSON.stringify({
          type: 'authenticate',
          apiKey
        }))
        this.emit('websocketConnected')
      }

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(JSON.parse(event.data))
      }

      this.websocket.onclose = () => {
        logger.log('📡 WebSocket disconnected')
        this.emit('websocketDisconnected')
        this.attemptReconnect(sessionId, apiKey)
      }

      this.websocket.onerror = (error) => {
        logger.error('WebSocket error:', error)
        this.emit('websocketError', error)
      }
    } catch (error) {
      logger.error('Failed to initialize WebSocket:', error)
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'participantJoined':
        this.handleParticipantJoined(message.data)
        break
      case 'participantLeft':
        this.handleParticipantLeft(message.data)
        break
      case 'interactionUpdate':
        this.handleInteractionUpdate(message.data)
        break
      case 'sessionUpdate':
        this.handleSessionUpdate(message.data)
        break
      default:
        logger.log('Unknown WebSocket message:', message)
    }
  }

  private handleParticipantJoined(participant: VRParticipant): void {
    if (this.currentSession) {
      this.currentSession.participants.push(participant)
      this.emit('participantJoined', participant)
    }
  }

  private handleParticipantLeft(participantId: string): void {
    if (this.currentSession) {
      this.currentSession.participants = this.currentSession.participants.filter(
        p => p.id !== participantId
      )
      this.emit('participantLeft', participantId)
    }
  }

  private handleInteractionUpdate(data: any): void {
    this.emit('interactionUpdate', data)
  }

  private handleSessionUpdate(data: any): void {
    if (this.currentSession) {
      Object.assign(this.currentSession, data)
      this.emit('sessionUpdate', this.currentSession)
    }
  }

  // ======= API Communication =======

  private async makeAPIRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const url = `${this.config.apiEndpoint}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 30000 // 30 second timeout
      })

      if (!response.ok && response.status >= 500) {
        // Retry on server errors
        if (this.reconnectAttempts < this.config.maxRetries) {
          this.reconnectAttempts++
          logger.log(`Retrying API request (${this.reconnectAttempts}/${this.config.maxRetries})`)
          await this.delay(1000 * this.reconnectAttempts)
          return this.makeAPIRequest(endpoint, options)
        }
      }

      this.reconnectAttempts = 0
      return response
    } catch (error) {
      logger.error('API request failed:', error)
      throw error
    }
  }

  private async updateSessionStatus(status: VRSessionData['status']): Promise<void> {
    if (!this.currentSession) return

    try {
      await this.makeAPIRequest(`/sessions/${this.currentSession.sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      this.currentSession.status = status
      this.emit('statusUpdated', status)
    } catch (error) {
      logger.error('Failed to update session status:', error)
    }
  }

  // ======= Event System =======

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  // ======= Utility Methods =======

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async attemptReconnect(sessionId: string, apiKey: string): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxRetries) {
      logger.error('Max reconnection attempts reached')
      this.emit('reconnectFailed')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    logger.log(`Attempting to reconnect in ${delay}ms...`)
    await this.delay(delay)
    
    try {
      await this.initializeWebSocket(sessionId, apiKey)
    } catch (error) {
      logger.error('Reconnection failed:', error)
      this.attemptReconnect(sessionId, apiKey)
    }
  }

  private cleanup(): void {
    // Close WebSocket
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }

    // End WebXR session
    if (this.webxrSession.session) {
      this.webxrSession.session.end()
      this.webxrSession = {
        session: null,
        referenceSpace: null,
        isActive: false
      }
    }

    // Clear session data
    this.currentSession = null
    this.reconnectAttempts = 0

    logger.log('🧹 VR Academy Bridge cleaned up')
  }

  // ======= Public Getters =======

  get isSessionActive(): boolean {
    return this.currentSession?.status === 'active'
  }

  get isWebXRActive(): boolean {
    return this.webxrSession.isActive
  }

  get currentSessionData(): VRSessionData | null {
    return this.currentSession
  }

  get webXRSupported(): boolean {
    return !!navigator.xr && this.config.webxrEnabled
  }

  // ======= Advanced Features =======

  async recordLearningProgress(data: {
    skillType: string
    progressValue: number
    timestamp: string
  }): Promise<void> {
    if (!this.currentSession) return

    try {
      await this.makeAPIRequest(`/sessions/${this.currentSession.sessionId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      this.emit('progressRecorded', data)
    } catch (error) {
      logger.error('Failed to record learning progress:', error)
    }
  }

  async sendInteractionData(interaction: {
    type: string
    target: string
    result: any
    timestamp: string
  }): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'interaction',
        data: interaction
      }))
    }
  }

  async getRecommendations(): Promise<any[]> {
    if (!this.currentSession) return []

    try {
      const response = await this.makeAPIRequest(
        `/sessions/${this.currentSession.sessionId}/recommendations`,
        { method: 'GET' }
      )

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      logger.error('Failed to get recommendations:', error)
    }

    return []
  }

  // Cleanup on destroy
  destroy(): void {
    this.cleanup()
    this.eventHandlers.clear()
  }
}

// Singleton instance
export const vrAcademyBridge = new VRAcademyBridge()

// Export types for external use
export type {
  VRSessionData,
  VRParticipant,
  WebXRSession,
  VRAcademyConfig
}