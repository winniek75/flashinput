<template>
  <div class="sound-radar-game min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- Stars Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute bg-white rounded-full animate-pulse"
        :style="{
          left: star.x + '%',
          top: star.y + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          animationDelay: star.delay + 's'
        }"
      ></div>
    </div>

    <!-- Game Header -->
    <header class="relative z-10 p-6 text-white">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <i class="fas fa-satellite-dish text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Sound Radar Command Center
            </h1>
            <p class="text-blue-200 text-sm">宇宙音素レーダー探査</p>
          </div>
        </div>
        
        <!-- Emergency Call Button -->
        <EmergencyCallButton 
          v-if="userRole === 'copilot'"
          @emergency="handleEmergencyCall"
          :disabled="gameState.emergency?.active"
        />
        
        <!-- Session Status -->
        <div class="text-right">
          <div class="text-sm text-cyan-300">
            セッション: {{ sessionId }}
          </div>
          <div class="text-xs text-blue-200">
            状態: {{ gameState.status }}
          </div>
        </div>
      </div>
    </header>

    <!-- 3D Mode Toggle -->
    <div class="fixed top-20 right-6 z-20">
      <button
        @click="toggle3DMode"
        class="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
               text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105
               flex items-center space-x-2 shadow-lg backdrop-blur"
      >
        <i :class="is3DMode ? 'fas fa-cube' : 'fas fa-circle'"></i>
        <span>{{ is3DMode ? '3Dモード' : '2Dモード' }}</span>
      </button>
    </div>

    <!-- 3D Mode Instructions -->
    <div
      v-if="is3DMode && showInstructions"
      class="fixed top-32 right-6 z-20 bg-slate-800/90 backdrop-blur rounded-lg p-4 text-white text-sm max-w-xs"
    >
      <div class="flex justify-between items-start mb-2">
        <h4 class="font-semibold text-cyan-300">3D操作方法</h4>
        <button @click="showInstructions = false" class="text-gray-400 hover:text-white">×</button>
      </div>
      <ul class="space-y-1 text-xs">
        <li><kbd>マウスドラッグ</kbd> - 視点回転</li>
        <li><kbd>WASD</kbd> - 前後左右移動</li>
        <li><kbd>Space</kbd> - 上昇</li>
        <li><kbd>Shift</kbd> - 下降</li>
        <li><kbd>Q/E</kbd> - 左右回転</li>
      </ul>
    </div>

    <!-- Main Game Area -->
    <main class="relative z-10 flex-1 p-6">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Radar Display (Captain/Co-Pilot shared view) -->
          <div class="lg:col-span-2">
            <!-- 3D Canvas Container -->
            <div
              v-if="is3DMode"
              ref="canvas3D"
              class="w-full h-96 bg-black rounded-xl border border-cyan-500/30 relative overflow-hidden"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
              @wheel="onWheel"
              tabindex="0"
              @keydown="onKeyDown"
              @keyup="onKeyUp"
            >
              <canvas ref="threeCanvas" class="w-full h-full canvas-3d"></canvas>

              <!-- 3D UI Overlay -->
              <div class="absolute top-4 left-4 text-white text-sm bg-black/50 rounded px-2 py-1">
                <div>位置: ({{ Math.round(camera3D.position.x) }}, {{ Math.round(camera3D.position.y) }}, {{ Math.round(camera3D.position.z) }})</div>
                <div>音素: {{ currentPhoneme || '待機中' }}</div>
                <div v-if="detected3DTargets.length > 0">発見: {{ detected3DTargets.length }}個</div>
              </div>

              <!-- Crosshair -->
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div class="w-8 h-8 border-2 border-cyan-400 rounded-full opacity-50">
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <!-- Traditional 2D Radar Display -->
            <RadarDisplay
              v-else
              :current-phoneme="currentPhoneme"
              :scanning="isScanning"
              :phoneme-detected="phonemeDetected"
              :user-role="userRole"
              :radar-data="radarData"
              @start-scan="startPhonemeScanning"
              @phoneme-found="onPhonemeFound"
            />
          </div>

          <!-- Control Panel -->
          <div class="space-y-6">
            
            <!-- Phoneme Detector (Co-Pilot) -->
            <PhonemeDetector
              v-if="userRole === 'copilot'"
              :target-phoneme="currentPhoneme"
              :is-active="phonemeDetected && !pronunciationComplete"
              @pronunciation-result="handlePronunciationResult"
              @audio-data="handleAudioData"
            />

            <!-- Captain Controls -->
            <div v-if="userRole === 'captain'" class="space-y-4">
              <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-cyan-500/30">
                <h3 class="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                  <i class="fas fa-user-tie mr-2"></i>
                  Captain Controls
                </h3>
                
                <div class="space-y-3">
                  <button
                    @click="startNewScan"
                    :disabled="isScanning || gameState.status !== 'active'"
                    class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 
                           disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg 
                           transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
                  >
                    <i class="fas fa-radar mr-2"></i>
                    新規スキャン開始
                  </button>
                  
                  <button
                    @click="nextPhoneme"
                    :disabled="!canProceedToNext"
                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                           disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-4 rounded-lg 
                           transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
                  >
                    <i class="fas fa-arrow-right mr-2"></i>
                    次の音素へ
                  </button>
                </div>
              </div>
            </div>

            <!-- Cooperative Scoring -->
            <CooperativeScoring
              :captain-score="gameState.progress?.captainScore || 0"
              :copilot-score="gameState.progress?.coPilotScore || 0"
              :total-score="gameState.progress?.score || 0"
              :current-phase="gameState.progress?.currentPhase || 0"
              :total-phases="gameState.progress?.totalPhases || 5"
              :recent-success="recentSuccess"
            />

            <!-- Communication Panel -->
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-cyan-500/30">
              <h3 class="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
                <i class="fas fa-comments mr-2"></i>
                通信
              </h3>
              
              <!-- Emergency Alert -->
              <div 
                v-if="gameState.emergency?.active"
                class="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg animate-pulse"
              >
                <div class="flex items-center text-red-300">
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  緊急コール受信中
                </div>
                <p class="text-sm text-red-200 mt-1">
                  {{ gameState.emergency.message || 'Co-Pilotがヘルプを求めています' }}
                </p>
                <button
                  v-if="userRole === 'captain'"
                  @click="resolveEmergency"
                  class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  対応完了
                </button>
              </div>

              <!-- Status Messages -->
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div 
                  v-for="message in recentMessages" 
                  :key="message.id"
                  class="text-sm p-2 bg-slate-700/50 rounded border-l-2"
                  :class="getMessageStyle(message)"
                >
                  <span class="font-medium">{{ message.fromRole === 'captain' ? 'Captain' : 'Co-Pilot' }}:</span>
                  {{ message.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Animation Overlay -->
    <div 
      v-if="showSuccessAnimation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <!-- Confetti particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          v-for="particle in confettiParticles" 
          :key="particle.id"
          class="absolute w-3 h-3 animate-confetti-fall"
          :style="{
            left: particle.x + '%',
            backgroundColor: particle.color,
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        ></div>
      </div>

      <!-- Success content -->
      <div class="text-center text-white space-y-6 animate-system-boot">
        <!-- Success icon with explosion effect -->
        <div class="relative">
          <div class="text-8xl animate-success-explosion">🎯</div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full animate-radar-ping"></div>
          </div>
        </div>

        <!-- Success title with neon effect -->
        <h2 class="text-5xl font-bold neon-cyan animate-achievement-glow">
          音素発見成功！
        </h2>
        
        <!-- Phoneme info -->
        <div class="space-y-2">
          <p class="text-2xl text-blue-200">
            {{ currentPhoneme?.symbol }} - {{ currentPhoneme?.ipa }}
          </p>
          <p class="text-lg text-cyan-300">
            協力ミッション完了
          </p>
        </div>

        <!-- Team celebration -->
        <div class="flex justify-center space-x-8 mt-8">
          <div class="text-center animate-team-sync">
            <div class="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-tie text-white text-xl"></i>
            </div>
            <div class="text-cyan-300 font-medium">Captain</div>
            <div class="text-white text-sm">発見成功!</div>
          </div>
          
          <div class="flex items-center">
            <div class="w-16 h-1 bg-gradient-to-r from-cyan-400 to-green-400 animate-connection-pulse"></div>
          </div>
          
          <div class="text-center animate-team-sync animate-delay-1">
            <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-2">
              <i class="fas fa-user-astronaut text-white text-xl"></i>
            </div>
            <div class="text-green-300 font-medium">Co-Pilot</div>
            <div class="text-white text-sm">発音成功!</div>
          </div>
        </div>

        <!-- Score celebration -->
        <div class="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 glass-morphism-dark">
          <div class="text-purple-300 text-sm mb-2">獲得ポイント</div>
          <div class="text-4xl font-bold neon-purple animate-score-bounce">
            +{{ (recentSuccess?.bonusPoints || 150) }}
          </div>
          <div class="text-pink-200 text-sm mt-2">チームワークボーナス</div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div 
      v-if="isLoading"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div class="text-center text-white">
        <div class="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg">{{ loadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCooperativeGameStore } from '@/stores/cooperativeGame'
import { useAuthStore } from '@/stores/auth'
import { cooperativeGameService } from '@/services/cooperativeGameService'
import { NATIVE_PHONEME_PROGRESSION as PHONEME_PROGRESSION } from '@/data/native-phoneme-database.js'
import RadarDisplay from './RadarDisplay.vue'
import PhonemeDetector from './PhonemeDetector.vue'
import CooperativeScoring from './CooperativeScoring.vue'
import EmergencyCallButton from './EmergencyCallButton.vue'

// Three.js imports for 3D mode
import * as THREE from 'three'

// Props
const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
})

// Stores
const gameStore = useCooperativeGameStore()
const authStore = useAuthStore()

// Reactive data
const gameState = reactive({
  status: 'waiting',
  progress: {
    currentPhase: 0,
    totalPhases: 5,
    captainScore: 0,
    coPilotScore: 0,
    score: 0
  },
  emergency: null
})

const isLoading = ref(false)
const loadingMessage = ref('')
const isScanning = ref(false)
const phonemeDetected = ref(false)
const pronunciationComplete = ref(false)
const showSuccessAnimation = ref(false)
const recentSuccess = ref(null)
const recentMessages = ref([])

// Current game data
const currentPhoneme = ref(null)
const radarData = ref({
  signals: [],
  scanAngle: 0,
  foundSignals: []
})

// Stars for background
const stars = ref([])

// Confetti particles for success animation
const confettiParticles = ref([])

// 3D Mode variables
const is3DMode = ref(false)
const showInstructions = ref(true)
const canvas3D = ref(null)
const threeCanvas = ref(null)
const scene3D = ref(null)
const camera3D = ref(null)
const renderer3D = ref(null)
const radarSphere = ref(null)
const phonemeTargets3D = ref([])
const detected3DTargets = ref([])

// Mouse and keyboard controls
const mouseDown = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)
const keysPressed = ref(new Set())
const moveSpeed = ref(2)

