<template>
  <div class="min-h-screen comparison-training-center">
    <!-- Simplified Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-4 py-2">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <button 
              @click="$router.push('/')" 
              class="nav-button home-btn"
            >
              <span class="text-base">🏠</span>
              <span class="text-xs">ホーム</span>
            </button>
            <button 
              @click="$router.push('//platforms/grammar-galaxy')" 
              class="nav-button galaxy-btn"
            >
              <span class="text-base">🌌</span>
              <span class="text-xs">銀河</span>
            </button>
          </div>
          
          <!-- Stage Progress Display -->
          <div class="stage-progress-card" v-if="gameState === 'training'">
            <div class="stage-indicator">
              Stage {{ currentStage }}/4
            </div>
            <div class="stage-name">{{ getStageName() }}</div>
            <div class="accuracy-display">
              正解率: {{ Math.round(accuracy * 100) }}%
            </div>
          </div>
        </div>

        <div class="text-center" v-if="gameState === 'setup'">
          <h1 class="text-xl md:text-2xl font-bold text-cyan-400 mb-1">
            ⚡ Comparison Master Training
          </h1>
          <p class="text-sm text-slate-300 mb-1">
            比較表現反射トレーニング
          </p>
          <p class="text-xs text-slate-400 max-w-2xl mx-auto">
            4段階のステップで比較級・最上級・as...asを瞬時に使い分けよう！
          </p>
        </div>
      </div>
    </header>

    <!-- Stage Selection Screen -->
    <main class="relative z-10 px-4 pb-8" v-if="gameState === 'setup'">
      <div class="max-w-3xl mx-auto">
        <div class="training-card p-4">
          <h2 class="text-lg font-bold text-center mb-4 text-cyan-400">
            🎯 トレーニングステージを選択
          </h2>
          
          <div class="stage-grid">
            <div 
              v-for="stage in trainingStages" 
              :key="stage.id"
              class="stage-card"
              :class="{ 'selected': selectedStage === stage.id, 'locked': isLocked(stage.id) }"
              @click="selectStage(stage.id)"
            >
              <div class="stage-header">
                <div class="stage-icon">{{ stage.icon }}</div>
                <div class="stage-title">{{ stage.title }}</div>
              </div>
              <div class="stage-description">{{ stage.description }}</div>
              <div class="stage-difficulty">{{ stage.difficulty }}</div>
              
              <div class="stage-stats" v-if="stageStats[stage.id]">
                <div class="stat-item">
                  <span class="stat-label">正解率:</span>
                  <span class="stat-value">{{ Math.round(stageStats[stage.id].accuracy * 100) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最高連続:</span>
                  <span class="stat-value">{{ stageStats[stage.id].maxStreak }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            class="start-training-btn"
            :disabled="!selectedStage || isLocked(selectedStage)"
            @click="startTraining"
          >
            🚀 トレーニング開始
          </button>
        </div>
      </div>
    </main>

    <!-- Training Screen -->
    <main class="relative z-10 px-6 pb-20" v-if="gameState === 'training'">
      <div class="max-w-4xl mx-auto">
        
        <!-- Progress Bar -->
        <div class="progress-container mb-6">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: (currentQuestion / totalQuestions) * 100 + '%' }"
            ></div>
          </div>
          <div class="progress-text">
            {{ currentQuestion }}/{{ totalQuestions }}
          </div>
        </div>

        <!-- Timer Display -->
        <div class="timer-container mb-6" v-if="currentStage === 1">
          <div class="timer-circle" :class="{ 'urgent': timeLeft <= 1 }">
            <span class="timer-text">{{ timeLeft.toFixed(1) }}</span>
          </div>
        </div>

        <!-- Question Display -->
        <div class="question-container mb-8">
          <component 
            :is="getQuestionComponent()"
            :question="currentQuestionData"
            :show-result="showResult"
            :selected-answer="selectedAnswer"
            :stage="currentStage"
            @answer-selected="handleAnswerSelected"
            @next-question="handleNextQuestion"
          />
        </div>

        <!-- Error Feedback -->
        <div class="error-feedback" v-if="showResult && !isCorrect && currentStage === 2">
          <div class="correct-answer-flash">
            <div class="flash-text">正解: {{ currentQuestionData.correctAnswer }}</div>
          </div>
        </div>

      </div>
    </main>

    <!-- Review Screen -->
    <main class="relative z-10 px-6 pb-20" v-if="gameState === 'review'">
      <div class="max-w-3xl mx-auto">
        <div class="review-card p-8">
          <div class="review-header">
            <div class="review-icon">📊</div>
            <h2 class="review-title">{{ getStageName() }} 結果</h2>
          </div>
          
          <div class="review-stats-grid">
            <div class="review-stat">
              <div class="stat-number">{{ Math.round(accuracy * 100) }}%</div>
              <div class="stat-label">正解率</div>
            </div>
            <div class="review-stat">
              <div class="stat-number">{{ streak }}</div>
              <div class="stat-label">最高連続正解</div>
            </div>
            <div class="review-stat">
              <div class="stat-number">{{ errorCount }}</div>
              <div class="stat-label">間違い数</div>
            </div>
            <div class="review-stat" v-if="currentStage === 1">
              <div class="stat-number">{{ averageResponseTime.toFixed(1) }}s</div>
              <div class="stat-label">平均反応時間</div>
            </div>
          </div>

          <!-- Weak Points Display -->
          <div class="weak-points-section" v-if="weakPoints.length > 0">
            <h3 class="weak-points-title">🎯 弱点パターン</h3>
            <div class="weak-points-list">
              <div 
                v-for="point in weakPoints" 
                :key="point.pattern"
                class="weak-point-item"
              >
                <span class="weak-point-pattern">{{ point.pattern }}</span>
                <span class="weak-point-count">{{ point.errors }}回間違い</span>
              </div>
            </div>
          </div>

          <div class="review-actions">
            <button 
              class="retry-btn"
              @click="retryStage"
              v-if="accuracy < 0.8"
            >
              🔄 再挑戦
            </button>
            <button 
              class="next-stage-btn"
              @click="nextStage"
              v-if="accuracy >= 0.8 && currentStage < 4"
            >
              ➡️ 次のステージ
            </button>
            <button 
              class="complete-btn"
              @click="completeTraining"
              v-if="accuracy >= 0.8 && currentStage === 4"
            >
              🎉 トレーニング完了
            </button>
            <button 
              class="back-to-menu-btn"
              @click="backToMenu"
            >
              📋 メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Results Screen -->
    <UnifiedResultScreen 
      v-if="gameState === 'results' && gameResult"
      :game-result="gameResult"
      @back-to-hub="handleBackToHub"
      @retry-game="handleRetryGame"
    />

    <CommonFooter 
      :active="'grammar'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import CommonFooter from '@/components/CommonFooter.vue'
import { VRDataSyncAPI } from '@/api/vrDataSync'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import UnifiedResultScreen from '@/components/game/UnifiedResultScreen.vue'

// Question Components
import Stage1FormatIdentification from './comparison-training/Stage1FormatIdentification.vue'
import Stage2IrregularDrill from './comparison-training/Stage2IrregularDrill.vue'
import Stage3ContextJudgment from './comparison-training/Stage3ContextJudgment.vue'
import Stage4ErrorCorrection from './comparison-training/Stage4ErrorCorrection.vue'

export default {
  name: 'ComparisonMasterGame',
  components: {
    CommonFooter,
    UnifiedResultScreen,
    Stage1FormatIdentification,
    Stage2IrregularDrill,
    Stage3ContextJudgment,
    Stage4ErrorCorrection
  },
  setup() {
    const router = useRouter()
    const { playEffectSound } = useGameAudio()
    const playerProfileStore = usePlayerProfileStore()
    const vrDataSync = new VRDataSyncAPI()

    // Game State Management
    const gameState = ref('setup') // setup, training, review, results
    const selectedStage = ref(1)
    const currentStage = ref(1)
    const currentQuestion = ref(1)
    const totalQuestions = ref(20)
    const gameStartTime = ref(null)
    const gameResult = ref(null)

    // Question State
    const currentQuestionData = ref(null)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const isCorrect = ref(false)
    const timeLeft = ref(3.0)
    const timerInterval = ref(null)

    // Statistics
    const correctAnswers = ref(0)
    const totalAnswered = ref(0)
    const streak = ref(0)
    const maxStreak = ref(0)
    const errorCount = ref(0)
    const responseTimes = ref([])
    const errorPatterns = reactive({})
    const weakPoints = ref([])

    // Stage Configuration
    const trainingStages = [
      {
        id: 1,
        title: '形式識別トレーニング',
        icon: '⚡',
        description: '2つ→比較級、3つ→最上級、同等→as...as の瞬時判断',
        difficulty: '制限時間: 8秒 → 2秒'
      },
      {
        id: 2,
        title: '不規則変化ドリル',
        icon: '🧠',
        description: 'good→better→best など不規則変化の記憶定着',
        difficulty: '間違いは10回フラッシュ表示'
      },
      {
        id: 3,
        title: '文脈判断トレーニング',
        icon: '📖',
        description: '文章の状況から適切な形式を判断',
        difficulty: '実用的な文脈での練習'
      },
      {
        id: 4,
        title: 'エラー矯正モード',
        icon: '🛠️',
        description: 'よくある間違いを検出・修正',
        difficulty: '"more bigger"等の誤用を正す'
      }
    ]

    // Persistent Stage Statistics (ALL UNLOCKED FOR DEVELOPMENT)
    const stageStats = reactive({
      1: { accuracy: 0, maxStreak: 0, unlocked: true },
      2: { accuracy: 0, maxStreak: 0, unlocked: true },
      3: { accuracy: 0, maxStreak: 0, unlocked: true },
      4: { accuracy: 0, maxStreak: 0, unlocked: true }
    })

    // Error Tracking System
    const errorTracker = reactive({
      patterns: {},
      recentErrors: [],
      scheduledReviews: {}
    })

    // Computed Properties
    const accuracy = computed(() => {
      return totalAnswered.value > 0 ? correctAnswers.value / totalAnswered.value : 0
    })

    const averageResponseTime = computed(() => {
      return responseTimes.value.length > 0 
        ? responseTimes.value.reduce((a, b) => a + b, 0) / responseTimes.value.length 
        : 0
    })

    // Methods
    const getStageName = () => {
      return trainingStages.find(s => s.id === currentStage.value)?.title || ''
    }

    const isLocked = (stageId) => {
      // All stages unlocked for development
      return false
    }

    const selectStage = (stageId) => {
      if (!isLocked(stageId)) {
        selectedStage.value = stageId
      }
    }

    const startTraining = async () => {
      currentStage.value = selectedStage.value
      gameState.value = 'training'
      gameStartTime.value = Date.now()
      
      resetTrainingStats()
      await generateQuestion()
      
      if (currentStage.value === 1) {
        startTimer()
      }
      
      await playEffectSound('gameStart')
    }

    const resetTrainingStats = () => {
      currentQuestion.value = 1
      correctAnswers.value = 0
      totalAnswered.value = 0
      streak.value = 0
      errorCount.value = 0
      responseTimes.value = []
      weakPoints.value = []
      
      // Set questions based on stage
      switch (currentStage.value) {
        case 1:
          totalQuestions.value = 8
          timeLeft.value = 8.0
          break
        case 2:
          totalQuestions.value = 10
          break
        case 3:
          totalQuestions.value = 8
          break
        case 4:
          totalQuestions.value = 7
          break
      }
    }

    const generateQuestion = async () => {
      // This will be implemented in individual stage components
      // For now, create a basic structure
      currentQuestionData.value = {
        id: currentQuestion.value,
        stage: currentStage.value,
        // Additional question data will be generated by stage components
      }
      
      selectedAnswer.value = null
      showResult.value = false
      
      if (currentStage.value === 1) {
        startTimer()
      }
    }

    const startTimer = () => {
      clearInterval(timerInterval.value)
      
      // Progressive difficulty: start at 8 seconds, reduce to 2 seconds
      const progressRatio = currentQuestion.value / totalQuestions.value
      timeLeft.value = Math.max(2.0, 8.0 - (progressRatio * 6.0))
      
      timerInterval.value = setInterval(() => {
        timeLeft.value -= 0.1
        if (timeLeft.value <= 0) {
          handleTimeout()
        }
      }, 100)
    }

    const handleTimeout = () => {
      clearInterval(timerInterval.value)
      handleAnswerSelected(null) // No answer selected = incorrect
    }

    const handleAnswerSelected = async (answerId) => {
      if (showResult.value) return

      clearInterval(timerInterval.value)
      
      const responseTime = currentStage.value === 1 
        ? (8.0 - timeLeft.value) 
        : Date.now() - (gameStartTime.value + (currentQuestion.value - 1) * 8000)

      selectedAnswer.value = answerId
      showResult.value = true
      totalAnswered.value++
      
      // Determine if answer is correct (will be handled by stage components)
      isCorrect.value = checkAnswer(answerId)
      
      if (isCorrect.value) {
        correctAnswers.value++
        streak.value++
        maxStreak.value = Math.max(maxStreak.value, streak.value)
        await playEffectSound('correct')
      } else {
        errorCount.value++
        streak.value = 0
        trackError(currentQuestionData.value, answerId)
        await playEffectSound('incorrect')
        
        // Stage 2 specific: Flash correct answer
        if (currentStage.value === 2) {
          showCorrectAnswerFlash()
        }
      }
      
      if (currentStage.value === 1) {
        responseTimes.value.push(responseTime)
      }
      
      // All stages use manual advance with next question button
      // Auto-advance removed to allow proper reading of explanations
    }

    const checkAnswer = (answerId) => {
      // This will be implemented by individual stage components
      // Return true/false based on correct answer
      return currentQuestionData.value?.correctAnswer === answerId
    }

    const trackError = (question, wrongAnswer) => {
      const pattern = getErrorPattern(question, wrongAnswer)
      if (!errorPatterns[pattern]) {
        errorPatterns[pattern] = 0
      }
      errorPatterns[pattern]++
      
      // Schedule for review (5 min, 30 min, 1 day)
      const now = Date.now()
      errorTracker.recentErrors.push({
        question,
        wrongAnswer,
        timestamp: now,
        pattern
      })
      
      // Add to scheduled reviews
      if (!errorTracker.scheduledReviews[pattern]) {
        errorTracker.scheduledReviews[pattern] = []
      }
      
      errorTracker.scheduledReviews[pattern].push({
        reviewTimes: [now + 5*60*1000, now + 30*60*1000, now + 24*60*60*1000],
        completed: 0
      })
    }

    const getErrorPattern = (question, wrongAnswer) => {
      // Analyze the type of error made
      if (currentStage.value === 1) {
        return `format_identification_${question.correctFormat}_chosen_${wrongAnswer}`
      } else if (currentStage.value === 2) {
        return `irregular_form_${question.baseForm}_chosen_${wrongAnswer}`
      }
      return 'general_error'
    }

    const showCorrectAnswerFlash = () => {
      // Show correct answer for 3 seconds with flashing effect
      let flashCount = 0
      const flashInterval = setInterval(() => {
        flashCount++
        if (flashCount >= 10) {
          clearInterval(flashInterval)
        }
      }, 300)
    }

    const handleNextQuestion = () => {
      nextQuestion()
    }

    const nextQuestion = () => {
      if (currentQuestion.value >= totalQuestions.value) {
        finishStage()
      } else {
        currentQuestion.value++
        generateQuestion()
      }
    }

    const finishStage = () => {
      generateWeakPoints()
      updateStageStats()
      gameState.value = 'review'
    }

    const generateWeakPoints = () => {
      weakPoints.value = Object.entries(errorPatterns)
        .map(([pattern, errors]) => ({ pattern, errors }))
        .sort((a, b) => b.errors - a.errors)
        .slice(0, 5)
    }

    const updateStageStats = () => {
      stageStats[currentStage.value].accuracy = accuracy.value
      stageStats[currentStage.value].maxStreak = Math.max(
        stageStats[currentStage.value].maxStreak, 
        maxStreak.value
      )
      
      // Unlock next stage if performance is good
      if (accuracy.value >= 0.8 && currentStage.value < 4) {
        stageStats[currentStage.value + 1].unlocked = true
      }
    }

    const retryStage = () => {
      gameState.value = 'training'
      resetTrainingStats()
      generateQuestion()
    }

    const nextStage = () => {
      currentStage.value++
      selectedStage.value = currentStage.value
      gameState.value = 'training'
      resetTrainingStats()
      generateQuestion()
    }

    const backToMenu = () => {
      gameState.value = 'setup'
    }

    const completeTraining = async () => {
      gameState.value = 'results'
      await handleGameCompletion()
    }

    const handleGameCompletion = async () => {
      try {
        const totalPracticeTime = Date.now() - gameStartTime.value
        const finalScore = Math.round(accuracy.value * 1000 + maxStreak.value * 100)
        const crystalReward = Math.floor(finalScore / 10)
        
        const result = {
          gameId: 'comparison-master-training',
          gameName: 'Comparison Master Training',
          score: finalScore,
          accuracy: accuracy.value,
          duration: totalPracticeTime,
          questionsAnswered: totalAnswered.value,
          correctAnswers: correctAnswers.value,
          maxStreak: maxStreak.value,
          stagesCompleted: Object.values(stageStats).filter(s => s.accuracy >= 0.8).length,
          crystalReward,
          vrReadinessGain: Math.floor(accuracy.value * 30),
          skills: {
            'grammar.comparison_reflexes': {
              practiceTime: totalPracticeTime,
              correctAnswers: correctAnswers.value,
              incorrectAnswers: errorCount.value,
              averageResponseTime: averageResponseTime.value
            }
          }
        }
        
        playerProfileStore.addCrystals(crystalReward)
        
        const syncSuccess = await vrDataSync.syncGameResult(result)
        if (syncSuccess) {
          logger.log('✅ Comparison Training result synced with VR Academy')
        }
        
        gameResult.value = result
        
      } catch (error) {
        logger.error('❌ Error in handleGameCompletion:', error)
      }
    }

    const getQuestionComponent = () => {
      const components = {
        1: 'Stage1FormatIdentification',
        2: 'Stage2IrregularDrill',
        3: 'Stage3ContextJudgment',
        4: 'Stage4ErrorCorrection'
      }
      return components[currentStage.value] || 'Stage1FormatIdentification'
    }

    const handleBackToHub = () => {
      router.push({ name: 'grammar-core-planet' })
    }

    const handleRetryGame = () => {
      gameState.value = 'setup'
      gameResult.value = null
    }

    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure')
          break
        case 'grammar':
          router.push('//platforms/grammar-galaxy')
          break
        case 'multi-layer':
          router.push('/multi-layer')
          break
        case 'co-pilot':
          router.push('/co-pilot-dock')
          break
        case 'vr-academy':
          router.push('/vr-academy')
          break
        default:
          logger.warn('Unknown navigation section:', section)
      }
    }


    // Lifecycle
    onMounted(() => {
      logger.log('Comparison Master Training loaded')
      // Load saved stage stats from localStorage
      const saved = localStorage.getItem('comparison-master-stats')
      if (saved) {
        Object.assign(stageStats, JSON.parse(saved))
      }
    })

    onUnmounted(() => {
      clearInterval(timerInterval.value)
      // Save stage stats to localStorage
      localStorage.setItem('comparison-master-stats', JSON.stringify(stageStats))
    })

    return {
      // State
      gameState,
      selectedStage,
      currentStage,
      currentQuestion,
      totalQuestions,
      currentQuestionData,
      selectedAnswer,
      showResult,
      isCorrect,
      timeLeft,
      
      // Stats
      accuracy,
      streak,
      maxStreak,
      errorCount,
      averageResponseTime,
      weakPoints,
      
      // Configuration
      trainingStages,
      stageStats,
      
      // Methods
      getStageName,
      isLocked,
      selectStage,
      startTraining,
      handleAnswerSelected,
      retryStage,
      nextStage,
      backToMenu,
      completeTraining,
      getQuestionComponent,
      handleBackToHub,
      handleRetryGame,
      handleFooterNavigation,
      handleNextQuestion,
      gameResult
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.comparison-training-center {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Simplified Background */
.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #00d4ff, transparent),
              radial-gradient(1px 1px at 20px 50px, #fff, transparent);
  background-repeat: repeat;
  background-size: 300px 300px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(0, 255, 234, 0.03) 0%, transparent 50%);
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Navigation */
.nav-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid rgba(0, 212, 255, 0.3);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
}

.nav-button:hover {
  border-color: rgba(0, 212, 255, 0.6);
  background: rgba(15, 23, 42, 0.9);
  transform: translateY(-1px);
}

/* Stage Progress Card */
.stage-progress-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.stage-indicator {
  font-size: 0.7rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 2px;
}

.stage-name {
  font-size: 0.6rem;
  color: #94a3b8;
  margin-bottom: 2px;
}

.accuracy-display {
  font-size: 0.6rem;
  font-weight: bold;
  color: #fbbf24;
}

/* Training Card */
.training-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* Stage Grid */
.stage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stage-card {
  padding: 12px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  min-height: 120px;
}

.stage-card:hover:not(.locked) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 212, 255, 0.1);
}

.stage-card.selected {
  border-color: #00d4ff;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.15), rgba(0, 100, 200, 0.1));
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.stage-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(107, 114, 128, 0.3);
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stage-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 4px rgba(0, 212, 255, 0.4));
}

