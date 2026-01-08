<template>
  <div class="artifact-display">
    <!-- Background Effects -->
    <CosmicParticles
      :intensity="artifact?.rarity === 'legendary' ? 'galaxy' : 'high'"
      :theme="getThemeFromWing(artifact?.wingId)"
    />

    <!-- Header -->
    <div class="artifact-header">
      <button class="back-button" @click="$emit('back-to-wing')">
        <span class="back-icon">←</span>
        <span>ウィングに戻る</span>
      </button>

      <div class="artifact-info">
        <div class="artifact-icon-large">{{ artifact?.icon }}</div>
        <div class="artifact-details">
          <h1 class="artifact-title">{{ artifact?.name }}</h1>
          <p class="artifact-subtitle">{{ artifact?.description }}</p>
          <div class="artifact-meta">
            <span class="rarity-badge" :class="artifact?.rarity">
              {{ getRarityText(artifact?.rarity) }}
            </span>
            <span class="difficulty-badge">
              難易度: {{ artifact?.difficulty }}/5
            </span>
            <span class="energy-cost">
              ⚡ {{ artifact?.energyCost }} エネルギー
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress and Stats -->
    <div class="artifact-progress-panel">
      <div class="progress-item">
        <span class="progress-label">読解進行度</span>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${artifact?.progress || 0}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ artifact?.progress || 0 }}%</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <span class="stat-value">{{ artifact?.bestScore || 0 }}</span>
            <span class="stat-label">最高スコア</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value">{{ artifact?.estimatedTime }}分</span>
            <span class="stat-label">推定時間</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <span class="stat-value">{{ readingSections.length }}</span>
            <span class="stat-label">セクション数</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🌟</div>
          <div class="stat-content">
            <span class="stat-value">{{ artifact?.bonusMultiplier || 1 }}x</span>
            <span class="stat-label">ボーナス倍率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reading Sections -->
    <div class="reading-sections">
      <h3 class="sections-title">読解セクション</h3>
      <div class="sections-grid">
        <div
          v-for="(section, index) in readingSections"
          :key="section.id"
          class="section-card"
          :class="{
            'completed': section.completed,
            'current': currentSection === index,
            'locked': !section.unlocked
          }"
          @click="selectSection(section, index)"
        >
          <div class="section-number">{{ index + 1 }}</div>
          <div class="section-content">
            <h4 class="section-title">{{ section.title }}</h4>
            <p class="section-description">{{ section.description }}</p>
            <div class="section-meta">
              <span class="section-length">{{ section.content?.length || 0 }} 文字</span>
              <span class="section-points">+{{ section.points }} pt</span>
            </div>
          </div>
          <div class="section-status">
            <span v-if="section.completed" class="status-icon completed">✅</span>
            <span v-else-if="!section.unlocked" class="status-icon locked">🔒</span>
            <span v-else class="status-icon available">📖</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Panel -->
    <div class="action-panel">
      <div class="action-buttons">
        <button
          class="action-button primary"
          :disabled="!canStartReading"
          @click="startReading"
        >
          <span v-if="artifact?.progress > 0">📖 読解を続ける</span>
          <span v-else>🔍 読解を開始</span>
        </button>

        <button
          v-if="artifact?.completed"
          class="action-button secondary"
          @click="reviewArtifact"
        >
          📋 復習する
        </button>

        <button
          class="action-button info"
          @click="showHints = !showHints"
        >
          💡 ヒント {{ showHints ? '非表示' : '表示' }}
        </button>
      </div>

      <!-- Energy Warning -->
      <div v-if="!hasEnoughEnergy" class="energy-warning">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">
          エネルギーが不足しています。{{ artifact?.energyCost }} 必要（現在: {{ currentEnergy }}）
        </span>
      </div>
    </div>

    <!-- Hints Panel -->
    <div v-if="showHints" class="hints-panel">
      <h4 class="hints-title">💡 読解のヒント</h4>
      <div class="hints-list">
        <div
          v-for="hint in artifact?.hints"
          :key="hint.id"
          class="hint-item"
        >
          <div class="hint-icon">{{ hint.icon }}</div>
          <div class="hint-content">
            <h5 class="hint-title">{{ hint.title }}</h5>
            <p class="hint-description">{{ hint.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Preview -->
    <div v-if="potentialAchievements.length > 0" class="achievements-preview">
      <h4 class="achievements-title">🏆 獲得可能な実績</h4>
      <div class="achievements-grid">
        <div
          v-for="achievement in potentialAchievements"
          :key="achievement.id"
          class="achievement-card"
        >
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <h5 class="achievement-name">{{ achievement.name }}</h5>
            <p class="achievement-description">{{ achievement.description }}</p>
            <div class="achievement-reward">{{ achievement.reward }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Effects -->
    <StarBurst
      v-if="showSuccessEffect"
      :trigger="showSuccessEffect"
      :type="getStarBurstType(artifact?.rarity)"
      :position="burstPosition"
      :intensity="artifact?.rarity === 'legendary' ? 'epic' : 'normal'"
      @complete="showSuccessEffect = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGrammarArtGalleryStore } from '@/stores/grammarArtGalleryStore'
import CosmicParticles from '../effects/CosmicParticles.vue'
import StarBurst from '../effects/StarBurst.vue'

const store = useGrammarArtGalleryStore()

const props = defineProps({
  artifactId: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'back-to-wing',
  'start-reading',
  'section-selected'
])

// Reactive state
const showHints = ref(false)
const showSuccessEffect = ref(false)
const burstPosition = ref({ x: 50, y: 50 })
const currentSection = ref(0)

// Computed properties
const artifact = computed(() => {
  const result = store.getArtifactById(props.artifactId)
  console.log('Artifact data:', result)
  return result
})

const readingSections = computed(() =>
  artifact.value?.readingSections || []
)

const currentEnergy = computed(() => store.playerStats.energy)

const hasEnoughEnergy = computed(() => {
  const energyCost = artifact.value?.energyCost || 0
  const enough = currentEnergy.value >= energyCost
  console.log('Energy check - current:', currentEnergy.value, 'cost:', energyCost, 'enough:', enough)
  return enough
})

const canStartReading = computed(() => {
  const result = hasEnoughEnergy.value && artifact.value?.unlocked
  console.log('canStartReading result:', result, 'energy:', hasEnoughEnergy.value, 'unlocked:', artifact.value?.unlocked)
  return result
})

const potentialAchievements = computed(() => {
  if (!artifact.value || !store.artifacts) return []

  try {
    // storeにachievements.availableがない場合は空配列を返す
    const achievements = store.artifacts?.globalSettings?.achievements || {}
    const availableAchievements = Object.values(achievements).filter(achievement => achievement && typeof achievement === 'object')

    return availableAchievements.filter(achievement =>
      achievement.condition?.artifactId === artifact.value.id ||
      (achievement.condition?.type === 'artifact_completion' &&
       achievement.condition?.rarity === artifact.value.rarity)
    )
  } catch (error) {
    console.warn('Error loading achievements:', error)
    return []
  }
})

// Methods
function getThemeFromWing(wingId) {
  const themeMap = {
    'classical': 'cosmic',
    'modern': 'energy',
    'mystical': 'mystical'
  }
  return themeMap[wingId] || 'cosmic'
}

function getRarityText(rarity) {
  const rarityMap = {
    common: '一般',
    rare: 'レア',
    epic: 'エピック',
    legendary: '伝説'
  }
  return rarityMap[rarity] || '一般'
}

function getStarBurstType(rarity) {
  const typeMap = {
    common: 'success',
    rare: 'achievement',
    epic: 'energy',
    legendary: 'magic'
  }
  return typeMap[rarity] || 'success'
}

function selectSection(section, index) {
  if (!section.unlocked) return

  currentSection.value = index
  emit('section-selected', section, index)
}

function startReading() {
  if (!canStartReading.value) return

  // storeでゲーム状態を更新
  store.startArtifactReading(artifact.value.id)
  store.consumeEnergy(artifact.value.energyCost)
  emit('start-reading', artifact.value)
}

function reviewArtifact() {
  emit('start-reading', artifact.value, { reviewMode: true })
}

function triggerSuccessEffect(position = { x: 50, y: 50 }) {
  burstPosition.value = position
  showSuccessEffect.value = true

  setTimeout(() => {
    showSuccessEffect.value = false
  }, 100)
}

// Expose methods for parent components
defineExpose({
  triggerSuccessEffect
})

// Lifecycle
onMounted(() => {
  if (artifact.value) {
    store.viewArtifact(artifact.value.id)

    // Find current section based on progress
    const progressPerSection = 100 / readingSections.value.length
    currentSection.value = Math.floor((artifact.value.progress || 0) / progressPerSection)
  }
})

// Watch for achievement unlocks
const unsubscribe = store.$onAction(({ name, args, after }) => {
  if (name === 'unlockAchievement') {
    after(() => {
      triggerSuccessEffect()
    })
  }
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<style scoped>
.artifact-display {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #2d1b69 100%);
  color: #ffffff;
  padding: 2rem;
  overflow-x: hidden;
}

.artifact-header {
  position: relative;
  z-index: 10;
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.2rem;
}

.artifact-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.artifact-icon-large {
  font-size: 5rem;
  filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.6));
}

.artifact-details {
  flex: 1;
}

.artifact-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.artifact-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.artifact-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.rarity-badge,
.difficulty-badge,
.energy-cost {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
}

.rarity-badge.common {
  background: rgba(156, 163, 175, 0.3);
  color: #d1d5db;
}

.rarity-badge.rare {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.rarity-badge.epic {
  background: rgba(168, 85, 247, 0.3);
  color: #a78bfa;
}

.rarity-badge.legendary {
  background: linear-gradient(45deg, #f59e0b, #eab308);
  color: #ffffff;
}

.difficulty-badge {
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.energy-cost {
  background: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.artifact-progress-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.progress-item {
  margin-bottom: 1.5rem;
}

.progress-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-text {
  font-weight: 600;
  color: #4ade80;
  min-width: 50px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4ade80;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.reading-sections {
  margin-bottom: 2rem;
}

.sections-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  text-align: center;
  color: #a855f7;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.section-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
}

.section-card.completed {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.section-card.current {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.section-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.section-content {
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.section-description {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0 0 0.5rem 0;
}

.section-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.section-points {
  color: #4ade80;
  font-weight: 600;
}

.section-status {
  font-size: 1.5rem;
}

.status-icon.completed {
  color: #4ade80;
}

.status-icon.locked {
  color: #6b7280;
}

.status-icon.available {
  color: #f59e0b;
}

.action-panel {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.primary {
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #ffffff;
}

.action-button.secondary {
  background: rgba(168, 85, 247, 0.8);
  color: #ffffff;
}

.action-button.info {
  background: rgba(59, 130, 246, 0.8);
  color: #ffffff;
}

.action-button:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.action-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.energy-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  padding: 0.75rem;
  color: #fca5a5;
}

.warning-icon {
  font-size: 1.2rem;
}

.hints-panel {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.hints-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #60a5fa;
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hint-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
}

.hint-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hint-content {
  flex: 1;
}

.hint-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.hint-description {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.4;
}

.achievements-preview {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.achievements-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #fbbf24;
  text-align: center;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1rem;
}

.achievement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.achievement-description {
  font-size: 0.8rem;
  opacity: 0.9;
  margin: 0 0 0.25rem 0;
}

.achievement-reward {
  font-size: 0.8rem;
  color: #4ade80;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .artifact-display {
    padding: 1rem;
  }

  .artifact-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .section-card,
  .action-button {
    transition: none;
  }

  .progress-fill {
    transition: none;
  }
}
</style>