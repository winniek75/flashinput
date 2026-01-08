<template>
  <div class="galaxy-map-container" ref="galaxyContainer">
    <!-- 3D宇宙空間背景 -->
    <div class="space-background">
      <!-- 星空背景レイヤー -->
      <div class="stars-layer stars-far"></div>
      <div class="stars-layer stars-mid"></div>
      <div class="stars-layer stars-near"></div>
      
      <!-- 銀河雲エフェクト -->
      <div class="nebula-effect nebula-1"></div>
      <div class="nebula-effect nebula-2"></div>
      <div class="nebula-effect nebula-3"></div>
    </div>

    <!-- VRモードインジケーター -->
    <div class="vr-mode-indicator" v-if="isVRCapable" :class="{ active: vrModePreview }">
      <div class="vr-icon">🥽</div>
      <div class="vr-status">VR Ready: {{ playerVRReadiness }}%</div>
    </div>

    <!-- 3D宇宙マップ -->
    <div 
      class="galaxy-3d-space" 
      :class="{
        'vr-preview-mode': vrModePreview,
        'transitioning': isTransitioning,
        'planet-focused': focusedPlanet
      }"
      :style="spaceTransform"
      @wheel="handleZoom"
      @mousedown="startPan"
      @mousemove="handlePan"
      @mouseup="endPan"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 中央の恒星 -->
      <div class="central-star webxr-interactable" data-webxr-id="central-star">
        <div class="star-core">⭐</div>
        <div class="star-corona"></div>
        <div class="star-rays"></div>
      </div>

      <!-- 7つの学習惑星 -->
      <div
        v-for="(planet, index) in galaxyPlanets"
        :key="planet.id"
        class="planet-orbit webxr-orbit"
        :data-planet-id="planet.id"
        :style="getPlanetOrbitStyle(planet, index)"
      >
        <div
          class="planet webxr-interactable"
          :class="[
            `planet-${planet.id}`,
            {
              'planet-locked': !planet.unlocked,
              'planet-current': planet.id === currentPlanet,
              'planet-completed': planet.completed,
              'planet-vr-ready': planet.vrReady,
              'planet-focused': focusedPlanet === planet.id
            }
          ]"
          :data-webxr-id="`planet-${planet.id}`"
          :style="getPlanetStyle(planet, index)"
          @click="selectPlanet(planet)"
          @mouseenter="(e) => showPlanetPreview(planet, e)"
          @mouseleave="() => hidePlanetPreview(planet)"
        >
          <!-- 惑星本体 -->
          <div class="planet-surface">
            <div class="planet-emoji">{{ planet.emoji }}</div>
            <div class="planet-atmosphere"></div>
          </div>

          <!-- 進捗リング -->
          <div class="progress-ring" v-if="planet.unlocked">
            <svg class="progress-ring-svg" width="100" height="100">
              <circle
                class="progress-ring-background"
                cx="50" cy="50" r="45"
                fill="transparent"
                stroke="rgba(255,255,255,0.2)"
                stroke-width="2"
              />
              <circle
                class="progress-ring-progress"
                cx="50" cy="50" r="45"
                fill="transparent"
                :stroke="planet.progressColor"
                stroke-width="3"
                :stroke-dasharray="progressCircumference"
                :stroke-dashoffset="getProgressOffset(planet.progress)"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <!-- クリスタル表示 -->
          <div class="crystal-indicator" v-if="planet.crystals > 0">
            <div class="crystal-icon">💎</div>
            <div class="crystal-count">{{ planet.crystals }}</div>
          </div>

          <!-- VR準備度インジケーター -->
          <div class="vr-readiness-indicator" v-if="planet.vrReady">
            <div class="vr-ready-badge">VR</div>
          </div>

          <!-- ロック状態 -->
          <div class="lock-overlay" v-if="!planet.unlocked">
            <div class="lock-icon">🔒</div>
            <div class="unlock-requirement">{{ planet.unlockRequirement }}</div>
          </div>

          <!-- 現在地マーカー -->
          <div class="current-location-marker" v-if="planet.id === currentPlanet">
            <div class="marker-ring"></div>
            <div class="marker-pulse"></div>
          </div>

          <!-- 惑星名ラベル -->
          <div class="planet-label">
            <div class="planet-name">{{ planet.name }}</div>
            <div class="planet-subtitle" v-if="planet.subtitle">{{ planet.subtitle }}</div>
          </div>
        </div>

        <!-- 軌道パス -->
        <div class="orbit-path" :style="getOrbitPathStyle(index)"></div>
      </div>

      <!-- 接続線（惑星間の学習パス） -->
      <svg class="learning-paths" v-if="!vrModePreview">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgba(138,43,226,0.3);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
          </linearGradient>
        </defs>
        <path
          v-for="path in learningPaths"
          :key="`path-${path.from}-${path.to}`"
          :d="path.d"
          stroke="url(#pathGradient)"
          stroke-width="2"
          fill="none"
          class="learning-path"
          :class="{ active: path.active }"
        />
      </svg>
    </div>

    <!-- 惑星プレビューポータル -->
    <PlanetPreview
      v-if="previewPlanet"
      :planet="previewPlanet"
      :position="previewPosition"
      @close="hidePlanetPreview"
    />

    <!-- VRプレビューポータル -->
    <VRPreviewPortal
      v-if="vrModePreview"
      :planet="focusedPlanet"
      @exit-vr-preview="exitVRPreview"
    />

    <!-- ナビゲーションコントロール -->
    <div class="navigation-controls">
      <!-- ズームコントロール -->
      <div class="zoom-controls">
        <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= maxZoom">
          <div class="icon">🔍</div>
          <div class="label">Zoom In</div>
        </button>
        <div class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</div>
        <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= minZoom">
          <div class="icon">🔍</div>
          <div class="label">Zoom Out</div>
        </button>
      </div>

      <!-- Enhanced VRモード切替 -->
      <div class="vr-controls" v-if="isVRCapable">
        <button
          class="vr-toggle-btn"
          :class="{ 
            active: vrModePreview,
            'high-readiness': playerVRReadiness >= 70,
            'medium-readiness': playerVRReadiness >= 40,
            'low-readiness': playerVRReadiness < 40
          }"
          @click="toggleVRPreview"
        >
          <div class="vr-icon">🥽</div>
          <div class="vr-label">{{ vrModePreview ? 'Exit VR Preview' : 'VR Preview' }}</div>
          <div class="vr-readiness-bar">
            <div 
              class="readiness-fill" 
              :style="{ width: playerVRReadiness + '%' }"
            ></div>
          </div>
          <div class="vr-status-text">{{ playerVRReadiness }}% Ready</div>
        </button>
        
        <!-- VR Quick Actions -->
        <div class="vr-quick-actions" v-if="vrModePreview">
          <button class="quick-action-btn" @click="centerOnCurrentPlanet">
            <div class="icon">🎯</div>
            <div class="tooltip">Center on current planet</div>
          </button>
          <button class="quick-action-btn" @click="toggleVRHands">
            <div class="icon">👋</div>
            <div class="tooltip">Toggle hand tracking</div>
          </button>
        </div>
      </div>

      <!-- リセットビュー -->
      <button class="reset-view-btn" @click="resetView">
        <div class="icon">🎯</div>
        <div class="label">Reset View</div>
      </button>
    </div>

    <!-- 学習進歩インジケーター -->
    <div class="learning-progress-panel">
      <div class="progress-title">Learning Journey</div>
      <div class="overall-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
        <div class="progress-text">{{ overallProgress }}% Complete</div>
      </div>
      
      <div class="planet-summary">
        <div
          v-for="planet in galaxyPlanets.filter(p => p.unlocked)"
          :key="`summary-${planet.id}`"
          class="planet-summary-item"
          :class="{ current: planet.id === currentPlanet }"
        >
          <div class="planet-emoji-small">{{ planet.emoji }}</div>
          <div class="planet-progress-small">{{ planet.progress }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import PlanetPreview from './PlanetPreview.vue'
import VRPreviewPortal from './VRPreviewPortal.vue'

const router = useRouter()
const playerProfileStore = usePlayerProfileStore()

// VR対応状態
const isVRCapable = ref(false)
const vrModePreview = ref(false)

// 3D空間制御
const galaxyContainer = ref(null)
const zoomLevel = ref(1.0)
const minZoom = 0.5
const maxZoom = 2.0
const rotationX = ref(0)
const rotationY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)

