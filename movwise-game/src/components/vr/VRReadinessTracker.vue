<template>
  <div class="vr-readiness-tracker">
    <!-- Header -->
    <div class="tracker-header">
      <div class="header-icon">🎯</div>
      <div class="header-content">
        <h3 class="header-title">音素習得 → VR準備度</h3>
        <p class="header-subtitle">フォニックススキルとVRシナリオの関連性</p>
      </div>
      <button 
        class="toggle-details"
        @click="showDetails = !showDetails"
        :class="{ active: showDetails }"
      >
        <svg viewBox="0 0 24 24" class="toggle-icon">
          <path d="M7 10l5 5 5-5"/>
        </svg>
      </button>
    </div>

    <!-- Quick Status -->
    <div class="quick-status">
      <div class="status-item" v-for="category in phonicsCategories" :key="category.id">
        <div class="status-icon">{{ category.icon }}</div>
        <div class="status-content">
          <div class="status-name">{{ category.name }}</div>
          <div class="status-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: `${category.progress}%`,
                  backgroundColor: getProgressColor(category.progress)
                }"
              ></div>
            </div>
            <span class="progress-text">{{ category.progress }}%</span>
          </div>
        </div>
        <div class="vr-impact" :class="getVRImpactClass(category.vrImpact)">
          {{ category.vrImpact }}
        </div>
      </div>
    </div>

    <!-- Detailed Breakdown -->
    <Transition name="slide-down">
      <div v-if="showDetails" class="detailed-breakdown">
        <!-- Phonics to VR Skill Mapping -->
        <div class="skill-mapping">
          <h4 class="section-title">🔗 音素スキル → VRスキル連携マップ</h4>
          <div class="mapping-grid">
            <div 
              v-for="mapping in skillMappings" 
              :key="mapping.id"
              class="mapping-card"
              :class="{ 'mapping-ready': mapping.isReady }"
            >
              <div class="mapping-phonics">
                <div class="phonics-icon">{{ mapping.phonicsIcon }}</div>
                <div class="phonics-name">{{ mapping.phonicsSkill }}</div>
                <div class="phonics-progress">{{ mapping.phonicsProgress }}%</div>
              </div>
              
              <div class="mapping-arrow">
                <svg viewBox="0 0 24 24" class="arrow-icon">
                  <path d="M14 5l7 7-7 7M3 12h18"/>
                </svg>
              </div>
              
              <div class="mapping-vr">
                <div class="vr-icon">🥽</div>
                <div class="vr-skill">{{ mapping.vrSkill }}</div>
                <div class="vr-scenarios">
                  <div 
                    v-for="scenario in mapping.vrScenarios" 
                    :key="scenario"
                    class="scenario-tag"
                    :class="{ 'scenario-unlocked': mapping.isReady }"
                  >
                    {{ scenario }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- VR Scenario Readiness -->
        <div class="scenario-readiness">
          <h4 class="section-title">🌐 VRシナリオ準備状況</h4>
          <div class="scenario-grid">
            <div 
              v-for="scenario in vrScenarios" 
              :key="scenario.id"
              class="scenario-card"
              :class="getScenarioStatusClass(scenario)"
            >
              <div class="scenario-header">
                <div class="scenario-icon">{{ scenario.icon }}</div>
                <div class="scenario-info">
                  <div class="scenario-name">{{ scenario.name }}</div>
                  <div class="scenario-type">{{ scenario.type }}</div>
                </div>
                <div class="scenario-status">
                  <div class="status-indicator" :class="scenario.status"></div>
                </div>
              </div>
              
              <div class="scenario-requirements">
                <div class="requirements-title">必要な音素スキル:</div>
                <div class="requirements-list">
                  <div 
                    v-for="req in scenario.requirements" 
                    :key="req.skill"
                    class="requirement-item"
                    :class="{ 'req-met': req.current >= req.required }"
                  >
                    <span class="req-skill">{{ req.skill }}</span>
                    <div class="req-progress">
                      <div class="req-bar">
                        <div 
                          class="req-fill" 
                          :style="{ width: `${Math.min(100, (req.current / req.required) * 100)}%` }"
                        ></div>
                      </div>
                      <span class="req-text">{{ req.current }}/{{ req.required }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="scenario-description">
                {{ scenario.description }}
              </div>
              
              <div class="scenario-action">
                <button 
                  class="scenario-button"
                  :class="scenario.status"
                  :disabled="scenario.status === 'locked'"
                  @click="handleScenarioAction(scenario)"
                >
                  {{ getScenarioButtonText(scenario) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Recommendations -->
        <div class="learning-recommendations">
          <h4 class="section-title">💡 学習推奨プラン</h4>
          <div class="recommendations-list">
            <div 
              v-for="rec in recommendations" 
              :key="rec.id"
              class="recommendation-item"
              :class="`priority-${rec.priority}`"
            >
              <div class="rec-priority">
                <div class="priority-indicator">{{ getPriorityIcon(rec.priority) }}</div>
              </div>
              <div class="rec-content">
                <div class="rec-title">{{ rec.title }}</div>
                <div class="rec-description">{{ rec.description }}</div>
                <div class="rec-games">
                  推奨ゲーム: 
                  <span 
                    v-for="game in rec.games" 
                    :key="game"
                    class="rec-game-tag"
                  >
                    {{ game }}
                  </span>
                </div>
              </div>
              <div class="rec-impact">
                <div class="impact-label">VR準備度への影響</div>
                <div class="impact-value">+{{ rec.vrImpact }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall VR Readiness Progress -->
        <div class="overall-progress">
          <h4 class="section-title">🚀 総合VR準備度</h4>
          <div class="progress-dashboard">
            <div class="progress-circle">
              <svg class="circle-chart" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  class="circle-background"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  class="circle-progress"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="progressOffset"
                />
              </svg>
              <div class="circle-content">
                <div class="circle-percentage">{{ overallReadiness }}%</div>
                <div class="circle-label">準備度</div>
              </div>
            </div>
            
            <div class="progress-breakdown">
              <div class="breakdown-item" v-for="item in readinessBreakdown" :key="item.category">
                <div class="breakdown-category">{{ item.category }}</div>
                <div class="breakdown-bar">
                  <div 
                    class="breakdown-fill" 
                    :style="{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color 
                    }"
                  ></div>
                </div>
                <div class="breakdown-value">{{ item.value }}%</div>
              </div>
            </div>
          </div>
          
          <div class="readiness-actions">
            <button 
              class="readiness-button detailed-report"
              @click="$emit('view-detailed-report')"
            >
              <span class="button-icon">📊</span>
              詳細レポートを見る
            </button>
            
            <button 
              v-if="overallReadiness >= 50"
              class="readiness-button vr-preview"
              @click="$emit('start-vr-preview')"
            >
              <span class="button-icon">🥽</span>
              VRプレビューを開始
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useVRReadiness } from '@/services/vrReadinessAssessment'
import { useGameStore } from '@/stores/gameStore'

// Emits
const emit = defineEmits(['view-detailed-report', 'start-vr-preview', 'start-scenario'])

// Composables
const vrReadiness = useVRReadiness()
const gameStore = useGameStore()

// State
const showDetails = ref(false)

// Mock data (would be connected to actual VR readiness system)
const phonicsCategories = ref([
  {
    id: 'phoneme_recognition',
    name: '音素認識',
    icon: '🎵',
    progress: 78,
    vrImpact: 'High'
  },
  {
    id: 'blending_skills',
    name: 'ブレンディング',
    icon: '🔗',
    progress: 65,
    vrImpact: 'Medium'
  },
  {
    id: 'rhythm_prosody',
    name: 'リズム・韻律',
    icon: '🎼',
    progress: 45,
    vrImpact: 'High'
  },
  {
    id: 'pronunciation',
    name: '発音精度',
    icon: '🗣️',
    progress: 82,
    vrImpact: 'Critical'
  }
])

const skillMappings = ref([
  {
    id: 'phonics_to_ordering',
    phonicsSkill: '基本音素認識',
    phonicsIcon: '🎵',
    phonicsProgress: 78,
    vrSkill: 'レストラン注文',
    vrScenarios: ['基本注文', '特別リクエスト'],
    isReady: true
  },
  {
    id: 'blending_to_conversation',
    phonicsSkill: 'ブレンディング',
    phonicsIcon: '🔗',
    phonicsProgress: 65,
    vrSkill: '日常会話',
    vrScenarios: ['カジュアル会話', 'ビジネス会話'],
    isReady: false
  },
  {
    id: 'rhythm_to_presentation',
    phonicsSkill: 'リズム・韻律',
    phonicsIcon: '🎼',
    phonicsProgress: 45,
    vrSkill: 'プレゼンテーション',
    vrScenarios: ['学会発表', '営業プレゼン'],
    isReady: false
  }
])

const vrScenarios = ref([
  {
    id: 'restaurant_ordering',
    name: 'レストラン注文体験',
    type: '実用会話',
    icon: '🍽️',
    status: 'ready',
    description: 'VR空間でウェイターと自然な英語で注文練習',
    requirements: [
      { skill: '基本音素', current: 78, required: 70 },
      { skill: '食事語彙', current: 85, required: 60 },
      { skill: '丁寧表現', current: 65, required: 50 }
    ]
  },
  {
    id: 'airport_checkin',
    name: '空港チェックイン',
    type: '旅行英語',
    icon: '✈️',
    status: 'partial',
    description: '空港カウンターでのチェックイン手続きをVRで体験',
    requirements: [
      { skill: '旅行語彙', current: 45, required: 70 },
      { skill: '質疑応答', current: 55, required: 60 },
      { skill: '発音明瞭度', current: 82, required: 75 }
    ]
  },
  {
    id: 'business_meeting',
    name: 'ビジネス会議',
    type: 'ビジネス英語',
    icon: '💼',
    status: 'locked',
    description: '国際会議での議論とプレゼンテーションをVRで実践',
    requirements: [
      { skill: '高度語彙', current: 25, required: 80 },
      { skill: '論理構成', current: 30, required: 75 },
      { skill: '流暢性', current: 40, required: 85 }
    ]
  }
])

const recommendations = computed(() => {
  const recs = []
  
  // Find areas that need improvement for VR readiness
  phonicsCategories.value.forEach(category => {
    if (category.progress < 70 && category.vrImpact === 'High') {
      recs.push({
        id: `improve_${category.id}`,
        title: `${category.name}スキルの強化`,
        description: `${category.name}を向上させることで、VRシナリオでの自然な会話が可能になります`,
        priority: 'high',
        games: getRecommendedGames(category.id),
        vrImpact: 15
      })
    }
  })
  
  return recs
})

const overallReadiness = computed(() => {
  return vrReadiness.currentScore.value || 68
})

const readinessBreakdown = computed(() => [
  { category: '基本操作', value: 75, color: '#06b6d4' },
  { category: '会話能力', value: 68, color: '#10b981' },
  { category: '文化理解', value: 45, color: '#f59e0b' },
  { category: '高度会話', value: 35, color: '#8b5cf6' }
])

const circumference = computed(() => 2 * Math.PI * 45)
const progressOffset = computed(() => {
  const progress = overallReadiness.value / 100
  return circumference.value - (progress * circumference.value)
})

// Methods
const getProgressColor = (progress) => {
  if (progress >= 80) return '#10b981'
  if (progress >= 60) return '#f59e0b'
  if (progress >= 40) return '#ef4444'
  return '#6b7280'
}

const getVRImpactClass = (impact) => {
  return `vr-impact-${impact.toLowerCase()}`
}

const getScenarioStatusClass = (scenario) => {
  return `scenario-${scenario.status}`
}

const getScenarioButtonText = (scenario) => {
  switch (scenario.status) {
    case 'ready': return 'VR体験開始'
    case 'partial': return '準備を続ける'
    case 'locked': return 'ロック中'
    default: return '確認'
  }
}

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'high': return '🔥'
    case 'medium': return '⭐'
    case 'low': return '💡'
    default: return '📌'
  }
}

const getRecommendedGames = (categoryId) => {
  const gameMapping = {
    'phoneme_recognition': ['音素研究所', '音の門番タワー'],
    'blending_skills': ['ブレンディング・ベーシック', 'CVC工場'],
    'rhythm_prosody': ['リズム広場', 'プロソディ・マスター'],
    'pronunciation': ['発音トレーナー', '音響アリーナ']
  }
  return gameMapping[categoryId] || ['基本ゲーム']
}

const handleScenarioAction = (scenario) => {
  if (scenario.status === 'ready') {
    emit('start-scenario', scenario)
  } else if (scenario.status === 'partial') {
    // Show improvement suggestions
    logger.log('Show improvement path for', scenario.name)
  }
}

// Lifecycle
onMounted(async () => {
  // Load current VR readiness data
  await vrReadiness.loadReport()
})
</script>

<style scoped lang="scss">
.vr-readiness-tracker {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.tracker-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  
  .header-icon {
    font-size: 2rem;
    padding: 12px;
    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
    border-radius: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-content {
    flex: 1;
    
    .header-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .header-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
  }
  
  .toggle-details {
    padding: 8px;
    border: none;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .toggle-icon {
      width: 20px;
      height: 20px;
      stroke: #8b5cf6;
      fill: none;
      stroke-width: 2;
      transition: transform 0.2s ease;
    }
    
    &.active .toggle-icon {
      transform: rotate(180deg);
    }
    
    &:hover {
      background: rgba(139, 92, 246, 0.2);
    }
  }
}

.quick-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    border: 1px solid rgba(226, 232, 240, 0.5);
    
    .status-icon {
      font-size: 1.5rem;
      padding: 8px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 8px;
    }
    
    .status-content {
      flex: 1;
      
      .status-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 4px;
      }
      
      .status-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .progress-bar {
          flex: 1;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
            border-radius: 2px;
          }
        }
        
        .progress-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          min-width: 32px;
        }
      }
    }
    
    .vr-impact {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      
      &.vr-impact-critical {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }
      
      &.vr-impact-high {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }
      
      &.vr-impact-medium {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }
      
      &.vr-impact-low {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      }
    }
  }
}

