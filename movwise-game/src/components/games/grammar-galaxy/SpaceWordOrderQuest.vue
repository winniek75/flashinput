<template>
  <div class="space-word-order-quest">
    <!-- Star Background with Parallax -->
    <StarBackground />
    
    <!-- Game Setup Screen -->
    <div v-if="showSetup" class="game-setup-screen">
      <!-- Galaxy Background Stars -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="stars-layer-1"></div>
        <div class="stars-layer-2"></div>
        <div class="stars-layer-3"></div>
      </div>

      <div class="setup-container">
        <div class="galaxy-card setup-main-card">
          <div class="header-row">
            <button @click="goBack" class="back-button-compact">
              <span>←</span> 戻る
            </button>
            <h2 class="setup-title galaxy-text-primary cosmic-glow">🌌 宇宙語順クエスト</h2>
          </div>

          <div class="mission-briefing galaxy-card">
            <p class="text-galaxy-moon-silver text-center">
              正しい語順で英文を組み立てて、宇宙の言語マスターになろう！
            </p>
          </div>

          <!-- レベル選択 -->
          <div class="galaxy-card level-selection">
            <h3 class="level-section-title galaxy-text-primary cosmic-glow">📚 英検レベル選択</h3>
            <div class="level-grid">
              <button
                v-for="level in availableLevels"
                :key="level.value"
                @click="selectedLevel = level.value"
                class="galaxy-button level-button"
                :class="selectedLevel === level.value ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="level-icon">{{ level.icon }}</div>
                <div class="level-name">{{ level.name }}</div>
                <div class="level-desc text-galaxy-moon-silver">{{ level.description }}</div>
              </button>
            </div>
          </div>

          <!-- 難易度選択 -->
          <div class="galaxy-card difficulty-selection">
            <h3 class="level-section-title galaxy-text-primary cosmic-glow">⚡ 難易度選択</h3>
            <div class="difficulty-grid">
              <button
                v-for="difficulty in availableDifficulties"
                :key="difficulty.value"
                @click="selectedDifficulty = difficulty.value"
                class="galaxy-button difficulty-button"
                :class="selectedDifficulty === difficulty.value ? 'galaxy-button-primary' : 'galaxy-button-secondary'"
              >
                <div class="difficulty-icon">{{ difficulty.icon }}</div>
                <div class="difficulty-name">{{ difficulty.name }}</div>
                <div class="difficulty-desc text-galaxy-moon-silver">{{ difficulty.description }}</div>
              </button>
            </div>
          </div>

          <!-- 統計プレビュー -->
          <div class="stats-preview galaxy-card">
            <div class="stat-item">
              <span class="stat-label text-galaxy-moon-silver">最高スコア</span>
              <span class="stat-value galaxy-text-primary cosmic-glow">{{ totalStars }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label text-galaxy-moon-silver">クリア率</span>
              <span class="stat-value galaxy-text-primary cosmic-glow">{{ Math.round((completedQuestions / (completedQuestions + 1)) * 100) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label text-galaxy-moon-silver">現在のレベル</span>
              <span class="stat-value galaxy-text-primary cosmic-glow">{{ levelDisplayText }}</span>
            </div>
          </div>

          <button @click="startGameWithSettings" class="galaxy-button galaxy-button-primary start-button">
            <span class="button-content">
              🚀 ミッション開始
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Header -->
    <div v-if="!showSetup" class="game-header">
      <button @click="goBack" class="back-btn">
        <i class="fas fa-arrow-left"></i> 戻る
      </button>
      
      <div class="game-info">
        <div class="level-display">
          <i class="fas fa-rocket"></i>
          {{ levelDisplayText }}
        </div>
        <div class="sublevel-display">
          <div class="experience-bar">
            <div class="exp-fill" :style="{ width: expPercentage + '%' }"></div>
          </div>
          <span class="exp-text">{{ currentExp }}/{{ expToNext }} EXP</span>
        </div>
        <div class="score-display">
          <i class="fas fa-star"></i>
          {{ score }}
        </div>
        <div class="timer-display" v-if="gameMode === 'challenge'">
          <i class="fas fa-clock"></i>
          {{ formattedTime }}
        </div>
      </div>
      
      <div class="game-controls">
        <button @click="showHint" class="hint-btn" :disabled="hintsUsed >= maxHints">
          <i class="fas fa-lightbulb"></i>
          ヒント ({{ maxHints - hintsUsed }})
        </button>
        <button 
          v-if="translationMode === 'toggle'" 
          @click="toggleTranslation" 
          class="translation-btn"
          :class="{ 'active': showTranslation }"
        >
          <i class="fas fa-language"></i>
          日本語{{ showTranslation ? 'ON' : 'OFF' }}
        </button>
        <button @click="playSound" class="sound-btn">
          <i class="fas fa-volume-up"></i>
        </button>
      </div>
    </div>

    <!-- Main Game Area -->
    <div v-if="!showSetup" class="game-main">
      <!-- Question Display -->
      <div class="question-area">
        <div class="question-text">
          <h2>正しい順序で英文を作ってください</h2>
          <transition name="translation-fade">
            <p class="japanese-translation" v-if="shouldShowTranslation">
              <i class="fas fa-language translation-icon"></i>
              {{ currentQuestion.translation }}
            </p>
          </transition>
        </div>
        
        <!-- Hint Display -->
        <transition name="hint-fade">
          <div v-if="hintVisible" class="hint-display">
            <div class="hint-content" :class="hintType">
              <i :class="hintIcon"></i>
              <p>{{ hintText }}</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- Word Planets Area -->
      <div class="planets-container">
        <div class="orbit-field">
          <WordPlanet
            v-for="(word, index) in shuffledWords"
            :key="`word-${index}-${word}`"
            :word="word"
            :index="index"
            :isDragging="draggedWord === word"
            :isCorrect="placedWords.includes(word)"
            :wordType="getWordType(word)"
            @dragstart="handleDragStart(word)"
            @dragend="handleDragEnd"
            @click="handleWordClick(word)"
            v-if="!placedWords.includes(word)"
          />
        </div>
      </div>

      <!-- Drop Zone Area -->
      <div class="drop-zone-container">
        <div class="sentence-builder">
          <DropZone
            v-for="(slot, index) in totalSlots"
            :key="`slot-${index}`"
            :index="index"
            :word="sentenceSlots[index]"
            :isCorrect="slotStatus[index]"
            :isActive="draggedWord !== null"
            @drop="handleDrop(index, $event)"
            @remove="removeWord(index)"
          />
        </div>
        
        <!-- Sentence Display -->
        <div class="sentence-display" v-if="isComplete">
          <div class="complete-sentence" :class="{ 'correct': allCorrect, 'incorrect': !allCorrect }">
            {{ completeSentence }}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          @click="checkAnswer" 
          class="check-btn"
          :disabled="placedWords.length === 0"
          v-if="!isComplete"
        >
          <i class="fas fa-check"></i>
          確認
        </button>
        
        <button 
          @click="nextQuestion" 
          class="next-btn"
          v-if="isComplete && allCorrect"
        >
          <i class="fas fa-arrow-right"></i>
          次の問題
        </button>
        
        <button 
          @click="resetAnswer" 
          class="reset-btn"
          v-if="placedWords.length > 0 && !isComplete"
        >
          <i class="fas fa-redo"></i>
          リセット
        </button>
        
        <button 
          @click="tryAgain" 
          class="retry-btn"
          v-if="isComplete && !allCorrect"
        >
          <i class="fas fa-redo"></i>
          もう一度
        </button>
      </div>
    </div>

    <!-- Progress Display -->
    <div v-if="!showSetup" class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      <div class="progress-text">
        {{ completedQuestions }} / {{ totalQuestions }} 問完了
      </div>
    </div>

    <!-- Success Modal -->
    <transition name="modal">
      <div v-if="showSuccessModal" class="success-modal">
        <div class="modal-content">
          <div class="success-animation">
            <div class="stars-earned">
              <i v-for="n in starsEarned" :key="n" class="fas fa-star star-icon"></i>
            </div>
            <h2>素晴らしい！</h2>
            <p>{{ successMessage }}</p>
          </div>
          
          <div class="modal-stats">
            <div class="stat-item">
              <span class="stat-label">正解率</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">所要時間</span>
              <span class="stat-value">{{ completionTime }}秒</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">獲得ポイント</span>
              <span class="stat-value">{{ pointsEarned }}</span>
            </div>
          </div>
          
          <button @click="closeSuccessModal" class="continue-btn">
            続ける
          </button>
        </div>
      </div>
    </transition>

    <!-- Level Up Modal -->
    <transition name="modal">
      <div v-if="showLevelUpModal" class="levelup-modal">
        <div class="modal-content levelup-theme">
          <div class="levelup-animation">
            <div class="level-badge">
              <i class="fas fa-trophy"></i>
              <span class="badge-text">LEVEL UP!</span>
            </div>
            <h2 class="levelup-title">🎉 レベルアップ！ 🎉</h2>
            <div class="level-info">
              <span class="old-level">{{ previousSubLevel }}</span>
              <i class="fas fa-arrow-right level-arrow"></i>
              <span class="new-level">{{ levelDisplayText }}</span>
            </div>
            <p class="levelup-message">{{ levelUpMessage }}</p>
          </div>
          
          <div class="levelup-rewards">
            <div class="reward-item">
              <i class="fas fa-star reward-icon"></i>
              <span>+ {{ expGained }} EXP</span>
            </div>
            <div class="reward-item">
              <i class="fas fa-trophy reward-icon"></i>
              <span>新しいチャレンジ解放</span>
            </div>
          </div>
          
          <button @click="closeLevelUpModal" class="levelup-continue-btn">
            <i class="fas fa-rocket"></i>
            次のレベルへ！
          </button>
        </div>
      </div>
    </transition>

    <!-- Level Complete Modal -->
    <transition name="modal">
      <div v-if="levelComplete" class="level-complete-modal">
        <div class="modal-content galaxy-theme">
          <h1 class="complete-title">🌟 レベル {{ currentLevel }} クリア！ 🌟</h1>
          
          <div class="planet-unlock" v-if="unlockedPlanet">
            <img :src="unlockedPlanet.image" :alt="unlockedPlanet.name" class="planet-image">
            <p>新しい惑星「{{ unlockedPlanet.name }}」が解放されました！</p>
          </div>
          
          <div class="level-stats">
            <div class="total-stars">
              <i class="fas fa-star"></i>
              総獲得スター: {{ totalStars }}
            </div>
            <div class="achievements">
              <div v-for="achievement in newAchievements" :key="achievement.id" class="achievement">
                <i :class="achievement.icon"></i>
                {{ achievement.name }}
              </div>
            </div>
          </div>
          
          <div class="level-actions">
            <button @click="proceedToNextLevel" class="next-level-btn">
              次のレベルへ
            </button>
            <button @click="replayLevel" class="replay-level-btn">
              このレベルをもう一度
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import StarBackground from './components/StarBackground.vue'
import WordPlanet from './components/WordPlanet.vue'
import DropZone from './components/DropZone.vue'
import { WORD_ORDER_QUESTIONS, PLANETS, ACHIEVEMENTS, getWordType } from './wordOrderData'

export default {
  name: 'SpaceWordOrderQuest',
  components: {
    StarBackground,
    WordPlanet,
    DropZone
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()
    
    // Setup State
    const showSetup = ref(true)
    const selectedLevel = ref(1)
    const selectedQuestionType = ref('affirmative')
    const selectedDifficulty = ref('easy')
    const selectedGameMode = ref('story')
    const selectedTranslationMode = ref('toggle')
    const selectedQuestionCount = ref(7)

    // Available options for setup
    const availableLevels = ref([
      {
        value: 1,
        name: '英検5級',
        icon: '🌟',
        description: '基本的な語順パターン'
      },
      {
        value: 2,
        name: '英検4級',
        icon: '⭐',
        description: '応用的な語順パターン'
      },
      {
        value: 3,
        name: '英検3級',
        icon: '🌠',
        description: '複雑な語順パターン'
      }
    ])

    const availableDifficulties = ref([
      {
        value: 'easy',
        name: '基本',
        icon: '🟢',
        description: 'ゆっくりペースで学習'
      },
      {
        value: 'normal',
        name: '標準',
        icon: '🟡',
        description: '標準的な学習ペース'
      },
      {
        value: 'hard',
        name: '上級',
        icon: '🔴',
        description: '高速チャレンジモード'
      }
    ])
    
    // Game State
    const currentLevel = ref(1)
    const currentSubLevel = ref(1)
    const currentQuestionIndex = ref(0)
    const score = ref(0)
    const gameMode = ref('story') // story, challenge, endless, custom
    const timer = ref(0)
    const timerInterval = ref(null)
    const questionCount = ref(7)
    
    // Experience System
    const currentExp = ref(0)
    const expToNext = ref(100)
    const expGained = ref(0)
    
    // Question State
    const currentQuestion = ref(null)
    const shuffledWords = ref([])
    const sentenceSlots = ref([])
    const placedWords = ref([])
    const slotStatus = ref([])
    const draggedWord = ref(null)
    const isComplete = ref(false)
    const allCorrect = ref(false)
    const randomQuestions = ref([]) // ランダムに選択された問題リスト
    
    // Hint System
    const hintsUsed = ref(0)
    const maxHints = ref(3)
    const hintVisible = ref(false)
    const hintType = ref('')
    const hintText = ref('')
    const hintIcon = ref('')
    const showTranslation = ref(false)
    const translationMode = ref('toggle') // 'always', 'never', 'toggle'
    
    // Progress
    const completedQuestions = ref(0)
    const totalQuestions = computed(() => {
      return randomQuestions.value.length
    })
    const progressPercentage = computed(() => {
      if (totalQuestions.value === 0) return 0
      return (completedQuestions.value / totalQuestions.value) * 100
    })
    
    // Modals
    const showSuccessModal = ref(false)
    const showLevelUpModal = ref(false)
    const levelComplete = ref(false)
    const starsEarned = ref(0)
    const successMessage = ref('')
    const levelUpMessage = ref('')
    const previousSubLevel = ref('')
    const accuracy = ref(100)
    const completionTime = ref(0)
    const pointsEarned = ref(0)
    const totalStars = ref(0)
    const unlockedPlanet = ref(null)
    const newAchievements = ref([])
    
    // Computed
    const totalSlots = computed(() => currentQuestion.value?.words.length || 0)
    const completeSentence = computed(() => sentenceSlots.value.filter(w => w).join(' '))
    const formattedTime = computed(() => {
      const minutes = Math.floor(timer.value / 60)
      const seconds = timer.value % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })
    
    const shouldShowTranslation = computed(() => {
      if (translationMode.value === 'always') return true
      if (translationMode.value === 'never') return false
      if (translationMode.value === 'toggle') return showTranslation.value
      return false
    })
    
    const levelDisplayText = computed(() => {
      const levelNames = {
        1: '英検5級',
        2: '英検4級', 
        3: '英検3級',
        4: '英検準2級',
        5: '英検2級'
      }
      return `${levelNames[currentLevel.value]} Lv.${currentSubLevel.value}`
    })
    
    const expPercentage = computed(() => {
      return (currentExp.value / expToNext.value) * 100
    })
    
    // Settings Functions
    const startGameWithSettings = () => {
      currentLevel.value = parseInt(selectedLevel.value)
      gameMode.value = selectedGameMode.value
      translationMode.value = selectedTranslationMode.value
      questionCount.value = parseInt(selectedQuestionCount.value)
      
      // Set initial translation state based on mode
      if (translationMode.value === 'always') {
        showTranslation.value = true
      } else if (translationMode.value === 'never') {
        showTranslation.value = false
      } else if (translationMode.value === 'toggle') {
        showTranslation.value = true // Default to on for toggle mode
      }
      
      showSetup.value = false
      initializeGame()
    }
    
    // Translation Functions
    const toggleTranslation = () => {
      if (translationMode.value === 'toggle') {
        showTranslation.value = !showTranslation.value
      }
    }
    
    // Get Questions based on settings
    const getQuestionsForSettings = () => {
      const levelData = WORD_ORDER_QUESTIONS[currentLevel.value]
      if (!levelData) return []
      
      // Check if this is the old data structure (array) or new structure (object)
      if (Array.isArray(levelData)) {
        // Old structure - return all questions
        return levelData
      }
      
      // New structure
      let questions = []
      
      if (selectedQuestionType.value === 'mixed') {
        // Mix all question types
        Object.values(levelData).forEach(typeData => {
          if (typeof typeData === 'object' && typeData[selectedDifficulty.value]) {
            questions = questions.concat(typeData[selectedDifficulty.value])
          }
        })
      } else {
        // Specific question type
        const typeData = levelData[selectedQuestionType.value]
        if (typeData && typeData[selectedDifficulty.value]) {
          questions = typeData[selectedDifficulty.value]
        }
      }
      
      // If no questions found in new structure, fallback to any available data
      if (questions.length === 0) {
        Object.values(levelData).forEach(typeData => {
          if (typeof typeData === 'object') {
            Object.values(typeData).forEach(difficultyData => {
              if (Array.isArray(difficultyData)) {
                questions = questions.concat(difficultyData)
              }
            })
          }
        })
      }
      
      return questions
    }
    
    // Random Question Selection
    const selectRandomQuestions = () => {
      const allQuestions = getQuestionsForSettings()
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
      randomQuestions.value = shuffled.slice(0, questionCount.value)
      completedQuestions.value = 0
      currentQuestionIndex.value = 0
    }
    
    // Experience and Level Up Functions
    const gainExperience = (exp) => {
      expGained.value = exp
      currentExp.value += exp
      
      if (currentExp.value >= expToNext.value) {
        levelUp()
      }
    }
    
    const levelUp = () => {
      previousSubLevel.value = levelDisplayText.value
      currentSubLevel.value += 1
      currentExp.value = currentExp.value - expToNext.value
      
      // Increase exp requirement for next level
      expToNext.value = Math.floor(expToNext.value * 1.2)
      
      // Show level up modal
      levelUpMessage.value = generateLevelUpMessage()
      showLevelUpModal.value = true
    }
    
    const generateLevelUpMessage = () => {
      const messages = [
        'すごい！どんどん英語が上達しています！',
        '素晴らしい進歩です！次のレベルに挑戦しましょう！',
        'やったね！君の英語力がアップしました！',
        '頑張った成果が出ています！このまま続けよう！',
        'レベルアップ！新しいチャレンジが待っています！'
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    }
    
    const closeLevelUpModal = () => {
      showLevelUpModal.value = false
    }
    
    // Initialize Game
    const initializeGame = () => {
      selectRandomQuestions()
      loadQuestion()
      if (gameMode.value === 'challenge') {
        startTimer()
      }
    }
    
    const loadQuestion = () => {
      if (currentQuestionIndex.value < randomQuestions.value.length) {
        currentQuestion.value = randomQuestions.value[currentQuestionIndex.value]
        shuffledWords.value = [...currentQuestion.value.words].sort(() => Math.random() - 0.5)
        sentenceSlots.value = new Array(currentQuestion.value.words.length).fill(null)
        slotStatus.value = new Array(currentQuestion.value.words.length).fill(null)
        placedWords.value = []
        isComplete.value = false
        allCorrect.value = false
        hintsUsed.value = 0
        hintVisible.value = false
      } else {
        // All questions completed - award exp and check for level up
        const expReward = questionCount.value * 15 // 15 exp per question
        gainExperience(expReward)
        completeLevel()
      }
    }
    
    // Timer Functions
    const startTimer = () => {
      timer.value = 0
      timerInterval.value = setInterval(() => {
        timer.value++
      }, 1000)
    }
    
    const stopTimer = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
      }
    }
    
    // Drag and Drop Handlers
    const handleDragStart = (word) => {
      draggedWord.value = word
    }
    
    const handleDragEnd = () => {
      draggedWord.value = null
    }
    
    const handleDrop = (slotIndex, event) => {
      event.preventDefault()
      
      if (draggedWord.value && !sentenceSlots.value[slotIndex]) {
        sentenceSlots.value[slotIndex] = draggedWord.value
        placedWords.value.push(draggedWord.value)
        draggedWord.value = null
        
        // Auto-check if all slots are filled
        if (placedWords.value.length === totalSlots.value) {
          checkAnswer()
        }
      }
    }
    
    const handleWordClick = (word) => {
      // Find first empty slot and place word
      const emptySlotIndex = sentenceSlots.value.findIndex(slot => slot === null)
      if (emptySlotIndex !== -1) {
        sentenceSlots.value[emptySlotIndex] = word
        placedWords.value.push(word)
        
        // Auto-check if all slots are filled
        if (placedWords.value.length === totalSlots.value) {
          checkAnswer()
        }
      }
    }
    
    const removeWord = (slotIndex) => {
      const word = sentenceSlots.value[slotIndex]
      if (word) {
        sentenceSlots.value[slotIndex] = null
        slotStatus.value[slotIndex] = null
        const wordIndex = placedWords.value.indexOf(word)
        if (wordIndex > -1) {
          placedWords.value.splice(wordIndex, 1)
        }
        isComplete.value = false
      }
    }
    
    // Answer Checking
    const checkAnswer = () => {
      const correctOrder = currentQuestion.value.correctOrder
      let correct = true
      
      for (let i = 0; i < sentenceSlots.value.length; i++) {
        const placedWord = sentenceSlots.value[i]
        const correctWord = currentQuestion.value.words[correctOrder[i]]
        
        if (placedWord === correctWord) {
          slotStatus.value[i] = 'correct'
        } else {
          slotStatus.value[i] = 'incorrect'
          correct = false
        }
      }
      
      isComplete.value = true
      allCorrect.value = correct
      
      if (correct) {
        handleCorrectAnswer()
      } else {
        handleIncorrectAnswer()
      }
    }
    
    const handleCorrectAnswer = () => {
      completionTime.value = timer.value
      const basePoints = 100
      const timeBonus = Math.max(0, 60 - timer.value) * 2
      const hintPenalty = hintsUsed.value * 20
      
      pointsEarned.value = Math.max(basePoints + timeBonus - hintPenalty, 50)
      score.value += pointsEarned.value
      
      // Calculate stars
      if (hintsUsed.value === 0 && timer.value < 30) {
        starsEarned.value = 3
      } else if (hintsUsed.value <= 1 && timer.value < 60) {
        starsEarned.value = 2
      } else {
        starsEarned.value = 1
      }
      
      totalStars.value += starsEarned.value
      completedQuestions.value++
      
      // Award experience points
      const expFromQuestion = 10 + (starsEarned.value * 5) // Base 10 exp + star bonus
      gainExperience(expFromQuestion)
      
      successMessage.value = getSuccessMessage()
      showSuccessModal.value = true
      
      if (gameMode.value === 'challenge') {
        stopTimer()
      }
      
      // Play success sound
      playSuccessSound()
    }
    
    const handleIncorrectAnswer = () => {
      // Play error sound
      playErrorSound()
      
      // Show correct answer briefly
      setTimeout(() => {
        showHint('answer')
      }, 1000)
    }
    
    // Hint System
    const showHint = (type = 'grammar') => {
      if (type === 'answer') {
        hintType.value = 'answer'
        hintText.value = `正解: ${currentQuestion.value.words.map((_, i) => 
          currentQuestion.value.words[currentQuestion.value.correctOrder[i]]
        ).join(' ')}`
        hintIcon.value = 'fas fa-check-circle'
      } else if (hintsUsed.value < maxHints.value) {
        hintsUsed.value++
        
        switch (hintsUsed.value) {
          case 1:
            // Grammar hint
            hintType.value = 'grammar'
            hintText.value = currentQuestion.value.grammarHint
            hintIcon.value = 'fas fa-book'
            break
          case 2:
            // Structure hint
            hintType.value = 'structure'
            hintText.value = `文の構造: ${currentQuestion.value.structure}`
            hintIcon.value = 'fas fa-project-diagram'
            break
          case 3:
            // Translation hint
            showTranslation.value = true
            hintType.value = 'translation'
            hintText.value = '日本語訳が表示されました'
            hintIcon.value = 'fas fa-language'
            break
        }
      }
      
      hintVisible.value = true
      setTimeout(() => {
        hintVisible.value = false
      }, 5000)
    }
    
    // Word Type Detection
    const getWordType = (word) => {
      const wordLower = word.toLowerCase()
      
      // Subject pronouns
      if (['i', 'you', 'he', 'she', 'it', 'we', 'they'].includes(wordLower)) {
        return 'subject'
      }
      
      // Common verbs
      if (['is', 'am', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
           'will', 'would', 'can', 'could', 'may', 'might', 'shall', 'should', 'must',
           'play', 'plays', 'played', 'playing', 'go', 'goes', 'went', 'going',
           'like', 'likes', 'liked', 'liking', 'study', 'studies', 'studied', 'studying'].includes(wordLower)) {
        return 'verb'
      }
      
      // Articles
      if (['a', 'an', 'the'].includes(wordLower)) {
        return 'article'
      }
      
      // Prepositions
      if (['in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after'].includes(wordLower)) {
        return 'preposition'
      }
      
      // Question words
      if (['what', 'when', 'where', 'who', 'why', 'how', 'which'].includes(wordLower)) {
        return 'question'
      }
      
      // Default to noun
      return 'noun'
    }
    
    // Navigation
    const nextQuestion = () => {
      showSuccessModal.value = false
      currentQuestionIndex.value++
      loadQuestion()
      
      if (gameMode.value === 'challenge') {
        startTimer()
      }
    }
    
    const resetAnswer = () => {
      sentenceSlots.value = new Array(currentQuestion.value.words.length).fill(null)
      slotStatus.value = new Array(currentQuestion.value.words.length).fill(null)
      placedWords.value = []
      isComplete.value = false
      allCorrect.value = false
    }
    
    const tryAgain = () => {
      resetAnswer()
    }
    
    const completeLevel = () => {
      levelComplete.value = true
      
      // Check for unlocked planets
      const nextPlanet = PLANETS[currentLevel.value + 1]
      if (nextPlanet && totalStars.value >= nextPlanet.requiredStars) {
        unlockedPlanet.value = nextPlanet
      }
      
      // Check for achievements
      checkAchievements()
      
      // Save progress
      saveProgress()
    }
    
    const proceedToNextLevel = () => {
      currentLevel.value++
      currentQuestionIndex.value = 0
      completedQuestions.value = 0
      levelComplete.value = false
      initializeGame()
    }
    
    const replayLevel = () => {
      currentQuestionIndex.value = 0
      completedQuestions.value = 0
      levelComplete.value = false
      initializeGame()
    }
    
    const closeSuccessModal = () => {
      showSuccessModal.value = false
      nextQuestion()
    }
    
    // Achievement System
    const checkAchievements = () => {
      newAchievements.value = []
      
      // Perfect level achievement
      if (accuracy.value === 100) {
        newAchievements.value.push(ACHIEVEMENTS.perfectLevel)
      }
      
      // Speed achievement
      if (completionTime.value < 300) { // Less than 5 minutes
        newAchievements.value.push(ACHIEVEMENTS.speedMaster)
      }
      
      // No hints achievement
      if (hintsUsed.value === 0) {
        newAchievements.value.push(ACHIEVEMENTS.noHints)
      }
    }
    
    // Progress Saving
    const saveProgress = () => {
      const progress = {
        currentLevel: currentLevel.value,
        totalStars: totalStars.value,
        completedQuestions: completedQuestions.value,
        score: score.value
      }
      
      localStorage.setItem('spaceWordOrderProgress', JSON.stringify(progress))
      gameStore.updateWordOrderProgress(progress)
    }
    
    const loadProgress = () => {
      const saved = localStorage.getItem('spaceWordOrderProgress')
      if (saved) {
        const progress = JSON.parse(saved)
        currentLevel.value = progress.currentLevel || 1
        totalStars.value = progress.totalStars || 0
        score.value = progress.score || 0
      }
    }
    
    // Sound Functions
    const playSound = () => {
      if (currentQuestion.value && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(completeSentence.value || 
          currentQuestion.value.words.map((_, i) => 
            currentQuestion.value.words[currentQuestion.value.correctOrder[i]]
          ).join(' '))
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }
    
    const playSuccessSound = () => {
      // Play success sound effect
      const audio = new Audio('/sounds/success.mp3')
      audio.play().catch(() => {})
    }
    
    const playErrorSound = () => {
      // Play error sound effect
      const audio = new Audio('/sounds/error.mp3')
      audio.play().catch(() => {})
    }
    
    // Success Messages
    const getSuccessMessage = () => {
      const messages = [
        '素晴らしい！完璧な文章です！',
        'よくできました！文法マスターですね！',
        '正解！どんどん上達していますね！',
        'パーフェクト！次も頑張りましょう！',
        'お見事！英語の語順が身についてきました！'
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    }
    
    const goBack = () => {
      if (timerInterval.value) {
        stopTimer()
      }
      router.push('/platforms/grammar-galaxy')
    }
    
    // Lifecycle
    onMounted(() => {
      loadProgress()
      initializeGame()
    })
    
    onUnmounted(() => {
      if (timerInterval.value) {
        stopTimer()
      }
      saveProgress()
    })
    
    return {
      // Setup
      showSetup,
      selectedLevel,
      selectedQuestionType,
      selectedDifficulty,
      selectedGameMode,
      selectedTranslationMode,
      selectedQuestionCount,
      availableLevels,
      availableDifficulties,
      startGameWithSettings,
      
      // State
      currentLevel,
      currentSubLevel,
      currentQuestionIndex,
      score,
      gameMode,
      timer,
      formattedTime,
      levelDisplayText,
      
      // Experience
      currentExp,
      expToNext,
      expGained,
      expPercentage,
      
      // Question
      currentQuestion,
      shuffledWords,
      sentenceSlots,
      placedWords,
      slotStatus,
      draggedWord,
      isComplete,
      allCorrect,
      totalSlots,
      completeSentence,
      
      // Hints
      hintsUsed,
      maxHints,
      hintVisible,
      hintType,
      hintText,
      hintIcon,
      showTranslation,
      translationMode,
      shouldShowTranslation,
      toggleTranslation,
      
      // Progress
      completedQuestions,
      totalQuestions,
      progressPercentage,
      
      // Modals
      showSuccessModal,
      showLevelUpModal,
      levelComplete,
      starsEarned,
      successMessage,
      levelUpMessage,
      previousSubLevel,
      accuracy,
      completionTime,
      pointsEarned,
      totalStars,
      unlockedPlanet,
      newAchievements,
      
      // Methods
      handleDragStart,
      handleDragEnd,
      handleDrop,
      handleWordClick,
      removeWord,
      checkAnswer,
      showHint,
      nextQuestion,
      resetAnswer,
      tryAgain,
      proceedToNextLevel,
      replayLevel,
      closeSuccessModal,
      closeLevelUpModal,
      playSound,
      getWordType,
      goBack
    }
  }
}
</script>

<style scoped>
.space-word-order-quest {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0a0e27, #1a1f3a);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Game Setup Screen */
.game-setup-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(10, 14, 39, 0.95);
}

/* Galaxy Background Stars */
.stars-layer-1, .stars-layer-2, .stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
    radial-gradient(circle at 40% 20%, white 1px, transparent 1px),
    radial-gradient(circle at 90% 80%, white 1px, transparent 1px),
    radial-gradient(circle at 60% 90%, white 1px, transparent 1px);
  background-size: 100px 100px, 80px 80px, 120px 120px, 90px 90px;
  opacity: 0.8;
  animation: sparkle 8s ease-in-out infinite;
}

.stars-layer-2 {
  background-size: 60px 60px, 100px 100px, 80px 80px, 120px 120px;
  animation-delay: -2s;
  opacity: 0.6;
}

.stars-layer-3 {
  background-size: 140px 140px, 60px 60px, 100px 100px, 80px 80px;
  animation-delay: -4s;
  opacity: 0.4;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.3; }
}

.setup-container {
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Galaxy Card Styles */
.galaxy-card {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  padding: 1rem;
  margin-bottom: 1rem;
}

.setup-main-card {
  margin-bottom: 0;
}

/* Galaxy Text Colors */
.galaxy-text-primary {
  color: #00d4ff;
  font-weight: bold;
}

.text-galaxy-moon-silver {
  color: #cbd5e1;
}

.cosmic-glow {
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
}

/* Header Row */
.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

/* Setup Title */
.setup-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  flex: 1;
  text-align: center;
}

/* Mission Briefing */
.mission-briefing {
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
  font-size: 0.9rem;
}

/* Level Selection */
.level-section-title {
  font-size: 1rem;
  margin-bottom: 0.8rem;
  text-align: center;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 0;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 0;
}

/* Galaxy Buttons */
.galaxy-button {
  padding: 0.8rem;
  border-radius: 12px;
  border: 2px solid;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  color: white;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  text-align: center;
  min-height: 75px;
}

.galaxy-button-primary {
  border-color: #00d4ff;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.15), rgba(0, 100, 200, 0.1));
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.galaxy-button-secondary {
  border-color: rgba(0, 212, 255, 0.3);
}

.galaxy-button:hover:not(.galaxy-button-primary) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 212, 255, 0.1);
}

.level-icon, .difficulty-icon {
  font-size: 1.2rem;
}

.level-name, .difficulty-name {
  font-weight: bold;
  font-size: 0.9rem;
}

.level-desc, .difficulty-desc {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Stats Preview */
.stats-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  padding: 0.8rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
}

/* Start Button */
.start-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: 2px solid #667eea;
  min-height: auto;
}

