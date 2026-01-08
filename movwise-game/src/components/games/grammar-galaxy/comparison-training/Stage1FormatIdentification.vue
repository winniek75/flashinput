<template>
  <div class="format-identification-stage">
    <div class="question-header">
      <h3 class="question-title">どの英語を使う？</h3>
      <p class="question-instruction">状況に合った英語の言い方を選んでください</p>
    </div>

    <!-- Visual Situation Display -->
    <div class="situation-display">
      <div class="objects-container">
        <div 
          v-for="(obj, index) in currentSituation.objects" 
          :key="index"
          class="object-item"
          :class="obj.size"
        >
          <div class="object-icon">{{ obj.icon }}</div>
          <div class="object-label">{{ obj.label }}</div>
          <div class="object-value" v-if="obj.value">{{ obj.value }}</div>
        </div>
      </div>
      
      <!-- Comparison beam effects -->
      <div class="comparison-effects" v-if="showResult">
        <div 
          class="beam-effect" 
          :class="selectedFormat"
          v-if="isCorrect"
        ></div>
      </div>
    </div>

    <!-- English Sentence Display -->
    <div class="sentence-display" v-if="currentSituation">
      <div class="sentence-prompt">
        <div class="prompt-icon">💭</div>
        <div class="prompt-text">{{ currentSituation.englishPrompt }}</div>
      </div>
    </div>

    <!-- Answer Selection Buttons -->
    <div class="answer-buttons">
      <button
        v-for="option in currentOptions"
        :key="option.id"
        class="answer-btn"
        :class="{
          'selected': selectedAnswer === option.id,
          'correct': showResult && option.isCorrect && isCorrect,
          'incorrect': showResult && selectedAnswer === option.id && !option.isCorrect,
          'show-correct': showResult && option.isCorrect && !isCorrect
        }"
        @click="selectAnswer(option.id)"
        :disabled="showResult"
      >
        <div class="answer-text">{{ option.text }}</div>
        <div class="answer-meaning">{{ option.meaning }}</div>
        
        <!-- Audio button -->
        <button 
          class="audio-btn-mini"
          @click.stop="playAudio(option.text)"
          :disabled="isPlayingAudio"
        >
          🔊
        </button>
        
        <!-- Visual effect for correct answer -->
        <div class="answer-effect" v-if="showResult && option.isCorrect">
          <div class="effect-shine"></div>
        </div>
      </button>
    </div>

    <!-- Feedback Display -->
    <div class="feedback-display" v-if="showResult">
      <div class="feedback-content" :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }">
        <div class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</div>
        <div class="feedback-text">
          <div class="feedback-title">
            {{ isCorrect ? '正解！' : '不正解' }}
          </div>
          <div class="feedback-explanation">
            {{ getFeedbackExplanation() }}
          </div>
        </div>
      </div>
      <!-- Next Question Button -->
      <div class="next-button-container">
        <button 
          class="next-question-btn"
          :class="{ 'correct': isCorrect, 'incorrect': !isCorrect }"
          @click="proceedToNext"
        >
          {{ isCorrect ? '理解できました！次へ' : '次の問題へ進む' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'Stage1FormatIdentification',
  props: {
    question: {
      type: Object,
      required: true
    },
    showResult: {
      type: Boolean,
      default: false
    },
    selectedAnswer: {
      type: [String, Number],
      default: null
    },
    stage: {
      type: Number,
      default: 1
    }
  },
  emits: ['answer-selected', 'next-question'],
  setup(props, { emit }) {
    const currentSituation = ref(null)
    const currentOptions = ref([])
    const isCorrect = ref(false)
    const isPlayingAudio = ref(false)
    const usedQuestionIds = ref([])

    // Expanded question database with 50 questions
    const situationDatabase = [
      // COMPARATIVE QUESTIONS (20 questions) - comparing 2 things
      {
        id: 'dogs_size',
        objects: [
          { icon: '🐕', label: '大きな犬', size: 'large' },
          { icon: '🐕‍🦺', label: '小さな犬', size: 'small' }
        ],
        englishPrompt: 'The big dog is ___ than the small dog.',
        correctAnswer: 'bigger',
        explanation: '2匹の犬の大きさを比べているので "bigger" が正解！',
        options: [
          { id: 1, text: 'bigger', meaning: 'より大きい', isCorrect: true },
          { id: 2, text: 'biggest', meaning: '一番大きい', isCorrect: false },
          { id: 3, text: 'as big as', meaning: '同じ大きさ', isCorrect: false }
        ]
      },
      {
        id: 'cars_speed',
        objects: [
          { icon: '🏎️', label: '速い車', size: 'medium' },
          { icon: '🚗', label: '普通の車', size: 'medium' }
        ],
        englishPrompt: 'The race car is ___ than the regular car.',
        correctAnswer: 'faster',
        explanation: '2台の車の速さを比べているので "faster" が正解！',
        options: [
          { id: 1, text: 'faster', meaning: 'より速い', isCorrect: true },
          { id: 2, text: 'fastest', meaning: '一番速い', isCorrect: false },
          { id: 3, text: 'as fast as', meaning: '同じ速さ', isCorrect: false }
        ]
      },
      {
        id: 'pizza_sizes',
        objects: [
          { icon: '🍕', label: '大きなピザ', size: 'large' },
          { icon: '🍕', label: '小さなピザ', size: 'small' }
        ],
        englishPrompt: 'The large pizza is ___ than the small pizza.',
        correctAnswer: 'bigger',
        explanation: '大きなピザと小さなピザを比べているので "bigger" が正解！',
        options: [
          { id: 1, text: 'bigger', meaning: 'より大きい', isCorrect: true },
          { id: 2, text: 'biggest', meaning: '一番大きい', isCorrect: false },
          { id: 3, text: 'as big as', meaning: '同じ大きさ', isCorrect: false }
        ]
      },
      {
        id: 'cats_jump',
        objects: [
          { icon: '🐱', label: '元気な猫', size: 'medium' },
          { icon: '😴', label: '眠い猫', size: 'medium' }
        ],
        englishPrompt: 'The energetic cat jumps ___ than the sleepy cat.',
        correctAnswer: 'higher',
        explanation: '2匹の猫のジャンプの高さを比べているので "higher" が正解！',
        options: [
          { id: 1, text: 'higher', meaning: 'より高く', isCorrect: true },
          { id: 2, text: 'highest', meaning: '一番高く', isCorrect: false },
          { id: 3, text: 'as high as', meaning: '同じ高さ', isCorrect: false }
        ]
      },
      {
        id: 'books_thick',
        objects: [
          { icon: '📚', label: '厚い本', size: 'large' },
          { icon: '📖', label: '薄い本', size: 'small' }
        ],
        englishPrompt: 'The thick book is ___ than the thin book.',
        correctAnswer: 'heavier',
        explanation: '厚い本と薄い本の重さを比べているので "heavier" が正解！',
        options: [
          { id: 1, text: 'heavier', meaning: 'より重い', isCorrect: true },
          { id: 2, text: 'heaviest', meaning: '一番重い', isCorrect: false },
          { id: 3, text: 'as heavy as', meaning: '同じ重さ', isCorrect: false }
        ]
      },
      {
        id: 'flowers_pretty',
        objects: [
          { icon: '🌹', label: 'バラ', size: 'medium' },
          { icon: '🌼', label: 'デイジー', size: 'medium' }
        ],
        englishPrompt: 'The rose is ___ than the daisy.',
        correctAnswer: 'prettier',
        explanation: 'バラとデイジーの美しさを比べているので "prettier" が正解！',
        options: [
          { id: 1, text: 'prettier', meaning: 'より美しい', isCorrect: true },
          { id: 2, text: 'prettiest', meaning: '一番美しい', isCorrect: false },
          { id: 3, text: 'as pretty as', meaning: '同じ美しさ', isCorrect: false }
        ]
      },
      {
        id: 'houses_tall',
        objects: [
          { icon: '🏢', label: 'ビル', size: 'huge' },
          { icon: '🏠', label: '家', size: 'medium' }
        ],
        englishPrompt: 'The building is ___ than the house.',
        correctAnswer: 'taller',
        explanation: 'ビルと家の高さを比べているので "taller" が正解！',
        options: [
          { id: 1, text: 'taller', meaning: 'より高い', isCorrect: true },
          { id: 2, text: 'tallest', meaning: '一番高い', isCorrect: false },
          { id: 3, text: 'as tall as', meaning: '同じ高さ', isCorrect: false }
        ]
      },
      {
        id: 'weather_hot',
        objects: [
          { icon: '☀️', label: '夏の日', size: 'medium' },
          { icon: '❄️', label: '冬の日', size: 'medium' }
        ],
        englishPrompt: 'Summer is ___ than winter.',
        correctAnswer: 'hotter',
        explanation: '夏と冬の気温を比べているので "hotter" が正解！',
        options: [
          { id: 1, text: 'hotter', meaning: 'より暑い', isCorrect: true },
          { id: 2, text: 'hottest', meaning: '一番暑い', isCorrect: false },
          { id: 3, text: 'as hot as', meaning: '同じ暑さ', isCorrect: false }
        ]
      },
      {
        id: 'fruits_sweet',
        objects: [
          { icon: '🍯', label: 'ハチミツ', size: 'medium' },
          { icon: '🍋', label: 'レモン', size: 'medium' }
        ],
        englishPrompt: 'Honey is ___ than lemon.',
        correctAnswer: 'sweeter',
        explanation: 'ハチミツとレモンの甘さを比べているので "sweeter" が正解！',
        options: [
          { id: 1, text: 'sweeter', meaning: 'より甘い', isCorrect: true },
          { id: 2, text: 'sweetest', meaning: '一番甘い', isCorrect: false },
          { id: 3, text: 'as sweet as', meaning: '同じ甘さ', isCorrect: false }
        ]
      },
      {
        id: 'students_smart',
        objects: [
          { icon: '👨‍🎓', label: '大学生', size: 'medium' },
          { icon: '👶', label: '赤ちゃん', size: 'small' }
        ],
        englishPrompt: 'The college student is ___ than the baby.',
        correctAnswer: 'smarter',
        explanation: '大学生と赤ちゃんの賢さを比べているので "smarter" が正解！',
        options: [
          { id: 1, text: 'smarter', meaning: 'より賢い', isCorrect: true },
          { id: 2, text: 'smartest', meaning: '一番賢い', isCorrect: false },
          { id: 3, text: 'as smart as', meaning: '同じ賢さ', isCorrect: false }
        ]
      },
      {
        id: 'balls_round',
        objects: [
          { icon: '🏀', label: 'バスケットボール', size: 'large' },
          { icon: '🏈', label: 'ラグビーボール', size: 'medium' }
        ],
        englishPrompt: 'The basketball is ___ than the rugby ball.',
        correctAnswer: 'rounder',
        explanation: 'バスケットボールとラグビーボールの丸さを比べているので "rounder" が正解！',
        options: [
          { id: 1, text: 'rounder', meaning: 'より丸い', isCorrect: true },
          { id: 2, text: 'roundest', meaning: '一番丸い', isCorrect: false },
          { id: 3, text: 'as round as', meaning: '同じ丸さ', isCorrect: false }
        ]
      },
      {
        id: 'music_loud',
        objects: [
          { icon: '🎸', label: 'ロック音楽', size: 'medium' },
          { icon: '🎵', label: 'クラシック音楽', size: 'medium' }
        ],
        englishPrompt: 'Rock music is ___ than classical music.',
        correctAnswer: 'louder',
        explanation: 'ロック音楽とクラシック音楽の音量を比べているので "louder" が正解！',
        options: [
          { id: 1, text: 'louder', meaning: 'より大きい音', isCorrect: true },
          { id: 2, text: 'loudest', meaning: '一番大きい音', isCorrect: false },
          { id: 3, text: 'as loud as', meaning: '同じ音量', isCorrect: false }
        ]
      },
      {
        id: 'water_cold',
        objects: [
          { icon: '🧊', label: '氷水', size: 'medium' },
          { icon: '🔥', label: 'お湯', size: 'medium' }
        ],
        englishPrompt: 'Ice water is ___ than hot water.',
        correctAnswer: 'colder',
        explanation: '氷水とお湯の温度を比べているので "colder" が正解！',
        options: [
          { id: 1, text: 'colder', meaning: 'より冷たい', isCorrect: true },
          { id: 2, text: 'coldest', meaning: '一番冷たい', isCorrect: false },
          { id: 3, text: 'as cold as', meaning: '同じ冷たさ', isCorrect: false }
        ]
      },
      {
        id: 'animals_fast',
        objects: [
          { icon: '🐆', label: 'チーター', size: 'medium' },
          { icon: '🐢', label: 'カメ', size: 'medium' }
        ],
        englishPrompt: 'The cheetah runs ___ than the turtle.',
        correctAnswer: 'faster',
        explanation: 'チーターとカメの走る速さを比べているので "faster" が正解！',
        options: [
          { id: 1, text: 'faster', meaning: 'より速く', isCorrect: true },
          { id: 2, text: 'fastest', meaning: '一番速く', isCorrect: false },
          { id: 3, text: 'as fast as', meaning: '同じ速さ', isCorrect: false }
        ]
      },
      {
        id: 'shoes_new',
        objects: [
          { icon: '👟', label: '新しい靴', size: 'medium' },
          { icon: '🥾', label: '古い靴', size: 'medium' }
        ],
        englishPrompt: 'The new shoes are ___ than the old shoes.',
        correctAnswer: 'cleaner',
        explanation: '新しい靴と古い靴のきれいさを比べているので "cleaner" が正解！',
        options: [
          { id: 1, text: 'cleaner', meaning: 'よりきれい', isCorrect: true },
          { id: 2, text: 'cleanest', meaning: '一番きれい', isCorrect: false },
          { id: 3, text: 'as clean as', meaning: '同じきれいさ', isCorrect: false }
        ]
      },
      {
        id: 'food_spicy',
        objects: [
          { icon: '🌶️', label: '辛い料理', size: 'medium' },
          { icon: '🥛', label: 'ミルク', size: 'medium' }
        ],
        englishPrompt: 'Spicy food is ___ than milk.',
        correctAnswer: 'hotter',
        explanation: '辛い料理とミルクの辛さを比べているので "hotter" が正解！',
        options: [
          { id: 1, text: 'hotter', meaning: 'より辛い', isCorrect: true },
          { id: 2, text: 'hottest', meaning: '一番辛い', isCorrect: false },
          { id: 3, text: 'as hot as', meaning: '同じ辛さ', isCorrect: false }
        ]
      },
      {
        id: 'bags_heavy',
        objects: [
          { icon: '🎒', label: '重いバッグ', size: 'large' },
          { icon: '👜', label: '軽いバッグ', size: 'small' }
        ],
        englishPrompt: 'The backpack is ___ than the purse.',
        correctAnswer: 'heavier',
        explanation: 'バックパックと財布の重さを比べているので "heavier" が正解！',
        options: [
          { id: 1, text: 'heavier', meaning: 'より重い', isCorrect: true },
          { id: 2, text: 'heaviest', meaning: '一番重い', isCorrect: false },
          { id: 3, text: 'as heavy as', meaning: '同じ重さ', isCorrect: false }
        ]
      },
      {
        id: 'lights_bright',
        objects: [
          { icon: '💡', label: '電球', size: 'medium' },
          { icon: '🕯️', label: 'ろうそく', size: 'medium' }
        ],
        englishPrompt: 'The light bulb is ___ than the candle.',
        correctAnswer: 'brighter',
        explanation: '電球とろうそくの明るさを比べているので "brighter" が正解！',
        options: [
          { id: 1, text: 'brighter', meaning: 'より明るい', isCorrect: true },
          { id: 2, text: 'brightest', meaning: '一番明るい', isCorrect: false },
          { id: 3, text: 'as bright as', meaning: '同じ明るさ', isCorrect: false }
        ]
      },
      {
        id: 'toys_fun',
        objects: [
          { icon: '🎮', label: 'ゲーム', size: 'medium' },
          { icon: '📝', label: '宿題', size: 'medium' }
        ],
        englishPrompt: 'Playing games is ___ than doing homework.',
        correctAnswer: 'more fun',
        explanation: 'ゲームと宿題の楽しさを比べているので "more fun" が正解！',
        options: [
          { id: 1, text: 'more fun', meaning: 'より楽しい', isCorrect: true },
          { id: 2, text: 'most fun', meaning: '一番楽しい', isCorrect: false },
          { id: 3, text: 'as fun as', meaning: '同じ楽しさ', isCorrect: false }
        ]
      },
      
      // SUPERLATIVE QUESTIONS (20 questions) - 3 or more things
      {
        id: 'three_trees',
        objects: [
          { icon: '🌳', label: '高い木', size: 'huge' },
          { icon: '🌲', label: '中くらいの木', size: 'large' },
          { icon: '🌿', label: '小さな木', size: 'small' }
        ],
        englishPrompt: 'The oak tree is the ___ of the three trees.',
        correctAnswer: 'tallest',
        explanation: '3本の木の中で一番高いので "tallest" が正解！',
        options: [
          { id: 1, text: 'taller', meaning: 'より高い', isCorrect: false },
          { id: 2, text: 'tallest', meaning: '一番高い', isCorrect: true },
          { id: 3, text: 'as tall as', meaning: '同じ高さ', isCorrect: false }
        ]
      },
      {
        id: 'four_animals',
        objects: [
          { icon: '🐘', label: 'ゾウ', size: 'huge' },
          { icon: '🦒', label: 'キリン', size: 'large' },
          { icon: '🐎', label: 'ウマ', size: 'medium' },
          { icon: '🐰', label: 'ウサギ', size: 'small' }
        ],
        englishPrompt: 'The elephant is the ___ animal.',
        correctAnswer: 'biggest',
        explanation: '4匹の動物の中で一番大きいので "biggest" が正解！',
        options: [
          { id: 1, text: 'bigger', meaning: 'より大きい', isCorrect: false },
          { id: 2, text: 'biggest', meaning: '一番大きい', isCorrect: true },
          { id: 3, text: 'as big as', meaning: '同じ大きさ', isCorrect: false }
        ]
      },
      {
        id: 'ice_cream_flavors',
        objects: [
          { icon: '🍦', label: 'チョコ', size: 'medium' },
          { icon: '🍧', label: 'いちご', size: 'medium' },
          { icon: '🍨', label: 'バニラ', size: 'medium' }
        ],
        englishPrompt: 'Chocolate ice cream is the ___ delicious.',
        correctAnswer: 'most',
        explanation: '3つのアイスの中で一番おいしいので "most delicious" が正解！',
        options: [
          { id: 1, text: 'more delicious', meaning: 'より美味しい', isCorrect: false },
          { id: 2, text: 'most delicious', meaning: '一番美味しい', isCorrect: true },
          { id: 3, text: 'as delicious as', meaning: '同じ美味しさ', isCorrect: false }
        ]
      },
      {
        id: 'three_mountains',
        objects: [
          { icon: '🏔️', label: '富士山', size: 'huge' },
          { icon: '⛰️', label: '中くらいの山', size: 'large' },
          { icon: '🗻', label: '小さな丘', size: 'medium' }
        ],
        englishPrompt: 'Mt. Fuji is the ___ of the three.',
        correctAnswer: 'highest',
        explanation: '3つの山の中で富士山が一番高いので "highest" が正解！',
        options: [
          { id: 1, text: 'higher', meaning: 'より高い', isCorrect: false },
          { id: 2, text: 'highest', meaning: '一番高い', isCorrect: true },
          { id: 3, text: 'as high as', meaning: '同じ高さ', isCorrect: false }
        ]
      },
      {
        id: 'three_students',
        objects: [
          { icon: '🧠', label: '天才', size: 'large' },
          { icon: '📚', label: '普通の子', size: 'medium' },
          { icon: '😴', label: 'おやすみ中', size: 'small' }
        ],
        englishPrompt: 'The genius is the ___ student in class.',
        correctAnswer: 'smartest',
        explanation: 'クラスの中で天才が一番賢いので "smartest" が正解！',
        options: [
          { id: 1, text: 'smarter', meaning: 'より賢い', isCorrect: false },
          { id: 2, text: 'smartest', meaning: '一番賢い', isCorrect: true },
          { id: 3, text: 'as smart as', meaning: '同じ賢さ', isCorrect: false }
        ]
      },
      {
        id: 'three_cars',
        objects: [
          { icon: '🏎️', label: 'レーシングカー', size: 'medium' },
          { icon: '🚗', label: '普通の車', size: 'medium' },
          { icon: '🐌', label: 'カタツムリ', size: 'small' }
        ],
        englishPrompt: 'The race car is the ___ of the three.',
        correctAnswer: 'fastest',
        explanation: '3つの中でレーシングカーが一番速いので "fastest" が正解！',
        options: [
          { id: 1, text: 'faster', meaning: 'より速い', isCorrect: false },
          { id: 2, text: 'fastest', meaning: '一番速い', isCorrect: true },
          { id: 3, text: 'as fast as', meaning: '同じ速さ', isCorrect: false }
        ]
      },
      {
        id: 'three_flowers',
        objects: [
          { icon: '🌹', label: 'バラ', size: 'medium' },
          { icon: '🌻', label: 'ひまわり', size: 'large' },
          { icon: '🌼', label: 'デイジー', size: 'small' }
        ],
        englishPrompt: 'The rose is the ___ beautiful flower.',
        correctAnswer: 'most',
        explanation: '3つの花の中でバラが一番美しいので "most beautiful" が正解！',
        options: [
          { id: 1, text: 'more beautiful', meaning: 'より美しい', isCorrect: false },
          { id: 2, text: 'most beautiful', meaning: '一番美しい', isCorrect: true },
          { id: 3, text: 'as beautiful as', meaning: '同じ美しさ', isCorrect: false }
        ]
      },
      {
        id: 'three_foods',
        objects: [
          { icon: '🌶️', label: '激辛料理', size: 'medium' },
          { icon: '🍛', label: '中辛料理', size: 'medium' },
          { icon: '🥛', label: 'ミルク', size: 'medium' }
        ],
        englishPrompt: 'The super spicy dish is the ___ of all.',
        correctAnswer: 'hottest',
        explanation: '3つの中で激辛料理が一番辛いので "hottest" が正解！',
        options: [
          { id: 1, text: 'hotter', meaning: 'より辛い', isCorrect: false },
          { id: 2, text: 'hottest', meaning: '一番辛い', isCorrect: true },
          { id: 3, text: 'as hot as', meaning: '同じ辛さ', isCorrect: false }
        ]
      },
      {
        id: 'three_buildings',
        objects: [
          { icon: '🏢', label: '超高層ビル', size: 'huge' },
          { icon: '🏠', label: '2階建て家', size: 'medium' },
          { icon: '⛺', label: 'テント', size: 'small' }
        ],
        englishPrompt: 'The skyscraper is the ___ building.',
        correctAnswer: 'tallest',
        explanation: '3つの建物の中で超高層ビルが一番高いので "tallest" が正解！',
        options: [
          { id: 1, text: 'taller', meaning: 'より高い', isCorrect: false },
          { id: 2, text: 'tallest', meaning: '一番高い', isCorrect: true },
          { id: 3, text: 'as tall as', meaning: '同じ高さ', isCorrect: false }
        ]
      },
      {
        id: 'three_seasons',
        objects: [
          { icon: '☀️', label: '夏', size: 'medium' },
          { icon: '🌸', label: '春', size: 'medium' },
          { icon: '❄️', label: '冬', size: 'medium' }
        ],
        englishPrompt: 'Summer is the ___ season of the year.',
        correctAnswer: 'hottest',
        explanation: '3つの季節の中で夏が一番暑いので "hottest" が正解！',
        options: [
          { id: 1, text: 'hotter', meaning: 'より暑い', isCorrect: false },
          { id: 2, text: 'hottest', meaning: '一番暑い', isCorrect: true },
          { id: 3, text: 'as hot as', meaning: '同じ暑さ', isCorrect: false }
        ]
      },
      {
        id: 'three_gems',
        objects: [
          { icon: '💎', label: 'ダイヤモンド', size: 'medium' },
          { icon: '💍', label: 'ルビー', size: 'medium' },
          { icon: '🪙', label: '銅', size: 'medium' }
        ],
        englishPrompt: 'Diamond is the ___ expensive gem.',
        correctAnswer: 'most',
        explanation: '3つの宝石の中でダイヤモンドが一番高価なので "most expensive" が正解！',
        options: [
          { id: 1, text: 'more expensive', meaning: 'より高価', isCorrect: false },
          { id: 2, text: 'most expensive', meaning: '一番高価', isCorrect: true },
          { id: 3, text: 'as expensive as', meaning: '同じ値段', isCorrect: false }
        ]
      },
      {
        id: 'three_sports',
        objects: [
          { icon: '⚽', label: 'サッカー', size: 'medium' },
          { icon: '🏀', label: 'バスケ', size: 'medium' },
          { icon: '🎾', label: 'テニス', size: 'medium' }
        ],
        englishPrompt: 'Soccer is the ___ popular sport in the world.',
        correctAnswer: 'most',
        explanation: '3つのスポーツの中でサッカーが一番人気なので "most popular" が正解！',
        options: [
          { id: 1, text: 'more popular', meaning: 'より人気', isCorrect: false },
          { id: 2, text: 'most popular', meaning: '一番人気', isCorrect: true },
          { id: 3, text: 'as popular as', meaning: '同じ人気', isCorrect: false }
        ]
      },
      {
        id: 'three_colors',
        objects: [
          { icon: '🌞', label: '黄色', size: 'medium' },
          { icon: '🌙', label: '青色', size: 'medium' },
          { icon: '⚫', label: '黒色', size: 'medium' }
        ],
        englishPrompt: 'Yellow is the ___ bright color.',
        correctAnswer: 'brightest',
        explanation: '3つの色の中で黄色が一番明るいので "brightest" が正解！',
        options: [
          { id: 1, text: 'brighter', meaning: 'より明るい', isCorrect: false },
          { id: 2, text: 'brightest', meaning: '一番明るい', isCorrect: true },
          { id: 3, text: 'as bright as', meaning: '同じ明るさ', isCorrect: false }
        ]
      },
      {
        id: 'three_ages',
        objects: [
          { icon: '👴', label: 'おじいさん', size: 'medium' },
          { icon: '👨', label: 'お父さん', size: 'medium' },
          { icon: '👶', label: '赤ちゃん', size: 'small' }
        ],
        englishPrompt: 'Grandfather is the ___ person in the family.',
        correctAnswer: 'oldest',
        explanation: '家族の中でおじいさんが一番年上なので "oldest" が正解！',
        options: [
          { id: 1, text: 'older', meaning: 'より年上', isCorrect: false },
          { id: 2, text: 'oldest', meaning: '一番年上', isCorrect: true },
          { id: 3, text: 'as old as', meaning: '同じ年', isCorrect: false }
        ]
      },
      {
        id: 'three_animals_heavy',
        objects: [
          { icon: '🐋', label: 'クジラ', size: 'huge' },
          { icon: '🐘', label: 'ゾウ', size: 'large' },
          { icon: '🐭', label: 'ネズミ', size: 'small' }
        ],
        englishPrompt: 'The whale is the ___ animal.',
        correctAnswer: 'heaviest',
        explanation: '3匹の動物の中でクジラが一番重いので "heaviest" が正解！',
        options: [
          { id: 1, text: 'heavier', meaning: 'より重い', isCorrect: false },
          { id: 2, text: 'heaviest', meaning: '一番重い', isCorrect: true },
          { id: 3, text: 'as heavy as', meaning: '同じ重さ', isCorrect: false }
        ]
      },
      {
        id: 'three_instruments',
        objects: [
          { icon: '🥁', label: 'ドラム', size: 'medium' },
          { icon: '🎸', label: 'ギター', size: 'medium' },
          { icon: '🎵', label: 'オカリナ', size: 'small' }
        ],
        englishPrompt: 'The drums are the ___ instrument.',
        correctAnswer: 'loudest',
        explanation: '3つの楽器の中でドラムが一番音が大きいので "loudest" が正解！',
        options: [
          { id: 1, text: 'louder', meaning: 'より大きい音', isCorrect: false },
          { id: 2, text: 'loudest', meaning: '一番大きい音', isCorrect: true },
          { id: 3, text: 'as loud as', meaning: '同じ音量', isCorrect: false }
        ]
      },
      {
        id: 'three_fruits',
        objects: [
          { icon: '🍯', label: 'ハチミツ', size: 'medium' },
          { icon: '🍎', label: 'りんご', size: 'medium' },
          { icon: '🍋', label: 'レモン', size: 'medium' }
        ],
        englishPrompt: 'Honey is the ___ of the three.',
        correctAnswer: 'sweetest',
        explanation: '3つの中でハチミツが一番甘いので "sweetest" が正解！',
        options: [
          { id: 1, text: 'sweeter', meaning: 'より甘い', isCorrect: false },
          { id: 2, text: 'sweetest', meaning: '一番甘い', isCorrect: true },
          { id: 3, text: 'as sweet as', meaning: '同じ甘さ', isCorrect: false }
        ]
      },
      {
        id: 'three_subjects',
        objects: [
          { icon: '🧮', label: '数学', size: 'medium' },
          { icon: '🎨', label: '美術', size: 'medium' },
          { icon: '⚽', label: '体育', size: 'medium' }
        ],
        englishPrompt: 'Math is the ___ difficult subject.',
        correctAnswer: 'most',
        explanation: '3つの科目の中で数学が一番難しいので "most difficult" が正解！',
        options: [
          { id: 1, text: 'more difficult', meaning: 'より難しい', isCorrect: false },
          { id: 2, text: 'most difficult', meaning: '一番難しい', isCorrect: true },
          { id: 3, text: 'as difficult as', meaning: '同じ難しさ', isCorrect: false }
        ]
      },
      {
        id: 'three_planets',
        objects: [
          { icon: '☀️', label: '太陽', size: 'huge' },
          { icon: '🌍', label: '地球', size: 'large' },
          { icon: '🌙', label: '月', size: 'medium' }
        ],
        englishPrompt: 'The sun is the ___ of the three.',
        correctAnswer: 'biggest',
        explanation: '3つの天体の中で太陽が一番大きいので "biggest" が正解！',
        options: [
          { id: 1, text: 'bigger', meaning: 'より大きい', isCorrect: false },
          { id: 2, text: 'biggest', meaning: '一番大きい', isCorrect: true },
          { id: 3, text: 'as big as', meaning: '同じ大きさ', isCorrect: false }
        ]
      },

      // AS...AS QUESTIONS (10 questions) - same/equal
      {
        id: 'twin_sisters',
        objects: [
          { icon: '👭', label: '双子の姉妹', size: 'medium' },
          { icon: '👯', label: '同じ身長', size: 'medium' }
        ],
        englishPrompt: 'The twin sisters are ___ tall.',
        correctAnswer: 'as...as',
        explanation: '双子は同じ身長なので "as tall as" が正解！',
        options: [
          { id: 1, text: 'taller', meaning: 'より高い', isCorrect: false },
          { id: 2, text: 'tallest', meaning: '一番高い', isCorrect: false },
          { id: 3, text: 'as tall as', meaning: '同じ高さ', isCorrect: true }
        ]
      },
      {
        id: 'same_balls',
        objects: [
          { icon: '⚽', label: 'サッカーボール', size: 'medium' },
          { icon: '🏀', label: 'バスケボール', size: 'medium' }
        ],
        englishPrompt: 'The soccer ball is ___ heavy ___ the basketball.',
        correctAnswer: 'as...as',
        explanation: '2つのボールが同じ重さなので "as heavy as" が正解！',
        options: [
          { id: 1, text: 'heavier than', meaning: 'より重い', isCorrect: false },
          { id: 2, text: 'heaviest', meaning: '一番重い', isCorrect: false },
          { id: 3, text: 'as heavy as', meaning: '同じ重さ', isCorrect: true }
        ]
      },
      {
        id: 'same_age_kids',
        objects: [
          { icon: '👦', label: '10歳の男の子', size: 'medium' },
          { icon: '👧', label: '10歳の女の子', size: 'medium' }
        ],
        englishPrompt: 'The boy is ___ old ___ the girl.',
        correctAnswer: 'as...as',
        explanation: '2人とも10歳で同い年なので "as old as" が正解！',
        options: [
          { id: 1, text: 'older than', meaning: 'より年上', isCorrect: false },
          { id: 2, text: 'oldest', meaning: '一番年上', isCorrect: false },
          { id: 3, text: 'as old as', meaning: '同じ年', isCorrect: true }
        ]
      },
      {
        id: 'same_price',
        objects: [
          { icon: '🍎', label: '100円のりんご', size: 'medium' },
          { icon: '🍌', label: '100円のバナナ', size: 'medium' }
        ],
        englishPrompt: 'The apple costs ___ much ___ the banana.',
        correctAnswer: 'as...as',
        explanation: 'どちらも100円で同じ値段なので "as much as" が正解！',
        options: [
          { id: 1, text: 'more than', meaning: 'より高い', isCorrect: false },
          { id: 2, text: 'the most', meaning: '一番高い', isCorrect: false },
          { id: 3, text: 'as much as', meaning: '同じ値段', isCorrect: true }
        ]
      },
      {
        id: 'same_speed',
        objects: [
          { icon: '🚗', label: '60km/hの車', size: 'medium' },
          { icon: '🏃', label: '60km/hのランナー', size: 'medium' }
        ],
        englishPrompt: 'The car goes ___ fast ___ the super runner.',
        correctAnswer: 'as...as',
        explanation: 'どちらも60km/hで同じ速度なので "as fast as" が正解！',
        options: [
          { id: 1, text: 'faster than', meaning: 'より速い', isCorrect: false },
          { id: 2, text: 'fastest', meaning: '一番速い', isCorrect: false },
          { id: 3, text: 'as fast as', meaning: '同じ速さ', isCorrect: true }
        ]
      },
      {
        id: 'same_size_books',
        objects: [
          { icon: '📕', label: '赤い本', size: 'medium' },
          { icon: '📘', label: '青い本', size: 'medium' }
        ],
        englishPrompt: 'The red book is ___ thick ___ the blue book.',
        correctAnswer: 'as...as',
        explanation: '2冊の本が同じ厚さなので "as thick as" が正解！',
        options: [
          { id: 1, text: 'thicker than', meaning: 'より厚い', isCorrect: false },
          { id: 2, text: 'thickest', meaning: '一番厚い', isCorrect: false },
          { id: 3, text: 'as thick as', meaning: '同じ厚さ', isCorrect: true }
        ]
      },
      {
        id: 'same_temperature',
        objects: [
          { icon: '🌡️', label: '25度の部屋', size: 'medium' },
          { icon: '🏠', label: '25度の外', size: 'medium' }
        ],
        englishPrompt: 'Inside is ___ warm ___ outside today.',
        correctAnswer: 'as...as',
        explanation: '室内も外も25度で同じ温度なので "as warm as" が正解！',
        options: [
          { id: 1, text: 'warmer than', meaning: 'より暖かい', isCorrect: false },
          { id: 2, text: 'warmest', meaning: '一番暖かい', isCorrect: false },
          { id: 3, text: 'as warm as', meaning: '同じ暖かさ', isCorrect: true }
        ]
      },
      {
        id: 'same_smart',
        objects: [
          { icon: '👨‍🎓', label: '大学生A', size: 'medium' },
          { icon: '👩‍🎓', label: '大学生B', size: 'medium' }
        ],
        englishPrompt: 'Student A is ___ smart ___ Student B.',
        correctAnswer: 'as...as',
        explanation: '2人の大学生が同じ頭の良さなので "as smart as" が正解！',
        options: [
          { id: 1, text: 'smarter than', meaning: 'より賢い', isCorrect: false },
          { id: 2, text: 'smartest', meaning: '一番賢い', isCorrect: false },
          { id: 3, text: 'as smart as', meaning: '同じ賢さ', isCorrect: true }
        ]
      },
      {
        id: 'same_color',
        objects: [
          { icon: '🌹', label: '赤いバラ', size: 'medium' },
          { icon: '🍎', label: '赤いりんご', size: 'medium' }
        ],
        englishPrompt: 'The rose is ___ red ___ the apple.',
        correctAnswer: 'as...as',
        explanation: 'バラもりんごも同じ赤色なので "as red as" が正解！',
        options: [
          { id: 1, text: 'redder than', meaning: 'より赤い', isCorrect: false },
          { id: 2, text: 'reddest', meaning: '一番赤い', isCorrect: false },
          { id: 3, text: 'as red as', meaning: '同じ赤さ', isCorrect: true }
        ]
      },
      {
        id: 'same_quiet',
        objects: [
          { icon: '📚', label: '図書館', size: 'medium' },
          { icon: '🛌', label: '寝室', size: 'medium' }
        ],
        englishPrompt: 'The library is ___ quiet ___ the bedroom.',
        correctAnswer: 'as...as',
        explanation: '図書館も寝室も同じ静けさなので "as quiet as" が正解！',
        options: [
          { id: 1, text: 'quieter than', meaning: 'より静か', isCorrect: false },
          { id: 2, text: 'quietest', meaning: '一番静か', isCorrect: false },
          { id: 3, text: 'as quiet as', meaning: '同じ静けさ', isCorrect: true }
        ]
      }
    ]

    const generateSituation = () => {
      // Get available questions (not used yet)
      let availableQuestions = situationDatabase.filter(q => !usedQuestionIds.value.includes(q.id))
      
      // If all questions used, reset for new round
      if (availableQuestions.length === 0) {
        usedQuestionIds.value = []
        availableQuestions = [...situationDatabase]
      }
      
      // Select random situation from available questions
      const randomIndex = Math.floor(Math.random() * availableQuestions.length)
      const randomSituation = availableQuestions[randomIndex]
      
      // Mark this question as used
      usedQuestionIds.value.push(randomSituation.id)
      
      currentSituation.value = randomSituation
      currentOptions.value = randomSituation.options
    }

    const selectAnswer = (optionId) => {
      if (props.showResult) return
      
      emit('answer-selected', optionId)
    }

    const playAudio = (text) => {
      if (isPlayingAudio.value) return
      
      isPlayingAudio.value = true
      
      // Use speech synthesis to play the text
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        utterance.pitch = 1.1
        
        utterance.onend = () => {
          isPlayingAudio.value = false
        }
        
        utterance.onerror = () => {
          isPlayingAudio.value = false
        }
        
        speechSynthesis.speak(utterance)
      } else {
        isPlayingAudio.value = false
      }
    }

    const getFeedbackExplanation = () => {
      return currentSituation.value?.explanation || ''
    }

    // Watch for question changes
    watch(() => props.question, () => {
      if (props.question) {
        generateSituation()
      }
    }, { immediate: true })

    // Watch for result display
    watch(() => props.showResult, (newVal) => {
      if (newVal && currentSituation.value) {
        // Find the correct answer from options
        const correctOption = currentSituation.value.options.find(opt => opt.isCorrect)
        isCorrect.value = props.selectedAnswer === correctOption?.id
      }
    })

    // Update parent component with correct answer for checking
    watch(currentSituation, (newSituation) => {
      if (props.question && newSituation) {
        const correctOption = newSituation.options.find(opt => opt.isCorrect)
        props.question.correctAnswer = correctOption?.id
      }
    })

    onMounted(() => {
      generateSituation()
    })

    const proceedToNext = () => {
      emit('next-question')
    }

    return {
      currentSituation,
      currentOptions,
      isCorrect,
      isPlayingAudio,
      selectAnswer,
      playAudio,
      getFeedbackExplanation,
      proceedToNext,
      selectedAnswer: computed(() => props.selectedAnswer)
    }
  }
}
</script>

