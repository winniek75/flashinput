<template>
  <div class="word-galaxy-hub">
    <!-- Galaxy Background -->
    <div class="galaxy-background">
      <div class="stars-layer"></div>
      <div class="nebula-layer"></div>
      <div class="planet-layer"></div>
    </div>

    <!-- Header Navigation -->
    <div class="hub-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="galaxy-logo">🌌 Word Galaxy</h1>
          <p class="galaxy-subtitle">語彙力の宇宙を探索しよう</p>
        </div>

        <div class="user-section" v-if="user">
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">Lv.{{ user.level }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💎</span>
              <span class="stat-value">{{ user.crystals }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📚</span>
              <span class="stat-value">{{ userStats.totalWordsLearned }}</span>
            </div>
          </div>

          <div class="user-avatar">
            <div class="avatar-circle">
              <span class="avatar-emoji">👤</span>
            </div>
            <div class="user-rank" :class="currentRank.toLowerCase()">
              {{ currentRank }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Cards -->
    <div class="main-navigation">
      <div class="nav-grid">
        <!-- Memory Station -->
        <div class="nav-card memory-station" @click="navigateToMemoryStation" @dblclick="testClick">
          <div class="card-background">
            <div class="card-glow"></div>
          </div>
          <div class="card-content">
            <div class="card-icon">🧠</div>
            <h2 class="card-title">Memory Station</h2>
            <p class="card-description">科学的な間隔反復学習で単語を確実に記憶</p>

            <div class="card-stats" v-if="memoryStats">
              <div class="mini-stat">
                <span class="mini-icon">⏰</span>
                <span class="mini-text">{{ memoryStats.reviewsDue }}語復習待ち</span>
              </div>
              <div class="mini-stat">
                <span class="mini-icon">⭐</span>
                <span class="mini-text">{{ memoryStats.masteredWords }}語マスター</span>
              </div>
            </div>

            <div class="card-actions">
              <div class="action-primary" v-if="memoryStats.reviewsDue > 0">
                <span class="action-text">復習を始める ({{ memoryStats.reviewsDue }}語)</span>
                <span class="action-arrow">→</span>
              </div>
              <div class="action-primary" v-else>
                <span class="action-text">新しい単語を学習</span>
                <span class="action-arrow">→</span>
              </div>
              <div class="action-secondary">
                <span class="secondary-text">学習オプション</span>
              </div>
            </div>
          </div>

          <div class="notification-badge" v-if="memoryStats?.reviewsDue > 0">
            {{ memoryStats.reviewsDue }}
          </div>
        </div>

        <!-- Daily Mission -->
        <div class="nav-card daily-mission" @click="navigateToDailyMission">
          <div class="card-background">
            <div class="card-glow"></div>
          </div>
          <div class="card-content">
            <div class="card-icon">📅</div>
            <h2 class="card-title">Daily Mission</h2>
            <p class="card-description">毎日のミッションで継続的な学習習慣を構築</p>

            <div class="card-stats">
              <div class="mini-stat">
                <span class="mini-icon">🔥</span>
                <span class="mini-text">{{ streakDays }}日連続</span>
              </div>
              <div class="mini-stat">
                <span class="mini-icon">🎯</span>
                <span class="mini-text">{{ dailyProgress }}% 完了</span>
              </div>
            </div>

            <div class="card-action">
              <span class="action-text">ミッションを見る</span>
              <span class="action-arrow">→</span>
            </div>
          </div>

          <div class="streak-indicator" v-if="streakDays > 0">
            🔥{{ streakDays }}
          </div>
        </div>

        <!-- Vocabulary Arena -->
        <div class="nav-card vocabulary-arena" @click="navigateToVocabularyArena">
          <div class="card-background">
            <div class="card-glow"></div>
          </div>
          <div class="card-content">
            <div class="card-icon">⚔️</div>
            <h2 class="card-title">Vocabulary Arena</h2>
            <p class="card-description">対戦形式で楽しく語彙力を競い合おう</p>

            <div class="card-stats">
              <div class="mini-stat">
                <span class="mini-icon">🏆</span>
                <span class="mini-text">{{ battleWinRate }}% 勝率</span>
              </div>
              <div class="mini-stat">
                <span class="mini-icon">🎖️</span>
                <span class="mini-text">{{ currentRank }}</span>
              </div>
            </div>

            <div class="card-action">
              <span class="action-text">バトル開始</span>
              <span class="action-arrow">→</span>
            </div>
          </div>

        </div>

        <!-- Learning Dashboard -->
        <div class="nav-card learning-dashboard" @click="navigateToLearningDashboard">
          <div class="card-background">
            <div class="card-glow"></div>
          </div>
          <div class="card-content">
            <div class="card-icon">📊</div>
            <h2 class="card-title">Learning Dashboard</h2>
            <p class="card-description">学習進捗と統計を詳しく分析</p>

            <div class="card-stats">
              <div class="mini-stat">
                <span class="mini-icon">📈</span>
                <span class="mini-text">{{ vocabularyProgress }}% 習得</span>
              </div>
              <div class="mini-stat">
                <span class="mini-icon">⏱️</span>
                <span class="mini-text">{{ totalStudyTime }}分学習</span>
              </div>
            </div>

            <div class="card-action">
              <span class="action-text">統計を見る</span>
              <span class="action-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Section -->
    <div class="quick-stats">
      <div class="stats-container">
        <h3 class="stats-title">📊 今日の学習状況</h3>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-number">{{ todayStats.wordsStudied }}</div>
              <div class="stat-label">今日学習した単語</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏰</div>
            <div class="stat-info">
              <div class="stat-number">{{ todayStats.studyTime }}</div>
              <div class="stat-label">学習時間（分）</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ todayStats.accuracy }}%</div>
              <div class="stat-label">正答率</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
              <div class="stat-number">{{ streakDays }}</div>
              <div class="stat-label">連続学習日数</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="activity-container">
        <h3 class="activity-title">⚡ 最近の活動</h3>

        <div class="activity-list">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
            <div class="activity-reward" v-if="activity.reward">
              +{{ activity.reward }} {{ activity.rewardType }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings & Help -->
    <div class="bottom-actions">
      <button @click="openSettings" class="action-btn">
        <span class="btn-icon">⚙️</span>
        設定
      </button>

      <button @click="openHelp" class="action-btn">
        <span class="btn-icon">❓</span>
        ヘルプ
      </button>

      <button @click="goBack" class="action-btn">
        <span class="btn-icon">🏠</span>
        ホームに戻る
      </button>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-content">
        <div class="galaxy-loader">
          <div class="planet"></div>
          <div class="orbit"></div>
        </div>
        <p>Word Galaxy を初期化中...</p>
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

// State
const loading = ref(true);
const todayStats = ref({
  wordsStudied: 15,
  studyTime: 42,
  accuracy: 87,
});

const recentActivities = ref([
  {
    id: 1,
    icon: '📚',
    text: 'Memory Station で 10語復習完了',
    time: '15分前',
    reward: 50,
    rewardType: '💎'
  },
  {
    id: 2,
    icon: '⭐',
    text: '"beautiful" をマスター',
    time: '1時間前',
    reward: 100,
    rewardType: 'EXP'
  },
  {
    id: 3,
    icon: '🔥',
    text: '3日連続学習を達成',
    time: '今日',
    reward: 200,
    rewardType: '💎'
  },
  {
    id: 4,
    icon: '🎯',
    text: 'デイリーミッション完了',
    time: '昨日',
    reward: 150,
    rewardType: 'EXP'
  }
]);

// Props
interface Props {
  userId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  userId: 'demo-user'
});