// Computed
const userRole = computed(() => authStore.currentUser?.role || authStore.userRole)

const canProceedToNext = computed(() => {
  return pronunciationComplete.value && 
         gameState.status === 'active' && 
         userRole.value === 'captain'
})

// Methods
const initializeGame = async () => {
  isLoading.value = true
  loadingMessage.value = 'ゲームを初期化中...'

  try {
    // Join or create session
    if (userRole.value === 'captain') {
      await createGameSession()
    } else {
      await joinGameSession()
    }

    // Initialize phoneme progression
    initializePhonemes()
    
    // Set up real-time listeners
    setupRealtimeListeners()
    
    // Generate background stars
    generateStars()
    
  } catch (error) {
    logger.error('Failed to initialize game:', error)
  } finally {
    isLoading.value = false
  }
}

const createGameSession = async () => {
  const gameConfig = {
    type: 'soundRadar',
    difficulty: 'beginner',
    totalPhases: 5,
    maxDuration: 30,
    gameData: {
      phonemeStage: 'stage1A',
      currentPhonemeIndex: 0
    }
  }

  const result = await cooperativeGameService.createSession(gameConfig)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const joinGameSession = async () => {
  const result = await cooperativeGameService.joinSession(props.sessionId)
  if (!result.success) {
    throw new Error(result.error)
  }
}

const initializePhonemes = () => {
  const phonemes = PHONEME_PROGRESSION.stage1A
  currentPhoneme.value = phonemes[0]
}

const setupRealtimeListeners = () => {
  // Override service event handlers
  cooperativeGameService.onSessionUpdate = (sessionData) => {
    Object.assign(gameState, sessionData)
  }

  cooperativeGameService.onProgressUpdate = (progressData) => {
    Object.assign(gameState.progress, progressData)
  }

  cooperativeGameService.onEmergencyUpdate = (emergencyData) => {
    gameState.emergency = emergencyData
  }

  cooperativeGameService.onMessagesUpdate = (messages) => {
    recentMessages.value = messages.slice(-5) // Keep last 5 messages
  }
}

const generateStars = () => {
  stars.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2
  }))
}

