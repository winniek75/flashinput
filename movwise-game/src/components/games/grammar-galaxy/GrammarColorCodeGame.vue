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
              @click="handleBackButton"
              @touchstart.passive="() => { playSound('click'); }"
              class="galaxy-button galaxy-button-secondary mobile-optimized"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold galaxy-text-primary cosmic-glow">
              🛸 品詞マスター
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
        <h2 class="text-3xl font-bold text-center mb-6 galaxy-text-primary cosmic-glow">🛸 品詞マスター</h2>
        
        <!-- Station Visual -->
        <div class="station-visual mb-6">
          <div class="space-station-core">🛸</div>
          <div class="orbital-modules">
            <div class="floating-module module-blue">🔵</div>
            <div class="floating-module module-red">🔴</div>
            <div class="floating-module module-green">🟢</div>
            <div class="floating-module module-yellow">🟡</div>
          </div>
        </div>
        
        <!-- Color Rules -->
        <div class="color-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">🌈 ステーションモジュール色分け</h3>
          <div class="flex flex-wrap justify-center gap-3">
            <div class="color-rule-card-compact blue-family">
              <div class="color-icon-compact">🔵</div>
              <div class="color-content-compact">
                <div class="color-name-compact">青モジュール</div>
                <div class="color-description-compact">Be動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact red-family">
              <div class="color-icon-compact">🔴</div>
              <div class="color-content-compact">
                <div class="color-name-compact">赤モジュール</div>
                <div class="color-description-compact">一般動詞系</div>
              </div>
            </div>
            <div class="color-rule-card-compact yellow-family">
              <div class="color-icon-compact">🟡</div>
              <div class="color-content-compact">
                <div class="color-name-compact">黄モジュール</div>
                <div class="color-description-compact">疑問詞系</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Rules -->
        <div class="game-rules mb-6">
          <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">🚀 ステーション建設ミッション</h3>
          <ol class="rules-list-galaxy">
            <li>色分けされたモジュールをドッキングベイに配置しよう</li>
            <li>正しい文法構造でステーションを完成させよう</li>
            <li>完成したステーションはエネルギーを生成！</li>
            <li>制限時間内に最強のギャラクシーステーションを建設しよう</li>
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
              @touchstart.passive="() => { playSound('click'); }"
              class="difficulty-button-galaxy mobile-optimized"
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
              @touchstart.passive="() => { playSound('click'); }"
              class="mode-button-galaxy mobile-optimized"
              :class="{ 'selected': gameMode === 'normal' }"
            >
              <CursorArrowRaysIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>通常モード</span>
              <small>ドラッグ&ドロップ</small>
            </button>
            <button 
              @click="gameMode = 'kids'"
              @touchstart.passive="() => { playSound('click'); }"
              class="mode-button-galaxy mobile-optimized"
              :class="{ 'selected': gameMode === 'kids' }"
            >
              <HandRaisedIcon class="w-6 h-6 mb-2 cosmic-glow" />
              <span>かんたんモード</span>
              <small>クリックのみ（推奨）</small>
            </button>
          </div>
        </div>

        <div class="button-controls">
          <button
            @click="handleModalBackButton"
            @touchstart.passive="() => { playSound('click'); }"
            class="galaxy-button galaxy-button-secondary mr-4 mobile-optimized"
          >
            戻る
          </button>


          <button
            @click="handleStartGame"
            @touchstart.passive="() => { playSound('click') }"
            class="start-game-button-galaxy mobile-optimized"
            :disabled="isLoading || !csvDataLoaded"
            style="background: green; color: white; padding: 20px; font-size: 20px; pointer-events: auto; position: relative; z-index: 100;"
          >
            ゲーム開始 ({{ selectedDifficulty || '未選択' }} / データ: {{ csvDataLoaded ? 'OK' : 'Loading...' }})
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; z-index: 9999; font-size: 12px;">
      DEBUG: started={{ gameState.started }}, isLoading={{ isLoading }}, hasError={{ hasError }}
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
              @touchstart.passive="() => { if (canValidate) playSound('click'); }"
              class="validate-button mobile-optimized"
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
              <!-- Enhanced Debug info -->
              <div class="debug-elements-info" style="position: absolute; top: -90px; left: 0; font-size: 12px; color: #666; background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; z-index: 10; border: 1px solid #ccc;">
                <div>Elements: {{ availableElements.length }}, Available: {{ availableElements.filter(el => !el.isUsed).length }}</div>
                <div>Game Started: {{ gameState.started }}, Playing: {{ gameState.isPlaying }}</div>
                <div>Game Mode: {{ gameMode }}, CSV Loaded: {{ csvDataLoaded }}</div>
                <button @click="() => console.log('🧪 TEST BUTTON CLICKED - Handler works!')" style="margin-top: 4px; padding: 2px 6px; background: red; color: white; border: none; border-radius: 2px; cursor: pointer;">
                  Test Click
                </button>
              </div>
              <GrammarElement
                v-for="element in availableElements"
                :key="element.id"
                :element="element"
                :is-draggable="!element.isUsed"
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

  </div>
</template>

<script setup>
import logger from '@/utils/logger'

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
import { problemGenerator } from './shared/problemGenerator.js'
import { getSentencePatternCorrections, additionalProblems } from '@/data/grammarPatterns.js'

const router = useRouter()
const route = useRoute()
const grammarStore = useGrammarGalaxyStore()

// Debug and development flags
const showDebugInfo = ref(false)

// Simplified data loading state management
const loadingState = ref({
  isLoading: true,
  elementsLoading: false,
  csvDataLoaded: false,
  hasError: false,
  errorMessage: '',
  loadingStage: 'initializing' // initializing, loadingCSV, loadingElements, ready, error
})

// Computed properties for backward compatibility and easier access
const isLoading = computed(() => loadingState.value.isLoading)
const hasError = computed(() => loadingState.value.hasError)
const errorMessage = computed(() => loadingState.value.errorMessage)
const csvDataLoaded = computed(() => loadingState.value.csvDataLoaded)

// Game mode - default to 'kids' on mobile for better touch experience
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768
}
const gameMode = ref(isMobileDevice() ? 'kids' : 'normal') // 'normal' or 'kids'