// Computed
const user = computed(() => wordGalaxyStore.user);
const userStats = computed(() => wordGalaxyStore.userStats);
const currentRank = computed(() => wordGalaxyStore.currentRank);
const vocabularyProgress = computed(() => wordGalaxyStore.vocabularyProgress);
const battleWinRate = computed(() => vocabularyArenaStore.winRate);
const dailyProgress = computed(() => Math.round(dailyMissionStore.todaysProgress));

const memoryStats = computed(() => ({
  reviewsDue: memoryStore.pendingReviewCount,
  masteredWords: memoryStore.learningStats.masteredWords,
  totalWords: memoryStore.learningStats.totalWords
}));

const streakDays = computed(() => dailyMissionStore.playerStats.currentStreak);
const totalStudyTime = computed(() => Math.round((userStats.value?.totalTimeSpent || 0) / 60));

// Methods
async function navigateToMemoryStation() {
  console.log('🧠 Navigating to Memory Station...');
  console.log('Router instance:', router);
  console.log('Current route:', router.currentRoute.value);

  try {
    console.log('Attempting router.push...');
    const result = await router.push('/word-galaxy/memory-station');
    console.log('✅ Navigation to Memory Station successful', result);
  } catch (err) {
    console.error('❌ Navigation to Memory Station failed:', err);
    alert(`ナビゲーションエラー: ${err.message}`);
  }
}

