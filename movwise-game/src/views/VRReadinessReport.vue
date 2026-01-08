<template>
  <div class="vr-readiness-report">
    <!-- Header -->
    <div class="report-header">
      <div class="header-content">
        <div class="title-section">
          <button class="back-btn" @click="$router.go(-1)">
            <svg viewBox="0 0 24 24" class="icon">
              <path d="M19 12H5m7-7l-7 7 7 7"/>
            </svg>
          </button>
          <div class="title-text">
            <h1>VR学習準備度レポート</h1>
            <p class="subtitle">あなたのVRアカデミーへの準備状況を詳しく分析</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="refresh-btn" @click="refreshReport" :disabled="isLoading">
            <svg viewBox="0 0 24 24" class="icon" :class="{ 'spin': isLoading }">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            {{ isLoading ? '更新中...' : '更新' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && !report" class="loading-container">
      <div class="loading-spinner"></div>
      <p>レポートを生成中...</p>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="report-content">
      <!-- Overall Status -->
      <div class="status-overview">
        <div class="overall-score">
          <div class="score-circle">
            <svg class="progress-ring" width="120" height="120">
              <circle
                class="progress-ring-background"
                cx="60"
                cy="60"
                r="50"
                stroke="#e0e7ff"
                stroke-width="6"
                fill="transparent"/>
              <circle
                class="progress-ring-progress"
                cx="60"
                cy="60"
                r="50"
                :stroke="levelColor"
                stroke-width="6"
                fill="transparent"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                stroke-linecap="round"/>
            </svg>
            <div class="score-content">
              <span class="score-number">{{ report.overallScore }}%</span>
              <span class="score-level">{{ levelDisplayName }}</span>
            </div>
          </div>
          <div class="status-details">
            <h2>{{ levelDisplayName }}レベル</h2>
            <p class="status-description">{{ getLevelDescription() }}</p>
            <div class="level-progress">
              <div class="progress-info">
                <span>現在のレベル進捗</span>
                <span>{{ report.levelProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${report.levelProgress}%`, backgroundColor: levelColor }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <span class="stat-number">{{ report.strengths.length }}</span>
              <span class="stat-label">強みスキル</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <span class="stat-number">{{ report.nextMilestone?.estimatedGames || 0 }}</span>
              <span class="stat-label">次レベルまで</span>
            </div>
          </div>
          <div class="stat-card" :class="{ 'ready': report.vrAcademyRecommendation.isReady }">
            <div class="stat-icon">🥽</div>
            <div class="stat-content">
              <span class="stat-label">VRアカデミー</span>
              <span class="stat-status">{{ report.vrAcademyRecommendation.isReady ? '準備完了' : '準備中' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Skill Analysis -->
      <div class="skill-analysis">
        <h3>スキル詳細分析</h3>
        <div class="skill-categories">
          <div 
            v-for="assessment in report.assessments" 
            :key="assessment.category.id"
            class="skill-category"
          >
            <div class="category-header">
              <div class="category-title">
                <h4>{{ assessment.category.name }}</h4>
                <p class="category-description">{{ assessment.category.description }}</p>
              </div>
              <div class="category-score">
                <span class="score-value">{{ Math.round(assessment.score) }}%</span>
                <div class="score-badge" :class="getScoreBadgeClass(assessment.score)">
                  {{ getScoreRating(assessment.score) }}
                </div>
              </div>
            </div>

            <div class="category-details">
              <!-- Progress Bar -->
              <div class="skill-progress">
                <div class="progress-bar-container">
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ 
                        width: `${assessment.score}%`, 
                        backgroundColor: getSkillColor(assessment.score) 
                      }"
                    ></div>
                  </div>
                  <div class="progress-markers">
                    <div class="marker" :class="{ 'passed': assessment.score >= 25 }">25%</div>
                    <div class="marker" :class="{ 'passed': assessment.score >= 50 }">50%</div>
                    <div class="marker" :class="{ 'passed': assessment.score >= 75 }">75%</div>
                    <div class="marker" :class="{ 'passed': assessment.score >= 90 }">90%</div>
                  </div>
                </div>
              </div>

              <!-- Feedback -->
              <div class="skill-feedback">
                <p class="feedback-text">{{ assessment.feedback }}</p>
              </div>

              <!-- Recommendations -->
              <div v-if="assessment.recommendations.length > 0" class="recommendations">
                <h5>推奨アクション</h5>
                <ul class="recommendation-list">
                  <li v-for="recommendation in assessment.recommendations" :key="recommendation">
                    {{ recommendation }}
                  </li>
                </ul>
              </div>

              <!-- Unlocked Content -->
              <div v-if="assessment.unlockedContent.length > 0" class="unlocked-content">
                <h5>解放されたコンテンツ</h5>
                <div class="content-badges">
                  <span 
                    v-for="content in assessment.unlockedContent" 
                    :key="content"
                    class="content-badge"
                  >
                    {{ getContentDisplayName(content) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VR Academy Recommendation -->
      <div class="vr-academy-section">
        <div class="section-header">
          <h3>VRアカデミー推奨</h3>
          <div class="readiness-indicator" :class="{ 'ready': report.vrAcademyRecommendation.isReady }">
            <div class="indicator-dot"></div>
            <span>{{ report.vrAcademyRecommendation.isReady ? '準備完了' : '準備中' }}</span>
          </div>
        </div>

        <div class="recommendation-content">
          <p class="recommendation-message">{{ report.vrAcademyRecommendation.message }}</p>

          <!-- Recommended Scenarios -->
          <div v-if="report.vrAcademyRecommendation.recommendedScenarios.length > 0" class="scenarios-section">
            <h4>推奨VRシナリオ</h4>
            <div class="scenarios-grid">
              <div 
                v-for="scenario in report.vrAcademyRecommendation.recommendedScenarios" 
                :key="scenario.scenarioId"
                class="scenario-card"
                :class="{ 'high-priority': scenario.priority === 'high' }"
                @click="selectScenario(scenario)"
              >
                <div class="scenario-header">
                  <h5>{{ scenario.title }}</h5>
                  <div class="priority-badge" :class="scenario.priority">
                    {{ getPriorityLabel(scenario.priority) }}
                  </div>
                </div>
                <p class="scenario-reason">{{ scenario.reason }}</p>
                <div class="scenario-meta">
                  <div class="meta-item">
                    <svg viewBox="0 0 24 24" class="icon">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>{{ scenario.estimatedDuration }}分</span>
                  </div>
                  <div class="meta-item">
                    <svg viewBox="0 0 24 24" class="icon">
                      <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4l5 4V7l-5 4z"/>
                      <path d="M22 9l-6 6M16 9l6 6"/>
                    </svg>
                    <span>{{ getDifficultyLabel(scenario.difficulty) }}</span>
                  </div>
                </div>
                <div class="scenario-skills">
                  <span 
                    v-for="skill in scenario.skills" 
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ getSkillDisplayName(skill) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="vr-actions">
            <button 
              v-if="!report.vrAcademyRecommendation.isReady"
              class="action-btn secondary"
              @click="showImprovementPlan = !showImprovementPlan"
            >
              <svg viewBox="0 0 24 24" class="icon">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1.4 0-2.7-.4-3.8-1.1L15 15l-2-2 4.2-2.2c-.7-1.1-1.1-2.4-1.1-3.8 0-3.9 3.1-7 7-7s7 3.1 7 7-3.1 7-7 7z"/>
              </svg>
              改善計画を見る
            </button>
            <button 
              v-else
              class="action-btn primary"
              @click="startVRExperience"
            >
              <svg viewBox="0 0 24 24" class="icon">
                <path d="M14.5 4l7 6-7 6M7.5 4l7 6-7 6"/>
              </svg>
              VRアカデミーを開始
            </button>
          </div>
        </div>
      </div>

      <!-- Improvement Plan -->
      <Transition name="slide-down">
        <div v-if="showImprovementPlan" class="improvement-plan">
          <h3>スキル向上計画</h3>
          <div class="plan-content">
            <div class="plan-timeline">
              <div class="timeline-item" v-for="(area, index) in report.areasForImprovement" :key="area">
                <div class="timeline-marker">{{ index + 1 }}</div>
                <div class="timeline-content">
                  <h4>{{ area }}の向上</h4>
                  <p>推奨ゲーム: {{ getRecommendedGames(area).join('、') }}</p>
                  <div class="estimated-time">
                    推定学習時間: {{ getEstimatedLearningTime(area) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="next-milestone">
              <h4>次のマイルストーン</h4>
              <div class="milestone-card">
                <div class="milestone-level">{{ getNextLevelName() }}</div>
                <div class="milestone-details">
                  <p>必要スコア: {{ report.nextMilestone?.requiredScore }}%</p>
                  <p>推定ゲーム数: {{ report.nextMilestone?.estimatedGames }}回</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Recent Activity & History -->
      <div class="activity-section">
        <h3>最近の活動</h3>
        <div class="activity-timeline">
          <!-- This would be populated with actual activity data -->
          <div class="activity-item">
            <div class="activity-date">2024-01-15</div>
            <div class="activity-content">
              <h5>CvPronunciationTrainer完了</h5>
              <p>基本操作スキル +3ポイント、会話スキル +2ポイント</p>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-date">2024-01-14</div>
            <div class="activity-content">
              <h5>WordCollectorで高スコア達成</h5>
              <p>文化適応スキル +4ポイント</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>レポートの読み込みに失敗しました</h3>
      <p>しばらく時間をおいてから再度お試しください。</p>
      <button class="retry-btn" @click="refreshReport">
        再試行
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVRReadiness } from '@/services/vrReadinessAssessment'
import type { VRReadinessReport, VRScenarioRecommendation, VRReadinessLevel } from '@/services/vrReadinessAssessment'

// Composables
const router = useRouter()
const vrReadiness = useVRReadiness()

// State
const isLoading = ref(false)
const showImprovementPlan = ref(false)
const report = ref<VRReadinessReport | null>(null)

// Computed
const levelColor = computed(() => {
  if (!report.value) return '#6b7280'
  
  const colors = {
    'beginner': '#06b6d4',
    'foundation': '#3b82f6',
    'intermediate': '#8b5cf6',
    'advanced': '#f59e0b',
    'master': '#ef4444'
  }
  return colors[report.value.level as keyof typeof colors] || '#6b7280'
})

const levelDisplayName = computed(() => {
  if (!report.value) return ''
  
  const names = {
    'beginner': 'ビギナー',
    'foundation': 'ファウンデーション',
    'intermediate': 'インターミディエイト',
    'advanced': 'アドバンスド',
    'master': 'マスター'
  }
  return names[report.value.level as keyof typeof names] || report.value.level
})

const circumference = computed(() => 2 * Math.PI * 50)
const progressOffset = computed(() => {
  if (!report.value) return circumference.value
  const progress = report.value.overallScore / 100
  return circumference.value - (progress * circumference.value)
})

// Methods
const refreshReport = async () => {
  isLoading.value = true
  try {
    const newReport = await vrReadiness.generateReport()
    report.value = newReport
  } catch (error) {
    logger.error('Failed to refresh report:', error)
  } finally {
    isLoading.value = false
  }
}

const getLevelDescription = (): string => {
  if (!report.value) return ''
  
  const descriptions = {
    'beginner': 'VR学習の基礎を構築中です。基本的なゲームで練習を続けましょう。',
    'foundation': 'VR体験の準備が整いつつあります。より複雑な課題に挑戦してみましょう。',
    'intermediate': '日常会話レベルのVR体験が可能です。実践的なシナリオで練習しましょう。',
    'advanced': '高度なVR体験に対応できます。専門的なトピックにも挑戦できます。',
    'master': 'あらゆるVR学習環境に対応できる熟練者です。他の学習者をサポートすることも可能です。'
  }
  return descriptions[report.value.level as keyof typeof descriptions] || ''
}

const getScoreBadgeClass = (score: number): string => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'fair'
  return 'needs-work'
}

const getScoreRating = (score: number): string => {
  if (score >= 90) return '優秀'
  if (score >= 75) return '良好'
  if (score >= 50) return '普通'
  return '要改善'
}

const getSkillColor = (score: number): string => {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

const getContentDisplayName = (contentId: string): string => {
  const names = {
    'vr_preview_basic': 'VR基本プレビュー',
    'vr_scenario_preview': 'VRシナリオプレビュー',
    'vr_academy_access': 'VRアカデミーアクセス'
  }
  return names[contentId as keyof typeof names] || contentId
}

const getPriorityLabel = (priority: string): string => {
  const labels = {
    'high': '高優先',
    'medium': '中優先',
    'low': '低優先'
  }
  return labels[priority as keyof typeof labels] || priority
}

const getDifficultyLabel = (difficulty: VRReadinessLevel): string => {
  const labels = {
    'beginner': '初級',
    'foundation': '基礎',
    'intermediate': '中級',
    'advanced': '上級',
    'master': '最上級'
  }
  return labels[difficulty as keyof typeof labels] || difficulty
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
  if (!report.value?.nextMilestone) return ''
  const names = {
    'foundation': 'ファウンデーション',
    'intermediate': 'インターミディエイト',
    'advanced': 'アドバンスド',
    'master': 'マスター'
  }
  return names[report.value.nextMilestone.level as keyof typeof names] || report.value.nextMilestone.level
}

const getRecommendedGames = (skillArea: string): string[] => {
  const gameMap = {
    'Basic VR Interaction': ['VRチュートリアル', 'CvPronunciationTrainer'],
    'Conversational Fluency': ['ConversationSimulator', 'WordCollector'],
    'Cultural Adaptation': ['CulturalScenarios', 'ConversationSimulator'],
    'Advanced Communication': ['GrammarSentenceBuilder', 'DebateTrainer']
  }
  return gameMap[skillArea as keyof typeof gameMap] || ['基本ゲーム']
}

const getEstimatedLearningTime = (skillArea: string): string => {
  const timeMap = {
    'Basic VR Interaction': '1-2週間',
    'Conversational Fluency': '2-3週間',
    'Cultural Adaptation': '3-4週間',
    'Advanced Communication': '4-6週間'
  }
  return timeMap[skillArea as keyof typeof timeMap] || '2-3週間'
}

const selectScenario = (scenario: VRScenarioRecommendation) => {
  // Navigate to VR scenario or show preview
  router.push(`/vr-scenario/${scenario.scenarioId}/preview`)
}

const startVRExperience = () => {
  // Navigate to VR Academy
  router.push('/vr-academy')
}

// Lifecycle
onMounted(async () => {
  // Load existing report
  const existingReport = await vrReadiness.loadReport()
  if (existingReport) {
    report.value = existingReport
  } else {
    // Generate new report
    await refreshReport()
  }
})
</script>

<style scoped lang="scss">
.vr-readiness-report {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40px;
}

.report-header {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .title-section {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .back-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #e5e7eb;
      transform: translateX(-2px);
    }
    
    .icon {
      width: 20px;
      height: 20px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
    }
  }
  
  .title-text {
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    
    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }
  }
  
  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      
      &.spin {
        animation: spin 1s linear infinite;
      }
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
}

.report-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.status-overview {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  .overall-score {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 30px;
    
    .score-circle {
      position: relative;
      flex-shrink: 0;
      
      .progress-ring {
        transform: rotate(-90deg);
      }
      
      .score-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        
        .score-number {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .score-level {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
      }
    }
    
    .status-details {
      flex: 1;
      
      h2 {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 8px 0;
      }
      
      .status-description {
        font-size: 16px;
        color: #6b7280;
        margin: 0 0 20px 0;
        line-height: 1.5;
      }
      
      .level-progress {
        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
        
        .progress-bar {
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            transition: width 1s ease;
            border-radius: 6px;
          }
        }
      }
    }
  }
  
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &.ready {
        background: #ecfdf5;
        border-color: #10b981;
        
        .stat-icon {
          background: #10b981;
        }
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        background: #e5e7eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      
      .stat-content {
        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .stat-label {
          display: block;
          font-size: 13px;
          color: #6b7280;
        }
        
        .stat-status {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
      }
    }
  }
}

.skill-analysis {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 30px 0;
  }
  
  .skill-category {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .category-title {
        flex: 1;
        
        h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        
        .category-description {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      }
      
      .category-score {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        
        .score-value {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .score-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.excellent {
            background: #dcfce7;
            color: #166534;
          }
          
          &.good {
            background: #fef3c7;
            color: #92400e;
          }
          
          &.fair {
            background: #fed7aa;
            color: #c2410c;
          }
          
          &.needs-work {
            background: #fecaca;
            color: #991b1b;
          }
        }
      }
    }
    
    .skill-progress {
      margin-bottom: 20px;
      
      .progress-bar-container {
        position: relative;
        
        .progress-bar-bg {
          height: 12px;
          background: #f3f4f6;
          border-radius: 6px;
          overflow: hidden;
          
          .progress-bar-fill {
            height: 100%;
            transition: width 1s ease;
            border-radius: 6px;
          }
        }
        
        .progress-markers {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding: 0 2px;
          
          .marker {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 500;
            
            &.passed {
              color: #059669;
              font-weight: 600;
            }
          }
        }
      }
    }
    
    .skill-feedback {
      margin-bottom: 20px;
      
      .feedback-text {
        font-size: 14px;
        color: #374151;
        line-height: 1.5;
        margin: 0;
      }
    }
    
    .recommendations {
      margin-bottom: 20px;
      
      h5 {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px 0;
      }
      
      .recommendation-list {
        margin: 0;
        padding-left: 20px;
        
        li {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 4px;
          line-height: 1.4;
        }
      }
    }
    
    .unlocked-content {
      h5 {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px 0;
      }
      
      .content-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        
        .content-badge {
          padding: 4px 8px;
          background: #dcfce7;
          color: #166534;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }
      }
    }
  }
}

.vr-academy-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    
    .readiness-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      
      .indicator-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #9ca3af;
      }
      
      &.ready {
        background: #ecfdf5;
        color: #059669;
        
        .indicator-dot {
          background: #10b981;
        }
      }
    }
  }
  
  .recommendation-message {
    font-size: 16px;
    color: #374151;
    line-height: 1.6;
    margin: 0 0 30px 0;
  }
  
  .scenarios-section {
    margin-bottom: 30px;
    
    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 20px 0;
    }
    
    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      
      .scenario-card {
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #3b82f6;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        &.high-priority {
          border-color: #f59e0b;
          background: #fffbeb;
        }
        
        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          
          h5 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
            flex: 1;
          }
          
          .priority-badge {
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            
            &.high {
              background: #fef3c7;
              color: #92400e;
            }
            
            &.medium {
              background: #ddd6fe;
              color: #6b21a8;
            }
            
            &.low {
              background: #e0e7ff;
              color: #3730a3;
            }
          }
        }
        
        .scenario-reason {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 16px 0;
          line-height: 1.4;
        }
        
        .scenario-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #6b7280;
            
            .icon {
              width: 14px;
              height: 14px;
              stroke: currentColor;
              fill: none;
              stroke-width: 2;
            }
          }
        }
        
        .scenario-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          
          .skill-tag {
            padding: 4px 8px;
            background: #3b82f6;
            color: white;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
          }
        }
      }
    }
  }
  
  .vr-actions {
    display: flex;
    gap: 16px;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      
      .icon {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
      }
      
      &.primary {
        background: #3b82f6;
        color: white;
        
        &:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
      }
      
      &.secondary {
        background: #f3f4f6;
        color: #374151;
        
        &:hover {
          background: #e5e7eb;
        }
      }
    }
  }
}

.improvement-plan {
  background: white;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 30px 0;
  }
  
  .plan-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    
    .plan-timeline {
      .timeline-item {
        display: flex;
        gap: 20px;
        margin-bottom: 24px;
        
        .timeline-marker {
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .timeline-content {
          flex: 1;
          
          h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
          }
          
          p {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 6px 0;
          }
          
          .estimated-time {
            font-size: 12px;
            color: #9ca3af;
            font-style: italic;
          }
        }
      }
    }
    
    .next-milestone {
      .milestone-card {
        padding: 24px;
        background: #f8fafc;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        
        .milestone-level {
          font-size: 20px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 12px;
        }
        
        .milestone-details {
          p {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0;
          }
        }
      }
    }
  }
}

.activity-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 30px 0;
  }
  
  .activity-timeline {
    .activity-item {
      display: flex;
      gap: 20px;
      padding: 16px 0;
      border-bottom: 1px solid #e5e7eb;
      
      &:last-child {
        border-bottom: none;
      }
      
      .activity-date {
        font-size: 12px;
        color: #9ca3af;
        font-weight: 500;
        width: 80px;
        flex-shrink: 0;
      }
      
      .activity-content {
        flex: 1;
        
        h5 {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        
        p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
      }
    }
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
  text-align: center;
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 {
    font-size: 24px;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    margin: 0 0 24px 0;
    opacity: 0.8;
  }
  
  .retry-btn {
    padding: 12px 24px;
    background: white;
    color: #374151;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f3f4f6;
    }
  }
}

// Transitions
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 800px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Responsive Design
@media (max-width: 768px) {
  .report-content {
    padding: 20px 16px;
  }
  
  .status-overview {
    padding: 24px;
    
    .overall-score {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }
  }
  
  .skill-analysis,
  .vr-academy-section,
  .improvement-plan,
  .activity-section {
    padding: 24px;
  }
  
  .scenarios-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>