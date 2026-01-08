<template>
  <div class="phonics-adventure">
    <!-- VRモード切替ボタン -->
    <button
      @click="toggleVR"
      :class="[
        'fixed top-4 right-4 z-50 px-4 py-2 rounded-full font-bold transition-all duration-300',
        vrMode
          ? 'galaxy-button galaxy-button-primary text-white shadow-2xl transform scale-110'
          : 'galaxy-button galaxy-button-secondary text-white shadow-lg hover:shadow-xl hover:scale-105'
      ]"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg cosmic-glow">🥽</span>
        <span>{{ vrMode ? 'VR終了' : 'VRモード' }}</span>
      </div>
    </button>

    <!-- プラットフォームヘッダー -->
    <div class="platform-header">
      <button @click="goBack" class="back-button">
        <Icon name="arrow-left" />
        プラットフォームハブに戻る
      </button>

      <div class="platform-title-section">
        <div class="platform-icon">🎵</div>
        <div>
          <h1 class="platform-title">フォニックス・アドベンチャー</h1>
          <p class="platform-subtitle">音の世界を冒険して英語の基礎力を身につけよう</p>
        </div>

        <div class="platform-progress">
          <div class="progress-circle">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" stroke-width="6"/>
              <circle
                cx="40" cy="40" r="35" fill="none"
                stroke="#3b82f6" stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="220"
                :stroke-dashoffset="220 - (overallProgress / 100) * 220"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">{{ overallProgress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲームモード選択 -->
    <div class="game-modes">
      <div class="mode-tabs">
        <button
          v-for="mode in gameModes"
          :key="mode.id"
          @click="activeMode = mode.id"
          class="mode-tab"
          :class="{ 'active': activeMode === mode.id }"
        >
          <Icon :name="mode.icon" />
          {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- ゲームコンテンツ -->
    <div class="game-content">
      <!-- 基礎音素モード -->
      <div v-if="activeMode === 'basic'" class="mode-content">
        <div class="mode-header">
          <h2>基礎音素トレーニング</h2>
          <p>英語の基本的な音を聞き分けて発音をマスターしよう</p>
        </div>

        <div class="games-grid">
          <div
            v-for="game in basicPhonicsGames"
            :key="game.id"
            class="game-card"
            :class="{ 'locked': !game.unlocked, 'completed': game.completed }"
            @click="startGame(game)"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              <div class="game-meta">
                <span class="difficulty">{{ game.difficulty }}</span>
                <span class="duration">{{ game.duration }}分</span>
              </div>
            </div>
            <div class="game-progress">
              <div class="stars">
                <Icon
                  v-for="star in 3"
                  :key="star"
                  name="star"
                  :class="star <= game.stars ? 'filled' : 'empty'"
                />
              </div>
              <div class="best-score" v-if="game.bestScore">
                最高: {{ game.bestScore }}点
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ブレンディングモード -->
      <div v-if="activeMode === 'blending'" class="mode-content">
        <div class="mode-header">
          <h2>ブレンディング・チャレンジ</h2>
          <p>音をつなげて単語を作る練習をしよう</p>
        </div>

        <div class="games-grid">
          <div
            v-for="game in blendingGames"
            :key="game.id"
            class="game-card"
            :class="{ 'locked': !game.unlocked, 'completed': game.completed }"
            @click="startGame(game)"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              <div class="game-meta">
                <span class="difficulty">{{ game.difficulty }}</span>
                <span class="duration">{{ game.duration }}分</span>
              </div>
            </div>
            <div class="game-progress">
              <div class="stars">
                <Icon
                  v-for="star in 3"
                  :key="star"
                  name="star"
                  :class="star <= game.stars ? 'filled' : 'empty'"
                />
              </div>
              <div class="best-score" v-if="game.bestScore">
                最高: {{ game.bestScore }}点
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- リズム学習モード -->
      <div v-if="activeMode === 'rhythm'" class="mode-content">
        <div class="mode-header">
          <h2>リズム・フォニックス</h2>
          <p>音楽に合わせて楽しく発音を覚えよう</p>
        </div>

        <div class="games-grid">
          <div
            v-for="game in rhythmGames"
            :key="game.id"
            class="game-card"
            :class="{ 'locked': !game.unlocked, 'completed': game.completed }"
            @click="startGame(game)"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              <div class="game-meta">
                <span class="difficulty">{{ game.difficulty }}</span>
                <span class="duration">{{ game.duration }}分</span>
              </div>
            </div>
            <div class="game-progress">
              <div class="stars">
                <Icon
                  v-for="star in 3"
                  :key="star"
                  name="star"
                  :class="star <= game.stars ? 'filled' : 'empty'"
                />
              </div>
              <div class="best-score" v-if="game.bestScore">
                最高: {{ game.bestScore }}点
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- マスタリーモード -->
      <div v-if="activeMode === 'mastery'" class="mode-content">
        <div class="mode-header">
          <h2>フォニックス・マスタリー</h2>
          <p>習得した知識を使って総合チャレンジに挑戦しよう</p>
        </div>

        <div class="games-grid">
          <div
            v-for="game in masteryGames"
            :key="game.id"
            class="game-card"
            :class="{ 'locked': !game.unlocked, 'completed': game.completed }"
            @click="startGame(game)"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-info">
              <h3 class="game-name">{{ game.name }}</h3>
              <p class="game-description">{{ game.description }}</p>
              <div class="game-meta">
                <span class="difficulty">{{ game.difficulty }}</span>
                <span class="duration">{{ game.duration }}分</span>
              </div>
            </div>
            <div class="game-progress">
              <div class="stars">
                <Icon
                  v-for="star in 3"
                  :key="star"
                  name="star"
                  :class="star <= game.stars ? 'filled' : 'empty'"
                />
              </div>
              <div class="best-score" v-if="game.bestScore">
                最高: {{ game.bestScore }}点
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- プラットフォーム統計 -->
    <div class="platform-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <Icon name="star" class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ totalStars }}/{{ maxStars }}</div>
            <div class="stat-label">獲得した星</div>
          </div>
        </div>

        <div class="stat-card">
          <Icon name="clock" class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ totalTimeSpent }}分</div>
            <div class="stat-label">学習時間</div>
          </div>
        </div>

        <div class="stat-card">
          <Icon name="target" class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ averageAccuracy }}%</div>
            <div class="stat-label">平均正解率</div>
          </div>
        </div>

        <div class="stat-card">
          <Icon name="trophy" class="stat-icon" />
          <div class="stat-content">
            <div class="stat-value">{{ completedGames }}</div>
            <div class="stat-label">クリア数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Icon from '@/components/shared/Icon.vue'

