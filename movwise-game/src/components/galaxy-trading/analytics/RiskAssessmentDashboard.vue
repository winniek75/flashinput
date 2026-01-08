<template>
  <div class="risk-assessment-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <!-- 宇宙背景エフェクト -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-30"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`
        }"
      ></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-purple-700 mb-2 flex items-center gap-3">
              📊 Galaxy Risk Assessment Center
            </h1>
            <p class="text-purple-600">リスク分析とポートフォリオ最適化</p>
          </div>
          
          <div class="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-purple-800">{{ riskScore }}/100</div>
              <div class="text-sm text-purple-600">リスク理解度</div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインダッシュボード -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左側: ポートフォリオ分析 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 現在のポートフォリオ -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              💼 現在のポートフォリオ
            </h2>
            
            <div v-if="portfolio.length > 0" class="space-y-4">
              <div
                v-for="investment in portfolio"
                :key="investment.id"
                class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ getPlanetIcon(investment.planetId) }}</span>
                    <div>
                      <h3 class="font-bold text-gray-800">{{ getPlanetName(investment.planetId) }}</h3>
                      <p class="text-sm text-gray-600">{{ investment.tier }}階層投資</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-gray-800">{{ investment.currentValue }} EP</div>
                    <div class="text-sm" :class="getReturnColor(investment.totalReturns, investment.cost)">
                      {{ getReturnPercentage(investment.totalReturns, investment.cost) }}%
                    </div>
                  </div>
                </div>
                
                <!-- リスクインジケーター -->
                <div class="flex items-center gap-2 mt-3">
                  <span class="text-sm text-gray-600">リスクレベル:</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      class="rounded-full h-2 transition-all duration-500"
                      :class="getRiskBarColor(investment.riskLevel)"
                      :style="{ width: `${investment.riskLevel}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-bold" :class="getRiskLabelColor(investment.riskLevel)">
                    {{ getRiskLabel(investment.riskLevel) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-8">
              <div class="text-6xl mb-4">📈</div>
              <h3 class="text-xl font-bold text-gray-600 mb-2">投資がまだありません</h3>
              <p class="text-gray-500">Galaxy Trading Hubで投資を始めましょう</p>
            </div>
          </div>

          <!-- ポートフォリオ最適化提案 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎯 最適化提案
            </h2>
            
            <div class="space-y-4">
              <div
                v-for="(suggestion, index) in optimizationSuggestions"
                :key="index"
                class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-xl p-4"
              >
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ suggestion.icon }}</span>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1">{{ suggestion.title }}</h3>
                    <p class="text-gray-600 text-sm mb-2">{{ suggestion.description }}</p>
                    <div class="flex items-center gap-4">
                      <span class="text-xs px-2 py-1 rounded-full" :class="getPriorityClass(suggestion.priority)">
                        {{ getPriorityLabel(suggestion.priority) }}
                      </span>
                      <span class="text-xs text-gray-500">
                        期待効果: {{ suggestion.expectedImpact }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: リスク分析とツール -->
        <div class="space-y-6">
          <!-- リスク許容度テスト -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🧪 リスク許容度テスト
            </h2>
            
            <div v-if="!riskTestCompleted" class="space-y-4">
              <div class="text-sm text-gray-600 mb-4">
                あなたの投資スタイルを理解するためのテストです
              </div>
              
              <div v-if="currentQuestion" class="space-y-3">
                <h3 class="font-medium text-gray-800">{{ currentQuestion.question }}</h3>
                <div class="space-y-2">
                  <button
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    @click="selectRiskAnswer(index)"
                    class="w-full text-left p-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200"
                  >
                    {{ option.text }}
                  </button>
                </div>
              </div>
              
              <div class="mt-4">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-purple-500 rounded-full h-2 transition-all duration-500"
                    :style="{ width: `${(currentQuestionIndex / riskQuestions.length) * 100}%` }"
                  ></div>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  {{ currentQuestionIndex }} / {{ riskQuestions.length }}
                </div>
              </div>
            </div>
            
            <div v-else class="text-center">
              <div class="text-4xl mb-3">{{ getRiskProfileIcon(riskProfile) }}</div>
              <h3 class="font-bold text-lg text-gray-800 mb-2">{{ getRiskProfileName(riskProfile) }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ getRiskProfileDescription(riskProfile) }}</p>
              <button
                @click="retakeRiskTest"
                class="text-purple-600 hover:text-purple-800 text-sm underline"
              >
                テストをやり直す
              </button>
            </div>
          </div>

          <!-- 市場シミュレーター -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📈 市場シミュレーター
            </h2>
            
            <div class="space-y-4">
              <div class="text-sm text-gray-600">
                仮想的な市場変動を体験してリスクを学習
              </div>
              
              <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-medium text-gray-800 mb-2">現在のシナリオ</h3>
                <p class="text-sm text-gray-600 mb-3">{{ currentScenario.description }}</p>
                
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="bg-white rounded-lg p-2">
                    <div class="text-sm font-bold text-red-600">{{ currentScenario.appleChange }}%</div>
                    <div class="text-xs text-gray-500">Apple</div>
                  </div>
                  <div class="bg-white rounded-lg p-2">
                    <div class="text-sm font-bold text-blue-600">{{ currentScenario.robotChange }}%</div>
                    <div class="text-xs text-gray-500">Robot</div>
                  </div>
                  <div class="bg-white rounded-lg p-2">
                    <div class="text-sm font-bold text-purple-600">{{ currentScenario.grammarChange }}%</div>
                    <div class="text-xs text-gray-500">Grammar</div>
                  </div>
                </div>
              </div>
              
              <button
                @click="runSimulation"
                class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
              >
                新しいシナリオを実行
              </button>
            </div>
          </div>

          <!-- 学習リソース -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📚 学習リソース
            </h2>
            
            <div class="space-y-3">
              <button
                @click="goToEducation"
                class="w-full text-left p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🎓</span>
                  <div>
                    <h3 class="font-medium text-gray-800">投資教育カリキュラム</h3>
                    <p class="text-sm text-gray-600">基礎から学ぶ投資の知識</p>
                  </div>
                </div>
              </button>
              
              <button
                @click="viewAnalytics"
                class="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">📊</span>
                  <div>
                    <h3 class="font-medium text-gray-800">学習分析ダッシュボード</h3>
                    <p class="text-sm text-gray-600">詳細な学習データ分析</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { createLearningAnalytics } from '@/utils/learningAnalytics.js'

