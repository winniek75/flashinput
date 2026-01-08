<template>
  <div 
    v-if="isPlaying" 
    class="cutscene-player"
    :class="{ 'fullscreen': isFullscreen }"
    @click="handleClick"
  >
    <!-- Cutscene Canvas -->
    <div class="cutscene-canvas" ref="canvasContainer">
      <!-- Background Layer -->
      <div 
        class="background-layer"
        :style="backgroundStyle"
      >
        <img 
          v-if="currentScene.background"
          :src="currentScene.background"
          :alt="currentScene.title"
          class="background-image"
          :style="cameraStyle"
        />
      </div>

      <!-- Particle Effects Layer -->
      <div class="particles-layer">
        <div 
          v-for="particle in activeParticles" 
          :key="particle.id"
          class="particle"
          :style="getParticleStyle(particle)"
        >
          {{ particle.symbol }}
        </div>
      </div>

      <!-- Characters Layer -->
      <div class="characters-layer">
        <div
          v-for="character in currentScene.characters"
          :key="character.id"
          class="cutscene-character"
          :style="getCharacterStyle(character)"
        >
          <CharacterPortrait
            :character="getCharacterData(character.id)"
            :emotion="character.emotion"
            :size="character.size || 'large'"
            :animation-type="character.animation"
            :show-name-label="false"
            @animation-complete="onCharacterAnimationComplete"
          />
        </div>
      </div>

      <!-- UI Overlay Layer -->
      <div class="ui-overlay">
        <!-- Skip Button -->
        <button 
          v-if="allowSkip"
          @click="skipCutscene"
          class="skip-button"
        >
          Skip <span class="skip-icon">⏭️</span>
        </button>

        <!-- Progress Bar -->
        <div class="progress-container">
          <div 
            class="progress-bar"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>

        <!-- Dialogue Box -->
        <div 
          v-if="currentDialogue"
          class="dialogue-container"
          :class="{ 'visible': showDialogue }"
        >
          <div class="dialogue-box">
            <div v-if="currentDialogue.speaker !== 'narrator'" class="speaker-name">
              {{ getCharacterName(currentDialogue.speaker) }}
            </div>
            <div class="dialogue-text">
              <span 
                v-for="(char, index) in displayedText" 
                :key="index"
                class="dialogue-char"
                :style="{ animationDelay: index * 0.03 + 's' }"
              >
                {{ char }}
              </span>
            </div>
            <div class="dialogue-continue">
              <span class="continue-hint">{{ continueHint }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Transition Effects -->
      <div 
        class="transition-overlay"
        :class="transitionClass"
      ></div>
    </div>

    <!-- Audio Controller -->
    <audio 
      ref="bgmPlayer"
      :src="currentBGM"
      loop
      @loadeddata="onBGMLoaded"
    ></audio>
    <audio 
      ref="sfxPlayer"
      :src="currentSFX"
      @ended="onSFXEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import CharacterPortrait from './CharacterPortrait.vue'
import { CharacterDatabase, type Character } from '@/story/characters/CharacterDatabase'
import { gsap } from 'gsap'

// Props
interface Props {
  cutsceneData: CutsceneData
  allowSkip?: boolean
  autoPlay?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allowSkip: true,
  autoPlay: true,
  fullscreen: true
})

// Emits
const emit = defineEmits<{
  complete: []
  skip: []
  sceneChange: [sceneId: string]
  dialogueComplete: [dialogue: DialogueEntry]
}>()

// Interfaces
interface CutsceneData {
  id: string
  title: string
  scenes: CutsceneScene[]
  duration?: number
  music?: string
}

interface CutsceneScene {
  id: string
  duration: number
  background?: string
  characters: CutsceneCharacter[]
  dialogue?: DialogueEntry[]
  camera?: CameraInstruction[]
  effects?: EffectInstruction[]
  audio?: AudioInstruction[]
}