<style scoped>
.format-identification-stage {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.question-header {
  text-align: center;
  margin-bottom: 15px;
}

.question-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 5px;
}

.question-instruction {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Situation Display */
.situation-display {
  position: relative;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.05), rgba(0, 100, 200, 0.02));
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  margin-bottom: 15px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.objects-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
}

.object-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.object-item.small {
  transform: scale(0.8);
}

.object-item.medium {
  transform: scale(1);
}

.object-item.large {
  transform: scale(1.2);
}

.object-item.huge {
  transform: scale(1.4);
}

.object-icon {
  font-size: 2rem;
  margin-bottom: 6px;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
}

.object-label {
  font-size: 0.7rem;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 3px;
}

.object-value {
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: bold;
}

/* Comparison Effects */
.comparison-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.beam-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 4px;
  border-radius: 2px;
  animation: beamPulse 2s infinite;
}

.beam-effect.comparative {
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
}

.beam-effect.superlative {
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  width: 300px;
}

.beam-effect.as_as {
  background: linear-gradient(90deg, transparent, #10b981, transparent);
}

@keyframes beamPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Format Buttons */
.format-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.format-btn {
  padding: 25px 20px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.format-btn:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 212, 255, 0.1);
}

.format-btn.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.15), rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
}

.format-btn.correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.1));
  animation: correctPulse 1.5s ease-out;
}

