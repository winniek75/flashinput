<template>
  <div class="memory-station">
    <!-- ヘッダー -->
    <div class="station-header">
      <div class="header-content">
        <div class="title-section">
          <div class="title-controls">
            <button @click="backToWordGalaxy" class="back-button">
              ← Word Galaxy
            </button>
            <button @click="resetUserProgress" class="reset-button" :disabled="loading">
              🔄 進捗リセット
            </button>
          </div>
          <h1 class="station-title">🧠 Memory Station</h1>
          <p class="station-subtitle">間隔反復学習で確実に記憶定着</p>
        </div>

        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-value">{{ learningStats.totalWords }}</div>
              <div class="stat-label">学習中</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">{{ learningStats.masteredWords }}</div>
              <div class="stat-label">マスター</div>
            </div>
          </div>

          <div class="stat-card" :class="{ 'urgent': pendingReviewCount > 0 }">
            <div class="stat-icon">⏰</div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingReviewCount }}</div>
              <div class="stat-label">復習待ち</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- 復習セクション -->
      <div class="review-section" v-if="!isReviewActive">
        <div class="review-card">
          <div class="card-header">
            <h2 class="card-title">📖 今日の復習</h2>
            <div class="review-badge" v-if="pendingReviewCount > 0">
              {{ pendingReviewCount }}問
            </div>
          </div>

          <div class="card-content" v-if="pendingReviewCount > 0">
            <p class="review-description">
              {{ pendingReviewCount }}個の単語が復習のタイミングです。
              間隔反復学習で効率的に記憶を定着させましょう！
            </p>

            <div class="review-preview" v-if="previewWords.length > 0">
              <h4>復習予定の単語（例）</h4>
              <div class="preview-words">
                <span
                  v-for="word in previewWords.slice(0, 5)"
                  :key="word.id"
                  class="preview-word"
                  :style="{ borderColor: getDifficultyColor(word.eikenLevel) }"
                >
                  {{ word.word }}
                </span>
                <span v-if="pendingReviewCount > 5" class="more-words">
                  +{{ pendingReviewCount - 5 }}個
                </span>
              </div>
            </div>

            <button @click="startReview" class="start-review-btn" :disabled="loading">
              <span class="btn-icon">🚀</span>
              <span>復習を始める</span>
              <div class="btn-glow"></div>
            </button>
          </div>

          <div class="card-content" v-else>
            <div class="no-reviews">
              <div class="no-reviews-icon">😊</div>
              <h3>復習完了！</h3>
              <p>現在復習が必要な単語はありません。<br>新しい単語を学習するか、しばらく後にお試しください。</p>

              <button @click="learnNewWords" class="learn-new-btn" :disabled="loading">
                <span class="btn-icon">✨</span>
                <span v-if="!loading">新しい単語を学習</span>
                <span v-else>単語を準備中...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 学習モードセクション -->
        <div class="learning-section">
          <div class="learning-card">
            <div class="card-header">
              <h2 class="card-title">📚 新しい単語を学習</h2>
              <div class="learning-badge">
                学習モード
              </div>
            </div>

            <div class="card-content">
              <p class="learning-description">
                まだ学習していない新しい単語を覚えましょう。<br>
                段階的に難易度を上げて効率的に語彙力を向上させます。
              </p>

              <div class="learning-options">
                <div class="option-card"
                     @click="!isLoading ? startLearningSession('beginner') : null"
                     :class="{ 'disabled': isLoading }">
                  <div class="option-icon">🌱</div>
                  <h4>初級コース</h4>
                  <p>英検5級〜4級レベルの基本単語</p>
                  <div class="option-features">
                    <span>• 50問ランダム出題</span>
                    <span>• 音声付き学習</span>
                    <span>• 基礎語彙集中</span>
                  </div>
                  <div v-if="localLoading" class="loading-indicator">準備中...</div>
                </div>

                <div class="option-card"
                     @click="!isLoading ? startLearningSession('intermediate') : null"
                     :class="{ 'disabled': isLoading }">
                  <div class="option-icon">🌿</div>
                  <h4>中級コース</h4>
                  <p>英検3級〜準2級レベルの実用単語</p>
                  <div class="option-features">
                    <span>• 50問ランダム出題</span>
                    <span>• 例文付き学習</span>
                    <span>• 実用語彙重視</span>
                  </div>
                  <div v-if="localLoading" class="loading-indicator">準備中...</div>
                </div>

                <div class="option-card"
                     @click="!isLoading ? startLearningSession('advanced') : null"
                     :class="{ 'disabled': isLoading }">
                  <div class="option-icon">🌳</div>
                  <h4>上級コース</h4>
                  <p>英検2級〜1級レベルの高度な単語</p>
                  <div class="option-features">
                    <span>• 50問ランダム出題</span>
                    <span>• 語源・関連語付き</span>
                    <span>• 高度語彙マスター</span>
                  </div>
                  <div v-if="localLoading" class="loading-indicator">準備中...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学習統計 -->
        <div class="stats-section">
          <div class="stats-grid">
            <!-- マスタリー進捗 -->
            <div class="stat-panel">
              <h3 class="panel-title">📊 習得進捗</h3>
              <div class="mastery-progress">
                <div class="progress-circle">
                  <svg viewBox="0 0 100 100" class="circle-svg">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      class="circle-bg"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      class="circle-progress"
                      :stroke-dasharray="`${masteryCircumference} ${masteryCircumference}`"
                      :stroke-dashoffset="masteryOffset"
                    />
                  </svg>
                  <div class="circle-content">
                    <span class="circle-percentage">{{ masteryPercentage }}%</span>
                    <span class="circle-label">習得率</span>
                  </div>
                </div>
                <div class="mastery-details">
                  <div class="detail-item">
                    <span class="detail-label">平均習得度:</span>
                    <span class="detail-value">{{ learningStats.averageMastery }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">現在のストリーク:</span>
                    <span class="detail-value">{{ learningStats.streakStats.currentStreak }}日</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SRSレベル分布 -->
            <div class="stat-panel">
              <h3 class="panel-title">🎯 レベル分布</h3>
              <div class="level-distribution">
                <div
                  v-for="(count, level) in levelDistribution"
                  :key="level"
                  class="level-bar"
                >
                  <div class="level-info">
                    <span class="level-number">Lv.{{ level }}</span>
                    <span class="level-count">{{ count }}語</span>
                  </div>
                  <div class="bar-container">
                    <div
                      class="bar-fill"
                      :style="{
                        width: `${getBarWidth(count)}%`,
                        backgroundColor: getLevelColor(parseInt(level))
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 忘却曲線 -->
            <div class="stat-panel">
              <h3 class="panel-title">📈 忘却曲線</h3>
              <div class="forgetting-curve">
                <canvas ref="curveCanvas" width="300" height="200"></canvas>
              </div>
            </div>

            <!-- 最近の活動 -->
            <div class="stat-panel">
              <h3 class="panel-title">⚡ 最近の活動</h3>
              <div class="recent-activity">
                <div class="activity-item">
                  <span class="activity-icon">📚</span>
                  <span class="activity-text">今日 {{ todayReviews }}語復習</span>
                </div>
                <div class="activity-item">
                  <span class="activity-icon">⭐</span>
                  <span class="activity-text">今週 {{ weeklyMastered }}語マスター</span>
                </div>
                <div class="activity-item">
                  <span class="activity-icon">🔥</span>
                  <span class="activity-text">{{ learningStats.streakStats.longestStreak }}日連続学習記録</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ゲームモード選択 -->
      <transition name="fade">
        <div v-if="showGameModeSelection" class="game-mode-selection">
          <div class="mode-container">
            <h2 class="mode-title">学習モードを選択</h2>
            <div class="mode-options">
              <button @click="selectGameMode('classic')" class="mode-btn classic-mode">
                <span class="mode-icon">📚</span>
                <span class="mode-name">クラシックモード</span>
                <span class="mode-desc">従来のカード形式で学習</span>
              </button>
              <button @click="selectGameMode('fall')" class="mode-btn fall-mode">
                <span class="mode-icon">🌠</span>
                <span class="mode-name">Word Fall Galaxy</span>
                <span class="mode-desc">落下ゲームで楽しく学習</span>
              </button>
            </div>
            <button @click="cancelGameMode" class="cancel-btn">キャンセル</button>
          </div>
        </div>
      </transition>

      <!-- 復習セッション（クラシックモード） -->
      <div class="session-section" v-if="isReviewActive && gameMode === 'classic'">
        <ReviewSession
          :user-id="userId"
          @session-complete="handleSessionComplete"
          @session-exit="handleSessionExit"
        />
      </div>

      <!-- Word Fall ゲーム -->
      <div class="session-section" v-if="isReviewActive && gameMode === 'fall'">
        <WordFallGame
          :words="memoryStore.reviewWords"
          :on-complete="handleGameComplete"
        />
      </div>

      <!-- セッション結果 -->
      <div class="result-section" v-if="sessionResult">
        <div class="result-card">
          <div class="result-header">
            <h2 class="result-title">🎉 復習完了！</h2>
            <div class="result-score" :class="getScoreClass(sessionResult.accuracy)">
              {{ Math.round(sessionResult.accuracy) }}%
            </div>
          </div>

          <div class="result-stats">
            <div class="result-stat">
              <span class="stat-icon">✅</span>
              <span class="stat-text">{{ sessionResult.correct }}/{{ sessionResult.total }} 正解</span>
            </div>
            <div class="result-stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-text">平均 {{ Math.round(sessionResult.averageTime / 1000) }}秒</span>
            </div>
          </div>

          <div class="result-actions">
            <button @click="continueReview" class="continue-btn" v-if="pendingReviewCount > 0">
              <span class="btn-icon">🔄</span>
              続けて復習
            </button>
            <button @click="backToStation" class="back-btn">
              <span class="btn-icon">🏠</span>
              ステーションに戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ローディング -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- エラー表示 -->
    <div class="error-overlay" v-if="error">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3>エラーが発生しました</h3>
        <p>{{ error }}</p>
        <button @click="clearError" class="error-btn">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useMemoryStationStore } from '@/stores/word-galaxy/memoryStation';