const startNewScan = async () => {
  if (userRole.value !== 'captain') return

  isScanning.value = true
  phonemeDetected.value = false
  pronunciationComplete.value = false

  // Update game state
  await cooperativeGameService.updateProgress({
    scanning: true,
    currentPhoneme: currentPhoneme.value
  })

  // Simulate radar scanning
  setTimeout(() => {
    startPhonemeScanning()
  }, 1000)
}

const startPhonemeScanning = () => {
  // Animate radar sweep
  const scanInterval = setInterval(() => {
    radarData.value.scanAngle += 5
    if (radarData.value.scanAngle >= 360) {
      radarData.value.scanAngle = 0
    }
  }, 50)

  // Simulate phoneme detection after scanning
  setTimeout(() => {
    clearInterval(scanInterval)
    onPhonemeFound()
  }, 3000)
}

const onPhonemeFound = async () => {
  phonemeDetected.value = true
  isScanning.value = false

  // Add signal to radar
  radarData.value.foundSignals.push({
    phoneme: currentPhoneme.value,
    angle: Math.random() * 360,
    distance: Math.random() * 0.8 + 0.2,
    timestamp: Date.now()
  })

  // Update game state
  await cooperativeGameService.updateProgress({
    phonemeDetected: true,
    scanning: false
  })

  // Send message to co-pilot
  await cooperativeGameService.sendMessage(
    `音素 ${currentPhoneme.value.symbol} を発見！Co-Pilotの発音をお願いします`,
    'game_update'
  )
}

