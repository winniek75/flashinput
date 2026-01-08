/**
 * Word Galaxy - 型定義
 * MovWISE語彙学習システム
 */

// ===== 難易度レベル定義 =====
export enum DifficultyLevel {
  // 英検
  EIKEN_5 = 'eiken-5',        // 中学初級
  EIKEN_4 = 'eiken-4',        // 中学中級
  EIKEN_3 = 'eiken-3',        // 中学卒業
  EIKEN_PRE_2 = 'eiken-pre2', // 高校中級
  EIKEN_2 = 'eiken-2',        // 高校卒業
  EIKEN_PRE_1 = 'eiken-pre1', // 大学中級
  EIKEN_1 = 'eiken-1',        // 大学上級

  // TOEIC
  TOEIC_BEGINNER = 'toeic-beginner',     // 200-400点
  TOEIC_ELEMENTARY = 'toeic-elementary', // 400-600点
  TOEIC_INTERMEDIATE = 'toeic-intermediate', // 600-730点
  TOEIC_ADVANCED = 'toeic-advanced',     // 730-860点
  TOEIC_EXPERT = 'toeic-expert'          // 860-990点
}

// ===== 単語マスターデータ =====
export interface Word {
  id: string;                    // UUID
  word: string;                  // 単語
  meanings: string[];            // 意味（複数）
  pronunciation: string;         // 発音記号
  audioUrl?: string;             // 音声ファイルURL

  // 難易度情報
  eikenLevel: DifficultyLevel;
  toeicLevel: DifficultyLevel;
  difficulty: number;            // 1-10
  frequency: number;             // 1-10

  // 分類
  partOfSpeech: string[];        // 品詞 ['noun', 'verb']
  categories: string[];          // カテゴリ ['food', 'travel']
  tags: string[];                // タグ ['academic', 'business']

  // 例文
  examples: Array<{
    sentence: string;
    translation: string;
  }>;

  // 関連情報
  synonyms: string[];            // 類義語
  antonyms: string[];            // 対義語
  relatedWords: string[];        // 関連語

  // メタ情報
  source: string;                // データソース（どのゲームから）
  createdAt: Date;
  updatedAt: Date;
}

// ===== ユーザーの単語学習進捗 =====
export interface UserWordProgress {
  id: string;                    // userId-wordId
  userId: string;
  wordId: string;

  // SRS情報
  srsLevel: number;              // 1-8段階
  lastReviewedAt: Date;
  nextReviewAt: Date;

  // 学習統計
  totalAttempts: number;         // 総出題回数
  correctAttempts: number;       // 正解回数
  consecutiveCorrect: number;    // 連続正解数
  consecutiveWrong: number;      // 連続不正解数

  // マスタリー
  masteryLevel: number;          // 0-100%
  isMastered: boolean;           // マスター済みフラグ
  masteredAt?: Date;

  // タイミング
  firstLearnedAt: Date;
  lastCorrectAt?: Date;
  lastWrongAt?: Date;

  // 使用文脈記録
  usedInBattles: number;         // 対戦での出題回数
  usedInReviews: number;         // 復習での出題回数

  createdAt: Date;
  updatedAt: Date;
}

// ===== デイリーミッション =====
export interface MissionProgress {
  id: string;
  type: 'learn' | 'review' | 'battle' | 'streak';
  title: string;
  description: string;
  target: number;                // 目標値
  current: number;               // 現在値
  completed: boolean;
  reward: {
    type: 'crystal' | 'exp' | 'badge';
    amount: number;
  };
}

export interface DailyMission {
  id: string;                    // date-userId
  userId: string;
  date: string;                  // YYYY-MM-DD

  missions: MissionProgress[];

  allCompleted: boolean;
  completedAt?: Date;

  // 統計
  wordsLearned: number;
  wordsReviewed: number;
  battlesPlayed: number;
  totalTimeSpent: number;        // 秒

  createdAt: Date;
}

// ===== 連続記録 =====
export interface StreakRecord {
  userId: string;

  // 現在の連続記録
  currentStreak: number;         // 日数
  currentStreakStart: Date;

  // 最高記録
  longestStreak: number;
  longestStreakStart: Date;
  longestStreakEnd: Date;

  // 履歴
  streakHistory: Array<{
    startDate: Date;
    endDate: Date;
    days: number;
  }>;

  // 統計
  totalDaysActive: number;
  lastActiveDate: Date;

  updatedAt: Date;
}

// ===== 対戦記録 =====
export interface BattleRecord {
  id: string;
  userId: string;

  // 対戦情報
  mode: 'quick' | 'ranked' | 'friend';
  opponentType: 'bot' | 'player';
  opponentId?: string;

  // 結果
  result: 'win' | 'lose' | 'draw';
  playerScore: number;
  opponentScore: number;

  // 詳細
  wordsUsed: string[];           // 出題された単語ID
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;   // ミリ秒

  // レーティング（ランク戦のみ）
  eloChange?: number;
  newElo?: number;

  // タイミング
  duration: number;              // 秒
  playedAt: Date;
}

// ===== ユーザー統計 =====
export interface UserStats {
  userId: string;