// Utility function for shuffling arrays
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
const selectedDifficulty = ref('eiken5')
const planetId = computed(() => route.params.planetId || 'beVerb')
const currentGameId = 'grammarColorCode'

// 初期難易度を設定（eiken5がデフォルト）
const initializeDifficulty = () => {
  const defaultDifficulty = difficultyLevels.find(d => d.id === 'eiken5')
  if (defaultDifficulty) {
    gameTime.value = defaultDifficulty.timeLimit
    gameState.value.targetSentences = defaultDifficulty.targetSentences
    logger.log('📋 初期難易度設定:', defaultDifficulty)
  }
}

// Element selection for kids mode
const selectedElementForKids = ref(null)
const selectedZoneForKids = ref(null)

// Difficulty levels with Eiken support
const difficultyLevels = [
  {
    id: 'eiken5',
    name: '英検5級レベル',
    timeLimit: 240,
    targetSentences: 10,
    level: 'beginner',
    eiken_level: '5',
    description: 'be動詞・一般動詞の基本'
  },
  {
    id: 'eiken4', 
    name: '英検4級レベル',
    timeLimit: 300,
    targetSentences: 10,
    level: 'intermediate',
    eiken_level: '4',
    description: '疑問文・過去形・複文'
  },
  {
    id: 'eiken3',
    name: '英検3級レベル',
    timeLimit: 360,
    targetSentences: 10,
    level: 'advanced',
    eiken_level: '3',
    description: '助動詞・完了形・複雑文'
  },
  {
    id: 'challenge',
    name: 'チャレンジモード',
    timeLimit: 480,
    targetSentences: 10,
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
const particleType = ref('sparkles')
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

// Timer management with comprehensive cleanup
let gameTimer = null
let powerUpTimer = null
let loadTimeout = null
const activeTimeouts = new Set()
const activeIntervals = new Set()
const gameTime = ref(60)

// Enhanced timer management functions
const createSafeTimeout = (callback, delay) => {
  const timeoutId = setTimeout(() => {
    activeTimeouts.delete(timeoutId)
    callback()
  }, delay)
  activeTimeouts.add(timeoutId)
  return timeoutId
}

const createSafeInterval = (callback, delay) => {
  const intervalId = setInterval(callback, delay)
  activeIntervals.add(intervalId)
  return intervalId
}

const clearSafeTimeout = (timeoutId) => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    activeTimeouts.delete(timeoutId)
  }
}

const clearSafeInterval = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId)
    activeIntervals.delete(intervalId)
  }
}

const cleanupAllTimers = () => {
  // Clear game timer
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }

  // Clear power up timer
  if (powerUpTimer) {
    clearInterval(powerUpTimer)
    powerUpTimer = null
  }

  // Clear load timeout
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }

  // Clear all active timeouts
  activeTimeouts.forEach(timeoutId => {
    clearTimeout(timeoutId)
  })
  activeTimeouts.clear()

  // Clear all active intervals
  activeIntervals.forEach(intervalId => {
    clearInterval(intervalId)
  })
  activeIntervals.clear()
}

// Computed properties
const timeProgress = computed(() => {
  return (gameState.value.timeRemaining / gameTime.value) * 100
})

const canValidate = computed(() => {
  if (!currentProblem.value?.target_sentence) {
    logger.log('🔍 [canValidate] No target_sentence')
    return false
  }

  // 新しい動的ゾーン構造での検証
  if (!dropZones.value || dropZones.value.length === 0) {
    logger.log('🔍 [canValidate] No drop zones')
    return false
  }

  // すべてのゾーンに要素が配置されているかチェック
  const allZonesFilled = dropZones.value.every(zone => zone.element !== null)

  logger.log('🔍 [canValidate] New validation check:', {
    totalZones: dropZones.value.length,
    filledZones: dropZones.value.filter(z => z.element !== null).length,
    allFilled: allZonesFilled,
    zones: dropZones.value.map(z => ({
      id: z.id,
      label: z.label,
      filled: !!z.element,
      expectedWord: z.expectedWord
    }))
  })

  return allZonesFilled
})

// Grammar patterns imported from external file for performance optimization

// Data loading methods - optimized for fast initialization
// Additional problems imported from external file for better performance

// Timer functions with enhanced cleanup and memory management
const startTimer = () => {
  // Clear any existing timer first
  if (gameTimer) {
    clearSafeInterval(gameTimer);
  }

  // Create new timer with safe management
  gameTimer = createSafeInterval(() => {
    if (gameState.value.timeRemaining > 0) {
      gameState.value.timeRemaining--;
    } else {
      endGame();
    }
  }, 1000);
};

