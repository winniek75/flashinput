/**
 * MovWISE Co-Learning Platform
 * リアルタイム講師協力システム + WebRTC + Socket.io
 */

import { io, Socket } from 'socket.io-client'

export interface Instructor {
  id: string
  name: string
  avatar: string
  expertise: string[]
  rating: number
  isOnline: boolean
  currentStudents: number
  maxStudents: number
  languages: string[]
  timezone: string
}

export interface CoLearningSession {
  sessionId: string
  studentId: string
  instructorId: string
  startTime: Date
  duration: number // minutes
  grammarTopic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  sessionType: 'individual' | 'group' | 'emergency'
  status: 'waiting' | 'active' | 'completed' | 'cancelled'
  participants: string[]
  sharedScreen: boolean
  voiceChat: boolean
  textChat: boolean
  whiteboard: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: 'text' | 'audio' | 'system' | 'grammar_correction'
  grammarData?: {
    original: string
    corrected: string
    explanation: string
  }
}

export interface EmergencyRequest {
  id: string
  studentId: string
  studentName: string
  grammarTopic: string
  difficulty: string
  urgency: 'low' | 'medium' | 'high'
  description: string
  timestamp: Date
  status: 'pending' | 'assigned' | 'resolved'
  assignedInstructor?: string
}

export class CoopPlatformService {
  private socket: Socket | null = null
  private currentSession: CoLearningSession | null = null
  private availableInstructors: Map<string, Instructor> = new Map()
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null

  constructor() {
    this.initializeSocket()
    this.initializeWebRTC()
  }

  /**
   * Socket.io初期化
   */
  private initializeSocket(): void {
    this.socket = io(process.env.VUE_APP_COOP_SERVER_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      timeout: 20000
    })

    this.socket.on('connect', () => {
      console.log('🔗 Co-Learning Platform connected')
    })

    this.socket.on('instructor-list-updated', (instructors: Instructor[]) => {
      this.updateInstructorList(instructors)
    })

    this.socket.on('session-request-response', (response: any) => {
      this.handleSessionResponse(response)
    })

    this.socket.on('emergency-instructor-assigned', (assignment: any) => {
      this.handleEmergencyAssignment(assignment)
    })

    this.socket.on('chat-message', (message: ChatMessage) => {
      this.handleIncomingMessage(message)
    })

    this.socket.on('grammar-correction', (correction: any) => {
      this.handleGrammarCorrection(correction)
    })

    this.socket.on('webrtc-offer', (offer: RTCSessionDescriptionInit) => {
      this.handleWebRTCOffer(offer)
    })

    this.socket.on('webrtc-answer', (answer: RTCSessionDescriptionInit) => {
      this.handleWebRTCAnswer(answer)
    })

