<template>
  <div class="vr-scenario-suggestion">
    <Transition name="suggestion-appear" appear>
      <div class="suggestion-container" v-if="showSuggestion">
        <!-- Header -->
        <div class="suggestion-header">
          <div class="header-icon">🌐</div>
          <div class="header-content">
            <h3 class="header-title">VRシナリオ提案</h3>
            <p class="header-subtitle">あなたの音素スキルに基づいた最適なVR体験</p>
          </div>
          <button @click="closeSuggestion" class="close-button">
            <svg viewBox="0 0 24 24" class="close-icon">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Ready Scenarios -->
        <div v-if="readyScenarios.length > 0" class="scenarios-section ready-section">
          <div class="section-header">
            <div class="section-icon">✅</div>
            <h4 class="section-title">体験可能なVRシナリオ</h4>
            <div class="section-badge ready-badge">{{ readyScenarios.length }}個</div>
          </div>
          
          <div class="scenarios-grid">
            <div 
              v-for="scenario in readyScenarios" 
              :key="scenario.id"
              class="scenario-card ready-card"
              @click="selectScenario(scenario)"
            >
              <div class="scenario-visual">
                <div class="scenario-icon">{{ scenario.icon }}</div>
                <div class="scenario-preview">
                  <img 
                    v-if="scenario.previewImage" 
                    :src="scenario.previewImage" 
                    :alt="scenario.name"
                    class="preview-image"
                  />
                  <div v-else class="preview-placeholder">{{ scenario.icon }}</div>
                </div>
                <div class="readiness-indicator ready">
                  <div class="indicator-value">{{ scenario.readiness }}%</div>
                  <div class="indicator-label">準備完了</div>
                </div>
              </div>
              
              <div class="scenario-info">
                <h5 class="scenario-name">{{ scenario.name }}</h5>
                <p class="scenario-description">{{ scenario.description }}</p>
                
                <div class="scenario-skills">
                  <div class="skills-label">学習できるスキル:</div>
                  <div class="skills-list">
                    <span 
                      v-for="skill in scenario.skills" 
                      :key="skill"
                      class="skill-tag"
                    >
                      {{ getSkillName(skill) }}
                    </span>
                  </div>
                </div>
                
                <div class="scenario-meta">
                  <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span class="meta-text">{{ scenario.estimatedDuration }}分</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span class="meta-text">{{ scenario.participants }}人まで</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">🎯</span>
                    <span class="meta-text">{{ scenario.difficulty }}</span>
                  </div>
                </div>
                
                <button class="scenario-action ready-action">
                  <span class="action-icon">🚀</span>
                  <span>VR体験を開始</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Scenarios -->
        <div v-if="upcomingScenarios.length > 0" class="scenarios-section upcoming-section">
          <div class="section-header">
            <div class="section-icon">⏳</div>
            <h4 class="section-title">もうすぐ体験可能</h4>
            <div class="section-badge upcoming-badge">{{ upcomingScenarios.length }}個</div>
          </div>
          
          <div class="scenarios-grid">
            <div 
              v-for="scenario in upcomingScenarios" 
              :key="scenario.id"
              class="scenario-card upcoming-card"
            >
              <div class="scenario-visual">
                <div class="scenario-icon dimmed">{{ scenario.icon }}</div>
                <div class="scenario-preview dimmed">
                  <img 
                    v-if="scenario.previewImage" 
                    :src="scenario.previewImage" 
                    :alt="scenario.name"
                    class="preview-image"
                  />
                  <div v-else class="preview-placeholder">{{ scenario.icon }}</div>
                </div>
                <div class="readiness-indicator upcoming">
                  <div class="indicator-value">{{ scenario.readiness }}%</div>
                  <div class="indicator-label">準備中</div>
                </div>
              </div>
              
              <div class="scenario-info">
                <h5 class="scenario-name">{{ scenario.name }}</h5>
                <p class="scenario-description">{{ scenario.description }}</p>
                
                <div class="requirements-section">
                  <div class="requirements-label">必要なスキル向上:</div>
                  <div class="requirements-list">
                    <div 
                      v-for="req in scenario.skillGaps" 
                      :key="req"
                      class="requirement-item"
                    >
                      <span class="req-skill">{{ getSkillName(req) }}</span>
                      <div class="req-progress">
                        <div class="req-bar">
                          <div 
                            class="req-fill" 
                            :style="{ width: `${getSkillProgress(req)}%` }"
                          ></div>
                        </div>
                        <span class="req-text">{{ getSkillProgress(req) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="estimated-ready" v-if="scenario.estimatedReadyDate">
                  <span class="ready-icon">📅</span>
                  <span class="ready-text">
                    予想準備完了: {{ formatReadyDate(scenario.estimatedReadyDate) }}
                  </span>
                </div>
                
                <button class="scenario-action upcoming-action" @click="showImprovementPlan(scenario)">
                  <span class="action-icon">📈</span>
                  <span>学習プランを見る</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Future Scenarios -->
        <div v-if="futureScenarios.length > 0" class="scenarios-section future-section">
          <div class="section-header">
            <div class="section-icon">🔮</div>
            <h4 class="section-title">将来の挑戦</h4>
            <div class="section-badge future-badge">{{ futureScenarios.length }}個</div>
          </div>
          
          <div class="scenarios-compact">
            <div 
              v-for="scenario in futureScenarios" 
              :key="scenario.id"
              class="scenario-compact future-compact"
            >
              <div class="compact-icon">{{ scenario.icon }}</div>
              <div class="compact-info">
                <div class="compact-name">{{ scenario.name }}</div>
                <div class="compact-readiness">準備度: {{ scenario.readiness }}%</div>
              </div>
              <div class="compact-action">
                <button class="compact-button" @click="showScenarioDetails(scenario)">
                  詳細
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Recommendations -->
        <div class="recommendations-section" v-if="learningRecommendations.length > 0">
          <div class="section-header">
            <div class="section-icon">💡</div>
            <h4 class="section-title">おすすめ学習パス</h4>
          </div>
          
          <div class="recommendations-list">
            <div 
              v-for="rec in learningRecommendations" 
              :key="rec.id"
              class="recommendation-item"
              :class="`priority-${rec.priority}`"
            >
              <div class="rec-icon">{{ rec.icon }}</div>
              <div class="rec-content">
                <div class="rec-title">{{ rec.title }}</div>
                <div class="rec-description">{{ rec.description }}</div>
                <div class="rec-games">
                  <span class="games-label">推奨ゲーム:</span>
                  <div class="games-list">
                    <button 
                      v-for="game in rec.games" 
                      :key="game"
                      @click="playRecommendedGame(game)"
                      class="game-button"
                    >
                      {{ game }}
                    </button>
                  </div>
                </div>
              </div>
              <div class="rec-impact">
                <div class="impact-label">VR準備度</div>
                <div class="impact-value">+{{ rec.vrImpact }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="suggestion-actions">
          <button 
            v-if="readyScenarios.length > 0"
            @click="startBestScenario"
            class="action-button primary-action"
          >
            <span class="action-icon">🎯</span>
            <span>最適なVR体験を開始</span>
          </button>
          
          <button 
            @click="viewVRReadinessReport"
            class="action-button secondary-action"
          >
            <span class="action-icon">📊</span>
            <span>VR準備度レポート</span>
          </button>
          
          <button 
            @click="customizeLearningPath"
            class="action-button secondary-action"
          >
            <span class="action-icon">⚙️</span>
            <span>学習パスをカスタマイズ</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Improvement Plan Modal -->
    <div v-if="showImprovementModal" class="modal-overlay" @click="closeImprovementModal">
      <div class="improvement-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedScenario?.name }} - 学習プラン</h3>
          <button @click="closeImprovementModal" class="modal-close">×</button>
        </div>
        
        <div class="modal-content">
          <div class="improvement-plan">
            <div class="plan-overview">
              <div class="plan-stat">
                <div class="stat-value">{{ selectedScenario?.readiness }}%</div>
                <div class="stat-label">現在の準備度</div>
              </div>
              <div class="plan-arrow">→</div>
              <div class="plan-stat">
                <div class="stat-value">90%</div>
                <div class="stat-label">目標準備度</div>
              </div>
            </div>
            
            <div class="improvement-steps">
              <div 
                v-for="(step, index) in improvementSteps" 
                :key="step.id"
                class="improvement-step"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-description">{{ step.description }}</div>
                  <div class="step-games">
                    <button 
                      v-for="game in step.games" 
                      :key="game"
                      @click="playRecommendedGame(game)"
                      class="step-game-button"
                    >
                      {{ game }}
                    </button>
                  </div>
                </div>
                <div class="step-impact">+{{ step.impact }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, watch } from 'vue'
import { useVRReadiness } from '@/services/vrReadinessAssessment'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerProfileStore } from '@/stores/playerProfile'

// Props
const props = defineProps({
  gameResult: {
    type: Object,
    default: null
  },
  playerSkills: {
    type: Array,
    default: () => []
  },
  showAutomatically: {
    type: Boolean,
    default: true
  },
  minimumReadinessForSuggestion: {
    type: Number,
    default: 30
  }
})

// Emits
const emit = defineEmits([
  'start-vr-scenario',
  'play-recommended-game',
  'view-vr-report',
  'close-suggestion'
])

// Composables
const vrReadiness = useVRReadiness()
const gameStore = useGameStore()
const playerStore = usePlayerProfileStore()

// State
const showSuggestion = ref(true)
const showImprovementModal = ref(false)
const selectedScenario = ref(null)
const vrScenarios = ref([])

// Mock VR scenarios data (実際のAPIから取得)
const allVRScenarios = ref([
  {
    id: 'restaurant_ordering',
    name: 'レストラン注文体験',
    description: 'VR空間でウェイターと自然な英語で注文を練習',
    icon: '🍽️',
    previewImage: '/images/vr/restaurant_preview.jpg',
    estimatedDuration: 15,
    participants: 4,
    difficulty: '初級',
    skills: ['basic_interaction', 'food_vocabulary', 'polite_expressions'],
    requiredPhonemes: ['r', 'l', 'th', 'w'],
    minReadiness: 70
  },
  {
    id: 'airport_checkin',
    name: '空港チェックイン',
    description: '空港カウンターでのチェックイン手続きをVRで体験',
    icon: '✈️',
    previewImage: '/images/vr/airport_preview.jpg',
    estimatedDuration: 20,
    participants: 2,
    difficulty: '中級',
    skills: ['travel_vocabulary', 'question_response', 'formal_communication'],
    requiredPhonemes: ['p', 'b', 'f', 'v'],
    minReadiness: 75
  },
  {
    id: 'business_meeting',
    name: 'ビジネス会議',
    description: '国際会議での議論とプレゼンテーションをVRで実践',
    icon: '💼',
    previewImage: '/images/vr/business_preview.jpg',
    estimatedDuration: 30,
    participants: 8,
    difficulty: '上級',
    skills: ['advanced_vocabulary', 'presentation_skills', 'negotiation'],
    requiredPhonemes: ['th', 'z', 's', 'sh'],
    minReadiness: 85
  },
  {
    id: 'casual_conversation',
    name: '日常会話',
    description: '友人との自然な会話をVR空間で練習',
    icon: '💬',
    previewImage: '/images/vr/casual_preview.jpg',
    estimatedDuration: 10,
    participants: 6,
    difficulty: '初級',
    skills: ['casual_vocabulary', 'conversation_flow', 'cultural_adaptation'],
    requiredPhonemes: ['w', 'y', 'j', 'ch'],
    minReadiness: 60
  },
  {
    id: 'shopping_experience',
    name: 'ショッピング体験',
    description: 'VRショッピングモールで買い物の英会話を練習',
    icon: '🛍️',
    previewImage: '/images/vr/shopping_preview.jpg',
    estimatedDuration: 25,
    participants: 4,
    difficulty: '中級',
    skills: ['shopping_vocabulary', 'price_negotiation', 'customer_service'],
    requiredPhonemes: ['s', 'sh', 'ch', 'st'],
    minReadiness: 80
  }
])

// Computed
const readyScenarios = computed(() => {
  return vrScenarios.value.filter(scenario => scenario.readiness >= scenario.minReadiness)
})

const upcomingScenarios = computed(() => {
  return vrScenarios.value.filter(scenario => 
    scenario.readiness >= 50 && scenario.readiness < scenario.minReadiness
  )
})

const futureScenarios = computed(() => {
  return vrScenarios.value.filter(scenario => scenario.readiness < 50)
})

const learningRecommendations = computed(() => {
  const recommendations = []
  
  // 準備度が低いスキルの改善提案
  const weakSkills = props.playerSkills
    .filter(skill => skill.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  for (const skill of weakSkills) {
    recommendations.push({
      id: `improve_${skill.phoneme}`,
      icon: getSkillIcon(skill.phoneme),
      title: `「${skill.phoneme}」音素の強化`,
      description: `${skill.phoneme}音素の精度を向上させて、VRシナリオでの自然な発音を実現`,
      priority: skill.accuracy < 50 ? 'high' : 'medium',
      games: getRecommendedGamesForSkill(skill.phoneme),
      vrImpact: Math.min(20, (70 - skill.accuracy) * 0.5)
    })
  }

  // VR準備度向上の一般的な提案
  if (getOverallReadiness() < 70) {
    recommendations.push({
      id: 'overall_improvement',
      icon: '🚀',
      title: '総合的なVR準備度向上',
      description: '幅広い音素スキルを向上させて、多様なVRシナリオに対応',
      priority: 'medium',
      games: ['フォニーム・セイバー', 'サウンド・バトル・アリーナ', 'リズム・フォニックス・ダンス'],
      vrImpact: 15
    })
  }

  return recommendations.slice(0, 4)
})

const improvementSteps = computed(() => {
  if (!selectedScenario.value) return []

  const steps = []
  const scenario = selectedScenario.value
  const currentReadiness = scenario.readiness
  const targetReadiness = 90
  const gap = targetReadiness - currentReadiness

  // スキルギャップごとの改善ステップ
  scenario.skillGaps.forEach((skill, index) => {
    const stepImpact = Math.ceil(gap / scenario.skillGaps.length)
    steps.push({
      id: `step_${index}`,
      title: `${getSkillName(skill)}スキルの強化`,
      description: `${skill}音素の精度を向上させて、${scenario.name}での自然な会話を実現`,
      games: getRecommendedGamesForSkill(skill),
      impact: stepImpact
    })
  })

  return steps
})

// Methods
const calculateScenarioReadiness = (scenario) => {
  // プレイヤーの音素スキルに基づいて準備度を計算
  const requiredPhonemes = scenario.requiredPhonemes
  const playerPhonemeSkills = props.playerSkills.filter(skill => 
    requiredPhonemes.includes(skill.phoneme)
  )

  if (playerPhonemeSkills.length === 0) {
    return Math.min(30, scenario.minReadiness - 10)
  }

  const averageAccuracy = playerPhonemeSkills.reduce((sum, skill) => 
    sum + skill.accuracy, 0) / playerPhonemeSkills.length

  // 基本準備度 + スキル補正
  let readiness = Math.min(averageAccuracy * 0.8 + 20, 100)
  
  // ゲーム結果による追加補正
  if (props.gameResult) {
    const gameBonus = Math.min(props.gameResult.accuracy * 0.1, 10)
    readiness = Math.min(readiness + gameBonus, 100)
  }

  return Math.floor(readiness)
}

const updateScenarioReadiness = () => {
  vrScenarios.value = allVRScenarios.value.map(scenario => {
    const readiness = calculateScenarioReadiness(scenario)
    const skillGaps = scenario.requiredPhonemes.filter(phoneme => {
      const skill = props.playerSkills.find(s => s.phoneme === phoneme)
      return !skill || skill.accuracy < 70
    })

    return {
      ...scenario,
      readiness,
      skillGaps,
      estimatedReadyDate: estimateReadyDate(readiness, scenario.minReadiness)
    }
  }).sort((a, b) => b.readiness - a.readiness)
}

const estimateReadyDate = (currentReadiness, targetReadiness) => {
  if (currentReadiness >= targetReadiness) return null

  const daysNeeded = Math.ceil((targetReadiness - currentReadiness) / 2) // 1日2%向上を想定
  const estimatedDate = new Date()
  estimatedDate.setDate(estimatedDate.getDate() + daysNeeded)
  
  return estimatedDate
}

const getOverallReadiness = () => {
  if (props.playerSkills.length === 0) return 0
  return props.playerSkills.reduce((sum, skill) => sum + skill.accuracy, 0) / props.playerSkills.length
}

const getSkillName = (skillId) => {
  const names = {
    'r': 'R音',
    'l': 'L音',
    'th': 'TH音',
    'w': 'W音',
    'p': 'P音',
    'b': 'B音',
    'f': 'F音',
    'v': 'V音',
    'z': 'Z音',
    's': 'S音',
    'sh': 'SH音',
    'basic_interaction': '基本操作',
    'food_vocabulary': '食事語彙',
    'polite_expressions': '丁寧表現'
  }
  return names[skillId] || skillId
}

const getSkillIcon = (skillId) => {
  const icons = {
    'r': '🔄',
    'l': '👅',
    'th': '🦷',
    'w': '💨',
    'p': '💥',
    'b': '🎈',
    'f': '🌬️',
    'v': '🎻'
  }
  return icons[skillId] || '🎯'
}

const getSkillProgress = (skillId) => {
  const skill = props.playerSkills.find(s => s.phoneme === skillId)
  return skill ? skill.accuracy : 0
}

const getRecommendedGamesForSkill = (skillId) => {
  const gameMapping = {
    'r': ['フォニーム・セイバー', 'リズム・フォニックス・ダンス'],
    'l': ['フォニーム・セイバー', 'サウンド・バトル・アリーナ'],
    'th': ['リズム・フォニックス・ダンス', 'サウンド・バトル・アリーナ'],
    'w': ['サウンド・バトル・アリーナ', 'フォニーム・セイバー']
  }
  return gameMapping[skillId] || ['フォニーム・セイバー']
}

const formatReadyDate = (date) => {
  if (!date) return '不明'
  
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) return '準備完了'
  if (diffDays === 1) return '明日'
  if (diffDays <= 7) return `${diffDays}日後`
  if (diffDays <= 30) return `約${Math.ceil(diffDays / 7)}週間後`
  
  return `約${Math.ceil(diffDays / 30)}ヶ月後`
}

const selectScenario = (scenario) => {
  emit('start-vr-scenario', scenario)
}

const startBestScenario = () => {
  if (readyScenarios.value.length > 0) {
    const bestScenario = readyScenarios.value[0]
    emit('start-vr-scenario', bestScenario)
  }
}

const showImprovementPlan = (scenario) => {
  selectedScenario.value = scenario
  showImprovementModal.value = true
}

const closeImprovementModal = () => {
  showImprovementModal.value = false
  selectedScenario.value = null
}

const showScenarioDetails = (scenario) => {
  // 詳細モーダルの表示（将来実装）
  logger.log('Show scenario details:', scenario)
}

const playRecommendedGame = (gameName) => {
  emit('play-recommended-game', gameName)
}

const viewVRReadinessReport = () => {
  emit('view-vr-report')
}

const customizeLearningPath = () => {
  // 学習パスカスタマイズ（将来実装）
  logger.log('Customize learning path')
}

const closeSuggestion = () => {
  showSuggestion.value = false
  emit('close-suggestion')
}

// Lifecycle
onMounted(() => {
  updateScenarioReadiness()
  
  // 最小準備度チェック
  if (getOverallReadiness() < props.minimumReadinessForSuggestion) {
    if (!props.showAutomatically) {
      showSuggestion.value = false
    }
  }
})

// Watch for changes in player skills
watch(() => props.playerSkills, () => {
  updateScenarioReadiness()
}, { deep: true })
</script>

<style scoped lang="scss">
.vr-scenario-suggestion {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.suggestion-container {
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .header-icon {
    font-size: 2.5rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  .header-content {
    flex: 1;
    
    .header-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 4px;
    }
    
    .header-subtitle {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
    }
  }
  
  .close-button {
    padding: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .close-icon {
      width: 20px;
      height: 20px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #f1f5f9;
    }
  }
}

.scenarios-section {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  .section-icon {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    flex: 1;
  }
  
  .section-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    
    &.ready-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    
    &.upcoming-badge {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    
    &.future-badge {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
    }
  }
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.scenario-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.ready-card {
    border-color: #10b981;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2);
      background: rgba(16, 185, 129, 0.05);
    }
  }
  
  &.upcoming-card {
    border-color: #f59e0b;
    cursor: default;
    
    &:hover {
      background: rgba(245, 158, 11, 0.05);
    }
  }
}

.scenario-visual {
  position: relative;
  margin-bottom: 16px;
  
  .scenario-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 12px;
    
    &.dimmed {
      opacity: 0.6;
    }
  }
  
  .scenario-preview {
    width: 100%;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    
    &.dimmed {
      opacity: 0.6;
    }
    
    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .preview-placeholder {
      font-size: 2rem;
      opacity: 0.5;
    }
  }
  
  .readiness-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
    
    .indicator-value {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 2px;
    }
    
    &.ready {
      background: rgba(16, 185, 129, 0.9);
      color: white;
    }
    
    &.upcoming {
      background: rgba(245, 158, 11, 0.9);
      color: white;
    }
  }
}

