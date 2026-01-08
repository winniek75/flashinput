<template>
  <div class="learning-analytics-dashboard min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <!-- 宇宙背景エフェクト -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="orb in cosmicOrbs"
        :key="orb.id"
        class="absolute rounded-full animate-pulse"
        :style="{
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          width: `${orb.size}px`,
          height: `${orb.size}px`,
          background: orb.color,
          opacity: orb.opacity,
          animationDelay: `${orb.delay}s`,
          animationDuration: `${orb.duration}s`
        }"
      ></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-indigo-700 mb-2 flex items-center gap-3">
              📊 Galaxy Learning Analytics Center
            </h1>
            <p class="text-indigo-600">詳細な学習データ分析とパフォーマンス最適化</p>
          </div>
          
          <div class="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-indigo-800">{{ overallScore }}/100</div>
              <div class="text-sm text-indigo-600">総合スコア</div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインダッシュボード -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- 左側: 学習進捗分析 -->
        <div class="xl:col-span-3 space-y-6">
          <!-- 学習パフォーマンス概要 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎯 学習パフォーマンス分析
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <!-- 音韻学習 -->
              <div class="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="text-3xl">🍎</div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">音韻学習 (Apple)</h3>
                    <p class="text-sm text-gray-600">CVC Word & 基礎音韻</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">進捗率</span>
                    <span class="text-lg font-bold text-red-600">{{ phonicsProgress }}%</span>
                  </div>
                  <div class="w-full bg-red-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-red-500 to-pink-500 rounded-full h-3 transition-all duration-500"
                      :style="{ width: `${phonicsProgress}%` }"
                    ></div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3 mt-4">
                    <div class="text-center">
                      <div class="text-xl font-bold text-red-600">{{ phonicsStats.accuracy }}%</div>
                      <div class="text-xs text-gray-500">正解率</div>
                    </div>
                    <div class="text-center">
                      <div class="text-xl font-bold text-pink-600">{{ phonicsStats.velocity }}</div>
                      <div class="text-xs text-gray-500">学習速度</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ブレンディング学習 -->
              <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="text-3xl">🤖</div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">技術学習 (Robot)</h3>
                    <p class="text-sm text-gray-600">Blending & 応用音韻</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">進捗率</span>
                    <span class="text-lg font-bold text-blue-600">{{ blendingProgress }}%</span>
                  </div>
                  <div class="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full h-3 transition-all duration-500"
                      :style="{ width: `${blendingProgress}%` }"
                    ></div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3 mt-4">
                    <div class="text-center">
                      <div class="text-xl font-bold text-blue-600">{{ blendingStats.accuracy }}%</div>
                      <div class="text-xs text-gray-500">正解率</div>
                    </div>
                    <div class="text-center">
                      <div class="text-xl font-bold text-cyan-600">{{ blendingStats.velocity }}</div>
                      <div class="text-xs text-gray-500">学習速度</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 文法学習 -->
              <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="text-3xl">🌙</div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">文法学習 (Moon)</h3>
                    <p class="text-sm text-gray-600">Grammar & 構文理解</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">進捗率</span>
                    <span class="text-lg font-bold text-purple-600">{{ grammarProgress }}%</span>
                  </div>
                  <div class="w-full bg-purple-200 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full h-3 transition-all duration-500"
                      :style="{ width: `${grammarProgress}%` }"
                    ></div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3 mt-4">
                    <div class="text-center">
                      <div class="text-xl font-bold text-purple-600">{{ grammarStats.accuracy }}%</div>
                      <div class="text-xs text-gray-500">正解率</div>
                    </div>
                    <div class="text-center">
                      <div class="text-xl font-bold text-indigo-600">{{ grammarStats.velocity }}</div>
                      <div class="text-xs text-gray-500">学習速度</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学習パターン分析 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📈 学習パターン & トレンド分析
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 学習時間分析 -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ⏰ 学習時間パターン
                </h3>
                
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">今日の学習時間</span>
                    <span class="font-bold text-green-600">{{ learningTimeStats.today }}分</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">今週の平均</span>
                    <span class="font-bold text-blue-600">{{ learningTimeStats.weekAverage }}分/日</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">最も集中できる時間帯</span>
                    <span class="font-bold text-purple-600">{{ learningTimeStats.peakHour }}</span>
                  </div>
                  
                  <!-- 簡易チャート表示 -->
                  <div class="mt-4">
                    <div class="text-sm text-gray-600 mb-2">過去7日間の学習時間</div>
                    <div class="flex items-end gap-1 h-20">
                      <div
                        v-for="(day, index) in weeklyLearningChart"
                        :key="index"
                        class="flex-1 bg-gradient-to-t from-indigo-400 to-purple-400 rounded-t"
                        :style="{ height: `${(day.minutes / Math.max(...weeklyLearningChart.map(d => d.minutes))) * 100}%` }"
                        :title="`${day.day}: ${day.minutes}分`"
                      ></div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                      <span v-for="(day, index) in weeklyLearningChart" :key="index">{{ day.day }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 強化ポイント分析 -->
              <div class="bg-gray-50 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🎯 強化推奨エリア
                </h3>
                
                <div class="space-y-4">
                  <div
                    v-for="area in improvementAreas"
                    :key="area.id"
                    class="bg-white rounded-xl p-4 border-l-4"
                    :class="area.borderColor"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{{ area.icon }}</span>
                        <span class="font-bold text-gray-800">{{ area.title }}</span>
                      </div>
                      <span class="text-sm px-2 py-1 rounded-full" :class="area.priorityClass">
                        {{ area.priority }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ area.description }}</p>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500">期待改善:</span>
                      <span class="text-xs font-bold text-green-600">{{ area.expectedImprovement }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI推奨学習パス -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🤖 AI推奨学習パス
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="path in recommendedLearningPaths"
                :key="path.id"
                class="bg-gradient-to-br rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all duration-200"
                :style="{ background: path.gradient }"
                @click="startLearningPath(path)"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div class="text-3xl">{{ path.icon }}</div>
                  <div>
                    <h3 class="text-lg font-bold">{{ path.title }}</h3>
                    <p class="text-sm opacity-90">{{ path.subtitle }}</p>
                  </div>
                </div>
                
                <p class="text-sm mb-4 opacity-80">{{ path.description }}</p>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold">推定学習時間: {{ path.estimatedTime }}分</span>
                  <span class="text-sm bg-white/20 px-3 py-1 rounded-full">{{ path.difficulty }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: サイドパネル -->
        <div class="space-y-6">
          <!-- 学習目標設定 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎯 学習目標
            </h2>
            
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-gray-800 mb-2">今週の目標</h3>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">学習時間</span>
                    <span class="text-sm font-bold">{{ weeklyGoals.timeProgress }}/{{ weeklyGoals.timeTarget }}分</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-500"
                      :style="{ width: `${Math.min((weeklyGoals.timeProgress / weeklyGoals.timeTarget) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="space-y-2 mt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">投資準備度</span>
                    <span class="text-sm font-bold">{{ weeklyGoals.investmentProgress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
                      :style="{ width: `${weeklyGoals.investmentProgress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              @click="setNewGoals"
              class="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              📊 新しい目標を設定
            </button>
          </div>

          <!-- 学習リソース -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📚 学習リソース
            </h2>
            
            <div class="space-y-3">
              <button
                @click="goToRiskAssessment"
                class="w-full text-left p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">📊</span>
                  <div>
                    <h3 class="font-medium text-gray-800">リスク評価</h3>
                    <p class="text-sm text-gray-600">投資リスク分析</p>
                  </div>
                </div>
              </button>
              
              <button
                @click="goToEducation"
                class="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🎓</span>
                  <div>
                    <h3 class="font-medium text-gray-800">投資教育</h3>
                    <p class="text-sm text-gray-600">カリキュラム学習</p>
                  </div>
                </div>
              </button>
              
              <button
                @click="goToTradingHub"
                class="w-full text-left p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🚀</span>
                  <div>
                    <h3 class="font-medium text-gray-800">実践投資</h3>
                    <p class="text-sm text-gray-600">Galaxy Trading</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- クイックアクション -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚡ クイックアクション
            </h2>
            
            <div class="space-y-3">
              <button
                @click="exportLearningData"
                class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📤 学習データ出力
              </button>
              
              <button
                @click="resetAnalytics"
                class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🔄 分析データリセット
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
  name: 'LearningAnalyticsDashboard',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    const analytics = createLearningAnalytics(gameStore, galaxyStore)
    
    // === 状態管理 ===
    const cosmicOrbs = ref([])
    const analysisResult = ref(null)
    
    // === 計算プロパティ ===
    const learningProgress = computed(() => galaxyStore.learningProgress)
    
    const phonicsProgress = computed(() => {
      return Math.round(learningProgress.value.cvcWord?.progress || 0)
    })
    
    const blendingProgress = computed(() => {
      return Math.round(learningProgress.value.blendingBuilder?.progress || 0)
    })
    
    const grammarProgress = computed(() => {
      return Math.round(learningProgress.value.grammar?.progress || 0)
    })
    
    const overallScore = computed(() => {
      if (!analysisResult.value) return 0
      return Math.round(analysisResult.value.overallScore || 0)
    })
    
    const phonicsStats = computed(() => ({
      accuracy: Math.round(learningProgress.value.cvcWord?.accuracy || 75),
      velocity: ['遅め', '普通', '速め'][Math.floor(Math.random() * 3)]
    }))
    
    const blendingStats = computed(() => ({
      accuracy: Math.round(learningProgress.value.blendingBuilder?.accuracy || 82),
      velocity: ['遅め', '普通', '速め'][Math.floor(Math.random() * 3)]
    }))
    
    const grammarStats = computed(() => ({
      accuracy: Math.round(learningProgress.value.grammar?.accuracy || 68),
      velocity: ['遅め', '普通', '速め'][Math.floor(Math.random() * 3)]
    }))
    
    const learningTimeStats = computed(() => ({
      today: Math.floor(Math.random() * 60) + 20,
      weekAverage: Math.floor(Math.random() * 40) + 25,
      peakHour: ['朝 9-11時', '昼 13-15時', '夕 16-18時'][Math.floor(Math.random() * 3)]
    }))
    
    const weeklyLearningChart = computed(() => {
      const days = ['月', '火', '水', '木', '金', '土', '日']
      return days.map(day => ({
        day,
        minutes: Math.floor(Math.random() * 60) + 10
      }))
    })
    
    const improvementAreas = computed(() => {
      const areas = []
      
      if (phonicsProgress.value < 70) {
        areas.push({
          id: 'phonics',
          icon: '🍎',
          title: '音韻認識強化',
          description: 'CVC Wordゲームでの基礎音韻スキル向上が推奨されます',
          priority: '高優先度',
          priorityClass: 'bg-red-100 text-red-800',
          borderColor: 'border-red-400',
          expectedImprovement: '+15%の正解率向上'
        })
      }
      
      if (blendingProgress.value < 70) {
        areas.push({
          id: 'blending',
          icon: '🤖',
          title: 'ブレンディング技術',
          description: 'Robot Planetでの応用音韻技術の練習が効果的です',
          priority: '中優先度',
          priorityClass: 'bg-yellow-100 text-yellow-800',
          borderColor: 'border-yellow-400',
          expectedImprovement: '+20%の理解度向上'
        })
      }
      
      if (grammarProgress.value < 70) {
        areas.push({
          id: 'grammar',
          icon: '🌙',
          title: '文法構造理解',
          description: 'Grammar Moonでの構文パターン学習を集中的に行いましょう',
          priority: '中優先度',
          priorityClass: 'bg-yellow-100 text-yellow-800',
          borderColor: 'border-purple-400',
          expectedImprovement: '+25%の構文理解'
        })
      }
      
      return areas
    })
    
    const recommendedLearningPaths = computed(() => {
      const paths = [
        {
          id: 'balanced-growth',
          icon: '⚖️',
          title: 'バランス成長パス',
          subtitle: '全分野均等発展',
          description: '音韻・技術・文法を均等に伸ばす学習プラン',
          estimatedTime: 45,
          difficulty: '標準',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          id: 'phonics-intensive',
          icon: '🍎',
          title: '音韻集中パス',
          subtitle: 'CVC Word 特化',
          description: '基礎音韻認識を徹底的に強化するプラン',
          estimatedTime: 30,
          difficulty: '易しい',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
          id: 'advanced-integration',
          icon: '🚀',
          title: '応用統合パス',
          subtitle: '投資準備特化',
          description: '学習成果を投資判断力に変換する高度プラン',
          estimatedTime: 60,
          difficulty: '高度',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
          id: 'grammar-mastery',
          icon: '🌙',
          title: '文法マスターパス',
          subtitle: 'Grammar 完全習得',
          description: '文法理解を完璧にして言語運用力を高める',
          estimatedTime: 40,
          difficulty: '標準',
          gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        }
      ]
      
      return paths
    })
    
    const weeklyGoals = computed(() => ({
      timeTarget: 300,
      timeProgress: Math.floor(Math.random() * 300) + 50,
      investmentProgress: Math.round((phonicsProgress.value + blendingProgress.value + grammarProgress.value) / 3)
    }))
    
    // === メソッド ===
    
    /**
     * 宇宙背景エフェクトの生成
     */
    const generateCosmicOrbs = () => {
      const colors = [
        'radial-gradient(circle, rgba(79, 172, 254, 0.6) 0%, rgba(0, 242, 254, 0.2) 100%)',
        'radial-gradient(circle, rgba(240, 147, 251, 0.6) 0%, rgba(245, 87, 108, 0.2) 100%)',
        'radial-gradient(circle, rgba(168, 237, 234, 0.6) 0%, rgba(254, 214, 227, 0.2) 100%)',
        'radial-gradient(circle, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.2) 100%)'
      ]
      
      cosmicOrbs.value = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 100 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.1,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 4
      }))
    }
    
    /**
     * 学習パス開始
     */
    const startLearningPath = (path) => {
      alert(`🚀 "${path.title}"を開始します！\n\n${path.description}\n\n推定学習時間: ${path.estimatedTime}分`)
      
      // 学習パスに応じたルーティング
      switch (path.id) {
        case 'phonics-intensive':
          router.push('/apple-planet')
          break
        case 'advanced-integration':
          router.push('/galaxy-trading')
          break
        case 'grammar-mastery':
          router.push('/grammar-moon')
          break
        default:
          router.push('/platforms/phonics-adventure')
      }
    }
    
    /**
     * 新しい目標設定
     */
    const setNewGoals = () => {
      alert('🎯 目標設定機能は開発中です。\n\n現在の学習進捗に基づいて、\n自動的に最適な目標を設定しています。')
    }
    
    /**
     * 学習データ出力
     */
    const exportLearningData = () => {
      const data = {
        analysisResult: analysisResult.value,
        learningProgress: learningProgress.value,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `galaxy-learning-analytics-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      alert('📤 学習データを出力しました！')
    }
    
    /**
     * 分析データリセット
     */
    const resetAnalytics = () => {
      if (confirm('🔄 学習分析データをリセットしますか？\n\nこの操作は元に戻せません。')) {
        localStorage.removeItem('galaxy-learning-analytics')
        alert('✅ 学習分析データをリセットしました。')
        window.location.reload()
      }
    }
    
    /**
     * ナビゲーションメソッド
     */
    const goToRiskAssessment = () => {
      router.push('/risk-assessment')
    }
    
    const goToEducation = () => {
      router.push('/investment-education')
    }
    
    const goToTradingHub = () => {
      router.push('/galaxy-trading')
    }
    
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('📊 Learning Analytics Dashboard 初期化')
      generateCosmicOrbs()
      
      // 詳細分析の実行
      analysisResult.value = analytics.analyzeOverallProgress()
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'learning-analytics',
        'dashboard-view',
        50
      )
    })
    
    return {
      // State
      cosmicOrbs,
      analysisResult,
      
      // Computed
      learningProgress,
      phonicsProgress,
      blendingProgress,
      grammarProgress,
      overallScore,
      phonicsStats,
      blendingStats,
      grammarStats,
      learningTimeStats,
      weeklyLearningChart,
      improvementAreas,
      recommendedLearningPaths,
      weeklyGoals,
      
      // Methods
      startLearningPath,
      setNewGoals,
      exportLearningData,
      resetAnalytics,
      goToRiskAssessment,
      goToEducation,
      goToTradingHub,
      handleBack
    }
  }
}
</script>

<style scoped>
.learning-analytics-dashboard {
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

/* 宇宙オーブのアニメーション */
.absolute.rounded-full {
  animation: cosmicFloat 8s ease-in-out infinite;
}

@keyframes cosmicFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(10px) rotate(270deg); }
}

/* カードのホバーエフェクト */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 学習チャートのアニメーション */
.flex.items-end > div {
  animation: chartBarGrow 1s ease-out;
}

@keyframes chartBarGrow {
  from {
    height: 0 !important;
  }
  to {
    height: var(--final-height);
  }
}

/* 進捗バーのアニメーション */
.bg-gradient-to-r {
  animation: progressFill 1.5s ease-out;
}

@keyframes progressFill {
  from {
    width: 0%;
  }
}

/* 推奨学習パスのアニメーション */
.grid > div[style*="background"] {
  animation: pathCardSlide 0.6s ease-out;
}

@keyframes pathCardSlide {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: 1280px) {
  .xl\:col-span-3 {
    grid-column: span 1;
  }
  
  .xl\:grid-cols-4 {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .grid-cols-1.lg\:grid-cols-2 {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>