<template>
  <div class="galaxy-loader" :class="loaderClasses" role="status" :aria-label="loadingMessage">
    <!-- Main Loading Container -->
    <div class="loader-container" :style="containerStyle">
      
      <!-- Background Galaxy -->
      <div class="galaxy-background">
        <div class="stars-field">
          <div 
            v-for="star in backgroundStars" 
            :key="star.id"
            class="star"
            :style="star.style"
          ></div>
        </div>
        
        <!-- Nebula Effect -->
        <div class="nebula-layer" :style="nebulaStyle"></div>
      </div>

      <!-- Planet-themed Loading Animation -->
      <div class="loading-animation" :class="`theme-${currentTheme}`">
        
        <!-- Central Loading Spinner -->
        <div class="central-spinner">
          <div class="spinner-orbit">
            <div class="spinner-planet" :class="`planet-${currentTheme}`">
              <div class="planet-core"></div>
              <div class="planet-atmosphere"></div>
              <div class="planet-rings" v-if="currentTheme === 'sound'"></div>
            </div>
            
            <!-- Orbiting Elements -->
            <div 
              v-for="(element, index) in orbitingElements" 
              :key="`orbit-${index}`"
              class="orbiting-element"
              :style="element.style"
            >
              <div class="element-glow"></div>
              <span class="element-content">{{ element.content }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Ring -->
        <div class="progress-ring-container" v-if="showProgress">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-background"
              cx="60"
              cy="60"
              r="54"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="4"
            />
            <circle
              class="progress-ring-progress"
              cx="60"
              cy="60"
              r="54"
              fill="transparent"
              :stroke="progressColor"
              stroke-width="4"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
              stroke-linecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          
          <!-- Progress Percentage -->
          <div class="progress-text">
            <span class="progress-number">{{ Math.round(progress) }}%</span>
          </div>
        </div>

        <!-- Loading Particles -->
        <div class="particle-system">
          <div 
            v-for="particle in particles" 
            :key="particle.id"
            class="particle"
            :class="`particle-${particle.type}`"
            :style="particle.style"
          ></div>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="loading-text">
        <h2 class="loading-title" :class="titleClasses">
          {{ loadingTitle }}
        </h2>
        <p class="loading-message" :class="messageClasses">
          {{ loadingMessage }}
        </p>
        
        <!-- Loading Steps (if provided) -->
        <div class="loading-steps" v-if="steps.length > 0">
          <div 
            v-for="(step, index) in steps" 
            :key="`step-${index}`"
            class="loading-step"
            :class="{ 
              'step-completed': index < currentStep,
              'step-active': index === currentStep,
              'step-pending': index > currentStep
            }"
          >
            <div class="step-indicator">
              <Icon 
                v-if="index < currentStep" 
                name="check" 
                class="step-icon step-icon-completed"
              />
              <div 
                v-else-if="index === currentStep" 
                class="step-icon step-icon-active"
              ></div>
              <div 
                v-else 
                class="step-icon step-icon-pending"
              ></div>
            </div>
            <span class="step-text">{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="loading-tips" v-if="tips.length > 0 && showTips">
        <div class="tip-container">
          <div class="tip-icon">💡</div>
          <p class="tip-text">
            <transition name="fade" mode="out-in">
              <span :key="currentTipIndex">{{ currentTip }}</span>
            </transition>
          </p>
        </div>
      </div>
    </div>

    <!-- Skip Button (for development/debug) -->
    <button 
      v-if="showSkipButton && isDev"
      @click="$emit('skip')"
      class="skip-button"
      aria-label="スキップ"
    >
      スキップ →
    </button>

    <!-- Screen Reader Only Content -->
    <div class="sr-only" aria-live="polite" aria-atomic="true">
      {{ screenReaderText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Icon from '@/components/shared/Icon.vue'

// Props
interface Props {
  theme?: 'sound' | 'word' | 'grammar' | 'speed' | 'cooperation' | 'construction' | 'vr' | 'galaxy'
  progress?: number
  title?: string
  message?: string
  steps?: string[]
  currentStep?: number
  tips?: string[]
  showProgress?: boolean
  showTips?: boolean
  showSkipButton?: boolean
  size?: 'small' | 'medium' | 'large'
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'galaxy',
  progress: 0,
  title: '',
  message: 'ロード中...',
  steps: () => [],
  currentStep: 0,
  tips: () => [],
  showProgress: true,
  showTips: true,
  showSkipButton: false,
  size: 'medium',
  overlay: true
})

// Emits
const emit = defineEmits<{
  skip: []
  complete: []
}>()

// Reactive state
const backgroundStars = ref<StarData[]>([])
const particles = ref<ParticleData[]>([])
const orbitingElements = ref<OrbitingElementData[]>([])
const currentTipIndex = ref(0)
const animationId = ref<number | null>(null)

// Development mode detection
const isDev = ref(import.meta.env.DEV)

// Computed properties
const currentTheme = computed(() => props.theme)

const loadingTitle = computed(() => {
  if (props.title) return props.title
  
  const themeNames: Record<string, string> = {
    sound: 'サウンド惑星',
    word: 'ワード惑星', 
    grammar: 'グラマー惑星',
    speed: 'スピードステーション',
    cooperation: '協力コロニー',
    construction: 'コンストラクションゾーン',
    vr: 'VRアカデミー',
    galaxy: 'ランゲージ銀河'
  }
  
  return themeNames[currentTheme.value] || 'ロード中'
})

const loadingMessage = computed(() => {
  if (props.message !== 'ロード中...') return props.message
  
  const themeMessages: Record<string, string> = {
    sound: '音の世界を準備中...',
    word: '言葉の冒険を準備中...',
    grammar: '文法の宇宙を準備中...',
    speed: '高速学習モードを準備中...',
    cooperation: '協力システムを準備中...',
    construction: '建設システムを準備中...',
    vr: 'VR空間を構築中...',
    galaxy: '銀河系を探索準備中...'
  }
  
  return themeMessages[currentTheme.value] || 'ロード中...'
})

const screenReaderText = computed(() => {
  let text = `${loadingTitle.value}: ${loadingMessage.value}`
  if (props.showProgress) {
    text += ` 進行状況: ${Math.round(props.progress)}%`
  }
  if (props.steps.length > 0) {
    text += ` ステップ ${props.currentStep + 1} / ${props.steps.length}: ${props.steps[props.currentStep] || ''}`
  }
  return text
})

const loaderClasses = computed(() => ({
  [`size-${props.size}`]: true,
  'with-overlay': props.overlay,
  [`theme-${currentTheme.value}`]: true
}))

const containerStyle = computed(() => {
  const themeColors: Record<string, string> = {
    sound: '#4a90e2',
    word: '#7ed321', 
    grammar: '#f5a623',
    speed: '#d0021b',
    cooperation: '#9013fe',
    construction: '#50e3c2',
    vr: '#bd10e0',
    galaxy: '#4a90e2'
  }
  
  return {
    '--theme-color': themeColors[currentTheme.value] || '#4a90e2'
  }
})

const nebulaStyle = computed(() => {
  const themeGradients: Record<string, string> = {
    sound: 'radial-gradient(circle, rgba(74, 144, 226, 0.3) 0%, transparent 70%)',
    word: 'radial-gradient(circle, rgba(126, 211, 33, 0.3) 0%, transparent 70%)',
    grammar: 'radial-gradient(circle, rgba(245, 166, 35, 0.3) 0%, transparent 70%)',
    speed: 'radial-gradient(circle, rgba(208, 2, 27, 0.3) 0%, transparent 70%)',
    cooperation: 'radial-gradient(circle, rgba(144, 19, 254, 0.3) 0%, transparent 70%)',
    construction: 'radial-gradient(circle, rgba(80, 227, 194, 0.3) 0%, transparent 70%)',
    vr: 'radial-gradient(circle, rgba(189, 16, 224, 0.3) 0%, transparent 70%)',
    galaxy: 'radial-gradient(circle, rgba(74, 144, 226, 0.3) 0%, transparent 70%)'
  }
  
  return {
    background: themeGradients[currentTheme.value] || themeGradients.galaxy
  }
})

const titleClasses = computed(() => ({
  'text-glow': true,
  [`text-${currentTheme.value}`]: true
}))

const messageClasses = computed(() => ({
  'text-fade': true
}))

const progressColor = computed(() => {
  const colors: Record<string, string> = {
    sound: '#4a90e2',
    word: '#7ed321',
    grammar: '#f5a623', 
    speed: '#d0021b',
    cooperation: '#9013fe',
    construction: '#50e3c2',
    vr: '#bd10e0',
    galaxy: '#4a90e2'
  }
  
  return colors[currentTheme.value] || colors.galaxy
})

const circumference = computed(() => 2 * Math.PI * 54)

const progressOffset = computed(() => {
  const offset = circumference.value - (props.progress / 100) * circumference.value
  return offset
})

const currentTip = computed(() => {
  if (props.tips.length === 0) return ''
  return props.tips[currentTipIndex.value] || ''
})

// Interface definitions
interface StarData {
  id: number
  style: Record<string, string>
}

interface ParticleData {
  id: number
  type: string
  style: Record<string, string>
}

interface OrbitingElementData {
  content: string
  style: Record<string, string>
}

// Methods
const generateBackgroundStars = () => {
  backgroundStars.value = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
      opacity: (0.3 + Math.random() * 0.7).toString()
    }
  }))
}

