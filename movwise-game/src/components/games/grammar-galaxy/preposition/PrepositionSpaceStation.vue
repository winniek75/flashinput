<template>
  <div class="preposition-space-station">
    <TresCanvas :alpha="true" :shadows="true" :clearColor="0x000428">
      <TresPerspectiveCamera 
        :position="cameraPosition" 
        :fov="75" 
        :aspect="1"
        :look-at="[0, 0, 0]"
      />
      
      <!-- Lighting -->
      <TresAmbientLight :intensity="0.3" />
      <TresDirectionalLight 
        :position="[10, 10, 5]" 
        :intensity="1"
        :cast-shadow="true"
      />
      <TresPointLight 
        :position="[-10, 5, -10]" 
        :intensity="0.5" 
        color="#ff9800"
      />
      
      <!-- Stars Background -->
      <TresPoints>
        <TresBufferGeometry :position="starPositions" />
        <TresPointsMaterial 
          :size="0.05" 
          :color="0xffffff"
          :transparent="true"
          :opacity="0.8"
        />
      </TresPoints>
      
      <!-- Planets -->
      <TresGroup>
        <Planet
          v-for="planet in gameStore.planets"
          :key="planet.id"
          :planet="planet"
          @click="selectPlanet(planet)"
          @hover="hoveredPlanet = planet"
          @unhover="hoveredPlanet = null"
        />
      </TresGroup>
      
      <!-- Space Station (center) -->
      <TresGroup :position="[0, 0, 0]">
        <!-- Station Core -->
        <TresMesh>
          <TresCylinderGeometry :args="[1.5, 1.5, 0.5, 32]" />
          <TresMeshStandardMaterial 
            :color="0x444444" 
            :metalness="0.8"
            :roughness="0.2"
          />
        </TresMesh>
        
        <!-- Station Ring -->
        <TresMesh :rotation="[Math.PI / 2, 0, 0]">
          <TresTorusGeometry :args="[2.5, 0.3, 16, 32]" />
          <TresMeshStandardMaterial 
            :color="0x666666" 
            :metalness="0.9"
            :roughness="0.1"
            :emissive="0x0066ff"
            :emissive-intensity="0.2"
          />
        </TresMesh>
        
        <!-- Station Lights -->
        <TresPointLight 
          :position="[0, 0, 0]" 
          :intensity="0.5" 
          color="#0066ff"
        />
      </TresGroup>
      
      <!-- Orbiting Spacecraft (decoration) -->
      <TresGroup :rotation="[0, spacecraftRotation, 0]">
        <TresMesh :position="[8, 2, 0]">
          <TresBoxGeometry :args="[0.3, 0.1, 0.5]" />
          <TresMeshStandardMaterial :color="0xcccccc" />
        </TresMesh>
      </TresGroup>
      
      <!-- Camera Controls -->
      <OrbitControls 
        :enable-damping="true"
        :damping-factor="0.05"
        :min-distance="5"
        :max-distance="30"
        :enable-pan="false"
        :auto-rotate="true"
        :auto-rotate-speed="0.5"
      />
    </TresCanvas>
    
    <!-- UI Overlay -->
    <div class="ui-overlay">
      <!-- Title -->
      <div class="title-section">
        <h1 class="game-title">前置詞マスター：宇宙の旅</h1>
        <p class="subtitle">Preposition Master: Space Journey</p>
      </div>
      
      <!-- Planet Info Panel -->
      <transition name="slide-up">
        <div v-if="hoveredPlanet" class="planet-info">
          <div class="planet-header">
            <span class="planet-icon">{{ hoveredPlanet.icon }}</span>
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
            <div class="stat">
              <span class="stat-label">前置詞:</span>
              <span class="stat-value">{{ hoveredPlanet.prepositions.length }}個</span>
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
      
      <!-- Progress Bar -->
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
      
      <!-- Instructions -->
      <div class="instructions">
        <p>🖱️ マウスで回転 | 🎯 惑星をクリックして選択 | 📚 各惑星で前置詞を学習</p>
      </div>
      
      <!-- Back Button -->
      <button @click="goBack" class="back-button">
        ← メインメニューに戻る
      </button>
    </div>
    
    <!-- Planet Selection Modal -->
    <transition name="fade">
      <div v-if="selectedPlanet" class="modal-overlay" @click="closeModal">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import '@/assets/css/preposition-game.css'
import { useRouter } from 'vue-router'
import { TresCanvas, useTres } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { usePrepositionGameStore } from '@/stores/grammarGalaxy/prepositionGameStore'
import Planet from './Planet.vue'

const router = useRouter()
const gameStore = usePrepositionGameStore()

// Reactive state
const hoveredPlanet = ref(null)
const selectedPlanet = ref(null)
const spacecraftRotation = ref(0)
const cameraPosition = ref([10, 8, 15])

// Generate star positions
const starPositions = computed(() => {
  const positions = new Float32Array(3000)
  for (let i = 0; i < 1000; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 100
    positions[i3 + 1] = (Math.random() - 0.5) * 100
    positions[i3 + 2] = (Math.random() - 0.5) * 100
  }
  return positions
})

// Animation loop
let animationId = null
const animate = () => {
  spacecraftRotation.value += 0.001
  animationId = requestAnimationFrame(animate)
}

// Methods
const selectPlanet = (planet) => {
  if (!planet.unlocked) {
    return
  }
  selectedPlanet.value = planet
}

const closeModal = () => {
  selectedPlanet.value = null
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

// Lifecycle
onMounted(async () => {
  await gameStore.loadProgress()
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.preposition-space-station {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #000428 0%, #004e92 100%);
  overflow: hidden;
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

/* Title Section */
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
  text-shadow: 0 0 20px rgba(0, 102, 255, 0.8);
  background: linear-gradient(45deg, #00ffff, #0066ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
}

/* Planet Info Panel */
.planet-info {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 102, 255, 0.5);
  border-radius: 15px;
  padding: 20px;
  width: 300px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 102, 255, 0.3);
}

.planet-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.planet-icon {
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

/* Progress Section */
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
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.planet-counter {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  font-size: 0.9rem;
}

/* Instructions */
.instructions {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

/* Back Button */
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

/* Modal */
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
  border: 2px solid rgba(0, 102, 255, 0.5);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 50px rgba(0, 102, 255, 0.5);
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-button:hover {
  background: rgba(255, 0, 0, 0.5);
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

.action-button.primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
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

/* Responsive */
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
  
  .instructions {
    font-size: 0.8rem;
    padding: 0 20px;
  }
}
</style>