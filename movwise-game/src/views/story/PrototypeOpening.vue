<template>
  <div class="prototype-opening" :class="{ 'transitioning': isTransitioning }">
    <!-- Background Layer -->
    <div class="background-layer" :style="backgroundStyle">
      <div class="stars-overlay"></div>
    </div>

    <!-- Character Layer -->
    <div class="character-layer">
      <transition name="character-fade">
        <div 
          v-if="currentScene?.character"
          class="character-placeholder"
          :class="`character-${currentScene.character.id}`"
          :style="characterStyle"
        >
          <div class="character-circle">
            {{ currentScene.character.name }}
          </div>
          <div class="character-label">{{ currentScene.character.name }}</div>
        </div>
      </transition>
    </div>

    <!-- Story Text Layer -->
    <div class="story-layer">
      <transition name="text-fade">
        <div v-if="currentScene" class="story-content">
          <h2 class="scene-title">{{ currentScene.title }}</h2>
          <div class="story-text">
            <p v-for="(paragraph, index) in currentScene.text" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </transition>
    </div>

    <!-- Choices Layer (for scenes with choices) -->
    <div v-if="currentScene?.choices && currentScene.choices.length > 0" class="choices-layer">
      <div class="choices-container">
        <h3 class="choices-title">どこへ向かいますか？</h3>
        <div class="choices-grid">
          <button 
            v-for="(choice, index) in currentScene.choices" 
            :key="index"
            @click="handleChoice(choice)"
            class="choice-button"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Layer (for regular scene transitions) -->
    <div v-else class="navigation-layer">
      <button 
        @click="previousScene" 
        :disabled="currentSceneIndex === 0"
        class="nav-button prev-button"
      >
        前へ
      </button>
      
      <div class="scene-indicator">
        <span 
          v-for="(scene, index) in scenes" 
          :key="index"
          class="indicator-dot"
          :class="{ 'active': index === currentSceneIndex }"
        ></span>
      </div>
      
      <button 
        @click="nextScene"
        :disabled="currentSceneIndex === scenes.length - 1"
        class="nav-button next-button"
      >
        {{ currentSceneIndex === scenes.length - 1 ? '完了' : '次へ' }}
      </button>
    </div>

    <!-- Debug Info -->
    <div v-if="showDebug" class="debug-info">
      <div>Scene: {{ currentSceneIndex + 1 }} / {{ scenes.length }}</div>
      <div>Button disabled: {{ currentSceneIndex === scenes.length - 1 }}</div>
      <div>Is transitioning: {{ isTransitioning }}</div>
      <div>Current scene ID: {{ currentScene?.id }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface Character {
  id: string
  name: string
  color: string
  position: { x: number; y: number }
}

interface Choice {
  text: string
  action: 'next' | 'story-hub' | 'galaxy-map' | 'complete'
}

interface Scene {
  id: string
  title: string
  text: string[]
  character?: Character
  background?: string
  choices?: Choice[]
}

// Router
const router = useRouter()

// State
const currentSceneIndex = ref(0)
const isTransitioning = ref(false)
const showDebug = ref(true)

// Mock scenes data
const scenes = ref<Scene[]>([
  {
    id: 'scene-1',
    title: 'プロローグ：宇宙への旅立ち',
    text: [
      '西暦2124年、人類は言語の壁を越えるために新たな教育プログラムを開発した。',
      'あなたは選ばれし学習者として、Language Galaxy号に乗り込む。',
      '宇宙の彼方で、言語の真の力を発見する旅が今始まる...'
    ],
    character: {
      id: 'narrator',
      name: 'ナレーター',
      color: '#64b5f6',
      position: { x: 50, y: 30 }
    },
    background: 'space-station'
  },
  {
    id: 'scene-2',
    title: '第1章：目覚め',
    text: [
      '「やっと目が覚めたね！」',
      '優しい声が聞こえる。目を開けると、そこは宇宙船の中だった。',
      '「私はAIアシスタントのLexia。これからあなたの学習をサポートするよ。」'
    ],
    character: {
      id: 'lexia',
      name: 'Lexia',
      color: '#ff6b9d',
      position: { x: 70, y: 40 }
    },
    background: 'spaceship-interior'
  },
  {
    id: 'scene-3',
    title: '第2章：最初のミッション',
    text: [
      '「Language Galaxyへようこそ！」',
      'キャプテン・ノヴァが現れた。',
      '「ここでは、ゲームを通じて楽しく英語を学べる。準備はいいかな？」'
    ],
    character: {
      id: 'captain-nova',
      name: 'キャプテン・ノヴァ',
      color: '#4ecdc4',
      position: { x: 30, y: 50 }
    },
    background: 'galaxy-view'
  },
  {
    id: 'scene-4',
    title: '冒険開始！',
    text: [
      '冒険の始まりだ！',
      'あなたはLanguage Galaxyの住民となり、様々な惑星で言語の力を身につけていく。',
      'さあ、最初の惑星へ向かおう！'
    ],
    character: {
      id: 'captain-nova',
      name: 'キャプテン・ノヴァ',
      color: '#4ecdc4',
      position: { x: 50, y: 45 }
    },
    background: 'galaxy-view',
    choices: [
      { text: '銀河マップを開く', action: 'galaxy-map' },
      { text: 'ストーリーハブへ', action: 'story-hub' },
      { text: '本格ストーリーモード', action: 'complete' }
    ]
  }
])

// Computed
const currentScene = computed(() => scenes.value[currentSceneIndex.value])

const backgroundStyle = computed(() => {
  const bgType = currentScene.value?.background || 'default'
  const gradients: Record<string, string> = {
    'space-station': 'radial-gradient(circle at 20% 50%, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
    'spaceship-interior': 'linear-gradient(135deg, #263238 0%, #37474f 50%, #455a64 100%)',
    'galaxy-view': 'radial-gradient(ellipse at top, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    'default': 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #2a2a5a 100%)'
  }
  return {
    background: gradients[bgType]
  }
})

const characterStyle = computed(() => {
  const char = currentScene.value?.character
  if (!char) return {}
  
  return {
    '--character-color': char.color,
    left: `${char.position.x}%`,
    top: `${char.position.y}%`
  }
})

// Methods
const nextScene = async () => {
  logger.log('nextScene called')
  logger.log('Current scene index:', currentSceneIndex.value)
  logger.log('Total scenes:', scenes.value.length)
  logger.log('Is transitioning:', isTransitioning.value)
  
  if (currentSceneIndex.value < scenes.value.length - 1) {
    logger.log('Moving to next scene')
    isTransitioning.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    currentSceneIndex.value++
    logger.log('New scene index:', currentSceneIndex.value)
    isTransitioning.value = false
  } else {
    logger.log('Complete prototype, going to story hub')
    // Complete prototype, go to main story hub
    router.push('/story')
  }
}

const previousScene = async () => {
  if (currentSceneIndex.value > 0) {
    isTransitioning.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    currentSceneIndex.value--
    isTransitioning.value = false
  }
}

const handleChoice = (choice: Choice) => {
  logger.log('Choice selected:', choice)
  
  switch (choice.action) {
    case 'next':
      nextScene()
      break
    case 'story-hub':
      router.push('/story')
      break
    case 'galaxy-map':
      router.push('/galaxy-map')
      break
    case 'complete':
      router.push('/story')
      break
    default:
      logger.warn('Unknown choice action:', choice.action)
  }
}

// Lifecycle
onMounted(() => {
  logger.log('Prototype Opening loaded')
  logger.log('Initial scene index:', currentSceneIndex.value)
  logger.log('Total scenes:', scenes.value.length)
  logger.log('First scene:', currentScene.value)
  
  // Ensure transitioning is false on mount
  isTransitioning.value = false
})
</script>

<style scoped>
.prototype-opening {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* Background Layer */
.background-layer {
  position: absolute;
  inset: 0;
  transition: all 1s ease-out;
}

.stars-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 40% 70%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(1px 1px at 90% 60%, white, transparent);
  background-size: 200px 200px, 180px 180px, 250px 250px, 150px 150px;
  animation: starfield 120s linear infinite;
  opacity: 0.3;
}

@keyframes starfield {
  0% { transform: translateY(0); }
  100% { transform: translateY(-200px); }
}

/* Character Layer */
.character-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.character-placeholder {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.5s ease-out;
}

.character-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--character-color, #64b5f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 0 30px var(--character-color, #64b5f6);
  animation: character-glow 2s ease-in-out infinite alternate;
}

