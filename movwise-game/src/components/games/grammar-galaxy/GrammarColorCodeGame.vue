<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    <!-- Game Header -->
    <header class="relative z-10 galaxy-card mx-4 mt-4 rounded-3xl">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button 
              @click="() => {
                console.log('Header back button clicked');
                try {
                  handleBackButton();
                  console.log('handleBackButton() called successfully');
                } catch (err) {
                  console.error('Error calling handleBackButton():', err);
                }
              }"
              @mousedown="() => { console.log('Header back button mousedown'); playSound('click'); }"
              class="galaxy-button galaxy-button-secondary"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold galaxy-text-primary cosmic-glow">
              🎨 Grammar Color Code
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="game-stats">
              <div class="stat-item">
                <span class="stat-label">スコア</span>
                <span class="stat-value">{{ gameState.score }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">連続正解</span>
                <span class="stat-value">{{ gameState.streak }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">時間</span>
                <span class="stat-value">{{ formatTime(gameState.timeRemaining) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">難易度</span>
                <span class="stat-value difficulty-indicator" :class="getDifficultyClass()">
                  {{ getDifficultyDisplay() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p class="loading-text">コンテンツを読み込み中...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="error-overlay">
      <div class="error-content">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mb-4" />
        <h2 class="text-xl font-bold text-red-400 mb-2">読み込みエラー</h2>
        <p class="text-gray-300 mb-4">{{ errorMessage }}</p>
        <button @click="retryLoading" class="retry-button">
          再試行
        </button>
      </div>
    </div>

    <!-- Game Instructions -->
    <div v-if="!gameState.started && !isLoading && !hasError" class="instructions-overlay">
      <div class="instructions-modal galaxy-card">
        <h2 class="text-3xl font-bold text-center mb-6 galaxy-text-primary cosmic-glow">🎨 Color Code ゲーム</h2>
        
        <!-- Color Rules -->
        <div class="color-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">色分けルール</h3>
          <div class="flex flex-wrap justify-center gap-3">
            <div class="color-rule-card-compact blue-family">
              <div class="color-icon-compact">🔵</div>
              <div class="color-content-compact">
                <div class="color-name-compact">青ファミリー</div>
                <div class="color-description-compact">Be動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact red-family">
              <div class="color-icon-compact">🔴</div>
              <div class="color-content-compact">
                <div class="color-name-compact">赤ファミリー</div>
                <div class="color-description-compact">一般動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact yellow-family">
              <div class="color-icon-compact">🟡</div>
              <div class="color-content-compact">
                <div class="color-name-compact">黄ファミリー</div>
                <div class="color-description-compact">疑問詞系</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Rules -->
        <div class="game-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">ゲームの進め方</h3>
          <ol class="rules-list-galaxy">
            <li>同じ色ファミリーの要素をドラッグ&ドロップで組み合わせよう</li>
            <li>正しい文法の組み合わせで文を完成させよう</li>
            <li>正解すると要素が消えて得点獲得！</li>
            <li>制限時間内にできるだけ多くの文を作ろう</li>
          </ol>
        </div>

        <!-- Difficulty Selection -->
        <div class="difficulty-selection">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">難易度を選択</h3>
          <div class="difficulty-buttons-galaxy">
            <button 
              v-for="level in difficultyLevels"
              :key="level.id"
              @click="selectDifficulty(level.id)"
              class="difficulty-button-galaxy"
              :class="{ 'selected': selectedDifficulty === level.id }"
            >
              <div class="difficulty-name-galaxy">{{ level.name }}</div>
              <div class="difficulty-description-galaxy">{{ level.description }}</div>
              <div class="difficulty-details-galaxy">
                <div>時間: {{ level.timeLimit }}秒</div>
                <div>目標: {{ level.targetSentences }}文</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Mode Selection -->
        <div class="mode-selection mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">モード選択</h3>
          <div class="mode-buttons-galaxy">
            <button 
              @click="gameMode = 'normal'"
              class="mode-button-galaxy"
              :class="{ 'selected': gameMode === 'normal' }"
            >
              <CursorArrowRaysIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>通常モード</span>
              <small>ドラッグ&ドロップ</small>
            </button>
            <button 
              @click="gameMode = 'kids'"
              class="mode-button-galaxy"
              :class="{ 'selected': gameMode === 'kids' }"
            >
              <HandRaisedIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>かんたんモード</span>
              <small>クリックのみ</small>
            </button>
          </div>
        </div>

        <div class="button-controls">
          <button 
            @click="() => { 
              console.log('Modal back button clicked - attempting navigation'); 
              try {
                goHome();
                console.log('goHome() called successfully');
              } catch (err) {
                console.error('Error calling goHome():', err);
              }
            }"
            @mousedown="() => { console.log('Modal back button mousedown'); playSound('click'); }"
            class="galaxy-button galaxy-button-secondary mr-4"
          >
            戻る
          </button>
          <button 
            @click="startGame"
            class="start-game-button-galaxy"
            :disabled="!selectedDifficulty"
          >
            ゲーム開始
          </button>
        </div>
      </div>
    </div>

    <!-- Main Game Area -->
    <main v-if="gameState.started && !isLoading && !hasError" class="game-main">
      <div class="max-w-6xl mx-auto px-6">
        <!-- Progress Bar -->
        <div class="progress-section mb-6">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${timeProgress}%` }"
            ></div>
          </div>
          <div class="progress-info">
            <span>完成した文: {{ gameState.completedSentences }}</span>
            <span>目標: {{ gameState.targetSentences }}</span>
          </div>
        </div>

        <!-- Current Sentence Target -->
        <div v-if="currentProblem" class="sentence-target mb-6">
          <h3 class="text-lg font-bold mb-2">作る文:</h3>
          <div class="target-sentence">
            {{ currentProblem.hint_ja }}
          </div>
          
          <!-- Pattern Information -->
          <div v-if="currentProblem.sentencePattern" class="pattern-info mb-2">
            <div class="pattern-badge">
              <span class="pattern-icon">📝</span>
              <span class="pattern-name">{{ currentProblem.sentencePattern.name }}</span>
            </div>
            <div class="pattern-example">例: {{ currentProblem.sentencePattern.example }}</div>
          </div>
          
          <div class="target-hint">
            <div class="hint-header">
              <LightBulbIcon class="w-5 h-5" />
              <span>ヒント</span>
              <button 
                @click="toggleHint" 
                class="hint-toggle"
                :class="{ 'active': showHint }"
              >
                {{ showHint ? '隠す' : '表示' }}
              </button>
            </div>
            <div v-if="showHint" class="hint-content">
              <div class="hint-text">この文を英語で作ってみましょう！</div>
              <div class="hint-example" v-if="currentProblem.example">
                例: {{ currentProblem.example }}
              </div>
              <div v-if="currentProblem.patternHint" class="pattern-hint">
                {{ currentProblem.patternHint }}
              </div>
            </div>
          </div>
        </div>

        <!-- Game Grid -->
        <div class="game-grid">
          <!-- Drop Zones -->
          <div class="drop-zones-container">
            <div class="drop-zones">
              <div 
                v-for="zone in dropZones"
                v-show="zone.id !== 'auxiliary' || zone.isVisible"
                :key="zone.id"
                class="drop-zone galaxy-card"
                :class="{ 
                  'drop-active': zone.isActive,
                  'drop-valid': zone.isValid,
                  'drop-invalid': zone.isInvalid,
                  'kids-mode': gameMode === 'kids'
                }"
                :data-zone-id="zone.id"
                @drop="handleDrop($event, zone.id)"
                @dragover="handleDragOver($event, zone.id)"
                @dragleave="handleDragLeave(zone.id)"
                @click="handleZoneClick(zone.id)"
                @touchstart.passive="handleTouchStart($event, zone.id)"
                @touchmove.prevent="handleTouchMove($event, zone.id)"
                @touchend.passive="handleTouchEnd($event, zone.id)"
              >
                <div v-if="zone.element" class="dropped-element">
                  <GrammarElement 
                    :element="zone.element"
                    :is-dropped="true"
                    :show-remove-button="true"
                    :kids-mode="gameMode === 'kids'"
                    :show-japanese-hint="gameMode === 'kids'"
                    @remove="removeFromZone(zone.id)"
                  />
                </div>
                <div v-else class="drop-placeholder">
                  <span class="drop-label">{{ zone.label }}</span>
                  <span class="drop-hint">{{ zone.hint }}</span>
                </div>
              </div>
            </div>
            
            <!-- Validate Button -->
            <button 
              @click="validateSentence"
              class="validate-button"
              :disabled="!canValidate"
              :class="{ 'ready': canValidate, 'kids-mode': gameMode === 'kids' }"
            >
              <CheckIcon class="w-5 h-5" />
              文を確認
            </button>
          </div>

          <!-- Grammar Elements Pool -->
          <div class="elements-pool">
            <h3 class="pool-title">使用可能な要素</h3>
            
            <!-- Debug Information -->
            <div v-if="showDebugInfo" class="debug-elements mb-2">
              <p class="text-xs text-gray-400">
                問題セット: {{ currentProblemIndex + 1 }}/{{ totalProblems }} | 
                要素: {{ availableElements.length }}個 | 
                使用済み: {{ availableElements.filter(el => el.isUsed).length }}個
              </p>
            </div>
            
            <!-- Loading Elements -->
            <div v-if="elementsLoading" class="loading-elements">
              <div class="loading-spinner-small"></div>
              <p class="text-gray-400">要素を生成中...</p>
            </div>
            
            <!-- No Elements -->
            <div v-else-if="availableElements.length === 0" class="no-elements-message">
              <p class="text-gray-400">要素がありません</p>
              <button @click="generateProblem" class="text-blue-400 underline">
                新しい問題を生成
              </button>
            </div>
            
            <!-- Elements Grid -->
            <div v-else class="elements-grid" :class="{ 'kids-mode': gameMode === 'kids' }">
              <GrammarElement
                v-for="element in availableElements"
                :key="element.id"
                :element="element"
                :is-draggable="gameMode === 'normal' && !element.isUsed"
                :kids-mode="gameMode === 'kids'"
                :show-japanese-hint="gameMode === 'kids'"
                :data-element-id="element.id"
                @drag-start="handleDragStart"
                @drag-end="handleDragEnd"
                @click="handleElementClick"
                @touchstart.passive="handleElementTouchStart($event, element)"
                @touchmove.prevent="handleElementTouchMove($event, element)"
                @touchend.passive="handleElementTouchEnd($event, element)"
              />
            </div>
            
            <!-- All Elements Used -->
            <div v-if="availableElements.length > 0 && availableElements.filter(el => !el.isUsed).length === 0" class="all-used-message">
              <p class="text-yellow-400">すべての要素が使用されています</p>
              <button @click="generateProblem" class="text-blue-400 underline">
                新しい問題を生成
              </button>
            </div>
          </div>
        </div>

        <!-- Combo Display -->
        <div v-if="gameState.combo > 1" class="combo-display" :class="getComboClass()">
          <div class="combo-text">{{ gameState.combo }}連続正解！</div>
          <div class="combo-multiplier">×{{ getComboMultiplier() }}</div>
          <div v-if="gameState.combo >= 5" class="combo-special">{{ getComboMessage() }}</div>
        </div>

        <!-- Achievement Popup -->
        <div v-if="showAchievement" class="achievement-popup">
          <div class="achievement-icon">{{ currentAchievement.icon }}</div>
          <div class="achievement-title">{{ currentAchievement.title }}</div>
          <div class="achievement-description">{{ currentAchievement.description }}</div>
          <div class="achievement-points">+{{ currentAchievement.points }}ポイント</div>
        </div>

        <!-- Power-up Indicator -->
        <div v-if="gameState.powerUpActive" class="power-up-indicator">
          <div class="power-up-icon">{{ getPowerUpIcon() }}</div>
          <div class="power-up-name">{{ getPowerUpName() }}</div>
          <div class="power-up-timer">{{ gameState.powerUpDuration }}秒</div>
        </div>

        <!-- Speed Bonus Display -->
        <div v-if="showSpeedBonus" class="speed-bonus">
          <div class="speed-bonus-text">スピードボーナス！</div>
          <div class="speed-bonus-value">+{{ gameState.speedBonus }}</div>
        </div>

        <!-- Visual Feedback Display -->
        <div v-if="showMeaningImage" class="meaning-display">
          <div class="meaning-content">
            <div class="meaning-icon">
              {{ currentMeaningVisual.icon }}
            </div>
            <div class="meaning-text">
              {{ currentMeaningVisual.description_ja }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Game Result Modal -->
    <GameResultModal 
      v-if="gameState.finished"
      :score="gameState.score"
      :completed-sentences="gameState.completedSentences"
      :target-sentences="gameState.targetSentences"
      :accuracy="gameState.accuracy"
      :time-taken="gameTime - gameState.timeRemaining"
      :combo-best="gameState.bestCombo"
      :is-new-record="gameState.isNewRecord"
      @play-again="resetGame"
      @go-home="goHome"
    />

    <!-- Particle Effects -->
    <ParticleEffect 
      v-if="showParticles"
      :type="particleType"
      @complete="showParticles = false"
    />

    <!-- Debug Info - Hidden -->
    <div v-if="false" class="debug-info">
      <p>Planet ID: {{ planetId }}</p>
      <p>CSV Loaded: {{ csvDataLoaded }}</p>
      <p>Current Problem: {{ currentProblemIndex + 1 }}/{{ totalProblems }}</p>
      <p>Game Mode: {{ gameMode }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import GrammarElement from '@/components/games/grammar-galaxy/game-elements/GrammarElement.vue'
import GameResultModal from '@/components/games/grammar-galaxy/shared/GameResultModal.vue'
import ParticleEffect from '@/components/games/grammar-galaxy/shared/ParticleEffect.vue'
import Icon from '@/components/shared/Icon.vue'
import {
  ArrowLeftIcon,
  LightBulbIcon,
  CheckIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// データ管理システム
import grammarContentManager from '@/data/grammarContentManager.js'
import { problemGenerator } from '@/components/games/grammar-galaxy/shared/problemGenerator.js'

const router = useRouter()
const route = useRoute()
const grammarStore = useGrammarGalaxyStore()

// Debug and development flags
const showDebugInfo = ref(false)

// Data loading state
const isLoading = ref(true)
const elementsLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const csvDataLoaded = ref(false)

// Game mode
const gameMode = ref('normal') // 'normal' or 'kids'

// CSV Data
const grammarContent = ref([])
const problemSets = ref([])
const visualElements = ref([])

// Current problem state
const currentProblemIndex = ref(0)
const currentProblem = ref(null)
const totalProblems = ref(0)

// Game state
const gameState = ref({
  started: false,
  isPlaying: false,
  finished: false,
  score: 0,
  streak: 0,
  combo: 0,
  bestCombo: 0,
  timeRemaining: 0,
  completedSentences: 0,
  targetSentences: 0,
  accuracy: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  isNewRecord: false,
  // New features
  totalScore: 0,
  bonusPoints: 0,
  powerUpActive: false,
  powerUpType: null,
  powerUpDuration: 0,
  achievements: [],
  milestones: [],
  difficultyMultiplier: 1.0,
  speedBonus: 0,
  perfectRound: false
})

// 問題管理用の状態を追加
const problems = ref([])

// Game settings
const selectedDifficulty = ref('normal')
const planetId = computed(() => route.params.planetId || 'beVerb')
const currentGameId = 'grammarColorCode'

// Element selection for kids mode
const selectedElementForKids = ref(null)
const selectedZoneForKids = ref(null)

// Difficulty levels with Eiken support
const difficultyLevels = [
  {
    id: 'eiken5',
    name: '英検5級レベル',
    timeLimit: 240,
    targetSentences: 30,
    level: 'beginner',
    eiken_level: '5',
    description: 'be動詞・一般動詞の基本'
  },
  {
    id: 'eiken4', 
    name: '英検4級レベル',
    timeLimit: 300,
    targetSentences: 100,
    level: 'intermediate',
    eiken_level: '4',
    description: '疑問文・過去形・複文'
  },
  {
    id: 'eiken3',
    name: '英検3級レベル',
    timeLimit: 360,
    targetSentences: 50,
    level: 'advanced',
    eiken_level: '3',
    description: '助動詞・完了形・複雑文'
  },
  {
    id: 'challenge',
    name: 'チャレンジモード',
    timeLimit: 480,
    targetSentences: 50,
    level: 'expert',
    eiken_level: '3',
    description: '全ての文型・高速チャレンジ'
  }
]

// Game elements
const availableElements = ref([])
const dropZones = ref([
  { 
    id: 'auxiliary', 
    label: '助動詞', 
    hint: 'Do/Does/Are...', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false,
    isVisible: false // 必要に応じて表示
  },
  { 
    id: 'subject', 
    label: '主語', 
    hint: '誰が？何が？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  },
  { 
    id: 'verb', 
    label: '動詞', 
    hint: 'どうする？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  },
  { 
    id: 'object', 
    label: '目的語/補語', 
    hint: '何を？どんな？', 
    element: null, 
    isActive: false, 
    isValid: false, 
    isInvalid: false 
  }
])

// Visual feedback
const showParticles = ref(false)
const particleType = ref('success')
const showMeaningImage = ref(false)
const currentMeaningVisual = ref(null)

// New enhanced features
const showAchievement = ref(false)
const currentAchievement = ref(null)
const showSpeedBonus = ref(false)
const showComboEffect = ref(false)

// Achievement system
const achievements = ref([
  { id: 'first_correct', title: '初正解', description: '最初の正解を獲得', icon: '🎯', points: 50, unlocked: false },
  { id: 'combo_3', title: 'コンボマスター', description: '3連続正解を達成', icon: '🔥', points: 100, unlocked: false },
  { id: 'combo_5', title: 'コンボレジェンド', description: '5連続正解を達成', icon: '⚡', points: 200, unlocked: false },
  { id: 'combo_10', title: 'コンボゴッド', description: '10連続正解を達成', icon: '🌟', points: 500, unlocked: false },
  { id: 'speed_demon', title: 'スピードデーモン', description: '5回連続でスピードボーナス獲得', icon: '💨', points: 300, unlocked: false },
  { id: 'perfect_round', title: 'パーフェクト', description: '全問正解でゲーム完了', icon: '👑', points: 1000, unlocked: false },
  { id: 'high_score', title: 'ハイスコア', description: '1000点以上を獲得', icon: '💎', points: 500, unlocked: false }
])

// Power-up system
const powerUps = ref([
  { id: 'time_freeze', name: '時間停止', icon: '⏰', duration: 10, effect: 'freeze_time' },
  { id: 'double_points', name: 'ダブルポイント', icon: '💰', duration: 15, effect: 'double_score' },
  { id: 'hint_reveal', name: 'ヒント表示', icon: '💡', duration: 20, effect: 'show_hints' }
])

// Dynamic difficulty
const adaptiveDifficulty = ref({
  currentLevel: 1,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  adjustmentThreshold: 3
})

// Drag and drop state
const draggedElement = ref(null)

// Timer
let gameTimer = null
const gameTime = ref(60)

// Computed properties
const timeProgress = computed(() => {
  return (gameState.value.timeRemaining / gameTime.value) * 100
})

const canValidate = computed(() => {
  if (!currentProblem.value?.words_pool) {
    console.log('🔍 [canValidate] No problem or words_pool')
    return false
  }
  
  const expectedWords = currentProblem.value.words_pool
  const hasAuxiliary = expectedWords.some(w => w.position === 'auxiliary')
  const hasObject = expectedWords.some(w => w.position === 'object')
  
  // 必須ゾーンのチェック
  const subjectZone = dropZones.value.find(z => z.id === 'subject')
  const verbZone = dropZones.value.find(z => z.id === 'verb')
  const objectZone = dropZones.value.find(z => z.id === 'object')
  const auxiliaryZone = dropZones.value.find(z => z.id === 'auxiliary')
  
  // 🔧 Fix: auxiliary ゾーンが必要なのに表示されていない場合は強制的に表示
  if (hasAuxiliary && auxiliaryZone && !auxiliaryZone.isVisible) {
    console.warn('🔧 [canValidate] Auxiliary zone was not visible, fixing...')
    auxiliaryZone.isVisible = true
  }
  
  const requiredZones = [subjectZone, verbZone]
  if (hasObject) requiredZones.push(objectZone)
  if (hasAuxiliary) requiredZones.push(auxiliaryZone)
  
  const canValidateResult = requiredZones.every(zone => zone && zone.element !== null)
  
  console.log('🔍 [canValidate] Check result:', {
    hasAuxiliary,
    hasObject,
    auxiliaryVisible: auxiliaryZone?.isVisible,
    subject: !!subjectZone?.element,
    verb: !!verbZone?.element,
    object: hasObject ? !!objectZone?.element : 'not required',
    auxiliary: hasAuxiliary ? !!auxiliaryZone?.element : 'not required',
    canValidate: canValidateResult
  })
  
  return canValidateResult
})

// 🎯 共通のsentenceパターン定義関数
const getSentencePatternCorrections = () => {
  return {
    // === Wh疑問文パターン ===
    'What is this?': { 'What': 'subject', 'is': 'verb', 'this': 'object' },
    'What is that?': { 'What': 'subject', 'is': 'verb', 'that': 'object' },
    'Who is he?': { 'Who': 'subject', 'is': 'verb', 'he': 'object' },
    'Who is she?': { 'Who': 'subject', 'is': 'verb', 'she': 'object' },
    'Where are you?': { 'Where': 'subject', 'are': 'verb', 'you': 'object' },
    'How are you?': { 'How': 'subject', 'are': 'verb', 'you': 'object' },
    'When is it?': { 'When': 'subject', 'is': 'verb', 'it': 'object' },
    'Why is that?': { 'Why': 'subject', 'is': 'verb', 'that': 'object' },
    
    // === 肯定文パターン ===
    'I am happy': { 'I': 'subject', 'am': 'verb', 'happy': 'object' },
    'You are a student': { 'You': 'subject', 'are': 'verb', 'a student': 'object' },
    'She is tired': { 'She': 'subject', 'is': 'verb', 'tired': 'object' },
    'We are friends': { 'We': 'subject', 'are': 'verb', 'friends': 'object' },
    'They are students': { 'They': 'subject', 'are': 'verb', 'students': 'object' },
    'It is a book': { 'It': 'subject', 'is': 'verb', 'a book': 'object' },
    
    // === 否定文パターン ===
    'I am not sad': { 'I': 'subject', 'am not': 'verb', 'sad': 'object' },
    'I am not tired': { 'I': 'subject', 'am not': 'verb', 'tired': 'object' },
    'You are not late': { 'You': 'subject', 'are not': 'verb', 'late': 'object' },
    
    // === 一般動詞パターン ===
    'I play soccer': { 'I': 'subject', 'play': 'verb', 'soccer': 'object' },
    'She reads books': { 'She': 'subject', 'reads': 'verb', 'books': 'object' },
    'He likes music': { 'He': 'subject', 'likes': 'verb', 'music': 'object' },
    'We eat lunch': { 'We': 'subject', 'eat': 'verb', 'lunch': 'object' },
    'They watch TV': { 'They': 'subject', 'watch': 'verb', 'TV': 'object' },
    
    // === 過去形パターン ===
    'I was happy yesterday': { 'I': 'subject', 'was': 'verb', 'happy yesterday': 'object' },
    'I played soccer yesterday': { 'I': 'subject', 'played': 'verb', 'soccer': 'object' },
    
    // === 未来形パターン ===
    'I will study English': { 'I': 'subject', 'will study': 'verb', 'English': 'object' },
    'I will help you': { 'I': 'subject', 'will': 'auxiliary', 'help': 'verb', 'you': 'object' },
    
    // === 4級レベル追加問題パターン（50問） ===
    // 疑問文
    'Do you like music?': { 'Do': 'auxiliary', 'you': 'subject', 'like': 'verb', 'music': 'object' },
    'Does she play tennis?': { 'Does': 'auxiliary', 'she': 'subject', 'play': 'verb', 'tennis': 'object' },
    'Do they have pets?': { 'Do': 'auxiliary', 'they': 'subject', 'have': 'verb', 'pets': 'object' },
    'Does he speak Japanese?': { 'Does': 'auxiliary', 'he': 'subject', 'speak': 'verb', 'Japanese': 'object' },
    'Do you watch TV?': { 'Do': 'auxiliary', 'you': 'subject', 'watch': 'verb', 'TV': 'object' },
    'Does your mother cook?': { 'Does': 'auxiliary', 'your mother': 'subject', 'cook': 'verb' },
    'Do we need tickets?': { 'Do': 'auxiliary', 'we': 'subject', 'need': 'verb', 'tickets': 'object' },
    'What did you eat?': { 'What': 'object', 'did': 'auxiliary', 'you': 'subject', 'eat': 'verb' },
    'Did you finish homework?': { 'Did': 'auxiliary', 'you': 'subject', 'finish': 'verb', 'homework': 'object' },
    'Did she call you?': { 'Did': 'auxiliary', 'she': 'subject', 'call': 'verb', 'you': 'object' },
    'When did he arrive?': { 'When': 'object', 'did': 'auxiliary', 'he': 'subject', 'arrive': 'verb' },
    'Can she drive?': { 'Can': 'auxiliary', 'she': 'subject', 'drive': 'verb' },
    'May I help you?': { 'May': 'auxiliary', 'I': 'subject', 'help': 'verb', 'you': 'object' },
    'Could you wait?': { 'Could': 'auxiliary', 'you': 'subject', 'wait': 'verb' },
    'Should we leave now?': { 'Should': 'auxiliary', 'we': 'subject', 'leave': 'verb', 'now': 'object' },
    'Are you ready?': { 'Are': 'auxiliary', 'you': 'subject', 'ready': 'object' },
    'Is this your book?': { 'Is': 'auxiliary', 'this': 'subject', 'your book': 'object' },
    'Were you busy yesterday?': { 'Were': 'auxiliary', 'you': 'subject', 'busy yesterday': 'object' },
    'Was he sick?': { 'Was': 'auxiliary', 'he': 'subject', 'sick': 'object' },
    
    // 否定文
    'I do not like coffee': { 'I': 'subject', 'do not': 'auxiliary', 'like': 'verb', 'coffee': 'object' },
    'She does not speak English': { 'She': 'subject', 'does not': 'auxiliary', 'speak': 'verb', 'English': 'object' },
    'We do not have time': { 'We': 'subject', 'do not': 'auxiliary', 'have': 'verb', 'time': 'object' },
    'He does not play sports': { 'He': 'subject', 'does not': 'auxiliary', 'play': 'verb', 'sports': 'object' },
    'They do not live here': { 'They': 'subject', 'do not': 'auxiliary', 'live': 'verb', 'here': 'object' },
    'I did not go yesterday': { 'I': 'subject', 'did not': 'auxiliary', 'go': 'verb', 'yesterday': 'object' },
    'She did not call me': { 'She': 'subject', 'did not': 'auxiliary', 'call': 'verb', 'me': 'object' },
    'We did not finish work': { 'We': 'subject', 'did not': 'auxiliary', 'finish': 'verb', 'work': 'object' },
    'I am not hungry': { 'I': 'subject', 'am not': 'verb', 'hungry': 'object' },
    'She is not at home': { 'She': 'subject', 'is not': 'verb', 'at home': 'object' },
    'They are not students': { 'They': 'subject', 'are not': 'verb', 'students': 'object' },
    'It was not easy': { 'It': 'subject', 'was not': 'verb', 'easy': 'object' },
    
    // 肯定文（助動詞）
    'She can sing well': { 'She': 'subject', 'can': 'auxiliary', 'sing': 'verb', 'well': 'object' },
    'We should study more': { 'We': 'subject', 'should': 'auxiliary', 'study': 'verb', 'more': 'object' },
    'He might come tomorrow': { 'He': 'subject', 'might': 'auxiliary', 'come': 'verb', 'tomorrow': 'object' },
    'You must be careful': { 'You': 'subject', 'must': 'auxiliary', 'be': 'verb', 'careful': 'object' },
    'I visited my friend': { 'I': 'subject', 'visited': 'verb', 'my friend': 'object' },
    'She bought new shoes': { 'She': 'subject', 'bought': 'verb', 'new shoes': 'object' },
    'We watched a movie': { 'We': 'subject', 'watched': 'verb', 'a movie': 'object' },
    'They traveled to Japan': { 'They': 'subject', 'traveled': 'verb', 'to Japan': 'object' },
    'He worked very hard': { 'He': 'subject', 'worked': 'verb', 'very hard': 'object' },
    'I will study tomorrow': { 'I': 'subject', 'will': 'auxiliary', 'study': 'verb', 'tomorrow': 'object' },
    'She will cook dinner': { 'She': 'subject', 'will': 'auxiliary', 'cook': 'verb', 'dinner': 'object' },
    'We will meet again': { 'We': 'subject', 'will': 'auxiliary', 'meet': 'verb', 'again': 'object' },
    'They will arrive soon': { 'They': 'subject', 'will': 'auxiliary', 'arrive': 'verb', 'soon': 'object' },
    'I am reading a book': { 'I': 'subject', 'am': 'auxiliary', 'reading': 'verb', 'a book': 'object' },
    'She is cooking dinner': { 'She': 'subject', 'is': 'auxiliary', 'cooking': 'verb', 'dinner': 'object' },
    'We are playing soccer': { 'We': 'subject', 'are': 'auxiliary', 'playing': 'verb', 'soccer': 'object' },
    'They are studying English': { 'They': 'subject', 'are': 'auxiliary', 'studying': 'verb', 'English': 'object' },
    
    // 基本問題
    'I like apples': { 'I': 'subject', 'like': 'verb', 'apples': 'object' },
    'She has a cat': { 'She': 'subject', 'has': 'verb', 'a cat': 'object' },
    'We are busy': { 'We': 'subject', 'are': 'verb', 'busy': 'object' },
    'What do you want?': { 'What': 'object', 'do': 'auxiliary', 'you': 'subject', 'want': 'verb' },
    'Where did you go?': { 'Where': 'object', 'did': 'auxiliary', 'you': 'subject', 'go': 'verb' },
    'How old are you?': { 'How old': 'object', 'are': 'verb', 'you': 'subject' },
    'Can you swim?': { 'Can': 'auxiliary', 'you': 'subject', 'swim': 'verb' },
    'I have been waiting': { 'I': 'subject', 'have been': 'auxiliary', 'waiting': 'verb' },
    'If it rains tomorrow': { 'If': 'auxiliary', 'it': 'subject', 'rains': 'verb', 'tomorrow': 'object' }
  }
}

// Data loading methods
// 🎯 追加問題バリエーション
const additionalProblems = [
  // 5級レベル追加問題
  { target_sentence: 'I like apples', hint_ja: '私はりんごが好きです', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'like', position: 'verb' }, { word: 'apples', position: 'object' }
  ]},
  { target_sentence: 'She has a cat', hint_ja: '彼女は猫を飼っています', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'has', position: 'verb' }, { word: 'a cat', position: 'object' }
  ]},
  { target_sentence: 'We are busy', hint_ja: '私たちは忙しいです', level: 'beginner', eiken_level: '5', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'are', position: 'verb' }, { word: 'busy', position: 'object' }
  ]},
  
  // 4級レベル追加問題（50問）
  // === 疑問文（Do/Does） ===
  { target_sentence: 'What do you want?', hint_ja: '何が欲しいですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'What', position: 'object' }, { word: 'do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'want', position: 'verb' }
  ]},
  { target_sentence: 'Do you like music?', hint_ja: '音楽は好きですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'like', position: 'verb' }, { word: 'music', position: 'object' }
  ]},
  { target_sentence: 'Does she play tennis?', hint_ja: '彼女はテニスをしますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Does', position: 'auxiliary' }, { word: 'she', position: 'subject' }, { word: 'play', position: 'verb' }, { word: 'tennis', position: 'object' }
  ]},
  { target_sentence: 'Do they have pets?', hint_ja: '彼らはペットを飼っていますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do', position: 'auxiliary' }, { word: 'they', position: 'subject' }, { word: 'have', position: 'verb' }, { word: 'pets', position: 'object' }
  ]},
  { target_sentence: 'Does he speak Japanese?', hint_ja: '彼は日本語を話しますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Does', position: 'auxiliary' }, { word: 'he', position: 'subject' }, { word: 'speak', position: 'verb' }, { word: 'Japanese', position: 'object' }
  ]},
  { target_sentence: 'Do you watch TV?', hint_ja: 'テレビを見ますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'watch', position: 'verb' }, { word: 'TV', position: 'object' }
  ]},
  { target_sentence: 'Does your mother cook?', hint_ja: 'あなたのお母さんは料理をしますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Does', position: 'auxiliary' }, { word: 'your mother', position: 'subject' }, { word: 'cook', position: 'verb' }
  ]},
  { target_sentence: 'Do we need tickets?', hint_ja: 'チケットが必要ですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do', position: 'auxiliary' }, { word: 'we', position: 'subject' }, { word: 'need', position: 'verb' }, { word: 'tickets', position: 'object' }
  ]},

  // === 疑問文（過去形） ===
  { target_sentence: 'Where did you go?', hint_ja: 'どこに行きましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Where', position: 'object' }, { word: 'did', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'go', position: 'verb' }
  ]},
  { target_sentence: 'What did you eat?', hint_ja: '何を食べましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'What', position: 'object' }, { word: 'did', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'eat', position: 'verb' }
  ]},
  { target_sentence: 'Did you finish homework?', hint_ja: '宿題は終わりましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Did', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'finish', position: 'verb' }, { word: 'homework', position: 'object' }
  ]},
  { target_sentence: 'Did she call you?', hint_ja: '彼女はあなたに電話しましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Did', position: 'auxiliary' }, { word: 'she', position: 'subject' }, { word: 'call', position: 'verb' }, { word: 'you', position: 'object' }
  ]},
  { target_sentence: 'When did he arrive?', hint_ja: '彼はいつ到着しましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'When', position: 'object' }, { word: 'did', position: 'auxiliary' }, { word: 'he', position: 'subject' }, { word: 'arrive', position: 'verb' }
  ]},

  // === 疑問文（Can/助動詞） ===
  { target_sentence: 'Can you swim?', hint_ja: '泳げますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Can', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'swim', position: 'verb' }
  ]},
  { target_sentence: 'Can she drive?', hint_ja: '彼女は運転できますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Can', position: 'auxiliary' }, { word: 'she', position: 'subject' }, { word: 'drive', position: 'verb' }
  ]},
  { target_sentence: 'May I help you?', hint_ja: 'お手伝いしましょうか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'May', position: 'auxiliary' }, { word: 'I', position: 'subject' }, { word: 'help', position: 'verb' }, { word: 'you', position: 'object' }
  ]},
  { target_sentence: 'Could you wait?', hint_ja: '待っていただけますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Could', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'wait', position: 'verb' }
  ]},
  { target_sentence: 'Should we leave now?', hint_ja: '今出発すべきですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Should', position: 'auxiliary' }, { word: 'we', position: 'subject' }, { word: 'leave', position: 'verb' }, { word: 'now', position: 'object' }
  ]},

  // === 疑問文（Be動詞） ===
  { target_sentence: 'How old are you?', hint_ja: '何歳ですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'How old', position: 'object' }, { word: 'are', position: 'verb' }, { word: 'you', position: 'subject' }
  ]},
  { target_sentence: 'Are you ready?', hint_ja: '準備はできましたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Are', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'ready', position: 'object' }
  ]},
  { target_sentence: 'Is this your book?', hint_ja: 'これはあなたの本ですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Is', position: 'auxiliary' }, { word: 'this', position: 'subject' }, { word: 'your book', position: 'object' }
  ]},
  { target_sentence: 'Were you busy yesterday?', hint_ja: '昨日は忙しかったですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Were', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'busy yesterday', position: 'object' }
  ]},
  { target_sentence: 'Was he sick?', hint_ja: '彼は病気でしたか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Was', position: 'auxiliary' }, { word: 'he', position: 'subject' }, { word: 'sick', position: 'object' }
  ]},

  // === 否定文（Do not/Does not） ===
  { target_sentence: 'I do not like coffee', hint_ja: '私はコーヒーが好きではありません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'do not', position: 'auxiliary' }, { word: 'like', position: 'verb' }, { word: 'coffee', position: 'object' }
  ]},
  { target_sentence: 'She does not speak English', hint_ja: '彼女は英語を話しません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'does not', position: 'auxiliary' }, { word: 'speak', position: 'verb' }, { word: 'English', position: 'object' }
  ]},
  { target_sentence: 'We do not have time', hint_ja: '私たちには時間がありません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'do not', position: 'auxiliary' }, { word: 'have', position: 'verb' }, { word: 'time', position: 'object' }
  ]},
  { target_sentence: 'He does not play sports', hint_ja: '彼はスポーツをしません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'does not', position: 'auxiliary' }, { word: 'play', position: 'verb' }, { word: 'sports', position: 'object' }
  ]},
  { target_sentence: 'They do not live here', hint_ja: '彼らはここに住んでいません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'do not', position: 'auxiliary' }, { word: 'live', position: 'verb' }, { word: 'here', position: 'object' }
  ]},

  // === 否定文（過去形） ===
  { target_sentence: 'I did not go yesterday', hint_ja: '昨日は行きませんでした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'did not', position: 'auxiliary' }, { word: 'go', position: 'verb' }, { word: 'yesterday', position: 'object' }
  ]},
  { target_sentence: 'She did not call me', hint_ja: '彼女は私に電話しませんでした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'did not', position: 'auxiliary' }, { word: 'call', position: 'verb' }, { word: 'me', position: 'object' }
  ]},
  { target_sentence: 'We did not finish work', hint_ja: '私たちは仕事を終えませんでした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'did not', position: 'auxiliary' }, { word: 'finish', position: 'verb' }, { word: 'work', position: 'object' }
  ]},

  // === 否定文（Be動詞） ===
  { target_sentence: 'I am not hungry', hint_ja: 'お腹が空いていません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'am not', position: 'verb' }, { word: 'hungry', position: 'object' }
  ]},
  { target_sentence: 'She is not at home', hint_ja: '彼女は家にいません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is not', position: 'verb' }, { word: 'at home', position: 'object' }
  ]},
  { target_sentence: 'They are not students', hint_ja: '彼らは学生ではありません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'are not', position: 'verb' }, { word: 'students', position: 'object' }
  ]},
  { target_sentence: 'It was not easy', hint_ja: 'それは簡単ではありませんでした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'It', position: 'subject' }, { word: 'was not', position: 'verb' }, { word: 'easy', position: 'object' }
  ]},

  // === 肯定文（現在形） ===
  { target_sentence: 'I will help you', hint_ja: '私があなたを助けます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'will', position: 'auxiliary' }, { word: 'help', position: 'verb' }, { word: 'you', position: 'object' }
  ]},
  { target_sentence: 'She can sing well', hint_ja: '彼女は上手に歌えます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'can', position: 'auxiliary' }, { word: 'sing', position: 'verb' }, { word: 'well', position: 'object' }
  ]},
  { target_sentence: 'We should study more', hint_ja: 'もっと勉強すべきです', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'should', position: 'auxiliary' }, { word: 'study', position: 'verb' }, { word: 'more', position: 'object' }
  ]},
  { target_sentence: 'He might come tomorrow', hint_ja: '彼は明日来るかもしれません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'might', position: 'auxiliary' }, { word: 'come', position: 'verb' }, { word: 'tomorrow', position: 'object' }
  ]},
  { target_sentence: 'You must be careful', hint_ja: '注意しなければなりません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'You', position: 'subject' }, { word: 'must', position: 'auxiliary' }, { word: 'be', position: 'verb' }, { word: 'careful', position: 'object' }
  ]},

  // === 肯定文（過去形） ===
  { target_sentence: 'I visited my friend', hint_ja: '友達を訪ねました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'visited', position: 'verb' }, { word: 'my friend', position: 'object' }
  ]},
  { target_sentence: 'She bought new shoes', hint_ja: '彼女は新しい靴を買いました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'bought', position: 'verb' }, { word: 'new shoes', position: 'object' }
  ]},
  { target_sentence: 'We watched a movie', hint_ja: '私たちは映画を見ました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'watched', position: 'verb' }, { word: 'a movie', position: 'object' }
  ]},
  { target_sentence: 'They traveled to Japan', hint_ja: '彼らは日本に旅行しました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'traveled', position: 'verb' }, { word: 'to Japan', position: 'object' }
  ]},
  { target_sentence: 'He worked very hard', hint_ja: '彼はとても一生懸命働きました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'worked', position: 'verb' }, { word: 'very hard', position: 'object' }
  ]},

  // === 肯定文（未来形） ===
  { target_sentence: 'I will study tomorrow', hint_ja: '明日勉強します', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'will', position: 'auxiliary' }, { word: 'study', position: 'verb' }, { word: 'tomorrow', position: 'object' }
  ]},
  { target_sentence: 'She will cook dinner', hint_ja: '彼女は夕食を作ります', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'will', position: 'auxiliary' }, { word: 'cook', position: 'verb' }, { word: 'dinner', position: 'object' }
  ]},
  { target_sentence: 'We will meet again', hint_ja: 'また会いましょう', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'will', position: 'auxiliary' }, { word: 'meet', position: 'verb' }, { word: 'again', position: 'object' }
  ]},
  { target_sentence: 'They will arrive soon', hint_ja: '彼らはすぐに到着します', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'will', position: 'auxiliary' }, { word: 'arrive', position: 'verb' }, { word: 'soon', position: 'object' }
  ]},

  // === 肯定文（現在進行形） ===
  { target_sentence: 'I am reading a book', hint_ja: '本を読んでいます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'am', position: 'auxiliary' }, { word: 'reading', position: 'verb' }, { word: 'a book', position: 'object' }
  ]},
  { target_sentence: 'She is cooking dinner', hint_ja: '彼女は夕食を作っています', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is', position: 'auxiliary' }, { word: 'cooking', position: 'verb' }, { word: 'dinner', position: 'object' }
  ]},
  { target_sentence: 'We are playing soccer', hint_ja: 'サッカーをしています', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'are', position: 'auxiliary' }, { word: 'playing', position: 'verb' }, { word: 'soccer', position: 'object' }
  ]},
  { target_sentence: 'They are studying English', hint_ja: '彼らは英語を勉強しています', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'are', position: 'auxiliary' }, { word: 'studying', position: 'verb' }, { word: 'English', position: 'object' }
  ]},

  // === 4級追加問題 Part 2 (50問) ===
  
  // === 疑問文（What/Who/Where/When/Why/How） ===
  { target_sentence: 'What time is it?', hint_ja: '何時ですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'What time', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'it', position: 'object' }
  ]},
  { target_sentence: 'Who is your teacher?', hint_ja: 'あなたの先生は誰ですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Who', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'your teacher', position: 'object' }
  ]},
  { target_sentence: 'Where is the library?', hint_ja: '図書館はどこですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Where', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'the library', position: 'object' }
  ]},
  { target_sentence: 'When do you get up?', hint_ja: 'いつ起きますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'When', position: 'object' }, { word: 'do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'get up', position: 'verb' }
  ]},
  { target_sentence: 'Why are you crying?', hint_ja: 'なぜ泣いているのですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Why', position: 'object' }, { word: 'are', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'crying', position: 'verb' }
  ]},
  { target_sentence: 'How much is this?', hint_ja: 'これはいくらですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'How much', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'this', position: 'object' }
  ]},
  { target_sentence: 'Which book do you like?', hint_ja: 'どの本が好きですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Which book', position: 'object' }, { word: 'do', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'like', position: 'verb' }
  ]},
  { target_sentence: 'Whose bag is this?', hint_ja: 'これは誰のカバンですか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Whose bag', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'this', position: 'object' }
  ]},

  // === 現在形肯定文 ===
  { target_sentence: 'My mother works at hospital', hint_ja: '私の母は病院で働いています', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'My mother', position: 'subject' }, { word: 'works', position: 'verb' }, { word: 'at hospital', position: 'object' }
  ]},
  { target_sentence: 'He teaches math at school', hint_ja: '彼は学校で数学を教えています', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'teaches', position: 'verb' }, { word: 'math at school', position: 'object' }
  ]},
  { target_sentence: 'We live in Tokyo', hint_ja: '私たちは東京に住んでいます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'live', position: 'verb' }, { word: 'in Tokyo', position: 'object' }
  ]},
  { target_sentence: 'She always comes early', hint_ja: '彼女はいつも早く来ます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'always comes', position: 'verb' }, { word: 'early', position: 'object' }
  ]},
  { target_sentence: 'They have two children', hint_ja: '彼らには二人の子供がいます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'have', position: 'verb' }, { word: 'two children', position: 'object' }
  ]},

  // === 現在進行形疑問文 ===
  { target_sentence: 'Are you listening to music?', hint_ja: '音楽を聞いていますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Are', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'listening', position: 'verb' }, { word: 'to music', position: 'object' }
  ]},
  { target_sentence: 'Is he playing basketball?', hint_ja: '彼はバスケットボールをしていますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Is', position: 'auxiliary' }, { word: 'he', position: 'subject' }, { word: 'playing', position: 'verb' }, { word: 'basketball', position: 'object' }
  ]},
  { target_sentence: 'Are they doing homework?', hint_ja: '彼らは宿題をしていますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Are', position: 'auxiliary' }, { word: 'they', position: 'subject' }, { word: 'doing', position: 'verb' }, { word: 'homework', position: 'object' }
  ]},
  { target_sentence: 'Is she writing a letter?', hint_ja: '彼女は手紙を書いていますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Is', position: 'auxiliary' }, { word: 'she', position: 'subject' }, { word: 'writing', position: 'verb' }, { word: 'a letter', position: 'object' }
  ]},

  // === 過去形肯定文 ===
  { target_sentence: 'I went to school yesterday', hint_ja: '昨日学校に行きました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'went', position: 'verb' }, { word: 'to school yesterday', position: 'object' }
  ]},
  { target_sentence: 'She made a cake', hint_ja: '彼女はケーキを作りました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'made', position: 'verb' }, { word: 'a cake', position: 'object' }
  ]},
  { target_sentence: 'We played tennis yesterday', hint_ja: '昨日テニスをしました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'played', position: 'verb' }, { word: 'tennis yesterday', position: 'object' }
  ]},
  { target_sentence: 'He took many pictures', hint_ja: '彼はたくさん写真を撮りました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'took', position: 'verb' }, { word: 'many pictures', position: 'object' }
  ]},
  { target_sentence: 'They came back home', hint_ja: '彼らは家に帰りました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'came back', position: 'verb' }, { word: 'home', position: 'object' }
  ]},

  // === Be動詞過去形 ===
  { target_sentence: 'I was very tired', hint_ja: 'とても疲れていました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'was', position: 'verb' }, { word: 'very tired', position: 'object' }
  ]},
  { target_sentence: 'She was at home', hint_ja: '彼女は家にいました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'was', position: 'verb' }, { word: 'at home', position: 'object' }
  ]},
  { target_sentence: 'We were very happy', hint_ja: '私たちはとても幸せでした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'were', position: 'verb' }, { word: 'very happy', position: 'object' }
  ]},
  { target_sentence: 'They were good friends', hint_ja: '彼らは良い友達でした', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'were', position: 'verb' }, { word: 'good friends', position: 'object' }
  ]},

  // === 未来形疑問文 ===
  { target_sentence: 'Will you come tomorrow?', hint_ja: '明日来ますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Will', position: 'auxiliary' }, { word: 'you', position: 'subject' }, { word: 'come', position: 'verb' }, { word: 'tomorrow', position: 'object' }
  ]},
  { target_sentence: 'Will she be there?', hint_ja: '彼女はそこにいますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Will', position: 'auxiliary' }, { word: 'she', position: 'subject' }, { word: 'be', position: 'verb' }, { word: 'there', position: 'object' }
  ]},
  { target_sentence: 'Will they help us?', hint_ja: '彼らは私たちを助けてくれますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Will', position: 'auxiliary' }, { word: 'they', position: 'subject' }, { word: 'help', position: 'verb' }, { word: 'us', position: 'object' }
  ]},

  // === 現在進行形否定文 ===
  { target_sentence: 'I am not sleeping now', hint_ja: '今寝ていません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'am not', position: 'auxiliary' }, { word: 'sleeping', position: 'verb' }, { word: 'now', position: 'object' }
  ]},
  { target_sentence: 'She is not coming today', hint_ja: '彼女は今日来ません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is not', position: 'auxiliary' }, { word: 'coming', position: 'verb' }, { word: 'today', position: 'object' }
  ]},
  { target_sentence: 'They are not playing outside', hint_ja: '彼らは外で遊んでいません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'They', position: 'subject' }, { word: 'are not', position: 'auxiliary' }, { word: 'playing', position: 'verb' }, { word: 'outside', position: 'object' }
  ]},

  // === 比較級 ===
  { target_sentence: 'She is taller than me', hint_ja: '彼女は私より背が高いです', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'taller than me', position: 'object' }
  ]},
  { target_sentence: 'This book is more interesting', hint_ja: 'この本はもっと面白いです', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'This book', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'more interesting', position: 'object' }
  ]},
  { target_sentence: 'He runs faster than Tom', hint_ja: '彼はトムより速く走ります', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'runs', position: 'verb' }, { word: 'faster than Tom', position: 'object' }
  ]},

  // === 最上級 ===
  { target_sentence: 'This is the best movie', hint_ja: 'これは最高の映画です', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'This', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'the best movie', position: 'object' }
  ]},
  { target_sentence: 'She is the tallest girl', hint_ja: '彼女は一番背の高い女の子です', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'the tallest girl', position: 'object' }
  ]},

  // === There is/are構文 ===
  { target_sentence: 'There are many books', hint_ja: 'たくさんの本があります', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'There', position: 'subject' }, { word: 'are', position: 'verb' }, { word: 'many books', position: 'object' }
  ]},
  { target_sentence: 'There is a cat', hint_ja: '猫がいます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'There', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'a cat', position: 'object' }
  ]},
  { target_sentence: 'Is there a post office?', hint_ja: '郵便局はありますか？', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Is', position: 'auxiliary' }, { word: 'there', position: 'subject' }, { word: 'a post office', position: 'object' }
  ]},

  // === 頻度副詞 ===
  { target_sentence: 'I usually get up early', hint_ja: '私は普通早く起きます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'usually get up', position: 'verb' }, { word: 'early', position: 'object' }
  ]},
  { target_sentence: 'She often goes shopping', hint_ja: '彼女はよく買い物に行きます', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'often goes', position: 'verb' }, { word: 'shopping', position: 'object' }
  ]},
  { target_sentence: 'We sometimes eat out', hint_ja: '私たちは時々外食します', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'We', position: 'subject' }, { word: 'sometimes eat', position: 'verb' }, { word: 'out', position: 'object' }
  ]},
  { target_sentence: 'He never drinks coffee', hint_ja: '彼はコーヒーを飲みません', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'He', position: 'subject' }, { word: 'never drinks', position: 'verb' }, { word: 'coffee', position: 'object' }
  ]},

  // === 命令文 ===
  { target_sentence: 'Please close the window', hint_ja: '窓を閉めてください', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Please', position: 'auxiliary' }, { word: 'close', position: 'verb' }, { word: 'the window', position: 'object' }
  ]},
  { target_sentence: 'Do not touch that', hint_ja: 'それに触らないでください', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Do not', position: 'auxiliary' }, { word: 'touch', position: 'verb' }, { word: 'that', position: 'object' }
  ]},
  { target_sentence: 'Let me help you', hint_ja: 'お手伝いさせてください', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'Let', position: 'auxiliary' }, { word: 'me', position: 'subject' }, { word: 'help', position: 'verb' }, { word: 'you', position: 'object' }
  ]},

  // === 感嘆文 ===
  { target_sentence: 'How beautiful she is!', hint_ja: '彼女はなんて美しいんでしょう！', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'How beautiful', position: 'object' }, { word: 'she', position: 'subject' }, { word: 'is', position: 'verb' }
  ]},
  { target_sentence: 'What a nice day!', hint_ja: 'なんて良い天気でしょう！', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'What', position: 'auxiliary' }, { word: 'a nice day', position: 'object' }
  ]},

  // === 接続詞 ===
  { target_sentence: 'I like cats and dogs', hint_ja: '私は猫と犬が好きです', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'like', position: 'verb' }, { word: 'cats and dogs', position: 'object' }
  ]},
  { target_sentence: 'She is kind but strict', hint_ja: '彼女は優しいけれど厳しいです', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'She', position: 'subject' }, { word: 'is', position: 'verb' }, { word: 'kind but strict', position: 'object' }
  ]},
  { target_sentence: 'I stayed home because sick', hint_ja: '病気なので家にいました', level: 'intermediate', eiken_level: '4', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'stayed', position: 'verb' }, { word: 'home because sick', position: 'object' }
  ]},

  // 3級レベル追加問題
  { target_sentence: 'I have been waiting', hint_ja: '私は待っています', level: 'advanced', eiken_level: '3', words_pool: [
    { word: 'I', position: 'subject' }, { word: 'have been', position: 'auxiliary' }, { word: 'waiting', position: 'verb' }
  ]},
  { target_sentence: 'If it rains tomorrow', hint_ja: '明日雨が降れば', level: 'advanced', eiken_level: '3', words_pool: [
    { word: 'If', position: 'auxiliary' }, { word: 'it', position: 'subject' }, { word: 'rains', position: 'verb' }, { word: 'tomorrow', position: 'object' }
  ]}
]

const loadCSVData = async () => {
  try {
    isLoading.value = true
    hasError.value = false
    
    console.log('Loading CSV data...')
    
    // Load all CSV data
    console.log('📥 grammarContentManager.loadAllData() 開始')
    try {
      const loadResult = await grammarContentManager.loadAllData()
      console.log('📥 grammarContentManager.loadAllData() 完了:', loadResult)
      
      grammarContent.value = grammarContentManager.getGrammarContent() || []
      problemSets.value = grammarContentManager.getProblemSets() || []
      
    } catch (grammarManagerError) {
      console.error('❌ grammarContentManager.loadAllData() エラー:', grammarManagerError)
      // エラーの場合は空の配列で初期化
      grammarContent.value = []
      problemSets.value = []
    }
    
    console.log('📊 grammarContentManager から取得したデータ:')
    console.log('- grammarContent.value:', grammarContent.value.length)
    console.log('- problemSets.value:', problemSets.value.length)
    
    // 🎯 追加問題を最優先で使用（既存のproblem_sets.jsonを上書き）
    console.log('==============================')
    console.log('🎯 GRAMMAR COLOR CODE データ分析')
    console.log('==============================')
    console.log('📊 additionalProblems 配列の詳細分析:')
    console.log('- 全体の長さ:', additionalProblems.length)
    
    // 英検レベル別の分布を確認
    const levelDistribution = additionalProblems.reduce((acc, problem) => {
      const level = problem.eiken_level || 'unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
    console.log('- 英検レベル別分布:', levelDistribution)
    
    // 4級問題の具体例を表示
    const grade4Problems = additionalProblems.filter(p => p.eiken_level === '4')
    console.log('- 4級問題数:', grade4Problems.length)
    if (grade4Problems.length > 0) {
      console.log('- 4級問題の最初の5個:', grade4Problems.slice(0, 5).map(p => p.target_sentence))
      console.log('- 4級問題の最後の5個:', grade4Problems.slice(-5).map(p => p.target_sentence))
    }
    
    const additionalProblemsWithIds = additionalProblems.map((problem, index) => ({
      ...problem,
      set_id: 1000 + index, // IDの重複を避ける
      category: problem.level === 'beginner' ? 'beVerb' : 
               problem.level === 'intermediate' ? 'generalVerb' : 'advanced',
      estimated_difficulty: problem.level === 'beginner' ? 1.5 : 
                           problem.level === 'intermediate' ? 3.0 : 4.5,
      visual_theme: 'general',
      grammar_pattern: 'SVO'
    }))
    
    // 🔧 additionalProblemsを最優先で使用（既存データを完全に置き換え）
    console.log('🔧 既存のproblemSets.valueを完全にadditionalProblemsで置き換えます')
    problemSets.value = [...additionalProblemsWithIds]
    console.log(`✅ ${additionalProblemsWithIds.length}個の追加問題で置き換え完了`)
    console.log('📊 最終的なproblemSets.value:', problemSets.value.length)
    
    // 統合後の4級問題数を確認
    const finalGrade4Problems = problemSets.value.filter(p => p.eiken_level === '4')
    console.log('📊 最終4級問題数:', finalGrade4Problems.length)
    if (finalGrade4Problems.length > 0) {
      console.log('📝 最終4級問題サンプル (最初の3個):', finalGrade4Problems.slice(0, 3).map(p => p.target_sentence))
      console.log('📝 最終4級問題サンプル (最後の3個):', finalGrade4Problems.slice(-3).map(p => p.target_sentence))
    }
    
    // Visual elementsを直接JSONから読み込み
    try {
      console.log('📥 Visual elements JSON読み込み開始')
      const visualResponse = await fetch('/data/csv/visual_elements.json')
      console.log('📥 Visual elements レスポンス:', visualResponse.status)
      visualElements.value = await visualResponse.json()
      console.log('📥 Visual elements読み込み完了:', visualElements.value.length)
    } catch (error) {
      console.warn('Visual elements load failed, using empty array:', error)
      visualElements.value = []
    }
    
    console.log('CSV data loaded:', {
      content: Array.isArray(grammarContent.value) ? grammarContent.value.length : 0,
      problems: Array.isArray(problemSets.value) ? problemSets.value.length : 0,
      visuals: Array.isArray(visualElements.value) ? visualElements.value.length : 0
    })
    
    csvDataLoaded.value = true
    
    // Initialize problem generator
    console.log('🔧 Initializing problemGenerator with data:')
    console.log('- Grammar content:', grammarContent.value.length)
    console.log('- Problem sets:', problemSets.value.length)
    console.log('- Visual elements:', visualElements.value.length)
    
    // 🔧 JSONファイルからの読み込みを無効化（additionalProblemsのみ使用）
    console.log('🔧 JSONファイルからの読み込みをスキップし、additionalProblemsのみを使用します')
    
    // grammarContentが空の場合は、最小限のフォールバックデータを設定
    if (grammarContent.value.length === 0) {
      console.log('⚠️ grammarContentが空のため、基本的な語彙データを生成')
      grammarContent.value = [
        // Be動詞系
        { word: "I", type: "pronoun", color: "blue", position: "subject", japanese: "私", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "You", type: "pronoun", color: "blue", position: "subject", japanese: "あなた", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "He", type: "pronoun", color: "blue", position: "subject", japanese: "彼", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "She", type: "pronoun", color: "blue", position: "subject", japanese: "彼女", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "It", type: "pronoun", color: "blue", position: "subject", japanese: "それ", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "We", type: "pronoun", color: "blue", position: "subject", japanese: "私たち", level: "beginner", category: "beVerb", hint: "主語" },
        { word: "They", type: "pronoun", color: "blue", position: "subject", japanese: "彼ら", level: "beginner", category: "beVerb", hint: "主語" },
        
        { word: "am", type: "be-verb", color: "blue", position: "verb", japanese: "です", level: "beginner", category: "beVerb", hint: "be動詞" },
        { word: "is", type: "be-verb", color: "blue", position: "verb", japanese: "です", level: "beginner", category: "beVerb", hint: "be動詞" },
        { word: "are", type: "be-verb", color: "blue", position: "verb", japanese: "です", level: "beginner", category: "beVerb", hint: "be動詞" },
        { word: "was", type: "be-verb", color: "blue", position: "verb", japanese: "でした", level: "intermediate", category: "beVerb", hint: "be動詞過去" },
        { word: "were", type: "be-verb", color: "blue", position: "verb", japanese: "でした", level: "intermediate", category: "beVerb", hint: "be動詞過去" },
        
        // 一般動詞系
        { word: "like", type: "verb", color: "red", position: "verb", japanese: "好き", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "likes", type: "verb", color: "red", position: "verb", japanese: "好き", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "play", type: "verb", color: "red", position: "verb", japanese: "する", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "plays", type: "verb", color: "red", position: "verb", japanese: "する", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "go", type: "verb", color: "red", position: "verb", japanese: "行く", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "went", type: "verb", color: "red", position: "verb", japanese: "行った", level: "intermediate", category: "generalVerb", hint: "一般動詞過去" },
        { word: "have", type: "verb", color: "red", position: "verb", japanese: "持つ", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "has", type: "verb", color: "red", position: "verb", japanese: "持つ", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        
        // 助動詞
        { word: "Do", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しますか", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Does", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しますか", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Did", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しましたか", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Will", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "でしょう", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Can", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "できる", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Are", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ですか", level: "intermediate", category: "beVerb", hint: "助動詞" },
        { word: "Is", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ですか", level: "intermediate", category: "beVerb", hint: "助動詞" },
        
        // 疑問詞
        { word: "What", type: "wh-word", color: "yellow", position: "subject", japanese: "何", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "Who", type: "wh-word", color: "yellow", position: "subject", japanese: "誰", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "Where", type: "wh-word", color: "yellow", position: "subject", japanese: "どこ", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "When", type: "wh-word", color: "yellow", position: "object", japanese: "いつ", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "Why", type: "wh-word", color: "yellow", position: "object", japanese: "なぜ", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "How", type: "wh-word", color: "yellow", position: "object", japanese: "どのように", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        
        // その他の基本語彙
        { word: "happy", type: "adjective", color: "blue", position: "object", japanese: "幸せ", level: "beginner", category: "beVerb", hint: "形容詞" },
        { word: "sad", type: "adjective", color: "blue", position: "object", japanese: "悲しい", level: "beginner", category: "beVerb", hint: "形容詞" },
        { word: "tired", type: "adjective", color: "blue", position: "object", japanese: "疲れた", level: "beginner", category: "beVerb", hint: "形容詞" },
        { word: "busy", type: "adjective", color: "blue", position: "object", japanese: "忙しい", level: "beginner", category: "beVerb", hint: "形容詞" },
        { word: "hungry", type: "adjective", color: "blue", position: "object", japanese: "お腹空いた", level: "intermediate", category: "beVerb", hint: "形容詞" },
        { word: "ready", type: "adjective", color: "blue", position: "object", japanese: "準備できた", level: "intermediate", category: "beVerb", hint: "形容詞" },
        { word: "sick", type: "adjective", color: "blue", position: "object", japanese: "病気", level: "intermediate", category: "beVerb", hint: "形容詞" },
        { word: "easy", type: "adjective", color: "blue", position: "object", japanese: "簡単", level: "intermediate", category: "beVerb", hint: "形容詞" },
        { word: "early", type: "adjective", color: "red", position: "object", japanese: "早い", level: "intermediate", category: "generalVerb", hint: "形容詞" },
        { word: "careful", type: "adjective", color: "red", position: "object", japanese: "注意深い", level: "intermediate", category: "generalVerb", hint: "形容詞" },
        
        { word: "music", type: "noun", color: "red", position: "object", japanese: "音楽", level: "beginner", category: "generalVerb", hint: "名詞" },
        { word: "soccer", type: "noun", color: "red", position: "object", japanese: "サッカー", level: "beginner", category: "generalVerb", hint: "名詞" },
        { word: "tennis", type: "noun", color: "red", position: "object", japanese: "テニス", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "basketball", type: "noun", color: "red", position: "object", japanese: "バスケ", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "pets", type: "noun", color: "red", position: "object", japanese: "ペット", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "Japanese", type: "noun", color: "red", position: "object", japanese: "日本語", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "English", type: "noun", color: "red", position: "object", japanese: "英語", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "homework", type: "noun", color: "red", position: "object", japanese: "宿題", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "tickets", type: "noun", color: "red", position: "object", japanese: "チケット", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "coffee", type: "noun", color: "red", position: "object", japanese: "コーヒー", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "time", type: "noun", color: "red", position: "object", japanese: "時間", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "sports", type: "noun", color: "red", position: "object", japanese: "スポーツ", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "work", type: "noun", color: "red", position: "object", japanese: "仕事", level: "intermediate", category: "generalVerb", hint: "名詞" },
        { word: "well", type: "adverb", color: "red", position: "object", japanese: "上手に", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "more", type: "adverb", color: "red", position: "object", japanese: "もっと", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "tomorrow", type: "adverb", color: "red", position: "object", japanese: "明日", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "yesterday", type: "adverb", color: "red", position: "modifier", japanese: "昨日", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "now", type: "adverb", color: "red", position: "object", japanese: "今", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "today", type: "adverb", color: "red", position: "object", japanese: "今日", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "soon", type: "adverb", color: "red", position: "object", japanese: "すぐに", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "again", type: "adverb", color: "red", position: "object", japanese: "また", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "there", type: "adverb", color: "red", position: "object", japanese: "そこに", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "here", type: "adverb", color: "red", position: "object", japanese: "ここに", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "home", type: "adverb", color: "red", position: "object", japanese: "家に", level: "intermediate", category: "generalVerb", hint: "副詞" },
        { word: "outside", type: "adverb", color: "red", position: "object", japanese: "外で", level: "intermediate", category: "generalVerb", hint: "副詞" },
        
        { word: "book", type: "noun", color: "blue", position: "object", japanese: "本", level: "beginner", category: "beVerb", hint: "名詞" },
        { word: "students", type: "noun", color: "blue", position: "object", japanese: "学生たち", level: "beginner", category: "beVerb", hint: "名詞" },
        { word: "friends", type: "noun", color: "blue", position: "object", japanese: "友達", level: "beginner", category: "beVerb", hint: "名詞" },
        { word: "this", type: "pronoun", color: "yellow", position: "object", japanese: "これ", level: "intermediate", category: "whQuestion", hint: "代名詞" },
        { word: "you", type: "pronoun", color: "yellow", position: "object", japanese: "あなた", level: "intermediate", category: "whQuestion", hint: "代名詞" },
        { word: "he", type: "pronoun", color: "yellow", position: "object", japanese: "彼", level: "intermediate", category: "whQuestion", hint: "代名詞" },
        { word: "me", type: "pronoun", color: "red", position: "object", japanese: "私を", level: "intermediate", category: "generalVerb", hint: "代名詞" },
        { word: "us", type: "pronoun", color: "red", position: "object", japanese: "私たちを", level: "intermediate", category: "generalVerb", hint: "代名詞" },
        
        // 動詞の追加
        { word: "speak", type: "verb", color: "red", position: "verb", japanese: "話す", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "watch", type: "verb", color: "red", position: "verb", japanese: "見る", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "cook", type: "verb", color: "red", position: "verb", japanese: "料理する", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "need", type: "verb", color: "red", position: "verb", japanese: "必要とする", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "eat", type: "verb", color: "red", position: "verb", japanese: "食べる", level: "beginner", category: "generalVerb", hint: "一般動詞" },
        { word: "finish", type: "verb", color: "red", position: "verb", japanese: "終える", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "call", type: "verb", color: "red", position: "verb", japanese: "電話する", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "live", type: "verb", color: "red", position: "verb", japanese: "住む", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "come", type: "verb", color: "red", position: "verb", japanese: "来る", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "help", type: "verb", color: "red", position: "verb", japanese: "助ける", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "sing", type: "verb", color: "red", position: "verb", japanese: "歌う", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "study", type: "verb", color: "red", position: "verb", japanese: "勉強する", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "wait", type: "verb", color: "red", position: "verb", japanese: "待つ", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "swim", type: "verb", color: "red", position: "verb", japanese: "泳ぐ", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "drive", type: "verb", color: "red", position: "verb", japanese: "運転する", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "leave", type: "verb", color: "red", position: "verb", japanese: "去る", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "meet", type: "verb", color: "red", position: "verb", japanese: "会う", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "arrive", type: "verb", color: "red", position: "verb", japanese: "到着する", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        { word: "be", type: "verb", color: "red", position: "verb", japanese: "である", level: "intermediate", category: "generalVerb", hint: "一般動詞" },
        
        // 進行形動詞
        { word: "listening", type: "verb", color: "red", position: "verb", japanese: "聞いている", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "playing", type: "verb", color: "red", position: "verb", japanese: "している", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "doing", type: "verb", color: "red", position: "verb", japanese: "している", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "writing", type: "verb", color: "red", position: "verb", japanese: "書いている", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "sleeping", type: "verb", color: "red", position: "verb", japanese: "寝ている", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "coming", type: "verb", color: "red", position: "verb", japanese: "来ている", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "reading", type: "verb", color: "red", position: "verb", japanese: "読んでいる", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "cooking", type: "verb", color: "red", position: "verb", japanese: "料理している", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "studying", type: "verb", color: "red", position: "verb", japanese: "勉強している", level: "intermediate", category: "generalVerb", hint: "進行形" },
        { word: "crying", type: "verb", color: "red", position: "verb", japanese: "泣いている", level: "intermediate", category: "generalVerb", hint: "進行形" },
        
        // 過去形動詞
        { word: "visited", type: "verb", color: "red", position: "verb", japanese: "訪ねた", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "bought", type: "verb", color: "red", position: "verb", japanese: "買った", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "watched", type: "verb", color: "red", position: "verb", japanese: "見た", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "traveled", type: "verb", color: "red", position: "verb", japanese: "旅行した", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "worked", type: "verb", color: "red", position: "verb", japanese: "働いた", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "made", type: "verb", color: "red", position: "verb", japanese: "作った", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "played", type: "verb", color: "red", position: "verb", japanese: "した", level: "intermediate", category: "generalVerb", hint: "過去形" },
        { word: "took", type: "verb", color: "red", position: "verb", japanese: "撮った", level: "intermediate", category: "generalVerb", hint: "過去形" },
        
        // 否定形助動詞
        { word: "am not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ではない", level: "intermediate", category: "beVerb", hint: "否定助動詞" },
        { word: "is not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ではない", level: "intermediate", category: "beVerb", hint: "否定助動詞" },
        { word: "are not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ではない", level: "intermediate", category: "beVerb", hint: "否定助動詞" },
        { word: "was not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ではなかった", level: "intermediate", category: "beVerb", hint: "否定助動詞" },
        { word: "were not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "ではなかった", level: "intermediate", category: "beVerb", hint: "否定助動詞" },
        { word: "do not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しない", level: "intermediate", category: "generalVerb", hint: "否定助動詞" },
        { word: "does not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しない", level: "intermediate", category: "generalVerb", hint: "否定助動詞" },
        { word: "did not", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しなかった", level: "intermediate", category: "generalVerb", hint: "否定助動詞" },
        
        // その他の助動詞
        { word: "May", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "してもよい", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Could", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "できた", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "Should", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "すべき", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "must", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "しなければならない", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "might", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "かもしれない", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "can", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "できる", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "will", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "でしょう", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        { word: "should", type: "auxiliary", color: "yellow", position: "auxiliary", japanese: "すべき", level: "intermediate", category: "generalVerb", hint: "助動詞" },
        
        // 複合語・句
        { word: "What time", type: "wh-word", color: "yellow", position: "subject", japanese: "何時", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "How old", type: "wh-word", color: "yellow", position: "object", japanese: "何歳", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "How much", type: "wh-word", color: "yellow", position: "subject", japanese: "いくら", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "Which book", type: "wh-word", color: "yellow", position: "object", japanese: "どの本", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "Whose bag", type: "wh-word", color: "yellow", position: "subject", japanese: "誰のカバン", level: "intermediate", category: "whQuestion", hint: "疑問詞" },
        { word: "your teacher", type: "noun", color: "yellow", position: "object", japanese: "あなたの先生", level: "intermediate", category: "whQuestion", hint: "名詞句" },
        { word: "the library", type: "noun", color: "yellow", position: "object", japanese: "図書館", level: "intermediate", category: "whQuestion", hint: "名詞句" },
        { word: "get up", type: "verb", color: "red", position: "verb", japanese: "起きる", level: "intermediate", category: "generalVerb", hint: "句動詞" },
        { word: "came back", type: "verb", color: "red", position: "verb", japanese: "帰った", level: "intermediate", category: "generalVerb", hint: "句動詞" },
        
        // その他の重要語彙
        { word: "it", type: "pronoun", color: "yellow", position: "object", japanese: "それ", level: "intermediate", category: "whQuestion", hint: "代名詞" },
        { word: "My mother", type: "noun", color: "red", position: "subject", japanese: "私の母", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "your mother", type: "noun", color: "red", position: "subject", japanese: "あなたの母", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "my friend", type: "noun", color: "red", position: "object", japanese: "私の友達", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "two children", type: "noun", color: "red", position: "object", japanese: "二人の子供", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "at hospital", type: "prepositional", color: "red", position: "object", japanese: "病院で", level: "intermediate", category: "generalVerb", hint: "前置詞句" },
        { word: "math at school", type: "noun", color: "red", position: "object", japanese: "学校で数学", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "in Tokyo", type: "prepositional", color: "red", position: "object", japanese: "東京に", level: "intermediate", category: "generalVerb", hint: "前置詞句" },
        { word: "always comes", type: "verb", color: "red", position: "verb", japanese: "いつも来る", level: "intermediate", category: "generalVerb", hint: "動詞句" },
        { word: "to music", type: "prepositional", color: "red", position: "object", japanese: "音楽を", level: "intermediate", category: "generalVerb", hint: "前置詞句" },
        { word: "a letter", type: "noun", color: "red", position: "object", japanese: "手紙", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "to school yesterday", type: "prepositional", color: "red", position: "object", japanese: "昨日学校に", level: "intermediate", category: "generalVerb", hint: "前置詞句" },
        { word: "a cake", type: "noun", color: "red", position: "object", japanese: "ケーキ", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "tennis yesterday", type: "noun", color: "red", position: "object", japanese: "昨日テニス", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "many pictures", type: "noun", color: "red", position: "object", japanese: "たくさんの写真", level: "intermediate", category: "generalVerb", hint: "名詞句" },
        { word: "very tired", type: "adjective", color: "blue", position: "object", japanese: "とても疲れた", level: "intermediate", category: "beVerb", hint: "形容詞句" },
        { word: "at home", type: "prepositional", color: "blue", position: "object", japanese: "家に", level: "intermediate", category: "beVerb", hint: "前置詞句" },
        { word: "very happy", type: "adjective", color: "blue", position: "object", japanese: "とても幸せ", level: "intermediate", category: "beVerb", hint: "形容詞句" },
        { word: "good friends", type: "noun", color: "blue", position: "object", japanese: "良い友達", level: "intermediate", category: "beVerb", hint: "名詞句" }
      ]
      console.log('✅ 基本語彙データ生成完了:', grammarContent.value.length, '個')
    }
    
    console.log('🚀 problemGenerator.initialize()を呼び出し直前のデータ確認:')
    console.log('- grammarContent.value type:', typeof grammarContent.value, 'length:', grammarContent.value?.length)
    console.log('- problemSets.value type:', typeof problemSets.value, 'length:', problemSets.value?.length)
    console.log('- visualElements.value type:', typeof visualElements.value, 'length:', visualElements.value?.length)
    
    if (problemSets.value?.length > 0) {
      console.log('- problemSets.value[0]:', problemSets.value[0])
    }
    
    problemGenerator.initialize(grammarContent.value, problemSets.value, visualElements.value)
    
    // 初期化後の確認
    console.log('🔍 initialize()実行後のproblemGenerator状態確認:')
    console.log('- problemGenerator.problemSets.length:', problemGenerator.problemSets?.length)
    console.log('- problemGenerator.contentData.length:', problemGenerator.contentData?.length)
    console.log('- problemGenerator.isInitialized:', problemGenerator.isInitialized)
    
  } catch (error) {
    console.error('Error loading CSV data:', error)
    hasError.value = true
    errorMessage.value = error.message || 'データの読み込みに失敗しました'
  } finally {
    isLoading.value = false
  }
}

const retryLoading = () => {
  loadCSVData()
}

// Game methods
const selectDifficulty = (difficultyId) => {
  selectedDifficulty.value = difficultyId
  const difficulty = difficultyLevels.find(d => d.id === difficultyId)
  gameTime.value = difficulty.timeLimit
  gameState.value.targetSentences = difficulty.targetSentences
  console.log(`Selected difficulty: ${difficulty.name} (Eiken Level ${difficulty.eiken_level})`)
}

const startGame = async () => {
  console.log('🎮 ゲーム開始ボタンがクリックされました')
  console.log('📊 データ読み込み状況:', csvDataLoaded.value)
  
  if (!csvDataLoaded.value) {
    console.error('CSV data not loaded')
    return
  }
  
  console.log('🎯 ゲーム状態を開始に設定')
  gameState.value.started = true
  gameState.value.isPlaying = true
  gameState.value.timeRemaining = gameTime.value
  
  console.log('🔍 ゲーム状態確認:', {
    started: gameState.value.started,
    isPlaying: gameState.value.isPlaying,
    isLoading: isLoading.value,
    hasError: hasError.value
  })
  
  // 問題を一括生成
  const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty.value)
  const generatedProblems = await problemGenerator.generateMultipleProblems(
    gameState.value.targetSentences,
    {
      level: difficulty.level,
      eiken_level: difficulty.eiken_level,
      planetId: planetId.value
    }
  )
  
  if (!generatedProblems || generatedProblems.length === 0) {
    throw new Error('問題の生成に失敗しました')
  }
  
  problems.value = generatedProblems
  currentProblemIndex.value = 0
  
  // 最初の問題を表示
  await showCurrentProblem()
  
  // タイマー開始
  startTimer()
  
  // 開始音を再生
  playSound('gameStart')
}

const showCurrentProblem = async () => {
  try {
    console.log('🔍 [showCurrentProblem] 問題表示開始')
    elementsLoading.value = true
    
    const problem = problems.value[currentProblemIndex.value]
    console.log('🔍 [showCurrentProblem] Problem:', problem)
    
    if (!problem) {
      console.error('❌ [showCurrentProblem] 問題が見つかりません')
      return
    }
    
    currentProblem.value = {
      target_sentence: problem.targetSentence,
      hint_ja: problem.hintJapanese,
      words_pool: problem.elements?.filter(el => el.isCorrect) || []
    }
    
    console.log('🔍 [showCurrentProblem] currentProblem設定完了:', currentProblem.value)
    
    // ドロップゾーンをクリア（要素の配置状態のみ）
    clearDropZones()
    
    // Check if auxiliary zone is needed
    const hasAuxiliary = currentProblem.value.words_pool?.some(w => w.position === 'auxiliary')
    const auxiliaryZone = dropZones.value.find(z => z.id === 'auxiliary')
    if (auxiliaryZone) {
      auxiliaryZone.isVisible = hasAuxiliary
      console.log('🔍 [showCurrentProblem] Auxiliary zone visibility:', hasAuxiliary)
      console.log('🔍 [showCurrentProblem] Auxiliary zone words:', currentProblem.value.words_pool?.filter(w => w.position === 'auxiliary'))
    }
    
    availableElements.value = problem.elements?.map((element, index) => ({
      ...element,
      id: `element-${currentProblemIndex.value}-${index}`,
      isUsed: false
    })) || []
    
    console.log('🔍 [showCurrentProblem] availableElements設定完了:', availableElements.value.length)
    console.log('🔍 [showCurrentProblem] words_pool positions:', currentProblem.value.words_pool?.map(w => ({ word: w.word, position: w.position })))
    
  } catch (error) {
    console.error('❌ [showCurrentProblem] Error:', error)
    hasError.value = true
    errorMessage.value = '問題の表示に失敗しました'
  } finally {
    elementsLoading.value = false
  }
}

const startTimer = () => {
  // 既存のタイマーをクリア
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  
  gameTimer = setInterval(() => {
    if (gameState.value.timeRemaining > 0) {
      gameState.value.timeRemaining--
    }
    
    if (gameState.value.timeRemaining <= 0) {
      endGame()
    }
  }, 1000)
}

// Drag and drop handlers
const handleDragStart = (element) => {
  if (gameMode.value !== 'normal') return
  draggedElement.value = element
}

const handleDragEnd = () => {
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  draggedElement.value = null
}

const handleDragOver = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  event.preventDefault()
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone && !zone.element) {
    zone.isActive = true
    
    if (draggedElement.value) {
      zone.isValid = isValidDrop(draggedElement.value, zoneId)
      zone.isInvalid = !zone.isValid
    }
  }
}

const handleDragLeave = (zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone) {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  }
}

const handleDrop = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  event.preventDefault()
  console.log(`[handleDrop] ドロップイベント発火: zoneId=${zoneId}`)
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone) {
    console.warn(`[handleDrop] ドロップゾーンが見つかりません: ${zoneId}`)
    return
  }
  if (zone.element) {
    console.warn(`[handleDrop] 既に要素が配置されています: zoneId=${zoneId}`)
    return
  }
  if (!draggedElement.value) {
    console.warn('[handleDrop] draggedElementがnullです')
    return
  }
  const valid = isValidDrop(draggedElement.value, zoneId)
  console.log(`[handleDrop] バリデーション結果: valid=${valid}`)
  console.log(`[handleDrop] DEBUG - Element details:`, {
    word: draggedElement.value.word,
    position: draggedElement.value.position,
    id: draggedElement.value.id,
    type: draggedElement.value.type
  })
  console.log(`[handleDrop] DEBUG - Current problem:`, currentProblem.value)
  console.log(`[handleDrop] DEBUG - Available elements:`, availableElements.value)
  
  if (!valid) {
    playSound('error')
    showErrorFeedback()
    console.error(`[handleDrop] ドロップ失敗: element=${draggedElement.value.word}, zoneId=${zoneId}`)
    return
  }
  placeElementInZone(draggedElement.value, zoneId)
  playSound('drop')
  console.log(`[handleDrop] ドロップ成功: element=${draggedElement.value.word}, zoneId=${zoneId}`)
}

// Kids mode handlers
const handleElementClick = (element) => {
  if (gameMode.value !== 'kids' || element.isUsed) return
  
  if (selectedElementForKids.value?.id === element.id) {
    // Deselect if clicking the same element
    selectedElementForKids.value = null
    return
  }
  
  selectedElementForKids.value = element
  
  // Highlight valid zones for this element
  dropZones.value.forEach(zone => {
    if (!zone.element) {
      zone.isValid = isValidDrop(element, zone.id)
      zone.isInvalid = !zone.isValid
    }
  })
  
  playSound('select')
}

const handleZoneClick = (zoneId) => {
  if (gameMode.value !== 'kids') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone || zone.element) return
  
  if (selectedElementForKids.value) {
    if (isValidDrop(selectedElementForKids.value, zoneId)) {
      placeElementInZone(selectedElementForKids.value, zoneId)
      selectedElementForKids.value = null
      
      // Clear zone highlights
      dropZones.value.forEach(z => {
        z.isValid = false
        z.isInvalid = false
      })
      
      playSound('drop')
    } else {
      playSound('error')
      showErrorFeedback()
    }
  }
}

// Element placement logic
const placeElementInZone = (element, zoneId) => {
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone) {
    console.warn(`[placeElementInZone] 指定ゾーンが見つかりません: ${zoneId}`)
    return
  }
  // Place element in zone
  zone.element = { ...element }
  // Mark element as used
  const elementInPool = availableElements.value.find(e => e.id === element.id)
  if (elementInPool) {
    elementInPool.isUsed = true
    console.log(`[placeElementInZone] isUsedフラグをtrueに: ${elementInPool.word}`)
  } else {
    console.warn(`[placeElementInZone] availableElementsに要素が見つかりません: ${element.word}`)
  }
  // DropZoneのelement設定確認
  console.log(`[placeElementInZone] zoneId=${zoneId} に要素を配置:`, zone.element)
  // Reset zone states
  zone.isActive = false
  zone.isValid = false
  zone.isInvalid = false
}

const removeFromZone = (zoneId) => {
  console.log(`[removeFromZone] 要素を削除: zoneId=${zoneId}`)
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone || !zone.element) {
    console.warn(`[removeFromZone] ゾーンまたは要素が見つかりません: zoneId=${zoneId}`)
    return
  }
  
  console.log(`[removeFromZone] 削除する要素: ${zone.element.word}`)
  
  // Return element to pool
  const element = availableElements.value.find(e => e.id === zone.element.id)
  if (element) {
    element.isUsed = false
    console.log(`[removeFromZone] 要素を使用可能に戻しました: ${element.word}`)
  } else {
    console.warn(`[removeFromZone] プール内に要素が見つかりません: ${zone.element.id}`)
  }
  
  zone.element = null
  playSound('remove')
}

const isValidDrop = (element, zoneId) => {
  if (!currentProblem.value) {
    console.error(`[isValidDrop] No current problem available`)
    return false
  }

  // 🔧 ログを制限してパフォーマンスを改善（無限ループ対策）
  if (Math.random() < 0.05) { // 5%の確率でログ表示
    console.log(`[isValidDrop] Element: ${element.word}, Zone: ${zoneId}`)
  }
  
  // 🔧 COMPREHENSIVE FIX: 全文型パターンの正しいposition情報
  const sentencePatternCorrections = getSentencePatternCorrections()
  
  // 1. 個別文パターンの修正
  const correction = sentencePatternCorrections[currentProblem.value?.target_sentence]
  if (correction && correction[element.word]) {
    const correctedPosition = correction[element.word]
    if (correctedPosition === zoneId) {
      // 修正ログは必要時のみ表示
      return true
    }
  }
  
  // 2. 動的パターン認識修正
  const sentence = currentProblem.value?.target_sentence || ''
  
  // Wh疑問文パターン: "Wh-word + be動詞 + 補語?"
  const whBePattern = /^(What|Who|Where|When|Why|How)\s+(is|are)\s+(.+)\?$/i
  const whBeMatch = sentence.match(whBePattern)
  if (whBeMatch) {
    const [, whWord, beVerb, complement] = whBeMatch
    const corrections = {
      [whWord]: 'subject',
      [beVerb]: 'verb',
      [complement.trim()]: 'object'
    }
    if (corrections[element.word] === zoneId) {
      console.log(`[isValidDrop] 🔧 DYNAMIC WH-BE FIX: "${element.word}" → "${zoneId}" in "${sentence}"`)
      return true
    }
  }
  
  // Do/Does疑問文パターン: "Do/Does + 主語 + 動詞 + 目的語?"
  const doPattern = /^(Do|Does)\s+(\w+)\s+(\w+)\s+(.+)\?$/i
  const doMatch = sentence.match(doPattern)
  if (doMatch) {
    const [, auxiliary, subject, verb, object] = doMatch
    const corrections = {
      [auxiliary]: 'auxiliary',
      [subject]: 'subject', 
      [verb]: 'verb',
      [object.trim()]: 'object'
    }
    if (corrections[element.word] === zoneId) {
      console.log(`[isValidDrop] 🔧 DYNAMIC DO FIX: "${element.word}" → "${zoneId}" in "${sentence}"`)
      return true
    }
  }
  
  // First check: words_poolから直接確認（最優先）
  // これにより、文脈に応じた正しいpositionを使用
  if (currentProblem.value.words_pool && Array.isArray(currentProblem.value.words_pool)) {
    console.log(`[isValidDrop] Checking words_pool (${currentProblem.value.words_pool.length} items)`)
    
    for (let i = 0; i < currentProblem.value.words_pool.length; i++) {
      const poolWord = currentProblem.value.words_pool[i]
      console.log(`[isValidDrop] Pool word ${i}:`, poolWord)
      
      if (poolWord.word && poolWord.word.toLowerCase() === element.word.toLowerCase()) {
        const match = poolWord.position === zoneId
        console.log(`[isValidDrop] ✓ FOUND IN POOL: word=${poolWord.word}, position=${poolWord.position}, zoneId=${zoneId}, match=${match}`)
        console.log(`[isValidDrop] 📝 Context-aware validation: Using problem-specific position for "${poolWord.word}"`)
        // words_poolの情報を最優先とする（文脈に応じたposition）
        return match
      }
    }
    console.log(`[isValidDrop] ✗ NOT FOUND IN POOL`)
  } else {
    console.log(`[isValidDrop] No words_pool or not array`)
  }

  // Second check: availableElementsからposition一致を直接判定
  const found = availableElements.value?.find(e => e.id === element.id)
  if (found) {
    const match = found.position === zoneId
    console.log(`[isValidDrop] ✓ FOUND IN AVAILABLE: word=${found.word}, position=${found.position}, zoneId=${zoneId}, match=${match}`)
    
    // BUG FIX: availableElementsのpositionが間違っている場合、words_poolを再確認
    if (!match && currentProblem.value.words_pool) {
      const poolWordRecheck = currentProblem.value.words_pool.find(w => 
        w.word.toLowerCase() === element.word.toLowerCase()
      )
      if (poolWordRecheck && poolWordRecheck.position === zoneId) {
        console.log(`[isValidDrop] 🔧 BUG FIX: Using words_pool position instead of available element position`)
        return true
      }
    }
    
    return match
  } else {
    console.log(`[isValidDrop] ✗ NOT FOUND IN AVAILABLE ELEMENTS`)
  }
  
  // フォールバック: element.positionとzoneIdの直接比較
  const fallbackMatch = element.position === zoneId
  // デバッグログを削減
  return fallbackMatch
}

const validateSentence = async () => {
  console.log('🔍 [validateSentence] 文の確認開始')
  console.log('🔍 [validateSentence] canValidate:', canValidate.value)
  
  if (!canValidate.value) {
    console.warn('❌ [validateSentence] canValidateがfalseのため終了')
    return
  }
  
  // ドロップゾーンの内容をログ出力
  dropZones.value.forEach((zone) => {
    if (zone.id === 'auxiliary' && !zone.isVisible) return
    console.log(`🔍 [validateSentence] Zone (${zone.id}):`, zone.element?.word || 'empty')
  })
  
  const isCorrect = checkAnswer()
  console.log('🔍 [validateSentence] checkAnswer結果:', isCorrect)
  
  if (isCorrect) {
    console.log('✅ [validateSentence] 正解！次の問題へ')
    // 正解時の処理
    const baseScore = 10
    const comboMultiplier = getComboMultiplier()
    const difficultyBonus = gameState.value.difficultyMultiplier
    
    // Calculate speed bonus (faster completion = more points)
    const timeSpent = gameTime.value - gameState.value.timeRemaining
    const averageTimePerProblem = gameTime.value / gameState.value.targetSentences
    if (timeSpent < averageTimePerProblem * (currentProblemIndex.value + 1)) {
      gameState.value.speedBonus = Math.floor(5 * comboMultiplier)
      showSpeedBonus.value = true
      setTimeout(() => { showSpeedBonus.value = false }, 2000)
    }
    
    // Calculate total score
    const roundScore = Math.floor(baseScore * comboMultiplier * difficultyBonus) + gameState.value.speedBonus
    gameState.value.score += roundScore
    gameState.value.totalScore += roundScore
    
    // Update stats
    gameState.value.streak++
    gameState.value.combo++
    gameState.value.completedSentences++
    gameState.value.correctAttempts++
    gameState.value.totalAttempts++
    
    console.log('✅ [正解] Stats updated:', {
      correctAttempts: gameState.value.correctAttempts,
      totalAttempts: gameState.value.totalAttempts,
      currentAccuracy: gameState.value.totalAttempts > 0 ? Math.round((gameState.value.correctAttempts / gameState.value.totalAttempts) * 100) : 0
    })
    
    // Update best combo
    if (gameState.value.combo > gameState.value.bestCombo) {
      gameState.value.bestCombo = gameState.value.combo
    }
    
    // Check for achievements
    checkAchievements()
    
    // Show combo effect
    if (gameState.value.combo > 1) {
      triggerComboEffect()
    }
    
    // Power-up chance
    if (gameState.value.combo >= 5 && Math.random() < 0.3) {
      activateRandomPowerUp()
    }
    
    // Dynamic difficulty adjustment
    adjustDifficulty()
    
    // ドロップゾーンをクリア
    clearDropZones()
    
    // 次の問題へ
    if (currentProblemIndex.value < problems.value.length - 1) {
      currentProblemIndex.value++
      console.log(`🔍 [validateSentence] 次の問題へ移行: ${currentProblemIndex.value + 1}/${problems.value.length}`)
      await showCurrentProblem()
    } else {
      console.log('🏁 [validateSentence] 全問題完了！')
      endGame()
    }
    
    playSound('correct')
  } else {
    console.log('❌ [validateSentence] 不正解')
    // 不正解時の処理
    gameState.value.streak = 0
    gameState.value.combo = 0
    gameState.value.totalAttempts++
    gameState.value.speedBonus = 0
    
    console.log('❌ [不正解] Stats updated:', {
      correctAttempts: gameState.value.correctAttempts,
      totalAttempts: gameState.value.totalAttempts,
      currentAccuracy: gameState.value.totalAttempts > 0 ? Math.round((gameState.value.correctAttempts / gameState.value.totalAttempts) * 100) : 0
    })
    
    // Shake effect for wrong answer
    showErrorEffect()
    playSound('incorrect')
  }
}

const checkAnswer = () => {
  console.log('🔍 [checkAnswer] 回答チェック開始')
  
  if (!currentProblem.value) {
    console.warn('❌ [checkAnswer] currentProblemがnull')
    return false
  }
  
  console.log('🔍 [checkAnswer] currentProblem:', currentProblem.value)
  
  // 🔧 checkAnswerでも同じ修正ロジックを適用
  const sentence = currentProblem.value?.target_sentence || ''
  const sentencePatternCorrections = getSentencePatternCorrections()
  
  // IDで正しいゾーンを取得
  const auxiliaryZone = dropZones.value.find(z => z.id === 'auxiliary')
  const subjectZone = dropZones.value.find(z => z.id === 'subject')
  const verbZone = dropZones.value.find(z => z.id === 'verb')
  const objectZone = dropZones.value.find(z => z.id === 'object')
  
  const auxiliary = auxiliaryZone?.element
  const subject = subjectZone?.element
  const verb = verbZone?.element
  const object = objectZone?.element
  
  console.log('🔍 [checkAnswer] 配置された要素:')
  console.log('  - Auxiliary:', auxiliary?.word || 'empty')
  console.log('  - Subject:', subject?.word || 'empty')
  console.log('  - Verb:', verb?.word || 'empty')
  console.log('  - Object:', object?.word || 'empty')
  
  // 🔧 修正された期待値を使用
  const correction = sentencePatternCorrections[sentence]
  if (correction) {
    console.log('🔧 [checkAnswer] Using corrected expectations for:', sentence)
    
    // 修正された期待値で直接チェック
    const expectedMappings = correction
    const placedWords = {
      'auxiliary': auxiliary?.word,
      'subject': subject?.word,
      'verb': verb?.word,
      'object': object?.word
    }
    
    console.log('🔧 [checkAnswer] Expected mappings:', expectedMappings)
    console.log('🔧 [checkAnswer] Placed words:', placedWords)
    
    // 全ての期待される単語が正しい位置に配置されているかチェック（柔軟な比較）
    let allCorrect = true
    for (const [word, position] of Object.entries(expectedMappings)) {
      const placedWord = placedWords[position]
      
      // 完全一致チェック
      if (placedWord === word) {
        console.log(`🔧 [checkAnswer] ✓ Perfect match: "${word}" in ${position}`)
        continue
      }
      
      // 柔軟な一致チェック（部分一致・複合語対応）
      let isFlexibleMatch = false
      
      // 1. 配置された単語が期待値を含むかチェック（"happy yesterday" contains "happy"）
      if (placedWord && placedWord.includes(word)) {
        console.log(`🔧 [checkAnswer] ✓ Flexible match: "${placedWord}" contains "${word}" in ${position}`)
        isFlexibleMatch = true
      }
      
      // 2. 期待値が配置された単語を含むかチェック（"a student" contains "student"）
      else if (word && word.includes(placedWord)) {
        console.log(`🔧 [checkAnswer] ✓ Flexible match: "${word}" contains "${placedWord}" in ${position}`)
        isFlexibleMatch = true
      }
      
      // 3. 単語の順序が異なる場合のチェック（"yesterday happy" vs "happy yesterday"）
      else if (placedWord && word) {
        const placedWords_split = placedWord.toLowerCase().split(/\s+/)
        const expectedWords_split = word.toLowerCase().split(/\s+/)
        const hasCommonWords = placedWords_split.some(pw => expectedWords_split.includes(pw))
        
        if (hasCommonWords) {
          console.log(`🔧 [checkAnswer] ✓ Word order flexible match: "${placedWord}" and "${word}" share common words in ${position}`)
          isFlexibleMatch = true
        }
      }
      
      if (!isFlexibleMatch) {
        console.log(`🔧 [checkAnswer] ✗ Mismatch: expected "${word}" in ${position}, but found "${placedWord}"`)
        allCorrect = false
      }
    }
    
    console.log('🔧 [checkAnswer] Corrected result:', allCorrect)
    return allCorrect
  }
  
  // 必要な要素がすべて配置されているかチェック
  const expectedWords = currentProblem.value.words_pool || []
  const hasAuxiliary = expectedWords.some(w => w.position === 'auxiliary')
  const hasObject = expectedWords.some(w => w.position === 'object')
  
  // 必須要素のチェック
  if (!subject || !verb) {
    console.warn('❌ [checkAnswer] 主語または動詞が空です')
    return false
  }
  
  // 助動詞が必要な問題で助動詞が空の場合
  if (hasAuxiliary && !auxiliary) {
    console.warn('❌ [checkAnswer] 助動詞が必要ですが空です')
    return false
  }
  
  // 目的語が必要な問題で目的語が空の場合
  if (hasObject && !object) {
    console.warn('❌ [checkAnswer] 目的語が必要ですが空です')
    return false
  }
  
  console.log('🔍 [checkAnswer] 期待される単語:', expectedWords)
  
  if (expectedWords.length === 0) {
    console.warn('❌ [checkAnswer] words_poolが空です')
    return false
  }
  
  // より柔軟な回答チェック
  const expectedSubject = expectedWords.find(w => w.position === 'subject')
  const expectedVerb = expectedWords.find(w => w.position === 'verb')
  const expectedObject = expectedWords.find(w => w.position === 'object')
  const expectedAuxiliary = expectedWords.find(w => w.position === 'auxiliary')
  
  console.log('🔍 [checkAnswer] 期待される配置:')
  console.log('  - Expected Subject:', expectedSubject?.word || 'not found')
  console.log('  - Expected Verb:', expectedVerb?.word || 'not found')
  console.log('  - Expected Object:', expectedObject?.word || 'not found')
  console.log('  - Expected Auxiliary:', expectedAuxiliary?.word || 'not found')
  
  // パターン1: 助動詞付き4要素文 (Do you like cats?)
  if (expectedAuxiliary && expectedSubject && expectedVerb && expectedObject) {
    if (auxiliary) {
      const isCorrect = (
        auxiliary.word === expectedAuxiliary.word &&
        subject.word === expectedSubject.word &&
        verb.word === expectedVerb.word &&
        object.word === expectedObject.word
      )
      console.log('🔍 [checkAnswer] 4要素結果:', isCorrect)
      return isCorrect
    }
  }
  
  // パターン2: 基本的な3要素チェック (I like cats)
  if (expectedSubject && expectedVerb && expectedObject) {
    const isCorrect = (
      subject.word === expectedSubject.word &&
      verb.word === expectedVerb.word &&
      object.word === expectedObject.word
    )
    
    console.log('🔍 [checkAnswer] 3要素結果:', isCorrect)
    return isCorrect
  }
  
  // パターン3: 2要素の場合（I am happy / She runs）
  if (expectedSubject && expectedVerb && !expectedObject) {
    const isCorrect = (
      subject.word === expectedSubject.word &&
      verb.word === expectedVerb.word
    )
    
    console.log('🔍 [checkAnswer] 2要素結果:', isCorrect)
    return isCorrect
  }
  
  // パターン4: 柔軟なマッチング（position無視）
  const allExpectedWords = expectedWords.map(w => w.word).sort()
  const allPlacedWords = [subject.word, verb.word, object.word].filter(Boolean).sort()
  
  if (allExpectedWords.length === allPlacedWords.length) {
    const isFlexibleMatch = allExpectedWords.every(word => allPlacedWords.includes(word))
    console.log('🔍 [checkAnswer] 柔軟マッチング結果:', isFlexibleMatch)
    if (isFlexibleMatch) return true
  }
  
  console.warn('❌ [checkAnswer] 期待される要素構造が不明')
  return false
}

const showMeaningFeedback = async () => {
  if (!currentProblem.value || !visualElements.value.length) return
  
  try {
    // Find visual element for current sentence
    const sentence = currentProblem.value.target_sentence.toLowerCase()
    const visual = visualElements.value.find(v => 
      sentence.includes(v.keyword.toLowerCase())
    )
    
    if (visual) {
      currentMeaningVisual.value = visual
      showMeaningImage.value = true
      
      // Hide after 3 seconds
      setTimeout(() => {
        showMeaningImage.value = false
      }, 3000)
    }
  } catch (error) {
    console.error('Error showing meaning feedback:', error)
  }
}

const getComboMultiplier = () => {
  if (gameState.value.combo >= 10) return 3.0
  if (gameState.value.combo >= 7) return 2.5
  if (gameState.value.combo >= 5) return 2.0
  if (gameState.value.combo >= 3) return 1.5
  if (gameState.value.combo >= 2) return 1.2
  return 1.0
}

const getComboClass = () => {
  if (gameState.value.combo >= 10) return 'combo-epic'
  if (gameState.value.combo >= 7) return 'combo-legendary'
  if (gameState.value.combo >= 5) return 'combo-super'
  if (gameState.value.combo >= 3) return 'combo-great'
  return 'combo-normal'
}

const getComboMessage = () => {
  if (gameState.value.combo >= 10) return '伝説級！'
  if (gameState.value.combo >= 7) return '素晴らしい！'
  if (gameState.value.combo >= 5) return 'すごい！'
  return ''
}

const clearDropZones = () => {
  dropZones.value.forEach(zone => {
    zone.element = null
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  // Clear kids mode selection
  selectedElementForKids.value = null
  selectedZoneForKids.value = null
}

const showSuccessFeedback = () => {
  particleType.value = 'success'
  showParticles.value = true
}

const showErrorFeedback = () => {
  particleType.value = 'error'
  showParticles.value = true
}

// Enhanced gameplay functions
const checkAchievements = () => {
  achievements.value.forEach(achievement => {
    if (!achievement.unlocked) {
      let shouldUnlock = false
      
      switch (achievement.id) {
        case 'first_correct':
          shouldUnlock = gameState.value.correctAttempts >= 1
          break
        case 'combo_3':
          shouldUnlock = gameState.value.combo >= 3
          break
        case 'combo_5':
          shouldUnlock = gameState.value.combo >= 5
          break
        case 'combo_10':
          shouldUnlock = gameState.value.combo >= 10
          break
        case 'speed_demon':
          shouldUnlock = gameState.value.speedBonus > 0 && gameState.value.combo >= 5
          break
        case 'perfect_round':
          shouldUnlock = gameState.value.completedSentences === gameState.value.targetSentences && 
                        gameState.value.totalAttempts === gameState.value.correctAttempts
          break
        case 'high_score':
          shouldUnlock = gameState.value.score >= 1000
          break
      }
      
      if (shouldUnlock) {
        achievement.unlocked = true
        gameState.value.bonusPoints += achievement.points
        gameState.value.score += achievement.points
        showAchievementPopup(achievement)
      }
    }
  })
}

const showAchievementPopup = (achievement) => {
  currentAchievement.value = achievement
  showAchievement.value = true
  playSound('achievement')
  
  setTimeout(() => {
    showAchievement.value = false
  }, 3000)
}

const activateRandomPowerUp = () => {
  if (gameState.value.powerUpActive) return
  
  const randomPowerUp = powerUps.value[Math.floor(Math.random() * powerUps.value.length)]
  gameState.value.powerUpActive = true
  gameState.value.powerUpType = randomPowerUp.id
  gameState.value.powerUpDuration = randomPowerUp.duration
  
  applyPowerUpEffect(randomPowerUp.effect)
  
  // Power-up timer
  const powerUpTimer = setInterval(() => {
    gameState.value.powerUpDuration--
    if (gameState.value.powerUpDuration <= 0) {
      clearInterval(powerUpTimer)
      gameState.value.powerUpActive = false
      gameState.value.powerUpType = null
      removePowerUpEffect(randomPowerUp.effect)
    }
  }, 1000)
}

const applyPowerUpEffect = (effect) => {
  switch (effect) {
    case 'freeze_time':
      // Timer will be paused
      if (gameTimer) {
        clearInterval(gameTimer)
        gameTimer = null
      }
      break
    case 'double_score':
      gameState.value.difficultyMultiplier *= 2
      break
    case 'show_hints':
      showHint.value = true
      break
  }
}

const removePowerUpEffect = (effect) => {
  switch (effect) {
    case 'freeze_time':
      // Resume timer
      startTimer()
      break
    case 'double_score':
      gameState.value.difficultyMultiplier /= 2
      break
    case 'show_hints':
      // Keep hints visible as they're helpful
      break
  }
}

const getPowerUpIcon = () => {
  const powerUp = powerUps.value.find(p => p.id === gameState.value.powerUpType)
  return powerUp?.icon || '⭐'
}

const getPowerUpName = () => {
  const powerUp = powerUps.value.find(p => p.id === gameState.value.powerUpType)
  return powerUp?.name || 'パワーアップ'
}

const triggerComboEffect = () => {
  showComboEffect.value = true
  setTimeout(() => {
    showComboEffect.value = false
  }, 2000)
}

const showErrorEffect = () => {
  // Add shake effect to game area
  const gameMain = document.querySelector('.game-main')
  if (gameMain) {
    gameMain.classList.add('shake-animation')
    setTimeout(() => {
      gameMain.classList.remove('shake-animation')
    }, 500)
  }
}

const adjustDifficulty = () => {
  // Dynamic difficulty adjustment based on performance
  if (gameState.value.combo >= adaptiveDifficulty.value.adjustmentThreshold) {
    adaptiveDifficulty.value.consecutiveCorrect++
    adaptiveDifficulty.value.consecutiveWrong = 0
    
    if (adaptiveDifficulty.value.consecutiveCorrect >= 5) {
      gameState.value.difficultyMultiplier = Math.min(2.0, gameState.value.difficultyMultiplier + 0.2)
      adaptiveDifficulty.value.consecutiveCorrect = 0
      
      // Show difficulty increase notification
      showDifficultyNotification('increased')
    }
  } else if (gameState.value.combo === 0 && gameState.value.totalAttempts > 0) {
    adaptiveDifficulty.value.consecutiveWrong++
    adaptiveDifficulty.value.consecutiveCorrect = 0
    
    if (adaptiveDifficulty.value.consecutiveWrong >= 3) {
      gameState.value.difficultyMultiplier = Math.max(0.5, gameState.value.difficultyMultiplier - 0.1)
      adaptiveDifficulty.value.consecutiveWrong = 0
      
      // Show difficulty decrease notification
      showDifficultyNotification('decreased')
    }
  }
}

const getDifficultyDisplay = () => {
  const multiplier = gameState.value.difficultyMultiplier
  if (multiplier >= 1.8) return '超級'
  if (multiplier >= 1.5) return '上級'
  if (multiplier >= 1.2) return '中級'
  if (multiplier >= 0.8) return '初級'
  return '入門'
}

const getDifficultyClass = () => {
  const multiplier = gameState.value.difficultyMultiplier
  if (multiplier >= 1.8) return 'difficulty-expert'
  if (multiplier >= 1.5) return 'difficulty-advanced'
  if (multiplier >= 1.2) return 'difficulty-intermediate'
  if (multiplier >= 0.8) return 'difficulty-beginner'
  return 'difficulty-novice'
}

const showDifficultyNotification = (type) => {
  // You can add a notification system here if needed
  console.log(`Difficulty ${type}: ${getDifficultyDisplay()}`)
}

const endGame = () => {
  gameState.value.isPlaying = false
  gameState.value.finished = true
  
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  
  // Calculate accuracy percentage
  if (gameState.value.totalAttempts > 0) {
    gameState.value.accuracy = Math.round((gameState.value.correctAttempts / gameState.value.totalAttempts) * 100)
  } else {
    gameState.value.accuracy = 0
  }
  
  console.log('🎯 [endGame] Final accuracy calculation:', {
    correctAttempts: gameState.value.correctAttempts,
    totalAttempts: gameState.value.totalAttempts,
    accuracy: gameState.value.accuracy
  })
  
  // Calculate stars earned
  const starsEarned = calculateStarsEarned()
  const completionTime = gameTime.value - gameState.value.timeRemaining
  
  // Update grammar store with results
  grammarStore.completeGame(
    planetId.value,
    currentGameId,
    gameState.value.score,
    starsEarned,
    completionTime
  )
  
  // Check if it's a new record
  const planet = grammarStore.getPlanetInfo(planetId.value)
  const game = planet?.games?.find(g => g.id === currentGameId)
  gameState.value.isNewRecord = game && gameState.value.score > (game.bestScore || 0)
  
  playSound('gameEnd')
}

const calculateStarsEarned = () => {
  let stars = 0
  
  const completionRate = (gameState.value.completedSentences / gameState.value.targetSentences) * 100
  
  if (completionRate >= 60) stars++
  if (gameState.value.accuracy >= 80) stars++
  if (completionRate >= 100 && gameState.value.accuracy >= 85) stars++
  
  return stars
}

const resetGame = () => {
  console.log('🔄 resetGame called')
  // Reset all game state properly using .value
  gameState.value.started = false
  gameState.value.isPlaying = false
  gameState.value.finished = false
  gameState.value.score = 0
  gameState.value.streak = 0
  gameState.value.combo = 0
  gameState.value.bestCombo = 0
  gameState.value.timeRemaining = 0
  gameState.value.completedSentences = 0
  gameState.value.accuracy = 0
  gameState.value.totalAttempts = 0
  gameState.value.correctAttempts = 0
  gameState.value.isNewRecord = false
  // Clear states
  clearDropZones()
  currentProblemIndex.value = 0
  currentProblem.value = null
  availableElements.value = []
  problems.value = []
  // Clear timer
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  // Reset problem generator used problems to get fresh problems
  problemGenerator.resetUsedProblems()
  // 最新データで初期化
  problemGenerator.initialize(grammarContent.value, problemSets.value, visualElements.value)
  console.log('✅ resetGame completed, gameState.finished:', gameState.value.finished)
  console.log('🟢 problemSets:', problemSets.value.length, 'grammarContent:', grammarContent.value.length)
}

// 個別問題生成関数
const generateProblem = async () => {
  try {
    console.log('🔄 [generateProblem] 新しい問題を生成中...')
    
    if (!isCSVLoaded.value) {
      console.log('⚠️ [generateProblem] CSV data not loaded, loading first...')
      await loadCSVData()
    }

    const difficulty = DIFFICULTY_SETTINGS[planetId.value] || DIFFICULTY_SETTINGS['4']
    console.log('🎯 [generateProblem] Using difficulty:', difficulty)
    
    // 利用可能な4級問題数を確認
    const available4Problems = problemSets.value.filter(p => p.eiken_level === '4')
    console.log('📊 [generateProblem] Available 4級 problems:', available4Problems.length)
    if (available4Problems.length > 0) {
      console.log('📝 [generateProblem] Sample 4級 problems:', available4Problems.slice(0, 3).map(p => p.target_sentence))
      console.log('📝 [generateProblem] Last 3 grade 4 problems:', available4Problems.slice(-3).map(p => p.target_sentence))
    }
    
    // problemGenerator内の問題数も確認
    console.log('🔍 [generateProblem] problemGenerator内の問題数:')
    console.log('- problemGenerator.problemSets.length:', problemGenerator.problemSets?.length || 0)
    console.log('- problemGenerator.contentData.length:', problemGenerator.contentData?.length || 0)
    console.log('- problemGenerator.isInitialized:', problemGenerator.isInitialized)
    
    // problemGenerator内の4級問題数を確認
    if (problemGenerator.problemSets?.length > 0) {
      const generator4Problems = problemGenerator.problemSets.filter(p => p.eiken_level === '4')
      console.log('🎯 [generateProblem] problemGenerator内の4級問題数:', generator4Problems.length)
      if (generator4Problems.length > 0) {
        console.log('🎯 [generateProblem] problemGenerator内の4級問題サンプル:', generator4Problems.slice(0, 3).map(p => p.target_sentence))
      }
    }

    // 新しい問題を1つ生成
    const newProblem = await problemGenerator.generateProblem({
      level: difficulty.level,
      eiken_level: difficulty.eiken_level,
      planetId: planetId.value,
      excludeUsed: true
    })

    if (!newProblem) {
      console.error('❌ [generateProblem] Failed to generate new problem')
      return
    }

    console.log('✅ [generateProblem] New problem generated:', newProblem.target_sentence)
    console.log('🆔 [generateProblem] Problem details:', {
      problemSetId: newProblem.problemSetId,
      level: newProblem.level,
      eiken_level: newProblem.eiken_level,
      targetSentence: newProblem.targetSentence
    })
    
    // 🚨 同じ問題が繰り返し選ばれる問題をデバッグ
    if (newProblem.problemSetId === 41) {
      console.warn('🚨 [generateProblem] 問題ID 41 が再度選ばれました！')
      console.log('🔍 [generateProblem] problemGenerator の使用済みリスト:', problemGenerator.usedProblemIds)
      console.log('🔍 [generateProblem] problemGenerator の最近使用リスト:', problemGenerator.recentProblemIds)
    }

    // 現在の問題を新しい問題に置き換える
    currentProblem.value = newProblem
    
    // ゲーム状態をリセット（スコアなどは保持）
    resetCurrentProblemState()
    
    // UI状態をリセット
    dropZones.value.forEach(zone => {
      zone.element = null
    })
    draggableElements.value = []
    
    // 新しい問題の要素を生成
    await generateDraggableElements()
    
    console.log('✅ [generateProblem] 新しい問題を生成しました:', newProblem.target_sentence)
    playSound('click')

  } catch (error) {
    console.error('❌ [generateProblem] Error:', error)
  }
}

// 現在の問題状態をリセット（スコアは保持）
const resetCurrentProblemState = () => {
  showFeedback.value = false
  correctAnswer.value = false
  showHint.value = false
  isAnswerChecked.value = false
  validationFeedback.value = ''
  
  // ドロップゾーンの状態をリセット
  dropZones.value.forEach(zone => {
    zone.isHighlighted = false
    zone.element = null
  })
  
  console.log('🔄 [resetCurrentProblemState] Current problem state reset')
}

const goHome = () => {
  try {
    console.log('Navigating to Grammar Galaxy Hub...')
    
    // 第一選択肢: nameでナビゲーション
    router.push({ name: 'grammar-galaxy-hub' })
      .then(() => {
        console.log('Navigation to hub successful')
      })
      .catch((err) => {
        console.warn('Navigation by name failed:', err)
        
        // 第二選択肢: pathでナビゲーション
        router.push('/grammar-galaxy')
          .then(() => {
            console.log('Navigation by path successful')
          })
          .catch((err2) => {
            console.error('Navigation by path also failed:', err2)
            
            // 第三選択肢: 直接 URL 変更
            window.location.href = '/grammar-galaxy'
          })
      })
  } catch (error) {
    console.error('Navigate to hub error:', error)
    // フォールバック: 直接 URL 変更
    window.location.href = '/grammar-galaxy'
  }
}

const resetToLevelSelection = () => {
  try {
    console.log('Resetting to level selection...')
    
    // ゲーム状態をリセット
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }
    
    // レベル選択モーダルに戻るための状態リセット
    gameState.value.started = false
    gameState.value.isPlaying = false
    gameState.value.finished = false
    gameState.value.score = 0
    gameState.value.streak = 0
    gameState.value.combo = 0
    gameState.value.timeRemaining = 0
    gameState.value.completedSentences = 0
    
    // ゲームデータをクリア
    clearDropZones()
    currentProblemIndex.value = 0
    currentProblem.value = null
    availableElements.value = []
    problems.value = []
    
    // 難易度選択もリセットしたい場合はコメントアウトを外す
    // selectedDifficulty.value = ''
    
    console.log('Successfully reset to level selection')
  } catch (error) {
    console.error('Error resetting to level selection:', error)
  }
}

// 別名: 後方互換性のため
const goBackToLevelSelection = resetToLevelSelection

const handleBackButton = () => {
  try {
    console.log('Back button clicked, current game state:', {
      started: gameState.value.started,
      isPlaying: gameState.value.isPlaying,
      finished: gameState.value.finished
    })
    
    if (gameState.value.isPlaying) {
      // ゲーム中の場合は確認ダイアログを表示
      if (confirm('ゲームを終了しますか？進捗は保存されません。')) {
        endGame()
        goHome()
      }
    } else {
      // レベル選択モーダルやゲーム終了後は確認なしで戻る
      console.log('ゲーム中ではないため、直接ホームに戻る')
      goHome()
    }
  } catch (error) {
    console.error('Back button error:', error)
    goHome()
  }
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const playSound = (type) => {
  try {
    console.log(`Playing sound: ${type}`)
    // 簡単な実装：後でAudioManagerと統合予定
  } catch (error) {
    console.warn('Sound play error:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('GrammarColorCodeGame mounted')
  
  // Load grammar store progress
  grammarStore.loadProgress()
  
  // Load CSV data
  await loadCSVData()
  
  // Set default difficulty
  selectDifficulty('eiken5')
})

onUnmounted(() => {
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})

// Watch for route changes
watch(() => route.params.planetId, (newPlanetId) => {
  if (newPlanetId && gameState.value.started) {
    generateProblem()
  }
})

const showHint = ref(false)

const toggleHint = () => {
  showHint.value = !showHint.value
}

// Touch event handlers for iPad drag support
const handleTouchStart = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const touch = event.touches[0]
  const element = event.target.closest('.grammar-element')
  
  if (element) {
    // Find the element data
    const elementId = element.dataset.elementId
    const foundElement = availableElements.value.find(e => e.id === elementId)
    
    if (foundElement && !foundElement.isUsed) {
      draggedElement.value = foundElement
      console.log(`[handleTouchStart] Touch started on element: ${foundElement.word}`)
    }
  }
}

const handleTouchMove = (event, zoneId) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  // Prevent scrolling during drag
  event.preventDefault()
  
  const touch = event.touches[0]
  const zone = dropZones.value.find(z => z.id === zoneId)
  
  if (zone && !zone.element) {
    zone.isActive = true
    zone.isValid = isValidDrop(draggedElement.value, zoneId)
    zone.isInvalid = !zone.isValid
  }
}

const handleTouchEnd = (event, zoneId) => {
  if (gameMode.value !== 'normal') return
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  
  if (zone && draggedElement.value && !zone.element) {
    const valid = isValidDrop(draggedElement.value, zoneId)
    
    if (valid) {
      placeElementInZone(draggedElement.value, zoneId)
      playSound('drop')
      console.log(`[handleTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zoneId}`)
    } else {
      playSound('error')
      showErrorFeedback()
      console.log(`[handleTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zoneId}`)
    }
  }
  
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  draggedElement.value = null
}

// Touch event handlers for grammar elements (iPad support)
const handleElementTouchStart = (event, element) => {
  if (gameMode.value !== 'normal' || element.isUsed) return
  
  draggedElement.value = element
  console.log(`[handleElementTouchStart] Touch started on element: ${element.word}`)
  
  // Highlight valid zones for this element
  dropZones.value.forEach(zone => {
    if (!zone.element) {
      zone.isValid = isValidDrop(element, zone.id)
      zone.isInvalid = !zone.isValid
    }
  })
}

const handleElementTouchMove = (event, element) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  // Prevent scrolling during drag
  event.preventDefault()
  
  const touch = event.touches[0]
  // Find the zone under the touch point
  const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY)
  const zoneElement = elementFromPoint?.closest('.drop-zone')
  
  if (zoneElement) {
    const zoneId = zoneElement.dataset.zoneId || getZoneIdFromElement(zoneElement)
    const zone = dropZones.value.find(z => z.id === zoneId)
    
    if (zone && !zone.element) {
      // Clear previous highlights
      dropZones.value.forEach(z => {
        z.isActive = false
      })
      
      zone.isActive = true
      zone.isValid = isValidDrop(draggedElement.value, zone.id)
      zone.isInvalid = !zone.isValid
    }
  }
}

const handleElementTouchEnd = (event, element) => {
  if (gameMode.value !== 'normal' || !draggedElement.value) return
  
  const touch = event.changedTouches[0]
  const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY)
  const zoneElement = elementFromPoint?.closest('.drop-zone')
  
  if (zoneElement) {
    const zoneId = zoneElement.dataset.zoneId || getZoneIdFromElement(zoneElement)
    const zone = dropZones.value.find(z => z.id === zoneId)
    
    if (zone && !zone.element) {
      const valid = isValidDrop(draggedElement.value, zone.id)
      
      if (valid) {
        placeElementInZone(draggedElement.value, zone.id)
        playSound('drop')
        console.log(`[handleElementTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zone.id}`)
      } else {
        playSound('error')
        showErrorFeedback()
        console.log(`[handleElementTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zone.id}`)
      }
    }
  }
  
  // Reset all drop zone states
  dropZones.value.forEach(zone => {
    zone.isActive = false
    zone.isValid = false
    zone.isInvalid = false
  })
  
  draggedElement.value = null
}

// Helper function to get zone ID from DOM element
const getZoneIdFromElement = (element) => {
  // First try to get from data attribute
  if (element.dataset.zoneId) {
    return element.dataset.zoneId
  }
  
  // Fallback: Extract zone ID from class names
  const classList = Array.from(element.classList)
  for (const className of classList) {
    if (className.includes('subject')) return 'subject'
    if (className.includes('verb')) return 'verb'
    if (className.includes('object')) return 'object'
  }
  return null
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Galaxy-themed components - unified */
.galaxy-text-primary {
  background: linear-gradient(45deg, 
    #60A5FA 0%, 
    #A78BFA 25%, 
    #F472B6 50%, 
    #FBBF24 75%, 
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.8) 50%, 
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.3) 0%, 
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  color: white;
  padding: 0.5rem 1rem;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: scan-line 2s linear infinite;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.5) 0%, 
    rgba(0, 242, 254, 0.5) 100%);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(0, 242, 254, 0.2) 100%);
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px currentColor);
  animation: pulsing-glow 2s ease-in-out infinite alternate;
}

@keyframes pulsing-glow {
  0% { filter: drop-shadow(0 0 5px currentColor); }
  100% { filter: drop-shadow(0 0 15px currentColor); }
}

@keyframes scan-line {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* CSS Custom Properties for Space Theme */
:root {
  --space-void: linear-gradient(135deg, 
    #0f0f23 0%, 
    #1a1a3e 25%, 
    #2d1b69 50%, 
    #1e1e3f 75%, 
    #0f0f23 100%);
}

/* Galaxy stats - unified */
.galaxy-stats {
  @apply flex items-center space-x-6;
}

.game-header {
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(10px);
}

.game-text-primary {
  color: #FBBF24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.game-button {
  @apply font-medium rounded-lg px-4 py-2 transition-all duration-200;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-button-secondary {
  background: rgba(71, 85, 105, 0.7);
  color: #E5E7EB;
}

.game-button-secondary:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.9);
  transform: translateY(-1px);
}

.game-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.game-stats {
  @apply flex items-center space-x-6;
}

.stat-item {
  @apply text-center;
}

.stat-label {
  @apply block text-xs text-gray-400 mb-1;
}

.stat-value {
  @apply block text-lg font-bold text-yellow-400;
}

/* Difficulty Indicator */
.difficulty-indicator {
  @apply px-2 py-1 rounded text-xs font-bold transition-all;
}

.difficulty-novice {
  @apply bg-green-600 text-green-100;
}

.difficulty-beginner {
  @apply bg-blue-600 text-blue-100;
}

.difficulty-intermediate {
  @apply bg-yellow-600 text-yellow-100;
}

.difficulty-advanced {
  @apply bg-orange-600 text-orange-100;
}

.difficulty-expert {
  @apply bg-red-600 text-red-100;
}

/* Loading and Error States */
.loading-overlay, .error-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50;
}

.loading-content, .error-content {
  @apply bg-slate-800 rounded-2xl p-8 text-center max-w-md;
  color: #E5E7EB;
  border: 2px solid rgba(99, 102, 241, 0.3);
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4;
}

.loading-spinner-small {
  @apply w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto;
}

.loading-text {
  @apply text-gray-300;
}

.retry-button {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors;
}

/* Instructions Modal */
.instructions-overlay {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4;
}

.instructions-modal {
  @apply rounded-3xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 2px solid rgba(79, 172, 254, 0.4);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 50px rgba(79, 172, 254, 0.3);
  color: #E5E7EB;
}

/* Compact Color Rules - Galaxy Style */
.color-rule-card-compact {
  @apply flex items-center gap-2 p-3 rounded-lg border-2 transition-all backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8));
  border-color: rgba(59, 130, 246, 0.4);
  min-width: 140px;
}

.color-rule-card-compact.blue-family {
  border-color: rgba(74, 144, 226, 0.6);
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(59, 130, 246, 0.1));
}

.color-rule-card-compact.red-family {
  border-color: rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.1));
}

.color-rule-card-compact.yellow-family {
  border-color: rgba(251, 191, 36, 0.6);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(252, 211, 77, 0.1));
}

.color-icon-compact {
  @apply text-xl;
}

.color-content-compact {
  @apply flex flex-col;
}

.color-name-compact {
  @apply font-bold text-sm text-white;
}

.color-description-compact {
  @apply text-xs text-gray-300;
}

.color-rule-card {
  @apply p-4 rounded-lg text-center border-2;
}

.blue-family {
  background: rgba(74, 144, 226, 0.1);
  border-color: #4A90E2;
}

.red-family {
  background: rgba(255, 107, 107, 0.1);
  border-color: #FF6B6B;
}

.yellow-family {
  background: rgba(255, 215, 0, 0.1);
  border-color: #FFD700;
}

.color-icon {
  @apply text-3xl mb-2;
}

.color-name {
  @apply font-bold text-lg mb-1;
}

.color-description {
  @apply text-sm text-gray-300;
}

.rules-list-galaxy {
  @apply space-y-2 text-galaxy-moon-silver;
  list-style: none;
  padding-left: 0;
}

.rules-list-galaxy li {
  @apply flex items-start;
}

.rules-list-galaxy li::before {
  content: "→";
  @apply mr-2 text-yellow-400 flex-shrink-0 cosmic-glow;
}

/* Galaxy Difficulty Buttons */
.difficulty-buttons-galaxy {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.difficulty-button-galaxy {
  @apply p-4 rounded-xl border-2 transition-all galaxy-card backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7));
  border-color: rgba(59, 130, 246, 0.4);
}

.difficulty-button-galaxy:hover {
  border-color: rgba(79, 172, 254, 0.8);
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1));
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  transform: translateY(-2px);
}

.difficulty-button-galaxy.selected {
  border-color: #4FACFE;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.2));
  box-shadow: 0 0 25px rgba(79, 172, 254, 0.5);
}

.difficulty-name-galaxy {
  @apply font-bold text-lg mb-1 galaxy-text-primary cosmic-glow;
}

.difficulty-description-galaxy {
  @apply text-sm text-galaxy-moon-silver mb-2 italic;
}

.difficulty-details-galaxy {
  @apply text-sm text-white space-y-1;
}

/* Galaxy Mode Selection */
.mode-buttons-galaxy {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.mode-button-galaxy {
  @apply p-4 rounded-xl border-2 transition-all flex flex-col items-center galaxy-card backdrop-filter backdrop-blur-md;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.7));
  border-color: rgba(59, 130, 246, 0.4);
}

.mode-button-galaxy:hover {
  border-color: rgba(79, 172, 254, 0.8);
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.1));
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  transform: translateY(-2px);
}

.mode-button-galaxy.selected {
  border-color: #4FACFE;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.2));
  box-shadow: 0 0 25px rgba(79, 172, 254, 0.5);
}

.mode-button-galaxy span {
  @apply galaxy-text-primary font-bold;
}

.mode-button-galaxy small {
  @apply text-galaxy-moon-silver text-xs mt-1;
}

.button-controls {
  @apply flex justify-center items-center mt-6;
}

.start-game-button-galaxy {
  @apply py-4 px-8 rounded-xl font-bold text-lg galaxy-button galaxy-button-primary cosmic-glow;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.5), rgba(0, 242, 254, 0.5));
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
  transition: all 0.3s ease;
}

.start-game-button-galaxy:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

.start-game-button-galaxy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Game Main Area */
.game-main {
  @apply py-2;
}

.progress-section {
  @apply bg-slate-800 rounded-lg p-4;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.progress-bar {
  @apply w-full h-4 bg-gray-700 rounded-full overflow-hidden mb-2;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000;
}

.progress-info {
  @apply flex justify-between text-sm text-gray-300;
}

/* Sentence Target */
.sentence-target {
  @apply bg-slate-800 rounded-lg p-4 text-center;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.target-sentence {
  @apply text-xl font-medium text-gray-200 p-4 bg-gray-800 rounded-lg;
}

/* Pattern Information */
.pattern-info {
  @apply bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-3 text-center;
  border: 1px solid rgba(129, 140, 248, 0.5);
}

.pattern-badge {
  @apply flex items-center justify-center gap-2 mb-2;
}

.pattern-icon {
  @apply text-xl;
}

.pattern-name {
  @apply text-sm font-bold text-white;
}

.pattern-example {
  @apply text-xs text-indigo-100 italic;
}

.pattern-hint {
  @apply text-sm text-blue-200 mt-2 p-2 bg-blue-800 rounded;
}

.target-hint {
  @apply mt-2 p-3 bg-gray-800 rounded-lg;
}

.hint-header {
  @apply flex items-center gap-2 text-gray-400;
}

.hint-toggle {
  @apply ml-auto px-2 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600 transition-colors;
}

.hint-toggle.active {
  @apply bg-blue-600 hover:bg-blue-500;
}

.hint-content {
  @apply mt-2 text-gray-300;
}

.hint-text {
  @apply text-gray-300 mb-2;
}

.hint-example {
  @apply text-sm text-gray-400 italic;
}

/* Game Grid */
.game-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-3;
}

/* Drop Zones */
.drop-zones-container {
  @apply flex flex-col space-y-4;
}

.drop-zones {
  @apply flex flex-row space-x-2 w-full justify-center items-center;
}

.drop-zone {
  @apply flex-1 h-20 min-w-[100px] max-w-[200px] mx-1 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center transition-all bg-white cursor-pointer;
}

.drop-zone.kids-mode {
  @apply h-24 min-w-[120px] rounded-xl;
}

.drop-zone.drop-active {
  border-color: #6366F1;
  background: rgba(99, 102, 241, 0.1);
}

.drop-zone.drop-valid {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.1);
}

.drop-zone.drop-invalid {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.drop-placeholder {
  @apply text-center;
}

.drop-label {
  @apply block font-medium text-gray-600 mb-1;
}

.drop-hint {
  @apply block text-xs text-gray-500;
}

.dropped-element {
  @apply w-full h-full flex items-center justify-center;
}

.validate-button {
  @apply flex items-center justify-center space-x-2 w-full py-3 rounded-lg font-medium transition-all;
  background: rgba(71, 85, 105, 0.5);
  color: #9CA3AF;
  border: 2px solid rgba(71, 85, 105, 0.5);
}

.validate-button.kids-mode {
  @apply py-4 text-lg;
}

.validate-button.ready {
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  border-color: #10B981;
}

.validate-button.ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.validate-button:disabled {
  cursor: not-allowed;
}

/* Elements Pool */
.elements-pool {
  @apply bg-slate-800 rounded-lg p-4;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.pool-title {
  @apply text-lg font-bold text-gray-200 mb-4;
}

.debug-elements {
  @apply text-center py-2;
}

.loading-elements {
  @apply text-center py-8;
}

.no-elements-message, .all-used-message {
  @apply text-center py-8;
}

.elements-grid {
  @apply grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2;
}

.elements-grid.kids-mode {
  @apply grid-cols-2 sm:grid-cols-3 gap-3;
}

/* Visual Feedback */
.combo-display {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40;
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full;
  @apply font-bold text-xl shadow-lg;
  animation: comboPopup 2s ease-out forwards;
}

.combo-display.combo-great {
  @apply bg-gradient-to-r from-blue-400 to-purple-500;
  animation: comboGreat 2.5s ease-out forwards;
}

.combo-display.combo-super {
  @apply bg-gradient-to-r from-purple-500 to-pink-500;
  animation: comboSuper 3s ease-out forwards;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.8);
}

.combo-display.combo-legendary {
  @apply bg-gradient-to-r from-pink-500 to-red-500;
  animation: comboLegendary 3.5s ease-out forwards;
  box-shadow: 0 0 40px rgba(236, 72, 153, 0.9);
}

.combo-display.combo-epic {
  @apply bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500;
  animation: comboEpic 4s ease-out forwards;
  box-shadow: 0 0 50px rgba(239, 68, 68, 1);
  background-size: 300% 300%;
}

.combo-text {
  @apply text-center mb-1;
}

.combo-multiplier {
  @apply text-center text-2xl;
}

.combo-special {
  @apply text-center text-sm font-bold mt-1 animate-pulse;
}

/* Achievement Popup */
.achievement-popup {
  @apply fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50;
  @apply bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-2xl;
  animation: achievementPopup 3s ease-out forwards;
  border: 3px solid #FFD700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
}

.achievement-icon {
  @apply text-5xl text-center mb-2;
}

.achievement-title {
  @apply text-xl font-bold text-center mb-2;
}

.achievement-description {
  @apply text-sm text-center text-purple-100 mb-2;
}

.achievement-points {
  @apply text-lg font-bold text-center text-yellow-300;
}

/* Power-up Indicator */
.power-up-indicator {
  @apply fixed top-20 right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-xl shadow-lg z-40;
  animation: powerUpPulse 2s ease-in-out infinite;
}

.power-up-icon {
  @apply text-2xl text-center;
}

.power-up-name {
  @apply text-sm font-bold text-center;
}

.power-up-timer {
  @apply text-xs text-center text-green-100;
}

/* Speed Bonus */
.speed-bonus {
  @apply fixed top-1/4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-40;
  animation: speedBonusSlide 2s ease-out forwards;
}

.speed-bonus-text {
  @apply text-sm font-bold;
}

.speed-bonus-value {
  @apply text-lg font-bold text-center;
}

/* Shake Animation for Errors */
.shake-animation {
  animation: shake 0.5s ease-in-out;
}

/* Enhanced Animations */
@keyframes comboGreat {
  0% {
    transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.3) rotate(10deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
    opacity: 0;
  }
}

@keyframes comboSuper {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 1;
  }
  25% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  85% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0;
  }
}

@keyframes comboLegendary {
  0% {
    transform: translate(-50%, -50%) scale(0.2) rotateY(-180deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.5) rotateY(0deg);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.3) rotateY(15deg);
  }
  85% {
    transform: translate(-50%, -50%) scale(1) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.6) rotateY(0deg);
    opacity: 0;
  }
}

@keyframes comboEpic {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0;
    background-position: 0% 50%;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 1;
  }
  25% {
    transform: translate(-50%, -50%) scale(1.4);
    background-position: 50% 50%;
  }
  85% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    background-position: 100% 50%;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
    background-position: 0% 50%;
  }
}

@keyframes achievementPopup {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
    opacity: 0;
  }
}

@keyframes powerUpPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.9);
  }
}

@keyframes speedBonusSlide {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  20% {
    transform: translateX(0);
    opacity: 1;
  }
  80% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.meaning-display {
  @apply fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40;
  @apply bg-white rounded-xl p-6 shadow-2xl border-2 border-blue-300;
  animation: meaningFadeIn 3s ease-out forwards;
}

.meaning-content {
  @apply text-center;
}

.meaning-icon {
  @apply text-6xl mb-3;
}

.meaning-text {
  @apply text-lg font-medium text-gray-800;
}

/* Animations */
@keyframes comboPopup {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
}

@keyframes meaningFadeIn {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0;
  }
  10% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 1;
  }
  90% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
}

/* Debug Info */
.debug-info {
  @apply fixed bottom-4 left-4 bg-black bg-opacity-75 text-green-400 p-2 rounded text-xs z-50;
}

/* Responsive Design */
@media (max-width: 768px) {
  .instructions-modal {
    @apply p-4;
  }
  
  .game-main {
    @apply py-1;
  }
  
  .max-w-6xl {
    max-width: 100vw;
  }
  
  .game-grid {
    @apply grid-cols-1 gap-2;
  }
  
  .drop-zones {
    @apply flex-col space-x-0 space-y-2;
  }
  
  .drop-zone {
    @apply w-full max-w-full min-w-0 mb-1;
  }
  
  .elements-grid {
    @apply grid-cols-3 gap-1;
  }
  
  .elements-grid.kids-mode {
    @apply grid-cols-2 gap-2;
  }
  
  .game-stats {
    @apply space-x-3;
  }
  
  .stat-value {
    @apply text-base;
  }
  
  .color-rules {
    @apply grid-cols-1;
  }
  
  .difficulty-buttons {
    @apply grid-cols-1;
  }
  
  .mode-buttons {
    @apply grid-cols-1;
  }
}

@media (max-width: 640px) {
  .instructions-modal {
    @apply p-6;
  }
  
  .elements-pool {
    @apply p-2;
  }
  
  .drop-zone {
    @apply h-16 min-w-[80px];
  }
  
  .drop-zone.kids-mode {
    @apply h-20 min-w-[100px];
  }
  
  .validate-button {
    @apply text-sm py-2;
  }
  
  .validate-button.kids-mode {
    @apply text-base py-3;
  }
  
  .meaning-display {
    @apply p-4;
  }
  
  .meaning-icon {
    @apply text-4xl mb-2;
  }
  
  .meaning-text {
    @apply text-base;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .drop-zone {
    border-width: 3px;
  }
  
  .drop-zone.drop-valid {
    @apply border-green-600 bg-green-600/20;
  }
  
  .drop-zone.drop-invalid {
    @apply border-red-600 bg-red-600/20;
  }
  
  .game-button {
    border-width: 2px;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .instructions-modal {
    @apply bg-gray-900 border-gray-700;
  }
  
  .progress-section,
  .elements-pool,
  .sentence-target {
    @apply bg-gray-900 border-gray-700;
  }
  
  .meaning-display {
    @apply bg-gray-800 text-white border-gray-600;
  }
  
  .meaning-text {
    @apply text-gray-200;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .combo-display,
  .meaning-display,
  .validate-button,
  .start-game-button {
    animation: none !important;
    transition: none !important;
  }
  
  .validate-button.ready:hover,
  .start-game-button:hover:not(:disabled) {
    transform: none !important;
  }
}

/* Focus styles for accessibility */
.drop-zone:focus,
.validate-button:focus,
.difficulty-button:focus,
.mode-button:focus,
.start-game-button:focus {
  outline: 3px solid #FFD700;
  outline-offset: 2px;
}

/* Kids mode specific styles */
.kids-mode .drop-label {
  @apply text-lg font-bold;
}

.kids-mode .drop-hint {
  @apply text-sm;
}

/* Touch-friendly enhancements for iPad */
@media (pointer: coarse) {
  .drop-zone {
    @apply min-h-[100px] p-4;
    touch-action: none;
  }
  
  .elements-grid {
    @apply gap-4;
  }
  
  .grammar-element {
    @apply min-h-[80px] p-4;
    touch-action: manipulation;
  }
  
  .drop-zone.drop-active {
    @apply scale-105;
    border-width: 3px;
  }
  
  .drop-zone.drop-valid {
    @apply bg-green-500/20 border-green-400;
    animation: valid-pulse 1s ease-in-out infinite;
  }
  
  .drop-zone.drop-invalid {
    @apply bg-red-500/20 border-red-400;
    animation: invalid-shake 0.5s ease-in-out;
  }
}

@keyframes valid-pulse {
  0%, 100% { 
    background-color: rgba(34, 197, 94, 0.2);
    border-color: rgb(74, 222, 128);
  }
  50% { 
    background-color: rgba(34, 197, 94, 0.3);
    border-color: rgb(34, 197, 94);
  }
}

@keyframes invalid-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Print styles */
@media print {
  .game-background {
    background: white !important;
    color: black !important;
  }
  
  .instructions-overlay,
  .combo-display,
  .meaning-display,
  .debug-info {
    display: none !important;
  }
  
  .drop-zone {
    @apply border-black bg-white;
  }
}

/* Loading states */
.drop-zone.loading {
  @apply animate-pulse;
}

.elements-grid.loading {
  @apply opacity-50;
}

/* Hover effects */
.difficulty-button:hover,
.mode-button:hover {
  transform: translateY(-1px);
}

.validate-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

/* Custom scrollbar for modal */
.instructions-modal::-webkit-scrollbar {
  width: 8px;
}

.instructions-modal::-webkit-scrollbar-track {
  background: rgba(71, 85, 105, 0.3);
  border-radius: 4px;
}

.instructions-modal::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.6);
  border-radius: 4px;
}

.instructions-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.8);
}
</style>