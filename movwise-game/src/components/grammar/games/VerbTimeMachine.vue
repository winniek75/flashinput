<template>
  <div class="verb-runner" :class="{ 'game-active': isGameActive }">
    <!-- ゲームヘッダー -->
    <div class="game-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <ChevronLeftIcon class="h-6 w-6" />
          戻る
        </button>
        <h1 class="game-title">🎲 動詞タイムマシン</h1>
      </div>
      
      <div class="header-center">
        <div class="time-display">
          <span class="time-label">Time:</span>
          <span class="time-value">{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="energy-meter">
          <div class="energy-bar">
            <div class="energy-fill" :style="{ width: energy + '%' }" :class="{ 'low': energy < 30 }"></div>
          </div>
          <span class="energy-icon">⚡</span>
          <span class="energy-text">{{ energy }}%</span>
        </div>
        
        <div class="score-display">
          <span class="score-label">Score:</span>
          <span class="score-value">{{ score }}</span>
        </div>
      </div>
    </div>

    <!-- ゲーム状態表示 -->
    <div v-if="gamePhase === 'intro'" class="intro-screen">
      <div class="intro-content">
        <div class="runner-preview">
          <div class="runner-character">🚀</div>
          <div class="lane-preview">
            <div class="lane">⭐</div>
            <div class="lane active">🌟</div>
            <div class="lane">✨</div>
          </div>
        </div>
        
        <h2 class="intro-title">🌌 動詞タイムマシン 🌌</h2>
        <p class="intro-description">
          宇宙船を操縦して、正しい動詞の軌道を選ぼう！<br>
          <span class="controls-hint">PC: 1,2,3キー | タブレット: タップ | VR: 移動</span>
        </p>
        
        <div class="difficulty-selector">
          <h3>難易度を選択:</h3>
          <div class="difficulty-options">
            <button 
              v-for="level in availableLevels" 
              :key="level.id"
              @click="selectDifficulty(level)"
              class="difficulty-button"
              :class="[level.id, { 'selected': selectedDifficulty?.id === level.id }]"
            >
              <div class="difficulty-icon">{{ level.icon }}</div>
              <div class="difficulty-name">{{ level.name }}</div>
              <div class="difficulty-desc">{{ level.description }}</div>
            </button>
          </div>
        </div>
        
        <button @click="startGame" class="start-button" :disabled="!selectedDifficulty">
          <span class="start-icon">🚀</span>
          時間旅行を開始
        </button>
      </div>
    </div>

    <!-- メインゲーム画面 -->
    <div v-if="gamePhase === 'playing'" class="game-screen">
      <!-- 課題表示エリア -->
      <div class="challenge-area">
        <div class="challenge-word" :class="{ 'slide-in': newChallenge }">
          <span class="challenge-label">🎯</span>
          <span class="challenge-text">{{ currentVerb?.infinitive }}</span>
        </div>
        
        <!-- 初級の時制指示 -->
        <div v-if="selectedDifficulty?.id === 'beginner' && tenseInstruction" class="tense-instruction">
          <p class="instruction-text">{{ tenseInstruction }}</p>
        </div>
        
        <!-- 中級・上級の文章表示 -->
        <div v-if="selectedDifficulty?.id !== 'beginner' && contextSentence" class="context-area">
          <p class="context-sentence">{{ contextSentence }}</p>
        </div>
      </div>

      <!-- ランナーゲームエリア -->
      <div class="runner-area">
        <!-- レーン -->
        <div class="lanes-container">
          <div 
            v-for="(option, index) in currentOptions" 
            :key="option.id"
            class="lane"
            :class="{ 
              'active': currentLane === index,
              'correct': showResult && option.correct,
              'incorrect': showResult && selectedAnswer === option.id && !option.correct
            }"
            @click.stop="selectLane(index)"
          >
            <!-- PC用番号表示 -->
            <div class="lane-number">{{ index + 1 }}</div>
            
            <!-- 選択肢 -->
            <div class="lane-content">
              <div class="verb-choice">{{ option.text }}</div>
            </div>
            
            <!-- 宇宙船 -->
            <div v-if="currentLane === index" class="runner" :class="{ 'running': !showResult }">
              <span class="runner-sprite">🚀</span>
            </div>
            
            <!-- 地面 -->
            <div class="ground"></div>
            
            <!-- アイテム/障害物 -->
            <div class="lane-items">
              <span v-if="option.correct && !showResult" class="item coin">⭐</span>
              <span v-else-if="!option.correct && !showResult" class="item obstacle">🔥</span>
            </div>
          </div>
        </div>
        
        <!-- 選択時間表示 -->
        <div class="selection-timer" v-if="!showResult">
          <div class="timer-bar">
            <div 
              class="timer-fill" 
              :style="{ width: (selectionTimeRemaining / maxSelectionTime) * 100 + '%' }"
              :class="{ 'warning': selectionTimeRemaining < 2 }"
            ></div>
          </div>
        </div>
      </div>

      <!-- ゲーム統計 -->
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-icon">🔥</span>
          <span class="stat-label">連続</span>
          <span class="stat-value">{{ currentStreak }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <span class="stat-label">正答率</span>
          <span class="stat-value">{{ accuracy }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-label">レベル</span>
          <span class="stat-value">{{ currentLevel }}</span>
        </div>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-if="gamePhase === 'results'" class="results-screen">
      <div class="results-content">
        <div class="results-header">
          <h2 class="results-title">🎉 Time Travel 完了！</h2>
          <StarRating 
            :stars="starsEarned" 
            :max-stars="3" 
            size="large" 
            :show-sparkle="true"
          />
        </div>
        
        <div class="results-stats">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-title">最終スコア</div>
              <div class="stat-number">{{ score }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-title">正答率</div>
              <div class="stat-number">{{ accuracy }}%</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-info">
              <div class="stat-title">最大連続</div>
              <div class="stat-number">{{ maxStreak }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <div class="stat-title">平均時間</div>
              <div class="stat-number">{{ averageReactionTime }}ms</div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="playAgain" class="action-button primary">
            🔄 もう一度プレイ
          </button>
          <button @click="goBack" class="action-button secondary">
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- エフェクト表示 -->
    <div class="effects-container">
      <!-- 正解エフェクト -->
      <div v-if="showSuccess" class="success-effect">
        <div class="success-text">Great!</div>
        <div class="success-particles">
          <div v-for="i in 6" :key="i" class="particle">✨</div>
        </div>
      </div>
      
      <!-- 不正解エフェクト -->
      <div v-if="showError" class="error-effect">
        <div class="error-text">Try Again!</div>
        <div class="error-shake"></div>
      </div>
      
      <!-- コンボエフェクト -->
      <div v-if="showCombo" class="combo-effect">
        <div class="combo-text">{{ comboCount }} Combo!</div>
        <div class="combo-burst"></div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import GameTimer from '@/components/shared/GameTimer.vue'
import StarRating from '@/components/shared/StarRating.vue'
import { useGrammarGame } from '@/composables/useGrammarGame'
import { useProgressTracking } from '@/composables/useProgressTracking'
import { irregularVerbDatabase, verbChallenges, spaceshipEnergy } from '@/data/verbConjugations'
import { grammarLevels } from '@/data/grammarLevels'

export default {
  name: 'VerbRunner',
  components: {
    ChevronLeftIcon,
    GameTimer,
    StarRating
  },
  setup() {
    const router = useRouter()
    
    // Composables
    const {
      isGameActive,
      gamePhase,
      score,
      totalQuestions,
      correctAnswers,
      currentStreak,
      maxStreak,
      timeRemaining,
      currentLevel,
      energy,
      showSuccess,
      showError,
      showCombo,
      comboCount,
      accuracy,
      averageReactionTime,
      starsEarned,
      startGame: startGameCore,
      endGame,
      submitAnswer,
      playSound,
      prepareNextQuestion
    } = useGrammarGame({
      defaultTime: 120,
      defaultEnergy: 100,
      baseScore: 100
    })
    
    const { updateGameProgress } = useProgressTracking()
    
    // ゲーム状態
    const selectedDifficulty = ref(null)
    const currentQuestion = ref(0)
    const currentVerb = ref(null)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const currentLane = ref(1) // 中央レーンから開始
    const newChallenge = ref(false)
    const selectionTimeRemaining = ref(5)
    const maxSelectionTime = ref(5)
    const selectionTimerId = ref(null)
    const targetTense = ref('') // 目標時制
    const tenseInstruction = ref('') // 時制の指示
    const usedVerbs = ref(new Set()) // 使用済み動詞を追跡
    const shuffledVerbs = ref([]) // シャッフルされた動詞リスト
    
    // 難易度設定
    const availableLevels = computed(() => [
      {
        id: 'beginner',
        name: '初級',
        description: '現在形と過去形のシンプル選択',
        icon: '🌟',
        verbs: irregularVerbDatabase.beginner.slice(0, 10),
        timeLimit: 180,
        questions: 15,
        selectionTime: 5,
        tenses: ['present', 'past']
      },
      {
        id: 'intermediate',
        name: '中級',
        description: '文章から正しい形を選択',
        icon: '⭐',
        verbs: [...irregularVerbDatabase.beginner, ...irregularVerbDatabase.intermediate],
        timeLimit: 150,
        questions: 20,
        selectionTime: 4,
        tenses: ['present', 'past'],
        useContext: true
      },
      {
        id: 'advanced',
        name: '上級',
        description: '現在・過去・過去分詞の完全マスター',
        icon: '🌟',
        verbs: Object.values(irregularVerbDatabase).flat(),
        timeLimit: 120,
        questions: 25,
        selectionTime: 3,
        tenses: ['present', 'past', 'perfect'],
        useContext: true
      }
    ])
    
    // 現在の選択肢
    const currentOptions = ref([])
    
    // コンテキスト文（中級・上級用）
    const contextSentence = ref('')
    
    // 文脈テンプレート
    const contextTemplates = {
      present: [
        'I _____ every day.',
        'She _____ to school.',
        'They _____ in the morning.',
        'We always _____ together.'
      ],
      past: [
        'Yesterday, I _____ home.',
        'Last week, she _____ a book.',
        'They _____ to the park.',
        'We _____ all night.'
      ],
      perfect: [
        'I have _____ this before.',
        'She has never _____ that.',
        'They have _____ many times.',
        'We have just _____.'
      ]
    }
    
    // 難易度選択
    const selectDifficulty = (level) => {
      selectedDifficulty.value = level
      logger.log('Selected difficulty:', level.name)
    }
    
    // ゲーム開始
    const startGame = () => {
      if (!selectedDifficulty.value) return
      
      startGameCore({
        timeLimit: selectedDifficulty.value.timeLimit,
        energy: spaceshipEnergy.maxEnergy
      })
      
      // ゲーム設定（resetScore後に設定）
      totalQuestions.value = selectedDifficulty.value.questions
      maxSelectionTime.value = selectedDifficulty.value.selectionTime
      
      // 動詞リストを初期化（重複防止のため）
      initializeVerbList()
      
      // キーボードイベントリスナー追加
      document.addEventListener('keydown', handleKeyPress)
      
      // 最初の問題を準備
      generateQuestion()
    }
    
    // 問題生成
    const generateQuestion = () => {
      logger.log('📝 Generating question:', currentQuestion.value, '/', totalQuestions.value)
      
      if (currentQuestion.value >= totalQuestions.value) {
        logger.log('🏁 All questions completed, ending game')
        endGame('completed')
        return
      }
      
      // 重複しない動詞を選択
      currentVerb.value = selectNextVerb()
      logger.log('🎯 Selected verb:', currentVerb.value?.infinitive)
      
      // ターゲット時制を選択
      const availableTenses = selectedDifficulty.value.tenses
      targetTense.value = availableTenses[Math.floor(Math.random() * availableTenses.length)]
      
      // 時制の指示を設定（初級のみ）
      if (selectedDifficulty.value.id === 'beginner') {
        const tenseInstructions = {
          'present': '現在形はどれ？',
          'past': '過去形はどれ？',
          'perfect': '過去分詞はどれ？'
        }
        tenseInstruction.value = tenseInstructions[targetTense.value]
      } else {
        tenseInstruction.value = ''
      }
      
      // 文脈を生成（中級・上級のみ）
      if (selectedDifficulty.value.useContext) {
        const templates = contextTemplates[targetTense.value]
        contextSentence.value = templates[Math.floor(Math.random() * templates.length)]
      } else {
        contextSentence.value = ''
      }
      
      // 選択肢を生成
      generateOptions(targetTense.value)
      
      // 状態リセット
      selectedAnswer.value = null
      showResult.value = false
      currentLane.value = 1 // 中央レーンに戻す
      selectionTimeRemaining.value = maxSelectionTime.value
      
      // 新しい問題アニメーション
      newChallenge.value = true
      setTimeout(() => { newChallenge.value = false }, 500)
      
      // 選択タイマー開始
      startSelectionTimer()
      
      // 次の問題の準備
      prepareNextQuestion()
    }
    
    // 選択タイマー管理
    const startSelectionTimer = () => {
      if (selectionTimerId.value) clearInterval(selectionTimerId.value)
      
      selectionTimerId.value = setInterval(() => {
        if (selectionTimeRemaining.value > 0) {
          selectionTimeRemaining.value--
        } else {
          // 時間切れの場合、不正解扱い
          handleTimeout()
        }
      }, 1000)
    }
    
    const stopSelectionTimer = () => {
      if (selectionTimerId.value) {
        clearInterval(selectionTimerId.value)
        selectionTimerId.value = null
      }
    }
    
    // 選択肢生成
    const generateOptions = (targetTense) => {
      const verb = currentVerb.value
      const correctAnswer = getCorrectForm(verb, targetTense)
      
      // 正解を含む3つの選択肢を生成（レーン数に合わせて）
      const options = [
        {
          id: 1,
          text: correctAnswer,
          tense: targetTense,
          correct: true
        }
      ]
      
      // 間違いの選択肢を生成
      const wrongOptions = generateWrongOptions(verb, targetTense, 2)
      wrongOptions.forEach((option, index) => {
        options.push({
          id: index + 2,
          text: option.text,
          tense: option.tense,
          correct: false
        })
      })
      
      // シャッフル
      currentOptions.value = shuffleArray(options).slice(0, 3) // 3レーン分
    }
    
    // 間違い選択肢を生成
    const generateWrongOptions = (verb, targetTense, count) => {
      const options = []
      const availableTenses = selectedDifficulty.value.tenses.filter(t => t !== targetTense)
      
      // 他の時制から選択肢を作成
      availableTenses.forEach(tense => {
        if (options.length < count) {
          options.push({
            text: getCorrectForm(verb, tense),
            tense: tense
          })
        }
      })
      
      // 足りない場合は間違った活用を追加
      while (options.length < count) {
        options.push({
          text: generateWrongForm(verb, targetTense),
          tense: 'incorrect'
        })
      }
      
      return options
    }
    
    // 正しい活用形を取得
    const getCorrectForm = (verb, tense) => {
      switch (tense) {
        case 'present':
          return verb.present.split('/')[0] // 'play/plays' -> 'play'
        case 'past':
          return verb.past
        case 'perfect':
          return 'have ' + verb.pastParticiple
        default:
          return verb.infinitive
      }
    }
    
    // 間違った活用形を生成
    const generateWrongForm = (verb, tense) => {
      const variations = [
        verb.infinitive + 'ed', // 規則活用の間違い
        verb.infinitive + 's',  // 現在形3人称の間違い
        verb.past + 'ed',       // 重複活用の間違い
        'have ' + verb.past     // 完了形の間違い
      ]
      
      return variations[Math.floor(Math.random() * variations.length)]
    }
    
    // 配列をシャッフル
    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    
    // 動詞リストを初期化（重複なしランダム選択のため）
    const initializeVerbList = () => {
      const verbs = selectedDifficulty.value.verbs
      shuffledVerbs.value = shuffleArray(verbs)
      usedVerbs.value.clear()
      logger.log('🔄 Verb list initialized with', shuffledVerbs.value.length, 'verbs')
    }
    
    // 重複しない動詞を選択
    const selectNextVerb = () => {
      const availableVerbs = shuffledVerbs.value.filter(verb => 
        !usedVerbs.value.has(verb.infinitive)
      )
      
      // すべての動詞を使い切った場合、リセット（但し直前の動詞は除外）
      if (availableVerbs.length === 0) {
        const lastVerb = currentVerb.value?.infinitive
        usedVerbs.value.clear()
        const freshVerbs = shuffledVerbs.value.filter(verb => 
          verb.infinitive !== lastVerb
        )
        if (freshVerbs.length > 0) {
          const selectedVerb = freshVerbs[0]
          usedVerbs.value.add(selectedVerb.infinitive)
          return selectedVerb
        }
        // フォールバック：ランダム選択
        return shuffledVerbs.value[Math.floor(Math.random() * shuffledVerbs.value.length)]
      }
      
      // 利用可能な動詞からランダムに選択
      const selectedVerb = availableVerbs[Math.floor(Math.random() * availableVerbs.length)]
      usedVerbs.value.add(selectedVerb.infinitive)
      return selectedVerb
    }
    
    // レーンを選択
    const selectLane = (laneIndex) => {
      if (showResult.value || !isGameActive.value) return
      
      logger.log('🎯 Selected lane:', laneIndex, 'Option:', currentOptions.value[laneIndex])
      
      currentLane.value = laneIndex
      
      // 選択したらすぐに答えを確定
      confirmAnswer()
    }
    
    // 答えを確定
    const confirmAnswer = () => {
      if (showResult.value) return
      
      const option = currentOptions.value[currentLane.value]
      if (!option) return
      
      selectedAnswer.value = option.id
      showResult.value = true
      stopSelectionTimer()
      
      // 答えを判定
      const isCorrect = option.correct
      
      // エネルギー更新
      if (isCorrect) {
        energy.value = Math.min(100, energy.value + spaceshipEnergy.restoration.correctAnswer)
      } else {
        energy.value = Math.max(0, energy.value - spaceshipEnergy.consumption.wrongAnswer)
      }
      
      // 答えを提出
      submitAnswer(isCorrect, {
        verb: currentVerb.value.infinitive,
        selectedOption: option.text,
        correctOption: currentOptions.value.find(o => o.correct)?.text,
        responseTime: maxSelectionTime.value - selectionTimeRemaining.value
      })
      
      // エネルギー切れチェック
      if (energy.value <= 0) {
        endGame('energyDepleted')
        return
      }
      
      // 次の問題へ
      setTimeout(() => {
        currentQuestion.value++
        generateQuestion()
      }, 1500)
    }
    
    // タイムアウト処理
    const handleTimeout = () => {
      stopSelectionTimer()
      
      // ランダムに不正解レーンを選択
      const incorrectLanes = currentOptions.value
        .map((option, index) => ({ option, index }))
        .filter(item => !item.option.correct)
      
      if (incorrectLanes.length > 0) {
        const randomIncorrect = incorrectLanes[Math.floor(Math.random() * incorrectLanes.length)]
        currentLane.value = randomIncorrect.index
      }
      
      confirmAnswer()
    }
    
    // キーボード入力処理
    const handleKeyPress = (event) => {
      if (!isGameActive.value || showResult.value) return
      
      switch(event.key) {
        case '1':
        case 'ArrowLeft':
          selectLane(0)
          break
        case '2':
        case 'ArrowUp':
          selectLane(1)
          break
        case '3':
        case 'ArrowRight':
          selectLane(2)
          break
      }
    }
    
    // 時間切れ処理
    const handleTimeUp = () => {
      endGame('timeout')
    }
    
    // もう一度プレイ
    const playAgain = () => {
      // 状態リセット
      currentQuestion.value = 0
      currentVerb.value = null
      selectedAnswer.value = null
      showResult.value = false
      currentLane.value = 1
      contextSentence.value = ''
      
      // 動詞リストもリセット
      usedVerbs.value.clear()
      shuffledVerbs.value = []
      
      gamePhase.value = 'intro'
    }
    
    // 時間をフォーマット
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    
    // 戻る
    const goBack = () => {
      router.push('/platforms/grammar-galaxy')
    }
    
    // 初期化
    onMounted(() => {
      logger.log('🏃 VerbRunner mounted')
    })
    
    // クリーンアップ
    onUnmounted(() => {
      stopSelectionTimer()
      document.removeEventListener('keydown', handleKeyPress)
    })
    
    return {
      // State
      gamePhase,
      selectedDifficulty,
      currentQuestion,
      totalQuestions,
      currentVerb,
      selectedAnswer,
      showResult,
      currentLane,
      newChallenge,
      selectionTimeRemaining,
      maxSelectionTime,
      availableLevels,
      currentOptions,
      contextSentence,
      tenseInstruction,
      
      // Game state
      isGameActive,
      score,
      currentStreak,
      maxStreak,
      timeRemaining,
      currentLevel,
      energy,
      accuracy,
      averageReactionTime,
      starsEarned,
      
      // Effects
      showSuccess,
      showError,
      showCombo,
      comboCount,
      
      // Methods
      selectDifficulty,
      startGame,
      selectLane,
      handleTimeUp,
      playAgain,
      goBack,
      playSound,
      formatTime
    }
  }
}
</script>

<style scoped>
.verb-runner {
  @apply min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden;
}

/* 宇宙背景エフェクト */
.verb-runner::before {
  content: '';
  @apply absolute inset-0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 20%, white, transparent),
    radial-gradient(2px 2px at 10% 80%, white, transparent);
  background-size: 200px 200px;
  animation: starsMove 100s linear infinite;
}

/* 流れ星エフェクト */
.verb-runner::after {
  content: '';
  @apply absolute top-0 left-0 w-32 h-1;
  background: linear-gradient(to right, transparent, white, transparent);
  animation: shootingStar 4s ease-in-out infinite;
  opacity: 0;
}

@keyframes starsMove {
  from { transform: translateY(0); }
  to { transform: translateY(200px); }
}

@keyframes shootingStar {
  0% { transform: translateX(-100px) translateY(100px) rotate(-45deg); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateX(calc(100vw + 100px)) translateY(300px) rotate(-45deg); opacity: 0; }
}

/* ヘッダー */
.game-header {
  @apply relative z-10 flex items-center justify-between p-4 bg-black bg-opacity-40 backdrop-blur-md border-b border-purple-500;
}

.header-left {
  @apply flex items-center gap-4;
}

.back-button {
  @apply flex items-center gap-2 px-3 py-2 bg-purple-900 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200 text-purple-200 border border-purple-500;
}

.game-title {
  @apply text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400;
}

.header-center {
  @apply flex items-center;
}

.time-display {
  @apply bg-purple-900 bg-opacity-50 px-4 py-2 rounded-full border-2 border-cyan-400 shadow-neon;
}

.time-label {
  @apply text-cyan-300 text-sm mr-2;
}

.time-value {
  @apply text-xl font-bold text-cyan-400;
}

/* ネオン効果 */
.shadow-neon {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3);
}

.header-right {
  @apply flex items-center gap-4;
}

.energy-meter {
  @apply flex items-center gap-2 bg-black bg-opacity-40 px-3 py-2 rounded-lg border border-cyan-400;
}

.energy-bar {
  @apply w-24 h-4 bg-gray-800 rounded-full overflow-hidden border border-cyan-600;
}

.energy-fill {
  @apply h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500;
  box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.5);
}

.energy-fill.low {
  @apply bg-gradient-to-r from-red-500 to-orange-500;
  box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.5);
}

