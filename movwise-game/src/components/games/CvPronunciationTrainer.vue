<template>
  <div class="min-h-screen phonics-trainer-bg">
    <!-- Animated background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="floating-phonemes">
        <div v-for="n in 20" :key="n" class="floating-letter" :style="getFloatingStyle(n)">
          {{ getRandomPhoneme() }}
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="relative z-10 p-4">
      <div class="flex justify-between items-center">
        <button @click="$emit('back')" class="galaxy-button galaxy-button-secondary">
          <Icon name="arrow-left" class="w-4 h-4 mr-2" />
          戻る
        </button>
        <h1 class="text-2xl font-bold cosmic-text">🗣️ CV発音トレーナー</h1>
        <div class="flex items-center gap-2">
          <button @click="toggleInstructorMode" 
                  :class="['galaxy-button', instructorMode ? 'galaxy-button-primary' : 'galaxy-button-secondary']">
            👨‍🏫 講師モード
          </button>
        </div>
      </div>
    </div>

    <!-- Game Setup Screen -->
    <div v-if="gameState === 'setup'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎯</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">CV音素発音練習</h2>
          <p class="text-gray-300">子音＋母音の組み合わせを正確に発音しましょう</p>
        </div>

        <!-- 難易度選択 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 cosmic-text">難易度選択</h3>
          <div class="grid grid-cols-3 gap-2">
            <button 
              v-for="level in difficultyLevels" 
              :key="level.id"
              @click="selectedDifficulty = level.id"
              :class="['difficulty-card', selectedDifficulty === level.id ? 'selected' : '']"
            >
              <div class="text-2xl mb-1">{{ level.icon }}</div>
              <div class="text-sm font-semibold">{{ level.name }}</div>
              <div class="text-xs text-gray-400">{{ level.description }}</div>
            </button>
          </div>
        </div>

        <!-- モード選択 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 cosmic-text">練習モード</h3>
          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="practiceMode = 'listen'"
              :class="['mode-card', practiceMode === 'listen' ? 'selected' : '']"
            >
              <div class="text-2xl mb-1">👂</div>
              <div class="text-sm">聞いて発音</div>
            </button>
            <button 
              @click="practiceMode = 'read'"
              :class="['mode-card', practiceMode === 'read' ? 'selected' : '']"
            >
              <div class="text-2xl mb-1">👁️</div>
              <div class="text-sm">見て発音</div>
            </button>
          </div>
        </div>

        <button @click="startGame" class="galaxy-button galaxy-button-primary w-full py-3">
          <span class="text-lg">🚀 練習開始</span>
        </button>
      </div>
    </div>

    <!-- Game Play Screen -->
    <div v-if="gameState === 'playing'" class="relative z-10 p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm cosmic-text">進捗: {{ currentRound }}/{{ totalRounds }}</span>
            <span class="text-sm cosmic-text">スコア: {{ score }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentRound / totalRounds) * 100 + '%' }"></div>
          </div>
        </div>

        <!-- Main Practice Area -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- CV Display -->
          <div class="galaxy-card">
            <div class="text-center">
              <h3 class="text-lg font-semibold cosmic-text mb-4">
                {{ practiceMode === 'listen' ? '聞いた音を発音してください' : '表示された音を発音してください' }}
              </h3>
              
              <!-- CV Combination Display -->
              <div class="cv-display" v-if="currentCv">
                <div v-if="practiceMode === 'read'" class="phoneme-visual">
                  <div class="consonant-display">{{ currentCv.consonant }}</div>
                  <div class="plus-sign">+</div>
                  <div class="vowel-display">{{ currentCv.vowel }}</div>
                  <div class="equals-sign">=</div>
                  <div class="cv-result">{{ currentCv.combination }}</div>
                </div>
                
                <!-- Audio Controls -->
                <div class="audio-controls mt-6">
                  <button @click="playCurrentSound" class="galaxy-button galaxy-button-primary">
                    <Icon name="volume" class="w-5 h-5 mr-2" />
                    {{ practiceMode === 'listen' ? '音を聞く' : '正しい発音を聞く' }}
                  </button>
                  <button @click="playSlowSound" class="galaxy-button galaxy-button-secondary ml-2">
                    <Icon name="volume" class="w-4 h-4 mr-2" />
                    ゆっくり
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recording/Feedback Area -->
          <div class="galaxy-card">
            <div class="text-center">
              <h3 class="text-lg font-semibold cosmic-text mb-4">あなたの発音</h3>
              
              <!-- Voice Recorder -->
              <div class="recording-area">
                <div class="audio-visualizer" v-if="isRecording">
                  <div class="visualizer-bar" v-for="n in 10" :key="n" 
                       :style="{ height: getVisualizerHeight(n) + 'px' }"></div>
                </div>
                
                <div class="recording-controls mt-4">
                  <button 
                    @click="toggleRecording" 
                    :class="['record-button', isRecording ? 'recording' : '']"
                    :disabled="isProcessing"
                  >
                    <div class="record-icon">
                      {{ isRecording ? '⏹️' : '🎤' }}
                    </div>
                    <div class="record-text">
                      {{ isRecording ? '録音停止' : '録音開始' }}
                    </div>
                  </button>
                </div>
              </div>

              <!-- Feedback Display -->
              <div v-if="pronunciationFeedback" class="feedback-area mt-6">
                <div :class="['feedback-score', getFeedbackClass()]">
                  <div class="score-icon">{{ getFeedbackIcon() }}</div>
                  <div class="score-text">{{ pronunciationFeedback.score }}%</div>
                </div>
                <div class="feedback-message mt-2">
                  {{ pronunciationFeedback.feedback || getFeedbackMessage() }}
                </div>
                
                <!-- 詳細分析結果 -->
                <div v-if="pronunciationFeedback.recognized" class="analysis-details mt-4">
                  <div class="text-sm text-gray-400 mb-2">分析詳細:</div>
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="analysis-item">
                      <span class="text-gray-400">認識結果:</span>
                      <span class="ml-2 text-white">{{ pronunciationFeedback.recognized }}</span>
                    </div>
                    <div class="analysis-item">
                      <span class="text-gray-400">信頼度:</span>
                      <span class="ml-2 text-blue-400">{{ Math.round(pronunciationFeedback.confidence * 100) }}%</span>
                    </div>
                    <div class="analysis-item">
                      <span class="text-gray-400">正確性:</span>
                      <span class="ml-2 text-green-400">{{ Math.round(pronunciationFeedback.accuracy * 100) }}%</span>
                    </div>
                    <div class="analysis-item">
                      <span class="text-gray-400">明瞭性:</span>
                      <span class="ml-2 text-yellow-400">{{ Math.round(pronunciationFeedback.clarity * 100) }}%</span>
                    </div>
                  </div>
                </div>
                
                <!-- Instructor Mode Feedback -->
                <div v-if="instructorMode" class="instructor-feedback mt-4">
                  <textarea 
                    v-model="instructorNotes" 
                    placeholder="講師からのコメント..."
                    class="instructor-textarea"
                  ></textarea>
                  <button @click="saveInstructorFeedback" class="galaxy-button galaxy-button-secondary mt-2">
                    フィードバック保存
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons mt-6">
                <button @click="nextRound" class="galaxy-button galaxy-button-primary">
                  次へ進む
                </button>
                <button @click="repeatRound" class="galaxy-button galaxy-button-secondary ml-2">
                  もう一度
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-if="gameState === 'results'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ getResultsIcon() }}</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">練習完了！</h2>
          <p class="text-gray-300">お疲れさまでした</p>
        </div>

        <!-- Results Summary -->
        <div class="results-summary mb-6">
          <div class="stat-item">
            <div class="stat-value">{{ averageScore }}%</div>
            <div class="stat-label">平均発音精度</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ correctPronunciations }}/{{ totalRounds }}</div>
            <div class="stat-label">正確な発音</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ Math.round(practiceTime / 60) }}分</div>
            <div class="stat-label">練習時間</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button @click="restartGame" class="galaxy-button galaxy-button-primary">
            もう一度
          </button>
          <button @click="$emit('back')" class="galaxy-button galaxy-button-secondary">
            終了
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isProcessing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="galaxy-card text-center">
        <div class="animate-spin text-4xl mb-4">🔄</div>
        <div class="cosmic-text">発音を分析中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useGameAudio } from '@/composables/useGameAudio'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import Icon from '@/components/shared/Icon.vue'
