<!-- Multi-Layer Learning Engine - Rush Zone Component -->
<template>
  <div class="rush-zone-container">
    <!-- Header -->
    <div class="rush-zone-header">
      <h1 class="zone-title">⚡ Rush Zone</h1>
      <p class="zone-description">高速反復練習でスピードと正確性を向上させよう！</p>
      
      <!-- Stats Panel -->
      <div class="stats-panel">
        <div class="stat-item">
          <span class="stat-label">残り時間</span>
          <span class="stat-value timer" :class="{ 'time-warning': timeRemaining <= 30 }">
            {{ formatTime(timeRemaining) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正答率</span>
          <span class="stat-value">{{ Math.round(accuracy * 100) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">スピード</span>
          <span class="stat-value">{{ questionsPerMinute.toFixed(1) }}/分</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">コンボ</span>
          <span class="stat-value combo" :class="{ 'fever-mode': isFeverMode }">
            {{ comboCount }}x
          </span>
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <div class="game-area" v-if="gameState === 'playing'">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
            :class="{ 'fever-mode': isFeverMode }"
          ></div>
        </div>
        <span class="progress-text">{{ answeredQuestions }}/{{ totalQuestions }}</span>
      </div>

      <!-- Current Question -->
      <div class="question-container" v-if="currentQuestion">
        <div class="question-header">
          <span class="grammar-topic">{{ currentQuestion.grammarTopic }}</span>
          <span class="difficulty-badge" :class="currentQuestion.difficulty">
            {{ currentQuestion.difficulty }}
          </span>
        </div>
        
        <div class="question-content">
          <h2 class="question-text">{{ currentQuestion.question }}</h2>
          
          <!-- Answer Options -->
          <div class="answer-options">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="answer-option"
              :class="{ 
                'selected': selectedAnswer === index,
                'correct': showResult && index === currentQuestion.correctAnswer,
                'incorrect': showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer
              }"
              @click="selectAnswer(index)"
              :disabled="showResult"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Question Timer -->
        <div class="question-timer">
          <div 
            class="timer-bar" 
            :style="{ width: questionTimePercentage + '%' }"
            :class="{ 'time-warning': questionTimePercentage <= 30 }"
          ></div>
        </div>
      </div>

      <!-- Fever Mode Indicator -->
      <div class="fever-indicator" v-if="isFeverMode">
        <div class="fever-text">🔥 FEVER MODE 🔥</div>
        <div class="fever-multiplier">{{ bonusMultiplier }}x ボーナス!</div>
      </div>
    </div>

    <!-- Results Screen -->
    <div class="results-screen" v-if="gameState === 'completed'">
      <h2 class="results-title">Rush Zone 完了！</h2>
      
      <div class="final-stats">
        <div class="stat-card">
          <h3>最終スコア</h3>
          <p class="final-score">{{ finalScore }}</p>
        </div>
        <div class="stat-card">
          <h3>正答率</h3>
          <p>{{ Math.round(finalAccuracy * 100) }}%</p>
        </div>
        <div class="stat-card">
          <h3>平均スピード</h3>
          <p>{{ finalSpeed.toFixed(1) }} 問/分</p>
        </div>
        <div class="stat-card">
          <h3>最大コンボ</h3>
          <p>{{ maxCombo }}x</p>
        </div>
      </div>

      <!-- Performance Analysis -->
      <div class="performance-analysis" v-if="sessionPerformance">
        <h3>パフォーマンス分析</h3>
        <div class="analysis-grid">
          <div class="analysis-item">
            <span class="analysis-label">一貫性</span>
            <div class="analysis-bar">
              <div 
                class="analysis-fill" 
                :style="{ width: sessionPerformance.consistency + '%' }"
              ></div>
            </div>
            <span class="analysis-value">{{ Math.round(sessionPerformance.consistency) }}%</span>
          </div>
          <div class="analysis-item">
            <span class="analysis-label">エンゲージメント</span>
            <div class="analysis-bar">
              <div 
                class="analysis-fill" 
                :style="{ width: sessionPerformance.engagementLevel * 100 + '%' }"
              ></div>
            </div>
            <span class="analysis-value">{{ Math.round(sessionPerformance.engagementLevel * 100) }}%</span>
          </div>
        </div>

        <!-- Mistake Patterns -->
        <div class="mistake-patterns" v-if="sessionPerformance.mistakePatterns.length > 0">
          <h4>改善ポイント</h4>
          <ul>
            <li v-for="pattern in sessionPerformance.mistakePatterns" :key="pattern">
              {{ pattern }}
            </li>
          </ul>
        </div>

        <!-- Strong Points -->
        <div class="strong-points" v-if="sessionPerformance.strongPoints.length > 0">
          <h4>優秀なポイント</h4>
          <ul>
            <li v-for="point in sessionPerformance.strongPoints" :key="point">
              {{ point }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="btn-primary" @click="playAgain">もう一度プレイ</button>
        <button class="btn-secondary" @click="returnToHub">ハブに戻る</button>
        <button class="btn-accent" @click="tryConstructionZone">Construction Zone に挑戦</button>
      </div>
    </div>

    <!-- Start Screen -->
    <div class="start-screen" v-if="gameState === 'setup'">
      <h2>Rush Zone セッション設定</h2>
      
      <div class="setup-options">
        <div class="option-group">
          <label>英検レベル:</label>
          <select v-model="selectedEikenLevel" @change="onLevelChange">
            <option v-for="level in availableEikenLevels" :key="level.id" :value="level.id">
              {{ level.name }} - {{ level.description }}
            </option>
          </select>
          <div class="level-info" v-if="EIKEN_LEVELS[selectedEikenLevel]">
            <small>制限時間: {{ EIKEN_LEVELS[selectedEikenLevel].timeLimit }}秒/問</small>
          </div>
        </div>
        
        <div class="option-group">
          <label>問題数:</label>
          <select v-model="totalQuestions">
            <option value="15">15問 (短時間)</option>
            <option value="30">30問 (標準)</option>
            <option value="50">50問 (集中練習)</option>
          </select>
        </div>
        
        <div class="option-group">
          <label>混合レベル:</label>
          <input type="checkbox" v-model="useMixedLevels" id="mixedLevels">
          <label for="mixedLevels">複数レベルの問題をミックス</label>
        </div>
      </div>
      
      <button class="btn-start" @click="startRushSession">Rush Zone 開始！</button>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { multiLayerEngine } from '@/services/multiLayerEngine'
import { useGrammarMasteryStore } from '@/stores/grammarMasteryStore'
import { useGameAudio } from '@/composables/useGameAudio'
import { EIKEN_LEVELS, getRandomQuestions, getMixedQuestions } from '@/data/multi-layer/rushZoneQuestions'

export default {
  name: 'RushZoneGame',
  setup() {
    const grammarStore = useGrammarMasteryStore()
    const { playEffectSound, playWord } = useGameAudio()

    // Game State
    const gameState = ref('setup') // setup, playing, completed
    const currentSession = ref(null)
    const timeRemaining = ref(0)
    const currentQuestion = ref(null)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const answeredQuestions = ref(0)
    const correctAnswers = ref(0)
    const comboCount = ref(0)
    const maxCombo = ref(0)
    const questionStartTime = ref(0)
    const questionTimeLimit = ref(10) // seconds per question
    const questionTimeRemaining = ref(10)
    
    // Session Configuration
    const selectedTopic = ref('be_verbs_basic')
    const selectedLevel = ref('grade5') // Changed to Eiken level
    const selectedEikenLevel = ref('grade5')
    const totalQuestions = ref(30)
    const useMixedLevels = ref(false)
    
    // Performance Tracking
    const sessionPerformance = ref(null)
    const responses = ref([])
    
    // Timers
    let gameTimer = null
    let questionTimer = null
    
    // Computed Properties
    const accuracy = computed(() => {
      return answeredQuestions.value > 0 ? correctAnswers.value / answeredQuestions.value : 0
    })
    
    const questionsPerMinute = computed(() => {
      if (!currentSession.value) return 0
      const elapsed = (Date.now() - currentSession.value.startTime.getTime()) / 60000
      return elapsed > 0 ? answeredQuestions.value / elapsed : 0
    })
    
    const isFeverMode = computed(() => {
      return comboCount.value >= (currentSession.value?.configuration?.feverModeThreshold || 10)
    })
    
    const bonusMultiplier = computed(() => {
      return isFeverMode.value ? (currentSession.value?.configuration?.bonusMultiplier || 1.5) : 1
    })
    
    const progressPercentage = computed(() => {
      return (answeredQuestions.value / totalQuestions.value) * 100
    })
    
    const questionTimePercentage = computed(() => {
      return (questionTimeRemaining.value / questionTimeLimit.value) * 100
    })
    
    const finalScore = computed(() => {
      const baseScore = correctAnswers.value * 100
      const speedBonus = questionsPerMinute.value * 10
      const comboBonus = maxCombo.value * 50
      return Math.round(baseScore + speedBonus + comboBonus)
    })
    
    const finalAccuracy = computed(() => accuracy.value)
    const finalSpeed = computed(() => questionsPerMinute.value)
    
    const availableTopics = computed(() => {
      return grammarStore.unlockedTopics
    })

    // Question pool for current session
    const questionPool = ref([])
    const currentQuestionSet = ref([])
    
    // Available Eiken levels
    const availableEikenLevels = computed(() => {
      return Object.entries(EIKEN_LEVELS).map(([key, value]) => ({
        id: key,
        ...value
      }))
    })

    // Methods
    const initializeQuestions = () => {
      // Get questions based on selected mode
      if (useMixedLevels.value) {
        // Mixed levels - get questions from all levels
        questionPool.value = getMixedQuestions(['grade5', 'grade4', 'grade3'], totalQuestions.value)
        questionTimeLimit.value = 12 // Average time limit for mixed
      } else {
        // Single level
        questionPool.value = getRandomQuestions(selectedEikenLevel.value, totalQuestions.value)
        
        // Update time limit based on level
        const levelSettings = EIKEN_LEVELS[selectedEikenLevel.value]
        if (levelSettings) {
          questionTimeLimit.value = levelSettings.timeLimit
        }
      }
      
      currentQuestionSet.value = [...questionPool.value]
      logger.log(`✅ Loaded ${questionPool.value.length} questions for ${useMixedLevels.value ? 'mixed levels' : selectedEikenLevel.value}`)
    }
    
    const onLevelChange = () => {
      // Update time limit preview when level changes
      const levelSettings = EIKEN_LEVELS[selectedEikenLevel.value]
      if (levelSettings) {
        questionTimeLimit.value = levelSettings.timeLimit
      }
    }
    
    const startRushSession = async () => {
      try {
        // Initialize questions first
        initializeQuestions()
        
        if (currentQuestionSet.value.length === 0) {
          logger.error('No questions available for selected level')
          return
        }
        
        currentSession.value = multiLayerEngine.startRushZoneSession(
          'user123', // In real app, get from auth
          selectedTopic.value,
          selectedEikenLevel.value
        )
        
        gameState.value = 'playing'
        timeRemaining.value = currentSession.value.configuration.timeLimit
        
        await playEffectSound('gameStart')
        startGameTimer()
        loadNextQuestion()
        
      } catch (error) {
        logger.error('Failed to start Rush Zone session:', error)
      }
    }
    
    const startGameTimer = () => {
      gameTimer = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 30 && timeRemaining.value > 0) {
          playEffectSound('timeWarning')
        }
        
        if (timeRemaining.value <= 0) {
          endGame()
        }
      }, 1000)
    }
    
    const startQuestionTimer = () => {
      questionTimeRemaining.value = questionTimeLimit.value
      questionStartTime.value = Date.now()
      
      questionTimer = setInterval(() => {
        questionTimeRemaining.value--
        
        if (questionTimeRemaining.value <= 0) {
          timeoutQuestion()
        }
      }, 1000)
    }
    
    const loadNextQuestion = () => {
      if (answeredQuestions.value >= totalQuestions.value || currentQuestionSet.value.length === 0) {
        endGame()
        return
      }
      
      // Get next question from the randomized set
      const nextQuestion = currentQuestionSet.value.shift()
      if (!nextQuestion) {
        endGame()
        return
      }
      
      currentQuestion.value = { ...nextQuestion, id: Date.now() }
      selectedAnswer.value = null
      showResult.value = false
      
      startQuestionTimer()
    }
    
    const selectAnswer = async (index) => {
      if (showResult.value) return
      
      clearInterval(questionTimer)
      selectedAnswer.value = index
      showResult.value = true
      
      const isCorrect = index === currentQuestion.value.correctAnswer
      const responseTime = Date.now() - questionStartTime.value
      
      // Record response
      responses.value.push({
        questionId: currentQuestion.value.id,
        correct: isCorrect,
        responseTime,
        selectedAnswer: index,
        correctAnswer: currentQuestion.value.correctAnswer
      })
      
      answeredQuestions.value++
      
      if (isCorrect) {
        correctAnswers.value++
        comboCount.value++
        maxCombo.value = Math.max(maxCombo.value, comboCount.value)
        
        if (isFeverMode.value) {
          await playEffectSound('combo')
        } else {
          await playEffectSound('correct')
        }
      } else {
        comboCount.value = 0
        await playEffectSound('incorrect')
      }
      
      // Update real-time performance
      updateRealTimePerformance()
      
      // Auto advance after delay
      setTimeout(() => {
        loadNextQuestion()
      }, 1500)
    }
    
    const timeoutQuestion = () => {
      if (showResult.value) return
      
      selectedAnswer.value = -1 // Indicates timeout
      showResult.value = true
      comboCount.value = 0
      answeredQuestions.value++
      
      playEffectSound('timeWarning')
      
      // Record timeout response
      responses.value.push({
        questionId: currentQuestion.value.id,
        correct: false,
        responseTime: questionTimeLimit.value * 1000,
        selectedAnswer: -1,
        correctAnswer: currentQuestion.value.correctAnswer,
        timeout: true
      })
      
      updateRealTimePerformance()
      
      setTimeout(() => {
        loadNextQuestion()
      }, 1500)
    }
    
    const updateRealTimePerformance = () => {
      if (!currentSession.value) return
      
      const currentPerformance = {
        accuracy: accuracy.value,
        speed: questionsPerMinute.value,
        consistency: calculateConsistency(),
        engagementLevel: calculateEngagement()
      }
      
      multiLayerEngine.performRealTimeAdaptation(
        currentSession.value.sessionId,
        currentPerformance
      )
    }
    
    const calculateConsistency = () => {
      if (responses.value.length < 3) return 100
      
      const recentResponses = responses.value.slice(-5)
      const responseTimes = recentResponses.map(r => r.responseTime)
      const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / responseTimes.length
      const stdDev = Math.sqrt(variance)
      
      return Math.max(0, 100 - (stdDev / avgTime) * 100)
    }
    
    const calculateEngagement = () => {
      if (responses.value.length === 0) return 0.5
      
      const avgResponseTime = responses.value.reduce((sum, r) => sum + r.responseTime, 0) / responses.value.length
      const maxTime = questionTimeLimit.value * 1000
      const timeScore = Math.max(0, 1 - (avgResponseTime / maxTime))
      
      return (accuracy.value * 0.7) + (timeScore * 0.3)
    }
    
    const endGame = async () => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
      
      gameState.value = 'completed'
      
      // End session and get final performance
      if (currentSession.value) {
        sessionPerformance.value = multiLayerEngine.endSession(currentSession.value.sessionId)
        
        // Record progress in grammar store
        grammarStore.recordProgress(
          selectedTopic.value,
          correctAnswers.value > answeredQuestions.value * 0.8,
          (Date.now() - currentSession.value.startTime.getTime()) / 60000
        )
      }
      
      await playEffectSound(accuracy.value >= 0.8 ? 'perfectScore' : 'complete')
    }
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    
    const playAgain = () => {
      resetGame()
      startRushSession()
    }
    
    const returnToHub = () => {
      resetGame()
      // Navigate to grammar hub - implementation depends on router setup
      logger.log('Navigate to grammar hub')
    }
    
    const tryConstructionZone = () => {
      resetGame()
      // Navigate to construction zone - implementation depends on router setup
      logger.log('Navigate to construction zone')
    }
    
    const resetGame = () => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
      
      gameState.value = 'setup'
      currentSession.value = null
      timeRemaining.value = 0
      currentQuestion.value = null
      selectedAnswer.value = null
      showResult.value = false
      answeredQuestions.value = 0
      correctAnswers.value = 0
      comboCount.value = 0
      maxCombo.value = 0
      sessionPerformance.value = null
      responses.value = []
    }

    // Lifecycle
    onMounted(() => {
      logger.log('Rush Zone Game mounted')
    })
    
    onUnmounted(() => {
      clearInterval(gameTimer)
      clearInterval(questionTimer)
    })

    return {
      // State
      gameState,
      currentSession,
      timeRemaining,
      currentQuestion,
      selectedAnswer,
      showResult,
      answeredQuestions,
      correctAnswers,
      comboCount,
      maxCombo,
      selectedTopic,
      selectedLevel,
      selectedEikenLevel,
      totalQuestions,
      useMixedLevels,
      sessionPerformance,
      questionTimeRemaining,
      
      // Computed
      accuracy,
      questionsPerMinute,
      isFeverMode,
      bonusMultiplier,
      progressPercentage,
      questionTimePercentage,
      finalScore,
      finalAccuracy,
      finalSpeed,
      availableTopics,
      availableEikenLevels,
      
      // Constants
      EIKEN_LEVELS,
      
      // Methods
      startRushSession,
      selectAnswer,
      formatTime,
      playAgain,
      returnToHub,
      tryConstructionZone,
      onLevelChange
    }
  }
}
</script>

