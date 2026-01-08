<template>
  <div class="min-h-screen word-building-background overflow-hidden">
    <!-- Animated city background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="city-skyline"></div>
      <div class="floating-words-layer"></div>
      <div class="word-particles"></div>
    </div>

    <div class="relative z-10 container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="word-city-card rounded-3xl p-6 mb-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <button 
            @click="handleBack"
            class="word-button word-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5 word-glow" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold word-text-primary city-title mb-2">
              🏙️ Word Building City
            </h1>
            <p class="text-word-moon-silver text-lg">単語構築惑星 - 語彙マスターの都市</p>
          </div>

          <button 
            @click="showSettings = true"
            class="word-button word-button-secondary text-white px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <Settings class="w-5 h-5 word-glow" />
          </button>
        </div>

        <!-- Player Progress Overview -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="word-stats-card">
            <div class="text-2xl mb-1 word-glow">💎</div>
            <div class="font-bold text-lg word-text-primary">{{ playerStore.totalCrystals }}</div>
            <div class="text-sm text-word-moon-silver">Word Crystals</div>
          </div>
          
          <div class="word-stats-card">
            <div class="text-2xl mb-1 word-glow">📚</div>
            <div class="font-bold text-lg word-text-primary">{{ totalWordsLearned }}</div>
            <div class="text-sm text-word-moon-silver">Words Learned</div>
          </div>

          <div class="word-stats-card">
            <div class="text-2xl mb-1 word-glow">⚡</div>
            <div class="font-bold text-lg word-text-primary">{{ averageSpeed }}wpm</div>
            <div class="text-sm text-word-moon-silver">Speed</div>
          </div>

          <div class="word-stats-card">
            <div class="text-2xl mb-1 word-glow">🎯</div>
            <div class="font-bold text-lg word-text-primary">{{ accuracyRate }}%</div>
            <div class="text-sm text-word-moon-silver">Accuracy</div>
          </div>
        </div>
      </div>

      <!-- City Map Component -->
      <CityMap 
        :city-districts="cityDistricts" 
        :player-progress="playerProgress"
        @district-selected="handleDistrictSelection"
        @facility-clicked="handleFacilityClick"
      />

      <!-- City Districts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div
          v-for="district in cityDistricts"
          :key="district.id"
          class="word-city-card rounded-3xl p-6 cursor-pointer hover:scale-105 transition-all duration-200"
          @click="handleDistrictSelection(district)"
        >
          <div class="text-center mb-4">
            <div class="text-6xl mb-4 district-icon">{{ district.icon }}</div>
            <h3 class="text-2xl font-bold word-text-primary mb-2">{{ district.name }}</h3>
            <p class="text-word-moon-silver mb-4">{{ district.description }}</p>
          </div>

          <!-- District Facilities -->
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="facility in district.facilities"
              :key="facility.id"
              :class="[
                'facility-building p-3 rounded-xl transition-all duration-200 cursor-pointer',
                facility.unlocked ? 'facility-unlocked hover:scale-105' : 'facility-locked'
              ]"
              @click.stop="handleFacilityClick(facility)"
            >
              <div class="text-center">
                <div class="text-2xl mb-1">{{ facility.icon }}</div>
                <div class="text-xs font-bold text-gray-700">{{ facility.name }}</div>
                <div v-if="facility.progress" class="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    :style="{ width: `${facility.progress}%` }"
                  ></div>
                </div>
                <div v-if="!facility.unlocked" class="text-xs text-gray-500 mt-1">
                  🔒 {{ facility.unlockRequirement }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Learning Path Progress -->
      <div class="word-city-card rounded-3xl p-6">
        <h3 class="text-2xl font-bold word-text-primary text-center mb-6">
          🛤️ 学習ロードマップ
        </h3>
        
        <div class="learning-path">
          <div
            v-for="(milestone, index) in learningMilestones"
            :key="milestone.id"
            :class="[
              'milestone',
              milestone.completed ? 'milestone-completed' : 
              milestone.current ? 'milestone-current' : 'milestone-locked'
            ]"
          >
            <div class="milestone-icon">{{ milestone.icon }}</div>
            <div class="milestone-content">
              <h4 class="font-bold">{{ milestone.title }}</h4>
              <p class="text-sm text-gray-600">{{ milestone.description }}</p>
              <div v-if="milestone.current" class="progress-bar">
                <div class="progress-fill" :style="{ width: `${milestone.progress}%` }"></div>
              </div>
            </div>
            <div v-if="index < learningMilestones.length - 1" class="milestone-connector"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Settings } from 'lucide-vue-next'

