<template>
  <div class="word-card" :class="[cardStyle, { 'flipped': isFlipped, 'animated': showAnimation }]">
    <!-- カード前面（問題表示） -->
    <div class="card-face card-front">
      <div class="card-header">
        <div class="difficulty-badge" :style="{ backgroundColor: difficultyColor }">
          {{ difficultyLabel }}
        </div>
        <div class="srs-level" v-if="progress">
          <span class="level-icon">⭐</span>
          <span>Lv.{{ progress.srsLevel }}</span>
        </div>
      </div>

      <div class="word-content">
        <h2 class="word-text" @click="toggleFlip">{{ word.word }}</h2>

        <div class="pronunciation" v-if="word.pronunciation && showPronunciation">
          <span class="pronunciation-text">{{ word.pronunciation }}</span>
          <button @click="playAudio" class="audio-btn" v-if="word.audioUrl">
            <span class="audio-icon">🔊</span>
          </button>
        </div>

        <div class="word-info">
          <div class="part-of-speech">
            <span
              v-for="pos in word.partOfSpeech"
              :key="pos"
              class="pos-tag"
            >
              {{ pos }}
            </span>
          </div>

          <div class="categories" v-if="word.categories.length > 0">
            <span
              v-for="category in word.categories.slice(0, 2)"
              :key="category"
              class="category-tag"
            >
              {{ category }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-footer" v-if="progress">
        <div class="mastery-progress">
          <div class="progress-label">習得度</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${progress.masteryLevel}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ progress.masteryLevel }}%</div>
        </div>
      </div>
    </div>

    <!-- カード背面（回答表示） -->
    <div class="card-face card-back">
      <div class="meanings-section">
        <h3 class="meanings-title">意味</h3>
        <ul class="meanings-list">
          <li
            v-for="(meaning, index) in word.meanings"
            :key="index"
            class="meaning-item"
          >
            {{ meaning }}
          </li>
        </ul>
      </div>

      <div class="examples-section" v-if="word.examples.length > 0">
        <h4 class="examples-title">例文</h4>
        <div
          v-for="(example, index) in word.examples.slice(0, 2)"
          :key="index"
          class="example-item"
        >
          <p class="example-sentence">{{ example.sentence }}</p>
          <p class="example-translation">{{ example.translation }}</p>
        </div>
      </div>

      <div class="related-words" v-if="word.synonyms.length > 0 || word.antonyms.length > 0">
        <div v-if="word.synonyms.length > 0" class="related-group">
          <span class="related-label">類義語:</span>
          <span class="related-items">{{ word.synonyms.slice(0, 3).join(', ') }}</span>
        </div>
        <div v-if="word.antonyms.length > 0" class="related-group">
          <span class="related-label">対義語:</span>
          <span class="related-items">{{ word.antonyms.slice(0, 3).join(', ') }}</span>
        </div>
      </div>

      <button @click="toggleFlip" class="flip-back-btn">
        <span>🔄</span>
        戻る
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Word, UserWordProgress } from '@/types/word-galaxy/word.types';
import { getDifficultyColor, getDifficultyDisplayName } from '@/utils/word-galaxy/difficultyMapper';

interface Props {
  word: Word;
  progress?: UserWordProgress;
  cardStyle?: 'default' | 'battle' | 'review' | 'compact';
  showPronunciation?: boolean;
  showAnimation?: boolean;
  interactive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  cardStyle: 'default',
  showPronunciation: true,
  showAnimation: false,
  interactive: true
});

const emit = defineEmits<{
  flip: [word: Word];
  audioPlay: [word: Word];
}>();

// State
const isFlipped = ref(false);

// Computed
const difficultyColor = computed(() => getDifficultyColor(props.word.eikenLevel));
const difficultyLabel = computed(() => getDifficultyDisplayName(props.word.eikenLevel));

// Methods
function toggleFlip() {
  if (!props.interactive) return;

  isFlipped.value = !isFlipped.value;
  emit('flip', props.word);
}

function playAudio() {
  if (props.word.audioUrl) {
    const audio = new Audio(props.word.audioUrl);
    audio.volume = 0.7;
    audio.play().catch(console.error);
  }
  emit('audioPlay', props.word);
}
</script>

