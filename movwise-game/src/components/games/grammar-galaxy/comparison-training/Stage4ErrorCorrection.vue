<template>
  <div class="error-correction-stage">
    <div class="question-header">
      <h3 class="question-title">エラー矯正モード</h3>
      <p class="question-instruction">よくある間違いを見つけて正しい形に修正してください</p>
    </div>

    <!-- Error Sentence Display -->
    <div class="error-display">
      <div class="error-header">
        <div class="error-icon">🔍</div>
        <div class="error-title">間違いを見つけよう</div>
      </div>
      
      <div class="sentence-container">
        <div class="incorrect-sentence">
          <div class="sentence-label">❌ 間違った文</div>
          <div class="sentence-text error">
            {{ currentError.incorrectSentence }}
          </div>
          <div class="error-highlight" v-if="showResult">
            間違い: <span class="highlight-error">{{ currentError.errorPart }}</span>
          </div>
        </div>
        
        <div class="correction-arrow" v-if="showResult">
          <div class="arrow-icon">⬇️</div>
          <div class="correction-label">修正</div>
        </div>
        
        <div class="correct-sentence" v-if="showResult">
          <div class="sentence-label">✅ 正しい文</div>
          <div class="sentence-text correct">
            {{ currentError.correctSentence }}
          </div>
        </div>
      </div>
    </div>

    <!-- Error Type Explanation -->
    <div class="error-type-display" v-if="!showResult">
      <div class="error-type-header">
        <div class="type-icon">{{ currentError.typeIcon }}</div>
        <div class="type-name">{{ currentError.typeName }}</div>
      </div>
      <div class="error-description">
        {{ currentError.description }}
      </div>
    </div>

    <!-- Answer Options -->
    <div class="correction-options">
      <div class="options-title">正しい修正方法を選んでください：</div>
      <div class="options-grid">
        <button
          v-for="option in currentOptions"
          :key="option.id"
          class="correction-btn"
          :class="{
            'selected': selectedAnswer === option.id,
            'correct': showResult && option.isCorrect,
            'incorrect': showResult && selectedAnswer === option.id && !option.isCorrect,
            'show-correct': showResult && option.isCorrect && selectedAnswer !== option.id
          }"
          @click="selectCorrection(option.id)"
          :disabled="showResult"
        >
          <div class="option-sentence">{{ option.correctedSentence }}</div>
          <div class="option-explanation">{{ option.explanation }}</div>
          
          <!-- Correct answer indicator -->
          <div class="correct-indicator" v-if="showResult && option.isCorrect">
            <div class="indicator-icon">✨</div>
            <div class="indicator-text">正解！</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Error Pattern Analysis -->
    <div class="pattern-analysis" v-if="showResult">
      <div class="analysis-header">
        <div class="analysis-icon">📋</div>
        <div class="analysis-title">エラーパターン分析</div>
      </div>
      
      <div class="analysis-content">
        <div class="pattern-item">
          <span class="pattern-label">エラータイプ:</span>
          <span class="pattern-value">{{ currentError.errorType }}</span>
        </div>
        <div class="pattern-item">
          <span class="pattern-label">よくある原因:</span>
          <span class="pattern-value">{{ currentError.commonCause }}</span>
        </div>
        <div class="pattern-item">
          <span class="pattern-label">覚え方:</span>
          <span class="pattern-value">{{ currentError.memoryTip }}</span>
        </div>
      </div>

      <!-- Related Error Prevention -->
      <div class="prevention-tips">
        <div class="tips-header">🛡️ 同じ間違いを防ぐには</div>
        <div class="tips-list">
          <div 
            v-for="(tip, index) in currentError.preventionTips"
            :key="index"
            class="tip-item"
          >
            <span class="tip-number">{{ index + 1 }}.</span>
            <span class="tip-text">{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback Display -->
    <div class="feedback-display" v-if="showResult">
      <div class="feedback-content" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
        <div class="feedback-icon">{{ isCorrect ? '🎯' : '💡' }}</div>
        <div class="feedback-text">
          <div class="feedback-title">
            {{ isCorrect ? 'エクセレント！' : '学習のチャンス' }}
          </div>
          <div class="feedback-explanation">
            {{ getFeedbackExplanation() }}
          </div>
        </div>
      </div>
      <!-- Next Question Button -->
      <div class="next-button-container">
        <button 
          class="next-question-btn"
          :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }"
          @click="proceedToNext"
        >
          {{ isCorrect ? '理解できました！次へ' : '次の問題へ進む' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'Stage4ErrorCorrection',
  props: {
    question: {
      type: Object,
      required: true
    },
    showResult: {
      type: Boolean,
      default: false
    },
    selectedAnswer: {
      type: [String, Number],
      default: null
    },
    stage: {
      type: Number,
      default: 4
    }
  },
  emits: ['answer-selected', 'next-question'],
  setup(props, { emit }) {
    const currentError = ref(null)
    const currentOptions = ref([])
    const isCorrect = ref(false)

    // Common comparison errors database
    const comparisonErrors = [
      {
        id: 'double_comparative',
        typeIcon: '⚠️',
        typeName: '二重比較級エラー',
        errorType: '二重比較級（Double Comparative）',
        description: 'moreと-erを同時に使ってしまう間違い',
        incorrectSentence: 'This book is more bigger than that one.',
        correctSentence: 'This book is bigger than that one.',
        errorPart: 'more bigger',
        correctPart: 'bigger',
        commonCause: '比較級の作り方を混同してしまう',
        memoryTip: '1つの形容詞には1つの比較方法だけ',
        preventionTips: [
          '短い形容詞(-er)か長い形容詞(more)かを確認',
          'moreを使ったら-erは付けない',
          '音読して違和感がないかチェック'
        ]
      },
      {
        id: 'double_superlative',
        typeIcon: '👑',
        typeName: '二重最上級エラー',
        errorType: '二重最上級（Double Superlative）',
        description: 'mostと-estを同時に使ってしまう間違い',
        incorrectSentence: 'She is the most smartest student in the class.',
        correctSentence: 'She is the smartest student in the class.',
        errorPart: 'most smartest',
        correctPart: 'smartest',
        commonCause: '最上級の作り方を混同してしまう',
        memoryTip: '1つの形容詞には1つの最上級方法だけ',
        preventionTips: [
          '短い形容詞(-est)か長い形容詞(most)かを確認',
          'mostを使ったら-estは付けない',
          'theを忘れずに付ける'
        ]
      },
      {
        id: 'irregular_comparative_error',
        typeIcon: '🔄',
        typeName: '不規則変化エラー',
        errorType: '不規則変化の間違い',
        description: '不規則変化する形容詞を規則変化させてしまう間違い',
        incorrectSentence: 'Today\'s weather is gooder than yesterday.',
        correctSentence: 'Today\'s weather is better than yesterday.',
        errorPart: 'gooder',
        correctPart: 'better',
        commonCause: '不規則変化を忘れて規則変化を適用',
        memoryTip: 'good → better → bestは特別な形',
        preventionTips: [
          '主要な不規則変化を暗記する',
          'good, bad, many, much, far, littleは要注意',
          '繰り返し練習で記憶を定着させる'
        ]
      },
      {
        id: 'missing_the_superlative',
        typeIcon: '📍',
        typeName: 'the欠落エラー',
        errorType: '最上級のthe欠落',
        description: '最上級でtheを付け忘れる間違い',
        incorrectSentence: 'Mount Everest is highest mountain in the world.',
        correctSentence: 'Mount Everest is the highest mountain in the world.',
        errorPart: 'highest mountain',
        correctPart: 'the highest mountain',
        commonCause: '最上級にはtheが必要ということを忘れる',
        memoryTip: '最上級 = the + 形容詞est/most + 形容詞',
        preventionTips: [
          '最上級を見たら必ずtheを確認',
          'the + 最上級で1つのセットと覚える',
          '世界で一つだけ→theが必要と考える'
        ]
      },
      {
        id: 'wrong_than_as',
        typeIcon: '⚖️',
        typeName: 'than/as混同エラー',
        errorType: 'thanとasの混同',
        description: 'as...asの構文でthanを使ってしまう間違い',
        incorrectSentence: 'She is as tall than her sister.',
        correctSentence: 'She is as tall as her sister.',
        errorPart: 'as tall than',
        correctPart: 'as tall as',
        commonCause: '比較構文を混同してしまう',
        memoryTip: 'as...asは同じasを2回使う',
        preventionTips: [
          'as...asは「同じくらい」の意味',
          '比較級にはthan、as...asには2つのas',
          'asとthanの使い分けを意識する'
        ]
      },
      {
        id: 'comparative_with_the',
        typeIcon: '🚫',
        typeName: 'the誤用エラー',
        errorType: '比較級でのthe誤用',
        description: '比較級にtheを付けてしまう間違い',
        incorrectSentence: 'This car is the faster than that one.',
        correctSentence: 'This car is faster than that one.',
        errorPart: 'the faster',
        correctPart: 'faster',
        commonCause: '比較級と最上級のルールを混同',
        memoryTip: 'theは最上級だけ、比較級にはtheを付けない',
        preventionTips: [
          '比較級(than)にはtheは不要',
          '最上級にだけtheを付ける',
          'than が見えたらtheを削除'
        ]
      },
      {
        id: 'farther_further_confusion',
        typeIcon: '🛣️',
        typeName: 'farther/further混同',
        errorType: 'farther/furtherの混同',
        description: 'fartherとfurtherの使い分けができていない',
        incorrectSentence: 'I need further information about the distance.',
        correctSentence: 'I need more information about the distance.',
        errorPart: 'further information about the distance',
        correctPart: 'more information about the distance',
        commonCause: 'farther（距離）とfurther（程度）を混同',
        memoryTip: 'farther=距離、further=程度・追加',
        preventionTips: [
          'farther = 物理的な距離',
          'further = 抽象的な程度や追加',
          '距離なら farther、それ以外は further'
        ]
      },
      {
        id: 'less_fewer_confusion',
        typeIcon: '📊',
        typeName: 'less/fewer混同',
        errorType: 'lessとfewerの混同',
        description: '可算・不可算名詞でless/fewerを間違える',
        incorrectSentence: 'There are less students in this class.',
        correctSentence: 'There are fewer students in this class.',
        errorPart: 'less students',
        correctPart: 'fewer students',
        commonCause: '可算名詞にlessを使ってしまう',
        memoryTip: 'fewer=可算名詞、less=不可算名詞',
        preventionTips: [
          '数えられるもの → fewer',
          '数えられないもの → less',
          'studentsは数えられる → fewer'
        ]
      }
    ]

    const generateQuestion = () => {
      // Select random error
      const error = comparisonErrors[Math.floor(Math.random() * comparisonErrors.length)]
      currentError.value = error

      // Generate correction options
      generateCorrectionOptions(error)
    }

    const generateCorrectionOptions = (error) => {
      const options = []

      // Add correct option
      options.push({
        id: 'correct',
        correctedSentence: error.correctSentence,
        explanation: `正解：${error.correctPart}が正しい形です`,
        isCorrect: true
      })

      // Generate distractors based on error type
      const distractors = generateDistractors(error)
      distractors.forEach((distractor, index) => {
        options.push({
          id: `distractor_${index + 1}`,
          correctedSentence: distractor.sentence,
          explanation: distractor.explanation,
          isCorrect: false
        })
      })

      // Shuffle options
      currentOptions.value = shuffleArray(options)
    }

    const generateDistractors = (error) => {
      const distractors = []

      switch (error.errorType) {
        case '二重比較級（Double Comparative）':
          distractors.push(
            {
              sentence: error.incorrectSentence, // Keep the original error
              explanation: '元の間違った文のまま'
            },
            {
              sentence: error.incorrectSentence.replace('more bigger', 'more big'),
              explanation: 'more + 原形も間違い'
            },
            {
              sentence: error.incorrectSentence.replace('more bigger', 'most big'),
              explanation: '最上級を使うのは不適切'
            }
          )
          break

        case '二重最上級（Double Superlative）':
          distractors.push(
            {
              sentence: error.incorrectSentence,
              explanation: '元の間違った文のまま'
            },
            {
              sentence: error.incorrectSentence.replace('most smartest', 'most smart'),
              explanation: 'most + 原形も間違い'
            },
            {
              sentence: error.incorrectSentence.replace('the most smartest', 'most smartest'),
              explanation: 'theが抜けている'
            }
          )
          break

        case '不規則変化の間違い':
          distractors.push(
            {
              sentence: error.incorrectSentence,
              explanation: '元の間違った文のまま'
            },
            {
              sentence: error.incorrectSentence.replace('gooder', 'more good'),
              explanation: 'moreを使うのも間違い'
            },
            {
              sentence: error.incorrectSentence.replace('gooder', 'goodder'),
              explanation: 'さらに間違った形'
            }
          )
          break

        case '最上級のthe欠落':
          distractors.push(
            {
              sentence: error.incorrectSentence,
              explanation: '元の間違った文のまま'
            },
            {
              sentence: error.incorrectSentence.replace('highest', 'higher'),
              explanation: '比較級は不適切'
            },
            {
              sentence: error.incorrectSentence.replace('highest', 'most high'),
              explanation: 'most highは間違い'
            }
          )
          break

        default:
          distractors.push(
            {
              sentence: error.incorrectSentence,
              explanation: '元の間違った文のまま'
            },
            {
              sentence: error.incorrectSentence.replace(/\w+/, 'different'),
              explanation: '別の間違った修正'
            }
          )
      }

      return distractors.slice(0, 3)
    }

    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const selectCorrection = (optionId) => {
      if (props.showResult) return
      
      emit('answer-selected', optionId)
    }

    const getFeedbackExplanation = () => {
      if (!currentError.value) return ''
      
      if (isCorrect.value) {
        return `素晴らしい！${currentError.value.errorType}をよく理解しています。${currentError.value.memoryTip}を覚えておきましょう。`
      } else {
        return `${currentError.value.errorType}は${currentError.value.commonCause}によるものです。${currentError.value.memoryTip}を覚えて次回に活かしましょう。`
      }
    }

    // Watch for question changes
    watch(() => props.question, () => {
      if (props.question) {
        generateQuestion()
      }
    }, { immediate: true })

    // Watch for result display
    watch(() => props.showResult, (newVal) => {
      if (newVal) {
        const correctOption = currentOptions.value.find(opt => opt.isCorrect)
        isCorrect.value = props.selectedAnswer === correctOption?.id
      }
    })

    // Update parent component with correct answer
    watch(currentOptions, (newOptions) => {
      const correctOption = newOptions.find(opt => opt.isCorrect)
      if (props.question && correctOption) {
        props.question.correctAnswer = correctOption.id
      }
    })

    onMounted(() => {
      generateQuestion()
    })

    const proceedToNext = () => {
      emit('next-question')
    }

    return {
      currentError,
      currentOptions,
      isCorrect,
      selectCorrection,
      getFeedbackExplanation,
      proceedToNext
    }
  }
}
</script>

<style scoped>
.error-correction-stage {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.question-header {
  text-align: center;
  margin-bottom: 15px;
}

.question-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 5px;
}

.question-instruction {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Error Display */
.error-display {
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.02));
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.error-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
}

