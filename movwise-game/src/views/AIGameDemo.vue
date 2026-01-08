<template>
  <div class="ai-game-demo min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
    <div class="container mx-auto px-4 py-8">
      <!-- ヘッダー -->
      <div class="header text-center mb-8">
        <h1 class="text-3xl font-bold mb-2">🎮 AI-Enhanced Game Demo</h1>
        <p class="text-gray-300">Experience adaptive difficulty and personalized recommendations</p>
      </div>

      <!-- AI Dashboard -->
      <div class="mb-8">
        <AIPredictionDashboard
          :userId="demoUserId"
          :gameContext="gameContext"
          :showDebugInfo="true"
          @recommendationSelected="handleRecommendationSelected"
        />
      </div>

      <!-- Game Selection -->
      <div class="game-selection bg-gray-800/50 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="mr-2">🎲</span>
          Select a Game to Test AI Features
        </h2>
        <div class="games-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            v-for="game in availableGames"
            :key="game.id"
            @click="selectGame(game)"
            class="game-card bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-lg hover:scale-105 transition-transform"
          >
            <div class="game-icon text-3xl mb-2">{{ game.icon }}</div>
            <div class="game-title font-bold">{{ game.title }}</div>
            <div class="game-description text-sm text-gray-300 mt-2">{{ game.description }}</div>
            <div class="ai-features mt-3 text-xs">
              <div class="feature-tags flex flex-wrap gap-1">
                <span
                  v-for="feature in game.aiFeatures"
                  :key="feature"
                  class="px-2 py-1 bg-green-500/30 rounded-full"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Current Session Stats -->
      <div v-if="currentSession" class="session-stats bg-gray-800/50 rounded-lg p-6 mb-8">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="mr-2">📊</span>
          Current Session: {{ currentSession.game.title }}
        </h2>

        <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-item bg-blue-600/30 rounded p-4 text-center">
            <div class="stat-value text-2xl font-bold">{{ currentSession.difficulty.toFixed(2) }}</div>
            <div class="stat-label text-sm text-gray-300">Current Difficulty</div>
          </div>
          <div class="stat-item bg-green-600/30 rounded p-4 text-center">
            <div class="stat-value text-2xl font-bold">{{ currentSession.score }}</div>
            <div class="stat-label text-sm text-gray-300">Score</div>
          </div>
          <div class="stat-item bg-purple-600/30 rounded p-4 text-center">
            <div class="stat-value text-2xl font-bold">{{ currentSession.adjustments }}</div>
            <div class="stat-label text-sm text-gray-300">AI Adjustments</div>
          </div>
          <div class="stat-item bg-orange-600/30 rounded p-4 text-center">
            <div class="stat-value text-2xl font-bold">{{ currentSession.playTime }}s</div>
            <div class="stat-label text-sm text-gray-300">Play Time</div>
          </div>
        </div>

        <!-- AI Controls -->
        <div class="ai-controls mt-6 space-y-4">
          <h3 class="text-lg font-semibold">🤖 AI Controls</h3>

          <!-- Simulate Performance -->
          <div class="performance-simulator bg-gray-700/50 rounded p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="font-medium">Simulate Performance Data:</span>
              <button
                @click="simulatePerformance"
                :disabled="isSimulating"
                class="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 px-4 py-2 rounded transition-colors"
              >
                {{ isSimulating ? 'Simulating...' : 'Trigger AI Adjustment' }}
              </button>
            </div>

            <div class="simulation-options grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Performance Level:</label>
                <select v-model="simulationData.performanceLevel" class="w-full bg-gray-600 rounded p-2">
                  <option value="poor">Poor (Force Easier)</option>
                  <option value="average">Average</option>
                  <option value="excellent">Excellent (Force Harder)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Response Speed:</label>
                <select v-model="simulationData.responseSpeed" class="w-full bg-gray-600 rounded p-2">
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>

          <!-- AI Adjustment History -->
          <div v-if="adjustmentHistory.length > 0" class="adjustment-history bg-gray-700/50 rounded p-4">
            <h4 class="font-medium mb-3">Recent AI Adjustments:</h4>
            <div class="adjustments-list space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="adjustment in adjustmentHistory.slice(-5)"
                :key="adjustment.id"
                class="adjustment-entry bg-gray-600/50 rounded p-3 text-sm"
              >
                <div class="flex justify-between items-start">
                  <div class="adjustment-info">
                    <div class="font-medium">{{ adjustment.type }}</div>
                    <div class="text-gray-300">{{ adjustment.reason }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      Difficulty: {{ adjustment.from.toFixed(3) }} → {{ adjustment.to.toFixed(3) }}
                    </div>
                  </div>
                  <div class="timestamp text-xs text-gray-400">
                    {{ formatTime(adjustment.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Controls -->
        <div class="game-controls mt-6 flex gap-4 justify-center">
          <button
            @click="startGame"
            :disabled="isGameActive"
            class="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {{ isGameActive ? 'Game Active' : 'Start AI-Enhanced Session' }}
          </button>
          <button
            @click="endGame"
            :disabled="!isGameActive"
            class="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      <!-- Logs -->
      <div v-if="logs.length > 0" class="logs bg-gray-800/50 rounded-lg p-6">
        <h2 class="text-xl font-bold mb-4">📝 AI Demo Logs</h2>
        <div class="logs-container max-h-64 overflow-y-auto space-y-1 font-mono text-sm">
          <div
            v-for="(log, index) in logs.slice(-20)"
            :key="index"
            class="log-entry"
            :class="{
              'text-green-400': log.level === 'success',
              'text-blue-400': log.level === 'info',
              'text-yellow-400': log.level === 'warn',
              'text-red-400': log.level === 'error'
            }"
          >
            [{{ log.timestamp }}] {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStreakIntegration } from '@/composables/useStreakIntegration'
import AIPredictionDashboard from '@/components/ai/AIPredictionDashboard.vue'
import logger from '@/utils/logger'

const router = useRouter()

// State
const demoUserId = ref('ai-demo-user')
const currentSession = ref(null)
const logs = ref([])
const isSimulating = ref(false)
const isGameActive = ref(false)
const adjustmentHistory = ref([])

const gameContext = reactive({
  sessionType: 'demo',
  availableTime: 15,
  energyLevel: 'medium',
  deviceType: 'web'
})

const simulationData = reactive({
  performanceLevel: 'average',
  responseSpeed: 'normal'
})

// Available games for demo
const availableGames = [
  {
    id: 'RhythmPhonicsMini',
    title: '3分リズムフォニックス',
    icon: '🎵',
    description: 'Quick rhythm-based phonics practice',
    aiFeatures: ['Difficulty', 'Tempo', 'Pattern']
  },
  {
    id: 'FloatingLetterHunt',
    title: 'Letter Hunt',
    icon: '🔤',
    description: 'Letter recognition with adaptive speed',
    aiFeatures: ['Speed', 'Count', 'Complexity']
  },
  {
    id: 'GrammarGameEngine',
    title: 'Grammar Master',
    icon: '📚',
    description: 'Grammar practice with smart hints',
    aiFeatures: ['Hints', 'Complexity', 'Time']
  }
]

// AI integration
let streakIntegration = null

// Methods
const addLog = (message, level = 'info') => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message,
    level
  })
}

