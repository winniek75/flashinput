<template>
  <div class="min-h-screen galaxy-background">
    <!-- Setup Screen -->
    <main class="fixed inset-0 flex items-center justify-center z-10" v-if="gameState === 'setup'">
      <div class="galaxy-card p-8 max-w-2xl w-full mx-4">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-yellow-400 cosmic-title mb-2">
            🚀 Progressive Dodge
          </h1>
        </div>
        
        <!-- Simple Difficulty Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-cyan-400 mb-3 text-center">難易度選択</h3>
          <div class="grid grid-cols-3 gap-3">
            <button 
              v-for="level in difficultyLevels" 
              :key="level.id"
              @click="selectedDifficulty = level.id"
              class="compact-difficulty-card"
              :class="{ 'selected': selectedDifficulty === level.id }"
            >
              <div class="text-2xl mb-1">{{ level.icon }}</div>
              <div class="text-sm font-bold">{{ level.name }}</div>
            </button>
          </div>
        </div>

        <div class="text-center">
          <button 
            @click="startGame"
            class="galaxy-button galaxy-button-large"
            :disabled="!selectedDifficulty"
          >
            <span class="text-2xl mr-3">🚀</span>
            <span>ドッジ開始！</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Game Screen (Simple) -->
    <main class="fixed inset-0 z-10 flex flex-col" v-if="gameState === 'playing'">
      <div class="p-8 text-center text-white">
        <h2 class="text-2xl mb-4">🚀 Progressive Dodge - Playing</h2>
        
        <!-- Current Challenge Display -->
        <div v-if="currentChallenge && !showResult" class="mb-6">
          <h3 class="text-xl mb-4">{{ currentChallenge.prompt }}</h3>
          
          <!-- Options -->
          <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <button 
              v-for="option in currentChallenge.options" 
              :key="option.id"
              @click="selectOption(option.id)"
              class="p-4 rounded-lg border-2 transition-all"
              :class="selectedOption === option.id ? 'border-green-400 bg-green-900/50' : 'border-gray-600 bg-gray-800/50'"
            >
              {{ option.form }}
            </button>
          </div>
          
          <!-- Submit Button -->
          <button 
            v-if="selectedOption"
            @click="submitAnswer" 
            class="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            Submit Answer
          </button>
        </div>

        <!-- Result Display -->
        <div v-if="showResult" class="mb-6">
          <h3 class="text-xl mb-2">{{ lastAnswerCorrect ? '✅ Correct!' : '❌ Incorrect!' }}</h3>
          <p class="mb-4">{{ currentChallenge?.explanation }}</p>
          <button @click="nextQuestion" class="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg">
            Next Question ({{ currentRound }}/{{ totalRounds }})
          </button>
        </div>
        
        <!-- Stats -->
        <div class="text-sm">
          Score: {{ totalScore }} | Lives: {{ lives }} | Round: {{ currentRound }}/{{ totalRounds }}
        </div>
      </div>
    </main>

    <!-- Results Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'results'">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-3xl font-bold mb-6">Game Complete!</h2>
        <p class="text-xl mb-4">Final Score: {{ totalScore }}</p>
        <p class="text-lg mb-6">Accuracy: {{ Math.round(accuracy * 100) }}%</p>
        
        <div class="flex gap-4 justify-center">
          <button @click="restartGame" class="galaxy-button galaxy-button-secondary">
            🔄 もう一度
          </button>
          <button @click="$router.push('/grammar-galaxy-hub')" class="galaxy-button galaxy-button-primary">
            🌌 文法銀河へ戻る
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ProgressiveTenseGame',
  setup() {
    const router = useRouter()

    // Game state
    const gameState = ref('setup') // setup, playing, results
    const selectedDifficulty = ref('beginner')
    const currentRound = ref(1)
    const totalRounds = ref(10)
    const lives = ref(3)
    const totalScore = ref(0)
    const correctAnswers = ref(0)

    // Game objects
    const currentChallenge = ref(null)
    const selectedOption = ref(null)
    const showResult = ref(false)
    const lastAnswerCorrect = ref(false)

    // Simple game configuration
    const difficultyLevels = [
      {
        id: 'beginner',
        name: '初級',
        icon: '🟢'
      },
      {
        id: 'intermediate', 
        name: '中級',
        icon: '🟡'
      },
      {
        id: 'advanced',
        name: '上級',
        icon: '🔴'
      }
    ]

    // Simple question database
    const questions = [
      {
        id: 1,
        prompt: '彼は今本を読んでいます。',
        options: [
          { id: 'a', form: 'is reading', isCorrect: true },
          { id: 'b', form: 'reads', isCorrect: false }
        ],
        explanation: '「今」は現在進行形のサイン。'
      },
      {
        id: 2, 
        prompt: '私は毎朝コーヒーを飲みます。',
        options: [
          { id: 'a', form: 'am drinking', isCorrect: false },
          { id: 'b', form: 'drink', isCorrect: true }
        ],
        explanation: '習慣は現在形を使う。'
      }
    ]

    // Game control functions
    const startGame = () => {
      gameState.value = 'playing'
      currentChallenge.value = questions[0]
    }

    const selectOption = (optionId) => {
      selectedOption.value = optionId
    }

    const submitAnswer = () => {
      const correct = currentChallenge.value.options.find(opt => opt.id === selectedOption.value)?.isCorrect
      lastAnswerCorrect.value = correct
      showResult.value = true
      
      if (correct) {
        correctAnswers.value++
        totalScore.value += 100
      } else {
        lives.value--
      }
    }

    const nextQuestion = () => {
      currentRound.value++
      if (currentRound.value > totalRounds.value || lives.value <= 0) {
        gameState.value = 'results'
        return
      }
      
      showResult.value = false
      selectedOption.value = null
      currentChallenge.value = questions[Math.min(currentRound.value - 1, questions.length - 1)]
    }

    const restartGame = () => {
      gameState.value = 'setup'
      currentRound.value = 1
      lives.value = 3
      totalScore.value = 0
      correctAnswers.value = 0
    }

    // Computed properties
    const accuracy = computed(() => {
      return correctAnswers.value > 0 ? correctAnswers.value / currentRound.value : 0
    })

    return {
      // State
      gameState,
      selectedDifficulty,
      currentRound,
      totalRounds,
      lives,
      totalScore,
      correctAnswers,
      currentChallenge,
      selectedOption,
      showResult,
      lastAnswerCorrect,

      // Configuration
      difficultyLevels,

      // Computed
      accuracy,

      // Methods
      startGame,
      selectOption,
      submitAnswer,
      nextQuestion,
      restartGame
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  overflow: hidden;
}

.galaxy-card {
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.compact-difficulty-card {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  background: rgba(15, 23, 42, 0.8);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.compact-difficulty-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(15, 23, 42, 0.9);
}

.compact-difficulty-card.selected {
  border-color: rgba(34, 197, 94, 0.8);
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.galaxy-button {
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.galaxy-button:hover {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.7);
}

.galaxy-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.galaxy-button-large {
  padding: 16px 32px;
  font-size: 18px;
}

.galaxy-button-primary {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.2);
}

.galaxy-button-primary:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.7);
}

.galaxy-button-secondary {
  border-color: rgba(156, 163, 175, 0.5);
  background: rgba(156, 163, 175, 0.2);
}

.galaxy-button-secondary:hover {
  background: rgba(156, 163, 175, 0.3);
  border-color: rgba(156, 163, 175, 0.7);
}
</style>