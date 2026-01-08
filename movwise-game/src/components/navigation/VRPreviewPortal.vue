<template>
  <div class="vr-preview-portal">
    <!-- ポータルオーバーレイ -->
    <div class="portal-overlay" @click="exitPreview">
      <div class="overlay-gradient"></div>
      <div class="vr-grid-pattern"></div>
    </div>

    <!-- VRプレビューウィンドウ -->
    <div class="vr-preview-window" @click.stop>
      <!-- VRヘッダー -->
      <div class="vr-header">
        <div class="vr-title">
          <div class="vr-icon">🥽</div>
          <div class="vr-text">
            <h2 class="title">VR Experience Preview</h2>
            <p class="subtitle">{{ planetData?.name || 'Unknown Planet' }}</p>
          </div>
        </div>
        <div class="vr-controls">
          <button class="control-btn" @click="toggleFullscreen">
            <div class="icon">⛶</div>
            <div class="label">Fullscreen</div>
          </button>
          <button class="control-btn exit-btn" @click="exitPreview">
            <div class="icon">✕</div>
            <div class="label">Exit</div>
          </button>
        </div>
      </div>

      <!-- VRシーンプレビュー -->
      <div class="vr-scene-container" ref="vrSceneContainer">
        <!-- 3Dシーンキャンバス -->
        <div class="vr-scene-canvas" :class="{ fullscreen: isFullscreen }">
          <!-- WebXR対応の3Dシーン（将来的にThree.jsで実装） -->
          <div class="scene-placeholder" :class="`scene-${planetData?.id}`">
            <!-- 惑星環境のプレビュー -->
            <div class="planet-environment">
              <div class="environment-bg" :style="environmentStyle"></div>
              
              <!-- 3D要素のモックアップ -->
              <div class="vr-objects">
                <!-- 中央の学習オブジェクト -->
                <div class="learning-object main-object" :style="mainObjectStyle">
                  <div class="object-core">{{ planetData?.emoji }}</div>
                  <div class="object-glow"></div>
                  <div class="interaction-ring"></div>
                </div>

                <!-- 周囲の学習アイテム -->
                <div
                  v-for="(item, index) in learningItems"
                  :key="index"
                  class="learning-item"
                  :style="getItemStyle(item, index)"
                  @click="interactWithItem(item)"
                >
                  <div class="item-icon">{{ item.icon }}</div>
                  <div class="item-label">{{ item.label }}</div>
                  <div class="item-progress" :style="{ width: item.progress + '%' }"></div>
                </div>

                <!-- VRハンドコントローラー表示 -->
                <div class="vr-hands" v-if="showVRHands">
                  <div class="vr-hand left-hand" :style="leftHandStyle">
                    <div class="hand-icon">👈</div>
                    <div class="hand-ray"></div>
                  </div>
                  <div class="vr-hand right-hand" :style="rightHandStyle">
                    <div class="hand-icon">👉</div>
                    <div class="hand-ray"></div>
                  </div>
                </div>
              </div>

              <!-- 環境パーティクル -->
              <div class="environment-particles">
                <div
                  v-for="particle in environmentParticles"
                  :key="particle.id"
                  class="env-particle"
                  :style="getParticleStyle(particle)"
                ></div>
              </div>

              <!-- UI要素 -->
              <div class="vr-ui-elements">
                <div class="progress-indicator">
                  <div class="progress-text">Learning Progress</div>
                  <div class="progress-bar-3d">
                    <div class="progress-fill-3d" :style="{ width: (planetData?.progress || 0) + '%' }"></div>
                  </div>
                </div>

                <div class="interaction-hints">
                  <div class="hint-item">
                    <div class="hint-icon">👋</div>
                    <div class="hint-text">Wave to interact</div>
                  </div>
                  <div class="hint-item">
                    <div class="hint-icon">👁️</div>
                    <div class="hint-text">Look to select</div>
                  </div>
                  <div class="hint-item">
                    <div class="hint-icon">🗣️</div>
                    <div class="hint-text">Speak to answer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- VRステータスパネル -->
        <div class="vr-status-panel">
          <div class="status-section">
            <h3 class="status-title">VR Readiness</h3>
            <div class="readiness-meter">
              <div class="meter-bar">
                <div 
                  class="meter-fill"
                  :style="{ width: vrReadiness + '%' }"
                ></div>
              </div>
              <div class="meter-text">{{ vrReadiness }}%</div>
            </div>
          </div>

          <div class="status-section">
            <h3 class="status-title">Experience Features</h3>
            <div class="feature-list">
              <div
                v-for="feature in vrFeatures"
                :key="feature.name"
                class="feature-item"
                :class="{ enabled: feature.enabled }"
              >
                <div class="feature-icon">{{ feature.icon }}</div>
                <div class="feature-name">{{ feature.name }}</div>
                <div class="feature-status">{{ feature.enabled ? '✓' : '⏳' }}</div>
              </div>
            </div>
          </div>

          <div class="status-section">
            <h3 class="status-title">Performance</h3>
            <div class="performance-stats">
              <div class="stat-item">
                <div class="stat-label">Target FPS</div>
                <div class="stat-value">90</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Render Scale</div>
                <div class="stat-value">100%</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Latency</div>
                <div class="stat-value">{{ latency }}ms</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VRアクションパネル -->
      <div class="vr-actions">
        <button
          class="vr-action-btn primary"
          :disabled="vrReadiness < 40"
          @click="launchVRExperience"
        >
          <div class="btn-icon">🚀</div>
          <div class="btn-text">Launch VR Experience</div>
          <div class="btn-subtitle" v-if="vrReadiness < 40">
            Requires {{ 40 - vrReadiness }}% more readiness
          </div>
        </button>

        <button class="vr-action-btn secondary" @click="calibrateVR">
          <div class="btn-icon">⚙️</div>
          <div class="btn-text">Calibrate VR Setup</div>
        </button>

        <button class="vr-action-btn secondary" @click="previewSettings">
          <div class="btn-icon">🎛️</div>
          <div class="btn-text">VR Settings</div>
        </button>
      </div>

      <!-- VR互換性情報 -->
      <div class="vr-compatibility">
        <div class="compatibility-header">
          <h4>VR Compatibility</h4>
          <div class="compatibility-status" :class="compatibilityClass">
            {{ compatibilityStatus }}
          </div>
        </div>
        <div class="compatibility-details">
          <div class="compatibility-item">
            <span class="item-label">WebXR Support:</span>
            <span class="item-status" :class="{ supported: webXRSupported }">
              {{ webXRSupported ? 'Supported' : 'Not Supported' }}
            </span>
          </div>
          <div class="compatibility-item">
            <span class="item-label">VR Device:</span>
            <span class="item-status">{{ vrDeviceInfo }}</span>
          </div>
          <div class="compatibility-item">
            <span class="item-label">Recommended:</span>
            <span class="item-status">Meta Quest 2/3, PICO 4</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VR設定モーダル -->
    <div v-if="showSettingsModal" class="vr-settings-modal" @click="closeSettingsModal">
      <div class="settings-content" @click.stop>
        <h3>VR Experience Settings</h3>
        
        <div class="setting-group">
          <label class="setting-label">Movement</label>
          <div class="setting-options">
            <label class="option-label">
              <input type="radio" value="teleport" v-model="vrSettings.movement" />
              <span>Teleport (Comfortable)</span>
            </label>
            <label class="option-label">
              <input type="radio" value="smooth" v-model="vrSettings.movement" />
              <span>Smooth Locomotion</span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Comfort Features</label>
          <div class="setting-checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.comfortMode" />
              <span>Comfort Mode (Reduces motion sickness)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.snapTurn" />
              <span>Snap Turning</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.vignetteMode" />
              <span>Vignette during movement</span>
            </label>
          </div>
        </div>

        <div class="setting-group">
          <label class="setting-label">Interaction</label>
          <div class="setting-checkboxes">
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.handTracking" />
              <span>Hand Tracking (if supported)</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.voiceCommands" />
              <span>Voice Commands</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="vrSettings.hapticFeedback" />
              <span>Haptic Feedback</span>
            </label>
          </div>
        </div>

        <div class="settings-actions">
          <button class="save-settings-btn" @click="saveVRSettings">Save Settings</button>
          <button class="cancel-settings-btn" @click="closeSettingsModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerProfileStore } from '@/stores/playerProfile'

