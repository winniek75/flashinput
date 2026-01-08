<template>
  <div 
    class="word-planet"
    :class="[
      planetClass,
      { 
        'dragging': isDragging,
        'correct': isCorrect,
        'floating': !isDragging
      }
    ]"
    :style="planetStyle"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    role="button"
    :tabindex="0"
    :aria-label="`Word: ${word}`"
  >
    <!-- Planet Core -->
    <div class="planet-core">
      <span class="word-text">{{ word }}</span>
    </div>
    
    <!-- Planet Rings (for important words) -->
    <div v-if="hasRings" class="planet-rings">
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
    </div>
    
    <!-- Glow Effect -->
    <div class="planet-glow" :class="glowClass"></div>
    
    <!-- Orbital Particles -->
    <div class="orbital-particles">
      <div v-for="n in particleCount" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>
    
    <!-- Hover Info -->
    <transition name="tooltip">
      <div v-if="showTooltip" class="word-tooltip">
        <span class="tooltip-type">{{ wordTypeLabel }}</span>
        <span v-if="wordMeaning" class="tooltip-meaning">{{ wordMeaning }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'WordPlanet',
  props: {
    word: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isDragging: {
      type: Boolean,
      default: false
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    wordType: {
      type: String,
      default: 'noun'
    }
  },
  emits: ['dragstart', 'dragend', 'click'],
  setup(props, { emit }) {
    const showTooltip = ref(false)
    const isHovered = ref(false)
    
    // Planet styling based on word type
    const planetClass = computed(() => {
      const classes = {
        subject: 'planet-subject',
        verb: 'planet-verb',
        noun: 'planet-noun',
        adjective: 'planet-adjective',
        adverb: 'planet-adverb',
        preposition: 'planet-preposition',
        article: 'planet-article',
        conjunction: 'planet-conjunction',
        question: 'planet-question'
      }
      return classes[props.wordType] || 'planet-default'
    })
    
    // Planet size based on word importance
    const planetSize = computed(() => {
      const sizes = {
        subject: 'large',
        verb: 'large',
        noun: 'medium',
        adjective: 'medium',
        adverb: 'medium',
        preposition: 'small',
        article: 'small',
        conjunction: 'small',
        question: 'large'
      }
      return sizes[props.wordType] || 'medium'
    })
    
    const planetStyle = computed(() => {
      const baseSize = {
        large: 120,
        medium: 90,
        small: 70
      }[planetSize.value]
      
      return {
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        animationDelay: `${props.index * 0.2}s`
      }
    })
    
    // Important words get rings
    const hasRings = computed(() => {
      return ['subject', 'verb', 'question'].includes(props.wordType)
    })
    
    // Particle effects for verbs
    const particleCount = computed(() => {
      return props.wordType === 'verb' ? 6 : 0
    })
    
    // Glow effect class
    const glowClass = computed(() => {
      if (props.isCorrect) return 'glow-success'
      if (isHovered.value) return 'glow-hover'
      return ''
    })
    
    // Word type labels
    const wordTypeLabel = computed(() => {
      const labels = {
        subject: '主語',
        verb: '動詞',
        noun: '名詞',
        adjective: '形容詞',
        adverb: '副詞',
        preposition: '前置詞',
        article: '冠詞',
        conjunction: '接続詞',
        question: '疑問詞'
      }
      return labels[props.wordType] || '単語'
    })
    
    // Word meanings (can be extended with dictionary)
    const wordMeaning = computed(() => {
      // This could be connected to a translation API or dictionary
      return null
    })
    
    // Event Handlers
    const handleDragStart = (event) => {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', props.word)
      emit('dragstart', props.word)
    }
    
    const handleDragEnd = () => {
      emit('dragend')
    }
    
    const handleClick = () => {
      emit('click', props.word)
    }
    
    const handleMouseEnter = () => {
      isHovered.value = true
      showTooltip.value = true
    }
    
    const handleMouseLeave = () => {
      isHovered.value = false
      showTooltip.value = false
    }
    
    // Particle styling
    const getParticleStyle = (n) => {
      const angle = (360 / particleCount.value) * n
      const delay = n * 0.2
      return {
        transform: `rotate(${angle}deg)`,
        animationDelay: `${delay}s`
      }
    }
    
    return {
      showTooltip,
      planetClass,
      planetStyle,
      hasRings,
      particleCount,
      glowClass,
      wordTypeLabel,
      wordMeaning,
      handleDragStart,
      handleDragEnd,
      handleClick,
      handleMouseEnter,
      handleMouseLeave,
      getParticleStyle
    }
  }
}
</script>

<style scoped>
.word-planet {
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.3s ease;
  user-select: none;
}

.word-planet.dragging {
  cursor: grabbing;
  opacity: 0.8;
  transform: scale(1.1);
}

.word-planet.floating {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Planet Core */
.planet-core {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: inherit;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.word-text {
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem;
  text-align: center;
}

/* Planet Types */
.planet-subject {
  background: radial-gradient(circle at 30% 30%, #ffd700, #ff8c00);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
}

.planet-verb {
  background: radial-gradient(circle at 30% 30%, #4fc3f7, #2196f3);
  box-shadow: 0 0 30px rgba(33, 150, 243, 0.6);
}

.planet-noun {
  background: radial-gradient(circle at 30% 30%, #81c784, #4caf50);
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.6);
}

.planet-adjective {
  background: radial-gradient(circle at 30% 30%, #ba68c8, #9c27b0);
  box-shadow: 0 0 25px rgba(156, 39, 176, 0.6);
}

.planet-adverb {
  background: radial-gradient(circle at 30% 30%, #ff8a65, #ff5722);
  box-shadow: 0 0 25px rgba(255, 87, 34, 0.6);
}

.planet-preposition {
  background: radial-gradient(circle at 30% 30%, #64b5f6, #42a5f5);
  box-shadow: 0 0 20px rgba(66, 165, 245, 0.6);
}

.planet-article {
  background: radial-gradient(circle at 30% 30%, #a1887f, #795548);
  box-shadow: 0 0 20px rgba(121, 85, 72, 0.6);
}

.planet-conjunction {
  background: radial-gradient(circle at 30% 30%, #e57373, #f44336);
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.6);
}

.planet-question {
  background: radial-gradient(circle at 30% 30%, #ce93d8, #ab47bc);
  box-shadow: 0 0 30px rgba(171, 71, 188, 0.6);
}

.planet-default {
  background: radial-gradient(circle at 30% 30%, #90a4ae, #607d8b);
  box-shadow: 0 0 20px rgba(96, 125, 139, 0.6);
}

/* Planet Rings */
.planet-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ring {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotateX(60deg);
}

.ring-1 {
  width: 140%;
  height: 140%;
  animation: rotate 20s linear infinite;
}

.ring-2 {
  width: 160%;
  height: 160%;
  animation: rotate 30s linear infinite reverse;
  opacity: 0.6;
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotateX(60deg) rotateZ(360deg);
  }
}

/* Glow Effects */
.planet-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.planet-glow.glow-hover {
  opacity: 1;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  animation: pulse 1.5s ease-in-out infinite;
}

.planet-glow.glow-success {
  opacity: 1;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.5), transparent);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Orbital Particles */
.orbital-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  animation: orbit 3s linear infinite;
}

@keyframes orbit {
  from {
    transform: rotate(0deg) translateX(60px);
  }
  to {
    transform: rotate(360deg) translateX(60px);
  }
}

/* Tooltip */
.word-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.word-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.tooltip-type {
  display: block;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.tooltip-meaning {
  display: block;
  color: #b8bedd;
  font-size: 0.85rem;
}

/* Hover Effects */
.word-planet:hover {
  transform: scale(1.05);
}

.word-planet:hover .planet-core {
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.3);
}

/* Correct State */
.word-planet.correct {
  animation: correctPulse 0.6s ease;
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Transitions */
.tooltip-enter-active, .tooltip-leave-active {
  transition: all 0.3s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .word-text {
    font-size: 0.9rem;
  }
  
  .word-tooltip {
    font-size: 0.8rem;
  }
}
</style>