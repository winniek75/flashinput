<template>
  <div class="results-screen galaxy-card rounded-3xl p-8 shadow-2xl">
    <!-- Results Header -->
    <div class="results-header text-center mb-8">
      <div class="result-icon text-8xl mb-4">{{ getResultIcon() }}</div>
      <h2 class="text-4xl font-bold text-white mb-2 text-shadow-lg">
        {{ getResultTitle() }}
      </h2>
      <p class="text-lg text-slate-200">{{ getResultMessage() }}</p>
    </div>

    <!-- Performance Stats -->
    <div class="performance-stats mb-8">
      <h3 class="text-2xl font-bold text-white mb-6 text-center">📊 パフォーマンス結果</h3>
      
      <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="stat-card wpm-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-value">{{ performance.wpm }}</div>
          <div class="stat-label">Words/Min</div>
          <div class="stat-comparison" v-if="getComparison('wpm')">
            <span :class="getComparisonClass('wpm')">
              {{ getComparison('wpm') }}
            </span>
          </div>
        </div>

        <div class="stat-card accuracy-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ performance.accuracy }}%</div>
          <div class="stat-label">正確率</div>
          <div class="stat-comparison" v-if="getComparison('accuracy')">
            <span :class="getComparisonClass('accuracy')">
              {{ getComparison('accuracy') }}
            </span>
          </div>
        </div>

        <div class="stat-card time-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatTime(performance.time) }}</div>
          <div class="stat-label">完了時間</div>
          <div class="stat-comparison" v-if="getComparison('time')">
            <span :class="getComparisonClass('time')">
              {{ getComparison('time') }}
            </span>
          </div>
        </div>

        <div class="stat-card score-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-value">{{ calculateScore() }}</div>
          <div class="stat-label">総合スコア</div>
          <div class="stat-comparison" v-if="getComparison('score')">
            <span :class="getComparisonClass('score')">
              {{ getComparison('score') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Performance -->
    <div class="detailed-performance mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Typing Details -->
        <div class="details-section">
          <h4 class="text-xl font-bold text-white mb-4">📝 入力詳細</h4>
          <div class="details-list">
            <div class="detail-item">
              <span class="detail-label">完了単語数:</span>
              <span class="detail-value">{{ performance.completedWords || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">エラー数:</span>
              <span class="detail-value text-red-400">{{ performance.errors || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最大連続正解:</span>
              <span class="detail-value text-green-400">{{ performance.maxStreak || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">入力文字数:</span>
              <span class="detail-value">{{ performance.totalCharacters || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Ranking & Grade -->
        <div class="details-section">
          <h4 class="text-xl font-bold text-white mb-4">🏅 評価・ランク</h4>
          <div class="ranking-display">
            <div class="grade-badge">
              <span class="grade-icon">{{ getGradeIcon() }}</span>
              <span class="grade-text">{{ getGrade() }}</span>
            </div>
            <div class="ranking-message">
              {{ getRankingMessage() }}
            </div>
            <div class="percentile" v-if="getPercentile()">
              上位 {{ getPercentile() }}% 以内
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rewards Section (Story Mode) -->
    <div v-if="mode === 'story' && rewards" class="rewards-section mb-8">
      <h3 class="text-2xl font-bold text-white mb-6 text-center">🎁 獲得報酬</h3>
      
      <div class="rewards-grid">
        <!-- Experience Gained -->
        <div v-if="rewards.experience" class="reward-item exp-reward">
          <div class="reward-icon">⭐</div>
          <div class="reward-content">
            <div class="reward-name">経験値</div>
            <div class="reward-value">+{{ rewards.experience }} EXP</div>
          </div>
        </div>

        <!-- Pet Experience -->
        <div v-if="rewards.petExperience" class="reward-item pet-exp-reward">
          <div class="reward-icon">🐦</div>
          <div class="reward-content">
            <div class="reward-name">ペット経験値</div>
            <div class="reward-value">+{{ rewards.petExperience }} EXP</div>
          </div>
        </div>

        <!-- New Title -->
        <div v-if="rewards.title" class="reward-item title-reward">
          <div class="reward-icon">👑</div>
          <div class="reward-content">
            <div class="reward-name">新称号獲得</div>
            <div class="reward-value">{{ rewards.title }}</div>
          </div>
        </div>

        <!-- New Pet -->
        <div v-if="rewards.pet" class="reward-item pet-reward">
          <div class="reward-icon">🎊</div>
          <div class="reward-content">
            <div class="reward-name">新ペット獲得</div>
            <div class="reward-value">{{ rewards.pet }}</div>
          </div>
        </div>

        <!-- Achievement -->
        <div v-if="rewards.achievement" class="reward-item achievement-reward">
          <div class="reward-icon">🏆</div>
          <div class="reward-content">
            <div class="reward-name">実績解除</div>
            <div class="reward-value">{{ rewards.achievement }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress & Improvements -->
    <div class="progress-section mb-8">
      <h3 class="text-2xl font-bold text-white mb-6 text-center">📈 上達度チェック</h3>
      
      <div class="progress-chart">
        <div class="chart-container">
          <!-- Simple progress bars for key metrics -->
          <div class="metric-progress">
            <div class="metric-label">タイピング速度</div>
            <div class="progress-bar">
              <div class="progress-fill speed" 
                   :style="{width: getSkillProgress('speed') + '%'}"></div>
            </div>
            <div class="progress-text">{{ getSkillLevel('speed') }}</div>
          </div>

          <div class="metric-progress">
            <div class="metric-label">正確性</div>
            <div class="progress-bar">
              <div class="progress-fill accuracy" 
                   :style="{width: getSkillProgress('accuracy') + '%'}"></div>
            </div>
            <div class="progress-text">{{ getSkillLevel('accuracy') }}</div>
          </div>

          <div class="metric-progress">
            <div class="metric-label">安定性</div>
            <div class="progress-bar">
              <div class="progress-fill consistency" 
                   :style="{width: getSkillProgress('consistency') + '%'}"></div>
            </div>
            <div class="progress-text">{{ getSkillLevel('consistency') }}</div>
          </div>
        </div>
      </div>

      <!-- Improvement Suggestions -->
      <div class="improvement-suggestions mt-6">
        <h4 class="text-lg font-bold text-white mb-3">💡 改善アドバイス</h4>
        <div class="suggestions-list">
          <div v-for="suggestion in getImprovementSuggestions()" :key="suggestion.id" 
               class="suggestion-item">
            <span class="suggestion-icon">{{ suggestion.icon }}</span>
            <span class="suggestion-text">{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons flex gap-4 justify-center flex-wrap">
      <!-- Story Mode Buttons -->
      <template v-if="mode === 'story'">
        <button
          v-if="canContinueStory()"
          @click="$emit('continue-story')"
          class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl"
        >
          🌟 続きを進める
        </button>
        <button
          @click="$emit('restart')"
          class="galaxy-button galaxy-button-accent px-6 py-4 rounded-2xl font-bold text-xl"
        >
          🔄 再挑戦
        </button>
      </template>

      <!-- Practice Mode Buttons -->
      <template v-else>
        <button
          @click="$emit('restart')"
          class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl"
        >
          🔄 もう一度
        </button>
        <button
          @click="$emit('change-level')"
          class="galaxy-button galaxy-button-accent px-6 py-4 rounded-2xl font-bold text-xl"
        >
          📊 レベル変更
        </button>
      </template>

      <!-- Common Buttons -->
      <button
        @click="shareResults"
        class="galaxy-button galaxy-button-secondary px-6 py-4 rounded-2xl font-bold text-xl"
      >
        📱 結果をシェア
      </button>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="share-modal-overlay" @click="closeShareModal">
      <div class="share-modal" @click.stop>
        <h3 class="text-xl font-bold text-white mb-4">結果をシェア</h3>
        <div class="share-content">
          <div class="share-text">
            {{ getShareText() }}
          </div>
          <div class="share-buttons">
            <button @click="copyToClipboard" class="share-button">
              📋 コピー
            </button>
            <button @click="shareToTwitter" class="share-button">
              🐦 Twitter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  mode: {
    type: String, // 'story' or 'practice'
    required: true
  },
  performance: {
    type: Object,
    required: true
  },
  rewards: {
    type: Object,
    default: null
  },
  previousBest: {
    type: Object,
    default: null
  },
  level: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['restart', 'change-level', 'continue-story'])

// Reactive data
const showShareModal = ref(false)

// Computed properties
const isPersonalBest = computed(() => {
  if (!props.previousBest) return true
  return props.performance.wpm > props.previousBest.wpm ||
         props.performance.accuracy > props.previousBest.accuracy
})

// Methods
function getResultIcon() {
  const score = calculateScore()
  if (score >= 800) return '🏆'
  if (score >= 600) return '🥈'
  if (score >= 400) return '🥉'
  if (score >= 200) return '🎯'
  return '📝'
}

function getResultTitle() {
  if (props.mode === 'story') {
    return props.rewards?.victory ? 'ステージクリア！' : 'チャレンジ完了！'
  }
  
  const score = calculateScore()
  if (score >= 800) return '完璧な成績！'
  if (score >= 600) return '素晴らしい成績！'
  if (score >= 400) return '良い成績！'
  if (score >= 200) return '頑張りました！'
  return '練習を続けましょう！'
}

function getResultMessage() {
  if (isPersonalBest.value) {
    return '自己ベスト更新！素晴らしい成長です！'
  }
  
  if (props.mode === 'story') {
    return 'ストーリーモードでの挑戦、お疲れ様でした！'
  }
  
  return 'タイピング練習、お疲れ様でした！'
}

function calculateScore() {
  const wpm = props.performance.wpm || 0
  const accuracy = props.performance.accuracy || 0
  return Math.round(wpm * (accuracy / 100) * 10)
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function getComparison(metric) {
  if (!props.previousBest) return null
  
  const current = props.performance[metric]
  const previous = props.previousBest[metric]
  
  if (!current || !previous) return null
  
  const diff = current - previous
  if (Math.abs(diff) < 1) return null
  
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff}`
}

function getComparisonClass(metric) {
  const comparison = getComparison(metric)
  if (!comparison) return ''
  
  if (metric === 'time') {
    return comparison.startsWith('+') ? 'comparison-worse' : 'comparison-better'
  }
  
  return comparison.startsWith('+') ? 'comparison-better' : 'comparison-worse'
}

function getGradeIcon() {
  const score = calculateScore()
  if (score >= 900) return '🌟'
  if (score >= 800) return '💎'
  if (score >= 700) return '🥇'
  if (score >= 600) return '🥈'
  if (score >= 500) return '🥉'
  if (score >= 400) return '🎖️'
  if (score >= 300) return '🏅'
  return '📜'
}

function getGrade() {
  const score = calculateScore()
  if (score >= 900) return 'SSS'
  if (score >= 800) return 'SS'
  if (score >= 700) return 'S'
  if (score >= 600) return 'A'
  if (score >= 500) return 'B'
  if (score >= 400) return 'C'
  if (score >= 300) return 'D'
  return 'E'
}

function getRankingMessage() {
  const score = calculateScore()
  if (score >= 800) return 'タイピングマスター級！'
  if (score >= 600) return '上級者レベル！'
  if (score >= 400) return '中級者レベル！'
  if (score >= 200) return '初級者レベル'
  return '練習を続けましょう！'
}

function getPercentile() {
  const score = calculateScore()
  if (score >= 800) return 5
  if (score >= 700) return 10
  if (score >= 600) return 25
  if (score >= 500) return 50
  return null
}

function getSkillProgress(skill) {
  const performance = props.performance
  
  switch (skill) {
    case 'speed':
      return Math.min((performance.wpm / 100) * 100, 100)
    case 'accuracy':
      return performance.accuracy
    case 'consistency':
      const errorRate = (performance.errors || 0) / Math.max(performance.totalCharacters || 1, 1)
      return Math.max(0, (1 - errorRate) * 100)
    default:
      return 0
  }
}

function getSkillLevel(skill) {
  const progress = getSkillProgress(skill)
  
  if (progress >= 90) return 'エキスパート'
  if (progress >= 80) return '上級'
  if (progress >= 70) return '中上級'
  if (progress >= 60) return '中級'
  if (progress >= 50) return '初中級'
  if (progress >= 40) return '初級'
  return '練習中'
}

function getImprovementSuggestions() {
  const suggestions = []
  const performance = props.performance
  
  if (performance.wpm < 30) {
    suggestions.push({
      id: 'speed',
      icon: '⚡',
      text: 'ホームポジションを意識して、徐々にスピードを上げていきましょう'
    })
  }
  
  if (performance.accuracy < 90) {
    suggestions.push({
      id: 'accuracy',
      icon: '🎯',
      text: 'スピードよりも正確性を重視して練習しましょう'
    })
  }
  
  if ((performance.errors || 0) > 5) {
    suggestions.push({
      id: 'errors',
      icon: '🔍',
      text: '間違いやすい文字パターンを重点的に練習しましょう'
    })
  }
  
  if ((performance.maxStreak || 0) < 10) {
    suggestions.push({
      id: 'consistency',
      icon: '🎵',
      text: 'リズムを意識して、一定のペースで入力を続けましょう'
    })
  }
  
  if (suggestions.length === 0) {
    suggestions.push({
      id: 'excellent',
      icon: '🌟',
      text: '素晴らしい成績です！この調子で練習を続けましょう'
    })
  }
  
  return suggestions
}

function canContinueStory() {
  return props.mode === 'story' && 
         props.rewards?.victory !== false &&
         calculateScore() >= 300
}

function shareResults() {
  showShareModal.value = true
}

function closeShareModal() {
  showShareModal.value = false
}

function getShareText() {
  const grade = getGrade()
  const wpm = props.performance.wpm
  const accuracy = props.performance.accuracy
  
  return `英検タイピング・アリーナの結果！\n` +
         `📊 WPM: ${wpm} | 正確率: ${accuracy}% | グレード: ${grade}\n` +
         `🎮 ${props.mode === 'story' ? 'ストーリーモード' : '練習モード'}\n` +
         `#英検タイピング #タイピング練習`
}

function copyToClipboard() {
  navigator.clipboard.writeText(getShareText()).then(() => {
    alert('クリップボードにコピーしました！')
    closeShareModal()
  })
}

function shareToTwitter() {
  const text = encodeURIComponent(getShareText())
  const url = `https://twitter.com/intent/tweet?text=${text}`
  window.open(url, '_blank')
  closeShareModal()
}
</script>

<style scoped>
/* Results Header */
.results-header {
  animation: result-appear 1s ease-out;
}

@keyframes result-appear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.result-icon {
  filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.3));
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Performance Stats */
.stats-grid {
  animation: stats-slide-in 0.8s ease-out 0.3s both;
}

@keyframes stats-slide-in {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-card {
  @apply p-6 rounded-2xl text-center;
  background: linear-gradient(135deg, rgba(60, 60, 120, 0.8), rgba(40, 40, 80, 0.8));
  border: 2px solid rgba(147, 51, 234, 0.4);
  transition: all 0.3s ease;
}

.stat-card:hover {
  @apply transform scale-105;
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.3);
}

.stat-icon {
  @apply text-3xl mb-2;
}

.stat-value {
  @apply text-3xl font-bold text-white mb-1;
}

.stat-label {
  @apply text-sm text-slate-400;
}

.stat-comparison {
  @apply mt-2 text-sm font-bold;
}

.comparison-better {
  @apply text-green-400;
}

.comparison-worse {
  @apply text-red-400;
}

/* Specific stat card colors */
.wpm-card {
  border-color: rgba(245, 158, 11, 0.4);
}

.wpm-card .stat-value {
  @apply text-yellow-400;
}

.accuracy-card {
  border-color: rgba(34, 197, 94, 0.4);
}

.accuracy-card .stat-value {
  @apply text-green-400;
}

.time-card {
  border-color: rgba(59, 130, 246, 0.4);
}

.time-card .stat-value {
  @apply text-blue-400;
}

.score-card {
  border-color: rgba(168, 85, 247, 0.4);
}

.score-card .stat-value {
  @apply text-purple-400;
}

/* Detailed Performance */
.details-section {
  @apply p-6 rounded-2xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.6), rgba(60, 60, 120, 0.6));
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.details-list {
  @apply space-y-3;
}

.detail-item {
  @apply flex justify-between items-center py-2 border-b border-slate-600 last:border-b-0;
}

.detail-label {
  @apply text-sm text-slate-400;
}

.detail-value {
  @apply font-bold text-white;
}

.ranking-display {
  @apply text-center space-y-4;
}

.grade-badge {
  @apply inline-flex items-center gap-3 px-6 py-3 rounded-full;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.grade-icon {
  @apply text-2xl;
}

.grade-text {
  @apply text-xl font-bold text-white;
}

.ranking-message {
  @apply text-lg font-semibold text-yellow-400;
}

.percentile {
  @apply text-sm text-slate-300;
}

/* Rewards Section */
.rewards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.reward-item {
  @apply flex items-center gap-4 p-4 rounded-xl;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
  border: 2px solid rgba(34, 197, 94, 0.4);
  animation: reward-appear 0.6s ease-out;
}

@keyframes reward-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.reward-icon {
  @apply text-3xl;
}

.reward-name {
  @apply text-sm font-semibold text-green-400;
}

.reward-value {
  @apply text-lg font-bold text-white;
}

/* Progress Section */
.progress-chart {
  @apply p-6 rounded-2xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.6), rgba(60, 60, 120, 0.6));
}

.metric-progress {
  @apply mb-4 last:mb-0;
}

.metric-label {
  @apply text-sm font-semibold text-white mb-2;
}

.progress-bar {
  @apply w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-1;
}

.progress-fill {
  @apply h-full transition-all duration-1000 ease-out;
}

.progress-fill.speed {
  @apply bg-gradient-to-r from-yellow-500 to-orange-500;
}

.progress-fill.accuracy {
  @apply bg-gradient-to-r from-green-500 to-emerald-500;
}

.progress-fill.consistency {
  @apply bg-gradient-to-r from-blue-500 to-purple-500;
}

.progress-text {
  @apply text-xs text-slate-400;
}

/* Improvement Suggestions */
.suggestions-list {
  @apply space-y-2;
}

.suggestion-item {
  @apply flex items-start gap-3 p-3 rounded-lg;
  background: rgba(40, 40, 80, 0.4);
}

.suggestion-icon {
  @apply text-lg mt-0.5;
}

.suggestion-text {
  @apply text-sm text-slate-200 flex-1;
}

/* Action Buttons */
.action-buttons {
  animation: buttons-slide-up 0.8s ease-out 0.6s both;
}

@keyframes buttons-slide-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Share Modal */
.share-modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.share-modal {
  @apply p-6 rounded-2xl max-w-md w-full mx-4;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.95), rgba(60, 60, 120, 0.95));
  border: 2px solid rgba(147, 51, 234, 0.4);
}

.share-content {
  @apply space-y-4;
}

.share-text {
  @apply p-4 rounded-lg text-sm text-slate-200 font-mono;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.share-buttons {
  @apply flex gap-3;
}

.share-button {
  @apply flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  border: none;
  cursor: pointer;
}

.share-button:hover {
  @apply transform scale-105;
}

/* Text shadows for readability */
.text-shadow-lg {
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.9),
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(0, 0, 0, 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-grid {
    @apply grid-cols-2 gap-4;
  }
  
  .stat-card {
    @apply p-4;
  }
  
  .stat-icon {
    @apply text-2xl;
  }
  
  .stat-value {
    @apply text-2xl;
  }
  
  .rewards-grid {
    @apply grid-cols-1;
  }
  
  .action-buttons {
    @apply flex-col;
  }
}
</style>