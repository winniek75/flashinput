<template>
  <div class="grammar-reflex-arena cosmic-theme">
    <!-- 宇宙船コックピットヘッダー -->
    <div class="cosmic-header">
      <div class="header-left">
        <button @click="handleBack" class="cosmic-nav-button">
          <ArrowLeftIcon class="w-4 h-4" />
          戻る
        </button>
      </div>
      <div class="header-center">
        <div class="cosmic-title">
          <span class="cosmic-icon">⚔️</span>
          <div class="title-text">
            <h1>グラマーバトルアリーナ</h1>
            <div class="subtitle">文法銀河 - バトルゾーン</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="cosmic-status-panel">
          <div class="ship-energy">
            <div class="energy-label">宇宙船エネルギー</div>
            <div class="energy-hearts">
              <div 
                v-for="life in maxLives" 
                :key="life"
                :class="['energy-core', { 'depleted': life > lives }]"
              >
                💎
              </div>
            </div>
          </div>
          <div class="cosmic-score">
            <div class="score-label">銀河ポイント</div>
            <div class="score-value">
              <span class="score-icon">⭐</span>
              {{ score.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 宇宙ステータス表示 -->
    <div class="cosmic-status-bar">
      <div class="status-item">
        <div class="status-icon">🌌</div>
        <div class="status-text">ミッション時間: {{ gameTime.toFixed(1) }}秒</div>
      </div>
      <div v-if="streak > 0" class="status-item streak">
        <div class="status-icon">🔥</div>
        <div class="status-text">連続成功: {{ streak }}</div>
      </div>
      <div v-if="feverMode" class="status-item fever">
        <div class="status-icon">⚡</div>
        <div class="status-text">コズミック・フューリーモード!</div>
      </div>
      <div class="level-indicator">
        <div class="level-badge" :class="currentLevelClass">
          {{ currentLevel.name }}
        </div>
      </div>
    </div>

    <!-- メインバトルエリア -->
    <div class="cosmic-battle-area">
      <!-- 準備画面 -->
      <div v-if="gameState === 'ready'" class="ready-screen cosmic-panel">
        <div class="cosmic-hologram">
          <div class="hologram-content">
            <div class="difficulty-selector">
              <h3>ミッション難易度を選択:</h3>
              <div class="difficulty-options">
                <button 
                  v-for="level in difficultyLevels" 
                  :key="level.id"
                  @click="selectedLevel = level.id"
                  :class="['difficulty-btn', level.id, { active: selectedLevel === level.id }]"
                >
                  <div class="difficulty-icon">{{ level.icon }}</div>
                  <div class="difficulty-info">
                    <div class="difficulty-name">{{ level.name }}</div>
                    <div class="difficulty-desc">{{ level.description }}</div>
                  </div>
                </button>
              </div>
            </div>
            <button @click="startGame" class="cosmic-start-button">
              <span class="button-glow"></span>
              バトルミッション開始
            </button>
          </div>
        </div>
      </div>

      <!-- バトル画面 -->
      <div v-else-if="gameState === 'playing'" class="battle-screen">
        <!-- 敵の攻撃（文章表示） -->
        <div class="enemy-attack-zone">
          <div class="enemy-ship" :class="{ 
            'destroyed': showingAnswer && lastJudgment?.type === 'correct', 
            'attacking': showingAnswer && lastJudgment?.type === 'wrong' 
          }">
            <div class="ship-body">🛸</div>
            <div class="attack-beam" v-if="!showingAnswer"></div>
            <div v-if="showingAnswer && lastJudgment?.type === 'correct'" class="explosion-effect">
              <div class="explosion-particle" v-for="i in 8" :key="i">💥</div>
            </div>
            <div v-if="showingAnswer && lastJudgment?.type === 'wrong'" class="enemy-victory-effect">
              <div class="victory-glow"></div>
              <div class="damage-beam"></div>
            </div>
          </div>
          
          <div 
            :class="['grammar-transmission', { 
              'answer-revealed': showingAnswer,
              'correct-transmission': showingAnswer && lastJudgment?.type === 'correct',
              'corrupted-transmission': showingAnswer && lastJudgment?.type === 'wrong'
            }]"
          >
            <div class="transmission-header">
              <span class="signal-strength">📡</span>
              敵からの通信
            </div>
            <div class="transmission-content">
              {{ currentQuestion.sentence }}
            </div>
            <div class="transmission-audio">
              <button 
                @click="playQuestionAudio" 
                class="audio-button"
                title="ネイティブ発音で聞く"
              >
                🔊 音声再生
              </button>
            </div>
            <div v-if="showingAnswer && !currentQuestion.isCorrect" class="correction-data">
              <span class="data-label">修正された信号:</span>
              {{ currentQuestion.correction }}
            </div>
            <div v-if="showingAnswer && currentQuestion.explanation" class="explanation-data">
              <span class="explanation-label">📚 解説:</span>
              <div class="explanation-text">{{ currentQuestion.explanation }}</div>
            </div>
          </div>
          
          <!-- バトル指示 -->
          <div v-if="!showingAnswer" class="battle-instruction">
            <div class="instruction-text">🎯 分析して応答せよ！ 🎯</div>
            <div class="time-pressure">迅速な判断が必要！</div>
          </div>
        </div>

        <!-- 防御武器（判定ボタン） -->
        <div class="defense-weapons" v-if="!showingAnswer">
          <button 
            @click="judgeAnswer(true)"
            class="weapon-button correct-weapon"
            :disabled="showingAnswer"
          >
            <div class="weapon-core"></div>
            <div class="weapon-label">
              <span class="weapon-icon">✓</span>
              <span class="weapon-name">シールド</span>
              <span class="weapon-desc">正しい文法</span>
            </div>
            <div class="weapon-energy"></div>
          </button>
          
          <button 
            @click="judgeAnswer(false)"
            class="weapon-button wrong-weapon"
            :disabled="showingAnswer"
          >
            <div class="weapon-core"></div>
            <div class="weapon-label">
              <span class="weapon-icon">✗</span>
              <span class="weapon-name">レーザー</span>
              <span class="weapon-desc">間違った文法</span>
            </div>
            <div class="weapon-energy"></div>
          </button>
        </div>

        <!-- バトル結果・ステータス -->
        <div class="battle-status">
          <div v-if="combo > 1" class="combo-display cosmic-combo">
            <div class="combo-core">⚡ COMBO x{{ combo }}</div>
            <div class="combo-effect"></div>
          </div>
          
          <div v-if="lastJudgment" class="judgment-result">
            <div :class="['result-text', lastJudgment.type]">
              {{ lastJudgment.message }}
            </div>
            <div class="result-stats">
              反応時間: {{ lastJudgment.time }}ms
            </div>
          </div>

          <!-- 理解確認ボタン -->
          <div v-if="showingAnswer" class="understanding-confirmation">
            <button @click="proceedToNext" class="cosmic-understand-button">
              <span class="understand-icon">✓</span>
              <span class="understand-text">理解しました - 次へ</span>
            </button>
            <div class="auto-proceed-timer">
              <div class="timer-text">自動で進む: {{ autoTimer }}秒</div>
              <div class="timer-bar">
                <div 
                  class="timer-fill" 
                  :style="{ width: (autoTimer / maxAutoTimer) * 100 + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ミッション進行状況 -->
        <div class="mission-progress">
          <div class="progress-container">
            <div class="progress-label">ミッション進行状況</div>
            <div class="progress-bar cosmic-progress">
              <div 
                class="progress-fill"
                :style="{ width: (questionIndex / totalQuestions) * 100 + '%' }"
              ></div>
              <div class="progress-stars">
                <span v-for="i in totalQuestions" :key="i" 
                      :class="['progress-star', { completed: i <= questionIndex }]">
                  ⭐
                </span>
              </div>
            </div>
            <div class="progress-text">
              {{ questionIndex }} / {{ totalQuestions }} 敵を撃破
            </div>
          </div>
        </div>
      </div>

      <!-- ミッション完了画面 -->
      <div v-else-if="gameState === 'gameOver'" class="mission-complete cosmic-panel">
        <div class="completion-hologram">
          <h2>🏆 ミッション完了！ 🏆</h2>
          <div class="rank-display">
            <div class="rank-badge" :class="getRankClass()">
              {{ getFinalRank() }}
            </div>
          </div>
          
          <div class="battle-statistics">
            <div class="stat-grid">
              <div class="stat-item">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                  <div class="stat-label">銀河ポイント</div>
                  <div class="stat-value">{{ score.toLocaleString() }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🔥</div>
                <div class="stat-info">
                  <div class="stat-label">最大連続記録</div>
                  <div class="stat-value">{{ bestStreak }}</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">⚡</div>
                <div class="stat-info">
                  <div class="stat-label">平均反応時間</div>
                  <div class="stat-value">{{ averageReactionTime }}ms</div>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                  <div class="stat-label">正答率</div>
                  <div class="stat-value">{{ accuracy }}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mission-actions">
            <button @click="restartGame" class="cosmic-action-button primary">
              <span class="button-glow"></span>
              新しいバトルミッション
            </button>
            <button @click="handleBack" class="cosmic-action-button secondary">
              銀河ハブに戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 宇宙パーティクルエフェクト -->
    <div ref="particleContainer" class="cosmic-particles"></div>

    <!-- コズミックフューリーモードエフェクト -->
    <div v-if="feverMode" class="cosmic-fury-overlay">
      <div class="fury-energy-field"></div>
      <div class="fury-particles">
        <div v-for="i in 20" :key="i" class="fury-particle">⚡</div>
      </div>
    </div>

    <!-- プレイヤー宇宙船（画面下部に追加） -->
    <div class="player-ship-zone">
      <div class="player-ship" :class="{ 
        'ship-damaged': showingAnswer && lastJudgment?.type === 'wrong',
        'ship-victorious': showingAnswer && lastJudgment?.type === 'correct'
      }">
        <div class="player-ship-body">🚀</div>
        <div v-if="showingAnswer && lastJudgment?.type === 'correct'" class="victory-beam"></div>
        <div v-if="showingAnswer && lastJudgment?.type === 'wrong'" class="damage-effect">
          <div class="damage-spark" v-for="i in 6" :key="i">⚡</div>
        </div>
      </div>
    </div>

    <!-- 背景宇宙 -->
    <div class="cosmic-background">
      <div class="stars-field">
        <div v-for="i in 100" :key="i" class="star" 
             :style="{ 
               left: Math.random() * 100 + '%', 
               top: Math.random() * 100 + '%',
               animationDelay: Math.random() * 3 + 's'
             }">
        </div>
      </div>
      <div class="nebula-clouds"></div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useGameAudio } from '@/composables/useGameAudio'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database'