.scenario-info {
  .scenario-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 8px;
  }
  
  .scenario-description {
    font-size: 0.875rem;
    color: #94a3b8;
    line-height: 1.4;
    margin-bottom: 16px;
  }
  
  .scenario-skills {
    margin-bottom: 16px;
    
    .skills-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 6px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .skill-tag {
        padding: 2px 6px;
        background: rgba(139, 92, 246, 0.2);
        color: #a855f7;
        border-radius: 6px;
        font-size: 0.625rem;
        font-weight: 500;
      }
    }
  }
  
  .scenario-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    font-size: 0.75rem;
    color: #94a3b8;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .meta-icon {
        font-size: 0.875rem;
      }
    }
  }
  
  .scenario-action {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .action-icon {
      font-size: 1rem;
    }
    
    &.ready-action {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
      }
    }
    
    &.upcoming-action {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(245, 158, 11, 0.3);
      }
    }
  }
}

.requirements-section {
  margin-bottom: 16px;
  
  .requirements-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 8px;
  }
  
  .requirements-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      
      .req-skill {
        min-width: 60px;
        color: #94a3b8;
      }
      
      .req-progress {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        
        .req-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          
          .req-fill {
            height: 100%;
            background: #f59e0b;
            transition: width 0.3s ease;
          }
        }
        
        .req-text {
          color: #6b7280;
          min-width: 30px;
        }
      }
    }
  }
}

