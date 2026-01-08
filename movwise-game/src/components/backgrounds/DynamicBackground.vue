<template>
  <div class="dynamic-background" :class="backgroundClasses">
    <!-- Lazy-loaded Background Layers -->
    <div class="background-layers">
      <div 
        v-for="(layer, index) in activeLayers"
        :key="`layer-${index}`"
        class="background-layer"
        :class="`layer-${index}`"
        :style="getLayerStyle(layer, index)"
      >
        <img 
          v-if="layer.loaded"
          :src="layer.url"
          :alt="layer.alt"
          class="layer-image"
          @load="onLayerLoad(index)"
          @error="onLayerError(index)"
        />
        <div v-else class="layer-placeholder" :style="getPlaceholderStyle(layer)"></div>
      </div>
    </div>

    <!-- Particle Systems -->
    <div class="particle-systems" v-if="showParticles">
      <!-- Star Field -->
      <div class="star-field" v-if="effects.stars">
        <div 
          v-for="star in visibleStars"
          :key="`star-${star.id}`"
          class="star"
          :class="`star-${star.type}`"
          :style="getStarStyle(star)"
        ></div>
      </div>

      <!-- Nebula Particles -->
      <div class="nebula-system" v-if="effects.nebula">
        <div 
          v-for="particle in nebulaParticles"
          :key="`nebula-${particle.id}`"
          class="nebula-particle"
          :style="getNebulaStyle(particle)"
        ></div>
      </div>

      <!-- Atmospheric Effects -->
      <div class="atmosphere" v-if="effects.atmosphere" :style="atmosphereStyle">
        <div class="atmosphere-layer" v-for="n in 3" :key="`atm-${n}`"></div>
      </div>

      <!-- Moving Objects -->
      <div class="space-objects" v-if="effects.objects">
        <div 
          v-for="object in spaceObjects"
          :key="`object-${object.id}`"
          class="space-object"
          :class="`object-${object.type}`"
          :style="getObjectStyle(object)"
        ></div>
      </div>
    </div>

    <!-- Time-based Overlays -->
    <div class="time-overlays" v-if="timeEffects">
      <div class="day-night-cycle" :style="dayNightStyle"></div>
      <div class="stellar-motion" :style="stellarMotionStyle"></div>
    </div>

    <!-- Loading Progress -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${loadingProgress}%` }"
        ></div>
      </div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBackgroundManager } from '@/utils/backgroundManager'

// Types
interface BackgroundLayer {
  id: string
  url: string
  alt: string
  loaded: boolean
  priority: number
  parallaxFactor: number
  opacity: number
  blendMode?: string
}

interface Star {
  id: number
  x: number
  y: number
  z: number
  type: 'normal' | 'bright' | 'distant'
  size: number
  brightness: number
  twinkleSpeed: number
  color: string
}

interface NebulaParticle {
  id: number
  x: number
  y: number
  z: number
  size: number
  color: string
  opacity: number
  speed: number
  direction: number
}

interface SpaceObject {
  id: number
  type: 'asteroid' | 'debris' | 'ship' | 'satellite'
  x: number
  y: number
  z: number
  rotation: number
  rotationSpeed: number
  scale: number
  trajectory?: { x: number; y: number }
}

interface EffectConfig {
  stars: boolean
  nebula: boolean
  atmosphere: boolean
  objects: boolean
  particles: boolean
}

// Props
interface Props {
  planet?: string
  backgroundId?: string
  quality?: 'mobile' | 'desktop' | '4k'
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night'
  showParticles?: boolean
  enableTimeEffects?: boolean
  autoOptimize?: boolean
  maxParticles?: number
}

const props = withDefaults(defineProps<Props>(), {
  planet: undefined,
  backgroundId: 'default-space',
  quality: 'desktop',
  timeOfDay: 'night',
  showParticles: true,
  enableTimeEffects: true,
  autoOptimize: true,
  maxParticles: 500
})

// Emits
const emit = defineEmits<{
  'loading-start': []
  'loading-progress': [progress: number]
  'loading-complete': []
  'layer-loaded': [layerIndex: number]
  'optimization-change': [level: 'low' | 'medium' | 'high']
}>()

// Background Manager
const {
  setBackground,
  getBackgroundUrl,
  getPlanetEffects,
  isBackgroundLoaded,
  getLoadingProgress,
  detectOptimalQuality
} = useBackgroundManager()

// State
const isLoading = ref(true)
const loadingProgress = ref(0)
const loadingText = ref('背景を読み込み中...')
const activeLayers = ref<BackgroundLayer[]>([])
const currentTime = ref(Date.now())
const visibleStars = ref<Star[]>([])
const nebulaParticles = ref<NebulaParticle[]>([])
const spaceObjects = ref<SpaceObject[]>([])
const performanceLevel = ref<'low' | 'medium' | 'high'>('medium')

// Animation
let animationFrame: number | null = null
let timeInterval: number | null = null

// Effects configuration
const effects = computed<EffectConfig>(() => {
  const planetEffects = props.planet ? getPlanetEffects(props.planet) : []
  return {
    stars: performanceLevel.value !== 'low',
    nebula: planetEffects.some(e => e.type === 'nebula') && performanceLevel.value === 'high',
    atmosphere: planetEffects.some(e => e.type === 'atmosphere'),
    objects: performanceLevel.value === 'high',
    particles: props.showParticles && performanceLevel.value !== 'low'
  }
})

const timeEffects = computed(() => props.enableTimeEffects && performanceLevel.value !== 'low')

// Computed styles
const backgroundClasses = computed(() => [
  `planet-${props.planet || 'space'}`,
  `time-${props.timeOfDay}`,
  `quality-${props.quality}`,
  `performance-${performanceLevel.value}`,
  { loading: isLoading.value }
])

const atmosphereStyle = computed(() => {
  if (!props.planet || !effects.value.atmosphere) return {}
  
  const planetEffects = getPlanetEffects(props.planet)
  const atmosphereEffect = planetEffects.find(e => e.type === 'atmosphere')
  
  if (!atmosphereEffect) return {}
  
  return {
    background: `radial-gradient(circle at center, ${atmosphereEffect.color || '#64b5f6'}${Math.round(atmosphereEffect.intensity * 51).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
    opacity: atmosphereEffect.intensity
  }
})