.energy-icon {
  @apply text-lg text-cyan-400;
}

.energy-text {
  @apply text-cyan-300 text-sm font-semibold;
}

.score-display {
  @apply bg-purple-900 bg-opacity-50 px-4 py-2 rounded-lg border border-purple-400;
}

.score-label {
  @apply text-purple-300 mr-2;
}

.score-value {
  @apply text-xl font-bold text-yellow-400;
}

/* イントロ画面 */
.intro-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.intro-content {
  @apply max-w-2xl text-center bg-black bg-opacity-60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-500;
}

.runner-preview {
  @apply relative mb-8;
}

.runner-character {
  @apply text-6xl mb-4 inline-block;
  animation: bounce 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.5));
}

.lane-preview {
  @apply flex justify-center gap-4 mb-4;
}

.lane-preview .lane {
  @apply text-3xl p-4 bg-purple-900 bg-opacity-50 rounded-lg transition-all duration-300 border border-purple-600;
}

.lane-preview .lane.active {
  @apply bg-cyan-900 bg-opacity-60 transform scale-110 border-cyan-400;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.intro-title {
  @apply text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400;
}

.intro-description {
  @apply text-lg text-gray-300 mb-8 leading-relaxed;
}

.controls-hint {
  @apply text-sm text-cyan-400 font-semibold;
}

.difficulty-selector h3 {
  @apply text-xl font-semibold mb-4 text-white;
}

.difficulty-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-8;
}