import { useWordGalaxyStore } from '@/stores/word-galaxy/wordGalaxy';
import { getDifficultyColor } from '@/utils/word-galaxy/difficultyMapper';
import ReviewSession from '@/components/word-galaxy/ReviewSession.vue';
// import WordFallGame from '@/components/word-galaxy/WordFallGame.vue'; // TODO: Component file not found
import type { Word } from '@/types/word-galaxy/word.types';

// Router & Stores
const router = useRouter();
const memoryStore = useMemoryStationStore();
const wordGalaxyStore = useWordGalaxyStore();

// State
const isReviewActive = ref(false);
const localLoading = ref(false);
const showGameModeSelection = ref(false);
const gameMode = ref<'classic' | 'fall'>('classic');
const sessionResult = ref<{
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  averageTime: number;
} | null>(null);
const previewWords = ref<Word[]>([]);
const curveCanvas = ref<HTMLCanvasElement | null>(null);
const loadingMessage = ref('');

// Mock data for demo
const todayReviews = ref(12);
const weeklyMastered = ref(8);

// Props
interface Props {
  userId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  userId: 'demo-user'
});

// Computed
const learningStats = computed(() => memoryStore.learningStats);
const pendingReviewCount = computed(() => memoryStore.pendingReviewCount);
const masteryPercentage = computed(() => memoryStore.masteryPercentage);
const loading = computed(() => memoryStore.loading);
const error = computed(() => memoryStore.error);

