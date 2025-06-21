<template>
  <div class="min-h-screen galaxy-background overflow-hidden">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- Dynamic battle effects -->
    <div class="battle-arena-effect"></div>
    <div v-if="gameState === 'battle'" class="laser-effects"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="galaxy-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 cosmic-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold galaxy-text-primary cosmic-title mb-2">
              🚀 フォニーム・シューター
            </h1>
            <p class="text-galaxy-moon-silver text-lg">音素を発射して敵を撃墜せよ！リアルタイムアクションバトル</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 cosmic-glow" />
          </button>
        </div>

        <!-- Game Stats -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4" v-if="gameState === 'battle'">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">💗</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ playerHealth }}</div>
            <div class="text-sm text-galaxy-moon-silver">Health</div>
          </div>
          
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">⚡</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ energy }}</div>
            <div class="text-sm text-galaxy-moon-silver">Energy</div>
          </div>

          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🎯</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ score }}</div>
            <div class="text-sm text-galaxy-moon-silver">Score</div>
          </div>

          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">🔥</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ combo }}x</div>
            <div class="text-sm text-galaxy-moon-silver">Combo</div>
          </div>

          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1 cosmic-glow">👾</div>
            <div class="font-bold text-lg galaxy-text-primary">{{ enemiesDestroyed }}</div>
            <div class="text-sm text-galaxy-moon-silver">Defeated</div>
          </div>
        </div>
      </div>

      <!-- Arena Selection -->
      <div v-if="gameState === 'menu'" class="space-y-6">
        <div class="galaxy-card rounded-3xl p-6">
          <h2 class="text-2xl font-bold galaxy-text-primary cosmic-title mb-4 text-center">
            🌟 戦闘モード選択
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="mode in gameModes"
              :key="mode.id"
              @click="selectGameMode(mode)"
              class="galaxy-card p-6 cursor-pointer hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-purple-400"
            >
              <div class="text-center">
                <div class="text-6xl mb-4">{{ mode.icon }}</div>
                <h3 class="text-xl font-bold galaxy-text-primary mb-2">{{ mode.name }}</h3>
                <p class="text-galaxy-moon-silver mb-4">{{ mode.description }}</p>
                <div class="text-sm text-yellow-400">
                  <div>難易度: {{ mode.difficulty }}</div>
                  <div>制限時間: {{ mode.timeLimit }}秒</div>
                  <div>敵の数: {{ mode.enemyCount }}体</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Battle Game Screen -->
      <div v-else-if="gameState === 'battle'" class="space-y-4">
        <!-- Game Canvas -->
        <div class="galaxy-card rounded-3xl p-4 relative" style="height: 500px;">
          <!-- Player Ship -->
          <div 
            class="player-ship absolute bottom-4 transition-all duration-100"
            :style="{ left: playerPosition + 'px' }"
          >
            <div class="text-4xl">🚀</div>
          </div>

          <!-- Player Bullets -->
          <div
            v-for="bullet in playerBullets"
            :key="bullet.id"
            class="absolute w-2 h-6 bg-cyan-400 rounded-full bullet-glow"
            :style="{ left: bullet.x + 'px', top: bullet.y + 'px' }"
          ></div>

          <!-- Enemies -->
          <div
            v-for="enemy in enemies"
            :key="enemy.id"
            class="absolute enemy transition-all duration-200"
            :style="{ left: enemy.x + 'px', top: enemy.y + 'px' }"
          >
            <div class="text-center">
              <div class="text-3xl mb-1">👾</div>
              <div class="text-lg font-bold text-white bg-red-500/80 rounded px-2 py-1">
                {{ enemy.phoneme }}
              </div>
              <div class="w-12 h-2 bg-gray-600 rounded mt-1">
                <div 
                  class="bg-red-500 h-2 rounded transition-all duration-200"
                  :style="{ width: (enemy.health / enemy.maxHealth) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Enemy Bullets -->
          <div
            v-for="bullet in enemyBullets"
            :key="bullet.id"
            class="absolute w-2 h-6 bg-red-500 rounded-full"
            :style="{ left: bullet.x + 'px', top: bullet.y + 'px' }"
          ></div>

          <!-- Power-ups -->
          <div
            v-for="powerup in powerups"
            :key="powerup.id"
            class="absolute text-2xl animate-bounce powerup-glow"
            :style="{ left: powerup.x + 'px', top: powerup.y + 'px' }"
          >
            {{ powerup.icon }}
          </div>

          <!-- Explosions -->
          <div
            v-for="explosion in explosions"
            :key="explosion.id"
            class="absolute text-4xl animate-ping"
            :style="{ left: explosion.x + 'px', top: explosion.y + 'px' }"
          >
            💥
          </div>
        </div>

        <!-- Game Controls -->
        <div class="galaxy-card rounded-3xl p-6">
          <!-- Target Phoneme Display -->
          <div class="text-center mb-6">
            <div class="text-lg galaxy-text-primary font-bold mb-2">🎯 Target Sound</div>
            <div class="flex justify-center items-center gap-4">
              <div class="text-4xl font-bold galaxy-text-primary cosmic-glow">
                {{ currentTargetPhoneme?.symbol || '' }}
              </div>
              <button 
                @click="playTargetPhoneme"
                :disabled="isPlaying"
                class="galaxy-button galaxy-button-primary px-4 py-2 text-white rounded-xl"
              >
                🔊 Listen
              </button>
            </div>
            <div class="text-sm text-galaxy-moon-silver mt-2">
              Shoot enemies with this phoneme to destroy them!
            </div>
          </div>

          <!-- Weapon Selection -->
          <div class="mb-6">
            <div class="text-lg galaxy-text-primary font-bold text-center mb-4">🔫 Select Weapon (Phoneme)</div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
              <button
                v-for="weapon in availableWeapons"
                :key="weapon.symbol"
                @click="selectWeapon(weapon)"
                :class="[
                  'galaxy-card p-3 text-center transition-all duration-200 border-2',
                  selectedWeapon?.symbol === weapon.symbol 
                    ? 'border-cyan-400 bg-cyan-400/20 scale-110' 
                    : 'border-transparent hover:border-blue-400'
                ]"
              >
                <div class="text-2xl font-bold galaxy-text-primary">{{ weapon.symbol }}</div>
                <div class="text-xs text-galaxy-moon-silver">{{ weapon.example }}</div>
              </button>
            </div>
          </div>

          <!-- Mobile Controls -->
          <div class="md:hidden">
            <div class="flex justify-center gap-4 mb-4">
              <button 
                @touchstart="startMove('left')"
                @touchend="stopMove"
                @mousedown="startMove('left')"
                @mouseup="stopMove"
                class="galaxy-button galaxy-button-secondary px-6 py-3 text-2xl"
              >
                ←
              </button>
              <button 
                @click="shoot"
                :disabled="!selectedWeapon || energy < 10"
                class="galaxy-button galaxy-button-primary px-6 py-3 text-2xl disabled:opacity-50"
              >
                🔫
              </button>
              <button 
                @touchstart="startMove('right')"
                @touchend="stopMove"
                @mousedown="startMove('right')"
                @mouseup="stopMove"
                class="galaxy-button galaxy-button-secondary px-6 py-3 text-2xl"
              >
                →
              </button>
            </div>
          </div>

          <!-- Instructions -->
          <div class="text-center text-sm text-galaxy-moon-silver">
            <div class="md:block hidden">🖱️ Move mouse to aim, Click to shoot, WASD/Arrow keys to move</div>
            <div class="md:hidden">👆 Use buttons to move and shoot</div>
          </div>
        </div>

        <!-- Game Timer -->
        <div class="galaxy-card rounded-3xl p-4">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold galaxy-text-primary">⏰ Time: {{ timeLeft }}s</div>
            <div class="w-64 bg-gray-700 rounded-full h-4">
              <div 
                class="bg-gradient-to-r from-green-400 to-yellow-400 h-4 rounded-full transition-all duration-1000"
                :style="{ width: `${(timeLeft / gameTimeLimit) * 100}%` }"
              />
            </div>
            <div class="text-lg font-bold galaxy-text-primary">Wave {{ currentWave }}</div>
          </div>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div v-else-if="gameState === 'gameOver'" class="galaxy-card rounded-3xl p-8 text-center">
        <div class="text-6xl mb-4">{{ isVictory ? '🏆' : '💀' }}</div>
        <h2 class="text-3xl font-bold galaxy-text-primary mb-4">
          {{ isVictory ? 'Victory!' : 'Game Over!' }}
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-md mx-auto">
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1">🎯</div>
            <div class="font-bold text-lg">{{ finalScore }}</div>
            <div class="text-sm">Score</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1">👾</div>
            <div class="font-bold text-lg">{{ finalEnemiesDestroyed }}</div>
            <div class="text-sm">Defeated</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1">🔥</div>
            <div class="font-bold text-lg">{{ maxCombo }}</div>
            <div class="text-sm">Max Combo</div>
          </div>
          <div class="galaxy-stats-card">
            <div class="text-2xl mb-1">🎯</div>
            <div class="font-bold text-lg">{{ Math.round(accuracy * 100) }}%</div>
            <div class="text-sm">Accuracy</div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button 
            @click="restartGame" 
            class="galaxy-button galaxy-button-primary px-6 py-3 font-bold"
          >
            🔄 Play Again
          </button>
          <button 
            @click="gameState = 'menu'" 
            class="galaxy-button galaxy-button-secondary px-6 py-3 font-bold"
          >
            📋 Select Mode
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings } from 'lucide-vue-next'
import { NATIVE_PHONEME_PROGRESSION, NATIVE_AUDIO_MAPPING } from '@/data/native-phoneme-database.js'
import { useGameAudio } from '@/composables/useGameAudio.js'

