<template>
  <div class="preposition-space-station-fallback">
    <!-- 背景 -->
    <div class="space-background">
      <div class="stars"></div>
      <div class="nebula"></div>
    </div>

    <!-- 宇宙ステーション中央 -->
    <div class="space-station">
      <div class="station-core">🛸</div>
      <div class="station-name">前置詞宇宙ステーション</div>
    </div>

    <!-- 惑星配置 -->
    <div class="planets-container">
      <div 
        v-for="planet in gameStore.planets" 
        :key="planet.id"
        class="planet" 
        :class="{
          'unlocked': planet.unlocked,
          'completed': planet.completed,
          'locked': !planet.unlocked
        }"
        :style="getPlanetStyle(planet)"
        @click="selectPlanet(planet)"
        @click.stop
        @mouseenter="hoveredPlanet = planet"
        @mouseleave="hoveredPlanet = null"
      >
        <div class="planet-surface" :style="{ backgroundColor: planet.color }">
          <div class="planet-icon">{{ planet.icon }}</div>
        </div>
        <div class="planet-name">{{ planet.nameEn }}</div>
        <div v-if="planet.completed" class="completion-mark">✅</div>
        <div v-else-if="!planet.unlocked" class="lock-mark">🔒</div>
      </div>
    </div>

    <!-- UI Overlay -->
    <div class="ui-overlay">
      <!-- タイトル -->
      <div class="title-section">
        <h1 class="game-title">前置詞マスター：宇宙の旅</h1>
        <p class="subtitle">5つの惑星で前置詞を完全習得</p>
      </div>

      <!-- 惑星情報パネル -->
      <transition name="slide-up">
        <div v-if="hoveredPlanet" class="planet-info">
          <div class="planet-header">
            <span class="planet-icon-large">{{ hoveredPlanet.icon }}</span>
            <h3>{{ hoveredPlanet.name }}</h3>
          </div>
          <p class="planet-description">{{ hoveredPlanet.description }}</p>
          <div class="planet-stats">
            <div class="stat">
              <span class="stat-label">状態:</span>
              <span class="stat-value">
                {{ hoveredPlanet.unlocked ? (hoveredPlanet.completed ? '完了' : '挑戦可能') : 'ロック中' }}
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">ベストスコア:</span>
              <span class="stat-value">{{ hoveredPlanet.bestScore }}%</span>
            </div>
          </div>
          <button 
            v-if="hoveredPlanet.unlocked"
            @click="selectPlanet(hoveredPlanet)" 
            class="start-button"
          >
            {{ hoveredPlanet.completed ? '再挑戦' : '開始' }}
          </button>
          <div v-else class="locked-message">
            前の惑星で80%以上のスコアを獲得して解放
          </div>
        </div>
      </transition>

      <!-- 進捗バー -->
      <div class="progress-section">
        <div class="progress-label">
          <span>全体の進捗</span>
          <span>{{ gameStore.overallProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${gameStore.overallProgress}%` }"
          ></div>
        </div>
        <div class="planet-counter">
          {{ gameStore.completedPlanetsCount }} / {{ gameStore.planets.length }} 惑星完了
        </div>
      </div>

      <!-- 戻るボタン -->
      <button @click="goBack" class="back-button">
        ← Grammar Galaxy に戻る
      </button>
    </div>

    <!-- 惑星選択モーダル -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <span class="modal-icon">{{ selectedPlanet.icon }}</span>
            <h2>{{ selectedPlanet.name }}</h2>
            <button @click="closeModal" class="close-button">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-description">{{ selectedPlanet.description }}</p>
            <div class="preposition-list">
              <h4>学習する前置詞:</h4>
              <div class="preposition-tags">
                <span 
                  v-for="prep in selectedPlanet.prepositions" 
                  :key="prep"
                  class="prep-tag"
                >
                  {{ prep }}
                </span>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="startGame" class="action-button primary">
                ゲームを開始
              </button>
              <button @click="closeModal" class="action-button secondary">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePrepositionGameStore } from '@/stores/grammarGalaxy/prepositionGameStore'

const router = useRouter()
const gameStore = usePrepositionGameStore()

// Reactive state
const hoveredPlanet = ref(null)
const selectedPlanet = ref(null)
const isSelectingPlanet = ref(false)

// Computed for stable modal display
const showModal = computed(() => {
  return selectedPlanet.value !== null && selectedPlanet.value?.unlocked === true && !isSelectingPlanet.value
})

// Methods
const getPlanetStyle = (planet) => {
  const positions = {
    'place': { top: '20%', left: '20%' },
    'time': { top: '15%', right: '25%' },
    'date': { bottom: '25%', left: '15%' },
    'method': { bottom: '20%', right: '20%' },
    'relation': { top: '45%', left: '50%', transform: 'translateX(-50%)' }
  }
  return positions[planet.id] || { top: '50%', left: '50%' }
}

const selectPlanet = async (planet) => {
  logger.log('selectPlanet called:', planet.id, 'unlocked:', planet.unlocked)
  
  if (isSelectingPlanet.value) {
    logger.log('Already selecting a planet, ignoring')
    return
  }
  
  if (!planet.unlocked) {
    logger.log('Planet is locked, cannot select')
    return
  }
  
  // Prevent modal flickering by ensuring stable reference
  if (selectedPlanet.value?.id === planet.id) {
    logger.log('Planet already selected, ignoring')
    return
  }
  
  isSelectingPlanet.value = true
  logger.log('Setting selectedPlanet to:', planet.name)
  
  // Small delay to ensure stability
  await new Promise(resolve => setTimeout(resolve, 100))
  
  selectedPlanet.value = { ...planet } // Create a stable copy
  isSelectingPlanet.value = false
}

const closeModal = () => {
  logger.log('Closing modal')
  selectedPlanet.value = null
  isSelectingPlanet.value = false
}

const startGame = () => {
  if (selectedPlanet.value) {
    gameStore.startGame(selectedPlanet.value.id)
    router.push(`/grammar-galaxy/preposition-master/play/${selectedPlanet.value.id}`)
  }
}

const goBack = () => {
  router.push('/grammar-galaxy')
}

// Watch for selectedPlanet changes
watch(selectedPlanet, (newValue, oldValue) => {
  logger.log('selectedPlanet changed:', {
    old: oldValue?.id || 'null',
    new: newValue?.id || 'null',
    unlocked: newValue?.unlocked
  })
})

// Watch for planet unlock status changes
watch(() => gameStore.planets, (newPlanets) => {
  logger.log('Planets state changed:', newPlanets.map(p => ({ id: p.id, unlocked: p.unlocked })))
}, { deep: true })

// Lifecycle
onMounted(() => {
  logger.log('Component mounted, planets state:', gameStore.planets.map(p => ({ id: p.id, unlocked: p.unlocked, completed: p.completed })))
})
</script>

<style scoped>
.preposition-space-station-fallback {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #000428 0%, #004e92 100%);
}

.space-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s infinite linear;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.nebula {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(123, 31, 162, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(25, 118, 210, 0.2) 0%, transparent 50%);
  animation: nebulaFloat 10s infinite ease-in-out;
}

@keyframes nebulaFloat {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.space-station {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 5;
}

.station-core {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.7));
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.station-name {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 10px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.planets-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.planet {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
}

.planet:hover:not(.locked) {
  transform: scale(1.1);
}

.planet.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.planet-surface {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  animation: planetRotate 10s linear infinite;
}

@keyframes planetRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.planet-icon {
  font-size: 2rem;
}

.planet-name {
  color: white;
  text-align: center;
  margin-top: 5px;
  font-size: 0.8rem;
  font-weight: bold;
}

.completion-mark,
.lock-mark {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1.5rem;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.ui-overlay > * {
  pointer-events: auto;
}

.title-section {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
}

.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
}

.subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
}

.planet-info {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 15px;
  padding: 20px;
  width: 300px;
  backdrop-filter: blur(10px);
}

.planet-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.planet-icon-large {
  font-size: 2rem;
}

.planet-info h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.planet-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  line-height: 1.5;
}

.planet-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.stat {
  display: flex;
  justify-content: space-between;
  color: white;
}

.stat-label {
  opacity: 0.7;
}

.stat-value {
  font-weight: bold;
  color: #00ffff;
}

.start-button {
  width: 100%;
  padding: 10px;
  background: linear-gradient(45deg, #00ffff, #0066ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.start-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.locked-message {
  color: #ff9800;
  text-align: center;
  padding: 10px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.progress-section {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  color: white;
  margin-bottom: 8px;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0066ff);
  transition: width 0.5s ease;
}

.planet-counter {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  font-size: 0.9rem;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.8);
  border-color: #00ffff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
}

.modal-icon {
  font-size: 3rem;
}

.modal-header h2 {
  color: white;
  margin: 0;
  flex: 1;
}

.close-button {
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-body {
  color: white;
}

.modal-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.6;
}

.preposition-list h4 {
  margin-bottom: 10px;
  color: #00ffff;
}

.preposition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 25px;
}

.prep-tag {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.5);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button.primary {
  background: linear-gradient(45deg, #00ffff, #0066ff);
  color: white;
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .game-title {
    font-size: 1.8rem;
  }
  
  .planet-info {
    right: 10px;
    width: 250px;
    padding: 15px;
  }
  
  .progress-section {
    width: 90%;
    bottom: 60px;
  }
}
</style>