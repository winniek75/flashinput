<template>
  <div class="story-scene-view" :class="sceneClasses">
    <!-- Scene Header -->
    <header class="scene-header" :class="{ 'header-minimized': isImmersiveMode }">
      <div class="header-content">
        <button 
          @click="goBackToChapter"
          class="back-button focus-ring"
          aria-label="章に戻る"
        >
          <Icon name="arrow-left" />
          <span>章に戻る</span>
        </button>

        <div class="scene-info">
          <h1 class="scene-title">{{ currentScene?.title }}</h1>
          <p class="scene-breadcrumb">
            {{ currentStory?.title }} > 第{{ chapterId }}章 > シーン{{ sceneNumber }}
          </p>
        </div>

        <div class="scene-controls">
          <button 
            @click="toggleImmersiveMode"
            class="control-btn focus-ring"
            :aria-pressed="isImmersiveMode"
            aria-label="没入モード切り替え"
          >
            <Icon :name="isImmersiveMode ? 'eye-off' : 'eye'" />
          </button>
          
          <button 
            @click="toggleAutoPlay"
            class="control-btn focus-ring"
            :class="{ active: isAutoPlaying }"
            :aria-pressed="isAutoPlaying"
            aria-label="自動再生切り替え"
          >
            <Icon :name="isAutoPlaying ? 'pause' : 'play'" />
          </button>
          
          <button 
            @click="openSceneSettings"
            class="control-btn focus-ring"
            aria-label="シーン設定"
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Scene Area -->
    <main class="scene-main" id="main-content">
      
      <!-- Scene Background -->
      <div 
        class="scene-background"
        :style="backgroundStyles"
        :aria-label="currentScene?.backgroundDescription"
      >
        <!-- Parallax Layers -->
        <div 
          v-for="layer in backgroundLayers"
          :key="layer.id"
          class="parallax-layer"
          :class="`layer-${layer.type}`"
          :style="layer.style"
        ></div>
        
        <!-- Atmospheric Effects -->
        <div class="atmosphere-effects">
          <div 
            v-for="effect in atmosphereEffects"
            :key="effect.id"
            class="effect"
            :class="`effect-${effect.type}`"
            :style="effect.style"
          ></div>
        </div>
      </div>

      <!-- Character Stage -->
      <div class="character-stage">
        <div 
          v-for="character in activeCharacters"
          :key="character.id"
          class="character"
          :class="[
            `character-${character.id}`,
            `position-${character.position}`,
            `mood-${character.mood}`,
            { 'character-speaking': character.id === speakingCharacter }
          ]"
          :style="character.style"
          @click="onCharacterClick(character)"
          @keydown.enter="onCharacterClick(character)"
          @keydown.space.prevent="onCharacterClick(character)"
          tabindex="0"
          role="button"
          :aria-label="`${character.name}: ${character.currentEmotion}`"
        >
          <!-- Character Sprite -->
          <div class="character-sprite">
            <img 
              :src="character.spriteUrl"
              :alt="character.name"
              class="sprite-image"
              :style="character.spriteStyle"
            />
            
            <!-- Character Effects -->
            <div class="character-effects">
              <div 
                v-for="effect in character.effects"
                :key="effect.id"
                class="character-effect"
                :class="`effect-${effect.type}`"
              ></div>
            </div>
          </div>
          
          <!-- Character Name Label -->
          <div class="character-label" v-if="settings.showCharacterNames">
            {{ character.name }}
          </div>
        </div>
      </div>

      <!-- Interactive Objects -->
      <div class="interactive-objects">
        <div 
          v-for="object in interactiveObjects"
          :key="object.id"
          class="interactive-object"
          :class="`object-${object.type}`"
          :style="object.style"
          @click="onObjectInteraction(object)"
          @keydown.enter="onObjectInteraction(object)"
          @keydown.space.prevent="onObjectInteraction(object)"
          tabindex="0"
          role="button"
          :aria-label="object.description"
        >
          <div class="object-sprite">
            <img :src="object.spriteUrl" :alt="object.name" />
          </div>
          
          <!-- Interaction Hint -->
          <div 
            v-if="object.showHint"
            class="interaction-hint"
          >
            <Icon name="hand" />
            <span>{{ object.hintText }}</span>
          </div>
        </div>
      </div>

      <!-- Dialogue System -->
      <div 
        class="dialogue-system"
        :class="{ 
          'dialogue-visible': showDialogue,
          'dialogue-minimized': isImmersiveMode 
        }"
      >
        <!-- Speaker Info -->
        <div class="speaker-info" v-if="currentDialogue?.speaker">
          <div class="speaker-avatar">
            <img 
              :src="currentDialogue.speaker.avatarUrl"
              :alt="currentDialogue.speaker.name"
              class="avatar-image"
            />
          </div>
          <div class="speaker-details">
            <h3 class="speaker-name">{{ currentDialogue.speaker.name }}</h3>
            <p class="speaker-emotion" v-if="currentDialogue.speaker.emotion">
              {{ getEmotionText(currentDialogue.speaker.emotion) }}
            </p>
          </div>
        </div>

        <!-- Dialogue Text -->
        <div class="dialogue-content">
          <div class="dialogue-text" :style="dialogueTextStyles">
            <p class="dialogue-line">
              <span 
                v-for="(chunk, index) in dialogueChunks"
                :key="`chunk-${index}`"
                class="text-chunk"
                :class="{
                  'chunk-visible': index < currentChunkIndex,
                  'chunk-typing': index === currentChunkIndex && isTyping
                }"
              >
                {{ chunk }}
              </span>
            </p>
            
            <!-- Dialogue Translation -->
            <div 
              v-if="settings.showTranslation && currentDialogue?.translation"
              class="dialogue-translation"
            >
              {{ currentDialogue.translation }}
            </div>
          </div>

          <!-- Dialogue Choices -->
          <div 
            v-if="currentDialogue?.choices && !isTyping"
            class="dialogue-choices"
          >
            <h4 class="choices-prompt">選択してください:</h4>
            <div class="choices-list">
              <button 
                v-for="(choice, index) in currentDialogue.choices"
                :key="`choice-${index}`"
                class="choice-button focus-ring"
                @click="selectChoice(choice, index)"
                @keydown.enter="selectChoice(choice, index)"
                :aria-label="`選択肢 ${index + 1}: ${choice.text}`"
              >
                <span class="choice-number">{{ index + 1 }}</span>
                <span class="choice-text">{{ choice.text }}</span>
                <div class="choice-effect" v-if="choice.effect">
                  <Icon :name="getChoiceEffectIcon(choice.effect)" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Dialogue Controls -->
        <div class="dialogue-controls">
          <button 
            @click="skipTyping"
            class="dialogue-btn focus-ring"
            v-if="isTyping"
            aria-label="テキスト表示をスキップ"
          >
            <Icon name="fast-forward" />
            <span>スキップ</span>
          </button>
          
          <button 
            @click="nextDialogue"
            class="dialogue-btn focus-ring"
            v-else-if="hasNextDialogue"
            aria-label="次の台詞"
          >
            <span>次へ</span>
            <Icon name="arrow-right" />
          </button>
          
          <button 
            @click="repeatDialogue"
            class="dialogue-btn focus-ring"
            aria-label="台詞を繰り返し"
          >
            <Icon name="refresh" />
          </button>
          
          <button 
            @click="toggleVoice"
            class="dialogue-btn focus-ring"
            :class="{ active: voiceEnabled }"
            :aria-pressed="voiceEnabled"
            aria-label="音声切り替え"
          >
            <Icon :name="voiceEnabled ? 'volume-up' : 'volume-mute'" />
          </button>
        </div>
      </div>

      <!-- Scene Progress -->
      <div class="scene-progress" v-if="!isImmersiveMode">
        <div class="progress-track">
          <div 
            class="progress-fill"
            :style="{ width: `${sceneProgress}%` }"
          ></div>
        </div>
        <span class="progress-text">
          {{ currentDialogueIndex + 1 }} / {{ totalDialogues }}
        </span>
      </div>

      <!-- Scene Navigation -->
      <nav class="scene-navigation" v-if="!isImmersiveMode && !isPlaceholderScene">
        <button 
          @click="previousScene"
          class="nav-btn focus-ring"
          :disabled="!hasPreviousScene"
          aria-label="前のシーン"
        >
          <Icon name="chevron-left" />
          <span>前のシーン</span>
        </button>
        
        <div class="scene-selector">
          <select 
            v-model="currentSceneIndex"
            @change="goToScene"
            class="scene-select"
            aria-label="シーンを選択"
          >
            <option 
              v-for="(scene, index) in allScenes"
              :key="scene.id"
              :value="index"
            >
              シーン{{ index + 1 }}: {{ scene.title }}
            </option>
          </select>
        </div>
        
        <button 
          @click="nextScene"
          class="nav-btn focus-ring"
          :disabled="!hasNextScene"
          aria-label="次のシーン"
        >
          <span>次のシーン</span>
          <Icon name="chevron-right" />
        </button>
      </nav>
    </main>

    <!-- Scene Settings Modal -->
    <teleport to="body">
      <div 
        v-if="showSettingsModal"
        class="settings-overlay"
        @click="closeSettings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scene-settings-title"
      >
        <div 
          class="settings-modal"
          @click.stop
        >
          <header class="modal-header">
            <h2 id="scene-settings-title">シーン設定</h2>
            <button 
              @click="closeSettings"
              class="close-btn focus-ring"
              aria-label="設定を閉じる"
            >
              <Icon name="x" />
            </button>
          </header>
          
          <div class="modal-content">
            <div class="setting-section">
              <h3>表示設定</h3>
              
              <label class="setting-item">
                <input 
                  type="checkbox"
                  v-model="settings.showCharacterNames"
                />
                <span>キャラクター名を表示</span>
              </label>
              
              <label class="setting-item">
                <input 
                  type="checkbox"
                  v-model="settings.showTranslation"
                />
                <span>翻訳を表示</span>
              </label>
              
              <label class="setting-item">
                <input 
                  type="checkbox"
                  v-model="settings.showSubtitles"
                />
                <span>字幕を表示</span>
              </label>
            </div>
            
            <div class="setting-section">
              <h3>音響設定</h3>
              
              <div class="setting-group">
                <label>BGM音量</label>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  v-model="settings.bgmVolume"
                  class="volume-slider"
                />
                <span class="volume-value">{{ settings.bgmVolume }}%</span>
              </div>
              
              <div class="setting-group">
                <label>効果音音量</label>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  v-model="settings.sfxVolume"
                  class="volume-slider"
                />
                <span class="volume-value">{{ settings.sfxVolume }}%</span>
              </div>
              
              <div class="setting-group">
                <label>音声速度</label>
                <input 
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  v-model="settings.voiceSpeed"
                  class="speed-slider"
                />
                <span class="speed-value">{{ settings.voiceSpeed }}x</span>
              </div>
            </div>
            
            <div class="setting-section">
              <h3>アニメーション設定</h3>
              
              <label class="setting-item">
                <input 
                  type="checkbox"
                  v-model="settings.enableAnimations"
                />
                <span>アニメーションを有効化</span>
              </label>
              
              <label class="setting-item">
                <input 
                  type="checkbox"
                  v-model="settings.enableParticles"
                />
                <span>パーティクル効果を有効化</span>
              </label>
              
              <div class="setting-group">
                <label>テキスト表示速度</label>
                <input 
                  type="range"
                  min="10"
                  max="100"
                  v-model="settings.textSpeed"
                  class="speed-slider"
                />
                <span class="speed-value">{{ settings.textSpeed }}ms</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              @click="resetSettings"
              class="reset-btn focus-ring"
            >
              リセット
            </button>
            <button 
              @click="saveSettings"
              class="save-btn focus-ring"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Loading State -->
    <GalaxyLoader 
      v-if="loading"
      theme="galaxy"
      :progress="loadingProgress"
      title="Scene Loading"
      message="シーンを読み込み中..."
      :tips="loadingTips"
    />
  </div>
