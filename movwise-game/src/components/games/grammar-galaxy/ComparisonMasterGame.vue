<template>
  <div class="min-h-screen space-command-center">
    <!-- Animated Space Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
      <div class="nebula-particles"></div>
      <div class="floating-asteroids"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/grammar-galaxy-hub')" 
              class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50 space-station-button"
            >
              <span class="text-xl">🌌</span>
              <span class="text-sm text-slate-300">グラマー銀河</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="space-stats-card">
              <span class="text-2xl cosmic-glow">🚀</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">艦隊レベル</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ fleetLevel }}</div>
              </div>
            </div>
            <div class="space-stats-card">
              <span class="text-2xl cosmic-glow">📊</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">ステーション復旧率</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ Math.round(accuracy * 100) }}%</div>
              </div>
            </div>
            <div class="space-stats-card">
              <span class="text-2xl cosmic-glow">💎</span>
              <div class="text-left">
                <div class="text-sm text-galaxy-moon-silver">宇宙資源</div>
                <div class="text-xl font-bold galaxy-text-primary">{{ totalSpaceResources }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-cyan-400 cosmic-title mb-4">
            🛸 Comparison Command Center
          </h1>
          <p class="text-xl mb-2 text-slate-300">
            比較センサー宇宙ステーション
          </p>
          <p class="text-base text-slate-400 max-w-3xl mx-auto">
            失われた比較技術を復活させ、宇宙艦隊を築いて銀河を制覇せよ！
          </p>
        </div>
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'playing'">
      <div class="max-w-4xl mx-auto">

        <!-- Progress Bar -->
        <div class="galaxy-card p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold galaxy-text-primary">バトル進行状況</h3>
            <div class="text-lg font-bold">{{ currentRound }}/{{ totalRounds }}</div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill comparison" 
                :style="{ width: (currentRound / totalRounds) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Comparison Command Center -->
        <div class="command-center-card p-8 mb-8">
          <div class="comparison-arena">
            <!-- Mission Display -->
            <div class="mission-display mb-8">
              <div class="mission-type-badge" :class="currentMission?.type">
                {{ getMissionTypeName(currentMission?.type) }}
              </div>
              <div class="audio-controls mb-4">
                <button 
                  @click="playMissionAudio" 
                  class="audio-play-button"
                  :disabled="isPlayingAudio"
                >
                  <span v-if="!isPlayingAudio">🔊 ミッション音声再生</span>
                  <span v-else>⏸️ 再生中...</span>
                </button>
              </div>
              <h2 class="mission-text">{{ currentMission?.scenario }}</h2>
            </div>

            <!-- Spaceship Comparison Display -->
            <div class="spaceship-comparison-area mb-8">
              <div class="comparison-ships">
                <div 
                  v-for="ship in currentMission?.visualShips" 
                  :key="ship.id"
                  class="spaceship-display"
                  :class="ship.size"
                >
                  <div class="ship-icon">{{ ship.icon }}</div>
                  <div class="ship-type">{{ ship.type }}</div>
                  <div class="ship-beam" v-if="ship.id === 1"></div>
                </div>
              </div>
              <div class="comparison-beam-center">
                <div class="comparison-sensor">📡</div>
                <div class="sensor-text">比較センサー</div>
              </div>
            </div>

            <!-- Answer Options -->
            <div class="answer-options">
              <div 
                v-for="option in currentMission?.options" 
                :key="option.id"
                class="option-card"
                :class="{ 
                  'selected': selectedAnswer === option.id,
                  'correct': showResult && option.isCorrect,
                  'incorrect': showResult && selectedAnswer === option.id && !option.isCorrect
                }"
                @click="selectAnswer(option.id)"
              >
                <div class="option-header">
                  <div class="option-ship">{{ option.shipUpgrade ? '🚀' : '⚪' }}</div>
                  <div class="option-power">{{ option.shipUpgrade || 'データなし' }}</div>
                </div>
                <div class="option-content">
                  <div class="option-text">{{ option.text }}</div>
                  <button 
                    @click.stop="playOptionAudio(option.audio)"
                    class="audio-mini-button"
                    :disabled="isPlayingAudio"
                  >
                    🔊
                  </button>
                </div>
                <div class="option-footer" v-if="showResult && option.isCorrect">
                  <div class="success-effect">🛸 新しい宇宙船獲得！ 🛸</div>
                </div>
              </div>
            </div>

            <!-- Mission Effects -->
            <div class="mission-effects" v-if="showMissionEffect">
              <div class="effect-animation" :class="lastResult">
                {{ getMissionEffectText() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Fleet & Station Status -->
        <div class="fleet-status-card p-6">
          <h3 class="section-title mb-4">🚀 宇宙艦隊状態</h3>
          <div class="fleet-grid">
            <div class="fleet-item">
              <div class="fleet-icon">🛸</div>
              <div class="fleet-content">
                <div class="fleet-label">収集した宇宙船</div>
                <div class="fleet-value">{{ collectedShips.length }}</div>
              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-icon">🌌</div>
              <div class="fleet-content">
                <div class="fleet-label">制覇した惑星</div>
                <div class="fleet-value">{{ conqueredPlanets }}</div>
              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-icon">🔥</div>
              <div class="fleet-content">
                <div class="fleet-label">連続ミッション成功</div>
                <div class="fleet-value">{{ streak }}</div>
              </div>
            </div>
            <div class="fleet-item">
              <div class="fleet-icon">✨</div>
              <div class="fleet-content">
                <div class="fleet-label">ステーションレベル</div>
                <div class="fleet-value">{{ stationLevel }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Spaceship Collection Display -->
        <div class="spaceship-collection-card p-6" v-if="collectedShips.length > 0">
          <h3 class="section-title mb-4">🛠️ 宇宙艦隊ドック</h3>
          <div class="ship-collection-grid">
            <div 
              v-for="ship in collectedShips" 
              :key="ship.id"
              class="collected-ship"
              :class="ship.rarity"
            >
              <div class="ship-display-icon">{{ ship.icon }}</div>
              <div class="ship-name">{{ ship.name }}</div>
              <div class="ship-class">{{ ship.class }}</div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Mission Setup -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'setup'">
      <div class="max-w-2xl mx-auto">
        <div class="command-center-card p-8">
          <h2 class="text-2xl font-bold galaxy-text-primary text-center mb-8">🛸 ミッション設定</h2>
          
          <div class="mission-options">
            <div class="option-group">
              <label class="option-label">🌌 惑星ミッション難易度:</label>
              <div class="planet-buttons">
                <button 
                  v-for="planet in missionPlanets" 
                  :key="planet.id"
                  class="planet-btn"
                  :class="{ 'selected': selectedPlanet === planet.id }"
                  @click="selectedPlanet = planet.id"
                >
                  <div class="planet-icon">{{ planet.icon }}</div>
                  <div class="planet-name">{{ planet.name }}</div>
                  <div class="planet-desc">{{ planet.description }}</div>
                </button>
              </div>
            </div>
            
            <div class="option-group">
              <label class="option-label">🚀 探索ミッションタイプ:</label>
              <div class="mission-buttons">
                <button 
                  v-for="mission in missionTypes" 
                  :key="mission.id"
                  class="mission-btn"
                  :class="{ 'selected': selectedMissionType === mission.id }"
                  @click="selectedMissionType = mission.id"
                >
                  <div class="mission-icon">{{ mission.icon }}</div>
                  <div class="mission-name">{{ mission.name }}</div>
                  <div class="mission-rounds">{{ mission.rounds }}ミッション</div>
                </button>
              </div>
            </div>
          </div>
          
          <button 
            class="space-button space-button-primary w-full mt-8"
            @click="startMission"
          >
            🛸 ミッション開始！
          </button>
        </div>
      </div>
    </main>

    <!-- Results Screen -->
    <main class="relative z-10 px-6 pb-32" v-if="gameState === 'completed'">
      <div class="max-w-2xl mx-auto">
        <div class="galaxy-card p-8 text-center">
          <div class="result-crown mb-6">
            <div class="crown-icon">{{ getFinalRankIcon() }}</div>
            <h2 class="result-title">{{ getFinalRankTitle() }}</h2>
          </div>
          
          <div class="final-stats-grid">
            <div class="final-stat">
              <div class="stat-number">{{ Math.round(accuracy * 100) }}%</div>
              <div class="stat-label">正答率</div>
            </div>
            <div class="final-stat">
              <div class="stat-number">{{ totalScore }}</div>
              <div class="stat-label">総スコア</div>
            </div>
            <div class="final-stat">
              <div class="stat-number">{{ maxStreak }}</div>
              <div class="stat-label">最高連続正解</div>
            </div>
            <div class="final-stat">
              <div class="stat-number">{{ totalExp }}</div>
              <div class="stat-label">獲得EXP</div>
            </div>
          </div>
          
          <div class="achievement-section" v-if="newAchievements.length > 0">
            <h3 class="achievement-title">🏆 新しい称号を獲得！</h3>
            <div class="achievement-list">
              <div 
                v-for="achievement in newAchievements" 
                :key="achievement.id"
                class="achievement-badge"
              >
                <div class="badge-icon">{{ achievement.icon }}</div>
                <div class="badge-name">{{ achievement.name }}</div>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button 
              class="galaxy-button galaxy-button-primary"
              @click="playAgain"
            >
              🔄 もう一度プレイ
            </button>
            <button 
              class="galaxy-button galaxy-button-secondary"
              @click="$router.push('/grammar-galaxy-hub')"
            >
              🌌 文法銀河に戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Common Footer -->
    <CommonFooter 
      :active="'grammar'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameAudio } from '@/composables/useGameAudio'
import CommonFooter from '@/components/CommonFooter.vue'

// Web Speech API support check
const speechSynthesis = window.speechSynthesis
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance

export default {
  name: 'ComparisonMasterGame',
  components: {
    CommonFooter
  },
  setup() {
    const router = useRouter()
    const { playEffectSound } = useGameAudio()

    // Game State
    const gameState = ref('setup') // setup, playing, completed
    const currentRound = ref(1)
    const totalRounds = ref(10)
    const selectedAnswer = ref(null)
    const showResult = ref(false)
    const showMissionEffect = ref(false)
    const lastResult = ref('')
    const isPlayingAudio = ref(false)

    // Mission Configuration
    const selectedPlanet = ref('size_planet')
    const selectedMissionType = ref('quick_exploration')
    
    // Space Fleet Tracking
    const totalScore = ref(0)
    const streak = ref(0)
    const maxStreak = ref(0)
    const wins = ref(0)
    const stationLevel = ref(1)
    const fleetLevel = ref(1)
    const totalSpaceResources = ref(0)
    const correctAnswers = ref(0)
    const totalQuestions = ref(0)
    const newAchievements = ref([])
    const conqueredPlanets = ref(0)
    const collectedShips = ref([])

    // Current Mission
    const currentMission = ref(null)

    // Mission Configuration Options
    const missionPlanets = [
      {
        id: 'size_planet',
        name: '🌌 サイズ惑星',
        icon: '🌌',
        description: 'big/small/huge/tiny サイズ比較ミッション'
      },
      {
        id: 'speed_planet', 
        name: '⚡ スピード惑星',
        icon: '⚡',
        description: 'fast/slow/faster/fastest 速度比較ミッション'
      },
      {
        id: 'beauty_planet',
        name: '✨ 美しさ惑星',
        icon: '✨',
        description: 'beautiful/more beautiful 美しさ比較ミッション'
      }
    ]

    const missionTypes = [
      {
        id: 'quick_exploration',
        name: 'クイック探索',
        icon: '🛸',
        rounds: 10
      },
      {
        id: 'deep_space_mission',
        name: '深宇宙ミッション',
        icon: '🚀',
        rounds: 20
      },
      {
        id: 'galaxy_conquest',
        name: '銀河制覇',
        icon: '🌌',
        rounds: 50
      }
    ]

    // Space Mission Database
    const spaceshipMissions = {
      size_planet: [
        {
          type: 'spaceship_comparison',
          scenario: '宇宙船サイズ比較ミッション',
          audioPrompt: 'This spaceship is [BLANK] than that one',
          visualShips: [
            { id: 1, type: 'big_cruiser', size: 'large', icon: '🚀' },
            { id: 2, type: 'small_scout', size: 'small', icon: '🛸' }
          ],
          options: [
            { id: 1, text: 'bigger', audio: 'bigger', shipUpgrade: '🚀 Scout Ship', isCorrect: true },
            { id: 2, text: 'smaller', audio: 'smaller', shipUpgrade: null, isCorrect: false },
            { id: 3, text: 'faster', audio: 'faster', shipUpgrade: null, isCorrect: false },
            { id: 4, text: 'slower', audio: 'slower', shipUpgrade: null, isCorrect: false }
          ]
        },
        {
          type: 'fleet_comparison',
          scenario: '艦隊最大サイズ識別ミッション',
          audioPrompt: 'Which ship is the [BLANK] in our fleet?',
          visualShips: [
            { id: 1, type: 'mothership', size: 'huge', icon: '🌌' },
            { id: 2, type: 'cruiser', size: 'medium', icon: '🚀' },
            { id: 3, type: 'scout', size: 'small', icon: '🛸' }
          ],
          options: [
            { id: 1, text: 'biggest', audio: 'biggest', shipUpgrade: '🌌 Mothership', isCorrect: true },
            { id: 2, text: 'smallest', audio: 'smallest', shipUpgrade: null, isCorrect: false },
            { id: 3, text: 'fastest', audio: 'fastest', shipUpgrade: null, isCorrect: false },
            { id: 4, text: 'strongest', audio: 'strongest', shipUpgrade: null, isCorrect: false }
          ]
        }
      ],
      speed_planet: [
        {
          type: 'speed_comparison',
          scenario: '宇宙船速度比較ミッション',
          audioPrompt: 'The scout ship is [BLANK] than the cruiser',
          visualShips: [
            { id: 1, type: 'fast_scout', size: 'small', icon: '⚡' },
            { id: 2, type: 'slow_cruiser', size: 'large', icon: '🚀' }
          ],
          options: [
            { id: 1, text: 'faster', audio: 'faster', shipUpgrade: '⚡ Lightning Scout', isCorrect: true },
            { id: 2, text: 'slower', audio: 'slower', shipUpgrade: null, isCorrect: false },
            { id: 3, text: 'bigger', audio: 'bigger', shipUpgrade: null, isCorrect: false },
            { id: 4, text: 'smaller', audio: 'smaller', shipUpgrade: null, isCorrect: false }
          ]
        }
      ],
      beauty_planet: [
        {
          type: 'beauty_comparison',
          scenario: '宇宙船デザイン比較ミッション',
          audioPrompt: 'This starship is [BLANK] than the old model',
          visualShips: [
            { id: 1, type: 'elegant_starship', size: 'medium', icon: '✨' },
            { id: 2, type: 'old_ship', size: 'medium', icon: '🛸' }
          ],
          options: [
            { id: 1, text: 'more beautiful', audio: 'more beautiful', shipUpgrade: '✨ Crystal Starship', isCorrect: true },
            { id: 2, text: 'less beautiful', audio: 'less beautiful', shipUpgrade: null, isCorrect: false },
            { id: 3, text: 'most beautiful', audio: 'most beautiful', shipUpgrade: null, isCorrect: false },
            { id: 4, text: 'very beautiful', audio: 'very beautiful', shipUpgrade: null, isCorrect: false }
          ]
        }
      ]
    }

    // Audio System Functions
    const playMissionAudio = async () => {
      if (!currentMission.value || isPlayingAudio.value) return
      
      isPlayingAudio.value = true
      try {
        const utterance = new SpeechSynthesisUtterance(currentMission.value.audioPrompt)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1.0
        
        utterance.onend = () => {
          isPlayingAudio.value = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.warn('Speech synthesis not available:', error)
        isPlayingAudio.value = false
      }
    }

    const playOptionAudio = async (text) => {
      if (isPlayingAudio.value) return
      
      isPlayingAudio.value = true
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.9
        utterance.pitch = 1.1
        
        utterance.onend = () => {
          isPlayingAudio.value = false
        }
        
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.warn('Speech synthesis not available:', error)
        isPlayingAudio.value = false
      }
    }

    // Computed Properties
    const accuracy = computed(() => {
      return totalQuestions.value > 0 ? correctAnswers.value / totalQuestions.value : 0
    })

    // Methods
    const startMission = async () => {
      await playEffectSound('gameStart')
      gameState.value = 'playing'
      totalRounds.value = missionTypes.find(m => m.id === selectedMissionType.value)?.rounds || 10
      resetMissionStats()
      loadNextMission()
    }


    const loadNextMission = () => {
      if (currentRound.value > totalRounds.value) {
        endMission()
        return
      }

      const planet = selectedPlanet.value
      const missionPool = spaceshipMissions[planet] || spaceshipMissions.size_planet
      const randomMission = missionPool[Math.floor(Math.random() * missionPool.length)]
      
      currentMission.value = { ...randomMission }
      selectedAnswer.value = null
      showResult.value = false
      showMissionEffect.value = false
      
      // Auto-play mission audio after a short delay
      nextTick(() => {
        setTimeout(() => {
          playMissionAudio()
        }, 1000)
      })
    }

    const selectAnswer = async (optionId) => {
      if (showResult.value) return

      selectedAnswer.value = optionId
      showResult.value = true
      totalQuestions.value++

      const selectedOption = currentMission.value.options.find(opt => opt.id === optionId)
      const isCorrect = selectedOption?.isCorrect || false

      if (isCorrect) {
        correctAnswers.value++
        wins.value++
        streak.value++
        maxStreak.value = Math.max(maxStreak.value, streak.value)
        const baseReward = 100
        const streakBonus = streak.value * 20
        totalSpaceResources.value += baseReward + streakBonus
        lastResult.value = 'victory'
        
        // Add new spaceship to collection
        if (selectedOption.shipUpgrade) {
          const newShip = createNewSpaceship(selectedOption.shipUpgrade)
          if (!collectedShips.value.find(ship => ship.id === newShip.id)) {
            collectedShips.value.push(newShip)
          }
        }
        
        await playEffectSound('correct')
      } else {
        streak.value = 0
        lastResult.value = 'defeat'
        await playEffectSound('incorrect')
      }

      showMissionEffect.value = true

      // Check for station level up
      if (totalSpaceResources.value >= stationLevel.value * 200) {
        stationLevel.value++
        fleetLevel.value = Math.floor(collectedShips.value.length / 3) + 1
        await playEffectSound('levelUp')
      }

      // Auto advance after delay
      setTimeout(() => {
        currentRound.value++
        loadNextMission()
      }, 2500)
    }

    const createNewSpaceship = (shipType) => {
      const shipId = `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const ships = {
        '🚀 Scout Ship': { id: shipId, name: 'Scout Ship', class: '早期探索艦', icon: '🚀', rarity: 'common' },
        '🌌 Mothership': { id: shipId, name: 'Mothership', class: '母艦', icon: '🌌', rarity: 'legendary' },
        '⚡ Lightning Scout': { id: shipId, name: 'Lightning Scout', class: '電光石火', icon: '⚡', rarity: 'rare' },
        '✨ Crystal Starship': { id: shipId, name: 'Crystal Starship', class: '水晶星艦', icon: '✨', rarity: 'epic' }
      }
      return ships[shipType] || { id: shipId, name: 'Unknown Ship', class: '未確認', icon: '🛸', rarity: 'common' }
    }

    const endMission = async () => {
      gameState.value = 'completed'
      
      // Calculate conquered planets based on performance
      const newConqueredPlanets = Math.floor(accuracy.value * 3)
      conqueredPlanets.value += newConqueredPlanets
      
      checkAchievements()
      await playEffectSound('complete')
    }

    const checkAchievements = () => {
      const achievements = []
      
      if (accuracy.value >= 0.95) {
        achievements.push({ id: 'space_commander', icon: '👑', name: '宇宙司令官' })
      }
      if (accuracy.value >= 0.9) {
        achievements.push({ id: 'fleet_admiral', icon: '🏆', name: '艦隊提督' })
      }
      if (maxStreak.value >= 10) {
        achievements.push({ id: 'mission_master', icon: '🔥', name: 'ミッションマスター' })
      }
      if (collectedShips.value.length >= 5) {
        achievements.push({ id: 'ship_collector', icon: '🚀', name: '宇宙船コレクター' })
      }
      if (stationLevel.value >= 5) {
        achievements.push({ id: 'station_engineer', icon: '✨', name: 'ステーションエンジニア' })
      }
      if (conqueredPlanets.value >= 3) {
        achievements.push({ id: 'planet_conqueror', icon: '🌌', name: '惑星制覇者' })
      }
      
      newAchievements.value = achievements
    }

    const playAgain = () => {
      gameState.value = 'setup'
      resetMissionStats()
    }

    const resetMissionStats = () => {
      currentRound.value = 1
      totalScore.value = 0
      streak.value = 0
      wins.value = 0
      correctAnswers.value = 0
      totalQuestions.value = 0
      newAchievements.value = []
      // Note: Keep collected ships and station level for persistence
    }

    const getMissionTypeName = (type) => {
      const names = {
        spaceship_comparison: '🚀 宇宙船比較ミッション',
        fleet_comparison: '🌌 艦隊比較ミッション',
        speed_comparison: '⚡ 速度比較ミッション',
        beauty_comparison: '✨ デザイン比較ミッション'
      }
      return names[type] || '🛸 ミッション'
    }

    const getMissionEffectText = () => {
      if (lastResult.value === 'victory') {
        const selectedOption = currentMission.value?.options?.find(opt => opt.id === selectedAnswer.value)
        const reward = 100 + (streak.value * 20)
        return `🛸 ミッション成功！ +${reward}宇宙資源 ${selectedOption?.shipUpgrade ? '+ 新宇宙船' : ''}`
      } else {
        return '💥 ミッション失敗... 次のミッションでリベンジ！'
      }
    }

    const getFinalRankIcon = () => {
      if (accuracy.value >= 0.95) return '👑'
      if (accuracy.value >= 0.85) return '🥇'
      if (accuracy.value >= 0.75) return '🥈'
      if (accuracy.value >= 0.65) return '🥉'
      return '🎯'
    }

    const getFinalRankTitle = () => {
      if (accuracy.value >= 0.95) return 'Comparison Master!'
      if (accuracy.value >= 0.85) return 'Comparison Expert!'
      if (accuracy.value >= 0.75) return 'Comparison Scholar!'
      if (accuracy.value >= 0.65) return 'Comparison Student!'
      return 'Keep Learning!'
    }

    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure');
          break;
        case 'grammar':
          router.push('/grammar-galaxy-hub');
          break;
        case 'multi-layer':
          router.push('/multi-layer');
          break;
        case 'co-pilot':
          router.push('/co-pilot-dock');
          break;
        case 'vr-academy':
          router.push('/vr-academy');
          break;
        default:
          console.warn('Unknown navigation section:', section);
      }
    };

    // Lifecycle
    onMounted(() => {
      console.log('Comparison Master Game loaded')
    })

    return {
      // State
      gameState,
      currentRound,
      totalRounds,
      selectedAnswer,
      showResult,
      showMissionEffect,
      lastResult,
      selectedPlanet,
      selectedMissionType,
      currentMission,
      isPlayingAudio,
      
      // Configuration
      missionPlanets,
      missionTypes,
      
      // Fleet & Space Stats
      totalScore,
      streak,
      maxStreak,
      wins,
      stationLevel,
      fleetLevel,
      totalSpaceResources,
      correctAnswers,
      totalQuestions,
      newAchievements,
      conqueredPlanets,
      collectedShips,
      accuracy,
      
      // Methods
      startMission,
      selectAnswer,
      playAgain,
      playMissionAudio,
      playOptionAudio,
      getMissionTypeName,
      getMissionEffectText,
      getFinalRankIcon,
      getFinalRankTitle,
      handleFooterNavigation
    }
  }
}
</script>

<style scoped>
/* Base Styles - Space Command Center */
.space-command-center {
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Enhanced Space Background */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #00d4ff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 30px 100px, #00ffea, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 3s infinite;
  opacity: 0.4;
}

.stars-layer-2 {
  background-size: 350px 350px;
  animation-delay: 1s;
  opacity: 0.3;
}

.stars-layer-3 {
  background-size: 500px 500px;
  animation-delay: 2s;
  opacity: 0.2;
}

.nebula-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 60%, rgba(255, 0, 150, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0, 255, 234, 0.06) 0%, transparent 50%);
  animation: nebulaFloat 15s infinite ease-in-out;
}

.floating-asteroids {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(3px 3px at 15% 25%, rgba(150, 150, 150, 0.6), transparent),
              radial-gradient(2px 2px at 85% 75%, rgba(200, 200, 200, 0.4), transparent),
              radial-gradient(4px 4px at 60% 40%, rgba(180, 180, 180, 0.3), transparent);
  animation: asteroidDrift 20s infinite linear;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.8; }
  100% { opacity: 0.3; }
}

@keyframes nebulaFloat {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  33% { transform: translateX(30px) rotate(120deg); }
  66% { transform: translateX(-20px) rotate(240deg); }
}

@keyframes asteroidDrift {
  0% { transform: translateX(-100px); }
  100% { transform: translateX(calc(100vw + 100px)); }
}

/* Space Station Components */
.space-stats-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.1), rgba(0, 100, 200, 0.05));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(25px);
  box-shadow: 
    0 0 20px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.space-stats-card:hover {
  border-color: rgba(0, 212, 255, 0.6);
  box-shadow: 
    0 0 30px rgba(0, 212, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.space-station-button {
  transition: all 0.3s ease;
}

.space-station-button:hover {
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
  border-color: rgba(0, 212, 255, 0.5);
}

.cosmic-glow {
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
}

.galaxy-text-primary {
  color: #fbbf24;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-title {
  background: linear-gradient(45deg, #00d4ff, #00ffea, #0066cc, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 300% 300%;
  filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.5));
  animation: titleShimmer 3s infinite ease-in-out;
}

@keyframes titleShimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Command Center Cards */
.command-center-card {
  background: linear-gradient(145deg, 
    rgba(10, 10, 15, 0.95), 
    rgba(20, 30, 60, 0.9));
  border: 2px solid rgba(0, 212, 255, 0.4);
  border-radius: 25px;
  backdrop-filter: blur(30px);
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 212, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.command-center-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(0, 212, 255, 0.1), 
    transparent);
  animation: scanLine 3s infinite;
}

.command-center-card:hover {
  border-color: rgba(0, 212, 255, 0.7);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(0, 212, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

@keyframes scanLine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.fleet-status-card {
  background: linear-gradient(145deg, 
    rgba(20, 30, 60, 0.9), 
    rgba(10, 10, 30, 0.95));
  border: 2px solid rgba(0, 255, 234, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(25px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(0, 255, 234, 0.1);
}

.spaceship-collection-card {
  background: linear-gradient(145deg, 
    rgba(30, 20, 60, 0.9), 
    rgba(20, 10, 40, 0.95));
  border: 2px solid rgba(255, 0, 150, 0.4);
  border-radius: 20px;
  backdrop-filter: blur(25px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 0, 150, 0.1);
}

/* Progress Bar */
.progress-bar-container {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill.comparison {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  height: 100%;
  transition: width 0.3s ease;
}

/* Comparison Arena */
.comparison-arena {
  position: relative;
  padding: 20px;
}

.mission-display {
  text-align: center;
  margin-bottom: 30px;
}

.mission-type-badge {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 15px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 100, 200, 0.3));
  border: 2px solid rgba(0, 212, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
  animation: missionPulse 2s infinite ease-in-out;
}

.mission-type-badge.spaceship_comparison {
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}

.mission-type-badge.fleet_comparison {
  border-color: #00ffea;
  box-shadow: 0 0 15px rgba(0, 255, 234, 0.3);
}

.mission-type-badge.speed_comparison {
  border-color: #ff0096;
  box-shadow: 0 0 15px rgba(255, 0, 150, 0.3);
}

.mission-type-badge.beauty_comparison {
  border-color: #8b5cf6;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

.mission-text {
  font-size: 1.6rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

@keyframes missionPulse {
  0%, 100% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.2); }
  50% { box-shadow: 0 0 25px rgba(0, 212, 255, 0.4); }
}

/* Spaceship Comparison Display */
.spaceship-comparison-area {
  margin: 30px 0;
  text-align: center;
}

.comparison-ships {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.spaceship-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 15px;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.1), rgba(0, 100, 200, 0.05));
  border: 2px solid rgba(0, 212, 255, 0.3);
  transition: all 0.5s ease;
  position: relative;
}

.spaceship-display.large {
  transform: scale(1.3);
  animation: hoverLarge 3s infinite ease-in-out;
}

.spaceship-display.medium {
  transform: scale(1.1);
  animation: hoverMedium 3s infinite ease-in-out 0.5s;
}

.spaceship-display.small {
  transform: scale(0.8);
  animation: hoverSmall 3s infinite ease-in-out 1s;
}

.spaceship-display.huge {
  transform: scale(1.5);
  animation: hoverHuge 3s infinite ease-in-out;
}

.ship-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.5));
}

.ship-type {
  font-size: 0.9rem;
  color: #00d4ff;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.comparison-beam-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.comparison-sensor {
  font-size: 2rem;
  animation: sensorRotate 2s infinite linear;
  filter: drop-shadow(0 0 15px rgba(0, 255, 234, 0.7));
}

.sensor-text {
  font-size: 0.8rem;
  color: #00ffea;
  margin-top: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes hoverLarge {
  0%, 100% { transform: scale(1.3) translateY(0); }
  50% { transform: scale(1.3) translateY(-8px); }
}

@keyframes hoverMedium {
  0%, 100% { transform: scale(1.1) translateY(0); }
  50% { transform: scale(1.1) translateY(-6px); }
}

@keyframes hoverSmall {
  0%, 100% { transform: scale(0.8) translateY(0); }
  50% { transform: scale(0.8) translateY(-4px); }
}

@keyframes hoverHuge {
  0%, 100% { transform: scale(1.5) translateY(0); }
  50% { transform: scale(1.5) translateY(-10px); }
}

@keyframes sensorRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Answer Options */
.answer-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.option-card {
  background: linear-gradient(145deg, 
    rgba(10, 10, 30, 0.9), 
    rgba(20, 30, 60, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 18px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(25px);
  position: relative;
  overflow: hidden;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(0, 212, 255, 0.1), 
    transparent);
  transition: left 0.5s ease;
}

.option-card:hover::before {
  left: 100%;
}

.option-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.6);
}

.option-card.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, 
    rgba(0, 255, 234, 0.15), 
    rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 25px rgba(0, 255, 234, 0.3);
}

.option-card.correct {
  border-color: #10b981;
  background: linear-gradient(145deg, 
    rgba(16, 185, 129, 0.2), 
    rgba(0, 150, 100, 0.15));
  animation: victoryPulse 1.5s ease-out;
}

.option-card.incorrect {
  border-color: #ef4444;
  background: linear-gradient(145deg, 
    rgba(239, 68, 68, 0.2), 
    rgba(200, 50, 50, 0.15));
  animation: defeatShake 0.8s ease-out;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.option-ship {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
}

.option-power {
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.option-content {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.option-text {
  font-size: 1.4rem;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.audio-mini-button {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.2), rgba(0, 200, 200, 0.3));
  border: 1px solid rgba(0, 255, 234, 0.4);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.audio-mini-button:hover {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.3), rgba(0, 200, 200, 0.4));
  box-shadow: 0 0 15px rgba(0, 255, 234, 0.4);
  transform: scale(1.1);
}

.audio-mini-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-footer {
  margin-top: 15px;
  text-align: center;
}

.success-effect {
  color: #10b981;
  font-weight: bold;
  font-size: 1.1rem;
  animation: sparkle 1.5s infinite;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Audio Controls */
.audio-controls {
  text-align: center;
  margin-bottom: 20px;
}

.audio-play-button {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 100, 200, 0.3));
  border: 2px solid rgba(0, 212, 255, 0.5);
  border-radius: 25px;
  padding: 12px 24px;
  color: #00d4ff;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  font-size: 1rem;
}

.audio-play-button:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 100, 200, 0.4));
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
  transform: translateY(-2px);
}

.audio-play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  animation: audioPlaying 1s infinite ease-in-out;
}

@keyframes audioPlaying {
  0%, 100% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 25px rgba(0, 212, 255, 0.6); }
}

/* Mission Effects */
.mission-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 15;
}

.effect-animation {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  animation: missionEffect 2.5s ease-out forwards;
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 2px solid;
}

.effect-animation.victory {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.5);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.1));
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.effect-animation.defeat {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.5);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(200, 50, 50, 0.1));
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

/* Fleet Status Display */
.section-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d4ff;
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.fleet-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.1), rgba(0, 200, 200, 0.05));
  border-radius: 15px;
  border: 2px solid rgba(0, 255, 234, 0.3);
  transition: all 0.3s ease;
}

.fleet-item:hover {
  border-color: rgba(0, 255, 234, 0.5);
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.2);
  transform: translateY(-3px);
}

.fleet-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 0 10px rgba(0, 255, 234, 0.5));
}

.fleet-content {
  flex: 1;
}

.fleet-label {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fleet-value {
  font-size: 1.6rem;
  font-weight: bold;
  color: #00ffea;
  text-shadow: 0 0 8px rgba(0, 255, 234, 0.4);
}

/* Spaceship Collection */
.ship-collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.collected-ship {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(255, 0, 150, 0.1), rgba(200, 0, 120, 0.05));
  border: 2px solid rgba(255, 0, 150, 0.3);
  transition: all 0.3s ease;
}

.collected-ship:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 10px 25px rgba(255, 0, 150, 0.2);
  border-color: rgba(255, 0, 150, 0.5);
}

.collected-ship.common {
  border-color: rgba(150, 150, 150, 0.4);
}

.collected-ship.rare {
  border-color: rgba(0, 150, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.2);
}

.collected-ship.epic {
  border-color: rgba(150, 0, 255, 0.4);
  box-shadow: 0 0 15px rgba(150, 0, 255, 0.2);
}

.collected-ship.legendary {
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
  animation: legendaryGlow 2s infinite ease-in-out;
}

.ship-display-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 8px rgba(255, 0, 150, 0.4));
}

.ship-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff0096;
  margin-bottom: 4px;
  text-align: center;
}

.ship-class {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  opacity: 0.8;
}

@keyframes legendaryGlow {
  0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.2); }
  50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.4); }
}

/* Mission Setup Options */
.mission-options {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.option-label {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
  text-align: center;
}

.planet-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.planet-btn {
  padding: 25px;
  background: linear-gradient(145deg, rgba(10, 10, 30, 0.9), rgba(20, 30, 60, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.4s ease;
  text-align: center;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.planet-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.planet-btn:hover::before {
  left: 100%;
}

.planet-btn:hover,
.planet-btn.selected {
  border-color: #00d4ff;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.15), rgba(0, 100, 200, 0.1));
  box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
  transform: translateY(-5px);
}

.planet-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.4));
}

.planet-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 8px;
}

.planet-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.3;
}

.mission-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.mission-btn {
  padding: 20px;
  background: linear-gradient(145deg, rgba(20, 30, 60, 0.9), rgba(10, 10, 30, 0.8));
  border: 2px solid rgba(0, 255, 234, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s ease;
  text-align: center;
  backdrop-filter: blur(20px);
}

.mission-btn:hover,
.mission-btn.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.15), rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
  transform: translateY(-3px);
}

.mission-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 234, 0.4));
}

.mission-name {
  font-weight: bold;
  color: #00ffea;
  margin-bottom: 6px;
  font-size: 1rem;
}

.mission-rounds {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Results Screen */
.result-crown {
  margin-bottom: 30px;
}

.crown-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.result-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fbbf24;
}

.final-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.final-stat {
  text-align: center;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 15px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 8px;
}

.achievement-section {
  margin: 30px 0;
  padding: 20px;
  background: rgba(251, 191, 36, 0.1);
  border: 2px solid #fbbf24;
  border-radius: 15px;
}

.achievement-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fbbf24;
  text-align: center;
  margin-bottom: 15px;
}

.achievement-list {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.achievement-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 12px;
  border: 1px solid #fbbf24;
}

.badge-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: #fbbf24;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Space Station Buttons */
.space-button {
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.4s ease;
  text-decoration: none;
  display: inline-block;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.space-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.space-button:hover::before {
  left: 100%;
}

.space-button-primary {
  background: linear-gradient(135deg, #00d4ff, #0066cc);
  color: white;
  border: 2px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.space-button-primary:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.4);
  transform: translateY(-3px);
  border-color: rgba(0, 212, 255, 0.6);
}

.space-button-secondary {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.2), rgba(0, 200, 200, 0.3));
  color: #00ffea;
  border: 2px solid rgba(0, 255, 234, 0.4);
}

.space-button-secondary:hover {
  background: linear-gradient(135deg, rgba(0, 255, 234, 0.3), rgba(0, 200, 200, 0.4));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
  transform: translateY(-2px);
}

/* Enhanced Animations */
@keyframes victoryPulse {
  0% { transform: scale(1); }
  25% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
  50% { transform: scale(1.08); box-shadow: 0 0 50px rgba(16, 185, 129, 0.8); }
  75% { transform: scale(1.05); box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
  100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
}

@keyframes defeatShake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-8px) rotate(-1deg); }
  20% { transform: translateX(8px) rotate(1deg); }
  30% { transform: translateX(-6px) rotate(-1deg); }
  40% { transform: translateX(6px) rotate(1deg); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
}

@keyframes missionEffect {
  0% { 
    opacity: 0; 
    transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); 
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1) rotate(0deg);
  }
  80% { 
    opacity: 1; 
    transform: translate(-50%, -50%) scale(1) rotate(0deg); 
  }
  100% { 
    opacity: 0; 
    transform: translate(-50%, -50%) scale(0.8) rotate(5deg); 
  }
}

@keyframes sparkle {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  25% { 
    opacity: 0.7; 
    transform: scale(1.05); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.1); 
  }
  75% { 
    opacity: 0.8; 
    transform: scale(1.05); 
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .answer-options {
    grid-template-columns: 1fr;
  }
  
  .fleet-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .planet-buttons {
    grid-template-columns: 1fr;
  }
  
  .mission-buttons {
    grid-template-columns: 1fr;
  }
  
  .ship-collection-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .comparison-ships {
    flex-direction: column;
    gap: 20px;
  }
  
  .final-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .space-stats-card {
    padding: 10px 12px;
  }
  
  .option-content {
    flex-direction: column;
    gap: 10px;
  }
}
</style>