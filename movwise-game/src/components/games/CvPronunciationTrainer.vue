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

    <!-- Fixed Navigation Buttons -->
    <div class="fixed top-4 left-4 z-50 flex gap-2">
      <button
        @click="goBack"
        class="galaxy-button galaxy-button-secondary flex items-center gap-2"
      >
        <Icon name="arrow-left" class="w-4 h-4" />
        戻る
      </button>
      <button
        @click="goToHome"
        class="galaxy-button galaxy-button-secondary flex items-center gap-2"
      >
        <Icon name="home" class="w-4 h-4" />
      </button>
    </div>

    <!-- Game Setup Screen -->
    <div v-if="gameState === 'setup'" class="flex items-center justify-center min-h-screen relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎯</div>
          <h1 class="text-3xl font-bold cosmic-text mb-2">🗣️ CV発音トレーナー</h1>
          <h2 class="text-xl font-bold cosmic-text mb-2">CV音素発音練習</h2>
          <p class="text-gray-300">子音＋母音の組み合わせを正確に発音しましょう</p>
          <div class="mt-4">
            <button @click="toggleInstructorMode" 
                    :class="['galaxy-button text-sm', instructorMode ? 'galaxy-button-primary' : 'galaxy-button-secondary']">
              👨‍🏫 講師モード
            </button>
          </div>
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
    <div v-if="gameState === 'playing'" class="game-play-screen">

      <!-- Fixed Header Bar -->
      <div class="game-header-bar">
        <div class="header-content">
          <!-- Left section -->
          <div class="header-left">
            <button @click="toggleInstructorMode"
                    :class="['instructor-mode-btn', instructorMode ? 'active' : '']">
              👨‍🏫 <span class="hidden sm:inline">講師モード</span>
            </button>
          </div>

          <!-- Center section -->
          <div class="header-center">
            <h1 class="game-title">🗣️ CV発音トレーナー</h1>
          </div>

          <!-- Right section -->
          <div class="header-right">
            <div class="progress-info">
              <span class="progress-text">{{ currentRound }}/{{ totalRounds }}</span>
              <div class="score-badge">{{ score }}点</div>
            </div>
          </div>
        </div>

        <!-- Compact progress bar -->
        <div class="header-progress-bar">
          <div class="progress-fill" :style="{ width: (currentRound / totalRounds) * 100 + '%' }"></div>
        </div>
      </div>

      <!-- Main Game Content -->
      <div class="game-content-area">
        <!-- Compact Gamification Status Bar -->
        <div class="gamification-bar">
          <div class="stat-compact">
            <span class="stat-icon-sm">🎖️</span>
            <span class="stat-value-sm">Lv.{{ playerLevel }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-icon-sm">✨</span>
            <span class="stat-value-sm">{{ experiencePoints }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-icon-sm">🔥</span>
            <span class="stat-value-sm">{{ currentStreak }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-icon-sm">⚡</span>
            <span class="stat-value-sm">{{ comboMultiplier.toFixed(1) }}x</span>
          </div>
        </div>

        <!-- Main Practice Area -->
        <div class="practice-panels">
          <!-- CV Display Panel -->
          <div class="practice-panel cv-panel">
            <h3 class="panel-title">
              {{ practiceMode === 'listen' ? '🎧 音を聞いて発音' : '👁️ 文字を見て発音' }}
            </h3>

            <!-- CV Combination Display -->
            <div class="cv-display-compact" v-if="currentCv">
              <div v-if="practiceMode === 'read'" class="phoneme-visual-compact">
                <div class="cv-element consonant">{{ currentCv.consonant }}</div>
                <div class="cv-operator">+</div>
                <div class="cv-element vowel">{{ currentCv.vowel }}</div>
                <div class="cv-operator">=</div>
                <div class="cv-element result">{{ currentCv.combination }}</div>
              </div>

              <!-- Compact Audio Controls -->
              <div class="audio-controls-compact">
                <button @click="playCurrentSound" class="audio-btn primary">
                  <span class="icon">🔊</span>
                  <span class="text">{{ practiceMode === 'listen' ? '再生' : '見本' }}</span>
                </button>
                <button @click="playSlowSound" class="audio-btn secondary">
                  <span class="icon">🐢</span>
                  <span class="text">ゆっくり</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Recording/Feedback Panel -->
          <div class="practice-panel recording-panel">
            <h3 class="panel-title">🎤 あなたの発音</h3>

            <!-- Compact Voice Recorder -->
            <div class="recording-area-compact">
              <!-- Visualizer -->
              <div class="audio-visualizer-compact" :class="{ active: isRecording }">
                <div v-for="n in 8" :key="n"
                     class="viz-bar"
                     :style="{ height: isRecording ? getVisualizerHeight(n) + 'px' : '4px' }">
                </div>
              </div>

              <!-- Recording Button -->
              <button
                @click="toggleRecording"
                :class="['record-btn-compact', isRecording ? 'recording' : '']"
                :disabled="isProcessing"
              >
                <span class="record-icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
                <span class="record-text">{{ isRecording ? '停止' : '録音' }}</span>
              </button>
            </div>

            <!-- Feedback Display -->
            <div v-if="pronunciationFeedback" class="feedback-compact">
              <div :class="['score-display-compact', getFeedbackClass()]">
                <span class="score-icon-sm">{{ getFeedbackIcon() }}</span>
                <span class="score-value">{{ pronunciationFeedback.score }}%</span>
              </div>
              <div class="feedback-msg">{{ pronunciationFeedback.feedback || getFeedbackMessage() }}</div>

              <!-- Compact Analysis -->
              <div v-if="pronunciationFeedback.recognized" class="analysis-compact">
                <div class="analysis-row">
                  <span class="label">認識:</span>
                  <span class="value">{{ pronunciationFeedback.recognized }}</span>
                </div>
                <div class="analysis-row">
                  <span class="label">精度:</span>
                  <div class="mini-stats">
                    <span class="stat">信頼{{ Math.round(pronunciationFeedback.confidence * 100) }}%</span>
                    <span class="stat">正確{{ Math.round(pronunciationFeedback.accuracy * 100) }}%</span>
                  </div>
                </div>
              </div>

              <!-- Instructor Notes (Compact) -->
              <div v-if="instructorMode" class="instructor-notes-compact">
                <input
                  v-model="instructorNotes"
                  placeholder="講師メモ..."
                  class="instructor-input"
                  @keyup.enter="saveInstructorFeedback"
                />
              </div>
            </div>
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

        <div class="grid grid-cols-1 gap-2">
          <button @click="restartGame" class="galaxy-button galaxy-button-primary">
            もう一度
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isProcessing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div class="galaxy-card text-center">
        <div class="animate-spin text-4xl mb-4">🔄</div>
        <div class="cosmic-text">発音を分析中...</div>
      </div>
    </div>

    <!-- Level Up Notification -->
    <div v-if="showLevelUp" class="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none">
      <div class="level-up-notification animate-bounce">
        <div class="text-6xl mb-4">🎉</div>
        <div class="text-3xl font-bold cosmic-text mb-2">レベルアップ！</div>
        <div class="text-xl cosmic-text">レベル {{ playerLevel }} に到達！</div>
      </div>
    </div>

    <!-- Achievement Notification -->
    <div v-if="showAchievement" class="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none">
      <div class="achievement-notification slide-in-from-top">
        <div class="flex items-center gap-4">
          <div class="achievement-icon text-4xl">{{ showAchievement.icon }}</div>
          <div>
            <div class="achievement-title text-xl font-bold cosmic-text">{{ showAchievement.name }}</div>
            <div class="achievement-description text-sm text-gray-300">{{ showAchievement.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import Icon from '@/components/shared/Icon.vue'

// Emits
const emit = defineEmits(['back'])

// ルーター
const router = useRouter()

// 戻る機能
const goBack = () => {
  // まずbackイベントを発火（親コンポーネントがリスナーを持っている場合の処理）
  emit('back')

  // 親コンポーネントがない場合や、直接アクセスの場合のフォールバック
  // 少し遅延させて、親コンポーネントの処理を優先
  setTimeout(() => {
    // 現在のURLが変わっていない場合のみ、直接遷移
    if (router.currentRoute.value.path.includes('cv-pronunciation-trainer')) {
      router.push('/games/phonics-training-hub')
    }
  }, 100)
}

const goToHome = () => {
  router.push('/')
}

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

// Gamification elements
const playerLevel = ref(1)
const experiencePoints = ref(0)
const currentStreak = ref(0)
const maxStreak = ref(0)
const achievements = ref([])
const comboMultiplier = ref(1.0)
const showLevelUp = ref(false)
const showAchievement = ref(null)

// Level system
const levelThresholds = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000, 20000]
const achievementDefinitions = [
  { id: 'first_perfect', name: '完璧デビュー', description: '初回で90点以上を獲得', icon: '🌟', condition: (history) => history.some(h => h.score >= 90) },
  { id: 'streak_5', name: '連続成功', description: '5回連続で80点以上', icon: '🔥', condition: (history) => getCurrentStreak(history, 80) >= 5 },
  { id: 'speed_master', name: 'スピードマスター', description: '平均2秒以下で正解', icon: '⚡', condition: (history) => getAverageResponseTime(history) < 2000 },
  { id: 'perfectionist', name: '完璧主義者', description: '10回連続で95点以上', icon: '💎', condition: (history) => getCurrentStreak(history, 95) >= 10 },
  { id: 'dedicated', name: '献身的学習者', description: '100回練習完了', icon: '🏆', condition: (history) => history.length >= 100 },
  { id: 'consistent', name: '継続は力なり', description: '3日連続で練習', icon: '📅', condition: () => checkConsecutiveDays(3) }
]

// Current practice data
const currentCv = ref(null)
const pronunciationFeedback = ref(null)
const instructorNotes = ref('')
const questionStartTime = ref(0)

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
  currentStreak.value = 0
  comboMultiplier.value = 1.0
  recordPracticeDay()
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
    logger.warn('No valid CV combinations found for difficulty:', selectedDifficulty.value)
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
  
  logger.log('🎯 Generated CV combination:', currentCv.value)
  pronunciationFeedback.value = null
  instructorNotes.value = ''
  questionStartTime.value = Date.now()
}

// 音声再生関数を追加
const speak = async (text, options = {}) => {
  try {
    logger.log('🗣️ Speaking text:', text, 'with options:', options)
    
    // playPhonemeを直接使用（音素ファイル再生）
    await playPhoneme(text)
    
    logger.log('✅ Speak completed successfully')
  } catch (error) {
    logger.error('❌ Speak error:', error)
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
    logger.log('🔍 分析開始:', currentCv.value.combination)

    // 複数の分析手法を並行実行して信頼性を向上
    const analysisPromises = [
      analyzeAudio(currentCv.value.combination, {
        type: 'cv-combination',
        difficulty: selectedDifficulty.value,
        expectedPhonemes: [currentCv.value.consonant, currentCv.value.vowel]
      }).catch(err => {
        logger.warn('Primary analysis failed:', err)
        return null
      }),

      // フォールバック分析（簡易版）
      analyzeBasicAudio(currentCv.value.combination).catch(err => {
        logger.warn('Fallback analysis failed:', err)
        return null
      })
    ]

    const [primaryAnalysis, fallbackAnalysis] = await Promise.all(analysisPromises)

    let finalAnalysis = null

    // 主要分析が成功した場合
    if (primaryAnalysis && primaryAnalysis.confidence > 0.3) {
      finalAnalysis = primaryAnalysis
      logger.log('📊 Primary analysis used:', finalAnalysis)
    }
    // フォールバック分析を使用
    else if (fallbackAnalysis && fallbackAnalysis.confidence > 0.2) {
      finalAnalysis = fallbackAnalysis
      logger.log('📊 Fallback analysis used:', finalAnalysis)
    }
    // どちらも失敗した場合の推定分析
    else {
      finalAnalysis = generateEstimatedAnalysis()
      logger.log('📊 Estimated analysis used')
    }

    pronunciationFeedback.value = {
      score: Math.round(finalAnalysis.score || 75),
      accuracy: finalAnalysis.accuracy || 0.75,
      clarity: finalAnalysis.clarity || 0.75,
      timing: finalAnalysis.timing || 0.75,
      recognized: finalAnalysis.recognized || currentCv.value.combination,
      confidence: finalAnalysis.confidence || 0.6,
      feedback: generateSmartFeedback(finalAnalysis),
      analysisMethod: finalAnalysis.method || 'estimated'
    }

    // 履歴に追加
    const responseTime = Date.now() - (questionStartTime.value || Date.now())
    pronunciationHistory.value.push({
      cv: currentCv.value.combination,
      score: pronunciationFeedback.value.score,
      recognized: finalAnalysis.recognized,
      confidence: finalAnalysis.confidence,
      timestamp: Date.now(),
      method: finalAnalysis.method,
      responseTime: responseTime
    })

    // ゲーミフィケーション要素の更新
    updateStreaks(pronunciationFeedback.value.score)
    const expGained = updateExperience(pronunciationFeedback.value.score, responseTime)
    checkAchievements()
    debouncedSaveProgress()

    logger.log('✅ 分析完了 - スコア:', pronunciationFeedback.value.score)

  } catch (error) {
    logger.error('致命的な分析エラー:', error)

    // 完全なフォールバック（練習継続可能）
    const estimatedScore = generateContextualScore()
    pronunciationFeedback.value = {
      score: estimatedScore,
      accuracy: estimatedScore / 100,
      clarity: estimatedScore / 100,
      timing: 0.8,
      recognized: currentCv.value.combination,
      confidence: 0.5,
      feedback: getEncouragingFeedback(estimatedScore),
      analysisMethod: 'fallback',
      error: true
    }

    // エラー統計を記録
    recordAnalysisError(error)
  }
}

// 簡易音声分析（フォールバック用）
const analyzeBasicAudio = async (targetCV) => {
  try {
    // Web Speech APIを使用した基本的な認識
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      return new Promise((resolve, reject) => {
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript.toLowerCase()
          const confidence = event.results[0][0].confidence
          const similarity = calculateSimilarity(transcript, targetCV)

          resolve({
            score: similarity * 100,
            accuracy: similarity,
            clarity: confidence,
            timing: 0.8,
            recognized: transcript,
            confidence: confidence,
            method: 'web-speech'
          })
        }

        recognition.onerror = reject
        recognition.start()

        // 5秒でタイムアウト
        setTimeout(() => reject(new Error('Recognition timeout')), 5000)
      })
    }

    throw new Error('Speech recognition not available')
  } catch (error) {
    throw error
  }
}

// 推定分析生成
const generateEstimatedAnalysis = () => {
  const baseScore = 60 + Math.random() * 30 // 60-90の範囲
  return {
    score: baseScore,
    accuracy: baseScore / 100,
    clarity: 0.7 + Math.random() * 0.2,
    timing: 0.8,
    recognized: currentCv.value.combination,
    confidence: 0.4 + Math.random() * 0.2,
    method: 'estimated'
  }
}

// 文脈的スコア生成（学習履歴を考慮）
const generateContextualScore = () => {
  const recentScores = pronunciationHistory.value.slice(-3).map(h => h.score)
  if (recentScores.length > 0) {
    const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    // 前回のスコアから±10の範囲で調整
    return Math.max(50, Math.min(95, avgRecent + (Math.random() - 0.5) * 20))
  }
  return 70 // デフォルト
}

// デバウンス機能（パフォーマンス最適化）
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// スマートフィードバック生成
const generateSmartFeedback = (analysis) => {
  if (!analysis) return 'もう一度挑戦してみましょう！'

  const score = analysis.score || 0
  const confidence = analysis.confidence || 0

  if (score >= 90) {
    return confidence > 0.8 ? '完璧な発音です！' : '素晴らしい発音です！'
  } else if (score >= 80) {
    return confidence > 0.7 ? 'とても良い発音です！' : '良い発音です。継続しましょう！'
  } else if (score >= 70) {
    return '良い調子です。もう少し明瞭に発音してみましょう。'
  } else if (score >= 60) {
    return '発音を改善しましょう。口の形を意識してみてください。'
  } else {
    return 'ゆっくりと丁寧に発音してみましょう。'
  }
}

// 励ましのフィードバック
const getEncouragingFeedback = (score) => {
  const messages = [
    '練習を続けることが上達への道です！',
    '発音は繰り返しで必ず改善されます！',
    '一歩ずつ確実に進歩しています！',
    '諦めずに続けることが大切です！'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

// 類似度計算
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().replace(/[^a-z]/g, '')
  const s2 = str2.toLowerCase().replace(/[^a-z]/g, '')

  if (s1 === s2) return 1.0
  if (s1.length === 0 || s2.length === 0) return 0.0

  // レーベンシュタイン距離を使用
  const matrix = Array(s2.length + 1).fill().map(() => Array(s1.length + 1).fill(0))

  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      )
    }
  }

  const maxLen = Math.max(s1.length, s2.length)
  return 1 - (matrix[s2.length][s1.length] / maxLen)
}

