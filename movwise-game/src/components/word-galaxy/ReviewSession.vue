<template>
  <div class="review-session">
    <!-- セッションヘッダー -->
    <div class="session-header">
      <div class="progress-section">
        <div class="question-counter">
          <span class="current">{{ currentQuestionIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ totalQuestions }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <div class="timer-section">
        <div class="timer-circle" :class="{ 'warning': timeLeft <= 2, 'danger': timeLeft <= 1 }">
          <span class="timer-text">{{ timeLeft }}</span>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-icon">✅</span>
          <span class="stat-value">{{ sessionStats.correct }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❌</span>
          <span class="stat-value">{{ sessionStats.wrong }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⚡</span>
          <span class="stat-value">{{ Math.round(accuracy) }}%</span>
        </div>
      </div>
    </div>

    <!-- 問題表示エリア -->
    <div class="question-area" v-if="currentWord">
      <div class="word-display">
        <h1 class="word-text">{{ currentWord.word }}</h1>
        <div class="word-info">
          <span class="pronunciation" v-if="currentWord.pronunciation">
            {{ currentWord.pronunciation }}
          </span>
          <button @click="playWordAudio" class="audio-btn" v-if="currentWord.audioUrl">
            <span class="audio-icon">🔊</span>
          </button>
        </div>
        <div class="difficulty-badge" :style="{ backgroundColor: wordDifficultyColor }">
          {{ wordDifficultyLabel }}
        </div>
      </div>

      <div class="question-text">
        <p>この単語の意味を選んでください</p>
      </div>
    </div>

    <!-- 選択肢エリア -->
    <div class="choices-area" v-if="currentChoices.length > 0">
      <button
        v-for="(choice, index) in currentChoices"
        :key="index"
        @click="selectChoice(index)"
        :disabled="answered || timeLeft <= 0"
        class="choice-btn"
        :class="{
          'selected': selectedIndex === index,
          'correct': answered && index === correctIndex,
          'wrong': answered && selectedIndex === index && index !== correctIndex,
          'disabled': answered || timeLeft <= 0
        }"
      >
        <span class="choice-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span class="choice-text">{{ choice }}</span>
        <div class="choice-glow"></div>
      </button>
    </div>

    <!-- 結果表示 -->
    <div class="result-area" v-if="answered && currentWord">
      <div class="result-feedback" :class="{ 'correct': isLastAnswerCorrect, 'wrong': !isLastAnswerCorrect }">
        <div class="result-icon">
          {{ isLastAnswerCorrect ? '🎉' : '😅' }}
        </div>
        <div class="result-text">
          {{ isLastAnswerCorrect ? '正解！' : '不正解' }}
        </div>
        <div class="result-details" v-if="!isLastAnswerCorrect">
          <p>正解: {{ currentWord.meanings[0] }}</p>
        </div>
      </div>

      <!-- 次へボタン -->
      <button @click="nextQuestion" class="next-btn">
        <span v-if="hasMoreQuestions">次の問題</span>
        <span v-else>結果を見る</span>
        <span class="next-icon">→</span>
      </button>
    </div>

    <!-- ローディング -->
    <div class="loading-area" v-if="loading">
      <div class="loading-spinner"></div>
      <p>問題を準備中...</p>
    </div>

    <!-- エラー表示 -->
    <div class="error-area" v-if="error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="retrySession" class="retry-btn">再試行</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useMemoryStationStore } from '@/stores/word-galaxy/memoryStation';
import { getDifficultyColor, getDifficultyDisplayName } from '@/utils/word-galaxy/difficultyMapper';
import type { Word } from '@/types/word-galaxy/word.types';

interface Props {
  userId: string;
  sessionLength?: number;
  timeLimit?: number; // 秒
}

const props = withDefaults(defineProps<Props>(), {
  sessionLength: 20,
  timeLimit: 7
});

const emit = defineEmits<{
  sessionComplete: [stats: {
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    averageTime: number;
  }];
  sessionExit: [];
}>();

// Stores
const memoryStore = useMemoryStationStore();

// State
const currentQuestionIndex = ref(0);
const currentChoices = ref<string[]>([]);
const correctIndex = ref(0);
const selectedIndex = ref(-1);
const answered = ref(false);
const isLastAnswerCorrect = ref(false);
const timeLeft = ref(props.timeLimit);
const questionStartTime = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);

// Timer
let timer: number | null = null;

// Computed
const currentWord = computed(() => memoryStore.currentWord);
const sessionStats = computed(() => memoryStore.sessionStats);
const totalQuestions = computed(() => Math.min(memoryStore.reviewWords.length, props.sessionLength));
const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((currentQuestionIndex.value / totalQuestions.value) * 100);
});
const hasMoreQuestions = computed(() => currentQuestionIndex.value < totalQuestions.value - 1);
const accuracy = computed(() => {
  if (sessionStats.value.total === 0) return 0;
  return (sessionStats.value.correct / sessionStats.value.total) * 100;
});

const wordDifficultyColor = computed(() => {
  return currentWord.value ? getDifficultyColor(currentWord.value.eikenLevel) : '#6B7280';
});

