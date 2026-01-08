<template>
  <div class="irregular-drill-stage">
    <div class="question-header">
      <h3 class="question-title">不規則変化ドリル</h3>
      <p class="question-instruction">不規則変化の形を選択してください</p>
    </div>

    <!-- Word Display -->
    <div class="word-display" v-if="currentWord">
      <div class="base-word-section">
        <div class="base-word">{{ currentWord.base || '' }}</div>
        <div class="base-meaning">{{ currentWord.meaning || '' }}</div>
      </div>
      
      <div class="transformation-arrow">
        <div class="arrow-icon">➡️</div>
        <div class="transformation-type">{{ getTransformationType() }}</div>
      </div>
      
      <div class="target-word-section">
        <div class="target-word" v-if="showResult">
          {{ getCorrectForm() }}
        </div>
        <div class="question-mark" v-else>?</div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div class="word-display" v-else>
      <div class="loading-state">
        <div class="loading-text">問題を準備中...</div>
      </div>
    </div>

    <!-- Answer Options -->
    <div class="answer-options">
      <button
        v-for="option in currentOptions"
        :key="option.id"
        class="option-btn"
        :class="{
          'selected': selectedAnswer === option.id,
          'correct': showResult && option.isCorrect,
          'incorrect': showResult && selectedAnswer === option.id && !option.isCorrect,
          'show-correct': showResult && option.isCorrect && !isCorrect
        }"
        @click="selectOption(option.id)"
        :disabled="showResult"
      >
        <div class="option-text">{{ option.text }}</div>
        <div class="option-pronunciation" v-if="option.pronunciation">
          [{{ option.pronunciation }}]
        </div>
      </button>
    </div>

    <!-- Memory Pattern Display -->
    <div class="memory-pattern" v-if="showResult && !isCorrect && currentWord">
      <div class="pattern-title">🧠 記憶パターン</div>
      <div class="pattern-sequence">
        <div class="pattern-item base">
          <div class="pattern-word">{{ currentWord.base || '' }}</div>
          <div class="pattern-label">原形</div>
        </div>
        <div class="pattern-arrow">→</div>
        <div class="pattern-item comparative" v-if="currentWord.comparative">
          <div class="pattern-word">{{ currentWord.comparative }}</div>
          <div class="pattern-label">比較級</div>
        </div>
        <div class="pattern-arrow" v-if="currentWord.comparative && currentWord.superlative">→</div>
        <div class="pattern-item superlative" v-if="currentWord.superlative">
          <div class="pattern-word">{{ currentWord.superlative }}</div>
          <div class="pattern-label">最上級</div>
        </div>
      </div>
    </div>


    <!-- Feedback Display -->
    <div class="feedback-display" v-if="showResult">
      <div class="feedback-content" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
        <div class="feedback-icon">{{ isCorrect ? '🎉' : '📝' }}</div>
        <div class="feedback-text">
          <div class="feedback-title">
            {{ isCorrect ? '素晴らしい！' : '覚えましょう！' }}
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
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'Stage2IrregularDrill',
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
      default: 2
    }
  },
  emits: ['answer-selected', 'next-question'],
  setup(props, { emit }) {
    const currentWord = ref(null)
    const currentOptions = ref([])
    const currentTargetType = ref('')
    const isCorrect = ref(false)

    // Irregular words database
    const irregularWords = [
      {
        base: 'good',
        meaning: '良い',
        comparative: 'better',
        superlative: 'best',
        pronunciation: { base: 'ɡʊd', comparative: 'betər', superlative: 'best' },
        pattern: 'good → better → best'
      },
      {
        base: 'bad',
        meaning: '悪い',
        comparative: 'worse',
        superlative: 'worst',
        pronunciation: { base: 'bæd', comparative: 'wɜrs', superlative: 'wɜrst' },
        pattern: 'bad → worse → worst'
      },
      {
        base: 'many',
        meaning: 'たくさんの',
        comparative: 'more',
        superlative: 'most',
        pronunciation: { base: 'meni', comparative: 'mɔr', superlative: 'moʊst' },
        pattern: 'many → more → most'
      },
      {
        base: 'much',
        meaning: 'たくさんの',
        comparative: 'more',
        superlative: 'most',
        pronunciation: { base: 'mʌtʃ', comparative: 'mɔr', superlative: 'moʊst' },
        pattern: 'much → more → most'
      },
      {
        base: 'little',
        meaning: '少ない',
        comparative: 'less',
        superlative: 'least',
        pronunciation: { base: 'lɪtəl', comparative: 'les', superlative: 'list' },
        pattern: 'little → less → least'
      },
      {
        base: 'far',
        meaning: '遠い',
        comparative: 'farther/further',
        superlative: 'farthest/furthest',
        pronunciation: { base: 'fɑr', comparative: 'fɑrðər', superlative: 'fɑrðəst' },
        pattern: 'far → farther → farthest'
      },
      {
        base: 'old',
        meaning: '古い/年上の',
        comparative: 'older/elder',
        superlative: 'oldest/eldest',
        pronunciation: { base: 'oʊld', comparative: 'oʊldər', superlative: 'oʊldəst' },
        pattern: 'old → older → oldest'
      }
    ]

    // Common mistake patterns for distractors
    const commonMistakes = {
      'good': ['gooder', 'goodest', 'more good', 'most good'],
      'bad': ['badder', 'baddest', 'more bad', 'most bad'],
      'many': ['manier', 'maniest', 'many-er', 'many-est'],
      'much': ['mucher', 'muchest', 'more much', 'most much'],
      'little': ['littler', 'littlest', 'more little', 'most little'],
      'far': ['farer', 'farest', 'more far', 'most far'],
      'old': ['more old', 'most old', 'oldier', 'oldiest']
    }

    const generateQuestion = () => {
      try {
        // Select random word
        const word = irregularWords[Math.floor(Math.random() * irregularWords.length)]
        if (!word) {
          logger.error('No word selected from database')
          return
        }
        
        currentWord.value = word

        // Randomly choose comparative or superlative
        const targetTypes = []
        if (word.comparative) targetTypes.push('comparative')
        if (word.superlative) targetTypes.push('superlative')
        
        if (targetTypes.length === 0) {
          logger.error('No target types available for word:', word.base)
          return
        }
        
        currentTargetType.value = targetTypes[Math.floor(Math.random() * targetTypes.length)]

        // Generate options
        generateOptions(word, currentTargetType.value)
      } catch (error) {
        logger.error('Error generating question:', error)
      }
    }

    const generateOptions = (word, targetType) => {
      try {
        const correctAnswer = targetType === 'comparative' ? word.comparative : word.superlative
        if (!correctAnswer) {
          logger.error('No correct answer found for:', word.base, targetType)
          return
        }
        
        const options = []

        // Add correct answer
        options.push({
          id: 'correct',
          text: correctAnswer,
          isCorrect: true,
          pronunciation: word.pronunciation ? 
            (targetType === 'comparative' ? word.pronunciation.comparative : word.pronunciation.superlative) 
            : undefined
        })

        // Add common mistakes as distractors
        const mistakes = commonMistakes[word.base] || []
        let distractorCount = 0
        
        mistakes.forEach(mistake => {
          if (distractorCount < 2) {
            options.push({
              id: `distractor_${distractorCount + 1}`,
              text: mistake,
              isCorrect: false
            })
            distractorCount++
          }
        })

        // Add regular form mistakes if not enough distractors
        if (distractorCount < 2) {
          const regularForms = targetType === 'comparative' 
            ? [`${word.base}er`, `more ${word.base}`]
            : [`${word.base}est`, `most ${word.base}`]
          
          regularForms.forEach(form => {
            if (distractorCount < 2 && !options.some(opt => opt.text === form)) {
              options.push({
                id: `regular_${distractorCount + 1}`,
                text: form,
                isCorrect: false
              })
              distractorCount++
            }
          })
        }

        // Shuffle options
        currentOptions.value = shuffleArray(options)
      } catch (error) {
        logger.error('Error generating options:', error)
        currentOptions.value = []
      }
    }

    const shuffleArray = (array) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const selectOption = (optionId) => {
      if (props.showResult) return
      
      emit('answer-selected', optionId)
    }

    const proceedToNext = () => {
      emit('next-question')
    }

    const getTransformationType = () => {
      try {
        if (currentTargetType.value === 'comparative') return '比較級'
        if (currentTargetType.value === 'superlative') return '最上級'
        return ''
      } catch (error) {
        logger.error('Error in getTransformationType:', error)
        return ''
      }
    }

    const getCorrectForm = () => {
      try {
        if (!currentWord.value) return ''
        
        if (currentTargetType.value === 'comparative') {
          return currentWord.value.comparative || ''
        } else if (currentTargetType.value === 'superlative') {
          return currentWord.value.superlative || ''
        }
        return ''
      } catch (error) {
        logger.error('Error in getCorrectForm:', error)
        return ''
      }
    }

    const getFeedbackExplanation = () => {
      try {
        if (!currentWord.value) return 'ローディング中...'
        
        if (isCorrect.value) {
          return `${currentWord.value.base || ''}の${getTransformationType()}は${getCorrectForm()}です。不規則変化をよく覚えました！`
        } else {
          return `${currentWord.value.base || ''}は不規則変化します。${currentWord.value.pattern || 'パターンを勉強中'}のパターンを覚えましょう。`
        }
      } catch (error) {
        logger.error('Error in getFeedbackExplanation:', error)
        return 'エラーが発生しました。'
      }
    }


    // Watch for question changes
    watch(() => props.question, (newQuestion) => {
      if (newQuestion && typeof newQuestion === 'object') {
        generateQuestion()
      }
    }, { immediate: true })

    // Watch for result display
    watch(() => props.showResult, (newVal) => {
      if (newVal && currentOptions.value.length > 0) {
        const correctOption = currentOptions.value.find(opt => opt.isCorrect)
        isCorrect.value = props.selectedAnswer === correctOption?.id
      }
    })

    // Update parent component with correct answer
    watch(currentOptions, (newOptions) => {
      const correctOption = newOptions.find(opt => opt.isCorrect)
      if (props.question && correctOption) {
        // Safely update question object
        try {
          props.question.correctAnswer = correctOption.id
          props.question.correctForm = correctOption.text
        } catch (error) {
          logger.warn('Could not update question object:', error)
        }
      }
    })

    onMounted(() => {
      // Only generate question if we have a valid props.question
      if (props.question && typeof props.question === 'object') {
        generateQuestion()
      }
    })

    return {
      currentWord,
      currentOptions,
      currentTargetType,
      isCorrect,
      selectOption,
      proceedToNext,
      getTransformationType,
      getCorrectForm,
      getFeedbackExplanation
    }
  }
}
</script>

