<template>
  <div class="verb-collector-game relative min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black overflow-hidden">
    <!-- Animated Stars -->
    <div class="absolute inset-0">
      <div v-for="n in 50" :key="n"
           class="absolute bg-white rounded-full animate-pulse"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             width: Math.random() * 3 + 1 + 'px',
             height: Math.random() * 3 + 1 + 'px',
             animationDelay: Math.random() * 2 + 's'
           }">
      </div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 p-6">
      <div class="flex justify-between items-center mb-6">
        <button @click="goBack"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          ← Back to Hub
        </button>

        <div class="text-center">
          <h1 class="text-3xl font-bold text-white mb-2">Verb Collector</h1>
          <p class="text-purple-200">Sort verbs into the correct cosmic pods!</p>
        </div>

        <div class="text-right text-white">
          <div class="text-lg font-bold">Score: {{ score }}</div>
          <div class="text-sm">Time: {{ timeRemaining }}s</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="bg-purple-800 rounded-full h-3 mb-6">
        <div class="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
             :style="{ width: (collectedCount / totalVerbs) * 100 + '%' }">
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <div class="relative z-10 px-6">
      <!-- Current Verb Display -->
      <div v-if="currentVerb" class="text-center mb-8">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 max-w-md mx-auto mb-6 transform hover:scale-105 transition-transform">
          <h2 class="text-4xl font-bold text-white mb-2">{{ currentVerb.verb }}</h2>
          <p class="text-purple-100 text-lg">{{ currentVerb.translation }}</p>
          <p class="text-purple-200 text-sm mt-2">{{ currentVerb.meaning }}</p>
        </div>

        <!-- Example Display -->
        <div v-if="showExample" class="bg-black bg-opacity-50 rounded-xl p-4 max-w-lg mx-auto mb-6">
          <div v-if="currentVerb.pattern === 'both' && currentExamples">
            <p class="text-yellow-300 text-sm font-bold mb-2">両方のパターンが使えます！</p>
            <div class="space-y-3">
              <div v-if="currentExamples.ing" class="border-l-4 border-green-400 pl-3">
                <p class="text-green-300 text-xs uppercase mb-1">ING パターン:</p>
                <p class="text-white text-base italic">"{{ currentExamples.ing }}"</p>
              </div>
              <div v-if="currentExamples.to" class="border-l-4 border-blue-400 pl-3">
                <p class="text-blue-300 text-xs uppercase mb-1">TO パターン:</p>
                <p class="text-white text-base italic">"{{ currentExamples.to }}"</p>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-white text-lg italic">"{{ currentExample }}"</p>
          </div>
        </div>
      </div>

      <!-- Collection Pods -->
      <div class="flex justify-center mb-8 px-4">
        <div class="flex gap-4 flex-wrap justify-center max-w-3xl">
          <!-- ING Pod -->
          <div @click="collectVerb('ing')"
               class="cosmic-pod-ultra relative overflow-hidden cursor-pointer flex-shrink-0 group"
               :class="{ 'pod-selected': selectedPod === 'ing' }">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-green-500/20 to-teal-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <!-- Energy lines -->
            <div class="energy-lines energy-green"></div>

            <!-- Content -->
            <div class="relative z-10 text-center p-4">
              <div class="pod-icon-wrapper mb-2">
                <div class="pod-icon text-4xl">🌱</div>
                <div class="pod-glow pod-glow-green"></div>
              </div>
              <h3 class="text-lg font-bold text-white mb-1 tracking-wider uppercase">ING</h3>
              <p class="text-emerald-200 text-xs uppercase tracking-wide opacity-90">Verb + ing</p>
              <div class="mt-3 pt-2 border-t border-green-500/30">
                <div class="text-xs text-emerald-300 font-mono">
                  <span class="opacity-70">COLLECTED:</span>
                  <span class="font-bold text-green-300">{{ ingCount }}</span>
                </div>
              </div>
            </div>

            <!-- Corner accent -->
            <div class="corner-accent corner-green"></div>
          </div>

          <!-- TO Pod -->
          <div @click="collectVerb('to')"
               class="cosmic-pod-ultra relative overflow-hidden cursor-pointer flex-shrink-0 group"
               :class="{ 'pod-selected': selectedPod === 'to' }">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-cyan-500/20 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <!-- Energy lines -->
            <div class="energy-lines energy-blue"></div>

            <!-- Content -->
            <div class="relative z-10 text-center p-4">
              <div class="pod-icon-wrapper mb-2">
                <div class="pod-icon text-4xl">🚀</div>
                <div class="pod-glow pod-glow-blue"></div>
              </div>
              <h3 class="text-lg font-bold text-white mb-1 tracking-wider uppercase">TO</h3>
              <p class="text-cyan-200 text-xs uppercase tracking-wide opacity-90">Verb + to</p>
              <div class="mt-3 pt-2 border-t border-blue-500/30">
                <div class="text-xs text-cyan-300 font-mono">
                  <span class="opacity-70">COLLECTED:</span>
                  <span class="font-bold text-blue-300">{{ toCount }}</span>
                </div>
              </div>
            </div>

            <!-- Corner accent -->
            <div class="corner-accent corner-blue"></div>
          </div>

          <!-- BOTH Pod -->
          <div @click="collectVerb('both')"
               class="cosmic-pod-ultra relative overflow-hidden cursor-pointer flex-shrink-0 group"
               :class="{ 'pod-selected': selectedPod === 'both' }">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-500/20 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <!-- Energy lines -->
            <div class="energy-lines energy-purple"></div>

            <!-- Content -->
            <div class="relative z-10 text-center p-4">
              <div class="pod-icon-wrapper mb-2">
                <div class="pod-icon text-4xl">⚡</div>
                <div class="pod-glow pod-glow-purple"></div>
              </div>
              <h3 class="text-lg font-bold text-white mb-1 tracking-wider uppercase">BOTH</h3>
              <p class="text-purple-200 text-xs uppercase tracking-wide opacity-90">to / ing 両方OK</p>
              <div class="mt-3 pt-2 border-t border-purple-500/30">
                <div class="text-xs text-purple-300 font-mono">
                  <span class="opacity-70">COLLECTED:</span>
                  <span class="font-bold text-purple-300">{{ bothCount }}</span>
                </div>
              </div>
            </div>

            <!-- Corner accent -->
            <div class="corner-accent corner-purple"></div>
          </div>
        </div>
      </div>

      <!-- Feedback Message -->
      <div v-if="feedbackMessage"
           class="text-center mb-6">
        <div class="inline-block px-6 py-3 rounded-lg text-white font-bold"
             :class="feedbackMessage.type === 'correct' ? 'bg-green-500' : 'bg-red-500'">
          {{ feedbackMessage.text }}
        </div>
      </div>

      <!-- Game Controls -->
      <div class="text-center">
        <button v-if="!gameStarted"
                @click="startGame"
                class="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xl font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-300">
          Start Collection Mission
        </button>

        <button v-if="gameStarted && currentVerb"
                @click="showHint"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg ml-4 transition-colors">
          💡 Show Example
        </button>
      </div>
    </div>

    <!-- Game Complete Modal -->
    <div v-if="gameComplete"
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gradient-to-b from-purple-600 to-purple-800 rounded-2xl p-8 max-w-md mx-4">
        <div class="text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-bold text-white mb-4">Mission Complete!</h2>
          <div class="text-purple-100 mb-6">
            <p class="text-lg mb-2">Final Score: {{ score }}</p>
            <p>Accuracy: {{ Math.round(accuracy) }}%</p>
            <p>Time Bonus: {{ timeBonus }}</p>
          </div>
          <div class="space-y-3">
            <button @click="playAgain"
                    class="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg transition-colors">
              Play Again
            </button>
            <button @click="goToNextStage"
                    class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors">
              Continue to Pattern Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerbPatternStore } from '@/stores/verbPatternStore'

