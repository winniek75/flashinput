<template>
  <div class="battle-arena">
    <!-- Battle Header -->
    <div class="battle-header">
      <div class="battle-timer">
        <div class="timer-circle" :style="{ '--progress': timeProgress }">
          <span class="timer-text">{{ formatTime(timeRemaining) }}</span>
        </div>
      </div>

      <div class="battle-score">
        <div class="player-score" :class="{ 'leading': playerScore > opponentScore }">
          <div class="score-label">You</div>
          <div class="score-value">{{ playerScore }}</div>
        </div>

        <div class="vs-indicator">VS</div>

        <div class="opponent-score" :class="{ 'leading': opponentScore > playerScore }">
          <div class="score-label">{{ battle.opponent.name }}</div>
          <div class="score-value">{{ opponentScore }}</div>
        </div>
      </div>

      <div class="question-progress">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</div>
      </div>
    </div>

    <!-- Current Question -->
    <div class="question-section" v-if="currentQuestion">
      <div class="question-container">
        <div class="question-header">
          <div class="question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</div>
          <div class="difficulty-indicator" :class="currentQuestion.difficulty">
            {{ currentQuestion.difficulty.toUpperCase() }}
          </div>
        </div>

        <div class="question-content">
          <h2 class="question-text">{{ currentQuestion.question }}</h2>

          <!-- Audio Button for pronunciation questions -->
          <button
            v-if="currentQuestion.type === 'pronunciation' && currentQuestion.audioUrl"
            class="audio-btn"
            @click="playQuestionAudio"
          >
            <span class="audio-icon">🔊</span>
            Play Audio
          </button>

          <!-- Context for meaning questions -->
          <div v-if="currentQuestion.context" class="question-context">
            <div class="context-label">Context:</div>
            <div class="context-text">{{ currentQuestion.context }}</div>
          </div>
        </div>

        <!-- Answer Choices -->
        <div class="choices-container">
          <div
            v-for="(choice, index) in currentQuestion.choices"
            :key="index"
            class="choice-option"
            :class="{
              'selected': selectedAnswer === index,
              'correct': showResult && index === currentQuestion.correctAnswer,
              'incorrect': showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer,
              'disabled': selectedAnswer !== null
            }"
            @click="selectAnswer(index)"
          >
            <div class="choice-letter">{{ String.fromCharCode(65 + index) }}</div>
            <div class="choice-text">{{ choice }}</div>
          </div>
        </div>

        <!-- Answer Timer -->
        <div class="answer-timer">
          <div class="timer-bar">
            <div
              class="timer-fill"
              :style="{ width: `${answerTimeProgress}%` }"
            ></div>
          </div>
          <div class="timer-label">Answer Time: {{ formatTime(answerTimeRemaining) }}</div>
        </div>
      </div>

      <!-- Opponent Activity Indicator -->
      <div class="opponent-indicator">
        <div class="opponent-status" :class="opponentStatus">
          <div class="status-icon">{{ getOpponentStatusIcon(opponentStatus) }}</div>
          <div class="status-text">{{ getOpponentStatusText(opponentStatus) }}</div>
        </div>

        <div v-if="opponentAnswered" class="opponent-answered">
          <span class="answered-icon">✅</span>
          <span class="answered-text">{{ battle.opponent.name }} answered!</span>
        </div>
      </div>
    </div>

    <!-- Round Result -->
    <div class="round-result" v-if="showRoundResult && roundResult">
      <div class="result-container">
        <div class="result-header">
          <div class="result-icon" :class="roundResult.correct ? 'correct' : 'incorrect'">
            {{ roundResult.correct ? '✅' : '❌' }}
          </div>
          <div class="result-text">
            {{ roundResult.correct ? 'Correct!' : 'Incorrect!' }}
          </div>
        </div>

        <div class="result-details">
          <div class="correct-answer">
            <span class="detail-label">Correct Answer:</span>
            <span class="detail-value">{{ currentQuestion.choices[currentQuestion.correctAnswer] }}</span>
          </div>

          <div class="response-time" v-if="roundResult.responseTime">
            <span class="detail-label">Response Time:</span>
            <span class="detail-value">{{ formatTime(roundResult.responseTime / 1000) }}</span>
          </div>

          <div class="points-earned" v-if="roundResult.pointsEarned">
            <span class="detail-label">Points:</span>
            <span class="detail-value points">+{{ roundResult.pointsEarned }}</span>
          </div>
        </div>

        <div class="result-explanation" v-if="currentQuestion.explanation">
          <div class="explanation-label">Explanation:</div>
          <div class="explanation-text">{{ currentQuestion.explanation }}</div>
        </div>
      </div>
    </div>

    <!-- Battle End Screen -->
    <div class="battle-end" v-if="battleEnded">
      <div class="end-container">
        <div class="battle-result">
          <div class="result-icon-large" :class="battleResult">
            {{ getBattleResultIcon(battleResult) }}
          </div>
          <h2 class="result-title">{{ getBattleResultTitle(battleResult) }}</h2>
          <div class="final-score">{{ playerScore }} - {{ opponentScore }}</div>
        </div>

        <div class="battle-stats">
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-label">Accuracy</div>
            <div class="stat-value">{{ accuracy }}%</div>
          </div>

          <div class="stat-item">
            <div class="stat-icon">⚡</div>
            <div class="stat-label">Avg Response</div>
            <div class="stat-value">{{ averageResponseTime }}s</div>
          </div>

          <div class="stat-item" v-if="eloChange">
            <div class="stat-icon">📈</div>
            <div class="stat-label">ELO Change</div>
            <div class="stat-value" :class="{ 'positive': eloChange > 0, 'negative': eloChange < 0 }">
              {{ eloChange > 0 ? '+' : '' }}{{ eloChange }}
            </div>
          </div>
        </div>

        <div class="end-actions">
          <button class="action-btn primary" @click="playAgain">
            <span class="btn-icon">🔄</span>
            Play Again
          </button>
          <button class="action-btn secondary" @click="viewReplay">
            <span class="btn-icon">📺</span>
            View Replay
          </button>
          <button class="action-btn secondary" @click="backToArena">
            <span class="btn-icon">🏟️</span>
            Back to Arena
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { BattleSession, BattleQuestion, BattleAnswer } from '@/types/word-galaxy/word.types';