.format-btn.incorrect {
  border-color: #ef4444;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(200, 50, 50, 0.1));
  animation: incorrectShake 0.8s ease-out;
}

.format-btn.show-correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.08));
}

.format-btn:disabled {
  cursor: not-allowed;
}

.format-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
}

.format-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 10px;
}

.format-description {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* Sentence Display */
.sentence-display {
  margin-bottom: 15px;
  text-align: center;
}

.sentence-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(145deg, rgba(0, 212, 255, 0.08), rgba(0, 100, 200, 0.04));
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.prompt-icon {
  font-size: 1.3rem;
  filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.4));
}

.prompt-text {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

/* Answer Buttons */
.answer-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}

.answer-btn {
  position: relative;
  padding: 12px;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.answer-btn:hover:not(:disabled) {
  border-color: rgba(0, 212, 255, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.1);
}

.answer-btn.selected {
  border-color: #00ffea;
  background: linear-gradient(145deg, rgba(0, 255, 234, 0.15), rgba(0, 200, 200, 0.1));
  box-shadow: 0 0 20px rgba(0, 255, 234, 0.3);
}

.answer-btn.correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.2), rgba(0, 150, 100, 0.1));
  animation: correctPulse 1.5s ease-out;
}

.answer-btn.incorrect {
  border-color: #ef4444;
  background: linear-gradient(145deg, rgba(239, 68, 68, 0.2), rgba(200, 50, 50, 0.1));
  animation: incorrectShake 0.8s ease-out;
}

