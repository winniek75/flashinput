<template>
  <div class="min-h-screen galaxy-background">
    <!-- Enhanced Setup Screen -->
    <main class="relative z-10 min-h-screen" v-if="gameState === 'setup'">
      <!-- Animated Space Background for Setup -->
      <div class="setup-space-background">
        <div class="setup-stars-field"></div>
        <div class="setup-nebula-clouds"></div>
        <div class="setup-energy-streams">
          <div v-for="i in 6" :key="i" class="energy-stream" :style="getEnergyStreamStyle(i)"></div>
        </div>
        <div class="setup-floating-particles">
          <div v-for="i in 15" :key="i" class="floating-particle" :style="getParticleStyle(i)"></div>
        </div>
      </div>
      
      <!-- Central Command Interface -->
      <div class="flex flex-col items-center justify-start relative z-20 py-8 px-4">
        <div class="command-center-interface">
          <!-- Header Section -->
          <div class="command-header">
            <div class="mission-emblem">
              <div class="emblem-ring"></div>
              <div class="emblem-core">🚀</div>
              <div class="emblem-glow"></div>
            </div>
            <h1 class="mission-title">
              <span class="title-main">PROGRESSIVE TENSE</span>
              <span class="title-sub">MASTER</span>
            </h1>
            <p class="mission-description">
              進行形マスターミッション - 時間の流れを操り、進行形を習得せよ！
            </p>
          </div>

          <!-- Mission Briefing Panel -->
          <div class="mission-briefing">
            <div class="briefing-header">
              <span class="briefing-icon">🎯</span>
              <span class="briefing-title">MISSION PARAMETERS</span>
            </div>
            <div class="briefing-content">
              <div class="objective-item">
                <span class="objective-icon">⚔️</span>
                <span>時間の障害物を避けながら正しい進行形を選択</span>
              </div>
              <div class="objective-item">
                <span class="objective-icon">⚡</span>
                <span>正解でスピードブースト、不正解でライフ減少</span>
              </div>
              <div class="objective-item">
                <span class="objective-icon">🏆</span>
                <span>2選の選択肢から瞬時に判断してレーン移動</span>
              </div>
            </div>
          </div>

          <!-- Difficulty Selection Interface -->
          <div class="difficulty-selection-panel">
            <div class="panel-header">
              <span class="panel-icon">🎮</span>
              <span class="panel-title">DIFFICULTY MATRIX</span>
            </div>
            <div class="difficulty-grid">
              <div 
                v-for="level in difficultyLevels" 
                :key="level.id"
                @click="selectedDifficulty = level.id"
                class="difficulty-option"
                :class="{ 'selected': selectedDifficulty === level.id }"
              >
                <div class="difficulty-indicator" :class="level.id">
                  <div class="indicator-ring"></div>
                  <div class="indicator-core">{{ level.icon }}</div>
                </div>
                <div class="difficulty-info">
                  <div class="difficulty-name">{{ level.name }}</div>
                  <div class="difficulty-desc">{{ level.description }}</div>
                  <div class="difficulty-stats">
                    <span class="stat-item">
                      <span class="stat-icon">⏱️</span>
                      <span>{{ getDifficultyTime(level.id) }}s</span>
                    </span>
                    <span class="stat-item">
                      <span class="stat-icon">🎯</span>
                      <span>{{ level.id === 'beginner' ? '2' : level.id === 'intermediate' ? '3' : '4' }}選</span>
                    </span>
                  </div>
                </div>
                <div class="selection-indicator" v-if="selectedDifficulty === level.id">
                  <span class="indicator-check">✓</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Launch Controls -->
          <div class="launch-controls">
            <button 
              @click="startGame"
              class="launch-button"
              :class="{ 'ready': selectedDifficulty, 'disabled': !selectedDifficulty }"
              :disabled="!selectedDifficulty"
            >
              <div class="launch-button-content">
                <div class="launch-icon">🚀</div>
                <div class="launch-text">
                  <span class="launch-main">INITIATE MISSION</span>
                  <span class="launch-sub">Progressive Tense Master</span>
                </div>
                <div class="launch-arrow">➤</div>
              </div>
              <div class="launch-energy-bar" v-if="selectedDifficulty">
                <div class="energy-fill"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Game Screen (Racing) -->
    <main class="fixed inset-0 z-10 flex flex-col" v-if="gameState === 'playing'">
      <!-- Animated Space Background -->
      <div class="space-background">
        <div class="stars-field" :style="{ animationDuration: Math.max(10, 35 - autoSpeed * 5) + 's' }"></div>
        <div class="nebula-clouds"></div>
      </div>
      
      <div class="relative z-50 flex-1">
        <!-- Racing Track with Player -->
        <div class="racing-track" :data-speed="currentSpeed > baseSpeed + 20 ? 'fast' : currentSpeed < baseSpeed ? 'slow' : 'normal'">
          <!-- Lane Indicators -->
          <div class="lane-indicators">
            <div class="lane-line lane-line-1" :style="{ animationDuration: Math.max(0.5, 2.5 - autoSpeed * 0.3) + 's' }"></div>
            <div class="lane-line lane-line-2" :style="{ animationDuration: Math.max(0.5, 2.5 - autoSpeed * 0.3) + 's' }"></div>
            <div class="lane-line lane-line-3" :style="{ animationDuration: Math.max(0.5, 2.5 - autoSpeed * 0.3) + 's' }"></div>
            <div class="lane-line lane-line-4" :style="{ animationDuration: Math.max(0.5, 2.5 - autoSpeed * 0.3) + 's' }"></div>
          </div>
          
          <!-- Road Surface Animation -->
          <div class="road-surface"></div>
          
          <!-- Vehicle/Player (Fixed Position) -->
          <div class="player-vehicle" :style="{ 
            left: playerPosition.x + 'px',
            bottom: '200px'
          }">
            <div class="vehicle-body" :class="{ 
              'boosting': currentSpeed > baseSpeed + 20, 
              'invulnerable': isInvulnerable,
              'super-boost': currentSpeed > baseSpeed + 40
            }">
              🚀
            </div>
            <div class="vehicle-trail" v-if="currentSpeed > baseSpeed + 10" 
                 :style="{ height: Math.min(120, 60 + (currentSpeed - baseSpeed)) + 'px' }"></div>
            <div class="speed-lines" v-if="currentSpeed > baseSpeed + 30"></div>
          </div>
          
          <!-- Lane-Based Obstacles -->
          <div class="obstacle-lane" v-for="obstacle in obstacles" :key="obstacle.id" 
               :style="{ 
                 transform: `translateY(${obstacle.y}px) translateX(${obstacle.x}px)`,
                 zIndex: obstacle.y > 400 ? 25 : 15
               }">
            <div class="obstacle-body" :class="[obstacle.type, {
              'approaching': obstacle.y > 200 && obstacle.y < 500,
              'danger-zone': obstacle.y > 350 && obstacle.y < 500
            }]" 
            :style="{ 
              transform: `rotate(${obstacle.rotation}deg) scale(${Math.max(0.8, 1.5 - obstacle.y / 400)})`
            }">
              <div class="obstacle-icon">{{ obstacle.icon }}</div>
            </div>
          </div>
          
          <!-- Lane Guidelines (when answering) -->
          <div class="lane-guidelines" v-if="isAnswering">
            <div class="lane-guide lane-guide-0" :class="{ 'correct-guide': isLaneCorrect(0), 'player-guide': playerLane === 0 }"></div>
            <div class="lane-guide lane-guide-1" :class="{ 'correct-guide': isLaneCorrect(1), 'player-guide': playerLane === 1 }"></div>
          </div>
        </div>

        <!-- Racing Interface Overlay -->
        <div class="racing-interface">
          <!-- Speed and Distance Display -->
          <div class="speed-display">
            <!-- Back Button -->
            <button
              @click="goBack"
              class="back-button-game"
              title="ゲームを終了して戻る"
            >
              <span class="back-icon">←</span>
              <span class="back-text">戻る</span>
            </button>

            <div class="speed-meter" :class="{ 'boost': currentSpeed > baseSpeed + 20 }">
              <span class="speed-value">{{ Math.round(currentSpeed) }}</span>
              <span class="speed-unit">km/h</span>
            </div>
            <div class="distance-meter">
              <span class="distance-value">{{ Math.round(forwardProgress / 5) }}</span>
              <span class="distance-unit">m</span>
            </div>
            <div class="lives-display">
              <span class="lives-icon">💖</span>
              <span class="lives-value">{{ lives }}</span>
            </div>
            <div class="time-display">
              <span class="time-icon">⏱️</span>
              <span class="time-value">{{ Math.floor(timeRemaining / 60) }}:{{ String(timeRemaining % 60).padStart(2, '0') }}</span>
            </div>
          </div>
          
          <!-- Question is now displayed in the fixed answer panel -->
          
          <!-- Fixed Answer Panel at Bottom -->
          <div class="fixed-answer-panel" v-if="isAnswering && currentChallenge">
            <div class="answer-panel-header">
              <div class="question-display">{{ currentChallenge.prompt }}</div>
              <div class="time-bar">
                <div class="time-fill" :style="{ width: (selectionTimeLeft / selectionTimeMax * 100) + '%' }"></div>
              </div>
            </div>
            <div class="answer-options">
              <button 
                v-for="(option, index) in currentChallenge.options"
                :key="option.id"
                @click="selectAnswerAndMove(index, option)"
                class="answer-option-button"
                :class="{ 'selected': selectedOption === option.id }"
              >
                <div class="option-number">{{ index + 1 }}</div>
                <div class="option-text">{{ option.form }}</div>
                <div class="option-hint">Press {{ index + 1 }}</div>
              </button>
            </div>
          </div>
          
          <!-- Removed old answer control buttons - using fixed panel instead -->
          
          <!-- Controls hint removed - no longer needed -->

          <!-- Instant Feedback Popups -->
          <div class="instant-feedback" v-if="showBoostEffect">
            <div class="boost-popup">
              <div class="boost-icon">💥</div>
              <div class="boost-text">DEFENDED!</div>
              <div class="points-text">+100</div>
            </div>
          </div>
          
          <div class="instant-feedback" v-if="showCrashEffect">
            <div class="crash-popup">
              <div class="crash-icon">🔥</div>
              <div class="crash-text">FAILED TO DODGE!</div>
              <div class="damage-text">-1 Life</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Results Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'results'">
      <div class="max-w-6xl mx-auto">
        <!-- Results Header -->
        <div class="galaxy-card rounded-3xl p-8 shadow-2xl mb-8">
          <div class="text-center">
            <h2 class="text-4xl font-bold text-white mb-6 text-shadow-lg">🏆 Progressive Tense Master 結果</h2>
            
            <!-- Performance Rating -->
            <div class="mb-8">
              <div class="performance-rating p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20">
                <div class="text-2xl text-white font-bold text-shadow-sm mb-2">
                  {{ getPerformanceRating() }}
                </div>
                <div class="text-lg text-slate-300">あなたのパフォーマンス</div>
              </div>
            </div>
            
            <!-- Detailed Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-yellow-400/30">
                <div class="text-3xl font-bold text-yellow-400 text-shadow-md">{{ finalScore }}</div>
                <div class="text-lg text-white font-semibold">総合スコア</div>
              </div>
              <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-green-400/30">
                <div class="text-3xl font-bold text-green-400 text-shadow-md">{{ Math.round(accuracy * 100) }}%</div>
                <div class="text-lg text-white font-semibold">正答率</div>
              </div>
              <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-blue-400/30">
                <div class="text-3xl font-bold text-blue-400 text-shadow-md">{{ correctAnswers }}</div>
                <div class="text-lg text-white font-semibold">正解数</div>
              </div>
              <div class="result-stat p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-400/30">
                <div class="text-3xl font-bold text-purple-400 text-shadow-md">{{ totalAttempts }}</div>
                <div class="text-lg text-white font-semibold">総問題数</div>
              </div>
            </div>
            
            <!-- Additional Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="stat-detail p-4 bg-slate-800/40 rounded-xl">
                <div class="text-xl font-bold text-cyan-400">{{ Math.max(0, timeRemaining) }}秒</div>
                <div class="text-sm text-slate-300">残り時間</div>
              </div>
              <div class="stat-detail p-4 bg-slate-800/40 rounded-xl">
                <div class="text-xl font-bold text-orange-400">{{ comboCount }}</div>
                <div class="text-sm text-slate-300">連続正解</div>
              </div>
              <div class="stat-detail p-4 bg-slate-800/40 rounded-xl">
                <div class="text-xl font-bold text-pink-400">{{ difficultySettings[selectedDifficulty].name }}</div>
                <div class="text-sm text-slate-300">難易度</div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-4 justify-center">
              <button 
                @click="restartGame" 
                class="galaxy-button galaxy-button-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🔄 もう一度
              </button>
              <button 
                @click="changeDifficultyAndRestart" 
                class="galaxy-button galaxy-button-accent px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📊 難易度変更
              </button>
              <button 
                @click="$router.push('/grammar-galaxy-hub')" 
                class="galaxy-button galaxy-button-secondary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🌌 文法銀河へ戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { beginnerQuestions } from '@/data/progressiveTenseBeginnerQuestions.js'