const router = useRouter()
const { playSound, isPlaying } = useGameAudio()

// Game State
const gameState = ref('menu') // 'menu', 'battle', 'gameOver'
const currentGameMode = ref(null)
const showSettings = ref(false)

// Game Modes
const gameModes = ref([
  {
    id: 'easy',
    name: 'ビギナーバトル',
    icon: '🌱',
    description: '初心者向け。ゆっくりとした敵、基本音素のみ',
    difficulty: 'Easy',
    timeLimit: 120,
    enemyCount: 15,
    enemySpeed: 1,
    phonemeSet: 'stage1A'
  },
  {
    id: 'normal',
    name: 'アドバンスファイト',
    icon: '⚔️',
    description: '中級者向け。様々な音素、パワーアップあり',
    difficulty: 'Normal',
    timeLimit: 90,
    enemyCount: 25,
    enemySpeed: 2,
    phonemeSet: 'stage1B'
  },
  {
    id: 'hard',
    name: 'エクストリームウォー',
    icon: '🔥',
    description: '上級者向け。高速敵、全音素、ボス戦あり',
    difficulty: 'Hard',
    timeLimit: 60,
    enemyCount: 40,
    enemySpeed: 3,
    phonemeSet: 'all'
  },
  {
    id: 'survival',
    name: 'サバイバルモード',
    icon: '♾️',
    description: '無限モード。どこまで生き残れるか？',
    difficulty: 'Extreme',
    timeLimit: 999,
    enemyCount: 999,
    enemySpeed: 2,
    phonemeSet: 'all'
  }
])

