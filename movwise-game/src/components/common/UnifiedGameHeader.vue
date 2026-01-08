<template>
  <div class="unified-game-header">
    <!-- ゲームヘッダー -->
    <div class="header-top">
      <div class="game-info">
        <h2 class="game-title">{{ gameConfig.title }}</h2>
        <div class="learning-badge">
          <span class="learning-area">{{ getLearningAreaName(gameConfig.learningArea) }}</span>
          <span class="learning-level">{{ getLearningLevelName(gameConfig.learningLevel) }}</span>
        </div>
      </div>

      <div class="game-controls">
        <button
          v-if="gameState.isPlaying"
          @click="pauseGame"
          class="control-btn pause-btn"
          :class="{ active: gameState.isPaused }"
        >
          <Icon :name="gameState.isPaused ? 'play' : 'pause'" />
        </button>

        <button @click="showSettings = !showSettings" class="control-btn settings-btn">
          <Icon name="settings" />
        </button>

        <button @click="exitGame" class="control-btn exit-btn">
          <Icon name="x" />
        </button>
      </div>
    </div>

    <!-- プログレスバー -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="level-indicator">レベル {{ gameState.currentLevel }}</span>
        <span class="time-elapsed">{{ formatTime(gameState.timeElapsed) }}</span>
      </div>

      <div class="progress-bars">
        <!-- ゲーム進捗 -->
        <div class="progress-bar game-progress">
          <div class="progress-bg">
            <div
              class="progress-fill"
              :style="{ width: `${gameProgress}%` }"
            ></div>
          </div>
          <span class="progress-label">進捗: {{ gameProgress }}%</span>
        </div>

        <!-- XP進捗 -->
        <div class="progress-bar xp-progress">
          <div class="progress-bg">
            <div
              class="progress-fill xp-fill"
              :style="{ width: `${xpProgress}%` }"
            ></div>
          </div>
          <span class="progress-label">XP: {{ learningProgress.xpGained }}</span>
        </div>
      </div>
    </div>

    <!-- 統計表示 -->
    <div class="stats-section">
      <div class="stat-item">
        <Icon name="target" class="stat-icon" />
        <span class="stat-value">{{ gameStats.accuracy }}%</span>
        <span class="stat-label">正解率</span>
      </div>

      <div class="stat-item">
        <Icon name="zap" class="stat-icon" />
        <span class="stat-value">{{ gameStats.streak }}</span>
        <span class="stat-label">連続</span>
      </div>

      <div class="stat-item">
        <Icon name="star" class="stat-icon" />
        <span class="stat-value">{{ gameStats.maxStreak }}</span>
        <span class="stat-label">最高</span>
      </div>

      <div class="stat-item" v-if="gameState.lives > 0">
        <Icon name="heart" class="stat-icon" />
        <span class="stat-value">{{ gameState.lives }}</span>
        <span class="stat-label">ライフ</span>
      </div>
    </div>

    <!-- 設定パネル -->
    <transition name="slide-down">
      <div v-if="showSettings" class="settings-panel">
        <div class="setting-group">
          <label class="setting-label">難易度</label>
          <select v-model="settings.difficulty" class="setting-select">
            <option v-for="level in DIFFICULTY_LEVELS" :key="level.id" :value="level">
              {{ level.name }}
            </option>
          </select>
        </div>

        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" v-model="settings.soundEnabled">
            <span class="checkmark"></span>
            音効果
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" v-model="settings.showHints">
            <span class="checkmark"></span>
            ヒント表示
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-checkbox">
            <input type="checkbox" v-model="settings.autoAdvance">
            <span class="checkmark"></span>
            自動進行
          </label>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUnifiedGameEngine, LEARNING_AREAS, LEARNING_LEVELS, DIFFICULTY_LEVELS } from '@/composables/useUnifiedGameEngine.js'
import Icon from '@/components/shared/Icon.vue'

export default {
  name: 'UnifiedGameHeader',
  components: {
    Icon
  },
  props: {
    gameConfig: {
      type: Object,
      required: true
    },
    gameProgress: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const router = useRouter()
    const showSettings = ref(false)

    const {
      gameState,
      learningProgress,
      settings,
      gameStats,
      pauseGame,
      endGame,
      DIFFICULTY_LEVELS
    } = useUnifiedGameEngine(props.gameConfig)

    // XP進捗計算（レベルアップまで）
    const xpProgress = computed(() => {
      const currentXP = learningProgress.xpGained
      const nextLevelXP = gameState.currentLevel * 1000 // 次のレベルに必要なXP
      return Math.min((currentXP / nextLevelXP) * 100, 100)
    })

    // ゲーム終了
    const exitGame = () => {
      if (confirm('ゲームを終了しますか？進捗は保存されます。')) {
        endGame(false)
        router.push('/dashboard')
      }
    }

    // 時間フォーマット
    const formatTime = (milliseconds) => {
      const totalSeconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // 学習分野名取得
    const getLearningAreaName = (area) => {
      const areaNames = {
        [LEARNING_AREAS.PHONICS]: 'フォニックス',
        [LEARNING_AREAS.GRAMMAR]: '文法',
        [LEARNING_AREAS.VOCABULARY]: '語彙',
        [LEARNING_AREAS.PRONUNCIATION]: '発音',
        [LEARNING_AREAS.TYPING]: 'タイピング',
        [LEARNING_AREAS.LISTENING]: 'リスニング',
        [LEARNING_AREAS.INTEGRATED]: '統合技能'
      }
      return areaNames[area] || area
    }

    // 学習レベル名取得
    const getLearningLevelName = (level) => {
      const levelNames = {
        [LEARNING_LEVELS.BEGINNER]: '初級',
        [LEARNING_LEVELS.INTERMEDIATE]: '中級',
        [LEARNING_LEVELS.ADVANCED]: '上級'
      }
      return levelNames[level] || level
    }

    return {
      gameState,
      learningProgress,
      settings,
      gameStats,
      showSettings,
      xpProgress,
      pauseGame,
      exitGame,
      formatTime,
      getLearningAreaName,
      getLearningLevelName,
      DIFFICULTY_LEVELS
    }
  }
}
</script>

<style scoped>
.unified-game-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.game-info {
  flex: 1;
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.learning-badge {
  display: flex;
  gap: 0.5rem;
}

.learning-area,
.learning-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.game-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.4);
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bg {
  flex: 1;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.xp-fill {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
}

.progress-label {
  font-size: 0.75rem;
  min-width: 4rem;
  text-align: right;
  opacity: 0.9;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
}

.settings-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.setting-select {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
}

.setting-checkbox input {
  margin-right: 0.5rem;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 1rem;
  }

  .game-controls {
    align-self: flex-end;
  }

  .stats-section {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .progress-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }

  .progress-label {
    text-align: left;
    min-width: auto;
  }
}
</style>