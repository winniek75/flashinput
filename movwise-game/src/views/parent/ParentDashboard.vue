<template>
  <div class="parent-dashboard min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
    <!-- Header -->
    <header class="bg-emerald-800/90 backdrop-blur-lg border-b border-emerald-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- Logo & Title -->
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')"
              class="flex items-center gap-2 px-3 py-2 bg-emerald-700/50 hover:bg-emerald-600/70 rounded-lg transition-all border border-emerald-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-emerald-300">ホーム</span>
            </button>
            <div class="flex items-center gap-3">
              <div class="text-3xl">👨‍👩‍👧‍👦</div>
              <div>
                <h1 class="text-2xl font-bold text-white">MovWISE 親ポータル</h1>
                <p class="text-sm text-emerald-400">お子様の学習状況を確認</p>
              </div>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Subscription Status -->
            <SubscriptionStatus />

            <!-- Notifications -->
            <div class="relative">
              <button 
                @click="showNotifications = !showNotifications"
                class="flex items-center gap-2 px-3 py-2 bg-emerald-700/50 rounded-lg transition-all hover:bg-emerald-600/70"
              >
                <i class="fas fa-bell"></i>
                <span v-if="parentStore.unreadNotifications > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ parentStore.unreadNotifications }}
                </span>
              </button>
              
              <!-- Notifications Panel -->
              <div v-if="showNotifications" class="absolute right-0 top-full mt-2 w-80 bg-emerald-800/95 backdrop-blur border border-emerald-600 rounded-lg shadow-xl z-100">
                <div class="p-4 border-b border-emerald-600">
                  <div class="flex justify-between items-center">
                    <h3 class="font-semibold text-white">通知</h3>
                    <button @click="parentStore.markAllNotificationsAsRead()" class="text-emerald-300 text-sm hover:text-white">
                      全て既読
                    </button>
                  </div>
                </div>
                <div class="max-h-96 overflow-y-auto">
                  <div 
                    v-for="notification in parentStore.notifications.slice(0, 10)" 
                    :key="notification.id"
                    class="p-3 border-b border-emerald-700/50 hover:bg-emerald-700/30 transition-colors"
                    :class="{ 'bg-emerald-700/20': !notification.isRead }"
                    @click="handleNotificationClick(notification)"
                  >
                    <div class="flex items-start gap-3">
                      <div class="notification-icon" :class="notification.priority">
                        <i :class="getNotificationIcon(notification.type)"></i>
                      </div>
                      <div class="flex-1">
                        <h5 class="text-white font-medium text-sm">{{ notification.title }}</h5>
                        <p class="text-emerald-200 text-xs mt-1">{{ notification.message }}</p>
                        <span class="text-emerald-400 text-xs">{{ formatRelativeTime(notification.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Parent Info -->
            <div class="flex items-center gap-3 px-4 py-2 bg-emerald-700/50 rounded-lg">
              <div class="text-2xl">👨‍👩‍👧‍👦</div>
              <div class="text-left">
                <div class="text-white font-medium">{{ authStore.displayName }}</div>
                <div class="text-xs text-emerald-400">保護者</div>
              </div>
            </div>

            <!-- Settings -->
            <button @click="showSettings = !showSettings" class="p-2 hover:bg-emerald-700 rounded-lg transition-colors">
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

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card primary">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ parentStore.totalChildren }}</h3>
                <div class="stat-icon">👶</div>
              </div>
              <p class="stat-label">お子様</p>
              <p class="stat-description">接続中</p>
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ parentStore.activeChildren }}</h3>
                <div class="stat-icon">🟢</div>
              </div>
              <p class="stat-label">オンライン中</p>
              <p class="stat-description">現在学習中</p>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ parentStore.averageProgress }}%</h3>
                <div class="stat-icon">📈</div>
              </div>
              <p class="stat-label">平均進捗</p>
              <p class="stat-description">全体の学習レベル</p>
            </div>
          </div>

          <div class="stat-card" :class="parentStore.needsAttention > 0 ? 'warning' : 'success'">
            <div class="stat-content">
              <div class="stat-header">
                <h3>{{ parentStore.needsAttention }}</h3>
                <div class="stat-icon">{{ parentStore.needsAttention > 0 ? '⚠️' : '✅' }}</div>
              </div>
              <p class="stat-label">要注意</p>
              <p class="stat-description">{{ parentStore.needsAttention > 0 ? 'サポートが必要' : '順調に成長中' }}</p>
            </div>
          </div>
        </div>

        <!-- Children Overview -->
        <div class="children-overview mb-8">
          <h2 class="section-title">お子様の学習状況</h2>
          <div class="children-grid">
            <div 
              v-for="child in parentStore.children" 
              :key="child.id"
              class="child-card"
              @click="selectChild(child)"
            >
              <div class="child-header">
                <div class="child-avatar" :class="{ 'online': child.isOnline }">
                  {{ getChildInitials(child.name) }}
                  <div v-if="child.isOnline" class="online-indicator"></div>
                </div>
                <div class="child-info">
                  <h3 class="child-name">{{ child.name }}</h3>
                  <p class="child-meta">{{ child.teacherName }} | {{ child.className }}</p>
                  <div class="status-badges">
                    <span v-if="child.needsHelp" class="badge warning">サポート要</span>
                    <span v-if="child.hasInactivity" class="badge info">未学習</span>
                    <span v-if="child.isOnline" class="badge success">学習中</span>
                  </div>
                </div>
              </div>
              
              <div class="child-progress">
                <div class="progress-item">
                  <span class="label">レベル</span>
                  <span class="value">{{ child.progress.currentLevel }}</span>
                </div>
                <div class="progress-item">
                  <span class="label">正答率</span>
                  <span class="value">{{ child.progress.averageAccuracy }}%</span>
                </div>
                <div class="progress-item">
                  <span class="label">ゲーム数</span>
                  <span class="value">{{ child.progress.totalGamesPlayed }}</span>
                </div>
              </div>
              
              <div class="child-actions">
                <button @click.stop="viewChildDetail(child)" class="btn-primary-small">
                  <i class="fas fa-chart-line"></i>
                  詳細
                </button>
                <button @click.stop="contactTeacher(child)" class="btn-secondary-small">
                  <i class="fas fa-comment"></i>
                  先生に連絡
                </button>
              </div>
            </div>
            
            <!-- Add Child Card -->
            <div class="add-child-card" @click="showAddChildModal = true">
              <div class="add-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <h3>お子様を追加</h3>
              <p>先生から受け取った接続コードを入力してください</p>
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="recent-reports">
          <div class="section-header">
            <h2 class="section-title">最近のレポート</h2>
            <button @click="activeTab = 'reports'" class="btn-secondary">
              <i class="fas fa-file-alt"></i>
              全て見る
            </button>
          </div>
          <div class="reports-list">
            <div 
              v-for="report in parentStore.reportHistory.slice(0, 3)" 
              :key="report.id"
              class="report-item"
              @click="viewReport(report)"
            >
              <div class="report-icon">📊</div>
              <div class="report-content">
                <h4>{{ report.childName }}さん - {{ report.reportType === 'weekly' ? '週間' : '月間' }}レポート</h4>
                <p>{{ report.period.label }} | 平均正答率: {{ report.summary.averageAccuracy }}%</p>
                <span class="report-date">{{ formatDate(report.generatedAt) }}</span>
              </div>
              <div class="report-actions">
                <button class="btn-icon">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Children Tab -->
      <div v-if="activeTab === 'children'" class="tab-content">
        <ChildrenManagement />
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="tab-content">
        <ReportsView />
      </div>

      <!-- Communication Tab -->
      <div v-if="activeTab === 'communication'" class="tab-content">
        <TeacherCommunication />
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="settings-section">
          <h2 class="section-title">親ポータル設定</h2>
          <div class="settings-grid">
            <div class="setting-group">
              <h3>通知設定</h3>
              <label class="setting-toggle">
                <input 
                  v-model="parentStore.dashboardSettings.emailNotifications"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">メール通知を有効にする</span>
              </label>
              <label class="setting-toggle">
                <input 
                  v-model="parentStore.dashboardSettings.progressAlerts"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">学習進捗アラート</span>
              </label>
              <label class="setting-toggle">
                <input 
                  v-model="parentStore.dashboardSettings.emergencyNotifications"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">緊急通知</span>
              </label>
            </div>
            
            <div class="setting-group">
              <h3>レポート設定</h3>
              <label class="setting-toggle">
                <input 
                  v-model="parentStore.dashboardSettings.weeklyReports"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">週間レポート自動生成</span>
              </label>
              <label class="setting-toggle">
                <input 
                  v-model="parentStore.dashboardSettings.monthlyReports"
                  type="checkbox"
                />
                <span class="toggle-slider"></span>
                <span class="toggle-label">月間レポート自動生成</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Child Modal -->
    <div v-if="showAddChildModal" class="modal-overlay" @click="showAddChildModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>お子様との接続</h3>
          <button @click="showAddChildModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="addNewChildConnection" class="modal-body">
          <div class="form-group">
            <label>接続コード *</label>
            <input 
              v-model="newChild.connectionCode"
              type="text" 
              placeholder="例: MW-2024-001"
              required
            />
            <p class="form-help">先生から受け取った接続コードを入力してください</p>
          </div>
          <div class="form-group">
            <label>お子様の名前 *</label>
            <input 
              v-model="newChild.name"
              type="text" 
              placeholder="太郎"
              required
            />
          </div>
          <div class="form-group">
            <label>先生のお名前</label>
            <input 
              v-model="newChild.teacherName"
              type="text" 
              placeholder="Sarah先生"
            />
          </div>
          <div class="form-group">
            <label>クラス名</label>
            <input 
              v-model="newChild.className"
              type="text" 
              placeholder="小学3年A組"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddChildModal = false" class="btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn-primary" :disabled="!newChild.connectionCode || !newChild.name">
              <i class="fas fa-link"></i>
              接続する
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useParentStore } from '@/stores/parentStore'
import SubscriptionStatus from '@/components/ui/SubscriptionStatus.vue'

