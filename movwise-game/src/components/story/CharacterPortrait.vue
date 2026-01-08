<template>
  <div 
    class="character-portrait-container"
    :class="[
      `character-${character.id}`,
      `emotion-${currentEmotion}`,
      { 
        'is-speaking': isSpeaking,
        'is-thinking': isThinking,
        'is-highlighted': isHighlighted,
        'is-entering': isEntering,
        'is-exiting': isExiting
      }
    ]"
    :style="portraitStyle"
  >
    <!-- Character Background Aura -->
    <div 
      class="character-aura"
      :style="{ 
        '--aura-primary': character.appearance.colors.primary,
        '--aura-secondary': character.appearance.colors.secondary 
      }"
    ></div>

    <!-- Main Portrait Image -->
    <div class="portrait-wrapper">
      <img 
        :src="currentPortraitImage"
        :alt="`${character.name} - ${currentEmotion}`"
        class="portrait-image"
        @load="onImageLoad"
        @error="onImageError"
      />
      
      <!-- Expression Overlay for Smooth Transitions -->
      <img 
        v-if="transitionImage"
        :src="transitionImage"
        class="portrait-image portrait-transition"
        :style="{ opacity: transitionOpacity }"
      />
    </div>

    <!-- Character Name Label -->
    <div 
      v-if="showNameLabel"
      class="character-name-label"
      :style="{ 
        '--name-color': character.appearance.colors.accent,
        '--bg-color': character.appearance.colors.primary 
      }"
    >
      <span class="character-name">{{ character.name }}</span>
      <span v-if="character.title" class="character-title">{{ character.title }}</span>
    </div>

    <!-- Speaking Indicator -->
    <div v-if="isSpeaking" class="speaking-indicator">
      <div class="speech-bubble">
        <div class="bubble-dot"></div>
        <div class="bubble-dot"></div>
        <div class="bubble-dot"></div>
      </div>
    </div>

    <!-- Emotion Particles -->
    <div class="emotion-particles" v-if="showEmotionEffects">
      <div 
        v-for="n in particleCount" 
        :key="n"
        class="particle"
        :style="getParticleStyle(n)"
      ></div>
    </div>

    <!-- Character Status Effects -->
    <div class="character-effects">
      <!-- Relationship Heart -->
      <div 
        v-if="showRelationship && character.relationships.playerAffinity > 80"
        class="relationship-heart"
      >
        ❤️
      </div>
      
      <!-- Planet Symbol -->
      <div 
        v-if="showPlanetSymbol"
        class="planet-symbol"
        :title="`From ${character.planet}`"
      >
        {{ getPlanetEmoji(character.planet) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Character, EmotionType } from '@/story/characters/CharacterDatabase'

// Props
interface Props {
  character: Character
  emotion?: EmotionType
  isSpeaking?: boolean
  isThinking?: boolean
  isHighlighted?: boolean
  showNameLabel?: boolean
  showRelationship?: boolean
  showPlanetSymbol?: boolean
  showEmotionEffects?: boolean
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  position?: 'left' | 'center' | 'right'
  animationType?: 'entry' | 'exit' | 'idle'
}

const props = withDefaults(defineProps<Props>(), {
  emotion: 'normal',
  isSpeaking: false,
  isThinking: false,
  isHighlighted: false,
  showNameLabel: true,
  showRelationship: false,
  showPlanetSymbol: false,
  showEmotionEffects: true,
  size: 'medium',
  position: 'center',
  animationType: 'idle'
})

// Emits
const emit = defineEmits<{
  imageLoad: [character: Character]
  imageError: [character: Character, error: Event]
  emotionChange: [character: Character, emotion: EmotionType]
  animationComplete: [character: Character, animationType: string]
}>()

// Reactive State
const currentEmotion = ref<EmotionType>(props.emotion)
const transitionImage = ref<string | null>(null)
const transitionOpacity = ref(0)
const isEntering = ref(false)
const isExiting = ref(false)
const animationTimeout = ref<NodeJS.Timeout | null>(null)

// Computed Properties
const currentPortraitImage = computed(() => {
  return props.character.assets.expressions[currentEmotion.value] || 
         props.character.assets.portrait
})

const portraitStyle = computed(() => {
  const baseStyle = {
    '--character-primary': props.character.appearance.colors.primary,
    '--character-secondary': props.character.appearance.colors.secondary,
    '--character-accent': props.character.appearance.colors.accent,
  }

  // Size variations
  const sizeMap = {
    small: { width: '80px', height: '100px' },
    medium: { width: '120px', height: '150px' },
    large: { width: '160px', height: '200px' },
    xlarge: { width: '200px', height: '250px' }
  }

  // Position variations
  const positionMap = {
    left: { alignSelf: 'flex-start' },
    center: { alignSelf: 'center' },
    right: { alignSelf: 'flex-end' }
  }

  return {
    ...baseStyle,
    ...sizeMap[props.size],
    ...positionMap[props.position]
  }
})

const particleCount = computed(() => {
  const emotionParticles = {
    happy: 8,
    excited: 12,
    surprised: 6,
    angry: 10,
    sad: 4,
    normal: 0,
    confused: 3,
    determined: 5,
    worried: 3
  }
  return emotionParticles[currentEmotion.value] || 0
})

// Methods
const changeEmotion = (newEmotion: EmotionType, smooth = true) => {
  if (currentEmotion.value === newEmotion) return

  if (smooth) {
    // Start transition
    transitionImage.value = props.character.assets.expressions[newEmotion]
    transitionOpacity.value = 1
    
    setTimeout(() => {
      currentEmotion.value = newEmotion
      transitionOpacity.value = 0
      setTimeout(() => {
        transitionImage.value = null
      }, 300)
    }, 150)
  } else {
    currentEmotion.value = newEmotion
  }

  emit('emotionChange', props.character, newEmotion)
}

const playEntryAnimation = () => {
  isEntering.value = true
  const animationType = props.character.assets.animations.entry
  
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }
  
  animationTimeout.value = setTimeout(() => {
    isEntering.value = false
    emit('animationComplete', props.character, 'entry')
  }, 800)
}

