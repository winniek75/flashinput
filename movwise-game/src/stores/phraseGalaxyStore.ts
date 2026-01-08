import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PhraseQuestion,
  PhraseGalaxyState,
  GameResult,
  GameProgress,
  GameSettings,
  FloatingChoiceData,
  FloatingChoicePosition
} from '@/types/phraseGalaxy'
import { phraseQuestions } from '@/data/phraseGalaxyData'
import { imageService, type ImageResult } from '@/services/imageService'

export const usePhraseGalaxyStore = defineStore('phraseGalaxy', () => {
  // State
  const currentLevel = ref<string>('eiken5')
  const currentQuestionIndex = ref<number>(0)
  const score = ref<number>(0)
  const totalQuestions = ref<number>(10) // デフォルトは10問
  const answeredQuestions = ref<Set<string>>(new Set())
  const isGameActive = ref<boolean>(false)
  const timeStarted = ref<number | null>(null)
  const timeElapsed = ref<number>(0)

  const currentQuestion = ref<PhraseQuestion | null>(null)
  const choices = ref<FloatingChoiceData[]>([])
  const selectedChoice = ref<string | null>(null)
  const showFeedback = ref<boolean>(false)
  const feedbackType = ref<'correct' | 'incorrect' | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Game Progress & Settings
  const gameProgress = ref<GameProgress[]>([
    {
      level: 'eiken5',
      questionsCompleted: 0,
      totalQuestions: 30,
      accuracy: 0,
      bestScore: 0,
      lastPlayed: 0,
      unlockedLevels: ['eiken5']
    }
  ])

  const gameSettings = ref<GameSettings>({
    soundEnabled: true,
    animationSpeed: 'normal',
    showHints: true,
    autoNext: false,
    timeLimit: undefined
  })

  // Computed
  const currentLevelQuestions = computed(() => {
    return phraseQuestions.filter(q => q.level === currentLevel.value)
  })

  const accuracy = computed(() => {
    if (answeredQuestions.value.size === 0) return 0
    const correctAnswers = Array.from(answeredQuestions.value).filter(id => {
      const question = phraseQuestions.find(q => q.id === id)
      return question && currentQuestion.value?.phrase === question.phrase
    }).length
    return Math.round((correctAnswers / answeredQuestions.value.size) * 100)
  })

  const progress = computed(() => {
    return gameProgress.value.find(p => p.level === currentLevel.value)
  })

  const isGameComplete = computed(() =>
    currentQuestionIndex.value >= totalQuestions.value || !isGameActive.value
  )

  const availableLevels = computed(() => {
    const currentProgress = progress.value
    if (!currentProgress) return ['eiken5']
    return currentProgress.unlockedLevels
  })

  // Actions
  function startGame(level: string) {
    try {
      currentLevel.value = level
      currentQuestionIndex.value = 0
      score.value = 0
      answeredQuestions.value.clear()
      isGameActive.value = true
      timeStarted.value = Date.now()
      timeElapsed.value = 0
      selectedChoice.value = null
      showFeedback.value = false
      feedbackType.value = null
      error.value = null

      getNextQuestion()
    } catch (err) {
      error.value = 'ゲームの開始に失敗しました'
      console.error('Failed to start game:', err)
    }
  }

  function getNextQuestion(): PhraseQuestion | null {
    try {
      const levelQuestions = currentLevelQuestions.value
      if (levelQuestions.length === 0) {
        error.value = 'このレベルの問題が見つかりません'
        return null
      }

      // 未回答の問題をランダムに選択
      const unansweredQuestions = levelQuestions.filter(q => !answeredQuestions.value.has(q.id))

      if (unansweredQuestions.length === 0 || currentQuestionIndex.value >= totalQuestions.value) {
        endGame()
        return null
      }

      const randomIndex = Math.floor(Math.random() * unansweredQuestions.length)
      const question = unansweredQuestions[randomIndex]

      // ローカル画像を使用するため、動的な画像取得は無効化
      // loadQuestionWithImage は使用しない - ローカル画像をそのまま使用
      currentQuestion.value = question
      createFloatingChoices(question)

      currentQuestionIndex.value++
      return question
    } catch (err) {
      error.value = '問題の取得に失敗しました'
      console.error('Failed to get next question:', err)
      return null
    }
  }

  function createFloatingChoices(question: PhraseQuestion) {
    const allChoices = [question.phrase, ...question.distractors]
    const shuffledChoices = allChoices.sort(() => Math.random() - 0.5)

    choices.value = shuffledChoices.map((phrase, index) => ({
      id: `choice-${index}`,
      phrase,
      isCorrect: phrase === question.phrase,
      position: generateRandomPosition(),
      isAnimating: false
    }))
  }

  function generateRandomPosition(): FloatingChoicePosition {
    // 画面サイズに応じた適応的な初期位置生成
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 600

    // 画面サイズに応じてコンテナサイズを推定
    const estimatedWidth = Math.min(screenWidth * 0.8, 1000)
    const estimatedHeight = Math.min(screenHeight * 0.6, 600)

    // 画面サイズに応じた石サイズとマージン
    const stoneSize = screenWidth < 480 ? 140 : screenWidth < 768 ? 160 : 180
    const margin = Math.max(30, estimatedWidth * 0.05)

    const safeWidth = Math.max(stoneSize + margin * 2, estimatedWidth - stoneSize - margin * 2)
    const safeHeight = Math.max(stoneSize + margin * 2, estimatedHeight - stoneSize - margin * 2)

    return {
      x: Math.random() * safeWidth + margin,
      y: Math.random() * safeHeight + margin,
      vx: (Math.random() - 0.5) * 1.2, // 少し遅く
      vy: (Math.random() - 0.5) * 1.2,
      rotation: Math.random() * 360,
      scale: 1
    }
  }

  function checkAnswer(selectedPhrase: string): boolean {
    if (!currentQuestion.value || selectedChoice.value) return false

    selectedChoice.value = selectedPhrase
    const isCorrect = selectedPhrase === currentQuestion.value.phrase

    answeredQuestions.value.add(currentQuestion.value.id)

    if (isCorrect) {
      score.value += calculateScore()
      feedbackType.value = 'correct'
    } else {
      feedbackType.value = 'incorrect'
    }

    showFeedback.value = true

    // フィードバック後の自動進行は外部（コンポーネント）で処理
    // ここでは状態更新のみ

    return isCorrect
  }

  function calculateScore(): number {
    const baseScore = 100
    const timeBonus = timeStarted.value ? Math.max(0, 50 - Math.floor((Date.now() - timeStarted.value) / 1000)) : 0
    const difficultyMultiplier = getDifficultyMultiplier(currentLevel.value)

    return Math.round((baseScore + timeBonus) * difficultyMultiplier)
  }

  function getDifficultyMultiplier(level: string): number {
    const multipliers = {
      'eiken5': 1.0,
      'eiken4': 1.2,
      'eiken3': 1.5,
      'eiken-pre2': 1.8,
      'eiken2': 2.0
    }
    return multipliers[level as keyof typeof multipliers] || 1.0
  }

  function endGame() {
    isGameActive.value = false
    timeElapsed.value = timeStarted.value ? Date.now() - timeStarted.value : 0

    const result: GameResult = {
      level: currentLevel.value,
      score: score.value,
      accuracy: accuracy.value,
      timeElapsed: timeElapsed.value,
      questionsAnswered: answeredQuestions.value.size,
      correctAnswers: Math.round((accuracy.value / 100) * answeredQuestions.value.size),
      wrongAnswers: answeredQuestions.value.size - Math.round((accuracy.value / 100) * answeredQuestions.value.size),
      timestamp: Date.now()
    }

    updateProgress(result)
    saveProgress()
  }

  function updateProgress(result: GameResult) {
    const existingProgress = gameProgress.value.find(p => p.level === result.level)

    if (existingProgress) {
      existingProgress.questionsCompleted += result.questionsAnswered
      existingProgress.accuracy = Math.round(
        (existingProgress.accuracy + result.accuracy) / 2
      )
      existingProgress.bestScore = Math.max(existingProgress.bestScore, result.score)
      existingProgress.lastPlayed = result.timestamp

      // レベルアンロック条件チェック
      if (result.accuracy >= 70 && !existingProgress.unlockedLevels.includes(getNextLevel(result.level))) {
        const nextLevel = getNextLevel(result.level)
        if (nextLevel) {
          existingProgress.unlockedLevels.push(nextLevel)
        }
      }
    }
  }

  function getNextLevel(currentLevel: string): string | null {
    const levels = ['eiken5', 'eiken4', 'eiken3', 'eiken-pre2', 'eiken2']
    const currentIndex = levels.indexOf(currentLevel)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  }

  function saveProgress() {
    try {
      localStorage.setItem('phrase-galaxy-progress', JSON.stringify(gameProgress.value))
      localStorage.setItem('phrase-galaxy-settings', JSON.stringify(gameSettings.value))
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }

  function loadProgress() {
    try {
      const savedProgress = localStorage.getItem('phrase-galaxy-progress')
      const savedSettings = localStorage.getItem('phrase-galaxy-settings')

      if (savedProgress) {
        gameProgress.value = JSON.parse(savedProgress)
      }

      if (savedSettings) {
        gameSettings.value = { ...gameSettings.value, ...JSON.parse(savedSettings) }
      }
    } catch (err) {
      console.error('Failed to load progress:', err)
    }
  }

  function resetGame() {
    currentLevel.value = 'eiken5'
    currentQuestionIndex.value = 0
    score.value = 0
    answeredQuestions.value.clear()
    isGameActive.value = false
    currentQuestion.value = null
    choices.value = []
    selectedChoice.value = null
    showFeedback.value = false
    feedbackType.value = null
    timeStarted.value = null
    timeElapsed.value = 0
    error.value = null
  }

  function updateSettings(newSettings: Partial<GameSettings>) {
    gameSettings.value = { ...gameSettings.value, ...newSettings }
    saveProgress()
  }

  function getStatistics(level: string) {
    const levelProgress = gameProgress.value.find(p => p.level === level)
    if (!levelProgress) return null

    return {
      accuracy: levelProgress.accuracy,
      questionsCompleted: levelProgress.questionsCompleted,
      totalQuestions: levelProgress.totalQuestions,
      bestScore: levelProgress.bestScore,
      completion: Math.round((levelProgress.questionsCompleted / levelProgress.totalQuestions) * 100)
    }
  }

  /**
   * 質問に適した画像を自動取得して設定（ローカル画像優先版）
   * @param question 質問オブジェクト
   */
  async function loadQuestionWithImage(question: PhraseQuestion) {
    try {
      console.log('Loading question with image:', question.phrase)

      // 既存の質問をまず設定
      currentQuestion.value = question
      createFloatingChoices(question)

      // ローカル画像が既に設定されている場合は、それを使用（変更しない）
      if (question.imageUrl && question.imageUrl.startsWith('/images/')) {
        console.log('Using local image, no change needed:', question.imageUrl)
        return
      }

      // ローカル画像がない場合のみ、外部画像を取得（通常は不要）
      const imageResult = await imageService.getImageForPhrase(question.phrase)

      // 質問が変わっていない場合のみ更新
      if (currentQuestion.value?.id === question.id) {
        const updatedQuestion = {
          ...question,
          imageUrl: imageResult.url,
          imageAlt: imageResult.alt
        }
        console.log('Updating question with external image:', updatedQuestion.imageUrl)
        currentQuestion.value = updatedQuestion
      }
    } catch (error) {
      console.warn('Failed to load image for phrase:', question.phrase, error)
      // フォールバック：元の画像URLを使用
      currentQuestion.value = question
      createFloatingChoices(question)
    }
  }

  /**
   * レベルの全問題の画像を事前読み込み
   * @param level 対象レベル
   */
  async function preloadLevelImages(level: string) {
    try {
      const levelQuestions = phraseQuestions.filter(q => q.level === level)
      const phrases = levelQuestions.map(q => q.phrase)
      await imageService.preloadImages(phrases)
    } catch (error) {
      console.warn('Failed to preload images for level:', level, error)
    }
  }

  // Initialize
  loadProgress()

  return {
    // State
    currentLevel,
    currentQuestionIndex,
    score,
    totalQuestions,
    answeredQuestions,
    isGameActive,
    timeStarted,
    timeElapsed,
    currentQuestion,
    choices,
    selectedChoice,
    showFeedback,
    feedbackType,
    gameProgress,
    gameSettings,
    isLoading,
    error,

    // Computed
    currentLevelQuestions,
    accuracy,
    progress,
    availableLevels,
    isGameComplete,

    // Actions
    startGame,
    getNextQuestion,
    checkAnswer,
    endGame,
    resetGame,
    saveProgress,
    loadProgress,
    updateSettings,
    getStatistics,
    loadQuestionWithImage,
    preloadLevelImages,
    nextQuestion: getNextQuestion
  }
}, {
  persist: {
    key: 'phrase-galaxy-store',
    storage: localStorage,
    paths: ['gameProgress', 'gameSettings']
  }
})