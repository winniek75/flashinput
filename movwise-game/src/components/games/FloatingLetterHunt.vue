<template>
  <div class="min-h-screen sound-impact-game">
    <!-- Animated space background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="nebula-effect" :class="{ 'combo-mode': combo >= 5 }"></div>
    </div>

    <!-- Header -->
    <div class="relative z-10 p-4">
      <div class="flex justify-between items-center">
        <button @click="$emit('back')" class="galaxy-button galaxy-button-secondary">
          <Icon name="arrow-left" class="w-4 h-4 mr-2" />
          戻る
        </button>
        <h1 class="text-2xl font-bold cosmic-text">🎯 サウンド・インパクト</h1>
        <div class="score-display">
          <span class="score-value">{{ score }}</span>
        </div>
      </div>
    </div>

    <!-- Game Setup Screen -->
    <div v-if="gameState === 'setup'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🚀</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">サウンド・インパクト</h2>
          <p class="text-gray-300">聞こえた音の文字を瞬間的にタッチ！</p>
        </div>

        <!-- レベル選択 -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 cosmic-text">レベル選択</h3>
          <div class="grid grid-cols-1 gap-3">
            <button 
              v-for="level in gameLevels" 
              :key="level.id"
              @click="selectedLevel = level.id"
              :class="['level-card', selectedLevel === level.id ? 'selected' : '']"
            >
              <div class="flex items-center justify-between">
                <div class="text-left">
                  <div class="text-lg font-bold">{{ level.name }} {{ level.icon }}</div>
                  <div class="text-sm text-gray-400">{{ level.description }}</div>
                </div>
                <div class="text-right text-sm">
                  <div class="text-blue-400">{{ level.speed }}秒</div>
                  <div class="text-gray-500">{{ level.phonemes.length }}音素</div>
                </div>
              </div>
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
          <!-- Current Sound Display -->
          <div class="sound-display">
            <div class="sound-card" :class="{ 'playing': isPlayingSound }">
              <div class="sound-icon">🔊</div>
              <div class="sound-info">
                <div class="current-sound">{{ currentTarget?.sound || '?' }}</div>
                <button @click="playTargetSound" class="play-again-btn">
                  <Icon name="volume" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Game Stats -->
          <div class="game-stats">
            <div class="stat-item">
              <div class="stat-label">スコア</div>
              <div class="stat-value">{{ score }}</div>
            </div>
            <div class="stat-item" v-if="combo > 0">
              <div class="stat-label">コンボ</div>
              <div class="stat-value combo-glow">{{ combo }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">ライフ</div>
              <div class="stat-value life-display">
                <span v-for="n in lives" :key="n" class="life-heart">❤️</span>
                <span v-for="n in (3 - lives)" :key="'lost-' + n" class="life-heart lost">💔</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Arena -->
      <div class="game-arena">
        <!-- Moving Letter -->
        <div 
          v-if="currentLetter" 
          class="moving-letter"
          :style="letterStyle"
          @click="onLetterClick"
          :class="{ 
            'correct-target': currentLetter.sound === currentTarget?.sound,
            'wrong-target': currentLetter.sound !== currentTarget?.sound,
            'hit-effect': hitEffect
          }"
        >
          <div class="letter-symbol">{{ currentLetter.symbol }}</div>
          <div class="letter-glow"></div>
        </div>

        <!-- Particle Effects -->
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle"
          :style="particle.style"
          :class="particle.type"
        >
          {{ particle.content }}
        </div>
      </div>

      <!-- Combo Display -->
      <div v-if="showComboDisplay" class="combo-display" :class="comboDisplayClass">
        <div class="combo-text">{{ comboText }}</div>
        <div class="combo-number">{{ combo }}</div>
      </div>

      <!-- Pause Menu -->
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-menu">
          <h2 class="text-2xl font-bold mb-4">⏸️ ポーズ</h2>
          <div class="flex flex-col gap-3">
            <button @click="resumeGame" class="galaxy-button galaxy-button-primary">
              ▶️ 再開
            </button>
            <button @click="restartGame" class="galaxy-button galaxy-button-secondary">
              🔄 リスタート
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-if="gameState === 'results'" class="flex items-center justify-center min-h-[70vh] relative z-10">
      <div class="galaxy-card max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">{{ getResultsIcon() }}</div>
          <h2 class="text-2xl font-bold cosmic-text mb-2">{{ getResultsMessage() }}</h2>
          <div class="performance-stars mb-4">
            <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= performanceStars }">
              ⭐
            </span>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div class="stats-grid mb-6">
          <div class="stat-card">
            <div class="stat-number">{{ score }}</div>
            <div class="stat-label">最終スコア</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ maxCombo }}</div>
            <div class="stat-label">最大コンボ</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ correctHits }}</div>
            <div class="stat-label">正解数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ accuracy }}%</div>
            <div class="stat-label">正解率</div>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button @click="restartGame" class="galaxy-button galaxy-button-primary">
            🚀 もう一度
          </button>
          <button @click="$emit('back')" class="galaxy-button galaxy-button-secondary">
            📊 メニューに戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameAudio } from '@/composables/useGameAudio'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import Icon from '@/components/shared/Icon.vue'

