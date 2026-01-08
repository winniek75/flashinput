<template>
  <div class="min-h-screen speed-station-background">
    <!-- Animated Space Station Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="station-ring-1"></div>
      <div class="station-ring-2"></div>
      <div class="station-ring-3"></div>
      <div class="stars-layer"></div>
      <div class="data-streams"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')" 
              class="station-button station-button-secondary px-4 py-2 rounded-xl"
            >
              <span class="text-xl">🌌</span>
              <span>Galaxy Map</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="station-stats-card">
              <span class="text-2xl">⚡</span>
              <div class="text-left">
                <div class="text-sm text-station-silver">Speed</div>
                <div class="text-xl font-bold text-station-cyan">{{ averageWPM }} WPM</div>
              </div>
            </div>
            <div class="station-stats-card">
              <span class="text-2xl">🎯</span>
              <div class="text-left">
                <div class="text-sm text-station-silver">Accuracy</div>
                <div class="text-xl font-bold text-station-cyan">{{ averageAccuracy }}%</div>
              </div>
            </div>
            <div class="station-stats-card">
              <span class="text-2xl">💎</span>
              <div class="text-left">
                <div class="text-sm text-station-silver">Crystals</div>
                <div class="text-xl font-bold text-station-cyan">{{ playerProfileStore.crystals }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-5xl md:text-6xl font-bold text-station-cyan glow-text mb-4">
            ⌨️ Speed Station
          </h1>
          <p class="text-xl text-station-silver mb-2">
            ハイスピード・タイピング宇宙ステーション
          </p>
          <p class="text-base text-station-silver/80 max-w-3xl mx-auto">
            光速タイピングで銀河を駆け抜け、言語の壁を突破せよ！
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pb-32">
      <!-- Central Command Center -->
      <div class="station-central-command mb-12">
        <div class="command-center-panel p-8">
          <h2 class="text-3xl font-bold text-station-cyan mb-6 text-center">
            🚀 Central Command
          </h2>
          
          <!-- Typing Arena Enhanced Access -->
          <div class="command-grid">
            <div 
              @click="launchTypingArena"
              class="command-module main-module"
            >
              <div class="module-icon">⚔️</div>
              <h3 class="module-title">Typing Arena Enhanced</h3>
              <p class="module-description">メインタイピングバトルアリーナ</p>
              <div class="module-stats">
                <span>🏆 Best: {{ bestArenaScore }}</span>
                <span>📊 Sessions: {{ arenaSessions }}</span>
              </div>
              <div class="launch-button">
                <span>LAUNCH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Station Crew System -->
      <div class="crew-system mb-12">
        <h2 class="text-3xl font-bold text-station-cyan mb-6 text-center">
          👥 Station Crew
        </h2>
        <div class="crew-grid">
          <div 
            v-for="crew in stationCrew" 
            :key="crew.id"
            class="crew-card"
            :class="{ active: crew.active, locked: !crew.unlocked }"
          >
            <div class="crew-icon">{{ crew.icon }}</div>
            <h4 class="crew-name">{{ crew.name }}</h4>
            <p class="crew-role">{{ crew.role }}</p>
            <div class="crew-skills">
              <div v-for="skill in crew.skills" :key="skill.name" class="skill-badge">
                <span class="skill-icon">{{ skill.icon }}</span>
                <span class="skill-value">+{{ skill.value }}%</span>
              </div>
            </div>
            <div v-if="!crew.unlocked" class="unlock-requirement">
              🔒 {{ crew.requirement }}
            </div>
          </div>
        </div>
      </div>

      <!-- Training Modules -->
      <div class="training-modules mb-12">
        <h2 class="text-3xl font-bold text-station-cyan mb-6 text-center">
          🎯 Training Modules
        </h2>
        <div class="modules-grid">
          <div 
            v-for="module in trainingModules" 
            :key="module.id"
            @click="selectModule(module)"
            class="training-module"
            :class="{ completed: module.completed }"
          >
            <div class="module-header">
              <span class="module-icon">{{ module.icon }}</span>
              <h3 class="module-name">{{ module.name }}</h3>
            </div>
            <div class="module-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: module.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ module.progress }}%</span>
            </div>
            <div class="module-rewards">
              <span>💎 {{ module.crystalReward }}</span>
              <span>⚡ +{{ module.speedBonus }} WPM</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard Terminal -->
      <div class="leaderboard-terminal">
        <h2 class="text-3xl font-bold text-station-cyan mb-6 text-center">
          🏆 Galaxy Speed Rankings
        </h2>
        <div class="terminal-screen">
          <div class="terminal-header">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span class="terminal-title">SPEED_RANKINGS.exe</span>
          </div>
          <div class="terminal-content">
            <div 
              v-for="(player, index) in leaderboard" 
              :key="player.id"
              class="ranking-entry"
              :class="{ 'current-player': player.isCurrentPlayer }"
            >
              <span class="rank">#{{ index + 1 }}</span>
              <span class="player-name">{{ player.name }}</span>
              <span class="player-crew">{{ player.crew }}</span>
              <span class="player-wpm">{{ player.wpm }} WPM</span>
              <span class="player-accuracy">{{ player.accuracy }}%</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <CommonFooter @navigate="handleFooterNavigation" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { useTypingArenaStore } from '@/stores/typingArenaStore'
import CommonFooter from '@/components/CommonFooter.vue'

const router = useRouter()
const playerProfileStore = usePlayerProfileStore()
const typingArenaStore = useTypingArenaStore()

// Station Stats
const averageWPM = computed(() => {
  const stats = typingArenaStore.getSessionStats()
  return stats.averageWPM || 0
})

const averageAccuracy = computed(() => {
  const stats = typingArenaStore.getSessionStats()
  return Math.round(stats.averageAccuracy || 0)
})

const bestArenaScore = computed(() => {
  return typingArenaStore.highScores.story[0]?.score || 0
})

const arenaSessions = computed(() => {
  return typingArenaStore.totalSessions || 0
})

// Station Crew System
const stationCrew = ref([
  {
    id: 'speed_specialist',
    name: 'Velocity',
    icon: '⚡',
    role: 'Speed Specialist',
    unlocked: true,
    active: true,
    skills: [
      { name: 'speed', icon: '⚡', value: 15 },
      { name: 'combo', icon: '🔥', value: 10 }
    ],
    requirement: 'Default Crew'
  },
  {
    id: 'accuracy_expert',
    name: 'Precision',
    icon: '🎯',
    role: 'Accuracy Expert',
    unlocked: averageAccuracy.value >= 90,
    active: false,
    skills: [
      { name: 'accuracy', icon: '🎯', value: 20 },
      { name: 'points', icon: '💎', value: 15 }
    ],
    requirement: '90% Average Accuracy'
  },
  {
    id: 'endurance_master',
    name: 'Marathon',
    icon: '🏃',
    role: 'Endurance Master',
    unlocked: arenaSessions.value >= 10,
    active: false,
    skills: [
      { name: 'stamina', icon: '💪', value: 25 },
      { name: 'recovery', icon: '❤️', value: 20 }
    ],
    requirement: 'Complete 10 Sessions'
  },
  {
    id: 'combo_champion',
    name: 'Blaze',
    icon: '🔥',
    role: 'Combo Champion',
    unlocked: typingArenaStore.character.maxCombo >= 50,
    active: false,
    skills: [
      { name: 'combo', icon: '🔥', value: 30 },
      { name: 'multiplier', icon: '✨', value: 25 }
    ],
    requirement: '50 Combo Streak'
  }
])

// Training Modules
const trainingModules = ref([
  {
    id: 'basic_speed',
    name: 'Basic Speed Training',
    icon: '🎮',
    progress: 100,
    completed: true,
    crystalReward: 50,
    speedBonus: 5
  },
  {
    id: 'accuracy_focus',
    name: 'Accuracy Focus',
    icon: '🎯',
    progress: 75,
    completed: false,
    crystalReward: 75,
    speedBonus: 3
  },
  {
    id: 'combo_mastery',
    name: 'Combo Mastery',
    icon: '🔥',
    progress: 45,
    completed: false,
    crystalReward: 100,
    speedBonus: 7
  },
  {
    id: 'endurance_challenge',
    name: 'Endurance Challenge',
    icon: '💪',
    progress: 20,
    completed: false,
    crystalReward: 150,
    speedBonus: 10
  }
])

// Leaderboard
const leaderboard = ref([
  { id: 1, name: 'SpeedDemon', crew: 'Velocity', wpm: 145, accuracy: 98 },
  { id: 2, name: 'TypeMaster', crew: 'Precision', wpm: 138, accuracy: 99 },
  { id: 3, name: 'KeyboardNinja', crew: 'Blaze', wpm: 132, accuracy: 96 },
  { id: 4, name: playerProfileStore.username || 'You', crew: 'Velocity', wpm: averageWPM.value, accuracy: averageAccuracy.value, isCurrentPlayer: true },
  { id: 5, name: 'RapidTyper', crew: 'Marathon', wpm: 125, accuracy: 94 }
])

// Methods
const launchTypingArena = () => {
  router.push({ name: 'typing-arena-enhanced' })
}

const selectModule = (module) => {
  if (!module.completed) {
    // Launch specific training mode
    router.push({ 
      name: 'typing-arena-enhanced',
      query: { mode: 'training', module: module.id }
    })
  }
}

const handleFooterNavigation = (section) => {
  switch (section) {
    case 'sound':
      router.push({ name: 'SoundAdventureHub' })
      break
    case 'grammar':
      router.push({ name: 'grammar-galaxy-hub' })
      break
    case 'multi-layer':
      router.push({ name: 'MultiLayerHub' })
      break
    case 'co-pilot':
      router.push({ name: 'CoPilotDock' })
      break
    case 'vr-academy':
      router.push({ name: 'VRAcademy' })
      break
    default:
      router.push({ name: 'home' })
  }
}

onMounted(() => {
  // Initialize station data
  if (typingArenaStore.initializeStore) {
    typingArenaStore.initializeStore()
  }
})
</script>

<style scoped>
/* Speed Station Theme */
.speed-station-background {
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f3460 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated Station Rings */
.station-ring-1,
.station-ring-2,
.station-ring-3 {
  position: absolute;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 50%;
  animation: rotate 60s linear infinite;
}

.station-ring-1 {
  width: 800px;
  height: 800px;
  top: -400px;
  left: -400px;
}

.station-ring-2 {
  width: 1200px;
  height: 1200px;
  top: -600px;
  right: -600px;
  animation-direction: reverse;
  animation-duration: 90s;
}

.station-ring-3 {
  width: 600px;
  height: 600px;
  bottom: -300px;
  left: 50%;
  transform: translateX(-50%);
  animation-duration: 45s;
}

/* Data Streams */
.data-streams {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent);
  background-size: 50px 50px;
  animation: data-flow 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes data-flow {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* Stars */
.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 30px 100px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Station UI Colors */
:root {
  --station-cyan: #00ffff;
  --station-blue: #0080ff;
  --station-dark: #0a0a0f;
  --station-silver: #94a3b8;
  --station-panel: rgba(15, 23, 42, 0.9);
}

/* Text Styles */
.text-station-cyan { color: var(--station-cyan); }
.text-station-silver { color: var(--station-silver); }

.glow-text {
  text-shadow: 0 0 20px var(--station-cyan), 0 0 40px var(--station-blue);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Station Buttons */
.station-button {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 128, 255, 0.2) 100%);
  border: 2px solid var(--station-cyan);
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.station-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.3s;
}

.station-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.5);
}

