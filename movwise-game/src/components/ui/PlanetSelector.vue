<template>
  <div class="planet-selector-container">
    <!-- 銀河背景 -->
    <div class="galaxy-backdrop">
      <div class="stars-field"></div>
      <div class="nebula-effect"></div>
    </div>
    
    <!-- 惑星システム -->
    <div class="solar-system">
      <!-- 中心の太陽（Sound Galaxy Academy） -->
      <div class="central-sun">
        <div class="sun-core">
          <span class="sun-emoji">🌟</span>
          <div class="sun-glow"></div>
        </div>
        <h3 class="academy-name">Sound Galaxy Academy</h3>
      </div>
      
      <!-- 惑星軌道 -->
      <div class="planet-orbits">
        <div
          v-for="(planet, index) in planets"
          :key="planet.id"
          class="orbit"
          :class="`orbit-${index + 1}`"
        >
          <div
            class="planet"
            :class="[
              `planet-${planet.id}`,
              { 
                'planet-locked': !planet.unlocked,
                'planet-active': selectedPlanet?.id === planet.id,
                'planet-current': currentPlanet?.id === planet.id
              }
            ]"
            @click="selectPlanet(planet)"
            @mouseenter="hoveredPlanet = planet"
            @mouseleave="hoveredPlanet = null"
          >
            <!-- 惑星本体 -->
            <div class="planet-body">
              <span class="planet-emoji">{{ planet.emoji }}</span>
              <div v-if="!planet.unlocked" class="lock-overlay">
                <span>🔒</span>
              </div>
              <!-- 進捗リング -->
              <svg v-if="planet.unlocked" class="progress-ring" viewBox="0 0 100 100">
                <circle
                  class="progress-ring-bg"
                  cx="50"
                  cy="50"
                  r="45"
                  stroke-width="5"
                  fill="none"
                />
                <circle
                  class="progress-ring-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  stroke-width="5"
                  fill="none"
                  :stroke-dasharray="`${planet.progress * 2.83} 283`"
                  :class="`ring-${planet.id}`"
                />
              </svg>
            </div>
            
            <!-- 惑星名 -->
            <div class="planet-label">
              <span class="planet-name">{{ planet.name }}</span>
              <span v-if="planet.unlocked" class="planet-progress">{{ planet.progress }}%</span>
            </div>
            
            <!-- 衛星（サブゲーム数） -->
            <div v-if="planet.satellites > 0" class="satellites">
              <div
                v-for="n in planet.satellites"
                :key="n"
                class="satellite"
                :style="`animation-delay: ${n * 0.3}s`"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 惑星情報パネル -->
      <transition name="info-panel">
        <div v-if="hoveredPlanet || selectedPlanet" class="planet-info-panel">
          <div class="info-content">
            <h3 class="info-title">
              <span>{{ (hoveredPlanet || selectedPlanet).emoji }}</span>
              {{ (hoveredPlanet || selectedPlanet).name }}
            </h3>
            <p class="info-description">{{ (hoveredPlanet || selectedPlanet).description }}</p>
            
            <div v-if="(hoveredPlanet || selectedPlanet).unlocked" class="info-stats">
              <div class="stat-item">
                <span class="stat-icon">🎮</span>
                <span class="stat-label">ゲーム数</span>
                <span class="stat-value">{{ (hoveredPlanet || selectedPlanet).gameCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">⭐</span>
                <span class="stat-label">マスター済み</span>
                <span class="stat-value">{{ (hoveredPlanet || selectedPlanet).mastered }}/{{ (hoveredPlanet || selectedPlanet).totalItems }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🏆</span>
                <span class="stat-label">実績</span>
                <span class="stat-value">{{ (hoveredPlanet || selectedPlanet).achievements }}/{{ (hoveredPlanet || selectedPlanet).totalAchievements }}</span>
              </div>
            </div>
            
            <div v-if="!(hoveredPlanet || selectedPlanet).unlocked" class="unlock-info">
              <p class="unlock-requirement">
                <span class="lock-icon">🔒</span>
                解放条件: {{ (hoveredPlanet || selectedPlanet).unlockRequirement }}
              </p>
            </div>
            
            <button
              v-if="(hoveredPlanet || selectedPlanet).unlocked"
              @click="enterPlanet(hoveredPlanet || selectedPlanet)"
              class="enter-button"
              :class="`enter-${(hoveredPlanet || selectedPlanet).id}`"
            >
              <span class="button-icon">🚀</span>
              惑星に着陸
            </button>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- 進捗サマリー -->
    <div class="progress-summary">
      <div class="summary-item">
        <span class="summary-icon">🌌</span>
        <span class="summary-label">銀河探索率</span>
        <span class="summary-value">{{ galaxyProgress }}%</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">💎</span>
        <span class="summary-label">音素エネルギー</span>
        <span class="summary-value">{{ totalEnergy.toLocaleString() }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">🏅</span>
        <span class="summary-label">ガーディアンランク</span>
        <span class="summary-value">{{ guardianRank }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCharacterStore } from '@/stores/characterStore'

export default {
  name: 'PlanetSelector',
  emits: ['select-planet', 'enter-planet'],
  setup(_, { emit }) {
    const gameStore = useGameStore()
    const characterStore = useCharacterStore()
    
    const selectedPlanet = ref(null)
    const hoveredPlanet = ref(null)
    const currentPlanet = ref(null)
    
    // 惑星データ
    const planets = ref([
      {
        id: 'phonics',
        name: 'Phonics Planet',
        emoji: '🟡',
        description: '44の音素エネルギーが眠る基礎の惑星。音の妖精たちと共に、英語の音を一つずつマスターしよう！',
        unlocked: true,
        progress: 75,
        gameCount: 12,
        mastered: 33,
        totalItems: 44,
        achievements: 8,
        totalAchievements: 10,
        satellites: 3,
        unlockRequirement: '最初から解放'
      },
      {
        id: 'grammar',
        name: 'Grammar Galaxy',
        emoji: '🔵',
        description: '文法の魔法が支配する銀河。言語構造の秘密を解き明かし、文法マスターを目指そう！',
        unlocked: true,
        progress: 35,
        gameCount: 8,
        mastered: 7,
        totalItems: 20,
        achievements: 3,
        totalAchievements: 8,
        satellites: 2,
        unlockRequirement: 'Phonics Planet 20%達成'
      },
      {
        id: 'vocabulary',
        name: 'Vocabulary Village',
        emoji: '🟢',
        description: '豊かな語彙の村。単語の市場で買い物をしながら、実用的な語彙を楽しく習得！',
        unlocked: true,
        progress: 45,
        gameCount: 6,
        mastered: 450,
        totalItems: 1000,
        achievements: 5,
        totalAchievements: 12,
        satellites: 2,
        unlockRequirement: 'Phonics Planet 30%達成'
      },
      {
        id: 'pattern',
        name: 'Pattern Paradise',
        emoji: '🟣',
        description: 'パターン認識の楽園。英語の規則性を発見し、効率的な学習を実現！',
        unlocked: false,
        progress: 0,
        gameCount: 5,
        mastered: 0,
        totalItems: 50,
        achievements: 0,
        totalAchievements: 6,
        satellites: 1,
        unlockRequirement: 'Grammar Galaxy 50%達成'
      },
      {
        id: 'practice',
        name: 'Practice Port',
        emoji: '🚀',
        description: '実践の宇宙港。VRアカデミーと連携し、リアルな場面で英語を使いこなそう！',
        unlocked: false,
        progress: 0,
        gameCount: 4,
        mastered: 0,
        totalItems: 30,
        achievements: 0,
        totalAchievements: 8,
        satellites: 1,
        unlockRequirement: '3つの惑星で30%以上達成'
      }
    ])
    
    // 銀河全体の進捗
    const galaxyProgress = computed(() => {
      const totalProgress = planets.value.reduce((sum, planet) => sum + planet.progress, 0)
      return Math.round(totalProgress / planets.value.length)
    })
    
    // 総エネルギー
    const totalEnergy = computed(() => gameStore.spaceshipStatus.cosmicEnergy || 0)
    
    // ガーディアンランク
    const guardianRank = computed(() => {
      const progress = galaxyProgress.value
      if (progress >= 80) return 'マスター'
      if (progress >= 60) return 'エキスパート'
      if (progress >= 40) return 'アドバンス'
      if (progress >= 20) return 'ビギナー'
      return 'ルーキー'
    })
    
    const selectPlanet = (planet) => {
      if (planet.unlocked) {
        selectedPlanet.value = planet
        emit('select-planet', planet)
      } else {
        // ロックされた惑星の場合、解放条件を表示
        hoveredPlanet.value = planet
      }
    }
    
    const enterPlanet = (planet) => {
      if (planet.unlocked) {
        currentPlanet.value = planet
        emit('enter-planet', planet)
      }
    }
    
    return {
      planets,
      selectedPlanet,
      hoveredPlanet,
      currentPlanet,
      galaxyProgress,
      totalEnergy,
      guardianRank,
      selectPlanet,
      enterPlanet
    }
  }
}
</script>

<style scoped>
.planet-selector-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #0a0e27;
}

.galaxy-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.stars-field {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent);
  background-size: 200px 200px;
  animation: drift 60s linear infinite;
}

.nebula-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, 
    rgba(138, 43, 226, 0.1) 0%, 
    transparent 50%);
  animation: pulse 10s ease-in-out infinite;
}

