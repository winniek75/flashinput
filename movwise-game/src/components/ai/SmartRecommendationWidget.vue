<template>
  <div class="smart-recommendation-widget">
    <!-- AI推薦セクション -->
    <div class="ai-recommendations bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="ai-icon text-2xl">🤖</div>
          <div>
            <h2 class="text-xl font-bold galaxy-text-primary">AI学習アシスタント</h2>
            <p class="text-sm text-galaxy-moon-silver">あなただけの学習推薦</p>
          </div>
        </div>
        <div class="ai-status flex items-center gap-2">
          <div :class="aiStatusClass" class="w-2 h-2 rounded-full"></div>
          <span class="text-xs text-gray-400">{{ aiStatusText }}</span>
        </div>
      </div>

      <!-- ローディング状態 -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <p class="text-sm text-gray-400 mt-2">AI分析中...</p>
      </div>

      <!-- 推薦表示 -->
      <div v-else-if="recommendations.length > 0" class="recommendations-container">
        <!-- 今すぐおすすめ -->
        <div v-if="immediateRecommendation" class="immediate-rec bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">⚡</span>
                <span class="font-semibold text-green-400">今すぐプレイ推薦</span>
                <span class="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded-full">
                  {{ Math.round(immediateRecommendation.finalScore * 100) }}% マッチ
                </span>
              </div>
              <h3 class="font-bold text-white mb-1">{{ getGameTitle(immediateRecommendation.gameId) }}</h3>
              <p class="text-sm text-gray-300">{{ immediateRecommendation.reason }}</p>
              <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>⏱️ ~{{ immediateRecommendation.estimatedDuration }}分</span>
                <span>🎯 難易度 {{ Math.round(immediateRecommendation.difficulty * 100) }}%</span>
              </div>
            </div>
            <button
              @click="playRecommendedGame(immediateRecommendation)"
              class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors ml-4"
            >
              プレイ
            </button>
          </div>
        </div>

        <!-- その他の推薦 -->
        <div class="other-recommendations">
          <h3 class="text-sm font-medium text-gray-300 mb-3">その他のおすすめ</h3>
          <div class="recommendations-grid grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="rec in otherRecommendations"
              :key="rec.gameId"
              class="rec-card bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/30 rounded-lg p-3 cursor-pointer transition-all"
              @click="playRecommendedGame(rec)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-white text-sm">{{ getGameTitle(rec.gameId) }}</span>
                <span class="text-xs text-blue-400">{{ Math.round(rec.finalScore * 100) }}%</span>
              </div>
              <p class="text-xs text-gray-400 mb-2">{{ rec.reason }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span>⏱️ {{ rec.estimatedDuration }}分</span>
                <span>🎯 {{ Math.round(rec.difficulty * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="error" class="text-center py-6">
        <div class="text-4xl mb-2">🤔</div>
        <p class="text-sm text-gray-400">AI分析がまだ準備できていません</p>
        <button
          @click="loadRecommendations"
          class="mt-3 text-xs text-purple-400 hover:text-purple-300"
        >
          再試行
        </button>
      </div>

      <!-- データ不足状態 -->
      <div v-else class="text-center py-6">
        <div class="text-4xl mb-2">🎮</div>
        <p class="text-sm text-gray-400 mb-2">まずはゲームをプレイしてAIに学習させましょう</p>
        <button
          @click="showRandomGame"
          class="text-xs text-blue-400 hover:text-blue-300"
        >
          おすすめゲームを表示
        </button>
      </div>

      <!-- 設定・詳細リンク -->
      <div class="ai-footer flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
        <div class="ai-stats text-xs text-gray-500">
          <span v-if="lastUpdate">最終更新: {{ formatTime(lastUpdate) }}</span>
        </div>
        <div class="ai-actions flex gap-3 text-xs">
          <button
            @click="$emit('showAIDemo')"
            class="text-purple-400 hover:text-purple-300"
          >
            AI機能テスト
          </button>
          <button
            @click="$emit('showAIDashboard')"
            class="text-blue-400 hover:text-blue-300"
          >
            詳細分析
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningRecommendationEngine } from '@/services/learningRecommendationEngine'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import { useUserStore } from '@/stores/userStore'
import logger from '@/utils/logger'

const props = defineProps({
  userId: {
    type: String,
    default: 'guest'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['gameSelected', 'showAIDashboard', 'showAIDemo'])

const router = useRouter()

// Services & Stores
const recommendationEngine = useLearningRecommendationEngine()
const behaviorStore = useBehaviorAnalysisStore()
const userStore = useUserStore()

// Reactive State
const recommendations = ref([])
const isLoading = ref(false)
const error = ref(null)
const lastUpdate = ref(null)
const isInitialized = ref(false)

// Computed Properties
const immediateRecommendation = computed(() => {
  return recommendations.value.find(rec => rec.type === 'immediate' || rec.priority > 0.8)
})

const otherRecommendations = computed(() => {
  return recommendations.value.filter(rec => rec !== immediateRecommendation.value).slice(0, 4)
})

const aiStatusClass = computed(() => {
  if (!isInitialized.value) return 'bg-yellow-400'
  if (error.value) return 'bg-red-400'
  if (recommendations.value.length > 0) return 'bg-green-400'
  return 'bg-blue-400'
})

const aiStatusText = computed(() => {
  if (!isInitialized.value) return '初期化中'
  if (error.value) return 'オフライン'
  if (recommendations.value.length > 0) return 'アクティブ'
  return '学習中'
})

// Game Title Mapping
const gameTitles = {
  'RhythmPhonicsMini': '3分リズムフォニックス',
  'FloatingLetterHunt': '浮遊文字ハント',
  'GrammarGameEngine': '文法マスター',
  'PhonicsTrainingHub': 'フォニックス訓練場',
  'WordFamilyTreeGame': '単語ファミリーツリー',
  'VerbTimeMachine': '動詞タイムマシン',
  'TypingArena': 'タイピングアリーナ',
  'SightWordMaster': 'サイトワードマスター',
  'ComplexPhonemeGame': '複合音素ゲーム',
  'CvPronunciationTrainer': '発音トレーナー'
}

// Methods
const getGameTitle = (gameId) => {
  return gameTitles[gameId] || gameId
}

const loadRecommendations = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    error.value = null

    logger.log('🤖 Loading AI recommendations for home view...')

    // Initialize AI engine if needed
    if (!isInitialized.value) {
      await recommendationEngine.initialize()
      isInitialized.value = true
    }

    // Get user context
    const userProfile = behaviorStore.getUserProfile(props.userId)
    const hasPlayHistory = userProfile.activityMetrics?.totalGamesPlayed > 0

    if (!hasPlayHistory) {
      // Show starter recommendations for new users
      recommendations.value = generateStarterRecommendations()
      logger.log('📝 Generated starter recommendations for new user')
    } else {
      // Get AI-powered recommendations
      const recResult = await recommendationEngine.generateRecommendations(props.userId, {
        sessionType: 'home_view',
        context: 'main_screen',
        availableTime: 15,
        prioritizeImmediate: true
      })

      recommendations.value = recResult.recommendations
      logger.log(`🎯 Loaded ${recommendations.value.length} AI recommendations`)
    }

    lastUpdate.value = Date.now()

  } catch (err) {
    error.value = err.message
    logger.error('Failed to load AI recommendations:', err)

    // Fallback to default recommendations
    recommendations.value = generateStarterRecommendations()
  } finally {
    isLoading.value = false
  }
}

const generateStarterRecommendations = () => {
  return [
    {
      gameId: 'RhythmPhonicsMini',
      type: 'immediate',
      reason: '新規ユーザーにおすすめの3分間体験',
      estimatedDuration: 3,
      difficulty: 0.3,
      priority: 0.9,
      finalScore: 0.9
    },
    {
      gameId: 'FloatingLetterHunt',
      reason: '基礎的な文字認識ゲーム',
      estimatedDuration: 5,
      difficulty: 0.4,
      priority: 0.7,
      finalScore: 0.7
    },
    {
      gameId: 'PhonicsTrainingHub',
      reason: 'フォニックスの基礎を学習',
      estimatedDuration: 8,
      difficulty: 0.5,
      priority: 0.6,
      finalScore: 0.6
    }
  ]
}

const playRecommendedGame = (recommendation) => {
  logger.log('🎮 Playing recommended game:', recommendation.gameId)

  // Record recommendation selection
  if (isInitialized.value) {
    behaviorStore.recordEvent('recommendation_selected', {
      gameId: recommendation.gameId,
      reason: recommendation.reason,
      confidence: recommendation.finalScore,
      source: 'home_widget'
    })
  }

  emit('gameSelected', recommendation)

  // Navigate to game based on gameId
  const gameRoutes = {
    'RhythmPhonicsMini': '/games/rhythm-phonics-mini',
    'FloatingLetterHunt': '/games/floating-letter-hunt',
    'GrammarGameEngine': '/games/grammar-engine',
    'PhonicsTrainingHub': '/games/phonics-hub',
    'TypingArena': '/games/typing-arena'
  }

  const route = gameRoutes[recommendation.gameId]
  if (route) {
    router.push(route)
  } else {
    logger.warn(`No route defined for game: ${recommendation.gameId}`)
    // Fallback to general game selection
    router.push('/platforms/phonics-adventure')
  }
}

const showRandomGame = () => {
  const randomRec = generateStarterRecommendations()[0]
  playRecommendedGame(randomRec)
}

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`

  const days = Math.floor(hours / 24)
  return `${days}日前`
}

// Lifecycle
onMounted(() => {
  loadRecommendations()
})

// Watch for user changes
watch(() => props.userId, () => {
  if (props.userId && props.userId !== 'guest') {
    loadRecommendations()
  }
})

// Auto-refresh every 5 minutes
let refreshInterval = null
onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!isLoading.value && isInitialized.value) {
      loadRecommendations()
    }
  }, 5 * 60 * 1000) // 5 minutes
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.smart-recommendation-widget {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rec-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
}

.ai-icon {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.3));
}

.immediate-rec {
  position: relative;
  overflow: hidden;
}

.immediate-rec::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>