// インタラクション状態
const isPanning = ref(false)
const lastPanPosition = ref({ x: 0, y: 0 })
const isTransitioning = ref(false)
const focusedPlanet = ref(null)
const previewPlanet = ref(null)
const previewPosition = ref({ x: 0, y: 0 })

// Enhanced animation states
const orbitAnimationTime = ref(0)
const planetHoverStates = ref({})
const springAnimations = ref({})
const transitionDuration = 1200

// タッチ操作
const touches = ref([])
const lastTouchDistance = ref(0)

// 惑星設定
const galaxyPlanets = computed(() => [
  {
    id: 'soundPlanet',
    name: 'Sound Planet',
    subtitle: 'Phonics Foundation',
    emoji: '🔊',
    unlocked: true,
    completed: playerProfileStore.profile.skills.phonics >= 80,
    progress: playerProfileStore.profile.skills.phonics,
    crystals: playerProfileStore.profile.crystals.sound,
    progressColor: '#00ff88',
    vrReady: playerProfileStore.profile.vrReadiness.foundation >= 30,
    unlockRequirement: 'Always Available',
    position: { x: 0, y: -200, z: 0 },
    orbitRadius: 200,
    orbitSpeed: 0.5
  },
  {
    id: 'wordPlanet',
    name: 'Word Planet',
    subtitle: 'Vocabulary Mastery',
    emoji: '📚',
    unlocked: playerProfileStore.profile.skills.phonics >= 20,
    completed: playerProfileStore.profile.skills.vocabulary >= 80,
    progress: playerProfileStore.profile.skills.vocabulary,
    crystals: playerProfileStore.profile.crystals.word,
    progressColor: '#3b82f6',
    vrReady: playerProfileStore.profile.vrReadiness.intermediate >= 40,
    unlockRequirement: 'Phonics 20+',
    position: { x: 180, y: -120, z: 50 },
    orbitRadius: 250,
    orbitSpeed: 0.4
  },
  {
    id: 'grammarPlanet',
    name: 'Grammar Planet',
    subtitle: 'Structure & Rules',
    emoji: '⚙️',
    unlocked: playerProfileStore.profile.skills.vocabulary >= 20,
    completed: playerProfileStore.profile.skills.grammar >= 80,
    progress: playerProfileStore.profile.skills.grammar,
    crystals: playerProfileStore.profile.crystals.grammar,
    progressColor: '#8b5cf6',
    vrReady: playerProfileStore.profile.vrReadiness.intermediate >= 50,
    unlockRequirement: 'Vocabulary 20+',
    position: { x: 120, y: 160, z: -30 },
    orbitRadius: 300,
    orbitSpeed: 0.3
  },
  {
    id: 'rhythmPlanet',
    name: 'Rhythm Planet',
    subtitle: 'Music & Pronunciation',
    emoji: '🎵',
    unlocked: playerProfileStore.profile.skills.grammar >= 20,
    completed: playerProfileStore.profile.skills.rhythm >= 80,
    progress: playerProfileStore.profile.skills.rhythm,
    crystals: playerProfileStore.profile.crystals.rhythm,
    progressColor: '#f59e0b',
    vrReady: playerProfileStore.profile.vrReadiness.advanced >= 30,
    unlockRequirement: 'Grammar 20+',
    position: { x: -150, y: 100, z: 80 },
    orbitRadius: 280,
    orbitSpeed: 0.6
  },
  {
    id: 'blendPlanet',
    name: 'Blend Planet',
    subtitle: 'Sound Combinations',
    emoji: '🌪️',
    unlocked: playerProfileStore.averageSkillLevel >= 30,
    completed: playerProfileStore.profile.skills.blending >= 80,
    progress: playerProfileStore.profile.skills.blending,
    crystals: playerProfileStore.profile.crystals.blend,
    progressColor: '#10b981',
    vrReady: playerProfileStore.profile.vrReadiness.advanced >= 50,
    unlockRequirement: 'Average Skill 30+',
    position: { x: -200, y: -80, z: -60 },
    orbitRadius: 350,
    orbitSpeed: 0.25
  },
  {
    id: 'patternPlanet',
    name: 'Pattern Planet',
    subtitle: 'Advanced Recognition',
    emoji: '🔮',
    unlocked: playerProfileStore.averageSkillLevel >= 50,
    completed: playerProfileStore.profile.skills.pronunciation >= 80,
    progress: playerProfileStore.profile.skills.pronunciation,
    crystals: playerProfileStore.profile.crystals.pattern,
    progressColor: '#ef4444',
    vrReady: playerProfileStore.profile.vrReadiness.master >= 30,
    unlockRequirement: 'Average Skill 50+',
    position: { x: 80, y: -180, z: 120 },
    orbitRadius: 380,
    orbitSpeed: 0.2
  },
  {
    id: 'masterPlanet',
    name: 'Master Planet',
    subtitle: 'Ultimate Challenge',
    emoji: '👑',
    unlocked: playerProfileStore.averageSkillLevel >= 70,
    completed: playerProfileStore.averageSkillLevel >= 95,
    progress: playerProfileStore.averageSkillLevel,
    crystals: playerProfileStore.profile.crystals.master,
    progressColor: '#fbbf24',
    vrReady: playerProfileStore.profile.vrReadiness.master >= 70,
    unlockRequirement: 'Average Skill 70+',
    position: { x: 0, y: 0, z: -200 },
    orbitRadius: 420,
    orbitSpeed: 0.15
  }
])