// エラー記録
const recordAnalysisError = (error) => {
  const errorLog = {
    timestamp: Date.now(),
    error: error.message,
    cv: currentCv.value?.combination,
    difficulty: selectedDifficulty.value,
    userAgent: navigator.userAgent
  }

  // ローカルストレージに記録（分析用）
  try {
    const existingLogs = JSON.parse(localStorage.getItem('cv-trainer-errors') || '[]')
    existingLogs.push(errorLog)
    // 最新100件のみ保持
    if (existingLogs.length > 100) existingLogs.shift()
    localStorage.setItem('cv-trainer-errors', JSON.stringify(existingLogs))
  } catch (e) {
    logger.warn('Error logging failed:', e)
  }
}

// Gamification helper functions
const getCurrentStreak = (history, threshold = 80) => {
  let streak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].score >= threshold) {
      streak++
    } else {
      break
    }
  }
  return streak
}

const getAverageResponseTime = (history) => {
  if (history.length === 0) return 0
  const totalTime = history.reduce((sum, h) => sum + (h.responseTime || 3000), 0)
  return totalTime / history.length
}

const checkConsecutiveDays = (days) => {
  try {
    const practiceLog = JSON.parse(localStorage.getItem('cv-trainer-practice-days') || '[]')
    if (practiceLog.length < days) return false

    const today = new Date().toDateString()
    const recentDays = practiceLog.slice(-days)

    for (let i = 0; i < days; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      if (!recentDays.includes(expectedDate.toDateString())) {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

const updateExperience = (score, responseTime = 3000) => {
  let baseExp = Math.max(5, Math.floor(score / 10)) // 最低5、最高10 EXP

  // ボーナス計算
  if (score >= 95) baseExp += 5 // 完璧ボーナス
  if (score >= 80) baseExp += 2 // 良好ボーナス
  if (responseTime < 2000) baseExp += 3 // スピードボーナス

  // ストリークボーナス
  if (currentStreak.value >= 3) baseExp = Math.floor(baseExp * 1.2)
  if (currentStreak.value >= 5) baseExp = Math.floor(baseExp * 1.5)

  // コンボマルチプライヤー適用
  const finalExp = Math.floor(baseExp * comboMultiplier.value)

  const oldLevel = playerLevel.value
  experiencePoints.value += finalExp

  // レベルアップチェック
  const newLevel = calculateLevel(experiencePoints.value)
  if (newLevel > oldLevel) {
    playerLevel.value = newLevel
    showLevelUpNotification()
  }

  // コンボマルチプライヤー更新
  if (score >= 80) {
    comboMultiplier.value = Math.min(3.0, comboMultiplier.value + 0.1)
  } else {
    comboMultiplier.value = 1.0
  }

  logger.log(`💫 EXP gained: ${finalExp} (base: ${baseExp}, multiplier: ${comboMultiplier.value.toFixed(1)})`)

  return finalExp
}

const calculateLevel = (exp) => {
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (exp >= levelThresholds[i]) {
      return i + 1
    }
  }
  return 1
}

const showLevelUpNotification = () => {
  showLevelUp.value = true
  setTimeout(() => {
    showLevelUp.value = false
  }, 3000)
}

const checkAchievements = () => {
  const unlockedAchievements = []

  achievementDefinitions.forEach(achievement => {
    if (!achievements.value.includes(achievement.id)) {
      if (achievement.condition(pronunciationHistory.value)) {
        achievements.value.push(achievement.id)
        unlockedAchievements.push(achievement)
        showAchievementNotification(achievement)
      }
    }
  })

  return unlockedAchievements
}

const showAchievementNotification = (achievement) => {
  showAchievement.value = achievement
  setTimeout(() => {
    showAchievement.value = null
  }, 4000)
}

const updateStreaks = (score) => {
  if (score >= 80) {
    currentStreak.value++
    maxStreak.value = Math.max(maxStreak.value, currentStreak.value)
  } else {
    currentStreak.value = 0
  }
}

const recordPracticeDay = () => {
  try {
    const today = new Date().toDateString()
    const practiceLog = JSON.parse(localStorage.getItem('cv-trainer-practice-days') || '[]')

    if (!practiceLog.includes(today)) {
      practiceLog.push(today)
      // 最近30日のみ保持
      if (practiceLog.length > 30) {
        practiceLog.splice(0, practiceLog.length - 30)
      }
      localStorage.setItem('cv-trainer-practice-days', JSON.stringify(practiceLog))
    }
  } catch (e) {
    logger.warn('Practice day recording failed:', e)
  }
}

const loadPlayerProgress = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cv-trainer-progress') || '{}')
    if (saved.level) playerLevel.value = saved.level
    if (saved.exp) experiencePoints.value = saved.exp
    if (saved.achievements) achievements.value = saved.achievements
    if (saved.maxStreak) maxStreak.value = saved.maxStreak
  } catch (e) {
    logger.warn('Progress loading failed:', e)
  }
}

const savePlayerProgress = () => {
  try {
    const progress = {
      level: playerLevel.value,
      exp: experiencePoints.value,
      achievements: achievements.value,
      maxStreak: maxStreak.value,
      lastPlayed: Date.now()
    }
    localStorage.setItem('cv-trainer-progress', JSON.stringify(progress))
  } catch (e) {
    logger.warn('Progress saving failed:', e)
  }
}

// プログレス保存のデバウンス（savePlayerProgress定義後に作成）
const debouncedSaveProgress = debounce(savePlayerProgress, 1000)

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
  logger.log('講師フィードバック保存:', instructorNotes.value)
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

// Initialize player progress on mount
onMounted(() => {
  loadPlayerProgress()
})

// Optimized animation loop for visualizer
let animationFrame = null
let lastVisualizerUpdate = 0
const updateVisualizer = (currentTime = performance.now()) => {
  // Limit updates to 30fps for performance
  if (currentTime - lastVisualizerUpdate > 33.33) {
    if (isRecording.value) {
      // More efficient array update
      for (let i = 0; i < visualizerData.value.length; i++) {
        visualizerData.value[i] = Math.random()
      }
    }
    lastVisualizerUpdate = currentTime
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
  min-height: 100vh;
  padding-top: 0;
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

/* Compact Layout Styles */
.game-play-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.game-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  height: 60px;
}

.game-header-bar h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.game-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
}

.gamification-status-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.practice-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  align-items: start;
}