.difficulty-button {
  @apply p-6 rounded-xl border-2 border-purple-600 bg-black bg-opacity-40 hover:border-cyan-400 transition-all duration-300 cursor-pointer backdrop-blur-sm;
}

.difficulty-button:hover {
  @apply transform scale-105;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.difficulty-button.selected {
  @apply transform scale-105 border-cyan-400 bg-cyan-900 bg-opacity-50;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.difficulty-button.beginner:hover { @apply border-green-400 bg-green-900 bg-opacity-30; }
.difficulty-button.intermediate:hover { @apply border-yellow-400 bg-yellow-900 bg-opacity-30; }
.difficulty-button.advanced:hover { @apply border-red-400 bg-red-900 bg-opacity-30; }

.difficulty-button.beginner.selected { 
  @apply border-green-400 bg-green-900 bg-opacity-50;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
}
.difficulty-button.intermediate.selected { 
  @apply border-yellow-400 bg-yellow-900 bg-opacity-50;
  box-shadow: 0 0 30px rgba(255, 255, 0, 0.5);
}
.difficulty-button.advanced.selected { 
  @apply border-red-400 bg-red-900 bg-opacity-50;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
}

.difficulty-icon {
  @apply text-3xl mb-2;
}

.difficulty-name {
  @apply text-lg font-semibold mb-1 text-white;
}

.difficulty-desc {
  @apply text-sm text-gray-400;
}

.start-button {
  @apply px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-lg text-white hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(139, 92, 246, 0.3);
}

.start-icon {
  @apply mr-2;
}

/* ゲーム画面 */
.game-screen {
  @apply relative z-10 px-4 py-6 flex flex-col h-screen;
}

/* 課題表示エリア */
.challenge-area {
  @apply bg-black bg-opacity-60 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-4 text-center border border-purple-500;
}

.challenge-word {
  @apply flex items-center justify-center gap-4;
}

.challenge-word.slide-in {
  animation: slideInTop 0.5s ease-out;
}

.challenge-label {
  @apply text-3xl;
}

.challenge-text {
  @apply text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.context-area {
  @apply mt-4;
}

.context-sentence {
  @apply text-xl text-cyan-300 italic;
}

.tense-instruction {
  @apply mt-4;
}

.instruction-text {
  @apply text-2xl font-bold text-yellow-400;
  text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
}

/* ランナーゲームエリア */
.runner-area {
  @apply flex-1 bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl shadow-lg p-4 relative overflow-hidden border border-purple-500;
}

.lanes-container {
  @apply flex h-full;
}

.lane {
  @apply flex-1 relative border-x-2 border-purple-600 cursor-pointer transition-all duration-300;
  background: linear-gradient(to bottom, 
    rgba(139, 92, 246, 0.1) 0%, 
    rgba(59, 130, 246, 0.05) 50%, 
    rgba(147, 51, 234, 0.2) 100%);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.lane:hover {
  @apply bg-cyan-900 bg-opacity-20;
  box-shadow: inset 0 0 30px rgba(0, 255, 255, 0.2);
}

.lane.active {
  @apply bg-cyan-900 bg-opacity-30;
  box-shadow: inset 0 0 40px rgba(0, 255, 255, 0.3);
}

.lane.correct {
  @apply bg-green-900 bg-opacity-40;
  box-shadow: inset 0 0 40px rgba(0, 255, 0, 0.4);
}

.lane.incorrect {
  @apply bg-red-900 bg-opacity-40;
  box-shadow: inset 0 0 40px rgba(255, 0, 0, 0.4);
}

.lane-number {
  @apply absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-cyan-400 bg-black bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center border border-cyan-400;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.lane-content {
  @apply absolute top-1/3 left-0 right-0 text-center;
}

.verb-choice {
  @apply text-2xl font-bold text-white px-4 py-2 bg-purple-900 bg-opacity-70 rounded-lg shadow-md inline-block border border-purple-400;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
}

.runner {
  @apply absolute bottom-20 left-1/2 transform -translate-x-1/2 text-4xl;
  filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6));
}

.runner.running {
  animation: shipFloat 2s ease-in-out infinite;
}

.runner-sprite {
  @apply inline-block;
}

@keyframes shipFloat {
  0%, 100% { transform: translateY(0) translateX(-50%) rotate(-5deg); }
  50% { transform: translateY(-10px) translateX(-50%) rotate(5deg); }
}

.ground {
  @apply absolute bottom-0 left-0 right-0 h-16;
  background: linear-gradient(to top, 
    rgba(147, 51, 234, 0.4) 0%, 
    rgba(139, 92, 246, 0.2) 50%, 
    transparent 100%);
  box-shadow: 0 -10px 30px rgba(147, 51, 234, 0.3);
}

.lane-items {
  @apply absolute bottom-24 left-1/2 transform -translate-x-1/2;
}

.item {
  @apply text-2xl inline-block;
}

.item.coin {
  animation: sparkle 1s ease-in-out infinite;
}

.item.obstacle {
  animation: burn 0.5s ease-in-out infinite alternate;
}

.selection-timer {
  @apply absolute bottom-4 left-4 right-4;
}

.timer-bar {
  @apply h-2 bg-gray-800 rounded-full overflow-hidden border border-purple-600;
}

.timer-fill {
  @apply h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-linear;
  box-shadow: inset 0 0 5px rgba(0, 255, 255, 0.5);
}

.timer-fill.warning {
  @apply bg-gradient-to-r from-red-500 to-orange-500;
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 統計 */
.game-stats {
  @apply flex justify-center gap-8 mt-4;
}

.stat-item {
  @apply bg-black bg-opacity-40 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md flex items-center gap-2 border border-purple-500;
}

.stat-icon {
  @apply text-xl;
}

.stat-label {
  @apply text-sm text-purple-300;
}

.stat-value {
  @apply text-lg font-bold text-cyan-400;
}

/* 結果画面 */
.results-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.results-content {
  @apply max-w-4xl text-center bg-black bg-opacity-60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-purple-500;
}

.results-title {
  @apply text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400;
}

.results-stats {
  @apply grid grid-cols-2 md:grid-cols-4 gap-6 my-8;
}

.stat-card {
  @apply bg-purple-900 bg-opacity-40 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-600;
}

.stat-icon {
  @apply text-3xl mb-2;
}

.stat-title {
  @apply text-sm text-purple-300 mb-1;
}

.stat-number {
  @apply text-2xl font-bold text-cyan-400;
}

.results-actions {
  @apply flex justify-center gap-4;
}

.action-button {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-white;
}

.action-button.primary {
  @apply bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400;
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

.success-text,
.error-text,
.combo-text {
  @apply text-4xl font-bold mb-4;
}

.success-text {
  @apply text-green-400;
  animation: successPulse 1s ease-out;
}

.error-text {
  @apply text-red-400;
  animation: errorShake 0.5s ease-out;
}

.combo-text {
  @apply text-yellow-400;
  animation: comboBounce 1s ease-out;
}

.success-particles .particle {
  @apply absolute text-2xl;
  animation: particleExplode 1s ease-out forwards;
}

.success-particles .particle:nth-child(1) { animation-delay: 0s; }
.success-particles .particle:nth-child(2) { animation-delay: 0.1s; }
.success-particles .particle:nth-child(3) { animation-delay: 0.2s; }
.success-particles .particle:nth-child(4) { animation-delay: 0.3s; }
.success-particles .particle:nth-child(5) { animation-delay: 0.4s; }
.success-particles .particle:nth-child(6) { animation-delay: 0.5s; }

/* アニメーション */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes slideInTop {
  from { 
    transform: translateY(-50px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}


@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

@keyframes burn {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

@keyframes successPulse {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

@keyframes errorShake {
  0%, 100% { transform: translate(-50%, -50%) translateX(0); }
  25% { transform: translate(-50%, -50%) translateX(-10px); }
  75% { transform: translate(-50%, -50%) translateX(10px); }
}

@keyframes comboBounce {
  0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
  40% { transform: translate(-50%, -50%) translateY(-30px); }
  60% { transform: translate(-50%, -50%) translateY(-15px); }
}

@keyframes particleExplode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(1);
    opacity: 0;
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .game-header {
    @apply flex-wrap gap-2 p-2;
  }
  
  .header-center {
    @apply order-3 w-full justify-center;
  }
  
  .lane-number {
    @apply hidden;
  }
  
  .challenge-text {
    @apply text-3xl;
  }
  
  .verb-choice {
    @apply text-lg;
  }
  
  .runner {
    @apply text-3xl bottom-16;
  }
  
  .results-stats {
    @apply grid-cols-2;
  }
  
  .difficulty-options {
    @apply grid-cols-1;
  }
  
  .stat-item {
    @apply px-2 text-sm;
  }
}</style>