.stage-title {
  font-size: 0.85rem;
  font-weight: bold;
  color: #00d4ff;
  line-height: 1.2;
}

.stage-description {
  color: #94a3b8;
  margin-bottom: 6px;
  line-height: 1.2;
  font-size: 0.7rem;
}

.stage-difficulty {
  font-size: 0.65rem;
  color: #fbbf24;
  font-weight: bold;
  margin-bottom: 8px;
}

.stage-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-label {
  font-size: 0.6rem;
  color: #94a3b8;
}

.stat-value {
  font-size: 0.75rem;
  font-weight: bold;
  color: #00ffea;
}

/* Start Button */
.start-training-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
}

.start-training-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00b8ff, #0052cc);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  transform: translateY(-1px);
}

.start-training-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Progress Bar */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.progress-bar {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #00ffea);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
}

/* Timer */
.timer-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.timer-circle {
  width: 80px;
  height: 80px;
  border: 4px solid rgba(0, 212, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  transition: all 0.3s ease;
}

.timer-circle.urgent {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  animation: urgentPulse 0.5s infinite;
}

.timer-text {
  font-size: 1.8rem;
  font-weight: bold;
  color: #00d4ff;
}

.timer-circle.urgent .timer-text {
  color: #ef4444;
}

@keyframes urgentPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Question Container */
.question-container {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(20px);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Error Feedback */
.error-feedback {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.correct-answer-flash {
  padding: 20px 40px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.3));
  border: 2px solid #10b981;
  border-radius: 15px;
  animation: flashCorrectAnswer 3s ease-out;
}

.flash-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  text-align: center;
}