const dayNightStyle = computed(() => {
  if (!timeEffects.value) return {}
  
  const timeFactors = {
    dawn: { opacity: 0.3, filter: 'sepia(20%) saturate(120%) hue-rotate(10deg)' },
    day: { opacity: 0.1, filter: 'brightness(120%) saturate(110%)' },
    dusk: { opacity: 0.4, filter: 'sepia(30%) saturate(130%) hue-rotate(-10deg)' },
    night: { opacity: 0.8, filter: 'brightness(80%) saturate(90%)' }
  }
  
  return timeFactors[props.timeOfDay] || timeFactors.night
})

const stellarMotionStyle = computed(() => {
  if (!timeEffects.value) return {}
  
  const time = currentTime.value * 0.00001 // Very slow rotation
  return {
    transform: `rotate(${time}deg)`,
    transformOrigin: 'center center'
  }
})

// Methods
const initializeBackground = async () => {
  isLoading.value = true
  loadingProgress.value = 0
  emit('loading-start')
  
  // Set background through manager
  await setBackground(props.backgroundId, props.planet)
  
  // Initialize layers
  await loadBackgroundLayers()
  
  // Generate particles if needed
  if (props.showParticles) {
    generateParticles()
  }
  
  isLoading.value = false
  emit('loading-complete')
}

const loadBackgroundLayers = async () => {
  const layers: BackgroundLayer[] = []
  
  // Main background layer
  const mainUrl = getBackgroundUrl(props.backgroundId, props.quality)
  if (mainUrl) {
    layers.push({
      id: 'main',
      url: mainUrl,
      alt: 'Main Background',
      loaded: false,
      priority: 1,
      parallaxFactor: 1,
      opacity: 1
    })
  }
  
  // Planet-specific overlay
  if (props.planet) {
    const planetUrl = getBackgroundUrl(`${props.backgroundId}-${props.planet}`, props.quality)
    if (planetUrl) {
      layers.push({
        id: 'planet',
        url: planetUrl,
        alt: `${props.planet} Background`,
        loaded: false,
        priority: 2,
        parallaxFactor: 0.8,
        opacity: 0.7
      })
    }
  }
  
  activeLayers.value = layers
  
  // Load layers progressively
  for (let i = 0; i < layers.length; i++) {
    await loadLayer(i)
    loadingProgress.value = ((i + 1) / layers.length) * 100
    emit('loading-progress', loadingProgress.value)
  }
}