interface Props {
  battle: BattleSession;
  playerId: string;
}

interface Emits {
  (e: 'battle-end', result: { winner: string; playerScore: number; opponentScore: number; eloChange?: number }): void;
  (e: 'answer-submitted', answer: BattleAnswer): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State
const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const showResult = ref(false);
const showRoundResult = ref(false);
const battleEnded = ref(false);
const timeRemaining = ref(300); // 5 minutes
const answerTimeRemaining = ref(15); // 15 seconds per question
const playerScore = ref(0);
const opponentScore = ref(0);
const roundResult = ref<any>(null);
const opponentAnswered = ref(false);
const opponentStatus = ref<'thinking' | 'answered' | 'waiting'>('thinking');
const battleResult = ref<'victory' | 'defeat' | 'draw'>('victory');
const eloChange = ref<number>(0);

// Timers
const battleTimer = ref<number | null>(null);
const answerTimer = ref<number | null>(null);
const resultTimer = ref<number | null>(null);

// Computed
const currentQuestion = computed(() => {
  if (currentQuestionIndex.value < props.battle.questions.length) {
    return props.battle.questions[currentQuestionIndex.value];
  }
  return null;
});

const totalQuestions = computed(() => props.battle.questions.length);

const timeProgress = computed(() => {
  const totalTime = props.battle.mode === 'quick' ? 180 : 300;
  return ((totalTime - timeRemaining.value) / totalTime) * 100;
});

const answerTimeProgress = computed(() => {
  return ((15 - answerTimeRemaining.value) / 15) * 100;
});

const accuracy = computed(() => {
  if (currentQuestionIndex.value === 0) return 0;
  return Math.round((playerScore.value / currentQuestionIndex.value) * 100);
});

const averageResponseTime = computed(() => {
  // Mock calculation - would be calculated from actual response times
  return '2.3';
});

// Methods
function startBattle() {
  // Start battle timer
  const totalTime = props.battle.mode === 'quick' ? 180 : 300; // 3 or 5 minutes
  timeRemaining.value = totalTime;

  battleTimer.value = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      endBattle();
    }
  }, 1000);

  // Start first question
  startQuestion();
}

