<template>
  <div class="min-h-screen galaxy-background">
    <!-- Background Stars -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-6">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="$router.push('/')"
            class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
          >
            <span class="text-xl">↩️</span>
            <span class="text-sm text-slate-300">ホーム</span>
          </button>

          <div class="text-center">
            <h1 class="text-3xl font-bold galaxy-text-primary">🎮 ゲームライブラリ</h1>
            <p class="text-sm text-galaxy-moon-silver">優先度別ゲーム一覧</p>
          </div>

          <button
            @click="toggleHiddenGames"
            class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
          >
            <span class="text-xl">⚙️</span>
            <span class="text-sm text-slate-300">{{ showHidden ? '隠す' : '全表示' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Daily Missions Section -->
    <section class="relative z-10 px-6 mb-8">
      <div class="max-w-7xl mx-auto">
        <div class="galaxy-card p-6 fade-in-up">
          <h2 class="text-2xl font-bold galaxy-text-primary mb-4 flex items-center gap-3">
            <span class="text-3xl">🎯</span>
            今日のデイリーミッション
            <span v-if="missionStore.allMissionsCompleted" class="text-sm bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-green-300">
              完了！
            </span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              v-for="(mission, index) in missionStore.dailyMissions"
              :key="mission.id"
              class="mission-card"
              :class="{ 'completed': mission.completed }"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ mission.gameIcon }}</span>
                  <div>
                    <div class="font-bold text-white">ミッション {{ index + 1 }}</div>
                    <div class="text-sm text-galaxy-moon-silver">{{ mission.gameName }}</div>
                  </div>
                </div>
                <div v-if="mission.completed" class="text-green-400">✓</div>
              </div>

              <div class="text-sm text-galaxy-moon-silver mb-3">{{ mission.description }}</div>

              <div class="mb-3">
                <div class="flex justify-between text-xs mb-1">
                  <span>進捗</span>
                  <span>{{ mission.currentScore }} / {{ mission.targetScore }}</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    :style="{ width: `${Math.min(100, (mission.currentScore / mission.targetScore) * 100)}%` }"
                  ></div>
                </div>
              </div>

              <div class="text-xs text-yellow-400 font-bold">
                報酬: {{ mission.reward.description }}
              </div>
            </div>
          </div>

          <div v-if="missionStore.allMissionsCompleted" class="text-center py-4 bg-green-500/20 rounded-lg border border-green-500/30">
            <div class="text-2xl mb-2">🏆</div>
            <div class="text-green-400 font-bold">全ミッション完了！ボーナス報酬獲得！</div>
            <div class="text-sm text-green-300">+200 XP, +500 サウンドジェム</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Games Section -->
    <section class="relative z-10 px-6 mb-8">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
          <span class="text-3xl">⭐</span>
          今週のおすすめ（コアゲーム）
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="game in coreGames"
            :key="game.id"
            @click="playGame(game)"
            class="core-game-card fade-in-up cursor-pointer"
          >
            <div class="game-badge">CORE</div>
            <div class="text-center mb-4">
              <div class="text-5xl mb-3">{{ game.icon }}</div>
              <h3 class="text-xl font-bold text-white mb-2">{{ game.jaName }}</h3>
              <p class="text-sm text-galaxy-moon-silver mb-3">{{ game.description }}</p>
            </div>

            <div class="flex justify-between items-center mb-4">
              <div class="text-sm">
                <span class="text-galaxy-moon-silver">難易度:</span>
                <span class="text-white ml-1">{{ getDifficultyText(game.difficulty) }}</span>
              </div>
              <div class="text-sm">
                <span class="text-galaxy-moon-silver">時間:</span>
                <span class="text-white ml-1">{{ game.estimatedTime }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="text-sm text-yellow-400 font-bold">
                +{{ game.xpReward }} XP
              </div>
              <div v-if="game.vrEnabled" class="text-sm text-purple-400">
                🥽 VR対応
              </div>
            </div>

            <button class="w-full galaxy-button galaxy-button-primary text-white py-3 rounded-lg font-bold">
              プレイする
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Optional Games Section -->
    <section class="relative z-10 px-6 mb-8">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
          <span class="text-3xl">🎮</span>
          その他のゲーム（オプション）
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="game in optionalGames"
            :key="game.id"
            @click="playGame(game)"
            class="optional-game-card fade-in-up cursor-pointer"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">{{ game.icon }}</div>
              <h4 class="text-sm font-bold text-white mb-1">{{ game.jaName }}</h4>
              <div class="text-xs text-galaxy-moon-silver mb-2">{{ game.estimatedTime }}</div>
              <div class="text-xs text-yellow-400 font-bold">+{{ game.xpReward }} XP</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Hidden Games Section (if enabled) -->
    <section v-if="showHidden && hiddenGames.length > 0" class="relative z-10 px-6 pb-12">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6 flex items-center gap-3">
          <span class="text-3xl">🔓</span>
          上級者向けゲーム（隠し）
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="game in hiddenGames"
            :key="game.id"
            @click="playGame(game)"
            class="hidden-game-card fade-in-up cursor-pointer"
            :class="{ 'locked': !isGameUnlocked(game) }"
          >
            <div class="game-badge expert">EXPERT</div>
            <div class="text-center">
              <div class="text-3xl mb-2">{{ game.icon }}</div>
              <h4 class="text-sm font-bold text-white mb-1">{{ game.jaName }}</h4>
              <div class="text-xs text-galaxy-moon-silver mb-2">
                Lv.{{ game.requiredLevel }}必要
              </div>
              <div v-if="!isGameUnlocked(game)" class="text-xs text-red-400">
                🔒 レベル不足
              </div>
              <div v-else class="text-xs text-yellow-400 font-bold">
                +{{ game.xpReward }} XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMissionStore } from '@/stores/missionStore'