const handlePronunciationResult = async (result) => {
  if (!phonemeDetected.value) return

  const { accuracy, isCorrect, audioData } = result

  if (isCorrect && accuracy > 0.8) {
    pronunciationComplete.value = true
    
    // Update scores
    const captainScore = gameState.progress.captainScore + 50 // Discovery bonus
    const coPilotScore = gameState.progress.coPilotScore + Math.round(accuracy * 100)
    
    await cooperativeGameService.updateScore('captain', captainScore)
    await cooperativeGameService.updateScore('copilot', coPilotScore)

    // Show success animation
    showSuccessEffect()
    
    // Send success message
    await cooperativeGameService.sendMessage(
      `音素 ${currentPhoneme.value.symbol} 発音成功！ 精度: ${Math.round(accuracy * 100)}%`,
      'success'
    )
  } else {
    // Encourage retry
    await cooperativeGameService.sendMessage(
      `もう一度お試しください。目標音素: ${currentPhoneme.value.symbol}`,
      'encouragement'
    )
  }
}

const handleAudioData = (audioData) => {
  // Process audio data for visualization
  // This could be used for real-time audio visualization
}

const nextPhoneme = async () => {
  if (userRole.value !== 'captain' || !canProceedToNext.value) return

  const phonemes = PHONEME_PROGRESSION.stage1A
  const currentIndex = phonemes.findIndex(p => p.symbol === currentPhoneme.value.symbol)
  
  if (currentIndex < phonemes.length - 1) {
    currentPhoneme.value = phonemes[currentIndex + 1]
    
    // Reset game state for next phoneme
    phonemeDetected.value = false
    pronunciationComplete.value = false
    radarData.value.foundSignals = []
    
    // Update phase progress
    await cooperativeGameService.updateProgress({
      currentPhase: gameState.progress.currentPhase + 1,
      currentPhoneme: currentPhoneme.value,
      phonemeDetected: false
    })

    await cooperativeGameService.sendMessage(
      `次の音素: ${currentPhoneme.value.symbol} の探索を開始します`,
      'phase_change'
    )
  } else {
    // Game complete
    await cooperativeGameService.endSession()
    showGameCompleteAnimation()
  }
}

