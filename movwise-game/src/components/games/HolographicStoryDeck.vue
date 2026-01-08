<template>
  <div class="holographic-story-deck">
    <!-- Difficulty Selection Modal -->
    <div v-if="!difficultySelected" class="difficulty-modal">
      <div class="modal-content">
        <h2 class="modal-title">📚 レベルを選んでください</h2>
        <div class="difficulty-buttons">
          <button
            v-for="level in availableLevels"
            :key="level.id"
            @click="selectDifficulty(level.id)"
            class="difficulty-btn"
            :class="`difficulty-${level.id}`"
          >
            <span class="level-name">{{ level.name }}</span>
            <span class="level-desc">{{ level.description }}</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Background -->
    <div class="cosmic-background"></div>

    <!-- Main Container -->
    <div class="deck-container">
      <!-- Header -->
      <header class="deck-header">
        <h1 class="game-title">
          <span class="hologram-text">代名詞マスター</span>
        </h1>
        <ScenarioProgress
          :current="currentScenarioIndex + 1"
          :total="scenarios.length"
          :score="score"
        />
      </header>

      <!-- Main Content -->
      <main class="deck-main">
        <!-- Hologram Projector -->
        <div class="hologram-section">
          <HologramProjector
            v-if="currentScenario"
            :media-type="currentScenario.type"
            :media-url="currentScenario.mediaUrl"
            :title="currentScenario.title"
            :is-loading="isLoading"
            @media-loaded="handleMediaLoaded"
          />
        </div>

        <!-- Story Content -->
        <div v-if="currentScenario && !isLoading" class="story-content">
          <div class="story-text">
            <p class="text-display" v-html="displayText"></p>
          </div>

          <!-- Pronoun Selector -->
          <PronounSelector
            v-if="!showFeedback"
            :options="currentScenario.options"
            :blank-index="currentBlankIndex"
            @select="handlePronounSelect"
            :disabled="isProcessing"
          />

          <!-- Feedback Display -->
          <CosmicFeedback
            v-if="showFeedback"
            :is-correct="isCorrect"
            :message="feedbackMessage"
            @continue="nextScenario"
          />
        </div>
      </main>

      <!-- Controls -->
      <div class="deck-controls">
        <button
          @click="changeDifficulty"
          class="control-btn change-btn"
        >
          <span class="btn-icon">📚</span>
          レベル変更
        </button>
        <button
          @click="exitGame"
          class="control-btn exit-btn"
        >
          <span class="btn-icon">🏠</span>
          ホームに戻る
        </button>
        <button
          v-if="showFeedback && currentScenarioIndex < scenarios.length - 1"
          @click="nextScenario"
          class="control-btn next-btn"
        >
          次の問題
          <span class="btn-icon">→</span>
        </button>
      </div>
    </div>

    <!-- Game Complete Modal -->
    <div v-if="gameComplete" class="game-complete-modal">
      <div class="modal-content">
        <h2 class="complete-title">🎉 学習完了！ 🎉</h2>
        <div class="score-display">
          <p>最終スコア: {{ score }}/{{ scenarios.length * 100 }}</p>
          <p>正解率: {{ Math.round((score / (scenarios.length * 100)) * 100) }}%</p>
        </div>
        <div class="modal-actions">
          <button @click="resetGame" class="action-btn replay-btn">
            もう一度
          </button>
          <button @click="exitGame" class="action-btn exit-modal-btn">
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import HologramProjector from './holographic/HologramProjector.vue'
import PronounSelector from './holographic/PronounSelector.vue'
import ScenarioProgress from './holographic/ScenarioProgress.vue'
import CosmicFeedback from './holographic/CosmicFeedback.vue'
import scenariosLevelsData from '@/data/holographic-scenarios-expanded.json'

const router = useRouter()
const gameStore = useGameStore()

// Game State
const scenarios = ref([])
const currentScenarioIndex = ref(0)
const currentBlankIndex = ref(0)
const score = ref(0)
const isLoading = ref(true)
const isProcessing = ref(false)
const showFeedback = ref(false)
const isCorrect = ref(false)
const feedbackMessage = ref('')
const gameComplete = ref(false)
const difficultySelected = ref(false)
const selectedDifficulty = ref('')