@keyframes flashCorrectAnswer {
  0%, 20%, 40%, 60%, 80% { opacity: 1; transform: scale(1.05); }
  10%, 30%, 50%, 70% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 1; transform: scale(1); }
}

/* Review Screen */
.review-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(20px);
}

.review-header {
  text-align: center;
  margin-bottom: 30px;
}

.review-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.review-title {
  font-size: 2rem;
  font-weight: bold;
  color: #00d4ff;
}

.review-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.review-stat {
  text-align: center;
  padding: 20px;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Weak Points */
.weak-points-section {
  margin: 25px 0;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 15px;
}

.weak-points-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ef4444;
  text-align: center;
  margin-bottom: 15px;
}

.weak-points-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weak-point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.weak-point-pattern {
  color: #ef4444;
  font-weight: bold;
}

.weak-point-count {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Review Actions */
.review-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.next-stage-btn,
.complete-btn,
.back-to-menu-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.retry-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.next-stage-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.complete-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.back-to-menu-btn {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.3), rgba(75, 85, 99, 0.4));
  color: #94a3b8;
  border: 2px solid rgba(107, 114, 128, 0.5);
}

.retry-btn:hover,
.next-stage-btn:hover,
.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.back-to-menu-btn:hover {
  border-color: rgba(107, 114, 128, 0.8);
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.4), rgba(75, 85, 99, 0.5));
}


/* Responsive Design */
@media (max-width: 768px) {
  .stage-grid {
    grid-template-columns: 1fr;
  }
  
  .review-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .review-actions {
    flex-direction: column;
  }
  
  .stage-progress-card {
    padding: 6px 12px;
  }
  
  .stage-indicator,
  .stage-name,
  .accuracy-display {
    font-size: 0.6rem;
  }
}
</style>