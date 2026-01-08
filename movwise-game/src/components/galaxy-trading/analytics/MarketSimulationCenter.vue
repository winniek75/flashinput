<template>
  <div class="market-simulation-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
    <!-- 動的背景エフェクト -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- 市場データストリーム効果 -->
      <div
        v-for="stream in dataStreams"
        :key="stream.id"
        class="absolute text-green-400 text-xs font-mono opacity-30 animate-pulse"
        :style="{
          left: `${stream.x}%`,
          top: `${stream.y}%`,
          animationDelay: `${stream.delay}s`
        }"
      >
        {{ stream.text }}
      </div>
      
      <!-- 市場グリッド背景 -->
      <div class="absolute inset-0 opacity-10">
        <div
          v-for="i in 20"
          :key="i"
          class="absolute border-t border-blue-400"
          :style="{ top: `${i * 5}%`, width: '100%' }"
        ></div>
        <div
          v-for="i in 20"
          :key="`v-${i}`"
          class="absolute border-l border-blue-400"
          :style="{ left: `${i * 5}%`, height: '100%' }"
        ></div>
      </div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-blue-700 mb-2 flex items-center gap-3">
              📈 Galaxy Market Simulation Center
            </h1>
            <p class="text-blue-600">リアルタイム市場シミュレーションと投資戦略学習</p>
          </div>
          
          <div class="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-green-800">{{ simulationScore }}/100</div>
              <div class="text-sm text-green-600">シミュレーション成績</div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインダッシュボード -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左側: マーケットデータ & シミュレーション -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 惑星株価チャート -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📊 惑星株価リアルタイムチャート
              </h2>
              
              <div class="flex gap-2">
                <button
                  @click="toggleAutoUpdate"
                  class="text-sm px-3 py-1 rounded-lg transition-all duration-200"
                  :class="autoUpdate ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'"
                >
                  {{ autoUpdate ? '🔄 自動更新中' : '⏸️ 更新停止' }}
                </button>
                <button
                  @click="resetMarketData"
                  class="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-all duration-200"
                >
                  🔄 リセット
                </button>
              </div>
            </div>
            
            <!-- 惑星株価表示 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                v-for="planet in planetMarketData"
                :key="planet.id"
                class="bg-gradient-to-br rounded-2xl p-4 text-white"
                :style="{ background: planet.gradient }"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="text-2xl">{{ planet.emoji }}</div>
                  <div>
                    <h3 class="font-bold">{{ planet.name }}</h3>
                    <p class="text-sm opacity-90">{{ planet.code }}</p>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm opacity-90">現在価格</span>
                    <span class="text-lg font-bold">{{ planet.currentPrice }} EP</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm opacity-90">変動率</span>
                    <span 
                      class="text-sm font-bold flex items-center gap-1"
                      :class="planet.change >= 0 ? 'text-green-200' : 'text-red-200'"
                    >
                      {{ planet.change >= 0 ? '↗️' : '↘️' }}
                      {{ planet.change >= 0 ? '+' : '' }}{{ planet.change.toFixed(2) }}%
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm opacity-90">出来高</span>
                    <span class="text-sm">{{ planet.volume.toLocaleString() }}</span>
                  </div>
                </div>
                
                <!-- 簡易チャート -->
                <div class="mt-3 h-16 bg-black/20 rounded-lg p-2">
                  <div class="flex items-end gap-1 h-full">
                    <div
                      v-for="(point, index) in planet.chartData.slice(-12)"
                      :key="index"
                      class="flex-1 bg-white/60 rounded-t"
                      :style="{ 
                        height: `${Math.max((point / Math.max(...planet.chartData)) * 100, 5)}%`,
                        opacity: index === planet.chartData.length - 1 ? 1 : 0.7
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- シミュレーション実行パネル -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎮 市場シミュレーション実行
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- シナリオ選択 -->
              <div class="space-y-4">
                <h3 class="text-lg font-bold text-gray-800 mb-3">📝 シナリオ選択</h3>
                <div class="space-y-2">
                  <div
                    v-for="scenario in availableScenarios"
                    :key="scenario.id"
                    class="p-3 border-2 rounded-xl cursor-pointer transition-all duration-200"
                    :class="selectedScenario?.id === scenario.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
                    @click="selectScenario(scenario)"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{{ scenario.icon }}</span>
                      <div class="flex-1">
                        <h4 class="font-bold text-gray-800">{{ scenario.name }}</h4>
                        <p class="text-sm text-gray-600">{{ scenario.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- シミュレーション設定 -->
              <div class="space-y-4">
                <h3 class="text-lg font-bold text-gray-800 mb-3">⚙️ シミュレーション設定</h3>
                
                <div class="space-y-3">
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">シミュレーション期間</label>
                    <select v-model="simulationDuration" class="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="1">1週間</option>
                      <option value="4">1ヶ月</option>
                      <option value="12">3ヶ月</option>
                      <option value="52">1年</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">初期投資額</label>
                    <select v-model="initialInvestment" class="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="1000">1,000 EP</option>
                      <option value="5000">5,000 EP</option>
                      <option value="10000">10,000 EP</option>
                      <option value="50000">50,000 EP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">投資戦略</label>
                    <select v-model="investmentStrategy" class="w-full p-2 border border-gray-300 rounded-lg">
                      <option value="conservative">保守的（低リスク）</option>
                      <option value="balanced">バランス型</option>
                      <option value="aggressive">積極的（高リスク）</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- シミュレーション実行ボタン -->
            <div class="mt-6 text-center">
              <button
                @click="runSimulation"
                :disabled="!selectedScenario || isSimulationRunning"
                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSimulationRunning ? '🔄 シミュレーション実行中...' : '🚀 シミュレーション開始' }}
              </button>
            </div>
          </div>

          <!-- シミュレーション結果 -->
          <div v-if="simulationResult" class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 シミュレーション結果
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <!-- 最終収益 -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div class="text-center">
                  <div class="text-3xl mb-2">💰</div>
                  <div class="text-2xl font-bold text-green-700">{{ simulationResult.finalValue.toLocaleString() }} EP</div>
                  <div class="text-sm text-green-600">最終資産価値</div>
                  <div class="mt-2 text-lg font-bold" :class="simulationResult.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ simulationResult.totalReturn >= 0 ? '+' : '' }}{{ simulationResult.totalReturn.toFixed(2) }}%
                  </div>
                </div>
              </div>
              
              <!-- リスク指標 -->
              <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                <div class="text-center">
                  <div class="text-3xl mb-2">⚠️</div>
                  <div class="text-2xl font-bold text-yellow-700">{{ simulationResult.maxDrawdown.toFixed(1) }}%</div>
                  <div class="text-sm text-yellow-600">最大ドローダウン</div>
                  <div class="mt-2 text-sm text-gray-600">
                    リスクレベル: {{ getRiskLevel(simulationResult.maxDrawdown) }}
                  </div>
                </div>
              </div>
              
              <!-- シャープレシオ -->
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div class="text-center">
                  <div class="text-3xl mb-2">📏</div>
                  <div class="text-2xl font-bold text-blue-700">{{ simulationResult.sharpeRatio.toFixed(2) }}</div>
                  <div class="text-sm text-blue-600">シャープレシオ</div>
                  <div class="mt-2 text-sm text-gray-600">
                    効率性: {{ getEfficiencyRating(simulationResult.sharpeRatio) }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 学習ポイント -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-l-4 border-purple-500">
              <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                🎓 学習ポイント
              </h3>
              <ul class="space-y-2">
                <li v-for="point in simulationResult.learningPoints" :key="point" class="text-sm text-gray-700 flex items-start gap-2">
                  <span class="text-purple-500">•</span>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右側: サイドパネル -->
        <div class="space-y-6">
          <!-- 学習進捗 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📈 シミュレーション学習進捗
            </h2>
            
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="font-bold text-gray-800 mb-3">完了したシミュレーション</h3>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">基本シナリオ</span>
                    <span class="text-sm font-bold text-green-600">{{ completedSimulations.basic }}/5</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-500"
                      :style="{ width: `${(completedSimulations.basic / 5) * 100}%` }"
                    ></div>
                  </div>
                </div>
                
                <div class="space-y-2 mt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">上級シナリオ</span>
                    <span class="text-sm font-bold text-blue-600">{{ completedSimulations.advanced }}/3</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
                      :style="{ width: `${(completedSimulations.advanced / 3) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 市場ニュース -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📰 Galaxy Market News
            </h2>
            
            <div class="space-y-3">
              <div
                v-for="news in marketNews"
                :key="news.id"
                class="bg-gray-50 rounded-xl p-3 border-l-4"
                :class="news.impact === 'positive' ? 'border-green-400' : news.impact === 'negative' ? 'border-red-400' : 'border-blue-400'"
              >
                <div class="flex items-start gap-2">
                  <span class="text-lg">{{ news.icon }}</span>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-800 text-sm">{{ news.title }}</h3>
                    <p class="text-xs text-gray-600 mt-1">{{ news.description }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-xs text-gray-500">{{ news.time }}</span>
                      <span class="text-xs px-2 py-1 rounded-full" :class="getImpactClass(news.impact)">
                        {{ getImpactLabel(news.impact) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- クイックアクション -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚡ クイックアクション
            </h2>
            
            <div class="space-y-3">
              <button
                @click="goToTradingHub"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                🚀 実際の投資を開始
              </button>
              
              <button
                @click="goToEducation"
                class="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📚 投資教育を学習
              </button>
              
              <button
                @click="exportSimulationData"
                class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📊 結果をエクスポート
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

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export default {
  name: 'MarketSimulationCenter',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const dataStreams = ref([])
    const autoUpdate = ref(true)
    const selectedScenario = ref(null)
    const simulationDuration = ref('4')
    const initialInvestment = ref('10000')
    const investmentStrategy = ref('balanced')
    const isSimulationRunning = ref(false)
    const simulationResult = ref(null)
    const updateInterval = ref(null)
    
    // 惑星マーケットデータ
    const planetMarketData = ref([
      {
        id: 'apple-planet',
        name: 'Apple Garden Corp',
        code: 'APL',
        emoji: '🍎',
        currentPrice: 125.50,
        change: 2.34,
        volume: 1250000,
        chartData: [120, 122, 125, 123, 128, 125, 127, 124, 126, 125, 124, 125],
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'
      },
      {
        id: 'robot-planet',
        name: 'Robot Tech Industries',
        code: 'RTI',
        emoji: '🤖',
        currentPrice: 89.75,
        change: -1.45,
        volume: 890000,
        chartData: [92, 91, 89, 90, 88, 87, 89, 90, 88, 87, 89, 90],
        gradient: 'linear-gradient(135deg, #4ecdc4 0%, #6ee2d9 100%)'
      },
      {
        id: 'grammar-moon',
        name: 'Grammar Moon Academy',
        code: 'GMA',
        emoji: '🌙',
        currentPrice: 67.20,
        change: 3.89,
        volume: 567000,
        chartData: [65, 64, 66, 67, 68, 69, 67, 68, 66, 67, 68, 67],
        gradient: 'linear-gradient(135deg, #a8a8ff 0%, #c8c8ff 100%)'
      }
    ])
    
    // シミュレーションシナリオ
    const availableScenarios = ref([
      {
        id: 'bull-market',
        name: '強気市場',
        icon: '📈',
        description: '全体的に市場が上昇傾向にある時期',
        difficulty: 'easy'
      },
      {
        id: 'bear-market',
        name: '弱気市場',
        icon: '📉',
        description: '市場全体が下落傾向にある困難な時期',
        difficulty: 'hard'
      },
      {
        id: 'volatile-market',
        name: '不安定市場',
        icon: '⚡',
        description: '価格変動が激しく予測困難な市場環境',
        difficulty: 'medium'
      },
      {
        id: 'crisis-event',
        name: '危機イベント',
        icon: '🌪️',
        description: '予期しない大きな市場ショックが発生',
        difficulty: 'expert'
      },
      {
        id: 'steady-growth',
        name: '安定成長',
        icon: '📊',
        description: '緩やかで安定した成長を続ける市場',
        difficulty: 'easy'
      }
    ])
    
    // 市場ニュース
    const marketNews = ref([
      {
        id: 1,
        title: 'Apple Garden 新技術発表',
        description: '音韻認識技術の大幅な改善により学習効率が向上',
        time: '2時間前',
        impact: 'positive',
        icon: '🍎'
      },
      {
        id: 2,
        title: 'Robot Tech 四半期決算発表',
        description: 'AI学習システムの売上が予想を下回る',
        time: '5時間前',
        impact: 'negative',
        icon: '🤖'
      },
      {
        id: 3,
        title: 'Grammar Moon 新コース開設',
        description: '上級文法コースの需要増加で収益性向上',
        time: '1日前',
        impact: 'positive',
        icon: '🌙'
      }
    ])
    
    // シミュレーション完了数
    const completedSimulations = ref({
      basic: 0,
      advanced: 0
    })
    
    // === 計算プロパティ ===
    const simulationScore = computed(() => {
      const basic = completedSimulations.value.basic
      const advanced = completedSimulations.value.advanced
      return Math.min(Math.round((basic * 10) + (advanced * 20)), 100)
    })
    
    // === メソッド ===
    
    /**
     * データストリームの生成
     */
    const generateDataStreams = () => {
      const symbols = ['APL', 'RTI', 'GMA', '↗', '↘', '●', '○', '▲', '▼']
      dataStreams.value = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        text: symbols[Math.floor(Math.random() * symbols.length)],
        delay: Math.random() * 5
      }))
    }
    
    /**
     * 市場データの更新
     */
    const updateMarketData = () => {
      planetMarketData.value.forEach(planet => {
        // 価格変動シミュレーション
        const volatility = 0.02 // 2%の変動幅
        const randomChange = (Math.random() - 0.5) * volatility
        const newPrice = planet.currentPrice * (1 + randomChange)
        
        // 変動率計算
        const changePercent = ((newPrice - planet.currentPrice) / planet.currentPrice) * 100
        
        // データ更新
        planet.currentPrice = Math.max(newPrice, 10) // 最低価格10EP
        planet.change = changePercent
        planet.volume = Math.floor(Math.random() * 500000) + 500000
        
        // チャートデータ更新
        planet.chartData.push(planet.currentPrice)
        if (planet.chartData.length > 20) {
          planet.chartData.shift()
        }
      })
    }
    
    /**
     * 自動更新の切り替え
     */
    const toggleAutoUpdate = () => {
      autoUpdate.value = !autoUpdate.value
      
      if (autoUpdate.value) {
        startAutoUpdate()
      } else {
        stopAutoUpdate()
      }
    }
    
    /**
     * 自動更新開始
     */
    const startAutoUpdate = () => {
      updateInterval.value = setInterval(() => {
        if (autoUpdate.value) {
          updateMarketData()
        }
      }, 3000) // 3秒間隔
    }
    
    /**
     * 自動更新停止
     */
    const stopAutoUpdate = () => {
      if (updateInterval.value) {
        clearInterval(updateInterval.value)
        updateInterval.value = null
      }
    }
    
    /**
     * 市場データリセット
     */
    const resetMarketData = () => {
      planetMarketData.value.forEach(planet => {
        planet.currentPrice = 100 // 基準価格
        planet.change = 0
        planet.volume = 1000000
        planet.chartData = Array.from({ length: 12 }, () => 100)
      })
    }
    
    /**
     * シナリオ選択
     */
    const selectScenario = (scenario) => {
      selectedScenario.value = scenario
    }
    
    /**
     * シミュレーション実行
     */
    const runSimulation = async () => {
      if (!selectedScenario.value || isSimulationRunning.value) return
      
      isSimulationRunning.value = true
      simulationResult.value = null
      
      // シミュレーション実行アニメーション
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // シミュレーション結果の生成
      const result = generateSimulationResult()
      simulationResult.value = result
      
      // 完了数更新
      if (selectedScenario.value.difficulty === 'easy' || selectedScenario.value.difficulty === 'medium') {
        completedSimulations.value.basic = Math.min(completedSimulations.value.basic + 1, 5)
      } else {
        completedSimulations.value.advanced = Math.min(completedSimulations.value.advanced + 1, 3)
      }
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'market-simulation',
        selectedScenario.value.id,
        Math.round(result.totalReturn * 2 + 50) // スコア化
      )
      
      isSimulationRunning.value = false
    }
    
    /**
     * シミュレーション結果生成
     */
    const generateSimulationResult = () => {
      const scenario = selectedScenario.value
      const strategy = investmentStrategy.value
      const duration = parseInt(simulationDuration.value)
      const initial = parseInt(initialInvestment.value)
      
      // シナリオとストラテジーに基づく結果生成
      let baseReturn = 0
      let maxDrawdown = 0
      let sharpeRatio = 0
      
      switch (scenario.id) {
        case 'bull-market':
          baseReturn = strategy === 'aggressive' ? 25 : strategy === 'balanced' ? 18 : 12
          maxDrawdown = strategy === 'aggressive' ? 15 : strategy === 'balanced' ? 8 : 5
          sharpeRatio = strategy === 'aggressive' ? 1.2 : strategy === 'balanced' ? 1.5 : 1.8
          break
        case 'bear-market':
          baseReturn = strategy === 'aggressive' ? -20 : strategy === 'balanced' ? -8 : -3
          maxDrawdown = strategy === 'aggressive' ? 35 : strategy === 'balanced' ? 20 : 12
          sharpeRatio = strategy === 'aggressive' ? -0.5 : strategy === 'balanced' ? 0.2 : 0.8
          break
        case 'volatile-market':
          baseReturn = strategy === 'aggressive' ? 15 : strategy === 'balanced' ? 8 : 5
          maxDrawdown = strategy === 'aggressive' ? 25 : strategy === 'balanced' ? 15 : 8
          sharpeRatio = strategy === 'aggressive' ? 0.8 : strategy === 'balanced' ? 1.1 : 1.3
          break
        case 'crisis-event':
          baseReturn = strategy === 'aggressive' ? -30 : strategy === 'balanced' ? -15 : -5
          maxDrawdown = strategy === 'aggressive' ? 45 : strategy === 'balanced' ? 25 : 15
          sharpeRatio = strategy === 'aggressive' ? -1.0 : strategy === 'balanced' ? -0.2 : 0.5
          break
        case 'steady-growth':
          baseReturn = strategy === 'aggressive' ? 12 : strategy === 'balanced' ? 10 : 8
          maxDrawdown = strategy === 'aggressive' ? 8 : strategy === 'balanced' ? 5 : 3
          sharpeRatio = strategy === 'aggressive' ? 1.0 : strategy === 'balanced' ? 1.3 : 1.6
          break
      }
      
      // 期間による調整
      const timeMultiplier = duration / 12 // 1年を基準
      const finalReturn = baseReturn * timeMultiplier + (Math.random() - 0.5) * 10
      const finalValue = Math.round(initial * (1 + finalReturn / 100))
      
      // 学習ポイント生成
      const learningPoints = generateLearningPoints(scenario, strategy, finalReturn)
      
      return {
        finalValue,
        totalReturn: finalReturn,
        maxDrawdown: Math.abs(maxDrawdown),
        sharpeRatio,
        learningPoints
      }
    }
    
    /**
     * 学習ポイント生成
     */
    const generateLearningPoints = (scenario, strategy, return_) => {
      const points = []
      
      if (return_ > 15) {
        points.push('優秀な投資成果です！市場タイミングと戦略選択が適切でした。')
        points.push('この成功体験を次の投資判断に活かしましょう。')
      } else if (return_ > 0) {
        points.push('プラスのリターンを達成しました。安定した投資判断ができています。')
        points.push('さらなる成長のため、戦略の微調整を検討してみましょう。')
      } else {
        points.push('市場環境は厳しかったですが、これも貴重な学習経験です。')
        points.push('損失を最小限に抑える方法を学び、次回に活かしましょう。')
      }
      
      if (scenario.id === 'crisis-event') {
        points.push('危機的状況での投資判断は特に困難です。リスク管理の重要性を学びました。')
      }
      
      if (strategy === 'aggressive') {
        points.push('積極的な戦略はハイリスク・ハイリターンです。市場環境を見極める力が重要です。')
      } else if (strategy === 'conservative') {
        points.push('保守的な戦略は安定性を重視します。長期的な視点での投資が効果的です。')
      }
      
      return points
    }
    
    /**
     * ヘルパーメソッド
     */
    const getRiskLevel = (drawdown) => {
      if (drawdown < 10) return '低'
      if (drawdown < 20) return '中'
      return '高'
    }
    
    const getEfficiencyRating = (sharpe) => {
      if (sharpe > 1.5) return '優秀'
      if (sharpe > 1.0) return '良好'
      if (sharpe > 0.5) return '普通'
      return '要改善'
    }
    
    const getImpactClass = (impact) => {
      const classes = {
        positive: 'bg-green-100 text-green-800',
        negative: 'bg-red-100 text-red-800',
        neutral: 'bg-blue-100 text-blue-800'
      }
      return classes[impact] || 'bg-gray-100 text-gray-800'
    }
    
    const getImpactLabel = (impact) => {
      const labels = {
        positive: '好材料',
        negative: '悪材料',
        neutral: '中立'
      }
      return labels[impact] || '不明'
    }
    
    /**
     * 結果エクスポート
     */
    const exportSimulationData = () => {
      if (!simulationResult.value) {
        alert('シミュレーション結果がありません。')
        return
      }
      
      const data = {
        scenario: selectedScenario.value,
        settings: {
          duration: simulationDuration.value,
          initialInvestment: initialInvestment.value,
          strategy: investmentStrategy.value
        },
        result: simulationResult.value,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `galaxy-simulation-${selectedScenario.value.id}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      alert('📊 シミュレーション結果をエクスポートしました！')
    }
    
    /**
     * ナビゲーションメソッド
     */
    const goToTradingHub = () => {
      router.push('/galaxy-trading')
    }
    
    const goToEducation = () => {
      router.push('/investment-education')
    }
    
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('📈 Market Simulation Center 初期化')
      generateDataStreams()
      
      // 保存されたデータの読み込み
      const saved = localStorage.getItem('galaxy-simulation-progress')
      if (saved) {
        try {
          const progress = JSON.parse(saved)
          completedSimulations.value = progress
        } catch (error) {
          logger.error('シミュレーション進捗読み込みエラー:', error)
        }
      }
      
      // 自動更新開始
      if (autoUpdate.value) {
        startAutoUpdate()
      }
    })
    
    onUnmounted(() => {
      stopAutoUpdate()
      
      // 進捗保存
      localStorage.setItem('galaxy-simulation-progress', JSON.stringify(completedSimulations.value))
    })
    
    return {
      // State
      dataStreams,
      autoUpdate,
      selectedScenario,
      simulationDuration,
      initialInvestment,
      investmentStrategy,
      isSimulationRunning,
      simulationResult,
      planetMarketData,
      availableScenarios,
      marketNews,
      completedSimulations,
      
      // Computed
      simulationScore,
      
      // Methods
      toggleAutoUpdate,
      resetMarketData,
      selectScenario,
      runSimulation,
      exportSimulationData,
      getRiskLevel,
      getEfficiencyRating,
      getImpactClass,
      getImpactLabel,
      goToTradingHub,
      goToEducation,
      handleBack
    }
  }
}
</script>

<style scoped>
.market-simulation-center {
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

/* データストリームアニメーション */
.text-green-400.text-xs {
  animation: dataFlow 8s linear infinite;
}

@keyframes dataFlow {
  0% { opacity: 0; transform: translateY(100vh); }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* 市場チャートのアニメーション */
.bg-white\/60 {
  animation: chartBarDance 2s ease-in-out infinite;
}

@keyframes chartBarDance {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
}

/* シミュレーション実行中のアニメーション */
.disabled\:opacity-50 {
  animation: pulse 1.5s ease-in-out infinite;
}

/* ホバーエフェクト */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* カードの選択状態 */
.border-blue-500 {
  animation: selectedGlow 2s ease-in-out infinite;
}

@keyframes selectedGlow {
  0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
}

/* 結果表示のアニメーション */
.grid-cols-1.md\:grid-cols-3 > div {
  animation: resultCardSlide 0.6s ease-out;
}

@keyframes resultCardSlide {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .lg\:col-span-2 {
    grid-column: span 1;
  }
  
  .lg\:grid-cols-3 {
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
}

/* 背景グリッドのアニメーション */
.border-blue-400 {
  animation: gridPulse 4s ease-in-out infinite;
}

@keyframes gridPulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}
</style>