import { intermediateQuestions } from '@/data/progressiveTenseIntermediateQuestions.js'
import { advancedQuestions } from '@/data/progressiveTenseAdvancedQuestions.js'

export default {
  name: 'ProgressiveTenseMaster',
  setup() {
    const router = useRouter()

    // Game state
    const gameState = ref('setup') // setup, playing, results
    const selectedDifficulty = ref('beginner')
    const selectedMode = ref('classic')
    const currentRound = ref(1)
    const totalRounds = ref(10)
    const lives = ref(3)
    const totalScore = ref(0)
    const correctAnswers = ref(0)
    const comboCount = ref(0)
    const maxComboCount = ref(0)
    const totalAttempts = ref(0)
    const timeRemaining = ref(120) // 120 seconds time limit
    const distanceTraveled = ref(0)
    const fuel = ref(100)
    const maxFuel = ref(100)
    const fuelLost = ref(0)
    const responseTimes = ref([])
    const masteredTenses = ref([])
    const earnedAchievements = ref([])
    const usedQuestionIds = ref([]) // Track used questions to avoid repeats
    
    // Player state  
    const playerPosition = ref({ x: 400, y: window.innerHeight * 0.8 }) // Fixed at 80% of screen height
    const playerLane = ref(0) // 0=left, 1=right
    const targetX = ref(400) // Target position for smooth movement
    const currentSpeed = ref(30) // Base auto-forward speed (much slower)
    const autoSpeed = ref(1.5) // Constant forward movement speed (much slower)
    const forwardProgress = ref(0) // Distance traveled forward
    const isInvulnerable = ref(false)
    const boostCharge = ref(0)
    const showBoostEffect = ref(false)
    const isBoosting = ref(false)
    const showCrashEffect = ref(false)
    const lastScoreGain = ref(0)
    const maxSpeed = ref(80) // Reduced max speed
    const baseSpeed = ref(30) // Much lower base speed
    const lanes = [300, 500] // X positions for left and right lanes
    const approachingObstacle = ref(null) // Currently approaching obstacle
    const isAnswering = ref(false) // Whether player is currently answering
    
    // Game objects
    const obstacles = ref([])
    const powerups = ref([])
    const visibleObstacles = ref([])
    const visiblePowerups = ref([])
    const currentChallenge = ref(null)
    const selectedOption = ref(null)
    const showResult = ref(false)
    const lastAnswerCorrect = ref(false)
    const showCollisionEffect = ref(false)
    const showVictoryScreen = ref(false)
    const lastObstacleSpawn = ref(0) // Distance since last obstacle spawn
    const obstacleSpawnDistance = ref(500) // Increased distance between obstacles for beginners
    
    // Game timing
    const gameInterval = ref(null)
    const animationFrameId = ref(null)
    const obstacleSpeed = ref(2) // Much slower obstacle approach
    const spawnRate = ref(0.02)
    const questionStartTime = ref(0)
    const selectionTimeLeft = ref(180) // More time to think (3 minutes)
    const selectionTimeMax = ref(180)
    const selectionTimer = ref(null)
    const gameTimer = ref(null)
    const lastFrameTime = ref(0)

    // Difficulty-based speed configuration
    const difficultySettings = {
      beginner: {
        baseSpeed: 20,
        autoSpeed: 1.0,
        maxSpeed: 50,
        obstacleSpeed: 1.0,  // Much slower obstacles for beginners
        spawnDistance: 400,   // Closer obstacles for more engagement
        timeLimit: 120,      // Generous time for learning
        selectionTime: 30,   // 30 seconds to answer (2択なので短め)
        optionCount: 2       // 2択
      },
      intermediate: {
        baseSpeed: 25,
        autoSpeed: 1.2,
        maxSpeed: 45,
        obstacleSpeed: 1.1,   // Much slower for better control
        spawnDistance: 400,
        timeLimit: 120,      // Generous time for learning
        selectionTime: 45,   // 45 seconds to answer (3-4択)
        optionCount: 3       // 3択
      },
      advanced: {
        baseSpeed: 60,
        autoSpeed: 3.0,
        maxSpeed: 120,
        obstacleSpeed: 2.5,   // Slower for better reaction time
        spawnDistance: 300,
        timeLimit: 120,      // Generous time for learning
        selectionTime: 60,   // 60 seconds to answer (4択以上)
        optionCount: 4       // 4択以上
      }
    }
    
    const difficultyLevels = [
      {
        id: 'beginner',
        name: '初級',
        icon: '🟢',
        description: '現在形 vs 現在進行形'
      },
      {
        id: 'intermediate', 
        name: '中級',
        icon: '🟡',
        description: '過去・未来進行形'
      },
      {
        id: 'advanced',
        name: '上級',
        icon: '🔴',
        description: '完了進行形'
      }
    ]

    // Comprehensive challenge database with proper difficulty levels
    const challengeDatabase = {
      beginner: beginnerQuestions,
      intermediate: intermediateQuestions,
      advanced: advancedQuestions
    }

    // Old database content removed - now using imported questions
    // Removed old inline database - now using imported questions from separate files

    // Get current challenge set based on difficulty and ensure proper format
    const getCurrentChallenges = () => {
      const challenges = challengeDatabase[selectedDifficulty.value] || challengeDatabase.beginner
      
      // Convert old format to new format if needed and shuffle all options
      return challenges.map((challenge, index) => {
        if (challenge.options) {
          // Already in correct format, but shuffle the options
          const shuffled = [...challenge.options]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          return {
            ...challenge,
            options: shuffled
          }
        }
        
        // Convert from old format (correctAnswer/wrongAnswers) to new format
        const options = []
        options.push({ 
          id: 'a', 
          form: challenge.correctAnswer, 
          speedBoost: 25, 
          isCorrect: true 
        })
        
        // Add wrong answers
        challenge.wrongAnswers.forEach((wrong, idx) => {
          options.push({ 
            id: String.fromCharCode(98 + idx), // 'b', 'c', etc.
            form: wrong, 
            speedBoost: 0, 
            isCorrect: false 
          })
        })
        
        // Properly shuffle options to randomize positions
        const shuffled = [...options]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        
        return {
          id: challenge.id,
          level: selectedDifficulty.value,
          tenseType: challenge.tenseType || 'mixed',
          obstacleType: index % 2 === 0 ? 'asteroid' : 'debris',
          prompt: challenge.prompt,
          options: shuffled,
          explanation: challenge.explanation
        }
      })
    }

    // Challenge generation
    const generateChallenge = () => {
      logger.log('Generating challenge...')
      const difficultyLevel = selectedDifficulty.value
      logger.log('Difficulty level:', difficultyLevel)
      
      // Get challenges for current difficulty level
      const availableChallenges = getCurrentChallenges()
      logger.log('Available challenges:', availableChallenges.length)
      
      if (availableChallenges.length === 0) {
        logger.error('No challenges available for level:', difficultyLevel)
        return
      }
      
      // Select random challenge from available pool
      const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
      
      currentChallenge.value = {
        ...randomChallenge,
        // Shuffle options for variety
        options: [...randomChallenge.options].sort(() => Math.random() - 0.5)
      }
      
      selectedOption.value = null
      showResult.value = false
      questionStartTime.value = Date.now()
      
      // Reset selection timer for racing mode
      selectionTimeLeft.value = selectionTimeMax.value
      
      // Console log for debugging
      logger.log(`Question ${currentRound.value}/${totalRounds.value}: ${randomChallenge.tenseType} - ${randomChallenge.prompt}`)
      logger.log('currentChallenge set:', currentChallenge.value)
      logger.log('showResult:', showResult.value)
    }

    // Game control functions
    const startGame = () => {
      logger.log('Starting game with difficulty:', selectedDifficulty.value)
      gameState.value = 'playing'
      
      // Apply difficulty settings
      const settings = difficultySettings[selectedDifficulty.value]
      baseSpeed.value = settings.baseSpeed
      autoSpeed.value = settings.autoSpeed
      maxSpeed.value = settings.maxSpeed
      obstacleSpeed.value = settings.obstacleSpeed
      obstacleSpawnDistance.value = settings.spawnDistance
      selectionTimeMax.value = settings.selectionTime
      
      // Reset game state
      forwardProgress.value = 0
      lastObstacleSpawn.value = 0
      currentSpeed.value = baseSpeed.value
      obstacles.value = []
      resetAnsweringState()
      timeRemaining.value = settings.timeLimit // Use difficulty-based time limit
      
      // Reset score and statistics
      totalScore.value = 0
      correctAnswers.value = 0
      totalAttempts.value = 0
      comboCount.value = 0
      currentRound.value = 1
      lives.value = 3
      
      // Start main game loop with requestAnimationFrame
      lastFrameTime.value = performance.now()
      animationFrameId.value = requestAnimationFrame(updateGame)
      
      // Add keyboard listeners
      window.addEventListener('keydown', handleKeyPress)
      
      // Start game timer (120 seconds)
      if (gameTimer.value) clearInterval(gameTimer.value)
      gameTimer.value = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          // Time's up - end game
          logger.log('Game ended due to time limit')
          logger.log('Final stats:', {
            totalScore: totalScore.value,
            correctAnswers: correctAnswers.value,
            totalAttempts: totalAttempts.value,
            comboCount: comboCount.value
          })
          
          gameState.value = 'results'
          if (animationFrameId.value) {
            cancelAnimationFrame(animationFrameId.value)
            animationFrameId.value = null
          }
          if (selectionTimer.value) clearInterval(selectionTimer.value)
          if (gameTimer.value) clearInterval(gameTimer.value)
          window.removeEventListener('keydown', handleKeyPress)
        }
      }, 1000)
      
      // Spawn first obstacle quickly for immediate engagement
      setTimeout(() => {
        spawnObstacleWithProblem()
      }, 500)
    }

    // Legacy functions - no longer needed with lane-based system
    const selectOption = (optionId) => {
      selectedOption.value = optionId
    }

    const submitAnswer = () => {
      // Lane-based system handles answers automatically through collision detection
    }
    
    // Legacy functions - now handled by lane system
    const handleCorrectAnswer = () => {
      // This is now handled by handleLaneAnswer
    }
    
    const handleWrongAnswer = () => {
      // This is now handled by handleLaneAnswer
    }
    
    const resetAnsweringState = () => {
      isAnswering.value = false
      currentChallenge.value = null
      approachingObstacle.value = null
      selectedOption.value = null
      showResult.value = false
      
      if (selectionTimer.value) {
        clearInterval(selectionTimer.value)
        selectionTimer.value = null
      }
    }
    
    // Helper function to check if a lane contains the correct answer
    const isLaneCorrect = (laneIndex) => {
      if (!isAnswering.value) return false
      
      const laneObstacle = obstacles.value.find(obs => 
        obs.lane === laneIndex && 
        obs.hasTriggeredQuestion && 
        obs.y > 0 && obs.y < 600
      )
      
      return laneObstacle ? laneObstacle.isCorrectAnswer : false
    }
    
    // Get answer text for a specific lane
    const getLaneAnswer = (laneIndex) => {
      if (!isAnswering.value) return ''
      
      const laneObstacle = obstacles.value.find(obs => 
        obs.lane === laneIndex && 
        obs.hasTriggeredQuestion && 
        obs.y > -200 && obs.y < 600
      )
      
      return laneObstacle ? laneObstacle.option.form : ''
    }
    
    // Select answer and automatically move to the corresponding lane
    const selectAnswerAndMove = (laneIndex, option) => {
      if (!isAnswering.value) return
      
      selectedOption.value = option.id
      
      // Automatically move to the selected lane
      if (laneIndex >= 0 && laneIndex <= 2) {
        playerLane.value = laneIndex
        targetX.value = lanes[laneIndex]
      }
      
      // Mark that an answer was selected
      totalAttempts.value++
    }

    // Game end condition check (called from update loop)
    const checkGameEnd = () => {
      if (lives.value <= 0) {
        logger.log('Game ended due to no lives remaining')
        logger.log('Final stats:', {
          totalScore: totalScore.value,
          correctAnswers: correctAnswers.value,
          totalAttempts: totalAttempts.value,
          comboCount: comboCount.value
        })
        
        gameState.value = 'results'
        if (animationFrameId.value) {
          cancelAnimationFrame(animationFrameId.value)
          animationFrameId.value = null
        }
        if (selectionTimer.value) clearInterval(selectionTimer.value)
        if (gameTimer.value) clearInterval(gameTimer.value)
        window.removeEventListener('keydown', handleKeyPress)
        return true
      }
      return false
    }

    // Main game loop using requestAnimationFrame for smooth performance
    const updateGame = (currentTime = 0) => {
      const deltaTime = currentTime - lastFrameTime.value
      lastFrameTime.value = currentTime
      
      // Continuous auto-forward movement (never stops)
      forwardProgress.value += autoSpeed.value
      
      // Smooth player movement between lanes
      const currentX = playerPosition.value.x
      const diff = targetX.value - currentX
      if (Math.abs(diff) > 1) {
        playerPosition.value.x += diff * 0.2 // Faster lane switching
      } else {
        playerPosition.value.x = targetX.value
      }
      
      // Update all obstacles (they appear to move toward player)
      obstacles.value.forEach(obstacle => {
        obstacle.y += obstacleSpeed.value * (1 + forwardProgress.value / 10000) // Gradually increase speed
        obstacle.rotation += obstacle.rotationSpeed || 3
        
        // Simple downward movement - no lateral movement
        // Obstacles stay in their assigned lanes
        
        // Calculate distance from player
        obstacle.distanceFromPlayer = Math.abs(obstacle.y - 500)
      })
      
      // Auto-spawn obstacles at regular intervals
      if (forwardProgress.value - lastObstacleSpawn.value >= obstacleSpawnDistance.value) {
        spawnObstacleWithProblem()
        lastObstacleSpawn.value = forwardProgress.value
      }
      
      // Check for approaching obstacles and trigger questions
      checkApproachingObstacles()
      
      // Check collisions
      checkCollisions()
      
      // Remove obstacles that are off-screen
      obstacles.value = obstacles.value.filter(obstacle => obstacle.y < 700)
      
      // Check game end conditions
      if (checkGameEnd()) return
      
      // Continue game loop
      if (gameState.value === 'playing') {
        animationFrameId.value = requestAnimationFrame(updateGame)
      }
    }

    // Lane-based collision detection with answer checking
    const checkCollisions = () => {
      if (isInvulnerable.value) return
      
      // Check collisions in player's current lane
      obstacles.value.forEach((obstacle, index) => {
        if (obstacle.lane === playerLane.value && 
            obstacle.y >= 450 && obstacle.y <= 550) { // Collision zone
          
          if (isAnswering.value) {
            // Player is answering - check if this lane is correct
            handleLaneAnswer(obstacle, index)
          } else {
            // No active question - treat as collision
            handleCollision(obstacle, index)
          }
        }
      })
    }
    
    const handleLaneAnswer = (obstacle, index) => {
      const isCorrect = obstacle.isCorrectAnswer
      
      if (isCorrect) {
        // Correct answer - DEFEND: destroy obstacle and boost
        correctAnswers.value++
        totalScore.value += 100
        comboCount.value++
        totalAttempts.value++
        
        // Speed boost for correct answer (difficulty-based) - reduced for better control
        const speedBoost = selectedDifficulty.value === 'beginner' ? 3 : 
                          selectedDifficulty.value === 'intermediate' ? 4 : 6
        currentSpeed.value = Math.min(currentSpeed.value + speedBoost, maxSpeed.value)
        autoSpeed.value = Math.min(autoSpeed.value + 0.05, difficultySettings[selectedDifficulty.value].autoSpeed * 1.2)
        
        // Show DEFEND effect
        showBoostEffect.value = true
        setTimeout(() => {
          showBoostEffect.value = false
        }, 400) // Reduced from 800ms to 400ms
        
        // Remove all obstacles in this set (destroy them all)
        const setId = obstacle.setId
        obstacles.value = obstacles.value.filter(obs => obs.setId !== setId)
        
      } else {
        // Wrong answer - FAILED TO DODGE: collision damage
        totalAttempts.value++
        handleCollision(obstacle, index)
      }
      
      // Reset answering state
      resetAnsweringState()
    }
    
    const handleCollision = (obstacle, index) => {
      // Collision effects - Failed to dodge or defend
      lives.value--
      showCrashEffect.value = true
      isInvulnerable.value = true
      comboCount.value = 0 // Reset combo on collision
      
      // Reduce speed (but never stop completely)
      const minSpeed = Math.max(baseSpeed.value * 0.5, baseSpeed.value * 0.3)
      currentSpeed.value = Math.max(currentSpeed.value * 0.7, minSpeed)
      autoSpeed.value = Math.max(autoSpeed.value * 0.8, difficultySettings[selectedDifficulty.value].autoSpeed * 0.5)
      
      // Remove obstacle
      obstacles.value.splice(index, 1)
      
      // Reset answering state if this was the current obstacle
      if (approachingObstacle.value?.id === obstacle.id) {
        resetAnsweringState()
      }
      
      // Brief invulnerability (dodge recovery time)
      setTimeout(() => {
        showCrashEffect.value = false
        isInvulnerable.value = false
        // Gradually restore speed
        const speedRestore = selectedDifficulty.value === 'beginner' ? 3 : 
                           selectedDifficulty.value === 'intermediate' ? 5 : 8
        currentSpeed.value = Math.min(currentSpeed.value + speedRestore, maxSpeed.value)
        autoSpeed.value = Math.min(autoSpeed.value + 0.2, difficultySettings[selectedDifficulty.value].autoSpeed)
      }, 800) // Reduced from 1500ms to 800ms
    }

    const updateSelectionTimer = () => {
      if (selectionTimeLeft.value > 0 && isAnswering.value) {
        selectionTimeLeft.value -= 0.1
        if (selectionTimeLeft.value <= 0) {
          // Time's up - automatically get wrong answer (collision)
          const currentLaneObstacle = obstacles.value.find(obs => 
            obs.lane === playerLane.value && 
            obs.hasTriggeredQuestion &&
            obs.y > 350 && obs.y < 550
          )
          
          if (currentLaneObstacle && !currentLaneObstacle.isCorrectAnswer) {
            // Player is in wrong lane when time runs out
            handleCollision(currentLaneObstacle, obstacles.value.indexOf(currentLaneObstacle))
          }
          
          resetAnsweringState()
        }
      }
    }

    // Spawn obstacle set with lane-based answers
    const spawnObstacleWithProblem = () => {
      const allChallenges = getCurrentChallenges()
      
      // Filter out already used questions
      let availableChallenges = allChallenges.filter(c => !usedQuestionIds.value.includes(c.id))
      
      // If all questions used, reset the pool
      if (availableChallenges.length === 0) {
        usedQuestionIds.value = []
        availableChallenges = allChallenges
      }
      
      const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
      usedQuestionIds.value.push(randomChallenge.id) // Mark as used
      
      // Create obstacles in all 3 lanes with different answers
      const obstacleSet = {
        id: Math.random().toString(36).substr(2, 9),
        challenge: randomChallenge,
        hasTriggeredQuestion: false,
        y: -100,
        isActive: false
      }
      
      // Take only 2 options for 2 lanes
      const shuffledOptions = [...randomChallenge.options].slice(0, 2)
      
      // Create obstacle for each lane - simple fixed positions
      lanes.forEach((laneX, laneIndex) => {
        const option = shuffledOptions[laneIndex]
        const obstacle = {
          id: obstacleSet.id + '_' + laneIndex,
          setId: obstacleSet.id,
          x: laneX, // Fixed lane position
          y: -100, // Fixed spawn position
          lane: laneIndex,
          type: option.isCorrect ? 'correct' : 'incorrect',
          icon: '☄️', // Neutral meteor icon
          rotation: 0,
          challenge: randomChallenge,
          option: option,
          hasTriggeredQuestion: false,
          distanceFromPlayer: 0,
          isCorrectAnswer: option.isCorrect,
          rotationSpeed: 3 // Fixed rotation speed
        }
        obstacles.value.push(obstacle)
      })
    }

    // Check for obstacles approaching player and trigger questions
    const checkApproachingObstacles = () => {
      if (isAnswering.value) return
      
      // Find closest obstacle set in approach zone
      const obstacleGroups = {}
      obstacles.value.forEach(obstacle => {
        if (!obstacleGroups[obstacle.setId]) {
          obstacleGroups[obstacle.setId] = []
        }
        obstacleGroups[obstacle.setId].push(obstacle)
      })
      
      // Find the closest set that hasn't triggered a question yet
      for (const setId in obstacleGroups) {
        const obstacleSet = obstacleGroups[setId]
        const firstObstacle = obstacleSet[0]
        
        if (firstObstacle.y > -50 && firstObstacle.y < 150 && !firstObstacle.hasTriggeredQuestion) {
          // Trigger question display for this set
          currentChallenge.value = firstObstacle.challenge
          isAnswering.value = true
          
          // Mark all obstacles in this set as having triggered
          obstacleSet.forEach(obs => {
            obs.hasTriggeredQuestion = true
          })
          
          // Start countdown timer
          selectionTimeLeft.value = selectionTimeMax.value
          if (selectionTimer.value) clearInterval(selectionTimer.value)
          selectionTimer.value = setInterval(updateSelectionTimer, 100)
          break
        }
      }
    }

    // Player movement controls
    const moveLeft = () => {
      if (playerLane.value > 0) {
        playerLane.value--
        targetX.value = lanes[playerLane.value]
      }
    }

    const moveRight = () => {
      if (playerLane.value < 1) {
        playerLane.value++
        targetX.value = lanes[playerLane.value]
      }
    }

    // Simplified keyboard controls for answer selection
    const handleKeyPress = (event) => {
      if (gameState.value !== 'playing' || !isAnswering.value || !currentChallenge.value) return
      
      switch(event.key) {
        case '1':
          event.preventDefault()
          if (currentChallenge.value.options[0]) {
            selectAnswerAndMove(0, currentChallenge.value.options[0])
          }
          break
        case '2':
          event.preventDefault()
          if (currentChallenge.value.options[1]) {
            selectAnswerAndMove(1, currentChallenge.value.options[1])
          }
          break
        case '3':
          event.preventDefault()
          if (currentChallenge.value.options[2]) {
            selectAnswerAndMove(2, currentChallenge.value.options[2])
          }
          break
      }
    }

    // Touch controls for mobile
    const handleSwipe = (direction) => {
      if (direction === 'left') moveLeft()
      if (direction === 'right') moveRight()
    }

    const restartGame = () => {
      gameState.value = 'setup'
      currentRound.value = 1
      playerLane.value = 0
      targetX.value = lanes[0]
      forwardProgress.value = 0
      playerPosition.value = { x: 400, y: window.innerHeight * 0.8 }
      lives.value = 3
      totalScore.value = 0
      correctAnswers.value = 0
      currentSpeed.value = baseSpeed.value
      autoSpeed.value = 3
      obstacles.value = []
      usedQuestionIds.value = [] // Reset used questions
      
      // Clear intervals and animation frames
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
      if (selectionTimer.value) clearInterval(selectionTimer.value)
      if (gameTimer.value) clearInterval(gameTimer.value)
      
      // Reset answering state
      resetAnsweringState()
      
      // Remove keyboard listeners
      window.removeEventListener('keydown', handleKeyPress)
      
      // Reset timer
      timeRemaining.value = 120
    }

    // Lifecycle hooks
    onMounted(() => {
      // Event listeners will be added when game starts
    })
    
    onUnmounted(() => {
      // Clean up event listeners and intervals
      window.removeEventListener('keydown', handleKeyPress)
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
      }
      if (selectionTimer.value) clearInterval(selectionTimer.value)
    })

    // Computed properties
    const accuracy = computed(() => {
      return totalAttempts.value > 0 ? correctAnswers.value / totalAttempts.value : 0
    })

    const finalScore = computed(() => {
      return totalScore.value
    })

    const getPerformanceRating = () => {
      const accuracyPercent = accuracy.value * 100
      if (accuracyPercent >= 90) return '🏆 完璧！'
      if (accuracyPercent >= 80) return '⭐ 素晴らしい！'
      if (accuracyPercent >= 70) return '✨ 良い結果！'
      if (accuracyPercent >= 60) return '👍 もう少し！'
      return '💪 練習あるのみ！'
    }

    const changeDifficultyAndRestart = () => {
      gameState.value = 'setup'
      // Reset all game stats
      totalScore.value = 0
      correctAnswers.value = 0
      totalAttempts.value = 0
      comboCount.value = 0
      currentRound.value = 1
      lives.value = 3
      timeRemaining.value = 120
    }

    // Helper functions for enhanced setup screen
    const getEnergyStreamStyle = (index) => {
      return {
        left: (index * 15 + Math.random() * 10) + '%',
        animationDelay: (index * 0.3) + 's',
        animationDuration: (2 + Math.random() * 2) + 's'
      }
    }

    const getParticleStyle = (index) => {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (3 + Math.random() * 2) + 's'
      }
    }

    const getDifficultyTime = (difficulty) => {
      const settings = difficultySettings[difficulty]
      return settings ? settings.selectionTime : 30
    }

    // 戻るボタンのハンドラー
    const goBack = () => {
      // ゲームをクリーンアップ
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
      if (selectionTimer.value) {
        clearInterval(selectionTimer.value)
        selectionTimer.value = null
      }
      // Grammar Galaxyプラットフォームに戻る
      router.push('/platforms/grammar-galaxy')
    }

    return {
      // State
      gameState,
      selectedDifficulty,
      selectedMode,
      currentRound,
      totalRounds,
      lives,
      totalScore,
      correctAnswers,
      comboCount,
      maxComboCount,
      totalAttempts,
      timeRemaining,
      distanceTraveled,
      fuel,
      maxFuel,
      fuelLost,
      responseTimes,
      masteredTenses,
      earnedAchievements,
      playerPosition,
      playerLane,
      currentSpeed,
      autoSpeed,
      baseSpeed,
      forwardProgress,
      approachingObstacle,
      isAnswering,
      isInvulnerable,
      boostCharge,
      showBoostEffect,
      isBoosting,
      showCrashEffect,
      lastScoreGain,
      maxSpeed,
      obstacles,
      powerups,
      visibleObstacles,
      visiblePowerups,
      currentChallenge,
      selectedOption,
      showResult,
      lastAnswerCorrect,
      showCollisionEffect,
      showVictoryScreen,
      
      // Timing
      questionStartTime,
      selectionTimeLeft,
      selectionTimeMax,
      
      // Configuration
      difficultyLevels,
      difficultySettings,
      
      // Computed
      accuracy,
      finalScore,
      
      // Methods
      startGame,
      goBack,
      getPerformanceRating,
      changeDifficultyAndRestart,
      selectOption,
      submitAnswer,
      restartGame,
      handleKeyPress,
      moveLeft,
      moveRight,
      checkGameEnd,
      resetAnsweringState,
      spawnObstacleWithProblem,
      isLaneCorrect,
      getLaneAnswer,
      selectAnswerAndMove,
      
      // Setup screen helpers
      getEnergyStreamStyle,
      getParticleStyle,
      getDifficultyTime
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  overflow: hidden;
}

