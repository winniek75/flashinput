<!-- Audio Test and Calibration Component -->
<template>
  <div class="audio-test-calibration">
    <!-- Header -->
    <div class="calibration-header">
      <h2 class="title">🔊 音声テスト・校正</h2>
      <p class="subtitle">最適な学習環境を設定しましょう</p>
    </div>

    <!-- Test Progress -->
    <div class="test-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
        ></div>
      </div>
      <span class="progress-text">
        ステップ {{ currentStep }} / {{ totalSteps }}
      </span>
    </div>

    <!-- Step 1: Device Detection -->
    <div v-if="currentStep === 1" class="test-step">
      <div class="step-header">
        <SpeakerIcon class="step-icon" />
        <h3>デバイス検出</h3>
      </div>
      
      <div class="device-info">
        <div class="info-card">
          <HeadphonesIcon class="info-icon" />
          <div class="info-content">
            <h4>音声出力デバイス</h4>
            <p class="device-name">{{ audioOutputDevice || '検出中...' }}</p>
          </div>
          <div class="status-indicator" :class="outputDeviceStatus"></div>
        </div>

        <div class="info-card" v-if="supportsMicrophone">
          <MicIcon class="info-icon" />
          <div class="info-content">
            <h4>音声入力デバイス</h4>
            <p class="device-name">{{ audioInputDevice || '検出中...' }}</p>
          </div>
          <div class="status-indicator" :class="inputDeviceStatus"></div>
        </div>
      </div>

      <div class="step-actions">
        <button @click="detectDevices" :disabled="isDetecting" class="action-button primary">
          <RefreshCwIcon v-if="!isDetecting" class="w-4 h-4" />
          <Loader2Icon v-else class="w-4 h-4 animate-spin" />
          デバイスを再検出
        </button>
        <button @click="nextStep" :disabled="!devicesDetected" class="action-button primary">
          次へ
        </button>
      </div>
    </div>

    <!-- Step 2: Volume Calibration -->
    <div v-if="currentStep === 2" class="test-step">
      <div class="step-header">
        <Volume2Icon class="step-icon" />
        <h3>音量校正</h3>
      </div>

      <div class="volume-test">
        <p class="instruction">
          快適に聞こえる音量に調整してください。テスト音声を再生して確認しましょう。
        </p>

        <div class="volume-control">
          <VolumeXIcon class="volume-icon" />
          <input 
            type="range" 
            v-model="volumeLevel"
            min="0" 
            max="100" 
            step="5"
            class="volume-slider"
            @input="updateVolume"
          />
          <Volume2Icon class="volume-icon" />
          <span class="volume-display">{{ volumeLevel }}%</span>
        </div>

        <div class="test-sounds">
          <button 
            v-for="test in volumeTests"
            :key="test.id"
            @click="playVolumeTest(test)"
            :disabled="isPlaying"
            class="test-sound-button"
          >
            <PlayIcon class="w-4 h-4" />
            {{ test.name }}
          </button>
        </div>

        <div class="volume-feedback">
          <div class="feedback-options">
            <button 
              v-for="option in volumeFeedback"
              :key="option.value"
              @click="selectVolumeFeedback(option.value)"
              class="feedback-button"
              :class="{ active: selectedVolumeFeedback === option.value }"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button @click="previousStep" class="action-button secondary">戻る</button>
        <button @click="nextStep" :disabled="!selectedVolumeFeedback" class="action-button primary">
          次へ
        </button>
      </div>
    </div>

    <!-- Step 3: Pronunciation Test -->
    <div v-if="currentStep === 3" class="test-step">
      <div class="step-header">
        <MicIcon class="step-icon" />
        <h3>発音認識テスト</h3>
      </div>

      <div class="pronunciation-test">
        <p class="instruction">
          以下の音素を正確に発音できるかテストします。「録音」ボタンを押してから発音してください。
        </p>

        <div class="current-phoneme">
          <div class="phoneme-display">
            <span class="phoneme-symbol">{{ currentTestPhoneme?.symbol }}</span>
            <span class="phoneme-description">{{ currentTestPhoneme?.description }}</span>
          </div>
          
          <div class="phoneme-controls">
            <button 
              @click="playTestPhoneme"
              :disabled="isPlaying"
              class="play-phoneme-button"
            >
              <Volume2Icon class="w-4 h-4" />
              お手本を聞く
            </button>
            
            <button 
              @click="toggleRecording"
              :disabled="!canRecord"
              class="record-button"
              :class="{ recording: isRecording }"
            >
              <MicIcon class="w-5 h-5" />
              {{ isRecording ? '録音停止' : '録音開始' }}
            </button>
          </div>
        </div>

        <div v-if="recognitionResults.length > 0" class="recognition-results">
          <h4>認識結果</h4>
          <div class="results-list">
            <div 
              v-for="result in recognitionResults"
              :key="result.id"
              class="result-item"
              :class="result.accuracy >= 0.8 ? 'good' : result.accuracy >= 0.6 ? 'fair' : 'poor'"
            >
              <span class="result-phoneme">{{ result.phoneme }}</span>
              <span class="result-confidence">{{ Math.round(result.accuracy * 100) }}%</span>
              <div class="result-status">
                <CheckCircleIcon v-if="result.accuracy >= 0.8" class="w-4 h-4 text-green-500" />
                <AlertCircleIcon v-else-if="result.accuracy >= 0.6" class="w-4 h-4 text-yellow-500" />
                <XCircleIcon v-else class="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        <div class="test-progress-phonemes">
          <div class="phoneme-progress">
            {{ currentPhonemeIndex + 1 }} / {{ testPhonemes.length }}
          </div>
          <div class="phoneme-navigation">
            <button 
              @click="previousPhoneme"
              :disabled="currentPhonemeIndex === 0"
              class="nav-button"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <button 
              @click="nextPhoneme"
              :disabled="currentPhonemeIndex >= testPhonemes.length - 1"
              class="nav-button"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button @click="previousStep" class="action-button secondary">戻る</button>
        <button @click="nextStep" class="action-button primary">次へ</button>
      </div>
    </div>

    <!-- Step 4: Final Configuration -->
    <div v-if="currentStep === 4" class="test-step">
      <div class="step-header">
        <SettingsIcon class="step-icon" />
        <h3>最終設定</h3>
      </div>

      <div class="final-config">
        <div class="config-summary">
          <h4>テスト結果サマリー</h4>
          
          <div class="summary-item">
            <span class="summary-label">音量レベル:</span>
            <span class="summary-value">{{ volumeLevel }}%</span>
          </div>
          
          <div class="summary-item">
            <span class="summary-label">発音認識精度:</span>
            <span class="summary-value">{{ averagePronunciationAccuracy }}%</span>
          </div>
          
          <div class="summary-item">
            <span class="summary-label">推奨設定:</span>
            <span class="summary-value">{{ recommendedSettings }}</span>
          </div>
        </div>

        <div class="advanced-settings">
          <h4>詳細設定</h4>
          
          <div class="setting-group">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="enableHapticFeedback"
                class="setting-checkbox"
              />
              触覚フィードバックを有効にする
            </label>
          </div>

          <div class="setting-group">
            <label class="setting-label">
              <input 
                type="checkbox" 
                v-model="enableVisualFeedback"
                class="setting-checkbox"
              />
              視覚フィードバックを有効にする
            </label>
          </div>

          <div class="setting-group">
            <label class="setting-label">
              自動再生速度
              <select v-model="autoPlaySpeed" class="setting-select">
                <option value="0.5">ゆっくり (0.5x)</option>
                <option value="0.75">少し遅め (0.75x)</option>
                <option value="1.0">標準 (1x)</option>
                <option value="1.25">少し速め (1.25x)</option>
                <option value="1.5">速め (1.5x)</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button @click="previousStep" class="action-button secondary">戻る</button>
        <button @click="completeCalibration" class="action-button primary">
          設定を保存して完了
        </button>
      </div>
    </div>

    <!-- Completion -->
    <div v-if="currentStep > totalSteps" class="completion-step">
      <div class="completion-content">
        <CheckCircleIcon class="completion-icon" />
        <h3>校正完了！</h3>
        <p>音声設定が完了しました。最適な学習環境でMovWISEをお楽しみください。</p>
        
        <div class="completion-actions">
          <button @click="restartCalibration" class="action-button secondary">
            再校正
          </button>
          <button @click="startLearning" class="action-button primary">
            学習を開始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  SpeakerIcon, HeadphonesIcon, MicIcon, Volume2Icon, VolumeXIcon,
  PlayIcon, RefreshCwIcon, Loader2Icon, SettingsIcon,
  CheckCircleIcon, AlertCircleIcon, XCircleIcon,
  ChevronLeftIcon, ChevronRightIcon
} from 'lucide-vue-next'
import { useGameAudio } from '@/composables/useGameAudio'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database'

