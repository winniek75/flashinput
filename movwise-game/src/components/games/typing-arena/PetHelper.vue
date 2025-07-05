<template>
  <div class="pet-helper" :class="{'pet-active': isActive}">
    <div class="pet-container">
      <!-- Pet Avatar -->
      <div class="pet-avatar" @click="interactWithPet">
        <img :src="getPetImage()" :alt="pet.name" class="pet-image">
        <div class="pet-level-badge">{{ pet.level }}</div>
        
        <!-- Pet Animation States -->
        <div v-if="petState.isEncouraging" class="pet-animation encourage">
          <span class="animation-icon">🎵</span>
        </div>
        <div v-if="petState.isHinting" class="pet-animation hint">
          <span class="animation-icon">💫</span>
        </div>
        <div v-if="petState.isWorking" class="pet-animation working">
          <span class="animation-icon">✨</span>
        </div>
      </div>

      <!-- Pet Name and Status -->
      <div class="pet-info">
        <h4 class="pet-name">{{ pet.name }}</h4>
        <div class="pet-status">
          <span class="status-indicator" :class="getStatusClass()">
            {{ getPetStatus() }}
          </span>
        </div>
      </div>

      <!-- Pet Abilities -->
      <div class="pet-abilities">
        <button
          v-for="ability in availableAbilities"
          :key="ability.id"
          @click="useAbility(ability)"
          :disabled="!canUseAbility(ability)"
          class="ability-button"
          :class="{
            'ability-ready': canUseAbility(ability),
            'ability-cooldown': ability.currentCooldown > 0
          }"
          :title="ability.description"
        >
          <span class="ability-icon">{{ getAbilityIcon(ability.id) }}</span>
          <span class="ability-name">{{ ability.name }}</span>
          <div v-if="ability.currentCooldown > 0" class="cooldown-overlay">
            {{ ability.currentCooldown }}s
          </div>
        </button>
      </div>
    </div>

    <!-- Pet Speech Bubble -->
    <div v-if="petMessage" class="pet-speech-bubble">
      <div class="speech-content">
        <p class="speech-text">{{ petMessage.text }}</p>
        <div class="speech-emotion">{{ petMessage.emotion }}</div>
      </div>
      <div class="speech-tail"></div>
    </div>

    <!-- Pet Stats Mini Display -->
    <div class="pet-mini-stats">
      <div class="mini-stat">
        <span class="stat-icon">❤️</span>
        <div class="stat-bar">
          <div class="stat-fill affection" 
               :style="{width: getAffectionPercentage() + '%'}"></div>
        </div>
      </div>
      <div class="mini-stat">
        <span class="stat-icon">⭐</span>
        <div class="stat-bar">
          <div class="stat-fill experience" 
               :style="{width: getExperiencePercentage() + '%'}"></div>
        </div>
      </div>
    </div>

    <!-- Pet Help Hints -->
    <div v-if="showHints" class="pet-hints">
      <div class="hint-container">
        <h5 class="hint-title">🐦 {{ pet.name }}のアドバイス</h5>
        <div class="hints-list">
          <div v-for="hint in currentHints" :key="hint.id" class="hint-item">
            <span class="hint-icon">{{ hint.icon }}</span>
            <span class="hint-text">{{ hint.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  pet: {
    type: Object,
    required: true
  },
  currentText: {
    type: String,
    default: ''
  },
  userInput: {
    type: String,
    default: ''
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  recentMistakes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['use-ability', 'pet-interaction'])

// Reactive data
const isActive = ref(true)
const petState = ref({
  isEncouraging: false,
  isHinting: false,
  isWorking: false,
  mood: 'happy' // happy, excited, concerned, sleepy
})
const petMessage = ref(null)
const showHints = ref(false)
const lastInteraction = ref(Date.now())

// Computed properties
const availableAbilities = computed(() => {
  if (!props.pet.abilities) return []
  return Object.values(props.pet.abilities).filter(ability => ability.unlocked)
})

const currentHints = computed(() => {
  const hints = []
  
  // Generate hints based on current situation
  if (props.recentMistakes.length > 3) {
    hints.push({
      id: 'mistakes',
      icon: '🎯',
      text: 'ゆっくりでも正確に入力しましょう'
    })
  }
  
  if (props.userInput.length === 0 && props.currentText.length > 0) {
    hints.push({
      id: 'start',
      icon: '🚀',
      text: '次の文字は "' + props.currentText[0] + '" です'
    })
  }
  
  if (props.currentText.length > 50) {
    hints.push({
      id: 'long',
      icon: '📏',
      text: '長い文章です。集中してゆっくりと'
    })
  }
  
  return hints
})

// Watchers
watch(() => props.recentMistakes.length, (newCount, oldCount) => {
  if (newCount > oldCount) {
    showEncouragement()
  }
})

watch(() => props.userInput, () => {
  updatePetMood()
})

// Methods
function getPetImage() {
  // Return pet image based on type and evolution
  const basePath = '/images/pets/'
  if (props.pet.evolution?.level10?.evolved) {
    return `${basePath}wise-eagle.png`
  } else if (props.pet.evolution?.level5?.evolved) {
    return `${basePath}smart-bird.png`
  }
  return `${basePath}alphabet-bird.png`
}

function getAbilityIcon(abilityId) {
  const icons = {
    hint: '💡',
    encourage: '🎵',
    wordMemory: '📝',
    perfectHint: '✨',
    speedBoost: '⚡'
  }
  return icons[abilityId] || '🔮'
}

function canUseAbility(ability) {
  return ability.unlocked && (!ability.currentCooldown || ability.currentCooldown <= 0)
}

function useAbility(ability) {
  if (!canUseAbility(ability)) return
  
  // Trigger pet animation
  petState.value.isWorking = true
  setTimeout(() => {
    petState.value.isWorking = false
  }, 2000)
  
  // Show pet message
  showPetMessage(getAbilityMessage(ability.id), '✨')
  
  emit('use-ability', ability)
}

function getAbilityMessage(abilityId) {
  const messages = {
    hint: 'ヒントをあげるよ！',
    encourage: '大丈夫、君ならできる！',
    wordMemory: 'この単語を覚えておくね',
    perfectHint: '完璧なヒントだよ！',
    speedBoost: 'スピードアップ！'
  }
  return messages[abilityId] || 'がんばって！'
}

function showEncouragement() {
  petState.value.isEncouraging = true
  
  const encouragements = [
    'ドンマイ！次はきっと大丈夫！',
    '間違いは成長のチャンス！',
    'ゆっくりでも正確に行こう！',
    '君ならできる！応援してるよ！',
    'ミスは誰にでもあるよ。集中！'
  ]
  
  const message = encouragements[Math.floor(Math.random() * encouragements.length)]
  showPetMessage(message, '💪')
  
  setTimeout(() => {
    petState.value.isEncouraging = false
  }, 3000)
}

function showPetMessage(text, emotion = '😊') {
  petMessage.value = { text, emotion }
  
  setTimeout(() => {
    petMessage.value = null
  }, 4000)
}

function interactWithPet() {
  lastInteraction.value = Date.now()
  
  // Increase affection slightly
  if (props.pet.affection < props.pet.maxAffection) {
    props.pet.affection = Math.min(props.pet.affection + 1, props.pet.maxAffection)
  }
  
  // Show random interaction message
  const interactions = [
    'なでなで〜気持ちいい！',
    'タイピング頑張ろうね！',
    '一緒に英語をマスターしよう！',
    'きみと一緒だと楽しいな！',
    '次のレベルアップまでもう少し！'
  ]
  
  const message = interactions[Math.floor(Math.random() * interactions.length)]
  showPetMessage(message, '😊')
  
  emit('pet-interaction', {
    type: 'pat',
    affectionGain: 1
  })
}

function updatePetMood() {
  const accuracy = props.userInput.length > 0 ? 
    (props.userInput.split('').filter((char, i) => char === props.currentText[i]).length / props.userInput.length) : 1
  
  if (accuracy > 0.95) {
    petState.value.mood = 'excited'
  } else if (accuracy > 0.8) {
    petState.value.mood = 'happy'
  } else if (accuracy > 0.6) {
    petState.value.mood = 'concerned'
  } else {
    petState.value.mood = 'worried'
  }
}

function getPetStatus() {
  const mood = petState.value.mood
  const moodTexts = {
    excited: '大興奮！',
    happy: '機嫌よし',
    concerned: '心配中',
    worried: '不安...',
    sleepy: '眠そう'
  }
  return moodTexts[mood] || '元気'
}

function getStatusClass() {
  const mood = petState.value.mood
  return {
    'status-excited': mood === 'excited',
    'status-happy': mood === 'happy',
    'status-concerned': mood === 'concerned',
    'status-worried': mood === 'worried',
    'status-sleepy': mood === 'sleepy'
  }
}

function getAffectionPercentage() {
  if (!props.pet.affection || !props.pet.maxAffection) return 0
  return Math.round((props.pet.affection / props.pet.maxAffection) * 100)
}

function getExperiencePercentage() {
  if (!props.pet.experience || !props.pet.nextLevelExp) return 0
  return Math.round((props.pet.experience / props.pet.nextLevelExp) * 100)
}

// Lifecycle
onMounted(() => {
  // Initial pet greeting
  setTimeout(() => {
    showPetMessage('一緒にタイピング頑張ろう！', '🎉')
  }, 1000)
  
  // Random pet behaviors
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance every interval
      const randomMessages = [
        'きみのタイピング、だんだん上手になってるよ！',
        'この調子で続けよう！',
        '英語の勉強って楽しいね！',
        '新しい単語を覚えられた？'
      ]
      
      if (Date.now() - lastInteraction.value > 30000) { // 30 seconds since last interaction
        const message = randomMessages[Math.floor(Math.random() * randomMessages.length)]
        showPetMessage(message, '😊')
      }
    }
  }, 10000) // Every 10 seconds
})
</script>

