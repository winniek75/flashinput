<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Compact Header -->
    <header class="relative z-10 px-6 py-3" v-if="gameState === 'playing'">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              @click="$router.push('/grammar-galaxy-hub')" 
              class="flex items-center gap-2 px-3 py-1 bg-slate-800/50 hover:bg-slate-700/70 rounded-lg transition-all border border-slate-600/50 text-sm"
            >
              <span>🌌</span>
              <span class="text-slate-300">文法銀河</span>
            </button>
            <h1 class="text-xl font-bold text-yellow-400">
              🔗 Conjunction Connection
            </h1>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="compact-stats">
              <span class="text-lg">🔗</span>
              <span class="text-sm font-bold text-yellow-400">{{ successfulConnections }}</span>
            </div>
            <div class="compact-stats">
              <span class="text-lg">⚡</span>
              <span class="text-sm font-bold text-yellow-400">{{ chainLength }}</span>
            </div>
            <div class="compact-stats">
              <span class="text-lg">⏰</span>
              <span class="text-sm font-bold text-yellow-400">{{ timeRemaining }}s</span>
            </div>
            <div class="compact-stats">
              <span class="text-sm text-slate-400">{{ currentRound }}/{{ totalRounds }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Introduction Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'introduction'">
      <div class="max-w-4xl mx-auto">
        <div class="galaxy-card p-8 mb-8">
          <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-6">📚 接続表現マスターガイド</h2>
          
          <!-- Compact Overview -->
          <div class="compact-overview mb-6">
            <p class="text-galaxy-moon-silver text-center text-lg mb-4">
              接続表現は文と文をつなげて、<strong>意味の関係</strong>を明確にする重要な言葉です。
            </p>
            <div class="quick-examples">
              <span class="example-tag">and (と)</span>
              <span class="example-tag">but (しかし)</span>
              <span class="example-tag">because (なぜなら)</span>
              <span class="example-tag">so (だから)</span>
            </div>
          </div>

          <!-- Tabbed Interface -->
          <div class="learning-tabs">
            <!-- Tab Navigation -->
            <div class="tab-navigation">
              <button 
                v-for="tab in conjunctionTabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="['tab-button', { 'active': activeTab === tab.id }]"
              >
                <span class="tab-icon">{{ tab.icon }}</span>
                <span class="tab-label">{{ tab.label }}</span>
              </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
              <!-- Basic Info Tab -->
              <div v-if="activeTab === 'basic'" class="tab-panel">
                <h3 class="panel-title">🌱 基本接続表現 (初級レベル)</h3>
                <div class="basic-conjunctions-grid">
                  <div class="basic-conjunction-card">
                    <div class="conjunction-icon">➕</div>
                    <div class="conjunction-name">AND</div>
                    <div class="conjunction-meaning">追加・並列</div>
                    <div class="conjunction-example">I like cats and dogs. (猫も犬も好き)</div>
                  </div>
                  <div class="basic-conjunction-card">
                    <div class="conjunction-icon">⚖️</div>
                    <div class="conjunction-name">BUT</div>
                    <div class="conjunction-meaning">対照・逆接</div>
                    <div class="conjunction-example">It's cold but sunny. (寒いけれど晴れ)</div>
                  </div>
                  <div class="basic-conjunction-card">
                    <div class="conjunction-icon">🔀</div>
                    <div class="conjunction-name">OR</div>
                    <div class="conjunction-meaning">選択</div>
                    <div class="conjunction-example">Tea or coffee? (紅茶かコーヒーか？)</div>
                  </div>
                  <div class="basic-conjunction-card">
                    <div class="conjunction-icon">➡️</div>
                    <div class="conjunction-name">SO</div>
                    <div class="conjunction-meaning">結果・因果</div>
                    <div class="conjunction-example">I'm tired, so I'll rest. (疲れたので休みます)</div>
                  </div>
                </div>
              </div>

              <!-- Advanced Info Tab -->
              <div v-if="activeTab === 'advanced'" class="tab-panel">
                <h3 class="panel-title">🚀 高度な表現 (中級・上級レベル)</h3>
                <div class="advanced-info">
                  <div class="level-section">
                    <h4 class="level-title">🌟 中級レベル</h4>
                    <div class="level-items">
                      <span class="level-item">BECAUSE (理由)</span>
                      <span class="level-item">ALTHOUGH (譲歩)</span>
                      <span class="level-item">WHILE (同時進行)</span>
                      <span class="level-item">SINCE (理由・時間)</span>
                    </div>
                  </div>
                  <div class="level-section">
                    <h4 class="level-title">🚀 上級レベル</h4>
                    <div class="level-items">
                      <span class="level-item">HOWEVER (しかし)</span>
                      <span class="level-item">THEREFORE (したがって)</span>
                      <span class="level-item">MOREOVER (さらに)</span>
                      <span class="level-item">NEVERTHELESS (それでも)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Game Rules Tab -->
              <div v-if="activeTab === 'rules'" class="tab-panel">
                <h3 class="panel-title">🎯 ゲームルール</h3>
                <div class="rules-grid">
                  <div class="rule-card">
                    <div class="rule-icon">🔗</div>
                    <div class="rule-title">接続方法</div>
                    <div class="rule-desc">左の文と右の文を正しい接続表現でつなげる</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">⛓️</div>
                    <div class="rule-title">チェーンボーナス</div>
                    <div class="rule-desc">連続正解でネットワーク強度UP</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">📊</div>
                    <div class="rule-title">スコア計算</div>
                    <div class="rule-desc">基本スコア + チェーンボーナス + スピードボーナス</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">🌐</div>
                    <div class="rule-title">勝利条件</div>
                    <div class="rule-desc">ネットワーク強度70%以上で構築成功</div>
                  </div>
                </div>
              </div>

              <!-- Learning Path Tab -->
              <div v-if="activeTab === 'levels'" class="tab-panel">
                <h3 class="panel-title">📚 学習の流れ</h3>
                <div class="learning-path">
                  <div class="path-step beginner">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <div class="step-title">🌱 初級 - 基本接続</div>
                      <div class="step-desc">AND, BUT, OR, SO を使ったシンプルな文の接続</div>
                    </div>
                  </div>
                  <div class="path-step intermediate">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">🌟 中級 - 従属接続</div>
                      <div class="step-desc">BECAUSE, ALTHOUGH, WHILE などで複文を作る</div>
                    </div>
                  </div>
                  <div class="path-step advanced">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <div class="step-title">🚀 上級 - 接続副詞</div>
                      <div class="step-desc">HOWEVER, THEREFORE などで高度な論理関係を表現</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <!-- Start Game Button -->
          <div class="start-section">
            <button 
              @click="gameState = 'setup'" 
              class="galaxy-button galaxy-button-primary text-xl font-bold py-4 px-8 rounded-xl"
            >
              🎮 接続ゲーム開始
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Compact Setup Screen -->
    <main class="relative z-10 px-6 py-8" v-if="gameState === 'setup'">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-yellow-400 cosmic-title mb-2">
            🔗 Conjunction Connection
          </h1>
          <p class="text-slate-400">接続表現パズルゲーム</p>
        </div>
        
        <div class="galaxy-card p-6">
          <div class="setup-grid">
            <!-- Difficulty Selection -->
            <div class="setup-section">
              <h3 class="text-lg font-bold galaxy-text-primary mb-4">🎮 難易度</h3>
              <div class="compact-options">
                <button 
                  v-for="level in difficultyLevels" 
                  :key="level.id"
                  class="compact-option"
                  :class="{ 'selected': selectedDifficulty === level.id }"
                  @click="selectedDifficulty = level.id"
                >
                  <span class="option-icon">{{ level.icon }}</span>
                  <span class="option-name">{{ level.name }}</span>
                  <span class="option-desc">{{ level.description }}</span>
                </button>
              </div>
            </div>

            <!-- Game Mode Selection -->
            <div class="setup-section">
              <h3 class="text-lg font-bold galaxy-text-primary mb-4">🧩 モード</h3>
              <div class="compact-options">
                <button 
                  v-for="mode in gameModes" 
                  :key="mode.id"
                  class="compact-option"
                  :class="{ 'selected': selectedMode === mode.id }"
                  @click="selectedMode = mode.id"
                >
                  <span class="option-icon">{{ mode.icon }}</span>
                  <span class="option-name">{{ mode.name }}</span>
                  <span class="option-desc">{{ mode.description }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Start Button -->
          <div class="text-center mt-6">
            <button 
              @click="startGame"
              class="galaxy-button galaxy-button-large"
              :disabled="!selectedDifficulty || !selectedMode"
            >
              <span class="text-xl mr-2">🚀</span>
              <span>接続開始！</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Compact Game Area -->
    <main class="relative z-10 px-6 pb-16" v-if="gameState === 'playing'">
      <div class="max-w-5xl mx-auto">
        <!-- Connection Arena -->
        <div class="galaxy-card p-4">
          <div class="connection-arena">
            <!-- Compact Network Info -->
            <div class="flex items-center justify-between mb-4">
              <div class="network-strength-compact">
                <span class="text-green-400 text-sm font-bold">📡 {{ networkStrength }}%</span>
                <div class="strength-bar-small">
                  <div class="strength-fill" :style="{ width: networkStrength + '%' }"></div>
                </div>
              </div>
              <div class="challenge-type-badge" :class="currentChallenge?.type">
                {{ getConjunctionTypeName(currentChallenge?.type) }}
              </div>
            </div>

            <!-- Compact Connection Challenge -->
            <div class="connection-challenge" v-if="currentChallenge">
              <!-- Horizontal Sentence Layout -->
              <div class="horizontal-sentence-layout">
                <div class="sentence-part left-sentence">
                  <p class="sentence-text">{{ currentChallenge.leftSentence }}</p>
                </div>
                
                <div class="conjunction-selector">
                  <div class="selector-label">接続詞を選択</div>
                  <div class="connection-options-horizontal">
                    <button 
                      v-for="option in currentChallenge.options" 
                      :key="option.id"
                      class="connection-option-compact"
                      :class="{ 
                        'selected': selectedConjunction === option.id,
                        'correct': showResult && option.isCorrect,
                        'incorrect': showResult && selectedConjunction === option.id && !option.isCorrect
                      }"
                      @click="selectConjunction(option.id)"
                    >
                      <span class="option-text-compact">{{ option.conjunction }}</span>
                    </button>
                  </div>
                </div>
                
                <div class="sentence-part right-sentence">
                  <p class="sentence-text">{{ currentChallenge.rightSentence }}</p>
                </div>
              </div>
            </div>

            <!-- Compact Action Section -->
            <div class="action-section-compact" v-if="selectedConjunction && !showResult">
              <button @click="makeConnection" class="connect-button-compact">
                <span>🔗</span>
                <span>「{{ getSelectedConjunctionText() }}」で接続！</span>
              </button>
            </div>

            <!-- Compact Result Display -->
            <div class="result-section-compact" v-if="showResult">
              <div class="result-inline" :class="{ 'correct': lastConnectionCorrect, 'incorrect': !lastConnectionCorrect }">
                <div class="result-status">
                  <span class="result-icon">{{ lastConnectionCorrect ? '✅' : '❌' }}</span>
                  <span class="result-text">{{ lastConnectionCorrect ? '接続成功！' : '接続失敗...' }}</span>
                  <span v-if="lastConnectionCorrect && chainLength > 1" class="chain-bonus">+{{ chainLength }}チェーン！</span>
                </div>
                <div class="complete-sentence-inline" v-if="lastConnectionCorrect">
                  {{ currentChallenge?.leftSentence }} <span class="highlight-conjunction">{{ getSelectedConjunctionText() }}</span> {{ currentChallenge?.rightSentence }}
                </div>
                <div class="explanation-inline">{{ currentChallenge?.explanation }}</div>
                <button @click="nextConnection" class="continue-button-compact">
                  {{ currentRound < totalRounds ? '次へ →' : '結果を見る' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chain Bonus Display -->
        <div class="chain-bonus-display" v-if="chainLength > 2">
          <div class="chain-bonus-text">{{ chainLength }} CHAIN BONUS!</div>
          <div class="chain-bonus-effect">⛓️</div>
        </div>
      </div>
    </main>

    <!-- Compact Results Screen -->
    <main class="relative z-10 px-6 py-8" v-if="gameState === 'results'">
      <div class="max-w-4xl mx-auto">
        <div class="galaxy-card p-6">
          <!-- Result Header -->
          <div class="text-center mb-6">
            <div class="result-icon-large">{{ networkStrength >= 70 ? '🌐' : '📡' }}</div>
            <h2 class="text-2xl font-bold galaxy-text-primary mb-2">
              {{ networkStrength >= 70 ? 'ネットワーク構築完了！' : 'ネットワーク不安定...' }}
            </h2>
            <p class="text-slate-400">最終強度: {{ networkStrength }}%</p>
          </div>
          
          <!-- Compact Stats -->
          <div class="results-grid">
            <div class="results-section">
              <h3 class="section-title">📊 結果</h3>
              <div class="compact-stats-grid">
                <div class="compact-stat">
                  <span class="stat-icon">🔗</span>
                  <span class="stat-value">{{ successfulConnections }}</span>
                  <span class="stat-label">成功接続</span>
                </div>
                <div class="compact-stat">
                  <span class="stat-icon">⛓️</span>
                  <span class="stat-value">{{ maxChainLength }}</span>
                  <span class="stat-label">最大チェーン</span>
                </div>
                <div class="compact-stat">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-value">{{ Math.round(accuracy * 100) }}%</span>
                  <span class="stat-label">成功率</span>
                </div>
                <div class="compact-stat">
                  <span class="stat-icon">💰</span>
                  <span class="stat-value">{{ totalScore }}</span>
                  <span class="stat-label">スコア</span>
                </div>
              </div>
            </div>

            <div class="results-section" v-if="masteredTypes.length > 0">
              <h3 class="section-title">🏆 習得表現</h3>
              <div class="mastered-types-compact">
                <div 
                  v-for="type in masteredTypes" 
                  :key="type.id" 
                  class="mastered-type-compact"
                >
                  <span class="type-icon">{{ type.icon }}</span>
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-accuracy">{{ type.accuracy }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Achievements Compact -->
          <div v-if="earnedAchievements.length > 0" class="achievements-compact">
            <h3 class="section-title">🏅 達成バッジ</h3>
            <div class="badges-inline">
              <span 
                v-for="achievement in earnedAchievements" 
                :key="achievement.id" 
                class="badge-compact"
                :title="achievement.description"
              >
                {{ achievement.icon }} {{ achievement.name }}
              </span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 mt-6">
            <button @click="restartGame" class="galaxy-button galaxy-button-secondary">
              🔄 もう一度
            </button>
            <button @click="$router.push('/grammar-galaxy-hub')" class="galaxy-button galaxy-button-primary">
              🌌 文法銀河へ戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 統一フッターナビゲーション -->
    <CommonFooter 
      :active="'grammar'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'ConjunctionConnectionGame',
  components: {
    CommonFooter
  },
  setup() {
    const router = useRouter()

    // Game state
    const gameState = ref('introduction') // introduction, setup, playing, results
    const selectedDifficulty = ref('beginner')
    const selectedMode = ref('classic')
    
    // Introduction screen state
    const activeTab = ref('basic')
    const conjunctionTabs = [
      {
        id: 'basic',
        icon: '🌱',
        label: '基本接続詞'
      },
      {
        id: 'advanced',
        icon: '🚀',
        label: '高度な表現'
      },
      {
        id: 'rules',
        icon: '🎯',
        label: 'ゲームルール'
      },
      {
        id: 'levels',
        icon: '📚',
        label: '学習の流れ'
      }
    ]
    const currentRound = ref(0)
    const totalRounds = ref(10)
    const timeRemaining = ref(60)
    const gameTimer = ref(null)

    // Connection state
    const networkStrength = ref(0)
    const currentChallenge = ref(null)
    const selectedConjunction = ref(null)
    const showResult = ref(false)
    const lastConnectionCorrect = ref(false)

    // Performance tracking
    const successfulConnections = ref(0)
    const totalAttempts = ref(0)
    const chainLength = ref(0)
    const maxChainLength = ref(0)
    const totalScore = ref(0)
    const masteredTypes = ref([])
    const earnedAchievements = ref([])

    // Game configuration
    const difficultyLevels = [
      {
        id: 'beginner',
        name: '基本接続',
        icon: '🔗',
        description: 'and, but, or, so',
        features: ['基本接続詞', '短文', '明確な関係']
      },
      {
        id: 'intermediate',
        name: '応用接続',
        icon: '⛓️',
        description: 'because, although, while',
        features: ['従属接続詞', '複文', '論理関係']
      },
      {
        id: 'advanced',
        name: '高度接続',
        icon: '🌐',
        description: 'however, therefore, moreover',
        features: ['接続副詞', '長文', '複雑な論理']
      }
    ]

    const gameModes = [
      {
        id: 'classic',
        name: 'クラシック接続',
        icon: '🔗',
        description: '標準的な接続練習'
      },
      {
        id: 'chain',
        name: 'チェーン接続',
        icon: '⛓️',
        description: '連続接続でボーナス獲得'
      },
      {
        id: 'network',
        name: 'ネットワーク構築',
        icon: '🌐',
        description: '複雑なネットワーク作成'
      }
    ]

    // Conjunction challenges database
    const conjunctionChallenges = [
      // Beginner Level - Basic conjunctions
      {
        id: 'and_addition_1',
        level: 'beginner',
        type: 'addition',
        leftSentence: '私は本を読みます',
        rightSentence: '音楽を聴きます',
        options: [
          { id: 'a', conjunction: 'and', isCorrect: true },
          { id: 'b', conjunction: 'but', isCorrect: false },
          { id: 'c', conjunction: 'or', isCorrect: false },
          { id: 'd', conjunction: 'so', isCorrect: false }
        ],
        explanation: 'and は追加・並列の関係を表します。2つの行動を並べる時に使います。'
      },
      {
        id: 'but_contrast_1',
        level: 'beginner',
        type: 'contrast',
        leftSentence: '彼は忙しいです',
        rightSentence: '毎日運動します',
        options: [
          { id: 'a', conjunction: 'but', isCorrect: true },
          { id: 'b', conjunction: 'and', isCorrect: false },
          { id: 'c', conjunction: 'or', isCorrect: false },
          { id: 'd', conjunction: 'so', isCorrect: false }
        ],
        explanation: 'but は対照・逆接の関係を表します。忙しいのに運動するという対照的な状況です。'
      },
      {
        id: 'or_choice_1',
        level: 'beginner',
        type: 'choice',
        leftSentence: 'コーヒーを飲みますか',
        rightSentence: '紅茶を飲みますか',
        options: [
          { id: 'a', conjunction: 'or', isCorrect: true },
          { id: 'b', conjunction: 'and', isCorrect: false },
          { id: 'c', conjunction: 'but', isCorrect: false },
          { id: 'd', conjunction: 'so', isCorrect: false }
        ],
        explanation: 'or は選択の関係を表します。2つの選択肢から1つを選ぶ時に使います。'
      },
      {
        id: 'so_result_1',
        level: 'beginner',
        type: 'result',
        leftSentence: '雨が降っています',
        rightSentence: '傘を持って行きます',
        options: [
          { id: 'a', conjunction: 'so', isCorrect: true },
          { id: 'b', conjunction: 'but', isCorrect: false },
          { id: 'c', conjunction: 'and', isCorrect: false },
          { id: 'd', conjunction: 'or', isCorrect: false }
        ],
        explanation: 'so は結果・因果関係を表します。雨が原因で傘を持つという結果です。'
      },

      // Intermediate Level - Subordinating conjunctions
      {
        id: 'because_reason_1',
        level: 'intermediate',
        type: 'reason',
        leftSentence: '今日は家にいます',
        rightSentence: '体調が悪いからです',
        options: [
          { id: 'a', conjunction: 'because', isCorrect: true },
          { id: 'b', conjunction: 'although', isCorrect: false },
          { id: 'c', conjunction: 'while', isCorrect: false },
          { id: 'd', conjunction: 'since', isCorrect: false }
        ],
        explanation: 'because は理由を表します。家にいる理由が体調不良だということです。'
      },
      {
        id: 'although_concession_1',
        level: 'intermediate',
        type: 'concession',
        leftSentence: '彼は若いです',
        rightSentence: 'とても経験豊富です',
        options: [
          { id: 'a', conjunction: 'although', isCorrect: true },
          { id: 'b', conjunction: 'because', isCorrect: false },
          { id: 'c', conjunction: 'when', isCorrect: false },
          { id: 'd', conjunction: 'if', isCorrect: false }
        ],
        explanation: 'although は譲歩を表します。若いにも関わらず経験豊富という対照的な関係です。'
      },
      {
        id: 'while_time_1',
        level: 'intermediate',
        type: 'time',
        leftSentence: '私は勉強します',
        rightSentence: '弟はゲームをします',
        options: [
          { id: 'a', conjunction: 'while', isCorrect: true },
          { id: 'b', conjunction: 'after', isCorrect: false },
          { id: 'c', conjunction: 'before', isCorrect: false },
          { id: 'd', conjunction: 'until', isCorrect: false }
        ],
        explanation: 'while は同時進行を表します。勉強とゲームが同じ時間に行われています。'
      },

      // Advanced Level - Conjunctive adverbs
      {
        id: 'however_contrast_1',
        level: 'advanced',
        type: 'contrast',
        leftSentence: '計画は完璧でした',
        rightSentence: '実行に問題がありました',
        options: [
          { id: 'a', conjunction: 'however', isCorrect: true },
          { id: 'b', conjunction: 'therefore', isCorrect: false },
          { id: 'c', conjunction: 'moreover', isCorrect: false },
          { id: 'd', conjunction: 'furthermore', isCorrect: false }
        ],
        explanation: 'however は強い対照を表す接続副詞です。計画と実行の対照的な状況を示します。'
      },
      {
        id: 'therefore_conclusion_1',
        level: 'advanced',
        type: 'conclusion',
        leftSentence: '売上が大幅に増加しました',
        rightSentence: '新しい店舗を開店することになりました',
        options: [
          { id: 'a', conjunction: 'therefore', isCorrect: true },
          { id: 'b', conjunction: 'however', isCorrect: false },
          { id: 'c', conjunction: 'meanwhile', isCorrect: false },
          { id: 'd', conjunction: 'nevertheless', isCorrect: false }
        ],
        explanation: 'therefore は結論を表す接続副詞です。売上増加から新店舗開店という結論に至っています。'
      },
      {
        id: 'moreover_addition_1',
        level: 'advanced',
        type: 'addition',
        leftSentence: 'この製品は高品質です',
        rightSentence: '価格も手頃です',
        options: [
          { id: 'a', conjunction: 'moreover', isCorrect: true },
          { id: 'b', conjunction: 'however', isCorrect: false },
          { id: 'c', conjunction: 'nonetheless', isCorrect: false },
          { id: 'd', conjunction: 'instead', isCorrect: false }
        ],
        explanation: 'moreover は追加情報を表す接続副詞です。高品質に加えて手頃な価格という利点を追加しています。'
      }
    ]

    // Computed properties
    const accuracy = computed(() => {
      return totalAttempts.value > 0 ? successfulConnections.value / totalAttempts.value : 0
    })

    // Methods
    const getConjunctionTypeName = (type) => {
      const types = {
        addition: '追加',
        contrast: '対照',
        choice: '選択',
        result: '結果',
        reason: '理由',
        concession: '譲歩',
        time: '時間',
        conclusion: '結論'
      }
      return types[type] || type
    }

    const startGame = () => {
      const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
      totalRounds.value = selectedMode.value === 'network' ? 15 : 10
      timeRemaining.value = selectedMode.value === 'chain' ? 45 : 60
      
      currentRound.value = 1
      successfulConnections.value = 0
      totalAttempts.value = 0
      chainLength.value = 0
      maxChainLength.value = 0
      totalScore.value = 0
      networkStrength.value = 0
      masteredTypes.value = []
      earnedAchievements.value = []
      
      gameState.value = 'playing'
      generateChallenge()
      startTimer()
    }

    const generateChallenge = () => {
      const difficultyLevel = selectedDifficulty.value
      const availableChallenges = conjunctionChallenges.filter(c => c.level === difficultyLevel)
      const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
      
      currentChallenge.value = {
        ...randomChallenge,
        options: [...randomChallenge.options].sort(() => Math.random() - 0.5)
      }
      
      selectedConjunction.value = null
      showResult.value = false
    }

    const selectConjunction = (conjunctionId) => {
      if (showResult.value) return
      selectedConjunction.value = conjunctionId
    }

    const getSelectedConjunctionText = () => {
      if (!selectedConjunction.value || !currentChallenge.value) return ''
      const option = currentChallenge.value.options.find(o => o.id === selectedConjunction.value)
      return option ? option.conjunction : ''
    }

    const makeConnection = () => {
      if (!selectedConjunction.value || showResult.value) return
      
      const correctOption = currentChallenge.value.options.find(o => o.isCorrect)
      const isCorrect = selectedConjunction.value === correctOption.id
      
      totalAttempts.value++
      lastConnectionCorrect.value = isCorrect
      
      if (isCorrect) {
        successfulConnections.value++
        chainLength.value++
        maxChainLength.value = Math.max(maxChainLength.value, chainLength.value)
        
        // Update network strength
        const strengthIncrease = 100 / totalRounds.value
        const chainBonus = Math.min(chainLength.value * 2, 20)
        networkStrength.value = Math.min(100, networkStrength.value + strengthIncrease + chainBonus)
        
        // Score calculation
        const baseScore = 100
        const chainScore = chainLength.value * 50
        const speedBonus = timeRemaining.value > 45 ? 25 : 0
        const score = baseScore + chainScore + speedBonus
        totalScore.value += score
        
        // Update mastered types
        updateMasteredTypes(currentChallenge.value.type)
        
        // Check for achievements
        checkAchievements()
      } else {
        chainLength.value = 0
      }
      
      showResult.value = true
    }

    const updateMasteredTypes = (type) => {
      const existingType = masteredTypes.value.find(t => t.id === type)
      if (existingType) {
        existingType.attempts++
        existingType.successes++
        existingType.accuracy = Math.round((existingType.successes / existingType.attempts) * 100)
      } else {
        const typeInfo = {
          addition: { name: '追加表現', icon: '➕' },
          contrast: { name: '対照表現', icon: '⚖️' },
          choice: { name: '選択表現', icon: '🔀' },
          result: { name: '結果表現', icon: '➡️' },
          reason: { name: '理由表現', icon: '🤔' },
          concession: { name: '譲歩表現', icon: '🤲' },
          time: { name: '時間表現', icon: '⏰' },
          conclusion: { name: '結論表現', icon: '🎯' }
        }
        
        masteredTypes.value.push({
          id: type,
          name: typeInfo[type]?.name || type,
          icon: typeInfo[type]?.icon || '🔗',
          attempts: 1,
          successes: 1,
          accuracy: 100
        })
      }
    }

    const checkAchievements = () => {
      const achievements = [
        {
          id: 'first_connection',
          name: '初回接続',
          icon: '🔗',
          description: '最初の接続に成功',
          condition: () => successfulConnections.value === 1
        },
        {
          id: 'chain_master',
          name: 'チェーンマスター',
          icon: '⛓️',
          description: '5連続接続成功',
          condition: () => chainLength.value >= 5
        },
        {
          id: 'network_builder',
          name: 'ネットワーク構築者',
          icon: '🌐',
          description: 'ネットワーク強度80%達成',
          condition: () => networkStrength.value >= 80
        },
        {
          id: 'conjunction_expert',
          name: '接続表現エキスパート',
          icon: '🎓',
          description: '全ての接続タイプをマスター',
          condition: () => masteredTypes.value.length >= 4
        },
        {
          id: 'perfect_chain',
          name: 'パーフェクトチェーン',
          icon: '💫',
          description: '10連続接続成功',
          condition: () => chainLength.value >= 10
        }
      ]
      
      achievements.forEach(achievement => {
        if (achievement.condition() && !earnedAchievements.value.find(a => a.id === achievement.id)) {
          earnedAchievements.value.push(achievement)
        }
      })
    }

    const nextConnection = () => {
      if (currentRound.value < totalRounds.value) {
        currentRound.value++
        generateChallenge()
      } else {
        endGame()
      }
    }

    const startTimer = () => {
      gameTimer.value = setInterval(() => {
        timeRemaining.value--
        if (timeRemaining.value <= 0) {
          endGame()
        }
      }, 1000)
    }

    const endGame = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
        gameTimer.value = null
      }
      gameState.value = 'results'
      checkAchievements()
    }

    const restartGame = () => {
      gameState.value = 'setup'
      selectedDifficulty.value = 'beginner'
      selectedMode.value = 'classic'
    }

    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure');
          break;
        case 'grammar':
          router.push('/grammar-galaxy-hub');
          break;
        case 'multi-layer':
          router.push('/multi-layer');
          break;
        case 'co-pilot':
          router.push('/co-pilot-dock');
          break;
        case 'vr-academy':
          router.push('/vr-academy');
          break;
        default:
          console.warn('Unknown navigation section:', section);
      }
    };

    // Lifecycle
    onMounted(() => {
      // Initialize game
    })

    onUnmounted(() => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
      }
    })

    return {
      // State
      gameState,
      selectedDifficulty,
      selectedMode,
      currentRound,
      totalRounds,
      timeRemaining,
      networkStrength,
      currentChallenge,
      selectedConjunction,
      showResult,
      lastConnectionCorrect,
      
      // Introduction screen
      activeTab,
      conjunctionTabs,
      
      // Performance
      successfulConnections,
      totalAttempts,
      chainLength,
      maxChainLength,
      totalScore,
      masteredTypes,
      earnedAchievements,
      
      // Configuration
      difficultyLevels,
      gameModes,
      
      // Computed
      accuracy,
      
      // Methods
      getConjunctionTypeName,
      startGame,
      selectConjunction,
      getSelectedConjunctionText,
      makeConnection,
      nextConnection,
      restartGame,
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
  @apply flex items-center gap-3 px-4 py-3 rounded-xl border transition-all;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
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
  @apply rounded-3xl border backdrop-blur-sm transition-all;
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(99, 102, 241, 0.3);
}