.station-button:hover::before {
  animation: shine 0.5s ease;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.station-button-secondary {
  background: rgba(30, 41, 59, 0.8);
  border-color: var(--station-silver);
}

/* Stats Cards */
.station-stats-card {
  background: var(--station-panel);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.station-stats-card:hover {
  border-color: var(--station-cyan);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

/* Command Center */
.command-center-panel {
  background: var(--station-panel);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.command-center-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--station-cyan) 50%, 
    transparent 100%);
  animation: scan-line 3s linear infinite;
}

@keyframes scan-line {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.command-grid {
  display: grid;
  gap: 2rem;
}

.command-module {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
  border: 2px solid rgba(0, 255, 255, 0.4);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.command-module:hover {
  transform: scale(1.05);
  border-color: var(--station-cyan);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.module-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.module-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--station-cyan);
  margin-bottom: 0.5rem;
}

.module-description {
  color: var(--station-silver);
  margin-bottom: 1rem;
}

.module-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--station-silver);
}

.launch-button {
  background: linear-gradient(135deg, var(--station-cyan) 0%, var(--station-blue) 100%);
  color: var(--station-dark);
  font-weight: bold;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  display: inline-block;
  transition: all 0.3s ease;
}

.command-module:hover .launch-button {
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.5);
}

/* Crew System */
.crew-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.crew-card {
  background: var(--station-panel);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.crew-card.active {
  border-color: var(--station-cyan);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.crew-card.locked {
  opacity: 0.6;
  filter: grayscale(50%);
}

.crew-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.crew-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--station-cyan);
  margin-bottom: 0.25rem;
}