interface CutsceneCharacter {
  id: string
  position: string
  emotion: string
  animation?: string
  size?: string
  enterTime?: number
  exitTime?: number
}

interface DialogueEntry {
  speaker: string
  text: string
  startTime: number
  duration?: number
  emotion?: string
}

interface CameraInstruction {
  type: 'pan' | 'zoom' | 'shake' | 'rotate'
  startTime: number
  duration: number
  parameters: Record<string, any>
}

interface EffectInstruction {
  type: string
  startTime: number
  duration: number
  parameters: Record<string, any>
}

interface AudioInstruction {
  type: 'bgm' | 'sfx'
  startTime: number
  file: string
  volume?: number
  fadeIn?: boolean
  fadeOut?: boolean
}

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  symbol: string
  color: string
  life: number
  maxLife: number
  size: number
}

// Reactive State
const isPlaying = ref(false)
const isFullscreen = ref(props.fullscreen)
const currentSceneIndex = ref(0)
const currentDialogueIndex = ref(0)
const currentTime = ref(0)
const displayedText = ref('')
const showDialogue = ref(false)
const transitionClass = ref('')
const activeParticles = ref<Particle[]>([])

// Audio
const currentBGM = ref('')
const currentSFX = ref('')
const bgmPlayer = ref<HTMLAudioElement>()
const sfxPlayer = ref<HTMLAudioElement>()

// Refs
const canvasContainer = ref<HTMLElement>()

// Camera State
const cameraState = ref({
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0
})

// Animation Timeline
let mainTimeline: gsap.core.Timeline | null = null
let dialogueTimeline: gsap.core.Timeline | null = null

// Computed Properties
const currentScene = computed(() => {
  return props.cutsceneData.scenes[currentSceneIndex.value] || props.cutsceneData.scenes[0]
})

const currentDialogue = computed(() => {
  const dialogue = currentScene.value.dialogue
  return dialogue ? dialogue[currentDialogueIndex.value] : null
})

const progressPercent = computed(() => {
  const totalDuration = props.cutsceneData.duration || 
    props.cutsceneData.scenes.reduce((sum, scene) => sum + scene.duration, 0)
  return (currentTime.value / totalDuration) * 100
})

const backgroundStyle = computed(() => {
  return {
    backgroundImage: currentScene.value.background ? `url(${currentScene.value.background})` : 'none',
    filter: `brightness(${1 + cameraState.value.scale * 0.1})`
  }
})

const cameraStyle = computed(() => {
  return {
    transform: `
      translateX(${cameraState.value.x}px) 
      translateY(${cameraState.value.y}px) 
      scale(${cameraState.value.scale}) 
      rotate(${cameraState.value.rotation}deg)
    `,
    transformOrigin: 'center center'
  }
})

const continueHint = computed(() => {
  return 'Click to continue'
})

// Methods
const startCutscene = async () => {
  isPlaying.value = true
  currentSceneIndex.value = 0
  currentDialogueIndex.value = 0
  currentTime.value = 0
  
  await nextTick()
  setupScene()
  
  if (props.autoPlay) {
    playScene()
  }
}

const setupScene = () => {
  const scene = currentScene.value
  
  // Setup background music
  if (scene.audio) {
    const bgmInstruction = scene.audio.find(a => a.type === 'bgm')
    if (bgmInstruction) {
      currentBGM.value = bgmInstruction.file
    }
  }
  
  // Initialize particles
  if (scene.effects) {
    scene.effects.forEach(effect => {
      if (effect.type === 'particles') {
        scheduleParticleEffect(effect)
      }
    })
  }
  
  emit('sceneChange', scene.id)
}