const wordDifficultyLabel = computed(() => {
  return currentWord.value ? getDifficultyDisplayName(currentWord.value.eikenLevel) : '';
});

// Methods
function generateChoices() {
  if (!currentWord.value) return;

  const correctAnswer = currentWord.value.meanings[0];
  const wrongAnswers: string[] = [];

  // 他の単語からランダムに不正解選択肢を生成
  const otherWords = memoryStore.reviewWords.filter(w => w.id !== currentWord.value!.id);
  const shuffledWords = [...otherWords].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 3 && i < shuffledWords.length; i++) {
    const wrongAnswer = shuffledWords[i].meanings[0];
    if (!wrongAnswers.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // 不足分を補完（フォールバック選択肢）
  const fallbackChoices = [
    '動く', '食べる', '見る', '聞く', '話す', '読む', '書く', '歩く', '走る', '飛ぶ',
    '大きい', '小さい', '美しい', '速い', '遅い', '新しい', '古い', '良い', '悪い', '高い'
  ];

  while (wrongAnswers.length < 3) {
    const fallback = fallbackChoices[Math.floor(Math.random() * fallbackChoices.length)];
    if (!wrongAnswers.includes(fallback) && fallback !== correctAnswer) {
      wrongAnswers.push(fallback);
    }
  }

  // 選択肢をシャッフル
  const allChoices = [correctAnswer, ...wrongAnswers.slice(0, 3)];
  const shuffledChoices = [...allChoices].sort(() => Math.random() - 0.5);

  currentChoices.value = shuffledChoices;
  correctIndex.value = shuffledChoices.indexOf(correctAnswer);
}

function startTimer() {
  timeLeft.value = props.timeLimit;
  questionStartTime.value = Date.now();

  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function selectChoice(index: number) {
  if (answered.value || timeLeft.value <= 0) return;

  selectedIndex.value = index;
  answered.value = true;
  isLastAnswerCorrect.value = index === correctIndex.value;

  stopTimer();

  const responseTime = Date.now() - questionStartTime.value;

  // セッション統計とSRSに記録
  recordAnswer(isLastAnswerCorrect.value, responseTime);

  // 音響フィードバック
  playFeedbackSound(isLastAnswerCorrect.value);
}

function handleTimeout() {
  if (answered.value) return;

  selectedIndex.value = -1;
  answered.value = true;
  isLastAnswerCorrect.value = false;

  const responseTime = props.timeLimit * 1000;
  recordAnswer(false, responseTime);

  playFeedbackSound(false);
}

async function recordAnswer(isCorrect: boolean, responseTime: number) {
  if (!currentWord.value) return;

  try {
    await memoryStore.submitAnswer(props.userId, isCorrect, responseTime);
  } catch (err) {
    console.error('Failed to record answer:', err);
  }
}

function nextQuestion() {
  if (hasMoreQuestions.value) {
    currentQuestionIndex.value++;
    memoryStore.nextWord();
    resetQuestion();
    generateChoices();
    startTimer();
  } else {
    completeSession();
  }
}

function resetQuestion() {
  selectedIndex.value = -1;
  answered.value = false;
  isLastAnswerCorrect.value = false;
  currentChoices.value = [];
  correctIndex.value = 0;
}

function completeSession() {
  stopTimer();
  memoryStore.endReviewSession();

  emit('sessionComplete', {
    total: sessionStats.value.total,
    correct: sessionStats.value.correct,
    wrong: sessionStats.value.wrong,
    accuracy: accuracy.value,
    averageTime: sessionStats.value.averageTime
  });
}

function playWordAudio() {
  if (currentWord.value?.audioUrl) {
    const audio = new Audio(currentWord.value.audioUrl);
    audio.volume = 0.8;
    audio.play().catch(console.error);
  }
}

function playFeedbackSound(isCorrect: boolean) {
  const soundFile = isCorrect ? '/audio/correct.mp3' : '/audio/wrong.mp3';
  const audio = new Audio(soundFile);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // フォールバック: Web Audio APIで簡易音を生成
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = isCorrect ? 800 : 400;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  });
}