const masteryCircumference = computed(() => 2 * Math.PI * 45);
const masteryOffset = computed(() => {
  const progress = masteryPercentage.value / 100;
  return masteryCircumference.value * (1 - progress);
});

const levelDistribution = computed(() => {
  const dist = learningStats.value.levelDistribution;
  const result: Record<string, number> = {};
  for (let i = 1; i <= 8; i++) {
    result[i.toString()] = dist[i] || 0;
  }
  return result;
});

// 全体のloading状態（store loading + ローカルloading）
const isLoading = computed(() => loading.value || localLoading.value);

// Methods
async function startReview() {
  loadingMessage.value = '復習問題を準備中...';
  isReviewActive.value = true;
  sessionResult.value = null;

  try {
    await memoryStore.startReviewSession(props.userId);
  } catch (err) {
    console.error('Failed to start review session:', err);
    isReviewActive.value = false;
  }
}

function handleSessionComplete(result: any) {
  isReviewActive.value = false;
  sessionResult.value = result;

  // 統計を更新
  loadLearningData();

  // セッション記録
  wordGalaxyStore.recordSession('review', result.averageTime * result.total, result.total, result.accuracy);
}

function handleSessionExit() {
  isReviewActive.value = false;
  sessionResult.value = null;
}

function continueReview() {
  sessionResult.value = null;
  startReview();
}

