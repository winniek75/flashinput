<template>
  <div class="min-h-screen colony-background">
    <!-- Animated Colony Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="colony-dome-1"></div>
      <div class="colony-dome-2"></div>
      <div class="colony-dome-3"></div>
      <div class="connection-lines"></div>
      <div class="particle-field"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')" 
              class="colony-button colony-button-secondary px-4 py-2 rounded-xl"
            >
              <span class="text-xl">🌌</span>
              <span>Galaxy Map</span>
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="colony-stats-card">
              <span class="text-2xl">🤝</span>
              <div class="text-left">
                <div class="text-sm text-colony-gray">協力ポイント</div>
                <div class="text-xl font-bold text-colony-green">{{ cooperationPoints }}</div>
              </div>
            </div>
            <div class="colony-stats-card">
              <span class="text-2xl">👥</span>
              <div class="text-left">
                <div class="text-sm text-colony-gray">チームランク</div>
                <div class="text-xl font-bold text-colony-green">{{ teamRank }}</div>
              </div>
            </div>
            <div class="colony-stats-card">
              <span class="text-2xl">💎</span>
              <div class="text-left">
                <div class="text-sm text-colony-gray">Crystals</div>
                <div class="text-xl font-bold text-colony-green">{{ playerProfileStore.crystals }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mb-8">
          <h1 class="text-5xl md:text-6xl font-bold text-colony-green glow-text mb-4">
            🤝 Cooperation Colony
          </h1>
          <p class="text-xl text-colony-gray mb-2">
            協力型学習コロニー
          </p>
          <p class="text-base text-colony-gray/80 max-w-3xl mx-auto">
            仲間と協力して銀河最大の言語チャレンジに挑戦！AIパートナーと共に学ぼう
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pb-32">
      <!-- Multiplayer Lobby -->
      <div class="multiplayer-lobby mb-12">
        <h2 class="text-3xl font-bold text-colony-green mb-6 text-center">
          🌐 Multiplayer Lobby
        </h2>
        <div class="lobby-panel">
          <div class="lobby-status">
            <div class="status-indicator" :class="{ online: isOnline }"></div>
            <span class="status-text">{{ isOnline ? 'オンライン' : 'オフライン' }}</span>
            <span class="player-count">{{ onlinePlayers }} players online</span>
          </div>
          
          <div class="lobby-options">
            <button 
              @click="createRoom"
              class="lobby-button create-room"
            >
              <span class="button-icon">🏠</span>
              <span class="button-text">Create Room</span>
            </button>
            <button 
              @click="joinRoom"
              class="lobby-button join-room"
            >
              <span class="button-icon">🚪</span>
              <span class="button-text">Join Room</span>
            </button>
            <button 
              @click="quickMatch"
              class="lobby-button quick-match"
            >
              <span class="button-icon">⚡</span>
              <span class="button-text">Quick Match</span>
            </button>
          </div>

          <!-- Active Rooms -->
          <div class="active-rooms" v-if="activeRooms.length > 0">
            <h3 class="text-xl font-bold text-colony-green mb-4">Active Rooms</h3>
            <div class="rooms-grid">
              <div 
                v-for="room in activeRooms" 
                :key="room.id"
                @click="joinSpecificRoom(room)"
                class="room-card"
                :class="{ full: room.players >= room.maxPlayers }"
              >
                <div class="room-header">
                  <span class="room-name">{{ room.name }}</span>
                  <span class="room-game">{{ room.game }}</span>
                </div>
                <div class="room-info">
                  <span class="player-count">
                    <span class="icon">👥</span>
                    {{ room.players }}/{{ room.maxPlayers }}
                  </span>
                  <span class="room-level">
                    <span class="icon">⭐</span>
                    {{ room.level }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Partner Selection -->
      <div class="ai-partners mb-12">
        <h2 class="text-3xl font-bold text-colony-green mb-6 text-center">
          🤖 AI Partners
        </h2>
        <div class="partners-grid">
          <div 
            v-for="partner in aiPartners" 
            :key="partner.id"
            @click="selectAIPartner(partner)"
            class="partner-card"
            :class="{ selected: selectedPartner?.id === partner.id, locked: !partner.unlocked }"
          >
            <div class="partner-avatar">{{ partner.avatar }}</div>
            <h3 class="partner-name">{{ partner.name }}</h3>
            <p class="partner-specialty">{{ partner.specialty }}</p>
            <div class="partner-skills">
              <div class="skill-tag" v-for="skill in partner.skills" :key="skill">
                {{ skill }}
              </div>
            </div>
            <div class="partner-stats">
              <div class="stat">
                <span class="stat-label">協力度</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: partner.cooperation + '%' }"></div>
                </div>
              </div>
              <div class="stat">
                <span class="stat-label">支援力</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: partner.support + '%' }"></div>
                </div>
              </div>
            </div>
            <div v-if="!partner.unlocked" class="unlock-info">
              🔒 {{ partner.unlockRequirement }}
            </div>
          </div>
        </div>
      </div>

      <!-- Cooperative Games -->
      <div class="cooperative-games mb-12">
        <h2 class="text-3xl font-bold text-colony-green mb-6 text-center">
          🎮 Cooperative Missions
        </h2>
        <div class="games-grid">
          <div 
            v-for="game in cooperativeGames" 
            :key="game.id"
            @click="launchGame(game)"
            class="game-card"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <h3 class="game-title">{{ game.title }}</h3>
            <p class="game-description">{{ game.description }}</p>
            <div class="game-info">
              <span class="player-requirement">
                <span class="icon">👥</span>
                {{ game.minPlayers }}-{{ game.maxPlayers }} players
              </span>
              <span class="game-duration">
                <span class="icon">⏱️</span>
                {{ game.duration }} min
              </span>
            </div>
            <div class="game-rewards">
              <span class="reward">💎 {{ game.crystalReward }}</span>
              <span class="reward">🤝 +{{ game.cooperationPoints }}</span>
            </div>
            <div class="play-button">
              <span>PLAY {{ game.playMode }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Achievements -->
      <div class="team-achievements">
        <h2 class="text-3xl font-bold text-colony-green mb-6 text-center">
          🏆 Team Achievements
        </h2>
        <div class="achievements-panel">
          <div class="achievement-categories">
            <button 
              v-for="category in achievementCategories" 
              :key="category.id"
              @click="selectedCategory = category.id"
              class="category-tab"
              :class="{ active: selectedCategory === category.id }"
            >
              {{ category.icon }} {{ category.name }}
            </button>
          </div>
          <div class="achievements-grid">
            <div 
              v-for="achievement in filteredAchievements" 
              :key="achievement.id"
              class="achievement-card"
              :class="{ unlocked: achievement.unlocked }"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <h4 class="achievement-name">{{ achievement.name }}</h4>
              <p class="achievement-description">{{ achievement.description }}</p>
              <div class="achievement-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: achievement.progress + '%' }"
                  ></div>
                </div>
                <span class="progress-text">{{ achievement.progress }}%</span>
              </div>
              <div class="achievement-reward">
                💎 {{ achievement.reward }}
              </div>
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
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import CommonFooter from '@/components/CommonFooter.vue'

const router = useRouter()
const playerProfileStore = usePlayerProfileStore()

// Colony Stats
const cooperationPoints = ref(1250)
const teamRank = ref('A')
const isOnline = ref(true)
const onlinePlayers = ref(42)

// Selected States
const selectedPartner = ref(null)
const selectedCategory = ref('teamwork')

// Active Rooms (Mock data for demonstration)
const activeRooms = ref([
  {
    id: 1,
    name: "Grammar Masters",
    game: "Grammar Spacecraft",
    players: 3,
    maxPlayers: 4,
    level: "Intermediate"
  },
  {
    id: 2,
    name: "Sound Explorers",
    game: "Sound Radar",
    players: 2,
    maxPlayers: 2,
    level: "Advanced"
  },
  {
    id: 3,
    name: "Beginners Welcome",
    game: "Grammar Spacecraft",
    players: 1,
    maxPlayers: 4,
    level: "Beginner"
  }
])

// AI Partners
const aiPartners = ref([
  {
    id: 'helper_bot',
    name: 'Helper Bot',
    avatar: '🤖',
    specialty: 'General Support',
    skills: ['Hints', 'Encouragement', 'Basic Help'],
    cooperation: 85,
    support: 90,
    unlocked: true
  },
  {
    id: 'grammar_genius',
    name: 'Grammar Genius',
    avatar: '🎓',
    specialty: 'Grammar Expert',
    skills: ['Grammar Rules', 'Sentence Analysis', 'Error Detection'],
    cooperation: 95,
    support: 85,
    unlocked: true
  },
  {
    id: 'sound_sage',
    name: 'Sound Sage',
    avatar: '🎵',
    specialty: 'Pronunciation Master',
    skills: ['Phoneme Guide', 'Accent Coach', 'Sound Matching'],
    cooperation: 90,
    support: 88,
    unlocked: cooperationPoints.value >= 1000
  },
  {
    id: 'speed_mentor',
    name: 'Speed Mentor',
    avatar: '⚡',
    specialty: 'Speed Training',
    skills: ['Typing Tips', 'Speed Boost', 'Combo Helper'],
    cooperation: 80,
    support: 95,
    unlocked: cooperationPoints.value >= 1500,
    unlockRequirement: 'Reach 1500 Cooperation Points'
  }
])

// Cooperative Games
const cooperativeGames = ref([
  {
    id: 'grammar_spacecraft',
    title: 'Grammar Spacecraft',
    icon: '🚀',
    description: 'Build and repair spacecraft using correct grammar structures',
    minPlayers: 2,
    maxPlayers: 4,
    duration: 15,
    crystalReward: 100,
    cooperationPoints: 50,
    playMode: 'WITH PARTNER'
  },
  {
    id: 'sound_radar',
    title: 'Sound Radar Game',
    icon: '📡',
    description: 'Work together to detect and match phonemes on the radar',
    minPlayers: 2,
    maxPlayers: 2,
    duration: 10,
    crystalReward: 75,
    cooperationPoints: 40,
    playMode: 'DUET MODE'
  },
  {
    id: 'vocabulary_relay',
    title: 'Vocabulary Relay',
    icon: '🏃',
    description: 'Pass vocabulary challenges in a relay race format',
    minPlayers: 3,
    maxPlayers: 6,
    duration: 20,
    crystalReward: 150,
    cooperationPoints: 75,
    playMode: 'TEAM MODE'
  },
  {
    id: 'sentence_builders',
    title: 'Sentence Builders',
    icon: '🏗️',
    description: 'Collaborate to construct complex sentences together',
    minPlayers: 2,
    maxPlayers: 4,
    duration: 12,
    crystalReward: 90,
    cooperationPoints: 45,
    playMode: 'CO-OP MODE'
  }
])

// Achievement Categories
const achievementCategories = ref([
  { id: 'teamwork', name: 'Teamwork', icon: '🤝' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'support', name: 'Support', icon: '🛡️' },
  { id: 'mastery', name: 'Mastery', icon: '⭐' }
])

// Achievements
const achievements = ref([
  {
    id: 'first_cooperation',
    category: 'teamwork',
    name: 'First Cooperation',
    icon: '🤝',
    description: 'Complete your first cooperative game',
    progress: 100,
    unlocked: true,
    reward: 50
  },
  {
    id: 'perfect_sync',
    category: 'teamwork',
    name: 'Perfect Sync',
    icon: '⚡',
    description: 'Achieve 100% synchronization in a game',
    progress: 75,
    unlocked: false,
    reward: 100
  },
  {
    id: 'helpful_partner',
    category: 'support',
    name: 'Helpful Partner',
    icon: '🛡️',
    description: 'Help teammates 50 times',
    progress: 60,
    unlocked: false,
    reward: 75
  },
  {
    id: 'communication_master',
    category: 'communication',
    name: 'Communication Master',
    icon: '💬',
    description: 'Use all communication features effectively',
    progress: 40,
    unlocked: false,
    reward: 150
  }
])

// Computed
const filteredAchievements = computed(() => {
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

// Methods
const createRoom = () => {
  // Implement room creation logic
  logger.log('Creating room...')
  router.push({ 
    name: 'cooperation-room-create',
    query: { mode: 'create' }
  })
}

const joinRoom = () => {
  // Implement room joining logic
  logger.log('Joining room...')
}

const quickMatch = () => {
  // Implement quick match logic
  logger.log('Finding match...')
  // Simulate finding a match
  setTimeout(() => {
    launchGame(cooperativeGames.value[0])
  }, 2000)
}

const joinSpecificRoom = (room) => {
  if (room.players < room.maxPlayers) {
    logger.log('Joining room:', room.name)
    router.push({
      name: 'cooperation-game',
      params: { gameId: room.game.toLowerCase().replace(/\s+/g, '-') },
      query: { roomId: room.id }
    })
  }
}

const selectAIPartner = (partner) => {
  if (partner.unlocked) {
    selectedPartner.value = partner
  }
}

const launchGame = (game) => {
  const gameRoutes = {
    'grammar_spacecraft': 'grammar-spacecraft',
    'sound_radar': 'sound-radar-game',
    'vocabulary_relay': 'vocabulary-relay',
    'sentence_builders': 'sentence-builders'
  }
  
  const routeName = gameRoutes[game.id]
  if (routeName) {
    router.push({
      name: routeName,
      query: { 
        partner: selectedPartner.value?.id || 'helper_bot',
        mode: 'cooperative'
      }
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

// Lifecycle
onMounted(() => {
  // Start checking online status
  checkOnlineStatus()
  // Set default AI partner
  selectedPartner.value = aiPartners.value[0]
})

const checkOnlineStatus = () => {
  // Mock online status check
  setInterval(() => {
    onlinePlayers.value = Math.floor(Math.random() * 50) + 20
  }, 30000)
}
</script>

<style scoped>
/* Colony Theme */
.colony-background {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated Colony Domes */
.colony-dome-1,
.colony-dome-2,
.colony-dome-3 {
  position: absolute;
  border: 2px solid rgba(52, 211, 153, 0.3);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%);
}

.colony-dome-1 {
  width: 600px;
  height: 600px;
  top: -300px;
  left: -300px;
  animation: pulse 4s ease-in-out infinite;
}

.colony-dome-2 {
  width: 800px;
  height: 800px;
  bottom: -400px;
  right: -400px;
  animation: pulse 6s ease-in-out infinite;
  animation-delay: 2s;
}

.colony-dome-3 {
  width: 400px;
  height: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 5s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.3;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.6;
  }
}

/* Connection Lines */
.connection-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, transparent 49%, rgba(52, 211, 153, 0.1) 49%, rgba(52, 211, 153, 0.1) 51%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, rgba(52, 211, 153, 0.1) 49%, rgba(52, 211, 153, 0.1) 51%, transparent 51%);
  background-size: 100px 100px;
  animation: move-lines 20s linear infinite;
}

@keyframes move-lines {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

/* Particle Field */
.particle-field {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle-field::before,
.particle-field::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 
    10px 10px #34d399, 20px 20px #34d399, 30px 30px #34d399,
    40px 40px #34d399, 50px 50px #34d399, 60px 60px #34d399,
    70px 70px #34d399, 80px 80px #34d399, 90px 90px #34d399;
  animation: float-particles 10s linear infinite;
}

.particle-field::after {
  left: 50%;
  animation-delay: 5s;
}

@keyframes float-particles {
  0% { transform: translateY(100vh) rotate(0deg); }
  100% { transform: translateY(-100vh) rotate(360deg); }
}

/* Colony Colors */
:root {
  --colony-green: #34d399;
  --colony-dark-green: #065f46;
  --colony-light-green: #6ee7b7;
  --colony-gray: #9ca3af;
  --colony-panel: rgba(6, 78, 59, 0.9);
}

/* Text Styles */
.text-colony-green { color: var(--colony-green); }
.text-colony-gray { color: var(--colony-gray); }

.glow-text {
  text-shadow: 0 0 20px var(--colony-green), 0 0 40px var(--colony-light-green);
}

/* Colony Buttons */
.colony-button {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(110, 231, 183, 0.2) 100%);
  border: 2px solid var(--colony-green);
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.colony-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.colony-button:hover::before {
  opacity: 1;
}

.colony-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(52, 211, 153, 0.5);
}

.colony-button-secondary {
  background: rgba(30, 41, 59, 0.8);
  border-color: var(--colony-gray);
}

/* Stats Cards */
.colony-stats-card {
  background: var(--colony-panel);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.colony-stats-card:hover {
  border-color: var(--colony-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.3);
}

/* Multiplayer Lobby */
.lobby-panel {
  background: var(--colony-panel);
  border: 2px solid rgba(52, 211, 153, 0.3);
  border-radius: 24px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.lobby-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  animation: blink 2s ease-in-out infinite;
}

.status-indicator.online {
  background: var(--colony-green);
  animation: none;
  box-shadow: 0 0 10px var(--colony-green);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-weight: bold;
  color: var(--colony-green);
}

.player-count {
  margin-left: auto;
  color: var(--colony-gray);
}

.lobby-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.lobby-button {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(110, 231, 183, 0.2) 100%);
  border: 2px solid var(--colony-green);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lobby-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(52, 211, 153, 0.4);
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(110, 231, 183, 0.3) 100%);
}

.button-icon {
  font-size: 2rem;
}

.button-text {
  font-weight: bold;
  color: white;
}

/* Active Rooms */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.room-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-card:hover {
  border-color: var(--colony-green);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.3);
}

.room-card.full {
  opacity: 0.6;
  cursor: not-allowed;
}

.room-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.room-name {
  font-weight: bold;
  color: var(--colony-green);
}

.room-game {
  font-size: 0.875rem;
  color: var(--colony-gray);
}

.room-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--colony-gray);
}

