<template>
  <div class="game-container">
    <!-- ゲーム画面の既存コンテンツ -->
    <div class="game-content">
      <h1>ゲームタイトル</h1>
      
      <!-- スコア表示 -->
      <div class="score">
        スコア: {{ score }}
      </div>

      <!-- 問題 -->
      <div class="question">
        {{ currentQuestion }}
      </div>

      <!-- 選択肢 -->
      <div class="options">
        <button
          v-for="option in options"
          :key="option.id"
          @click="handleOptionClick(option)"
          :disabled="isInteractionDisabled"
          class="option-button"
          :class="{ disabled: isInteractionDisabled }"
        >
          {{ option.text }}
        </button>
      </div>

      <!-- 観戦モード表示 -->
      <div v-if="isTeacher" class="spectator-notice">
        観戦モード（操作できません）
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSpectatorMode } from '@/composables/useSpectatorMode';

// 観戦モードを初期化
const spectatorMode = useSpectatorMode('サンプルゲーム');

// ゲームの状態
const score = ref(0);
const currentQuestion = ref('問題1: 正しい答えを選んでください');
const options = ref([
  { id: 1, text: '選択肢A', correct: true },
  { id: 2, text: '選択肢B', correct: false },
  { id: 3, text: '選択肢C', correct: false }
]);

// 観戦モードのプロパティを分解
const {
  isInteractionDisabled,
  isTeacher,
  notifyGameStart,
  notifyQuestionChange,
  notifyAnswer,
  notifyScoreUpdate,
  wrapSelectionHandler
} = spectatorMode;

// ゲーム開始時
onMounted(() => {
  // ゲーム開始を通知
  notifyGameStart();
  
  // 初期問題を通知
  notifyQuestionChange({
    question: currentQuestion.value,
    options: options.value
  });
});

// 選択肢クリックハンドラー
const handleOptionClick = wrapSelectionHandler((option) => {
  // 回答を通知
  notifyAnswer({
    selectedOption: option.id,
    correct: option.correct
  });

  // スコア更新
  if (option.correct) {
    score.value += 10;
    notifyScoreUpdate(score.value);
  }

  // 次の問題へ
  nextQuestion();
}, 'option');

// 次の問題へ進む
function nextQuestion() {
  // 新しい問題を設定
  currentQuestion.value = '問題2: 次の答えを選んでください';
  options.value = [
    { id: 4, text: '新しい選択肢A', correct: false },
    { id: 5, text: '新しい選択肢B', correct: true },
    { id: 6, text: '新しい選択肢C', correct: false }
  ];

  // 問題変更を通知
  notifyQuestionChange({
    question: currentQuestion.value,
    options: options.value
  });
}

// スコアの変更を監視
watch(score, (newScore) => {
  // 観戦モードでスコアを同期
  spectatorMode.debouncedSyncGameState({
    score: newScore,
    currentQuestion: currentQuestion.value
  });
});
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.game-content {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.score {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #667eea;
}

.question {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #555;
}

.options {
  display: grid;
  gap: 1rem;
}

.option-button {
  padding: 1rem 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.option-button:hover:not(.disabled) {
  border-color: #667eea;
  background: #f5f7ff;
  transform: translateY(-2px);
}

.option-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spectator-notice {
  margin-top: 2rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  text-align: center;
  color: #856404;
}
</style>