function startQuestion() {
  selectedAnswer.value = null;
  showResult.value = false;
  showRoundResult.value = false;
  opponentAnswered.value = false;
  opponentStatus.value = 'thinking';
  answerTimeRemaining.value = 15;

  // Start answer timer
  answerTimer.value = setInterval(() => {
    answerTimeRemaining.value--;
    if (answerTimeRemaining.value <= 0) {
      // Auto-submit null answer if time runs out
      selectAnswer(-1);
    }
  }, 1000);

  // Simulate opponent activity
  simulateOpponentBehavior();
}

function selectAnswer(answerIndex: number) {
  if (selectedAnswer.value !== null) return;

  selectedAnswer.value = answerIndex;
  showResult.value = true;

  // Clear answer timer
  if (answerTimer.value) {
    clearInterval(answerTimer.value);
    answerTimer.value = null;
  }

  // Calculate response time
  const responseTime = (15 - answerTimeRemaining.value) * 1000;
  const isCorrect = answerIndex === currentQuestion.value?.correctAnswer;

  // Update score
  if (isCorrect) {
    const timeBonus = Math.floor((answerTimeRemaining.value / 15) * 50);
    const points = 100 + timeBonus;
    playerScore.value += points;

    roundResult.value = {
      correct: true,
      responseTime,
      pointsEarned: points
    };
  } else {
    roundResult.value = {
      correct: false,
      responseTime,
      pointsEarned: 0
    };
  }

  // Emit answer
  emit('answer-submitted', {
    questionId: currentQuestion.value?.id || '',
    selectedAnswer: answerIndex,
    isCorrect,
    responseTime
  });

  // Show round result
  showRoundResult.value = true;

  // Auto-advance to next question
  resultTimer.value = setTimeout(() => {
    nextQuestion();
  }, 3000);
}

function nextQuestion() {
  if (resultTimer.value) {
    clearTimeout(resultTimer.value);
    resultTimer.value = null;
  }

  currentQuestionIndex.value++;

  if (currentQuestionIndex.value >= totalQuestions.value) {
    endBattle();
  } else {
    startQuestion();
  }
}

function endBattle() {
  battleEnded.value = true;

  // Clear all timers
  if (battleTimer.value) clearInterval(battleTimer.value);
  if (answerTimer.value) clearInterval(answerTimer.value);
  if (resultTimer.value) clearTimeout(resultTimer.value);

  // Determine winner
  if (playerScore.value > opponentScore.value) {
    battleResult.value = 'victory';
    eloChange.value = Math.floor(Math.random() * 30 + 10); // +10 to +40
  } else if (playerScore.value < opponentScore.value) {
    battleResult.value = 'defeat';
    eloChange.value = Math.floor(Math.random() * 20 + 5) * -1; // -5 to -25
  } else {
    battleResult.value = 'draw';
    eloChange.value = 0;
  }

  // Emit battle end
  emit('battle-end', {
    winner: battleResult.value === 'victory' ? props.playerId : props.battle.opponent.id,
    playerScore: playerScore.value,
    opponentScore: opponentScore.value,
    eloChange: eloChange.value
  });
}

function simulateOpponentBehavior() {
  // Simulate opponent thinking time (1-10 seconds)
  const thinkingTime = Math.random() * 9000 + 1000;

  setTimeout(() => {
    opponentAnswered.value = true;
    opponentStatus.value = 'answered';

    // Simulate opponent score (with some randomness)
    const opponentAccuracy = 0.7 + Math.random() * 0.25; // 70-95% accuracy
    if (Math.random() < opponentAccuracy) {
      const points = 80 + Math.floor(Math.random() * 40); // 80-120 points
      opponentScore.value += points;
    }
  }, thinkingTime);
}

function playQuestionAudio() {
  if (currentQuestion.value?.audioUrl) {
    const audio = new Audio(currentQuestion.value.audioUrl);
    audio.volume = 0.7;
    audio.play().catch(console.error);
  }
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'meaning': 'Meaning',
    'pronunciation': 'Pronunciation',
    'usage': 'Usage',
    'synonym': 'Synonym',
    'antonym': 'Antonym'
  };
  return labels[type] || 'Question';
}

function getOpponentStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    'thinking': '🤔',
    'answered': '✅',
    'waiting': '⏳'
  };
  return icons[status] || '🤔';
}

function getOpponentStatusText(status: string): string {
  const texts: Record<string, string> = {
    'thinking': 'Thinking...',
    'answered': 'Answered!',
    'waiting': 'Waiting...'
  };
  return texts[status] || 'Unknown';
}

function getBattleResultIcon(result: string): string {
  const icons: Record<string, string> = {
    'victory': '🏆',
    'defeat': '💥',
    'draw': '🤝'
  };
  return icons[result] || '🏆';
}

function getBattleResultTitle(result: string): string {
  const titles: Record<string, string> = {
    'victory': 'Victory!',
    'defeat': 'Defeat!',
    'draw': 'Draw!'
  };
  return titles[result] || 'Battle End';
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function playAgain() {
  // Reset battle and start again (emit event to parent)
  emit('battle-end', { winner: '', playerScore: 0, opponentScore: 0 });
}

function viewReplay() {
  // Navigate to replay view
  console.log('View replay requested');
}

function backToArena() {
  // Navigate back to arena
  emit('battle-end', { winner: '', playerScore: 0, opponentScore: 0 });
}

// Lifecycle
onMounted(() => {
  startBattle();
});

onUnmounted(() => {
  // Cleanup timers
  if (battleTimer.value) clearInterval(battleTimer.value);
  if (answerTimer.value) clearInterval(answerTimer.value);
  if (resultTimer.value) clearTimeout(resultTimer.value);
});
</script>

<style scoped>
.battle-arena {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900;
  @apply text-white relative overflow-hidden;
}

.battle-header {
  @apply flex justify-between items-center p-6 bg-black/30;
  @apply border-b border-gray-600/30 backdrop-blur-sm;
}

.battle-timer {
  @apply relative;
}

.timer-circle {
  @apply w-20 h-20 rounded-full border-4 border-gray-600;
  @apply flex items-center justify-center relative;
  background: conic-gradient(from 0deg, #ef4444 calc(var(--progress) * 1%), #374151 calc(var(--progress) * 1%));
}

.timer-text {
  @apply text-lg font-bold;
}

.battle-score {
  @apply flex items-center gap-8;
}

.player-score, .opponent-score {
  @apply text-center transition-all duration-300;
}

.player-score.leading, .opponent-score.leading {
  @apply transform scale-110 text-yellow-400;
}

.score-label {
  @apply text-sm text-gray-400 mb-1;
}

.score-value {
  @apply text-3xl font-bold;
}

.vs-indicator {
  @apply text-2xl font-bold text-red-400;
}

.question-progress {
  @apply text-right;
}

.progress-bar {
  @apply w-32 h-2 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300;
}

.question-section {
  @apply p-8;
}

.question-container {
  @apply max-w-4xl mx-auto;
}

.question-header {
  @apply flex justify-between items-center mb-6;
}

.question-type {
  @apply px-4 py-2 bg-blue-600 rounded-lg font-semibold;
}

.difficulty-indicator {
  @apply px-3 py-1 rounded-full text-sm font-bold;
}

.difficulty-indicator.easy { @apply bg-green-600; }
.difficulty-indicator.medium { @apply bg-yellow-600; }
.difficulty-indicator.hard { @apply bg-red-600; }

.question-content {
  @apply text-center mb-8;
}

.question-text {
  @apply text-3xl font-bold mb-6;
}

.audio-btn {
  @apply px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600;
  @apply rounded-lg font-semibold transition-all duration-300;
  @apply hover:from-purple-700 hover:to-pink-700;
}

.question-context {
  @apply bg-black/30 rounded-lg p-4 mt-4;
  @apply border border-gray-600/30;
}

.context-label {
  @apply text-sm text-gray-400 mb-2;
}

.context-text {
  @apply text-gray-200;
}

.choices-container {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-8;
}

.choice-option {
  @apply bg-black/30 border border-gray-600/30 rounded-xl p-4;
  @apply flex items-center gap-4 cursor-pointer transition-all duration-300;
  @apply hover:bg-gray-700/30 hover:border-gray-500/50;
}

.choice-option.selected {
  @apply bg-blue-600/30 border-blue-500/50;
}

.choice-option.correct {
  @apply bg-green-600/30 border-green-500/50;
}

.choice-option.incorrect {
  @apply bg-red-600/30 border-red-500/50;
}

.choice-option.disabled {
  @apply cursor-not-allowed opacity-60;
}

.choice-letter {
  @apply w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center;
  @apply text-lg font-bold;
}

.choice-option.selected .choice-letter {
  @apply bg-blue-600;
}

.choice-option.correct .choice-letter {
  @apply bg-green-600;
}

.choice-option.incorrect .choice-letter {
  @apply bg-red-600;
}

.choice-text {
  @apply flex-1 text-lg;
}

.answer-timer {
  @apply mb-6;
}

.timer-bar {
  @apply w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.timer-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-100;
}

.timer-label {
  @apply text-center text-gray-400;
}

.opponent-indicator {
  @apply max-w-4xl mx-auto mt-8;
}

.opponent-status {
  @apply flex items-center justify-center gap-3 bg-black/30;
  @apply rounded-lg p-4 border border-gray-600/30;
}

.opponent-answered {
  @apply flex items-center justify-center gap-2 mt-4;
  @apply text-green-400 font-semibold;
}

.round-result {
  @apply fixed inset-0 bg-black/80 flex items-center justify-center z-50;
}

.result-container {
  @apply bg-gray-900 rounded-2xl p-8 max-w-md mx-4;
  @apply border border-gray-600/30;
}

.result-header {
  @apply text-center mb-6;
}

.result-icon {
  @apply text-6xl mb-4;
}

.result-text {
  @apply text-2xl font-bold;
}

.result-icon.correct, .result-text {
  @apply text-green-400;
}

.result-icon.incorrect {
  @apply text-red-400;
}

.result-details {
  @apply space-y-3 mb-6;
}

.detail-label {
  @apply text-gray-400 mr-2;
}

.detail-value {
  @apply text-white font-semibold;
}

.detail-value.points {
  @apply text-yellow-400;
}

.result-explanation {
  @apply bg-black/30 rounded-lg p-4;
  @apply border border-gray-600/30;
}

.explanation-label {
  @apply text-sm text-gray-400 mb-2;
}

.battle-end {
  @apply fixed inset-0 bg-black/90 flex items-center justify-center z-50;
}

.end-container {
  @apply bg-gray-900 rounded-2xl p-8 max-w-lg mx-4;
  @apply border border-gray-600/30;
}

.battle-result {
  @apply text-center mb-8;
}

.result-icon-large {
  @apply text-8xl mb-4;
}

.result-title {
  @apply text-4xl font-bold mb-4;
}

.final-score {
  @apply text-2xl text-gray-300;
}

.battle-stats {
  @apply grid grid-cols-3 gap-4 mb-8;
}

.stat-item {
  @apply text-center bg-black/30 rounded-lg p-4;
  @apply border border-gray-600/30;
}

.stat-icon {
  @apply text-2xl mb-2;
}

.stat-label {
  @apply text-sm text-gray-400 mb-1;
}

.stat-value {
  @apply text-lg font-bold;
}

.stat-value.positive {
  @apply text-green-400;
}

.stat-value.negative {
  @apply text-red-400;
}

.end-actions {
  @apply flex flex-col gap-3;
}

.action-btn {
  @apply px-6 py-3 rounded-lg font-semibold transition-all duration-300;
  @apply flex items-center justify-center gap-2;
}

.action-btn.primary {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
  @apply hover:from-blue-700 hover:to-purple-700;
}

.action-btn.secondary {
  @apply bg-gray-600 hover:bg-gray-700;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .battle-header {
    @apply flex-col gap-4;
  }

  .battle-score {
    @apply gap-4;
  }

  .question-text {
    @apply text-2xl;
  }

  .choices-container {
    @apply grid-cols-1;
  }

  .battle-stats {
    @apply grid-cols-1;
  }
}
</style>