<style scoped>
.pet-helper {
  @apply relative p-4 rounded-2xl transition-all duration-300;
  background: linear-gradient(135deg, rgba(60, 120, 60, 0.3), rgba(40, 100, 40, 0.3));
  border: 2px solid rgba(34, 197, 94, 0.4);
}

.pet-helper.pet-active {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.pet-container {
  @apply flex items-center gap-4;
}

/* Pet Avatar */
.pet-avatar {
  @apply relative w-16 h-16 cursor-pointer transition-transform duration-200 hover:scale-110;
}

.pet-image {
  @apply w-full h-full rounded-full object-cover;
  border: 3px solid rgba(34, 197, 94, 0.6);
}

.pet-level-badge {
  @apply absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: 2px solid white;
}

.pet-animation {
  @apply absolute inset-0 flex items-center justify-center;
  animation: pet-ability 2s ease-in-out;
}

.pet-animation.encourage {
  @apply text-yellow-400;
}

.pet-animation.hint {
  @apply text-blue-400;
}

.pet-animation.working {
  @apply text-purple-400;
}

@keyframes pet-ability {
  0%, 100% { 
    opacity: 0; 
    transform: scale(0.5); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

.animation-icon {
  @apply text-2xl;
  filter: drop-shadow(0 0 10px currentColor);
}

/* Pet Info */
.pet-info {
  @apply flex-1;
}

.pet-name {
  @apply text-lg font-bold text-green-400;
}

.pet-status {
  @apply text-sm;
}

.status-indicator {
  @apply font-semibold;
}

.status-excited {
  @apply text-yellow-400;
}

.status-happy {
  @apply text-green-400;
}

.status-concerned {
  @apply text-orange-400;
}

.status-worried {
  @apply text-red-400;
}

.status-sleepy {
  @apply text-blue-400;
}

/* Pet Abilities */
.pet-abilities {
  @apply flex gap-2;
}

.ability-button {
  @apply relative px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8));
  border: none;
  color: white;
  cursor: pointer;
}

.ability-button.ability-ready:hover {
  @apply transform -translate-y-1;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.ability-button.ability-cooldown {
  @apply opacity-50 cursor-not-allowed;
  background: linear-gradient(135deg, rgba(100, 100, 100, 0.6), rgba(80, 80, 80, 0.6));
}

.ability-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.ability-icon {
  @apply text-base mr-1;
}

.ability-name {
  @apply text-xs;
}

.cooldown-overlay {
  @apply absolute inset-0 flex items-center justify-center text-xs font-bold bg-black/50 rounded-lg;
}

/* Pet Speech Bubble */
.pet-speech-bubble {
  @apply absolute -top-16 left-4 z-10;
  animation: bubble-appear 0.3s ease-out;
}

@keyframes bubble-appear {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.speech-content {
  @apply relative px-4 py-2 rounded-2xl text-sm;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 240, 0.95));
  color: #1f2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 200px;
}

.speech-text {
  @apply font-medium;
}

.speech-emotion {
  @apply text-right text-lg mt-1;
}

.speech-tail {
  @apply absolute top-full left-4 w-0 h-0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.95);
}

