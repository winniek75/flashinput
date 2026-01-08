<template>
  <div class="roleplay-theater">
    <!-- Galaxy Background -->
    <div class="galaxy-background">
      <div class="stars-layer stars-layer-1"></div>
      <div class="stars-layer stars-layer-2"></div>
      <div class="stars-layer stars-layer-3"></div>
    </div>

    <!-- Header -->
    <div class="game-header">
      <div class="header-left">
        <button @click="handleBack" class="back-btn">
          <span class="btn-icon">🏠</span>
          <span>戻る</span>
        </button>
      </div>
      <div class="header-center">
        <h1 class="game-title">🎭 ロールプレイ・シアター</h1>
        <p class="game-subtitle">宇宙演劇場でロールプレイを楽しもう！</p>
      </div>
      <div class="header-right">
        <div class="score-display">
          <span class="score-label">演技スコア</span>
          <span class="score-value">{{ totalScore }}</span>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <div v-if="gameState === 'menu'" class="menu-screen">
      <div class="menu-container">
        <div class="scenario-selection">
          <h3>シナリオを選択</h3>
          <div class="scenarios-grid">
            <button
              v-for="scenario in scenarios"
              :key="scenario.id"
              @click="selectScenario(scenario)"
              class="scenario-card"
              :class="{ locked: scenario.locked }"
              :disabled="scenario.locked"
            >
              <div class="scenario-icon">{{ scenario.icon }}</div>
              <div class="scenario-info">
                <h4>{{ scenario.name }}</h4>
                <p>{{ scenario.description }}</p>
                <div class="scenario-stats">
                  <span class="difficulty" :class="scenario.difficulty">
                    {{ getDifficultyLabel(scenario.difficulty) }}
                  </span>
                  <span class="vocab-count">{{ scenario.vocabularyCount }}語</span>
                </div>
              </div>
              <div class="scenario-status">
                <div v-if="scenario.locked" class="locked-badge">🔒</div>
                <div v-else class="play-badge">▶️</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="gameState === 'playing'" class="game-screen">
      <!-- Theater Stage -->
      <div class="theater-stage">
        <div class="stage-background" :class="currentScenario.theme">
          <div class="stage-lighting"></div>

          <!-- Character Area -->
          <div class="characters-area">
            <!-- Player Character -->
            <div class="player-character" :class="currentScenario.playerRole">
              <div class="character-avatar">{{ currentScenario.playerAvatar }}</div>
              <div class="character-name">あなた ({{ currentScenario.playerRoleName }})</div>
            </div>

            <!-- NPC Character -->
            <div class="npc-character" v-if="currentNPC">
              <div class="character-avatar">{{ currentNPC.avatar }}</div>
              <div class="character-name">{{ currentNPC.name }}</div>
            </div>
          </div>

          <!-- Dialog Area -->
          <div class="dialog-area">
            <div class="dialog-box" v-if="currentDialog">
              <div class="speaker-info">
                <span class="speaker-avatar">{{ currentDialog.speaker === 'npc' ? currentNPC.avatar : currentScenario.playerAvatar }}</span>
                <span class="speaker-name">{{ currentDialog.speaker === 'npc' ? currentNPC.name : 'あなた' }}</span>
              </div>
              <div class="dialog-text">{{ currentDialog.text }}</div>
              <button
                v-if="currentDialog.speaker === 'npc'"
                @click="playDialogAudio(currentDialog.text)"
                class="audio-btn"
              >
                🔊
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Interaction Panel -->
      <div class="interaction-panel">
        <div v-if="currentScene" class="scene-info">
          <h3>{{ currentScene.title }}</h3>
          <p>{{ currentScene.description }}</p>
          <div class="scene-progress">
            <span>シーン {{ currentSceneIndex + 1 }}/{{ currentScenario.scenes.length }}</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${((currentSceneIndex + 1) / currentScenario.scenes.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="scene-loading">
          <h3>シナリオを読み込み中...</h3>
          <p>ロールプレイの準備をしています</p>
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Game Instructions -->
        <div v-if="currentScene && !showChoices && !showFreeInput && !currentDialog" class="instructions-section">
          <div class="instruction-box">
            <h4>🎭 ロールプレイの準備</h4>
            <p>シーンが始まります。キャラクターとの会話を楽しんでください。</p>
            <button @click="loadScene" class="start-scene-btn">
              シーンを開始 →
            </button>
          </div>
        </div>

        <!-- Choice Selection -->
        <div v-if="showChoices" class="choices-section">
          <h4>{{ currentChoice.question }}</h4>
          <div class="choices-grid">
            <button
              v-for="(option, index) in currentChoice.options"
              :key="index"
              @click="selectChoice(option, index)"
              class="choice-btn"
              :class="{
                'correct': option.correct && showFeedback,
                'incorrect': !option.correct && showFeedback && selectedChoiceIndex === index
              }"
              :disabled="showFeedback"
            >
              <div class="choice-text">{{ option.text }}</div>
              <div class="choice-vocabulary" v-if="option.vocabulary">
                <span class="vocab-word">{{ option.vocabulary.word }}</span>
                <span class="vocab-meaning">{{ option.vocabulary.meaning }}</span>
              </div>
            </button>
          </div>

          <!-- Feedback -->
          <div v-if="showFeedback" class="feedback-section">
            <div class="feedback-message" :class="{ correct: lastChoiceCorrect, incorrect: !lastChoiceCorrect }">
              <span class="feedback-icon">{{ lastChoiceCorrect ? '✅' : '❌' }}</span>
              <span class="feedback-text">{{ feedbackMessage }}</span>
            </div>
            <button @click="continueStory" class="continue-btn">
              続ける →
            </button>
          </div>
        </div>

        <!-- Free Input Section -->
        <div v-if="showFreeInput" class="free-input-section">
          <h4>{{ currentFreeInput.prompt }}</h4>

          <!-- Hints Section -->
          <div class="hints-section" v-if="currentFreeInput.hints">
            <h5>💡 参考表現:</h5>
            <div class="hints-grid">
              <div
                v-for="(hint, index) in currentFreeInput.hints"
                :key="index"
                class="hint-item"
                @click="addHintToInput(hint)"
              >
                {{ hint }}
              </div>
            </div>
          </div>

          <div class="input-area">
            <textarea
              v-model="freeInputText"
              :placeholder="currentFreeInput.placeholder"
              class="free-input-textarea"
              rows="4"
            ></textarea>
            <div class="input-controls">
              <button @click="submitFreeInput" class="submit-btn" :disabled="!freeInputText.trim()">
                🎯 Submit Response
              </button>
              <button @click="clearInput" class="clear-btn">
                🔄 Clear
              </button>
            </div>
          </div>

          <!-- Character Counter -->
          <div class="character-counter">
            {{ freeInputText.length }}/200 characters
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="performance-panel">
          <div class="metric-item">
            <span class="metric-icon">🎯</span>
            <span class="metric-label">語彙精度</span>
            <span class="metric-value">{{ Math.round(vocabularyAccuracy) }}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-icon">🎭</span>
            <span class="metric-label">演技力</span>
            <span class="metric-value">{{ actingScore }}/10</span>
          </div>
          <div class="metric-item">
            <span class="metric-icon">💭</span>
            <span class="metric-label">創造性</span>
            <span class="metric-value">{{ creativityScore }}/10</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-else-if="gameState === 'results'" class="results-screen">
      <div class="results-container">
        <div class="results-header">
          <div class="results-stage">
            <div class="curtain-left"></div>
            <div class="performance-rating">
              <div class="rating-stars">
                <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= finalRating }">⭐</span>
              </div>
              <h2>{{ getRatingTitle(finalRating) }}</h2>
              <p>{{ getRatingMessage(finalRating) }}</p>
            </div>
            <div class="curtain-right"></div>
          </div>
        </div>

        <div class="detailed-results">
          <div class="results-categories">
            <div class="result-category">
              <h3>🎯 語彙精度</h3>
              <div class="category-score">{{ Math.round(vocabularyAccuracy) }}%</div>
              <div class="category-feedback">{{ getVocabularyFeedback() }}</div>
            </div>
            <div class="result-category">
              <h3>📝 文脈理解</h3>
              <div class="category-score">{{ Math.round(contextAccuracy) }}%</div>
              <div class="category-feedback">{{ getContextFeedback() }}</div>
            </div>
            <div class="result-category">
              <h3>🎭 演技力</h3>
              <div class="category-score">{{ actingScore }}/10</div>
              <div class="category-feedback">{{ getActingFeedback() }}</div>
            </div>
            <div class="result-category">
              <h3>💭 創造性</h3>
              <div class="category-score">{{ creativityScore }}/10</div>
              <div class="category-feedback">{{ getCreativityFeedback() }}</div>
            </div>
          </div>

          <div class="vocabulary-learned">
            <h3>📚 習得した語彙</h3>
            <div class="vocab-grid">
              <div
                v-for="vocab in learnedVocabulary"
                :key="vocab.word"
                class="vocab-item"
              >
                <span class="vocab-word">{{ vocab.word }}</span>
                <span class="vocab-meaning">{{ vocab.meaning }}</span>
                <span class="vocab-context">{{ vocab.context }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="replayScenario" class="replay-btn">
            <span class="btn-icon">🔄</span>
            <span>同じシナリオをもう一度</span>
          </button>
          <button @click="backToMenu" class="menu-btn">
            <span class="btn-icon">🎭</span>
            <span>他のシナリオを選ぶ</span>
          </button>
          <button @click="handleBack" class="exit-btn">
            <span class="btn-icon">🏠</span>
            <span>終了</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio ref="audioPlayer"></audio>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'RolePlayTheater',
  emits: ['back', 'complete'],
  setup(props, { emit }) {
    // Game State
    const gameState = ref('menu') // 'menu', 'playing', 'results'
    const currentScenario = ref(null)
    const currentSceneIndex = ref(0)
    const currentDialog = ref(null)
    const currentNPC = ref(null)
    const showChoices = ref(false)
    const showFreeInput = ref(false)
    const showFeedback = ref(false)
    const selectedChoiceIndex = ref(-1)
    const lastChoiceCorrect = ref(false)
    const feedbackMessage = ref('')
    const freeInputText = ref('')

    // Performance Tracking
    const vocabularyScore = ref(0)
    const contextScore = ref(0)
    const actingScore = ref(7)
    const creativityScore = ref(7)
    const totalQuestions = ref(0)
    const correctAnswers = ref(0)
    const learnedVocabulary = ref([])

    // Audio
    const audioPlayer = ref(null)

    // Scenarios Data
    const scenarios = ref([
      {
        id: 'hospital',
        name: '病院ドラマ',
        description: '医師・看護師として患者を診察',
        icon: '🏥',
        theme: 'hospital',
        difficulty: 'beginner',
        vocabularyCount: 15,
        locked: false,
        playerRole: 'doctor',
        playerRoleName: '医師',
        playerAvatar: '👨‍⚕️',
        vocabulary: [
          { word: 'doctor', meaning: '医師', context: 'hospital' },
          { word: 'nurse', meaning: '看護師', context: 'hospital' },
          { word: 'patient', meaning: '患者', context: 'hospital' },
          { word: 'medicine', meaning: '薬', context: 'hospital' },
          { word: 'thermometer', meaning: '体温計', context: 'hospital' },
          { word: 'stethoscope', meaning: '聴診器', context: 'hospital' },
          { word: 'fever', meaning: '熱', context: 'hospital' },
          { word: 'headache', meaning: '頭痛', context: 'hospital' },
          { word: 'cough', meaning: '咳', context: 'hospital' },
          { word: 'prescription', meaning: '処方箋', context: 'hospital' },
          { word: 'checkup', meaning: '健康診断', context: 'hospital' },
          { word: 'symptoms', meaning: '症状', context: 'hospital' },
          { word: 'treatment', meaning: '治療', context: 'hospital' },
          { word: 'appointment', meaning: '予約', context: 'hospital' },
          { word: 'emergency', meaning: '緊急事態', context: 'hospital' }
        ],
        npcs: [
          { id: 'patient1', name: 'タナカさん', avatar: '🤒', role: 'patient' },
          { id: 'nurse1', name: 'サトウ看護師', avatar: '👩‍⚕️', role: 'nurse' }
        ],
        scenes: [
          {
            id: 'scene1',
            title: '初診受付',
            description: '新しい患者さんが来院しました',
            npcs: ['patient1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'npc',
                text: 'こんにちは、先生。今日は頭痛がひどくて来ました。'
              },
              {
                type: 'choice',
                question: '患者さんにどのように応答しますか？',
                options: [
                  {
                    text: 'いつから頭痛が始まりましたか？',
                    vocabulary: { word: 'headache', meaning: '頭痛' },
                    correct: true,
                    feedback: '適切な質問です。症状について詳しく聞くことが大切です。'
                  },
                  {
                    text: '薬を処方しましょう。',
                    vocabulary: { word: 'prescription', meaning: '処方箋' },
                    correct: false,
                    feedback: 'まずは症状を詳しく聞いてから診断する必要があります。'
                  },
                  {
                    text: '体温を測ってください。',
                    vocabulary: { word: 'thermometer', meaning: '体温計' },
                    correct: false,
                    feedback: 'まずは患者さんの話を聞くことから始めましょう。'
                  }
                ]
              }
            ]
          },
          {
            id: 'scene2',
            title: '診察',
            description: '患者さんの症状を詳しく調べます',
            npcs: ['patient1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'npc',
                text: '3日前から頭痛が続いています。熱もあるような気がします。'
              },
              {
                type: 'choice',
                question: '次に何をしますか？',
                options: [
                  {
                    text: '体温計で熱を測りましょう。',
                    vocabulary: { word: 'thermometer', meaning: '体温計' },
                    correct: true,
                    feedback: '正解です。発熱の確認は重要な診察項目です。'
                  },
                  {
                    text: 'すぐに薬を出しましょう。',
                    vocabulary: { word: 'medicine', meaning: '薬' },
                    correct: false,
                    feedback: 'まずは正確な診断が必要です。'
                  },
                  {
                    text: '様子を見ましょう。',
                    vocabulary: { word: 'symptoms', meaning: '症状' },
                    correct: false,
                    feedback: '患者さんが心配して来院されているので、きちんと診察しましょう。'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'restaurant',
        name: 'レストランシアター',
        description: 'ウェイターとしてお客様をおもてなし',
        icon: '🍽️',
        theme: 'restaurant',
        difficulty: 'intermediate',
        vocabularyCount: 18,
        locked: false,
        playerRole: 'waiter',
        playerRoleName: 'ウェイター',
        playerAvatar: '👨‍🍳',
        vocabulary: [
          { word: 'waiter', meaning: 'ウェイター', context: 'restaurant' },
          { word: 'menu', meaning: 'メニュー', context: 'restaurant' },
          { word: 'order', meaning: '注文', context: 'restaurant' },
          { word: 'appetizer', meaning: '前菜', context: 'restaurant' },
          { word: 'main course', meaning: 'メインディッシュ', context: 'restaurant' },
          { word: 'dessert', meaning: 'デザート', context: 'restaurant' },
          { word: 'beverage', meaning: '飲み物', context: 'restaurant' },
          { word: 'bill', meaning: '会計', context: 'restaurant' },
          { word: 'tip', meaning: 'チップ', context: 'restaurant' },
          { word: 'reservation', meaning: '予約', context: 'restaurant' },
          { word: 'special', meaning: '特別料理', context: 'restaurant' },
          { word: 'ingredient', meaning: '材料', context: 'restaurant' },
          { word: 'allergic', meaning: 'アレルギー', context: 'restaurant' },
          { word: 'vegetarian', meaning: 'ベジタリアン', context: 'restaurant' },
          { word: 'recommendation', meaning: 'おすすめ', context: 'restaurant' },
          { word: 'chef', meaning: 'シェフ', context: 'restaurant' },
          { word: 'kitchen', meaning: 'キッチン', context: 'restaurant' },
          { word: 'table', meaning: 'テーブル', context: 'restaurant' }
        ],
        npcs: [
          { id: 'customer1', name: 'お客様', avatar: '👤', role: 'customer' },
          { id: 'chef1', name: 'シェフ', avatar: '👨‍🍳', role: 'chef' }
        ],
        scenes: [
          {
            id: 'scene1',
            title: 'お客様のお出迎え',
            description: '新しいお客様がいらっしゃいました',
            npcs: ['customer1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'npc',
                text: 'こんばんは。2名で予約をしているタナカです。'
              },
              {
                type: 'choice',
                question: 'どのように応答しますか？',
                options: [
                  {
                    text: 'いらっしゃいませ。ご予約を確認いたします。',
                    vocabulary: { word: 'reservation', meaning: '予約' },
                    correct: true,
                    feedback: '丁寧で適切な接客です。'
                  },
                  {
                    text: 'どちらのテーブルがお好みですか？',
                    vocabulary: { word: 'table', meaning: 'テーブル' },
                    correct: false,
                    feedback: 'まずは予約の確認から始めましょう。'
                  },
                  {
                    text: 'メニューをお持ちしましょう。',
                    vocabulary: { word: 'menu', meaning: 'メニュー' },
                    correct: false,
                    feedback: '席にご案内してからメニューをお渡しします。'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'school',
        name: 'スクール・アドベンチャー',
        description: '先生として生徒たちを指導',
        icon: '🏫',
        theme: 'school',
        difficulty: 'intermediate',
        vocabularyCount: 16,
        locked: false,
        playerRole: 'teacher',
        playerRoleName: '先生',
        playerAvatar: '👨‍🏫',
        vocabulary: [
          { word: 'teacher', meaning: '先生', context: 'school' },
          { word: 'student', meaning: '生徒', context: 'school' },
          { word: 'classroom', meaning: '教室', context: 'school' },
          { word: 'homework', meaning: '宿題', context: 'school' },
          { word: 'test', meaning: 'テスト', context: 'school' },
          { word: 'presentation', meaning: '発表', context: 'school' },
          { word: 'assignment', meaning: '課題', context: 'school' },
          { word: 'grade', meaning: '成績', context: 'school' },
          { word: 'lesson', meaning: '授業', context: 'school' },
          { word: 'textbook', meaning: '教科書', context: 'school' },
          { word: 'notebook', meaning: 'ノート', context: 'school' },
          { word: 'pencil', meaning: '鉛筆', context: 'school' },
          { word: 'whiteboard', meaning: 'ホワイトボード', context: 'school' },
          { word: 'subject', meaning: '科目', context: 'school' },
          { word: 'schedule', meaning: '時間割', context: 'school' },
          { word: 'recess', meaning: '休み時間', context: 'school' }
        ],
        npcs: [
          { id: 'student1', name: 'ヤマダ君', avatar: '👦', role: 'student' },
          { id: 'student2', name: 'スズキさん', avatar: '👧', role: 'student' }
        ],
        scenes: [
          {
            id: 'scene1',
            title: '授業開始',
            description: '今日の英語の授業を始めます',
            npcs: ['student1', 'student2'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'player',
                text: 'おはようございます。今日は新しい単語を学習しましょう。'
              },
              {
                type: 'choice',
                question: '生徒が質問してきました。どう答えますか？',
                options: [
                  {
                    text: '教科書の10ページを開いてください。',
                    vocabulary: { word: 'textbook', meaning: '教科書' },
                    correct: true,
                    feedback: '明確な指示で良いですね。'
                  },
                  {
                    text: '宿題は終わりましたか？',
                    vocabulary: { word: 'homework', meaning: '宿題' },
                    correct: false,
                    feedback: 'まずは今日の授業内容から始めましょう。'
                  },
                  {
                    text: 'テストの準備をしてください。',
                    vocabulary: { word: 'test', meaning: 'テスト' },
                    correct: false,
                    feedback: '授業の流れを考えて発言しましょう。'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'shopping',
        name: 'ショッピング・エクスペリエンス',
        description: '店員としてお客様をサポート',
        icon: '🛍️',
        theme: 'shopping',
        difficulty: 'advanced',
        vocabularyCount: 20,
        locked: true,
        playerRole: 'shopkeeper',
        playerRoleName: '店員',
        playerAvatar: '👨‍💼',
        vocabulary: [
          { word: 'cashier', meaning: 'レジ係', context: 'shopping' },
          { word: 'receipt', meaning: 'レシート', context: 'shopping' },
          { word: 'discount', meaning: '割引', context: 'shopping' },
          { word: 'size', meaning: 'サイズ', context: 'shopping' },
          { word: 'color', meaning: '色', context: 'shopping' },
          { word: 'price', meaning: '価格', context: 'shopping' },
          { word: 'credit card', meaning: 'クレジットカード', context: 'shopping' },
          { word: 'cash', meaning: '現金', context: 'shopping' },
          { word: 'exchange', meaning: '交換', context: 'shopping' },
          { word: 'refund', meaning: '返金', context: 'shopping' },
          { word: 'fitting room', meaning: '試着室', context: 'shopping' },
          { word: 'sale', meaning: 'セール', context: 'shopping' },
          { word: 'customer', meaning: 'お客様', context: 'shopping' },
          { word: 'store', meaning: 'お店', context: 'shopping' },
          { word: 'product', meaning: '商品', context: 'shopping' },
          { word: 'brand', meaning: 'ブランド', context: 'shopping' },
          { word: 'quality', meaning: '品質', context: 'shopping' },
          { word: 'warranty', meaning: '保証', context: 'shopping' },
          { word: 'shopping bag', meaning: '買い物袋', context: 'shopping' },
          { word: 'barcode', meaning: 'バーコード', context: 'shopping' }
        ],
        npcs: [
          { id: 'shopper1', name: 'お客様', avatar: '👤', role: 'customer' }
        ],
        scenes: [
          {
            id: 'scene1',
            title: 'お客様のお出迎え',
            description: 'お客様がお店に入ってきました',
            npcs: ['shopper1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'npc',
                text: 'すみません、この商品のサイズはありますか？'
              },
              {
                type: 'freeInput',
                prompt: 'お客様への適切な英語での対応を入力してください',
                placeholder: 'Welcome! Let me check that for you...',
                expectedKeywords: ['welcome', 'check', 'help', 'size', 'available'],
                hints: [
                  'Welcome to our store!',
                  'Let me check that for you.',
                  'How can I help you today?'
                ],
                feedback: {
                  excellent: 'Perfect! Professional customer service in English.',
                  good: 'Good response! Try to be more polite.',
                  needsImprovement: 'Try using more polite expressions like "Welcome" or "How may I help you?"'
                }
              }
            ]
          },
          {
            id: 'scene2',
            title: 'サイズ確認',
            description: 'お客様の要望に応えます',
            npcs: ['shopper1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'player',
                text: 'どちらのサイズをお探しでしょうか？'
              },
              {
                type: 'dialog',
                speaker: 'npc',
                text: 'Mサイズはありますか？それと、この色の違うバージョンも見せてください。'
              },
              {
                type: 'freeInput',
                prompt: 'お客様の質問に英語で適切に答えてください',
                placeholder: 'Let me check our inventory for size M...',
                expectedKeywords: ['check', 'size', 'medium', 'color', 'available', 'moment'],
                hints: [
                  'Let me check our inventory.',
                  'What size are you looking for?',
                  'I\'ll check if we have that in size M.',
                  'Would you like to see different colors?'
                ],
                feedback: {
                  excellent: 'Excellent! You handled the customer inquiry professionally.',
                  good: 'Good response! Consider offering to check inventory.',
                  needsImprovement: 'Try to acknowledge their request more clearly and offer to help.'
                }
              }
            ]
          },
          {
            id: 'scene3',
            title: 'お会計',
            description: 'お客様が商品を購入されます',
            npcs: ['shopper1'],
            interactions: [
              {
                type: 'dialog',
                speaker: 'npc',
                text: 'こちらを購入します。カードで支払えますか？'
              },
              {
                type: 'freeInput',
                prompt: '支払い方法について英語で案内してください',
                placeholder: 'Yes, we accept credit cards...',
                expectedKeywords: ['accept', 'credit', 'card', 'cash', 'payment', 'method'],
                hints: [
                  'Yes, we accept credit cards.',
                  'We take both cash and cards.',
                  'What payment method would you prefer?',
                  'You can pay by card or cash.'
                ],
                feedback: {
                  excellent: 'Perfect! Clear and professional payment information.',
                  good: 'Good! Try to mention both payment options available.',
                  needsImprovement: 'Remember to clearly explain the payment methods we accept.'
                }
              }
            ]
          }
        ]
      }
    ])

    // Computed Properties
    const currentScene = computed(() => {
      if (!currentScenario.value || !currentScenario.value.scenes[currentSceneIndex.value]) {
        return null
      }
      return currentScenario.value.scenes[currentSceneIndex.value]
    })

    const currentChoice = ref(null)
    const currentFreeInput = ref(null)

    const vocabularyAccuracy = computed(() => {
      return totalQuestions.value > 0 ? (correctAnswers.value / totalQuestions.value) * 100 : 0
    })

    const contextAccuracy = computed(() => {
      return vocabularyAccuracy.value // Simplified for now
    })

    const totalScore = computed(() => {
      return Math.round(
        (vocabularyAccuracy.value * 0.4) +
        (contextAccuracy.value * 0.3) +
        (actingScore.value * 10 * 0.2) +
        (creativityScore.value * 10 * 0.1)
      )
    })

    const finalRating = computed(() => {
      const score = totalScore.value
      if (score >= 90) return 5
      if (score >= 80) return 4
      if (score >= 70) return 3
      if (score >= 60) return 2
      return 1
    })

    // Methods
    const selectScenario = (scenario) => {
      if (scenario.locked) return

      currentScenario.value = scenario
      currentSceneIndex.value = 0
      resetPerformanceMetrics()
      startScenario()
    }

    const startScenario = () => {
      gameState.value = 'playing'
      // Add a small delay to ensure UI is ready
      setTimeout(() => {
        loadScene()
      }, 500)
    }

    const loadScene = () => {
      if (!currentScene.value) {
        endScenario()
        return
      }

      // Set NPCs for this scene
      if (currentScene.value.npcs && currentScene.value.npcs.length > 0) {
        const npcId = currentScene.value.npcs[0]
        currentNPC.value = currentScenario.value.npcs.find(npc => npc.id === npcId)
      }

      // Start scene interactions
      processSceneInteractions()
    }

    const processSceneInteractions = () => {
      const interactions = currentScene.value.interactions
      let interactionIndex = 0

      const processNextInteraction = () => {
        if (interactionIndex >= interactions.length) {
          nextScene()
          return
        }

        const interaction = interactions[interactionIndex]

        if (interaction.type === 'dialog') {
          currentDialog.value = interaction
          showChoices.value = false
          showFreeInput.value = false
          setTimeout(() => {
            interactionIndex++
            processNextInteraction()
          }, 2000)
        } else if (interaction.type === 'choice') {
          currentChoice.value = interaction
          showChoices.value = true
          showFreeInput.value = false
          currentDialog.value = null
          // Wait for user choice
        } else if (interaction.type === 'freeInput') {
          currentFreeInput.value = interaction
          showFreeInput.value = true
          showChoices.value = false
          currentDialog.value = null
          // Wait for user input
        }
      }

      processNextInteraction()
    }

    const selectChoice = (option, index) => {
      selectedChoiceIndex.value = index
      lastChoiceCorrect.value = option.correct
      feedbackMessage.value = option.feedback
      showFeedback.value = true

      // Update performance metrics
      totalQuestions.value++
      if (option.correct) {
        correctAnswers.value++
        vocabularyScore.value += 10
      }

      // Add vocabulary to learned list
      if (option.vocabulary) {
        const existingVocab = learnedVocabulary.value.find(v => v.word === option.vocabulary.word)
        if (!existingVocab) {
          learnedVocabulary.value.push({
            ...option.vocabulary,
            context: currentScenario.value.theme
          })
        }
      }

      // Update acting score based on choice appropriateness
      if (option.correct) {
        actingScore.value = Math.min(10, actingScore.value + 0.5)
      } else {
        actingScore.value = Math.max(1, actingScore.value - 0.3)
      }
    }

    const submitFreeInput = () => {
      const input = freeInputText.value.trim().toLowerCase()
      if (!input) return

      const currentInput = currentFreeInput.value
      const expectedKeywords = currentInput.expectedKeywords || []
      const feedback = currentInput.feedback || {}

      // Check if input is in English (basic check)
      const hasEnglishWords = expectedKeywords.some(keyword => input.includes(keyword.toLowerCase()))
      const wordCount = input.split(' ').length
      const isReasonableLength = wordCount >= 3 && wordCount <= 30

      // Calculate scores
      let keywordScore = 0
      expectedKeywords.forEach(keyword => {
        if (input.includes(keyword.toLowerCase())) {
          keywordScore += 1
        }
      })

      const keywordPercentage = expectedKeywords.length > 0 ? (keywordScore / expectedKeywords.length) * 100 : 0

      // Provide feedback
      let feedbackMessage = ''
      let scoreIncrease = 0

      if (!isReasonableLength) {
        feedbackMessage = 'Please provide a more complete response in English.'
        scoreIncrease = 1
      } else if (keywordPercentage >= 70) {
        feedbackMessage = feedback.excellent || 'Excellent English response!'
        scoreIncrease = 10
        vocabularyScore.value += 15
        actingScore.value = Math.min(10, actingScore.value + 1)
      } else if (keywordPercentage >= 40) {
        feedbackMessage = feedback.good || 'Good effort! Try to include more key vocabulary.'
        scoreIncrease = 7
        vocabularyScore.value += 10
        actingScore.value = Math.min(10, actingScore.value + 0.5)
      } else {
        feedbackMessage = feedback.needsImprovement || 'Try using more appropriate English expressions.'
        scoreIncrease = 3
        vocabularyScore.value += 5
      }

      // Update performance metrics
      totalQuestions.value++
      if (keywordPercentage >= 50) {
        correctAnswers.value++
      }

      // Creativity scoring based on input quality
      const creativityBonus = Math.min(2, wordCount / 8)
      creativityScore.value = Math.min(10, creativityScore.value + creativityBonus)

      // Show feedback to user
      feedbackMessage.value = feedbackMessage
      showFeedback.value = true
      lastChoiceCorrect.value = keywordPercentage >= 50

      freeInputText.value = ''
      showFreeInput.value = false
    }

    const addHintToInput = (hint) => {
      if (freeInputText.value.trim()) {
        freeInputText.value += ' ' + hint
      } else {
        freeInputText.value = hint
      }
    }

    const clearInput = () => {
      freeInputText.value = ''
    }

    const continueStory = () => {
      showFeedback.value = false
      showChoices.value = false
      showFreeInput.value = false
      nextScene()
    }

    const nextScene = () => {
      currentSceneIndex.value++
      if (currentSceneIndex.value >= currentScenario.value.scenes.length) {
        endScenario()
      } else {
        loadScene()
      }
    }

    const endScenario = () => {
      gameState.value = 'results'
    }

    const resetPerformanceMetrics = () => {
      vocabularyScore.value = 0
      contextScore.value = 0
      actingScore.value = 7
      creativityScore.value = 7
      totalQuestions.value = 0
      correctAnswers.value = 0
      learnedVocabulary.value = []
    }

    const playDialogAudio = (text) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      }
    }

    const replayScenario = () => {
      if (currentScenario.value) {
        selectScenario(currentScenario.value)
      }
    }

    const backToMenu = () => {
      gameState.value = 'menu'
      currentScenario.value = null
    }

    const handleBack = () => {
      emit('back')
    }

    // Helper Methods
    const getDifficultyLabel = (difficulty) => {
      const labels = {
        beginner: '初級',
        intermediate: '中級',
        advanced: '上級'
      }
      return labels[difficulty] || '不明'
    }

    const getRatingTitle = (rating) => {
      const titles = {
        5: '演技界の新星！',
        4: '素晴らしい演技力！',
        3: '良い演技でした！',
        2: 'もう少し練習が必要',
        1: '基礎から練習しましょう'
      }
      return titles[rating] || '頑張りましょう'
    }

    const getRatingMessage = (rating) => {
      const messages = {
        5: 'あなたの演技は観客を魅了しました！プロの俳優になれるかも？',
        4: '自然で説得力のある演技でした。語彙も適切に使えています。',
        3: 'バランスの取れた良い演技でした。継続すれば必ず上達します。',
        2: 'まずまずの演技でしたが、語彙の使い方を練習しましょう。',
        1: '演技の基礎から練習することをお勧めします。'
      }
      return messages[rating] || '練習を続けましょう'
    }

    const getVocabularyFeedback = () => {
      const accuracy = vocabularyAccuracy.value
      if (accuracy >= 90) return '完璧な語彙選択でした！'
      if (accuracy >= 80) return '適切な語彙を選択できています。'
      if (accuracy >= 70) return 'ほぼ正しい語彙選択でした。'
      if (accuracy >= 60) return '語彙の理解をもう少し深めましょう。'
      return '語彙の基礎練習が必要です。'
    }

    const getContextFeedback = () => {
      const accuracy = contextAccuracy.value
      if (accuracy >= 90) return '場面に完全に適した応答でした。'
      if (accuracy >= 80) return '文脈をよく理解できています。'
      if (accuracy >= 70) return '場面理解は良好です。'
      if (accuracy >= 60) return '文脈理解をもう少し練習しましょう。'
      return '場面に応じた応答の練習が必要です。'
    }

    const getActingFeedback = () => {
      if (actingScore.value >= 9) return 'プロ級の演技力です！'
      if (actingScore.value >= 8) return '非常に自然な演技でした。'
      if (actingScore.value >= 7) return '良い演技でした。'
      if (actingScore.value >= 6) return '演技力を向上させましょう。'
      return '演技の基礎練習をお勧めします。'
    }

    const getCreativityFeedback = () => {
      if (creativityScore.value >= 9) return '非常に創造的でユニークでした！'
      if (creativityScore.value >= 8) return '創造性豊かな表現でした。'
      if (creativityScore.value >= 7) return '適度な創造性がありました。'
      if (creativityScore.value >= 6) return 'もう少し創造的な表現を試してみましょう。'
      return '創造性を発揮する練習をしましょう。'
    }

    return {
      gameState,
      scenarios,
      currentScenario,
      currentScene,
      currentSceneIndex,
      currentDialog,
      currentNPC,
      currentChoice,
      currentFreeInput,
      showChoices,
      showFreeInput,
      showFeedback,
      selectedChoiceIndex,
      lastChoiceCorrect,
      feedbackMessage,
      freeInputText,
      vocabularyAccuracy,
      contextAccuracy,
      actingScore,
      creativityScore,
      totalScore,
      finalRating,
      learnedVocabulary,
      audioPlayer,
      selectScenario,
      selectChoice,
      submitFreeInput,
      addHintToInput,
      clearInput,
      continueStory,
      playDialogAudio,
      replayScenario,
      backToMenu,
      handleBack,
      getDifficultyLabel,
      getRatingTitle,
      getRatingMessage,
      getVocabularyFeedback,
      getContextFeedback,
      getActingFeedback,
      getCreativityFeedback
    }
  }
}
</script>

<style scoped>
.roleplay-theater {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #0d1421 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Galaxy Background Animation */
.galaxy-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: 200px 200px;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, #eee, transparent),
                    radial-gradient(1px 1px at 50px 50px, #eee, transparent);
  animation: stars-move 200s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(3px 3px at 50px 160px, #ddd, transparent),
                    radial-gradient(1px 1px at 100px 40px, #fff, transparent);
  animation: stars-move 300s linear infinite;
}

.stars-layer-3 {
  background-image: radial-gradient(2px 2px at 130px 80px, #fff, transparent);
  animation: stars-move 400s linear infinite;
}

@keyframes stars-move {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

/* Header */
.game-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 1rem;
}

.header-left {
  justify-self: start;
}

.header-right {
  justify-self: end;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(33, 150, 243, 0.2);
  border: 2px solid #2196f3;
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.back-btn:hover {
  background: rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
}

.game-title {
  font-size: clamp(1rem, 4vw, 1.8rem);
  margin: 0;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.header-center {
  text-align: center;
  justify-self: center;
  min-width: 0;
}

.game-subtitle {
  margin: 0.25rem 0 0 0;
  color: #b3e5fc;
  font-size: 0.85rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 1rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
  backdrop-filter: blur(5px);
  flex-shrink: 0;
}

.score-label {
  font-size: 0.75rem;
  color: #b3e5fc;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffd700;
}

/* Menu Screen */
.menu-screen {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 2rem;
}

.menu-container {
  max-width: 1000px;
  text-align: center;
}

.scenario-selection {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}


.scenario-selection h3 {
  color: #64b5f6;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  text-align: center;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.scenario-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  backdrop-filter: blur(5px);
}

.scenario-card:hover:not(.locked) {
  transform: translateY(-3px);
  border-color: #64b5f6;
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.2);
}

.scenario-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.scenario-icon {
  font-size: 2rem;
  flex-shrink: 0;
}


.scenario-info {
  text-align: center;
  width: 100%;
}

.scenario-info h4 {
  margin: 0 0 0.5rem 0;
  color: #ffd700;
  font-size: 1rem;
}

.scenario-info p {
  margin: 0 0 0.5rem 0;
  color: #b3e5fc;
  font-size: 0.8rem;
  line-height: 1.3;
}

.scenario-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.75rem;
}

.difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.difficulty.beginner {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.difficulty.intermediate {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.difficulty.advanced {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.vocab-count {
  color: #87ceeb;
}

.scenario-status {
  flex-shrink: 0;
  font-size: 1.2rem;
}

/* Game Screen */
.game-screen {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-bottom: 2rem;
}

.scene-loading {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.scene-loading h3 {
  color: #64b5f6;
  margin-bottom: 1rem;
}

.scene-loading p {
  color: #b3e5fc;
  margin-bottom: 2rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(100, 181, 246, 0.3);
  border-top: 3px solid #64b5f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.instructions-section {
  padding: 1.5rem;
  background: rgba(100, 181, 246, 0.1);
  border-radius: 1rem;
  border: 2px solid rgba(100, 181, 246, 0.3);
  margin-bottom: 1rem;
}

.instruction-box {
  text-align: center;
}

.instruction-box h4 {
  color: #64b5f6;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.instruction-box p {
  color: #b3e5fc;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.start-scene-btn {
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.start-scene-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(100, 181, 246, 0.4);
}

/* Enhanced Free Input Section */
.free-input-section {
  background: rgba(100, 181, 246, 0.1);
  border: 2px solid rgba(100, 181, 246, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.free-input-section h4 {
  color: #64b5f6;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;
}

.hints-section {
  margin-bottom: 1rem;
}

.hints-section h5 {
  color: #42a5f5;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.hints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.hint-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  text-align: center;
  color: #e3f2fd;
}

.hint-item:hover {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
  transform: translateY(-1px);
}

.free-input-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(100, 181, 246, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  color: white;
  font-size: 1rem;
  line-height: 1.4;
  resize: vertical;
  min-height: 80px;
}

.free-input-textarea:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 10px rgba(100, 181, 246, 0.3);
}

.free-input-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.input-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.submit-btn {
  background: linear-gradient(45deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: rgba(158, 158, 158, 0.2);
  color: white;
  border: 2px solid #9e9e9e;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-btn:hover {
  background: rgba(158, 158, 158, 0.4);
  transform: translateY(-2px);
}

.character-counter {
  text-align: right;
  color: #90a4ae;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.theater-stage {
  flex: 1;
  position: relative;
  margin: 1rem;
  border-radius: 1rem;
  overflow: hidden;
}

.stage-background {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem;
}

.stage-background.hospital {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.stage-background.restaurant {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5z'/%3E%3C/g%3E%3C/svg%3E");
}

.stage-background.school {
  background: linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%);
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h20v20H0V0zm10 18a8 8 0 100-16 8 8 0 000 16z'/%3E%3C/g%3E%3C/svg%3E");
}

.stage-lighting {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.characters-area {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 2rem 0;
}

.player-character, .npc-character {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.character-avatar {
  font-size: 4rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border: 3px solid rgba(255, 215, 0, 0.5);
}

.character-name {
  font-weight: bold;
  color: #333;
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  text-align: center;
}

.dialog-area {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #ffd700;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 600px;
  color: white;
}

.speaker-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.speaker-avatar {
  font-size: 2rem;
}

.speaker-name {
  font-size: 0.8rem;
  color: #ffd700;
  font-weight: bold;
}

.dialog-text {
  flex-grow: 1;
  font-size: 1.1rem;
  line-height: 1.4;
}

.audio-btn {
  padding: 0.5rem;
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.audio-btn:hover {
  background: rgba(33, 150, 243, 0.4);
}

/* Interaction Panel */
.interaction-panel {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  margin: 0 1rem 1rem 1rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.scene-info {
  margin-bottom: 1.5rem;
}

.scene-info h3 {
  color: #ffd700;
  margin: 0 0 0.5rem 0;
}

.scene-info p {
  color: #deb887;
  margin: 0 0 1rem 0;
}

.scene-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex-grow: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  transition: width 0.3s ease;
}

/* Choices Section */
.choices-section h4 {
  color: #ffd700;
  margin-bottom: 1rem;
}

.choices-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.choice-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffd700;
}

.choice-btn.correct {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
}

.choice-btn.incorrect {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
}

.choice-btn:disabled {
  cursor: not-allowed;
}

.choice-text {
  font-size: 1rem;
  line-height: 1.4;
}

.choice-vocabulary {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
  font-size: 0.9rem;
}

.vocab-word {
  color: #ffd700;
  font-weight: bold;
}

.vocab-meaning {
  color: #87ceeb;
}

/* Feedback */
.feedback-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
}

.feedback-message.correct {
  color: #4caf50;
}

.feedback-message.incorrect {
  color: #f44336;
}

.feedback-icon {
  font-size: 1.5rem;
}

.continue-btn {
  padding: 0.75rem 1.5rem;
  background: #ffd700;
  border: none;
  border-radius: 0.5rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #ffed4e;
}

/* Free Input */
.free-input-section h4 {
  color: #ffd700;
  margin-bottom: 1rem;
}

.input-area {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.free-input-textarea {
  flex-grow: 1;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: white;
  resize: vertical;
  font-family: inherit;
}

.free-input-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.submit-btn {
  padding: 1rem 1.5rem;
  background: #ffd700;
  border: none;
  border-radius: 0.5rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #ffed4e;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Performance Panel */
.performance-panel {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.metric-icon {
  font-size: 1.2rem;
}

.metric-label {
  color: #deb887;
  font-size: 0.9rem;
}

.metric-value {
  color: #ffd700;
  font-weight: bold;
  margin-left: auto;
}

/* Results Screen */
.results-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 2rem;
}

.results-container {
  max-width: 800px;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.results-header {
  text-align: center;
  margin-bottom: 2rem;
}

.results-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.curtain-left, .curtain-right {
  width: 100px;
  height: 200px;
  background: linear-gradient(45deg, #8b0000, #dc143c);
  border-radius: 0 0 50px 50px;
}

.performance-rating {
  text-align: center;
}

.rating-stars {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.star {
  opacity: 0.3;
  margin: 0 0.1rem;
}

.star.filled {
  opacity: 1;
}

.performance-rating h2 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.performance-rating p {
  color: #deb887;
  font-size: 1.1rem;
}

.detailed-results {
  margin-bottom: 2rem;
}

.results-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-category {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.result-category h3 {
  color: #ffd700;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.category-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #87ceeb;
  margin-bottom: 0.5rem;
}

.category-feedback {
  font-size: 0.9rem;
  color: #deb887;
}

.vocabulary-learned {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.vocabulary-learned h3 {
  color: #ffd700;
  text-align: center;
  margin: 0 0 1rem 0;
}

.vocab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.vocab-item {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.25rem;
}

.vocab-item .vocab-word {
  font-weight: bold;
  color: #ffd700;
}

.vocab-item .vocab-meaning {
  color: #87ceeb;
  font-size: 0.9rem;
}

.vocab-item .vocab-context {
  color: #deb887;
  font-size: 0.8rem;
  font-style: italic;
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.replay-btn, .menu-btn, .exit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 2px solid;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.replay-btn {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
}

.replay-btn:hover {
  background: rgba(76, 175, 80, 0.4);
}

.menu-btn {
  background: rgba(255, 152, 0, 0.2);
  border-color: #ff9800;
}

.menu-btn:hover {
  background: rgba(255, 152, 0, 0.4);
}

.exit-btn {
  background: rgba(158, 158, 158, 0.2);
  border-color: #9e9e9e;
}

.exit-btn:hover {
  background: rgba(158, 158, 158, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .game-title {
    font-size: clamp(0.9rem, 3.5vw, 1.6rem);
  }

  .game-header {
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem;
  }

  .scenarios-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .game-title {
    font-size: clamp(0.8rem, 3vw, 1.4rem);
  }

  .game-header {
    padding: 0.75rem;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 0.75rem;
    text-align: center;
  }

  .header-left, .header-right {
    justify-self: center;
  }

  .scenarios-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    max-width: 600px;
  }

  .scenario-card {
    padding: 0.75rem;
  }

  .scenario-icon {
    font-size: 1.8rem;
  }

  .scenario-info h4 {
    font-size: 0.9rem;
  }

  .scenario-info p {
    font-size: 0.75rem;
  }

  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .characters-area {
    flex-direction: column;
    gap: 2rem;
  }

  .dialog-box {
    flex-direction: column;
    text-align: center;
  }

  .performance-panel {
    flex-direction: column;
  }

  .results-stage {
    flex-direction: column;
    gap: 1rem;
  }

  .curtain-left, .curtain-right {
    display: none;
  }

  .results-categories {
    grid-template-columns: 1fr;
  }

  .vocab-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: clamp(0.7rem, 2.5vw, 1.2rem);
  }

  .game-header {
    padding: 0.5rem;
  }

  .back-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .score-display {
    padding: 0.4rem 0.8rem;
  }

  .score-label {
    font-size: 0.7rem;
  }

  .score-value {
    font-size: 1rem;
  }

  .scenario-card {
    padding: 0.75rem;
  }

  .scenario-icon {
    font-size: 1.5rem;
  }

  .scenario-info h4 {
    font-size: 1rem;
  }

  .scenario-info p {
    font-size: 0.8rem;
  }

  .scenarios-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    max-width: 400px;
  }
}
</style>