// Emits
const emit = defineEmits(['back'])

// Audio system
const { playSound, playPhoneme, playVisualFeedback } = useGameAudio()

// 音声再生関数
const speak = async (text, options = {}) => {
  try {
    await playPhoneme(text)
  } catch (error) {
    logger.error('❌ Sound playback error:', error)
    playVisualFeedback('button')
  }
}

// Game state
const gameState = ref('setup') // 'setup', 'playing', 'results'
const selectedLevel = ref('soundImpact')
const isPaused = ref(false)
const isPlayingSound = ref(false)

// Game data
const score = ref(0)
const correctHits = ref(0)
const totalHits = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const lives = ref(3)
const currentTarget = ref(null)
const currentLetter = ref(null)
const particles = ref([])

// Visual effects
const hitEffect = ref(false)
const showComboDisplay = ref(false)
const comboDisplayClass = ref('')
const comboText = ref('')

// Game levels configuration
const gameLevels = [
  {
    id: 'soundImpact',
    name: 'サウンド・インパクト',
    icon: '🎯',
    description: '基本母音の瞬間反応',
    speed: 1.5,
    phonemes: ['a', 'i', 'u', 'e', 'o'],
    color: '#10B981'
  },
  {
    id: 'sonicBlast',
    name: 'ソニック・ブラスト',
    icon: '🚀',
    description: '子音の高速識別',
    speed: 1.2,
    phonemes: ['b', 'd', 'g', 'p', 't', 'k', 'm', 'n', 's', 'f'],
    color: '#3B82F6'
  },
  {
    id: 'phonicStorm',
    name: 'フォニック・ストーム',
    icon: '⚡',
    description: '複雑音素の瞬間判断',
    speed: 1.0,
    phonemes: ['ch', 'sh', 'th', 'ng', 'bl', 'br', 'cl', 'cr'],
    color: '#8B5CF6'
  }
]

// Computed values
const currentLevel = computed(() => {
  return gameLevels.find(level => level.id === selectedLevel.value)
})

const letterStyle = computed(() => {
  if (!currentLetter.value) return {}
  
  return {
    left: `${currentLetter.value.x}px`,
    top: `${currentLetter.value.y}px`,
    fontSize: '80px',
    color: currentLevel.value.color,
    textShadow: `0 0 20px ${currentLevel.value.color}`,
    transform: `scale(${currentLetter.value.scale || 1})`,
    transition: 'all 0.1s ease-out'
  }
})

const accuracy = computed(() => {
  return totalHits.value > 0 ? Math.round((correctHits.value / totalHits.value) * 100) : 0
})

const performanceStars = computed(() => {
  if (accuracy.value >= 95) return 5
  if (accuracy.value >= 85) return 4
  if (accuracy.value >= 75) return 3
  if (accuracy.value >= 65) return 2
  if (accuracy.value >= 50) return 1
  return 0
})

// Game timers
let gameTimer = null
let letterTimer = null
let comboTimer = null

// Game methods
const startGame = () => {
  gameState.value = 'playing'
  resetGameStats()
  generateNewTarget()
  spawnLetter()
}

