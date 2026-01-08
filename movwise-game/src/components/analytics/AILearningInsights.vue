<template>
  <div class="ai-learning-insights">
    <!-- ヘッダーセクション -->
    <div class="insights-header">
      <div class="header-content">
        <h2 class="section-title">
          <i class="fas fa-brain"></i>
          AI学習分析
        </h2>
        <p class="section-subtitle">
          AIが分析した{{ studentName }}さんの学習パターンと推奨事項
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshAnalysis" class="btn-secondary" :disabled="isLoading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          分析更新
        </button>
        <button @click="exportReport" class="btn-primary">
          <i class="fas fa-download"></i>
          レポート出力
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>AI分析中...</p>
    </div>

    <div v-else-if="analysis" class="analysis-content">
      <!-- 概要カード -->
      <div class="overview-card">
        <h3>学習者プロファイル概要</h3>
        <div class="profile-summary">
          <div class="profile-item">
            <span class="profile-label">学習スタイル</span>
            <span class="profile-value">{{ analysis.learningPattern.learningStyle.primary }}</span>
            <div class="confidence-bar">
              <div 
                class="confidence-fill" 
                :style="{ width: (analysis.learningPattern.learningStyle.confidence * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="profile-item">
            <span class="profile-label">エンゲージメント</span>
            <span class="profile-value">{{ formatPercentage(analysis.learningPattern.engagementProfile.overallEngagement) }}</span>
            <div class="engagement-indicator" :class="getEngagementLevel(analysis.learningPattern.engagementProfile.overallEngagement)"></div>
          </div>
          <div class="profile-item">
            <span class="profile-label">改善率</span>
            <span class="profile-value">{{ formatPercentage(analysis.learningPattern.behaviorProfile.improvementRate) }}</span>
            <i class="fas fa-arrow-up text-green-400"></i>
          </div>
        </div>
      </div>

      <!-- AI推奨事項 -->
      <div class="recommendations-section">
        <h3 class="sub-section-title">
          <i class="fas fa-lightbulb"></i>
          AI推奨事項
        </h3>
        
        <div class="recommendation-tabs">
          <button 
            v-for="tab in recommendationTabs" 
            :key="tab.id"
            @click="activeRecommendationTab = tab.id"
            class="tab-btn"
            :class="{ 'active': activeRecommendationTab === tab.id }"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>

        <div class="recommendation-content">
          <!-- 即座の推奨 -->
          <div v-if="activeRecommendationTab === 'immediate'" class="recommendations-list">
            <div 
              v-for="rec in analysis.recommendations.immediate" 
              :key="rec.type"
              class="recommendation-card immediate"
            >
              <div class="rec-header">
                <div class="rec-priority" :class="getPriorityClass(rec.priority)">
                  優先度: {{ rec.priority }}
                </div>
                <div class="rec-timeframe">{{ rec.timeframe }}</div>
              </div>
              <h4>{{ getRecommendationTitle(rec.type) }}</h4>
              <p class="rec-reasoning">{{ rec.reasoning }}</p>
              <div class="rec-action" v-if="rec.action">
                <h5>推奨アクション:</h5>
                <ul>
                  <li v-for="(value, key) in rec.action" :key="key">
                    <strong>{{ formatActionKey(key) }}:</strong> {{ formatActionValue(value) }}
                  </li>
                </ul>
              </div>
              <div class="rec-impact">
                <span class="impact-label">予想効果:</span>
                <span class="impact-value" :class="rec.estimatedImpact">{{ rec.estimatedImpact }}</span>
              </div>
            </div>
          </div>

          <!-- 短期推奨 -->
          <div v-if="activeRecommendationTab === 'shortTerm'" class="recommendations-list">
            <div 
              v-for="rec in analysis.recommendations.shortTerm" 
              :key="rec.type"
              class="recommendation-card short-term"
            >
              <div class="rec-header">
                <div class="rec-priority" :class="getPriorityClass(rec.priority)">
                  優先度: {{ rec.priority }}
                </div>
                <div class="rec-timeframe">{{ rec.timeframe }}</div>
              </div>
              <h4>{{ getRecommendationTitle(rec.type) }}</h4>
              <p class="rec-reasoning">{{ rec.reasoning }}</p>
              
              <!-- スキル開発の詳細 -->
              <div v-if="rec.action.type === 'focused_practice'" class="skill-development">
                <h5>スキル開発計画</h5>
                <div class="skill-area">対象分野: {{ rec.action.skillArea }}</div>
                <div class="practice-schedule">
                  <strong>練習スケジュール:</strong> {{ rec.action.schedule.frequency }} ({{ rec.action.schedule.duration }})
                </div>
                <div class="milestones">
                  <h6>マイルストーン:</h6>
                  <ul>
                    <li v-for="milestone in rec.action.milestones" :key="milestone">{{ milestone }}</li>
                  </ul>
                </div>
              </div>

              <!-- 習慣形成の詳細 -->
              <div v-if="rec.action.type === 'routine_establishment'" class="habit-formation">
                <h5>学習習慣の確立</h5>
                <div class="suggested-times">
                  <strong>推奨時間:</strong> {{ rec.action.suggestedTimes.join(', ') }}
                </div>
                <div class="duration">
                  <strong>推奨時間:</strong> {{ rec.action.duration }}
                </div>
              </div>
            </div>
          </div>

          <!-- 長期推奨 -->
          <div v-if="activeRecommendationTab === 'longTerm'" class="recommendations-list">
            <div 
              v-for="rec in analysis.recommendations.longTerm" 
              :key="rec.type"
              class="recommendation-card long-term"
            >
              <div class="rec-header">
                <div class="rec-priority" :class="getPriorityClass(rec.priority)">
                  優先度: {{ rec.priority }}
                </div>
                <div class="rec-timeframe">{{ rec.timeframe }}</div>
              </div>
              <h4>{{ getRecommendationTitle(rec.type) }}</h4>
              <p class="rec-reasoning">{{ rec.reasoning }}</p>

              <!-- スキル拡張の詳細 -->
              <div v-if="rec.action.type === 'progressive_challenge'" class="skill-expansion">
                <h5>新しいスキル領域への挑戦: {{ rec.action.newSkillArea }}</h5>
                <div class="expansion-phases">
                  <div class="phase">
                    <h6>準備フェーズ ({{ rec.action.preparationPhase.duration }})</h6>
                    <ul>
                      <li v-for="activity in rec.action.preparationPhase.activities" :key="activity">{{ activity }}</li>
                    </ul>
                  </div>
                  <div class="phase">
                    <h6>導入フェーズ ({{ rec.action.introductionPhase.duration }})</h6>
                    <ul>
                      <li v-for="activity in rec.action.introductionPhase.activities" :key="activity">{{ activity }}</li>
                    </ul>
                  </div>
                  <div class="phase">
                    <h6>習得フェーズ ({{ rec.action.masteryPhase.duration }})</h6>
                    <ul>
                      <li v-for="activity in rec.action.masteryPhase.activities" :key="activity">{{ activity }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学習パターン分析 -->
      <div class="learning-pattern-section">
        <h3 class="sub-section-title">
          <i class="fas fa-chart-line"></i>
          学習パターン分析
        </h3>
        
        <div class="pattern-grid">
          <!-- 行動プロファイル -->
          <div class="pattern-card">
            <h4>学習行動</h4>
            <div class="pattern-metrics">
              <div class="metric">
                <span class="metric-label">平均セッション時間</span>
                <span class="metric-value">{{ analysis.learningPattern.behaviorProfile.averageSessionLength }}分</span>
              </div>
              <div class="metric">
                <span class="metric-label">学習一貫性</span>
                <span class="metric-value">{{ formatPercentage(analysis.learningPattern.behaviorProfile.consistencyScore) }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">改善率</span>
                <span class="metric-value">{{ formatPercentage(analysis.learningPattern.behaviorProfile.improvementRate) }}</span>
              </div>
            </div>
            
            <div class="game-preferences">
              <h5>好みのゲーム</h5>
              <div class="preference-tags">
                <span 
                  v-for="game in analysis.learningPattern.behaviorProfile.gamePreferences" 
                  :key="game"
                  class="preference-tag liked"
                >
                  {{ game }}
                </span>
              </div>
            </div>
          </div>

          <!-- 認知プロファイル -->
          <div class="pattern-card">
            <h4>認知特性</h4>
            <div class="cognitive-metrics">
              <div class="metric">
                <span class="metric-label">処理速度</span>
                <span class="metric-value">{{ analysis.learningPattern.cognitiveProfile.processingSpeed }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">注意持続時間</span>
                <span class="metric-value">{{ analysis.learningPattern.cognitiveProfile.attentionSpan }}分</span>
              </div>
              <div class="metric">
                <span class="metric-label">記憶保持率</span>
                <span class="metric-value">{{ formatPercentage(analysis.learningPattern.cognitiveProfile.memoryRetention) }}</span>
              </div>
            </div>
          </div>

          <!-- エンゲージメント分析 -->
          <div class="pattern-card">
            <h4>学習エンゲージメント</h4>
            <div class="engagement-breakdown">
              <div class="engagement-meter">
                <div class="meter-bg">
                  <div 
                    class="meter-fill" 
                    :style="{ width: (analysis.learningPattern.engagementProfile.overallEngagement * 100) + '%' }"
                  ></div>
                </div>
                <span class="meter-label">{{ formatPercentage(analysis.learningPattern.engagementProfile.overallEngagement) }}</span>
              </div>
              
              <div class="motivation-triggers">
                <h5>モチベーション要因</h5>
                <ul>
                  <li 
                    v-for="trigger in analysis.learningPattern.engagementProfile.motivationalTriggers" 
                    :key="trigger"
                  >
                    {{ trigger }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 予測分析 -->
      <div class="predictions-section" v-if="analysis.predictions">
        <h3 class="sub-section-title">
          <i class="fas fa-crystal-ball"></i>
          学習成果予測
        </h3>
        
        <div class="predictions-grid">
          <!-- スキル習得予測 -->
          <div class="prediction-card">
            <h4>スキル習得予測</h4>
            <div class="skill-predictions">
              <div 
                v-for="(prediction, skill) in analysis.predictions.skillMastery" 
                :key="skill"
                class="skill-prediction"
              >
                <div class="skill-header">
                  <span class="skill-name">{{ skill }}</span>
                  <span class="confidence-score">信頼度: {{ formatPercentage(prediction.confidence) }}</span>
                </div>
                <div class="skill-progress">
                  <div class="current-level">現在: {{ prediction.current }}</div>
                  <i class="fas fa-arrow-right"></i>
                  <div class="projected-level">予測: {{ prediction.projected }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- エンゲージメント予測 -->
          <div class="prediction-card">
            <h4>エンゲージメント予測</h4>
            <div class="engagement-forecast">
              <div class="forecast-item">
                <span class="forecast-label">現在レベル</span>
                <span class="forecast-value current">{{ formatPercentage(analysis.predictions.engagementForecast.currentLevel) }}</span>
              </div>
              <div class="forecast-item">
                <span class="forecast-label">予測レベル</span>
                <span class="forecast-value projected">{{ formatPercentage(analysis.predictions.engagementForecast.projectedLevel) }}</span>
              </div>
            </div>
            
            <div class="boost-opportunities">
              <h5>改善機会</h5>
              <ul>
                <li 
                  v-for="opportunity in analysis.predictions.engagementForecast.boostOpportunities" 
                  :key="opportunity"
                >
                  {{ opportunity }}
                </li>
              </ul>
            </div>
          </div>

          <!-- リスク評価 -->
          <div class="prediction-card" v-if="analysis.predictions.riskAssessment.length > 0">
            <h4>リスク評価</h4>
            <div class="risk-assessments">
              <div 
                v-for="risk in analysis.predictions.riskAssessment" 
                :key="risk.type"
                class="risk-item"
                :class="getRiskSeverity(risk.probability)"
              >
                <div class="risk-header">
                  <span class="risk-type">{{ getRiskTypeName(risk.type) }}</span>
                  <span class="risk-probability">{{ formatPercentage(risk.probability) }}</span>
                </div>
                <div class="risk-timeline">予想時期: {{ risk.timeline }}</div>
                <div class="prevention-strategies">
                  <h6>予防策:</h6>
                  <ul>
                    <li v-for="strategy in risk.preventionStrategies" :key="strategy">
                      {{ getStrategyName(strategy) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- インサイト -->
      <div class="insights-section" v-if="analysis.insights">
        <h3 class="sub-section-title">
          <i class="fas fa-eye"></i>
          重要な洞察
        </h3>
        
        <div class="insights-list">
          <div 
            v-for="insight in analysis.insights" 
            :key="insight.type"
            class="insight-card"
            :class="insight.type"
          >
            <div class="insight-header">
              <h4>{{ insight.title }}</h4>
              <span v-if="insight.actionable" class="actionable-badge">実行可能</span>
            </div>
            <p class="insight-description">{{ insight.description }}</p>
            
            <div v-if="insight.recommendations" class="insight-recommendations">
              <h5>推奨アクション:</h5>
              <ul>
                <li v-for="rec in insight.recommendations" :key="rec">{{ rec }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <div class="error-icon">⚠️</div>
      <p>分析データを読み込めませんでした</p>
      <button @click="refreshAnalysis" class="btn-primary">
        <i class="fas fa-retry"></i>
        再試行
      </button>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, watch } from 'vue'
import { AILearningAnalyticsService } from '@/services/aiLearningAnalytics'

export default {
  name: 'AILearningInsights',
  props: {
    studentId: {
      type: String,
      required: true
    },
    studentName: {
      type: String,
      default: '生徒'
    },
    sessionHistory: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const analysis = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const activeRecommendationTab = ref('immediate')
    
    const aiService = new AILearningAnalyticsService()
    
    const recommendationTabs = [
      { id: 'immediate', name: '即座の推奨', icon: 'fas fa-exclamation' },
      { id: 'shortTerm', name: '短期計画', icon: 'fas fa-calendar-week' },
      { id: 'longTerm', name: '長期戦略', icon: 'fas fa-calendar-alt' }
    ]
    
    // 分析実行
    const performAnalysis = async () => {
      if (!props.studentId || !props.sessionHistory.length) return
      
      isLoading.value = true
      error.value = null
      
      try {
        logger.log('🤖 Starting AI analysis for student:', props.studentId)
        
        analysis.value = await aiService.analyzeStudent(
          props.studentId, 
          props.sessionHistory,
          {
            timeHorizon: '1month',
            context: {
              currentDate: new Date().toISOString(),
              analysisType: 'comprehensive'
            }
          }
        )
        
        logger.log('✅ AI analysis completed:', analysis.value)
      } catch (err) {
        logger.error('❌ AI analysis failed:', err)
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const refreshAnalysis = () => {
      performAnalysis()
    }
    
    const exportReport = () => {
      if (!analysis.value) return
      
      const report = {
        studentName: props.studentName,
        analyzedAt: analysis.value.analyzedAt,
        summary: {
          learningStyle: analysis.value.learningPattern.learningStyle.primary,
          engagement: analysis.value.learningPattern.engagementProfile.overallEngagement,
          improvementRate: analysis.value.learningPattern.behaviorProfile.improvementRate
        },
        recommendations: analysis.value.recommendations,
        predictions: analysis.value.predictions,
        insights: analysis.value.insights
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-analysis-${props.studentName}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // ユーティリティ関数
    const formatPercentage = (value) => {
      return Math.round(value * 100) + '%'
    }
    
    const getEngagementLevel = (value) => {
      if (value >= 0.8) return 'high'
      if (value >= 0.6) return 'medium'
      return 'low'
    }
    
    const getPriorityClass = (priority) => {
      if (priority >= 9) return 'critical'
      if (priority >= 7) return 'high'
      if (priority >= 5) return 'medium'
      return 'low'
    }
    
    const getRecommendationTitle = (type) => {
      const titles = {
        'risk_mitigation': 'リスク軽減対策',
        'engagement_boost': 'エンゲージメント向上',
        'difficulty_adjustment': '難易度調整',
        'skill_development': 'スキル開発',
        'habit_formation': '学習習慣の形成',
        'skill_expansion': 'スキル領域の拡張',
        'learning_optimization': '学習最適化'
      }
      return titles[type] || type
    }
    
    const formatActionKey = (key) => {
      const keys = {
        'type': 'タイプ',
        'games': 'ゲーム',
        'duration': '時間',
        'adjustment': '調整',
        'skillArea': 'スキル領域',
        'schedule': 'スケジュール'
      }
      return keys[key] || key
    }
    
    const formatActionValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    }
    
    const getRiskSeverity = (probability) => {
      if (probability >= 0.7) return 'high-risk'
      if (probability >= 0.4) return 'medium-risk'
      return 'low-risk'
    }
    
    const getRiskTypeName = (type) => {
      const types = {
        'dropout': '学習中断リスク',
        'performance_decline': 'パフォーマンス低下リスク'
      }
      return types[type] || type
    }
    
    const getStrategyName = (strategy) => {
      const strategies = {
        'engagement_boost': 'エンゲージメント向上',
        'difficulty_adjustment': '難易度調整',
        'support_intervention': 'サポート介入',
        'skill_reinforcement': 'スキル強化',
        'motivation_enhancement': 'モチベーション強化'
      }
      return strategies[strategy] || strategy
    }
    
    // ライフサイクル
    onMounted(() => {
      performAnalysis()
    })
    
    // sessionHistoryの変更を監視
    watch(() => props.sessionHistory, () => {
      if (props.sessionHistory.length > 0) {
        performAnalysis()
      }
    })
    
    return {
      analysis,
      isLoading,
      error,
      activeRecommendationTab,
      recommendationTabs,
      refreshAnalysis,
      exportReport,
      formatPercentage,
      getEngagementLevel,
      getPriorityClass,
      getRecommendationTitle,
      formatActionKey,
      formatActionValue,
      getRiskSeverity,
      getRiskTypeName,
      getStrategyName
    }
  }
}
</script>

<style scoped>
.ai-learning-insights {
  padding: 1.5rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  min-height: 100vh;
  color: white;
}

/* ヘッダー */
.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* ローディング・エラー状態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #374151;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  color: #ef4444;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 概要カード */
.overview-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.overview-card h3 {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.profile-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.profile-value {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.confidence-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.engagement-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.engagement-indicator.high {
  background: #10b981;
}

.engagement-indicator.medium {
  background: #f59e0b;
}

.engagement-indicator.low {
  background: #ef4444;
}

/* 推奨事項セクション */
.recommendations-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.sub-section-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.recommendation-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab-btn {
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  border-bottom: 2px solid #3b82f6;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
}

.recommendation-card.immediate {
  border-left: 4px solid #ef4444;
}

.recommendation-card.short-term {
  border-left: 4px solid #f59e0b;
}

.recommendation-card.long-term {
  border-left: 4px solid #10b981;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.rec-priority {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.rec-priority.critical {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.rec-priority.high {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.rec-priority.medium {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.rec-priority.low {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.rec-timeframe {
  color: #94a3b8;
  font-size: 0.8rem;
}

.recommendation-card h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.rec-reasoning {
  color: #cbd5e1;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.rec-action {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.rec-action h5 {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.rec-action ul {
  list-style: none;
  padding: 0;
}

.rec-action li {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

.rec-impact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.impact-label {
  color: #94a3b8;
  font-size: 0.8rem;
}

.impact-value {
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.impact-value.high {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.impact-value.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
}

.impact-value.low {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

/* スキル開発・習慣形成の詳細 */
.skill-development,
.habit-formation,
.skill-expansion {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.skill-development h5,
.habit-formation h5,
.skill-expansion h5 {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.skill-area,
.practice-schedule,
.suggested-times,
.duration {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.milestones h6 {
  color: #e2e8f0;
  font-size: 0.8rem;
  margin: 0.5rem 0 0.3rem 0;
}

.expansion-phases .phase {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.expansion-phases .phase h6 {
  color: #e2e8f0;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

/* 学習パターン分析 */
.learning-pattern-section {
  margin-bottom: 2rem;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.pattern-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.pattern-card h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.pattern-metrics,
.cognitive-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: #94a3b8;
  font-size: 0.85rem;
}

.metric-value {
  color: white;
  font-weight: 500;
}

.game-preferences h5,
.motivation-triggers h5 {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.preference-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.preference-tag.liked {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.engagement-meter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.meter-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #f59e0b, #10b981);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.meter-label {
  color: white;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

/* 予測分析セクション */
.predictions-section {
  margin-bottom: 2rem;
}

.predictions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.prediction-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.prediction-card h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.skill-predictions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-prediction {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.skill-name {
  color: white;
  font-weight: 500;
}

.confidence-score {
  color: #94a3b8;
  font-size: 0.8rem;
}

.skill-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-level,
.projected-level {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.current-level {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.projected-level {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.engagement-forecast {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.forecast-label {
  color: #94a3b8;
  font-size: 0.8rem;
}

.forecast-value {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
}

.forecast-value.current {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.forecast-value.projected {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.boost-opportunities h5 {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.risk-assessments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.risk-item {
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid;
}

.risk-item.high-risk {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.risk-item.medium-risk {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
}

.risk-item.low-risk {
  background: rgba(107, 114, 128, 0.1);
  border-color: #6b7280;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.risk-type {
  color: white;
  font-weight: 500;
}

.risk-probability {
  color: #fca5a5;
  font-weight: 600;
}

.risk-timeline {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.prevention-strategies h6 {
  color: #e2e8f0;
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

/* インサイトセクション */
.insights-section {
  margin-bottom: 2rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
}

.insight-card.learning_style {
  border-left: 4px solid #8b5cf6;
}

.insight-card.performance_trend {
  border-left: 4px solid #06b6d4;
}

.insight-card.high_engagement {
  border-left: 4px solid #10b981;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.insight-header h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.actionable-badge {
  padding: 0.2rem 0.5rem;
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.insight-description {
  color: #cbd5e1;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.insight-recommendations h5 {
  color: #e2e8f0;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.insight-recommendations ul {
  list-style: none;
  padding: 0;
}

.insight-recommendations li {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
}

.insight-recommendations li::before {
  content: '•';
  color: #3b82f6;
  font-weight: bold;
  position: absolute;
  left: 0;
}

/* ボタンスタイル */
.btn-primary,
.btn-secondary {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .ai-learning-insights {
    padding: 1rem;
  }

  .insights-header {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-summary {
    grid-template-columns: 1fr;
  }

  .pattern-grid,
  .predictions-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-tabs {
    flex-wrap: wrap;
  }

  .engagement-forecast {
    grid-template-columns: 1fr;
  }

  .skill-progress {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .section-title {
    font-size: 1.5rem;
  }

  .sub-section-title {
    font-size: 1.2rem;
  }

  .recommendation-card,
  .pattern-card,
  .prediction-card,
  .insight-card {
    padding: 1rem;
  }
}
</style>