// Game Variables
const playerHealth = ref(100)
const energy = ref(100)
const score = ref(0)
const combo = ref(0)
const enemiesDestroyed = ref(0)
const timeLeft = ref(120)
const gameTimeLimit = ref(120)
const currentWave = ref(1)
const isVictory = ref(false)

// Final stats
const finalScore = ref(0)
const finalEnemiesDestroyed = ref(0)
const maxCombo = ref(0)
const accuracy = ref(0)
const totalShots = ref(0)
const successfulHits = ref(0)

// Player
const playerPosition = ref(300)
const selectedWeapon = ref(null)

// Game Objects
const enemies = ref([])
const playerBullets = ref([])
const enemyBullets = ref([])
const powerups = ref([])
const explosions = ref([])

// Phonemes
const currentTargetPhoneme = ref(null)
const availableWeapons = ref([])

// Input handling
const keys = reactive({
  left: false,
  right: false,
  up: false,
  down: false
})

// Movement
const moveSpeed = 5
const isMoving = ref(false)
const moveDirection = ref('')

// Game Loop
let gameLoop = null
let enemySpawnTimer = null
let gameTimer = null

// Initialize phonemes based on game mode
const initializePhonemes = (phonemeSet) => {
  let phonemeList = []
  
  if (phonemeSet === 'stage1A') {
    phonemeList = NATIVE_PHONEME_PROGRESSION.stage1A
  } else if (phonemeSet === 'stage1B') {
    phonemeList = [...NATIVE_PHONEME_PROGRESSION.stage1A, ...NATIVE_PHONEME_PROGRESSION.stage1B]
  } else {
    phonemeList = Object.values(NATIVE_PHONEME_PROGRESSION).flat()
  }
  
  availableWeapons.value = phonemeList.slice(0, 6) // Show 6 weapons at a time
  setNewTargetPhoneme()
}

