<template>
  <div class="pattern-builder-game relative h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden flex flex-col">
    <!-- Cosmic Background -->
    <div class="absolute inset-0">
      <!-- Twinkling Stars -->
      <div v-for="n in 50" :key="'star-' + n"
           class="absolute bg-cyan-300 rounded-full opacity-60"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             width: Math.random() * 3 + 1 + 'px',
             height: Math.random() * 3 + 1 + 'px',
             animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
             animationDelay: Math.random() * 2 + 's'
           }">
      </div>

      <!-- Floating Particles -->
      <div v-for="n in 20" :key="'particle-' + n"
           class="absolute bg-blue-400 rounded-full opacity-30"
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             width: Math.random() * 8 + 4 + 'px',
             height: Math.random() * 8 + 4 + 'px',
             animation: `float ${Math.random() * 4 + 3}s infinite ease-in-out`,
             animationDelay: Math.random() * 3 + 's'
           }">
      </div>
    </div>

    <!-- Game Header -->
    <div class="relative z-10 p-3 lg:p-4 flex-shrink-0">
      <div class="flex justify-between items-center mb-2">
        <button @click="goBack"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg transition-colors">
          ← Back
        </button>

        <div class="text-center">
          <h1 class="text-xl lg:text-2xl font-bold text-white">文章を作ろう！</h1>
          <p class="text-blue-200 text-xs lg:text-sm hidden sm:block">正しい順番で英文を組み立てよう</p>
        </div>

        <div class="text-right text-white">
          <div class="text-sm lg:text-base font-bold">Score: {{ score }}</div>
          <div class="text-xs">{{ currentRound }}/{{ totalRounds }}</div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="bg-blue-800 rounded-full h-2 lg:h-3">
        <div class="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
             :style="{ width: (currentRound / totalRounds) * 100 + '%' }">
        </div>
      </div>
    </div>

    <!-- Game Area -->
    <div class="relative z-10 px-3 lg:px-6 flex-1 overflow-y-auto">
      <!-- Game Instructions -->
      <div v-if="!gameStarted" class="text-center mb-6">
        <div class="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-md rounded-xl p-4 lg:p-6 max-w-2xl mx-auto border border-purple-300/30">
          <h2 class="text-xl lg:text-2xl font-bold text-white mb-3">🎯 ゲームの遊び方</h2>
          <div class="text-purple-100 text-sm lg:text-base space-y-2 text-left">
            <p>1. 📖 日本語の文が表示されます</p>
            <p>2. 🔤 下の単語をタップして英文を作ります</p>
            <p>3. ✅ 正しい順番で並べて「答えを確認」を押そう</p>
            <p>4. 🗑 間違えたら「やり直す」で最初から</p>
            <p>5. 💡 困ったら「ヒント」を使おう</p>
          </div>
        </div>
      </div>

      <!-- Current Challenge -->
      <div v-if="currentChallenge" class="text-center mb-4 lg:mb-6">
        <div class="relative bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-6 max-w-2xl mx-auto border border-cyan-300/30 shadow-2xl overflow-hidden">
          <!-- Energy Border Animation -->
          <div class="absolute inset-0 rounded-2xl">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse"></div>
          </div>
          <div class="relative z-10">
          <h2 class="text-lg lg:text-2xl font-bold text-white mb-2 lg:mb-4">📝 この日本語を英語にしよう！</h2>
          <p class="text-yellow-200 text-base lg:text-xl font-bold mb-2 lg:mb-4">「{{ currentChallenge.prompt }}」</p>

          <!-- Target Sentence (hidden until reveal) -->
          <div v-if="showTarget" class="bg-black/40 backdrop-blur-sm rounded-lg p-2 lg:p-4 mt-2 lg:mt-4 border border-green-400/30 shadow-lg">
            <p class="text-green-300 text-sm lg:text-lg font-semibold animate-pulse">正解: {{ currentChallenge.target }}</p>
          </div>
          </div>
        </div>
      </div>

      <!-- Sentence Builder Area -->
      <div class="max-w-4xl mx-auto mb-4 lg:mb-6">
        <!-- Built Sentence Display -->
        <div class="relative bg-black/50 backdrop-blur-md rounded-xl p-3 lg:p-5 mb-3 lg:mb-4 min-h-[70px] lg:min-h-[90px] border-2 border-cyan-400/50 shadow-2xl overflow-hidden">
          <!-- Glow Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
          <div class="relative z-10">
          <h3 class="text-blue-300 text-sm lg:text-lg mb-2 lg:mb-3">あなたの英文:</h3>
          <div class="flex flex-wrap gap-1.5 lg:gap-2 items-center min-h-[40px] lg:min-h-[50px]">
            <div v-for="(word, index) in builtSentence" :key="index"
                 @click="removeWord(index)"
                 class="relative bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-sm text-white px-2.5 lg:px-4 py-1 lg:py-2 text-sm lg:text-base rounded-lg cursor-pointer hover:from-blue-400 hover:to-cyan-400 transition-all transform hover:scale-105 border border-cyan-300/30 shadow-lg group">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span class="relative z-10">{{ word }}</span>
              <span class="relative z-10 ml-2 text-xs opacity-70 group-hover:opacity-100 transition-opacity">×</span>
            </div>
            <div v-if="builtSentence.length === 0" class="text-cyan-300 text-sm lg:text-base animate-pulse">
              👇 下の単語をタップして文を作ろう
            </div>
          </div>
          </div>
        </div>

        <!-- Word Bank -->
        <div class="relative bg-gradient-to-r from-purple-800/70 to-blue-800/70 backdrop-blur-md rounded-xl p-3 lg:p-5 border border-purple-400/30 shadow-2xl overflow-hidden">
          <!-- Cosmic Border -->
          <div class="absolute inset-0 rounded-xl">
            <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
          </div>
          <div class="relative z-10">
          <h3 class="text-white text-sm lg:text-lg mb-2 lg:mb-3">🎯 使える単語 (タップして選ぼう):</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3 max-h-[120px] lg:max-h-[160px] overflow-y-auto word-bank-scroll word-bank-container">
            <div v-for="word in availableWords" :key="word"
                 @click="addWord(word)"
                 class="relative bg-gradient-to-b from-purple-500/80 to-purple-700/80 backdrop-blur-sm hover:from-purple-400 hover:to-purple-600 text-white text-center py-2 lg:py-2.5 px-2 lg:px-3 text-xs lg:text-sm rounded-lg cursor-pointer transition-all transform hover:scale-105 active:scale-95 border border-purple-300/30 shadow-lg group overflow-hidden">
              <!-- Shimmer Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span class="relative z-10">{{ word }}</span>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center mb-4 lg:mb-6">
        <div class="flex flex-wrap justify-center gap-2 lg:gap-3">
          <button @click="checkSentence"
                  :disabled="builtSentence.length === 0"
                  class="relative bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-lg font-bold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-emerald-300/30 shadow-lg overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative z-10">✓ 答えを確認</span>
          </button>

          <button @click="clearSentence"
                  class="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white px-3 lg:px-5 py-2 lg:py-3 text-sm lg:text-base rounded-lg transition-all transform hover:scale-105 border border-red-300/30 shadow-lg overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative z-10">🗑 やり直す</span>
          </button>

          <button @click="showHint"
                  :disabled="hintsUsed >= maxHints"
                  class="relative bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-3 lg:px-5 py-2 lg:py-3 text-sm lg:text-base rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed border border-amber-300/30 shadow-lg overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative z-10">💡 ヒント ({{ hintsUsed }}/{{ maxHints }})</span>
          </button>
        </div>
      </div>

      <!-- Feedback Area -->
      <div v-if="feedbackMessage" class="text-center mb-3 lg:mb-4">
        <div class="inline-block px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-white font-bold max-w-md border shadow-2xl backdrop-blur-md animate-pulse"
             :class="{
               'bg-emerald-600/80 border-emerald-300/50': feedbackMessage.type === 'correct',
               'bg-red-600/80 border-red-300/50': feedbackMessage.type === 'incorrect',
               'bg-amber-600/80 border-amber-300/50': feedbackMessage.type === 'hint'
             }">
          <div class="text-sm lg:text-lg mb-1 lg:mb-2">{{ feedbackMessage.title }}</div>
          <div class="text-xs lg:text-sm opacity-90">{{ feedbackMessage.text }}</div>
        </div>
      </div>

      <!-- Next Challenge Button -->
      <div v-if="roundComplete" class="text-center">
        <button @click="nextChallenge"
                class="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xl font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all">
          {{ currentRound >= totalRounds ? '🎉 ステージクリア！' : '➡️ 次の問題' }}
        </button>
      </div>

      <!-- Start Game Button -->
      <div v-if="!gameStarted" class="text-center">
        <button @click="startGame"
                class="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white text-xl font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all">
          ゲームスタート！
        </button>
      </div>
    </div>

    <!-- Game Complete Modal -->
    <div v-if="gameComplete"
         class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gradient-to-b from-blue-600 to-blue-800 rounded-2xl p-8 max-w-md mx-4">
        <div class="text-center">
          <div class="text-6xl mb-4">🏗️</div>
          <h2 class="text-3xl font-bold text-white mb-4">Builder Complete!</h2>
          <div class="text-blue-100 mb-6">
            <p class="text-lg mb-2">Final Score: {{ score }}</p>
            <p>Accuracy: {{ Math.round(accuracy) }}%</p>
            <p>Rounds Completed: {{ currentRound }}/{{ totalRounds }}</p>
          </div>
          <div class="space-y-3">
            <button @click="playAgain"
                    class="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg transition-colors">
              Build Again
            </button>
            <button @click="goToNextStage"
                    v-if="accuracy >= 70"
                    class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors">
              Continue to Meaning Duel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVerbPatternStore } from '@/stores/verbPatternStore'

