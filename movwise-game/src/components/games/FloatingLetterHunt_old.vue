<template>
  <div class="min-h-screen floating-game-bg">
    <!-- Animated space background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="nebula-effect"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 p-4">
      <div class="flex justify-between items-center">
        <button @click="$emit('back')" class="galaxy-button galaxy-button-secondary">
          <Icon name="arrow-left" class="w-4 h-4 mr-2" />
          戻る
        </button>
        <h1 class="text-2xl font-bold cosmic-text">🎯 浮遊文字ハント</h1>
        <div class="score-display">
          <span class="score-label">スコア:</span>
          <span class="score-value">{{ score }}</span>
        </div>
      </div>
    </div>

    <!-- Game Setup Screen -->
    <div v-if="gameState === 'setup'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🌟</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">音素識別ゲーム</h2>
          <p class="text-gray-300">聞こえた音に対応する文字を素早くタッチしましょう</p>
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
              <div class="text-xs text-gray-400">{{ level.speed }}</div>
            </button>
          </div>
        </div>

        <!-- ゲームモード選択 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 cosmic-text">ゲームモード</h3>
          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="gameMode = 'timed'"
              :class="['mode-card', gameMode === 'timed' ? 'selected' : '']"
            >
              <div class="text-2xl mb-1">⏰</div>
              <div class="text-sm">時間制限</div>
              <div class="text-xs text-gray-400">60秒</div>
            </button>
            <button 
              @click="gameMode = 'endless'"
              :class="['mode-card', gameMode === 'endless' ? 'selected' : '']"
            >
              <div class="text-2xl mb-1">♾️</div>
              <div class="text-sm">エンドレス</div>
              <div class="text-xs text-gray-400">ミスまで</div>
            </button>
          </div>
        </div>

        <button @click="startGame" class="galaxy-button galaxy-button-primary w-full py-3">
          <span class="text-lg">🚀 ゲーム開始</span>
        </button>
      </div>
    </div>

    <!-- Game Play Screen -->
    <div v-if="gameState === 'playing'" class="relative z-10 h-screen">
      <!-- Game HUD -->
      <div class="absolute top-20 left-0 right-0 z-20 px-4">
        <div class="flex justify-between items-center">
          <!-- Current Target Display -->
          <div class="target-display">
            <div class="target-card">
              <div class="target-icon">🎯</div>
              <div class="target-info">
                <div class="target-sound">{{ currentTarget?.sound || '?' }}</div>
                <div class="target-type">{{ getPhonemeType(currentTarget?.sound) }}</div>
              </div>
              <button @click="playTargetSound" class="play-button">
                <Icon name="volume" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Game Stats -->
          <div class="game-stats">
            <div class="stat-item">
              <div class="stat-icon">⏱️</div>
              <div class="stat-value" :class="timeWarningClass">
                {{ gameMode === 'timed' ? formatTime(timeLeft) : formatTime(elapsedTime) }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">{{ correctHits }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">❌</div>
              <div class="stat-value">{{ missedHits }}</div>
            </div>
          </div>
        </div>

        <!-- Combo Display -->
        <div v-if="combo > 1" class="combo-display">
          <div class="combo-text">{{ combo }}x COMBO!</div>
          <div class="combo-effect"></div>
        </div>
      </div>

      <!-- Game Area -->
      <div class="game-area">
        <!-- Floating Letters -->
        <div 
          v-for="letter in floatingLetters" 
          :key="letter.id"
          @click="clickLetter(letter)"
          @touchstart="clickLetter(letter)"
          class="floating-letter"
          :class="{
            'letter-correct': letter.isCorrect,
            'letter-wrong': letter.isWrong,
            'letter-target': letter.sound === currentTarget?.sound,
            'letter-pulsing': letter.sound === currentTarget?.sound
          }"
          :style="{
            left: letter.x + 'px',
            top: letter.y + 'px',
            fontSize: letter.size + 'px',
            animationDuration: letter.duration + 'ms',
            animationDelay: letter.delay + 'ms'
          }"
        >
          <div class="letter-content">
            <div class="letter-symbol">{{ letter.symbol }}</div>
            <div class="letter-glow"></div>
          </div>
        </div>

        <!-- Particle Effects -->
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle"
          :class="particle.type"
          :style="{
            left: particle.x + 'px',
            top: particle.y + 'px',
            animationDuration: particle.duration + 'ms'
          }"
        >
          {{ particle.symbol }}
        </div>
      </div>

      <!-- Sound Wave Visualization -->
      <div class="sound-wave-container">
        <div class="sound-wave" v-if="isPlayingSound">
          <div v-for="n in 5" :key="n" class="wave-bar" :style="{ animationDelay: n * 0.1 + 's' }"></div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-if="gameState === 'results'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ getResultsIcon() }}</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">ゲーム終了！</h2>
          <p class="text-gray-300">{{ getResultsMessage() }}</p>
        </div>

        <!-- Results Summary -->
        <div class="results-summary mb-6">
          <div class="result-row">
            <div class="result-item">
              <div class="result-label">スコア</div>
              <div class="result-value score-highlight">{{ score }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">正解率</div>
              <div class="result-value">{{ accuracy }}%</div>
            </div>
          </div>
          <div class="result-row">
            <div class="result-item">
              <div class="result-label">正解数</div>
              <div class="result-value">{{ correctHits }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">最大コンボ</div>
              <div class="result-value">{{ maxCombo }}x</div>
            </div>
          </div>
          <div class="result-row">
            <div class="result-item">
              <div class="result-label">平均反応時間</div>
              <div class="result-value">{{ averageReactionTime }}ms</div>
            </div>
            <div class="result-item">
              <div class="result-label">プレイ時間</div>
              <div class="result-value">{{ formatTime(playTime) }}</div>
            </div>
          </div>
        </div>

        <!-- Performance Rating -->
        <div class="performance-rating mb-6">
          <div class="rating-title">パフォーマンス</div>
          <div class="rating-stars">
            <span v-for="n in 5" :key="n" 
                  :class="['star', n <= performanceStars ? 'star-filled' : 'star-empty']">
              ⭐
            </span>
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

    <!-- Pause Overlay -->
    <div v-if="isPaused" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="galaxy-card text-center">
        <div class="text-4xl mb-4">⏸️</div>
        <div class="text-xl cosmic-text mb-4">ポーズ中</div>
        <button @click="resumeGame" class="galaxy-button galaxy-button-primary">
          ゲーム再開
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useGameAudio } from '@/composables/useGameAudio'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import Icon from '@/components/shared/Icon.vue'

// Emits
const emit = defineEmits(['back'])

// Audio system
const { playSound, playPhoneme, playVisualFeedback } = useGameAudio()

// 音声再生関数を追加
const speak = async (text, options = {}) => {
  try {
    console.log('🗣️ FloatingLetterHunt speaking:', text)
    
    // playPhonemeを使用して音素ファイルを再生
    await playPhoneme(text)
    
    console.log('✅ FloatingLetterHunt speak completed')
  } catch (error) {
    console.error('❌ FloatingLetterHunt speak error:', error)
    // フォールバック: 視覚的フィードバックのみ
    playVisualFeedback('button')
  }
}

// Game state
const gameState = ref('setup') // 'setup', 'playing', 'results'
const selectedDifficulty = ref('beginner')
const gameMode = ref('timed') // 'timed' or 'endless'
const isPaused = ref(false)
const isPlayingSound = ref(false)

// Game data
const score = ref(0)
const correctHits = ref(0)
const missedHits = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const timeLeft = ref(60)
const elapsedTime = ref(0)
const startTime = ref(0)
const currentTarget = ref(null)
const floatingLetters = ref([])
const particles = ref([])
const reactionTimes = ref([])

// 利用可能な音素を動的に取得
const getAvailablePhonemes = () => {
  return phonemeAudioService.getAvailablePhonemes()
}

// Game settings (利用可能な音素ファイルに基づいて更新)
const difficultyLevels = computed(() => {
  const availablePhonemes = getAvailablePhonemes()
  
  // 基本音素（単文字）
  const basicPhonemes = availablePhonemes.filter(p => p.length === 1)
  
  // 中級音素（2文字、一般的）
  const intermediatePhonemes = availablePhonemes.filter(p => 
    p.length === 2 && ['ch', 'sh', 'th', 'qu', 'ar', 'er', 'or', 'ng'].includes(p)
  )
  
  // 上級音素（ブレンドなど）
  const advancedPhonemes = availablePhonemes.filter(p => 
    ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tr', 'str', 'scr'].includes(p)
  )
  
  return [
    {
      id: 'beginner',
      name: '初級',
      icon: '🐌',
      speed: 'ゆっくり',
      letterCount: 8,
      spawnRate: 2000,
      moveSpeed: 3000,
      phonemes: basicPhonemes.slice(0, 15) // 最初の15個
    },
    {
      id: 'intermediate', 
      name: '中級',
      icon: '🏃',
      speed: '普通',
      letterCount: 12,
      spawnRate: 1500,
      moveSpeed: 2500,
      phonemes: intermediatePhonemes.length > 0 ? intermediatePhonemes : basicPhonemes.slice(15, 27)
    },
    {
      id: 'advanced',
      name: '上級',
      icon: '🚀',
      speed: '高速',
      letterCount: 16,
      spawnRate: 1000,
      moveSpeed: 2000,
      phonemes: advancedPhonemes.length > 0 ? advancedPhonemes : availablePhonemes.slice(-15)
    }
  ]
})

// Game timers
let gameTimer = null
let spawnTimer = null
let targetChangeTimer = null

// Computed properties
const accuracy = computed(() => {
  const total = correctHits.value + missedHits.value
  return total > 0 ? Math.round((correctHits.value / total) * 100) : 0
})

const averageReactionTime = computed(() => {
  if (reactionTimes.value.length === 0) return 0
  const sum = reactionTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / reactionTimes.value.length)
})