const playScene = () => {
  const scene = currentScene.value
  
  // Create main timeline
  mainTimeline = gsap.timeline({
    onUpdate: () => {
      currentTime.value += 1/60 // Assuming 60fps
    },
    onComplete: () => {
      nextScene()
    }
  })
  
  // Schedule camera movements
  if (scene.camera) {
    scene.camera.forEach(camera => {
      scheduleCameraMove(camera)
    })
  }
  
  // Schedule dialogue
  if (scene.dialogue) {
    scene.dialogue.forEach((dialogue, index) => {
      scheduleDialogue(dialogue, index)
    })
  }
  
  // Schedule effects
  if (scene.effects) {
    scene.effects.forEach(effect => {
      scheduleEffect(effect)
    })
  }
  
  // Schedule audio
  if (scene.audio) {
    scene.audio.forEach(audio => {
      scheduleAudio(audio)
    })
  }
  
  // Play BGM
  if (bgmPlayer.value && currentBGM.value) {
    bgmPlayer.value.volume = 0.3
    bgmPlayer.value.play()
  }
}

const scheduleCameraMove = (camera: CameraInstruction) => {
  if (!mainTimeline) return
  
  const startTime = camera.startTime / 1000 // Convert to seconds
  
  switch (camera.type) {
    case 'pan':
      mainTimeline.to(cameraState.value, {
        x: camera.parameters.x || 0,
        y: camera.parameters.y || 0,
        duration: camera.duration / 1000,
        ease: 'power2.inOut'
      }, startTime)
      break
      
    case 'zoom':
      mainTimeline.to(cameraState.value, {
        scale: camera.parameters.scale || 1,
        duration: camera.duration / 1000,
        ease: 'power2.inOut'
      }, startTime)
      break
      
    case 'shake':
      mainTimeline.to(cameraState.value, {
        x: `+=${camera.parameters.intensity || 10}`,
        y: `+=${camera.parameters.intensity || 10}`,
        duration: 0.1,
        repeat: (camera.duration / 100) - 1,
        yoyo: true,
        ease: 'power2.inOut'
      }, startTime)
      break
      
    case 'rotate':
      mainTimeline.to(cameraState.value, {
        rotation: camera.parameters.rotation || 0,
        duration: camera.duration / 1000,
        ease: 'power2.inOut'
      }, startTime)
      break
  }
}

const scheduleDialogue = (dialogue: DialogueEntry, index: number) => {
  if (!mainTimeline) return
  
  const startTime = dialogue.startTime / 1000
  
  mainTimeline.call(() => {
    currentDialogueIndex.value = index
    showDialogueText(dialogue.text)
  }, [], startTime)
}

const showDialogueText = (text: string) => {
  displayedText.value = ''
  showDialogue.value = true
  
  // Create typewriter effect
  dialogueTimeline = gsap.timeline()
  
  const chars = text.split('')
  chars.forEach((char, index) => {
    dialogueTimeline.call(() => {
      displayedText.value += char
    }, [], index * 0.03)
  })
  
  dialogueTimeline.call(() => {
    if (currentDialogue.value) {
      emit('dialogueComplete', currentDialogue.value)
    }
  }, [], chars.length * 0.03)
}

const scheduleEffect = (effect: EffectInstruction) => {
  if (!mainTimeline) return
  
  const startTime = effect.startTime / 1000
  
  switch (effect.type) {
    case 'flash':
      mainTimeline.call(() => {
        transitionClass.value = 'flash'
        setTimeout(() => {
          transitionClass.value = ''
        }, effect.duration)
      }, [], startTime)
      break
      
    case 'fade':
      mainTimeline.call(() => {
        transitionClass.value = 'fade-out'
        setTimeout(() => {
          transitionClass.value = 'fade-in'
          setTimeout(() => {
            transitionClass.value = ''
          }, effect.duration / 2)
        }, effect.duration / 2)
      }, [], startTime)
      break
      
    case 'particles':
      mainTimeline.call(() => {
        createParticles(effect.parameters)
      }, [], startTime)
      break
  }
}

