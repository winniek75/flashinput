<template>
  <div 
    class="facility-card"
    :class="[
      `facility-${facility.type}`,
      { 
        'facility-locked': !facility.unlocked,
        'facility-completed': facility.completed,
        'facility-vr-ready': facility.vrReady,
        'facility-featured': facility.featured
      }
    ]"
    @click="handleClick"
    :style="facilityStyle"
  >
    <!-- 3D Facility Building -->
    <div class="facility-building">
      <!-- Main Structure -->
      <div class="building-main" :class="buildingClass">
        <div class="building-face building-front">
          <div class="facility-icon">{{ facility.icon }}</div>
          <div class="facility-lights" v-if="facility.unlocked">
            <div 
              v-for="light in facilityLights" 
              :key="light.id"
              class="light-dot"
              :style="{ 
                left: `${light.x}%`, 
                top: `${light.y}%`,
                animationDelay: `${light.delay}s` 
              }"
            ></div>
          </div>
        </div>
        <div class="building-face building-top"></div>
        <div class="building-face building-right"></div>
      </div>

      <!-- VR Enhancement Dome (if VR ready) -->
      <div v-if="facility.vrReady" class="vr-dome">
        <div class="dome-structure">
          <div class="dome-ring" v-for="ring in 3" :key="ring"></div>
          <div class="vr-indicator">🥽</div>
        </div>
      </div>

      <!-- Status Indicators -->
      <div class="facility-status">
        <!-- Completion Badge -->
        <div v-if="facility.completed" class="status-badge completed">
          <div class="badge-icon">✅</div>
        </div>
        
        <!-- VR Ready Badge -->
        <div v-if="facility.vrReady" class="status-badge vr-ready">
          <div class="badge-icon">🚀</div>
        </div>
        
        <!-- New/Featured Badge -->
        <div v-if="facility.isNew && facility.unlocked" class="status-badge new">
          NEW!
        </div>
        <div v-else-if="facility.featured && facility.unlocked" class="status-badge featured">
          おすすめ
        </div>
        
        <!-- Lock Indicator -->
        <div v-if="!facility.unlocked" class="status-badge locked">
          <div class="badge-icon">🔒</div>
        </div>
      </div>
    </div>

    <!-- Facility Information Panel -->
    <div class="facility-info">
      <div class="facility-header">
        <h3 class="facility-name">{{ facility.name }}</h3>
        <div class="facility-subtitle">{{ facility.subtitle }}</div>
      </div>

      <div class="facility-description">
        {{ facility.description }}
      </div>

      <!-- Progress Information -->
      <div class="facility-progress">
        <div class="progress-item">
          <span class="progress-label">進捗率</span>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${facility.progress}%` }"
            ></div>
          </div>
          <span class="progress-value">{{ facility.progress }}%</span>
        </div>

        <div class="progress-item">
          <span class="progress-label">ベストスコア</span>
          <span class="progress-value">{{ facility.bestScore.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Rewards & VR Skills -->
      <div class="facility-rewards">
        <div class="reward-item">
          <span class="reward-icon">💎</span>
          <span class="reward-value">{{ facility.crystalReward }}</span>
          <span class="reward-label">クリスタル</span>
        </div>
        
        <div v-if="facility.vrSkills && facility.vrSkills.length > 0" class="vr-skills">
          <div class="vr-skills-label">VRスキル習得:</div>
          <div class="vr-skill-tags">
            <span 
              v-for="skill in facility.vrSkills" 
              :key="skill"
              class="vr-skill-tag"
              :title="getVRSkillDescription(skill)"
            >
              {{ getVRSkillName(skill) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="facility-action">
        <button 
          class="action-button"
          :class="actionButtonClass"
          :disabled="!facility.unlocked"
          @click.stop="handleAction"
        >
          <span class="action-icon">{{ actionIcon }}</span>
          <span class="action-text">{{ actionText }}</span>
        </button>
      </div>
    </div>

    <!-- VR Scenario Preview (if available) -->
    <div v-if="facility.vrScenario && facility.vrReady" class="vr-preview-hint">
      <div class="vr-hint-content">
        <div class="vr-hint-icon">🌐</div>
        <div class="vr-hint-text">
          <div class="vr-scenario-name">{{ facility.vrScenario.name }}</div>
          <div class="vr-scenario-desc">{{ facility.vrScenario.description }}</div>
        </div>
      </div>
    </div>

    <!-- Facility Connection Lines (for isometric view) -->
    <div v-if="facility.connections" class="facility-connections">
      <div 
        v-for="connection in facility.connections" 
        :key="connection.to"
        class="connection-line"
        :class="`connection-to-${connection.to}`"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useVRReadiness } from '@/services/vrReadinessAssessment'

// Props
const props = defineProps({
  facility: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0, z: 0 })
  },
  isometric: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['start-game', 'view-vr-scenario', 'view-stats'])

// Composables
const gameStore = useGameStore()
const vrReadiness = useVRReadiness()

// Computed Properties
const facilityStyle = computed(() => {
  if (!props.isometric) return {}
  
  const { x, y, z } = props.position
  return {
    transform: `translate3d(${x}px, ${y}px, ${z}px)`,
    zIndex: Math.floor(y + z)
  }
})

const buildingClass = computed(() => {
  const baseClass = `building-${props.facility.type}`
  const sizeClass = `building-${props.facility.size || 'medium'}`
  return [baseClass, sizeClass]
})

const facilityLights = computed(() => {
  if (!props.facility.unlocked) return []
  
  const lightPatterns = {
    'research-lab': [
      { id: 1, x: 20, y: 30, delay: 0 },
      { id: 2, x: 80, y: 30, delay: 0.5 },
      { id: 3, x: 50, y: 60, delay: 1.0 }
    ],
    'tower': [
      { id: 1, x: 50, y: 20, delay: 0 },
      { id: 2, x: 50, y: 40, delay: 0.3 },
      { id: 3, x: 50, y: 60, delay: 0.6 }
    ],
    'arena': [
      { id: 1, x: 25, y: 50, delay: 0 },
      { id: 2, x: 75, y: 50, delay: 0.2 },
      { id: 3, x: 50, y: 25, delay: 0.4 },
      { id: 4, x: 50, y: 75, delay: 0.6 }
    ],
    'plaza': [
      { id: 1, x: 30, y: 40, delay: 0 },
      { id: 2, x: 70, y: 40, delay: 0.25 },
      { id: 3, x: 50, y: 20, delay: 0.5 },
      { id: 4, x: 50, y: 80, delay: 0.75 }
    ]
  }
  
  return lightPatterns[props.facility.type] || lightPatterns['research-lab']
})

const actionIcon = computed(() => {
  if (!props.facility.unlocked) return '🔒'
  if (props.facility.completed && props.facility.vrReady) return '🥽'
  if (props.facility.completed) return '🔄'
  return '▶️'
})

const actionText = computed(() => {
  if (!props.facility.unlocked) return 'ロック中'
  if (props.facility.completed && props.facility.vrReady) return 'VR体験'
  if (props.facility.completed) return 'リプレイ'
  return 'スタート'
})

const actionButtonClass = computed(() => {
  const classes = ['action-button']
  
  if (!props.facility.unlocked) {
    classes.push('locked')
  } else if (props.facility.vrReady) {
    classes.push('vr-ready')
  } else if (props.facility.completed) {
    classes.push('completed')
  } else {
    classes.push('available')
  }
  
  return classes
})

// Methods
const handleClick = () => {
  if (!props.facility.unlocked) {
    // Show unlock requirements
    return
  }
  
  emit('view-stats', props.facility)
}

const handleAction = () => {
  if (!props.facility.unlocked) return
  
  if (props.facility.completed && props.facility.vrReady) {
    emit('view-vr-scenario', props.facility)
  } else {
    emit('start-game', props.facility)
  }
}

const getVRSkillName = (skillId) => {
  const skillNames = {
    'basic_interaction': '基本操作',
    'conversational_fluency': '会話',
    'cultural_adaptation': '文化適応',
    'advanced_communication': '高度会話',
    'phonics_mastery': '音素習得',
    'rhythm_recognition': 'リズム認識',
    'sound_production': '音声生成',
    'listening_comprehension': '聴解力'
  }
  return skillNames[skillId] || skillId
}

const getVRSkillDescription = (skillId) => {
  const skillDescriptions = {
    'basic_interaction': 'VR空間での基本的な操作スキル',
    'conversational_fluency': '日常会話でのスムーズなコミュニケーション',
    'cultural_adaptation': '文化的背景を理解した適切な表現',
    'advanced_communication': '複雑な議論や専門的な会話',
    'phonics_mastery': '正確な音素の認識と発音',
    'rhythm_recognition': '英語のリズムとイントネーションの理解',
    'sound_production': 'ネイティブに近い音声の生成',
    'listening_comprehension': '多様な音声環境での聴解能力'
  }
  return skillDescriptions[skillId] || 'VRスキルの説明'
}
</script>

<style scoped lang="scss">
.facility-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  min-height: 420px;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    
    .facility-building {
      transform: rotateX(-5deg) rotateY(5deg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    
    .facility-info {
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
  }
  
  &.facility-locked {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      
      .facility-building {
        transform: none;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
    }
  }
  
  &.facility-completed {
    .facility-building {
      border: 2px solid #10b981;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
    }
  }
  
  &.facility-vr-ready {
    .facility-building {
      border: 2px solid #8b5cf6;
      box-shadow: 0 0 40px rgba(139, 92, 246, 0.5);
    }
  }
  
  &.facility-featured {
    &::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6, #06b6d4);
      border-radius: 20px;
      z-index: -1;
      animation: rainbow-border 4s linear infinite;
      background-size: 300% 300%;
    }
  }
}

.facility-building {
  position: relative;
  width: 100%;
  height: 200px;
  perspective: 1000px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform-style: preserve-3d;
  transition: all 0.3s ease;
}

.building-main {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  
  &.building-research-lab {
    .building-front {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    }
  }
  
  &.building-tower {
    .building-front {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }
  }
  
  &.building-arena {
    .building-front {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }
  }
  
  &.building-plaza {
    .building-front {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
  }
}

.building-face {
  position: absolute;
  
  &.building-front {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }
  
  &.building-top {
    width: 100%;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    transform: rotateX(90deg) translateZ(10px);
    transform-origin: top;
  }
  
  &.building-right {
    width: 20px;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    transform: rotateY(90deg) translateZ(140px);
    transform-origin: right;
  }
}

.facility-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
  animation: float 3s ease-in-out infinite;
  z-index: 10;
  position: relative;
}

.facility-lights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.light-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 10px #fbbf24;
  animation: pulse 2s ease-in-out infinite;
}

.vr-dome {
  position: absolute;
  top: -30px;
  right: -20px;
  width: 60px;
  height: 60px;
  
  .dome-structure {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
    animation: vr-pulse 2s ease-in-out infinite;
  }
  
  .dome-ring {
    position: absolute;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    
    &:nth-child(1) {
      width: 100%;
      height: 100%;
    }
    
    &:nth-child(2) {
      width: 75%;
      height: 75%;
      animation: ring-rotate 4s linear infinite;
    }
    
    &:nth-child(3) {
      width: 50%;
      height: 50%;
      animation: ring-rotate 4s linear infinite reverse;
    }
  }
  
  .vr-indicator {
    font-size: 1.2rem;
    position: relative;
    z-index: 10;
  }
}

.facility-status {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    backdrop-filter: blur(8px);
    
    &.completed {
      background: rgba(16, 185, 129, 0.9);
      color: white;
    }
    
    &.vr-ready {
      background: rgba(139, 92, 246, 0.9);
      color: white;
    }
    
    &.new {
      background: rgba(239, 68, 68, 0.9);
      color: white;
    }
    
    &.featured {
      background: rgba(245, 158, 11, 0.9);
      color: white;
    }
    
    &.locked {
      background: rgba(75, 85, 99, 0.9);
      color: white;
    }
  }
}

.facility-info {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.98) 0%, 
    rgba(249, 250, 251, 0.95) 100%);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(229, 231, 235, 0.8);
  transition: all 0.3s ease;
}

.facility-header {
  margin-bottom: 12px;
  
  .facility-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .facility-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
  }
}

.facility-description {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.4;
  margin-bottom: 12px;
}

.facility-progress {
  margin-bottom: 12px;
  
  .progress-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .progress-label {
      font-size: 0.75rem;
      color: #6b7280;
      min-width: 60px;
    }
    
    .progress-bar {
      flex: 1;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        transition: width 0.3s ease;
      }
    }
    
    .progress-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1f2937;
      min-width: 40px;
    }
  }
}

.facility-rewards {
  margin-bottom: 12px;
  
  .reward-item {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 8px;
    
    .reward-icon {
      font-size: 1rem;
    }
    
    .reward-value {
      font-weight: 600;
      color: #1f2937;
    }
    
    .reward-label {
      font-size: 0.75rem;
      color: #6b7280;
    }
  }
  
  .vr-skills {
    .vr-skills-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .vr-skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .vr-skill-tag {
        padding: 2px 6px;
        background: #8b5cf6;
        color: white;
        border-radius: 8px;
        font-size: 0.625rem;
        font-weight: 500;
      }
    }
  }
}

.facility-action {
  .action-button {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .action-icon {
      font-size: 1rem;
    }
    
    &.locked {
      background: #9ca3af;
      color: white;
      cursor: not-allowed;
    }
    
    &.available {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }
    
    &.completed {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
    }
    
    &.vr-ready {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      }
    }
  }
}

.vr-preview-hint {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(139, 92, 246, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  
  .vr-hint-content {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .vr-hint-icon {
      font-size: 1rem;
    }
    
    .vr-scenario-name {
      font-weight: 600;
    }
    
    .vr-scenario-desc {
      opacity: 0.8;
    }
  }
}

.facility-connections {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  
  .connection-line {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, #06b6d4 50%, transparent 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 0;
      right: 0;
      bottom: -1px;
      background: linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.3) 50%, transparent 100%);
      animation: connection-flow 2s ease-in-out infinite;
    }
  }
}

// Animations
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

@keyframes vr-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
  50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
}

@keyframes ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes rainbow-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes connection-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// Animations Enhancement
@keyframes rainbow-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

// Responsive Design
@media (max-width: 768px) {
  .facility-card {
    max-width: 100%;
    min-height: 380px;
  }
  
  .facility-building {
    height: 180px;
  }
  
  .facility-icon {
    font-size: 3rem;
  }
  
  .vr-dome {
    width: 50px;
    height: 50px;
    top: -25px;
    right: -15px;
  }
  
  .facility-info {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .facility-card {
    min-height: 350px;
  }
  
  .facility-building {
    height: 160px;
  }
  
  .facility-icon {
    font-size: 2.5rem;
  }
  
  .facility-name {
    font-size: 1.125rem;
  }
  
  .facility-description {
    font-size: 0.813rem;
  }
}
</style>