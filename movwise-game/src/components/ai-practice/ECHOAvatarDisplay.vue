<template>
  <div class="echo-avatar-container">
    <div 
      class="echo-robot"
      :class="{
        'is-speaking': animationState.isSpeaking,
        'is-listening': animationState.isListening,
        'is-thinking': emotion === 'thinking',
        'is-happy': emotion === 'happy',
        'is-encouraging': emotion === 'encouraging',
        'is-surprised': emotion === 'surprised'
      }"
:style="{ 
        transform: headTransform,
        transformOrigin: 'center center'
      }"
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="echo-svg">
        <defs v-once>
          <radialGradient id="bodyGradient">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
          </radialGradient>
          <radialGradient id="eyeGlow">
            <stop offset="0%" :style="`stop-color:${eyeColor};stop-opacity:1`" />
            <stop offset="50%" :style="`stop-color:${eyeColor};stop-opacity:0.8`" />
            <stop offset="100%" :style="`stop-color:${eyeColor};stop-opacity:0.2`" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Body (static, optimized) -->
        <ellipse v-once cx="100" cy="120" rx="60" ry="70" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2"/>
        
        <!-- Head (static, optimized) -->
        <circle v-once cx="100" cy="60" r="45" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2"/>
        
        <!-- Antenna (static line, animated light) -->
        <line v-once x1="100" y1="15" x2="100" y2="25" stroke="#00BFFF" stroke-width="3" stroke-linecap="round"/>
        <circle cx="100" cy="12" r="5" fill="#00BFFF" filter="url(#softGlow)" class="antenna-light"/>
        
        <!-- Eyes -->
        <g id="eyes">
          <!-- Left eye -->
          <circle v-once cx="80" cy="55" r="12" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
          <circle 
            cx="80" 
            cy="55" 
            r="8" 
            :fill="eyeColor" 
            filter="url(#softGlow)" 
            class="eye-glow"
            :class="{ 
              'blinking': animationState.isBlinking,
              'high-intensity': animationState.eyeIntensity > 0.8
            }"
            :opacity="animationState.eyeIntensity"
          />
          <circle v-once cx="82" cy="53" r="3" fill="#ffffff" opacity="0.8"/>
          
          <!-- Right eye -->
          <circle v-once cx="120" cy="55" r="12" fill="#ffffff" stroke="#e0e0e0" stroke-width="1"/>
          <circle 
            cx="120" 
            cy="55" 
            r="8" 
            :fill="eyeColor" 
            filter="url(#softGlow)" 
            class="eye-glow"
            :class="{ 
              'blinking': animationState.isBlinking,
              'high-intensity': animationState.eyeIntensity > 0.8
            }"
            :opacity="animationState.eyeIntensity"
          />
          <circle v-once cx="122" cy="53" r="3" fill="#ffffff" opacity="0.8"/>
        </g>
        
        <!-- Cheeks (for blush) -->
        <ellipse cx="65" cy="70" rx="12" ry="8" fill="#FFB6C1" :opacity="cheekBlushOpacity" class="cheek-blush"/>
        <ellipse cx="135" cy="70" rx="12" ry="8" fill="#FFB6C1" :opacity="cheekBlushOpacity" class="cheek-blush"/>
        
        <!-- Mouth -->
        <path 
          :d="mouthPath" 
          stroke="#00BFFF" 
          stroke-width="2" 
          fill="none" 
          stroke-linecap="round" 
          class="mouth"
        />
        
        <!-- Arms -->
        <g id="left-arm" :transform="leftArmTransform" transform-origin="70 110">
          <ellipse v-once cx="45" cy="110" rx="15" ry="40" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2" transform="rotate(-20 45 110)"/>
          <circle v-once cx="38" cy="140" r="12" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2"/>
        </g>
        
        <g id="right-arm" :transform="rightArmTransform" transform-origin="130 110">
          <ellipse v-once cx="155" cy="110" rx="15" ry="40" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2" transform="rotate(20 155 110)"/>
          <circle v-once cx="162" cy="140" r="12" fill="url(#bodyGradient)" stroke="#e0e0e0" stroke-width="2"/>
        </g>
        
        <!-- Chest light -->
        <circle 
          cx="100" 
          cy="100" 
          r="8" 
          fill="#00BFFF" 
          :opacity="animationState.chestLightPulse" 
          filter="url(#softGlow)" 
          class="chest-light"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import type { ECHOEmotion, AnimationState, ECHOCharacter } from '@/types/ai-practice'
import { useECHOAnimation } from '@/composables/useECHOAnimation'