// Props & Emits
const emit = defineEmits(['back', 'complete'])

// Router
const router = useRouter()
const route = useRoute()

// === ネイティブ発音システム ===
const {
  playWord: playNativeWord,
  playPhoneme: playNativePhoneme,
  speakSentence: speakNativeSentence,
  speakGrammarInstruction,
  initializeAudio: initNativeAudio
} = useGameAudio()

const handleBack = () => {
  logger.log('handleBack called')
  
  try {
    // 前のルートがある場合はそこに戻る
    if (route.meta?.previousRoute?.name) {
      logger.log('Going back to previous route:', route.meta.previousRoute.name)
      router.push({ name: route.meta.previousRoute.name })
    } else {
      logger.log('Going back to grammar galaxy hub')
      // デフォルトは Grammar Galaxy Hub に戻る
      router.push('/platforms/grammar-galaxy')
    }
  } catch (error) {
    logger.error('Navigation error:', error)
    try {
      // セカンダリフォールバック: Grammar Galaxy Foundation
      router.push('/grammar-galaxy-foundation')
    } catch (error2) {
      logger.error('Secondary navigation error:', error2)
      // 最終フォールバック: ホームに戻る
      router.push('/')
    }
  }
}

// 難易度レベル設定
const difficultyLevels = [
  {
    id: 'cadet',
    name: 'Space Cadet',
    description: '基礎文法訓練 (英検5級〜4級)',
    icon: '🌟',
    timeLimit: 2500,
    questions: 'beginnerQuestions',
    passingScore: 70
  },
  {
    id: 'ranger',
    name: 'Galaxy Ranger', 
    description: '中級ミッション (英検3級〜準2級)',
    icon: '🚀',
    timeLimit: 1800,
    questions: 'intermediateQuestions',
    passingScore: 75
  },
  {
    id: 'commander',
    name: 'Star Commander',
    description: '上級作戦 (英検2級〜準1級)',
    icon: '⭐',
    timeLimit: 1200,
    questions: 'advancedQuestions',
    passingScore: 80
  },
  {
    id: 'master',
    name: 'Cosmic Master',
    description: 'エリート混合ミッション',
    icon: '👑',
    timeLimit: 1500,
    questions: 'mixedQuestions',
    passingScore: 85
  }
]