const playExitAnimation = () => {
  isExiting.value = true
  const animationType = props.character.assets.animations.exit
  
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }
  
  animationTimeout.value = setTimeout(() => {
    isExiting.value = false
    emit('animationComplete', props.character, 'exit')
  }, 800)
}

const getPlanetEmoji = (planet: string): string => {
  const planetEmojis: Record<string, string> = {
    'Earth': '🌍',
    'Starship': '🚀',
    'Sound Planet': '🎵',
    'Word Planet': '📚',
    'Grammar Planet': '📝',
    'Speed Station': '⚡',
    'Cooperation Colony': '🤝',
    'Unknown Dimension': '🌌'
  }
  return planetEmojis[planet] || '🪐'
}

const getParticleStyle = (index: number) => {
  const emotions = {
    happy: { color: '#fbbf24', symbol: '✨' },
    excited: { color: '#f472b6', symbol: '⭐' },
    surprised: { color: '#06b6d4', symbol: '💫' },
    angry: { color: '#ef4444', symbol: '💥' },
    sad: { color: '#6b7280', symbol: '💧' },
    confused: { color: '#a855f7', symbol: '❓' },
    determined: { color: '#10b981', symbol: '🔥' },
    worried: { color: '#f59e0b', symbol: '😰' }
  }

  const emotion = emotions[currentEmotion.value as keyof typeof emotions]
  if (!emotion) return {}

  const angle = (index * 360) / particleCount.value
  const distance = 60 + Math.random() * 20
  
  return {
    '--particle-color': emotion.color,
    '--particle-symbol': `'${emotion.symbol}'`,
    '--particle-delay': `${index * 0.1}s`,
    '--particle-angle': `${angle}deg`,
    '--particle-distance': `${distance}px`
  }
}

const onImageLoad = () => {
  emit('imageLoad', props.character)
}

const onImageError = (error: Event) => {
  logger.error(`Failed to load character image for ${props.character.name}:`, error)
  emit('imageError', props.character, error)
}

// Watchers
watch(() => props.emotion, (newEmotion) => {
  changeEmotion(newEmotion)
})