// Available difficulty levels
const availableLevels = [
  { id: 'level5', name: '5級 (初級)', description: '基本的な代名詞' },
  { id: 'level4', name: '4級 (中級)', description: '所有格と目的格' },
  { id: 'level3', name: '3級 (上級)', description: '複数形と再帰代名詞' }
]

// Computed
const currentScenario = computed(() => scenarios.value[currentScenarioIndex.value])

const displayText = computed(() => {
  if (!currentScenario.value) return ''

  let text = currentScenario.value.text
  const blanks = text.match(/_____/g) || []

  blanks.forEach((blank, index) => {
    if (index === currentBlankIndex.value && !showFeedback.value) {
      text = text.replace(blank, '<span class="blank-active">_____</span>')
    } else {
      text = text.replace(blank, '<span class="blank">_____</span>')
    }
  })

  return text
})

// Cryptographically strong random number generator
const getSecureRandom = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] / (0xffffffff + 1)
  }
  // Fallback to Math.random with additional entropy
  return Math.random() * Math.random()
}

// Advanced Fisher-Yates shuffle with secure randomness
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Add random variation to image URLs for cache busting
const randomizeImageUrl = (url) => {
  if (url.includes('unsplash.com')) {
    const randomSeed = Math.floor(getSecureRandom() * 1000000)
    return url.includes('?') ? `${url}&seed=${randomSeed}` : `${url}?seed=${randomSeed}`
  }
  return url
}

// Shuffle options within each question
const shuffleQuestionOptions = (scenario) => {
  const shuffledScenario = { ...scenario }

  // Randomize image URL for variety
  shuffledScenario.mediaUrl = randomizeImageUrl(scenario.mediaUrl)

  shuffledScenario.options = scenario.options.map(optionGroup => {
    const correctOption = optionGroup.find(opt => opt.correct)
    const incorrectOptions = optionGroup.filter(opt => !opt.correct)

    // Shuffle incorrect options with additional entropy
    const shuffledIncorrect = shuffleArray(incorrectOptions)

    // Insert correct option at random position
    const randomPosition = Math.floor(getSecureRandom() * optionGroup.length)
    const newOptions = [...shuffledIncorrect]
    newOptions.splice(randomPosition, 0, correctOption)

    return newOptions
  })
  return shuffledScenario
}

// Select random scenarios with better distribution
const selectRandomScenarios = (allScenarios, count = 20) => {
  // Create multiple shuffled copies and pick from different sections
  const totalScenarios = allScenarios.length
  const selectedScenarios = []
  const usedIndices = new Set()

  // Use seed based on current time + random for better entropy
  const seed = Date.now() + Math.floor(getSecureRandom() * 1000000)

  while (selectedScenarios.length < Math.min(count, totalScenarios)) {
    // Generate random index with additional entropy
    const randomIndex = Math.floor((getSecureRandom() + (seed % 1000) / 1000) * totalScenarios) % totalScenarios

    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex)
      // Shuffle the options within each question
      const shuffledScenario = shuffleQuestionOptions(allScenarios[randomIndex])
      selectedScenarios.push(shuffledScenario)
    }
  }

  // Final shuffle of the selected scenarios
  return shuffleArray(selectedScenarios)
}

// Methods
const selectDifficulty = (levelId) => {
  selectedDifficulty.value = levelId
  const allScenarios = scenariosLevelsData.levels[levelId].scenarios

  // より多様性を保つため、多めに選択してからさらにシャッフル
  const questionCount = Math.min(25, allScenarios.length) // 最大25問
  scenarios.value = selectRandomScenarios(allScenarios, questionCount)

  // 追加でもう一度シャッフル（時間ベースのエントロピー追加）
  setTimeout(() => {
    scenarios.value = shuffleArray(scenarios.value)
  }, 1)

  difficultySelected.value = true
  isLoading.value = true
}

const handleMediaLoaded = () => {
  isLoading.value = false
}

const handlePronounSelect = (option) => {
  if (isProcessing.value) return

  isProcessing.value = true
  const correctOption = currentScenario.value.options[currentBlankIndex.value].find(opt => opt.correct)

  isCorrect.value = option.value === correctOption.value
  feedbackMessage.value = isCorrect.value
    ? currentScenario.value.feedback.correct
    : currentScenario.value.feedback.wrong

  if (isCorrect.value) {
    score.value += 100
    playSuccessSound()
  } else {
    playErrorSound()
  }

  showFeedback.value = true
  isProcessing.value = false

  // Don't auto-advance to next blank - wait for user to click continue
  // Check if there are more blanks in current scenario
  const totalBlanks = (currentScenario.value.text.match(/_____/g) || []).length
  // Removed auto-advance timeout
}