// 改良されたゲームデータ（レベル別・英検レベル対応）
const grammarQuestions = {
  beginnerQuestions: [
    // 英検5級レベル
    {
      sentence: "She are happy today",
      isCorrect: false,
      correction: "She is happy today",
      errorType: "subject_verb_agreement",
      difficulty: 1,
      explanation: "三人称単数の主語にはisを使います",
      category: "be_verbs",
      eiken: 5
    },
    {
      sentence: "I am studying English",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "be_verbs",
      eiken: 5
    },
    {
      sentence: "He don't like pizza",
      isCorrect: false,
      correction: "He doesn't like pizza", 
      errorType: "auxiliary_verb",
      difficulty: 1,
      explanation: "三人称単数にはdoesn'tを使います",
      category: "general_verbs",
      eiken: 5
    },
    {
      sentence: "They are playing soccer",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "present_continuous",
      eiken: 5
    },
    {
      sentence: "We was at the park",
      isCorrect: false,
      correction: "We were at the park",
      errorType: "subject_verb_agreement", 
      difficulty: 1,
      explanation: "複数の主語の過去形にはwereを使います",
      category: "past_tense",
      eiken: 5
    },
    {
      sentence: "This is my book",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "demonstratives",
      eiken: 5
    },
    {
      sentence: "That are my pens",
      isCorrect: false,
      correction: "Those are my pens",
      errorType: "demonstrative_plural",
      difficulty: 1,
      explanation: "複数のものにはthoseを使います",
      category: "demonstratives",
      eiken: 5
    },
    {
      sentence: "I like apple",
      isCorrect: false,
      correction: "I like apples",
      errorType: "countable_noun",
      difficulty: 1,
      explanation: "可算名詞は複数形または冠詞が必要です",
      category: "nouns",
      eiken: 5
    },
    {
      sentence: "She have a dog",
      isCorrect: false,
      correction: "She has a dog",
      errorType: "subject_verb_agreement",
      difficulty: 1,
      explanation: "三人称単数にはhasを使います",
      category: "general_verbs",
      eiken: 5
    },
    {
      sentence: "I go to school yesterday",
      isCorrect: false,
      correction: "I went to school yesterday",
      errorType: "past_tense",
      difficulty: 1,
      explanation: "昨日のことなので過去形wentを使います",
      category: "past_tense",
      eiken: 5
    },
    {
      sentence: "My mother is a teacher",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "be_verbs",
      eiken: 5
    },
    {
      sentence: "How many book do you have?",
      isCorrect: false,
      correction: "How many books do you have?",
      errorType: "plural_form",
      difficulty: 1,
      explanation: "How manyの後は複数形を使います",
      category: "questions",
      eiken: 5
    },
    // 追加の英検5級レベル問題
    {
      sentence: "I plays soccer every day",
      isCorrect: false,
      correction: "I play soccer every day",
      errorType: "subject_verb_agreement",
      difficulty: 1,
      explanation: "一人称単数Iには動詞の原形を使います",
      category: "general_verbs",
      eiken: 5
    },
    {
      sentence: "Do you likes music?",
      isCorrect: false,
      correction: "Do you like music?",
      errorType: "interrogative_form",
      difficulty: 1,
      explanation: "疑問文のdoの後は動詞の原形を使います",
      category: "questions",
      eiken: 5
    },
    {
      sentence: "She doesn't likes ice cream",
      isCorrect: false,
      correction: "She doesn't like ice cream",
      errorType: "negative_form",
      difficulty: 1,
      explanation: "doesn'tの後は動詞の原形を使います",
      category: "general_verbs",
      eiken: 5
    },
    {
      sentence: "There is a book on the table",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "there_be",
      eiken: 5
    },
    {
      sentence: "I have two cat",
      isCorrect: false,
      correction: "I have two cats",
      errorType: "plural_form",
      difficulty: 1,
      explanation: "数詞の後の名詞は複数形にします",
      category: "nouns",
      eiken: 5
    },
    {
      sentence: "My sister are a nurse",
      isCorrect: false,
      correction: "My sister is a nurse",
      errorType: "subject_verb_agreement",
      difficulty: 1,
      explanation: "三人称単数の主語にはisを使います",
      category: "be_verbs",
      eiken: 5
    },
    {
      sentence: "Does he plays tennis?",
      isCorrect: false,
      correction: "Does he play tennis?",
      errorType: "interrogative_form",
      difficulty: 1,
      explanation: "疑問文のdoesの後は動詞の原形を使います",
      category: "questions",
      eiken: 5
    },
    {
      sentence: "We doesn't watch TV",
      isCorrect: false,
      correction: "We don't watch TV",
      errorType: "negative_form",
      difficulty: 1,
      explanation: "複数の主語にはdon'tを使います",
      category: "general_verbs",
      eiken: 5
    },
    {
      sentence: "I am 15 years old",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "be_verbs",
      eiken: 5
    },
    {
      sentence: "Where do you live?",
      isCorrect: true,
      errorType: null,
      difficulty: 1,
      explanation: "正しい文です",
      category: "questions",
      eiken: 5
    },
    // 英検4級レベル
    {
      sentence: "I will going to the store",
      isCorrect: false,
      correction: "I will go to the store",
      errorType: "future_tense",
      difficulty: 2,
      explanation: "willの後は動詞の原形を使います",
      category: "future_tense",
      eiken: 4
    },
    {
      sentence: "Did you went to school?",
      isCorrect: false,
      correction: "Did you go to school?",
      errorType: "interrogative_past",
      difficulty: 2,
      explanation: "疑問文のDidの後は動詞の原形を使います",
      category: "questions",
      eiken: 4
    },
    {
      sentence: "She can speaks English",
      isCorrect: false,
      correction: "She can speak English",
      errorType: "modal_verb",
      difficulty: 2,
      explanation: "助動詞canの後は動詞の原形を使います",
      category: "modals",
      eiken: 4
    },
    {
      sentence: "I am going to visit my friend tomorrow",
      isCorrect: true,
      errorType: null,
      difficulty: 2,
      explanation: "正しい文です",
      category: "future_tense",
      eiken: 4
    },
    {
      sentence: "There is many students in the class",
      isCorrect: false,
      correction: "There are many students in the class",
      errorType: "there_be",
      difficulty: 2,
      explanation: "複数名詞の前にはThere areを使います",
      category: "there_be",
      eiken: 4
    },
    {
      sentence: "I have been study English for two years",
      isCorrect: false,
      correction: "I have been studying English for two years",
      errorType: "present_perfect_continuous",
      difficulty: 2,
      explanation: "現在完了進行形はhave been + -ingを使います",
      category: "perfect_tenses",
      eiken: 4
    },
    {
      sentence: "He is more tall than me",
      isCorrect: false,
      correction: "He is taller than me",
      errorType: "comparative",
      difficulty: 2,
      explanation: "短い形容詞は-erを付けて比較級を作ります",
      category: "comparatives",
      eiken: 4
    },
    {
      sentence: "I want to buying a new car",
      isCorrect: false,
      correction: "I want to buy a new car",
      errorType: "infinitive",
      difficulty: 2,
      explanation: "want to の後は動詞の原形を使います",
      category: "infinitives",
      eiken: 4
    },
    // 追加の英検4級レベル問題
    {
      sentence: "He is studying English since last year",
      isCorrect: false,
      correction: "He has been studying English since last year",
      errorType: "present_perfect_continuous",
      difficulty: 2,
      explanation: "sinceがある場合は現在完了（進行）形を使います",
      category: "perfect_tenses",
      eiken: 4
    },
    {
      sentence: "I am going shopping tomorrow",
      isCorrect: true,
      errorType: null,
      difficulty: 2,
      explanation: "正しい文です",
      category: "future_plans",
      eiken: 4
    },
    {
      sentence: "Could you to help me?",
      isCorrect: false,
      correction: "Could you help me?",
      errorType: "modal_verb",
      difficulty: 2,
      explanation: "助動詞の後はtoを付けません",
      category: "modals",
      eiken: 4
    },
    {
      sentence: "This is the most interesting book",
      isCorrect: true,
      errorType: null,
      difficulty: 2,
      explanation: "正しい文です",
      category: "superlatives",
      eiken: 4
    },
    {
      sentence: "I have already finish my homework",
      isCorrect: false,
      correction: "I have already finished my homework",
      errorType: "present_perfect",
      difficulty: 2,
      explanation: "現在完了形はhave + 過去分詞を使います",
      category: "perfect_tenses",
      eiken: 4
    },
    {
      sentence: "He run faster than me",
      isCorrect: false,
      correction: "He runs faster than me",
      errorType: "subject_verb_agreement",
      difficulty: 2,
      explanation: "三人称単数には-sを付けます",
      category: "general_verbs",
      eiken: 4
    },
    {
      sentence: "Would you like some coffee?",
      isCorrect: true,
      errorType: null,
      difficulty: 2,
      explanation: "正しい文です",
      category: "polite_requests",
      eiken: 4
    },
    {
      sentence: "I don't have no money",
      isCorrect: false,
      correction: "I don't have any money",
      errorType: "double_negative",
      difficulty: 2,
      explanation: "二重否定は避けて、anyを使います",
      category: "negatives",
      eiken: 4
    }
  ],
  intermediateQuestions: [
    // 英検3級レベル
    {
      sentence: "If I was you, I would go",
      isCorrect: false,
      correction: "If I were you, I would go",
      errorType: "subjunctive_mood",
      difficulty: 3,
      explanation: "仮定法過去ではbe動詞はすべてwereを使います",
      category: "conditionals",
      eiken: 3
    },
    {
      sentence: "She said that she can help",
      isCorrect: false,
      correction: "She said that she could help",
      errorType: "reported_speech",
      difficulty: 3,
      explanation: "間接話法では時制を一つ過去にします",
      category: "reported_speech",
      eiken: 3
    },
    {
      sentence: "The book which I bought is interesting",
      isCorrect: true,
      errorType: null,
      difficulty: 3,
      explanation: "正しい文です",
      category: "relative_clauses",
      eiken: 3
    },
    {
      sentence: "I have lived here since five years",
      isCorrect: false,
      correction: "I have lived here for five years",
      errorType: "since_for",
      difficulty: 3,
      explanation: "期間を表すときはforを使います",
      category: "perfect_tenses",
      eiken: 3
    },
    {
      sentence: "She is enough old to drive",
      isCorrect: false,
      correction: "She is old enough to drive",
      errorType: "enough_position",
      difficulty: 3,
      explanation: "enoughは形容詞の後に置きます",
      category: "adjectives",
      eiken: 3
    },
    {
      sentence: "I used to living in Tokyo",
      isCorrect: false,
      correction: "I used to live in Tokyo",
      errorType: "used_to",
      difficulty: 3,
      explanation: "used toの後は動詞の原形を使います",
      category: "habits",
      eiken: 3
    },
    {
      sentence: "The man who car is red is my father",
      isCorrect: false,
      correction: "The man whose car is red is my father",
      errorType: "relative_pronoun_possessive",
      difficulty: 3,
      explanation: "所有を表す関係代名詞はwhoseを使います",
      category: "relative_clauses",
      eiken: 3
    },
    {
      sentence: "I finished to do my homework",
      isCorrect: false,
      correction: "I finished doing my homework",
      errorType: "gerund_infinitive",
      difficulty: 3,
      explanation: "finishの後は動名詞(-ing)を使います",
      category: "gerunds",
      eiken: 3
    },
    {
      sentence: "By the time he arrived, we have left",
      isCorrect: false,
      correction: "By the time he arrived, we had left",
      errorType: "past_perfect",
      difficulty: 3,
      explanation: "過去の時点より前のことは過去完了形を使います",
      category: "perfect_tenses",
      eiken: 3
    },
    {
      sentence: "Would you mind to open the window?",
      isCorrect: false,
      correction: "Would you mind opening the window?",
      errorType: "mind_gerund",
      difficulty: 3,
      explanation: "mindの後は動名詞(-ing)を使います",
      category: "gerunds",
      eiken: 3
    },
    {
      sentence: "Neither Tom nor his friends was there",
      isCorrect: false,
      correction: "Neither Tom nor his friends were there",
      errorType: "neither_nor_agreement",
      difficulty: 3,
      explanation: "neither...norでは後の主語に動詞を合わせます",
      category: "correlative_conjunctions",
      eiken: 3
    },
    {
      sentence: "I am looking forward to see you",
      isCorrect: false,
      correction: "I am looking forward to seeing you",
      errorType: "phrasal_verb_gerund",
      difficulty: 3,
      explanation: "look forward toの後は動名詞(-ing)を使います",
      category: "phrasal_verbs",
      eiken: 3
    },
    // 追加の英検3級レベル問題
    {
      sentence: "I enjoy to read books",
      isCorrect: false,
      correction: "I enjoy reading books",
      errorType: "gerund_infinitive",
      difficulty: 3,
      explanation: "enjoyの後は動名詞(-ing)を使います",
      category: "gerunds",
      eiken: 3
    },
    {
      sentence: "He suggested me to go there",
      isCorrect: false,
      correction: "He suggested that I go there",
      errorType: "suggest_structure",
      difficulty: 3,
      explanation: "suggestの後は直接人を目的語にできません",
      category: "verbs_patterns",
      eiken: 3
    },
    {
      sentence: "I have been living here for ten years",
      isCorrect: true,
      errorType: null,
      difficulty: 3,
      explanation: "正しい文です",
      category: "perfect_tenses",
      eiken: 3
    },
    {
      sentence: "Despite of the rain, we went out",
      isCorrect: false,
      correction: "Despite the rain, we went out",
      errorType: "despite_usage",
      difficulty: 3,
      explanation: "despiteの後にofは付けません",
      category: "prepositions",
      eiken: 3
    },
    {
      sentence: "I'm afraid of flying",
      isCorrect: true,
      errorType: null,
      difficulty: 3,
      explanation: "正しい文です",
      category: "gerunds",
      eiken: 3
    },
    {
      sentence: "He told to me the truth",
      isCorrect: false,
      correction: "He told me the truth",
      errorType: "verb_pattern",
      difficulty: 3,
      explanation: "tellは直接目的語を取ります",
      category: "verbs_patterns",
      eiken: 3
    },
    {
      sentence: "I'm interested in learning Spanish",
      isCorrect: true,
      errorType: null,
      difficulty: 3,
      explanation: "正しい文です",
      category: "gerunds",
      eiken: 3
    },
    {
      sentence: "Although he is young, but he is wise",
      isCorrect: false,
      correction: "Although he is young, he is wise",
      errorType: "conjunction_error",
      difficulty: 3,
      explanation: "althoughとbutは一緒に使えません",
      category: "conjunctions",
      eiken: 3
    },
    {
      sentence: "I prefer coffee than tea",
      isCorrect: false,
      correction: "I prefer coffee to tea",
      errorType: "prefer_to",
      difficulty: 3,
      explanation: "prefer A to Bの形を使います",
      category: "preferences",
      eiken: 3
    },
    {
      sentence: "She apologized for being late",
      isCorrect: true,
      errorType: null,
      difficulty: 3,
      explanation: "正しい文です",
      category: "gerunds",
      eiken: 3
    },
    // 英検準2級レベル
    {
      sentence: "I wish I was taller",
      isCorrect: false,
      correction: "I wish I were taller",
      errorType: "wish_subjunctive",
      difficulty: 4,
      explanation: "wishの後の仮定法ではwereを使います",
      category: "conditionals",
      eiken: "pre-2"
    },
    {
      sentence: "The house is being paint right now",
      isCorrect: false,
      correction: "The house is being painted right now",
      errorType: "passive_progressive",
      difficulty: 4,
      explanation: "受動態の進行形はis being + 過去分詞です",
      category: "passives",
      eiken: "pre-2"
    },
    {
      sentence: "I would rather you don't smoke here",
      isCorrect: false,
      correction: "I would rather you didn't smoke here",
      errorType: "would_rather_subjunctive",
      difficulty: 4,
      explanation: "would rather + 人 + 動詞の過去形を使います",
      category: "preferences",
      eiken: "pre-2"
    },
    {
      sentence: "Having been studied for years, he passed the exam",
      isCorrect: false,
      correction: "Having studied for years, he passed the exam",
      errorType: "perfect_participle",
      difficulty: 4,
      explanation: "能動態の場合はHaving + 過去分詞を使います",
      category: "participles",
      eiken: "pre-2"
    },
    {
      sentence: "I made him to do the work",
      isCorrect: false,
      correction: "I made him do the work",
      errorType: "causative_make",
      difficulty: 4,
      explanation: "makeの使役動詞では原形不定詞を使います",
      category: "causatives",
      eiken: "pre-2"
    }
  ],
  advancedQuestions: [
    // 英検2級レベル
    {
      sentence: "Having finished the work, he went home",
      isCorrect: true,
      errorType: null,
      difficulty: 5,
      explanation: "正しい文です",
      category: "participles",
      eiken: 2
    },
    {
      sentence: "Not only does he speak English, but also French",
      isCorrect: true,
      errorType: null,
      difficulty: 5,
      explanation: "正しい文です",
      category: "advanced_structures",
      eiken: 2
    },
    {
      sentence: "Should you need any help, please contact me",
      isCorrect: true,
      errorType: null,
      difficulty: 5,
      explanation: "正しい文です。Should you = If you shouldの倒置",
      category: "conditionals_inversion",
      eiken: 2
    },
    {
      sentence: "The more hard you study, the better you become",
      isCorrect: false,
      correction: "The harder you study, the better you become",
      errorType: "comparative_structure",
      difficulty: 5,
      explanation: "The + 比較級の構文では形容詞の比較級を使います",
      category: "comparatives",
      eiken: 2
    },
    {
      sentence: "Were it not for your help, I would fail",
      isCorrect: true,
      errorType: null,
      difficulty: 5,
      explanation: "正しい文です。Were it not for = If it were not forの倒置",
      category: "conditionals_inversion",
      eiken: 2
    },
    {
      sentence: "I can't help but to worry about him",
      isCorrect: false,
      correction: "I can't help but worry about him",
      errorType: "cant_help_but",
      difficulty: 5,
      explanation: "can't help butの後は動詞の原形を使います",
      category: "idioms",
      eiken: 2
    },
    {
      sentence: "So beautiful the sunset was that everyone stopped",
      isCorrect: false,
      correction: "So beautiful was the sunset that everyone stopped",
      errorType: "so_adjective_inversion",
      difficulty: 5,
      explanation: "So + 形容詞で始まる文では主語と動詞が倒置されます",
      category: "inversions",
      eiken: 2
    },
    // 英検準1級レベル
    {
      sentence: "Little did I know that he was famous",
      isCorrect: true,
      errorType: null,
      difficulty: 6,
      explanation: "正しい文です。否定的な副詞で始まる倒置文",
      category: "inversions",
      eiken: "pre-1"
    },
    {
      sentence: "I insist that he comes to the meeting",
      isCorrect: false,
      correction: "I insist that he come to the meeting",
      errorType: "subjunctive_that_clause",
      difficulty: 6,
      explanation: "insistの後のthat節では動詞の原形(仮定法現在)を使います",
      category: "subjunctives",
      eiken: "pre-1"
    },
    {
      sentence: "Try as he might, he couldn't solve the problem",
      isCorrect: true,
      errorType: null,
      difficulty: 6,
      explanation: "正しい文です。譲歩を表すas構文",
      category: "concessive_clauses",
      eiken: "pre-1"
    }
  ]
}

