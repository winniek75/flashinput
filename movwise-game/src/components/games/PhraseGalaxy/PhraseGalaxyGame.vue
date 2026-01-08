<template>
  <div class="phrase-galaxy-game" ref="gameContainer">
    <!-- SVGグラデーション定義 -->
    <svg class="star-gradient-defs">
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>

    <!-- 宇宙背景 -->
    <div class="space-background">
      <!-- 星 -->
      <div
        v-for="n in 100"
        :key="'star-' + n"
        class="space-star"
        :style="getStarStyle(n)"
      ></div>

      <!-- 宇宙の雲（非表示にしてクリーンな背景に） -->
      <!--
      <div
        v-for="n in 5"
        :key="'nebula-' + n"
        class="space-nebula"
        :style="getNebulaStyle(n)"
      ></div>
      -->
    </div>

    <!-- ゲームヘッダー -->
    <div class="game-header">
      <button @click="goBack" class="back-button">
        ← Back to Galaxy
      </button>

      <div class="game-info">
        <h1 class="game-title">Phrase Galaxy</h1>
        <div class="level-info">
          {{ currentLevelInfo?.name }} - {{ currentLevelInfo?.description }}
        </div>
      </div>

      <div class="game-stats">
        <div class="score">Score: {{ store.score }}</div>
        <div class="progress">{{ store.currentQuestionIndex }}/{{ store.totalQuestions }}</div>
        <div class="accuracy">Accuracy: {{ store.accuracy }}%</div>
      </div>
    </div>

    <!-- レベル選択画面 -->
    <div v-if="showLevelSelection" class="level-selection">
      <h2 class="selection-title">Choose Your Level</h2>
      <div class="level-grid">
        <div
          v-for="level in levelInfo"
          :key="level.id"
          class="level-card"
          :class="{
            'locked': !store.availableLevels.includes(level.id),
            'current': store.currentLevel === level.id
          }"
          @click="selectLevel(level.id)"
        >
          <div class="level-icon">{{ level.icon }}</div>
          <div class="level-name">{{ level.name }}</div>
          <div class="level-description">{{ level.description }}</div>
          <div class="level-stats">
            <div class="question-count">{{ level.questionCount }} questions</div>
            <div class="estimated-time">{{ level.estimatedTime }}</div>
          </div>
          <div v-if="level.unlockRequirement && !store.availableLevels.includes(level.id)" class="unlock-requirement">
            {{ level.unlockRequirement }}
          </div>
        </div>
      </div>
    </div>

    <!-- ゲーム画面 -->
    <div v-else-if="store.isGameActive" class="game-screen">
      <!-- 問題画像エリア -->
      <div class="question-area">
        <div v-if="store.currentQuestion" class="question-image-container">
          <!-- 画像ローディング表示 -->
          <div v-if="!currentImageUrl" class="image-loading">
            <div class="loading-spinner"></div>
            <p>Loading image...</p>
          </div>

          <!-- 画像表示 -->
          <template v-else>
            <img
              :src="currentImageUrl"
              :alt="store.currentQuestion.imageAlt"
              class="question-image"
              @error="handleImageError"
              @load="() => console.log('✅ Image loaded:', currentImageUrl.startsWith('data:') ? 'SVG Placeholder' : currentImageUrl.startsWith('/images/') ? 'Local Image' : 'External Image')"
              :key="store.currentQuestion.id"
            />
            <!-- デバッグ情報（本番環境では削除予定） -->
            <div v-if="false" class="debug-info">
              <div><small>🖼️ Current URL: {{ currentImageUrl.startsWith('data:') ? 'SVG Placeholder' : currentImageUrl }}</small></div>
              <div><small>🎯 Phrase: {{ store.currentQuestion?.phrase }}</small></div>
              <div><small>🔄 Retry Count: {{ imageRetryCount }}</small></div>
              <div><small>📦 Store imageUrl: {{ store.currentQuestion?.imageUrl || 'undefined' }}</small></div>
            </div>
          </template>
        </div>
        <div v-else class="loading-question">
          <div class="loading-spinner"></div>
          <p>Loading next question...</p>
        </div>
      </div>

      <!-- 選択肢エリア -->
      <div class="choices-area" ref="choicesContainer">
        <FloatingChoice
          v-for="choice in store.choices"
          :key="`${choice.id}-${store.currentQuestionIndex}`"
          :phrase="choice.phrase"
          :is-correct="choice.isCorrect"
          :position="choice.position"
          :is-selected="store.selectedChoice === choice.phrase"
          :show-feedback="store.showFeedback"
          :disabled="store.selectedChoice !== null && store.showFeedback"
          @click="handleChoiceClick"
          @position-update="updateChoicePosition(choice.id, $event)"
          ref="floatingChoices"
        />
      </div>

      <!-- フィードバック -->
      <div v-if="store.showFeedback" class="feedback-area">
        <div
          class="feedback-message"
          :class="store.feedbackType"
        >
          <div class="feedback-icon">
            {{ store.feedbackType === 'correct' ? '🎉' : '❌' }}
          </div>
          <div class="feedback-text">
            <div class="feedback-title">
              {{ store.feedbackType === 'correct' ? 'Correct!' : 'Try Again!' }}
            </div>
            <div class="feedback-description">
              {{ store.feedbackType === 'correct'
                ? 'Great job! Moving to next question...'
                : `The correct answer is: ${store.currentQuestion?.phrase}` }}
            </div>
          </div>
        </div>
      </div>

      <!-- 次の問題ボタン（手動進行時） -->
      <div v-if="!store.gameSettings.autoNext && store.showFeedback" class="next-button-area">
        <button @click="nextQuestion" class="next-button">
          {{ store.currentQuestionIndex >= store.totalQuestions ? 'View Results' : 'Next Question' }}
        </button>
      </div>
    </div>

    <!-- 結果画面 -->
    <div v-else-if="showResults" class="results-screen">
      <div class="results-container">
        <div class="results-icon">🏆</div>
        <h2 class="results-title">Game Complete!</h2>

        <div class="results-stats">
          <div class="stat-item">
            <div class="stat-label">Final Score</div>
            <div class="stat-value">{{ store.score }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value">{{ store.accuracy }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Questions Answered</div>
            <div class="stat-value">{{ store.answeredQuestions.size }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Time Elapsed</div>
            <div class="stat-value">{{ formatTime(store.timeElapsed) }}</div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="playAgain" class="action-button primary">
            Play Again
          </button>
          <button @click="chooseDifferentLevel" class="action-button secondary">
            Choose Different Level
          </button>
          <button @click="goBack" class="action-button secondary">
            Back to Galaxy
          </button>
        </div>
      </div>
    </div>

    <!-- エラー表示 -->
    <div v-if="store.error" class="error-message">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ store.error }}</div>
        <button @click="store.error = null" class="error-dismiss">
          Dismiss
        </button>
      </div>
    </div>

    <!-- ローディング -->
    <div v-if="store.isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Preparing your cosmic adventure...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePhraseGalaxyStore } from '@/stores/phraseGalaxyStore'