.room-info .icon {
  margin-right: 0.25rem;
}

/* AI Partners */
.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.partner-card {
  background: var(--colony-panel);
  border: 2px solid rgba(52, 211, 153, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.partner-card:hover {
  transform: translateY(-5px);
  border-color: var(--colony-green);
  box-shadow: 0 10px 30px rgba(52, 211, 153, 0.4);
}

.partner-card.selected {
  border-color: var(--colony-green);
  background: rgba(52, 211, 153, 0.1);
  box-shadow: 0 0 30px rgba(52, 211, 153, 0.5);
}

.partner-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.partner-avatar {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.partner-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--colony-green);
  margin-bottom: 0.25rem;
}

.partner-specialty {
  color: var(--colony-gray);
  margin-bottom: 1rem;
}

.partner-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.skill-tag {
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid var(--colony-green);
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: var(--colony-light-green);
}

.partner-stats {
  margin-bottom: 1rem;
}

.stat {
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--colony-gray);
  display: block;
  margin-bottom: 0.25rem;
}

.stat-bar {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.stat-fill {
  background: linear-gradient(90deg, var(--colony-green) 0%, var(--colony-light-green) 100%);
  height: 100%;
  transition: width 0.5s ease;
}

.unlock-info {
  font-size: 0.875rem;
  color: #fbbf24;
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

/* Cooperative Games */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.game-card {
  background: var(--colony-panel);
  border: 2px solid rgba(52, 211, 153, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: var(--colony-green);
  box-shadow: 0 10px 30px rgba(52, 211, 153, 0.4);
}

.game-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.game-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--colony-green);
  margin-bottom: 0.5rem;
}

.game-description {
  color: var(--colony-gray);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.game-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--colony-gray);
}