const resetGameStats = () => {
  score.value = 0
  correctHits.value = 0
  totalHits.value = 0
  combo.value = 0
  maxCombo.value = 0
  lives.value = 3
  particles.value = []
  currentTarget.value = null
  currentLetter.value = null
}

const generateNewTarget = () => {
  const level = currentLevel.value
  const phonemes = level.phonemes
  const newTarget = phonemes[Math.floor(Math.random() * phonemes.length)]
  
  currentTarget.value = {
    sound: newTarget,
    symbol: newTarget
  }
  
  playTargetSound()
}

const playTargetSound = async () => {
  if (currentTarget.value && gameState.value === 'playing') {
    isPlayingSound.value = true
    await speak(currentTarget.value.sound)
    setTimeout(() => {
      isPlayingSound.value = false
    }, 500)
  }
}

const spawnLetter = () => {
  if (gameState.value !== 'playing') return
  
  const level = currentLevel.value
  const phonemes = level.phonemes
  
  // 50% chance to spawn the correct letter, 50% for wrong letter
  const isCorrect = Math.random() > 0.3
  let letterSound
  
  if (isCorrect) {
    letterSound = currentTarget.value.sound
  } else {
    // Pick a different letter
    const otherPhonemes = phonemes.filter(p => p !== currentTarget.value.sound)
    letterSound = otherPhonemes[Math.floor(Math.random() * otherPhonemes.length)]
  }
  
  currentLetter.value = {
    sound: letterSound,
    symbol: letterSound,
    x: -100, // Start off-screen left
    y: window.innerHeight / 2 - 40, // Center vertically
    scale: 1,
    startTime: Date.now()
  }
  
  animateLetter()
}

const animateLetter = () => {
  if (!currentLetter.value || gameState.value !== 'playing') return
  
  const level = currentLevel.value
  const duration = level.speed * 1000 // Convert to milliseconds
  const startTime = currentLetter.value.startTime
  const currentTime = Date.now()
  const elapsed = currentTime - startTime
  
  if (elapsed >= duration) {
    // Letter missed - it went off screen
    onLetterMissed()
    return
  }
  
  // Calculate position (left to right across screen)
  const progress = elapsed / duration
  const screenWidth = window.innerWidth
  currentLetter.value.x = -100 + (screenWidth + 200) * progress
  
  // Schedule next frame
  requestAnimationFrame(animateLetter)
}

const onLetterClick = () => {
  if (!currentLetter.value || !currentTarget.value) return
  
  totalHits.value++
  
  if (currentLetter.value.sound === currentTarget.value.sound) {
    onCorrectHit()
  } else {
    onWrongHit()
  }
}

const onCorrectHit = () => {
  correctHits.value++
  combo.value++
  maxCombo.value = Math.max(maxCombo.value, combo.value)
  
  // Score calculation with combo bonus
  const baseScore = 100
  const comboBonus = combo.value * 10
  const timeBonus = Math.max(0, 50 - Math.floor((Date.now() - currentLetter.value.startTime) / 20))
  const totalScore = baseScore + comboBonus + timeBonus
  score.value += totalScore
  
  // Visual effects
  showHitEffect('correct')
  createParticles('success', currentLetter.value.x + 40, currentLetter.value.y + 40)
  
  // Combo display
  if (combo.value >= 3) {
    showComboEffect()
  }
  
  // Audio feedback
  playSound('correct')
  
  // Next round
  setTimeout(() => {
    generateNewTarget()
    spawnLetter()
  }, 300)
}

const onWrongHit = () => {
  combo.value = 0
  lives.value--
  
  // Visual effects
  showHitEffect('wrong')
  createParticles('error', currentLetter.value.x + 40, currentLetter.value.y + 40)
  
  // Audio feedback
  playSound('incorrect')
  
  if (lives.value <= 0) {
    endGame()
  } else {
    // Continue with same target
    setTimeout(() => {
      spawnLetter()
    }, 500)
  }
}

