<template>
  <div class="vocabulary-world-platform cosmic-background">
    <!-- Header -->
    <div class="platform-header">
      <div class="header-content">
        <div class="platform-title">
          <div class="title-icon">📚</div>
          <div class="title-text">
            <h1>Vocabulary World</h1>
            <p class="subtitle">語彙の世界 - 言葉の力で宇宙を探索しよう</p>
          </div>
        </div>

        <div class="platform-stats">
          <div class="stat-card">
            <div class="stat-icon">📖</div>
            <div class="stat-info">
              <div class="stat-value">{{ totalWords }}</div>
              <div class="stat-label">習得語彙</div>
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
              <div class="stat-value">{{ vocabularyLevel }}</div>
              <div class="stat-label">語彙レベル</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- World Map Navigation -->
    <div class="vocabulary-worlds">
      <!-- Basic Words World -->
      <div class="vocab-world" :class="{ locked: !worlds.basic.unlocked }">
        <div class="world-header">
          <div class="world-icon">🌱</div>
          <div class="world-info">
            <h3>基礎語彙の森</h3>
            <p>Basic Words Forest</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${worlds.basic.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ worlds.basic.progress }}% 完了</span>
          </div>
        </div>

        <div class="world-games" v-if="worlds.basic.unlocked">
          <button
            v-for="game in basicWordGames"
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
                <span class="words">📖 {{ game.wordsLearned }}語</span>
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

      <!-- Theme Words World -->
      <div class="vocab-world" :class="{ locked: !worlds.theme.unlocked }">
        <div class="world-header">
          <div class="world-icon">🎭</div>
          <div class="world-info">
            <h3>テーマ語彙の街</h3>
            <p>Theme Words City</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${worlds.theme.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ worlds.theme.progress }}% 完了</span>
          </div>
        </div>

        <div class="world-games" v-if="worlds.theme.unlocked">
          <button
            v-for="game in themeWordGames"
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
                <span class="words">📖 {{ game.wordsLearned }}語</span>
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

      <!-- Advanced Words World -->
      <div class="vocab-world" :class="{ locked: !worlds.advanced.unlocked }">
        <div class="world-header">
          <div class="world-icon">🏰</div>
          <div class="world-info">
            <h3>フレーズ銀河の城</h3>
            <p>Phrase Galaxy Castle</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${worlds.advanced.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ worlds.advanced.progress }}% 完了</span>
          </div>
        </div>

        <div class="world-games" v-if="worlds.advanced.unlocked">
          <button
            v-for="game in advancedWordGames"
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
                <span class="words">📖 {{ game.wordsLearned }}語</span>
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

      <!-- Magic & Spelling World -->
      <div class="vocab-world" :class="{ locked: !worlds.magic.unlocked }">
        <div class="world-header">
          <div class="world-icon">🪄</div>
          <div class="world-info">
            <h3>魔法のスペル研究所</h3>
            <p>Magic Spelling Laboratory</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${worlds.magic.progress}%` }"></div>
            </div>
            <span class="progress-text">{{ worlds.magic.progress }}% 完了</span>
          </div>
        </div>

        <div class="world-games" v-if="worlds.magic.unlocked">
          <button
            v-for="game in magicWordGames"
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
                <span class="words">📖 {{ game.wordsLearned }}語</span>
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

    <!-- Achievement Display -->
    <div class="achievements-section">
      <h3>🏆 語彙習得の成果</h3>
      <div class="achievements-grid">
        <div
          v-for="achievement in achievements"
          :key="achievement.id"
          :class="['achievement-card', { unlocked: achievement.unlocked }]"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <h4>{{ achievement.name }}</h4>
            <p>{{ achievement.description }}</p>
            <div class="achievement-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${achievement.progress}%` }"></div>
              </div>
              <span class="progress-text">{{ achievement.current }}/{{ achievement.target }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Back Button -->
    <button @click="$router.push('/')" class="floating-back-btn">
      <div class="btn-icon">🏠</div>
      <span>ホームへ戻る</span>
    </button>

    <!-- Vocabulary Stats Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click="showStatsModal = false">
      <div class="stats-modal" @click.stop>
        <div class="modal-header">
          <h3>📊 詳細統計</h3>
          <button @click="showStatsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">総学習語彙数</div>
              <div class="stat-value">{{ totalWords }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">今週の新語彙</div>
              <div class="stat-value">{{ weeklyWords }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">語彙習得率</div>
              <div class="stat-value">{{ masteryRate }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">次のレベルまで</div>
              <div class="stat-value">{{ wordsToNextLevel }}語</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'VocabularyWorld',
  setup() {
    const router = useRouter()
    const showStatsModal = ref(false)

    // Worlds data
    const worlds = ref({
      basic: { unlocked: true, progress: 80 },
      theme: { unlocked: true, progress: 60 },
      advanced: { unlocked: true, progress: 30 },
      magic: { unlocked: false, progress: 0 }
    })

    // Game data for each world
    const basicWordGames = ref([
      {
        id: 'word-rush',
        name: 'ワードラッシュ',
        description: '瞬間的な語彙認識力で高速単語ゲーム',
        icon: '⚡',
        wordsLearned: 120,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'WordRushGame'
      },
      {
        id: 'sight-words',
        name: 'サイトワードマスター',
        description: 'よく使われる英単語を覚えよう',
        icon: '👁️',
        wordsLearned: 50,
        completed: true,
        locked: false,
        difficulty: 'easy',
        component: 'SightWordMaster'
      },
      {
        id: 'cvc-words',
        name: 'CVC単語ゲーム',
        description: '子音-母音-子音の基本単語',
        icon: '🔤',
        wordsLearned: 75,
        completed: true,
        locked: false,
        difficulty: 'easy',
        component: 'CvcWordGame'
      },
      {
        id: 'word-family-tree',
        name: 'ワードファミリー',
        description: '単語の家族を見つけよう',
        icon: '🌳',
        wordsLearned: 40,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'WordFamilyTreeGame'
      },
      {
        id: 'basic-dictation',
        name: '基礎ディクテーション',
        description: '聞いた単語を正しく書こう',
        icon: '✏️',
        wordsLearned: 30,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'WordDictationChallenge'
      }
    ])

    const themeWordGames = ref([
      {
        id: 'theme-shopping-adventure',
        name: 'テーマショッピング・アドベンチャー',
        description: '宇宙ショッピングモールでテーマ別語彙を集めよう',
        icon: '🏪',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'ThemeShoppingAdventure'
      },
      {
        id: 'roleplay-theater',
        name: 'ロールプレイ・シアター',
        description: '様々な職業や場面でロールプレイを体験',
        icon: '🎭',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'hard',
        component: 'RolePlayTheater'
      }
    ])

    const advancedWordGames = ref([
      {
        id: 'phrase-galaxy',
        name: 'Phrase Galaxy',
        description: '流れる星と英熟語をマッチング！英検5級〜2級レベルの熟語を宇宙テーマで学習',
        icon: '🌌',
        wordsLearned: 50,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'PhraseGalaxy'
      }
    ])

    const magicWordGames = ref([
      // Magic spelling games section - currently empty
    ])

    // Achievements data
    const achievements = ref([
      {
        id: 'first-100',
        name: '初級マスター',
        description: '100語を習得しよう',
        icon: '🥉',
        current: 85,
        target: 100,
        progress: 85,
        unlocked: false
      },
      {
        id: 'theme-explorer',
        name: 'テーマ探検家',
        description: '5つのテーマをクリア',
        icon: '🗺️',
        current: 3,
        target: 5,
        progress: 60,
        unlocked: false
      },
      {
        id: 'spell-master',
        name: 'スペルマスター',
        description: 'スペルゲームを完璧にクリア',
        icon: '✨',
        current: 0,
        target: 1,
        progress: 0,
        unlocked: false
      },
      {
        id: 'vocab-champion',
        name: '語彙チャンピオン',
        description: '500語を習得しよう',
        icon: '👑',
        current: 315,
        target: 500,
        progress: 63,
        unlocked: false
      }
    ])

    // Computed properties
    const totalWords = computed(() => {
      const allGames = [
        ...basicWordGames.value,
        ...themeWordGames.value,
        ...advancedWordGames.value,
        ...magicWordGames.value
      ]
      return allGames.reduce((total, game) => total + game.wordsLearned, 0)
    })

    const completedGames = computed(() => {
      const allGames = [
        ...basicWordGames.value,
        ...themeWordGames.value,
        ...advancedWordGames.value,
        ...magicWordGames.value
      ]
      return allGames.filter(game => game.completed).length
    })

    const vocabularyLevel = computed(() => {
      const words = totalWords.value
      if (words < 100) return 1
      if (words < 250) return 2
      if (words < 500) return 3
      if (words < 750) return 4
      return 5
    })

    const weeklyWords = computed(() => {
      return Math.floor(totalWords.value * 0.1) // Simulate weekly progress
    })

    const masteryRate = computed(() => {
      const total = basicWordGames.value.length + themeWordGames.value.length +
                   advancedWordGames.value.length + magicWordGames.value.length
      return Math.round((completedGames.value / total) * 100)
    })

    const wordsToNextLevel = computed(() => {
      const currentLevel = vocabularyLevel.value
      const nextLevelThreshold = [100, 250, 500, 750, 1000][currentLevel] || 1000
      return Math.max(0, nextLevelThreshold - totalWords.value)
    })

    // Methods - Word Galaxy機能を統合
    const launchGame = (game) => {
      if (game.locked) return

      // Word Galaxyの機能を統合したルーティング
      const gameRoutes = {
        'word-rush': '/games/word-rush',
        'sight-words': '/games/sight-word-master',
        'word-family': '/games/word-family-tree',
        'theme-shopping': '/games/theme-shopping-adventure',
        'roleplay-theater': '/games/roleplay-theater',
        'phrase-galaxy': '/games/phrase-galaxy',
        // Memory Station とDaily Mission のWord Galaxy機能
        'memory-station': '/word-galaxy/memory-station',
        'daily-mission': '/word-galaxy/daily-mission',
        'vocabulary-arena': '/word-galaxy/vocabulary-arena',
        'learning-dashboard': '/word-galaxy/learning-dashboard'
      }

      const route = gameRoutes[game.id]
      if (route) {
        router.push(route)
      } else {
        // Fallback to original vocabulary game wrapper
        router.push({
          name: 'VocabularyGame',
          params: { gameId: game.id },
          query: { component: game.component }
        })
      }
    }

    // Word Galaxy統合用の新しいゲームを追加
    const addWordGalaxyFeatures = () => {
      // Memory Station を統合
      basicWordGames.value.push({
        id: 'memory-station',
        name: 'Memory Station',
        description: '科学的な間隔反復学習で単語を確実に記憶',
        icon: '🧠',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'MemoryStation'
      })

      // Daily Mission を統合
      basicWordGames.value.push({
        id: 'daily-mission',
        name: 'Daily Mission',
        description: '毎日のミッションで継続的な学習習慣を構築',
        icon: '📅',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'easy',
        component: 'DailyMission'
      })

      // Vocabulary Arena を統合
      advancedWordGames.value.push({
        id: 'vocabulary-arena',
        name: 'Vocabulary Arena',
        description: 'リアルタイムバトルで語彙力を競う',
        icon: '⚔️',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'hard',
        component: 'VocabularyArena'
      })

      // Learning Dashboard を統合
      advancedWordGames.value.push({
        id: 'learning-dashboard',
        name: 'Learning Dashboard',
        description: '学習進捗と統計を詳しく分析',
        icon: '📊',
        wordsLearned: 0,
        completed: false,
        locked: false,
        difficulty: 'medium',
        component: 'LearningDashboard'
      })
    }

    const getDifficultyLabel = (difficulty) => {
      const labels = {
        easy: '初級',
        medium: '中級',
        hard: '上級',
        expert: '専門'
      }
      return labels[difficulty] || '不明'
    }

    const openStatsModal = () => {
      showStatsModal.value = true
    }

    // Lifecycle
    onMounted(() => {
      // Word Galaxy機能を統合
      addWordGalaxyFeatures()

      // Update achievements progress
      achievements.value.forEach(achievement => {
        if (achievement.id === 'first-100') {
          achievement.current = Math.min(totalWords.value, 100)
          achievement.progress = (achievement.current / achievement.target) * 100
          achievement.unlocked = achievement.current >= achievement.target
        }
      })
    })

    return {
      worlds,
      basicWordGames,
      themeWordGames,
      advancedWordGames,
      magicWordGames,
      achievements,
      totalWords,
      completedGames,
      vocabularyLevel,
      weeklyWords,
      masteryRate,
      wordsToNextLevel,
      showStatsModal,
      launchGame,
      getDifficultyLabel,
      openStatsModal
    }
  }
}
</script>

<style scoped>
/* Base styles - similar to GrammarGalaxy but with vocabulary theme */
.vocabulary-world-platform {
  min-h: 100vh;
  background: radial-gradient(ellipse at center, #2d1b5a 0%, #1a0f3e 50%, #000 100%);
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
    radial-gradient(2px 2px at 20px 30px, #ffd700, transparent),
    radial-gradient(1px 1px at 40px 70px, rgba(255,215,0,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #ffd700, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: stars-sparkle 180s linear infinite;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

@keyframes stars-sparkle {
  0%, 100% { opacity: 0.4; }
  25% { opacity: 0.7; }
  50% { opacity: 0.4; }
  75% { opacity: 0.6; }
}

.platform-header {
  position: relative;
  z-index: 10;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(45, 27, 90, 0.9) 0%, rgba(26, 15, 62, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
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
  animation: book-flip 4s ease-in-out infinite;
}

@keyframes book-flip {
  0%, 100% { transform: rotateY(0deg); }
  25% { transform: rotateY(15deg); }
  75% { transform: rotateY(-15deg); }
}

.title-text h1 {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ffd700 0%, #ffed4e 50%, #fbbf24 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.subtitle {
  color: #d1d5db;
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
  background: rgba(45, 27, 90, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffd700;
}

.stat-label {
  font-size: 0.8rem;
  color: #d1d5db;
}

.vocabulary-worlds {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.vocab-world {
  background: rgba(26, 15, 62, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.vocab-world:hover {
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.1);
}

.vocab-world.locked {
  opacity: 0.5;
  pointer-events: none;
}

.world-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.world-icon {
  font-size: 2rem;
}

.world-info h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  margin: 0 0 0.25rem 0;
}

.world-info p {
  color: #d1d5db;
  margin: 0 0 0.5rem 0;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(45, 27, 90, 0.8);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #d1d5db;
}

.world-games {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(45, 27, 90, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.game-card:hover:not(.locked) {
  transform: translateY(-2px);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.1);
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
  color: #ffd700;
  margin: 0 0 0.25rem 0;
}

.game-info p {
  color: #d1d5db;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.game-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
}

.words {
  color: #ffd700;
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

.game-status {
  flex-shrink: 0;
  font-size: 1.2rem;
}

.achievements-section {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.achievements-section h3 {
  font-size: 1.5rem;
  color: #ffd700;
  margin-bottom: 1rem;
  text-align: center;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(26, 15, 62, 0.6);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.1);
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-info h4 {
  color: #ffd700;
  margin: 0 0 0.25rem 0;
}

.achievement-info p {
  color: #d1d5db;
  font-size: 0.8rem;
  margin: 0 0 0.5rem 0;
}

.achievement-progress .progress-bar {
  width: 100%;
  height: 6px;
  margin-bottom: 0.25rem;
}

.achievement-progress .progress-text {
  font-size: 0.7rem;
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
  background: rgba(45, 27, 90, 0.9);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.floating-back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 215, 0, 0.6);
}

.btn-icon {
  font-size: 1.2rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-modal {
  background: rgba(26, 15, 62, 0.95);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  color: #ffd700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #d1d5db;
  font-size: 1.5rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(45, 27, 90, 0.6);
  border-radius: 0.5rem;
}

.stat-item .stat-label {
  color: #d1d5db;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.stat-item .stat-value {
  color: #ffd700;
  font-size: 1.5rem;
  font-weight: bold;
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

  .world-header {
    flex-direction: column;
    text-align: center;
  }

  .world-games {
    grid-template-columns: 1fr;
  }

  .floating-back-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>