watch(() => props.animationType, (newType) => {
  if (newType === 'entry') {
    playEntryAnimation()
  } else if (newType === 'exit') {
    playExitAnimation()
  }
})

// Lifecycle
onMounted(() => {
  if (props.animationType === 'entry') {
    playEntryAnimation()
  }
})

onUnmounted(() => {
  if (animationTimeout.value) {
    clearTimeout(animationTimeout.value)
  }
})

// Expose methods for parent components
defineExpose({
  changeEmotion,
  playEntryAnimation,
  playExitAnimation
})
</script>

<style scoped>
.character-portrait-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  user-select: none;
  z-index: 10;
}

/* Character Aura Background */
.character-aura {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--aura-primary, #3b82f6) 0%,
    var(--aura-secondary, #1e40af) 30%,
    transparent 70%
  );
  opacity: 0.3;
  animation: aura-pulse 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes aura-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

/* Portrait Wrapper */
.portrait-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, 
    var(--character-primary, #3b82f6), 
    var(--character-secondary, #1e40af)
  );
}

.portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  border-radius: 20px;
}

.portrait-transition {
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 0.3s ease;
}

/* Character States */
.is-speaking .portrait-image {
  animation: gentle-bounce 1s ease-in-out infinite;
}

.is-thinking .portrait-image {
  animation: head-tilt 2s ease-in-out infinite;
}

.is-highlighted {
  transform: scale(1.05);
  z-index: 20;
}

.is-highlighted .character-aura {
  opacity: 0.6;
  animation: aura-pulse 1s ease-in-out infinite;
}

/* Entry/Exit Animations */
.is-entering {
  animation: character-entry 0.8s ease-out;
}

.is-exiting {
  animation: character-exit 0.8s ease-in;
}

/* Character-specific Entry Animations */
.character-captain_nova.is-entering {
  animation: slide-in-right 0.8s ease-out;
}

.character-aura.is-entering {
  animation: materialize 0.8s ease-out;
}

.character-professor_phonix.is-entering {
  animation: wise-entrance 0.8s ease-out;
}

.character-lexia.is-entering {
  animation: flutter-in 0.8s ease-out;
}

.character-grammar_guardian.is-entering {
  animation: authoritative-march 0.8s ease-out;
}

.character-speed_racer.is-entering {
  animation: speed-dash 0.8s ease-out;
}

.character-unity.is-entering {
  animation: harmony-bloom 0.8s ease-out;
}

.character-the_translator.is-entering {
  animation: digital-materialize 0.8s ease-out;
}

