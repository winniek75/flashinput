<template>
  <div class="english-practice-app">
    <!-- Cosmic Background -->
    <div class="cosmic-background">
      <div class="stars"></div>
      <div class="floating-particles">
        <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
      <div class="nebula-clouds">
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Course Selection -->
      <div
        v-if="currentView === 'courses'"
        class="course-selection"
      >
        <header class="app-header">
          <div class="galaxy-map-container">
            <button class="galaxy-map-button top-button" @click="goToGalaxyMap">
              🌌 Galaxy Map
            </button>
          </div>
          <div class="cosmic-title">
            <span class="planet-icon">🌌</span>
            <h1>Cosmic English Academy</h1>
            <span class="planet-icon">🚀</span>
          </div>
          <p>宇宙を旅しながら英語をマスターしよう</p>
        </header>

        <div class="course-list">
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            @click="selectCourse(course)"
          >
            <h3>{{ course.name }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-info">
              <span class="level">{{ course.level }}</span>
              <span class="duration">{{ course.estimatedTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lesson List -->
      <div
        v-else-if="currentView === 'lessons'"
        class="lesson-list"
      >
        <header class="section-header">
          <button class="back-button" @click="backToCourses">
            ← コース一覧に戻る
          </button>
          <h2>{{ selectedCourse?.name }}</h2>
          <button class="galaxy-map-button" @click="goToGalaxyMap">
            🌌 Galaxy Map
          </button>
        </header>

        <div class="lessons">
          <div
            v-for="lesson in selectedCourse?.lessons"
            :key="lesson.id"
            class="lesson-card"
            @click="startLesson(lesson)"
          >
            <h4>{{ lesson.title }}</h4>
            <p>{{ lesson.subtitle }}</p>
            <div class="lesson-info">
              <span class="difficulty">{{ lesson.difficulty }}</span>
              <span class="duration">{{ lesson.estimatedTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reading Practice -->
      <div
        v-else-if="currentView === 'reading'"
        class="reading-practice"
      >
        <header class="section-header">
          <button class="back-button" @click="backToLessons">
            ← レッスン一覧に戻る
          </button>
          <h3>{{ selectedLesson?.title }}</h3>
          <button class="galaxy-map-button" @click="goToGalaxyMap">
            🌌 Galaxy Map
          </button>
        </header>

        <div class="reading-content">
          <div class="text-section">
            <p class="reading-text">{{ selectedLesson?.text }}</p>
          </div>

          <div class="reading-controls">
            <button class="practice-button" @click="startQuiz">
              練習問題を開始
            </button>
          </div>
        </div>
      </div>

      <!-- Quiz Section -->
      <div
        v-else-if="currentView === 'quiz'"
        class="quiz-section"
      >
        <header class="section-header">
          <button class="back-button" @click="backToReading">
            ← 読解に戻る
          </button>
          <h3>練習問題</h3>
          <div class="quiz-progress">
            問題 {{ currentQuestionIndex + 1 }} / {{ quizQuestions.length }}
          </div>
          <button class="galaxy-map-button" @click="goToGalaxyMap">
            🌌 Galaxy Map
          </button>
        </header>

        <div class="quiz-content" v-if="currentQuestion">
          <div class="question-section">
            <h4>{{ currentQuestion.title }}</h4>
            <p class="question-text" v-html="currentQuestion.question"></p>
          </div>

          <div class="options-section">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-button"
              :class="{
                'selected': selectedAnswer === index,
                'correct': showResult && index === currentQuestion.correctIndex,
                'incorrect': showResult && selectedAnswer === index && index !== currentQuestion.correctIndex
              }"
              @click="selectAnswer(index)"
              :disabled="showResult"
            >
              {{ option }}
            </button>
          </div>

          <div v-if="showResult" class="result-section">
            <div class="explanation">
              <h5>解説:</h5>
              <p>{{ currentQuestion.explanation }}</p>
            </div>

            <div class="learning-objective" v-if="currentQuestion.learningObjective">
              <h5>学習ポイント:</h5>
              <p>{{ currentQuestion.learningObjective }}</p>
            </div>

            <button class="next-button" @click="nextQuestion">
              {{ isLastQuestion ? '結果を見る' : '次の問題' }}
            </button>
          </div>

          <button
            v-else
            class="submit-button"
            @click="submitAnswer"
            :disabled="selectedAnswer === null"
          >
            回答する
          </button>
        </div>
      </div>

      <!-- Results -->
      <div
        v-else-if="currentView === 'results'"
        class="results-section"
      >
        <header class="section-header">
          <h3>練習結果</h3>
          <button class="galaxy-map-button" @click="goToGalaxyMap">
            🌌 Galaxy Map
          </button>
        </header>

        <div class="results-content">
          <div class="score-display">
            <h4>正解率: {{ Math.round((correctAnswers / quizQuestions.length) * 100) }}%</h4>
            <p>{{ correctAnswers }} / {{ quizQuestions.length }} 問正解</p>
          </div>

          <div class="results-actions">
            <button class="retry-button" @click="retryQuiz">
              もう一度練習
            </button>
            <button class="next-lesson-button" @click="backToLessons">
              次のレッスンへ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="errorMessage" class="error-modal">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">エラーが発生しました</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <button class="error-button" @click="clearError">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// View state
const currentView = ref('courses') // 'courses', 'lessons', 'reading', 'quiz', 'results'
const selectedCourse = ref(null)
const selectedLesson = ref(null)

// Quiz state
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const correctAnswers = ref(0)
const userAnswers = ref([])

// UI state
const isLoading = ref(false)
const loadingMessage = ref('')
const errorMessage = ref('')

// Data from artifacts.json (simplified structure)
const courses = ref([])

// Computed properties
const quizQuestions = computed(() => {
  return selectedLesson.value?.barriers || []
})

const currentQuestion = computed(() => {
  return quizQuestions.value[currentQuestionIndex.value] || null
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === quizQuestions.value.length - 1
})

// Navigation methods
function selectCourse(course) {
  selectedCourse.value = course
  currentView.value = 'lessons'
}

function backToCourses() {
  selectedCourse.value = null
  currentView.value = 'courses'
}

function startLesson(lesson) {
  selectedLesson.value = lesson
  currentView.value = 'reading'
}

function backToLessons() {
  selectedLesson.value = null
  currentView.value = 'lessons'
}

function backToReading() {
  currentView.value = 'reading'
  resetQuiz()
}

function startQuiz() {
  resetQuiz()
  currentView.value = 'quiz'
}

function resetQuiz() {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showResult.value = false
  correctAnswers.value = 0
  userAnswers.value = []
}

// Quiz methods
function selectAnswer(index) {
  if (!showResult.value) {
    selectedAnswer.value = index
  }
}

function submitAnswer() {
  if (selectedAnswer.value === null) return

  showResult.value = true

  const isCorrect = selectedAnswer.value === currentQuestion.value.correctIndex
  if (isCorrect) {
    correctAnswers.value++
  }

  userAnswers.value.push({
    questionIndex: currentQuestionIndex.value,
    selectedAnswer: selectedAnswer.value,
    isCorrect
  })
}

function nextQuestion() {
  if (isLastQuestion.value) {
    currentView.value = 'results'
  } else {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showResult.value = false
  }
}

function retryQuiz() {
  resetQuiz()
  currentView.value = 'quiz'
}

function goToGalaxyMap() {
  // Galaxy Mapに戻る（実際のルーターパスに応じて変更）
  router.push('/')
}

// Utility methods
function showError(message) {
  errorMessage.value = message
}

function clearError() {
  errorMessage.value = ''
}

// Load data
async function loadCourses() {
  try {
    isLoading.value = true
    loadingMessage.value = 'コースを読み込み中...'

    // Load from artifacts.json and convert to simple course structure
    const response = await fetch('/src/data/grammar-art-gallery/artifacts.json')
    const data = await response.json()

    courses.value = data.wings.map(wing => ({
      id: wing.id,
      name: wing.name,
      description: wing.description,
      level: wing.level,
      estimatedTime: '30-45分',
      lessons: wing.artifacts.map(artifact => ({
        id: artifact.id,
        title: artifact.title,
        subtitle: artifact.subtitle,
        difficulty: artifact.difficulty,
        estimatedTime: artifact.estimatedTime,
        text: artifact.text,
        barriers: artifact.barriers
      }))
    }))

    isLoading.value = false
  } catch (error) {
    console.error('Failed to load courses:', error)
    showError('コースの読み込みに失敗しました。ページを再読み込みしてください。')
    isLoading.value = false
  }
}

// Cosmic effects
function getParticleStyle(index) {
  const size = Math.random() * 4 + 1
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 10
  const duration = Math.random() * 20 + 10

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// Lifecycle
onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.english-practice-app {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0c0f1a 0%, #1a1f3a 50%, #2d1b69 100%);
  color: #ffffff;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 10;
}

.cosmic-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.planet-icon {
  font-size: 3rem;
  animation: rotate 10s linear infinite;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.6);
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* App Header */
.app-header {
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 222, 128, 0.3);
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.2);
}

.app-header h1 {
  font-size: 3.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #4ade80, #22d3ee, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.app-header p {
  font-size: 1.3rem;
  color: #94a3b8;
  margin: 0;
  opacity: 0.9;
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.section-header h2,
.section-header h3 {
  font-size: 2.2rem;
  font-weight: bold;
  color: #4ade80;
  margin: 0;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.back-button {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.back-button:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(147, 51, 234, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.galaxy-map-button {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8));
  border: 1px solid rgba(168, 85, 247, 0.5);
  border-radius: 12px;
  padding: 0.8rem 1.2rem;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: auto;
}

.galaxy-map-button:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 1), rgba(236, 72, 153, 1));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
  animation: pulse 0.5s ease-in-out;
}

.galaxy-map-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.galaxy-map-button.top-button {
  margin: 0;
  position: relative;
  font-size: 0.9rem;
  padding: 0.7rem 1rem;
}

/* Course Selection */
.course-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.course-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 18px;
  padding: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(34, 211, 238, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.course-card:hover::before {
  opacity: 1;
}

.course-card:hover {
  transform: translateY(-5px);
  border-color: rgba(74, 222, 128, 0.6);
  box-shadow: 0 15px 40px rgba(74, 222, 128, 0.2);
}

.course-card > * {
  position: relative;
  z-index: 2;
}

.course-card h3 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4ade80;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

.course-card p {
  color: #cbd5e1;
  margin: 0 0 1.5rem 0;
  line-height: 1.7;
  opacity: 0.9;
}

.course-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.level,
.duration,
.difficulty {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3));
  color: #ffffff;
  padding: 0.4rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(168, 85, 247, 0.4);
  backdrop-filter: blur(5px);
}

/* Lesson List */
.lessons {
  display: grid;
  gap: 1.5rem;
}

.lesson-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 15px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.lesson-card:hover {
  transform: translateY(-3px);
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.2);
}