const currentPlanet = computed(() => playerProfileStore.profile.currentPlanet)
const playerVRReadiness = computed(() => playerProfileStore.overallVRReadiness)

// 進捗関連の計算
const progressCircumference = 2 * Math.PI * 45
const overallProgress = computed(() => {
  const unlockedPlanets = galaxyPlanets.value.filter(p => p.unlocked)
  if (unlockedPlanets.length === 0) return 0
  const totalProgress = unlockedPlanets.reduce((sum, planet) => sum + planet.progress, 0)
  return Math.round(totalProgress / unlockedPlanets.length)
})

// 学習パスの計算
const learningPaths = computed(() => {
  const paths = []
  const unlockedPlanets = galaxyPlanets.value.filter(p => p.unlocked)
  
  for (let i = 0; i < unlockedPlanets.length - 1; i++) {
    const from = unlockedPlanets[i]
    const to = unlockedPlanets[i + 1]
    
    if (to.unlocked) {
      paths.push({
        from: from.id,
        to: to.id,
        d: createPathBetweenPlanets(from, to),
        active: from.completed && to.unlocked
      })
    }
  }
  
  return paths
})

// 3D変換の計算
const spaceTransform = computed(() => {
  return {
    transform: `
      scale(${zoomLevel.value})
      rotateX(${rotationX.value}deg)
      rotateY(${rotationY.value}deg)
      translateX(${offsetX.value}px)
      translateY(${offsetY.value}px)
      perspective(1000px)
    `,
    transformStyle: 'preserve-3d'
  }
})

