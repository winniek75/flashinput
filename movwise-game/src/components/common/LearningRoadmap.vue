<template>
  <div class="learning-roadmap">
    <div class="roadmap-header">
      <h2 class="roadmap-title">英語学習ロードマップ</h2>
      <p class="roadmap-subtitle">あなたの英語力向上への道のり</p>
    </div>

    <!-- 進捗概要 -->
    <div class="progress-overview">
      <div class="overall-progress">
        <div class="progress-circle">
          <svg viewBox="0 0 100 100" class="progress-svg">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#progressGradient)"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - (overallProgress / 100) * circumference"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="progressGradient">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text">
            <span class="progress-percentage">{{ overallProgress }}%</span>
            <span class="progress-label">完了</span>
          </div>
        </div>
      </div>

      <div class="progress-stats">
        <div class="stat-card">
          <Icon name="star" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ totalXP }}</span>
            <span class="stat-label">獲得XP</span>
          </div>
        </div>

        <div class="stat-card">
          <Icon name="calendar" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ studyDays }}</span>
            <span class="stat-label">学習日数</span>
          </div>
        </div>

        <div class="stat-card">
          <Icon name="trophy" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ completedGames }}</span>
            <span class="stat-label">クリア</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学習レベル進行 -->
    <div class="learning-levels">
      <div
        v-for="(level, index) in learningLevels"
        :key="level.id"
        class="level-section"
        :class="{
          'completed': level.progress >= 100,
          'current': level.isCurrent,
          'locked': level.isLocked
        }"
      >
        <!-- レベルヘッダー -->
        <div class="level-header" @click="toggleLevel(level.id)">
          <div class="level-icon">
            <Icon :name="level.icon" />
          </div>
          <div class="level-info">
            <h3 class="level-title">{{ level.name }}</h3>
            <p class="level-description">{{ level.description }}</p>
          </div>
          <div class="level-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${level.progress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ level.progress }}%</span>
          </div>
          <div class="level-toggle">
            <Icon
              :name="expandedLevels.includes(level.id) ? 'chevron-up' : 'chevron-down'"
            />
          </div>
        </div>

        <!-- 学習分野 -->
        <transition name="expand">
          <div v-if="expandedLevels.includes(level.id)" class="learning-areas">
            <div
              v-for="area in level.areas"
              :key="area.id"
              class="area-item"
              :class="{
                'completed': area.isCompleted,
                'current': area.isCurrent,
                'available': area.isAvailable,
                'locked': area.isLocked
              }"
            >
              <div class="area-header">
                <div class="area-icon">
                  <Icon :name="area.icon" />
                </div>
                <div class="area-info">
                  <h4 class="area-name">{{ area.name }}</h4>
                  <p class="area-skills">{{ area.skills.join(', ') }}</p>
                </div>
                <div class="area-status">
                  <Icon
                    v-if="area.isCompleted"
                    name="check-circle"
                    class="status-icon completed"
                  />
                  <Icon
                    v-else-if="area.isCurrent"
                    name="play-circle"
                    class="status-icon current"
                  />
                  <Icon
                    v-else-if="area.isAvailable"
                    name="circle"
                    class="status-icon available"
                  />
                  <Icon
                    v-else
                    name="lock"
                    class="status-icon locked"
                  />
                </div>
              </div>

              <!-- ゲーム一覧 -->
              <div class="area-games">
                <div
                  v-for="game in area.games"
                  :key="game.id"
                  class="game-card"
                  :class="{
                    'completed': game.isCompleted,
                    'available': game.isAvailable,
                    'recommended': game.isRecommended
                  }"
                  @click="startGame(game)"
                >
                  <div class="game-icon">
                    <Icon :name="game.icon" />
                  </div>
                  <div class="game-info">
                    <h5 class="game-name">{{ game.name }}</h5>
                    <div class="game-meta">
                      <span class="game-difficulty">{{ game.difficulty }}</span>
                      <span class="game-duration">{{ game.estimatedTime }}分</span>
                    </div>
                  </div>
                  <div class="game-status">
                    <div v-if="game.bestScore" class="best-score">
                      <Icon name="star" />
                      <span>{{ game.bestScore }}</span>
                    </div>
                    <div class="game-progress">
                      <div
                        class="progress-dot"
                        v-for="star in 3"
                        :key="star"
                        :class="{ 'filled': star <= (game.stars || 0) }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 推奨学習パス -->
    <div class="recommended-path">
      <h3 class="section-title">
        <Icon name="compass" />
        推奨学習パス
      </h3>
      <div class="path-games">
        <div
          v-for="game in recommendedGames"
          :key="game.id"
          class="path-game"
          @click="startGame(game)"
        >
          <div class="path-game-icon">
            <Icon :name="game.icon" />
          </div>
          <div class="path-game-info">
            <h4 class="path-game-name">{{ game.name }}</h4>
            <p class="path-game-reason">{{ game.reason }}</p>
          </div>
          <div class="path-game-action">
            <button class="play-btn">
              <Icon name="play" />
              プレイ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressTracking } from '@/composables/useProgressTracking.js'
