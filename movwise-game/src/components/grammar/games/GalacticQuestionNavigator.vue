<template>
  <div class="galactic-navigator">
    <!-- Space Background Animation -->
    <div class="space-background">
      <div class="stars-layer"></div>
      <div class="nebula-layer"></div>
      <div class="space-dust"></div>
    </div>

    <!-- Game Header -->
    <div class="game-header">
      <button @click="goBack" class="back-button">
        <ChevronLeftIcon class="h-6 w-6" />
        戻る
      </button>
      <h1 class="game-title">
        <span class="title-icon">🔍</span>
        疑問詞探偵
      </h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <span class="stat-value">{{ currentQuestion + 1 }}/{{ totalQuestions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">💎</span>
          <span class="stat-value">{{ crystals }}</span>
        </div>
      </div>
    </div>

    <!-- Mode Select Screen -->
    <div v-if="gamePhase === 'select'" class="mode-select">
      <div class="select-header">
        <h2 class="select-title">🌌 学習モードを選択</h2>
        <p class="select-subtitle">写真を見て疑問詞を学ぼう！</p>
      </div>

      <div class="mode-grid">
        <!-- Basic Photo Mode -->
        <div class="mode-card basic" @click="selectMode('basic')">
          <div class="mode-icon">📸</div>
          <h3 class="mode-title">基本写真モード</h3>
          <p class="mode-desc">WHERE, WHO, WHAT, WHEN を写真で学習</p>
          <div class="mode-badges">
            <span class="level-badge">レベル 1</span>
            <span class="questions-badge">12問</span>
          </div>
        </div>

        <!-- Scenario Mode -->
        <div class="mode-card scenario" @click="selectMode('scenario')">
          <div class="mode-icon">🎬</div>
          <h3 class="mode-title">シナリオモード</h3>
          <p class="mode-desc">WHICH, HOW, HOW MANY など応用学習</p>
          <div class="mode-badges">
            <span class="level-badge">レベル 2</span>
            <span class="questions-badge">15問</span>
          </div>
        </div>

        <!-- Story Mode -->
        <div class="mode-card story" @click="selectMode('story')">
          <div class="mode-icon">📖</div>
          <h3 class="mode-title">ストーリーモード</h3>
          <p class="mode-desc">全ての疑問詞を使って宇宙冒険</p>
          <div class="mode-badges">
            <span class="level-badge">レベル 3</span>
            <span class="questions-badge">20問</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Photo Game -->
    <div v-if="gamePhase === 'basic'" class="basic-game">
      <div class="progress-header">
        <div class="progress-info">
          <span class="current-question">問題 {{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
          <span class="timer-display">⏰ {{ timeRemaining }}秒</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: ((currentQuestion + 1) / totalQuestions) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div class="photo-question">
        <!-- Left Side: Photo -->
        <div class="photo-section">
          <img 
            :src="currentPhotoQuestion.image" 
            :alt="currentPhotoQuestion.description"
            class="question-photo"
          >
          <div class="photo-caption">{{ currentPhotoQuestion.caption }}</div>
        </div>

        <!-- Right Side: Question and Answers -->
        <div class="question-section">
          <div class="question-content">
            <div class="question-prompt">
              <p class="prompt-text">この写真について質問するなら、どの疑問詞を使いますか？</p>
              <p class="hint-text">{{ currentPhotoQuestion.hint }}</p>
            </div>

            <div class="answer-options">
              <button 
                v-for="option in basicOptions"
                :key="option.word"
                @click="selectAnswer(option.word)"
                :disabled="showResult"
                class="answer-button"
                :class="{
                  correct: showResult && option.word === currentPhotoQuestion.correctAnswer,
                  incorrect: showResult && selectedAnswer === option.word && option.word !== currentPhotoQuestion.correctAnswer,
                  selected: selectedAnswer === option.word
                }"
              >
                <span class="answer-word">{{ option.word }}</span>
                <span class="answer-meaning">{{ option.meaning }}</span>
                <span class="answer-example">{{ option.example }}</span>
              </button>
            </div>
          </div>

          <div v-if="showResult" class="result-panel">
            <div v-if="isCorrect" class="result-correct">
              <span class="result-icon">✅</span>
              <span class="result-text">正解！</span>
              <p class="explanation">{{ currentPhotoQuestion.explanation }}</p>
            </div>
            <div v-else class="result-incorrect">
              <span class="result-icon">❌</span>
              <span class="result-text">不正解</span>
              <p class="explanation">
                正解は「<strong>{{ currentPhotoQuestion.correctAnswer }}</strong>」です。<br>
                {{ currentPhotoQuestion.explanation }}
              </p>
            </div>
            
            <button @click="nextQuestion" class="next-button">
              <span v-if="currentQuestion < totalQuestions - 1">次の問題</span>
              <span v-else>結果を見る</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Game -->
    <div v-if="gamePhase === 'scenario'" class="scenario-game">
      <div class="progress-header">
        <div class="progress-info">
          <span class="current-question">シナリオ {{ currentQuestion + 1 }} / {{ totalQuestions }}</span>
          <span class="timer-display">⏰ {{ timeRemaining }}秒</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: ((currentQuestion + 1) / totalQuestions) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div class="scenario-question">
        <!-- Left Side: Scenario Images -->
        <div class="scenario-left">
          <div class="scenario-header">
            <span class="scenario-icon">{{ currentScenario.icon }}</span>
            <h3 class="scenario-title">{{ currentScenario.title }}</h3>
          </div>
          
          <div class="scenario-images">
            <img 
              v-for="(img, index) in currentScenario.images"
              :key="index"
              :src="img.src"
              :alt="img.alt"
              class="scenario-image"
              :class="{ highlight: img.highlight }"
            >
          </div>
        </div>

        <!-- Right Side: Question and Answers -->
        <div class="scenario-right">
          <div class="scenario-content">
            <div class="scenario-text">
              <p class="context">{{ currentScenario.context }}</p>
              <p class="question">{{ currentScenario.question }}</p>
            </div>

            <div class="answer-options-grid">
              <button 
                v-for="option in currentScenario.options"
                :key="option.word"
                @click="selectAnswer(option.word)"
                :disabled="showResult"
                class="scenario-answer"
                :class="{
                  correct: showResult && option.word === currentScenario.correctAnswer,
                  incorrect: showResult && selectedAnswer === option.word && option.word !== currentScenario.correctAnswer
                }"
              >
                <span class="answer-main">{{ option.word }}</span>
                <span class="answer-sub">{{ option.meaning }}</span>
              </button>
            </div>
          </div>

          <div v-if="showResult" class="result-panel">
            <div :class="isCorrect ? 'result-correct' : 'result-incorrect'">
              <span class="result-icon">{{ isCorrect ? '✅' : '❌' }}</span>
              <span class="result-text">{{ isCorrect ? '正解！' : '不正解' }}</span>
              <p class="explanation">{{ currentScenario.explanation }}</p>
            </div>
            
            <button @click="nextQuestion" class="next-button">
              {{ currentQuestion < totalQuestions - 1 ? '次のシナリオ' : '結果を見る' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-if="gamePhase === 'complete'" class="results-screen">
      <div class="results-container">
        <h2 class="results-title">🏆 ミッション完了！</h2>
        
        <div class="score-summary">
          <div class="score-item">
            <span class="score-label">正解数</span>
            <span class="score-value">{{ correctAnswers }} / {{ totalQuestions }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">正解率</span>
            <span class="score-value">{{ Math.round(accuracy) }}%</span>
          </div>
          <div class="score-item">
            <span class="score-label">獲得クリスタル</span>
            <span class="score-value">{{ totalEarnedCrystals }} 💎</span>
          </div>
        </div>

        <div class="results-actions">
          <button @click="playAgain" class="play-again-btn">
            もう一度プレイ
          </button>
          <button @click="goBack" class="back-to-map-btn">
            銀河マップへ 🌌
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { ChevronLeftIcon } from '@heroicons/vue/24/solid'

const router = useRouter()
const playerProfileStore = usePlayerProfileStore()

// Game States
const gamePhase = ref('select') // 'select', 'basic', 'scenario', 'story', 'complete'
const currentMode = ref('')
const currentQuestion = ref(0)
const totalQuestions = ref(12)
const crystals = ref(playerProfileStore.crystals || 0)

// Game State
const showResult = ref(false)
const selectedAnswer = ref(null)
const isCorrect = ref(false)
const timeRemaining = ref(20)
const currentTimeLimit = ref(20)

// Stats
const correctAnswers = ref(0)
const totalAnswers = ref(0)
const totalEarnedCrystals = ref(0)

// Timer
let responseTimer = null

// Current Questions
const currentPhotoQuestion = ref(null)
const currentScenario = ref(null)

// Basic Options (常に表示される基本疑問詞)
const basicOptions = [
  { word: 'WHERE', meaning: 'どこ', example: '場所を聞く' },
  { word: 'WHO', meaning: '誰', example: '人を聞く' },
  { word: 'WHAT', meaning: '何', example: '物を聞く' },
  { word: 'WHEN', meaning: 'いつ', example: '時間を聞く' }
]

// Photo Questions Database (ローカル画像を使用)
const photoQuestions = {
  basic: [
    // WHERE Questions (15問)
    {
      id: 1,
      image: '/src/assets/images/vocabulary/where/where_mountain.jpg',
      description: 'mountain',
      caption: 'mountain',
      hint: 'この場所について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '場所について質問する時は WHERE を使います。例: Where is this mountain?'
    },
    {
      id: 2,
      image: '/src/assets/images/vocabulary/where/where_library.jpg',
      description: 'library',
      caption: 'library',
      hint: 'この建物について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '建物の場所を尋ねる時は WHERE を使います。例: Where is the library?'
    },
    {
      id: 3,
      image: '/src/assets/images/vocabulary/where/where_school.jpg',
      description: 'school',
      caption: 'school',
      hint: 'この学校の場所を聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '学校の場所を尋ねる時は WHERE を使います。例: Where is the school?'
    },
    {
      id: 4,
      image: '/src/assets/images/vocabulary/where/where_hospital.jpg',
      description: 'hospital',
      caption: 'hospital',
      hint: 'この病院について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '病院の場所を尋ねる時は WHERE を使います。例: Where is the hospital?'
    },
    {
      id: 5,
      image: '/src/assets/images/vocabulary/where/where_park.jpg',
      description: 'park',
      caption: 'park',
      hint: 'この公園について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '公園の場所を尋ねる時は WHERE を使います。例: Where is the park?'
    },
    {
      id: 6,
      image: '/src/assets/images/vocabulary/where/where_beach.jpg',
      description: 'beach',
      caption: 'beach',
      hint: 'このビーチについて聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: 'ビーチの場所を尋ねる時は WHERE を使います。例: Where is the beach?'
    },
    {
      id: 7,
      image: '/src/assets/images/vocabulary/where/where_forest.jpg',
      description: 'forest',
      caption: 'forest',
      hint: 'この森について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '森の場所を尋ねる時は WHERE を使います。例: Where is the forest?'
    },
    {
      id: 8,
      image: '/src/assets/images/vocabulary/where/where_city.jpg',
      description: 'city',
      caption: 'city',
      hint: 'この都市について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '都市の場所を尋ねる時は WHERE を使います。例: Where is this city?'
    },
    {
      id: 9,
      image: '/src/assets/images/vocabulary/where/where_restaurant.jpg',
      description: 'restaurant',
      caption: 'restaurant',
      hint: 'このレストランについて聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: 'レストランの場所を尋ねる時は WHERE を使います。例: Where is the restaurant?'
    },
    {
      id: 10,
      image: '/src/assets/images/vocabulary/where/where_station.jpg',
      description: 'station',
      caption: 'station',
      hint: 'この駅について聞きたい時は？',
      correctAnswer: 'WHERE',
      explanation: '駅の場所を尋ねる時は WHERE を使います。例: Where is the station?'
    },

    // WHO Questions (15問)
    {
      id: 11,
      image: '/src/assets/images/vocabulary/who/who_doctor.jpg',
      description: 'doctor',
      caption: 'doctor',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '人物について質問する時は WHO を使います。例: Who is the doctor?'
    },
    {
      id: 12,
      image: '/src/assets/images/vocabulary/who/who_teacher.jpg',
      description: 'teacher',
      caption: 'teacher',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '職業の人を尋ねる時は WHO を使います。例: Who is the teacher?'
    },
    {
      id: 13,
      image: '/src/assets/images/vocabulary/who/who_chef.jpg',
      description: 'chef',
      caption: 'chef',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '料理人について尋ねる時は WHO を使います。例: Who is the chef?'
    },
    {
      id: 14,
      image: '/src/assets/images/vocabulary/who/who_police.jpg',
      description: 'police',
      caption: 'police',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '警察官について尋ねる時は WHO を使います。例: Who is the police officer?'
    },
    {
      id: 15,
      image: '/src/assets/images/vocabulary/who/who_firefighter.jpg',
      description: 'firefighter',
      caption: 'firefighter',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '消防士について尋ねる時は WHO を使います。例: Who is the firefighter?'
    },
    {
      id: 16,
      image: '/src/assets/images/vocabulary/who/who_astronaut.jpg',
      description: 'astronaut',
      caption: 'astronaut',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '宇宙飛行士について尋ねる時は WHO を使います。例: Who is the astronaut?'
    },
    {
      id: 17,
      image: '/src/assets/images/vocabulary/who/who_nurse.jpg',
      description: 'nurse',
      caption: 'nurse',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '看護師について尋ねる時は WHO を使います。例: Who is the nurse?'
    },
    {
      id: 18,
      image: '/src/assets/images/vocabulary/who/who_pilot.jpg',
      description: 'pilot',
      caption: 'pilot',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: 'パイロットについて尋ねる時は WHO を使います。例: Who is the pilot?'
    },
    {
      id: 19,
      image: '/src/assets/images/vocabulary/who/who_scientist.jpg',
      description: 'scientist',
      caption: 'scientist',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '科学者について尋ねる時は WHO を使います。例: Who is the scientist?'
    },
    {
      id: 20,
      image: '/src/assets/images/vocabulary/who/who_student.jpg',
      description: 'student',
      caption: 'student',
      hint: 'この人について聞きたい時は？',
      correctAnswer: 'WHO',
      explanation: '学生について尋ねる時は WHO を使います。例: Who is the student?'
    },

    // WHAT Questions (15問)
    {
      id: 21,
      image: '/src/assets/images/vocabulary/what/what_apple.jpg',
      description: 'apple',
      caption: 'apple',
      hint: 'この食べ物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '物や食べ物について質問する時は WHAT を使います。例: What is this fruit?'
    },
    {
      id: 22,
      image: '/src/assets/images/vocabulary/what/what_book.jpg',
      description: 'book',
      caption: 'book',
      hint: 'この物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '物について質問する時は WHAT を使います。例: What is this book?'
    },
    {
      id: 23,
      image: '/src/assets/images/vocabulary/what/what_car.jpg',
      description: 'car',
      caption: 'car',
      hint: 'この乗り物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '乗り物について質問する時は WHAT を使います。例: What is this vehicle?'
    },
    {
      id: 24,
      image: '/src/assets/images/vocabulary/what/what_computer.jpg',
      description: 'computer',
      caption: 'computer',
      hint: 'この機器について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '機器について質問する時は WHAT を使います。例: What is this device?'
    },
    {
      id: 25,
      image: '/src/assets/images/vocabulary/what/what_phone.jpg',
      description: 'phone',
      caption: 'phone',
      hint: 'この機器について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '携帯電話について質問する時は WHAT を使います。例: What is this phone?'
    },
    {
      id: 26,
      image: '/src/assets/images/vocabulary/what/what_pizza.jpg',
      description: 'pizza',
      caption: 'pizza',
      hint: 'この食べ物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '食べ物について質問する時は WHAT を使います。例: What is this food?'
    },
    {
      id: 27,
      image: '/src/assets/images/vocabulary/what/what_guitar.jpg',
      description: 'guitar',
      caption: 'guitar',
      hint: 'この楽器について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '楽器について質問する時は WHAT を使います。例: What is this instrument?'
    },
    {
      id: 28,
      image: '/src/assets/images/vocabulary/what/what_bicycle.jpg',
      description: 'bicycle',
      caption: 'bicycle',
      hint: 'この乗り物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '自転車について質問する時は WHAT を使います。例: What is this bicycle?'
    },
    {
      id: 29,
      image: '/src/assets/images/vocabulary/what/what_camera.jpg',
      description: 'camera',
      caption: 'camera',
      hint: 'この機器について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: 'カメラについて質問する時は WHAT を使います。例: What is this camera?'
    },
    {
      id: 30,
      image: '/src/assets/images/vocabulary/what/what_flower.jpg',
      description: 'flower',
      caption: 'flower',
      hint: 'この植物について聞きたい時は？',
      correctAnswer: 'WHAT',
      explanation: '花について質問する時は WHAT を使います。例: What is this flower?'
    },

    // WHEN Questions (15問)
    {
      id: 31,
      image: '/src/assets/images/vocabulary/when/when_sunrise.jpg',
      description: 'sunrise',
      caption: 'sunrise',
      hint: 'この時間について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '時間について質問する時は WHEN を使います。例: When is sunrise?'
    },
    {
      id: 32,
      image: '/src/assets/images/vocabulary/when/when_sunset.jpg',
      description: 'sunset',
      caption: 'sunset',
      hint: 'この時間について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '夕日の時間を尋ねる時は WHEN を使います。例: When is sunset?'
    },
    {
      id: 33,
      image: '/src/assets/images/vocabulary/when/when_clock.jpg',
      description: 'clock',
      caption: 'clock',
      hint: 'この時刻について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '具体的な時刻を尋ねる時は WHEN を使います。例: When is the meeting?'
    },
    {
      id: 34,
      image: '/src/assets/images/vocabulary/when/when_calendar.jpg',
      description: 'calendar',
      caption: 'calendar',
      hint: 'この日付について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '日付を尋ねる時は WHEN を使います。例: When is the event?'
    },
    {
      id: 35,
      image: '/src/assets/images/vocabulary/when/when_spring.jpg',
      description: 'spring',
      caption: 'spring',
      hint: 'この季節について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '季節を尋ねる時は WHEN を使います。例: When is spring?'
    },
    {
      id: 36,
      image: '/src/assets/images/vocabulary/when/when_summer.jpg',
      description: 'summer',
      caption: 'summer',
      hint: 'この季節について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '夏の時期を尋ねる時は WHEN を使います。例: When is summer?'
    },
    {
      id: 37,
      image: '/src/assets/images/vocabulary/when/when_autumn.jpg',
      description: 'autumn',
      caption: 'autumn',
      hint: 'この季節について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '秋の時期を尋ねる時は WHEN を使います。例: When is autumn?'
    },
    {
      id: 38,
      image: '/src/assets/images/vocabulary/when/when_winter.jpg',
      description: 'winter',
      caption: 'winter',
      hint: 'この季節について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '冬の時期を尋ねる時は WHEN を使います。例: When is winter?'
    },
    {
      id: 39,
      image: '/src/assets/images/vocabulary/when/when_night.jpg',
      description: 'night',
      caption: 'night',
      hint: 'この時間について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '夜の時間を尋ねる時は WHEN を使います。例: When is nighttime?'
    },
    {
      id: 40,
      image: '/src/assets/images/vocabulary/when/when_morning.jpg',
      description: 'morning',
      caption: 'morning',
      hint: 'この時間について聞きたい時は？',
      correctAnswer: 'WHEN',
      explanation: '朝の時間を尋ねる時は WHEN を使います。例: When is morning?'
    }
  ]
}

// Scenario Questions (応用疑問詞) - 拡充版
const scenarioQuestions = [
  // WHICH Questions (4問)
  {
    id: 1,
    icon: '🚀',
    title: '宇宙船の選択',
    context: '3つの宇宙船から1つを選ぶ必要があります。',
    question: '「どの宇宙船を選びますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spaceships.jpg', alt: '3つの宇宙船', highlight: true }
    ],
    options: [
      { word: 'WHICH', meaning: 'どれ・どちら' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHERE', meaning: 'どこ' },
      { word: 'WHO', meaning: '誰' }
    ],
    correctAnswer: 'WHICH',
    explanation: '複数の選択肢から1つを選ぶ時は WHICH を使います。例: Which spaceship do you choose?'
  },
  {
    id: 2,
    icon: '🎯',
    title: '目的地の選択',
    context: '火星、木星、土星の中から目的地を決めます。',
    question: '「どの惑星に行きますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_mars.jpg', alt: '惑星の選択' }
    ],
    options: [
      { word: 'WHICH', meaning: 'どれ・どちら' },
      { word: 'WHERE', meaning: 'どこ' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHEN', meaning: 'いつ' }
    ],
    correctAnswer: 'WHICH',
    explanation: '複数の選択肢の中から選ぶ時は WHICH を使います。例: Which planet will you visit?'
  },

  // HOW Questions (4問)
  {
    id: 3,
    icon: '🔧',
    title: '修理の方法',
    context: '壊れた機械を修理する必要があります。',
    question: '「どうやって修理しますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_tools.jpg', alt: '修理工具', highlight: true }
    ],
    options: [
      { word: 'HOW', meaning: 'どのように' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHEN', meaning: 'いつ' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW',
    explanation: '方法や手段を尋ねる時は HOW を使います。例: How do you fix it?'
  },
  {
    id: 4,
    icon: '🎮',
    title: '操作方法',
    context: '新しい宇宙船の操縦を学びます。',
    question: '「どうやって操縦しますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spaceships.jpg', alt: '宇宙船のコントロール' }
    ],
    options: [
      { word: 'HOW', meaning: 'どのように' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHO', meaning: '誰' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW',
    explanation: '操作方法を尋ねる時は HOW を使います。例: How do you pilot the spaceship?'
  },

  // HOW MANY Questions (3問)
  {
    id: 5,
    icon: '💎',
    title: 'クリスタルの数',
    context: 'テーブルの上にクリスタルがあります。',
    question: '「クリスタルはいくつありますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_crystals.jp.jpg', alt: '複数のクリスタル' }
    ],
    options: [
      { word: 'HOW MANY', meaning: 'いくつ' },
      { word: 'HOW MUCH', meaning: 'どれくらい' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW MANY',
    explanation: '数えられる物の数を尋ねる時は HOW MANY を使います。例: How many crystals are there?'
  },
  {
    id: 6,
    icon: '👥',
    title: '乗組員の数',
    context: '宇宙船に乗組員がいます。',
    question: '「乗組員は何人いますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spacesuit.jpg', alt: '宇宙飛行士たち' }
    ],
    options: [
      { word: 'HOW MANY', meaning: 'いくつ・何人' },
      { word: 'HOW MUCH', meaning: 'どれくらい' },
      { word: 'WHO', meaning: '誰' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW MANY',
    explanation: '人数を尋ねる時は HOW MANY を使います。例: How many crew members are there?'
  },

  // HOW MUCH Questions (3問)
  {
    id: 7,
    icon: '⛽',
    title: '燃料の量',
    context: '宇宙船の燃料タンクを確認します。',
    question: '「燃料はどれくらいありますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_fuel.jp.jpg', alt: '燃料タンク' }
    ],
    options: [
      { word: 'HOW MUCH', meaning: 'どれくらい' },
      { word: 'HOW MANY', meaning: 'いくつ' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHEN', meaning: 'いつ' }
    ],
    correctAnswer: 'HOW MUCH',
    explanation: '数えられない物の量を尋ねる時は HOW MUCH を使います。例: How much fuel is there?'
  },
  {
    id: 8,
    icon: '💰',
    title: '費用の確認',
    context: '宇宙旅行の費用について確認します。',
    question: '「費用はいくらですか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spaceships.jpg', alt: '宇宙旅行' }
    ],
    options: [
      { word: 'HOW MUCH', meaning: 'いくら・どれくらい' },
      { word: 'HOW MANY', meaning: 'いくつ' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW MUCH',
    explanation: '値段や費用を尋ねる時は HOW MUCH を使います。例: How much does it cost?'
  },

  // HOW LONG Questions (2問)
  {
    id: 9,
    icon: '⏱️',
    title: '旅行の期間',
    context: '火星への旅行を計画しています。',
    question: '「どのくらいの期間かかりますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_mars.jp.jpg', alt: '火星への旅' }
    ],
    options: [
      { word: 'HOW LONG', meaning: 'どのくらいの期間' },
      { word: 'HOW FAR', meaning: 'どのくらい遠い' },
      { word: 'WHEN', meaning: 'いつ' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW LONG',
    explanation: '期間や時間の長さを尋ねる時は HOW LONG を使います。例: How long does it take?'
  },

  // HOW OFTEN Questions (2問)
  {
    id: 10,
    icon: '📅',
    title: '訓練の頻度',
    context: '宇宙飛行士の訓練スケジュール。',
    question: '「どのくらいの頻度で訓練しますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_calendar_training.jpg', alt: '訓練カレンダー' }
    ],
    options: [
      { word: 'HOW OFTEN', meaning: 'どのくらいの頻度' },
      { word: 'HOW LONG', meaning: 'どのくらいの期間' },
      { word: 'WHEN', meaning: 'いつ' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'HOW OFTEN',
    explanation: '頻度を尋ねる時は HOW OFTEN を使います。例: How often do you train?'
  },

  // WHY Questions (3問)
  {
    id: 11,
    icon: '🤔',
    title: '宇宙服の理由',
    context: '宇宙飛行士が宇宙服を着ています。',
    question: '「なぜ宇宙服を着ていますか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spacesuit.jpg', alt: '宇宙服', highlight: true }
    ],
    options: [
      { word: 'WHY', meaning: 'なぜ' },
      { word: 'WHAT', meaning: '何' },
      { word: 'HOW', meaning: 'どのように' },
      { word: 'WHEN', meaning: 'いつ' }
    ],
    correctAnswer: 'WHY',
    explanation: '理由を尋ねる時は WHY を使います。例: Why do you wear a spacesuit?'
  },
  {
    id: 12,
    icon: '❌',
    title: 'ミッション中止の理由',
    context: '宇宙ミッションが突然中止になりました。',
    question: '「なぜ中止になったのですか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_spaceships.jpg', alt: 'ミッション中止' }
    ],
    options: [
      { word: 'WHY', meaning: 'なぜ' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHEN', meaning: 'いつ' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'WHY',
    explanation: '中止の理由を尋ねる時は WHY を使います。例: Why was it cancelled?'
  },

  // WHOSE Questions (2問)
  {
    id: 13,
    icon: '👑',
    title: '所有者の確認',
    context: 'テーブルに誰かのヘルメットがあります。',
    question: '「これは誰のヘルメットですか？」と聞く時は？',
    images: [
      { src: '/src/assets/images/vocabulary/scenarios/scenario_helmet.jpg', alt: 'ヘルメット', highlight: true }
    ],
    options: [
      { word: 'WHOSE', meaning: '誰の' },
      { word: 'WHO', meaning: '誰' },
      { word: 'WHAT', meaning: '何' },
      { word: 'WHERE', meaning: 'どこ' }
    ],
    correctAnswer: 'WHOSE',
    explanation: '所有者を尋ねる時は WHOSE を使います。例: Whose helmet is this?'
  }
]