const props = defineProps({
  planet: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['exit-vr-preview', 'launch-vr', 'calibrate-vr'])

const playerProfileStore = usePlayerProfileStore()

// VRプレビュー状態
const vrSceneContainer = ref(null)
const isFullscreen = ref(false)
const showVRHands = ref(true)
const showSettingsModal = ref(false)

// VR互換性
const webXRSupported = ref(false)
const vrDeviceInfo = ref('Checking...')

// アニメーション状態
const sceneRotation = ref(0)
const handPosition = ref({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } })
const latency = ref(15)

// VR設定
const vrSettings = ref({
  movement: 'teleport',
  comfortMode: true,
  snapTurn: true,
  vignetteMode: true,
  handTracking: false,
  voiceCommands: true,
  hapticFeedback: true
})

// 惑星データ
const planetData = computed(() => {
  if (!props.planet) return null
  
  const planetMap = {
    soundPlanet: {
      id: 'soundPlanet',
      name: 'Sound Planet',
      emoji: '🔊',
      progress: playerProfileStore.profile.skills.phonics,
      environment: {
        primary: '#00ff88',
        secondary: '#4ecdc4',
        background: 'radial-gradient(circle, #001a1a, #000066)'
      }
    },
    wordPlanet: {
      id: 'wordPlanet', 
      name: 'Word Planet',
      emoji: '📚',
      progress: playerProfileStore.profile.skills.vocabulary,
      environment: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: 'radial-gradient(circle, #001a33, #330066)'
      }
    },
    grammarPlanet: {
      id: 'grammarPlanet',
      name: 'Grammar Planet', 
      emoji: '⚙️',
      progress: playerProfileStore.profile.skills.grammar,
      environment: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        background: 'radial-gradient(circle, #1a0033, #660033)'
      }
    }
    // 他の惑星も同様に定義
  }
  
  return planetMap[props.planet] || planetMap.soundPlanet
})

