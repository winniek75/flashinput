<template>
  <div class="reading-panel">
    <!-- Reading Header -->
    <div class="reading-header">
      <button class="exit-button" @click="$emit('exit-reading')">
        <span class="exit-icon">×</span>
        <span>読解を終了</span>
      </button>

      <div class="reading-info">
        <h2 class="reading-title">{{ currentSection?.title }}</h2>
        <div class="reading-meta">
          <span class="section-indicator">
            セクション {{ currentSectionIndex + 1 }}/{{ totalSections }}
          </span>
          <span class="estimated-time">
            推定時間: {{ currentSection?.estimatedTime || 5 }}分
          </span>
        </div>
      </div>

      <div class="reading-controls">
        <button
          class="control-button"
          @click="toggleAutoScroll"
          :class="{ active: autoScroll }"
        >
          {{ autoScroll ? '⏸️' : '▶️' }} 自動スクロール
        </button>
        <button
          class="control-button"
          @click="adjustFontSize(1)"
        >
          🔍 拡大
        </button>
        <button
          class="control-button"
          @click="adjustFontSize(-1)"
        >
          🔍 縮小
        </button>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-track">
        <div
          class="progress-active"
          :style="{ width: `${readingProgress}%` }"
        ></div>
      </div>
      <span class="progress-text">{{ Math.round(readingProgress) }}%</span>
    </div>

    <!-- Reading Content -->
    <div
      ref="contentContainer"
      class="reading-content"
      :style="{ fontSize: `${fontSize}px` }"
      @scroll="handleScroll"
    >
      <div class="content-wrapper">
        <!-- Section Content -->
        <div class="section-content">
          <h3 class="content-title">{{ currentSection?.title }}</h3>
          <div class="content-text" v-html="formattedContent"></div>
        </div>

        <!-- Interactive Elements -->
        <div v-if="hasQuestions" class="questions-section">
          <h4 class="questions-title">理解度チェック</h4>
          <div
            v-for="(question, index) in currentQuestions"
            :key="question.id"
            class="question-card"
            :class="{ answered: question.answered }"
          >
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <span class="question-type">{{ getQuestionTypeText(question.type) }}</span>
            </div>

            <p class="question-text">{{ question.question }}</p>

            <!-- Multiple Choice -->
            <div v-if="question.type === 'multiple_choice'" class="choices">
              <div
                v-for="choice in question.choices"
                :key="choice.id"
                class="choice-option"
                :class="{
                  selected: question.selectedAnswer === choice.id,
                  correct: question.answered && choice.correct,
                  incorrect: question.answered && question.selectedAnswer === choice.id && !choice.correct
                }"
                @click="selectChoice(question, choice.id)"
              >
                <span class="choice-label">{{ choice.label }}</span>
                <span class="choice-text">{{ choice.text }}</span>
              </div>
            </div>

            <!-- Text Input -->
            <div v-else-if="question.type === 'text_input'" class="text-input-section">
              <textarea
                v-model="question.userAnswer"
                class="text-input"
                :placeholder="question.placeholder || '回答を入力してください...'"
                @input="updateAnswer(question)"
              ></textarea>
            </div>

            <!-- Drag and Drop -->
            <div v-else-if="question.type === 'drag_drop'" class="drag-drop-section">
              <div class="drop-zones">
                <div
                  v-for="zone in question.dropZones"
                  :key="zone.id"
                  class="drop-zone"
                  :class="{ filled: zone.item }"
                  @drop="handleDrop($event, zone)"
                  @dragover.prevent
                >
                  <span v-if="zone.item" class="dropped-item">{{ zone.item.text }}</span>
                  <span v-else class="zone-placeholder">{{ zone.placeholder }}</span>
                </div>
              </div>
              <div class="draggable-items">
                <div
                  v-for="item in question.draggableItems"
                  :key="item.id"
                  class="draggable-item"
                  :class="{ used: item.used }"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  {{ item.text }}
                </div>
              </div>
            </div>

            <!-- Answer Feedback -->
            <div v-if="question.answered" class="answer-feedback">
              <div
                class="feedback-message"
                :class="{ correct: question.correct, incorrect: !question.correct }"
              >
                <span class="feedback-icon">
                  {{ question.correct ? '✅' : '❌' }}
                </span>
                <span class="feedback-text">{{ question.feedback }}</span>
              </div>
              <div v-if="question.explanation" class="explanation">
                <h5 class="explanation-title">解説</h5>
                <p class="explanation-text">{{ question.explanation }}</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              v-if="!question.answered"
              class="submit-answer"
              :disabled="!canSubmitAnswer(question)"
              @click="submitAnswer(question)"
            >
              回答を提出
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="section-navigation">
          <button
            class="nav-button prev"
            :disabled="currentSectionIndex === 0"
            @click="navigateSection(-1)"
          >
            ← 前のセクション
          </button>

          <div class="section-dots">
            <div
              v-for="(section, index) in sections"
              :key="section.id"
              class="section-dot"
              :class="{
                current: index === currentSectionIndex,
                completed: section.completed,
                available: section.unlocked
              }"
              @click="jumpToSection(index)"
            ></div>
          </div>

          <button
            v-if="currentSectionIndex === totalSections - 1"
            class="nav-button complete"
            @click="completeSection"
          >
            ✅ 読解を完了
          </button>
          <button
            v-else
            class="nav-button next"
            @click="navigateSection(1)"
          >
            次のセクション →
          </button>
        </div>
      </div>
    </div>

    <!-- Reading Stats Overlay -->
    <div class="stats-overlay">
      <div class="stat-item">
        <span class="stat-icon">⏱️</span>
        <span class="stat-value">{{ formatTime(readingTime) }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-icon">📖</span>
        <span class="stat-value">{{ wordsRead }}/{{ totalWords }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-icon">🎯</span>
        <span class="stat-value">{{ currentScore }}</span>
      </div>
    </div>

    <!-- Effects -->
    <StarBurst
      v-if="showSuccessEffect"
      :trigger="showSuccessEffect"
      type="success"
      :position="effectPosition"
      @complete="showSuccessEffect = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useGrammarArtGalleryStore } from '@/stores/grammarArtGalleryStore'
import StarBurst from '../effects/StarBurst.vue'

const store = useGrammarArtGalleryStore()

const props = defineProps({
  artifactId: {
    type: String,
    required: true
  },
  sectionIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'exit-reading',
  'section-completed',
  'artifact-completed'
])

// Reactive state
const contentContainer = ref(null)
const currentSectionIndex = ref(props.sectionIndex)
const readingProgress = ref(0)
const readingTime = ref(0)
const fontSize = ref(16)
const autoScroll = ref(false)
const showSuccessEffect = ref(false)
const effectPosition = ref({ x: 50, y: 50 })

// Timers
let readingTimer = null
let autoScrollTimer = null

// Computed properties
const artifact = computed(() =>
  store.getArtifactById(props.artifactId)
)

const sections = computed(() =>
  artifact.value?.readingSections || []
)

const currentSection = computed(() =>
  sections.value[currentSectionIndex.value]
)

const totalSections = computed(() =>
  sections.value.length
)

const formattedContent = computed(() => {
  if (!currentSection.value?.content) return ''

  // Format content with highlighting and interactive elements
  let content = currentSection.value.content

  // Highlight grammar points
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="grammar-highlight">$1</strong>')

  // Add pronunciation guides
  content = content.replace(/\[(.*?)\]/g, '<span class="pronunciation">[$1]</span>')

  // Format paragraphs
  content = content.replace(/\n\n/g, '</p><p>')
  content = `<p>${content}</p>`

  return content
})

const hasQuestions = computed(() =>
  currentSection.value?.questions && currentSection.value.questions.length > 0
)

const currentQuestions = computed(() =>
  currentSection.value?.questions || []
)

const wordsRead = computed(() => {
  const progress = readingProgress.value / 100
  return Math.floor(totalWords.value * progress)
})

const totalWords = computed(() => {
  if (!currentSection.value?.content) return 0
  return currentSection.value.content.split(/\s+/).length
})

const currentScore = computed(() =>
  store.playerStats.currentScore || 0
)

// Methods
function handleScroll() {
  if (!contentContainer.value) return

  const container = contentContainer.value
  const scrollPercent = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100
  readingProgress.value = Math.min(100, Math.max(0, scrollPercent))

  // Update reading progress in store
  store.updateReadingProgress(props.artifactId, currentSectionIndex.value, readingProgress.value)
}

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value

  if (autoScroll.value) {
    startAutoScroll()
  } else {
    stopAutoScroll()
  }
}

function startAutoScroll() {
  if (!contentContainer.value) return

  const scrollSpeed = 1 // pixels per interval
  const interval = 50 // milliseconds

  autoScrollTimer = setInterval(() => {
    if (contentContainer.value) {
      contentContainer.value.scrollTop += scrollSpeed

      // Stop if reached bottom
      if (contentContainer.value.scrollTop >=
          contentContainer.value.scrollHeight - contentContainer.value.clientHeight) {
        stopAutoScroll()
      }
    }
  }, interval)
}

function stopAutoScroll() {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer)
    autoScrollTimer = null
  }
  autoScroll.value = false
}

