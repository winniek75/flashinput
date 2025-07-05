<template>
  <div class="true-sound-impact">
    <!-- Clean Background -->
    <div class="learning-background">
      <div class="focus-stars"></div>
    </div>

    <!-- Minimal Header -->
    <div class="game-header">
      <button @click="$emit('back')" class="minimal-button back-button">
        <Icon name="arrow-left" class="w-4 h-4" />
      </button>
      <h1 class="stage-title">{{ currentStage?.name || 'True Sound Impact' }}</h1>
      <div class="progress-indicator">
        {{ sessionProgress.current }}/{{ sessionProgress.total }}
      </div>
    </div>

    <!-- Stage Selection Screen -->
    <div v-if="gameState === 'stageSelection'" class="stage-selection">
      <div class="learning-card">
        <div class="card-header">
          <div class="icon">🎯</div>
          <h2>音韻認識練習</h2>
          <p class="subtitle">純粋な音から文字への学習</p>
        </div>

        <div class="stages-grid">
          <button
            v-for="(stage, stageId) in availableStages"
            :key="stageId"
            @click="selectStage(stageId)"
            :class="['stage-card', { 
              'locked': !stage.unlocked,
              'completed': stage.completed,
              'current': selectedStageId === stageId
            }]"
            :disabled="!stage.unlocked"
          >
            <div class="stage-icon">{{ stage.icon }}</div>
            <div class="stage-info">
              <div class="stage-name">{{ stage.name }}</div>
              <div class="stage-description">{{ stage.description }}</div>
              <div class="stage-progress" v-if="stage.unlocked">
                <div class="progress-text">
                  {{ Math.round(stage.overallAccuracy * 100) }}% 習得
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: stage.overallAccuracy * 100 + '%' }"
                  ></div>
                </div>
              </div>
              <div class="lock-indicator" v-else>
                🔒 前段階の完了が必要
              </div>
            </div>
          </button>
        </div>

        <div class="learning-stats" v-if="learningStats.totalAttempts > 0">
          <h3>学習統計</h3>
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-number">{{ Math.round(learningStats.overallAccuracy * 100) }}%</div>
              <div class="stat-label">総合正解率</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ learningStats.totalSessions }}</div>
              <div class="stat-label">完了セッション</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ learningStats.masteredPhonemes }}</div>
              <div class="stat-label">習得音素</div>
            </div>
          </div>
        </div>

        <button 
          @click="startSession" 
          :disabled="!selectedStageId || !canStartSession"
          class="start-button"
        >
          <span v-if="canStartSession">🎯 練習開始</span>
          <span v-else>⏳ クールダウン中...</span>
        </button>
      </div>
    </div>

    <!-- Pure Learning Game Screen -->
    <div v-if="gameState === 'learning'" class="learning-session">
      <!-- Phoneme Audio Display -->
      <div class="phoneme-section">
        <div class="sound-prompt">
          <div class="prompt-text">この音を聞いてください</div>
          <button 
            @click="playCurrentPhoneme" 
            class="sound-button"
            :class="{ 'playing': isPlayingSound }"
          >
            <div class="sound-icon">🔊</div>
            <div class="phoneme-display">{{ currentPhoneme?.ipa || '?' }}</div>
          </button>
          <div class="instruction">正しい文字が来たらタッチしましょう</div>
        </div>
      </div>

      <!-- Learning Arena -->
      <div class="learning-arena">
        <!-- Space Background Effects -->
        <div class="space-particles">
          <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
        </div>
        
        <!-- Multiple Floating Letters -->
        <div 
          v-for="letter in floatingLetters" 
          :key="letter.id"
          class="floating-letter"
          :style="getLetterStyle(letter)"
          @click="onLetterClick(letter)"
          :class="{ 
            'correct-target': letter.symbol === currentPhoneme?.letter,
            'incorrect-target': letter.symbol !== currentPhoneme?.letter,
            'feedback-flash': letter.showFeedback
          }"
        >
          <div class="letter-content">
            {{ letter.symbol }}
          </div>
          <div class="letter-glow"></div>
        </div>

        <!-- Clean Feedback -->
        <div v-if="feedbackMessage" class="feedback-display" :class="feedbackType">
          <div class="feedback-icon">{{ feedbackIcon }}</div>
          <div class="feedback-text">{{ feedbackMessage }}</div>
        </div>
      </div>

      <!-- Minimal Progress -->
      <div class="session-progress">
        <div class="progress-dots">
          <div 
            v-for="n in sessionProgress.total" 
            :key="n"
            class="progress-dot"
            :class="{
              'completed': n <= sessionProgress.correct,
              'incorrect': n <= sessionProgress.attempts && n > sessionProgress.correct,
              'current': n === sessionProgress.attempts + 1
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Session Results -->
    <div v-if="gameState === 'results'" class="session-results">
      <div class="results-card">
        <div class="results-header">
          <div class="results-icon">{{ getResultsIcon() }}</div>
          <h2>{{ getResultsMessage() }}</h2>
        </div>

        <div class="session-stats">
          <div class="main-stat">
            <div class="stat-number">{{ Math.round(sessionResults.accuracy * 100) }}%</div>
            <div class="stat-label">正解率</div>
          </div>
          
          <div class="detailed-stats">
            <div class="detail-stat">
              <span class="label">正解:</span>
              <span class="value">{{ sessionResults.correct }}/{{ sessionResults.total }}</span>
            </div>
            <div class="detail-stat">
              <span class="label">平均反応時間:</span>
              <span class="value">{{ Math.round(sessionResults.averageTime / 1000 * 10) / 10 }}秒</span>
            </div>
          </div>
        </div>

        <!-- Phoneme Mastery Progress -->
        <div class="phoneme-progress" v-if="sessionResults.phonemeResults.length > 0">
          <h3>音素別習得状況</h3>
          <div class="phoneme-list">
            <div 
              v-for="result in sessionResults.phonemeResults" 
              :key="result.ipa"
              class="phoneme-item"
              :class="{ 'mastered': result.mastery >= 0.85 }"
            >
              <div class="phoneme-symbol">{{ result.ipa }}</div>
              <div class="phoneme-letter">{{ result.letter }}</div>
              <div class="mastery-bar">
                <div 
                  class="mastery-fill"
                  :style="{ width: result.mastery * 100 + '%' }"
                ></div>
              </div>
              <div class="mastery-percent">{{ Math.round(result.mastery * 100) }}%</div>
            </div>
          </div>
        </div>

        <!-- Unlock Notifications -->
        <div v-if="sessionResults.newUnlocks.length > 0" class="unlock-notification">
          <div class="unlock-icon">🎉</div>
          <div class="unlock-text">新しいステージが解禁されました！</div>
          <div class="unlocked-stages">
            <div v-for="unlock in sessionResults.newUnlocks" :key="unlock" class="unlocked-stage">
              {{ PHONEME_LEARNING_SYSTEM.stages[unlock].name }}
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="continueSession" class="continue-button" v-if="canContinue">
            🔄 続ける
          </button>
          <button @click="returnToStages" class="return-button">
            📊 ステージ選択に戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameAudio } from '@/composables/useGameAudio'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import { PHONEME_LEARNING_SYSTEM, progressionManager } from '@/data/phonemeLearningSystem'
