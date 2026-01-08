/**
 * 桃鉄風ボードゲームの型定義
 */

// プレイヤー関連の型
export interface Player {
  id: string
  name: string
  position: number
  money: number
  properties: Property[]
  cards: Card[]
  isAI: boolean
  color: string
  sprite?: string
  totalAssets: number
  rank: number
}

// 駅（マス）の型
export interface Station {
  id: string
  name: string
  type: StationType
  position: {
    x: number
    y: number
  }
  properties: Property[]
  event?: GameEvent
  description: string
  icon: string
  connections: string[] // 接続されている駅のID
}

export enum StationType {
  START = 'start',
  NORMAL = 'normal',
  PROPERTY = 'property',
  EVENT = 'event',
  BONUS = 'bonus',
  CARD = 'card',
  GOAL = 'goal'
}

// 物件の型
export interface Property {
  id: string
  name: string
  stationId: string
  price: number
  revenue: number
  level: number
  maxLevel: number
  owner?: string
  category: PropertyCategory
  description: string
}

export enum PropertyCategory {
  AGRICULTURE = 'agriculture',
  INDUSTRY = 'industry',
  COMMERCE = 'commerce',
  SERVICE = 'service',
  TECHNOLOGY = 'technology'
}

// カードの型
export interface Card {
  id: string
  name: string
  type: CardType
  effect: CardEffect
  description: string
  icon: string
  cost?: number
}

export enum CardType {
  MOVEMENT = 'movement',
  MONEY = 'money',
  PROPERTY = 'property',
  ATTACK = 'attack',
  DEFENSE = 'defense',
  SPECIAL = 'special'
}

export interface CardEffect {
  type: string
  value: number | string
  duration?: number
  target?: 'self' | 'others' | 'all'
}

// イベントの型
export interface GameEvent {
  id: string
  name: string
  type: EventType
  effect: EventEffect
  description: string
  probability: number
  icon: string
}

export enum EventType {
  BONUS = 'bonus',
  PENALTY = 'penalty',
  RANDOM = 'random',
  SEASONAL = 'seasonal',
  SPECIAL = 'special'
}

export interface EventEffect {
  money?: number
  movement?: number
  cards?: Card[]
  propertyEffect?: {
    type: 'discount' | 'increase' | 'steal'
    value: number
  }
}

// ゲーム状態の型
export interface GameState {
  id: string
  turn: number
  currentPlayerIndex: number
  players: Player[]
  stations: Station[]
  phase: GamePhase
  diceValue: number | null
  targetStation?: string
  eventQueue: GameEvent[]
  settings: GameSettings
  history: GameHistory[]
  createdAt: string
  updatedAt: string
}

export enum GamePhase {
  MENU = 'menu',
  SETUP = 'setup',
  DICE_ROLL = 'dice_roll',
  MOVING = 'moving',
  ACTION = 'action',
  EVENT = 'event',
  PURCHASE = 'purchase',
  CARD_USE = 'card_use',
  TURN_END = 'turn_end',
  GAME_END = 'game_end',
  PAUSED = 'paused'
}

// ゲーム設定の型
export interface GameSettings {
  playerCount: number
  aiDifficulty: 'easy' | 'normal' | 'hard'
  turnLimit: number
  startingMoney: number
  mapSize: 'small' | 'medium' | 'large'
  enableCards: boolean
  enableEvents: boolean
  gameSpeed: number
  soundEnabled: boolean
  musicVolume: number
  effectVolume: number
}

// ゲーム履歴の型
export interface GameHistory {
  turn: number
  playerId: string
  action: HistoryAction
  details: any
  timestamp: string
}

export interface HistoryAction {
  type: 'move' | 'purchase' | 'card' | 'event' | 'income' | 'payment'
  description: string
}

// マップ生成用の型
export interface MapConfig {
  name: string
  theme: 'japan' | 'world' | 'space' | 'fantasy'
  stations: StationConfig[]
  connections: Connection[]
  startPosition: string
  goalPosition: string
}

export interface StationConfig {
  id: string
  name: string
  type: StationType
  position: { x: number; y: number }
  properties?: PropertyConfig[]
  eventChance?: number
}

export interface PropertyConfig {
  name: string
  category: PropertyCategory
  basePrice: number
  baseRevenue: number
}

export interface Connection {
  from: string
  to: string
  distance: number
  type: 'normal' | 'express' | 'special'
}

// アニメーション用の型
export interface AnimationConfig {
  type: 'dice' | 'move' | 'purchase' | 'event' | 'victory'
  duration: number
  easing: string
  sprites?: string[]
  particles?: ParticleConfig
}

export interface ParticleConfig {
  count: number
  type: 'coins' | 'stars' | 'confetti' | 'sparkles'
  colors: string[]
  duration: number
}

// セーブデータの型
export interface SaveData {
  id: string
  userId: string
  saveName: string
  gameState: GameState
  thumbnail?: string
  createdAt: string
  updatedAt: string
  playTime: number
}

// リーダーボードの型
export interface LeaderboardEntry {
  id: string
  userId: string
  playerName: string
  score: number
  totalAssets: number
  turnCount: number
  date: string
  mapName: string
  difficulty: string
}

// 実績の型
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  reward?: {
    type: 'title' | 'badge' | 'skin' | 'bonus'
    value: string | number
  }
  unlockedAt?: string
}

export interface AchievementCondition {
  type: 'property_count' | 'money' | 'wins' | 'cards_used' | 'stations_visited'
  value: number
  comparison: 'equal' | 'greater' | 'less'
}

// AI設定の型
export interface AIConfig {
  personality: AIPersonality
  strategy: AIStrategy
  aggressiveness: number // 0-1
  riskTolerance: number // 0-1
  focusAreas: PropertyCategory[]
}

export enum AIPersonality {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  RANDOM = 'random',
  STRATEGIC = 'strategic'
}

export enum AIStrategy {
  MONOPOLY = 'monopoly', // 特定エリアを独占
  DIVERSE = 'diverse', // 分散投資
  HIGH_VALUE = 'high_value', // 高額物件狙い
  OPPORTUNIST = 'opportunist' // 機会主義
}

// ゲームモード
export enum GameMode {
  CLASSIC = 'classic', // クラシックモード
  SPEED = 'speed', // スピードモード
  BATTLE = 'battle', // バトルモード
  EDUCATIONAL = 'educational' // 教育モード
}

// 通知の型
export interface GameNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  icon?: string
  duration?: number
  timestamp: string
}

// エクスポート用のまとめ
export interface MomotetsuGame {
  state: GameState
  config: MapConfig
  settings: GameSettings
  notifications: GameNotification[]
  animations: AnimationConfig[]
}