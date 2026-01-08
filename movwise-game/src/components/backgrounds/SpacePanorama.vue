<template>
  <div 
    ref="panoramaContainer"
    class="space-panorama"
    :class="{ 'vr-mode': vrMode, 'loading': isLoading }"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @wheel="handleWheel"
  >
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">宇宙空間を読み込み中... {{ loadingProgress }}%</div>
    </div>

    <!-- Panorama Viewer -->
    <div 
      ref="panoramaViewer"
      class="panorama-viewer"
      :style="viewerStyle"
    >
      <!-- Background Image Layers -->
      <div 
        v-for="(layer, index) in backgroundLayers"
        :key="index"
        class="background-layer"
        :class="`layer-${index}`"
        :style="getLayerStyle(layer, index)"
      >
        <img 
          v-if="layer.loaded"
          :src="layer.src"
          :alt="layer.alt"
          class="panorama-image"
          @load="onImageLoad(index)"
          @error="onImageError(index)"
        />
      </div>

      <!-- Particle Systems -->
      <div class="particle-container">
        <!-- Stars -->
        <div 
          v-for="star in stars"
          :key="`star-${star.id}`"
          class="star"
          :style="getStarStyle(star)"
        ></div>

        <!-- Nebula Particles -->
        <div 
          v-for="particle in nebulaParticles"
          :key="`nebula-${particle.id}`"
          class="nebula-particle"
          :style="getParticleStyle(particle)"
        ></div>

        <!-- Moving Objects -->
        <div 
          v-for="object in movingObjects"
          :key="`object-${object.id}`"
          class="space-object"
          :class="`object-${object.type}`"
          :style="getObjectStyle(object)"
        ></div>
      </div>

      <!-- Planet-specific Overlays -->
      <div v-if="currentPlanet" class="planet-overlay">
        <div 
          class="planet-atmosphere"
          :style="getPlanetAtmosphereStyle()"
        ></div>
        <div 
          class="planet-effects"
          :style="getPlanetEffectsStyle()"
        ></div>
      </div>
    </div>

    <!-- Controls -->
    <div class="panorama-controls" v-if="showControls">
      <button @click="resetView" class="control-button reset-btn">
        <span class="icon">🎯</span>
        リセット
      </button>
      <button @click="toggleVRMode" class="control-button vr-btn">
        <span class="icon">🥽</span>
        VRモード
      </button>
      <button @click="toggleAutoRotate" class="control-button auto-btn">
        <span class="icon">{{ autoRotate ? '⏸️' : '▶️' }}</span>
        自動回転
      </button>
    </div>

    <!-- VR Crosshair -->
    <div v-if="vrMode" class="vr-crosshair">
      <div class="crosshair-dot"></div>
    </div>

    <!-- Debug Info -->
    <div v-if="showDebug" class="debug-info">
      <div>視点: X: {{ Math.round(rotation.x) }}°, Y: {{ Math.round(rotation.y) }}°</div>
      <div>ズーム: {{ Math.round(zoom * 100) }}%</div>
      <div>惑星: {{ currentPlanet || '宇宙空間' }}</div>
      <div>パフォーマンス: {{ fps }}fps</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Types
interface BackgroundLayer {
  src: string
  alt: string
  loaded: boolean
  parallaxFactor: number
  opacity: number
}

interface Star {
  id: number
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
}

interface Particle {
  id: number
  x: number
  y: number
  z: number
  size: number
  color: string
  speed: number
  direction: number
}

interface SpaceObject {
  id: number
  type: 'asteroid' | 'debris' | 'ship'
  x: number
  y: number
  z: number
  rotation: number
  speed: number
}

// Props
interface Props {
  planet?: string
  vrMode?: boolean
  autoRotate?: boolean
  showControls?: boolean
  showDebug?: boolean
  quality?: 'mobile' | 'desktop' | '4k'
}

const props = withDefaults(defineProps<Props>(), {
  planet: undefined,
  vrMode: false,
  autoRotate: false,
  showControls: true,
  showDebug: false,
  quality: 'desktop'
})

// Emits
const emit = defineEmits<{
  'view-changed': [rotation: { x: number; y: number }, zoom: number]
  'planet-changed': [planet: string | undefined]
  'vr-mode-changed': [enabled: boolean]
}>()

// Refs
const panoramaContainer = ref<HTMLElement>()
const panoramaViewer = ref<HTMLElement>()

// State
const isLoading = ref(true)
const loadingProgress = ref(0)
const rotation = ref({ x: 0, y: 0 })
const zoom = ref(1)
const isDragging = ref(false)
const lastPointer = ref({ x: 0, y: 0 })
const currentPlanet = ref<string>()
const fps = ref(0)

// Background Management
const backgroundLayers = ref<BackgroundLayer[]>([])
const stars = ref<Star[]>([])
const nebulaParticles = ref<Particle[]>([])
const movingObjects = ref<SpaceObject[]>([])

