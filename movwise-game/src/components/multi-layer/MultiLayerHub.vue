<!-- Multi-Layer Learning Engine - Hub Component -->
<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')" 
              class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-slate-300">ホーム</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="galaxy-stats-card">
              <span class="text-2xl cosmic-glow">⚡</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">学習レベル</div>
                <div class="text-xl font-bold galaxy-text-primary">Phase {{ currentPhase }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-yellow-400 cosmic-title mb-4">
            🌌 Multi-Layer Learning Galaxy
          </h1>
          <p class="text-xl mb-2 text-slate-400">
            AI適応型学習エンジンによる個別最適化
          </p>
          <p class="text-base text-slate-400 max-w-3xl mx-auto">
            最適な学習ゾーンを選んで、効率的に英語力を向上させよう！
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 px-6 pb-32">
      <div class="max-w-6xl mx-auto">

        <!-- User Progress Overview -->
        <section class="mb-12">
          <div class="galaxy-card p-8">
            <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-6">📊 学習進捗サマリー</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat-card">
                <h3 class="text-lg font-bold galaxy-text-primary mb-4">総合習得度</h3>
                <div class="progress-circle">
                  <div class="circle-progress" :style="{ '--progress': overallMastery + '%' }">
                    <span class="progress-percentage">{{ Math.round(overallMastery) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="stat-card">
                <h3 class="text-lg font-bold galaxy-text-primary mb-4">学習時間</h3>
                <div class="study-time">
                  <span class="time-value">{{ totalStudyHours.toFixed(1) }}</span>
                  <span class="time-unit">時間</span>
                </div>
              </div>
              
              <div class="stat-card">
                <h3 class="text-lg font-bold galaxy-text-primary mb-4">現在のフェーズ</h3>
                <div class="current-phase">
                  <span class="phase-number">{{ currentPhase }}</span>
                  <span class="phase-name">{{ currentPhaseName }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Zone Recommendation Engine -->
        <section class="mb-12">
          <div class="galaxy-card p-8">
            <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-6">🎯 あなたにおすすめの学習ゾーン</h2>
            <div class="recommendation-card" v-if="recommendedZone">
              <div class="recommendation-icon">{{ getZoneIcon(recommendedZone.type) }}</div>
              <div class="recommendation-content">
                <h3>{{ getZoneName(recommendedZone.type) }}</h3>
                <p>{{ recommendedZone.reason }}</p>
                <div class="recommendation-stats">
                  <span class="stat">推奨度: {{ recommendedZone.confidence }}%</span>
                  <span class="stat">予想効果: {{ recommendedZone.expectedImprovement }}%向上</span>
                </div>
              </div>
              <button 
                class="galaxy-button galaxy-button-primary"
                @click="startRecommendedZone"
              >
                開始
              </button>
            </div>
          </div>
        </section>

        <!-- Learning Zones -->
        <section class="mb-12">
          <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-8">🎮 学習ゾーン選択</h2>
          
          <div class="zones-grid">
            <!-- Rush Zone -->
            <div class="zone-card" @click="selectZone('rush')">
              <div class="zone-header rush">
                <div class="zone-icon">⚡</div>
                <div class="zone-status" :class="getZoneStatus('rush')">
                  {{ getZoneStatusText('rush') }}
                </div>
              </div>
              <div class="zone-content">
                <h3>Rush Zone</h3>
                <p>高速反復練習でスピードと正確性を同時に向上</p>
                
                <div class="zone-features">
                  <div class="feature">
                    <span class="feature-icon">🏃‍♂️</span>
                    <span class="feature-text">スピード重視</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🔥</span>
                    <span class="feature-text">フィーバーモード</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">⏱️</span>
                    <span class="feature-text">時間制限</span>
                  </div>
                </div>
                
                <div class="zone-stats">
                  <div class="stat-item">
                    <span class="stat-label">平均時間</span>
                    <span class="stat-value">2-5分</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">難易度</span>
                    <span class="stat-value">⭐⭐⭐</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">効果</span>
                    <span class="stat-value">瞬発力</span>
                  </div>
                </div>
                
                <div class="zone-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill rush" 
                      :style="{ width: zoneProgress.rush + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">習得: {{ Math.round(zoneProgress.rush) }}%</span>
                </div>
              </div>
            </div>

            <!-- Construction Zone -->
            <div class="zone-card" @click="selectZone('construction')">
              <div class="zone-header construction">
                <div class="zone-icon">🏗️</div>
                <div class="zone-status" :class="getZoneStatus('construction')">
                  {{ getZoneStatusText('construction') }}
                </div>
              </div>
              <div class="zone-content">
                <h3>Construction Zone</h3>
                <p>じっくり理解を構築する丁寧な学習</p>
                
                <div class="zone-features">
                  <div class="feature">
                    <span class="feature-icon">🧠</span>
                    <span class="feature-text">理解重視</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🤝</span>
                    <span class="feature-text">協力学習</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🏗️</span>
                    <span class="feature-text">段階構築</span>
                  </div>
                </div>
                
                <div class="zone-stats">
                  <div class="stat-item">
                    <span class="stat-label">平均時間</span>
                    <span class="stat-value">5-15分</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">難易度</span>
                    <span class="stat-value">⭐⭐</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">効果</span>
                    <span class="stat-value">理解力</span>
                  </div>
                </div>
                
                <div class="zone-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill construction" 
                      :style="{ width: zoneProgress.construction + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">習得: {{ Math.round(zoneProgress.construction) }}%</span>
                </div>
              </div>
            </div>

            <!-- Battle Zone -->
            <div class="zone-card" @click="selectZone('battle')">
              <div class="zone-header battle">
                <div class="zone-icon">⚔️</div>
                <div class="zone-status" :class="getZoneStatus('battle')">
                  {{ getZoneStatusText('battle') }}
                </div>
              </div>
              <div class="zone-content">
                <h3>Battle Zone</h3>
                <p>仲間と競い合いながら実践的なスキルを磨く</p>
                
                <div class="zone-features">
                  <div class="feature">
                    <span class="feature-icon">🥊</span>
                    <span class="feature-text">競争学習</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">👥</span>
                    <span class="feature-text">マルチプレイ</span>
                  </div>
                  <div class="feature">
                    <span class="feature-icon">🏆</span>
                    <span class="feature-text">ランキング</span>
                  </div>
                </div>
                
                <div class="zone-stats">
                  <div class="stat-item">
                    <span class="stat-label">平均時間</span>
                    <span class="stat-value">3-10分</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">難易度</span>
                    <span class="stat-value">⭐⭐⭐⭐</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">効果</span>
                    <span class="stat-value">実践力</span>
                  </div>
                </div>
                
                <div class="zone-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill battle" 
                      :style="{ width: zoneProgress.battle + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">習得: {{ Math.round(zoneProgress.battle) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Learning Analytics -->
        <section class="mb-12">
          <div class="galaxy-card p-8">
            <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-6">📊 学習分析</h2>
            
            <div class="analytics-grid">
              <div class="analytics-card">
                <h3>ゾーン別パフォーマンス</h3>
                <div class="performance-chart">
                  <div class="chart-bars">
                    <div class="bar-group">
                      <div class="bar rush" :style="{ height: zonePerformance.rush + '%' }"></div>
                      <span class="bar-label">Rush</span>
                    </div>
                    <div class="bar-group">
                      <div class="bar construction" :style="{ height: zonePerformance.construction + '%' }"></div>
                      <span class="bar-label">Construction</span>
                    </div>
                    <div class="bar-group">
                      <div class="bar battle" :style="{ height: zonePerformance.battle + '%' }"></div>
                      <span class="bar-label">Battle</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="analytics-card">
                <h3>学習傾向</h3>
                <div class="learning-trends">
                  <div class="trend-item">
                    <span class="trend-label">最も活用しているゾーン</span>
                    <span class="trend-value">{{ mostUsedZone }}</span>
                  </div>
                  <div class="trend-item">
                    <span class="trend-label">最高パフォーマンス</span>
                    <span class="trend-value">{{ bestPerformanceZone }}</span>
                  </div>
                  <div class="trend-item">
                    <span class="trend-label">推奨学習頻度</span>
                    <span class="trend-value">週3-4回</span>
                  </div>
                  <div class="trend-item">
                    <span class="trend-label">次のマイルストーン</span>
                    <span class="trend-value">フェーズ{{ currentPhase + 1 }}到達</span>
                  </div>
                </div>
              </div>
              
              <div class="analytics-card">
                <h3>弱点分析</h3>
                <div class="weakness-analysis">
                  <div class="weakness-list">
                    <div 
                      v-for="weakness in topWeaknesses" 
                      :key="weakness.topic"
                      class="weakness-item"
                    >
                      <div class="weakness-info">
                        <span class="weakness-topic">{{ weakness.topic }}</span>
                        <span class="weakness-score">{{ weakness.score }}%</span>
                      </div>
                      <div class="weakness-bar">
                        <div 
                          class="weakness-fill" 
                          :style="{ width: weakness.score + '%' }"
                        ></div>
                      </div>
                      <span class="recommended-zone">{{ weakness.recommendedZone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Sessions -->
        <section class="mb-12">
          <div class="galaxy-card p-8">
            <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-6">📚 最近のセッション</h2>
            <div class="sessions-list">
              <div 
                v-for="session in recentSessions" 
                :key="session.id"
                class="session-card"
              >
                <div class="session-icon">{{ getZoneIcon(session.zoneType) }}</div>
                <div class="session-content">
                  <h4>{{ getZoneName(session.zoneType) }}</h4>
                  <p>{{ session.grammarTopic }}</p>
                  <div class="session-meta">
                    <span class="session-date">{{ formatDate(session.date) }}</span>
                    <span class="session-duration">{{ session.duration }}分</span>
                  </div>
                </div>
                <div class="session-performance">
                  <div class="performance-indicator" :class="getPerformanceClass(session.score)">
                    {{ session.score }}%
                  </div>
                  <div class="session-stats">
                    <span class="stat">正答率: {{ session.accuracy }}%</span>
                    <span class="stat">改善: +{{ session.improvement }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions-section">
          <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-8">⚡ クイックアクション</h2>
          <div class="quick-actions-grid">
            <button class="action-card continue-learning" @click="continueLastSession">
              <span class="action-icon">▶️</span>
              <span class="action-text">前回の続きから</span>
            </button>
            
            <button class="action-card daily-challenge" @click="startDailyChallenge">
              <span class="action-icon">🎯</span>
              <span class="action-text">デイリーチャレンジ</span>
            </button>
            
            <button class="action-card weakness-focus" @click="focusOnWeakness">
              <span class="action-icon">🎯</span>
              <span class="action-text">弱点集中練習</span>
            </button>
            
            <button class="action-card random-battle" @click="joinRandomBattle">
              <span class="action-icon">🎲</span>
              <span class="action-text">ランダムバトル</span>
            </button>
          </div>
        </section>

      </div>
    </main>

    <!-- Zone Selection Modal -->
    <Transition name="modal">
      <div class="modal-overlay" v-if="showZoneModal" @click="closeZoneModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedZoneData?.name }} を開始</h3>
            <button @click="closeZoneModal" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>{{ selectedZoneData?.description }}</p>
          </div>
          <div class="modal-footer">
            <button class="galaxy-button galaxy-button-secondary" @click="closeZoneModal">キャンセル</button>
            <button class="galaxy-button galaxy-button-primary" @click="startSelectedZone">開始</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Common Footer -->
    <CommonFooter 
      :active="'multilayer'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { multiLayerEngine } from '@/services/multiLayerEngine'
import { useGrammarMasteryStore } from '@/stores/grammarMasteryStore'
import { useGameAudio } from '@/composables/useGameAudio'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'MultiLayerHub',
  components: {
    CommonFooter
  },
  setup() {
    const router = useRouter()
    const grammarStore = useGrammarMasteryStore()
    const { playEffectSound } = useGameAudio()

    // State
    const showZoneModal = ref(false)
    const selectedZone = ref(null)
    const recommendedZone = ref(null)
    const recentSessions = ref([])
    const zoneProgress = ref({
      rush: 0,
      construction: 0,
      battle: 0,
      phrase: 0
    })
    const zonePerformance = ref({
      rush: 0,
      construction: 0,
      battle: 0,
      phrase: 0
    })
    const topWeaknesses = ref([])

    // Computed Properties
    const overallMastery = computed(() => grammarStore.overallMastery)
    const totalStudyHours = computed(() => grammarStore.totalStudyHours)
    const currentPhase = computed(() => grammarStore.currentPhase)
    
    const currentPhaseName = computed(() => {
      const phaseNames = {
        1: 'Foundation',
        2: 'Expansion', 
        3: 'Complex Structures',
        4: 'Advanced Mastery'
      }
      return phaseNames[currentPhase.value] || 'Unknown'
    })
    
    const mostUsedZone = computed(() => {
      const usage = Object.entries(zonePerformance.value)
      usage.sort((a, b) => b[1] - a[1])
      return getZoneName(usage[0]?.[0] || 'construction')
    })
    
    const bestPerformanceZone = computed(() => {
      const performance = Object.entries(zonePerformance.value)
      performance.sort((a, b) => b[1] - a[1])
      return getZoneName(performance[0]?.[0] || 'construction')
    })
    
    const selectedZoneData = computed(() => {
      if (!selectedZone.value) return null
      
      const zoneData = {
        rush: {
          name: 'Rush Zone',
          description: '高速反復練習でスピードと正確性を同時に向上させます。短時間で集中的な学習効果を得られます。',
          component: 'RushZoneGame'
        },
        construction: {
          name: 'Construction Zone', 
          description: 'じっくりと理解を構築する丁寧な学習です。複雑な文法概念も段階的に習得できます。',
          component: 'ConstructionZoneGame'
        },
        battle: {
          name: 'Battle Zone',
          description: '他の学習者と競い合いながら実践的なスキルを磨きます。ゲーム感覚で楽しく学習できます。',
          component: 'BattleZoneGame'
        },
        phrase: {
          name: 'Phrase Galaxy',
          description: '流れる星と英熟語をマッチング！英検5級〜2級レベルの熟語を宇宙テーマで楽しく学習。',
          component: 'PhraseGalaxy'
        }
      }
      
      return zoneData[selectedZone.value]
    })

    // Methods
    const initializeData = () => {
      // Generate zone recommendation
      generateRecommendation()
      
      // Initialize zone progress based on grammar mastery
      updateZoneProgress()
      
      // Load recent sessions (mock data)
      loadRecentSessions()
      
      // Analyze weaknesses
      analyzeWeaknesses()
      
      // Update zone performance
      updateZonePerformance()
    }
    
    const generateRecommendation = () => {
      const userPreferences = {
        prefersFastPaced: true,
        prefersCollaborative: false,
        prefersCompetitive: true
      }
      
      const performanceHistory = [
        { accuracy: 0.85, engagementLevel: 0.9 },
        { accuracy: 0.75, engagementLevel: 0.8 }
      ]
      
      const recommendedZoneType = multiLayerEngine.recommendOptimalZone(
        'user123',
        'be_verbs_basic',
        userPreferences,
        performanceHistory
      )
      
      recommendedZone.value = {
        type: recommendedZoneType,
        confidence: 85,
        expectedImprovement: 15,
        reason: getRecommendationReason(recommendedZoneType)
      }
    }
    
    const getRecommendationReason = (zoneType) => {
      const reasons = {
        rush: '高い正答率を維持しているので、スピード向上に挑戦しましょう',
        construction: '基礎をしっかり固めることで、より確実な理解を築けます',
        battle: '競争環境でモチベーションを高めながら学習効果を最大化できます'
      }
      return reasons[zoneType] || 'あなたの学習傾向に最適化された推奨です'
    }
    
    const updateZoneProgress = () => {
      // Mock calculation based on grammar mastery
      const baseMastery = overallMastery.value
      
      zoneProgress.value = {
        rush: Math.min(baseMastery + Math.random() * 20, 100),
        construction: Math.min(baseMastery + Math.random() * 15, 100), 
        battle: Math.min(baseMastery * 0.8 + Math.random() * 25, 100)
      }
    }
    
    const updateZonePerformance = () => {
      // Mock performance data
      zonePerformance.value = {
        rush: 75 + Math.random() * 20,
        construction: 80 + Math.random() * 15,
        battle: 70 + Math.random() * 25
      }
    }
    
    const loadRecentSessions = () => {
      // Mock recent sessions data
      recentSessions.value = [
        {
          id: 1,
          zoneType: 'rush',
          grammarTopic: 'Be動詞の基本',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          duration: 3,
          score: 85,
          accuracy: 92,
          improvement: 5
        },
        {
          id: 2,
          zoneType: 'construction',
          grammarTopic: '過去形の変化',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          duration: 12,
          score: 78,
          accuracy: 86,
          improvement: 8
        },
        {
          id: 3,
          zoneType: 'battle',
          grammarTopic: '疑問文の作り方',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          duration: 7,
          score: 91,
          accuracy: 94,
          improvement: 12
        }
      ]
    }
    
    const analyzeWeaknesses = () => {
      const weakTopics = grammarStore.weakTopics
      
      topWeaknesses.value = weakTopics.slice(0, 3).map(topic => ({
        topic: topic.name,
        score: topic.masteryLevel,
        recommendedZone: getRecommendedZoneForTopic(topic)
      }))
    }
    
    const getRecommendedZoneForTopic = (topic) => {
      if (topic.masteryLevel < 40) return 'Construction Zone'
      if (topic.masteryLevel < 70) return 'Rush Zone'
      return 'Battle Zone'
    }
    
    const selectZone = async (zoneType) => {
      selectedZone.value = zoneType
      showZoneModal.value = true
      await playEffectSound('button')
    }
    
    const closeZoneModal = () => {
      showZoneModal.value = false
      selectedZone.value = null
    }
    
    const startSelectedZone = async () => {
      if (!selectedZone.value || !selectedZoneData.value) return
      
      await playEffectSound('gameStart')
      
      // Direct router navigation to the zone games
      const routeMap = {
        rush: '/multi-layer/rush-zone',
        construction: '/multi-layer/construction-zone',
        battle: '/multi-layer/battle-zone',
        phrase: '/games/phrase-galaxy'
      }
      
      const targetRoute = routeMap[selectedZone.value]
      if (targetRoute) {
        logger.log('Navigating to:', targetRoute)
        router.push(targetRoute)
      } else {
        logger.error('Unknown zone type:', selectedZone.value)
      }
      
      closeZoneModal()
    }
    
    const startRecommendedZone = async () => {
      if (!recommendedZone.value) return
      
      selectedZone.value = recommendedZone.value.type
      await startSelectedZone()
    }
    
    const continueLastSession = async () => {
      if (recentSessions.value.length === 0) return
      
      const lastSession = recentSessions.value[0]
      selectedZone.value = lastSession.zoneType
      await startSelectedZone()
    }
    
    const startDailyChallenge = async () => {
      // Start with the zone that needs most improvement
      const lowestZone = Object.entries(zoneProgress.value)
        .sort((a, b) => a[1] - b[1])[0]?.[0]
      
      if (lowestZone) {
        selectedZone.value = lowestZone
        await startSelectedZone()
      }
    }
    
    const focusOnWeakness = async () => {
      if (topWeaknesses.value.length === 0) return
      
      const weakestTopic = topWeaknesses.value[0]
      const zoneType = weakestTopic.recommendedZone.toLowerCase().replace(' zone', '')
      
      selectedZone.value = zoneType
      await startSelectedZone()
    }
    
    const joinRandomBattle = async () => {
      selectedZone.value = 'battle'
      await startSelectedZone()
    }
    
    const getZoneIcon = (zoneType) => {
      const icons = {
        rush: '⚡',
        construction: '🏗️',
        battle: '⚔️',
        phrase: '🌌'
      }
      return icons[zoneType] || '❓'
    }

    const getZoneName = (zoneType) => {
      const names = {
        rush: 'Rush Zone',
        construction: 'Construction Zone',
        battle: 'Battle Zone',
        phrase: 'Phrase Galaxy'
      }
      return names[zoneType] || 'Unknown Zone'
    }
    
    const getZoneStatus = (zoneType) => {
      const progress = zoneProgress.value[zoneType]
      if (progress >= 80) return 'mastered'
      if (progress >= 50) return 'progressing'
      return 'beginner'
    }
    
    const getZoneStatusText = (zoneType) => {
      const status = getZoneStatus(zoneType)
      const texts = {
        mastered: 'マスター',
        progressing: '習得中',
        beginner: '初心者'
      }
      return texts[status] || '未知'
    }
    
    const getPerformanceClass = (score) => {
      if (score >= 90) return 'excellent'
      if (score >= 80) return 'good'
      if (score >= 70) return 'average'
      return 'needs-improvement'
    }
    
    const formatDate = (date) => {
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days === 0) return '今日'
      if (days === 1) return '昨日'
      if (days < 7) return `${days}日前`
      return date.toLocaleDateString('ja-JP')
    }

    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure')
          break
        case 'grammar':
          router.push('/grammar-galaxy-hub')
          break
        case 'multi-layer':
          // Already on this page
          break
        case 'co-pilot':
          router.push('/co-pilot-dock')
          break
        case 'vr-academy':
          router.push('/vr-academy')
          break
        default:
          logger.warn('Unknown navigation section:', section)
      }
    }

    // Lifecycle
    onMounted(() => {
      initializeData()
    })

    return {
      // State
      showZoneModal,
      selectedZone,
      recommendedZone,
      recentSessions,
      zoneProgress,
      zonePerformance,
      topWeaknesses,
      
      // Computed
      overallMastery,
      totalStudyHours,
      currentPhase,
      currentPhaseName,
      mostUsedZone,
      bestPerformanceZone,
      selectedZoneData,
      
      // Methods
      selectZone,
      closeZoneModal,
      startSelectedZone,
      startRecommendedZone,
      continueLastSession,
      startDailyChallenge,
      focusOnWeakness,
      joinRandomBattle,
      getZoneIcon,
      getZoneName,
      getZoneStatus,
      getZoneStatusText,
      getPerformanceClass,
      formatDate,
      handleFooterNavigation
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.galaxy-background {
  background: var(--space-void, linear-gradient(135deg, #0f172a 0%, #1e293b 100%));
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
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

/* Galaxy Components */
.galaxy-stats-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(20px);
}

.cosmic-glow {
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
}

.galaxy-text-primary {
  color: #fbbf24;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-title {
  background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3));
}

.galaxy-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.galaxy-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
}

/* Progress Overview */
.stat-card {
  background: rgba(255,255,255,0.05);
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 20px auto;
}

.circle-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#10b981 var(--progress), rgba(255,255,255,0.2) var(--progress));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.circle-progress::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  background: #1e293b;
  border-radius: 50%;
}

.progress-percentage {
  position: relative;
  z-index: 1;
  font-size: 1.2rem;
  font-weight: bold;
}

.study-time {
  margin-top: 15px;
}

.time-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fbbf24;
  display: block;
}

.time-unit {
  font-size: 1rem;
  opacity: 0.8;
}

.current-phase {
  margin-top: 15px;
}

.phase-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #8b5cf6;
  display: block;
}

.phase-name {
  font-size: 1rem;
  opacity: 0.8;
}

/* Recommendation Card */
.recommendation-card {
  background: rgba(251,191,36,0.1);
  border: 2px solid #fbbf24;
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  animation: glow 2s ease-in-out infinite alternate;
}

.recommendation-icon {
  font-size: 3rem;
  min-width: 60px;
}

.recommendation-content {
  flex: 1;
}

.recommendation-content h3 {
  margin-bottom: 10px;
  font-size: 1.4rem;
  color: #fbbf24;
}

.recommendation-content p {
  margin-bottom: 15px;
  opacity: 0.9;
}

.recommendation-stats {
  display: flex;
  gap: 20px;
}

.recommendation-stats .stat {
  font-size: 0.9rem;
  background: rgba(255,255,255,0.1);
  padding: 5px 10px;
  border-radius: 10px;
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(251,191,36,0.5); }
  100% { box-shadow: 0 0 20px rgba(251,191,36,0.8), 0 0 30px rgba(251,191,36,0.4); }
}

/* Learning Zones */
.zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.zone-card {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.zone-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2);
}

.zone-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.zone-header.rush {
  background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1));
}

