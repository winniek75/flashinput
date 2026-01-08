<template>
  <div
    class="planet-preview-portal"
    :class="{ visible: planet }"
    :style="portalStyle"
    @click.stop
  >
    <div class="preview-container webxr-ui-panel" v-if="planet">
      <!-- プレビューヘッダー -->
      <div class="preview-header">
        <div class="planet-icon-large">{{ planet.emoji }}</div>
        <div class="planet-info">
          <h3 class="planet-title">{{ planet.name }}</h3>
          <p class="planet-subtitle">{{ planet.subtitle }}</p>
          <div class="planet-status">
            <span class="status-badge" :class="statusClass">
              {{ statusText }}
            </span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- 進捗表示 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Learning Progress</span>
          <span class="progress-value">{{ planet.progress }}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ 
                width: planet.progress + '%',
                background: planet.progressColor 
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- スキル詳細 -->
      <div class="skills-section" v-if="planetSkills.length > 0">
        <h4 class="section-title">Core Skills</h4>
        <div class="skills-grid">
          <div
            v-for="skill in planetSkills"
            :key="skill.name"
            class="skill-item"
          >
            <div class="skill-icon">{{ skill.icon }}</div>
            <div class="skill-info">
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-level">Level {{ skill.level }}</div>
            </div>
            <div class="skill-progress">
              <div 
                class="skill-progress-bar"
                :style="{ width: (skill.level / 100 * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- クリスタル情報 -->
      <div class="crystals-section" v-if="planet.crystals > 0">
        <h4 class="section-title">Crystals Collected</h4>
        <div class="crystals-display">
          <div class="crystal-item">
            <div class="crystal-icon">💎</div>
            <div class="crystal-info">
              <div class="crystal-count">{{ planet.crystals }}</div>
              <div class="crystal-type">{{ capitalizeFirst(planet.id.replace('Planet', '')) }} Crystals</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VR準備状況 -->
      <div class="vr-section">
        <h4 class="section-title">VR Experience</h4>
        <div class="vr-status-card" :class="{ 'vr-ready': planet.vrReady }">
          <div class="vr-icon">🥽</div>
          <div class="vr-info">
            <div class="vr-status-text">
              {{ planet.vrReady ? 'VR Ready' : 'VR Experience Locked' }}
            </div>
            <div class="vr-description">
              {{ vrDescription }}
            </div>
          </div>
          <div class="vr-indicator" :class="{ ready: planet.vrReady }">
            {{ planet.vrReady ? '✓' : '⏳' }}
          </div>
        </div>
      </div>

      <!-- 学習ガイド -->
      <div class="learning-guide">
        <h4 class="section-title">What You'll Learn</h4>
        <div class="learning-topics">
          <div
            v-for="topic in learningTopics"
            :key="topic"
            class="topic-item"
          >
            <div class="topic-bullet">•</div>
            <div class="topic-text">{{ topic }}</div>
          </div>
        </div>
      </div>

      <!-- 解除条件（ロック時） -->
      <div class="unlock-section" v-if="!planet.unlocked">
        <h4 class="section-title">Unlock Requirements</h4>
        <div class="unlock-requirement">
          <div class="requirement-text">{{ planet.unlockRequirement }}</div>
          <div class="requirement-progress" v-if="unlockProgress">
            <div class="requirement-progress-bar">
              <div 
                class="requirement-progress-fill"
                :style="{ width: unlockProgress.percentage + '%' }"
              ></div>
            </div>
            <div class="requirement-progress-text">
              {{ unlockProgress.current }} / {{ unlockProgress.required }}
            </div>
          </div>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="action-section">
        <button
          v-if="planet.unlocked"
          class="action-btn primary"
          :class="{ 'vr-action': planet.vrReady }"
          @click="enterPlanet"
        >
          <div class="btn-icon">🚀</div>
          <div class="btn-text">
            {{ planet.vrReady ? 'Enter VR Experience' : 'Start Learning' }}
          </div>
        </button>
        <button
          v-else
          class="action-btn disabled"
          disabled
        >
          <div class="btn-icon">🔒</div>
          <div class="btn-text">Locked</div>
        </button>
        
        <button
          v-if="planet.unlocked && planet.vrReady"
          class="action-btn secondary"
          @click="previewVR"
        >
          <div class="btn-icon">👁️</div>
          <div class="btn-text">Preview VR</div>
        </button>
      </div>

      <!-- 統計情報 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">⏰</div>
            <div class="stat-value">{{ formatTime(estimatedTime) }}</div>
            <div class="stat-label">Est. Time</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ difficultyLevel }}</div>
            <div class="stat-label">Difficulty</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ planet.completed ? '100%' : planet.progress + '%' }}</div>
            <div class="stat-label">Mastery</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePlayerProfileStore } from '@/stores/playerProfile'