.galaxy-card {
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.compact-difficulty-card {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.8);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.compact-difficulty-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(15, 23, 42, 0.9);
}

.compact-difficulty-card.selected {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.galaxy-button {
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.galaxy-button:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.7);
}

.galaxy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.galaxy-button-large {
  padding: 16px 32px;
  font-size: 18px;
}

.galaxy-button-primary {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.2);
}

.galaxy-button-primary:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.7);
}

.galaxy-button-secondary {
  border-color: rgba(156, 163, 175, 0.5);
  background: rgba(156, 163, 175, 0.2);
}

.galaxy-button-secondary:hover {
  background: rgba(156, 163, 175, 0.3);
  border-color: rgba(156, 163, 175, 0.7);
}

/* Space Background */
.space-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  z-index: -1;
}

.stars-field {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, #fff, transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: stars-move 20s linear infinite;
}

.nebula-clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%);
  animation: nebula-drift 30s ease-in-out infinite alternate;
}

@keyframes stars-move {
  from { transform: translateY(0px); }
  to { transform: translateY(-100px); }
}

@keyframes nebula-drift {
  from { transform: scale(1) rotate(0deg); }
  to { transform: scale(1.1) rotate(2deg); }
}

/* Racing Track */
.racing-track {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
  max-width: 1200px;
  margin: 0 auto;
}

