/**
 * Language Galaxy Adventure - Story System Types
 * VRシナリオ連携とSpatial.io統合を考慮した統一ストーリーシステム
 */

export type PlanetType = 
  | 'soundPlanet' 
  | 'wordPlanet' 
  | 'grammarPlanet' 
  | 'rhythmPlanet' 
  | 'blendPlanet' 
  | 'patternPlanet' 
  | 'masterPlanet'

export type SceneType = 'dialogue' | 'cutscene' | 'choice' | 'gameIntro' | 'vrTransition' | 'achievement'

export type CharacterType = 'narrator' | 'echo' | 'sage' | 'crystal' | 'player' | 'alien' | 'guardian'

export interface Character {
  id: CharacterType
  name: string
  avatar: string
  position?: 'left' | 'center' | 'right'
  emotion?: 'happy' | 'sad' | 'excited' | 'confused' | 'determined' | 'neutral'
  vrModel?: string // 3Dモデルのパス（VR用）
}

export interface Dialogue {
  id: string
  characterId: CharacterType
  text: string
  audioUrl?: string
  duration?: number
  effects?: DialogueEffect[]
  vrGesture?: VRGesture // VRでのキャラクタージェスチャー
}

export interface DialogueEffect {
  type: 'fadeIn' | 'slideIn' | 'shake' | 'glow' | 'typewriter'
  duration: number
  delay?: number
}

export interface VRGesture {
  type: 'wave' | 'point' | 'thumbsUp' | 'celebrate' | 'explain'
  intensity: number
  duration: number
}

export interface Choice {
  id: string
  text: string
  consequences: ChoiceConsequence[]
  nextScene: string
  vrAction?: VRInteraction // VR環境での選択方法
}

export interface ChoiceConsequence {
  type: 'relationship' | 'crystal' | 'skill' | 'unlock'
  target: string
  value: number
}

export interface VRInteraction {
  type: 'gesture' | 'voice' | 'gaze' | 'touch'
  trigger: string
  feedback: VRFeedback
}

export interface VRFeedback {
  visual?: string
  haptic?: number
  audio?: string
}

export interface StoryScene {
  id: string
  type: SceneType
  title?: string
  characters: Character[]
  background: BackgroundData
  dialogues: Dialogue[]
  choices?: Choice[]
  nextScene: string | null
  conditions?: SceneCondition[]
  triggers?: SceneTrigger[]
  vrScenario?: VRScenarioData // VRシナリオ連携データ
}

export interface BackgroundData {
  image: string
  vrEnvironment?: string // VR環境のID
  music?: string
  ambientSound?: string
  parallax?: ParallaxLayer[]
}

export interface ParallaxLayer {
  image: string
  speed: number
  zIndex: number
}

export interface SceneCondition {
  type: 'crystal' | 'skill' | 'relationship' | 'vr_readiness' | 'chapter_complete'
  target: string
  operator: '>=' | '<=' | '==' | '!='
  value: number | string
}

export interface SceneTrigger {
  event: 'gameComplete' | 'scoreAchieved' | 'planetReached' | 'crystalGained'
  target?: string
  value?: number
}

export interface VRScenarioData {
  id: string
  title: string
  description: string
  spatialioId?: string // Spatial.io用のスペースID
  previewImage: string
  requiredVRReadiness: number
  estimatedDuration: number // 分
  participants: number // 推奨参加者数
  objectives: VRObjective[]
  environments: VREnvironment[]
  interactions: VRScenarioInteraction[]
}

export interface VRObjective {
  id: string
  description: string
  type: 'learning' | 'social' | 'exploration' | 'creative'
  rewards: ObjectiveReward[]
}

export interface ObjectiveReward {
  type: 'crystal' | 'skill' | 'unlock' | 'badge'
  value: number
  description: string
}

export interface VREnvironment {
  id: string
  name: string
  description: string
  assetBundle?: string
  spatialioEnvironment?: string
  lighting: 'day' | 'night' | 'sunset' | 'space'
  weather?: 'clear' | 'rain' | 'snow' | 'fog'
}

