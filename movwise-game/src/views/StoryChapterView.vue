<template>
  <div class="story-chapter-view" :class="viewClasses">
    <!-- Reading Header -->
    <header class="reading-header" :class="{ 'header-hidden': isFullscreen }">
      <div class="header-content">
        <div class="header-left">
          <button 
            @click="goBack"
            class="back-button focus-ring"
            aria-label="ストーリーハブに戻る"
          >
            <Icon name="arrow-left" />
            <span>戻る</span>
          </button>
          
          <div class="chapter-info">
            <h1 class="chapter-title">{{ currentChapter?.title }}</h1>
            <p class="story-info">
              {{ currentStory?.title }} - 第{{ chapterNumber }}章
            </p>
          </div>
        </div>

        <div class="header-right">
          <div class="reading-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${readingProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ Math.round(readingProgress) }}%</span>
          </div>
          
          <div class="header-controls">
            <button 
              @click="toggleBookmark"
              class="control-button focus-ring"
              :class="{ active: isBookmarked }"
              :aria-pressed="isBookmarked"
              aria-label="ブックマーク切り替え"
            >
              <Icon :name="isBookmarked ? 'bookmark-filled' : 'bookmark'" />
            </button>
            
            <button 
              @click="toggleSettings"
              class="control-button focus-ring"
              :aria-pressed="showSettings"
              aria-label="読書設定"
            >
              <Icon name="settings" />
            </button>
            
            <button 
              @click="toggleFullscreen"
              class="control-button focus-ring"
              :aria-pressed="isFullscreen"
              aria-label="フルスクリーン切り替え"
            >
              <Icon :name="isFullscreen ? 'minimize' : 'maximize'" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Reading Settings Panel -->
    <aside 
      class="settings-panel"
      :class="{ 'panel-visible': showSettings }"
      aria-label="読書設定パネル"
    >
      <div class="settings-content">
        <h3 class="settings-title">読書設定</h3>
        
        <div class="setting-group">
          <label for="font-size">文字サイズ</label>
          <input 
            id="font-size"
            type="range"
            min="12"
            max="24"
            step="1"
            v-model="settings.fontSize"
            class="size-slider"
            @input="applySettings"
          />
          <span class="size-value">{{ settings.fontSize }}px</span>
        </div>
        
        <div class="setting-group">
          <label for="line-height">行間</label>
          <input 
            id="line-height"
            type="range"
            min="1.2"
            max="2.0"
            step="0.1"
            v-model="settings.lineHeight"
            class="height-slider"
            @input="applySettings"
          />
          <span class="height-value">{{ settings.lineHeight }}</span>
        </div>
        
        <div class="setting-group">
          <label for="reading-speed">読み上げ速度</label>
          <input 
            id="reading-speed"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            v-model="settings.readingSpeed"
            class="speed-slider"
          />
          <span class="speed-value">{{ settings.readingSpeed }}x</span>
        </div>
        
        <div class="setting-group">
          <label for="theme-select">テーマ</label>
          <select 
            id="theme-select"
            v-model="settings.theme"
            class="theme-select"
            @change="applySettings"
          >
            <option value="default">デフォルト</option>
            <option value="dark">ダーク</option>
            <option value="sepia">セピア</option>
            <option value="high-contrast">高コントラスト</option>
          </select>
        </div>
        
        <div class="setting-toggles">
          <label class="toggle-label">
            <input 
              type="checkbox"
              v-model="settings.autoScroll"
              @change="applySettings"
            />
            <span>自動スクロール</span>
          </label>
          
          <label class="toggle-label">
            <input 
              type="checkbox"
              v-model="settings.highlightSentence"
              @change="applySettings"
            />
            <span>文ハイライト</span>
          </label>
          
          <label class="toggle-label">
            <input 
              type="checkbox"
              v-model="settings.showTranslation"
              @change="applySettings"
            />
            <span>翻訳表示</span>
          </label>
        </div>
      </div>
    </aside>

    <!-- Main Reading Area -->
    <main class="reading-area" id="main-content">
      <div class="story-container" ref="storyContainer">
        
        <!-- Chapter Content -->
        <article class="chapter-content" :style="contentStyles">
          <header class="content-header">
            <h2 class="chapter-heading">{{ currentChapter?.title }}</h2>
            <div class="chapter-meta">
              <span class="reading-time">読書時間: {{ estimatedReadingTime }}分</span>
              <span class="word-count">{{ wordCount }}語</span>
            </div>
          </header>

          <!-- Story Text -->
          <div 
            class="story-text"
            ref="storyTextRef"
            :class="textClasses"
          >
            <div 
              v-for="(paragraph, index) in storyParagraphs"
              :key="`paragraph-${index}`"
              class="story-paragraph"
              :class="{
                'paragraph-highlighted': highlightedParagraph === index,
                'paragraph-current': currentParagraph === index
              }"
              :id="`paragraph-${index}`"
              @click="onParagraphClick(index)"
            >
              <p class="paragraph-text">
                <span 
                  v-for="(sentence, sentenceIndex) in paragraph.sentences"
                  :key="`sentence-${index}-${sentenceIndex}`"
                  class="sentence"
                  :class="{
                    'sentence-highlighted': settings.highlightSentence && 
                      currentSentence === `${index}-${sentenceIndex}`
                  }"
                  @click.stop="onSentenceClick(index, sentenceIndex)"
                >
                  {{ sentence.text }}
                </span>
              </p>
              
              <!-- Translation -->
              <div 
                v-if="settings.showTranslation && paragraph.translation"
                class="paragraph-translation"
              >
                {{ paragraph.translation }}
              </div>
              
              <!-- Interactive Elements -->
              <div 
                v-if="paragraph.interactive"
                class="interactive-elements"
              >
                <div 
                  v-for="element in paragraph.interactive"
                  :key="element.id"
                  class="interactive-element"
                  :class="`element-${element.type}`"
                >
                  <component 
                    :is="getInteractiveComponent(element.type)"
                    :config="element.config"
                    @interaction="onInteraction"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Vocabulary Sidebar -->
          <aside 
            class="vocabulary-sidebar"
            :class="{ 'sidebar-visible': showVocabulary }"
            aria-label="語彙ヘルプ"
          >
            <div class="vocabulary-content">
              <h4 class="vocabulary-title">語彙ヘルプ</h4>
              <div 
                v-if="selectedWord"
                class="word-definition"
              >
                <div class="word-header">
                  <span class="word-text">{{ selectedWord.text }}</span>
                  <button 
                    @click="playWordPronunciation"
                    class="pronunciation-button focus-ring"
                    aria-label="発音を聞く"
                  >
                    <Icon name="volume" />
                  </button>
                </div>
                <div class="word-details">
                  <p class="word-meaning">{{ selectedWord.meaning }}</p>
                  <p class="word-reading" v-if="selectedWord.reading">
                    読み: {{ selectedWord.reading }}
                  </p>
                  <div class="word-examples" v-if="selectedWord.examples">
                    <h5>例文:</h5>
                    <ul>
                      <li 
                        v-for="example in selectedWord.examples"
                        :key="example.id"
                      >
                        {{ example.text }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </article>

        <!-- Chapter Navigation -->
        <nav class="chapter-navigation" aria-label="章ナビゲーション">
          <button 
            @click="previousChapter"
            class="nav-button nav-prev focus-ring"
            :disabled="!hasPreviousChapter"
            aria-label="前の章"
          >
            <Icon name="chevron-left" />
            <span>前の章</span>
          </button>
          
          <div class="chapter-selector">
            <select 
              v-model="currentChapterIndex"
              @change="goToChapter"
              class="chapter-select"
              aria-label="章を選択"
            >
              <option 
                v-for="(chapter, index) in allChapters"
                :key="chapter.id"
                :value="index"
              >
                第{{ index + 1 }}章: {{ chapter.title }}
              </option>
            </select>
          </div>
          
          <button 
            @click="nextChapter"
            class="nav-button nav-next focus-ring"
            :disabled="!hasNextChapter"
            aria-label="次の章"
          >
            <span>次の章</span>
            <Icon name="chevron-right" />
          </button>
        </nav>
      </div>
    </main>

    <!-- Audio Controls -->
    <div 
      class="audio-controls"
      :class="{ 'controls-visible': showAudioControls }"
    >
      <button 
        @click="togglePlayPause"
        class="audio-button play-pause focus-ring"
        :aria-label="isPlaying ? '一時停止' : '再生'"
      >
        <Icon :name="isPlaying ? 'pause' : 'play'" />
      </button>
      
      <button 
        @click="rewindStory"
        class="audio-button rewind focus-ring"
        aria-label="巻き戻し"
      >
        <Icon name="rewind" />
      </button>
      
      <button 
        @click="fastForward"
        class="audio-button forward focus-ring"
        aria-label="早送り"
      >
        <Icon name="fast-forward" />
      </button>
      
      <div class="audio-progress">
        <input 
          type="range"
          min="0"
          :max="audioDuration"
          v-model="audioCurrentTime"
          @input="seekAudio"
          class="audio-slider"
          aria-label="音声進行状況"
        />
      </div>
      
      <div class="audio-time">
        <span>{{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <GalaxyLoader 
      v-if="loading"
      theme="galaxy"
      :progress="loadingProgress"
      title="Story Chapter"
      message="章を読み込み中..."
      :tips="loadingTips"
    />

    <!-- Word Selection Tooltip -->
    <div 
      v-if="showWordTooltip"
      class="word-tooltip"
      :style="tooltipPosition"
      role="tooltip"
    >
      <div class="tooltip-content">
        <div class="tooltip-word">{{ tooltipWord?.text }}</div>
        <div class="tooltip-meaning">{{ tooltipWord?.meaning }}</div>
        <button 
          @click="addToVocabulary"
          class="tooltip-action focus-ring"
        >
          語彙に追加
        </button>
      </div>
    </div>
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
}

const props = defineProps<Props>()

// Router
const route = useRoute()
const router = useRouter()

// Reactive state
const loading = ref(true)
const loadingProgress = ref(0)
const isFullscreen = ref(false)
const showSettings = ref(false)
const showVocabulary = ref(false)
const showAudioControls = ref(false)
const showWordTooltip = ref(false)
const isBookmarked = ref(false)
const isPlaying = ref(false)

const currentChapterIndex = ref(0)
const currentParagraph = ref(0)
const currentSentence = ref('')
const highlightedParagraph = ref(-1)
const readingProgress = ref(0)
const selectedWord = ref<any>(null)
const tooltipWord = ref<any>(null)
const tooltipPosition = ref({ top: '0px', left: '0px' })

const audioCurrentTime = ref(0)
const audioDuration = ref(0)
const autoScrollTimer = ref<NodeJS.Timeout | null>(null)

// Refs
const storyContainer = ref<HTMLElement>()
const storyTextRef = ref<HTMLElement>()

// Settings
const settings = useStorage('story_reading_settings', {
  fontSize: 16,
  lineHeight: 1.6,
  readingSpeed: 1.0,
  theme: 'default',
  autoScroll: false,
  highlightSentence: true,
  showTranslation: false
})

// Computed properties
const viewClasses = computed(() => ({
  'fullscreen': isFullscreen.value,
  'settings-open': showSettings.value,
  'vocabulary-open': showVocabulary.value,
  [`theme-${settings.value.theme}`]: true
}))

const textClasses = computed(() => ({
  'auto-scroll': settings.value.autoScroll,
  'highlight-enabled': settings.value.highlightSentence
}))

const contentStyles = computed(() => ({
  fontSize: `${settings.value.fontSize}px`,
  lineHeight: settings.value.lineHeight.toString()
}))

const chapterNumber = computed(() => currentChapterIndex.value + 1)

const estimatedReadingTime = computed(() => {
  const wordsPerMinute = 200
  return Math.ceil(wordCount.value / wordsPerMinute)
})

const wordCount = computed(() => {
  return storyParagraphs.value.reduce((count, paragraph) => {
    return count + paragraph.sentences.reduce((sentenceCount, sentence) => {
      return sentenceCount + sentence.text.split(' ').length
    }, 0)
  }, 0)
})

const hasPreviousChapter = computed(() => currentChapterIndex.value > 0)
const hasNextChapter = computed(() => currentChapterIndex.value < allChapters.value.length - 1)

// Mock data
const currentStory = ref({
  id: 'cosmic-journey',
  title: '宇宙の旅人',
  author: 'ギャラクシー作家',
  description: '遠い星を目指す冒険の物語'
})

const allChapters = ref([
  { id: 'chapter-1', title: '旅立ちの日' },
  { id: 'chapter-2', title: '星の海へ' },
  { id: 'chapter-3', title: '未知の惑星' },
  { id: 'chapter-4', title: '新たな出会い' },
  { id: 'chapter-5', title: '帰還への道' }
])

const currentChapter = computed(() => {
  return allChapters.value[currentChapterIndex.value]
})

const storyParagraphs = ref([
  {
    sentences: [
      { text: 'ある晴れた朝、主人公の太郎は宇宙船の準備を始めました。' },
      { text: '今日こそ、長年夢見ていた宇宙旅行に出発する日でした。' }
    ],
    translation: 'One sunny morning, the protagonist Taro began preparing his spaceship. Today was the day he would finally embark on the space journey he had dreamed of for years.',
    interactive: null
  },
  {
    sentences: [
      { text: '宇宙船のエンジンが轟音を立てて起動し、ゆっくりと地面から離れていきます。' },
      { text: '太郎は窓から見える地球が小さくなっていく様子を見つめていました。' }
    ],
    translation: 'The spaceship\'s engine roared to life and slowly lifted off from the ground. Taro watched as the Earth visible through the window gradually became smaller.',
    interactive: [
      {
        id: 'vocab-1',
        type: 'vocabulary',
        config: {
          word: '轟音',
          meaning: 'loud roaring sound',
          reading: 'ごうおん'
        }
      }
    ]
  },
  {
    sentences: [
      { text: '数時間後、太郎は美しい星々に囲まれた宇宙空間に到達しました。' },
      { text: 'この景色は、今まで見たどんな景色よりも素晴らしいものでした。' }
    ],
    translation: 'A few hours later, Taro reached outer space surrounded by beautiful stars. This view was more wonderful than any scenery he had ever seen.',
    interactive: null
  }
])

const loadingTips = ref([
  '物語を読みながら新しい語彙を学習できます',
  '音声読み上げ機能で発音も学習しましょう',
  '分からない単語はクリックして意味を確認できます'
])

// Methods
const goBack = () => {
  router.push('/story')
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  
  accessibilityManager.announce({
    message: isBookmarked.value ? 'ブックマークに追加しました' : 'ブックマークから削除しました',
    priority: 'polite'
  })
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
  
  if (showSettings.value) {
    accessibilityManager.announce({
      message: '読書設定パネルを開きました',
      priority: 'polite'
    })
  }
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
  
  accessibilityManager.announce({
    message: isFullscreen.value ? 'フルスクリーンモードに入りました' : 'フルスクリーンモードを終了しました',
    priority: 'polite'
  })
}

const applySettings = () => {
  // Settings are automatically applied via reactive computed properties
  if (settings.value.autoScroll) {
    startAutoScroll()
  } else {
    stopAutoScroll()
  }
}

const startAutoScroll = () => {
  stopAutoScroll()
  
  autoScrollTimer.value = setInterval(() => {
    if (storyContainer.value) {
      storyContainer.value.scrollBy(0, 1)
    }
  }, 50)
}

const stopAutoScroll = () => {
  if (autoScrollTimer.value) {
    clearInterval(autoScrollTimer.value)
    autoScrollTimer.value = null
  }
}

const onParagraphClick = (index: number) => {
  currentParagraph.value = index
  highlightedParagraph.value = index
  
  // Update reading progress
  updateReadingProgress()
  
  // Announce paragraph to screen reader
  accessibilityManager.announce({
    message: `段落 ${index + 1}`,
    priority: 'polite'
  })
}

const onSentenceClick = (paragraphIndex: number, sentenceIndex: number) => {
  currentSentence.value = `${paragraphIndex}-${sentenceIndex}`
  
  // Play sentence audio if available
  if (isPlaying.value) {
    playSentenceAudio(paragraphIndex, sentenceIndex)
  }
}

const onWordClick = (event: MouseEvent, word: any) => {
  selectedWord.value = word
  showVocabulary.value = true
  
  // Show tooltip
  tooltipWord.value = word
  tooltipPosition.value = {
    top: `${event.clientY + 10}px`,
    left: `${event.clientX}px`
  }
  showWordTooltip.value = true
  
  // Hide tooltip after 3 seconds
  setTimeout(() => {
    showWordTooltip.value = false
  }, 3000)
}

const addToVocabulary = () => {
  if (tooltipWord.value) {
    // Add word to user's vocabulary list
    logger.log('Adding to vocabulary:', tooltipWord.value)
    
    accessibilityManager.announce({
      message: `${tooltipWord.value.text}を語彙リストに追加しました`,
      priority: 'polite'
    })
  }
  
  showWordTooltip.value = false
}

const playWordPronunciation = async () => {
  if (selectedWord.value) {
    await soundManager.playSFX('word_pronunciation', 80, {
      onEnd: () => {
        accessibilityManager.announce({
          message: '発音が終了しました',
          priority: 'polite'
        })
      }
    })
  }
}

const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value
  showAudioControls.value = true
  
  if (isPlaying.value) {
    startNarration()
  } else {
    pauseNarration()
  }
}

const startNarration = async () => {
  // Start playing chapter narration
  await soundManager.playVoice('narrator', `chapter-${currentChapterIndex.value}`, {
    onEnd: () => {
      isPlaying.value = false
      accessibilityManager.announce({
        message: '章の読み上げが終了しました',
        priority: 'polite'
      })
    }
  })
}

const pauseNarration = () => {
  soundManager.stopAllAudio('voice')
}

const rewindStory = () => {
  audioCurrentTime.value = Math.max(0, audioCurrentTime.value - 10)
  seekAudio()
}

const fastForward = () => {
  audioCurrentTime.value = Math.min(audioDuration.value, audioCurrentTime.value + 10)
  seekAudio()
}

const seekAudio = () => {
  // Seek to specific time in narration
  logger.log('Seeking to:', audioCurrentTime.value)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playSentenceAudio = async (paragraphIndex: number, sentenceIndex: number) => {
  const audioId = `sentence-${paragraphIndex}-${sentenceIndex}`
  await soundManager.playVoice('narrator', audioId)
}

const updateReadingProgress = () => {
  const totalParagraphs = storyParagraphs.value.length
  const progress = ((currentParagraph.value + 1) / totalParagraphs) * 100
  readingProgress.value = Math.min(100, progress)
}

const previousChapter = () => {
  if (hasPreviousChapter.value) {
    currentChapterIndex.value--
    loadChapter()
  }
}

const nextChapter = () => {
  if (hasNextChapter.value) {
    currentChapterIndex.value++
    loadChapter()
  }
}

const goToChapter = () => {
  loadChapter()
}

const loadChapter = async () => {
  loading.value = true
  loadingProgress.value = 0
  
  // Simulate chapter loading
  const stages = ['章データを取得中...', 'テキストを読み込み中...', '音声を準備中...', '完了']
  
  for (let i = 0; i < stages.length; i++) {
    loadingProgress.value = (i + 1) * 25
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  // Reset reading state
  currentParagraph.value = 0
  currentSentence.value = ''
  readingProgress.value = 0
  
  loading.value = false
  
  // Announce chapter change
  accessibilityManager.announce({
    message: `第${chapterNumber.value}章「${currentChapter.value?.title}」を読み込みました`,
    priority: 'polite'
  })
}

const onInteraction = (interaction: any) => {
  logger.log('Interactive element interaction:', interaction)
}

const getInteractiveComponent = (type: string) => {
  // Return appropriate interactive component based on type
  return 'div' // Placeholder
}

// Lifecycle
onMounted(async () => {
  // Initialize chapter from route
  const chapterId = route.params.chapterId as string
  const chapterIndex = allChapters.value.findIndex(chapter => chapter.id === chapterId)
  if (chapterIndex !== -1) {
    currentChapterIndex.value = chapterIndex
  }
  
  // Register focus groups
  accessibilityManager.registerFocusGroup('story-content', 
    Array.from(document.querySelectorAll('.story-paragraph')) as HTMLElement[]
  )
  
  // Load chapter
  await loadChapter()
  
  // Setup scroll tracking for reading progress
  const handleScroll = () => {
    if (storyContainer.value) {
      const scrollTop = storyContainer.value.scrollTop
      const scrollHeight = storyContainer.value.scrollHeight - storyContainer.value.clientHeight
      const scrollProgress = (scrollTop / scrollHeight) * 100
      readingProgress.value = Math.min(100, scrollProgress)
    }
  }
  
  storyContainer.value?.addEventListener('scroll', handleScroll)
  
  // Setup keyboard shortcuts
  accessibilityManager.registerShortcut('toggle-play', {
    keys: ['Space'],
    action: togglePlayPause,
    description: '読み上げ開始/停止',
    context: 'story',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('next-paragraph', {
    keys: ['ArrowDown'],
    action: () => {
      if (currentParagraph.value < storyParagraphs.value.length - 1) {
        onParagraphClick(currentParagraph.value + 1)
      }
    },
    description: '次の段落',
    context: 'story',
    enabled: true
  })
  
  accessibilityManager.registerShortcut('prev-paragraph', {
    keys: ['ArrowUp'],
    action: () => {
      if (currentParagraph.value > 0) {
        onParagraphClick(currentParagraph.value - 1)
      }
    },
    description: '前の段落',
    context: 'story',
    enabled: true
  })
})

onUnmounted(() => {
  stopAutoScroll()
  soundManager.stopAllAudio()
  accessibilityManager.unregisterShortcut('toggle-play')
  accessibilityManager.unregisterShortcut('next-paragraph')
  accessibilityManager.unregisterShortcut('prev-paragraph')
})

// Watch for chapter changes
watch(() => currentChapterIndex.value, () => {
  router.push(`/story/${allChapters.value[currentChapterIndex.value].id}`)
})
</script>

<style scoped>
.story-chapter-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.story-chapter-view.fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

/* Header */
.reading-header {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform var(--transition-normal) var(--ease-out-cubic);
  position: sticky;
  top: 0;
  z-index: 100;
}

.reading-header.header-hidden {
  transform: translateY(-100%);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #e0e0e0;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.chapter-info {
  flex: 1;
}

.chapter-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: #4fc3f7;
}

.story-info {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reading-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
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
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  transition: width var(--transition-normal) var(--ease-out-cubic);
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  min-width: 35px;
}

.header-controls {
  display: flex;
  gap: 0.5rem;
}

.control-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #e0e0e0;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-button.active {
  background: #4fc3f7;
  color: white;
}

/* Settings Panel */
.settings-panel {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: right var(--transition-normal) var(--ease-out-cubic);
  z-index: 200;
  overflow-y: auto;
}

.settings-panel.panel-visible {
  right: 0;
}

.settings-content {
  padding: 2rem;
}

.settings-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #4fc3f7;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
  font-weight: 500;
}

.size-slider,
.height-slider,
.speed-slider {
  width: 100%;
  margin-bottom: 0.5rem;
}

.size-value,
.height-value,
.speed-value {
  color: #4fc3f7;
  font-weight: 500;
}

.theme-select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #e0e0e0;
}

.setting-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

/* Main Reading Area */
.reading-area {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.story-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.chapter-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.content-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.chapter-heading {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #4fc3f7;
}

.chapter-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.story-text {
  line-height: 1.8;
  font-size: 1rem;
}

.story-paragraph {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
}

.story-paragraph:hover {
  background: rgba(255, 255, 255, 0.05);
}

.story-paragraph.paragraph-highlighted {
  background: rgba(79, 195, 247, 0.1);
  border-left: 4px solid #4fc3f7;
}

.story-paragraph.paragraph-current {
  background: rgba(79, 195, 247, 0.15);
}

.paragraph-text {
  margin: 0;
  line-height: inherit;
}

.sentence {
  transition: background-color var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
  padding: 0.1rem 0.2rem;
  border-radius: 0.2rem;
}

.sentence.sentence-highlighted {
  background: rgba(79, 195, 247, 0.3);
  color: white;
}

.paragraph-translation {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.interactive-elements {
  margin-top: 1rem;
}

.interactive-element {
  display: inline-block;
  margin: 0.25rem;
}

/* Vocabulary Sidebar */
.vocabulary-sidebar {
  position: fixed;
  top: 0;
  left: -400px;
  width: 400px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: left var(--transition-normal) var(--ease-out-cubic);
  z-index: 200;
  overflow-y: auto;
}

.vocabulary-sidebar.sidebar-visible {
  left: 0;
}

.vocabulary-content {
  padding: 2rem;
}

.vocabulary-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #4fc3f7;
}

.word-definition {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.word-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.word-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4fc3f7;
}

.pronunciation-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #e0e0e0;
}

.word-meaning {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.word-reading {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.word-examples h5 {
  margin-bottom: 0.5rem;
  color: #4fc3f7;
}

.word-examples ul {
  list-style: none;
  padding: 0;
}

.word-examples li {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
}

/* Chapter Navigation */
.chapter-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 2rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #e0e0e0;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chapter-selector {
  flex: 1;
  margin: 0 1rem;
}

.chapter-select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: #e0e0e0;
  text-align: center;
}

/* Audio Controls */
.audio-controls {
  position: fixed;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  padding: 1rem 2rem;
  transition: bottom var(--transition-normal) var(--ease-out-cubic);
  z-index: 150;
}

.audio-controls.controls-visible {
  bottom: 2rem;
}

.audio-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.audio-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.play-pause {
  background: #4fc3f7;
  color: white;
}

.audio-progress {
  flex: 1;
  min-width: 200px;
}

.audio-slider {
  width: 100%;
}

.audio-time {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  min-width: 80px;
  text-align: center;
}

/* Word Tooltip */
.word-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  z-index: 300;
  max-width: 250px;
}