.player-vehicle {
  position: fixed;
  bottom: 200px;
  transform: translateX(-50%);
  z-index: 100;
  transition: left 0.3s ease;
}

.vehicle-body {
  font-size: 64px;
  filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.8));
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-body.boosting {
  animation: boost-glow 0.5s ease-in-out;
  filter: drop-shadow(0 0 25px rgba(34, 197, 94, 0.9));
}

@keyframes boost-glow {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Obstacles and Powerups */
.obstacle-lane, .powerup-lane {
  position: absolute;
  transition: transform 0.05s linear;
}

.obstacle-body {
  font-size: 36px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.6);
  border-radius: 50%;
  display: inline-block;
  animation: obstacle-rotate 2s linear infinite;
}

.obstacle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.powerup-body {
  font-size: 32px;
  padding: 8px;
  background: rgba(34, 197, 94, 0.2);
  border: 2px solid rgba(34, 197, 94, 0.6);
  border-radius: 50%;
  display: inline-block;
  animation: powerup-pulse 1s ease-in-out infinite;
}

@keyframes obstacle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes powerup-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.vehicle-trail {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 60px;
  background: linear-gradient(180deg, rgba(6, 182, 212, 0.8) 0%, transparent 100%);
  animation: trail-flow 0.5s linear infinite;
}

