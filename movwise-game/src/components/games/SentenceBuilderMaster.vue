<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 galaxy-card p-4 mb-6">
      <div class="flex justify-between items-center">
        <button
          @click="handleBackButton"
          class="galaxy-button galaxy-button-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          戻る
        </button>

        <div class="text-center">
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-glow flex items-center gap-3 justify-center">
            <span class="text-4xl">📝</span>
            英作文マスター
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="galaxy-stats-card">
            <span class="text-sm text-galaxy-moon-silver">レベル</span>
            <span class="block text-xl font-bold text-yellow-400 cosmic-glow">{{ currentLevel }}</span>
          </div>
        </div>
      </div>

      <!-- Difficulty Selector -->
      <div class="mt-4 text-center">
        <select
          v-model="selectedDifficulty"
          @change="changeDifficulty"
          class="galaxy-button galaxy-button-secondary text-center border-none bg-transparent"
          style="appearance: none; background-image: none;"
        >
          <option value="beginner">初級（英検5級）</option>
          <option value="elementary">基礎（英検4級）</option>
          <option value="intermediate">中級（英検3級）</option>
          <option value="advanced">上級（英検準2級）</option>
        </select>
      </div>
    </div>

    <!-- Game Stats -->
    <div class="relative z-10 galaxy-card p-4 mb-6" v-if="gameState.started">
      <div class="flex justify-center items-center gap-6">
        <div class="galaxy-stats-card">
          <span class="text-sm text-galaxy-moon-silver">スコア</span>
          <span class="block text-xl font-bold text-yellow-400 cosmic-glow">{{ gameState.score }}</span>
        </div>
        <div class="galaxy-stats-card">
          <span class="text-sm text-galaxy-moon-silver">連続正解</span>
          <span class="block text-xl font-bold text-orange-400 cosmic-glow">{{ gameState.streak }}</span>
        </div>
        <div class="galaxy-stats-card">
          <span class="text-sm text-galaxy-moon-silver">時間</span>
          <span class="block text-xl font-bold text-blue-400 cosmic-glow">{{ formatTime(gameState.timeRemaining) }}</span>
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <div class="relative z-10" v-if="!gameState.started">
      <div class="flex items-center justify-center min-h-[60vh]">
        <div class="galaxy-card p-8 text-center max-w-2xl mx-auto">
          <div class="text-6xl mb-6 cosmic-glow">📝</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-4">英作文の練習をしよう！</h2>
          <p class="text-galaxy-moon-silver mb-8 leading-relaxed">
            単語を正しい順番で並べて英文を完成させてください
          </p>

          <div class="galaxy-card p-6 mb-8 text-left">
            <h3 class="text-xl font-bold text-yellow-400 cosmic-glow mb-3">{{ difficultyInfo.title }}</h3>
            <p class="text-galaxy-moon-silver mb-4">{{ difficultyInfo.description }}</p>
            <ul class="space-y-2 text-galaxy-moon-silver">
              <li v-for="feature in difficultyInfo.features" :key="feature" class="flex items-center gap-2">
                <span class="text-yellow-400">✦</span>
                {{ feature }}
              </li>
            </ul>
          </div>

          <button @click="startGame" class="galaxy-button galaxy-button-primary text-lg px-8 py-4 hover-lift">
            <span>ゲーム開始</span>
            <span class="text-xl">🚀</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Playing Area -->
    <div class="relative z-10" v-else-if="gameState.started && gameState.isPlaying">
      <!-- Current Problem -->
      <div class="galaxy-card p-6 mb-6">
        <div class="text-center mb-4">
          <div class="text-galaxy-moon-silver text-lg mb-2">問題 {{ currentProblemIndex + 1 }} / {{ totalProblems }}</div>
          <div class="w-full bg-gray-600 rounded-full h-3 mb-4">
            <div
              class="energy-gauge h-3 rounded-full transition-all duration-300"
              :style="{ width: ((currentProblemIndex + 1) / totalProblems) * 100 + '%' }"
            ></div>
          </div>
        </div>

        <div class="galaxy-card p-6 mb-6">
          <div class="text-center mb-4">
            <h3 class="text-xl font-bold text-yellow-400 cosmic-glow mb-2">作る文章:</h3>
            <p class="text-2xl text-galaxy-moon-silver">{{ currentProblem?.hint_ja }}</p>
          </div>
        </div>

        <!-- Sentence Building Area -->
        <div class="galaxy-card p-6 mb-6">
          <h4 class="text-lg font-bold text-yellow-400 cosmic-glow mb-4 text-center">英文を作成してください:</h4>
          <div class="flex flex-wrap gap-3 justify-center mb-6">
            <div
              v-for="(zone, index) in dropZones"
              :key="zone.id"
              class="drop-zone galaxy-card p-3 min-w-[120px] min-h-[60px] flex items-center justify-center transition-all duration-300"
              :class="{
                'border-green-400 bg-green-900/30': zone.element && zone.isCorrect,
                'border-blue-400 bg-blue-900/30': zone.isActive,
                'border-red-400 bg-red-900/30': zone.isInvalid,
                'border-gray-400': !zone.element && !zone.isActive && !zone.isInvalid
              }"
              @drop="handleDrop($event, zone.id)"
              @dragover.prevent="handleDragOver($event, zone.id)"
              @dragleave="handleDragLeave(zone.id)"
            >
              <span v-if="!zone.element" class="text-sm text-galaxy-moon-silver text-center">
                {{ getZoneLabel(zone.expectedType) }}
              </span>
              <div v-if="zone.element" class="flex items-center gap-2">
                <span class="text-white font-bold">{{ zone.element.word }}</span>
                <button @click="removeFromZone(zone.id)" class="text-red-400 hover:text-red-300 font-bold">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Words -->
        <div class="galaxy-card p-6 mb-6">
          <h4 class="text-lg font-bold text-yellow-400 cosmic-glow mb-4 text-center">使える単語:</h4>
          <div class="flex flex-wrap gap-3 justify-center">
            <div
              v-for="word in availableWords"
              :key="word.id"
              class="galaxy-button galaxy-button-secondary px-4 py-3 cursor-grab hover-lift"
              :class="{ 'opacity-50 cursor-not-allowed': word.isUsed, 'opacity-70': word.isDragging }"
              :draggable="!word.isUsed"
              @dragstart="handleDragStart($event, word)"
              @dragend="handleDragEnd"
            >
              <div class="text-center">
                <div class="font-bold text-white">{{ word.word }}</div>
                <div class="text-xs text-galaxy-moon-silver">{{ getWordTypeLabel(word.type) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Check Button -->
        <div class="text-center">
          <button
            @click="checkSentence"
            :disabled="!canCheck"
            class="galaxy-button galaxy-button-primary text-lg px-8 py-4 hover-lift"
            :class="{ 'opacity-50 cursor-not-allowed': !canCheck }"
          >
            <span>文をチェック</span>
            <span class="text-xl">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <div v-if="showResult" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="galaxy-card p-8 max-w-md mx-auto text-center">
        <div class="mb-6" :class="lastResult.isCorrect ? 'text-green-400' : 'text-red-400'">
          <span class="text-6xl mb-4 block">{{ lastResult.isCorrect ? '🎉' : '❌' }}</span>
          <h3 class="text-2xl font-bold cosmic-glow">{{ lastResult.isCorrect ? '正解！' : '不正解' }}</h3>
        </div>

        <div class="galaxy-card p-4 mb-6 text-left space-y-2">
          <p><strong class="text-yellow-400">作成した文:</strong> <span class="text-white">{{ lastResult.userSentence }}</span></p>
          <p><strong class="text-yellow-400">正解:</strong> <span class="text-white">{{ lastResult.correctSentence }}</span></p>
          <div v-if="!lastResult.isCorrect" class="galaxy-card p-3 mt-3">
            <p><strong class="text-blue-400">解説:</strong> <span class="text-galaxy-moon-silver">{{ lastResult.explanation }}</span></p>
          </div>
        </div>

        <button @click="nextProblem" class="galaxy-button galaxy-button-primary hover-lift">
          {{ currentProblemIndex >= totalProblems - 1 ? 'ゲーム終了' : '次の問題' }}
        </button>
      </div>
    </div>

    <!-- Game Complete -->
    <div v-if="gameState.completed" class="relative z-10">
      <div class="flex items-center justify-center min-h-[60vh]">
        <div class="galaxy-card p-8 text-center max-w-2xl mx-auto">
          <div class="text-6xl mb-6">🎊</div>
          <h2 class="text-3xl font-bold galaxy-text-primary cosmic-glow mb-6">ゲーム完了！</h2>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="galaxy-stats-card">
              <span class="text-sm text-galaxy-moon-silver">最終スコア</span>
              <span class="block text-2xl font-bold text-yellow-400 cosmic-glow">{{ gameState.score }}</span>
            </div>
            <div class="galaxy-stats-card">
              <span class="text-sm text-galaxy-moon-silver">正解率</span>
              <span class="block text-2xl font-bold text-green-400 cosmic-glow">{{ Math.round((gameState.correctAnswers / totalProblems) * 100) }}%</span>
            </div>
            <div class="galaxy-stats-card">
              <span class="text-sm text-galaxy-moon-silver">最大連続正解</span>
              <span class="block text-2xl font-bold text-orange-400 cosmic-glow">{{ gameState.maxStreak }}</span>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button @click="restartGame" class="galaxy-button galaxy-button-primary hover-lift">
              もう一度プレイ
            </button>
            <button @click="changeDifficultyAndRestart" class="galaxy-button galaxy-button-secondary hover-lift">
              難易度を変更
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

// Game State
const gameState = reactive({
  started: false,
  isPlaying: false,
  completed: false,
  score: 0,
  streak: 0,
  maxStreak: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  timeRemaining: 300, // 5 minutes
  level: 1
})

// Game Settings
const selectedDifficulty = ref('beginner')
const currentLevel = ref(1)
const currentProblemIndex = ref(0)
const totalProblems = ref(10)

// Game Data
const problems = ref([])
const currentProblem = ref(null)
const availableWords = ref([])
const dropZones = ref([])
const draggedWord = ref(null)

// UI State
const showResult = ref(false)
const lastResult = reactive({
  isCorrect: false,
  userSentence: '',
  correctSentence: '',
  explanation: ''
})

// Timer
let gameTimer = null

// Difficulty Settings
const difficultySettings = {
  beginner: {
    title: '初級レベル（英検5級）',
    description: '基本的な主語＋動詞の文から始めます',
    features: [
      '主語 + 動詞（I am, You are）',
      '主語 + 動詞 + 補語（I am happy）',
      '基本語彙のみ使用'
    ],
    maxWords: 3,
    timeLimit: 300
  },
  elementary: {
    title: '基礎レベル（英検4級）',
    description: '目的語を含む基本文型を学習',
    features: [
      '主語 + 動詞 + 目的語（I like apples）',
      '疑問文（Do you like...?）',
      '否定文（I don\'t like...）'
    ],
    maxWords: 4,
    timeLimit: 240
  },
  intermediate: {
    title: '中級レベル（英検3級）',
    description: '修飾語句を含む複雑な文構造',
    features: [
      '主語 + 動詞 + 目的語 + 修飾語',
      '助動詞を使った文（Can you...?）',
      '前置詞句を含む文'
    ],
    maxWords: 5,
    timeLimit: 180
  },
  advanced: {
    title: '上級レベル（英検準2級）',
    description: '複文や関係詞を含む高度な文',
    features: [
      '複文構造',
      '関係代名詞',
      '完了時制'
    ],
    maxWords: 6,
    timeLimit: 120
  }
}

// Problem Data
const problemData = {
  beginner: [
    {
      target: 'I am happy',
      hint_ja: '私は幸せです',
      words: [
        { word: 'I', type: 'pronoun', position: 'subject' },
        { word: 'am', type: 'verb', position: 'verb' },
        { word: 'happy', type: 'adjective', position: 'complement' }
      ]
    },
    {
      target: 'You are a student',
      hint_ja: 'あなたは学生です',
      words: [
        { word: 'You', type: 'pronoun', position: 'subject' },
        { word: 'are', type: 'verb', position: 'verb' },
        { word: 'a', type: 'article', position: 'article' },
        { word: 'student', type: 'noun', position: 'object' }
      ]
    },
    {
      target: 'She is tired',
      hint_ja: '彼女は疲れています',
      words: [
        { word: 'She', type: 'pronoun', position: 'subject' },
        { word: 'is', type: 'verb', position: 'verb' },
        { word: 'tired', type: 'adjective', position: 'complement' }
      ]
    },
    {
      target: 'We are friends',
      hint_ja: '私たちは友達です',
      words: [
        { word: 'We', type: 'pronoun', position: 'subject' },
        { word: 'are', type: 'verb', position: 'verb' },
        { word: 'friends', type: 'noun', position: 'complement' }
      ]
    },
    {
      target: 'It is a book',
      hint_ja: 'それは本です',
      words: [
        { word: 'It', type: 'pronoun', position: 'subject' },
        { word: 'is', type: 'verb', position: 'verb' },
        { word: 'a', type: 'article', position: 'article' },
        { word: 'book', type: 'noun', position: 'object' }
      ]
    }
  ],
  elementary: [
    {
      target: 'I like apples',
      hint_ja: '私はりんごが好きです',
      words: [
        { word: 'I', type: 'pronoun', position: 'subject' },
        { word: 'like', type: 'verb', position: 'verb' },
        { word: 'apples', type: 'noun', position: 'object' }
      ]
    },
    {
      target: 'She reads books',
      hint_ja: '彼女は本を読みます',
      words: [
        { word: 'She', type: 'pronoun', position: 'subject' },
        { word: 'reads', type: 'verb', position: 'verb' },
        { word: 'books', type: 'noun', position: 'object' }
      ]
    },
    {
      target: 'Do you like music?',
      hint_ja: '音楽は好きですか？',
      words: [
        { word: 'Do', type: 'auxiliary', position: 'auxiliary' },
        { word: 'you', type: 'pronoun', position: 'subject' },
        { word: 'like', type: 'verb', position: 'verb' },
        { word: 'music', type: 'noun', position: 'object' },
        { word: '?', type: 'punctuation', position: 'punctuation' }
      ]
    },
    {
      target: 'He plays soccer',
      hint_ja: '彼はサッカーをします',
      words: [
        { word: 'He', type: 'pronoun', position: 'subject' },
        { word: 'plays', type: 'verb', position: 'verb' },
        { word: 'soccer', type: 'noun', position: 'object' }
      ]
    },
    {
      target: 'We eat lunch',
      hint_ja: '私たちは昼食を食べます',
      words: [
        { word: 'We', type: 'pronoun', position: 'subject' },
        { word: 'eat', type: 'verb', position: 'verb' },
        { word: 'lunch', type: 'noun', position: 'object' }
      ]
    }
  ],
  intermediate: [
    {
      target: 'Can you swim well?',
      hint_ja: '上手に泳げますか？',
      words: [
        { word: 'Can', type: 'modal', position: 'auxiliary' },
        { word: 'you', type: 'pronoun', position: 'subject' },
        { word: 'swim', type: 'verb', position: 'verb' },
        { word: 'well', type: 'adverb', position: 'modifier' },
        { word: '?', type: 'punctuation', position: 'punctuation' }
      ]
    },
    {
      target: 'I study English every day',
      hint_ja: '私は毎日英語を勉強します',
      words: [
        { word: 'I', type: 'pronoun', position: 'subject' },
        { word: 'study', type: 'verb', position: 'verb' },
        { word: 'English', type: 'noun', position: 'object' },
        { word: 'every', type: 'adjective', position: 'modifier' },
        { word: 'day', type: 'noun', position: 'modifier' }
      ]
    },
    {
      target: 'She lives in Tokyo',
      hint_ja: '彼女は東京に住んでいます',
      words: [
        { word: 'She', type: 'pronoun', position: 'subject' },
        { word: 'lives', type: 'verb', position: 'verb' },
        { word: 'in', type: 'preposition', position: 'preposition' },
        { word: 'Tokyo', type: 'noun', position: 'object' }
      ]
    }
  ],
  advanced: [
    {
      target: 'I have been studying English for three years',
      hint_ja: '私は3年間英語を勉強しています',
      words: [
        { word: 'I', type: 'pronoun', position: 'subject' },
        { word: 'have', type: 'auxiliary', position: 'auxiliary' },
        { word: 'been', type: 'auxiliary', position: 'auxiliary2' },
        { word: 'studying', type: 'verb', position: 'verb' },
        { word: 'English', type: 'noun', position: 'object' },
        { word: 'for', type: 'preposition', position: 'preposition' },
        { word: 'three', type: 'number', position: 'modifier' },
        { word: 'years', type: 'noun', position: 'object2' }
      ]
    }
  ]
}

// Computed Properties
const difficultyInfo = computed(() => difficultySettings[selectedDifficulty.value])

const canCheck = computed(() => {
  return dropZones.value.every(zone => zone.element !== null)
})

// Utility Functions
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getZoneLabel = (type) => {
  const labels = {
    subject: '主語',
    auxiliary: '助動詞',
    auxiliary2: '助動詞2',
    verb: '動詞',
    object: '目的語',
    object2: '目的語2',
    complement: '補語',
    article: '冠詞',
    preposition: '前置詞',
    modifier: '修飾語',
    punctuation: '句読点'
  }
  return labels[type] || type
}

const getWordTypeLabel = (type) => {
  const labels = {
    pronoun: '代名詞',
    verb: '動詞',
    noun: '名詞',
    adjective: '形容詞',
    adverb: '副詞',
    article: '冠詞',
    preposition: '前置詞',
    auxiliary: '助動詞',
    modal: '助動詞',
    number: '数詞',
    punctuation: '句読点'
  }
  return labels[type] || type
}

// Game Functions
const startGame = () => {
  console.log('🎮 英作文マスター開始!')

  gameState.started = true
  gameState.isPlaying = true
  gameState.completed = false
  gameState.score = 0
  gameState.streak = 0
  gameState.maxStreak = 0
  gameState.correctAnswers = 0
  gameState.totalAnswers = 0
  gameState.timeRemaining = difficultySettings[selectedDifficulty.value].timeLimit

  loadProblems()
  setupCurrentProblem()
  startTimer()
}

const loadProblems = () => {
  const difficultyProblems = problemData[selectedDifficulty.value]
  problems.value = [...difficultyProblems]
  totalProblems.value = problems.value.length
  currentProblemIndex.value = 0

  console.log(`📚 問題読み込み完了: ${problems.value.length}問`)
}

const setupCurrentProblem = () => {
  if (currentProblemIndex.value >= problems.value.length) {
    endGame()
    return
  }

  currentProblem.value = problems.value[currentProblemIndex.value]

  // Setup drop zones based on word positions
  const uniquePositions = [...new Set(currentProblem.value.words.map(w => w.position))]
  dropZones.value = uniquePositions.map((position, index) => ({
    id: `zone-${index}`,
    expectedType: position,
    element: null,
    isCorrect: false,
    isActive: false,
    isInvalid: false
  }))

  // Setup available words
  availableWords.value = currentProblem.value.words.map((word, index) => ({
    id: `word-${index}`,
    ...word,
    isUsed: false,
    isDragging: false
  }))

  // Shuffle available words for better gameplay
  shuffleArray(availableWords.value)

  console.log('🔄 問題設定完了:', currentProblem.value.target)
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

const startTimer = () => {
  if (gameTimer) clearInterval(gameTimer)

  gameTimer = setInterval(() => {
    gameState.timeRemaining--
    if (gameState.timeRemaining <= 0) {
      endGame()
    }
  }, 1000)
}

const changeDifficulty = () => {
  if (gameState.started) {
    gameState.started = false
    gameState.isPlaying = false
  }
  currentLevel.value = 1
}

// Drag and Drop Functions
const handleDragStart = (event, word) => {
  if (word.isUsed) return

  draggedWord.value = word
  word.isDragging = true

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', word.id)
}

const handleDragEnd = () => {
  if (draggedWord.value) {
    draggedWord.value.isDragging = false
    draggedWord.value = null
  }

  // Reset all zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isInvalid = false
  })
}

const handleDragOver = (event, zoneId) => {
  event.preventDefault()

  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone && !zone.element) {
    zone.isActive = true

    if (draggedWord.value) {
      const isValidDrop = draggedWord.value.position === zone.expectedType
      zone.isInvalid = !isValidDrop
    }
  }
}