const playTime = computed(() => {
  return elapsedTime.value
})

const performanceStars = computed(() => {
  if (accuracy.value >= 95 && averageReactionTime.value <= 800) return 5
  if (accuracy.value >= 90 && averageReactionTime.value <= 1000) return 4
  if (accuracy.value >= 80 && averageReactionTime.value <= 1200) return 3
  if (accuracy.value >= 70 && averageReactionTime.value <= 1500) return 2
  return 1
})

const timeWarningClass = computed(() => {
  if (gameMode.value === 'timed' && timeLeft.value <= 10) return 'time-warning'
  return ''
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  resetGameStats()
  startTime.value = Date.now()
  
  generateNewTarget()
  startGameLoop()
  startSpawning()
}

const resetGameStats = () => {
  score.value = 0
  correctHits.value = 0
  missedHits.value = 0
  combo.value = 0
  maxCombo.value = 0
  timeLeft.value = gameMode.value === 'timed' ? 60 : 0
  elapsedTime.value = 0
  floatingLetters.value = []
  particles.value = []
  reactionTimes.value = []
  currentTarget.value = null
}

const startGameLoop = () => {
  gameTimer = setInterval(() => {
    if (isPaused.value) return
    
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    
    if (gameMode.value === 'timed') {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        endGame()
      }
    }
    
    updateFloatingLetters()
    updateParticles()
  }, 1000)
}