const setNewTargetPhoneme = () => {
  const phonemeList = Object.values(NATIVE_PHONEME_PROGRESSION).flat()
  currentTargetPhoneme.value = phonemeList[Math.floor(Math.random() * phonemeList.length)]
}

const selectGameMode = (mode) => {
  currentGameMode.value = mode
  startGame()
}

const startGame = () => {
  gameState.value = 'battle'
  resetGameStats()
  initializePhonemes(currentGameMode.value.phonemeSet)
  
  gameTimeLimit.value = currentGameMode.value.timeLimit
  timeLeft.value = currentGameMode.value.timeLimit
  
  startGameLoop()
  startEnemySpawning()
  startGameTimer()
}

const resetGameStats = () => {
  playerHealth.value = 100
  energy.value = 100
  score.value = 0
  combo.value = 0
  enemiesDestroyed.value = 0
  currentWave.value = 1
  
  enemies.value = []
  playerBullets.value = []
  enemyBullets.value = []
  powerups.value = []
  explosions.value = []
  
  totalShots.value = 0
  successfulHits.value = 0
  playerPosition.value = 300
}

const selectWeapon = (weapon) => {
  selectedWeapon.value = weapon
}

const playTargetPhoneme = async () => {
  if (!currentTargetPhoneme.value || isPlaying.value) return
  
  try {
    // Create a synthetic word for the phoneme
    const phonemeWord = currentTargetPhoneme.value.examples?.[0] || 'sound'
    await playSound('word', { word: phonemeWord })
  } catch (error) {
    console.error('Error playing target phoneme:', error)
  }
}

const shoot = () => {
  if (!selectedWeapon.value || energy.value < 10) return
  
  totalShots.value++
  energy.value -= 10
  
  // Create bullet
  const bullet = {
    id: Date.now() + Math.random(),
    x: playerPosition.value + 15,
    y: 450,
    phoneme: selectedWeapon.value.symbol,
    speed: 8
  }
  
  playerBullets.value.push(bullet)
  
  // Play shoot sound
  playSound('effect', 'button')
}

const spawnEnemy = () => {
  const availablePhonemes = Object.values(NATIVE_PHONEME_PROGRESSION).flat()
  const randomPhoneme = availablePhonemes[Math.floor(Math.random() * availablePhonemes.length)]
  
  const enemy = {
    id: Date.now() + Math.random(),
    x: Math.random() * 550,
    y: -50,
    phoneme: randomPhoneme.symbol,
    health: 1,
    maxHealth: 1,
    speed: currentGameMode.value?.enemySpeed || 2,
    shootTimer: Math.random() * 3000 + 1000 // Random shoot interval
  }
  
  enemies.value.push(enemy)
}

const spawnPowerup = () => {
  if (Math.random() < 0.3) { // 30% chance
    const powerup = {
      id: Date.now() + Math.random(),
      x: Math.random() * 550,
      y: -30,
      type: Math.random() < 0.5 ? 'health' : 'energy',
      icon: Math.random() < 0.5 ? '💗' : '⚡',
      speed: 2
    }
    powerups.value.push(powerup)
  }
}

const createExplosion = (x, y) => {
  const explosion = {
    id: Date.now() + Math.random(),
    x: x - 20,
    y: y - 20
  }
  explosions.value.push(explosion)
  
  setTimeout(() => {
    explosions.value = explosions.value.filter(e => e.id !== explosion.id)
  }, 500)
}

