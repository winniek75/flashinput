<template>
  <div class="vr-scenario-experience" :class="experienceClasses">
    <!-- VR Loading Screen -->
    <div class="vr-loading" v-if="loading" :class="{ 'loading-complete': loadingProgress >= 100 }">
      <div class="vr-loader-content">
        <div class="vr-logo">
          <div class="logo-cube">
            <div class="cube-face front"></div>
            <div class="cube-face back"></div>
            <div class="cube-face right"></div>
            <div class="cube-face left"></div>
            <div class="cube-face top"></div>
            <div class="cube-face bottom"></div>
          </div>
        </div>
        
        <h1 class="vr-title">VR Language Academy</h1>
        <p class="vr-subtitle">{{ currentScenario?.title }}</p>
        
        <div class="loading-progress">
          <div class="progress-ring">
            <svg class="progress-circle" width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="4"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="#00bcd4"
                stroke-width="4"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span class="progress-text">{{ Math.round(loadingProgress) }}%</span>
          </div>
        </div>
        
        <div class="loading-stages">
          <div 
            v-for="(stage, index) in loadingStages"
            :key="stage.id"
            class="loading-stage"
            :class="{ 
              'stage-active': currentStageIndex === index,
              'stage-complete': currentStageIndex > index 
            }"
          >
            <Icon :name="stage.icon" class="stage-icon" />
            <span class="stage-text">{{ stage.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VR Interface -->
    <div class="vr-interface" v-if="!loading">
      
      <!-- VR Header Controls -->
      <header class="vr-header" :class="{ 'header-hidden': isImmersed }">
        <div class="header-left">
          <button 
            @click="exitVR"
            class="vr-button exit-button focus-ring"
            aria-label="VRを終了"
          >
            <Icon name="arrow-left" />
            <span>Exit VR</span>
          </button>
          
          <div class="scenario-info">
            <h2 class="scenario-title">{{ currentScenario?.title }}</h2>
            <p class="scenario-type">{{ getScenarioTypeText(currentScenario?.type) }}</p>
          </div>
        </div>

        <div class="header-center">
          <div class="vr-compass" v-if="vrData.position">
            <div class="compass-face">
              <div class="compass-needle" :style="{ transform: `rotate(${vrData.heading}deg)` }"></div>
              <span class="direction-n">N</span>
              <span class="direction-s">S</span>
              <span class="direction-e">E</span>
              <span class="direction-w">W</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="vr-status">
            <div class="status-indicator" :class="vrConnectionStatus">
              <Icon :name="getConnectionIcon()" />
              <span>{{ getConnectionText() }}</span>
            </div>
          </div>
          
          <button 
            @click="toggleSettings"
            class="vr-button settings-button focus-ring"
            aria-label="VR設定"
          >
            <Icon name="settings" />
          </button>
        </div>
      </header>

      <!-- Main VR Viewport -->
      <main class="vr-viewport" id="vr-main-content">
        
        <!-- VR Scene Canvas -->
        <div class="vr-scene-container">
          <canvas 
            ref="vrCanvas"
            class="vr-canvas"
            :width="canvasSize.width"
            :height="canvasSize.height"
            @click="onCanvasClick"
            @mousemove="onCanvasMouseMove"
            @wheel="onCanvasWheel"
          ></canvas>
          
          <!-- VR Overlay Elements -->
          <div class="vr-overlays">
            
            <!-- Interaction Hints -->
            <div 
              v-for="hint in interactionHints"
              :key="hint.id"
              class="interaction-hint"
              :style="hint.position"
              :class="`hint-${hint.type}`"
            >
              <div class="hint-content">
                <Icon :name="hint.icon" />
                <span class="hint-text">{{ hint.text }}</span>
              </div>
              <div class="hint-pulse"></div>
            </div>
            
            <!-- VR Dialogue Bubbles -->
            <div 
              v-for="dialogue in activeDialogues"
              :key="dialogue.id"
              class="vr-dialogue-bubble"
              :style="dialogue.position"
              :class="`dialogue-${dialogue.type}`"
            >
              <div class="bubble-content">
                <div class="speaker-info" v-if="dialogue.speaker">
                  <img 
                    :src="dialogue.speaker.avatar"
                    :alt="dialogue.speaker.name"
                    class="speaker-avatar"
                  />
                  <span class="speaker-name">{{ dialogue.speaker.name }}</span>
                </div>
                <p class="dialogue-text">{{ dialogue.text }}</p>
                <div class="dialogue-actions" v-if="dialogue.choices">
                  <button 
                    v-for="(choice, index) in dialogue.choices"
                    :key="`choice-${index}`"
                    class="choice-bubble focus-ring"
                    @click="selectVRChoice(dialogue.id, choice, index)"
                  >
                    {{ choice.text }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- VR Learning Objects -->
            <div 
              v-for="object in learningObjects"
              :key="object.id"
              class="learning-object"
              :style="object.position"
              :class="`object-${object.type}`"
              @click="interactWithObject(object)"
              tabindex="0"
              role="button"
              :aria-label="object.description"
            >
              <div class="object-visual">
                <Icon :name="object.icon" />
              </div>
              <div class="object-label" v-if="object.showLabel">
                {{ object.label }}
              </div>
              <div class="object-progress" v-if="object.progress !== undefined">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${object.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- VR Achievement Notifications -->
            <div class="achievement-notifications">
              <transition-group name="achievement" tag="div">
                <div 
                  v-for="achievement in recentAchievements"
                  :key="achievement.id"
                  class="achievement-notification"
                >
                  <div class="achievement-icon">
                    <Icon :name="achievement.icon" />
                  </div>
                  <div class="achievement-content">
                    <h4 class="achievement-title">{{ achievement.title }}</h4>
                    <p class="achievement-description">{{ achievement.description }}</p>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </div>

        <!-- VR Control Panel -->
        <div class="vr-control-panel" :class="{ 'panel-minimized': isImmersed }">
          
          <!-- Movement Controls -->
          <div class="control-section movement-controls">
            <h3 class="control-title">移動</h3>
            <div class="control-grid">
              <button 
                @click="moveVR('forward')"
                @mousedown="startContinuousMove('forward')"
                @mouseup="stopContinuousMove"
                @mouseleave="stopContinuousMove"
                class="move-button focus-ring"
                :class="{ active: isMoving.forward }"
                aria-label="前進"
              >
                <Icon name="arrow-up" />
              </button>
              
              <div class="movement-spacer"></div>
              
              <button 
                @click="moveVR('backward')"
                @mousedown="startContinuousMove('backward')"
                @mouseup="stopContinuousMove"
                @mouseleave="stopContinuousMove"
                class="move-button focus-ring"
                :class="{ active: isMoving.backward }"
                aria-label="後退"
              >
                <Icon name="arrow-down" />
              </button>
              
              <button 
                @click="moveVR('left')"
                @mousedown="startContinuousMove('left')"
                @mouseup="stopContinuousMove"
                @mouseleave="stopContinuousMove"
                class="move-button focus-ring"
                :class="{ active: isMoving.left }"
                aria-label="左"
              >
                <Icon name="arrow-left" />
              </button>
              
              <button 
                @click="moveVR('right')"
                @mousedown="startContinuousMove('right')"
                @mouseup="stopContinuousMove"
                @mouseleave="stopContinuousMove"
                class="move-button focus-ring"
                :class="{ active: isMoving.right }"
                aria-label="右"
              >
                <Icon name="arrow-right" />
              </button>
            </div>
          </div>

          <!-- View Controls -->
          <div class="control-section view-controls">
            <h3 class="control-title">視点</h3>
            <div class="view-buttons">
              <button 
                @click="resetView"
                class="view-button focus-ring"
                aria-label="視点リセット"
              >
                <Icon name="refresh" />
                <span>リセット</span>
              </button>
              
              <button 
                @click="toggleImmersion"
                class="view-button focus-ring"
                :class="{ active: isImmersed }"
                :aria-pressed="isImmersed"
                aria-label="没入モード切り替え"
              >
                <Icon :name="isImmersed ? 'eye-off' : 'eye'" />
                <span>{{ isImmersed ? '通常' : '没入' }}</span>
              </button>
            </div>
          </div>

          <!-- Interaction Controls -->
          <div class="control-section interaction-controls">
            <h3 class="control-title">操作</h3>
            <div class="interaction-buttons">
              <button 
                @click="interactWithNearestObject"
                class="interaction-button focus-ring"
                :disabled="!nearestObject"
                aria-label="最寄りのオブジェクトと相互作用"
              >
                <Icon name="hand" />
                <span>相互作用</span>
              </button>
              
              <button 
                @click="openInventory"
                class="interaction-button focus-ring"
                aria-label="インベントリを開く"
              >
                <Icon name="package" />
                <span>インベントリ</span>
              </button>
            </div>
          </div>
        </div>

        <!-- VR Progress Indicator -->
        <div class="vr-progress-indicator">
          <div class="progress-content">
            <div class="scenario-progress">
              <span class="progress-label">シナリオ進行</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${scenarioProgress}%` }"
                ></div>
              </div>
              <span class="progress-value">{{ Math.round(scenarioProgress) }}%</span>
            </div>
            
            <div class="learning-metrics">
              <div class="metric">
                <Icon name="target" />
                <span>目標: {{ completedObjectives }}/{{ totalObjectives }}</span>
              </div>
              <div class="metric">
                <Icon name="clock" />
                <span>時間: {{ formatTime(elapsedTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- VR Settings Panel -->
      <aside 
        class="vr-settings-panel"
        :class="{ 'panel-visible': showSettings }"
        aria-label="VR設定パネル"
      >
        <div class="settings-content">
          <h3 class="settings-title">VR設定</h3>
          
          <div class="setting-category">
            <h4>表示設定</h4>
            
            <div class="setting-item">
              <label for="vr-fov">視野角</label>
              <input 
                id="vr-fov"
                type="range"
                min="60"
                max="120"
                v-model="vrSettings.fieldOfView"
                @input="applyVRSettings"
                class="setting-slider"
              />
              <span class="setting-value">{{ vrSettings.fieldOfView }}°</span>
            </div>
            
            <div class="setting-item">
              <label for="render-quality">描画品質</label>
              <select 
                id="render-quality"
                v-model="vrSettings.renderQuality"
                @change="applyVRSettings"
                class="setting-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="ultra">最高</option>
              </select>
            </div>
            
            <div class="setting-toggle">
              <input 
                type="checkbox"
                id="show-hints"
                v-model="vrSettings.showInteractionHints"
                @change="applyVRSettings"
              />
              <label for="show-hints">相互作用ヒントを表示</label>
            </div>
          </div>
          
          <div class="setting-category">
            <h4>操作設定</h4>
            
            <div class="setting-item">
              <label for="movement-speed">移動速度</label>
              <input 
                id="movement-speed"
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                v-model="vrSettings.movementSpeed"
                @input="applyVRSettings"
                class="setting-slider"
              />
              <span class="setting-value">{{ vrSettings.movementSpeed }}x</span>
            </div>
            
            <div class="setting-item">
              <label for="mouse-sensitivity">マウス感度</label>
              <input 
                id="mouse-sensitivity"
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                v-model="vrSettings.mouseSensitivity"
                @input="applyVRSettings"
                class="setting-slider"
              />
              <span class="setting-value">{{ vrSettings.mouseSensitivity }}x</span>
            </div>
            
            <div class="setting-toggle">
              <input 
                type="checkbox"
                id="smooth-movement"
                v-model="vrSettings.smoothMovement"
                @change="applyVRSettings"
              />
              <label for="smooth-movement">滑らかな移動</label>
            </div>
          </div>
          
          <div class="setting-category">
            <h4>アクセシビリティ</h4>
            
            <div class="setting-toggle">
              <input 
                type="checkbox"
                id="motion-sickness-reduction"
                v-model="vrSettings.motionSicknessReduction"
                @change="applyVRSettings"
              />
              <label for="motion-sickness-reduction">酔い軽減モード</label>
            </div>
            
            <div class="setting-toggle">
              <input 
                type="checkbox"
                id="high-contrast"
                v-model="vrSettings.highContrast"
                @change="applyVRSettings"
              />
              <label for="high-contrast">高コントラスト</label>
            </div>
            
            <div class="setting-toggle">
              <input 
                type="checkbox"
                id="audio-cues"
                v-model="vrSettings.audioCues"
                @change="applyVRSettings"
              />
              <label for="audio-cues">音声ガイド</label>
            </div>
          </div>
          
          <div class="settings-actions">
            <button 
              @click="resetVRSettings"
              class="reset-button focus-ring"
            >
              デフォルトに戻す
            </button>
            <button 
              @click="closeSettings"
              class="apply-button focus-ring"
            >
              適用
            </button>
          </div>
        </div>
      </aside>

      <!-- VR Help Panel -->
      <div 
        class="vr-help-panel"
        v-if="showHelp"
        @click="showHelp = false"
      >
        <div class="help-content" @click.stop>
          <h3>VR操作ガイド</h3>
          
          <div class="help-section">
            <h4>基本操作</h4>
            <ul>
              <li><kbd>WASD</kbd> または矢印キー: 移動</li>
              <li><kbd>マウス</kbd>: 視点移動</li>
              <li><kbd>クリック</kbd>: 相互作用</li>
              <li><kbd>Space</kbd>: ジャンプ/アクション</li>
              <li><kbd>Esc</kbd>: 設定/メニュー</li>
            </ul>
          </div>
          
          <div class="help-section">
            <h4>VR体験</h4>
            <ul>
              <li>青いヒントは相互作用可能なオブジェクトです</li>
              <li>対話バブルをクリックして会話を進めます</li>
              <li>学習オブジェクトを集めて進行を進めます</li>
              <li>実績を達成して新しいエリアを解放します</li>
            </ul>
          </div>
          
          <button 
            @click="showHelp = false"
            class="help-close focus-ring"
          >
            閉じる
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
const loading = ref(true)
const loadingProgress = ref(0)
const currentStageIndex = ref(0)
const isImmersed = ref(false)
const showSettings = ref(false)
const showHelp = ref(false)
const vrConnectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connecting')

const scenarioProgress = ref(0)
const completedObjectives = ref(0)
const totalObjectives = ref(5)
const elapsedTime = ref(0)
const nearestObject = ref<any>(null)

// VR State
const vrData = ref({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  heading: 0
})

const canvasSize = ref({ width: 1920, height: 1080 })
const vrCanvas = ref<HTMLCanvasElement>()

const isMoving = ref({
  forward: false,
  backward: false,
  left: false,
  right: false
})

const movementTimer = ref<NodeJS.Timeout | null>(null)
const elapsedTimer = ref<NodeJS.Timeout | null>(null)

// VR Settings
const vrSettings = useStorage('vr_scenario_settings', {
  fieldOfView: 90,
  renderQuality: 'medium',
  showInteractionHints: true,
  movementSpeed: 1.0,
  mouseSensitivity: 1.0,
  smoothMovement: true,
  motionSicknessReduction: false,
  highContrast: false,
  audioCues: true
})

// Computed properties
const experienceClasses = computed(() => ({
  'immersed': isImmersed.value,
  'settings-open': showSettings.value,
  'help-open': showHelp.value,
  'vr-connected': vrConnectionStatus.value === 'connected',
  [`quality-${vrSettings.value.renderQuality}`]: true
}))

const circumference = computed(() => 2 * Math.PI * 54)

const progressOffset = computed(() => {
  const offset = circumference.value - (loadingProgress.value / 100) * circumference.value
  return offset
})

// Mock data
const currentScenario = ref({
  id: props.scenarioId,
  title: '宇宙ステーション探索',
  type: 'exploration',
  description: '国際宇宙ステーションを探索して科学実験を学習する',
  difficulty: 'intermediate',
  duration: 30
})

const loadingStages = ref([
  { id: 'init', icon: 'cube', text: 'VRシステム初期化中...' },
  { id: 'assets', icon: 'download', text: '3Dアセット読み込み中...' },
  { id: 'scene', icon: 'globe', text: 'シーン構築中...' },
  { id: 'calibration', icon: 'target', text: 'VRキャリブレーション中...' },
  { id: 'ready', icon: 'check', text: '準備完了!' }
])

const interactionHints = ref([
  {
    id: 'hint-1',
    type: 'info',
    icon: 'info',
    text: '実験装置をクリックして詳細を確認',
    position: { top: '30%', left: '60%' }
  },
  {
    id: 'hint-2',
    type: 'action',
    icon: 'hand',
    text: 'ここをつかんで移動',
    position: { top: '50%', left: '20%' }
  }
])

const activeDialogues = ref([
  {
    id: 'dialogue-1',
    type: 'tutorial',
    speaker: {
      name: '宇宙飛行士',
      avatar: '/images/characters/astronaut-avatar.jpg'
    },
    text: 'ようこそ宇宙ステーションへ！まずは実験モジュールを見学しましょう。',
    position: { top: '20%', left: '30%' },
    choices: [
      { text: '案内をお願いします', action: 'start_tour' },
      { text: '自分で探索します', action: 'free_explore' }
    ]
  }
])

const learningObjects = ref([
  {
    id: 'experiment-1',
    type: 'science',
    icon: 'flask',
    label: '微重力実験装置',
    description: '微重力環境での結晶成長実験を学習',
    position: { top: '40%', left: '50%' },
    showLabel: true,
    progress: 0
  },
  {
    id: 'solar-panel',
    type: 'energy',
    icon: 'zap',
    label: 'ソーラーパネル',
    description: '太陽光発電システムの仕組みを学習',
    position: { top: '60%', left: '70%' },
    showLabel: true,
    progress: 25
  }
])

const recentAchievements = ref([
  {
    id: 'first-interaction',
    icon: 'trophy',
    title: '初回相互作用',
    description: 'VRオブジェクトと初めて相互作用しました！'
  }
])

// Methods
const exitVR = () => {
  router.push('/vr-academy')
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  
  if (showSettings.value) {
    accessibilityManager.trapFocus(document.querySelector('.vr-settings-panel') as HTMLElement)
  } else {
    accessibilityManager.releaseFocusTrap()
  }
}

const closeSettings = () => {
  showSettings.value = false
  accessibilityManager.releaseFocusTrap()
}

const applyVRSettings = () => {
  // Apply VR settings to the experience
  logger.log('Applying VR settings:', vrSettings.value)
  
  // Update canvas rendering quality
  updateRenderQuality()
  
  // Update movement settings
  updateMovementSettings()
  
  // Update accessibility features
  updateAccessibilityFeatures()
}

const resetVRSettings = () => {
  vrSettings.value = {
    fieldOfView: 90,
    renderQuality: 'medium',
    showInteractionHints: true,
    movementSpeed: 1.0,
    mouseSensitivity: 1.0,
    smoothMovement: true,
    motionSicknessReduction: false,
    highContrast: false,
    audioCues: true
  }
  
  applyVRSettings()
  
  accessibilityManager.announce({
    message: 'VR設定がリセットされました',
    priority: 'polite'
  })
}

const updateRenderQuality = () => {
  if (!vrCanvas.value) return
  
  const qualitySettings = {
    low: { width: 1280, height: 720 },
    medium: { width: 1920, height: 1080 },
    high: { width: 2560, height: 1440 },
    ultra: { width: 3840, height: 2160 }
  }
  
  const settings = qualitySettings[vrSettings.value.renderQuality as keyof typeof qualitySettings]
  canvasSize.value = settings
}

const updateMovementSettings = () => {
  // Apply movement speed and sensitivity changes
  logger.log('Updated movement settings')
}

const updateAccessibilityFeatures = () => {
  // Apply accessibility settings
  if (vrSettings.value.audioCues) {
    enableAudioCues()
  } else {
    disableAudioCues()
  }
}

const enableAudioCues = () => {
  soundManager.setAmbientVolume(50)
}

const disableAudioCues = () => {
  soundManager.setAmbientVolume(0)
}

const moveVR = (direction: string) => {
  const speed = vrSettings.value.movementSpeed
  
  switch (direction) {
    case 'forward':
      vrData.value.position.z += speed
      break
    case 'backward':
      vrData.value.position.z -= speed
      break
    case 'left':
      vrData.value.position.x -= speed
      break
    case 'right':
      vrData.value.position.x += speed
      break
  }
  
  updateVRPosition()
  
  if (vrSettings.value.audioCues) {
    soundManager.playSFX('vr_movement', 30)
  }
}

const startContinuousMove = (direction: string) => {
  isMoving.value[direction as keyof typeof isMoving.value] = true
  
  movementTimer.value = setInterval(() => {
    moveVR(direction)
  }, 100)
}

const stopContinuousMove = () => {
  Object.keys(isMoving.value).forEach(key => {
    isMoving.value[key as keyof typeof isMoving.value] = false
  })
  
  if (movementTimer.value) {
    clearInterval(movementTimer.value)
    movementTimer.value = null
  }
}

const resetView = () => {
  vrData.value = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    heading: 0
  }
  
  updateVRPosition()
  
  accessibilityManager.announce({
    message: '視点をリセットしました',
    priority: 'polite'
  })
}

const toggleImmersion = () => {
  isImmersed.value = !isImmersed.value
  
  accessibilityManager.announce({
    message: isImmersed.value ? '没入モードに入りました' : '没入モードを終了しました',
    priority: 'polite'
  })
}

const updateVRPosition = () => {
  // Update VR position and check for nearby objects
  checkNearbyObjects()
  
  // Update compass heading
  vrData.value.heading = Math.atan2(vrData.value.position.x, vrData.value.position.z) * 180 / Math.PI
}

const checkNearbyObjects = () => {
  // Find nearest interactive object
  let nearest = null
  let minDistance = Infinity
  
  learningObjects.value.forEach(object => {
    const distance = Math.sqrt(
      Math.pow(vrData.value.position.x - parseFloat(object.position.left), 2) +
      Math.pow(vrData.value.position.z - parseFloat(object.position.top), 2)
    )
    
    if (distance < minDistance) {
      minDistance = distance
      nearest = object
    }
  })
  
  if (minDistance < 50) { // Within interaction range
    nearestObject.value = nearest
  } else {
    nearestObject.value = null
  }
}

const interactWithNearestObject = () => {
  if (nearestObject.value) {
    interactWithObject(nearestObject.value)
  }
}

const interactWithObject = (object: any) => {
  logger.log('Interacting with object:', object)
  
  // Update object progress
  object.progress = Math.min(100, object.progress + 25)
  
  // Play interaction sound
  soundManager.playSFX('vr_interaction', 80)
  
  // Check for completion
  if (object.progress >= 100) {
    completedObjectives.value++
    updateScenarioProgress()
    
    // Add achievement
    addAchievement({
      id: `completed_${object.id}`,
      icon: 'check-circle',
      title: '学習完了',
      description: `${object.label}の学習を完了しました！`
    })
  }
  
  accessibilityManager.announce({
    message: `${object.label}と相互作用しました`,
    priority: 'polite'
  })
}

const openInventory = () => {
  // Open VR inventory interface
  logger.log('Opening VR inventory')
  
  accessibilityManager.announce({
    message: 'インベントリを開きました',
    priority: 'polite'
  })
}

const selectVRChoice = (dialogueId: string, choice: any, index: number) => {
  logger.log('VR choice selected:', choice)
  
  // Handle choice action
  handleChoiceAction(choice.action)
  
  // Remove dialogue after selection
  const dialogueIndex = activeDialogues.value.findIndex(d => d.id === dialogueId)
  if (dialogueIndex !== -1) {
    activeDialogues.value.splice(dialogueIndex, 1)
  }
  
  soundManager.playSFX('vr_choice_select', 70)
  
  accessibilityManager.announce({
    message: `選択肢 ${index + 1} を選択しました: ${choice.text}`,
    priority: 'polite'
  })
}

const handleChoiceAction = (action: string) => {
  switch (action) {
    case 'start_tour':
      startGuidedTour()
      break
    case 'free_explore':
      enableFreeExploration()
      break
    default:
      logger.log('Unknown action:', action)
  }
}

const startGuidedTour = () => {
  // Start guided tour of the VR environment
  logger.log('Starting guided tour')
  
  accessibilityManager.announce({
    message: 'ガイドツアーを開始します',
    priority: 'polite'
  })
}

const enableFreeExploration = () => {
  // Enable free exploration mode
  logger.log('Enabling free exploration')
  
  accessibilityManager.announce({
    message: '自由探索モードを有効にしました',
    priority: 'polite'
  })
}

const addAchievement = (achievement: any) => {
  recentAchievements.value.unshift(achievement)
  
  // Remove after 5 seconds
  setTimeout(() => {
    const index = recentAchievements.value.findIndex(a => a.id === achievement.id)
    if (index !== -1) {
      recentAchievements.value.splice(index, 1)
    }
  }, 5000)
}

const updateScenarioProgress = () => {
  const progress = (completedObjectives.value / totalObjectives.value) * 100
  scenarioProgress.value = Math.min(100, progress)
}

const onCanvasClick = (event: MouseEvent) => {
  // Handle canvas click for VR interaction
  const rect = vrCanvas.value?.getBoundingClientRect()
  if (!rect) return
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  logger.log('Canvas click at:', { x, y })
  
  // Check if click is on an interactive element
  checkCanvasInteraction(x, y)
}

const onCanvasMouseMove = (event: MouseEvent) => {
  // Handle mouse movement for VR view control
  if (event.buttons === 1) { // Left mouse button held
    const deltaX = event.movementX * vrSettings.value.mouseSensitivity
    const deltaY = event.movementY * vrSettings.value.mouseSensitivity
    
    vrData.value.rotation.y += deltaX * 0.01
    vrData.value.rotation.x += deltaY * 0.01
    
    // Clamp vertical rotation
    vrData.value.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, vrData.value.rotation.x))
    
    updateVRPosition()
  }
}

const onCanvasWheel = (event: WheelEvent) => {
  // Handle wheel for zoom/movement
  event.preventDefault()
  
  const zoomDirection = event.deltaY > 0 ? 'backward' : 'forward'
  moveVR(zoomDirection)
}

const checkCanvasInteraction = (x: number, y: number) => {
  // Check if click coordinates match any interactive elements
  learningObjects.value.forEach(object => {
    const objX = parseFloat(object.position.left.replace('%', '')) / 100 * canvasSize.value.width
    const objY = parseFloat(object.position.top.replace('%', '')) / 100 * canvasSize.value.height
    
    const distance = Math.sqrt(Math.pow(x - objX, 2) + Math.pow(y - objY, 2))
    
    if (distance < 50) { // Within click range
      interactWithObject(object)
    }
  })
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getScenarioTypeText = (type: string): string => {
  const typeTexts: Record<string, string> = {
    exploration: '探索シナリオ',
    experiment: '実験シナリオ',
    simulation: 'シミュレーション',
    tutorial: 'チュートリアル',
    assessment: '評価'
  }
  
  return typeTexts[type] || type
}

const getConnectionIcon = (): string => {
  switch (vrConnectionStatus.value) {
    case 'connected':
      return 'wifi'
    case 'connecting':
      return 'loader'
    case 'disconnected':
      return 'wifi-off'
    default:
      return 'help'
  }
}

const getConnectionText = (): string => {
  switch (vrConnectionStatus.value) {
    case 'connected':
      return 'VR接続済み'
    case 'connecting':
      return 'VR接続中...'
    case 'disconnected':
      return 'VR未接続'
    default:
      return '不明'
  }
}

const initializeVRExperience = async () => {
  loading.value = true
  loadingProgress.value = 0
  currentStageIndex.value = 0
  
  // Simulate VR initialization stages
  for (let i = 0; i < loadingStages.value.length; i++) {
    currentStageIndex.value = i
    loadingProgress.value = (i + 1) * 20
    
    await new Promise(resolve => setTimeout(resolve, 800))
  }
  
  // Complete loading
  loadingProgress.value = 100
  await new Promise(resolve => setTimeout(resolve, 500))
  
  loading.value = false
  vrConnectionStatus.value = 'connected'
  
  // Start elapsed time counter
  elapsedTimer.value = setInterval(() => {
    elapsedTime.value++
  }, 1000)
  
  // Initialize VR canvas
  initializeVRCanvas()
  
  accessibilityManager.announce({
    message: 'VRシナリオ体験が開始されました',
    priority: 'polite'
  })
}

const initializeVRCanvas = () => {
  if (!vrCanvas.value) return
  
  const ctx = vrCanvas.value.getContext('2d')
  if (!ctx) return
  
  // Draw initial VR scene
  drawVRScene(ctx)
}

const drawVRScene = (ctx: CanvasRenderingContext2D) => {
  // Clear canvas
  ctx.clearRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  
  // Draw space background
  const gradient = ctx.createRadialGradient(
    canvasSize.value.width / 2, canvasSize.value.height / 2, 0,
    canvasSize.value.width / 2, canvasSize.value.height / 2, canvasSize.value.width / 2
  )
  gradient.addColorStop(0, '#001122')
  gradient.addColorStop(1, '#000000')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasSize.value.width, canvasSize.value.height)
  
  // Draw stars
  ctx.fillStyle = 'white'
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvasSize.value.width
    const y = Math.random() * canvasSize.value.height
    const size = Math.random() * 2
    
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // Draw VR objects
  learningObjects.value.forEach(object => {
    const x = parseFloat(object.position.left.replace('%', '')) / 100 * canvasSize.value.width
    const y = parseFloat(object.position.top.replace('%', '')) / 100 * canvasSize.value.height
    
    // Draw object
    ctx.fillStyle = '#00bcd4'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw object glow
    ctx.shadowColor = '#00bcd4'
    ctx.shadowBlur = 20
    ctx.fill()
    ctx.shadowBlur = 0
  })
}

// Lifecycle
onMounted(async () => {
  // Initialize VR experience
  await initializeVRExperience()
  
  // Register keyboard shortcuts
  accessibilityManager.registerShortcut('vr-move-forward', {
    keys: ['w', 'ArrowUp'],
    action: () => moveVR('forward'),
    description: '前進',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-move-backward', {
    keys: ['s', 'ArrowDown'],
    action: () => moveVR('backward'),
    description: '後退',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-move-left', {
    keys: ['a', 'ArrowLeft'],
    action: () => moveVR('left'),
    description: '左移動',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-move-right', {
    keys: ['d', 'ArrowRight'],
    action: () => moveVR('right'),
    description: '右移動',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-interact', {
    keys: ['Space'],
    action: interactWithNearestObject,
    description: '相互作用',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-settings', {
    keys: ['Escape'],
    action: toggleSettings,
    description: 'VR設定',
    context: 'vr',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('vr-help', {
    keys: ['h'],
    action: () => { showHelp.value = !showHelp.value },
    description: 'ヘルプ表示',
    context: 'vr',
    enabled: true
  })
  
  // Setup canvas resize handler
  const handleResize = () => {
    updateRenderQuality()
  }
  
  window.addEventListener('resize', handleResize)
  
  // Apply initial VR settings
  applyVRSettings()
})

onUnmounted(() => {
  // Clean up timers
  if (movementTimer.value) {
    clearInterval(movementTimer.value)
  }
  
  if (elapsedTimer.value) {
    clearInterval(elapsedTimer.value)
  }
  
  // Stop audio
  soundManager.stopAllAudio()
  
  // Unregister shortcuts
  accessibilityManager.unregisterShortcut('vr-move-forward')
  accessibilityManager.unregisterShortcut('vr-move-backward')
  accessibilityManager.unregisterShortcut('vr-move-left')
  accessibilityManager.unregisterShortcut('vr-move-right')
  accessibilityManager.unregisterShortcut('vr-interact')
  accessibilityManager.unregisterShortcut('vr-settings')
  accessibilityManager.unregisterShortcut('vr-help')
  
  // Remove event listeners
  window.removeEventListener('resize', () => {})
})

// Watch for canvas size changes
watch(() => canvasSize.value, () => {
  nextTick(() => {
    if (vrCanvas.value) {
      const ctx = vrCanvas.value.getContext('2d')
      if (ctx) {
        drawVRScene(ctx)
      }
    }
  })
}, { deep: true })
</script>

<style scoped>
.vr-scenario-experience {
  min-height: 100vh;
  background: #000;
  color: white;
  position: relative;
  overflow: hidden;
}

/* VR Loading Screen */
.vr-loading {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity var(--transition-lazy) ease-out;
}

.vr-loading.loading-complete {
  opacity: 0;
  pointer-events: none;
}

.vr-loader-content {
  text-align: center;
  max-width: 600px;
}

.vr-logo {
  margin-bottom: 2rem;
  perspective: 1000px;
}

.logo-cube {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  position: relative;
  transform-style: preserve-3d;
  animation: cubeSpin 4s linear infinite;
}

.cube-face {
  position: absolute;
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #00bcd4, #0097a7);
  border: 2px solid #4dd0e1;
  opacity: 0.8;
}

.cube-face.front { transform: rotateY(0deg) translateZ(40px); }
.cube-face.back { transform: rotateY(180deg) translateZ(40px); }
.cube-face.right { transform: rotateY(90deg) translateZ(40px); }
.cube-face.left { transform: rotateY(-90deg) translateZ(40px); }
.cube-face.top { transform: rotateX(90deg) translateZ(40px); }
.cube-face.bottom { transform: rotateX(-90deg) translateZ(40px); }

@keyframes cubeSpin {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.vr-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #00bcd4, #4dd0e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.vr-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
}

.loading-progress {
  margin-bottom: 3rem;
}

.progress-ring {
  position: relative;
  display: inline-block;
}

.progress-circle {
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #00bcd4;
}

.loading-stages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.loading-stage {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border-left: 4px solid transparent;
  transition: all var(--transition-fast) ease;
}

.loading-stage.stage-active {
  border-left-color: #00bcd4;
  background: rgba(0, 188, 212, 0.1);
}

.loading-stage.stage-complete {
  border-left-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.stage-icon {
  width: 24px;
  height: 24px;
  color: #00bcd4;
}

.loading-stage.stage-complete .stage-icon {
  color: #4caf50;
}

.stage-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
}

/* VR Interface */
.vr-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.vr-interface.immersed .vr-header,
.vr-interface.immersed .vr-control-panel,
.vr-interface.immersed .vr-progress-indicator {
  opacity: 0;
  pointer-events: none;
}

/* VR Header */
.vr-header {
  position: relative;
  z-index: 100;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: opacity var(--transition-normal) ease;
}

.vr-header.header-hidden {
  opacity: 0;
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.exit-button,
.settings-button {
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

.exit-button:hover,
.settings-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.scenario-info {
  flex: 1;
}

.scenario-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  color: #00bcd4;
}

.scenario-type {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.vr-compass {
  width: 80px;
  height: 80px;
}

.compass-face {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid #00bcd4;
  border-radius: 50%;
  background: rgba(0, 188, 212, 0.1);
}

.compass-needle {
  position: absolute;
  top: 10%;
  left: 50%;
  width: 2px;
  height: 40%;
  background: #ff5722;
  transform-origin: bottom center;
  transition: transform var(--transition-fast) ease;
}

.direction-n,
.direction-s,
.direction-e,
.direction-w {
  position: absolute;
  color: #00bcd4;
  font-size: 0.8rem;
  font-weight: bold;
}

.direction-n { top: 5px; left: 50%; transform: translateX(-50%); }
.direction-s { bottom: 5px; left: 50%; transform: translateX(-50%); }
.direction-e { right: 5px; top: 50%; transform: translateY(-50%); }
.direction-w { left: 5px; top: 50%; transform: translateY(-50%); }

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
}

.vr-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  transition: all var(--transition-fast) ease;
}

.status-indicator.connected {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-indicator.connecting {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-indicator.disconnected {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

/* VR Viewport */
.vr-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.vr-scene-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.vr-canvas {
  width: 100%;
  height: 100%;
  background: #000;
  cursor: crosshair;
}

.vr-overlays {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.interaction-hint {
  position: absolute;
  pointer-events: all;
  z-index: 10;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 188, 212, 0.9);
  border-radius: 1rem;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  position: relative;
}

.hint-pulse {
  position: absolute;
  inset: -4px;
  border: 2px solid #00bcd4;
  border-radius: 1rem;
  animation: hintPulse 2s infinite;
}

@keyframes hintPulse {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.vr-dialogue-bubble {
  position: absolute;
  pointer-events: all;
  z-index: 20;
  max-width: 300px;
}

.bubble-content {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.speaker-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #00bcd4;
}

.speaker-name {
  color: #00bcd4;
  font-weight: 600;
}

.dialogue-text {
  margin: 0 0 1rem;
  line-height: 1.4;
}

.dialogue-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice-bubble {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  text-align: left;
  transition: all var(--transition-fast) ease;
}

.choice-bubble:hover {
  background: rgba(0, 188, 212, 0.3);
  border-color: #00bcd4;
}

.learning-object {
  position: absolute;
  pointer-events: all;
  cursor: pointer;
  z-index: 15;
  transition: all var(--transition-fast) ease;
}

.learning-object:hover {
  transform: scale(1.1);
}

.object-visual {
  width: 60px;
  height: 60px;
  background: rgba(0, 188, 212, 0.2);
  border: 2px solid #00bcd4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #00bcd4;
  margin: 0 auto 0.5rem;
}

.object-label {
  text-align: center;
  font-size: 0.8rem;
  color: white;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.object-progress {
  width: 60px;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #00bcd4, #4dd0e1);
  transition: width var(--transition-normal) ease;
}

/* Achievement Notifications */
.achievement-notifications {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 50;
}

.achievement-notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(76, 175, 80, 0.9);
  border: 1px solid #4caf50;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  max-width: 300px;
  backdrop-filter: blur(10px);
}

.achievement-icon {
  width: 40px;
  height: 40px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.achievement-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: white;
}

.achievement-description {
  font-size: 0.8rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.achievement-enter-active {
  transition: all var(--transition-normal) ease;
}

.achievement-leave-active {
  transition: all var(--transition-fast) ease;
}

.achievement-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.achievement-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* VR Control Panel */
.vr-control-panel {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  gap: 1rem;
  transition: opacity var(--transition-normal) ease;
  z-index: 30;
}

.vr-control-panel.panel-minimized {
  opacity: 0.3;
}

.control-section {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.control-title {
  font-size: 0.9rem;
  color: #00bcd4;
  margin: 0 0 0.75rem;
  text-align: center;
}

.control-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.5rem;
  width: 120px;
}

.move-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) ease;
}

.move-button:hover,
.move-button.active {
  background: rgba(0, 188, 212, 0.3);
  border-color: #00bcd4;
  transform: scale(1.1);
}

.move-button:nth-child(1) { grid-column: 2; grid-row: 1; }
.move-button:nth-child(3) { grid-column: 2; grid-row: 2; }
.move-button:nth-child(4) { grid-column: 1; grid-row: 2; }
.move-button:nth-child(5) { grid-column: 3; grid-row: 2; }

.movement-spacer {
  grid-column: 1; 
  grid-row: 1;
}

.view-buttons,
.interaction-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}

.view-button,
.interaction-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  font-size: 0.8rem;
  transition: all var(--transition-fast) ease;
}

.view-button:hover,
.interaction-button:hover {
  background: rgba(0, 188, 212, 0.3);
  border-color: #00bcd4;
}

.view-button.active {
  background: #00bcd4;
  border-color: #00bcd4;
}

.interaction-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* VR Progress Indicator */
.vr-progress-indicator {
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
  z-index: 30;
  transition: opacity var(--transition-normal) ease;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 200px;
}

.scenario-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-label {
  color: #00bcd4;
  font-size: 0.8rem;
  min-width: 60px;
}

.scenario-progress .progress-bar {
  flex: 1;
  height: 6px;
}

.progress-value {
  color: white;
  font-size: 0.8rem;
  min-width: 35px;
}

.learning-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
}

.metric Icon {
  color: #00bcd4;
}

/* VR Settings Panel */
.vr-settings-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 200;
  overflow-y: auto;
  transition: right var(--transition-normal) ease;
}

.vr-settings-panel.panel-visible {
  right: 0;
}

.settings-content {
  padding: 2rem;
}

.settings-title {
  font-size: 1.5rem;
  color: #00bcd4;
  margin-bottom: 2rem;
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
}

.setting-value {
  color: #00bcd4;
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
  margin-top: 2rem;
  gap: 1rem;
}

.reset-button,
.apply-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) ease;
}

.reset-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.apply-button {
  background: #00bcd4;
  border: 1px solid #00bcd4;
  color: white;
}

.reset-button:hover,
.apply-button:hover {
  transform: translateY(-2px);
}

/* VR Help Panel */
.vr-help-panel {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(4px);
}

.help-content {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.help-content h3 {
  color: #00bcd4;
  margin-bottom: 1.5rem;
}

.help-section {
  margin-bottom: 1.5rem;
}

.help-section h4 {
  color: white;
  margin-bottom: 0.75rem;
}

.help-section ul {
  list-style: none;
  padding: 0;
}

.help-section li {
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-section kbd {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
}

.help-close {
  width: 100%;
  padding: 0.75rem;
  background: #00bcd4;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  margin-top: 1rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .vr-header {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .header-left,
  .header-center,
  .header-right {
    flex: none;
  }
  
  .scenario-title {
    font-size: 1.1rem;
  }
  
  .vr-compass {
    width: 60px;
    height: 60px;
  }
  
  .vr-control-panel {
    bottom: 1rem;
    left: 1rem;
    flex-direction: column;
  }
  
  .vr-progress-indicator {
    top: 1rem;
    left: 1rem;
    right: 1rem;
  }
  
  .progress-content {
    flex-direction: row;
    align-items: center;
  }
  
  .vr-settings-panel {
    width: 100%;
    right: -100%;
  }
  
  .help-content {
    margin: 1rem;
    padding: 1.5rem;
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
  .logo-cube,
  .compass-needle,
  .hint-pulse {
    animation: none;
  }
  
  .vr-loading,
  .vr-header,
  .vr-control-panel,
  .vr-settings-panel {
    transition: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .vr-scenario-experience {
    background: #000;
  }
  
  .vr-button,
  .move-button,
  .view-button,
  .interaction-button {
    border: 2px solid #fff;
  }
  
  .vr-canvas {
    border: 2px solid #fff;
  }
}
</style>