</template>

<script setup lang="ts">
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import Icon from '@/components/shared/Icon.vue'
import GalaxyLoader from '@/components/common/GalaxyLoader.vue'
import { accessibilityManager } from '@/utils/accessibilityManager'
import { soundManager } from '@/utils/soundManager'

// Props
interface Props {
  chapterId: string
  sceneId: string
}

const props = defineProps<Props>()

// Router
const route = useRoute()
const router = useRouter()

// Reactive state
const loading = ref(true)
const loadingProgress = ref(0)
const isImmersiveMode = ref(false)
const isAutoPlaying = ref(false)
const showDialogue = ref(true)
const showSettingsModal = ref(false)
const voiceEnabled = ref(true)

const currentSceneIndex = ref(0)
const currentDialogueIndex = ref(0)
const currentChunkIndex = ref(0)
const isTyping = ref(false)
const speakingCharacter = ref<string | null>(null)
const sceneProgress = ref(0)

// Refs
const typingTimer = ref<NodeJS.Timeout | null>(null)
const autoPlayTimer = ref<NodeJS.Timeout | null>(null)

// Settings
const settings = useStorage('story_scene_settings', {
  showCharacterNames: true,
  showTranslation: false,
  showSubtitles: true,
  bgmVolume: 70,
  sfxVolume: 80,
  voiceSpeed: 1.0,
  enableAnimations: true,
  enableParticles: true,
  textSpeed: 30
})

