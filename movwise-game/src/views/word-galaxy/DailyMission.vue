<template>
  <div class="daily-mission-container">
    <!-- Hero Section -->
    <div class="mission-header">
      <div class="header-content">
        <div class="mission-title-section">
          <button @click="backToWordGalaxy" class="back-button">
            ← Word Galaxy
          </button>
          <h1 class="mission-title">
            <span class="title-icon">🚀</span>
            Daily Mission Control
          </h1>
          <p class="mission-subtitle">銀河語彙学習司令部 - 毎日のミッション管理</p>
        </div>

        <div class="mission-stats-grid">
          <div class="stat-card streak-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">{{ playerStats.currentStreak }}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          <div class="stat-card crystal-card">
            <div class="stat-icon">💎</div>
            <div class="stat-content">
              <div class="stat-value">{{ playerStats.crystals }}</div>
              <div class="stat-label">Crystals</div>
            </div>
          </div>
          <div class="stat-card xp-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-value">{{ playerStats.totalXP }}</div>
              <div class="stat-label">Total XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Missions -->
    <div class="missions-section">
      <h2 class="section-title">
        <span class="section-icon">📋</span>
        Today's Missions
        <span class="mission-date">{{ todayFormatted }}</span>
      </h2>

      <div class="missions-grid">
        <div
          v-for="mission in dailyMissions"
          :key="mission.id"
          class="mission-card"
          :class="{
            'completed': mission.completed,
            'in-progress': mission.progress > 0 && !mission.completed,
            'locked': mission.locked
          }"
          @click="startMission(mission)"
        >
          <div class="mission-icon-container">
            <span class="mission-icon">{{ mission.icon }}</span>
            <div v-if="mission.completed" class="completion-badge">✅</div>
            <div v-else-if="mission.locked" class="lock-badge">🔒</div>
          </div>

          <div class="mission-content">
            <h3 class="mission-name">{{ mission.name }}</h3>
            <p class="mission-description">{{ mission.description }}</p>

            <div class="mission-progress-section">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${(mission.progress / mission.target) * 100}%` }"
                ></div>
              </div>
              <div class="progress-text">
                {{ mission.progress }} / {{ mission.target }}
              </div>
            </div>

            <div class="mission-rewards">
              <div class="reward-item">
                <span class="reward-icon">💎</span>
                <span class="reward-amount">+{{ mission.rewards.crystals }}</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-amount">+{{ mission.rewards.xp }}</span>
              </div>
            </div>
          </div>

          <div class="mission-action">
            <button
              v-if="!mission.completed && !mission.locked"
              class="action-btn start-btn"
              @click.stop="startMission(mission)"
            >
              {{ mission.progress > 0 ? 'Continue' : 'Start' }}
            </button>
            <button
              v-else-if="mission.completed"
              class="action-btn completed-btn"
              disabled
            >
              Completed
            </button>
            <div v-else class="lock-info">
              {{ mission.unlockCondition }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly Challenges -->
    <div class="challenges-section">
      <h2 class="section-title">
        <span class="section-icon">🏆</span>
        Weekly Challenges
      </h2>

      <div class="challenge-card">
        <div class="challenge-header">
          <div class="challenge-title">語彙マスター週間</div>
          <div class="challenge-timer">{{ weeklyTimeLeft }}</div>
        </div>

        <div class="challenge-progress">
          <div class="challenge-track">
            <div
              v-for="(milestone, index) in weeklyMilestones"
              :key="index"
              class="milestone"
              :class="{
                'completed': milestone.completed,
                'current': milestone.current
              }"
            >
              <div class="milestone-icon">{{ milestone.icon }}</div>
              <div class="milestone-label">{{ milestone.label }}</div>
              <div class="milestone-reward">+{{ milestone.reward }}💎</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Notifications -->
    <transition-group name="notification" tag="div" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="achievement-notification"
        :class="notification.type"
      >
        <div class="notification-icon">{{ notification.icon }}</div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          class="notification-close"
          @click="dismissNotification(notification.id)"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDailyMissionStore } from '@/stores/word-galaxy/dailyMission';
import { useWordGalaxyStore } from '@/stores/word-galaxy/wordGalaxy';
import type { DailyMission, WeeklyMilestone, Achievement } from '@/types/word-galaxy/word.types';

const router = useRouter();
const dailyMissionStore = useDailyMissionStore();
const wordGalaxyStore = useWordGalaxyStore();

// State
const notifications = ref<Achievement[]>([]);

// Computed
const playerStats = computed(() => dailyMissionStore.playerStats);
const dailyMissions = computed(() => dailyMissionStore.todaysMissions);
const weeklyMilestones = computed(() => dailyMissionStore.weeklyMilestones);

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

const weeklyTimeLeft = computed(() => {
  const endOfWeek = dailyMissionStore.getWeekEndTime();
  const now = new Date().getTime();
  const timeLeft = endOfWeek - now;

  if (timeLeft <= 0) return 'Expired';

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days}d ${hours}h`;
});

