<!-- Simple Pronunciation Button Component -->
<template>
  <button 
    @click="playPronunciation"
    :disabled="isPlaying || disabled"
    class="pronunciation-button"
    :class="[size, { 'playing': isPlaying }]"
    :title="title"
  >
    <Volume2Icon v-if="!isPlaying" :class="iconClass" />
    <Loader2Icon v-else :class="iconClass + ' animate-spin'" />
    <span v-if="showText" class="button-text">{{ text }}</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Volume2Icon, Loader2Icon } from 'lucide-vue-next'
import { useGameAudio } from '@/composables/useGameAudio'

// Props
const props = defineProps({
  word: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'vocabulary'
  },
  difficulty: {
    type: String,
    default: 'normal'
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: value => ['small', 'medium', 'large'].includes(value)
  },
  showText: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: '発音'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['play-start', 'play-end', 'play-error'])

// Native Audio System
const { playWord: playNativeWord } = useGameAudio()

// State
const isPlaying = ref(false)

// Computed
const iconClass = computed(() => {
  const baseClass = 'flex-shrink-0'
  switch (props.size) {
    case 'small': return `${baseClass} w-3 h-3`
    case 'large': return `${baseClass} w-6 h-6`
    default: return `${baseClass} w-4 h-4`
  }
})

const title = computed(() => {
  if (props.disabled) return '発音機能は無効です'
  if (isPlaying.value) return '発音を再生中...'
  return `"${props.word}" の発音を聞く`
})

// Methods
const playPronunciation = async () => {
  if (isPlaying.value || props.disabled) return

  isPlaying.value = true

  try {
    emit('play-start', props.word)

    await playNativeWord({
      word: props.word,
      type: props.type,
      difficulty: props.difficulty
    })

    emit('play-end', props.word)

  } catch (error) {
    emit('play-error', { word: props.word, error })
  } finally {
    isPlaying.value = false
  }
}
</script>

<style scoped>
.pronunciation-button {
  @apply inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1;
}

.pronunciation-button:disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-blue-500;
}

.pronunciation-button.playing {
  @apply bg-green-500 hover:bg-green-600;
}

/* Size variants */
.pronunciation-button.small {
  @apply px-2 py-1 text-xs;
}

.pronunciation-button.medium {
  @apply px-3 py-2 text-sm;
}

.pronunciation-button.large {
  @apply px-4 py-3 text-base;
}

.button-text {
  @apply font-medium;
}
</style>