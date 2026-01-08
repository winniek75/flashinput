<template>
  <div 
    class="drop-zone"
    :class="{
      'has-word': word,
      'is-active': isActive,
      'is-correct': isCorrect === 'correct',
      'is-incorrect': isCorrect === 'incorrect',
      'is-hovering': isDragOver
    }"
    @dragover="handleDragOver"
    @drop="handleDrop"
    @dragleave="handleDragLeave"
    @click="handleClick"
    role="button"
    :tabindex="word ? 0 : -1"
    :aria-label="`Slot ${index + 1}: ${word || 'empty'}`"
  >
    <!-- Drop Zone Background Animation -->
    <div class="zone-background">
      <div class="orbit-ring"></div>
      <div class="energy-field"></div>
    </div>
    
    <!-- Word Display -->
    <transition name="word-place">
      <div v-if="word" class="placed-word">
        <span class="word-content">{{ word }}</span>
        <button 
          @click.stop="removeWord" 
          class="remove-btn"
          :aria-label="`Remove ${word}`"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
    
    <!-- Empty Slot Indicator -->
    <div v-if="!word" class="empty-indicator">
      <div class="slot-number">{{ index + 1 }}</div>
      <div class="drop-hint" v-if="isActive">
        <i class="fas fa-arrow-down"></i>
      </div>
    </div>
    
    <!-- Status Indicator -->
    <transition name="status">
      <div v-if="isCorrect" class="status-indicator" :class="isCorrect">
        <i v-if="isCorrect === 'correct'" class="fas fa-check"></i>
        <i v-else-if="isCorrect === 'incorrect'" class="fas fa-times"></i>
      </div>
    </transition>
    
    <!-- Connection Line (for visual continuity) -->
    <div v-if="word && index > 0" class="connection-line"></div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'DropZone',
  props: {
    index: {
      type: Number,
      required: true
    },
    word: {
      type: String,
      default: null
    },
    isCorrect: {
      type: String,
      default: null // null, 'correct', 'incorrect'
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['drop', 'remove'],
  setup(props, { emit }) {
    const isDragOver = ref(false)
    
    // Drag and Drop Handlers
    const handleDragOver = (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      isDragOver.value = true
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const word = event.dataTransfer.getData('text/plain')
      if (word && !props.word) {
        emit('drop', event)
      }
    }
    
    const handleDragLeave = () => {
      isDragOver.value = false
    }
    
    const handleClick = () => {
      if (props.word) {
        removeWord()
      }
    }
    
    const removeWord = () => {
      if (props.word) {
        emit('remove', props.index)
      }
    }
    
    return {
      isDragOver,
      handleDragOver,
      handleDrop,
      handleDragLeave,
      handleClick,
      removeWord
    }
  }
}
</script>

<style scoped>
.drop-zone {
  position: relative;
  width: 120px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: visible;
}

/* Zone States */
.drop-zone.has-word {
  background: rgba(102, 126, 234, 0.1);
  border-style: solid;
  border-color: rgba(102, 126, 234, 0.5);
}

.drop-zone.is-active {
  border-color: rgba(255, 215, 0, 0.5);
  animation: activeGlow 2s ease-in-out infinite;
}

@keyframes activeGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
}

.drop-zone.is-hovering {
  background: rgba(255, 215, 0, 0.1);
  border-color: #ffd700;
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
}

.drop-zone.is-correct {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
}

.drop-zone.is-incorrect {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Zone Background */
.zone-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drop-zone.is-hovering .zone-background {
  opacity: 1;
}

.orbit-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

.energy-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  animation: energyPulse 3s ease-in-out infinite;
}

@keyframes energyPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Placed Word */
.placed-word {
  position: relative;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
}

.word-content {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.remove-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.8);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.remove-btn:hover {
  background: #f44336;
  transform: scale(1.1);
}

/* Empty Indicator */
.empty-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.slot-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-weight: bold;
  font-size: 0.9rem;
}

.drop-hint {
  color: #ffd700;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  z-index: 3;
}

.status-indicator.correct {
  background: #4caf50;
  color: white;
  animation: statusPop 0.3s ease;
}

.status-indicator.incorrect {
  background: #f44336;
  color: white;
  animation: statusPop 0.3s ease;
}

@keyframes statusPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Connection Line */
.connection-line {
  position: absolute;
  left: -20px;
  top: 50%;
  width: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5));
  transform: translateY(-50%);
}

.drop-zone.is-correct .connection-line {
  background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.5));
}

/* Transitions */
.word-place-enter-active, .word-place-leave-active {
  transition: all 0.3s ease;
}

.word-place-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.word-place-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

.status-enter-active, .status-leave-active {
  transition: all 0.3s ease;
}

.status-enter-from, .status-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Hover Effects */
.drop-zone:hover {
  background: rgba(255, 255, 255, 0.08);
}

.drop-zone:hover .slot-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Focus Styles */
.drop-zone:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .drop-zone {
    width: 100px;
    height: 50px;
  }
  
  .word-content {
    font-size: 0.9rem;
  }
  
  .slot-number {
    width: 25px;
    height: 25px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .drop-zone {
    width: 80px;
    height: 45px;
  }
  
  .placed-word {
    padding: 0.3rem 0.5rem;
  }
  
  .word-content {
    font-size: 0.8rem;
  }
  
  .remove-btn {
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
  }
}
</style>