async function navigateToDailyMission() {
  console.log('📅 Navigating to Daily Mission...');
  try {
    await router.push('/word-galaxy/daily-mission');
    console.log('✅ Navigation to Daily Mission successful');
  } catch (err) {
    console.error('❌ Navigation to Daily Mission failed:', err);
    alert(`ナビゲーションエラー: ${err.message}`);
  }
}

async function navigateToVocabularyArena() {
  console.log('⚔️ Navigating to Vocabulary Arena...');
  try {
    await router.push('/word-galaxy/vocabulary-arena');
    console.log('✅ Navigation to Vocabulary Arena successful');
  } catch (err) {
    console.error('❌ Navigation to Vocabulary Arena failed:', err);
    alert(`ナビゲーションエラー: ${err.message}`);
  }
}

async function navigateToLearningDashboard() {
  console.log('📊 Navigating to Learning Dashboard...');
  try {
    await router.push('/word-galaxy/dashboard');
    console.log('✅ Navigation to Learning Dashboard successful');
  } catch (err) {
    console.error('❌ Navigation to Learning Dashboard failed:', err);
    alert(`ナビゲーションエラー: ${err.message}`);
  }
}

function openSettings() {
  // Settings modal or page
  alert('⚙️ 設定画面は開発中です');
}

function openHelp() {
  // Help modal or page
  alert('❓ ヘルプページは開発中です');
}

function goBack() {
  router.push('/');
}

// Debug function to test clicks
function testClick() {
  console.log('🔥 TEST CLICK WORKING!');
  alert('クリックイベントは正常に動作しています！');
}

// Diagnostic function to check routes
function checkRoutes() {
  console.log('🔍 Available routes:');
  const routes = router.getRoutes();
  routes.forEach(route => {
    if (route.path.includes('word-galaxy')) {
      console.log(`- ${route.path} (${route.name})`);
    }
  });

  // Test specific routes
  console.log('🎯 Testing specific Word Galaxy routes:');
  const testRoutes = [
    '/word-galaxy',
    '/word-galaxy/memory-station',
    '/word-galaxy/daily-mission',
    '/word-galaxy/vocabulary-arena',
    '/word-galaxy/dashboard'
  ];

  testRoutes.forEach(path => {
    try {
      const resolved = router.resolve(path);
      console.log(`✅ ${path}: RESOLVED`, resolved);
    } catch (err) {
      console.error(`❌ ${path}: FAILED`, err);
    }
  });
}

async function initializeHub() {
  loading.value = true;

  try {
    // Route diagnostics
    console.log('🔧 Running route diagnostics...');
    checkRoutes();

    // Word Galaxy初期化
    if (!wordGalaxyStore.initialized) {
      await wordGalaxyStore.initialize(props.userId);
    }

    // ユーザーログイン
    if (!wordGalaxyStore.isLoggedIn) {
      await wordGalaxyStore.login(props.userId);
    }

    // Memory Station統計読み込み
    await memoryStore.loadLearningStats(props.userId);

    // Daily Mission初期化
    await dailyMissionStore.initialize();

    // ストリーク維持ミッション更新（ログインするだけで完了）
    await dailyMissionStore.updateMissionProgress('streak_maintenance', 1);

    // Vocabulary Arena初期化
    await vocabularyArenaStore.initialize(props.userId);

    console.log('✅ Word Galaxy Hub initialized');
  } catch (err) {
    console.error('❌ Failed to initialize hub:', err);
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  initializeHub();
});
</script>