<style scoped>
.irregular-drill-stage {
  width: 100%;
  max-width: 800px;
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

/* Word Display */
.word-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.05), rgba(0, 100, 200, 0.02));
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  min-height: 100px;
}

.base-word-section,
.target-word-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  min-width: 120px;
}

.base-word,
.target-word {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 6px;
}

.base-meaning {
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: bold;
}

.question-mark {
  font-size: 2rem;
  color: #94a3b8;
  animation: questionPulse 2s infinite;
}

@keyframes questionPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.transformation-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.arrow-icon {
  font-size: 1.5rem;
  animation: arrowBounce 2s infinite;
}

.transformation-type {
  font-size: 0.75rem;
  color: #00ffea;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.loading-text {
  font-size: 1.2rem;
  color: #94a3b8;
  font-weight: bold;
}

/* Answer Options */
.answer-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}

.option-btn {
  padding: 12px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.option-btn:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.1);
}

.option-btn.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.15), rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
}

.option-btn.correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.1));
  animation: correctGlow 2s infinite;
}

.option-btn.incorrect {
  border-color: #ef4444;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(200, 50, 50, 0.1));
  animation: incorrectShake 0.6s ease-out;
}

.option-btn.show-correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.08));
  animation: showCorrect 1s ease-out;
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-text {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 3px;
}

