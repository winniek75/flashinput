<template>
  <div class="story-hub-view" :class="hubClasses">
    <!-- Header Section -->
    <header class="story-header">
      <div class="header-content">
        <button 
          @click="$router.go(-1)"
          class="back-button focus-ring"
          aria-label="前のページに戻る"
        >
          <Icon name="arrow-left" />
          <span>戻る</span>
        </button>

        <div class="header-title">
          <h1 class="page-title">Story Adventure Hub</h1>
          <p class="page-subtitle">言語の冒険を通じて学習しよう</p>
        </div>

        <div class="header-actions">
          <button 
            @click="toggleBookmarks"
            class="action-button focus-ring"
            :aria-pressed="showBookmarks"
            aria-label="ブックマーク表示切り替え"
          >
            <Icon name="bookmark" />
          </button>
          
          <button 
            @click="openSettings"
            class="action-button focus-ring"
            aria-label="設定を開く"
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="story-content" id="main-content">
      
      <!-- Story Categories -->
      <section class="story-categories" aria-labelledby="categories-heading">
        <h2 id="categories-heading" class="section-title">ストーリーカテゴリー</h2>
        
        <div class="category-grid">
          <div 
            v-for="category in storyCategories" 
            :key="category.id"
            class="category-card card-interactive focus-ring"
            :class="`category-${category.id}`"
            @click="selectCategory(category)"
            @keydown.enter="selectCategory(category)"
            @keydown.space.prevent="selectCategory(category)"
            tabindex="0"
            role="button"
            :aria-label="`${category.title}カテゴリーを選択`"
          >
            <div class="category-icon">
              <Icon :name="category.icon" />
            </div>
            <div class="category-content">
              <h3 class="category-title">{{ category.title }}</h3>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-stats">
                <span class="story-count">{{ category.storyCount }}話</span>
                <span class="difficulty">{{ category.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Stories -->
      <section class="featured-stories" aria-labelledby="featured-heading">
        <h2 id="featured-heading" class="section-title">おすすめストーリー</h2>
        
        <div class="stories-carousel">
          <div class="carousel-container">
            <div 
              class="story-cards"
              :style="{ transform: `translateX(-${currentSlide * 320}px)` }"
            >
              <div 
                v-for="story in featuredStories"
                :key="story.id"
                class="story-card card-interactive focus-ring"
                @click="openStory(story)"
                @keydown.enter="openStory(story)"
                @keydown.space.prevent="openStory(story)"
                tabindex="0"
                role="button"
                :aria-label="`${story.title}を読む`"
              >
                <div class="story-image">
                  <img 
                    :src="story.coverImage" 
                    :alt="story.title"
                    loading="lazy"
                  />
                  <div class="story-overlay">
                    <Icon name="play" class="play-icon" />
                  </div>
                </div>
                
                <div class="story-info">
                  <h3 class="story-title">{{ story.title }}</h3>
                  <p class="story-author">{{ story.author }}</p>
                  <div class="story-meta">
                    <span class="reading-time">{{ story.readingTime }}分</span>
                    <span class="story-level">{{ story.level }}</span>
                  </div>
                  <div class="story-progress" v-if="story.progress">
                    <div class="progress-bar">
                      <div 
                        class="progress-fill"
                        :style="{ width: `${story.progress}%` }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ story.progress }}%完了</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Carousel Controls -->
          <button 
            @click="previousSlide"
            class="carousel-button carousel-prev focus-ring"
            :disabled="currentSlide === 0"
            aria-label="前のストーリー"
          >
            <Icon name="chevron-left" />
          </button>
          
          <button 
            @click="nextSlide"
            class="carousel-button carousel-next focus-ring"
            :disabled="currentSlide >= maxSlide"
            aria-label="次のストーリー"
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      </section>

      <!-- Recent Stories -->
      <section class="recent-stories" aria-labelledby="recent-heading" v-if="recentStories.length > 0">
        <h2 id="recent-heading" class="section-title">最近読んだストーリー</h2>
        
        <div class="recent-grid">
          <div 
            v-for="story in recentStories"
            :key="story.id"
            class="recent-story-card card-interactive focus-ring"
            @click="openStory(story)"
            @keydown.enter="openStory(story)"
            @keydown.space.prevent="openStory(story)"
            tabindex="0"
            role="button"
            :aria-label="`${story.title}を続きから読む`"
          >
            <div class="recent-thumbnail">
              <img 
                :src="story.coverImage" 
                :alt="story.title"
                loading="lazy"
              />
            </div>
            
            <div class="recent-info">
              <h3 class="recent-title">{{ story.title }}</h3>
              <p class="recent-chapter">第{{ story.currentChapter }}章</p>
              <div class="recent-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: `${story.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
            
            <button 
              @click.stop="removeFromRecent(story.id)"
              class="remove-recent focus-ring"
              aria-label="最近のリストから削除"
            >
              <Icon name="x" />
            </button>
          </div>
        </div>
      </section>

      <!-- Bookmarks Section -->
      <section 
        class="bookmarks-section" 
        aria-labelledby="bookmarks-heading"
        v-if="showBookmarks && bookmarkedStories.length > 0"
      >
        <h2 id="bookmarks-heading" class="section-title">ブックマーク</h2>
        
        <div class="bookmarks-grid">
          <div 
            v-for="story in bookmarkedStories"
            :key="story.id"
            class="bookmark-card card-interactive focus-ring"
            @click="openStory(story)"
            @keydown.enter="openStory(story)"
            @keydown.space.prevent="openStory(story)"
            tabindex="0"
            role="button"
            :aria-label="`ブックマークした${story.title}を読む`"
          >
            <div class="bookmark-image">
              <img 
                :src="story.coverImage" 
                :alt="story.title"
                loading="lazy"
              />
            </div>
            
            <div class="bookmark-content">
              <h3 class="bookmark-title">{{ story.title }}</h3>
              <p class="bookmark-description">{{ story.description }}</p>
              <div class="bookmark-meta">
                <span class="bookmark-date">{{ formatDate(story.bookmarkedAt) }}</span>
              </div>
            </div>
            
            <button 
              @click.stop="removeBookmark(story.id)"
              class="remove-bookmark focus-ring"
              aria-label="ブックマークから削除"
            >
              <Icon name="bookmark-filled" />
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- Loading State -->
    <GalaxyLoader 
      v-if="loading"
      theme="galaxy"
      :progress="loadingProgress"
      title="Story Hub"
      message="ストーリーを読み込み中..."
      :tips="loadingTips"
    />

    <!-- Settings Modal -->
    <teleport to="body">
      <div 
        v-if="showSettingsModal"
        class="modal-overlay"
        @click="closeSettings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div 
          class="settings-modal"
          @click.stop
        >
          <header class="modal-header">
            <h2 id="settings-title">ストーリー設定</h2>
            <button 
              @click="closeSettings"
              class="close-button focus-ring"
              aria-label="設定を閉じる"
            >
              <Icon name="x" />
            </button>
          </header>
          
          <div class="modal-content">
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
              <label for="text-size">文字サイズ</label>
              <select 
                id="text-size"
                v-model="settings.textSize"
                class="text-size-select"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
                <option value="extra-large">特大</option>
              </select>
            </div>
            
            <div class="setting-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="settings.autoplay"
                  class="setting-checkbox"
                />
                <span class="checkbox-text">自動再生</span>
              </label>
            </div>
            
            <div class="setting-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox"
                  v-model="settings.highlightText"
                  class="setting-checkbox"
                />
                <span class="checkbox-text">テキストハイライト</span>
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              @click="resetSettings"
              class="reset-button focus-ring"
            >
              リセット
            </button>
            <button 
              @click="saveSettings"
              class="save-button focus-ring"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import Icon from '@/components/shared/Icon.vue'
import GalaxyLoader from '@/components/common/GalaxyLoader.vue'
import { accessibilityManager } from '@/utils/accessibilityManager'

// Router
const router = useRouter()

// Reactive state
const loading = ref(true)
const loadingProgress = ref(0)
const currentSlide = ref(0)
const showBookmarks = ref(false)
const showSettingsModal = ref(false)

// Settings
const settings = useStorage('story_hub_settings', {
  readingSpeed: 1.0,
  textSize: 'medium',
  autoplay: false,
  highlightText: true
})

// Computed properties
const hubClasses = computed(() => ({
  'show-bookmarks': showBookmarks.value,
  'loading': loading.value,
  [`text-${settings.value.textSize}`]: true
}))

const maxSlide = computed(() => {
  return Math.max(0, featuredStories.value.length - 3)
})

// Mock data
const storyCategories = ref([
  {
    id: 'adventure',
    title: '冒険',
    description: '宇宙の果てまで冒険する物語',
    icon: 'rocket',
    storyCount: 12,
    difficulty: '初級〜中級'
  },
  {
    id: 'friendship',
    title: '友情',
    description: '友達との絆を描いた心温まる話',
    icon: 'heart',
    storyCount: 8,
    difficulty: '初級'
  },
  {
    id: 'mystery',
    title: 'ミステリー',
    description: '謎解きとサスペンスの物語',
    icon: 'search',
    storyCount: 6,
    difficulty: '中級〜上級'
  },
  {
    id: 'fantasy',
    title: 'ファンタジー',
    description: '魔法と想像の世界',
    icon: 'star',
    storyCount: 10,
    difficulty: '中級'
  }
])

const featuredStories = ref([
  {
    id: 'cosmic-journey',
    title: '宇宙の旅人',
    author: 'ギャラクシー作家',
    coverImage: '/images/stories/cosmic-journey.jpg',
    readingTime: 15,
    level: '初級',
    progress: 65,
    description: '遠い星を目指す冒険の物語'
  },
  {
    id: 'friendship-stars',
    title: '星の友達',
    author: 'コスモス先生',
    coverImage: '/images/stories/friendship-stars.jpg',
    readingTime: 10,
    level: '初級',
    progress: 0,
    description: '宇宙で出会った友達との物語'
  },
  {
    id: 'planet-mystery',
    title: '惑星の謎',
    author: 'ミステリー博士',
    coverImage: '/images/stories/planet-mystery.jpg',
    readingTime: 20,
    level: '中級',
    progress: 30,
    description: '不思議な惑星で起こる謎の事件'
  },
  {
    id: 'galaxy-legends',
    title: '銀河の伝説',
    author: 'レジェンド作家',
    coverImage: '/images/stories/galaxy-legends.jpg',
    readingTime: 25,
    level: '上級',
    progress: 0,
    description: '古代銀河に伝わる壮大な物語'
  }
])

const recentStories = ref([
  {
    id: 'cosmic-journey',
    title: '宇宙の旅人',
    coverImage: '/images/stories/cosmic-journey.jpg',
    currentChapter: 3,
    progress: 65
  },
  {
    id: 'planet-mystery',
    title: '惑星の謎',
    coverImage: '/images/stories/planet-mystery.jpg',
    currentChapter: 2,
    progress: 30
  }
])

const bookmarkedStories = ref([
  {
    id: 'galaxy-legends',
    title: '銀河の伝説',
    coverImage: '/images/stories/galaxy-legends.jpg',
    description: '古代銀河に伝わる壮大な物語',
    bookmarkedAt: new Date('2024-01-15')
  }
])

const loadingTips = ref([
  'ストーリーを読むことで語彙力がアップします',
  'キャラクターの感情に注目してみましょう',
  '分からない単語があったらクリックしてみてください'
])

// Methods
const selectCategory = (category: any) => {
  router.push(`/story/category/${category.id}`)
}

const openStory = (story: any) => {
  router.push(`/story/${story.id}`)
}

const previousSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < maxSlide.value) {
    currentSlide.value++
  }
}