// Reactive State
const gameState = ref('ready')
const selectedLevel = ref('cadet')
const currentQuestions = ref([])
const currentQuestion = ref(null)
const questionIndex = ref(0)
const totalQuestions = ref(15)

// Game Stats
const score = ref(0)
const lives = ref(3)
const maxLives = ref(3)
const streak = ref(0)
const bestStreak = ref(0)
const combo = ref(1)
const feverMode = ref(false)
const gameTime = ref(0)

// Timing
const questionStartTime = ref(0)
const reactionTimes = ref([])
const showingAnswer = ref(false)
const lastJudgment = ref(null)
const autoTimer = ref(0)
const maxAutoTimer = ref(8) // 8秒で自動進行

// Game Intervals
let gameTimer = null
let feverTimer = null
let autoTimerInterval = null

// Computed
const currentLevel = computed(() => {
  return difficultyLevels.find(level => level.id === selectedLevel.value)
})

const currentLevelClass = computed(() => {
  return `level-${selectedLevel.value}`
})

const averageReactionTime = computed(() => {
  if (reactionTimes.value.length === 0) return 0
  const sum = reactionTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / reactionTimes.value.length)
})

const accuracy = computed(() => {
  if (reactionTimes.value.length === 0) return 0
  return Math.round((streak.value / questionIndex.value) * 100) || 0
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  lives.value = maxLives.value
  streak.value = 0
  combo.value = 1
  questionIndex.value = 0
  gameTime.value = 0
  reactionTimes.value = []
  feverMode.value = false

  const levelData = currentLevel.value
  let allQuestions = []

  // レベルに応じて適切な問題セットを選択（英検5級〜3級中心）
  if (selectedLevel.value === 'cadet') {
    // 初級者：英検5級レベル中心
    const beginnerQuestions = grammarQuestions.beginnerQuestions.filter(q => q.eiken === 5)
    const easyIntermediateQuestions = grammarQuestions.beginnerQuestions.filter(q => q.eiken === 4).slice(0, 5)
    allQuestions = [...beginnerQuestions, ...easyIntermediateQuestions]
    totalQuestions.value = Math.min(15, allQuestions.length)
  } else if (selectedLevel.value === 'ranger') {
    // 中級者：英検4級〜3級レベル
    const grade4Questions = grammarQuestions.beginnerQuestions.filter(q => q.eiken === 4)
    const grade3Questions = grammarQuestions.intermediateQuestions.filter(q => q.eiken === 3)
    allQuestions = [...grade4Questions, ...grade3Questions]
    totalQuestions.value = Math.min(20, allQuestions.length)
  } else {
    // 上級者：英検3級以上のミックス
    const questions = grammarQuestions[levelData.questions] || grammarQuestions.beginnerQuestions
    allQuestions = [...questions]
    totalQuestions.value = Math.min(25, allQuestions.length)
  }

  // カテゴリバランスを考慮したランダム選択
  currentQuestions.value = getBalancedQuestions(allQuestions, totalQuestions.value)

  startGameTimer()
  showNextQuestion()
}

// バランスの取れた問題選択（カテゴリ別に均等に選択）
const getBalancedQuestions = (questions, limit) => {
  // カテゴリ別にグループ化
  const categorizedQuestions = {}
  questions.forEach(q => {
    if (!categorizedQuestions[q.category]) {
      categorizedQuestions[q.category] = []
    }
    categorizedQuestions[q.category].push(q)
  })

  const categories = Object.keys(categorizedQuestions)
  const selectedQuestions = []
  let categoryIndex = 0

  // 各カテゴリから順番に選択
  while (selectedQuestions.length < limit && selectedQuestions.length < questions.length) {
    const currentCategory = categories[categoryIndex % categories.length]
    const availableQuestions = categorizedQuestions[currentCategory].filter(
      q => !selectedQuestions.includes(q)
    )

    if (availableQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length)
      selectedQuestions.push(availableQuestions[randomIndex])
    }

    categoryIndex++

    // 全カテゴリを一周したら、残りはランダムに選択
    if (categoryIndex >= categories.length * 2) {
      const remainingQuestions = questions.filter(q => !selectedQuestions.includes(q))
      while (selectedQuestions.length < limit && remainingQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingQuestions.length)
        selectedQuestions.push(remainingQuestions.splice(randomIndex, 1)[0])
      }
      break
    }
  }

  // 最終的にシャッフル
  return shuffleArray(selectedQuestions)
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const startGameTimer = () => {
  gameTimer = setInterval(() => {
    gameTime.value += 0.1
  }, 100)
}