.lesson-card h4 {
  font-size: 1.4rem;
  font-weight: bold;
  color: #22d3ee;
  margin: 0 0 0.8rem 0;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
}

.lesson-card p {
  color: #94a3b8;
  margin: 0 0 1.2rem 0;
  line-height: 1.6;
}

.lesson-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Reading Practice */
.reading-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 20px;
  padding: 3rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.reading-text {
  font-size: 1.2rem;
  line-height: 1.9;
  color: #e2e8f0;
  margin: 0 0 3rem 0;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 15px;
  border-left: 4px solid #4ade80;
  backdrop-filter: blur(5px);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.reading-controls {
  text-align: center;
}

.practice-button {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  color: #0f172a;
  border: none;
  border-radius: 15px;
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.practice-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(74, 222, 128, 0.4);
  background: linear-gradient(135deg, #22d3ee, #4ade80);
}

/* Quiz Section */
.quiz-progress {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3));
  color: #ffffff;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: auto;
  border: 1px solid rgba(168, 85, 247, 0.4);
  backdrop-filter: blur(5px);
}

.quiz-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 20px;
  padding: 3rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.question-section h4 {
  font-size: 1.6rem;
  font-weight: bold;
  color: #22d3ee;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
}

.question-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #cbd5e1;
  margin: 0 0 2.5rem 0;
  white-space: pre-line;
}