export default {
  name: 'PhonicsAdventure',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const activeMode = ref('basic')
    const vrMode = ref(false)

    // ゲームモード定義
    const gameModes = [
      { id: 'basic', name: '基礎音素', icon: 'volume-2' },
      { id: 'blending', name: 'ブレンディング', icon: 'link' },
      { id: 'rhythm', name: 'リズム学習', icon: 'music' },
      { id: 'mastery', name: 'マスタリー', icon: 'award' }
    ]

    // 基礎音素ゲーム
    const basicPhonicsGames = ref([
      {
        id: 'customizable-phonics-journey',
        name: 'カスタマイズフォニックス',
        description: 'Jolly Phonicsメソッドで個別カスタマイズ',
        icon: '🎯',
        difficulty: '簡単',
        duration: 15,
        unlocked: true,
        completed: true,
        stars: 3,
        bestScore: 950,
        route: '/customizable-phonics'
      },
      {
        id: 'pure-sound-lab-beat-saber',
        name: 'ピュアサウンドラボ',
        description: 'ビートセイバー風フォニックス学習',
        icon: '🎵',
        difficulty: '簡単',
        duration: 10,
        unlocked: true,
        completed: true,
        stars: 2,
        bestScore: 720,
        route: '/games/pure-sound-lab'
      },
      {
        id: 'sound-master-game',
        name: 'サウンドマスター',
        description: '音の門番タワーで音素をマスター',
        icon: '🗼',
        difficulty: '普通',
        duration: 12,
        unlocked: true,
        completed: false,
        stars: 1,
        bestScore: null,
        route: '/games/sound-master-game'
      },
      {
        id: 'phonics-training-hub',
        name: 'フォニックス訓練所',
        description: '体系的なフォニックス訓練プログラム',
        icon: '🏫',
        difficulty: '普通',
        duration: 20,
        unlocked: true,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/phonics-training-hub?component=PhonicsTrainingHub'
      },
      {
        id: 'complex-phoneme-game',
        name: '複合音素ゲーム',
        description: '複雑な音の組み合わせに挑戦',
        icon: '🧩',
        difficulty: '難しい',
        duration: 15,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/complex-phoneme-game?component=ComplexPhonemeGame'
      }
    ])

    // ブレンディングゲーム
    const blendingGames = ref([
      {
        id: 'sequential-blending-game',
        name: 'シーケンシャル・ブレンディング',
        description: '順序よく音をつなげて単語を作ろう',
        icon: '🔗',
        difficulty: '普通',
        duration: 12,
        unlocked: true,
        completed: false,
        stars: 1,
        bestScore: 450,
        route: '/phonics-game/sequential-blending-game?component=SequentialBlendingGame'
      },
      {
        id: 'cosmic-sound-chain',
        name: 'コズミック・サウンド・チェーン',
        description: '宇宙で音素ブレンディングチェーンを作成',
        icon: '🌌',
        difficulty: '普通',
        duration: 15,
        unlocked: true,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/cosmic-sound-chain?component=CosmicSoundChain'
      },
      {
        id: 'double-letter-lab',
        name: 'ダブルレター研究所',
        description: 'ダブルレターの法則を発見しよう',
        icon: '🔬',
        difficulty: '難しい',
        duration: 18,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/double-letter-lab?component=DoubleLetterLabGame'
      }
    ])

    // リズムゲーム
    const rhythmGames = ref([
      {
        id: 'rhythm-phonics-dance',
        name: 'リズム・フォニックス・ダンス',
        description: '音楽に合わせてフォニックスダンス',
        icon: '💃',
        difficulty: '普通',
        duration: 15,
        unlocked: true,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/rhythm-phonics-dance?component=RhythmPhonicsDance'
      },
      {
        id: 'english-rhythm-master',
        name: 'English Rhythm Master',
        description: '英語の強弱リズムを完全マスター',
        icon: '🎵',
        difficulty: '普通',
        duration: 15,
        unlocked: true,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/english-rhythm-master?component=EnglishRhythmMaster'
      },
      {
        id: 'true-sound-impact',
        name: 'トゥルーサウンド・インパクト',
        description: '純粋な音の衝撃でスキルアップ',
        icon: '💥',
        difficulty: '普通',
        duration: 12,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/true-sound-impact?component=TrueSoundImpact'
      }
    ])

    // マスタリーゲーム
    const masteryGames = ref([
      {
        id: 'phonics-boss-challenge',
        name: 'フォニックス・ボスチャレンジ',
        description: '最強のフォニックスボスに挑戦',
        icon: '👹',
        difficulty: '非常に難しい',
        duration: 25,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/phonics-boss-challenge?component=PhonicsBossChallenge'
      },
      {
        id: 'phonics-puzzle-quest',
        name: 'フォニックス・パズルクエスト',
        description: '複雑なパズルで総合力をテスト',
        icon: '🧩',
        difficulty: '難しい',
        duration: 20,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/phonics-puzzle-quest?component=PhonicsPuzzleQuest'
      },
      {
        id: 'space-sound-adventure',
        name: 'スペース・サウンド・アドベンチャー',
        description: '宇宙を舞台にした究極の音素冒険',
        icon: '🚀',
        difficulty: '専門',
        duration: 30,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/space-sound-adventure?component=SpaceSoundAdventure'
      },
      {
        id: 'phonics-path-game',
        name: 'フォニックス・パス',
        description: '音素の道を辿って最終ゴールへ',
        icon: '🛤️',
        difficulty: '専門',
        duration: 25,
        unlocked: false,
        completed: false,
        stars: 0,
        bestScore: null,
        route: '/phonics-game/phonics-path-game?component=PhonicsPathGame'
      }
    ])

    // 統計計算
    const allGames = computed(() => [
      ...basicPhonicsGames.value,
      ...blendingGames.value,
      ...rhythmGames.value,
      ...masteryGames.value
    ])

    const totalStars = computed(() =>
      allGames.value.reduce((sum, game) => sum + game.stars, 0)
    )

    const maxStars = computed(() => allGames.value.length * 3)

    const overallProgress = computed(() =>
      Math.round((totalStars.value / maxStars.value) * 100)
    )

    const totalTimeSpent = computed(() =>
      allGames.value.reduce((sum, game) => sum + (game.completed ? game.duration : 0), 0)
    )

    const completedGames = computed(() =>
      allGames.value.filter(game => game.completed).length
    )

    const averageAccuracy = computed(() => 85) // 仮の値

    // メソッド
    const toggleVR = () => {
      vrMode.value = !vrMode.value
      // VRモード切り替えのロジック
      if (vrMode.value) {
        console.log('VRモード開始')
        // VR関連の初期化処理をここに追加
      } else {
        console.log('VRモード終了')
        // VR関連のクリーンアップ処理をここに追加
      }
    }

    const goBack = () => {
      router.push('/platforms')
    }

    const startGame = (game) => {
      if (!game.unlocked) {
        alert('このゲームはまだ解放されていません。前のゲームをクリアしてください。')
        return
      }

      router.push(game.route)
    }

    // クエリパラメータからモードを設定
    onMounted(() => {
      if (route.query.mode) {
        const validModes = ['basic', 'blending', 'rhythm', 'mastery']
        if (validModes.includes(route.query.mode)) {
          activeMode.value = route.query.mode
        }
      }
    })

    return {
      activeMode,
      vrMode,
      gameModes,
      basicPhonicsGames,
      blendingGames,
      rhythmGames,
      masteryGames,
      overallProgress,
      totalStars,
      maxStars,
      totalTimeSpent,
      completedGames,
      averageAccuracy,
      toggleVR,
      goBack,
      startGame
    }
  }
}
</script>