// Methods
const goBack = () => {
  router.push('/platforms/grammar-galaxy')
}

const selectMode = (mode) => {
  currentMode.value = mode
  
  if (mode === 'basic') {
    gamePhase.value = 'basic'
    totalQuestions.value = 40  // 40問に大幅増加
    currentTimeLimit.value = 20
    startBasicGame()
  } else if (mode === 'scenario') {
    gamePhase.value = 'scenario'
    totalQuestions.value = 13  // 13問に増加
    currentTimeLimit.value = 25
    startScenarioGame()
  } else {
    // Story mode - 後で実装
    alert('ストーリーモードは準備中です！')
  }
  
  // Reset stats
  currentQuestion.value = 0
  correctAnswers.value = 0
  totalAnswers.value = 0
  totalEarnedCrystals.value = 0
}

const startBasicGame = () => {
  // Shuffle questions
  const shuffled = [...photoQuestions.basic].sort(() => Math.random() - 0.5)
  currentPhotoQuestion.value = shuffled[currentQuestion.value]
  showResult.value = false
  selectedAnswer.value = null
  timeRemaining.value = currentTimeLimit.value
  startTimer()
}

const startScenarioGame = () => {
  currentScenario.value = scenarioQuestions[currentQuestion.value]
  showResult.value = false
  selectedAnswer.value = null
  timeRemaining.value = currentTimeLimit.value
  startTimer()
}

