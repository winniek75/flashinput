<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-12 text-center">
      <!-- 戻るボタン -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        戻る
      </button>

      <div class="max-w-6xl mx-auto">
        <h1 class="text-6xl font-bold mb-4 galaxy-text-primary cosmic-title">
          ⚔️ バトルアリーナ
        </h1>
        <p class="text-2xl mb-3 text-white">
          実力を試す究極の学習バトル場
        </p>
        <p class="text-lg mb-8 text-slate-300 max-w-3xl mx-auto">
          様々なバトル形式で英語スキルを鍛えよう！レベルアップ、称号獲得、ランキング挑戦が待っている
        </p>
      </div>
    </header>

    <!-- Arena Categories -->
    <section class="relative z-10 px-6 pb-32">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <!-- Word Rush Arena -->
          <div
            @click="navigateTo('/word-rush')"
            class="arena-card word-rush-card"
          >
            <div class="arena-icon">⚡</div>
            <h3 class="arena-title">ワードラッシュ・アリーナ</h3>
            <p class="arena-description">高速単語認識バトル</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">最高スコア:</span>
                <span class="stat-value">{{ wordRushStats.highScore || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">ランク:</span>
                <span class="stat-value">{{ wordRushStats.rank || 'ブロンズ' }}</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">瞬間判断</span>
              <span class="feature-tag">語彙力</span>
              <span class="feature-tag">反射神経</span>
            </div>
          </div>

          <!-- Typing Arena -->
          <div
            @click="navigateTo('/platforms/typing-arena')"
            class="arena-card typing-arena-card"
          >
            <div class="arena-icon">⌨️</div>
            <h3 class="arena-title">タイピング・アリーナ</h3>
            <p class="arena-description">英検対応タイピングバトル</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">最高WPM:</span>
                <span class="stat-value">{{ typingStats.maxWPM || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正確率:</span>
                <span class="stat-value">{{ typingStats.accuracy || 0 }}%</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">ストーリーモード</span>
              <span class="feature-tag">キャラ育成</span>
              <span class="feature-tag">英検対応</span>
            </div>
          </div>

          <!-- Typing Arena Enhanced -->
          <div
            @click="navigateTo('/typing-arena-enhanced')"
            class="arena-card enhanced-arena-card"
          >
            <div class="arena-icon">🌟</div>
            <h3 class="arena-title">タイピング・アリーナ強化版</h3>
            <p class="arena-description">ペット&スキルシステム搭載</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">レベル:</span>
                <span class="stat-value">Lv.{{ enhancedStats.level || 1 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">称号:</span>
                <span class="stat-value">{{ enhancedStats.title || '初心者' }}</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">ペットシステム</span>
              <span class="feature-tag">ボスバトル</span>
              <span class="feature-tag">スキルツリー</span>
            </div>
          </div>

          <!-- Dictation & Spelling -->
          <div
            @click="navigateTo('/dictation-spelling-hub')"
            class="arena-card dictation-card"
          >
            <div class="arena-icon">📝</div>
            <h3 class="arena-title">ディクテーション・センター</h3>
            <p class="arena-description">聞く×書くの統合訓練</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">完了ミッション:</span>
                <span class="stat-value">{{ dictationStats.completed || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">精度:</span>
                <span class="stat-value">{{ dictationStats.accuracy || 0 }}%</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">音声認識</span>
              <span class="feature-tag">スペリング</span>
              <span class="feature-tag">聴解力</span>
            </div>
          </div>

          <!-- Sound Battle Arena -->
          <div
            @click="navigateTo('/games/sound-battle-arena')"
            class="arena-card sound-battle-card"
          >
            <div class="arena-icon">🎯</div>
            <h3 class="arena-title">サウンドバトル・アリーナ</h3>
            <p class="arena-description">音韻認識対戦バトル</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">勝利数:</span>
                <span class="stat-value">{{ soundBattleStats.wins || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">連勝:</span>
                <span class="stat-value">{{ soundBattleStats.streak || 0 }}</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">音韻識別</span>
              <span class="feature-tag">対戦モード</span>
              <span class="feature-tag">リアルタイム</span>
            </div>
          </div>

          <!-- Grammar Reflex Arena -->
          <div
            @click="navigateTo('/games/grammar-reflex-arena')"
            class="arena-card grammar-reflex-card"
          >
            <div class="arena-icon">⚡</div>
            <h3 class="arena-title">文法リフレックス・アリーナ</h3>
            <p class="arena-description">瞬間文法判断バトル</p>
            <div class="arena-stats">
              <div class="stat-item">
                <span class="stat-label">反応速度:</span>
                <span class="stat-value">{{ grammarReflexStats.speed || 0 }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正解率:</span>
                <span class="stat-value">{{ grammarReflexStats.accuracy || 0 }}%</span>
              </div>
            </div>
            <div class="arena-features">
              <span class="feature-tag">瞬間判断</span>
              <span class="feature-tag">文法力</span>
              <span class="feature-tag">スピード</span>
            </div>
          </div>
        </div>

        <!-- Arena Ranking & Achievements -->
        <div class="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Global Ranking -->
          <div class="ranking-card">
            <h3 class="ranking-title">🏆 グローバルランキング</h3>
            <div class="ranking-content">
              <div class="ranking-item" v-for="(player, index) in topPlayers" :key="index">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="player-name">{{ player.name }}</span>
                <span class="player-score">{{ player.score }}</span>
              </div>
              <div class="your-rank">
                <span>あなたの順位:</span>
                <span class="rank-highlight">{{ yourRank || '---' }}位</span>
              </div>
            </div>
          </div>

          <!-- Recent Achievements -->
          <div class="achievement-card">
            <h3 class="achievement-title">🎖️ 最近の実績</h3>
            <div class="achievement-content">
              <div class="achievement-item" v-for="achievement in recentAchievements" :key="achievement.id">
                <span class="achievement-icon">{{ achievement.icon }}</span>
                <div class="achievement-info">
                  <div class="achievement-name">{{ achievement.name }}</div>
                  <div class="achievement-desc">{{ achievement.description }}</div>
                </div>
              </div>
              <button @click="viewAllAchievements" class="view-all-btn">
                すべての実績を見る
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Navigation -->
    <CommonFooter
      :active="'arena'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonFooter from '@/components/CommonFooter.vue'

const router = useRouter()

// Arena statistics (would normally come from store)
const wordRushStats = ref({
  highScore: 12500,
  rank: 'シルバー'
})

const typingStats = ref({
  maxWPM: 45,
  accuracy: 92
})

const enhancedStats = ref({
  level: 8,
  title: 'タイピング戦士'
})

const dictationStats = ref({
  completed: 24,
  accuracy: 88
})

const soundBattleStats = ref({
  wins: 36,
  streak: 5
})

const grammarReflexStats = ref({
  speed: 850,
  accuracy: 94
})

// Ranking data
const topPlayers = ref([
  { name: 'DragonMaster', score: 98500 },
  { name: 'LightningTyper', score: 87200 },
  { name: 'WordNinja', score: 76800 },
  { name: 'GrammarKing', score: 71500 },
  { name: 'SpeedDemon', score: 68900 }
])

const yourRank = ref(127)

// Recent achievements
const recentAchievements = ref([
  {
    id: 1,
    icon: '🏃',
    name: 'スピードスター',
    description: 'WPM 50達成'
  },
  {
    id: 2,
    icon: '🎯',
    name: '精密射手',
    description: '正確率95%以上を維持'
  },
  {
    id: 3,
    icon: '🔥',
    name: '連勝王',
    description: '10連勝達成'
  }
])

// Navigation functions
const navigateTo = (path) => {
  router.push(path)
}

const handleBack = () => {
  router.push('/')
}

const handleFooterNavigation = (destination) => {
  switch(destination) {
    case 'sound':
      router.push('/sound-adventure')
      break
    case 'grammar':
      router.push('/grammar-galaxy')
      break
    case 'arena':
      router.push('/arena-hub')
      break
    case 'multi-layer':
      router.push('/ai-practice-buddy')
      break
    case 'vr-academy':
      router.push('/vr-academy')
      break
    case 'co-pilot':
      router.push('/co-pilot-dock')
      break
    case 'profile':
      router.push('/profile')
      break
    default:
      router.push('/')
  }
}

const viewAllAchievements = () => {
  router.push('/achievements')
}
</script>

<style scoped>
/* Galaxy background layers */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: transparent;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, #ddd, transparent),
                    radial-gradient(1px 1px at 50px 50px, #fff, transparent);
  background-size: 200px 200px;
  animation: moveStars 120s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(3px 3px at 50px 160px, #ddd, transparent),
                    radial-gradient(2px 2px at 90px 40px, #eee, transparent),
                    radial-gradient(1px 1px at 130px 100px, #fff, transparent);
  background-size: 300px 300px;
  animation: moveStars 180s linear infinite;
}

.stars-layer-3 {
  background-image: radial-gradient(1px 1px at 100px 120px, #fff, transparent),
                    radial-gradient(2px 2px at 200px 200px, #eee, transparent);
  background-size: 400px 400px;
  animation: moveStars 240s linear infinite;
}

@keyframes moveStars {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2000px); }
}

/* Arena Cards */
.arena-card {
  @apply p-8 rounded-3xl cursor-pointer transition-all duration-300;
  background: linear-gradient(135deg,
    rgba(30, 30, 60, 0.95) 0%,
    rgba(40, 40, 80, 0.95) 50%,
    rgba(20, 20, 50, 0.95) 100%
  );
  border: 2px solid rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.arena-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow:
    0 25px 60px rgba(99, 102, 241, 0.4),
    0 15px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.word-rush-card:hover {
  border-color: rgba(251, 191, 36, 0.8);
  box-shadow: 0 25px 60px rgba(251, 191, 36, 0.4);
}

.typing-arena-card:hover {
  border-color: rgba(147, 51, 234, 0.8);
  box-shadow: 0 25px 60px rgba(147, 51, 234, 0.4);
}

.enhanced-arena-card:hover {
  border-color: rgba(236, 72, 153, 0.8);
  box-shadow: 0 25px 60px rgba(236, 72, 153, 0.4);
}

.dictation-card:hover {
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 25px 60px rgba(59, 130, 246, 0.4);
}

.sound-battle-card:hover {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 25px 60px rgba(34, 197, 94, 0.4);
}

.grammar-reflex-card:hover {
  border-color: rgba(239, 68, 68, 0.8);
  box-shadow: 0 25px 60px rgba(239, 68, 68, 0.4);
}

.arena-icon {
  @apply text-6xl mb-4;
  filter: drop-shadow(0 0 20px currentColor);
}

.arena-title {
  @apply text-2xl font-bold text-white mb-2;
}

.arena-description {
  @apply text-slate-300 mb-6;
}

.arena-stats {
  @apply space-y-2 mb-6;
}

.stat-item {
  @apply flex justify-between;
}

.stat-label {
  @apply text-slate-400;
}

.stat-value {
  @apply text-yellow-400 font-bold;
}

.arena-features {
  @apply flex flex-wrap gap-2;
}

.feature-tag {
  @apply px-3 py-1 bg-white/10 rounded-full text-xs text-white;
}

/* Ranking & Achievement Cards */
.ranking-card,
.achievement-card {
  @apply p-8 rounded-3xl;
  background: linear-gradient(135deg,
    rgba(30, 30, 60, 0.95) 0%,
    rgba(40, 40, 80, 0.95) 50%,
    rgba(20, 20, 50, 0.95) 100%
  );
  border: 2px solid rgba(251, 191, 36, 0.3);
}

.ranking-title,
.achievement-title {
  @apply text-2xl font-bold text-yellow-400 mb-6;
}

.ranking-item {
  @apply flex items-center gap-4 py-3 border-b border-white/10;
}

.rank-number {
  @apply text-2xl font-bold text-yellow-400 w-12;
}

.player-name {
  @apply flex-1 text-white;
}

.player-score {
  @apply text-cyan-400 font-bold;
}

.your-rank {
  @apply mt-6 pt-6 border-t border-white/20 flex justify-between text-lg;
}

.rank-highlight {
  @apply text-yellow-400 font-bold;
}

.achievement-item {
  @apply flex gap-4 py-3 border-b border-white/10;
}

.achievement-icon {
  @apply text-3xl;
}

.achievement-info {
  @apply flex-1;
}

.achievement-name {
  @apply text-white font-bold mb-1;
}

.achievement-desc {
  @apply text-slate-400 text-sm;
}

.view-all-btn {
  @apply mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all;
}

/* Utility classes */
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.galaxy-text-primary {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-galaxy-moon-silver {
  color: #cbd5e1;
}

.cosmic-title {
  text-shadow:
    0 0 40px rgba(96, 165, 250, 0.8),
    0 0 80px rgba(167, 139, 250, 0.6),
    0 0 120px rgba(96, 165, 250, 0.4);
  animation: cosmicPulse 3s ease-in-out infinite;
}

@keyframes cosmicPulse {
  0%, 100% {
    text-shadow:
      0 0 40px rgba(96, 165, 250, 0.8),
      0 0 80px rgba(167, 139, 250, 0.6),
      0 0 120px rgba(96, 165, 250, 0.4);
  }
  50% {
    text-shadow:
      0 0 50px rgba(96, 165, 250, 1),
      0 0 100px rgba(167, 139, 250, 0.8),
      0 0 150px rgba(96, 165, 250, 0.6);
  }
}
</style>