    this.socket.on('webrtc-ice-candidate', (candidate: RTCIceCandidateInit) => {
      this.handleICECandidate(candidate)
    })
  }

  /**
   * WebRTC初期化
   */
  private initializeWebRTC(): void {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    this.peerConnection = new RTCPeerConnection(configuration)

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc-ice-candidate', event.candidate)
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStreamReceived(this.remoteStream)
    }
  }

  /**
   * 利用可能講師リスト取得
   */
  async getAvailableInstructors(grammarTopic?: string): Promise<Instructor[]> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.emit('get-available-instructors', { grammarTopic })
        this.socket.once('instructor-list', (instructors: Instructor[]) => {
          resolve(instructors)
        })
      } else {
        resolve([])
      }
    })
  }

  /**
   * 講師リスト更新
   */
  private updateInstructorList(instructors: Instructor[]): void {
    this.availableInstructors.clear()
    instructors.forEach(instructor => {
      this.availableInstructors.set(instructor.id, instructor)
    })
  }

  /**
   * 協力学習セッション要求
   */
  async requestCoLearningSession(
    instructorId: string,
    grammarTopic: string,
    difficulty: string,
    sessionType: 'individual' | 'group' = 'individual'
  ): Promise<CoLearningSession> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket connection not available'))
        return
      }

      const request = {
        instructorId,
        grammarTopic,
        difficulty,
        sessionType,
        timestamp: new Date()
      }

      this.socket.emit('request-coop-session', request)
      
      this.socket.once('session-created', (session: CoLearningSession) => {
        this.currentSession = session
        resolve(session)
      })

      this.socket.once('session-rejected', (reason: string) => {
        reject(new Error(reason))
      })

      // 30秒でタイムアウト
      setTimeout(() => {
        reject(new Error('Session request timeout'))
      }, 30000)
    })
  }

  /**
   * 緊急ヘルプ要求
   */
  async requestEmergencyHelp(
    grammarTopic: string,
    difficulty: string,
    description: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<EmergencyRequest> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket connection not available'))
        return
      }

      const emergencyRequest: Partial<EmergencyRequest> = {
        grammarTopic,
        difficulty,
        description,
        urgency,
        timestamp: new Date()
      }

      this.socket.emit('emergency-help-request', emergencyRequest)

      this.socket.once('emergency-request-created', (request: EmergencyRequest) => {
        resolve(request)
      })

      this.socket.once('emergency-request-failed', (error: string) => {
        reject(new Error(error))
      })
    })
  }

  /**
   * 音声チャット開始
   */
  async startVoiceChat(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })

      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!)
        })

        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)

        if (this.socket) {
          this.socket.emit('webrtc-offer', offer)
        }
      }
    } catch (error) {
      console.error('Error starting voice chat:', error)
      throw error
    }
  }

  /**
   * 画面共有開始
   */
  async startScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      if (this.peerConnection) {
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )

        if (sender) {
          await sender.replaceTrack(videoTrack)
        } else {
          this.peerConnection.addTrack(videoTrack, screenStream)
        }
      }

      screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare()
      }
    } catch (error) {
      console.error('Error starting screen share:', error)
      throw error
    }
  }

  /**
   * 画面共有停止
   */
  async stopScreenShare(): Promise<void> {
    if (this.peerConnection && this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack)
      }
    }
  }

  /**
   * チャットメッセージ送信
   */
  sendChatMessage(message: string, type: 'text' | 'audio' = 'text'): void {
    if (!this.socket || !this.currentSession) return

    const chatMessage: Partial<ChatMessage> = {
      message,
      type,
      timestamp: new Date()
    }

    this.socket.emit('chat-message', {
      sessionId: this.currentSession.sessionId,
      message: chatMessage
    })
  }

  /**
   * 文法添削要求
   */
  requestGrammarCorrection(text: string): void {
    if (!this.socket || !this.currentSession) return

    this.socket.emit('request-grammar-correction', {
      sessionId: this.currentSession.sessionId,
      text
    })
  }

  /**
   * ホワイトボード描画データ送信
   */
  sendWhiteboardData(drawingData: any): void {
    if (!this.socket || !this.currentSession) return

    this.socket.emit('whiteboard-data', {
      sessionId: this.currentSession.sessionId,
      data: drawingData
    })
  }

  /**
   * セッション終了
   */
  async endSession(): Promise<void> {
    if (this.currentSession && this.socket) {
      this.socket.emit('end-session', {
        sessionId: this.currentSession.sessionId
      })
    }

    // WebRTC接続クリーンアップ
    this.cleanupWebRTC()

    this.currentSession = null
  }

  /**
   * WebRTCクリーンアップ
   */
  private cleanupWebRTC(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.initializeWebRTC()
    }
  }

  /**
   * WebRTCオファー処理
   */
  private async handleWebRTCOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)

    if (this.socket) {
      this.socket.emit('webrtc-answer', answer)
    }
  }

  /**
   * WebRTCアンサー処理
   */
  private async handleWebRTCAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(answer)
    }
  }

  /**
   * ICE候補処理
   */
  private async handleICECandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(candidate)
    }
  }

  /**
   * イベントハンドラー登録メソッド
   */
  onSessionResponse(handler: (response: any) => void): void {
    this.handleSessionResponse = handler
  }

  onEmergencyAssignment(handler: (assignment: any) => void): void {
    this.handleEmergencyAssignment = handler
  }

  onIncomingMessage(handler: (message: ChatMessage) => void): void {
    this.handleIncomingMessage = handler
  }

  onGrammarCorrection(handler: (correction: any) => void): void {
    this.handleGrammarCorrection = handler
  }

  onRemoteStreamReceived(handler: (stream: MediaStream) => void): void {
    this.onRemoteStreamReceived = handler
  }

  // デフォルトハンドラー
  private handleSessionResponse(response: any): void {
    console.log('Session response:', response)
  }

  private handleEmergencyAssignment(assignment: any): void {
    console.log('Emergency assignment:', assignment)
  }

  private handleIncomingMessage(message: ChatMessage): void {
    console.log('Incoming message:', message)
  }

  private handleGrammarCorrection(correction: any): void {
    console.log('Grammar correction:', correction)
  }

  private onRemoteStreamReceived(stream: MediaStream): void {
    console.log('Remote stream received:', stream)
  }

  /**
   * 接続ステータス取得
   */
  getConnectionStatus(): {
    socket: boolean
    webrtc: boolean
    session: boolean
  } {
    return {
      socket: this.socket?.connected || false,
      webrtc: this.peerConnection?.connectionState === 'connected',
      session: this.currentSession?.status === 'active'
    }
  }

  /**
   * 現在のセッション取得
   */
  getCurrentSession(): CoLearningSession | null {
    return this.currentSession
  }

  /**
   * リソースクリーンアップ
   */
  cleanup(): void {
    this.cleanupWebRTC()
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

// シングルトンインスタンス
export const coopPlatformService = new CoopPlatformService()