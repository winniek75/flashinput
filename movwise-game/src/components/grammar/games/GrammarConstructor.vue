<template>
  <div class="grammar-constructor" :class="{ 'construction-active': gamePhase === 'playing' }">
    <!-- ゲームヘッダー -->
    <div class="game-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <ChevronLeftIcon class="h-6 w-6" />
          戻る
        </button>
        <h1 class="game-title">🏗️ Grammar Constructor</h1>
      </div>
      
      <div class="header-right">
        <div class="construction-meter">
          <div class="meter-label">建設効率</div>
          <div class="meter-bar">
            <div class="meter-fill" :style="{ width: constructionEfficiency + '%' }"></div>
          </div>
          <div class="meter-value">{{ constructionEfficiency }}%</div>
        </div>
        
        <div class="score-display">
          <span class="score-label">Score:</span>
          <span class="score-value">{{ score }}</span>
        </div>
      </div>
    </div>

    <!-- イントロ画面 -->
    <div v-if="gamePhase === 'intro'" class="intro-screen">
      <div class="intro-content">
        <div class="constructor-visual">
          <div class="construction-site">
            <div class="crane">🏗️</div>
            <div class="building-blocks">
              <div v-for="i in 6" :key="i" class="floating-block" :style="getBlockStyle(i)">
                {{ ['S', 'V', 'O', 'be', '?', '!'][i-1] }}
              </div>
            </div>
            <div class="foundation">📐</div>
          </div>
        </div>
        
        <h2 class="intro-title">Grammar Constructor へようこそ！</h2>
        <p class="intro-description">
          文法ブロックをドラッグ&ドロップして正しい英文を建設しよう！<br>
          主語・動詞・目的語を正しい順序で組み立てて、美しい文法建築物を完成させよう。
        </p>
        
        <div class="construction-tutorials">
          <h3>建設ガイド:</h3>
          <div class="tutorial-steps">
            <div class="tutorial-step">
              <div class="step-number">1</div>
              <div class="step-icon">📍</div>
              <div class="step-text">基盤を選択する</div>
            </div>
            <div class="tutorial-step">
              <div class="step-number">2</div>
              <div class="step-icon">🧱</div>
              <div class="step-text">ブロックをドラッグ</div>
            </div>
            <div class="tutorial-step">
              <div class="step-number">3</div>
              <div class="step-icon">🏗️</div>
              <div class="step-text">正しい順序で配置</div>
            </div>
            <div class="tutorial-step">
              <div class="step-number">4</div>
              <div class="step-icon">✨</div>
              <div class="step-text">文法建築物完成</div>
            </div>
          </div>
        </div>
        
        <div class="blueprint-selector">
          <h3>建設プランを選択:</h3>
          <div class="blueprint-options">
            <button 
              v-for="blueprint in constructionPlans" 
              :key="blueprint.id"
              @click="selectBlueprint(blueprint)"
              class="blueprint-button"
              :class="[blueprint.id, { selected: selectedBlueprint?.id === blueprint.id }]"
            >
              <div class="blueprint-icon">{{ blueprint.icon }}</div>
              <div class="blueprint-name">{{ blueprint.name }}</div>
              <div class="blueprint-description">{{ blueprint.description }}</div>
              <div class="blueprint-stats">
                <span>{{ blueprint.patterns }}パターン</span>
                <span>{{ blueprint.timeLimit }}秒</span>
              </div>
            </button>
          </div>
        </div>
        
        <button @click="startConstruction" class="start-button" :disabled="!selectedBlueprint">
          <span class="start-icon">🏗️</span>
          建設開始
        </button>
      </div>
    </div>

    <!-- メインゲーム画面 -->
    <div v-if="gamePhase === 'playing'" class="game-screen">
      <!-- 建設ステータス -->
      <div class="construction-status">
        <div class="project-info">
          <span class="project-label">プロジェクト:</span>
          <span class="project-name">{{ currentPattern?.name }}</span>
          <span class="project-number">{{ currentQuestion + 1 }}/{{ totalQuestions }}</span>
        </div>
        
        <GameTimer 
          :initial-time="timeRemaining"
          :auto-start="true"
          :count-down="true"
          size="medium"
          theme="classic"
          @complete="handleTimeUp"
          @warning="playSound('constructionWarning')"
        />
        
        <div class="efficiency-display">
          <span class="efficiency-label">効率:</span>
          <span class="efficiency-value" :class="getEfficiencyClass()">{{ constructionEfficiency }}%</span>
        </div>
      </div>

      <!-- 建設エリア -->
      <div class="construction-area">
        <!-- 設計図 -->
        <div class="blueprint-display">
          <h3 class="blueprint-title">設計図: {{ currentPattern?.structure }}</h3>
          <div class="structure-diagram">
            <div 
              v-for="(slot, index) in currentPattern?.slots" 
              :key="index"
              class="structure-slot"
              :class="slot.type"
            >
              <div class="slot-label">{{ slot.label }}</div>
              <div class="slot-type">{{ slot.type }}</div>
            </div>
          </div>
          <div class="example-sentence" v-if="currentPattern?.example">
            <span class="example-label">例:</span>
            <span class="example-text">{{ currentPattern.example }}</span>
          </div>
        </div>

        <!-- 建設基盤 -->
        <div class="construction-foundation">
          <h3 class="foundation-title">文法建設基盤</h3>
          <div 
            class="drop-zone"
            :class="{ 'drop-active': isDragActive, 'construction-complete': isConstructionComplete }"
            @dragover="handleDragOver"
            @drop="handleDrop"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
          >
            <div class="construction-slots">
              <div 
                v-for="(slot, index) in constructionSlots" 
                :key="index"
                class="construction-slot"
                :class="[
                  slot.type,
                  { 
                    'filled': slot.block,
                    'correct': slot.block && slot.correct,
                    'incorrect': slot.block && !slot.correct,
                    'target': dragTargetSlot === index
                  }
                ]"
                :data-slot-index="index"
              >
                <div v-if="!slot.block" class="slot-placeholder">
                  <div class="placeholder-icon">{{ getSlotIcon(slot.type) }}</div>
                  <div class="placeholder-text">{{ slot.label }}</div>
                </div>
                
                <div v-if="slot.block" class="placed-block" :class="slot.block.type">
                  <div class="block-text">{{ slot.block.text }}</div>
                  <button @click="removeBlock(index)" class="remove-button">❌</button>
                </div>
              </div>
            </div>
            
            <!-- 建設アニメーション -->
            <div v-if="showConstructionAnimation" class="construction-animation">
              <div class="building-effect">
                <div v-for="i in 8" :key="i" class="construction-spark" :style="getSparkStyle(i)">✨</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ブロック工場 -->
        <div class="block-factory">
          <h3 class="factory-title">📦 文法ブロック工場</h3>
          <div class="block-inventory">
            <div 
              v-for="block in availableBlocks" 
              :key="block.id"
              class="grammar-block"
              :class="[
                block.type,
                { 
                  'used': block.used,
                  'dragging': draggedBlock?.id === block.id
                }
              ]"
              :draggable="!block.used"
              @dragstart="handleDragStart(block, $event)"
              @dragend="handleDragEnd"
            >
              <div class="block-content">
                <div class="block-text">{{ block.text }}</div>
                <div class="block-type-label">{{ block.typeLabel }}</div>
              </div>
              <div class="block-shadow"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-panel">
        <button 
          @click="checkConstruction" 
          class="check-button"
          :disabled="!canCheckConstruction"
        >
          <span class="check-icon">✅</span>
          建設完了チェック
        </button>
        
        <button @click="resetConstruction" class="reset-button">
          <span class="reset-icon">🔄</span>
          リセット
        </button>
        
        <button @click="playAudio" class="audio-button" :disabled="!isConstructionComplete">
          <span class="audio-icon">🔊</span>
          音声再生
        </button>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-if="gamePhase === 'results'" class="results-screen">
      <div class="results-content">
        <div class="construction-portfolio">
          <div class="portfolio-header">
            <h2 class="portfolio-title">🏗️ 建設ポートフォリオ</h2>
            <div class="master-badge">
              <div class="badge-icon">{{ masterRank.icon }}</div>
              <div class="badge-title">{{ masterRank.title }}</div>
              <div class="badge-description">{{ masterRank.description }}</div>
            </div>
            
            <StarRating 
              :stars="starsEarned" 
              :max-stars="3" 
              size="large" 
              :show-sparkle="true"
              color="#FFD700"
            />
          </div>
        </div>
        
        <div class="construction-summary">
          <h3>建設サマリー</h3>
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-icon">🏆</div>
              <div class="card-label">完成建築物</div>
              <div class="card-value">{{ correctAnswers }}</div>
            </div>
            
            <div class="summary-card">
              <div class="card-icon">⚡</div>
              <div class="card-label">建設効率</div>
              <div class="card-value">{{ Math.round(constructionEfficiency) }}%</div>
            </div>
            
            <div class="summary-card">
              <div class="card-icon">🎯</div>
              <div class="card-label">精度</div>
              <div class="card-value">{{ accuracy }}%</div>
            </div>
            
            <div class="summary-card">
              <div class="card-icon">💎</div>
              <div class="card-label">総スコア</div>
              <div class="card-value">{{ score }}</div>
            </div>
          </div>
        </div>
        
        <div class="skill-evaluation">
          <h3>建設スキル評価</h3>
          <div class="skill-radar">
            <div v-for="skill in skillEvaluation" :key="skill.name" class="skill-metric">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-bar">
                <div class="skill-progress" :style="{ width: skill.score + '%', backgroundColor: skill.color }"></div>
              </div>
              <div class="skill-score">{{ skill.score }}%</div>
            </div>
          </div>
        </div>
        
        <div class="achievement-showcase" v-if="newAchievements.length > 0">
          <h3>新しい資格獲得！</h3>
          <div class="achievement-list">
            <div v-for="achievement in newAchievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="playAgain" class="action-button primary">
            🏗️ 新しいプロジェクト
          </button>
          <button @click="goBack" class="action-button secondary">
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- エフェクトレイヤー -->
    <div class="effects-container">
      <!-- 建設成功エフェクト -->
      <div v-if="showSuccess" class="success-effect">
        <div class="success-text">Perfect Construction!</div>
        <div class="success-animation">
          <div class="construction-complete-icon">🏗️</div>
          <div class="celebration-particles">
            <div v-for="i in 12" :key="i" class="celebration-particle">🎉</div>
          </div>
        </div>
      </div>
      
      <!-- 建設エラーエフェクト -->
      <div v-if="showError" class="error-effect">
        <div class="error-text">Construction Error!</div>
        <div class="error-details">{{ lastErrorMessage }}</div>
        <div class="correction-hint">正解: {{ lastCorrectStructure }}</div>
      </div>
      
      <!-- 連続建設エフェクト -->
      <div v-if="showCombo" class="combo-effect">
        <div class="combo-title">Construction Streak!</div>
        <div class="combo-count">{{ comboCount }}</div>
        <div class="combo-bonus">{{ comboBonus }}pts Bonus!</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import GameTimer from '@/components/shared/GameTimer.vue'