const handleDragLeave = (zoneId) => {
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone) {
    zone.isActive = false
    zone.isInvalid = false
  }
}

const handleDrop = (event, zoneId) => {
  event.preventDefault()

  const zone = dropZones.value.find(z => z.id === zoneId)
  const wordId = event.dataTransfer.getData('text/plain')
  const word = availableWords.value.find(w => w.id === wordId)

  if (!zone || !word || zone.element || word.isUsed) return

  // Check if drop is valid
  if (word.position === zone.expectedType) {
    zone.element = word
    word.isUsed = true
    zone.isActive = false
    zone.isInvalid = false

    console.log('✅ 単語配置成功:', word.word, '→', zone.expectedType)
  } else {
    zone.isActive = false
    zone.isInvalid = false
    console.log('❌ 無効な配置:', word.word, '→', zone.expectedType)
  }

  handleDragEnd()
}

const removeFromZone = (zoneId) => {
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone && zone.element) {
    const word = availableWords.value.find(w => w.id === zone.element.id)
    if (word) {
      word.isUsed = false
    }
    zone.element = null
    zone.isCorrect = false
  }
}

// Game Logic
const checkSentence = () => {
  if (!canCheck.value) return

  // Build user sentence from drop zones
  const sortedZones = [...dropZones.value].sort((a, b) => {
    const positions = ['auxiliary', 'auxiliary2', 'subject', 'verb', 'article', 'object', 'preposition', 'modifier', 'object2', 'complement', 'punctuation']
    return positions.indexOf(a.expectedType) - positions.indexOf(b.expectedType)
  })

  const userSentence = sortedZones.map(zone => zone.element?.word || '').join(' ').trim()
  const correctSentence = currentProblem.value.target

  const isCorrect = userSentence.toLowerCase() === correctSentence.toLowerCase()

  // Update game state
  gameState.totalAnswers++
  if (isCorrect) {
    gameState.correctAnswers++
    gameState.score += 10 + (gameState.streak * 2)
    gameState.streak++
    gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak)
  } else {
    gameState.streak = 0
  }

  // Show result
  lastResult.isCorrect = isCorrect
  lastResult.userSentence = userSentence
  lastResult.correctSentence = correctSentence
  lastResult.explanation = isCorrect ? '完璧です！' : '単語の順序を確認してください。'

  showResult.value = true

  console.log(`${isCorrect ? '✅ 正解' : '❌ 不正解'}:`, userSentence)
}