// Computed properties
const sceneClasses = computed(() => ({
  'immersive-mode': isImmersiveMode.value,
  'auto-playing': isAutoPlaying.value,
  'dialogue-hidden': !showDialogue.value,
  'animations-disabled': !settings.value.enableAnimations,
  'placeholder-scene': isPlaceholderScene.value
}))

const isPlaceholderScene = computed(() => {
  const currentSceneId = allScenes.value[currentSceneIndex.value]?.id
  logger.log('Checking scene ID:', currentSceneId)
  
  // These scenes have actual dialogue content defined
  const developedScenes = ['scene-1', 'scene-2', 'scene-3', 'scene-4', 'scene-3b', 'scene-5']
  const isPlaceholder = currentSceneId && !developedScenes.includes(currentSceneId)
  
  logger.log('Is placeholder scene:', isPlaceholder)
  return isPlaceholder
})

const sceneNumber = computed(() => currentSceneIndex.value + 1)

const backgroundStyles = computed(() => ({
  backgroundImage: currentScene.value?.backgroundUrl ? `url(${currentScene.value.backgroundUrl})` : undefined,
  '--parallax-speed': '0.5'
}))

const dialogueTextStyles = computed(() => ({
  fontSize: '1.1rem',
  animationDuration: `${settings.value.textSpeed}ms`
}))

const totalDialogues = computed(() => {
  if (isInInteractionMode.value) {
    return interactionDialogues.value.length
  }
  return currentScene.value?.dialogues?.length || 0
})

const hasNextDialogue = computed(() => currentDialogueIndex.value < totalDialogues.value - 1)
const hasPreviousScene = computed(() => currentSceneIndex.value > 0)
const hasNextScene = computed(() => currentSceneIndex.value < allScenes.value.length - 1)

// Mock data
const currentStory = ref({
  id: 'cosmic-journey',
  title: '宇宙の旅人'
})

const allScenes = ref([
  { id: 'scene-1', title: '出発準備' },
  { id: 'scene-2', title: '宇宙船発射' },
  { id: 'scene-3', title: '星空の中で' },
  { id: 'scene-4', title: '未知の惑星発見' },
  { id: 'scene-3b', title: '宇宙遊泳' },
  { id: 'scene-5', title: '惑星探査開始' }
])

const currentScene = computed(() => {
  const baseData = {
    id: props.sceneId,
    title: allScenes.value[currentSceneIndex.value]?.title || 'シーン',
    backgroundUrl: '/images/scenes/space-scene.jpg',
    backgroundDescription: '美しい星空が広がる宇宙空間'
  }
  
  // Get scene-specific dialogues
  const sceneDialogues = getSceneDialogues(allScenes.value[currentSceneIndex.value]?.id || 'scene-3')
  
  return {
    ...baseData,
    dialogues: sceneDialogues
  }
})

