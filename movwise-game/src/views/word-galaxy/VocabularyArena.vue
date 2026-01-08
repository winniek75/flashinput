<template>
  <div class="vocabulary-arena">
    <!-- Arena Background -->
    <div class="arena-background">
      <div class="energy-field"></div>
      <div class="battle-lights"></div>
      <div class="cosmic-particles"></div>
    </div>

    <!-- Arena Header -->
    <div class="arena-header">
      <div class="header-content">
        <div class="arena-title-section">
          <button @click="backToWordGalaxy" class="back-button">
            ← Word Galaxy
          </button>
          <h1 class="arena-title">
            <span class="title-icon">⚔️</span>
            Vocabulary Arena
          </h1>
          <p class="arena-subtitle">銀河語彙バトル - リアルタイム対戦の舞台</p>
        </div>

        <div class="player-stats-section">
          <div class="rank-display">
            <div class="rank-icon" :class="playerRank.toLowerCase()">
              {{ getRankIcon(playerRank) }}
            </div>
            <div class="rank-info">
              <div class="rank-name">{{ playerRank }}</div>
              <div class="elo-rating">{{ playerStats.currentElo }} ELO</div>
            </div>
          </div>

          <div class="battle-record">
            <div class="record-item wins">
              <span class="record-icon">🏆</span>
              <span class="record-value">{{ playerStats.wins }}</span>
            </div>
            <div class="record-item losses">
              <span class="record-icon">💥</span>
              <span class="record-value">{{ playerStats.losses }}</span>
            </div>
            <div class="record-item win-rate">
              <span class="record-icon">📊</span>
              <span class="record-value">{{ winRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Arena Content -->
    <div class="arena-main" v-if="!currentBattle">
      <!-- Arena Selection -->
      <div class="arena-modes">
        <h2 class="section-title">
          <span class="section-icon">🏟️</span>
          Battle Modes
        </h2>

        <div class="modes-grid">
          <!-- Quick Battle -->
          <div class="mode-card quick-battle" @click="startQuickBattle">
            <div class="mode-background">
              <div class="mode-glow"></div>
            </div>
            <div class="mode-content">
              <div class="mode-icon">⚡</div>
              <h3 class="mode-title">Quick Battle</h3>
              <p class="mode-description">即座にマッチング！カジュアルな語彙対戦</p>

              <div class="mode-features">
                <div class="feature-item">
                  <span class="feature-icon">⏱️</span>
                  <span class="feature-text">3分間バトル</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span class="feature-text">10問勝負</span>
                </div>
              </div>

              <div class="queue-status" v-if="isQueuing && queueMode === 'quick'">
                <div class="queue-spinner"></div>
                <span class="queue-text">マッチング中... {{ queueTime }}s</span>
              </div>
            </div>
          </div>

          <!-- Ranked Battle -->
          <div class="mode-card ranked-battle" @click="startRankedBattle">
            <div class="mode-background">
              <div class="mode-glow"></div>
            </div>
            <div class="mode-content">
              <div class="mode-icon">👑</div>
              <h3 class="mode-title">Ranked Battle</h3>
              <p class="mode-description">ELOレーティングをかけた真剣勝負</p>

              <div class="mode-features">
                <div class="feature-item">
                  <span class="feature-icon">⏱️</span>
                  <span class="feature-text">5分間バトル</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span class="feature-text">15問勝負</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📈</span>
                  <span class="feature-text">ELO変動</span>
                </div>
              </div>

              <div class="queue-status" v-if="isQueuing && queueMode === 'ranked'">
                <div class="queue-spinner"></div>
                <span class="queue-text">ランクマッチング中... {{ queueTime }}s</span>
              </div>
            </div>
          </div>

          <!-- AI Battle -->
          <div class="mode-card ai-battle" @click="startAIBattle">
            <div class="mode-background">
              <div class="mode-glow"></div>
            </div>
            <div class="mode-content">
              <div class="mode-icon">🤖</div>
              <h3 class="mode-title">AI Battle</h3>
              <p class="mode-description">AIと対戦！いつでも練習できる</p>

              <div class="mode-features">
                <div class="feature-item">
                  <span class="feature-icon">⏱️</span>
                  <span class="feature-text">4分間バトル</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎯</span>
                  <span class="feature-text">12問勝負</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">🎚️</span>
                  <span class="feature-text">難易度選択可</span>
                </div>
              </div>

              <div class="ai-difficulty-selector" v-if="showAIDifficultySelector">
                <h4>AI難易度を選択:</h4>
                <div class="difficulty-buttons">
                  <button @click="startAIBattleWithDifficulty('easy')" class="diff-btn easy">初級AI</button>
                  <button @click="startAIBattleWithDifficulty('medium')" class="diff-btn medium">中級AI</button>
                  <button @click="startAIBattleWithDifficulty('hard')" class="diff-btn hard">上級AI</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tournament Mode (Coming Soon) -->
          <div class="mode-card tournament-mode disabled">
            <div class="mode-background">
              <div class="mode-glow"></div>
            </div>
            <div class="mode-content">
              <div class="mode-icon">🏆</div>
              <h3 class="mode-title">Tournament</h3>
              <p class="mode-description">Coming Soon - 多人数トーナメント</p>

              <div class="coming-soon-badge">近日公開</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Battles -->
      <div class="recent-battles" v-if="recentBattles.length > 0">
        <h2 class="section-title">
          <span class="section-icon">📜</span>
          Recent Battles
        </h2>

        <div class="battles-list">
          <div
            v-for="battle in recentBattles.slice(0, 5)"
            :key="battle.id"
            class="battle-item"
            :class="{ 'victory': battle.result === 'win', 'defeat': battle.result === 'loss' }"
          >
            <div class="battle-result">
              <span class="result-icon">{{ battle.result === 'win' ? '🏆' : '💥' }}</span>
              <span class="result-text">{{ battle.result === 'win' ? 'Victory' : 'Defeat' }}</span>
            </div>

            <div class="battle-details">
              <div class="opponent">vs {{ battle.opponentName }}</div>
              <div class="battle-stats">
                <span class="score">{{ battle.playerScore }}-{{ battle.opponentScore }}</span>
                <span class="mode">{{ battle.mode }}</span>
                <span class="duration">{{ formatDuration(battle.duration) }}</span>
              </div>
            </div>

            <div class="elo-change" v-if="battle.eloChange">
              <span class="elo-icon">📈</span>
              <span class="elo-value" :class="{ 'positive': battle.eloChange > 0, 'negative': battle.eloChange < 0 }">
                {{ battle.eloChange > 0 ? '+' : '' }}{{ battle.eloChange }}
              </span>
            </div>

            <button class="replay-btn" @click="watchReplay(battle.id)">
              <span class="replay-icon">🔄</span>
              Replay
            </button>
          </div>
        </div>
      </div>

      <!-- Leaderboard Preview -->
      <div class="leaderboard-preview">
        <h2 class="section-title">
          <span class="section-icon">🏅</span>
          Top Players
          <button class="view-all-btn" @click="viewFullLeaderboard">全て見る</button>
        </h2>

        <div class="leaderboard-list">
          <div
            v-for="(player, index) in topPlayers.slice(0, 3)"
            :key="player.id"
            class="leaderboard-item"
            :class="{ 'current-player': player.id === currentUserId }"
          >
            <div class="player-rank">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="rank-medal">{{ getRankMedal(index) }}</span>
            </div>

            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-details">
                <span class="player-elo">{{ player.elo }} ELO</span>
                <span class="player-wins">{{ player.wins }}勝</span>
              </div>
            </div>

            <div class="player-rank-badge" :class="player.rank.toLowerCase()">
              {{ player.rank }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle Interface -->
    <div class="battle-interface" v-if="currentBattle">
      <BattleArena
        :battle="currentBattle"
        :player-id="currentUserId"
        @battle-end="handleBattleEnd"
        @answer-submitted="handleAnswerSubmit"
      />
    </div>

    <!-- Queue Cancel Button -->
    <div class="queue-controls" v-if="isQueuing">
      <button class="cancel-queue-btn" @click="cancelQueue">
        <span class="cancel-icon">❌</span>
        マッチングをキャンセル
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabularyArenaStore } from '@/stores/word-galaxy/vocabularyArena';
import { useDailyMissionStore } from '@/stores/word-galaxy/dailyMission';
import BattleArena from '@/components/word-galaxy/BattleArena.vue';
import type { BattleSession, BattleMode } from '@/types/word-galaxy/word.types';

const router = useRouter();
const arenaStore = useVocabularyArenaStore();
const dailyMissionStore = useDailyMissionStore();

// State
const isQueuing = ref(false);
const queueMode = ref<BattleMode | null>(null);
const queueTime = ref(0);
const queueTimer = ref<number | null>(null);
const showAIDifficultySelector = ref(false);

// Props
const props = defineProps<{
  userId?: string;
}>();

// Computed
const currentUserId = computed(() => props.userId || 'demo-user');
const playerStats = computed(() => arenaStore.playerStats);
const playerRank = computed(() => arenaStore.playerRank);
const currentBattle = computed(() => arenaStore.currentBattle);
const recentBattles = computed(() => arenaStore.recentBattles);
const topPlayers = computed(() => arenaStore.topPlayers);

const winRate = computed(() => {
  const total = playerStats.value.wins + playerStats.value.losses;
  if (total === 0) return 0;
  return Math.round((playerStats.value.wins / total) * 100);
});

// Methods
async function startQuickBattle() {
  if (isQueuing.value) return;

  try {
    queueMode.value = 'quick';
    isQueuing.value = true;
    queueTime.value = 0;

    // キューに参加
    await arenaStore.joinQueue('quick', currentUserId.value);

    // キューイング時間カウント
    startQueueTimer();

    console.log('🚀 Quick Battle queue joined');
  } catch (error) {
    console.error('❌ Failed to join quick battle queue:', error);
    cancelQueue();
  }
}

async function startRankedBattle() {
  if (isQueuing.value) return;

  try {
    queueMode.value = 'ranked';
    isQueuing.value = true;
    queueTime.value = 0;

    // キューに参加
    await arenaStore.joinQueue('ranked', currentUserId.value);

    // キューイング時間カウント
    startQueueTimer();

    console.log('👑 Ranked Battle queue joined');
  } catch (error) {
    console.error('❌ Failed to join ranked battle queue:', error);
    cancelQueue();
  }
}

function startQueueTimer() {
  queueTimer.value = setInterval(() => {
    queueTime.value++;

    // デモ用：15秒後に自動的にバトル開始
    if (queueTime.value >= 15) {
      simulateMatchFound();
    }
  }, 1000);
}

async function simulateMatchFound() {
  if (!queueMode.value) return;

  try {
    // デモ用の対戦相手データ
    const mockOpponent = {
      id: 'mock-opponent',
      name: 'Galaxy Warrior',
      elo: playerStats.value.currentElo + Math.floor(Math.random() * 200 - 100),
      rank: 'Silver'
    };

    // バトルセッション作成
    await arenaStore.createBattle(currentUserId.value, mockOpponent, queueMode.value);

    // キュー終了
    cancelQueue();

    console.log('⚔️ Battle started!');
  } catch (error) {
    console.error('❌ Failed to create battle:', error);
    cancelQueue();
  }
}

function cancelQueue() {
  isQueuing.value = false;
  queueMode.value = null;
  queueTime.value = 0;

  if (queueTimer.value) {
    clearInterval(queueTimer.value);
    queueTimer.value = null;
  }

  arenaStore.leaveQueue(currentUserId.value);
}

// AI対戦関数
function startAIBattle() {
  showAIDifficultySelector.value = !showAIDifficultySelector.value;
}

async function startAIBattleWithDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
  showAIDifficultySelector.value = false;

  try {
    console.log(`🤖 Starting AI battle with ${difficulty} difficulty`);

    // AI対戦相手データ
    const aiOpponents = {
      easy: {
        id: 'ai-easy',
        name: 'AI Novice',
        elo: Math.max(800, playerStats.value.currentElo - 200),
        rank: 'Bronze'
      },
      medium: {
        id: 'ai-medium',
        name: 'AI Scholar',
        elo: playerStats.value.currentElo,
        rank: 'Silver'
      },
      hard: {
        id: 'ai-hard',
        name: 'AI Master',
        elo: playerStats.value.currentElo + 200,
        rank: 'Gold'
      }
    };

    const aiOpponent = aiOpponents[difficulty];

    console.log(`🎮 AI Battle started against ${aiOpponent.name}!`);
    alert(`🤖 ${aiOpponent.name}とのAI対戦を開始します！\n難易度: ${difficulty.toUpperCase()}\n※実装中のデモ機能です`);

  } catch (error) {
    console.error('❌ Failed to start AI battle:', error);
  }
}

async function handleBattleEnd(result: { winner: string; playerScore: number; opponentScore: number; eloChange?: number }) {
  try {
    // バトル終了処理
    await arenaStore.endBattle(result);

    // Daily Mission進捗更新
    if (result.winner === currentUserId.value) {
      await dailyMissionStore.updateMissionProgress('vocabulary_battle', 1);
    }

    console.log('🏁 Battle ended:', result);
  } catch (error) {
    console.error('❌ Failed to end battle:', error);
  }
}

function handleAnswerSubmit(answer: { questionId: string; selectedAnswer: number; isCorrect: boolean; responseTime: number }) {
  // リアルタイムでの回答処理
  arenaStore.submitAnswer(currentUserId.value, answer);
}

function watchReplay(battleId: string) {
  router.push(`/word-galaxy/vocabulary-arena/replay/${battleId}`);
}

function viewFullLeaderboard() {
  router.push('/word-galaxy/vocabulary-arena/leaderboard');
}

function getRankIcon(rank: string): string {
  const icons: Record<string, string> = {
    'Bronze': '🥉',
    'Silver': '🥈',
    'Gold': '🥇',
    'Platinum': '💎',
    'Diamond': '💠',
    'Master': '👑',
    'Grandmaster': '🌟'
  };
  return icons[rank] || '⚡';
}

function getRankMedal(index: number): string {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[index] || '🏅';
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Navigation
function backToWordGalaxy() {
  router.push('/word-galaxy');
}

// Lifecycle
onMounted(async () => {
  try {
    // Arena初期化
    await arenaStore.initialize(currentUserId.value);

    // プレイヤー統計とリーダーボード読み込み
    await Promise.all([
      arenaStore.loadPlayerStats(currentUserId.value),
      arenaStore.loadRecentBattles(currentUserId.value),
      arenaStore.loadLeaderboard()
    ]);

    console.log('⚔️ Vocabulary Arena initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Vocabulary Arena:', error);
  }
});

onUnmounted(() => {
  // クリーンアップ
  if (isQueuing.value) {
    cancelQueue();
  }
});
</script>

<style scoped>
.vocabulary-arena {
  @apply min-h-screen relative overflow-hidden;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.arena-background {
  @apply absolute inset-0 pointer-events-none;
}

.energy-field {
  @apply absolute inset-0;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: energyPulse 4s ease-in-out infinite;
}

.battle-lights {
  @apply absolute inset-0;
  background-image:
    linear-gradient(45deg, transparent 40%, rgba(239, 68, 68, 0.1) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(34, 197, 94, 0.1) 50%, transparent 60%);
  animation: battleLights 6s linear infinite;
}

.cosmic-particles {
  @apply absolute inset-0;
  background-image:
    radial-gradient(1px 1px at 25% 25%, rgba(255, 255, 255, 0.8), transparent),
    radial-gradient(1px 1px at 75% 75%, rgba(255, 255, 255, 0.6), transparent),
    radial-gradient(2px 2px at 50% 50%, rgba(59, 130, 246, 0.4), transparent);
  background-size: 100px 100px, 150px 150px, 200px 200px;
  animation: particleFloat 20s linear infinite;
}

.arena-header {
  @apply relative z-10 px-6 py-12;
  background: linear-gradient(135deg,
    rgba(30, 58, 138, 0.2) 0%,
    rgba(91, 33, 182, 0.1) 50%,
    rgba(239, 68, 68, 0.1) 100%);
}

.header-content {
  @apply max-w-6xl mx-auto flex justify-between items-center;
}

.back-button {
  @apply mb-4 px-4 py-2 bg-red-600/80 text-white rounded-lg;
  @apply hover:bg-red-500/90 transition-all duration-200;
  @apply border border-red-400/30 backdrop-blur-sm;
  @apply flex items-center gap-2 text-sm font-medium;
}

.arena-title {
  @apply text-5xl font-bold mb-4;
  background: linear-gradient(45deg, #ef4444, #f59e0b, #10b981, #3b82f6);
  @apply bg-clip-text text-transparent;
  text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
}

.title-icon {
  @apply text-6xl mr-4;
  filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.8));
}

.arena-subtitle {
  @apply text-xl text-gray-300;
}

.player-stats-section {
  @apply flex items-center gap-8;
}

.rank-display {
  @apply flex items-center gap-4 bg-black/30 rounded-2xl p-4;
  @apply border border-gray-600/30 backdrop-blur-sm;
}

.rank-icon {
  @apply text-4xl;
}

.rank-icon.bronze { filter: drop-shadow(0 0 10px #cd7f32); }
.rank-icon.silver { filter: drop-shadow(0 0 10px #c0c0c0); }
.rank-icon.gold { filter: drop-shadow(0 0 10px #ffd700); }
.rank-icon.platinum { filter: drop-shadow(0 0 10px #e5e4e2); }
.rank-icon.diamond { filter: drop-shadow(0 0 10px #b9f2ff); }

.rank-name {
  @apply text-xl font-bold text-white;
}

.elo-rating {
  @apply text-gray-400;
}

.battle-record {
  @apply flex items-center gap-4;
}

.record-item {
  @apply flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2;
  @apply border border-gray-600/30;
}

.record-icon {
  @apply text-xl;
}

.arena-main {
  @apply relative z-10 px-6 py-8;
}

.section-title {
  @apply text-3xl font-bold mb-8 flex items-center gap-3;
  @apply text-transparent bg-gradient-to-r from-white to-gray-300;
  @apply bg-clip-text;
}

.section-icon {
  @apply text-4xl;
}

.modes-grid {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12;
}

.mode-card {
  @apply relative bg-black/40 rounded-2xl p-8 border border-gray-600/30;
  @apply backdrop-blur-sm transition-all duration-300 cursor-pointer;
  @apply hover:scale-105 hover:shadow-2xl;
}

.mode-card.disabled {
  @apply opacity-60 cursor-not-allowed;
}

.quick-battle .mode-glow {
  @apply bg-gradient-to-br from-green-500/20 to-emerald-500/20;
}

.ranked-battle .mode-glow {
  @apply bg-gradient-to-br from-red-500/20 to-pink-500/20;
}

.tournament-mode .mode-glow {
  @apply bg-gradient-to-br from-purple-500/20 to-indigo-500/20;
}

.mode-background {
  @apply absolute inset-0 rounded-2xl overflow-hidden;
}

.mode-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
}

.mode-card:hover .mode-glow {
  @apply opacity-100;
}

.mode-content {
  @apply relative z-10;
}

.mode-icon {
  @apply text-6xl mb-4;
}

.mode-title {
  @apply text-2xl font-bold text-white mb-3;
}

.mode-description {
  @apply text-gray-300 mb-6;
}

.mode-features {
  @apply space-y-2 mb-6;
}

.feature-item {
  @apply flex items-center gap-2 text-sm text-gray-400;
}

.queue-status {
  @apply flex items-center gap-3 bg-blue-900/30 rounded-lg p-3;
  @apply border border-blue-500/30;
}

.queue-spinner {
  @apply w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

.coming-soon-badge {
  @apply absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600;
  @apply text-white text-xs px-3 py-1 rounded-full font-bold;
}

/* AI Battle Styles */
.ai-battle .mode-glow {
  background: radial-gradient(ellipse at center, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
}

.ai-difficulty-selector {
  @apply mt-4 p-4 bg-black/40 rounded-lg border border-green-500/30;
}

.ai-difficulty-selector h4 {
  @apply text-white text-sm font-semibold mb-3;
}

.difficulty-buttons {
  @apply flex gap-2;
}

.diff-btn {
  @apply px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200;
}

.diff-btn.easy {
  @apply bg-green-600/80 text-white hover:bg-green-500/90;
  @apply border border-green-400/30;
}

.diff-btn.medium {
  @apply bg-yellow-600/80 text-white hover:bg-yellow-500/90;
  @apply border border-yellow-400/30;
}

.diff-btn.hard {
  @apply bg-red-600/80 text-white hover:bg-red-500/90;
  @apply border border-red-400/30;
}

.battles-list {
  @apply space-y-4 mb-12;
}

.battle-item {
  @apply bg-black/30 rounded-xl p-4 border border-gray-600/30;
  @apply backdrop-blur-sm flex items-center gap-4;
}

.battle-item.victory {
  @apply border-green-500/30 bg-gradient-to-r from-green-900/20 to-transparent;
}

.battle-item.defeat {
  @apply border-red-500/30 bg-gradient-to-r from-red-900/20 to-transparent;
}

.battle-result {
  @apply flex items-center gap-2;
}

.result-icon {
  @apply text-2xl;
}

.result-text {
  @apply font-bold;
}

.battle-item.victory .result-text {
  @apply text-green-400;
}

.battle-item.defeat .result-text {
  @apply text-red-400;
}

.battle-details {
  @apply flex-1;
}

.opponent {
  @apply text-white font-semibold mb-1;
}

.battle-stats {
  @apply flex items-center gap-4 text-sm text-gray-400;
}

.elo-change {
  @apply flex items-center gap-1;
}

.elo-value.positive {
  @apply text-green-400;
}

.elo-value.negative {
  @apply text-red-400;
}

.replay-btn {
  @apply px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600;
  @apply text-white rounded-lg font-semibold;
  @apply hover:from-blue-700 hover:to-purple-700 transition-all duration-300;
}

.leaderboard-list {
  @apply space-y-3;
}

.leaderboard-item {
  @apply bg-black/30 rounded-xl p-4 border border-gray-600/30;
  @apply backdrop-blur-sm flex items-center gap-4;
}

.leaderboard-item.current-player {
  @apply border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-transparent;
}

.player-rank {
  @apply flex items-center gap-2;
}

.rank-number {
  @apply text-2xl font-bold text-white;
}

.rank-medal {
  @apply text-2xl;
}

.player-info {
  @apply flex-1;
}

.player-name {
  @apply text-white font-bold mb-1;
}

.player-details {
  @apply flex items-center gap-4 text-sm text-gray-400;
}

.player-rank-badge {
  @apply px-3 py-1 rounded-full text-white text-sm font-bold;
}

.player-rank-badge.bronze { @apply bg-gradient-to-r from-amber-600 to-amber-800; }
.player-rank-badge.silver { @apply bg-gradient-to-r from-gray-400 to-gray-600; }
.player-rank-badge.gold { @apply bg-gradient-to-r from-yellow-400 to-yellow-600; }

.view-all-btn {
  @apply ml-auto px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700;
  @apply text-white rounded-lg text-sm font-semibold;
  @apply hover:from-gray-700 hover:to-gray-800 transition-all duration-300;
}

.queue-controls {
  @apply fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50;
}

.cancel-queue-btn {
  @apply px-6 py-3 bg-gradient-to-r from-red-600 to-red-700;
  @apply text-white rounded-xl font-bold text-lg;
  @apply hover:from-red-700 hover:to-red-800 transition-all duration-300;
  @apply shadow-lg backdrop-blur-sm;
}

/* Animations */
@keyframes energyPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

@keyframes battleLights {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes particleFloat {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-100px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col gap-6;
  }

  .player-stats-section {
    @apply flex-col gap-4;
  }

  .modes-grid {
    @apply grid-cols-1;
  }

  .arena-title {
    @apply text-4xl;
  }
}
</style>