import { useUserStore } from '@/stores/userStore'
import { getGamesByPriority, GAME_PRIORITY } from '@/data/games'
import logger from '@/utils/logger'

export default {
  name: 'GameLibraryView',
  setup() {
    const router = useRouter()
    const missionStore = useMissionStore()
    const userStore = useUserStore()

    // リアクティブ変数
    const showHidden = ref(false)
    const playerLevel = computed(() => userStore.stats?.level || 1)

    // ゲームリスト
    const coreGames = computed(() => getGamesByPriority(GAME_PRIORITY.CORE))
    const optionalGames = computed(() => getGamesByPriority(GAME_PRIORITY.OPTIONAL))
    const hiddenGames = computed(() => getGamesByPriority(GAME_PRIORITY.HIDDEN, true))

    // メソッド
    const toggleHiddenGames = () => {
      showHidden.value = !showHidden.value
      localStorage.setItem('movwise_show_hidden_games', showHidden.value.toString())
    }

    const isGameUnlocked = (game) => {
      return playerLevel.value >= game.requiredLevel
    }

    const getDifficultyText = (difficulty) => {
      const map = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級',
        expert: '超級'
      }
      return map[difficulty] || '不明'
    }

    const playGame = (game) => {
      if (!isGameUnlocked(game)) {
        alert(`このゲームはレベル${game.requiredLevel}で解放されます。\n現在のレベル: ${playerLevel.value}`)
        return
      }

      // ミッション開始を記録
      missionStore.startMission(game.id)

      // ゲーム画面に遷移
      router.push({ name: game.routeName })
    }

    // マウント時
    onMounted(async () => {
      // ミッションを初期化
      await missionStore.initializeDailyMissions()

      // 保存された設定を読み込み
      const savedShowHidden = localStorage.getItem('movwise_show_hidden_games')
      if (savedShowHidden === 'true') {
        showHidden.value = true
      }
    })

    return {
      missionStore,
      showHidden,
      coreGames,
      optionalGames,
      hiddenGames,
      toggleHiddenGames,
      isGameUnlocked,
      getDifficultyText,
      playGame
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

.galaxy-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
}

.mission-card {
  background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.mission-card.completed {
  background: linear-gradient(135deg,
    rgba(16, 185, 129, 0.2) 0%,
    rgba(5, 150, 105, 0.15) 100%);
  border-color: rgba(16, 185, 129, 0.5);
}

.core-game-card {
  background: linear-gradient(135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(147, 51, 234, 0.15) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
}

.core-game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.8);
}

.optional-game-card {
  background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(100, 116, 139, 0.5);
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.optional-game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(148, 163, 184, 0.8);
}

.hidden-game-card {
  background: linear-gradient(135deg,
    rgba(88, 28, 135, 0.2) 0%,
    rgba(124, 58, 237, 0.15) 100%);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 16px;
  padding: 1rem;
  position: relative;
  transition: all 0.3s ease;
}

.hidden-game-card:hover:not(.locked) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.3);
  border-color: rgba(168, 85, 247, 0.6);
}

.hidden-game-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.game-badge.expert {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
}

.galaxy-button {
  background: linear-gradient(135deg,
    rgba(79, 172, 254, 0.3) 0%,
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  transition: all 0.3s ease;
}

.galaxy-button-primary {
  background: linear-gradient(135deg,
    rgba(79, 172, 254, 0.5) 0%,
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>