export default {
  name: 'ParentDashboard',
  components: {
    SubscriptionStatus
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    const parentStore = useParentStore()
    
    // UI State
    const activeTab = ref('overview')
    const showSettings = ref(false)
    const showNotifications = ref(false)
    const showAddChildModal = ref(false)
    const selectedChild = ref(null)
    
    // Dashboard tabs
    const tabs = [
      { id: 'overview', name: '概要', icon: 'fas fa-tachometer-alt' },
      { id: 'children', name: 'お子様管理', icon: 'fas fa-child' },
      { id: 'reports', name: 'レポート', icon: 'fas fa-file-alt' },
      { id: 'communication', name: '先生との連絡', icon: 'fas fa-comments' },
      { id: 'settings', name: '設定', icon: 'fas fa-cog' }
    ]
    
    // New child connection form
    const newChild = reactive({
      connectionCode: '',
      name: '',
      teacherName: '',
      className: '',
      schoolName: 'MovWise英語学院'
    })
    
    // Child management functions
    const addNewChildConnection = async () => {
      try {
        // Mock connection data - in real app this would validate with server
        const connectionData = {
          ...newChild,
          email: `${newChild.name.toLowerCase()}@student.example.com`,
          teacherId: 'teacher_001',
          currentLevel: Math.floor(Math.random() * 5) + 1,
          totalGamesPlayed: Math.floor(Math.random() * 20),
          averageAccuracy: Math.floor(Math.random() * 30) + 70,
          strongAreas: ['フォニックス基礎', '単語認識'],
          weakAreas: ['文法基礎']
        }
        
        await parentStore.addChildConnection(connectionData)
        
        // Reset form
        Object.assign(newChild, {
          connectionCode: '',
          name: '',
          teacherName: '',
          className: ''
        })
        
        showAddChildModal.value = false
        alert('お子様との接続が完了しました！')
      } catch (error) {
        alert(error.message)
      }
    }
    
    const selectChild = (child) => {
      selectedChild.value = child
      activeTab.value = 'children'
    }
    
    const viewChildDetail = (child) => {
      router.push(`/parent/child/${child.id}`)
    }
    
    const contactTeacher = async (child) => {
      const message = prompt(`${child.teacherName}先生にメッセージを送信:`)
      if (message) {
        try {
          await parentStore.sendMessageToTeacher(child.id, message)
          alert('メッセージを送信しました！')
        } catch (error) {
          alert('メッセージ送信に失敗しました')
        }
      }
    }
    
    const viewReport = (report) => {
      // TODO: Open report detail modal or navigate to report view
      logger.log('Viewing report:', report)
      alert('レポート詳細画面を開きます（開発中）')
    }
    
    // Notification handling
    const handleNotificationClick = (notification) => {
      parentStore.markNotificationAsRead(notification.id)
      
      // Navigate based on notification type
      if (notification.childId) {
        const child = parentStore.children.find(c => c.id === notification.childId)
        if (child) {
          selectChild(child)
        }
      }
      
      if (notification.actionUrl) {
        router.push(notification.actionUrl)
      }
      
      showNotifications.value = false
    }
    
    const getNotificationIcon = (type) => {
      const icons = {
        connection: 'fas fa-link',
        achievement: 'fas fa-trophy',
        concern: 'fas fa-exclamation-triangle',
        inactivity: 'fas fa-clock',
        message_sent: 'fas fa-paper-plane',
        meeting_requested: 'fas fa-calendar',
        report_ready: 'fas fa-file-alt'
      }
      return icons[type] || 'fas fa-info-circle'
    }
    
    // Utility functions
    const getChildInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
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
        await subscriptionStore.initialize()
        await parentStore.initializeParentData()
      } catch (error) {
        logger.error('Dashboard initialization failed:', error)
      }
    })
    
    return {
      authStore,
      subscriptionStore,
      parentStore,
      activeTab,
      showSettings,
      showNotifications,
      showAddChildModal,
      selectedChild,
      tabs,
      newChild,
      addNewChildConnection,
      selectChild,
      viewChildDetail,
      contactTeacher,
      viewReport,
      handleNotificationClick,
      getNotificationIcon,
      getChildInitials,
      formatDate,
      formatRelativeTime
    }
  }
}
</script>

