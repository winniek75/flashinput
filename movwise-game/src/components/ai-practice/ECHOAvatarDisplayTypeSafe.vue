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
        'is-surprised': emotion === 'surprised',
        'has-error': hasError,
        'is-disabled': disabled
      }"
      :style="{ 
        transform: headTransform,
        transformOrigin: 'center center',
        opacity: disabled ? 0.5 : 1
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
              'high-intensity': animationState.eyeIntensity > 0.8,
              'error-state': hasError
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
              'high-intensity': animationState.eyeIntensity > 0.8,
              'error-state': hasError
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
          :class="{ 'error-mouth': hasError }"
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
          :fill="hasError ? '#ff4444' : '#00BFFF'"
          :opacity="animationState.chestLightPulse" 
          filter="url(#softGlow)" 
          class="chest-light"
          :class="{ 'error-light': hasError }"
        />
      </svg>
    </div>
    
    <!-- Error indicator -->
    <div v-if="hasError && debug" class="error-indicator">
      <span class="error-icon">⚠️</span>
      <span class="error-message">{{ currentError?.message }}</span>
    </div>
    
    <!-- Performance indicator -->
    <div v-if="debug && performanceStats.animationFrameRate < 30" class="performance-indicator">
      <span class="perf-icon">📊</span>
      <span class="perf-message">{{ Math.round(performanceStats.animationFrameRate) }}fps</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef, type PropType } from 'vue'
import type { 
  ECHOEmotion, 
  AnimationState, 
  ECHOCharacter, 
  PerformanceMode,
  ECHOError,
  PerformanceStats,
  ArmPosition
} from '@/types/ai-practice'
import { useECHOAnimation } from '@/composables/useECHOAnimation'

// Strict props interface with validation
interface Props {
  readonly emotion: ECHOEmotion
  readonly encouragementLevel: number // 0-100
  readonly animationState: AnimationState
  readonly eyeColor?: string
  readonly cheekBlushOpacity?: number // 0-1
  readonly character?: ECHOCharacter
  readonly performanceMode?: PerformanceMode
  readonly disabled?: boolean
  readonly debug?: boolean
}

// Emit events interface
interface Emits {
  'animation-start': [emotion: ECHOEmotion]
  'animation-end': [emotion: ECHOEmotion]
  'performance-warning': [stats: PerformanceStats]
  'error': [error: ECHOError]
  'state-change': [state: Partial<AnimationState>]
}

// Props definition with strict validation
const props = withDefaults(defineProps<Props>(), {
  emotion: 'normal' as const,
  encouragementLevel: 50,
  eyeColor: '#00BFFF',
  cheekBlushOpacity: 0,
  performanceMode: 'balanced' as const,
  disabled: false,
  debug: false
})

// Emit definition with type safety
const emit = defineEmits<Emits>()

// Reactive state with strict typing
const shouldAnimate = ref<boolean>(true)
const leftArmRotation = ref<number>(0)
const rightArmRotation = ref<number>(0)
const isComponentMounted = ref<boolean>(false)
const hasError = ref<boolean>(false)
const currentError = ref<ECHOError | null>(null)

// Use shallowRef for performance-critical data with strict types
const animationFrameId = shallowRef<number | null>(null)
const blinkTimeoutId = shallowRef<NodeJS.Timeout | null>(null)
const breathingFrameId = shallowRef<number | null>(null)
const armAnimationTimeouts = shallowRef<NodeJS.Timeout[]>([])

// Performance monitoring with type safety
const performanceStats = ref<PerformanceStats>({
  renderTime: 0,
  animationFrameRate: 60,
  memoryUsage: 0,
  speechLatency: 0,
  recognitionAccuracy: 0,
  frameDropCount: 0,
  lastMeasurement: new Date()
})

// Performance monitoring with strict types
const frameCount = ref<number>(0)
const lastFrameTime = ref<number>(0)
const averageFrameTime = ref<number>(16.67) // 60fps baseline

// Use animation composable if character is provided
const animationComposable = props.character ? useECHOAnimation(ref(props.character)) : null

// Extract animation methods for local use
const {
  startBlinking: compStartBlinking,
  animateArms: compAnimateArms,
  updateEmotion: compUpdateEmotion,
  cleanup: compCleanup,
  performanceStats: compPerformanceStats
} = animationComposable || {
  startBlinking: () => {},
  animateArms: () => {},
  updateEmotion: () => {},
  cleanup: () => {},
  performanceStats: ref(performanceStats.value)
}

