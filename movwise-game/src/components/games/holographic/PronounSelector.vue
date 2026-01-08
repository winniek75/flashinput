<template>
  <div class="pronoun-selector">
    <div class="selector-header">
      <h4 class="selector-title">正しい代名詞を選んでください：</h4>
      <div class="timer-bar" :style="{ width: timerWidth }"></div>
    </div>

    <div class="options-grid">
      <button
        v-for="(option, index) in options[blankIndex]"
        :key="index"
        @click="selectOption(option)"
        :disabled="disabled"
        class="option-btn"
        :class="{
          'disabled': disabled,
          'hover-effect': !disabled
        }"
      >
        <span class="option-number">{{ index + 1 }}</span>
        <span class="option-text">{{ option.text }}</span>
        <div class="option-glow"></div>
      </button>
    </div>

    <!-- Keyboard Shortcuts Info -->
    <div class="keyboard-info">
      <span class="keyboard-hint">
        <kbd>1</kbd> - <kbd>4</kbd> to select
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  blankIndex: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const timerWidth = ref('100%')
let timerInterval = null

const selectOption = (option) => {
  if (props.disabled) return

  // Add selection effect
  playSelectSound()
  emit('select', option)
}

const handleKeyPress = (event) => {
  if (props.disabled) return

  const key = event.key
  if (key >= '1' && key <= '4') {
    const index = parseInt(key) - 1
    if (props.options[props.blankIndex] && props.options[props.blankIndex][index]) {
      selectOption(props.options[props.blankIndex][index])
    }
  }
}

const startTimer = () => {
  let timeLeft = 100
  timerInterval = setInterval(() => {
    timeLeft -= 2
    timerWidth.value = `${timeLeft}%`

    if (timeLeft <= 0) {
      clearInterval(timerInterval)
      // Auto-select first option on timeout
      if (!props.disabled && props.options[props.blankIndex]) {
        selectOption(props.options[props.blankIndex][0])
      }
    }
  }, 140) // 7 seconds total (100 / 2 * 140ms = 7000ms)
}

const resetTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  timerWidth.value = '100%'
  startTimer()
}

const playSelectSound = () => {
  const audio = new Audio('/audio/select.mp3')
  audio.volume = 0.3
  audio.play().catch(() => {})
}

watch(() => props.blankIndex, () => {
  resetTimer()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  startTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.pronoun-selector {
  @apply mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl;
  border: 1px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.selector-header {
  @apply mb-4 relative;
}

.selector-title {
  @apply text-lg font-semibold text-cyan-400 mb-2;
}

.timer-bar {
  @apply h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full;
  transition: width 0.1s linear;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.options-grid {
  @apply grid grid-cols-2 gap-4;
}

@media (min-width: 768px) {
  .options-grid {
    @apply grid-cols-4;
  }
}

.option-btn {
  @apply relative p-4 bg-gray-900 bg-opacity-70 rounded-lg;
  @apply border-2 border-gray-700 transition-all duration-300;
  @apply flex flex-col items-center gap-2;
  overflow: hidden;
}

.option-btn.hover-effect:hover {
  @apply border-cyan-400 transform scale-105;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
}

.option-btn.hover-effect:active {
  @apply scale-95;
}

.option-btn.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.option-number {
  @apply absolute top-2 left-2 w-6 h-6 bg-cyan-900 rounded-full;
  @apply flex items-center justify-center text-xs text-cyan-400 font-bold;
}

.option-text {
  @apply text-xl font-semibold text-white;
}

.option-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.option-btn:hover .option-glow {
  @apply opacity-100;
}

.keyboard-info {
  @apply mt-4 text-center;
}

.keyboard-hint {
  @apply inline-flex items-center gap-2 text-sm text-gray-400;
}

.keyboard-hint kbd {
  @apply px-2 py-1 bg-gray-800 rounded border border-gray-700 font-mono text-xs;
}

/* Animation for option appearance */
.option-btn {
  animation: optionAppear 0.3s ease-out backwards;
}

.option-btn:nth-child(1) { animation-delay: 0s; }
.option-btn:nth-child(2) { animation-delay: 0.1s; }
.option-btn:nth-child(3) { animation-delay: 0.2s; }
.option-btn:nth-child(4) { animation-delay: 0.3s; }

@keyframes optionAppear {
  from {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>