const updateProgressBar = () => {
  // Progress bar is now handled by timeProgress computed property
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const stopTimer = () => {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
};

const resetTimer = (newTimeLimit = 240) => {
  stopTimer();
  gameTime.value = newTimeLimit;
  gameState.value.timeRemaining = newTimeLimit;
};

const loadCSVData = async () => {
  try {
    logger.log('📊 [loadCSVData] 最小限の初期化開始')

    // Skip heavy CSV loading - use external data instead
    grammarContent.value = []
    problemSets.value = additionalProblems // Use lightweight external data

    // Minimal setup - no heavy loading
    visualElements.value = []

    // Update loading state
    loadingState.value.csvDataLoaded = true
    loadingState.value.loadingStage = 'ready'

    // Skip problem generator initialization for fast loading
    logger.log('✅ [loadCSVData] 最小限の初期化完了:', problemSets.value.length, '問')

  } catch (error) {
    logger.error('❌ [loadCSVData] CSV読み込みエラー:', error)
    logger.error('❌ [loadCSVData] エラースタック:', error.stack)

    // Update unified error state
    loadingState.value.hasError = true
    loadingState.value.errorMessage = `データの読み込みに失敗: ${error.message || error}`
    loadingState.value.loadingStage = 'error'

    // エラー時でもフォールバックデータで続行可能にする
    logger.log('⚠️ [loadCSVData] フォールバックデータを使用')
    loadingState.value.csvDataLoaded = true // エラー時でもtrueに設定してゲーム開始を可能にする

    // デバッグ用：詳細なエラー情報をコンソールに出力
    console.error('🚨 CSV Data Loading Error Details:', {
      error: error,
      stack: error.stack,
      message: error.message,
      csvDataLoaded: csvDataLoaded.value,
      grammarContent: grammarContent.value,
      problemSets: problemSets.value,
      visualElements: visualElements.value
    })
  } finally {
    logger.log(`📊 [loadCSVData] 処理完了 - csvDataLoaded: ${csvDataLoaded.value}, selectedDifficulty: ${selectedDifficulty.value}`)

    // Finalize loading state
    loadingState.value.isLoading = false
    if (loadingState.value.loadingStage !== 'error') {
      loadingState.value.loadingStage = 'ready'
    }
  }
}

const retryLoading = () => {
  loadCSVData()
}
// Game methods
const selectDifficulty = (difficultyId) => {
  logger.log('🎯 selectDifficulty呼び出し:', difficultyId)
  selectedDifficulty.value = difficultyId
  const difficulty = difficultyLevels.find(d => d.id === difficultyId)

  if (!difficulty) {
    logger.error('❌ 難易度設定が見つかりません:', difficultyId)
    return
  }

  gameTime.value = difficulty.timeLimit
  gameState.value.targetSentences = difficulty.targetSentences

  logger.log(`✅ 難易度設定完了:`, {
    name: difficulty.name,
    eiken: difficulty.eiken_level,
    timeLimit: difficulty.timeLimit,
    targetSentences: difficulty.targetSentences,
    gameStateTargetSentences: gameState.value.targetSentences
  })
}

// ゲーム開始ボタンのハンドラー
const handleStartGame = async () => {
  console.log('🚀 [handleStartGame] BUTTON CLICKED! Starting game...')
  logger.log('🚀 [handleStartGame] ゲーム開始ボタンがクリックされました')

  // Enhanced debugging
  console.log('📊 [handleStartGame] 詳細な現在の状態:')
  console.log('  - csvDataLoaded:', csvDataLoaded.value)
  console.log('  - selectedDifficulty:', selectedDifficulty.value)
  console.log('  - problemGenerator.isInitialized:', problemGenerator?.isInitialized)
  console.log('  - problemGenerator.problemSets?.length:', problemGenerator?.problemSets?.length || 0)
  console.log('  - isLoading:', isLoading.value)
  console.log('  - gameState.started:', gameState.value.started)
  console.log('  - loadingState:', loadingState.value)

  logger.log('📊 [handleStartGame] 現在の状態:', {
    csvDataLoaded: csvDataLoaded.value,
    selectedDifficulty: selectedDifficulty.value,
    isInitialized: problemGenerator?.isInitialized,
    problemSets: problemGenerator?.problemSets?.length || 0,
    isLoading: isLoading.value,
    gameStarted: gameState.value.started,
    loadingState: loadingState.value
  })

  // Pre-start validation

  // 基本的な検証
  if (!csvDataLoaded.value) {
    // CSV not loaded
    alert('データが読み込まれていません。ページをリロードしてください。')
    return
  }

  if (!selectedDifficulty.value) {
    // No difficulty selected
    alert('難易度を選択してください。')
    return
  }

  if (!problemGenerator.isInitialized) {
    // Problem generator not initialized
    alert('問題生成器の初期化に失敗しています。ページをリロードしてください。')
    return
  }

  if (problemGenerator.problemSets?.length === 0) {
    // Problem sets empty
    alert('問題データが見つかりません。ページをリロードしてください。')
    return
  }

  // Pre-validation passed

  try {
    // Calling startGame

    await startGame()
    // Game started successfully
  } catch (error) {
    console.error('❌ ゲーム開始エラー:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      currentState: {
        csvDataLoaded: csvDataLoaded.value,
        selectedDifficulty: selectedDifficulty.value,
        problems: problems.value?.length || 0,
        currentProblem: currentProblem.value,
        gameStarted: gameState.value.started
      }
    })
    alert(`ゲーム開始エラー: ${error.message || error}`)
  }
}

const startGame = async () => {
  console.log('🎮 [startGame] MINIMAL START - No heavy processing')

  try {
    // Clear any error state
    hasError.value = false
    errorMessage.value = ''

    // Set basic game state
    gameState.value.started = true
    gameState.value.isPlaying = true
    gameState.value.timeRemaining = 240
    gameState.value.score = 0
    gameState.value.level = 1
    gameState.value.streak = 0
    gameState.value.combo = 0

    // Create minimal hardcoded problem
    const simpleProblem = {
      target_sentence: 'I like apples',
      hint_ja: '私はりんごが好きです',
      level: 'beginner',
      elements: [
        { id: 'el-1', word: 'I', position: 'subject', type: 'pronoun', isUsed: false, isSelected: false },
        { id: 'el-2', word: 'like', position: 'verb', type: 'verb', isUsed: false, isSelected: false },
        { id: 'el-3', word: 'apples', position: 'object', type: 'noun', isUsed: false, isSelected: false }
      ]
    }

    // Set problem data
    problems.value = [simpleProblem]
    currentProblem.value = simpleProblem
    currentProblemIndex.value = 0
    totalProblems.value = 1

    // Set available elements
    availableElements.value = [...simpleProblem.elements]

    // Create basic drop zones
    dropZones.value = [
      { id: 'zone-subject', expectedType: 'subject', element: null, isCorrect: false },
      { id: 'zone-verb', expectedType: 'verb', element: null, isCorrect: false },
      { id: 'zone-object', expectedType: 'object', element: null, isCorrect: false }
    ]

    console.log('✅ [startGame] Minimal setup complete:', {
      started: gameState.value.started,
      problem: currentProblem.value.target_sentence,
      elements: availableElements.value.length,
      dropZones: dropZones.value.length
    })

    // Start basic timer
    startTimer()

  } catch (error) {
    console.error('❌ [startGame] Error:', error)
    gameState.value.started = false
    gameState.value.isPlaying = false
    hasError.value = true
    errorMessage.value = 'ゲーム開始に失敗しました'
  }
}