const router = useRouter()
const store = useVerbPatternStore()

// Game State
const gameStarted = ref(false)
const gameComplete = ref(false)
const currentChallenge = ref(null)
const builtSentence = ref([])
const availableWords = ref([])
const showTarget = ref(false)
const roundComplete = ref(false)

// Game Statistics
const score = ref(0)
const currentRound = ref(0)
const totalRounds = ref(8)
const correctAnswers = ref(0)
const totalAnswers = ref(0)
const hintsUsed = ref(0)
const maxHints = ref(3)

// Feedback
const feedbackMessage = ref(null)

// Game Data
const challenges = ref([
  {
    verb: 'enjoy',
    prompt: 'Express that someone likes playing games',
    target: 'I enjoy playing games',
    alternatives: ['I enjoy playing video games'],
    words: ['I', 'enjoy', 'playing', 'games', 'video', 'to', 'play', 'like', 'am'],
    pattern: 'ing'
  },
  {
    verb: 'want',
    prompt: 'Say that you desire to study English',
    target: 'I want to study English',
    alternatives: ['I want to learn English'],
    words: ['I', 'want', 'to', 'study', 'learn', 'English', 'studying', 'like', 'need'],
    pattern: 'to'
  },
  {
    verb: 'finish',
    prompt: 'Tell about completing homework',
    target: 'I finished doing homework',
    alternatives: ['I finished doing my homework'],
    words: ['I', 'finished', 'doing', 'homework', 'to', 'do', 'complete', 'my'],
    pattern: 'ing'
  },
  {
    verb: 'decide',
    prompt: 'Express making a choice about learning',
    target: 'She decided to learn Japanese',
    words: ['She', 'decided', 'to', 'learn', 'Japanese', 'learning', 'wants', 'will'],
    pattern: 'to'
  },
  {
    verb: 'remember',
    prompt: 'Talk about recalling a past experience',
    target: 'I remember visiting that place',
    words: ['I', 'remember', 'visiting', 'that', 'place', 'to', 'visit', 'went'],
    pattern: 'ing'
  },
  {
    verb: 'remember',
    prompt: 'Remind someone not to forget something',
    target: 'Remember to call your mom',
    words: ['Remember', 'to', 'call', 'your', 'mom', 'calling', 'phone', 'should'],
    pattern: 'to'
  },
  {
    verb: 'stop',
    prompt: 'Say you quit a bad habit',
    target: 'I stopped smoking cigarettes',
    words: ['I', 'stopped', 'smoking', 'cigarettes', 'to', 'smoke', 'quit', 'no'],
    pattern: 'ing'
  },
  {
    verb: 'try',
    prompt: 'Express making an effort to succeed',
    target: 'I try to do my best',
    words: ['I', 'try', 'to', 'do', 'my', 'best', 'doing', 'hard', 'work'],
    pattern: 'to'
  },
  {
    verb: 'avoid',
    prompt: 'Say you stay away from making mistakes',
    target: 'I avoid making mistakes',
    words: ['I', 'avoid', 'making', 'mistakes', 'to', 'make', 'doing', 'any'],
    pattern: 'ing'
  },
  {
    verb: 'promise',
    prompt: 'Make a promise about helping someone',
    target: 'I promise to help you',
    words: ['I', 'promise', 'to', 'help', 'you', 'helping', 'will', 'for'],
    pattern: 'to'
  },
  {
    verb: 'keep',
    prompt: 'Express continuous practice',
    target: 'Keep practicing every day',
    alternatives: ['Keep practicing daily'],
    words: ['Keep', 'practicing', 'every', 'day', 'to', 'practice', 'all', 'daily'],
    pattern: 'ing'
  },
  {
    verb: 'plan',
    prompt: 'Talk about future travel plans',
    target: 'We plan to visit France',
    words: ['We', 'plan', 'to', 'visit', 'France', 'visiting', 'will', 'in'],
    pattern: 'to'
  },
  {
    verb: 'miss',
    prompt: 'Express nostalgia about past activities',
    target: 'I miss playing with friends',
    alternatives: ['I miss playing with my friends'],
    words: ['I', 'miss', 'playing', 'with', 'friends', 'to', 'play', 'my'],
    pattern: 'ing'
  },
  {
    verb: 'learn',
    prompt: 'Talk about acquiring a new skill',
    target: 'She is learning to code',
    words: ['She', 'is', 'learning', 'to', 'code', 'coding', 'how', 'can'],
    pattern: 'to'
  },
  {
    verb: 'manage',
    prompt: 'Express successful completion despite difficulty',
    target: 'I managed to finish early',
    words: ['I', 'managed', 'to', 'finish', 'early', 'finishing', 'did', 'soon'],
    pattern: 'to'
  },
  {
    verb: 'suggest',
    prompt: 'Make a suggestion about taking a break',
    target: 'I suggest taking a break',
    words: ['I', 'suggest', 'taking', 'a', 'break', 'to', 'take', 'we'],
    pattern: 'ing'
  },
  {
    verb: 'hope',
    prompt: 'Express hope for meeting someone',
    target: 'I hope to see you',
    words: ['I', 'hope', 'to', 'see', 'you', 'seeing', 'will', 'can'],
    pattern: 'to'
  },
  {
    verb: 'practice',
    prompt: 'Talk about regular language practice',
    target: 'She practices speaking English',
    words: ['She', 'practices', 'speaking', 'English', 'to', 'speak', 'in', 'daily'],
    pattern: 'ing'
  },
  {
    verb: 'agree',
    prompt: 'Express agreement to participate',
    target: 'They agreed to join us',
    words: ['They', 'agreed', 'to', 'join', 'us', 'joining', 'will', 'with'],
    pattern: 'to'
  },
  {
    verb: 'consider',
    prompt: 'Talk about thinking of changing something',
    target: 'Consider changing your approach',
    words: ['Consider', 'changing', 'your', 'approach', 'to', 'change', 'the', 'new'],
    pattern: 'ing'
  },
  {
    verb: 'refuse',
    prompt: 'Express refusal to give up',
    target: 'I refuse to give up',
    words: ['I', 'refuse', 'to', 'give', 'up', 'giving', 'will', 'never'],
    pattern: 'to'
  },
  {
    verb: 'imagine',
    prompt: 'Talk about imagining a different life',
    target: 'Imagine living on Mars',
    words: ['Imagine', 'living', 'on', 'Mars', 'to', 'live', 'in', 'the'],
    pattern: 'ing'
  },
  {
    verb: 'offer',
    prompt: 'Make an offer to assist',
    target: 'He offered to drive me',
    words: ['He', 'offered', 'to', 'drive', 'me', 'driving', 'will', 'can'],
    pattern: 'to'
  },
  {
    verb: 'risk',
    prompt: 'Warn about potential loss',
    target: 'Don\'t risk losing everything',
    words: ['Don\'t', 'risk', 'losing', 'everything', 'to', 'lose', 'all', 'your'],
    pattern: 'ing'
  },
  {
    verb: 'fail',
    prompt: 'Talk about unsuccessful understanding',
    target: 'I failed to understand',
    words: ['I', 'failed', 'to', 'understand', 'understanding', 'could', 'not', 'it'],
    pattern: 'to'
  },
  {
    verb: 'delay',
    prompt: 'Talk about postponing a decision',
    target: 'They delayed making decisions',
    words: ['They', 'delayed', 'making', 'decisions', 'to', 'make', 'the', 'any'],
    pattern: 'ing'
  },
  {
    verb: 'choose',
    prompt: 'Express a choice to remain',
    target: 'I chose to stay here',
    words: ['I', 'chose', 'to', 'stay', 'here', 'staying', 'will', 'there'],
    pattern: 'to'
  },
  {
    verb: 'expect',
    prompt: 'Talk about expectations for arrival',
    target: 'We expect to arrive soon',
    words: ['We', 'expect', 'to', 'arrive', 'soon', 'arriving', 'will', 'be'],
    pattern: 'to'
  },
  {
    verb: 'recommend',
    prompt: 'Give a recommendation for reading',
    target: 'I recommend reading this book',
    words: ['I', 'recommend', 'reading', 'this', 'book', 'to', 'read', 'the'],
    pattern: 'ing'
  },
  {
    verb: 'pretend',
    prompt: 'Talk about pretending to know',
    target: 'He pretended to understand',
    words: ['He', 'pretended', 'to', 'understand', 'understanding', 'that', 'he', 'did'],
    pattern: 'to'
  },
  {
    verb: 'afford',
    prompt: 'Express financial capability',
    target: 'I can\'t afford to travel',
    words: ['I', 'can\'t', 'afford', 'to', 'travel', 'traveling', 'go', 'now'],
    pattern: 'to'
  },
  {
    verb: 'quit',
    prompt: 'Talk about stopping a bad habit',
    target: 'She quit eating junk food',
    words: ['She', 'quit', 'eating', 'junk', 'food', 'to', 'eat', 'all'],
    pattern: 'ing'
  }
])