interface Props {
  emotion: ECHOEmotion
  encouragementLevel: number
  animationState: AnimationState
  eyeColor?: string
  cheekBlushOpacity?: number
  character?: ECHOCharacter
  performanceMode?: 'high' | 'balanced' | 'low'
}

const props = withDefaults(defineProps<Props>(), {
  emotion: 'normal',
  encouragementLevel: 50,
  eyeColor: '#00BFFF',
  cheekBlushOpacity: 0,
  performanceMode: 'balanced'
})

// Performance optimizations with memory leak prevention
const shouldAnimate = ref(true)
const leftArmRotation = ref(0)
const rightArmRotation = ref(0)
const isComponentMounted = ref(false)

// Use shallowRef for performance-critical data
const animationFrameId = shallowRef<number | null>(null)
const blinkTimeoutId = shallowRef<NodeJS.Timeout | null>(null)
const breathingFrameId = shallowRef<number | null>(null)
const armAnimationTimeouts = shallowRef<NodeJS.Timeout[]>([])

// Performance monitoring
const frameCount = ref(0)
const lastFrameTime = ref(0)
const averageFrameTime = ref(16.67) // 60fps baseline

// Use animation composable if character is provided and valid
const characterRef = computed(() => props.character)
const animationComposable = useECHOAnimation(characterRef)

// Memoized mouth path computation with performance optimization
const mouthPath = computed(() => {
  if (!isComponentMounted.value) {
    return 'M 85 75 Q 100 80 115 75' // Default static path during mount
  }
  
  if (props.animationState.isSpeaking && shouldAnimate.value) {
    // Optimized speaking animation - use frameCount instead of Date.now()
    const time = frameCount.value * 0.1
    const offset = Math.sin(time) * 2 // Reduced amplitude for better performance
    return `M 85 ${75 + offset} Q 100 ${85 + offset * 1.5} 115 ${75 + offset}`
  }
  
  // Static mouth paths - memoized by emotion
  const staticPaths: Record<ECHOEmotion, string> = {
    normal: 'M 85 75 Q 100 80 115 75',
    happy: 'M 85 75 Q 100 90 115 75',
    surprised: 'M 95 75 Q 100 85 105 75',
    encouraging: 'M 80 75 Q 100 85 120 75',
    thinking: 'M 90 80 L 110 80',
    confused: 'M 85 80 Q 100 75 115 80',
    excited: 'M 80 75 Q 100 90 120 75',
    speaking: 'M 85 75 Q 100 82 115 75',
    listening: 'M 85 75 Q 100 78 115 75'
  }
  
  return staticPaths[props.emotion] || staticPaths.normal
})

// Memoized transform computations
const headTransform = computed(() => {
  if (!shouldAnimate.value) return 'rotate(0deg) scale(1)'
  return `rotate(${props.animationState.headTilt}deg) scale(${props.animationState.bodyScale})`
})

const leftArmTransform = computed(() => {
  if (!shouldAnimate.value) return 'rotate(0 70 110)'
  return `rotate(${leftArmRotation.value} 70 110)`
})

const rightArmTransform = computed(() => {
  if (!shouldAnimate.value) return 'rotate(0 130 110)'
  return `rotate(${rightArmRotation.value} 130 110)`
})

// Memory-safe blinking with proper cleanup
const startBlinking = () => {
  if (props.performanceMode === 'low' || !isComponentMounted.value) {
    return
  }
  
  const blinkFrequency = props.performanceMode === 'high' ? 2000 : 3000
  
  const scheduleBlink = () => {
    if (!isComponentMounted.value || !shouldAnimate.value) return
    
    const blinkDelay = blinkFrequency + Math.random() * 1000
    blinkTimeoutId.value = setTimeout(() => {
      if (!isComponentMounted.value) return
      
      props.animationState.isBlinking = true
      
      // Use timeout for blink duration
      const blinkEndTimeout = setTimeout(() => {
        if (isComponentMounted.value) {
          props.animationState.isBlinking = false
        }
      }, 150)
      
      // Store timeout for cleanup
      armAnimationTimeouts.value.push(blinkEndTimeout)
      
      scheduleBlink() // Schedule next blink
    }, blinkDelay)
  }
  
  scheduleBlink()
}

// Clear all timeouts helper
const clearAllTimeouts = () => {
  if (blinkTimeoutId.value) {
    clearTimeout(blinkTimeoutId.value)
    blinkTimeoutId.value = null
  }
  
  armAnimationTimeouts.value.forEach(timeoutId => {
    clearTimeout(timeoutId)
  })
  armAnimationTimeouts.value = []
}