// Note: All utility functions and game methods are already defined above in the proper locations

const showCurrentProblem = async () => {
  try {
    logger.log('🔍 [showCurrentProblem] 問題表示開始')
    elementsLoading.value = true
    
    const problem = problems.value[currentProblemIndex.value]
    logger.log('🔍 [showCurrentProblem] Problem:', problem)
    
    if (!problem) {
      logger.error('❌ [showCurrentProblem] 問題が見つかりません')
      return
    }
    
    // 問題構造を統一
    currentProblem.value = {
      target_sentence: problem.target_sentence || problem.targetSentence,
      hint_ja: problem.hint_ja || problem.hintJapanese,
      words_pool: problem.words_pool || problem.elements?.filter(el => el.isCorrect) || []
    }
    
    logger.log('🔍 [showCurrentProblem] currentProblem設定完了:', currentProblem.value)
    
    // ドロップゾーンをクリア（要素の配置状態のみ）
    clearDropZones()
    
    // Check if auxiliary zone is needed
    const hasAuxiliary = currentProblem.value.words_pool?.some(w => w.position === 'auxiliary')
    const auxiliaryZone = dropZones.value.find(z => z.id === 'auxiliary')
    if (auxiliaryZone) {
      auxiliaryZone.isVisible = hasAuxiliary
      logger.log('🔍 [showCurrentProblem] Auxiliary zone visibility:', hasAuxiliary)
      logger.log('🔍 [showCurrentProblem] Auxiliary zone words:', currentProblem.value.words_pool?.filter(w => w.position === 'auxiliary'))
    }
    
    // availableElements を words_pool から生成
    console.log('🔧 Setting up availableElements from words_pool:', currentProblem.value.words_pool)
    availableElements.value = currentProblem.value.words_pool?.map((element, index) => ({
      id: `element-${currentProblemIndex.value}-${index}`,
      word: element.word,
      position: element.position,
      type: element.type || 'word',
      isUsed: false,
      isCorrect: true
    })) || []
    console.log('🔧 Created availableElements:', availableElements.value)
    
    logger.log('🔍 [showCurrentProblem] availableElements設定完了:', availableElements.value.length)
    logger.log('🔍 [showCurrentProblem] words_pool positions:', currentProblem.value.words_pool?.map(w => ({ word: w.word, position: w.position })))
    
  } catch (error) {
    logger.error('❌ [showCurrentProblem] Error:', error)
    hasError.value = true
    errorMessage.value = '問題の表示に失敗しました'
  } finally {
    elementsLoading.value = false
  }
}

// startTimer function already defined above

// Drag and drop handlers
const handleDragStart = (element) => {
  if (element.isUsed) return
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

const handleDrop = async (event, zoneId) => {
  event.preventDefault()
  logger.log(`[handleDrop] ドロップイベント発火: zoneId=${zoneId}`)

  try {
    // Enhanced validation with error recovery
    const zone = dropZones.value?.find?.(z => z.id === zoneId)
    if (!zone) {
      logger.warn(`[handleDrop] ドロップゾーンが見つかりません: ${zoneId}`)
      showDropError('ドロップゾーンが見つかりませんでした')
      return
    }

    if (zone.element) {
      logger.warn(`[handleDrop] 既に要素が配置されています: zoneId=${zoneId}`)
      showDropError('既に要素が配置されています')
      return
    }

    if (!draggedElement.value) {
      logger.warn('[handleDrop] draggedElementがnullです')
      showDropError('ドラッグ中の要素が見つかりませんでした')
      resetDragState()
      return
    }

    // Validate drop with enhanced error checking
    let valid = false
    try {
      valid = isValidDrop(draggedElement.value, zoneId)
    } catch (validationError) {
      logger.error('[handleDrop] バリデーション中にエラー:', validationError)
      showDropError('ドロップの検証中にエラーが発生しました')
      resetDragState()
      return
    }

    logger.log(`[handleDrop] バリデーション結果: valid=${valid}`)
    logger.log(`[handleDrop] 要素情報:`, {
      word: draggedElement.value.word,
      position: draggedElement.value.position,
      id: draggedElement.value.id,
      type: draggedElement.value.type
    })

    if (!valid) {
      playSound('error')
      showErrorFeedback()
      showDropError('この位置には配置できません')
      logger.error(`[handleDrop] ドロップ失敗: element=${draggedElement.value.word}, zoneId=${zoneId}`)
      resetDragState()
      return
    }

    // Success: place the element with error checking
    try {
      placeElementInZone(draggedElement.value, zoneId)
      playSound('drop')
      logger.log(`[handleDrop] ドロップ成功: element=${draggedElement.value.word}, zoneId=${zoneId}`)
    } catch (placementError) {
      logger.error('[handleDrop] 要素配置中にエラー:', placementError)
      showDropError('要素の配置中にエラーが発生しました')
    }

    // Clear drag state
    resetDragState()

    // Wait for DOM update
    await nextTick()

  } catch (error) {
    logger.error('[handleDrop] 予期しないエラー:', error)
    showDropError('ドロップ処理中にエラーが発生しました')
    resetDragState()
  }
}

// Helper functions for improved error handling
const showDropError = (message) => {
  // Show temporary error message to user
  loadingState.value.hasError = true
  loadingState.value.errorMessage = message

  // Auto-clear error after 3 seconds
  createSafeTimeout(() => {
    if (loadingState.value.errorMessage === message) {
      loadingState.value.hasError = false
      loadingState.value.errorMessage = ''
    }
  }, 3000)
}

const resetDragState = () => {
  draggedElement.value = null

  // Reset all zones safely
  if (Array.isArray(dropZones.value)) {
    dropZones.value.forEach(z => {
      if (z) {
        z.isActive = false
        z.isInvalid = false
        z.isValid = false
      }
    })
  }
}

// Helper function to find the best valid zone for an element
const findBestValidZone = (element) => {
  // Find all available zones that can accept this element
  const availableZones = dropZones.value.filter(zone =>
    !zone.element && isValidDrop(element, zone.id)
  )

  if (availableZones.length === 0) {
    return null
  }

  // Sort by priority:
  // 1. Position order (subject -> verb -> object)
  // 2. Zone id alphabetical order for consistency
  const zonePriority = {
    'subject': 1,
    'verb': 2,
    'auxiliary': 2.5,
    'object': 3,
    'complement': 3.5,
    'adverb': 4
  }

  availableZones.sort((a, b) => {
    const priorityA = zonePriority[a.type] || 999
    const priorityB = zonePriority[b.type] || 999

    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // If same priority, sort by id
    return a.id.localeCompare(b.id)
  })

  return availableZones[0]
}

// Enhanced click handler for both modes
const handleElementClick = (element) => {
  console.log('🖱️ Element clicked:', element)
  console.log('🔍 Element state:', {
    word: element.word,
    isUsed: element.isUsed,
    id: element.id,
    type: element.type,
    position: element.position
  })

  if (element.isUsed) {
    console.log('❌ Element is already used')
    return
  }

  // Auto-place element in the best available zone
  const validZone = findBestValidZone(element)
  console.log('🎯 Valid zone found:', validZone)

  if (validZone) {
    // Place the element
    placeElementInZone(element, validZone.id)

    // Play success sound
    playSound('drop')

    // Show success particle effect
    particleType.value = 'sparkles'
    showParticles.value = true

    // Clear zone highlights
    dropZones.value.forEach(z => {
      z.isValid = false
      z.isInvalid = false
    })

    // Update score for quick placement
    gameState.value.score += 10
    gameState.value.streak++

    // Check if sentence is complete
    const allZonesFilled = dropZones.value.every(zone => zone.element !== null)
    if (allZonesFilled) {
      setTimeout(() => {
        validateSentence()
      }, 500) // Small delay for visual feedback
    }
  } else {
    // If no valid zone found, show error feedback
    playSound('error')
    showErrorFeedback()
  }
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
    logger.warn(`[placeElementInZone] 指定ゾーンが見つかりません: ${zoneId}`)
    return
  }
  // Place element in zone
  zone.element = { ...element }
  // Mark element as used
  const elementInPool = availableElements.value.find(e => e.id === element.id)
  if (elementInPool) {
    elementInPool.isUsed = true
    logger.log(`[placeElementInZone] isUsedフラグをtrueに: ${elementInPool.word}`)
  } else {
    logger.warn(`[placeElementInZone] availableElementsに要素が見つかりません: ${element.word}`)
  }
  // DropZoneのelement設定確認
  logger.log(`[placeElementInZone] zoneId=${zoneId} に要素を配置:`, zone.element)
  // Reset zone states
  zone.isActive = false
  zone.isValid = false
  zone.isInvalid = false
}