import StarRating from '@/components/shared/StarRating.vue'
import { useGrammarGame } from '@/composables/useGrammarGame'
import { useProgressTracking } from '@/composables/useProgressTracking'
import { grammarLevels } from '@/data/grammarLevels'

export default {
  name: 'GrammarConstructor',
  components: {
    ChevronLeftIcon,
    GameTimer,
    StarRating
  },
  setup() {
    const router = useRouter()
    
    // Composables
    const {
      gamePhase,
      score,
      totalQuestions,
      correctAnswers,
      currentStreak,
      maxStreak,
      timeRemaining,
      showSuccess,
      showError,
      showCombo,
      comboCount,
      accuracy,
      starsEarned,
      startGame: startGameCore,
      endGame,
      submitAnswer,
      playSound
    } = useGrammarGame({
      defaultTime: 45,
      baseScore: 100
    })
    
    const { updateGameProgress } = useProgressTracking()
    
    // ゲーム状態
    const selectedBlueprint = ref(null)
    const currentQuestion = ref(0)
    const currentPattern = ref(null)
    const constructionSlots = ref([])
    const availableBlocks = ref([])
    const draggedBlock = ref(null)
    const dragTargetSlot = ref(null)
    const isDragActive = ref(false)
    const isConstructionComplete = ref(false)
    const showConstructionAnimation = ref(false)
    const constructionEfficiency = ref(100)
    const lastErrorMessage = ref('')
    const lastCorrectStructure = ref('')
    const newAchievements = ref([])
    const comboBonus = computed(() => comboCount.value * 25)
    
    // 建設プラン
    const constructionPlans = ref([
      {
        id: 'foundation',
        name: 'Foundation Builder',
        description: '基本的なSVO構造の建設',
        icon: '🏗️',
        patterns: 8,
        timeLimit: 60,
        difficulty: 'beginner',
        structures: [
          {
            name: '基本SVO文',
            structure: 'Subject + Verb + Object',
            slots: [
              { type: 'subject', label: '主語' },
              { type: 'verb', label: '動詞' },
              { type: 'object', label: '目的語' }
            ],
            example: 'I play soccer'
          },
          {
            name: 'Be動詞文',
            structure: 'Subject + Be + Complement',
            slots: [
              { type: 'subject', label: '主語' },
              { type: 'be-verb', label: 'Be動詞' },
              { type: 'complement', label: '補語' }
            ],
            example: 'I am happy'
          }
        ]
      },
      {
        id: 'architect',
        name: 'Grammar Architect',
        description: '疑問文と否定文の建設',
        icon: '🏛️',
        patterns: 12,
        timeLimit: 45,
        difficulty: 'intermediate',
        structures: [
          {
            name: 'Do疑問文',
            structure: 'Do + Subject + Verb + Object?',
            slots: [
              { type: 'auxiliary', label: '助動詞' },
              { type: 'subject', label: '主語' },
              { type: 'verb', label: '動詞' },
              { type: 'object', label: '目的語' }
            ],
            example: 'Do you like music?'
          },
          {
            name: '否定文',
            structure: 'Subject + do not + Verb + Object',
            slots: [
              { type: 'subject', label: '主語' },
              { type: 'auxiliary', label: "don't" },
              { type: 'verb', label: '動詞' },
              { type: 'object', label: '目的語' }
            ],
            example: "I don't like spinach"
          }
        ]
      },
      {
        id: 'master',
        name: 'Master Constructor',
        description: '複合文と関係代名詞の建設',
        icon: '🏰',
        patterns: 15,
        timeLimit: 30,
        difficulty: 'advanced',
        structures: [
          {
            name: '複合文',
            structure: 'Sentence + Conjunction + Sentence',
            slots: [
              { type: 'subject', label: '主語1' },
              { type: 'verb', label: '動詞1' },
              { type: 'conjunction', label: '接続詞' },
              { type: 'subject', label: '主語2' },
              { type: 'verb', label: '動詞2' }
            ],
            example: 'I study hard and I get good grades'
          }
        ]
      }
    ])
    
    // 文法ブロックデータベース
    const blockDatabase = ref({
      subjects: [
        { id: 's1', text: 'I', type: 'subject', typeLabel: '主語', color: '#EF4444' },
        { id: 's2', text: 'You', type: 'subject', typeLabel: '主語', color: '#EF4444' },
        { id: 's3', text: 'He', type: 'subject', typeLabel: '主語', color: '#EF4444' },
        { id: 's4', text: 'She', type: 'subject', typeLabel: '主語', color: '#EF4444' },
        { id: 's5', text: 'We', type: 'subject', typeLabel: '主語', color: '#EF4444' },
        { id: 's6', text: 'They', type: 'subject', typeLabel: '主語', color: '#EF4444' }
      ],
      verbs: [
        { id: 'v1', text: 'play', type: 'verb', typeLabel: '動詞', color: '#10B981' },
        { id: 'v2', text: 'like', type: 'verb', typeLabel: '動詞', color: '#10B981' },
        { id: 'v3', text: 'eat', type: 'verb', typeLabel: '動詞', color: '#10B981' },
        { id: 'v4', text: 'watch', type: 'verb', typeLabel: '動詞', color: '#10B981' },
        { id: 'v5', text: 'read', type: 'verb', typeLabel: '動詞', color: '#10B981' },
        { id: 'v6', text: 'study', type: 'verb', typeLabel: '動詞', color: '#10B981' }
      ],
      objects: [
        { id: 'o1', text: 'soccer', type: 'object', typeLabel: '目的語', color: '#3B82F6' },
        { id: 'o2', text: 'music', type: 'object', typeLabel: '目的語', color: '#3B82F6' },
        { id: 'o3', text: 'books', type: 'object', typeLabel: '目的語', color: '#3B82F6' },
        { id: 'o4', text: 'movies', type: 'object', typeLabel: '目的語', color: '#3B82F6' },
        { id: 'o5', text: 'English', type: 'object', typeLabel: '目的語', color: '#3B82F6' },
        { id: 'o6', text: 'games', type: 'object', typeLabel: '目的語', color: '#3B82F6' }
      ],
      beVerbs: [
        { id: 'b1', text: 'am', type: 'be-verb', typeLabel: 'Be動詞', color: '#F59E0B' },
        { id: 'b2', text: 'is', type: 'be-verb', typeLabel: 'Be動詞', color: '#F59E0B' },
        { id: 'b3', text: 'are', type: 'be-verb', typeLabel: 'Be動詞', color: '#F59E0B' }
      ],
      complements: [
        { id: 'c1', text: 'happy', type: 'complement', typeLabel: '補語', color: '#8B5CF6' },
        { id: 'c2', text: 'tall', type: 'complement', typeLabel: '補語', color: '#8B5CF6' },
        { id: 'c3', text: 'a student', type: 'complement', typeLabel: '補語', color: '#8B5CF6' },
        { id: 'c4', text: 'tired', type: 'complement', typeLabel: '補語', color: '#8B5CF6' },
        { id: 'c5', text: 'at home', type: 'complement', typeLabel: '補語', color: '#8B5CF6' }
      ],
      auxiliaries: [
        { id: 'a1', text: 'Do', type: 'auxiliary', typeLabel: '助動詞', color: '#EC4899' },
        { id: 'a2', text: 'Does', type: 'auxiliary', typeLabel: '助動詞', color: '#EC4899' },
        { id: 'a3', text: "don't", type: 'auxiliary', typeLabel: '否定', color: '#EC4899' },
        { id: 'a4', text: "doesn't", type: 'auxiliary', typeLabel: '否定', color: '#EC4899' }
      ],
      conjunctions: [
        { id: 'con1', text: 'and', type: 'conjunction', typeLabel: '接続詞', color: '#6B7280' },
        { id: 'con2', text: 'but', type: 'conjunction', typeLabel: '接続詞', color: '#6B7280' },
        { id: 'con3', text: 'because', type: 'conjunction', typeLabel: '接続詞', color: '#6B7280' },
        { id: 'con4', text: 'so', type: 'conjunction', typeLabel: '接続詞', color: '#6B7280' }
      ]
    })
    
    // 計算プロパティ
    const canCheckConstruction = computed(() => {
      return constructionSlots.value.every(slot => slot.block !== null)
    })
    
    const masterRank = computed(() => {
      const acc = accuracy.value
      const eff = constructionEfficiency.value
      
      if (acc >= 95 && eff >= 90) {
        return { icon: '🏆', title: 'Master Architect', description: '完璧な建設技術' }
      } else if (acc >= 85 && eff >= 75) {
        return { icon: '🥇', title: 'Expert Builder', description: '優秀な建設スキル' }
      } else if (acc >= 70 && eff >= 60) {
        return { icon: '🥈', title: 'Skilled Constructor', description: '良好な建設能力' }
      } else if (acc >= 50) {
        return { icon: '🥉', title: 'Apprentice Builder', description: '基本的な建設技術' }
      } else {
        return { icon: '🔰', title: 'Construction Trainee', description: '練習が必要' }
      }
    })
    
    const skillEvaluation = computed(() => [
      { name: '語順理解', score: Math.min(100, accuracy.value + 10), color: '#EF4444' },
      { name: '構造認識', score: Math.min(100, constructionEfficiency.value), color: '#10B981' },
      { name: '文法知識', score: Math.min(100, (correctAnswers.value / totalQuestions.value) * 100), color: '#3B82F6' },
      { name: '建設速度', score: Math.min(100, 100 - (timeRemaining.value / 60 * 100)), color: '#F59E0B' }
    ])
    
    // ブロックスタイル
    const getBlockStyle = (index) => {
      const angle = (index - 1) * 60
      const radius = 80
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.3}s`
      }
    }
    
    const getSparkStyle = (index) => {
      const angle = (index - 1) * 45
      const radius = 40
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.1}s`
      }
    }
    
    const getSlotIcon = (type) => {
      const icons = {
        subject: '👤',
        verb: '⚡',
        object: '🎯',
        'be-verb': '✨',
        complement: '💫',
        auxiliary: '❓',
        conjunction: '🔗'
      }
      return icons[type] || '📝'
    }
    
    const getEfficiencyClass = () => {
      if (constructionEfficiency.value >= 85) return 'high-efficiency'
      if (constructionEfficiency.value >= 60) return 'medium-efficiency'
      return 'low-efficiency'
    }
    
    // 設計図選択
    const selectBlueprint = (blueprint) => {
      selectedBlueprint.value = blueprint
      totalQuestions.value = blueprint.patterns
    }
    
    // 建設開始
    const startConstruction = () => {
      if (!selectedBlueprint.value) return
      
      startGameCore({
        timeLimit: selectedBlueprint.value.timeLimit
      })
      
      generateConstructionProject()
    }
    
    // 建設プロジェクト生成
    const generateConstructionProject = () => {
      if (currentQuestion.value >= totalQuestions.value) {
        endGame('completed')
        return
      }
      
      // パターンを選択
      const structures = selectedBlueprint.value.structures
      currentPattern.value = structures[Math.floor(Math.random() * structures.length)]
      
      // 建設スロットを初期化
      constructionSlots.value = currentPattern.value.slots.map((slot, index) => ({
        id: index,
        type: slot.type,
        label: slot.label,
        block: null,
        correct: false
      }))
      
      // 利用可能ブロックを生成
      generateAvailableBlocks()
      
      // 状態リセット
      isConstructionComplete.value = false
      showConstructionAnimation.value = false
    }
    
    // 利用可能ブロックを生成
    const generateAvailableBlocks = () => {
      const blocks = []
      const pattern = currentPattern.value
      
      // 正解ブロック + ダミーブロックを生成
      pattern.slots.forEach(slot => {
        const blockType = slot.type
        const database = blockDatabase.value
        
        let sourceBlocks = []
        switch (blockType) {
          case 'subject':
            sourceBlocks = database.subjects
            break
          case 'verb':
            sourceBlocks = database.verbs
            break
          case 'object':
            sourceBlocks = database.objects
            break
          case 'be-verb':
            sourceBlocks = database.beVerbs
            break
          case 'complement':
            sourceBlocks = database.complements
            break
          case 'auxiliary':
            sourceBlocks = database.auxiliaries
            break
          case 'conjunction':
            sourceBlocks = database.conjunctions
            break
        }
        
        // ランダムにブロックを選択
        if (sourceBlocks.length > 0) {
          const selectedBlocks = sourceBlocks.slice().sort(() => Math.random() - 0.5).slice(0, 3)
          blocks.push(...selectedBlocks)
        }
      })
      
      // 使用状態をリセット
      availableBlocks.value = blocks.map(block => ({
        ...block,
        used: false
      }))
    }
    
    // ドラッグ&ドロップ処理
    const handleDragStart = (block, event) => {
      if (block.used) return
      
      draggedBlock.value = block
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', block.id)
    }
    
    const handleDragEnd = () => {
      draggedBlock.value = null
      dragTargetSlot.value = null
      isDragActive.value = false
    }
    
    const handleDragOver = (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
    
    const handleDragEnter = (event) => {
      event.preventDefault()
      isDragActive.value = true
      
      // ターゲットスロットを特定
      const slotElement = event.target.closest('[data-slot-index]')
      if (slotElement) {
        dragTargetSlot.value = parseInt(slotElement.dataset.slotIndex)
      }
    }
    
    const handleDragLeave = (event) => {
      // ドロップゾーンから完全に出た場合のみ
      if (!event.currentTarget.contains(event.relatedTarget)) {
        isDragActive.value = false
        dragTargetSlot.value = null
      }
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      
      const slotElement = event.target.closest('[data-slot-index]')
      if (!slotElement || !draggedBlock.value) return
      
      const slotIndex = parseInt(slotElement.dataset.slotIndex)
      const slot = constructionSlots.value[slotIndex]
      
      // 既にブロックがある場合は置き換え
      if (slot.block) {
        // 前のブロックを利用可能に戻す
        const prevBlock = availableBlocks.value.find(b => b.id === slot.block.id)
        if (prevBlock) prevBlock.used = false
      }
      
      // 新しいブロックを配置
      slot.block = { ...draggedBlock.value }
      draggedBlock.value.used = true
      
      // 効率を更新
      updateConstructionEfficiency()
      
      // ドラッグ状態リセット
      handleDragEnd()
    }
    
    // ブロック削除
    const removeBlock = (slotIndex) => {
      const slot = constructionSlots.value[slotIndex]
      if (!slot.block) return
      
      // ブロックを利用可能に戻す
      const block = availableBlocks.value.find(b => b.id === slot.block.id)
      if (block) block.used = false
      
      // スロットをクリア
      slot.block = null
      slot.correct = false
      
      updateConstructionEfficiency()
    }
    
    // 建設効率更新
    const updateConstructionEfficiency = () => {
      const filledSlots = constructionSlots.value.filter(slot => slot.block).length
      const totalSlots = constructionSlots.value.length
      
      if (totalSlots === 0) {
        constructionEfficiency.value = 100
        return
      }
      
      const fillRatio = filledSlots / totalSlots
      const correctPlacement = constructionSlots.value.filter(slot => 
        slot.block && slot.block.type === slot.type
      ).length
      
      const correctRatio = totalSlots > 0 ? correctPlacement / totalSlots : 0
      
      constructionEfficiency.value = Math.round((fillRatio * 50) + (correctRatio * 50))
    }
    
    // 建設チェック
    const checkConstruction = () => {
      if (!canCheckConstruction.value) return
      
      let isCorrect = true
      let correctPlacements = 0
      
      constructionSlots.value.forEach(slot => {
        if (slot.block && slot.block.type === slot.type) {
          slot.correct = true
          correctPlacements++
        } else {
          slot.correct = false
          isCorrect = false
        }
      })
      
      if (isCorrect) {
        isConstructionComplete.value = true
        showConstructionAnimation.value = true
        playSound('constructionComplete')
        
        // 建設完了エフェクト
        setTimeout(() => {
          showConstructionAnimation.value = false
        }, 2000)
      } else {
        lastErrorMessage.value = `${correctPlacements}/${constructionSlots.value.length} 正しく配置されています`
        lastCorrectStructure.value = currentPattern.value.example
      }
      
      // totalQuestionsを手動で増加
      totalQuestions.value++
      
      // 答えを提出
      submitAnswer(isCorrect, {
        pattern: currentPattern.value.structure,
        efficiency: constructionEfficiency.value,
        correctPlacements
      })
      
      // 次のプロジェクトへ
      setTimeout(() => {
        currentQuestion.value++
        generateConstructionProject()
      }, 3000)
    }
    
    // 建設リセット
    const resetConstruction = () => {
      // 全ブロックを利用可能に戻す
      availableBlocks.value.forEach(block => {
        block.used = false
      })
      
      // スロットをクリア
      constructionSlots.value.forEach(slot => {
        slot.block = null
        slot.correct = false
      })
      
      updateConstructionEfficiency()
    }
    
    // 音声再生
    const playAudio = () => {
      if (!isConstructionComplete.value) return
      
      const sentence = constructionSlots.value
        .map(slot => slot.block?.text)
        .filter(text => text)
        .join(' ')
      
      // Web Speech API を使用して音声合成
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }
    
    // 時間切れ処理
    const handleTimeUp = () => {
      endGame('timeout')
    }
    
    // もう一度プレイ
    const playAgain = () => {
      currentQuestion.value = 0
      currentPattern.value = null
      constructionSlots.value = []
      availableBlocks.value = []
      isConstructionComplete.value = false
      constructionEfficiency.value = 100
      
      gamePhase.value = 'intro'
    }
    
    // 戻る
    const goBack = () => {
      router.push('/grammar-galaxy')
    }
    
    return {
      // State
      gamePhase,
      selectedBlueprint,
      currentQuestion,
      totalQuestions,
      currentPattern,
      constructionSlots,
      availableBlocks,
      draggedBlock,
      dragTargetSlot,
      isDragActive,
      isConstructionComplete,
      showConstructionAnimation,
      constructionEfficiency,
      lastErrorMessage,
      lastCorrectStructure,
      newAchievements,
      constructionPlans,
      
      // Game state
      score,
      correctAnswers,
      currentStreak,
      maxStreak,
      timeRemaining,
      accuracy,
      starsEarned,
      
      // Effects
      showSuccess,
      showError,
      showCombo,
      comboCount,
      comboBonus,
      
      // Computed
      canCheckConstruction,
      masterRank,
      skillEvaluation,
      
      // Methods
      getBlockStyle,
      getSparkStyle,
      getSlotIcon,
      getEfficiencyClass,
      selectBlueprint,
      startConstruction,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      removeBlock,
      checkConstruction,
      resetConstruction,
      playAudio,
      handleTimeUp,
      playAgain,
      goBack,
      playSound
    }
  }
}
</script>