// Props validation (runtime)
const validateProps = (): ECHOError | null => {
  if (props.encouragementLevel < 0 || props.encouragementLevel > 100) {
    return {
      code: 'INVALID_STATE',
      message: `Invalid encouragementLevel: ${props.encouragementLevel}. Must be 0-100.`,
      timestamp: new Date(),
      recoverable: true,
      severity: 'medium',
      source: 'animation'
    }
  }
  
  if (props.cheekBlushOpacity < 0 || props.cheekBlushOpacity > 1) {
    return {
      code: 'INVALID_STATE',
      message: `Invalid cheekBlushOpacity: ${props.cheekBlushOpacity}. Must be 0-1.`,
      timestamp: new Date(),
      recoverable: true,
      severity: 'medium',
      source: 'animation'
    }
  }
  
  if (props.animationState.headTilt < -10 || props.animationState.headTilt > 10) {
    return {
      code: 'INVALID_STATE',
      message: `Invalid headTilt: ${props.animationState.headTilt}. Must be -10 to 10.`,
      timestamp: new Date(),
      recoverable: true,
      severity: 'low',
      source: 'animation'
    }
  }
  
  return null
}

// Error handling function
const handleError = (error: ECHOError): void => {
  currentError.value = error
  hasError.value = true
  emit('error', error)
  
  if (props.debug) {
    logger.error('ECHOAvatarDisplay Error:', error)
  }
  
  // Auto-recovery for recoverable errors
  if (error.recoverable) {
    setTimeout(() => {
      hasError.value = false
      currentError.value = null
      
      if (props.debug) {
        logger.log('ECHOAvatarDisplay: Attempting recovery from error')
      }
    }, 2000)
  }
}