<style scoped>
.word-galaxy-hub {
  @apply min-h-screen relative overflow-hidden;
  background: radial-gradient(ellipse at center, #1e3a8a 0%, #111827 70%);
}

.galaxy-background {
  @apply absolute inset-0 pointer-events-none;
}

.stars-layer {
  @apply absolute inset-0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, #fff, transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s linear infinite;
}

.nebula-layer {
  @apply absolute inset-0 opacity-30;
  background: radial-gradient(ellipse at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 40% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%);
  animation: nebula-drift 20s ease-in-out infinite;
}

.planet-layer {
  @apply absolute inset-0 opacity-20;
}

.hub-header {
  @apply relative z-10 bg-black/20 backdrop-blur-sm border-b border-cyan-500/30;
}

.header-content {
  @apply max-w-7xl mx-auto px-6 py-6 flex justify-between items-center;
}

.galaxy-logo {
  @apply text-4xl font-bold text-white mb-1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: gradient-flow 3s ease-in-out infinite;
}

.galaxy-subtitle {
  @apply text-cyan-300;
}

.user-section {
  @apply flex items-center gap-6;
}

.user-stats {
  @apply flex gap-4;
}

.stat-item {
  @apply flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg;
}

.stat-icon {
  @apply text-lg;
}

.stat-value {
  @apply text-white font-bold;
}

.user-avatar {
  @apply text-center;
}

.avatar-circle {
  @apply w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full;
  @apply flex items-center justify-center mb-1;
}

.avatar-emoji {
  @apply text-2xl;
}

.user-rank {
  @apply text-xs font-bold px-2 py-1 rounded-full;
}

.user-rank.bronze { @apply bg-orange-600 text-white; }
.user-rank.silver { @apply bg-gray-500 text-white; }
.user-rank.gold { @apply bg-yellow-500 text-black; }
.user-rank.platinum { @apply bg-purple-600 text-white; }
.user-rank.diamond { @apply bg-cyan-500 text-black; }

.main-navigation {
  @apply relative z-10 max-w-7xl mx-auto px-6 py-12;
}

.nav-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8;
}

.nav-card {
  @apply relative p-8 rounded-2xl cursor-pointer;
  @apply transition-all duration-300 hover:scale-105 hover:z-10;
  @apply border border-white/20 backdrop-blur-sm;
  @apply overflow-hidden;
}

.nav-card:hover {
  @apply shadow-2xl;
}

.card-background {
  @apply absolute inset-0;
}

.card-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
}

.nav-card:hover .card-glow {
  @apply opacity-100;
}

.memory-station {
  @apply bg-gradient-to-br from-blue-900/50 to-purple-900/50;
}

.memory-station .card-glow {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
}

.daily-mission {
  @apply bg-gradient-to-br from-green-900/50 to-emerald-900/50;
}

.daily-mission .card-glow {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
}

.vocabulary-arena {
  @apply bg-gradient-to-br from-red-900/50 to-pink-900/50;
}

.vocabulary-arena .card-glow {
  background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%);
}

.learning-dashboard {
  @apply bg-gradient-to-br from-yellow-900/50 to-orange-900/50;
}

.learning-dashboard .card-glow {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
}

.card-content {
  @apply relative z-10;
}

.card-icon {
  @apply text-5xl mb-4;
}

.card-title {
  @apply text-2xl font-bold text-white mb-3;
}

.card-description {
  @apply text-white/80 mb-6 leading-relaxed;
}

.card-stats {
  @apply space-y-2 mb-6;
}

.mini-stat {
  @apply flex items-center gap-2 text-sm;
}

.mini-icon {
  @apply text-yellow-400;
}