const scheduleParticleEffect = (effect: EffectInstruction) => {
  setTimeout(() => {
    createParticles(effect.parameters)
  }, effect.startTime)
}

const createParticles = (params: Record<string, any>) => {
  const count = params.count || 20
  const symbols = params.symbols || ['✨', '⭐', '💫']
  const colors = params.colors || ['#FFD700', '#87CEEB', '#FF69B4']
  
  for (let i = 0; i < count; i++) {
    const particle: Particle = {
      id: `particle_${Date.now()}_${i}`,
      x: Math.random() * (canvasContainer.value?.clientWidth || 800),
      y: Math.random() * (canvasContainer.value?.clientHeight || 600),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: params.duration || 3000,
      size: params.size || 1
    }
    
    activeParticles.value.push(particle)
  }
}

const updateParticles = () => {
  activeParticles.value = activeParticles.value.filter(particle => {
    particle.life += 16 // ~60fps
    particle.x += particle.vx
    particle.y += particle.vy
    
    // Fade out over time
    const alpha = 1 - (particle.life / particle.maxLife)
    if (alpha <= 0) {
      return false
    }
    
    return particle.life < particle.maxLife
  })
}

const scheduleAudio = (audio: AudioInstruction) => {
  if (!mainTimeline) return
  
  const startTime = audio.startTime / 1000
  
  mainTimeline.call(() => {
    if (audio.type === 'sfx') {
      currentSFX.value = audio.file
      if (sfxPlayer.value) {
        sfxPlayer.value.volume = audio.volume || 0.5
        sfxPlayer.value.play()
      }
    }
  }, [], startTime)
}

const getCharacterStyle = (character: CutsceneCharacter) => {
  const positions = {
    'left': { left: '10%', transform: 'translateX(0)' },
    'center': { left: '50%', transform: 'translateX(-50%)' },
    'right': { left: '90%', transform: 'translateX(-100%)' },
    'far-left': { left: '5%', transform: 'translateX(0)' },
    'far-right': { left: '95%', transform: 'translateX(-100%)' }
  }
  
  return {
    position: 'absolute',
    bottom: '20%',
    ...(positions[character.position as keyof typeof positions] || positions.center),
    zIndex: 10
  }
}

const getCharacterData = (characterId: string): Character => {
  return CharacterDatabase[characterId] || CharacterDatabase.captain_nova
}

const getCharacterName = (characterId: string): string => {
  if (characterId === 'narrator') return ''
  return getCharacterData(characterId).name
}

const getParticleStyle = (particle: Particle) => {
  const alpha = 1 - (particle.life / particle.maxLife)
  return {
    position: 'absolute',
    left: particle.x + 'px',
    top: particle.y + 'px',
    color: particle.color,
    fontSize: (16 * particle.size) + 'px',
    opacity: alpha,
    pointerEvents: 'none',
    transform: `scale(${particle.size})`,
    zIndex: 5
  }
}

const handleClick = () => {
  if (showDialogue.value && dialogueTimeline?.progress() === 1) {
    // Continue to next dialogue or scene
    nextDialogue()
  } else if (dialogueTimeline && dialogueTimeline.progress() < 1) {
    // Complete current dialogue instantly
    dialogueTimeline.progress(1)
  }
}

const nextDialogue = () => {
  const scene = currentScene.value
  if (scene.dialogue && currentDialogueIndex.value < scene.dialogue.length - 1) {
    currentDialogueIndex.value++
    const nextDialogue = scene.dialogue[currentDialogueIndex.value]
    showDialogueText(nextDialogue.text)
  } else {
    showDialogue.value = false
    nextScene()
  }
}

const nextScene = () => {
  if (currentSceneIndex.value < props.cutsceneData.scenes.length - 1) {
    currentSceneIndex.value++
    currentDialogueIndex.value = 0
    setupScene()
    playScene()
  } else {
    completeCutscene()
  }
}

const skipCutscene = () => {
  stopCutscene()
  emit('skip')
}