<style scoped>
.word-card {
  @apply relative w-full h-80 cursor-pointer;
  perspective: 1000px;
  transition: transform 0.3s ease;
}

.word-card:hover {
  @apply transform scale-105;
}

.word-card.animated {
  animation: cardAppear 0.5s ease-out;
}

.card-face {
  @apply absolute inset-0 w-full h-full rounded-2xl shadow-lg;
  @apply bg-gradient-to-br from-gray-800 to-gray-900;
  @apply border border-cyan-500/30 p-6 flex flex-col;
  backface-visibility: hidden;
  transition: transform 0.6s ease;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
}

.word-card.flipped .card-front {
  transform: rotateY(-180deg);
}

.word-card.flipped .card-back {
  transform: rotateY(0deg);
}

.card-header {
  @apply flex justify-between items-start mb-4;
}

.difficulty-badge {
  @apply px-3 py-1 rounded-full text-white text-sm font-bold;
  @apply shadow-lg;
}

.srs-level {
  @apply flex items-center gap-1 text-yellow-400 text-sm font-semibold;
}

.level-icon {
  @apply animate-pulse;
}

.word-content {
  @apply flex-1 flex flex-col justify-center items-center text-center;
}

.word-text {
  @apply text-4xl font-bold text-white mb-4;
  @apply hover:text-cyan-400 transition-colors duration-300;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.pronunciation {
  @apply flex items-center gap-2 mb-4;
}

.pronunciation-text {
  @apply text-cyan-300 text-lg font-mono;
}

.audio-btn {
  @apply p-2 rounded-full bg-cyan-600 hover:bg-cyan-500;
  @apply transition-colors duration-200;
}

.audio-icon {
  @apply text-white;
}

.word-info {
  @apply flex flex-col gap-2;
}

.pos-tag {
  @apply inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-md mr-1;
}

.category-tag {
  @apply inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded-md mr-1;
}

.card-footer {
  @apply mt-auto;
}

.mastery-progress {
  @apply flex items-center gap-2;
}

.progress-label {
  @apply text-gray-400 text-sm;
}

.progress-bar {
  @apply flex-1 h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-500;
}

.progress-text {
  @apply text-cyan-400 text-sm font-semibold;
}

/* Card Back Styles */
.card-back {
  @apply bg-gradient-to-br from-indigo-800 to-purple-900;
}

.meanings-section {
  @apply mb-4;
}

.meanings-title {
  @apply text-xl font-bold text-white mb-2;
}

.meanings-list {
  @apply space-y-1;
}

.meaning-item {
  @apply text-gray-200 text-lg;
}

.examples-section {
  @apply mb-4;
}

.examples-title {
  @apply text-lg font-semibold text-white mb-2;
}

.example-item {
  @apply mb-3 p-3 bg-black/20 rounded-lg;
}

.example-sentence {
  @apply text-gray-200 italic mb-1;
}

.example-translation {
  @apply text-gray-400 text-sm;
}

.related-words {
  @apply space-y-2 mb-4;
}

.related-group {
  @apply flex gap-2;
}

.related-label {
  @apply text-gray-400 text-sm font-semibold;
}

.related-items {
  @apply text-gray-200 text-sm;
}

.flip-back-btn {
  @apply mt-auto flex items-center justify-center gap-2;
  @apply px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg;
  @apply transition-colors duration-200;
}

/* Card Style Variants */
.word-card.battle .card-face {
  @apply border-red-500/50 bg-gradient-to-br from-red-800 to-red-900;
}

.word-card.review .card-face {
  @apply border-green-500/50 bg-gradient-to-br from-green-800 to-green-900;
}

.word-card.compact {
  @apply h-60;
}

.word-card.compact .word-text {
  @apply text-3xl;
}

/* Animations */
@keyframes cardAppear {
  from {
    transform: translateY(20px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .word-card {
    @apply h-72;
  }

  .word-text {
    @apply text-3xl;
  }

  .card-face {
    @apply p-4;
  }
}
</style>