.galaxy-card:hover {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
}

/* Progress Bar */
.progress-bar-container {
  @apply w-full bg-slate-700 rounded-full h-3 overflow-hidden;
}

.progress-bar {
  @apply h-full rounded-full relative;
  background: linear-gradient(90deg, #1e293b, #334155);
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500;
}

.progress-fill.conjunction {
  background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

/* Difficulty Selection */
.difficulty-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.difficulty-card {
  @apply p-6 rounded-2xl border-2 cursor-pointer transition-all text-center;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.difficulty-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-2px);
}

.difficulty-card.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.difficulty-icon {
  @apply text-4xl mb-3;
}

.difficulty-title {
  @apply text-xl font-bold text-yellow-400 mb-2;
}

.difficulty-description {
  @apply text-slate-400 mb-4;
}

.difficulty-features {
  @apply flex flex-wrap gap-2 justify-center;
}

.feature-tag {
  @apply px-2 py-1 text-xs rounded-full;
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Mode Selection */
.mode-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.mode-card {
  @apply p-6 rounded-2xl border-2 cursor-pointer transition-all text-center;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.mode-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-2px);
}

.mode-card.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.mode-icon {
  @apply text-4xl mb-3;
}

.mode-title {
  @apply text-xl font-bold text-yellow-400 mb-2;
}

.mode-description {
  @apply text-slate-400;
}

/* Network Display */
.network-display {
  @apply text-center;
}

.network-strength {
  @apply inline-flex items-center gap-3 p-4 rounded-xl;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.strength-icon {
  @apply text-2xl;
}

.strength-text {
  @apply text-lg font-bold text-green-400;
}

.strength-bar {
  @apply w-32 h-2 bg-slate-700 rounded-full overflow-hidden;
}

.strength-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500;
}

/* Connection Arena */
.connection-arena {
  @apply space-y-6;
}

.challenge-type-badge {
  @apply inline-block px-4 py-2 rounded-full text-sm font-bold mb-6;
}

.challenge-type-badge.addition {
  @apply bg-blue-500/20 text-blue-400 border border-blue-500/50;
}

.challenge-type-badge.contrast {
  @apply bg-red-500/20 text-red-400 border border-red-500/50;
}

.challenge-type-badge.choice {
  @apply bg-purple-500/20 text-purple-400 border border-purple-500/50;
}

.challenge-type-badge.result {
  @apply bg-green-500/20 text-green-400 border border-green-500/50;
}

.challenge-type-badge.reason {
  @apply bg-yellow-500/20 text-yellow-400 border border-yellow-500/50;
}

.challenge-type-badge.concession {
  @apply bg-orange-500/20 text-orange-400 border border-orange-500/50;
}

.challenge-type-badge.time {
  @apply bg-indigo-500/20 text-indigo-400 border border-indigo-500/50;
}

.challenge-type-badge.conclusion {
  @apply bg-pink-500/20 text-pink-400 border border-pink-500/50;
}

/* Sentence Fragments */
.sentence-fragments {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6 items-center mb-8;
}

.fragment {
  @apply relative p-6 rounded-2xl border-2 text-center;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.fragment-left {
  @apply lg:justify-self-end;
}

.fragment-right {
  @apply lg:justify-self-start;
}

.fragment-icon {
  @apply text-3xl mb-3;
}

.fragment-content {
  @apply mb-4;
}

.fragment-text {
  @apply text-lg font-medium text-slate-200;
}

.connection-port {
  @apply absolute w-4 h-4 bg-green-400 rounded-full border-2 border-green-600;
  top: 50%;
  transform: translateY(-50%);
}

.port-right {
  right: -8px;
}

.port-left {
  left: -8px;
}

/* Connection Options */
.connection-options {
  @apply grid grid-cols-1 gap-3;
}

.connection-option {
  @apply p-4 rounded-xl border-2 cursor-pointer transition-all text-center;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.connection-option:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-2px);
}

.connection-option.selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}

