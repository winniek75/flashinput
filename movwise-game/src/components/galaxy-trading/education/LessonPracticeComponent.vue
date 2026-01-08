<template>
  <div class="lesson-practice-component">
    <!-- レッスンヘッダー -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="text-4xl">{{ lesson.icon }}</div>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ lesson.title }}</h2>
          <p class="text-gray-600">{{ lesson.subtitle }}</p>
        </div>
      </div>
      
      <!-- 進捗バー -->
      <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          class="rounded-full h-3 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          :style="{ width: `${lessonProgress}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-sm text-gray-600">
        <span>ステップ {{ currentStep }} / {{ totalSteps }}</span>
        <span>{{ Math.round(lessonProgress) }}% 完了</span>
      </div>
    </div>

    <!-- レッスンコンテンツ -->
    <div class="lesson-content">
      <!-- ステップ1: 基本概念の説明 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3 class="text-xl font-bold text-gray-800 mb-4">📚 基本概念を学ぼう</h3>
        <div class="space-y-4">
          <div
            v-for="(topic, index) in lesson.topics"
            :key="index"
            class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-indigo-500"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getTopicIcon(index) }}</span>
              <div>
                <h4 class="font-bold text-gray-800">{{ topic }}</h4>
                <p class="text-gray-600 text-sm">{{ getTopicExplanation(lesson.id, index) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <button
            @click="nextStep"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
          >
            次のステップへ →
          </button>
        </div>
      </div>

      <!-- ステップ2: インタラクティブクイズ -->
      <div v-else-if="currentStep === 2" class="step-content">
        <h3 class="text-xl font-bold text-gray-800 mb-4">🎯 理解度チェック</h3>
        
        <div v-if="currentQuiz" class="quiz-container">
          <div class="bg-white border-2 border-indigo-200 rounded-xl p-6 mb-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4">{{ currentQuiz.question }}</h4>
            
            <div class="space-y-3">
              <button
                v-for="(option, index) in currentQuiz.options"
                :key="index"
                @click="selectAnswer(index)"
                class="w-full text-left p-4 rounded-xl border-2 transition-all duration-200"
                :class="getOptionClass(index)"
              >
                <span class="font-medium">{{ String.fromCharCode(65 + index) }}. {{ option }}</span>
              </button>
            </div>
          </div>
          
          <div v-if="showQuizResult" class="quiz-result mb-6">
            <div 
              class="p-4 rounded-xl"
              :class="isCorrectAnswer ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ isCorrectAnswer ? '🎉' : '😔' }}</span>
                <div>
                  <h4 class="font-bold" :class="isCorrectAnswer ? 'text-green-800' : 'text-red-800'">
                    {{ isCorrectAnswer ? '正解！' : '惜しい！' }}
                  </h4>
                  <p class="text-sm" :class="isCorrectAnswer ? 'text-green-700' : 'text-red-700'">
                    {{ currentQuiz.explanation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center">
            <button
              v-if="showQuizResult"
              @click="nextQuiz"
              class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
            >
              {{ quizIndex < quizzes.length - 1 ? '次の問題へ' : '実践アクティビティへ' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ステップ3: 実践アクティビティ -->
      <div v-else-if="currentStep === 3" class="step-content">
        <h3 class="text-xl font-bold text-gray-800 mb-4">🎮 実践アクティビティ</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(activity, index) in lesson.activities"
            :key="index"
            class="activity-card bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 cursor-pointer hover:scale-105 transition-all duration-200"
            @click="startActivity(activity)"
          >
            <div class="text-center">
              <div class="text-4xl mb-3">{{ activity.icon }}</div>
              <h4 class="text-lg font-bold text-gray-800 mb-2">{{ activity.name }}</h4>
              <p class="text-gray-600 text-sm">{{ activity.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-6 text-center">
          <button
            @click="nextStep"
            class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
          >
            レッスンを完了する ✅
          </button>
        </div>
      </div>

      <!-- 完了画面 -->
      <div v-else-if="currentStep === 4" class="step-content text-center">
        <div class="text-8xl mb-6">🎉</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">レッスン完了！</h3>
        <p class="text-gray-600 mb-6">「{{ lesson.title }}」を完了しました。素晴らしい！</p>
        
        <!-- 獲得ポイント表示 -->
        <div class="bg-green-100 rounded-xl p-6 mb-6">
          <h4 class="text-lg font-bold text-green-800 mb-3">📊 学習成果</h4>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-700">{{ earnedPoints }}</div>
              <div class="text-sm text-green-600">獲得ポイント</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-700">{{ correctAnswers }}</div>
              <div class="text-sm text-blue-600">正解数</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-700">{{ Math.round(completionTime / 60) }}</div>
              <div class="text-sm text-purple-600">所要時間(分)</div>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button
            @click="completeLesson"
            class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
          >
            🚀 次のレッスンに進む
          </button>
          <button
            @click="$emit('cancel')"
            class="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
          >
            カリキュラムに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- キャンセルボタン -->
    <div class="mt-6 text-center">
      <button
        v-if="currentStep < 4"
        @click="$emit('cancel')"
        class="text-gray-500 hover:text-gray-700 underline"
      >
        レッスンを中断する
      </button>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'LessonPracticeComponent',
  props: {
    lesson: {
      type: Object,
      required: true
    }
  },
  emits: ['complete', 'cancel'],
  setup(props, { emit }) {
    // === 状態管理 ===
    const currentStep = ref(1)
    const totalSteps = ref(4)
    const startTime = ref(Date.now())
    const quizIndex = ref(0)
    const selectedAnswer = ref(null)
    const showQuizResult = ref(false)
    const correctAnswers = ref(0)
    const earnedPoints = ref(0)
    
    // クイズデータ
    const quizzes = ref([])
    
    // === 計算プロパティ ===
    const lessonProgress = computed(() => {
      return ((currentStep.value - 1) / (totalSteps.value - 1)) * 100
    })
    
    const currentQuiz = computed(() => {
      return quizzes.value[quizIndex.value] || null
    })
    
    const isCorrectAnswer = computed(() => {
      return selectedAnswer.value === currentQuiz.value?.correctAnswer
    })
    
    const completionTime = computed(() => {
      return Date.now() - startTime.value
    })
    
    // === メソッド ===
    
    /**
     * 次のステップへ
     */
    const nextStep = () => {
      if (currentStep.value < totalSteps.value) {
        currentStep.value++
        if (currentStep.value === 2) {
          generateQuizzes()
        }
      }
    }
    
    /**
     * クイズの生成
     */
    const generateQuizzes = () => {
      // レッスンIDに基づいてクイズを生成
      const quizData = getQuizData(props.lesson.id)
      quizzes.value = quizData
      quizIndex.value = 0
      selectedAnswer.value = null
      showQuizResult.value = false
    }
    
    /**
     * 回答選択
     */
    const selectAnswer = (answerIndex) => {
      if (showQuizResult.value) return
      
      selectedAnswer.value = answerIndex
      showQuizResult.value = true
      
      if (isCorrectAnswer.value) {
        correctAnswers.value++
        earnedPoints.value += 10
      }
    }
    
    /**
     * 次のクイズ
     */
    const nextQuiz = () => {
      if (quizIndex.value < quizzes.value.length - 1) {
        quizIndex.value++
        selectedAnswer.value = null
        showQuizResult.value = false
      } else {
        nextStep()
      }
    }
    
    /**
     * アクティビティ開始
     */
    const startActivity = (activity) => {
      logger.log('アクティビティ開始:', activity.name)
      earnedPoints.value += 15
      
      // 簡単なアクティビティシミュレーション
      alert(`🎮 ${activity.name}を体験しました！\n${activity.description}`)
    }
    
    /**
     * レッスン完了
     */
    const completeLesson = () => {
      const completionData = {
        id: props.lesson.id,
        completionTime: completionTime.value,
        correctAnswers: correctAnswers.value,
        earnedPoints: earnedPoints.value,
        timestamp: new Date().toISOString()
      }
      
      emit('complete', completionData)
    }
    
    /**
     * トピックアイコン取得
     */
    const getTopicIcon = (index) => {
      const icons = ['💡', '🎯', '🌟', '🚀', '💎', '🏆']
      return icons[index % icons.length]
    }
    
    /**
     * トピック説明取得
     */
    const getTopicExplanation = (lessonId, topicIndex) => {
      const explanations = {
        'lesson-1': [
          'お金は物々交換の代わりに使われる便利な道具です',
          '昔は貝や石がお金として使われていました',
          'お金があることで欲しいものを手に入れやすくなります',
          '計画的にお金を使うことが大切です'
        ],
        'lesson-2': [
          '貯金をすることで将来の夢を叶えることができます',
          '具体的な目標があると貯金が楽しくなります',
          '少しずつでも継続することが大切です',
          '欲しいものがあっても我慢することで大きな目標を達成できます'
        ],
        'lesson-3': [
          '投資は将来のためにお金を使うことです',
          '貯金は確実だけど増え方が少ない、投資は増える可能性があるけどリスクもあります',
          'リスクが高いほどリターンも大きい可能性があります',
          '時間をかけることでお金が大きく増える可能性があります'
        ]
      }
      
      return explanations[lessonId]?.[topicIndex] || 'このトピックについて学習しましょう'
    }
    
    /**
     * 選択肢のクラス取得
     */
    const getOptionClass = (optionIndex) => {
      if (!showQuizResult.value) {
        return selectedAnswer.value === optionIndex 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-200 hover:border-indigo-300'
      }
      
      if (optionIndex === currentQuiz.value.correctAnswer) {
        return 'border-green-500 bg-green-50'
      } else if (selectedAnswer.value === optionIndex) {
        return 'border-red-500 bg-red-50'
      } else {
        return 'border-gray-200 bg-gray-50'
      }
    }
    
    /**
     * クイズデータ取得
     */
    const getQuizData = (lessonId) => {
      const quizDatabase = {
        'lesson-1': [
          {
            question: 'お金の役割として正しくないものはどれでしょう？',
            options: [
              '物を交換する手段',
              '価値を測る尺度',
              '貯めておくもの',
              '友達と競争するもの'
            ],
            correctAnswer: 3,
            explanation: 'お金は競争の道具ではなく、みんなの生活を便利にするものです。'
          },
          {
            question: '昔のお金として使われていたものはどれでしょう？',
            options: [
              '貝がら',
              'どんぐり',
              '石ころ',
              'すべて正解'
            ],
            correctAnswer: 3,
            explanation: '昔は様々なものがお金として使われていました。'
          }
        ],
        'lesson-2': [
          {
            question: '貯金をする一番の理由は何でしょう？',
            options: [
              'お父さんお母さんに褒められるため',
              '将来の夢を叶えるため',
              '友達に自慢するため',
              'お金持ちになるため'
            ],
            correctAnswer: 1,
            explanation: '貯金は将来の目標や夢を叶えるための大切な手段です。'
          }
        ],
        'lesson-3': [
          {
            question: '投資について正しい説明はどれでしょう？',
            options: [
              '絶対にお金が増える',
              'お金が減ることもある',
              'お金持ちだけがするもの',
              'ギャンブルと同じ'
            ],
            correctAnswer: 1,
            explanation: '投資にはリスクがあり、お金が減る可能性もありますが、長期的には成長の可能性があります。'
          }
        ]
      }
      
      return quizDatabase[lessonId] || []
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('📚 レッスン実践開始:', props.lesson.title)
      startTime.value = Date.now()
    })
    
    onUnmounted(() => {
      logger.log('📚 レッスン実践終了')
    })
    
    return {
      // State
      currentStep,
      totalSteps,
      quizIndex,
      selectedAnswer,
      showQuizResult,
      correctAnswers,
      earnedPoints,
      quizzes,
      
      // Computed
      lessonProgress,
      currentQuiz,
      isCorrectAnswer,
      completionTime,
      
      // Methods
      nextStep,
      selectAnswer,
      nextQuiz,
      startActivity,
      completeLesson,
      getTopicIcon,
      getTopicExplanation,
      getOptionClass
    }
  }
}
</script>

<style scoped>
.lesson-practice-component {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-content {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.activity-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.quiz-container {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }
}
</style>