function adjustFontSize(delta) {
  fontSize.value = Math.max(12, Math.min(24, fontSize.value + delta))
}

function navigateSection(direction) {
  const newIndex = currentSectionIndex.value + direction
  if (newIndex >= 0 && newIndex < totalSections.value) {
    jumpToSection(newIndex)
  }
}

function jumpToSection(index) {
  if (index >= 0 && index < totalSections.value && sections.value[index].unlocked) {
    currentSectionIndex.value = index
    readingProgress.value = 0

    nextTick(() => {
      if (contentContainer.value) {
        contentContainer.value.scrollTop = 0
      }
    })
  }
}

function getQuestionTypeText(type) {
  const typeMap = {
    multiple_choice: '選択問題',
    text_input: '記述問題',
    drag_drop: '並び替え問題'
  }
  return typeMap[type] || '問題'
}

function selectChoice(question, choiceId) {
  if (question.answered) return
  question.selectedAnswer = choiceId
}

function updateAnswer(question) {
  // Auto-save as user types
  question.hasAnswer = question.userAnswer?.trim().length > 0
}

function handleDragStart(event, item) {
  event.dataTransfer.setData('text/plain', JSON.stringify(item))
}

function handleDrop(event, zone) {
  event.preventDefault()
  const itemData = JSON.parse(event.dataTransfer.getData('text/plain'))

  // Clear previous item in zone
  if (zone.item) {
    zone.item.used = false
  }

  zone.item = itemData
  itemData.used = true
}