const getSceneDialogues = (sceneId: string) => {
  const dialogues: Record<string, any[]> = {
    'scene-1': [
      {
        id: 'dialogue-1-1',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'excited'
        },
        text: '出発の準備が整いました！いよいよ宇宙への旅が始まります。',
        translation: 'Departure preparations complete! Our journey to space begins now.'
      },
      {
        id: 'dialogue-1-2',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'helpful'
        },
        text: 'システムチェック完了。発射まで60秒です。',
        translation: 'System check complete. 60 seconds to launch.',
        choices: [
          { text: '発射開始', effect: 'launch', consequence: 'scene-2' },
          { text: '最終確認', effect: 'check', consequence: 'scene-1b' }
        ]
      }
    ],
    'scene-2': [
      {
        id: 'dialogue-2-1',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'neutral'
        },
        text: '発射シーケンス開始。10...9...8...7...6...5...4...3...2...1...発射！',
        translation: 'Launch sequence initiated. 10...9...8...7...6...5...4...3...2...1...Launch!'
      },
      {
        id: 'dialogue-2-2',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'amazed'
        },
        text: 'すごい！地球が小さく見えてきた！宇宙に到達したんだ！',
        translation: 'Amazing! Earth is getting smaller! We\'ve reached space!',
        choices: [
          { text: '宇宙を探索', effect: 'explore', consequence: 'scene-3' },
          { text: '軌道を安定させる', effect: 'stabilize', consequence: 'scene-2b' }
        ]
      }
    ],
    'scene-4': [
      {
        id: 'dialogue-4-1',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'excited'
        },
        text: '未知の惑星を発見しました！生命反応は検出されませんが、興味深い鉱物が確認できます。',
        translation: 'Unknown planet discovered! No life signs detected, but interesting minerals confirmed.'
      },
      {
        id: 'dialogue-4-2',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'curious'
        },
        text: 'この惑星、何か特別な感じがする...着陸してみようか？',
        translation: 'This planet feels special somehow... Should we try landing?',
        choices: [
          { text: '惑星に着陸', effect: 'land', consequence: 'scene-5' },
          { text: '軌道から調査', effect: 'orbit', consequence: 'scene-4b' },
          { text: '別の場所を探す', effect: 'continue', consequence: 'scene-6' }
        ]
      }
    ],
    'scene-3': [
      {
        id: 'dialogue-1',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'excited'
        },
        text: 'ついに宇宙に来たんだ！この景色は本当に素晴らしいね。',
        translation: 'We finally made it to space! This view is truly amazing.',
        voiceUrl: '/audio/voices/taro/dialogue-1.mp3'
      },
      {
        id: 'dialogue-2',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'helpful'
        },
        text: '太郎さん、前方に未知の惑星が見えています。調査しますか？',
        translation: 'Taro, I can see an unknown planet ahead. Shall we investigate?',
        choices: [
          { text: '惑星に向かう', effect: 'explore', consequence: 'scene-5' },
          { text: 'もう少し宇宙を楽しむ', effect: 'stay', consequence: 'scene-3b' },
          { text: '地球に戻る', effect: 'return', consequence: 'ending-1' }
        ]
      }
    ],
    'scene-3b': [
      {
        id: 'dialogue-3b-1',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'happy'
        },
        text: '宇宙遊泳をしてみよう！無重力状態って不思議だね。',
        translation: 'Let\'s try spacewalking! Zero gravity is amazing.'
      },
      {
        id: 'dialogue-3b-2',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'helpful'
        },
        text: '安全装置を確認してください。宇宙遊泳は危険が伴います。',
        translation: 'Please check your safety equipment. Spacewalking can be dangerous.',
        choices: [
          { text: '宇宙ステーションに戻る', effect: 'return', consequence: 'scene-3' },
          { text: '惑星へ向かう', effect: 'explore', consequence: 'scene-5' }
        ]
      }
    ],
    'scene-5': [
      {
        id: 'dialogue-5-1',
        speaker: {
          id: 'ai',
          name: 'AI アシスタント',
          avatarUrl: '/images/characters/ai-avatar.jpg',
          emotion: 'excited'
        },
        text: '惑星への着陸準備が完了しました。大気は呼吸可能です。',
        translation: 'Landing preparations complete. The atmosphere is breathable.'
      },
      {
        id: 'dialogue-5-2',
        speaker: {
          id: 'taro',
          name: '太郎',
          avatarUrl: '/images/characters/taro-avatar.jpg',
          emotion: 'amazed'
        },
        text: 'すごい！新しい惑星を発見したんだ！これは大発見だよ！',
        translation: 'Amazing! We\'ve discovered a new planet! This is a major discovery!',
        choices: [
          { text: '惑星を探査する', effect: 'explore', consequence: 'scene-6' },
          { text: '地球に報告する', effect: 'report', consequence: 'ending-2' }
        ]
      }
    ]
  }
  
  return dialogues[sceneId] || [
    {
      id: 'placeholder-dialogue-1',
      speaker: {
        id: 'narrator',
        name: 'ナレーター',
        avatarUrl: '/images/characters/narrator-avatar.jpg',
        emotion: 'neutral'
      },
      text: `${getSceneTitle(sceneId)}のストーリーが始まります...`,
      translation: `The story of ${getSceneTitle(sceneId)} begins...`
    },
    {
      id: 'placeholder-dialogue-2',
      speaker: {
        id: 'narrator',
        name: 'ナレーター',
        avatarUrl: '/images/characters/narrator-avatar.jpg',
        emotion: 'neutral'
      },
      text: 'このシーンはまだ開発中です。続きをお楽しみに！',
      translation: 'This scene is still in development. Stay tuned for more!',
      choices: [
        { text: 'ストーリーハブに戻る', effect: 'return', consequence: 'hub' }
      ]
    }
  ]
}

const currentDialogue = computed(() => {
  if (isInInteractionMode.value && interactionDialogues.value.length > 0) {
    return interactionDialogues.value[currentDialogueIndex.value]
  }
  return currentScene.value?.dialogues?.[currentDialogueIndex.value]
})

const dialogueChunks = computed(() => {
  if (!currentDialogue.value?.text) return []
  return currentDialogue.value.text.split('').map((char, index) => char)
})

const activeCharacters = computed(() => {
  const currentSceneId = allScenes.value[currentSceneIndex.value]?.id
  
  if (isPlaceholderScene.value || currentSceneId === 'scene-ending') {
    // Show narrator character for placeholder scenes
    return [
      {
        id: 'narrator',
        name: 'ナレーター',
        position: 'center',
        mood: 'neutral',
        currentEmotion: '物語を語る',
        spriteUrl: '/images/characters/narrator-sprite.png',
        style: {
          left: '50%',
          bottom: '20%',
          transform: 'translateX(-50%)',
          zIndex: 10
        },
        spriteStyle: {},
        effects: []
      }
    ]
  }
  
  // Regular scene characters
  return [
    {
      id: 'taro',
      name: '太郎',
      position: 'center',
      mood: 'happy',
      currentEmotion: '興奮している',
      spriteUrl: '/images/characters/taro-sprite.png',
      style: {
        left: '30%',
        bottom: '10%',
        zIndex: 10
      },
      spriteStyle: {},
      effects: []
    },
    {
      id: 'ai',
      name: 'AI',
      position: 'right',
      mood: 'neutral',
      currentEmotion: '冷静',
      spriteUrl: '/images/characters/ai-sprite.png',
      style: {
        right: '20%',
        bottom: '15%',
        zIndex: 9
      },
      spriteStyle: {},
      effects: []
    }
  ]
})

const interactiveObjects = ref([
  {
    id: 'control-panel',
    name: 'コントロールパネル',
    type: 'interactive',
    description: 'コントロールパネルを操作する',
    spriteUrl: '/images/objects/control-panel.png',
    style: {
      left: '70%',
      top: '30%'
    },
    showHint: true,
    hintText: 'クリックして操作'
  }
])

const backgroundLayers = ref([
  {
    id: 'stars-far',
    type: 'stars',
    style: {
      backgroundImage: 'url(/images/backgrounds/stars-far.png)',
      transform: 'translateZ(-100px)'
    }
  },
  {
    id: 'stars-near',
    type: 'stars',
    style: {
      backgroundImage: 'url(/images/backgrounds/stars-near.png)',
      transform: 'translateZ(-50px)'
    }
  }
])

const atmosphereEffects = ref([
  {
    id: 'space-dust',
    type: 'particles',
    style: {
      opacity: 0.6
    }
  }
])

const loadingTips = ref([
  'シーンでは登場人物と対話できます',
  '選択肢によってストーリーが変化します',
  'キャラクターをクリックして詳細を確認できます'
])

// Methods
const goBackToChapter = () => {
  router.push(`/story/${props.chapterId}`)
}

const toggleImmersiveMode = () => {
  isImmersiveMode.value = !isImmersiveMode.value
  
  accessibilityManager.announce({
    message: isImmersiveMode.value ? '没入モードに入りました' : '没入モードを終了しました',
    priority: 'polite'
  })
}

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value
  
  if (isAutoPlaying.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
  
  accessibilityManager.announce({
    message: isAutoPlaying.value ? '自動再生を開始しました' : '自動再生を停止しました',
    priority: 'polite'
  })
}