  // 全体統計
  totalWordsLearned: number;
  totalWordsMastered: number;
  totalReviews: number;
  totalBattles: number;

  // 対戦統計
  battleWins: number;
  battleLosses: number;
  battleDraws: number;
  currentElo: number;
  highestElo: number;
  rank: string;                  // 'bronze', 'silver', 'gold', etc.

  // 学習時間
  totalTimeSpent: number;        // 秒
  averageSessionTime: number;    // 秒

  // 難易度別進捗
  progressByLevel: Record<DifficultyLevel, {
    learned: number;
    mastered: number;
    total: number;
  }>;

  // 最終更新
  lastUpdated: Date;
}

// ===== SRS関連型 =====
export interface SRSInterval {
  level: number;
  hours: number;
}

export interface ReviewSession {
  words: Word[];
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
}

// ===== 対戦関連型 =====
export interface BattleQuestion {
  word: Word;
  choices: string[];
  correctIndex: number;
  timeLimit: number;
}

export interface BattleSession {
  id: string;
  userId: string;
  mode: 'quick' | 'ranked';
  questions: BattleQuestion[];
  answers: boolean[];
  responseTimes: number[];
  score: number;
  startTime: Date;
  endTime?: Date;
}

// ===== 難易度情報 =====
export interface WordDifficulty {
  word: string;
  eikenLevel: DifficultyLevel;
  toeicLevel: DifficultyLevel;
  frequency: number;        // 1-10 (10が最頻出)
  academicLevel: number;    // 1-10 (10が最難)
  syllableCount: number;    // 音節数
  letterCount: number;      // 文字数
}

// ===== 既存システム統合型 =====
export interface CrystalReward {
  type: 'word';
  amount: number;
  source: string;
  timestamp: Date;
}

export interface ExperienceGain {
  category: 'vocabulary';
  amount: number;
  source: string;
  timestamp: Date;
}

// ===== UI状態型 =====
export interface WordGalaxyState {
  currentView: 'hub' | 'memory' | 'daily' | 'arena';
  loading: boolean;
  error: string | null;
  user: {
    id: string;
    level: number;
    crystals: number;
    experience: number;
  } | null;
}

export interface MemoryStationState {
  reviewWords: Word[];
  currentWordIndex: number;
  sessionStats: {
    total: number;
    correct: number;
    wrong: number;
    averageTime: number;
  };
  isReviewActive: boolean;
  loading: boolean;
}

export interface DailyMissionState {
  todayMission: DailyMission | null;
  streak: number;
  loading: boolean;
}

export interface VocabularyArenaState {
  currentBattle: BattleSession | null;
  battleHistory: BattleRecord[];
  userStats: {
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentElo: number;
  };
  loading: boolean;
}

// ===== Week 2: Daily Mission System Types =====

export type MissionType =
  | 'vocabulary_review'
  | 'new_words'
  | 'streak_maintenance'
  | 'perfect_score'
  | 'speed_challenge'
  | 'vocabulary_battle'
  | 'weekly_challenge';

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface RewardBundle {
  crystals: number;
  xp: number;
  items?: string[];
}

export interface PlayerStats {
  currentStreak: number;
  longestStreak: number;
  crystals: number;
  totalXP: number;
  level: number;
  lastLoginDate: string | null;
  totalMissionsCompleted: number;
  weeklyMissionsCompleted: number;
}

export interface WeeklyMilestone {
  id: string;
  label: string;
  icon: string;
  target: number;
  current: boolean;
  completed: boolean;
  reward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rewards: RewardBundle;
  unlockedAt: number;
  type: 'achievement' | 'milestone' | 'special';
}

// Enhanced DailyMission interface (extending existing)
export interface DailyMissionExtended extends DailyMission {
  rewards: RewardBundle;
  difficulty: MissionDifficulty;
  unlockCondition?: string;
  startedAt?: number;
  completedAt?: number;
}

// ===== Week 3: Vocabulary Arena Types =====

export type BattleMode = 'quick' | 'ranked' | 'tournament';

export type QuestionType = 'meaning' | 'pronunciation' | 'usage' | 'synonym' | 'antonym';

export interface BattleQuestion {
  id: string;
  type: QuestionType;
  difficulty: string;
  question: string;
  choices: string[];
  correctAnswer: number;
  explanation?: string;
  context?: string;
  audioUrl?: string;
  timeLimit: number;
  points: number;
}

export interface BattleAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  responseTime: number;
}

export interface BattleSession {
  id: string;
  playerId: string;
  opponent: {
    id: string;
    name: string;
    elo: number;
    rank: string;
  };
  mode: BattleMode;
  questions: BattleQuestion[];
  answers: boolean[];
  responseTimes: number[];
  startTime: number;
  endTime: number | null;
  playerScore: number;
  opponentScore: number;
  winner: string | null;
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
}

export interface BattleRecord {
  id: string;
  opponentName: string;
  mode: BattleMode;
  result: 'win' | 'loss' | 'draw';
  playerScore: number;
  opponentScore: number;
  duration: number; // seconds
  eloChange: number;
  date: string;
}