function backToStation() {
  sessionResult.value = null;
  loadLearningData();
}

function backToWordGalaxy() {
  router.push('/word-galaxy');
}

async function learnNewWords() {
  try {
    console.log('🆕 Starting new word learning session...');

    // 新しい単語をSRSシステムに追加（内部で統計も更新される）
    const newWordsAdded = await memoryStore.addNewWordsToLearning(5);

    if (newWordsAdded > 0) {
      console.log(`✅ Added ${newWordsAdded} new words to learning queue`);

      // 学習データを再読み込み
      await loadLearningData();

      // 直接復習単語をロードして開始
      console.log('🔄 Loading review words for immediate learning...');
      await memoryStore.loadReviewWords(props.userId);

      if (memoryStore.reviewWords.length > 0) {
        console.log(`📚 Found ${memoryStore.reviewWords.length} words for review - starting session`);
        memoryStore.startLearningSession();
        isReviewActive.value = true;
      } else {
        // フォールバック: 新しく追加した単語を即座に学習可能にする
        console.log('🔄 Trying alternative approach...');

        // 直接復習単語を設定
        const { wordGalaxyDB } = await import('@/database/word-galaxy/schemas');
        const recentlyAdded = await wordGalaxyDB.userWordProgress
          .where('userId').equals('demo-user')
          .and(progress => {
            const timeDiff = Date.now() - progress.createdAt.getTime();
            return timeDiff < 60000; // 1分以内に作成された
          })
          .limit(newWordsAdded)
          .toArray();

        if (recentlyAdded.length > 0) {
          const wordIds = recentlyAdded.map(p => p.wordId);
          const words = await wordGalaxyDB.words.where('id').anyOf(wordIds).toArray();

          console.log(`🎯 Starting immediate learning session with ${words.length} newly added words`);

          memoryStore.setReviewWords(words);
          memoryStore.reviewProgress = recentlyAdded;
          memoryStore.startLearningSession();
          isReviewActive.value = true;
        } else {
          alert(`🎉 ${newWordsAdded}個の新しい単語を学習キューに追加しました！\n\n「復習を始める」ボタンから学習を開始できます。`);
        }
      }
    } else {
      alert('😊 現在学習可能な新しい単語がありません。\n全ての単語を学習済みです！');
    }
  } catch (err) {
    console.error('❌ Failed to add new words:', err);

    if (err.message?.includes('Could not load word database')) {
      // データベース初期化の問題
      const retry = confirm('単語データベースの読み込みに失敗しました。\n\n「OK」で再試行、「キャンセル」でページをリフレッシュしてください。');

      if (retry) {
        await retryInitialization();
      } else {
        window.location.reload();
      }
    } else {
      alert(`新しい単語の追加に失敗しました: ${err.message}`);
    }
  }
}

// 学習セッション開始
async function startLearningSession(level: 'beginner' | 'intermediate' | 'advanced') {
  try {
    console.log(`📚 Starting ${level} learning session...`);

    // レベル別の単語数設定
    const wordCounts = {
      beginner: 50,
      intermediate: 50,
      advanced: 50
    };

    const levelNames = {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級'
    };

    localLoading.value = true;

    // 該当レベルの新しい単語をSRSシステムに追加（レベル別フィルタリング）
    const result = await memoryStore.addNewWordsByLevel(level, wordCounts[level]);

    if (result.count > 0) {
      console.log(`✅ Added ${result.count} new ${level} words to learning queue`);

      // 学習データを再読み込み
      await loadLearningData();

      // 新しく追加した単語を直接学習セッションに使用
      memoryStore.setReviewWords(result.words);
      console.log(`🎯 Starting ${levelNames[level]}学習セッション with ${result.words.length} words`);

      // ゲームモード選択を表示
      showGameModeSelection.value = true;
    } else {
      alert(`${levelNames[level]}レベルの新しい単語がありません。\n他のレベルをお試しください。`);
    }

  } catch (err) {
    console.error(`❌ Failed to start ${level} learning session:`, err);

    const errorMessage = err instanceof Error ? err.message : `${level}学習セッションの開始に失敗しました`;

    // 学習進捗リセットが必要なエラーかチェック
    if (errorMessage.includes('学習進捗をリセット')) {
      const shouldReset = confirm(
        `${errorMessage}\n\n「OK」で学習進捗をリセットして再開、「キャンセル」で別のコースを試行してください。`
      );

      if (shouldReset) {
        await resetProgressAndRetry(level);
        return;
      }
    }

    error.value = errorMessage;
  } finally {
    localLoading.value = false;
  }
}

