<template>
  <div class="question-word-detective" :class="{ 'detective-mode': gamePhase === 'playing' }">
    <!-- ゲームヘッダー -->
    <div class="game-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <ChevronLeftIcon class="h-6 w-6" />
          戻る
        </button>
        <h1 class="game-title">🔍 Question Word Detective</h1>
      </div>
      
      <div class="header-right">
        <div class="combo-meter">
          <div class="combo-display">
            <span class="combo-label">Combo</span>
            <span class="combo-count">{{ currentStreak }}</span>
          </div>
          <div class="combo-bar">
            <div class="combo-fill" :style="{ width: Math.min(currentStreak * 10, 100) + '%' }"></div>
          </div>
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
        <div class="detective-visual">
          <div class="detective-icon">🕵️‍♂️</div>
          <div class="magnifying-glass">🔍</div>
          <div class="question-marks">
            <span v-for="i in 6" :key="i" class="question-mark" :style="getQuestionMarkStyle(i)">❓</span>
          </div>
        </div>
        
        <h2 class="intro-title">Question Word Detective へようこそ！</h2>
        <p class="intro-description">
          写真を見て瞬時に正しい疑問詞を選ぼう！<br>
          What, Who, When, Where, Why, How を使い分けて探偵スキルを磨こう。
        </p>
        
        <div class="detective-badges">
          <h3>探偵バッジを集めよう:</h3>
          <div class="badge-grid">
            <div v-for="badge in detectiveBadges" :key="badge.id" class="badge-item" :class="{ earned: badge.earned }">
              <div class="badge-icon">{{ badge.icon }}</div>
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-requirement">{{ badge.requirement }}</div>
            </div>
          </div>
        </div>
        
        <div class="game-modes">
          <h3>モードを選択:</h3>
          <div class="mode-options">
            <button 
              v-for="mode in gameModes" 
              :key="mode.id"
              @click="selectMode(mode)"
              class="mode-button"
              :class="[mode.id, { selected: selectedMode?.id === mode.id }]"
            >
              <div class="mode-icon">{{ mode.icon }}</div>
              <div class="mode-name">{{ mode.name }}</div>
              <div class="mode-description">{{ mode.description }}</div>
              <div class="mode-stats">
                <span>{{ mode.timeLimit }}秒 / {{ mode.questions }}問</span>
              </div>
            </button>
          </div>
        </div>
        
        <button @click="startGame" class="start-button" :disabled="!selectedMode">
          <span class="start-icon">🔍</span>
          捜査開始
        </button>
      </div>
    </div>

    <!-- メインゲーム画面 -->
    <div v-if="gamePhase === 'playing'" class="game-screen">
      <!-- 捜査ステータス -->
      <div class="investigation-status">
        <div class="case-number">
          <span class="case-label">Case #{{ currentQuestion + 1 }}</span>
          <span class="total-cases">/ {{ totalQuestions }}</span>
        </div>
        
        <GameTimer 
          :initial-time="questionTimeLimit"
          :auto-start="true"
          :count-down="true"
          size="small"
          theme="neon"
          @complete="handleQuestionTimeout"
          @critical="playSound('urgentBeep')"
        />
        
        <div class="reaction-display">
          <span class="reaction-label">反応時間:</span>
          <span class="reaction-time">{{ currentReactionTime }}ms</span>
        </div>
      </div>

      <!-- 証拠写真エリア -->
      <div class="evidence-area">
        <div class="photo-container" :class="{ 'flashing': showPhoto, 'analyzing': isAnalyzing }">
          <div v-if="!showPhoto" class="waiting-screen">
            <div class="waiting-icon">📷</div>
            <div class="waiting-text">証拠写真を準備中...</div>
            <div class="countdown">{{ photoCountdown }}</div>
          </div>
          
          <div v-if="showPhoto" class="evidence-photo">
            <div class="photo-frame">
              <div class="photo-image">
                <!-- 実際の実装では画像ファイルを使用 -->
                <div class="placeholder-image" :style="{ backgroundColor: currentEvidence?.color }">
                  <div class="placeholder-icon">{{ currentEvidence?.icon }}</div>
                  <div class="placeholder-label">{{ currentEvidence?.label }}</div>
                </div>
              </div>
              <div class="photo-flash" v-if="photoFlash"></div>
            </div>
            
            <div class="evidence-info">
              <div class="evidence-label">Evidence #{{ currentQuestion + 1 }}</div>
              <div class="evidence-hint" v-if="showHint">{{ currentEvidence?.hint }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 疑問詞選択パネル -->
      <div class="question-word-panel">
        <h3 class="panel-title">適切な疑問詞を選択してください</h3>
        <div class="question-words-grid">
          <button 
            v-for="questionWord in questionWords" 
            :key="questionWord.id"
            @click="selectQuestionWord(questionWord)"
            class="question-word-button"
            :class="[
              questionWord.id,
              { 
                'selected': selectedQuestionWord === questionWord.id,
                'correct': showResult && questionWord.id === currentEvidence?.correctAnswer,
                'incorrect': showResult && selectedQuestionWord === questionWord.id && questionWord.id !== currentEvidence?.correctAnswer,
                'disabled': !showPhoto || showResult
              }
            ]"
            :disabled="!showPhoto || showResult"
          >
            <div class="word-main">{{ questionWord.word }}</div>
            <div class="word-meaning">{{ questionWord.meaning }}</div>
            <div class="word-example">{{ questionWord.example }}</div>
          </button>
        </div>
      </div>

      <!-- プログレスバー -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: ((currentQuestion + 1) / totalQuestions) * 100 + '%' }"></div>
        </div>
        <div class="progress-text">{{ currentQuestion + 1 }} / {{ totalQuestions }}</div>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-if="gamePhase === 'results'" class="results-screen">
      <div class="results-content">
        <div class="detective-rank">
          <div class="rank-badge">
            <div class="rank-icon">{{ finalRank.icon }}</div>
            <div class="rank-title">{{ finalRank.title }}</div>
            <div class="rank-description">{{ finalRank.description }}</div>
          </div>
          
          <StarRating 
            :stars="starsEarned" 
            :max-stars="3" 
            size="large" 
            :show-sparkle="true"
            color="#FFD700"
          />
        </div>
        
        <div class="case-summary">
          <h3>捜査結果サマリー</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-icon">🎯</div>
              <div class="summary-label">正答率</div>
              <div class="summary-value">{{ accuracy }}%</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">⚡</div>
              <div class="summary-label">平均反応時間</div>
              <div class="summary-value">{{ averageReactionTime }}ms</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">🔥</div>
              <div class="summary-label">最高連続</div>
              <div class="summary-value">{{ maxStreak }}</div>
            </div>
            
            <div class="summary-item">
              <div class="summary-icon">💎</div>
              <div class="summary-label">獲得スコア</div>
              <div class="summary-value">{{ score }}</div>
            </div>
          </div>
        </div>
        
        <div class="skill-analysis">
          <h3>スキル分析</h3>
          <div class="skill-bars">
            <div v-for="skill in skillAnalysis" :key="skill.name" class="skill-bar">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-progress">
                <div class="skill-fill" :style="{ width: skill.score + '%', backgroundColor: skill.color }"></div>
              </div>
              <div class="skill-score">{{ skill.score }}%</div>
            </div>
          </div>
        </div>
        
        <div class="results-actions">
          <button @click="playAgain" class="action-button primary">
            🔍 もう一度捜査
          </button>
          <button @click="goBack" class="action-button secondary">
            🏠 ホームに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- エフェクトレイヤー -->
    <div class="effects-container">
      <!-- 正解エフェクト -->
      <div v-if="showSuccess" class="success-effect">
        <div class="success-text">Excellent!</div>
        <div class="success-badge">🕵️‍♂️</div>
        <div class="success-particles">
          <div v-for="i in 8" :key="i" class="particle">⭐</div>
        </div>
      </div>
      
      <!-- 不正解エフェクト -->
      <div v-if="showError" class="error-effect">
        <div class="error-text">Keep Investigating!</div>
        <div class="error-hint">正解: {{ currentEvidence?.correctAnswerText }}</div>
      </div>
      
      <!-- コンボエフェクト -->
      <div v-if="showCombo" class="combo-effect">
        <div class="combo-title">Detective Combo!</div>
        <div class="combo-number">{{ comboCount }}</div>
        <div class="combo-multiplier">×{{ Math.floor(comboCount / 5) + 1 }} Multiplier</div>
      </div>
      
      <!-- 写真フラッシュエフェクト -->
      <div v-if="photoFlash" class="flash-effect"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import GameTimer from '@/components/shared/GameTimer.vue'
