// ECHOの感情状態（より詳細に）
export type ECHOEmotion = 
  | 'normal' 
  | 'happy' 
  | 'encouraging' 
  | 'surprised' 
  | 'thinking' 
  | 'speaking'
  | 'listening'
  | 'confused'
  | 'excited'

// アニメーション状態（reactive objectとして管理）
export interface AnimationState {
  isBlinking: boolean
  isSpeaking: boolean
  isListening: boolean
  headTilt: number // -5 to 5 degrees
  armPosition: 'neutral' | 'wave' | 'clap' | 'thumbsUp' | 'thinking' | 'gesture'
  eyeIntensity: number // 0 to 1
  chestLightPulse: number // 0 to 1
  bodyScale: number // 0.9 to 1.1 for breathing effect
  blinkSpeed: number // milliseconds between blinks
}

// ECHOキャラクター全体の状態
// ECHOキャラクター（型安全性強化）
export interface ECHOCharacter {
  readonly id: string
  readonly name: string
  emotion: ECHOEmotion
  encouragementLevel: number // 0-100
  readonly eyeColor: string
  cheekBlushOpacity: number // 0-1
  animationState: AnimationState
  isActive: boolean
  readonly voiceSettings: VoiceSettings
  readonly createdAt: Date
  readonly version: string
}

// 音声設定
// 音声設定（型安全性強化）
export interface VoiceSettings {
  readonly rate: number // 0.1 to 2.0
  readonly pitch: number // 0.5 to 2.0
  readonly volume: number // 0.0 to 1.0
  readonly voice: string | null
  readonly language: LanguageCode
}

export type LanguageCode = 'en-US' | 'en-GB' | 'ja-JP' | 'zh-CN' | 'es-ES' | 'fr-FR' | 'de-DE'

export interface VRScenario {
  id: string
  type: 'restaurant' | 'hotel' | 'shopping' | 'airport' | 'business'
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  culturalNotes?: string[]
  objectives: string[]
  estimatedDuration: number
}

// 会話ターン（型安全性強化）
export interface ConversationTurn {
  readonly id: string
  readonly speaker: Speaker
  readonly message: string
  readonly timestamp: Date
  readonly emotion?: ECHOEmotion
  readonly feedback?: ConversationFeedback
  readonly audioUrl?: string
  readonly confidence?: number // 0-1
  readonly duration?: number // ms
  readonly isProcessing: boolean
  readonly hints: readonly string[]
  readonly corrections: readonly string[]
  readonly wordCount: number
  readonly characterCount: number
}

export type Speaker = 'user' | 'echo' | 'npc' | 'system'

export interface ConversationFeedback {
  type: 'pronunciation' | 'grammar' | 'vocabulary' | 'fluency' | 'cultural'
  level: 'excellent' | 'good' | 'needsWork'
  message: string
  suggestions: string[]
  confidence: number
  detailedErrors?: ErrorDetail[]
  positiveAspects?: string[]
  improvementTips?: string[]
}

