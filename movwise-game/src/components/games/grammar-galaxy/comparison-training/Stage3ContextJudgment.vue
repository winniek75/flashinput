<template>
  <div class="context-judgment-stage">
    <div class="question-header">
      <h3 class="question-title">文脈判断トレーニング</h3>
      <p class="question-instruction">文章の状況から適切な比較表現を選んでください</p>
    </div>

    <!-- Context Scenario Display -->
    <div class="scenario-display">
      <div class="scenario-header">
        <div class="scenario-icon">{{ currentScenario.icon }}</div>
        <div class="scenario-title">{{ currentScenario.title }}</div>
      </div>
      
      <div class="scenario-content">
        <div class="scenario-description">
          {{ currentScenario.description }}
        </div>
        
        <!-- Visual elements if available -->
        <div class="scenario-visuals" v-if="currentScenario.visuals">
          <div 
            v-for="(visual, index) in currentScenario.visuals"
            :key="index"
            class="visual-element"
            :class="visual.type"
          >
            <div class="visual-icon">{{ visual.icon }}</div>
            <div class="visual-label">{{ visual.label }}</div>
            <div class="visual-value" v-if="visual.value">{{ visual.value }}</div>
          </div>
        </div>
      </div>

      <!-- Sentence with blank -->
      <div class="sentence-display">
        <div class="sentence-text">
          {{ getSentenceWithBlank() }}
        </div>
        <div class="context-hint" v-if="currentScenario.hint">
          💡 ヒント: {{ currentScenario.hint }}
        </div>
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
          'show-correct': showResult && option.isCorrect && selectedAnswer !== option.id
        }"
        @click="selectOption(option.id)"
        :disabled="showResult"
      >
        <div class="option-text">{{ option.text }}</div>
        <div class="option-type">{{ option.type }}</div>
        
        <!-- Audio button -->
        <button 
          class="audio-btn"
          @click.stop="playAudio(option.text)"
          :disabled="isPlayingAudio"
        >
          🔊
        </button>
      </button>
    </div>

    <!-- Context Analysis Display -->
    <div class="context-analysis" v-if="showResult">
      <div class="analysis-header">
        <div class="analysis-icon">🔍</div>
        <div class="analysis-title">文脈分析</div>
      </div>
      
      <div class="analysis-content">
        <div class="analysis-item">
          <span class="analysis-label">比較対象:</span>
          <span class="analysis-value">{{ currentScenario.comparisonObjects }}</span>
        </div>
        <div class="analysis-item">
          <span class="analysis-label">比較の種類:</span>
          <span class="analysis-value">{{ getComparisonTypeExplanation() }}</span>
        </div>
        <div class="analysis-item">
          <span class="analysis-label">なぜこの形式:</span>
          <span class="analysis-value">{{ currentScenario.reasoning }}</span>
        </div>
      </div>
    </div>

    <!-- Feedback Display -->
    <div class="feedback-display" v-if="showResult">
      <div class="feedback-content" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
        <div class="feedback-icon">{{ isCorrect ? '🎯' : '📚' }}</div>
        <div class="feedback-text">
          <div class="feedback-title">
            {{ isCorrect ? '完璧です！' : '学習ポイント' }}
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
  name: 'Stage3ContextJudgment',
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
      default: 3
    }
  },
  emits: ['answer-selected', 'next-question'],
  setup(props, { emit }) {
    const currentScenario = ref(null)
    const currentOptions = ref([])
    const isCorrect = ref(false)
    const isPlayingAudio = ref(false)

    // Context scenarios database
    const contextScenarios = [
      {
        id: 'restaurant_comparison',
        icon: '🍽️',
        title: 'レストランでの会話',
        description: '友達と3軒のレストランについて話している',
        sentence: 'Among the three restaurants we tried, this one is ___ delicious.',
        blank: '___',
        correctAnswer: 'the most',
        comparisonObjects: '3軒のレストラン',
        comparisonType: 'superlative',
        reasoning: '3つ以上の中から最も美味しいものを選んでいるため',
        hint: '3つのレストランの中で...',
        visuals: [
          { icon: '🍕', label: 'Restaurant A', type: 'medium', value: '★★★' },
          { icon: '🍜', label: 'Restaurant B', type: 'small', value: '★★' },
          { icon: '🍖', label: 'Restaurant C', type: 'large', value: '★★★★★' }
        ]
      },
      {
        id: 'height_comparison',
        icon: '👥',
        title: '身長の比較',
        description: '太郎と花子の身長を比べている',
        sentence: 'Taro is ___ tall as Hanako.',
        blank: '___',
        correctAnswer: 'as',
        comparisonObjects: '太郎と花子',
        comparisonType: 'equal',
        reasoning: '2人の身長が同じであることを表している',
        hint: '身長が同じ...',
        visuals: [
          { icon: '👨', label: 'Taro', type: 'medium', value: '175cm' },
          { icon: '👩', label: 'Hanako', type: 'medium', value: '175cm' }
        ]
      },
      {
        id: 'weather_comparison',
        icon: '🌤️',
        title: '天気の比較',
        description: '今日と昨日の気温を比べている',
        sentence: 'Today is ___ than yesterday.',
        blank: '___',
        correctAnswer: 'warmer',
        comparisonObjects: '今日と昨日',
        comparisonType: 'comparative',
        reasoning: '2つの日の気温を比較している',
        hint: '2つの日を比べて...',
        visuals: [
          { icon: '🌡️', label: 'Yesterday', type: 'small', value: '15°C' },
          { icon: '🌡️', label: 'Today', type: 'large', value: '22°C' }
        ]
      },
      {
        id: 'speed_comparison',
        icon: '🚗',
        title: '速度の比較',
        description: '4台の車の中で最も速い車について',
        sentence: 'The red car is ___ fastest among all the cars.',
        blank: '___',
        correctAnswer: 'the',
        comparisonObjects: '4台の車',
        comparisonType: 'superlative',
        reasoning: '複数の車の中で最も速いものを指している',
        hint: '複数の中で最も...',
        visuals: [
          { icon: '🚗', label: 'Red Car', type: 'large', value: '200km/h' },
          { icon: '🚙', label: 'Blue Car', type: 'medium', value: '150km/h' },
          { icon: '🚕', label: 'Yellow Car', type: 'small', value: '120km/h' },
          { icon: '🚘', label: 'Green Car', type: 'medium', value: '160km/h' }
        ]
      },
      {
        id: 'book_thickness',
        icon: '📚',
        title: '本の厚さ',
        description: '2冊の本の厚さを比べている',
        sentence: 'This book is ___ thicker than that one.',
        blank: '___',
        correctAnswer: 'much',
        comparisonObjects: 'この本とあの本',
        comparisonType: 'comparative_intensifier',
        reasoning: '比較級を強調する副詞が必要',
        hint: '比較級を強調して...',
        visuals: [
          { icon: '📖', label: 'This Book', type: 'large', value: '500 pages' },
          { icon: '📕', label: 'That Book', type: 'small', value: '150 pages' }
        ]
      },
      {
        id: 'mountain_height',
        icon: '🏔️',
        title: '山の高さ',
        description: '世界の山々の中でエベレストについて',
        sentence: 'Mount Everest is ___ highest mountain in the world.',
        blank: '___',
        correctAnswer: 'the',
        comparisonObjects: '世界の山々',
        comparisonType: 'superlative',
        reasoning: '世界で最も高い山という唯一のものを指している',
        hint: '世界で最も高い...',
        visuals: [
          { icon: '🏔️', label: 'Mt. Everest', type: 'huge', value: '8,849m' },
          { icon: '⛰️', label: 'Mt. Fuji', type: 'medium', value: '3,776m' },
          { icon: '🌄', label: 'Other Mountains', type: 'small', value: 'Various' }
        ]
      },
      {
        id: 'student_performance',
        icon: '🎓',
        title: '学生の成績',
        description: 'クラスの中での成績について',
        sentence: 'She studies ___ hard as her classmates.',
        blank: '___',
        correctAnswer: 'as',
        comparisonObjects: '彼女とクラスメート',
        comparisonType: 'equal',
        reasoning: '同程度に勉強していることを表している',
        hint: '同じくらい...',
        visuals: [
          { icon: '👩‍🎓', label: 'She', type: 'medium', value: '8hrs/day' },
          { icon: '👥', label: 'Classmates', type: 'medium', value: '8hrs/day' }
        ]
      },
      {
        id: 'price_comparison',
        icon: '💰',
        title: '値段の比較',
        description: '3つの商品の価格について',
        sentence: 'This product is ___ expensive of the three.',
        blank: '___',
        correctAnswer: 'the most',
        comparisonObjects: '3つの商品',
        comparisonType: 'superlative',
        reasoning: '3つの中で最も高価であることを表している',
        hint: '3つの中で最も...',
        visuals: [
          { icon: '📱', label: 'Product A', type: 'large', value: '$800' },
          { icon: '💻', label: 'Product B', type: 'medium', value: '$600' },
          { icon: '⌚', label: 'Product C', type: 'small', value: '$300' }
        ]
      }
    ]

    const generateQuestion = () => {
      // Select random scenario
      const scenario = contextScenarios[Math.floor(Math.random() * contextScenarios.length)]
      currentScenario.value = scenario

      // Generate options based on scenario type
      generateOptions(scenario)
    }

    const generateOptions = (scenario) => {
      const options = []

      // Add correct answer
      options.push({
        id: 'correct',
        text: scenario.correctAnswer,
        isCorrect: true,
        type: getAnswerTypeLabel(scenario.comparisonType)
      })

      // Add distractors based on scenario type
      const distractors = getDistractors(scenario)
      distractors.forEach((distractor, index) => {
        options.push({
          id: `distractor_${index + 1}`,
          text: distractor.text,
          isCorrect: false,
          type: distractor.type
        })
      })

      // Shuffle options
      currentOptions.value = shuffleArray(options)
    }

    const getDistractors = (scenario) => {
      const distractors = []

      switch (scenario.comparisonType) {
        case 'superlative':
          distractors.push(
            { text: 'more', type: '比較級' },
            { text: 'as', type: 'as...as構文' },
            { text: 'very', type: '原級強調' }
          )
          break
        
        case 'comparative':
          distractors.push(
            { text: 'the most', type: '最上級' },
            { text: 'as', type: 'as...as構文' },
            { text: 'very', type: '原級強調' }
          )
          break
        
        case 'comparative_intensifier':
          distractors.push(
            { text: 'very', type: '原級強調' },
            { text: 'more', type: '比較級' },
            { text: 'the most', type: '最上級' }
          )
          break
        
        case 'equal':
          distractors.push(
            { text: 'more', type: '比較級' },
            { text: 'the most', type: '最上級' },
            { text: 'very', type: '原級強調' }
          )
          break
        
        default:
          distractors.push(
            { text: 'more', type: '比較級' },
            { text: 'most', type: '最上級' },
            { text: 'very', type: '原級強調' }
          )
      }

      return distractors.slice(0, 3)
    }

    const getAnswerTypeLabel = (type) => {
      const labels = {
        'superlative': '最上級',
        'comparative': '比較級',
        'comparative_intensifier': '比較級強調',
        'equal': 'as...as構文'
      }
      return labels[type] || '比較表現'
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

    const getSentenceWithBlank = () => {
      if (!currentScenario.value) return ''
      
      return currentScenario.value.sentence.replace(
        currentScenario.value.blank, 
        '___'
      )
    }

    const getComparisonTypeExplanation = () => {
      if (!currentScenario.value) return ''
      
      const explanations = {
        'superlative': '最上級 - 3つ以上の中で最も',
        'comparative': '比較級 - 2つを比較',
        'comparative_intensifier': '比較級の強調',
        'equal': 'as...as構文 - 同程度の比較'
      }
      
      return explanations[currentScenario.value.comparisonType] || '比較表現'
    }

    const getFeedbackExplanation = () => {
      if (!currentScenario.value) return ''
      
      if (isCorrect.value) {
        return `正解！${currentScenario.value.reasoning}。文脈をよく理解できています。`
      } else {
        return `${currentScenario.value.reasoning}。文脈から比較の種類を判断することが重要です。`
      }
    }

    const playAudio = async (text) => {
      if (isPlayingAudio.value) return
      
      isPlayingAudio.value = true
      
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1.0
        
        utterance.onend = () => {
          isPlayingAudio.value = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        logger.warn('Speech synthesis not available:', error)
        isPlayingAudio.value = false
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
      currentScenario,
      currentOptions,
      isCorrect,
      isPlayingAudio,
      selectOption,
      getSentenceWithBlank,
      getComparisonTypeExplanation,
      getFeedbackExplanation,
      playAudio,
      proceedToNext
    }
  }
}
</script>

<style scoped>
.context-judgment-stage {
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

/* Scenario Display */
.scenario-display {
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.05), rgba(0, 100, 200, 0.02));
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.scenario-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
}