.option-pronunciation {
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
}

/* Memory Pattern */
.memory-pattern {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.pattern-title {
  text-align: center;
  font-size: 0.9rem;
  font-weight: bold;
  color: #8b5cf6;
  margin-bottom: 8px;
}

.pattern-sequence {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pattern-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 8px;
  border: 2px solid;
  min-width: 80px;
}

.pattern-item.base {
  border-color: rgba(0, 212, 255, 0.4);
}

.pattern-item.comparative {
  border-color: rgba(251, 191, 36, 0.4);
}

.pattern-item.superlative {
  border-color: rgba(16, 185, 129, 0.4);
}

.pattern-word {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 3px;
}

.pattern-item.base .pattern-word {
  color: #00d4ff;
}

.pattern-item.comparative .pattern-word {
  color: #fbbf24;
}

.pattern-item.superlative .pattern-word {
  color: #10b981;
}

.pattern-label {
  font-size: 0.65rem;
  color: #94a3b8;
  text-transform: uppercase;
}

.pattern-arrow {
  font-size: 1.2rem;
  color: #8b5cf6;
  font-weight: bold;
}

/* Feedback Display */
.feedback-display {
  margin-top: 10px;
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
  margin-bottom: 4px;
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
  font-size: 0.85rem;
}

/* Next Question Button */
.next-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
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
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes showCorrect {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .word-display {
    flex-direction: column;
    gap: 20px;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .pattern-sequence {
    flex-direction: column;
    gap: 10px;
  }
  
  .pattern-arrow {
    transform: rotate(90deg);
  }
  
  .feedback-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>