.options-section {
  display: grid;
  gap: 1.2rem;
  margin-bottom: 2.5rem;
}

.option-button {
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(74, 222, 128, 0.3);
  border-radius: 12px;
  padding: 1.2rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.05rem;
  color: #e2e8f0;
  backdrop-filter: blur(5px);
}

.option-button:hover:not(:disabled) {
  border-color: rgba(74, 222, 128, 0.6);
  background: rgba(74, 222, 128, 0.1);
  transform: translateX(5px);
}

.option-button.selected {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
  color: #ffffff;
}

.option-button.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.3);
  color: #ffffff;
}

.option-button.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.option-button:disabled {
  cursor: not-allowed;
}

.result-section {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(74, 222, 128, 0.2);
  backdrop-filter: blur(5px);
}

.explanation h5,
.learning-objective h5 {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4ade80;
  margin: 0 0 0.8rem 0;
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.3);
}

.explanation p,
.learning-objective p {
  color: #cbd5e1;
  margin: 0 0 1.2rem 0;
  line-height: 1.7;
}

.submit-button,
.next-button {
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  color: #0f172a;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submit-button:hover,
.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
}

.submit-button:disabled {
  background: rgba(107, 114, 128, 0.5);
  cursor: not-allowed;
  color: #6b7280;
}