// Computed Properties
const accuracy = computed(() => totalAnswers.value > 0 ? (correctAnswers.value / totalAnswers.value) * 100 : 0)

// Game Methods
function startGame() {
  gameStarted.value = true
  currentRound.value = 0
  score.value = 0
  correctAnswers.value = 0
  totalAnswers.value = 0
  hintsUsed.value = 0

  nextChallenge()
}

function nextChallenge() {
  if (currentRound.value >= totalRounds.value) {
    endGame()
    return
  }

  currentRound.value++
  roundComplete.value = false
  showTarget.value = false
  feedbackMessage.value = null

  // Select challenge based on unlocked verbs
  const availableChallenges = challenges.value.filter(challenge => {
    const verb = store.getVerbById(challenge.verb)
    return verb && store.unlockedVerbs.some(v => v.id === challenge.verb)
  })

  if (availableChallenges.length === 0) {
    currentChallenge.value = challenges.value[0] // Fallback
  } else {
    currentChallenge.value = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
  }

  // Shuffle words
  availableWords.value = [...currentChallenge.value.words].sort(() => Math.random() - 0.5)
  builtSentence.value = []
}

function addWord(word) {
  builtSentence.value.push(word)
  // Remove word from available words to prevent duplicates
  const index = availableWords.value.indexOf(word)
  if (index > -1) {
    availableWords.value.splice(index, 1)
  }
}

