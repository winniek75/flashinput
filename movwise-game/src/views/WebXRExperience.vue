<template>
  <div class="webxr-experience" :class="experienceClasses">
    <!-- WebXR Initialization Screen -->
    <div class="webxr-init" v-if="!isXRSupported || initializingXR">
      <div class="init-content">
        <div class="xr-logo">
          <div class="logo-hologram">
            <div class="hologram-ring" v-for="n in 3" :key="n" :style="{ '--delay': n * 0.5 + 's' }"></div>
            <div class="logo-center">
              <Icon name="cube" class="logo-icon" />
            </div>
          </div>
        </div>
        
        <h1 class="xr-title">WebXR Language Academy</h1>
        <p class="xr-subtitle">{{ currentScenario?.title }}</p>
        
        <div class="xr-status">
          <div v-if="!isXRSupported" class="status-unsupported">
            <Icon name="alert-triangle" />
            <h3>WebXRはサポートされていません</h3>
            <p>このブラウザではWebXRがサポートされていません。代替モードで体験を続行できます。</p>
            <div class="fallback-options">
              <button @click="startFallbackMode" class="fallback-btn focus-ring">
                <Icon name="monitor" />
                <span>デスクトップモードで続行</span>
              </button>
              <button @click="goBack" class="back-btn focus-ring">
                <Icon name="arrow-left" />
                <span>戻る</span>
              </button>
            </div>
          </div>
          
          <div v-else-if="initializingXR" class="status-initializing">
            <div class="loading-spinner"></div>
            <h3>WebXRを初期化中...</h3>
            <p>{{ initializationStage }}</p>
            <div class="init-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${initProgress}%` }"></div>
              </div>
              <span class="progress-text">{{ Math.round(initProgress) }}%</span>
            </div>
          </div>
          
          <div v-else class="status-ready">
            <Icon name="check-circle" />
            <h3>WebXR準備完了</h3>
            <p>VRヘッドセットを装着してXR体験を開始してください。</p>
            <div class="xr-start-options">
              <button @click="enterXR" class="xr-btn primary focus-ring" :disabled="!canEnterXR">
                <Icon name="eye" />
                <span>XR体験を開始</span>
              </button>
              <button @click="startFallbackMode" class="xr-btn secondary focus-ring">
                <Icon name="monitor" />
                <span>画面モードで体験</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- WebXR Main Interface -->
    <div class="webxr-main" v-if="isXRSupported && !initializingXR">
      
      <!-- XR Session Controls -->
      <header class="xr-header" :class="{ 'header-hidden': isInXR }">
        <div class="header-content">
          <button @click="exitExperience" class="exit-btn focus-ring">
            <Icon name="arrow-left" />
            <span>終了</span>
          </button>
          
          <div class="scenario-header">
            <h2 class="scenario-title">{{ currentScenario?.title }}</h2>
            <p class="scenario-description">{{ currentScenario?.description }}</p>
          </div>
          
          <div class="xr-controls">
            <button 
              @click="toggleXRSession"
              class="xr-toggle focus-ring"
              :class="{ active: isInXR }"
              :disabled="!canEnterXR"
            >
              <Icon :name="isInXR ? 'eye-off' : 'eye'" />
              <span>{{ isInXR ? 'XR終了' : 'XR開始' }}</span>
            </button>
            
            <button @click="openXRSettings" class="settings-btn focus-ring">
              <Icon name="settings" />
              <span>設定</span>
            </button>
          </div>
        </div>
      </header>

      <!-- XR Viewport -->
      <main class="xr-viewport" id="xr-main-content">
        
        <!-- WebXR Canvas -->
        <canvas 
          ref="xrCanvas"
          class="xr-canvas"
          :width="canvasSize.width"
          :height="canvasSize.height"
        ></canvas>
        
        <!-- XR UI Overlays -->
        <div class="xr-ui-overlays" v-if="!isInXR">
          
          <!-- Hand Tracking Visualization -->
          <div class="hand-tracking" v-if="handTrackingEnabled">
            <div class="hand left-hand" :style="leftHandStyle">
              <div class="hand-indicator">
                <Icon name="hand" />
                <span>L</span>
              </div>
            </div>
            <div class="hand right-hand" :style="rightHandStyle">
              <div class="hand-indicator">
                <Icon name="hand" />
                <span>R</span>
              </div>
            </div>
          </div>
          
          <!-- XR Objects Panel -->
          <div class="xr-objects-panel">
            <h3 class="panel-title">XRオブジェクト</h3>
            <div class="objects-grid">
              <div 
                v-for="object in xrObjects"
                :key="object.id"
                class="xr-object-card"
                :class="{ 'object-completed': object.completed }"
                @click="focusOnObject(object)"
                tabindex="0"
                role="button"
                :aria-label="object.description"
              >
                <div class="object-icon">
                  <Icon :name="object.icon" />
                </div>
                <div class="object-info">
                  <h4 class="object-name">{{ object.name }}</h4>
                  <p class="object-type">{{ object.type }}</p>
                  <div class="object-progress" v-if="object.progress !== undefined">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: `${object.progress}%` }"></div>
                    </div>
                  </div>
                </div>
                <div class="object-status">
                  <Icon :name="object.completed ? 'check' : 'clock'" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- XR Learning Activities -->
          <div class="xr-activities-panel">
            <h3 class="panel-title">学習アクティビティ</h3>
            <div class="activities-list">
              <div 
                v-for="activity in learningActivities"
                :key="activity.id"
                class="activity-item"
                :class="{ 'activity-active': activity.id === currentActivity }"
                @click="startActivity(activity)"
                tabindex="0"
                role="button"
                :aria-label="activity.description"
              >
                <div class="activity-icon">
                  <Icon :name="activity.icon" />
                </div>
                <div class="activity-content">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <p class="activity-description">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <span class="difficulty">{{ activity.difficulty }}</span>
                    <span class="duration">{{ activity.duration }}分</span>
                  </div>
                </div>
                <div class="activity-status">
                  <Icon :name="getActivityStatusIcon(activity)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- XR Performance Monitor -->
        <div class="xr-performance" v-if="showPerformanceMonitor">
          <div class="performance-content">
            <h4>XRパフォーマンス</h4>
            <div class="performance-metrics">
              <div class="metric">
                <span class="metric-label">FPS:</span>
                <span class="metric-value" :class="getFPSClass()">{{ currentFPS }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">フレーム時間:</span>
                <span class="metric-value">{{ frameTime.toFixed(1) }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">描画コール:</span>
                <span class="metric-value">{{ drawCalls }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">ポリゴン:</span>
                <span class="metric-value">{{ polygonCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- XR Instructions -->
        <div class="xr-instructions" v-if="showInstructions && !isInXR">
          <div class="instructions-content">
            <h3>XR体験の操作方法</h3>
            <div class="instruction-grid">
              <div class="instruction-item">
                <Icon name="hand" />
                <div>
                  <h4>ハンドトラッキング</h4>
                  <p>手の動きでオブジェクトを操作</p>
                </div>
              </div>
              <div class="instruction-item">
                <Icon name="eye" />
                <div>
                  <h4>視線追跡</h4>
                  <p>見つめてオブジェクトを選択</p>
                </div>
              </div>
              <div class="instruction-item">
                <Icon name="volume" />
                <div>
                  <h4>音声認識</h4>
                  <p>声でコマンドを実行</p>
                </div>
              </div>
              <div class="instruction-item">
                <Icon name="zap" />
                <div>
                  <h4>ジェスチャー</h4>
                  <p>手の形でアクションを実行</p>
                </div>
              </div>
            </div>
            <button @click="hideInstructions" class="hide-instructions focus-ring">
              <Icon name="x" />
              <span>閉じる</span>
            </button>
          </div>
        </div>
      </main>

      <!-- XR Settings Panel -->
      <aside 
        class="xr-settings-panel"
        :class="{ 'panel-visible': showXRSettings }"
        aria-label="WebXR設定"
      >
        <div class="settings-content">
          <header class="settings-header">
            <h3 class="settings-title">WebXR設定</h3>
            <button @click="closeXRSettings" class="close-settings focus-ring">
              <Icon name="x" />
            </button>
          </header>
          
          <div class="settings-body">
            <div class="setting-category">
              <h4>XRセッション</h4>
              
              <div class="setting-item">
                <label for="xr-mode">XRモード</label>
                <select 
                  id="xr-mode"
                  v-model="xrSettings.mode"
                  @change="applyXRSettings"
                  class="setting-select"
                >
                  <option value="immersive-vr">没入型VR</option>
                  <option value="immersive-ar">没入型AR</option>
                  <option value="inline">インライン</option>
                </select>
              </div>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="hand-tracking"
                  v-model="xrSettings.handTracking"
                  @change="applyXRSettings"
                />
                <label for="hand-tracking">ハンドトラッキングを有効化</label>
              </div>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="eye-tracking"
                  v-model="xrSettings.eyeTracking"
                  @change="applyXRSettings"
                />
                <label for="eye-tracking">視線追跡を有効化</label>
              </div>
            </div>
            
            <div class="setting-category">
              <h4>レンダリング</h4>
              
              <div class="setting-item">
                <label for="render-scale">レンダリング解像度</label>
                <input 
                  id="render-scale"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  v-model="xrSettings.renderScale"
                  @input="applyXRSettings"
                  class="setting-slider"
                />
                <span class="setting-value">{{ xrSettings.renderScale }}x</span>
              </div>
              
              <div class="setting-item">
                <label for="refresh-rate">リフレッシュレート</label>
                <select 
                  id="refresh-rate"
                  v-model="xrSettings.refreshRate"
                  @change="applyXRSettings"
                  class="setting-select"
                >
                  <option value="60">60 Hz</option>
                  <option value="72">72 Hz</option>
                  <option value="90">90 Hz</option>
                  <option value="120">120 Hz</option>
                </select>
              </div>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="foveated-rendering"
                  v-model="xrSettings.foveatedRendering"
                  @change="applyXRSettings"
                />
                <label for="foveated-rendering">中心窩レンダリング</label>
              </div>
            </div>
            
            <div class="setting-category">
              <h4>アクセシビリティ</h4>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="motion-sickness-reduction"
                  v-model="xrSettings.motionSicknessReduction"
                  @change="applyXRSettings"
                />
                <label for="motion-sickness-reduction">VR酔い軽減</label>
              </div>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="high-contrast-xr"
                  v-model="xrSettings.highContrast"
                  @change="applyXRSettings"
                />
                <label for="high-contrast-xr">高コントラスト</label>
              </div>
              
              <div class="setting-toggle">
                <input 
                  type="checkbox"
                  id="spatial-audio"
                  v-model="xrSettings.spatialAudio"
                  @change="applyXRSettings"
                />
                <label for="spatial-audio">空間オーディオ</label>
              </div>
            </div>
          </div>
          
          <div class="settings-actions">
            <button @click="resetXRSettings" class="reset-btn focus-ring">
              リセット
            </button>
            <button @click="saveXRSettings" class="save-btn focus-ring">
              保存
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- XR Error Dialog -->
    <div class="xr-error-dialog" v-if="xrError" @click="clearXRError">
      <div class="error-content" @click.stop>
        <Icon name="alert-circle" class="error-icon" />
        <h3 class="error-title">WebXRエラー</h3>
        <p class="error-message">{{ xrError }}</p>
        <div class="error-actions">
          <button @click="retryXR" class="retry-btn focus-ring">
            <Icon name="refresh" />
            <span>再試行</span>
          </button>
          <button @click="clearXRError" class="dismiss-btn focus-ring">
            <span>閉じる</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import Icon from '@/components/shared/Icon.vue'
import { accessibilityManager } from '@/utils/accessibilityManager'
import { soundManager } from '@/utils/soundManager'

// Props
interface Props {
  scenarioId: string
}

const props = defineProps<Props>()

// Router
const route = useRoute()
const router = useRouter()

// Reactive state
const isXRSupported = ref(false)
const initializingXR = ref(true)
const initializationStage = ref('WebXRサポートを確認中...')
const initProgress = ref(0)
const isInXR = ref(false)
const canEnterXR = ref(false)
const showXRSettings = ref(false)
const showInstructions = ref(true)
const showPerformanceMonitor = ref(false)
const xrError = ref<string | null>(null)

const currentActivity = ref<string | null>(null)
const handTrackingEnabled = ref(false)
const leftHandStyle = ref({})
const rightHandStyle = ref({})

// Performance monitoring
const currentFPS = ref(60)
const frameTime = ref(16.7)
const drawCalls = ref(0)
const polygonCount = ref(0)

const canvasSize = ref({ width: 1920, height: 1080 })
const xrCanvas = ref<HTMLCanvasElement>()
const xrSession = ref<XRSession | null>(null)

// XR Settings
const xrSettings = useStorage('webxr_settings', {
  mode: 'immersive-vr',
  handTracking: true,
  eyeTracking: false,
  renderScale: 1.0,
  refreshRate: 90,
  foveatedRendering: true,
  motionSicknessReduction: false,
  highContrast: false,
  spatialAudio: true
})

// Computed properties
const experienceClasses = computed(() => ({
  'xr-active': isInXR.value,
  'settings-open': showXRSettings.value,
  'hand-tracking-enabled': handTrackingEnabled.value,
  'high-contrast': xrSettings.value.highContrast
}))

// Mock data
const currentScenario = ref({
  id: props.scenarioId,
  title: '宇宙探索WebXR体験',
  description: 'WebXR技術を使用した没入型宇宙探索学習体験',
  type: 'exploration',
  difficulty: 'intermediate'
})

const xrObjects = ref([
  {
    id: 'space-station',
    name: '宇宙ステーション',
    type: '建造物',
    icon: 'building',
    progress: 75,
    completed: false,
    description: '国際宇宙ステーションのモデルを探索'
  },
  {
    id: 'solar-system',
    name: '太陽系モデル',
    type: '天体',
    icon: 'sun',
    progress: 100,
    completed: true,
    description: '太陽系の惑星配置を学習'
  },
  {
    id: 'constellation',
    name: '星座マップ',
    type: '星座',
    icon: 'star',
    progress: 30,
    completed: false,
    description: '主要な星座の位置と名前を学習'
  }
])

const learningActivities = ref([
  {
    id: 'planet-exploration',
    title: '惑星探索',
    description: '各惑星の特徴を詳しく調べる',
    icon: 'globe',
    difficulty: '初級',
    duration: 15,
    status: 'available'
  },
  {
    id: 'gravity-simulation',
    title: '重力シミュレーション',
    description: '異なる重力環境での物理現象を体験',
    icon: 'zap',
    difficulty: '中級',
    duration: 20,
    status: 'locked'
  },
  {
    id: 'space-navigation',
    title: '宇宙航行',
    description: '宇宙船を操縦して目的地まで航行',
    icon: 'navigation',
    difficulty: '上級',
    duration: 25,
    status: 'completed'
  }
])

// Methods
const checkXRSupport = async () => {
  try {
    if ('xr' in navigator) {
      const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr')
      isXRSupported.value = isSupported
      canEnterXR.value = isSupported
    } else {
      isXRSupported.value = false
    }
  } catch (error) {
    logger.error('XR support check failed:', error)
    isXRSupported.value = false
  }
}

const initializeWebXR = async () => {
  const stages = [
    'WebXRサポートを確認中...',
    'XRデバイスを検出中...',
    'XRセッションを準備中...',
    'ハンドトラッキングを設定中...',
    'レンダリングシステムを初期化中...',
    '完了'
  ]

  for (let i = 0; i < stages.length; i++) {
    initializationStage.value = stages[i]
    initProgress.value = (i + 1) * (100 / stages.length)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  initializingXR.value = false
  
  accessibilityManager.announce({
    message: 'WebXR体験の準備が完了しました',
    priority: 'polite'
  })
}

const enterXR = async () => {
  try {
    if (!navigator.xr) {
      throw new Error('WebXRはサポートされていません')
    }

    const session = await (navigator as any).xr.requestSession('immersive-vr', {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hand-tracking', 'eye-tracking']
    })

    xrSession.value = session
    isInXR.value = true

    // Setup XR session
    setupXRSession(session)
    
    // Start XR render loop
    startXRRenderLoop(session)
    
    accessibilityManager.announce({
      message: 'WebXR体験を開始しました',
      priority: 'polite'
    })

  } catch (error) {
    logger.error('Failed to enter XR:', error)
    xrError.value = 'XRセッションの開始に失敗しました: ' + (error as Error).message
  }
}

const exitXR = async () => {
  if (xrSession.value) {
    await xrSession.value.end()
    xrSession.value = null
    isInXR.value = false
    
    accessibilityManager.announce({
      message: 'WebXR体験を終了しました',
      priority: 'polite'
    })
  }
}

const toggleXRSession = () => {
  if (isInXR.value) {
    exitXR()
  } else {
    enterXR()
  }
}

const setupXRSession = (session: XRSession) => {
  // Setup session event handlers
  session.addEventListener('end', () => {
    isInXR.value = false
    xrSession.value = null
  })

  // Setup input sources (controllers, hands)
  session.addEventListener('inputsourceschange', (event) => {
    handleInputSourcesChange(event)
  })

  // Enable hand tracking if supported
  if (xrSettings.value.handTracking) {
    enableHandTracking(session)
  }
}

const startXRRenderLoop = (session: XRSession) => {
  const renderFrame = (time: number, frame: XRFrame) => {
    // Update performance metrics
    updatePerformanceMetrics(time)
    
    // Render XR frame
    renderXRFrame(session, frame)
    
    // Continue render loop
    session.requestAnimationFrame(renderFrame)
  }
  
  session.requestAnimationFrame(renderFrame)
}

const renderXRFrame = (session: XRSession, frame: XRFrame) => {
  // XR rendering logic would go here
  // This is a simplified version for demonstration
  const canvas = xrCanvas.value
  if (!canvas) return
  
  const gl = canvas.getContext('webgl2')
  if (!gl) return
  
  // Clear and render
  gl.clearColor(0, 0, 0.1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  
  // Render XR objects and UI
  renderXRObjects(gl, frame)
}

const renderXRObjects = (gl: WebGL2RenderingContext, frame: XRFrame) => {
  // Render 3D objects in XR space
  // This would contain the actual 3D rendering logic
  drawCalls.value = Math.floor(Math.random() * 50) + 20
  polygonCount.value = Math.floor(Math.random() * 10000) + 5000
}

const updatePerformanceMetrics = (time: number) => {
  // Update FPS and frame time
  const deltaTime = time - (updatePerformanceMetrics as any).lastTime || 0
  ;(updatePerformanceMetrics as any).lastTime = time
  
  if (deltaTime > 0) {
    currentFPS.value = Math.round(1000 / deltaTime)
    frameTime.value = deltaTime
  }
}

const handleInputSourcesChange = (event: any) => {
  // Handle controller and hand input changes
  logger.log('Input sources changed:', event)
}

const enableHandTracking = (session: XRSession) => {
  // Enable hand tracking functionality
  handTrackingEnabled.value = true
  
  // Update hand positions (mock data for demonstration)
  const updateHandPositions = () => {
    leftHandStyle.value = {
      left: '20%',
      top: '60%',
      transform: 'translate(-50%, -50%)'
    }
    
    rightHandStyle.value = {
      right: '20%',
      top: '60%',
      transform: 'translate(50%, -50%)'
    }
  }
  
  setInterval(updateHandPositions, 100)
}

const startFallbackMode = () => {
  // Start desktop fallback mode
  isInXR.value = false
  initializingXR.value = false
  
  accessibilityManager.announce({
    message: 'デスクトップモードで体験を開始します',
    priority: 'polite'
  })
}

const goBack = () => {
  router.push('/vr-academy')
}

const exitExperience = () => {
  if (isInXR.value) {
    exitXR()
  }
  goBack()
}

const openXRSettings = () => {
  showXRSettings.value = true
  accessibilityManager.trapFocus(document.querySelector('.xr-settings-panel') as HTMLElement)
}

const closeXRSettings = () => {
  showXRSettings.value = false
  accessibilityManager.releaseFocusTrap()
}

const applyXRSettings = () => {
  // Apply XR settings to the session
  logger.log('Applying XR settings:', xrSettings.value)
  
  // Update render scale
  if (xrSession.value) {
    // Apply render scale and other settings
    updateXRSessionSettings()
  }
}

const updateXRSessionSettings = () => {
  // Update active XR session with new settings
  if (xrSettings.value.spatialAudio) {
    soundManager.setSettings({
      ...soundManager.settings,
      spatialAudio: true
    })
  }
}

const resetXRSettings = () => {
  xrSettings.value = {
    mode: 'immersive-vr',
    handTracking: true,
    eyeTracking: false,
    renderScale: 1.0,
    refreshRate: 90,
    foveatedRendering: true,
    motionSicknessReduction: false,
    highContrast: false,
    spatialAudio: true
  }
  
  applyXRSettings()
  
  accessibilityManager.announce({
    message: 'WebXR設定をリセットしました',
    priority: 'polite'
  })
}

const saveXRSettings = () => {
  // Settings are automatically saved via useStorage
  closeXRSettings()
  
  accessibilityManager.announce({
    message: 'WebXR設定を保存しました',
    priority: 'polite'
  })
}

const focusOnObject = (object: any) => {
  logger.log('Focusing on object:', object)
  
  // Focus camera on object in XR space
  if (isInXR.value) {
    // Implement XR object focusing
  }
  
  accessibilityManager.announce({
    message: `${object.name}にフォーカスしました`,
    priority: 'polite'
  })
}

const startActivity = (activity: any) => {
  if (activity.status === 'locked') {
    accessibilityManager.announce({
      message: 'このアクティビティはまだロックされています',
      priority: 'polite'
    })
    return
  }
  
  currentActivity.value = activity.id
  
  accessibilityManager.announce({
    message: `${activity.title}を開始しました`,
    priority: 'polite'
  })
}

const getActivityStatusIcon = (activity: any): string => {
  switch (activity.status) {
    case 'completed':
      return 'check-circle'
    case 'locked':
      return 'lock'
    case 'available':
      return 'play-circle'
    default:
      return 'circle'
  }
}

const getFPSClass = (): string => {
  if (currentFPS.value >= 60) return 'fps-good'
  if (currentFPS.value >= 30) return 'fps-ok'
  return 'fps-poor'
}

const hideInstructions = () => {
  showInstructions.value = false
}

const clearXRError = () => {
  xrError.value = null
}

const retryXR = () => {
  xrError.value = null
  enterXR()
}

// Lifecycle
onMounted(async () => {
  // Check WebXR support
  await checkXRSupport()
  
  // Initialize WebXR
  await initializeWebXR()
  
  // Register keyboard shortcuts
  accessibilityManager.registerShortcut('toggle-xr', {
    keys: ['x'],
    action: toggleXRSession,
    description: 'XRセッション切り替え',
    context: 'webxr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('xr-settings', {
    keys: ['s'],
    action: openXRSettings,
    description: 'XR設定を開く',
    context: 'webxr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('toggle-performance', {
    keys: ['p'],
    action: () => { showPerformanceMonitor.value = !showPerformanceMonitor.value },
    description: 'パフォーマンス表示切り替え',
    context: 'webxr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('exit-xr', {
    keys: ['Escape'],
    action: exitExperience,
    description: 'XR体験を終了',
    context: 'webxr',
    enabled: true
  })
  
  // Apply initial settings
  applyXRSettings()
})

onUnmounted(() => {
  // Clean up XR session
  if (xrSession.value) {
    xrSession.value.end()
  }
  
  // Unregister shortcuts
  accessibilityManager.unregisterShortcut('toggle-xr')
  accessibilityManager.unregisterShortcut('xr-settings')
  accessibilityManager.unregisterShortcut('toggle-performance')
  accessibilityManager.unregisterShortcut('exit-xr')
})

// Watch for XR session changes
watch(() => isInXR.value, (newValue) => {
  if (newValue) {
    // Hide cursor and UI elements in XR
    document.body.style.cursor = 'none'
  } else {
    // Restore normal cursor
    document.body.style.cursor = 'auto'
  }
})
</script>

<style scoped>
.webxr-experience {
  min-height: 100vh;
  background: #000;
  color: white;
  position: relative;
  overflow: hidden;
}

.webxr-experience.xr-active {
  cursor: none;
}

/* WebXR Initialization */
.webxr-init {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0d1421 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.init-content {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.xr-logo {
  margin-bottom: 3rem;
}

.logo-hologram {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hologram-ring {
  position: absolute;
  border: 2px solid #00e5ff;
  border-radius: 50%;
  animation: hologramPulse 3s ease-in-out infinite;
  animation-delay: var(--delay);
}

.hologram-ring:nth-child(1) { width: 60px; height: 60px; }
.hologram-ring:nth-child(2) { width: 80px; height: 80px; }
.hologram-ring:nth-child(3) { width: 100px; height: 100px; }

@keyframes hologramPulse {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1); 
    border-color: #00e5ff;
  }
  50% { 
    opacity: 1; 
    transform: scale(1.1); 
    border-color: #80deea;
  }
}

.logo-center {
  position: relative;
  z-index: 10;
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 1.5rem;
  color: #000;
}

.xr-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.xr-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.xr-status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.status-unsupported,
.status-initializing,
.status-ready {
  text-align: center;
}

.status-unsupported Icon,
.status-ready Icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.status-unsupported Icon {
  color: #ff5722;
}

.status-ready Icon {
  color: #4caf50;
}

.status-initializing .loading-spinner {
  width: 60px;
  height: 60px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #00e5ff;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-unsupported h3,
.status-initializing h3,
.status-ready h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.status-unsupported p,
.status-initializing p,
.status-ready p {
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.init-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  transition: width var(--transition-normal) ease;
}

.progress-text {
  color: #00e5ff;
  font-weight: 600;
  min-width: 40px;
}

.fallback-options,
.xr-start-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.fallback-btn,
.back-btn,
.xr-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) ease;
  border: 1px solid transparent;
}

.fallback-btn,
.xr-btn.primary {
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  color: #000;
}

.back-btn,
.xr-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.fallback-btn:hover,
.back-btn:hover,
.xr-btn:hover {
  transform: translateY(-2px);
}

.xr-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* WebXR Main Interface */
.webxr-main {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.webxr-main.xr-active .xr-header {
  opacity: 0;
  pointer-events: none;
}

/* XR Header */
.xr-header {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  transition: opacity var(--transition-normal) ease;
  z-index: 100;
}

.xr-header.header-hidden {
  opacity: 0;
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.exit-btn,
.settings-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) ease;
}

.exit-btn:hover,
.settings-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.scenario-header {
  text-align: center;
  flex: 1;
}

.scenario-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: #00e5ff;
}

.scenario-description {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.xr-controls {
  display: flex;
  gap: 0.5rem;
}

.xr-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) ease;
}

.xr-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.xr-toggle.active {
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  color: #000;
}

.xr-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* XR Viewport */
.xr-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.xr-canvas {
  width: 100%;
  height: 100%;
  background: #000;
}

.xr-ui-overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Hand Tracking */
.hand-tracking {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hand {
  position: absolute;
  pointer-events: all;
  transition: all var(--transition-fast) ease;
}

.hand-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(0, 229, 255, 0.8);
  border-radius: 0.5rem;
  color: #000;
  font-size: 0.8rem;
  font-weight: 600;
}

/* XR Objects Panel */
.xr-objects-panel {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  pointer-events: all;
}

.panel-title {
  font-size: 1.1rem;
  color: #00e5ff;
  margin-bottom: 1rem;
}

.objects-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.xr-object-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.xr-object-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00e5ff;
  transform: translateY(-2px);
}

.xr-object-card.object-completed {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.object-icon {
  width: 40px;
  height: 40px;
  background: rgba(0, 229, 255, 0.2);
  border: 2px solid #00e5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00e5ff;
}

.object-completed .object-icon {
  border-color: #4caf50;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
}

.object-info {
  flex: 1;
}

.object-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.object-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem;
}

.object-progress .progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1.5px;
  overflow: hidden;
}

.object-progress .progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #00e5ff, #18ffff);
}

.object-status {
  color: #4caf50;
}

/* XR Activities Panel */
.xr-activities-panel {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  pointer-events: all;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #00e5ff;
  transform: translateY(-2px);
}

.activity-item.activity-active {
  border-color: #00e5ff;
  background: rgba(0, 229, 255, 0.1);
}

.activity-icon {
  width: 50px;
  height: 50px;
  background: rgba(0, 229, 255, 0.2);
  border: 2px solid #00e5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00e5ff;
  font-size: 1.2rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.activity-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

.activity-status {
  color: #4caf50;
  font-size: 1.2rem;
}

/* XR Performance Monitor */
.xr-performance {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
  pointer-events: all;
}

.performance-content h4 {
  color: #00e5ff;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8rem;
}

.metric-label {
  color: rgba(255, 255, 255, 0.7);
}

.metric-value {
  color: white;
  font-weight: 600;
}

.metric-value.fps-good { color: #4caf50; }
.metric-value.fps-ok { color: #ff9800; }
.metric-value.fps-poor { color: #f44336; }

/* XR Instructions */
.xr-instructions {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  pointer-events: all;
}

.instructions-content h3 {
  color: #00e5ff;
  margin-bottom: 1rem;
}

.instruction-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
}

.instruction-item Icon {
  color: #00e5ff;
  font-size: 1.2rem;
}

.instruction-item h4 {
  font-size: 0.8rem;
  margin: 0 0 0.25rem;
  color: white;
}

.instruction-item p {
  font-size: 0.7rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
}

.hide-instructions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  width: 100%;
  justify-content: center;
}

/* XR Settings Panel */
.xr-settings-panel {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 200;
  overflow-y: auto;
  transition: right var(--transition-normal) ease;
}

.xr-settings-panel.panel-visible {
  right: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-title {
  font-size: 1.5rem;
  color: #00e5ff;
  margin: 0;
}

.close-settings {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.settings-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.setting-category {
  margin-bottom: 2rem;
}

.setting-category h4 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.setting-item label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.setting-slider,
.setting-select {
  width: 120px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  color: white;
  padding: 0.25rem;
}

.setting-value {
  color: #00e5ff;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: right;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.setting-toggle label {
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.settings-actions {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 1rem;
}

.reset-btn,
.save-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) ease;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.save-btn {
  background: linear-gradient(45deg, #00e5ff, #18ffff);
  border: none;
  color: #000;
}

.reset-btn:hover,
.save-btn:hover {
  transform: translateY(-2px);
}

/* XR Error Dialog */
.xr-error-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(4px);
}

.error-content {
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #f44336;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.error-message {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.4;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.retry-btn,
.dismiss-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) ease;
}

.retry-btn {
  background: #00e5ff;
  border: 1px solid #00e5ff;
  color: #000;
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.retry-btn:hover,
.dismiss-btn:hover {
  transform: translateY(-2px);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .init-content {
    padding: 1rem;
  }
  
  .xr-title {
    font-size: 2rem;
  }
  
  .xr-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .xr-objects-panel,
  .xr-activities-panel,
  .xr-instructions {
    position: relative;
    width: 100%;
    margin: 1rem;
  }
  
  .xr-settings-panel {
    width: 100%;
    right: -100%;
  }
  
  .instruction-grid {
    grid-template-columns: 1fr;
  }
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .hologram-ring,
  .loading-spinner {
    animation: none;
  }
  
  .webxr-init,
  .xr-header,
  .xr-settings-panel {
    transition: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .webxr-experience {
    background: #000;
  }
  
  .xr-object-card,
  .activity-item,
  .instruction-item {
    border: 2px solid #fff;
  }
  
  .xr-canvas {
    border: 2px solid #fff;
  }
}
</style>