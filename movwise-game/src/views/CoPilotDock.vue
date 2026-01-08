<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Back Button -->
          <button
            @click="$router.push('/dashboard/teacher')"
            class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
          >
            <span class="text-xl">←</span>
            <span class="text-sm text-slate-300">ダッシュボードに戻る</span>
          </button>

          <!-- Title -->
          <div class="text-center">
            <h1 class="text-2xl font-bold text-white">🤝 協力学習セッション</h1>
            <p class="text-sm text-slate-400">リアルタイム共同学習管理</p>
          </div>

          <!-- Status -->
          <div class="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-green-400 font-medium text-sm">オンライン</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 py-8">

      <!-- Quick Session Start -->
      <section class="mb-8">
        <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-blue-500/30 rounded-2xl p-6">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-white mb-2">🚀 クイック協力セッション開始</h2>
            <p class="text-slate-300">ワンクリックで生徒との協力学習を始めましょう</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              @click="startQuickSession('phonics')"
              class="session-card bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
            >
              <span class="text-2xl mb-2">🎵</span>
              <span class="font-bold">音韻協力学習</span>
              <span class="text-xs opacity-80">フォニックス・発音練習</span>
            </button>

            <button
              @click="startQuickSession('grammar')"
              class="session-card bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
            >
              <span class="text-2xl mb-2">🌌</span>
              <span class="font-bold">文法協力学習</span>
              <span class="text-xs opacity-80">Grammar Galaxy</span>
            </button>

            <button
              @click="startQuickSession('vocabulary')"
              class="session-card bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
            >
              <span class="text-2xl mb-2">📚</span>
              <span class="font-bold">語彙協力学習</span>
              <span class="text-xs opacity-80">Vocabulary World</span>
            </button>
          </div>

          <div class="text-center">
            <button
              @click="startCustomSession"
              class="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg transition-all text-yellow-300 font-bold"
            >
              ⚙️ カスタムセッション設定
            </button>
          </div>
        </div>
      </section>

      <!-- Active Sessions -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-2xl">📊</span>
          アクティブセッション
        </h2>

        <div v-if="activeSessions.length === 0" class="bg-slate-800/60 border border-slate-700 rounded-lg p-6 text-center">
          <div class="text-4xl mb-3">😴</div>
          <p class="text-slate-400">現在アクティブなセッションはありません</p>
          <p class="text-sm text-slate-500 mt-1">上記のボタンから新しいセッションを開始しましょう</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="session in activeSessions"
            :key="session.id"
            class="bg-slate-800/60 border border-slate-700 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ session.icon }}</span>
                <div>
                  <h3 class="text-white font-semibold">{{ session.title }}</h3>
                  <p class="text-sm text-slate-400">{{ session.students.length }}名参加中 • {{ session.duration }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="joinSession(session)"
                  class="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 text-sm font-bold transition-all"
                >
                  参加
                </button>
                <button
                  @click="endSession(session)"
                  class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 text-sm font-bold transition-all"
                >
                  終了
                </button>
              </div>
            </div>

            <!-- Session participants -->
            <div v-if="session.students.length > 0" class="mt-3 pt-3 border-t border-slate-700">
              <p class="text-xs text-slate-400 mb-2">参加生徒:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="student in session.students"
                  :key="student.id"
                  class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                >
                  {{ student.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Session History -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-2xl">📝</span>
          最近の協力セッション
        </h2>

        <div class="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
          <div class="space-y-3">
            <div
              v-for="historyItem in sessionHistory"
              :key="historyItem.id"
              class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ historyItem.icon }}</span>
                <div>
                  <p class="text-white font-medium">{{ historyItem.title }}</p>
                  <p class="text-xs text-slate-400">{{ historyItem.date }} • {{ historyItem.duration }} • {{ historyItem.participants }}名参加</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold text-green-400">{{ historyItem.successRate }}%</div>
                <div class="text-xs text-slate-400">成功率</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Session Management Tools -->
      <section class="mb-8">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span class="text-2xl">🛠️</span>
          セッション管理ツール
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="openStudentMonitor"
            class="management-tool bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
          >
            <span class="text-2xl mb-2">👁️</span>
            <span class="font-bold">生徒モニタリング</span>
            <span class="text-xs opacity-80">リアルタイム学習状況確認</span>
          </button>

          <button
            @click="scheduleSession"
            class="management-tool bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
          >
            <span class="text-2xl mb-2">📅</span>
            <span class="font-bold">セッション予約</span>
            <span class="text-xs opacity-80">事前予約・スケジュール管理</span>
          </button>

          <button
            @click="viewAnalytics"
            class="management-tool bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
          >
            <span class="text-2xl mb-2">📈</span>
            <span class="font-bold">学習分析</span>
            <span class="text-xs opacity-80">効果測定・進捗レポート</span>
          </button>
        </div>
      </section>

    </main>

    <!-- Session Creation Modal -->
    <div v-if="showSessionModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" @click="closeSessionModal">
      <div class="max-w-md mx-4 bg-slate-800/95 border border-slate-600 rounded-2xl p-6" @click.stop>
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-white mb-2">{{ modalData.title }}</h3>
          <p class="text-slate-400">{{ modalData.description }}</p>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm text-slate-300 mb-2">セッション名</label>
            <input
              v-model="sessionName"
              class="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
              placeholder="例: 午後の音韻練習"
            >
          </div>

          <div>
            <label class="block text-sm text-slate-300 mb-2">参加生徒を選択</label>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <label
                v-for="student in availableStudents"
                :key="student.id"
                class="flex items-center gap-2 p-2 bg-slate-700/30 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  v-model="selectedStudents"
                  :value="student.id"
                  class="rounded"
                >
                <span class="text-white">{{ student.name }}</span>
                <span class="text-xs text-slate-400">({{ student.level }})</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeSessionModal"
            class="flex-1 py-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 font-bold transition-all"
          >
            キャンセル
          </button>
          <button
            @click="createSession"
            class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold transition-all"
          >
            セッション開始
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logger from '@/utils/logger'

export default {
  name: 'CoPilotDock',
  setup() {
    const router = useRouter()

    // Reactive state
    const showSessionModal = ref(false)
    const sessionName = ref('')
    const selectedStudents = ref([])

    const modalData = ref({
      type: '',
      title: '',
      description: ''
    })

    // Mock data
    const activeSessions = ref([
      // Currently empty - will be populated when sessions are created
    ])

    const sessionHistory = ref([
      {
        id: 1,
        title: '音韻協力学習セッション',
        icon: '🎵',
        date: '今日 14:30',
        duration: '25分',
        participants: 3,
        successRate: 92
      },
      {
        id: 2,
        title: '文法協力学習セッション',
        icon: '🌌',
        date: '今日 13:00',
        duration: '30分',
        participants: 5,
        successRate: 88
      },
      {
        id: 3,
        title: '語彙協力学習セッション',
        icon: '📚',
        date: '昨日 15:45',
        duration: '20分',
        participants: 4,
        successRate: 95
      }
    ])

    const availableStudents = ref([
      { id: 1, name: '田中花音', level: 'レベル 3' },
      { id: 2, name: '佐藤健太', level: 'レベル 2' },
      { id: 3, name: '山田美咲', level: 'レベル 4' },
      { id: 4, name: '鈴木大輝', level: 'レベル 2' },
      { id: 5, name: '高橋あゆみ', level: 'レベル 3' }
    ])

    // Methods
    const startQuickSession = (type) => {
      const gameTypes = {
        phonics: {
          title: '音韻協力学習セッション',
          description: 'フォニックスと発音練習を協力して学習',
          icon: '🎵'
        },
        grammar: {
          title: '文法協力学習セッション',
          description: '英文法を楽しく協力学習',
          icon: '🌌'
        },
        vocabulary: {
          title: '語彙協力学習セッション',
          description: '語彙力向上を協力して取り組み',
          icon: '📚'
        }
      }

      modalData.value = {
        type,
        ...gameTypes[type]
      }

      sessionName.value = gameTypes[type].title
      showSessionModal.value = true
    }

    const startCustomSession = () => {
      modalData.value = {
        type: 'custom',
        title: 'カスタム協力セッション',
        description: '自由に学習内容を設定した協力セッション'
      }
      sessionName.value = ''
      showSessionModal.value = true
    }

    const createSession = () => {
      if (!sessionName.value || selectedStudents.value.length === 0) {
        alert('セッション名と参加生徒を選択してください')
        return
      }

      // Create new session
      const newSession = {
        id: Date.now(),
        title: sessionName.value,
        icon: modalData.value.icon || '🎯',
        type: modalData.value.type,
        students: availableStudents.value.filter(s => selectedStudents.value.includes(s.id)),
        duration: '0分',
        startTime: new Date()
      }

      activeSessions.value.push(newSession)

      logger.log(`🚀 Created new session: ${newSession.title} with ${newSession.students.length} students`)

      // Close modal and reset
      closeSessionModal()

      // Show success message
      alert(`✅ セッション「${newSession.title}」を開始しました！\n参加生徒: ${newSession.students.map(s => s.name).join(', ')}`)
    }

    const closeSessionModal = () => {
      showSessionModal.value = false
      sessionName.value = ''
      selectedStudents.value = []
      modalData.value = { type: '', title: '', description: '' }
    }

    const joinSession = (session) => {
      logger.log(`👨‍🏫 Joining session: ${session.title}`)
      alert(`🎯 セッション「${session.title}」に参加しました！\n\n実際のゲーム機能は各学習プラットフォーム内で実装されます:\n• 音韻学習: Phonics Adventure\n• 文法学習: Grammar Galaxy\n• 語彙学習: Vocabulary World`)
    }

    const endSession = (session) => {
      const index = activeSessions.value.findIndex(s => s.id === session.id)
      if (index !== -1) {
        // Calculate session duration
        const duration = Math.floor((new Date() - session.startTime) / 60000)

        // Move to history
        sessionHistory.value.unshift({
          id: session.id,
          title: session.title,
          icon: session.icon,
          date: '今',
          duration: `${duration}分`,
          participants: session.students.length,
          successRate: Math.floor(Math.random() * 20 + 80) // Mock success rate
        })

        // Remove from active sessions
        activeSessions.value.splice(index, 1)

        logger.log(`🏁 Ended session: ${session.title}`)
        alert(`✅ セッション「${session.title}」を終了しました`)
      }
    }

    const openStudentMonitor = () => {
      alert('👁️ 生徒モニタリング機能\n\n開発予定機能:\n• リアルタイム学習進捗表示\n• 個別生徒の詳細状況\n• 学習困難度の検出\n• 個別サポート提案')
    }

    const scheduleSession = () => {
      alert('📅 セッション予約機能\n\n開発予定機能:\n• 日時指定での予約\n• 定期セッション設定\n• 生徒の空き状況確認\n• 自動リマインダー')
    }

    const viewAnalytics = () => {
      alert('📈 学習分析機能\n\n開発予定機能:\n• セッション効果測定\n• 学習進捗グラフ\n• 協力学習効果分析\n• 改善提案レポート')
    }

    onMounted(() => {
      logger.log('🤝 CoPilot Dock loaded - Simplified collaborative learning interface')
    })

    return {
      // State
      showSessionModal,
      sessionName,
      selectedStudents,
      modalData,
      activeSessions,
      sessionHistory,
      availableStudents,

      // Methods
      startQuickSession,
      startCustomSession,
      createSession,
      closeSessionModal,
      joinSession,
      endSession,
      openStudentMonitor,
      scheduleSession,
      viewAnalytics
    }
  }
}
</script>

<style scoped>
/* Session Cards */
.session-card {
  @apply p-4 rounded-lg border transition-all duration-300 cursor-pointer text-center;
  @apply flex flex-col items-center gap-1 text-white;
}

.session-card:hover {
  @apply transform -translate-y-1 shadow-lg;
}

/* Management Tools */
.management-tool {
  @apply p-6 rounded-lg border transition-all duration-300 cursor-pointer text-center;
  @apply flex flex-col items-center gap-1 text-white;
}

.management-tool:hover {
  @apply transform -translate-y-1 shadow-lg;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .session-card,
  .management-tool {
    @apply p-3;
  }
}
</style>