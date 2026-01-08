<template>
  <div class="dice-animation-container">
    <!-- 3Dサイコロ -->
    <div 
      class="dice-3d" 
      :class="{ 
        'rolling': isRolling,
        'glowing': isGlowing 
      }"
      @click="$emit('roll')"
    >
      <!-- サイコロの各面 -->
      <div class="dice-face front" :data-value="diceValue">
        <div class="dice-dots">
          <span v-for="n in getDotCount(diceValue)" :key="n" class="dot"></span>
        </div>
      </div>
      <div class="dice-face back" data-value="6">
        <div class="dice-dots">
          <span v-for="n in 6" :key="n" class="dot"></span>
        </div>
      </div>
      <div class="dice-face right" data-value="2">
        <div class="dice-dots">
          <span v-for="n in 2" :key="n" class="dot"></span>
        </div>
      </div>
      <div class="dice-face left" data-value="5">
        <div class="dice-dots">
          <span v-for="n in 5" :key="n" class="dot"></span>
        </div>
      </div>
      <div class="dice-face top" data-value="3">
        <div class="dice-dots">
          <span v-for="n in 3" :key="n" class="dot"></span>
        </div>
      </div>
      <div class="dice-face bottom" data-value="4">
        <div class="dice-dots">
          <span v-for="n in 4" :key="n" class="dot"></span>
        </div>
      </div>
    </div>
    
    <!-- パーティクルエフェクト -->
    <div v-if="showParticles" class="particles-container">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="getParticleStyle(particle)"
      ></div>
    </div>
    
    <!-- 結果表示 -->
    <div v-if="showResult" class="result-display">
      <div class="result-number">{{ diceValue }}</div>
      <div class="result-text">{{ getResultText() }}</div>
    </div>
    
    <!-- ボタンラベル -->
    <div class="dice-label">
      {{ isRolling ? 'サイコロを振っています...' : 'クリックしてサイコロを振る' }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import gsap from 'gsap'

export default {
  name: 'DiceAnimation',
  props: {
    diceValue: {
      type: Number,
      default: 1,
      validator: (value) => value >= 1 && value <= 6
    },
    isRolling: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'large',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    theme: {
      type: String,
      default: 'galaxy',
      validator: (value) => ['galaxy', 'neon', 'gold', 'ruby'].includes(value)
    }
  },
  emits: ['roll', 'rollComplete'],
  setup(props, { emit }) {
    // Refs
    const isGlowing = ref(false)
    const showParticles = ref(false)
    const showResult = ref(false)
    const particles = ref([])
    
    // Computed
    const containerClasses = computed(() => [
      'dice-container',
      `dice-${props.size}`,
      `dice-theme-${props.theme}`,
      { disabled: props.disabled }
    ])
    
    // Methods
    const getDotCount = (value) => {
      return Math.max(1, Math.min(6, value || 1))
    }
    
    const getResultText = () => {
      const messages = {
        1: '残念...',
        2: 'まずまず',
        3: '普通',
        4: 'いい感じ！',
        5: 'すごい！',
        6: '最高！！'
      }
      return messages[props.diceValue] || ''
    }
    
    const createParticles = () => {
      particles.value = []
      const count = 20
      
      for (let i = 0; i < count; i++) {
        particles.value.push({
          id: i,
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100,
          size: Math.random() * 6 + 2,
          delay: Math.random() * 0.5,
          color: getParticleColor()
        })
      }
    }
    
    const getParticleColor = () => {
      const colors = {
        galaxy: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
        neon: ['#00f5ff', '#ff00ff', '#ffff00', '#00ff00'],
        gold: ['#ffd700', '#ffed4e', '#f7931e', '#ff6b35'],
        ruby: ['#ff6b6b', '#ee5a24', '#ff3838', '#c0392b']
      }
      const themeColors = colors[props.theme] || colors.galaxy
      return themeColors[Math.floor(Math.random() * themeColors.length)]
    }
    
    const getParticleStyle = (particle) => ({
      left: `calc(50% + ${particle.x}px)`,
      top: `calc(50% + ${particle.y}px)`,
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      backgroundColor: particle.color,
      animationDelay: `${particle.delay}s`
    })
    
    const animateRoll = async () => {
      if (props.disabled) return
      
      // グロー効果開始
      isGlowing.value = true
      
      // サイコロ回転アニメーション
      const dice = document.querySelector('.dice-3d')
      if (dice) {
        await gsap.to(dice, {
          rotationX: 720,
          rotationY: 720,
          scale: 1.2,
          duration: 1,
          ease: 'power2.out'
        })
        
        // 結果確定後の演出
        await gsap.to(dice, {
          scale: 1,
          duration: 0.3,
          ease: 'bounce.out'
        })
      }
      
      // パーティクル効果
      if (props.diceValue >= 4) {
        showParticles.value = true
        createParticles()
        
        setTimeout(() => {
          showParticles.value = false
        }, 2000)
      }
      
      // 結果表示
      showResult.value = true
      setTimeout(() => {
        showResult.value = false
      }, 3000)
      
      // グロー効果終了
      isGlowing.value = false
      
      emit('rollComplete', props.diceValue)
    }
    
    const handleClick = () => {
      if (!props.disabled && !props.isRolling) {
        emit('roll')
      }
    }
    
    // Watchers
    watch(() => props.isRolling, (newVal, oldVal) => {
      if (oldVal && !newVal) {
        // ローリング終了時のアニメーション
        setTimeout(() => {
          animateRoll()
        }, 100)
      }
    })
    
    watch(() => props.diceValue, () => {
      // 値が変更されたときのフェードイン効果
      const dice = document.querySelector('.dice-3d')
      if (dice) {
        gsap.fromTo(dice, 
          { scale: 0.8, opacity: 0.7 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
        )
      }
    })
    
    onMounted(() => {
      // 初期アニメーション
      const dice = document.querySelector('.dice-3d')
      if (dice) {
        gsap.fromTo(dice,
          { scale: 0, rotationY: -180 },
          { scale: 1, rotationY: 0, duration: 0.8, ease: 'back.out(1.7)' }
        )
      }
    })
    
    return {
      // State
      isGlowing,
      showParticles,
      showResult,
      particles,
      
      // Computed
      containerClasses,
      
      // Methods
      getDotCount,
      getResultText,
      getParticleStyle,
      handleClick
    }
  }
}
</script>

<style scoped>
.dice-animation-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  user-select: none;
}

/* サイコロサイズ */
.dice-container.dice-small .dice-3d {
  width: 40px;
  height: 40px;
}

.dice-container.dice-medium .dice-3d {
  width: 60px;
  height: 60px;
}

.dice-container.dice-large .dice-3d {
  width: 80px;
  height: 80px;
}

/* 3Dサイコロ */
.dice-3d {
  position: relative;
  width: 80px;
  height: 80px;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.dice-3d:hover:not(.rolling) {
  transform: scale(1.05);
}

.dice-3d.rolling {
  animation: continuous-roll 0.1s infinite linear;
}

.dice-3d.glowing {
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
}

@keyframes continuous-roll {
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }
  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}

/* サイコロの面 */
.dice-face {
  position: absolute;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.dice-face.front {
  transform: translateZ(40px);
}

.dice-face.back {
  transform: translateZ(-40px) rotateY(180deg);
}

.dice-face.right {
  transform: rotateY(90deg) translateZ(40px);
}

.dice-face.left {
  transform: rotateY(-90deg) translateZ(40px);
}

.dice-face.top {
  transform: rotateX(90deg) translateZ(40px);
}

.dice-face.bottom {
  transform: rotateX(-90deg) translateZ(40px);
}

/* ドット */
.dice-dots {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ドットの配置パターン */
.dice-face[data-value="1"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="1"] .dot:nth-child(1) {
  grid-area: 2 / 2;
}

.dice-face[data-value="2"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="2"] .dot:nth-child(1) {
  grid-area: 1 / 1;
}
.dice-face[data-value="2"] .dot:nth-child(2) {
  grid-area: 3 / 3;
}

.dice-face[data-value="3"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="3"] .dot:nth-child(1) {
  grid-area: 1 / 1;
}
.dice-face[data-value="3"] .dot:nth-child(2) {
  grid-area: 2 / 2;
}
.dice-face[data-value="3"] .dot:nth-child(3) {
  grid-area: 3 / 3;
}

.dice-face[data-value="4"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="4"] .dot:nth-child(1) {
  grid-area: 1 / 1;
}
.dice-face[data-value="4"] .dot:nth-child(2) {
  grid-area: 1 / 3;
}
.dice-face[data-value="4"] .dot:nth-child(3) {
  grid-area: 3 / 1;
}
.dice-face[data-value="4"] .dot:nth-child(4) {
  grid-area: 3 / 3;
}

.dice-face[data-value="5"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="5"] .dot:nth-child(1) {
  grid-area: 1 / 1;
}
.dice-face[data-value="5"] .dot:nth-child(2) {
  grid-area: 1 / 3;
}
.dice-face[data-value="5"] .dot:nth-child(3) {
  grid-area: 2 / 2;
}
.dice-face[data-value="5"] .dot:nth-child(4) {
  grid-area: 3 / 1;
}
.dice-face[data-value="5"] .dot:nth-child(5) {
  grid-area: 3 / 3;
}

.dice-face[data-value="6"] .dice-dots {
  grid-template: 1fr 1fr 1fr / 1fr 1fr 1fr;
}
.dice-face[data-value="6"] .dot:nth-child(1) {
  grid-area: 1 / 1;
}
.dice-face[data-value="6"] .dot:nth-child(2) {
  grid-area: 1 / 3;
}
.dice-face[data-value="6"] .dot:nth-child(3) {
  grid-area: 2 / 1;
}
.dice-face[data-value="6"] .dot:nth-child(4) {
  grid-area: 2 / 3;
}
.dice-face[data-value="6"] .dot:nth-child(5) {
  grid-area: 3 / 1;
}
.dice-face[data-value="6"] .dot:nth-child(6) {
  grid-area: 3 / 3;
}

/* テーマカラー */
.dice-theme-galaxy .dice-face {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #fff;
}

.dice-theme-galaxy .dot {
  background: #fff;
}

.dice-theme-neon .dice-face {
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
  border-color: #00f5ff;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
}

.dice-theme-neon .dot {
  background: #00f5ff;
  box-shadow: 0 0 10px #00f5ff;
}

.dice-theme-gold .dice-face {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-color: #b8860b;
}

.dice-theme-gold .dot {
  background: #8b4513;
}

.dice-theme-ruby .dice-face {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-color: #fff;
}

.dice-theme-ruby .dot {
  background: #fff;
}

/* パーティクル */
.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: particle-burst 2s ease-out forwards;
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(360deg);
  }
}

/* 結果表示 */
.result-display {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: result-show 3s ease-out forwards;
  pointer-events: none;
  z-index: 20;
}

.result-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
}

.result-text {
  font-size: 1rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

@keyframes result-show {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1.1);
  }
  30% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.8);
  }
}

/* ラベル */
.dice-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.dice-container.disabled .dice-label {
  opacity: 0.5;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .dice-container.dice-large .dice-3d,
  .dice-face {
    width: 60px;
    height: 60px;
  }
  
  .dice-face.front {
    transform: translateZ(30px);
  }
  
  .dice-face.back {
    transform: translateZ(-30px) rotateY(180deg);
  }
  
  .dice-face.right {
    transform: rotateY(90deg) translateZ(30px);
  }
  
  .dice-face.left {
    transform: rotateY(-90deg) translateZ(30px);
  }
  
  .dice-face.top {
    transform: rotateX(90deg) translateZ(30px);
  }
  
  .dice-face.bottom {
    transform: rotateX(-90deg) translateZ(30px);
  }
  
  .result-number {
    font-size: 2rem;
  }
}
</style>