@keyframes character-glow {
  0% { box-shadow: 0 0 30px var(--character-color); }
  100% { box-shadow: 0 0 50px var(--character-color), 0 0 80px var(--character-color); }
}

.character-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* Story Layer */
.story-layer {
  position: absolute;
  bottom: 120px;
  left: 0;
  right: 0;
  padding: 0 5%;
  z-index: 10;
}

.story-content {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.scene-title {
  color: #64b5f6;
  font-size: 1.8rem;
  margin-bottom: 20px;
  text-align: center;
}

.story-text p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 15px;
}

/* Choices Layer */
.choices-layer {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 5%;
}

.choices-container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.choices-title {
  color: #64b5f6;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.choices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.choice-button {
  padding: 15px 20px;
  background: rgba(100, 181, 246, 0.2);
  border: 2px solid #64b5f6;
  color: #64b5f6;
  border-radius: 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-button:hover {
  background: rgba(100, 181, 246, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.3);
}

/* Navigation Layer */
.navigation-layer {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  z-index: 20;
}

.nav-button {
  padding: 12px 30px;
  background: rgba(100, 181, 246, 0.2);
  border: 2px solid #64b5f6;
  color: #64b5f6;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(100, 181, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(100, 181, 246, 0.3);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.scene-indicator {
  display: flex;
  gap: 10px;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #64b5f6;
  box-shadow: 0 0 10px #64b5f6;
}

/* Transitions */
.character-fade-enter-active,
.character-fade-leave-active,
.text-fade-enter-active,
.text-fade-leave-active {
  transition: all 0.5s ease;
}

.character-fade-enter-from,
.character-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.text-fade-enter-from,
.text-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.transitioning .story-layer,
.transitioning .character-layer {
  pointer-events: none;
}

/* Keep navigation buttons clickable during transitions */
.transitioning .navigation-layer {
  pointer-events: auto;
}

/* Debug Info */
.debug-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #64b5f6;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .story-content {
    padding: 20px;
  }
  
  .scene-title {
    font-size: 1.4rem;
  }
  
  .story-text p {
    font-size: 1rem;
  }
  
  .character-circle {
    width: 80px;
    height: 80px;
    font-size: 0.8rem;
  }
  
  .navigation-layer {
    padding: 0 20px;
  }
  
  .nav-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>