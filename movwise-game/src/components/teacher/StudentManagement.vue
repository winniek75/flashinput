<template>
  <div class="student-management">
    <!-- ヘッダーセクション -->
    <div class="management-header">
      <div class="header-content">
        <h2 class="section-title">
          <i class="fas fa-users"></i>
          生徒管理
        </h2>
        <p class="section-subtitle">
          {{ teacherStore.totalStudents }}名の生徒を管理中
          <span class="usage-info">
            ({{ subscriptionStore.usage.studentCount }}/{{ subscriptionStore.planDetails.maxStudents === -1 ? '無制限' : subscriptionStore.planDetails.maxStudents }})
          </span>
        </p>
      </div>
      <div class="header-actions">
        <button 
          @click="showAddStudentModal = true"
          class="btn-primary"
          :disabled="!subscriptionStore.canAddStudent"
        >
          <i class="fas fa-user-plus"></i>
          生徒を追加
        </button>
        <button @click="showImportModal = true" class="btn-secondary">
          <i class="fas fa-file-import"></i>
          一括インポート
        </button>
      </div>
    </div>

    <!-- サブスクリプション制限警告 -->
    <div v-if="!subscriptionStore.canAddStudent" class="subscription-warning">
      <div class="warning-content">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <h4>生徒数の上限に達しています</h4>
          <p>現在のプラン（{{ subscriptionStore.planDetails.name }}）では最大{{ subscriptionStore.planDetails.maxStudents }}名まで管理できます。</p>
        </div>
        <router-link to="/subscription" class="upgrade-btn">
          <i class="fas fa-arrow-up"></i>
          プランをアップグレード
        </router-link>
      </div>
    </div>

    <!-- フィルターとソート -->
    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="searchQuery"
          placeholder="生徒名、メールアドレスで検索..."
          type="text"
        />
      </div>
      <div class="filter-controls">
        <select v-model="selectedClass" class="filter-select">
          <option value="">すべてのクラス</option>
          <option v-for="cls in teacherStore.classes" :key="cls.id" :value="cls.id">
            {{ cls.name }}
          </option>
        </select>
        <select v-model="statusFilter" class="filter-select">
          <option value="">すべての状態</option>
          <option value="online">オンライン</option>
          <option value="offline">オフライン</option>
        </select>
        <select v-model="sortBy" class="filter-select">
          <option value="name">名前順</option>
          <option value="joinedAt">参加日時順</option>
          <option value="lastActivity">最終活動順</option>
          <option value="progress">進捗順</option>
        </select>
      </div>
    </div>

    <!-- 生徒リスト -->
    <div class="students-grid">
      <div 
        v-for="student in filteredStudents" 
        :key="student.id"
        class="student-card"
        :class="{ 'online': student.isOnline, 'offline': !student.isOnline }"
      >
        <!-- 生徒基本情報 -->
        <div class="student-header">
          <div class="student-avatar">
            <div class="avatar-circle" :class="{ 'online': student.isOnline }">
              {{ getStudentInitials(student.name) }}
            </div>
            <div v-if="student.isOnline" class="online-indicator"></div>
          </div>
          <div class="student-info">
            <h3 class="student-name">{{ student.name }}</h3>
            <p class="student-email">{{ student.email }}</p>
            <div class="student-meta">
              <span class="join-date">
                <i class="fas fa-calendar-plus"></i>
                {{ formatDate(student.joinedAt) }}参加
              </span>
              <span v-if="student.lastActivity" class="last-activity">
                <i class="fas fa-clock"></i>
                {{ formatRelativeTime(student.lastActivity) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 進捗情報 -->
        <div class="progress-section">
          <div class="progress-item">
            <span class="progress-label">レベル</span>
            <span class="progress-value level">{{ student.progress.currentLevel }}</span>
          </div>
          <div class="progress-item">
            <span class="progress-label">ゲーム数</span>
            <span class="progress-value">{{ student.progress.totalGamesPlayed }}</span>
          </div>
          <div class="progress-item">
            <span class="progress-label">正答率</span>
            <span class="progress-value accuracy">{{ student.progress.averageAccuracy }}%</span>
          </div>
        </div>

        <!-- スキル分析 -->
        <div class="skills-section">
          <div v-if="student.progress.strongAreas.length > 0" class="skills-group strong">
            <h5><i class="fas fa-thumbs-up"></i> 得意分野</h5>
            <div class="skills-tags">
              <span 
                v-for="area in student.progress.strongAreas.slice(0, 3)" 
                :key="area"
                class="skill-tag strong"
              >
                {{ area }}
              </span>
            </div>
          </div>
          <div v-if="student.progress.weakAreas.length > 0" class="skills-group weak">
            <h5><i class="fas fa-exclamation-circle"></i> 改善要素</h5>
            <div class="skills-tags">
              <span 
                v-for="area in student.progress.weakAreas.slice(0, 3)" 
                :key="area"
                class="skill-tag weak"
              >
                {{ area }}
              </span>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="student-actions">
          <button 
            @click="viewStudentDetail(student)"
            class="action-btn view"
          >
            <i class="fas fa-chart-line"></i>
            詳細分析
          </button>
          <button 
            @click="sendMessageToStudent(student)"
            class="action-btn message"
          >
            <i class="fas fa-comment"></i>
            メッセージ
          </button>
          <div class="dropdown">
            <button class="action-btn more" @click="toggleDropdown(student.id)">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div v-if="openDropdown === student.id" class="dropdown-menu">
              <button @click="editStudent(student)">
                <i class="fas fa-edit"></i> 編集
              </button>
              <button @click="moveToClass(student)">
                <i class="fas fa-exchange-alt"></i> クラス移動
              </button>
              <button @click="generateReport(student)" class="report">
                <i class="fas fa-file-alt"></i> レポート生成
              </button>
              <button @click="removeStudent(student)" class="danger">
                <i class="fas fa-trash"></i> 削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-if="filteredStudents.length === 0 && !teacherStore.isLoading" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>生徒が見つかりません</h3>
      <p v-if="searchQuery || selectedClass || statusFilter">
        フィルター条件を調整するか、新しい生徒を追加してください。
      </p>
      <p v-else>
        まだ生徒が追加されていません。最初の生徒を追加して学習を開始しましょう。
      </p>
      <button 
        v-if="!searchQuery && !selectedClass && !statusFilter"
        @click="showAddStudentModal = true"
        class="btn-primary"
        :disabled="!subscriptionStore.canAddStudent"
      >
        <i class="fas fa-user-plus"></i>
        最初の生徒を追加
      </button>
    </div>

    <!-- 生徒追加モーダル -->
    <div v-if="showAddStudentModal" class="modal-overlay" @click="showAddStudentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>新しい生徒を追加</h3>
          <button @click="showAddStudentModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="addNewStudent" class="modal-body">
          <div class="form-group">
            <label>生徒名 *</label>
            <input 
              v-model="newStudent.name"
              type="text" 
              placeholder="生徒の名前"
              required
            />
          </div>
          <div class="form-group">
            <label>メールアドレス *</label>
            <input 
              v-model="newStudent.email"
              type="email" 
              placeholder="student@example.com"
              required
            />
          </div>
          <div class="form-group">
            <label>クラス</label>
            <select v-model="newStudent.classId">
              <option value="">クラスを選択（任意）</option>
              <option v-for="cls in teacherStore.classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddStudentModal = false" class="btn-secondary">
              キャンセル
            </button>
            <button type="submit" class="btn-primary" :disabled="!newStudent.name || !newStudent.email">
              <i class="fas fa-user-plus"></i>
              生徒を追加
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
  name: 'StudentManagement',
  setup() {
    const router = useRouter()
    const teacherStore = useTeacherStore()
    const subscriptionStore = useSubscriptionStore()
    
    // UI state
    const searchQuery = ref('')
    const selectedClass = ref('')
    const statusFilter = ref('')
    const sortBy = ref('name')
    const showAddStudentModal = ref(false)
    const showImportModal = ref(false)
    const openDropdown = ref(null)
    
    // New student form
    const newStudent = reactive({
      name: '',
      email: '',
      classId: ''
    })
    
    // Filtered and sorted students
    const filteredStudents = computed(() => {
      let students = [...teacherStore.students]
      
      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        students = students.filter(student => 
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
        )
      }
      
      // Class filter
      if (selectedClass.value) {
        students = students.filter(student => student.classId === selectedClass.value)
      }
      
      // Status filter
      if (statusFilter.value) {
        students = students.filter(student => 
          statusFilter.value === 'online' ? student.isOnline : !student.isOnline
        )
      }
      
      // Sort
      students.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'joinedAt':
            return new Date(b.joinedAt) - new Date(a.joinedAt)
          case 'lastActivity':
            if (!a.lastActivity) return 1
            if (!b.lastActivity) return -1
            return new Date(b.lastActivity) - new Date(a.lastActivity)
          case 'progress':
            return b.progress.currentLevel - a.progress.currentLevel
          default:
            return 0
        }
      })
      
      return students
    })
    
    // Student actions
    const addNewStudent = async () => {
      try {
        await teacherStore.addStudent({
          name: newStudent.name,
          email: newStudent.email,
          classId: newStudent.classId
        })
        
        // Reset form
        Object.assign(newStudent, { name: '', email: '', classId: '' })
        showAddStudentModal.value = false
        
        alert('生徒を追加しました！')
      } catch (error) {
        alert(error.message)
      }
    }
    
    const removeStudent = (student) => {
      if (confirm(`${student.name}さんを削除してもよろしいですか？`)) {
        teacherStore.removeStudent(student.id)
      }
    }
    
    const viewStudentDetail = (student) => {
      router.push(`/teacher/student/${student.id}`)
    }
    
    const sendMessageToStudent = (student) => {
      // Messaging feature - pending WebSocket integration
      alert(`${student.name}さんにメッセージを送信（未実装）`)
    }
    
    const editStudent = (student) => {
      // Edit functionality - will be added in next update
      alert('編集機能（未実装）')
    }
    
    const moveToClass = (student) => {
      // Class transfer feature - pending backend API
      alert('クラス移動機能（未実装）')
    }
    
    const generateReport = async (student) => {
      try {
        const report = teacherStore.generateStudentProgressReport(student.id, '1month')
        logger.log('Student report:', report)
        alert('レポートを生成しました（コンソールを確認）')
      } catch (error) {
        alert('レポート生成に失敗しました')
      }
    }
    
    const toggleDropdown = (studentId) => {
      openDropdown.value = openDropdown.value === studentId ? null : studentId
    }
    
    // Utility functions
    const getStudentInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ja-JP')
    }
    
    const formatRelativeTime = (dateString) => {
      const now = new Date()
      const date = new Date(dateString)
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 60) return `${diffMins}分前`
      if (diffHours < 24) return `${diffHours}時間前`
      return `${diffDays}日前`
    }
    
    onMounted(async () => {
      await teacherStore.initializeTeacherData()
    })
    
    return {
      teacherStore,
      subscriptionStore,
      searchQuery,
      selectedClass,
      statusFilter,
      sortBy,
      showAddStudentModal,
      showImportModal,
      openDropdown,
      newStudent,
      filteredStudents,
      addNewStudent,
      removeStudent,
      viewStudentDetail,
      sendMessageToStudent,
      editStudent,
      moveToClass,
      generateReport,
      toggleDropdown,
      getStudentInitials,
      formatDate,
      formatRelativeTime
    }
  }
}
</script>