const loadLayer = async (index: number): Promise<void> => {
  const layer = activeLayers.value[index]
  if (!layer) return
  
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      layer.loaded = true
      emit('layer-loaded', index)
      resolve()
    }
    
    img.onerror = () => {
      logger.warn(`Failed to load layer: ${layer.url}`)
      resolve() // Continue with other layers
    }
    
    img.src = layer.url
  })
}

const generateParticles = () => {
  generateStars()
  if (effects.value.nebula) generateNebula()
  if (effects.value.objects) generateSpaceObjects()
}

const generateStars = () => {
  const count = Math.min(props.maxParticles * 0.8, 400)
  visibleStars.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    z: Math.random() * 1000,
    type: ['normal', 'bright', 'distant'][Math.floor(Math.random() * 3)] as any,
    size: Math.random() * 3 + 0.5,
    brightness: Math.random() * 0.8 + 0.2,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    color: ['#ffffff', '#ffffcc', '#ccccff', '#ffcccc'][Math.floor(Math.random() * 4)]
  }))
}

const generateNebula = () => {
  const count = Math.min(props.maxParticles * 0.15, 75)
  nebulaParticles.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 1500,
    y: (Math.random() - 0.5) * 1500,
    z: Math.random() * 500,
    size: Math.random() * 30 + 10,
    color: `hsl(${Math.random() * 60 + 240}, 70%, ${Math.random() * 30 + 35}%)`,
    opacity: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.3 + 0.1,
    direction: Math.random() * Math.PI * 2
  }))
}

const generateSpaceObjects = () => {
  const count = Math.min(props.maxParticles * 0.05, 25)
  spaceObjects.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    type: ['asteroid', 'debris', 'ship', 'satellite'][Math.floor(Math.random() * 4)] as any,
    x: (Math.random() - 0.5) * 3000,
    y: (Math.random() - 0.5) * 3000,
    z: Math.random() * 1500,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 2 + 0.5,
    scale: Math.random() * 0.8 + 0.3
  }))
}

// Style getters
const getLayerStyle = (layer: BackgroundLayer, index: number) => ({
  opacity: layer.opacity,
  zIndex: 10 - layer.priority,
  mixBlendMode: layer.blendMode || 'normal'
})

const getPlaceholderStyle = (layer: BackgroundLayer) => ({
  background: 'linear-gradient(135deg, #1a1a3a 0%, #2a2a5a 100%)',
  opacity: 0.5
})