const props = defineProps({
  planet: {
    type: Object,
    default: null
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'enter-planet', 'preview-vr'])

const playerProfileStore = usePlayerProfileStore()

// 位置計算
const portalStyle = computed(() => {
  if (!props.planet) return {}
  
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    transform: 'translate(-50%, -100%)'
  }
})

// ステータス関連
const statusClass = computed(() => {
  if (!props.planet) return ''
  
  if (!props.planet.unlocked) return 'locked'
  if (props.planet.completed) return 'completed'
  if (props.planet.progress > 50) return 'advanced'
  return 'learning'
})

const statusText = computed(() => {
  if (!props.planet) return ''
  
  if (!props.planet.unlocked) return 'Locked'
  if (props.planet.completed) return 'Mastered'
  if (props.planet.progress > 50) return 'Advanced'
  return 'Learning'
})

// 惑星別スキル
const planetSkills = computed(() => {
  if (!props.planet) return []
  
  const skillMappings = {
    soundPlanet: [
      { name: 'Phonics', icon: '🔤', level: playerProfileStore.profile.skills.phonics },
      { name: 'Sound Recognition', icon: '👂', level: playerProfileStore.profile.skills.listening }
    ],
    wordPlanet: [
      { name: 'Vocabulary', icon: '📚', level: playerProfileStore.profile.skills.vocabulary },
      { name: 'Word Recognition', icon: '👁️', level: Math.round(playerProfileStore.profile.skills.vocabulary * 0.8) }
    ],
    grammarPlanet: [
      { name: 'Grammar', icon: '⚙️', level: playerProfileStore.profile.skills.grammar },
      { name: 'Sentence Structure', icon: '🏗️', level: Math.round(playerProfileStore.profile.skills.grammar * 0.9) }
    ],
    rhythmPlanet: [
      { name: 'Rhythm', icon: '🎵', level: playerProfileStore.profile.skills.rhythm },
      { name: 'Pronunciation', icon: '🗣️', level: playerProfileStore.profile.skills.pronunciation }
    ],
    blendPlanet: [
      { name: 'Blending', icon: '🌪️', level: playerProfileStore.profile.skills.blending },
      { name: 'Sound Combinations', icon: '🔗', level: Math.round(playerProfileStore.profile.skills.blending * 0.85) }
    ],
    patternPlanet: [
      { name: 'Pattern Recognition', icon: '🔮', level: Math.round(playerProfileStore.averageSkillLevel * 0.9) },
      { name: 'Advanced Phonics', icon: '🌟', level: Math.round(playerProfileStore.profile.skills.phonics * 0.95) }
    ],
    masterPlanet: [
      { name: 'Overall Mastery', icon: '👑', level: playerProfileStore.averageSkillLevel },
      { name: 'Language Fluency', icon: '🚀', level: Math.round(playerProfileStore.averageSkillLevel * 1.1) }
    ]
  }
  
  return skillMappings[props.planet.id] || []
})

// VR説明
const vrDescription = computed(() => {
  if (!props.planet) return ''
  
  if (props.planet.vrReady) {
    return 'Experience immersive 3D learning environments with spatial interactions'
  } else {
    return 'Complete more lessons to unlock VR experience'
  }
})