function canSubmitAnswer(question) {
  switch (question.type) {
    case 'multiple_choice':
      return question.selectedAnswer !== undefined
    case 'text_input':
      return question.userAnswer?.trim().length > 0
    case 'drag_drop':
      return question.dropZones.every(zone => zone.item)
    default:
      return false
  }
}

function submitAnswer(question) {
  if (!canSubmitAnswer(question)) return

  let correct = false

  switch (question.type) {
    case 'multiple_choice':
      const selectedChoice = question.choices.find(c => c.id === question.selectedAnswer)
      correct = selectedChoice?.correct === true
      break

    case 'text_input':
      correct = question.correctAnswers.some(answer =>
        question.userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
      )
      break

    case 'drag_drop':
      correct = question.dropZones.every(zone =>
        zone.item && zone.correctItemId === zone.item.id
      )
      break
  }

  question.answered = true
  question.correct = correct

  // Award points
  if (correct) {
    const points = question.points || 10
    store.addScore(points)
    triggerSuccessEffect()
  }

  // Check if section is completed
  checkSectionCompletion()
}

function checkSectionCompletion() {
  if (!hasQuestions.value) {
    // No questions, complete by reading progress
    if (readingProgress.value >= 90) {
      completeSection()
    }
  } else {
    // Complete if all questions answered correctly
    const allAnswered = currentQuestions.value.every(q => q.answered)
    const allCorrect = currentQuestions.value.every(q => q.correct)

    if (allAnswered && allCorrect && readingProgress.value >= 80) {
      completeSection()
    }
  }
}

function completeSection() {
  store.completeSection(props.artifactId, currentSectionIndex.value)
  emit('section-completed', currentSectionIndex.value)

  // Check if artifact is completed
  const completedSections = sections.value.filter(s => s.completed).length
  console.log('Section completion check:', {
    completedSections,
    totalSections: totalSections.value,
    sections: sections.value,
    currentSectionIndex: currentSectionIndex.value
  })

  // セクションが1つしかない場合は、即座にアーティファクト完了
  if (totalSections.value === 1 || completedSections === totalSections.value) {
    console.log('🏆 Completing artifact:', props.artifactId)
    store.completeArtifact(props.artifactId)
    emit('artifact-completed')
  }

  triggerSuccessEffect()
}