import Icon from '@/components/shared/Icon.vue'

// Emits
const emit = defineEmits(['back'])

// Audio system
const { playSound, playPhoneme, playVisualFeedback } = useGameAudio()

// Game state
const gameState = ref('stageSelection') // 'stageSelection', 'learning', 'results'
const selectedStageId = ref('basicVowels') // Default to first stage
const isPlayingSound = ref(false)

// Learning session state
const currentPhoneme = ref(null)
const floatingLetters = ref([]) // 複数の浮遊文字
const sessionQuestions = ref([])
const currentQuestionIndex = ref(0)
const sessionStartTime = ref(0)
const questionStartTime = ref(0)

// Progress tracking
const sessionProgress = ref({
  current: 0,
  total: 10,
  correct: 0,
  attempts: 0
})

// Results and feedback
const sessionResults = ref({
  correct: 0,
  total: 0,
  accuracy: 0,
  averageTime: 0,
  phonemeResults: [],
  newUnlocks: []
})

const feedbackMessage = ref('')
const feedbackType = ref('')
const feedbackIcon = ref('')
const showFeedback = ref(false)

// Computed values
const currentStage = computed(() => {
  return selectedStageId.value ? PHONEME_LEARNING_SYSTEM.stages[selectedStageId.value] : null
})

const availableStages = computed(() => {
  const stages = {}
  const progressData = PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress
  
  Object.entries(PHONEME_LEARNING_SYSTEM.stages).forEach(([stageId, stage]) => {
    const progress = progressData[stageId] || {}
    stages[stageId] = {
      ...stage,
      unlocked: progressionManager.checkStageUnlock(stageId),
      ...progress
    }
  })
  
  return stages
})