const nextProblem = () => {
  showResult.value = false
  currentProblemIndex.value++

  if (currentProblemIndex.value >= problems.value.length) {
    endGame()
  } else {
    setupCurrentProblem()
  }
}

const endGame = () => {
  gameState.isPlaying = false
  gameState.completed = true

  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }

  console.log('🏁 ゲーム終了!')
}

const restartGame = () => {
  showResult.value = false
  startGame()
}

const changeDifficultyAndRestart = () => {
  showResult.value = false
  gameState.started = false
  gameState.isPlaying = false
  gameState.completed = false
}

// Navigate to hub function
const navigateToHub = async () => {
  try {
    console.log('🚀 Navigating back to Grammar Galaxy...')
    await router.push('/platforms/grammar-galaxy')
    console.log('✅ Navigation successful')
  } catch (error) {
    console.error('❌ Navigation failed:', error)
    // Force page reload as fallback
    window.location.href = '/platforms/grammar-galaxy'
  }
}

// Back button functionality
const handleBackButton = () => {
  console.log('🔙 Back button clicked')

  try {
    // Stop timer if running
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }

    // Check if game is in progress
    if (gameState.started && gameState.isPlaying) {
      if (confirm('ゲームを中断して戻りますか？')) {
        navigateToHub()
      }
    } else {
      navigateToHub()
    }
  } catch (error) {
    console.error('❌ Error in handleBackButton:', error)
    // Direct fallback
    router.push('/platforms/grammar-galaxy')
  }
}

// Lifecycle
onMounted(() => {
  console.log('📝 英作文マスター初期化完了')
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
</script>

<style>
/* Import Galaxy Theme CSS */
@import url('@/assets/css/galaxy-theme.css');

/* Custom drop zone styles */
.drop-zone {
  border: 2px dashed rgba(148, 163, 184, 0.3);
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: rgba(99, 102, 241, 0.4);
}

/* Custom select styling for better galaxy theme integration */
select.galaxy-button option {
  background: #1e293b;
  color: white;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .flex-wrap {
    gap: 0.5rem;
  }

  .galaxy-card {
    padding: 1rem;
  }

  .min-w-\[120px\] {
    min-width: 80px;
  }
}
</style>