.detailed-breakdown {
  .section-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.skill-mapping {
  margin-bottom: 32px;
  
  .mapping-grid {
    display: grid;
    gap: 16px;
    
    .mapping-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &.mapping-ready {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.05);
      }
      
      .mapping-phonics,
      .mapping-vr {
        flex: 1;
        text-align: center;
        
        .phonics-icon,
        .vr-icon {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }
        
        .phonics-name,
        .vr-skill {
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }
        
        .phonics-progress {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .vr-scenarios {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
          
          .scenario-tag {
            padding: 2px 6px;
            background: #e5e7eb;
            color: #6b7280;
            border-radius: 4px;
            font-size: 0.75rem;
            
            &.scenario-unlocked {
              background: #10b981;
              color: white;
            }
          }
        }
      }
      
      .mapping-arrow {
        .arrow-icon {
          width: 24px;
          height: 24px;
          stroke: #6b7280;
          fill: none;
          stroke-width: 2;
        }
      }
    }
  }
}

.scenario-readiness {
  margin-bottom: 32px;
  
  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    
    .scenario-card {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 20px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &.scenario-ready {
        border-color: #10b981;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.1);
      }
      
      &.scenario-partial {
        border-color: #f59e0b;
        box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
      }
      
      &.scenario-locked {
        opacity: 0.6;
        border-color: #e5e7eb;
      }
      
      .scenario-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        
        .scenario-icon {
          font-size: 2rem;
          padding: 12px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
        }
        
        .scenario-info {
          flex: 1;
          
          .scenario-name {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
          }
          
          .scenario-type {
            font-size: 0.875rem;
            color: #6b7280;
          }
        }
        
        .scenario-status {
          .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            
            &.ready {
              background: #10b981;
            }
            
            &.partial {
              background: #f59e0b;
            }
            
            &.locked {
              background: #6b7280;
            }
          }
        }
      }
      
      .scenario-requirements {
        margin-bottom: 16px;
        
        .requirements-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .requirement-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          
          .req-skill {
            font-size: 0.75rem;
            color: #6b7280;
            min-width: 60px;
          }
          
          .req-progress {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            
            .req-bar {
              flex: 1;
              height: 3px;
              background: #e5e7eb;
              border-radius: 2px;
              overflow: hidden;
              
              .req-fill {
                height: 100%;
                background: #10b981;
                transition: width 0.3s ease;
              }
            }
            
            .req-text {
              font-size: 0.75rem;
              color: #6b7280;
              min-width: 40px;
            }
          }
          
          &.req-met {
            .req-skill {
              color: #10b981;
              font-weight: 600;
            }
          }
        }
      }
      
      .scenario-description {
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.4;
        margin-bottom: 16px;
      }
      
      .scenario-action {
        .scenario-button {
          width: 100%;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &.ready {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
          }
          
          &.partial {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
            }
          }
          
          &.locked {
            background: #e5e7eb;
            color: #9ca3af;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

.learning-recommendations {
  margin-bottom: 32px;
  
  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .recommendation-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border-left: 4px solid transparent;
      
      &.priority-high {
        border-left-color: #ef4444;
        background: rgba(239, 68, 68, 0.05);
      }
      
      &.priority-medium {
        border-left-color: #f59e0b;
        background: rgba(245, 158, 11, 0.05);
      }
      
      &.priority-low {
        border-left-color: #06b6d4;
        background: rgba(6, 182, 212, 0.05);
      }
      
      .rec-priority {
        .priority-indicator {
          font-size: 1.5rem;
        }
      }
      
      .rec-content {
        flex: 1;
        
        .rec-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .rec-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .rec-games {
          font-size: 0.75rem;
          color: #6b7280;
          
          .rec-game-tag {
            display: inline-block;
            padding: 2px 6px;
            background: #e0e7ff;
            color: #4338ca;
            border-radius: 4px;
            margin-left: 4px;
            margin-right: 4px;
          }
        }
      }
      
      .rec-impact {
        text-align: center;
        
        .impact-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .impact-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #059669;
        }
      }
    }
  }
}