const showNextQuestion = () => {
  if (questionIndex.value >= currentQuestions.value.length) {
    endGame()
    return
  }
  
  currentQuestion.value = currentQuestions.value[questionIndex.value]
  questionStartTime.value = Date.now()
  showingAnswer.value = false
  lastJudgment.value = null
  questionIndex.value++
}

const judgeAnswer = (userAnswer) => {
  if (showingAnswer.value) return
  
  const endTime = Date.now()
  const reactionTime = endTime - questionStartTime.value
  reactionTimes.value.push(reactionTime)
  
  const isCorrect = userAnswer === currentQuestion.value.isCorrect
  
  if (isCorrect) {
    handleCorrectAnswer(reactionTime)
  } else {
    handleWrongAnswer()
  }
  
  showingAnswer.value = true
  startAutoTimer()
}

// 自動タイマー開始
const startAutoTimer = () => {
  autoTimer.value = maxAutoTimer.value
  
  autoTimerInterval = setInterval(() => {
    autoTimer.value--
    
    if (autoTimer.value <= 0) {
      proceedToNext()
    }
  }, 1000)
}

// 次の問題へ進む
const proceedToNext = () => {
  clearInterval(autoTimerInterval)
  autoTimer.value = 0
  showNextQuestion()
}

const handleCorrectAnswer = (reactionTime) => {
  streak.value++
  bestStreak.value = Math.max(bestStreak.value, streak.value)
  
  let baseScore = 100
  if (reactionTime <= 500) {
    baseScore = 150
  }
  
  if (streak.value >= 5) {
    combo.value = Math.min(Math.floor(streak.value / 5) + 1, 5)
  }
  
  const finalScore = baseScore * combo.value
  score.value += finalScore
  
  if (streak.value >= 10 && !feverMode.value) {
    triggerFeverMode()
  }
  
  lastJudgment.value = {
    type: 'correct',
    message: reactionTime <= 500 ? '完璧な射撃！' : '敵を撃破！',
    time: reactionTime
  }
  
  // ネイティブ発音で正しい文を読み上げ
  if (currentQuestion.value.isCorrect) {
    speakNativeSentence(currentQuestion.value.sentence)
  }
  
  createCosmicParticles('victory')
}

