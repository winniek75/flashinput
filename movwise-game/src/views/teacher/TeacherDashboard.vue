<template>
  <div class="teacher-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            <div v-if="activeCollaborativeSession" class="flex items-center gap-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
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
              <div class="text-2xl">{{ teacherInfo.avatar }}</div>
              <div class="text-left">
                <div class="text-white font-medium">{{ teacherInfo.name }}</div>
                <div class="text-xs text-slate-400">{{ teacherInfo.title }}</div>
              </div>
            </div>

            <!-- Settings -->
            <button class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <span class="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <!-- Quick Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Today's Sessions -->
        <div class="dashboard-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm">今日のセッション</p>
              <p class="text-3xl font-bold text-white">{{ dashboardStats.todaySessions }}</p>
            </div>
            <div class="text-3xl opacity-60">📊</div>
          </div>
          <div class="mt-2 text-sm text-green-400">
            +{{ dashboardStats.sessionsIncrease }}% 昨日比
          </div>
        </div>

        <!-- Active Students -->
        <div class="dashboard-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm">アクティブ生徒</p>
              <p class="text-3xl font-bold text-white">{{ dashboardStats.activeStudents }}</p>
            </div>
            <div class="text-3xl opacity-60">👥</div>
          </div>
          <div class="mt-2 text-sm text-blue-400">
            現在オンライン中
          </div>
        </div>

        <!-- Emergency Calls -->
        <div class="dashboard-card border-red-500/30 bg-red-900/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-400 text-sm">緊急コール</p>
              <p class="text-3xl font-bold text-red-400">{{ dashboardStats.emergencyCalls }}</p>
            </div>
            <div class="text-3xl opacity-60">🚨</div>
          </div>
          <div class="mt-2 text-sm text-red-300">
            {{ dashboardStats.emergencyCalls > 0 ? '対応が必要です' : '問題なし' }}
          </div>
        </div>

        <!-- Average Score -->
        <div class="dashboard-card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm">平均スコア</p>
              <p class="text-3xl font-bold text-white">{{ dashboardStats.averageScore }}%</p>
            </div>
            <div class="text-3xl opacity-60">⭐</div>
          </div>
          <div class="mt-2 text-sm text-yellow-400">
            協力学習効果
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Left Column: Active Sessions & Emergency Panel -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Active Sessions -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-white mb-4">アクティブセッション</h3>
            <div v-if="activeSessions.length === 0" class="text-center py-8 text-slate-400">
              <div class="text-4xl mb-2">💤</div>
              <p>現在アクティブなセッションはありません</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="session in activeSessions"
                :key="session.id"
                class="p-4 bg-slate-700/50 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="text-2xl">{{ session.studentAvatar }}</div>
                    <div>
                      <div class="font-medium text-white">{{ session.studentName }}</div>
                      <div class="text-sm text-slate-400">{{ session.mission }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="handleJoinSession(session)"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      参加
                    </button>
                    <button 
                      @click="handleEndSession(session.id)"
                      class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      終了
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Monitoring -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-white mb-4">生徒モニタリング</h3>
            <div v-if="activeStudents.length === 0" class="text-center py-8 text-slate-400">
              <div class="text-4xl mb-2">👥</div>
              <p>現在オンラインの生徒はいません</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="student in activeStudents"
                :key="student.id"
                class="p-4 bg-slate-700/50 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="text-2xl">{{ student.avatar }}</div>
                    <div>
                      <div class="font-medium text-white">{{ student.name }}</div>
                      <div class="text-sm text-slate-400">{{ student.currentActivity }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button 
                      @click="handleViewStudent(student)"
                      class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                    >
                      詳細
                    </button>
                    <button 
                      @click="handleSendMessage(student)"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      メッセージ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Emergency Panel & Analytics -->
        <div class="space-y-6">
          <!-- Emergency Panel -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-white mb-4">緊急コール</h3>
            <div v-if="emergencyCalls.length === 0" class="text-center py-8 text-slate-400">
              <div class="text-4xl mb-2">✅</div>
              <p>緊急コールはありません</p>
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="call in emergencyCalls"
                :key="call.id"
                class="p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium text-red-400">{{ call.studentName }}</div>
                  <div class="text-xs text-red-300">{{ call.type }}</div>
                </div>
                <div class="text-sm text-slate-300 mb-3">{{ call.message }}</div>
                <div class="flex gap-2">
                  <button 
                    @click="handleRespondToCall(call)"
                    class="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    対応
                  </button>
                  <button 
                    @click="handleDismissCall(call.id)"
                    class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
                  >
                    却下
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Basic Analytics -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-white mb-4">基本分析</h3>
            <div class="space-y-4">
              <div>
                <h4 class="text-sm font-medium text-slate-400 mb-2">今週のセッション数</h4>
                <div class="flex justify-between text-sm">
                  <span class="text-slate-300">今週: {{ analyticsData.sessionTrends.slice(-1)[0]?.sessions || 0 }}</span>
                  <span class="text-green-400">+12%</span>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium text-slate-400 mb-2">人気ミッション</h4>
                <div class="space-y-1">
                  <div 
                    v-for="mission in analyticsData.topMissions.slice(0, 3)"
                    :key="mission.name"
                    class="flex justify-between text-sm"
                  >
                    <span class="text-slate-300">{{ mission.name }}</span>
                    <span class="text-yellow-400">{{ mission.completions }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-card">
            <h3 class="text-lg font-semibold text-white mb-4">クイックアクション</h3>
            <div class="space-y-3">
              <!-- Spectator Session Controls -->
              <button
                v-if="!spectatorRoomCode"
                @click="createSpectatorRoom"
                :disabled="isCreatingRoom"
                class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              >
                <span class="text-xl">👁️</span>
                {{ isCreatingRoom ? '作成中...' : '観戦ルーム作成' }}
              </button>

              <div v-if="spectatorRoomCode" class="space-y-2">
                <div class="p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
                  <div class="text-sm text-indigo-300 mb-1">観戦ルーム</div>
                  <div class="text-white font-medium text-lg">コード: {{ spectatorRoomCode }}</div>
                  <div class="text-xs text-indigo-200">生徒にこのコードを共有してください</div>
                </div>
                <button
                  @click="closeSpectatorRoom"
                  class="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  <span class="text-xl">⏹️</span>
                  ルームを閉じる
                </button>
              </div>

              <!-- Game Launch Section -->
              <div v-if="spectatorRoomCode" class="border-t border-slate-600 pt-3">
                <h4 class="text-sm font-semibold text-slate-400 mb-2">学習ゲーム起動</h4>

                <button
                  @click="launchHandwritingDictation"
                  class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-colors"
                >
                  <span class="text-xl">✍️</span>
                  手書きディクテーション
                </button>

                <button
                  @click="launchWordDictation"
                  class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-medium transition-colors mt-2"
                >
                  <span class="text-xl">📝</span>
                  タイピングディクテーション
                </button>

                <button
                  @click="launchTypingArena"
                  class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-white font-medium transition-colors mt-2"
                >
                  <span class="text-xl">⌨️</span>
                  タイピングアリーナ
                </button>

                <button
                  @click="launchGrammarGalaxy"
                  class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg text-white font-medium transition-colors mt-2"
                >
                  <span class="text-xl">🌌</span>
                  文法ギャラクシー
                </button>
              </div>

              <!-- Collaborative Session Controls (Legacy) -->
              <div class="border-t border-slate-600 pt-3">
                <button
                  v-if="!activeCollaborativeSession"
                  @click="startCollaborativeSession"
                  :disabled="isCreatingSession"
                  class="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  <span class="text-xl">🤝</span>
                  {{ isCreatingSession ? '作成中...' : '協力学習セッション開始' }}
                </button>

                <div v-if="activeCollaborativeSession" class="space-y-2">
                  <div class="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <div class="text-sm text-blue-300 mb-1">協力セッション</div>
                    <div class="text-white font-medium">{{ activeCollaborativeSession.subject }}</div>
                    <div class="text-xs text-blue-200">参加者: {{ connectedStudents.length }}名</div>
                  </div>
                  <button
                    @click="endCollaborativeSession"
                    class="w-full flex items-center gap-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                  >
                    <span class="text-xl">⏹️</span>
                    セッション終了
                  </button>
                </div>
              </div>

              <button
                @click="startNewSession"
                class="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <span class="text-xl">🚀</span>
                新しいセッション開始
              </button>

              <button
                @click="reviewStudentProgress"
                class="w-full flex items-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              >
                <span class="text-xl">📈</span>
                生徒進捗レビュー
              </button>

              <button
                @click="generateReport"
                class="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                <span class="text-xl">📊</span>
                レポート生成
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Session Modal (if needed) -->
    <div v-if="showSessionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-white mb-4">セッション詳細</h3>
        <!-- Session details content -->
        <div class="flex gap-3 mt-6">
          <button 
            @click="showSessionModal = false"
            class="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            キャンセル
          </button>
          <button 
            @click="confirmJoinSession"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            参加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import spectatorService from '@/services/spectatorService'
import { useSpectatorStore } from '@/stores/spectatorStore'

// Collaborative session is optional - handle gracefully if not available
let collaborativeSession = null

export default {
  name: 'TeacherDashboard',
  setup() {
    const router = useRouter()
    const spectatorStore = useSpectatorStore()

    // Teacher information
    const teacherInfo = reactive({
      name: 'Captain Sarah',
      title: 'フォニックス専門船長',
      avatar: '👩‍🚀',
      id: 'teacher_001'
    })

    // Spectator room state
    const isCreatingRoom = ref(false)
    const spectatorRoomCode = computed(() => spectatorStore.roomCode)

    // Collaborative session state
    const isCreatingSession = ref(false)
    const sessionStartTime = ref(null)
    
    // Collaborative session computed properties - handle null collaborativeSession
    const sessionState = computed(() => {
      if (!collaborativeSession) {
        return { isConnected: false, participants: [] }
      }
      return collaborativeSession.sessionState
    })
    
    const activeCollaborativeSession = computed(() => {
      if (!collaborativeSession) return null
      return sessionState.value.isConnected ? sessionState.value : null
    })
    
    const connectedStudents = computed(() => {
      if (!collaborativeSession) return []
      return sessionState.value.participants.filter(p => p.role === 'student') || []
    })

    // Dashboard statistics
    const dashboardStats = reactive({
      todaySessions: 8,
      sessionsIncrease: 12,
      activeStudents: 5,
      emergencyCalls: 1,
      averageScore: 94
    })

    // Active sessions data
    const activeSessions = ref([
      {
        id: 'session_001',
        studentName: 'Yuki',
        studentAvatar: '👧',
        mission: 'Sound Radar Command',
        status: 'in_progress',
        duration: '00:15:32',
        difficulty: 'intermediate',
        currentScore: 85,
        stage: 'phonics_blending'
      },
      {
        id: 'session_002',
        studentName: 'Taro',
        studentAvatar: '👦',
        mission: 'Grammar Construction',
        status: 'waiting',
        duration: '00:00:00',
        difficulty: 'beginner',
        currentScore: 0,
        stage: 'be_verb_basics'
      }
    ])

    // Active students data
    const activeStudents = ref([
      {
        id: 'student_001',
        name: 'Yuki',
        avatar: '👧',
        level: 'intermediate',
        currentActivity: 'Sound Radar Command',
        score: 85,
        status: 'active',
        timeOnline: '00:23:45',
        needsHelp: false
      },
      {
        id: 'student_002',
        name: 'Taro',
        avatar: '👦',
        level: 'beginner',
        currentActivity: 'Waiting for session',
        score: 0,
        status: 'waiting',
        timeOnline: '00:02:15',
        needsHelp: false
      },
      {
        id: 'student_003',
        name: 'Hanako',
        avatar: '👩',
        level: 'advanced',
        currentActivity: 'Grammar Construction',
        score: 92,
        status: 'active',
        timeOnline: '00:18:22',
        needsHelp: true
      }
    ])

    // Emergency calls data
    const emergencyCalls = ref([
      {
        id: 'emergency_001',
        studentId: 'student_003',
        studentName: 'Hanako',
        type: 'help_request',
        message: 'Grammar Construction で詰まっています',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        priority: 'medium'
      }
    ])

    // Analytics data
    const analyticsData = reactive({
      sessionTrends: [
        { date: '6/10', sessions: 6 },
        { date: '6/11', sessions: 7 },
        { date: '6/12', sessions: 8 },
        { date: '6/13', sessions: 9 },
        { date: '6/14', sessions: 8 }
      ],
      topMissions: [
        { name: 'Sound Radar Command', completions: 15 },
        { name: 'Grammar Construction', completions: 12 },
        { name: 'Phonics Lab', completions: 8 }
      ],
      studentProgress: {
        totalStudents: 25,
        activeToday: 8,
        averageImprovement: 15
      }
    })

    // Modal state
    const showSessionModal = ref(false)
    const selectedSession = ref(null)

    // Real-time data update interval
    let updateInterval = null

    // Methods
    const handleJoinSession = (session) => {
      logger.log('Joining session:', session)
      selectedSession.value = session
      showSessionModal.value = true
    }

    const confirmJoinSession = () => {
      if (selectedSession.value) {
        alert(`🚀 ${selectedSession.value.studentName}とのセッションに参加します！\n\nミッション: ${selectedSession.value.mission}`)
        showSessionModal.value = false
        selectedSession.value = null
      }
    }

    const handleEndSession = (sessionId) => {
      const session = activeSessions.value.find(s => s.id === sessionId)
      if (session) {
        const confirmed = confirm(`${session.studentName}とのセッションを終了しますか？`)
        if (confirmed) {
          activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
          alert('セッションが終了しました。')
        }
      }
    }

    const handleViewStudent = (student) => {
      logger.log('Viewing student details:', student)
      alert(`👤 ${student.name}の詳細情報\n\nレベル: ${student.level}\n現在のアクティビティ: ${student.currentActivity}\nスコア: ${student.score}%\nオンライン時間: ${student.timeOnline}`)
    }

    const handleSendMessage = (student) => {
      const message = prompt(`${student.name}にメッセージを送信:`)
      if (message) {
        alert(`✉️ ${student.name}にメッセージを送信しました: "${message}"`)
      }
    }

    const handleRespondToCall = (call) => {
      logger.log('Responding to emergency call:', call)
      alert(`🚨 ${call.studentName}の緊急コールに対応します\n\n問題: ${call.message}`)
      
      // Remove the call after responding
      emergencyCalls.value = emergencyCalls.value.filter(c => c.id !== call.id)
      dashboardStats.emergencyCalls = emergencyCalls.value.length
    }

    const handleDismissCall = (callId) => {
      emergencyCalls.value = emergencyCalls.value.filter(c => c.id !== callId)
      dashboardStats.emergencyCalls = emergencyCalls.value.length
    }

    const startNewSession = () => {
      alert('🚀 新しいセッションを開始します\n\n待機中の生徒とマッチングを行います...')
    }

    const reviewStudentProgress = () => {
      alert('📈 生徒進捗レビュー\n\n詳細な学習分析データを表示します...')
    }

    const generateReport = () => {
      alert('📊 レポート生成\n\n今日の活動レポートを作成します...')
    }

    // Spectator room methods
    const createSpectatorRoom = async () => {
      try {
        isCreatingRoom.value = true

        // Connect to spectator service
        await spectatorService.connect()

        // Create room as teacher
        const roomData = await spectatorService.createRoom(teacherInfo.id, teacherInfo.name)

        alert(`👁️ 観戦ルームが作成されました！\n\nルームコード: ${roomData.roomCode}\n\n生徒にこのコードを共有してゲームに参加してもらってください。`)

      } catch (error) {
        logger.error('Failed to create spectator room:', error)
        alert('観戦ルームの作成に失敗しました: ' + error.message)
      } finally {
        isCreatingRoom.value = false
      }
    }

    const closeSpectatorRoom = () => {
      if (spectatorStore.isConnected) {
        spectatorService.leaveRoom()
        spectatorService.disconnect()
        alert('観戦ルームを閉じました。')
      }
    }

    const launchHandwritingDictation = () => {
      if (!spectatorRoomCode.value) {
        alert('先に観戦ルームを作成してください。')
        return
      }

      const teacherUrl = `/handwriting-dictation?roomCode=${spectatorRoomCode.value}&role=teacher&name=${encodeURIComponent(teacherInfo.name)}`
      const studentUrl = `/handwriting-dictation?roomCode=${spectatorRoomCode.value}&role=student`

      // 講師画面を開く
      router.push(teacherUrl)

      // 生徒用URLをクリップボードにコピー
      navigator.clipboard.writeText(`${window.location.origin}${studentUrl}`)
      alert(`手書きディクテーションゲームを開始しました。\n\n生徒用URLがクリップボードにコピーされました。\n生徒に共有してください。`)
    }

    const launchWordDictation = () => {
      if (!spectatorRoomCode.value) {
        alert('先に観戦ルームを作成してください。')
        return
      }

      const teacherUrl = `/games/word-dictation-challenge?roomCode=${spectatorRoomCode.value}&role=teacher&name=${encodeURIComponent(teacherInfo.name)}`
      const studentUrl = `/games/word-dictation-challenge?roomCode=${spectatorRoomCode.value}&role=student`

      router.push(teacherUrl)

      navigator.clipboard.writeText(`${window.location.origin}${studentUrl}`)
      alert(`タイピングディクテーションゲームを開始しました。\n\n生徒用URLがクリップボードにコピーされました。`)
    }

    const launchTypingArena = () => {
      if (!spectatorRoomCode.value) {
        alert('先に観戦ルームを作成してください。')
        return
      }

      const teacherUrl = `/typing-arena?roomCode=${spectatorRoomCode.value}&role=teacher&name=${encodeURIComponent(teacherInfo.name)}`
      const studentUrl = `/typing-arena?roomCode=${spectatorRoomCode.value}&role=student`

      router.push(teacherUrl)

      navigator.clipboard.writeText(`${window.location.origin}${studentUrl}`)
      alert(`タイピングアリーナを開始しました。\n\n生徒用URLがクリップボードにコピーされました。`)
    }

    const launchGrammarGalaxy = () => {
      if (!spectatorRoomCode.value) {
        alert('先に観戦ルームを作成してください。')
        return
      }

      const teacherUrl = `/grammar-galaxy?roomCode=${spectatorRoomCode.value}&role=teacher&name=${encodeURIComponent(teacherInfo.name)}`
      const studentUrl = `/grammar-galaxy?roomCode=${spectatorRoomCode.value}&role=student`

      router.push(teacherUrl)

      navigator.clipboard.writeText(`${window.location.origin}${studentUrl}`)
      alert(`文法ギャラクシーを開始しました。\n\n生徒用URLがクリップボードにコピーされました。`)
    }

    // Collaborative session methods
    const startCollaborativeSession = async () => {
      if (!collaborativeSession) {
        alert('協力学習機能は現在利用できません。WebSocketサーバーが起動していることを確認してください。')
        return
      }
      
      try {
        isCreatingSession.value = true
        
        // Initialize collaborative session
        await collaborativeSession.initialize('ws://localhost:3001')
        
        // Create teacher session
        const sessionInfo = await collaborativeSession.createTeacherSession({
          name: teacherInfo.name,
          title: teacherInfo.title,
          avatar: teacherInfo.avatar,
          id: teacherInfo.id,
          subject: 'フォニックス・文法学習'
        })
        
        alert(`🚀 協力学習セッションが開始されました！\n\n招待コード: ${sessionInfo.inviteCode}\n\n生徒にこのコードを教えて、セッションに参加してもらってください。`)
        
        sessionStartTime.value = new Date()

      } catch (error) {
        logger.error('❌ Failed to create session:', error)
        alert('セッションの作成に失敗しました: ' + error.message)
      } finally {
        isCreatingSession.value = false
      }
    }

    const endCollaborativeSession = () => {
      if (collaborativeSession && collaborativeSession.sessionState.isConnected) {
        collaborativeSession.endSession()
      }
      alert('協力学習セッションを終了しました。')
    }

    // Update dashboard data periodically
    const updateDashboardData = () => {
      // Simulate real-time updates
      activeSessions.value.forEach(session => {
        if (session.status === 'in_progress') {
          // Update duration
          const [minutes, seconds] = session.duration.split(':').slice(1).map(Number)
          const newSeconds = seconds + 1
          const newMinutes = minutes + Math.floor(newSeconds / 60)
          session.duration = `00:${String(newMinutes).padStart(2, '0')}:${String(newSeconds % 60).padStart(2, '0')}`
          
          // Occasionally update score
          if (Math.random() < 0.1) {
            session.currentScore = Math.min(100, session.currentScore + Math.floor(Math.random() * 3))
          }
        }
      })

      // Update student online time
      activeStudents.value.forEach(student => {
        if (student.status === 'active' || student.status === 'waiting') {
          const [minutes, seconds] = student.timeOnline.split(':').slice(1).map(Number)
          const newSeconds = seconds + 1
          const newMinutes = minutes + Math.floor(newSeconds / 60)
          student.timeOnline = `00:${String(newMinutes).padStart(2, '0')}:${String(newSeconds % 60).padStart(2, '0')}`
        }
      })
    }

    // Lifecycle
    onMounted(async () => {
      logger.log('🏫 Teacher Dashboard mounted')
      
      // Load collaborative session lazily
      try {
        const module = await import('@/services/collaborativeSession')
        collaborativeSession = module.collaborativeSession
        logger.log('Collaborative session loaded successfully')
      } catch (error) {
        logger.warn('Collaborative session service not available:', error)
      }
      
      updateInterval = setInterval(updateDashboardData, 1000)
    })

    onUnmounted(() => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    })

    return {
      teacherInfo,
      dashboardStats,
      activeSessions,
      activeStudents,
      emergencyCalls,
      analyticsData,
      showSessionModal,
      selectedSession,
      // Spectator room
      isCreatingRoom,
      spectatorRoomCode,
      createSpectatorRoom,
      closeSpectatorRoom,
      launchHandwritingDictation,
      launchWordDictation,
      launchTypingArena,
      launchGrammarGalaxy,
      // Collaborative session
      isCreatingSession,
      activeCollaborativeSession,
      connectedStudents,
      startCollaborativeSession,
      endCollaborativeSession,
      // Original methods
      handleJoinSession,
      confirmJoinSession,
      handleEndSession,
      handleViewStudent,
      handleSendMessage,
      handleRespondToCall,
      handleDismissCall,
      startNewSession,
      reviewStudentProgress,
      generateReport
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dashboard-card {
  @apply bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-6 transition-all hover:border-slate-600;
}

.dashboard-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* PC Optimized Styles */
@media (min-width: 1024px) {
  .teacher-dashboard {
    min-height: 100vh;
  }
  
  .dashboard-card {
    @apply p-8;
  }
  
  /* Better hover effects for mouse interaction */
  button:hover {
    transform: translateY(-1px);
  }
  
  /* Enhanced scrollbars for PC */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-slate-800;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-slate-600 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-500;
  }
}

/* Responsive grid adjustments */
@media (min-width: 1536px) {
  .max-w-7xl {
    max-width: 1400px;
  }
}

/* Animation for real-time updates */
.dashboard-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus styles for keyboard navigation */
button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900;
}

/* Status indicator animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>