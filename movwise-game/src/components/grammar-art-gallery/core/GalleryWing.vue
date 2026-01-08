<template>
  <div class="gallery-wing">
    <!-- Background Effects -->
    <CosmicParticles
      :intensity="wingData?.theme === 'mystical' ? 'galaxy' : 'high'"
      :theme="wingData?.theme || 'cosmic'"
    />

    <!-- Wing Header -->
    <div class="wing-header">
      <button class="back-button" @click="$emit('back-to-entrance')">
        <span class="back-icon">←</span>
        <span>ギャラリー入口に戻る</span>
      </button>

      <div class="wing-title">
        <div class="wing-icon">{{ wingData?.icon }}</div>
        <div class="wing-info">
          <h1 class="wing-name">{{ wingData?.name }}</h1>
          <p class="wing-description">{{ wingData?.description }}</p>
          <div class="wing-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${wingProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ completedArtifacts }}/{{ totalArtifacts }} 完了</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Wing Status Panel -->
    <div class="wing-status">
      <div class="status-item">
        <span class="status-label">エネルギー</span>
        <div class="energy-display">
          <div class="energy-bar">
            <div
              class="energy-fill"
              :style="{ width: `${(currentEnergy / maxEnergy) * 100}%` }"
            ></div>
          </div>
          <span class="energy-text">{{ currentEnergy }}/{{ maxEnergy }}</span>
        </div>
      </div>

      <div class="status-item">
        <span class="status-label">発見したアーティファクト</span>
        <span class="status-value">{{ discoveredCount }}</span>
      </div>

      <div class="status-item">
        <span class="status-label">獲得ポイント</span>
        <span class="status-value">{{ totalPoints }}</span>
      </div>
    </div>

    <!-- Artifacts Grid -->
    <div class="artifacts-grid">
      <div
        v-for="artifact in wingArtifacts"
        :key="artifact.id"
        class="artifact-card"
        :class="{
          'locked': !artifact.unlocked,
          'completed': artifact.completed,
          'active': artifact.discovered && !artifact.completed,
          'legendary': artifact.rarity === 'legendary'
        }"
        @click="selectArtifact(artifact)"
      >
        <!-- Artifact Lock Overlay -->
        <div v-if="!artifact.unlocked" class="lock-overlay">
          <div class="lock-icon">🔒</div>
          <p class="unlock-requirement">
            {{ getUnlockRequirement(artifact) }}
          </p>
        </div>

        <!-- Artifact Content -->
        <div class="artifact-content">
          <div class="artifact-header">
            <div class="artifact-icon">{{ artifact.icon }}</div>
            <div class="artifact-rarity" :class="artifact.rarity">
              {{ getRarityText(artifact.rarity) }}
            </div>
          </div>

          <h3 class="artifact-name">{{ artifact.name }}</h3>
          <p class="artifact-description">{{ artifact.description }}</p>

          <div class="artifact-stats">
            <div class="stat-item">
              <span class="stat-label">難易度</span>
              <div class="difficulty-stars">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="star"
                  :class="{ active: n <= artifact.difficulty }"
                >⭐</span>
              </div>
            </div>

            <div class="stat-item">
              <span class="stat-label">推定時間</span>
              <span class="stat-value">{{ artifact.estimatedTime }}分</span>
            </div>

            <div v-if="artifact.completed" class="stat-item">
              <span class="stat-label">最高スコア</span>
              <span class="stat-value">{{ artifact.bestScore || 0 }}</span>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div v-if="artifact.discovered" class="artifact-progress">
            <div class="progress-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path
                  class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="circle"
                  :stroke-dasharray="`${artifact.progress || 0}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="progress-text">{{ artifact.progress || 0 }}%</div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            class="artifact-action"
            :disabled="!artifact.unlocked || currentEnergy < artifact.energyCost"
            @click.stop="startArtifact(artifact)"
          >
            <span v-if="!artifact.unlocked">🔒 ロック中</span>
            <span v-else-if="currentEnergy < artifact.energyCost">
              ⚡ エネルギー不足 ({{ artifact.energyCost }}必要)
            </span>
            <span v-else-if="artifact.completed">✅ 再挑戦</span>
            <span v-else-if="artifact.discovered">📖 続きを読む</span>
            <span v-else>🔍 発見する</span>
          </button>
        </div>

        <!-- Completion Effects -->
        <StarBurst
          v-if="artifact.completed"
          :trigger="false"
          :type="getStarBurstType(artifact.rarity)"
          :position="{ x: 50, y: 50 }"
          :intensity="artifact.rarity === 'legendary' ? 'epic' : 'normal'"
        />
      </div>
    </div>

    <!-- Wing Special Features -->
    <div v-if="wingData?.specialFeatures" class="special-features">
      <h3 class="features-title">特別機能</h3>
      <div class="features-grid">
        <div
          v-for="feature in wingData.specialFeatures"
          :key="feature.id"
          class="feature-card"
          :class="{ unlocked: isFeatureUnlocked(feature) }"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h4 class="feature-name">{{ feature.name }}</h4>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-unlock">
            <span v-if="isFeatureUnlocked(feature)" class="unlocked-text">✅ 解放済み</span>
            <span v-else class="locked-text">{{ feature.unlockCondition }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Footer -->
    <div class="wing-footer">
      <button
        class="nav-button prev"
        @click="navigateWing('prev')"
        :disabled="!canNavigatePrev"
      >
        ← 前のウィング
      </button>

      <div class="wing-indicator">
        <span class="current-wing">{{ currentWingIndex + 1 }}</span>
        <span class="wing-separator">/</span>
        <span class="total-wings">{{ totalWings }}</span>
      </div>

      <button
        class="nav-button next"
        @click="navigateWing('next')"
        :disabled="!canNavigateNext"
      >
        次のウィング →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGrammarArtGalleryStore } from '@/stores/grammarArtGalleryStore'