const handleWrongAnswer = () => {
  lives.value--
  streak.value = 0
  combo.value = 1
  feverMode.value = false
  
  lastJudgment.value = {
    type: 'wrong',
    message: '宇宙船にダメージ！',
    time: 0
  }
  
  // ネイティブ発音で正しい答えを説明
  if (currentQuestion.value.correction) {
    setTimeout(() => {
      speakGrammarInstruction(currentQuestion.value.explanation)
      setTimeout(() => {
        speakNativeSentence(currentQuestion.value.correction)
      }, 2000)
    }, 1000)
  }
  
  createCosmicParticles('damage')
  
  if (lives.value <= 0) {
    endGame()
  }
}

const triggerFeverMode = () => {
  feverMode.value = true
  
  feverTimer = setTimeout(() => {
    feverMode.value = false
  }, 10000)
  
  createCosmicParticles('cosmic_fury')
}

// === ネイティブ発音機能 ===
const playQuestionAudio = async () => {
  if (currentQuestion.value) {
    await speakNativeSentence(currentQuestion.value.sentence)
  }
}

const createCosmicParticles = (type) => {
  if (!particleContainer.value) return
  
  const effects = {
    victory: { colors: ['#10b981', '#34d399', '#6ee7b7'], icon: '⭐' },
    damage: { colors: ['#ef4444', '#f87171', '#fca5a5'], icon: '💥' },
    cosmic_fury: { colors: ['#8b5cf6', '#a78bfa', '#c084fc'], icon: '⚡' }
  }
  
  const effect = effects[type] || effects.victory
  
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div')
    particle.className = 'cosmic-particle'
    particle.textContent = effect.icon
    particle.style.cssText = `
      position: absolute;
      font-size: 1.2rem;
      pointer-events: none;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      animation: cosmicExplosion 1.5s ease-out forwards;
    `
    
    const angle = (Math.PI * 2 * i) / 15
    const distance = 100 + Math.random() * 100
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    
    particle.style.setProperty('--x', `${x}px`)
    particle.style.setProperty('--y', `${y}px`)
    
    particleContainer.value.appendChild(particle)
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    }, 1500)
  }
}

const getFinalRank = () => {
  if (accuracy.value >= 95) return 'Cosmic Master'
  if (accuracy.value >= 85) return 'Star Commander'
  if (accuracy.value >= 75) return 'Galaxy Ranger'
  return 'Space Cadet'
}

const getRankClass = () => {
  if (accuracy.value >= 95) return 'rank-master'
  if (accuracy.value >= 85) return 'rank-commander'
  if (accuracy.value >= 75) return 'rank-ranger'
  return 'rank-cadet'
}

const endGame = () => {
  gameState.value = 'gameOver'
  clearInterval(gameTimer)
  clearTimeout(feverTimer)
  clearInterval(autoTimerInterval)
  
  emit('complete', {
    score: score.value,
    bestStreak: bestStreak.value,
    averageReactionTime: averageReactionTime.value,
    accuracy: accuracy.value,
    totalTime: gameTime.value,
    level: selectedLevel.value
  })
}

const restartGame = () => {
  gameState.value = 'ready'
}

// Particle Container
const particleContainer = ref(null)

// Keyboard support
const handleKeydown = (event) => {
  if (gameState.value !== 'playing' || showingAnswer.value) return
  
  if (event.code === 'ArrowLeft' || event.key === '1') {
    judgeAnswer(true)
    event.preventDefault()
  } else if (event.code === 'ArrowRight' || event.key === '2') {
    judgeAnswer(false)
    event.preventDefault()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearInterval(gameTimer)
  clearTimeout(feverTimer)
  clearInterval(autoTimerInterval)
})
</script>

<style scoped>
/* 統一宇宙テーマ CSS */
.grammar-reflex-arena.cosmic-theme {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1a1b3a 0%, #0a0a1a 70%, #000000 100%);
  color: #e2e8f0;
  padding: 0.5rem;
  position: relative;
  overflow-x: hidden;
  font-family: 'Orbitron', 'Inter', sans-serif;
}

/* 宇宙背景 */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}

.stars-field {
  position: absolute;
  width: 100%;
  height: 100%;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ffffff;
  border-radius: 50%;
  animation: starTwinkle 3s infinite;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.nebula-clouds {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 40%);
  animation: nebulaFloat 20s infinite linear;
}

@keyframes nebulaFloat {
  0% { transform: translateX(-10px) translateY(-5px); }
  50% { transform: translateX(10px) translateY(5px); }
  100% { transform: translateX(-10px) translateY(-5px); }
}

/* ヘッダー - 宇宙船コックピット */
.grammar-reflex-arena .cosmic-header {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 0.8rem;
  padding: 0.6rem 0.8rem !important;
  margin: 0.5rem auto 1rem auto !important;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: calc(100vw - 3rem) !important;
  width: calc(100vw - 3rem) !important;
}

.header-left {
  justify-self: start;
}

.header-center {
  justify-self: center;
}

.header-right {
  justify-self: end;
}

.grammar-reflex-arena .cosmic-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: center;
}

.cosmic-icon {
  font-size: 1.5rem;
  animation: iconPulse 2s infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.3); }
}

.title-text {
  text-align: center;
}

.title-text h1 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1f5f9;
  margin: 0;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: normal;
}

.cosmic-nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #374151, #4b5563);
  border: 1px solid #6b7280;
  color: #e5e7eb;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.cosmic-nav-button:hover {
  background: linear-gradient(135deg, #4b5563, #6b7280);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.grammar-reflex-arena .cosmic-status-panel {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-shrink: 1;
}

.ship-energy {
  text-align: center;
}

.energy-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.energy-hearts {
  display: flex;
  gap: 0.2rem;
}

.energy-core {
  font-size: 1.2rem;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
}

.energy-core.depleted {
  opacity: 0.3;
  filter: grayscale(1) drop-shadow(0 0 4px rgba(100, 100, 100, 0.3));
}

.cosmic-score {
  text-align: center;
}

.score-label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.2rem;
}

.score-value {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1f2937;
  padding: 0.4rem 0.8rem;
  border-radius: 0.8rem;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.score-icon {
  font-size: 1.2rem;
  animation: scoreShine 2s infinite;
}

@keyframes scoreShine {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(180deg); }
}