// VR準備度
const vrReadiness = computed(() => playerProfileStore.overallVRReadiness)

// 環境スタイル
const environmentStyle = computed(() => ({
  background: planetData.value?.environment.background || 'radial-gradient(circle, #001a1a, #000066)'
}))

const mainObjectStyle = computed(() => ({
  transform: `rotateY(${sceneRotation.value}deg) scale(${1 + Math.sin(Date.now() * 0.001) * 0.1})`
}))

// 学習アイテム
const learningItems = computed(() => {
  const baseItems = [
    { icon: '🎯', label: 'Practice', progress: 75, angle: 0 },
    { icon: '🏆', label: 'Challenges', progress: 60, angle: 120 },
    { icon: '📖', label: 'Lessons', progress: 90, angle: 240 }
  ]
  
  return baseItems.map(item => ({
    ...item,
    progress: Math.min(100, (planetData.value?.progress || 0) + Math.random() * 20)
  }))
})

// パーティクル
const environmentParticles = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100,
  size: Math.random() * 4 + 1,
  speed: Math.random() * 0.5 + 0.1,
  opacity: Math.random() * 0.8 + 0.2
})))

// VR機能
const vrFeatures = computed(() => [
  { name: '3D Spatial Learning', icon: '🌌', enabled: vrReadiness.value >= 20 },
  { name: 'Hand Interaction', icon: '👋', enabled: vrReadiness.value >= 40 },
  { name: 'Voice Recognition', icon: '🎤', enabled: vrReadiness.value >= 60 },
  { name: 'AI Companion', icon: '🤖', enabled: vrReadiness.value >= 80 }
])

// 互換性情報
const compatibilityClass = computed(() => {
  if (webXRSupported.value && vrReadiness.value >= 40) return 'excellent'
  if (webXRSupported.value && vrReadiness.value >= 20) return 'good'
  if (webXRSupported.value) return 'basic'
  return 'unsupported'
})

const compatibilityStatus = computed(() => {
  const statusMap = {
    excellent: 'Excellent VR Support',
    good: 'Good VR Support', 
    basic: 'Basic VR Support',
    unsupported: 'VR Not Supported'
  }
  return statusMap[compatibilityClass.value]
})

// ハンドスタイル
const leftHandStyle = computed(() => ({
  transform: `translate3d(${handPosition.value.left.x}px, ${handPosition.value.left.y}px, 0) rotateZ(-15deg)`
}))

const rightHandStyle = computed(() => ({
  transform: `translate3d(${handPosition.value.right.x}px, ${handPosition.value.right.y}px, 0) rotateZ(15deg)`
}))

