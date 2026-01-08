<template>
  <div class="handwriting-dictation min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-4">
      <div class="flex items-center justify-between">
        <button
          @click="handleBack"
          class="px-4 py-2 bg-purple-600/80 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          ← 戻る
        </button>

        <h1 class="text-3xl font-bold text-white">
          ✍️ 手書きディクテーション
        </h1>

        <div class="flex items-center gap-4">
          <!-- Spectator Mode Indicator -->
          <div v-if="isSpectatorMode" class="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span class="text-blue-400 text-sm">観戦中</span>
          </div>

          <!-- Score -->
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-400">⭐ {{ score }}</div>
            <div class="text-xs text-gray-400">スコア</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Left Panel: Question & Controls -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Question Card -->
        <div class="bg-slate-800/90 backdrop-blur rounded-xl p-6 border border-purple-500/30">
          <h2 class="text-lg font-semibold text-white mb-4">問題 {{ currentQuestion + 1 }}/{{ questions.length }}</h2>

          <!-- Audio Controls -->
          <div class="space-y-4">
            <button
              @click="playAudio"
              :disabled="isPlaying"
              class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              {{ isPlaying ? '🔊 再生中...' : '🎧 音声を聞く' }}
            </button>

            <div class="flex gap-2">
              <button
                @click="playAudio"
                class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                🔁 もう一度
              </button>
              <button
                @click="playSlowAudio"
                class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
              >
                🐢 ゆっくり
              </button>
            </div>
          </div>

          <!-- Current Word Info (for teacher/debugging) -->
          <div v-if="showAnswer || isTeacherView" class="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p class="text-green-400 font-bold">答え: {{ getCurrentWord() }}</p>
          </div>

          <!-- Hint System -->
          <div class="mt-4 space-y-2">
            <button
              @click="showHint"
              :disabled="hintLevel >= 3"
              class="w-full py-2 bg-yellow-600/80 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm"
            >
              💡 ヒント ({{ hintLevel }}/3)
            </button>

            <div v-if="hintLevel > 0" class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p v-if="hintLevel >= 1" class="text-yellow-400 text-sm">文字数: {{ getCurrentWord().length }}文字</p>
              <p v-if="hintLevel >= 2" class="text-yellow-400 text-sm">最初の文字: {{ getCurrentWord()[0] }}</p>
              <p v-if="hintLevel >= 3" class="text-yellow-400 text-sm">最後の文字: {{ getCurrentWord().slice(-1) }}</p>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-purple-500/30">
          <h3 class="text-sm font-semibold text-white mb-2">進捗</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">完了</span>
              <span class="text-white">{{ currentQuestion }}/{{ questions.length }}</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                :style="{ width: `${(currentQuestion / questions.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Panel: Canvas -->
      <div class="lg:col-span-2">
        <div class="bg-slate-800/90 backdrop-blur rounded-xl p-6 border border-purple-500/30 h-full">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">手書きエリア</h2>
            <div class="flex gap-2">
              <button
                @click="clearCanvas"
                class="px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                🗑️ クリア
              </button>
              <button
                @click="undoStroke"
                :disabled="strokes.length === 0"
                class="px-3 py-1 bg-blue-600/80 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm"
              >
                ↩️ 戻す
              </button>
            </div>
          </div>

          <!-- Canvas Container -->
          <div class="relative bg-white rounded-lg overflow-hidden" style="padding-bottom: 56.25%;">
            <canvas
              ref="canvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              class="absolute inset-0 w-full h-full cursor-crosshair"
              :class="{ 'pointer-events-none': isTeacherView }"
            ></canvas>

            <!-- Guide Lines -->
            <div class="absolute inset-0 pointer-events-none">
              <div class="h-full flex flex-col justify-between">
                <div class="border-b-2 border-gray-300 border-dashed" style="height: 33.33%;"></div>
                <div class="border-b-2 border-gray-300 border-dashed" style="height: 33.33%;"></div>
                <div style="height: 33.33%;"></div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex gap-3">
            <button
              @click="checkAnswer"
              class="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              ✅ 答え合わせ
            </button>
            <button
              @click="skipQuestion"
              class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold"
            >
              ⏭️ スキップ
            </button>
          </div>

          <!-- Feedback -->
          <div v-if="feedback" class="mt-4">
            <div
              class="p-4 rounded-lg"
              :class="{
                'bg-green-500/20 border border-green-500/30': feedback.correct,
                'bg-red-500/20 border border-red-500/30': !feedback.correct
              }"
            >
              <p class="font-bold" :class="feedback.correct ? 'text-green-400' : 'text-red-400'">
                {{ feedback.message }}
              </p>
              <p v-if="!feedback.correct" class="text-gray-300 text-sm mt-1">
                正解: {{ getCurrentWord() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Teacher View: Student List (if in spectator mode) -->
    <div v-if="isTeacherView && connectedStudents.length > 0" class="max-w-6xl mx-auto mt-4">
      <div class="bg-slate-800/90 backdrop-blur rounded-xl p-4 border border-purple-500/30">
        <h3 class="text-lg font-semibold text-white mb-3">生徒の回答状況</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="student in connectedStudents"
            :key="student.id"
            @click="selectStudent(student)"
            class="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors"
            :class="{ 'ring-2 ring-blue-500': selectedStudent?.id === student.id }"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xl">{{ student.avatar || '👤' }}</span>
              <span class="text-white font-medium">{{ student.name }}</span>
            </div>
            <div class="text-xs text-gray-400">
              問題 {{ student.currentQuestion || 1 }}/{{ questions.length }}
            </div>
            <div v-if="student.isWriting" class="text-xs text-yellow-400 mt-1">
              ✍️ 書き込み中...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSpectatorStore } from '@/stores/spectatorStore'
import spectatorService from '@/services/spectatorService'
import logger from '@/utils/logger'

const router = useRouter()
const route = useRoute()
const spectatorStore = useSpectatorStore()

// Canvas refs
const canvas = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)
const strokes = ref([])
const currentStroke = ref([])