.error-title {
  font-size: 1rem;
  font-weight: bold;
  color: #ef4444;
}

.sentence-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.incorrect-sentence,
.correct-sentence {
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.incorrect-sentence {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.correct-sentence {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.sentence-label {
  font-size: 0.7rem;
  font-weight: bold;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.incorrect-sentence .sentence-label {
  color: #ef4444;
}

.correct-sentence .sentence-label {
  color: #10b981;
}

.sentence-text {
  font-size: 1rem;
  font-weight: bold;
  line-height: 1.3;
}

.sentence-text.error {
  color: #ef4444;
}

.sentence-text.correct {
  color: #10b981;
}

.error-highlight {
  margin-top: 15px;
  font-size: 1rem;
  color: #94a3b8;
}

.highlight-error {
  color: #ef4444;
  font-weight: bold;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

.correction-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  font-size: 2rem;
  animation: bounceDown 2s infinite;
}

.correction-label {
  font-size: 0.9rem;
  color: #00ffea;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* Error Type Display */
.error-type-display {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
}

.error-type-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.type-icon {
  font-size: 2rem;
}

.type-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #8b5cf6;
}

.error-description {
  color: #94a3b8;
  line-height: 1.5;
  font-size: 1rem;
}

/* Correction Options */
.correction-options {
  margin-bottom: 15px;
}

.options-title {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
  text-align: center;
  margin-bottom: 12px;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.correction-btn {
  padding: 12px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
}

.correction-btn:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.1);
}

.correction-btn.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.15), rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
}

.correction-btn.correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.1));
  animation: correctGlow 2s infinite;
}