/* Pet Mini Stats */
.pet-mini-stats {
  @apply flex gap-2 mt-2;
}

.mini-stat {
  @apply flex items-center gap-1;
}

.stat-icon {
  @apply text-sm;
}

.stat-bar {
  @apply w-16 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.stat-fill {
  @apply h-full transition-all duration-300;
}

.stat-fill.affection {
  @apply bg-gradient-to-r from-pink-500 to-red-500;
}

.stat-fill.experience {
  @apply bg-gradient-to-r from-blue-500 to-purple-500;
}

/* Pet Hints */
.pet-hints {
  @apply absolute -bottom-20 left-0 right-0 z-10;
}

.hint-container {
  @apply p-3 rounded-xl;
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.95), rgba(60, 60, 120, 0.95));
  border: 1px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hint-title {
  @apply text-sm font-bold text-green-400 mb-2;
}

.hints-list {
  @apply space-y-1;
}

.hint-item {
  @apply flex items-center gap-2 text-sm text-slate-300;
}

.hint-icon {
  @apply text-green-400;
}

.hint-text {
  @apply flex-1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pet-container {
    @apply flex-col text-center gap-2;
  }
  
  .pet-abilities {
    @apply justify-center;
  }
  
  .ability-button {
    @apply px-2 py-1 text-xs;
  }
  
  .pet-speech-bubble {
    @apply -top-12 left-1/2 transform -translate-x-1/2;
  }
}
</style>