/* Racing Interface */
.racing-interface {
  position: absolute;
  inset: 0;
  z-index: 40;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.racing-interface > * {
  pointer-events: auto;
}

.current-challenge {
  background: rgba(15, 23, 42, 0.95);
  border: 3px solid rgba(239, 68, 68, 0.6);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  backdrop-filter: blur(20px);
  animation: challenge-appear 0.5s ease-out;
}

.challenge-warning {
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.warning-text {
  font-size: 24px;
  font-weight: bold;
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.challenge-instruction {
  color: white;
}

.instruction-text {
  font-size: 20px;
  margin-bottom: 10px;
  font-weight: bold;
}

.instruction-hint {
  font-size: 16px;
  color: #94a3b8;
}

.quick-selection {
  display: flex;
  align-items: center;
  gap: 30px;
  background: rgba(15, 23, 42, 0.95);
  border: 3px solid rgba(6, 182, 212, 0.6);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(20px);
}

.rush-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.rush-option {
  background: rgba(30, 41, 59, 0.8);
  border: 3px solid rgba(71, 85, 105, 0.6);
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  text-align: center;
}

.rush-option:hover {
  border-color: rgba(59, 130, 246, 0.8);
  background: rgba(59, 130, 246, 0.1);
}

.rush-option.selected {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.2);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.option-number {
  background: rgba(99, 102, 241, 0.8);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 10px;
}

.option-content {
  color: white;
}

.option-form {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.boost-button {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: 3px solid rgba(16, 185, 129, 0.8);
  border-radius: 20px;
  padding: 20px 40px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.boost-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
}

.boost-button-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.boost-icon {
  font-size: 24px;
}

.boost-text {
  font-size: 18px;
}

.rush-result {
  background: rgba(15, 23, 42, 0.95);
  border: 3px solid rgba(168, 85, 247, 0.6);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  backdrop-filter: blur(20px);
  max-width: 600px;
}

.result-animation.breakthrough {
  animation: breakthrough-flash 0.5s ease-out;
}

.result-animation.crash {
  animation: crash-shake 0.5s ease-out;
}

@keyframes breakthrough-flash {
  0% { background: rgba(34, 197, 94, 0.3); }
  100% { background: transparent; }
}

@keyframes crash-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.breakthrough-effect {
  color: #22c55e;
}

.crash-effect {
  color: #ef4444;
}

.speed-boost-text, .slow-down-text {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.points-gained {
  font-size: 20px;
  color: #fbbf24;
}

.result-header {
  font-size: 28px;
  font-weight: bold;
  margin: 20px 0;
  color: white;
}

.result-explanation {
  font-size: 16px;
  color: #cbd5e1;
  margin-bottom: 20px;
}

.continue-race-button {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  border: 3px solid rgba(168, 85, 247, 0.8);
  border-radius: 15px;
  padding: 15px 30px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px auto 0;
}

.continue-race-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
}

.auto-continue-message {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  padding: 15px;
  color: white;
  font-weight: bold;
  margin: 20px auto 0;
  animation: auto-continue-pulse 1.2s ease-in-out infinite;
}

@keyframes auto-continue-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* Lane Indicators and Road Effects */
.lane-indicators {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.lane-line {
  position: absolute;
  width: 4px;
  height: 100%;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 0px,
    rgba(255, 255, 255, 0.4) 40px,
    transparent 40px,
    transparent 80px
  );
  animation: lane-move 0.8s linear infinite;
}

.lane-line-1 { left: 200px; }
.lane-line-2 { left: 400px; }
.lane-line-3 { left: 600px; }

@keyframes lane-move {
  from { transform: translateY(-80px); }
  to { transform: translateY(0px); }
}

/* Dynamic lane speed based on player speed */
.racing-track[data-speed="fast"] .lane-line {
  animation-duration: 0.4s;
}

.racing-track[data-speed="slow"] .lane-line {
  animation-duration: 1.2s;
}

.road-surface {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(30, 41, 59, 0.8) 0%,
    rgba(15, 23, 42, 0.6) 20%,
    rgba(15, 23, 42, 0.4) 50%,
    rgba(15, 23, 42, 0.6) 80%,
    rgba(30, 41, 59, 0.8) 100%
  );
  z-index: 0;
}

.vehicle-body.invulnerable {
  animation: invulnerable-flash 0.2s linear infinite;
}

.vehicle-body.super-boost {
  animation: super-boost-glow 0.3s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(34, 197, 94, 1));
}

@keyframes invulnerable-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes super-boost-glow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.speed-lines {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: 
    linear-gradient(90deg, transparent 48%, rgba(34, 197, 94, 0.6) 49%, rgba(34, 197, 94, 0.6) 51%, transparent 52%),
    linear-gradient(90deg, transparent 45%, rgba(34, 197, 94, 0.4) 46%, rgba(34, 197, 94, 0.4) 54%, transparent 55%),
    linear-gradient(90deg, transparent 42%, rgba(34, 197, 94, 0.3) 43%, rgba(34, 197, 94, 0.3) 57%, transparent 58%);
  animation: speed-lines-flow 0.1s linear infinite;
  pointer-events: none;
}

@keyframes speed-lines-flow {
  0% { transform: translateX(-50%) translateY(0px); }
  100% { transform: translateX(-50%) translateY(20px); }
}

/* Enhanced player positioning */
.player-vehicle {
  z-index: 35;
}

/* Speed-based trail effects */
@keyframes trail-flow {
  0% { height: 60px; opacity: 1; }
  100% { height: 120px; opacity: 0; }
}

.vehicle-trail {
  animation: trail-flow 0.3s linear infinite;
}

/* Lives Display */
.lives-display {
  border-color: rgba(236, 72, 153, 0.6);
}

.lives-icon {
  display: block;
  font-size: 16px;
}

.lives-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #ec4899;
  margin-top: 2px;
}

/* Lane Guidelines */
.lane-guidelines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.lane-guide {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.lane-guide-0 { left: 270px; width: 100px; }
.lane-guide-1 { left: 470px; width: 100px; }

.lane-guide.correct-guide {
  background: rgba(34, 197, 94, 0.3);
  box-shadow: inset 0 0 20px rgba(34, 197, 94, 0.4);
}

.lane-guide.player-guide {
  background: rgba(251, 191, 36, 0.3);
  box-shadow: inset 0 0 20px rgba(251, 191, 36, 0.5);
  border-left: 3px solid rgba(251, 191, 36, 0.8);
  border-right: 3px solid rgba(251, 191, 36, 0.8);
}

/* Instant Feedback */
.instant-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 70;
  text-align: center;
  pointer-events: none;
}

.boost-popup, .crash-popup {
  animation: feedback-popup 0.8s ease-out forwards;
}

.boost-popup {
  color: #22c55e;
}

.crash-popup {
  color: #ef4444;
}

.boost-icon, .crash-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.boost-text, .crash-text {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  text-shadow: 0 0 10px currentColor;
}

.points-text, .damage-text {
  font-size: 18px;
  opacity: 0.8;
}

@keyframes feedback-popup {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1) translateY(-50px);
  }
}

