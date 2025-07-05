<!-- Interactive Phoneme Training Component -->
<template>
  <div class="phoneme-trainer">
    <!-- Header -->
    <div class="trainer-header">
      <h3 class="trainer-title">{{ currentPhoneme?.symbol }} 発音練習</h3>
      <div class="progress-indicator">
        <span class="current-step">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total-steps">{{ phonemes.length }}</span>
      </div>
    </div>

    <!-- Current Phoneme Display -->
    <div v-if="currentPhoneme" class="phoneme-display">
      <div class="phoneme-card" :class="currentPhoneme.group">
        <!-- IPA Symbol -->
        <div class="ipa-symbol">{{ currentPhoneme.symbol }}</div>
        
        <!-- Description -->
        <div class="phoneme-description">
          <h4>{{ currentPhoneme.description }}</h4>
          <div class="difficulty-badge" :class="getDifficultyClass(currentPhoneme.difficulty)">
            難易度: {{ getDifficultyLabel(currentPhoneme.difficulty) }}
          </div>
        </div>

        <!-- Play Controls -->
        <div class="play-controls">
          <button 
            @click="playCurrentPhoneme"
            :disabled="isPlaying"
            class="play-button primary"
          >
            <Volume2Icon v-if="!isPlaying" class="w-5 h-5" />
            <Loader2Icon v-else class="w-5 h-5 animate-spin" />
            <span>音素を聞く</span>
          </button>
          
          <button 
            @click="playExampleWord"
            :disabled="isPlaying || !currentPhoneme.examples?.length"
            class="play-button secondary"
          >
            <PlayIcon class="w-4 h-4" />
            <span>例語を聞く</span>
          </button>
        </div>
      </div>

      <!-- Learning Tips -->
      <div class="learning-tips">
        <div class="tip-section" v-if="currentPhoneme.nativeTips">
          <h5 class="tip-title">
            <LightbulbIcon class="w-4 h-4" />
            ネイティブのコツ
          </h5>
          <p class="tip-content">{{ currentPhoneme.nativeTips }}</p>
        </div>

        <div class="tip-section error-tips" v-if="currentPhoneme.commonErrors">
          <h5 class="tip-title">
            <AlertTriangleIcon class="w-4 h-4" />
            よくある間違い
          </h5>
          <p class="tip-content">{{ currentPhoneme.commonErrors }}</p>
        </div>

        <div class="tip-section" v-if="currentPhoneme.articulationGuide">
          <h5 class="tip-title">
            <InfoIcon class="w-4 h-4" />
            調音ガイド
          </h5>
          <p class="tip-content">{{ currentPhoneme.articulationGuide }}</p>
        </div>
      </div>

      <!-- Example Words -->
      <div v-if="currentPhoneme.examples?.length" class="example-words">
        <h5 class="examples-title">例語</h5>
        <div class="words-grid">
          <button 
            v-for="(word, index) in currentPhoneme.examples"
            :key="index"
            @click="playExampleWord(word)"
            class="word-chip"
            :disabled="isPlaying"
          >
            <span class="word-text">{{ word }}</span>
            <Volume2Icon class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Practice Words (for confusing sounds) -->
      <div v-if="currentPhoneme.practiceWords?.length" class="practice-section">
        <h5 class="practice-title">
          <TargetIcon class="w-4 h-4" />
          練習ペア
        </h5>
        <div class="practice-grid">
          <div 
            v-for="(pair, index) in currentPhoneme.practiceWords"
            :key="index"
            class="practice-pair"
          >
            <span class="pair-text">{{ pair }}</span>
            <button 
              @click="playPracticePhrase(pair)"
              class="pair-play-button"
              :disabled="isPlaying"
            >
              <PlayIcon class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation">
      <button 
        @click="previousPhoneme"
        :disabled="currentIndex === 0"
        class="nav-button"
      >
        <ChevronLeftIcon class="w-4 h-4" />
        前の音素
      </button>

      <div class="mastery-indicator">
        <div class="mastery-progress">
          <div 
            class="mastery-bar"
            :style="{ width: `${masteryProgress}%` }"
          ></div>
        </div>
        <span class="mastery-text">習得度: {{ Math.round(masteryProgress) }}%</span>
      </div>

      <button 
        @click="nextPhoneme"
        :disabled="currentIndex === phonemes.length - 1"
        class="nav-button"
      >
        次の音素
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Quick Phoneme Selector -->
    <div v-if="showPhonemeGrid" class="phoneme-grid">
      <button 
        v-for="(phoneme, index) in phonemes"
        :key="index"
        @click="selectPhoneme(index)"
        class="phoneme-grid-item"
        :class="{ 
          active: index === currentIndex,
          mastered: isPhonemastered(phoneme)
        }"
      >
        {{ phoneme.symbol }}
      </button>
    </div>

    <!-- Toggle Grid Visibility -->
    <div class="grid-toggle">
      <button 
        @click="showPhonemeGrid = !showPhonemeGrid"
        class="toggle-button"
      >
        <GridIcon class="w-4 h-4" />
        {{ showPhonemeGrid ? '音素グリッドを隠す' : '音素グリッドを表示' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Volume2Icon, Loader2Icon, PlayIcon, ChevronLeftIcon, ChevronRightIcon,
  LightbulbIcon, AlertTriangleIcon, InfoIcon, TargetIcon, GridIcon
} from 'lucide-vue-next'
import { useGameAudio } from '@/composables/useGameAudio'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database'

// Props
const props = defineProps({
  stage: {
    type: String,
    default: 'stage1A' // Which stage of phonemes to practice
  },
  autoAdvance: {
    type: Boolean,
    default: false // Automatically advance to next phoneme after mastery
  }
})

// Emits
const emit = defineEmits([
  'phoneme-practiced',
  'stage-completed',
  'mastery-achieved'
])

// Native Audio System
const {
  playPhoneme: playNativePhoneme,
  playWord: playNativeWord,
  speakSentence: speakNativeSentence
} = useGameAudio()

// State
const currentIndex = ref(0)
const isPlaying = ref(false)
const showPhonemeGrid = ref(false)
const masteryScores = ref(new Map()) // Track mastery for each phoneme

// Computed
const phonemes = computed(() => {
  return NATIVE_PHONEME_PROGRESSION[props.stage] || []
})

const currentPhoneme = computed(() => {
  return phonemes.value[currentIndex.value]
})

const masteryProgress = computed(() => {
  if (!currentPhoneme.value) return 0
  const score = masteryScores.value.get(currentPhoneme.value.symbol) || 0
  return Math.min(100, (score / (currentPhoneme.value.masteryThreshold || 0.85)) * 100)
})

// Methods
const playCurrentPhoneme = async () => {
  if (!currentPhoneme.value || isPlaying.value) return

  isPlaying.value = true
  try {
    await playNativePhoneme(currentPhoneme.value.symbol)
    recordPractice()
  } catch (error) {
    console.warn('Phoneme playback error:', error)
  } finally {
    isPlaying.value = false
  }
}

const playExampleWord = async (word = null) => {
  if (isPlaying.value) return

  const targetWord = word || currentPhoneme.value?.examples?.[0]
  if (!targetWord) return

  isPlaying.value = true
  try {
    await playNativeWord({
      word: targetWord,
      type: 'phoneme_example',
      difficulty: 'normal'
    })
  } catch (error) {
    console.warn('Example word playback error:', error)
  } finally {
    isPlaying.value = false
  }
}

const playPracticePhrase = async (phrase) => {
  if (isPlaying.value) return

  isPlaying.value = true
  try {
    await speakNativeSentence(phrase)
  } catch (error) {
    console.warn('Practice phrase playback error:', error)
  } finally {
    isPlaying.value = false
  }
}

const recordPractice = () => {
  if (!currentPhoneme.value) return

  const symbol = currentPhoneme.value.symbol
  const currentScore = masteryScores.value.get(symbol) || 0
  const newScore = Math.min(1.0, currentScore + 0.1) // Increase by 10% each practice

  masteryScores.value.set(symbol, newScore)
  
  emit('phoneme-practiced', {
    phoneme: currentPhoneme.value,
    masteryScore: newScore
  })

  // Check for mastery achievement
  const threshold = currentPhoneme.value.masteryThreshold || 0.85
  if (newScore >= threshold && currentScore < threshold) {
    emit('mastery-achieved', currentPhoneme.value)
    
    if (props.autoAdvance && currentIndex.value < phonemes.value.length - 1) {
      setTimeout(() => {
        nextPhoneme()
      }, 2000)
    }
  }
}

const previousPhoneme = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextPhoneme = () => {
  if (currentIndex.value < phonemes.value.length - 1) {
    currentIndex.value++
  } else {
    // Stage completed
    emit('stage-completed', props.stage)
  }
}

const selectPhoneme = (index) => {
  currentIndex.value = index
}

const isPhonemastered = (phoneme) => {
  const score = masteryScores.value.get(phoneme.symbol) || 0
  return score >= (phoneme.masteryThreshold || 0.85)
}

const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case 1: return 'difficulty-easy'
    case 2: return 'difficulty-normal'  
    case 3: return 'difficulty-medium'
    case 4: return 'difficulty-hard'
    case 5: return 'difficulty-extreme'
    default: return 'difficulty-normal'
  }
}