const removeFromZone = (zoneId) => {
  logger.log(`[removeFromZone] 要素を削除: zoneId=${zoneId}`)
  
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (!zone || !zone.element) {
    logger.warn(`[removeFromZone] ゾーンまたは要素が見つかりません: zoneId=${zoneId}`)
    return
  }
  
  logger.log(`[removeFromZone] 削除する要素: ${zone.element.word}`)
  
  // Return element to pool
  const element = availableElements.value.find(e => e.id === zone.element.id)
  if (element) {
    element.isUsed = false
    logger.log(`[removeFromZone] 要素を使用可能に戻しました: ${element.word}`)
  } else {
    logger.warn(`[removeFromZone] プール内に要素が見つかりません: ${zone.element.id}`)
  }
  
  zone.element = null
  playSound('remove')
}

const isValidDrop = (element, zoneId) => {
  if (!currentProblem.value) {
    logger.error(`[isValidDrop] No current problem available`)
    return false
  }

  // 新しいゾーン構造での検証
  const zone = dropZones.value.find(z => z.id === zoneId)
  if (zone && zone.expectedWord) {
    // ゾーンに期待される単語と一致するか確認
    const isMatch = element.word === zone.expectedWord ||
                   element.word.toLowerCase() === zone.expectedWord.toLowerCase()

    logger.log(`[isValidDrop] Zone validation: word=${element.word}, expected=${zone.expectedWord}, match=${isMatch}`)

    if (isMatch) {
      return true
    }
  }

  // 🔧 ログを制限してパフォーマンスを改善（無限ループ対策）
  if (Math.random() < 0.05) { // 5%の確率でログ表示
    logger.log(`[isValidDrop] Element: ${element.word}, Zone: ${zoneId}`)
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
      logger.log(`[isValidDrop] 🔧 DYNAMIC WH-BE FIX: "${element.word}" → "${zoneId}" in "${sentence}"`)
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
      logger.log(`[isValidDrop] 🔧 DYNAMIC DO FIX: "${element.word}" → "${zoneId}" in "${sentence}"`)
      return true
    }
  }
  
  // First check: words_poolから直接確認（最優先）
  // これにより、文脈に応じた正しいpositionを使用
  if (currentProblem.value.words_pool && Array.isArray(currentProblem.value.words_pool)) {
    logger.log(`[isValidDrop] Checking words_pool (${currentProblem.value.words_pool.length} items)`)
    
    for (let i = 0; i < currentProblem.value.words_pool.length; i++) {
      const poolWord = currentProblem.value.words_pool[i]
      logger.log(`[isValidDrop] Pool word ${i}:`, poolWord)
      
      if (poolWord.word && poolWord.word.toLowerCase() === element.word.toLowerCase()) {
        const match = poolWord.position === zoneId
        logger.log(`[isValidDrop] ✓ FOUND IN POOL: word=${poolWord.word}, position=${poolWord.position}, zoneId=${zoneId}, match=${match}`)
        logger.log(`[isValidDrop] 📝 Context-aware validation: Using problem-specific position for "${poolWord.word}"`)
        // words_poolの情報を最優先とする（文脈に応じたposition）
        return match
      }
    }
    logger.log(`[isValidDrop] ✗ NOT FOUND IN POOL`)
  } else {
    logger.log(`[isValidDrop] No words_pool or not array`)
  }

  // Position-based check for new zone structure
  const found = availableElements.value?.find(e => e.id === element.id)
  if (found) {
    const match = found.position === zoneId
    logger.log(`[isValidDrop] ✓ FOUND IN AVAILABLE: word=${found.word}, position=${found.position}, zoneId=${zoneId}, match=${match}`)

    return match
  } else {
    logger.log(`[isValidDrop] ✗ NOT FOUND IN AVAILABLE ELEMENTS`)
  }
  
  // フォールバック: element.positionとzoneIdの直接比較
  const fallbackMatch = element.position === zoneId
  // デバッグログを削減
  return fallbackMatch
}

