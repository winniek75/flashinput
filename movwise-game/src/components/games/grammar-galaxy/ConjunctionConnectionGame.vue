<template>
  <div class="galaxy-background relative min-h-screen overflow-hidden">
    <!-- Animated stars background -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Introduction Screen -->
      <div v-if="gameState === 'introduction'" class="max-w-4xl mx-auto">
        <!-- Header with back button -->
        <div class="flex justify-between items-center mb-4">
          <button
            @click="goBack"
            class="galaxy-button galaxy-button-secondary"
          >
            ← 戻る
          </button>
          <div class="text-center flex-grow">
            <h1 class="cosmic-title text-3xl font-bold mb-2">接続詞パズル</h1>
            <p class="galaxy-moon-silver text-base">
              文章を完成させる接続詞を選んで、パズルを解こう！
            </p>
          </div>
          <div class="w-20"></div> <!-- spacer for centering -->
        </div>

        <!-- Tabbed Learning Interface -->
        <div class="learning-tabs">
          <div class="tab-navigation">
            <div
              v-for="tab in conjunctionTabs"
              :key="tab.id"
              class="tab-button"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <div class="tab-icon">{{ tab.icon }}</div>
              <div class="tab-label">{{ tab.label }}</div>
            </div>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'basics'" class="tab-panel">
              <div class="panel-title">基本の接続詞</div>
              <div class="basic-conjunctions-grid">
                <div class="basic-conjunction-card">
                  <div class="conjunction-icon">➕</div>
                  <div class="conjunction-name">and</div>
                  <div class="conjunction-meaning">〜と、〜そして</div>
                  <div class="conjunction-example">I like cats and dogs.</div>
                </div>
                <div class="basic-conjunction-card">
                  <div class="conjunction-icon">⚖️</div>
                  <div class="conjunction-name">but</div>
                  <div class="conjunction-meaning">しかし、けれども</div>
                  <div class="conjunction-example">It's small but powerful.</div>
                </div>
                <div class="basic-conjunction-card">
                  <div class="conjunction-icon">🔀</div>
                  <div class="conjunction-name">or</div>
                  <div class="conjunction-meaning">または、それとも</div>
                  <div class="conjunction-example">Tea or coffee?</div>
                </div>
                <div class="basic-conjunction-card">
                  <div class="conjunction-icon">➡️</div>
                  <div class="conjunction-name">so</div>
                  <div class="conjunction-meaning">だから、それで</div>
                  <div class="conjunction-example">I was tired, so I went home.</div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'advanced'" class="tab-panel">
              <div class="panel-title">上級の接続表現</div>
              <div class="advanced-info">
                <div class="level-section">
                  <div class="level-title galaxy-text-primary">中級レベル</div>
                  <div class="level-items">
                    <div class="level-item">because (理由)</div>
                    <div class="level-item">although (譲歩)</div>
                    <div class="level-item">while (同時)</div>
                    <div class="level-item">when (時間)</div>
                  </div>
                </div>
                <div class="level-section">
                  <div class="level-title galaxy-text-primary">上級レベル</div>
                  <div class="level-items">
                    <div class="level-item">however (対照)</div>
                    <div class="level-item">therefore (結論)</div>
                    <div class="level-item">moreover (追加)</div>
                    <div class="level-item">nevertheless (それでも)</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'rules'" class="tab-panel">
              <div class="panel-title">接続のルール</div>
              <div class="rules-list">
                <div class="rule-item">📝 文脈を読む - 前後の文の関係を理解</div>
                <div class="rule-item">🔗 論理的つながり - 原因と結果、対照などの関係</div>
                <div class="rule-item">💭 意味を考える - 完成した文が自然になるかチェック</div>
                <div class="rule-item">⚡ 練習あるのみ - たくさん練習して慣れよう</div>
              </div>
            </div>

            <div v-if="activeTab === 'path'" class="tab-panel">
              <div class="panel-title">学習ステップ</div>
              <div class="learning-path-compact">
                <div class="path-item">
                  <span class="step-number">1</span>
                  <span class="step-content">基本接続詞 (and, but, or, so)</span>
                </div>
                <div class="path-item">
                  <span class="step-number">2</span>
                  <span class="step-content">従属接続詞 (because, although, while)</span>
                </div>
                <div class="path-item">
                  <span class="step-number">3</span>
                  <span class="step-content">接続副詞 (however, therefore, moreover)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="start-section">
          <button
            @click="startGame"
            class="galaxy-button galaxy-button-large galaxy-button-primary"
          >
            <span class="mr-2">🚀</span>
            パズルを始める
          </button>
        </div>
      </div>

      <!-- Playing Screen -->
      <div v-else-if="gameState === 'playing'" class="max-w-6xl mx-auto">
        <!-- Game Header with back button -->
        <div class="flex justify-between items-center mb-4">
          <button
            @click="goBack"
            class="galaxy-button galaxy-button-secondary"
          >
            ← 戻る
          </button>

          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-value">L{{ currentLevel }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📝</span>
              <span class="stat-value">{{ currentQuestionIndex + 1 }}/{{ questionsInLevel }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💎</span>
              <span class="stat-value">{{ score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ stars }}/3</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="level-progress mb-4">
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: `${(currentQuestionIndex / questionsInLevel) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Puzzle Board -->
        <div class="puzzle-board">
          <div class="puzzle-instruction">
            <div class="instruction-text">正しい接続詞を選んで文章を完成させよう</div>
          </div>

          <!-- Sentence Puzzle -->
          <div class="sentence-puzzle" v-if="currentPuzzle">
            <div class="sentence-part">
              <div class="sentence-piece">{{ currentPuzzle.leftSentence }}</div>
            </div>

            <div class="conjunction-slot" 
                 :class="{ 
                   filled: selectedConjunction, 
                   correct: showResult && selectedConjunction?.isCorrect,
                   incorrect: showResult && selectedConjunction && !selectedConjunction.isCorrect 
                 }"
                 @dragover="onDragOver"
                 @drop="onDrop">
              <div v-if="selectedConjunction" class="dropped-conjunction">
                {{ selectedConjunction.conjunction }}
              </div>
              <div v-else class="slot-placeholder">
                接続詞をここに
              </div>
            </div>

            <div class="sentence-part">
              <div class="sentence-piece">{{ currentPuzzle.rightSentence }}</div>
            </div>
          </div>

          <!-- Draggable Conjunction Options -->
          <div class="conjunction-options">
            <div class="options-title">選択肢</div>
            <div class="draggable-conjunctions">
              <div 
                v-for="option in currentPuzzle?.options || []" 
                :key="option.id"
                class="conjunction-piece"
                :class="{ used: usedConjunctions.includes(option.id) }"
                :draggable="!usedConjunctions.includes(option.id)"
                @dragstart="onDragStart($event, option)"
              >
                <span class="conjunction-text">{{ option.conjunction }}</span>
                <span class="conjunction-meaning">{{ option.meaning }}</span>
              </div>
            </div>
          </div>

          <!-- Action Area -->
          <div class="action-area" v-if="selectedConjunction && !showResult">
            <button @click="checkAnswer" class="check-button">
              <span class="button-icon">✓</span>
              答えをチェック
            </button>
          </div>

          <!-- Result Display -->
          <div v-if="showResult" class="result-display">
            <div class="result-content" :class="{ success: selectedConjunction?.isCorrect, failure: !selectedConjunction?.isCorrect }">
              <div class="result-summary">
                <span class="result-icon">{{ selectedConjunction?.isCorrect ? '🎉' : '❌' }}</span>
                <span class="result-message">{{ selectedConjunction?.isCorrect ? '正解！' : '不正解...' }}</span>
              </div>
              <div class="complete-sentence">
                {{ currentPuzzle.leftSentence }} <strong>{{ selectedConjunction?.conjunction }}</strong> {{ currentPuzzle.rightSentence }}
              </div>
              <button @click="nextQuestion" class="next-button">
                <span class="mr-2">➡️</span>
                次の問題
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Level Complete Modal -->
      <div v-if="gameState === 'levelComplete'" class="level-complete">
        <div class="level-complete-content">
          <div class="level-title">レベル{{ currentLevel }}完了！</div>
          <div class="stars-earned">
            <span v-for="n in 3" :key="n" class="star">
              {{ n <= stars ? '⭐' : '☆' }}
            </span>
          </div>
          <div class="level-stats">
            <div class="stat">スコア: {{ score }}</div>
            <div class="stat">獲得スター: {{ stars }}/3</div>
          </div>
          <button @click="nextLevel" class="level-continue-button">
            <span class="mr-2">🚀</span>
            次のレベルへ
          </button>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-else-if="gameState === 'results'" class="max-w-4xl mx-auto text-center">
        <div class="mb-8">
          <div class="result-icon-large mb-4">🎊</div>
          <h2 class="cosmic-title text-3xl font-bold mb-4">すべてのレベルクリア！</h2>
          <p class="galaxy-moon-silver text-lg">おめでとうございます！</p>
        </div>

        <div class="results-grid mb-8">
          <div class="results-section">
            <div class="section-title">最終結果</div>
            <div class="compact-stats-grid">
              <div class="compact-stat">
                <div class="stat-icon">💎</div>
                <div class="stat-value">{{ score }}</div>
                <div class="stat-label">総スコア</div>
              </div>
              <div class="compact-stat">
                <div class="stat-icon">⭐</div>
                <div class="stat-value">{{ stars }}</div>
                <div class="stat-label">獲得スター</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 justify-center">
          <button @click="restartGame" class="galaxy-button galaxy-button-secondary">
            <span class="mr-2">🔄</span>
            もう一度プレイ
          </button>
          <button @click="handleBackToHub" class="galaxy-button galaxy-button-primary">
            <span class="mr-2">🏠</span>
            ホームに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- Footer Navigation -->
    <CommonFooter @navigate="handleFooterNavigation" />
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
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
    const gameState = ref('introduction')
    const currentLevel = ref(1)
    const currentQuestionIndex = ref(0)
    const questionsInLevel = ref(5)
    const score = ref(0)
    const stars = ref(0)

    // Puzzle state
    const currentPuzzle = ref(null)
    const selectedConjunction = ref(null)
    const usedConjunctions = ref([])
    const showResult = ref(false)

    // Introduction state
    const activeTab = ref('basics')

    // Tab configuration
    const conjunctionTabs = ref([
      { id: 'basics', icon: '📚', label: '基本' },
      { id: 'advanced', icon: '🎓', label: '上級' },
      { id: 'rules', icon: '📋', label: 'ルール' },
      { id: 'path', icon: '🛤️', label: '学習パス' }
    ])

    // Game result for external integration
    const gameResult = ref(null)

    // Puzzle database
    const puzzleDatabase = [
      // Beginner Level
      {
        id: 'and_addition_1',
        level: 'beginner',
        type: 'addition',
        leftSentence: '私は本を読みます',
        rightSentence: '音楽を聞きます',
        options: [
          { id: 'a', conjunction: 'and', isCorrect: true, meaning: '〜と' },
          { id: 'b', conjunction: 'but', isCorrect: false, meaning: 'しかし' },
          { id: 'c', conjunction: 'or', isCorrect: false, meaning: 'または' },
          { id: 'd', conjunction: 'so', isCorrect: false, meaning: 'だから' }
        ],
        explanation: 'and は2つの動作を結合します。読書と音楽鑑賞の両方をします。'
      },
      {
        id: 'but_contrast_1',
        level: 'beginner',
        type: 'contrast',
        leftSentence: '天気は良いです',
        rightSentence: '風が強いです',
        options: [
          { id: 'a', conjunction: 'but', isCorrect: true, meaning: 'しかし' },
          { id: 'b', conjunction: 'and', isCorrect: false, meaning: '〜と' },
          { id: 'c', conjunction: 'or', isCorrect: false, meaning: 'または' },
          { id: 'd', conjunction: 'so', isCorrect: false, meaning: 'だから' }
        ],
        explanation: 'but は対照を表します。良い天気にも関わらず風が強いという対比です。'
      },
      {
        id: 'or_choice_1',
        level: 'beginner',
        type: 'choice',
        leftSentence: 'コーヒーを飲みますか',
        rightSentence: 'お茶にしますか',
        options: [
          { id: 'a', conjunction: 'or', isCorrect: true, meaning: 'または' },
          { id: 'b', conjunction: 'and', isCorrect: false, meaning: '〜と' },
          { id: 'c', conjunction: 'but', isCorrect: false, meaning: 'しかし' },
          { id: 'd', conjunction: 'so', isCorrect: false, meaning: 'だから' }
        ],
        explanation: 'or は選択肢を示します。コーヒーかお茶のどちらかを選ぶ質問です。'
      },
      {
        id: 'so_result_1',
        level: 'beginner',
        type: 'result',
        leftSentence: '雨が降っています',
        rightSentence: '傘を持ちます',
        options: [
          { id: 'a', conjunction: 'so', isCorrect: true, meaning: 'だから' },
          { id: 'b', conjunction: 'but', isCorrect: false, meaning: 'しかし' },
          { id: 'c', conjunction: 'and', isCorrect: false, meaning: '〜と' },
          { id: 'd', conjunction: 'or', isCorrect: false, meaning: 'または' }
        ],
        explanation: 'so は結果・因果関係を表します。雨が原因で傘を持つという結果です。'
      }
    ]

    // Computed properties
    const accuracy = computed(() => {
      return totalAttempts.value > 0 ? successfulConnections.value / totalAttempts.value : 0
    })

    // Methods
    const generateChallenge = () => {
      const difficultyLevel = 'beginner'  // For now, using beginner level
      const availableChallenges = puzzleDatabase.filter(c => c.level === difficultyLevel)
      const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]
      
      currentPuzzle.value = {
        ...randomChallenge,
        options: [...randomChallenge.options].sort(() => Math.random() - 0.5)
      }
    }

    const onDragStart = (event, conjunction) => {
      event.dataTransfer.setData('text/plain', conjunction.id)
    }

    const onDragOver = (event) => {
      event.preventDefault()
    }

    const onDrop = (event) => {
      event.preventDefault()
      const conjunctionId = event.dataTransfer.getData('text/plain')
      const conjunction = currentPuzzle.value.options.find(opt => opt.id === conjunctionId)
      
      if (conjunction && !usedConjunctions.value.includes(conjunctionId)) {
        selectedConjunction.value = conjunction
        usedConjunctions.value.push(conjunctionId)
      }
    }

    const checkAnswer = () => {
      if (!selectedConjunction.value) return

      const isCorrect = selectedConjunction.value.isCorrect
      showResult.value = true
      
      if (isCorrect) {
        score.value += 100
        stars.value = Math.min(3, stars.value + 1)
      }
    }

    const nextQuestion = () => {
      if (currentQuestionIndex.value < questionsInLevel.value - 1) {
        currentQuestionIndex.value++
        resetPuzzleState()
        generateChallenge()
      } else {
        nextLevel()
      }
    }

    const nextLevel = () => {
      if (currentLevel.value < 3) {
        currentLevel.value++
        currentQuestionIndex.value = 0
        resetPuzzleState()
        generateChallenge()
      } else {
        gameState.value = 'results'
      }
    }

    const resetPuzzleState = () => {
      selectedConjunction.value = null
      usedConjunctions.value = []
      showResult.value = false
    }

    const startGame = () => {
      gameState.value = 'playing'
      resetPuzzleState()
      generateChallenge()
    }

    const restartGame = () => {
      gameState.value = 'introduction'
      currentLevel.value = 1
      currentQuestionIndex.value = 0
      score.value = 0
      stars.value = 0
      resetPuzzleState()
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
          logger.warn('Unknown navigation section:', section);
      }
    };

    const handleGameCompletion = async () => {
      try {
        const finalScore = score.value
        const accuracy = stars.value / 3
        const crystalReward = Math.floor(finalScore / 15)
        
        const result = {
          gameId: 'conjunction-connection',
          gameName: 'Conjunction Connection',
          score: finalScore,
          accuracy,
          crystalReward,
          vrReadinessGain: Math.floor(accuracy * 30)
        }
        
        gameResult.value = result
        
      } catch (error) {
        logger.error('❌ Error in handleGameCompletion:', error)
      }
    }
    
    const handleBackToHub = () => {
      router.push({ name: 'grammar-core-planet' })
    }
    
    const handleRetryGame = () => {
      gameState.value = 'introduction'
      gameResult.value = null
    }

    // Initialize game on mount
    onMounted(() => {
      generateChallenge()
    })

    // Go back to platform
    const goBack = () => {
      router.push('/platforms/grammar-galaxy')
    }

    return {
      // Game state
      gameState,
      currentLevel,
      currentQuestionIndex,
      questionsInLevel,
      score,
      stars,
      
      // Puzzle state
      currentPuzzle,
      selectedConjunction,
      usedConjunctions,
      showResult,
      
      // Introduction
      activeTab,
      conjunctionTabs,
      
      // Methods
      startGame,
      goBack,
      onDragStart,
      onDragOver,
      onDrop,
      checkAnswer,
      nextQuestion,
      nextLevel,
      restartGame,
      handleFooterNavigation,
      handleGameCompletion,
      handleBackToHub,
      handleRetryGame,
      gameResult
    }
  }
}
</script>

<style scoped>
/* Galaxy Background */
.galaxy-background {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  color: white;
}

.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Game Stats */
.game-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-weight: bold;
  color: #fbbf24;
}

/* Progress Bar */
.level-progress {
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(124, 58, 237, 0.3);
}

.progress-bar-bg {
  background: rgba(0, 0, 0, 0.5);
  height: 0.75rem;
  border-radius: 0.375rem;
  overflow: hidden;
}

.progress-bar-fill {
  background: linear-gradient(90deg, #8b5cf6, #06b6d4);
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 0.375rem;
}

/* Puzzle Board */
.puzzle-board {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(124, 58, 237, 0.4);
  border-radius: 1.5rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.puzzle-instruction {
  text-align: center;
  margin-bottom: 1rem;
}

.instruction-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.hint-text {
  color: #94a3b8;
  font-size: 1rem;
}

/* Sentence Puzzle */
.sentence-puzzle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.sentence-part {
  display: flex;
  align-items: center;
}

.sentence-piece {
  background: linear-gradient(135deg, #1e293b, #334155);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: 2px solid #475569;
  font-size: 1.1rem;
  font-weight: 500;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.conjunction-slot {
  width: 10rem;
  height: 4rem;
  border: 3px dashed #6b7280;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.conjunction-slot.filled {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.conjunction-slot.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
  animation: pulse 0.5s ease;
}

.conjunction-slot.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
  animation: shake 0.5s ease;
}

.dropped-conjunction {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: bold;
  color: white;
}

.slot-placeholder {
  color: #6b7280;
  text-align: center;
  font-size: 0.9rem;
}

/* Conjunction Options */
.conjunction-options {
  margin-top: 1rem;
}

.options-title {
  text-align: center;
  color: #94a3b8;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.draggable-conjunctions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.conjunction-piece {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  padding: 1rem;
  border-radius: 1rem;
  border: 2px solid #2563eb;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 8rem;
}

.conjunction-piece:hover:not(.used) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.conjunction-piece.used {
  opacity: 0.5;
  cursor: not-allowed;
}

.conjunction-text {
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  display: block;
}

.conjunction-meaning {
  font-size: 0.8rem;
  color: #bfdbfe;
  margin-top: 0.25rem;
}

/* Action Area */
.action-area {
  text-align: center;
  margin: 1rem 0;
}

.check-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.check-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.button-icon {
  font-size: 1.3rem;
}

/* Result Display */
.result-display {
  margin-top: 1rem;
}

.result-content {
  text-align: center;
  padding: 1rem;
  border-radius: 1rem;
  border: 2px solid;
  max-width: 600px;
  margin: 0 auto;
}

.result-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.result-content.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.result-content.failure {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.result-icon {
  font-size: 1.5rem;
}

.result-message {
  font-size: 1.25rem;
  font-weight: bold;
}

.result-content.success .result-message {
  color: #10b981;
}

.result-content.failure .result-message {
  color: #ef4444;
}

.complete-sentence {
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
  margin: 0.75rem 0;
  font-style: italic;
}

.explanation {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 0.75rem;
  margin: 1rem 0;
  text-align: left;
}

.explanation p {
  margin: 0.5rem 0;
  color: #d1d5db;
}

.next-button {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

/* Level Complete */
.level-complete {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.level-complete-content {
  background: linear-gradient(135deg, #1e293b, #334155);
  padding: 3rem;
  border-radius: 2rem;
  text-align: center;
  border: 2px solid #8b5cf6;
  max-width: 500px;
}

.level-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 2rem;
}

.stars-earned {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.star {
  font-size: 3rem;
  animation: bounce 0.5s ease;
}

.level-stats {
  margin: 2rem 0;
}

.stat {
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0.5rem 0;
}

.level-continue-button {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Galaxy styling classes */
.cosmic-title {
  background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.3));
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.galaxy-text-primary {
  color: #fbbf24;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

/* Learning interface styles */
.learning-tabs {
  margin: 0.5rem 0;
}

.tab-navigation {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab-button:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
}

.tab-button.active {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.tab-content {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  padding: 0.75rem;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-title {
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

/* Basic conjunctions grid */
.basic-conjunctions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.basic-conjunction-card {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.5rem;
  padding: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.conjunction-icon {
  font-size: 1.2rem;
}

.conjunction-name {
  font-weight: bold;
  color: #6ee7b7;
  font-size: 1rem;
}

.conjunction-meaning {
  color: #94a3b8;
  font-size: 0.75rem;
}

.conjunction-example {
  font-size: 0.7rem;
  color: #64748b;
  font-style: italic;
}

/* Advanced info styles */
.advanced-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.level-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.level-title {
  font-size: 1.125rem;
  font-weight: bold;
  text-align: center;
}

.level-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.level-item {
  padding: 0.5rem 1rem;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #94a3b8;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

/* Rules list */
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 0.5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.rule-card {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-icon {
  font-size: 2rem;
}

.rule-title {
  font-weight: bold;
  color: #6ee7b7;
}

.rule-desc {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Learning path */
.learning-path-compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  border: 1px solid rgba(71, 85, 105, 0.5);
}

.path-item .step-number {
  width: 24px;
  height: 24px;
  background: linear-gradient(45deg, #8b5cf6, #06b6d4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
}

.path-item .step-content {
  font-size: 0.875rem;
  color: #94a3b8;
}

.path-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 0.75rem;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.path-step.beginner {
  border-color: rgba(34, 197, 94, 0.3);
}

.path-step.intermediate {
  border-color: rgba(245, 158, 11, 0.3);
}

.path-step.advanced {
  border-color: rgba(239, 68, 68, 0.3);
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  background: #10b981;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: bold;
  font-size: 1.125rem;
}

.step-desc {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Start section */
.start-section {
  text-align: center;
  margin-top: 1rem;
}

.start-section button {
  transform: scale(1);
  transition: all 0.3s ease;
}

.start-section button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}

/* Galaxy buttons */
.galaxy-button {
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.galaxy-button-large {
  padding: 1rem 2rem;
  font-size: 1.25rem;
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

/* Results styles */
.result-icon-large {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: bold;
  text-align: center;
}

.compact-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.compact-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.compact-stat .stat-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.compact-stat .stat-value {
  font-size: 1.125rem;
  font-weight: bold;
  color: #fbbf24;
}

.compact-stat .stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sentence-puzzle {
    flex-direction: column;
    gap: 1rem;
  }
  
  .draggable-conjunctions {
    gap: 0.5rem;
  }
  
  .conjunction-piece {
    min-width: 6rem;
    padding: 0.75rem;
  }
  
  .game-stats {
    gap: 0.5rem;
  }
  
  .stat-item {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>