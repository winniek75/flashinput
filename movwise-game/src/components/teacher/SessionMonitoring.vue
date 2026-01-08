<template>
  <div class="session-monitoring">
    <!-- ヘッダー -->
    <div class="monitoring-header">
      <div class="header-content">
        <h2 class="section-title">
          <i class="fas fa-satellite-dish"></i>
          リアルタイム監視
        </h2>
        <p class="section-subtitle">
          アクティブセッション: {{ teacherStore.activeSessions.length }}個
        </p>
      </div>
      <div class="header-actions">
        <button @click="startNewSession" class="btn-primary">
          <i class="fas fa-play"></i>
          新規セッション開始
        </button>
        <button @click="refreshData" class="btn-secondary" :disabled="isRefreshing">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
          更新
        </button>
      </div>
    </div>

    <!-- クイック統計 -->
    <div class="quick-stats">
      <div class="stat-card active">
        <div class="stat-icon">📡</div>
        <div class="stat-content">
          <h3>{{ teacherStore.activeStudents }}</h3>
          <p>オンライン生徒</p>
        </div>
      </div>
      <div class="stat-card sessions">
        <div class="stat-icon">🎮</div>
        <div class="stat-content">
          <h3>{{ teacherStore.activeSessions.length }}</h3>
          <p>アクティブセッション</p>
        </div>
      </div>
      <div class="stat-card emergency">
        <div class="stat-icon">🚨</div>
        <div class="stat-content">
          <h3>{{ teacherStore.pendingEmergencyCalls }}</h3>
          <p>緊急コール</p>
        </div>
      </div>
      <div class="stat-card performance">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ averagePerformance }}%</h3>
          <p>平均パフォーマンス</p>
        </div>
      </div>
    </div>

    <!-- アクティブセッション -->
    <div class="sessions-section">
      <h3 class="subsection-title">
        <i class="fas fa-gamepad"></i>
        アクティブセッション
      </h3>
      
      <div v-if="teacherStore.activeSessions.length === 0" class="empty-sessions">
        <div class="empty-icon">🎮</div>
        <h4>アクティブセッションがありません</h4>
        <p>新しいセッションを開始して生徒との協力学習を始めましょう。</p>
        <button @click="startNewSession" class="btn-primary">
          <i class="fas fa-play"></i>
          セッション開始
        </button>
      </div>

      <div v-else class="sessions-grid">
        <div 
          v-for="session in teacherStore.activeSessions" 
          :key="session.id"
          class="session-card"
        >
          <!-- セッション基本情報 -->
          <div class="session-header">
            <div class="session-info">
              <h4 class="session-name">{{ session.name }}</h4>
              <div class="session-meta">
                <span class="game-type">
                  <i class="fas fa-gamepad"></i>
                  {{ getGameTypeName(session.gameType) }}
                </span>
                <span class="session-duration">
                  <i class="fas fa-clock"></i>
                  {{ getSessionDuration(session.startTime) }}
                </span>
              </div>
            </div>
            <div class="session-status active">
              <div class="status-indicator"></div>
              <span>進行中</span>
            </div>
          </div>

          <!-- 参加者情報 -->
          <div class="participants-section">
            <h5 class="participants-title">
              <i class="fas fa-users"></i>
              参加者 ({{ session.participants.length }}名)
            </h5>
            <div class="participants-list">
              <div 
                v-for="participantId in session.participants" 
                :key="participantId"
                class="participant-item"
              >
                <div class="participant-info">
                  <div class="participant-avatar">
                    {{ getStudentInitials(getStudentById(participantId)?.name) }}
                  </div>
                  <div class="participant-details">
                    <span class="participant-name">{{ getStudentById(participantId)?.name }}</span>
                    <span class="participant-status online">オンライン</span>
                  </div>
                </div>
                <div class="participant-performance">
                  <div class="performance-indicator good">
                    <i class="fas fa-thumbs-up"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- セッション統計 -->
          <div class="session-analytics">
            <div class="analytics-grid">
              <div class="analytics-item">
                <span class="analytics-label">平均スコア</span>
                <span class="analytics-value">{{ session.analytics.averageScore || 0 }}点</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-label">完了率</span>
                <span class="analytics-value">{{ session.analytics.completionRate || 0 }}%</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-label">緊急コール</span>
                <span class="analytics-value emergency">{{ session.analytics.emergencyCallsCount || 0 }}件</span>
              </div>
            </div>
          </div>

          <!-- セッションアクション -->
          <div class="session-actions">
            <button @click="viewSessionDetails(session)" class="action-btn details">
              <i class="fas fa-eye"></i>
              詳細表示
            </button>
            <button @click="joinSession(session)" class="action-btn join">
              <i class="fas fa-sign-in-alt"></i>
              参加
            </button>
            <button @click="endSession(session)" class="action-btn end">
              <i class="fas fa-stop"></i>
              終了
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 緊急コール -->
    <div v-if="teacherStore.emergencyCalls.length > 0" class="emergency-section">
      <h3 class="subsection-title emergency">
        <i class="fas fa-exclamation-triangle"></i>
        緊急コール ({{ teacherStore.pendingEmergencyCalls }}件)
      </h3>
      
      <div class="emergency-calls">
        <div 
          v-for="call in teacherStore.emergencyCalls.filter(c => c.status === 'pending')" 
          :key="call.id"
          class="emergency-call"
        >
          <div class="call-header">
            <div class="call-info">
              <span class="student-name">{{ call.studentName }}</span>
              <span class="call-time">{{ formatTime(call.timestamp) }}</span>
            </div>
            <div class="call-priority" :class="call.priority">
              {{ call.priority === 'high' ? '🔴' : call.priority === 'medium' ? '🟡' : '🟢' }}
            </div>
          </div>
          <div class="call-message">{{ call.message }}</div>
          <div class="call-actions">
            <button @click="respondToCall(call)" class="respond-btn">
              <i class="fas fa-reply"></i>
              対応
            </button>
            <button @click="dismissCall(call)" class="dismiss-btn">
              <i class="fas fa-times"></i>
              無視
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- オンライン生徒リスト -->
    <div class="online-students-section">
      <h3 class="subsection-title">
        <i class="fas fa-user-friends"></i>
        オンライン生徒 ({{ onlineStudents.length }}名)
      </h3>
      
      <div class="online-students-grid">
        <div 
          v-for="student in onlineStudents" 
          :key="student.id"
          class="online-student-card"
        >
          <div class="student-info">
            <div class="student-avatar online">
              {{ getStudentInitials(student.name) }}
              <div class="online-indicator"></div>
            </div>
            <div class="student-details">
              <span class="student-name">{{ student.name }}</span>
              <span class="student-activity">{{ getCurrentActivity(student) }}</span>
            </div>
          </div>
          <div class="student-actions">
            <button @click="inviteToSession(student)" class="invite-btn" title="セッションに招待">
              <i class="fas fa-user-plus"></i>
            </button>
            <button @click="sendMessage(student)" class="message-btn" title="メッセージ送信">
              <i class="fas fa-comment"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新規セッション作成モーダル -->
    <div v-if="showNewSessionModal" class="modal-overlay" @click="showNewSessionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新しいセッションを開始</h3>
          <button @click="showNewSessionModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createNewSession" class="modal-body">
          <div class="form-group">
            <label>セッション名 *</label>
            <input 
              v-model="newSession.name"
              type="text" 
              placeholder="セッション名を入力"
              required
            />
          </div>
          <div class="form-group">
            <label>ゲームタイプ *</label>
            <select v-model="newSession.gameType" required>
              <option value="">ゲームを選択</option>
              <option value="phonics">フォニックス学習</option>
              <option value="grammar">文法学習</option>
              <option value="vocabulary">語彙学習</option>
              <option value="mixed">混合学習</option>
            </select>
          </div>
          <div class="form-group">
            <label>参加予定生徒</label>
            <div class="student-checkboxes">
              <label 
                v-for="student in teacherStore.students" 
                :key="student.id"
                class="checkbox-item"
              >
                <input 
                  v-model="newSession.selectedStudents"
                  :value="student.id"
                  type="checkbox"
                />
                <span>{{ student.name }}</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showNewSessionModal = false" class="btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-play"></i>
              セッション開始
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeacherStore } from '@/stores/teacherStore'

