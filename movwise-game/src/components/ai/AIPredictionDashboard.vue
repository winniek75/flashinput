<template>
  <div class="ai-dashboard bg-gray-900 text-white rounded-lg p-6 space-y-6">
    <!-- ヘッダー -->
    <div class="header flex items-center justify-between">
      <div class="title flex items-center space-x-3">
        <div class="icon text-2xl">🤖</div>
        <div>
          <h2 class="text-xl font-bold">AI Learning Assistant</h2>
          <p class="text-sm text-gray-400">Personalized insights & recommendations</p>
        </div>
      </div>
      <div class="status flex items-center space-x-2 text-sm">
        <div :class="aiStatus.color" class="w-2 h-2 rounded-full"></div>
        <span class="text-gray-300">{{ aiStatus.text }}</span>
      </div>
    </div>

    <!-- メトリクス概要 -->
    <div class="metrics grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="metric bg-blue-800/30 rounded-lg p-4 text-center">
        <div class="value text-2xl font-bold text-blue-400">{{ churnRisk }}%</div>
        <div class="label text-xs text-gray-400">Churn Risk</div>
      </div>
      <div class="metric bg-green-800/30 rounded-lg p-4 text-center">
        <div class="value text-2xl font-bold text-green-400">{{ engagementScore }}%</div>
        <div class="label text-xs text-gray-400">Engagement</div>
      </div>
      <div class="metric bg-purple-800/30 rounded-lg p-4 text-center">
        <div class="value text-2xl font-bold text-purple-400">{{ currentDifficulty }}</div>
        <div class="label text-xs text-gray-400">Difficulty</div>
      </div>
      <div class="metric bg-orange-800/30 rounded-lg p-4 text-center">
        <div class="value text-2xl font-bold text-orange-400">{{ predictions.length }}</div>
        <div class="label text-xs text-gray-400">Active Predictions</div>
      </div>
    </div>

    <!-- AI推薦 -->
    <div v-if="recommendations.length > 0" class="recommendations">
      <h3 class="text-lg font-semibold mb-3 flex items-center">
        <span class="mr-2">🎯</span>
        Personalized Recommendations
        <span class="ml-2 text-xs bg-blue-600 px-2 py-1 rounded-full">{{ recommendationConfidence }}% confident</span>
      </h3>
      <div class="recommendation-list space-y-3">
        <div
          v-for="rec in recommendations"
          :key="rec.gameId"
          class="recommendation bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors cursor-pointer"
          @click="selectRecommendation(rec)"
        >
          <div class="content flex-1">
            <div class="game-title font-medium">{{ rec.gameTitle || rec.gameId }}</div>
            <div class="reason text-sm text-gray-400">{{ rec.reason }}</div>
            <div class="details flex items-center space-x-4 mt-2 text-xs">
              <span class="difficulty text-purple-400">
                Difficulty: {{ (rec.difficulty * 100).toFixed(0) }}%
              </span>
              <span class="duration text-blue-400">
                ~{{ rec.estimatedDuration }}min
              </span>
              <span class="priority text-green-400">
                Priority: {{ (rec.finalScore * 100).toFixed(0) }}%
              </span>
            </div>
          </div>
          <div class="action">
            <button class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm transition-colors">
              Play
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 難易度調整履歴 -->
    <div v-if="difficultyHistory.length > 0" class="difficulty-history">
      <h3 class="text-lg font-semibold mb-3 flex items-center">
        <span class="mr-2">⚡</span>
        Real-time Adaptations
      </h3>
      <div class="history-list space-y-2 max-h-32 overflow-y-auto">
        <div
          v-for="entry in difficultyHistory.slice(-5)"
          :key="entry.timestamp"
          class="history-entry bg-gray-800 rounded p-3 text-sm"
        >
          <div class="flex items-center justify-between">
            <span class="change">
              {{ entry.from.toFixed(2) }} → {{ entry.to.toFixed(2) }}
            </span>
            <span class="time text-gray-400">{{ formatTime(entry.timestamp) }}</span>
          </div>
          <div class="reason text-xs text-gray-400 mt-1">{{ entry.reason }}</div>
        </div>
      </div>
    </div>

    <!-- 学習パターン分析 -->
    <div class="learning-patterns">
      <h3 class="text-lg font-semibold mb-3 flex items-center">
        <span class="mr-2">📊</span>
        Learning Patterns
      </h3>
      <div class="patterns grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pattern-item bg-gray-800 rounded-lg p-4">
          <div class="title text-sm font-medium text-gray-300">Optimal Study Time</div>
          <div class="value text-lg text-blue-400">{{ optimalStudyTime }}</div>
        </div>
        <div class="pattern-item bg-gray-800 rounded-lg p-4">
          <div class="title text-sm font-medium text-gray-300">Preferred Game Type</div>
          <div class="value text-lg text-green-400">{{ preferredGameType }}</div>
        </div>
        <div class="pattern-item bg-gray-800 rounded-lg p-4">
          <div class="title text-sm font-medium text-gray-300">Learning Streak</div>
          <div class="value text-lg text-purple-400">{{ learningStreak }} days</div>
        </div>
        <div class="pattern-item bg-gray-800 rounded-lg p-4">
          <div class="title text-sm font-medium text-gray-300">Skill Progress</div>
          <div class="value text-lg text-orange-400">{{ skillProgress }}%</div>
        </div>
      </div>
    </div>

    <!-- AI信頼度とデバッグ情報 -->
    <div v-if="showDebugInfo" class="debug-info bg-gray-800 rounded-lg p-4">
      <h4 class="text-sm font-semibold mb-2 text-gray-300">Debug Information</h4>
      <div class="debug-grid grid grid-cols-2 gap-4 text-xs">
        <div>
          <div class="label text-gray-400">Data Quality</div>
          <div class="value">{{ (dataQuality * 100).toFixed(1) }}%</div>
        </div>
        <div>
          <div class="label text-gray-400">Model Version</div>
          <div class="value">{{ modelVersion }}</div>
        </div>
        <div>
          <div class="label text-gray-400">Last Update</div>
          <div class="value">{{ formatTime(lastUpdate) }}</div>
        </div>
        <div>
          <div class="label text-gray-400">Predictions Made</div>
          <div class="value">{{ totalPredictions }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useLearningRecommendationEngine } from '@/services/learningRecommendationEngine'