@keyframes drift {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.solar-system {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.central-sun {
  position: absolute;
  z-index: 10;
  text-align: center;
}

.sun-core {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.sun-emoji {
  font-size: 60px;
  z-index: 2;
  filter: drop-shadow(0 0 20px #ffd700);
  animation: rotate 20s linear infinite;
}

.sun-glow {
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, 
    rgba(255, 215, 0, 0.3) 0%, 
    rgba(255, 165, 0, 0.1) 40%, 
    transparent 70%);
  animation: sun-pulse 3s ease-in-out infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sun-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.academy-name {
  margin-top: 10px;
  font-size: 14px;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  white-space: nowrap;
}

.planet-orbits {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.orbit-1 {
  width: 300px;
  height: 300px;
  animation: orbit-rotate 30s linear infinite;
}

.orbit-2 {
  width: 450px;
  height: 450px;
  animation: orbit-rotate 45s linear infinite reverse;
}

.orbit-3 {
  width: 600px;
  height: 600px;
  animation: orbit-rotate 60s linear infinite;
}

.orbit-4 {
  width: 750px;
  height: 750px;
  animation: orbit-rotate 75s linear infinite reverse;
}

.orbit-5 {
  width: 900px;
  height: 900px;
  animation: orbit-rotate 90s linear infinite;
}

@keyframes orbit-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.planet {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.3s ease;
}

.planet:hover {
  transform: translateX(-50%) scale(1.1);
}

.planet-active {
  transform: translateX(-50%) scale(1.2);
}

.planet-body {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.planet-phonics .planet-body {
  background: radial-gradient(circle at 30% 30%, #fff3b2, #ffd700, #ff8c00);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.planet-grammar .planet-body {
  background: radial-gradient(circle at 30% 30%, #b3d9ff, #4169e1, #000080);
  box-shadow: 0 0 30px rgba(65, 105, 225, 0.5);
}

.planet-vocabulary .planet-body {
  background: radial-gradient(circle at 30% 30%, #b3ffb3, #32cd32, #006400);
  box-shadow: 0 0 30px rgba(50, 205, 50, 0.5);
}

.planet-pattern .planet-body {
  background: radial-gradient(circle at 30% 30%, #e6b3ff, #9370db, #4b0082);
  box-shadow: 0 0 30px rgba(147, 112, 219, 0.5);
}

.planet-practice .planet-body {
  background: radial-gradient(circle at 30% 30%, #ffb3b3, #ff6347, #8b0000);
  box-shadow: 0 0 30px rgba(255, 99, 71, 0.5);
}

.planet-locked .planet-body {
  filter: grayscale(80%) brightness(0.5);
}

.planet-emoji {
  font-size: 40px;
  z-index: 2;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.lock-overlay span {
  font-size: 24px;
}

.progress-ring {
  position: absolute;
  inset: -5px;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-ring-fill {
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.ring-phonics { stroke: #ffd700; }
.ring-grammar { stroke: #4169e1; }
.ring-vocabulary { stroke: #32cd32; }
.ring-pattern { stroke: #9370db; }
.ring-practice { stroke: #ff6347; }

.planet-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  white-space: nowrap;
}

.planet-name {
  display: block;
  font-size: 12px;
  color: white;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.planet-progress {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-top: 2px;
}

.satellites {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.satellite {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  animation: satellite-orbit 3s linear infinite;
}

@keyframes satellite-orbit {
  from {
    transform: rotate(0deg) translateX(50px) translateY(-50%);
  }
  to {
    transform: rotate(360deg) translateX(50px) translateY(-50%);
  }
}

.planet-info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 320px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  z-index: 20;
}

.info-content {
  color: white;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  margin-bottom: 10px;
}

.info-description {
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
  margin-bottom: 15px;
}

.info-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 5px;
}

.stat-label {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 3px;
}

.stat-value {
  display: block;
  font-size: 14px;
  font-weight: bold;
}

.unlock-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
}

.unlock-requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #fbbf24;
}

.enter-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.enter-phonics {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
}

.enter-grammar {
  background: linear-gradient(135deg, #4169e1, #000080);
}

.enter-vocabulary {
  background: linear-gradient(135deg, #32cd32, #006400);
}

.enter-pattern {
  background: linear-gradient(135deg, #9370db, #4b0082);
}

.enter-practice {
  background: linear-gradient(135deg, #ff6347, #8b0000);
}

.enter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.button-icon {
  font-size: 20px;
}

.progress-summary {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
  display: flex;
  gap: 20px;
  z-index: 20;
}

.summary-item {
  text-align: center;
}

.summary-icon {
  display: block;
  font-size: 24px;
  margin-bottom: 5px;
}

.summary-label {
  display: block;
  font-size: 10px;
  color: #94a3b8;
  margin-bottom: 3px;
}

.summary-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.info-panel-enter-active,
.info-panel-leave-active {
  transition: all 0.3s ease;
}

.info-panel-enter-from,
.info-panel-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>