const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 1: return '易しい'
    case 2: return '普通'
    case 3: return '中級'
    case 4: return '難しい'
    case 5: return '非常に難しい'
    default: return '普通'
  }
}

// Lifecycle
onMounted(() => {
  // Load saved mastery scores from localStorage
  const saved = localStorage.getItem(`phoneme-mastery-${props.stage}`)
  if (saved) {
    try {
      const scores = JSON.parse(saved)
      masteryScores.value = new Map(Object.entries(scores))
    } catch (error) {
      console.warn('Failed to load mastery scores:', error)
    }
  }
})

// Save mastery scores when they change
watch(masteryScores, (newScores) => {
  const scoresObj = Object.fromEntries(newScores)
  localStorage.setItem(`phoneme-mastery-${props.stage}`, JSON.stringify(scoresObj))
}, { deep: true })
</script>

<style scoped>
.phoneme-trainer {
  @apply max-w-4xl mx-auto p-6 space-y-6;
}

.trainer-header {
  @apply flex items-center justify-between;
}

.trainer-title {
  @apply text-2xl font-bold text-gray-800;
}

.progress-indicator {
  @apply flex items-center gap-1 text-sm text-gray-600;
}

.phoneme-display {
  @apply space-y-6;
}

.phoneme-card {
  @apply bg-white rounded-xl shadow-lg p-6 border-l-4;
}