// Methods
async function startMission(mission: DailyMission) {
  if (mission.locked || mission.completed) return;

  try {
    // Start mission tracking
    await dailyMissionStore.startMission(mission.id);

    // Navigate to appropriate learning activity
    switch (mission.type) {
      case 'vocabulary_review':
        // Navigate to Memory Station for vocabulary review
        router.push({ name: 'MemoryStation' });
        break;
      case 'new_words':
        router.push({ name: 'MemoryStation' });
        break;
      case 'vocabulary_battle':
        router.push({ name: 'VocabularyArena' });
        break;
      case 'streak_maintenance':
        // Any learning activity counts
        router.push({ name: 'WordGalaxyHub' });
        break;
      default:
        router.push({ name: 'MemoryStation' });
    }
  } catch (error) {
    console.error('Failed to start mission:', error);
  }
}

function dismissNotification(notificationId: string) {
  const index = notifications.value.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
}

async function initialize() {
  try {
    // Initialize daily missions
    await dailyMissionStore.initialize();

    // Generate today's missions if needed
    await dailyMissionStore.generateDailyMissions();

    // Check for achievements
    const newAchievements = await dailyMissionStore.checkAchievements();
    notifications.value.push(...newAchievements);

    console.log('🚀 Daily Mission System initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Daily Mission System:', error);
  }
}

// Navigation
function backToWordGalaxy() {
  router.push('/word-galaxy');
}

// Lifecycle
onMounted(() => {
  initialize();
});
</script>

<style scoped>
.daily-mission-container {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900;
  @apply text-white overflow-hidden;
}

.mission-header {
  @apply relative py-16 px-6;
  background: linear-gradient(135deg,
    rgba(30, 58, 138, 0.3) 0%,
    rgba(91, 33, 182, 0.2) 50%,
    rgba(17, 24, 39, 0.3) 100%);
}

.header-content {
  @apply max-w-6xl mx-auto;
}

.mission-title-section {
  @apply text-center mb-12;
}

.back-button {
  @apply mb-4 px-4 py-2 bg-cyan-600/80 text-white rounded-lg;
  @apply hover:bg-cyan-500/90 transition-all duration-200;
  @apply border border-cyan-400/30 backdrop-blur-sm;
  @apply flex items-center gap-2 text-sm font-medium;
}

.mission-title {
  @apply text-5xl font-bold mb-4;
  @apply bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400;
  @apply bg-clip-text text-transparent;
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
}

.title-icon {
  @apply text-6xl mr-4;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.8));
}

.mission-subtitle {
  @apply text-xl text-gray-300;
}