<style scoped>
.phonics-adventure {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1e3a8a 0%, #1e1b4b 50%, #000 100%);
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

/* 宇宙背景エフェクト */
.phonics-adventure::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #3b82f6, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(59, 130, 246, 0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #60a5fa, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(96, 165, 250, 0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #3b82f6, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: stars-move 120s linear infinite;
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.phonics-adventure::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1), transparent 70%),
              radial-gradient(circle at 80% 20%, rgba(96, 165, 250, 0.1), transparent 70%),
              radial-gradient(circle at 40% 40%, rgba(147, 197, 253, 0.05), transparent 70%);
  animation: nebula-drift 60s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 1;
}

@keyframes stars-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100px); }
}

@keyframes nebula-drift {
  0% { opacity: 0.3; transform: scale(1) rotate(0deg); }
  100% { opacity: 0.6; transform: scale(1.1) rotate(1deg); }
}

.platform-header {
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 2rem;
  backdrop-filter: blur(10px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.2);
}

.platform-title-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.platform-icon {
  font-size: 4rem;
  animation: cosmic-pulse 3s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
  }
}

.platform-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #ffffff 0%, #93c5fd 50%, #3b82f6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
}

.platform-subtitle {
  color: #cbd5e1;
  font-size: 1.125rem;
}