/* 宇宙ステータスバー */
.cosmic-status-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.status-item.streak {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-item.fever {
  background: rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(245, 158, 11, 0.5);
  animation: feverPulse 0.5s infinite alternate;
}

@keyframes feverPulse {
  0% { transform: scale(1); box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
  100% { transform: scale(1.05); box-shadow: 0 0 30px rgba(245, 158, 11, 0.8); }
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  font-weight: 500;
  color: #e2e8f0;
}

.level-indicator {
  margin-left: auto;
}

.level-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.level-badge.level-cadet {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.level-badge.level-ranger {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.level-badge.level-commander {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.level-badge.level-master {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

/* メインバトルエリア */
.cosmic-battle-area {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
}

.cosmic-panel {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 1.5rem;
  padding: 1.2rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 準備画面 */
.cosmic-hologram {
  text-align: center;
  position: relative;
}

.cosmic-hologram::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  border-radius: 1.5rem;
}


/* === 音声再生ボタンのスタイル === */
.transmission-audio {
  margin-top: 1rem;
  text-align: center;
}

.audio-button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.audio-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.audio-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.audio-button:hover::before {
  left: 100%;
}

.audio-button:active {
  transform: translateY(0);
}

.audio-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}


.difficulty-selector {
  margin-bottom: 1.2rem;
}

.difficulty-selector h3 {
  color: #e2e8f0;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.difficulty-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(71, 85, 105, 0.5);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.difficulty-btn:hover {
  border-color: rgba(99, 102, 241, 0.8);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.2);
}

.difficulty-btn.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
}

.difficulty-icon {
  font-size: 2rem;
}

.difficulty-name {
  font-weight: bold;
  color: #f1f5f9;
  font-size: 1.1rem;
}

.difficulty-desc {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.cosmic-start-button {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  color: white;
  padding: 1.5rem 3rem;
  border-radius: 1.5rem;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s ease, filter 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cosmic-start-button:hover {
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
  filter: brightness(1.1);
}

.button-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: buttonShine 2s infinite;
}

@keyframes buttonShine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* バトル画面 */
.battle-screen {
  min-height: 600px;
  position: relative;
}

/* 敵の攻撃ゾーン */
.enemy-attack-zone {
  margin-bottom: 2rem;
  position: relative;
}

.enemy-ship {
  text-align: center;
  margin-bottom: 1rem;
  position: relative;
}

.ship-body {
  font-size: 3rem;
  animation: enemyHover 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));
}

@keyframes enemyHover {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* 敵船の状態アニメーション */
.enemy-ship.destroyed {
  animation: enemyDestroy 1s ease-out;
}

.enemy-ship.attacking {
  animation: enemyAttack 1s ease-out;
}

@keyframes enemyDestroy {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(0.8) rotate(360deg); opacity: 0.3; }
}

@keyframes enemyAttack {
  0% { transform: scale(1); filter: brightness(1); }
  25% { transform: scale(1.1); filter: brightness(1.5) hue-rotate(90deg); }
  50% { transform: scale(1.2); filter: brightness(2) hue-rotate(180deg); }
  75% { transform: scale(1.1); filter: brightness(1.5) hue-rotate(270deg); }
  100% { transform: scale(1); filter: brightness(1.3) hue-rotate(360deg); }
}

/* 爆発エフェクト */
.explosion-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.explosion-particle {
  position: absolute;
  font-size: 2rem;
  animation: explode 1s ease-out forwards;
}

.explosion-particle:nth-child(1) { animation-delay: 0s; transform: rotate(0deg) translateX(0px); }
.explosion-particle:nth-child(2) { animation-delay: 0.1s; transform: rotate(45deg) translateX(0px); }
.explosion-particle:nth-child(3) { animation-delay: 0.2s; transform: rotate(90deg) translateX(0px); }
.explosion-particle:nth-child(4) { animation-delay: 0.3s; transform: rotate(135deg) translateX(0px); }
.explosion-particle:nth-child(5) { animation-delay: 0.1s; transform: rotate(180deg) translateX(0px); }
.explosion-particle:nth-child(6) { animation-delay: 0.2s; transform: rotate(225deg) translateX(0px); }
.explosion-particle:nth-child(7) { animation-delay: 0.3s; transform: rotate(270deg) translateX(0px); }
.explosion-particle:nth-child(8) { animation-delay: 0.4s; transform: rotate(315deg) translateX(0px); }

@keyframes explode {
  0% {
    transform: scale(0) translateX(0px);
    opacity: 1;
  }
  50% {
    transform: scale(1.5) translateX(60px);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) translateX(100px);
    opacity: 0;
  }
}

/* 敵の勝利エフェクト */
.enemy-victory-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.victory-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.3), transparent);
  border-radius: 50%;
  animation: victoryGlow 1s infinite alternate;
}

@keyframes victoryGlow {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 1; }
}

.damage-beam {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 6px;
  height: 200px;
  background: linear-gradient(180deg, #ef4444, #dc2626, transparent);
  transform: translateX(-50%);
  animation: damageBeam 1s ease-out;
}

@keyframes damageBeam {
  0% { height: 0px; opacity: 1; }
  50% { height: 200px; opacity: 1; }
  100% { height: 250px; opacity: 0; }
}

.attack-beam {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 4px;
  height: 100px;
  background: linear-gradient(180deg, #ef4444, transparent);
  transform: translateX(-50%);
  animation: beamPulse 1s infinite;
}

@keyframes beamPulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleY(1); }
  50% { opacity: 1; transform: translateX(-50%) scaleY(1.2); }
}

.grammar-transmission {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
  position: relative;
  transition: all 0.5s ease;
}

.grammar-transmission.answer-revealed {
  border-color: rgba(34, 197, 94, 0.8);
}

.grammar-transmission.correct-transmission {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.grammar-transmission.corrupted-transmission {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
}

.transmission-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.signal-strength {
  animation: signalBlink 1s infinite;
}

@keyframes signalBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.transmission-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f1f5f9;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  text-align: center;
}

.correction-data {
  font-size: 1.1rem;
  color: #22c55e;
  font-weight: 500;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(34, 197, 94, 0.3);
}

.data-label {
  color: #94a3b8;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.explanation-data {
  font-size: 1rem;
  color: #60a5fa;
  font-weight: 500;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.explanation-label {
  color: #60a5fa;
  font-size: 0.9rem;
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}

.explanation-text {
  color: #e2e8f0;
  line-height: 1.5;
  font-size: 1rem;
}

.battle-instruction {
  text-align: center;
  margin: 1rem 0;
}

.instruction-text {
  color: #fbbf24;
  font-size: 1.2rem;
  font-weight: bold;
  animation: instructionPulse 1s infinite;
}

@keyframes instructionPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.time-pressure {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 防御武器（判定ボタン） */
.defense-weapons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.weapon-button {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9));
  border: 2px solid rgba(71, 85, 105, 0.5);
  border-radius: 1.5rem;
  padding: 2rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.weapon-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.weapon-button:active {
  transform: translateY(-2px);
}

.correct-weapon {
  border-color: rgba(34, 197, 94, 0.5);
}

.correct-weapon:hover {
  border-color: #22c55e;
  box-shadow: 0 15px 40px rgba(34, 197, 94, 0.4);
}

.wrong-weapon {
  border-color: rgba(239, 68, 68, 0.5);
}

.wrong-weapon:hover {
  border-color: #ef4444;
  box-shadow: 0 15px 40px rgba(239, 68, 68, 0.4);
}

.weapon-core {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.3));
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6);
  animation: weaponCharge 2s infinite;
}

@keyframes weaponCharge {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.weapon-label {
  text-align: center;
}

.weapon-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.5rem;
}

.weapon-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1f5f9;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.weapon-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  display: block;
  margin-top: 0.25rem;
}

.weapon-energy {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent);
  animation: energyFlow 1.5s infinite;
}