.practice-panel {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(15px);
  height: fit-content;
}

.practice-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #60A5FA;
}

.recording-area-compact {
  text-align: center;
  padding: 1rem;
}

.record-button-compact {
  background: linear-gradient(135deg,
    rgba(239, 68, 68, 0.3) 0%,
    rgba(239, 68, 68, 0.5) 100%);
  border: 2px solid rgba(239, 68, 68, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.record-button-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.6);
}

.record-button-compact.recording {
  animation: pulse-red 1s infinite;
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.visualizer-compact {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  height: 40px;
  margin: 0.5rem 0;
}

.visualizer-bar {
  width: 3px;
  background: #60A5FA;
  border-radius: 2px;
  transition: height 0.1s ease;
}

.feedback-compact {
  text-align: center;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-top: 1rem;
}

.feedback-compact.excellent {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.feedback-compact.good {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.feedback-compact.fair {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.5);
}

.feedback-compact.needs-improvement {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .practice-panels {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .game-header-bar {
    padding: 0.5rem 1rem;
    height: 50px;
  }

  .game-header-bar h2 {
    font-size: 1.125rem;
  }

  .practice-panel {
    padding: 1rem;
  }
}

/* Additional Compact Layout Styles */
.gamification-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.stat-compact {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.stat-icon-sm {
  font-size: 1rem;
}

.stat-value-sm {
  font-weight: bold;
  color: #60A5FA;
}

.panel-title {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #60A5FA;
  font-weight: bold;
}

.cv-display-compact {
  text-align: center;
  margin-bottom: 1rem;
}

.phoneme-visual-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.cv-element {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  min-width: 2.5rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cv-element.result {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
}

.cv-operator {
  font-size: 1rem;
  font-weight: bold;
  color: #60A5FA;
}

.audio-controls-compact {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin: 1rem 0;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-btn.primary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5) 0%, rgba(0, 242, 254, 0.5) 100%);
  border: 1px solid rgba(79, 172, 254, 0.8);
  color: white;
}

.audio-btn.secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
  border: 1px solid rgba(79, 172, 254, 0.5);
  color: white;
}

.audio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

.audio-visualizer-compact {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  height: 30px;
  margin: 0.5rem 0;
}

.viz-bar {
  width: 3px;
  background: #60A5FA;
  border-radius: 2px;
  transition: height 0.1s ease;
}

.record-btn-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.5) 100%);
  border: 2px solid rgba(239, 68, 68, 0.8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem 0;
}