<style scoped>
.parent-dashboard {
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
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
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

.stat-card.primary { --accent-color: #10b981; }
.stat-card.success { --accent-color: #059669; }
.stat-card.info { --accent-color: #0891b2; }
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

/* Section Styles */
.section-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Children Overview */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.child-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.child-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-color: #10b981;
}

.child-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.child-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.1rem;
  border: 2px solid transparent;
}

.child-avatar.online {
  border-color: #6ee7b7;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
}

.child-info {
  flex: 1;
}

.child-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
}

.child-meta {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.success {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge.info {
  background: rgba(8, 145, 178, 0.2);
  color: #67e8f9;
  border: 1px solid rgba(8, 145, 178, 0.3);
}

.child-progress {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.progress-item {
  text-align: center;
}

.progress-item .label {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.progress-item .value {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.child-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary-small,
.btn-secondary-small {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border: none;
}

.btn-primary-small {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-secondary-small {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.add-child-card {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.add-child-card:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.add-icon {
  font-size: 3rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.add-child-card h3 {
  color: white;
  margin-bottom: 0.5rem;
}

.add-child-card p {
  color: #94a3b8;
  margin: 0;
}

/* Reports */
.reports-list {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.report-item:last-child {
  border-bottom: none;
}

.report-icon {
  font-size: 2rem;
}

.report-content {
  flex: 1;
}

.report-content h4 {
  color: white;
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
}

.report-content p {
  color: #94a3b8;
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
}

.report-date {
  color: #64748b;
  font-size: 0.8rem;
}

.btn-icon {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Notifications */
.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.high {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.notification-icon.normal {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.notification-icon.info {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
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
  background: #10b981;
}

.setting-toggle input[type="checkbox"]:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  color: white;
  font-size: 0.9rem;
  flex: 1;
}

/* Button Styles */
.btn-primary, .btn-secondary {
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
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #374151;
  color: #6b7280;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Modal styles */
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
  background: rgba(6, 78, 59, 0.95);
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

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.form-group input::placeholder {
  color: #64748b;
}

.form-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-help {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .parent-dashboard header .flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .dashboard-tabs {
    margin: 0 -1rem;
    border-radius: 0;
    padding: 0.5rem 1rem;
  }

  .children-grid {
    grid-template-columns: 1fr;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  main {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .stat-header h3 {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }
}
</style>