// VR Academy Integration
import { useGameStore } from '@/stores/gameStore'
import { usePlayerProfileStore } from '@/stores/playerProfile'

// Import City Map Component
import CityMap from '@/components/planets/word/CityMap.vue'

const router = useRouter()

// Store integrations
const gameStore = useGameStore()
const playerStore = usePlayerProfileStore()

// Component state
const showSettings = ref(false)
const selectedDistrict = ref(null)

// Player statistics (computed from store data)
const totalWordsLearned = computed(() => {
  return playerStore.gameStats?.wordsLearned || 0
})

const averageSpeed = computed(() => {
  return Math.round(playerStore.gameStats?.averageWPM || 0)
})

const accuracyRate = computed(() => {
  return Math.round(playerStore.gameStats?.averageAccuracy || 0)
})

const playerProgress = computed(() => ({
  level: playerStore.level,
  experience: playerStore.experience,
  crystals: playerStore.totalCrystals,
  wordsLearned: totalWordsLearned.value,
  unlockedFacilities: playerStore.unlockedFeatures || []
}))

// City Districts Configuration
const cityDistricts = reactive([
  {
    id: 'recognition_quarter',
    name: '認識クォーター',
    icon: '👁️',
    description: '瞬間認識と視覚的単語学習',
    facilities: [
      {
        id: 'sight_word_library',
        name: '単語図書館',
        icon: '📚',
        gameComponent: 'SightWordMaster',
        route: 'sight-word-master',
        unlocked: true,
        progress: 75,
        description: 'サイトワード瞬間認識トレーニング'
      },
      {
        id: 'word_memory_palace',
        name: '記憶宮殿',
        icon: '🏛️',
        gameComponent: 'WordMemoryGame',
        unlocked: false,
        unlockRequirement: '200語習得',
        description: '記憶術を使った単語学習'
      }
    ]
  },
  {
    id: 'speed_district',
    name: 'スピード地区',
    icon: '⚡',
    description: '高速処理と反応訓練',
    facilities: [
      {
        id: 'speed_track',
        name: 'スピードトラック',
        icon: '🏎️',
        gameComponent: 'WordRushGame',
        route: 'WordRushGame',
        unlocked: true,
        progress: 60,
        description: '高速語彙習得レース'
      },
      {
        id: 'reflex_center',
        name: '反射神経センター',
        icon: '⚡',
        gameComponent: 'WordReflexGame',
        unlocked: false,
        unlockRequirement: 'スピード50wpm',
        description: '瞬間反応単語ゲーム'
      }
    ]
  },
  {
    id: 'construction_zone',
    name: '建設ゾーン',
    icon: '🏗️',
    description: '単語構築と組み立て',
    facilities: [
      {
        id: 'word_factory',
        name: '単語工場',
        icon: '🏭',
        gameComponent: 'BlendingBuilderGame',
        route: 'cvc-settings',
        unlocked: true,
        progress: 45,
        description: 'CVC単語組み立て工場'
      },
      {
        id: 'syllable_workshop',
        name: '音節工房',
        icon: '🔧',
        gameComponent: 'SyllableBuilder',
        unlocked: false,
        unlockRequirement: 'CVC 100語',
        description: '多音節単語作成工房'
      }
    ]
  },
  {
    id: 'racing_circuit',
    name: 'レーシング回路',
    icon: '🏁',
    description: 'スペリング競技とタイムアタック',
    facilities: [
      {
        id: 'spell_circuit',
        name: 'スペルサーキット',
        icon: '🏎️',
        gameComponent: 'SpellRacingGame',
        route: 'word-dictation-challenge',
        unlocked: true,
        progress: 30,
        description: 'スペリング・レース・チャレンジ'
      },
      {
        id: 'dictation_dome',
        name: 'ディクテーション・ドーム',
        icon: '🎧',
        gameComponent: 'WordDictationChallenge',
        route: 'word-dictation-challenge',
        unlocked: true,
        progress: 55,
        description: '音声ディクテーション練習場'
      }
    ]
  }
])

// Learning Milestones
const learningMilestones = reactive([
  {
    id: 'beginner',
    title: '単語探検家',
    icon: '🌱',
    description: '基本単語50語をマスター',
    completed: true,
    current: false,
    progress: 100
  },
  {
    id: 'intermediate',
    title: '語彙建築士',
    icon: '🏗️',
    description: 'CVC単語と単語ファミリーを習得',
    completed: false,
    current: true,
    progress: 65
  },
  {
    id: 'advanced',
    title: 'スピードマスター',
    icon: '⚡',
    description: '高速認識50wpmを達成',
    completed: false,
    current: false,
    progress: 0
  },
  {
    id: 'expert',
    title: '単語アーキテクト',
    icon: '👑',
    description: '全施設制覇と500語習得',
    completed: false,
    current: false,
    progress: 0
  }
])

