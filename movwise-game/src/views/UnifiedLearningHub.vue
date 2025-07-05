<!-- Unified Learning Hub - 統合学習センター -->
<template>
  <div class="unified-learning-hub">
    <!-- Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 p-6">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="galaxy-button galaxy-button-secondary flex items-center space-x-2">
            <ChevronLeftIcon class="h-6 w-6 cosmic-glow" />
            <span>ホーム</span>
          </button>
          <h1 class="text-3xl font-bold galaxy-text-primary cosmic-title">🎯 MovWISE 学習司令部</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="galaxy-stats-card">
            <StarIcon class="h-5 w-5 text-yellow-400 cosmic-glow" />
            <span class="font-bold">{{ totalProgress }}%</span>
          </div>
          <div class="galaxy-stats-card">
            <span class="text-sm">{{ currentPhase.name }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto p-6">
      
      <!-- Mission Control Explanation -->
      <div class="mb-8">
        <div class="galaxy-card p-6 border-2 border-blue-500/50 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
          <div class="flex items-center gap-4 mb-4">
            <div class="text-4xl">🎯</div>
            <div>
              <h2 class="text-xl font-bold galaxy-text-primary">学習司令部へようこそ！</h2>
              <p class="text-galaxy-moon-silver text-sm">ここは「今日何を学習すればいいか分からない」を解決するあなた専用のミッション選択センターです</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="text-green-400">✅</span>
              <span>現在のレベルを確認</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-yellow-400">🚀</span>
              <span>次のステップを提案</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-blue-400">🎮</span>
              <span>最適なゲームを選択</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Current Phase Progress -->
      <div class="mb-8" v-if="currentPhase">
        <div class="galaxy-card p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="text-4xl">{{ currentPhase.icon || '🌱' }}</div>
              <div>
                <h2 class="text-2xl font-bold galaxy-text-primary">{{ currentPhase.name || '基礎フェーズ' }}</h2>
                <p class="text-galaxy-moon-silver">{{ currentPhase.description || '英語学習の土台作り' }}</p>
                <div class="flex items-center space-x-4 mt-2">
                  <span class="text-sm bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full">
                    {{ currentPhase.level || '英検5級レベル' }}
                  </span>
                  <span class="text-sm text-galaxy-moon-silver">
                    推定期間: {{ currentPhase.duration || '2-3ヶ月' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold galaxy-text-primary">{{ currentPhaseProgress || 0 }}%</div>
              <div class="text-sm text-galaxy-moon-silver">フェーズ進捗</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :class="getPhaseProgressClass(currentPhase.id || 'foundation')"
              :style="{ width: (currentPhaseProgress || 0) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Recommended Next Step -->
      <div class="mb-8" v-if="recommendedStep">
        <div class="galaxy-card p-6 border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-2xl">🎯</span>
                <h3 class="text-xl font-bold text-yellow-300">次の推奨ステップ</h3>
                <span class="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                  STEP {{ recommendedStep.step }}
                </span>
              </div>
              <h4 class="text-lg font-semibold mb-2">{{ recommendedStep.title }}</h4>
              <p class="text-galaxy-moon-silver mb-4">{{ recommendedStep.description }}</p>
              
              <!-- Recommended Games -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  v-for="game in recommendedStep.games" 
                  :key="game.id"
                  class="game-recommendation-card"
                  @click="startGame(game)"
                >
                  <div class="flex items-center space-x-3">
                    <div class="game-type-icon" :class="getGameTypeClass(game.type)">
                      {{ getGameTypeIcon(game.type) }}
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold">{{ game.name }}</div>
                      <div class="text-sm text-galaxy-moon-silver">{{ game.estimatedTime }}</div>
                    </div>
                    <div class="game-priority-badge" :class="getPriorityClass(game.priority)">
                      {{ getPriorityText(game.priority) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Learning Path Overview -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold galaxy-text-primary mb-4">🗺️ 学習ロードマップ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="phase in Object.values(LEARNING_PHASES)" 
            :key="phase.id"
            class="phase-card"
            :class="getPhaseCardClass(phase)"
            @click="selectPhase(phase.id)"
          >
            <div class="phase-header">
              <div class="text-3xl mb-2">{{ phase.icon }}</div>
              <h4 class="font-bold">{{ phase.name }}</h4>
              <p class="text-sm text-galaxy-moon-silver">{{ phase.level }}</p>
            </div>
            <div class="phase-progress-mini">
              <div class="progress-circle">
                <div class="progress-value">{{ getPhaseProgress(phase.id) }}%</div>
              </div>
            </div>
            <div class="phase-status">
              {{ getPhaseStatus(phase.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Unified Rush Zone -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold galaxy-text-primary mb-4">⚡ 統合 Rush Zone</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="rushType in Object.values(RUSH_ZONE_MAPPING)" 
            :key="rushType.name"
            class="rush-zone-card"
            :style="{ borderColor: rushType.color + '80' }"
            @click="enterRushZone(rushType)"
          >
            <div class="rush-zone-header">
              <div class="text-3xl mb-2">{{ rushType.icon }}</div>
              <h4 class="font-bold" :style="{ color: rushType.color }">{{ rushType.name }}</h4>
              <p class="text-sm text-galaxy-moon-silver">{{ rushType.description }}</p>
            </div>
            <div class="rush-zone-stats">
              <div class="stat-item">
                <span class="stat-label">利用可能ゲーム</span>
                <span class="stat-value">{{ rushType.games.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Zone Selection -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold galaxy-text-primary mb-4">🎮 学習ゾーン選択</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Construction Zone -->
          <div class="zone-card construction-zone" @click="enterZone('construction')">
            <div class="zone-header">
              <div class="text-4xl mb-3">🏗️</div>
              <h4 class="text-xl font-bold">Construction Zone</h4>
              <p class="text-galaxy-moon-silver">段階的構築学習</p>
            </div>
            <div class="zone-description">
              <p>じっくり時間をかけて、基礎から応用まで段階的に学習</p>
              <ul class="mt-2 text-sm space-y-1">
                <li>• 詳細な説明とガイド</li>
                <li>• インタラクティブな学習体験</li>
                <li>• 個人のペースで学習</li>
              </ul>
            </div>
            <div class="zone-button">
              Construction Zone に入る
            </div>
          </div>

          <!-- Battle Zone -->
          <div class="zone-card battle-zone" @click="enterZone('battle')">
            <div class="zone-header">
              <div class="text-4xl mb-3">⚔️</div>
              <h4 class="text-xl font-bold">Battle Zone</h4>
              <p class="text-galaxy-moon-silver">競争型チャレンジ</p>
            </div>
            <div class="zone-description">
              <p>他の学習者と競い合いながらスキルアップ</p>
              <ul class="mt-2 text-sm space-y-1">
                <li>• リアルタイム対戦</li>
                <li>• パワーアップシステム</li>
                <li>• ランキング＆レーティング</li>
              </ul>
            </div>
            <div class="zone-button">
              Battle Zone に挑戦
            </div>
          </div>

          <!-- AI Academy -->
          <div class="zone-card academy-zone" @click="enterZone('academy')">
            <div class="zone-header">
              <div class="text-4xl mb-3">🤖</div>
              <h4 class="text-xl font-bold">AI Academy</h4>
              <p class="text-galaxy-moon-silver">AI適応型学習</p>
            </div>
            <div class="zone-description">
              <p>AIがあなたの学習パターンを分析してパーソナライズ</p>
              <ul class="mt-2 text-sm space-y-1">
                <li>• リアルタイム難易度調整</li>
                <li>• 学習スタイル適応</li>
                <li>• 詳細な分析レポート</li>
              </ul>
            </div>
            <div class="zone-button">
              AI Academy で学習
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold galaxy-text-primary mb-4">📊 学習統計</h3>
        <div class="galaxy-card p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">{{ totalProgress }}%</div>
              <div class="stat-label">総合進捗</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">{{ currentStreak }}</div>
              <div class="stat-label">連続学習日数</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">{{ totalStars }}</div>
              <div class="stat-label">獲得スター数</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-value">{{ completedGames }}</div>
              <div class="stat-label">完了ゲーム数</div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Unified Footer -->
    <CommonFooter 
      :active="'unified'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LEARNING_PHASES, 
  UNIFIED_LEARNING_PATH, 
  RUSH_ZONE_MAPPING,
  getRecommendedNextStep,
  getCurrentPhase,
  getPhaseProgress
} from '@/data/unified-learning-roadmap'
import {
  ChevronLeftIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'UnifiedLearningHub',
  components: {
    ChevronLeftIcon,
    StarIcon,
    CommonFooter
  },
  setup() {
    const router = useRouter()
    
    // Reactive data
    const currentProgress = ref({
      // Mock progress data - in real app, load from store
      step_1: { completed: true, accuracy: 90 },
      step_2: { completed: true, accuracy: 85 },
      step_3: { completed: false, accuracy: 60 },
      step_4: { completed: false, accuracy: 0 }
    })
    
    // Computed properties
    const currentPhase = computed(() => {
      try {
        return getCurrentPhase(currentProgress.value) || LEARNING_PHASES.foundation
      } catch (error) {
        console.warn('Error getting current phase:', error)
        return LEARNING_PHASES.foundation
      }
    })
    
    const recommendedStep = computed(() => {
      try {
        const recommended = getRecommendedNextStep(currentProgress.value)
        const phaseData = UNIFIED_LEARNING_PATH[recommended?.phase]
        const stepData = phaseData?.sequence.find(step => step.step === recommended?.step)
        return stepData || phaseData?.sequence[0] || null
      } catch (error) {
        console.warn('Error getting recommended step:', error)
        return null
      }
    })
    
    const currentPhaseProgress = computed(() => {
      try {
        const phase = currentPhase.value
        return phase?.id ? getPhaseProgress(phase.id, currentProgress.value) : 0
      } catch (error) {
        console.warn('Error getting phase progress:', error)
        return 0
      }
    })
    
    const totalProgress = computed(() => {
      try {
        const allPhases = Object.keys(LEARNING_PHASES)
        const totalPhaseProgress = allPhases.reduce((sum, phaseId) => {
          return sum + getPhaseProgress(phaseId, currentProgress.value)
        }, 0)
        return Math.round(totalPhaseProgress / allPhases.length)
      } catch (error) {
        console.warn('Error calculating total progress:', error)
        return 0
      }
    })
    
    // Mock stats
    const currentStreak = ref(7)
    const totalStars = ref(145)
    const completedGames = ref(23)
    
    // Methods
    const startGame = (game) => {
      console.log('Starting game:', game.name)
      router.push(game.route)
    }
    
    const enterRushZone = (rushType) => {
      console.log('Entering Rush Zone:', rushType.name)
      // Route to unified rush zone with category filter
      router.push(`/unified-rush-zone?category=${rushType.name.toLowerCase().replace(' ', '-')}`)
    }
    
    const enterZone = (zoneType) => {
      console.log('Entering zone:', zoneType)
      switch (zoneType) {
        case 'construction':
          router.push('/multi-layer/construction-zone')
          break
        case 'battle':
          router.push('/multi-layer/battle-zone')
          break
        case 'academy':
          router.push('/multi-layer')
          break
        default:
          console.warn('Unknown zone type:', zoneType)
      }
    }
    
    const selectPhase = (phaseId) => {
      console.log('Phase selected:', phaseId)
      // Show detailed phase view or navigate to first uncompleted step
      const phaseData = UNIFIED_LEARNING_PATH[phaseId]
      if (phaseData) {
        const firstIncompleteStep = phaseData.sequence.find(step => {
          const stepProgress = currentProgress.value[`step_${step.step}`]
          return !stepProgress?.completed
        })
        
        if (firstIncompleteStep && firstIncompleteStep.games.length > 0) {
          startGame(firstIncompleteStep.games[0])
        }
      }
    }
    
    const getPhaseCardClass = (phase) => {
      const progress = getPhaseProgress(phase.id, currentProgress.value)
      return {
        'phase-completed': progress >= phase.requiredCompletion,
        'phase-current': currentPhase.value.id === phase.id,
        'phase-locked': progress < 10 && currentPhase.value.priority < phase.priority
      }
    }
    
    const getPhaseProgressClass = (phaseId) => {
      const colors = {
        foundation: 'bg-gradient-to-r from-green-500 to-green-400',
        building: 'bg-gradient-to-r from-blue-500 to-blue-400',
        expansion: 'bg-gradient-to-r from-purple-500 to-purple-400',
        mastery: 'bg-gradient-to-r from-yellow-500 to-yellow-400'
      }
      return colors[phaseId] || 'bg-gray-500'
    }
    
    const getPhaseStatus = (phaseId) => {
      const progress = getPhaseProgress(phaseId, currentProgress.value)
      const phase = LEARNING_PHASES[phaseId]
      
      if (progress >= phase.requiredCompletion) return '完了'
      if (currentPhase.value.id === phaseId) return '学習中'
      if (progress > 0) return '開始済み'
      return '未開始'
    }
    
    const getGameTypeIcon = (type) => {
      const icons = {
        core: '🎯',
        practice: '📚',
        speed: '⚡',
        detailed: '🔍',
        competitive: '⚔️',
        adaptive: '🤖',
        search: '🔍',
        boss: '👑',
        challenge: '🏆'
      }
      return icons[type] || '🎮'
    }
    
    const getGameTypeClass = (type) => {
      const classes = {
        core: 'bg-red-500',
        practice: 'bg-blue-500',
        speed: 'bg-yellow-500',
        detailed: 'bg-green-500',
        competitive: 'bg-purple-500',
        adaptive: 'bg-indigo-500',
        search: 'bg-pink-500',
        boss: 'bg-orange-500',
        challenge: 'bg-red-600'
      }
      return classes[type] || 'bg-gray-500'
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        required: 'bg-red-500 text-white',
        recommended: 'bg-yellow-500 text-black',
        challenge: 'bg-purple-500 text-white'
      }
      return classes[priority] || 'bg-gray-500 text-white'
    }
    
    const getPriorityText = (priority) => {
      const texts = {
        required: '必須',
        recommended: '推奨',
        challenge: 'チャレンジ'
      }
      return texts[priority] || priority
    }
    
    const goBack = () => {
      router.push('/')
    }
    
    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure')
          break
        case 'grammar':
          router.push('/grammar-galaxy')
          break
        case 'multi-layer':
          router.push('/multi-layer')
          break
        case 'co-pilot':
          router.push('/co-pilot-dock')
          break
        case 'vr-academy':
          router.push('/vr-academy')
          break
        default:
          console.warn('Unknown navigation section:', section)
      }
    }
    
    onMounted(() => {
      console.log('Unified Learning Hub mounted')
      console.log('Current phase:', currentPhase.value)
      console.log('Recommended step:', recommendedStep.value)
    })
    
    return {
      // Data
      LEARNING_PHASES,
      RUSH_ZONE_MAPPING,
      currentProgress,
      
      // Computed
      currentPhase,
      recommendedStep,
      currentPhaseProgress,
      totalProgress,
      currentStreak,
      totalStars,
      completedGames,
      
      // Methods
      startGame,
      enterRushZone,
      enterZone,
      selectPhase,
      getPhaseCardClass,
      getPhaseProgressClass,
      getPhaseProgress,
      getPhaseStatus,
      getGameTypeIcon,
      getGameTypeClass,
      getPriorityClass,
      getPriorityText,
      goBack,
      handleFooterNavigation
    }
  }
}
</script>

<style scoped>
/* Galaxy background - unified */
.unified-learning-hub {
  min-height: 100vh;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  color: white;
}

/* Animated stars - unified */
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

/* Galaxy-themed components */
.galaxy-text-primary {
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6, #FBBF24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.galaxy-stats-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.galaxy-button {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
}

.cosmic-title {
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

/* Phase Cards */
.phase-card {
  @apply p-6 rounded-xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
}

.phase-card:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
}

.phase-card.phase-current {
  border: 2px solid #60A5FA;
  box-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.phase-card.phase-completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
  border: 2px solid rgba(34, 197, 94, 0.5);
}

.phase-card.phase-locked {
  @apply opacity-50 cursor-not-allowed;
  filter: grayscale(0.8);
}

.phase-header {
  @apply text-center mb-4;
}

.phase-progress-mini {
  @apply flex justify-center mb-3;
}

.progress-circle {
  @apply w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center;
  background: conic-gradient(#60A5FA 0deg, #60A5FA calc(var(--progress, 0) * 3.6deg), transparent calc(var(--progress, 0) * 3.6deg));
}

.progress-value {
  @apply text-sm font-bold;
}

.phase-status {
  @apply text-center text-sm font-medium;
}

/* Game Recommendation Cards */
.game-recommendation-card {
  @apply p-4 rounded-lg cursor-pointer transition-all duration-200;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.2);
}

.game-recommendation-card:hover {
  @apply scale-105;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.game-type-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-white font-bold;
}

.game-priority-badge {
  @apply px-2 py-1 rounded text-xs font-bold;
}

/* Rush Zone Cards */
.rush-zone-card {
  @apply p-6 rounded-xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid;
}

.rush-zone-card:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.rush-zone-header {
  @apply text-center mb-4;
}

.rush-zone-stats {
  @apply space-y-2;
}

.stat-item {
  @apply flex justify-between items-center text-sm;
}

.stat-label {
  @apply text-gray-300;
}

.stat-value {
  @apply font-semibold text-white;
}

/* Zone Cards */
.zone-card {
  @apply p-6 rounded-xl cursor-pointer transition-all duration-300 transform;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 2px solid transparent;
}

.zone-card:hover {
  @apply scale-105;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
}

.zone-card.construction-zone:hover {
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.3);
}

.zone-card.battle-zone:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);
}

.zone-card.academy-zone:hover {
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 20px 40px rgba(168, 85, 247, 0.3);
}

.zone-header {
  @apply text-center mb-4;
}

.zone-description {
  @apply mb-6 text-sm;
}

.zone-button {
  @apply w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold text-center transition-all duration-200 transform hover:scale-105;
}

/* Stats Cards */
.stat-card {
  @apply text-center p-4 rounded-lg;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border: 1px solid rgba(255,255,255,0.2);
}

.stat-icon {
  @apply text-2xl mb-2;
}

.stat-value {
  @apply text-2xl font-bold galaxy-text-primary;
}

.stat-label {
  @apply text-sm text-galaxy-moon-silver mt-1;
}

/* Animations */
@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Responsive */
@media (max-width: 768px) {
  .unified-learning-hub {
    @apply px-4;
  }
  
  .phase-card,
  .rush-zone-card,
  .zone-card {
    @apply p-4;
  }
  
  .game-recommendation-card {
    @apply p-3;
  }
}
</style>