const nextScenario = () => {
  // Check if there are more blanks in current scenario
  const totalBlanks = (currentScenario.value.text.match(/_____/g) || []).length

  if (currentBlankIndex.value < totalBlanks - 1) {
    // Move to next blank in the same scenario
    currentBlankIndex.value++
    showFeedback.value = false
  } else if (currentScenarioIndex.value < scenarios.value.length - 1) {
    // Move to next scenario
    currentScenarioIndex.value++
    currentBlankIndex.value = 0
    showFeedback.value = false
    isLoading.value = true
  } else {
    completeGame()
  }
}

const completeGame = () => {
  gameComplete.value = true
  saveProgress()
}

const resetGame = () => {
  currentScenarioIndex.value = 0
  currentBlankIndex.value = 0
  score.value = 0
  showFeedback.value = false
  gameComplete.value = false

  // 新しいランダムな問題セットを生成
  if (selectedDifficulty.value) {
    const allScenarios = scenariosLevelsData.levels[selectedDifficulty.value].scenarios
    const questionCount = Math.min(25, allScenarios.length)
    scenarios.value = selectRandomScenarios(allScenarios, questionCount)
  }

  isLoading.value = true
}

const exitGame = () => {
  saveProgress()
  router.push('/grammar-galaxy')
}

const changeDifficulty = () => {
  difficultySelected.value = false
  currentScenarioIndex.value = 0
  currentBlankIndex.value = 0
  score.value = 0
  showFeedback.value = false
  gameComplete.value = false
  scenarios.value = [] // 問題セットをクリア
}

const saveProgress = () => {
  try {
    const currentAccuracy = Math.round((score.value / ((currentScenarioIndex.value + 1) * 100)) * 100)
    gameStore.updateGameProgress('holographicStoryDeck', {
      score: score.value,
      completedScenarios: currentScenarioIndex.value + 1,
      totalScenarios: scenarios.value.length,
      accuracy: currentAccuracy,
      bestScore: Math.max(gameStore.gameProgress?.holographicStoryDeck?.bestScore || 0, score.value),
      attempts: (gameStore.gameProgress?.holographicStoryDeck?.attempts || 0) + 1,
      lastPlayed: Date.now(),
      progress: Math.round(((currentScenarioIndex.value + 1) / scenarios.value.length) * 100)
    })
  } catch (error) {
    console.warn('Failed to save progress:', error)
  }
}

const playSuccessSound = () => {
  const audio = new Audio('/audio/success.mp3')
  audio.volume = 0.5
  audio.play().catch(() => {})
}

const playErrorSound = () => {
  const audio = new Audio('/audio/error.mp3')
  audio.volume = 0.3
  audio.play().catch(() => {})
}

// Lifecycle
onMounted(() => {
  document.body.classList.add('holographic-mode')
  // Force initial load after a short delay
  setTimeout(() => {
    if (isLoading.value) {
      console.log('Force loading complete after timeout')
      isLoading.value = false
    }
  }, 3000)
})

onUnmounted(() => {
  document.body.classList.remove('holographic-mode')
  saveProgress()
})
</script>

<style scoped>
.holographic-story-deck {
  @apply min-h-screen relative overflow-hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}

.cosmic-background {
  @apply absolute inset-0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(120, 200, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 120, 200, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(200, 255, 120, 0.1) 0%, transparent 50%);
  animation: cosmicFloat 20s ease-in-out infinite;
}

@keyframes cosmicFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(1deg); }
}

.deck-container {
  @apply relative z-10 container mx-auto px-4 py-4 max-w-6xl h-screen flex flex-col;
}

.deck-header {
  @apply flex justify-between items-center mb-4 flex-shrink-0;
}

.game-title {
  @apply text-4xl font-bold;
}