export default {
  name: 'RiskAssessmentDashboard',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    const analytics = createLearningAnalytics(gameStore, galaxyStore)
    
    // === 状態管理 ===
    const particles = ref([])
    const riskTestCompleted = ref(false)
    const currentQuestionIndex = ref(0)
    const riskAnswers = ref([])
    const riskProfile = ref('moderate')
    const currentScenario = ref({
      description: '安定した市場環境',
      appleChange: 2.5,
      robotChange: 1.8,
      grammarChange: 3.2
    })
    
    // リスク許容度テストの質問
    const riskQuestions = ref([
      {
        question: '投資で一番大切だと思うことは？',
        options: [
          { text: '安全性を最優先にする', value: 'conservative' },
          { text: '安全性と成長のバランス', value: 'moderate' },
          { text: '大きな成長を目指す', value: 'aggressive' }
        ]
      },
      {
        question: '投資した金額が10%減ったら？',
        options: [
          { text: 'すぐに売却して損失を確定', value: 'conservative' },
          { text: '様子を見て判断する', value: 'moderate' },
          { text: '更に投資して平均価格を下げる', value: 'aggressive' }
        ]
      },
      {
        question: '投資期間はどのくらいを考えている？',
        options: [
          { text: '短期（1年未満）', value: 'aggressive' },
          { text: '中期（1-5年）', value: 'moderate' },
          { text: '長期（5年以上）', value: 'conservative' }
        ]
      }
    ])
    
    // === 計算プロパティ ===
    const portfolio = computed(() => {
      return galaxyStore.playerInvestments.ownedPlanets.map(investment => {
        const planet = galaxyStore.planetCorporations[investment.planetId]
        const riskLevels = {
          'apple-planet': 25,
          'robot-planet': 50,
          'grammar-moon': 75
        }
        
        return {
          ...investment,
          riskLevel: riskLevels[investment.planetId] || 50,
          planetName: planet?.name || investment.planetId
        }
      })
    })
    
    const riskScore = computed(() => {
      const analysisResult = analytics.analyzeOverallProgress()
      return Math.round(analysisResult.investmentReadiness.components.riskUnderstanding || 0)
    })
    
    const currentQuestion = computed(() => {
      return riskQuestions.value[currentQuestionIndex.value] || null
    })
    
    const optimizationSuggestions = computed(() => {
      const suggestions = []
      const portfolioValue = portfolio.value
      
      if (portfolioValue.length === 0) {
        suggestions.push({
          icon: '🚀',
          title: '投資を始めましょう',
          description: 'まずは低リスクのApple Planetから投資を始めることをお勧めします',
          priority: 'high',
          expectedImpact: '投資経験の獲得'
        })
      } else if (portfolioValue.length === 1) {
        suggestions.push({
          icon: '🎯',
          title: 'ポートフォリオの分散',
          description: '複数の惑星に投資してリスクを分散させましょう',
          priority: 'medium',
          expectedImpact: 'リスク軽減'
        })
      }
      
      // リスクレベルの分析
      const avgRisk = portfolioValue.reduce((sum, inv) => sum + inv.riskLevel, 0) / portfolioValue.length
      if (avgRisk > 60 && riskProfile.value === 'conservative') {
        suggestions.push({
          icon: '⚠️',
          title: 'リスクレベルの調整',
          description: 'あなたのリスク許容度に対して高リスクな投資が多すぎます',
          priority: 'high',
          expectedImpact: 'リスク最適化'
        })
      }
      
      return suggestions
    })
    
    // === メソッド ===
    
    /**
     * パーティクル生成
     */
    const generateParticles = () => {
      particles.value = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
      }))
    }
    
    /**
     * リスク許容度テスト回答
     */
    const selectRiskAnswer = (answerIndex) => {
      const answer = currentQuestion.value.options[answerIndex]
      riskAnswers.value.push(answer.value)
      
      if (currentQuestionIndex.value < riskQuestions.value.length - 1) {
        currentQuestionIndex.value++
      } else {
        completeRiskTest()
      }
    }
    
    /**
     * リスク許容度テスト完了
     */
    const completeRiskTest = () => {
      // 回答を分析してリスクプロファイルを決定
      const counts = riskAnswers.value.reduce((acc, answer) => {
        acc[answer] = (acc[answer] || 0) + 1
        return acc
      }, {})
      
      riskProfile.value = Object.keys(counts).reduce((a, b) => 
        counts[a] > counts[b] ? a : b
      )
      
      riskTestCompleted.value = true
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'risk-assessment',
        'risk-tolerance-test',
        riskScore.value
      )
    }
    
    /**
     * リスクテストやり直し
     */
    const retakeRiskTest = () => {
      riskTestCompleted.value = false
      currentQuestionIndex.value = 0
      riskAnswers.value = []
    }
    
    /**
     * 市場シミュレーション実行
     */
    const runSimulation = () => {
      const scenarios = [
        {
          description: '経済成長期：全体的に好調',
          appleChange: 8.2,
          robotChange: 12.5,
          grammarChange: 6.8
        },
        {
          description: '市場調整期：一時的な下落',
          appleChange: -3.1,
          robotChange: -8.4,
          grammarChange: -2.7
        },
        {
          description: '技術革新期：Robot Planetが急成長',
          appleChange: 2.1,
          robotChange: 18.7,
          grammarChange: 4.3
        },
        {
          description: '教育需要増：Grammar Moonに注目',
          appleChange: 1.8,
          robotChange: 3.2,
          grammarChange: 15.6
        }
      ]
      
      currentScenario.value = scenarios[Math.floor(Math.random() * scenarios.length)]
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'market-simulation',
        'scenario-experience',
        10
      )
    }
    
    /**
     * 投資教育へ移動
     */
    const goToEducation = () => {
      router.push('/investment-education')
    }
    
    /**
     * 学習分析表示
     */
    const viewAnalytics = () => {
      router.push('/learning-analytics')
    }
    
    /**
     * 戻るボタン
     */
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ヘルパーメソッド ===
    
    const getPlanetIcon = (planetId) => {
      const icons = {
        'apple-planet': '🍎',
        'robot-planet': '🤖',
        'grammar-moon': '🌙'
      }
      return icons[planetId] || '🪐'
    }
    
    const getPlanetName = (planetId) => {
      const names = {
        'apple-planet': 'Apple Garden Planet',
        'robot-planet': 'Robot Tech Planet', 
        'grammar-moon': 'Grammar Moon Academy'
      }
      return names[planetId] || planetId
    }
    
    const getReturnColor = (returns, cost) => {
      const percentage = (returns / cost) * 100
      return percentage > 0 ? 'text-green-600' : 'text-red-600'
    }
    
    const getReturnPercentage = (returns, cost) => {
      return ((returns / cost) * 100).toFixed(1)
    }
    
    const getRiskBarColor = (riskLevel) => {
      if (riskLevel < 30) return 'bg-green-500'
      if (riskLevel < 60) return 'bg-yellow-500'
      return 'bg-red-500'
    }
    
    const getRiskLabelColor = (riskLevel) => {
      if (riskLevel < 30) return 'text-green-600'
      if (riskLevel < 60) return 'text-yellow-600'
      return 'text-red-600'
    }
    
    const getRiskLabel = (riskLevel) => {
      if (riskLevel < 30) return '低リスク'
      if (riskLevel < 60) return '中リスク'
      return '高リスク'
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      }
      return classes[priority] || 'bg-gray-100 text-gray-800'
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        high: '高優先度',
        medium: '中優先度',
        low: '低優先度'
      }
      return labels[priority] || priority
    }
    
    const getRiskProfileIcon = (profile) => {
      const icons = {
        conservative: '🛡️',
        moderate: '⚖️',
        aggressive: '🚀'
      }
      return icons[profile] || '⚖️'
    }
    
    const getRiskProfileName = (profile) => {
      const names = {
        conservative: '安定重視型',
        moderate: 'バランス型',
        aggressive: '成長重視型'
      }
      return names[profile] || profile
    }
    
    const getRiskProfileDescription = (profile) => {
      const descriptions = {
        conservative: '安全性を最優先にする慎重な投資スタイル',
        moderate: 'リスクとリターンのバランスを重視する投資スタイル',
        aggressive: '高いリターンを目指す積極的な投資スタイル'
      }
      return descriptions[profile] || ''
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('📊 Risk Assessment Dashboard 初期化')
      generateParticles()
      
      // 既存のリスクプロファイルがあれば読み込み
      const savedProfile = localStorage.getItem('galaxy-risk-profile')
      if (savedProfile) {
        riskProfile.value = savedProfile
        riskTestCompleted.value = true
      }
    })
    
    return {
      // State
      particles,
      riskTestCompleted,
      currentQuestionIndex,
      riskProfile,
      currentScenario,
      riskQuestions,
      
      // Computed
      portfolio,
      riskScore,
      currentQuestion,
      optimizationSuggestions,
      
      // Methods
      selectRiskAnswer,
      retakeRiskTest,
      runSimulation,
      goToEducation,
      viewAnalytics,
      handleBack,
      
      // Helpers
      getPlanetIcon,
      getPlanetName,
      getReturnColor,
      getReturnPercentage,
      getRiskBarColor,
      getRiskLabelColor,
      getRiskLabel,
      getPriorityClass,
      getPriorityLabel,
      getRiskProfileIcon,
      getRiskProfileName,
      getRiskProfileDescription
    }
  }
}
</script>

<style scoped>
.risk-assessment-dashboard {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* パーティクルアニメーション */
.animate-pulse {
  animation: particlePulse 3s ease-in-out infinite;
}

@keyframes particlePulse {
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

/* ホバーエフェクト */
.hover\\:shadow-lg:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.hover\\:shadow-md:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .lg\\:col-span-2 {
    grid-column: span 1;
  }
  
  .grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
    gap: 0.5rem;
  }
}
</style>