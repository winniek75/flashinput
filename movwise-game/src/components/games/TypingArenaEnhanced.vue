<template>
  <div class="min-h-screen galaxy-background p-6 relative overflow-hidden">
    <!-- Animated star layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Header with back button -->
      <button
        @click="handleBack"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
      >
        ← 戻る
      </button>

      <!-- Mode Selection Screen -->
      <div v-if="gameMode === 'selection'" class="mode-selection-container">
        <h1 class="text-5xl font-bold galaxy-text-primary mb-12 text-center cosmic-glow">
          ⌨️ 英検タイピング・アリーナ
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Story Mode Card -->
          <div 
            @click="selectMode('story')"
            class="mode-card story-mode-card p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <div class="mode-icon text-6xl mb-4">🌌</div>
            <h3 class="text-3xl font-bold text-white mb-2">ストーリーモード</h3>
            <p class="text-lg text-slate-200 mb-4">銀河英語救出作戦</p>
            <div class="progress-indicator">
              <div class="progress-bar-bg">
                <div class="progress-bar" :style="{width: storyProgress + '%'}"></div>
              </div>
              <span class="text-sm mt-2">Chapter {{ arenaStore.storyMode.currentChapter }}/5</span>
            </div>
            <div class="mt-4 text-sm text-slate-300">
              <div>🏆 {{ arenaStore.characterTitle }}</div>
              <div>⭐ Lv.{{ arenaStore.character.level }}</div>
            </div>
          </div>
          
          <!-- Practice Mode Card -->
          <div 
            @click="selectMode('practice')"
            class="mode-card practice-mode-card p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all duration-300"
          >
            <div class="mode-icon text-6xl mb-4">⚡</div>
            <h3 class="text-3xl font-bold text-white mb-2">練習モード</h3>
            <p class="text-lg text-slate-200 mb-4">自由にスキルアップ</p>
            <div class="quick-stats space-y-2">
              <div class="stat-item">
                <span class="stat-label">最高WPM:</span>
                <span class="stat-value">{{ arenaStore.practiceStats.bestWPM }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均正確率:</span>
                <span class="stat-value">{{ Math.round(arenaStore.practiceStats.averageAccuracy) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">総セッション数:</span>
                <span class="stat-value">{{ arenaStore.practiceStats.totalSessions }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Progress -->
        <div class="mt-12 text-center">
          <div class="galaxy-card rounded-2xl p-6 max-w-2xl mx-auto">
            <h4 class="text-xl font-bold text-white mb-4">総合進捗</h4>
            <div class="overall-progress-bar">
              <div class="progress-fill" :style="{width: arenaStore.overallProgress + '%'}"></div>
            </div>
            <p class="mt-2 text-slate-300">{{ arenaStore.overallProgress }}% 完了</p>
          </div>
        </div>
      </div>

      <!-- Story Mode Hub -->
      <StoryModeHub 
        v-else-if="gameMode === 'story' && !inGame"
        @start-stage="startStoryStage"
        @back="gameMode = 'selection'"
      />

      <!-- Practice Mode Level Selection (Original) -->
      <div v-else-if="gameMode === 'practice' && gameState === 'levelSelect'" 
           class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-4 text-shadow-lg">📚 英検レベルを選択</h2>
          <p class="text-slate-200 text-lg font-medium bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            あなたの英語レベルに合わせたタイピング練習を始めましょう
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="(level, key) in levels" 
            :key="key"
            @click="selectLevel(key)"
            class="level-card p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2"
            :class="selectedLevel === key ? 'border-galaxy-nova-orange bg-orange-500/10' : 'border-galaxy-cosmic-purple'"
          >
            <div class="text-center">
              <div class="text-3xl mb-2">{{ level.icon }}</div>
              <div class="text-xl font-bold text-white mb-2 text-shadow-md">{{ level.name }}</div>
              <div class="text-sm text-slate-200 font-medium mb-3 bg-black/20 backdrop-blur-sm rounded px-2 py-1">{{ level.description }}</div>
              <div class="text-xs text-slate-300 font-semibold bg-slate-800/40 backdrop-blur-sm rounded px-2 py-1">
                語彙数: {{ level.wordCount }}語 | 文章: {{ level.sentenceCount }}文
              </div>
              <!-- Practice Mode Progress -->
              <div class="mt-3">
                <div class="mini-progress-bar">
                  <div class="mini-progress-fill" 
                       :style="{width: getPracticeProgress(key) + '%'}"></div>
                </div>
                <span class="text-xs text-slate-400">
                  {{ arenaStore.practiceStats.levelProgress[key].completed }}/{{ arenaStore.practiceStats.levelProgress[key].total }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8 space-x-4">
          <button
            @click="startTyping"
            :disabled="!selectedLevel"
            class="galaxy-button galaxy-button-primary px-8 py-4 rounded-2xl font-bold text-xl hover:shadow-lg transition-all duration-200"
            :class="{ 'opacity-50 cursor-not-allowed': !selectedLevel }"
          >
            タイピング開始！
          </button>
          <button
            @click="gameMode = 'selection'"
            class="galaxy-button galaxy-button-secondary px-6 py-4 rounded-2xl font-bold text-xl"
          >
            モード選択に戻る
          </button>
        </div>
      </div>

      <!-- Character Status Panel (Story Mode) -->
      <CharacterStatusPanel 
        v-if="gameMode === 'story' && inGame"
        :character="arenaStore.character"
        :pet="currentPet"
        class="mb-6"
      />

      <!-- Typing Game Area (Shared) -->
      <div v-else-if="gameState === 'typing' && inGame" class="galaxy-card rounded-3xl p-8 shadow-2xl mb-6">
        <!-- Boss Battle UI -->
        <BossBattleUI 
          v-if="isBossBattle"
          :boss="currentBoss"
          :bossHP="bossHP"
          :maxBossHP="maxBossHP"
          class="mb-6"
        />

        <!-- Timer and Progress -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-2xl font-bold galaxy-text-primary">
            ⏱️ {{ Math.floor(elapsedTime / 60) }}:{{ String(elapsedTime % 60).padStart(2, '0') }}
          </div>
          <div class="text-lg text-galaxy-moon-silver">
            {{ currentTextIndex + 1 }} / {{ currentTexts.length }}
          </div>
        </div>

        <!-- Current Text Display (3D Style) -->
        <div class="typing-display mb-8">
          <div class="text-display-3d p-6 rounded-2xl mb-4">
            <div class="text-2xl font-mono leading-relaxed tracking-wide">
              <span 
                v-for="(char, index) in currentText" 
                :key="index"
                class="char-display transition-all duration-150"
                :class="{
                  'text-green-400 bg-green-500/20': index < userInput.length && userInput[index] === char,
                  'text-red-400 bg-red-500/20 animate-pulse': index < userInput.length && userInput[index] !== char,
                  'text-gray-300': index >= userInput.length && index !== userInput.length,
                  'text-white bg-blue-500/30 animate-pulse': index === userInput.length,
                  'shadow-lg': index === userInput.length
                }"
              >{{ char }}</span>
            </div>
          </div>
          
          <!-- Japanese Translation (shown after completion) -->
          <div v-if="showTranslation" class="translation-display p-4 bg-blue-500/20 rounded-xl border-2 border-blue-400">
            <div class="text-lg font-bold text-blue-300 mb-2">🇯🇵 日本語訳</div>
            <div class="text-xl text-blue-100">{{ currentTranslation }}</div>
          </div>

          <!-- Pet Helper (Story Mode) -->
          <PetHelper 
            v-if="gameMode === 'story' && currentPet"
            :pet="currentPet"
            :currentText="currentText"
            :userInput="userInput"
            @use-ability="usePetAbility"
            class="mt-4"
          />
        </div>

        <!-- Virtual Keyboard (3D Style) -->
        <div class="virtual-keyboard mb-6">
          <div class="keyboard-3d p-6 rounded-2xl">
            <div class="text-center mb-4">
              <div class="text-lg font-bold galaxy-text-primary">バーチャルキーボード</div>
            </div>
            
            <!-- Keyboard rows -->
            <div class="space-y-2">
              <div v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex" class="flex justify-center gap-1">
                <button
                  v-for="key in row"
                  :key="key"
                  class="keyboard-key"
                  :class="{
                    'key-active': activeKeys.includes(key.toLowerCase()),
                    'key-correct': lastTypedChar === key.toLowerCase() && isLastCharCorrect,
                    'key-incorrect': lastTypedChar === key.toLowerCase() && !isLastCharCorrect,
                    'key-hint': petHintChar === key.toLowerCase()
                  }"
                  @click="virtualKeyPress(key)"
                >
                  {{ key }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden input for actual typing -->
        <input
          ref="typingInput"
          v-model="userInput"
          @input="handleTyping"
          @keydown="handleKeydown"
          class="opacity-0 absolute -z-10"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />

        <!-- Stats Display -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-yellow-400">{{ wpm }}</div>
            <div class="text-sm text-galaxy-moon-silver">Words/Min</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-green-400">{{ accuracy }}%</div>
            <div class="text-sm text-galaxy-moon-silver">正確率</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-red-400">{{ errors }}</div>
            <div class="text-sm text-galaxy-moon-silver">エラー数</div>
          </div>
          <div class="stat-card p-4 rounded-xl text-center">
            <div class="text-2xl font-bold text-blue-400">{{ streak }}</div>
            <div class="text-sm text-galaxy-moon-silver">連続正解</div>
          </div>
        </div>

        <!-- Active Skills (Story Mode) -->
        <ActiveSkillBar 
          v-if="gameMode === 'story'"
          :skills="arenaStore.character.skills.active"
          @use-skill="useActiveSkill"
          class="mt-6"
        />
      </div>

      <!-- Results Screen -->
      <ResultsScreen 
        v-else-if="gameState === 'results'"
        :mode="gameMode"
        :performance="performanceData"
        :rewards="earnedRewards"
        @restart="restartGame"
        @change-level="changeLevelAndRestart"
        @continue-story="continueStory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTypingArenaStore } from '@/stores/typingArenaStore'
import StoryModeHub from './typing-arena/StoryModeHub.vue'
import CharacterStatusPanel from './typing-arena/CharacterStatusPanel.vue'
import BossBattleUI from './typing-arena/BossBattleUI.vue'
import PetHelper from './typing-arena/PetHelper.vue'
import ActiveSkillBar from './typing-arena/ActiveSkillBar.vue'
import ResultsScreen from './typing-arena/ResultsScreen.vue'

const router = useRouter()
const arenaStore = useTypingArenaStore()

// Game mode and state
const gameMode = ref('selection') // 'selection', 'story', 'practice'
const gameState = ref('levelSelect') // 'levelSelect', 'typing', 'results'
const inGame = ref(false)

// Story mode specific
const currentStage = ref(null)
const isBossBattle = ref(false)
const currentBoss = ref(null)
const bossHP = ref(0)
const maxBossHP = ref(0)
const petHintChar = ref('')

// Practice mode
const selectedLevel = ref('')
const currentLevel = ref('')

// Typing game state
const currentTextIndex = ref(0)
const userInput = ref('')
const typingInput = ref(null)

// Timing
const startTime = ref(0)
const elapsedTime = ref(0)
const timer = ref(null)

// Stats
const wpm = ref(0)
const accuracy = ref(100)
const errors = ref(0)
const completedWords = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const totalCharacters = ref(0)
const correctCharacters = ref(0)

// Display
const showTranslation = ref(false)
const activeKeys = ref([])
const lastTypedChar = ref('')
const isLastCharCorrect = ref(true)

// Performance data for results
const performanceData = ref(null)
const earnedRewards = ref(null)

// Level definitions (for practice mode)
const levels = {
  eiken5: {
    name: '英検5級',
    description: '中学初級レベル',
    icon: '🌱',
    wordCount: 600,
    sentenceCount: 50
  },
  eiken4: {
    name: '英検4級', 
    description: '中学中級レベル',
    icon: '🌿',
    wordCount: 1300,
    sentenceCount: 80
  },
  eiken3: {
    name: '英検3級',
    description: '中学卒業レベル',
    icon: '🌳',
    wordCount: 2100,
    sentenceCount: 120
  },
  eikenPre2: {
    name: '英検準2級',
    description: '高校中級レベル',
    icon: '🎋',
    wordCount: 3600,
    sentenceCount: 150
  },
  eiken2: {
    name: '英検2級',
    description: '高校卒業レベル',
    icon: '🌲',
    wordCount: 5100,
    sentenceCount: 200
  }
}

// Content database (shared between modes)
const contentDatabase = {
  eiken5: {
    words: [
      { text: 'apple', translation: 'りんご' },
      { text: 'book', translation: '本' },
      { text: 'cat', translation: '猫' },
      { text: 'dog', translation: '犬' },
      { text: 'egg', translation: '卵' },
      { text: 'fish', translation: '魚' },
      { text: 'game', translation: 'ゲーム' },
      { text: 'house', translation: '家' },
      { text: 'ice', translation: '氷' },
      { text: 'juice', translation: 'ジュース' }
    ],
    sentences: [
      { text: 'I like apples.', translation: '私はりんごが好きです。' },
      { text: 'This is a pen.', translation: 'これはペンです。' },
      { text: 'How are you?', translation: '元気ですか？' },
      { text: 'Nice to meet you.', translation: 'はじめまして。' },
      { text: 'What time is it?', translation: '今何時ですか？' },
      { text: 'I have a dog.', translation: '私は犬を飼っています。' },
      { text: 'She is my friend.', translation: '彼女は私の友達です。' },
      { text: 'Let us play games.', translation: 'ゲームをしましょう。' }
    ]
  },
  eiken4: {
    words: [
      { text: 'beautiful', translation: '美しい' },
      { text: 'important', translation: '重要な' },
      { text: 'difficult', translation: '難しい' },
      { text: 'interesting', translation: '面白い' },
      { text: 'comfortable', translation: '快適な' },
      { text: 'dangerous', translation: '危険な' },
      { text: 'expensive', translation: '高価な' },
      { text: 'necessary', translation: '必要な' }
    ],
    sentences: [
      { text: 'I went to the library yesterday.', translation: '昨日図書館に行きました。' },
      { text: 'She is studying English very hard.', translation: '彼女は英語をとても一生懸命勉強しています。' },
      { text: 'We will have a test next week.', translation: '来週テストがあります。' },
      { text: 'Could you help me with this problem?', translation: 'この問題を手伝ってもらえますか？' },
      { text: 'The weather was very nice today.', translation: '今日はとても良い天気でした。' }
    ]
  },
  eiken3: {
    words: [
      { text: 'environment', translation: '環境' },
      { text: 'technology', translation: '技術' },
      { text: 'communication', translation: 'コミュニケーション' },
      { text: 'experience', translation: '経験' },
      { text: 'opportunity', translation: '機会' },
      { text: 'responsibility', translation: '責任' },
      { text: 'achievement', translation: '達成' }
    ],
    sentences: [
      { text: 'Environmental protection is very important for our future.', translation: '環境保護は私たちの将来にとってとても重要です。' },
      { text: 'Technology has changed our daily lives significantly.', translation: '技術は私たちの日常生活を大きく変えました。' },
      { text: 'Good communication skills are essential in business.', translation: '良いコミュニケーションスキルはビジネスに不可欠です。' }
    ]
  },
  eikenPre2: {
    words: [
      { text: 'independence', translation: '独立' },
      { text: 'development', translation: '発展' },
      { text: 'consideration', translation: '考慮' },
      { text: 'sustainability', translation: '持続可能性' },
      { text: 'collaboration', translation: '協力' }
    ],
    sentences: [
      { text: 'Taking responsibility for your actions is a sign of maturity.', translation: '自分の行動に責任を持つことは成熟の印です。' },
      { text: 'Independence is something that everyone should strive for.', translation: '独立は誰もが目指すべきものです。' }
    ]
  },
  eiken2: {
    words: [
      { text: 'globalization', translation: 'グローバル化' },
      { text: 'interconnectedness', translation: '相互関連性' },
      { text: 'anthropological', translation: '人類学的な' },
      { text: 'transcendental', translation: '超越的な' }
    ],
    sentences: [
      { text: 'The sustainability of our planet depends on collective global action.', translation: '地球の持続可能性は集団的な世界的行動にかかっています。' },
      { text: 'Globalization has created unprecedented interconnectedness among nations.', translation: 'グローバル化は国家間に前例のない相互関連性を生み出しました。' }
    ]
  }
}

// Keyboard layout
const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

// Current content
const currentTexts = ref([])
const currentText = computed(() => {
  return currentTexts.value[currentTextIndex.value]?.text || ''
})
const currentTranslation = computed(() => {
  return currentTexts.value[currentTextIndex.value]?.translation || ''
})

// Current pet
const currentPet = computed(() => {
  if (gameMode.value !== 'story') return null
  return arenaStore.pets.petData[arenaStore.pets.current]
})

// Story progress
const storyProgress = computed(() => {
  const completed = arenaStore.storyMode.completedStages.length
  const total = Object.values(arenaStore.storyMode.chapters).reduce((sum, ch) => sum + ch.stages, 0)
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

// Methods
const selectMode = (mode) => {
  gameMode.value = mode
  if (mode === 'practice') {
    gameState.value = 'levelSelect'
  }
}

const selectLevel = (level) => {
  selectedLevel.value = level
  currentLevel.value = level
}

const getPracticeProgress = (level) => {
  const progress = arenaStore.practiceStats.levelProgress[level]
  if (!progress) return 0
  return Math.round((progress.completed / progress.total) * 100)
}

const startTyping = () => {
  if (!selectedLevel.value) return
  
  gameState.value = 'typing'
  inGame.value = true
  
  // Mix words and sentences
  const levelContent = contentDatabase[selectedLevel.value]
  currentTexts.value = [...levelContent.words, ...levelContent.sentences]
    .sort(() => Math.random() - 0.5)
    .slice(0, 20)
  
  initializeTypingGame()
}

const startStoryStage = (stage) => {
  currentStage.value = stage
  gameState.value = 'typing'
  inGame.value = true
  isBossBattle.value = stage.type === 'boss'
  
  if (isBossBattle.value) {
    initializeBossBattle(stage)
  } else {
    initializeStoryStage(stage)
  }
}

const initializeTypingGame = () => {
  currentTextIndex.value = 0
  userInput.value = ''
  startTime.value = Date.now()
  elapsedTime.value = 0
  
  // Reset stats
  wpm.value = 0
  accuracy.value = 100
  errors.value = 0
  completedWords.value = 0
  streak.value = 0
  maxStreak.value = 0
  totalCharacters.value = 0
  correctCharacters.value = 0
  showTranslation.value = false
  
  // Start timer
  timer.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    updateWPM()
  }, 1000)
  
  // Focus input
  nextTick(() => {
    if (typingInput.value) {
      typingInput.value.focus()
    }
  })
}

const initializeStoryStage = (stage) => {
  // Get content based on stage difficulty
  const difficulty = stage.difficulty || 'eiken5'
  const levelContent = contentDatabase[difficulty]
  
  currentTexts.value = [...levelContent.words.slice(0, 10), ...levelContent.sentences.slice(0, 5)]
    .sort(() => Math.random() - 0.5)
  
  initializeTypingGame()
}

const initializeBossBattle = (boss) => {
  currentBoss.value = boss
  maxBossHP.value = boss.hp || 1000
  bossHP.value = maxBossHP.value
  
  // Boss-specific word selection
  const difficulty = boss.difficulty || 'eiken5'
  const levelContent = contentDatabase[difficulty]
  
  // More challenging mix for boss battles
  currentTexts.value = [
    ...levelContent.words,
    ...levelContent.sentences
  ].sort(() => Math.random() - 0.5)
  
  initializeTypingGame()
}

const handleTyping = () => {
  const input = userInput.value
  const target = currentText.value
  
  if (input.length > target.length) {
    userInput.value = input.slice(0, target.length)
    return
  }
  
  // Check current character
  const currentIndex = input.length - 1
  if (currentIndex >= 0) {
    const currentChar = input[currentIndex]
    const targetChar = target[currentIndex]
    
    lastTypedChar.value = currentChar.toLowerCase()
    isLastCharCorrect.value = currentChar === targetChar
    
    if (currentChar === targetChar) {
      correctCharacters.value++
      streak.value++
      maxStreak.value = Math.max(maxStreak.value, streak.value)
      
      // Apply character stats bonus
      if (gameMode.value === 'story') {
        const speedBonus = arenaStore.character.stats.speed * 0.1
        wpm.value = Math.round(wpm.value * (1 + speedBonus / 100))
      }
    } else {
      errors.value++
      streak.value = 0
      
      // Apply error recovery skill
      if (gameMode.value === 'story' && arenaStore.character.skills.passive.errorRecovery.unlocked) {
        const reduction = arenaStore.character.skills.passive.errorRecovery.level * 0.1
        errors.value = Math.max(0, errors.value - reduction)
      }
    }
    
    totalCharacters.value++
    updateAccuracy()
  }
  
  // Check completion
  if (input === target) {
    completeCurrentText()
  }
}

const completeCurrentText = () => {
  completedWords.value++
  showTranslation.value = true
  
  // Deal damage to boss
  if (isBossBattle.value && currentBoss.value) {
    const damage = calculateDamage()
    bossHP.value = Math.max(0, bossHP.value - damage)
    
    if (bossHP.value <= 0) {
      defeatBoss()
      return
    }
  }
  
  // Show translation for 2 seconds
  setTimeout(() => {
    showTranslation.value = false
    currentTextIndex.value++
    
    if (currentTextIndex.value >= currentTexts.value.length) {
      finishGame()
    } else {
      userInput.value = ''
      petHintChar.value = '' // Reset pet hint
      
      // Focus input for next text
      nextTick(() => {
        if (typingInput.value) {
          typingInput.value.focus()
        }
      })
    }
  }, 2000)
}

const calculateDamage = () => {
  let damage = 50 // Base damage
  
  // Apply character stats
  damage += arenaStore.character.stats.speed * 2
  damage += arenaStore.character.stats.vocabulary * 1.5
  
  // Accuracy bonus
  if (accuracy.value >= 95) damage *= 1.5
  else if (accuracy.value >= 90) damage *= 1.2
  
  // Streak bonus
  damage += streak.value * 5
  
  return Math.round(damage)
}

const defeatBoss = () => {
  clearInterval(timer.value)
  
  const performance = {
    wpm: wpm.value,
    accuracy: accuracy.value,
    time: elapsedTime.value,
    maxStreak: maxStreak.value,
    errors: errors.value
  }
  
  arenaStore.defeatBoss(currentBoss.value.id, performance)
  
  performanceData.value = performance
  earnedRewards.value = {
    experience: calculateExperience(performance),
    title: currentBoss.value.rewardTitle,
    pet: currentBoss.value.rewardPet,
    achievement: currentBoss.value.achievement
  }
  
  gameState.value = 'results'
}

const handleKeydown = (event) => {
  const key = event.key.toLowerCase()
  if (!activeKeys.value.includes(key)) {
    activeKeys.value.push(key)
  }
  
  // Remove key after short delay
  setTimeout(() => {
    const index = activeKeys.value.indexOf(key)
    if (index > -1) {
      activeKeys.value.splice(index, 1)
    }
  }, 150)
}

const virtualKeyPress = (key) => {
  userInput.value += key.toLowerCase()
  handleTyping()
}

const updateWPM = () => {
  const minutes = elapsedTime.value / 60
  if (minutes > 0) {
    const wordsTyped = correctCharacters.value / 5
    wpm.value = Math.round(wordsTyped / minutes)
  }
}

const updateAccuracy = () => {
  if (totalCharacters.value > 0) {
    accuracy.value = Math.round((correctCharacters.value / totalCharacters.value) * 100)
  }
}

const finishGame = () => {
  clearInterval(timer.value)
  
  const performance = {
    wpm: wpm.value,
    accuracy: accuracy.value,
    time: elapsedTime.value,
    maxStreak: maxStreak.value,
    errors: errors.value,
    completedWords: completedWords.value
  }
  
  performanceData.value = performance
  
  if (gameMode.value === 'story') {
    // Story mode rewards
    const exp = calculateExperience(performance)
    arenaStore.gainExperience(exp)
    arenaStore.gainPetExperience(Math.floor(exp * 0.5))
    
    if (currentStage.value) {
      arenaStore.progressStory(currentStage.value.id, performance)
    }
    
    earnedRewards.value = {
      experience: exp,
      petExperience: Math.floor(exp * 0.5)
    }
  } else {
    // Practice mode
    arenaStore.updatePracticeStats({
      level: selectedLevel.value,
      duration: elapsedTime.value,
      wpm: wpm.value,
      accuracy: accuracy.value,
      score: calculateScore()
    })
  }
  
  gameState.value = 'results'
}

const calculateExperience = (performance) => {
  let exp = 50
  
  exp += Math.floor(performance.wpm * 0.5)
  
  if (performance.accuracy >= 95) exp += 50
  else if (performance.accuracy >= 90) exp += 30
  else if (performance.accuracy >= 85) exp += 20
  
  exp += Math.floor(performance.maxStreak * 0.2)
  
  if (gameMode.value === 'story' && arenaStore.character.skills.passive.expBonus.unlocked) {
    exp *= (1 + arenaStore.character.skills.passive.expBonus.level * 0.1)
  }
  
  return Math.floor(exp)
}

const calculateScore = () => {
  return Math.round(wpm.value * (accuracy.value / 100) * 10)
}

// Pet abilities
const usePetAbility = (ability) => {
  if (ability.id === 'hint' && currentPet.value) {
    const nextChar = currentText.value[userInput.value.length]
    if (nextChar) {
      petHintChar.value = nextChar.toLowerCase()
      setTimeout(() => {
        petHintChar.value = ''
      }, 2000)
    }
  }
}

// Active skills
const useActiveSkill = (skillId) => {
  const success = arenaStore.useActiveSkill(skillId)
  
  if (success) {
    // Apply skill effects
    if (skillId === 'focusMode') {
      // Extend timer or slow down time
      // Implementation depends on skill level
    } else if (skillId === 'perfectHint') {
      showTranslation.value = true
      setTimeout(() => {
        showTranslation.value = false
      }, 3000)
    }
  }
}

const restartGame = () => {
  gameState.value = 'levelSelect'
  gameMode.value = 'practice'
  selectedLevel.value = ''
  inGame.value = false
}

const changeLevelAndRestart = () => {
  restartGame()
}

const continueStory = () => {
  gameMode.value = 'story'
  gameState.value = 'levelSelect'
  inGame.value = false
  currentStage.value = null
  isBossBattle.value = false
}

const handleBack = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  arenaStore.saveProgress()
  router.back()
}

// Lifecycle
onMounted(() => {
  arenaStore.loadProgress()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  arenaStore.saveProgress()
})
</script>

<style scoped>
/* Galaxy theme styles */
.galaxy-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 8s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(1px 1px at 30px 20px, rgba(255,255,255,0.4), transparent);
  background-repeat: repeat;
  background-size: 300px 150px;
  animation: sparkle 12s linear infinite reverse;
}

.stars-layer-3 {
  background-image: radial-gradient(1px 1px at 10px 60px, rgba(255,255,255,0.2), transparent);
  background-repeat: repeat;
  background-size: 400px 200px;
  animation: sparkle 16s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

/* Mode selection cards */
.mode-card {
  background: linear-gradient(135deg, 
    rgba(60, 60, 100, 0.3) 0%, 
    rgba(70, 70, 120, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  border: 2px solid rgba(147, 51, 234, 0.3);
  transition: all 0.3s ease;
}

.story-mode-card:hover {
  background: linear-gradient(135deg, 
    rgba(80, 60, 140, 0.4) 0%, 
    rgba(100, 70, 160, 0.4) 100%
  );
  border-color: rgba(147, 51, 234, 0.6);
  box-shadow: 0 8px 32px rgba(147, 51, 234, 0.3);
}

.practice-mode-card:hover {
  background: linear-gradient(135deg, 
    rgba(60, 80, 140, 0.4) 0%, 
    rgba(70, 100, 160, 0.4) 100%
  );
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.mode-icon {
  text-align: center;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
}

/* Progress indicators */
.progress-bar-bg {
  @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.progress-bar {
  @apply h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500;
}

.overall-progress-bar {
  @apply w-full h-4 bg-gray-800 rounded-full overflow-hidden relative;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.mini-progress-bar {
  @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-1;
}

.mini-progress-fill {
  @apply h-full bg-blue-400 transition-all duration-300;
}

/* Stats display */
.stat-item {
  @apply flex justify-between items-center p-2 rounded bg-black/20;
}

.stat-label {
  @apply text-sm text-slate-400;
}

.stat-value {
  @apply text-lg font-bold text-white;
}

/* Galaxy card */
.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(30, 30, 60, 0.95) 0%, 
    rgba(40, 40, 80, 0.95) 50%, 
    rgba(20, 20, 50, 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

/* Level cards */
.level-card {
  background: linear-gradient(135deg, 
    rgba(60, 60, 100, 0.3) 0%, 
    rgba(70, 70, 120, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.level-card:hover {
  background: linear-gradient(135deg, 
    rgba(80, 80, 140, 0.4) 0%, 
    rgba(90, 90, 160, 0.4) 100%
  );
  transform: translateY(-4px);
}

/* 3D Typing Display */
.text-display-3d {
  background: linear-gradient(145deg, #1a1a2e, #0f0f23);
  border: 2px solid rgba(147, 51, 234, 0.5);
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateX(5deg);
}

.char-display {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 3D Virtual Keyboard */
.keyboard-3d {
  background: linear-gradient(145deg, #2a2a4e, #1a1a3e);
  border: 2px solid rgba(147, 51, 234, 0.3);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: perspective(1000px) rotateX(10deg);
}

.keyboard-key {
  min-width: 40px;
  height: 40px;
  background: linear-gradient(145deg, #4a4a6e, #3a3a5e);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #e2e8f0;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.keyboard-key:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.keyboard-key.key-active {
  transform: translateY(1px);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, #5a5a7e, #4a4a6e);
}

.keyboard-key.key-correct {
  background: linear-gradient(145deg, #10b981, #059669);
  border-color: rgba(16, 185, 129, 0.5);
}

.keyboard-key.key-incorrect {
  background: linear-gradient(145deg, #ef4444, #dc2626);
  border-color: rgba(239, 68, 68, 0.5);
}

.keyboard-key.key-hint {
  background: linear-gradient(145deg, #3b82f6, #2563eb);
  border-color: rgba(59, 130, 246, 0.8);
  animation: pulse-hint 1s ease-in-out infinite;
}

@keyframes pulse-hint {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Stats Cards */
.stat-card {
  background: linear-gradient(135deg, rgba(40, 40, 80, 0.6), rgba(30, 30, 60, 0.6));
  border: 1px solid rgba(147, 51, 234, 0.3);
  backdrop-filter: blur(10px);
}

/* Translation Display */
.translation-display {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Galaxy themed buttons */
.galaxy-button {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}

.galaxy-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.6);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(55, 65, 81, 0.4);
}

.galaxy-button-accent {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.galaxy-moon-silver {
  color: #94a3b8;
}

.cosmic-glow {
  text-shadow: 0 0 20px rgba(147, 51, 234, 0.8);
}

.galaxy-nova-orange {
  color: #f59e0b;
}

.galaxy-cosmic-purple {
  color: #7c3aed;
}

/* Text shadows for readability */
.text-shadow-lg {
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.9),
    1px 1px 2px rgba(0, 0, 0, 0.8),
    0 0 8px rgba(0, 0, 0, 0.6);
}

.text-shadow-md {
  text-shadow: 
    1px 1px 3px rgba(0, 0, 0, 0.8),
    0 0 6px rgba(0, 0, 0, 0.5);
}

/* Responsive design */
@media (max-width: 768px) {
  .text-display-3d {
    transform: perspective(800px) rotateX(3deg);
  }
  
  .keyboard-3d {
    transform: perspective(800px) rotateX(5deg);
  }
  
  .keyboard-key {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
}
</style>