const selectGame = async (game) => {
  addLog(`🎮 Selected game: ${game.title}`, 'info')

  currentSession.value = {
    game: game,
    difficulty: 0.5,
    score: 0,
    adjustments: 0,
    playTime: 0,
    startTime: null
  }

  // Initialize streak integration for the selected game
  streakIntegration = useStreakIntegration(game.id, {
    showStreakDisplay: true,
    autoRecord: true,
    minimumPlayTime: 0,
    trackProgress: true
  })

  addLog(`🤖 AI systems initialized for ${game.title}`, 'success')
}

const startGame = async () => {
  if (!currentSession.value || !streakIntegration) {
    addLog('❌ Please select a game first', 'error')
    return
  }

  try {
    isGameActive.value = true
    currentSession.value.startTime = Date.now()

    addLog('🚀 Starting AI-enhanced game session...', 'info')

    // Start game with AI integration
    const gameResult = await streakIntegration.startGame({
      userId: demoUserId.value,
      sessionType: 'demo',
      availableTime: 15,
      energyLevel: 'medium'
    })

    addLog(`🎯 Game started with difficulty: ${gameResult.aiConfig.difficulty.toFixed(3)}`, 'success')
    addLog(`📊 Recommendations: ${gameResult.aiConfig.recommendations.length}`, 'info')

    // Update session stats
    currentSession.value.difficulty = gameResult.aiConfig.difficulty

    // Start play time counter
    startPlayTimeCounter()

  } catch (error) {
    addLog(`❌ Failed to start game: ${error.message}`, 'error')
    isGameActive.value = false
  }
}