.start-button:hover {
  background: linear-gradient(45deg, #5a67d8, #6b46c1);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
}

/* Back Button */
.back-button {
  padding: 0.8rem 1.5rem;
  min-height: auto;
}

.back-button-compact {
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.back-button-compact:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.setup-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 1.5rem;
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.setup-title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.setup-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.setup-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.setup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.setup-item-compact {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.8rem;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.setup-label-compact {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffd700;
}

.setup-select-compact {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
}

.setup-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.setup-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: #ffd700;
}

.setup-select {
  width: 100%;
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setup-select:hover, .setup-select:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
  outline: none;
}

.setup-select option {
  background: #1a1f3a;
  color: white;
}

.setup-description {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

.setup-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.start-game-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.start-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.back-setup-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.back-setup-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .setup-panel {
    padding: 2rem;
    margin: 1rem;
  }
  
  .setup-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .setup-title {
    font-size: 2rem;
  }
  
  .setup-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .start-game-btn, .back-setup-btn {
    width: 100%;
    max-width: 300px;
  }
}

/* Game Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  min-height: 60px;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.game-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.level-display, .score-display, .timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.sublevel-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
}

.experience-bar {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.exp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff8c00);
  border-radius: 4px;
  transition: width 0.8s ease;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.exp-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.game-controls {
  display: flex;
  gap: 1rem;
}

.hint-btn, .sound-btn, .translation-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.hint-btn:hover:not(:disabled), .sound-btn:hover, .translation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.translation-btn.active {
  background: linear-gradient(45deg, #10b981, #059669);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.translation-btn.active:hover {
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.4);
}

.hint-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Main Game Area */
.game-main {
  padding: 1.5rem;
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 120px);
}

/* Question Area */
.question-area {
  text-align: center;
  margin-bottom: 2rem;
}

.question-text h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.japanese-translation {
  color: #b8bedd;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(184, 190, 221, 0.1);
  border-radius: 0.8rem;
  border: 1px solid rgba(184, 190, 221, 0.3);
  backdrop-filter: blur(10px);
}

.translation-icon {
  color: #ffd700;
  font-size: 1rem;
}

/* Hint Display */
.hint-display {
  margin-top: 1rem;
  display: inline-block;
}

.hint-content {
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hint-content.grammar {
  border: 1px solid #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.hint-content.structure {
  border: 1px solid #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.hint-content.translation {
  border: 1px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.hint-content.answer {
  border: 1px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Planets Container */
.planets-container {
  margin: 3rem 0;
  min-height: 200px;
}

.orbit-field {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
  background: radial-gradient(ellipse at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 2rem;
  position: relative;
}

/* Drop Zone */
.drop-zone-container {
  margin: 2rem auto;
  max-width: 1000px;
}

.sentence-builder {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  min-height: 100px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.sentence-display {
  margin-top: 2rem;
  text-align: center;
}

.complete-sentence {
  font-size: 1.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  display: inline-block;
  transition: all 0.3s ease;
}

.complete-sentence.correct {
  background: linear-gradient(45deg, #4ade80, #22c55e);
  box-shadow: 0 0 30px rgba(74, 222, 128, 0.5);
}

.complete-sentence.incorrect {
  background: linear-gradient(45deg, #f87171, #ef4444);
  box-shadow: 0 0 30px rgba(248, 113, 113, 0.5);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.check-btn, .next-btn, .reset-btn, .retry-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.check-btn {
  background: linear-gradient(45deg, #3b82f6, #2563eb);
}

.next-btn {
  background: linear-gradient(45deg, #10b981, #059669);
}

.reset-btn, .retry-btn {
  background: linear-gradient(45deg, #f59e0b, #d97706);
}

.check-btn:hover:not(:disabled),
.next-btn:hover,
.reset-btn:hover,
.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress Bar */
.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 10;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
  border-radius: 0 2rem 2rem 0;
}

.progress-text {
  position: relative;
  z-index: 1;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* Success Modal */
.success-modal, .level-complete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.modal-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-content.galaxy-theme {
  background: linear-gradient(135deg, #1a1f3a, #0a0e27);
  border: 2px solid #667eea;
}

.success-animation {
  margin-bottom: 2rem;
}

.stars-earned {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.star-icon {
  color: #ffd700;
  margin: 0 0.2rem;
  animation: starPop 0.5s ease;
  animation-fill-mode: both;
}

.star-icon:nth-child(1) { animation-delay: 0.1s; }
.star-icon:nth-child(2) { animation-delay: 0.3s; }
.star-icon:nth-child(3) { animation-delay: 0.5s; }

@keyframes starPop {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.continue-btn, .next-level-btn, .replay-level-btn {
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;
}

.continue-btn:hover, .next-level-btn:hover, .replay-level-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Level Complete */
.complete-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #ffd700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.planet-unlock {
  margin: 2rem 0;
}

.planet-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
  animation: planetFloat 3s ease-in-out infinite;
}

@keyframes planetFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.level-stats {
  margin: 2rem 0;
}

.total-stars {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffd700;
}

.achievements {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.achievement {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* Animations */
.hint-fade-enter-active, .hint-fade-leave-active {
  transition: all 0.5s ease;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Translation Fade Animation */
.translation-fade-enter-active, .translation-fade-leave-active {
  transition: all 0.4s ease;
}

.translation-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.translation-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Level Up Modal */
.levelup-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.levelup-theme {
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.2) 0%, 
    rgba(255, 140, 0, 0.2) 50%, 
    rgba(255, 69, 0, 0.2) 100%);
  border: 2px solid #ffd700;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
  animation: levelUpPulse 2s ease-in-out infinite alternate;
}

@keyframes levelUpPulse {
  0% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  }
  100% {
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.8);
  }
}

.levelup-animation {
  text-align: center;
  margin-bottom: 2rem;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #1a1f3a;
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  animation: badgeBounce 1s ease-in-out;
}

@keyframes badgeBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.badge-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.levelup-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGlow 2s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  0% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
  100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
}

.level-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: bold;
}

.old-level, .new-level {
  padding: 0.5rem 1rem;
  border-radius: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.new-level {
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #1a1f3a;
  animation: newLevelGlow 1s ease-in-out;
}

@keyframes newLevelGlow {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.level-arrow {
  color: #ffd700;
  font-size: 1.5rem;
  animation: arrowPulse 1.5s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.levelup-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.levelup-rewards {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.reward-icon {
  color: #ffd700;
  font-size: 1.2rem;
}

.levelup-continue-btn {
  background: linear-gradient(45deg, #ffd700, #ff8c00);
  color: #1a1f3a;
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

.levelup-continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
}

/* Compact Layout Optimizations */
.game-main {
  padding: 1rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.question-area {
  margin-bottom: 1rem;
}

.question-text h2 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.planets-container {
  margin: 1rem 0;
  min-height: 150px;
}

.orbit-field {
  padding: 1rem;
  gap: 1rem;
}

.drop-zone-container {
  margin: 1rem auto;
}

.sentence-builder {
  padding: 1rem;
  min-height: 80px;
}

.action-buttons {
  margin-top: 1rem;
}

.progress-bar {
  height: 50px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .setup-container {
    width: 95%;
    padding: 0 1rem;
  }

  .setup-title {
    font-size: 1.5rem;
  }

  .level-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .difficulty-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .stats-preview {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .galaxy-button {
    min-height: 80px;
    padding: 0.8rem;
  }

  .galaxy-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .game-header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .game-info {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .game-main {
    padding: 0.5rem;
    min-height: calc(100vh - 100px);
  }

  .question-text h2 {
    font-size: 1.1rem;
  }

  .planets-container {
    margin: 0.5rem 0;
    min-height: 120px;
  }

  .orbit-field {
    padding: 0.8rem;
    gap: 0.8rem;
  }

  .sentence-builder {
    padding: 0.8rem;
    gap: 0.5rem;
    min-height: 60px;
  }

  .complete-sentence {
    font-size: 1.1rem;
    padding: 0.8rem 1.5rem;
  }

  .action-buttons {
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .check-btn, .next-btn, .reset-btn, .retry-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .progress-bar {
    height: 40px;
    padding: 0 1rem;
  }

  .modal-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 600px) {
  .game-main {
    min-height: calc(100vh - 80px);
    padding: 0.5rem;
  }

  .question-text h2 {
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }

  .planets-container {
    margin: 0.3rem 0;
    min-height: 100px;
  }

  .orbit-field {
    padding: 0.5rem;
  }

  .sentence-builder {
    padding: 0.5rem;
    min-height: 50px;
  }

  .action-buttons {
    margin-top: 0.5rem;
  }

  .progress-bar {
    height: 35px;
  }
}
</style>