const router = useRouter()
const store = useVerbPatternStore()

// Game State
const gameStarted = ref(false)
const gameComplete = ref(false)
const currentVerb = ref(null)
const currentExample = ref('')
const currentExamples = ref(null)
const showExample = ref(false)
const selectedPod = ref(null)
const feedbackMessage = ref(null)

// Game Statistics
const score = ref(0)
const timeRemaining = ref(60)
const gameTimer = ref(null)
const collectedCount = ref(0)
const correctAnswers = ref(0)
const totalAnswers = ref(0)

// Collections
const ingCollection = ref([])
const toCollection = ref([])
const bothCollection = ref([])

// Computed Properties
const totalVerbs = computed(() => store.unlockedVerbs.length)
const ingCount = computed(() => ingCollection.value.length)
const toCount = computed(() => toCollection.value.length)
const bothCount = computed(() => bothCollection.value.length)
const accuracy = computed(() => totalAnswers.value > 0 ? (correctAnswers.value / totalAnswers.value) * 100 : 0)
const timeBonus = computed(() => Math.max(0, timeRemaining.value * 10))

// Utility Functions
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Game state for randomization
const shuffledVerbQueue = ref([])
const currentVerbIndex = ref(0)

// Game Methods
function startGame() {
  gameStarted.value = true
  timeRemaining.value = 60
  score.value = 0
  collectedCount.value = 0
  correctAnswers.value = 0
  totalAnswers.value = 0

  ingCollection.value = []
  toCollection.value = []
  bothCollection.value = []

  // 動詞をシャッフルしてキューに入れる
  shuffledVerbQueue.value = shuffleArray(store.unlockedVerbs)
  currentVerbIndex.value = 0

  startTimer()
  nextVerb()
}