import PhonemeDetector from '@/components/cooperative/PhonemeDetector.vue'

// Emits
const emit = defineEmits(['back'])

// Audio system
const { 
  playSound, 
  playPhoneme,
  startRecording, 
  stopRecording, 
  analyzeAudio,
  playVisualFeedback,
  isRecording: audioIsRecording,
  isAnalyzing,
  supportedFeatures
} = useGameAudio()

// Game state
const gameState = ref('setup') // 'setup', 'playing', 'results'
const selectedDifficulty = ref('beginner')
const practiceMode = ref('listen') // 'listen' or 'read'
const instructorMode = ref(false)

// Game progress
const currentRound = ref(1)
const totalRounds = ref(10)
const score = ref(0)
const pronunciationHistory = ref([])
const startTime = ref(0)

// Current practice data
const currentCv = ref(null)
const pronunciationFeedback = ref(null)
const instructorNotes = ref('')

// Audio visualizer
const visualizerData = ref(Array(10).fill(0))

// Difficulty levels (public/soundsのファイルに基づいて更新)
const difficultyLevels = [
  {
    id: 'beginner',
    name: '初級',
    icon: '🌱',
    description: '基本のCV音素',
    consonants: ['b', 'p', 't', 'd', 'k', 'g', 'm', 'n', 'f', 's'],
    vowels: ['a', 'e', 'i', 'o', 'u']
  },
  {
    id: 'intermediate', 
    name: '中級',
    icon: '🌿',
    description: '複雑なCV音素',
    consonants: ['l', 'r', 'w', 'y', 'v', 'z', 'h', 'j'],
    vowels: ['a', 'e', 'i', 'o', 'u'] // バリエーション付きで後で処理
  },
  {
    id: 'advanced',
    name: '上級',
    icon: '🌳', 
    description: '高難度CV音素',
    consonants: ['ch', 'sh', 'th', 'qu', 'x'],
    vowels: ['a', 'e', 'i', 'o', 'u'] // 複雑な母音変化
  }
]