.crew-role {
  color: var(--station-silver);
  margin-bottom: 1rem;
}

.crew-skills {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.skill-badge {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid var(--station-cyan);
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.unlock-requirement {
  font-size: 0.875rem;
  color: #fbbf24;
  margin-top: 0.5rem;
}

/* Training Modules */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.training-module {
  background: var(--station-panel);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.training-module:hover {
  transform: translateY(-5px);
  border-color: var(--station-cyan);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.training-module.completed {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.module-header .module-icon {
  font-size: 2rem;
}

.module-name {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--station-cyan);
}

.module-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, var(--station-cyan) 0%, var(--station-blue) 100%);
  height: 100%;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--station-silver);
}

.module-rewards {
  display: flex;
  justify-content: space-around;
  font-size: 0.875rem;
  color: var(--station-silver);
}

/* Leaderboard Terminal */
.leaderboard-terminal {
  margin-top: 3rem;
}

.terminal-screen {
  background: #0a0a0f;
  border: 2px solid var(--station-cyan);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

.terminal-header {
  background: #1a1a2e;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--station-cyan);
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dot.red { background: #ff5f56; }
.terminal-dot.yellow { background: #ffbd2e; }
.terminal-dot.green { background: #27c93f; }

.terminal-title {
  margin-left: auto;
  font-size: 0.875rem;
  color: var(--station-cyan);
  font-family: monospace;
}

.terminal-content {
  padding: 1.5rem;
  font-family: monospace;
}

.ranking-entry {
  display: grid;
  grid-template-columns: 50px 200px 100px 100px 80px;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.ranking-entry:hover {
  background: rgba(0, 255, 255, 0.1);
}

.ranking-entry.current-player {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid var(--station-cyan);
  border-radius: 8px;
  margin: 0.5rem 0;
}

.rank {
  color: var(--station-cyan);
  font-weight: bold;
}

.player-name {
  color: white;
}

.player-crew {
  color: var(--station-silver);
}

.player-wpm {
  color: #fbbf24;
  text-align: right;
}

.player-accuracy {
  color: #10b981;
  text-align: right;
}

/* Responsive Design */
@media (max-width: 768px) {
  .crew-grid {
    grid-template-columns: 1fr;
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-entry {
    grid-template-columns: 40px 1fr 80px 60px;
    font-size: 0.875rem;
  }
  
  .player-crew {
    display: none;
  }
}
</style>