const toggleBookmarks = () => {
  showBookmarks.value = !showBookmarks.value
}

const openSettings = () => {
  showSettingsModal.value = true
  // Trap focus in modal
  accessibilityManager.trapFocus(document.querySelector('.settings-modal') as HTMLElement)
}

const closeSettings = () => {
  showSettingsModal.value = false
  accessibilityManager.releaseFocusTrap()
}

const saveSettings = () => {
  // Settings are automatically saved via useStorage
  closeSettings()
  
  // Announce save to screen reader
  accessibilityManager.announce({
    message: 'ストーリー設定が保存されました',
    priority: 'polite'
  })
}

const resetSettings = () => {
  settings.value = {
    readingSpeed: 1.0,
    textSize: 'medium',
    autoplay: false,
    highlightText: true
  }
  
  accessibilityManager.announce({
    message: 'ストーリー設定がリセットされました',
    priority: 'polite'
  })
}

const removeFromRecent = (storyId: string) => {
  const index = recentStories.value.findIndex(story => story.id === storyId)
  if (index !== -1) {
    recentStories.value.splice(index, 1)
  }
}

const removeBookmark = (storyId: string) => {
  const index = bookmarkedStories.value.findIndex(story => story.id === storyId)
  if (index !== -1) {
    bookmarkedStories.value.splice(index, 1)
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Initialize loading simulation
const initializeLoading = async () => {
  const stages = [
    'ストーリーデータベースに接続中...',
    'カテゴリーを読み込み中...',
    'おすすめストーリーを取得中...',
    'ユーザー設定を適用中...',
    '準備完了！'
  ]

  for (let i = 0; i < stages.length; i++) {
    loadingProgress.value = (i + 1) * 20
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  loading.value = false
}

// Lifecycle
onMounted(async () => {
  // Register focus groups for accessibility
  accessibilityManager.registerFocusGroup('story-categories', 
    Array.from(document.querySelectorAll('.category-card')) as HTMLElement[]
  )
  
  accessibilityManager.registerFocusGroup('featured-stories',
    Array.from(document.querySelectorAll('.story-card')) as HTMLElement[]
  )

  // Initialize loading
  await initializeLoading()

  // Announce page load
  accessibilityManager.announce({
    message: 'Story Adventure Hub が読み込まれました',
    priority: 'polite'
  })
})

onUnmounted(() => {
  // Clean up any resources
  accessibilityManager.releaseFocusTrap()
})
</script>

<style scoped>
.story-hub-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  overflow-x: hidden;
}

/* Header */
.story-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  text-decoration: none;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.header-title {
  text-align: center;
  flex: 1;
}

.page-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Main Content */
.story-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 1.5rem;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  border-radius: 2px;
}

/* Story Categories */
.story-categories {
  margin-bottom: 3rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.category-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.category-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.story-count {
  color: #4fc3f7;
  font-weight: 500;
}

.difficulty {
  color: rgba(255, 255, 255, 0.7);
}

/* Featured Stories */
.featured-stories {
  margin-bottom: 3rem;
}

.stories-carousel {
  position: relative;
}

.carousel-container {
  overflow: hidden;
  border-radius: 1rem;
}

.story-cards {
  display: flex;
  gap: 1.5rem;
  transition: transform var(--transition-normal) var(--ease-out-cubic);
}

.story-card {
  flex: 0 0 300px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
}

.story-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.story-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal) var(--ease-out-cubic);
}

