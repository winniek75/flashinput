<template>
  <div class="learning-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-btn">
            <span class="back-icon">←</span>
            <span>Word Galaxy</span>
          </button>
          <div class="title-section">
            <h1 class="dashboard-title">
              <span class="title-icon">📊</span>
              Learning Dashboard
            </h1>
            <p class="dashboard-subtitle">学習進捗と統計の詳細分析</p>
          </div>
        </div>

        <div class="header-stats">
          <div class="quick-stat">
            <span class="stat-icon">⭐</span>
            <span class="stat-value">Lv.{{ playerLevel }}</span>
          </div>
          <div class="quick-stat">
            <span class="stat-icon">💎</span>
            <span class="stat-value">{{ crystals }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Overview Cards -->
      <div class="overview-section">
        <h2 class="section-title">📈 学習概要</h2>

        <div class="overview-grid">
          <div class="overview-card words-learned">
            <div class="card-icon">📚</div>
            <div class="card-content">
              <div class="card-number">{{ totalWordsLearned }}</div>
              <div class="card-label">学習済み単語</div>
              <div class="card-trend">
                <span class="trend-icon">↗️</span>
                <span class="trend-text">+{{ recentWordsLearned }} 今週</span>
              </div>
            </div>
          </div>

          <div class="overview-card mastery-rate">
            <div class="card-icon">🎯</div>
            <div class="card-content">
              <div class="card-number">{{ masteryRate }}%</div>
              <div class="card-label">マスタリー率</div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: masteryRate + '%' }"></div>
              </div>
            </div>
          </div>

          <div class="overview-card study-time">
            <div class="card-icon">⏰</div>
            <div class="card-content">
              <div class="card-number">{{ totalStudyHours }}h</div>
              <div class="card-label">総学習時間</div>
              <div class="card-trend">
                <span class="trend-icon">🔥</span>
                <span class="trend-text">{{ avgSessionTime }}min/日</span>
              </div>
            </div>
          </div>

          <div class="overview-card streak-count">
            <div class="card-icon">🔥</div>
            <div class="card-content">
              <div class="card-number">{{ currentStreak }}</div>
              <div class="card-label">連続学習日数</div>
              <div class="card-trend">
                <span class="trend-icon">👑</span>
                <span class="trend-text">最高 {{ longestStreak }}日</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats -->
      <div class="stats-section">
        <div class="stats-grid">
          <!-- Learning Progress Chart -->
          <div class="stat-card progress-chart">
            <h3 class="card-title">📈 学習進捗推移</h3>
            <div class="chart-container">
              <div class="chart-placeholder">
                <p>📊 学習データをチャート表示（開発中）</p>
                <div class="mock-chart">
                  <div class="chart-bar" style="height: 60%"></div>
                  <div class="chart-bar" style="height: 80%"></div>
                  <div class="chart-bar" style="height: 70%"></div>
                  <div class="chart-bar" style="height: 90%"></div>
                  <div class="chart-bar" style="height: 85%"></div>
                  <div class="chart-bar" style="height: 95%"></div>
                  <div class="chart-bar" style="height: 100%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Difficulty Distribution -->
          <div class="stat-card difficulty-dist">
            <h3 class="card-title">🎚️ 難易度別進捗</h3>
            <div class="difficulty-levels">
              <div class="difficulty-item" v-for="level in difficultyLevels" :key="level.name">
                <div class="difficulty-header">
                  <span class="difficulty-name">{{ level.name }}</span>
                  <span class="difficulty-progress">{{ level.progress }}%</span>
                </div>
                <div class="difficulty-bar">
                  <div class="difficulty-fill" :style="{ width: level.progress + '%' }"></div>
                </div>
                <div class="difficulty-stats">
                  <span class="stat-item">{{ level.mastered }}/{{ level.total }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="stat-card recent-activity">
            <h3 class="card-title">⚡ 最近の活動</h3>
            <div class="activity-list">
              <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                <div class="activity-icon">{{ activity.icon }}</div>
                <div class="activity-content">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ activity.time }}</div>
                </div>
                <div class="activity-reward" v-if="activity.reward">
                  +{{ activity.reward }}{{ activity.rewardType }}
                </div>
              </div>
            </div>
          </div>

          <!-- Battle Stats -->
          <div class="stat-card battle-stats">
            <h3 class="card-title">⚔️ Vocabulary Arena 統計</h3>
            <div class="battle-overview">
              <div class="battle-record">
                <div class="record-item">
                  <span class="record-label">勝利</span>
                  <span class="record-value wins">{{ battleWins }}</span>
                </div>
                <div class="record-item">
                  <span class="record-label">敗北</span>
                  <span class="record-value losses">{{ battleLosses }}</span>
                </div>
                <div class="record-item">
                  <span class="record-label">勝率</span>
                  <span class="record-value rate">{{ battleWinRate }}%</span>
                </div>
              </div>

              <div class="current-rank">
                <div class="rank-display">
                  <span class="rank-icon">🏆</span>
                  <span class="rank-text">{{ currentRank }}</span>
                </div>
                <div class="elo-rating">
                  <span class="elo-label">ELO Rating:</span>
                  <span class="elo-value">{{ currentElo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h2 class="section-title">🚀 クイックアクション</h2>
        <div class="action-grid">
          <button @click="goToMemoryStation" class="action-btn memory">
            <span class="btn-icon">🧠</span>
            <span class="btn-text">Memory Station</span>
          </button>

          <button @click="goToDailyMission" class="action-btn mission">
            <span class="btn-icon">📅</span>
            <span class="btn-text">Daily Mission</span>
          </button>

          <button @click="goToVocabularyArena" class="action-btn arena">
            <span class="btn-icon">⚔️</span>
            <span class="btn-text">Vocabulary Arena</span>
          </button>

          <button @click="exportData" class="action-btn export">
            <span class="btn-icon">💾</span>
            <span class="btn-text">データエクスポート</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useWordGalaxyStore } from '@/stores/word-galaxy/wordGalaxy';
import { useMemoryStationStore } from '@/stores/word-galaxy/memoryStation';
import { useDailyMissionStore } from '@/stores/word-galaxy/dailyMission';
import { useVocabularyArenaStore } from '@/stores/word-galaxy/vocabularyArena';

// Router & Stores
const router = useRouter();
const wordGalaxyStore = useWordGalaxyStore();
const memoryStore = useMemoryStationStore();
const dailyMissionStore = useDailyMissionStore();
const vocabularyArenaStore = useVocabularyArenaStore();

// Mock data (実際の実装では stores から取得)
const recentActivities = ref([
  {
    id: 1,
    icon: '📚',
    text: 'Memory Station で 15語復習完了',
    time: '30分前',
    reward: 75,
    rewardType: '💎'
  },
  {
    id: 2,
    icon: '⭐',
    text: '"sophisticated" をマスター',
    time: '2時間前',
    reward: 150,
    rewardType: 'EXP'
  },
  {
    id: 3,
    icon: '🏆',
    text: 'Vocabulary Arena で勝利',
    time: '4時間前',
    reward: 200,
    rewardType: '💎'
  },
  {
    id: 4,
    icon: '🔥',
    text: '7日連続学習を達成',
    time: '今日',
    reward: 500,
    rewardType: 'EXP'
  }
]);

const difficultyLevels = ref([
  { name: '英検5級', progress: 85, mastered: 34, total: 40 },
  { name: '英検4級', progress: 70, mastered: 28, total: 40 },
  { name: '英検3級', progress: 45, mastered: 18, total: 40 },
  { name: '英検準2級', progress: 25, mastered: 10, total: 40 },
  { name: '英検2級', progress: 10, mastered: 4, total: 40 },
  { name: '英検準1級', progress: 5, mastered: 2, total: 40 }
]);

// Computed
const playerLevel = computed(() => wordGalaxyStore.user?.level || 1);
const crystals = computed(() => wordGalaxyStore.user?.crystals || 0);
const totalWordsLearned = computed(() => wordGalaxyStore.userStats?.totalWordsLearned || 0);
const masteryRate = computed(() => wordGalaxyStore.vocabularyProgress || 0);
const totalStudyHours = computed(() => Math.round((wordGalaxyStore.userStats?.totalTimeSpent || 0) / 3600));
const avgSessionTime = computed(() => Math.round((wordGalaxyStore.userStats?.averageSessionTime || 0) / 60));
const currentStreak = computed(() => dailyMissionStore.playerStats?.currentStreak || 0);
const longestStreak = computed(() => dailyMissionStore.playerStats?.longestStreak || 0);
const recentWordsLearned = computed(() => 8); // Mock data
const battleWins = computed(() => wordGalaxyStore.userStats?.battleWins || 0);
const battleLosses = computed(() => wordGalaxyStore.userStats?.battleLosses || 0);
const battleWinRate = computed(() => wordGalaxyStore.battleWinRate || 0);
const currentRank = computed(() => wordGalaxyStore.currentRank || 'Bronze');
const currentElo = computed(() => wordGalaxyStore.userStats?.currentElo || 1000);

// Methods
function goBack() {
  router.push('/word-galaxy');
}

function goToMemoryStation() {
  router.push('/word-galaxy/memory-station');
}

function goToDailyMission() {
  router.push('/word-galaxy/daily-mission');
}

function goToVocabularyArena() {
  router.push('/word-galaxy/vocabulary-arena');
}

function exportData() {
  alert('📊 データエクスポート機能は開発中です');
}

// Lifecycle
onMounted(async () => {
  // Initialize stores if needed
  if (!wordGalaxyStore.initialized) {
    await wordGalaxyStore.initialize();
  }
});
</script>

<style scoped>
.learning-dashboard {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900;
  @apply text-white;
}

.dashboard-header {
  @apply bg-black/30 backdrop-blur-sm border-b border-gray-600/30 py-6 px-8;
}

.header-content {
  @apply max-w-7xl mx-auto flex justify-between items-center;
}

.header-left {
  @apply flex items-center gap-6;
}

.back-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg;
  @apply hover:bg-gray-600/50 transition-colors;
}