import { LEARNING_LEVELS, LEARNING_AREAS } from '@/composables/useUnifiedGameEngine.js'
import Icon from '@/components/shared/Icon.vue'

export default {
  name: 'LearningRoadmap',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()
    const { getOverallProgress, getAreaProgress, getRecommendedGames } = useProgressTracking()

    const expandedLevels = ref(['beginner']) // デフォルトで初級を展開
    const circumference = 2 * Math.PI * 45 // 円の円周

    // 学習レベル定義
    const learningLevels = ref([
      {
        id: LEARNING_LEVELS.BEGINNER,
        name: '初級レベル',
        description: 'フォニックスと基本語彙を学習',
        icon: 'book-open',
        progress: 0,
        isCurrent: true,
        isLocked: false,
        areas: [
          {
            id: LEARNING_AREAS.PHONICS,
            name: 'フォニックス',
            skills: ['音素認識', '文字音対応', 'ブレンディング'],
            icon: 'volume-2',
            isCompleted: false,
            isCurrent: true,
            isAvailable: true,
            isLocked: false,
            games: [
              {
                id: 'sound-farm',
                name: 'サウンドファーム',
                icon: 'sun',
                difficulty: '簡単',
                estimatedTime: 10,
                isCompleted: false,
                isAvailable: true,
                isRecommended: true,
                bestScore: null,
                stars: 0,
                route: '/games/sound-farm'
              },
              {
                id: 'floating-letter-hunt',
                name: '文字ハンティング',
                icon: 'search',
                difficulty: '簡単',
                estimatedTime: 8,
                isCompleted: false,
                isAvailable: true,
                isRecommended: false,
                bestScore: null,
                stars: 0,
                route: '/games/floating-letter-hunt'
              }
            ]
          },
          {
            id: LEARNING_AREAS.VOCABULARY,
            name: '基本語彙',
            skills: ['日常単語', '基本動詞', '形容詞'],
            icon: 'grid-3x3',
            isCompleted: false,
            isCurrent: false,
            isAvailable: true,
            isLocked: false,
            games: [
              {
                id: 'word-rush',
                name: 'ワードラッシュ',
                icon: 'zap',
                difficulty: '普通',
                estimatedTime: 15,
                isCompleted: false,
                isAvailable: true,
                isRecommended: false,
                bestScore: null,
                stars: 0,
                route: '/games/word-rush'
              }
            ]
          }
        ]
      },
      {
        id: LEARNING_LEVELS.INTERMEDIATE,
        name: '中級レベル',
        description: '文法構造と発音を強化',
        icon: 'layers',
        progress: 0,
        isCurrent: false,
        isLocked: true,
        areas: [
          {
            id: LEARNING_AREAS.GRAMMAR,
            name: '文法',
            skills: ['be動詞', '一般動詞', '文型'],
            icon: 'tool',
            isCompleted: false,
            isCurrent: false,
            isAvailable: false,
            isLocked: true,
            games: [
              {
                id: 'be-verb-rush',
                name: 'Be動詞ラッシュ',
                icon: 'target',
                difficulty: '普通',
                estimatedTime: 12,
                isCompleted: false,
                isAvailable: false,
                isRecommended: false,
                bestScore: null,
                stars: 0,
                route: '/grammar-galaxy/be-verb-rush'
              }
            ]
          },
          {
            id: LEARNING_AREAS.PRONUNCIATION,
            name: '発音練習',
            skills: ['正確な発音', '音声認識', 'アクセント'],
            icon: 'mic',
            isCompleted: false,
            isCurrent: false,
            isAvailable: false,
            isLocked: true,
            games: []
          }
        ]
      },
      {
        id: LEARNING_LEVELS.ADVANCED,
        name: '上級レベル',
        description: '総合技能と流暢性を向上',
        icon: 'crown',
        progress: 0,
        isCurrent: false,
        isLocked: true,
        areas: [
          {
            id: LEARNING_AREAS.INTEGRATED,
            name: '統合技能',
            skills: ['リスニング', 'スピーキング', '読解'],
            icon: 'globe',
            isCompleted: false,
            isCurrent: false,
            isAvailable: false,
            isLocked: true,
            games: []
          }
        ]
      }
    ])

    // 全体進捗
    const overallProgress = computed(() => {
      const totalAreas = learningLevels.value.reduce((sum, level) => sum + level.areas.length, 0)
      const completedAreas = learningLevels.value.reduce((sum, level) =>
        sum + level.areas.filter(area => area.isCompleted).length, 0
      )
      return totalAreas > 0 ? Math.round((completedAreas / totalAreas) * 100) : 0
    })

    // 統計データ
    const totalXP = computed(() => 1250) // 実際のデータに置き換え
    const studyDays = computed(() => 12) // 実際のデータに置き換え
    const completedGames = computed(() => 8) // 実際のデータに置き換え

    // 推奨ゲーム
    const recommendedGames = computed(() => [
      {
        id: 'sound-farm',
        name: 'サウンドファーム',
        icon: 'sun',
        reason: 'フォニックスの基礎を固めましょう',
        route: '/games/sound-farm'
      },
      {
        id: 'floating-letter-hunt',
        name: '文字ハンティング',
        icon: 'search',
        reason: '文字認識力を向上させます',
        route: '/games/floating-letter-hunt'
      }
    ])

    // レベル展開/折りたたみ
    const toggleLevel = (levelId) => {
      const index = expandedLevels.value.indexOf(levelId)
      if (index > -1) {
        expandedLevels.value.splice(index, 1)
      } else {
        expandedLevels.value.push(levelId)
      }
    }

    // ゲーム開始
    const startGame = (game) => {
      if (game.isAvailable || game.isCompleted) {
        router.push(game.route)
      }
    }

    // 進捗データの読み込み
    const loadProgress = async () => {
      try {
        // 実際の進捗データを取得して更新
        const progress = await getOverallProgress()
        // learningLevels.value の更新処理
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    }

    onMounted(() => {
      loadProgress()
    })

    return {
      learningLevels,
      expandedLevels,
      circumference,
      overallProgress,
      totalXP,
      studyDays,
      completedGames,
      recommendedGames,
      toggleLevel,
      startGame
    }
  }
}
</script>