.story-card:hover .story-image img {
  transform: scale(1.1);
}

.story-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast) var(--ease-out-cubic);
}

.story-card:hover .story-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 3rem;
  color: white;
}

.story-info {
  padding: 1.5rem;
}

.story-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.story-author {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.story-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.reading-time {
  color: #4fc3f7;
}

.story-level {
  color: rgba(255, 255, 255, 0.7);
}

.story-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  transition: width var(--transition-normal) var(--ease-out-cubic);
}

.progress-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Carousel Controls */
.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  z-index: 10;
}

.carousel-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.carousel-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-prev {
  left: -20px;
}

.carousel-next {
  right: -20px;
}

/* Recent Stories */
.recent-stories {
  margin-bottom: 3rem;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.recent-story-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  cursor: pointer;
  position: relative;
}

.recent-story-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.recent-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
}

.recent-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-info {
  flex: 1;
}

.recent-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.recent-chapter {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.recent-progress .progress-bar {
  height: 3px;
}

.remove-recent {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast) var(--ease-out-cubic);
  opacity: 0;
}

.recent-story-card:hover .remove-recent {
  opacity: 1;
}

.remove-recent:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Settings Modal */
.modal-overlay {
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
  background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
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
}

.close-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.modal-content {
  padding: 1.5rem;
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

.speed-slider,
.text-size-select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
}

.speed-value {
  display: block;
  margin-top: 0.5rem;
  color: #4fc3f7;
  font-weight: 500;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.setting-checkbox {
  width: auto !important;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reset-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all var(--transition-fast) var(--ease-out-cubic);
}

.reset-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.save-button {
  background: linear-gradient(45deg, #4fc3f7, #29b6f6);
  border: none;
  color: white;
}

/* Text Size Variations */
.text-small { font-size: 0.9rem; }
.text-medium { font-size: 1rem; }
.text-large { font-size: 1.1rem; }
.text-extra-large { font-size: 1.2rem; }

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .story-content {
    padding: 1rem;
  }
  
  .category-grid {
    grid-template-columns: 1fr;
  }
  
  .story-card {
    flex: 0 0 280px;
  }
  
  .carousel-prev {
    left: -10px;
  }
  
  .carousel-next {
    right: -10px;
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
  .story-cards,
  .story-card,
  .category-card {
    transition: none;
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .story-hub-view {
    background: #000;
  }
  
  .category-card,
  .story-card {
    border: 2px solid #fff;
  }
}
</style>