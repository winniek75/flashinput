<template>
  <div class="warp-transition-container">
    <!-- Warp effect overlay -->
    <div
      v-if="isTransitioning"
      class="warp-overlay"
      :class="{ active: showEffect }"
    >
      <!-- Warp rings -->
      <div class="warp-rings">
        <div
          v-for="ring in warpRings"
          :key="ring.id"
          class="warp-ring"
          :style="getRingStyle(ring)"
        ></div>
      </div>

      <!-- Warp particles -->
      <div class="warp-particles">
        <div
          v-for="particle in warpParticles"
          :key="particle.id"
          class="warp-particle"
          :style="getParticleStyle(particle)"
        ></div>
      </div>

      <!-- Central energy burst -->
      <div class="energy-burst" :class="{ active: showBurst }">
        <div class="burst-core"></div>
        <div class="burst-rays">
          <div
            v-for="i in 12"
            :key="i"
            class="burst-ray"
            :style="{ transform: `rotate(${i * 30}deg)` }"
          ></div>
        </div>
      </div>

      <!-- Loading text -->
      <div class="warp-text" :class="{ visible: showText }">
        <div class="text-content">
          <div class="loading-spinner"></div>
          <p class="loading-message">{{ currentMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Main content with transition -->
    <transition
      name="warp-content"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <slot />
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const isTransitioning = ref(false)
const showEffect = ref(false)
const showBurst = ref(false)
const showText = ref(false)
const currentMessage = ref('')

const warpRings = ref([])
const warpParticles = ref([])

const messages = [
  'Initializing warp drive...',
  'Scanning quantum fields...',
  'Calibrating temporal coordinates...',
  'Engaging hyperdrive...',
  'Breaking through space-time...',
  'Arriving at destination...'
]

const props = defineProps({
  duration: {
    type: Number,
    default: 2000 // 2 seconds
  },
  intensity: {
    type: String,
    default: 'normal', // 'low', 'normal', 'high'
    validator: value => ['low', 'normal', 'high'].includes(value)
  }
})

const intensitySettings = computed(() => {
  const settings = {
    low: { rings: 3, particles: 20, speed: 1 },
    normal: { rings: 5, particles: 40, speed: 1.5 },
    high: { rings: 8, particles: 80, speed: 2 }
  }
  return settings[props.intensity]
})

function createWarpRings() {
  warpRings.value = []
  for (let i = 0; i < intensitySettings.value.rings; i++) {
    warpRings.value.push({
      id: i,
      size: 100 + (i * 80),
      delay: i * 0.2,
      opacity: 0.8 - (i * 0.15)
    })
  }
}

function createWarpParticles() {
  warpParticles.value = []
  for (let i = 0; i < intensitySettings.value.particles; i++) {
    const angle = (360 / intensitySettings.value.particles) * i
    warpParticles.value.push({
      id: i,
      angle,
      distance: Math.random() * 300 + 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      delay: Math.random() * 1
    })
  }
}

function getRingStyle(ring) {
  return {
    width: `${ring.size}px`,
    height: `${ring.size}px`,
    animationDelay: `${ring.delay}s`,
    opacity: ring.opacity,
    animationDuration: `${1.5 / intensitySettings.value.speed}s`
  }
}

function getParticleStyle(particle) {
  const x = Math.cos(particle.angle * Math.PI / 180) * particle.distance
  const y = Math.sin(particle.angle * Math.PI / 180) * particle.distance

  return {
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.speed / intensitySettings.value.speed}s`
  }
}

function startWarpEffect() {
  isTransitioning.value = true

  setTimeout(() => {
    showEffect.value = true
  }, 50)

  setTimeout(() => {
    showText.value = true
    currentMessage.value = messages[0]
  }, 200)

  // Cycle through messages
  messages.forEach((message, index) => {
    setTimeout(() => {
      currentMessage.value = message
    }, 200 + (index * 300))
  })

  setTimeout(() => {
    showBurst.value = true
  }, props.duration * 0.7)

  setTimeout(() => {
    showEffect.value = false
    showBurst.value = false
    showText.value = false
  }, props.duration * 0.9)

  setTimeout(() => {
    isTransitioning.value = false
  }, props.duration)
}

// Transition hooks
function onBeforeEnter() {
  // Component is about to enter
}

function onEnter() {
  // Component has entered
}

function onLeave() {
  startWarpEffect()
}

onMounted(() => {
  createWarpRings()
  createWarpParticles()
})

// Expose method to trigger warp effect manually
defineExpose({
  triggerWarp: startWarpEffect
})
</script>

<style scoped>
.warp-transition-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.warp-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, rgba(0, 10, 30, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.warp-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.warp-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.warp-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: warp-ring-expand infinite ease-out;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

.warp-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.warp-particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(59, 130, 246, 0.8) 50%, transparent 100%);
  border-radius: 50%;
  animation: warp-particle-move infinite linear;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.energy-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.energy-burst.active {
  opacity: 1;
}

.burst-core {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(59, 130, 246, 0.8) 70%, transparent 100%);
  border-radius: 50%;
  animation: pulse-core 0.5s ease-out;
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.8), 0 0 100px rgba(59, 130, 246, 0.6);
}

.burst-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.burst-ray {
  position: absolute;
  width: 4px;
  height: 200px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(59, 130, 246, 0.8), transparent);
  border-radius: 2px;
  top: -100px;
  left: -2px;
  animation: ray-extend 0.8s ease-out;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.warp-text {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.warp-text.visible {
  opacity: 1;
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  margin: 0;
}

/* Transition animations for content */
.warp-content-enter-active,
.warp-content-leave-active {
  transition: all 0.5s ease;
}

.warp-content-enter-from {
  opacity: 0;
  transform: scale(0.9) rotateY(90deg);
}

.warp-content-leave-to {
  opacity: 0;
  transform: scale(1.1) rotateY(-90deg);
}

/* Keyframe animations */
@keyframes warp-ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

@keyframes warp-particle-move {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0;
  }
}

@keyframes pulse-core {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes ray-extend {
  0% {
    height: 0;
    opacity: 1;
  }
  50% {
    height: 200px;
    opacity: 1;
  }
  100% {
    height: 200px;
    opacity: 0;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .warp-ring {
    border-width: 1px;
  }

  .burst-ray {
    height: 150px;
    top: -75px;
  }

  .loading-message {
    font-size: 1rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .warp-overlay {
    animation: none;
  }

  .warp-ring,
  .warp-particle,
  .burst-core,
  .burst-ray {
    animation: none;
  }

  .warp-content-enter-active,
  .warp-content-leave-active {
    transition: opacity 0.3s ease;
  }

  .warp-content-enter-from,
  .warp-content-leave-to {
    transform: none;
  }
}
</style>