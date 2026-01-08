<template>
  <div class="class-management">
    <!-- ヘッダーセクション -->
    <div class="management-header">
      <div class="header-content">
        <h2 class="section-title">
          <i class="fas fa-users-cog"></i>
          クラス管理
        </h2>
        <p class="section-subtitle">
          {{ teacherStore.classes.length }}個のクラスを管理中
          <span class="total-students">
            （総生徒数: {{ getTotalStudentsInClasses() }}名）
          </span>
        </p>
      </div>
      <div class="header-actions">
        <button 
          @click="showCreateClassModal = true"
          class="btn-primary"
          :disabled="!subscriptionStore.checkFeatureAccess('class_management')"
        >
          <i class="fas fa-plus"></i>
          クラスを作成
        </button>
        <button @click="showBulkActionsModal = true" class="btn-secondary">
          <i class="fas fa-tasks"></i>
          一括操作
        </button>
      </div>
    </div>

    <!-- 機能制限警告 -->
    <div v-if="!subscriptionStore.checkFeatureAccess('class_management')" class="feature-warning">
      <div class="warning-content">
        <i class="fas fa-lock"></i>
        <div>
          <h4>クラス管理機能</h4>
          <p>クラス管理機能はプロプラン以上で利用可能です。個別の生徒管理は基本プランでもご利用いただけます。</p>
        </div>
        <router-link to="/subscription" class="upgrade-btn">
          <i class="fas fa-arrow-up"></i>
          プランをアップグレード
        </router-link>
      </div>
    </div>

    <!-- クラス統計 -->
    <div class="class-stats">
      <div class="stat-item">
        <div class="stat-icon">🏫</div>
        <div class="stat-content">
          <h3>{{ teacherStore.classes.length }}</h3>
          <p>アクティブクラス</p>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>{{ getAverageClassSize() }}</h3>
          <p>平均クラスサイズ</p>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>{{ getOverallProgress() }}%</h3>
          <p>全体平均進捗</p>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>{{ getActiveSessionsCount() }}</h3>
          <p>進行中セッション</p>
        </div>
      </div>
    </div>

    <!-- クラス一覧 -->
    <div class="classes-grid">
      <div 
        v-for="classItem in teacherStore.classes" 
        :key="classItem.id"
        class="class-card"
        @click="selectClass(classItem)"
        :class="{ 'selected': selectedClass?.id === classItem.id }"
      >
        <!-- クラス基本情報 -->
        <div class="class-header">
          <div class="class-info">
            <h3 class="class-name">{{ classItem.name }}</h3>
            <p class="class-description">{{ classItem.description || '説明なし' }}</p>
            <div class="class-meta">
              <span class="student-count">
                <i class="fas fa-users"></i>
                {{ getClassStudentCount(classItem.id) }}名
              </span>
              <span class="created-date">
                <i class="fas fa-calendar-plus"></i>
                {{ formatDate(classItem.createdAt) }}作成
              </span>
            </div>
          </div>
          <div class="class-actions">
            <button 
              @click.stop="startClassSession(classItem)"
              class="action-btn primary"
            >
              <i class="fas fa-play"></i>
            </button>
            <div class="dropdown">
              <button 
                @click.stop="toggleClassDropdown(classItem.id)" 
                class="action-btn more"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div v-if="openClassDropdown === classItem.id" class="dropdown-menu">
                <button @click.stop="editClass(classItem)">
                  <i class="fas fa-edit"></i> 編集
                </button>
                <button @click.stop="viewClassReport(classItem)">
                  <i class="fas fa-chart-bar"></i> レポート
                </button>
                <button @click.stop="duplicateClass(classItem)">
                  <i class="fas fa-copy"></i> 複製
                </button>
                <button @click.stop="archiveClass(classItem)" class="warning">
                  <i class="fas fa-archive"></i> アーカイブ
                </button>
                <button @click.stop="deleteClass(classItem)" class="danger">
                  <i class="fas fa-trash"></i> 削除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- クラス設定 -->
        <div class="class-settings">
          <div class="setting-item">
            <span class="setting-label">難易度:</span>
            <span class="setting-value">{{ formatDifficulty(classItem.settings.difficultyLevel) }}</span>
          </div>
          <div class="setting-item">
            <span class="setting-label">セッション時間:</span>
            <span class="setting-value">{{ classItem.settings.sessionDuration }}分</span>
          </div>
          <div v-if="classItem.settings.gameRestrictions.length > 0" class="setting-item">
            <span class="setting-label">制限ゲーム:</span>
            <span class="setting-value">{{ classItem.settings.gameRestrictions.length }}個</span>
          </div>
        </div>

        <!-- クラス生徒プレビュー -->
        <div class="class-students-preview">
          <div class="students-avatars">
            <div 
              v-for="student in getClassStudents(classItem.id).slice(0, 4)" 
              :key="student.id"
              class="student-avatar"
              :class="{ 'online': student.isOnline }"
              :title="student.name"
            >
              {{ getStudentInitials(student.name) }}
            </div>
            <div 
              v-if="getClassStudentCount(classItem.id) > 4" 
              class="more-students"
            >
              +{{ getClassStudentCount(classItem.id) - 4 }}
            </div>
          </div>
          <div class="class-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getClassAverageProgress(classItem.id) + '%' }"
              ></div>
            </div>
            <span class="progress-text">
              平均進捗 {{ getClassAverageProgress(classItem.id) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- 空のクラス作成カード -->
      <div 
        v-if="teacherStore.classes.length === 0 || subscriptionStore.checkFeatureAccess('class_management')"
        class="create-class-card"
        @click="showCreateClassModal = true"
      >
        <div class="create-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <h3>新しいクラスを作成</h3>
        <p>生徒をグループ化して効率的に管理しましょう</p>
      </div>
    </div>

    <!-- 選択したクラスの詳細パネル -->
    <div v-if="selectedClass" class="class-detail-panel">
      <div class="panel-header">
        <h3>{{ selectedClass.name }}</h3>
        <button @click="selectedClass = null" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="panel-content">
        <div class="detail-tabs">
          <button 
            v-for="tab in detailTabs" 
            :key="tab.id"
            @click="activeDetailTab = tab.id"
            class="tab-btn"
            :class="{ 'active': activeDetailTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>

        <!-- 生徒タブ -->
        <div v-if="activeDetailTab === 'students'" class="tab-content">
          <div class="students-list">
            <div class="list-header">
              <h4>クラス生徒 ({{ getClassStudentCount(selectedClass.id) }}名)</h4>
              <button @click="showAddStudentToClassModal = true" class="btn-small">
                <i class="fas fa-user-plus"></i>
                生徒を追加
              </button>
            </div>
            <div class="students-table">
              <div 
                v-for="student in getClassStudents(selectedClass.id)" 
                :key="student.id"
                class="student-row"
              >
                <div class="student-basic">
                  <div class="student-avatar" :class="{ 'online': student.isOnline }">
                    {{ getStudentInitials(student.name) }}
                  </div>
                  <div class="student-info">
                    <h5>{{ student.name }}</h5>
                    <p>{{ student.email }}</p>
                  </div>
                </div>
                <div class="student-stats">
                  <span class="level">Lv.{{ student.progress.currentLevel }}</span>
                  <span class="accuracy">{{ student.progress.averageAccuracy }}%</span>
                  <span class="status" :class="student.isOnline ? 'online' : 'offline'">
                    {{ student.isOnline ? 'オンライン' : 'オフライン' }}
                  </span>
                </div>
                <div class="student-actions">
                  <button @click="removeStudentFromClass(student.id)" class="btn-danger-small">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- セッションタブ -->
        <div v-if="activeDetailTab === 'sessions'" class="tab-content">
          <div class="sessions-history">
            <h4>セッション履歴</h4>
            <div class="session-list">
              <div 
                v-for="session in getClassSessions(selectedClass.id)" 
                :key="session.id"
                class="session-item"
              >
                <div class="session-info">
                  <h5>{{ session.name }}</h5>
                  <p>{{ formatSessionTime(session.startTime, session.endTime) }}</p>
                </div>
                <div class="session-stats">
                  <span>参加者: {{ session.participants.length }}名</span>
                  <span>平均スコア: {{ session.analytics.averageScore }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 設定タブ -->
        <div v-if="activeDetailTab === 'settings'" class="tab-content">
          <div class="settings-form">
            <h4>クラス設定</h4>
            <form @submit.prevent="updateClassSettings">
              <div class="form-group">
                <label>クラス名</label>
                <input v-model="selectedClass.name" type="text" />
              </div>
              <div class="form-group">
                <label>説明</label>
                <textarea v-model="selectedClass.description"></textarea>
              </div>
              <div class="form-group">
                <label>難易度レベル</label>
                <select v-model="selectedClass.settings.difficultyLevel">
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">上級</option>
                  <option value="mixed">混合</option>
                </select>
              </div>
              <div class="form-group">
                <label>セッション時間（分）</label>
                <input v-model.number="selectedClass.settings.sessionDuration" type="number" min="10" max="120" />
              </div>
              <button type="submit" class="btn-primary">設定を保存</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- クラス作成モーダル -->
    <div v-if="showCreateClassModal" class="modal-overlay" @click="showCreateClassModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新しいクラスを作成</h3>
          <button @click="showCreateClassModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createNewClass" class="modal-body">
          <div class="form-group">
            <label>クラス名 *</label>
            <input 
              v-model="newClass.name"
              type="text" 
              placeholder="例: 小学3年A組"
              required
            />
          </div>
          <div class="form-group">
            <label>説明</label>
            <textarea 
              v-model="newClass.description"
              placeholder="クラスの説明や目標を入力してください"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>難易度レベル</label>
            <select v-model="newClass.difficultyLevel">
              <option value="beginner">初級 - 基礎から学習</option>
              <option value="intermediate">中級 - バランス重視</option>
              <option value="advanced">上級 - チャレンジング</option>
              <option value="mixed">混合 - 個々に最適化</option>
            </select>
          </div>
          <div class="form-group">
            <label>デフォルトセッション時間</label>
            <select v-model="newClass.sessionDuration">
              <option value="15">15分 - 短時間集中</option>
              <option value="30">30分 - 標準</option>
              <option value="45">45分 - じっくり学習</option>
              <option value="60">60分 - 本格的</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateClassModal = false" class="btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn-primary" :disabled="!newClass.name">
              <i class="fas fa-plus"></i>
              クラスを作成
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
import { useTeacherStore } from '@/stores/teacherStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export default {
  name: 'ClassManagement',
  setup() {
    const router = useRouter()
    const teacherStore = useTeacherStore()
    const subscriptionStore = useSubscriptionStore()
    
    // UI state
    const selectedClass = ref(null)
    const activeDetailTab = ref('students')
    const showCreateClassModal = ref(false)
    const showAddStudentToClassModal = ref(false)
    const showBulkActionsModal = ref(false)
    const openClassDropdown = ref(null)
    
    // Detail tabs
    const detailTabs = [
      { id: 'students', name: '生徒', icon: 'fas fa-users' },
      { id: 'sessions', name: 'セッション', icon: 'fas fa-gamepad' },
      { id: 'settings', name: '設定', icon: 'fas fa-cog' }
    ]
    
    // New class form
    const newClass = reactive({
      name: '',
      description: '',
      difficultyLevel: 'mixed',
      sessionDuration: 30,
      gameRestrictions: []
    })
    
    // Class statistics
    const getTotalStudentsInClasses = () => {
      return teacherStore.students.filter(s => s.classId && s.classId !== 'default').length
    }
    
    const getAverageClassSize = () => {
      if (teacherStore.classes.length === 0) return 0
      return Math.round(getTotalStudentsInClasses() / teacherStore.classes.length)
    }
    
    const getOverallProgress = () => {
      const classStudents = teacherStore.students.filter(s => s.classId && s.classId !== 'default')
      if (classStudents.length === 0) return 0
      const totalProgress = classStudents.reduce((sum, s) => sum + s.progress.currentLevel, 0)
      return Math.round((totalProgress / classStudents.length) * 10) // Assuming max level is 10
    }
    
    const getActiveSessionsCount = () => {
      return teacherStore.activeSessions.length
    }
    
    // Class operations
    const getClassStudents = (classId) => {
      return teacherStore.students.filter(s => s.classId === classId)
    }
    
    const getClassStudentCount = (classId) => {
      return getClassStudents(classId).length
    }
    
    const getClassAverageProgress = (classId) => {
      const students = getClassStudents(classId)
      if (students.length === 0) return 0
      const totalProgress = students.reduce((sum, s) => sum + s.progress.currentLevel, 0)
      return Math.round((totalProgress / students.length) * 10)
    }
    
    const getClassSessions = (classId) => {
      // Filter session history for this class's students
      const classStudentIds = getClassStudents(classId).map(s => s.id)
      return teacherStore.sessionHistory.filter(session => 
        session.participants.some(pid => classStudentIds.includes(pid))
      )
    }
    
    // Actions
    const createNewClass = async () => {
      try {
        const classData = {
          name: newClass.name,
          description: newClass.description,
          difficultyLevel: newClass.difficultyLevel,
          sessionDuration: newClass.sessionDuration,
          gameRestrictions: newClass.gameRestrictions
        }
        
        await teacherStore.createClass(classData)
        
        // Reset form
        Object.assign(newClass, {
          name: '',
          description: '',
          difficultyLevel: 'mixed',
          sessionDuration: 30,
          gameRestrictions: []
        })
        
        showCreateClassModal.value = false
        alert('クラスを作成しました！')
      } catch (error) {
        alert(error.message)
      }
    }
    
    const selectClass = (classItem) => {
      selectedClass.value = classItem
      activeDetailTab.value = 'students'
    }
    
    const startClassSession = (classItem) => {
      const sessionData = {
        name: `${classItem.name} - グループセッション`,
        gameType: 'mixed',
        settings: {
          maxParticipants: getClassStudentCount(classItem.id),
          allowLateJoin: true,
          difficultyLevel: classItem.settings.difficultyLevel,
          duration: classItem.settings.sessionDuration
        }
      }
      
      try {
        const session = teacherStore.startSession(sessionData)
        // Auto-add all online students from this class
        const onlineStudents = getClassStudents(classItem.id).filter(s => s.isOnline)
        onlineStudents.forEach(student => {
          teacherStore.addParticipantToSession(session.id, student.id)
        })
        
        alert(`${classItem.name}のグループセッションを開始しました！\n参加者: ${onlineStudents.length}名`)
      } catch (error) {
        alert(`セッション開始に失敗: ${error.message}`)
      }
    }
    
    const editClass = (classItem) => {
      selectedClass.value = classItem
      activeDetailTab.value = 'settings'
    }
    
    const viewClassReport = async (classItem) => {
      try {
        const report = teacherStore.generateClassSummaryReport(classItem.id)
        logger.log('Class report:', report)
        alert(`${classItem.name}のレポートを生成しました（コンソールを確認）`)
      } catch (error) {
        alert('レポート生成に失敗しました')
      }
    }
    
    const duplicateClass = (classItem) => {
      const duplicateData = {
        name: `${classItem.name} (コピー)`,
        description: classItem.description,
        difficultyLevel: classItem.settings.difficultyLevel,
        sessionDuration: classItem.settings.sessionDuration,
        gameRestrictions: [...classItem.settings.gameRestrictions]
      }
      
      try {
        teacherStore.createClass(duplicateData)
        alert('クラスを複製しました！')
      } catch (error) {
        alert(error.message)
      }
    }
    
    const archiveClass = (classItem) => {
      // Archive functionality - will be added with data retention policy
      alert('アーカイブ機能は開発中です')
    }
    
    const deleteClass = (classItem) => {
      if (confirm(`${classItem.name}を削除してもよろしいですか？\nクラス内の生徒は「未分類」に移動されます。`)) {
        // Move students to default class
        const classStudents = getClassStudents(classItem.id)
        classStudents.forEach(student => {
          student.classId = 'default'
        })
        
        // Remove class
        const index = teacherStore.classes.findIndex(c => c.id === classItem.id)
        if (index !== -1) {
          teacherStore.classes.splice(index, 1)
          if (selectedClass.value?.id === classItem.id) {
            selectedClass.value = null
          }
        }
        
        alert('クラスを削除しました')
      }
    }
    
    const removeStudentFromClass = (studentId) => {
      const student = teacherStore.students.find(s => s.id === studentId)
      if (student && confirm(`${student.name}さんをこのクラスから除外しますか？`)) {
        student.classId = 'default'
        alert(`${student.name}さんを「未分類」に移動しました`)
      }
    }
    
    const updateClassSettings = () => {
      alert('クラス設定を更新しました')
    }
    
    const toggleClassDropdown = (classId) => {
      openClassDropdown.value = openClassDropdown.value === classId ? null : classId
    }
    
    // Utility functions
    const getStudentInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
    }
    
    const formatDifficulty = (level) => {
      const levels = {
        beginner: '初級',
        intermediate: '中級', 
        advanced: '上級',
        mixed: '混合'
      }
      return levels[level] || level
    }
    
    const formatSessionTime = (startTime, endTime) => {
      const start = new Date(startTime)
      const duration = endTime ? Math.round((new Date(endTime) - start) / 60000) : 0
      return `${start.toLocaleString('ja-JP')} (${duration}分)`
    }
    
    onMounted(async () => {
      await teacherStore.initializeTeacherData()
    })
    
    return {
      teacherStore,
      subscriptionStore,
      selectedClass,
      activeDetailTab,
      detailTabs,
      showCreateClassModal,
      showAddStudentToClassModal,
      showBulkActionsModal,
      openClassDropdown,
      newClass,
      getTotalStudentsInClasses,
      getAverageClassSize,
      getOverallProgress,
      getActiveSessionsCount,
      getClassStudents,
      getClassStudentCount,
      getClassAverageProgress,
      getClassSessions,
      createNewClass,
      selectClass,
      startClassSession,
      editClass,
      viewClassReport,
      duplicateClass,
      archiveClass,
      deleteClass,
      removeStudentFromClass,
      updateClassSettings,
      toggleClassDropdown,
      getStudentInitials,
      formatDate,
      formatDifficulty,
      formatSessionTime
    }
  }
}
</script>

<style scoped>
.class-management {
  padding: 1.5rem;
}

.management-header {
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

.total-students {
  color: #64748b;
  font-weight: normal;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.feature-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.warning-content i {
  color: #fbbf24;
  font-size: 1.5rem;
}

.warning-content h4 {
  color: #fbbf24;
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
}

.warning-content p {
  color: #fed7aa;
  margin: 0;
  font-size: 0.9rem;
}

.upgrade-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.upgrade-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
}

.class-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.7;
}

.stat-content h3 {
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.2rem 0;
}

.stat-content p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.class-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.class-card:hover, .class-card.selected {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-color: #3b82f6;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.class-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
}

.class-description {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.class-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.student-count, .created-date {
  color: #64748b;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.class-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.action-btn.primary {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0;
  z-index: 100;
  min-width: 150px;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dropdown-menu button.danger {
  color: #fca5a5;
}

.dropdown-menu button.warning {
  color: #fbbf24;
}

.class-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.setting-label {
  color: #94a3b8;
  font-size: 0.8rem;
}

.setting-value {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.class-students-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;
}

.students-avatars {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.student-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 0.8rem;
  border: 2px solid transparent;
}

.student-avatar.online {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #6ee7b7;
}

.more-students {
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 500;
}

.class-progress {
  flex: 1;
  max-width: 120px;
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
  font-size: 0.75rem;
}

.create-class-card {
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

.create-class-card:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.create-icon {
  font-size: 3rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.create-class-card h3 {
  color: white;
  margin-bottom: 0.5rem;
}

.create-class-card p {
  color: #94a3b8;
  margin: 0;
}

.class-detail-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.detail-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border-bottom: 2px solid #3b82f6;
}

.students-list {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 1rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.list-header h4 {
  color: white;
  margin: 0;
}

.btn-small {
  padding: 0.5rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #93c5fd;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.student-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.student-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.student-basic {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.student-info h5 {
  color: white;
  margin: 0 0 0.2rem 0;
  font-size: 0.9rem;
}

.student-info p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.8rem;
}

.student-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.level {
  color: #a78bfa;
  font-weight: 500;
  font-size: 0.8rem;
}

.accuracy {
  color: #6ee7b7;
  font-size: 0.8rem;
}

.status {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.status.online {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.status.offline {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.btn-danger-small {
  padding: 0.25rem 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.8rem;
}

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
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #64748b;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.settings-form {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 1rem;
}

.settings-form h4 {
  color: white;
  margin: 0 0 1rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .class-management {
    padding: 1rem;
  }

  .management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .class-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .classes-grid {
    grid-template-columns: 1fr;
  }

  .class-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .class-actions {
    align-self: flex-end;
  }

  .class-students-preview {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .detail-tabs {
    flex-wrap: wrap;
  }

  .student-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .student-stats {
    justify-content: space-between;
  }
}
</style>