// 学習トピック
const learningTopics = computed(() => {
  if (!props.planet) return []
  
  const topicMappings = {
    soundPlanet: [
      'Individual phoneme recognition',
      'Sound-symbol correspondence',
      'Basic pronunciation patterns',
      'Listening discrimination skills'
    ],
    wordPlanet: [
      'High-frequency vocabulary',
      'Word recognition strategies',
      'Sight word mastery',
      'Vocabulary expansion techniques'
    ],
    grammarPlanet: [
      'Sentence structure rules',
      'Parts of speech identification',
      'Grammar pattern recognition',
      'Language mechanics'
    ],
    rhythmPlanet: [
      'Syllable and stress patterns',
      'Intonation and rhythm',
      'Natural pronunciation flow',
      'Speaking confidence building'
    ],
    blendPlanet: [
      'Consonant and vowel blending',
      'Multi-syllable word construction',
      'Advanced sound combinations',
      'Fluent reading preparation'
    ],
    patternPlanet: [
      'Complex phonics patterns',
      'Advanced spelling rules',
      'Word family recognition',
      'Reading strategy mastery'
    ],
    masterPlanet: [
      'Language integration skills',
      'Advanced communication',
      'Creative language use',
      'Native-like fluency development'
    ]
  }
  
  return topicMappings[props.planet.id] || []
})

// 解除条件の進捗
const unlockProgress = computed(() => {
  if (!props.planet || props.planet.unlocked) return null
  
  // 解除条件に基づいて現在の進捗を計算
  const requirement = props.planet.unlockRequirement
  
  if (requirement.includes('Phonics 20+')) {
    return {
      current: playerProfileStore.profile.skills.phonics,
      required: 20,
      percentage: Math.min(100, (playerProfileStore.profile.skills.phonics / 20) * 100)
    }
  } else if (requirement.includes('Vocabulary 20+')) {
    return {
      current: playerProfileStore.profile.skills.vocabulary,
      required: 20,
      percentage: Math.min(100, (playerProfileStore.profile.skills.vocabulary / 20) * 100)
    }
  } else if (requirement.includes('Grammar 20+')) {
    return {
      current: playerProfileStore.profile.skills.grammar,
      required: 20,
      percentage: Math.min(100, (playerProfileStore.profile.skills.grammar / 20) * 100)
    }
  } else if (requirement.includes('Average Skill 30+')) {
    return {
      current: playerProfileStore.averageSkillLevel,
      required: 30,
      percentage: Math.min(100, (playerProfileStore.averageSkillLevel / 30) * 100)
    }
  } else if (requirement.includes('Average Skill 50+')) {
    return {
      current: playerProfileStore.averageSkillLevel,
      required: 50,
      percentage: Math.min(100, (playerProfileStore.averageSkillLevel / 50) * 100)
    }
  } else if (requirement.includes('Average Skill 70+')) {
    return {
      current: playerProfileStore.averageSkillLevel,
      required: 70,
      percentage: Math.min(100, (playerProfileStore.averageSkillLevel / 70) * 100)
    }
  }
  
  return null
})

// 難易度レベル
const difficultyLevel = computed(() => {
  if (!props.planet) return 'Unknown'
  
  const difficultyMap = {
    soundPlanet: 'Beginner',
    wordPlanet: 'Beginner+',
    grammarPlanet: 'Intermediate',
    rhythmPlanet: 'Intermediate+',
    blendPlanet: 'Advanced',
    patternPlanet: 'Advanced+',
    masterPlanet: 'Expert'
  }
  
  return difficultyMap[props.planet.id] || 'Unknown'
})

// 推定時間
const estimatedTime = computed(() => {
  if (!props.planet) return 0
  
  const timeMap = {
    soundPlanet: 120, // 2時間
    wordPlanet: 180,  // 3時間
    grammarPlanet: 240, // 4時間
    rhythmPlanet: 150,  // 2.5時間
    blendPlanet: 200,   // 3.3時間
    patternPlanet: 300, // 5時間
    masterPlanet: 360   // 6時間
  }
  
  const baseTime = timeMap[props.planet.id] || 120
  // 進捗に応じて残り時間を計算
  return Math.round(baseTime * (1 - props.planet.progress / 100))
})

// ユーティリティ関数
const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// アクション
const enterPlanet = () => {
  emit('enter-planet', props.planet)
}

const previewVR = () => {
  emit('preview-vr', props.planet)
}
</script>

<style scoped>
.planet-preview-portal {
  position: fixed;
  z-index: 1000;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  pointer-events: none;
}