// Memory-safe arm animation with proper cleanup
const animateArms = () => {
  if (!shouldAnimate.value || !isComponentMounted.value) return
  
  // Clear existing arm animation timeouts
  armAnimationTimeouts.value.forEach(timeoutId => clearTimeout(timeoutId))
  armAnimationTimeouts.value = []
  
  const addTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      if (isComponentMounted.value) {
        callback()
      }
    }, delay)
    armAnimationTimeouts.value.push(timeoutId)
  }
  
  switch (props.animationState.armPosition) {
    case 'wave':
      rightArmRotation.value = -45
      addTimeout(() => rightArmRotation.value = -30, 300)
      addTimeout(() => rightArmRotation.value = -45, 600)
      addTimeout(() => rightArmRotation.value = 0, 900)
      break
      
    case 'clap':
      leftArmRotation.value = 30
      rightArmRotation.value = -30
      addTimeout(() => {
        leftArmRotation.value = 20
        rightArmRotation.value = -20
      }, 200)
      addTimeout(() => {
        leftArmRotation.value = 30
        rightArmRotation.value = -30
      }, 400)
      addTimeout(() => {
        leftArmRotation.value = 0
        rightArmRotation.value = 0
      }, 600)
      break
      
    case 'thumbsUp':
      leftArmRotation.value = -20
      addTimeout(() => leftArmRotation.value = 0, 1500)
      break
      
    case 'thinking':
      rightArmRotation.value = -15
      break
      
    case 'gesture':
      leftArmRotation.value = 15
      rightArmRotation.value = -10
      addTimeout(() => {
        leftArmRotation.value = 0
        rightArmRotation.value = 0
      }, 1000)
      break
      
    default:
      leftArmRotation.value = 0
      rightArmRotation.value = 0
  }
}

// RequestAnimationFrame-based animation loop
const startAnimationLoop = () => {
  if (!isComponentMounted.value) return
  
  const animate = (currentTime: number) => {
    if (!isComponentMounted.value) return
    
    // Calculate frame time
    if (lastFrameTime.value) {
      const deltaTime = currentTime - lastFrameTime.value
      frameCount.value++
      
      // Update average frame time (exponential moving average)
      averageFrameTime.value = averageFrameTime.value * 0.9 + deltaTime * 0.1
      
      // Performance monitoring every 60 frames
      if (frameCount.value % 60 === 0) {
        const currentFPS = 1000 / averageFrameTime.value
        
        if (currentFPS < 30 && shouldAnimate.value) {
          shouldAnimate.value = false
          logger.warn('ECHOAvatarDisplay: Performance degraded, reducing animations', { fps: currentFPS })
        } else if (currentFPS > 45 && !shouldAnimate.value) {
          shouldAnimate.value = true
          logger.log('ECHOAvatarDisplay: Performance recovered, enabling animations', { fps: currentFPS })
        }
      }
    }
    
    lastFrameTime.value = currentTime
    
    // Schedule next frame
    if (isComponentMounted.value) {
      animationFrameId.value = requestAnimationFrame(animate)
    }
  }
  
  animationFrameId.value = requestAnimationFrame(animate)
}

// Stop animation loop
const stopAnimationLoop = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
  if (breathingFrameId.value) {
    cancelAnimationFrame(breathingFrameId.value)
    breathingFrameId.value = null
  }
}

// Throttled updates for performance
const updateFrequency = computed(() => {
  switch (props.performanceMode) {
    case 'high': return 16 // 60fps
    case 'balanced': return 33 // 30fps
    case 'low': return 100 // 10fps
  }
})

// Watchers with performance considerations and debouncing
watch(() => props.animationState.armPosition, () => {
  nextTick(() => {
    animateArms()
  })
}, { flush: 'post' })

watch(() => props.emotion, (newEmotion) => {
  if (!isComponentMounted.value) return
  
  // Batch emotion-based arm position changes
  nextTick(() => {
    switch (newEmotion) {
      case 'happy':
        props.animationState.armPosition = 'clap'
        break
      case 'encouraging':
        props.animationState.armPosition = 'thumbsUp'
        break
      case 'thinking':
        props.animationState.armPosition = 'thinking'
        break
    }
  })
}, { flush: 'post' })

watch(() => props.performanceMode, (mode) => {
  shouldAnimate.value = mode !== 'low'
  
  // Restart animation loop with new performance settings
  if (isComponentMounted.value) {
    stopAnimationLoop()
    if (mode !== 'low') {
      startAnimationLoop()
    }
  }
})

// Lifecycle management with complete cleanup
onMounted(async () => {
  isComponentMounted.value = true
  
  await nextTick() // Ensure DOM is ready
  
  // Start all animations
  startBlinking()
  startAnimationLoop()
})