import StarRating from '@/components/shared/StarRating.vue'
import { useGrammarGame } from '@/composables/useGrammarGame'
import { useProgressTracking } from '@/composables/useProgressTracking'
import { grammarLevels } from '@/data/grammarLevels'

export default {
  name: 'QuestionWordDetective',
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
      playSound
    } = useGrammarGame({
      defaultTime: 3,
      baseScore: 100
    })
    
    const { updateGameProgress } = useProgressTracking()
    
    // ゲーム状態
    const selectedMode = ref(null)
    const currentQuestion = ref(0)
    const currentEvidence = ref(null)
    const selectedQuestionWord = ref(null)
    const showResult = ref(false)
    const showPhoto = ref(false)
    const photoCountdown = ref(3)
    const questionTimeLimit = ref(3)
    const currentReactionTime = ref(0)
    const questionStartTime = ref(null)
    const isAnalyzing = ref(false)
    const showHint = ref(false)
    const photoFlash = ref(false)
    
    // ゲームモード
    const gameModes = ref([
      {
        id: 'rookie',
        name: 'Rookie Detective',
        description: 'What と Who の基本捜査',
        icon: '🔰',
        timeLimit: 4,
        questions: 10,
        questionWords: ['what', 'who'],
        difficulty: 'easy'
      },
      {
        id: 'detective',
        name: 'Detective',
        description: '5つの疑問詞を使った標準捜査',
        icon: '🕵️',
        timeLimit: 3,
        questions: 15,
        questionWords: ['what', 'who', 'where', 'when', 'why'],
        difficulty: 'medium'
      },
      {
        id: 'inspector',
        name: 'Inspector',
        description: '全疑問詞での高速捜査',
        icon: '👮',
        timeLimit: 2,
        questions: 20,
        questionWords: ['what', 'who', 'where', 'when', 'why', 'how'],
        difficulty: 'hard'
      }
    ])
    
    // 疑問詞データ
    const questionWords = ref([
      {
        id: 'what',
        word: 'What',
        meaning: '何',
        example: 'What is this?',
        color: '#3B82F6'
      },
      {
        id: 'who',
        word: 'Who',
        meaning: '誰',
        example: 'Who is he?',
        color: '#10B981'
      },
      {
        id: 'where',
        word: 'Where',
        meaning: 'どこ',
        example: 'Where are you?',
        color: '#F59E0B'
      },
      {
        id: 'when',
        word: 'When',
        meaning: 'いつ',
        example: 'When did you go?',
        color: '#8B5CF6'
      },
      {
        id: 'why',
        word: 'Why',
        meaning: 'なぜ',
        example: 'Why are you late?',
        color: '#EF4444'
      },
      {
        id: 'how',
        word: 'How',
        meaning: 'どのように',
        example: 'How do you do?',
        color: '#EC4899'
      }
    ])
    
    // 証拠データ（写真の代わり）
    const evidenceDatabase = ref([
      // What items
      { id: 1, type: 'what', icon: '🍎', label: 'Apple', color: '#EF4444', hint: '食べ物について', correctAnswer: 'what', correctAnswerText: 'What is this?' },
      { id: 2, type: 'what', icon: '📚', label: 'Book', color: '#3B82F6', hint: '物について', correctAnswer: 'what', correctAnswerText: 'What are you reading?' },
      { id: 3, type: 'what', icon: '🚗', label: 'Car', color: '#6B7280', hint: '乗り物について', correctAnswer: 'what', correctAnswerText: 'What is that?' },
      { id: 4, type: 'what', icon: '🎵', label: 'Music', color: '#8B5CF6', hint: '聞くものについて', correctAnswer: 'what', correctAnswerText: 'What music do you like?' },
      
      // Who items
      { id: 5, type: 'who', icon: '👨‍🏫', label: 'Teacher', color: '#10B981', hint: '職業の人について', correctAnswer: 'who', correctAnswerText: 'Who is your teacher?' },
      { id: 6, type: 'who', icon: '👨‍⚕️', label: 'Doctor', color: '#EF4444', hint: '病院の人について', correctAnswer: 'who', correctAnswerText: 'Who helps sick people?' },
      { id: 7, type: 'who', icon: '👮‍♂️', label: 'Police', color: '#3B82F6', hint: '安全を守る人について', correctAnswer: 'who', correctAnswerText: 'Who keeps us safe?' },
      { id: 8, type: 'who', icon: '👨‍🍳', label: 'Chef', color: '#F59E0B', hint: '料理を作る人について', correctAnswer: 'who', correctAnswerText: 'Who cooks food?' },
      
      // Where items
      { id: 9, type: 'where', icon: '🏫', label: 'School', color: '#8B5CF6', hint: '勉強する場所について', correctAnswer: 'where', correctAnswerText: 'Where do you study?' },
      { id: 10, type: 'where', icon: '🏥', label: 'Hospital', color: '#EF4444', hint: '治療を受ける場所について', correctAnswer: 'where', correctAnswerText: 'Where do you go when sick?' },
      { id: 11, type: 'where', icon: '🏪', label: 'Store', color: '#10B981', hint: '買い物をする場所について', correctAnswer: 'where', correctAnswerText: 'Where do you shop?' },
      { id: 12, type: 'where', icon: '🏠', label: 'Home', color: '#F59E0B', hint: '住む場所について', correctAnswer: 'where', correctAnswerText: 'Where do you live?' },
      
      // When items
      { id: 13, type: 'when', icon: '🌅', label: 'Morning', color: '#F59E0B', hint: '時間について', correctAnswer: 'when', correctAnswerText: 'When do you wake up?' },
      { id: 14, type: 'when', icon: '🎂', label: 'Birthday', color: '#EC4899', hint: '特別な日について', correctAnswer: 'when', correctAnswerText: 'When is your birthday?' },
      { id: 15, type: 'when', icon: '📅', label: 'Weekend', color: '#8B5CF6', hint: '休みの日について', correctAnswer: 'when', correctAnswerText: 'When do you relax?' },
      
      // Why items
      { id: 16, type: 'why', icon: '😢', label: 'Crying', color: '#3B82F6', hint: '感情の理由について', correctAnswer: 'why', correctAnswerText: 'Why are you sad?' },
      { id: 17, type: 'why', icon: '🏃‍♂️', label: 'Running', color: '#10B981', hint: '行動の理由について', correctAnswer: 'why', correctAnswerText: 'Why are you running?' },
      { id: 18, type: 'why', icon: '📚', label: 'Studying', color: '#8B5CF6', hint: '勉強する理由について', correctAnswer: 'why', correctAnswerText: 'Why do you study?' },
      
      // How items
      { id: 19, type: 'how', icon: '🚶‍♂️', label: 'Walking', color: '#6B7280', hint: '方法について', correctAnswer: 'how', correctAnswerText: 'How do you go to school?' },
      { id: 20, type: 'how', icon: '🍳', label: 'Cooking', color: '#F59E0B', hint: '料理の方法について', correctAnswer: 'how', correctAnswerText: 'How do you cook?' },
      { id: 21, type: 'how', icon: '🎯', label: 'Target', color: '#EF4444', hint: '方法について', correctAnswer: 'how', correctAnswerText: 'How do you aim?' }
    ])
    
    // 探偵バッジ
    const detectiveBadges = ref([
      { id: 1, name: 'Quick Eye', icon: '👁️', requirement: '2秒以内で正解', earned: false },
      { id: 2, name: 'Perfect Case', icon: '🎯', requirement: '100%正答率', earned: false },
      { id: 3, name: 'Speed Detective', icon: '⚡', requirement: '5連続正解', earned: false },
      { id: 4, name: 'Master Inspector', icon: '🏆', requirement: '全モードクリア', earned: false }
    ])
    
    // 計算プロパティ
    const finalRank = computed(() => {
      const acc = accuracy.value
      const avgTime = averageReactionTime.value
      
      if (acc >= 95 && avgTime < 1500) {
        return { icon: '🏆', title: 'Master Detective', description: '完璧な捜査能力' }
      } else if (acc >= 85 && avgTime < 2000) {
        return { icon: '🥇', title: 'Expert Inspector', description: '優秀な判断力' }
      } else if (acc >= 70 && avgTime < 2500) {
        return { icon: '🥈', title: 'Skilled Detective', description: '良好な観察力' }
      } else if (acc >= 50) {
        return { icon: '🥉', title: 'Junior Detective', description: '基本的な推理力' }
      } else {
        return { icon: '🔰', title: 'Rookie Investigator', description: '練習が必要' }
      }
    })
    
    const skillAnalysis = computed(() => {
      const results = []
      const modeQuestionWords = selectedMode.value?.questionWords || []
      
      modeQuestionWords.forEach(wordType => {
        const word = questionWords.value.find(q => q.id === wordType)
        if (word) {
          // 簡単なスキル分析（実際の実装ではより詳細な分析）
          const score = Math.max(50, accuracy.value + Math.random() * 20 - 10)
          results.push({
            name: word.word,
            score: Math.round(score),
            color: word.color
          })
        }
      })
      
      return results
    })
    
    // 疑問符スタイル
    const getQuestionMarkStyle = (index) => {
      const angle = (index - 1) * 60
      const radius = 100
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.2}s`
      }
    }
    
    // モード選択
    const selectMode = (mode) => {
      selectedMode.value = mode
      questionTimeLimit.value = mode.timeLimit
      totalQuestions.value = mode.questions
    }
    
    // ゲーム開始
    const startGame = () => {
      if (!selectedMode.value) return
      
      startGameCore({
        timeLimit: selectedMode.value.timeLimit * selectedMode.value.questions
      })
      
      generateQuestion()
    }
    
    // 問題生成
    const generateQuestion = async () => {
      if (currentQuestion.value >= totalQuestions.value) {
        endGame('completed')
        return
      }
      
      // 状態リセット
      showPhoto.value = false
      selectedQuestionWord.value = null
      showResult.value = false
      showHint.value = false
      isAnalyzing.value = false
      
      // カウントダウン
      await startPhotoCountdown()
      
      // 証拠を選択
      const availableEvidence = evidenceDatabase.value.filter(e => 
        selectedMode.value.questionWords.includes(e.type)
      )
      
      currentEvidence.value = availableEvidence[Math.floor(Math.random() * availableEvidence.length)]
      
      // 写真表示
      showPhotoWithFlash()
    }
    
    // 写真カウントダウン
    const startPhotoCountdown = () => {
      return new Promise(resolve => {
        photoCountdown.value = 3
        const interval = setInterval(() => {
          photoCountdown.value--
          if (photoCountdown.value <= 0) {
            clearInterval(interval)
            resolve()
          }
        }, 1000)
      })
    }
    
    // 写真表示（フラッシュ効果付き）
    const showPhotoWithFlash = () => {
      photoFlash.value = true
      playSound('cameraFlash')
      
      setTimeout(() => {
        photoFlash.value = false
        showPhoto.value = true
        questionStartTime.value = Date.now()
        
        // ヒント表示タイマー
        setTimeout(() => {
          if (!showResult.value) {
            showHint.value = true
          }
        }, 2000)
      }, 200)
    }
    
    // 疑問詞選択
    const selectQuestionWord = (questionWord) => {
      if (!showPhoto.value || showResult.value) return
      
      selectedQuestionWord.value = questionWord.id
      currentReactionTime.value = Date.now() - questionStartTime.value
      showResult.value = true
      isAnalyzing.value = true
      
      const isCorrect = questionWord.id === currentEvidence.value.correctAnswer
      
      // totalQuestionsを手動で増加
      totalQuestions.value++
      
      // 答えを提出
      submitAnswer(isCorrect, {
        questionWord: questionWord.word,
        evidence: currentEvidence.value.label,
        reactionTime: currentReactionTime.value
      })
      
      // 次の問題へ
      setTimeout(() => {
        currentQuestion.value++
        generateQuestion()
      }, 2000)
    }
    
    // 質問タイムアウト
    const handleQuestionTimeout = () => {
      if (!showResult.value) {
        // totalQuestionsを手動で増加
        totalQuestions.value++
        
        submitAnswer(false, {
          evidence: currentEvidence.value?.label,
          reason: 'timeout'
        })
        
        setTimeout(() => {
          currentQuestion.value++
          generateQuestion()
        }, 1000)
      }
    }
    
    // もう一度プレイ
    const playAgain = () => {
      currentQuestion.value = 0
      currentEvidence.value = null
      selectedQuestionWord.value = null
      showResult.value = false
      showPhoto.value = false
      
      gamePhase.value = 'intro'
    }
    
    // 戻る
    const goBack = () => {
      router.push('/grammar-galaxy')
    }
    
    return {
      // State
      gamePhase,
      selectedMode,
      currentQuestion,
      totalQuestions,
      currentEvidence,
      selectedQuestionWord,
      showResult,
      showPhoto,
      photoCountdown,
      questionTimeLimit,
      currentReactionTime,
      isAnalyzing,
      showHint,
      photoFlash,
      gameModes,
      questionWords,
      detectiveBadges,
      
      // Game state
      score,
      currentStreak,
      maxStreak,
      accuracy,
      averageReactionTime,
      starsEarned,
      
      // Effects
      showSuccess,
      showError,
      showCombo,
      comboCount,
      
      // Computed
      finalRank,
      skillAnalysis,
      
      // Methods
      getQuestionMarkStyle,
      selectMode,
      startGame,
      selectQuestionWord,
      handleQuestionTimeout,
      playAgain,
      goBack,
      playSound
    }
  }
}
</script>

<style scoped>
.question-word-detective {
  @apply min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden;
}

/* 探偵モード時の背景エフェクト */
.detective-mode::before {
  content: '';
  @apply absolute inset-0 opacity-10;
  background: 
    radial-gradient(circle at 20% 20%, #00ff88 0%, transparent 25%),
    radial-gradient(circle at 80% 60%, #0088ff 0%, transparent 25%),
    radial-gradient(circle at 40% 80%, #ff0088 0%, transparent 25%);
  animation: detectiveAmbient 15s ease-in-out infinite alternate;
}

@keyframes detectiveAmbient {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-10px, -10px) rotate(2deg); }
}

/* ヘッダー */
.game-header {
  @apply relative z-10 flex items-center justify-between p-6 bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-20;
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

.combo-meter {
  @apply flex flex-col items-center gap-1;
}

.combo-display {
  @apply flex items-center gap-2 text-white;
}

.combo-label {
  @apply text-sm text-gray-300;
}

.combo-count {
  @apply text-xl font-bold text-yellow-400;
}

.combo-bar {
  @apply w-20 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.combo-fill {
  @apply h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300;
}

.score-display {
  @apply text-white;
}

.score-label {
  @apply text-gray-300 mr-2;
}

.score-value {
  @apply text-xl font-bold text-cyan-400;
}

/* イントロ画面 */
.intro-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.intro-content {
  @apply max-w-4xl text-center text-white;
}

.detective-visual {
  @apply relative mb-8 h-64;
}

.detective-icon {
  @apply text-8xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
  animation: detectiveFloat 3s ease-in-out infinite;
}

.magnifying-glass {
  @apply text-6xl absolute top-1/4 right-1/4;
  animation: magnifyingSway 2s ease-in-out infinite alternate;
}

.question-marks {
  @apply absolute inset-0;
}

.question-mark {
  @apply absolute text-3xl opacity-70;
  animation: questionFloat 4s ease-in-out infinite;
}

.intro-title {
  @apply text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent;
}

.intro-description {
  @apply text-lg text-gray-300 mb-8 leading-relaxed;
}

/* 探偵バッジ */
.detective-badges h3 {
  @apply text-xl font-semibold mb-4;
}

.badge-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-8;
}

.badge-item {
  @apply p-4 rounded-lg bg-white bg-opacity-10 text-center transition-all duration-300;
}

.badge-item.earned {
  @apply bg-yellow-400 bg-opacity-20 border-2 border-yellow-400;
}

.badge-icon {
  @apply text-2xl mb-1;
}

.badge-name {
  @apply font-semibold text-sm mb-1;
}

.badge-requirement {
  @apply text-xs text-gray-400;
}

/* ゲームモード */
.game-modes h3 {
  @apply text-xl font-semibold mb-4;
}

.mode-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mb-8;
}

.mode-button {
  @apply p-6 rounded-xl border-2 border-transparent bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 text-center cursor-pointer;
}

.mode-button:hover,
.mode-button.selected {
  @apply border-blue-400 transform scale-105;
}

.mode-button.rookie { @apply hover:border-green-400; }
.mode-button.detective { @apply hover:border-blue-400; }
.mode-button.inspector { @apply hover:border-purple-400; }

.mode-icon {
  @apply text-3xl mb-2;
}

.mode-name {
  @apply text-lg font-semibold mb-1;
}

.mode-description {
  @apply text-sm text-gray-300 mb-2;
}

.mode-stats {
  @apply text-xs text-cyan-400;
}

.start-button {
  @apply px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-lg hover:from-blue-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed;
}

/* ゲーム画面 */
.game-screen {
  @apply relative z-10 p-6 space-y-6;
}

.investigation-status {
  @apply flex items-center justify-between bg-black bg-opacity-30 backdrop-blur-md rounded-xl p-4;
}

.case-number {
  @apply text-white;
}

.case-label {
  @apply text-lg font-bold text-cyan-400;
}

.total-cases {
  @apply text-gray-300;
}

.reaction-display {
  @apply text-white text-right;
}

.reaction-label {
  @apply text-sm text-gray-300 block;
}

.reaction-time {
  @apply text-lg font-bold text-yellow-400;
}

/* 証拠エリア */
.evidence-area {
  @apply flex justify-center;
}

.photo-container {
  @apply relative w-80 h-80 rounded-xl overflow-hidden border-4 border-gray-600 bg-black;
  transition: all 0.3s ease;
}

.photo-container.flashing {
  @apply border-blue-400;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
}

.photo-container.analyzing {
  animation: analyzeGlow 2s ease-in-out infinite alternate;
}

.waiting-screen {
  @apply flex flex-col items-center justify-center h-full text-white;
}

.waiting-icon {
  @apply text-6xl mb-4;
}

.waiting-text {
  @apply text-lg mb-4;
}

.countdown {
  @apply text-4xl font-bold text-cyan-400;
}

.evidence-photo {
  @apply relative h-full;
}

.photo-frame {
  @apply relative h-5/6;
}

.photo-image {
  @apply w-full h-full flex items-center justify-center;
}

.placeholder-image {
  @apply w-full h-full flex flex-col items-center justify-center text-white relative;
}

.placeholder-icon {
  @apply text-8xl mb-4;
}

.placeholder-label {
  @apply text-2xl font-bold;
}

.photo-flash {
  @apply absolute inset-0 bg-white opacity-80;
  animation: flashFade 0.2s ease-out;
}

.evidence-info {
  @apply h-1/6 p-2 bg-black bg-opacity-50 text-white text-center;
}

.evidence-label {
  @apply font-semibold;
}

.evidence-hint {
  @apply text-sm text-yellow-400;
}

/* 疑問詞パネル */
.question-word-panel {
  @apply bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6;
}

.panel-title {
  @apply text-white text-center text-lg font-semibold mb-4;
}

.question-words-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.question-word-button {
  @apply p-4 rounded-lg border-2 border-transparent bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 text-white cursor-pointer text-center;
}

.question-word-button:not(.disabled):hover {
  @apply border-cyan-400 transform scale-105;
}

.question-word-button.selected {
  @apply border-cyan-400 bg-opacity-30;
}

.question-word-button.correct {
  @apply border-green-400 bg-green-400 bg-opacity-30;
}

.question-word-button.incorrect {
  @apply border-red-400 bg-red-400 bg-opacity-30;
}

.question-word-button.disabled {
  @apply opacity-50 cursor-not-allowed;
}

.word-main {
  @apply text-2xl font-bold mb-1;
}

.word-meaning {
  @apply text-sm text-gray-300 mb-1;
}

.word-example {
  @apply text-xs italic text-gray-400;
}

/* プログレス */
.progress-section {
  @apply text-center;
}

.progress-bar {
  @apply w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500;
}

.progress-text {
  @apply text-white font-semibold;
}

/* 結果画面 */
.results-screen {
  @apply relative z-10 flex items-center justify-center min-h-screen p-8;
}

.results-content {
  @apply max-w-4xl text-center text-white;
}

.detective-rank {
  @apply mb-8;
}

.rank-badge {
  @apply mb-6;
}

.rank-icon {
  @apply text-8xl mb-4;
}

.rank-title {
  @apply text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent;
}

.rank-description {
  @apply text-lg text-gray-300;
}

.case-summary h3 {
  @apply text-2xl font-bold mb-4;
}

.summary-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4 mb-8;
}

.summary-item {
  @apply bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 text-center;
}

.summary-icon {
  @apply text-3xl mb-2;
}

.summary-label {
  @apply text-sm text-gray-300 mb-1;
}

.summary-value {
  @apply text-2xl font-bold text-cyan-400;
}

.skill-analysis h3 {
  @apply text-2xl font-bold mb-4;
}

.skill-bars {
  @apply space-y-3 mb-8;
}

.skill-bar {
  @apply flex items-center gap-4;
}

.skill-name {
  @apply w-16 text-sm font-semibold;
}

.skill-progress {
  @apply flex-1 h-4 bg-gray-700 rounded-full overflow-hidden;
}

.skill-fill {
  @apply h-full transition-all duration-1000;
}

.skill-score {
  @apply w-12 text-sm font-bold text-right;
}

.results-actions {
  @apply flex justify-center gap-4;
}

.action-button {
  @apply px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105;
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

.success-text {
  @apply text-4xl font-bold text-green-400 mb-2;
  animation: successPop 1s ease-out;
}

.success-badge {
  @apply text-6xl mb-4;
  animation: badgeSpin 1s ease-out;
}

.error-text {
  @apply text-3xl font-bold text-red-400 mb-2;
  animation: errorShake 0.5s ease-out;
}

.error-hint {
  @apply text-lg text-yellow-400;
  animation: hintFade 1s ease-out 0.5s both;
}

.combo-effect {
  animation: comboExplosion 1.5s ease-out;
}

.combo-title {
  @apply text-3xl font-bold text-yellow-400;
}

.combo-number {
  @apply text-6xl font-bold text-orange-400;
}

.combo-multiplier {
  @apply text-lg text-purple-400;
}

.flash-effect {
  @apply fixed inset-0 bg-white pointer-events-none;
  animation: screenFlash 0.3s ease-out;
}

.success-particles .particle {
  @apply absolute text-2xl;
  animation: particleBurst 1s ease-out forwards;
}

/* アニメーション */
@keyframes detectiveFloat {
  0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
  50% { transform: translate(-50%, -50%) translateY(-15px); }
}

@keyframes magnifyingSway {
  0% { transform: rotate(-5deg); }
  100% { transform: rotate(5deg); }
}

@keyframes questionFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes analyzeGlow {
  0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  100% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
}

@keyframes flashFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes successPop {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes badgeSpin {
  0% { transform: rotate(0deg) scale(0); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}

@keyframes errorShake {
  0%, 100% { transform: translate(-50%, -50%) translateX(0); }
  25% { transform: translate(-50%, -50%) translateX(-10px); }
  75% { transform: translate(-50%, -50%) translateX(10px); }
}

@keyframes hintFade {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes comboExplosion {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}

@keyframes screenFlash {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes particleBurst {
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
    @apply flex-col gap-4;
  }
  
  .investigation-status {
    @apply flex-col gap-4;
  }
  
  .photo-container {
    @apply w-64 h-64;
  }
  
  .question-words-grid {
    @apply grid-cols-2;
  }
  
  .summary-grid {
    @apply grid-cols-2;
  }
  
  .badge-grid {
    @apply grid-cols-2;
  }
  
  .mode-options {
    @apply grid-cols-1;
  }
}</style>