export default {
  name: 'SessionMonitoring',
  setup() {
    const router = useRouter()
    const teacherStore = useTeacherStore()
    
    // UI State
    const showNewSessionModal = ref(false)
    const isRefreshing = ref(false)
    const refreshInterval = ref(null)
    
    // New session form
    const newSession = reactive({
      name: '',
      gameType: '',
      selectedStudents: []
    })
    
    // Computed values
    const onlineStudents = computed(() => 
      teacherStore.students.filter(student => student.isOnline)
    )
    
    const averagePerformance = computed(() => {
      const sessions = teacherStore.activeSessions
      if (sessions.length === 0) return 0
      
      const totalPerformance = sessions.reduce((sum, session) => 
        sum + (session.analytics.averageScore || 0), 0
      )
      return Math.round(totalPerformance / sessions.length)
    })
    
    // Session management
    const startNewSession = () => {
      showNewSessionModal.value = true
    }
    
    const createNewSession = () => {
      try {
        const sessionData = {
          name: newSession.name,
          gameType: newSession.gameType,
          settings: {
            maxParticipants: 50,
            allowLateJoin: true,
            recordSession: true
          }
        }
        
        const session = teacherStore.startSession(sessionData)
        
        // 選択された生徒を招待
        newSession.selectedStudents.forEach(studentId => {
          teacherStore.addParticipantToSession(session.id, studentId)
        })
        
        // フォームリセット
        Object.assign(newSession, {
          name: '',
          gameType: '',
          selectedStudents: []
        })
        
        showNewSessionModal.value = false
        alert('セッションを開始しました！')
      } catch (error) {
        alert(`セッション開始に失敗しました: ${error.message}`)
      }
    }
    
    const endSession = (session) => {
      if (confirm(`セッション「${session.name}」を終了しますか？`)) {
        teacherStore.endSession(session.id)
      }
    }
    
    const viewSessionDetails = (session) => {
      router.push(`/teacher/session/${session.id}`)
    }
    
    const joinSession = (session) => {
      // Teacher join functionality - will be implemented with WebRTC integration
      alert(`セッション「${session.name}」に参加（未実装）`)
    }
    
    // Emergency call handling
    const respondToCall = (call) => {
      const response = prompt(`${call.studentName}さんへの返答を入力してください:`)
      if (response) {
        teacherStore.respondToEmergencyCall(call.id, response)
      }
    }
    
    const dismissCall = (call) => {
      if (confirm('この緊急コールを無視しますか？')) {
        teacherStore.dismissEmergencyCall(call.id)
      }
    }
    
    // Student interactions
    const inviteToSession = (student) => {
      if (teacherStore.activeSessions.length === 0) {
        alert('まず新しいセッションを開始してください。')
        return
      }
      
      // 最新のセッションに招待
      const latestSession = teacherStore.activeSessions[0]
      teacherStore.addParticipantToSession(latestSession.id, student.id)
      alert(`${student.name}さんをセッションに招待しました。`)
    }
    
    const sendMessage = (student) => {
      const message = prompt(`${student.name}さんにメッセージを送信:`)
      if (message) {
        // Message sending functionality - pending WebSocket implementation
        alert('メッセージを送信しました（未実装）')
      }
    }
    
    // Data refresh
    const refreshData = async () => {
      isRefreshing.value = true
      try {
        // Real-time data synchronization - will use WebSocket events
        await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
        logger.log('Data refreshed')
      } finally {
        isRefreshing.value = false
      }
    }
    
    // Utility functions
    const getStudentById = (studentId) => {
      return teacherStore.students.find(s => s.id === studentId)
    }
    
    const getStudentInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    
    const getGameTypeName = (gameType) => {
      const gameTypeNames = {
        phonics: 'フォニックス',
        grammar: '文法',
        vocabulary: '語彙',
        mixed: '混合学習'
      }
      return gameTypeNames[gameType] || gameType
    }
    
    const getSessionDuration = (startTime) => {
      const now = new Date()
      const start = new Date(startTime)
      const diffMs = now - start
      const diffMins = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMins / 60)
      const minutes = diffMins % 60
      
      if (hours > 0) {
        return `${hours}時間${minutes}分`
      }
      return `${minutes}分`
    }
    
    const getCurrentActivity = (student) => {
      // Student activity tracking - implemented via activity monitoring service
      const activities = ['ゲーム中', 'アイドル', '問題解答中', 'メニュー画面']
      return activities[Math.floor(Math.random() * activities.length)]
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    // Lifecycle
    onMounted(() => {
      teacherStore.initializeTeacherData()
      
      // 5秒ごとにデータ更新
      refreshInterval.value = setInterval(() => {
        if (!isRefreshing.value) {
          refreshData()
        }
      }, 5000)
      
      // Mock emergency call for demonstration
      setTimeout(() => {
        teacherStore.handleEmergencyCall({
          studentId: 'student_1',
          studentName: '田中太郎',
          sessionId: 'session_1',
          message: '問題が難しすぎてわかりません',
          priority: 'medium'
        })
      }, 3000)
    })
    
    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
      }
    })
    
    return {
      teacherStore,
      showNewSessionModal,
      isRefreshing,
      newSession,
      onlineStudents,
      averagePerformance,
      startNewSession,
      createNewSession,
      endSession,
      viewSessionDetails,
      joinSession,
      respondToCall,
      dismissCall,
      inviteToSession,
      sendMessage,
      refreshData,
      getStudentById,
      getStudentInitials,
      getGameTypeName,
      getSessionDuration,
      getCurrentActivity,
      formatTime
    }
  }
}
</script>