// Emits
const emit = defineEmits([
  'calibration-complete',
  'calibration-cancelled'
])

// Native Audio System
const {
  playPhoneme: playNativePhoneme,
  initializeAudio: initNativeAudio
} = useGameAudio()

// State
const currentStep = ref(1)
const totalSteps = 4

// Device Detection
const audioOutputDevice = ref('')
const audioInputDevice = ref('')
const isDetecting = ref(false)
const supportsMicrophone = ref(false)
const devicesDetected = ref(false)
const outputDeviceStatus = ref('pending') // 'pending', 'success', 'error'
const inputDeviceStatus = ref('pending')

// Volume Calibration
const volumeLevel = ref(70)
const isPlaying = ref(false)
const selectedVolumeFeedback = ref('')

const volumeTests = [
  { id: 'low', name: '低音テスト', frequency: 'low' },
  { id: 'mid', name: '中音テスト', frequency: 'mid' },
  { id: 'high', name: '高音テスト', frequency: 'high' },
  { id: 'speech', name: '音声テスト', frequency: 'speech' }
]

const volumeFeedback = [
  { value: 'too_quiet', label: '小さすぎる' },
  { value: 'comfortable', label: '快適' },
  { value: 'too_loud', label: '大きすぎる' }
]

// Pronunciation Test
const currentPhonemeIndex = ref(0)
const isRecording = ref(false)
const canRecord = ref(false)
const recognitionResults = ref([])
const mediaRecorder = ref(null)
const audioStream = ref(null)