// 惑星軌道スタイル
const getPlanetOrbitStyle = (planet, index) => {
  const angle = (Date.now() * planet.orbitSpeed * 0.001) % (2 * Math.PI)
  const x = Math.cos(angle) * planet.orbitRadius
  const z = Math.sin(angle) * planet.orbitRadius * 0.3 // 楕円軌道
  
  return {
    transform: `translate3d(${x}px, ${planet.position.y}px, ${z}px)`,
    transformStyle: 'preserve-3d'
  }
}

// 惑星スタイル
const getPlanetStyle = (planet, index) => {
  const hoverScale = focusedPlanet.value === planet.id ? 1.2 : 1.0
  const completedGlow = planet.completed ? 'drop-shadow(0 0 20px rgba(255,215,0,0.8))' : ''
  
  return {
    transform: `scale(${hoverScale}) rotateY(${Date.now() * 0.02}deg)`,
    filter: completedGlow,
    zIndex: focusedPlanet.value === planet.id ? 10 : 1
  }
}

// 軌道パススタイル
const getOrbitPathStyle = (index) => {
  const opacity = vrModePreview.value ? 0.1 : 0.3
  return {
    opacity,
    animationDelay: `${index * 0.5}s`
  }
}

// 進捗オフセット計算
const getProgressOffset = (progress) => {
  return progressCircumference - (progress / 100) * progressCircumference
}

// パス作成関数
const createPathBetweenPlanets = (from, to) => {
  const fromPos = from.position
  const toPos = to.position
  const midX = (fromPos.x + toPos.x) / 2
  const midY = (fromPos.y + toPos.y) / 2 - 50 // 弧を作るために中点を上げる
  
  return `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`
}

// イベントハンドラー
const selectPlanet = (planet) => {
  if (!planet.unlocked || isTransitioning.value) return
  
  isTransitioning.value = true
  focusedPlanet.value = planet.id
  
  // VRプレビューモードの場合
  if (vrModePreview.value) {
    animateVRTransition(planet)
    setTimeout(() => {
      isTransitioning.value = false
    }, 1000)
    return
  }
  
  // Enhanced planet selection animation
  animateTowardsPlanet(planet)
  
  // 通常モードの場合、該当する学習画面に遷移
  setTimeout(() => {
    playerProfileStore.updateProfile({ currentPlanet: planet.id })
    router.push({ name: getPlanetRoute(planet.id) })
    isTransitioning.value = false
  }, transitionDuration)
}

// Smooth animation towards selected planet
const animateTowardsPlanet = (planet) => {
  const targetZoom = 2.2
  const startZoom = zoomLevel.value
  const startOffsetX = offsetX.value
  const startOffsetY = offsetY.value
  const targetOffsetX = 0
  const targetOffsetY = 0
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / transitionDuration, 1)
    
    // Cubic ease-out for smooth transition
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    // Animate zoom and pan
    zoomLevel.value = startZoom + (targetZoom - startZoom) * easeProgress
    offsetX.value = startOffsetX + (targetOffsetX - startOffsetX) * easeProgress
    offsetY.value = startOffsetY + (targetOffsetY - startOffsetY) * easeProgress
    
    // Add subtle rotation effect
    rotationY.value = Math.sin(progress * Math.PI) * 8
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      rotationY.value = 0
    }
  }
  
  animate()
}