@keyframes energyFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* バトル結果・ステータス */
.battle-status {
  text-align: center;
  margin: 2rem 0;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.cosmic-combo {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  border: 2px solid #c084fc;
  border-radius: 1rem;
  padding: 1rem 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.combo-core {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  position: relative;
  z-index: 2;
}

.combo-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: comboShine 1s infinite;
}

@keyframes comboShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.judgment-result {
  text-align: center;
}

.result-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.result-text.correct {
  color: #22c55e;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
}

.result-text.wrong {
  color: #ef4444;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}

.result-stats {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* 理解確認ボタンと自動タイマー */
.understanding-confirmation {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.cosmic-understand-button {
  background: linear-gradient(135deg, #10b981, #047857);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.cosmic-understand-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.understand-icon {
  font-size: 1.2rem;
}

.understand-text {
  font-weight: 600;
}

.auto-proceed-timer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.timer-text {
  margin-bottom: 0.5rem;
}

.timer-bar {
  width: 200px;
  height: 4px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  transition: width 1s linear;
}

/* ミッション進行状況 */
.mission-progress {
  margin-top: 2rem;
}

.progress-container {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.progress-label {
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cosmic-progress {
  position: relative;
  width: 100%;
  height: 12px;
  background: rgba(71, 85, 105, 0.3);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShine 2s infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-stars {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.progress-star {
  font-size: 1rem;
  color: #475569;
  transition: all 0.3s ease;
}

.progress-star.completed {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.8);
  animation: starComplete 0.5s ease-out;
}

@keyframes starComplete {
  0% { transform: scale(0.5) rotate(0deg); }
  50% { transform: scale(1.3) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.progress-text {
  text-align: center;
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ミッション完了画面 */
.mission-complete {
  text-align: center;
}

.completion-hologram h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f1f5f9;
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
}

.rank-display {
  margin-bottom: 2rem;
}

.rank-badge {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.rank-badge.rank-cadet {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.rank-badge.rank-ranger {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.rank-badge.rank-commander {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.rank-badge.rank-master {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  animation: masterGlow 2s infinite alternate;
}

@keyframes masterGlow {
  0% { box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4); }
  100% { box-shadow: 0 12px 40px rgba(139, 92, 246, 0.8); }
}

.battle-statistics {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  color: #f1f5f9;
  font-weight: bold;
  font-size: 1.3rem;
}

.mission-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cosmic-action-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cosmic-action-button.primary {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
}

.cosmic-action-button.secondary {
  background: linear-gradient(135deg, #374151, #4b5563);
  color: #e5e7eb;
}

.cosmic-action-button:hover {
  transform: translateY(-3px);
}

.cosmic-action-button.primary:hover {
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
}

.cosmic-action-button.secondary:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

/* パーティクルエフェクト */
.cosmic-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
}

.cosmic-particle {
  position: absolute;
  animation: cosmicExplosion 1.5s ease-out forwards;
}

@keyframes cosmicExplosion {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* コズミックフューリーモードエフェクト */
.cosmic-fury-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 999;
  animation: furyActivation 0.5s ease-out;
}

@keyframes furyActivation {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.fury-energy-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  animation: energyPulse 1s infinite alternate;
}

@keyframes energyPulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.6; transform: scale(1.05); }
}

.fury-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.fury-particle {
  position: absolute;
  font-size: 1.5rem;
  color: #8b5cf6;
  animation: furyFloat 3s linear infinite;
  left: var(--x, 0%);
  top: var(--y, 0%);
}

.fury-particle:nth-child(odd) {
  animation-direction: reverse;
}

@keyframes furyFloat {
  0% {
    transform: translateY(100vh) translateX(0px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .grammar-reflex-arena .cosmic-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    max-width: 95vw !important;
    width: 95vw !important;
    padding: 0.8rem !important;
  }
  
  .cosmic-status-panel {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cosmic-status-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .defense-weapons {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .weapon-button {
    min-height: 120px;
    padding: 1.5rem 1rem;
  }
  
  .difficulty-options {
    grid-template-columns: 1fr;
  }
  
  .mission-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cosmic-action-button {
    width: 100%;
    max-width: 300px;
  }
  
  .understanding-confirmation {
    margin-top: 1rem;
  }
  
  .cosmic-understand-button {
    width: 100%;
    max-width: 250px;
  }
}

@media (max-width: 480px) {
  .grammar-reflex-arena .cosmic-header {
    padding: 0.6rem !important;
    max-width: 98vw !important;
    width: 98vw !important;
  }
  
  .cosmic-title .title-text h1 {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.8rem;
  }
  
  .transmission-content {
    font-size: 1.2rem;
  }
  
  .weapon-button {
    min-height: 100px;
    padding: 1rem;
  }
  
  .weapon-icon {
    font-size: 1.5rem;
  }
  
  .weapon-name {
    font-size: 1rem;
  }
  
  .hologram-content h2 {
    font-size: 2rem;
  }
  
  .completion-hologram h2 {
    font-size: 2rem;
  }
  
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

/* アクセシビリティ */
.weapon-button:focus,
.cosmic-nav-button:focus,
.cosmic-start-button:focus,
.cosmic-action-button:focus,
.cosmic-understand-button:focus,
.difficulty-btn:focus {
  outline: 3px solid #fbbf24;
  outline-offset: 2px;
}

/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  .cosmic-header {
    border-width: 3px;
    background: #000;
  }
  
  .grammar-transmission {
    border-width: 3px;
  }
  
  .weapon-button {
    border-width: 3px;
  }
  
  .cosmic-panel {
    background: #000;
    border-width: 2px;
  }
}

/* モーション軽減対応 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .star {
    animation: none;
    opacity: 0.5;
  }
  
  .nebula-clouds {
    animation: none;
  }
  
  .cosmic-particle {
    animation: none;
    opacity: 0;
  }
}

/* プレイヤー宇宙船 */
.player-ship-zone {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  pointer-events: none;
}

.player-ship {
  position: relative;
  text-align: center;
  transition: all 0.5s ease;
}

.player-ship-body {
  font-size: 3rem;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.6));
  transition: all 0.5s ease;
}

.player-ship.ship-victorious {
  animation: playerVictory 1s ease-out;
}

.player-ship.ship-damaged {
  animation: playerDamage 1s ease-out;
}

@keyframes playerVictory {
  0% { transform: translateY(0px) scale(1); }
  25% { transform: translateY(-20px) scale(1.1); }
  50% { transform: translateY(-10px) scale(1.2); }
  75% { transform: translateY(-15px) scale(1.1); }
  100% { transform: translateY(0px) scale(1); }
}

@keyframes playerDamage {
  0% { transform: translateX(0px) rotate(0deg); }
  25% { transform: translateX(-10px) rotate(-5deg); }
  50% { transform: translateX(10px) rotate(5deg); }
  75% { transform: translateX(-5px) rotate(-2deg); }
  100% { transform: translateX(0px) rotate(0deg); }
}

/* 勝利ビーム */
.victory-beam {
  position: absolute;
  bottom: 100%;
  left: 50%;
  width: 8px;
  height: 200px;
  background: linear-gradient(0deg, #22c55e, #10b981, rgba(34, 197, 94, 0.3));
  transform: translateX(-50%);
  animation: victoryBeam 1s ease-out;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
}

@keyframes victoryBeam {
  0% { height: 0px; opacity: 1; }
  50% { height: 200px; opacity: 1; }
  100% { height: 250px; opacity: 0; }
}

/* ダメージエフェクト */
.damage-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.damage-spark {
  position: absolute;
  font-size: 1.5rem;
  color: #fbbf24;
  animation: sparkDamage 0.8s ease-out forwards;
}

.damage-spark:nth-child(1) { animation-delay: 0s; transform: rotate(0deg) translateX(0px); }
.damage-spark:nth-child(2) { animation-delay: 0.1s; transform: rotate(60deg) translateX(0px); }
.damage-spark:nth-child(3) { animation-delay: 0.2s; transform: rotate(120deg) translateX(0px); }
.damage-spark:nth-child(4) { animation-delay: 0.1s; transform: rotate(180deg) translateX(0px); }
.damage-spark:nth-child(5) { animation-delay: 0.2s; transform: rotate(240deg) translateX(0px); }
.damage-spark:nth-child(6) { animation-delay: 0.3s; transform: rotate(300deg) translateX(0px); }

@keyframes sparkDamage {
  0% {
    transform: scale(0) translateX(0px);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) translateX(40px);
    opacity: 1;
  }
  100% {
    transform: scale(0.3) translateX(60px);
    opacity: 0;
  }
}

/* カスタムスクロールバー */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}
</style>