/* Results Section */
.results-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.score-display h4 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #4ade80, #22d3ee, #a855f7);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.score-display p {
  color: #94a3b8;
  margin: 0 0 3rem 0;
  font-size: 1.1rem;
}

.results-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.next-lesson-button {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.retry-button:hover,
.next-lesson-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.loading-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(74, 222, 128, 0.3);
  border-top: 4px solid #4ade80;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem auto;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4ade80;
  margin: 0;
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
}

.error-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(10px);
}

.error-content {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
  border: 1px solid rgba(239, 68, 68, 0.8);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 450px;
  margin: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.error-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.error-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.error-message {
  font-size: 1.1rem;
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
  opacity: 0.9;
}

.error-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  padding: 1rem 2rem;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.error-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
}

/* Cosmic Background Effects */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 20s linear infinite;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: float linear infinite;
}

.nebula-clouds {
  position: absolute;
  width: 100%;
  height: 100%;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.3;
  animation: drift 30s ease-in-out infinite;
}

.nebula-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.4) 0%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.nebula-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
  top: 40%;
  right: 10%;
  animation-delay: -10s;
}

.nebula-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
  bottom: 20%;
  left: 30%;
  animation-delay: -20s;
}

/* Additional cosmic background gradients */
.english-practice-app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 50%, rgba(74, 222, 128, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
  z-index: 2;
  pointer-events: none;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
  50% { box-shadow: 0 0 40px rgba(74, 222, 128, 0.6); }
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

@keyframes drift {
  0%, 100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }
  33% {
    transform: translateX(30px) translateY(-30px) rotate(120deg);
  }
  66% {
    transform: translateX(-20px) translateY(20px) rotate(240deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.course-card:hover {
  animation: glow 2s ease-in-out infinite;
}

/* Add cosmic pulse to important elements */
.app-header {
  animation: pulse 4s ease-in-out infinite;
}

.practice-button:hover,
.submit-button:hover,
.next-button:hover {
  animation: pulse 0.5s ease-in-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .app-header {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .app-header h1 {
    font-size: 2.5rem;
  }

  .app-header p {
    font-size: 1.1rem;
  }

  .galaxy-map-container {
    position: static;
    text-align: center;
    margin-bottom: 1rem;
  }

  .course-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .course-card {
    padding: 2rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .section-header h2,
  .section-header h3 {
    font-size: 1.8rem;
  }

  .quiz-progress {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .galaxy-map-button {
    margin-left: 0;
    margin-top: 0.5rem;
    width: auto;
  }

  .reading-content,
  .quiz-content,
  .results-content {
    padding: 2rem;
  }

  .reading-text {
    padding: 1.5rem;
    font-size: 1.1rem;
  }

  .results-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .retry-button,
  .next-lesson-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.5rem;
  }

  .app-header h1 {
    font-size: 2rem;
  }

  .course-card,
  .lesson-card {
    padding: 1.5rem;
  }

  .reading-content,
  .quiz-content,
  .results-content {
    padding: 1.5rem;
  }

  .course-info,
  .lesson-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }

  .course-card,
  .lesson-card,
  .option-button,
  .back-button,
  .practice-button,
  .submit-button,
  .next-button,
  .retry-button,
  .next-lesson-button,
  .error-button {
    transition: none;
  }

  .course-card:hover {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .course-card,
  .lesson-card,
  .reading-content,
  .quiz-content,
  .results-content {
    border-width: 2px;
  }

  .option-button {
    border-width: 3px;
  }
}

/* Print styles */
@media print {
  .english-practice-app {
    background: white;
    color: black;
  }

  .back-button,
  .practice-button,
  .submit-button,
  .next-button,
  .retry-button,
  .next-lesson-button {
    display: none;
  }
}
</style>