async function retryInitialization() {
  try {
    localLoading.value = true;
    console.log('🔄 Retrying Word Galaxy initialization...');

    // Word Galaxy全体を再初期化
    await wordGalaxyStore.initialize(props.userId);

    // 学習データを再読み込み
    await loadLearningData();

    console.log('✅ Retry successful');
  } catch (err) {
    console.error('❌ Retry failed:', err);
    alert('再試行に失敗しました。ページをリフレッシュしてください。');
  } finally {
    localLoading.value = false;
  }
}

// 学習進捗をリセットして再試行
async function resetProgressAndRetry(level: 'beginner' | 'intermediate' | 'advanced') {
  try {
    localLoading.value = true;
    console.log('🔄 Resetting progress and retrying...');

    // 進捗をリセット
    await memoryStore.resetUserProgress();

    // 学習データを再読み込み
    await loadLearningData();

    // 再度学習セッションを開始
    await startLearningSession(level);

    console.log('✅ Progress reset and retry successful');
  } catch (err) {
    console.error('❌ Reset and retry failed:', err);
    error.value = '進捗リセットに失敗しました。ページをリフレッシュしてください。';
  } finally {
    localLoading.value = false;
  }
}

// 手動で学習進捗をリセット
async function resetUserProgress() {
  const confirmed = confirm(
    '学習進捗をリセットしますか？\n\nすべての学習記録が削除され、最初からやり直しになります。'
  );

  if (!confirmed) return;

  try {
    console.log('🔄 Manual progress reset initiated...');
    await memoryStore.resetUserProgress();
    await loadLearningData();
    console.log('✅ Manual progress reset completed');
    alert('学習進捗をリセットしました。');
  } catch (err) {
    console.error('❌ Manual progress reset failed:', err);
    alert('進捗リセットに失敗しました。');
  }
}

function selectGameMode(mode: 'classic' | 'fall') {
  gameMode.value = mode;
  showGameModeSelection.value = false;
  memoryStore.startLearningSession();
  isReviewActive.value = true;
}

function cancelGameMode() {
  showGameModeSelection.value = false;
  // 単語をクリア
  memoryStore.resetSession();
}

function handleGameComplete(result: any) {
  if (result) {
    // ゲーム結果を表示
    sessionResult.value = {
      total: result.learnedWords.length,
      correct: Math.round(result.learnedWords.length * (result.accuracy / 100)),
      wrong: Math.round(result.learnedWords.length * ((100 - result.accuracy) / 100)),
      accuracy: result.accuracy,
      averageTime: 0 // Word Fall では時間計測なし
    };

    // 学習記録を更新
    result.learnedWords.forEach((word: any) => {
      const isCorrect = Math.random() > 0.5; // 簡易的な判定
      memoryStore.submitAnswer(props.userId, isCorrect, 1000);
    });
  }

  isReviewActive.value = false;
  loadLearningData(); // 統計を更新
}

function clearError() {
  memoryStore.clearError();
}

function getBarWidth(count: number): number {
  const maxCount = Math.max(...Object.values(levelDistribution.value));
  return maxCount > 0 ? (count / maxCount) * 100 : 0;
}

function getLevelColor(level: number): string {
  const colors = [
    '#10B981', '#059669', '#3B82F6', '#1D4ED8',
    '#7C3AED', '#A855F7', '#DC2626', '#B91C1C'
  ];
  return colors[level - 1] || '#6B7280';
}

