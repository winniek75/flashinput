<template>
  <div class="active-skill-bar">
    <div class="skill-bar-header">
      <h4 class="skill-bar-title">
        <span class="title-icon">🛡️</span>
        アクティブスキル
      </h4>
      <div class="skill-points">
        <span class="points-label">SP:</span>
        <span class="points-value">{{ availableSkillPoints }}</span>
      </div>
    </div>

    <div class="skills-container">
      <div 
        v-for="skill in displaySkills" 
        :key="skill.id"
        class="skill-slot"
        :class="{
          'skill-unlocked': skill.unlocked,
          'skill-ready': skill.unlocked && skill.currentCooldown === 0,
          'skill-cooldown': skill.unlocked && skill.currentCooldown > 0,
          'skill-locked': !skill.unlocked
        }"
      >
        <!-- Skill Button -->
        <button
          @click="useSkill(skill)"
          :disabled="!canUseSkill(skill)"
          class="skill-button"
          :title="getSkillTooltip(skill)"
        >
          <div class="skill-icon">{{ getSkillIcon(skill.id) }}</div>
          <div class="skill-name">{{ skill.name }}</div>
          
          <!-- Cooldown Overlay -->
          <div v-if="skill.currentCooldown > 0" class="cooldown-overlay">
            <div class="cooldown-circle">
              <svg class="cooldown-svg" viewBox="0 0 50 50">
                <circle
                  cx="25" cy="25" r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  stroke-width="3"
                />
                <circle
                  cx="25" cy="25" r="20"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="getCooldownOffset(skill)"
                  transform="rotate(-90 25 25)"
                  class="cooldown-progress"
                />
              </svg>
              <div class="cooldown-text">{{ skill.currentCooldown }}s</div>
            </div>
          </div>

          <!-- Skill Level -->
          <div v-if="skill.unlocked && skill.level > 0" class="skill-level">
            Lv.{{ skill.level }}
          </div>

          <!-- Lock Icon -->
          <div v-if="!skill.unlocked" class="skill-lock">
            <span class="lock-icon">🔒</span>
            <span class="unlock-level">Lv.{{ getUnlockLevel(skill.id) }}</span>
          </div>
        </button>

        <!-- Skill Effects -->
        <div v-if="skill.unlocked && activeEffects[skill.id]" class="skill-effect">
          <div class="effect-indicator">
            <span class="effect-icon">✨</span>
            <span class="effect-duration">{{ activeEffects[skill.id].remaining }}s</span>
          </div>
        </div>

        <!-- Skill Enhancement -->
        <div v-if="skill.unlocked && skill.level < skill.maxLevel" class="skill-enhancement">
          <button 
            @click="enhanceSkill(skill)"
            :disabled="!canEnhanceSkill(skill)"
            class="enhance-button"
            title="スキル強化"
          >
            <span class="enhance-icon">⬆️</span>
          </button>
        </div>
      </div>

      <!-- Empty Skill Slots -->
      <div 
        v-for="i in Math.max(0, 6 - displaySkills.length)" 
        :key="'empty-' + i"
        class="skill-slot skill-empty"
      >
        <div class="empty-slot">
          <span class="empty-icon">➕</span>
          <span class="empty-text">未解禁</span>
        </div>
      </div>
    </div>

    <!-- Skill Descriptions -->
    <div v-if="selectedSkill" class="skill-description">
      <div class="description-header">
        <span class="desc-icon">{{ getSkillIcon(selectedSkill.id) }}</span>
        <span class="desc-name">{{ selectedSkill.name }}</span>
      </div>
      <p class="desc-text">{{ selectedSkill.description }}</p>
      <div class="desc-stats">
        <div v-if="selectedSkill.cooldown" class="desc-stat">
          <span class="stat-label">クールダウン:</span>
          <span class="stat-value">{{ selectedSkill.cooldown }}秒</span>
        </div>
        <div v-if="selectedSkill.effect" class="desc-stat">
          <span class="stat-label">効果:</span>
          <span class="stat-value">{{ selectedSkill.effect }}</span>
        </div>
      </div>
    </div>

    <!-- Global Cooldown Indicator -->
    <div v-if="globalCooldown > 0" class="global-cooldown">
      <div class="gcd-bar">
        <div class="gcd-fill" :style="{width: getGlobalCooldownPercentage() + '%'}"></div>
      </div>
      <span class="gcd-text">GCD: {{ globalCooldown }}s</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  skills: {
    type: Object,
    required: true
  },
  characterLevel: {
    type: Number,
    default: 1
  },
  skillPoints: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['use-skill', 'enhance-skill'])

// Reactive data
const selectedSkill = ref(null)
const activeEffects = ref({})
const globalCooldown = ref(0)
const circumference = 2 * Math.PI * 20 // for cooldown circle

// Computed properties
const displaySkills = computed(() => {
  return Object.values(props.skills).filter(skill => skill.unlocked || getUnlockLevel(skill.id) <= props.characterLevel + 5)
})