.phoneme-card.short_vowels { @apply border-red-500; }
.phoneme-card.long_vowels { @apply border-blue-500; }
.phoneme-card.plosives { @apply border-green-500; }
.phoneme-card.fricatives { @apply border-yellow-500; }
.phoneme-card.liquids { @apply border-cyan-500; }
.phoneme-card.nasals { @apply border-purple-500; }
.phoneme-card.glides { @apply border-indigo-500; }

.ipa-symbol {
  @apply text-4xl font-mono text-center text-gray-800 mb-4;
}

.phoneme-description {
  @apply text-center mb-4;
}

.phoneme-description h4 {
  @apply text-lg font-semibold text-gray-700 mb-2;
}

.difficulty-badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
}

.difficulty-easy { @apply bg-green-100 text-green-800; }
.difficulty-normal { @apply bg-blue-100 text-blue-800; }
.difficulty-medium { @apply bg-yellow-100 text-yellow-800; }
.difficulty-hard { @apply bg-orange-100 text-orange-800; }
.difficulty-extreme { @apply bg-red-100 text-red-800; }

.play-controls {
  @apply flex justify-center gap-4;
}

.play-button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.play-button.primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400;
}

.play-button.secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400;
}

.play-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.learning-tips {
  @apply space-y-4;
}

.tip-section {
  @apply bg-gray-50 rounded-lg p-4;
}

.tip-section.error-tips {
  @apply bg-orange-50;
}

.tip-title {
  @apply flex items-center gap-2 font-semibold text-gray-800 mb-2;
}

.tip-content {
  @apply text-gray-700 leading-relaxed;
}

.example-words {
  @apply space-y-3;
}

.examples-title {
  @apply font-semibold text-gray-800;
}

.words-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2;
}

.word-chip {
  @apply flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-lg transition-colors;
}

.word-chip:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.practice-section {
  @apply space-y-3;
}

.practice-title {
  @apply flex items-center gap-2 font-semibold text-gray-800;
}

.practice-grid {
  @apply space-y-2;
}

.practice-pair {
  @apply flex items-center justify-between bg-purple-50 px-4 py-2 rounded-lg;
}

.pair-play-button {
  @apply p-1 hover:bg-purple-200 rounded transition-colors;
}

.navigation {
  @apply flex items-center justify-between;
}

.nav-button {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors;
}

.nav-button:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-gray-100;
}

.mastery-indicator {
  @apply text-center;
}

.mastery-progress {
  @apply w-32 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.mastery-bar {
  @apply h-full bg-green-500 transition-all duration-300;
}

.mastery-text {
  @apply text-sm text-gray-600 mt-1;
}

.phoneme-grid {
  @apply grid grid-cols-8 md:grid-cols-12 gap-2 p-4 bg-gray-50 rounded-lg;
}

.phoneme-grid-item {
  @apply w-10 h-10 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg font-mono text-sm transition-colors;
}

.phoneme-grid-item.active {
  @apply bg-blue-500 text-white border-blue-500;
}

.phoneme-grid-item.mastered {
  @apply bg-green-100 border-green-300;
}

.grid-toggle {
  @apply text-center;
}

.toggle-button {
  @apply flex items-center gap-2 mx-auto px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors;
}
</style>