.estimated-ready {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 16px;
  
  .ready-icon {
    font-size: 0.875rem;
  }
}

.scenarios-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .scenario-compact {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    
    .compact-icon {
      font-size: 1.5rem;
      opacity: 0.6;
    }
    
    .compact-info {
      flex: 1;
      
      .compact-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #f1f5f9;
        margin-bottom: 2px;
      }
      
      .compact-readiness {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }
    
    .compact-action {
      .compact-button {
        padding: 6px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: transparent;
        color: #94a3b8;
        border-radius: 6px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
        }
      }
    }
  }
}

.recommendations-section {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
  .recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .recommendation-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid;
      
      .rec-icon {
        font-size: 1.5rem;
        margin-top: 2px;
      }
      
      .rec-content {
        flex: 1;
        
        .rec-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        
        .rec-description {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-bottom: 8px;
        }
        
        .rec-games {
          .games-label {
            font-size: 0.625rem;
            color: #6b7280;
            margin-right: 6px;
          }
          
          .games-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            
            .game-button {
              padding: 2px 6px;
              background: rgba(139, 92, 246, 0.2);
              color: #a855f7;
              border: none;
              border-radius: 4px;
              font-size: 0.625rem;
              cursor: pointer;
              transition: all 0.2s ease;
              
              &:hover {
                background: rgba(139, 92, 246, 0.3);
                transform: translateY(-1px);
              }
            }
          }
        }
      }
      
      .rec-impact {
        text-align: center;
        
        .impact-label {
          font-size: 0.625rem;
          color: #6b7280;
          margin-bottom: 2px;
        }
        
        .impact-value {
          font-size: 0.875rem;
          font-weight: 700;
          color: #10b981;
        }
      }
      
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
    }
  }
}