.back-icon {
  @apply text-xl;
}

.title-section {
  @apply space-y-1;
}

.dashboard-title {
  @apply text-3xl font-bold flex items-center gap-3;
  @apply bg-gradient-to-r from-blue-400 to-purple-400;
  @apply bg-clip-text text-transparent;
}

.title-icon {
  @apply text-4xl;
}

.dashboard-subtitle {
  @apply text-gray-300;
}

.header-stats {
  @apply flex gap-4;
}

.quick-stat {
  @apply flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg;
}

.stat-icon {
  @apply text-xl;
}

.stat-value {
  @apply font-bold;
}

.dashboard-content {
  @apply max-w-7xl mx-auto px-8 py-8 space-y-8;
}

.section-title {
  @apply text-2xl font-bold mb-6 flex items-center gap-2;
}

.overview-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.overview-card {
  @apply bg-black/40 rounded-2xl p-6 border border-gray-600/30;
  @apply backdrop-blur-sm;
}

.card-icon {
  @apply text-4xl mb-4;
}

.card-number {
  @apply text-3xl font-bold mb-2;
}

.card-label {
  @apply text-gray-400 mb-3;
}

.card-trend {
  @apply flex items-center gap-2 text-sm;
}

.trend-icon {
  @apply text-green-400;
}

