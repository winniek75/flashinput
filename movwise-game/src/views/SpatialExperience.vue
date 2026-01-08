<template>
  <div class="spatial-experience" :class="experienceClasses">
    <!-- Header Section -->
    <header class="spatial-header">
      <div class="header-content">
        <button 
          @click="$router.go(-1)"
          class="back-button focus-ring"
          aria-label="前のページに戻る"
        >
          <Icon name="arrow-left" />
          <span>戻る</span>
        </button>

        <div class="header-title">
          <h1 class="page-title">Spatial.io Experience</h1>
          <p class="page-subtitle">{{ currentSpace?.title || 'マルチプレイヤーVR学習空間' }}</p>
        </div>

        <div class="header-actions">
          <button 
            @click="toggleFullscreen"
            class="action-button focus-ring"
            aria-label="フルスクリーン切り替え"
          >
            <Icon :name="isFullscreen ? 'minimize' : 'maximize'" />
          </button>
          
          <button 
            @click="openSettings"
            class="action-button focus-ring"
            aria-label="設定を開く"
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </header>

    <!-- Connection Status -->
    <div v-if="!isConnected" class="connection-status">
      <div class="status-indicator">
        <Icon name="wifi-off" class="status-icon" />
        <span>Spatial.ioに接続中...</span>
      </div>
    </div>

    <!-- Main Experience Area -->
    <main class="spatial-content" id="main-content">
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <GalaxyLoader 
          theme="spatial"
          :progress="loadingProgress"
          title="Spatial.io"
          message="VR空間を構築中..."
          :tips="loadingTips"
        />
      </div>

      <!-- Space Information -->
      <section v-else-if="!isSpatialActive" class="space-info" aria-labelledby="space-info-heading">
        <h2 id="space-info-heading" class="section-title">VR空間情報</h2>
        
        <div class="space-card">
          <div class="space-image">
            <img 
              :src="currentSpace?.thumbnailUrl || '/images/spatial/default-space.jpg'"
              :alt="currentSpace?.title"
              loading="lazy"
            />
          </div>
          
          <div class="space-details">
            <h3 class="space-title">{{ currentSpace?.title }}</h3>
            <p class="space-description">{{ currentSpace?.description }}</p>
            
            <div class="space-meta">
              <div class="meta-item">
                <Icon name="users" />
                <span>{{ currentSpace?.maxUsers || 20 }}人まで参加可能</span>
              </div>
              <div class="meta-item">
                <Icon name="clock" />
                <span>推定時間: {{ currentSpace?.duration || 30 }}分</span>
              </div>
              <div class="meta-item">
                <Icon name="star" />
                <span>難易度: {{ currentSpace?.difficulty || '中級' }}</span>
              </div>
            </div>
            
            <div class="space-objectives">
              <h4>学習目標</h4>
              <ul>
                <li v-for="objective in currentSpace?.objectives || defaultObjectives" :key="objective">
                  {{ objective }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Device Check -->
        <div class="device-check">
          <h3>デバイス要件</h3>
          <div class="requirements-grid">
            <div class="requirement-item" :class="{ 'met': deviceSupport.webxr }">
              <Icon :name="deviceSupport.webxr ? 'check-circle' : 'x-circle'" />
              <span>WebXR対応</span>
            </div>
            <div class="requirement-item" :class="{ 'met': deviceSupport.vr }">
              <Icon :name="deviceSupport.vr ? 'check-circle' : 'x-circle'" />
              <span>VRヘッドセット</span>
            </div>
            <div class="requirement-item" :class="{ 'met': deviceSupport.spatial }">
              <Icon :name="deviceSupport.spatial ? 'check-circle' : 'x-circle'" />
              <span>Spatial.ioアプリ</span>
            </div>
          </div>
        </div>

        <!-- Join Options -->
        <div class="join-options">
          <button 
            @click="joinVRSpace"
            class="join-button vr-join focus-ring"
            :disabled="!canJoinVR"
          >
            <Icon name="vr-headset" />
            <span>VRで参加</span>
          </button>
          
          <button 
            @click="joinDesktopMode"
            class="join-button desktop-join focus-ring"
          >
            <Icon name="monitor" />
            <span>デスクトップモードで参加</span>
          </button>
          
          <button 
            @click="openSpatialApp"
            class="join-button app-join focus-ring"
          >
            <Icon name="external-link" />
            <span>Spatial.ioアプリで開く</span>
          </button>
        </div>
      </section>

      <!-- Active Spatial Experience -->
      <section v-else class="spatial-active">
        <div class="spatial-embed">
          <iframe
            ref="spatialFrame"
            :src="spatialUrl"
            class="spatial-iframe"
            allow="camera; microphone; xr-spatial-tracking; fullscreen"
            allowfullscreen
            @load="onSpatialLoad"
          ></iframe>
        </div>
        
        <!-- Overlay Controls -->
        <div class="spatial-controls">
          <button 
            @click="toggleMicrophone"
            class="control-button focus-ring"
            :class="{ 'active': microphoneEnabled }"
            aria-label="マイクロフォンの切り替え"
          >
            <Icon :name="microphoneEnabled ? 'microphone' : 'microphone-slash'" />
          </button>
          
          <button 
            @click="toggleCamera"
            class="control-button focus-ring"
            :class="{ 'active': cameraEnabled }"
            aria-label="カメラの切り替え"
          >
            <Icon :name="cameraEnabled ? 'camera' : 'camera-slash'" />
          </button>
          
          <button 
            @click="leaveSpatialSpace"
            class="control-button leave-button focus-ring"
            aria-label="空間から退出"
          >
            <Icon name="log-out" />
          </button>
        </div>
      </section>

      <!-- Connected Users -->
      <section v-if="connectedUsers.length > 0" class="connected-users" aria-labelledby="users-heading">
        <h3 id="users-heading">参加者 ({{ connectedUsers.length }}/{{ currentSpace?.maxUsers || 20 }})</h3>
        <div class="users-grid">
          <div 
            v-for="user in connectedUsers" 
            :key="user.id"
            class="user-card"
          >
            <div class="user-avatar">
              <img :src="user.avatar || '/images/avatars/default.png'" :alt="user.name" />
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-status" :class="user.status">{{ getStatusText(user.status) }}</span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Settings Modal -->
    <teleport to="body">
      <div 
        v-if="showSettingsModal"
        class="modal-overlay"
        @click="closeSettings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div 
          class="settings-modal"
          @click.stop
        >
          <header class="modal-header">
            <h2 id="settings-title">Spatial設定</h2>
            <button 
              @click="closeSettings"
              class="close-button focus-ring"
              aria-label="設定を閉じる"
            >
              <Icon name="x" />
            </button>
          </header>
          
          <div class="modal-content">
            <div class="setting-group">
              <label for="audio-quality">音声品質</label>
              <select 
                id="audio-quality"
                v-model="settings.audioQuality"
                class="quality-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            <div class="setting-group">
              <label for="video-quality">映像品質</label>
              <select 
                id="video-quality"
                v-model="settings.videoQuality"
                class="quality-select"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            <div class="setting-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="settings.enableHaptics"
                  class="setting-checkbox"
                />
                <span class="checkbox-text">ハプティックフィードバック</span>
              </label>
            </div>
            
            <div class="setting-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="settings.enableSpatialAudio"
                  class="setting-checkbox"
                />
                <span class="checkbox-text">空間音響</span>
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              @click="resetSettings"
              class="reset-button focus-ring"
            >
              リセット
            </button>
            <button 
              @click="saveSettings"
              class="save-button focus-ring"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import Icon from '@/components/shared/Icon.vue'
import GalaxyLoader from '@/components/common/GalaxyLoader.vue'
import { accessibilityManager } from '@/utils/accessibilityManager'

// Route and props
const route = useRoute()
const spaceId = computed(() => route.params.spaceId as string)

// Reactive state
const loading = ref(true)
const loadingProgress = ref(0)
const isConnected = ref(false)
const isSpatialActive = ref(false)
const isFullscreen = ref(false)
const showSettingsModal = ref(false)
const microphoneEnabled = ref(true)
const cameraEnabled = ref(true)

// Settings
const settings = useStorage('spatial_settings', {
  audioQuality: 'medium',
  videoQuality: 'medium',
  enableHaptics: true,
  enableSpatialAudio: true
})

// Device support detection
const deviceSupport = ref({
  webxr: false,
  vr: false,
  spatial: false
})

// Spatial data
const currentSpace = ref({
  title: 'Language Galaxy Academy',
  description: 'バーチャル空間で英語を学ぼう！他の学習者と一緒に楽しく英語を練習できます。',
  thumbnailUrl: '/images/spatial/language-academy.jpg',
  maxUsers: 20,
  duration: 45,
  difficulty: '初級〜中級',
  objectives: [
    '他の学習者との英語会話練習',
    'VR環境での没入型学習体験',
    '3D オブジェクトを使った語彙学習',
    'グループ活動での協力学習'
  ]
})

const defaultObjectives = [
  'マルチプレイヤーVR環境での学習体験',
  '他の学習者との交流とコラボレーション',
  '3D空間でのインタラクティブな英語学習',
  'リアルタイムコミュニケーション練習'
]

const connectedUsers = ref([
  {
    id: '1',
    name: 'アキラ',
    avatar: '/images/avatars/student1.png',
    status: 'active'
  },
  {
    id: '2',
    name: 'ユミ',
    avatar: '/images/avatars/student2.png',
    status: 'exploring'
  }
])

const loadingTips = ref([
  'VRヘッドセットがある場合は、より没入感のある体験ができます',
  'マイクとカメラの使用許可をお忘れなく',
  'Spatial.ioアプリを使用すると最高の体験が得られます'
])

// Computed properties
const experienceClasses = computed(() => ({
  'loading': loading.value,
  'connected': isConnected.value,
  'spatial-active': isSpatialActive.value,
  'fullscreen': isFullscreen.value
}))

const canJoinVR = computed(() => {
  return deviceSupport.value.webxr && deviceSupport.value.vr
})

const spatialUrl = computed(() => {
  if (!spaceId.value) return ''
  
  const baseUrl = 'https://spatial.io/s'
  const params = new URLSearchParams({
    embed: 'true',
    quality: settings.value.videoQuality,
    audio: settings.value.audioQuality,
    haptics: settings.value.enableHaptics ? 'true' : 'false',
    spatial_audio: settings.value.enableSpatialAudio ? 'true' : 'false'
  })
  
  return `${baseUrl}/${spaceId.value}?${params.toString()}`
})

// Methods
const checkDeviceSupport = async () => {
  try {
    // Check WebXR support
    if (navigator.xr) {
      deviceSupport.value.webxr = true
      try {
        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr')
        deviceSupport.value.vr = vrSupported
      } catch (error) {
        logger.log('VR not supported:', error)
      }
    }

    // Check for Spatial.io app (user agent detection)
    const userAgent = navigator.userAgent.toLowerCase()
    deviceSupport.value.spatial = userAgent.includes('spatial')

  } catch (error) {
    logger.error('Device support check failed:', error)
  }
}

const joinVRSpace = async () => {
  try {
    if (!canJoinVR.value) {
      alert('VRデバイスが検出されませんでした。デスクトップモードで参加してください。')
      return
    }

    loading.value = true
    loadingProgress.value = 0

    // Simulate VR initialization
    const stages = [
      'VRセッション初期化中...',
      'Spatial.io空間に接続中...',
      'ユーザー設定を同期中...',
      'VR環境を構築中...',
      '準備完了！'
    ]

    for (let i = 0; i < stages.length; i++) {
      loadingProgress.value = (i + 1) * 20
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    isSpatialActive.value = true
    loading.value = false
    isConnected.value = true

    accessibilityManager.announce({
      message: 'VR空間に参加しました',
      priority: 'polite'
    })

  } catch (error) {
    logger.error('Failed to join VR space:', error)
    alert('VR空間への参加に失敗しました。再度お試しください。')
    loading.value = false
  }
}

const joinDesktopMode = async () => {
  loading.value = true
  loadingProgress.value = 0

  const stages = [
    'デスクトップモード初期化中...',
    'Spatial.io空間に接続中...',
    '設定を適用中...',
    '準備完了！'
  ]

  for (let i = 0; i < stages.length; i++) {
    loadingProgress.value = (i + 1) * 25
    await new Promise(resolve => setTimeout(resolve, 400))
  }

  isSpatialActive.value = true
  loading.value = false
  isConnected.value = true

  accessibilityManager.announce({
    message: 'デスクトップモードで空間に参加しました',
    priority: 'polite'
  })
}

const openSpatialApp = () => {
  const spatialAppUrl = `spatial://s/${spaceId.value}`
  window.open(spatialAppUrl, '_blank')
  
  // Fallback to web version
  setTimeout(() => {
    const webUrl = `https://spatial.io/s/${spaceId.value}`
    window.open(webUrl, '_blank')
  }, 1000)
}

const toggleMicrophone = () => {
  microphoneEnabled.value = !microphoneEnabled.value
  
  // Send message to Spatial iframe
  if (isSpatialActive.value && window.frames[0]) {
    window.frames[0].postMessage({
      type: 'toggle_microphone',
      enabled: microphoneEnabled.value
    }, '*')
  }

  accessibilityManager.announce({
    message: `マイクロフォンが${microphoneEnabled.value ? 'オン' : 'オフ'}になりました`,
    priority: 'polite'
  })
}

const toggleCamera = () => {
  cameraEnabled.value = !cameraEnabled.value
  
  // Send message to Spatial iframe
  if (isSpatialActive.value && window.frames[0]) {
    window.frames[0].postMessage({
      type: 'toggle_camera',
      enabled: cameraEnabled.value
    }, '*')
  }

  accessibilityManager.announce({
    message: `カメラが${cameraEnabled.value ? 'オン' : 'オフ'}になりました`,
    priority: 'polite'
  })
}

const leaveSpatialSpace = () => {
  const confirmed = confirm('空間から退出しますか？進行状況は保存されます。')
  if (confirmed) {
    isSpatialActive.value = false
    isConnected.value = false
    
    accessibilityManager.announce({
      message: '空間から退出しました',
      priority: 'polite'
    })
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const openSettings = () => {
  showSettingsModal.value = true
  accessibilityManager.trapFocus(document.querySelector('.settings-modal') as HTMLElement)
}

const closeSettings = () => {
  showSettingsModal.value = false
  accessibilityManager.releaseFocusTrap()
}

const saveSettings = () => {
  // Settings are automatically saved via useStorage
  closeSettings()
  
  accessibilityManager.announce({
    message: 'Spatial設定が保存されました',
    priority: 'polite'
  })
}

const resetSettings = () => {
  settings.value = {
    audioQuality: 'medium',
    videoQuality: 'medium',
    enableHaptics: true,
    enableSpatialAudio: true
  }
  
  accessibilityManager.announce({
    message: 'Spatial設定がリセットされました',
    priority: 'polite'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'アクティブ',
    'exploring': '探索中',
    'away': '離席中',
    'busy': 'ビジー'
  }
  return statusMap[status] || 'オンライン'
}

const onSpatialLoad = () => {
  logger.log('Spatial iframe loaded')
  isConnected.value = true
}

// Initialize
const initializeSpatial = async () => {
  loading.value = true
  
  await checkDeviceSupport()
  
  // Simulate initial loading
  const stages = [
    'Spatial.io接続を確認中...',
    'デバイス要件をチェック中...',
    '空間情報を取得中...',
    '準備完了！'
  ]

  for (let i = 0; i < stages.length; i++) {
    loadingProgress.value = (i + 1) * 25
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  loading.value = false
}

// Lifecycle
onMounted(async () => {
  await initializeSpatial()

  // Listen for messages from Spatial iframe
  window.addEventListener('message', (event) => {
    if (event.data.type === 'spatial_status') {
      isConnected.value = event.data.connected
    }
  })

  accessibilityManager.announce({
    message: 'Spatial.io Experience が読み込まれました',
    priority: 'polite'
  })
})

onUnmounted(() => {
  // Clean up
  accessibilityManager.releaseFocusTrap()
  
  // Leave spatial space if active
  if (isSpatialActive.value) {
    leaveSpatialSpace()
  }
})
</script>

<style scoped>
.spatial-experience {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f4a 50%, #2d3561 100%);
  color: white;
  overflow-x: hidden;
}

/* Header */
.spatial-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  text-decoration: none;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.header-title {
  text-align: center;
  flex: 1;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6, #03a9f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Connection Status */
.connection-status {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 200;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4fc3f7;
}

.status-icon {
  font-size: 1.2rem;
  animation: pulse 2s ease-in-out infinite;
}

/* Main Content */
.spatial-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  border-radius: 2px;
}

/* Space Card */
.space-card {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.space-image {
  border-radius: 0.75rem;
  overflow: hidden;
  height: 200px;
}

.space-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.space-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #4fc3f7;
}

.space-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.space-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.space-objectives h4 {
  color: white;
  margin-bottom: 0.5rem;
}

.space-objectives ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.space-objectives li {
  padding: 0.25rem 0;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  padding-left: 1.5rem;
}

.space-objectives li::before {
  content: '✦';
  position: absolute;
  left: 0;
  color: #4fc3f7;
}

/* Device Check */
.device-check {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.device-check h3 {
  margin-bottom: 1rem;
  color: white;
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.requirement-item.met {
  border-color: #4caf50;
  color: #4caf50;
}

.requirement-item:not(.met) {
  border-color: #f44336;
  color: #f44336;
}

/* Join Options */
.join-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.join-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  min-width: 200px;
  justify-content: center;
}

.vr-join {
  background: linear-gradient(45deg, #e91e63, #ad1457);
  border: none;
  color: white;
}

.vr-join:hover:not(:disabled) {
  background: linear-gradient(45deg, #f06292, #e91e63);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.3);
}

.vr-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.desktop-join {
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  border: none;
  color: white;
}

.desktop-join:hover {
  background: linear-gradient(45deg, #81d4fa, #4fc3f7);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 195, 247, 0.3);
}

.app-join {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.app-join:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Active Spatial Experience */
.spatial-active {
  position: relative;
  height: 80vh;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
}

.spatial-embed {
  width: 100%;
  height: 100%;
}

.spatial-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 1rem;
}

.spatial-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 3rem;
  backdrop-filter: blur(10px);
}

.control-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.control-button.active {
  background: #4fc3f7;
  border-color: #4fc3f7;
}

.leave-button {
  background: #f44336;
  border-color: #f44336;
}

.leave-button:hover {
  background: #f55a4e;
  border-color: #f55a4e;
}

/* Connected Users */
.connected-users {
  margin-top: 2rem;
}

.connected-users h3 {
  color: white;
  margin-bottom: 1rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: white;
  display: block;
}

.user-status {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.user-status.active {
  color: #4caf50;
}

.user-status.exploring {
  color: #4fc3f7;
}

.user-status.away {
  color: #ff9800;
}

.user-status.busy {
  color: #f44336;
}

/* Settings Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: white;
}

.close-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.modal-content {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
}

.quality-select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.setting-checkbox {
  width: auto !important;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.reset-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.save-button {
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  border: none;
  color: white;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .spatial-content {
    padding: 1rem;
  }
  
  .space-card {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .join-options {
    flex-direction: column;
  }
  
  .join-button {
    min-width: auto;
  }
  
  .users-grid {
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
  .control-button,
  .join-button,
  .action-button {
    transition: none;
  }
  
  .status-icon {
    animation: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .spatial-experience {
    background: #000;
  }
  
  .space-card,
  .device-check,
  .user-card {
    border: 2px solid #fff;
  }
}

/* Fullscreen Mode */
.spatial-experience.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.spatial-experience.fullscreen .spatial-active {
  height: 100vh;
  border-radius: 0;
}
</style>