<template>
  <div class="min-h-screen galaxy-background">
    <!-- Background Stars -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <!-- Logo & Back -->
          <div class="flex items-center gap-4">
            <button
              @click="$router.push('/user-type-selection')"
              class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
            >
              <span class="text-xl">↩️</span>
              <span class="text-sm text-slate-300">戻る</span>
            </button>
            <div class="flex items-center gap-3">
              <div class="text-3xl">🚀</div>
              <div>
                <h1 class="text-2xl font-bold galaxy-text-primary">サウンド・ガーディアン司令部</h1>
                <p class="text-sm text-galaxy-moon-silver">レベル {{ userStore.stats.level }} • 連続学習 {{ userStore.stats.streak }}日</p>
              </div>
            </div>
          </div>

          <!-- User Info & Status -->
          <div class="flex items-center gap-4">
            <!-- XP Display -->
            <div class="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <span class="text-yellow-400">⚡</span>
              <span class="text-yellow-300 font-bold">{{ progressStore.totalExp.toLocaleString() }} XP</span>
            </div>

            <!-- VR Tickets -->
            <div class="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <span class="text-purple-400">🎫</span>
              <span class="text-purple-300 font-bold">{{ userStore.vrTickets?.balance || 0 }}</span>
            </div>

            <!-- Debug Reset Button (開発中のみ) -->
            <button
              @click="resetAllProgress"
              class="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm hover:bg-red-500/30 transition-all"
              title="開発用：進捗リセット"
            >
              🔄 リセット
            </button>
          </div>
        </div>

        <!-- Unified Progress System -->
        <div class="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 mb-6 fade-in-up">
          <!-- Overall Level Display -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="text-4xl">🎓</div>
              <div>
                <h2 class="text-2xl font-bold galaxy-text-primary">総合レベル {{ progressStore.getOverallLevel }}</h2>
                <p class="text-sm text-galaxy-moon-silver">次のマイルストーン: {{ progressStore.getNextMilestone?.title || 'グランドマスター達成済み' }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold galaxy-text-primary">{{ progressStore.totalExp.toLocaleString() }} EXP</div>
              <div class="text-sm text-galaxy-moon-silver">
                あと {{ progressStore.getNextMilestone?.remaining || 0 }} レベル
              </div>
            </div>
          </div>

          <!-- Skill Breakdown -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              v-for="(skill, skillName) in progressStore.skills"
              :key="skillName"
              class="skill-card"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ getSkillIcon(skillName) }}</span>
                  <span class="text-sm font-bold text-white">{{ progressStore.getSkillDisplayName(skillName) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400" v-for="n in getSkillStars(skill.level)" :key="n">⭐</span>
                </div>
              </div>
              <div class="text-lg font-bold galaxy-text-primary mb-1">Lv.{{ skill.level }}</div>
              <div class="w-full bg-slate-600 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="getSkillColor(skillName)"
                  :style="{ width: `${progressStore.getSkillProgress(skillName)}%` }"
                ></div>
              </div>
              <div class="text-xs text-galaxy-moon-silver mt-1">
                {{ skill.exp }} / {{ skill.maxExp }} EXP
              </div>
            </div>
          </div>

          <!-- Next Recommended Step - UnifiedLearningHubから移行 -->
          <div v-if="progressStore.getRecommendedPath.priority === 'urgent'" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">⚠️</span>
              <div>
                <h3 class="font-bold text-red-300">弱点強化が必要です</h3>
                <p class="text-sm text-red-400">{{ progressStore.getRecommendedPath.reason }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                v-for="game in progressStore.getRecommendedPath.games.slice(0, 3)"
                :key="game"
                @click="startRecommendedGame(game)"
                class="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 rounded-lg text-sm text-red-200 transition-all"
              >
                {{ getGameDisplayName(game) }}
              </button>
            </div>
          </div>

          <!-- 次の推奨ステップ - UnifiedLearningHub機能を統合 -->
          <div v-if="getRecommendedNextStep()" class="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4 mb-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="text-2xl">🎯</span>
                  <h3 class="text-xl font-bold text-yellow-300">次の推奨ステップ</h3>
                  <span class="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                    STEP {{ getRecommendedNextStep().step }}
                  </span>
                </div>
                <h4 class="text-lg font-semibold mb-2 text-white">{{ getRecommendedNextStep().title }}</h4>
                <p class="text-galaxy-moon-silver mb-4">{{ getRecommendedNextStep().description }}</p>

                <!-- 推奨ゲーム -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    v-for="game in getRecommendedNextStep().games"
                    :key="game.id"
                    class="bg-slate-800/60 border border-yellow-400/30 rounded-lg p-3 cursor-pointer hover:bg-slate-700/60 transition-all"
                    @click="startRecommendedGame(game.id)"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="text-2xl">{{ getGameTypeIcon(game.type) }}</div>
                      <div class="flex-1">
                        <div class="font-semibold text-white">{{ game.name }}</div>
                        <div class="text-sm text-galaxy-moon-silver">{{ game.estimatedTime }}</div>
                      </div>
                      <div class="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded">
                        {{ getPriorityText(game.priority) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Daily Goals -->
          <div class="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <h3 class="font-bold text-blue-300 mb-3 flex items-center gap-2">
              <span class="text-xl">🎯</span>
              今日の目標
            </h3>
            <div class="space-y-3">
              <div
                v-for="goal in progressStore.learningPath.dailyGoals"
                :key="goal.id"
                class="flex items-center justify-between"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm text-white">{{ goal.description }}</span>
                    <span class="text-xs" :class="goal.completed ? 'text-green-400' : 'text-blue-300'">
                      {{ goal.current }} / {{ goal.target }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-600 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full transition-all duration-500"
                      :class="goal.completed ? 'bg-green-500' : 'bg-blue-500'"
                      :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
                <div class="ml-4">
                  <span v-if="goal.completed" class="text-green-400 text-lg">✓</span>
                  <span v-else class="text-yellow-400 text-sm">+{{ goal.reward }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 px-6 pb-12">
      <div class="max-w-6xl mx-auto">
        <!-- Today's Missions -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
            <span class="text-3xl">🎯</span>
            今日のミッション
            <span class="text-sm bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300">
              {{ userStore.incompleteMissions }} 個残り
            </span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="mission in userStore.dailyMissions"
              :key="mission.id"
              class="mission-card fade-in-up"
              :style="{ animationDelay: `${mission.id * 0.1}s` }"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ mission.icon }}</span>
                  <div>
                    <h3 class="font-bold text-white">{{ mission.title }}</h3>
                    <p class="text-sm text-galaxy-moon-silver">{{ mission.description }}</p>
                  </div>
                </div>
                <div
                  v-if="mission.progress >= mission.target"
                  class="flex items-center justify-center w-8 h-8 bg-green-500/20 border border-green-500/50 rounded-full"
                >
                  <span class="text-green-400 text-sm">✓</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-galaxy-moon-silver">進捗</span>
                  <span class="text-sm font-bold text-white">{{ mission.progress }} / {{ mission.target }}</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-500"
                    :class="getMissionProgressColor(mission.type)"
                    :style="{ width: `${(mission.progress / mission.target) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- Reward -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-galaxy-moon-silver">報酬:</span>
                <span class="text-sm font-bold text-yellow-400">{{ mission.reward }}</span>
              </div>

              <!-- Action Button -->
              <button
                @click="startMission(mission)"
                :disabled="mission.progress >= mission.target"
                class="w-full mt-4 py-2 px-4 rounded-lg font-bold text-sm transition-all"
                :class="mission.progress >= mission.target
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                  : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50'"
              >
                {{ mission.progress >= mission.target ? '完了済み' : 'ミッション開始' }}
              </button>
            </div>
          </div>
        </section>

        <!-- AI Learning Assistant -->
        <section class="mb-8">
          <div class="ai-dashboard-section">
            <AIPredictionDashboard
              :userId="getCurrentUserId()"
              :gameContext="{
                sessionType: 'dashboard',
                availableTime: 20,
                energyLevel: getEnergyLevel()
              }"
              @recommendationSelected="handleAIRecommendation"
            />
          </div>
        </section>

        <!-- Section Level Display -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
            <span class="text-3xl">🎯</span>
            各セクションレベル
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="section in progressStore.getAllSections"
              :key="section.id"
              class="section-card fade-in-up"
              :style="{ animationDelay: `${section.id * 0.1}s` }"
            >
              <!-- セクションヘッダー -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">{{ section.badge }}</span>
                  <div>
                    <h3 class="font-bold text-white">{{ section.name }}</h3>
                    <p class="text-sm text-galaxy-moon-silver">{{ progressStore.getSectionTitle(section.id) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-4xl font-bold galaxy-text-primary drop-shadow-lg">Lv.{{ section.level }}</div>
                  <div class="text-xs text-galaxy-moon-silver mt-1">{{ section.title }}</div>
                </div>
              </div>

              <!-- 経験値プログレスバー -->
              <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-galaxy-moon-silver">経験値</span>
                  <span class="text-sm font-bold text-white">{{ Math.round(section.progress) }}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    class="h-3 rounded-full transition-all duration-1000 ease-out"
                    :class="getSectionProgressColor(section.id)"
                    :style="{ width: `${section.progress}%` }"
                  ></div>
                </div>
              </div>

              <!-- 統計情報 -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-sm text-galaxy-moon-silver">解放済み</div>
                  <div class="text-lg font-bold text-blue-300">{{ section.unlockedGames }}ゲーム</div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-galaxy-moon-silver">マスター</div>
                  <div class="text-lg font-bold text-green-300">{{ section.masteredGames }}ゲーム</div>
                </div>
              </div>

              <!-- セクション開始ボタン -->
              <button
                @click="navigateToSection(section.id)"
                class="w-full py-2 px-4 rounded-lg font-bold text-sm transition-all bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50"
              >
                {{ section.name }}へ
              </button>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
            <span class="text-3xl">⚡</span>
            クイックアクション
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              @click="navigateToSoundAdventure"
              class="quick-action-card fade-in-up"
              style="animation-delay: 0.1s"
            >
              <span class="text-3xl mb-2">🎵</span>
              <span class="text-sm font-bold">音韻学習</span>
            </button>

            <button
              @click="navigateToGrammarGalaxy"
              class="quick-action-card fade-in-up"
              style="animation-delay: 0.2s"
            >
              <span class="text-3xl mb-2">🌌</span>
              <span class="text-sm font-bold">文法銀河</span>
            </button>

            <button
              @click="navigateToWordGalaxy"
              class="quick-action-card fade-in-up"
              style="animation-delay: 0.3s"
            >
              <span class="text-3xl mb-2">📚</span>
              <span class="text-sm font-bold">語彙学習</span>
            </button>

            <button
              @click="navigateToVRAcademy"
              :disabled="!userStore.canUseVRTicket"
              class="quick-action-card fade-in-up"
              :class="!userStore.canUseVRTicket ? 'opacity-50 cursor-not-allowed' : ''"
              style="animation-delay: 0.4s"
            >
              <span class="text-3xl mb-2">🥽</span>
              <span class="text-sm font-bold">VR学習</span>
              <span v-if="!userStore.canUseVRTicket" class="text-xs text-red-400">チケット不足</span>
            </button>

            <button
              @click="navigateToTypingArena"
              class="quick-action-card fade-in-up"
              style="animation-delay: 0.5s"
            >
              <span class="text-3xl mb-2">⌨️</span>
              <span class="text-sm font-bold">タイピング</span>
            </button>
          </div>
        </section>

        <!-- Recent Micro Rewards -->
        <section class="mb-8" v-if="progressStore.microAchievements.pendingRewards.length > 0">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
            <span class="text-3xl">🎉</span>
            最近の達成
          </h2>

          <div class="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div class="space-y-2">
              <div
                v-for="reward in progressStore.microAchievements.pendingRewards.slice(0, 5)"
                :key="reward.timestamp"
                class="flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <span v-if="reward.type === 'levelup'">🆙</span>
                  <span v-else-if="reward.type === 'streak'">🔥</span>
                  <span v-else-if="reward.type === 'perfect'">💯</span>
                  <span v-else-if="reward.type === 'milestone'">🏁</span>
                  <span v-else>⭐</span>

                  <span class="text-yellow-200">
                    <template v-if="reward.type === 'levelup'">
                      {{ progressStore.getSkillDisplayName(reward.skill) }} レベルアップ！
                    </template>
                    <template v-else-if="reward.type === 'streak'">
                      {{ reward.count }}連続正解！
                    </template>
                    <template v-else-if="reward.type === 'perfect'">
                      パーフェクトスコア！
                    </template>
                    <template v-else-if="reward.type === 'milestone'">
                      {{ reward.minutes }}分プレイ達成！
                    </template>
                  </span>
                </div>
                <span class="text-yellow-400 font-bold">+{{ reward.reward }} EXP</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats Summary -->
        <section>
          <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
            <span class="text-3xl">📊</span>
            学習統計
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="stats-card fade-in-up" style="animation-delay: 0.1s">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">⏱️</span>
                <span class="text-galaxy-moon-silver text-sm">学習時間</span>
              </div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ Math.round(progressStore.totalStudyTime / 60) }}分</div>
            </div>

            <div class="stats-card fade-in-up" style="animation-delay: 0.2s">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">🔥</span>
                <span class="text-galaxy-moon-silver text-sm">セッション</span>
              </div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ progressStore.microAchievements.sessionStreak }}</div>
            </div>

            <div class="stats-card fade-in-up" style="animation-delay: 0.3s">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">⚡</span>
                <span class="text-galaxy-moon-silver text-sm">総EXP</span>
              </div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ progressStore.totalExp.toLocaleString() }}</div>
            </div>

            <div class="stats-card fade-in-up" style="animation-delay: 0.4s">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">🏆</span>
                <span class="text-galaxy-moon-silver text-sm">総合レベル</span>
              </div>
              <div class="text-2xl font-bold galaxy-text-primary">{{ progressStore.getOverallLevel }}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'