const showSuccessEffect = () => {
  showSuccessAnimation.value = true
  recentSuccess.value = {
    phoneme: currentPhoneme.value.symbol,
    timestamp: Date.now(),
    bonusPoints: 150
  }

  // Generate confetti particles
  generateConfetti()

  setTimeout(() => {
    showSuccessAnimation.value = false
    confettiParticles.value = []
  }, 4000)
}

const generateConfetti = () => {
  const colors = ['#22d3ee', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#ec4899']
  confettiParticles.value = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }))
}

const showGameCompleteAnimation = () => {
  // Implementation for game completion
  logger.log('Game completed!')
}

const handleEmergencyCall = async (message) => {
  await cooperativeGameService.sendEmergencyCall(message)
}

const resolveEmergency = async () => {
  await cooperativeGameService.resolveEmergencyCall()
}

const getMessageStyle = (message) => {
  const styles = {
    success: 'border-green-500 text-green-300',
    error: 'border-red-500 text-red-300',
    game_update: 'border-blue-500 text-blue-300',
    encouragement: 'border-yellow-500 text-yellow-300',
    phase_change: 'border-purple-500 text-purple-300'
  }
  return styles[message.type] || 'border-gray-500 text-gray-300'
}

// 3D Mode Methods
const toggle3DMode = () => {
  is3DMode.value = !is3DMode.value
  showInstructions.value = is3DMode.value

  if (is3DMode.value) {
    setTimeout(() => {
      init3DScene()
    }, 100)
  } else {
    cleanup3DScene()
  }
}

const init3DScene = () => {
  if (!threeCanvas.value) return

  // Create scene
  scene3D.value = new THREE.Scene()
  scene3D.value.background = new THREE.Color(0x000511)

  // Create camera
  camera3D.value = new THREE.PerspectiveCamera(
    75,
    threeCanvas.value.clientWidth / threeCanvas.value.clientHeight,
    0.1,
    1000
  )
  camera3D.value.position.set(0, 0, 10)

  // Create renderer
  renderer3D.value = new THREE.WebGLRenderer({
    canvas: threeCanvas.value,
    antialias: true
  })
  renderer3D.value.setSize(threeCanvas.value.clientWidth, threeCanvas.value.clientHeight)

  // Create space environment
  createSpaceEnvironment()

  // Create radar sphere
  createRadarSphere()

  // Create phoneme targets
  createPhonemeTargets()

  // Start render loop
  animate3D()
}

const createSpaceEnvironment = () => {
  // Add stars
  const starGeometry = new THREE.BufferGeometry()
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    sizeAttenuation: true
  })

  const starVertices = []
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starVertices.push(x, y, z)
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
  const stars3D = new THREE.Points(starGeometry, starMaterial)
  scene3D.value.add(stars3D)

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
  scene3D.value.add(ambientLight)

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0x00aaff, 0.7)
  directionalLight.position.set(1, 1, 1)
  scene3D.value.add(directionalLight)
}

