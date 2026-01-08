<template>
  <div class="story-renderer" v-if="storyStore.storyUIVisible">
    <!-- Story Background -->
    <div 
      class="story-background"
      :style="backgroundStyle"
    >
      <div class="background-overlay"></div>
      
      <!-- Parallax Layers -->
      <div 
        v-for="layer in parallaxLayers"
        :key="layer.zIndex"
        class="parallax-layer"
        :style="getParallaxStyle(layer)"
      ></div>
    </div>

    <!-- Character Display Area -->
    <div class="characters-container">
      <transition-group name="character" tag="div" class="characters-stage">
        <div
          v-for="character in currentCharacters"
          :key="character.id"
          class="character"
          :class="[
            `character-${character.id}`,
            `position-${character.position}`,
            `emotion-${character.emotion}`,
            { speaking: isSpeaking(character.id) }
          ]"
          :style="getCharacterStyle(character)"
        >
          <img 
            :src="character.avatar" 
            :alt="character.name"
            class="character-avatar"
            @load="onCharacterImageLoad"
            @error="onCharacterImageError"
          />
          
          <!-- Character Name Label -->
          <div class="character-name-label" v-if="showCharacterNames">
            {{ character.name }}
          </div>
          
          <!-- Speaking Indicator -->
          <div class="speaking-indicator" v-if="isSpeaking(character.id)">
            <div class="speaking-pulse"></div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Dialogue Box -->
    <transition name="dialogue-box" appear>
      <div 
        class="dialogue-container"
        v-if="currentDialogue"
        :class="{ 'vr-ready': vrModeActive }"
      >
        <div class="dialogue-box">
          <!-- Speaker Info -->
          <div class="speaker-info">
            <img 
              :src="currentSpeaker?.avatar" 
              :alt="currentSpeaker?.name"
              class="speaker-avatar"
            />
            <span class="speaker-name">{{ currentSpeaker?.name }}</span>
          </div>

          <!-- Dialogue Text -->
          <div class="dialogue-content">
            <p 
              ref="dialogueText"
              class="dialogue-text"
              :class="{ 'typewriter-active': isTypewriting }"
            >
              {{ displayedText }}
            </p>
            
            <!-- Skip Text Indicator -->
            <div class="skip-indicator" v-if="showSkipIndicator">
              <span class="skip-text">{{ skipText }}</span>
              <div class="skip-icon">⏭️</div>
            </div>
          </div>

          <!-- Dialogue Progress -->
          <div class="dialogue-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: dialogueProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">
              {{ storyStore.dialogueIndex + 1 }} / {{ totalDialogues }}
            </span>
          </div>
        </div>

        <!-- Advance Button -->
        <button
          class="advance-btn"
          @click="advanceDialogue"
          :disabled="!canAdvance"
          v-if="!isTypewriting || canSkipTypewriter"
        >
          <div class="btn-icon">
            {{ isLastDialogue ? '✓' : '→' }}
          </div>
          <div class="btn-text">
            {{ isLastDialogue ? 'Complete' : 'Next' }}
          </div>
        </button>
      </div>
    </transition>

    <!-- Choice Selection -->
    <transition name="choices" appear>
      <div class="choices-container" v-if="storyStore.canMakeChoices">
        <div class="choices-title">Choose your path:</div>
        <div class="choices-grid">
          <button
            v-for="choice in currentChoices"
            :key="choice.id"
            class="choice-btn"
            :class="{ 'vr-interactive': choice.vrAction }"
            @click="makeChoice(choice.id)"
            @mouseenter="previewChoice(choice)"
            @mouseleave="clearChoicePreview"
          >
            <div class="choice-text">{{ choice.text }}</div>
            
            <!-- Choice Consequences Preview -->
            <div class="choice-consequences" v-if="previewedChoice === choice.id">
              <div
                v-for="consequence in choice.consequences"
                :key="consequence.type + consequence.target"
                class="consequence-item"
                :class="`consequence-${consequence.type}`"
              >
                <span class="consequence-icon">{{ getConsequenceIcon(consequence) }}</span>
                <span class="consequence-text">{{ getConsequenceText(consequence) }}</span>
              </div>
            </div>
            
            <!-- VR Interaction Hint -->
            <div class="vr-hint" v-if="choice.vrAction && vrModeActive">
              <span class="hint-icon">🥽</span>
              <span class="hint-text">{{ getVRActionHint(choice.vrAction) }}</span>
            </div>
          </button>
        </div>
      </div>
    </transition>

    <!-- Story Controls -->
    <div class="story-controls">
      <!-- Auto Play Toggle -->
      <button
        class="control-btn auto-play-btn"
        :class="{ active: storyStore.isAutoPlay }"
        @click="storyStore.toggleAutoPlay()"
        v-if="storyStore.showAutoPlayButton"
      >
        <div class="control-icon">{{ storyStore.isAutoPlay ? '⏸️' : '▶️' }}</div>
        <div class="control-label">Auto</div>
      </button>

      <!-- Skip Button -->
      <button
        class="control-btn skip-btn"
        @click="skipToNextScene"
        v-if="storyStore.showSkipButton && canSkipScene"
      >
        <div class="control-icon">⏭️</div>
        <div class="control-label">Skip</div>
      </button>

      <!-- Text Speed Control -->
      <div class="text-speed-control">
        <label class="speed-label">Speed</label>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          v-model="storyStore.textSpeed"
          class="speed-slider"
        />
        <span class="speed-value">{{ storyStore.textSpeed }}</span>
      </div>

      <!-- VR Transition Button -->
      <button
        class="control-btn vr-transition-btn"
        :class="{ available: storyStore.vrTransitionPending }"
        @click="initiateVRTransition"
        v-if="storyStore.vrTransitionPending"
      >
        <div class="control-icon">🥽</div>
        <div class="control-label">Enter VR</div>
      </button>

      <!-- Save Menu Toggle -->
      <button
        class="control-btn save-btn"
        @click="toggleSaveMenu"
      >
        <div class="control-icon">💾</div>
        <div class="control-label">Save</div>
      </button>
    </div>

    <!-- Save/Load Menu -->
    <transition name="save-menu">
      <div class="save-menu" v-if="storyStore.showSaveMenu">
        <div class="save-menu-content">
          <h3 class="save-menu-title">Save & Load</h3>
          
          <!-- Manual Save -->
          <div class="save-section">
            <input
              v-model="saveDescription"
              placeholder="Save description..."
              class="save-input"
              maxlength="50"
            />
            <button
              class="save-action-btn create-save"
              @click="createSave"
              :disabled="!saveDescription.trim()"
            >
              Create Save Point
            </button>
          </div>

          <!-- Save Points List -->
          <div class="save-points-list">
            <div
              v-for="savePoint in savePoints"
              :key="savePoint.id"
              class="save-point-item"
              @click="loadSavePoint(savePoint.id)"
            >
              <div class="save-point-info">
                <div class="save-point-description">{{ savePoint.description }}</div>
                <div class="save-point-details">
                  <span class="save-date">{{ formatSaveDate(savePoint.timestamp) }}</span>
                  <span class="save-chapter">{{ savePoint.chapterId }}</span>
                </div>
              </div>
              <div class="save-point-actions">
                <button class="load-btn" @click.stop="loadSavePoint(savePoint.id)">
                  Load
                </button>
              </div>
            </div>
          </div>

          <button class="close-save-menu" @click="closeSaveMenu">
            Close
          </button>
        </div>
      </div>
    </transition>

    <!-- VR Scenario Preview Modal -->
    <VRScenarioPreview
      v-if="showVRPreview"
      :scenario="storyStore.currentVRScenario"
      @close="closeVRPreview"
      @start-vr="startVRScenario"
    />

    <!-- Story Progress Indicator -->
    <div class="story-progress-indicator">
      <div class="chapter-info">
        <span class="chapter-title">{{ storyStore.currentChapter?.title }}</span>
        <span class="scene-title">{{ storyStore.currentScene?.title }}</span>
      </div>
      <div class="progress-stats">
        <span class="completion-percentage">
          {{ storyStore.completionStats.overallProgress }}% Complete
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useStoryState } from '@/stores/storyState'
import VRScenarioPreview from '@/components/vr/VRScenarioPreview.vue'
import type { 
  Character, 
  Dialogue, 
  Choice, 
  ChoiceConsequence,
  VRInteraction 
} from '@/story/types/StoryTypes'

