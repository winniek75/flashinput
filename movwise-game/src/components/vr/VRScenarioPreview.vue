<template>
  <div class="vr-scenario-preview-modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <!-- Header -->
      <div class="preview-header">
        <div class="scenario-info">
          <h2 class="scenario-title">{{ scenario?.title }}</h2>
          <p class="scenario-description">{{ scenario?.description }}</p>
        </div>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <!-- Preview Image/Video -->
      <div class="preview-media">
        <img 
          :src="scenario?.previewImage" 
          :alt="scenario?.title"
          class="preview-image"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 2D Simulation Overlay -->
        <div class="simulation-overlay" v-if="showSimulation">
          <canvas 
            ref="simulationCanvas"
            class="simulation-canvas"
            :width="canvasWidth"
            :height="canvasHeight"
          ></canvas>
          
          <!-- Interactive Elements Preview -->
          <div class="interactive-elements">
            <div
              v-for="element in interactiveElements"
              :key="element.id"
              class="interactive-element"
              :class="`element-${element.type}`"
              :style="getElementStyle(element)"
              @click="previewInteraction(element)"
              @mouseenter="highlightElement(element)"
              @mouseleave="unhighlightElement(element)"
            >
              <div class="element-icon">{{ element.icon }}</div>
              <div class="element-tooltip" v-if="element.showTooltip">
                {{ element.description }}
              </div>
            </div>
          </div>

          <!-- Simulated VR Hands -->
          <div class="vr-hands-simulation" v-if="showVRHands">
            <div 
              class="vr-hand left-hand"
              :style="leftHandStyle"
            >
              <div class="hand-model">🤚</div>
              <div class="hand-ray" v-if="showHandRays"></div>
            </div>
            <div 
              class="vr-hand right-hand"
              :style="rightHandStyle"
            >
              <div class="hand-model">🤚</div>
              <div class="hand-ray" v-if="showHandRays"></div>
            </div>
          </div>
        </div>

        <!-- Preview Controls -->
        <div class="preview-controls">
          <button 
            class="control-btn simulation-toggle"
            :class="{ active: showSimulation }"
            @click="toggleSimulation"
          >
            <div class="btn-icon">{{ showSimulation ? '📹' : '🎮' }}</div>
            <div class="btn-text">{{ showSimulation ? 'Static' : 'Interactive' }}</div>
          </button>
          
          <button 
            class="control-btn hands-toggle"
            :class="{ active: showVRHands }"
            @click="toggleVRHands"
            v-if="showSimulation"
          >
            <div class="btn-icon">🤝</div>
            <div class="btn-text">VR Hands</div>
          </button>

          <button 
            class="control-btn fullscreen-btn"
            @click="toggleFullscreen"
          >
            <div class="btn-icon">⛶</div>
            <div class="btn-text">Fullscreen</div>
          </button>
        </div>
      </div>

      <!-- Scenario Details -->
      <div class="scenario-details">
        <!-- Requirements -->
        <div class="detail-section requirements">
          <h3 class="section-title">Requirements</h3>
          <div class="requirement-grid">
            <div class="requirement-item">
              <div class="req-icon">🥽</div>
              <div class="req-content">
                <div class="req-label">VR Readiness</div>
                <div class="req-value">
                  <span class="current-value">{{ playerVRReadiness }}%</span>
                  <span class="required-value">/ {{ scenario?.requiredVRReadiness }}%</span>
                </div>
                <div class="req-progress">
                  <div 
                    class="progress-bar"
                    :class="{ 
                      'sufficient': playerVRReadiness >= (scenario?.requiredVRReadiness || 0),
                      'insufficient': playerVRReadiness < (scenario?.requiredVRReadiness || 0)
                    }"
                  >
                    <div 
                      class="progress-fill"
                      :style="{ width: Math.min(100, (playerVRReadiness / (scenario?.requiredVRReadiness || 100)) * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="requirement-item">
              <div class="req-icon">⏱️</div>
              <div class="req-content">
                <div class="req-label">Duration</div>
                <div class="req-value">{{ scenario?.estimatedDuration }} minutes</div>
              </div>
            </div>

            <div class="requirement-item">
              <div class="req-icon">👥</div>
              <div class="req-content">
                <div class="req-label">Participants</div>
                <div class="req-value">Up to {{ scenario?.participants }} players</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectives -->
        <div class="detail-section objectives">
          <h3 class="section-title">Learning Objectives</h3>
          <div class="objectives-list">
            <div
              v-for="objective in scenario?.objectives"
              :key="objective.id"
              class="objective-item"
              :class="`objective-${objective.type}`"
            >
              <div class="objective-icon">{{ getObjectiveIcon(objective.type) }}</div>
              <div class="objective-content">
                <div class="objective-description">{{ objective.description }}</div>
                <div class="objective-rewards">
                  <div
                    v-for="reward in objective.rewards"
                    :key="reward.type + reward.value"
                    class="reward-item"
                  >
                    <span class="reward-icon">{{ getRewardIcon(reward.type) }}</span>
                    <span class="reward-text">{{ getRewardText(reward) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Environments -->
        <div class="detail-section environments">
          <h3 class="section-title">VR Environments</h3>
          <div class="environments-carousel">
            <div
              v-for="(environment, index) in scenario?.environments"
              :key="environment.id"
              class="environment-card"
              :class="{ active: selectedEnvironment === index }"
              @click="selectEnvironment(index)"
            >
              <div class="env-preview">
                <div class="env-icon">🌍</div>
                <div class="env-lighting" :class="`lighting-${environment.lighting}`"></div>
              </div>
              <div class="env-info">
                <div class="env-name">{{ environment.name }}</div>
                <div class="env-description">{{ environment.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interactions -->
        <div class="detail-section interactions">
          <h3 class="section-title">VR Interactions</h3>
          <div class="interactions-grid">
            <div
              v-for="interaction in scenario?.interactions"
              :key="interaction.id"
              class="interaction-item"
              :class="`interaction-${interaction.type}`"
              @click="demoInteraction(interaction)"
            >
              <div class="interaction-icon">{{ getInteractionIcon(interaction.type) }}</div>
              <div class="interaction-name">{{ getInteractionName(interaction.type) }}</div>
              <div class="interaction-demo" v-if="demoingInteraction === interaction.id">
                <div class="demo-animation"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spatial.io Integration Info -->
        <div class="detail-section spatial-info" v-if="scenario?.spatialioId">
          <h3 class="section-title">Spatial.io Integration</h3>
          <div class="spatial-details">
            <div class="spatial-item">
              <div class="spatial-icon">🌐</div>
              <div class="spatial-content">
                <div class="spatial-label">Space ID</div>
                <div class="spatial-value">{{ scenario.spatialioId }}</div>
              </div>
            </div>
            <div class="spatial-item">
              <div class="spatial-icon">🔗</div>
              <div class="spatial-content">
                <div class="spatial-label">Cross-Platform</div>
                <div class="spatial-value">Desktop, Mobile, VR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          class="action-btn secondary"
          @click="closeModal"
        >
          <div class="btn-icon">←</div>
          <div class="btn-text">Back to Story</div>
        </button>

        <button
          class="action-btn preview"
          @click="start2DPreview"
          :disabled="!canPreview"
        >
          <div class="btn-icon">👁️</div>
          <div class="btn-text">2D Preview</div>
        </button>

        <button
          class="action-btn primary"
          :class="{ 
            'insufficient-readiness': !meetRequirements,
            'vr-ready': meetRequirements 
          }"
          @click="startVRScenario"
          :disabled="!meetRequirements"
        >
          <div class="btn-icon">🚀</div>
          <div class="btn-text">
            {{ meetRequirements ? 'Launch VR Experience' : 'Insufficient VR Readiness' }}
          </div>
          <div class="btn-subtitle" v-if="!meetRequirements">
            Need {{ (scenario?.requiredVRReadiness || 0) - playerVRReadiness }}% more readiness
          </div>
        </button>
      </div>

      <!-- VR Readiness Tips -->
      <div class="readiness-tips" v-if="!meetRequirements">
        <h4 class="tips-title">Improve VR Readiness:</h4>
        <ul class="tips-list">
          <li class="tip-item">Complete more learning games</li>
          <li class="tip-item">Practice with hand gestures</li>
          <li class="tip-item">Improve spatial awareness skills</li>
          <li class="tip-item">Master foundational concepts</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { usePlayerProfileStore } from '@/stores/playerProfile'

interface InteractiveElement {
  id: string
  type: 'crystal' | 'puzzle' | 'character' | 'portal'
  x: number
  y: number
  icon: string
  description: string
  showTooltip: boolean
}

const props = defineProps<{
  scenario: VRScenarioData | null
}>()

const emit = defineEmits<{
  close: []
  'start-vr': [scenarioId: string]
}>()

const playerProfileStore = usePlayerProfileStore()

// ======= Component State =======
const simulationCanvas = ref<HTMLCanvasElement>()
const showSimulation = ref(false)
const showVRHands = ref(true)
const showHandRays = ref(false)
const selectedEnvironment = ref(0)
const demoingInteraction = ref<string | null>(null)
const canvasWidth = ref(800)
const canvasHeight = ref(450)

// VR Hands Animation
const leftHandPosition = ref({ x: 200, y: 300, rotation: 0 })
const rightHandPosition = ref({ x: 600, y: 300, rotation: 0 })
let handsAnimationFrame: number | null = null

// Interactive Elements
const interactiveElements = ref<InteractiveElement[]>([
  {
    id: 'crystal_1',
    type: 'crystal',
    x: 150,
    y: 200,
    icon: '💎',
    description: 'Sound Crystal - Touch to learn phonemes',
    showTooltip: false
  },
  {
    id: 'puzzle_1',
    type: 'puzzle',
    x: 400,
    y: 150,
    icon: '🧩',
    description: 'Grammar Puzzle - Construct sentences',
    showTooltip: false
  },
  {
    id: 'character_1',
    type: 'character',
    x: 650,
    y: 250,
    icon: '🤖',
    description: 'AI Guide - Ask questions and get help',
    showTooltip: false
  },
  {
    id: 'portal_1',
    type: 'portal',
    x: 300,
    y: 350,
    icon: '🌀',
    description: 'Learning Portal - Transport to new areas',
    showTooltip: false
  }
])

// ======= Computed Properties =======

const playerVRReadiness = computed(() => playerProfileStore.overallVRReadiness)

const meetRequirements = computed(() => {
  return playerVRReadiness.value >= (props.scenario?.requiredVRReadiness || 0)
})

const canPreview = computed(() => {
  return props.scenario !== null
})

const leftHandStyle = computed(() => ({
  transform: `translate(${leftHandPosition.value.x}px, ${leftHandPosition.value.y}px) rotate(${leftHandPosition.value.rotation}deg)`
}))

const rightHandStyle = computed(() => ({
  transform: `translate(${rightHandPosition.value.x}px, ${rightHandPosition.value.y}px) rotate(${rightHandPosition.value.rotation}deg)`
}))

// ======= Methods =======

function closeModal(): void {
  emit('close')
}

function startVRScenario(): void {
  if (!meetRequirements.value || !props.scenario) return
  emit('start-vr', props.scenario.id)
}

function toggleSimulation(): void {
  showSimulation.value = !showSimulation.value
  
  if (showSimulation.value) {
    nextTick(() => {
      initializeSimulation()
    })
  } else {
    stopSimulation()
  }
}

function toggleVRHands(): void {
  showVRHands.value = !showVRHands.value
  
  if (showVRHands.value) {
    startHandsAnimation()
  } else {
    stopHandsAnimation()
  }
}

function toggleFullscreen(): void {
  const modalElement = document.querySelector('.vr-scenario-preview-modal')
  if (modalElement) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      modalElement.requestFullscreen()
    }
  }
}

function initializeSimulation(): void {
  if (!simulationCanvas.value) return
  
  const canvas = simulationCanvas.value
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return
  
  // Draw simulated VR environment
  drawVREnvironment(ctx)
  
  // Start animations
  if (showVRHands.value) {
    startHandsAnimation()
  }
}

function drawVREnvironment(ctx: CanvasRenderingContext2D): void {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw background environment
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight.value)
  gradient.addColorStop(0, '#001122')
  gradient.addColorStop(0.5, '#003366')
  gradient.addColorStop(1, '#001122')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw grid pattern (VR space indicator)
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)'
  ctx.lineWidth = 1
  
  const gridSize = 50
  for (let x = 0; x < canvasWidth.value; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight.value)
    ctx.stroke()
  }
  
  for (let y = 0; y < canvasHeight.value; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth.value, y)
    ctx.stroke()
  }
  
  // Draw floating particles
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvasWidth.value
    const y = Math.random() * canvasHeight.value
    const size = Math.random() * 3 + 1
    
    ctx.fillStyle = `rgba(78, 205, 196, ${Math.random() * 0.5 + 0.3})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function startHandsAnimation(): void {
  if (handsAnimationFrame) {
    cancelAnimationFrame(handsAnimationFrame)
  }
  
  const animate = () => {
    const time = Date.now() * 0.002
    
    // Animate left hand
    leftHandPosition.value.x = 200 + Math.sin(time) * 30
    leftHandPosition.value.y = 300 + Math.cos(time * 0.8) * 20
    leftHandPosition.value.rotation = Math.sin(time * 1.2) * 10
    
    // Animate right hand
    rightHandPosition.value.x = 600 + Math.sin(time + Math.PI) * 30
    rightHandPosition.value.y = 300 + Math.cos(time * 0.8 + Math.PI) * 20
    rightHandPosition.value.rotation = Math.sin(time * 1.2 + Math.PI) * 10
    
    handsAnimationFrame = requestAnimationFrame(animate)
  }
  
  animate()
}

function stopHandsAnimation(): void {
  if (handsAnimationFrame) {
    cancelAnimationFrame(handsAnimationFrame)
    handsAnimationFrame = null
  }
}

function stopSimulation(): void {
  stopHandsAnimation()
}

function getElementStyle(element: InteractiveElement) {
  return {
    left: `${element.x}px`,
    top: `${element.y}px`,
    transform: 'translate(-50%, -50%)'
  }
}

function previewInteraction(element: InteractiveElement): void {
  logger.log(`Previewing interaction with ${element.type}:`, element.description)
  
  // Show temporary visual feedback
  showHandRays.value = true
  setTimeout(() => {
    showHandRays.value = false
  }, 1000)
}

function highlightElement(element: InteractiveElement): void {
  element.showTooltip = true
}

function unhighlightElement(element: InteractiveElement): void {
  element.showTooltip = false
}

function selectEnvironment(index: number): void {
  selectedEnvironment.value = index
  
  if (showSimulation.value && simulationCanvas.value) {
    const ctx = simulationCanvas.value.getContext('2d')
    if (ctx) {
      drawVREnvironment(ctx)
    }
  }
}

function demoInteraction(interaction: VRScenarioInteraction): void {
  demoingInteraction.value = interaction.id
  
  setTimeout(() => {
    demoingInteraction.value = null
  }, 2000)
}

function getObjectiveIcon(type: string): string {
  const icons = {
    'learning': '📚',
    'social': '👥',
    'exploration': '🗺️',
    'creative': '🎨'
  }
  return icons[type] || '🎯'
}

function getRewardIcon(type: string): string {
  const icons = {
    'crystal': '💎',
    'skill': '📈',
    'unlock': '🔓',
    'badge': '🏅'
  }
  return icons[type] || '✨'
}

function getRewardText(reward: ObjectiveReward): string {
  return `${reward.description} (+${reward.value})`
}

function getInteractionIcon(type: string): string {
  const icons = {
    'handTracking': '🤲',
    'voiceCommand': '🎤',
    'eyeTracking': '👁️',
    'spatialAudio': '🔊'
  }
  return icons[type] || '🎮'
}

function getInteractionName(type: string): string {
  const names = {
    'handTracking': 'Hand Tracking',
    'voiceCommand': 'Voice Commands',
    'eyeTracking': 'Eye Tracking',
    'spatialAudio': 'Spatial Audio'
  }
  return names[type] || 'Interaction'
}

function start2DPreview(): void {
  if (!showSimulation.value) {
    toggleSimulation()
  }
  
  // Focus on the simulation area
  const simulationOverlay = document.querySelector('.simulation-overlay')
  if (simulationOverlay) {
    simulationOverlay.scrollIntoView({ behavior: 'smooth' })
  }
}

function onImageLoad(): void {
  logger.log('VR scenario preview image loaded')
}

function onImageError(): void {
  logger.warn('Failed to load VR scenario preview image')
}

// ======= Lifecycle =======

onMounted(() => {
  // Set canvas size based on container
  const updateCanvasSize = () => {
    canvasWidth.value = Math.min(800, window.innerWidth - 40)
    canvasHeight.value = Math.round(canvasWidth.value * 0.5625) // 16:9 aspect ratio
  }
  
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  stopSimulation()
  window.removeEventListener('resize', () => {})
})
</script>

<style scoped>
.vr-scenario-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 95%;
  max-width: 900px;
  max-height: 95vh;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Header */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.scenario-info {
  flex: 1;
}

.scenario-title {
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.scenario-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  transform: scale(1.1);
}

/* Preview Media */
.preview-media {
  position: relative;
  margin: 0 30px 30px 30px;
  border-radius: 15px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 450px;
  object-fit: cover;
  display: block;
}

.simulation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}

.simulation-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Interactive Elements */
.interactive-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.interactive-element {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(78, 205, 196, 0.3);
  border: 2px solid rgba(78, 205, 196, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
  animation: element-pulse 2s ease-in-out infinite;
}

.interactive-element:hover {
  transform: translate(-50%, -50%) scale(1.2);
  background: rgba(78, 205, 196, 0.5);
}

.element-icon {
  font-size: 18px;
}

.element-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  margin-bottom: 8px;
  opacity: 0;
  animation: tooltip-appear 0.3s ease forwards;
}

/* VR Hands Simulation */
.vr-hands-simulation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.vr-hand {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: transform 0.1s ease;
}

.hand-model {
  font-size: 32px;
  filter: drop-shadow(0 0 10px rgba(255, 107, 157, 0.5));
}

.hand-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, rgba(255, 107, 157, 0.8), transparent);
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: top;
}

/* Preview Controls */
.preview-controls {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.control-btn.active {
  background: linear-gradient(45deg, #4ecdc4, #00ff88);
  border-color: transparent;
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-size: 10px;
  text-transform: uppercase;
}

/* Scenario Details */
.scenario-details {
  padding: 0 30px 20px 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.section-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  border-bottom: 2px solid rgba(78, 205, 196, 0.3);
  padding-bottom: 5px;
}

/* Requirements */
.requirement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
}

.req-icon {
  font-size: 24px;
  min-width: 32px;
}

.req-content {
  flex: 1;
}

.req-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 4px;
}

.req-value {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.current-value {
  color: #4ecdc4;
}

.required-value {
  color: rgba(255, 255, 255, 0.6);
}

.req-progress {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar.sufficient {
  background: rgba(0, 255, 136, 0.2);
}

.progress-bar.insufficient {
  background: rgba(255, 100, 100, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #00ff88);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-bar.insufficient .progress-fill {
  background: linear-gradient(90deg, #ff6464, #ff9999);
}

/* Objectives */
.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid transparent;
}

.objective-learning {
  border-left-color: #4ecdc4;
}

.objective-social {
  border-left-color: #ff6b9d;
}

.objective-exploration {
  border-left-color: #ffd700;
}

.objective-creative {
  border-left-color: #9b59b6;
}

.objective-icon {
  font-size: 24px;
  min-width: 32px;
}

.objective-content {
  flex: 1;
}

.objective-description {
  color: white;
  font-size: 16px;
  margin-bottom: 8px;
}

.objective-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 4px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Environments */
.environments-carousel {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.environment-card {
  min-width: 200px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.environment-card:hover {
  border-color: rgba(78, 205, 196, 0.5);
  background: rgba(78, 205, 196, 0.1);
}

.environment-card.active {
  border-color: rgba(78, 205, 196, 0.8);
  background: rgba(78, 205, 196, 0.15);
}

.env-preview {
  position: relative;
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #001122, #003366);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  overflow: hidden;
}

.env-icon {
  font-size: 32px;
  z-index: 2;
}

.env-lighting {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.lighting-day {
  background: linear-gradient(135deg, #87CEEB, #FFD700);
}

.lighting-night {
  background: linear-gradient(135deg, #191970, #000080);
}

.lighting-sunset {
  background: linear-gradient(135deg, #FF6347, #FFD700);
}

.lighting-space {
  background: linear-gradient(135deg, #000000, #4B0082);
}

.env-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.env-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.3;
}

/* Interactions */
.interactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.interaction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.interaction-item:hover {
  border-color: rgba(78, 205, 196, 0.5);
  background: rgba(78, 205, 196, 0.1);
}

.interaction-icon {
  font-size: 32px;
}

.interaction-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.interaction-demo {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(78, 205, 196, 0.2);
  border-radius: 8px;
}

.demo-animation {
  width: 100%;
  height: 100%;
  border: 2px solid #4ecdc4;
  border-radius: 8px;
  animation: demo-pulse 2s ease-in-out;
}

/* Spatial.io Info */
.spatial-details {
  display: flex;
  gap: 20px;
}

.spatial-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  flex: 1;
}

.spatial-icon {
  font-size: 24px;
  color: #4ecdc4;
}

.spatial-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 2px;
}

.spatial-value {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  padding: 20px 30px 30px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  flex: 1;
  position: relative;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn.preview {
  background: linear-gradient(45deg, #9b59b6, #3498db);
  color: white;
}

.action-btn.preview:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(155, 89, 182, 0.3);
}

.action-btn.primary {
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
}

.action-btn.insufficient-readiness {
  background: rgba(255, 100, 100, 0.3);
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
}

.action-btn.vr-ready {
  animation: vr-ready-glow 2s ease-in-out infinite;
}

.btn-subtitle {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* VR Readiness Tips */
.readiness-tips {
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin: 0 30px 20px 30px;
}

.tips-title {
  color: #ffc800;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.tips-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tip-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  padding: 2px 0;
  position: relative;
  padding-left: 15px;
}

.tip-item::before {
  content: '•';
  color: #ffc800;
  position: absolute;
  left: 0;
}

/* Animations */
@keyframes element-pulse {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(78, 205, 196, 0.5);
  }
  50% { 
    box-shadow: 0 0 15px rgba(78, 205, 196, 0.8);
  }
}

@keyframes tooltip-appear {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes demo-pulse {
  0% { 
    opacity: 0;
    transform: scale(0.8);
  }
  50% { 
    opacity: 1;
    transform: scale(1.05);
  }
  100% { 
    opacity: 0;
    transform: scale(1);
  }
}

@keyframes vr-ready-glow {
  0%, 100% { 
    box-shadow: 0 0 10px rgba(255, 107, 157, 0.5);
  }
  50% { 
    box-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 98%;
    max-height: 98vh;
  }
  
  .preview-header {
    padding: 15px 20px;
  }
  
  .scenario-title {
    font-size: 20px;
  }
  
  .scenario-description {
    font-size: 14px;
  }
  
  .preview-media {
    margin: 0 20px 20px 20px;
  }
  
  .scenario-details {
    padding: 0 20px 15px 20px;
  }
  
  .requirement-grid {
    grid-template-columns: 1fr;
  }
  
  .environments-carousel {
    gap: 10px;
  }
  
  .environment-card {
    min-width: 150px;
  }
  
  .interactions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .spatial-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
    padding: 15px 20px 20px 20px;
  }
  
  .readiness-tips {
    margin: 0 20px 15px 20px;
  }
}
</style>