/* UI Elements - Enhanced Readability */
.speed-display {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 15px;
  z-index: 50;
}

.speed-meter, .distance-meter, .lives-display, .time-display {
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid rgba(6, 182, 212, 0.8);
  border-radius: 12px;
  padding: 10px 15px;
  text-align: center;
  min-width: 80px;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.time-display {
  border-color: rgba(251, 191, 36, 0.8);
}

.time-icon {
  display: block;
  font-size: 16px;
}

.time-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
  margin-top: 2px;
}

.speed-meter.boost {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.1);
  animation: speed-boost-glow 0.5s ease-in-out infinite;
}

.speed-value, .distance-value {
  display: block;
  font-size: 26px;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.speed-unit, .distance-unit {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.controls-hint {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid rgba(99, 102, 241, 0.8);
  border-radius: 12px;
  padding: 15px 25px;
  text-align: center;
  z-index: 50;
  animation: hint-pulse 2s ease-in-out infinite;
  backdrop-filter: blur(15px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
}

.hint-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 8px;
}

.sub-hint {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Fixed Answer Panel - Removed duplicate definition */

.answer-panel-header {
  margin-bottom: 15px;
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.question-display {
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.time-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto;
}

.answer-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
}

.answer-option-button:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 1);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  background: rgba(30, 41, 59, 1);
}

.answer-option-button.selected {
  border-color: rgba(251, 191, 36, 1);
  background: rgba(251, 191, 36, 0.2);
  box-shadow: 0 0 25px rgba(251, 191, 36, 0.6);
  transform: translateY(-5px) scale(1.05);
}

.option-number {
  position: absolute;
  top: 8px;
  left: 12px;
  width: 28px;
  height: 28px;
  background: rgba(251, 191, 36, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  color: #000000;
}

.option-text {
  font-size: 22px;
  font-weight: 900;
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.option-hint {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
  opacity: 0.8;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes speed-boost-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.3); }
  50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); }
}