import { levelInfo } from '@/data/phraseGalaxyData'
import type { FloatingChoicePosition } from '@/types/phraseGalaxy'
import FloatingChoice from './FloatingChoice.vue'

const router = useRouter()
const store = usePhraseGalaxyStore()

// Refs
const gameContainer = ref<HTMLElement>()
const choicesContainer = ref<HTMLElement>()
const floatingChoices = ref<InstanceType<typeof FloatingChoice>[]>([])

// State
const showLevelSelection = ref(true)
const showResults = ref(false)
const currentImageUrl = ref('') // 🆕 追加
const imageRetryCount = ref(0) // 🆕 追加

// Computed
const currentLevelInfo = computed(() => {
  return levelInfo.find(level => level.id === store.currentLevel)
})

// 🆕 現在の問題が変わったら適切な画像を取得
watch(() => store.currentQuestion, (newQuestion) => {
  if (newQuestion) {
    console.log('📖 New question:', newQuestion.phrase)
    imageRetryCount.value = 0

    // ストアからの画像URLを使用（ローカル画像パスが設定されている）
    const imageUrl = newQuestion.imageUrl || ''
    loadImageForQuestion(newQuestion.phrase, imageUrl)
  } else {
    currentImageUrl.value = ''
  }
}, { immediate: true })