import { useAdaptiveDifficultySystem } from '@/services/adaptiveDifficultySystem'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import { useAIPrediction } from '@/services/aiPredictionEngine'
import logger from '@/utils/logger'

const props = defineProps({
  userId: {
    type: String,
    default: 'guest'
  },
  gameContext: {
    type: Object,
    default: () => ({})
  },
  showDebugInfo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['recommendationSelected', 'difficultyChanged'])

// Services
const recommendationEngine = useLearningRecommendationEngine()
const difficultySystem = useAdaptiveDifficultySystem()
const behaviorStore = useBehaviorAnalysisStore()
const aiEngine = useAIPrediction()

// Reactive state
const recommendations = ref([])
const churnRisk = ref(0)
const engagementScore = ref(75)
const currentDifficulty = ref(0.5)
const predictions = ref([])
const difficultyHistory = ref([])
const recommendationConfidence = ref(0)
const lastUpdate = ref(Date.now())
const dataQuality = ref(0.7)
const modelVersion = ref('1.0.0')
const totalPredictions = ref(0)
const isInitialized = ref(false)

// Computed properties
const aiStatus = computed(() => {
  if (!isInitialized.value) {
    return { text: 'Initializing...', color: 'bg-yellow-400' }
  }
  if (dataQuality.value < 0.3) {
    return { text: 'Learning...', color: 'bg-orange-400' }
  }
  if (dataQuality.value > 0.8) {
    return { text: 'High Confidence', color: 'bg-green-400' }
  }
  return { text: 'Active', color: 'bg-blue-400' }
})

const optimalStudyTime = computed(() => {
  const userProfile = behaviorStore.getUserProfile(props.userId)
  const hours = userProfile.behaviorPatterns?.timePreferences?.preferredHours || []
  if (hours.length === 0) return 'Learning...'

  const hour = hours[0]
  if (hour < 12) return `${hour}:00 AM`
  if (hour === 12) return '12:00 PM'
  return `${hour - 12}:00 PM`
})

const preferredGameType = computed(() => {
  const userProfile = behaviorStore.getUserProfile(props.userId)
  const preferences = userProfile.behaviorPatterns?.gamePreferences?.favoriteGenres || []
  return preferences[0] || 'Exploring...'
})

const learningStreak = computed(() => {
  const userProfile = behaviorStore.getUserProfile(props.userId)
  return userProfile.motivationMetrics?.currentStreak || 0
})

const skillProgress = computed(() => {
  const userProfile = behaviorStore.getUserProfile(props.userId)
  return Math.round(userProfile.performance?.averageScore || 0)
})

// Methods
const initializeAI = async () => {
  try {
    logger.log('🤖 Initializing AI Dashboard...')

    await Promise.all([
      recommendationEngine.initialize(),
      difficultySystem.initialize(),
      aiEngine.initialize()
    ])

    await refreshData()
    isInitialized.value = true

    logger.log('✅ AI Dashboard initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize AI Dashboard:', error)
  }
}

const refreshData = async () => {
  try {
    // Get recommendations
    const recResult = await recommendationEngine.generateRecommendations(
      props.userId,
      {
        sessionType: 'dashboard_view',
        ...props.gameContext
      }
    )

    recommendations.value = recResult.recommendations.map(rec => ({
      ...rec,
      gameTitle: getGameTitle(rec.gameId)
    }))
    recommendationConfidence.value = Math.round(recResult.confidence * 100)

    // Get user profile for metrics
    const userProfile = behaviorStore.getUserProfile(props.userId)

    // Predict churn risk
    churnRisk.value = Math.round(await aiEngine.predictChurn(userProfile) * 100)

    // Calculate engagement
    const engagement = await aiEngine.forecastEngagement(userProfile, props.gameContext)
    engagementScore.value = Math.round(engagement * 100)

    // Update other metrics
    dataQuality.value = calculateDataQuality(userProfile)
    totalPredictions.value = predictions.value.length
    lastUpdate.value = Date.now()

    logger.log('📊 AI Dashboard data refreshed')
  } catch (error) {
    logger.error('Failed to refresh AI data:', error)
  }
}

const calculateDataQuality = (userProfile) => {
  let quality = 0.3 // Base quality

  if (userProfile.activityMetrics?.totalGamesPlayed > 10) quality += 0.2
  if (userProfile.activityMetrics?.totalStudyTime > 600) quality += 0.2 // 10+ hours
  if (userProfile.performance?.strongSkills?.length > 0) quality += 0.15
  if (userProfile.motivationMetrics?.currentStreak > 3) quality += 0.15

  return Math.min(1.0, quality)
}

const getGameTitle = (gameId) => {
  const titles = {
    'FloatingLetterHunt': 'Letter Hunt',
    'GrammarGameEngine': 'Grammar Master',
    'TypingArena': 'Typing Challenge',
    'RhythmPhonicsMini': 'Rhythm Phonics',
    'PhonicsTrainingHub': 'Phonics Training',
    'WordFamilyTreeGame': 'Word Family Tree',
    'VerbTimeMachine': 'Verb Time Machine'
  }
  return titles[gameId] || gameId
}

const selectRecommendation = (recommendation) => {
  logger.log('🎯 Recommendation selected:', recommendation.gameId)
  emit('recommendationSelected', recommendation)
}

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Lifecycle
onMounted(() => {
  initializeAI()
})

// Watchers
watch(() => props.userId, () => {
  if (isInitialized.value) {
    refreshData()
  }
}, { immediate: true })

// Auto-refresh every 30 seconds
let refreshInterval = null
onMounted(() => {
  refreshInterval = setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.ai-dashboard {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.recommendation:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.history-list {
  scrollbar-width: thin;
  scrollbar-color: rgb(55, 65, 81) transparent;
}

.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgb(55, 65, 81);
  border-radius: 4px;
}
</style>