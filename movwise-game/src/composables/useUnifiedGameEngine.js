/**
 * Unified Game Engine - 統一ゲームエンジン
 * 全てのゲームで共通利用する機能を提供
 */

import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from './useGameAudio.js'
import { useProgressTracking } from './useProgressTracking.js'

// 学習レベル定義
export const LEARNING_LEVELS = {
  BEGINNER: 'beginner',     // 初級：フォニックス基礎
  INTERMEDIATE: 'intermediate', // 中級：文法・語彙
  ADVANCED: 'advanced'      // 上級：統合技能
}

// 学習分野定義
export const LEARNING_AREAS = {
  PHONICS: 'phonics',           // フォニックス
  GRAMMAR: 'grammar',           // 文法
  VOCABULARY: 'vocabulary',     // 語彙
  PRONUNCIATION: 'pronunciation', // 発音
  TYPING: 'typing',             // タイピング
  LISTENING: 'listening',       // リスニング
  INTEGRATED: 'integrated'      // 統合技能
}

// ゲーム難易度
export const DIFFICULTY_LEVELS = {
  EASY: { id: 'easy', multiplier: 0.8, name: '簡単' },
  NORMAL: { id: 'normal', multiplier: 1.0, name: '普通' },
  HARD: { id: 'hard', multiplier: 1.5, name: '難しい' },
  EXPERT: { id: 'expert', multiplier: 2.0, name: 'エキスパート' }
}

// 統一スコアリングシステム
export class UnifiedScoring {
  constructor(gameConfig) {
    this.basePoints = gameConfig.basePoints || 100
    this.difficultyMultiplier = gameConfig.difficulty?.multiplier || 1.0
    this.learningArea = gameConfig.learningArea
    this.streak = 0
    this.maxStreak = 0
    this.totalQuestions = 0
    this.correctAnswers = 0
  }

  // 正解時のスコア計算
  onCorrectAnswer(timeBonus = 0, complexity = 1) {
    this.streak++
    this.maxStreak = Math.max(this.maxStreak, this.streak)
    this.correctAnswers++
    this.totalQuestions++

    const streakBonus = Math.min(this.streak * 10, 100) // 最大100pt
    const difficultyBonus = this.basePoints * (this.difficultyMultiplier - 1)
    const complexityBonus = this.basePoints * (complexity - 1) * 0.5

    return Math.round(this.basePoints + streakBonus + timeBonus + difficultyBonus + complexityBonus)
  }

  // 不正解時の処理
  onIncorrectAnswer() {
    this.streak = 0
    this.totalQuestions++
    return 0
  }

  // 最終スコア計算
  getFinalScore() {
    const accuracy = this.totalQuestions > 0 ? this.correctAnswers / this.totalQuestions : 0
    const accuracyBonus = Math.round(accuracy * 1000) // 精度ボーナス
    const streakBonus = this.maxStreak * 20 // 最大連続ボーナス

    return {
      baseScore: this.correctAnswers * this.basePoints,
      accuracyBonus,
      streakBonus,
      maxStreak: this.maxStreak,
      accuracy: Math.round(accuracy * 100),
      totalScore: this.correctAnswers * this.basePoints + accuracyBonus + streakBonus
    }
  }
}

// 統一フィードバックシステム
export const FEEDBACK_TYPES = {
  EXCELLENT: {
    message: '素晴らしい！',
    color: '#10B981',
    icon: '🌟',
    sound: 'success-excellent'
  },
  GOOD: {
    message: 'よくできました！',
    color: '#3B82F6',
    icon: '👏',
    sound: 'success-good'
  },
  CORRECT: {
    message: '正解！',
    color: '#8B5CF6',
    icon: '✨',
    sound: 'success-normal'
  },
  INCORRECT: {
    message: '惜しい！もう一度挑戦！',
    color: '#EF4444',
    icon: '💪',
    sound: 'try-again'
  },
  HINT: {
    message: 'ヒント',
    color: '#F59E0B',
    icon: '💡',
    sound: 'hint'
  }
}