/* Compact Question Display - Enhanced Readability */
.compact-question {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid rgba(251, 191, 36, 1);
  border-radius: 15px;
  padding: 20px 30px;
  text-align: center;
  z-index: 60;
  max-width: 600px;
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
}

.compact-question .question-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
}

.compact-question .instruction-hint {
  color: #fbbf24;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.time-left-bar {
  width: 300px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  margin: 0 auto;
  overflow: hidden;
}

.time-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e 0%, #eab308 50%, #ef4444 100%);
  transition: width 0.1s linear;
  border-radius: 3px;
}

/* Lane-Based Obstacle Styling */
.obstacle-body.correct-obstacle {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.2);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
}

.obstacle-body.incorrect-obstacle {
  border-color: rgba(239, 68, 68, 0.8);
  background: rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
}

.obstacle-body.approaching {
  animation: obstacle-pulse 1s ease-in-out infinite;
}

.obstacle-body.danger-zone {
  animation: danger-flash 0.5s linear infinite;
}

@keyframes obstacle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes danger-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Lane Answer Indicators */
.lane-answers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 30;
}

.lane-answer-indicator {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
  transition: all 0.3s ease;
}

.answer-text {
  background: rgba(0, 0, 0, 0.95);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 900;
  border: 3px solid rgba(71, 85, 105, 0.8);
  margin-bottom: 8px;
  backdrop-filter: blur(20px);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
  min-width: 120px;
}

.correct-lane .answer-text {
  border-color: rgba(34, 197, 94, 1);
  background: rgba(0, 0, 0, 0.95);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.8), 0 5px 15px rgba(0, 0, 0, 0.6);
  border-width: 4px;
}

.incorrect-lane .answer-text {
  border-color: rgba(239, 68, 68, 1);
  background: rgba(0, 0, 0, 0.95);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 5px 15px rgba(0, 0, 0, 0.6);
  border-width: 4px;
}

.player-lane .answer-text {
  transform: scale(1.1);
  border-width: 3px;
}

.lane-indicator {
  width: 40px;
  height: 4px;
  background: rgba(71, 85, 105, 0.6);
  border-radius: 2px;
  margin: 0 auto;
}

.lane-indicator.active {
  background: rgba(251, 191, 36, 0.9);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
  animation: lane-active-pulse 0.8s ease-in-out infinite;
}

@keyframes lane-active-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Answer Control Buttons */
.answer-controls {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 70;
  text-align: center;
}

.answer-instruction {
  background: rgba(0, 0, 0, 0.95);
  border: 3px solid rgba(251, 191, 36, 1);
  border-radius: 12px;
  padding: 10px 20px;
  margin-bottom: 15px;
  backdrop-filter: blur(15px);
}

.instruction-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.answer-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.answer-button {
  background: rgba(0, 0, 0, 0.95);
  border: 4px solid rgba(71, 85, 105, 0.8);
  border-radius: 15px;
  padding: 15px 20px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 140px;
  backdrop-filter: blur(15px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6);
}

.answer-button:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 1);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.answer-button.correct-answer {
  border-color: rgba(34, 197, 94, 1);
  background: rgba(0, 0, 0, 0.95);
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.8);
  animation: correct-glow 1s ease-in-out infinite;
}

.answer-button.player-selected {
  border-color: rgba(251, 191, 36, 1);
  background: rgba(251, 191, 36, 0.2);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
  transform: translateY(-5px) scale(1.05);
}

@keyframes correct-glow {
  0%, 100% { border-color: rgba(34, 197, 94, 1); }
  50% { border-color: rgba(34, 197, 94, 0.6); }
}