const selectAnswer = (answer) => {
  if (showResult.value) return
  
  selectedAnswer.value = answer
  const correctAnswer = gamePhase.value === 'basic' 
    ? currentPhotoQuestion.value.correctAnswer 
    : currentScenario.value.correctAnswer
    
  isCorrect.value = answer === correctAnswer
  showResult.value = true
  
  clearInterval(responseTimer)
  
  totalAnswers.value++
  
  if (isCorrect.value) {
    correctAnswers.value++
    const earned = gamePhase.value === 'basic' ? 10 : 15
    totalEarnedCrystals.value += earned
  }
}

const nextQuestion = () => {
  currentQuestion.value++
  
  if (currentQuestion.value >= totalQuestions.value) {
    completeGame()
  } else {
    if (gamePhase.value === 'basic') {
      startBasicGame()
    } else {
      startScenarioGame()
    }
  }
}

const completeGame = () => {
  gamePhase.value = 'complete'
  
  // Award crystals
  crystals.value += totalEarnedCrystals.value
  playerProfileStore.crystals = crystals.value
}

const playAgain = () => {
  gamePhase.value = 'select'
  currentMode.value = ''
}

const startTimer = () => {
  responseTimer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      // Time's up
      selectedAnswer.value = 'timeout'
      isCorrect.value = false
      showResult.value = true
      totalAnswers.value++
      clearInterval(responseTimer)
    }
  }, 1000)
}