.answer-btn.show-correct {
  border-color: #10b981;
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.08));
}

.answer-btn:disabled {
  cursor: not-allowed;
}

.answer-text {
  font-size: 1rem;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 6px;
}

.answer-meaning {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.audio-btn-mini {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-btn-mini:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.3);
  transform: scale(1.1);
}

.audio-btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.answer-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.effect-shine {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent);
  border-radius: 15px;
  animation: shineEffect 2s infinite;
}

@keyframes shineEffect {
  0% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.8); }
}

/* Format Visual Effects */
.format-visual {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.visual-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  animation: visualPulse 1s infinite;
}

.format-visual.comparative .visual-effect {
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent);
}

.format-visual.superlative .visual-effect {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent);
}

.format-visual.as_as .visual-effect {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent);
}

@keyframes visualPulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
}

/* Feedback Display */
.feedback-display {
  margin-top: 10px;
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feedback-content.correct {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 150, 100, 0.1));
  border: 2px solid rgba(16, 185, 129, 0.3);
}

.feedback-content.incorrect {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(200, 50, 50, 0.1));
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.feedback-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feedback-text {
  flex: 1;
}

.feedback-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.feedback-content.correct .feedback-title {
  color: #10b981;
}

.feedback-content.incorrect .feedback-title {
  color: #ef4444;
}