// Animation
let animationId: number | null = null
let lastFrameTime = 0
let frameCount = 0

// Computed
const viewerStyle = computed(() => ({
  transform: `rotateX(${rotation.value.y}deg) rotateY(${rotation.value.x}deg) scale(${zoom.value})`
}))

// Methods
const initializeBackgrounds = async () => {
  const quality = props.quality
  const basePath = `/src/assets/backgrounds/${quality}`
  
  // Load main space panorama
  const mainLayer: BackgroundLayer = {
    src: `${basePath}/space-panorama.webp`,
    alt: 'Space Panorama',
    loaded: false,
    parallaxFactor: 1,
    opacity: 1
  }
  
  // Load planet-specific backgrounds
  if (props.planet) {
    const planetLayer: BackgroundLayer = {
      src: `${basePath}/planets/${props.planet}-panorama.webp`,
      alt: `${props.planet} Panorama`,
      loaded: false,
      parallaxFactor: 0.8,
      opacity: 0.7
    }
    backgroundLayers.value = [mainLayer, planetLayer]
  } else {
    backgroundLayers.value = [mainLayer]
  }
  
  // Start progressive loading
  await loadBackgroundsProgressively()
}

const loadBackgroundsProgressively = async () => {
  let loaded = 0
  const total = backgroundLayers.value.length
  
  for (const layer of backgroundLayers.value) {
    try {
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          layer.loaded = true
          loaded++
          loadingProgress.value = Math.round((loaded / total) * 100)
          resolve(img)
        }
        img.onerror = reject
        img.src = layer.src
      })
    } catch (error) {
      logger.warn(`Failed to load background: ${layer.src}`)
      loaded++
      loadingProgress.value = Math.round((loaded / total) * 100)
    }
  }
  
  isLoading.value = false
  generateParticles()
  startAnimation()
}

const generateParticles = () => {
  // Generate stars
  stars.value = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
    z: (Math.random() - 0.5) * 2000,
    size: Math.random() * 3 + 1,
    brightness: Math.random(),
    twinkleSpeed: Math.random() * 0.02 + 0.01
  }))
  
  // Generate nebula particles
  nebulaParticles.value = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 1500,
    y: (Math.random() - 0.5) * 1500,
    z: (Math.random() - 0.5) * 1500,
    size: Math.random() * 20 + 5,
    color: `hsl(${Math.random() * 60 + 240}, 70%, 50%)`,
    speed: Math.random() * 0.5 + 0.1,
    direction: Math.random() * Math.PI * 2
  }))
  
  // Generate moving objects
  movingObjects.value = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    type: ['asteroid', 'debris', 'ship'][Math.floor(Math.random() * 3)] as any,
    x: (Math.random() - 0.5) * 3000,
    y: (Math.random() - 0.5) * 3000,
    z: (Math.random() - 0.5) * 3000,
    rotation: 0,
    speed: Math.random() * 2 + 0.5
  }))
}

const getLayerStyle = (layer: BackgroundLayer, index: number) => {
  const parallax = (rotation.value.x * layer.parallaxFactor) / 10
  return {
    transform: `rotateY(${parallax}deg)`,
    opacity: layer.opacity,
    zIndex: 10 - index
  }
}

const getStarStyle = (star: Star) => {
  const time = Date.now() * 0.001
  const twinkle = Math.sin(time * star.twinkleSpeed) * 0.5 + 0.5
  const brightness = star.brightness * twinkle
  
  return {
    left: `${50 + star.x / 20}%`,
    top: `${50 + star.y / 20}%`,
    width: `${star.size}px`,
    height: `${star.size}px`,
    opacity: brightness,
    transform: `translateZ(${star.z}px)`
  }
}

const getParticleStyle = (particle: Particle) => {
  return {
    left: `${50 + particle.x / 30}%`,
    top: `${50 + particle.y / 30}%`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    transform: `translateZ(${particle.z}px)`
  }
}

const getObjectStyle = (object: SpaceObject) => {
  return {
    left: `${50 + object.x / 50}%`,
    top: `${50 + object.y / 50}%`,
    transform: `translateZ(${object.z}px) rotate(${object.rotation}deg)`
  }
}

const getPlanetAtmosphereStyle = () => {
  if (!currentPlanet.value) return {}
  
  const atmosphereColors: Record<string, string> = {
    'earth': 'radial-gradient(circle, rgba(135, 206, 235, 0.3) 0%, transparent 70%)',
    'mars': 'radial-gradient(circle, rgba(205, 92, 92, 0.2) 0%, transparent 70%)',
    'venus': 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)'
  }
  
  return {
    background: atmosphereColors[currentPlanet.value] || atmosphereColors.earth
  }
}

const getPlanetEffectsStyle = () => {
  // Planet-specific visual effects
  return {}
}

