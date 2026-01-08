<template>
  <div class="vr-readiness-assessment min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
    <!-- 3D空間エフェクト -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- 回転する3Dリング -->
      <div
        v-for="ring in rotatingRings"
        :key="ring.id"
        class="absolute border-2 border-cyan-400 rounded-full opacity-20"
        :style="{
          left: `${ring.x}%`,
          top: `${ring.y}%`,
          width: `${ring.size}px`,
          height: `${ring.size}px`,
          animation: `spin ${ring.duration}s linear infinite`,
          animationDelay: `${ring.delay}s`,
          transform: `rotateX(${ring.rotateX}deg) rotateY(${ring.rotateY}deg)`
        }"
      ></div>
      
      <!-- フローティングVRアイコン -->
      <div
        v-for="icon in floatingIcons"
        :key="icon.id"
        class="absolute text-cyan-300 animate-pulse"
        :style="{
          left: `${icon.x}%`,
          top: `${icon.y}%`,
          fontSize: `${icon.size}px`,
          opacity: icon.opacity,
          animationDelay: `${icon.delay}s`,
          transform: `rotate(${icon.rotation}deg)`
        }"
      >
        {{ icon.symbol }}
      </div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-cyan-700 mb-2 flex items-center gap-3">
              🥽 VR Readiness Assessment Center
            </h1>
            <p class="text-cyan-600">VR Academy 準備度の総合評価と推奨システム</p>
          </div>
          
          <div class="bg-gradient-to-r from-green-100 to-cyan-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-green-800">{{ overallReadinessScore }}/100</div>
              <div class="text-sm text-green-600">総合準備度</div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインアセスメントエリア -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- 左側: 詳細評価セクション -->
        <div class="xl:col-span-2 space-y-6">
          <!-- 学習基盤評価 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📚 学習基盤評価
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <!-- 音韻認識能力 -->
              <div class="assessment-card">
                <div class="card-header bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                  <div class="card-icon">🍎</div>
                  <div class="card-info">
                    <h3 class="card-title">音韻認識能力</h3>
                    <p class="card-subtitle">CVC Word & 基礎音韻</p>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="score-display">
                    <div class="score-value text-red-600">{{ learningAssessment.phonics.score }}/100</div>
                    <div class="score-level" :class="getScoreColor(learningAssessment.phonics.score)">
                      {{ getScoreLevel(learningAssessment.phonics.score) }}
                    </div>
                  </div>
                  
                  <div class="progress-bar">
                    <div 
                      class="progress-fill bg-gradient-to-r from-red-500 to-pink-500"
                      :style="{ width: `${learningAssessment.phonics.score}%` }"
                    ></div>
                  </div>
                  
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.phonics.accuracy }}%</div>
                      <div class="metric-label">正解率</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.phonics.consistency }}</div>
                      <div class="metric-label">一貫性</div>
                    </div>
                  </div>
                  
                  <div class="readiness-indicators">
                    <div 
                      v-for="indicator in learningAssessment.phonics.vrReadiness"
                      :key="indicator.id"
                      class="indicator"
                      :class="getIndicatorClass(indicator.status)"
                    >
                      <span class="indicator-icon">{{ getIndicatorIcon(indicator.status) }}</span>
                      <span class="indicator-text">{{ indicator.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 技術応用能力 -->
              <div class="assessment-card">
                <div class="card-header bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <div class="card-icon">🤖</div>
                  <div class="card-info">
                    <h3 class="card-title">技術応用能力</h3>
                    <p class="card-subtitle">Blending & 応用音韻</p>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="score-display">
                    <div class="score-value text-blue-600">{{ learningAssessment.blending.score }}/100</div>
                    <div class="score-level" :class="getScoreColor(learningAssessment.blending.score)">
                      {{ getScoreLevel(learningAssessment.blending.score) }}
                    </div>
                  </div>
                  
                  <div class="progress-bar">
                    <div 
                      class="progress-fill bg-gradient-to-r from-blue-500 to-cyan-500"
                      :style="{ width: `${learningAssessment.blending.score}%` }"
                    ></div>
                  </div>
                  
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.blending.accuracy }}%</div>
                      <div class="metric-label">正解率</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.blending.consistency }}</div>
                      <div class="metric-label">一貫性</div>
                    </div>
                  </div>
                  
                  <div class="readiness-indicators">
                    <div 
                      v-for="indicator in learningAssessment.blending.vrReadiness"
                      :key="indicator.id"
                      class="indicator"
                      :class="getIndicatorClass(indicator.status)"
                    >
                      <span class="indicator-icon">{{ getIndicatorIcon(indicator.status) }}</span>
                      <span class="indicator-text">{{ indicator.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 言語構造理解 -->
              <div class="assessment-card">
                <div class="card-header bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <div class="card-icon">🌙</div>
                  <div class="card-info">
                    <h3 class="card-title">言語構造理解</h3>
                    <p class="card-subtitle">Grammar & 構文理解</p>
                  </div>
                </div>
                
                <div class="card-content">
                  <div class="score-display">
                    <div class="score-value text-purple-600">{{ learningAssessment.grammar.score }}/100</div>
                    <div class="score-level" :class="getScoreColor(learningAssessment.grammar.score)">
                      {{ getScoreLevel(learningAssessment.grammar.score) }}
                    </div>
                  </div>
                  
                  <div class="progress-bar">
                    <div 
                      class="progress-fill bg-gradient-to-r from-purple-500 to-indigo-500"
                      :style="{ width: `${learningAssessment.grammar.score}%` }"
                    ></div>
                  </div>
                  
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.grammar.accuracy }}%</div>
                      <div class="metric-label">正解率</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">{{ learningAssessment.grammar.consistency }}</div>
                      <div class="metric-label">一貫性</div>
                    </div>
                  </div>
                  
                  <div class="readiness-indicators">
                    <div 
                      v-for="indicator in learningAssessment.grammar.vrReadiness"
                      :key="indicator.id"
                      class="indicator"
                      :class="getIndicatorClass(indicator.status)"
                    >
                      <span class="indicator-icon">{{ getIndicatorIcon(indicator.status) }}</span>
                      <span class="indicator-text">{{ indicator.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 投資理解度評価 -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              💼 投資理解度評価
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 投資実績 -->
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📊 投資実績
                </h3>
                
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">総投資回数</span>
                    <span class="text-lg font-bold text-green-600">{{ investmentAssessment.totalInvestments }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">ポートフォリオ価値</span>
                    <span class="text-lg font-bold text-green-600">{{ investmentAssessment.portfolioValue.toLocaleString() }} EP</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">総合収益率</span>
                    <span class="text-lg font-bold" :class="investmentAssessment.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ investmentAssessment.totalReturns >= 0 ? '+' : '' }}{{ investmentAssessment.totalReturns.toFixed(2) }}%
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">リスク理解度</span>
                    <span class="text-lg font-bold text-blue-600">{{ investmentAssessment.riskScore }}/100</span>
                  </div>
                </div>
                
                <!-- 投資レベル表示 -->
                <div class="mt-6 p-4 bg-white rounded-xl">
                  <div class="text-center">
                    <div class="text-3xl mb-2">{{ getInvestmentLevelIcon(investmentAssessment.level) }}</div>
                    <div class="text-lg font-bold text-gray-800">{{ getInvestmentLevelName(investmentAssessment.level) }}</div>
                    <div class="text-sm text-gray-600">{{ getInvestmentLevelDescription(investmentAssessment.level) }}</div>
                  </div>
                </div>
              </div>

              <!-- VR準備度指標 -->
              <div class="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🥽 VR準備度指標
                </h3>
                
                <div class="space-y-4">
                  <div
                    v-for="indicator in vrReadinessIndicators"
                    :key="indicator.id"
                    class="flex items-center justify-between p-3 bg-white rounded-xl"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{{ indicator.icon }}</span>
                      <div>
                        <div class="font-bold text-gray-800 text-sm">{{ indicator.name }}</div>
                        <div class="text-xs text-gray-600">{{ indicator.description }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          class="rounded-full h-2 transition-all duration-500"
                          :class="getIndicatorProgressColor(indicator.score)"
                          :style="{ width: `${indicator.score}%` }"
                        ></div>
                      </div>
                      <span class="text-sm font-bold" :class="getScoreColor(indicator.score)">
                        {{ indicator.score }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 総合推奨アクション -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🎯 VR Academy 準備推奨アクション
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="action in recommendedActions"
                :key="action.id"
                class="action-card cursor-pointer hover:scale-105 transition-all duration-200"
                :class="action.cardClass"
                @click="executeAction(action)"
              >
                <div class="flex items-center gap-4 mb-4">
                  <div class="text-3xl">{{ action.icon }}</div>
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-800">{{ action.title }}</h3>
                    <p class="text-sm text-gray-600">{{ action.description }}</p>
                  </div>
                  <div class="text-xs px-2 py-1 rounded-full" :class="action.priorityClass">
                    {{ action.priority }}
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">期待改善:</span>
                    <span class="font-bold text-green-600">{{ action.expectedImprovement }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">推定時間:</span>
                    <span class="font-bold text-blue-600">{{ action.estimatedTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: サマリーとクイックアクション -->
        <div class="space-y-6">
          <!-- 総合レディネスサマリー -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🏆 VR Academy 準備度サマリー
            </h2>
            
            <!-- 総合スコア円形表示 -->
            <div class="text-center mb-6">
              <div class="relative w-32 h-32 mx-auto">
                <!-- 円形プログレスバー -->
                <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    class="text-gray-300"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    stroke-dasharray="251.2"
                    :stroke-dashoffset="251.2 - (251.2 * overallReadinessScore) / 100"
                    class="text-cyan-500 transition-all duration-1000"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-cyan-600">{{ overallReadinessScore }}</div>
                    <div class="text-xs text-gray-500">準備度</div>
                  </div>
                </div>
              </div>
              
              <div class="mt-4">
                <div class="text-lg font-bold text-gray-800">{{ getReadinessLevel(overallReadinessScore) }}</div>
                <div class="text-sm text-gray-600">{{ getReadinessDescription(overallReadinessScore) }}</div>
              </div>
            </div>
            
            <!-- スコア詳細 -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">学習基盤:</span>
                <span class="font-bold text-blue-600">{{ learningFoundationScore }}/100</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">投資理解:</span>
                <span class="font-bold text-green-600">{{ investmentUnderstandingScore }}/100</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">技術適応:</span>
                <span class="font-bold text-purple-600">{{ techAdaptabilityScore }}/100</span>
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
                @click="generateVRPortal"
                :disabled="overallReadinessScore < 30"
                class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🥽 VR Portal を生成
              </button>
              
              <button
                @click="viewDetailedReport"
                class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📊 詳細レポート表示
              </button>
              
              <button
                @click="startImprovementPlan"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📈 改善プラン開始
              </button>
              
              <button
                @click="exportAssessment"
                class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
              >
                📤 評価結果エクスポート
              </button>
            </div>
          </div>

          <!-- VR体験ガイド -->
          <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🌟 推奨VR体験
            </h2>
            
            <div class="space-y-3">
              <div
                v-for="experience in recommendedVRExperiences"
                :key="experience.id"
                class="p-3 bg-gradient-to-r rounded-xl text-white cursor-pointer hover:scale-105 transition-all duration-200"
                :style="{ background: experience.gradient }"
                @click="exploreVRExperience(experience)"
              >
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ experience.icon }}</div>
                  <div class="flex-1">
                    <h3 class="font-bold">{{ experience.title }}</h3>
                    <p class="text-sm opacity-90">{{ experience.description }}</p>
                  </div>
                  <div class="text-sm font-bold">{{ experience.duration }}</div>
                </div>
              </div>
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
  name: 'VRReadinessAssessment',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    const analytics = createLearningAnalytics(gameStore, galaxyStore)
    
    // === 状態管理 ===
    const rotatingRings = ref([])
    const floatingIcons = ref([])
    const assessmentResult = ref(null)
    
    // === 計算プロパティ ===
    const learningProgress = computed(() => galaxyStore.learningProgress)
    const tradingStats = computed(() => {
      const progress = learningProgress.value
      const investments = galaxyStore.playerInvestments.ownedPlanets
      
      return {
        phonicsProgress: Math.round(progress.cvcWord?.progress || 0),
        blendingProgress: Math.round(progress.blendingBuilder?.progress || 0),
        grammarProgress: Math.round(progress.grammar?.progress || 0),
        totalInvestments: investments.length,
        portfolioValue: investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0),
        totalReturns: investments.length > 0 ? 
          investments.reduce((sum, inv) => sum + ((inv.totalReturns || 0) / (inv.cost || 1) * 100), 0) / investments.length : 0,
        riskScore: Math.round((progress.cvcWord?.progress || 0) + (progress.blendingBuilder?.progress || 0) + (progress.grammar?.progress || 0)) / 3
      }
    })
    
    const learningAssessment = computed(() => {
      const stats = tradingStats.value
      
      return {
        phonics: {
          score: stats.phonicsProgress,
          accuracy: Math.min(stats.phonicsProgress + Math.floor(Math.random() * 10), 100),
          consistency: ['低', '中', '高'][Math.floor(stats.phonicsProgress / 34)],
          vrReadiness: [
            { id: 'sound-recognition', name: '音韻認識', status: stats.phonicsProgress >= 40 ? 'ready' : 'needs-work' },
            { id: 'pattern-matching', name: 'パターン認識', status: stats.phonicsProgress >= 60 ? 'ready' : 'needs-work' },
            { id: 'spatial-audio', name: '空間音響', status: stats.phonicsProgress >= 70 ? 'ready' : 'needs-work' }
          ]
        },
        blending: {
          score: stats.blendingProgress,
          accuracy: Math.min(stats.blendingProgress + Math.floor(Math.random() * 10), 100),
          consistency: ['低', '中', '高'][Math.floor(stats.blendingProgress / 34)],
          vrReadiness: [
            { id: 'tech-interaction', name: '技術操作', status: stats.blendingProgress >= 40 ? 'ready' : 'needs-work' },
            { id: 'problem-solving', name: '問題解決', status: stats.blendingProgress >= 60 ? 'ready' : 'needs-work' },
            { id: 'adaptive-learning', name: '適応学習', status: stats.blendingProgress >= 70 ? 'ready' : 'needs-work' }
          ]
        },
        grammar: {
          score: stats.grammarProgress,
          accuracy: Math.min(stats.grammarProgress + Math.floor(Math.random() * 10), 100),
          consistency: ['低', '中', '高'][Math.floor(stats.grammarProgress / 34)],
          vrReadiness: [
            { id: 'language-structure', name: '言語構造', status: stats.grammarProgress >= 40 ? 'ready' : 'needs-work' },
            { id: 'context-understanding', name: '文脈理解', status: stats.grammarProgress >= 60 ? 'ready' : 'needs-work' },
            { id: 'communication', name: 'VR会話', status: stats.grammarProgress >= 70 ? 'ready' : 'needs-work' }
          ]
        }
      }
    })
    
    const investmentAssessment = computed(() => {
      const stats = tradingStats.value
      let level = 'beginner'
      
      if (stats.totalInvestments >= 5 && stats.totalReturns > 10) {
        level = 'advanced'
      } else if (stats.totalInvestments >= 3 && stats.totalReturns > 0) {
        level = 'intermediate'
      }
      
      return {
        ...stats,
        level
      }
    })
    
    const vrReadinessIndicators = computed(() => [
      {
        id: 'hardware-compatibility',
        name: 'ハードウェア対応',
        description: 'VRヘッドセット適合性',
        icon: '🥽',
        score: Math.min(95, 85 + Math.floor(Math.random() * 10)) // デモ用
      },
      {
        id: 'spatial-awareness',
        name: '空間認識',
        description: '3D空間での方向感覚',
        icon: '🌐',
        score: Math.min((learningAssessment.value.phonics.score + learningAssessment.value.blending.score) / 2 + 10, 100)
      },
      {
        id: 'motion-comfort',
        name: 'VR酔い耐性',
        description: 'VR環境での快適性',
        icon: '🤢',
        score: Math.min(90, 75 + Math.floor(Math.random() * 15)) // デモ用
      },
      {
        id: 'interaction-readiness',
        name: 'インタラクション',
        description: 'VR内での操作能力',
        icon: '👋',
        score: Math.min(learningAssessment.value.blending.score + 15, 100)
      },
      {
        id: 'learning-transfer',
        name: '学習転移',
        description: '2D→3D学習の転移',
        icon: '🔄',
        score: Math.round((learningAssessment.value.phonics.score + learningAssessment.value.grammar.score) / 2)
      }
    ])
    
    const learningFoundationScore = computed(() => {
      return Math.round((learningAssessment.value.phonics.score + learningAssessment.value.blending.score + learningAssessment.value.grammar.score) / 3)
    })
    
    const investmentUnderstandingScore = computed(() => {
      const stats = investmentAssessment.value
      return Math.min(Math.round(stats.totalInvestments * 15 + Math.abs(stats.totalReturns) * 2 + stats.riskScore), 100)
    })
    
    const techAdaptabilityScore = computed(() => {
      return Math.round(vrReadinessIndicators.value.reduce((sum, indicator) => sum + indicator.score, 0) / vrReadinessIndicators.value.length)
    })
    
    const overallReadinessScore = computed(() => {
      return Math.round((learningFoundationScore.value * 0.4 + investmentUnderstandingScore.value * 0.3 + techAdaptabilityScore.value * 0.3))
    })
    
    const recommendedActions = computed(() => {
      const actions = []
      const assessment = learningAssessment.value
      
      if (assessment.phonics.score < 60) {
        actions.push({
          id: 'improve-phonics',
          title: '音韻学習強化',
          description: 'Apple Planet でCVC Word学習を集中的に進める',
          icon: '🍎',
          priority: '高優先度',
          priorityClass: 'bg-red-100 text-red-800',
          cardClass: 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4',
          expectedImprovement: '+20点',
          estimatedTime: '2週間'
        })
      }
      
      if (assessment.blending.score < 60) {
        actions.push({
          id: 'improve-blending',
          title: '技術応用強化',
          description: 'Robot Planet でBlending技術を向上させる',
          icon: '🤖',
          priority: '中優先度',
          priorityClass: 'bg-yellow-100 text-yellow-800',
          cardClass: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4',
          expectedImprovement: '+25点',
          estimatedTime: '3週間'
        })
      }
      
      if (investmentAssessment.value.totalInvestments < 3) {
        actions.push({
          id: 'increase-investments',
          title: '投資経験積み上げ',
          description: 'Galaxy Trading で多様な投資体験を積む',
          icon: '💰',
          priority: '中優先度',
          priorityClass: 'bg-green-100 text-green-800',
          cardClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4',
          expectedImprovement: '+15点',
          estimatedTime: '1週間'
        })
      }
      
      if (overallReadinessScore.value >= 70) {
        actions.push({
          id: 'vr-trial',
          title: 'VR体験トライアル',
          description: 'VR Academy での短時間体験セッションに参加',
          icon: '🥽',
          priority: '推奨',
          priorityClass: 'bg-purple-100 text-purple-800',
          cardClass: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-4',
          expectedImprovement: 'VR適応',
          estimatedTime: '30分'
        })
      }
      
      return actions
    })
    
    const recommendedVRExperiences = computed(() => {
      const experiences = []
      const score = overallReadinessScore.value
      
      if (score >= 30) {
        experiences.push({
          id: 'basic-exploration',
          title: '基本探索体験',
          description: '3D空間での基本的な移動と操作',
          icon: '🌌',
          duration: '15分',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        })
      }
      
      if (score >= 50) {
        experiences.push({
          id: 'interactive-learning',
          title: 'インタラクティブ学習',
          description: 'VR環境での英語学習体験',
          icon: '📚',
          duration: '25分',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        })
      }
      
      if (score >= 70) {
        experiences.push({
          id: 'collaborative-session',
          title: '協調学習セッション',
          description: '他の学習者との共同VR体験',
          icon: '👥',
          duration: '40分',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        })
      }
      
      if (score >= 85) {
        experiences.push({
          id: 'advanced-simulation',
          title: '高度シミュレーション',
          description: '投資ゲームとVR学習の統合体験',
          icon: '🚀',
          duration: '60分',
          gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        })
      }
      
      return experiences
    })
    
    // === メソッド ===
    
    /**
     * 3D背景エフェクト生成
     */
    const generate3DEffects = () => {
      // 回転リング生成
      rotatingRings.value = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 200 + 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        rotateX: Math.random() * 360,
        rotateY: Math.random() * 360
      }))
      
      // フローティングアイコン生成
      const icons = ['🥽', '🌐', '🔮', '💫', '⭐', '🌟', '✨', '💎', '🎯', '🚀', '👋', '🤢', '🔄', '📡']
      floatingIcons.value = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 12,
        opacity: Math.random() * 0.6 + 0.2,
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
        symbol: icons[Math.floor(Math.random() * icons.length)]
      }))
    }
    
    /**
     * スコアレベル取得
     */
    const getScoreLevel = (score) => {
      if (score >= 85) return 'エキスパート'
      if (score >= 70) return '上級者'
      if (score >= 50) return '中級者'
      if (score >= 30) return '初級者'
      return '要強化'
    }
    
    const getScoreColor = (score) => {
      if (score >= 85) return 'text-purple-600'
      if (score >= 70) return 'text-green-600'
      if (score >= 50) return 'text-blue-600'
      if (score >= 30) return 'text-yellow-600'
      return 'text-red-600'
    }
    
    const getIndicatorClass = (status) => {
      return status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }
    
    const getIndicatorIcon = (status) => {
      return status === 'ready' ? '✅' : '⚠️'
    }
    
    const getIndicatorProgressColor = (score) => {
      if (score >= 80) return 'bg-green-500'
      if (score >= 60) return 'bg-blue-500'
      if (score >= 40) return 'bg-yellow-500'
      return 'bg-red-500'
    }
    
    const getInvestmentLevelIcon = (level) => {
      const icons = {
        beginner: '🌱',
        intermediate: '📈',
        advanced: '🏆'
      }
      return icons[level] || '🌱'
    }
    
    const getInvestmentLevelName = (level) => {
      const names = {
        beginner: '投資初心者',
        intermediate: '投資経験者',
        advanced: '投資上級者'
      }
      return names[level] || '投資初心者'
    }
    
    const getInvestmentLevelDescription = (level) => {
      const descriptions = {
        beginner: '基本的な投資概念を学習中',
        intermediate: '安定した投資実績を構築',
        advanced: '高度な投資戦略を実践'
      }
      return descriptions[level] || '基本的な投資概念を学習中'
    }
    
    const getReadinessLevel = (score) => {
      if (score >= 85) return 'VR Academy 完全準備完了'
      if (score >= 70) return 'VR Academy 準備良好'
      if (score >= 50) return 'VR Academy 基本準備完了'
      if (score >= 30) return 'VR Academy 準備中'
      return 'VR Academy 準備不足'
    }
    
    const getReadinessDescription = (score) => {
      if (score >= 85) return '全ての高度なVR体験に参加可能です'
      if (score >= 70) return '多くのVR体験に参加可能です'
      if (score >= 50) return '基本的なVR体験に参加可能です'
      if (score >= 30) return '入門レベルのVR体験から開始できます'
      return '基礎学習を進めてからVR体験をお勧めします'
    }
    
    /**
     * アクション実行
     */
    const executeAction = (action) => {
      switch (action.id) {
        case 'improve-phonics':
          router.push('/apple-planet')
          break
        case 'improve-blending':
          router.push('/robot-planet')
          break
        case 'increase-investments':
          router.push('/galaxy-trading')
          break
        case 'vr-trial':
          generateVRPortal()
          break
        default:
          alert(`🚀 "${action.title}"を開始します！\n\n${action.description}`)
      }
    }
    
    const generateVRPortal = () => {
      if (overallReadinessScore.value < 30) {
        alert('⚠️ VR準備度が不足しています。\n\n基礎学習を進めてから再度お試しください。')
        return
      }
      router.push('/vr-qr-generator')
    }
    
    const viewDetailedReport = () => {
      alert('📊 詳細レポート機能は開発中です。\n\n現在の評価結果をもとに、学習計画をカスタマイズできます。')
    }
    
    const startImprovementPlan = () => {
      const actions = recommendedActions.value
      if (actions.length === 0) {
        alert('🎉 素晴らしい！現在の学習状況は非常に良好です。\n\nVR Academy での体験をお楽しみください。')
      } else {
        const plan = actions.map((action, index) => `${index + 1}. ${action.title} (${action.estimatedTime})`).join('\n')
        alert(`📈 改善プランを開始します！\n\n推奨アクション順序:\n${plan}`)
      }
    }
    
    const exportAssessment = () => {
      const data = {
        overallScore: overallReadinessScore.value,
        learningFoundation: learningFoundationScore.value,
        investmentUnderstanding: investmentUnderstandingScore.value,
        techAdaptability: techAdaptabilityScore.value,
        detailedAssessment: {
          learning: learningAssessment.value,
          investment: investmentAssessment.value,
          vrIndicators: vrReadinessIndicators.value
        },
        recommendations: recommendedActions.value,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `vr-readiness-assessment-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      alert('📤 VR準備度評価結果をエクスポートしました！')
    }
    
    const exploreVRExperience = (experience) => {
      alert(`🌟 "${experience.title}"を開始します！\n\n${experience.description}\n\n推定時間: ${experience.duration}`)
    }
    
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🥽 VR Readiness Assessment 初期化')
      generate3DEffects()
      
      // 詳細分析の実行
      assessmentResult.value = analytics.analyzeOverallProgress()
      
      // Galaxy Trading システムに記録
      gameStore.recordGalaxyTradingLearning(
        'vr-readiness',
        'assessment-completed',
        overallReadinessScore.value
      )
    })
    
    return {
      // State
      rotatingRings,
      floatingIcons,
      assessmentResult,
      
      // Computed
      learningAssessment,
      investmentAssessment,
      vrReadinessIndicators,
      learningFoundationScore,
      investmentUnderstandingScore,
      techAdaptabilityScore,
      overallReadinessScore,
      recommendedActions,
      recommendedVRExperiences,
      
      // Methods
      getScoreLevel,
      getScoreColor,
      getIndicatorClass,
      getIndicatorIcon,
      getIndicatorProgressColor,
      getInvestmentLevelIcon,
      getInvestmentLevelName,
      getInvestmentLevelDescription,
      getReadinessLevel,
      getReadinessDescription,
      executeAction,
      generateVRPortal,
      viewDetailedReport,
      startImprovementPlan,
      exportAssessment,
      exploreVRExperience,
      handleBack
    }
  }
}
</script>

<style scoped>
.vr-readiness-assessment {
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* アセスメントカードスタイル */
.assessment-card {
  @apply bg-white rounded-2xl shadow-lg overflow-hidden;
}

.card-header {
  @apply flex items-center gap-3 p-4 border-2 rounded-t-2xl;
}

.card-icon {
  @apply text-3xl;
}

.card-info {
  @apply flex-1;
}

.card-title {
  @apply text-lg font-bold text-gray-800;
}

.card-subtitle {
  @apply text-sm text-gray-600;
}

.card-content {
  @apply p-4 space-y-4;
}

.score-display {
  @apply text-center;
}

.score-value {
  @apply text-2xl font-bold;
}

.score-level {
  @apply text-sm font-medium;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-3;
}

.progress-fill {
  @apply h-3 rounded-full transition-all duration-1000;
}

.metrics-grid {
  @apply grid grid-cols-2 gap-3;
}

.metric {
  @apply text-center p-2 bg-gray-50 rounded-lg;
}

.metric-value {
  @apply text-lg font-bold text-gray-800;
}

.metric-label {
  @apply text-xs text-gray-500;
}

.readiness-indicators {
  @apply space-y-2;
}

.indicator {
  @apply flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium;
}

.indicator-icon {
  @apply text-sm;
}

.indicator-text {
  @apply text-xs;
}

/* アクションカードスタイル */
.action-card {
  @apply p-4 rounded-2xl border-2 transition-all duration-200;
}

.action-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* 3Dエフェクトアニメーション */
.absolute.border-2 {
  animation: float3D 8s ease-in-out infinite;
}

@keyframes float3D {
  0%, 100% { 
    transform: translateY(0px) rotateX(0deg) rotateY(0deg); 
    opacity: 0.2;
  }
  25% { 
    transform: translateY(-10px) rotateX(90deg) rotateY(45deg); 
    opacity: 0.4;
  }
  50% { 
    transform: translateY(0px) rotateX(180deg) rotateY(90deg); 
    opacity: 0.2;
  }
  75% { 
    transform: translateY(10px) rotateX(270deg) rotateY(135deg); 
    opacity: 0.4;
  }
}

/* 円形プログレスバーアニメーション */
.text-cyan-500 {
  animation: progressGlow 2s ease-in-out infinite;
}

@keyframes progressGlow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(6, 182, 212, 0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.8)); }
}

/* レスポンシブ対応 */
@media (max-width: 1280px) {
  .xl\:col-span-2 {
    grid-column: span 1;
  }
  
  .xl\:grid-cols-3 {
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
  
  .metrics-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>