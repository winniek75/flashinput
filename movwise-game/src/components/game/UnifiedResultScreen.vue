<template>
  <div class="unified-result-screen">
    <Transition name="result-appear" appear>
      <div class="result-overlay">
        <!-- Background Effects -->
        <div class="result-background">
          <div class="celebration-particles">
            <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
          </div>
          <div class="achievement-glow" :class="getAchievementGlowClass()"></div>
        </div>

        <!-- Main Result Card -->
        <div class="result-card">
          <!-- Game Header -->
          <div class="result-header">
            <div class="game-icon">{{ gameIcon }}</div>
            <div class="game-info">
              <h2 class="game-title">{{ gameName }}</h2>
              <p class="game-subtitle">{{ getResultMessage() }}</p>
            </div>
            <div class="result-rank" :class="getRankClass()">
              <div class="rank-icon">{{ getRankIcon() }}</div>
              <div class="rank-text">{{ getRankText() }}</div>
            </div>
          </div>

          <!-- Score Display -->
          <div class="score-section">
            <div class="main-score">
              <div class="score-value">{{ animatedScore.toLocaleString() }}</div>
              <div class="score-label">総合スコア</div>
            </div>
            
            <div class="score-stats">
              <div class="stat-item">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">{{ Math.round(gameResult.accuracy) }}%</div>
                <div class="stat-label">正確性</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">{{ formatDuration(gameResult.duration) }}</div>
                <div class="stat-label">プレイ時間</div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🔥</div>
                <div class="stat-value">{{ gameResult.completedChallenges.length }}</div>
                <div class="stat-label">チャレンジ</div>
              </div>
            </div>
          </div>

          <!-- Rewards Section -->
          <div class="rewards-section">
            <h3 class="rewards-title">🎁 獲得報酬</h3>
            <div class="rewards-grid">
              <!-- Crystal Reward -->
              <div class="reward-item crystal-reward" v-if="gameResult.crystalReward > 0">
                <div class="reward-icon">💎</div>
                <div class="reward-amount">+{{ gameResult.crystalReward }}</div>
                <div class="reward-label">クリスタル</div>
              </div>

              <!-- VR Readiness Gain -->
              <div class="reward-item vr-reward" v-if="gameResult.vrReadinessGain > 0">
                <div class="reward-icon">🥽</div>
                <div class="reward-amount">+{{ gameResult.vrReadinessGain }}%</div>
                <div class="reward-label">VR準備度</div>
              </div>

              <!-- Experience Points -->
              <div class="reward-item exp-reward" v-if="experienceGain > 0">
                <div class="reward-icon">⭐</div>
                <div class="reward-amount">+{{ experienceGain }}</div>
                <div class="reward-label">経験値</div>
              </div>

              <!-- Achievement Badge -->
              <div class="reward-item achievement-reward" v-if="newAchievements.length > 0">
                <div class="reward-icon">🏆</div>
                <div class="reward-amount">{{ newAchievements.length }}</div>
                <div class="reward-label">実績</div>
              </div>
            </div>
          </div>

          <!-- Phoneme Skills Analysis -->
          <div class="skills-section" v-if="gameResult.phonemeSkills.length > 0">
            <h3 class="skills-title">📊 音素スキル分析</h3>
            <div class="skills-grid">
              <div 
                v-for="skill in topPhonemeSkills" 
                :key="skill.phoneme"
                class="skill-item"
                :class="getSkillItemClass(skill.accuracy)"
              >
                <div class="skill-phoneme">{{ skill.phoneme }}</div>
                <div class="skill-accuracy">{{ Math.round(skill.accuracy) }}%</div>
                <div class="skill-progress">
                  <div class="skill-bar">
                    <div 
                      class="skill-fill" 
                      :style="{ width: `${skill.accuracy}%` }"
                    ></div>
                  </div>
                </div>
                <div class="skill-vr-mapping">
                  <span 
                    v-for="vrSkill in skill.vrSkillMapping.slice(0, 2)" 
                    :key="vrSkill"
                    class="vr-skill-tag"
                    :title="getVRSkillDescription(vrSkill)"
                  >
                    {{ getVRSkillName(vrSkill) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Improvement Suggestions -->
          <div class="improvement-section" v-if="improvementSuggestions.length > 0">
            <h3 class="improvement-title">💡 学習アドバイス</h3>
            <div class="improvement-list">
              <div 
                v-for="suggestion in improvementSuggestions" 
                :key="suggestion.id"
                class="improvement-item"
                :class="`priority-${suggestion.priority}`"
              >
                <div class="improvement-icon">{{ suggestion.icon }}</div>
                <div class="improvement-content">
                  <div class="improvement-text">{{ suggestion.text }}</div>
                  <div class="improvement-games">
                    推奨ゲーム: 
                    <span 
                      v-for="game in suggestion.recommendedGames" 
                      :key="game"
                      class="recommended-game"
                    >
                      {{ game }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- VR Academy Connection -->
          <div class="vr-academy-section" v-if="vrReadinessGain > 0">
            <div class="vr-academy-card">
              <div class="vr-academy-header">
                <div class="vr-academy-icon">🌐</div>
                <div class="vr-academy-info">
                  <h4 class="vr-academy-title">VRアカデミー準備度向上！</h4>
                  <p class="vr-academy-description">あなたの音素スキルがVRシナリオ対応レベルに近づいています</p>
                </div>
              </div>
              
              <div class="vr-scenarios-preview" v-if="relevantVRScenarios.length > 0">
                <div class="scenarios-title">関連VRシナリオ:</div>
                <div class="scenarios-list">
                  <div 
                    v-for="scenario in relevantVRScenarios" 
                    :key="scenario.id"
                    class="scenario-preview"
                    :class="{ 'scenario-ready': scenario.readiness >= 70 }"
                    @click="$emit('preview-vr-scenario', scenario)"
                  >
                    <div class="scenario-icon">{{ scenario.icon }}</div>
                    <div class="scenario-info">
                      <div class="scenario-name">{{ scenario.name }}</div>
                      <div class="scenario-readiness">準備度: {{ scenario.readiness }}%</div>
                    </div>
                    <div class="scenario-status">
                      <div v-if="scenario.readiness >= 70" class="status-ready">体験可能</div>
                      <div v-else class="status-preparing">準備中</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button 
              @click="$emit('play-again')" 
              class="action-button primary-button"
              :disabled="isProcessing"
            >
              <span class="button-icon">🔄</span>
              <span>もう一度プレイ</span>
            </button>

            <!-- 詳細統計ボタンを削除 - 未実装のため -->

            <button 
              @click="$emit('back-to-hub')" 
              class="action-button secondary-button"
              :disabled="isProcessing"
            >
              <span class="button-icon">🏠</span>
              <span>ハブに戻る</span>
            </button>

            <button 
              v-if="hasVRScenarios"
              @click="$emit('explore-vr')" 
              class="action-button vr-button"
              :disabled="isProcessing"
            >
              <span class="button-icon">🥽</span>
              <span>VR体験</span>
            </button>
          </div>

          <!-- Sync Status -->
          <div class="sync-status" v-if="showSyncStatus">
            <div class="sync-indicator" :class="syncStatusClass">
              <div class="sync-icon">{{ syncStatusIcon }}</div>
              <div class="sync-text">{{ syncStatusText }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { useVRDataSync } from '@/api/vrDataSync'

// Props
const props = defineProps({
  gameResult: {
    type: Object,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  gameIcon: {
    type: String,
    default: '🎮'
  },
  showVRIntegration: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'play-again',
  'back-to-hub', 
  'preview-vr-scenario',
  'explore-vr'
])

// Composables
const gameStore = useGameStore()
const playerStore = usePlayerProfileStore()
const vrDataSync = useVRDataSync()

// State
const animatedScore = ref(0)
const isProcessing = ref(false)
const showSyncStatus = ref(false)
const syncStatus = ref('idle')

// Computed
const experienceGain = computed(() => {
  return Math.floor(props.gameResult.score / 100) + props.gameResult.completedChallenges.length * 50
})

const vrReadinessGain = computed(() => {
  return props.gameResult.vrReadinessGain || 0
})

const newAchievements = computed(() => {
  // 実績システムとの連携（将来実装）
  return []
})

const topPhonemeSkills = computed(() => {
  return props.gameResult.phonemeSkills
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 6)
})

const improvementSuggestions = computed(() => {
  const suggestions = []
  
  // 低精度音素の改善提案
  const weakPhonemes = props.gameResult.phonemeSkills
    .filter(skill => skill.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  for (const phoneme of weakPhonemes) {
    suggestions.push({
      id: `improve_${phoneme.phoneme}`,
      icon: '🎯',
      text: `「${phoneme.phoneme}」音素の精度向上を重点的に練習しましょう`,
      priority: phoneme.accuracy < 50 ? 'high' : 'medium',
      recommendedGames: getRecommendedGamesForPhoneme(phoneme.phoneme)
    })
  }

  // 反応時間の改善提案
  const slowResponses = props.gameResult.phonemeSkills
    .filter(skill => skill.responseTime > 2000)

  if (slowResponses.length > 0) {
    suggestions.push({
      id: 'improve_response_time',
      icon: '⚡',
      text: '反応速度を向上させるために、スピード重視のゲームがおすすめです',
      priority: 'medium',
      recommendedGames: ['サウンド・バトル・アリーナ', 'リズム・フォニックス・ダンス']
    })
  }

  return suggestions.slice(0, 4)
})

const relevantVRScenarios = computed(() => {
  const scenarios = [
    {
      id: 'restaurant_ordering',
      name: 'レストラン注文体験',
      icon: '🍽️',
      readiness: calculateScenarioReadiness('restaurant_ordering'),
      requiredPhonemes: ['r', 'l', 'th', 'w']
    },
    {
      id: 'airport_checkin', 
      name: '空港チェックイン',
      icon: '✈️',
      readiness: calculateScenarioReadiness('airport_checkin'),
      requiredPhonemes: ['p', 'b', 'f', 'v']
    },
    {
      id: 'business_meeting',
      name: 'ビジネス会議',
      icon: '💼',
      readiness: calculateScenarioReadiness('business_meeting'),
      requiredPhonemes: ['th', 'z', 's', 'sh']
    }
  ]

  return scenarios.filter(scenario => scenario.readiness > 40)
})

const hasVRScenarios = computed(() => {
  return relevantVRScenarios.value.some(scenario => scenario.readiness >= 70)
})

const syncStatusClass = computed(() => {
  return `sync-${syncStatus.value}`
})

const syncStatusIcon = computed(() => {
  const icons = {
    idle: '⌛',
    syncing: '🔄',
    success: '✅',
    error: '❌',
    offline: '📴'
  }
  return icons[syncStatus.value] || '⌛'
})

const syncStatusText = computed(() => {
  const texts = {
    idle: 'データ同期待機中',
    syncing: 'VRアカデミーに同期中...',
    success: 'VRアカデミーに同期完了',
    error: '同期エラー（後で再試行）',
    offline: 'オフライン（接続時に同期）'
  }
  return texts[syncStatus.value] || 'データ同期待機中'
})

// Methods
const getResultMessage = () => {
  const accuracy = props.gameResult.accuracy
  if (accuracy >= 90) return '素晴らしい！完璧な音素認識です'
  if (accuracy >= 80) return 'とても良い結果です！'
  if (accuracy >= 70) return 'よくできました！'
  if (accuracy >= 60) return 'もう少しで上達します'
  return '練習を続けて音素スキルを向上させましょう'
}

const getRankClass = () => {
  const accuracy = props.gameResult.accuracy
  if (accuracy >= 90) return 'rank-s'
  if (accuracy >= 80) return 'rank-a'
  if (accuracy >= 70) return 'rank-b'
  if (accuracy >= 60) return 'rank-c'
  return 'rank-d'
}

const getRankIcon = () => {
  const accuracy = props.gameResult.accuracy
  if (accuracy >= 90) return '👑'
  if (accuracy >= 80) return '🏆'
  if (accuracy >= 70) return '🥇'
  if (accuracy >= 60) return '🥈'
  return '🥉'
}

const getRankText = () => {
  const accuracy = props.gameResult.accuracy
  if (accuracy >= 90) return 'マスター'
  if (accuracy >= 80) return 'エキスパート'
  if (accuracy >= 70) return 'アドバンス'
  if (accuracy >= 60) return 'インタメディエイト'
  return 'ビギナー'
}

const getAchievementGlowClass = () => {
  const accuracy = props.gameResult.accuracy
  if (accuracy >= 90) return 'glow-master'
  if (accuracy >= 80) return 'glow-expert'
  if (accuracy >= 70) return 'glow-advance'
  return 'glow-standard'
}

const getSkillItemClass = (accuracy) => {
  if (accuracy >= 80) return 'skill-excellent'
  if (accuracy >= 70) return 'skill-good'
  if (accuracy >= 60) return 'skill-fair'
  return 'skill-needs-improvement'
}

const getParticleStyle = (index) => {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${2 + Math.random() * 3}s`
  }
}

const formatDuration = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`
  } else {
    return `${remainingSeconds}秒`
  }
}

const getVRSkillName = (skillId) => {
  const names = {
    'restaurant_ordering': 'レストラン',
    'casual_conversation': '日常会話',
    'business_meeting': 'ビジネス',
    'airport_checkin': '空港',
    'pronunciation_practice': '発音練習',
    'presentation_skills': 'プレゼン'
  }
  return names[skillId] || skillId
}

const getVRSkillDescription = (skillId) => {
  const descriptions = {
    'restaurant_ordering': 'レストランでの注文スキル',
    'casual_conversation': '日常的な会話スキル',
    'business_meeting': 'ビジネス会議での会話スキル'
  }
  return descriptions[skillId] || 'VRスキル'
}

const getRecommendedGamesForPhoneme = (phoneme) => {
  const gameMapping = {
    'r': ['フォニーム・セイバー', 'リズム・フォニックス・ダンス'],
    'l': ['フォニーム・セイバー', 'サウンド・バトル・アリーナ'],
    'th': ['リズム・フォニックス・ダンス', 'フォニーム・セイバー'],
    'w': ['サウンド・バトル・アリーナ', 'リズム・フォニックス・ダンス']
  }
  return gameMapping[phoneme] || ['フォニーム・セイバー']
}

const calculateScenarioReadiness = (scenarioId) => {
  const scenarioRequirements = {
    'restaurant_ordering': ['r', 'l', 'th', 'w'],
    'airport_checkin': ['p', 'b', 'f', 'v'], 
    'business_meeting': ['th', 'z', 's', 'sh']
  }

  const requiredPhonemes = scenarioRequirements[scenarioId] || []
  const relevantSkills = props.gameResult.phonemeSkills.filter(skill => 
    requiredPhonemes.includes(skill.phoneme)
  )

  if (relevantSkills.length === 0) return 30

  const averageAccuracy = relevantSkills.reduce((sum, skill) => sum + skill.accuracy, 0) / relevantSkills.length
  return Math.min(averageAccuracy + 20, 100)
}

const animateScore = () => {
  const targetScore = props.gameResult.score
  const duration = 2000
  const steps = 60
  const increment = targetScore / steps

  let currentScore = 0
  const timer = setInterval(() => {
    currentScore += increment
    animatedScore.value = Math.min(currentScore, targetScore)
    
    if (currentScore >= targetScore) {
      clearInterval(timer)
      animatedScore.value = targetScore
    }
  }, duration / steps)
}

const syncToVRAcademy = async () => {
  if (!props.showVRIntegration) return

  try {
    showSyncStatus.value = true
    syncStatus.value = 'syncing'

    const success = await vrDataSync.syncGameResult(props.gameResult)
    
    if (success) {
      syncStatus.value = 'success'
      setTimeout(() => {
        showSyncStatus.value = false
      }, 3000)
    } else {
      syncStatus.value = vrDataSync.getSyncStatus().isOnline ? 'error' : 'offline'
      setTimeout(() => {
        showSyncStatus.value = false
      }, 5000)
    }

  } catch (error) {
    logger.error('VR同期エラー:', error)
    syncStatus.value = 'error'
    setTimeout(() => {
      showSyncStatus.value = false
    }, 5000)
  }
}

// Lifecycle
onMounted(() => {
  animateScore()
  
  // VRアカデミーへの同期を少し遅らせて実行
  setTimeout(() => {
    syncToVRAcademy()
  }, 1000)
})

// Watch for prop changes
watch(() => props.gameResult, () => {
  animateScore()
}, { deep: true })
</script>

<style scoped lang="scss">
.unified-result-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.result-overlay {
  position: relative;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.result-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  
  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fbbf24;
    border-radius: 50%;
    animation: float-up 4s linear infinite;
    
    &:nth-child(odd) {
      background: #8b5cf6;
    }
    
    &:nth-child(3n) {
      background: #06b6d4;
    }
  }
}

.achievement-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  opacity: 0.3;
  
  &.glow-master {
    background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  &.glow-expert {
    background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  &.glow-advance {
    background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  &.glow-standard {
    background: radial-gradient(circle, #10b981 0%, transparent 70%);
    animation: pulse-glow 2s ease-in-out infinite;
  }
}

.result-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  
  .game-icon {
    font-size: 3rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
  
  .game-info {
    flex: 1;
    
    .game-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 4px;
    }
    
    .game-subtitle {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0;
    }
  }
  
  .result-rank {
    text-align: center;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid;
    
    .rank-icon {
      font-size: 2rem;
      margin-bottom: 4px;
    }
    
    .rank-text {
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    &.rank-s {
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }
    
    &.rank-a {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    
    &.rank-b {
      border-color: #06b6d4;
      background: rgba(6, 182, 212, 0.1);
      color: #06b6d4;
    }
    
    &.rank-c {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    
    &.rank-d {
      border-color: #6b7280;
      background: rgba(107, 114, 128, 0.1);
      color: #6b7280;
    }
  }
}

.score-section {
  margin-bottom: 32px;
  
  .main-score {
    text-align: center;
    margin-bottom: 24px;
    
    .score-value {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 4px;
    }
    
    .score-label {
      font-size: 1rem;
      color: #94a3b8;
    }
  }
  
  .score-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      .stat-icon {
        font-size: 1.5rem;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #f1f5f9;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }
  }
}

.rewards-section {
  margin-bottom: 32px;
  
  .rewards-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .rewards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    
    .reward-item {
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid;
      
      .reward-icon {
        font-size: 2rem;
        margin-bottom: 8px;
      }
      
      .reward-amount {
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 4px;
      }
      
      .reward-label {
        font-size: 0.75rem;
        opacity: 0.8;
      }
      
      &.crystal-reward {
        border-color: #06b6d4;
        background: rgba(6, 182, 212, 0.1);
        color: #06b6d4;
      }
      
      &.vr-reward {
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }
      
      &.exp-reward {
        border-color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
      }
      
      &.achievement-reward {
        border-color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
    }
  }
}

.skills-section {
  margin-bottom: 32px;
  
  .skills-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    
    .skill-item {
      padding: 16px;
      border-radius: 12px;
      border: 2px solid;
      
      .skill-phoneme {
        font-size: 1.5rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: 8px;
      }
      
      .skill-accuracy {
        font-size: 1.125rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 8px;
      }
      
      .skill-progress {
        margin-bottom: 12px;
        
        .skill-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
          
          .skill-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.8s ease;
          }
        }
      }
      
      .skill-vr-mapping {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        
        .vr-skill-tag {
          padding: 2px 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 0.625rem;
          font-weight: 500;
          cursor: help;
        }
      }
      
      &.skill-excellent {
        border-color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        
        .skill-fill {
          background: #10b981;
        }
      }
      
      &.skill-good {
        border-color: #06b6d4;
        background: rgba(6, 182, 212, 0.1);
        color: #06b6d4;
        
        .skill-fill {
          background: #06b6d4;
        }
      }
      
      &.skill-fair {
        border-color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
        color: #fbbf24;
        
        .skill-fill {
          background: #fbbf24;
        }
      }
      
      &.skill-needs-improvement {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        .skill-fill {
          background: #ef4444;
        }
      }
    }
  }
}

.improvement-section {
  margin-bottom: 32px;
  
  .improvement-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .improvement-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .improvement-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid;
      
      .improvement-icon {
        font-size: 1.5rem;
        margin-top: 2px;
      }
      
      .improvement-content {
        flex: 1;
        
        .improvement-text {
          font-size: 0.875rem;
          color: #f1f5f9;
          margin-bottom: 8px;
          line-height: 1.4;
        }
        
        .improvement-games {
          font-size: 0.75rem;
          color: #94a3b8;
          
          .recommended-game {
            display: inline-block;
            padding: 2px 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-left: 4px;
            margin-right: 4px;
          }
        }
      }
      
      &.priority-high {
        border-left-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
      
      &.priority-medium {
        border-left-color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
      }
      
      &.priority-low {
        border-left-color: #06b6d4;
        background: rgba(6, 182, 212, 0.1);
      }
    }
  }
}

.vr-academy-section {
  margin-bottom: 32px;
  
  .vr-academy-card {
    background: rgba(139, 92, 246, 0.1);
    border: 2px solid #8b5cf6;
    border-radius: 16px;
    padding: 20px;
    
    .vr-academy-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      .vr-academy-icon {
        font-size: 2.5rem;
      }
      
      .vr-academy-info {
        flex: 1;
        
        .vr-academy-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 4px;
        }
        
        .vr-academy-description {
          font-size: 0.875rem;
          color: #c4b5fd;
          margin: 0;
        }
      }
    }
    
    .vr-scenarios-preview {
      .scenarios-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #c4b5fd;
        margin-bottom: 12px;
      }
      
      .scenarios-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .scenario-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
          }
          
          &.scenario-ready {
            border: 1px solid #10b981;
            background: rgba(16, 185, 129, 0.1);
          }
          
          .scenario-icon {
            font-size: 1.5rem;
          }
          
          .scenario-info {
            flex: 1;
            
            .scenario-name {
              font-size: 0.875rem;
              font-weight: 600;
              color: #f1f5f9;
              margin-bottom: 2px;
            }
            
            .scenario-readiness {
              font-size: 0.75rem;
              color: #94a3b8;
            }
          }
          
          .scenario-status {
            .status-ready {
              padding: 4px 8px;
              background: #10b981;
              color: white;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
            }
            
            .status-preparing {
              padding: 4px 8px;
              background: #6b7280;
              color: white;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
  
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
    
    .button-icon {
      font-size: 1rem;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.primary-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      
      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
      }
    }
    
    &.secondary-button {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.2);
      
      &:not(:disabled):hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
    }
    
    &.vr-button {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
      
      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
      }
    }
  }
}

.sync-status {
  display: flex;
  justify-content: center;
  
  .sync-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    
    .sync-icon {
      font-size: 1rem;
    }
    
    &.sync-idle, &.sync-syncing {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
    }
    
    &.sync-syncing .sync-icon {
      animation: spin 1s linear infinite;
    }
    
    &.sync-success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    
    &.sync-error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    
    &.sync-offline {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
  }
}

// Animations
@keyframes float-up {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.5;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.result-appear-enter-active {
  animation: result-appear 0.8s ease-out;
}

@keyframes result-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(50px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .result-overlay {
    width: 95%;
    max-height: 95vh;
  }
  
  .result-card {
    padding: 20px;
  }
  
  .result-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .score-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rewards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>