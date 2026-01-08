<template>
  <div class="vr-portal-scene" :class="{ 'portal-active': isPortalActive, 'transition-mode': isTransitioning }">
    <!-- Background layers -->
    <div class="scene-background">
      <div class="starfield-layer"></div>
      <div class="dimensional-grid" :style="{ opacity: gridOpacity }"></div>
      <div class="energy-field" :style="{ transform: `scale(${energyScale})` }"></div>
    </div>

    <!-- Portal Structure -->
    <div class="vr-portal" ref="portalElement" :class="{ 'activated': isPortalActive }">
      <div class="portal-ring outer-ring"></div>
      <div class="portal-ring middle-ring"></div>
      <div class="portal-ring inner-ring"></div>
      <div class="portal-core" ref="portalCore">
        <div class="core-energy"></div>
        <div class="dimensional-gateway" v-if="isPortalActive">
          <div class="vr-preview" ref="vrPreview">
            <canvas ref="vrCanvas" class="vr-canvas"></canvas>
            <div class="vr-text">VR Language Academy</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Characters -->
    <div class="character-container">
      <!-- 2D Characters (departing) -->
      <div class="characters-2d" v-if="!isTransitioning">
        <div 
          v-for="character in characters2D" 
          :key="character.id"
          :class="['character-2d', character.id]"
          :style="character.style"
        >
          <img :src="character.image" :alt="character.name" />
          <div class="character-dialogue" v-if="character.currentDialogue">
            <div class="dialogue-text">{{ character.currentDialogue }}</div>
          </div>
        </div>
      </div>

      <!-- Transitioning Characters -->
      <div class="characters-transitioning" v-if="isTransitioning">
        <div 
          v-for="character in transitioningCharacters" 
          :key="'trans-' + character.id"
          :class="['character-transition', character.id]"
          ref="transitionCharacters"
        >
          <div class="character-2d-form" :style="{ opacity: character.twoDOpacity }">
            <img :src="character.image" :alt="character.name" />
          </div>
          <div class="character-3d-form" :style="{ opacity: character.threeDOpacity }">
            <div class="character-3d-representation">
              <div class="depth-layers">
                <div class="layer front"></div>
                <div class="layer middle"></div>
                <div class="layer back"></div>
              </div>
              <div class="character-name">{{ character.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VR Characters (arriving) -->
      <div class="characters-vr" v-if="showVRCharacters">
        <div 
          v-for="character in charactersVR" 
          :key="'vr-' + character.id"
          :class="['character-vr', character.id]"
          :style="character.vrStyle"
        >
          <div class="character-hologram">
            <div class="hologram-scanlines"></div>
            <div class="character-3d-model">
              <div class="model-geometry"></div>
              <div class="character-label">{{ character.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Effects Layer -->
    <div class="effects-layer">
      <!-- Particle systems -->
      <div class="particles-container" ref="particlesContainer"></div>
      
      <!-- Dimensional rifts -->
      <div class="dimensional-rifts" v-if="showRifts">
        <div v-for="rift in dimensionalRifts" :key="rift.id" :class="['rift', rift.type]" :style="rift.style"></div>
      </div>

      <!-- Energy beams -->
      <svg class="energy-beams" v-if="showEnergyBeams">
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0" />
            <stop offset="50%" style="stop-color:#ff00ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffff00;stop-opacity:0" />
          </linearGradient>
        </defs>
        <path 
          v-for="beam in energyBeams" 
          :key="beam.id"
          :d="beam.path" 
          stroke="url(#beamGradient)" 
          :stroke-width="beam.width"
          fill="none"
          :class="['energy-beam', beam.type]"
        />
      </svg>
    </div>

    <!-- Control Panel -->
    <div class="vr-control-panel" v-if="showControls">
      <div class="panel-content">
        <h3>VR Language Academy Portal</h3>
        <div class="readiness-indicator">
          <div class="indicator-label">準備度:</div>
          <div class="readiness-bar">
            <div class="readiness-fill" :style="{ width: `${readinessLevel}%` }"></div>
          </div>
          <div class="readiness-text">{{ readinessStatus }}</div>
        </div>
        
        <div class="portal-status">
          <div class="status-light" :class="{ 'active': isPortalReady }"></div>
          <span>{{ portalStatusText }}</span>
        </div>

        <div class="control-buttons">
          <button 
            @click="activatePortal" 
            :disabled="!canActivatePortal"
            class="activate-btn"
            :class="{ 'ready': canActivatePortal }"
          >
            Portal起動
          </button>
          
          <button 
            @click="startTransition" 
            :disabled="!isPortalActive"
            class="transition-btn"
            :class="{ 'available': isPortalActive }"
          >
            VR世界へ
          </button>

          <button @click="showPreview" class="preview-btn">
            プレビュー
          </button>
        </div>
      </div>
    </div>

    <!-- Dialogue System -->
    <div class="dialogue-system" v-if="currentDialogue">
      <div class="dialogue-container">
        <div class="speaker-name">{{ currentDialogue.speaker }}</div>
        <div class="dialogue-text" ref="dialogueText">{{ currentDialogue.text }}</div>
        <div class="dialogue-emotion" :class="currentDialogue.emotion"></div>
      </div>
    </div>

    <!-- VR Preview Modal -->
    <div class="vr-preview-modal" v-if="showPreviewModal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <h2>VR Language Academy プレビュー</h2>
          <button @click="closePreview" class="close-btn">×</button>
        </div>
        <div class="preview-showcase">
          <div class="feature-grid">
            <div v-for="feature in vrFeatures" :key="feature.id" class="feature-card">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transition Overlay -->
    <div class="transition-overlay" v-if="isTransitioning" :style="{ opacity: transitionOpacity }">
      <div class="transition-content">
        <div class="transition-animation">
          <div class="dimension-shift">
            <div class="shift-layer" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></div>
          </div>
        </div>
        <div class="transition-text">
          <h2>次元移行中...</h2>
          <p>{{ transitionMessage }}</p>
          <div class="progress-indicator">
            <div class="progress-bar" :style="{ width: `${transitionProgress}%` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { endingSystem } from '@/story/endings/EndingSystem'
import vrIntroStory from '@/story/vr/VRIntroductionStory.json'

interface Props {
  playerReadiness?: number
  autoStart?: boolean
  showControls?: boolean
  debugMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  playerReadiness: 0,
  autoStart: false,
  showControls: true,
  debugMode: false
})

const emit = defineEmits<{
  portalActivated: []
  transitionStarted: []
  transitionComplete: []
  vrLaunched: []
  previewShown: []
}>()

// Reactive state
const isPortalActive = ref(false)
const isTransitioning = ref(false)
const showVRCharacters = ref(false)
const showRifts = ref(false)
const showEnergyBeams = ref(false)
const showPreviewModal = ref(false)
const transitionProgress = ref(0)
const transitionOpacity = ref(0)
const gridOpacity = ref(0.3)
const energyScale = ref(1)

// Readiness calculation
const readinessLevel = computed(() => {
  const playerStats = endingSystem.currentPlayerStats
  if (!playerStats) return props.playerReadiness

  // Calculate based on overall mastery and relationships
  const masteryScore = playerStats.overallMastery * 0.6
  const relationshipScore = (Array.from(playerStats.characterRelationships.values())
    .reduce((sum, val) => sum + val, 0) / playerStats.characterRelationships.size) * 0.4
  
  return Math.min(100, masteryScore + relationshipScore)
})

const readinessStatus = computed(() => {
  const level = readinessLevel.value
  if (level >= 90) return 'VR探検家'
  if (level >= 70) return 'VR冒険家'
  if (level >= 40) return 'VR学習者'
  return 'VR初心者'
})

const canActivatePortal = computed(() => readinessLevel.value >= 30)
const isPortalReady = computed(() => isPortalActive.value && readinessLevel.value >= 50)

const portalStatusText = computed(() => {
  if (!canActivatePortal.value) return '準備度不足'
  if (!isPortalActive.value) return '待機中'
  if (isTransitioning.value) return '転送中'
  return 'アクティブ'
})

// Character data
const characters2D = ref([
  {
    id: 'captain_nova',
    name: 'Captain Nova',
    image: '/images/characters/captain_nova.png',
    currentDialogue: '',
    style: { left: '30%', top: '60%' }
  },
  {
    id: 'aura',
    name: 'Aura',
    image: '/images/characters/aura.png',
    currentDialogue: '',
    style: { right: '25%', top: '65%' }
  },
  {
    id: 'professor_phonix',
    name: 'Professor Phonix',
    image: '/images/characters/professor_phonix.png',
    currentDialogue: '',
    style: { left: '15%', top: '70%' }
  }
])

const transitioningCharacters = ref([])
const charactersVR = ref([
  {
    id: 'vr_professor',
    name: 'VR Professor',
    vrStyle: { left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }
  },
  {
    id: 'dimension_guardian',
    name: 'Dimension Guardian',
    vrStyle: { right: '20%', top: '45%' }
  }
])

// Effect data
const dimensionalRifts = ref([])
const energyBeams = ref([])
const currentDialogue = ref(null)
const transitionMessage = ref('VR世界への扉が開かれています...')

// VR Features for preview
const vrFeatures = ref([
  {
    id: 'immersive_learning',
    icon: '🥽',
    title: '完全没入学習',
    description: '3D空間で言語を体感'
  },
  {
    id: 'spatial_interaction',
    icon: '🤲',
    title: '空間インタラクション',
    description: '手で言葉を操作'
  },
  {
    id: 'realistic_conversation',
    icon: '💬',
    title: 'リアル会話',
    description: 'AIキャラクターとの自然な対話'
  },
  {
    id: 'unlimited_worlds',
    title: '無限の世界',
    icon: '🌍',
    description: '世界中を旅しながら学習'
  }
])

// Element references
const portalElement = ref<HTMLElement>()
const portalCore = ref<HTMLElement>()
const vrCanvas = ref<HTMLCanvasElement>()
const particlesContainer = ref<HTMLElement>()
const transitionCharacters = ref<HTMLElement[]>([])

// Animation timelines
let portalTimeline: gsap.core.Timeline | null = null
let transitionTimeline: gsap.core.Timeline | null = null

// Methods
const activatePortal = async () => {
  if (!canActivatePortal.value) return

  emit('portalActivated')
  isPortalActive.value = true
  
  await createPortalActivationSequence()
  await showInitialDialogue()
}

const createPortalActivationSequence = async () => {
  if (!portalElement.value) return

  portalTimeline = gsap.timeline()
  
  // Portal ring activation
  portalTimeline
    .to('.outer-ring', { 
      scale: 1.2, 
      rotation: 360, 
      duration: 2, 
      ease: 'power2.out' 
    })
    .to('.middle-ring', { 
      scale: 1.1, 
      rotation: -360, 
      duration: 1.5, 
      ease: 'power2.out' 
    }, '-=1.5')
    .to('.inner-ring', { 
      scale: 1.05, 
      rotation: 180, 
      duration: 1, 
      ease: 'power2.out' 
    }, '-=1')
    .to('.core-energy', {
      scale: 1.5,
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    }, '-=0.5')

  // Environmental effects
  showRifts.value = true
  showEnergyBeams.value = true
  
  await animateEnvironmentalEffects()
  await createVRPreview()
}

const animateEnvironmentalEffects = async () => {
  // Animate grid and energy field
  gsap.to(gridOpacity, { value: 0.8, duration: 2 })
  gsap.to(energyScale, { value: 1.3, duration: 2, ease: 'power2.inOut' })
  
  // Create dimensional rifts
  dimensionalRifts.value = Array.from({ length: 3 }, (_, i) => ({
    id: `rift_${i}`,
    type: 'dimensional',
    style: {
      left: `${20 + i * 30}%`,
      top: `${30 + i * 15}%`,
      transform: `rotate(${i * 45}deg)`
    }
  }))

  // Create energy beams
  energyBeams.value = [
    {
      id: 'beam_1',
      type: 'primary',
      path: 'M 100 100 Q 300 50 500 200',
      width: 3
    },
    {
      id: 'beam_2',
      type: 'secondary',
      path: 'M 200 300 Q 400 150 600 250',
      width: 2
    }
  ]
}

const createVRPreview = async () => {
  if (!vrCanvas.value) return

  const ctx = vrCanvas.value.getContext('2d')
  if (!ctx) return

  vrCanvas.value.width = 400
  vrCanvas.value.height = 300

  // Draw 3D preview representation
  const drawVRPreview = () => {
    ctx.clearRect(0, 0, 400, 300)
    
    // Draw 3D space grid
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 1
    
    for (let i = 0; i < 10; i++) {
      const x = i * 40
      const y = i * 30
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 300)
      ctx.moveTo(0, y)
      ctx.lineTo(400, y)
      ctx.stroke()
    }

    // Draw floating words
    ctx.fillStyle = '#ffff00'
    ctx.font = '20px Arial'
    ctx.fillText('Hello', 100, 100)
    ctx.fillText('こんにちは', 200, 150)
    ctx.fillText('Hola', 300, 200)
  }

  drawVRPreview()
  
  // Animate preview
  let frame = 0
  const animatePreview = () => {
    frame++
    if (frame % 60 === 0) {
      drawVRPreview()
    }
    if (isPortalActive.value) {
      requestAnimationFrame(animatePreview)
    }
  }
  animatePreview()
}

const showInitialDialogue = async () => {
  const dialogues = [
    {
      speaker: 'Aura',
      text: 'Portal起動完了。VR世界への接続を確認しました',
      emotion: 'analytical'
    },
    {
      speaker: 'Captain Nova',
      text: 'すごい...本当に次元の扉が開いた',
      emotion: 'amazed'  
    },
    {
      speaker: 'VR Guide',
      text: 'ようこそ、Language Galaxy Academy へ',
      emotion: 'welcoming'
    }
  ]

  for (const dialogue of dialogues) {
    currentDialogue.value = dialogue
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  
  currentDialogue.value = null
}

const startTransition = async () => {
  if (!isPortalActive.value) return

  emit('transitionStarted')
  isTransitioning.value = true
  transitionOpacity.value = 0.8

  await createTransitionSequence()
}

const createTransitionSequence = async () => {
  transitionTimeline = gsap.timeline()

  // Phase 1: 2D character preparation
  transitionMessage.value = '2Dキャラクターを3D形式に変換中...'
  transitioningCharacters.value = characters2D.value.map(char => ({
    ...char,
    twoDOpacity: 1,
    threeDOpacity: 0
  }))

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Phase 2: Dimensional transformation
  transitionMessage.value = '次元変換を実行中...'
  transitionProgress.value = 25

  transitionTimeline.to('.character-2d-form', {
    opacity: 0,
    scale: 0.8,
    duration: 1,
    stagger: 0.2
  })

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Phase 3: 3D materialization
  transitionMessage.value = '3D世界でのキャラクター再構築中...'
  transitionProgress.value = 50

  transitionTimeline.to('.character-3d-form', {
    opacity: 1,
    scale: 1,
    duration: 1,
    stagger: 0.2
  })

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Phase 4: VR world integration
  transitionMessage.value = 'VR環境に統合中...'
  transitionProgress.value = 75
  showVRCharacters.value = true

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Phase 5: Completion
  transitionMessage.value = '変換完了！VR世界へようこそ！'
  transitionProgress.value = 100

  await new Promise(resolve => setTimeout(resolve, 1500))

  // Complete transition
  isTransitioning.value = false
  transitionOpacity.value = 0
  emit('transitionComplete')
  emit('vrLaunched')
}

const showPreview = () => {
  showPreviewModal.value = true
  emit('previewShown')
}

const closePreview = () => {
  showPreviewModal.value = false
}

const createParticleEffect = () => {
  if (!particlesContainer.value) return

  const particle = document.createElement('div')
  particle.className = 'portal-particle'
  particle.textContent = ['✨', '🌟', '💫', '🔮'][Math.floor(Math.random() * 4)]
  particle.style.position = 'absolute'
  particle.style.left = `${Math.random() * 100}%`
  particle.style.top = `${Math.random() * 100}%`
  particle.style.fontSize = `${0.8 + Math.random() * 0.8}rem`
  particle.style.pointerEvents = 'none'
  particle.style.zIndex = '10'

  particlesContainer.value.appendChild(particle)

  gsap.to(particle, {
    x: (Math.random() - 0.5) * 200,
    y: -100 - Math.random() * 100,
    rotation: Math.random() * 360,
    opacity: 0,
    duration: 3 + Math.random() * 2,
    ease: 'power2.out',
    onComplete: () => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    }
  })
}

// Lifecycle
onMounted(() => {
  // Start particle effects
  const particleInterval = setInterval(() => {
    if (isPortalActive.value) {
      createParticleEffect()
    }
  }, 500)

  if (props.autoStart) {
    setTimeout(() => {
      activatePortal()
    }, 1000)
  }

  onUnmounted(() => {
    clearInterval(particleInterval)
    if (portalTimeline) portalTimeline.kill()
    if (transitionTimeline) transitionTimeline.kill()
  })
})

// Watchers
watch(() => props.playerReadiness, (newValue) => {
  // Update readiness indicators
})

// Expose methods
defineExpose({
  activatePortal,
  startTransition,
  showPreview
})
</script>

<style scoped>
.vr-portal-scene {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #1a1a3e 100%);
  color: white;
}

.scene-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.starfield-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 6s ease-in-out infinite alternate;
}

.dimensional-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  transition: opacity 2s ease;
}