function removeWord(index) {
  const word = builtSentence.value[index]
  builtSentence.value.splice(index, 1)
  availableWords.value.push(word)
}

function clearSentence() {
  availableWords.value = [...currentChallenge.value.words].sort(() => Math.random() - 0.5)
  builtSentence.value = []
}

function checkSentence() {
  const userSentence = builtSentence.value.join(' ')
  const targetSentence = currentChallenge.value.target
  const alternatives = currentChallenge.value.alternatives || []

  totalAnswers.value++

  // メインの正解またはいずれかの代替正解と一致するかチェック
  const isCorrect = userSentence.toLowerCase() === targetSentence.toLowerCase() ||
                   alternatives.some(alt => userSentence.toLowerCase() === alt.toLowerCase())

  if (isCorrect) {
    correctAnswers.value++
    const points = calculatePoints()
    score.value += points

    store.updateAccuracy(currentChallenge.value.verb, true)

    feedbackMessage.value = {
      type: 'correct',
      title: 'Perfect Build!',
      text: `+${points} points! Great sentence structure.`
    }

    roundComplete.value = true

  } else {
    store.updateAccuracy(currentChallenge.value.verb, false)

    feedbackMessage.value = {
      type: 'incorrect',
      title: 'Not Quite Right',
      text: 'Check the verb pattern and word order.'
    }

    // Show target after 3 seconds for learning
    setTimeout(() => {
      showTarget.value = true
    }, 3000)
  }
}

