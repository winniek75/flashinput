<template>
  <div class="ending-credits" :class="{ 'credits-active': isActive }">
    <!-- Background -->
    <div class="credits-background">
      <div class="stars-layer"></div>
      <div class="galaxy-particles"></div>
    </div>

    <!-- Credits Content -->
    <div class="credits-content" ref="creditsContainer">
      <!-- Title -->
      <div class="credits-title">
        <h1>{{ endingData?.title || 'Language Galaxy Adventure' }}</h1>
        <p>{{ endingData?.subtitle || '言語学習の冒険をありがとう' }}</p>
      </div>

      <!-- Player Appreciation -->
      <div class="player-section">
        <h2>Special Thanks</h2>
        <div class="player-name">{{ playerName }}</div>
        <div class="player-stats" v-if="playerStats">
          <div class="stat-item">
            <span class="stat-label">総プレイ時間</span>
            <span class="stat-value">{{ formatPlayTime(playerStats.totalPlayTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">言語習得レベル</span>
            <span class="stat-value">{{ Math.round(playerStats.overallMastery) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最高の仲間</span>
            <span class="stat-value">{{ getBestFriend() }}</span>
          </div>
        </div>
      </div>

      <!-- Character Cast -->
      <div class="character-cast">
        <h2>Character Cast</h2>
        <div class="cast-list">
          <div v-for="character in mainCharacters" :key="character.id" class="cast-member">
            <div class="character-portrait">
              <img :src="character.portrait" :alt="character.name" />
            </div>
            <div class="character-info">
              <h3>{{ character.name }}</h3>
              <p>{{ character.title }}</p>
              <div class="character-message" v-if="character.farewell">
                "{{ character.farewell }}"
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Development Team -->
      <div class="development-team">
        <h2>Development Team</h2>
        <div class="team-section">
          <h3>Game Design</h3>
          <p>Language Galaxy Studio</p>
        </div>
        <div class="team-section">
          <h3>Character Design</h3>
          <p>Character Arts Division</p>
        </div>
        <div class="team-section">
          <h3>Story & Dialogue</h3>
          <p>Narrative Team</p>
        </div>
        <div class="team-section">
          <h3>Music & Sound</h3>
          <p>Audio Production Team</p>
        </div>
        <div class="team-section">
          <h3>Programming</h3>
          <p>Technical Development Team</p>
        </div>
        <div class="team-section">
          <h3>Special Effects</h3>
          <p>Visual Effects Department</p>
        </div>
      </div>

      <!-- Special Acknowledgments -->
      <div class="special-acknowledgments">
        <h2>Special Acknowledgments</h2>
        <div class="acknowledgment-list">
          <p>すべての言語学習者へ</p>
          <p>教育の未来を信じるすべての人へ</p>
          <p>技術と創造性の融合を支える開発者コミュニティへ</p>
          <p>そして、最後まで共に冒険してくれた{{ playerName }}へ</p>
        </div>
      </div>

      <!-- Ending Specific Content -->
      <div class="ending-specific" v-if="endingData">
        <h2>{{ endingData.title }}</h2>
        <div v-for="thanks in endingData.credits?.special_thanks || []" :key="thanks" class="special-thanks">
          {{ thanks.replace('{playerName}', playerName) }}
        </div>
      </div>

      <!-- Music Credits -->
      <div class="music-credits">
        <h2>Music</h2>
        <div class="music-track" v-for="track in musicTracks" :key="track.id">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-info">{{ track.info }}</div>
        </div>
      </div>

      <!-- Technology & Tools -->
      <div class="technology-section">
        <h2>Built With</h2>
        <div class="tech-list">
          <p>Vue.js 3 - Progressive Web Framework</p>
          <p>TypeScript - Type-Safe Development</p>
          <p>GSAP - Animation Library</p>
          <p>Web Audio API - Sound Processing</p>
          <p>Canvas API - Visual Effects</p>
          <p>Progressive Web App Technology</p>
        </div>
      </div>

      <!-- Final Message -->
      <div class="final-message">
        <h2>Thank You</h2>
        <div class="message-content">
          <p>言語学習は終わりのない冒険です</p>
          <p>この体験があなたの学習の旅の</p>
          <p>新しい始まりとなりますように</p>
          <br>
          <p class="signature">
            From everyone at Language Galaxy Studio<br>
            with love and appreciation
          </p>
        </div>
      </div>

      <!-- Logo -->
      <div class="studio-logo">
        <div class="logo-container">
          <h1>Language Galaxy Studio</h1>
          <p>Learning Through Adventure</p>
        </div>
      </div>
    </div>

    <!-- Credits Controls -->
    <div class="credits-controls" v-if="showControls">
      <button @click="pauseCredits" class="control-btn">
        {{ isPaused ? '再生' : '一時停止' }}
      </button>
      <button @click="skipCredits" class="control-btn">
        スキップ
      </button>
      <div class="credits-progress">
        <div class="progress-bar" :style="{ width: `${creditsProgress}%` }"></div>
      </div>
    </div>

    <!-- Particle Effects -->
    <div class="credits-particles" ref="particlesContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { endingSystem } from '@/story/endings/EndingSystem'
import { characterDatabase } from '@/story/characters/CharacterDatabase'
import type { EndingData } from '@/story/endings/EndingSystem'

interface Props {
  endingType?: string
  playerName?: string
  autoStart?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  playerName: 'Captain Nova',
  autoStart: true,
  showControls: true
})

const emit = defineEmits<{
  creditsComplete: []
  creditsSkipped: []
}>()

// Reactive state
const isActive = ref(false)
const isPaused = ref(false)
const creditsProgress = ref(0)
const creditsContainer = ref<HTMLElement>()
const particlesContainer = ref<HTMLElement>()

// Timeline
let creditsTimeline: gsap.core.Timeline | null = null

// Data
const endingData = computed((): EndingData | null => {
  if (!props.endingType) return null
  return endingSystem.getEndingByType(props.endingType as any)
})

const playerStats = computed(() => {
  return endingSystem.currentPlayerStats
})

const mainCharacters = computed(() => {
  const characters = characterDatabase.getAllCharacters()
  return characters.map(character => ({
    ...character,
    portrait: `/images/characters/${character.id}_portrait.jpg`,
    farewell: getFarewellMessage(character.id)
  }))
})

const musicTracks = ref([
  { id: 'main_theme', name: 'Language Galaxy Main Theme', info: 'Composed by Audio Team' },
  { id: 'sound_planet', name: 'Sound Planet Melody', info: 'Phonics Learning Theme' },
  { id: 'word_planet', name: 'Word Planet Symphony', info: 'Vocabulary Adventure Music' },
  { id: 'grammar_planet', name: 'Grammar Planet Harmonies', info: 'Structural Learning Theme' },
  { id: 'speed_station', name: 'Speed Station Beat', info: 'High-Energy Typing Music' },
  { id: 'cooperation_colony', name: 'Cooperation Colony Ensemble', info: 'Teamwork & Unity Theme' },
  { id: 'climax_theme', name: 'Climax & Resolution', info: 'Epic Finale Music' },
  { id: 'ending_theme', name: 'Eternal Journey', info: 'Ending Credits Theme' }
])

// Methods
const startCredits = () => {
  if (!creditsContainer.value) return
  
  isActive.value = true
  createCreditsTimeline()
  startParticleEffects()
}

const createCreditsTimeline = () => {
  if (!creditsContainer.value) return
  
  creditsTimeline = gsap.timeline({
    onUpdate: () => {
      creditsProgress.value = (creditsTimeline!.progress() * 100)
    },
    onComplete: () => {
      emit('creditsComplete')
    }
  })
  
  // Scroll credits upward
  const totalHeight = creditsContainer.value.scrollHeight
  
  creditsTimeline.to(creditsContainer.value, {
    y: -totalHeight - window.innerHeight,
    duration: 120, // 2 minutes
    ease: 'none'
  })
  
  // Fade in sections progressively
  const sections = creditsContainer.value.querySelectorAll('div[class*="section"], .credits-title, .player-section, .character-cast, .development-team')
  
  sections.forEach((section, index) => {
    const delay = index * 8 // 8 seconds per section
    creditsTimeline.fromTo(section, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 2, ease: 'power2.out' },
      delay
    )
  })
}

const startParticleEffects = () => {
  if (!particlesContainer.value) return
  
  const createParticle = () => {
    const particle = document.createElement('div')
    particle.className = 'credit-particle'
    particle.textContent = ['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)]
    particle.style.position = 'absolute'
    particle.style.left = `${Math.random() * 100}%`
    particle.style.top = '100%'
    particle.style.fontSize = `${0.8 + Math.random() * 0.8}rem`
    particle.style.pointerEvents = 'none'
    particle.style.zIndex = '10'
    
    particlesContainer.value!.appendChild(particle)
    
    gsap.to(particle, {
      y: -window.innerHeight - 100,
      x: `+=${(Math.random() - 0.5) * 200}`,
      rotation: Math.random() * 360,
      opacity: 0,
      duration: 8 + Math.random() * 4,
      ease: 'power1.out',
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }
    })
  }
  
  // Create particles periodically
  const particleInterval = setInterval(() => {
    if (isActive.value && !isPaused.value) {
      createParticle()
    }
  }, 1000)
  
  // Clean up on unmount
  onUnmounted(() => {
    clearInterval(particleInterval)
  })
}

const pauseCredits = () => {
  if (!creditsTimeline) return
  
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    creditsTimeline.pause()
  } else {
    creditsTimeline.play()
  }
}

const skipCredits = () => {
  if (creditsTimeline) {
    creditsTimeline.kill()
  }
  emit('creditsSkipped')
}

const formatPlayTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`
  }
  return `${minutes}分`
}

const getBestFriend = (): string => {
  if (!playerStats.value) return 'みんな'
  
  let bestCharacter = 'みんな'
  let maxRelationship = 0
  
  playerStats.value.characterRelationships.forEach((value, key) => {
    if (value > maxRelationship) {
      maxRelationship = value
      bestCharacter = characterDatabase.getCharacter(key)?.name || key
    }
  })
  
  return bestCharacter
}

const getFarewellMessage = (characterId: string): string => {
  const farewells: Record<string, string> = {
    'captain_nova': 'また新しい冒険で会おう！',
    'professor_phonix': '音の世界は無限じゃ',
    'lexia': 'もっとたくさんの言葉を集めようね！',
    'grammar_guardian': '美しい構造をありがとう',
    'speed_racer': '次は絶対勝負だ！',
    'unity': '調和の心を忘れずに',
    'aura': 'データベース更新：「永遠の友情」',
    'the_translator': 'あなたのおかげで...ありがとう'
  }
  
  return farewells[characterId] || 'ありがとう！'
}

// Lifecycle
onMounted(() => {
  if (props.autoStart) {
    startCredits()
  }
})

onUnmounted(() => {
  if (creditsTimeline) {
    creditsTimeline.kill()
  }
})

// Watchers
watch(() => props.autoStart, (newValue) => {
  if (newValue && !isActive.value) {
    startCredits()
  }
})

// Expose methods
defineExpose({
  startCredits,
  pauseCredits,
  skipCredits
})
</script>

<style scoped>
.ending-credits {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #0a0a2e 0%, #16213e 50%, #1a1a3e 100%);
  overflow: hidden;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.ending-credits.credits-active {
  opacity: 1;
}

.credits-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 6s ease-in-out infinite alternate;
}

.galaxy-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(135, 206, 235, 0.1) 0%, transparent 70%);
}

.credits-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  text-align: center;
  color: white;
  min-height: 200vh;
}

.credits-title {
  margin-bottom: 4rem;
  padding: 2rem 0;
}

.credits-title h1 {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ffd700, #87ceeb, #ffd700);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.credits-title p {
  font-size: 1.2rem;
  color: #87ceeb;
  opacity: 0.9;
}

.player-section {
  margin: 4rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.player-section h2 {
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 1rem;
}

.player-name {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff69b4, #ffd700, #87ceeb);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
}

.player-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #87ceeb;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
}

.character-cast {
  margin: 4rem 0;
}

.character-cast h2 {
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 2rem;
}

.cast-list {
  display: grid;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.cast-member {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(5px);
}

.character-portrait {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffd700;
}

.character-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.character-info {
  flex: 1;
  text-align: left;
}

.character-info h3 {
  font-size: 1.3rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
}

.character-info p {
  color: #87ceeb;
  margin-bottom: 0.5rem;
}

.character-message {
  font-style: italic;
  color: #dda0dd;
  font-size: 0.9rem;
}

.development-team, .special-acknowledgments, .ending-specific, .music-credits, .technology-section {
  margin: 4rem 0;
  padding: 2rem;
}

.development-team h2, .special-acknowledgments h2, .ending-specific h2, .music-credits h2, .technology-section h2 {
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 2rem;
}

.team-section {
  margin: 1.5rem 0;
}

.team-section h3 {
  font-size: 1.2rem;
  color: #87ceeb;
  margin-bottom: 0.5rem;
}

.team-section p {
  color: #dda0dd;
}

.acknowledgment-list p, .special-thanks {
  font-size: 1.1rem;
  color: #87ceeb;
  margin: 1rem 0;
  line-height: 1.6;
}

.music-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.track-name {
  font-weight: bold;
  color: #87ceeb;
}

.track-info {
  color: #dda0dd;
  font-size: 0.9rem;
}

.tech-list p {
  color: #87ceeb;
  margin: 0.5rem 0;
}

.final-message {
  margin: 6rem 0;
  padding: 3rem;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  border-radius: 20px;
}

.final-message h2 {
  font-size: 2.5rem;
  color: #ffd700;
  margin-bottom: 2rem;
}

.message-content p {
  font-size: 1.3rem;
  color: #87ceeb;
  line-height: 1.8;
  margin: 1rem 0;
}

.signature {
  font-style: italic;
  color: #dda0dd !important;
  margin-top: 2rem !important;
}

.studio-logo {
  margin: 6rem 0;
  padding: 4rem;
}

.logo-container h1 {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ffd700, #87ceeb, #ff69b4);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.logo-container p {
  font-size: 1.2rem;
  color: #87ceeb;
}

.credits-controls {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid #ffd700;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 215, 0, 0.3);
  transform: scale(1.05);
}

.credits-progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #87ceeb);
  transition: width 0.3s ease;
}

.credits-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.credit-particle {
  position: absolute;
  font-size: 1rem;
  opacity: 0.7;
  color: #ffd700;
  text-shadow: 0 0 10px currentColor;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .credits-content {
    padding: 1rem;
  }
  
  .credits-title h1 {
    font-size: 2rem;
  }
  
  .cast-member {
    flex-direction: column;
    text-align: center;
  }
  
  .music-track {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .credits-controls {
    bottom: 1rem;
    right: 1rem;
  }
}
</style>