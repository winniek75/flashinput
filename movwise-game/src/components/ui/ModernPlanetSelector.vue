<template>
  <div class="modern-galaxy-container">
    <!-- 3D グリッド背景 -->
    <div class="grid-background">
      <div class="grid-lines-horizontal"></div>
      <div class="grid-lines-vertical"></div>
      <div class="grid-perspective"></div>
    </div>
    
    <!-- パーティクルフィールド -->
    <div class="particle-field">
      <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <!-- ホログラムインターフェース -->
    <div class="hologram-interface">
      <!-- ヘッダーHUD -->
      <div class="hud-header">
        <div class="hud-title">
          <span class="title-glitch">SOUND GALAXY</span>
          <span class="subtitle">NAVIGATION SYSTEM</span>
        </div>
        <div class="hud-stats">
          <div class="stat-display">
            <span class="stat-label">ENERGY</span>
            <span class="stat-value">{{ totalEnergy.toLocaleString() }}</span>
            <div class="stat-bar">
              <div class="stat-fill" :style="`width: ${Math.min(100, (totalEnergy / 10000) * 100)}%`"></div>
            </div>
          </div>
          <div class="stat-display">
            <span class="stat-label">PROGRESS</span>
            <span class="stat-value">{{ galaxyProgress }}%</span>
            <div class="stat-bar">
              <div class="stat-fill" :style="`width: ${galaxyProgress}%`"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中央アカデミー -->
      <div class="academy-core">
        <div class="core-ring"></div>
        <div class="core-inner">
          <div class="academy-logo">
            <span class="logo-icon">🌟</span>
            <div class="energy-waves"></div>
          </div>
        </div>
        <div class="core-text">SOUND GALAXY ACADEMY</div>
      </div>
      
      <!-- 惑星ノード -->
      <div class="planet-nodes">
        <div
          v-for="(planet, index) in planets"
          :key="planet.id"
          class="planet-node"
          :class="[
            `node-${planet.id}`,
            `position-${index + 1}`,
            {
              'node-locked': !planet.unlocked,
              'node-selected': selectedPlanet?.id === planet.id,
              'node-hovered': hoveredPlanet?.id === planet.id
            }
          ]"
          @click="selectPlanet(planet)"
          @mouseenter="hoveredPlanet = planet"
          @mouseleave="hoveredPlanet = null"
        >
          <!-- 接続線 -->
          <div class="connection-line" :class="{ 'line-active': planet.unlocked }"></div>
          
          <!-- 惑星本体 -->
          <div class="planet-sphere">
            <div class="sphere-inner" :style="{ background: planet.gradient }">
              <span class="planet-icon">{{ planet.emoji }}</span>
              <div v-if="!planet.unlocked" class="lock-shield">
                <span>🔒</span>
              </div>
            </div>
            
            <!-- ホログラム輪 -->
            <div class="hologram-rings">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
            </div>
            
            <!-- 進捗オーブ -->
            <div v-if="planet.unlocked" class="progress-orb">
              <svg class="progress-circle" viewBox="0 0 36 36">
                <path
                  class="progress-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="progress-fill"
                  :stroke-dasharray="`${planet.progress}, 100`"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="progress-text">{{ planet.progress }}%</span>
            </div>
          </div>
          
          <!-- 惑星名プレート -->
          <div class="name-plate">
            <div class="plate-content">
              <span class="planet-name">{{ planet.name }}</span>
              <span class="planet-type">{{ planet.type }}</span>
            </div>
          </div>
          
          <!-- データフロー -->
          <div v-if="planet.unlocked" class="data-flow">
            <div v-for="i in 3" :key="i" class="data-point" :style="`animation-delay: ${i * 0.3}s`"></div>
          </div>
        </div>
      </div>
      
      <!-- 選択された惑星の詳細パネル -->
      <transition name="detail-slide">
        <div v-if="selectedPlanet" class="detail-panel">
          <div class="panel-header">
            <h3 class="panel-title">{{ selectedPlanet.emoji }} {{ selectedPlanet.name }}</h3>
            <button @click="selectedPlanet = null" class="close-btn">×</button>
          </div>
          
          <div class="panel-content">
            <p class="planet-description">{{ selectedPlanet.description }}</p>
            
            <div v-if="selectedPlanet.unlocked" class="mission-grid">
              <div class="mission-item">
                <span class="mission-icon">🎮</span>
                <span class="mission-label">Games</span>
                <span class="mission-value">{{ selectedPlanet.gameCount }}</span>
              </div>
              <div class="mission-item">
                <span class="mission-icon">⭐</span>
                <span class="mission-label">Mastered</span>
                <span class="mission-value">{{ selectedPlanet.mastered }}/{{ selectedPlanet.totalItems }}</span>
              </div>
              <div class="mission-item">
                <span class="mission-icon">🏆</span>
                <span class="mission-label">Achievements</span>
                <span class="mission-value">{{ selectedPlanet.achievements }}/{{ selectedPlanet.totalAchievements }}</span>
              </div>
            </div>
            
            <div v-if="!selectedPlanet.unlocked" class="unlock-requirement">
              <span class="req-icon">🔐</span>
              <span class="req-text">{{ selectedPlanet.unlockRequirement }}</span>
            </div>
            
            <button
              v-if="selectedPlanet.unlocked"
              @click="enterPlanet(selectedPlanet)"
              class="enter-btn"
            >
              <span class="btn-icon">🚀</span>
              <span class="btn-text">DEPLOY TO {{ selectedPlanet.name.toUpperCase() }}</span>
            </button>
          </div>
        </div>
      </transition>
      
      <!-- ナビゲーション制御 -->
      <div class="nav-controls">
        <button @click="$emit('back')" class="nav-btn nav-back">
          <span>⬅</span> RETURN TO BASE
        </button>
        <button @click="toggleView" class="nav-btn nav-toggle">
          <span>🔄</span> {{ view3D ? '2D VIEW' : '3D VIEW' }}
        </button>
      </div>
    </div>
    
    <!-- スキャンライン効果 -->
    <div class="scan-lines"></div>
    
    <!-- ホログラムノイズ -->
    <div class="hologram-noise"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'ModernPlanetSelector',
  emits: ['select-planet', 'enter-planet', 'back'],
  setup(_, { emit }) {
    const gameStore = useGameStore()
    
    const selectedPlanet = ref(null)
    const hoveredPlanet = ref(null)
    const view3D = ref(true)
    
    // 惑星データ（現代的なデザイン用に拡張）
    const planets = ref([
      {
        id: 'phonics',
        name: 'Phonics Planet',
        type: 'Core Learning Module',
        emoji: '🟡',
        description: 'Advanced phonetic analysis system. Master 44 sound frequencies to unlock linguistic potential.',
        unlocked: true,
        progress: 75,
        gameCount: 12,
        mastered: 33,
        totalItems: 44,
        achievements: 8,
        totalAchievements: 10,
        unlockRequirement: 'Accessible from start',
        gradient: 'radial-gradient(circle at 30% 30%, #FFD700, #FF8C00, #FF4500)'
      },
      {
        id: 'grammar',
        name: 'Grammar Galaxy',
        type: 'Structure Analysis Hub',
        emoji: '🔵',
        description: 'Quantum grammar processing facility. Decode linguistic patterns and syntax algorithms.',
        unlocked: true,
        progress: 35,
        gameCount: 8,
        mastered: 7,
        totalItems: 20,
        achievements: 3,
        totalAchievements: 8,
        unlockRequirement: 'Phonics Planet 20% completion',
        gradient: 'radial-gradient(circle at 30% 30%, #00BFFF, #0080FF, #0040FF)'
      },
      {
        id: 'vocabulary',
        name: 'Vocabulary Village',
        type: 'Data Repository',
        emoji: '🟢',
        description: 'Neural vocabulary matrix. Expand lexical database through immersive interaction protocols.',
        unlocked: true,
        progress: 45,
        gameCount: 6,
        mastered: 450,
        totalItems: 1000,
        achievements: 5,
        totalAchievements: 12,
        unlockRequirement: 'Phonics Planet 30% completion',
        gradient: 'radial-gradient(circle at 30% 30%, #00FF7F, #00CC66, #00994D)'
      },
      {
        id: 'pattern',
        name: 'Pattern Paradise',
        type: 'AI Learning Zone',
        emoji: '🟣',
        description: 'Advanced pattern recognition system. Unlock predictive learning algorithms and efficiency multipliers.',
        unlocked: false,
        progress: 0,
        gameCount: 5,
        mastered: 0,
        totalItems: 50,
        achievements: 0,
        totalAchievements: 6,
        unlockRequirement: 'Grammar Galaxy 50% completion',
        gradient: 'radial-gradient(circle at 30% 30%, #9932CC, #8A2BE2, #6A1B9A)'
      },
      {
        id: 'practice',
        name: 'Practice Port',
        type: 'VR Integration Portal',
        emoji: '🚀',
        description: 'Virtual reality deployment station. Access immersive practice environments and real-world simulations.',
        unlocked: false,
        progress: 0,
        gameCount: 4,
        mastered: 0,
        totalItems: 30,
        achievements: 0,
        totalAchievements: 8,
        unlockRequirement: '3 planets at 30% completion',
        gradient: 'radial-gradient(circle at 30% 30%, #FF1493, #DC143C, #B22222)'
      }
    ])
    
    // 統計
    const galaxyProgress = computed(() => {
      const totalProgress = planets.value.reduce((sum, planet) => sum + planet.progress, 0)
      return Math.round(totalProgress / planets.value.length)
    })
    
    const totalEnergy = computed(() => gameStore.spaceshipStatus.cosmicEnergy || 0)
    
    // パーティクルスタイル生成
    const getParticleStyle = (index) => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = Math.random() * 3 + 1
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 10
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`
      }
    }
    
    const selectPlanet = (planet) => {
      if (planet.unlocked) {
        selectedPlanet.value = selectedPlanet.value?.id === planet.id ? null : planet
        emit('select-planet', planet)
      }
    }
    
    const enterPlanet = (planet) => {
      emit('enter-planet', planet)
    }
    
    const toggleView = () => {
      view3D.value = !view3D.value
    }
    
    onMounted(() => {
      // 初期アニメーション
      const nodes = document.querySelectorAll('.planet-node')
      nodes.forEach((node, index) => {
        setTimeout(() => {
          node.classList.add('node-animate-in')
        }, index * 200)
      })
    })
    
    return {
      planets,
      selectedPlanet,
      hoveredPlanet,
      view3D,
      galaxyProgress,
      totalEnergy,
      getParticleStyle,
      selectPlanet,
      enterPlanet,
      toggleView
    }
  }
}
</script>

<style scoped>
.modern-galaxy-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a23 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
  font-family: 'Orbitron', 'Courier New', monospace;
}

/* 3Dグリッド背景 */
.grid-background {
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

.grid-lines-horizontal,
.grid-lines-vertical {
  position: absolute;
  inset: 0;
}

.grid-lines-horizontal {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 49px,
    rgba(0, 255, 255, 0.3) 50px
  );
}

.grid-lines-vertical {
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 49px,
    rgba(0, 255, 255, 0.3) 50px
  );
}

.grid-perspective {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 255, 0.1) 100%
  );
  transform: perspective(500px) rotateX(45deg);
  transform-origin: bottom;
}

/* パーティクル */
.particle-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: float infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* ホログラムインターフェース */
.hologram-interface {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* HUDヘッダー */
.hud-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 255, 255, 0.05) 50%,
    rgba(0, 255, 255, 0.1) 100%
  );
  border-bottom: 1px solid rgba(0, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.hud-title {
  display: flex;
  flex-direction: column;
}

.title-glitch {
  font-size: 28px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 15px #00ffff;
  animation: glitch 2s infinite;
}

@keyframes glitch {
  0%, 100% { text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
  25% { text-shadow: -2px 0 5px #ff00ff, 2px 0 10px #00ffff, 0 0 15px #ffff00; }
  50% { text-shadow: 2px 0 5px #00ffff, -2px 0 10px #ff00ff, 0 0 15px #00ffff; }
  75% { text-shadow: 0 0 5px #ffff00, 0 0 10px #ff00ff, 0 0 15px #00ffff; }
}

.subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
}

.hud-stats {
  display: flex;
  gap: 30px;
}

.stat-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
}

.stat-value {
  font-size: 18px;
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 10px #00ffff;
}

.stat-bar {
  width: 80px;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ffffff);
  transition: width 0.5s ease;
  box-shadow: 0 0 10px #00ffff;
}

/* 中央アカデミー */
.academy-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.core-ring {
  width: 150px;
  height: 150px;
  border: 2px solid rgba(0, 255, 255, 0.6);
  border-radius: 50%;
  position: relative;
  animation: rotate 20s linear infinite;
}

.core-ring::before,
.core-ring::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotate 15s linear infinite reverse;
}

.core-ring::after {
  animation-duration: 25s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.core-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.3), transparent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.academy-logo {
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 40px;
  filter: drop-shadow(0 0 20px #00ffff);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px #00ffff); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 30px #00ffff); }
}

.energy-waves {
  position: absolute;
  inset: -20px;
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 50%;
  animation: wave 3s ease-in-out infinite;
}

.energy-waves::before,
.energy-waves::after {
  content: '';
  position: absolute;
  inset: -15px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: wave 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.energy-waves::after {
  inset: -30px;
  animation-delay: 1s;
}

@keyframes wave {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

.core-text {
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 惑星ノード */
.planet-nodes {
  position: absolute;
  inset: 0;
}

.planet-node {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.planet-node.node-animate-in {
  animation: nodeAppear 0.8s ease-out forwards;
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: scale(0) translateZ(-100px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateZ(0);
  }
}

/* 惑星配置 */
.position-1 {
  top: 20%;
  left: 25%;
}

.position-2 {
  top: 30%;
  right: 20%;
}

.position-3 {
  bottom: 30%;
  left: 20%;
}

.position-4 {
  bottom: 25%;
  right: 30%;
}

.position-5 {
  top: 60%;
  left: 45%;
}

/* 接続線 */
.connection-line {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, 
    transparent,
    rgba(0, 255, 255, 0.3),
    transparent
  );
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.3;
  transition: all 0.3s ease;
}

.line-active {
  opacity: 1;
  animation: dataFlow 2s linear infinite;
}

@keyframes dataFlow {
  0% {
    background: linear-gradient(to bottom, 
      transparent,
      rgba(0, 255, 255, 0.3),
      transparent
    );
  }
  50% {
    background: linear-gradient(to bottom, 
      transparent,
      rgba(0, 255, 255, 0.8),
      transparent
    );
  }
  100% {
    background: linear-gradient(to bottom, 
      transparent,
      rgba(0, 255, 255, 0.3),
      transparent
    );
  }
}

.planet-sphere {
  position: relative;
  width: 80px;
  height: 80px;
}

.sphere-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.planet-node:hover .sphere-inner {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.planet-icon {
  font-size: 32px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.lock-shield {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  backdrop-filter: blur(2px);
}

.lock-shield span {
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

/* ホログラム輪 */
.hologram-rings {
  position: absolute;
  inset: -10px;
  pointer-events: none;
}

.ring {
  position: absolute;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: ringRotate 5s linear infinite;
}

.ring-1 {
  inset: 0;
  animation-duration: 3s;
}

.ring-2 {
  inset: -5px;
  animation-duration: 4s;
  animation-direction: reverse;
}

.ring-3 {
  inset: -10px;
  animation-duration: 5s;
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.planet-node:hover .ring {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 進捗オーブ */
.progress-orb {
  position: absolute;
  bottom: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
}

.progress-circle {
  width: 30px;
  height: 30px;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
}

.progress-fill {
  fill: none;
  stroke: #00ffff;
  stroke-width: 2;
  stroke-linecap: round;
  filter: drop-shadow(0 0 5px #00ffff);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8px;
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px #00ffff;
}

/* 名前プレート */
.name-plate {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 120px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.plate-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.planet-name {
  font-size: 12px;
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px #00ffff;
}

.planet-type {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

/* データフロー */
.data-flow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.data-point {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #00ffff;
  border-radius: 50%;
  animation: dataPoint 2s linear infinite;
  box-shadow: 0 0 5px #00ffff;
}

@keyframes dataPoint {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) scale(0);
    opacity: 0;
  }
}

/* ロック状態 */
.node-locked {
  opacity: 0.5;
  filter: grayscale(80%);
}

.node-locked .connection-line {
  opacity: 0.1;
}

/* 選択状態 */
.node-selected .sphere-inner {
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
  border-color: #00ffff;
}

.node-selected .hologram-rings .ring {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
}

/* 詳細パネル */
.detail-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(15px);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 255, 255, 0.05) 100%
  );
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.panel-title {
  font-size: 16px;
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 10px #00ffff;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.3);
  border-color: #ff0000;
}

.panel-content {
  padding: 20px;
}

.planet-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 20px;
}

.mission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mission-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  text-align: center;
}

.mission-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.mission-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.mission-value {
  font-size: 14px;
  color: #00ffff;
  font-weight: bold;
}

.unlock-requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid rgba(255, 165, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 20px;
}

.req-icon {
  font-size: 16px;
}

.req-text {
  font-size: 14px;
  color: #ffa500;
}

.enter-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00ffff, #0080ff);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.4);
}

.btn-icon {
  font-size: 16px;
}

/* ナビゲーション */
.nav-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
}

.nav-btn {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 8px;
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* スキャンライン */
.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 255, 0.03) 3px,
    rgba(0, 255, 255, 0.03) 4px
  );
  pointer-events: none;
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

/* ホログラムノイズ */
.hologram-noise {
  position: absolute;
  inset: 0;
  opacity: 0.02;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIj4KICAgICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc2VlZD0iMiIvPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuNCIvPgo8L3N2Zz4K');
  animation: noiseMove 0.1s steps(10) infinite;
  pointer-events: none;
}

@keyframes noiseMove {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-1px, -1px); }
  20% { transform: translate(1px, 0); }
  30% { transform: translate(0, 1px); }
  40% { transform: translate(-1px, 0); }
  50% { transform: translate(1px, 1px); }
  60% { transform: translate(0, -1px); }
  70% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
  90% { transform: translate(0, 0); }
  100% { transform: translate(-1px, -1px); }
}

/* トランジション */
.detail-slide-enter-active,
.detail-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.detail-slide-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.detail-slide-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hud-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .hud-stats {
    gap: 20px;
  }
  
  .detail-panel {
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .nav-controls {
    bottom: 10px;
    right: 10px;
    flex-direction: column;
  }
  
  .planet-node {
    transform: scale(0.8);
  }
}
</style>