// VR transition animation
const animateVRTransition = (planet) => {
  const startTime = Date.now()
  const duration = 800
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = progress * (2 - progress) // ease-out-quad
    
    // Create VR entrance effect
    rotationX.value = Math.sin(progress * Math.PI * 2) * 5
    rotationY.value = Math.cos(progress * Math.PI * 2) * 5
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

const getPlanetRoute = (planetId) => {
  const routeMap = {
    soundPlanet: 'phonics-adventure',
    wordPlanet: 'vocabulary-hub',
    grammarPlanet: 'grammar-galaxy-hub',
    rhythmPlanet: 'rhythm-hub',
    blendPlanet: 'blending-hub',
    patternPlanet: 'pattern-hub',
    masterPlanet: 'master-hub'
  }
  return routeMap[planetId] || 'phonics-adventure'
}

const showPlanetPreview = (planet, event) => {
  if (vrModePreview.value || isTransitioning.value) return
  
  // Set hover state with animation
  planetHoverStates.value[planet.id] = true
  previewPlanet.value = planet
  
  // Get mouse position for preview positioning
  if (event) {
    previewPosition.value = { 
      x: event.clientX + 20, 
      y: event.clientY - 10 
    }
  } else {
    previewPosition.value = { x: 200, y: 100 }
  }
  
  // Animate hover effect
  animateHoverEffect(planet, true)
}

const hidePlanetPreview = (planet) => {
  if (planet && planetHoverStates.value[planet.id]) {
    planetHoverStates.value[planet.id] = false
    animateHoverEffect(planet, false)
  }
  previewPlanet.value = null
}

// Enhanced hover animation
const animateHoverEffect = (planet, isHovering) => {
  const startTime = Date.now()
  const duration = 300
  const targetScale = isHovering ? 1.15 : 1.0
  
  if (!springAnimations.value[planet.id]) {
    springAnimations.value[planet.id] = { scale: 1.0 }
  }
  
  const startScale = springAnimations.value[planet.id].scale
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Spring easing for bounce effect
    let easeProgress
    if (isHovering) {
      easeProgress = 1 - Math.pow(1 - progress, 2)
    } else {
      easeProgress = progress * (2 - progress)
    }
    
    springAnimations.value[planet.id].scale = startScale + (targetScale - startScale) * easeProgress
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

// ズーム制御
const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, zoomLevel.value + delta))
}

const zoomIn = () => {
  zoomLevel.value = Math.min(maxZoom, zoomLevel.value + 0.2)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(minZoom, zoomLevel.value - 0.2)
}

// パン制御
const startPan = (event) => {
  isPanning.value = true
  lastPanPosition.value = { x: event.clientX, y: event.clientY }
}

const handlePan = (event) => {
  if (!isPanning.value) return
  
  const deltaX = event.clientX - lastPanPosition.value.x
  const deltaY = event.clientY - lastPanPosition.value.y
  
  if (event.shiftKey) {
    // Shift押下時は回転
    rotationY.value += deltaX * 0.5
    rotationX.value -= deltaY * 0.5
  } else {
    // 通常はパン
    offsetX.value += deltaX
    offsetY.value += deltaY
  }
  
  lastPanPosition.value = { x: event.clientX, y: event.clientY }
}

const endPan = () => {
  isPanning.value = false
}

// Enhanced タッチ操作 with Gesture Recognition
const handleTouchStart = (event) => {
  event.preventDefault()
  touches.value = Array.from(event.touches)
  
  if (touches.value.length === 1) {
    // Single touch - prepare for pan
    lastPanPosition.value = {
      x: touches.value[0].clientX,
      y: touches.value[0].clientY
    }
  } else if (touches.value.length === 2) {
    // Two finger touch - prepare for pinch zoom
    lastTouchDistance.value = getTouchDistance(touches.value[0], touches.value[1])
    
    // Store center point for zoom anchor
    const centerX = (touches.value[0].clientX + touches.value[1].clientX) / 2
    const centerY = (touches.value[0].clientY + touches.value[1].clientY) / 2
    lastPanPosition.value = { x: centerX, y: centerY }
  }
}

const handleTouchMove = (event) => {
  event.preventDefault()
  
  if (touches.value.length === 2 && event.touches.length === 2) {
    // Enhanced ピンチズーム with smooth scaling
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1])
    const scaleChange = currentDistance / lastTouchDistance.value
    
    // Apply smooth scaling with bounds
    const newZoom = zoomLevel.value * scaleChange
    zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, newZoom))
    
    // Update for next frame
    lastTouchDistance.value = currentDistance
    
    // Update center point for continuous zooming
    const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2
    const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2
    
    // Adjust pan to keep zoom centered
    const deltaX = centerX - lastPanPosition.value.x
    const deltaY = centerY - lastPanPosition.value.y
    offsetX.value += deltaX * 0.1
    offsetY.value += deltaY * 0.1
    
    lastPanPosition.value = { x: centerX, y: centerY }
    
  } else if (touches.value.length === 1 && event.touches.length === 1) {
    // Enhanced single finger パン with momentum
    const deltaX = event.touches[0].clientX - lastPanPosition.value.x
    const deltaY = event.touches[0].clientY - lastPanPosition.value.y
    
    // Apply pan with sensitivity adjustment
    const sensitivity = 1.0 + (zoomLevel.value - 1) * 0.5
    offsetX.value += deltaX * sensitivity
    offsetY.value += deltaY * sensitivity
    
    // Update position for next frame
    lastPanPosition.value = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  }
  
  touches.value = Array.from(event.touches)
}