.suggestion-actions {
  padding: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .action-icon {
      font-size: 1rem;
    }
    
    &.primary-action {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
      }
    }
    
    &.secondary-action {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
    }
  }
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.improvement-modal {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0;
  }
  
  .modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    border-radius: 8px;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #f1f5f9;
    }
  }
}

.modal-content {
  padding: 20px;
}

.improvement-plan {
  .plan-overview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 24px;
    
    .plan-stat {
      text-align: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #f1f5f9;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }
    
    .plan-arrow {
      font-size: 1.5rem;
      color: #8b5cf6;
      font-weight: 700;
    }
  }
  
  .improvement-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .improvement-step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      
      .step-number {
        width: 32px;
        height: 32px;
        background: #8b5cf6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.875rem;
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        .step-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        
        .step-description {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-bottom: 8px;
        }
        
        .step-games {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          
          .step-game-button {
            padding: 2px 6px;
            background: rgba(139, 92, 246, 0.2);
            color: #a855f7;
            border: none;
            border-radius: 4px;
            font-size: 0.625rem;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background: rgba(139, 92, 246, 0.3);
            }
          }
        }
      }
      
      .step-impact {
        font-size: 0.875rem;
        font-weight: 700;
        color: #10b981;
        padding: 4px 8px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 6px;
        flex-shrink: 0;
      }
    }
  }
}

// Animations
.suggestion-appear-enter-active {
  animation: suggestion-appear 0.6s ease-out;
}

@keyframes suggestion-appear {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .suggestion-container {
    width: 95%;
    max-height: 95vh;
  }
  
  .suggestion-header {
    padding: 16px;
    
    .header-icon {
      font-size: 2rem;
    }
    
    .header-title {
      font-size: 1.25rem;
    }
  }
  
  .scenarios-section {
    padding: 16px;
  }
  
  .scenarios-grid {
    grid-template-columns: 1fr;
  }
  
  .suggestion-actions {
    padding: 16px;
    flex-direction: column;
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
  
  .improvement-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .plan-overview {
    flex-direction: column;
    gap: 12px;
    
    .plan-arrow {
      transform: rotate(90deg);
    }
  }
}
</style>