// Test phonemes (selected from database)
const testPhonemes = [
  { symbol: '/æ/', description: 'cat の a' },
  { symbol: '/ɪ/', description: 'sit の i' },
  { symbol: '/θ/', description: 'think の th' },
  { symbol: '/ð/', description: 'this の th' },
  { symbol: '/l/', description: 'light の l' },
  { symbol: '/r/', description: 'right の r' }
]

// Final Configuration
const enableHapticFeedback = ref(true)
const enableVisualFeedback = ref(true)
const autoPlaySpeed = ref(1.0)

// Computed
const currentTestPhoneme = computed(() => {
  return testPhonemes[currentPhonemeIndex.value]
})

const averagePronunciationAccuracy = computed(() => {
  if (recognitionResults.value.length === 0) return 0
  const sum = recognitionResults.value.reduce((acc, result) => acc + result.accuracy, 0)
  return Math.round((sum / recognitionResults.value.length) * 100)
})

const recommendedSettings = computed(() => {
  const accuracy = averagePronunciationAccuracy.value
  if (accuracy >= 80) return '上級者向け設定'
  if (accuracy >= 60) return '中級者向け設定'
  return '初心者向け設定'
})

// Methods
const detectDevices = async () => {
  isDetecting.value = true
  devicesDetected.value = false

  try {
    // Check for audio output
    if ('getDisplayMedia' in navigator.mediaDevices) {
      audioOutputDevice.value = 'システム音声出力'
      outputDeviceStatus.value = 'success'
    }

    // Check for microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      supportsMicrophone.value = true
      audioInputDevice.value = 'マイク'
      inputDeviceStatus.value = 'success'
      canRecord.value = true
      
      // Stop the stream immediately after testing
      stream.getTracks().forEach(track => track.stop())
    } catch (micError) {
      supportsMicrophone.value = false
      inputDeviceStatus.value = 'error'
      canRecord.value = false
    }

    devicesDetected.value = true
  } catch (error) {
    logger.warn('Device detection error:', error)
    outputDeviceStatus.value = 'error'
  } finally {
    isDetecting.value = false
  }
}

const updateVolume = () => {
  // Update audio system volume
  // This would interface with the audio system
}

const playVolumeTest = async (test) => {
  if (isPlaying.value) return

  isPlaying.value = true
  try {
    // Play test sound based on frequency
    const testWords = {
      low: 'low',
      mid: 'hello', 
      high: 'see',
      speech: 'welcome to movwise'
    }
    
    // Use speech synthesis for testing
    const utterance = new SpeechSynthesisUtterance(testWords[test.frequency])
    utterance.volume = volumeLevel.value / 100
    
    await new Promise((resolve) => {
      utterance.onend = resolve
      speechSynthesis.speak(utterance)
    })
  } catch (error) {
    logger.warn('Volume test error:', error)
  } finally {
    isPlaying.value = false
  }
}