const handleTouchEnd = (event) => {
  // Add momentum/inertia effect for smooth stopping
  if (touches.value.length === 1 && event.touches.length === 0) {
    // Single finger lift - could add momentum here
    addTouchMomentum()
  }
  
  touches.value = Array.from(event.touches)
  
  // Reset touch distance when no touches remain
  if (touches.value.length === 0) {
    lastTouchDistance.value = 0
  }
}

// Add momentum effect for smooth touch interactions
const addTouchMomentum = () => {
  // This could be enhanced with velocity calculation and gradual deceleration
  // For now, we provide immediate stopping
}

const getTouchDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

// Enhanced VR制御
const toggleVRPreview = () => {
  vrModePreview.value = !vrModePreview.value
  
  if (vrModePreview.value) {
    // VRプレビューモードに入る
    focusedPlanet.value = currentPlanet.value || 'soundPlanet'
    animateVRModeEntry()
  } else {
    animateVRModeExit()
  }
}

const exitVRPreview = () => {
  vrModePreview.value = false
  focusedPlanet.value = null
  animateVRModeExit()
}

// VR Quick Actions
const centerOnCurrentPlanet = () => {
  if (currentPlanet.value) {
    focusedPlanet.value = currentPlanet.value
    animateTowardsPlanet({ id: currentPlanet.value })
  }
}

const toggleVRHands = () => {
  // Toggle VR hand tracking visualization
  // This would be integrated with WebXR hand tracking API
  logger.log('VR hand tracking toggled')
}

// VR Mode Animations
const animateVRModeEntry = () => {
  const startTime = Date.now()
  const duration = 600
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    // Add VR entry effects
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

const animateVRModeExit = () => {
  const startTime = Date.now()
  const duration = 400
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = progress * (2 - progress)
    
    // Add VR exit effects
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}

// ビューリセット
const resetView = () => {
  zoomLevel.value = 1.0
  rotationX.value = 0
  rotationY.value = 0
  offsetX.value = 0
  offsetY.value = 0
  focusedPlanet.value = null
}

// VR対応チェック
const checkVRCapability = async () => {
  if (navigator.xr) {
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      isVRCapable.value = supported
    } catch {
      isVRCapable.value = false
    }
  } else {
    isVRCapable.value = false
  }
}

// ライフサイクル
onMounted(() => {
  checkVRCapability()
  
  // Enhanced orbital animation system
  const animate = () => {
    orbitAnimationTime.value += 0.008
    
    // Update each planet's orbital position with varying speeds
    galaxyPlanets.value.forEach((planet, index) => {
      const baseSpeed = 0.1
      const speedVariation = index * 0.015 // Different speeds for each orbit
      const orbitSpeed = baseSpeed + speedVariation
      
      if (!planet.animationOffset) {
        planet.animationOffset = 0
      }
      
      planet.animationOffset = orbitAnimationTime.value * orbitSpeed
      
      // Add subtle wobble for more organic movement
      planet.wobbleOffset = Math.sin(orbitAnimationTime.value * 2 + index) * 2
    })
    
    requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  // クリーンアップが必要な場合
})
</script>

<style scoped>
.galaxy-map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #000000 100%);
  user-select: none;
}

/* 宇宙背景 */
.space-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  animation: float 20s ease-in-out infinite;
}

.stars-far {
  background-size: 200px 200px;
  animation-duration: 40s;
  opacity: 0.3;
}

.stars-mid {
  background-size: 150px 150px;
  animation-duration: 30s;
  opacity: 0.5;
}

.stars-near {
  background-size: 100px 100px;
  animation-duration: 20s;
  opacity: 0.7;
}

/* 銀河雲エフェクト */
.nebula-effect {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.1;
  animation: nebula-drift 60s linear infinite;
}

.nebula-1 {
  width: 300px;
  height: 200px;
  background: radial-gradient(ellipse, #ff6b9d, transparent);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.nebula-2 {
  width: 400px;
  height: 300px;
  background: radial-gradient(ellipse, #4ecdc4, transparent);
  top: 60%;
  right: 15%;
  animation-delay: -20s;
}

.nebula-3 {
  width: 250px;
  height: 150px;
  background: radial-gradient(ellipse, #a8e6cf, transparent);
  bottom: 30%;
  left: 60%;
  animation-delay: -40s;
}

/* 3D宇宙空間 */
.galaxy-3d-space {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1000px;
  height: 1000px;
  transform-origin: center center;
  transform-style: preserve-3d;
  transition: all 0.5s ease;
}

.galaxy-3d-space.vr-preview-mode {
  filter: blur(1px);
  transform: scale(0.8) rotateX(15deg);
}

.galaxy-3d-space.transitioning {
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 中央の恒星 */
.central-star {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.star-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 60px;
  animation: star-pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
}

.star-corona {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent);
  border-radius: 50%;
  animation: corona-rotate 10s linear infinite;
}

.star-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent,
    rgba(255, 215, 0, 0.1),
    transparent,
    rgba(255, 215, 0, 0.1),
    transparent
  );
  border-radius: 50%;
  animation: star-rays-rotate 20s linear infinite;
}

/* 惑星軌道 */
.planet-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-style: preserve-3d;
}

