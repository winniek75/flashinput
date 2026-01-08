<!-- Native Pronunciation Player UI Component -->
<template>
  <div class="native-pronunciation-player" :class="variant">
    <!-- 音声再生ボタン -->
    <div class="pronunciation-controls">
      <button 
        @click="playPronunciation"
        :disabled="isPlaying || disabled"
        class="pronunciation-button"
        :class="{ 
          'playing': isPlaying, 
          'error': hasError,
          'success': hasPlayedSuccessfully 
        }"
        :title="buttonTitle"
      >
        <div class="button-content">
          <div class="audio-icon">
            <Volume2Icon v-if="!isPlaying" class="w-5 h-5" />
            <Loader2Icon v-else class="w-5 h-5 animate-spin" />
          </div>
          <span class="button-text" v-if="showText">{{ buttonText }}</span>
        </div>
        
        <!-- 音波エフェクト -->
        <div v-if="isPlaying" class="sound-waves">
          <div class="wave" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
        </div>
      </button>
      
      <!-- 再生速度調整 -->
      <div v-if="showSpeedControl" class="speed-control">
        <button 
          v-for="speed in speeds" 
          :key="speed.value"
          @click="setPlaybackSpeed(speed.value)"
          class="speed-button"
          :class="{ active: currentSpeed === speed.value }"
          :title="`再生速度: ${speed.label}`"
        >
          {{ speed.label }}
        </button>
      </div>
    </div>

    <!-- 発音詳細情報（展開可能） -->
    <div v-if="showDetails && pronunciationDetails" class="pronunciation-details">
      <div class="details-header">
        <h4 class="word-text">{{ word }}</h4>
        <button 
          @click="toggleDetails"
          class="toggle-details"
          :class="{ expanded: detailsExpanded }"
        >
          <ChevronDownIcon class="w-4 h-4" />
        </button>
      </div>
      
      <div v-show="detailsExpanded" class="details-content">
        <!-- IPA表記 -->
        <div class="ipa-section">
          <label class="detail-label">IPA記号:</label>
          <span class="ipa-text">/{{ pronunciationDetails.ipa }}/</span>
          <button 
            @click="playPhonemeSequence"
            class="phoneme-button"
            title="音素ごとに再生"
          >
            <Play class="w-3 h-3" />
          </button>
        </div>
        
        <!-- 音素分解 -->
        <div v-if="pronunciationDetails.phonemes" class="phonemes-section">
          <label class="detail-label">音素分解:</label>
          <div class="phonemes-list">
            <button 
              v-for="(phoneme, index) in pronunciationDetails.phonemes"
              :key="index"
              @click="playIndividualPhoneme(phoneme)"
              class="phoneme-chip"
              :title="phoneme.tips"
            >
              {{ phoneme.symbol }}
            </button>
          </div>
        </div>
        
        <!-- ネイティブのコツ -->
        <div v-if="pronunciationDetails.nativeTips" class="tips-section">
          <label class="detail-label">発音のコツ:</label>
          <p class="tips-text">{{ pronunciationDetails.nativeTips }}</p>
        </div>
        
        <!-- よくある間違い -->
        <div v-if="pronunciationDetails.commonErrors" class="errors-section">
          <label class="detail-label">よくある間違い:</label>
          <p class="errors-text">{{ pronunciationDetails.commonErrors }}</p>
        </div>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="hasError && showErrorMessage" class="error-message">
      <AlertCircleIcon class="w-4 h-4" />
      <span>{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted } from 'vue'
import { Volume2Icon, Loader2Icon, ChevronDownIcon, Play, AlertCircleIcon } from 'lucide-vue-next'
import { useGameAudio } from '@/composables/useGameAudio'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database'

// Props
const props = defineProps({
  word: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'vocabulary' // 'vocabulary', 'phoneme', 'sentence'
  },
  difficulty: {
    type: String,
    default: 'normal' // 'easy', 'normal', 'hard', 'native'
  },
  variant: {
    type: String,
    default: 'default' // 'default', 'compact', 'detailed'
  },
  showText: {
    type: Boolean,
    default: true
  },
  showDetails: {
    type: Boolean,
    default: false
  },
  showSpeedControl: {
    type: Boolean,
    default: false
  },
  showErrorMessage: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'play-start',
  'play-end',
  'play-error',
  'phoneme-played',
  'speed-changed'
])

// Native Audio System
const {
  playWord: playNativeWord,
  playPhoneme: playNativePhoneme,
  speakSentence: speakNativeSentence,
  initializeAudio: initNativeAudio
} = useGameAudio()

// State
const isPlaying = ref(false)
const hasError = ref(false)
const hasPlayedSuccessfully = ref(false)
const errorMessage = ref('')
const detailsExpanded = ref(false)
const currentSpeed = ref(1.0)

// Speed control options
const speeds = [
  { value: 0.5, label: '0.5×' },
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' }
]

// Computed properties
const buttonText = computed(() => {
  if (isPlaying.value) return '再生中...'
  if (hasError.value) return '再試行'
  if (hasPlayedSuccessfully.value) return '再生'
  return 'ネイティブ発音'
})

const buttonTitle = computed(() => {
  if (props.disabled) return '発音機能は無効です'
  if (isPlaying.value) return '発音を再生中...'
  if (hasError.value) return `発音エラー: ${errorMessage.value}`
  return `"${props.word}" のネイティブ発音を聞く`
})