// メソッド
const getItemStyle = (item, index) => {
  const angle = item.angle + sceneRotation.value * 0.1
  const radius = 150
  const x = Math.cos(angle * Math.PI / 180) * radius
  const z = Math.sin(angle * Math.PI / 180) * radius
  
  return {
    transform: `translate3d(${x}px, -20px, ${z}px)`,
    zIndex: z > 0 ? 10 : 1
  }
}

const getParticleStyle = (particle) => ({
  left: `${particle.x}%`,
  top: `${particle.y}%`,
  width: `${particle.size}px`,
  height: `${particle.size}px`,
  opacity: particle.opacity,
  animationDelay: `${particle.id * 0.1}s`
})

const interactWithItem = (item) => {
  logger.log('Interacting with VR item:', item.label)
  // VRアイテムとのインタラクション処理
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const exitPreview = () => {
  emit('exit-vr-preview')
}

const launchVRExperience = () => {
  if (vrReadiness.value >= 40) {
    emit('launch-vr', planetData.value)
  }
}

const calibrateVR = () => {
  emit('calibrate-vr')
}

const previewSettings = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const saveVRSettings = () => {
  playerProfileStore.updateVRSettings(vrSettings.value)
  showSettingsModal.value = false
}

// VR互換性チェック
const checkVRCompatibility = async () => {
  if (navigator.xr) {
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      webXRSupported.value = supported
      
      if (supported) {
        vrDeviceInfo.value = 'VR Device Detected'
      } else {
        vrDeviceInfo.value = 'No VR Device'
      }
    } catch (error) {
      webXRSupported.value = false
      vrDeviceInfo.value = 'VR Check Failed'
    }
  } else {
    webXRSupported.value = false
    vrDeviceInfo.value = 'WebXR Not Supported'
  }
}

// アニメーションループ
let animationFrame = null

const animate = () => {
  sceneRotation.value += 0.5
  
  // ハンドポジションアニメーション
  const time = Date.now() * 0.002
  handPosition.value.left.x = Math.sin(time) * 30
  handPosition.value.left.y = Math.cos(time * 1.3) * 20
  handPosition.value.right.x = Math.sin(time + Math.PI) * 30
  handPosition.value.right.y = Math.cos(time * 1.3 + Math.PI) * 20
  
  // レイテンシシミュレーション
  latency.value = 15 + Math.sin(time * 0.1) * 5
  
  animationFrame = requestAnimationFrame(animate)
}

// ライフサイクル
onMounted(async () => {
  await checkVRCompatibility()
  animate()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.vr-preview-portal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ポータルオーバーレイ */
.portal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.overlay-gradient {
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.8) 70%,
    rgba(0, 0, 0, 0.95) 100%
  );
  backdrop-filter: blur(5px);
}

.vr-grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-drift 20s linear infinite;
}

/* VRプレビューウィンドウ */
.vr-preview-window {
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

/* VRヘッダー */
.vr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(90deg, rgba(255, 107, 157, 0.1), rgba(78, 205, 196, 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.vr-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.vr-icon {
  font-size: 32px;
  animation: vr-pulse 2s ease-in-out infinite;
}

.vr-text .title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.vr-text .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.vr-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-btn.exit-btn:hover {
  background: rgba(255, 100, 100, 0.3);
}

.control-btn .icon {
  font-size: 16px;
}

.control-btn .label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* VRシーンコンテナ */
.vr-scene-container {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
}

.vr-scene-canvas {
  flex: 1;
  position: relative;
  background: #000;
  border-radius: 15px;
  overflow: hidden;
  perspective: 1000px;
}

.vr-scene-canvas.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  border-radius: 0;
}

/* シーンプレースホルダー */
.scene-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.planet-environment {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.environment-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #001a1a, #000066);
}

/* VRオブジェクト */
.vr-objects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateZ(0);
  transform-style: preserve-3d;
}

.learning-object {
  position: absolute;
  width: 120px;
  height: 120px;
  transform-style: preserve-3d;
  cursor: pointer;
}

.main-object {
  top: -60px;
  left: -60px;
}

.object-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  animation: object-float 4s ease-in-out infinite;
}

.object-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 50%;
  animation: glow-pulse 3s ease-in-out infinite;
}

.interaction-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  height: 160px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ring-rotate 8s linear infinite;
}

