<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo & Title -->
          <div class="flex items-center gap-4">
            <button
              @click="$router.push('/')"
              class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-slate-300">ホーム</span>
            </button>
            <div class="flex items-center gap-3">
              <div class="text-3xl">👨‍🏫</div>
              <div>
                <h1 class="text-2xl font-bold text-white">MovWISE 講師ダッシュボード</h1>
                <p class="text-sm text-slate-400">リアルタイム協力学習管理センター</p>
              </div>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4">
            <!-- Collaborative Session Status -->
            <div v-if="isActiveSession" class="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span class="text-blue-400 font-medium text-sm">協力セッション中</span>
            </div>

            <!-- Online Status -->
            <div class="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-green-400 font-medium text-sm">オンライン</span>
            </div>

            <!-- Teacher Info -->
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <div class="text-2xl">👨‍🏫</div>
              <div class="text-left">
                <div class="text-white font-medium">講師 MovWISE</div>
                <div class="text-xs text-slate-400">英語学習指導員</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Overview Cards -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stats-card fade-in-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between mb-4">
            <div class="text-2xl">👨‍🎓</div>
            <div class="text-2xl font-bold text-blue-400">
              <span v-if="isLoading">...</span>
              <span v-else>{{ activeStudents }}</span>
            </div>
          </div>
          <h3 class="text-white font-semibold mb-1">アクティブ生徒数</h3>
          <p class="text-slate-400 text-sm">現在オンラインの生徒</p>
        </div>

        <div class="stats-card fade-in-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between mb-4">
            <div class="text-2xl">🎯</div>
            <div class="text-2xl font-bold text-green-400">
              <span v-if="isLoading">...</span>
              <span v-else>{{ completedMissions }}</span>
            </div>
          </div>
          <h3 class="text-white font-semibold mb-1">完了ミッション</h3>
          <p class="text-slate-400 text-sm">今日完了された数</p>
        </div>

        <div class="stats-card fade-in-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between mb-4">
            <div class="text-2xl">🤝</div>
            <div class="text-2xl font-bold text-purple-400">
              <span v-if="isLoading">...</span>
              <span v-else>{{ collaborativeSessions }}</span>
            </div>
          </div>
          <h3 class="text-white font-semibold mb-1">協力セッション</h3>
          <p class="text-slate-400 text-sm">今日実施した回数</p>
        </div>

        <div class="stats-card fade-in-up" style="animation-delay: 0.4s">
          <div class="flex items-center justify-between mb-4">
            <div class="text-2xl">📊</div>
            <div class="text-2xl font-bold text-yellow-400">
              <span v-if="isLoading">...</span>
              <span v-else>{{ averageProgress }}%</span>
            </div>
          </div>
          <h3 class="text-white font-semibold mb-1">平均進捗率</h3>
          <p class="text-slate-400 text-sm">全生徒の学習進捗</p>
        </div>
      </section>

      <!-- Action Buttons -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span class="text-3xl">⚡</span>
          クイックアクション
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            @click="startCollaborativeSession"
            class="action-card bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 fade-in-up"
            style="animation-delay: 0.1s"
          >
            <span class="text-3xl mb-2">🚀</span>
            <span class="font-bold">協力セッション開始</span>
            <span class="text-sm opacity-80">生徒と共同学習を始める</span>
          </button>

          <button
            @click="viewStudentProgress"
            class="action-card bg-green-500/20 border-green-500/30 hover:bg-green-500/30 fade-in-up"
            style="animation-delay: 0.2s"
          >
            <span class="text-3xl mb-2">📊</span>
            <span class="font-bold">進捗確認</span>
            <span class="text-sm opacity-80">全生徒の学習状況</span>
          </button>

          <button
            @click="createAssignment"
            class="action-card bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 fade-in-up"
            style="animation-delay: 0.3s"
          >
            <span class="text-3xl mb-2">📝</span>
            <span class="font-bold">課題作成</span>
            <span class="text-sm opacity-80">新しい学習課題を作成</span>
          </button>

          <button
            @click="generateReport"
            class="action-card bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 fade-in-up"
            style="animation-delay: 0.4s"
          >
            <span class="text-3xl mb-2">📋</span>
            <span class="font-bold">レポート生成</span>
            <span class="text-sm opacity-80">学習分析レポート</span>
          </button>
        </div>
      </section>

      <!-- Game Selection for Students -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span class="text-3xl">🎮</span>
          学習ゲーム選択
          <span class="text-sm font-normal text-slate-400">（生徒誘導用）</span>
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <button
            @click="launchGameForStudents('phonics')"
            class="game-selection-card bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30 fade-in-up"
            style="animation-delay: 0.1s"
          >
            <span class="text-3xl mb-2">🎵</span>
            <span class="font-bold text-sm">音韻学習</span>
            <span class="text-xs opacity-80">Phonics Adventure</span>
          </button>

          <button
            @click="launchGameForStudents('grammar')"
            class="game-selection-card bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30 fade-in-up"
            style="animation-delay: 0.2s"
          >
            <span class="text-3xl mb-2">🌌</span>
            <span class="font-bold text-sm">文法銀河</span>
            <span class="text-xs opacity-80">Grammar Galaxy</span>
          </button>

          <button
            @click="launchGameForStudents('vocabulary')"
            class="game-selection-card bg-green-500/20 border-green-500/30 hover:bg-green-500/30 fade-in-up"
            style="animation-delay: 0.3s"
          >
            <span class="text-3xl mb-2">📚</span>
            <span class="font-bold text-sm">語彙学習</span>
            <span class="text-xs opacity-80">Vocabulary World</span>
          </button>

          <button
            @click="launchGameForStudents('typing')"
            class="game-selection-card bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30 fade-in-up"
            style="animation-delay: 0.4s"
          >
            <span class="text-3xl mb-2">⌨️</span>
            <span class="font-bold text-sm">タイピング</span>
            <span class="text-xs opacity-80">Typing Arena</span>
          </button>

          <button
            @click="launchGameForStudents('vr')"
            class="game-selection-card bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/30 fade-in-up"
            style="animation-delay: 0.5s"
          >
            <span class="text-3xl mb-2">🥽</span>
            <span class="font-bold text-sm">VR学習</span>
            <span class="text-xs opacity-80">VR Academy</span>
          </button>
        </div>

        <!-- Game Selection Instructions -->
        <div class="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">💡</span>
            <span class="text-white font-semibold">ゲーム選択機能</span>
          </div>
          <p class="text-sm text-slate-300">
            各ボタンをクリックすると、選択したゲームの詳細情報とURL が表示されます。
            生徒にURLを共有することで、特定のゲームに誘導できます。
          </p>
        </div>
      </section>

      <!-- Student Management -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span class="text-3xl">👨‍🎓</span>
          生徒管理
        </h2>

        <div class="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="student in students"
              :key="student.id"
              class="student-card fade-in-up"
              :style="{ animationDelay: `${student.id * 0.1}s` }"
            >
              <div class="flex items-center gap-3 mb-3">
                <div class="text-2xl">{{ student.avatar }}</div>
                <div class="flex-1">
                  <div class="font-bold text-white">{{ student.name }}</div>
                  <div class="text-sm text-slate-400">レベル {{ student.level }}</div>
                </div>
                <div
                  class="w-2 h-2 rounded-full"
                  :class="student.isOnline ? 'bg-green-400' : 'bg-gray-400'"
                ></div>
              </div>

              <div class="mb-3">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-400">今日の進捗</span>
                  <span class="text-white">{{ student.todayProgress }}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                    :style="{ width: `${student.todayProgress}%` }"
                  ></div>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-400">最終ログイン</span>
                <span class="text-sm text-white">{{ student.lastSeen }}</span>
              </div>

              <button
                @click="startIndividualSession(student)"
                :disabled="!student.isOnline"
                class="w-full mt-3 py-2 px-4 rounded-lg text-sm font-bold transition-all"
                :class="student.isOnline
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'"
              >
                {{ student.isOnline ? '個別指導開始' : 'オフライン' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activities -->
      <section>
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span class="text-3xl">📝</span>
          最近のアクティビティ
        </h2>

        <div class="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg fade-in-up"
              :style="{ animationDelay: `${activity.id * 0.1}s` }"
            >
              <div class="text-2xl">{{ activity.icon }}</div>
              <div class="flex-1">
                <div class="font-bold text-white">{{ activity.title }}</div>
                <div class="text-sm text-slate-400">{{ activity.description }}</div>
              </div>
              <div class="text-sm text-slate-400">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import firebaseProgressService from '@/services/firebaseProgressService'
import logger from '@/utils/logger'

export default {
  name: 'DashboardTeacher',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    // リアクティブデータ（Firebaseから取得）
    const students = ref([])
    const isLoading = ref(true)

    // 計算されたプロパティ
    const activeStudents = computed(() =>
      students.value.filter(s => s.isOnline).length
    )

    const completedMissions = computed(() =>
      students.value.reduce((total, s) => total + (s.todayMissions || 0), 0)
    )

    const collaborativeSessions = computed(() => 0) // 今日の協力セッション数

    const averageProgress = computed(() => {
      if (students.value.length === 0) return 0
      const totalProgress = students.value.reduce((sum, s) => sum + (s.todayProgress || 0), 0)
      return Math.round(totalProgress / students.value.length)
    })

    const isActiveSession = ref(false)

    // Firebase から取得するデータ
    const recentActivities = ref([])

    // Firebaseからデータを読み込む
    const loadTeacherData = async () => {
      try {
        if (!authStore.currentUser?.uid) {
          logger.warn('No teacher user available')
          return
        }

        isLoading.value = true

        // 生徒リストを取得
        const studentsList = await firebaseProgressService.getStudentsList(authStore.currentUser.uid)
        students.value = studentsList.map(student => ({
          ...student,
          avatar: student.name ? (student.name.includes('花') || student.name.includes('美') || student.name.includes('あ') ? '👧' : '👦') : '👤',
          todayProgress: Math.floor((student.totalExp || 0) / 10) % 100, // 進捗の計算
          todayMissions: Math.floor((student.totalExp || 0) / 50), // 完了ミッション数の計算
          lastSeen: student.isOnline ? 'オンライン' : student.lastActive ? formatLastSeen(student.lastActive) : '不明'
        }))

        logger.log(`📊 Loaded ${studentsList.length} students for teacher dashboard`)

      } catch (error) {
        logger.error('Failed to load teacher data:', error)
      } finally {
        isLoading.value = false
      }
    }

    // 最終ログイン時刻をフォーマット
    const formatLastSeen = (timestamp) => {
      if (!timestamp) return '不明'

      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))

      if (minutes < 1) return '今'
      if (minutes < 60) return `${minutes}分前`

      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}時間前`

      const days = Math.floor(hours / 24)
      return `${days}日前`
    }

    // メソッド
    const startCollaborativeSession = () => {
      logger.log('🚀 Starting collaborative session')
      router.push({ name: 'CoPilotDock' })
    }

    const viewStudentProgress = () => {
      logger.log('📊 Viewing student progress')
      // 進捗確認画面への遷移
      alert('生徒進捗確認機能は開発中です。\n\n📊 実装予定機能:\n• 個別学習進捗\n• 習熟度分析\n• 学習時間統計\n• 課題達成率')
    }

    const createAssignment = () => {
      logger.log('📝 Creating assignment')
      alert('課題作成機能は開発中です。\n\n📝 実装予定機能:\n• カスタム課題作成\n• 難易度設定\n• 期限管理\n• 評価基準設定')
    }

    const generateReport = () => {
      logger.log('📋 Generating report')
      alert('レポート生成機能は開発中です。\n\n📋 実装予定機能:\n• 学習分析レポート\n• 進捗比較グラフ\n• 推奨学習プラン\n• 保護者向けサマリー')
    }

    const startIndividualSession = (student) => {
      if (!student.isOnline) return

      logger.log(`👨‍🏫 Starting individual session with ${student.name}`)
      alert(`${student.name}との個別指導セッションを開始します。\n\n🎯 現在の進捗: ${student.todayProgress}%\n📚 レベル: ${student.level}`)
    }

    const launchGameForStudents = (gameType) => {
      const gameInfo = {
        phonics: {
          title: '音韻学習 - Phonics Adventure',
          description: 'フォニックスと音韻認識の基礎学習',
          url: `${window.location.origin}/platforms/phonics-adventure`,
          icon: '🎵',
          features: ['音韻認識', 'フォニックス', '発音練習', '聞き分けゲーム']
        },
        grammar: {
          title: '文法銀河 - Grammar Galaxy',
          description: '英文法を宇宙冒険ゲームで学習',
          url: `${window.location.origin}/grammar-galaxy`,
          icon: '🌌',
          features: ['文法パターン', '動詞活用', '語順練習', '文章構成']
        },
        vocabulary: {
          title: '語彙学習 - Vocabulary World',
          description: '語彙力を楽しく伸ばす学習ワールド',
          url: `${window.location.origin}/platforms/vocabulary-world`,
          icon: '📚',
          features: ['単語学習', '語彙テスト', '記憶ゲーム', '語彙クイズ']
        },
        typing: {
          title: 'タイピング - Typing Arena',
          description: '英語タイピングスキル向上アリーナ',
          url: `${window.location.origin}/platforms/typing-arena`,
          icon: '⌨️',
          features: ['タイピング速度', '正確性向上', 'キーボード練習', '単語入力']
        },
        vr: {
          title: 'VR学習 - VR Academy',
          description: 'バーチャルリアリティで没入学習',
          url: `${window.location.origin}/vr-academy`,
          icon: '🥽',
          features: ['VR体験', '3D学習', '没入型授業', 'バーチャル教室']
        }
      }

      const game = gameInfo[gameType]
      if (!game) return

      logger.log(`🎮 Launching ${game.title} for students`)

      // ゲーム情報をポップアップで表示
      const featuresList = game.features.map(f => `• ${f}`).join('\n')
      const message = `${game.icon} ${game.title}\n\n📖 ${game.description}\n\n🔗 URL:\n${game.url}\n\n✨ 主な機能:\n${featuresList}\n\n💡 このURLを生徒に共有してください。\n生徒はこのURLから直接ゲームにアクセスできます。`

      // URLをクリップボードにコピー
      if (navigator.clipboard) {
        navigator.clipboard.writeText(game.url).then(() => {
          alert(`${message}\n\n📋 URLがクリップボードにコピーされました！`)
        }).catch(() => {
          alert(message)
        })
      } else {
        alert(message)
      }

      // オプション：新しいタブでゲームを開く
      const openGame = confirm('ゲームを新しいタブで開きますか？\n（プレビュー用）')
      if (openGame) {
        window.open(game.url, '_blank')
      }
    }

    onMounted(async () => {
      logger.log('👨‍🏫 Teacher dashboard loading...')
      await loadTeacherData()
      logger.log('👨‍🏫 Teacher dashboard loaded')
    })

    return {
      activeStudents,
      completedMissions,
      collaborativeSessions,
      averageProgress,
      isActiveSession,
      students,
      recentActivities,
      isLoading,
      loadTeacherData,
      startCollaborativeSession,
      viewStudentProgress,
      createAssignment,
      generateReport,
      startIndividualSession,
      launchGameForStudents
    }
  }
}
</script>

<style scoped>
.stats-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.action-card {
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  color: white;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.game-selection-card {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  color: white;
  background: rgba(15, 23, 42, 0.7);
}

.game-selection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.student-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.student-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .stats-card,
  .action-card {
    padding: 1rem;
  }

  .student-card {
    padding: 0.75rem;
  }
}
</style>