// Game state
const score = ref(0)
const currentQuestion = ref(0)
const hintLevel = ref(0)
const showAnswer = ref(false)
const feedback = ref(null)
const isPlaying = ref(false)

// Questions data
const questions = ref([
  { word: 'cat', audio: 'cat.mp3', level: 1 },
  { word: 'dog', audio: 'dog.mp3', level: 1 },
  { word: 'book', audio: 'book.mp3', level: 1 },
  { word: 'house', audio: 'house.mp3', level: 2 },
  { word: 'school', audio: 'school.mp3', level: 2 },
  { word: 'computer', audio: 'computer.mp3', level: 3 },
])

// Spectator mode
const isSpectatorMode = computed(() => spectatorStore.isConnected)
const isTeacherView = computed(() => spectatorStore.isTeacher)
const connectedStudents = computed(() => spectatorStore.participants.filter(p => p.role === 'student'))
const selectedStudent = ref(null)

// Initialize canvas
onMounted(() => {
  initCanvas()

  // Connect to spectator service if room code exists
  if (route.query.roomCode) {
    connectToSpectatorMode()
  }
})

// Canvas initialization
function initCanvas() {
  if (!canvas.value) return

  ctx.value = canvas.value.getContext('2d')

  // Set canvas size
  const rect = canvas.value.getBoundingClientRect()
  canvas.value.width = rect.width
  canvas.value.height = rect.height

  // Set drawing style
  ctx.value.lineWidth = 3
  ctx.value.lineCap = 'round'
  ctx.value.strokeStyle = '#333'
}

// Drawing functions
function startDrawing(e) {
  if (isTeacherView.value) return

  isDrawing.value = true
  currentStroke.value = []

  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  currentStroke.value.push({ x, y })
  ctx.value.beginPath()
  ctx.value.moveTo(x, y)

  // Sync with spectator
  syncDrawingState()
}

function draw(e) {
  if (!isDrawing.value || isTeacherView.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  currentStroke.value.push({ x, y })
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  // Throttled sync
  syncDrawingState()
}

function stopDrawing() {
  if (!isDrawing.value) return

  isDrawing.value = false
  if (currentStroke.value.length > 0) {
    strokes.value.push([...currentStroke.value])
    currentStroke.value = []
  }

  syncDrawingState()
}

// Touch event handlers
function handleTouchStart(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvas.value.dispatchEvent(mouseEvent)
}

function handleTouchMove(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  canvas.value.dispatchEvent(mouseEvent)
}

function handleTouchEnd(e) {
  e.preventDefault()
  const mouseEvent = new MouseEvent('mouseup', {})
  canvas.value.dispatchEvent(mouseEvent)
}

// Canvas actions
function clearCanvas() {
  if (!ctx.value) return

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  strokes.value = []
  currentStroke.value = []
  feedback.value = null

  syncDrawingState()
}

function undoStroke() {
  if (strokes.value.length === 0) return

  strokes.value.pop()
  redrawCanvas()

  syncDrawingState()
}

function redrawCanvas() {
  if (!ctx.value) return

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)

  strokes.value.forEach(stroke => {
    if (stroke.length === 0) return

    ctx.value.beginPath()
    ctx.value.moveTo(stroke[0].x, stroke[0].y)

    for (let i = 1; i < stroke.length; i++) {
      ctx.value.lineTo(stroke[i].x, stroke[i].y)
    }

    ctx.value.stroke()
  })
}