/* 学習アイテム */
.learning-item {
  position: absolute;
  width: 80px;
  height: 80px;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.learning-item:hover {
  transform: scale(1.1) translateZ(20px);
}

.item-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
}

.item-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: white;
  text-align: center;
  margin-top: 8px;
  opacity: 0.8;
}

.item-progress {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.item-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #4ecdc4);
  border-radius: 2px;
}

/* VRハンド */
.vr-hands {
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
  transform-style: preserve-3d;
}

.left-hand {
  bottom: 20%;
  left: 20%;
}

.right-hand {
  bottom: 20%;
  right: 20%;
}

.hand-icon {
  font-size: 32px;
  opacity: 0.8;
}

.hand-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  transform: translate(-50%, -50%) rotateZ(-45deg);
  transform-origin: top;
}

/* 環境パーティクル */
.environment-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.env-particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-drift 10s linear infinite;
}

/* VR UI要素 */
.vr-ui-elements {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  pointer-events: none;
}

.progress-indicator {
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 10px 15px;
  margin-bottom: 15px;
  backdrop-filter: blur(5px);
}

.progress-text {
  color: white;
  font-size: 12px;
  margin-bottom: 5px;
}

.progress-bar-3d {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-3d {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #4ecdc4);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.interaction-hints {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 6px 10px;
  backdrop-filter: blur(5px);
}

.hint-icon {
  font-size: 16px;
}

.hint-text {
  color: white;
  font-size: 11px;
  opacity: 0.9;
}

/* VRステータスパネル */
.vr-status-panel {
  width: 280px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  backdrop-filter: blur(5px);
}

.status-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}

.status-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.status-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

/* VR準備度メーター */
.readiness-meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meter-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b9d, #4ecdc4);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.meter-text {
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 35px;
}

/* 機能リスト */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.feature-item.enabled {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.feature-icon {
  font-size: 16px;
  opacity: 0.7;
}

.feature-item.enabled .feature-icon {
  opacity: 1;
}

.feature-name {
  flex: 1;
  color: white;
  font-size: 12px;
}

.feature-status {
  color: #00ff88;
  font-size: 14px;
}

/* パフォーマンス統計 */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  margin-bottom: 4px;
}

.stat-value {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* VRアクション */
.vr-actions {
  display: flex;
  gap: 15px;
  padding: 20px 30px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.vr-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.vr-action-btn.primary {
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  color: white;
}

.vr-action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
}

.vr-action-btn.primary:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.vr-action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.vr-action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 12px;
  font-weight: 600;
}

.btn-subtitle {
  font-size: 10px;
  opacity: 0.7;
  margin-top: 2px;
}

/* VR互換性 */
.vr-compatibility {
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.compatibility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.compatibility-header h4 {
  color: white;
  font-size: 14px;
  margin: 0;
}

.compatibility-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.compatibility-status.excellent {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.compatibility-status.good {
  background: rgba(255, 200, 0, 0.2);
  color: #ffc800;
}

.compatibility-status.basic {
  background: rgba(255, 150, 0, 0.2);
  color: #ff9600;
}

.compatibility-status.unsupported {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.compatibility-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.compatibility-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.item-label {
  color: rgba(255, 255, 255, 0.7);
}

.item-status {
  color: white;
}

.item-status.supported {
  color: #00ff88;
}

/* VR設定モーダル */
.vr-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.settings-content {
  background: rgba(20, 20, 40, 0.95);
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  color: white;
  backdrop-filter: blur(10px);
}

.settings-content h3 {
  margin: 0 0 20px 0;
  color: #4ecdc4;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.setting-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.setting-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
}

.settings-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.save-settings-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(45deg, #00ff88, #4ecdc4);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.cancel-settings-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

/* アニメーション */
@keyframes vr-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes grid-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

@keyframes object-float {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
  50% { transform: translate(-50%, -50%) translateY(-10px); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes ring-rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes particle-drift {
  0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .vr-preview-window {
    width: 95vw;
    height: 90vh;
  }
  
  .vr-scene-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .vr-status-panel {
    width: 100%;
  }
  
  .vr-actions {
    flex-direction: column;
  }
  
  .performance-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .vr-header {
    padding: 15px 20px;
  }
  
  .vr-title .title {
    font-size: 20px;
  }
  
  .vr-scene-container {
    padding: 15px;
  }
  
  .settings-content {
    padding: 20px;
    width: 95%;
  }
}
</style>