const availableSkillPoints = computed(() => {
  return props.skillPoints || Math.floor(props.characterLevel / 5)
})

// Methods
function getSkillIcon(skillId) {
  const icons = {
    focusMode: '🧘',
    perfectHint: '💡',
    recoveryBoost: '🔄',
    timeExtension: '⏱️',
    comboBooster: '🔥',
    shieldMode: '🛡️',
    speedBurst: '⚡',
    perfectStrike: '🎯'
  }
  return icons[skillId] || '🔮'
}

function getUnlockLevel(skillId) {
  const unlockLevels = {
    focusMode: 5,
    perfectHint: 15,
    recoveryBoost: 25,
    timeExtension: 10,
    comboBooster: 20,
    shieldMode: 30,
    speedBurst: 35,
    perfectStrike: 40
  }
  return unlockLevels[skillId] || 1
}

function canUseSkill(skill) {
  return skill.unlocked && 
         skill.currentCooldown === 0 && 
         globalCooldown.value === 0
}

function canEnhanceSkill(skill) {
  return skill.unlocked && 
         skill.level < skill.maxLevel && 
         availableSkillPoints.value > 0
}

function useSkill(skill) {
  if (!canUseSkill(skill)) return

  // Trigger global cooldown
  globalCooldown.value = 2
  const gcdTimer = setInterval(() => {
    globalCooldown.value--
    if (globalCooldown.value <= 0) {
      clearInterval(gcdTimer)
    }
  }, 1000)

  // Apply skill effect
  applySkillEffect(skill)

  // Emit skill use event
  emit('use-skill', skill.id)

  // Start skill cooldown
  skill.currentCooldown = skill.cooldown
  const cooldownTimer = setInterval(() => {
    skill.currentCooldown--
    if (skill.currentCooldown <= 0) {
      clearInterval(cooldownTimer)
    }
  }, 1000)
}

function applySkillEffect(skill) {
  const duration = getSkillDuration(skill)
  
  activeEffects.value[skill.id] = {
    remaining: duration,
    startTime: Date.now()
  }

  // Effect countdown
  const effectTimer = setInterval(() => {
    if (activeEffects.value[skill.id]) {
      activeEffects.value[skill.id].remaining--
      
      if (activeEffects.value[skill.id].remaining <= 0) {
        delete activeEffects.value[skill.id]
        clearInterval(effectTimer)
      }
    } else {
      clearInterval(effectTimer)
    }
  }, 1000)
}

function getSkillDuration(skill) {
  const durations = {
    focusMode: 30,
    perfectHint: 5,
    recoveryBoost: 60,
    timeExtension: 20,
    comboBooster: 45,
    shieldMode: 40,
    speedBurst: 15,
    perfectStrike: 10
  }
  
  const baseDuration = durations[skill.id] || 10
  return Math.floor(baseDuration * (1 + skill.level * 0.2))
}

function enhanceSkill(skill) {
  if (!canEnhanceSkill(skill)) return

  emit('enhance-skill', {
    skillId: skill.id,
    currentLevel: skill.level,
    cost: 1
  })
}

function getSkillTooltip(skill) {
  if (!skill.unlocked) {
    return `レベル ${getUnlockLevel(skill.id)} で解禁`
  }
  
  let tooltip = `${skill.name}\n${skill.description}`
  
  if (skill.currentCooldown > 0) {
    tooltip += `\nクールダウン: ${skill.currentCooldown}s`
  } else {
    tooltip += `\nクールダウン: ${skill.cooldown}s`
  }
  
  if (skill.level > 0) {
    tooltip += `\nレベル: ${skill.level}/${skill.maxLevel}`
  }
  
  return tooltip
}

function getCooldownOffset(skill) {
  const progress = skill.currentCooldown / skill.cooldown
  return circumference * progress
}

function getGlobalCooldownPercentage() {
  return Math.max(0, (globalCooldown.value / 2) * 100)
}

function selectSkillForDescription(skill) {
  selectedSkill.value = selectedSkill.value === skill ? null : skill
}

// Watch for skill hover/click to show description
watch(displaySkills, (newSkills) => {
  if (newSkills.length > 0 && !selectedSkill.value) {
    selectedSkill.value = newSkills[0]
  }
}, { immediate: true })
</script>

<style scoped>
.active-skill-bar {
  @apply w-full p-4 rounded-2xl;
  background: linear-gradient(135deg, rgba(30, 30, 60, 0.9), rgba(40, 40, 80, 0.9));
  border: 2px solid rgba(147, 51, 234, 0.4);
  backdrop-filter: blur(10px);
}

/* Header */
.skill-bar-header {
  @apply flex items-center justify-between mb-4;
}

.skill-bar-title {
  @apply text-lg font-bold text-white flex items-center gap-2;
}

.title-icon {
  @apply text-purple-400;
}

.skill-points {
  @apply flex items-center gap-1;
}