onUnmounted(() => {
  isComponentMounted.value = false
  shouldAnimate.value = false
  
  // Complete cleanup to prevent memory leaks
  stopAnimationLoop()
  clearAllTimeouts()
  
  // Cleanup animation composable
  if (animationComposable) {
    compCleanup()
  }
})
</script>

<style scoped>
.echo-avatar-container {
  @apply relative w-64 h-64 mx-auto;
}

.echo-robot {
  @apply w-full h-full transition-transform duration-300 ease-out;
}

.echo-svg {
  @apply w-full h-full;
}

.antenna-light {
  animation: antennaGlow 2s ease-in-out infinite;
}

.eye-glow {
  transition: all 0.3s ease;
}

.eye-glow.blinking {
  transform: scaleY(0.1);
  opacity: 0.3;
}

.chest-light {
  transition: opacity 0.1s ease;
}

.mouth {
  transition: d 0.3s ease;
}

.cheek-blush {
  transition: opacity 0.5s ease;
}

.is-speaking .antenna-light {
  animation: antennaGlow 0.5s ease-in-out infinite;
}

.is-listening .antenna-light {
  animation: listeningPulse 1s ease-in-out infinite;
}

.is-thinking .eye-glow {
  animation: thinkingPulse 1.5s ease-in-out infinite;
}

.is-happy .echo-robot {
  animation: happyBounce 0.5s ease-out;
}

.is-encouraging .echo-robot {
  animation: encouragingGlow 0.8s ease-out;
}

.is-surprised .echo-robot {
  animation: surprisedShake 0.3s ease-out;
}

.eye-glow.high-intensity {
  filter: url(#softGlow) brightness(1.2);
}

.mouth {
  transition: d 0.3s ease;
}

.echo-robot {
  will-change: transform;
  transform-origin: center center;
  backface-visibility: hidden;
  perspective: 1000px;
}

.echo-svg {
  shape-rendering: optimizeSpeed;
}

.performance-low .antenna-light,
.performance-low .eye-glow {
  animation: none;
}

.performance-low .echo-robot {
  will-change: auto;
}

/* GPU acceleration for animations */
.antenna-light,
.eye-glow,
.chest-light {
  transform: translateZ(0);
  will-change: opacity, transform;
}

#left-arm,
#right-arm {
  will-change: transform;
  transform-origin: inherit;
}

/* Reduce motion for accessibility and performance */
@media (prefers-reduced-motion: reduce) {
  .echo-robot,
  .antenna-light,
  .eye-glow,
  .chest-light,
  #left-arm,
  #right-arm {
    animation: none !important;
    transition: none !important;
    will-change: auto !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .echo-svg {
    filter: contrast(2);
  }
}

#left-arm, #right-arm {
  transition: transform 0.3s ease-out;
}

/* Optimized keyframes with GPU acceleration */
@keyframes antennaGlow {
  0%, 100% { 
    opacity: 1; 
    transform: scale3d(1, 1, 1); 
  }
  50% { 
    opacity: 0.6; 
    transform: scale3d(1.2, 1.2, 1); 
  }
}

@keyframes listeningPulse {
  0%, 100% { 
    opacity: 0.8; 
    transform: scale3d(1, 1, 1); 
  }
  50% { 
    opacity: 1; 
    transform: scale3d(1.1, 1.1, 1); 
  }
}

@keyframes thinkingPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes happyBounce {
  0%, 100% { 
    transform: translate3d(0, 0, 0) rotate(0deg); 
  }
  25% { 
    transform: translate3d(0, -5px, 0) rotate(-2deg); 
  }
  75% { 
    transform: translate3d(0, -5px, 0) rotate(2deg); 
  }
}

@keyframes encouragingGlow {
  0% { 
    filter: brightness(1); 
    transform: scale3d(1, 1, 1);
  }
  50% { 
    filter: brightness(1.2) saturate(1.1); 
    transform: scale3d(1.02, 1.02, 1);
  }
  100% { 
    filter: brightness(1); 
    transform: scale3d(1, 1, 1);
  }
}

@keyframes surprisedShake {
  0%, 100% { 
    transform: translate3d(0, 0, 0); 
  }
  25% { 
    transform: translate3d(-2px, 0, 0); 
  }
  75% { 
    transform: translate3d(2px, 0, 0); 
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Low-end device optimizations */
@media (max-width: 768px) and (pointer: coarse) {
  .echo-robot {
    animation-duration: 0.5s !important;
  }
  
  .antenna-light,
  .eye-glow {
    animation-duration: 1s !important;
  }
}
</style>