// Computed properties
const averageScore = computed(() => {
  if (pronunciationHistory.value.length === 0) return 0
  const total = pronunciationHistory.value.reduce((sum, record) => sum + record.score, 0)
  return Math.round(total / pronunciationHistory.value.length)
})

const correctPronunciations = computed(() => {
  return pronunciationHistory.value.filter(record => record.score >= 80).length
})

const practiceTime = computed(() => {
  return startTime.value ? Math.floor((Date.now() - startTime.value) / 1000) : 0
})

// Methods
const toggleInstructorMode = () => {
  instructorMode.value = !instructorMode.value
}

const startGame = () => {
  gameState.value = 'playing'
  currentRound.value = 1
  score.value = 0
  pronunciationHistory.value = []
  startTime.value = Date.now()
  generateNewCv()
}

const generateNewCv = () => {
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  
  // 利用可能なCV組み合わせから選択
  const availableCombinations = phonemeAudioService.getAvailableCVCombinations()
  const validCombinations = availableCombinations.filter(combo => {
    return difficulty.consonants.includes(combo.consonant) && 
           difficulty.vowels.includes(combo.vowel) &&
           combo.hasAudio
  })
  
  if (validCombinations.length === 0) {
    console.warn('No valid CV combinations found for difficulty:', selectedDifficulty.value)
    // フォールバック: 基本的な組み合わせ
    const consonant = difficulty.consonants[0] || 'b'
    const vowel = difficulty.vowels[0] || 'a'
    currentCv.value = {
      consonant,
      vowel,
      combination: consonant + vowel
    }
  } else {
    const selectedCombination = validCombinations[Math.floor(Math.random() * validCombinations.length)]
    currentCv.value = {
      consonant: selectedCombination.consonant,
      vowel: selectedCombination.vowel,
      combination: selectedCombination.combination
    }
  }
  
  console.log('🎯 Generated CV combination:', currentCv.value)
  pronunciationFeedback.value = null
  instructorNotes.value = ''
}