.scenario-title {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
}

.scenario-content {
  margin-bottom: 12px;
}

.scenario-description {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.3;
  margin-bottom: 10px;
}

.scenario-visuals {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 10px;
}

.visual-element {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.visual-element.small { transform: scale(0.8); }
.visual-element.medium { transform: scale(1); }
.visual-element.large { transform: scale(1.2); }
.visual-element.huge { transform: scale(1.4); }

.visual-icon {
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.visual-label {
  font-size: 0.75rem;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 3px;
}

.visual-value {
  font-size: 0.7rem;
  color: #fbbf24;
  font-weight: bold;
}

/* Sentence Display */
.sentence-display {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 255, 234, 0.4);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.sentence-text {
  font-size: 1.1rem;
  color: white;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.4;
}

.context-hint {
  font-size: 0.8rem;
  color: #fbbf24;
  font-style: italic;
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
  position: relative;
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
}

.option-btn:disabled {
  cursor: not-allowed;
}

.option-text {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 4px;
}

.option-type {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.audio-btn {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.2), rgba(0, 200, 200, 0.3));
  border: 1px solid rgba(0, 255, 234, 0.4);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 6px;
  font-size: 0.8rem;
}

.audio-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.3), rgba(0, 200, 200, 0.4));
  transform: scale(1.1);
}

.audio-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Context Analysis */
.context-analysis {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.analysis-icon {
  font-size: 1.2rem;
}

.analysis-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #8b5cf6;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.analysis-item {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 6px;
}

.analysis-label {
  font-weight: bold;
  color: #8b5cf6;
  min-width: 80px;
  font-size: 0.75rem;
}

.analysis-value {
  color: #94a3b8;
  flex: 1;
  font-size: 0.75rem;
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
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .scenario-visuals {
    flex-direction: column;
    align-items: center;
  }
  
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .analysis-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .analysis-label {
    min-width: auto;
  }
  
  .feedback-content {
    flex-direction: column;
    text-align: center;
  }
  
  .visual-element.small,
  .visual-element.medium,
  .visual-element.large,
  .visual-element.huge {
    transform: scale(1);
  }
  
  .scenario-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>