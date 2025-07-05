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
              @click="$router.push('/grammar-galaxy-hub')" 
              class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50"
            >
              <span class="text-xl">🌌</span>
              <span class="text-sm text-slate-300">文法銀河</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="galaxy-stats-card">
              <span class="text-2xl cosmic-glow">🎯</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">正答率</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ Math.round(accuracy * 100) }}%</div>
              </div>
            </div>
            <div class="galaxy-stats-card">
              <span class="text-2xl cosmic-glow">⚡</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">コンボ</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ comboCount }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-yellow-400 cosmic-title mb-4">
            🛡️ Modal Verb Challenge
          </h1>
          <p class="text-xl mb-2 text-slate-400">
            助動詞バトルアリーナ
          </p>
          <p class="text-base text-slate-400 max-w-3xl mx-auto">
            can/may/must/should を使いこなして敵を倒し、助動詞の力を手に入れよう！
          </p>
        </div>
      </div>
    </header>

    <!-- Introduction Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'introduction'">
      <div class="max-w-4xl mx-auto">
        <div class="galaxy-card p-8 mb-8">
          <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-6">📖 助動詞マスターガイド</h2>
          
          <!-- Compact Overview -->
          <div class="compact-overview mb-6">
            <p class="text-galaxy-moon-silver text-center text-lg mb-4">
              助動詞は動詞の前に置いて、<strong>能力</strong>・<strong>許可</strong>・<strong>義務</strong>・<strong>推量</strong>などの意味を表す特別な動詞です。
            </p>
            <div class="quick-examples">
              <span class="example-tag">can (できる)</span>
              <span class="example-tag">must (〜ねばならない)</span>
              <span class="example-tag">may (〜してもよい)</span>
              <span class="example-tag">should (〜すべき)</span>
            </div>
          </div>

          <!-- Tabbed Interface -->
          <div class="learning-tabs">
            <!-- Tab Navigation -->
            <div class="tab-navigation">
              <button 
                v-for="tab in learningTabs" 
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
                <h3 class="panel-title">🌱 基本助動詞 (初級レベル)</h3>
                <div class="basic-modals-grid">
                  <div class="basic-modal-card">
                    <div class="modal-icon">💪</div>
                    <div class="modal-name">CAN/CANNOT</div>
                    <div class="modal-meaning">能力・可能性</div>
                    <div class="modal-example">I can swim. / I cannot fly.</div>
                  </div>
                  <div class="basic-modal-card">
                    <div class="modal-icon">⚖️</div>
                    <div class="modal-name">MUST/MUST NOT</div>
                    <div class="modal-meaning">義務・禁止</div>
                    <div class="modal-example">You must study. / You must not smoke.</div>
                  </div>
                  <div class="basic-modal-card">
                    <div class="modal-icon">🤝</div>
                    <div class="modal-name">MAY</div>
                    <div class="modal-meaning">許可・可能性</div>
                    <div class="modal-example">May I enter? / It may rain.</div>
                  </div>
                  <div class="basic-modal-card">
                    <div class="modal-icon">⏰</div>
                    <div class="modal-name">WILL</div>
                    <div class="modal-meaning">未来・意志</div>
                    <div class="modal-example">It will be sunny. / I will help.</div>
                  </div>
                  <div class="basic-modal-card">
                    <div class="modal-icon">💡</div>
                    <div class="modal-name">SHOULD</div>
                    <div class="modal-meaning">助言・推奨</div>
                    <div class="modal-example">You should rest. / It should work.</div>
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
                      <span class="level-item">COULD/WOULD (過去・丁寧)</span>
                      <span class="level-item">MIGHT (弱い推量)</span>
                      <span class="level-item">HAVE TO (個人的必要)</span>
                    </div>
                  </div>
                  <div class="level-section">
                    <h4 class="level-title">🚀 上級レベル</h4>
                    <div class="level-items">
                      <span class="level-item">MUST HAVE (過去への確信)</span>
                      <span class="level-item">SHOULD HAVE (後悔・期待)</span>
                      <span class="level-item">COULD HAVE (実現しなかった可能性)</span>
                      <span class="level-item">WOULD HAVE (仮定法)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Game Rules Tab -->
              <div v-if="activeTab === 'rules'" class="tab-panel">
                <h3 class="panel-title">🎯 バトルシステム</h3>
                <div class="rules-grid">
                  <div class="rule-card">
                    <div class="rule-icon">⚔️</div>
                    <div class="rule-title">攻撃方法</div>
                    <div class="rule-desc">正しい助動詞を選んで敵を攻撃</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">💥</div>
                    <div class="rule-title">ダメージ</div>
                    <div class="rule-desc">基本10 + コンボボーナス</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">🔥</div>
                    <div class="rule-title">コンボ</div>
                    <div class="rule-desc">連続正解で威力UP</div>
                  </div>
                  <div class="rule-card">
                    <div class="rule-icon">🏆</div>
                    <div class="rule-title">勝利条件</div>
                    <div class="rule-desc">敵のHPを0にしよう</div>
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
                      <div class="step-title">🌱 初級 - 基礎固め</div>
                      <div class="step-desc">5つの基本助動詞をシンプルな文で練習 (20問)</div>
                    </div>
                  </div>
                  <div class="path-step intermediate">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">🌟 中級 - 応用力</div>
                      <div class="step-desc">言い換えとニュアンスの違いを学習 (15問)</div>
                    </div>
                  </div>
                  <div class="path-step advanced">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <div class="step-title">🚀 上級 - 完了形</div>
                      <div class="step-desc">助動詞+完了形で高度な表現をマスター (15問)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <!-- Start Game Button -->
          <div class="start-section">
            <button 
              @click="startGame" 
              class="galaxy-button galaxy-button-primary text-xl font-bold py-4 px-8 rounded-xl"
            >
              🎮 助動詞バトル開始
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Game Selection Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'gameSelection'">
      <div class="max-w-4xl mx-auto">
        <div class="galaxy-card p-8 mb-8">
          <h2 class="text-3xl font-bold galaxy-text-primary text-center mb-6">⚔️ レベルを選択して戦闘開始</h2>
          
          <div class="level-selection-grid">
            <div 
              v-for="level in difficultyLevels" 
              :key="level.id"
              class="level-card"
              :class="{ 
                'unlocked': level.unlocked,
                'locked': !level.unlocked 
              }"
              @click="selectDifficulty(level.id)"
            >
              <div class="level-icon">{{ level.icon }}</div>
              <div class="level-title">{{ level.name }}</div>
              <div class="level-description">{{ level.description }}</div>
              <div class="level-problems">{{ level.problemCount }}問</div>
              <div v-if="!level.unlocked" class="lock-overlay">
                <div class="lock-icon">🔒</div>
                <div class="unlock-requirement">{{ level.unlockRequirement }}</div>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <button 
              @click="gameState = 'introduction'" 
              class="galaxy-button galaxy-button-secondary px-6 py-3"
            >
              ← 学習ガイドに戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Main Game Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'playing'">
      <div class="max-w-4xl mx-auto">
        
        <!-- Battle Status -->
        <div class="galaxy-card p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold galaxy-text-primary">バトル状況</h3>
            <div class="flex items-center gap-4">
              <div class="text-lg font-bold">⏰ {{ timeRemaining }}秒</div>
              <div class="text-lg font-bold">{{ currentRound }}/{{ totalRounds }}</div>
            </div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill modal-verb" 
                :style="{ width: (currentRound / totalRounds) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Battle Arena -->
        <div class="galaxy-card p-8 mb-8">
          <div class="battle-arena">
            <!-- Enemy -->
            <div class="enemy-section mb-8">
              <div class="enemy-container" :class="{ 'damaged': enemyDamaged }">
                <div class="enemy-sprite">{{ currentChallenge?.enemy || '👹' }}</div>
                <div class="enemy-hp-bar">
                  <div class="hp-fill" :style="{ width: enemyHP + '%' }"></div>
                </div>
                <div class="enemy-name">{{ currentChallenge?.enemyName || 'Modal Destroyer' }}</div>
              </div>
            </div>

            <!-- Challenge Display -->
            <div class="challenge-display mb-8">
              <div class="challenge-header">
                <div class="modal-type-badge" :class="currentChallenge?.modalType">
                  {{ getModalTypeName(currentChallenge?.modalType) }}
                </div>
                <div class="challenge-number">問題 {{ currentRound }}/{{ totalRounds }}</div>
              </div>
              
              <div class="challenge-content">
                <div class="enemy-challenge">
                  <h3 class="challenge-title">🔥 {{ currentChallenge?.enemyName || '敵' }}からの挑戦状！</h3>
                  <p class="challenge-subtitle">この日本語を英語にしたとき、正しい助動詞は何でしょうか？</p>
                </div>
                
                <div class="japanese-sentence">
                  <div class="sentence-frame">
                    <div class="sentence-label">🇯🇵 日本語の文</div>
                    <h2 class="main-sentence" v-html="highlightModalPart(currentChallenge?.prompt)"></h2>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Verb Options -->
            <div class="modal-options-enhanced">
              <h3 class="options-title">⚔️ 正しい助動詞で敵を攻撃！</h3>
              <div class="modal-options-grid">
                <div 
                  v-for="(option, index) in currentChallenge?.options" 
                  :key="option.id"
                  class="modal-option-enhanced"
                  :class="{ 
                    'selected': selectedAnswer?.id === option.id,
                    'correct': showResult && option.isCorrect,
                    'incorrect': showResult && selectedAnswer?.id === option.id && !option.isCorrect,
                    'disabled': showResult
                  }"
                  @click="!showResult && selectAnswer(option)"
                >
                  <div class="option-header">
                    <div class="option-label">{{ String.fromCharCode(65 + index) }}</div>
                    <div class="option-modal">{{ option.modal }}</div>
                  </div>
                  
                  <div class="option-status">
                    <div v-if="selectedAnswer?.id === option.id && !showResult" class="selection-indicator">
                      <span>🎯 選択中</span>
                    </div>
                    <div v-if="showResult && option.isCorrect" class="result-indicator correct">
                      <span>✅ 正解！</span>
                    </div>
                    <div v-if="showResult && selectedAnswer?.id === option.id && !option.isCorrect" class="result-indicator incorrect">
                      <span>❌ 不正解</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button Section -->
            <div class="action-section mt-8">
              <div v-if="selectedAnswer && !showResult" class="attack-ready">
                <button @click="attack" class="attack-button-enhanced">
                  <span class="attack-icon">⚔️</span>
                  <span class="attack-text">「{{ selectedAnswer.modal }}」で攻撃！</span>
                </button>
              </div>
              
              <div v-else-if="showResult" class="result-section">
                <div v-if="lastAnswerCorrect" class="success-message">
                  <span class="result-icon">🎯</span>
                  <span class="result-text">ナイス攻撃！</span>
                  <span class="damage-text">{{ currentDamage }}ダメージ！</span>
                </div>
                <div v-else class="failure-message">
                  <span class="result-icon">💥</span>
                  <span class="result-text">攻撃失敗...</span>
                  <span class="miss-text">正解: {{ currentChallenge?.options?.find(o => o.isCorrect)?.modal }}</span>
                </div>
                <div class="explanation-box">
                  <h4>📚 解説:</h4>
                  <p>{{ currentChallenge?.explanation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Combo Display -->
        <div class="combo-display" v-if="comboCount > 0">
          <div class="combo-text">{{ comboCount }} COMBO!</div>
          <div class="combo-effect">🔥</div>
        </div>
      </div>
    </main>

    <!-- Results Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'results'">
      <div class="max-w-4xl mx-auto">
        
        <!-- Victory/Defeat Banner -->
        <div class="galaxy-card p-8 mb-8 text-center">
          <div class="result-banner" :class="{ 'victory': isVictory, 'defeat': !isVictory }">
            <div class="banner-icon">{{ isVictory ? '🏆' : '💀' }}</div>
            <h2 class="banner-title">{{ isVictory ? '勝利！' : '敗北...' }}</h2>
            <p class="banner-subtitle">{{ isVictory ? '助動詞の力を手に入れた！' : 'もう一度挑戦しよう' }}</p>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="galaxy-card p-8 mb-8">
          <h3 class="text-2xl font-bold galaxy-text-primary text-center mb-6">📊 バトル結果</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">{{ Math.round(accuracy * 100) }}%</div>
              <div class="stat-label">正答率</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-value">{{ maxCombo }}</div>
              <div class="stat-label">最大コンボ</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">💰</div>
              <div class="stat-value">{{ totalScore }}</div>
              <div class="stat-label">獲得スコア</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏰</div>
              <div class="stat-value">{{ Math.round(avgResponseTime) }}秒</div>
              <div class="stat-label">平均回答時間</div>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="galaxy-card p-8 mb-8" v-if="earnedAchievements.length > 0">
          <h3 class="text-2xl font-bold galaxy-text-primary text-center mb-6">🏅 達成バッジ</h3>
          <div class="achievements-grid">
            <div v-for="achievement in earnedAchievements" :key="achievement.id" class="achievement-badge">
              <div class="badge-icon">{{ achievement.icon }}</div>
              <div class="badge-name">{{ achievement.name }}</div>
              <div class="badge-description">{{ achievement.description }}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4">
          <button @click="restartGame" class="galaxy-button galaxy-button-secondary">
            🔄 もう一度
          </button>
          <button @click="$router.push('/grammar-galaxy-hub')" class="galaxy-button galaxy-button-primary">
            🌌 文法銀河へ戻る
          </button>
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
import { modalVerbProblems } from '@/data/modalVerbProblems.js'

export default {
  name: 'ModalVerbChallengeGame',
  components: {
    CommonFooter
  },
  setup() {
    const router = useRouter()

    // Game state
    const gameState = ref('introduction') // introduction, gameSelection, playing, results
    const selectedDifficulty = ref('beginner')
    const selectedMode = ref('classic')
    const currentRound = ref(0)
    const totalRounds = ref(10)
    const timeRemaining = ref(30)
    const gameTimer = ref(null)
    
    // Tabbed interface state
    const activeTab = ref('basic')
    const learningTabs = [
      {
        id: 'basic',
        icon: '🌱',
        label: '基本助動詞'
      },
      {
        id: 'advanced',
        icon: '🚀',
        label: '高度な表現'
      },
      {
        id: 'rules',
        icon: '🎯',
        label: 'バトルルール'
      },
      {
        id: 'levels',
        icon: '📚',
        label: '学習の流れ'
      }
    ]

    // Battle state
    const enemyHP = ref(100)
    const enemyDamaged = ref(false)
    const currentChallenge = ref(null)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const lastAnswerCorrect = ref(false)
    const currentDamage = ref(0)

    // Performance tracking
    const correctAnswers = ref(0)
    const totalAttempts = ref(0)
    const comboCount = ref(0)
    const maxCombo = ref(0)
    const totalScore = ref(0)
    const responseTimes = ref([])
    const questionStartTime = ref(null)
    const earnedAchievements = ref([])

    // Game configuration - Updated for expanded problem database
    const difficultyLevels = [
      {
        id: 'beginner',
        name: '初級戦士',
        icon: '🛡️',
        description: 'can/cannot の基本（50+問題からランダム選出）',
        timeLimit: 60,
        questionCount: 15,
        problemCount: 20,
        unlocked: true,
        unlockRequirement: ''
      },
      {
        id: 'intermediate',
        name: '中級騎士',
        icon: '⚔️',
        description: 'may/must/should を含む（50+問題からランダム選出）',
        timeLimit: 45,
        questionCount: 20,
        problemCount: 15,
        unlocked: true,
        unlockRequirement: ''
      },
      {
        id: 'advanced',
        name: '上級魔法使い',
        icon: '🧙‍♂️',
        description: '複雑な文脈での使い分け（50+問題からランダム選出）',
        timeLimit: 30,
        questionCount: 25,
        problemCount: 15,
        unlocked: true,
        unlockRequirement: ''
      }
    ]

    const battleModes = [
      {
        id: 'classic',
        name: 'クラシックバトル',
        icon: '⚔️',
        description: '標準的な助動詞バトル'
      },
      {
        id: 'speed',
        name: 'スピードアタック',
        icon: '⚡',
        description: '制限時間が短い高速バトル'
      },
      {
        id: 'survival',
        name: 'サバイバルモード',
        icon: '🛡️',
        description: '間違えるまで続くエンドレスバトル'
      }
    ]

    // Import the expanded modal verb challenges database
    const modalChallenges = modalVerbProblems;

    // Helper function for array shuffling
    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    // Session-specific randomized problems
    const sessionProblems = ref([])
    const problemIndex = ref(0)

    // Initialize problems for current session
    const initializeSessionProblems = () => {
      const difficultyLevel = selectedDifficulty.value
      const availableChallenges = modalChallenges.filter(c => c.level === difficultyLevel)
      
      // Shuffle and store problems for this session with double randomization
      const doubleShuffled = shuffleArray(shuffleArray(availableChallenges))
      sessionProblems.value = doubleShuffled
      problemIndex.value = 0
      
      console.log(`Initialized ${sessionProblems.value.length} problems for ${difficultyLevel} level`)
    }

    // Computed properties
    const accuracy = computed(() => {
      return totalAttempts.value > 0 ? correctAnswers.value / totalAttempts.value : 0
    })

    const avgResponseTime = computed(() => {
      return responseTimes.value.length > 0 
        ? responseTimes.value.reduce((a, b) => a + b, 0) / responseTimes.value.length 
        : 0
    })

    const isVictory = computed(() => {
      return enemyHP.value <= 0
    })

    // Game functions
    const startGame = () => {
      gameState.value = 'gameSelection'
    }
    
    const selectDifficulty = (difficulty) => {
      selectedDifficulty.value = difficulty
      gameState.value = 'playing'
      correctAnswers.value = 0
      totalAttempts.value = 0
      comboCount.value = 0
      maxCombo.value = 0
      totalScore.value = 0
      enemyHP.value = 100
      responseTimes.value = []
      earnedAchievements.value = []
      
      // Initialize session problems
      initializeSessionProblems()
      generateChallenge()
      startTimer()
    }

    const generateChallenge = () => {
      if (sessionProblems.value.length === 0) {
        initializeSessionProblems()
      }
      
      if (problemIndex.value >= sessionProblems.value.length) {
        problemIndex.value = 0
        sessionProblems.value = shuffleArray(sessionProblems.value)
      }
      
      currentChallenge.value = sessionProblems.value[problemIndex.value]
      problemIndex.value++
      questionStartTime.value = Date.now()
    }

    const selectAnswer = (option) => {
      if (selectedAnswer.value || showResult.value) return // Prevent double selection
      
      selectedAnswer.value = option
      questionStartTime.value = Date.now() // Start timing from selection
    }

    const attack = () => {
      if (!selectedAnswer.value || showResult.value) return
      
      const responseTime = Date.now() - questionStartTime.value
      responseTimes.value.push(responseTime)
      totalAttempts.value++
      
      if (selectedAnswer.value.isCorrect) {
        correctAnswers.value++
        comboCount.value++
        if (comboCount.value > maxCombo.value) {
          maxCombo.value = comboCount.value
        }
        
        // Damage enemy
        const damage = 10 + (comboCount.value * 2)
        enemyHP.value = Math.max(0, enemyHP.value - damage)
        currentDamage.value = damage
        lastAnswerCorrect.value = true
      } else {
        comboCount.value = 0
        lastAnswerCorrect.value = false
      }
      
      showResult.value = true
      
      // Continue to next question after delay
      setTimeout(() => {
        if (enemyHP.value <= 0) {
          nextRound()
        } else {
          nextQuestion()
        }
      }, 3000) // Longer delay to read explanation
    }

    const nextQuestion = () => {
      selectedAnswer.value = null
      showResult.value = false
      lastAnswerCorrect.value = false
      currentDamage.value = 0
      generateChallenge()
    }


    const nextRound = () => {
      gameState.value = 'results'
    }

    const restartGame = () => {
      gameState.value = 'introduction'
      enemyHP.value = 100
      selectedAnswer.value = null
      showResult.value = false
      currentChallenge.value = null
    }

    const startTimer = () => {
      // Timer implementation if needed
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
          router.push('/multi-layer')
          break
        case 'co-pilot':
          router.push('/co-pilot-dock')
          break
        case 'vr-academy':
          router.push('/vr-academy')
          break
        default:
          console.warn('Unknown navigation section:', section)
      }
    }

    const highlightModalPart = (sentence) => {
      if (!sentence) return ''
      
      // 助動詞や関連表現をハイライトするパターン
      const patterns = [
        'できる', 'できます', 'できない', 'できません',
        'しなければならない', 'しなくてはならない', 'してはいけない', 'してはいけません',
        'してもよい', 'してもいい', 'かもしれない', 'かもしれません',
        'でしょう', 'するでしょう', 'するつもり', 'つもりです',
        'すべき', 'すべきです', 'したほうがいい', 'するはず',
        'に違いない', 'はずだ', 'だったに違いない', 'だったはず',
        'すべきだった', 'できたはず', 'していたでしょう'
      ]
      
      let highlighted = sentence
      patterns.forEach(pattern => {
        const regex = new RegExp(`(${pattern})`, 'g')
        highlighted = highlighted.replace(regex, '<span class="modal-highlight">$1</span>')
      })
      
      return highlighted
    }

    const getModalTypeName = (modalType) => {
      const typeNames = {
        // 初級レベル
        'ability': '能力・可能性',
        'negative_ability': '能力の否定',
        'question': '疑問文',
        'permission': '許可・依頼',
        'obligation': '義務・必要性',
        'necessity': '必要性',
        'prohibition': '禁止',
        'possibility': '推量・可能性',
        'future': '未来・予測',
        'intention': '意志・予定',
        'advice': '助言・推奨',
        
        // 中級レベル
        'polite_permission': '丁寧な許可',
        'strong_advice': '強い推奨',
        'deduction': '推論・確信',
        'expectation': '期待・予想',
        'polite_request': '丁寧な依頼',
        'ability_paraphrase': '過去の能力',
        'weak_possibility': '弱い推量',
        'conditional_politeness': '条件付き丁寧表現',
        'necessity_vs_obligation': '必要性vs義務',
        'permission_degrees': '許可の段階',
        
        // 上級レベル
        'past_deduction': '過去への推論',
        'past_possibility': '過去の可能性',
        'past_regret': '後悔・反省',
        'unrealized_ability': '実現しなかった能力',
        'conditional_past': '仮定法過去完了',
        'logical_deduction': '論理的推論',
        'graduated_certainty': '段階的確信',
        'subtle_criticism': '間接的批判',
        'hypothetical_reasoning': '仮定的推論',
        'complex_expectation': '複雑な期待',
        
        // その他
        'politeness': '丁寧性',
        'past_ability': '過去の能力',
        'general': '一般的傾向'
      }
      return typeNames[modalType] || 'モーダル動詞'
    }

    return {
      // State
      gameState,
      selectedDifficulty,
      selectedMode,
      currentRound,
      totalRounds,
      timeRemaining,
      enemyHP,
      enemyDamaged,
      currentChallenge,
      selectedAnswer,
      showResult,
      lastAnswerCorrect,
      currentDamage,
      
      // Tabbed interface
      activeTab,
      learningTabs,
      
      // Performance
      correctAnswers,
      totalAttempts,
      comboCount,
      maxCombo,
      totalScore,
      earnedAchievements,
      
      // Configuration
      difficultyLevels,
      battleModes,
      
      // Computed
      accuracy,
      avgResponseTime,
      isVictory,
      
      // Functions
      startGame,
      selectDifficulty,
      selectAnswer,
      initializeSessionProblems,
      attack,
      nextRound,
      restartGame,
      handleFooterNavigation,
      highlightModalPart,
      getModalTypeName
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

.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.text-galaxy-moon-silver {
  color: #cbd5e1;
  text-shadow: 0 0 10px rgba(203, 213, 225, 0.3);
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

/* Enhanced Introduction Styles */
.example-box {
  @apply bg-slate-800/50 rounded-xl p-6 border border-slate-600/30;
}

.examples-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.example-item {
  @apply flex flex-col space-y-1 p-3 bg-slate-700/30 rounded-lg;
}

.example-text {
  @apply text-lg font-medium;
}

.example-meaning {
  @apply text-sm text-slate-400;
}

.power-card.enhanced {
  @apply p-6 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-slate-600/30;
  transition: all 0.3s ease;
}

.power-card.enhanced:hover {
  @apply border-purple-400/50 transform scale-105;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
}

.power-examples {
  @apply mt-3 text-sm text-slate-300 space-y-1;
}

.modal-level-section {
  @apply mb-8 p-6 bg-slate-800/30 rounded-xl border border-slate-600/20;
}

.power-card.beginner-level {
  @apply border-green-500/30;
}

.power-card.intermediate-level {
  @apply border-yellow-500/30;
}

.power-card.advanced-level {
  @apply border-red-500/30;
}

.power-card.beginner-level:hover {
  @apply border-green-400/50;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.power-card.intermediate-level:hover {
  @apply border-yellow-400/50;
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
}

.power-card.advanced-level:hover {
  @apply border-red-400/50;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.level-info-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.level-card {
  @apply p-6 rounded-xl border transition-all duration-300;
}

.level-card.beginner {
  @apply bg-green-900/20 border-green-500/30;
}

.level-card.intermediate {
  @apply bg-yellow-900/20 border-yellow-500/30;
}

.level-card.advanced {
  @apply bg-red-900/20 border-red-500/30;
}

.level-card:hover {
  @apply transform scale-105;
}

.level-icon {
  @apply text-4xl text-center mb-3;
}

.level-name {
  @apply text-xl font-bold text-center mb-2 galaxy-text-primary;
}

.level-description {
  @apply text-sm text-slate-300 text-center mb-2;
}

.level-problems {
  @apply text-xs text-center font-semibold text-yellow-400;
}

.battle-rules-enhanced {
  @apply space-y-4;
}

.rule-item {
  @apply flex items-start space-x-4 p-4 bg-slate-800/40 rounded-lg border border-slate-600/20;
}

.rule-icon {
  @apply text-2xl;
}

.rule-content {
  @apply flex-1;
}

.rule-title {
  @apply font-bold text-lg galaxy-text-primary mb-1;
}

.rule-description {
  @apply text-slate-300;
}

.features-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.feature-item {
  @apply text-center p-4 bg-slate-800/30 rounded-lg border border-slate-600/20;
}

.feature-icon {
  @apply text-3xl mb-2;
}

.feature-title {
  @apply font-bold text-lg galaxy-text-primary mb-2;
}

.feature-description {
  @apply text-sm text-slate-400;
}

/* ===== Setup Screen Enhancements ===== */
.setup-difficulty-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.setup-difficulty-card {
  @apply p-6 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border-2 transition-all duration-300 cursor-pointer;
  border-color: rgba(100, 116, 139, 0.3);
}

.setup-difficulty-card:hover {
  @apply transform scale-105;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.setup-difficulty-card.selected {
  @apply ring-4 ring-opacity-50;
}

.setup-difficulty-card.beginner {
  border-color: rgba(34, 197, 94, 0.5);
}

.setup-difficulty-card.beginner.selected {
  @apply ring-green-400;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
}

.setup-difficulty-card.intermediate {
  border-color: rgba(234, 179, 8, 0.5);
}

.setup-difficulty-card.intermediate.selected {
  @apply ring-yellow-400;
  box-shadow: 0 0 30px rgba(234, 179, 8, 0.4);
}

.setup-difficulty-card.advanced {
  border-color: rgba(239, 68, 68, 0.5);
}

.setup-difficulty-card.advanced.selected {
  @apply ring-red-400;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
}

.setup-difficulty-icon {
  @apply text-6xl text-center mb-4;
}

.setup-difficulty-title {
  @apply text-2xl font-bold text-center mb-3 galaxy-text-primary;
}

.setup-difficulty-description {
  @apply text-center text-slate-300 mb-4;
}

.setup-difficulty-stats {
  @apply flex justify-center gap-4 mb-4;
}

.stat-item {
  @apply flex items-center gap-1 text-sm text-slate-400;
}

.stat-icon {
  @apply text-base;
}

.setup-mode-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.setup-mode-card {
  @apply p-6 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border-2 transition-all duration-300 cursor-pointer;
  border-color: rgba(100, 116, 139, 0.3);
}

.setup-mode-card:hover {
  @apply transform scale-105;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.setup-mode-card.selected {
  @apply ring-4 ring-purple-400 ring-opacity-50;
  border-color: rgba(147, 51, 234, 0.5);
  box-shadow: 0 0 30px rgba(147, 51, 234, 0.4);
}

.setup-mode-icon {
  @apply text-6xl text-center mb-4;
}

.setup-mode-title {
  @apply text-2xl font-bold text-center mb-3 galaxy-text-primary;
}

.setup-mode-description {
  @apply text-center text-slate-300 mb-4;
}

.selected-indicator {
  @apply flex items-center justify-center text-green-400 font-bold;
}

.start-battle-button {
  @apply px-12 py-6 text-2xl font-bold rounded-2xl transition-all duration-300 flex items-center gap-4;
}

.start-battle-button.ready {
  @apply bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg;
  animation: pulse-glow 2s ease-in-out infinite;
}

.start-battle-button.ready:hover {
  @apply transform scale-105;
  box-shadow: 0 0 40px rgba(34, 197, 94, 0.5);
}

.start-battle-button.disabled {
  @apply bg-slate-600 text-slate-400 cursor-not-allowed;
}

.start-button-icon {
  @apply text-3xl;
}

.start-button-text {
  @apply text-xl;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.8); }
}

/* ===== Enhanced Game UI ===== */
.modal-options-enhanced {
  @apply text-center;
}

.options-title {
  @apply text-2xl font-bold galaxy-text-primary mb-6 text-center;
}

.modal-options-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.modal-option-enhanced {
  @apply relative p-6 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-32 flex flex-col items-center justify-center;
  border-color: rgba(100, 116, 139, 0.3);
}

.modal-option-enhanced:hover:not(.disabled) {
  @apply transform scale-105;
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.modal-option-enhanced.selected {
  @apply ring-4 ring-blue-400 ring-opacity-50;
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

.modal-option-enhanced.correct {
  @apply ring-4 ring-green-400 ring-opacity-50;
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  animation: correct-pulse 1s ease-in-out;
}

.modal-option-enhanced.incorrect {
  @apply ring-4 ring-red-400 ring-opacity-50;
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
  animation: incorrect-shake 0.5s ease-in-out;
}

.modal-option-enhanced.disabled {
  @apply cursor-not-allowed opacity-75;
}

.option-label {
  @apply absolute top-2 left-2 w-6 h-6 bg-slate-600 text-white text-sm font-bold rounded-full flex items-center justify-center;
}

.option-modal {
  @apply text-2xl font-bold text-white mb-2;
}

.selection-indicator {
  @apply text-blue-400 text-sm font-bold;
}

.result-indicator {
  @apply absolute bottom-2 right-2 text-sm font-bold;
}

.result-indicator.correct {
  @apply text-green-400;
}

.result-indicator.incorrect {
  @apply text-red-400;
}

@keyframes correct-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes incorrect-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.action-section {
  @apply text-center;
}

.attack-ready {
  @apply space-y-4;
}

.attack-button-enhanced {
  @apply px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xl font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 mx-auto;
}

.attack-button-enhanced:hover {
  @apply transform scale-105;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
}

.attack-icon {
  @apply text-2xl;
}

.attack-text {
  @apply text-xl font-bold;
}

.attack-hint {
  @apply text-slate-400 text-sm;
}

.select-hint {
  @apply text-center space-y-3;
}

.hint-icon {
  @apply text-4xl;
}

.hint-text {
  @apply text-slate-400 text-lg;
}

.result-section {
  @apply space-y-4;
}

.success-message {
  @apply flex items-center justify-center gap-3 text-xl font-bold text-green-400;
}

.failure-message {
  @apply flex items-center justify-center gap-3 text-xl font-bold text-red-400;
}

.result-icon {
  @apply text-2xl;
}

.result-text {
  @apply text-xl;
}

.damage-text {
  @apply text-yellow-400 font-bold;
}

.explanation-box {
  @apply bg-slate-800/50 rounded-lg p-4 border border-slate-600/30;
}

.explanation-box h4 {
  @apply font-bold text-yellow-400 mb-2;
}

.explanation-box p {
  @apply text-slate-300;
}

/* ===== Enhanced Challenge Display ===== */
.enemy-challenge {
  @apply text-center mb-6;
}

.challenge-title {
  @apply text-3xl font-bold text-red-400 mb-2;
  text-shadow: 0 0 20px rgba(248, 113, 113, 0.5);
  animation: glow-pulse 2s ease-in-out infinite alternate;
}

.challenge-subtitle {
  @apply text-lg text-slate-300;
}

.japanese-sentence {
  @apply flex justify-center mb-6;
}

.sentence-frame {
  @apply bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border-2 border-blue-500/50 max-w-2xl;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.sentence-label {
  @apply text-sm text-blue-300 font-semibold mb-3 text-center;
}

.main-sentence {
  @apply text-2xl md:text-3xl font-bold text-white text-center leading-relaxed;
}

.modal-highlight {
  @apply bg-yellow-400 text-black px-2 py-1 rounded-lg font-bold;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
  animation: highlight-glow 1.5s ease-in-out infinite alternate;
}

.challenge-header {
  @apply flex justify-between items-center mb-4;
}

.challenge-number {
  @apply bg-slate-700/70 px-3 py-1 rounded-full text-sm text-slate-300 border border-slate-600/50;
}

/* Enhanced option styling */
.option-header {
  @apply flex items-center justify-center gap-3;
}

.option-modal {
  @apply text-xl md:text-2xl font-bold;
}

.option-status {
  @apply mt-3;
}

.miss-text {
  @apply text-yellow-400 text-sm mt-1;
}

/* Animations */
@keyframes glow-pulse {
  0% { text-shadow: 0 0 20px rgba(248, 113, 113, 0.5); }
  100% { text-shadow: 0 0 30px rgba(248, 113, 113, 0.8), 0 0 40px rgba(248, 113, 113, 0.4); }
}

@keyframes highlight-glow {
  0% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.6); }
  100% { box-shadow: 0 0 25px rgba(251, 191, 36, 0.9), 0 0 35px rgba(251, 191, 36, 0.4); }
}

/* ===== Tabbed Interface Styles ===== */
.learning-tabs {
  @apply mb-8;
}

.tab-navigation {
  @apply flex justify-center gap-2 mb-6;
}

.tab-button {
  @apply flex items-center gap-2 px-4 py-3 bg-slate-800/50 text-slate-300 rounded-lg transition-all duration-300 cursor-pointer border border-slate-600/30;
}

.tab-button:hover {
  @apply bg-slate-700/70 text-white;
}

.tab-button.active {
  @apply bg-blue-600/70 text-white border-blue-500/50;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.tab-icon {
  @apply text-lg;
}

.tab-label {
  @apply font-medium;
}

.tab-content {
  @apply min-h-64;
}

.tab-panel {
  @apply space-y-6;
}

.panel-title {
  @apply text-2xl font-bold galaxy-text-primary text-center mb-6;
}

/* Basic modals grid */
.basic-modals-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.basic-modal-card {
  @apply bg-slate-800/50 rounded-lg p-4 border border-slate-600/30 text-center space-y-2;
}

.modal-icon {
  @apply text-3xl;
}

.modal-name {
  @apply font-bold text-yellow-400;
}

.modal-meaning {
  @apply text-slate-300 text-sm;
}

.modal-example {
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
  @apply font-bold text-blue-400;
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
  @apply w-10 h-10 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center;
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

/* Level selection styles */
.level-selection-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.level-card {
  @apply relative bg-slate-800/50 rounded-lg p-6 border border-slate-600/30 text-center space-y-3 cursor-pointer transition-all duration-300;
}

.level-card:hover:not(.locked) {
  @apply transform scale-105 border-blue-500/50;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.level-card.locked {
  @apply opacity-60 cursor-not-allowed;
}

.level-icon {
  @apply text-4xl;
}

.level-title {
  @apply text-xl font-bold galaxy-text-primary;
}

.level-description {
  @apply text-sm text-slate-300;
}

.level-problems {
  @apply text-xs text-slate-400;
}

.lock-overlay {
  @apply absolute inset-0 bg-slate-900/70 rounded-lg flex flex-col items-center justify-center;
}

.lock-icon {
  @apply text-2xl text-slate-400;
}

.unlock-requirement {
  @apply text-xs text-slate-400 text-center mt-2;
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
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}
</style>