.feedback-explanation {
  color: #94a3b8;
  line-height: 1.3;
  font-size: 0.85rem;
}

/* Next Question Button */
.next-button-container {
  margin-top: 10px;
  text-align: center;
}

.next-question-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.next-question-btn.correct {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.next-question-btn.correct:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.next-question-btn.incorrect {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.next-question-btn.incorrect:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.4);
}

/* Animations */
@keyframes correctPulse {
  0% { transform: scale(1); }
  25% { transform: scale(1.05); box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
  50% { transform: scale(1.08); box-shadow: 0 0 40px rgba(16, 185, 129, 0.7); }
  75% { transform: scale(1.05); box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
  100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
}

@keyframes incorrectShake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-8px) rotate(-1deg); }
  20% { transform: translateX(8px) rotate(1deg); }
  30% { transform: translateX(-6px) rotate(-1deg); }
  40% { transform: translateX(6px) rotate(1deg); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .answer-buttons {
    grid-template-columns: 1fr;
  }
  
  .objects-container {
    flex-direction: column;
    align-items: center;
  }
  
  .feedback-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .sentence-prompt {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .prompt-text {
    font-size: 0.9rem;
  }
  
  .object-item.small,
  .object-item.medium,
  .object-item.large,
  .object-item.huge {
    transform: scale(1);
  }
}
</style>