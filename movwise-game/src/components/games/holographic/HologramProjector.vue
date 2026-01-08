<template>
  <div class="hologram-projector">
    <!-- Projector Frame -->
    <div class="projector-frame">
      <!-- Scan Lines Effect -->
      <div class="scan-lines"></div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="hologram-loader">
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
          <div class="loader-ring"></div>
        </div>
        <p class="loading-text">Initializing Hologram...</p>
      </div>

      <!-- Media Display -->
      <div v-show="!isLoading" class="media-container">
        <!-- Video Display -->
        <video
          v-if="mediaType === 'video'"
          ref="videoRef"
          :src="mediaUrl"
          @loadeddata="handleMediaReady"
          @error="handleMediaError"
          autoplay
          loop
          muted
          playsinline
          class="hologram-media"
        />

        <!-- Image Display -->
        <img
          v-else-if="mediaType === 'image' && !hasError"
          :src="mediaUrl"
          @load="handleMediaReady"
          @error="handleMediaError"
          :alt="title"
          class="hologram-media"
          crossorigin="anonymous"
          loading="eager"
        />

        <!-- Fallback for failed images -->
        <div v-else-if="hasError || mediaType === 'image'" class="fallback-display">
          <div class="fallback-icon">🖼️</div>
          <p class="fallback-text">{{ title }}</p>
        </div>

        <!-- Hologram Effects -->
        <div class="hologram-effects">
          <div class="glitch-effect"></div>
          <div class="hologram-grid"></div>
        </div>
      </div>

      <!-- Title Display -->
      <div class="projector-title">
        <h3 class="scenario-title">{{ title }}</h3>
      </div>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <div class="panel-indicator active"></div>
      <div class="panel-indicator active"></div>
      <div class="panel-indicator active"></div>
      <div class="panel-text">HOLOGRAM ACTIVE</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ['video', 'image'].includes(value)
  },
  mediaUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['media-loaded', 'media-error'])

const videoRef = ref(null)
const loadingTimeout = ref(null)
const hasError = ref(false)

const handleMediaReady = () => {
  console.log('Media loaded successfully:', props.mediaUrl)
  hasError.value = false
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value)
    loadingTimeout.value = null
  }
  setTimeout(() => {
    emit('media-loaded')
  }, 500)
}

const handleMediaError = (error) => {
  console.error('Media loading error:', error, 'for URL:', props.mediaUrl)
  hasError.value = true
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value)
    loadingTimeout.value = null
  }
  emit('media-error', error)
  // Emit media-loaded to stop loading state even on error
  emit('media-loaded')
}

const startLoadingTimeout = () => {
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value)
  }

  loadingTimeout.value = setTimeout(() => {
    console.warn('Image loading timeout for:', props.mediaUrl)
    handleMediaError(new Error('Loading timeout'))
  }, 5000) // 5秒でタイムアウト
}

// Handle video playback
watch(() => props.mediaUrl, (newUrl) => {
  hasError.value = false // Reset error state when URL changes
  if (props.mediaType === 'video' && videoRef.value) {
    videoRef.value.load()
  }
  startLoadingTimeout()
})

watch(() => props.isLoading, (isLoading) => {
  if (isLoading) {
    startLoadingTimeout()
  } else {
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value)
      loadingTimeout.value = null
    }
  }
})

onMounted(() => {
  // Add hologram animation class
  document.body.classList.add('hologram-active')
  // Start loading timeout when component mounts
  if (props.isLoading) {
    startLoadingTimeout()
  }
})

onUnmounted(() => {
  // Clean up
  document.body.classList.remove('hologram-active')
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value)
  }
})
</script>

<style scoped>
.hologram-projector {
  @apply relative w-full max-w-4xl mx-auto;
}

.projector-frame {
  @apply relative bg-black rounded-2xl overflow-hidden;
  aspect-ratio: 16/9;
  max-height: 30vh;
  border: 3px solid rgba(0, 255, 255, 0.3);
  box-shadow:
    0 0 50px rgba(0, 255, 255, 0.4),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
}

.scan-lines {
  @apply absolute inset-0 pointer-events-none z-20;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 255, 0.03) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 255, 0.03) 3px
  );
  animation: scanlines 8s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}

.loading-container {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.hologram-loader {
  @apply relative w-24 h-24;
}

.loader-ring {
  @apply absolute inset-0 border-4 rounded-full;
  border-color: rgba(0, 255, 255, 0.2);
  border-top-color: cyan;
  animation: loaderSpin 1s linear infinite;
}

.loader-ring:nth-child(2) {
  @apply inset-2;
  animation-duration: 0.8s;
  border-color: rgba(255, 0, 255, 0.2);
  border-top-color: magenta;
}

.loader-ring:nth-child(3) {
  @apply inset-4;
  animation-duration: 0.6s;
  border-color: rgba(0, 255, 0, 0.2);
  border-top-color: lime;
}

@keyframes loaderSpin {
  to { transform: rotate(360deg); }
}

.loading-text {
  @apply mt-6 text-cyan-400 text-lg font-mono;
  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.media-container {
  @apply relative w-full h-full;
}

.hologram-media {
  @apply w-full h-full object-cover;
  filter: brightness(1.1) contrast(1.1);
}

.hologram-effects {
  @apply absolute inset-0 pointer-events-none;
}

.glitch-effect {
  @apply absolute inset-0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(0, 255, 255, 0.02) 30%,
    rgba(0, 255, 255, 0.02) 70%,
    transparent 70%
  );
  animation: glitch 5s linear infinite;
}

@keyframes glitch {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.hologram-grid {
  @apply absolute inset-0;
  background-image:
    repeating-linear-gradient(90deg, rgba(0, 255, 255, 0.01) 0, transparent 1px, transparent 20px, rgba(0, 255, 255, 0.01) 21px),
    repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.01) 0, transparent 1px, transparent 20px, rgba(0, 255, 255, 0.01) 21px);
  animation: gridFloat 10s linear infinite;
}

@keyframes gridFloat {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.projector-title {
  @apply absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent;
}

.scenario-title {
  @apply text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider;
  text-shadow:
    0 0 10px rgba(0, 255, 255, 0.8),
    0 0 20px rgba(0, 255, 255, 0.5);
}

.control-panel {
  @apply mt-4 flex items-center justify-center gap-4 p-3 bg-gray-900 rounded-lg;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.panel-indicator {
  @apply w-3 h-3 rounded-full bg-gray-700;
  transition: all 0.3s ease;
}

.panel-indicator.active {
  @apply bg-cyan-400;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  animation: indicatorPulse 2s ease-in-out infinite;
}

@keyframes indicatorPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.panel-text {
  @apply text-cyan-400 text-sm font-mono uppercase tracking-wider;
}

.fallback-display {
  @apply w-full h-full flex flex-col items-center justify-center bg-gray-800;
}

.fallback-icon {
  @apply text-6xl mb-4 opacity-50;
}

.fallback-text {
  @apply text-cyan-400 text-lg font-mono text-center px-4;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .projector-frame {
    aspect-ratio: 4/3;
  }

  .scenario-title {
    @apply text-lg;
  }
}
</style>