const endGame = async () => {
  if (!isGameActive.value || !streakIntegration) return

  try {
    isGameActive.value = false

    const playTime = Math.floor((Date.now() - currentSession.value.startTime) / 1000)
    currentSession.value.playTime = playTime

    addLog('🏁 Ending game session...', 'info')

    // End game with AI analysis
    const gameResult = await streakIntegration.endGame({
      score: currentSession.value.score,
      completed: true,
      accuracy: 0.85,
      playTime: playTime
    })

    addLog(`📊 Session ended. Final difficulty: ${gameResult.aiAnalysis.finalDifficulty.toFixed(3)}`, 'success')
    addLog(`🏆 Performance vs expected: ${(gameResult.aiAnalysis.performanceVsExpected * 100).toFixed(1)}%`, 'info')

  } catch (error) {
    addLog(`❌ Failed to end game: ${error.message}`, 'error')
  }
}

const simulatePerformance = async () => {
  if (!isGameActive.value || !streakIntegration) {
    addLog('❌ No active game session', 'error')
    return
  }

  isSimulating.value = true
  addLog('🧪 Simulating performance data...', 'info')

  try {
    // Generate simulated performance data
    const performanceData = generateSimulatedPerformance()

    addLog(`🎯 Simulating: ${performanceData.description}`, 'info')

    // Trigger AI adjustment
    const adjustment = await streakIntegration.adjustDifficultyRealtime(performanceData.data)

    if (adjustment) {
      currentSession.value.difficulty = adjustment.newDifficulty
      currentSession.value.adjustments++

      // Add to history
      adjustmentHistory.value.push({
        id: Date.now(),
        type: 'Real-time Adjustment',
        reason: adjustment.reason,
        from: currentSession.value.difficulty + (performanceData.data.difficultyChange || 0),
        to: adjustment.newDifficulty,
        timestamp: Date.now()
      })

      addLog(`⚡ AI adjusted difficulty to ${adjustment.newDifficulty.toFixed(3)}: ${adjustment.reason}`, 'success')
    } else {
      addLog('📊 No adjustment needed based on current performance', 'info')
    }

  } catch (error) {
    addLog(`❌ Simulation failed: ${error.message}`, 'error')
  } finally {
    isSimulating.value = false
  }
}

const generateSimulatedPerformance = () => {
  const scenarios = {
    poor: {
      description: 'Poor performance (3 wrong answers, slow response)',
      data: {
        correct: false,
        responseTime: 6000,
        consecutiveWrong: 3,
        averageAccuracy: 0.4,
        difficultyChange: -0.1
      }
    },
    average: {
      description: 'Average performance (mixed results)',
      data: {
        correct: Math.random() > 0.5,
        responseTime: 3000 + Math.random() * 2000,
        consecutiveWrong: Math.floor(Math.random() * 2),
        averageAccuracy: 0.7,
        difficultyChange: 0
      }
    },
    excellent: {
      description: 'Excellent performance (fast and accurate)',
      data: {
        correct: true,
        responseTime: 1200,
        consecutiveCorrect: 5,
        averageAccuracy: 0.95,
        difficultyChange: 0.1
      }
    }
  }

  return scenarios[simulationData.performanceLevel] || scenarios.average
}

const handleRecommendationSelected = (recommendation) => {
  addLog(`🎯 Recommendation selected: ${recommendation.gameId}`, 'info')

  // Find the game in our available games
  const game = availableGames.find(g => g.id === recommendation.gameId)
  if (game) {
    selectGame(game)
  } else {
    addLog(`⚠️ Game ${recommendation.gameId} not available in demo`, 'warn')
  }
}

const startPlayTimeCounter = () => {
  const interval = setInterval(() => {
    if (!isGameActive.value) {
      clearInterval(interval)
      return
    }

    currentSession.value.playTime = Math.floor((Date.now() - currentSession.value.startTime) / 1000)

    // Simulate score increase
    currentSession.value.score += Math.floor(Math.random() * 10)
  }, 1000)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Lifecycle
onMounted(() => {
  addLog('🤖 AI Game Demo initialized', 'success')
  addLog('📝 Select a game to begin testing AI features', 'info')
})
</script>

<style scoped>
.games-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
}

.logs-container {
  scrollbar-width: thin;
  scrollbar-color: rgb(55, 65, 81) transparent;
}

.logs-container::-webkit-scrollbar {
  width: 6px;
}

.logs-container::-webkit-scrollbar-track {
  background: transparent;
}

.logs-container::-webkit-scrollbar-thumb {
  background: rgb(55, 65, 81);
  border-radius: 3px;
}

.adjustments-list {
  scrollbar-width: thin;
  scrollbar-color: rgb(55, 65, 81) transparent;
}

.adjustments-list::-webkit-scrollbar {
  width: 4px;
}

.adjustments-list::-webkit-scrollbar-track {
  background: transparent;
}

.adjustments-list::-webkit-scrollbar-thumb {
  background: rgb(55, 65, 81);
  border-radius: 2px;
}
</style>