function getScoreClass(accuracy: number): string {
  if (accuracy >= 90) return 'excellent';
  if (accuracy >= 80) return 'good';
  if (accuracy >= 70) return 'average';
  return 'needs-improvement';
}

async function loadLearningData() {
  try {
    await memoryStore.loadLearningStats(props.userId);
    await memoryStore.loadForgettingCurveData(props.userId);
    await loadPreviewWords();

    // 忘却曲線を描画
    nextTick(() => {
      drawForgettingCurve();
    });
  } catch (err) {
    console.error('Failed to load learning data:', err);
  }
}

async function loadPreviewWords() {
  try {
    const result = await memoryStore.loadReviewWords(props.userId, 10);
    previewWords.value = memoryStore.reviewWords.slice(0, 5);
  } catch (err) {
    console.error('Failed to load preview words:', err);
  }
}

function drawForgettingCurve() {
  const canvas = curveCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { levels, retentionRates } = memoryStore.forgettingCurveData;
  if (levels.length === 0) return;

  // キャンバスをクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // グラフの設定
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;

  // 軸を描画
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // 曲線を描画
  if (retentionRates.length > 1) {
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < levels.length; i++) {
      const x = padding + (i / (levels.length - 1)) * width;
      const y = canvas.height - padding - (retentionRates[i] / 100) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // データポイントを描画
    ctx.fillStyle = '#06B6D4';
    for (let i = 0; i < levels.length; i++) {
      const x = padding + (i / (levels.length - 1)) * width;
      const y = canvas.height - padding - (retentionRates[i] / 100) * height;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // ラベルを描画
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  for (let i = 0; i < levels.length; i++) {
    const x = padding + (i / (levels.length - 1)) * width;
    ctx.fillText(`L${levels[i]}`, x, canvas.height - 10);
  }
}

// Lifecycle
onMounted(async () => {
  if (!wordGalaxyStore.initialized) {
    await wordGalaxyStore.initialize(props.userId);
  }

  if (!wordGalaxyStore.isLoggedIn) {
    await wordGalaxyStore.login(props.userId);
  }

  loadLearningData();
});
</script>

<style scoped>
.memory-station {
  @apply min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900;
}

.station-header {
  @apply bg-black/20 backdrop-blur-sm border-b border-cyan-500/30;
}

.header-content {
  @apply max-w-7xl mx-auto px-6 py-8 flex justify-between items-center;
}

.title-section {
  @apply text-left;
}

.title-controls {
  @apply flex gap-3 mb-4;
}

.back-button {
  @apply px-4 py-2 bg-cyan-600/80 text-white rounded-lg;
  @apply hover:bg-cyan-500/90 transition-all duration-200;
  @apply border border-cyan-400/30 backdrop-blur-sm;
  @apply flex items-center gap-2 text-sm font-medium;
}

.reset-button {
  @apply px-4 py-2 bg-orange-600/80 text-white rounded-lg;
  @apply hover:bg-orange-500/90 transition-all duration-200;
  @apply border border-orange-400/30 backdrop-blur-sm;
  @apply flex items-center gap-2 text-sm font-medium;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.station-title {
  @apply text-4xl font-bold text-white mb-2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.station-subtitle {
  @apply text-cyan-300 text-lg;
}

.header-stats {
  @apply flex gap-6;
}

.stat-card {
  @apply flex items-center gap-3 bg-white/10 rounded-xl p-4;
  @apply border border-white/20 backdrop-blur-sm;
  @apply transition-all duration-300 hover:scale-105;
}

.stat-card.urgent {
  @apply border-red-400/50 bg-red-900/20;
  animation: pulse 2s infinite;
}

.stat-icon {
  @apply text-3xl;
}

.stat-info {
  @apply text-center;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-sm text-gray-300;
}

.main-content {
  @apply max-w-7xl mx-auto px-6 py-8;
}

.review-section {
  @apply space-y-8;
}

.review-card, .learning-card {
  @apply bg-white/10 rounded-2xl p-8 border border-cyan-500/30;
  @apply backdrop-blur-sm;
}

.learning-card {
  @apply border-emerald-500/30;
}

.learning-section {
  @apply space-y-8;
}

.learning-badge {
  @apply bg-emerald-500 text-white px-4 py-2 rounded-full font-bold;
}

.learning-description {
  @apply text-gray-300 text-lg mb-6;
}

.learning-options {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.option-card {
  @apply bg-white/5 rounded-xl p-6 border border-emerald-400/20;
  @apply hover:border-emerald-400/50 hover:bg-white/10;
  @apply transition-all duration-300 cursor-pointer;
  @apply backdrop-blur-sm;
}

.option-card:hover {
  transform: translateY(-2px);
}

.option-icon {
  @apply text-4xl mb-4;
}

.option-card h4 {
  @apply text-xl font-bold text-white mb-2;
}

.option-card p {
  @apply text-gray-300 mb-4;
}

.option-features {
  @apply space-y-1;
}

.option-features span {
  @apply block text-sm text-emerald-300;
}

.option-card.disabled {
  @apply opacity-50 cursor-not-allowed;
  pointer-events: none;
}

.loading-indicator {
  @apply mt-3 text-sm text-blue-300 font-medium;
  @apply animate-pulse;
}

/* ゲームモード選択 */
.game-mode-selection {
  @apply fixed inset-0 bg-black/80 backdrop-blur-sm;
  @apply flex items-center justify-center z-50;
  @apply px-4;
}

.mode-container {
  @apply bg-gradient-to-br from-indigo-900 to-purple-900;
  @apply rounded-2xl p-8 max-w-2xl w-full;
  @apply border border-cyan-400/30;
  @apply shadow-2xl shadow-purple-500/30;
}

.mode-title {
  @apply text-3xl font-bold text-white text-center mb-6;
  @apply bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent;
}

.mode-options {
  @apply grid grid-cols-2 gap-4 mb-6;
}

.mode-btn {
  @apply flex flex-col items-center p-6 rounded-xl;
  @apply bg-white/10 border-2 border-white/20;
  @apply transition-all duration-300 cursor-pointer;
  @apply hover:bg-white/20 hover:scale-105 hover:border-cyan-400;
  @apply backdrop-blur-sm;
}

.mode-btn.classic-mode:hover {
  @apply shadow-lg shadow-blue-500/30;
}

.mode-btn.fall-mode:hover {
  @apply shadow-lg shadow-purple-500/30;
}

.mode-icon {
  @apply text-4xl mb-3;
}

.mode-name {
  @apply text-white font-bold text-lg mb-2;
}

.mode-desc {
  @apply text-white/60 text-sm text-center;
}

.cancel-btn {
  @apply w-full py-3 rounded-lg font-bold;
  @apply bg-gray-600/50 text-white border border-gray-400/30;
  @apply hover:bg-gray-500/50 transition-all duration-300;
}

.card-header {
  @apply flex justify-between items-center mb-6;
}

.card-title {
  @apply text-2xl font-bold text-white;
}

.review-badge {
  @apply bg-red-500 text-white px-4 py-2 rounded-full font-bold;
  @apply animate-pulse;
}

.review-description {
  @apply text-gray-300 text-lg mb-6;
}

.review-preview {
  @apply mb-6;
}

.review-preview h4 {
  @apply text-white font-semibold mb-3;
}

.preview-words {
  @apply flex flex-wrap gap-2;
}

.preview-word {
  @apply px-3 py-1 bg-gray-800 text-white rounded-lg border-l-4;
  @apply font-semibold;
}

.more-words {
  @apply px-3 py-1 bg-gray-700 text-gray-300 rounded-lg;
  @apply italic;
}

.start-review-btn {
  @apply relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600;
  @apply hover:from-cyan-500 hover:to-blue-500;
  @apply text-white font-bold rounded-xl transition-all duration-300;
  @apply flex items-center gap-3 mx-auto hover:scale-105;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  overflow: hidden;
}

.btn-icon {
  @apply text-xl;
}

.btn-glow {
  @apply absolute inset-0 opacity-0 transition-opacity duration-300;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: scan 2s linear infinite;
}

.start-review-btn:hover .btn-glow {
  @apply opacity-100;
}

.no-reviews {
  @apply text-center py-8;
}

.no-reviews-icon {
  @apply text-6xl mb-4;
}

.no-reviews h3 {
  @apply text-2xl font-bold text-white mb-4;
}

.no-reviews p {
  @apply text-gray-300 mb-6;
}

.learn-new-btn {
  @apply px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600;
  @apply hover:from-green-500 hover:to-emerald-500;
  @apply text-white font-bold rounded-lg transition-all duration-300;
  @apply flex items-center gap-2 mx-auto hover:scale-105;
}

.stats-section {
  @apply mt-8;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.stat-panel {
  @apply bg-white/10 rounded-xl p-6 border border-white/20;
  @apply backdrop-blur-sm;
}

.panel-title {
  @apply text-lg font-bold text-white mb-4;
}

.mastery-progress {
  @apply space-y-4;
}

.progress-circle {
  @apply relative w-32 h-32 mx-auto;
}

.circle-svg {
  @apply w-full h-full transform -rotate-90;
}

.circle-bg {
  @apply fill-none stroke-gray-600;
  stroke-width: 8;
}

.circle-progress {
  @apply fill-none stroke-cyan-500;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.circle-content {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.circle-percentage {
  @apply text-2xl font-bold text-white;
}

.circle-label {
  @apply text-sm text-gray-300;
}

.mastery-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex justify-between;
}

.detail-label {
  @apply text-gray-300;
}

.detail-value {
  @apply text-white font-semibold;
}

.level-distribution {
  @apply space-y-3;
}

.level-bar {
  @apply space-y-1;
}

.level-info {
  @apply flex justify-between text-sm;
}

.level-number {
  @apply text-white font-semibold;
}

.level-count {
  @apply text-gray-300;
}

.bar-container {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.bar-fill {
  @apply h-full transition-all duration-500 rounded-full;
}

.forgetting-curve {
  @apply flex justify-center;
}

.recent-activity {
  @apply space-y-3;
}

.activity-item {
  @apply flex items-center gap-3;
}

.activity-icon {
  @apply text-xl;
}

.activity-text {
  @apply text-gray-300;
}

.result-card {
  @apply bg-white/10 rounded-2xl p-8 border border-green-500/30;
  @apply backdrop-blur-sm max-w-md mx-auto;
}

.result-header {
  @apply text-center mb-6;
}

.result-title {
  @apply text-2xl font-bold text-white mb-4;
}

.result-score {
  @apply text-4xl font-bold rounded-lg p-4;
}

.result-score.excellent {
  @apply text-green-400 bg-green-900/50;
}

.result-score.good {
  @apply text-blue-400 bg-blue-900/50;
}

.result-score.average {
  @apply text-yellow-400 bg-yellow-900/50;
}

.result-score.needs-improvement {
  @apply text-red-400 bg-red-900/50;
}

.result-stats {
  @apply space-y-3 mb-6;
}

.result-stat {
  @apply flex items-center justify-center gap-2 text-gray-300;
}

.result-actions {
  @apply flex gap-4 justify-center;
}

.continue-btn,
.back-btn {
  @apply px-6 py-3 font-bold rounded-lg transition-all duration-300;
  @apply flex items-center gap-2 hover:scale-105;
}

.continue-btn {
  @apply bg-cyan-600 hover:bg-cyan-500 text-white;
}

.back-btn {
  @apply bg-gray-600 hover:bg-gray-500 text-white;
}

.loading-overlay,
.error-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
  @apply backdrop-blur-sm;
}

.loading-content,
.error-content {
  @apply bg-white/10 rounded-2xl p-8 text-center;
  @apply border border-white/20 backdrop-blur-sm;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4;
  animation: spin 1s linear infinite;
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-content h3 {
  @apply text-xl font-bold text-white mb-4;
}

.error-content p {
  @apply text-gray-300 mb-6;
}

.error-btn {
  @apply px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg;
  @apply transition-colors duration-200;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes scan {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    @apply flex-col gap-6;
  }

  .header-stats {
    @apply flex-wrap justify-center;
  }

  .stats-grid {
    @apply grid-cols-1;
  }

  .result-actions {
    @apply flex-col;
  }

  .mode-options {
    @apply grid-cols-1;
  }
}

/* トランジション */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>