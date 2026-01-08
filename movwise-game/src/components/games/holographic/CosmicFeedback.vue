<template>
  <div class="cosmic-feedback" :class="{ 'success': isCorrect, 'error': !isCorrect }">
    <!-- Particle Effects -->
    <div v-if="isCorrect" class="particle-container">
      <div v-for="n in 20" :key="n" class="star-particle" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Alert Effects for Error -->
    <div v-else class="alert-container">
      <div class="alert-ring"></div>
      <div class="alert-ring"></div>
    </div>

    <!-- Feedback Content -->
    <div class="feedback-content">
      <!-- Icon -->
      <div class="feedback-icon">
        <span v-if="isCorrect" class="icon-success">✨</span>
        <span v-else class="icon-error">⚠️</span>
      </div>

      <!-- Message -->
      <div class="feedback-message">
        <h3 class="feedback-title">
          {{ isCorrect ? 'Excellent!' : 'Not quite!' }}
        </h3>
        <p class="feedback-text">{{ message }}</p>
      </div>

      <!-- Continue Button -->
      <button
        @click="handleContinue"
        class="continue-btn"
        :class="{ 'success-btn': isCorrect, 'error-btn': !isCorrect }"
      >
        <span class="btn-text">Continue</span>
        <span class="btn-arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  isCorrect: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['continue'])

const handleContinue = () => {
  emit('continue')
}

const getParticleStyle = (index) => {
  const angle = (360 / 20) * index
  const distance = 100 + Math.random() * 100
  const delay = Math.random() * 0.5
  const duration = 1 + Math.random()

  return {
    '--angle': `${angle}deg`,
    '--distance': `${distance}px`,
    '--delay': `${delay}s`,
    '--duration': `${duration}s`
  }
}

onMounted(() => {
  // Play feedback sound
  const audioFile = props.isCorrect ? '/audio/success.mp3' : '/audio/error.mp3'
  const audio = new Audio(audioFile)
  audio.volume = 0.4
  audio.play().catch(() => {})

  // Auto-continue after 3 seconds
  setTimeout(() => {
    handleContinue()
  }, 3000)
})
</script>

<style scoped>
.cosmic-feedback {
  @apply relative p-6 bg-gray-900 bg-opacity-80 rounded-xl mt-6;
  @apply border-2 transition-all duration-500;
  backdrop-filter: blur(10px);
  animation: feedbackAppear 0.5s ease-out;
}

@keyframes feedbackAppear {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.cosmic-feedback.success {
  @apply border-green-400;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  box-shadow: 0 0 50px rgba(16, 185, 129, 0.3);
}

.cosmic-feedback.error {
  @apply border-red-400;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.05) 100%);
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.3);
}

/* Particle Effects */
.particle-container {
  @apply absolute inset-0 pointer-events-none overflow-hidden;
}

.star-particle {
  @apply absolute w-2 h-2 bg-yellow-400 rounded-full;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: particleBurst var(--duration) ease-out var(--delay) forwards;
}

@keyframes particleBurst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(0);
    opacity: 0;
  }
}

/* Alert Effects */
.alert-container {
  @apply absolute inset-0 pointer-events-none;
}

.alert-ring {
  @apply absolute inset-0 border-4 border-red-400 rounded-xl;
  animation: alertPulse 1.5s ease-out infinite;
}

.alert-ring:nth-child(2) {
  animation-delay: 0.75s;
}

@keyframes alertPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

/* Feedback Content */
.feedback-content {
  @apply relative z-10 flex flex-col items-center text-center;
}

.feedback-icon {
  @apply text-5xl mb-3;
  animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}

.icon-success {
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
}

.icon-error {
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8));
}

.feedback-message {
  @apply mb-4;
}

.feedback-title {
  @apply text-2xl font-bold mb-2;
}

.cosmic-feedback.success .feedback-title {
  @apply text-green-400;
}

.cosmic-feedback.error .feedback-title {
  @apply text-red-400;
}

.feedback-text {
  @apply text-gray-300 text-lg;
}

/* Continue Button */
.continue-btn {
  @apply px-6 py-3 rounded-lg font-semibold text-white;
  @apply flex items-center gap-2 transition-all duration-300;
  @apply transform hover:scale-105 active:scale-95;
}

.success-btn {
  @apply bg-gradient-to-r from-green-500 to-green-600;
  @apply hover:from-green-600 hover:to-green-700;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.error-btn {
  @apply bg-gradient-to-r from-red-500 to-red-600;
  @apply hover:from-red-600 hover:to-red-700;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
}

.btn-text {
  @apply text-base;
}

.btn-arrow {
  @apply text-xl;
  animation: arrowSlide 1s ease-in-out infinite;
}

@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .feedback-icon {
    @apply text-4xl;
  }

  .feedback-title {
    @apply text-xl;
  }

  .feedback-text {
    @apply text-base;
  }
}
</style>