export interface ErrorDetail {
  type: 'grammar' | 'pronunciation' | 'vocabulary' | 'fluency'
  original: string
  corrected: string
  explanation: string
  examples?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

// 練習セッション（型安全性強化）
export interface PracticeSession {
  readonly id: string
  readonly userId: string
  readonly scenario: VRScenario
  readonly startTime: Date
  readonly endTime?: Date
  readonly conversationHistory: readonly ConversationTurn[]
  overallScore: number // 0-1
  weaknessAnalysis: WeaknessAnalysis
  progressMetrics: ProgressMetrics
  status: SessionStatus
  readonly version: string
  readonly metadata: SessionMetadata
}

export type SessionStatus = 'active' | 'completed' | 'paused' | 'cancelled' | 'error'

export interface SessionMetadata {
  readonly deviceInfo: string
  readonly browserInfo: string
  readonly screenResolution: string
  readonly connectionType: string
  readonly performanceProfile: PerformanceMode
}

export interface WeaknessAnalysis {
  pronunciation: SkillAnalysis
  grammar: SkillAnalysis
  vocabulary: SkillAnalysis
  fluency: SkillAnalysis
  culturalAwareness: SkillAnalysis
}

export interface SkillAnalysis {
  score: number
  issues: string[]
  improvements: string[]
  exerciseRecommendations: string[]
}

export interface ProgressMetrics {
  totalPracticeTime: number
  sessionsCompleted: number
  averageScore: number
  improvementRate: number
  streakDays: number
  confidenceLevel: number
}

export interface ECHOResponse {
  message: string
  emotion: ECHOEmotion
  hints?: string[]
  corrections?: string[]
  encouragement?: string
  nextPrompt?: string
  culturalTip?: string
  animation?: Partial<AnimationState>
  voiceSettings?: Partial<VoiceSettings>
  shouldSpeak?: boolean
  priority?: 'low' | 'normal' | 'high' // for response urgency
}

export interface UserProfile {
  id: string
  nativeLanguage: string
  targetLanguage: string
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  learningGoals: string[]
  culturalBackground: string
  anxietyLevel: number
  preferredPracticeTime: number
  weaknesses: string[]
  strengths: string[]
}

// AI エンジン設定（型安全性強化）
export interface AIEngineConfig {
  readonly responseDelay: number // ms, range: 0-5000
  readonly encouragementThreshold: number // 0-100
  readonly correctionStyle: CorrectionStyle
  readonly culturalSensitivity: boolean
  readonly anxietyReduction: boolean
  readonly gamificationLevel: number // 0-10
  readonly voiceEnabled: boolean
  readonly animationEnabled: boolean
  readonly performanceMode: PerformanceMode
  readonly debugMode: boolean
  readonly errorReporting: boolean
  readonly telemetryEnabled: boolean
}

export type CorrectionStyle = 'gentle' | 'direct' | 'adaptive'
export type PerformanceMode = 'high' | 'balanced' | 'low' | 'auto'

export interface ScenarioContext {
  location: string
  participants: string[]
  culturalContext: string
  expectedBehaviors: string[]
  commonPhrases: string[]
  tabooTopics?: string[]
}

export interface PerformanceMetrics {
  pronunciationAccuracy: number
  grammarCorrectness: number
  vocabularyUsage: number
  fluencyScore: number
  culturalAppropriateness: number
  confidenceLevel: number
  anxietyReduction: number
  responseTime: number // average response time in ms
  engagement: number // 0 to 1
  progressRate: number // improvement over time
}

// アニメーション制御用の型（型安全性強化）
export interface AnimationTrigger {
  readonly emotion: ECHOEmotion
  readonly duration: number // ms, range: 0-10000
  readonly intensity: number // 0-2
  readonly transition: AnimationTransition
  readonly id: string
  readonly timestamp: Date
  readonly priority: AnimationPriority
}

export type AnimationTransition = 'smooth' | 'instant' | 'bounce' | 'elastic' | 'ease-in' | 'ease-out'
export type AnimationPriority = 'low' | 'normal' | 'high' | 'immediate'

export interface AnimationState {
  isBlinking: boolean
  isSpeaking: boolean
  isListening: boolean
  headTilt: number // -10 to 10 degrees
  armPosition: ArmPosition
  eyeIntensity: number // 0 to 1
  chestLightPulse: number // 0 to 1
  bodyScale: number // 0.8 to 1.2
  blinkSpeed: number // ms, range: 1000-5000
}

export type ArmPosition = 'neutral' | 'wave' | 'clap' | 'thumbsUp' | 'thinking' | 'gesture'

// 音声制御用の型（型安全性強化）
export interface SpeechRequest {
  readonly text: string
  readonly emotion?: ECHOEmotion
  readonly priority: SpeechPriority
  readonly interrupt: boolean
  readonly voiceSettings?: Readonly<Partial<VoiceSettings>>
  readonly id: string
  readonly timestamp: Date
  readonly maxDuration?: number // ms
}

export type SpeechPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface SpeechResponse {
  readonly requestId: string
  readonly status: SpeechStatus
  readonly startTime?: Date
  readonly endTime?: Date
  readonly error?: ECHOError
}

export type SpeechStatus = 'queued' | 'speaking' | 'completed' | 'interrupted' | 'failed'

// エラーハンドリング用の型（型安全性強化）
export interface ECHOError {
  readonly code: ECHOErrorCode
  readonly message: string
  readonly details?: Record<string, unknown>
  readonly timestamp: Date
  readonly recoverable: boolean
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly source: 'animation' | 'speech' | 'recognition' | 'network' | 'system'
}

export type ECHOErrorCode = 
  | 'ANIMATION_FAILED'
  | 'SPEECH_NOT_SUPPORTED'
  | 'SPEECH_ERROR'
  | 'RECOGNITION_FAILED'
  | 'NETWORK_ERROR'
  | 'MEMORY_LEAK_DETECTED'
  | 'PERFORMANCE_DEGRADED'
  | 'INVALID_STATE'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR'

// パフォーマンス測定用（型安全性強化）
export interface PerformanceStats {
  readonly renderTime: number // ms
  readonly animationFrameRate: number // fps
  readonly memoryUsage: number // bytes
  readonly speechLatency: number // ms
  readonly recognitionAccuracy: number // 0-1
  readonly cpuUsage?: number // 0-100%
  readonly frameDropCount: number
  readonly lastMeasurement: Date
}

// パフォーマンス閾値
export interface PerformanceThresholds {
  readonly minFrameRate: number // fps
  readonly maxRenderTime: number // ms
  readonly maxMemoryUsage: number // bytes
  readonly maxSpeechLatency: number // ms
  readonly minRecognitionAccuracy: number // 0-1
}