// Game functions
function getCurrentWord() {
  return questions.value[currentQuestion.value]?.word || ''
}

function playAudio() {
  isPlaying.value = true

  // Simulate audio playback
  setTimeout(() => {
    isPlaying.value = false
  }, 2000)

  // Use TTS or audio file
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(getCurrentWord())
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    speechSynthesis.speak(utterance)
  }
}

function playSlowAudio() {
  isPlaying.value = true

  setTimeout(() => {
    isPlaying.value = false
  }, 3000)

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(getCurrentWord())
    utterance.lang = 'en-US'
    utterance.rate = 0.6
    speechSynthesis.speak(utterance)
  }
}

function showHint() {
  if (hintLevel.value < 3) {
    hintLevel.value++
    score.value = Math.max(0, score.value - 5)
  }
}

function checkAnswer() {
  // This is a simplified check - in production, you'd use OCR or ML
  // For demo purposes, we'll just check if something was drawn
  const hasDrawing = strokes.value.length > 0

  if (hasDrawing) {
    feedback.value = {
      correct: true,
      message: '正解！よくできました！'
    }
    score.value += 10

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  } else {
    feedback.value = {
      correct: false,
      message: '何か書いてください'
    }
  }

  syncGameState()
}

function skipQuestion() {
  nextQuestion()
}

function nextQuestion() {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
    clearCanvas()
    hintLevel.value = 0
    feedback.value = null
    showAnswer.value = false
  } else {
    // Game complete
    alert(`ゲーム終了！\nスコア: ${score.value}`)
    handleBack()
  }

  syncGameState()
}

// Spectator functions
function connectToSpectatorMode() {
  const roomCode = route.query.roomCode
  const role = route.query.role || 'student'

  spectatorService.connect()
    .then(() => {
      if (role === 'teacher') {
        spectatorStore.setAsTeacher()
      }

      return spectatorService.joinRoom(roomCode, {
        name: route.query.name || 'User',
        role: role
      })
    })
    .then(() => {
      logger.log('Connected to spectator mode')
    })
    .catch(error => {
      logger.error('Failed to connect to spectator mode:', error)
    })
}

function syncDrawingState() {
  if (!isSpectatorMode.value || isTeacherView.value) return

  // Send drawing state to server
  spectatorService.syncGameState({
    gameType: 'handwriting-dictation',
    strokes: strokes.value,
    currentStroke: currentStroke.value,
    isWriting: isDrawing.value,
    currentQuestion: currentQuestion.value,
    score: score.value
  })
}

function syncGameState() {
  if (!isSpectatorMode.value || isTeacherView.value) return

  spectatorService.syncGameState({
    gameType: 'handwriting-dictation',
    currentQuestion: currentQuestion.value,
    score: score.value,
    feedback: feedback.value
  })
}

function selectStudent(student) {
  selectedStudent.value = student

  // Request to view specific student's canvas
  spectatorService.selectStudent(student.id)
}

// Listen for student canvas updates (teacher only)
if (isTeacherView.value) {
  spectatorService.onStudentCanvasUpdate((data) => {
    if (selectedStudent.value && data.studentId === selectedStudent.value.id) {
      // Update canvas with student's drawing
      strokes.value = data.strokes || []
      redrawCanvas()
    }
  })
}

function handleBack() {
  if (isSpectatorMode.value) {
    spectatorService.disconnect()
  }
  router.push('/')
}

// Cleanup
onUnmounted(() => {
  if (isSpectatorMode.value) {
    spectatorService.disconnect()
  }
})
</script>

<style scoped>
canvas {
  touch-action: none;
}
</style>