const startSpawning = () => {
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  
  spawnTimer = setInterval(() => {
    if (isPaused.value) return
    if (floatingLetters.value.length < difficulty.letterCount) {
      spawnFloatingLetter()
    }
  }, difficulty.spawnRate)
  
  // Change target every 8-12 seconds
  targetChangeTimer = setInterval(() => {
    if (isPaused.value) return
    generateNewTarget()
  }, 8000 + Math.random() * 4000)
}

const generateNewTarget = () => {
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  const phonemes = difficulty.phonemes
  const newTarget = phonemes[Math.floor(Math.random() * phonemes.length)]
  
  currentTarget.value = {
    sound: newTarget,
    symbol: newTarget,
    timestamp: Date.now()
  }
  
  playTargetSound()
}

const playTargetSound = async () => {
  if (currentTarget.value) {
    isPlayingSound.value = true
    await speak(currentTarget.value.sound)
    setTimeout(() => {
      isPlayingSound.value = false
    }, 1000)
  }
}

const spawnFloatingLetter = () => {
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  const phonemes = difficulty.phonemes
  const letter = phonemes[Math.floor(Math.random() * phonemes.length)]
  
  const id = Date.now() + Math.random()
  const startX = Math.random() * (window.innerWidth - 100)
  const startY = window.innerHeight + 50
  const endY = -100
  
  floatingLetters.value.push({
    id,
    sound: letter,
    symbol: letter,
    x: startX,
    y: startY,
    targetY: endY,
    size: 24 + Math.random() * 16,
    duration: difficulty.moveSpeed,
    delay: 0,
    isCorrect: false,
    isWrong: false,
    timestamp: Date.now()
  })
  
  // Animate the letter
  const letterElement = floatingLetters.value.find(l => l.id === id)
  if (letterElement) {
    animateLetterMovement(letterElement)
  }
}

