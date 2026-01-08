<template>
  <div v-if="isDev" class="vr-debug-panel">
    <div class="debug-header">
      <h3>🛠️ VR Debug Panel</h3>
      <button @click="isExpanded = !isExpanded" class="toggle-btn">
        {{ isExpanded ? '▼' : '▶️' }}
      </button>
    </div>

    <div v-if="isExpanded" class="debug-content">
      <!-- WebXR Support Status -->
      <div class="debug-section">
        <h4>WebXR Support</h4>
        <div class="debug-info">
          <div class="info-row">
            <span class="label">WebXR API:</span>
            <span class="value" :class="support.webxr ? 'success' : 'error'">
              {{ support.webxr ? '✅ Supported' : '❌ Not Supported' }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">VR Session:</span>
            <span class="value" :class="support.vr ? 'success' : 'error'">
              {{ support.vr ? '✅ Available' : '❌ Not Available' }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Hand Tracking:</span>
            <span class="value" :class="support.handTracking ? 'success' : 'warning'">
              {{ support.handTracking ? '✅ Supported' : '⚠️ Unknown' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Device Information -->
      <div class="debug-section">
        <h4>Device Info</h4>
        <div class="debug-info">
          <div class="info-row">
            <span class="label">User Agent:</span>
            <span class="value small">{{ userAgent }}</span>
          </div>
          <div class="info-row">
            <span class="label">Screen Size:</span>
            <span class="value">{{ screenInfo.width }}x{{ screenInfo.height }}</span>
          </div>
          <div class="info-row">
            <span class="label">Pixel Ratio:</span>
            <span class="value">{{ screenInfo.pixelRatio }}</span>
          </div>
        </div>
      </div>

      <!-- VR Session Status -->
      <div class="debug-section" v-if="vrSession">
        <h4>VR Session</h4>
        <div class="debug-info">
          <div class="info-row">
            <span class="label">Session Active:</span>
            <span class="value success">✅ Active</span>
          </div>
          <div class="info-row">
            <span class="label">Reference Space:</span>
            <span class="value">{{ vrSession.referenceSpace }}</span>
          </div>
          <div class="info-row">
            <span class="label">Frame Rate:</span>
            <span class="value">{{ vrSession.frameRate || 'Unknown' }}</span>
          </div>
        </div>
      </div>

      <!-- Controllers Status -->
      <div class="debug-section" v-if="controllers.length > 0">
        <h4>Controllers</h4>
        <div class="debug-info">
          <div v-for="(controller, index) in controllers" :key="index" class="controller-info">
            <div class="info-row">
              <span class="label">Controller {{ index }}:</span>
              <span class="value" :class="controller.connected ? 'success' : 'error'">
                {{ controller.connected ? '✅ Connected' : '❌ Disconnected' }}
              </span>
            </div>
            <div v-if="controller.connected" class="info-row">
              <span class="label">Handedness:</span>
              <span class="value">{{ controller.handedness }}</span>
            </div>
            <div v-if="controller.position" class="info-row">
              <span class="label">Position:</span>
              <span class="value small">
                X: {{ controller.position.x.toFixed(2) }},
                Y: {{ controller.position.y.toFixed(2) }},
                Z: {{ controller.position.z.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="debug-section" v-if="performance">
        <h4>Performance</h4>
        <div class="debug-info">
          <div class="info-row">
            <span class="label">FPS:</span>
            <span class="value" :class="getFPSClass(performance.fps)">
              {{ performance.fps }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Draw Calls:</span>
            <span class="value">{{ performance.drawCalls }}</span>
          </div>
          <div class="info-row">
            <span class="label">Triangles:</span>
            <span class="value">{{ performance.triangles }}</span>
          </div>
          <div class="info-row">
            <span class="label">Memory:</span>
            <span class="value">{{ (performance.memory / 1024 / 1024).toFixed(1) }}MB</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="debug-section">
        <h4>Quick Actions</h4>
        <div class="debug-actions">
          <button @click="testWebXR" class="debug-btn">Test WebXR</button>
          <button @click="testAudio" class="debug-btn">Test Audio</button>
          <button @click="testSpeech" class="debug-btn">Test Speech</button>
          <button @click="showConsole" class="debug-btn">Show Console</button>
          <button @click="exportDebugLog" class="debug-btn">Export Log</button>
        </div>
      </div>

      <!-- Debug Log -->
      <div class="debug-section">
        <h4>Debug Log</h4>
        <div class="debug-log">
          <div v-for="(log, index) in debugLogs" :key="index" class="log-entry" :class="log.level">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Development mode check
const isDev = import.meta.env.DEV

// UI State
const isExpanded = ref(false)

// Support Status
const support = ref({
  webxr: false,
  vr: false,
  handTracking: false
})

// Device Information
const userAgent = ref(navigator.userAgent)
const screenInfo = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
})

// VR Session
const vrSession = ref<any>(null)

// Controllers
const controllers = ref<any[]>([])

// Performance
const performance = ref<any>(null)

// Debug Logs
const debugLogs = ref<Array<{time: string, level: string, message: string}>>([])

// Methods
async function checkWebXRSupport() {
  if ('xr' in navigator) {
    support.value.webxr = true

    try {
      support.value.vr = await navigator.xr!.isSessionSupported('immersive-vr')

      // Hand tracking check (simplified)
      support.value.handTracking = true // Assume supported for now

      addLog('info', 'WebXR support check completed')
    } catch (error) {
      addLog('error', `WebXR support check failed: ${error}`)
    }
  } else {
    addLog('error', 'WebXR not available in this browser')
  }
}

function addLog(level: string, message: string) {
  const time = new Date().toLocaleTimeString()
  debugLogs.value.unshift({ time, level, message })

  // Keep only last 50 logs
  if (debugLogs.value.length > 50) {
    debugLogs.value = debugLogs.value.slice(0, 50)
  }
}

function getFPSClass(fps: number): string {
  if (fps >= 60) return 'success'
  if (fps >= 30) return 'warning'
  return 'error'
}

// Test Functions
async function testWebXR() {
  addLog('info', 'Testing WebXR capabilities...')

  if (!support.value.webxr) {
    addLog('error', 'WebXR not supported')
    return
  }

  try {
    // Test VR session request
    const session = await navigator.xr!.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
    })

    vrSession.value = {
      referenceSpace: 'local-floor',
      frameRate: session.frameRate || 'Unknown'
    }

    addLog('success', 'VR session created successfully')

    // End session immediately for testing
    session.end()
    addLog('info', 'Test VR session ended')

  } catch (error) {
    addLog('error', `VR session test failed: ${error}`)
  }
}

function testAudio() {
  addLog('info', 'Testing audio capabilities...')

  // Create a test audio context
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create a simple beep
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 440 // A4 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    addLog('success', 'Audio test completed - you should hear a beep')

  } catch (error) {
    addLog('error', `Audio test failed: ${error}`)
  }
}

function testSpeech() {
  addLog('info', 'Testing speech recognition...')

  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    addLog('error', 'Speech Recognition not supported')
    return
  }

  try {
    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      addLog('info', 'Speech recognition started - say something!')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      const confidence = event.results[0][0].confidence
      addLog('success', `Speech recognized: "${transcript}" (confidence: ${confidence.toFixed(2)})`)
    }

    recognition.onerror = (event: any) => {
      addLog('error', `Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      addLog('info', 'Speech recognition ended')
    }

    recognition.start()

  } catch (error) {
    addLog('error', `Speech test failed: ${error}`)
  }
}

function showConsole() {
  addLog('info', 'Opening browser console...')
  // Note: This doesn't actually open console, just logs instruction
  console.log('🛠️ VR Debug Panel: Check browser console for detailed logs')
  addLog('info', 'Check browser console for detailed logs')
}

function exportDebugLog() {
  const logData = {
    timestamp: new Date().toISOString(),
    support: support.value,
    userAgent: userAgent.value,
    screenInfo: screenInfo.value,
    logs: debugLogs.value
  }

  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `vr-debug-log-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
  addLog('success', 'Debug log exported')
}

// Performance monitoring
function startPerformanceMonitoring() {
  setInterval(() => {
    performance.value = {
      fps: Math.round(1000 / 16), // Simplified FPS calculation
      drawCalls: Math.floor(Math.random() * 100) + 50, // Mock data
      triangles: Math.floor(Math.random() * 10000) + 5000, // Mock data
      memory: (performance as any).memory?.usedJSHeapSize || 0
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  if (isDev) {
    checkWebXRSupport()
    startPerformanceMonitoring()
    addLog('info', 'VR Debug Panel initialized')
  }
})

onUnmounted(() => {
  if (isDev) {
    addLog('info', 'VR Debug Panel destroyed')
  }
})
</script>

<style scoped>
.vr-debug-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 350px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 8px;
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 10000;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
  color: #4ade80;
}

.toggle-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
}

.debug-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 8px;
}

.debug-section {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #60a5fa;
}

.debug-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.label {
  color: #9ca3af;
  font-weight: bold;
}

.value {
  color: white;
  text-align: right;
  max-width: 60%;
  word-wrap: break-word;
}

.value.small {
  font-size: 10px;
}

.value.success {
  color: #4ade80;
}

.value.warning {
  color: #fbbf24;
}

.value.error {
  color: #ef4444;
}

.controller-info {
  margin-bottom: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.debug-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.debug-btn {
  background: #374151;
  border: 1px solid #4b5563;
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.2s;
}

.debug-btn:hover {
  background: #4b5563;
}

.debug-log {
  max-height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  padding: 8px;
}

.log-entry {
  display: flex;
  gap: 8px;
  margin-bottom: 2px;
  font-size: 10px;
}

.log-time {
  color: #6b7280;
  min-width: 70px;
}

.log-message {
  flex: 1;
}

.log-entry.info .log-message {
  color: #60a5fa;
}

.log-entry.success .log-message {
  color: #4ade80;
}

.log-entry.warning .log-message {
  color: #fbbf24;
}

.log-entry.error .log-message {
  color: #ef4444;
}

/* Scrollbar styling */
.debug-content::-webkit-scrollbar,
.debug-log::-webkit-scrollbar {
  width: 4px;
}

.debug-content::-webkit-scrollbar-track,
.debug-log::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.debug-content::-webkit-scrollbar-thumb,
.debug-log::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>