import CosmicParticles from '../effects/CosmicParticles.vue'
import StarBurst from '../effects/StarBurst.vue'

const store = useGrammarArtGalleryStore()

const props = defineProps({
  wingId: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'back-to-entrance',
  'artifact-selected',
  'wing-changed'
])

// Computed properties
const wingData = computed(() =>
  store.artifacts.wings?.find(wing => wing.id === props.wingId)
)

const wingArtifacts = computed(() => {
  if (!wingData.value?.artifacts) return []

  return wingData.value.artifacts.map(artifact => ({
    ...artifact,
    unlocked: store.isArtifactUnlocked(artifact.id),
    discovered: store.getArtifactProgress(artifact.id).completed || store.isArtifactUnlocked(artifact.id),
    completed: store.getArtifactProgress(artifact.id).completed,
    progress: store.getArtifactProgress(artifact.id).stars * 33.33, // Convert stars to percentage
    energyCost: artifact.energyLevel || 0,
    name: artifact.title,
    description: artifact.subtitle,
    estimatedTime: artifact.estimatedTime?.replace('分', ''),
    difficulty: getDifficultyLevel(artifact.difficulty),
    rarity: 'common', // Default rarity
    icon: '📚' // Default icon
  }))
})

const wingProgress = computed(() => {
  if (!wingArtifacts.value.length) return 0
  const completed = wingArtifacts.value.filter(a => a.completed).length
  return Math.round((completed / wingArtifacts.value.length) * 100)
})

const completedArtifacts = computed(() =>
  wingArtifacts.value.filter(a => a.completed).length
)

const totalArtifacts = computed(() =>
  wingArtifacts.value.length
)

const discoveredCount = computed(() =>
  wingArtifacts.value.filter(a => a.discovered).length
)

const totalPoints = computed(() =>
  wingArtifacts.value.reduce((sum, a) => sum + (a.pointsEarned || 0), 0)
)

const currentEnergy = computed(() => store.playerStats.energy)
const maxEnergy = computed(() => store.playerStats.maxEnergy)

const currentWingIndex = computed(() =>
  store.artifacts.wings?.findIndex(wing => wing.id === props.wingId) || 0
)

const totalWings = computed(() =>
  store.artifacts.wings?.length || 0
)

const canNavigatePrev = computed(() => currentWingIndex.value > 0)
const canNavigateNext = computed(() => currentWingIndex.value < totalWings.value - 1)

// Methods
function getDifficultyLevel(difficulty) {
  const difficultyMap = {
    'beginner': 1,
    'elementary': 2,
    'intermediate': 3,
    'advanced': 4,
    'expert': 5
  }
  return difficultyMap[difficulty] || 1
}

function selectArtifact(artifact) {
  if (!artifact.unlocked) return
  emit('artifact-selected', artifact)
}

function startArtifact(artifact) {
  if (!artifact.unlocked || currentEnergy.value < artifact.energyCost) return

  store.startArtifactReading(artifact.id)
  emit('artifact-selected', artifact)
}

