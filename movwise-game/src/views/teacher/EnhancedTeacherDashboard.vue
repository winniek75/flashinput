<template>
  <div class="enhanced-teacher-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
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
                <p class="text-sm text-slate-400">統合学習管理システム</p>
              </div>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Subscription Status -->
            <SubscriptionStatus />

            <!-- Online Status -->
            <div class="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-green-400 font-medium text-sm">オンライン</span>
            </div>

            <!-- Teacher Info -->
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <div class="text-2xl">👨‍🏫</div>
              <div class="text-left">
                <div class="text-white font-medium">{{ authStore.displayName }}</div>
                <div class="text-xs text-slate-400">講師</div>
              </div>
            </div>

            <!-- Settings -->
            <button @click="showSettings = !showSettings" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <span class="text-xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <!-- Navigation Tabs -->
      <div class="dashboard-tabs mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ 'active': activeTab === tab.id }"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Dashboard Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div class="stat-card primary">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ teacherStore.totalStudents }}</h3>
                <div class="stat-icon">👥</div>
              </div>
              <p class="stat-label">総生徒数</p>
              <div class="stat-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: getUsagePercentage('students') + '%' }"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ subscriptionStore.usage.studentCount }}/{{ subscriptionStore.planDetails.maxStudents === -1 ? '∞' : subscriptionStore.planDetails.maxStudents }}
                </span>
              </div>
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ teacherStore.activeStudents }}</h3>
                <div class="stat-icon">🟢</div>
              </div>
              <p class="stat-label">オンライン中</p>
              <p class="stat-description">現在アクティブな生徒</p>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ teacherStore.activeSessions.length }}</h3>
                <div class="stat-icon">🎮</div>
              </div>
              <p class="stat-label">アクティブセッション</p>
              <p class="stat-description">現在進行中</p>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ teacherStore.totalClasses }}</h3>
                <div class="stat-icon">🏫</div>
              </div>
              <p class="stat-label">管理クラス数</p>
              <p class="stat-description">平均{{ teacherStore.averageClassSize }}名/クラス</p>
            </div>
          </div>

          <div class="stat-card" :class="teacherStore.pendingEmergencyCalls > 0 ? 'warning' : 'success'">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ teacherStore.pendingEmergencyCalls }}</h3>
                <div class="stat-icon">{{ teacherStore.pendingEmergencyCalls > 0 ? '🚨' : '✅' }}</div>
              </div>
              <p class="stat-label">緊急コール</p>
              <p class="stat-description">{{ teacherStore.pendingEmergencyCalls > 0 ? '対応が必要' : '問題なし' }}</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions mb-8">
          <h2 class="section-title">クイックアクション</h2>
          <div class="actions-grid">
            <button @click="startQuickSession" class="action-card primary">
              <div class="action-icon">🚀</div>
              <h3>クイックセッション開始</h3>
              <p>即座に新しい学習セッションを開始</p>
            </button>
            <button @click="activeTab = 'students'" class="action-card info">
              <div class="action-icon">👥</div>
              <h3>生徒を追加</h3>
              <p>新しい生徒をクラスに招待</p>
            </button>
            <button @click="activeTab = 'classes'" class="action-card secondary">
              <div class="action-icon">🏫</div>
              <h3>クラス管理</h3>
              <p>クラスを作成・管理する</p>
            </button>
            <button @click="generateClassReport" class="action-card success">
              <div class="action-icon">📊</div>
              <h3>進捗レポート</h3>
              <p>生徒の学習進捗を確認</p>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h2 class="section-title">最近のアクティビティ</h2>
          <div class="activity-list">
            <div v-if="recentActivities.length === 0" class="empty-activity">
              <div class="empty-icon">📝</div>
              <p>まだアクティビティがありません</p>
            </div>
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="activity.type">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.description }}</p>
                <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Tab -->
      <div v-if="activeTab === 'students'" class="tab-content">
        <StudentManagement />
      </div>

      <!-- Classes Tab -->
      <div v-if="activeTab === 'classes'" class="tab-content">
        <ClassManagement />
      </div>

      <!-- Sessions Tab -->
      <div v-if="activeTab === 'sessions'" class="tab-content">
        <SessionMonitoring />
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="tab-content">
        <div class="analytics-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">📈</div>
            <h3>詳細分析機能</h3>
            <p>生徒の学習パターン、進捗状況、パフォーマンス分析機能を開発中です。</p>
            <div class="coming-soon-badge">Coming Soon</div>
          </div>
        </div>
      </div>

      <!-- AI Insights Tab -->
      <div v-if="activeTab === 'ai-insights'" class="tab-content">
        <div v-if="teacherStore.students.length > 0" class="ai-insights-container">
          <div class="student-selector mb-4">
            <label class="student-selector-label">分析対象の生徒を選択:</label>
            <select v-model="selectedStudentForAI" class="student-select">
              <option value="">生徒を選択してください</option>
              <option 
                v-for="student in teacherStore.students" 
                :key="student.id" 
                :value="student.id"
              >
                {{ student.name }}
              </option>
            </select>
          </div>
          
          <AILearningInsights 
            v-if="selectedStudentForAI"
            :student-id="selectedStudentForAI"
            :student-name="getSelectedStudentName()"
            :session-history="getStudentSessionHistory(selectedStudentForAI)"
          />
          
          <div v-else class="ai-insights-placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">🤖</div>
              <h3>AI学習分析</h3>
              <p>生徒を選択すると、AIが学習パターンを分析して個人化された推奨事項を提供します。</p>
            </div>
          </div>
        </div>
        
        <div v-else class="no-students-message">
          <div class="placeholder-content">
            <div class="placeholder-icon">👥</div>
            <h3>生徒が登録されていません</h3>
            <p>AI分析を行うには、まず生徒を追加してください。</p>
            <button @click="activeTab = 'students'" class="btn-primary">
              <i class="fas fa-user-plus"></i>
              生徒を追加
            </button>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="settings-section">
          <h2 class="section-title">ダッシュボード設定</h2>
          <div class="settings-grid">
            <div class="setting-group">
              <h3>通知設定</h3>
              <label class="setting-toggle">
                <input 
                  v-model="teacherStore.dashboardSettings.notificationsEnabled"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">デスクトップ通知を有効にする</span>
              </label>
              <label class="setting-toggle">
                <input 
                  v-model="teacherStore.dashboardSettings.emergencyAlertSound"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">緊急コール時に音を再生</span>
              </label>
            </div>
            
            <div class="setting-group">
              <h3>セッション設定</h3>
              <label class="setting-toggle">
                <input 
                  v-model="teacherStore.dashboardSettings.autoAcceptStudents"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">生徒の参加を自動承認</span>
              </label>
              <label class="setting-toggle">
                <input 
                  v-model="teacherStore.dashboardSettings.sessionRecording"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">セッションを自動記録</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useTeacherStore } from '@/stores/teacherStore'
