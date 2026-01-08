<template>
  <div class="teacher-dashboard">
    <header class="dashboard-header">
      <h1>📊 生徒進捗管理ダッシュボード</h1>
      <div class="filter-options">
        <select v-model="classFilter" @change="updateStudentList">
          <option value="">全クラス</option>
          <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
        </select>
        <select v-model="levelFilter" @change="updateStudentList">
          <option value="">全レベル</option>
          <option v-for="level in levelOptions" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
    </header>

    <!-- 概要統計 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ filteredStudents.length }}</div>
          <div class="stat-label">総生徒数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ averageLevel.toFixed(1) }}</div>
          <div class="stat-label">平均レベル</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚀</div>
        <div class="stat-info">
          <div class="stat-value">{{ vrReadyStudents }}</div>
          <div class="stat-label">VR準備完了</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ activeStudents }}</div>
          <div class="stat-label">今週活動</div>
        </div>
      </div>
    </div>

    <!-- レベル分布グラフ -->
    <div class="level-distribution">
      <h2>レベル分布</h2>
      <div class="distribution-chart">
        <div 
          v-for="(count, level) in levelDistribution" 
          :key="level"
          class="level-bar"
          :style="{ height: (count / maxLevelCount) * 100 + '%' }"
        >
          <div class="bar-count">{{ count }}</div>
          <div class="bar-level">Lv.{{ level }}</div>
        </div>
      </div>
    </div>

    <!-- 生徒一覧 -->
    <div class="students-list">
      <h2>生徒一覧</h2>
      <div class="students-grid">
        <div 
          v-for="student in filteredStudents" 
          :key="student.id"
          class="student-card"
          @click="selectStudent(student)"
          :class="{ selected: selectedStudent?.id === student.id }"
        >
          <div class="student-header">
            <div class="student-avatar">{{ student.avatar || '👤' }}</div>
            <div class="student-basic">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-class">{{ student.class }}</div>
            </div>
            <div class="student-level">
              <div class="level-badge">Lv.{{ student.unifiedLevel }}</div>
              <div class="eiken-badge">{{ student.eikenLevel }}</div>
            </div>
          </div>
          
          <!-- スキルレベル表示 -->
          <div class="skill-indicators">
            <div 
              v-for="(level, skill) in student.skillLevels" 
              :key="skill"
              class="skill-indicator"
              :title="getSkillName(skill) + ': Lv.' + level"
            >
              <div class="skill-icon">{{ getSkillIcon(skill) }}</div>
              <div class="skill-bar">
                <div 
                  class="skill-fill"
                  :style="{ width: level + '%' }"
                  :class="'skill-' + skill"
                ></div>
              </div>
              <div class="skill-level-text">{{ level }}</div>
            </div>
          </div>

          <!-- 活動状況 -->
          <div class="activity-status">
            <div class="last-activity">
              {{ formatLastActivity(student.lastActivity) }}
            </div>
            <div class="activity-indicators">
              <span 
                v-if="student.isActive" 
                class="indicator active"
                title="今週活動中"
              >🟢</span>
              <span 
                v-if="student.isVrReady" 
                class="indicator vr-ready"
                title="VR準備完了"
              >🚀</span>
              <span 
                v-if="student.needsAttention" 
                class="indicator needs-attention"
                title="要注意"
              >⚠️</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生徒詳細モーダル -->
    <div v-if="selectedStudent" class="student-modal-overlay" @click="closeStudentModal">
      <div class="student-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedStudent.name }} の詳細</h3>
          <button @click="closeStudentModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-content">
          <!-- レベル情報 -->
          <div class="level-section">
            <h4>レベル情報</h4>
            <div class="level-details">
              <div class="level-main">
                <span class="level-number">Lv.{{ selectedStudent.unifiedLevel }}</span>
                <span class="eiken-info">{{ selectedStudent.eikenLevel }} ({{ selectedStudent.eikenGrade }})</span>
              </div>
              <div class="progress-info">
                次のレベルまで: {{ calculateProgressToNext(selectedStudent) }}%
              </div>
            </div>
          </div>

          <!-- スキル詳細 -->
          <div class="skills-section">
            <h4>スキル詳細</h4>
            <div class="skills-detail">
              <div 
                v-for="(level, skill) in selectedStudent.skillLevels" 
                :key="skill"
                class="skill-detail"
              >
                <div class="skill-header">
                  <span class="skill-name">{{ getSkillName(skill) }}</span>
                  <span class="skill-level">Lv.{{ level }}</span>
                </div>
                <div class="skill-progress-bar">
                  <div 
                    class="skill-progress-fill"
                    :style="{ width: level + '%' }"
                    :class="'skill-' + skill"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 推奨アクション -->
          <div class="recommendations-section">
            <h4>推奨アクション</h4>
            <div class="recommendations">
              <div 
                v-for="rec in getRecommendations(selectedStudent)" 
                :key="rec.type"
                class="recommendation"
                :class="rec.priority"
              >
                <div class="rec-icon">{{ rec.icon }}</div>
                <div class="rec-content">
                  <div class="rec-title">{{ rec.title }}</div>
                  <div class="rec-description">{{ rec.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学習履歴 -->
          <div class="history-section">
            <h4>最近の学習履歴</h4>
            <div class="learning-history">
              <div 
                v-for="history in selectedStudent.recentHistory" 
                :key="history.date"
                class="history-item"
              >
                <div class="history-date">{{ formatDate(history.date) }}</div>
                <div class="history-game">{{ history.game }}</div>
                <div class="history-score">{{ history.score }}点</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// データ
const students = ref([])
const selectedStudent = ref(null)
const classFilter = ref('')
const levelFilter = ref('')

// クラス一覧
const classes = ref(['1年A組', '1年B組', '2年A組', '2年B組', '3年A組', '3年B組'])

// レベルフィルターオプション
const levelOptions = ref([
  { value: '1-15', label: '初級 (Lv.1-15)' },
  { value: '16-40', label: '中級 (Lv.16-40)' },
  { value: '41-75', label: '上級 (Lv.41-75)' },
  { value: '76-100', label: '最上級 (Lv.76-100)' }
])

// フィルター済み生徒リスト
const filteredStudents = computed(() => {
  let filtered = students.value

  if (classFilter.value) {
    filtered = filtered.filter(s => s.class === classFilter.value)
  }

  if (levelFilter.value) {
    const [min, max] = levelFilter.value.split('-').map(Number)
    filtered = filtered.filter(s => s.unifiedLevel >= min && s.unifiedLevel <= max)
  }

  return filtered
})

// 統計計算
const averageLevel = computed(() => {
  if (filteredStudents.value.length === 0) return 0
  const sum = filteredStudents.value.reduce((acc, s) => acc + s.unifiedLevel, 0)
  return sum / filteredStudents.value.length
})

const vrReadyStudents = computed(() => {
  return filteredStudents.value.filter(s => s.isVrReady).length
})

const activeStudents = computed(() => {
  return filteredStudents.value.filter(s => s.isActive).length
})

// レベル分布
const levelDistribution = computed(() => {
  const distribution = {}
  const levelRanges = [
    { range: '1-5', min: 1, max: 5 },
    { range: '6-15', min: 6, max: 15 },
    { range: '16-25', min: 16, max: 25 },
    { range: '26-40', min: 26, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-75', min: 61, max: 75 },
    { range: '76-85', min: 76, max: 85 },
    { range: '86-100', min: 86, max: 100 }
  ]

  levelRanges.forEach(range => {
    distribution[range.range] = filteredStudents.value.filter(
      s => s.unifiedLevel >= range.min && s.unifiedLevel <= range.max
    ).length
  })

  return distribution
})

const maxLevelCount = computed(() => {
  return Math.max(...Object.values(levelDistribution.value))
})

// メソッド
const updateStudentList = () => {
  // フィルター変更時の処理
}

const selectStudent = (student) => {
  selectedStudent.value = student
}

const closeStudentModal = () => {
  selectedStudent.value = null
}

const getSkillIcon = (skill) => {
  const icons = {
    phonics: '🔤',
    vocabulary: '📚',
    grammar: '⚙️',
    communication: '💬'
  }
  return icons[skill] || '🎯'
}

const getSkillName = (skill) => {
  const names = {
    phonics: 'フォニックス',
    vocabulary: '語彙力',
    grammar: '文法力',
    communication: '会話力'
  }
  return names[skill] || skill
}

const formatLastActivity = (date) => {
  if (!date) return '未活動'
  const now = new Date()
  const activity = new Date(date)
  const diffHours = Math.floor((now - activity) / (1000 * 60 * 60))
  
  if (diffHours < 1) return '1時間以内'
  if (diffHours < 24) return `${diffHours}時間前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}日前`
  return '1週間以上前'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const calculateProgressToNext = (student) => {
  const currentLevel = student.unifiedLevel
  const skills = student.skillLevels
  const skillSum = Object.values(skills).reduce((sum, level) => sum + level, 0)
  const nextLevelRequired = (currentLevel + 1) * 4
  
  return Math.min(100, Math.round((skillSum / nextLevelRequired) * 100))
}

const getRecommendations = (student) => {
  const recommendations = []
  const skills = student.skillLevels
  
  // 最も低いスキルを特定
  const lowestSkill = Object.entries(skills).reduce((a, b) => 
    skills[a[0]] < skills[b[0]] ? a : b
  )
  
  // スキル別推奨
  if (lowestSkill[1] < 30) {
    recommendations.push({
      type: 'skill-focus',
      priority: 'high',
      icon: '🎯',
      title: `${getSkillName(lowestSkill[0])}の強化`,
      description: `${getSkillName(lowestSkill[0])}が他のスキルより低いです。集中的な練習をお勧めします。`
    })
  }
  
  // VR準備度チェック
  if (student.unifiedLevel >= 25 && !student.isVrReady) {
    recommendations.push({
      type: 'vr-ready',
      priority: 'medium',
      icon: '🚀',
      title: 'VR体験の準備',
      description: 'レベルが十分です。VR体験に挑戦してみましょう。'
    })
  }
  
  // 活動状況チェック
  if (!student.isActive) {
    recommendations.push({
      type: 'motivation',
      priority: 'high',
      icon: '⚡',
      title: 'モチベーション向上',
      description: '最近の活動が少ないようです。楽しいゲームから始めてみましょう。'
    })
  }
  
  return recommendations
}

// サンプルデータ生成
const generateSampleData = () => {
  const sampleStudents = []
  const names = ['田中太郎', '佐藤花子', '鈴木次郎', '高橋美咲', '渡辺健太', '中村さくら', '小林大輔', '加藤優花']
  
  for (let i = 0; i < 24; i++) {
    const level = Math.floor(Math.random() * 100) + 1
    const student = {
      id: i + 1,
      name: names[i % names.length] + (Math.floor(i / names.length) + 1),
      class: classes.value[Math.floor(Math.random() * classes.value.length)],
      avatar: ['👦', '👧', '🧒'][Math.floor(Math.random() * 3)],
      unifiedLevel: level,
      skillLevels: {
        phonics: Math.max(1, level + Math.floor(Math.random() * 20) - 10),
        vocabulary: Math.max(1, level + Math.floor(Math.random() * 20) - 10),
        grammar: Math.max(1, level + Math.floor(Math.random() * 20) - 10),
        communication: Math.max(1, level + Math.floor(Math.random() * 20) - 10)
      },
      eikenLevel: getEikenLevel(level),
      eikenGrade: getEikenGrade(level),
      isActive: Math.random() > 0.3,
      isVrReady: level >= 25 && Math.random() > 0.4,
      needsAttention: Math.random() > 0.8,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      recentHistory: generateRecentHistory()
    }
    sampleStudents.push(student)
  }
  
  students.value = sampleStudents
}

const getEikenLevel = (level) => {
  if (level <= 5) return '英検5級準備'
  if (level <= 15) return '英検5級'
  if (level <= 25) return '英検4級準備'
  if (level <= 40) return '英検4級'
  if (level <= 60) return '英検3級'
  if (level <= 75) return '英検準2級'
  if (level <= 85) return '英検2級'
  if (level <= 95) return '英検準1級'
  return '英検1級'
}

const getEikenGrade = (level) => {
  if (level <= 5) return '小学1-2年'
  if (level <= 15) return '小学3-4年'
  if (level <= 25) return '小学5-6年'
  if (level <= 40) return '中学1-2年'
  if (level <= 60) return '中学3年'
  if (level <= 75) return '高校1-2年'
  if (level <= 85) return '高校3年'
  if (level <= 95) return '大学1-2年'
  return '大学3-4年+'
}

const generateRecentHistory = () => {
  const games = ['Word Rush', 'Phonics Lab', 'Grammar Hunt', 'Sound Master']
  const history = []
  
  for (let i = 0; i < 5; i++) {
    history.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      game: games[Math.floor(Math.random() * games.length)],
      score: Math.floor(Math.random() * 100) + 1
    })
  }
  
  return history
}

onMounted(() => {
  generateSampleData()
})
</script>

<style scoped>
.teacher-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
  color: #2d3748;
  margin: 0;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2.5em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-value {
  font-size: 2em;
  font-weight: bold;
  color: #2d3748;
}

.stat-label {
  color: #718096;
  font-size: 0.9em;
}

.level-distribution {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.level-distribution h2 {
  margin: 0 0 20px 0;
  color: #2d3748;
}

.distribution-chart {
  display: flex;
  align-items: end;
  gap: 10px;
  height: 200px;
}

.level-bar {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 0.8em;
}

.bar-count {
  margin-top: 5px;
  font-weight: bold;
}

.bar-level {
  position: absolute;
  bottom: -25px;
  color: #4a5568;
  font-size: 0.75em;
}

.students-list {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.students-list h2 {
  margin: 0 0 20px 0;
  color: #2d3748;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.student-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.student-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.student-card.selected {
  border-color: #667eea;
  background: #f7f9ff;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.student-avatar {
  font-size: 2em;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 50%;
}

.student-basic {
  flex: 1;
}

.student-name {
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 2px;
}

.student-class {
  color: #718096;
  font-size: 0.9em;
}

.level-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
  margin-bottom: 4px;
}

.eiken-badge {
  background: #e2e8f0;
  color: #4a5568;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7em;
}

.skill-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.skill-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-icon {
  font-size: 1.2em;
  width: 24px;
}

.skill-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.skill-phonics { background: #ff6b6b; }
.skill-vocabulary { background: #4ecdc4; }
.skill-grammar { background: #45b7d1; }
.skill-communication { background: #f9ca24; }

.skill-level-text {
  font-size: 0.8em;
  color: #718096;
  min-width: 20px;
}

.activity-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-activity {
  font-size: 0.8em;
  color: #718096;
}

.activity-indicators {
  display: flex;
  gap: 5px;
}

.indicator {
  font-size: 0.8em;
}

/* モーダル */
.student-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.student-modal {
  background: white;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #718096;
}

.modal-content {
  padding: 20px;
}

.level-section, .skills-section, .recommendations-section, .history-section {
  margin-bottom: 25px;
}

.level-section h4, .skills-section h4, .recommendations-section h4, .history-section h4 {
  margin: 0 0 15px 0;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 5px;
}

.level-details {
  background: #f7f9ff;
  padding: 15px;
  border-radius: 8px;
}

.level-main {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.level-number {
  font-size: 1.5em;
  font-weight: bold;
  color: #667eea;
}

.eiken-info {
  color: #4a5568;
}

.progress-info {
  color: #718096;
  font-size: 0.9em;
}

.skills-detail {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.skill-detail {
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skill-progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation.high {
  background: #fed7d7;
  border-color: #e53e3e;
}

.recommendation.medium {
  background: #fefcbf;
  border-color: #d69e2e;
}

.rec-icon {
  font-size: 1.5em;
}

.rec-title {
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 4px;
}

.rec-description {
  color: #4a5568;
  font-size: 0.9em;
}

.learning-history {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
}

.history-date {
  color: #718096;
  font-size: 0.9em;
}

.history-game {
  color: #2d3748;
  font-weight: 500;
}

.history-score {
  color: #667eea;
  font-weight: bold;
}

@media (max-width: 768px) {
  .teacher-dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .distribution-chart {
    height: 150px;
  }
}
</style>