const startAutoPlay = () => {
  stopAutoPlay()
  
  autoPlayTimer.value = setInterval(() => {
    if (hasNextDialogue.value) {
      nextDialogue()
    } else {
      stopAutoPlay()
    }
  }, 5000) // Auto advance every 5 seconds
}

const stopAutoPlay = () => {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
  isAutoPlaying.value = false
}

const openSceneSettings = () => {
  showSettingsModal.value = true
  accessibilityManager.trapFocus(document.querySelector('.settings-modal') as HTMLElement)
}

const closeSettings = () => {
  showSettingsModal.value = false
  accessibilityManager.releaseFocusTrap()
}

const saveSettings = () => {
  // Settings are automatically saved via useStorage
  closeSettings()
  
  accessibilityManager.announce({
    message: 'シーン設定が保存されました',
    priority: 'polite'
  })
}

const resetSettings = () => {
  settings.value = {
    showCharacterNames: true,
    showTranslation: false,
    showSubtitles: true,
    bgmVolume: 70,
    sfxVolume: 80,
    voiceSpeed: 1.0,
    enableAnimations: true,
    enableParticles: true,
    textSpeed: 30
  }
  
  accessibilityManager.announce({
    message: 'シーン設定がリセットされました',
    priority: 'polite'
  })
}

const startTypingEffect = () => {
  isTyping.value = true
  currentChunkIndex.value = 0
  
  const typeNextChunk = () => {
    if (currentChunkIndex.value < dialogueChunks.value.length) {
      currentChunkIndex.value++
      typingTimer.value = setTimeout(typeNextChunk, settings.value.textSpeed)
    } else {
      isTyping.value = false
      
      // Play voice after typing is complete
      if (voiceEnabled.value && currentDialogue.value?.voiceUrl) {
        playDialogueVoice()
      }
    }
  }
  
  typeNextChunk()
}

const skipTyping = () => {
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
  
  currentChunkIndex.value = dialogueChunks.value.length
  isTyping.value = false
  
  if (voiceEnabled.value && currentDialogue.value?.voiceUrl) {
    playDialogueVoice()
  }
}

const nextDialogue = () => {
  if (hasNextDialogue.value) {
    currentDialogueIndex.value++
    updateSceneProgress()
    startTypingEffect()
    
    // Update speaking character
    speakingCharacter.value = currentDialogue.value?.speaker?.id || null
    
    accessibilityManager.announce({
      message: `${currentDialogue.value?.speaker?.name}: ${currentDialogue.value?.text}`,
      priority: 'polite'
    })
  }
}

const repeatDialogue = () => {
  startTypingEffect()
  
  if (voiceEnabled.value && currentDialogue.value?.voiceUrl) {
    playDialogueVoice()
  }
}

const selectChoice = (choice: any, index: number) => {
  // Handle choice selection
  logger.log('Choice selected:', choice)
  logger.log('Is in interaction mode:', isInInteractionMode.value)
  logger.log('Choice consequence:', choice.consequence)
  
  // Play choice sound effect
  soundManager.playSFX('choice_select', 80)
  
  // Announce choice
  accessibilityManager.announce({
    message: `選択肢 ${index + 1} を選択しました: ${choice.text}`,
    priority: 'polite'
  })
  
  // Handle choice consequence
  if (choice.consequence) {
    // Navigate to consequence scene or dialogue
    handleChoiceConsequence(choice.consequence)
  } else {
    nextDialogue()
  }
}

const handleChoiceConsequence = (consequence: string) => {
  logger.log('Handling consequence:', consequence)
  
  if (consequence.startsWith('scene-')) {
    // Navigate to different scene
    const sceneIndex = allScenes.value.findIndex(scene => scene.id === consequence)
    logger.log('Found scene index:', sceneIndex, 'for consequence:', consequence)
    
    if (sceneIndex !== -1) {
      currentSceneIndex.value = sceneIndex
      loadScene()
    } else {
      logger.warn('Scene not found:', consequence)
      // Create placeholder scene if not found
      createPlaceholderScene(consequence)
    }
  } else if (consequence.startsWith('ending-')) {
    // Navigate to ending - for now, show placeholder
    logger.log('Navigating to ending:', consequence)
    showEndingPlaceholder(consequence)
  } else if (consequence === 'hub') {
    // Return to story hub
    router.push('/story')
  } else if (consequence === 'current_scene') {
    // Stay in current scene, just continue dialogue
    logger.log('Staying in current scene')
  } else if (consequence === 'close_panel') {
    // Close interaction panel, return to normal dialogue flow
    closeInteractionPanel()
  } else if (consequence.startsWith('status_') || consequence.startsWith('navigation_') || 
           consequence.startsWith('communication_') || consequence.startsWith('earth_') ||
           consequence.startsWith('ship_') || consequence.startsWith('emergency_')) {
    // Handle system interactions
    handleSystemInteraction(consequence)
  } else {
    logger.warn('Unknown consequence type:', consequence)
  }
}

const closeInteractionPanel = () => {
  logger.log('Closing interaction panel')
  
  // Exit interaction mode
  isInInteractionMode.value = false
  interactionDialogues.value = []
  
  // Return to normal dialogue flow - stay at current scene dialogue
  // Don't change currentDialogueIndex, just exit interaction mode
  
  accessibilityManager.announce({
    message: 'システムパネルを閉じました',
    priority: 'polite'
  })
}

const handleSystemInteraction = (consequence: string) => {
  let responseText = ''
  let responseTranslation = ''
  
  switch (consequence) {
    case 'status_check':
      responseText = '宇宙船の全システムが正常に動作しています。燃料は十分で、生命維持装置も安定しています。'
      responseTranslation = 'All spacecraft systems are operating normally. Fuel is sufficient and life support is stable.'
      break
    case 'navigation_mode':
      responseText = 'ナビゲーションシステムに切り替えました。座標を入力してください。'
      responseTranslation = 'Switched to navigation system. Please input coordinates.'
      break
    case 'communication_mode':
      responseText = '通信システムに接続しました。通信可能な範囲をスキャンしています...'
      responseTranslation = 'Connected to communication system. Scanning for available contacts...'
      break
    case 'earth_contact':
      responseText = '地球基地との通信を確立しました。「こちら宇宙船、状況報告します」'
      responseTranslation = 'Contact established with Earth base. "This is spacecraft, reporting status."'
      break
    case 'ship_scan':
      responseText = 'レーダーをスキャンしています...近くに未確認の宇宙船を発見しました！'
      responseTranslation = 'Scanning radar... Unidentified spacecraft detected nearby!'
      break
    case 'emergency_signal':
      responseText = '緊急信号を全周波数で送信しました。救助要請が発信されています。'
      responseTranslation = 'Emergency signal transmitted on all frequencies. Rescue request broadcasted.'
      break
    default:
      responseText = 'システムが応答しました。'
      responseTranslation = 'System responded.'
  }
  
  const systemResponse = {
    id: `system-response-${consequence}`,
    speaker: {
      id: 'system',
      name: 'システム',
      avatarUrl: '/images/characters/system-avatar.jpg',
      emotion: 'neutral'
    },
    text: responseText,
    translation: responseTranslation
  }
  
  // Add system response to interaction dialogues
  interactionDialogues.value.push(systemResponse)
  
  // Move to the new dialogue
  nextDialogue()
}