import { useProgressStore } from '@/stores/progress'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import AIPredictionDashboard from '@/components/ai/AIPredictionDashboard.vue'
import logger from '@/utils/logger'

export default {
  name: 'DashboardStudent',
  components: {
    AIPredictionDashboard
  },
  setup() {
    const userStore = useUserStore()
    const progressStore = useProgressStore()
    const authStore = useAuthStore()
    const router = useRouter()

    onMounted(async () => {
      // Firebaseから実データを読み込み
      if (authStore.currentUser?.uid) {
        await progressStore.loadFromFirebase()
        logger.log('📊 Firebase data loaded for student dashboard')
      } else {
        // ローカルデータを使用
        await userStore.initializeStudentData()
      }

      // デイリーゴールを設定
      progressStore.setDailyGoals()
    })

    const getMissionProgressColor = (type) => {
      switch (type) {
        case 'phonics':
          return 'bg-gradient-to-r from-blue-500 to-purple-500'
        case 'grammar':
          return 'bg-gradient-to-r from-purple-500 to-pink-500'
        case 'vr':
          return 'bg-gradient-to-r from-cyan-500 to-blue-500'
        default:
          return 'bg-gradient-to-r from-gray-500 to-gray-600'
      }
    }

    const startMission = (mission) => {
      if (mission.progress >= mission.target) return

      logger.log(`🎯 Starting mission: ${mission.title}`)

      // ミッションタイプに応じて適切なページに遷移
      switch (mission.type) {
        case 'phonics':
          navigateToSoundAdventure()
          break
        case 'grammar':
          navigateToGrammarGalaxy()
          break
        case 'vr':
          navigateToVRAcademy()
          break
        default:
          logger.warn('Unknown mission type:', mission.type)
      }
    }

    const navigateToSoundAdventure = () => {
      router.push({ name: 'PhonicsAdventure' })
    }

    const navigateToGrammarGalaxy = () => {
      router.push({ name: 'grammar-galaxy-hub' })
    }

    const navigateToVRAcademy = () => {
      if (userStore.canUseVRTicket) {
        router.push({ name: 'VRAcademy' })
      } else {
        alert('VRチケットが不足しています。ミッションをクリアして新しいチケットを獲得してください。')
      }
    }

    const navigateToTypingArena = () => {
      router.push({ name: 'TypingArena' })
    }

    const navigateToWordGalaxy = () => {
      router.push({ name: 'VocabularyWorld' })
    }

    const getSkillIcon = (skillName) => {
      const icons = {
        phonics: '🎧',
        vocabulary: '📚',
        grammar: '🌌',
        pronunciation: '🎤',
        listening: '👂',
        rhythm: '🎵',
        blending: '🔗'
      }
      return icons[skillName] || '🎧'
    }

    const getSkillStars = (level) => {
      if (level >= 25) return 5
      if (level >= 20) return 4
      if (level >= 15) return 3
      if (level >= 10) return 2
      if (level >= 5) return 1
      return 0
    }

    const getSkillColor = (skillName) => {
      const colors = {
        phonics: 'bg-gradient-to-r from-blue-400 to-blue-600',
        vocabulary: 'bg-gradient-to-r from-green-400 to-green-600',
        grammar: 'bg-gradient-to-r from-purple-400 to-purple-600',
        pronunciation: 'bg-gradient-to-r from-pink-400 to-pink-600',
        listening: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        rhythm: 'bg-gradient-to-r from-red-400 to-red-600',
        blending: 'bg-gradient-to-r from-cyan-400 to-cyan-600'
      }
      return colors[skillName] || 'bg-gradient-to-r from-gray-400 to-gray-600'
    }

    const getGameDisplayName = (gameId) => {
      const gameNames = {
        'sound-master': 'サウンドマスター',
        'phonics-training': 'フォニックストレーニング',
        'sound-farm': 'サウンドファーム',
        'word-rush': 'ワードラッシュ',
        'sight-word-master': 'サイトワードマスター',
        'grammar-color-code': '文法カラーコード',
        'be-verb-rush': 'Be動詞ラッシュ',
        'verb-pattern-galaxy': '動詞パターン銀河'
      }
      return gameNames[gameId] || gameId
    }

    const startRecommendedGame = (gameId) => {
      // 推奨ゲームに移動
      const gameRoutes = {
        'sound-master': '/platforms/phonics-adventure',
        'phonics-training': '/platforms/phonics-adventure',
        'word-rush': '/platforms/vocabulary-world',
        'grammar-color-code': '/grammar-galaxy',
        'be-verb-rush': '/grammar-galaxy',
        'verb-pattern-galaxy': '/grammar-galaxy/verb-pattern-galaxy'
      }

      const route = gameRoutes[gameId]
      if (route) {
        router.push(route)
      } else {
        logger.warn('Unknown game route:', gameId)
      }
    }

    const getSectionProgressColor = (sectionId) => {
      const colors = {
        phonicsAdventure: 'bg-gradient-to-r from-blue-400 to-blue-600',
        grammarGalaxy: 'bg-gradient-to-r from-purple-400 to-purple-600',
        vocabularyWorld: 'bg-gradient-to-r from-green-400 to-green-600',
        typingArena: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        comprehensiveSkill: 'bg-gradient-to-r from-red-400 to-red-600'
      }
      return colors[sectionId] || 'bg-gradient-to-r from-gray-400 to-gray-600'
    }

    const navigateToSection = (sectionId) => {
      const sectionRoutes = {
        phonicsAdventure: '/platforms/phonics-adventure',
        grammarGalaxy: '/grammar-galaxy',
        vocabularyWorld: '/platforms/vocabulary-world',
        typingArena: '/platforms/typing-arena',
        comprehensiveSkill: '/comprehensive-skill'
      }

      const route = sectionRoutes[sectionId]
      if (route) {
        router.push(route)
      } else {
        logger.warn('Unknown section route:', sectionId)
      }
    }

    // UnifiedLearningHub機能を統合
    const getRecommendedNextStep = () => {
      const totalExp = progressStore.totalExp
      const overallLevel = progressStore.getOverallLevel

      if (totalExp < 500) {
        return {
          step: 1,
          title: "フォニックス基礎マスター",
          description: "まずは英語の音の基礎をしっかりと身につけましょう",
          games: [
            { id: 'sound-master', name: 'サウンドマスター', type: 'phonics', estimatedTime: '10-15分', priority: 'high' },
            { id: 'phonics-training', name: 'フォニックストレーニング', type: 'phonics', estimatedTime: '15-20分', priority: 'medium' }
          ]
        }
      } else if (totalExp < 1500) {
        return {
          step: 2,
          title: "基本文法パターン習得",
          description: "基本的な文法パターンを学んで文章構造を理解しましょう",
          games: [
            { id: 'be-verb-rush', name: 'Be動詞ラッシュ', type: 'grammar', estimatedTime: '10-15分', priority: 'high' },
            { id: 'grammar-color-code', name: '文法カラーコード', type: 'grammar', estimatedTime: '15-20分', priority: 'medium' }
          ]
        }
      } else if (totalExp < 3000) {
        return {
          step: 3,
          title: "総合スキル強化",
          description: "タイピング力と総合的な英語力を高めましょう",
          games: [
            { id: 'word-rush', name: 'ワードラッシュ', type: 'typing', estimatedTime: '10-15分', priority: 'high' },
            { id: 'sight-word-master', name: 'サイトワードマスター', type: 'vocabulary', estimatedTime: '15-20分', priority: 'medium' }
          ]
        }
      }
      return null
    }

    const getGameTypeIcon = (type) => {
      const icons = {
        phonics: '🎧',
        grammar: '🌌',
        vocabulary: '📚',
        typing: '⌨️',
        listening: '👂'
      }
      return icons[type] || '🎮'
    }

    const getPriorityText = (priority) => {
      const texts = {
        high: '推奨',
        medium: '普通',
        low: '低'
      }
      return texts[priority] || ''
    }

    const resetAllProgress = () => {
      if (confirm('本当に全ての進捗をリセットしますか？\n（レベル1からやり直しになります）')) {
        // progressStoreとuserStore両方をリセット
        progressStore.resetProgress()
        userStore.resetAllData()
        logger.log('🔄 全ての進捗データをリセットしました')

        // ページをリロードして完全に初期状態にする
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    }

    // AI関連メソッド
    const getCurrentUserId = () => {
      return authStore.currentUser?.uid || 'guest'
    }

    const getEnergyLevel = () => {
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) return 'high'      // 朝
      if (hour >= 12 && hour < 17) return 'medium'   // 昼
      if (hour >= 17 && hour < 22) return 'high'     // 夕方
      return 'low'                                    // 夜
    }

    const handleAIRecommendation = (recommendation) => {
      logger.log('🤖 AI Recommendation selected:', recommendation)

      // AI推薦に基づいてゲームに遷移
      if (recommendation.gameId) {
        navigateToGame(recommendation.gameId)
      }
    }

    return {
      userStore,
      progressStore,
      getMissionProgressColor,
      startMission,
      navigateToSoundAdventure,
      navigateToGrammarGalaxy,
      navigateToVRAcademy,
      navigateToTypingArena,
      navigateToWordGalaxy,
      getSkillIcon,
      getSkillStars,
      getSkillColor,
      getGameDisplayName,
      startRecommendedGame,
      getSectionProgressColor,
      navigateToSection,
      getRecommendedNextStep,
      getGameTypeIcon,
      getPriorityText,
      resetAllProgress,
      getCurrentUserId,
      getEnergyLevel,
      handleAIRecommendation
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.galaxy-text-primary {
  background: linear-gradient(45deg,
    #60A5FA 0%,
    #A78BFA 25%,
    #F472B6 50%,
    #FBBF24 75%,
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.mission-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.mission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.quick-action-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  color: white;
}

.quick-action-card:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.stats-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.skill-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.8) 0%,
    rgba(30, 41, 59, 0.7) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.section-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6, #FBBF24);
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .mission-card,
  .quick-action-card,
  .stats-card {
    padding: 1rem;
  }

  .grid.grid-cols-2.md\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>