import SubscriptionStatus from '@/components/ui/SubscriptionStatus.vue'
import StudentManagement from '@/components/teacher/StudentManagement.vue'
import SessionMonitoring from '@/components/teacher/SessionMonitoring.vue'
import ClassManagement from '@/components/teacher/ClassManagement.vue'
import AILearningInsights from '@/components/analytics/AILearningInsights.vue'

export default {
  name: 'EnhancedTeacherDashboard',
  components: {
    SubscriptionStatus,
    StudentManagement,
    SessionMonitoring,
    ClassManagement,
    AILearningInsights
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    const teacherStore = useTeacherStore()
    
    // UI State
    const activeTab = ref('overview')
    const showSettings = ref(false)
    const selectedStudentForAI = ref('')
    
    // Dashboard tabs
    const tabs = [
      { id: 'overview', name: '概要', icon: 'fas fa-tachometer-alt' },
      { id: 'students', name: '生徒管理', icon: 'fas fa-users' },
      { id: 'classes', name: 'クラス管理', icon: 'fas fa-users-cog' },
      { id: 'sessions', name: 'セッション', icon: 'fas fa-gamepad' },
      { id: 'analytics', name: '分析', icon: 'fas fa-chart-bar' },
      { id: 'ai-insights', name: 'AI分析', icon: 'fas fa-brain' },
      { id: 'settings', name: '設定', icon: 'fas fa-cog' }
    ]
    
    // Recent activities (mock data)
    const recentActivities = ref([
      {
        id: 1,
        type: 'student_joined',
        title: '新しい生徒が参加',
        description: '田中太郎さんがクラスに参加しました',
        timestamp: new Date(Date.now() - 30000).toISOString()
      },
      {
        id: 2,
        type: 'session_completed',
        title: 'セッション完了',
        description: 'フォニックス学習セッションが正常に終了しました',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 3,
        type: 'progress_milestone',
        title: '進捗マイルストーン',
        description: '佐藤花子さんがレベル5に到達しました',
        timestamp: new Date(Date.now() - 600000).toISOString()
      }
    ])
    
    // Computed
    const getUsagePercentage = (type) => {
      if (type === 'students') {
        const plan = subscriptionStore.planDetails
        if (!plan || plan.maxStudents === undefined || plan.maxStudents === -1) return 0
        const maxStudents = plan.maxStudents || 1
        const currentStudents = subscriptionStore.usage?.studentCount || 0
        return Math.min(100, (currentStudents / maxStudents) * 100)
      }
      return 0
    }
    
    // Actions
    const startQuickSession = () => {
      // Quick session with default settings
      try {
        const sessionData = {
          name: `クイックセッション - ${new Date().toLocaleTimeString('ja-JP')}`,
          gameType: 'mixed',
          settings: {
            maxParticipants: 20,
            allowLateJoin: true,
            recordSession: teacherStore.dashboardSettings.sessionRecording
          }
        }
        
        const session = teacherStore.startSession(sessionData)
        activeTab.value = 'sessions'
        alert('クイックセッションを開始しました！')
      } catch (error) {
        alert(`セッション開始に失敗しました: ${error.message}`)
      }
    }
    
    const generateClassReport = () => {
      // Detailed report generation - will be added with PDF export feature
      alert('クラスレポート機能は開発中です')
    }
    
    // AI分析関連のメソッド
    const getSelectedStudentName = () => {
      if (!selectedStudentForAI.value) return ''
      const student = teacherStore.students.find(s => s.id === selectedStudentForAI.value)
      return student ? student.name : ''
    }
    
    const getStudentSessionHistory = (studentId) => {
      if (!studentId) return []
      
      // 実際のアプリケーションでは、セッション履歴を取得
      // ここではダミーデータを生成
      return generateMockSessionHistory(studentId)
    }
    
    const generateMockSessionHistory = (studentId) => {
      const student = teacherStore.students.find(s => s.id === studentId)
      if (!student) return []
      
      // モックセッションデータを生成
      const sessions = []
      const now = new Date()
      
      for (let i = 0; i < 15; i++) {
        const sessionStart = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000) - Math.random() * 12 * 60 * 60 * 1000)
        const sessionDuration = (15 + Math.random() * 30) * 60 * 1000 // 15-45分
        const sessionEnd = new Date(sessionStart.getTime() + sessionDuration)
        
        sessions.push({
          id: `session_${studentId}_${i}`,
          studentId: studentId,
          startTime: sessionStart.toISOString(),
          endTime: sessionEnd.toISOString(),
          gameType: ['phonics', 'vocabulary', 'grammar', 'reading'][Math.floor(Math.random() * 4)],
          difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
          score: Math.round(60 + Math.random() * 35), // 60-95点
          accuracy: Math.round(70 + Math.random() * 25) / 100, // 70-95%
          questionsAttempted: Math.round(20 + Math.random() * 30),
          correctAnswers: 0,
          errors: [],
          behavior: {
            engagementLevel: Math.random(),
            frustrationIndicators: Math.floor(Math.random() * 3),
            helpRequests: Math.floor(Math.random() * 2)
          },
          completed: true
        })
        
        // 正答数を計算
        const lastSession = sessions[sessions.length - 1]
        lastSession.correctAnswers = Math.round(lastSession.questionsAttempted * lastSession.accuracy)
        
        // エラーパターンを生成
        const errorTypes = ['timing_error', 'selection_error', 'comprehension_error', 'attention_error']
        const numErrors = lastSession.questionsAttempted - lastSession.correctAnswers
        for (let j = 0; j < Math.min(numErrors, 5); j++) {
          lastSession.errors.push({
            type: errorTypes[Math.floor(Math.random() * errorTypes.length)],
            question: `Question ${j + 1}`,
            timestamp: new Date(sessionStart.getTime() + (j * 2 * 60 * 1000)).toISOString()
          })
        }
      }
      
      return sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        student_joined: 'fas fa-user-plus',
        session_completed: 'fas fa-check-circle',
        progress_milestone: 'fas fa-trophy',
        emergency_call: 'fas fa-exclamation-triangle',
        message_sent: 'fas fa-comment'
      }
      return icons[type] || 'fas fa-info-circle'
    }
    
    const formatRelativeTime = (timestamp) => {
      const now = new Date()
      const date = new Date(timestamp)
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'たった今'
      if (diffMins < 60) return `${diffMins}分前`
      if (diffHours < 24) return `${diffHours}時間前`
      return `${diffDays}日前`
    }
    
    // Lifecycle
    onMounted(async () => {
      try {
        // Initialize subscription store with safe fallback
        try {
          if (subscriptionStore.initialize && typeof subscriptionStore.initialize === 'function') {
            await subscriptionStore.initialize()
          } else {
            // Fallback: Set default values for demo
            subscriptionStore.subscriptionStatus = 'active'
            subscriptionStore.currentPlan = subscriptionStore.pricingPlans?.pro || { 
              name: 'プロフェッショナル', 
              maxStudents: 100, 
              maxTeachers: 3 
            }
          }
        } catch (error) {
          logger.log('Subscription store initialization skipped:', error.message)
          // Set demo values
          subscriptionStore.subscriptionStatus = 'active'
          subscriptionStore.currentPlan = { 
            name: 'プロフェッショナル', 
            maxStudents: 100, 
            maxTeachers: 3 
          }
        }
        
        await teacherStore.initializeTeacherData()
        
        // Mock some students for demo
        if (teacherStore.students.length === 0) {
          const mockStudents = [
            { name: '田中太郎', email: 'tanaka@example.com', classId: 'default' },
            { name: '佐藤花子', email: 'sato@example.com', classId: 'default' },
            { name: '鈴木一郎', email: 'suzuki@example.com', classId: 'default' }
          ]
          
          mockStudents.forEach(student => {
            try {
              teacherStore.addStudent(student)
            } catch (error) {
              logger.log('Student limit reached, skipping mock data')
            }
          })
        }
      } catch (error) {
        logger.error('Dashboard initialization failed:', error)
      }
    })
    
    return {
      authStore,
      subscriptionStore,
      teacherStore,
      activeTab,
      showSettings,
      selectedStudentForAI,
      tabs,
      recentActivities,
      getUsagePercentage,
      startQuickSession,
      generateClassReport,
      getSelectedStudentName,
      getStudentSessionHistory,
      getActivityIcon,
      formatRelativeTime
    }
  }
}
</script>

