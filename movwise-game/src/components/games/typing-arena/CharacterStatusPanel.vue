<template>
  <div class="character-status-panel galaxy-card rounded-3xl p-6 shadow-2xl">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Character Avatar & Basic Info -->
      <div class="character-section">
        <div class="character-avatar-container">
          <div class="character-avatar">
            <img :src="getAvatarImage()" :alt="character.name" class="w-24 h-24 rounded-full">
            <div class="level-badge">
              <span class="level-text">Lv.{{ character.level }}</span>
            </div>
          </div>
          <div class="character-info mt-4">
            <h3 class="text-xl font-bold text-white">{{ character.name }}</h3>
            <p class="text-sm text-yellow-400 font-semibold">{{ character.title }}</p>
            
            <!-- Experience Bar -->
            <div class="exp-container mt-3">
              <div class="exp-bar">
                <div class="exp-fill" :style="{width: expPercentage + '%'}"></div>
                <div class="exp-text">{{ character.experience }}/{{ character.nextLevelExp }}</div>
              </div>
              <p class="text-xs text-slate-400 mt-1">次のレベルまで</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Character Stats -->
      <div class="stats-section">
        <h4 class="text-lg font-bold text-white mb-4">⚡ ステータス</h4>
        <div class="stats-grid">
          <div v-for="(value, stat) in character.stats" :key="stat" class="stat-item">
            <div class="stat-header">
              <span class="stat-icon">{{ getStatIcon(stat) }}</span>
              <span class="stat-name">{{ getStatName(stat) }}</span>
            </div>
            <div class="stat-bar-container">
              <div class="stat-bar">
                <div class="stat-fill" 
                     :style="{
                       width: Math.min((value/100) * 100, 100) + '%',
                       backgroundColor: getStatColor(stat)
                     }">
                </div>
              </div>
              <span class="stat-value">{{ value }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Skills & Pet -->
      <div class="skills-section">
        <h4 class="text-lg font-bold text-white mb-4">🛡️ スキル & ペット</h4>
        
        <!-- Active Skills -->
        <div class="active-skills mb-4">
          <div v-for="skill in availableActiveSkills" :key="skill.id" 
               class="skill-item"
               :class="{'skill-ready': skill.currentCooldown === 0, 'skill-locked': !skill.unlocked}">
            <div class="skill-icon">{{ getSkillIcon(skill.id) }}</div>
            <div class="skill-info">
              <p class="skill-name">{{ skill.name }}</p>
              <div v-if="skill.currentCooldown > 0" class="cooldown-timer">
                {{ formatCooldown(skill.currentCooldown) }}
              </div>
              <div v-else-if="skill.unlocked" class="skill-ready-indicator">
                準備完了
              </div>
              <div v-else class="skill-locked-indicator">
                Lv.{{ getSkillUnlockLevel(skill.id) }}で解禁
              </div>
            </div>
          </div>
        </div>

        <!-- Pet Status -->
        <div v-if="pet" class="pet-status">
          <div class="pet-header">
            <span class="text-sm font-bold text-blue-300">🐦 {{ pet.name }}</span>
            <span class="text-xs text-slate-400">Lv.{{ pet.level }}</span>
          </div>
          <div class="pet-abilities">
            <div v-for="ability in availablePetAbilities" :key="ability.id"
                 class="ability-badge"
                 :class="{'ability-ready': ability.currentCooldown === 0}">
              <span class="ability-icon">{{ getAbilityIcon(ability.id) }}</span>
              <span class="ability-name">{{ ability.name }}</span>
              <div v-if="ability.currentCooldown > 0" class="ability-cooldown">
                {{ ability.currentCooldown }}s
              </div>
            </div>
          </div>
          
          <!-- Affection Level -->
          <div class="affection-container mt-2">
            <div class="affection-hearts">
              <span v-for="i in 5" :key="i" 
                    class="heart"
                    :class="{'filled': i <= getAffectionLevel()}">❤️</span>
            </div>
            <div class="affection-bar">
              <div class="affection-fill" :style="{width: getAffectionPercentage() + '%'}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="quick-actions mt-6 pt-4 border-t border-slate-600">
      <div class="flex gap-4 justify-center">
        <button 
          v-for="skill in readyActiveSkills" 
          :key="skill.id"
          @click="$emit('use-skill', skill.id)"
          class="skill-button"
          :disabled="skill.currentCooldown > 0"
        >
          <span class="skill-button-icon">{{ getSkillIcon(skill.id) }}</span>
          <span class="skill-button-text">{{ skill.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  character: {
    type: Object,
    required: true
  },
  pet: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['use-skill'])

// Computed properties
const expPercentage = computed(() => {
  const exp = props.character.experience
  const nextExp = props.character.nextLevelExp
  return Math.round((exp / nextExp) * 100)
})

const availableActiveSkills = computed(() => {
  return Object.values(props.character.skills.active).filter(skill => skill.unlocked)
})

const readyActiveSkills = computed(() => {
  return availableActiveSkills.value.filter(skill => skill.currentCooldown === 0)
})

const availablePetAbilities = computed(() => {
  if (!props.pet || !props.pet.abilities) return []
  return Object.values(props.pet.abilities).filter(ability => ability.unlocked)
})

// Methods
function getAvatarImage() {
  // This would return the actual avatar image path based on character level/type
  return '/images/characters/galaxy-typer.png'
}

function getStatIcon(stat) {
  const icons = {
    speed: '⚡',
    accuracy: '🎯',
    stamina: '💪',
    vocabulary: '🧠',
    focus: '🌟',
    leadership: '🏆'
  }
  return icons[stat] || '📊'
}

function getStatName(stat) {
  const names = {
    speed: 'スピード',
    accuracy: '精度',
    stamina: '持久力',
    vocabulary: '語彙力',
    focus: '集中力',
    leadership: '指導力'
  }
  return names[stat] || stat
}

function getStatColor(stat) {
  const colors = {
    speed: '#f59e0b', // yellow-500
    accuracy: '#10b981', // emerald-500
    stamina: '#ef4444', // red-500
    vocabulary: '#8b5cf6', // violet-500
    focus: '#06b6d4', // cyan-500
    leadership: '#f97316' // orange-500
  }
  return colors[stat] || '#6b7280'
}

function getSkillIcon(skillId) {
  const icons = {
    focusMode: '🧘',
    perfectHint: '💡',
    recoveryBoost: '🔄'
  }
  return icons[skillId] || '🛡️'
}

function getAbilityIcon(abilityId) {
  const icons = {
    hint: '💫',
    encourage: '🎵',
    wordMemory: '📝'
  }
  return icons[abilityId] || '✨'
}

function getSkillUnlockLevel(skillId) {
  const unlockLevels = {
    focusMode: 5,
    perfectHint: 15,
    recoveryBoost: 25
  }
  return unlockLevels[skillId] || 1
}

function formatCooldown(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function getAffectionLevel() {
  if (!props.pet) return 0
  const affection = props.pet.affection
  const maxAffection = props.pet.maxAffection
  return Math.floor((affection / maxAffection) * 5)
}

function getAffectionPercentage() {
  if (!props.pet) return 0
  const affection = props.pet.affection
  const maxAffection = props.pet.maxAffection
  return Math.round((affection / maxAffection) * 100)
}
</script>

<style scoped>
.character-status-panel {
  backdrop-filter: blur(15px);
}

/* Character Section */
.character-avatar-container {
  @apply text-center;
}

.character-avatar {
  @apply relative inline-block;
}

.level-badge {
  @apply absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.level-text {
  @apply text-xs font-bold text-white;
}

.exp-container {
  @apply w-full max-w-xs mx-auto;
}

.exp-bar {
  @apply relative w-full h-3 bg-gray-700 rounded-full overflow-hidden;
}

.exp-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500;
}

.exp-text {
  @apply absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow;
}

/* Stats Section */
.stats-grid {
  @apply space-y-3;
}

.stat-item {
  @apply space-y-1;
}

.stat-header {
  @apply flex items-center gap-2;
}

.stat-icon {
  @apply text-lg;
}

.stat-name {
  @apply text-sm font-semibold text-white;
}

.stat-bar-container {
  @apply flex items-center gap-2;
}

.stat-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.stat-fill {
  @apply h-full transition-all duration-300;
}

.stat-value {
  @apply text-xs font-bold text-slate-300 min-w-[50px] text-right;
}

/* Skills Section */
.skill-item {
  @apply flex items-center gap-3 p-2 rounded-lg transition-all duration-200;
  background: rgba(40, 40, 80, 0.3);
}

.skill-item.skill-ready {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.skill-item.skill-locked {
  @apply opacity-50;
}

.skill-icon {
  @apply text-xl;
}

.skill-info {
  @apply flex-1;
}

.skill-name {
  @apply text-sm font-bold text-white;
}

.cooldown-timer {
  @apply text-xs text-red-400 font-mono;
}

.skill-ready-indicator {
  @apply text-xs text-green-400 font-semibold;
}

.skill-locked-indicator {
  @apply text-xs text-slate-500;
}

/* Pet Section */
.pet-status {
  @apply mt-4 p-3 rounded-lg;
  background: rgba(60, 60, 120, 0.3);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.pet-header {
  @apply flex items-center justify-between mb-2;
}

.pet-abilities {
  @apply flex flex-wrap gap-1;
}

.ability-badge {
  @apply flex items-center gap-1 px-2 py-1 rounded text-xs;
  background: rgba(80, 80, 140, 0.4);
  border: 1px solid rgba(100, 100, 160, 0.4);
}

.ability-badge.ability-ready {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
}

.ability-icon {
  @apply text-sm;
}

.ability-name {
  @apply text-white font-semibold;
}

.ability-cooldown {
  @apply text-red-400 font-mono ml-1;
}

.affection-container {
  @apply space-y-1;
}

.affection-hearts {
  @apply flex justify-center gap-1;
}

.heart {
  @apply text-sm opacity-30 transition-opacity duration-200;
}

.heart.filled {
  @apply opacity-100;
}

.affection-bar {
  @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden;
}

.affection-fill {
  @apply h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300;
}

/* Quick Actions */
.quick-actions {
  @apply flex justify-center;
}

.skill-button {
  @apply flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  color: white;
  cursor: pointer;
}

.skill-button:hover:not(:disabled) {
  @apply transform -translate-y-1;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
}

.skill-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.skill-button-icon {
  @apply text-lg;
}

.skill-button-text {
  @apply text-sm;
}

/* Text shadow utility */
.text-shadow {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .character-status-panel {
    @apply p-4;
  }
  
  .stats-grid {
    @apply space-y-2;
  }
  
  .stat-item {
    @apply text-sm;
  }
  
  .skill-item {
    @apply p-1;
  }
}
</style>