// Memoized mouth path computation with performance optimization
const mouthPath = computed((): string => {
  if (!isComponentMounted.value) {
    return 'M 85 75 Q 100 80 115 75' // Default static path during mount
  }
  
  if (hasError.value) {
    return 'M 85 80 Q 100 75 115 80' // Error mouth
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
const headTransform = computed((): string => {
  if (!shouldAnimate.value || props.disabled) return 'rotate(0deg) scale(1)'
  return `rotate(${props.animationState.headTilt}deg) scale(${props.animationState.bodyScale})`
})

const leftArmTransform = computed((): string => {
  if (!shouldAnimate.value || props.disabled) return 'rotate(0 70 110)'
  return `rotate(${leftArmRotation.value} 70 110)`
})

const rightArmTransform = computed((): string => {
  if (!shouldAnimate.value || props.disabled) return 'rotate(0 130 110)'
  return `rotate(${rightArmRotation.value} 130 110)`
})

// Error-safe blinking system with type validation
const startBlinking = (): void => {
  try {
    if (props.disabled) return
    
    const validationError = validateProps()
    if (validationError) {
      handleError(validationError)
      return
    }
    
    if (animationComposable && props.character) {
      compStartBlinking()
      emit('animation-start', props.emotion)
    } else {
      startLocalBlinking()
    }
  } catch (error) {
    handleError({
      code: 'ANIMATION_FAILED',
      message: `Failed to start blinking: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error },
      timestamp: new Date(),
      recoverable: true,
      severity: 'medium',
      source: 'animation'
    })
  }
}

// Fallback local blinking system
const startLocalBlinking = (): void => {
  if (props.performanceMode === 'low' || !isComponentMounted.value) {
    return
  }
  
  const blinkFrequency = props.performanceMode === 'high' ? 2000 : 3000
  
  const scheduleBlink = (): void => {
    if (!isComponentMounted.value || !shouldAnimate.value) return
    
    const blinkDelay = blinkFrequency + Math.random() * 1000
    blinkTimeoutId.value = setTimeout(() => {
      if (!isComponentMounted.value) return
      
      props.animationState.isBlinking = true
      
      const blinkEndTimeout = setTimeout(() => {
        if (isComponentMounted.value) {
          props.animationState.isBlinking = false
        }
      }, 150)
      
      armAnimationTimeouts.value.push(blinkEndTimeout)
      scheduleBlink()
    }, blinkDelay)
  }
  
  scheduleBlink()
}

// Type-safe arm animation with error handling
const animateArms = (): void => {
  try {
    if (props.disabled || !shouldAnimate.value) return
    
    const validationError = validateProps()
    if (validationError) {
      handleError(validationError)
      return
    }
    
    if (animationComposable && props.character) {
      compAnimateArms(props.animationState.armPosition)
      emit('state-change', { armPosition: props.animationState.armPosition })
    } else {
      animateArmsLocal()
    }
  } catch (error) {
    handleError({
      code: 'ANIMATION_FAILED',
      message: `Failed to animate arms: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error, armPosition: props.animationState.armPosition },
      timestamp: new Date(),
      recoverable: true,
      severity: 'low',
      source: 'animation'
    })
  }
}

// Fallback local arm animation
const animateArmsLocal = (): void => {
  if (!shouldAnimate.value || !isComponentMounted.value) return
  
  armAnimationTimeouts.value.forEach(timeoutId => clearTimeout(timeoutId))
  armAnimationTimeouts.value = []
  
  const addTimeout = (callback: () => void, delay: number): void => {
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

// Clear all timeouts helper
const clearAllTimeouts = (): void => {
  if (blinkTimeoutId.value) {
    clearTimeout(blinkTimeoutId.value)
    blinkTimeoutId.value = null
  }
  
  armAnimationTimeouts.value.forEach(timeoutId => {
    clearTimeout(timeoutId)
  })
  armAnimationTimeouts.value = []
}

// Type-safe, error-handling animation loop
const startAnimationLoop = (): void => {
  if (!isComponentMounted.value || props.disabled) return
  
  const animate = (currentTime: number): void => {
    try {
      if (!isComponentMounted.value || hasError.value) return
      
      // Calculate frame time with type safety
      if (lastFrameTime.value > 0) {
        const deltaTime = currentTime - lastFrameTime.value
        frameCount.value++
        
        // Update average frame time (exponential moving average)
        averageFrameTime.value = averageFrameTime.value * 0.9 + deltaTime * 0.1
        
        // Update performance stats
        performanceStats.value = {
          ...performanceStats.value,
          renderTime: deltaTime,
          animationFrameRate: 1000 / averageFrameTime.value,
          lastMeasurement: new Date()
        }
        
        // Performance monitoring every 60 frames
        if (frameCount.value % 60 === 0) {
          const currentFPS = performanceStats.value.animationFrameRate
          
          // Check performance thresholds
          if (currentFPS < 30 && shouldAnimate.value) {
            shouldAnimate.value = false
            emit('performance-warning', performanceStats.value)
            
            if (props.debug) {
              logger.warn('ECHOAvatarDisplay: Performance degraded', performanceStats.value)
            }
          } else if (currentFPS > 45 && !shouldAnimate.value) {
            shouldAnimate.value = true
            
            if (props.debug) {
              logger.log('ECHOAvatarDisplay: Performance recovered', performanceStats.value)
            }
          }
          
          // Memory usage check (if available)
          if ('memory' in performance) {
            const memoryInfo = (performance as any).memory
            performanceStats.value.memoryUsage = memoryInfo.usedJSHeapSize
            
            if (memoryInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
              handleError({
                code: 'MEMORY_LEAK_DETECTED',
                message: `High memory usage detected: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                details: { memoryInfo },
                timestamp: new Date(),
                recoverable: true,
                severity: 'high',
                source: 'system'
              })
            }
          }
        }
      }
      
      lastFrameTime.value = currentTime
      
      // Schedule next frame
      if (isComponentMounted.value && !hasError.value) {
        animationFrameId.value = requestAnimationFrame(animate)
      }
    } catch (error) {
      handleError({
        code: 'ANIMATION_FAILED',
        message: `Animation loop error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error, currentTime },
        timestamp: new Date(),
        recoverable: false,
        severity: 'critical',
        source: 'animation'
      })
    }
  }
  
  animationFrameId.value = requestAnimationFrame(animate)
}

// Stop animation loop
const stopAnimationLoop = (): void => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
  if (breathingFrameId.value) {
    cancelAnimationFrame(breathingFrameId.value)
    breathingFrameId.value = null
  }
}

// Watchers with performance considerations and type safety
watch(() => props.animationState.armPosition, () => {
  nextTick(() => {
    animateArms()
  })
}, { flush: 'post' })

watch(() => props.emotion, (newEmotion: ECHOEmotion) => {
  if (!isComponentMounted.value) return
  
  if (animationComposable && props.character) {
    compUpdateEmotion(newEmotion)
  } else {
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
  }
}, { flush: 'post' })

watch(() => props.performanceMode, (mode: PerformanceMode) => {
  shouldAnimate.value = mode !== 'low'
  
  if (isComponentMounted.value) {
    stopAnimationLoop()
    if (mode !== 'low') {
      startAnimationLoop()
    }
  }
})

watch(() => props.disabled, (disabled: boolean) => {
  if (disabled) {
    shouldAnimate.value = false
    stopAnimationLoop()
    clearAllTimeouts()
  } else if (!hasError.value) {
    shouldAnimate.value = props.performanceMode !== 'low'
    startBlinking()
    startAnimationLoop()
  }
})

// Type-safe lifecycle management
onMounted(async (): Promise<void> => {
  try {
    isComponentMounted.value = true
    
    await nextTick() // Ensure DOM is ready
    
    // Validate props on mount
    const validationError = validateProps()
    if (validationError) {
      handleError(validationError)
      return
    }
    
    // Start all animations with error handling
    if (!props.disabled) {
      startBlinking()
      startAnimationLoop()
      
      if (props.debug) {
        logger.log('ECHOAvatarDisplay: Successfully mounted and initialized')
      }
    }
  } catch (error) {
    handleError({
      code: 'ANIMATION_FAILED',
      message: `Failed to mount component: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error },
      timestamp: new Date(),
      recoverable: false,
      severity: 'critical',
      source: 'system'
    })
  }
})

// Type-safe cleanup on unmount
onUnmounted((): void => {
  try {
    isComponentMounted.value = false
    shouldAnimate.value = false
    hasError.value = false
    
    // Complete cleanup to prevent memory leaks
    stopAnimationLoop()
    clearAllTimeouts()
    
    // Cleanup animation composable
    if (animationComposable) {
      compCleanup()
    }
    
    // Emit animation end event
    emit('animation-end', props.emotion)
    
    if (props.debug) {
      logger.log('ECHOAvatarDisplay: Successfully unmounted and cleaned up')
    }
  } catch (error) {
    // Log cleanup errors but don't throw (component is unmounting)
    logger.error('ECHOAvatarDisplay: Error during cleanup:', error)
  }
})
</script>

<style scoped>
.echo-avatar-container {
  @apply relative w-64 h-64 mx-auto;
}

.echo-robot {
  @apply w-full h-full transition-transform duration-300 ease-out;
  will-change: transform;
  transform-origin: center center;
  backface-visibility: hidden;
  perspective: 1000px;
}

.echo-robot.is-disabled {
  filter: grayscale(50%);
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.echo-robot.has-error {
  filter: hue-rotate(120deg) saturate(150%);
}

.echo-svg {
  @apply w-full h-full;
  shape-rendering: optimizeSpeed;
}

.antenna-light {
  animation: antennaGlow 2s ease-in-out infinite;
  transform: translateZ(0);
  will-change: opacity, transform;
}

.eye-glow {
  transition: all 0.3s ease;
  transform: translateZ(0);
  will-change: opacity, transform;
}

.eye-glow.blinking {
  transform: scaleY(0.1);
  opacity: 0.3;
}

.eye-glow.high-intensity {
  filter: url(#softGlow) brightness(1.2);
}

.eye-glow.error-state {
  filter: hue-rotate(120deg);
}

.chest-light {
  transition: opacity 0.1s ease;
  transform: translateZ(0);
  will-change: opacity, transform;
}

.chest-light.error-light {
  animation: errorPulse 1s ease-in-out infinite;
}

.mouth {
  transition: d 0.3s ease;
}

.mouth.error-mouth {
  stroke: #ff4444;
}

.cheek-blush {
  transition: opacity 0.5s ease;
}

.error-indicator {
  @apply absolute top-2 right-2 bg-red-100 border border-red-300 rounded px-2 py-1 text-xs;
}

.error-icon {
  @apply mr-1;
}

.performance-indicator {
  @apply absolute bottom-2 right-2 bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs;
}

.perf-icon {
  @apply mr-1;
}

/* Animation states */
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

/* GPU acceleration for animations */
#left-arm,
#right-arm {
  will-change: transform;
  transform-origin: inherit;
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

@keyframes errorPulse {
  0%, 100% { 
    opacity: 0.8; 
  }
  50% { 
    opacity: 1; 
    transform: scale3d(1.1, 1.1, 1);
  }
}

/* Accessibility and performance */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
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