.game-info .icon {
  margin-right: 0.25rem;
}

.game-rewards {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.play-button {
  background: linear-gradient(135deg, var(--colony-green) 0%, var(--colony-light-green) 100%);
  color: var(--colony-dark-green);
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.game-card:hover .play-button {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(52, 211, 153, 0.5);
}

/* Team Achievements */
.achievements-panel {
  background: var(--colony-panel);
  border: 2px solid rgba(52, 211, 153, 0.3);
  border-radius: 24px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.achievement-categories {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.category-tab {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  color: var(--colony-gray);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tab:hover {
  border-color: var(--colony-green);
  color: white;
}

.category-tab.active {
  background: rgba(52, 211, 153, 0.2);
  border-color: var(--colony-green);
  color: white;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(52, 211, 153, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  border-color: var(--colony-green);
  background: rgba(52, 211, 153, 0.1);
}

.achievement-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.achievement-name {
  font-weight: bold;
  color: var(--colony-green);
  margin-bottom: 0.5rem;
}

.achievement-description {
  font-size: 0.875rem;
  color: var(--colony-gray);
  margin-bottom: 1rem;
}

.achievement-progress {
  margin-bottom: 1rem;
}

.progress-bar {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, var(--colony-green) 0%, var(--colony-light-green) 100%);
  height: 100%;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--colony-gray);
}

.achievement-reward {
  font-size: 0.875rem;
  color: #fbbf24;
}

/* Responsive Design */
@media (max-width: 768px) {
  .partners-grid {
    grid-template-columns: 1fr;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .achievement-categories {
    flex-wrap: wrap;
  }
}
</style>