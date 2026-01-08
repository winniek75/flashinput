<template>
  <div class="phoneme-saber-container">
    <!-- Beat Saber Style Background -->
    <div class="phoneme-saber-stage">
      <!-- Grid Floor -->
      <div class="grid-floor"></div>
      
      <!-- Space Background -->
      <div class="space-background">
        <div class="stars-field">
          <div v-for="i in 100" :key="`star-${i}`" class="star" :style="getStarStyle(i)"></div>
        </div>
        <div class="nebula-clouds">
          <div v-for="i in 5" :key="`nebula-${i}`" class="nebula-cloud" :style="getNebulaStyle(i)"></div>
        </div>
      </div>
      
      <!-- Neon Rings -->
      <div class="neon-rings">
        <div v-for="i in 8" :key="`ring-${i}`" class="neon-ring" :style="getNeonRingStyle(i)"></div>
      </div>
      
      <!-- Energy Streams -->
      <div class="energy-streams">
        <div v-for="i in 6" :key="`stream-${i}`" class="energy-stream" :style="getEnergyStreamStyle(i)"></div>
      </div>
    </div>
    
    <!-- HUD Interface -->
    <div class="hud-interface">
      <!-- Top HUD -->
      <div class="top-hud">
        <button @click="handleBack" class="hud-button back-button">
          <span class="button-icon">⬅</span>
          <span>戻る</span>
        </button>
        
        <div class="score-display">
          <div class="score-value">{{ score.toLocaleString() }}</div>
          <div class="score-label">スコア</div>
        </div>
        
        <div class="combo-display" :class="{ 'combo-active': combo > 0 }">
          <div class="combo-value">{{ combo }}x</div>
          <div class="combo-label">コンボ</div>
        </div>
        
        <div class="lives-display">
          <div class="lives-hearts">
            <span v-for="i in 3" :key="i" :class="['heart', { active: i <= lives }]">💙</span>
          </div>
          <div class="lives-label">ライフ</div>
        </div>
        
        <button @click="handleSettingsClick" class="hud-button settings-button">
          <span class="button-icon">⚙️</span>
          <span>設定</span>
        </button>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-hud">
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${stageProgress}%` }"></div>
          </div>
          <div class="progress-text">{{ masteredCount }}/{{ currentPhonemes.length }} 音素をマスター</div>
        </div>
      </div>
    </div>
    
    <!-- Game Stage Area -->
    <div class="game-stage" v-if="!loading && !error">
      <!-- Intro Screen -->
      <div v-if="showIntro" class="intro-screen">
        <div class="intro-content">
          <div class="game-logo">
            <div class="logo-icon">🎵</div>
            <h1 class="logo-title">ピュア・サウンド・ラボ</h1>
            <p class="logo-subtitle">ビートセイバー風フォニックス学習</p>
          </div>
          
          <div class="intro-description">
            <div class="description-card">
              <h3>🎯 ゲーム目標</h3>
              <p>奥から飛んでくる音キューブをヒット！ターゲット音をよく聞いて同じ音のキューブを選ぼう！</p>
            </div>
            
            <div class="description-card">
              <h3>🎮 遊び方</h3>
              <ul>
                <li>1、2、3の番号がついた音キューブが流れてきます</li>
                <li>まずターゲット音を🔊ボタンで聞きましょう</li>
                <li>同じ音が聞こえるキューブをヒットゾーンでクリック！</li>
                <li>連続ヒットでコンボを作ろう！</li>
              </ul>
            </div>
          </div>
          
          <div class="question-count-selector">
            <h3>問題数を選択</h3>
            <div class="question-count-options">
              <button 
                v-for="count in questionCountOptions" 
                :key="count"
                @click="handleQuestionCountSelect(count)"
                :class="['count-option', { active: totalQuestions === count }]"
              >
                {{ count }}問
              </button>
            </div>
          </div>
          
          <button @click="startGame" class="start-game-button">
            <span class="button-glow"></span>
            <span class="button-text">🚀 ピュア・サウンド・ラボ開始</span>
          </button>
        </div>
      </div>
      
      <!-- Loading Screen -->
      <div v-else-if="loading" class="loading-screen">
        <div class="loading-spinner"></div>
        <p class="loading-text">音素データベースを読み込み中...</p>
      </div>
      
      <!-- Error Screen -->
      <div v-else-if="error" class="error-screen">
        <div class="error-icon">⚠️</div>
        <h3 class="error-title">システムエラー</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="initializePhonemeData" class="retry-button">
          <span>🔄 再試行</span>
        </button>
      </div>
      
      
      <!-- Main Game -->
      <div v-else-if="gameState === 'playing'" class="beat-saber-game">
        <!-- Target Sound Display -->
        <div class="target-sound-display" :class="{ 'playing-target': isPlayingTarget }">
          <div class="sound-icon">🎯</div>
          <div class="sound-label">ターゲット音</div>
          <div class="target-phoneme">{{ currentQuestion?.target?.symbol || '?' }}</div>
          <button @click.stop="playTargetSoundWithoutClick" :disabled="isPlaying || isPlayingTarget || isPlayingChoice !== -1" class="sound-play-button">
            <span class="play-icon">🔊</span>
            <span class="play-text">{{ isPlayingTarget ? '再生中...' : '再生' }}</span>
          </button>
          <div class="instruction-text">
            <span v-if="!hasStartedQuestion">まずターゲット音を聞いてください</span>
            <span v-else>この音と同じ番号のキューブを選択！</span>
          </div>
        </div>
        
        <!-- 3 Lane System -->
        <div class="three-lane-system">
          <!-- Lane Lines -->
          <div class="lane-lines">
            <div v-for="i in 3" :key="`lane-${i}`" class="lane-line" :style="{ left: `${25 + (i-1) * 25}%` }"></div>
          </div>
          
          
          <!-- Phoneme Cubes -->
          <div class="phoneme-cubes-container">
            <div
              v-for="cube in activeCubes"
              :key="cube.id"
              class="phoneme-cube"
              :class="[
                `lane-${cube.lane}`,
                { 'playing-sound': isPlayingChoice === cube.laneNumber - 1 },
                { 'cube-highlighted': cubeHighlights.has(cube.laneNumber - 1) },
                { 'cube-clickable': gamePhase === GAME_PHASES.ACTION || gamePhase === GAME_PHASES.LISTENING }
              ]"
              :style="cube.style"
              @click.stop="hitCube(cube)"
              :title="`レーン${cube.laneNumber} - クリックで選択`"
            >
              <div class="cube-inner" :style="getCubeHighlightStyle(cube)">
                <div class="cube-number">{{ cube.laneNumber }}</div>
                <div class="cube-content">
                  <div v-if="practiceLevel === 'word' && cube.choice && cube.choice.word" class="cube-word-content">
                    <div class="cube-word">{{ cube.choice.word }}</div>
                    <div class="cube-japanese">{{ cube.choice.japanese }}</div>
                  </div>
                  <div v-else class="cube-phoneme-content">
                    <div class="cube-symbol">♪</div>
                  </div>
                </div>
                <div class="cube-glow" :style="getCubeGlowStyle(cube)"></div>
              </div>
            </div>
          </div>
          
          <!-- Hit Effects -->
          <div class="hit-effects-container">
            <div
              v-for="effect in hitEffects"
              :key="effect.id"
              class="hit-effect"
              :class="effect.type"
              :style="effect.style"
            >
              <div class="effect-particles">
                <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
              </div>
              <div class="effect-text">{{ effect.text }}</div>
            </div>
          </div>
        </div>
        
        <!-- Performance Indicators -->
        <div class="performance-indicators">
          <div v-if="lastHitAccuracy" class="accuracy-indicator" :class="lastHitAccuracy.class">
            {{ lastHitAccuracy.text }}
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="game-instructions">
          <div class="instruction-content">
            <div v-if="!hasStartedQuestion" class="pre-game-hint">
              <span class="hint-icon">🎧</span>
              <span class="hint-text">ターゲット音の後、選択肢が1→2→3の順で流れます</span>
            </div>
            <div v-else class="gameplay-hint">
              <span class="hint-icon">🎯</span>
              <span class="hint-text">ターゲット音と同じ番号のキューブをヒット！</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Feedback Screen -->
      <div v-else-if="gameState === 'feedback'" class="feedback-screen">
        <div class="feedback-content" :class="feedbackType">
          <div class="feedback-icon">{{ feedbackType === 'correct' ? '🎉' : '😞' }}</div>
          <div class="feedback-title">{{ feedbackType === 'correct' ? 'CORRECT!' : 'WRONG!' }}</div>
          <div class="feedback-message">{{ feedback }}</div>
          <div v-if="lastScore > 0" class="score-gained">+{{ lastScore }} ポイント！</div>
        </div>
      </div>
      
      <!-- Game Complete Screen -->
      <div v-else-if="gameState === 'complete'" class="complete-screen">
        <div class="complete-content">
          <div class="complete-icon">🏆</div>
          <h2 class="complete-title">ステージ完了！</h2>
          
          <div class="final-stats">
            <div class="stat-item">
              <div class="stat-value">{{ score.toLocaleString() }}</div>
              <div class="stat-label">最終スコア</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ maxCombo }}</div>
              <div class="stat-label">最大コンボ</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ Math.round(accuracy) }}%</div>
              <div class="stat-label">正確性</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ correctHits }}/{{ currentQuestionIndex }}</div>
              <div class="stat-label">正解数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ currentQuestionIndex }}/{{ totalQuestions }}</div>
              <div class="stat-label">問題</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ masteredPhonemesInGame.size }}</div>
              <div class="stat-label">習得音素数</div>
            </div>
          </div>
          
          <div class="complete-actions">
            <button @click="resetGame" class="action-button secondary">
              <span>🔄 もう一度プレイ</span>
            </button>
            <button v-if="canAdvanceStage" @click="advanceToNextStage" class="action-button primary">
              <span>⬆️ 次のステージ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-modal-overlay" @click="showSettings = false">
      <div class="settings-modal" @click.stop>
        <div class="modal-header">
          <h3>ゲーム設定</h3>
          <button @click="showSettings = false" class="close-button">✕</button>
        </div>
        
        <div class="modal-content">
          <div class="setting-group">
            <label>練習レベル</label>
            <select v-model="practiceLevel" @change="updatePracticeLevel" class="setting-select">
              <option value="phoneme">レベル1: 単音素認識</option>
              <option value="word">レベル2: 単語内音素検出</option>
            </select>
            <p class="level-description">{{ getLevelDescription(practiceLevel) }}</p>
          </div>
          
          <div class="setting-group">
            <label>難易度レベル</label>
            <select v-model="difficultyLevel" class="setting-select">
              <option value="easy">イージー - ゆっくりスピード</option>
              <option value="normal">ノーマル - 標準スピード</option>
              <option value="hard">ハード - 高速スピード</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>音素ステージ</label>
            <select v-model="currentPhonemeStage" @change="updateCurrentPhonemes" class="setting-select">
              <option v-for="stage in availableStages" :key="stage" :value="stage">
                {{ stage.toUpperCase() }}: {{ getStageDescription(stage) }}
              </option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>音声ボリューム</label>
            <input v-model="audioVolume" type="range" min="0" max="100" class="setting-slider">
            <span class="volume-display">{{ audioVolume }}%</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showSettings = false" class="modal-button secondary">キャンセル</button>
          <button @click="applySettings" class="modal-button primary">設定を適用</button>
        </div>
      </div>
    </div>

    <!-- Unified Result Screen -->
    <UnifiedResultScreen
      v-if="showUnifiedResult && vrGameResult"
      :game-result="vrGameResult"
      :game-name="'ピュア・サウンド・ラボ'"
      :game-icon="'🎵'"
      :show-vr-integration="true"
      @play-again="handlePlayAgain"
      @back-to-hub="handleBackToHub"
      @preview-vr-scenario="handleStartVRScenario"
      @explore-vr="handleExploreVR"
    />

    <!-- VR Scenario Suggestion -->
    <VRScenarioSuggestion
      v-if="showVRSuggestion"
      :game-result="vrGameResult"
      :player-skills="phonemeSkillsData"
      :show-automatically="true"
      @start-vr-scenario="handleStartVRScenario"
      @play-recommended-game="handlePlayRecommendedGame"
      @view-vr-report="handleViewVRReport"
      @close-suggestion="() => showVRSuggestion = false"
    />
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

// Import existing dependencies
import { NATIVE_PHONEME_PROGRESSION, NATIVE_AUDIO_MAPPING, WORD_PHONEME_PRACTICE, generateWordLevelQuestion } from '@/data/native-phoneme-database.js'
import { useGameAudio } from '@/composables/useGameAudio.js'
import { usePhonemeProgress } from '@/composables/usePhonemeProgress.js'

// VR Academy Integration
import { useGameStore } from '@/stores/gameStore'
import { useProgressStore } from '@/stores/progress'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { useVRDataSync, VRGameResultBuilder } from '@/api/vrDataSync'
import UnifiedResultScreen from '@/components/game/UnifiedResultScreen.vue'
import VRScenarioSuggestion from '@/components/vr/VRScenarioSuggestion.vue'

const router = useRouter()
// 音声再生時は効果音を無効化
const { playSound: originalPlaySound, isPlaying: isWordPlaying } = useGameAudio()
const playSound = (type, data, options = {}) => {
  // このゲーム内では効果音を完全に無効化（音声学習専用）
  if (type === 'effect' || type === 'click' || type === 'button') {
    logger.log('効果音は無効化されています:', type)
    return Promise.resolve()
  }
  return originalPlaySound(type, data, options)
}

// Store integrations
const gameStore = useGameStore()
const progressStore = useProgressStore()
const playerStore = usePlayerProfileStore()
const vrDataSync = useVRDataSync()

// Progress management
const {
  currentStage: currentPhonemeStage,
  masteredPhonemes,
  stageProgress,
  canAdvanceStage,
  availableStages,
  recordAttempt,
  advanceToNextStage: progressAdvanceStage
} = usePhonemeProgress()

// Phase constants - 完全な2段階システム
const GAME_PHASES = {
  INTRO: 'intro',
  LISTENING: 'listening',    // 新規追加
  COUNTDOWN: 'countdown',    // 新規追加  
  ACTION: 'action',         // 新規追加
  FEEDBACK: 'feedback',
  COMPLETE: 'complete'
}

const PHASE_DURATIONS = {
  LISTENING: 5000, // 5 seconds
  COUNTDOWN: 3000, // 3 seconds
  ACTION: 3000,    // 3 seconds  
  FEEDBACK: 1000   // 1 seconds - reduced for smoother flow
}

// Game State
const gameState = ref('intro') // intro, playing, complete
const gamePhase = ref(GAME_PHASES.INTRO) // 正確なフェーズ管理
const showIntro = ref(true)
const loading = ref(false)
const error = ref('')
const showSettings = ref(false)

// Question count management
const totalQuestions = ref(10) // Default 10 questions
const currentQuestionIndex = ref(0)
const questionCountOptions = [5, 10, 15]

// VR Academy Integration State
const showUnifiedResult = ref(false)
const showVRSuggestion = ref(false)
const gameStartTime = ref(null)
const gameEndTime = ref(null)
const phonemeSkillsData = ref([])
const mistakesData = ref([])
const vrGameResult = ref(null)

// Phase-specific state
const showCountdown = ref(false)
const countdownNumber = ref(3)
const countdownText = ref('')
const phaseTimeRemaining = ref(0)
// const isInSlowMotionZone = ref(false) // Removed - not needed

// Audio feedback state
const currentAudioDescription = ref('')
const currentPlayingChoice = ref(-1)

// Phase state management
const listeningTimer = ref(null)
const rushStartTime = ref(null)

// Visual highlight system
const cubeHighlights = ref(new Map())
const targetHighlight = ref(null)


// Game Data
const currentPhonemes = ref([])
const currentQuestion = ref(null)
const activeCubes = ref([])
const hitEffects = ref([])

// Game Stats
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const lives = ref(3)
const accuracy = ref(100)
const correctHits = ref(0) // Number of correct answers
const masteredPhonemesInGame = ref(new Set()) // Track phonemes mastered in this game
const lastScore = ref(0)
const lastHitAccuracy = ref(null)

// Audio State
const isPlaying = ref(false)
const audioVolume = ref(80)
const isPlayingTarget = ref(false)
const isPlayingChoice = ref(-1) // -1: none, 0-2: choice index

// Settings
const practiceLevel = ref('phoneme') // 'phoneme' or 'word'
const difficultyLevel = ref('normal')
const feedbackType = ref('')
const feedback = ref('')

// Performance tracking
const cubeIdCounter = ref(0)
const gameLoopId = ref(null)
const cubeSpawnTimer = ref(null)
const hasStartedQuestion = ref(false)
const isProcessingHit = ref(false) // Prevent multiple simultaneous hits

// Audio management
const currentAudio = ref(null)
const audioTimeouts = ref([])

// キューブハイライト機能
const highlightCube = (cubeIndex, color = '#FFD700') => {
  logger.log(`Highlighting cube ${cubeIndex + 1} with color ${color}`)
  cubeHighlights.value.set(cubeIndex, {
    color: color,
    timestamp: Date.now()
  })
}

const clearCubeHighlight = (cubeIndex) => {
  logger.log(`Clearing highlight for cube ${cubeIndex + 1}`)
  cubeHighlights.value.delete(cubeIndex)
}

const clearAllHighlights = () => {
  logger.log('Clearing all cube highlights')
  cubeHighlights.value.clear()
}

// 選択肢音再生時のハイライト付き再生
const playChoicePhonemeWithHighlight = async (choice, choiceIndex) => {
  logger.log(`Playing choice with highlight, index: ${choiceIndex}`)
  
  // ハイライト開始
  const colors = ['#4A90E2', '#50E3C2', '#FF6B6B'] // 青、緑、赤
  highlightCube(choiceIndex, colors[choiceIndex % colors.length])
  
  // 音声再生（練習レベルに応じて異なる）
  isPlayingChoice.value = choiceIndex
  
  if (practiceLevel.value === 'word' && choice.word) {
    // Word level: play word using speech synthesis
    await playWordAudio(choice.word)
  } else if (choice.symbol) {
    // Phoneme level: play phoneme sound
    await playPhonemeSound(choice)
  }
  
  isPlayingChoice.value = -1
  
  // ハイライト終了
  clearCubeHighlight(choiceIndex)
}

// Word audio playback using speech synthesis
const playWordAudio = async (word) => {
  return new Promise((resolve) => {
    if (!word) {
      resolve()
      return
    }
    
    // Stop any existing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.volume = audioVolume.value / 100
    
    utterance.onend = () => {
      resolve()
    }
    
    utterance.onerror = () => {
      logger.warn(`Failed to play word: ${word}`)
      resolve()
    }
    
    window.speechSynthesis.speak(utterance)
  })
}

// 色変換ヘルパー関数
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r: 255, g: 255, b: 255}
}

// クリックフィードバック関数
const createClickFeedback = (cube) => {
  // クリックエフェクトを作成
  const effect = {
    id: Date.now(),
    type: 'click',
    style: {
      left: cube.style.left,
      top: '50%',
      transform: 'translate(-50%, -50%)'
    },
    text: `Lane ${cube.laneNumber}!`
  }
  
  hitEffects.value.push(effect)
  
  // エフェクトを自動削除
  setTimeout(() => {
    hitEffects.value = hitEffects.value.filter(e => e.id !== effect.id)
  }, 500)
}

// Computed Properties
const masteredCount = computed(() => {
  return currentPhonemes.value.filter(phoneme => 
    masteredPhonemes.value.has(phoneme.symbol)
  ).length
})


// Difficulty settings
const difficultySettings = computed(() => {
  const settings = {
    easy: {
      cubeSpeed: 5000, // 5 seconds to reach hit zone (slower)
      spawnInterval: 2000, // 2 seconds between spawns
      hitZoneTolerance: 300 // milliseconds (more tolerant)
    },
    normal: {
      cubeSpeed: 4000, // 4 seconds (slower)
      spawnInterval: 1500, // 1.5 seconds
      hitZoneTolerance: 250 // more tolerant
    },
    hard: {
      cubeSpeed: 3000, // 3 seconds (slower)
      spawnInterval: 1000, // 1 second
      hitZoneTolerance: 200 // more tolerant
    }
  }
  return settings[difficultyLevel.value] || settings.normal
})

// Style generation functions
const getStarStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }
}

const getNebulaStyle = (index) => {
  const colors = ['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
  return {
    left: `${(index * 20) % 100}%`,
    top: `${(index * 30) % 100}%`,
    background: `radial-gradient(circle, ${colors[index % colors.length]}20, transparent)`,
    animationDelay: `${index * 2}s`
  }
}

const getNeonRingStyle = (index) => {
  return {
    animationDelay: `${index * 0.5}s`,
    transform: `translateZ(${-500 - index * 200}px) scale(${1 + index * 0.2})`
  }
}

const getEnergyStreamStyle = (index) => {
  return {
    left: `${10 + index * 15}%`,
    animationDelay: `${index * 0.3}s`
  }
}

const getParticleStyle = (index) => {
  const angle = (index * 18) % 360
  return {
    transform: `rotate(${angle}deg) translateX(${20 + Math.random() * 30}px)`,
    animationDelay: `${index * 0.05}s`
  }
}

// Game Logic
const initializePhonemeData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Validate database exists
    if (!NATIVE_PHONEME_PROGRESSION || typeof NATIVE_PHONEME_PROGRESSION !== 'object') {
      throw new Error('Native phoneme database is not available')
    }
    
    // Validate database has stages
    const stages = Object.keys(NATIVE_PHONEME_PROGRESSION)
    if (stages.length === 0) {
      throw new Error('Native phoneme database has no stages')
    }
    
    // Validate NATIVE_AUDIO_MAPPING exists
    if (!NATIVE_AUDIO_MAPPING || typeof NATIVE_AUDIO_MAPPING !== 'object') {
      throw new Error('Native audio mapping is not available')
    }
    
    // Update phonemes for current stage
    updateCurrentPhonemes()
    
    // Verify we have phonemes loaded
    if (currentPhonemes.value.length === 0) {
      throw new Error('Failed to load phonemes for current stage')
    }
    
    loading.value = false
  } catch (err) {
    logger.error('Initialization error:', err)
    error.value = `初期化エラー: ${err.message}`
    loading.value = false
  }
}

const updateCurrentPhonemes = () => {
  try {
    // Use native phoneme database with proper error checking
    const stage = currentPhonemeStage.value || 'group1'
    
    logger.log('🔍 Updating phonemes for stage:', stage)
    logger.log('Available stages in NATIVE_PHONEME_PROGRESSION:', Object.keys(NATIVE_PHONEME_PROGRESSION))
    
    if (!NATIVE_PHONEME_PROGRESSION[stage]) {
      throw new Error(`Invalid stage: ${stage}`)
    }
    
    const phonemesForStage = NATIVE_PHONEME_PROGRESSION[stage]
    logger.log(`Raw phonemes for ${stage}:`, phonemesForStage)
    
    if (!Array.isArray(phonemesForStage)) {
      throw new Error(`Invalid phoneme data for stage: ${stage}`)
    }
    
    // Filter and validate phonemes
    currentPhonemes.value = phonemesForStage.filter(p => {
      const isValid = p && 
             typeof p === 'object' && 
             p.symbol && 
             typeof p.symbol === 'string' &&
             p.audioFile // Ensure audio file is defined
      
      if (!isValid) {
        logger.log('Invalid phoneme found:', p)
      }
      return isValid
    })
    
    if (currentPhonemes.value.length === 0) {
      throw new Error(`No valid phonemes found for stage: ${stage}`)
    }
    
    logger.log(`✅ Successfully updated phonemes for ${stage}:`, currentPhonemes.value.length, 'phonemes')
    logger.log('Phoneme symbols:', currentPhonemes.value.map(p => p.symbol))
  } catch (error) {
    logger.error('❌ Error updating phonemes:', error)
    error.value = error.message
    currentPhonemes.value = [] // Reset to empty array on error
  }
}

const startGame = () => {
  logger.log('🚀 ゲーム開始ボタンがクリックされました')
  try {
    showIntro.value = false
    gameState.value = 'playing'
    gamePhase.value = GAME_PHASES.LISTENING
  
    // VR Academy Integration - Start tracking
    gameStartTime.value = new Date()
    phonemeSkillsData.value = []
    mistakesData.value = []
    
    resetGameStats()
    loadNextQuestion()
    startImprovedGameLoop()
    logger.log('ゲーム開始処理完了')
  } catch (error) {
    logger.error('ゲーム開始エラー:', error)
  }
}

const resetGameStats = () => {
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  lives.value = 3
  accuracy.value = 100
  correctHits.value = 0
  masteredPhonemesInGame.value.clear()
  activeCubes.value = []
  hitEffects.value = []
}

const loadNextQuestion = () => {
  try {
    // Increment question counter
    currentQuestionIndex.value++
    
    // Check if we've reached the limit
    if (currentQuestionIndex.value > totalQuestions.value) {
      logger.log('Reached question limit, completing game')
      gameState.value = 'complete'
      gamePhase.value = GAME_PHASES.COMPLETE
      handleGameCompletion()
      return
    }
    
    if (!currentPhonemes.value || currentPhonemes.value.length === 0) {
      logger.log('No phonemes available, completing game')
      gameState.value = 'complete'
      return
    }

    // Generate question based on practice level
    if (practiceLevel.value === 'word') {
      // Generate word-level phoneme detection question
      const randomIndex = Math.floor(Math.random() * currentPhonemes.value.length)
      const targetPhoneme = currentPhonemes.value[randomIndex]
      
      if (!targetPhoneme || !targetPhoneme.symbol) {
        throw new Error('Invalid target phoneme selected')
      }

      const wordQuestion = generateWordLevelQuestion(targetPhoneme.symbol, currentPhonemeStage.value, difficultyLevel.value)
      
      if (!wordQuestion) {
        logger.warn('Could not generate word question, falling back to phoneme mode')
        // Fall back to phoneme mode
        generatePhonemeQuestion()
      } else {
        currentQuestion.value = {
          target: targetPhoneme,
          choices: wordQuestion.choices,
          correctLaneNumber: wordQuestion.correctAnswer + 1,
          questionType: 'word-detection'
        }
        
        logger.log('Word question loaded:', {
          target: targetPhoneme.symbol,
          choices: wordQuestion.choices.map(c => `${c.word} (${c.japanese})`),
          correctLane: currentQuestion.value.correctLaneNumber
        })
      }
    } else {
      // Generate traditional phoneme question
      generatePhonemeQuestion()
    }

    function generatePhonemeQuestion() {
      // Select random target phoneme with validation
      const randomIndex = Math.floor(Math.random() * currentPhonemes.value.length)
      const targetPhoneme = currentPhonemes.value[randomIndex]
      
      if (!targetPhoneme || !targetPhoneme.symbol) {
        throw new Error('Invalid target phoneme selected')
      }

      // Create choices (target + 2 distractors)
      let choices = [targetPhoneme]
      const otherPhonemes = currentPhonemes.value.filter(p => 
        p && p.symbol && p.symbol !== targetPhoneme.symbol
      )
      
      // Add distractors if available
      const availablePhonemes = [...otherPhonemes] // Create copy to avoid mutation
      while (choices.length < 3 && availablePhonemes.length > 0) {
        const randomIdx = Math.floor(Math.random() * availablePhonemes.length)
        const distractor = availablePhonemes.splice(randomIdx, 1)[0]
        if (distractor && distractor.symbol) {
          choices.push(distractor)
        }
      }
      
      // If we couldn't get 3 choices, pad with duplicates (for small phoneme sets)
      while (choices.length < 3) {
        choices.push(targetPhoneme)
      }

      // Shuffle choices
      const shuffledChoices = choices.sort(() => Math.random() - 0.5)

      currentQuestion.value = {
        target: targetPhoneme,
        choices: shuffledChoices,
        correctLaneNumber: shuffledChoices.findIndex(c => c.symbol === targetPhoneme.symbol) + 1,
        questionType: 'phoneme'
      }
      
      logger.log('Phoneme question loaded:', {
        target: targetPhoneme.symbol,
        choices: shuffledChoices.map(c => c.symbol),
        correctLane: currentQuestion.value.correctLaneNumber
      })
    }
  } catch (err) {
    logger.error('Error loading question:', err)
    // Try to continue with next question or complete
    if (currentPhonemes.value.length > 0) {
      loadNextQuestion() // Retry
    } else {
      gameState.value = 'complete'
    }
  }
}

const startImprovedGameLoop = async () => {
  logger.log('Starting improved 2-phase game loop')
  
  while (gameState.value === 'playing' && lives.value > 0) {
    try {
      // 完全に分離された2段階システム
      await startImprovedQuestionCycle()
      
      if (gameState.value !== 'playing') break
      
      // 次の問題へ移行
      await transitionToNextQuestion()
      
    } catch (error) {
      logger.error('Error in game loop:', error)
      handleGameError(error, 'gameloop')
      break
    }
  }
  
  // Game ended
  if (lives.value <= 0 || currentPhonemes.value.length === 0 || currentQuestionIndex.value >= totalQuestions.value) {
    gameState.value = 'complete'
    gamePhase.value = GAME_PHASES.COMPLETE
    await handleGameCompletion()
  }
}

// 新規実装: 完全に分離されたゲームフロー
async function startImprovedQuestionCycle() {
  logger.log('Starting improved 2-phase question cycle')
  
  // Phase 1: リスニングフェーズ（5秒間）
  gamePhase.value = GAME_PHASES.LISTENING
  await executeListeningPhase()
  
  if (gameState.value !== 'playing') return
  
  // Phase 2: アクションフェーズ（すぐにクリック可能）
  gamePhase.value = GAME_PHASES.ACTION
  await executeActionPhase()
  
  if (gameState.value !== 'playing') return
  
  // Phase 3: フィードバック（1秒間）
  gamePhase.value = GAME_PHASES.FEEDBACK
  await executeFeedbackPhase()
}

// 新規関数: リスニングフェーズの実装
async function executeListeningPhase() {
  logger.log('=== LISTENING PHASE START ===')
  phaseTimeRemaining.value = PHASE_DURATIONS.LISTENING
  
  // Ensure question is loaded
  if (!currentQuestion.value || !currentQuestion.value.choices) {
    logger.error('No current question in listening phase')
    return
  }
  
  // キューブを遠くに配置（動かない状態）
  positionCubesForListening()
  
  // 1. ターゲット音再生 + 視覚ハイライト
  stopAllAudio() // 確実に全音声を停止
  await waitDelay(200) // 停止確認待機
  
  showTargetHighlight()
  await playTargetPhonemeWithHighlight()
  await waitDelay(500)
  
  if (gameState.value !== 'playing') return
  
  // 2. 選択肢音を順番に再生 + 各キューブハイライト
  logger.log('選択肢音声再生シーケンス開始')
  
  for (let i = 0; i < currentQuestion.value.choices.length; i++) {
    if (gameState.value !== 'playing') return
    
    const choice = currentQuestion.value.choices[i]
    const colors = ['#4A90E2', '#50E3C2', '#FF6B6B'] // 青、緑、赤
    
    logger.log(`選択肢 ${i + 1} 処理開始:`, choice.symbol)
    
    highlightCube(i, colors[i])
    
    // 確実に前の音声を停止してから次を再生
    stopAllAudio()
    await waitDelay(200) // 停止確認待機
    
    // 音声再生を待つ
    await playChoicePhonemeWithHighlight(choice, i)
    logger.log(`選択肢 ${i + 1} 音声再生完了`)
    
    // 短いポーズ
    await waitDelay(300)
    logger.log(`選択肢 ${i + 1} 待機完了`)
    
    clearCubeHighlight(i)
    logger.log(`選択肢 ${i + 1} 処理完了`)
  }
  
  logger.log('選択肢音声再生シーケンス完了')
  
  clearAllHighlights()
  logger.log('=== LISTENING PHASE COMPLETE ===')
}

// カウントダウンフェーズを削除 - 子供達がすぐにクリックできるように

// 新規関数: アクションフェーズ
async function executeActionPhase() {
  logger.log('=== ACTION PHASE START ===')
  phaseTimeRemaining.value = PHASE_DURATIONS.ACTION
  
  // キューブを表示（移動は不要）
  if (activeCubes.value.length === 0) {
    positionCubesForListening() // Ensure cubes exist
  }
  
  // Make cubes fully clickable
  hasStartedQuestion.value = true
  
  // 3秒間のアクション時間
  await waitDelay(PHASE_DURATIONS.ACTION)
  
  logger.log('=== ACTION PHASE COMPLETE ===')
}

// 新規関数: フィードバックフェーズ
async function executeFeedbackPhase() {
  logger.log('=== FEEDBACK PHASE START ===')
  phaseTimeRemaining.value = PHASE_DURATIONS.FEEDBACK
  
  // 結果とフィードバックを表示
  // (既存のフィードバックロジックを使用)
  
  await waitDelay(PHASE_DURATIONS.FEEDBACK)
  logger.log('=== FEEDBACK PHASE COMPLETE ===')
}

const startQuestionCycle = () => {
  logger.log('startQuestionCycle called')
  hasStartedQuestion.value = false
  
  // Auto-play all sounds sequence
  const timeout = setTimeout(() => {
    if (gameState.value === 'playing') {
      logger.log('About to call playAllSoundsSequence')
      logger.log('Current question at timeout:', currentQuestion.value)
      playAllSoundsSequence().catch(error => {
        logger.error('Error in playAllSoundsSequence:', error)
      })
    }
  }, 500)
  audioTimeouts.value.push(timeout)
}

const stopAllAudio = () => {
  logger.log('Stopping all audio sources')
  
  // 現在の音声を停止
  if (currentAudio.value) {
    try {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value = null
    } catch (error) {
      logger.warn('Error stopping current audio:', error)
    }
  }
  
  // 全ての音声状態をリセット
  isPlaying.value = false
  isPlayingTarget.value = false
  isPlayingChoice.value = -1
  
  // ページ内の全てのAudio要素を停止（確実に重複を防止）
  document.querySelectorAll('audio').forEach(audio => {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch (error) {
      logger.warn('Error stopping audio element:', error)
    }
  })
}

const playAllSoundsSequence = async () => {
  logger.log('playAllSoundsSequence called, currentQuestion:', currentQuestion.value)
  
  if (!currentQuestion.value || gameState.value !== 'playing') {
    logger.log('No current question or game not playing, returning early')
    return
  }
  
  logger.log('Current question exists, starting sequence')
  
  try {
    // Play target sound first
    logger.log('Starting sound sequence...')
    await playCurrentPhoneme()
    
    // Check if game is still playing
    if (gameState.value !== 'playing') return
    
    logger.log('Target sound finished, waiting 800ms...')
    await new Promise(resolve => {
      const timeout = setTimeout(resolve, 800)
      audioTimeouts.value.push(timeout)
    })
    
    logger.log('Starting to play choice sounds...')
    
    // Play each choice sound with proper audio mapping
    for (let i = 0; i < currentQuestion.value.choices.length; i++) {
      // Check if game is still playing before each sound
      if (gameState.value !== 'playing') return
      
      const choice = currentQuestion.value.choices[i]
      logger.log(`Playing choice ${i + 1}:`, choice.symbol)
      
      const audioFileName = NATIVE_AUDIO_MAPPING[choice.symbol] || `${choice.symbol}.m4a`
      const audioPath = `/sounds/${audioFileName}`
      
      logger.log(`Choice ${i + 1} audio path:`, audioPath)
      
      stopAllAudio() // Stop any previous audio
      const audio = new Audio(audioPath)
      currentAudio.value = audio
      audio.volume = audioVolume.value / 100
      
      try {
        isPlaying.value = true
        await audio.play()
        logger.log(`Choice ${i + 1} started playing`)
        
        await new Promise((resolve, reject) => {
          let resolved = false
          
          audio.onended = () => {
            if (!resolved) {
              resolved = true
              logger.log(`Choice ${i + 1} finished playing`)
              isPlaying.value = false
              resolve()
            }
          }
          
          audio.onerror = (e) => {
            if (!resolved) {
              resolved = true
              logger.error(`Choice ${i + 1} audio error:`, e)
              isPlaying.value = false
              resolve()
            }
          }
          
          // Fallback timeout in case onended doesn't fire
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true
              logger.log(`Choice ${i + 1} timeout - forcing resolve`)
              isPlaying.value = false
              resolve()
            }
          }, 2000)
          audioTimeouts.value.push(timeout)
        })
      } catch (audioError) {
        logger.error(`Failed to play audio for ${choice.symbol}:`, audioError)
        isPlaying.value = false
      }
      
      // Check if game is still playing
      if (gameState.value !== 'playing') return
      
      // Short pause between sounds
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 300)
        audioTimeouts.value.push(timeout)
      })
      logger.log(`Finished playing choice ${i + 1}, moving to next...`)
    }
    
    // Check if game is still playing before spawning cubes
    if (gameState.value !== 'playing') return
    
    logger.log('All sounds played, spawning cubes...')
    
    // Start cube spawning after all sounds played
    hasStartedQuestion.value = true
    const spawnTimeout = setTimeout(() => {
      if (gameState.value === 'playing') {
        spawnCubes()
      }
    }, 500)
    audioTimeouts.value.push(spawnTimeout)
    
  } catch (error) {
    logger.error('Error in playAllSoundsSequence:', error)
    // Fallback: start cubes anyway if game is still playing
    if (gameState.value === 'playing') {
      hasStartedQuestion.value = true
      const fallbackTimeout = setTimeout(() => {
        if (gameState.value === 'playing') {
          spawnCubes()
        }
      }, 500)
      audioTimeouts.value.push(fallbackTimeout)
    }
  }
}

const stopGameLoop = () => {
  if (cubeSpawnTimer.value) {
    clearInterval(cubeSpawnTimer.value)
    cubeSpawnTimer.value = null
  }
  if (gameLoopId.value) {
    clearInterval(gameLoopId.value)
    gameLoopId.value = null
  }
  
  // Clean up audio
  stopAllAudio()
  
  // Clear all timeouts
  audioTimeouts.value.forEach(timeout => clearTimeout(timeout))
  audioTimeouts.value = []
  
  // Reset game state
  activeCubes.value = []
  hitEffects.value = []
  hasStartedQuestion.value = false
}

const spawnCubes = () => {
  logger.log('spawnCubes called')
  
  if (!currentQuestion.value) {
    logger.log('No current question in spawnCubes')
    return
  }

  logger.log('Spawning cubes for question:', currentQuestion.value)

  const lanes = [1, 2, 3]
  
  // Use the SAME order as played in playAllSoundsSequence (no shuffling)
  const choicesInPlayOrder = currentQuestion.value.choices

  logger.log('Choices in play order:', choicesInPlayOrder)

  choicesInPlayOrder.forEach((phoneme, index) => {
    if (index < 3) { // Limit to 3 cubes (one per lane)
      const cube = {
        id: cubeIdCounter.value++,
        phoneme: phoneme,
        choice: phoneme, // Add choice data for display
        lane: lanes[index],
        laneNumber: index + 1, // Show the order number (1, 2, 3) matching the audio sequence
        isCorrect: practiceLevel.value === 'word' ? 
          (phoneme.hasTarget === true) : 
          (phoneme.symbol === currentQuestion.value.target.symbol),
        progress: 0, // 0 = far away, 1 = hit zone
        style: {
          left: `${5 + (lanes[index] - 1) * 30}%`,
          transform: 'scale(0.8)',
          opacity: 0
        },
        spawnTime: Date.now()
      }
      
      logger.log(`Created cube ${index + 1} (lane ${lanes[index]}) for phoneme ${phoneme.symbol}:`, cube)
      activeCubes.value.push(cube)
    }
  })
  
  logger.log('Total active cubes:', activeCubes.value.length)
  logger.log('Active cubes array:', activeCubes.value)
}

// updateGameState() - フェーズ別動作制御に修正
const updateGameState = () => {
  // リスニングフェーズ中はキューブを動かさない
  if (gamePhase.value === GAME_PHASES.LISTENING || 
      gamePhase.value === GAME_PHASES.COUNTDOWN) {
    return // 早期リターン
  }
  
  // No cube animation needed - keep it simple
  
  // ゲームオーバー条件チェック
  if (lives.value <= 0) {
    gameState.value = 'complete'
    gamePhase.value = GAME_PHASES.COMPLETE
    stopGameLoop()
  }
}

const hitCube = async (cube) => {
  // Only allow hits during ACTION or LISTENING phase
  if (gamePhase.value !== GAME_PHASES.ACTION && gamePhase.value !== GAME_PHASES.LISTENING) {
    logger.log('Cannot hit cube in current phase:', gamePhase.value)
    return
  }

  // Prevent clicking if already processing
  if (isProcessingHit.value || isPlaying.value) {
    logger.log('Already processing hit or audio is playing, ignoring click')
    return
  }

  // Set processing flag
  isProcessingHit.value = true

  logger.log(`Cube hit: Lane ${cube.laneNumber}, isCorrect=${cube.isCorrect}, phoneme=${cube.phoneme.symbol}`)

  try {
    // Visual feedback
  createClickFeedback(cube)

  // Remove cube from active cubes
  activeCubes.value = activeCubes.value.filter(c => c.id !== cube.id)

  const isCorrect = cube.isCorrect

  if (isCorrect) {
    correctHits.value++
    // Track mastered phonemes
    masteredPhonemesInGame.value.add(currentQuestion.value.target.symbol)
    handleCorrectHit(cube, 0)
  } else {
    handleIncorrectHit(cube)
  }

  // Calculate accuracy based on questions answered correctly vs total questions
  if (currentQuestionIndex.value > 0) {
    accuracy.value = Math.round((correctHits.value / currentQuestionIndex.value) * 100)
  }

  // Record attempt
  recordAttempt(currentQuestion.value.target, isCorrect, Date.now() - cube.spawnTime)

  // Check if all cubes are cleared
  checkForNextQuestion()
  } finally {
    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessingHit.value = false
    }, 300)
  }
}

const checkForNextQuestion = () => {
  // Check if we've reached the question limit
  if (currentQuestionIndex.value >= totalQuestions.value) {
    logger.log('Reached question limit, completing game')
    gameState.value = 'complete'
    gamePhase.value = GAME_PHASES.COMPLETE
    stopGameLoop()
    handleGameCompletion()
    return
  }

  // Only proceed to next question if all cubes are cleared and question has started
  if (activeCubes.value.length === 0 && hasStartedQuestion.value) {
    logger.log('All cubes cleared, transitioning to next question...')
    hasStartedQuestion.value = false
    
    // Just clear the cubes, the main game loop will handle the rest
    activeCubes.value = []
  }
}

const handleCorrectHit = (cube, timing) => {
  let multiplier = 1.0
  let accuracyText = 'GOOD'
  let accuracyClass = 'good'

  if (timing < 0.05) {
    multiplier = 1.5
    accuracyText = 'PERFECT!'
    accuracyClass = 'perfect'
  } else if (timing < 0.1) {
    multiplier = 1.2
    accuracyText = 'GREAT!'
    accuracyClass = 'great'
  } else if (timing < 0.15) {
    multiplier = 1.0
    accuracyText = 'GOOD'
    accuracyClass = 'good'
  } else {
    multiplier = 0.8
    accuracyText = 'OK'
    accuracyClass = 'ok'
  }

  combo.value++
  maxCombo.value = Math.max(maxCombo.value, combo.value)

  const baseScore = 100
  const comboBonus = Math.min(combo.value * 10, 500)
  const scoreGained = Math.floor((baseScore + comboBonus) * multiplier)
  
  score.value += scoreGained
  lastScore.value = scoreGained

  lastHitAccuracy.value = {
    text: accuracyText,
    class: accuracyClass
  }

  // VR Academy Integration - Record correct phoneme skill
  if (currentQuestion.value) {
    const responseTime = timing * 1000 + 500 // Convert to ms and add base time
    recordPhonemeSkill(currentQuestion.value.phoneme, true, responseTime)
  }

  createHitEffect(cube, 'correct', 'CORRECT!')
  
  // Clear accuracy display after 1 second
  const accuracyTimeout = setTimeout(() => {
    lastHitAccuracy.value = null
  }, 1000)
  audioTimeouts.value.push(accuracyTimeout)
}

const handleIncorrectHit = (cube) => {
  combo.value = 0
  lives.value--
  
  lastHitAccuracy.value = {
    text: 'WRONG!',
    class: 'wrong'
  }

  // VR Academy Integration - Record incorrect phoneme skill and mistake
  if (currentQuestion.value) {
    recordPhonemeSkill(currentQuestion.value.phoneme, false, 2000) // Longer response time for wrong answers
    recordMistake(
      currentQuestion.value.phoneme,
      currentQuestion.value.phoneme,
      cube.phoneme || 'unknown',
      `Question: ${currentQuestion.value.phoneme}, Selected: ${cube.phoneme || 'unknown'}`
    )
  }

  createHitEffect(cube, 'incorrect', 'WRONG!')
  
  const wrongTimeout = setTimeout(() => {
    lastHitAccuracy.value = null
  }, 1000)
  audioTimeouts.value.push(wrongTimeout)
}

const createHitEffect = (cube, type, text) => {
  const effect = {
    id: Date.now() + Math.random(),
    type: type,
    text: text,
    style: {
      left: cube.style.left,
      top: '50%'
    }
  }
  
  hitEffects.value.push(effect)
  
  // Remove effect after animation
  const effectTimeout = setTimeout(() => {
    hitEffects.value = hitEffects.value.filter(e => e.id !== effect.id)
  }, 2000)
  audioTimeouts.value.push(effectTimeout)
}

const createMissEffect = (cube) => {
  createHitEffect(cube, 'miss', 'MISS!')
}

// Listening Phase Functions


// 新規関数: ターゲット音のみ再生（クリック音なし）
const playTargetSoundWithoutClick = async () => {
  if (!currentQuestion.value || !currentQuestion.value.target) {
    logger.log('No target phoneme to play')
    return
  }

  // 他の音声を完全に停止
  if (isPlaying.value || isPlayingTarget.value) {
    logger.log('Audio already playing, stopping current audio first')
    stopAllAudio()
    await new Promise(resolve => setTimeout(resolve, 200)) // 確実に停止するまで待機
  }

  isPlayingTarget.value = true
  logger.log('Playing target sound only:', currentQuestion.value.target.symbol)
  
  try {
    await playPhonemeSound(currentQuestion.value.target)
  } finally {
    isPlayingTarget.value = false
  }
}

// 旧関数（後方互換性のため保持）
const playTargetSound = async () => {
  await playTargetSoundWithoutClick()
}

// 新規関数: 選択肢音の再生
const playChoiceSound = async (choiceIndex) => {
  if (!currentQuestion.value || !currentQuestion.value.choices[choiceIndex]) {
    logger.log('No choice phoneme to play')
    return
  }

  isPlayingChoice.value = choiceIndex
  await playPhonemeSound(currentQuestion.value.choices[choiceIndex])
  isPlayingChoice.value = -1
}

// 統合された音声再生関数
const playPhonemeSound = async (phoneme) => {
  if (!phoneme || !phoneme.symbol) {
    logger.error('Invalid phoneme:', phoneme)
    return
  }

  stopAllAudio()
  isPlaying.value = true

  try {
    const audioFileName = NATIVE_AUDIO_MAPPING[phoneme.symbol] || `${phoneme.symbol}.m4a`
    const audioPath = `/sounds/${audioFileName}`
    
    logger.log(`Playing phoneme: ${phoneme.symbol}, path: ${audioPath}`)
    
    // 音声再生前に短い遅延を追加してクリック音との重複を避ける
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const audio = new Audio(audioPath)
    currentAudio.value = audio
    audio.volume = audioVolume.value / 100
    
    await new Promise((resolve, reject) => {
      let resolved = false
      
      audio.onended = () => {
        if (!resolved) {
          resolved = true
          isPlaying.value = false
          currentAudio.value = null
          resolve()
        }
      }
      
      audio.onerror = (e) => {
        if (!resolved) {
          resolved = true
          logger.error(`Failed to play audio: ${audioPath}`, e)
          isPlaying.value = false
          currentAudio.value = null
          resolve()
        }
      }
      
      audio.play().catch(err => {
        if (!resolved) {
          resolved = true
          logger.error('Audio play failed:', err)
          isPlaying.value = false
          currentAudio.value = null
          resolve()
        }
      })
      
      // Fallback timeout
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          isPlaying.value = false
          currentAudio.value = null
          resolve()
        }
      }, 3000)
    })
  } catch (error) {
    logger.error('Error playing phoneme:', error)
    isPlaying.value = false
    currentAudio.value = null
  }
}

const playCurrentPhoneme = async () => {
  if (!currentQuestion.value || isPlaying.value || gameState.value !== 'playing') {
    logger.log('playCurrentPhoneme: Early return - no question, already playing, or game not playing')
    return Promise.resolve()
  }
  
  isPlaying.value = true
  
  try {
    const phonemeSymbol = currentQuestion.value.target.symbol
    const audioFileName = NATIVE_AUDIO_MAPPING[phonemeSymbol] || currentQuestion.value.target.audioFile || `${phonemeSymbol}.m4a`
    const audioPath = `/sounds/${audioFileName}`
    
    logger.log('Playing target phoneme:', phonemeSymbol, 'from:', audioPath)
    
    stopAllAudio() // Stop any previous audio
    const audio = new Audio(audioPath)
    currentAudio.value = audio
    audio.volume = audioVolume.value / 100
    
    // Set up promise with timeout
    const playPromise = new Promise((resolve, reject) => {
      let resolved = false
      let timeoutId = null
      
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
          const index = audioTimeouts.value.indexOf(timeoutId)
          if (index > -1) {
            audioTimeouts.value.splice(index, 1)
          }
        }
      }
      
      audio.onended = () => {
        if (!resolved) {
          resolved = true
          cleanup()
          isPlaying.value = false
          currentAudio.value = null
          logger.log('Target phoneme finished playing')
          resolve()
        }
      }
      
      audio.onerror = (e) => {
        if (!resolved) {
          resolved = true
          cleanup()
          logger.error(`Failed to play audio: ${audioPath}`, e)
          isPlaying.value = false
          currentAudio.value = null
          handleGameError(e, 'audio')
          resolve() // Resolve instead of reject to continue game flow
        }
      }
      
      // Play audio
      audio.play().catch(err => {
        if (!resolved) {
          resolved = true
          cleanup()
          logger.error('Audio play failed:', err)
          isPlaying.value = false
          currentAudio.value = null
          handleGameError(err, 'audio')
          resolve()
        }
      })
      
      // Fallback timeout
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          isPlaying.value = false
          if (currentAudio.value === audio) {
            currentAudio.value = null
          }
          logger.log('Target phoneme timeout - forcing resolve')
          resolve()
        }
      }, 3000) // Increased timeout for slower connections
      audioTimeouts.value.push(timeoutId)
    })
    
    return await playPromise
    
  } catch (error) {
    logger.error('Error in playCurrentPhoneme:', error)
    handleGameError(error, 'audio')
    isPlaying.value = false
    currentAudio.value = null
    return Promise.resolve()
  }
}

const resetGame = () => {
  stopGameLoop()
  showIntro.value = true
  gameState.value = 'intro'
  currentQuestionIndex.value = 0
  isProcessingHit.value = false
  resetGameStats()
}

const advanceToNextStage = () => {
  const success = progressAdvanceStage()
  if (success) {
    resetGame()
  }
}

const applySettings = () => {
  updateCurrentPhonemes()
  showSettings.value = false
  if (gameState.value === 'playing') {
    stopGameLoop()
    startImprovedGameLoop()
  }
}


const getStageDescription = (stage) => {
  const descriptions = {
    // ジョリーフォニックス Group 1
    group1: 'Group 1 (s, a, t, i, p, n)',
    
    // ジョリーフォニックス Group 2  
    group2: 'Group 2 (c, k, e, h, r, m, d)',
    
    // ジョリーフォニックス Group 3
    group3: 'Group 3 (g, o, u, l, f, b)',
    
    // ジョリーフォニックス Group 4
    group4: 'Group 4 (ai, j, oa, ie, ee, or)',
    
    // ジョリーフォニックス Group 5
    group5: 'Group 5 (z, w, ng, v, oo, oo)',
    
    // ジョリーフォニックス Group 6
    group6: 'Group 6 (y, x, ch, sh, th, th)',
    
    // ジョリーフォニックス Group 7
    group7: 'Group 7 (qu, ou, oi, ue, er, ar)'
  }
  return descriptions[stage] || 'Unknown Stage'
}

const getLevelDescription = (level) => {
  const descriptions = {
    'phoneme': '単音素を聞いて正しい音を選択します（従来モード）',
    'word': 'ターゲット音素を含む単語を聞き分けます（レベルアップ版）'
  }
  return descriptions[level] || ''
}

const updatePracticeLevel = () => {
  logger.log(`Practice level changed to: ${practiceLevel.value}`)
  // Reset current question when level changes
  if (gameState.value === 'playing') {
    stopGameLoop()
    startImprovedGameLoop()
  }
}

// Helper functions for the new phase system
// 必須ヘルパー関数群
async function waitDelay(ms) {
  return new Promise(resolve => {
    const timeout = setTimeout(resolve, ms)
    audioTimeouts.value.push(timeout)
  })
}

function showTargetHighlight() {
  targetHighlight.value = true
  logger.log('Target highlighted')
}

// 古い重複関数を削除 - 新しい実装を使用

// 選択肢スタイル取得
const getChoiceStyle = (index) => {
  const highlight = cubeHighlights.value.get(`choice-${index}`)
  if (highlight) {
    return {
      backgroundColor: highlight.color + '44',
      borderColor: highlight.color,
      boxShadow: `0 0 15px ${highlight.color}`
    }
  }
  return {}
}

async function playTargetPhonemeWithHighlight() {
  if (practiceLevel.value === 'word') {
    currentAudioDescription.value = `ターゲット音素「${currentQuestion.value.target.symbol}」を含む単語を見つけてください`
    await playCurrentPhoneme() // Still play the target phoneme sound
  } else {
    currentAudioDescription.value = `ターゲット音: ${currentQuestion.value.target.symbol}`
    await playCurrentPhoneme()
  }
  currentAudioDescription.value = ''
}

// 古い重複関数を削除 - 新しい実装を使用

// 1. リスニング用: キューブを遠くに配置（動かない）
function positionCubesForListening() {
  logger.log('Positioning cubes for listening phase')
  
  if (!currentQuestion.value || !currentQuestion.value.choices) {
    logger.error('No current question for positioning cubes')
    return
  }
  
  const lanes = [1, 2, 3]
  const choicesInOrder = currentQuestion.value.choices
  
  // キューブを生成してを遠くに固定配置
  activeCubes.value = [] // Clear existing
  
  choicesInOrder.forEach((phoneme, index) => {
    if (index < 3) {
      const cube = {
        id: cubeIdCounter.value++,
        phoneme: phoneme,
        choice: phoneme, // Add choice data for display
        lane: lanes[index],
        laneNumber: index + 1,
        isCorrect: practiceLevel.value === 'word' ? 
          (phoneme.hasTarget === true) : 
          (phoneme.symbol === currentQuestion.value.target.symbol),
        progress: 0,
        inSlowZone: false,
        style: {
          left: `${5 + (lanes[index] - 1) * 30}%`,
          transform: 'scale(1)',
          opacity: 1,
          transition: 'all 0.3s ease' // スムーズなハイライト用
        },
        spawnTime: Date.now(),
        isListening: true, // リスニングモードフラグ
        isRushing: false
      }
      
      activeCubes.value.push(cube)
    }
  })
}

// Simplified - no cube movement needed

// 3. 高速移動アニメーション
function startCubeRushAnimation() {
  logger.log('Starting cube rush animation')
  
  const rushDuration = difficultySettings.value.cubeSpeed // 3000ms
  
  activeCubes.value.forEach(cube => {
    if (cube.isRushing) {
      // CSS animationで高速移動
      cube.style = {
        ...cube.style,
        animation: `cube-rush-approach ${rushDuration}ms ease-out forwards`
      }
    }
  })
  
  // ビジュアル更新ループ開始
  gameLoopId.value = setInterval(() => {
    updateRushingCubes()
  }, 16) // 60 FPS
}

// 新しいキューブ更新システム（アクションフェーズのみ）
function updateRushingCubes() {
  if (gamePhase.value !== GAME_PHASES.ACTION) {
    return // アクションフェーズ以外は更新しない
  }
  
  // キューブは静止したままなので、アニメーションや位置更新は不要
  // フェードインのみ管理
  activeCubes.value.forEach(cube => {
    if (cube.opacity < 1) {
      cube.style.opacity = Math.min(cube.opacity + 0.05, 1)
      cube.opacity = cube.style.opacity
    }
  })
}

const playChoiceMemoryAid = async (phoneme) => {
  if (!phoneme || isPlaying.value) return
  
  const audioFileName = NATIVE_AUDIO_MAPPING[phoneme.symbol] || phoneme.audioFile || `${phoneme.symbol}.m4a`
  const audioPath = `/sounds/${audioFileName}`
  
  try {
    const audio = new Audio(audioPath)
    audio.volume = (audioVolume.value / 100) * 0.3 // Low volume
    audio.play()
  } catch (error) {
    logger.log('Memory aid audio failed:', error)
  }
}

const getCubeStyle = (cube) => {
  return cube.style
}

const getCubeHighlightStyle = (cube) => {
  const cubeIndex = cube.laneNumber - 1
  
  // 音が流れているキューブをハイライト（最優先）
  if (isPlayingChoice.value === cubeIndex) {
    return {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(255, 140, 0, 0.95))',
      boxShadow: '0 0 80px rgba(255, 215, 0, 1), inset 0 0 40px rgba(255, 215, 0, 0.7)',
      transform: 'scale(1.15)',
      border: '3px solid #FFD700'
    }
  }
  
  // 選択肢ハイライト（中優先）
  if (cubeHighlights.value.has(cubeIndex)) {
    const highlight = cubeHighlights.value.get(cubeIndex)
    const color = highlight.color
    const rgbColor = hexToRgb(color)
    return {
      background: `linear-gradient(135deg, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.8), rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.6))`,
      boxShadow: `0 0 60px ${color}, inset 0 0 30px rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5)`,
      transform: 'scale(1.1)',
      border: `2px solid ${color}`
    }
  }
  
  // ホバー効果（低優先）
  if (cube.isHovered) {
    return {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
      boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
      transform: 'scale(1.05)'
    }
  }
  
  return {}
}

const getCubeGlowStyle = (cube) => {
  // 音が流れているキューブのグロー効果（統一色）
  if (cube.isPlaying) {
    return {
      background: 'rgba(0, 255, 255, 1)',
      filter: 'blur(30px)',
      opacity: 1,
      animation: 'glow-pulse 0.5s ease-in-out infinite'
    }
  }
  return {}
}

// 次の問題への移行
const transitionToNextQuestion = async () => {
  logger.log('Transitioning to next question')
  
  // Check if we've reached the question limit
  if (currentQuestionIndex.value >= totalQuestions.value) {
    logger.log('Reached question limit, completing game')
    gameState.value = 'complete'
    gamePhase.value = GAME_PHASES.COMPLETE
    await handleGameCompletion()
    return
  }
  
  // ゲームループ停止
  if (gameLoopId.value) {
    clearInterval(gameLoopId.value)
    gameLoopId.value = null
  }
  
  // 状態リセット
  hasStartedQuestion.value = false
  activeCubes.value = []
  clearAllHighlights()
  isProcessingHit.value = false // Reset hit processing flag
  
  // 次の問題読み込み
  loadNextQuestion()
  
  // Very short pause for smooth transition
  await waitDelay(100)
}

// Error recovery function
const handleGameError = (err, context = '') => {
  logger.error(`Game error in ${context}:`, err)
  
  // Stop any ongoing processes
  stopAllAudio()
  stopGameLoop()
  
  // Show user-friendly error message
  if (context === 'audio') {
    error.value = '音声ファイルの読み込みに失敗しました。ページを再読み込みしてください。'
  } else if (context === 'data') {
    error.value = '音素データの読み込みに失敗しました。'
  } else {
    error.value = 'エラーが発生しました。ゲームを再開始してください。'
  }
  
  gameState.value = 'intro'
}

const handleBack = () => {
  logger.log('🔙 戻るボタンがクリックされました')
  try {
    stopGameLoop()
    // フォニックス・アドベンチャーの基礎音素トレーニング画面に戻る
    router.push({
      name: 'PhonicsAdventure',
      query: { mode: 'basic' }
    })
  } catch (error) {
    logger.error('戻るボタンエラー:', error)
  }
}

const handleSettingsClick = () => {
  logger.log('⚙️ 設定ボタンがクリックされました')
  try {
    showSettings.value = true
  } catch (error) {
    logger.error('設定ボタンエラー:', error)
  }
}

const handleQuestionCountSelect = (count) => {
  logger.log(`🔢 問題数選択: ${count}問`)
  try {
    totalQuestions.value = count
    logger.log(`問題数が${count}に設定されました`)
  } catch (error) {
    logger.error('問題数選択エラー:', error)
  }
}

// Lifecycle
onMounted(() => {
  logger.log('PureSoundLabBeatSaber mounted')
  logger.log('Available stages from usePhonemeProgress:', availableStages.value)
  logger.log('Current phoneme stage:', currentPhonemeStage.value)
  
  updateCurrentPhonemes()
  initializePhonemeData()
})

onUnmounted(() => {
  logger.log('Component unmounting - cleaning up resources')
  // Stop all game loops and timers
  stopGameLoop()
  
  // Clear any remaining timeouts
  audioTimeouts.value.forEach(timeout => clearTimeout(timeout))
  audioTimeouts.value = []
  
  // Clean up audio resources
  stopAllAudio()
  
  // Reset all game state
  gameState.value = 'intro'
  currentQuestion.value = null
  activeCubes.value = []
  hitEffects.value = []
  hasStartedQuestion.value = false
})

// Watchers
watch(difficultyLevel, () => {
  if (gameState.value === 'playing') {
    stopGameLoop()
    startGameLoop()
  }
})

// VR Academy Integration Functions
const recordPhonemeSkill = (phoneme, isCorrect, responseTime = 1000) => {
  const existingSkill = phonemeSkillsData.value.find(skill => skill.phoneme === phoneme)
  
  if (existingSkill) {
    existingSkill.attempts++
    if (isCorrect) existingSkill.successes++
    existingSkill.totalResponseTime += responseTime
    existingSkill.accuracy = (existingSkill.successes / existingSkill.attempts) * 100
    existingSkill.responseTime = existingSkill.totalResponseTime / existingSkill.attempts
  } else {
    phonemeSkillsData.value.push({
      phoneme,
      accuracy: isCorrect ? 100 : 0,
      responseTime,
      attempts: 1,
      successes: isCorrect ? 1 : 0,
      difficulty: 'beginner',
      totalResponseTime: responseTime,
      vrSkillMapping: getVRSkillMapping(phoneme)
    })
  }
}

const recordMistake = (phoneme, expectedResponse, actualResponse, context) => {
  mistakesData.value.push({
    phoneme,
    expectedResponse,
    actualResponse,
    timestamp: Date.now() - gameStartTime.value.getTime(),
    context,
    vrScenarioRelevance: getVRScenarioRelevance(phoneme)
  })
}

const getVRSkillMapping = (phoneme) => {
  const mapping = {
    'r': ['restaurant_ordering', 'pronunciation_practice'],
    'l': ['restaurant_ordering', 'casual_conversation'],
    'th': ['business_meeting', 'presentation_skills'],
    'w': ['casual_conversation', 'restaurant_ordering'],
    'v': ['airport_checkin', 'travel_english'],
    'f': ['airport_checkin', 'formal_communication']
  }
  return mapping[phoneme] || ['general_pronunciation']
}

const getVRScenarioRelevance = (phoneme) => {
  const relevance = {
    'r': 'restaurant_ordering',
    'l': 'casual_conversation',
    'th': 'business_meeting',
    'w': 'casual_conversation',
    'v': 'airport_checkin',
    'f': 'formal_communication'
  }
  return relevance[phoneme] || 'general_practice'
}

const calculateCrystalReward = () => {
  // Base reward matching the hub display (50 crystals)
  const baseReward = 30
  const accuracyBonus = Math.floor(accuracy.value * 0.15) // Up to 15 crystals for 100% accuracy
  const comboBonus = Math.floor(maxCombo.value * 0.2) // Combo bonus
  const completionBonus = lives.value > 0 ? 10 : 5 // Completion bonus
  
  // Ensure minimum 50 crystals for perfect play, scale down for poor performance
  const total = baseReward + accuracyBonus + comboBonus + completionBonus
  return Math.max(total, Math.floor(total * (accuracy.value / 100)))
}

const calculateVRReadinessGain = () => {
  const baseGain = 5
  const accuracyGain = Math.floor(accuracy.value * 0.1)
  const skillDiversityGain = Math.min(phonemeSkillsData.value.length * 2, 10)
  
  return Math.min(baseGain + accuracyGain + skillDiversityGain, 25)
}

const handleGameCompletion = async () => {
  try {
    logger.log('Game completion started')
    gameEndTime.value = new Date()
    const gameDuration = gameEndTime.value.getTime() - gameStartTime.value.getTime()
    
    // Calculate rewards
    const crystalReward = calculateCrystalReward()
    const vrReadinessGain = calculateVRReadinessGain()
    
    // Build VR game result
    const resultBuilder = new VRGameResultBuilder('pureSoundLabBeatSaber', 'ピュア・サウンド・ラボ')
      .setBasicStats(score.value, accuracy.value, gameDuration)
      .setVRReadinessGain(vrReadinessGain)
      .setCrystalReward(crystalReward)
    
    // Add phoneme skills
    phonemeSkillsData.value.forEach(skill => {
      resultBuilder.addPhonemeSkill(
        skill.phoneme,
        skill.accuracy,
        skill.responseTime,
        skill.attempts,
        skill.successes,
        skill.difficulty
      )
    })
    
    // Add mistakes
    mistakesData.value.forEach(mistake => {
      resultBuilder.addMistake(
        mistake.phoneme,
        mistake.expectedResponse,
        mistake.actualResponse,
        mistake.timestamp,
        mistake.context
      )
    })
    
    // Add completed challenges
    const completedChallenges = []
    if (accuracy.value >= 90) completedChallenges.push('perfect_accuracy')
    if (maxCombo.value >= 10) completedChallenges.push('combo_master')
    if (lives.value === 3) completedChallenges.push('no_damage')
    if (phonemeSkillsData.value.length >= 5) completedChallenges.push('skill_diversity')
    
    completedChallenges.forEach(challenge => {
      resultBuilder.addCompletedChallenge(challenge)
    })
    
    vrGameResult.value = resultBuilder.build()
    
    // Update stores
    try {
      // Record game score in progress store
      if (progressStore.recordGameScore && typeof progressStore.recordGameScore === 'function') {
        progressStore.recordGameScore({
          gameType: 'pure-sound-lab',
          score: score.value,
          accuracy: accuracy.value,
          timeSpent: Math.round(gameDuration / 1000), // Convert to seconds
          level: 1,
          correctAnswers: correctHits.value,
          totalQuestions: currentQuestionIndex.value,
          levelCompleted: lives.value > 0 // Only completed if they didn't lose all lives
        })
        logger.log('Progress recorded successfully')
      } else {
        logger.warn('progressStore.recordGameScore is not available')
      }
      
      // Award sound crystals for this phonics game
      if (playerStore.addCrystals && typeof playerStore.addCrystals === 'function') {
        playerStore.addCrystals({ sound: crystalReward })
        logger.log(`Awarded ${crystalReward} sound crystals`)
      } else {
        logger.warn('playerStore.addCrystals is not available')
      }
      
      // Update VR readiness
      if (playerStore.updateVRReadiness && typeof playerStore.updateVRReadiness === 'function') {
        playerStore.updateVRReadiness(vrReadinessGain)
        logger.log('VR readiness updated')
      } else {
        logger.warn('playerStore.updateVRReadiness is not available')
      }
      
      // Update phonics skill progress
      if (playerStore.updateSkill && typeof playerStore.updateSkill === 'function') {
        const skillGain = Math.max(1, Math.round(accuracy.value / 10)) // 1-10 skill points based on accuracy
        playerStore.updateSkill('phonics', skillGain)
        logger.log(`Phonics skill increased by ${skillGain} points`)
      }
      
    } catch (storeError) {
      logger.warn('Error updating stores:', storeError)
    }
    
    // Show unified result screen
    showUnifiedResult.value = true
    logger.log('Game completion finished successfully')
    
    // Sync to VR Academy
    setTimeout(async () => {
      try {
        if (vrDataSync && vrDataSync.syncGameResult) {
          await vrDataSync.syncGameResult(vrGameResult.value)
        }
      } catch (syncError) {
        logger.warn('VR sync error (non-critical):', syncError)
      }
    }, 1000)
    
  } catch (error) {
    logger.error('Error in game completion:', error)
    // Still show the result screen even if there are errors
    showUnifiedResult.value = true
  }
}

// Result screen handlers
const handlePlayAgain = () => {
  showUnifiedResult.value = false
  showVRSuggestion.value = false
  showIntro.value = true
  gameState.value = 'intro'
  resetGameStats()
}

const handleBackToHub = () => {
  router.push({ name: 'SoundAdventureHub' })
}

// 詳細統計機能を削除 - 未実装のため

const handleStartVRScenario = (scenario) => {
  logger.log('Start VR scenario:', scenario)
  router.push({ 
    name: 'vr-scenario-preview', 
    params: { scenarioId: scenario.id }
  })
}

const handlePlayRecommendedGame = (gameName) => {
  // Navigate to recommended game
  const gameRoutes = {
    'サウンド・バトル・アリーナ': 'sound-battle-arena',
    'リズム・フォニックス・ダンス': 'rhythm-phonics-dance'
  }
  
  const routeName = gameRoutes[gameName]
  if (routeName) {
    router.push({ name: routeName })
  }
}

const handleViewVRReport = () => {
  router.push({ name: 'vr-readiness-report' })
}

const handleExploreVR = () => {
  showVRSuggestion.value = true
}
</script>

<style scoped>
.phoneme-saber-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'Orbitron', 'Courier New', monospace;
  user-select: none;
}

/* Beat Saber Style Background */
.phoneme-saber-stage {
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 60%, #0f0f23 100%);
  perspective: 1000px;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

/* Grid Floor */
.grid-floor {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) rotateX(75deg);
  width: 200vw;
  height: 200vw;
  background-image: 
    linear-gradient(cyan 1px, transparent 1px),
    linear-gradient(90deg, cyan 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: grid-flow 8s linear infinite;
}

@keyframes grid-flow {
  0% { transform: translateX(-50%) rotateX(75deg) translateZ(0); }
  100% { transform: translateX(-50%) rotateX(75deg) translateZ(50px); }
}

/* Space Background */
.space-background {
  position: absolute;
  inset: 0;
  z-index: -2;
}

.stars-field {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: star-twinkle 3s ease-in-out infinite;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

.nebula-clouds {
  position: absolute;
  inset: 0;
}

.nebula-cloud {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  animation: nebula-drift 20s ease-in-out infinite;
}

@keyframes nebula-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
  50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
}

/* Neon Rings */
.neon-rings {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.neon-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80vw;
  height: 80vw;
  transform: translateX(-50%) translateY(-50%);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: ring-approach 4s linear infinite;
}

@keyframes ring-approach {
  0% { 
    transform: translateX(-50%) translateY(-50%) translateZ(-2000px) scale(0.1);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 0.8; }
  100% { 
    transform: translateX(-50%) translateY(-50%) translateZ(200px) scale(2);
    opacity: 0;
  }
}

/* Energy Streams */
.energy-streams {
  position: absolute;
  inset: 0;
}

.energy-stream {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent, 
    rgba(0, 255, 255, 0.5), 
    transparent
  );
  animation: stream-flow 6s linear infinite;
}

@keyframes stream-flow {
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}

/* HUD Interface */
.hud-interface {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.hud-interface * {
  pointer-events: auto;
}

.top-hud {
  position: relative;
  z-index: 1002;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  pointer-events: auto;
}

.hud-button {
  position: relative;
  z-index: 1000 !important;
  background: rgba(0, 255, 255, 0.3);
  border: 2px solid rgba(0, 255, 255, 0.8);
  color: cyan;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-transform: uppercase;
  pointer-events: auto;
  /* デバッグ用: より見やすくする */
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  min-width: 80px;
  min-height: 36px;
}

.hud-button:hover {
  background: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.hud-button:active {
  background: rgba(0, 255, 255, 0.6);
  transform: scale(0.95);
}

.score-display, .combo-display, .lives-display {
  text-align: center;
  color: white;
}

.score-value, .combo-value {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 
    0 0 3px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(0, 255, 255, 0.6),
    0 1px 2px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.4);
}

.score-label, .combo-label, .lives-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  margin-top: 4px;
}

.combo-display {
  transition: all 0.3s ease;
}

.combo-display.combo-active {
  color: #ffff00;
  transform: scale(1.1);
}

.lives-hearts {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin-bottom: 4px;
}

.heart {
  font-size: 20px;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.heart.active {
  opacity: 1;
  filter: drop-shadow(0 0 5px #00ffff);
}

.progress-hud {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 10px;
  width: 100%;
}

.progress-container {
  width: 400px;
  max-width: 80%;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #00ff7f);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px currentColor;
}

.progress-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* Game Stage Area */
.game-stage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

/* Intro Screen */
.intro-screen {
  position: relative;
  z-index: 100;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 40px;
  width: 100%;
  min-height: auto;
  overflow-y: visible;
}

.game-logo {
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.logo-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: gradient-flow 3s ease infinite;
  margin-bottom: 10px;
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.logo-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
}

.intro-description {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.description-card {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
}

.description-card h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 18px;
}

.description-card p, .description-card li {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.description-card ul {
  margin: 0;
  padding-left: 20px;
}

.start-game-button {
  position: relative;
  z-index: 1000 !important;
  background: linear-gradient(135deg, #00ffff, #ff00ff);
  border: none;
  color: white;
  padding: 16px 32px;
  font-size: 20px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease;
  pointer-events: auto;
}

.start-game-button:hover {
  transform: scale(1.05);
}

/* Question Count Selector */
.question-count-selector {
  position: relative;
  z-index: 15;
  margin: 30px 0;
  text-align: center;
  pointer-events: auto;
  user-select: none;
}

.question-count-selector h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.question-count-options {
  position: relative;
  z-index: 18;
  display: flex;
  gap: 15px;
  justify-content: center;
  pointer-events: auto;
}

.count-option {
  position: relative;
  z-index: 1000 !important;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: auto;
  /* デバッグ用視覚化 */
  min-width: 60px;
  min-height: 40px;
}

.count-option:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.count-option.active {
  background: linear-gradient(135deg, #00ffff, #00ff7f);
  color: #000;
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.count-option:active {
  transform: scale(0.95);
  background: rgba(0, 255, 255, 0.4);
}

.button-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: button-scan 2s linear infinite;
}

@keyframes button-scan {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

.button-text {
  position: relative;
  z-index: 1;
}

/* Loading Screen */
.loading-screen {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 255, 255, 0.3);
  border-top: 4px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

/* Error Screen */
.error-screen {
  text-align: center;
  color: white;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  color: #ff4444;
  margin-bottom: 15px;
}

.error-message {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.retry-button {
  background: rgba(255, 68, 68, 0.2);
  border: 2px solid #ff4444;
  color: #ff4444;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(255, 68, 68, 0.4);
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

/* Beat Saber Game */
.beat-saber-game {
  position: relative;
  width: 100%;
  height: 100%;
}

.target-sound-display {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(255, 215, 0, 0.8);
  border-radius: 12px;
  padding: 20px;
  color: white;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  min-width: 800px;
  transition: all 0.3s ease;
}

.target-sound-display.playing-target {
  background: rgba(255, 215, 0, 0.2);
  border-color: #fff;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
  transform: translateX(-50%) scale(1.05);
}

.target-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.choices-display {
  border-top: 1px solid rgba(255, 215, 0, 0.3);
  padding-top: 15px;
}

.choices-label {
  font-size: 16px;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 10px;
  text-align: center;
}

.choices-grid {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.choice-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  min-width: 80px;
}

.choice-item.playing {
  transform: scale(1.1);
  animation: choice-pulse 0.8s ease-in-out infinite alternate;
}

.choice-item.played {
  opacity: 0.6;
}

@keyframes choice-pulse {
  0% { transform: scale(1.1); }
  100% { transform: scale(1.15); }
}

.choice-number {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.choice-symbol {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.target-phoneme {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  background: rgba(255, 215, 0, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.sound-icon {
  font-size: 24px;
}

.sound-label {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sound-play-button {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  border: none;
  color: #000;
  /* 効果音を無効化 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.sound-play-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.sound-play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.instruction-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-top: 8px;
  text-align: center;
}

/* Three Lane System */
.three-lane-system {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.lane-lines {
  position: absolute;
  inset: 0;
}

.lane-line {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0, 255, 255, 0.3) 20%, 
    rgba(0, 255, 255, 0.6) 80%, 
    transparent 100%
  );
  transform: translateX(-50%);
}

/* Hit Zone */
.hit-zone {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  border: 3px solid rgba(255, 255, 0, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 0, 0.1);
  box-shadow: 
    0 0 30px rgba(255, 255, 0, 0.5),
    inset 0 0 30px rgba(255, 255, 0, 0.2);
  animation: hit-zone-pulse 2s ease-in-out infinite;
}

@keyframes hit-zone-pulse {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 255, 0, 0.5), inset 0 0 30px rgba(255, 255, 0, 0.2); }
  50% { box-shadow: 0 0 50px rgba(255, 255, 0, 0.8), inset 0 0 50px rgba(255, 255, 0, 0.4); }
}

.crosshair {
  position: relative;
  width: 40px;
  height: 40px;
}

.crosshair-h, .crosshair-v {
  position: absolute;
  background: rgba(255, 255, 0, 0.8);
  border-radius: 2px;
}

.crosshair-h {
  width: 40px;
  height: 4px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.crosshair-v {
  width: 4px;
  height: 40px;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

/* Phoneme Cubes */
.phoneme-cubes-container {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.phoneme-cube {
  position: absolute;
  bottom: 20%;
  width: 200px;
  height: 200px;
  transform-origin: center center;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
  z-index: 15;
  pointer-events: auto;
  /* クリック範囲を拡張 */
  padding: 10px;
  margin: -10px;
}

.phoneme-cube:hover {
  transform: scale(1.15) !important;
  box-shadow: 0 0 40px rgba(0, 255, 255, 1);
}

.phoneme-cube.lane-1 { left: 5%; z-index: 10; }
.phoneme-cube.lane-2 { left: 35%; z-index: 10; }
.phoneme-cube.lane-3 { left: 65%; z-index: 10; }

.phoneme-cube.playing-sound .cube-inner {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.9), rgba(255, 140, 0, 0.9)) !important;
  box-shadow: 0 0 50px rgba(255, 215, 0, 1) !important;
  animation: sound-pulse 0.5s ease-in-out infinite;
}

.phoneme-cube.cube-clickable {
  cursor: pointer;
  pointer-events: auto;
  /* 効果音を無効化 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
}

.phoneme-cube:not(.cube-clickable) {
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}

/* 選択肢ハイライト状態 */
.phoneme-cube.cube-highlighted .cube-inner {
  animation: choice-highlight-pulse 1s ease-in-out infinite;
}

@keyframes choice-highlight-pulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 255, 255, 0.9);
    transform: scale(1.05);
  }
}

@keyframes sound-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.cube-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  transition: all 0.3s ease;
}

.cube-sound-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
}

.cube-sound-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.cube-sound-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.phoneme-cube .cube-inner {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.9), rgba(0, 150, 255, 0.9));
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
}

.cube-number {
  color: white;
  font-size: 60px;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  z-index: 2;
  margin-bottom: 10px;
}

/* Word-level practice styles */
.cube-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  z-index: 2;
}

.cube-word-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cube-word {
  color: white;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.cube-japanese {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: normal;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.cube-phoneme-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cube-symbol {
  color: white;
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
  z-index: 2;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px 15px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cube-glow {
  position: absolute;
  inset: -4px;
  background: inherit;
  border-radius: inherit;
  filter: blur(8px);
  opacity: 0.7;
  z-index: -1;
}

/* Hit Effects */
.hit-effects-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hit-effect {
  position: absolute;
  transform: translateX(-50%) translateY(-50%);
  animation: hit-effect-animation 2s ease-out forwards;
}

.hit-effect.correct .effect-text {
  color: #00ff7f;
  text-shadow: 0 0 10px #00ff7f;
}

.hit-effect.incorrect .effect-text, .hit-effect.miss .effect-text {
  color: #ff4444;
  text-shadow: 0 0 10px #ff4444;
}

.hit-effect.click {
  animation: click-effect-animation 0.5s ease-out forwards;
}

.hit-effect.click .effect-text {
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  font-size: 20px;
}

@keyframes click-effect-animation {
  0% { 
    transform: translateX(-50%) translateY(-50%) scale(0.5); 
    opacity: 1; 
  }
  100% { 
    transform: translateX(-50%) translateY(-50%) scale(1.5); 
    opacity: 0; 
  }
}

.effect-text {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.effect-particles {
  position: relative;
  width: 1px;
  height: 1px;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  animation: particle-explosion 1s ease-out forwards;
}

@keyframes hit-effect-animation {
  0% { transform: translateX(-50%) translateY(-50%) scale(0); opacity: 1; }
  20% { transform: translateX(-50%) translateY(-50%) scale(1.2); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-50%) scale(1) translateY(-50px); opacity: 0; }
}

@keyframes particle-explosion {
  0% { transform: scale(0) translateX(0) translateY(0); opacity: 1; }
  100% { transform: scale(1) translateX(var(--particle-x, 0)) translateY(var(--particle-y, 0)); opacity: 0; }
}

/* Performance Indicators */
.performance-indicators {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}

.accuracy-indicator {
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 0 15px currentColor;
  animation: accuracy-appear 1s ease-out;
}

.accuracy-indicator.perfect { color: #00ffff; }
.accuracy-indicator.great { color: #00ff7f; }
.accuracy-indicator.good { color: #ffff00; }
.accuracy-indicator.ok { color: #ffa500; }
.accuracy-indicator.wrong { color: #ff4444; }

@keyframes accuracy-appear {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Feedback Screen */
.feedback-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.feedback-content {
  text-align: center;
  color: white;
  padding: 40px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid;
  animation: feedback-appear 0.5s ease-out;
}

.feedback-content.correct {
  border-color: #00ff7f;
  box-shadow: 0 0 30px rgba(0, 255, 127, 0.5);
}

.feedback-content.incorrect {
  border-color: #ff4444;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
}

.feedback-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.feedback-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 15px;
}

.feedback-message {
  font-size: 18px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.score-gained {
  font-size: 24px;
  font-weight: bold;
  color: #ffff00;
  text-shadow: 0 0 10px #ffff00;
}

@keyframes feedback-appear {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Game Complete Screen */
.complete-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.complete-content {
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 40px;
}

.complete-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: trophy-glow 2s ease-in-out infinite alternate;
}

@keyframes trophy-glow {
  0% { filter: drop-shadow(0 0 10px #ffff00); }
  100% { filter: drop-shadow(0 0 30px #ffff00); }
}

.complete-title {
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(45deg, #ffff00, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 40px;
}

.final-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-item {
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.complete-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-button {
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.action-button.primary {
  background: linear-gradient(135deg, #00ffff, #00ff7f);
  color: #000;
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

/* Settings Modal */
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  color: white;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.close-button {
  background: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 0, 0, 0.3);
  border-color: #ff0000;
}

.setting-group {
  margin-bottom: 25px;
}

.setting-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #00ffff;
}

.setting-select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 14px;
}

.setting-slider {
  width: calc(100% - 60px);
  margin-right: 10px;
}

.volume-display {
  color: #00ffff;
  font-weight: bold;
  min-width: 40px;
  display: inline-block;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button.primary {
  background: linear-gradient(135deg, #00ffff, #00ff7f);
  color: #000;
}

.modal-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.modal-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
}

/* Game Instructions */
.game-instructions {
  position: fixed;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.6);
  border-radius: 15px;
  padding: 15px 25px;
  backdrop-filter: blur(10px);
  z-index: 50;
  transition: all 0.3s ease;
}

.instruction-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  font-weight: bold;
  font-size: 16px;
}

.pre-game-hint {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gameplay-hint {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hint-icon {
  font-size: 20px;
}

.hint-text {
  color: #00ffff;
}

/* Responsive Design */
@media (max-width: 768px) {
  .intro-description {
    grid-template-columns: 1fr;
  }
  
  .final-stats {
    grid-template-columns: 1fr;
  }
  
  .top-hud {
    padding: 10px;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .hud-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .score-value, .combo-value {
    font-size: 18px;
  }
  
  .phoneme-cube {
    width: 150px;
    height: 150px;
  }
  
  .phoneme-symbol {
    font-size: 18px;
  }
  
  .hit-zone {
    width: 150px;
    height: 150px;
  }
}

/* Performance Optimizations */
* {
  box-sizing: border-box;
}

.phoneme-cube, .hit-effect, .particle {
  will-change: transform, opacity;
}

.neon-ring, .energy-stream {
  will-change: transform;
}

/* Phase Indicator */
.phase-indicator {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid;
  border-radius: 15px;
  padding: 15px 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 500px;
  text-align: center;
}

.current-audio-info {
  margin-top: 8px;
  font-size: 14px;
  color: #FFD700;
  font-weight: bold;
  animation: audio-pulse 1s ease-in-out infinite alternate;
}

@keyframes audio-pulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

.phase-indicator.listening {
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.phase-indicator.action {
  border-color: #FF6B6B;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  animation: action-pulse 0.8s ease-in-out infinite alternate;
}

.phase-indicator.feedback {
  border-color: #50E3C2;
  box-shadow: 0 0 20px rgba(80, 227, 194, 0.5);
}

@keyframes action-pulse {
  0% { transform: translateX(-50%) scale(1); }
  100% { transform: translateX(-50%) scale(1.05); }
}

.phase-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.phase-icon {
  font-size: 24px;
}

.phase-timer {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 14px;
  font-family: monospace;
}

/* Countdown Display */
.countdown-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 300;
  text-align: center;
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid #FFD700;
  border-radius: 20px;
  padding: 30px 50px;
  backdrop-filter: blur(15px);
  animation: countdown-appear 0.3s ease-out;
}

@keyframes countdown-appear {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.countdown-number {
  font-size: 72px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 0 0 20px #FFD700;
  margin-bottom: 10px;
  animation: countdown-pulse 0.6s ease-in-out infinite alternate;
}

@keyframes countdown-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.countdown-text {
  font-size: 20px;
  color: white;
  font-weight: bold;
}

/* Slow Motion Zone */
.slow-motion-zone {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    to top,
    rgba(255, 255, 0, 0.1) 0%,
    transparent 100%
  );
  border-top: 2px solid rgba(255, 255, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.slow-motion-zone.active {
  opacity: 1;
  border-top-color: rgba(255, 255, 0, 0.8);
  animation: slow-zone-glow 1s ease-in-out infinite alternate;
}

@keyframes slow-zone-glow {
  0% { box-shadow: inset 0 0 20px rgba(255, 255, 0, 0.2); }
  100% { box-shadow: inset 0 0 40px rgba(255, 255, 0, 0.4); }
}

.zone-label {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 0, 0.2);
  color: #FFD700;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Enhanced Cube Styles */
.phoneme-cube.highlighted {
  animation: cube-highlight-pulse 1s ease-in-out infinite;
}

@keyframes cube-highlight-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.phoneme-cube.in-slow-zone {
  animation-duration: 2s !important;
  filter: brightness(1.2);
}

.target-sound-display.highlight-target {
  animation: target-highlight 2s ease-in-out infinite;
}

@keyframes target-highlight {
  0%, 100% { border-color: rgba(255, 215, 0, 0.8); }
  50% { border-color: rgba(255, 215, 0, 1); box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
}

/* Phase-specific Instructions */
.phase-hint {
  padding: 12px 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.phase-hint.listening {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #FFD700;
}

.phase-hint.action {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  color: #FF6B6B;
  animation: action-hint-glow 1s ease-in-out infinite alternate;
}

@keyframes action-hint-glow {
  0% { border-color: rgba(255, 107, 107, 0.3); }
  100% { border-color: rgba(255, 107, 107, 0.8); }
}

@keyframes glow-pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

/* 必須CSS追加 */
@keyframes cube-rush-approach {
  0% { 
    transform: scale(0.8);
    opacity: 0;
  }
  50% { 
    transform: scale(1);
    opacity: 1;
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}

.phoneme-cube.listening-highlight {
  box-shadow: 0 0 30px var(--highlight-color);
  border-color: var(--highlight-color);
  transform: scale(1.1) !important;
}

.target-sound-display.target-highlight {
  border-color: #FFD700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  animation: target-pulse 1s ease-in-out;
}

@keyframes target-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>