<style scoped>
.rush-zone-container {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.rush-zone-header {
  text-align: center;
  margin-bottom: 30px;
}

.zone-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.zone-description {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 20px;
}

.stats-panel {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
}

.timer.time-warning {
  color: #ff6b6b;
  animation: pulse 1s infinite;
}

.combo.fever-mode {
  color: #ff9f43;
  animation: glow 1s ease-in-out infinite alternate;
}

.game-area {
  max-width: 800px;
  margin: 0 auto;
}

.progress-container {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.3s ease;
}

.progress-fill.fever-mode {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  animation: shimmer 1s infinite;
}

.progress-text {
  font-weight: bold;
  min-width: 80px;
  text-align: right;
}

.question-container {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.grammar-topic {
  background: rgba(255,255,255,0.2);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.difficulty-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.difficulty-badge.beginner { background: #10b981; }
.difficulty-badge.intermediate { background: #f59e0b; }
.difficulty-badge.advanced { background: #ef4444; }

.question-text {
  font-size: 1.8rem;
  margin-bottom: 25px;
  text-align: center;
}

.answer-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.answer-option {
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.2);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.answer-option:hover {
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
}

.answer-option.selected {
  border-color: #60a5fa;
  background: rgba(96,165,250,0.3);
}

.answer-option.correct {
  border-color: #10b981;
  background: rgba(16,185,129,0.3);
}

.answer-option.incorrect {
  border-color: #ef4444;
  background: rgba(239,68,68,0.3);
}

.question-timer {
  margin-top: 20px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.1s linear;
}

.timer-bar.time-warning {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.fever-indicator {
  text-align: center;
  margin: 20px 0;
  animation: bounce 1s infinite;
}

.fever-text {
  font-size: 2rem;
  font-weight: bold;
  color: #ff9f43;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.fever-multiplier {
  font-size: 1.2rem;
  color: #fbbf24;
}

.results-screen {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.results-title {
  font-size: 2.5rem;
  margin-bottom: 30px;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  margin-bottom: 10px;
  opacity: 0.8;
}

.final-score {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.performance-analysis {
  background: rgba(255,255,255,0.1);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: left;
}

.analysis-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.analysis-label {
  min-width: 100px;
  font-weight: bold;
}

.analysis-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.analysis-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
  transition: width 0.5s ease;
}

.analysis-value {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
}

.mistake-patterns, .strong-points {
  margin-bottom: 15px;
}

.mistake-patterns ul, .strong-points ul {
  margin: 10px 0 0 20px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-accent, .btn-start {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-accent {
  background: #f59e0b;
  color: white;
}

.btn-start {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  font-size: 1.2rem;
  padding: 15px 30px;
}

.btn-primary:hover, .btn-accent:hover, .btn-start:hover {
  transform: translateY(-2px);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}

.start-screen {
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.setup-options {
  margin-bottom: 30px;
}

.option-group {
  margin-bottom: 20px;
}

.option-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.option-group select {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.9);
  color: #333;
  font-size: 1rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0% { text-shadow: 0 0 5px #ff9f43; }
  100% { text-shadow: 0 0 20px #ff9f43, 0 0 30px #ff9f43; }
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .stats-panel {
    gap: 15px;
  }
  
  .stat-item {
    padding: 10px;
    min-width: 120px;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>