const completeCutscene = () => {
  stopCutscene()
  emit('complete')
}

const stopCutscene = () => {
  isPlaying.value = false
  
  if (mainTimeline) {
    mainTimeline.kill()
    mainTimeline = null
  }
  
  if (dialogueTimeline) {
    dialogueTimeline.kill()
    dialogueTimeline = null
  }
  
  if (bgmPlayer.value) {
    bgmPlayer.value.pause()
  }
  
  if (sfxPlayer.value) {
    sfxPlayer.value.pause()
  }
  
  activeParticles.value = []
}

// Audio Event Handlers
const onBGMLoaded = () => {
  if (bgmPlayer.value) {
    bgmPlayer.value.volume = 0.3
  }
}

const onSFXEnded = () => {
  currentSFX.value = ''
}

const onCharacterAnimationComplete = (character: Character, animationType: string) => {
  // Handle character animation completion if needed
}

// Particle Animation Loop
let animationFrame: number
const animate = () => {
  updateParticles()
  animationFrame = requestAnimationFrame(animate)
}

// Lifecycle
onMounted(() => {
  animate()
  if (props.autoPlay) {
    startCutscene()
  }
})

onUnmounted(() => {
  stopCutscene()
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

// Watch for data changes
watch(() => props.cutsceneData, () => {
  if (isPlaying.value) {
    stopCutscene()
    startCutscene()
  }
}, { deep: true })

// Expose methods
defineExpose({
  startCutscene,
  stopCutscene,
  skipCutscene
})
</script>

<style scoped>
.cutscene-player {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1000;
  overflow: hidden;
}

.cutscene-canvas {
  position: relative;
  width: 100%;
  height: 100%;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.particles-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  font-size: 16px;
  pointer-events: none;
  animation: particle-float 3s ease-out;
}

@keyframes particle-float {
  0% { 
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  20% { 
    opacity: 1;
    transform: scale(1) rotate(90deg);
  }
  80% { 
    opacity: 1;
    transform: scale(1.2) rotate(270deg);
  }
  100% { 
    opacity: 0;
    transform: scale(0) rotate(360deg);
  }
}

.characters-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.cutscene-character {
  position: absolute;
  transition: all 0.5s ease;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  pointer-events: none;
}

.skip-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid #fff;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.skip-icon {
  margin-left: 5px;
}

.progress-container {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0080ff);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.dialogue-container {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 800px;
  opacity: 0;
  pointer-events: all;
  transition: opacity 0.3s ease;
}

.dialogue-container.visible {
  opacity: 1;
}

.dialogue-box {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 50, 0.9));
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  padding: 20px 30px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.speaker-name {
  color: #00ffff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.dialogue-text {
  color: white;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
  min-height: 1.6em;
}

.dialogue-char {
  animation: char-appear 0.1s ease-out both;
}

@keyframes char-appear {
  0% { 
    opacity: 0;
    transform: translateY(10px);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

.dialogue-continue {
  text-align: right;
}

.continue-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.transition-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 30;
}

.transition-overlay.flash {
  background: white;
  animation: flash-effect 0.3s ease-out;
}

.transition-overlay.fade-out {
  background: black;
  animation: fade-out-effect 0.5s ease-out;
}

.transition-overlay.fade-in {
  background: black;
  animation: fade-in-effect 0.5s ease-out;
}

@keyframes flash-effect {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes fade-out-effect {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes fade-in-effect {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .dialogue-container {
    width: 95%;
    bottom: 60px;
  }
  
  .dialogue-box {
    padding: 15px 20px;
  }
  
  .dialogue-text {
    font-size: 16px;
  }
  
  .skip-button {
    top: 10px;
    right: 10px;
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .progress-container {
    width: 90%;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
  }
  
  .dialogue-char {
    animation: none;
  }
  
  .background-image {
    transition: none;
  }
}
</style>