.platform-progress {
  margin-left: auto;
}

.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
}

.game-modes {
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.game-content {
  position: relative;
  z-index: 10;
}

.mode-tabs {
  display: flex;
  gap: 0.5rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
  padding: 0.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: #cbd5e1;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.mode-tab.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.mode-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.game-content {
  margin-bottom: 2rem;
}

.mode-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mode-header {
  text-align: center;
  margin-bottom: 2rem;
}

.mode-header h2 {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.mode-header p {
  color: #cbd5e1;
  font-size: 1.125rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.game-card {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(30, 41, 59, 0.9);
}

.game-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.game-card.locked:hover {
  transform: none;
  box-shadow: none;
}

.game-card.completed::before {
  content: '✓';
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.game-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.game-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.game-description {
  color: #e2e8f0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.game-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.difficulty {
  padding: 0.25rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-radius: 1rem;
}

.duration {
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-radius: 1rem;
}

.game-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.stars .filled {
  color: #fbbf24;
}

.stars .empty {
  color: #6b7280;
}

.best-score {
  font-size: 0.75rem;
  color: #cbd5e1;
}

.platform-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #60a5fa;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .phonics-adventure {
    padding: 1rem;
  }

  .platform-title-section {
    flex-direction: column;
    text-align: center;
  }

  .platform-title {
    font-size: 2rem;
  }

  .mode-tabs {
    flex-direction: column;
  }

  .games-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>