.overall-progress {
  .progress-dashboard {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 32px;
    align-items: center;
    margin-bottom: 24px;
    
    .progress-circle {
      position: relative;
      width: 160px;
      height: 160px;
      
      .circle-chart {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        
        .circle-background {
          stroke: #e5e7eb;
          stroke-width: 8;
          fill: none;
        }
        
        .circle-progress {
          stroke: #8b5cf6;
          stroke-width: 8;
          fill: none;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.8s ease;
        }
      }
      
      .circle-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        
        .circle-percentage {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .circle-label {
          font-size: 0.875rem;
          color: #6b7280;
        }
      }
    }
    
    .progress-breakdown {
      .breakdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        .breakdown-category {
          font-size: 0.875rem;
          color: #374151;
          min-width: 80px;
        }
        
        .breakdown-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          
          .breakdown-fill {
            height: 100%;
            transition: width 0.8s ease;
            border-radius: 4px;
          }
        }
        
        .breakdown-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          min-width: 40px;
        }
      }
    }
  }
  
  .readiness-actions {
    display: flex;
    gap: 12px;
    
    .readiness-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      
      .button-icon {
        font-size: 1.125rem;
      }
      
      &.detailed-report {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      }
      
      &.vr-preview {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
      }
    }
  }
}

// Transitions
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

// Responsive Design
@media (max-width: 768px) {
  .vr-readiness-tracker {
    padding: 16px;
  }
  
  .quick-status {
    grid-template-columns: 1fr;
  }
  
  .mapping-grid {
    grid-template-columns: 1fr;
  }
  
  .scenario-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-dashboard {
    grid-template-columns: 1fr;
    gap: 20px;
    text-align: center;
  }
  
  .readiness-actions {
    flex-direction: column;
  }
}
</style>