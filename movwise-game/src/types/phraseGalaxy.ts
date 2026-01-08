export interface PhraseQuestion {
  id: string;
  level: 'eiken5' | 'eiken4' | 'eiken3' | 'eiken-pre2' | 'eiken2';
  phrase: string; // 正解の熟語
  imageUrl: string; // 画像パス(仮のプレースホルダーでOK)
  imageAlt: string; // 画像の説明
  distractors: string[]; // 不正解の選択肢(2つ)
  difficulty: number; // 1-5
  category?: string; // カテゴリー（日常生活、学校、趣味など）
}

export interface GameState {
  currentLevel: string;
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answeredQuestions: Set<string>;
  isGameActive: boolean;
  timeStarted?: number;
  timeElapsed?: number;
}

export interface FloatingChoicePosition {
  x: number;
  y: number;
  vx: number; // x方向の速度
  vy: number; // y方向の速度
  rotation?: number; // 回転角度
  scale?: number; // スケール
}

export interface FloatingChoiceData {
  id: string;
  phrase: string;
  isCorrect: boolean;
  position: FloatingChoicePosition;
  isAnimating?: boolean;
}

export interface GameProgress {
  level: string;
  questionsCompleted: number;
  totalQuestions: number;
  accuracy: number;
  bestScore: number;
  lastPlayed: number;
  unlockedLevels: string[];
}

export interface GameResult {
  level: string;
  score: number;
  accuracy: number;
  timeElapsed: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  timestamp: number;
}

export interface LevelInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: number;
  requiredAccuracy?: number;
  unlockRequirement?: string;
  questionCount: number;
  estimatedTime: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showHints: boolean;
  autoNext: boolean;
  timeLimit?: number; // seconds per question
}

export interface PhraseGalaxyState extends GameState {
  currentQuestion: PhraseQuestion | null;
  choices: FloatingChoiceData[];
  selectedChoice: string | null;
  showFeedback: boolean;
  feedbackType: 'correct' | 'incorrect' | null;
  gameProgress: GameProgress[];
  gameSettings: GameSettings;
  isLoading: boolean;
  error: string | null;
}