const generateParticles = () => {
  const particleCount = currentTheme.value === 'vr' ? 30 : 20
  const particleTypes = getParticleTypes()
  
  particles.value = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`
    }
  }))
}

const getParticleTypes = (): string[] => {
  const typeMap: Record<string, string[]> = {
    sound: ['note', 'wave', 'frequency'],
    word: ['letter', 'word', 'book'],
    grammar: ['bracket', 'comma', 'period'],
    speed: ['lightning', 'arrow', 'flame'],
    cooperation: ['hand', 'heart', 'star'],
    construction: ['block', 'gear', 'tool'],
    vr: ['cube', 'sphere', 'polygon'],
    galaxy: ['star', 'planet', 'comet']
  }
  
  return typeMap[currentTheme.value] || typeMap.galaxy
}

const generateOrbitingElements = () => {
  const elements = getOrbitingElementContent()
  
  orbitingElements.value = elements.map((content, i) => ({
    content,
    style: {
      '--orbit-delay': `${i * 0.5}s`,
      '--orbit-duration': '8s',
      '--orbit-radius': '80px'
    }
  }))
}

const getOrbitingElementContent = (): string[] => {
  const contentMap: Record<string, string[]> = {
    sound: ['🎵', '🎶', '🔊', '🎤'],
    word: ['📚', '✏️', '📝', '💭'],
    grammar: ['📖', '🔤', '📋', '✅'],
    speed: ['⚡', '🚀', '💨', '⭐'],
    cooperation: ['🤝', '👥', '💪', '🌟'],
    construction: ['🔨', '⚙️', '🏗️', '🔧'],
    vr: ['🥽', '🌐', '🎮', '🚀'],
    galaxy: ['🌌', '⭐', '🌍', '🛸']
  }
  
  return contentMap[currentTheme.value] || contentMap.galaxy
}

const rotateTips = () => {
  if (props.tips.length <= 1) return
  
  setInterval(() => {
    currentTipIndex.value = (currentTipIndex.value + 1) % props.tips.length
  }, 4000)
}

const animate = () => {
  // Update particle positions and effects
  updateParticles()
  
  animationId.value = requestAnimationFrame(animate)
}

const updateParticles = () => {
  // Custom particle animation logic
  particles.value.forEach(particle => {
    // Update particle positions for smooth animation
    // This could include physics-based movement
  })
}

// Watchers
watch(() => props.progress, (newProgress) => {
  if (newProgress >= 100) {
    setTimeout(() => {
      emit('complete')
    }, 500)
  }
}, { immediate: true })

watch(() => currentTheme.value, () => {
  generateParticles()
  generateOrbitingElements()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  generateBackgroundStars()
  generateParticles()
  generateOrbitingElements()
  
  if (props.tips.length > 1) {
    rotateTips()
  }
  
  // Start animation loop
  animate()
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.galaxy-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0a0a23 0%, #000000 100%);
  overflow: hidden;
}

.galaxy-loader.with-overlay {
  backdrop-filter: blur(4px);
}

.loader-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Background Effects */
.galaxy-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.stars-field {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.nebula-layer {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  animation: nebulaPulse 4s ease-in-out infinite alternate;
}

@keyframes nebulaPulse {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.05); }
}

/* Loading Animation */
.loading-animation {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
}

.central-spinner {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.spinner-orbit {
  position: relative;
  width: 100%;
  height: 100%;
  animation: rotate 10s linear infinite;
}

.spinner-planet {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--theme-color);
  box-shadow: 
    0 0 20px var(--theme-color),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  animation: planetSpin 4s linear infinite;
}

.planet-core {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%);
}

.planet-atmosphere {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 60%, var(--theme-color) 70%, transparent 80%);
  opacity: 0.5;
  animation: atmospherePulse 3s ease-in-out infinite alternate;
}

.planet-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%) rotateX(75deg);
  border: 2px solid var(--theme-color);
  border-radius: 50%;
  opacity: 0.6;
}

.planet-rings::after {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid var(--theme-color);
  border-radius: 50%;
  opacity: 0.4;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes planetSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes atmospherePulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.7; transform: scale(1.1); }
}

/* Orbiting Elements */
.orbiting-element {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  transform-origin: var(--orbit-radius);
  animation: orbit var(--orbit-duration) linear infinite;
  animation-delay: var(--orbit-delay);
}

.element-content {
  display: block;
  font-size: 20px;
  animation: counterRotate var(--orbit-duration) linear infinite reverse;
}

.element-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--theme-color);
  opacity: 0.3;
  animation: glowPulse 2s ease-in-out infinite alternate;
}

@keyframes orbit {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes counterRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes glowPulse {
  0% { opacity: 0.2; transform: scale(0.8); }
  100% { opacity: 0.5; transform: scale(1.2); }
}

/* Progress Ring */
.progress-ring-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.5s ease-in-out;
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--theme-color);
  text-shadow: 0 0 10px var(--theme-color);
}

/* Particles */
.particle-system {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--theme-color);
  border-radius: 50%;
  animation: float linear infinite;
  opacity: 0.7;
}

.particle-note::after { content: '♪'; }
.particle-wave::after { content: '〰️'; }
.particle-letter::after { content: 'A'; }

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0);
    opacity: 0;
  }
}

/* Loading Text */
.loading-text {
  position: relative;
  z-index: 3;
  margin-bottom: 2rem;
}

.loading-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 0 20px var(--theme-color);
}

.text-glow {
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textGlow {
  0% { text-shadow: 0 0 20px var(--theme-color); }
  100% { text-shadow: 0 0 30px var(--theme-color), 0 0 40px var(--theme-color); }
}

.loading-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

/* Loading Steps */
.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.step-indicator {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.step-icon-completed {
  background: #10b981;
  color: white;
}

.step-icon-active {
  background: var(--theme-color);
  animation: pulse 1.5s ease-in-out infinite;
}

.step-icon-pending {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.step-text {
  color: white;
  font-size: 0.9rem;
}

.step-completed .step-text {
  opacity: 0.7;
}

.step-active .step-text {
  font-weight: 600;
}

.step-pending .step-text {
  opacity: 0.5;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Tips Section */
.loading-tips {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: 400px;
  z-index: 3;
}

.tip-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

/* Skip Button */
.skip-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 4;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Size Variations */
.size-small .central-spinner {
  width: 150px;
  height: 150px;
}

.size-small .spinner-planet {
  width: 45px;
  height: 45px;
}

.size-large .central-spinner {
  width: 250px;
  height: 250px;
}

.size-large .spinner-planet {
  width: 75px;
  height: 75px;
}

/* Theme-specific styles */
.theme-sound .spinner-planet {
  background: linear-gradient(45deg, #4a90e2, #357abd);
}

.theme-word .spinner-planet {
  background: linear-gradient(45deg, #7ed321, #6ab91d);
}

.theme-grammar .spinner-planet {
  background: linear-gradient(45deg, #f5a623, #e8960f);
}

.theme-speed .spinner-planet {
  background: linear-gradient(45deg, #d0021b, #b30217);
}

.theme-cooperation .spinner-planet {
  background: linear-gradient(45deg, #9013fe, #7c0fd4);
}

.theme-construction .spinner-planet {
  background: linear-gradient(45deg, #50e3c2, #44c7a5);
}

.theme-vr .spinner-planet {
  background: linear-gradient(45deg, #bd10e0, #a00bc7);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .spinner-orbit,
  .orbiting-element,
  .particle {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  
  .text-glow,
  .atmospherePulse,
  .glowPulse {
    animation: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .galaxy-loader {
    background: #000;
  }
  
  .loading-title,
  .loading-message {
    color: #fff;
    text-shadow: none;
  }
  
  .spinner-planet {
    border: 2px solid #fff;
  }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .loading-title {
    font-size: 1.5rem;
  }
  
  .central-spinner {
    width: 150px;
    height: 150px;
  }
  
  .spinner-planet {
    width: 45px;
    height: 45px;
  }
  
  .loading-steps {
    max-width: 300px;
  }
  
  .loading-tips {
    max-width: 320px;
    bottom: 1rem;
  }
}
</style>