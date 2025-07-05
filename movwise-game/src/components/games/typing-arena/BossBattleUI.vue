<template>
  <div class="boss-battle-ui">
    <!-- Boss Introduction (shown at start) -->
    <div v-if="showIntro" class="boss-intro" @click="dismissIntro">
      <div class="intro-overlay">
        <div class="intro-content">
          <div class="boss-portrait">
            <span class="boss-icon">{{ boss.icon }}</span>
          </div>
          <h2 class="boss-name">{{ boss.name }}</h2>
          <p class="boss-description">{{ boss.description }}</p>
          <div class="boss-stats">
            <div class="boss-stat">
              <span class="stat-label">HP:</span>
              <span class="stat-value">{{ maxBossHP }}</span>
            </div>
            <div class="boss-stat">
              <span class="stat-label">難易度:</span>
              <span class="stat-value">{{ getDifficultyName(boss.difficulty) }}</span>
            </div>
          </div>
          <p class="intro-instruction">クリックして戦闘開始</p>
        </div>
      </div>
    </div>

    <!-- Boss Battle HUD -->
    <div v-else class="boss-hud">
      <!-- Boss Health Bar -->
      <div class="boss-health-container">
        <div class="boss-info">
          <div class="boss-avatar">
            <span class="boss-icon-small">{{ boss.icon }}</span>
          </div>
          <div class="boss-details">
            <h3 class="boss-name-small">{{ boss.name }}</h3>
            <div class="boss-phase">{{ getCurrentPhase() }}</div>
          </div>
        </div>
        
        <div class="health-bar-container">
          <div class="health-bar">
            <div class="health-fill" 
                 :style="{
                   width: healthPercentage + '%',
                   backgroundColor: getHealthColor()
                 }">
            </div>
            <div class="health-segments">
              <div v-for="i in 4" :key="i" class="health-segment"></div>
            </div>
          </div>
          <div class="health-text">
            {{ bossHP }} / {{ maxBossHP }}
          </div>
        </div>
      </div>

      <!-- Boss Abilities & Warnings -->
      <div class="boss-abilities">
        <div v-if="currentAttack" class="active-attack">
          <div class="attack-icon">{{ currentAttack.icon }}</div>
          <div class="attack-info">
            <p class="attack-name">{{ currentAttack.name }}</p>
            <p class="attack-description">{{ currentAttack.description }}</p>
          </div>
          <div v-if="currentAttack.countdown > 0" class="attack-countdown">
            {{ currentAttack.countdown }}
          </div>
        </div>

        <div class="boss-status-effects">
          <div v-for="effect in activeEffects" :key="effect.id" 
               class="status-effect"
               :class="effect.type">
            <span class="effect-icon">{{ effect.icon }}</span>
            <span class="effect-name">{{ effect.name }}</span>
            <span class="effect-duration">{{ effect.duration }}s</span>
          </div>
        </div>
      </div>

      <!-- Damage Indicators -->
      <div class="damage-indicators">
        <div v-for="damage in recentDamage" :key="damage.id"
             class="damage-number"
             :class="damage.type"
             :style="{
               left: damage.x + 'px',
               top: damage.y + 'px'
             }">
          {{ damage.amount }}
        </div>
      </div>

      <!-- Battle Progress -->
      <div class="battle-progress">
        <div class="progress-indicators">
          <div class="combo-counter">
            <span class="combo-label">コンボ</span>
            <span class="combo-value">{{ combo }}x</span>
          </div>
          <div class="damage-dealt">
            <span class="damage-label">総ダメージ</span>
            <span class="damage-value">{{ totalDamage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Special Attacks Warning -->
    <div v-if="specialAttackWarning" class="special-attack-warning">
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <h3 class="warning-title">{{ specialAttackWarning.name }}</h3>
        <p class="warning-description">{{ specialAttackWarning.description }}</p>
        <div class="warning-countdown">{{ specialAttackWarning.countdown }}</div>
      </div>
    </div>

    <!-- Victory/Defeat Overlay -->
    <div v-if="battleResult" class="battle-result-overlay">
      <div class="result-content">
        <div class="result-icon">{{ battleResult === 'victory' ? '🏆' : '💀' }}</div>
        <h2 class="result-title">
          {{ battleResult === 'victory' ? 'ボス撃破！' : '敗北...' }}
        </h2>
        <p class="result-message">{{ getResultMessage() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  boss: {
    type: Object,
    required: true
  },
  bossHP: {
    type: Number,
    required: true
  },
  maxBossHP: {
    type: Number,
    required: true
  },
  combo: {
    type: Number,
    default: 0
  },
  totalDamage: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['boss-defeated', 'player-defeated', 'attack-triggered'])

// Reactive data
const showIntro = ref(true)
const currentAttack = ref(null)
const activeEffects = ref([])
const specialAttackWarning = ref(null)
const battleResult = ref(null)
const recentDamage = ref([])

// Computed properties
const healthPercentage = computed(() => {
  return Math.max(0, (props.bossHP / props.maxBossHP) * 100)
})

// Watchers
watch(() => props.bossHP, (newHP, oldHP) => {
  if (oldHP > newHP) {
    // Show damage dealt
    showDamageNumber(oldHP - newHP, 'damage')
  }
  
  if (newHP <= 0) {
    battleResult.value = 'victory'
    emit('boss-defeated')
  }
  
  // Check for phase transitions
  checkPhaseTransition()
})

// Methods
function dismissIntro() {
  showIntro.value = false
}

function getDifficultyName(difficulty) {
  const names = {
    eiken5: '英検5級',
    eiken4: '英検4級',
    eiken3: '英検3級',
    eikenPre2: '英検準2級',
    eiken2: '英検2級'
  }
  return names[difficulty] || difficulty
}

function getCurrentPhase() {
  const percentage = healthPercentage.value
  if (percentage > 70) return 'Phase 1'
  if (percentage > 30) return 'Phase 2'
  return 'Phase 3 - 怒り'
}

function getHealthColor() {
  const percentage = healthPercentage.value
  if (percentage > 70) return '#10b981' // green
  if (percentage > 30) return '#f59e0b' // yellow
  return '#ef4444' // red
}

function showDamageNumber(amount, type = 'damage') {
  const damage = {
    id: Date.now() + Math.random(),
    amount,
    type,
    x: Math.random() * 200 + 100,
    y: Math.random() * 100 + 50
  }
  
  recentDamage.value.push(damage)
  
  // Remove after animation
  setTimeout(() => {
    const index = recentDamage.value.findIndex(d => d.id === damage.id)
    if (index > -1) {
      recentDamage.value.splice(index, 1)
    }
  }, 2000)
}

function checkPhaseTransition() {
  const percentage = healthPercentage.value
  
  // Phase 2 transition (70% HP)
  if (percentage <= 70 && percentage > 69) {
    triggerPhaseTransition(2)
  }
  // Phase 3 transition (30% HP)
  else if (percentage <= 30 && percentage > 29) {
    triggerPhaseTransition(3)
  }
}

function triggerPhaseTransition(phase) {
  let attack = null
  
  if (phase === 2) {
    attack = {
      id: 'phase2_transition',
      name: '文字化け攻撃',
      description: 'ランダムに文字が変化します',
      icon: '🌀',
      countdown: 3,
      type: 'special'
    }
  } else if (phase === 3) {
    attack = {
      id: 'phase3_transition',
      name: '時間圧縮',
      description: '制限時間が半分になります',
      icon: '⏰',
      countdown: 3,
      type: 'ultimate'
    }
  }
  
  if (attack) {
    triggerSpecialAttack(attack)
  }
}

function triggerSpecialAttack(attack) {
  specialAttackWarning.value = attack
  
  // Countdown
  const countdown = setInterval(() => {
    if (specialAttackWarning.value) {
      specialAttackWarning.value.countdown--
      
      if (specialAttackWarning.value.countdown <= 0) {
        clearInterval(countdown)
        executeSpecialAttack(attack)
        specialAttackWarning.value = null
      }
    } else {
      clearInterval(countdown)
    }
  }, 1000)
}

function executeSpecialAttack(attack) {
  currentAttack.value = attack
  emit('attack-triggered', attack)
  
  // Add status effect
  const effect = {
    id: attack.id,
    name: attack.name,
    icon: attack.icon,
    type: attack.type,
    duration: 10
  }
  
  activeEffects.value.push(effect)
  
  // Effect countdown
  const effectTimer = setInterval(() => {
    const index = activeEffects.value.findIndex(e => e.id === effect.id)
    if (index > -1) {
      activeEffects.value[index].duration--
      
      if (activeEffects.value[index].duration <= 0) {
        activeEffects.value.splice(index, 1)
        clearInterval(effectTimer)
      }
    } else {
      clearInterval(effectTimer)
    }
  }, 1000)
  
  // Clear current attack after a delay
  setTimeout(() => {
    currentAttack.value = null
  }, 3000)
}

function getResultMessage() {
  if (battleResult.value === 'victory') {
    return `${props.boss.name}を見事に撃破しました！新たな力を手に入れました。`
  } else {
    return `${props.boss.name}に敗北しました。練習を重ねて再挑戦しましょう。`
  }
}

// Lifecycle
onMounted(() => {
  // Auto-dismiss intro after 5 seconds
  setTimeout(() => {
    if (showIntro.value) {
      showIntro.value = false
    }
  }, 5000)
})
</script>

<style scoped>
.boss-battle-ui {
  @apply relative w-full;
}

/* Boss Introduction */
.boss-intro {
  @apply fixed inset-0 z-50 flex items-center justify-center cursor-pointer;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.intro-overlay {
  @apply w-full h-full flex items-center justify-center;
}

.intro-content {
  @apply text-center p-8 rounded-3xl max-w-lg;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.95), rgba(60, 60, 120, 0.95));
  border: 2px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3);
}

.boss-portrait {
  @apply mb-6;
}

.boss-icon {
  @apply text-8xl;
  filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.8));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.boss-name {
  @apply text-4xl font-bold text-red-400 mb-4;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
}