const storyStore = useStoryState()

// ======= Component State =======
const dialogueText = ref<HTMLElement>()
const displayedText = ref('')
const isTypewriting = ref(false)
const previewedChoice = ref<string | null>(null)
const showVRPreview = ref(false)
const saveDescription = ref('')
const showCharacterNames = ref(true)
const canSkipTypewriter = ref(true)
const vrModeActive = ref(false)

// Auto-play timer
let autoPlayTimer: number | null = null
let typewriterTimer: number | null = null

// ======= Computed Properties =======

const currentDialogue = computed(() => storyStore.currentDialogue)
const currentCharacters = computed(() => storyStore.currentScene?.characters || [])
const currentChoices = computed(() => storyStore.currentScene?.choices || [])
const totalDialogues = computed(() => storyStore.currentScene?.dialogues?.length || 0)

const currentSpeaker = computed(() => {
  if (!currentDialogue.value) return null
  return currentCharacters.value.find(char => char.id === currentDialogue.value!.characterId)
})

const backgroundStyle = computed(() => ({
  backgroundImage: `url(${storyStore.currentBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

const parallaxLayers = computed(() => {
  return storyStore.currentScene?.background?.parallax || []
})

const dialogueProgress = computed(() => {
  if (totalDialogues.value === 0) return 0
  return ((storyStore.dialogueIndex + 1) / totalDialogues.value) * 100
})

const canAdvance = computed(() => {
  return storyStore.canAdvanceStory && !isTypewriting.value
})

const isLastDialogue = computed(() => {
  return storyStore.dialogueIndex >= totalDialogues.value - 1
})

const canSkipScene = computed(() => {
  return storyStore.currentScene && totalDialogues.value > 0
})

const showSkipIndicator = computed(() => {
  return isTypewriting.value && canSkipTypewriter.value
})

const skipText = computed(() => {
  return 'Click to skip'
})

const savePoints = computed(() => storyStore.getSavePoints())

// ======= Character Animations =======

function getCharacterStyle(character: Character) {
  const baseStyle = {
    transform: 'translateX(0)',
    opacity: 1,
    filter: 'brightness(1)'
  }

  // Speaking character highlight
  if (isSpeaking(character.id)) {
    baseStyle.filter = 'brightness(1.2)'
  }

  // Position-based transforms
  switch (character.position) {
    case 'left':
      baseStyle.transform = 'translateX(-20px)'
      break
    case 'right':
      baseStyle.transform = 'translateX(20px)'
      break
    case 'center':
      baseStyle.transform = 'translateX(0)'
      break
  }

  return baseStyle
}

function getParallaxStyle(layer: any) {
  return {
    backgroundImage: `url(${layer.image})`,
    transform: `translateX(${layer.speed * 10}px)`,
    zIndex: layer.zIndex
  }
}

function isSpeaking(characterId: string): boolean {
  return currentDialogue.value?.characterId === characterId
}

// ======= Typewriter Effect =======

function startTypewriter(text: string, speed: number = 50): Promise<void> {
  return new Promise((resolve) => {
    displayedText.value = ''
    isTypewriting.value = true
    let index = 0

    const typeNext = () => {
      if (index < text.length) {
        displayedText.value += text[index]
        index++

        const char = text[index - 1]
        const isPunctuation = /[.!?]/.test(char)
        const delay = isPunctuation ? 200 : 1000 / speed

        typewriterTimer = setTimeout(typeNext, delay)
      } else {
        isTypewriting.value = false
        resolve()
      }
    }

    typeNext()
  })
}

function skipTypewriter(): void {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
  displayedText.value = currentDialogue.value?.text || ''
  isTypewriting.value = false
}

// ======= Dialogue Management =======

async function advanceDialogue(): Promise<void> {
  if (isTypewriting.value && canSkipTypewriter.value) {
    skipTypewriter()
    return
  }

  if (!canAdvance.value) return

  await storyStore.advanceDialogue()
  
  // Start typewriter for new dialogue
  if (currentDialogue.value) {
    await startTypewriter(currentDialogue.value.text, storyStore.textSpeed)
  }

  // Setup auto-play if enabled
  if (storyStore.isAutoPlay && storyStore.hasActiveDialogue) {
    setupAutoPlay()
  }
}

function setupAutoPlay(): void {
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
  }

  const delay = currentDialogue.value?.duration || 3000
  autoPlayTimer = setTimeout(() => {
    if (storyStore.isAutoPlay && canAdvance.value) {
      advanceDialogue()
    }
  }, delay)
}

async function skipToNextScene(): Promise<void> {
  await storyStore.skipToNextScene()
}

// ======= Choice System =======

async function makeChoice(choiceId: string): Promise<void> {
  await storyStore.makeChoice(choiceId)
  clearChoicePreview()
}

function previewChoice(choice: Choice): void {
  previewedChoice.value = choice.id
}

function clearChoicePreview(): void {
  previewedChoice.value = null
}

function getConsequenceIcon(consequence: ChoiceConsequence): string {
  const icons = {
    relationship: '💖',
    crystal: '💎',
    skill: '📈',
    unlock: '🔓'
  }
  return icons[consequence.type] || '✨'
}

function getConsequenceText(consequence: ChoiceConsequence): string {
  const value = consequence.value > 0 ? `+${consequence.value}` : `${consequence.value}`
  return `${consequence.target} ${value}`
}

function getVRActionHint(vrAction: VRInteraction): string {
  const hints = {
    gesture: 'Use hand gestures',
    voice: 'Speak your choice',
    gaze: 'Look to select',
    touch: 'Touch to choose'
  }
  return hints[vrAction.type] || 'VR interaction available'
}

// ======= VR Integration =======

async function initiateVRTransition(): Promise<void> {
  if (!storyStore.currentVRScenario) return
  showVRPreview.value = true
}

function closeVRPreview(): void {
  showVRPreview.value = false
}

async function startVRScenario(scenarioId: string): Promise<void> {
  try {
    await storyStore.startVRScenario(scenarioId)
    showVRPreview.value = false
  } catch (error) {
    logger.error('Failed to start VR scenario:', error)
  }
}

// ======= Save System =======

function toggleSaveMenu(): void {
  storyStore.showSaveMenu = !storyStore.showSaveMenu
}

function closeSaveMenu(): void {
  storyStore.showSaveMenu = false
}

function createSave(): void {
  if (!saveDescription.value.trim()) return
  
  storyStore.createManualSavePoint(saveDescription.value.trim())
  saveDescription.value = ''
}

async function loadSavePoint(savePointId: string): Promise<void> {
  const success = await storyStore.loadFromSavePoint(savePointId)
  if (success) {
    closeSaveMenu()
    // Reset dialogue display
    if (currentDialogue.value) {
      displayedText.value = currentDialogue.value.text
    }
  }
}

function formatSaveDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

// ======= Event Handlers =======

function onCharacterImageLoad(): void {
  // Character image loaded successfully
}

function onCharacterImageError(event: Event): void {
  logger.warn('Failed to load character image:', event)
  // Could set a fallback image here
}

// ======= Keyboard Shortcuts =======

function handleKeyPress(event: KeyboardEvent): void {
  switch (event.code) {
    case 'Enter':
    case 'Space':
      event.preventDefault()
      if (storyStore.canMakeChoices) return // Don't advance when choices are available
      advanceDialogue()
      break
    
    case 'Escape':
      event.preventDefault()
      if (storyStore.showSaveMenu) {
        closeSaveMenu()
      } else if (showVRPreview.value) {
        closeVRPreview()
      }
      break
    
    case 'KeyS':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        toggleSaveMenu()
      }
      break
      
    case 'KeyA':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        storyStore.toggleAutoPlay()
      }
      break
  }
}

// ======= Lifecycle =======

onMounted(async () => {
  document.addEventListener('keydown', handleKeyPress)
  
  // Initialize dialogue display
  if (currentDialogue.value) {
    await startTypewriter(currentDialogue.value.text, storyStore.textSpeed)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
  }
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
  }
})

// ======= Watchers =======

watch(() => currentDialogue.value, async (newDialogue) => {
  if (newDialogue) {
    await nextTick()
    await startTypewriter(newDialogue.text, storyStore.textSpeed)
    
    if (storyStore.isAutoPlay) {
      setupAutoPlay()
    }
  }
})

watch(() => storyStore.isAutoPlay, (isAutoPlay) => {
  if (autoPlayTimer) {
    clearTimeout(autoPlayTimer)
    autoPlayTimer = null
  }
  
  if (isAutoPlay && storyStore.hasActiveDialogue) {
    setupAutoPlay()
  }
})

watch(() => storyStore.textSpeed, () => {
  // Speed change affects future typewriter instances
})
</script>

<style scoped>
.story-renderer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  overflow: hidden;
}

/* Background */
.story-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: background-image 1s ease-in-out;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 120%;
  height: 100%;
  background-size: cover;
  background-repeat: repeat-x;
  opacity: 0.6;
  transition: transform 0.1s ease-out;
}

/* Characters */
.characters-container {
  position: absolute;
  bottom: 30%;
  left: 0;
  width: 100%;
  height: 40%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.characters-stage {
  display: flex;
  width: 80%;
  height: 100%;
  justify-content: space-around;
  align-items: flex-end;
}

.character {
  position: relative;
  max-height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(0.8);
}

.character.speaking {
  filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  transform: scale(1.05);
}

.character-avatar {
  max-height: 100%;
  max-width: 300px;
  object-fit: contain;
  transition: filter 0.3s ease;
}

.character-name-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.speaking-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
}

.speaking-pulse {
  width: 100%;
  height: 100%;
  background: #00ff88;
  border-radius: 50%;
  animation: speaking-pulse 1s ease-in-out infinite;
}

/* Character Transitions */
.character-enter-active,
.character-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.character-enter-from {
  opacity: 0;
  transform: translateX(-100px) scale(0.8);
}

.character-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

/* Dialogue Box */
.dialogue-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  z-index: 100;
}

.dialogue-box {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(20, 20, 40, 0.9));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.dialogue-container.vr-ready {
  border-color: rgba(78, 205, 196, 0.5);
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.2);
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.speaker-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.speaker-name {
  color: #4ecdc4;
  font-weight: 600;
  font-size: 16px;
}

.dialogue-content {
  position: relative;
  margin-bottom: 15px;
}

.dialogue-text {
  color: white;
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  min-height: 60px;
}

.dialogue-text.typewriter-active {
  border-right: 2px solid #4ecdc4;
  animation: typewriter-cursor 1s infinite;
}

.skip-indicator {
  position: absolute;
  bottom: -10px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.skip-icon {
  animation: bounce 1s infinite;
}

.dialogue-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ecdc4, #00ff88);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  min-width: 50px;
  text-align: right;
}

.advance-btn {
  position: absolute;
  bottom: -25px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(45deg, #4ecdc4, #00ff88);
  border: none;
  border-radius: 25px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.advance-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
}

.advance-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dialogue Transitions */
.dialogue-box-enter-active,
.dialogue-box-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialogue-box-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.9);
}

.dialogue-box-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.9);
}

/* Choices */
.choices-container {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 110;
}

.choices-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}

.choices-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-btn {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 15px 20px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.choice-btn:hover {
  border-color: rgba(78, 205, 196, 0.5);
  background: rgba(78, 205, 196, 0.1);
  transform: translateX(5px);
}

.choice-btn.vr-interactive {
  border-color: rgba(255, 107, 157, 0.5);
}

.choice-text {
  font-size: 16px;
  line-height: 1.4;
}

.choice-consequences {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.consequence-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 12px;
}

.vr-hint {
  position: absolute;
  top: 10px;
  right: 15px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 107, 157, 0.8);
}

/* Choices Transitions */
.choices-enter-active,
.choices-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.choices-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.choices-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Story Controls */
.story-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 120;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.control-btn.active {
  background: linear-gradient(45deg, #4ecdc4, #00ff88);
  border-color: transparent;
}

.control-btn.available {
  background: linear-gradient(45deg, #ff6b9d, #4ecdc4);
  animation: vr-available-pulse 2s ease-in-out infinite;
}

.control-icon {
  font-size: 16px;
}

.control-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-speed-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 12px;
}

.speed-label {
  font-size: 10px;
  color: white;
  text-transform: uppercase;
}

.speed-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #4ecdc4;
  border-radius: 50%;
  cursor: pointer;
}

.speed-value {
  font-size: 10px;
  color: #4ecdc4;
  font-weight: 600;
}

/* Save Menu */
.save-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  z-index: 200;
  overflow-y: auto;
}

.save-menu-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.save-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.save-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
}

.save-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.save-action-btn {
  background: linear-gradient(45deg, #4ecdc4, #00ff88);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
}

.save-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-points-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.save-point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-point-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.save-point-description {
  color: white;
  font-weight: 600;
  margin-bottom: 4px;
}

.save-point-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.load-btn {
  background: rgba(78, 205, 196, 0.2);
  border: 1px solid rgba(78, 205, 196, 0.5);
  border-radius: 6px;
  padding: 4px 12px;
  color: #4ecdc4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-btn:hover {
  background: rgba(78, 205, 196, 0.3);
  border-color: rgba(78, 205, 196, 0.7);
}

.close-save-menu {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-save-menu:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Save Menu Transitions */
.save-menu-enter-active,
.save-menu-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.save-menu-enter-from,
.save-menu-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Story Progress Indicator */
.story-progress-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: white;
  z-index: 120;
}

.chapter-title {
  font-size: 16px;
  font-weight: 600;
  color: #4ecdc4;
  display: block;
}

.scene-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 2px;
}

.completion-percentage {
  font-size: 12px;
  color: #00ff88;
  font-weight: 600;
  margin-top: 4px;
  display: block;
}

/* Animations */
@keyframes speaking-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

@keyframes typewriter-cursor {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes vr-available-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 107, 157, 0.5); }
  50% { box-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dialogue-container {
    width: 95%;
    bottom: 10px;
  }
  
  .dialogue-box {
    padding: 15px;
  }
  
  .dialogue-text {
    font-size: 16px;
  }
  
  .choices-container {
    width: 95%;
    bottom: 180px;
  }
  
  .choice-btn {
    padding: 12px 15px;
  }
  
  .choice-text {
    font-size: 14px;
  }
  
  .story-controls {
    top: 10px;
    right: 10px;
    gap: 8px;
  }
  
  .control-btn {
    min-width: 50px;
    padding: 6px 8px;
  }
  
  .story-progress-indicator {
    top: 10px;
    left: 10px;
    padding: 8px 12px;
  }
  
  .save-menu {
    width: 95%;
    max-width: 350px;
  }
}
</style>