export interface VRScenarioInteraction {
  id: string
  type: 'handTracking' | 'voiceCommand' | 'eyeTracking' | 'spatialAudio'
  trigger: string
  response: VRResponse
}

export interface VRResponse {
  visual?: VisualEffect
  audio?: AudioEffect
  haptic?: HapticEffect
  social?: SocialEffect // 他プレイヤーとの連携
}

export interface VisualEffect {
  type: 'particle' | 'glow' | 'teleport' | 'morph'
  duration: number
  intensity: number
}

export interface AudioEffect {
  type: '3d' | 'ambient' | 'feedback' | 'music'
  url: string
  volume: number
  spatialRange?: number
}

export interface HapticEffect {
  type: 'vibration' | 'force' | 'texture'
  intensity: number
  duration: number
}

export interface SocialEffect {
  type: 'broadcast' | 'collaborate' | 'compete'
  scope: 'room' | 'team' | 'all'
  message?: string
}

export interface StoryChapter {
  id: string
  title: string
  subtitle: string
  planet: PlanetType
  chapterNumber: number
  requiredCrystals: number
  vrReadinessRequired?: number
  scenes: StoryScene[]
  milestones: ChapterMilestone[]
  rewards: ChapterReward[]
  vrScenarios: VRScenarioData[]
}

export interface ChapterMilestone {
  id: string
  title: string
  description: string
  condition: SceneCondition
  unlocks: UnlockData[]
}

export interface UnlockData {
  type: 'scene' | 'chapter' | 'planet' | 'vrScenario' | 'feature'
  target: string
  message: string
}

export interface ChapterReward {
  type: 'crystal' | 'skill' | 'title' | 'avatar' | 'vrAccess'
  value: number | string
  description: string
  icon: string
}

export interface StoryProgress {
  currentChapter: string
  currentScene: string
  completedChapters: string[]
  completedScenes: string[]
  playerChoices: Record<string, string>
  characterRelationships: Record<CharacterType, number>
  unlockedContent: string[]
  vrScenarioHistory: VRScenarioHistory[]
  savePoints: StorySavePoint[]
}

export interface VRScenarioHistory {
  scenarioId: string
  completedAt: string
  duration: number
  participants: string[]
  achievements: string[]
  rating: number
}

export interface StorySavePoint {
  id: string
  chapterId: string
  sceneId: string
  timestamp: string
  playerState: Record<string, any>
  description: string
}

// VRアカデミー連携用の型定義
export interface VRAcademyBridgeData {
  sessionId: string
  playerId: string
  scenarioId: string
  playerProgress: VRPlayerProgress
  academyCredentials: AcademyCredentials
}

export interface VRPlayerProgress {
  level: number
  skills: Record<string, number>
  completedScenarios: string[]
  preferredLanguage: string
  vrReadinessScore: number
}

export interface AcademyCredentials {
  apiKey: string
  studentId: string
  institutionId?: string
  permissions: string[]
}

// Spatial.io統合用の型定義
export interface SpatialIntegration {
  spaceId: string
  userId: string
  role: 'student' | 'teacher' | 'observer'
  permissions: SpatialPermission[]
  customData: Record<string, any>
}

export interface SpatialPermission {
  action: 'create' | 'modify' | 'delete' | 'interact'
  resource: 'objects' | 'environment' | 'users' | 'content'
  scope: 'self' | 'team' | 'all'
}

// イベント型定義
export interface StoryEvent {
  type: 'sceneStart' | 'sceneEnd' | 'choiceMade' | 'dialogueComplete' | 'vrTransition'
  data: Record<string, any>
  timestamp: string
  source: 'player' | 'system' | 'vr' | 'academy'
}

// GSAPアニメーション用の型定義
export interface StoryAnimation {
  type: 'fadeIn' | 'slideIn' | 'scaleUp' | 'typewriter' | 'parallax'
  target: string
  duration: number
  delay?: number
  ease?: string
  onComplete?: () => void
}

export interface TypewriterConfig {
  speed: number // 文字/秒
  pauseOnPunctuation: number // 句読点での一時停止時間
  skipable: boolean
  sound?: string
}