const selectVolumeFeedback = (feedback) => {
  selectedVolumeFeedback.value = feedback
  
  // Auto-adjust volume based on feedback
  if (feedback === 'too_quiet') {
    volumeLevel.value = Math.min(100, volumeLevel.value + 20)
  } else if (feedback === 'too_loud') {
    volumeLevel.value = Math.max(0, volumeLevel.value - 20)
  }
}

const playTestPhoneme = async () => {
  if (!currentTestPhoneme.value || isPlaying.value) return

  isPlaying.value = true
  try {
    await playNativePhoneme(currentTestPhoneme.value.symbol)
  } catch (error) {
    logger.warn('Phoneme test error:', error)
  } finally {
    isPlaying.value = false
  }
}

const toggleRecording = async () => {
  if (!canRecord.value) return

  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    mediaRecorder.value = new MediaRecorder(audioStream.value)
    const chunks = []

    mediaRecorder.value.ondataavailable = (event) => {
      chunks.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' })
      analyzePronunciation(blob)
    }

    mediaRecorder.value.start()
    isRecording.value = true

    // Auto-stop after 3 seconds
    setTimeout(() => {
      if (isRecording.value) {
        stopRecording()
      }
    }, 3000)

  } catch (error) {
    logger.warn('Recording start error:', error)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop())
    }
  }
}

const analyzePronunciation = async (audioBlob) => {
  // Simulate pronunciation analysis
  // In a real implementation, this would use speech recognition API
  
  const mockAccuracy = 0.6 + Math.random() * 0.4 // Random score between 60-100%
  
  recognitionResults.value.push({
    id: Date.now(),
    phoneme: currentTestPhoneme.value.symbol,
    accuracy: mockAccuracy,
    timestamp: new Date().toISOString()
  })
}

const previousPhoneme = () => {
  if (currentPhonemeIndex.value > 0) {
    currentPhonemeIndex.value--
  }
}