const checkCollisions = () => {
  // Player bullets vs enemies
  playerBullets.value.forEach(bullet => {
    enemies.value.forEach(enemy => {
      if (Math.abs(bullet.x - enemy.x) < 30 && Math.abs(bullet.y - enemy.y) < 30) {
        // Check if phoneme matches target
        if (bullet.phoneme === currentTargetPhoneme.value?.symbol) {
          // Correct hit
          createExplosion(enemy.x, enemy.y)
          enemies.value = enemies.value.filter(e => e.id !== enemy.id)
          playerBullets.value = playerBullets.value.filter(b => b.id !== bullet.id)
          
          successfulHits.value++
          combo.value++
          enemiesDestroyed.value++
          score.value += 100 + (combo.value * 10)
          
          if (combo.value > maxCombo.value) {
            maxCombo.value = combo.value
          }
          
          playSound('effect', 'correct')
          
          // Occasionally change target
          if (Math.random() < 0.2) {
            setNewTargetPhoneme()
          }
        } else {
          // Wrong hit
          playerBullets.value = playerBullets.value.filter(b => b.id !== bullet.id)
          combo.value = 0
          playSound('effect', 'incorrect')
        }
      }
    })
  })
  
  // Enemy bullets vs player
  enemyBullets.value.forEach(bullet => {
    if (Math.abs(bullet.x - (playerPosition.value + 15)) < 25 && bullet.y > 430) {
      enemyBullets.value = enemyBullets.value.filter(b => b.id !== bullet.id)
      playerHealth.value -= 10
      combo.value = 0
      
      if (playerHealth.value <= 0) {
        endGame(false)
      }
    }
  })
  
  // Powerups vs player
  powerups.value.forEach(powerup => {
    if (Math.abs(powerup.x - (playerPosition.value + 15)) < 30 && powerup.y > 430) {
      powerups.value = powerups.value.filter(p => p.id !== powerup.id)
      
      if (powerup.type === 'health') {
        playerHealth.value = Math.min(100, playerHealth.value + 20)
      } else if (powerup.type === 'energy') {
        energy.value = Math.min(100, energy.value + 30)
      }
      
      playSound('effect', 'levelUp')
    }
  })
  
  // Enemies reaching bottom
  enemies.value.forEach(enemy => {
    if (enemy.y > 500) {
      enemies.value = enemies.value.filter(e => e.id !== enemy.id)
      playerHealth.value -= 5
      combo.value = 0
    }
  })
}

const updateGame = () => {
  // Move player bullets
  playerBullets.value.forEach(bullet => {
    bullet.y -= bullet.speed
  })
  playerBullets.value = playerBullets.value.filter(bullet => bullet.y > -10)
  
  // Move enemies
  enemies.value.forEach(enemy => {
    enemy.y += enemy.speed
    
    // Enemy shooting
    enemy.shootTimer -= 16
    if (enemy.shootTimer <= 0 && Math.random() < 0.01) {
      enemyBullets.value.push({
        id: Date.now() + Math.random(),
        x: enemy.x + 15,
        y: enemy.y + 30,
        speed: 4
      })
      enemy.shootTimer = Math.random() * 2000 + 1000
    }
  })
  
  // Move enemy bullets
  enemyBullets.value.forEach(bullet => {
    bullet.y += bullet.speed
  })
  enemyBullets.value = enemyBullets.value.filter(bullet => bullet.y < 520)
  
  // Move powerups
  powerups.value.forEach(powerup => {
    powerup.y += powerup.speed
  })
  powerups.value = powerups.value.filter(powerup => powerup.y < 520)
  
  // Handle player movement
  if (keys.left && playerPosition.value > 0) {
    playerPosition.value -= moveSpeed
  }
  if (keys.right && playerPosition.value < 570) {
    playerPosition.value += moveSpeed
  }
  
  // Mobile movement
  if (isMoving.value) {
    if (moveDirection.value === 'left' && playerPosition.value > 0) {
      playerPosition.value -= moveSpeed
    }
    if (moveDirection.value === 'right' && playerPosition.value < 570) {
      playerPosition.value += moveSpeed
    }
  }
  
  // Regenerate energy
  if (energy.value < 100) {
    energy.value = Math.min(100, energy.value + 0.5)
  }
  
  checkCollisions()
}

