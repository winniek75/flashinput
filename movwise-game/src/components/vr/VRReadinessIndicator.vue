<template>
  <div class="vr-readiness-indicator" :class="{ 'detailed': showDetails }">
    <!-- Main Status Display -->
    <div class="status-container">
      <!-- VR Icon with Level Status -->
      <div class="vr-icon-container" @click="showDetails = !showDetails">
        <div class="vr-icon" :class="levelClass">
          <svg viewBox="0 0 24 24" class="vr-headset">
            <path d="M20.26 12.5C20.26 17.19 16.45 21 11.76 21C7.07 21 3.26 17.19 3.26 12.5V10.5C3.26 7.74 5.5 5.5 8.26 5.5H15.26C18.02 5.5 20.26 7.74 20.26 10.5V12.5Z" 
                  :fill="iconColor" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="8.5" cy="11" r="1.5" :fill="lensColor"/>
            <circle cx="15.5" cy="11" r="1.5" :fill="lensColor"/>
            <path d="M6 15c2.5 1.5 9.5 1.5 12 0" stroke="currentColor" stroke-width="1.2" fill="none"/>
          </svg>
          <div class="level-badge" :class="levelClass">
            {{ levelIcon }}
          </div>
        </div>
        
        <!-- Progress Circle -->
        <div class="progress-circle">
          <svg class="progress-ring" width="70" height="70">
            <circle
              class="progress-ring-background"
              cx="35"
              cy="35"
              r="30"
              stroke="#e0e7ff"
              stroke-width="4"
              fill="transparent"/>
            <circle
              class="progress-ring-progress"
              cx="35"
              cy="35"
              r="30"
              :stroke="progressColor"
              stroke-width="4"
              fill="transparent"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
              :style="{ transition: 'stroke-dashoffset 0.8s ease-in-out' }"/>
          </svg>
          <div class="progress-text">
            <span class="score">{{ currentScore }}%</span>
            <span class="level-name">{{ levelDisplayName }}</span>
          </div>
        </div>
      </div>

      <!-- Notification Badge -->
      <div v-if="unreadCount > 0" class="notification-badge" @click="$emit('showNotifications')">
        <span class="count">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </div>
    </div>

    <!-- Detailed View -->
    <Transition name="slide-down">
      <div v-if="showDetails" class="details-panel">
        <!-- Level Progress Bar -->
        <div class="level-progress">
          <div class="level-info">
            <h4>{{ levelDisplayName }}レベル</h4>
            <span class="progress-percentage">{{ levelProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${levelProgress}%`, backgroundColor: progressColor }"
            ></div>
          </div>
          <div class="level-milestones">
            <span class="current-level">{{ levelDisplayName }}</span>
            <span v-if="nextMilestone" class="next-level">{{ getNextLevelName() }}</span>
          </div>
        </div>

        <!-- Skill Categories -->
        <div class="skill-categories">
          <h5>スキル分析</h5>
          <div class="category-list">
            <div 
              v-for="category in skillCategories" 
              :key="category.id"
              class="skill-category"
            >
              <div class="category-header">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-score">{{ Math.round(category.score) }}%</span>
              </div>
              <div class="category-bar">
                <div 
                  class="category-fill" 
                  :style="{ 
                    width: `${category.score}%`, 
                    backgroundColor: getCategoryColor(category.score) 
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- VR Academy Recommendation -->
        <div v-if="vrRecommendation" class="vr-recommendation">
          <div class="recommendation-header">
            <h5>VRアカデミー推奨</h5>
            <div class="readiness-status" :class="{ 'ready': vrRecommendation.isReady }">
              <span class="status-dot"></span>
              {{ vrRecommendation.isReady ? '準備完了' : '準備中' }}
            </div>
          </div>
          <p class="recommendation-message">{{ vrRecommendation.message }}</p>
          
          <!-- Recommended Scenarios -->
          <div v-if="vrRecommendation.recommendedScenarios.length > 0" class="scenarios">
            <h6>推奨シナリオ</h6>
            <div class="scenario-list">
              <div 
                v-for="scenario in vrRecommendation.recommendedScenarios.slice(0, 2)" 
                :key="scenario.scenarioId"
                class="scenario-item"
                :class="{ 'high-priority': scenario.priority === 'high' }"
                @click="$emit('selectScenario', scenario)"
              >
                <div class="scenario-info">
                  <span class="scenario-title">{{ scenario.title }}</span>
                  <span class="scenario-duration">{{ scenario.estimatedDuration }}分</span>
                </div>
                <div class="scenario-skills">
                  <span 
                    v-for="skill in scenario.skills.slice(0, 2)" 
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ getSkillDisplayName(skill) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button 
            class="action-btn primary" 
            @click="$emit('showFullReport')"
          >
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M9 12l2 2 4-4M7.5 3h9l1.5 1.5v15l-1.5 1.5h-9L6 19.5v-15L7.5 3z"/>
            </svg>
            詳細レポート
          </button>
          
          <button 
            v-if="vrRecommendation?.isReady" 
            class="action-btn success" 
            @click="$emit('startVRExperience')"
          >
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M14.5 4l7 6-7 6M7.5 4l7 6-7 6"/>
            </svg>
            VRを開始
          </button>
          
          <button 
            class="action-btn secondary" 
            @click="refreshAssessment"
            :disabled="isRefreshing"
          >
            <svg viewBox="0 0 24 24" class="icon" :class="{ 'spin': isRefreshing }">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {{ isRefreshing ? '更新中...' : '更新' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, watch } from 'vue'
import { useVRReadiness } from '@/services/vrReadinessAssessment'
import type { VRReadinessLevel, VRScenarioRecommendation } from '@/services/vrReadinessAssessment'

// Props
interface Props {
  compact?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // minutes
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  autoRefresh: true,
  refreshInterval: 30
})

// Emits
const emit = defineEmits<{
  showNotifications: []
  showFullReport: []
  selectScenario: [scenario: VRScenarioRecommendation]
  startVRExperience: []
}>()

// Composables
const vrReadiness = useVRReadiness()

// State
const showDetails = ref(false)
const isRefreshing = ref(false)

// Computed Properties
const currentScore = computed(() => vrReadiness.currentScore.value)
const currentLevel = computed(() => vrReadiness.currentLevel.value)
const currentReport = computed(() => vrReadiness.currentReport.value)
const unreadCount = computed(() => vrReadiness.unreadCount.value)

const levelProgress = computed(() => currentReport.value?.levelProgress || 0)
const nextMilestone = computed(() => currentReport.value?.nextMilestone)
const vrRecommendation = computed(() => currentReport.value?.vrAcademyRecommendation)

const skillCategories = computed(() => {
  return currentReport.value?.assessments.map(assessment => ({
    id: assessment.category.id,
    name: assessment.category.name.replace('VR ', '').replace('Advanced ', ''),
    score: assessment.score
  })) || []
})

// Visual Properties
const levelDisplayName = computed(() => {
  const names = {
    'beginner': 'ビギナー',
    'foundation': 'ファウンデーション',
    'intermediate': 'インターミディエイト',
    'advanced': 'アドバンスド',
    'master': 'マスター'
  }
  return names[currentLevel.value as keyof typeof names] || currentLevel.value
})

const levelClass = computed(() => `level-${currentLevel.value}`)

const levelIcon = computed(() => {
  const icons = {
    'beginner': '🌱',
    'foundation': '🏗️',
    'intermediate': '🚀',
    'advanced': '⭐',
    'master': '👑'
  }
  return icons[currentLevel.value as keyof typeof icons] || '🎯'
})

const iconColor = computed(() => {
  const colors = {
    'beginner': '#94a3b8',
    'foundation': '#06b6d4',
    'intermediate': '#3b82f6',
    'advanced': '#8b5cf6',
    'master': '#f59e0b'
  }
  return colors[currentLevel.value as keyof typeof colors] || '#6b7280'
})

const lensColor = computed(() => {
  const colors = {
    'beginner': '#cbd5e1',
    'foundation': '#67e8f9',
    'intermediate': '#93c5fd',
    'advanced': '#c4b5fd',
    'master': '#fbbf24'
  }
  return colors[currentLevel.value as keyof typeof colors] || '#9ca3af'
})

const progressColor = computed(() => {
  const colors = {
    'beginner': '#06b6d4',
    'foundation': '#3b82f6',
    'intermediate': '#8b5cf6',
    'advanced': '#f59e0b',
    'master': '#ef4444'
  }
  return colors[currentLevel.value as keyof typeof colors] || '#6b7280'
})

// Progress Circle Calculations
const circumference = computed(() => 2 * Math.PI * 30)
const progressOffset = computed(() => {
  const progress = (currentScore.value / 100)
  return circumference.value - (progress * circumference.value)
})

// Methods
const refreshAssessment = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    await vrReadiness.generateReport()
  } catch (error) {
    logger.error('Failed to refresh assessment:', error)
  } finally {
    isRefreshing.value = false
  }
}

const getCategoryColor = (score: number): string => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

const getSkillDisplayName = (skillId: string): string => {
  const names = {
    'basic_interaction': '基本操作',
    'conversational_fluency': '会話',
    'cultural_adaptation': '文化適応',
    'advanced_communication': '高度会話'
  }
  return names[skillId as keyof typeof names] || skillId
}

const getNextLevelName = (): string => {
  if (!nextMilestone.value) return ''
  const names = {
    'foundation': 'ファウンデーション',
    'intermediate': 'インターミディエイト',
    'advanced': 'アドバンスド',
    'master': 'マスター'
  }
  return names[nextMilestone.value.level as keyof typeof names] || nextMilestone.value.level
}

// Lifecycle
onMounted(async () => {
  // Load existing report
  await vrReadiness.loadReport()
  
  // Generate fresh report if none exists
  if (!currentReport.value) {
    await refreshAssessment()
  }

  // Setup auto-refresh
  if (props.autoRefresh) {
    const interval = setInterval(() => {
      refreshAssessment()
    }, props.refreshInterval * 60 * 1000)
    
    // Cleanup on unmount
    watch(() => false, () => {
      clearInterval(interval)
    })
  }
})

// Watch for score changes to show animations
watch(currentScore, (newScore, oldScore) => {
  if (oldScore && newScore > oldScore) {
    // Trigger celebration animation
    const indicator = document.querySelector('.vr-readiness-indicator')
    indicator?.classList.add('score-increased')
    setTimeout(() => {
      indicator?.classList.remove('score-increased')
    }, 1000)
  }
})
</script>

<style scoped lang="scss">
.vr-readiness-indicator {
  --level-color: #6b7280;
  --level-bg: #f3f4f6;
  --level-glow: rgba(107, 114, 128, 0.2);
  
  &.level-beginner {
    --level-color: #06b6d4;
    --level-bg: #ecfeff;
    --level-glow: rgba(6, 182, 212, 0.2);
  }
  
  &.level-foundation {
    --level-color: #3b82f6;
    --level-bg: #eff6ff;
    --level-glow: rgba(59, 130, 246, 0.2);
  }
  
  &.level-intermediate {
    --level-color: #8b5cf6;
    --level-bg: #f5f3ff;
    --level-glow: rgba(139, 92, 246, 0.2);
  }
  
  &.level-advanced {
    --level-color: #f59e0b;
    --level-bg: #fffbeb;
    --level-glow: rgba(245, 158, 11, 0.2);
  }
  
  &.level-master {
    --level-color: #ef4444;
    --level-bg: #fef2f2;
    --level-glow: rgba(239, 68, 68, 0.2);
  }

  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &.score-increased {
    animation: scoreIncrease 1s ease;
  }

  @keyframes scoreIncrease {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); box-shadow: 0 0 20px var(--level-glow); }
    100% { transform: scale(1); }
  }
}

.status-container {
  position: relative;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vr-icon-container {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.vr-icon {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  .vr-headset {
    width: 32px;
    height: 32px;
    color: var(--level-color);
  }
}

.level-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--level-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  z-index: 3;
}

.progress-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  .progress-ring {
    transform: rotate(-90deg);
    
    .progress-ring-background {
      opacity: 0.3;
    }
    
    .progress-ring-progress {
      stroke-linecap: round;
    }
  }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
  
  .score {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: var(--level-color);
    line-height: 1;
  }
  
  .level-name {
    display: block;
    font-size: 9px;
    color: #6b7280;
    line-height: 1;
    margin-top: 2px;
    white-space: nowrap;
  }
}

.notification-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  .count {
    color: white;
    font-size: 11px;
    font-weight: 600;
  }
}

.details-panel {
  padding: 0 20px 20px;
  border-top: 1px solid #e5e7eb;
  margin-top: 10px;
}

.level-progress {
  margin-bottom: 20px;
  
  .level-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    .progress-percentage {
      font-size: 14px;
      color: var(--level-color);
      font-weight: 600;
    }
  }
  
  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
    
    .progress-fill {
      height: 100%;
      transition: width 0.8s ease;
      border-radius: 4px;
    }
  }
  
  .level-milestones {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6b7280;
    
    .current-level {
      font-weight: 600;
      color: var(--level-color);
    }
  }
}

.skill-categories {
  margin-bottom: 20px;
  
  h5 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 12px 0;
  }
}

.skill-category {
  margin-bottom: 12px;
  
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    
    .category-name {
      font-size: 13px;
      color: #374151;
    }
    
    .category-score {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
    }
  }
  
  .category-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
    
    .category-fill {
      height: 100%;
      transition: width 0.6s ease;
      border-radius: 2px;
    }
  }
}

.vr-recommendation {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--level-bg);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    h5 {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
    
    .readiness-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #6b7280;
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6b7280;
      }
      
      &.ready {
        color: #059669;
        
        .status-dot {
          background: #10b981;
        }
      }
    }
  }
  
  .recommendation-message {
    font-size: 13px;
    color: #374151;
    margin: 8px 0;
    line-height: 1.4;
  }
  
  .scenarios {
    margin-top: 12px;
    
    h6 {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
  }
}

.scenario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--level-color);
    background: #fafafa;
  }
  
  &.high-priority {
    border-color: var(--level-color);
    background: rgba(255, 255, 255, 0.8);
  }
  
  .scenario-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .scenario-title {
      font-size: 12px;
      font-weight: 500;
      color: #1f2937;
    }
    
    .scenario-duration {
      font-size: 11px;
      color: #6b7280;
    }
  }
  
  .scenario-skills {
    display: flex;
    gap: 4px;
    
    .skill-tag {
      padding: 2px 6px;
      background: var(--level-color);
      color: white;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
    }
  }
}

.quick-actions {
  display: flex;
  gap: 8px;
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      
      &.spin {
        animation: spin 1s linear infinite;
      }
    }
    
    &.primary {
      background: var(--level-color);
      color: white;
      
      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }
    }
    
    &.success {
      background: #10b981;
      color: white;
      
      &:hover {
        background: #059669;
        transform: translateY(-1px);
      }
    }
    
    &.secondary {
      background: #f3f4f6;
      color: #6b7280;
      
      &:hover {
        background: #e5e7eb;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

// Transitions
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Responsive Design
@media (max-width: 768px) {
  .details-panel {
    padding: 0 16px 16px;
  }
  
  .quick-actions {
    flex-direction: column;
    
    .action-btn {
      flex: none;
    }
  }
  
  .scenario-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    
    .scenario-skills {
      align-self: stretch;
    }
  }
}
</style>