// Event Handlers
const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  lastPointer.value = { x: event.clientX, y: event.clientY }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastPointer.value.x
  const deltaY = event.clientY - lastPointer.value.y
  
  rotation.value.x += deltaX * 0.5
  rotation.value.y -= deltaY * 0.5
  
  // Clamp Y rotation
  rotation.value.y = Math.max(-90, Math.min(90, rotation.value.y))
  
  lastPointer.value = { x: event.clientX, y: event.clientY }
  
  emit('view-changed', rotation.value, zoom.value)
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0]
    isDragging.value = true
    lastPointer.value = { x: touch.clientX, y: touch.clientY }
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || event.touches.length !== 1) return
  
  event.preventDefault()
  const touch = event.touches[0]
  const deltaX = touch.clientX - lastPointer.value.x
  const deltaY = touch.clientY - lastPointer.value.y
  
  rotation.value.x += deltaX * 0.5
  rotation.value.y -= deltaY * 0.5
  rotation.value.y = Math.max(-90, Math.min(90, rotation.value.y))
  
  lastPointer.value = { x: touch.clientX, y: touch.clientY }
  emit('view-changed', rotation.value, zoom.value)
}

const handleTouchEnd = () => {
  isDragging.value = false
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.5, Math.min(3, zoom.value * delta))
  emit('view-changed', rotation.value, zoom.value)
}

// Controls
const resetView = () => {
  rotation.value = { x: 0, y: 0 }
  zoom.value = 1
  emit('view-changed', rotation.value, zoom.value)
}

const toggleVRMode = () => {
  emit('vr-mode-changed', !props.vrMode)
}

const toggleAutoRotate = () => {
  // Auto rotation logic would be handled by parent
}

// Animation Loop
const startAnimation = () => {
  const animate = (timestamp: number) => {
    if (lastFrameTime) {
      frameCount++
      if (timestamp - lastFrameTime >= 1000) {
        fps.value = Math.round((frameCount * 1000) / (timestamp - lastFrameTime))
        frameCount = 0
        lastFrameTime = timestamp
      }
    } else {
      lastFrameTime = timestamp
    }
    
    // Update particles
    updateParticles()
    
    // Auto rotation
    if (props.autoRotate) {
      rotation.value.x += 0.1
    }
    
    animationId = requestAnimationFrame(animate)
  }
  
  animationId = requestAnimationFrame(animate)
}

const updateParticles = () => {
  // Update moving objects
  movingObjects.value.forEach(object => {
    object.rotation += object.speed
    if (object.rotation >= 360) object.rotation -= 360
  })
  
  // Update nebula particles
  nebulaParticles.value.forEach(particle => {
    particle.x += Math.cos(particle.direction) * particle.speed
    particle.y += Math.sin(particle.direction) * particle.speed
    
    // Wrap around
    if (Math.abs(particle.x) > 750) particle.x = -particle.x
    if (Math.abs(particle.y) > 750) particle.y = -particle.y
  })
}

// Image Loading Events
const onImageLoad = (index: number) => {
  logger.log(`Background layer ${index} loaded`)
}

const onImageError = (index: number) => {
  logger.error(`Failed to load background layer ${index}`)
}

// Watchers
watch(() => props.planet, (newPlanet) => {
  currentPlanet.value = newPlanet
  emit('planet-changed', newPlanet)
  initializeBackgrounds()
})

// Lifecycle
onMounted(() => {
  initializeBackgrounds()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.space-panorama {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
  cursor: grab;
  user-select: none;
}

.space-panorama:active {
  cursor: grabbing;
}

.space-panorama.vr-mode {
  cursor: none;
}

/* Loading */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 80px;
  height: 80px;
  border: 3px solid rgba(100, 181, 246, 0.2);
  border-top: 3px solid #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #64b5f6;
  font-size: 1.2rem;
  text-align: center;
}

/* Panorama Viewer */
.panorama-viewer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.background-layer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.panorama-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-style: preserve-3d;
}

/* Particles */
.particle-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform-style: preserve-3d;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.nebula-particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
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

/* Planet Overlays */
.planet-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.planet-atmosphere,
.planet-effects {
  position: absolute;
  inset: 0;
}

/* Controls */
.panorama-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(100, 181, 246, 0.5);
  color: #64b5f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.control-button:hover {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

.control-button .icon {
  font-size: 1.2rem;
}

/* VR Mode */
.vr-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  pointer-events: none;
}

.crosshair-dot {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* Debug Info */
.debug-info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #64b5f6;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 0.8rem;
  z-index: 100;
}

.debug-info div {
  margin-bottom: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .panorama-controls {
    top: auto;
    bottom: 20px;
    right: 20px;
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .control-button {
    font-size: 0.8rem;
    padding: 8px 12px;
  }
  
  .debug-info {
    font-size: 0.7rem;
    padding: 5px;
  }
}

/* Performance Optimizations */
.space-panorama.loading * {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>