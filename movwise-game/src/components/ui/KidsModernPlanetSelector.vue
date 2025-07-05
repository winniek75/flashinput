<template>
  <div class="kids-galaxy-container">
    <!-- かわいい星空背景 -->
    <div class="starry-background">
      <div v-for="i in 100" :key="i" class="twinkling-star" :style="getStarStyle(i)"></div>
      <div class="shooting-stars">
        <div v-for="i in 3" :key="i" class="shooting-star" :style="`animation-delay: ${i * 2}s`"></div>
      </div>
    </div>
    
    <!-- かわいいキラキラエフェクト -->
    <div class="sparkle-field">
      <div v-for="i in 20" :key="i" class="sparkle" :style="getSparkleStyle(i)">✨</div>
    </div>
    
    <!-- メインインターフェース -->
    <div class="main-interface">
      <!-- 上部ヘッダー -->
      <div class="cute-header">
        <div class="header-left">
          <h1 class="galaxy-title">
            <span class="title-sparkle">✨</span>
            <span class="title-text">さうんど★ぎゃらくしー</span>
            <span class="title-sparkle">✨</span>
          </h1>
          <p class="subtitle">〜音の世界を冒険しよう〜</p>
        </div>
        
        <div class="stats-panel">
          <div class="stat-bubble energy">
            <div class="stat-icon">⚡</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalEnergy.toLocaleString() }}</span>
              <span class="stat-label">エネルギー</span>
            </div>
          </div>
          <div class="stat-bubble progress">
            <div class="stat-icon">🌟</div>
            <div class="stat-info">
              <span class="stat-value">{{ galaxyProgress }}%</span>
              <span class="stat-label">たんけん度</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中央のアカデミー -->
      <div class="academy-center">
        <div class="academy-rings">
          <div class="ring ring-outer"></div>
          <div class="ring ring-middle"></div>
          <div class="ring ring-inner"></div>
        </div>
        <div class="academy-core">
          <div class="core-glow"></div>
          <div class="academy-icon">🌟</div>
          <div class="rainbow-waves"></div>
        </div>
        <div class="academy-label">
          <span class="label-main">サウンドアカデミー</span>
          <span class="label-sub">ほんぶ</span>
        </div>
      </div>
      
      <!-- 惑星エリア -->
      <div class="planets-area">
        <div
          v-for="(planet, index) in planets"
          :key="planet.id"
          class="planet-container"
          :class="[
            `planet-${planet.id}`,
            `position-${index + 1}`,
            {
              'planet-locked': !planet.unlocked,
              'planet-selected': selectedPlanet?.id === planet.id,
              'planet-bouncing': planet.unlocked && !selectedPlanet
            }
          ]"
          @click="selectPlanet(planet)"
          @mouseenter="hoveredPlanet = planet"
          @mouseleave="hoveredPlanet = null"
        >
          <!-- 惑星への道 -->
          <div class="planet-path" :class="{ 'path-glowing': planet.unlocked }">
            <div v-for="i in 5" :key="i" class="path-dot" :style="`animation-delay: ${i * 0.2}s`"></div>
          </div>
          
          <!-- 惑星本体 -->
          <div class="planet-sphere">
            <div class="planet-base" :style="{ background: planet.gradient }">
              <div class="planet-face">{{ planet.emoji }}</div>
              <div v-if="!planet.unlocked" class="lock-overlay">
                <div class="lock-icon">🔒</div>
              </div>
              <!-- かわいい表情 -->
              <div v-if="planet.unlocked" class="planet-expression">
                <div class="eyes">
                  <span class="eye">👁️</span>
                  <span class="eye">👁️</span>
                </div>
                <div class="mouth">{{ planet.mood }}</div>
              </div>
            </div>
            
            <!-- 進捗リング -->
            <div v-if="planet.unlocked" class="progress-ring">
              <svg class="progress-svg" viewBox="0 0 60 60">
                <circle
                  class="progress-bg"
                  cx="30"
                  cy="30"
                  r="25"
                  stroke-width="4"
                  fill="none"
                />
                <circle
                  class="progress-fill"
                  cx="30"
                  cy="30"
                  r="25"
                  stroke-width="4"
                  fill="none"
                  :stroke-dasharray="`${planet.progress * 1.57} 157`"
                  :stroke="planet.color"
                />
              </svg>
              <div class="progress-percent">{{ planet.progress }}%</div>
            </div>
            
            <!-- ふわふわエフェクト -->
            <div v-if="planet.unlocked" class="floating-hearts">
              <div v-for="i in 3" :key="i" class="heart" :style="`animation-delay: ${i * 0.7}s`">💖</div>
            </div>
          </div>
          
          <!-- 惑星名プレート -->
          <div class="name-tag">
            <div class="tag-content">
              <h3 class="planet-name">{{ planet.name }}</h3>
              <p class="planet-subtitle">{{ planet.subtitle }}</p>
              <div v-if="planet.unlocked" class="difficulty-stars">
                <span v-for="i in planet.difficulty" :key="i" class="star filled">⭐</span>
                <span v-for="i in (5 - planet.difficulty)" :key="i + planet.difficulty" class="star empty">☆</span>
              </div>
            </div>
          </div>
          
          <!-- NEW バッジ -->
          <div v-if="planet.isNew" class="new-badge">
            <span class="badge-text">あたらしい！</span>
          </div>
        </div>
      </div>
      
      <!-- 選択された惑星の詳細 -->
      <transition name="panel-slide">
        <div v-if="selectedPlanet" class="detail-card">
          <button @click="selectedPlanet = null" class="close-btn">❌</button>
          
          <div class="card-header">
            <div class="planet-avatar">{{ selectedPlanet.emoji }}</div>
            <div class="planet-info">
              <h2 class="planet-title">{{ selectedPlanet.name }}</h2>
              <p class="planet-description">{{ selectedPlanet.description }}</p>
            </div>
          </div>
          
          <div v-if="selectedPlanet.unlocked" class="card-content">
            <div class="mission-stats">
              <div class="mission-item">
                <span class="mission-emoji">🎮</span>
                <span class="mission-text">ゲーム</span>
                <span class="mission-count">{{ selectedPlanet.gameCount }}こ</span>
              </div>
              <div class="mission-item">
                <span class="mission-emoji">🏆</span>
                <span class="mission-text">クリア</span>
                <span class="mission-count">{{ selectedPlanet.mastered }}/{{ selectedPlanet.totalItems }}</span>
              </div>
              <div class="mission-item">
                <span class="mission-emoji">💎</span>
                <span class="mission-text">しゅうかく</span>
                <span class="mission-count">{{ selectedPlanet.achievements }}こ</span>
              </div>
            </div>
            
            <div class="rewards-preview">
              <h4 class="rewards-title">🎁 もらえるもの</h4>
              <div class="reward-items">
                <div v-for="reward in selectedPlanet.rewards" :key="reward.type" class="reward-item">
                  <span class="reward-icon">{{ reward.icon }}</span>
                  <span class="reward-name">{{ reward.name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="unlock-info">
            <div class="unlock-icon">🔐</div>
            <p class="unlock-text">{{ selectedPlanet.unlockRequirement }}</p>
          </div>
          
          <button
            v-if="selectedPlanet.unlocked"
            @click="enterPlanet(selectedPlanet)"
            class="adventure-btn"
          >
            <span class="btn-icon">🚀</span>
            <span class="btn-text">{{ selectedPlanet.name }}にいく！</span>
          </button>
        </div>
      </transition>
      
      <!-- 下部ナビゲーション -->
      <div class="bottom-nav">
        <button @click="$emit('back')" class="nav-button back-btn">
          <span class="btn-emoji">🏠</span>
          <span class="btn-label">ホームにもどる</span>
        </button>
        
        <button @click="showHelp = !showHelp" class="nav-button help-btn">
          <span class="btn-emoji">💡</span>
          <span class="btn-label">ヘルプ</span>
        </button>
        
        <button @click="toggleMusic" class="nav-button music-btn">
          <span class="btn-emoji">{{ musicEnabled ? '🎵' : '🔇' }}</span>
          <span class="btn-label">{{ musicEnabled ? 'おんがく' : 'みゅーと' }}</span>
        </button>
      </div>
    </div>
    
    <!-- ヘルプモーダル -->
    <transition name="help-modal">
      <div v-if="showHelp" class="help-overlay" @click="showHelp = false">
        <div class="help-content" @click.stop>
          <h3 class="help-title">🌟 ぎゃらくしーまっぷのつかいかた</h3>
          <div class="help-steps">
            <div class="help-step">
              <span class="step-number">1️⃣</span>
              <p>きになる惑星をクリックしてね！</p>
            </div>
            <div class="help-step">
              <span class="step-number">2️⃣</span>
              <p>詳細をみて、冒険にでかけよう！</p>
            </div>
            <div class="help-step">
              <span class="step-number">3️⃣</span>
              <p>ゲームをクリアして星を集めよう⭐</p>
            </div>
          </div>
          <button @click="showHelp = false" class="help-close">わかった！</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'KidsModernPlanetSelector',
  emits: ['select-planet', 'enter-planet', 'back'],
  setup(_, { emit }) {
    const gameStore = useGameStore()
    
    const selectedPlanet = ref(null)
    const hoveredPlanet = ref(null)
    const showHelp = ref(false)
    const musicEnabled = ref(true)
    
    // 子供向け惑星データ
    const planets = ref([
      {
        id: 'phonics',
        name: 'おとのほし',
        subtitle: 'えいごのおとをおぼえよう',
        emoji: '🟡',
        mood: '😊',
        description: '44個のえいごの音をおぼえる、たのしい惑星だよ！音の妖精たちがまってるよ〜',
        unlocked: true,
        progress: 75,
        difficulty: 2,
        gameCount: 12,
        mastered: 33,
        totalItems: 44,
        achievements: 8,
        isNew: false,
        unlockRequirement: 'さいしょからあそべるよ！',
        gradient: 'radial-gradient(circle at 30% 30%, #FFE135, #FFA726, #FF7043)',
        color: '#FFD700',
        rewards: [
          { icon: '🧚‍♀️', name: 'おとのようせい', type: 'character' },
          { icon: '⭐', name: 'おとのほし', type: 'star' },
          { icon: '🎵', name: 'きれいなおと', type: 'sound' }
        ]
      },
      {
        id: 'grammar',
        name: 'ぶんぽうのうちゅう',
        subtitle: 'ことばのじゅんばんをならおう',
        emoji: '🔵',
        mood: '🤓',
        description: 'ことばの順番やルールをおぼえる宇宙だよ！ぶんぽうの魔法使いがおしえてくれるよ',
        unlocked: true,
        progress: 35,
        difficulty: 3,
        gameCount: 8,
        mastered: 7,
        totalItems: 20,
        achievements: 3,
        isNew: false,
        unlockRequirement: 'おとのほし 20%クリア',
        gradient: 'radial-gradient(circle at 30% 30%, #42A5F5, #1E88E5, #1565C0)',
        color: '#2196F3',
        rewards: [
          { icon: '🧙‍♂️', name: 'ぶんぽうまほうつかい', type: 'character' },
          { icon: '📚', name: 'まほうのほん', type: 'book' },
          { icon: '✨', name: 'まほうのちから', type: 'magic' }
        ]
      },
      {
        id: 'vocabulary',
        name: 'たんごのむら',
        subtitle: 'たくさんのことばをあつめよう',
        emoji: '🟢',
        mood: '🛍️',
        description: 'たくさんの英語の単語をあつめる村だよ！おかいものをしながらたんごをおぼえよう',
        unlocked: true,
        progress: 45,
        difficulty: 2,
        gameCount: 6,
        mastered: 450,
        totalItems: 1000,
        achievements: 5,
        isNew: false,
        unlockRequirement: 'おとのほし 30%クリア',
        gradient: 'radial-gradient(circle at 30% 30%, #66BB6A, #43A047, #2E7D32)',
        color: '#4CAF50',
        rewards: [
          { icon: '🛒', name: 'おかいものかご', type: 'item' },
          { icon: '🏪', name: 'おみせやさん', type: 'building' },
          { icon: '💰', name: 'おかね', type: 'currency' }
        ]
      },
      {
        id: 'pattern',
        name: 'パターンらんど',
        subtitle: 'きそくをみつけてかしこくなろう',
        emoji: '🟣',
        mood: '🤖',
        description: 'えいごのパターンやきそくをみつける、ちょっとむずかしい惑星だよ！',
        unlocked: false,
        progress: 0,
        difficulty: 4,
        gameCount: 5,
        mastered: 0,
        totalItems: 50,
        achievements: 0,
        isNew: true,
        unlockRequirement: 'ぶんぽうのうちゅう 50%クリア',
        gradient: 'radial-gradient(circle at 30% 30%, #AB47BC, #8E24AA, #6A1B9A)',
        color: '#9C27B0',
        rewards: [
          { icon: '🧠', name: 'かしこさアップ', type: 'boost' },
          { icon: '🔍', name: 'たんていどうぐ', type: 'tool' },
          { icon: '🎯', name: 'パターンマスター', type: 'title' }
        ]
      },
      {
        id: 'practice',
        name: 'じっせんポート',
        subtitle: 'ほんもののえいごにちょうせん',
        emoji: '🚀',
        mood: '😎',
        description: 'ほんとうのえいごかいわにちょうせんする宇宙ポートだよ！VRでぼうけんもできるよ',
        unlocked: false,
        progress: 0,
        difficulty: 5,
        gameCount: 4,
        mastered: 0,
        totalItems: 30,
        achievements: 0,
        isNew: true,
        unlockRequirement: '3つのほしで30%いじょうクリア',
        gradient: 'radial-gradient(circle at 30% 30%, #EF5350, #E53935, #C62828)',
        color: '#F44336',
        rewards: [
          { icon: '🎤', name: 'えいごでおはなし', type: 'skill' },
          { icon: '🌍', name: 'せかいのともだち', type: 'friend' },
          { icon: '🏆', name: 'えいごマスター', type: 'achievement' }
        ]
      }
    ])
    
    // 統計
    const galaxyProgress = computed(() => {
      const totalProgress = planets.value.reduce((sum, planet) => sum + planet.progress, 0)
      return Math.round(totalProgress / planets.value.length)
    })
    
    const totalEnergy = computed(() => gameStore.spaceshipStatus.cosmicEnergy || 0)
    
    // スタイル生成関数
    const getStarStyle = (index) => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      const size = Math.random() * 2 + 1
      const duration = Math.random() * 3 + 2
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${Math.random() * 2}s`
      }
    }
    
    const getSparkleStyle = (index) => {
      const x = Math.random() * 100
      const y = Math.random() * 100
      const duration = Math.random() * 4 + 3
      
      return {
        left: `${x}%`,
        top: `${y}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${Math.random() * 3}s`
      }
    }
    
    const selectPlanet = (planet) => {
      selectedPlanet.value = selectedPlanet.value?.id === planet.id ? null : planet
      emit('select-planet', planet)
    }
    
    const enterPlanet = (planet) => {
      emit('enter-planet', planet)
    }
    
    const toggleMusic = () => {
      musicEnabled.value = !musicEnabled.value
    }
    
    onMounted(() => {
      // 惑星の登場アニメーション
      const planets = document.querySelectorAll('.planet-container')
      planets.forEach((planet, index) => {
        setTimeout(() => {
          planet.classList.add('animate-in')
        }, index * 300 + 500)
      })
    })
    
    return {
      planets,
      selectedPlanet,
      hoveredPlanet,
      showHelp,
      musicEnabled,
      galaxyProgress,
      totalEnergy,
      getStarStyle,
      getSparkleStyle,
      selectPlanet,
      enterPlanet,
      toggleMusic
    }
  }
}
</script>

<style scoped>
.kids-galaxy-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5e35b1 100%);
  overflow: hidden;
  font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
}

/* かわいい星空背景 */
.starry-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.twinkling-star {
  position: absolute;
  color: white;
  animation: twinkle infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.shooting-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shooting-star {
  position: absolute;
  top: 10%;
  left: 0;
  width: 2px;
  height: 2px;
  background: linear-gradient(90deg, #fff, transparent);
  border-radius: 50%;
  animation: shoot 5s linear infinite;
}

@keyframes shoot {
  0% {
    left: -10%;
    top: 10%;
    opacity: 1;
  }
  100% {
    left: 110%;
    top: 80%;
    opacity: 0;
  }
}

/* キラキラエフェクト */
.sparkle-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 16px;
  animation: sparkle-float infinite;
}

@keyframes sparkle-float {
  0%, 100% { 
    opacity: 0; 
    transform: translateY(0) rotate(0deg) scale(0.5); 
  }
  50% { 
    opacity: 1; 
    transform: translateY(-20px) rotate(180deg) scale(1); 
  }
}

/* メインインターフェース */
.main-interface {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* ヘッダー */
.cute-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
}

.galaxy-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.title-sparkle {
  font-size: 32px;
  animation: sparkle-dance 2s ease-in-out infinite;
}

@keyframes sparkle-dance {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(15deg) scale(1.1); }
}

.title-text {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(45deg, #ff6b9d, #ffa726, #66bb6a, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: rainbow-text 3s ease-in-out infinite;
}

@keyframes rainbow-text {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0 0;
}

.stats-panel {
  display: flex;
  gap: 20px;
}

.stat-bubble {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 255, 255, 0.2);
}

.stat-icon {
  font-size: 24px;
  animation: stat-bounce 2s ease-in-out infinite;
}

@keyframes stat-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* アカデミー中央 */
.academy-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.academy-rings {
  position: relative;
  width: 200px;
  height: 200px;
}

.ring {
  position: absolute;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: ring-rotate 20s linear infinite;
}

.ring-outer {
  inset: 0;
  border-color: rgba(255, 107, 157, 0.5);
  animation-duration: 15s;
}

.ring-middle {
  inset: 20px;
  border-color: rgba(102, 187, 106, 0.5);
  animation-duration: 25s;
  animation-direction: reverse;
}

.ring-inner {
  inset: 40px;
  border-color: rgba(66, 165, 245, 0.5);
  animation-duration: 20s;
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.academy-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.core-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 50%;
  animation: core-pulse 3s ease-in-out infinite;
}

@keyframes core-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.academy-icon {
  font-size: 60px;
  animation: academy-spin 4s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
  z-index: 1;
}

@keyframes academy-spin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.05); }
}

.rainbow-waves {
  position: absolute;
  inset: -30px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b9d, #ffa726, #66bb6a, #42a5f5) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: exclude;
  animation: rainbow-wave 5s ease-in-out infinite;
}

@keyframes rainbow-wave {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.7; }
}

.academy-label {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 8px 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.label-main {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #5e35b1;
  margin-bottom: 2px;
}

.label-sub {
  display: block;
  font-size: 12px;
  color: #7e57c2;
}

/* 惑星エリア */
.planets-area {
  position: absolute;
  inset: 0;
}

.planet-container {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.5);
}

.planet-container.animate-in {
  opacity: 1;
  transform: scale(1);
  animation: planet-entrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes planet-entrance {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.planet-bouncing {
  animation: gentle-bounce 4s ease-in-out infinite;
}

@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 惑星配置 */
.position-1 { top: 15%; left: 20%; }
.position-2 { top: 25%; right: 15%; }
.position-3 { bottom: 25%; left: 15%; }
.position-4 { bottom: 20%; right: 25%; }
.position-5 { top: 65%; left: 50%; transform: translateX(-50%); }

/* 惑星への道 */
.planet-path {
  position: absolute;
  width: 3px;
  height: 80px;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, 
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  border-radius: 2px;
}

.path-glowing {
  background: linear-gradient(to bottom, 
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.path-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  left: 50%;
  transform: translateX(-50%);
  animation: path-flow 3s linear infinite;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

@keyframes path-flow {
  0% {
    top: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 80px;
    opacity: 0;
  }
}

/* 惑星本体 */
.planet-sphere {
  position: relative;
  width: 100px;
  height: 100px;
}

.planet-base {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.planet-container:hover .planet-base {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.planet-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.planet-expression {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.eyes {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.eye {
  font-size: 8px;
  animation: blink 3s ease-in-out infinite;
}

@keyframes blink {
  0%, 95%, 100% { opacity: 1; }
  97.5% { opacity: 0; }
}

.mouth {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 3;
}

.lock-icon {
  font-size: 30px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
}

/* 進捗リング */
.progress-ring {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.progress-svg {
  width: 35px;
  height: 35px;
  transform: rotate(-90deg);
  position: absolute;
}

.progress-bg {
  stroke: rgba(0, 0, 0, 0.1);
}

.progress-fill {
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
  filter: drop-shadow(0 0 3px currentColor);
}

.progress-percent {
  font-size: 10px;
  font-weight: bold;
  color: #333;
}

/* ふわふわハート */
.floating-hearts {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 12px;
  animation: heart-float 4s ease-in-out infinite;
}

.heart:nth-child(1) { top: 20%; left: 80%; }
.heart:nth-child(2) { top: 70%; left: 10%; animation-delay: 1s; }
.heart:nth-child(3) { top: 40%; right: 5%; animation-delay: 2s; }

@keyframes heart-float {
  0%, 100% { 
    opacity: 0; 
    transform: translateY(0) scale(0.5); 
  }
  50% { 
    opacity: 1; 
    transform: translateY(-20px) scale(1); 
  }
}

/* 名前プレート */
.name-tag {
  position: absolute;
  bottom: -70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 12px 16px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.tag-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.planet-name {
  font-size: 16px;
  font-weight: bold;
  color: #5e35b1;
  margin: 0;
}

.planet-subtitle {
  font-size: 12px;
  color: #7e57c2;
  margin: 0;
}

.difficulty-stars {
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-top: 4px;
}

.star {
  font-size: 12px;
}

.star.filled {
  color: #ffa726;
  text-shadow: 0 0 5px #ffa726;
}

.star.empty {
  color: #ddd;
}

/* NEW バッジ */
.new-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(45deg, #ff6b9d, #ffa726);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  animation: new-badge-pulse 2s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
}

@keyframes new-badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.badge-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* ロック状態 */
.planet-locked {
  opacity: 0.6;
  filter: grayscale(70%);
}

.planet-locked .planet-path {
  opacity: 0.3;
}

/* 選択状態 */
.planet-selected .planet-base {
  border-color: #ffa726;
  box-shadow: 0 0 30px rgba(255, 167, 38, 0.6);
}

/* 詳細カード */
.detail-card {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 400px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.8);
  color: #333;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  transform: scale(1.1);
}

.card-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.planet-avatar {
  font-size: 60px;
  flex-shrink: 0;
}

.planet-info {
  flex: 1;
}

.planet-title {
  font-size: 24px;
  font-weight: bold;
  color: #5e35b1;
  margin: 0 0 8px 0;
}

.planet-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.card-content {
  margin-bottom: 20px;
}

.mission-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mission-item {
  background: rgba(94, 53, 177, 0.1);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  border: 2px solid rgba(94, 53, 177, 0.2);
}

.mission-emoji {
  display: block;
  font-size: 24px;
  margin-bottom: 4px;
}

.mission-text {
  display: block;
  font-size: 12px;
  color: #7e57c2;
  margin-bottom: 4px;
}

.mission-count {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #5e35b1;
}

.rewards-preview {
  background: rgba(255, 167, 38, 0.1);
  border-radius: 12px;
  padding: 15px;
  border: 2px solid rgba(255, 167, 38, 0.3);
}

.rewards-title {
  font-size: 16px;
  color: #f57c00;
  margin: 0 0 12px 0;
  text-align: center;
}

.reward-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.reward-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  border: 1px solid rgba(255, 167, 38, 0.3);
}

.reward-icon {
  font-size: 16px;
}

.reward-name {
  color: #5e35b1;
  font-weight: bold;
}

.unlock-info {
  background: rgba(255, 193, 7, 0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  border: 2px solid rgba(255, 193, 7, 0.3);
  margin-bottom: 15px;
}

.unlock-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.unlock-text {
  font-size: 14px;
  color: #f57c00;
  margin: 0;
}

.adventure-btn {
  width: 100%;
  background: linear-gradient(45deg, #66bb6a, #42a5f5);
  border: none;
  border-radius: 15px;
  padding: 15px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 187, 106, 0.3);
}

.adventure-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 187, 106, 0.4);
}

.btn-icon {
  font-size: 24px;
}

/* 下部ナビゲーション */
.bottom-nav {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
}

.nav-button {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  backdrop-filter: blur(10px);
}

.nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.btn-emoji {
  font-size: 24px;
}

.btn-label {
  font-size: 12px;
  color: #5e35b1;
  font-weight: bold;
}

/* ヘルプモーダル */
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.help-content {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.help-title {
  font-size: 20px;
  color: #5e35b1;
  margin: 0 0 20px 0;
}

.help-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.help-step {
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
}

.step-number {
  font-size: 24px;
  flex-shrink: 0;
}

.help-step p {
  margin: 0;
  color: #666;
}

.help-close {
  background: linear-gradient(45deg, #66bb6a, #42a5f5);
  border: none;
  border-radius: 15px;
  padding: 12px 24px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 187, 106, 0.3);
}

/* トランジション */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.help-modal-enter-active,
.help-modal-leave-active {
  transition: all 0.3s ease;
}

.help-modal-enter-from,
.help-modal-leave-to {
  opacity: 0;
}

.help-modal-enter-from .help-content,
.help-modal-leave-to .help-content {
  transform: scale(0.8);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .cute-header {
    padding: 15px 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .stats-panel {
    gap: 15px;
  }
  
  .detail-card {
    left: 10px;
    right: 10px;
    width: auto;
  }
  
  .bottom-nav {
    bottom: 10px;
    right: 10px;
    flex-direction: column;
  }
  
  .planet-container {
    transform: scale(0.8);
  }
  
  .academy-center {
    transform: translate(-50%, -50%) scale(0.8);
  }
}
</style>