function calculatePoints() {
  let basePoints = 200

  // Bonus for speed (less hints used)
  const hintBonus = (maxHints.value - hintsUsed.value) * 50

  // Bonus for round progression
  const progressBonus = currentRound.value * 25

  return basePoints + hintBonus + progressBonus
}

function showHint() {
  if (hintsUsed.value >= maxHints.value) return

  hintsUsed.value++

  // Show different types of hints
  if (hintsUsed.value === 1) {
    feedbackMessage.value = {
      type: 'hint',
      title: 'Hint: Pattern',
      text: `This verb uses the "${currentChallenge.value.pattern}" pattern`
    }
  } else if (hintsUsed.value === 2) {
    feedbackMessage.value = {
      type: 'hint',
      title: 'Hint: First Words',
      text: `Start with: "${currentChallenge.value.target.split(' ').slice(0, 2).join(' ')}"`
    }
  } else {
    showTarget.value = true
    feedbackMessage.value = {
      type: 'hint',
      title: 'Full Answer',
      text: 'Target sentence revealed above!'
    }
  }

  setTimeout(() => {
    if (feedbackMessage.value?.type === 'hint') {
      feedbackMessage.value = null
    }
  }, 4000)
}

function endGame() {
  gameComplete.value = true
  store.addScore(score.value)

  // Complete stage if performance is good enough
  if (accuracy.value >= 70) {
    store.completeStage(2)
  }
}

