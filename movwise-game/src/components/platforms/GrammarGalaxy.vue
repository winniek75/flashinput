<template>
  <div class="grammar-galaxy-platform cosmic-background">
    <!-- Header -->
    <div class="platform-header">
      <div class="header-content">
        <div class="platform-title">
          <div class="title-icon">🌌</div>
          <div class="title-text">
            <h1>Grammar Galaxy</h1>
            <p class="subtitle">文法銀河 - 英語文法を宇宙で学ぼう</p>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">{{ totalStars }}</div>
              <div class="stat-label">獲得した星</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <div class="stat-value">{{ completedGames }}</div>
              <div class="stat-label">完了ゲーム</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-info">
              <div class="stat-value">{{ Math.round(totalTime / 60) }}</div>
              <div class="stat-label">学習時間(分)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Galaxy Map Navigation -->
    <div class="galaxy-sectors">
      <!-- Basic Grammar Sector -->
      <div class="galaxy-sector" :class="{ locked: !sectors.basic.unlocked }">
        <div class="sector-header">
          <div class="sector-icon">🎯</div>
          <div class="sector-info">
            <h3>基礎文法セクター</h3>
            <p>Basic Grammar Zone</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${sectors.basic.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ sectors.basic.progress }}% 完了</span>
          </div>
        </div>

        <div class="sector-games" v-if="sectors.basic.unlocked">
          <button
            v-for="game in basicGrammarGames"
            :key="game.id"
            @click="launchGame(game)"
            :class="['game-card', { completed: game.completed, locked: game.locked }]"
            :disabled="game.locked"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stars">⭐ {{ game.stars }}/3</span>
                <span class="difficulty" :class="game.difficulty">{{ getDifficultyLabel(game.difficulty) }}</span>
              </div>
            </div>
            <div class="game-status">
              <div v-if="game.completed" class="completed-badge">✅</div>
              <div v-else-if="game.locked" class="locked-badge">🔒</div>
              <div v-else class="play-badge">▶️</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Advanced Grammar Sector -->
      <div class="galaxy-sector" :class="{ locked: !sectors.advanced.unlocked }">
        <div class="sector-header">
          <div class="sector-icon">⚔️</div>
          <div class="sector-info">
            <h3>応用文法セクター</h3>
            <p>Advanced Grammar Zone</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${sectors.advanced.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ sectors.advanced.progress }}% 完了</span>
          </div>
        </div>

        <div class="sector-games" v-if="sectors.advanced.unlocked">
          <button
            v-for="game in advancedGrammarGames"
            :key="game.id"
            @click="launchGame(game)"
            :class="['game-card', { completed: game.completed, locked: game.locked }]"
            :disabled="game.locked"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stars">⭐ {{ game.stars }}/3</span>
                <span class="difficulty" :class="game.difficulty">{{ getDifficultyLabel(game.difficulty) }}</span>
              </div>
            </div>
            <div class="game-status">
              <div v-if="game.completed" class="completed-badge">✅</div>
              <div v-else-if="game.locked" class="locked-badge">🔒</div>
              <div v-else class="play-badge">▶️</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Battle Arena Sector -->
      <div class="galaxy-sector" :class="{ locked: !sectors.battle.unlocked }">
        <div class="sector-header">
          <div class="sector-icon">⚡</div>
          <div class="sector-info">
            <h3>バトルアリーナ</h3>
            <p>Grammar Battle Zone</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${sectors.battle.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ sectors.battle.progress }}% 完了</span>
          </div>
        </div>

        <div class="sector-games" v-if="sectors.battle.unlocked">
          <button
            v-for="game in battleGames"
            :key="game.id"
            @click="launchGame(game)"
            :class="['game-card', { completed: game.completed, locked: game.locked }]"
            :disabled="game.locked"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stars">⭐ {{ game.stars }}/3</span>
                <span class="difficulty" :class="game.difficulty">{{ getDifficultyLabel(game.difficulty) }}</span>
              </div>
            </div>
            <div class="game-status">
              <div v-if="game.completed" class="completed-badge">✅</div>
              <div v-else-if="game.locked" class="locked-badge">🔒</div>
              <div v-else class="play-badge">▶️</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Master Challenge Sector -->
      <div class="galaxy-sector" :class="{ locked: !sectors.master.unlocked }">
        <div class="sector-header">
          <div class="sector-icon">👑</div>
          <div class="sector-info">
            <h3>マスターチャレンジ</h3>
            <p>Master Challenge Zone</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${sectors.master.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ sectors.master.progress }}% 完了</span>
          </div>
        </div>

        <div class="sector-games" v-if="sectors.master.unlocked">
          <button
            v-for="game in masterGames"
            :key="game.id"
            @click="launchGame(game)"
            :class="['game-card', { completed: game.completed, locked: game.locked }]"
            :disabled="game.locked"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h4>{{ game.name }}</h4>
              <p>{{ game.description }}</p>
              <div class="game-stats">
                <span class="stars">⭐ {{ game.stars }}/3</span>
                <span class="difficulty" :class="game.difficulty">{{ getDifficultyLabel(game.difficulty) }}</span>
              </div>
            </div>
            <div class="game-status">
              <div v-if="game.completed" class="completed-badge">✅</div>
              <div v-else-if="game.locked" class="locked-badge">🔒</div>
              <div v-else class="play-badge">▶️</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Back Button -->
    <button @click="$router.push('/')" class="floating-back-btn">
      <div class="btn-icon">🏠</div>
      <span>ホームへ戻る</span>
    </button>

    <!-- Achievement Notification -->
    <div v-if="showAchievement" class="achievement-popup">
      <div class="achievement-content">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
          <h4>新しい実績を解除！</h4>
          <p>{{ achievementText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GrammarGalaxy',
  setup() {
    const router = useRouter()

    // Reactive data
    const showAchievement = ref(false)
    const achievementText = ref('')

    // Sectors data
    const sectors = ref({
      basic: { unlocked: true, progress: 75 },
      advanced: { unlocked: true, progress: 45 },
      battle: { unlocked: true, progress: 20 },
      master: { unlocked: true, progress: 15 } // アンロック＆Grammar Art Gallery追加による進捗
    })

    // Game data for each sector
    const basicGrammarGames = ref([
      {
        id: 'sentence-builder-master',
        name: '英作文マスター',
        description: '段階的に英文構造を学習して英作文をマスター',
        icon: '📝',
        stars: 0,
        completed: false,
        locked: false,
        difficulty: 'easy',
        route: '/sentence-builder-master'
      },
      {
        id: 'verb-time-machine',
        name: '動詞タイムマシン',
        description: '動詞の時制を時間旅行で学習',
        icon: '⏰',
        stars: 2,
        completed: true,
        locked: false,
        difficulty: 'easy',
        component: 'VerbTimeMachine'
      },
      {
        id: 'question-detective',
        name: '疑問詞探偵',
        description: 'Who, What, Whereを使い分けよう',
        icon: '🔍',
        stars: 3,
        completed: true,
        locked: false,
        difficulty: 'medium',
        component: 'GalacticQuestionNavigator'
      },
      {
        id: 'puzzle-cascade',
        name: 'パズルカスケード',
        description: '文法要素をパズルで組み立て',
        icon: '🧩',
        stars: 1,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'GrammarPuzzleCascadeGame'
      },
      {
        id: 'verb-pattern-galaxy',
        name: '動詞パターン銀河',
        description: '動詞+ing/toパターンを宇宙の冒険で習得',
        icon: '🌌',
        stars: 0,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'VerbPatternGalaxyHub',
        route: { name: 'verb-pattern-galaxy-hub' }
      }
    ])

    const advancedGrammarGames = ref([
      {
        id: 'progressive-tense',
        name: '進行形マスター',
        description: '進行形を宇宙船で学習',
        icon: '🚀',
        stars: 2,
        completed: true,
        locked: false,
        difficulty: 'medium',
        component: 'ProgressiveTenseGame'
      },
      {
        id: 'modal-verb-challenge',
        name: '助動詞バトルアリーナ',
        description: 'Can, Must, Shouldをマスター',
        icon: '💪',
        stars: 1,
        completed: false,
        locked: false,
        difficulty: 'hard',
        component: 'ModalVerbChallengeGame'
      },
      {
        id: 'comparison-master',
        name: '比較表現反射トレーニング',
        description: 'bigger, biggest... 比較を極めよう',
        icon: '📊',
        stars: 2,
        completed: true,
        locked: false,
        difficulty: 'hard',
        component: 'ComparisonMasterGame'
      },
      {
        id: 'conjunction-connection',
        name: '接続詞コネクション',
        description: 'and, but, soで文をつなげよう',
        icon: '🔗',
        stars: 0,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'ConjunctionConnectionGame'
      }
    ])

    const battleGames = ref([
      {
        id: 'grammar-reflex-arena',
        name: 'グラマーアリーナ',
        description: '瞬発力で文法問題に挑戦',
        icon: '⚔️',
        stars: 1,
        completed: false,
        locked: false,
        difficulty: 'hard',
        component: 'GrammarReflexArena'
      },
      {
        id: 'pattern-hunter',
        name: 'パターンハンター',
        description: '文法パターンを狩り集めよう',
        icon: '🎯',
        stars: 0,
        completed: false,
        locked: false,
        difficulty: 'hard',
        component: 'PatternHunterGame'
      },
      {
        id: 'word-order-quest',
        name: 'ワードオーダークエスト',
        description: '正しい語順で宇宙を救え',
        icon: '🌟',
        stars: 0,
        completed: false,
        locked: false,
        difficulty: 'expert',
        component: 'SpaceWordOrderQuest'
      }
    ])

    const masterGames = ref([
      {
        id: 'grammar-art-gallery',
        name: 'Grammar Art Gallery',
        description: '宇宙の文法アーティファクトを読み解き、言語の奥義を解き放て！',
        icon: '🏛️',
        stars: 0,
        completed: false,
        locked: false, // 常に利用可能
        difficulty: 'master',
        route: '/grammar-art-gallery' // 直接ルート指定
      },
      {
        id: 'time-zone-navigator',
        name: 'タイムゾーンナビゲーター',
        description: '複雑な時制を完全マスター',
        icon: '🌍',
        stars: 0,
        completed: false,
        locked: true,
        difficulty: 'expert',
        component: 'TimeZoneNavigatorGame'
      },
      {
        id: 'grammar-constructor',
        name: 'グラマー・コンストラクター',
        description: '完璧な文章を構築しよう',
        icon: '🏗️',
        stars: 0,
        completed: false,
        locked: true,
        difficulty: 'expert',
        component: 'GrammarConstructor'
      }
    ])

    // Computed properties
    const totalStars = computed(() => {
      const allGames = [
        ...basicGrammarGames.value,
        ...advancedGrammarGames.value,
        ...battleGames.value,
        ...masterGames.value
      ]
      return allGames.reduce((total, game) => total + game.stars, 0)
    })

    const completedGames = computed(() => {
      const allGames = [
        ...basicGrammarGames.value,
        ...advancedGrammarGames.value,
        ...battleGames.value,
        ...masterGames.value
      ]
      return allGames.filter(game => game.completed).length
    })

    const totalTime = computed(() => {
      // Simulated total learning time in minutes
      return completedGames.value * 15 + totalStars.value * 5
    })

    // Methods
    const launchGame = (game) => {
      if (game.locked) return

      // 直接ルートが指定されている場合
      if (game.route) {
        router.push(game.route)
        return
      }

      // Navigate to the specific game component
      router.push({
        name: 'GrammarGame',
        params: { gameId: game.id },
        query: { component: game.component }
      })
    }

    const getDifficultyLabel = (difficulty) => {
      const labels = {
        easy: '初級',
        medium: '中級',
        hard: '上級',
        expert: '専門',
        master: 'マスター'
      }
      return labels[difficulty] || '不明'
    }

    const showAchievementPopup = (text) => {
      achievementText.value = text
      showAchievement.value = true
      setTimeout(() => {
        showAchievement.value = false
      }, 3000)
    }

    // Lifecycle
    onMounted(() => {
      // Check for new achievements
      if (totalStars.value >= 10 && !localStorage.getItem('grammar-10-stars')) {
        localStorage.setItem('grammar-10-stars', 'true')
        showAchievementPopup('文法銀河で10個の星を獲得しました！')
      }
    })

    return {
      sectors,
      basicGrammarGames,
      advancedGrammarGames,
      battleGames,
      masterGames,
      totalStars,
      completedGames,
      totalTime,
      showAchievement,
      achievementText,
      launchGame,
      getDifficultyLabel
    }
  }
}
</script>

<style scoped>
.grammar-galaxy-platform {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1a1c5a 0%, #0a0b2e 50%, #000 100%);
  color: white;
  overflow-x: hidden;
}

.cosmic-background {
  position: relative;
}

.cosmic-background::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: stars-twinkle 120s linear infinite;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

@keyframes stars-twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

.platform-header {
  position: relative;
  z-index: 10;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.platform-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title-text h1 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #fff 0%, #e0e7ff 50%, #c7d2fe 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.platform-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #e0e7ff;
}

.stat-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

.galaxy-sectors {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.galaxy-sector {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.galaxy-sector:hover {
  border-color: rgba(199, 210, 254, 0.4);
  box-shadow: 0 10px 30px rgba(199, 210, 254, 0.1);
}

.galaxy-sector.locked {
  opacity: 0.5;
  pointer-events: none;
}

.sector-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sector-icon {
  font-size: 2rem;
}

.sector-info h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e0e7ff;
  margin: 0 0 0.25rem 0;
}

.sector-info p {
  color: #94a3b8;
  margin: 0 0 0.5rem 0;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.sector-games {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.game-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(199, 210, 254, 0.4);
  box-shadow: 0 5px 20px rgba(199, 210, 254, 0.1);
}

.game-card.completed {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}

.game-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.game-info {
  flex-grow: 1;
}

.game-info h4 {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e0e7ff;
  margin: 0 0 0.25rem 0;
}

.game-info p {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.game-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
}

.stars {
  color: #fbbf24;
}

.difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.difficulty.easy {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.difficulty.medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.difficulty.hard {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.difficulty.expert {
  background: rgba(147, 51, 234, 0.2);
  color: #a855f7;
}

.difficulty.master {
  background: linear-gradient(45deg, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.3));
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.5);
  font-weight: bold;
  animation: master-glow 2s ease-in-out infinite alternate;
}

@keyframes master-glow {
  from {
    box-shadow: 0 0 5px rgba(168, 85, 247, 0.3);
  }
  to {
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.6);
  }
}

.game-status {
  flex-shrink: 0;
  font-size: 1.2rem;
}

.floating-back-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.floating-back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(199, 210, 254, 0.4);
}

.btn-icon {
  font-size: 1.2rem;
}

.achievement-popup {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 100;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 1rem;
  padding: 1rem;
  backdrop-filter: blur(20px);
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-text h4 {
  color: #4ade80;
  margin: 0 0 0.25rem 0;
}

.achievement-text p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .platform-stats {
    justify-content: center;
  }

  .sector-header {
    flex-direction: column;
    text-align: center;
  }

  .sector-games {
    grid-template-columns: 1fr;
  }

  .floating-back-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
  }

  .achievement-popup {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>