const pronunciationDetails = computed(() => {
  // 音素データベースから発音詳細を取得
  const allPhonemes = Object.values(NATIVE_PHONEME_PROGRESSION).flat()
  return allPhonemes.find(p => 
    p.examples && p.examples.some(ex => ex.toLowerCase().includes(props.word.toLowerCase()))
  ) || generateWordPronunciation(props.word)
})

// Methods
const playPronunciation = async () => {
  if (isPlaying.value || props.disabled) return

  isPlaying.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    emit('play-start', props.word)

    await playNativeWord({
      word: props.word,
      type: props.type,
      difficulty: props.difficulty,
      speed: currentSpeed.value
    })

    hasPlayedSuccessfully.value = true
    emit('play-end', props.word)

  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || '発音の再生に失敗しました'
    emit('play-error', { word: props.word, error })
  } finally {
    isPlaying.value = false
  }
}

const playPhonemeSequence = async () => {
  if (!pronunciationDetails.value?.phonemes) return

  for (const phoneme of pronunciationDetails.value.phonemes) {
    try {
      await playNativePhoneme(phoneme.symbol)
      emit('phoneme-played', phoneme)
      await new Promise(resolve => setTimeout(resolve, 500)) // 音素間の間隔
    } catch (error) {
      logger.warn('音素再生エラー:', error)
    }
  }
}

const playIndividualPhoneme = async (phoneme) => {
  try {
    await playNativePhoneme(phoneme.symbol)
    emit('phoneme-played', phoneme)
  } catch (error) {
    logger.warn('音素再生エラー:', error)
  }
}

const setPlaybackSpeed = (speed) => {
  currentSpeed.value = speed
  emit('speed-changed', speed)
}

const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value
}

// 単語の発音詳細を生成（基本的な実装）
const generateWordPronunciation = (word) => {
  // 簡単な発音データを生成（実際の実装では音素分析が必要）
  return {
    ipa: word.toLowerCase(), // 実際にはIPA変換が必要
    phonemes: [],
    nativeTips: `"${word}" の正しい発音を心がけましょう`,
    commonErrors: '日本語のカタカナ読みにならないよう注意'
  }
}

// Watchers
watch(() => props.word, () => {
  hasPlayedSuccessfully.value = false
  hasError.value = false
  errorMessage.value = ''
})

// Lifecycle
onMounted(async () => {
  try {
    await initNativeAudio()
    
    if (props.autoPlay) {
      setTimeout(() => {
        playPronunciation()
      }, 500)
    }
  } catch (error) {
    logger.warn('Native audio initialization failed:', error)
  }
})
</script>

<style scoped>
.native-pronunciation-player {
  @apply flex flex-col gap-3;
}

.native-pronunciation-player.compact {
  @apply gap-2;
}

.pronunciation-controls {
  @apply flex items-center gap-2;
}

.pronunciation-button {
  @apply relative flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2;
}

.pronunciation-button:disabled {
  @apply opacity-50 cursor-not-allowed transform-none hover:shadow-none;
}

.pronunciation-button.playing {
  @apply from-green-500 to-blue-500;
}

.pronunciation-button.error {
  @apply from-red-500 to-pink-500;
}

.pronunciation-button.success {
  @apply from-emerald-500 to-teal-500;
}

.button-content {
  @apply flex items-center gap-2 relative z-10;
}

.audio-icon {
  @apply flex items-center justify-center;
}

.button-text {
  @apply text-sm font-medium;
}

.compact .button-text {
  @apply hidden;
}

.sound-waves {
  @apply absolute inset-0 flex items-center justify-center;
}

.wave {
  @apply w-1 bg-white/30 rounded-full mx-0.5;
  height: 4px;
  animation: soundWave 1s ease-in-out infinite;
}

@keyframes soundWave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}

.speed-control {
  @apply flex gap-1;
}

.speed-button {
  @apply px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors;
}

.speed-button.active {
  @apply bg-blue-500 text-white border-blue-500;
}

.pronunciation-details {
  @apply bg-gray-50 rounded-lg p-4 border;
}

.details-header {
  @apply flex items-center justify-between;
}

.word-text {
  @apply font-bold text-lg text-gray-800;
}

.toggle-details {
  @apply p-1 rounded hover:bg-gray-200 transition-colors;
}

.toggle-details.expanded {
  @apply transform rotate-180;
}

.details-content {
  @apply mt-4 space-y-3;
}

.detail-label {
  @apply block text-sm font-medium text-gray-600 mb-1;
}

.ipa-section {
  @apply flex items-center gap-2;
}

.ipa-text {
  @apply font-mono text-lg text-blue-600 bg-blue-50 px-2 py-1 rounded;
}

.phoneme-button {
  @apply p-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors;
}

.phonemes-section {
  @apply space-y-2;
}

.phonemes-list {
  @apply flex flex-wrap gap-1;
}

.phoneme-chip {
  @apply px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded font-mono transition-colors;
}

.tips-section,
.errors-section {
  @apply space-y-1;
}

.tips-text {
  @apply text-sm text-green-700 bg-green-50 p-2 rounded;
}

.errors-text {
  @apply text-sm text-orange-700 bg-orange-50 p-2 rounded;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded;
}

/* Variant: Compact */
.native-pronunciation-player.compact .pronunciation-button {
  @apply px-3 py-2;
}

.native-pronunciation-player.compact .pronunciation-details {
  @apply p-3;
}

/* Variant: Detailed */
.native-pronunciation-player.detailed {
  @apply bg-white rounded-xl shadow-lg p-6;
}

.native-pronunciation-player.detailed .pronunciation-button {
  @apply px-6 py-3 text-base;
}
</style>