/* Animation Keyframes */
@keyframes gentle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes head-tilt {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

@keyframes slide-in-right {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes materialize {
  0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 0.7; transform: scale(1.1) rotate(180deg); }
  100% { opacity: 1; transform: scale(1) rotate(360deg); }
}

@keyframes wise-entrance {
  0% { opacity: 0; transform: translateY(-30px) scale(0.8); }
  50% { opacity: 0.7; transform: translateY(-15px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes flutter-in {
  0% { opacity: 0; transform: translateY(-50px) rotate(-20deg) scale(0.5); }
  25% { opacity: 0.5; transform: translateY(-25px) rotate(-10deg) scale(0.7); }
  50% { opacity: 0.8; transform: translateY(-10px) rotate(5deg) scale(0.9); }
  75% { opacity: 0.9; transform: translateY(-5px) rotate(-2deg) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
}

@keyframes authoritative-march {
  0% { opacity: 0; transform: translateY(50px) scale(0.8); }
  30% { opacity: 0.7; transform: translateY(20px) scale(0.9); }
  60% { opacity: 0.9; transform: translateY(5px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes speed-dash {
  0% { opacity: 0; transform: translateX(-200px) skewX(30deg); }
  30% { opacity: 0.7; transform: translateX(-50px) skewX(15deg); }
  70% { opacity: 0.9; transform: translateX(10px) skewX(-5deg); }
  100% { opacity: 1; transform: translateX(0) skewX(0deg); }
}

@keyframes harmony-bloom {
  0% { opacity: 0; transform: scale(0.3) rotate(-90deg); }
  25% { opacity: 0.4; transform: scale(0.6) rotate(-45deg); }
  50% { opacity: 0.7; transform: scale(0.9) rotate(0deg); }
  75% { opacity: 0.9; transform: scale(1.1) rotate(15deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes digital-materialize {
  0% { 
    opacity: 0; 
    transform: scale(0.5);
    filter: hue-rotate(0deg) brightness(2);
  }
  25% { 
    opacity: 0.3; 
    transform: scale(0.8);
    filter: hue-rotate(90deg) brightness(1.5);
  }
  50% { 
    opacity: 0.6; 
    transform: scale(1.2);
    filter: hue-rotate(180deg) brightness(1.2);
  }
  75% { 
    opacity: 0.8; 
    transform: scale(0.9);
    filter: hue-rotate(270deg) brightness(1.1);
  }
  100% { 
    opacity: 1; 
    transform: scale(1);
    filter: hue-rotate(360deg) brightness(1);
  }
}

@keyframes character-entry {
  0% { opacity: 0; transform: translateY(30px) scale(0.8); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes character-exit {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(0.8); }
}

/* Character Name Label */
.character-name-label {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, 
    var(--bg-color, #3b82f6), 
    var(--bg-color, #1e40af)
  );
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid var(--name-color, #fbbf24);
}

.character-name {
  display: block;
  font-size: 0.875rem;
}

.character-title {
  display: block;
  font-size: 0.625rem;
  opacity: 0.8;
  margin-top: 0.125rem;
}

/* Speaking Indicator */
.speaking-indicator {
  position: absolute;
  top: -20px;
  right: -10px;
  z-index: 15;
}

.speech-bubble {
  background: var(--character-accent, #fbbf24);
  border-radius: 20px;
  padding: 0.5rem;
  display: flex;
  gap: 0.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-top-color: var(--character-accent, #fbbf24);
}

.bubble-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: bubble-bounce 1.4s ease-in-out infinite;
}

.bubble-dot:nth-child(2) { animation-delay: 0.2s; }
.bubble-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bubble-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

/* Emotion Particles */
.emotion-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 20px;
  height: 20px;
  animation: particle-float 2s ease-in-out infinite;
  animation-delay: var(--particle-delay, 0s);
}

.particle::before {
  content: var(--particle-symbol, '✨');
  position: absolute;
  font-size: 16px;
  color: var(--particle-color, #fbbf24);
  animation: particle-spin 3s linear infinite;
}

@keyframes particle-float {
  0% {
    transform: rotate(var(--particle-angle, 0deg)) translateX(0) rotate(calc(-1 * var(--particle-angle, 0deg)));
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: rotate(var(--particle-angle, 0deg)) translateX(var(--particle-distance, 60px)) rotate(calc(-1 * var(--particle-angle, 0deg)));
    opacity: 0;
  }
}

@keyframes particle-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Character Effects */
.character-effects {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 15;
}

.relationship-heart {
  font-size: 1.2rem;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.planet-symbol {
  font-size: 1rem;
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  padding: 0.25rem;
  backdrop-filter: blur(5px);
}

/* Emotion-specific Effects */
.emotion-happy .character-aura {
  background: radial-gradient(circle, #fbbf24 0%, #f59e0b 30%, transparent 70%);
}

.emotion-angry .character-aura {
  background: radial-gradient(circle, #ef4444 0%, #dc2626 30%, transparent 70%);
  animation: angry-pulse 0.5s ease-in-out infinite;
}

.emotion-sad .character-aura {
  background: radial-gradient(circle, #6b7280 0%, #4b5563 30%, transparent 70%);
  animation: sad-dim 2s ease-in-out infinite;
}

.emotion-excited .character-aura {
  background: radial-gradient(circle, #f472b6 0%, #ec4899 30%, transparent 70%);
  animation: excited-vibrate 0.3s ease-in-out infinite;
}

@keyframes angry-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes sad-dim {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

@keyframes excited-vibrate {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .character-name-label {
    font-size: 0.625rem;
    padding: 0.375rem 0.75rem;
  }
  
  .character-name {
    font-size: 0.75rem;
  }
  
  .character-title {
    font-size: 0.5rem;
  }
  
  .emotion-particles {
    display: none; /* Hide particles on mobile for performance */
  }
}
</style>