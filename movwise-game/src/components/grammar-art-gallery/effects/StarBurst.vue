<template>
  <div class="star-burst-container">
    <!-- Burst effect -->
    <div
      v-if="isActive"
      class="star-burst"
      :class="[`burst-${type}`, { active: showBurst }]"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    >
      <!-- Central star -->
      <div class="central-star" :class="`star-${type}`">
        <div class="star-core"></div>
        <div class="star-glow"></div>
      </div>

      <!-- Radiating particles -->
      <div class="burst-particles">
        <div
          v-for="particle in particles"
          :key="particle.id"
          class="burst-particle"
          :class="`particle-${type}`"
          :style="getParticleStyle(particle)"
        ></div>
      </div>

      <!-- Expanding rings -->
      <div class="burst-rings">
        <div
          v-for="ring in rings"
          :key="ring.id"
          class="burst-ring"
          :class="`ring-${type}`"
          :style="getRingStyle(ring)"
        ></div>
      </div>

      <!-- Light rays -->
      <div class="light-rays">
        <div
          v-for="ray in rays"
          :key="ray.id"
          class="light-ray"
          :class="`ray-${type}`"
          :style="getRayStyle(ray)"
        ></div>
      </div>

      <!-- Sparkles -->
      <div class="sparkles">
        <div
          v-for="sparkle in sparkles"
          :key="sparkle.id"
          class="sparkle"
          :class="`sparkle-${type}`"
          :style="getSparkleStyle(sparkle)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const isActive = ref(false)
const showBurst = ref(false)
const particles = ref([])
const rings = ref([])
const rays = ref([])
const sparkles = ref([])

const props = defineProps({
  trigger: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'success', // 'success', 'achievement', 'energy', 'magic', 'critical'
    validator: value => ['success', 'achievement', 'energy', 'magic', 'critical'].includes(value)
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  intensity: {
    type: String,
    default: 'normal', // 'low', 'normal', 'high', 'epic'
    validator: value => ['low', 'normal', 'high', 'epic'].includes(value)
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['complete'])

const intensitySettings = computed(() => {
  const settings = {
    low: { particles: 8, rings: 2, rays: 6, sparkles: 12 },
    normal: { particles: 16, rings: 3, rays: 8, sparkles: 20 },
    high: { particles: 24, rings: 4, rays: 12, sparkles: 30 },
    epic: { particles: 40, rings: 6, rays: 16, sparkles: 50 }
  }
  return settings[props.intensity]
})

const typeColors = {
  success: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#FFFFFF'
  },
  achievement: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FFF7ED'
  },
  energy: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#DBEAFE'
  },
  magic: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#F3E8FF'
  },
  critical: {
    primary: '#EF4444',
    secondary: '#F87171',
    accent: '#FEF2F2'
  }
}

function createParticles() {
  particles.value = []
  const count = intensitySettings.value.particles

  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + (Math.random() * 20 - 10) // Add some randomness
    particles.value.push({
      id: i,
      angle,
      distance: Math.random() * 100 + 50,
      size: Math.random() * 6 + 3,
      speed: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.3
    })
  }
}

function createRings() {
  rings.value = []
  const count = intensitySettings.value.rings

  for (let i = 0; i < count; i++) {
    rings.value.push({
      id: i,
      size: 30 + (i * 40),
      delay: i * 0.1,
      duration: 1 + (i * 0.2)
    })
  }
}

function createRays() {
  rays.value = []
  const count = intensitySettings.value.rays

  for (let i = 0; i < count; i++) {
    rays.value.push({
      id: i,
      angle: (360 / count) * i,
      length: Math.random() * 80 + 60,
      width: Math.random() * 3 + 2,
      delay: Math.random() * 0.2
    })
  }
}

function createSparkles() {
  sparkles.value = []
  const count = intensitySettings.value.sparkles

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 360
    const distance = Math.random() * 120 + 40
    sparkles.value.push({
      id: i,
      x: Math.cos(angle * Math.PI / 180) * distance,
      y: Math.sin(angle * Math.PI / 180) * distance,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 0.5,
      duration: Math.random() * 1 + 0.5
    })
  }
}

function getParticleStyle(particle) {
  const x = Math.cos(particle.angle * Math.PI / 180) * particle.distance
  const y = Math.sin(particle.angle * Math.PI / 180) * particle.distance

  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    animationDelay: `${particle.delay}s`,
    animationDuration: `${particle.speed + 0.5}s`
  }
}

function getRingStyle(ring) {
  return {
    width: `${ring.size}px`,
    height: `${ring.size}px`,
    animationDelay: `${ring.delay}s`,
    animationDuration: `${ring.duration}s`
  }
}

function getRayStyle(ray) {
  return {
    width: `${ray.width}px`,
    height: `${ray.length}px`,
    transform: `rotate(${ray.angle}deg)`,
    transformOrigin: 'center bottom',
    animationDelay: `${ray.delay}s`
  }
}

function getSparkleStyle(sparkle) {
  return {
    left: `${sparkle.x}px`,
    top: `${sparkle.y}px`,
    width: `${sparkle.size}px`,
    height: `${sparkle.size}px`,
    animationDelay: `${sparkle.delay}s`,
    animationDuration: `${sparkle.duration}s`
  }
}

function triggerBurst() {
  if (isActive.value) return

  createParticles()
  createRings()
  createRays()
  createSparkles()

  isActive.value = true

  setTimeout(() => {
    showBurst.value = true
  }, 50)

  setTimeout(() => {
    showBurst.value = false
  }, props.duration - 300)

  setTimeout(() => {
    isActive.value = false
    emit('complete')
  }, props.duration)
}