function startTimer() {
  gameTimer.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      endGame()
    }
  }, 1000)
}

function nextVerb() {
  if (collectedCount.value >= totalVerbs.value) {
    endGame()
    return
  }

  // シャッフルされたキューから順番に取り出す
  let nextVerbFound = false

  while (currentVerbIndex.value < shuffledVerbQueue.value.length && !nextVerbFound) {
    const candidate = shuffledVerbQueue.value[currentVerbIndex.value]

    // まだ収集されていない動詞かチェック
    if (!ingCollection.value.includes(candidate.id) &&
        !toCollection.value.includes(candidate.id) &&
        !bothCollection.value.includes(candidate.id)) {
      currentVerb.value = candidate
      nextVerbFound = true
    }

    currentVerbIndex.value++
  }

  // キューを使い切った場合は再シャッフル
  if (!nextVerbFound) {
    const availableVerbs = store.unlockedVerbs.filter(verb =>
      !ingCollection.value.includes(verb.id) &&
      !toCollection.value.includes(verb.id) &&
      !bothCollection.value.includes(verb.id)
    )

    if (availableVerbs.length === 0) {
      endGame()
      return
    }

    shuffledVerbQueue.value = shuffleArray(availableVerbs)
    currentVerbIndex.value = 0
    currentVerb.value = shuffledVerbQueue.value[0]
    currentVerbIndex.value = 1
  }

  showExample.value = false
  currentExamples.value = null
  selectedPod.value = null
  feedbackMessage.value = null
}

function collectVerb(pattern) {
  // ゲームが開始されていない場合は自動で開始
  if (!gameStarted.value) {
    startGame()
    return
  }

  if (!currentVerb.value || selectedPod.value) return

  selectedPod.value = pattern
  totalAnswers.value++

  const isCorrect = currentVerb.value.pattern === pattern

  if (isCorrect) {
    correctAnswers.value++
    const points = getPoints(currentVerb.value.rarity)
    score.value += points

    // Add to appropriate collection
    if (pattern === 'ing') {
      ingCollection.value.push(currentVerb.value.id)
    } else if (pattern === 'to') {
      toCollection.value.push(currentVerb.value.id)
    } else {
      bothCollection.value.push(currentVerb.value.id)
    }

    collectedCount.value++
    store.collectVerb(currentVerb.value.id)
    store.updateAccuracy(currentVerb.value.id, true)

    feedbackMessage.value = {
      type: 'correct',
      text: `Correct! +${points} points`
    }
  } else {
    store.updateAccuracy(currentVerb.value.id, false)
    feedbackMessage.value = {
      type: 'incorrect',
      text: `Try again! "${currentVerb.value.verb}" uses ${currentVerb.value.pattern}`
    }
  }

  setTimeout(() => {
    if (isCorrect) {
      nextVerb()
    } else {
      selectedPod.value = null
      feedbackMessage.value = null
    }
  }, 2000)
}

function getPoints(rarity) {
  switch (rarity) {
    case 'common': return 100
    case 'uncommon': return 200
    case 'rare': return 300
    default: return 100
  }
}