const createPlaceholderScene = (sceneId: string) => {
  // Add placeholder scene to the scenes list
  const placeholderTitle = getSceneTitle(sceneId)
  allScenes.value.push({ id: sceneId, title: placeholderTitle })
  
  const sceneIndex = allScenes.value.length - 1
  currentSceneIndex.value = sceneIndex
  loadScene()
}

const showEndingPlaceholder = (endingId: string) => {
  // Show ending message
  accessibilityManager.announce({
    message: `エンディング: ${getEndingTitle(endingId)}`,
    priority: 'assertive'
  })
  
  // For now, just go back to story hub after a delay
  setTimeout(() => {
    router.push('/story')
  }, 3000)
}

const getSceneTitle = (sceneId: string): string => {
  const sceneTitles: Record<string, string> = {
    'scene-3b': '宇宙遊泳',
    'scene-5': '惑星探査開始',
    'scene-6': '惑星表面着陸'
  }
  return sceneTitles[sceneId] || `シーン: ${sceneId}`
}

const getEndingTitle = (endingId: string): string => {
  const endingTitles: Record<string, string> = {
    'ending-1': '地球への帰還',
    'ending-2': '宇宙での新たな発見',
    'ending-3': '惑星での新生活'
  }
  return endingTitles[endingId] || `エンディング: ${endingId}`
}

const playDialogueVoice = async () => {
  if (currentDialogue.value?.voiceUrl && currentDialogue.value?.speaker) {
    await soundManager.playVoice(
      currentDialogue.value.speaker.id,
      currentDialogue.value.id,
      {
        volume: 100,
        onEnd: () => {
          speakingCharacter.value = null
        }
      }
    )
  }
}

const toggleVoice = () => {
  voiceEnabled.value = !voiceEnabled.value
  
  if (!voiceEnabled.value) {
    soundManager.stopAllAudio('voice')
  }
  
  accessibilityManager.announce({
    message: voiceEnabled.value ? '音声を有効にしました' : '音声を無効にしました',
    priority: 'polite'
  })
}

const onCharacterClick = (character: any) => {
  // Show character information or trigger interaction
  logger.log('Character clicked:', character)
  
  accessibilityManager.announce({
    message: `${character.name}をクリックしました。${character.currentEmotion}`,
    priority: 'polite'
  })
}

const onObjectInteraction = (object: any) => {
  logger.log('Object interaction:', object)
  
  soundManager.playSFX('object_interact', 70)
  
  // Handle specific object interactions
  switch (object.id) {
    case 'control-panel':
      handleControlPanelInteraction()
      break
    case 'navigation-console':
      handleNavigationConsoleInteraction()
      break
    case 'communication-device':
      handleCommunicationDeviceInteraction()
      break
    default:
      // Generic interaction
      accessibilityManager.announce({
        message: `${object.name}と相互作用しました`,
        priority: 'polite'
      })
  }
}

const handleControlPanelInteraction = () => {
  // Show control panel interface
  const panelDialogue = {
    id: 'control-panel-interaction',
    speaker: {
      id: 'system',
      name: 'システム',
      avatarUrl: '/images/characters/system-avatar.jpg',
      emotion: 'neutral'
    },
    text: 'コントロールパネルにアクセスしました。何を操作しますか？',
    translation: 'Control panel accessed. What would you like to operate?',
    choices: [
      { text: '宇宙船の状態を確認', effect: 'check_status', consequence: 'status_check' },
      { text: 'ナビゲーションシステム', effect: 'navigation', consequence: 'navigation_mode' },
      { text: '通信システム', effect: 'communication', consequence: 'communication_mode' },
      { text: 'システムを閉じる', effect: 'close', consequence: 'close_panel' }
    ]
  }
  
  // Inject this dialogue into the current scene
  injectInteractionDialogue(panelDialogue)
  
  accessibilityManager.announce({
    message: 'コントロールパネルにアクセスしました',
    priority: 'polite'
  })
}

const handleNavigationConsoleInteraction = () => {
  const navDialogue = {
    id: 'navigation-interaction',
    speaker: {
      id: 'system',
      name: 'ナビゲーション',
      avatarUrl: '/images/characters/system-avatar.jpg',
      emotion: 'neutral'
    },
    text: 'ナビゲーションシステムが起動しました。目的地を設定してください。',
    translation: 'Navigation system activated. Please set destination.',
    choices: [
      { text: '地球に帰還', effect: 'return_earth', consequence: 'ending-1' },
      { text: '未知の惑星を探索', effect: 'explore', consequence: 'scene-5' },
      { text: '現在位置に留まる', effect: 'stay', consequence: 'current_scene' }
    ]
  }
  
  injectInteractionDialogue(navDialogue)
}

const handleCommunicationDeviceInteraction = () => {
  const commDialogue = {
    id: 'communication-interaction',
    speaker: {
      id: 'system',
      name: '通信システム',
      avatarUrl: '/images/characters/system-avatar.jpg',
      emotion: 'neutral'
    },
    text: '通信システムが有効です。誰と通信しますか？',
    translation: 'Communication system active. Who would you like to contact?',
    choices: [
      { text: '地球基地に連絡', effect: 'contact_earth', consequence: 'earth_contact' },
      { text: '近くの宇宙船を探す', effect: 'scan_ships', consequence: 'ship_scan' },
      { text: '緊急信号を送信', effect: 'emergency', consequence: 'emergency_signal' }
    ]
  }
  
  injectInteractionDialogue(commDialogue)
}