// 音声再生関数を追加
const speak = async (text, options = {}) => {
  try {
    console.log('🗣️ Speaking text:', text, 'with options:', options)
    
    // playPhonemeを直接使用（音素ファイル再生）
    await playPhoneme(text)
    
    console.log('✅ Speak completed successfully')
  } catch (error) {
    console.error('❌ Speak error:', error)
    // フォールバック: 視覚的フィードバックのみ
    playVisualFeedback('button')
  }
}

const playCurrentSound = async () => {
  if (currentCv.value) {
    await speak(currentCv.value.combination, { rate: 1.0 })
  }
}

const playSlowSound = async () => {
  if (currentCv.value) {
    await speak(currentCv.value.combination, { rate: 0.6 })
  }
}

const toggleRecording = async () => {
  if (audioIsRecording.value) {
    await stopRecording()
    await analyzePronunciation()
  } else {
    await startRecording()
  }
}

// isRecordingをaudioIsRecordingと同期
const isRecording = computed(() => audioIsRecording.value)
// isProcessingをisAnalyzingと同期
const isProcessing = computed(() => isAnalyzing.value)

const analyzePronunciation = async () => {
  
  try {
    console.log('🔍 分析開始:', currentCv.value.combination)
    
    // 実際の音声認識と発音分析を実行
    const analysis = await analyzeAudio(currentCv.value.combination, {
      type: 'cv-combination',
      difficulty: selectedDifficulty.value,
      expectedPhonemes: [currentCv.value.consonant, currentCv.value.vowel]
    })
    
    console.log('📊 分析結果:', analysis)
    
    pronunciationFeedback.value = {
      score: Math.round(analysis.score),
      accuracy: analysis.accuracy,
      clarity: analysis.clarity,
      timing: analysis.timing,
      recognized: analysis.recognized,
      confidence: analysis.confidence,
      feedback: analysis.feedback
    }
    
    // 履歴に追加
    pronunciationHistory.value.push({
      cv: currentCv.value.combination,
      score: pronunciationFeedback.value.score,
      recognized: analysis.recognized,
      confidence: analysis.confidence,
      timestamp: Date.now()
    })
    
    console.log('✅ 分析完了 - スコア:', pronunciationFeedback.value.score)
    
  } catch (error) {
    console.error('発音分析エラー:', error)
    
    // エラー時のフォールバック
    pronunciationFeedback.value = {
      score: 70,
      accuracy: 0.7,
      clarity: 0.7,
      timing: 0.7,
      recognized: 'error',
      confidence: 0.5,
      feedback: '分析中にエラーが発生しました。もう一度お試しください。'
    }
  }
}

const nextRound = () => {
  if (currentRound.value >= totalRounds.value) {
    gameState.value = 'results'
  } else {
    currentRound.value++
    generateNewCv()
  }
}

const repeatRound = () => {
  pronunciationFeedback.value = null
  instructorNotes.value = ''
}

const restartGame = () => {
  gameState.value = 'setup'
}

const saveInstructorFeedback = () => {
  // 講師フィードバックを保存
  console.log('講師フィードバック保存:', instructorNotes.value)
}

const getFeedbackClass = () => {
  const score = pronunciationFeedback.value?.score || 0
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  return 'needs-improvement'
}

const getFeedbackIcon = () => {
  const score = pronunciationFeedback.value?.score || 0
  if (score >= 90) return '🌟'
  if (score >= 80) return '👍'
  if (score >= 70) return '👌'
  return '💪'
}

const getFeedbackMessage = () => {
  const score = pronunciationFeedback.value?.score || 0
  if (score >= 90) return '素晴らしい発音です！'
  if (score >= 80) return 'とても良い発音です！'
  if (score >= 70) return '良い発音です。もう少し練習しましょう。'
  return '発音を改善しましょう。もう一度挑戦！'
}

