<template>
  <div class="cosmic-particles">
    <!-- Twinkling stars -->
    <div
      v-for="(particle, index) in particles"
      :key="`star-${index}`"
      class="particle star"
      :style="getParticleStyle(particle)"
    ></div>

    <!-- Floating dust -->
    <div
      v-for="(dust, index) in dustParticles"
      :key="`dust-${index}`"
      class="particle dust"
      :style="getDustStyle(dust)"
    ></div>

    <!-- Energy orbs -->
    <div
      v-for="(orb, index) in energyOrbs"
      :key="`orb-${index}`"
      class="particle energy-orb"
      :style="getOrbStyle(orb)"
    ></div>

    <!-- Shooting stars (rare) -->
    <div
      v-for="(star, index) in shootingStars"
      :key="`shooting-${index}`"
      class="shooting-star"
      :style="getShootingStarStyle(star)"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const particles = ref([])
const dustParticles = ref([])
const energyOrbs = ref([])
const shootingStars = ref([])

let animationFrame = null

const props = defineProps({
  intensity: {
    type: String,
    default: 'normal', // 'low', 'normal', 'high', 'galaxy'
    validator: value => ['low', 'normal', 'high', 'galaxy'].includes(value)
  },
  theme: {
    type: String,
    default: 'cosmic', // 'cosmic', 'energy', 'mystical'
    validator: value => ['cosmic', 'energy', 'mystical'].includes(value)
  }
})

const intensitySettings = {
  low: { stars: 20, dust: 10, orbs: 3 },
  normal: { stars: 50, dust: 25, orbs: 8 },
  high: { stars: 80, dust: 40, orbs: 15 },
  galaxy: { stars: 120, dust: 60, orbs: 25 }
}

const themeColors = {
  cosmic: {
    stars: '#ffffff',
    dust: '#e0e7ff',
    orbs: ['#3b82f6', '#6366f1', '#8b5cf6']
  },
  energy: {
    stars: '#fbbf24',
    dust: '#fef3c7',
    orbs: ['#f59e0b', '#eab308', '#84cc16']
  },
  mystical: {
    stars: '#a855f7',
    dust: '#ddd6fe',
    orbs: ['#8b5cf6', '#a855f7', '#c084fc']
  }
}

function createParticles() {
  const settings = intensitySettings[props.intensity]
  const colors = themeColors[props.theme]

  // Stars
  particles.value = []
  for (let i = 0; i < settings.stars; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors.stars
    })
  }

  // Dust particles
  dustParticles.value = []
  for (let i = 0; i < settings.dust; i++) {
    dustParticles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      direction: Math.random() * 360,
      speed: Math.random() * 0.5 + 0.1,
      color: colors.dust
    })
  }

  // Energy orbs
  energyOrbs.value = []
  for (let i = 0; i < settings.orbs; i++) {
    energyOrbs.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 15,
      color: colors.orbs[Math.floor(Math.random() * colors.orbs.length)],
      pulseSpeed: Math.random() * 2 + 1
    })
  }
}

function createShootingStar() {
  if (Math.random() < 0.1) { // 10% chance every cycle
    const side = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
    let startX, startY, endX, endY

    switch (side) {
      case 0: // from top
        startX = Math.random() * 100
        startY = -5
        endX = startX + (Math.random() * 50 - 25)
        endY = 105
        break
      case 1: // from right
        startX = 105
        startY = Math.random() * 100
        endX = -5
        endY = startY + (Math.random() * 50 - 25)
        break
      case 2: // from bottom
        startX = Math.random() * 100
        startY = 105
        endX = startX + (Math.random() * 50 - 25)
        endY = -5
        break
      case 3: // from left
        startX = -5
        startY = Math.random() * 100
        endX = 105
        endY = startY + (Math.random() * 50 - 25)
        break
    }

    shootingStars.value.push({
      startX,
      startY,
      endX,
      endY,
      duration: Math.random() * 3 + 2,
      size: Math.random() * 3 + 2,
      color: themeColors[props.theme].orbs[0],
      id: Date.now() + Math.random()
    })

    // Remove after animation
    setTimeout(() => {
      shootingStars.value = shootingStars.value.filter(star => star.id !== shootingStars.value[shootingStars.value.length - 1]?.id)
    }, 5000)
  }
}

function animateParticles() {
  // Create occasional shooting stars
  if (Math.random() < 0.001) { // Very rare
    createShootingStar()
  }

  // Continue animation
  animationFrame = requestAnimationFrame(animateParticles)
}

function getParticleStyle(particle) {
  return {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    opacity: particle.opacity,
    animationDuration: `${particle.duration}s`,
    animationDelay: `${particle.delay}s`
  }
}

function getDustStyle(dust) {
  return {
    left: `${dust.x}%`,
    top: `${dust.y}%`,
    width: `${dust.size}px`,
    height: `${dust.size}px`,
    backgroundColor: dust.color,
    animationDuration: `${dust.duration}s`,
    animationDelay: `${dust.delay}s`,
    '--move-x': `${Math.cos(dust.direction * Math.PI / 180) * dust.speed * 20}px`,
    '--move-y': `${Math.sin(dust.direction * Math.PI / 180) * dust.speed * 20}px`
  }
}

function getOrbStyle(orb) {
  return {
    left: `${orb.x}%`,
    top: `${orb.y}%`,
    width: `${orb.size}px`,
    height: `${orb.size}px`,
    backgroundColor: orb.color,
    animationDuration: `${orb.duration}s, ${orb.pulseSpeed}s`,
    animationDelay: `${orb.delay}s`
  }
}

function getShootingStarStyle(star) {
  return {
    left: `${star.startX}%`,
    top: `${star.startY}%`,
    width: `${star.size}px`,
    height: `2px`,
    background: `linear-gradient(90deg, ${star.color}, transparent)`,
    animationDuration: `${star.duration}s`,
    '--end-x': `${star.endX - star.startX}vw`,
    '--end-y': `${star.endY - star.startY}vh`
  }
}

onMounted(() => {
  createParticles()
  animateParticles()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.cosmic-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
}

.star {
  animation: twinkle infinite ease-in-out;
  box-shadow: 0 0 6px currentColor;
}

.dust {
  animation: float infinite linear, fade-in-out infinite ease-in-out;
  opacity: 0.6;
}

.energy-orb {
  animation: orbit infinite ease-in-out, pulse infinite ease-in-out;
  box-shadow: 0 0 20px currentColor, inset 0 0 10px rgba(255, 255, 255, 0.3);
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), currentColor) !important;
}

.shooting-star {
  position: absolute;
  animation: shoot linear;
  box-shadow: 0 0 10px currentColor;
  border-radius: 50% 0;
  transform-origin: left center;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(var(--move-x), var(--move-y));
  }
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes orbit {
  0% {
    transform: rotate(0deg) translateX(10px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(10px) rotate(-360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

@keyframes shoot {
  0% {
    transform: translate(0, 0) rotate(45deg);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x), var(--end-y)) rotate(45deg);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cosmic-particles {
    opacity: 0.7; /* Reduce intensity on mobile */
  }

  .energy-orb {
    animation-duration: 8s, 1.5s; /* Faster animations */
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
  }

  .shooting-star {
    display: none;
  }
}
</style>