// 🆕 ストアのcurrentQuestion.imageUrlの変更も監視（削除 - 重複した処理のため）
// このwatcherは最初のwatcherと競合するため削除

// 🆕 UTF-8対応のBase64エンコーディング
function safeBase64Encode(str: string): string {
  try {
    // UTF-8文字列をBase64に安全にエンコード
    return btoa(unescape(encodeURIComponent(str)))
  } catch (error) {
    console.warn('Base64 encoding failed, using URL encoding fallback')
    // フォールバック: URL encoding を使用
    return encodeURIComponent(str)
  }
}

// 🆕 SVGプレースホルダー画像を生成（画像のみ版）
function createPlaceholderImage(text: string): string {
  const svg = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <circle cx="300" cy="200" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="200" r="60" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="200" r="40" fill="rgba(255,255,255,0.1)"/>
      <path d="M 250 200 L 350 200 M 300 150 L 300 250" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `

  try {
    return `data:image/svg+xml;base64,${safeBase64Encode(svg)}`
  } catch (error) {
    console.warn('SVG encoding failed, using URL encoded SVG')
    // 最終フォールバック: URL encoded SVG
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }
}

// 🆕 画像取得関数（ローカル画像優先版）
function loadImageForQuestion(phrase: string, fallbackUrl: string) {
  console.log(`Loading image for phrase: "${phrase}"`)
  console.log(`Image URL:`, fallbackUrl)

  // まず確実に表示される画像URLを設定
  let imageUrlToUse = fallbackUrl

  // フォールバックURLが無効な場合は代替手段を使用
  if (!imageUrlToUse || imageUrlToUse.includes('undefined') || imageUrlToUse === '') {
    // SVGプレースホルダー画像を使用（ローカルで生成、確実に表示される）
    imageUrlToUse = createPlaceholderImage(phrase)
    console.log(`📸 No image URL provided, using SVG placeholder`)
  } else if (imageUrlToUse.startsWith('/images/phrase-galaxy/')) {
    // ローカル画像パスの場合はそのまま使用
    console.log(`📸 Using local image: ${imageUrlToUse}`)
  } else if (imageUrlToUse.includes('unsplash.com') || imageUrlToUse.includes('placeholder.com')) {
    // 外部URLの場合はSVGプレースホルダーを使用
    console.log(`📸 External URL detected, using SVG placeholder instead`)
    imageUrlToUse = createPlaceholderImage(phrase)
  } else {
    console.log(`📸 Using provided URL: ${imageUrlToUse}`)
  }

  // currentImageUrlを即座に設定して維持
  currentImageUrl.value = imageUrlToUse
  console.log(`✅ Image set to:`, imageUrlToUse.startsWith('/images/') ? 'local image' : 'placeholder')

  // ローカル画像の場合は、追加の処理は一切行わない（重要：画像を変更しない）
  // imageServiceの呼び出しも削除して、画像が変更されないようにする
}

// Methods
async function selectLevel(levelId: string) {
  if (!store.availableLevels.includes(levelId)) {
    return // レベルがロックされている
  }

  store.currentLevel = levelId
  showLevelSelection.value = false

  // レベルの画像を事前読み込み
  await store.preloadLevelImages(levelId)

  startGame()
}

function startGame() {
  console.log('Starting game with level:', store.currentLevel)
  showResults.value = false  // 結果画面を非表示にする
  store.startGame(store.currentLevel)
  updateChoiceContainerDimensions()
}

function handleChoiceClick(phrase: string) {
  // 既に選択済みの場合は無視
  if (store.selectedChoice !== null) {
    return
  }

  console.log('Choice clicked:', phrase)
  const result = store.checkAnswer(phrase)
  console.log('Answer result:', result)
  console.log(`Question ${store.currentQuestionIndex} of ${store.totalQuestions} completed`)

  // フィードバック表示後に次の質問に進む
  setTimeout(async () => {
    // フィードバックを非表示にしてリセット
    store.showFeedback = false
    store.selectedChoice = null
    store.feedbackType = null

    // ゲーム完了チェック（10問目が終わったら結果画面へ）
    if (store.currentQuestionIndex >= store.totalQuestions) {
      console.log('Game completed! Showing results...')
      store.endGame()  // ストアのゲーム終了処理を呼ぶ
      showResults.value = true
      return
    }

    // 次の質問を取得
    const nextQ = store.getNextQuestion()
    if (!nextQ) {
      console.log('No more questions. Ending game...')
      store.endGame()  // ストアのゲーム終了処理を呼ぶ
      showResults.value = true
      return
    }

    // 🆕 DOM更新を待つ
    await nextTick()

    // 🆕 FloatingChoiceコンポーネントのアニメーション再開を明示的に指示
    if (floatingChoices.value && floatingChoices.value.length > 0) {
      floatingChoices.value.forEach(choice => {
        if (choice.restartAnimation) {
          choice.restartAnimation()
        }
      })
    }

    // レイアウト更新
    updateChoiceContainerDimensions()
  }, 1500)
}

function updateChoicePosition(choiceId: string, position: FloatingChoicePosition) {
  const choice = store.choices.find(c => c.id === choiceId)
  if (choice) {
    choice.position = position
  }
}

function nextQuestion() {
  if (store.isGameComplete) {
    showResults.value = true
  } else {
    store.nextQuestion()
    updateChoiceContainerDimensions()
  }
}

function updateChoiceContainerDimensions() {
  nextTick(() => {
    if (choicesContainer.value && floatingChoices.value.length > 0) {
      const rect = choicesContainer.value.getBoundingClientRect()
      const choiceSize = window.innerWidth < 480 ? 140 : window.innerWidth < 768 ? 160 : 180

      floatingChoices.value.forEach(choice => {
        choice.setContainerDimensions(rect.width, rect.height)
        choice.setChoiceSize(choiceSize)
      })
    }
  })
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  console.log(`❌ Image load error for:`, img.src)
  console.log(`Retry count: ${imageRetryCount.value}`)

  // リトライ回数制限
  if (imageRetryCount.value >= 1) {
    // 即座にSVGプレースホルダーに切り替え（リトライは1回まで）
    const phrase = store.currentQuestion?.phrase || 'Image'
    const placeholderUrl = createPlaceholderImage(phrase)
    console.log(`🔴 Using SVG placeholder as fallback`)
    currentImageUrl.value = placeholderUrl
    return
  }

  imageRetryCount.value++

  // ローカル画像が失敗した場合、SVGプレースホルダーを使用
  if (store.currentQuestion) {
    const fallbackUrl = createPlaceholderImage(store.currentQuestion.phrase)
    console.log(`🔄 Local image failed, using SVG placeholder`)
    currentImageUrl.value = fallbackUrl
  }
}

function getStarStyle(index: number) {
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 3 + 's',
    animationDuration: (Math.random() * 2 + 2) + 's'
  }
}

function getNebulaStyle(index: number) {
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    width: Math.random() * 200 + 100 + 'px',
    height: Math.random() * 200 + 100 + 'px',
    animationDelay: Math.random() * 5 + 's'
  }
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function playAgain() {
  console.log('Playing again...')
  showResults.value = false
  store.resetGame()
  store.totalQuestions = 10  // 問題数をリセット
  startGame()
}

function chooseDifferentLevel() {
  console.log('Choosing different level...')
  showResults.value = false
  showLevelSelection.value = true
  store.resetGame()
  store.totalQuestions = 10  // 問題数をリセット
}

function goBack() {
  router.push({ name: 'multi-layer-hub' })
}

// ウィンドウリサイズハンドラー
function handleWindowResize() {
  // リサイズ後に境界を再計算
  setTimeout(() => {
    updateChoiceContainerDimensions()
    // 石の位置を安全な範囲内に修正
    adjustStonesPositions()
  }, 100)
}

// 石の位置を画面内に調整
function adjustStonesPositions() {
  if (!choicesContainer.value) return

  const rect = choicesContainer.value.getBoundingClientRect()
  const choiceSize = window.innerWidth < 480 ? 140 : window.innerWidth < 768 ? 160 : 180
  const margin = 20
  const maxX = rect.width - choiceSize - margin
  const maxY = rect.height - choiceSize - margin
  const minX = margin
  const minY = margin

  store.choices.forEach(choice => {
    if (choice.position.x > maxX) {
      choice.position.x = maxX
      choice.position.vx = -Math.abs(choice.position.vx)
    } else if (choice.position.x < minX) {
      choice.position.x = minX
      choice.position.vx = Math.abs(choice.position.vx)
    }

    if (choice.position.y > maxY) {
      choice.position.y = maxY
      choice.position.vy = -Math.abs(choice.position.vy)
    } else if (choice.position.y < minY) {
      choice.position.y = minY
      choice.position.vy = Math.abs(choice.position.vy)
    }
  })
}

// Lifecycle
onMounted(() => {
  // ウィンドウリサイズ時の対応（改良版）
  window.addEventListener('resize', handleWindowResize)

  // 初期状態の設定
  if (store.isGameActive) {
    showLevelSelection.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

// Watch for game state changes
watch(() => store.isGameActive, (isActive) => {
  if (!isActive && store.score > 0) {
    showResults.value = true
  }
})
</script>

<style scoped>
.phrase-galaxy-game {
  min-height: 100vh;
  background: linear-gradient(to bottom, #0f0f23, #1a1a3e, #2d1b69);
  color: white;
  position: relative;
  overflow: hidden;
}

/* 宇宙背景 */
.space-background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.space-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite;
}

.space-nebula {
  position: absolute;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.1), transparent);
  border-radius: 50%;
  animation: nebula-drift 10s infinite ease-in-out;
}

/* ゲームヘッダー */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.back-button {
  background: rgba(79, 70, 229, 0.8);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background: rgba(79, 70, 229, 1);
  transform: translateY(-2px);
}

.game-info {
  text-align: center;
}

.game-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-info {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.game-stats {
  text-align: right;
  font-size: 0.9rem;
}

.game-stats > div {
  margin-bottom: 0.25rem;
}

/* レベル選択 */
.level-selection {
  position: relative;
  z-index: 10;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.selection-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.level-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.level-card:hover:not(.locked) {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.level-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-card.current {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.level-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.level-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.level-description {
  opacity: 0.8;
  margin-bottom: 1rem;
}

.level-stats {
  font-size: 0.9rem;
  opacity: 0.7;
}

.unlock-requirement {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #fbbf24;
}

/* ゲーム画面 */
.game-screen {
  position: relative;
  z-index: 10;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 問題エリア */
.question-area {
  height: 40%;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.question-image-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 100%;
  max-height: 400px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.question-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* オーバーレイは削除（使用しない） */
.image-overlay {
  display: none;
}

.question-prompt {
  display: none;
}

.debug-info {
  position: absolute;
  top: 5px;
  left: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  max-width: 200px;
  word-break: break-all;
  z-index: 10;
}

.loading-question {
  text-align: center;
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(5px);
}

/* 選択肢エリア */
.choices-area {
  height: 40%;
  position: relative;
  margin: 1rem;
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

/* フィードバック */
.feedback-area {
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  animation: feedback-appear 0.3s ease-out;
}

.feedback-message.correct {
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.feedback-message.incorrect {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-title {
  font-weight: bold;
  font-size: 1.25rem;
}

.feedback-description {
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* 次のボタン */
.next-button-area {
  text-align: center;
  padding: 1rem;
}

.next-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

/* 結果画面 */
.results-screen {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 2rem;
}

.results-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-button:hover {
  transform: translateY(-2px);
}

/* エラー・ローディング */
.error-message,
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.error-content,
.loading-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-dismiss {
  margin-top: 1rem;
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

/* ローディングスピナー */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* アニメーション */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes nebula-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes feedback-appear {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .game-title {
    font-size: 1.5rem;
  }

  .level-grid {
    grid-template-columns: 1fr;
  }

  .results-stats {
    grid-template-columns: 1fr;
  }

  .question-area {
    height: 35%;
    padding: 1rem;
  }

  .question-image-container {
    max-width: 100%;
    max-height: 300px;
  }

  .choices-area {
    height: 45%;
  }
}

@media (max-width: 480px) {
  .selection-title {
    font-size: 2rem;
  }

  .level-card {
    padding: 1rem;
  }

  .results-container {
    padding: 2rem;
  }
}
</style>