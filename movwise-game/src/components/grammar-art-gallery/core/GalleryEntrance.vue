<template>
  <div class="gallery-entrance">
    <!-- Cosmic Background Particles -->
    <CosmicParticles :intensity="particleIntensity" theme="cosmic" />

    <!-- Galaxy Map Button at Top -->
    <button
      @click="goBack"
      class="galaxy-map-button cosmic-glow"
      title="銀河マップに戻る"
    >
      <span class="back-icon">🌌</span>
      <span class="back-text">Galaxy Map</span>
    </button>

    <!-- Header Navigation -->
    <header class="cosmic-header">
      <div class="header-content">
        <div class="gallery-title-section">
          <h1 class="gallery-title">
            <span class="title-icon cosmic-pulse">🏛️</span>
            <span class="title-text">宇宙文法ギャラリー</span>
            <div class="title-subtitle">古代言語アーティファクト博物館</div>
          </h1>
        </div>

        <div class="header-stats">
          <div class="stat-card energy-card" :style="{ 'background-color': '#0F172A', background: '#0F172A', border: '2px solid #475569', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)', 'z-index': '10', position: 'relative' }">
            <span class="stat-icon">⚡</span>
            <div class="stat-info">
              <div class="stat-label">宇宙エネルギー</div>
              <div class="energy-display">
                <div class="energy-bar">
                  <div
                    class="energy-fill"
                    :style="{ width: `${energyPercentage}%` }"
                  ></div>
                </div>
                <span class="energy-text">
                  {{ store.playerStats.energy }}/{{ store.playerStats.maxEnergy }}
                </span>
              </div>
            </div>
          </div>

          <div class="stat-card rank-card" :style="{ 'background-color': '#0F172A', background: '#0F172A', border: '2px solid #475569', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)', 'z-index': '10', position: 'relative' }">
            <span class="stat-icon">🎖️</span>
            <div class="stat-info">
              <div class="stat-label">探検家ランク</div>
              <div class="stat-value rank-value">{{ store.playerStats.explorerRank }}</div>
            </div>
          </div>

          <div class="stat-card level-card" :style="{ 'background-color': '#0F172A', background: '#0F172A', border: '2px solid #475569', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8)', 'z-index': '10', position: 'relative' }">
            <span class="stat-icon">🌟</span>
            <div class="stat-info">
              <div class="stat-label">レベル {{ store.playerStats.level }}</div>
              <div class="level-progress">
                <div class="level-bar">
                  <div
                    class="level-fill"
                    :style="{ width: `${levelProgress}%` }"
                  ></div>
                </div>
                <span class="exp-text">{{ store.playerStats.experiencePoints }} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Explorer Info Panel -->
    <section class="explorer-panel">
      <div class="panel-content compact-panel" :style="{ 'background-color': '#0F172A', 'background': '#0F172A', 'border': '2px solid #475569', 'box-shadow': '0 12px 40px rgba(0, 0, 0, 0.8)', 'opacity': '1', 'z-index': '10', 'position': 'relative', 'max-width': '600px', 'margin': '0 auto', 'padding': '1.5rem' }">
        <div class="explorer-info">
          <h2 class="explorer-name">キャプテン {{ playerName }}</h2>
          <div class="explorer-stats">
            <div class="stat-item">
              <span class="label">🏆 収集したアーティファクト:</span>
              <span class="value highlight">{{ store.playerStats.artifactsCollected }}/{{ totalArtifacts }}</span>
            </div>
            <div class="stat-item">
              <span class="label">💎 星の宝石:</span>
              <span class="value gems">{{ store.playerStats.stellarGems.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="label">📜 文法カード:</span>
              <span class="value cards">{{ store.playerStats.grammarCards.length }}</span>
            </div>
          </div>
        </div>

        <div class="mission-objective">
          <h3 class="objective-title">🎯 現在のミッション</h3>
          <p class="objective-text">{{ currentObjective }}</p>
          <div class="progress-indicator">
            <div class="progress-bar-small">
              <div
                class="progress-fill"
                :style="{ width: `${totalProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ totalProgress }}% 完了</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Wings Gallery -->
    <section class="wings-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🗺️</span>
          銀河マップ - 展示ウィング
        </h2>
        <p class="section-description">
          古代文明を探索し、宇宙全体の言語の謎を解き明かそう
        </p>
      </div>

      <div class="wings-grid">
        <div
          v-for="wing in wings"
          :key="wing.id"
          class="wing-card"
          :class="{
            locked: !isWingUnlocked(wing.id),
            completed: isWingCompleted(wing.id),
            current: currentWing === wing.id
          }"
          @click="selectWing(wing.id)"
          :style="{
            'background-color': '#0F172A',
            'background': '#0F172A',
            'border': '2px solid #475569',
            'box-shadow': '0 12px 40px rgba(0, 0, 0, 0.8)',
            'opacity': '1',
            'z-index': '10',
            'position': 'relative'
          }"
        >
          <!-- Wing Background Effect -->
          <div class="wing-background" :style="{ backgroundColor: 'transparent', display: 'none' }"></div>

          <!-- Lock Overlay -->
          <div v-if="!isWingUnlocked(wing.id)" class="locked-overlay">
            <div class="lock-container">
              <span class="lock-icon">🔒</span>
              <p class="lock-text">⭐{{ wing.requiredStars }} 必要</p>
              <div v-if="wing.cosmicEnergyCost > 0" class="energy-cost">
                <span class="cost-icon">⚡</span>
                <span class="cost-text">{{ wing.cosmicEnergyCost }} エネルギー</span>
              </div>
            </div>
          </div>

          <!-- Wing Content -->
          <div class="wing-content">
            <div class="wing-header">
              <div class="wing-icon" :style="{ color: wing.themeColor }">
                {{ wing.planetIcon }}
              </div>
              <div class="wing-info">
                <h3 class="wing-name">{{ wing.name }}</h3>
                <p class="wing-level">{{ wing.level }}</p>
                <p class="wing-description">{{ wing.description }}</p>
              </div>
            </div>

            <div v-if="isWingUnlocked(wing.id)" class="wing-progress">
              <div class="progress-section">
                <div class="stars-display">
                  <span class="stars-earned">{{ getWingStars(wing.id) }}</span>
                  <span class="stars-separator">/</span>
                  <span class="stars-total">{{ getWingMaxStars(wing.id) }}</span>
                  <span class="star-icon">⭐</span>
                </div>
                <div class="completion-text">
                  {{ getWingProgress(wing.id) }}% 完了
                </div>
              </div>

              <div class="artifacts-preview">
                <h4 class="preview-title">アーティファクト</h4>
                <div class="artifact-icons">
                  <div
                    v-for="(artifact, index) in wing.artifacts.slice(0, 3)"
                    :key="artifact.id"
                    class="artifact-icon"
                    :class="{
                      completed: getArtifactProgress(artifact.id).stars > 0,
                      unlocked: store.isArtifactUnlocked(artifact.id)
                    }"
                    :title="artifact.title"
                  >
                    {{ artifact.energyLevel }}
                  </div>
                  <div v-if="wing.artifacts.length > 3" class="more-artifacts">
                    +{{ wing.artifacts.length - 3 }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wing Action Button -->
          <div v-if="isWingUnlocked(wing.id)" class="wing-action">
            <button class="explore-button" :style="{ backgroundColor: wing.themeColor }">
              <span class="button-icon">🚀</span>
              <span class="button-text">探索</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Spaceship Upgrades Section -->
    <section class="upgrades-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔧</span>
          宇宙船アップグレード
        </h2>
      </div>

      <div class="upgrades-grid">
        <div
          v-for="(upgrade, upgradeType) in store.spaceshipUpgrades"
          :key="upgradeType"
          class="upgrade-card"
          :class="{ maxed: upgrade.level >= upgrade.maxLevel }"
        >
          <div class="upgrade-header">
            <span class="upgrade-icon">{{ getUpgradeIcon(upgradeType) }}</span>
            <h3 class="upgrade-name">{{ getUpgradeName(upgradeType) }}</h3>
          </div>

          <div class="upgrade-level">
            <div class="level-display">
              レベル {{ upgrade.level }}/{{ upgrade.maxLevel }}
            </div>
            <div class="level-bars">
              <div
                v-for="i in upgrade.maxLevel"
                :key="i"
                class="level-bar"
                :class="{ active: i <= upgrade.level }"
              ></div>
            </div>
          </div>

          <div class="upgrade-effect">
            <p class="effect-text">{{ upgrade.effects[upgrade.level - 1] }}</p>
          </div>

          <button
            v-if="upgrade.level < upgrade.maxLevel"
            @click="upgradeSpaceship(upgradeType)"
            class="upgrade-button"
            :disabled="store.playerStats.stellarGems < upgrade.costs[upgrade.level - 1]"
          >
            <span class="cost-icon">💎</span>
            <span class="cost-value">{{ upgrade.costs[upgrade.level - 1].toLocaleString() }}</span>
          </button>

          <div v-else class="maxed-indicator">
            <span class="maxed-icon">✨</span>
            <span class="maxed-text">MAXED</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Achievement Showcase -->
    <section v-if="recentAchievements.length > 0" class="achievements-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🏆</span>
          最近の実績
        </h2>
      </div>

      <div class="achievements-grid">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-card"
        >
          <span class="achievement-icon">{{ achievement.icon }}</span>
          <h3 class="achievement-name">{{ achievement.name }}</h3>
          <p class="achievement-description">{{ achievement.description }}</p>
        </div>
      </div>
    </section>

    <!-- Star Burst Effects -->
    <StarBurst
      v-for="burst in activeBursts"
      :key="burst.id"
      :trigger="burst.trigger"
      :type="burst.type"
      :position="burst.position"
      :intensity="burst.intensity"
      @complete="removeBurst(burst.id)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGrammarArtGalleryStore } from '@/stores/grammarArtGalleryStore'
import CosmicParticles from '../effects/CosmicParticles.vue'
import StarBurst from '../effects/StarBurst.vue'
import artifactsData from '@/data/grammar-art-gallery/artifacts.json'

const emit = defineEmits(['wing-selected', 'energy-barriers', 'spaceship-upgrade'])
const router = useRouter()
const store = useGrammarArtGalleryStore()

const particleIntensity = ref('normal')
const activeBursts = ref([])
const currentWing = ref(null)

const playerName = computed(() => '探検家') // TODO: 実際のユーザー名を取得

const wings = computed(() =>
  artifactsData.wings.map(wing => ({
    ...wing,
    planetIcon: wing.planetIcon || '🪐'
  }))
)

const energyPercentage = computed(() => store.energyPercentage)
const levelProgress = computed(() => store.currentLevelProgress)
const totalProgress = computed(() => store.totalProgress)

const totalArtifacts = computed(() => {
  return artifactsData.wings.reduce((sum, wing) => sum + wing.artifacts.length, 0)
})

const currentObjective = computed(() => {
  const unlockedWingsCount = store.unlockedWings.length
  const totalWings = artifactsData.wings.length

  if (unlockedWingsCount === 1) {
    return "Complete your first wing to unlock new territories"
  } else if (unlockedWingsCount < totalWings) {
    return `スターを獲得してあと${totalWings - unlockedWingsCount}個のウィングをアンロック`
  } else {
    return "すべてのアーティファクトをマスターして文法宇宙探索家になろう"
  }
})

const recentAchievements = computed(() => {
  return store.playerStats.achievementsUnlocked
    .slice(-3)
    .map(id => artifactsData.globalSettings.achievements[id])
    .filter(Boolean)
})

function isWingUnlocked(wingId) {
  return store.unlockedWings.includes(wingId)
}

function isWingCompleted(wingId) {
  const wing = wings.value.find(w => w.id === wingId)
  if (!wing) return false

  return wing.artifacts.every(artifact => {
    const progress = store.getArtifactProgress(artifact.id)
    return progress.stars > 0
  })
}

function getWingStars(wingId) {
  const wing = wings.value.find(w => w.id === wingId)
  if (!wing) return 0

  return wing.artifacts.reduce((sum, artifact) => {
    const progress = store.getArtifactProgress(artifact.id)
    return sum + (progress.stars || 0)
  }, 0)
}

function getWingMaxStars(wingId) {
  const wing = wings.value.find(w => w.id === wingId)
  return wing ? wing.artifacts.length * 3 : 0
}

function getWingProgress(wingId) {
  const wing = wings.value.find(w => w.id === wingId)
  if (!wing || wing.artifacts.length === 0) return 0

  const completed = wing.artifacts.filter(a => {
    const progress = store.getArtifactProgress(a.id)
    return progress.stars > 0
  }).length

  return Math.round((completed / wing.artifacts.length) * 100)
}

function getArtifactProgress(artifactId) {
  return store.getArtifactProgress(artifactId)
}

function selectWing(wingId) {
  console.log('selectWing called with:', wingId)
  const wing = wings.value.find(w => w.id === wingId)
  if (!wing) {
    console.log('Wing not found:', wingId)
    return
  }

  console.log('Wing found:', wing)
  console.log('Is wing unlocked:', isWingUnlocked(wingId))

  if (!isWingUnlocked(wingId)) {
    // Show lock message
    console.log('Wing is locked, showing notification')
    alert(`このウィングのアンロックには⭐${wing.requiredStars}個必要です！`)
    return
  }

  if (wing.cosmicEnergyCost > store.playerStats.cosmicEnergy) {
    alert(`宇宙エネルギーが不足です！${wing.cosmicEnergyCost}エネルギーが必要です。`)
    return
  }

  // Consume energy for wing entry
  if (wing.cosmicEnergyCost > 0) {
    store.consumeEnergy(wing.cosmicEnergyCost)
  }

  // Trigger entrance effect
  triggerStarBurst('energy', { x: 400, y: 300 })

  setTimeout(() => {
    emit('wing-selected', wingId)
  }, 500)
}

function upgradeSpaceship(upgradeType) {
  const success = store.upgradeSpaceship(upgradeType)

  if (success) {
    triggerStarBurst('achievement', { x: 600, y: 400 })
    createNotification('success', `${getUpgradeName(upgradeType)}をアップグレードしました！`)
  } else {
    createNotification('error', '星の宝石が不足です！')
  }
}

function getUpgradeIcon(upgradeType) {
  const icons = {
    scanner: '🔭',
    energyShield: '🛡️',
    translationCore: '🧠'
  }
  return icons[upgradeType] || '🔧'
}

function getUpgradeName(upgradeType) {
  const names = {
    scanner: '量子スキャナー',
    energyShield: 'エネルギーシールド',
    translationCore: '翻訳コア'
  }
  return names[upgradeType] || upgradeType
}

function triggerStarBurst(type, position, intensity = 'normal') {
  const burstId = Date.now() + Math.random()
  activeBursts.value.push({
    id: burstId,
    trigger: true,
    type,
    position,
    intensity
  })
}

function removeBurst(burstId) {
  const index = activeBursts.value.findIndex(b => b.id === burstId)
  if (index !== -1) {
    activeBursts.value.splice(index, 1)
  }
}

function createNotification(type, message) {
  // TODO: 実装する通知システム
  console.log(`[${type}] ${message}`)
}

function goBack() {
  router.push('/')
}

onMounted(() => {
  store.initializeSession()

  // Enable body scrolling
  document.body.style.overflow = 'auto'
  document.documentElement.style.overflow = 'auto'

  // Welcome effect
  setTimeout(() => {
    triggerStarBurst('magic', { x: window.innerWidth / 2, y: 200 }, 'high')
  }, 1000)
})
</script>

<style scoped>
/* 基本レイアウト - Updated transparency fix v2.0 */
.gallery-entrance {
  min-height: 100vh;
  height: auto;
  background: linear-gradient(180deg, #0A0A1A 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll !important;
  padding-bottom: 2rem;
  -webkit-overflow-scrolling: touch;
}

/* Force card background transparency fix */
.gallery-entrance .wing-card,
.gallery-entrance .panel-content {
  background-color: #0F172A !important;
  background: #0F172A !important;
  border: 2px solid #475569 !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8) !important;
  opacity: 1 !important;
  z-index: 10 !important;
  position: relative !important;
}

.gallery-entrance .wing-card::before,
.gallery-entrance .wing-card::after,
.gallery-entrance .panel-content::before,
.gallery-entrance .panel-content::after {
  display: none !important;
}

.gallery-entrance .wing-card .wing-background {
  display: none !important;
  opacity: 0 !important;
}

.gallery-entrance .stat-card {
  background-color: #0F172A !important;
  background: #0F172A !important;
  border: 2px solid #475569 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8) !important;
  z-index: 10 !important;
  position: relative !important;
}

.galaxy-map-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: #0F172A !important;
}

.galaxy-map-button:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

/* ヘッダー */
.cosmic-header {
  position: relative;
  z-index: 10;
  padding: 1.5rem 2rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}


.gallery-title-section {
  text-align: center;
  flex: 1;
  position: relative;
}

.gallery-title {
  margin: 0;
}

.title-text {
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(135deg, #FBBF24, #F59E0B, #D97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.title-subtitle {
  font-size: 1.1rem;
  color: #E5E7EB;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.cosmic-pulse {
  animation: cosmic-pulse 2s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(15px);
  border-radius: 1rem;
  padding: 1rem;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #D1D5DB;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
}

.energy-bar, .level-bar {
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399);
  transition: width 0.3s ease;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  transition: width 0.3s ease;
}

.energy-text, .exp-text {
  font-size: 0.75rem;
  color: #D1D5DB;
}

/* エクスプローラーパネル */
.explorer-panel {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.panel-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: center;
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}


.explorer-name {
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #60A5FA, #A78BFA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.explorer-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #D1D5DB;
}

.value {
  font-weight: bold;
}

.highlight {
  color: #FBBF24;
}

.gems {
  color: #A78BFA;
}

.cards {
  color: #34D399;
}

.mission-objective {
  text-align: center;
  max-width: 350px;
  margin: 0 auto;
}

.objective-title {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
  color: #FBBF24;
}

.objective-text {
  color: #D1D5DB;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

/* ウィングセクション */
.wings-section {
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 120vh;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.2rem;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #60A5FA, #A78BFA);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-description {
  color: #D1D5DB;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.wings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.wing-card {
  position: relative;
  background: rgba(15, 23, 42, 0.95) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  border-radius: 2rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 320px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

.wing-card:hover:not(.locked) {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.wing-card.completed {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.2);
}

.wing-card.current {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

.wing-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.wing-background {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  z-index: -1;
}

.locked-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border-radius: 2rem;
}

.lock-container {
  text-align: center;
}

.lock-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.lock-text {
  color: #D1D5DB;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.wing-content {
  position: relative;
  z-index: 2;
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.wing-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.wing-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.wing-name {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.wing-level {
  color: #A78BFA;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.wing-description {
  color: #D1D5DB;
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
}

.wing-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.progress-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stars-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.stars-earned {
  color: #FBBF24;
}

.stars-total {
  color: #9CA3AF;
}

.completion-text {
  color: #34D399;
  font-weight: 600;
}

.artifacts-preview {
  margin-top: 1rem;
}

.preview-title {
  font-size: 0.9rem;
  color: #D1D5DB;
  margin: 0 0 0.5rem 0;
}

.artifact-icons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.artifact-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #9CA3AF;
}

.artifact-icon.unlocked {
  background: rgba(59, 130, 246, 0.3);
  color: #60A5FA;
}

.artifact-icon.completed {
  background: rgba(16, 185, 129, 0.3);
  color: #34D399;
}

.wing-action {
  margin-top: auto;
  padding-top: 1rem;
}

.explore-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 1rem;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.explore-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

/* アップグレードセクション */
.upgrades-section {
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.2);
}

.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.upgrade-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
}

.upgrade-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.upgrade-card.maxed {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
}

.upgrade-header {
  margin-bottom: 1rem;
}

.upgrade-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.upgrade-name {
  font-size: 1.3rem;
  margin: 0;
  color: #E5E7EB;
}

.upgrade-level {
  margin-bottom: 1rem;
}

.level-display {
  color: #A78BFA;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.level-bars {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.level-bar {
  width: 20px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.level-bar.active {
  background: linear-gradient(90deg, #8B5CF6, #A78BFA);
}

.upgrade-effect {
  margin-bottom: 1.5rem;
}

.effect-text {
  color: #D1D5DB;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.upgrade-button {
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
  border: none;
  border-radius: 1rem;
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.upgrade-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.upgrade-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.maxed-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #FBBF24;
  font-weight: bold;
}

/* アチーブメントセクション */
.achievements-section {
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 1.5rem;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(15px);
}

.achievement-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.achievement-name {
  color: #FBBF24;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.achievement-description {
  color: #D1D5DB;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .panel-content {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }

  .wings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cosmic-header {
    padding: 1rem;
  }

  .title-text {
    font-size: 2rem;
  }

  .stat-card {
    min-width: 120px;
    padding: 0.75rem;
  }

  .wings-section, .upgrades-section, .achievements-section {
    padding: 2rem 1rem;
  }

  .wing-card {
    min-height: auto;
  }

  .wing-content {
    padding: 1.5rem;
  }

  .galaxy-map-button {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>