// Event Handlers
const handleBack = () => {
  router.back()
}

const handleDistrictSelection = (district) => {
  selectedDistrict.value = district
  // Add district-specific logic here
}

const handleFacilityClick = (facility) => {
  if (!facility.unlocked) {
    // Show unlock requirement modal
    return
  }

  // Navigate to the specific game
  if (facility.route) {
    router.push({ name: facility.route })
  } else if (facility.gameComponent) {
    // Handle component-based navigation
    router.push({ name: facility.gameComponent })
  }
}

// Initialize component
onMounted(() => {
  // Initialize player progress and unlock states
  updateFacilityUnlockStates()
})

const updateFacilityUnlockStates = () => {
  // Update facility unlock states based on player progress
  cityDistricts.forEach(district => {
    district.facilities.forEach(facility => {
      // Add logic to check unlock requirements
      if (facility.unlockRequirement && !facility.unlocked) {
        // Check if player meets requirements
        facility.unlocked = checkUnlockRequirements(facility.unlockRequirement)
      }
    })
  })
}

const checkUnlockRequirements = (requirement) => {
  // Parse requirement string and check against player stats
  // This is a simplified example
  if (requirement.includes('語習得')) {
    const requiredWords = parseInt(requirement.match(/\d+/)[0])
    return totalWordsLearned.value >= requiredWords
  }
  if (requirement.includes('wpm')) {
    const requiredSpeed = parseInt(requirement.match(/\d+/)[0])
    return averageSpeed.value >= requiredSpeed
  }
  return false
}
</script>

<style scoped>
/* Word Building Planet themed styles */
.word-building-background {
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  color: white;
}

/* Animated city background */
.city-skyline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to top, 
    rgba(0,0,0,0.3) 0%, 
    transparent 100%);
  background-image: 
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: city-lights 4s ease-in-out infinite;
}

.floating-words-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 40px 60px, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 120px 160px, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 190px 90px, rgba(255,255,255,0.4), transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: floating-words 6s linear infinite;
}

.word-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.1;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 98px,
    rgba(255,255,255,0.1) 100px
  );
  animation: word-particles-drift 10s linear infinite;
}

/* Word-themed components */
.word-text-primary {
  background: linear-gradient(45deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: word-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.text-word-moon-silver {
  color: #CBD5E1;
}

.word-city-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(240, 248, 255, 0.9) 100%);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.word-city-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(102, 126, 234, 0.8) 50%, 
    transparent 100%);
  animation: word-data-stream 3s linear infinite;
}

.word-button {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.3) 0%, 
    rgba(118, 75, 162, 0.3) 100%);
  border: 2px solid rgba(102, 126, 234, 0.8);
  box-shadow: 
    0 0 20px rgba(102, 126, 234, 0.4),
    inset 0 0 20px rgba(118, 75, 162, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.word-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: word-scan-line 2s linear infinite;
}

.word-button-primary {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.5) 0%, 
    rgba(118, 75, 162, 0.5) 100%);
}

.word-button-secondary {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.2) 0%, 
    rgba(118, 75, 162, 0.2) 100%);
}

.word-stats-card {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(240, 248, 255, 0.6) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  color: #1f2937;
}

.word-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: word-pulsing-glow 2s ease-in-out infinite alternate;
}

.city-title {
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
}

.district-icon {
  animation: district-float 3s ease-in-out infinite;
}

.facility-building {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(240, 248, 255, 0.8) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #374151;
}

.facility-unlocked {
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}

.facility-locked {
  opacity: 0.6;
  border-color: rgba(156, 163, 175, 0.5);
}

/* Learning Path Styles */
.learning-path {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.milestone {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.milestone-completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1));
  border: 2px solid rgba(34, 197, 94, 0.3);
}

.milestone-current {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
  border: 2px solid rgba(59, 130, 246, 0.5);
  animation: milestone-pulse 2s ease-in-out infinite;
}

.milestone-locked {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(107, 114, 128, 0.1));
  border: 2px solid rgba(156, 163, 175, 0.3);
  opacity: 0.6;
}

.milestone-icon {
  font-size: 2rem;
  min-width: 60px;
  text-align: center;
}

.milestone-content {
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Keyframe animations */
@keyframes city-lights {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

@keyframes floating-words {
  0% { background-position: 0% 0%; }
  100% { background-position: 200px 200px; }
}

@keyframes word-particles-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
}

@keyframes word-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes word-data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100vw); }
}

@keyframes word-scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes word-pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes district-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes milestone-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}
</style>