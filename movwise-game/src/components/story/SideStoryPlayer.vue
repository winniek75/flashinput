<template>
  <div class="side-story-player" v-if="currentStory">
    <!-- Story Header -->
    <div class="story-header">
      <div class="story-info">
        <h2 class="story-title">{{ currentStory.title }}</h2>
        <p class="story-description">{{ currentStory.description }}</p>
        <div class="story-meta">
          <span class="story-mood" :class="currentStory.mood">
            <i :class="getMoodIcon(currentStory.mood)"></i>
            {{ getMoodName(currentStory.mood) }}
          </span>
          <span class="story-duration">
            <i class="fas fa-clock"></i>
            約{{ currentStory.estimatedDuration }}分
          </span>
          <span class="story-characters">
            <i class="fas fa-users"></i>
            {{ currentStory.characters.length }}キャラクター
          </span>
        </div>
      </div>
      <button 
        class="close-button"
        @click="$emit('close')"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Story Content -->
    <div class="story-content">
      <!-- Scene Background -->
      <div 
        class="scene-background"
        :style="{ backgroundImage: currentScene?.background ? `url(${currentScene.background})` : 'none' }"
      >
        <!-- Character Portraits -->
        <div class="character-portraits">
          <div 
            v-for="characterId in currentScene?.characters || []"
            :key="characterId"
            class="character-portrait"
            :class="{ 
              active: currentDialogue?.speaker === characterId,
              speaking: currentDialogue?.speaker === characterId && isTyping
            }"
          >
            <img 
              :src="`/images/characters/${characterId}_${getCharacterEmotion(characterId)}.png`"
              :alt="getCharacterName(characterId)"
              @error="handleImageError"
            />
            <div class="character-name">{{ getCharacterName(characterId) }}</div>
          </div>
        </div>

        <!-- Dialogue Box -->
        <div class="dialogue-container" v-if="currentDialogue">
          <div class="dialogue-box">
            <div class="speaker-info">
              <div class="speaker-avatar">
                <img 
                  :src="`/images/characters/${currentDialogue.speaker}_${currentDialogue.emotion}.png`"
                  :alt="getCharacterName(currentDialogue.speaker)"
                  @error="handleImageError"
                />
              </div>
              <div class="speaker-details">
                <span class="speaker-name">{{ getCharacterName(currentDialogue.speaker) }}</span>
                <span class="emotion-indicator" :class="currentDialogue.emotion">
                  {{ getEmotionName(currentDialogue.emotion) }}
                </span>
              </div>
            </div>
            
            <div class="dialogue-text">
              <p ref="dialogueTextElement">{{ displayedText }}</p>
              <div class="typing-indicator" v-if="isTyping">
                <span></span><span></span><span></span>
              </div>
            </div>

            <!-- Choice buttons -->
            <div class="choice-buttons" v-if="currentChoices && !isTyping">
              <button 
                v-for="choice in currentChoices"
                :key="choice.id"
                class="choice-button"
                @click="selectChoice(choice)"
              >
                {{ choice.text }}
              </button>
            </div>

            <!-- Continue button -->
            <button 
              v-if="!isTyping && !currentChoices"
              class="continue-button"
              @click="nextDialogue"
            >
              <i class="fas fa-chevron-right"></i>
              続ける
            </button>
          </div>
        </div>

        <!-- Progress indicator -->
        <div class="progress-indicator">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${storyProgress}%` }"
            ></div>
          </div>
          <span class="progress-text">
            {{ currentSceneIndex + 1 }} / {{ currentStory.scenes.length }} シーン
          </span>
        </div>
      </div>
    </div>

    <!-- Story Controls -->
    <div class="story-controls">
      <button 
        class="control-button"
        @click="toggleAutoPlay"
        :class="{ active: autoPlay }"
      >
        <i :class="autoPlay ? 'fas fa-pause' : 'fas fa-play'"></i>
        {{ autoPlay ? '一時停止' : '自動再生' }}
      </button>
      
      <button 
        class="control-button"
        @click="skipDialogue"
        :disabled="!canSkip"
      >
        <i class="fas fa-forward"></i>
        スキップ
      </button>
      
      <button 
        class="control-button"
        @click="toggleTextSpeed"
      >
        <i class="fas fa-tachometer-alt"></i>
        {{ textSpeedName }}
      </button>
    </div>

    <!-- Completion Modal -->
    <div class="completion-modal" v-if="showCompletionModal">
      <div class="modal-content">
        <div class="completion-header">
          <i class="fas fa-star completion-icon"></i>
          <h3>ストーリー完了！</h3>
        </div>
        
        <div class="completion-rewards" v-if="currentStory.rewards">
          <h4>獲得報酬</h4>
          <div class="reward-list">
            <div 
              v-if="currentStory.rewards.relationshipBonus"
              class="reward-item"
            >
              <i class="fas fa-heart"></i>
              <span>キャラクター親密度アップ</span>
            </div>
            <div 
              v-if="currentStory.rewards.experienceBonus"
              class="reward-item"
            >
              <i class="fas fa-star"></i>
              <span>経験値 +{{ currentStory.rewards.experienceBonus }}</span>
            </div>
            <div 
              v-if="currentStory.rewards.specialUnlock"
              class="reward-item special"
            >
              <i class="fas fa-unlock"></i>
              <span>特別コンテンツ解放</span>
            </div>
          </div>
        </div>
        
        <div class="completion-actions">
          <button 
            class="primary-button"
            @click="completeStory"
          >
            続ける
          </button>
          <button 
            v-if="currentStory.isRepeatable"
            class="secondary-button"
            @click="restartStory"
          >
            もう一度見る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { SideStory, SideStoryScene, SideStoryDialogue, SideStoryChoice } from '@/story/sidestories/SideStoryDatabase'
import { sideStoryDatabase } from '@/story/sidestories/SideStoryDatabase'

// Props
interface Props {
  story: SideStory
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  complete: [story: SideStory]
}>()

// Reactive data
const currentStory = ref<SideStory>(props.story)
const currentSceneIndex = ref(0)
const currentDialogueIndex = ref(0)
const displayedText = ref('')
const isTyping = ref(false)
const autoPlay = ref(false)
const textSpeed = ref(50) // Characters per second
const showCompletionModal = ref(false)
const currentChoices = ref<SideStoryChoice[] | null>(null)

// Text speed options
const textSpeeds = [
  { name: '遅い', speed: 30 },
  { name: '普通', speed: 50 },
  { name: '速い', speed: 80 },
  { name: '瞬間', speed: 1000 }
]
const textSpeedIndex = ref(1)

// Audio
const typingSound = ref<HTMLAudioElement | null>(null)
const bgMusic = ref<HTMLAudioElement | null>(null)

// Computed
const currentScene = computed(() => {
  return currentStory.value.scenes[currentSceneIndex.value] || null
})

const currentDialogue = computed(() => {
  if (!currentScene.value) return null
  return currentScene.value.dialogue[currentDialogueIndex.value] || null
})

const storyProgress = computed(() => {
  const totalScenes = currentStory.value.scenes.length
  const totalDialogues = currentStory.value.scenes.reduce((sum, scene) => sum + scene.dialogue.length, 0)
  
  let completedDialogues = 0
  for (let i = 0; i < currentSceneIndex.value; i++) {
    completedDialogues += currentStory.value.scenes[i].dialogue.length
  }
  completedDialogues += currentDialogueIndex.value
  
  return Math.min(100, (completedDialogues / totalDialogues) * 100)
})

const canSkip = computed(() => {
  return currentDialogueIndex.value < (currentScene.value?.dialogue.length || 0) - 1 || 
         currentSceneIndex.value < currentStory.value.scenes.length - 1
})

const textSpeedName = computed(() => {
  return textSpeeds[textSpeedIndex.value].name
})

// Methods
const startTypewriting = async (text: string, speed: number = textSpeed.value) => {
  isTyping.value = true
  displayedText.value = ''
  currentChoices.value = null
  
  // Play typing sound
  if (typingSound.value) {
    typingSound.value.currentTime = 0
    typingSound.value.play().catch(() => {})
  }
  
  for (let i = 0; i <= text.length; i++) {
    if (!isTyping.value) break // Allow interruption
    
    displayedText.value = text.substring(0, i)
    
    if (i < text.length) {
      await new Promise(resolve => setTimeout(resolve, 1000 / speed))
    }
  }
  
  isTyping.value = false
  
  // Stop typing sound
  if (typingSound.value) {
    typingSound.value.pause()
  }
  
  // Show choices if available
  if (currentDialogue.value?.choices) {
    currentChoices.value = currentDialogue.value.choices
  }
  
  // Auto-advance if enabled
  if (autoPlay.value && !currentChoices.value) {
    setTimeout(() => {
      nextDialogue()
    }, 2000)
  }
}

const nextDialogue = () => {
  if (isTyping.value) {
    // Skip typing animation
    isTyping.value = false
    displayedText.value = currentDialogue.value?.text || ''
    return
  }
  
  if (currentScene.value && currentDialogueIndex.value < currentScene.value.dialogue.length - 1) {
    // Next dialogue in current scene
    currentDialogueIndex.value++
    nextTick(() => {
      if (currentDialogue.value) {
        startTypewriting(currentDialogue.value.text)
      }
    })
  } else if (currentSceneIndex.value < currentStory.value.scenes.length - 1) {
    // Next scene
    currentSceneIndex.value++
    currentDialogueIndex.value = 0
    nextTick(() => {
      if (currentDialogue.value) {
        startTypewriting(currentDialogue.value.text)
      }
    })
  } else {
    // Story complete
    showCompletionModal.value = true
  }
}

const selectChoice = (choice: SideStoryChoice) => {
  // Handle choice consequences
  if (choice.relationshipChange) {
    // Apply relationship changes (would integrate with game system)
    logger.log('Relationship change:', choice.relationshipChange)
  }
  
  if (choice.unlockStory) {
    // Unlock new story (would integrate with game system)
    logger.log('Unlock story:', choice.unlockStory)
  }
  
  // Show consequence briefly
  if (choice.consequence) {
    displayedText.value = choice.consequence
    setTimeout(() => {
      nextDialogue()
    }, 2000)
  } else {
    nextDialogue()
  }
}

const skipDialogue = () => {
  if (isTyping.value) {
    isTyping.value = false
    displayedText.value = currentDialogue.value?.text || ''
  } else {
    nextDialogue()
  }
}

const toggleAutoPlay = () => {
  autoPlay.value = !autoPlay.value
}

const toggleTextSpeed = () => {
  textSpeedIndex.value = (textSpeedIndex.value + 1) % textSpeeds.length
  textSpeed.value = textSpeeds[textSpeedIndex.value].speed
}

const completeStory = () => {
  sideStoryDatabase.completeStory(currentStory.value.id)
  emit('complete', currentStory.value)
  emit('close')
}

const restartStory = () => {
  currentSceneIndex.value = 0
  currentDialogueIndex.value = 0
  showCompletionModal.value = false
  
  nextTick(() => {
    if (currentDialogue.value) {
      startTypewriting(currentDialogue.value.text)
    }
  })
}

const getCharacterName = (characterId: string) => {
  const names = {
    'captain_nova': 'Captain Nova',
    'aura': 'AURA',
    'professor_phonix': 'Professor Phonix',
    'lexia': 'Lexia',
    'grammar_guardian': 'Grammar Guardian',
    'speed_racer': 'Speed Racer',
    'unity': 'Unity',
    'the_translator': 'The Translator'
  }
  
  return names[characterId as keyof typeof names] || characterId
}

const getCharacterEmotion = (characterId: string) => {
  if (currentDialogue.value?.speaker === characterId) {
    return currentDialogue.value.emotion
  }
  return 'normal'
}

const getMoodIcon = (mood: string) => {
  const icons = {
    'heartwarming': 'fas fa-heart',
    'funny': 'fas fa-laugh',
    'mysterious': 'fas fa-question-circle',
    'emotional': 'fas fa-tear',
    'inspiring': 'fas fa-lightbulb',
    'relaxing': 'fas fa-leaf',
    'adventurous': 'fas fa-compass'
  }
  
  return icons[mood as keyof typeof icons] || 'fas fa-circle'
}

const getMoodName = (mood: string) => {
  const names = {
    'heartwarming': '心温まる',
    'funny': 'コメディ',
    'mysterious': 'ミステリー',
    'emotional': '感動的',
    'inspiring': '感動的',
    'relaxing': 'リラックス',
    'adventurous': '冒険'
  }
  
  return names[mood as keyof typeof names] || mood
}

const getEmotionName = (emotion: string) => {
  const names = {
    'happy': '嬉しい',
    'sad': '悲しい',
    'excited': '興奮',
    'angry': '怒り',
    'surprised': '驚き',
    'worried': '心配',
    'determined': '決意',
    'gentle': '優しい',
    'wise': '賢い',
    'mysterious': '神秘的'
  }
  
  return names[emotion as keyof typeof names] || emotion
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/characters/placeholder.png'
}

// Keyboard controls
const handleKeyPress = (event: KeyboardEvent) => {
  switch (event.code) {
    case 'Space':
    case 'Enter':
      event.preventDefault()
      if (currentChoices.value) return // Don't auto-advance when choices are present
      nextDialogue()
      break
    case 'KeyS':
      event.preventDefault()
      skipDialogue()
      break
    case 'KeyA':
      event.preventDefault()
      toggleAutoPlay()
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// Lifecycle
onMounted(() => {
  // Initialize audio
  typingSound.value = new Audio('/audio/sfx/typing.mp3')
  typingSound.value.loop = true
  typingSound.value.volume = 0.3
  
  if (currentStory.value.scenes[0]?.music) {
    bgMusic.value = new Audio(currentStory.value.scenes[0].music)
    bgMusic.value.loop = true
    bgMusic.value.volume = 0.5
    bgMusic.value.play().catch(() => {})
  }
  
  // Start first dialogue
  if (currentDialogue.value) {
    startTypewriting(currentDialogue.value.text)
  }
  
  // Add keyboard listener
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  // Cleanup audio
  if (typingSound.value) {
    typingSound.value.pause()
  }
  if (bgMusic.value) {
    bgMusic.value.pause()
  }
  
  // Remove keyboard listener
  document.removeEventListener('keydown', handleKeyPress)
})

// Watch for scene changes to update background music
watch(currentSceneIndex, (newIndex) => {
  const newScene = currentStory.value.scenes[newIndex]
  if (newScene?.music && bgMusic.value?.src !== newScene.music) {
    if (bgMusic.value) {
      bgMusic.value.pause()
    }
    bgMusic.value = new Audio(newScene.music)
    bgMusic.value.loop = true
    bgMusic.value.volume = 0.5
    bgMusic.value.play().catch(() => {})
  }
})
</script>

<style scoped>
.side-story-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  font-family: 'Noto Sans JP', sans-serif;
}

.story-header {
  background: linear-gradient(135deg, #1a365d, #2d3748);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-info {
  flex: 1;
}

.story-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.story-description {
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.4;
}

.story-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.story-mood,
.story-duration,
.story-characters {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.8;
}

.story-mood.heartwarming { color: #f56565; }
.story-mood.funny { color: #ed8936; }
.story-mood.mysterious { color: #805ad5; }
.story-mood.emotional { color: #38b2ac; }
.story-mood.inspiring { color: #ecc94b; }
.story-mood.relaxing { color: #68d391; }
.story-mood.adventurous { color: #4299e1; }

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.story-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.scene-background {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scene-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 40%,
    rgba(0, 0, 0, 0.1) 60%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
}

.character-portraits {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  padding: 2rem;
  flex: 1;
  position: relative;
  z-index: 2;
}

.character-portrait {
  text-align: center;
  transition: all 0.3s ease;
  opacity: 0.7;
  transform: scale(0.9);
}

.character-portrait.active {
  opacity: 1;
  transform: scale(1);
}

.character-portrait.speaking {
  animation: speaking 0.5s ease-in-out infinite alternate;
}

@keyframes speaking {
  0% { transform: scale(1) translateY(0); }
  100% { transform: scale(1.05) translateY(-5px); }
}

.character-portrait img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  transition: border-color 0.3s ease;
}

.character-portrait.active img {
  border-color: #4299e1;
  box-shadow: 0 0 20px rgba(66, 153, 225, 0.5);
}

.character-name {
  margin-top: 0.5rem;
  color: white;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.dialogue-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 3;
}

.dialogue-box {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 15px;
  padding: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.speaker-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #4299e1;
}

.speaker-details {
  display: flex;
  flex-direction: column;
}

.speaker-name {
  color: #4299e1;
  font-weight: 700;
  font-size: 1.1rem;
}

.emotion-indicator {
  font-size: 0.8rem;
  opacity: 0.7;
  color: white;
  font-style: italic;
}

.dialogue-text {
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialogue-text p {
  margin: 0;
  flex: 1;
}

.typing-indicator {
  display: flex;
  gap: 0.3rem;
  margin-left: 1rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #4299e1;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.choice-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-align: left;
}

.choice-button:hover {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
}

.continue-button {
  background: transparent;
  color: #4299e1;
  border: 2px solid #4299e1;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.continue-button:hover {
  background: #4299e1;
  color: white;
}

.progress-indicator {
  position: absolute;
  top: 1rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  z-index: 4;
  backdrop-filter: blur(5px);
}

.progress-bar {
  width: 150px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #3182ce);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  display: block;
}

.story-controls {
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.control-button.active {
  background: #4299e1;
  border-color: #4299e1;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.completion-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.completion-header {
  margin-bottom: 2rem;
}

.completion-icon {
  font-size: 4rem;
  color: #ecc94b;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.completion-header h3 {
  font-size: 2rem;
  color: #1a365d;
  margin: 0;
}

.completion-rewards {
  margin-bottom: 2rem;
  text-align: left;
}

.completion-rewards h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
}

.reward-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #4299e1;
}

.reward-item.special {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  border-left-color: #e17055;
}

.reward-item i {
  font-size: 1.2rem;
  color: #4299e1;
}

.reward-item.special i {
  color: #e17055;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.primary-button,
.secondary-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.primary-button:hover {
  background: linear-gradient(135deg, #3182ce, #2c5282);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);
}

.secondary-button {
  background: transparent;
  color: #4299e1;
  border: 2px solid #4299e1;
}

.secondary-button:hover {
  background: #4299e1;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .story-header {
    padding: 1rem;
  }
  
  .story-title {
    font-size: 1.4rem;
  }
  
  .story-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .character-portraits {
    gap: 1rem;
    padding: 1rem;
  }
  
  .character-portrait img {
    width: 120px;
    height: 120px;
  }
  
  .dialogue-container {
    padding: 1rem;
  }
  
  .dialogue-box {
    padding: 1.5rem;
  }
  
  .progress-indicator {
    position: static;
    margin: 1rem auto 0;
    text-align: center;
  }
  
  .story-controls {
    padding: 1rem;
    flex-wrap: wrap;
  }
  
  .modal-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .completion-actions {
    flex-direction: column;
  }
}
</style>