const getStarStyle = (star: Star) => {
  const time = currentTime.value * 0.001
  const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7
  
  return {
    left: `${50 + star.x / 40}%`,
    top: `${50 + star.y / 40}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    backgroundColor: star.color,
    opacity: star.brightness * twinkle,
    transform: `translateZ(${star.z}px)`,
    boxShadow: star.type === 'bright' ? `0 0 ${star.size * 2}px ${star.color}` : 'none'
  }
}

const getNebulaStyle = (particle: NebulaParticle) => ({
  left: `${50 + particle.x / 50}%`,
  top: `${50 + particle.y / 50}%`,
  width: `${particle.size}px`,
  height: `${particle.size}px`,
  backgroundColor: particle.color,
  opacity: particle.opacity,
  transform: `translateZ(${particle.z}px)`
})

const getObjectStyle = (object: SpaceObject) => ({
  left: `${50 + object.x / 60}%`,
  top: `${50 + object.y / 60}%`,
  transform: `translateZ(${object.z}px) rotate(${object.rotation}deg) scale(${object.scale})`
})

// Event handlers
const onLayerLoad = (index: number) => {
  logger.log(`Background layer ${index} loaded`)
}

const onLayerError = (index: number) => {
  logger.error(`Background layer ${index} failed to load`)
}

// Performance optimization
const optimizePerformance = () => {
  if (!props.autoOptimize) return
  
  const { deviceMemory, hardwareConcurrency } = navigator as any
  let level: 'low' | 'medium' | 'high' = 'medium'
  
  if (deviceMemory && deviceMemory < 4) {
    level = 'low'
  } else if (deviceMemory && deviceMemory > 8 && hardwareConcurrency > 4) {
    level = 'high'
  }
  
  performanceLevel.value = level
  emit('optimization-change', level)
}

// Animation loop
const startAnimation = () => {
  const animate = () => {
    currentTime.value = Date.now()
    
    // Update particles
    if (effects.value.objects) {
      spaceObjects.value.forEach(object => {
        object.rotation += object.rotationSpeed
        if (object.rotation >= 360) object.rotation -= 360
      })
    }
    
    animationFrame = requestAnimationFrame(animate)
  }
  
  animationFrame = requestAnimationFrame(animate)
}

// Watchers
watch([() => props.backgroundId, () => props.planet], () => {
  initializeBackground()
})

watch(() => props.quality, () => {
  initializeBackground()
})

// Lifecycle
onMounted(() => {
  optimizePerformance()
  initializeBackground()
  startAnimation()
  
  // Update time every second for time effects
  if (timeEffects.value) {
    timeInterval = window.setInterval(() => {
      currentTime.value = Date.now()
    }, 1000)
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dynamic-background {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

/* Background Layers */
.background-layers {
  position: absolute;
  inset: 0;
}

.background-layer {
  position: absolute;
  inset: 0;
  transition: opacity 1s ease;
}

.layer-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.layer-placeholder {
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease;
}

/* Particle Systems */
.particle-systems {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star-field {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

.star-bright {
  animation-duration: 2s;
}

.star-distant {
  animation-duration: 4s;
  opacity: 0.6;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.nebula-system {
  position: absolute;
  inset: 0;
}

.nebula-particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(8px);
  animation: nebula-drift 20s linear infinite;
}

@keyframes nebula-drift {
  0% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(10px) translateY(-5px); }
  50% { transform: translateX(-5px) translateY(-10px); }
  75% { transform: translateX(-10px) translateY(5px); }
  100% { transform: translateX(0) translateY(0); }
}

.atmosphere {
  position: absolute;
  inset: 0;
}

.atmosphere-layer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  filter: blur(20px);
}

.space-objects {
  position: absolute;
  inset: 0;
}

.space-object {
  position: absolute;
  width: 20px;
  height: 20px;
}

.object-asteroid {
  background: radial-gradient(circle, #8b7355 0%, #5d4e37 100%);
  border-radius: 30% 70% 70% 30%;
}

.object-debris {
  background: linear-gradient(45deg, #666 0%, #333 100%);
  clip-path: polygon(20% 0%, 80% 20%, 100% 60%, 80% 100%, 20% 80%, 0% 40%);
}

.object-ship {
  background: linear-gradient(45deg, #64b5f6 0%, #2196f3 100%);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.object-satellite {
  background: linear-gradient(45deg, #ffd700 0%, #ffa500 100%);
  border-radius: 20%;
}

/* Time Overlays */
.time-overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.day-night-cycle {
  position: absolute;
  inset: 0;
  transition: all 2s ease;
}

.stellar-motion {
  position: absolute;
  inset: 0;
  transition: transform 60s linear;
}

/* Loading */
.loading-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.progress-bar {
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #64b5f6, #2196f3);
  transition: width 0.3s ease;
}

.loading-text {
  color: #64b5f6;
  text-align: center;
  font-size: 0.9rem;
}

/* Performance Optimizations */
.performance-low .star {
  animation: none;
}

.performance-low .nebula-particle {
  display: none;
}

.performance-low .space-object {
  display: none;
}

/* Quality Adjustments */
.quality-mobile .particle-systems {
  transform: scale(0.7);
}

.quality-4k .particle-systems {
  transform: scale(1.2);
}

/* Planet-specific styles */
.planet-sound-planet .atmosphere {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
}

.planet-word-planet .atmosphere {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
}

.planet-grammar-planet .atmosphere {
  background: radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, transparent 70%);
}

/* Responsive */
@media (max-width: 768px) {
  .progress-bar {
    width: 250px;
  }
  
  .loading-text {
    font-size: 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>