export function useUnifiedGameEngine(gameConfig) {
  const router = useRouter()
  const { playSound } = useGameAudio()
  const { updateProgress, getPlayerLevel } = useProgressTracking()

  // ゲーム状態管理
  const gameState = reactive({
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    currentLevel: 1,
    timeElapsed: 0,
    lives: gameConfig.lives || 3
  })

  // スコアリングシステム
  const scoring = ref(new UnifiedScoring(gameConfig))

  // 現在の問題・チャレンジ
  const currentChallenge = ref(null)
  const challengeQueue = ref([])

  // 学習進捗
  const learningProgress = reactive({
    currentArea: gameConfig.learningArea,
    currentLevel: gameConfig.learningLevel,
    xpGained: 0,
    skillPoints: {
      phonics: 0,
      grammar: 0,
      vocabulary: 0,
      pronunciation: 0,
      typing: 0
    }
  })

  // ゲーム設定
  const settings = reactive({
    difficulty: gameConfig.difficulty || DIFFICULTY_LEVELS.NORMAL,
    soundEnabled: true,
    vibrationEnabled: true,
    autoAdvance: false,
    showHints: true
  })

  // ゲーム開始
  const startGame = () => {
    gameState.isPlaying = true
    gameState.isPaused = false
    gameState.isCompleted = false
    gameState.timeElapsed = 0

    // ゲーム固有の初期化
    if (gameConfig.onGameStart) {
      gameConfig.onGameStart()
    }

    playSound('game-start')
  }

  // ゲーム一時停止
  const pauseGame = () => {
    gameState.isPaused = !gameState.isPaused
    playSound('pause')
  }

  // ゲーム終了
  const endGame = (completed = true) => {
    gameState.isPlaying = false
    gameState.isCompleted = completed

    const finalScore = scoring.value.getFinalScore()

    // 進捗更新
    updateProgress({
      gameId: gameConfig.gameId,
      learningArea: gameConfig.learningArea,
      score: finalScore.totalScore,
      accuracy: finalScore.accuracy,
      timeSpent: gameState.timeElapsed,
      completed
    })

    // XP計算
    const xpGained = calculateXP(finalScore)
    learningProgress.xpGained = xpGained

    playSound(completed ? 'game-complete' : 'game-over')

    // ゲーム固有の終了処理
    if (gameConfig.onGameEnd) {
      gameConfig.onGameEnd(finalScore)
    }
  }

  // 正解処理
  const handleCorrectAnswer = (answerData = {}) => {
    const timeBonus = calculateTimeBonus(answerData.responseTime)
    const complexity = answerData.complexity || 1
    const points = scoring.value.onCorrectAnswer(timeBonus, complexity)

    // フィードバック表示
    const feedbackType = points > 200 ? FEEDBACK_TYPES.EXCELLENT :
                        points > 150 ? FEEDBACK_TYPES.GOOD :
                        FEEDBACK_TYPES.CORRECT

    showFeedback(feedbackType, points)

    // スキルポイント加算
    const skillArea = gameConfig.learningArea
    if (learningProgress.skillPoints[skillArea] !== undefined) {
      learningProgress.skillPoints[skillArea] += Math.round(points / 10)
    }

    return points
  }

  // 不正解処理
  const handleIncorrectAnswer = (answerData = {}) => {
    scoring.value.onIncorrectAnswer()

    // ライフ減少
    if (gameConfig.lives && gameState.lives > 0) {
      gameState.lives--
    }

    showFeedback(FEEDBACK_TYPES.INCORRECT)

    // ゲームオーバー判定
    if (gameState.lives === 0) {
      endGame(false)
    }

    return 0
  }

  // フィードバック表示
  const showFeedback = (feedbackType, points = null) => {
    // フィードバック表示ロジック
    playSound(feedbackType.sound)

    if (gameConfig.onFeedback) {
      gameConfig.onFeedback(feedbackType, points)
    }
  }

  // 時間ボーナス計算
  const calculateTimeBonus = (responseTime) => {
    if (!responseTime) return 0

    // 3秒以内なら満点、それ以降は減少
    const maxTime = 3000 // 3秒
    const timeBonus = Math.max(0, (maxTime - responseTime) / maxTime * 50)
    return Math.round(timeBonus)
  }

  // XP計算
  const calculateXP = (finalScore) => {
    const baseXP = Math.round(finalScore.totalScore / 10)
    const accuracyBonus = finalScore.accuracy > 80 ? 50 : 0
    const difficultyBonus = Math.round(baseXP * (settings.difficulty.multiplier - 1))

    return baseXP + accuracyBonus + difficultyBonus
  }

  // ヒント表示
  const showHint = (hintData) => {
    if (!settings.showHints) return

    showFeedback(FEEDBACK_TYPES.HINT)

    if (gameConfig.onHint) {
      gameConfig.onHint(hintData)
    }
  }

  // 次のレベルへ進む
  const advanceLevel = () => {
    gameState.currentLevel++

    if (gameConfig.onLevelAdvance) {
      gameConfig.onLevelAdvance(gameState.currentLevel)
    }
  }

  // ゲーム統計
  const gameStats = computed(() => ({
    accuracy: scoring.value.totalQuestions > 0
      ? Math.round((scoring.value.correctAnswers / scoring.value.totalQuestions) * 100)
      : 0,
    streak: scoring.value.streak,
    maxStreak: scoring.value.maxStreak,
    totalQuestions: scoring.value.totalQuestions,
    correctAnswers: scoring.value.correctAnswers,
    timeElapsed: gameState.timeElapsed,
    currentLevel: gameState.currentLevel
  }))

  // レベル推奨システム
  const getRecommendedGames = () => {
    const playerLevel = getPlayerLevel()
    const currentArea = learningProgress.currentArea

    // プレイヤーのレベルと弱点に基づいてゲームを推奨
    return gameConfig.getRecommendations?.(playerLevel, currentArea) || []
  }

  return {
    // 状態
    gameState,
    scoring,
    learningProgress,
    settings,
    gameStats,
    currentChallenge,
    challengeQueue,

    // アクション
    startGame,
    pauseGame,
    endGame,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    showFeedback,
    showHint,
    advanceLevel,
    getRecommendedGames,

    // 定数
    LEARNING_LEVELS,
    LEARNING_AREAS,
    DIFFICULTY_LEVELS,
    FEEDBACK_TYPES
  }
}