async function retrySession() {
  error.value = null;
  loading.value = true;

  try {
    await memoryStore.startReviewSession(props.userId);
    if (memoryStore.reviewWords.length > 0) {
      resetQuestion();
      generateChoices();
      startTimer();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to retry session';
  } finally {
    loading.value = false;
  }
}

// キーボードショートカット
function handleKeyPress(event: KeyboardEvent) {
  if (answered.value || timeLeft.value <= 0) return;

  const key = event.key.toLowerCase();
  if (['a', 'b', 'c', 'd'].includes(key)) {
    const index = key.charCodeAt(0) - 'a'.charCodeAt(0);
    if (index < currentChoices.value.length) {
      selectChoice(index);
    }
  }
}

// Lifecycle
onMounted(() => {
  if (currentWord.value) {
    generateChoices();
    startTimer();
  }

  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  stopTimer();
  window.removeEventListener('keydown', handleKeyPress);
});

// Watchers
watch(() => memoryStore.currentWord, (newWord) => {
  if (newWord && !answered.value) {
    generateChoices();
  }
});

watch(() => memoryStore.error, (newError) => {
  if (newError) {
    error.value = newError;
    stopTimer();
  }
});
</script>

<style scoped>
.review-session {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900;
  @apply p-4 flex flex-col;
}

.session-header {
  @apply flex justify-between items-center mb-8 bg-black/20 rounded-2xl p-4;
  @apply border border-cyan-500/30 backdrop-blur-sm;
}

.progress-section {
  @apply flex-1 max-w-xs;
}

.question-counter {
  @apply text-white text-lg font-bold mb-2 text-center;
}

.current {
  @apply text-cyan-400;
}

.separator {
  @apply text-gray-400 mx-2;
}

.total {
  @apply text-gray-300;
}

.progress-bar {
  @apply w-full h-3 bg-gray-700 rounded-full overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500;
  @apply shadow-lg;
}

.timer-section {
  @apply flex justify-center;
}

.timer-circle {
  @apply w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600;
  @apply flex items-center justify-center shadow-lg;
  @apply border-4 border-green-300 transition-all duration-300;
}

.timer-circle.warning {
  @apply from-yellow-500 to-yellow-600 border-yellow-300;
  animation: pulse 1s infinite;
}

.timer-circle.danger {
  @apply from-red-500 to-red-600 border-red-300;
  animation: shake 0.5s infinite;
}

.timer-text {
  @apply text-white text-xl font-bold;
}

.stats-section {
  @apply flex gap-4;
}

.stat-item {
  @apply flex flex-col items-center gap-1;
}

.stat-icon {
  @apply text-xl;
}

.stat-value {
  @apply text-white font-bold;
}

.question-area {
  @apply flex-1 flex flex-col items-center justify-center text-center mb-8;
}

.word-display {
  @apply relative mb-6;
}

.word-text {
  @apply text-6xl font-bold text-white mb-4;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.word-info {
  @apply flex items-center justify-center gap-4 mb-4;
}

.pronunciation {
  @apply text-cyan-300 text-xl font-mono;
}

.audio-btn {
  @apply p-3 rounded-full bg-cyan-600 hover:bg-cyan-500;
  @apply transition-all duration-200 hover:scale-110;
}

.audio-icon {
  @apply text-white text-xl;
}

.difficulty-badge {
  @apply px-4 py-2 rounded-full text-white font-bold;
  @apply shadow-lg;
}

.question-text {
  @apply text-white text-xl;
}

.choices-area {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8;
}

.choice-btn {
  @apply relative p-6 bg-gray-800/80 rounded-xl border-2 border-gray-600;
  @apply transition-all duration-300 hover:border-cyan-400 hover:scale-105;
  @apply flex items-center gap-4 text-left;
  overflow: hidden;
}

.choice-btn:hover .choice-glow {
  @apply opacity-100;
}

.choice-btn.selected {
  @apply border-cyan-400 bg-cyan-900/50;
}

.choice-btn.correct {
  @apply border-green-400 bg-green-900/50;
  animation: correctPulse 0.6s ease-out;
}

.choice-btn.wrong {
  @apply border-red-400 bg-red-900/50;
  animation: wrongShake 0.6s ease-out;
}

.choice-btn.disabled {
  @apply opacity-60 cursor-not-allowed;
}

.choice-letter {
  @apply w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center;
  @apply text-white font-bold;
}

.choice-text {
  @apply text-white text-lg font-semibold flex-1;
}

.choice-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.result-area {
  @apply text-center;
}

.result-feedback {
  @apply mb-6 p-6 rounded-2xl;
}

.result-feedback.correct {
  @apply bg-green-900/50 border-2 border-green-400;
}

.result-feedback.wrong {
  @apply bg-red-900/50 border-2 border-red-400;
}

.result-icon {
  @apply text-6xl mb-2;
}

.result-text {
  @apply text-white text-2xl font-bold mb-2;
}

.result-details {
  @apply text-gray-300;
}

.next-btn {
  @apply px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600;
  @apply hover:from-cyan-500 hover:to-blue-500;
  @apply text-white font-bold rounded-xl transition-all duration-300;
  @apply flex items-center gap-2 mx-auto hover:scale-105;
}

.next-icon {
  @apply transition-transform duration-300;
}

.next-btn:hover .next-icon {
  @apply transform translate-x-1;
}

.loading-area,
.error-area {
  @apply flex flex-col items-center justify-center text-center;
  @apply text-white;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full;
  animation: spin 1s linear infinite;
}

.error-icon {
  @apply text-6xl mb-4;
}

.retry-btn {
  @apply mt-4 px-6 py-3 bg-red-600 hover:bg-red-500;
  @apply text-white font-bold rounded-lg transition-colors duration-200;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes correctPulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .session-header {
    @apply flex-col gap-4;
  }

  .word-text {
    @apply text-4xl;
  }

  .choices-area {
    @apply grid-cols-1;
  }

  .choice-btn {
    @apply p-4;
  }

  .choice-text {
    @apply text-base;
  }
}
</style>