const animateLetterMovement = (letter) => {
  const duration = difficultyLevels.find(d => d.id === selectedDifficulty.value).moveSpeed
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = elapsed / duration
    
    if (progress >= 1) {
      // Letter reached the end - remove it
      removeLetter(letter.id)
      return
    }
    
    letter.y = letter.targetY + (letter.y - letter.targetY) * (1 - progress)
    
    requestAnimationFrame(animate)
  }
  
  requestAnimationFrame(animate)
}

const clickLetter = (letter) => {
  const reactionTime = Date.now() - currentTarget.value.timestamp
  reactionTimes.value.push(reactionTime)
  
  if (letter.sound === currentTarget.value.sound) {
    // Correct hit
    letter.isCorrect = true
    correctHits.value++
    combo.value++
    maxCombo.value = Math.max(maxCombo.value, combo.value)
    
    // Score calculation
    const baseScore = 100
    const comboBonus = combo.value * 10
    const speedBonus = Math.max(0, 1000 - reactionTime) / 10
    const totalScore = Math.round(baseScore + comboBonus + speedBonus)
    
    score.value += totalScore
    
    // Create success particle
    createParticle(letter.x, letter.y, 'success', '✨')
    
    playSound('correct')
    removeLetter(letter.id)
    
    // Generate new target immediately on correct hit
    setTimeout(() => {
      generateNewTarget()
    }, 500)
    
  } else {
    // Wrong hit
    letter.isWrong = true
    missedHits.value++
    combo.value = 0
    
    // Create failure particle
    createParticle(letter.x, letter.y, 'failure', '💥')
    
    playSound('incorrect')
    
    if (gameMode.value === 'endless') {
      endGame()
      return
    }
    
    setTimeout(() => {
      removeLetter(letter.id)
    }, 500)
  }
}

const createParticle = (x, y, type, symbol) => {
  const id = Date.now() + Math.random()
  particles.value.push({
    id,
    x: x + Math.random() * 40 - 20,
    y: y + Math.random() * 40 - 20,
    type,
    symbol,
    duration: 1000
  })
  
  setTimeout(() => {
    particles.value = particles.value.filter(p => p.id !== id)
  }, 1000)
}

const removeLetter = (letterId) => {
  floatingLetters.value = floatingLetters.value.filter(l => l.id !== letterId)
}

const updateFloatingLetters = () => {
  floatingLetters.value = floatingLetters.value.filter(letter => {
    return letter.y > -100 && Date.now() - letter.timestamp < 15000
  })
}

const updateParticles = () => {
  particles.value = particles.value.filter(particle => {
    return Date.now() - particle.timestamp < particle.duration
  })
}

const pauseGame = () => {
  isPaused.value = true
}

const resumeGame = () => {
  isPaused.value = false
}

const endGame = () => {
  gameState.value = 'results'
  clearAllTimers()
}

const restartGame = () => {
  clearAllTimers()
  gameState.value = 'setup'
}