.button-arrow {
  font-size: 24px;
  margin-bottom: 5px;
  color: #fbbf24;
}

.button-label {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #94a3b8;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.button-answer {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 8px;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  min-height: 22px;
}

.button-keys {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.left-button .button-arrow {
  color: #ef4444;
}

.center-button .button-arrow {
  color: #06b6d4;
}

.right-button .button-arrow {
  color: #10b981;
}

/* Enhanced Game Elements */
.fixed-answer-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%);
  border-top: 3px solid rgba(99, 102, 241, 0.8);
  padding: 20px 20px 30px 20px;
  z-index: 60;
  backdrop-filter: blur(20px);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  width: 100vw;
}

.answer-option-button {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%);
  border: 3px solid rgba(71, 85, 105, 0.6);
  border-radius: 20px;
  padding: 25px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
}

.answer-option-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.8);
}

.answer-option-button.correct-option {
  border-color: rgba(34, 197, 94, 0.6);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
}

.answer-option-button.wrong-option {
  border-color: rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
}

.option-text {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.option-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Enhanced Speed Display */
.speed-display {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  z-index: 50;
}

/* Back Button Style */
.back-button-game {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(96, 165, 250, 0.5);
  color: #60a5fa;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.back-button-game:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(96, 165, 250, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(96, 165, 250, 0.2);
}

.back-button-game:active {
  transform: translateY(0);
}

.back-icon {
  font-size: 18px;
  font-weight: bold;
}

.back-text {
  font-size: 14px;
}

.speed-meter, .distance-meter, .lives-display, .time-display {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 15px;
  padding: 15px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.speed-meter.boost {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.obstacle-body.danger-zone {
  box-shadow: 0 0 50px rgba(239, 68, 68, 0.9), inset 0 0 30px rgba(239, 68, 68, 0.5);
  transform: scale(1.2);
}

@keyframes pulse-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Enhanced Setup Screen Styling */
.setup-space-background {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, #1e293b 0%, #0f172a 60%, #000000 100%);
  z-index: 0;
  min-height: 100vh;
}

.setup-stars-field {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, #fff, transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent),
    radial-gradient(1px 1px at 200px 20px, #06b6d4, transparent),
    radial-gradient(1px 1px at 250px 90px, #8b5cf6, transparent);
  background-repeat: repeat;
  background-size: 300px 200px;
  animation: setup-stars-twinkle 8s linear infinite;
  opacity: 0.8;
}

.setup-nebula-clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  animation: setup-nebula-drift 20s ease-in-out infinite alternate;
}

.setup-energy-streams {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.energy-stream {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, transparent, #06b6d4, transparent);
  animation: energy-flow 3s linear infinite;
  opacity: 0.6;
}

.setup-floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #fbbf24, transparent);
  border-radius: 50%;
  animation: particle-float 5s ease-in-out infinite;
}

@keyframes setup-stars-twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes setup-nebula-drift {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.1) rotate(3deg); }
}

@keyframes energy-flow {
  0% { transform: translateY(-100px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 1; }
}

/* Command Center Interface */
.command-center-interface {
  max-width: 900px;
  width: 90%;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 50%,
    rgba(15, 23, 42, 0.95) 100%);
  border: 2px solid rgba(99, 102, 241, 0.4);
  border-radius: 30px;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 20px rgba(99, 102, 241, 0.1);
  overflow: visible;
  position: relative;
  margin: 2rem 0;
}

.command-center-interface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(99, 102, 241, 0.8), 
    rgba(168, 85, 247, 0.8),
    rgba(99, 102, 241, 0.8),
    transparent);
  animation: data-scan 3s linear infinite;
}

.command-header {
  text-align: center;
  padding: 40px 20px 30px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}

.mission-emblem {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.emblem-ring {
  width: 80px;
  height: 80px;
  border: 3px solid rgba(99, 102, 241, 0.6);
  border-radius: 50%;
  position: relative;
  animation: emblem-rotate 10s linear infinite;
}

.emblem-ring::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 50%;
  animation: emblem-rotate 15s linear infinite reverse;
}

.emblem-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.8));
  animation: emblem-pulse 2s ease-in-out infinite;
}

.emblem-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: emblem-pulse 2s ease-in-out infinite;
}

.mission-title {
  margin-bottom: 15px;
}

.title-main {
  display: block;
  font-size: 36px;
  font-weight: 900;
  background: linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
}

.title-sub {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #fbbf24;
  margin-top: 5px;
  letter-spacing: 2px;
}

.mission-description {
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Mission Briefing Panel */
.mission-briefing {
  padding: 30px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
}

.briefing-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #06b6d4;
}

.briefing-icon {
  font-size: 24px;
}

.briefing-content {
  display: grid;
  gap: 15px;
}

.objective-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  color: #e2e8f0;
}

.objective-icon {
  font-size: 20px;
  min-width: 20px;
}

/* Difficulty Selection Panel */
.difficulty-selection-panel {
  padding: 30px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  font-size: 18px;
  font-weight: bold;
  color: #06b6d4;
  justify-content: center;
}

.panel-icon {
  font-size: 24px;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.difficulty-option {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(71, 85, 105, 0.4);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.difficulty-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  transition: left 0.5s ease;
}

.difficulty-option:hover::before {
  left: 100%;
}

.difficulty-option:hover {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(30, 41, 59, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.difficulty-option.selected {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.difficulty-indicator {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid;
  border-radius: 50%;
  animation: indicator-pulse 2s ease-in-out infinite;
}

.indicator-core {
  font-size: 28px;
  z-index: 1;
}

.difficulty-indicator.beginner .indicator-ring {
  border-color: #22c55e;
}

.difficulty-indicator.intermediate .indicator-ring {
  border-color: #f59e0b;
}

.difficulty-indicator.advanced .indicator-ring {
  border-color: #ef4444;
}

.difficulty-info {
  flex: 1;
}

.difficulty-name {
  font-size: 24px;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 5px;
}

.difficulty-desc {
  color: #94a3b8;
  font-size: 16px;
  margin-bottom: 10px;
}

.difficulty-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #06b6d4;
  font-size: 14px;
  font-weight: 500;
}

.stat-icon {
  font-size: 16px;
}

.selection-indicator {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: selection-pop 0.3s ease-out;
}

.indicator-check {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

/* Launch Controls */
.launch-controls {
  padding: 30px;
  text-align: center;
}

.launch-button {
  width: 100%;
  max-width: 400px;
  padding: 25px;
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 3px solid rgba(71, 85, 105, 0.5);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.launch-button.ready {
  background: linear-gradient(135deg, #0369a1, #0284c7, #0ea5e9);
  border-color: rgba(6, 182, 212, 0.8);
  box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);
}

.launch-button.ready:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 50px rgba(6, 182, 212, 0.4);
}

.launch-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.launch-button-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.launch-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 10px currentColor);
}

.launch-text {
  text-align: center;
  flex: 1;
}

.launch-main {
  display: block;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.launch-sub {
  display: block;
  font-size: 14px;
  opacity: 0.8;
}

.launch-arrow {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.launch-button.ready:hover .launch-arrow {
  transform: translateX(5px);
}

.launch-energy-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899);
  animation: energy-charge 2s ease-in-out infinite;
}

@keyframes data-scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes emblem-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes emblem-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes indicator-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes selection-pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes energy-charge {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .command-center-interface {
    width: 95%;
    margin: 20px;
  }
  
  .command-header {
    padding: 30px 15px 20px;
  }
  
  .title-main {
    font-size: 28px;
  }
  
  .title-sub {
    font-size: 20px;
  }
  
  .mission-briefing,
  .difficulty-selection-panel,
  .launch-controls {
    padding: 20px;
  }
  
  .difficulty-option {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .difficulty-stats {
    justify-content: center;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
    gap: 15px;
    max-width: 100%;
    padding: 0 20px;
  }
  
  .fixed-answer-panel {
    padding: 15px 15px 25px 15px;
  }
  
  .question-display {
    font-size: 18px;
  }
  
  .option-text {
    font-size: 20px;
  }
}
</style>