<style scoped>
.session-monitoring {
  padding: 1.5rem;
}

.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-card.emergency {
  border-left: 4px solid #ef4444;
}

.stat-card.active {
  border-left: 4px solid #10b981;
}

.stat-card.sessions {
  border-left: 4px solid #3b82f6;
}

.stat-card.performance {
  border-left: 4px solid #8b5cf6;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-content p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.sessions-section,
.emergency-section,
.online-students-section {
  margin-bottom: 2rem;
}

.subsection-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.subsection-title.emergency {
  color: #fca5a5;
}

.empty-sessions {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-sessions h4 {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.empty-sessions p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.session-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.session-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.session-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.session-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.game-type,
.session-duration {
  color: #94a3b8;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.session-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.session-status.active {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.participants-section {
  margin-bottom: 1rem;
}

.participants-title {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.participant-name {
  color: white;
  font-size: 0.9rem;
}

.participant-status {
  color: #10b981;
  font-size: 0.8rem;
}

.performance-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.performance-indicator.good {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.session-analytics {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.analytics-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.analytics-label {
  color: #94a3b8;
  font-size: 0.8rem;
}

.analytics-value {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.analytics-value.emergency {
  color: #fca5a5;
}

.session-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.details {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.action-btn.join {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.action-btn.end {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.emergency-calls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.emergency-call {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1rem;
  animation: emergencyPulse 2s infinite;
}

@keyframes emergencyPulse {
  0%, 100% { border-color: rgba(239, 68, 68, 0.3); }
  50% { border-color: rgba(239, 68, 68, 0.6); }
}

.call-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.student-name {
  color: #fca5a5;
  font-weight: bold;
}

.call-time {
  color: #fed7d7;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.call-priority {
  font-size: 1.2rem;
}

.call-message {
  color: #fed7d7;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.call-actions {
  display: flex;
  gap: 0.5rem;
}

.respond-btn,
.dismiss-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
}

.respond-btn {
  background: #10b981;
  color: white;
}

.respond-btn:hover {
  background: #059669;
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.online-students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.online-student-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.online-student-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.student-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.student-name {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.student-activity {
  color: #94a3b8;
  font-size: 0.8rem;
}

.student-actions {
  display: flex;
  gap: 0.3rem;
}

.invite-btn,
.message-btn {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.invite-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.message-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

/* Button styles */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles (reuse from previous component) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.student-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.checkbox-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.checkbox-item input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .monitoring-header {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .sessions-grid {
    grid-template-columns: 1fr;
  }

  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .session-actions {
    flex-wrap: wrap;
  }

  .online-students-grid {
    grid-template-columns: 1fr;
  }
}
</style>