.mini-text {
  @apply text-white/90 font-medium;
}

.card-actions {
  @apply space-y-2;
}

.action-primary {
  @apply flex items-center justify-between text-white font-semibold;
}

.action-secondary {
  @apply mt-2 text-center;
}

.secondary-text {
  @apply text-cyan-400 text-sm font-medium hover:text-cyan-300 cursor-pointer transition-colors;
}

.card-action {
  @apply flex items-center justify-between text-white font-semibold;
}

.action-text {
  @apply text-white;
}

.action-arrow {
  @apply transition-transform duration-300 text-cyan-400;
}

.nav-card:hover .action-arrow {
  @apply transform translate-x-2;
}

.notification-badge {
  @apply absolute -top-2 -right-2 bg-red-500 text-white;
  @apply w-8 h-8 rounded-full flex items-center justify-center;
  @apply text-sm font-bold animate-pulse;
}

.streak-indicator {
  @apply absolute top-4 right-4 bg-orange-500 text-white;
  @apply px-3 py-1 rounded-full text-sm font-bold;
}

.coming-soon-badge {
  @apply absolute top-4 right-4 bg-purple-500 text-white;
  @apply px-3 py-1 rounded-full text-xs font-bold;
}

.quick-stats {
  @apply relative z-10 max-w-7xl mx-auto px-6 py-8;
}

.stats-container {
  @apply bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm;
}

.stats-title {
  @apply text-2xl font-bold text-white mb-6 text-center;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-6;
}

.stat-card {
  @apply flex items-center gap-4 bg-white/10 rounded-xl p-4;
  @apply border border-white/20;
}

.stat-icon {
  @apply text-3xl;
}

.stat-info {
  @apply text-center;
}

.stat-number {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-sm text-gray-300;
}

.recent-activity {
  @apply relative z-10 max-w-7xl mx-auto px-6 py-8;
}

.activity-container {
  @apply bg-white/10 rounded-2xl p-8 border border-white/20 backdrop-blur-sm;
}

.activity-title {
  @apply text-2xl font-bold text-white mb-6;
}

.activity-list {
  @apply space-y-4;
}

.activity-item {
  @apply flex items-center gap-4 p-4 bg-white/5 rounded-xl;
  @apply border border-white/10;
}

.activity-icon {
  @apply text-2xl;
}

.activity-content {
  @apply flex-1;
}

.activity-text {
  @apply text-white font-semibold;
}

.activity-time {
  @apply text-gray-400 text-sm;
}

.activity-reward {
  @apply text-yellow-400 font-bold;
}

.bottom-actions {
  @apply relative z-10 max-w-7xl mx-auto px-6 py-8;
  @apply flex justify-center gap-4;
}

.action-btn {
  @apply px-6 py-3 bg-white/10 hover:bg-white/20;
  @apply text-white font-semibold rounded-lg;
  @apply transition-all duration-300 hover:scale-105;
  @apply flex items-center gap-2 border border-white/20;
}

.btn-icon {
  @apply text-lg;
}

.loading-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
  @apply backdrop-blur-sm;
}

.loading-content {
  @apply text-center text-white;
}

.galaxy-loader {
  @apply relative w-24 h-24 mx-auto mb-6;
}

.planet {
  @apply w-6 h-6 bg-cyan-500 rounded-full absolute top-1/2 left-1/2;
  @apply transform -translate-x-1/2 -translate-y-1/2;
}

.orbit {
  @apply w-24 h-24 border-2 border-cyan-500/30 rounded-full;
  animation: orbit 2s linear infinite;
}

/* Animations */
@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes nebula-drift {
  0%, 100% { transform: translateX(0) translateY(0); }
  33% { transform: translateX(30px) translateY(-20px); }
  66% { transform: translateX(-20px) translateY(30px); }
}

@keyframes gradient-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes orbit {
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col gap-4;
  }

  .nav-grid {
    @apply grid-cols-1 gap-6;
  }

  .stats-grid {
    @apply grid-cols-2;
  }

  .bottom-actions {
    @apply flex-col;
  }
}
</style>