.correction-btn.incorrect {
  border-color: #ef4444;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(200, 50, 50, 0.1));
  animation: incorrectShake 0.6s ease-out;
}

.correction-btn.show-correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.08));
}

.correction-btn:disabled {
  cursor: not-allowed;
}

.option-sentence {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 6px;
  line-height: 1.3;
}

.option-explanation {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.2;
}

.correct-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.8));
  padding: 4px 8px;
  border-radius: 15px;
  animation: correctAppear 0.5s ease-out;
}

.indicator-icon {
  font-size: 0.8rem;
}

.indicator-text {
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

@keyframes correctAppear {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}

/* Pattern Analysis */
.pattern-analysis {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.1), rgba(0, 200, 200, 0.05));
  border: 2px solid rgba(0, 255, 234, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.analysis-icon {
  font-size: 1.3rem;
}

.analysis-title {
  font-size: 1rem;
  font-weight: bold;
  color: #00ffea;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.pattern-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border-left: 3px solid rgba(0, 255, 234, 0.5);
}

.pattern-label {
  font-weight: bold;
  color: #00ffea;
  min-width: 100px;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.pattern-value {
  color: #94a3b8;
  flex: 1;
  line-height: 1.3;
  font-size: 0.8rem;
}

/* Prevention Tips */
.prevention-tips {
  background: rgba(16, 185, 129, 0.05);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  padding: 12px;
}

.tips-header {
  font-size: 0.9rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 10px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.tip-number {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
}

.tip-text {
  color: #94a3b8;
  line-height: 1.3;
  flex: 1;
  font-size: 0.8rem;
}

/* Feedback Display */
.feedback-display {
  margin-top: 15px;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feedback-content.correct {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.1));
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.feedback-content.incorrect {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1));
  border: 2px solid rgba(139, 92, 246, 0.3);
}

.feedback-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 6px;
}

.feedback-content.correct .feedback-title {
  color: #10b981;
}

.feedback-content.incorrect .feedback-title {
  color: #8b5cf6;
}

.feedback-explanation {
  color: #94a3b8;
  line-height: 1.3;
  font-size: 0.9rem;
}

/* Next Question Button */
.next-button-container {
  margin-top: 10px;
  text-align: center;
}

.next-question-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.next-question-btn.correct {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.next-question-btn.correct:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.next-question-btn.incorrect {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.3);
}

.next-question-btn.incorrect:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(139, 92, 246, 0.4);
}

/* Animations */
@keyframes correctGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sentence-container {
    gap: 10px;
  }
  
  .pattern-item {
    flex-direction: column;
    gap: 6px;
  }
  
  .pattern-label {
    min-width: auto;
  }
  
  .feedback-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .error-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .analysis-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>