<style scoped>
.learning-roadmap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.roadmap-header {
  text-align: center;
  margin-bottom: 3rem;
}

.roadmap-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.roadmap-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
}

.progress-overview {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #faf5ff 100%);
  border-radius: 1rem;
}

.overall-progress {
  display: flex;
  justify-content: center;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.progress-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  align-content: center;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.stat-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.stat-label {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}

.learning-levels {
  space-y: 1rem;
}

.level-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  overflow: hidden;
  margin-bottom: 1rem;
}

.level-section.completed {
  background: linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%);
}

.level-section.current {
  border: 2px solid #3b82f6;
}

.level-section.locked {
  opacity: 0.6;
}

.level-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.level-header:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.level-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.level-info {
  flex: 1;
}

.level-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.level-description {
  color: #4b5563;
  margin: 0;
  font-weight: 500;
}

.level-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 120px;
}

.progress-bar {
  width: 80px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.learning-areas {
  padding: 0 1.5rem 1.5rem;
}

.area-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.area-item.completed {
  background: #ecfdf5;
}

.area-item.current {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.area-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.area-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.area-info {
  flex: 1;
}

.area-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.area-skills {
  color: #4b5563;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.status-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.status-icon.completed {
  color: #10b981;
}

.status-icon.current {
  color: #3b82f6;
}

.status-icon.available {
  color: #6b7280;
}

.status-icon.locked {
  color: #9ca3af;
}

.area-games {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(229, 231, 235, 0.6);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.game-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.game-card.completed {
  background: #f0fdf4;
  border-color: #10b981;
}

.game-card.recommended {
  border-color: #f59e0b;
  background: #fffbeb;
}

.game-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.game-info {
  flex: 1;
}

.game-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.game-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #4b5563;
  font-weight: 500;
}

.game-status {
  text-align: right;
}

.best-score {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.game-progress {
  display: flex;
  gap: 0.25rem;
}

.progress-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #e5e7eb;
}

.progress-dot.filled {
  background: #fbbf24;
}

.recommended-path {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border-radius: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #92400e;
}

.path-games {
  display: grid;
  gap: 1rem;
}

.path-game {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.path-game:hover {
  transform: translateY(-1px);
}

.path-game-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.path-game-info {
  flex: 1;
}

.path-game-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.path-game-reason {
  color: #4b5563;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 500;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

@media (max-width: 768px) {
  .learning-roadmap {
    padding: 1rem;
  }

  .progress-overview {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .progress-stats {
    grid-template-columns: 1fr;
  }

  .level-header {
    flex-direction: column;
    align-items: stretch;
  }

  .level-progress {
    justify-content: center;
  }

  .area-games {
    grid-template-columns: 1fr;
  }

  .path-game {
    flex-direction: column;
    text-align: center;
  }
}
</style>