function playAgain() {
  gameComplete.value = false
  startGame()
}

function goToNextStage() {
  router.push({ name: 'meaning-duel-game' })
}

function goBack() {
  router.push({ name: 'verb-pattern-galaxy-hub' })
}
</script>

<style scoped>
.pattern-builder-game {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
}

/* Scrollbar styles for word bank */
.word-bank-scroll::-webkit-scrollbar {
  width: 6px;
}

.word-bank-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.word-bank-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

.word-bank-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

/* Mobile landscape optimization */
@media (orientation: landscape) and (max-height: 600px) {
  .pattern-builder-game {
    font-size: 0.875rem;
  }

  .game-header {
    padding: 0.5rem !important;
  }

  .word-bank-container {
    max-height: 100px !important;
  }
}

/* Tablet optimization */
@media (min-width: 768px) and (max-width: 1024px) {
  .word-bank-container {
    max-height: 140px;
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(120deg); }
  66% { transform: translateY(5px) rotate(240deg); }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
  }
}

@keyframes cosmic-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1);
  }
  50% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 30px rgba(34, 197, 94, 0.2);
  }
}

.bg-gradient-to-r.from-blue-500.to-cyan-500:hover {
  animation: pulse-glow 2s infinite;
}

.bg-gradient-to-r.from-emerald-500.to-green-600:hover {
  animation: cosmic-pulse 1.5s infinite;
}
</style>