function triggerSuccessEffect() {
  effectPosition.value = { x: Math.random() * 100, y: Math.random() * 100 }
  showSuccessEffect.value = true
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  // Start reading timer
  readingTimer = setInterval(() => {
    readingTime.value++
  }, 1000)

  // Mark section as started
  store.startSection(props.artifactId, currentSectionIndex.value)
})

onUnmounted(() => {
  if (readingTimer) {
    clearInterval(readingTimer)
  }
  stopAutoScroll()
})

// Watch for section changes
watch(currentSectionIndex, (newIndex) => {
  readingProgress.value = 0
  if (contentContainer.value) {
    contentContainer.value.scrollTop = 0
  }
})

// Watch reading progress for auto-completion
watch(readingProgress, (progress) => {
  if (progress >= 95 && !hasQuestions.value) {
    completeSection()
  }
})
</script>

<style scoped>
.reading-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 100%);
  color: #ffffff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.reading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.exit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.8);
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exit-button:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.05);
}

.exit-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.reading-info {
  flex: 1;
  text-align: center;
}

.reading-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
}

.reading-meta {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.reading-controls {
  display: flex;
  gap: 0.5rem;
}

.control-button {
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.control-button:hover,
.control-button.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 2rem;
  background: rgba(0, 0, 0, 0.2);
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-active {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4ade80;
  min-width: 50px;
}

.reading-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  line-height: 1.8;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.section-content {
  margin-bottom: 3rem;
}

.content-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  text-align: center;
  color: #a855f7;
}

.content-text {
  font-size: inherit;
  line-height: inherit;
}

.content-text :deep(.grammar-highlight) {
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #000000;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-weight: 600;
}

.content-text :deep(.pronunciation) {
  color: #fbbf24;
  font-style: italic;
  font-size: 0.9em;
}

.questions-section {
  margin: 3rem 0;
}

.questions-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 2rem 0;
  text-align: center;
  color: #f59e0b;
}

.question-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.question-card.answered {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-number {
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #000000;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-weight: bold;
}

.question-type {
  background: rgba(168, 85, 247, 0.3);
  color: #a78bfa;
  padding: 0.25rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

.question-text {
  font-size: 1.1rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.choice-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.choice-option.selected {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.choice-option.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
}

.choice-option.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.choice-label {
  width: 30px;
  height: 30px;
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  color: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.choice-text {
  flex: 1;
}

.text-input-section {
  margin: 1rem 0;
}

.text-input {
  width: 100%;
  min-height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
}

.text-input:focus {
  outline: none;
  border-color: #4ade80;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}

.drag-drop-section {
  margin: 1rem 0;
}

.drop-zones {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.drop-zone {
  min-width: 120px;
  min-height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.drop-zone.filled {
  border-style: solid;
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.dropped-item {
  font-weight: 600;
  color: #4ade80;
}

.zone-placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.draggable-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.draggable-item {
  background: rgba(59, 130, 246, 0.8);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: grab;
  user-select: none;
  transition: all 0.3s ease;
}

.draggable-item:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.05);
}

.draggable-item.used {
  opacity: 0.3;
  cursor: not-allowed;
}

.answer-feedback {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 10px;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feedback-message.correct {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid rgba(74, 222, 128, 0.4);
}

.feedback-message.incorrect {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.feedback-icon {
  font-size: 1.2rem;
}

.explanation {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.explanation-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #fbbf24;
}

.explanation-text {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

.submit-answer {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(45deg, #4ade80, #22d3ee);
  border: none;
  border-radius: 10px;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-answer:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.submit-answer:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(74, 222, 128, 0.3);
}

.section-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.section-dots {
  display: flex;
  gap: 0.5rem;
}

.section-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-dot.current {
  background: #4ade80;
  transform: scale(1.2);
}

.section-dot.completed {
  background: #22d3ee;
}

.section-dot:not(.available) {
  opacity: 0.3;
  cursor: not-allowed;
}

.stats-overlay {
  position: fixed;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1rem;
  z-index: 10;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-weight: 600;
  color: #4ade80;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reading-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .reading-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .reading-content {
    padding: 1rem;
  }

  .section-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-overlay {
    position: static;
    transform: none;
    flex-direction: row;
    margin-top: 1rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .choice-option,
  .nav-button,
  .submit-answer {
    transition: none;
  }

  .progress-active {
    transition: none;
  }
}
</style>