function getUnlockRequirement(artifact) {
  if (artifact.unlockCondition?.type === 'previousArtifact') {
    const prevArtifact = wingArtifacts.value.find(a => a.id === artifact.unlockCondition.artifactId)
    return `"${prevArtifact?.name}" を完了`
  }
  if (artifact.unlockCondition?.type === 'totalScore') {
    return `合計 ${artifact.unlockCondition.score} ポイント必要`
  }
  if (artifact.unlockCondition?.type === 'wingProgress') {
    return `ウィング進行度 ${artifact.unlockCondition.percentage}% 必要`
  }
  return '条件を満たしていません'
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

function isFeatureUnlocked(feature) {
  if (feature.unlockCondition?.type === 'wingCompletion') {
    return wingProgress.value >= feature.unlockCondition.percentage
  }
  if (feature.unlockCondition?.type === 'artifactCount') {
    return completedArtifacts.value >= feature.unlockCondition.count
  }
  return false
}

function navigateWing(direction) {
  const wings = store.artifacts.wings
  if (!wings) return

  let newIndex = currentWingIndex.value
  if (direction === 'prev' && canNavigatePrev.value) {
    newIndex--
  } else if (direction === 'next' && canNavigateNext.value) {
    newIndex++
  }

  if (newIndex !== currentWingIndex.value) {
    const newWing = wings[newIndex]
    emit('wing-changed', newWing.id)
  }
}

onMounted(() => {
  store.visitWing(props.wingId)
})
</script>

<style scoped>
.gallery-wing {
  position: relative;
  min-height: 100vh;
  background: #0F172A;
  background-image: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  color: #ffffff;
  padding: 2rem;
  overflow-x: hidden;
  z-index: 2;
}

.wing-header {
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
  margin-bottom: 1rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-5px);
}

.back-icon {
  font-size: 1.2rem;
}

.wing-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.wing-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
}

.wing-info {
  flex: 1;
}

.wing-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.wing-description {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
}

.wing-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-weight: 600;
  color: #4ade80;
}

.wing-status {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #1E293B;
  border: 2px solid #475569;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.status-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4ade80;
}

.energy-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.energy-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #eab308);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.energy-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.artifacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.artifact-card {
  position: relative;
  background: #1E293B;
  background-image: linear-gradient(135deg, #1E293B 0%, #334155 100%);
  border: 2px solid #475569;
  border-radius: 20px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.artifact-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.artifact-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.artifact-card.completed {
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.artifact-card.legendary {
  border-color: #a855f7;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1));
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.unlock-requirement {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.9;
}

.artifact-content {
  position: relative;
  z-index: 1;
}

.artifact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.artifact-icon {
  font-size: 2.5rem;
}

.artifact-rarity {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.artifact-rarity.common {
  background: rgba(156, 163, 175, 0.3);
  color: #d1d5db;
}

.artifact-rarity.rare {
  background: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}

.artifact-rarity.epic {
  background: rgba(168, 85, 247, 0.3);
  color: #a78bfa;
}

.artifact-rarity.legendary {
  background: linear-gradient(45deg, #f59e0b, #eab308);
  color: #ffffff;
}

.artifact-name {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  color: #ffffff;
}

.artifact-description {
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.artifact-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.stat-value {
  font-weight: 600;
  color: #4ade80;
}

.difficulty-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.8rem;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.star.active {
  opacity: 1;
}

.artifact-progress {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.progress-circle {
  position: relative;
  width: 60px;
  height: 60px;
}

.circular-chart {
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
}

.circle {
  fill: none;
  stroke: #4ade80;
  stroke-width: 2;
  stroke-linecap: round;
  animation: progress 1s ease-in-out forwards;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: #4ade80;
}

.artifact-action {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #ffffff;
}

.artifact-action:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.artifact-action:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.3);
}

.special-features {
  margin-bottom: 3rem;
}

.features-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  text-align: center;
  color: #a855f7;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card.unlocked {
  border-color: #a855f7;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feature-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.feature-description {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0 0 0.5rem 0;
}

.unlocked-text {
  color: #4ade80;
  font-weight: 600;
}

.locked-text {
  color: #f59e0b;
  font-size: 0.8rem;
}

.wing-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.current-wing {
  color: #4ade80;
}

.wing-separator {
  opacity: 0.6;
}

.total-wings {
  opacity: 0.8;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .gallery-wing {
    padding: 1rem;
  }

  .artifacts-grid {
    grid-template-columns: 1fr;
  }

  .wing-title {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .wing-status {
    flex-direction: column;
    gap: 1rem;
  }

  .wing-footer {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .artifact-card,
  .nav-button,
  .artifact-action {
    transition: none;
  }

  .circle {
    animation: none;
  }
}
</style>