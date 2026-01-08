<template>
  <div class="energy-barriers">
    <!-- Background Effects -->
    <CosmicParticles intensity="high" theme="energy" />

    <!-- Header -->
    <div class="barriers-header">
      <button class="back-button" @click="$emit('exit-barriers')">
        <span class="back-icon">←</span>
        <span>戻る</span>
      </button>

      <div class="header-info">
        <h1 class="barriers-title">エネルギー・バリア・チャレンジ</h1>
        <p class="barriers-subtitle">
          エネルギーの流れを読み解き、文法の奥義を解き放て
        </p>
      </div>

      <div class="energy-status">
        <div class="energy-display">
          <span class="energy-icon">⚡</span>
          <span class="energy-text">{{ currentEnergy }}/{{ maxEnergy }}</span>
        </div>
      </div>
    </div>

    <!-- Challenge Selection -->
    <div class="challenge-grid">
      <div
        v-for="challenge in challenges"
        :key="challenge.id"
        class="challenge-card"
        :class="{
          'locked': !challenge.unlocked,
          'completed': challenge.completed,
          'active': activeChallenge?.id === challenge.id
        }"
        @click="selectChallenge(challenge)"
      >
        <!-- Lock Overlay -->
        <div v-if="!challenge.unlocked" class="lock-overlay">
          <div class="lock-icon">🔒</div>
          <p class="unlock-text">{{ challenge.unlockCondition }}</p>
        </div>

        <!-- Challenge Content -->
        <div class="challenge-content">
          <div class="challenge-header">
            <div class="challenge-icon">{{ challenge.icon }}</div>
            <div class="challenge-level">Lv.{{ challenge.level }}</div>
          </div>

          <h3 class="challenge-name">{{ challenge.name }}</h3>
          <p class="challenge-description">{{ challenge.description }}</p>

          <div class="challenge-stats">
            <div class="stat-row">
              <span class="stat-label">エネルギー消費</span>
              <span class="stat-value energy">{{ challenge.energyCost }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">報酬</span>
              <span class="stat-value reward">{{ challenge.reward }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">難易度</span>
              <div class="difficulty-stars">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="star"
                  :class="{ active: n <= challenge.difficulty }"
                >⭐</span>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="challenge.attempts > 0" class="progress-section">
            <div class="progress-label">
              進行度 ({{ challenge.attempts }}回挑戦)
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${challenge.progress}%` }"
              ></div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            class="challenge-action"
            :disabled="!challenge.unlocked || currentEnergy < challenge.energyCost"
            @click.stop="startChallenge(challenge)"
          >
            <span v-if="!challenge.unlocked">🔒 ロック中</span>
            <span v-else-if="currentEnergy < challenge.energyCost">
              ⚡ エネルギー不足
            </span>
            <span v-else-if="challenge.completed">🏆 再挑戦</span>
            <span v-else>⚡ 挑戦開始</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Challenge Panel -->
    <div v-if="activeChallenge && showChallengePanel" class="challenge-panel">
      <div class="panel-header">
        <h2 class="panel-title">{{ activeChallenge.name }}</h2>
        <button class="close-panel" @click="closeChallengePanel">×</button>
      </div>

      <div class="panel-content">
        <!-- Energy Flow Visualization -->
        <div class="energy-flow">
          <div class="flow-title">エネルギーフロー</div>
          <div class="flow-diagram">
            <div
              v-for="(node, index) in energyNodes"
              :key="node.id"
              class="energy-node"
              :class="{
                'active': node.active,
                'completed': node.completed,
                'blocked': node.blocked
              }"
              :style="getNodePosition(index)"
              @click="activateNode(node)"
            >
              <div class="node-icon">{{ node.icon }}</div>
              <div class="node-label">{{ node.label }}</div>
            </div>
          </div>

          <!-- Energy Connections -->
          <svg class="energy-connections" viewBox="0 0 800 600">
            <path
              v-for="connection in energyConnections"
              :key="connection.id"
              :d="connection.path"
              class="connection-line"
              :class="{ active: connection.active }"
            />
          </svg>
        </div>

        <!-- Grammar Challenge -->
        <div class="grammar-challenge">
          <h3 class="challenge-question">{{ currentQuestion?.question }}</h3>

          <!-- Question Type: Energy Flow -->
          <div v-if="currentQuestion?.type === 'energy_flow'" class="flow-challenge">
            <p class="instruction">正しいエネルギーの流れを選択してください：</p>
            <div class="flow-options">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="flow-option"
                :class="{
                  'selected': selectedAnswer === option.id,
                  'correct': showResult && option.correct,
                  'incorrect': showResult && selectedAnswer === option.id && !option.correct
                }"
                @click="selectAnswer(option.id)"
                :disabled="showResult"
              >
                {{ option.text }}
              </button>
            </div>
          </div>

          <!-- Question Type: Pattern Recognition -->
          <div v-else-if="currentQuestion?.type === 'pattern_recognition'" class="pattern-challenge">
            <p class="instruction">エネルギーパターンを完成させてください：</p>
            <div class="pattern-grid">
              <div
                v-for="(slot, index) in patternSlots"
                :key="index"
                class="pattern-slot"
                :class="{ filled: slot.value, correct: slot.correct }"
                @click="fillSlot(index)"
              >
                {{ slot.value || '?' }}
              </div>
            </div>
            <div class="pattern-pieces">
              <button
                v-for="piece in availablePieces"
                :key="piece.id"
                class="pattern-piece"
                :disabled="piece.used"
                @click="selectPiece(piece)"
              >
                {{ piece.value }}
              </button>
            </div>
          </div>

          <!-- Question Type: Sequence Building -->
          <div v-else-if="currentQuestion?.type === 'sequence_building'" class="sequence-challenge">
            <p class="instruction">正しいエネルギー配列を構築してください：</p>
            <div class="sequence-builder">
              <div class="target-sequence">
                <span class="sequence-label">目標:</span>
                <div class="sequence-items">
                  <div
                    v-for="(item, index) in targetSequence"
                    :key="index"
                    class="sequence-item target"
                  >
                    {{ item }}
                  </div>
                </div>
              </div>
              <div class="current-sequence">
                <span class="sequence-label">現在:</span>
                <div class="sequence-items">
                  <div
                    v-for="(item, index) in currentSequence"
                    :key="index"
                    class="sequence-item current"
                    @click="removeFromSequence(index)"
                  >
                    {{ item }}
                  </div>
                </div>
              </div>
            </div>
            <div class="sequence-pieces">
              <button
                v-for="piece in sequencePieces"
                :key="piece.id"
                class="sequence-piece"
                :disabled="piece.used"
                @click="addToSequence(piece)"
              >
                {{ piece.value }}
              </button>
            </div>
          </div>

          <!-- Result Display -->
          <div v-if="showResult" class="result-display">
            <div class="result-message" :class="{ correct: isCorrect, incorrect: !isCorrect }">
              <span class="result-icon">{{ isCorrect ? '✅' : '❌' }}</span>
              <span class="result-text">
                {{ isCorrect ? '正解！エネルギーが解放されました！' : '不正解。もう一度挑戦してみてください。' }}
              </span>
            </div>
            <div v-if="currentQuestion?.explanation" class="explanation">
              <h4 class="explanation-title">解説</h4>
              <p class="explanation-text">{{ currentQuestion.explanation }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="challenge-actions">
            <button
              class="action-button submit"
              :disabled="!canSubmit || showResult"
              @click="submitAnswer"
            >
              回答を提出
            </button>
            <button
              v-if="showResult"
              class="action-button continue"
              @click="nextQuestion"
            >
              {{ hasMoreQuestions ? '次の問題' : 'チャレンジ完了' }}
            </button>
            <button
              class="action-button hint"
              @click="showHint = !showHint"
              :disabled="showResult"
            >
              💡 ヒント
            </button>
          </div>

          <!-- Hint Display -->
          <div v-if="showHint && currentQuestion?.hint" class="hint-display">
            <div class="hint-icon">💡</div>
            <p class="hint-text">{{ currentQuestion.hint }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Effects -->
    <StarBurst
      v-if="showSuccessEffect"
      :trigger="showSuccessEffect"
      type="energy"
      :position="effectPosition"
      intensity="high"
      @complete="showSuccessEffect = false"
    />

    <!-- Warp Transition for challenge completion -->
    <WarpTransition
      v-if="showWarpTransition"
      @complete="showWarpTransition = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGrammarArtGalleryStore } from '@/stores/grammarArtGalleryStore'
import CosmicParticles from '../effects/CosmicParticles.vue'
import StarBurst from '../effects/StarBurst.vue'
import WarpTransition from '../effects/WarpTransition.vue'

const store = useGrammarArtGalleryStore()

const emit = defineEmits(['exit-barriers', 'challenge-completed'])

// Reactive state
const activeChallenge = ref(null)
const showChallengePanel = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const showResult = ref(false)
const isCorrect = ref(false)
const showHint = ref(false)
const showSuccessEffect = ref(false)
const showWarpTransition = ref(false)
const effectPosition = ref({ x: 50, y: 50 })

// Challenge-specific state
const energyNodes = ref([])
const energyConnections = ref([])
const patternSlots = ref([])
const availablePieces = ref([])
const selectedPiece = ref(null)
const targetSequence = ref([])
const currentSequence = ref([])
const sequencePieces = ref([])

// Computed properties
const currentEnergy = computed(() => store.playerStats.energy)
const maxEnergy = computed(() => store.playerStats.maxEnergy)

// energyBarriersが存在しない場合のデフォルト値
const energyBarriersData = computed(() => energyBarriersData.value || {
  completed: [],
  attempts: {},
  progress: {}
})

const challenges = computed(() => [
  {
    id: 'basic_flow',
    name: '基本エネルギーフロー',
    description: '文法の基本的なエネルギーの流れを理解しよう',
    icon: '⚡',
    level: 1,
    difficulty: 2,
    energyCost: 10,
    reward: '+50 EXP, エネルギー増幅器',
    unlocked: true,
    completed: energyBarriersData.value.completed.includes('basic_flow'),
    unlockCondition: '',
    attempts: energyBarriersData.value.attempts.basic_flow || 0,
    progress: energyBarriersData.value.progress.basic_flow || 0
  },
  {
    id: 'pattern_weaving',
    name: 'パターン織り',
    description: '複雑な文法パターンのエネルギーを編み上げる',
    icon: '🌀',
    level: 2,
    difficulty: 3,
    energyCost: 15,
    reward: '+75 EXP, パターン強化器',
    unlocked: energyBarriersData.value.completed.includes('basic_flow'),
    completed: energyBarriersData.value.completed.includes('pattern_weaving'),
    unlockCondition: '基本エネルギーフローを完了',
    attempts: energyBarriersData.value.attempts.pattern_weaving || 0,
    progress: energyBarriersData.value.progress.pattern_weaving || 0
  },
  {
    id: 'syntax_storm',
    name: 'シンタックス・ストーム',
    description: '嵐のような複雑な構文エネルギーを制御する',
    icon: '⛈️',
    level: 3,
    difficulty: 4,
    energyCost: 20,
    reward: '+100 EXP, ストーム制御器',
    unlocked: energyBarriersData.value.completed.includes('pattern_weaving'),
    completed: energyBarriersData.value.completed.includes('syntax_storm'),
    unlockCondition: 'パターン織りを完了',
    attempts: energyBarriersData.value.attempts.syntax_storm || 0,
    progress: energyBarriersData.value.progress.syntax_storm || 0
  },
  {
    id: 'quantum_grammar',
    name: 'クアンタム文法',
    description: '量子レベルでの文法エネルギーを操作する',
    icon: '🔮',
    level: 4,
    difficulty: 5,
    energyCost: 25,
    reward: '+150 EXP, クアンタム増幅器',
    unlocked: energyBarriersData.value.completed.includes('syntax_storm'),
    completed: energyBarriersData.value.completed.includes('quantum_grammar'),
    unlockCondition: 'シンタックス・ストームを完了',
    attempts: energyBarriersData.value.attempts.quantum_grammar || 0,
    progress: energyBarriersData.value.progress.quantum_grammar || 0
  }
])

const currentQuestion = computed(() => {
  if (!activeChallenge.value?.questions) return null
  return activeChallenge.value.questions[currentQuestionIndex.value]
})

const hasMoreQuestions = computed(() => {
  if (!activeChallenge.value?.questions) return false
  return currentQuestionIndex.value < activeChallenge.value.questions.length - 1
})

const canSubmit = computed(() => {
  if (!currentQuestion.value) return false

  switch (currentQuestion.value.type) {
    case 'energy_flow':
      return selectedAnswer.value !== null
    case 'pattern_recognition':
      return patternSlots.value.every(slot => slot.value)
    case 'sequence_building':
      return currentSequence.value.length === targetSequence.value.length
    default:
      return false
  }
})

// Methods
function selectChallenge(challenge) {
  if (!challenge.unlocked) return
  activeChallenge.value = challenge
}

function startChallenge(challenge) {
  if (!challenge.unlocked || currentEnergy.value < challenge.energyCost) return

  store.consumeEnergy(challenge.energyCost)
  store.startEnergyBarrierChallenge(challenge.id)

  activeChallenge.value = challenge
  showChallengePanel.value = true
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showResult.value = false
  showHint.value = false

  initializeChallenge(challenge)
}

function closeChallengePanel() {
  showChallengePanel.value = false
  activeChallenge.value = null
  resetChallengeState()
}

function initializeChallenge(challenge) {
  // Generate questions based on challenge type
  challenge.questions = generateQuestions(challenge.id)

  // Initialize challenge-specific state
  if (currentQuestion.value?.type === 'pattern_recognition') {
    initializePatternChallenge()
  } else if (currentQuestion.value?.type === 'sequence_building') {
    initializeSequenceChallenge()
  }

  // Initialize energy flow visualization
  initializeEnergyFlow()
}

function generateQuestions(challengeId) {
  const questionSets = {
    basic_flow: [
      {
        id: 1,
        type: 'energy_flow',
        question: '主語から動詞へのエネルギーフローはどの経路ですか？',
        options: [
          { id: 'a', text: '直接的なフロー', correct: true },
          { id: 'b', text: '間接的なフロー', correct: false },
          { id: 'c', text: '逆方向フロー', correct: false }
        ],
        explanation: '主語から動詞への基本的なエネルギーフローは直接的です。',
        hint: '文の基本構造を考えてみてください。'
      }
    ],
    pattern_weaving: [
      {
        id: 1,
        type: 'pattern_recognition',
        question: '次のパターンを完成させてください：',
        pattern: ['主語', '?', '目的語', '動詞'],
        correct: ['主語', '助詞', '目的語', '動詞'],
        pieces: ['助詞', '副詞', '形容詞', '接続詞'],
        explanation: '日本語の基本語順SOVに従って助詞が入ります。',
        hint: '日本語の語順を思い出してください。'
      }
    ],
    syntax_storm: [
      {
        id: 1,
        type: 'sequence_building',
        question: '複雑な文の構造を正しい順序で組み立ててください：',
        target: ['主語', '修飾語', '助詞', '動詞', '語尾'],
        pieces: ['語尾', '主語', '動詞', '修飾語', '助詞'],
        explanation: '修飾語は主語の後、助詞は動詞の前に配置されます。',
        hint: '日本語の修飾関係を考えてみてください。'
      }
    ],
    quantum_grammar: [
      {
        id: 1,
        type: 'energy_flow',
        question: '量子状態での文法エネルギーの干渉パターンは？',
        options: [
          { id: 'a', text: '建設的干渉', correct: true },
          { id: 'b', text: '破壊的干渉', correct: false },
          { id: 'c', text: '中性干渉', correct: false }
        ],
        explanation: '正しい文法構造では建設的干渉が起こります。',
        hint: '物理学の波の性質を文法に適用して考えてみてください。'
      }
    ]
  }

  return questionSets[challengeId] || []
}

function initializePatternChallenge() {
  const question = currentQuestion.value
  patternSlots.value = question.pattern.map(item => ({
    value: item === '?' ? null : item,
    correct: false
  }))

  availablePieces.value = question.pieces.map((piece, index) => ({
    id: index,
    value: piece,
    used: false
  }))
}

function initializeSequenceChallenge() {
  const question = currentQuestion.value
  targetSequence.value = question.target
  currentSequence.value = []

  sequencePieces.value = question.pieces.map((piece, index) => ({
    id: index,
    value: piece,
    used: false
  }))
}

function initializeEnergyFlow() {
  energyNodes.value = [
    { id: 'start', icon: '🔋', label: 'エネルギー源', active: true, completed: false, blocked: false },
    { id: 'grammar', icon: '📝', label: '文法核', active: false, completed: false, blocked: false },
    { id: 'syntax', icon: '🔗', label: '構文', active: false, completed: false, blocked: false },
    { id: 'output', icon: '✨', label: '出力', active: false, completed: false, blocked: false }
  ]

  energyConnections.value = [
    { id: 'start-grammar', path: 'M100,100 Q200,50 300,100', active: false },
    { id: 'grammar-syntax', path: 'M300,100 Q400,150 500,100', active: false },
    { id: 'syntax-output', path: 'M500,100 Q600,50 700,100', active: false }
  ]
}

function getNodePosition(index) {
  const positions = [
    { left: '10%', top: '50%' },
    { left: '35%', top: '30%' },
    { left: '65%', top: '70%' },
    { left: '90%', top: '50%' }
  ]
  return positions[index] || { left: '50%', top: '50%' }
}

function activateNode(node) {
  if (node.blocked) return

  node.active = !node.active
  updateEnergyFlow()
}

function updateEnergyFlow() {
  // Update connection states based on active nodes
  energyConnections.value.forEach(connection => {
    const [from, to] = connection.id.split('-')
    const fromNode = energyNodes.value.find(n => n.id === from)
    const toNode = energyNodes.value.find(n => n.id === to)

    connection.active = fromNode?.active && toNode?.active
  })
}

function selectAnswer(answerId) {
  if (showResult.value) return
  selectedAnswer.value = answerId
}

function fillSlot(index) {
  if (!selectedPiece.value || patternSlots.value[index].value) return

  patternSlots.value[index].value = selectedPiece.value.value
  selectedPiece.value.used = true
  selectedPiece.value = null
}

function selectPiece(piece) {
  if (piece.used) return
  selectedPiece.value = piece
}

function addToSequence(piece) {
  if (piece.used) return

  currentSequence.value.push(piece.value)
  piece.used = true
}

function removeFromSequence(index) {
  const removedValue = currentSequence.value[index]
  currentSequence.value.splice(index, 1)

  // Mark piece as available again
  const piece = sequencePieces.value.find(p => p.value === removedValue && p.used)
  if (piece) piece.used = false
}

function submitAnswer() {
  if (!canSubmit.value || showResult.value) return

  let correct = false

  switch (currentQuestion.value.type) {
    case 'energy_flow':
      const selectedOption = currentQuestion.value.options.find(o => o.id === selectedAnswer.value)
      correct = selectedOption?.correct === true
      break

    case 'pattern_recognition':
      correct = patternSlots.value.every((slot, index) => {
        const correctValue = currentQuestion.value.correct[index]
        return slot.value === correctValue
      })
      break

    case 'sequence_building':
      correct = currentSequence.value.every((item, index) => {
        return item === targetSequence.value[index]
      })
      break
  }

  isCorrect.value = correct
  showResult.value = true

  if (correct) {
    store.addScore(20)
    triggerSuccessEffect()
  }

  // Update progress
  store.updateEnergyBarrierProgress(activeChallenge.value.id, currentQuestionIndex.value + 1)
}

function nextQuestion() {
  if (hasMoreQuestions.value) {
    currentQuestionIndex.value++
    resetQuestionState()
  } else {
    completeChallenge()
  }
}

function resetQuestionState() {
  selectedAnswer.value = null
  showResult.value = false
  showHint.value = false

  // Reset challenge-specific state
  if (currentQuestion.value?.type === 'pattern_recognition') {
    initializePatternChallenge()
  } else if (currentQuestion.value?.type === 'sequence_building') {
    initializeSequenceChallenge()
  }
}

function resetChallengeState() {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  showResult.value = false
  showHint.value = false
  patternSlots.value = []
  availablePieces.value = []
  selectedPiece.value = null
  targetSequence.value = []
  currentSequence.value = []
  sequencePieces.value = []
}

function completeChallenge() {
  store.completeEnergyBarrierChallenge(activeChallenge.value.id)
  showWarpTransition.value = true
  emit('challenge-completed', activeChallenge.value.id)

  setTimeout(() => {
    closeChallengePanel()
  }, 2000)
}

function triggerSuccessEffect() {
  effectPosition.value = { x: Math.random() * 100, y: Math.random() * 100 }
  showSuccessEffect.value = true
}

onMounted(() => {
  store.initializeEnergyBarriers()
})
</script>

<style scoped>
.energy-barriers {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #2d1b69 100%);
  color: #ffffff;
  padding: 2rem;
}

.barriers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.header-info {
  text-align: center;
  flex: 1;
}

.barriers-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.barriers-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
}

.energy-status {
  display: flex;
  align-items: center;
}

.energy-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 15px;
  padding: 0.5rem 1rem;
}

.energy-icon {
  font-size: 1.5rem;
}

.energy-text {
  font-weight: 600;
  color: #fbbf24;
}

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.challenge-card {
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.challenge-card:hover {
  transform: translateY(-5px);
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
}

.challenge-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.challenge-card.completed {
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.challenge-card.active {
  border-color: #fbbf24;
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.unlock-text {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.9;
}

.challenge-content {
  position: relative;
  z-index: 1;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.challenge-icon {
  font-size: 3rem;
}

.challenge-level {
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  color: #000000;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}

.challenge-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #fbbf24;
}

.challenge-description {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.challenge-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.stat-value.energy {
  color: #fbbf24;
  font-weight: 600;
}

.stat-value.reward {
  color: #4ade80;
  font-weight: 600;
}

.difficulty-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
}

.star.active {
  opacity: 1;
}

.progress-section {
  margin: 1rem 0;
}

.progress-label {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.challenge-action {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  color: #000000;
}

.challenge-action:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.challenge-action:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
}

.challenge-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #fbbf24;
}

.close-panel {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.8);
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-panel:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.panel-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.energy-flow {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 300px;
}

.flow-title {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #fbbf24;
}

.flow-diagram {
  position: relative;
  width: 100%;
  height: 200px;
}

.energy-node {
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

.energy-node:hover {
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.energy-node.active {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.6);
}

.energy-node.completed {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.2);
}

.energy-node.blocked {
  opacity: 0.3;
  cursor: not-allowed;
}

.node-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.node-label {
  font-size: 0.7rem;
  text-align: center;
  opacity: 0.9;
}

.energy-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-line {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 2;
  transition: all 0.3s ease;
}

.connection-line.active {
  stroke: #fbbf24;
  stroke-width: 3;
  filter: drop-shadow(0 0 5px #fbbf24);
}

.grammar-challenge {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
}

.challenge-question {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  text-align: center;
  color: #a855f7;
}

.instruction {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  text-align: center;
  opacity: 0.9;
}

.flow-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flow-option {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.flow-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.flow-option.selected {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.flow-option.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.flow-option.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.pattern-grid {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pattern-slot {
  width: 100px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pattern-slot.filled {
  border-style: solid;
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.pattern-slot.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.pattern-pieces {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pattern-piece {
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.8);
  border: none;
  border-radius: 20px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pattern-piece:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.05);
}

.pattern-piece:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.sequence-builder {
  margin-bottom: 2rem;
}

.target-sequence,
.current-sequence {
  margin-bottom: 1rem;
}

.sequence-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #fbbf24;
}

.sequence-items {
  display: flex;
  gap: 0.5rem;
  min-height: 50px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 0.5rem;
  align-items: center;
}

.sequence-item {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.sequence-item.target {
  background: rgba(168, 85, 247, 0.2);
  border-color: rgba(168, 85, 247, 0.4);
}

.sequence-item.current {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  cursor: pointer;
}

.sequence-pieces {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sequence-piece {
  padding: 0.5rem 1rem;
  background: rgba(74, 222, 128, 0.8);
  border: none;
  border-radius: 20px;
  color: #000000;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sequence-piece:hover {
  background: rgba(74, 222, 128, 1);
  transform: scale(1.05);
}

.sequence-piece:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.result-display {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 15px;
}

.result-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.result-message.correct {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
}

.result-message.incorrect {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.result-icon {
  font-size: 1.5rem;
}

.explanation {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
}

.explanation-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #fbbf24;
}

.explanation-text {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

.challenge-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.submit {
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #000000;
}

.action-button.continue {
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  color: #000000;
}

.action-button.hint {
  background: rgba(59, 130, 246, 0.8);
  color: #ffffff;
}

.action-button:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.action-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.hint-display {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
}

.hint-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hint-text {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .energy-barriers {
    padding: 1rem;
  }

  .barriers-header {
    flex-direction: column;
    gap: 1rem;
  }

  .challenge-grid {
    grid-template-columns: 1fr;
  }

  .panel-content {
    padding: 1rem;
  }

  .challenge-actions {
    flex-direction: column;
  }

  .pattern-grid,
  .sequence-items {
    flex-direction: column;
    align-items: center;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .challenge-card,
  .energy-node,
  .action-button {
    transition: none;
  }

  .connection-line {
    transition: none;
  }
}
</style>