.boss-description {
  @apply text-lg text-slate-200 mb-6;
}

.boss-stats {
  @apply flex justify-center gap-8 mb-6;
}

.boss-stat {
  @apply text-center;
}

.stat-label {
  @apply block text-sm text-slate-400;
}

.stat-value {
  @apply block text-xl font-bold text-white;
}

.intro-instruction {
  @apply text-sm text-slate-300 animate-pulse;
}

/* Boss Battle HUD */
.boss-hud {
  @apply space-y-4;
}

.boss-health-container {
  @apply flex items-center gap-4 p-4 rounded-2xl;
  background: linear-gradient(135deg, rgba(60, 60, 120, 0.8), rgba(40, 40, 80, 0.8));
  border: 2px solid rgba(239, 68, 68, 0.4);
}

.boss-info {
  @apply flex items-center gap-3;
}

.boss-avatar {
  @apply w-12 h-12 rounded-full flex items-center justify-center;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.boss-icon-small {
  @apply text-2xl;
}

.boss-details {
  @apply text-left;
}

.boss-name-small {
  @apply text-lg font-bold text-white;
}

.boss-phase {
  @apply text-sm text-red-400 font-semibold;
}

.health-bar-container {
  @apply flex-1 ml-4;
}

.health-bar {
  @apply relative w-full h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-600;
}

.health-fill {
  @apply h-full transition-all duration-500;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.health-segments {
  @apply absolute inset-0 flex;
}

.health-segment {
  @apply flex-1 border-r border-gray-700 last:border-r-0;
}

.health-text {
  @apply text-center text-sm font-bold text-white mt-1;
}

/* Boss Abilities */
.boss-abilities {
  @apply space-y-2;
}

.active-attack {
  @apply flex items-center gap-4 p-3 rounded-xl;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border: 1px solid rgba(239, 68, 68, 0.4);
  animation: pulse-attack 1s ease-in-out infinite;
}

@keyframes pulse-attack {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.attack-icon {
  @apply text-3xl;
}

.attack-info {
  @apply flex-1;
}

.attack-name {
  @apply text-lg font-bold text-red-400;
}

.attack-description {
  @apply text-sm text-slate-300;
}

.attack-countdown {
  @apply text-2xl font-bold text-red-400 animate-pulse;
}

.boss-status-effects {
  @apply flex flex-wrap gap-2;
}

.status-effect {
  @apply flex items-center gap-1 px-3 py-1 rounded-lg text-sm;
}

.status-effect.special {
  @apply bg-orange-500/20 border border-orange-500/40 text-orange-300;
}

.status-effect.ultimate {
  @apply bg-red-500/20 border border-red-500/40 text-red-300;
}

.effect-icon {
  @apply text-base;
}

.effect-name {
  @apply font-semibold;
}

.effect-duration {
  @apply font-mono;
}

/* Damage Indicators */
.damage-indicators {
  @apply relative pointer-events-none;
}

.damage-number {
  @apply absolute text-2xl font-bold;
  animation: damage-float 2s ease-out forwards;
}

.damage-number.damage {
  @apply text-red-400;
}

.damage-number.heal {
  @apply text-green-400;
}

@keyframes damage-float {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-30px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-60px) scale(0.8);
  }
}

/* Battle Progress */
.battle-progress {
  @apply p-3 rounded-xl;
  background: rgba(40, 40, 80, 0.6);
}

.progress-indicators {
  @apply flex justify-between items-center;
}

.combo-counter,
.damage-dealt {
  @apply text-center;
}

.combo-label,
.damage-label {
  @apply block text-xs text-slate-400;
}

.combo-value,
.damage-value {
  @apply block text-lg font-bold text-white;
}

.combo-value {
  @apply text-yellow-400;
}

.damage-value {
  @apply text-red-400;
}

/* Special Attack Warning */
.special-attack-warning {
  @apply fixed inset-0 z-40 flex items-center justify-center;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(5px);
}

.warning-content {
  @apply text-center p-8 rounded-3xl;
  background: linear-gradient(135deg, rgba(60, 30, 30, 0.95), rgba(80, 40, 40, 0.95));
  border: 3px solid rgba(239, 68, 68, 0.8);
  box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);
}

.warning-icon {
  @apply text-6xl mb-4;
  animation: warning-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes warning-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.warning-title {
  @apply text-3xl font-bold text-red-400 mb-2;
}

.warning-description {
  @apply text-lg text-slate-200 mb-4;
}

.warning-countdown {
  @apply text-5xl font-bold text-red-400;
  animation: countdown-pulse 1s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Battle Result */
.battle-result-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.result-content {
  @apply text-center p-8 rounded-3xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.95), rgba(60, 60, 120, 0.95));
  border: 2px solid rgba(147, 51, 234, 0.5);
}

.result-icon {
  @apply text-8xl mb-4;
}

.result-title {
  @apply text-4xl font-bold text-white mb-4;
}

.result-message {
  @apply text-lg text-slate-200;
}
</style>