const learningStats = computed(() => {
  const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
  const stageProgress = PHONEME_LEARNING_SYSTEM.progressTracking.stageProgress
  
  let totalAttempts = 0
  let totalCorrect = 0
  let totalSessions = 0
  let masteredPhonemes = 0
  
  Object.values(phonemeMastery).forEach(mastery => {
    totalAttempts += mastery.attempts
    totalCorrect += mastery.correct
    if (mastery.masteryAchieved) masteredPhonemes++
  })
  
  Object.values(stageProgress).forEach(progress => {
    totalSessions += progress.sessionsCompleted
  })
  
  return {
    totalAttempts,
    totalSessions,
    overallAccuracy: totalAttempts > 0 ? totalCorrect / totalAttempts : 0,
    masteredPhonemes
  }
})

const canStartSession = computed(() => {
  // Check cooldown if needed
  return true // For now, always allow
})

const canContinue = computed(() => {
  return sessionResults.value.accuracy >= 0.60 // 60% minimum to continue
})

// 削除 - 単一文字のロジックを複数文字に変更

// Game timers
let letterTimer = null
let feedbackTimer = null

// Game methods
const selectStage = (stageId) => {
  selectedStageId.value = stageId
}

const startSession = () => {
  if (!selectedStageId.value) return
  
  gameState.value = 'learning'
  sessionStartTime.value = Date.now()
  
  generateSessionQuestions()
  startQuestion()
}

const generateSessionQuestions = () => {
  console.log('🎲 Generating session questions for stage:', selectedStageId.value)
  
  const stage = currentStage.value
  if (!stage) {
    console.error('❌ No current stage found!')
    return
  }
  
  if (!stage.phonemes || !Array.isArray(stage.phonemes) || stage.phonemes.length === 0) {
    console.error('❌ Invalid stage.phonemes:', stage.phonemes)
    return
  }
  
  console.log('📚 Stage data (safe):', {
    id: stage.id,
    name: stage.name,
    phonemeCount: stage.phonemes.length
  })
  
  const questions = []
  
  // Generate 10 questions from current stage phonemes
  for (let i = 0; i < 10; i++) {
    const phoneme = stage.phonemes[Math.floor(Math.random() * stage.phonemes.length)]
    
    // 🚨 音素データの安全チェック
    if (!phoneme || !phoneme.letter || !phoneme.ipa) {
      console.error('❌ Invalid phoneme data:', phoneme)
      continue
    }
    
    questions.push({
      phoneme: {
        ipa: phoneme.ipa,
        letter: phoneme.letter,
        audioFile: phoneme.audioFile,
        examples: phoneme.examples || []
      },
      correctAnswer: phoneme.letter
    })
  }
  
  console.log('✅ Generated questions (safe):', questions.map(q => ({
    ipa: q.phoneme.ipa,
    letter: q.phoneme.letter,
    correctAnswer: q.correctAnswer
  })))
  
  sessionQuestions.value = questions
  currentQuestionIndex.value = 0
  sessionProgress.value = {
    current: 0,
    total: questions.length,
    correct: 0,
    attempts: 0
  }
}

const startQuestion = () => {
  console.log('🎯 Starting question', currentQuestionIndex.value, 'of', sessionQuestions.value.length)
  
  if (currentQuestionIndex.value >= sessionQuestions.value.length) {
    finishSession()
    return
  }
  
  // Reset states for new question
  answerProcessing.value = false
  animationRunning.value = false
  floatingLetters.value = []
  
  const question = sessionQuestions.value[currentQuestionIndex.value]
  
  // 🚨 安全なデータチェック
  if (!question) {
    console.error('❌ Question is undefined at index:', currentQuestionIndex.value)
    return
  }
  
  if (!question.phoneme) {
    console.error('❌ Question.phoneme is undefined:', question)
    return
  }
  
  if (!question.phoneme.letter) {
    console.error('❌ Question.phoneme.letter is undefined:', question.phoneme)
    return
  }
  
  currentPhoneme.value = question.phoneme
  questionStartTime.value = Date.now()
  
  console.log('🔊 Current phoneme (safe):', {
    ipa: currentPhoneme.value.ipa,
    letter: currentPhoneme.value.letter,
    audioFile: currentPhoneme.value.audioFile
  })
  
  // Play the phoneme sound
  playCurrentPhoneme()
  
  // Start multiple floating letters after a brief delay
  setTimeout(() => {
    console.log('🌌 Spawning multiple floating letters...')
    spawnFloatingLetters()
  }, 1500)
}

const playCurrentPhoneme = async () => {
  if (currentPhoneme.value && gameState.value === 'learning') {
    isPlayingSound.value = true
    try {
      await playPhoneme(currentPhoneme.value.ipa)
    } catch (error) {
      console.error('Failed to play phoneme:', error)
    }
    setTimeout(() => {
      isPlayingSound.value = false
    }, 1000)
  }
}