const validateSentence = async () => {
  logger.log('🔍 [validateSentence] 文の確認開始')
  logger.log('🔍 [validateSentence] canValidate:', canValidate.value)
  
  if (!canValidate.value) {
    logger.warn('❌ [validateSentence] canValidateがfalseのため終了')
    return
  }
  
  // ドロップゾーンの内容をログ出力
  dropZones.value.forEach((zone) => {
    if (zone.id === 'auxiliary' && !zone.isVisible) return
    logger.log(`🔍 [validateSentence] Zone (${zone.id}):`, zone.element?.word || 'empty')
  })
  
  const isCorrect = checkAnswer()
  logger.log('🔍 [validateSentence] checkAnswer結果:', isCorrect)
  
  if (isCorrect) {
    logger.log('✅ [validateSentence] 正解！次の問題へ')
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
    
    logger.log('✅ [正解] Stats updated:', {
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
      logger.log(`🔍 [validateSentence] 次の問題へ移行: ${currentProblemIndex.value + 1}/${problems.value.length}`)
      await showCurrentProblem()
    } else {
      logger.log('🏁 [validateSentence] 全問題完了！')
      endGame()
    }
    
    playSound('correct')
  } else {
    logger.log('❌ [validateSentence] 不正解')
    // 不正解時の処理
    gameState.value.streak = 0
    gameState.value.combo = 0
    gameState.value.totalAttempts++
    gameState.value.speedBonus = 0
    
    logger.log('❌ [不正解] Stats updated:', {
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
  logger.log('🔍 [checkAnswer] 回答チェック開始')

  if (!currentProblem.value?.target_sentence) {
    logger.warn('❌ [checkAnswer] currentProblemがnullまたはtarget_sentenceがない')
    return false
  }

  const targetSentence = currentProblem.value.target_sentence
  logger.log('🔍 [checkAnswer] Target sentence:', targetSentence)

  // 新しい動的ゾーン構造での検証
  const placedWords = dropZones.value
    .filter(zone => zone.element !== null)
    .sort((a, b) => a.position - b.position) // ゾーンの位置順にソート
    .map(zone => zone.element.word)

  const placedSentence = placedWords.join(' ')

  logger.log('🔍 [checkAnswer] 配置された要素:', {
    zones: dropZones.value.map(z => ({
      id: z.id,
      position: z.position,
      expectedWord: z.expectedWord,
      placedWord: z.element?.word || 'empty',
      correct: z.element?.word === z.expectedWord
    })),
    placedSentence,
    targetSentence
  })

  // 各ゾーンが期待される単語と一致するかチェック
  const isCorrect = dropZones.value.every(zone => {
    if (zone.element === null) return false
    return zone.element.word === zone.expectedWord ||
           zone.element.word.toLowerCase() === zone.expectedWord.toLowerCase()
  })

  logger.log('🔍 [checkAnswer] Result:', {
    isCorrect,
    placedSentence,
    targetSentence,
    match: placedSentence.toLowerCase() === targetSentence.toLowerCase()
  })

  return isCorrect
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
    logger.error('Error showing meaning feedback:', error)
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
  particleType.value = 'sparkles'
  showParticles.value = true
}

const showErrorFeedback = () => {
  particleType.value = 'lightning'
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
  logger.log(`Difficulty ${type}: ${getDifficultyDisplay()}`)
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
  
  logger.log('🎯 [endGame] Final accuracy calculation:', {
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
  logger.log('🔄 resetGame called')
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
  logger.log('✅ resetGame completed, gameState.finished:', gameState.value.finished)
  logger.log('🟢 problemSets:', problemSets.value.length, 'grammarContent:', grammarContent.value.length)
}

// 個別問題生成関数
const generateProblem = async () => {
  console.log('🔄 [generateProblem] Creating simple problem...')

  try {
    // Use simple predefined problems to avoid heavy processing
    const simpleProblems = [
      {
        target_sentence: 'I like apples',
        hint_ja: '私はりんごが好きです',
        words_pool: [
          { word: 'I', position: 'subject', type: 'pronoun' },
          { word: 'like', position: 'verb', type: 'verb' },
          { word: 'apples', position: 'object', type: 'noun' }
        ]
      },
      {
        target_sentence: 'She has a cat',
        hint_ja: '彼女は猫を飼っています',
        words_pool: [
          { word: 'She', position: 'subject', type: 'pronoun' },
          { word: 'has', position: 'verb', type: 'verb' },
          { word: 'a cat', position: 'object', type: 'noun' }
        ]
      },
      {
        target_sentence: 'We are busy',
        hint_ja: '私たちは忙しいです',
        words_pool: [
          { word: 'We', position: 'subject', type: 'pronoun' },
          { word: 'are', position: 'verb', type: 'verb' },
          { word: 'busy', position: 'object', type: 'adjective' }
        ]
      }
    ]

    // Pick a random simple problem
    const randomIndex = Math.floor(Math.random() * simpleProblems.length)
    const newProblem = simpleProblems[randomIndex]

    // Set the current problem
    currentProblem.value = newProblem

    // Update available elements
    availableElements.value = newProblem.words_pool.map((word, index) => ({
      id: `element-${Date.now()}-${index}`,
      word: word.word,
      position: word.position,
      type: word.type,
      isUsed: false,
      isSelected: false
    }))

    // Reset drop zones
    dropZones.value.forEach(zone => {
      zone.element = null
      zone.isCorrect = false
    })

    console.log('✅ [generateProblem] Problem setup complete:', newProblem.target_sentence)

  } catch (error) {
    console.error('❌ [generateProblem] Error:', error)
  }
}

// ドロップゾーンを動的に生成
const generateDropZonesForProblem = async () => {
  // Enhanced null checking with better error handling
  if (!currentProblem.value) {
    logger.warn('[generateDropZonesForProblem] No current problem available')
    loadingState.value.hasError = true
    loadingState.value.errorMessage = '現在の問題が読み込まれていません。'
    return
  }

  // Wait for DOM to be ready
  await nextTick()

  const sentence = currentProblem.value.target_sentence || currentProblem.value.targetSentence || ''

  if (!sentence || sentence.trim() === '') {
    logger.error('[generateDropZonesForProblem] No valid target_sentence found in problem')
    logger.log('[generateDropZonesForProblem] Problem data:', currentProblem.value)
    loadingState.value.hasError = true
    loadingState.value.errorMessage = '問題の文章が正しく読み込まれませんでした。'
    return
  }

  const words = sentence.split(' ').filter(word => word.trim() !== '')

  if (words.length === 0) {
    logger.error('[generateDropZonesForProblem] No valid words found in sentence')
    loadingState.value.hasError = true
    loadingState.value.errorMessage = '問題の単語が見つかりませんでした。'
    return
  }

  logger.log('[generateDropZonesForProblem] Generating zones for:', sentence)
  logger.log('[generateDropZonesForProblem] Word count:', words.length)

  try {
    // 単語数に応じてドロップゾーンを生成
    dropZones.value = words.map((word, index) => {
      // 各単語の品詞に基づいてラベルを決定
      // Enhanced null checking for availableElements and words_pool
      const element = (availableElements.value?.find?.(el => el.word === word)) ||
                     (currentProblem.value.words_pool?.find?.(el => el.word === word))

    let label = `単語 ${index + 1}`
    let hint = word

    // 品詞に基づくラベル設定
    if (element) {
      switch(element.type) {
        case 'auxiliary':
        case 'aux':
          label = '助動詞'
          hint = 'Do/Does/Can...'
          break
        case 'pronoun':
        case 'subject':
          label = '主語'
          hint = '誰が？何が？'
          break
        case 'verb':
        case 'be-verb':
        case 'general-verb':
          label = '動詞'
          hint = 'どうする？'
          break
        case 'noun':
        case 'object':
          label = '名詞/目的語'
          hint = '何を？'
          break
        case 'adjective':
          label = '形容詞'
          hint = 'どんな？'
          break
        case 'adverb':
          label = '副詞'
          hint = 'どのように？'
          break
        case 'article':
          label = '冠詞'
          hint = 'a/an/the'
          break
        case 'preposition':
          label = '前置詞'
          hint = 'at/in/on...'
          break
        case 'question':
          label = '疑問詞'
          hint = 'What/Where/When...'
          break
        default:
          label = `単語 ${index + 1}`
          hint = ''
      }
    }

    return {
      id: `zone-${index}`,
      label: label,
      hint: hint,
      element: null,
      isActive: false,
      isValid: false,
      isInvalid: false,
      isVisible: true,
      expectedWord: word, // 正解となる単語を記録
      position: index
    }
  })

  // Clear any previous error state if generation succeeds
  loadingState.value.hasError = false
  loadingState.value.errorMessage = ''

  logger.log('[generateDropZonesForProblem] Generated zones:', dropZones.value)
  } catch (error) {
    logger.error('[generateDropZonesForProblem] Error generating drop zones:', error)
    loadingState.value.hasError = true
    loadingState.value.errorMessage = 'ドロップゾーンの生成中にエラーが発生しました。'
  }
}

// ドラッグ可能な要素を生成
const generateDraggableElements = async () => {
  // Enhanced validation with better error handling
  if (!currentProblem.value) {
    logger.warn('[generateDraggableElements] No current problem available')
    loadingState.value.hasError = true
    loadingState.value.errorMessage = '問題が読み込まれていません。'
    return
  }

  // Wait for DOM to be ready
  await nextTick()

  // Check for words_pool with more robust validation
  const wordsPool = currentProblem.value.words_pool || currentProblem.value.elements || []

  if (!Array.isArray(wordsPool) || wordsPool.length === 0) {
    logger.warn('[generateDraggableElements] No valid words_pool or elements found')
    loadingState.value.hasError = true
    loadingState.value.errorMessage = 'ドラッグ可能な要素が見つかりませんでした。'
    return
  }

  // Position mapping from zone1/zone2/zone3 or numbers to semantic zone IDs
  const positionMapping = {
    'zone1': 'subject',
    'zone2': 'verb',
    'zone3': 'object',
    '1': 'subject',
    '2': 'verb',
    '3': 'object',
    '4': 'object', // 複数の単語が目的語になる場合
    'subject': 'subject',
    'verb': 'verb',
    'object': 'object',
    'auxiliary': 'auxiliary'
  }

  // words_poolから要素を生成
  // 文中での正しい位置を計算
  const sentence = currentProblem.value.target_sentence || ''

  if (!sentence) {
    logger.error('[generateDraggableElements] No target_sentence found in problem')
    return
  }

  const sentenceWords = sentence.replace(/[.,!?]/g, '').split(' ').filter(w => w.trim() !== '')

  availableElements.value = currentProblem.value.words_pool.map((element, index) => {
    // 文中でのこの単語の正しい位置を見つける
    const wordIndex = sentenceWords.findIndex(w =>
      w.toLowerCase() === element.word.toLowerCase() ||
      w.toLowerCase().replace(/[.,!?]/g, '') === element.word.toLowerCase()
    )

    const correctZoneId = wordIndex >= 0 ? `zone-${wordIndex}` : `zone-${index}`

    return {
      id: `element-${Date.now()}-${index}`,
      word: element.word,
      position: correctZoneId,
      type: element.type || 'word',
      isUsed: false,
      isCorrect: true
    }
  })

  logger.log('✅ [generateDraggableElements] Generated elements:', availableElements.value)
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
  
  logger.log('🔄 [resetCurrentProblemState] Current problem state reset')
}

const goHome = () => {
  try {
    logger.log('Navigating to Grammar Galaxy Hub...')
    
    // 第一選択肢: nameでナビゲーション
    router.push('/platforms/grammar-galaxy')
      .then(() => {
        logger.log('Navigation to hub successful')
      })
      .catch((err) => {
        logger.warn('Navigation by name failed:', err)
        
        // 第二選択肢: pathでナビゲーション
        router.push('/platforms/grammar-galaxy')
          .then(() => {
            logger.log('Navigation by path successful')
          })
          .catch((err2) => {
            logger.error('Navigation by path also failed:', err2)
            
            // 第三選択肢: 直接 URL 変更
            window.location.href = '/grammar-galaxy'
          })
      })
  } catch (error) {
    logger.error('Navigate to hub error:', error)
    // フォールバック: 直接 URL 変更
    window.location.href = '/grammar-galaxy'
  }
}

const resetToLevelSelection = () => {
  try {
    logger.log('Resetting to level selection...')
    
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
    
    logger.log('Successfully reset to level selection')
  } catch (error) {
    logger.error('Error resetting to level selection:', error)
  }
}

// 別名: 後方互換性のため
const goBackToLevelSelection = resetToLevelSelection

const handleBackButton = () => {
  try {
    logger.log('Back button clicked, current game state:', {
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
      logger.log('ゲーム中ではないため、直接ホームに戻る')
      goHome()
    }
  } catch (error) {
    logger.error('Back button error:', error)
    goHome()
  }
}

// モーダル内の戻るボタン専用ハンドラー
const handleModalBackButton = () => {
  try {
    logger.log('Modal back button clicked - navigating to home')
    goHome()
  } catch (err) {
    logger.error('Error in modal back button:', err)
    // フォールバック
    window.location.href = '/grammar-galaxy'
  }
}

// formatTime function already defined above

const playSound = (type) => {
  try {
    logger.log(`Playing sound: ${type}`)
    // 簡単な実装：後でAudioManagerと統合予定
  } catch (error) {
    logger.warn('Sound play error:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 GrammarColorCodeGame mounted - Fast initialization')

  try {
    // Fast initialization - essential setup only
    logger.log('🎯 [onMounted] 高速初期化開始 - 最小限の設定')

    // Set default difficulty immediately
    selectDifficulty('eiken5')

    // Mark as ready for basic functionality
    loadingState.value.isLoading = false
    loadingState.value.csvDataLoaded = true
    loadingState.value.loadingStage = 'ready'

    logger.log('✅ [onMounted] 高速初期化完了 - ゲーム開始可能')

    // No heavy background initialization - skip everything for performance

  } catch (error) {
    logger.error('❌ [onMounted] 高速初期化エラー:', error)
    // Still allow the game to start
    loadingState.value.hasError = false
    loadingState.value.isLoading = false
    loadingState.value.csvDataLoaded = true
    loadingState.value.loadingStage = 'ready'
  }
})

onUnmounted(() => {
  logger.log('🧹 [onUnmounted] コンポーネントのクリーンアップを開始')

  // Clean up all timers and intervals
  cleanupAllTimers()

  // Reset game state
  gameState.value.started = false
  gameState.value.isPlaying = false

  // Clear reactive references
  currentProblem.value = null
  draggedElement.value = null

  // Reset loading state
  loadingState.value = {
    isLoading: false,
    elementsLoading: false,
    csvDataLoaded: false,
    hasError: false,
    errorMessage: '',
    loadingStage: 'initializing'
  }

  logger.log('✅ [onUnmounted] クリーンアップ完了')
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
      logger.log(`[handleTouchStart] Touch started on element: ${foundElement.word}`)
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
      logger.log(`[handleTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zoneId}`)
    } else {
      playSound('error')
      showErrorFeedback()
      logger.log(`[handleTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zoneId}`)
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
  logger.log(`[handleElementTouchStart] Touch started on element: ${element.word}`)
  
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
        logger.log(`[handleElementTouchEnd] Touch drop successful: ${draggedElement.value.word} in ${zone.id}`)
      } else {
        playSound('error')
        showErrorFeedback()
        logger.log(`[handleElementTouchEnd] Touch drop failed: ${draggedElement.value.word} not valid for ${zone.id}`)
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

/* Station Visual Styles */
.station-visual {
  @apply relative h-32 flex items-center justify-center;
}

.space-station-core {
  @apply text-6xl animate-pulse;
  animation: stationRotate 10s linear infinite;
}

.orbital-modules {
  @apply absolute inset-0 flex items-center justify-center;
}

.floating-module {
  @apply absolute text-2xl;
  animation: moduleOrbit 8s ease-in-out infinite;
}

.module-blue {
  @apply top-4 left-1/2 transform -translate-x-1/2;
  animation-delay: 0s;
}

.module-red {
  @apply bottom-4 right-1/4;
  animation-delay: 2s;
}

.module-green {
  @apply top-1/2 right-4 transform -translate-y-1/2;
  animation-delay: 4s;
}

.module-yellow {
  @apply bottom-4 left-1/4;
  animation-delay: 6s;
}

@keyframes stationRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes moduleOrbit {
  0%, 100% { 
    transform: scale(1) rotate(0deg);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
}

/* Mobile Optimization */
.mobile-optimized {
  @apply touch-manipulation;
  min-height: 44px;
  min-width: 44px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.mobile-optimized:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Touch-friendly button styles */
@media (max-width: 768px) {
  .galaxy-button,
  .start-game-button-galaxy,
  .validate-button {
    @apply px-6 py-4 text-lg;
    min-height: 48px;
    touch-action: manipulation;
  }
  
  .button-controls {
    @apply flex flex-col gap-4 w-full;
  }
  
  .button-controls button {
    @apply w-full;
  }
  
  .instructions-modal {
    @apply mx-2 max-h-[90vh] overflow-y-auto;
  }
  
  .station-visual {
    @apply h-24;
  }
  
  .space-station-core {
    @apply text-4xl;
  }
  
  .floating-module {
    @apply text-lg;
  }
}

/* iOS Safari specific fixes */
@supports (-webkit-touch-callout: none) {
  .mobile-optimized {
    -webkit-appearance: none;
    border-radius: 8px;
  }
}
</style>