<style scoped>
.grammar-constructor {
  @apply min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 relative overflow-hidden;
}

/* 建設アクティブ時の背景エフェクト */
.construction-active::before {
  content: '';
  @apply absolute inset-0 opacity-15;
  background: 
    radial-gradient(circle at 30% 30%, #ff6b35 0%, transparent 30%),
    radial-gradient(circle at 70% 70%, #ffa726 0%, transparent 30%),
    linear-gradient(45deg, transparent 40%, rgba(255, 183, 77, 0.1) 50%, transparent 60%);
  animation: constructionAmbient 12s ease-in-out infinite alternate;
}

@keyframes constructionAmbient {
  0% { transform: translateX(0) translateY(0); }
  100% { transform: translateX(-20px) translateY(-15px); }
}

/* ヘッダー */
.game-header {
  @apply relative z-10 flex items-center justify-between p-6 bg-black bg-opacity-30 backdrop-blur-md border-b border-orange-500 border-opacity-30;
}

.header-left {
  @apply flex items-center gap-4;
}

.back-button {
  @apply flex items-center gap-2 px-3 py-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 text-white;
}

.game-title {
  @apply text-2xl font-bold text-white;
}

.header-right {
  @apply flex items-center gap-6;
}

.construction-meter {
  @apply flex flex-col items-center gap-1;
}

.meter-label {
  @apply text-xs text-gray-300;
}

.meter-bar {
  @apply w-24 h-3 bg-gray-700 rounded-full overflow-hidden;
}

.meter-fill {
  @apply h-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 transition-all duration-500;
}

.meter-value {
  @apply text-sm font-bold text-orange-400;
}

.score-display {
  @apply text-white;
}

.score-label {
  @apply text-gray-300 mr-2;
}

.score-value {
  @apply text-xl font-bold text-yellow-400;
}

/* イントロ画面 */
.intro-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.intro-content {
  @apply max-w-5xl text-center text-white;
}

.constructor-visual {
  @apply relative mb-8 h-64;
}

.construction-site {
  @apply relative w-full h-full;
}

.crane {
  @apply text-8xl absolute top-1/4 left-1/2 transform -translate-x-1/2;
  animation: craneSwing 4s ease-in-out infinite alternate;
}

.building-blocks {
  @apply absolute inset-0;
}

.floating-block {
  @apply absolute w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-orange-300;
  animation: blockFloat 3s ease-in-out infinite;
}

.foundation {
  @apply text-6xl absolute bottom-0 left-1/2 transform -translate-x-1/2;
}

.intro-title {
  @apply text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent;
}

.intro-description {
  @apply text-lg text-gray-300 mb-8 leading-relaxed;
}

/* チュートリアル */
.construction-tutorials h3 {
  @apply text-xl font-semibold mb-4;
}

.tutorial-steps {
  @apply flex justify-center gap-8 mb-8;
}

.tutorial-step {
  @apply flex flex-col items-center text-center;
}

.step-number {
  @apply w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mb-2;
}

.step-icon {
  @apply text-3xl mb-2;
}

.step-text {
  @apply text-sm text-gray-300;
}

/* 設計図選択 */
.blueprint-selector h3 {
  @apply text-xl font-semibold mb-4;
}

.blueprint-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-8;
}

.blueprint-button {
  @apply p-6 rounded-xl border-2 border-transparent bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 text-center cursor-pointer;
}

.blueprint-button:hover,
.blueprint-button.selected {
  @apply border-orange-400 transform scale-105;
}

.blueprint-button.foundation { @apply hover:border-green-400; }
.blueprint-button.architect { @apply hover:border-blue-400; }
.blueprint-button.master { @apply hover:border-purple-400; }

.blueprint-icon {
  @apply text-3xl mb-2;
}

.blueprint-name {
  @apply text-lg font-semibold mb-1;
}

.blueprint-description {
  @apply text-sm text-gray-300 mb-2;
}

.blueprint-stats {
  @apply text-xs text-orange-400 space-x-2;
}

.start-button {
  @apply px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold text-lg hover:from-orange-400 hover:to-red-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* ゲーム画面 */
.game-screen {
  @apply relative z-10 p-6 space-y-6;
}

.construction-status {
  @apply flex items-center justify-between bg-black bg-opacity-30 backdrop-blur-md rounded-xl p-4;
}

.project-info {
  @apply text-white;
}

.project-label {
  @apply text-sm text-gray-300;
}

.project-name {
  @apply text-lg font-bold text-orange-400 mx-2;
}

.project-number {
  @apply text-gray-300;
}

.efficiency-display {
  @apply text-white text-right;
}

.efficiency-label {
  @apply text-sm text-gray-300;
}

.efficiency-value {
  @apply text-lg font-bold;
}

.efficiency-value.high-efficiency { @apply text-green-400; }
.efficiency-value.medium-efficiency { @apply text-yellow-400; }
.efficiency-value.low-efficiency { @apply text-red-400; }

/* 建設エリア */
.construction-area {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

/* 設計図 */
.blueprint-display {
  @apply bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6;
}

.blueprint-title {
  @apply text-white text-lg font-semibold mb-4 text-center;
}

.structure-diagram {
  @apply flex flex-wrap justify-center gap-2 mb-4;
}

.structure-slot {
  @apply px-3 py-2 rounded-lg text-white text-sm font-semibold border-2;
}

.structure-slot.subject { @apply bg-red-500 bg-opacity-30 border-red-400; }
.structure-slot.verb { @apply bg-green-500 bg-opacity-30 border-green-400; }
.structure-slot.object { @apply bg-blue-500 bg-opacity-30 border-blue-400; }
.structure-slot.be-verb { @apply bg-yellow-500 bg-opacity-30 border-yellow-400; }
.structure-slot.complement { @apply bg-purple-500 bg-opacity-30 border-purple-400; }
.structure-slot.auxiliary { @apply bg-pink-500 bg-opacity-30 border-pink-400; }
.structure-slot.conjunction { @apply bg-gray-500 bg-opacity-30 border-gray-400; }

.slot-label {
  @apply block;
}

.slot-type {
  @apply text-xs opacity-70;
}

.example-sentence {
  @apply text-center text-white;
}

.example-label {
  @apply text-gray-300;
}

.example-text {
  @apply text-orange-400 font-semibold ml-2;
}

/* 建設基盤 */
.construction-foundation {
  @apply lg:col-span-2;
}

.foundation-title {
  @apply text-white text-lg font-semibold mb-4 text-center;
}

.drop-zone {
  @apply min-h-64 bg-white bg-opacity-5 border-2 border-dashed border-gray-500 rounded-xl p-6 transition-all duration-300;
}

.drop-zone.drop-active {
  @apply border-orange-400 bg-orange-400 bg-opacity-10;
}

.drop-zone.construction-complete {
  @apply border-green-400 bg-green-400 bg-opacity-20;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.construction-slots {
  @apply flex flex-wrap justify-center gap-4;
}

.construction-slot {
  @apply w-32 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center relative transition-all duration-300;
}

.construction-slot.filled {
  @apply border-solid;
}

.construction-slot.correct {
  @apply border-green-400 bg-green-400 bg-opacity-20;
}

.construction-slot.incorrect {
  @apply border-red-400 bg-red-400 bg-opacity-20;
}

.construction-slot.target {
  @apply border-orange-400 bg-orange-400 bg-opacity-20 scale-110;
}

.slot-placeholder {
  @apply text-center text-gray-400;
}

.placeholder-icon {
  @apply text-2xl mb-1;
}

.placeholder-text {
  @apply text-xs;
}

.placed-block {
  @apply w-full h-full rounded-lg flex items-center justify-center relative text-white font-semibold;
}

.placed-block.subject { @apply bg-red-500; }
.placed-block.verb { @apply bg-green-500; }
.placed-block.object { @apply bg-blue-500; }
.placed-block.be-verb { @apply bg-yellow-500; }
.placed-block.complement { @apply bg-purple-500; }
.placed-block.auxiliary { @apply bg-pink-500; }
.placed-block.conjunction { @apply bg-gray-500; }

.block-text {
  @apply text-center;
}

.remove-button {
  @apply absolute -top-2 -right-2 w-6 h-6 text-xs bg-red-500 rounded-full hover:bg-red-400 transition-colors duration-200;
}

/* 建設アニメーション */
.construction-animation {
  @apply absolute inset-0 pointer-events-none;
}

.building-effect {
  @apply relative w-full h-full;
}

.construction-spark {
  @apply absolute text-2xl;
  animation: constructionSparkle 2s ease-out forwards;
}

/* ブロック工場 */
.block-factory {
  @apply bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6;
}

.factory-title {
  @apply text-white text-lg font-semibold mb-4 text-center;
}

.block-inventory {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.grammar-block {
  @apply relative p-3 rounded-lg cursor-grab transition-all duration-300 transform hover:scale-105;
}

.grammar-block:active {
  @apply cursor-grabbing;
}

.grammar-block.used {
  @apply opacity-50 cursor-not-allowed;
}

.grammar-block.dragging {
  @apply opacity-50 scale-110;
}

.grammar-block.subject { @apply bg-red-500; }
.grammar-block.verb { @apply bg-green-500; }
.grammar-block.object { @apply bg-blue-500; }
.grammar-block.be-verb { @apply bg-yellow-500; }
.grammar-block.complement { @apply bg-purple-500; }
.grammar-block.auxiliary { @apply bg-pink-500; }
.grammar-block.conjunction { @apply bg-gray-500; }

.block-content {
  @apply text-white text-center;
}

.block-text {
  @apply font-semibold;
}

.block-type-label {
  @apply text-xs opacity-80 mt-1;
}

.block-shadow {
  @apply absolute inset-0 bg-black bg-opacity-20 rounded-lg transform translate-y-1;
  z-index: -1;
}

/* アクションパネル */
.action-panel {
  @apply flex justify-center gap-4 mt-8;
}

.check-button,
.reset-button,
.audio-button {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed;
}

.check-button {
  @apply bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white;
}

.reset-button {
  @apply bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white;
}

.audio-button {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white;
}

/* 結果画面 */
.results-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.results-content {
  @apply max-w-5xl text-center text-white;
}

.construction-portfolio {
  @apply mb-8;
}

.portfolio-title {
  @apply text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent;
}

.master-badge {
  @apply mb-6;
}

.badge-icon {
  @apply text-8xl mb-4;
}

.badge-title {
  @apply text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent;
}

.badge-description {
  @apply text-lg text-gray-300;
}

.construction-summary h3 {
  @apply text-2xl font-bold mb-4;
}

.summary-cards {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-8;
}

.summary-card {
  @apply bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 text-center;
}

.card-icon {
  @apply text-3xl mb-2;
}

.card-label {
  @apply text-sm text-gray-300 mb-1;
}

.card-value {
  @apply text-2xl font-bold text-orange-400;
}

.skill-evaluation h3 {
  @apply text-2xl font-bold mb-4;
}

.skill-radar {
  @apply space-y-3 mb-8;
}

.skill-metric {
  @apply flex items-center gap-4;
}

.skill-name {
  @apply w-24 text-sm font-semibold text-left;
}

.skill-bar {
  @apply flex-1 h-4 bg-gray-700 rounded-full overflow-hidden;
}

.skill-progress {
  @apply h-full transition-all duration-1000;
}

.skill-score {
  @apply w-12 text-sm font-bold text-right;
}

.achievement-showcase h3 {
  @apply text-2xl font-bold mb-4;
}

.achievement-list {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-8;
}

.achievement-item {
  @apply bg-yellow-400 bg-opacity-20 border border-yellow-400 rounded-xl p-4 text-center;
}

.achievement-icon {
  @apply text-3xl mb-2;
}

.achievement-name {
  @apply font-semibold mb-1;
}

.achievement-description {
  @apply text-sm text-gray-300;
}

.results-actions {
  @apply flex justify-center gap-4;
}

.action-button {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105;
}

.action-button.primary {
  @apply bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400;
}

.action-button.secondary {
  @apply bg-gray-600 hover:bg-gray-500;
}

/* エフェクト */
.effects-container {
  @apply fixed inset-0 pointer-events-none z-50;
}

.success-effect,
.error-effect,
.combo-effect {
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center;
}

.success-text {
  @apply text-4xl font-bold text-green-400 mb-4;
  animation: successConstruction 1s ease-out;
}

.success-animation {
  @apply relative;
}

.construction-complete-icon {
  @apply text-8xl mb-4;
  animation: constructionComplete 1s ease-out;
}

.celebration-particles .celebration-particle {
  @apply absolute text-2xl;
  animation: celebrationBurst 1.5s ease-out forwards;
}

.error-text {
  @apply text-3xl font-bold text-red-400 mb-2;
  animation: errorConstruction 0.5s ease-out;
}

.error-details {
  @apply text-lg text-yellow-400 mb-2;
}

.correction-hint {
  @apply text-lg text-orange-400;
  animation: hintAppear 1s ease-out 0.5s both;
}

.combo-effect {
  animation: comboConstruction 1.5s ease-out;
}

.combo-title {
  @apply text-3xl font-bold text-yellow-400;
}

.combo-count {
  @apply text-6xl font-bold text-orange-400;
}

.combo-bonus {
  @apply text-lg text-green-400;
}

/* アニメーション */
@keyframes craneSwing {
  0% { transform: translateX(-50%) rotate(-5deg); }
  100% { transform: translateX(-50%) rotate(5deg); }
}

@keyframes blockFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes constructionSparkle {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}

@keyframes successConstruction {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes constructionComplete {
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.3) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes celebrationBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(0.5);
  }
}

@keyframes errorConstruction {
  0%, 100% { transform: translate(-50%, -50%) translateX(0); }
  25% { transform: translate(-50%, -50%) translateX(-10px); }
  75% { transform: translate(-50%, -50%) translateX(10px); }
}

@keyframes hintAppear {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes comboConstruction {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .construction-area {
    @apply grid-cols-1;
  }
  
  .tutorial-steps {
    @apply grid grid-cols-2 gap-4;
  }
  
  .blueprint-options {
    @apply grid-cols-1;
  }
  
  .construction-status {
    @apply flex-col gap-4;
  }
  
  .construction-slots {
    @apply grid grid-cols-2 gap-2;
  }
  
  .construction-slot {
    @apply w-28 h-16;
  }
  
  .summary-cards {
    @apply grid-cols-2;
  }
  
  .action-panel {
    @apply flex-col gap-2;
  }
}</style>