.tooltip-content {
  text-align: center;
}

.tooltip-word {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4fc3f7;
  margin-bottom: 0.5rem;
}

.tooltip-meaning {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.tooltip-action {
  padding: 0.5rem 1rem;
  background: #4fc3f7;
  border: none;
  border-radius: 0.25rem;
  color: white;
  font-size: 0.9rem;
}

/* Theme Variations */
.theme-dark {
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
}

.theme-sepia {
  background: linear-gradient(135deg, #2c2416 0%, #3d3123 100%);
  color: #f4f1e8;
}

.theme-sepia .chapter-content {
  background: rgba(244, 241, 232, 0.05);
}

.theme-high-contrast {
  background: #000000;
  color: #ffffff;
}

.theme-high-contrast .chapter-content {
  background: #1a1a1a;
  border: 2px solid #ffffff;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-content {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .header-left {
    flex: 1;
    min-width: 100%;
    order: 1;
  }
  
  .header-right {
    flex: 1;
    justify-content: space-between;
    order: 2;
  }
  
  .chapter-title {
    font-size: 1rem;
  }
  
  .story-container {
    padding: 1rem;
  }
  
  .chapter-content {
    padding: 1rem;
  }
  
  .settings-panel,
  .vocabulary-sidebar {
    width: 100%;
    left: -100%;
    right: -100%;
  }
  
  .settings-panel.panel-visible {
    right: 0;
  }
  
  .vocabulary-sidebar.sidebar-visible {
    left: 0;
  }
  
  .chapter-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .chapter-selector {
    order: 1;
    margin: 0;
  }
  
  .nav-prev {
    order: 2;
  }
  
  .nav-next {
    order: 3;
  }
  
  .audio-controls {
    left: 1rem;
    right: 1rem;
    transform: none;
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
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
  .story-paragraph,
  .sentence,
  .settings-panel,
  .vocabulary-sidebar,
  .audio-controls {
    transition: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .story-chapter-view {
    background: #000;
    color: #fff;
  }
  
  .chapter-content,
  .story-paragraph {
    border: 2px solid #fff;
  }
}
</style>