const startGameLoop = () => {
  gameLoop = setInterval(updateGame, 16) // 60 FPS
}

const startEnemySpawning = () => {
  enemySpawnTimer = setInterval(() => {
    if (enemies.value.length < 8) { // Max 8 enemies on screen
      spawnEnemy()
    }
    spawnPowerup()
  }, 1500)
}

const startGameTimer = () => {
  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame(true)
    }
    
    // Increase wave every 20 seconds
    if (timeLeft.value % 20 === 0) {
      currentWave.value++
    }
  }, 1000)
}

const endGame = (victory) => {
  isVictory.value = victory
  gameState.value = 'gameOver'
  
  finalScore.value = score.value
  finalEnemiesDestroyed.value = enemiesDestroyed.value
  accuracy.value = totalShots.value > 0 ? successfulHits.value / totalShots.value : 0
  
  clearInterval(gameLoop)
  clearInterval(enemySpawnTimer)
  clearInterval(gameTimer)
  
  playSound('effect', victory ? 'complete' : 'gameEnd')
}

const restartGame = () => {
  startGame()
}

// Input handling
const handleKeyDown = (event) => {
  switch(event.key.toLowerCase()) {
    case 'a':
    case 'arrowleft':
      keys.left = true
      break
    case 'd':
    case 'arrowright':
      keys.right = true
      break
    case ' ':
    case 'enter':
      event.preventDefault()
      shoot()
      break
  }
}

const handleKeyUp = (event) => {
  switch(event.key.toLowerCase()) {
    case 'a':
    case 'arrowleft':
      keys.left = false
      break
    case 'd':
    case 'arrowright':
      keys.right = false
      break
  }
}

// Mobile controls
const startMove = (direction) => {
  isMoving.value = true
  moveDirection.value = direction
}

const stopMove = () => {
  isMoving.value = false
  moveDirection.value = ''
}

const handleBack = () => {
  if (gameLoop) clearInterval(gameLoop)
  if (enemySpawnTimer) clearInterval(enemySpawnTimer)
  if (gameTimer) clearInterval(gameTimer)
  router.back()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  if (gameLoop) clearInterval(gameLoop)
  if (enemySpawnTimer) clearInterval(enemySpawnTimer)
  if (gameTimer) clearInterval(gameTimer)
})
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.6) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

.cosmic-title {
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.8);
}

/* Battle Arena Effects */
.battle-arena-effect {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, 
    rgba(255, 0, 100, 0.1) 0%, 
    transparent 50%);
  animation: battle-pulse 3s ease-in-out infinite;
  pointer-events: none;
}

.laser-effects {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.05) 25%, 
    transparent 50%, 
    rgba(255, 0, 255, 0.05) 75%, 
    transparent 100%);
  animation: laser-sweep 2s linear infinite;
  pointer-events: none;
}

/* Game-specific animations */
.bullet-glow {
  box-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF;
  animation: bullet-trail 0.1s linear infinite;
}

.powerup-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: powerup-float 2s ease-in-out infinite;
}

.player-ship {
  filter: drop-shadow(0 0 15px #00FFFF);
  z-index: 10;
}

.enemy {
  filter: drop-shadow(0 0 8px #FF0000);
  animation: enemy-hover 1s ease-in-out infinite alternate;
}

/* Keyframe animations */
@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes battle-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

@keyframes laser-sweep {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

@keyframes bullet-trail {
  0% { box-shadow: 0 0 5px #00FFFF; }
  100% { box-shadow: 0 0 15px #00FFFF, 0 0 25px #00FFFF; }
}

@keyframes powerup-float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-10px); }
}

@keyframes enemy-hover {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-5px); }
}

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Hover effects for galaxy cards */
.galaxy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

/* Hover effects for buttons */
.galaxy-button:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 0 25px rgba(79, 172, 254, 0.6),
    inset 0 0 25px rgba(0, 242, 254, 0.3);
}

/* Transitions */
.battle-result-enter-active, .battle-result-leave-active {
  transition: all 0.5s ease;
}

.battle-result-enter-from, .battle-result-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>