.energy-field {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%) scale(1);
  background: radial-gradient(circle, rgba(255,0,255,0.2) 0%, transparent 70%);
  border-radius: 50%;
  transition: transform 2s ease;
}

.vr-portal {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  height: 400px;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.portal-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  animation: rotate 10s linear infinite;
}

.outer-ring {
  width: 100%;
  height: 100%;
  border-color: #00ffff;
  animation-duration: 15s;
}

.middle-ring {
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-color: #ff00ff;
  animation-direction: reverse;
  animation-duration: 12s;
}

.inner-ring {
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-color: #ffff00;
  animation-duration: 8s;
}

.portal-core {
  position: absolute;
  top: 30%;
  left: 30%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,255,255,0.4) 50%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-energy {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #ffffff 0%, #00ffff 50%, #ff00ff 100%);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 2s ease-in-out infinite;
}

.dimensional-gateway {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
}

.vr-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.vr-canvas {
  border: 2px solid #00ffff;
  border-radius: 10px;
  background: rgba(0,0,0,0.5);
}

.vr-text {
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.character-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.character-2d {
  position: absolute;
  width: 120px;
  height: 120px;
  transition: all 0.5s ease;
}

.character-2d img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #00ffff;
}

.character-transition {
  position: absolute;
  width: 150px;
  height: 150px;
}