const createRadarSphere = () => {
  const geometry = new THREE.SphereGeometry(15, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  })

  radarSphere.value = new THREE.Mesh(geometry, material)
  scene3D.value.add(radarSphere.value)

  // Add radar ring effect
  const ringGeometry = new THREE.RingGeometry(14, 16, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  })

  const radarRing = new THREE.Mesh(ringGeometry, ringMaterial)
  radarRing.rotation.x = Math.PI / 2
  scene3D.value.add(radarRing)
}

const createPhonemeTargets = () => {
  phonemeTargets3D.value = []

  // Create 5-8 phoneme targets randomly positioned around the radar sphere
  const targetCount = 5 + Math.floor(Math.random() * 4)

  for (let i = 0; i < targetCount; i++) {
    const geometry = new THREE.SphereGeometry(0.8, 16, 16)
    const material = new THREE.MeshPhongMaterial({
      color: i === 0 ? 0xff6600 : 0x6666ff, // First target is the correct one
      transparent: true,
      opacity: 0.8
    })

    const target = new THREE.Mesh(geometry, material)

    // Position randomly around the radar sphere
    const radius = 12 + Math.random() * 8
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI

    target.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    )

    target.userData = {
      isCorrect: i === 0,
      phoneme: i === 0 ? currentPhoneme.value : `dummy_${i}`,
      detected: false
    }

    scene3D.value.add(target)
    phonemeTargets3D.value.push(target)
  }
}

// Mouse controls
const onMouseDown = (event) => {
  mouseDown.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  canvas3D.value.style.cursor = 'grabbing'
}

const onMouseMove = (event) => {
  if (!mouseDown.value || !camera3D.value) return

  const deltaX = event.clientX - lastMouseX.value
  const deltaY = event.clientY - lastMouseY.value

  // Rotate camera based on mouse movement
  const rotationSpeed = 0.005

  // Create a spherical coordinate system for camera rotation
  const spherical = new THREE.Spherical()
  spherical.setFromVector3(camera3D.value.position)

  spherical.theta -= deltaX * rotationSpeed
  spherical.phi += deltaY * rotationSpeed

  // Limit vertical rotation
  spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))

  camera3D.value.position.setFromSpherical(spherical)
  camera3D.value.lookAt(0, 0, 0)

  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

const onMouseUp = () => {
  mouseDown.value = false
  if (canvas3D.value) {
    canvas3D.value.style.cursor = 'grab'
  }
}

const onWheel = (event) => {
  if (!camera3D.value) return

  const delta = event.deltaY * 0.01
  const direction = camera3D.value.position.clone().normalize()

  camera3D.value.position.addScaledVector(direction, delta)

  // Limit zoom distance
  const distance = camera3D.value.position.length()
  if (distance < 5) {
    camera3D.value.position.setLength(5)
  } else if (distance > 50) {
    camera3D.value.position.setLength(50)
  }
}

// Keyboard controls
const onKeyDown = (event) => {
  keysPressed.value.add(event.code)
  handleMovement()
}

const onKeyUp = (event) => {
  keysPressed.value.delete(event.code)
}

const handleMovement = () => {
  if (!camera3D.value) return

  const forward = new THREE.Vector3(0, 0, -1)
  const right = new THREE.Vector3(1, 0, 0)
  const up = new THREE.Vector3(0, 1, 0)

  // Transform directions relative to camera
  forward.applyQuaternion(camera3D.value.quaternion)
  right.applyQuaternion(camera3D.value.quaternion)

  const moveVector = new THREE.Vector3()

  if (keysPressed.value.has('KeyW')) moveVector.add(forward)
  if (keysPressed.value.has('KeyS')) moveVector.sub(forward)
  if (keysPressed.value.has('KeyA')) moveVector.sub(right)
  if (keysPressed.value.has('KeyD')) moveVector.add(right)
  if (keysPressed.value.has('Space')) moveVector.add(up)
  if (keysPressed.value.has('ShiftLeft')) moveVector.sub(up)

  if (moveVector.length() > 0) {
    moveVector.normalize()
    camera3D.value.position.addScaledVector(moveVector, moveSpeed.value * 0.1)
  }

  // Handle rotation
  if (keysPressed.value.has('KeyQ')) {
    camera3D.value.rotateZ(0.02)
  }
  if (keysPressed.value.has('KeyE')) {
    camera3D.value.rotateZ(-0.02)
  }
}