const onLetterMissed = () => {
  totalHits.value++
  combo.value = 0
  lives.value--
  
  createParticles('miss', window.innerWidth + 50, currentLetter.value.y + 40)
  playSound('incorrect')
  
  if (lives.value <= 0) {
    endGame()
  } else {
    setTimeout(() => {
      spawnLetter()
    }, 300)
  }
}

const showHitEffect = (type) => {
  hitEffect.value = true
  setTimeout(() => {
    hitEffect.value = false
  }, 200)
}

const showComboEffect = () => {
  showComboDisplay.value = true
  comboDisplayClass.value = `combo-${combo.value >= 10 ? 'mega' : combo.value >= 5 ? 'super' : 'normal'}`
  
  if (combo.value >= 10) {
    comboText.value = 'MEGA COMBO!'
  } else if (combo.value >= 5) {
    comboText.value = 'SUPER COMBO!'
  } else {
    comboText.value = 'COMBO!'
  }
  
  setTimeout(() => {
    showComboDisplay.value = false
  }, 1000)
}

const createParticles = (type, x, y) => {
  const particleCount = type === 'success' ? 8 : 4
  
  for (let i = 0; i < particleCount; i++) {
    const particle = {
      id: Date.now() + i,
      type: type,
      content: type === 'success' ? '✨' : type === 'error' ? '💥' : '💨',
      style: {
        left: `${x + (Math.random() - 0.5) * 100}px`,
        top: `${y + (Math.random() - 0.5) * 100}px`,
        fontSize: '24px',
        opacity: 1,
        transform: `scale(${0.5 + Math.random() * 0.5})`,
        transition: 'all 2s ease-out'
      }
    }
    
    particles.value.push(particle)
    
    // Animate particle
    setTimeout(() => {
      const p = particles.value.find(particle => particle.id === particle.id)
      if (p) {
        p.style.opacity = 0
        p.style.transform = `scale(0) translateY(-100px)`
      }
    }, 100)
    
    // Remove particle
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id !== particle.id)
    }, 2000)
  }
}

const pauseGame = () => {
  isPaused.value = true
}

const resumeGame = () => {
  isPaused.value = false
  if (currentLetter.value) {
    currentLetter.value.startTime += Date.now() - pauseStartTime
  }
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
  if (letterTimer) clearTimeout(letterTimer)
  if (comboTimer) clearTimeout(comboTimer)
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
  if (performanceStars.value >= 4) return '素晴らしい反応速度！'
  if (performanceStars.value >= 3) return 'とても良い結果です！'
  if (performanceStars.value >= 2) return '良い結果です！'
  return 'もう少し練習しましょう！'
}

// Keyboard controls
let pauseStartTime = 0
const handleKeyPress = (event) => {
  if (event.code === 'Space' && gameState.value === 'playing') {
    event.preventDefault()
    if (isPaused.value) {
      resumeGame()
    } else {
      pauseStartTime = Date.now()
      pauseGame()
    }
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
  // Preload audio files for the first level
  if (currentLevel.value) {
    currentLevel.value.phonemes.forEach(phoneme => {
      phonemeAudioService.preloadPhoneme(phoneme)
    })
  }
})

onUnmounted(() => {
  clearAllTimers()
  window.removeEventListener('keydown', handleKeyPress)
})

// Watch for level changes to preload audio
watch(selectedLevel, (newLevel) => {
  const level = gameLevels.find(l => l.id === newLevel)
  if (level) {
    level.phonemes.forEach(phoneme => {
      phonemeAudioService.preloadPhoneme(phoneme)
    })
  }
})
</script>

<style scoped>
.sound-impact-game {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  overflow: hidden;
}

/* Background animations */
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
  transition: all 0.5s ease;
}

.nebula-effect.combo-mode {
  background: radial-gradient(ellipse at 30% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 60%);
  animation: nebula-drift 8s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes nebula-drift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
}

/* UI Components */
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
  border: 1px solid rgba(79, 172, 254, 0.5);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.galaxy-button:hover {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  border: none;
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(100, 116, 139, 0.3) 0%, 
    rgba(71, 85, 105, 0.3) 100%);
  border: 1px solid rgba(100, 116, 139, 0.5);
}

