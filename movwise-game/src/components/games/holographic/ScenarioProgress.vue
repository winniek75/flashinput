<template>
  <div class="scenario-progress">
    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-label">
        <span class="label-text">Mission Progress</span>
        <span class="progress-fraction">{{ current }}/{{ total }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent }">
          <div class="progress-glow"></div>
        </div>
        <div class="progress-markers">
          <div
            v-for="n in total"
            :key="n"
            class="marker"
            :class="{ 'completed': n <= current }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Score Display -->
    <div class="score-container">
      <div class="score-label">Score</div>
      <div class="score-value">
        <span class="score-number">{{ animatedScore }}</span>
        <div class="score-sparkle"></div>
      </div>
    </div>

    <!-- Energy Gauge -->
    <div class="energy-gauge">
      <div class="gauge-container">
        <div class="gauge-fill" :style="{ height: energyPercent }">
          <div class="gauge-bubbles"></div>
        </div>
      </div>
      <div class="gauge-label">Energy</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    default: 0
  }
})

const animatedScore = ref(0)

const progressPercent = computed(() => {
  return `${(props.current / props.total) * 100}%`
})

const energyPercent = computed(() => {
  // Energy based on correct answers (score)
  const maxScore = props.total * 100
  const energy = (props.score / maxScore) * 100
  return `${Math.min(100, energy)}%`
})

// Animate score changes
watch(() => props.score, (newScore) => {
  const startScore = animatedScore.value
  const difference = newScore - startScore
  const duration = 500
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    animatedScore.value = Math.round(startScore + difference * progress)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}, { immediate: true })
</script>

<style scoped>
.scenario-progress {
  @apply flex items-center gap-6;
}

/* Progress Container */
.progress-container {
  @apply flex-1;
}

.progress-label {
  @apply flex justify-between items-center mb-2;
}

.label-text {
  @apply text-sm font-semibold text-cyan-400 uppercase tracking-wide;
}

.progress-fraction {
  @apply text-sm font-mono text-gray-400;
}

.progress-track {
  @apply relative h-6 bg-gray-800 rounded-full overflow-hidden;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.progress-fill {
  @apply absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-blue-500;
  @apply rounded-full transition-all duration-500 ease-out;
}

.progress-glow {
  @apply absolute inset-0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: glowSlide 2s linear infinite;
}

@keyframes glowSlide {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.progress-markers {
  @apply absolute inset-0 flex items-center justify-around px-2;
}

.marker {
  @apply w-2 h-2 bg-gray-700 rounded-full transition-all duration-300;
}

.marker.completed {
  @apply bg-cyan-400 scale-125;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}

/* Score Container */
.score-container {
  @apply relative px-6 py-3 bg-gray-900 rounded-xl;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.score-label {
  @apply text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1;
}

.score-value {
  @apply relative;
}

.score-number {
  @apply text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400;
  -webkit-background-clip: text;
  background-clip: text;
}

.score-sparkle {
  @apply absolute -top-1 -right-1 w-3 h-3;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent);
  animation: sparkle 1s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

/* Energy Gauge */
.energy-gauge {
  @apply flex flex-col items-center gap-2;
}

.gauge-container {
  @apply relative w-8 h-20 bg-gray-800 rounded-full overflow-hidden;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.gauge-fill {
  @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-lime-400;
  @apply transition-all duration-700 ease-out;
}

.gauge-bubbles {
  @apply absolute inset-0;
  background-image: radial-gradient(circle at 30% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 3%);
  animation: bubbles 3s linear infinite;
}

@keyframes bubbles {
  from { transform: translateY(100%); }
  to { transform: translateY(-100%); }
}

.gauge-label {
  @apply text-xs font-semibold text-cyan-400 uppercase;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .scenario-progress {
    @apply flex-col gap-4 w-full;
  }

  .progress-container {
    @apply w-full;
  }

  .score-container {
    @apply self-stretch;
  }

  .energy-gauge {
    @apply hidden;
  }
}
</style>