const animate3D = () => {
  if (!renderer3D.value || !scene3D.value || !camera3D.value) return

  // Rotate radar sphere
  if (radarSphere.value) {
    radarSphere.value.rotation.y += 0.01
  }

  // Animate phoneme targets
  phonemeTargets3D.value.forEach((target, index) => {
    target.rotation.y += 0.02
    target.rotation.x += 0.01

    // Pulse effect for undetected targets
    if (!target.userData.detected) {
      const scale = 1 + 0.2 * Math.sin(Date.now() * 0.005 + index)
      target.scale.setScalar(scale)
    }
  })

  // Check for target detection (simple distance-based)
  checkTargetDetection()

  renderer3D.value.render(scene3D.value, camera3D.value)

  if (is3DMode.value) {
    requestAnimationFrame(animate3D)
  }
}

const checkTargetDetection = () => {
  if (!camera3D.value) return

  const raycaster = new THREE.Raycaster()
  const direction = new THREE.Vector3(0, 0, -1)
  direction.applyQuaternion(camera3D.value.quaternion)

  raycaster.set(camera3D.value.position, direction)

  const intersects = raycaster.intersectObjects(phonemeTargets3D.value)

  if (intersects.length > 0) {
    const target = intersects[0].object
    if (!target.userData.detected && intersects[0].distance < 5) {
      target.userData.detected = true
      target.material.color.setHex(0x00ff00)
      detected3DTargets.value.push(target)

      if (target.userData.isCorrect) {
        onPhonemeFound(target.userData.phoneme)
      }
    }
  }
}

const cleanup3DScene = () => {
  if (renderer3D.value) {
    renderer3D.value.dispose()
    renderer3D.value = null
  }

  if (scene3D.value) {
    scene3D.value.clear()
    scene3D.value = null
  }

  camera3D.value = null
  radarSphere.value = null
  phonemeTargets3D.value = []
  detected3DTargets.value = []
}

// Lifecycle
onMounted(() => {
  initializeGame()
})

onUnmounted(() => {
  cooperativeGameService.cleanup()
  cleanup3DScene()
})

// Watch for session changes
watch(() => props.sessionId, (newSessionId) => {
  if (newSessionId) {
    initializeGame()
  }
})

// Watch for phoneme changes in 3D mode
watch(currentPhoneme, (newPhoneme) => {
  if (is3DMode.value && scene3D.value) {
    // Clear existing targets
    phonemeTargets3D.value.forEach(target => {
      scene3D.value.remove(target)
    })

    // Create new targets for the new phoneme
    createPhonemeTargets()
    detected3DTargets.value = []
  }
})
</script>

<style scoped>
@import '@/assets/css/sound-radar-animations.css';

/* 3D Mode Styles */
.canvas-3d {
  cursor: grab;
  user-select: none;
}

.canvas-3d:active {
  cursor: grabbing;
}

.canvas-3d:focus {
  outline: 2px solid #00aaff;
  outline-offset: 2px;
}

kbd {
  display: inline-block;
  padding: 1px 4px;
  font-size: 10px;
  color: #fff;
  vertical-align: middle;
  background-color: #4a5568;
  border: solid 1px #2d3748;
  border-bottom-color: #1a202c;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #1a202c;
}

.sound-radar-game {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Component-specific styles */
.radar-sweep {
  animation: radar-sweep 3s linear infinite;
}

.phoneme-pulse {
  animation: phoneme-pulse 2s ease-in-out infinite;
}
</style>