const nextPhoneme = () => {
  if (currentPhonemeIndex.value < testPhonemes.length - 1) {
    currentPhonemeIndex.value++
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeCalibration = () => {
  const calibrationSettings = {
    volumeLevel: volumeLevel.value,
    volumeFeedback: selectedVolumeFeedback.value,
    pronunciationAccuracy: averagePronunciationAccuracy.value,
    enableHapticFeedback: enableHapticFeedback.value,
    enableVisualFeedback: enableVisualFeedback.value,
    autoPlaySpeed: autoPlaySpeed.value,
    deviceInfo: {
      outputDevice: audioOutputDevice.value,
      inputDevice: audioInputDevice.value,
      supportsMicrophone: supportsMicrophone.value
    },
    timestamp: new Date().toISOString()
  }

  // Save to localStorage
  localStorage.setItem('movwise-audio-calibration', JSON.stringify(calibrationSettings))
  
  currentStep.value = totalSteps + 1
  emit('calibration-complete', calibrationSettings)
}

const restartCalibration = () => {
  currentStep.value = 1
  // Reset all state
  selectedVolumeFeedback.value = ''
  recognitionResults.value = []
  currentPhonemeIndex.value = 0
}

const startLearning = () => {
  emit('calibration-complete', {})
}

// Lifecycle
onMounted(async () => {
  // Initialize audio system
  try {
    await initNativeAudio()
  } catch (error) {
    logger.warn('Audio initialization error:', error)
  }

  // Auto-detect devices on mount
  detectDevices()
})

onUnmounted(() => {
  // Cleanup any ongoing recordings
  if (isRecording.value) {
    stopRecording()
  }
})
</script>

<style scoped>
.audio-test-calibration {
  @apply max-w-4xl mx-auto p-6 space-y-6;
}

.calibration-header {
  @apply text-center space-y-2;
}

.title {
  @apply text-3xl font-bold text-gray-800;
}

.subtitle {
  @apply text-gray-600;
}

.test-progress {
  @apply flex items-center gap-4;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-blue-500 transition-all duration-300;
}

.progress-text {
  @apply text-sm text-gray-600;
}

.test-step {
  @apply bg-white rounded-xl shadow-lg p-6 space-y-6;
}

.step-header {
  @apply flex items-center gap-3;
}

.step-icon {
  @apply w-6 h-6 text-blue-500;
}

.step-header h3 {
  @apply text-xl font-semibold text-gray-800;
}

.device-info {
  @apply space-y-4;
}

.info-card {
  @apply flex items-center gap-4 p-4 bg-gray-50 rounded-lg;
}

.info-icon {
  @apply w-8 h-8 text-gray-500;
}

.info-content {
  @apply flex-1;
}

.info-content h4 {
  @apply font-semibold text-gray-800;
}

.device-name {
  @apply text-sm text-gray-600;
}

.status-indicator {
  @apply w-3 h-3 rounded-full;
}

.status-indicator.pending { @apply bg-yellow-400; }
.status-indicator.success { @apply bg-green-400; }
.status-indicator.error { @apply bg-red-400; }

.volume-test {
  @apply space-y-6;
}

.instruction {
  @apply text-gray-700 leading-relaxed;
}

.volume-control {
  @apply flex items-center gap-4;
}

.volume-icon {
  @apply w-5 h-5 text-gray-500;
}

.volume-slider {
  @apply flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

.volume-slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-blue-500 rounded-full cursor-pointer;
}

.volume-display {
  @apply text-sm font-medium text-gray-700 min-w-12;
}

.test-sounds {
  @apply flex flex-wrap gap-3;
}

.test-sound-button {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors;
}

.test-sound-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.volume-feedback {
  @apply space-y-3;
}

.feedback-options {
  @apply flex gap-3;
}

.feedback-button {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.feedback-button.active {
  @apply bg-blue-500 text-white border-blue-500;
}

.pronunciation-test {
  @apply space-y-6;
}

.current-phoneme {
  @apply text-center space-y-4;
}

.phoneme-display {
  @apply space-y-2;
}

.phoneme-symbol {
  @apply block text-4xl font-mono text-blue-600;
}

.phoneme-description {
  @apply text-gray-600;
}

.phoneme-controls {
  @apply flex justify-center gap-4;
}

.play-phoneme-button,
.record-button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.play-phoneme-button {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.record-button {
  @apply bg-red-500 hover:bg-red-600 text-white;
}

.record-button.recording {
  @apply bg-red-600 animate-pulse;
}

.recognition-results {
  @apply space-y-3;
}

.recognition-results h4 {
  @apply font-semibold text-gray-800;
}

.results-list {
  @apply space-y-2;
}

.result-item {
  @apply flex items-center justify-between p-3 rounded-lg;
}

.result-item.good { @apply bg-green-50 border border-green-200; }
.result-item.fair { @apply bg-yellow-50 border border-yellow-200; }
.result-item.poor { @apply bg-red-50 border border-red-200; }

.test-progress-phonemes {
  @apply flex items-center justify-between;
}

.phoneme-navigation {
  @apply flex gap-2;
}

.nav-button {
  @apply p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors;
}

.nav-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.final-config {
  @apply space-y-6;
}

.config-summary {
  @apply space-y-3;
}

.config-summary h4 {
  @apply font-semibold text-gray-800;
}

.summary-item {
  @apply flex justify-between py-2 border-b border-gray-100;
}

.summary-label {
  @apply text-gray-600;
}

.summary-value {
  @apply font-medium text-gray-800;
}

.advanced-settings {
  @apply space-y-4;
}

.advanced-settings h4 {
  @apply font-semibold text-gray-800;
}

.setting-group {
  @apply space-y-2;
}

.setting-label {
  @apply flex items-center gap-2 text-gray-700;
}

.setting-checkbox {
  @apply rounded;
}

.setting-select {
  @apply ml-2 px-3 py-1 border border-gray-300 rounded;
}

.step-actions {
  @apply flex justify-between;
}

.action-button {
  @apply flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200;
}

.action-button.primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.action-button.secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700;
}

.action-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.completion-step {
  @apply text-center space-y-6;
}

.completion-content {
  @apply bg-white rounded-xl shadow-lg p-8 space-y-6;
}

.completion-icon {
  @apply w-16 h-16 text-green-500 mx-auto;
}

.completion-content h3 {
  @apply text-2xl font-bold text-gray-800;
}

.completion-content p {
  @apply text-gray-600 leading-relaxed;
}

.completion-actions {
  @apply flex justify-center gap-4;
}
</style>