.trend-text {
  @apply text-gray-300;
}

.progress-bar {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500;
  @apply transition-all duration-500;
}

.stats-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.stat-card {
  @apply bg-black/40 rounded-2xl p-6 border border-gray-600/30;
  @apply backdrop-blur-sm;
}

.card-title {
  @apply text-xl font-bold mb-4 flex items-center gap-2;
}

.chart-container {
  @apply h-64 flex items-center justify-center;
}

.chart-placeholder {
  @apply text-center;
}

.mock-chart {
  @apply flex items-end gap-2 mt-4 h-32;
}

.chart-bar {
  @apply w-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t;
}

.difficulty-levels {
  @apply space-y-4;
}

.difficulty-item {
  @apply space-y-2;
}

.difficulty-header {
  @apply flex justify-between items-center;
}

.difficulty-name {
  @apply font-semibold;
}

.difficulty-progress {
  @apply text-sm text-gray-400;
}

.difficulty-bar {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.difficulty-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-blue-500;
  @apply transition-all duration-500;
}

.difficulty-stats {
  @apply text-sm text-gray-400;
}

.activity-list {
  @apply space-y-3;
}

.activity-item {
  @apply flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg;
}

.activity-icon {
  @apply text-2xl;
}

.activity-content {
  @apply flex-1;
}

.activity-text {
  @apply font-medium;
}

.activity-time {
  @apply text-sm text-gray-400;
}

.activity-reward {
  @apply text-sm font-bold text-yellow-400;
}

.battle-overview {
  @apply space-y-4;
}

.battle-record {
  @apply flex gap-4;
}

.record-item {
  @apply flex-1 text-center p-3 bg-gray-800/50 rounded-lg;
}

.record-label {
  @apply block text-sm text-gray-400 mb-1;
}

.record-value {
  @apply block text-xl font-bold;
}

.wins {
  @apply text-green-400;
}

.losses {
  @apply text-red-400;
}

.rate {
  @apply text-blue-400;
}

.current-rank {
  @apply text-center p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30;
  @apply rounded-lg border border-yellow-500/30;
}

.rank-display {
  @apply flex items-center justify-center gap-2 mb-2;
}

.rank-icon {
  @apply text-2xl;
}

.rank-text {
  @apply text-xl font-bold text-yellow-400;
}

.elo-rating {
  @apply text-sm text-gray-300;
}

.elo-label {
  @apply mr-1;
}

.elo-value {
  @apply font-bold text-white;
}

.action-grid {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.action-btn {
  @apply flex flex-col items-center gap-2 p-6 bg-black/40 rounded-xl;
  @apply border border-gray-600/30 hover:border-blue-500/50;
  @apply transition-all duration-300 hover:scale-105;
}

.btn-icon {
  @apply text-3xl;
}

.btn-text {
  @apply font-semibold;
}

.memory {
  @apply hover:bg-blue-900/20;
}

.mission {
  @apply hover:bg-green-900/20;
}

.arena {
  @apply hover:bg-red-900/20;
}

.export {
  @apply hover:bg-purple-900/20;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col gap-4;
  }

  .overview-grid {
    @apply grid-cols-1;
  }

  .stats-grid {
    @apply grid-cols-1;
  }

  .action-grid {
    @apply grid-cols-1;
  }
}
</style>