// Grammar Game Composable
// 文法ゲーム共通機能を提供するコンポーザブル

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import logger from '@/utils/logger'

export function useGrammarGame(gameConfig = {}) {
  // ストア
  const grammarStore = useGrammarGalaxyStore()
  
  // 基本ゲーム状態
  const isGameActive = ref(false)
  const isPaused = ref(false)
  const isLoading = ref(false)
  const gamePhase = ref('intro') // intro, playing, results, completed
  
  // スコア管理
  const score = ref(0)
  const totalQuestions = ref(0)
  const correctAnswers = ref(0)
  const incorrectAnswers = ref(0)
  const currentStreak = ref(0)
  const maxStreak = ref(0)
  
  // タイマー管理
  const timeRemaining = ref(gameConfig.defaultTime || 60)
  const totalTime = ref(gameConfig.defaultTime || 60)
  const timerId = ref(null)
  const reactionTimes = ref([])
  const questionStartTime = ref(null)
  
  // レベル・進捗管理
  const currentLevel = ref(1)
  const currentQuestion = ref(0)
  const lives = ref(gameConfig.defaultLives || 3)
  const energy = ref(gameConfig.defaultEnergy || 100)
  
  // 効果音・アニメーション
  const showSuccess = ref(false)
  const showError = ref(false)
  const showCombo = ref(false)
  const comboCount = ref(0)
  
  // 計算されたプロパティ
  const accuracy = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((correctAnswers.value / totalQuestions.value) * 100)
  })
  
  const timeProgress = computed(() => {
    if (totalTime.value === 0) return 0
    return ((totalTime.value - timeRemaining.value) / totalTime.value) * 100
  })
  
  const averageReactionTime = computed(() => {
    if (reactionTimes.value.length === 0) return 0
    const sum = reactionTimes.value.reduce((a, b) => a + b, 0)
    return Math.round(sum / reactionTimes.value.length)
  })
  
  const starsEarned = computed(() => {
    const acc = accuracy.value
    if (acc >= 95) return 3
    if (acc >= 85) return 2
    if (acc >= 70) return 1
    return 0
  })
  
  const levelProgress = computed(() => {
    return {
      level: currentLevel.value,
      score: score.value,
      accuracy: accuracy.value,
      streak: maxStreak.value,
      stars: starsEarned.value
    }
  })
  
  // ゲーム開始
  const startGame = (config = {}) => {
    logger.log('🎮 Starting Grammar Game:', config)
    
    // 設定を適用
    timeRemaining.value = config.timeLimit || gameConfig.defaultTime || 60
    totalTime.value = timeRemaining.value
    lives.value = config.lives || gameConfig.defaultLives || 3
    energy.value = config.energy || gameConfig.defaultEnergy || 100
    
    // スコアリセット
    resetScore()
    
    // ゲーム状態設定
    isGameActive.value = true
    isPaused.value = false
    gamePhase.value = 'playing'
    
    // タイマー開始
    startTimer()
  }
  
  // ゲーム終了
  const endGame = (reason = 'completed') => {
    logger.log('🎮 Ending Grammar Game:', reason)
    
    clearTimer()
    isGameActive.value = false
    gamePhase.value = 'results'
    
    // 結果を記録
    const gameResult = {
      score: score.value,
      accuracy: accuracy.value,
      totalQuestions: totalQuestions.value,
      correctAnswers: correctAnswers.value,
      maxStreak: maxStreak.value,
      averageReactionTime: averageReactionTime.value,
      starsEarned: starsEarned.value,
      completedAt: new Date().toISOString(),
      reason
    }
    
    return gameResult
  }
  
  // ゲーム一時停止/再開
  const pauseGame = () => {
    if (!isGameActive.value) return
    
    isPaused.value = !isPaused.value
    
    if (isPaused.value) {
      clearTimer()
    } else {
      startTimer()
    }
  }
  
  // タイマー管理
  const startTimer = () => {
    if (timerId.value) clearInterval(timerId.value)
    
    timerId.value = setInterval(() => {
      if (timeRemaining.value > 0 && !isPaused.value) {
        timeRemaining.value--
      } else if (timeRemaining.value <= 0) {
        endGame('timeout')
      }
    }, 1000)
  }
  
  const clearTimer = () => {
    if (timerId.value) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }
  
  // 問題準備
  const prepareNextQuestion = () => {
    questionStartTime.value = Date.now()
  }
  
  // 回答処理
  const submitAnswer = (isCorrect, answerData = {}) => {
    if (!isGameActive.value || isPaused.value) return
    
    // 反応時間を記録
    const reactionTime = Date.now() - questionStartTime.value
    reactionTimes.value.push(reactionTime)
    
    if (isCorrect) {
      handleCorrectAnswer(reactionTime, answerData)
    } else {
      handleIncorrectAnswer(reactionTime, answerData)
    }
    
    // 注意: 次の問題の準備は各ゲームが責任を持つ
    // ここで自動的に prepareNextQuestion() を呼ぶと無限ループになる可能性がある
  }
  
  // 正解処理
  const handleCorrectAnswer = (reactionTime, answerData) => {
    correctAnswers.value++
    currentStreak.value++
    maxStreak.value = Math.max(maxStreak.value, currentStreak.value)
    
    // スコア計算（反応時間とストリークを考慮）
    let baseScore = gameConfig.baseScore || 100
    let speedBonus = Math.max(0, 50 - Math.floor(reactionTime / 100))
    let streakBonus = Math.min(currentStreak.value * 10, 100)
    
    const questionScore = baseScore + speedBonus + streakBonus
    score.value += questionScore
    
    // エネルギー回復
    energy.value = Math.min(100, energy.value + (gameConfig.energyReward || 10))
    
    // 効果表示
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 1000)
    
    // コンボ表示
    if (currentStreak.value >= 3) {
      comboCount.value = currentStreak.value
      showCombo.value = true
      setTimeout(() => { showCombo.value = false }, 1500)
    }
    
    logger.log('✅ Correct Answer:', {
      streak: currentStreak.value,
      score: questionScore,
      reactionTime
    })
  }
  
  // 不正解処理
  const handleIncorrectAnswer = (reactionTime, answerData) => {
    incorrectAnswers.value++
    currentStreak.value = 0
    
    // ライフ・エネルギー減少
    lives.value = Math.max(0, lives.value - 1)
    energy.value = Math.max(0, energy.value - (gameConfig.energyPenalty || 15))
    
    // 効果表示
    showError.value = true
    setTimeout(() => { showError.value = false }, 1000)
    
    // ゲームオーバーチェック
    if (lives.value <= 0 || energy.value <= 0) {
      endGame('gameOver')
    }
    
    logger.log('❌ Incorrect Answer:', {
      livesRemaining: lives.value,
      energyRemaining: energy.value,
      reactionTime
    })
  }
  
  // レベルアップ
  const levelUp = () => {
    currentLevel.value++
    
    // ボーナス
    score.value += 500
    energy.value = Math.min(100, energy.value + 25)
    
    logger.log('🎉 Level Up!', currentLevel.value)
  }
  
  // スコアリセット
  const resetScore = () => {
    score.value = 0
    totalQuestions.value = 0
    correctAnswers.value = 0
    incorrectAnswers.value = 0
    currentStreak.value = 0
    maxStreak.value = 0
    currentQuestion.value = 0
    reactionTimes.value = []
  }
  
  // ゲーム統計保存
  const saveGameStats = async (gameId, planetId = null) => {
    try {
      const stats = {
        gameId,
        planetId,
        score: score.value,
        accuracy: accuracy.value,
        starsEarned: starsEarned.value,
        completionTime: totalTime.value - timeRemaining.value,
        playedAt: new Date().toISOString()
      }
      
      // ストアに保存
      if (planetId && grammarStore.completeGame) {
        grammarStore.completeGame(
          planetId, 
          gameId, 
          score.value, 
          starsEarned.value, 
          stats.completionTime
        )
      }
      
      logger.log('💾 Game stats saved:', stats)
      return stats
    } catch (error) {
      logger.error('❌ Failed to save game stats:', error)
    }
  }
  
  // 音声効果再生
  const playSound = (soundType) => {
    try {
      // 実際の音声ファイルがある場合の実装
      const audio = new Audio(`/sounds/${soundType}.mp3`)
      audio.volume = 0.5
      audio.play().catch(e => logger.log('Sound play failed:', e))
    } catch (error) {
      logger.log('Sound not available:', soundType)
    }
  }
  
  // クリーンアップ
  onUnmounted(() => {
    clearTimer()
  })
  
  return {
    // State
    isGameActive,
    isPaused,
    isLoading,
    gamePhase,
    score,
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    currentStreak,
    maxStreak,
    timeRemaining,
    totalTime,
    currentLevel,
    currentQuestion,
    lives,
    energy,
    reactionTimes,
    
    // Visual Effects
    showSuccess,
    showError,
    showCombo,
    comboCount,
    
    // Computed
    accuracy,
    timeProgress,
    averageReactionTime,
    starsEarned,
    levelProgress,
    
    // Methods
    startGame,
    endGame,
    pauseGame,
    submitAnswer,
    levelUp,
    resetScore,
    saveGameStats,
    playSound,
    prepareNextQuestion
  }
}