watch(() => props.trigger, (newValue) => {
  if (newValue) {
    triggerBurst()
  }
})

// Expose method to trigger burst manually
defineExpose({
  triggerBurst
})
</script>

<style scoped>
.star-burst-container {
  position: relative;
  pointer-events: none;
}

.star-burst {
  position: absolute;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.star-burst.active {
  opacity: 1;
}

.central-star {
  position: absolute;
  transform: translate(-50%, -50%);
  animation: star-pulse 1s ease-out;
}

.star-core {
  width: 20px;
  height: 20px;
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: core-expand 0.8s ease-out;
}

.star-glow {
  width: 40px;
  height: 40px;
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: glow-pulse 1.2s ease-out;
}

.burst-particles {
  position: absolute;
  transform: translate(-50%, -50%);
}

.burst-particle {
  position: absolute;
  border-radius: 50%;
  animation: particle-burst linear;
  transform: translate(-50%, -50%);
}

.burst-rings {
  position: absolute;
  transform: translate(-50%, -50%);
}

.burst-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  transform: translate(-50%, -50%);
  animation: ring-expand ease-out;
}

.light-rays {
  position: absolute;
  transform: translate(-50%, -50%);
}

.light-ray {
  position: absolute;
  left: 50%;
  bottom: 50%;
  border-radius: 50% 50% 0 0;
  animation: ray-flash 0.6s ease-out;
}

.sparkles {
  position: absolute;
  transform: translate(-50%, -50%);
}

.sparkle {
  position: absolute;
  border-radius: 50%;
  animation: sparkle-twinkle ease-in-out;
  transform: translate(-50%, -50%);
}

/* Type-specific styles */
.burst-success .star-core {
  background: radial-gradient(circle, #FFFFFF, #10B981);
  box-shadow: 0 0 20px #10B981;
}

.burst-success .star-glow {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.6), transparent);
}

.particle-success {
  background: radial-gradient(circle, #34D399, transparent);
}

.ring-success {
  border-color: #10B981;
  box-shadow: 0 0 10px #10B981;
}

.ray-success {
  background: linear-gradient(to top, #10B981, transparent);
  box-shadow: 0 0 5px #10B981;
}

.sparkle-success {
  background: #FFFFFF;
  box-shadow: 0 0 6px #10B981;
}

.burst-achievement .star-core {
  background: radial-gradient(circle, #FFFFFF, #F59E0B);
  box-shadow: 0 0 20px #F59E0B;
}

.burst-achievement .star-glow {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent);
}

.particle-achievement {
  background: radial-gradient(circle, #FBBF24, transparent);
}

.ring-achievement {
  border-color: #F59E0B;
  box-shadow: 0 0 10px #F59E0B;
}

.ray-achievement {
  background: linear-gradient(to top, #F59E0B, transparent);
  box-shadow: 0 0 5px #F59E0B;
}

.sparkle-achievement {
  background: #FFF7ED;
  box-shadow: 0 0 6px #F59E0B;
}

.burst-energy .star-core {
  background: radial-gradient(circle, #FFFFFF, #3B82F6);
  box-shadow: 0 0 20px #3B82F6;
}

.burst-energy .star-glow {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.6), transparent);
}

.particle-energy {
  background: radial-gradient(circle, #60A5FA, transparent);
}

.ring-energy {
  border-color: #3B82F6;
  box-shadow: 0 0 10px #3B82F6;
}

.ray-energy {
  background: linear-gradient(to top, #3B82F6, transparent);
  box-shadow: 0 0 5px #3B82F6;
}

.sparkle-energy {
  background: #DBEAFE;
  box-shadow: 0 0 6px #3B82F6;
}

.burst-magic .star-core {
  background: radial-gradient(circle, #FFFFFF, #8B5CF6);
  box-shadow: 0 0 20px #8B5CF6;
}

.burst-magic .star-glow {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.6), transparent);
}

.particle-magic {
  background: radial-gradient(circle, #A78BFA, transparent);
}

.ring-magic {
  border-color: #8B5CF6;
  box-shadow: 0 0 10px #8B5CF6;
}

.ray-magic {
  background: linear-gradient(to top, #8B5CF6, transparent);
  box-shadow: 0 0 5px #8B5CF6;
}

.sparkle-magic {
  background: #F3E8FF;
  box-shadow: 0 0 6px #8B5CF6;
}

.burst-critical .star-core {
  background: radial-gradient(circle, #FFFFFF, #EF4444);
  box-shadow: 0 0 20px #EF4444;
}

.burst-critical .star-glow {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.6), transparent);
}

.particle-critical {
  background: radial-gradient(circle, #F87171, transparent);
}

.ring-critical {
  border-color: #EF4444;
  box-shadow: 0 0 10px #EF4444;
}

.ray-critical {
  background: linear-gradient(to top, #EF4444, transparent);
  box-shadow: 0 0 5px #EF4444;
}

.sparkle-critical {
  background: #FEF2F2;
  box-shadow: 0 0 6px #EF4444;
}

/* Animations */
@keyframes star-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes core-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
}

@keyframes glow-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0;
  }
}

@keyframes ring-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes ray-flash {
  0% {
    opacity: 0;
    transform: scaleY(0);
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
  100% {
    opacity: 0;
    transform: scaleY(1);
  }
}

@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .star-core {
    width: 15px;
    height: 15px;
  }

  .star-glow {
    width: 30px;
    height: 30px;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .star-burst,
  .star-core,
  .star-glow,
  .burst-particle,
  .burst-ring,
  .light-ray,
  .sparkle {
    animation: none;
  }

  .star-burst.active {
    opacity: 1;
  }
}
</style>