.connection-option.connecting {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.connection-option.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.connection-option.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.option-text {
  @apply text-xl font-bold text-green-400 mb-1;
}

.option-meaning {
  @apply text-sm text-slate-400;
}

/* Connection Cable */
.connection-cable {
  @apply relative h-2 mx-8 lg:mx-0;
  background: linear-gradient(90deg, transparent, #22c55e, transparent);
  border-radius: 1px;
}

.cable-animation {
  @apply absolute inset-0 rounded-full;
  background: linear-gradient(90deg, transparent, #ffffff, transparent);
  animation: flow 1s infinite;
}

@keyframes flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Connect Section */
.connect-section {
  @apply text-center;
}

.connect-button {
  @apply px-8 py-4 rounded-xl font-bold text-xl transition-all;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: 2px solid #22c55e;
}

.connect-button:hover {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  transform: scale(1.05);
}

.connect-icon {
  @apply mr-2;
}

/* Result Display */
.result-section {
  @apply text-center space-y-4;
}

.result-card {
  @apply p-6 rounded-2xl border-2 flex items-center gap-4;
  background: rgba(15, 23, 42, 0.9);
}

.result-card.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.result-card.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.result-icon {
  @apply text-4xl;
}

.result-content {
  @apply flex-1 text-left;
}

.result-content h3 {
  @apply text-xl font-bold mb-2;
}

.result-explanation {
  @apply text-slate-400 mb-3;
}

.complete-sentence {
  @apply p-3 rounded-xl;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.highlight-conjunction {
  @apply font-bold text-green-400;
  background: rgba(34, 197, 94, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.chain-display {
  @apply text-right;
}

.chain-number {
  @apply text-2xl font-bold text-green-400;
  animation: bounce 0.5s ease-in-out;
}

.chain-text {
  @apply text-sm text-green-400 block;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.continue-button {
  @apply px-6 py-3 rounded-xl font-bold transition-all;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.continue-button:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
}

/* Chain Bonus Display */
.chain-bonus-display {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center;
  animation: chainShow 1.5s ease-out;
}

@keyframes chainShow {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

.chain-bonus-text {
  @apply text-4xl font-bold text-green-400 mb-2;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
}

.chain-bonus-effect {
  @apply text-6xl;
  animation: swing 1.5s ease-in-out infinite;
}

@keyframes swing {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}

/* Results Screen */
.network-status-banner {
  @apply p-8 rounded-2xl border-2;
}

.network-status-banner.strong {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.network-status-banner.weak {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.banner-icon {
  @apply text-8xl mb-4;
}

.banner-title {
  @apply text-4xl font-bold mb-2;
}

.banner-subtitle {
  @apply text-xl text-slate-400 mb-4;
}

.network-strength-final {
  @apply text-2xl font-bold text-green-400;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-6;
}

.stat-item {
  @apply text-center p-4 rounded-xl;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

/* Introduction Screen Styles */
.compact-overview {
  @apply text-center space-y-4;
}

.quick-examples {
  @apply flex flex-wrap justify-center gap-2;
}

.example-tag {
  @apply px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30;
}

/* Tabbed Interface */
.learning-tabs {
  @apply space-y-6;
}

.tab-navigation {
  @apply flex flex-wrap justify-center gap-2 p-4 bg-slate-800/30 rounded-xl border border-slate-600/30;
}

.tab-button {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600/30 bg-slate-800/50 text-slate-300 transition-all cursor-pointer;
}

.tab-button:hover {
  @apply border-blue-500/50 bg-blue-500/10 text-blue-300;
}

.tab-button.active {
  @apply border-emerald-500/50 bg-emerald-500/20 text-emerald-300;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.tab-icon {
  @apply text-lg;
}

.tab-label {
  @apply font-medium;
}

.tab-content {
  @apply bg-slate-800/30 rounded-xl border border-slate-600/30 p-6;
}

.tab-panel {
  @apply space-y-6;
}

.panel-title {
  @apply text-xl font-bold text-center galaxy-text-primary mb-6;
}

/* Basic Conjunctions Grid */
.basic-conjunctions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.basic-conjunction-card {
  @apply bg-slate-800/50 rounded-lg p-4 border border-slate-600/30 text-center space-y-2;
}

.conjunction-icon {
  @apply text-2xl;
}

.conjunction-name {
  @apply font-bold text-emerald-400 text-lg;
}

.conjunction-meaning {
  @apply text-slate-300 text-sm;
}

.conjunction-example {
  @apply text-xs text-slate-400 italic;
}

/* Advanced info styles */
.advanced-info {
  @apply space-y-6;
}

.level-section {
  @apply space-y-3;
}

.level-title {
  @apply text-lg font-bold text-center;
}

.level-items {
  @apply flex flex-wrap justify-center gap-2;
}

.level-item {
  @apply px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300 border border-slate-600/30;
}

/* Rules grid */
.rules-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.rule-card {
  @apply bg-slate-800/50 rounded-lg p-4 border border-slate-600/30 text-center space-y-2;
}

.rule-icon {
  @apply text-2xl;
}

.rule-title {
  @apply font-bold text-emerald-400;
}

.rule-desc {
  @apply text-sm text-slate-300;
}

/* Learning path */
.learning-path {
  @apply space-y-4;
}

.path-step {
  @apply flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600/30;
}

.path-step.beginner {
  @apply border-green-500/30;
}

.path-step.intermediate {
  @apply border-yellow-500/30;
}

.path-step.advanced {
  @apply border-red-500/30;
}

.step-number {
  @apply w-10 h-10 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply font-bold text-lg;
}

.step-desc {
  @apply text-sm text-slate-300;
}

/* Start section */
.start-section {
  @apply text-center mt-8;
}

.start-section button {
  @apply transform transition-all duration-300;
}

.start-section button:hover {
  @apply scale-105;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}

/* Setup Screen Compact Styles */
.setup-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.setup-section {
  @apply space-y-4;
}

.compact-options {
  @apply space-y-3;
}

.compact-option {
  @apply p-4 rounded-xl border border-slate-600/30 bg-slate-800/50 text-left transition-all cursor-pointer space-y-1;
}

.compact-option:hover {
  @apply border-emerald-500/50 bg-emerald-500/10;
}

.compact-option.selected {
  @apply border-emerald-500 bg-emerald-500/20;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
}

.option-icon {
  @apply text-2xl;
}

.option-name {
  @apply font-bold text-emerald-400;
}

.option-desc {
  @apply text-sm text-slate-300;
}

/* Compact Stats */
.compact-stats {
  @apply flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-600/30;
}

.compact-stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.compact-stat {
  @apply text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/30 space-y-1;
}

.stat-icon {
  @apply text-xl;
}

.stat-value {
  @apply text-lg font-bold text-emerald-400;
}

.stat-label {
  @apply text-xs text-slate-400;
}

/* Horizontal Layout Styles */
.horizontal-sentence-layout {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-4 items-center;
}

.sentence-part {
  @apply p-4 bg-slate-800/50 rounded-lg border border-slate-600/30 text-center;
}

.sentence-text {
  @apply text-lg text-slate-200;
}

.conjunction-selector {
  @apply text-center;
}

.selector-label {
  @apply text-sm text-slate-400 mb-2;
}

.connection-options-horizontal {
  @apply grid grid-cols-2 gap-2;
}

.connection-option-compact {
  @apply p-3 rounded-lg border border-slate-600/30 bg-slate-800/50 text-center transition-all cursor-pointer;
}

.connection-option-compact:hover {
  @apply border-emerald-500/50 bg-emerald-500/10;
}

.connection-option-compact.selected {
  @apply border-emerald-500 bg-emerald-500/20;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.connection-option-compact.correct {
  @apply border-green-500 bg-green-500/20;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.connection-option-compact.incorrect {
  @apply border-red-500 bg-red-500/20;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
}

.option-text-compact {
  @apply font-bold text-emerald-400;
}

/* Network Strength Compact */
.network-strength-compact {
  @apply flex items-center gap-2;
}

.strength-bar-small {
  @apply w-16 h-2 bg-slate-700 rounded-full overflow-hidden;
}

/* Action Section Compact */
.action-section-compact {
  @apply text-center mt-4;
}

.connect-button-compact {
  @apply px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all;
}

.connect-button-compact:hover {
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

/* Result Section Compact */
.result-section-compact {
  @apply mt-4;
}

.result-inline {
  @apply p-4 rounded-lg border space-y-2;
}

.result-inline.correct {
  @apply border-green-500/50 bg-green-500/10;
}

.result-inline.incorrect {
  @apply border-red-500/50 bg-red-500/10;
}

.result-status {
  @apply flex items-center justify-center gap-2;
}

.result-icon {
  @apply text-xl;
}

.result-text {
  @apply font-bold;
}

.chain-bonus {
  @apply text-emerald-400 text-sm;
}

.complete-sentence-inline {
  @apply text-center text-slate-200 p-2 bg-slate-800/50 rounded;
}

.explanation-inline {
  @apply text-sm text-slate-400 text-center;
}

.continue-button-compact {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-all;
}

/* Results Screen Compact */
.results-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.results-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-bold text-center galaxy-text-primary;
}

.result-icon-large {
  @apply text-6xl;
}

.mastered-types-compact {
  @apply space-y-2;
}

.mastered-type-compact {
  @apply flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-600/30;
}

.type-icon {
  @apply text-lg;
}

.type-name {
  @apply text-sm font-medium text-slate-300;
}

.type-accuracy {
  @apply text-sm font-bold text-emerald-400;
}

.achievements-compact {
  @apply space-y-3;
}

.badges-inline {
  @apply flex flex-wrap gap-2;
}

.badge-compact {
  @apply px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30;
}

.stat-value {
  @apply text-2xl font-bold text-yellow-400 mb-1;
}

.stat-label {
  @apply text-sm text-slate-400;
}

/* Mastered Types */
.mastered-types-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.mastered-type-card {
  @apply p-4 rounded-xl text-center;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid #22c55e;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.2);
}

.type-icon {
  @apply text-3xl mb-2;
}

.type-name {
  @apply text-lg font-bold text-green-400 mb-1;
}

.type-accuracy {
  @apply text-sm text-slate-400;
}

/* Achievements */
.achievements-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.achievement-badge {
  @apply p-4 rounded-xl text-center;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.badge-icon {
  @apply text-3xl mb-2;
}

.badge-name {
  @apply text-lg font-bold text-yellow-400 mb-1;
}

.badge-description {
  @apply text-sm text-slate-400;
}

/* Buttons */
.galaxy-button {
  @apply px-6 py-3 rounded-xl font-bold transition-all border-none cursor-pointer;
}

.galaxy-button-large {
  @apply px-8 py-4 text-xl;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.galaxy-button-primary:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
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

.galaxy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.galaxy-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Compact Styles */
.compact-stats {
  @apply flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg;
}

.network-strength-compact {
  @apply flex items-center gap-2;
}

.strength-bar-small {
  @apply w-16 h-1 bg-slate-700 rounded-full overflow-hidden;
}

.strength-bar-small .strength-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500;
}

/* Horizontal Sentence Layout */
.horizontal-sentence-layout {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 items-center;
}

.sentence-part {
  @apply p-3 rounded-xl border;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.sentence-text {
  @apply text-base font-medium text-slate-200 text-center;
}

.conjunction-selector {
  @apply text-center;
}

.selector-label {
  @apply text-sm text-slate-400 mb-2;
}

.connection-options-horizontal {
  @apply grid grid-cols-2 gap-2;
}

.connection-option-compact {
  @apply p-2 rounded-lg border cursor-pointer transition-all text-center;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.connection-option-compact:hover {
  border-color: rgba(99, 102, 241, 0.6);
}

.connection-option-compact.selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.connection-option-compact.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.connection-option-compact.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.option-text-compact {
  @apply text-sm font-bold text-green-400 block;
}

.option-meaning-compact {
  @apply text-xs text-slate-400;
}

/* Compact Action Section */
.action-section-compact {
  @apply text-center mt-4;
}

.connect-button-compact {
  @apply px-6 py-2 rounded-lg font-bold transition-all;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.connect-button-compact:hover {
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
  transform: scale(1.02);
}

/* Compact Result Section */
.result-section-compact {
  @apply mt-4;
}

.result-inline {
  @apply p-4 rounded-xl border-2;
  background: rgba(15, 23, 42, 0.9);
}

.result-inline.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.result-inline.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.result-status {
  @apply flex items-center justify-center gap-3 mb-2;
}

.result-text {
  @apply font-bold;
}

.chain-bonus {
  @apply text-green-400 font-bold text-sm;
}

.complete-sentence-inline {
  @apply text-center p-2 rounded-lg mb-2;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.explanation-inline {
  @apply text-sm text-slate-400 text-center mb-3;
}

.continue-button-compact {
  @apply px-4 py-2 rounded-lg font-bold transition-all;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.continue-button-compact:hover {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

/* Compact Setup Styles */
.setup-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.setup-section {
  @apply space-y-3;
}

.compact-options {
  @apply space-y-2;
}

.compact-option {
  @apply p-3 rounded-lg border cursor-pointer transition-all text-left w-full;
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.compact-option:hover {
  border-color: rgba(99, 102, 241, 0.6);
}

.compact-option.selected {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.option-icon {
  @apply text-lg mr-3;
}

.option-name {
  @apply font-bold text-yellow-400 block;
}

.option-desc {
  @apply text-sm text-slate-400;
}

/* Compact Results Styles */
.result-icon-large {
  @apply text-6xl mb-4;
}

.results-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 mb-6;
}

.results-section {
  @apply space-y-3;
}

.section-title {
  @apply text-lg font-bold galaxy-text-primary;
}

.compact-stats-grid {
  @apply grid grid-cols-2 gap-3;
}

.compact-stat {
  @apply flex flex-col items-center p-3 rounded-lg;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.compact-stat .stat-icon {
  @apply text-xl mb-1;
}

.compact-stat .stat-value {
  @apply text-lg font-bold text-yellow-400;
}

.compact-stat .stat-label {
  @apply text-xs text-slate-400;
}

.mastered-types-compact {
  @apply space-y-2;
}

.mastered-type-compact {
  @apply flex items-center gap-3 p-2 rounded-lg;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.mastered-type-compact .type-name {
  @apply flex-1 text-sm text-green-400;
}

.mastered-type-compact .type-accuracy {
  @apply text-xs text-slate-400;
}

.achievements-compact {
  @apply mt-6;
}

.badges-inline {
  @apply flex flex-wrap gap-2 justify-center;
}

.badge-compact {
  @apply px-3 py-1 rounded-full text-sm font-medium;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #ffd700;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sentence-fragments {
    @apply grid-cols-1 gap-4;
  }
  
  .connection-cable {
    @apply hidden;
  }
  
  .connection-port {
    @apply hidden;
  }
  
  .horizontal-sentence-layout {
    @apply grid-cols-1 gap-3;
  }
  
  .connection-options-horizontal {
    @apply grid-cols-1 gap-2;
  }
}

@media (max-width: 768px) {
  .difficulty-grid,
  .mode-grid {
    @apply grid-cols-1;
  }
  
  .stats-grid {
    @apply grid-cols-2;
  }
  
  .mastered-types-grid {
    @apply grid-cols-2;
  }
  
  .achievements-grid {
    @apply grid-cols-1;
  }
  
  .fragment-text {
    @apply text-base;
  }
  
  .option-text {
    @apply text-lg;
  }
}

@media (max-width: 640px) {
  .banner-icon {
    @apply text-6xl;
  }
  
  .banner-title {
    @apply text-3xl;
  }
  
  .chain-bonus-text {
    @apply text-3xl;
  }
  
  .chain-bonus-effect {
    @apply text-4xl;
  }
  
  .stats-grid,
  .mastered-types-grid {
    @apply grid-cols-1;
  }
}
</style>