const spawnFloatingLetters = () => {
  console.log('🌌 spawnFloatingLetters called, gameState:', gameState.value)
  
  if (gameState.value !== 'learning') {
    console.log('❌ Not in learning state, returning')
    return
  }
  
  if (!currentPhoneme.value) {
    console.log('❌ No current phoneme, returning')
    return
  }
  
  // 🚨 既に文字が存在する場合は何もしない（重複防止）
  if (floatingLetters.value.length > 0) {
    console.log('⚠️ Letters already exist, skipping spawn')
    return
  }
  
  // クリア既存の文字
  floatingLetters.value = []
  
  const stage = currentStage.value
  const allPhonemes = stage.phonemes
  const correctLetter = currentPhoneme.value.letter
  
  console.log('🚨 spawnFloatingLetters DEBUG:')
  console.log('   currentPhoneme.value:', currentPhoneme.value)
  console.log('   correctLetter:', correctLetter, 'Type:', typeof correctLetter)
  
  // 5-8個の文字を生成（正解を含む）
  const letterCount = 5 + Math.floor(Math.random() * 4) // 5-8個
  const letters = []
  
  // まず不正解の文字を生成
  const otherPhonemes = allPhonemes.filter(p => p.letter !== correctLetter)
  for (let i = 0; i < letterCount - 1; i++) {
    const randomPhoneme = otherPhonemes[Math.floor(Math.random() * otherPhonemes.length)]
    letters.push(randomPhoneme.letter)
  }
  
  // 正解文字をランダムな位置に挿入
  const randomPosition = Math.floor(Math.random() * letters.length)
  letters.splice(randomPosition, 0, correctLetter)
  
  console.log('🔤 Generated letters:', letters)
  console.log('🔤 Letters with types:', letters.map(l => ({ letter: l, type: typeof l })))
  
  // より自由なランダム配置
  const safeZoneX = window.innerWidth * 0.8 // 画面幅の80%を使用
  const safeZoneY = 180 // 配置エリアの高さ
  const minDistance = 100 // 文字間の最小距離
  
  // 配置済み位置の記録
  const placedPositions = []
  
  // 各文字をランダムに配置
  letters.forEach((symbol, index) => {
    let x, y
    let attempts = 0
    const maxAttempts = 50
    
    // 他の文字と重ならない位置を探す
    do {
      x = Math.random() * safeZoneX + (window.innerWidth - safeZoneX) / 2
      y = Math.random() * safeZoneY + 80
      attempts++
      
      // 最大試行回数に達したら、とにかく配置
      if (attempts >= maxAttempts) {
        break
      }
    } while (placedPositions.some(pos => 
      Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < minDistance
    ))
    
    placedPositions.push({ x, y })
    
    const letter = {
      id: Date.now() + index,
      symbol: symbol,
      x: x,
      y: y,
      targetY: y,
      vx: (Math.random() - 0.5) * 30, // よりランダムな動き
      vy: (Math.random() - 0.5) * 20,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.8,
      scale: 0.9 + Math.random() * 0.3, // サイズもランダム
      startTime: Date.now() + Math.random() * 500, // ランダムな時差出現
      showFeedback: false
    }
    
    console.log(`🔤 Creating letter ${index}:`, {
      symbol: letter.symbol,
      symbolType: typeof letter.symbol,
      isCorrect: letter.symbol === correctLetter,
      correctLetter: correctLetter,
      correctType: typeof correctLetter
    })
    
    floatingLetters.value.push(letter)
  })
  
  console.log('🚀 Created floating letters:', floatingLetters.value.length)
  
  // 🚨 全ての文字の最終確認
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 FINAL FLOATING LETTERS CHECK:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  floatingLetters.value.forEach((letter, idx) => {
    console.log(`Letter ${idx}:`, {
      symbol: letter.symbol,
      type: typeof letter.symbol,
      isCorrectAnswer: letter.symbol === correctLetter,
      correctLetter: correctLetter
    })
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // アニメーション開始
  console.log('🌌 Starting floating animation')
  animationRunning.value = true
  animateFloatingLetters()
}

// アニメーション用のフラグ
const animationRunning = ref(false)

// 宇宙空間での自然な浮遊アニメーション
const animateFloatingLetters = () => {
  if (gameState.value !== 'learning' || !animationRunning.value) {
    animationRunning.value = false
    return
  }
  
  const currentTime = Date.now()
  let activeLetters = 0
  
  floatingLetters.value.forEach(letter => {
    // 時差出現チェック
    if (currentTime < letter.startTime) return
    
    activeLetters++
    
    // 非常に穏やかな浮遊運動
    letter.x += letter.vx * 0.008 // より遅い移動
    letter.y += letter.vy * 0.008
    letter.rotation += letter.rotationSpeed * 0.5
    
    // より広い範囲での境界反射
    if (letter.x < 50 || letter.x > window.innerWidth - 150) {
      letter.vx *= -0.6
    }
    if (letter.y < 60 || letter.y > 300) {
      letter.vy *= -0.6
    }
    
    // 範囲内に収める（より広い範囲）
    letter.x = Math.max(50, Math.min(window.innerWidth - 150, letter.x))
    letter.y = Math.max(60, Math.min(300, letter.y))
  })
  
  // 🚨 回答処理中またはゲーム状態が変わったら停止
  if (answerProcessing.value || gameState.value !== 'learning') {
    animationRunning.value = false
    return
  }
  
  // 15秒後または文字がなくなったら新しい質問
  const questionElapsed = currentTime - questionStartTime.value
  if (questionElapsed > 15000 || floatingLetters.value.length === 0) {
    if (!answerProcessing.value) { // 重複防止
      console.log('⏰ Question timeout or no letters left')
      animationRunning.value = false
      onNoSelection()
    }
    return
  }
  
  // 次のフレーム
  if (animationRunning.value) {
    requestAnimationFrame(animateFloatingLetters)
  }
}

// 文字のスタイルを計算
const getLetterStyle = (letter) => {
  const currentTime = Date.now()
  if (currentTime < letter.startTime) {
    return { display: 'none' } // まだ表示時間ではない
  }
  
  const style = {
    position: 'absolute',
    left: `${letter.x}px`,
    top: `${letter.y}px`,
    transform: `rotate(${letter.rotation}deg) scale(${letter.scale})`,
    opacity: 1,
    zIndex: 100,
    visibility: 'visible'
  }
  
  return style
}

// Space particle effects
const getParticleStyle = (n) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 4}s`
  }
}

// Answer processing state
const answerProcessing = ref(false)

// 新しいクリック処理（複数文字対応）
const onLetterClick = (letter) => {
  // 🚨 完全な安全チェック
  if (!letter) {
    console.error('❌ Letter is null/undefined')
    return
  }
  
  if (!letter.symbol) {
    console.error('❌ Letter.symbol is null/undefined:', letter)
    return
  }
  
  if (!currentPhoneme.value) {
    console.error('❌ currentPhoneme.value is null/undefined')
    return
  }
  
  if (!currentPhoneme.value.letter) {
    console.error('❌ currentPhoneme.value.letter is null/undefined:', currentPhoneme.value)
    return
  }
  
  if (answerProcessing.value) {
    console.log('⏳ Answer already processing, ignoring click')
    return
  }
  
  // Prevent multiple clicks
  answerProcessing.value = true
  
  // 🚨 完全なデバッグログ
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 CLICK EVENT DEBUG START')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1️⃣ Raw letter object:', letter)
  console.log('2️⃣ Letter.symbol:', letter.symbol, 'Type:', typeof letter.symbol)
  console.log('3️⃣ currentPhoneme.value:', currentPhoneme.value)
  console.log('4️⃣ currentPhoneme.value.letter:', currentPhoneme.value.letter, 'Type:', typeof currentPhoneme.value.letter)
  
  const responseTime = Date.now() - questionStartTime.value
  
  // 🔍 文字列変換の各ステップをログ
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 STRING CONVERSION DEBUG')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const clickedRaw = letter.symbol
  const expectedRaw = currentPhoneme.value.letter
  
  console.log('5️⃣ Raw values:')
  console.log('   Clicked:', clickedRaw, 'Length:', clickedRaw.length)
  console.log('   Expected:', expectedRaw, 'Length:', expectedRaw.length)
  
  const clickedString = String(clickedRaw)
  const expectedString = String(expectedRaw)
  
  console.log('6️⃣ After String():')
  console.log('   Clicked:', clickedString, 'Length:', clickedString.length)
  console.log('   Expected:', expectedString, 'Length:', expectedString.length)
  
  const clickedTrimmed = clickedString.trim()
  const expectedTrimmed = expectedString.trim()
  
  console.log('7️⃣ After trim():')
  console.log('   Clicked:', clickedTrimmed, 'Length:', clickedTrimmed.length)
  console.log('   Expected:', expectedTrimmed, 'Length:', expectedTrimmed.length)
  
  const clickedLetter = clickedTrimmed.toLowerCase()
  const expectedLetter = expectedTrimmed.toLowerCase()
  
  console.log('8️⃣ After toLowerCase():')
  console.log('   Clicked:', clickedLetter, 'Length:', clickedLetter.length)
  console.log('   Expected:', expectedLetter, 'Length:', expectedLetter.length)
  
  // 文字コード比較
  console.log('9️⃣ Character codes:')
  for (let i = 0; i < Math.max(clickedLetter.length, expectedLetter.length); i++) {
    const clickedChar = clickedLetter[i] || 'undefined'
    const expectedChar = expectedLetter[i] || 'undefined'
    const clickedCode = clickedLetter.charCodeAt(i) || 'N/A'
    const expectedCode = expectedLetter.charCodeAt(i) || 'N/A'
    console.log(`   Position ${i}: '${clickedChar}' (${clickedCode}) vs '${expectedChar}' (${expectedCode})`)
  }
  
  // 🚨 複数の比較方法を試す
  const isCorrect1 = clickedLetter === expectedLetter
  const isCorrect2 = clickedRaw === expectedRaw
  const isCorrect3 = letter.symbol === currentPhoneme.value.letter
  
  console.log('🔍 Multiple comparison methods:')
  console.log('   Method 1 (processed):', isCorrect1)
  console.log('   Method 2 (raw):', isCorrect2)
  console.log('   Method 3 (direct):', isCorrect3)
  
  // 最終的にはシンプルな比較を使用
  const isCorrect = clickedLetter === expectedLetter
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎯 FINAL RESULT:')
  console.log('   Clicked:', clickedLetter)
  console.log('   Expected:', expectedLetter)
  console.log('   isCorrect:', isCorrect)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // 文字にフィードバック効果
  letter.showFeedback = true
  setTimeout(() => {
    letter.showFeedback = false
  }, 500)
  
  // 正解の場合、全ての文字をクリア
  if (isCorrect) {
    floatingLetters.value = []
  }
  
  processAnswer(isCorrect, responseTime)
}

// 何も選択されなかった場合
const onNoSelection = () => {
  if (answerProcessing.value) {
    console.log('⏳ Already processing answer, skip timeout')
    return
  }
  console.log('❌ No selection made, timeout')
  const responseTime = Date.now() - questionStartTime.value
  processAnswer(false, responseTime)
}

const processAnswer = (isCorrect, responseTime) => {
  console.log('🎯 Processing answer:', { isCorrect, responseTime })
  
  // Stop all audio immediately when answer is given
  try {
    if (phonemeAudioService.stopAll) {
      phonemeAudioService.stopAll()
    }
  } catch (error) {
    console.log('No phonemeAudioService.stopAll method available')
  }
  
  sessionProgress.value.attempts++
  
  if (isCorrect) {
    sessionProgress.value.correct++
    showAnswerFeedback(true)
    playSound('effect', 'success')
  } else {
    showAnswerFeedback(false)
    playSound('effect', 'error')
  }
  
  // Record the result
  const phonemeIpa = currentPhoneme.value.ipa
  progressionManager.updatePhonemeMastery(phonemeIpa, isCorrect, responseTime)
  
  // Stop animation immediately
  animationRunning.value = false
  
  // Clear all floating letters
  floatingLetters.value = []
  
  // Move to next question after feedback
  setTimeout(() => {
    answerProcessing.value = false // Reset processing state
    currentQuestionIndex.value++
    sessionProgress.value.current++
    startQuestion()
  }, isCorrect ? 1000 : 2000) // Longer pause for incorrect answers
}

const showAnswerFeedback = (correct) => {
  showFeedback.value = true
  
  if (correct) {
    feedbackType.value = 'correct'
    feedbackIcon.value = '✅'
    feedbackMessage.value = '正解！'
  } else {
    feedbackType.value = 'incorrect'
    feedbackIcon.value = '❌'
    feedbackMessage.value = `正解は「${currentPhoneme.value.letter}」です`
    // Replay the correct sound
    setTimeout(() => {
      playCurrentPhoneme()
    }, 500)
  }
  
  setTimeout(() => {
    showFeedback.value = false
    feedbackMessage.value = ''
  }, correct ? 800 : 1500)
}

const finishSession = () => {
  const results = {
    correct: sessionProgress.value.correct,
    total: sessionProgress.value.total,
    accuracy: sessionProgress.value.correct / sessionProgress.value.total,
    averageTime: 0, // Calculate if needed
    phonemeResults: [],
    newUnlocks: []
  }
  
  // Process session with progression manager
  const phonemeResults = sessionQuestions.value.map(q => ({
    ipa: q.phoneme.ipa,
    correct: true, // This should be tracked per question
    responseTime: 2000 // Average
  }))
  
  const sessionData = {
    correct: results.correct,
    total: results.total,
    phonemeResults: phonemeResults
  }
  
  const progressResult = progressionManager.processSessionResult(selectedStageId.value, sessionData)
  
  // Update results with phoneme mastery data
  const phonemeMastery = PHONEME_LEARNING_SYSTEM.progressTracking.phonemeMastery
  results.phonemeResults = currentStage.value.phonemes.map(phoneme => ({
    ipa: phoneme.ipa,
    letter: phoneme.letter,
    mastery: phonemeMastery[phoneme.ipa]?.accuracy || 0
  }))
  
  sessionResults.value = results
  gameState.value = 'results'
}

const continueSession = () => {
  startSession() // Start a new session
}

const returnToStages = () => {
  gameState.value = 'stageSelection'
  selectedStageId.value = null
}

const getResultsIcon = () => {
  const accuracy = sessionResults.value.accuracy
  if (accuracy >= 0.9) return '🏆'
  if (accuracy >= 0.8) return '🥇'
  if (accuracy >= 0.7) return '🥈'
  if (accuracy >= 0.6) return '🥉'
  return '💪'
}

const getResultsMessage = () => {
  const accuracy = sessionResults.value.accuracy
  if (accuracy >= 0.9) return '完璧な音韻認識！'
  if (accuracy >= 0.8) return '素晴らしい学習成果！'
  if (accuracy >= 0.7) return 'とても良い進歩です！'
  if (accuracy >= 0.6) return '着実に学習中！'
  return 'もう少し練習しましょう！'
}

// Lifecycle
onMounted(() => {
  // Preload audio for first stage
  const firstStage = PHONEME_LEARNING_SYSTEM.stages.basicVowels
  firstStage.phonemes.forEach(phoneme => {
    phonemeAudioService.preloadPhoneme(phoneme.ipa)
  })
})

onUnmounted(() => {
  if (letterTimer) clearInterval(letterTimer)
  if (feedbackTimer) clearTimeout(feedbackTimer)
})

// Watch for stage changes to preload audio
watch(selectedStageId, (newStageId) => {
  if (newStageId) {
    const stage = PHONEME_LEARNING_SYSTEM.stages[newStageId]
    stage.phonemes.forEach(phoneme => {
      phonemeAudioService.preloadPhoneme(phoneme.ipa)
    })
  }
})
</script>

<style scoped>
.true-sound-impact {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  overflow: hidden;
}

/* Cosmic background with stars and nebula */
.learning-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  z-index: 0;
}

.focus-stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 200px 300px, #94a3b8, transparent),
              radial-gradient(1px 1px at 300px 100px, #60a5fa, transparent);
  background-repeat: repeat;
  background-size: 200px 200px, 300px 300px, 150px 150px, 400px 400px, 250px 250px;
  animation: cosmic-twinkle 4s infinite, gentle-drift 20s infinite linear;
  opacity: 0.6;
}

.focus-stars::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 60%);
  animation: nebula-drift 15s infinite;
}

@keyframes gentle-drift {
  from { transform: translateX(0) translateY(0); }
  to { transform: translateX(-400px) translateY(-400px); }
}

@keyframes cosmic-twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

@keyframes nebula-drift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
}

/* Galaxy header */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.minimal-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 1px solid rgba(79, 172, 254, 0.5);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.minimal-button:hover {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.stage-title {
  font-size: 1.25rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-indicator {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

/* Stage selection */
.stage-selection {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.learning-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94A3B8;
  font-size: 0.875rem;
}

/* Stages grid */
.stages-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stage-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.8) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.stage-card:hover:not(.locked) {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
  border-color: rgba(79, 172, 254, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.stage-card.current {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
  border-color: #4FACFE;
}

.stage-card.completed {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.2) 0%, 
    rgba(5, 150, 105, 0.2) 100%);
  border-color: #10B981;
}

.stage-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.stage-icon {
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.stage-info {
  flex: 1;
}

.stage-name {
  font-weight: 600;
  color: #E2E8F0;
  margin-bottom: 0.25rem;
}

.stage-description {
  font-size: 0.875rem;
  color: #94A3B8;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.lock-indicator {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Learning stats */
.learning-stats {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.learning-stats h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Start button */
.start-button {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.start-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* Learning session */
.learning-session {
  position: relative;
  z-index: 10;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.phoneme-section {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.4);
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(15px);
}

.sound-prompt {
  max-width: 400px;
  margin: 0 auto;
}

.prompt-text {
  font-size: 1.125rem;
  color: #E2E8F0;
  margin-bottom: 1rem;
}

.sound-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  width: 100%;
  color: white;
  backdrop-filter: blur(10px);
}

.sound-button:hover {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
}

.sound-button.playing {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  color: white;
  animation: pulse-button 1s infinite;
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.6);
}

.sound-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.phoneme-display {
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.instruction {
  font-size: 0.875rem;
  color: #94A3B8;
}

/* Learning arena */
.learning-arena {
  flex: 1;
  position: relative;
  overflow: visible;
  background: 
    radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
    radial-gradient(ellipse at bottom, rgba(147, 51, 234, 0.1) 0%, transparent 70%),
    linear-gradient(135deg, 
      rgba(15, 23, 42, 0.8) 0%, 
      rgba(30, 41, 59, 0.6) 50%,
      rgba(15, 23, 42, 0.8) 100%);
  min-height: 400px;
  width: 100%;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: inset 0 0 100px rgba(59, 130, 246, 0.1);
}

/* 宇宙を浮遊する文字のスタイル */
.floating-letter {
  position: absolute !important;
  font-size: 48px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  z-index: 100 !important;
  pointer-events: auto;
  transition: all 0.2s ease-out;
  display: block;
  visibility: visible;
  min-width: 80px;
  min-height: 80px;
}

.letter-content {
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 2px solid;
  border-radius: 16px;
  padding: 16px 20px;
  min-width: 80px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.letter-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  opacity: 0.3;
  border-radius: 50%;
  z-index: 1;
  animation: cosmic-pulse 2s infinite ease-in-out;
}

/* 正解文字のスタイル - 通常と同じ外観 */
.floating-letter.correct-target .letter-content {
  color: #94A3B8;
  border-color: #64748B;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 15px rgba(148, 163, 184, 0.2);
}

/* 不正解文字のスタイル */
.floating-letter.incorrect-target .letter-content {
  color: #94A3B8;
  border-color: #64748B;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 15px rgba(148, 163, 184, 0.2);
}

/* ホバー効果 */
.floating-letter:hover {
  transform: scale(1.1) !important;
}

.floating-letter:hover .letter-content {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5),
              0 0 30px currentColor;
}

/* フィードバック効果 */
.floating-letter.feedback-flash .letter-content {
  animation: feedback-flash 0.5s ease-out;
}

@keyframes cosmic-pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.moving-letter.feedback-flash {
  animation: feedback-flash 0.3s ease-out;
}

@keyframes feedback-flash {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); filter: brightness(1.5); }
  100% { transform: scale(1); }
}

/* Space particles */
.space-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #60A5FA;
  border-radius: 50%;
  opacity: 0.6;
  animation: particle-float infinite linear;
}

@keyframes particle-float {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
    transform: scale(1);
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translate(0, -100px) scale(0);
    opacity: 0;
  }
}

/* Feedback display */
.feedback-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid;
  z-index: 30;
  animation: feedback-appear 0.3s ease-out;
}

.feedback-display.correct {
  border-color: #10b981;
  color: #065f46;
}

.feedback-display.incorrect {
  border-color: #ef4444;
  color: #991b1b;
}

.feedback-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feedback-text {
  font-size: 1.125rem;
  font-weight: 600;
}

@keyframes feedback-appear {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* Session progress */
.session-progress {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
  text-align: center;
}

.progress-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.progress-dot.completed {
  background: #10b981;
}

.progress-dot.incorrect {
  background: #ef4444;
}

.progress-dot.current {
  background: #3b82f6;
  transform: scale(1.2);
}

/* Session results */
.session-results {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.results-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.results-header .results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2rem;
}

.session-stats .main-stat {
  margin-bottom: 1.5rem;
}

.session-stats .stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #3b82f6;
}

.session-stats .stat-label {
  font-size: 1rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.detailed-stats {
  display: flex;
  justify-content: space-between;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.detail-stat .label {
  color: #64748b;
  font-size: 0.875rem;
}

.detail-stat .value {
  color: #1e293b;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Phoneme progress */
.phoneme-progress {
  text-align: left;
  margin-bottom: 1.5rem;
}

.phoneme-progress h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.phoneme-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.phoneme-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.phoneme-item.mastered {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.phoneme-symbol {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #3b82f6;
  min-width: 40px;
}

.phoneme-letter {
  font-weight: 600;
  color: #1e293b;
  min-width: 20px;
}

.mastery-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.mastery-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.5s ease;
}

.mastery-percent {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 35px;
  text-align: right;
}

/* Unlock notification */
.unlock-notification {
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.unlock-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.unlock-text {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.unlocked-stages {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.unlocked-stage {
  background: #fbbf24;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Results actions */
.results-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.continue-button {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.continue-button:hover {
  background: #059669;
}

.return-button {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.return-button:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

@keyframes pulse-button {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes cosmic-glow {
  0%, 100% { 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                0 0 20px currentColor;
  }
  50% { 
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3),
                0 0 30px currentColor,
                0 0 40px currentColor;
  }
}
</style>