/* Level selection */
.level-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.8) 100%);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-card:hover {
  border-color: rgba(59, 130, 246, 0.6);
  transform: translateY(-2px);
}

.level-card.selected {
  border-color: #4FACFE;
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

/* Game HUD */
.sound-display {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.sound-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sound-card.playing {
  animation: pulse-glow 1s infinite;
}

.sound-icon {
  font-size: 1.5rem;
}

.current-sound {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4FACFE;
}

.play-again-btn {
  background: rgba(79, 172, 254, 0.2);
  border: 1px solid rgba(79, 172, 254, 0.4);
  border-radius: 6px;
  padding: 0.25rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-again-btn:hover {
  background: rgba(79, 172, 254, 0.4);
}

.game-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 0.5rem;
  min-width: 60px;
}

.stat-label {
  font-size: 0.75rem;
  color: #94A3B8;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
}

.combo-glow {
  color: #10B981;
  text-shadow: 0 0 10px #10B981;
  animation: combo-pulse 0.5s infinite alternate;
}

.life-display {
  display: flex;
  gap: 0.125rem;
}

.life-heart {
  font-size: 0.875rem;
}

.life-heart.lost {
  opacity: 0.3;
}

/* Game Arena */
.game-arena {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.moving-letter {
  position: absolute;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  user-select: none;
  z-index: 10;
  filter: drop-shadow(0 0 10px currentColor);
  transition: transform 0.1s ease-out;
}

.moving-letter:hover {
  transform: scale(1.1) !important;
}

.moving-letter.hit-effect {
  animation: hit-flash 0.2s ease-out;
}

.letter-symbol {
  position: relative;
  z-index: 2;
}

.letter-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  opacity: 0.3;
  border-radius: 50%;
  z-index: 1;
}

/* Particles */
.particle {
  position: absolute;
  pointer-events: none;
  z-index: 15;
  font-size: 24px;
}

.particle.success {
  color: #10B981;
  text-shadow: 0 0 10px #10B981;
}

.particle.error {
  color: #EF4444;
  text-shadow: 0 0 10px #EF4444;
}

.particle.miss {
  color: #6B7280;
  text-shadow: 0 0 10px #6B7280;
}

/* Combo Display */
.combo-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  text-align: center;
  pointer-events: none;
}

.combo-text {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px currentColor;
}

.combo-number {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 0 0 30px currentColor;
}

.combo-normal {
  color: #10B981;
  animation: combo-bounce 1s ease-out;
}

.combo-super {
  color: #3B82F6;
  animation: combo-bounce 1s ease-out, rainbow-glow 2s infinite;
}

.combo-mega {
  color: #8B5CF6;
  animation: combo-bounce 1s ease-out, mega-pulse 0.5s infinite, rainbow-glow 1s infinite;
}

/* Pause Menu */
.pause-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.pause-menu {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(15px);
}

/* Score Display */
.score-display {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Results */
.performance-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  font-size: 1.5rem;
}

.star {
  opacity: 0.3;
  transition: all 0.3s ease;
}

.star.filled {
  opacity: 1;
  filter: drop-shadow(0 0 5px gold);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4FACFE;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #94A3B8;
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(79, 172, 254, 0.5); }
  50% { box-shadow: 0 0 20px rgba(79, 172, 254, 0.8); }
}

@keyframes combo-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes hit-flash {
  0% { filter: brightness(1) drop-shadow(0 0 10px currentColor); }
  50% { filter: brightness(2) drop-shadow(0 0 20px currentColor); }
  100% { filter: brightness(1) drop-shadow(0 0 10px currentColor); }
}

@keyframes combo-bounce {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes rainbow-glow {
  0% { text-shadow: 0 0 20px #ff0000; }
  16% { text-shadow: 0 0 20px #ff8000; }
  33% { text-shadow: 0 0 20px #ffff00; }
  50% { text-shadow: 0 0 20px #00ff00; }
  66% { text-shadow: 0 0 20px #0080ff; }
  83% { text-shadow: 0 0 20px #8000ff; }
  100% { text-shadow: 0 0 20px #ff0000; }
}

@keyframes mega-pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.cosmic-text {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>