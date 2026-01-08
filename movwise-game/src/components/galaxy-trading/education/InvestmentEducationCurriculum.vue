<template>
  <div class="investment-education-curriculum min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <!-- 星空背景 -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="star in stars"
        :key="star.id"
        class="absolute w-1 h-1 bg-white rounded-full animate-pulse"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          opacity: star.opacity,
          animationDelay: `${star.delay}s`
        }"
      ></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto p-6">
      <!-- ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-indigo-700 mb-2 flex items-center gap-3">
              🎓 Galaxy Trading Academy
            </h1>
            <p class="text-indigo-600">小学生のための投資教育カリキュラム</p>
          </div>
          
          <div class="bg-green-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-green-800">{{ completedLessons }}/{{ totalLessons }}</div>
              <div class="text-sm text-green-600">レッスン完了</div>
            </div>
          </div>
        </div>
        
        <!-- 進捗バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>🎓 カリキュラム進捗</span>
            <span>{{ Math.round(curriculumProgress) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="rounded-full h-3 transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
              :style="{ width: `${curriculumProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- カリキュラムセクション -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- レッスンカード -->
        <div
          v-for="lesson in lessons"
          :key="lesson.id"
          class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl cursor-pointer transition-all duration-200 hover:scale-105"
          :class="[
            lesson.isUnlocked ? 'hover:shadow-3xl' : 'opacity-60 cursor-not-allowed',
            lesson.isCompleted ? 'ring-2 ring-green-500' : '',
            lesson.isActive ? 'ring-2 ring-indigo-500' : ''
          ]"
          @click="selectLesson(lesson)"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="text-4xl">{{ lesson.icon }}</div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">{{ lesson.title }}</h3>
                <p class="text-gray-600 text-sm">{{ lesson.subtitle }}</p>
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div v-if="lesson.isCompleted" class="text-green-500 text-2xl">✅</div>
              <div v-else-if="lesson.isUnlocked" class="text-indigo-500 text-2xl">🔓</div>
              <div v-else class="text-gray-400 text-2xl">🔒</div>
            </div>
          </div>
          
          <p class="text-gray-700 mb-4">{{ lesson.description }}</p>
          
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ lesson.estimatedTime }}分</span>
            <span class="text-sm font-bold" :class="getDifficultyColor(lesson.difficulty)">
              {{ getDifficultyLabel(lesson.difficulty) }}
            </span>
          </div>
          
          <!-- 進捗バー -->
          <div v-if="lesson.progress > 0" class="mt-3">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="rounded-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                :style="{ width: `${lesson.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- レッスン詳細モーダル -->
      <div v-if="selectedLesson" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="text-4xl">{{ selectedLesson.icon }}</div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ selectedLesson.title }}</h2>
                <p class="text-gray-600">{{ selectedLesson.subtitle }}</p>
              </div>
            </div>
            <button
              @click="closeLesson"
              class="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <!-- レッスン内容 -->
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-3">📚 学習内容</h3>
              <ul class="space-y-2">
                <li
                  v-for="(topic, index) in selectedLesson.topics"
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <span class="text-indigo-500">•</span>
                  <span class="text-gray-700">{{ topic }}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-3">🎯 学習目標</h3>
              <p class="text-gray-700">{{ selectedLesson.objective }}</p>
            </div>
            
            <div>
              <h3 class="text-lg font-bold text-gray-800 mb-3">🎮 実践アクティビティ</h3>
              <div class="grid grid-cols-1 gap-3">
                <div
                  v-for="(activity, index) in selectedLesson.activities"
                  :key="index"
                  class="bg-gray-50 rounded-xl p-4"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-2xl">{{ activity.icon }}</span>
                    <div>
                      <h4 class="font-bold text-gray-800">{{ activity.name }}</h4>
                      <p class="text-sm text-gray-600">{{ activity.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- アクションボタン -->
          <div class="mt-8 space-y-3">
            <button
              v-if="selectedLesson.isUnlocked"
              @click="startLesson"
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              {{ selectedLesson.isCompleted ? '🔄 レッスンを再受講' : '🚀 レッスンを開始' }}
            </button>
            <button
              @click="closeLesson"
              class="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>

      <!-- 実践モード -->
      <div v-if="practiceMode" class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
        <LessonPracticeComponent
          :lesson="currentPracticeLesson"
          @complete="handleLessonComplete"
          @cancel="exitPracticeMode"
        />
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import LessonPracticeComponent from './LessonPracticeComponent.vue'

export default {
  name: 'InvestmentEducationCurriculum',
  components: {
    ArrowLeft,
    LessonPracticeComponent
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const selectedLesson = ref(null)
    const practiceMode = ref(false)
    const currentPracticeLesson = ref(null)
    const stars = ref([])
    
    // カリキュラムデータ
    const lessons = ref([
      {
        id: 'lesson-1',
        title: 'お金の基本',
        subtitle: 'お金って何だろう？',
        icon: '💰',
        description: 'お金の役割と、なぜお金が大切なのかを学びましょう。',
        estimatedTime: 15,
        difficulty: 'beginner',
        isUnlocked: true,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          'お金の3つの役割（交換・貯蓄・価値の尺度）',
          '昔のお金と今のお金',
          'お金を大切にする理由',
          'お小遣いの管理方法'
        ],
        objective: 'お金の基本的な概念を理解し、お金の大切さを学ぶ',
        activities: [
          {
            icon: '🎯',
            name: 'お金クイズ',
            description: 'お金に関する基本的な質問に答えよう'
          },
          {
            icon: '🎮',
            name: 'お小遣い帳ゲーム',
            description: 'バーチャルお小遣い帳をつけてみよう'
          }
        ]
      },
      {
        id: 'lesson-2',
        title: '貯金と目標',
        subtitle: '夢を叶えるための貯金',
        icon: '🏦',
        description: '目標を決めて計画的に貯金する方法を学びましょう。',
        estimatedTime: 20,
        difficulty: 'beginner',
        isUnlocked: false,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          '貯金の大切さ',
          '目標設定の方法',
          '計画的な貯金のコツ',
          '我慢することの価値'
        ],
        objective: '目標設定と計画的な貯金の重要性を理解する',
        activities: [
          {
            icon: '🎯',
            name: '目標設定ワークショップ',
            description: '自分の夢と貯金目標を決めよう'
          },
          {
            icon: '📊',
            name: '貯金シミュレーター',
            description: '目標達成までの道のりを計算してみよう'
          }
        ]
      },
      {
        id: 'lesson-3',
        title: '投資って何？',
        subtitle: 'お金を育てる方法',
        icon: '🌱',
        description: '投資の基本概念を小学生にも分かりやすく学びましょう。',
        estimatedTime: 25,
        difficulty: 'intermediate',
        isUnlocked: false,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          '投資とは「お金を育てること」',
          '投資と貯金の違い',
          'リスクとリターンの関係',
          '時間の大切さ（複利の力）'
        ],
        objective: '投資の基本概念とリスク・リターンの関係を理解する',
        activities: [
          {
            icon: '🌱',
            name: 'お金の木ゲーム',
            description: '投資でお金がどう成長するかを体験しよう'
          },
          {
            icon: '⚖️',
            name: 'リスク・リターン天秤',
            description: 'リスクとリターンのバランスを学ぼう'
          }
        ]
      },
      {
        id: 'lesson-4',
        title: 'リスクと安全性',
        subtitle: '安全な投資の考え方',
        icon: '🛡️',
        description: 'リスクを理解して、安全な投資の方法を学びましょう。',
        estimatedTime: 20,
        difficulty: 'intermediate',
        isUnlocked: false,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          'リスクの種類',
          '分散投資の重要性',
          '長期投資の利点',
          '感情に左右されない投資'
        ],
        objective: 'リスク管理と分散投資の重要性を理解する',
        activities: [
          {
            icon: '🎲',
            name: 'リスクルーレット',
            description: '異なるリスクレベルの投資を体験しよう'
          },
          {
            icon: '🥧',
            name: '分散投資パズル',
            description: 'ポートフォリオのバランスを考えよう'
          }
        ]
      },
      {
        id: 'lesson-5',
        title: '企業と株式',
        subtitle: '会社の一部を持つということ',
        icon: '🏢',
        description: '企業と株式投資について、惑星企業を例に学びましょう。',
        estimatedTime: 30,
        difficulty: 'advanced',
        isUnlocked: false,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          '会社って何？',
          '株式とは会社の一部を持つこと',
          '配当とは何か',
          '会社の成長と株価の関係'
        ],
        objective: '企業と株式投資の基本を理解する',
        activities: [
          {
            icon: '🏭',
            name: '惑星企業見学',
            description: 'Apple Planet、Robot Planet、Grammar Moonを調べよう'
          },
          {
            icon: '📈',
            name: '株価チャートゲーム',
            description: 'シンプルな株価の動きを予想してみよう'
          }
        ]
      },
      {
        id: 'lesson-6',
        title: '投資計画作成',
        subtitle: '自分だけの投資戦略',
        icon: '📋',
        description: '学んだことを活かして、自分の投資計画を作ってみましょう。',
        estimatedTime: 35,
        difficulty: 'advanced',
        isUnlocked: false,
        isCompleted: false,
        isActive: false,
        progress: 0,
        topics: [
          '投資目標の設定',
          'リスク許容度の確認',
          'ポートフォリオの作成',
          '定期的な見直しの重要性'
        ],
        objective: '個人の投資計画を作成し、実行計画を立てる',
        activities: [
          {
            icon: '🎯',
            name: '投資計画ワークショップ',
            description: '自分だけの投資計画を作成しよう'
          },
          {
            icon: '🚀',
            name: 'Galaxy Trading実践',
            description: '実際にGalaxy Trading Systemで投資してみよう'
          }
        ]
      }
    ])
    
    // === 計算プロパティ ===
    const completedLessons = computed(() => {
      return lessons.value.filter(lesson => lesson.isCompleted).length
    })
    
    const totalLessons = computed(() => {
      return lessons.value.length
    })
    
    const curriculumProgress = computed(() => {
      if (totalLessons.value === 0) return 0
      return (completedLessons.value / totalLessons.value) * 100
    })
    
    // === メソッド ===
    
    /**
     * 星空背景の生成
     */
    const generateStars = () => {
      stars.value = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.8 + 0.2,
        delay: Math.random() * 3
      }))
    }
    
    /**
     * レッスン選択
     */
    const selectLesson = (lesson) => {
      if (!lesson.isUnlocked) {
        alert('このレッスンはまだ解禁されていません。前のレッスンを完了してください。')
        return
      }
      selectedLesson.value = lesson
    }
    
    /**
     * レッスンを閉じる
     */
    const closeLesson = () => {
      selectedLesson.value = null
    }
    
    /**
     * レッスン開始
     */
    const startLesson = () => {
      if (selectedLesson.value) {
        currentPracticeLesson.value = selectedLesson.value
        practiceMode.value = true
        selectedLesson.value = null
      }
    }
    
    /**
     * 実践モード終了
     */
    const exitPracticeMode = () => {
      practiceMode.value = false
      currentPracticeLesson.value = null
    }
    
    /**
     * レッスン完了処理
     */
    const handleLessonComplete = (lessonData) => {
      const lesson = lessons.value.find(l => l.id === lessonData.id)
      if (lesson) {
        lesson.isCompleted = true
        lesson.progress = 100
        
        // 次のレッスンを解禁
        const currentIndex = lessons.value.findIndex(l => l.id === lessonData.id)
        if (currentIndex < lessons.value.length - 1) {
          lessons.value[currentIndex + 1].isUnlocked = true
        }
        
        // Galaxy Trading システムに記録
        gameStore.recordGalaxyTradingLearning(
          'investment-education',
          `lesson-${lessonData.id}`,
          100
        )
        
        alert(`🎉 レッスン「${lesson.title}」が完了しました！`)
      }
      
      exitPracticeMode()
    }
    
    /**
     * 難易度ラベル
     */
    const getDifficultyLabel = (difficulty) => {
      const labels = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級'
      }
      return labels[difficulty] || difficulty
    }
    
    /**
     * 難易度カラー
     */
    const getDifficultyColor = (difficulty) => {
      const colors = {
        beginner: 'text-green-600',
        intermediate: 'text-yellow-600',
        advanced: 'text-red-600'
      }
      return colors[difficulty] || 'text-gray-600'
    }
    
    /**
     * 戻るボタン
     */
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    /**
     * 進捗の読み込み
     */
    const loadProgress = () => {
      const savedProgress = localStorage.getItem('galaxy-investment-education')
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          lessons.value.forEach((lesson, index) => {
            const saved = progress.find(p => p.id === lesson.id)
            if (saved) {
              lesson.isCompleted = saved.isCompleted
              lesson.isUnlocked = saved.isUnlocked
              lesson.progress = saved.progress
            }
          })
        } catch (error) {
          logger.error('進捗読み込みエラー:', error)
        }
      }
    }
    
    /**
     * 進捗の保存
     */
    const saveProgress = () => {
      const progress = lessons.value.map(lesson => ({
        id: lesson.id,
        isCompleted: lesson.isCompleted,
        isUnlocked: lesson.isUnlocked,
        progress: lesson.progress
      }))
      localStorage.setItem('galaxy-investment-education', JSON.stringify(progress))
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🎓 Investment Education Curriculum 初期化')
      generateStars()
      loadProgress()
    })
    
    return {
      // State
      selectedLesson,
      practiceMode,
      currentPracticeLesson,
      lessons,
      stars,
      
      // Computed
      completedLessons,
      totalLessons,
      curriculumProgress,
      
      // Methods
      selectLesson,
      closeLesson,
      startLesson,
      exitPracticeMode,
      handleLessonComplete,
      getDifficultyLabel,
      getDifficultyColor,
      handleBack,
      saveProgress
    }
  }
}
</script>

<style scoped>
.investment-education-curriculum {
  animation: fadeIn 0.8s ease-out;
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

/* 星のアニメーション */
@keyframes pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* カードのホバーエフェクト */
.hover\\:scale-105:hover {
  transform: scale(1.05);
}

.hover\\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* モーダルアニメーション */
.fixed.inset-0 > div {
  animation: slideInUp 0.4s ease-out;
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
  
  .max-w-2xl {
    max-width: 90vw;
  }
}
</style>