<style scoped>
.student-management {
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

.usage-info {
  color: #64748b;
  font-weight: normal;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.subscription-warning {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.3);
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
  color: #fca5a5;
  font-size: 1.5rem;
}

.warning-content h4 {
  color: #fca5a5;
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
}

.warning-content p {
  color: #fed7d7;
  margin: 0;
  font-size: 0.9rem;
}

.upgrade-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
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
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.search-box input::placeholder {
  color: #64748b;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.student-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.student-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.student-card.online {
  border-left: 4px solid #10b981;
}

.student-card.offline {
  border-left: 4px solid #6b7280;
}

.student-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.student-avatar {
  position: relative;
}

.avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1.1rem;
}

.avatar-circle.online {
  background: linear-gradient(135deg, #10b981, #059669);
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

.student-info {
  flex: 1;
}

.student-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.2rem 0;
}

.student-email {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.student-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.join-date,
.last-activity {
  color: #64748b;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.progress-section {
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

.progress-label {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.progress-value {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.progress-value.level {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-value.accuracy {
  color: #10b981;
}

.skills-section {
  margin-bottom: 1rem;
}

.skills-group {
  margin-bottom: 0.75rem;
}

.skills-group h5 {
  color: #94a3b8;
  font-size: 0.8rem;
  margin: 0 0 0.4rem 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.skill-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.skill-tag.strong {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.skill-tag.weak {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.student-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
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
  gap: 0.3rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.action-btn.message {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
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

.dropdown-menu button.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fed7d7;
}

.dropdown-menu button.report {
  color: #a5b4fc;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

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
.form-group select {
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

.form-group input:focus,
.form-group select:focus {
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

/* Responsive design */
@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .filter-controls {
    justify-content: stretch;
  }

  .filter-select {
    flex: 1;
    min-width: auto;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .progress-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .student-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>