// Computed
const accuracy = computed(() => {
  return totalAnswers.value > 0 ? (correctAnswers.value / totalAnswers.value) * 100 : 0
})

// Cleanup
onUnmounted(() => {
  if (responseTimer) {
    clearInterval(responseTimer)
  }
})
</script>

<style scoped>
/* Base Styles */
.galactic-navigator {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow-x: hidden;
}

/* Space Background */
.space-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(2px 2px at 20px 30px, #fff, transparent),
    radial-gradient(2px 2px at 40px 70px, #fff, transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
}

.nebula-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(100, 50, 200, 0.1) 0%, transparent 70%);
  animation: pulse 8s infinite;
}

.space-dust {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%);
  animation: float 20s linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@keyframes float {
  0% { transform: translateX(-100px); }
  100% { transform: translateX(100px); }
}

/* Game Header */
.game-header {
  position: relative;
  z-index: 10;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  height: 80px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-1px);
}

.game-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #00ffff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

/* Mode Select */
.mode-select {
  position: relative;
  z-index: 10;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.select-header {
  text-align: center;
  margin-bottom: 2rem;
}

.select-title {
  font-size: 2rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

.select-subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  flex: 1;
}

.mode-card {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1.25rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
}

.mode-card.basic:hover {
  border-color: #10b981;
}

.mode-card.scenario:hover {
  border-color: #3b82f6;
}

.mode-card.story:hover {
  border-color: #a855f7;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.mode-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

.mode-desc {
  color: #94a3b8;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.mode-badges {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.level-badge, .questions-badge {
  padding: 0.2rem 0.6rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 0.75rem;
  font-size: 0.8rem;
}

/* Basic Photo Game */
.basic-game {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.progress-header {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0080ff);
  transition: width 0.5s ease;
}

.photo-question {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1.5rem;
  padding: 1.5rem;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.question-photo {
  width: 100%;
  max-width: 400px;
  height: auto;
  max-height: 350px;
  object-fit: cover;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.photo-caption {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #94a3b8;
  text-align: center;
}

.question-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.question-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-prompt {
  text-align: center;
  margin-bottom: 2rem;
}

.prompt-text {
  font-size: 1.25rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

.hint-text {
  color: #94a3b8;
  font-size: 1rem;
}

.answer-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  flex: 1;
}

.answer-button {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 1.25rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.answer-button:hover:not(:disabled) {
  border-color: #00ffff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
}

.answer-button.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.answer-button.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.answer-button.selected:not(.correct):not(.incorrect) {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.answer-word {
  display: block;
  font-size: 1.75rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.25rem;
}

.answer-meaning {
  display: block;
  font-size: 1rem;
  color: #94a3b8;
  margin-bottom: 0.1rem;
}

.answer-example {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
}

/* Scenario Game */
.scenario-game {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

.scenario-question {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1.5rem;
  padding: 1.5rem;
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.scenario-left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scenario-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.scenario-icon {
  font-size: 2.5rem;
}

.scenario-title {
  font-size: 1.5rem;
  color: #00ffff;
}

.scenario-images {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  max-width: 100%;
}

.scenario-image {
  max-width: 180px;
  max-height: 120px;
  border-radius: 0.75rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.scenario-image.highlight {
  border: 3px solid #00ffff;
  transform: scale(1.1);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.4);
}

.scenario-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.scenario-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.scenario-text {
  text-align: center;
  margin-bottom: 2rem;
}

.context {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.question {
  font-size: 1.4rem;
  font-weight: bold;
  color: #00ffff;
}

.answer-options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  flex: 1;
}

.scenario-answer {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scenario-answer:hover:not(:disabled) {
  border-color: #00ffff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
}

.scenario-answer.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.scenario-answer.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.answer-main {
  display: block;
  font-size: 1.4rem;
  font-weight: bold;
  color: #00ffff;
  margin-bottom: 0.25rem;
}

.answer-sub {
  display: block;
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Result Panel */
.result-panel {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: auto;
  text-align: center;
}

.result-correct, .result-incorrect {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.result-icon {
  font-size: 1.5rem;
}

.result-text {
  font-size: 1.2rem;
  font-weight: bold;
}

.explanation {
  margin-top: 0.25rem;
  color: #cbd5e1;
  line-height: 1.4;
  font-size: 0.9rem;
}

.next-button {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: black;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.5);
}

/* Results Screen */
.results-screen {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.results-container {
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.results-title {
  font-size: 2.5rem;
  color: #00ffff;
  margin-bottom: 2rem;
}

.score-summary {
  margin-bottom: 2rem;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.score-label {
  color: #94a3b8;
}

.score-value {
  font-weight: bold;
  color: #00ffff;
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.play-again-btn, .back-to-map-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-again-btn {
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: black;
  border: none;
}

.back-to-map-btn {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  border: 2px solid rgba(0, 255, 255, 0.3);
}

.play-again-btn:hover, .back-to-map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .game-header {
    padding: 0.5rem 1rem;
    flex-direction: column;
    gap: 1rem;
    height: auto;
  }
  
  .mode-grid {
    grid-template-columns: 1fr;
  }
  
  .photo-question,
  .scenario-question {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .question-photo {
    max-height: 250px;
  }
  
  .scenario-image {
    max-width: 120px;
    max-height: 80px;
  }
  
  .answer-options,
  .answer-options-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .results-actions {
    flex-direction: column;
  }

  .basic-game,
  .scenario-game,
  .mode-select {
    height: auto;
    min-height: calc(100vh - 100px);
  }
}
</style>