.hologram-text {
  background: linear-gradient(45deg, #00ffff, #ff00ff, #00ff00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: hologramShift 3s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

@keyframes hologramShift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}

.deck-main {
  @apply bg-gray-900 bg-opacity-50 rounded-3xl p-4 backdrop-blur-md flex-1 flex flex-col overflow-hidden;
  border: 2px solid rgba(0, 255, 255, 0.3);
  box-shadow:
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 50px rgba(0, 255, 255, 0.05);
}

.hologram-section {
  @apply flex-shrink-0;
  max-height: 40vh;
}

.story-content {
  @apply mt-4 space-y-4 flex-1 flex flex-col justify-center;
}

.story-text {
  @apply bg-gray-800 bg-opacity-50 rounded-xl p-4;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.text-display {
  @apply text-lg text-white leading-relaxed text-center;
}

.text-display :deep(.blank) {
  @apply inline-block px-4 py-1 mx-1 bg-gray-700 rounded-lg border-2 border-gray-600;
  min-width: 80px;
  text-align: center;
}

.text-display :deep(.blank-active) {
  @apply inline-block px-4 py-1 mx-1 bg-blue-900 rounded-lg border-2 border-cyan-400;
  min-width: 80px;
  text-align: center;
  animation: pulse 2s infinite;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.deck-controls {
  @apply mt-4 flex justify-between items-center flex-shrink-0;
}

.control-btn {
  @apply px-6 py-3 bg-gradient-to-r rounded-xl font-semibold text-white;
  @apply transform transition-all duration-300 hover:scale-105;
  @apply flex items-center gap-2;
}

.exit-btn {
  @apply from-red-600 to-red-700 hover:from-red-700 hover:to-red-800;
}

.change-btn {
  @apply from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800;
}

.next-btn {
  @apply from-green-600 to-green-700 hover:from-green-700 hover:to-green-800;
}

.btn-icon {
  @apply text-xl;
}

.game-complete-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75;
  backdrop-filter: blur(10px);
}

.modal-content {
  @apply bg-gray-900 rounded-3xl p-12 max-w-md w-full mx-4;
  border: 2px solid rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 100px rgba(0, 255, 255, 0.3);
  animation: modalAppear 0.5s ease-out;
}

@keyframes modalAppear {
  from {
    transform: scale(0.8) translateY(50px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.complete-title {
  @apply text-4xl font-bold text-center mb-6 text-cyan-400;
}

.score-display {
  @apply text-center space-y-2 mb-8;
}

.score-display p {
  @apply text-2xl text-white;
}

.modal-actions {
  @apply flex gap-4;
}

.action-btn {
  @apply flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300;
  @apply hover:transform hover:scale-105;
}

.replay-btn {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800;
}

.exit-modal-btn {
  @apply bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800;
}

/* Difficulty Selection Modal */
.difficulty-modal {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75;
  backdrop-filter: blur(10px);
}

.modal-title {
  @apply text-3xl font-bold text-center mb-8 text-cyan-400;
}

.difficulty-buttons {
  @apply space-y-4 max-w-md mx-auto;
}

.difficulty-btn {
  @apply w-full p-6 rounded-xl text-left transition-all duration-300;
  @apply hover:transform hover:scale-105 hover:shadow-lg;
  @apply bg-gradient-to-r border-2 border-opacity-50;
}

.difficulty-level5 {
  @apply from-green-600 to-green-700 border-green-400;
  @apply hover:from-green-700 hover:to-green-800;
}

.difficulty-level4 {
  @apply from-yellow-600 to-yellow-700 border-yellow-400;
  @apply hover:from-yellow-700 hover:to-yellow-800;
}

.difficulty-level3 {
  @apply from-red-600 to-red-700 border-red-400;
  @apply hover:from-red-700 hover:to-red-800;
}

.level-name {
  @apply block text-2xl font-bold text-white mb-2;
}

.level-desc {
  @apply block text-lg text-gray-200;
}

/* Responsive Design */
@media (max-width: 768px) {
  .deck-container {
    @apply px-2 py-2;
  }

  .game-title {
    @apply text-xl;
  }

  .deck-main {
    @apply p-3;
  }

  .text-display {
    @apply text-base;
  }

  .hologram-section {
    max-height: 25vh;
  }

  .deck-controls {
    @apply flex-col gap-3;
  }

  .control-btn {
    @apply w-full justify-center py-2 px-4 text-sm;
  }

  .story-content {
    @apply mt-2 space-y-3;
  }

  .story-text {
    @apply p-3;
  }

  .modal-title {
    @apply text-2xl;
  }

  .difficulty-btn {
    @apply p-4;
  }

  .level-name {
    @apply text-xl;
  }

  .level-desc {
    @apply text-base;
  }
}
</style>