.planet-preview-portal.visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.preview-container {
  width: 320px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  color: white;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-height: 80vh;
  overflow-y: auto;
}

/* ヘッダー */
.preview-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
}

.planet-icon-large {
  font-size: 48px;
  min-width: 48px;
  animation: planet-float 3s ease-in-out infinite;
}

.planet-info {
  flex: 1;
}

.planet-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 4px 0;
  background: linear-gradient(45deg, #00ff88, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.planet-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.locked {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.status-badge.learning {
  background: rgba(100, 150, 255, 0.2);
  color: #6496ff;
}

.status-badge.advanced {
  background: rgba(255, 200, 100, 0.2);
  color: #ffc864;
}

.status-badge.completed {
  background: rgba(100, 255, 150, 0.2);
  color: #64ff96;
}

.close-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  transform: scale(1.1);
}

/* 進捗セクション */
.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.progress-value {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  background: linear-gradient(90deg, #00ff88, #4ecdc4);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s ease-in-out infinite;
}

/* セクション共通 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
}

/* スキルセクション */
.skills-section {
  margin-bottom: 20px;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.skill-icon {
  font-size: 20px;
  min-width: 24px;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.skill-level {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.skill-progress {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.skill-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #4ecdc4);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* クリスタルセクション */
.crystals-section {
  margin-bottom: 20px;
}

.crystals-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.crystal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.crystal-icon {
  font-size: 24px;
  animation: crystal-sparkle 2s ease-in-out infinite;
}

.crystal-count {
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
}

.crystal-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* VRセクション */
.vr-section {
  margin-bottom: 20px;
}

.vr-status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.vr-status-card.vr-ready {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(78, 205, 196, 0.1));
  border-color: rgba(78, 205, 196, 0.3);
}

.vr-icon {
  font-size: 24px;
  opacity: 0.7;
}

.vr-status-card.vr-ready .vr-icon {
  opacity: 1;
  animation: vr-glow 2s ease-in-out infinite;
}

.vr-info {
  flex: 1;
}

.vr-status-text {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.vr-ready .vr-status-text {
  color: #4ecdc4;
}

.vr-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
}

.vr-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.vr-indicator.ready {
  background: linear-gradient(45deg, #00ff88, #4ecdc4);
}

/* 学習ガイド */
.learning-guide {
  margin-bottom: 20px;
}

.learning-topics {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topic-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
}

.topic-bullet {
  color: #4ecdc4;
  font-weight: bold;
  min-width: 8px;
  margin-top: 2px;
}

.topic-text {
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

/* 解除条件 */
.unlock-section {
  margin-bottom: 20px;
}

.unlock-requirement {
  padding: 12px;
  background: rgba(255, 200, 100, 0.1);
  border: 1px solid rgba(255, 200, 100, 0.2);
  border-radius: 8px;
}

.requirement-text {
  font-size: 12px;
  color: #ffc864;
  margin-bottom: 8px;
}

.requirement-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 200, 100, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.requirement-progress-fill {
  height: 100%;
  background: #ffc864;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.requirement-progress-text {
  font-size: 10px;
  color: rgba(255, 200, 100, 0.8);
  text-align: center;
}

/* アクションボタン */
.action-section {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(45deg, #00ff88, #4ecdc4);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.action-btn.primary.vr-action {
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
}

.action-btn.primary.vr-action:hover {
  box-shadow: 0 8px 20px rgba(255, 107, 157, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-btn.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 14px;
}

/* 統計セクション */
.stats-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 4px;
  opacity: 0.8;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* アニメーション */
@keyframes planet-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

@keyframes progress-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes crystal-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

@keyframes vr-glow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(78, 205, 196, 0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(78, 205, 196, 0.8)); }
}

/* スクロールバー */
.preview-container::-webkit-scrollbar {
  width: 4px;
}

.preview-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.preview-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* WebXR対応クラス */
.webxr-ui-panel {
  /* WebXR UI パネルとしてマーク */
}

/* モバイル対応 */
@media (max-width: 480px) {
  .preview-container {
    width: 280px;
    padding: 15px;
  }
  
  .planet-icon-large {
    font-size: 36px;
  }
  
  .planet-title {
    font-size: 18px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>