const getResultsIcon = () => {
  if (averageScore.value >= 90) return '🏆'
  if (averageScore.value >= 80) return '🎉'
  if (averageScore.value >= 70) return '👏'
  return '💪'
}

const getVisualizerHeight = (index) => {
  return isRecording.value ? Math.random() * 40 + 10 : 5
}

const getFloatingStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${10 + Math.random() * 10}s`
  }
}

const getRandomPhoneme = () => {
  const phonemes = ['b', 'p', 't', 'd', 'k', 'g', 'a', 'i', 'u', 'e', 'o']
  return phonemes[Math.floor(Math.random() * phonemes.length)]
}

// Animation loop for visualizer
let animationFrame = null
const updateVisualizer = () => {
  if (isRecording.value) {
    visualizerData.value = visualizerData.value.map(() => Math.random())
  }
  animationFrame = requestAnimationFrame(updateVisualizer)
}

onMounted(() => {
  updateVisualizer()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.phonics-trainer-bg {
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%);
  color: white;
}

.stars-layer-1,
.stars-layer-2 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 2s;
  opacity: 0.2;
}

.floating-phonemes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.floating-letter {
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  color: rgba(59, 130, 246, 0.3);
  animation: float-around 15s infinite linear;
  pointer-events: none;
}

@keyframes float-around {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.galaxy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(79, 172, 254, 0.6);
}

.cosmic-text {
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6, #FBBF24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-flow 4s ease-in-out infinite;
}

@keyframes cosmic-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.difficulty-card, .mode-card {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.difficulty-card:hover, .mode-card:hover {
  border-color: rgba(79, 172, 254, 0.6);
  transform: translateY(-2px);
}

.difficulty-card.selected, .mode-card.selected {
  border-color: #60A5FA;
  background: rgba(96, 165, 250, 0.2);
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6);
  transition: width 0.5s ease;
}

.cv-display {
  margin: 2rem 0;
}

.phoneme-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.consonant-display, .vowel-display, .cv-result {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  font-size: 2rem;
  font-weight: bold;
  min-width: 4rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cv-result {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
}

.plus-sign, .equals-sign {
  font-size: 1.5rem;
  font-weight: bold;
  color: #60A5FA;
}

.audio-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.recording-area {
  padding: 1.5rem;
}

.audio-visualizer {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 0.25rem;
  height: 60px;
  margin: 1rem 0;
}

.visualizer-bar {
  width: 4px;
  background: linear-gradient(to top, #60A5FA, #A78BFA);
  border-radius: 2px;
  transition: height 0.1s ease;
  animation: visualizer-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes visualizer-pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.record-button {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.record-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.record-button.recording {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  animation: recording-pulse 1s ease-in-out infinite;
}

@keyframes recording-pulse {
  0% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6); }
  100% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
}

.record-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.record-text {
  font-size: 0.75rem;
  font-weight: bold;
}

.feedback-area {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.feedback-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.score-icon {
  font-size: 2rem;
}

.score-text {
  font-size: 2rem;
  font-weight: bold;
}

.feedback-score.excellent .score-text { color: #10b981; }
.feedback-score.good .score-text { color: #60A5FA; }
.feedback-score.fair .score-text { color: #FBBF24; }
.feedback-score.needs-improvement .score-text { color: #ef4444; }

.feedback-message {
  font-size: 1rem;
  color: #94A3B8;
  text-align: center;
}

.instructor-feedback {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
}

.instructor-textarea {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  resize: vertical;
  min-height: 80px;
}

.instructor-textarea:focus {
  outline: none;
  border-color: #60A5FA;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
}

.analysis-details {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.analysis-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  border-radius: 0.25rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.results-summary {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.stat-item {
  margin: 1rem 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #60A5FA;
}

.stat-label {
  font-size: 0.875rem;
  color: #94A3B8;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .phoneme-visual {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .consonant-display, .vowel-display, .cv-result {
    font-size: 1.5rem;
    padding: 1rem;
    min-width: 3rem;
  }
  
  .audio-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>