<style scoped>
.enhanced-teacher-dashboard {
  min-height: 100vh;
}

/* Dashboard Tabs */
.dashboard-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dashboard-tabs::-webkit-scrollbar {
  display: none;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-button.active {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Stat Cards */
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
}

.stat-card.primary { --accent-color: #3b82f6; }
.stat-card.success { --accent-color: #10b981; }
.stat-card.info { --accent-color: #06b6d4; }
.stat-card.warning { --accent-color: #f59e0b; }

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.stat-header h3 {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.stat-description {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
}

.stat-progress {
  margin-top: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.3rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* Section Titles */
.section-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Quick Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.action-card:hover::before {
  transform: scaleX(1);
}

.action-card.primary { --accent-color: #3b82f6; }
.action-card.info { --accent-color: #06b6d4; }
.action-card.success { --accent-color: #10b981; }
.action-card.secondary { --accent-color: #6b7280; }

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

/* Recent Activity */
.activity-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
}

.empty-activity {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.student_joined {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.activity-icon.session_completed {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.activity-icon.progress_milestone {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.2rem 0;
}

.activity-content p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.3rem 0;
}

.activity-time {
  color: #64748b;
  font-size: 0.8rem;
}

/* Analytics Placeholder */
.analytics-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.placeholder-content h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.placeholder-content p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.coming-soon-badge {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Settings */
.settings-section {
  max-width: 800px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.setting-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-group h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.setting-toggle {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.setting-toggle input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 26px;
  background: #374151;
  border-radius: 26px;
  transition: background 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.setting-toggle input[type="checkbox"]:checked + .toggle-slider {
  background: #3b82f6;
}

.setting-toggle input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  color: white;
  font-size: 0.9rem;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .enhanced-teacher-dashboard header .flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .dashboard-tabs {
    margin: 0 -1rem;
    border-radius: 0;
    padding: 0.5rem 1rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .stat-header h3 {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  main {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* AI Insights specific styles */
.ai-insights-container {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1rem;
}

.student-selector {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.student-selector-label {
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.student-select {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.student-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ai-insights-placeholder,
.no-students-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.ai-insights-placeholder .placeholder-content,
.no-students-message .placeholder-content {
  text-align: center;
  max-width: 400px;
}

.ai-insights-placeholder .placeholder-icon,
.no-students-message .placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.ai-insights-placeholder h3,
.no-students-message h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.ai-insights-placeholder p,
.no-students-message p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>