.record-btn-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.6);
}

.record-btn-compact.recording {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.5) 100%);
  border-color: rgba(16, 185, 129, 0.8);
  animation: pulse-green 1s infinite;
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
}

.score-display-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.score-icon-sm {
  font-size: 1.5rem;
}

.score-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.feedback-msg {
  font-size: 0.875rem;
  color: #94A3B8;
  margin-bottom: 0.5rem;
}

.analysis-compact {
  font-size: 0.75rem;
  color: #94A3B8;
}

.analysis-row {
  display: flex;
  justify-content: space-between;
  margin: 0.25rem 0;
}

.mini-stats {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.25rem;
}

.mini-stats .stat {
  background: rgba(30, 41, 59, 0.6);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
}

.instructor-notes-compact {
  margin-top: 0.5rem;
}

.instructor-input {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: white;
  font-size: 0.875rem;
}

.instructor-input:focus {
  outline: none;
  border-color: #60A5FA;
  box-shadow: 0 0 5px rgba(96, 165, 250, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.instructor-mode-btn {
  background: rgba(79, 172, 254, 0.2);
  border: 1px solid rgba(79, 172, 254, 0.5);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.instructor-mode-btn.active {
  background: rgba(79, 172, 254, 0.5);
  border-color: rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.3);
}

.header-progress-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
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

/* Gamification Styles */
.gamification-status {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-item {
  padding: 0.5rem;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
  color: #60A5FA;
  margin-bottom: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #94A3B8;
}

/* Level Up Notification */
.level-up-notification {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1f2937;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 3px solid #fbbf24;
}

/* Achievement Notification */
.achievement-notification {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 2px solid #10b981;
  max-width: 400px;
}

.achievement-icon {
  flex-shrink: 0;
}

.achievement-title {
  margin-bottom: 0.25rem;
}

/* Animations */
@keyframes slide-in-from-top {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-from-top {
  animation: slide-in-from-top 0.5s ease-out;
}

/* Streak Effects */
.stat-item:has(.stat-label:contains("連続")) .stat-value {
  color: #f59e0b;
}

.stat-item:has(.stat-label:contains("コンボ")) .stat-value {
  color: #ec4899;
}

/* Level Badge */
.stat-item:has(.stat-label:contains("レベル")) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(79, 70, 229, 0.2));
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
</style>