.character-3d-form {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.character-3d-representation {
  width: 100%;
  height: 100%;
  position: relative;
}

.depth-layers {
  position: absolute;
  width: 100%;
  height: 100%;
}

.layer {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  background: linear-gradient(45deg, rgba(0,255,255,0.3), rgba(255,0,255,0.3));
}

.layer.front {
  z-index: 3;
  transform: translateZ(20px);
}

.layer.middle {
  z-index: 2;
  transform: translateZ(10px);
  opacity: 0.7;
}

.layer.back {
  z-index: 1;
  transform: translateZ(0px);
  opacity: 0.4;
}

.character-vr {
  position: absolute;
  width: 150px;
  height: 150px;
}

.character-hologram {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.3));
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.hologram-scanlines {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,255,255,0.1) 2px,
    rgba(0,255,255,0.1) 4px
  );
  animation: scan 2s linear infinite;
}

.effects-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.portal-particle {
  position: absolute;
  font-size: 1rem;
  opacity: 0.8;
  text-shadow: 0 0 10px currentColor;
}

.dimensional-rifts {
  position: absolute;
  width: 100%;
  height: 100%;
}

.rift {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(0deg, transparent, #ff00ff, transparent);
  box-shadow: 0 0 20px #ff00ff;
  animation: riftFlicker 1s ease-in-out infinite alternate;
}

.energy-beams {
  position: absolute;
  width: 100%;
  height: 100%;
}

.energy-beam {
  animation: beamPulse 2s ease-in-out infinite;
}

.vr-control-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0,0,0,0.8);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.panel-content h3 {
  color: #00ffff;
  margin-bottom: 15px;
  text-align: center;
}