.points-label {
  @apply text-sm text-slate-400;
}

.points-value {
  @apply text-lg font-bold text-yellow-400;
}

/* Skills Container */
.skills-container {
  @apply grid grid-cols-3 md:grid-cols-6 gap-3 mb-4;
}

.skill-slot {
  @apply relative aspect-square;
}

/* Skill Button */
.skill-button {
  @apply relative w-full h-full p-2 rounded-xl border-2 transition-all duration-200 cursor-pointer;
  background: linear-gradient(135deg, rgba(60, 60, 120, 0.6), rgba(40, 40, 80, 0.6));
}

.skill-slot.skill-unlocked .skill-button {
  border-color: rgba(147, 51, 234, 0.6);
}

.skill-slot.skill-ready .skill-button {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.skill-slot.skill-ready .skill-button:hover {
  @apply transform scale-105;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.skill-slot.skill-cooldown .skill-button {
  border-color: rgba(239, 68, 68, 0.6);
  @apply opacity-70;
}

.skill-slot.skill-locked .skill-button {
  border-color: rgba(100, 100, 100, 0.4);
  @apply opacity-50 cursor-not-allowed;
}

.skill-icon {
  @apply text-2xl md:text-3xl text-center mb-1;
}

.skill-name {
  @apply text-xs font-semibold text-white text-center;
}

/* Cooldown Overlay */
.cooldown-overlay {
  @apply absolute inset-0 flex items-center justify-center;
}

.cooldown-circle {
  @apply relative w-12 h-12;
}

.cooldown-svg {
  @apply w-full h-full;
}

.cooldown-progress {
  transition: stroke-dashoffset 1s linear;
}

.cooldown-text {
  @apply absolute inset-0 flex items-center justify-center text-xs font-bold text-white;
}

/* Skill Level */
.skill-level {
  @apply absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

/* Lock Overlay */
.skill-lock {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: inherit;
}

.lock-icon {
  @apply text-xl mb-1;
}

.unlock-level {
  @apply text-xs text-slate-300;
}

/* Empty Slots */
.skill-slot.skill-empty .empty-slot {
  @apply w-full h-full flex flex-col items-center justify-center;
  background: linear-gradient(135deg, rgba(80, 80, 80, 0.3), rgba(60, 60, 60, 0.3));
  border: 2px dashed rgba(100, 100, 100, 0.3);
  border-radius: inherit;
}

.empty-icon {
  @apply text-2xl text-gray-500 mb-1;
}

.empty-text {
  @apply text-xs text-gray-500;
}

/* Skill Effects */
.skill-effect {
  @apply absolute -top-2 -right-2;
}

.effect-indicator {
  @apply flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.effect-icon {
  @apply text-xs;
}

.effect-duration {
  @apply font-mono;
}

/* Skill Enhancement */
.skill-enhancement {
  @apply absolute -bottom-2 -right-2;
}

.enhance-button {
  @apply w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  cursor: pointer;
}

.enhance-button:hover:not(:disabled) {
  @apply transform scale-110;
}

.enhance-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.enhance-icon {
  @apply text-xs;
}

/* Skill Description */
.skill-description {
  @apply p-4 rounded-xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.8), rgba(60, 60, 120, 0.8));
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.description-header {
  @apply flex items-center gap-2 mb-2;
}

.desc-icon {
  @apply text-xl;
}

.desc-name {
  @apply text-lg font-bold text-white;
}

.desc-text {
  @apply text-sm text-slate-200 mb-3;
}

.desc-stats {
  @apply flex gap-4;
}

.desc-stat {
  @apply flex items-center gap-1;
}

.stat-label {
  @apply text-xs text-slate-400;
}

.stat-value {
  @apply text-xs font-semibold text-white;
}

/* Global Cooldown */
.global-cooldown {
  @apply flex items-center gap-2 mt-4 p-2 rounded-lg;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.gcd-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.gcd-fill {
  @apply h-full bg-red-500 transition-all duration-1000 linear;
}

.gcd-text {
  @apply text-xs font-mono text-red-400;
}

/* Responsive Design */
@media (max-width: 768px) {
  .skills-container {
    @apply grid-cols-3 gap-2;
  }
  
  .skill-icon {
    @apply text-xl;
  }
  
  .skill-name {
    @apply text-xs;
  }
  
  .cooldown-circle {
    @apply w-8 h-8;
  }
  
  .skill-description {
    @apply p-3;
  }
  
  .desc-text {
    @apply text-xs;
  }
}

/* Animations */
@keyframes skill-ready {
  0%, 100% { box-shadow: 0 0 15px rgba(34, 197, 94, 0.3); }
  50% { box-shadow: 0 0 25px rgba(34, 197, 94, 0.6); }
}

.skill-slot.skill-ready .skill-button {
  animation: skill-ready 2s ease-in-out infinite;
}

@keyframes effect-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.effect-indicator {
  animation: effect-pulse 1s ease-in-out infinite;
}
</style>