.zone-header.construction {
  background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1));
}

.zone-header.battle {
  background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1));
}

.zone-icon {
  font-size: 3rem;
}

.zone-status {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.zone-status.mastered {
  background: rgba(16,185,129,0.3);
  border: 1px solid #10b981;
}

.zone-status.progressing {
  background: rgba(251,191,36,0.3);
  border: 1px solid #fbbf24;
}

.zone-status.beginner {
  background: rgba(107,114,128,0.3);
  border: 1px solid #6b7280;
}

.zone-content {
  padding: 30px;
}

.zone-content h3 {
  font-size: 1.6rem;
  margin-bottom: 15px;
  text-align: center;
  color: #fbbf24;
}

.zone-content p {
  text-align: center;
  margin-bottom: 25px;
  opacity: 0.9;
}

.zone-features {
  display: flex;
  justify-content: space-around;
  margin-bottom: 25px;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 0.8rem;
  opacity: 0.8;
}

.zone-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  background: rgba(255,255,255,0.05);
  padding: 10px;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 5px;
}

.stat-value {
  font-weight: bold;
}

.zone-progress {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.rush {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.progress-fill.construction {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-fill.battle {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.progress-text {
  font-size: 0.9rem;
  text-align: center;
  opacity: 0.8;
}

/* Analytics */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.analytics-card {
  background: rgba(255,255,255,0.05);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.analytics-card h3 {
  margin-bottom: 20px;
  text-align: center;
  color: #fbbf24;
}

.performance-chart {
  height: 200px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  gap: 20px;
  align-items: end;
  height: 100%;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar {
  width: 40px;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.bar.rush {
  background: linear-gradient(to top, #ef4444, #f87171);
}

.bar.construction {
  background: linear-gradient(to top, #10b981, #34d399);
}

.bar.battle {
  background: linear-gradient(to top, #8b5cf6, #a78bfa);
}

.bar-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.learning-trends {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.trend-label {
  opacity: 0.8;
}

.trend-value {
  font-weight: bold;
  color: #fbbf24;
}

.weakness-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.weakness-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weakness-topic {
  font-weight: bold;
}

.weakness-score {
  color: #ef4444;
  font-weight: bold;
}

.weakness-bar {
  width: 100px;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  overflow: hidden;
}

.weakness-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f87171);
  transition: width 0.3s ease;
}

.recommended-zone {
  font-size: 0.8rem;
  color: #34d399;
  font-weight: bold;
}

/* Sessions */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.session-card {
  background: rgba(255,255,255,0.05);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.session-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.session-content {
  flex: 1;
}

.session-content h4 {
  margin-bottom: 5px;
  color: #fbbf24;
}

.session-content p {
  opacity: 0.8;
  margin-bottom: 10px;
}

.session-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.session-performance {
  text-align: center;
}

.performance-indicator {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
}

.performance-indicator.excellent {
  color: #10b981;
  background: rgba(16,185,129,0.2);
}

.performance-indicator.good {
  color: #fbbf24;
  background: rgba(251,191,36,0.2);
}

.performance-indicator.average {
  color: #3b82f6;
  background: rgba(59,130,246,0.2);
}

.performance-indicator.needs-improvement {
  color: #ef4444;
  background: rgba(239,68,68,0.2);
}

.session-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 40px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  padding: 25px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.action-card.continue-learning { border-color: rgba(16, 185, 129, 0.5); }
.action-card.daily-challenge { border-color: rgba(251, 191, 36, 0.5); }
.action-card.weakness-focus { border-color: rgba(239, 68, 68, 0.5); }
.action-card.random-battle { border-color: rgba(139, 92, 246, 0.5); }

.action-icon {
  font-size: 2rem;
}

.action-text {
  font-weight: bold;
  color: #94a3b8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.4);
}

.modal-body {
  padding: 25px;
  color: #94a3b8;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid rgba(99, 102, 241, 0.3);
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* Buttons */
.galaxy-button {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.galaxy-button-primary:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.galaxy-button-secondary {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.galaxy-button-secondary:hover {
  background: rgba(99, 102, 241, 0.3);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .zones-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendation-card {
    flex-direction: column;
    text-align: center;
  }
  
  .session-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>