// Add reactive state for interaction dialogues
const interactionDialogues = ref<any[]>([])
const isInInteractionMode = ref(false)

const injectInteractionDialogue = (dialogue: any) => {
  logger.log('Injecting interaction dialogue:', dialogue)
  
  // Clear previous interaction dialogues
  interactionDialogues.value = []
  
  // Add the new interaction dialogue
  interactionDialogues.value.push(dialogue)
  
  // Switch to interaction mode
  isInInteractionMode.value = true
  
  // Set dialogue index to show the interaction
  currentDialogueIndex.value = 0
  
  // Start typing effect
  nextTick(() => {
    startTypingEffect()
  })
}

const updateSceneProgress = () => {
  const progress = ((currentDialogueIndex.value + 1) / totalDialogues.value) * 100
  sceneProgress.value = Math.min(100, progress)
}

const previousScene = () => {
  if (hasPreviousScene.value) {
    currentSceneIndex.value--
    loadScene()
  }
}

const nextScene = () => {
  if (hasNextScene.value) {
    currentSceneIndex.value++
    loadScene()
  }
}

const goToScene = () => {
  loadScene()
}

const loadScene = async () => {
  loading.value = true
  loadingProgress.value = 0
  
  // Stop any ongoing audio
  soundManager.stopAllAudio()
  
  // Simulate scene loading
  const stages = ['シーンデータを読み込み中...', 'キャラクターを配置中...', '背景を設定中...', '完了']
  
  for (let i = 0; i < stages.length; i++) {
    loadingProgress.value = (i + 1) * 25
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // Reset scene state
  currentDialogueIndex.value = 0
  sceneProgress.value = 0
  speakingCharacter.value = null
  
  loading.value = false
  
  // Start first dialogue
  await nextTick()
  startTypingEffect()
  
  accessibilityManager.announce({
    message: `シーン${sceneNumber.value}「${currentScene.value?.title}」を読み込みました`,
    priority: 'polite'
  })
}

const getEmotionText = (emotion: string): string => {
  const emotionMap: Record<string, string> = {
    excited: '興奮している',
    happy: '嬉しそう',
    sad: '悲しそう',
    angry: '怒っている',
    surprised: '驚いている',
    helpful: '親切',
    neutral: '冷静'
  }
  
  return emotionMap[emotion] || emotion
}

const getChoiceEffectIcon = (effect: string): string => {
  const effectIcons: Record<string, string> = {
    explore: 'compass',
    stay: 'pause',
    return: 'home',
    attack: 'sword',
    defend: 'shield',
    talk: 'message-circle'
  }
  
  return effectIcons[effect] || 'arrow-right'
}

// Lifecycle
onMounted(async () => {
  // Initialize scene from route
  const sceneId = route.params.sceneId as string
  const sceneIndex = allScenes.value.findIndex(scene => scene.id === sceneId)
  if (sceneIndex !== -1) {
    currentSceneIndex.value = sceneIndex
  }
  
  // Register focus groups for accessibility
  accessibilityManager.registerFocusGroup('scene-characters', 
    Array.from(document.querySelectorAll('.character')) as HTMLElement[]
  )
  
  accessibilityManager.registerFocusGroup('scene-objects',
    Array.from(document.querySelectorAll('.interactive-object')) as HTMLElement[]
  )
  
  // Load scene
  await loadScene()
  
  // Setup keyboard shortcuts
  accessibilityManager.registerShortcut('next-dialogue', {
    keys: ['Enter'],
    action: () => {
      if (isTyping.value) {
        skipTyping()
      } else if (hasNextDialogue.value) {
        nextDialogue()
      }
    },
    description: '次の台詞/タイピングスキップ',
    context: 'scene',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('toggle-auto', {
    keys: ['Space'],
    action: toggleAutoPlay,
    description: '自動再生切り替え',
    context: 'scene',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('repeat-dialogue', {
    keys: ['r'],
    action: repeatDialogue,
    description: '台詞を繰り返し',
    context: 'scene',
    enabled: true
  })
})

onUnmounted(() => {
  // Clean up timers
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  stopAutoPlay()
  
  // Stop audio
  soundManager.stopAllAudio()
  
  // Unregister shortcuts
  accessibilityManager.unregisterShortcut('next-dialogue')
  accessibilityManager.unregisterShortcut('toggle-auto')
  accessibilityManager.unregisterShortcut('repeat-dialogue')
})

// Watch for scene changes
watch(() => currentSceneIndex.value, () => {
  router.push(`/story/${props.chapterId}/${allScenes.value[currentSceneIndex.value].id}`)
})
</script>

<style scoped>
.story-scene-view {
  min-height: 100vh;
  background: #000;
  color: white;
  position: relative;
  overflow: hidden;
}

.story-scene-view.immersive-mode .scene-header {
  transform: translateY(-100%);
}

.story-scene-view.immersive-mode .scene-navigation,
.story-scene-view.immersive-mode .scene-progress {
  opacity: 0;
  pointer-events: none;
}

/* Header */
.scene-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform var(--transition-normal) var(--ease-out-cubic);
}

.scene-header.header-minimized {
  transform: translateY(-50%);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.scene-info {
  text-align: center;
  flex: 1;
}

.scene-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  color: #64b5f6;
}

.scene-breadcrumb {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.scene-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-btn.active {
  background: #64b5f6;
  color: white;
}

/* Main Scene Area */
.scene-main {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.scene-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #0a0a1a;
  background-image: linear-gradient(135deg, 
    #0a0a1a 0%, 
    #1a1a3a 25%, 
    #2a2a5a 50%, 
    #1a1a3a 75%, 
    #0a0a1a 100%),
    radial-gradient(circle at 20% 20%, rgba(100, 181, 246, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(100, 181, 246, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 20%);
}

.parallax-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-repeat: no-repeat;
  transform-style: preserve-3d;
}

.atmosphere-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.effect {
  position: absolute;
  width: 100%;
  height: 100%;
}

.effect-particles::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(2px 2px at 20% 30%, white 0%, transparent 50%),
              radial-gradient(2px 2px at 40% 60%, white 0%, transparent 50%),
              radial-gradient(1px 1px at 90% 10%, white 0%, transparent 50%);
  background-size: 100px 100px, 80px 80px, 120px 120px;
  animation: starfield 20s linear infinite;
}

@keyframes starfield {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100px); }
}

/* Character Stage */
.character-stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.character {
  position: absolute;
  pointer-events: all;
  transition: all var(--transition-normal) var(--ease-out-cubic);
  cursor: pointer;
}

.character:hover {
  transform: scale(1.05);
}

.character.character-speaking {
  animation: speakingGlow 2s ease-in-out infinite alternate;
}

@keyframes speakingGlow {
  0% { filter: drop-shadow(0 0 10px rgba(100, 181, 246, 0.5)); }
  100% { filter: drop-shadow(0 0 20px rgba(100, 181, 246, 0.8)); }
}

.character-sprite {
  position: relative;
}

.sprite-image {
  max-width: 200px;
  max-height: 300px;
  object-fit: contain;
}

.character-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.character-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Narrator-specific styles */
.character-narrator {
  text-align: center;
}

.character-narrator .sprite-image {
  max-width: 150px;
  max-height: 200px;
  filter: drop-shadow(0 0 20px rgba(100, 181, 246, 0.6));
}

/* Fallback for missing character sprites */
.sprite-image {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.3), rgba(100, 181, 246, 0.1));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
  min-width: 120px;
  min-height: 160px;
}

.sprite-image::before {
  content: attr(alt);
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Placeholder scene specific styles */
.story-scene-view.placeholder-scene .scene-navigation {
  display: none !important;
}

.story-scene-view.placeholder-scene .scene-progress {
  display: none !important;
}

/* Interactive Objects */
.interactive-objects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.interactive-object {
  position: absolute;
  pointer-events: all;
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.interactive-object:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 15px rgba(100, 181, 246, 0.8));
}

.interactive-object:active {
  transform: scale(1.05);
  filter: drop-shadow(0 0 20px rgba(100, 181, 246, 1));
}

.interactive-object:hover .interaction-hint {
  opacity: 1;
}

.interactive-object.activated {
  animation: objectActivation 0.5s ease-out;
}

@keyframes objectActivation {
  0% { 
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(100, 181, 246, 0.5));
  }
  50% { 
    transform: scale(1.2);
    filter: drop-shadow(0 0 25px rgba(100, 181, 246, 1));
  }
  100% { 
    transform: scale(1.1);
    filter: drop-shadow(0 0 15px rgba(100, 181, 246, 0.8));
  }
}

.object-sprite img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

.interaction-hint {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out-cubic);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Dialogue System */
.dialogue-system {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  min-height: 180px;
  transform: translateY(0);
  transition: transform var(--transition-normal) var(--ease-out-cubic);
  z-index: 200;
}

.dialogue-system.dialogue-minimized {
  transform: translateY(50%);
}

.dialogue-system:not(.dialogue-visible) {
  transform: translateY(100%);
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.speaker-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #64b5f6;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.speaker-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #64b5f6;
}

.speaker-emotion {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.dialogue-content {
  max-width: 800px;
  margin: 0 auto;
}

.dialogue-text {
  margin-bottom: 1.5rem;
}

.dialogue-line {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.text-chunk {
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out-cubic);
}

.text-chunk.chunk-visible {
  opacity: 1;
}

.text-chunk.chunk-typing {
  opacity: 1;
  animation: typing-cursor 1s infinite;
}

@keyframes typing-cursor {
  0%, 50% { border-right: 2px solid #64b5f6; }
  51%, 100% { border-right: 2px solid transparent; }
}

.dialogue-translation {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  border-left: 4px solid #64b5f6;
}

.dialogue-choices {
  margin-top: 1.5rem;
}

.choices-prompt {
  font-size: 1rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.choice-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  color: white;
  text-align: left;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
}

.choice-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #64b5f6;
  transform: translateX(4px);
}

.choice-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #64b5f6;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
}

.choice-text {
  flex: 1;
  font-size: 1rem;
}

.choice-effect {
  color: #64b5f6;
  opacity: 0.7;
}

.dialogue-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.dialogue-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.dialogue-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.dialogue-btn.active {
  background: #64b5f6;
}

/* Scene Progress */
.scene-progress {
  position: fixed;
  top: 80px;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 2rem;
  z-index: 50;
  transition: opacity var(--transition-normal) var(--ease-out-cubic);
}

.progress-track {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  transition: width var(--transition-normal) var(--ease-out-cubic);
}

.progress-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  min-width: 60px;
}