function showHint() {
  if (!currentVerb.value) return

  showExample.value = true

  if (currentVerb.value.pattern === 'both') {
    // bothパターンの場合は両方の例文を表示
    currentExamples.value = {}

    if (currentVerb.value.examples.ing) {
      const ingExamples = currentVerb.value.examples.ing
      currentExamples.value.ing = ingExamples[Math.floor(Math.random() * ingExamples.length)]
    }

    if (currentVerb.value.examples.to) {
      const toExamples = currentVerb.value.examples.to
      currentExamples.value.to = toExamples[Math.floor(Math.random() * toExamples.length)]
    }
  } else {
    // 単一パターンの場合は通常の例文表示
    currentExamples.value = null
    const examples = currentVerb.value.examples
    currentExample.value = examples[Math.floor(Math.random() * examples.length)]
  }
}

function endGame() {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
    gameTimer.value = null
  }

  gameStarted.value = false
  gameComplete.value = true

  // Add time bonus
  score.value += timeBonus.value
  store.addScore(score.value)

  // Complete stage if performance is good enough
  if (accuracy.value >= 70) {
    store.completeStage(1)
  }
}

function playAgain() {
  gameComplete.value = false
  startGame()
}

function goToNextStage() {
  router.push({ name: 'pattern-builder-game' })
}

function goBack() {
  router.push({ name: 'verb-pattern-galaxy-hub' })
}

onMounted(() => {
  // 初期状態で最初の動詞を表示
  nextVerb()
})

onUnmounted(() => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
})
</script>

<style scoped>
.cosmic-pod {
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.cosmic-pod:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

/* Ultra modern pod design */
.cosmic-pod-ultra {
  position: relative;
  width: 180px;
  min-height: 180px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cosmic-pod-ultra:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.cosmic-pod-ultra.pod-selected {
  transform: scale(1.08);
  animation: selected-pulse 1s ease-in-out infinite;
}

/* Pod icon effects */
.pod-icon-wrapper {
  position: relative;
  display: inline-block;
}

.pod-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.pod-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(20px);
  animation: glow-pulse 2s ease-in-out infinite;
}

.pod-glow-green {
  background: radial-gradient(circle, #10b981, transparent);
}

.pod-glow-blue {
  background: radial-gradient(circle, #3b82f6, transparent);
}

.pod-glow-purple {
  background: radial-gradient(circle, #a855f7, transparent);
}

/* Energy lines animation */
.energy-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
  opacity: 0.6;
}

.energy-lines::before,
.energy-lines::after {
  content: '';
  position: absolute;
  width: 200%;
  height: 2px;
  animation: energy-flow 3s linear infinite;
}

.energy-lines::before {
  top: 20%;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
}

.energy-lines::after {
  bottom: 20%;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  animation-delay: -1.5s;
}

.energy-green {
  color: #10b981;
}

.energy-blue {
  color: #3b82f6;
}

.energy-purple {
  color: #a855f7;
}

/* Corner accents */
.corner-accent {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid;
  opacity: 0.5;
}

.corner-accent::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid;
  border-color: inherit;
  opacity: 0.5;
}

.corner-accent:first-of-type {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 20px;
}

.corner-green {
  border-color: #10b981;
}

.corner-blue {
  border-color: #3b82f6;
}

.corner-purple {
  border-color: #a855f7;
}

/* Animations */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
}

@keyframes energy-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes selected-pulse {
  0%, 100% {
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.7),
      0 0 40px currentColor,
      inset 0 0 20px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow:
      0 25px 70px rgba(0, 0, 0, 0.8),
      0 0 60px currentColor,
      inset 0 0 30px rgba(255, 255, 255, 0.3);
  }
}

/* Responsive adjustments */
@media (min-width: 640px) {
  .cosmic-pod-ultra {
    width: 200px;
    min-height: 200px;
  }
}

@media (min-width: 1024px) {
  .cosmic-pod-ultra {
    width: 220px;
    min-height: 220px;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.cosmic-pod,
.cosmic-pod-compact {
  animation: float 6s ease-in-out infinite;
}

.cosmic-pod-compact:nth-child(1) {
  animation-delay: 0s;
}

.cosmic-pod-compact:nth-child(2) {
  animation-delay: -2s;
}

.cosmic-pod-compact:nth-child(3) {
  animation-delay: -4s;
}
</style>