/* 軌道パス */
.orbit-path {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(70deg);
  animation: orbit-glow 4s ease-in-out infinite;
}

/* 惑星 */
.planet {
  position: relative;
  width: 80px;
  height: 80px;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
}

/* Enhanced hover states using spring animations */
.planet:hover {
  transform: scale(var(--planet-scale, 1.1));
  filter: brightness(1.2) drop-shadow(0 0 20px rgba(78, 205, 196, 0.4));
}

/* Focused planet animation */
.planet-focused {
  transform: scale(1.3) !important;
  filter: brightness(1.4) drop-shadow(0 0 30px rgba(255, 107, 157, 0.6));
  animation: focus-pulse 2s ease-in-out infinite;
}

/* Transitioning state */
.galaxy-3d-space.transitioning .planet {
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* VR ready planets glow effect */
.planet-vr-ready {
  animation: vr-ready-glow 3s ease-in-out infinite !important;
}

.planet-vr-ready .planet-surface {
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.planet-surface {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent);
  overflow: hidden;
}

.planet-emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  animation: planet-rotate 15s linear infinite;
}

.planet-atmosphere {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), transparent);
  animation: atmosphere-shimmer 5s ease-in-out infinite;
}

/* 進捗リング */
.progress-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 100px;
  height: 100px;
}

.progress-ring-svg {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 5px currentColor);
}

/* 状態インジケーター */
.crystal-indicator {
  position: absolute;
  top: -15px;
  right: -15px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  color: white;
}

.vr-readiness-indicator {
  position: absolute;
  top: -15px;
  left: -15px;
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  animation: vr-pulse 2s ease-in-out infinite;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.lock-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.unlock-requirement {
  font-size: 8px;
  text-align: center;
  opacity: 0.8;
}

.current-location-marker {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 120px;
  height: 120px;
  pointer-events: none;
}

.marker-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #00ff88;
  border-radius: 50%;
  animation: marker-ring-pulse 2s ease-in-out infinite;
}

.marker-pulse {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2), transparent);
  border-radius: 50%;
  animation: marker-pulse 2s ease-in-out infinite;
}

/* 惑星ラベル */
.planet-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  text-align: center;
  pointer-events: none;
}

.planet-name {
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.planet-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* 学習パス */
.learning-paths {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.learning-path {
  stroke-dasharray: 5 5;
  animation: path-flow 3s linear infinite;
}

.learning-path.active {
  stroke: rgba(0, 255, 136, 0.6);
  filter: drop-shadow(0 0 5px rgba(0, 255, 136, 0.5));
}

/* VRモードインジケーター */
.vr-mode-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  padding: 10px 15px;
  color: white;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.vr-mode-indicator.active {
  opacity: 1;
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  animation: vr-active-pulse 2s ease-in-out infinite;
}

.vr-icon {
  font-size: 20px;
}

.vr-status {
  font-size: 12px;
  font-weight: bold;
}

/* ナビゲーションコントロール */
.navigation-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 25px;
  padding: 10px 15px;
}

.zoom-btn, .reset-view-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.zoom-btn:hover, .reset-view-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

.vr-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.vr-toggle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  position: relative;
  overflow: hidden;
}

.vr-toggle-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.vr-toggle-btn.active {
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  border-color: rgba(78, 205, 196, 0.5);
  animation: vr-active-pulse 2s ease-in-out infinite;
}

/* VR Readiness States */
.vr-toggle-btn.high-readiness {
  border-color: rgba(0, 255, 136, 0.6);
}

.vr-toggle-btn.medium-readiness {
  border-color: rgba(255, 200, 0, 0.6);
}

.vr-toggle-btn.low-readiness {
  border-color: rgba(255, 100, 100, 0.6);
}

/* VR Readiness Bar */
.vr-readiness-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}

.readiness-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d, #4ecdc4);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.vr-status-text {
  font-size: 10px;
  opacity: 0.8;
  text-align: center;
}

.vr-icon {
  font-size: 18px;
  animation: float 3s ease-in-out infinite;
}

.vr-label {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

/* VR Quick Actions */
.vr-quick-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  animation: slide-in 0.4s ease forwards;
}

.quick-action-btn {
  position: relative;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-action-btn:hover {
  background: rgba(78, 205, 196, 0.3);
  border-color: rgba(78, 205, 196, 0.5);
  transform: scale(1.1);
}

.quick-action-btn .icon {
  font-size: 14px;
}

.quick-action-btn .tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  margin-bottom: 4px;
}

.quick-action-btn:hover .tooltip {
  opacity: 1;
}

/* 学習進歩パネル */
.learning-progress-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  padding: 15px;
  color: white;
  min-width: 200px;
}