.readiness-indicator {
  margin-bottom: 15px;
}

.indicator-label {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.readiness-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.readiness-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00);
  transition: width 0.5s ease;
}

.readiness-text {
  font-size: 0.8rem;
  color: #00ffff;
  text-align: center;
}

.portal-status {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.status-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #666;
  margin-right: 10px;
  transition: background 0.3s ease;
}

.status-light.active {
  background: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-buttons button {
  padding: 10px;
  border: 1px solid #00ffff;
  background: rgba(0,255,255,0.1);
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-buttons button:hover:not(:disabled) {
  background: rgba(0,255,255,0.3);
  transform: scale(1.05);
}

.control-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-buttons button.ready {
  background: rgba(0,255,0,0.2);
  border-color: #00ff00;
}

.control-buttons button.available {
  background: rgba(255,255,0,0.2);
  border-color: #ffff00;
}

.dialogue-system {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
  z-index: 8;
}

.dialogue-container {
  background: rgba(0,0,0,0.8);
  border: 2px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.speaker-name {
  color: #00ffff;
  font-weight: bold;
  margin-bottom: 10px;
}

.dialogue-text {
  font-size: 1.1rem;
  line-height: 1.4;
}

.vr-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  width: 80%;
  max-width: 800px;
  background: rgba(0,0,0,0.9);
  border: 2px solid #00ffff;
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(15px);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h2 {
  color: #00ffff;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.feature-card {
  text-align: center;
  padding: 20px;
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  border: 1px solid #00ffff;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.feature-card h3 {
  color: #00ffff;
  margin-bottom: 10px;
}

.transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(45deg, rgba(0,0,0,0.9), rgba(0,255,255,0.1), rgba(255,0,255,0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.transition-content {
  text-align: center;
  color: white;
}

.dimension-shift {
  width: 200px;
  height: 200px;
  margin: 0 auto 30px;
  position: relative;
}

.shift-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid;
  border-radius: 50%;
  animation: dimensionShift 2s ease-in-out infinite;
}

.shift-layer:nth-child(1) { border-color: #00ffff; }
.shift-layer:nth-child(2) { border-color: #ff00ff; }
.shift-layer:nth-child(3) { border-color: #ffff00; }
.shift-layer:nth-child(4) { border-color: #00ff00; }
.shift-layer:nth-child(5) { border-color: #ff0000; }

.transition-text h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-indicator {
  width: 300px;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  margin: 20px auto 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
  transition: width 0.5s ease;
}

/* Animations */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes riftFlicker {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes beamPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes dimensionShift {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.8) rotate(360deg); opacity: 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .vr-control-panel {
    width: 250px;
    bottom: 10px;
    right: 10px;
  }
  
  .vr-portal {
    width: 300px;
    height: 300px;
  }
  
  .preview-content {
    width: 95%;
    padding: 20px;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>