const clearAllTimers = () => {
  if (gameTimer) clearInterval(gameTimer)
  if (spawnTimer) clearInterval(spawnTimer)
  if (targetChangeTimer) clearInterval(targetChangeTimer)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getPhonemeType = (phoneme) => {
  const vowels = ['a', 'i', 'u', 'e', 'o', 'æ', 'ʌ', 'ɔ', 'ə', 'ɪ', 'ʊ', 'iː', 'uː', 'ɑː', 'ɔː', 'ɜː']
  return vowels.includes(phoneme) ? '母音' : '子音'
}

const getResultsIcon = () => {
  if (performanceStars.value >= 5) return '🏆'
  if (performanceStars.value >= 4) return '🥇'
  if (performanceStars.value >= 3) return '🥈'
  if (performanceStars.value >= 2) return '🥉'
  return '💪'
}

const getResultsMessage = () => {
  if (performanceStars.value >= 5) return '完璧なパフォーマンス！'
  if (performanceStars.value >= 4) return '素晴らしい結果です！'
  if (performanceStars.value >= 3) return 'とても良い結果です！'
  if (performanceStars.value >= 2) return '良い結果です！'
  return 'もう少し練習しましょう！'
}

// Keyboard controls
const handleKeyPress = (event) => {
  if (event.code === 'Space' && gameState.value === 'playing') {
    event.preventDefault()
    if (isPaused.value) {
      resumeGame()
    } else {
      pauseGame()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  clearAllTimers()
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.floating-game-bg {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  overflow: hidden;
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
  opacity: 0.4;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 2s;
  opacity: 0.2;
}

.nebula-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: nebula-drift 15s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes nebula-drift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
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
  cursor: pointer;
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

.score-display {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  font-size: 0.875rem;
  color: #94A3B8;
}

.score-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #60A5FA;
}

.target-display {
  position: fixed;
  left: 1rem;
}

.target-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.target-icon {
  font-size: 1.5rem;
}

.target-info {
  display: flex;
  flex-direction: column;
}

.target-sound {
  font-size: 1.5rem;
  font-weight: bold;
  color: #F472B6;
}

.target-type {
  font-size: 0.75rem;
  color: #94A3B8;
}

.play-button {
  background: linear-gradient(135deg, #10B981, #059669);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.game-stats {
  position: fixed;
  right: 1rem;
  display: flex;
  gap: 1rem;
}

.stat-item {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 1rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
  color: #60A5FA;
}

.stat-value.time-warning {
  color: #EF4444;
  animation: time-pulse 1s infinite;
}

@keyframes time-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.combo-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 30;
}

.combo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #FBBF24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
  animation: combo-bounce 0.5s ease-out;
}

@keyframes combo-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.game-area {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.floating-letter {
  position: absolute;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  z-index: 10;
}

.floating-letter:hover {
  transform: scale(1.1);
}

.letter-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(10px);
}

.letter-symbol {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.letter-glow {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
  filter: blur(10px);
  z-index: -1;
  animation: letter-glow 2s ease-in-out infinite alternate;
}

@keyframes letter-glow {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.1); }
}

.letter-target .letter-content {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9));
  border-color: #FBBF24;
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.6);
}

.letter-target .letter-glow {
  background: rgba(251, 191, 36, 0.4);
}

.letter-pulsing {
  animation: target-pulse 1s ease-in-out infinite;
}

@keyframes target-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.letter-correct .letter-content {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
  animation: success-flash 0.5s ease-out;
}

@keyframes success-flash {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); box-shadow: 0 0 30px rgba(16, 185, 129, 0.8); }
  100% { transform: scale(1); }
}

.letter-wrong .letter-content {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
  animation: error-shake 0.5s ease-out;
}

@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.particle {
  position: absolute;
  font-size: 1.5rem;
  pointer-events: none;
  z-index: 20;
}

.particle.success {
  animation: particle-success 1s ease-out forwards;
}

.particle.failure {
  animation: particle-failure 1s ease-out forwards;
}

@keyframes particle-success {
  0% { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
  100% { 
    opacity: 0; 
    transform: scale(2) translateY(-50px); 
  }
}

@keyframes particle-failure {
  0% { 
    opacity: 1; 
    transform: scale(1) rotate(0deg); 
  }
  100% { 
    opacity: 0; 
    transform: scale(1.5) rotate(180deg); 
  }
}

.sound-wave-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

.sound-wave {
  display: flex;
  align-items: end;
  gap: 0.25rem;
  height: 40px;
}

.wave-bar {
  width: 4px;
  background: linear-gradient(to top, #60A5FA, #A78BFA);
  border-radius: 2px;
  animation: wave-bounce 1s ease-in-out infinite;
}

@keyframes wave-bounce {
  0%, 100% { height: 10px; }
  50% { height: 40px; }
}

.results-summary {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.result-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.result-item {
  text-align: center;
  flex: 1;
}

.result-label {
  font-size: 0.75rem;
  color: #94A3B8;
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #60A5FA;
}

.result-value.score-highlight {
  color: #FBBF24;
  font-size: 1.5rem;
}

.performance-rating {
  text-align: center;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
}

.rating-title {
  font-size: 1rem;
  color: #94A3B8;
  margin-bottom: 0.5rem;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.star {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.star-filled {
  filter: drop-shadow(0 0 8px #FBBF24);
  animation: star-twinkle 2s ease-in-out infinite;
}

.star-empty {
  opacity: 0.3;
}

@keyframes star-twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@media (max-width: 768px) {
  .target-display,
  .game-stats {
    position: relative;
    margin: 1rem;
  }
  
  .game-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .floating-letter {
    font-size: 1rem;
  }
  
  .letter-content {
    width: 50px;
    height: 50px;
  }
  
  .letter-symbol {
    font-size: 1.25rem;
  }
}
</style>