/* Scene Navigation */
.scene-navigation {
  position: fixed;
  top: 120px;
  right: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem;
  border-radius: 1rem;
  z-index: 20;
  transition: opacity var(--transition-normal) var(--ease-out-cubic);
  max-width: 200px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  font-size: 0.8rem;
  width: 100%;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.scene-selector {
  width: 100%;
  margin: 0.5rem 0;
}

.scene-select {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  width: 100%;
  font-size: 0.8rem;
}

/* Settings Modal */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-modal {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 1.3rem;
}

.close-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.modal-content {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.setting-section {
  margin-bottom: 2rem;
}

.setting-section h3 {
  color: #64b5f6;
  margin-bottom: 1rem;
}

.setting-item {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 500;
}

.volume-slider,
.speed-slider {
  width: 100%;
  margin-bottom: 0.5rem;
}

.volume-value,
.speed-value {
  color: #64b5f6;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.save-btn {
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  border: none;
  color: white;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }
  
  .scene-title {
    font-size: 1.1rem;
  }
  
  .dialogue-system {
    padding: 1rem;
  }
  
  .speaker-info {
    margin-bottom: 0.75rem;
  }
  
  .speaker-avatar {
    width: 50px;
    height: 50px;
  }
  
  .choices-list {
    gap: 0.5rem;
  }
  
  .choice-button {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
  
  .scene-navigation {
    top: 70px;
    right: 1rem;
    left: auto;
    transform: none;
    max-width: 160px;
  }
  
  .scene-selector {
    margin: 0.25rem 0;
    order: -1;
  }
  
  .scene-progress {
    top: 70px;
    left: 1rem;
    padding: 0.5rem 0.75rem;
  }
  
  .progress-track {
    width: 60px;
  }
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .character,
  .interactive-object,
  .dialogue-system,
  .text-chunk {
    transition: none;
  }
  
  .effect-particles::before {
    animation: none;
  }
  
  .character.character-speaking {
    animation: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .story-scene-view {
    background: #000;
  }
  
  .dialogue-system,
  .choice-button {
    border: 2px solid #fff;
  }
  
  .character {
    outline: 2px solid #fff;
  }
}
</style>