.mission-stats-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.stat-card {
  @apply bg-black/30 rounded-2xl p-6 border border-gray-600/30;
  @apply backdrop-blur-sm transition-all duration-300 hover:scale-105;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.streak-card {
  @apply border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-red-900/20;
}

.crystal-card {
  @apply border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-blue-900/20;
}

.xp-card {
  @apply border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-amber-900/20;
}

.stat-card {
  @apply flex items-center gap-4;
}

.stat-icon {
  @apply text-4xl;
}

.stat-value {
  @apply text-3xl font-bold;
}

.stat-label {
  @apply text-gray-400;
}

.missions-section, .challenges-section {
  @apply px-6 py-8;
}

.section-title {
  @apply text-3xl font-bold mb-8 flex items-center gap-3;
  @apply text-transparent bg-gradient-to-r from-white to-gray-300;
  @apply bg-clip-text;
}

.section-icon {
  @apply text-4xl;
}

.mission-date {
  @apply ml-auto text-lg text-gray-400;
}

.missions-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

.mission-card {
  @apply bg-black/40 rounded-2xl p-6 border border-gray-600/30;
  @apply backdrop-blur-sm transition-all duration-300 cursor-pointer;
  @apply hover:scale-105 hover:shadow-xl;
}

.mission-card.completed {
  @apply border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20;
}

.mission-card.in-progress {
  @apply border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-indigo-900/20;
}

.mission-card.locked {
  @apply border-gray-600/30 bg-gradient-to-br from-gray-900/20 to-gray-800/20;
  @apply opacity-60 cursor-not-allowed;
}

.mission-icon-container {
  @apply relative mb-4;
}

.mission-icon {
  @apply text-4xl;
}

.completion-badge, .lock-badge {
  @apply absolute -top-2 -right-2 text-2xl;
}

.mission-name {
  @apply text-xl font-bold mb-2;
}

.mission-description {
  @apply text-gray-300 mb-4;
}

.mission-progress-section {
  @apply mb-4;
}

.progress-bar {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500;
  @apply transition-all duration-500;
}

.progress-text {
  @apply text-sm text-gray-400;
}

.mission-rewards {
  @apply flex items-center gap-4 mb-4;
}

.reward-item {
  @apply flex items-center gap-1 text-sm;
}

.reward-icon {
  @apply text-lg;
}

.action-btn {
  @apply px-6 py-2 rounded-lg font-semibold transition-all duration-300;
}

.start-btn {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply hover:from-blue-700 hover:to-purple-700;
}

.completed-btn {
  @apply bg-gradient-to-r from-green-600 to-emerald-600 opacity-60;
}

.lock-info {
  @apply text-sm text-gray-500 italic;
}

.challenge-card {
  @apply bg-black/30 rounded-2xl p-8 border border-yellow-500/30;
  @apply backdrop-blur-sm;
}

.challenge-header {
  @apply flex justify-between items-center mb-6;
}

.challenge-title {
  @apply text-2xl font-bold text-yellow-400;
}

.challenge-timer {
  @apply text-lg text-gray-300 bg-black/50 px-4 py-2 rounded-lg;
}

.challenge-track {
  @apply flex justify-between items-center;
}

.milestone {
  @apply text-center transition-all duration-300;
}

.milestone.completed {
  @apply text-green-400;
}

.milestone.current {
  @apply text-yellow-400 scale-110;
}

.milestone-icon {
  @apply text-3xl mb-2;
}

.milestone-label {
  @apply text-sm font-semibold mb-1;
}

.milestone-reward {
  @apply text-xs text-gray-400;
}

.notification-container {
  @apply fixed top-4 right-4 z-50 space-y-4;
}

.achievement-notification {
  @apply bg-black/90 border rounded-lg p-4 max-w-sm;
  @apply backdrop-blur-sm flex items-center gap-3;
  @apply border-green-500/50 bg-gradient-to-r from-green-900/30 to-emerald-900/30;
}

.notification-icon {
  @apply text-2xl;
}

.notification-title {
  @apply font-bold;
}

.notification-message {
  @apply text-sm text-gray-300;
}

.notification-close {
  @apply ml-auto text-gray-400 hover:text-white text-xl;
}

/* Animations */
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mission-title {
    @apply text-4xl;
  }

  .missions-grid {
    @apply grid-cols-1;
  }

  .challenge-track {
    @apply flex-col gap-4;
  }
}
</style>