.progress-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.overall-progress {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #4ecdc4);
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  text-align: center;
  opacity: 0.8;
}

.planet-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.planet-summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 10px;
  transition: all 0.2s ease;
}

.planet-summary-item.current {
  background: linear-gradient(45deg, #00ff88, #4ecdc4);
  animation: current-planet-glow 2s ease-in-out infinite;
}

.planet-emoji-small {
  font-size: 14px;
}

/* アニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes nebula-drift {
  0% { transform: translateX(-50px) translateY(-30px) rotate(0deg); }
  100% { transform: translateX(50px) translateY(30px) rotate(360deg); }
}

@keyframes star-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes corona-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes star-rays-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(-360deg); }
}

@keyframes planet-rotate {
  0% { transform: translate(-50%, -50%) rotateY(0deg); }
  100% { transform: translate(-50%, -50%) rotateY(360deg); }
}

@keyframes atmosphere-shimmer {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

@keyframes orbit-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
}

@keyframes vr-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes marker-ring-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

@keyframes marker-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

@keyframes path-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -10; }
}

@keyframes vr-active-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 107, 157, 0.5); }
  50% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
}

@keyframes current-planet-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.5); }
  50% { box-shadow: 0 0 15px rgba(0, 255, 136, 1); }
}

/* Enhanced animation keyframes */
@keyframes focus-pulse {
  0%, 100% { 
    transform: scale(1.3);
    filter: brightness(1.4) drop-shadow(0 0 30px rgba(255, 107, 157, 0.6));
  }
  50% { 
    transform: scale(1.35);
    filter: brightness(1.6) drop-shadow(0 0 40px rgba(255, 107, 157, 0.8));
  }
}

@keyframes vr-ready-glow {
  0%, 100% { 
    box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
    filter: brightness(1.0);
  }
  50% { 
    box-shadow: 0 0 25px rgba(78, 205, 196, 0.6);
    filter: brightness(1.2);
  }
}

@keyframes planet-selection-zoom {
  0% { 
    transform: scale(1);
    filter: brightness(1.0);
  }
  50% { 
    transform: scale(1.2);
    filter: brightness(1.3) drop-shadow(0 0 25px rgba(255, 255, 255, 0.5));
  }
  100% { 
    transform: scale(2.2);
    filter: brightness(1.5) drop-shadow(0 0 35px rgba(78, 205, 196, 0.8));
  }
}

@keyframes orbit-wobble {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

@keyframes slide-in {
  0% { 
    opacity: 0;
    transform: translateY(-10px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced レスポンシブ対応 with Touch Optimization */
@media (max-width: 768px) {
  .galaxy-map-container {
    /* Enhanced touch experience */
    touch-action: manipulation;
    -webkit-user-select: none;
    user-select: none;
  }
  
  .galaxy-3d-space {
    /* Improve touch responsiveness */
    touch-action: none;
  }
  
  .navigation-controls {
    bottom: 10px;
    left: 10px;
    flex-direction: column;
    gap: 8px;
  }
  
  .zoom-controls {
    flex-direction: row;
    gap: 6px;
  }
  
  .zoom-btn {
    min-width: 40px;
    padding: 8px;
  }
  
  .zoom-level {
    min-width: 60px;
    font-size: 12px;
  }
  
  .learning-progress-panel {
    top: 10px;
    left: 10px;
    right: 10px;
    min-width: auto;
    padding: 12px;
  }
  
  .vr-mode-indicator {
    top: 10px;
    right: 10px;
    transform: scale(0.9);
  }
  
  .vr-controls {
    gap: 6px;
  }
  
  .vr-toggle-btn {
    min-width: 100px;
    padding: 10px 12px;
  }
  
  .vr-quick-actions {
    gap: 4px;
  }
  
  .quick-action-btn {
    width: 28px;
    height: 28px;
  }
  
  .planet {
    width: 60px;
    height: 60px;
    /* Enhanced touch targets */
    min-height: 44px;
    min-width: 44px;
  }
  
  .planet:hover {
    /* Disable hover effects on touch devices */
    transform: scale(1);
    filter: none;
  }
  
  .planet:active {
    /* Add touch feedback */
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  .planet-emoji {
    font-size: 28px;
  }
  
  .planet-name {
    font-size: 11px;
  }
  
  .planet-subtitle {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .galaxy-3d-space {
    width: 800px;
    height: 800px;
  }
  
  .planet {
    width: 50px;
    height: 50px;
  }
  
  .planet-emoji {
    font-size: 25px;
  }
  
  .central-star {
    width: 80px;
    height: 80px;
  }
  
  .star-core {
    font-size: 40px;
  }
}

/* WebXR対応のクラス（将来の実装用） */
.webxr-interactable {
  /* WebXRで相互作用可能な要素としてマーク */
}

.webxr-orbit {
  /* WebXR軌道要素としてマーク */
}
</style>