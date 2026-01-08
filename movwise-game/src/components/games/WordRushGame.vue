<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- 宇宙背景レイヤー -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- 浮遊する宇宙パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in backgroundParticles"
        :key="particle.id"
        class="absolute bg-galaxy-star rounded-full cosmic-glow"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animation: `cosmic-float ${particle.duration}s ease-in-out infinite`,
          animationDelay: `${particle.delay}s`
        }"
      />
    </div>

    <!-- 宇宙ゲームヘッダー -->
    <header class="relative z-10 bg-galaxy-void/90 backdrop-blur-md shadow-2xl border-b border-galaxy-primary/20">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button 
              @click="goToHome"
              class="galaxy-button galaxy-button-primary flex items-center gap-2 px-4 py-2"
              title="銀河本部に帰還"
            >
              🌌
            </button>
            <button 
              @click="handleBack"
              class="galaxy-button galaxy-button-secondary flex items-center gap-2 px-4 py-2"
            >
              <ArrowLeft class="w-5 h-5" />
              帰還
            </button>
          </div>
          
          <div class="text-center">
            <h1 class="text-3xl font-bold galaxy-text-primary cosmic-title">
              ⚡ ワード・ラッシュ・アリーナ ⚡
            </h1>
            <p class="text-galaxy-moon-silver">高速語彙戦闘ステーション</p>
          </div>

          <button 
            @click="showSettings = true"
            class="galaxy-button galaxy-button-accent px-4 py-2"
          >
            <Settings class="w-5 h-5" />
          </button>
        </div>

        <!-- 宇宙戦闘ステータス -->
        <div v-if="gameState === 'playing'" class="flex items-center justify-center gap-4 mt-4 flex-wrap">
          <div class="galaxy-stats-card cosmic-glow">
            <Clock class="w-5 h-5 text-galaxy-primary" />
            <span class="font-bold text-lg text-galaxy-star">{{ timeLeft }}s</span>
          </div>
          
          <div class="galaxy-stats-card cosmic-glow">
            <Flame class="w-5 h-5 text-galaxy-accent" />
            <span class="font-bold text-lg text-galaxy-star">{{ streak }}連鎖</span>
          </div>
          
          <div class="galaxy-stats-card cosmic-glow">
            <Star class="w-5 h-5 text-yellow-400" />
            <span class="font-bold text-lg text-galaxy-star">{{ score.toLocaleString() }}</span>
          </div>
          
          <div class="galaxy-stats-card cosmic-glow">
            <Target class="w-5 h-5 text-galaxy-secondary" />
            <span class="font-bold text-lg text-galaxy-star">{{ currentQuestion + 1 }}/{{ QUESTIONS_PER_ROUND }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="relative z-10 container mx-auto px-4 py-8">
      <!-- 戦闘準備画面 -->
      <div v-if="gameState === 'start'" class="max-w-2xl mx-auto">
        <div class="galaxy-card galaxy-card-primary p-8 text-center cosmic-glow">
          <div class="text-6xl mb-6 cosmic-pulse">⚡</div>
          <h2 class="text-3xl font-bold galaxy-text-primary mb-4 cosmic-title">語彙戦闘アリーナに突入！</h2>
          <p class="text-galaxy-moon-silver mb-6 leading-relaxed">
            60秒間で10問の語彙戦闘に挑戦します。宇宙画像、音声信号、データベース定義から正しい英単語を選択せよ。
            連続正解で宇宙エネルギー連鎖ボーナス獲得！
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="galaxy-card galaxy-card-secondary p-4 cosmic-glow">
              <div class="text-3xl mb-2">🖼️</div>
              <div class="font-bold galaxy-text-primary">画像スキャン</div>
              <div class="text-sm text-galaxy-moon-silver">宇宙画像を解析して単語を選択</div>
            </div>
            <div class="galaxy-card galaxy-card-accent p-4 cosmic-glow">
              <div class="text-3xl mb-2">🔊</div>
              <div class="font-bold galaxy-text-primary">音声解読</div>
              <div class="text-sm text-galaxy-moon-silver">宇宙信号を聞いて単語を特定</div>
            </div>
            <div class="galaxy-card galaxy-card-warning p-4 cosmic-glow">
              <div class="text-3xl mb-2">📝</div>
              <div class="font-bold galaxy-text-primary">データ解析</div>
              <div class="text-sm text-galaxy-moon-silver">銀河データベース定義から単語を特定</div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="galaxy-card galaxy-card-secondary p-4 flex items-center justify-between">
              <span class="text-galaxy-star">戦闘難易度:</span>
              <select 
                v-model="difficultyLevel" 
                class="galaxy-select px-3 py-1 font-bold"
              >
                <option value="beginner">初級パイロット (200語)</option>
                <option value="intermediate">中級戦士 (300語)</option>
                <option value="advanced">上級司令官 (200語)</option>
              </select>
            </div>
            <div class="galaxy-card galaxy-card-secondary p-4 flex items-center justify-between">
              <span class="text-galaxy-star">戦闘領域:</span>
              <select v-model="selectedCategory" class="galaxy-select px-3 py-1 font-bold">
                <option value="" disabled>戦闘領域を選択</option>
                <option v-for="cat in categories" :key="cat.key" :value="cat.key">{{ cat.name }}</option>
              </select>
            </div>
            <div v-if="subLevels.length > 0" class="galaxy-card galaxy-card-secondary p-4 flex items-center justify-between">
              <span class="text-galaxy-star">戦闘レベル:</span>
              <select v-model="selectedSubLevel" class="galaxy-select px-3 py-1 font-bold">
                <option value="" disabled>戦闘レベルを選択</option>
                <option v-for="sub in subLevels" :key="sub" :value="sub">{{ subLevelLabels[sub] || sub }}</option>
              </select>
            </div>
            <button 
              @click="handleStartGame"
              class="w-full galaxy-button galaxy-button-primary py-4 px-8 font-bold text-xl cosmic-glow"
              :disabled="buttonDisabled"
            >
              <div class="flex items-center justify-center gap-3">
                <Play class="w-6 h-6" />
                戦闘開始
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 戦闘画面 -->
      <div v-if="gameState === 'playing'" class="max-w-4xl mx-auto">
        <div class="galaxy-card galaxy-card-primary p-8 cosmic-glow">
          <!-- 戦闘問題エリア -->
          <div class="text-center mb-8">
            <!-- 画像スキャン問題 -->
            <div v-if="currentQuestionData.type === 'image_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-blue-300 mb-4 cosmic-title" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">🔍 宇宙画像スキャン中...</div>
              <div class="flex justify-center">
                <div class="w-80 h-80 relative">
                  <!-- 実際の画像 -->
                  <img 
                    :src="loadImage(currentQuestionData.image)"
                    :alt="currentQuestionData.japanese || 'vocabulary'"
                    class="w-full h-full object-cover rounded-2xl cosmic-glow galaxy-border absolute inset-0"
                    @error="handleImageError"
                    @load="onImageLoad"
                    :style="{ 
                      zIndex: imageLoadSuccess ? '2' : '0', 
                      opacity: imageLoadSuccess ? '1' : '0',
                      transition: 'opacity 0.3s ease-in-out'
                    }"
                  />
                  
                  <!-- 画像読み込み中のプレースホルダー -->
                  <div 
                    v-if="!imageLoadError && !imageLoadSuccess" 
                    class="absolute inset-0 flex items-center justify-center bg-galaxy-void/80 rounded-2xl galaxy-border"
                    style="z-index: 1;"
                  >
                    <div class="text-4xl cosmic-pulse">🔍</div>
                  </div>
                  
                  <!-- 画像読み込みエラー時のフォールバック -->
                  <div 
                    v-if="imageLoadError" 
                    class="absolute inset-0 flex flex-col items-center justify-center bg-galaxy-void/90 rounded-2xl galaxy-border text-center p-6"
                    style="z-index: 2;"
                  >
                    <div class="text-6xl mb-4 cosmic-pulse">{{ getFallbackEmoji(currentQuestionData.english) }}</div>
                    <div class="text-lg text-white font-bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">{{ currentQuestionData.japanese }}</div>
                    <div class="text-sm text-gray-300 mt-2" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">画像を読み込み中...</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 音声信号問題 -->
            <div v-if="currentQuestionData.type === 'audio_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-green-300 mb-4 cosmic-title" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">📡 宇宙信号を受信中...</div>
              <div class="flex justify-center">
                <button 
                  @click="playAudio"
                  class="w-32 h-32 galaxy-button galaxy-button-accent rounded-full flex items-center justify-center text-4xl cosmic-glow transition-all duration-300 transform hover:scale-110"
                  :class="{ 'cosmic-pulse': isPlaying }"
                >
                  <Volume2 class="w-12 h-12" />
                </button>
              </div>
              <div class="text-galaxy-moon-silver">
                <button 
                  @click="playAudio"
                  class="galaxy-button galaxy-button-secondary px-4 py-2 cosmic-glow"
                >
                  🔊 信号再受信
                </button>
              </div>
            </div>

            <!-- データベース解析問題 -->
            <div v-if="currentQuestionData.type === 'definition_to_word'" class="space-y-6">
              <div class="text-xl font-bold text-cyan-300 mb-4 cosmic-title">💾 銀河データベース解析中...</div>
              <div class="bg-slate-800/90 border-2 border-cyan-400/50 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                <div class="text-3xl font-bold text-white text-center" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                  {{ currentQuestionData.definition }}
                </div>
              </div>
            </div>
          </div>

          <!-- 選択肢 - 可読性改善版 -->
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="(option, index) in currentQuestionData.options"
              :key="index"
              @click="selectAnswer(option, index)"
              :disabled="answerSelected || isInteractionDisabled"
              :class="[
                'p-6 rounded-2xl font-bold text-xl transition-all duration-300 transform border-2',
                answerSelected
                  ? option === currentQuestionData.correct
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-400 shadow-2xl scale-105 animate-pulse'
                    : selectedAnswerIndex === index
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 shadow-2xl scale-105'
                    : 'bg-gray-700 text-gray-300 border-gray-600 opacity-50'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 hover:border-blue-400 hover:shadow-xl hover:scale-105 shadow-lg'
              ]"
              style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8); backdrop-filter: blur(10px);"
            >
              {{ option }}
            </button>
          </div>

          <!-- フィードバック - 可読性改善版 -->
          <div v-if="showFeedback" class="mt-6 text-center">
            <div v-if="isCorrect" class="space-y-2 bg-green-900/50 p-4 rounded-2xl border-2 border-green-400">
              <div class="text-4xl">🎉</div>
              <div class="text-2xl font-bold text-green-200" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">正解！</div>
              <div v-if="streak >= 3" class="text-lg font-bold text-yellow-300" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                🔥 コンボボーナス: +{{ getComboBonus() }}点
              </div>
            </div>
            <div v-else class="space-y-2 bg-red-900/50 p-4 rounded-2xl border-2 border-red-400">
              <div class="text-4xl">😅</div>
              <div class="text-2xl font-bold text-red-200" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">不正解</div>
              <div class="text-xl text-white" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">正解: <span class="font-bold text-yellow-300">{{ currentQuestionData.correct }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 結果画面 -->
      <div v-if="gameState === 'result'" class="max-w-2xl mx-auto">
        <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center">
          <div class="text-6xl mb-6">🏆</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-6">ゲーム完了！</h2>
          
          <div class="space-y-4 mb-8">
            <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-2xl">
              <div class="text-2xl font-bold">{{ finalScore.toLocaleString() }}点</div>
              <div class="text-sm opacity-90">最終スコア</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl">
                <div class="text-2xl font-bold text-green-700">{{ correctAnswers }}</div>
                <div class="text-sm text-gray-600">正解数</div>
              </div>
              <div class="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl">
                <div class="text-2xl font-bold text-blue-700">{{ Math.round((correctAnswers / QUESTIONS_PER_ROUND) * 100) }}%</div>
                <div class="text-sm text-gray-600">正解率</div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl">
              <div class="text-xl font-bold text-purple-700">{{ maxStreak }}連続</div>
              <div class="text-sm text-gray-600">最長連続正解</div>
            </div>

            <!-- パフォーマンス評価 -->
            <div class="bg-gradient-to-br from-pink-100 to-red-100 p-4 rounded-2xl">
              <div class="text-lg font-bold text-pink-700">{{ getPerformanceRating() }}</div>
              <div class="text-sm text-gray-600">{{ getPerformanceMessage() }}</div>
            </div>

            <!-- VR準備度表示 -->
            <div class="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-2xl">
              <div class="flex items-center justify-between mb-2">
                <div class="text-lg font-bold text-indigo-700">VR準備度</div>
                <div class="text-2xl font-bold text-indigo-700">{{ overallVRScore }}%</div>
              </div>
              <div class="text-sm text-gray-600 mb-3">{{ recommendedVRLevel.description }}</div>
              
              <!-- VRモードインジケーター -->
              <div v-if="isVRMode" class="flex items-center gap-2 text-sm text-green-600 font-medium">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                VRモードでプレイ中
              </div>
              <div v-else class="flex items-center gap-2 text-sm text-gray-500">
                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                通常モードでプレイ
              </div>
              
              <!-- VR学習推奨 -->
              <div v-if="overallVRScore >= 40 && !isVRMode" class="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                💡 VR学習体験をお試しください！
              </div>
            </div>
            
            <!-- プレイヤーレベル情報 -->
            <div class="bg-gradient-to-br from-amber-100 to-yellow-100 p-4 rounded-2xl">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-bold text-amber-700">
                    {{ playerProfileStore.profile.title }}
                  </div>
                  <div class="text-sm text-gray-600">
                    レベル {{ playerProfileStore.profile.level }} 
                    ({{ playerProfileStore.totalCrystals }}クリスタル獲得済み)
                  </div>
                </div>
                <div class="text-3xl">{{ playerProfileStore.profile.avatar }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <button 
              @click="wrapClickHandler(restartGame)"
              class="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-2xl font-bold hover:shadow-lg transition-all duration-200 shadow-2xl"
              :disabled="isInteractionDisabled"
            >
              🔄 もう一度プレイ
            </button>
            <button 
              @click="handleBack"
              class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-2xl font-bold transition-colors"
            >
              ハブに戻る
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 設定モーダル -->
    <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">ゲーム設定</h3>
        
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-gray-700 font-bold mb-2">音量</label>
            <input 
              type="range" 
              v-model="audioVolume" 
              min="0" 
              max="1" 
              step="0.1"
              class="w-full"
            >
          </div>
          
          <div>
            <label class="block text-gray-700 font-bold mb-2">難易度</label>
            <select 
              v-model="difficultyLevel" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>
          </div>
        </div>
        
        <button
          @click="showSettings = false"
          class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-xl font-bold transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>

    <!-- VR Academy Integration: Unified Result Screen -->
    <UnifiedResultScreen
      v-if="showUnifiedResult"
      :game-result="vrGameResult"
      :game-name="'ワード・ラッシュ・アリーナ'"
      @explore-vr="handleExploreVR"
      @back-to-menu="handleBackToMenu"
    />

    <!-- VR Academy Integration: VR Scenario Suggestion -->
    <VRScenarioSuggestion
      v-if="showVRSuggestion"
      :player-skills="vrGameResult?.phonemeSkills || []"
      :game-result="vrGameResult"
      @back-to-result="showVRSuggestion = false; showUnifiedResult = true"
      @back-to-menu="handleBackToMenu"
    />
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import vocabularyData from '@/data/vocabulary.json'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { usePlayerProgress } from '@/composables/usePlayerProgress'
import { useProgressStore } from '@/stores/progress'
import { 
  ArrowLeft, Settings, Clock, Flame, Star, Target, 
  Play, Volume2, ChevronRight
} from 'lucide-vue-next'

// === ネイティブ発音システムの導入 ===
import { useGameAudio } from '@/composables/useGameAudio'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database'

// === 観戦モード統合 ===
import { useSpectatorMode } from '@/composables/useSpectatorMode'

// VR Academy Integration
import { useGameStore } from '@/stores/gameStore'
import { useVRDataSync, VRGameResultBuilder } from '@/api/vrDataSync'
import UnifiedResultScreen from '@/components/game/UnifiedResultScreen.vue'
import VRScenarioSuggestion from '@/components/vr/VRScenarioSuggestion.vue'

const router = useRouter()

// === 観戦モード初期化 ===
const spectatorMode = useSpectatorMode('WordRushGame')
const { 
  isInteractionDisabled, 
  isTeacher,
  notifyGameStart, 
  notifyAnswer, 
  notifyScoreUpdate,
  wrapClickHandler 
} = spectatorMode

// === ネイティブ発音システムの初期化 ===
const {
  playWord: playNativeWord,
  playPhoneme: playNativePhoneme,
  speakSentence: speakNativeSentence,
  initializeAudio: initNativeAudio
} = useGameAudio()

// VR対応プレイヤープロフィール
const playerProfileStore = usePlayerProfileStore()
const { trackGameResult, overallVRScore, recommendedVRLevel } = usePlayerProgress()

// Store integrations
const gameStore = useGameStore()
const vrDataSync = useVRDataSync()

// 統合プログレッションシステム
const progressStore = useProgressStore()

// VRモード検出とゲーム追跡
const isVRMode = ref(false)
const gameStartTime = ref(Date.now())

// VR Academy Integration State
const showUnifiedResult = ref(false)
const showVRSuggestion = ref(false)
const gameEndTime = ref(null)
const vocabularySkillsData = ref([])
const mistakesData = ref([])
const vrGameResult = ref(null)
const wordRecognitionData = ref({
  visualRecognition: 0,
  audioProcessing: 0,
  definitionMatching: 0,
  speedAccuracy: 0
})

// ゲーム定数
const GAME_DURATION = 60 // 秒
const QUESTIONS_PER_ROUND = 10

// ゲーム状態
const gameState = ref('start') // 'start', 'playing', 'result'
const timeLeft = ref(GAME_DURATION)
const currentQuestion = ref(0)
const score = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const correctAnswers = ref(0)
const finalScore = ref(0)
const answerSelected = ref(false)
const selectedAnswerIndex = ref(-1)
const showFeedback = ref(false)
const isCorrect = ref(false)
const showSettings = ref(false)
const isPlaying = ref(false)
const imageLoadError = ref(false)
const imageLoadSuccess = ref(false)
const currentQuestionData = ref({})
const backgroundParticles = ref(Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 2,
  size: 2 + Math.random() * 3
})))

// 設定
const difficultyLevel = ref('beginner')
const audioVolume = ref(0.7)
const selectedCategory = ref('')
const selectedSubLevel = ref('')

// 初期化時にデフォルトカテゴリを設定
onMounted(() => {
  logger.log('🔧 WordRushGame マウント処理開始')
  logger.log('📊 vocabularyData.categories:', Object.keys(vocabularyData.categories || {}))
  
  // デフォルトカテゴリを設定
  if (!selectedCategory.value && vocabularyData.categories) {
    const firstCategory = Object.keys(vocabularyData.categories)[0]
    if (firstCategory) {
      selectedCategory.value = firstCategory
      logger.log('✅ デフォルトカテゴリ設定:', firstCategory)
      
      // デフォルトサブレベルを設定
      const levels = vocabularyData.categories[firstCategory]?.levels || {}
      const firstLevel = Object.keys(levels)[0]
      if (firstLevel) {
        selectedSubLevel.value = firstLevel
        logger.log('✅ デフォルトサブレベル設定:', firstLevel)
      }
    }
  }
})

// カテゴリ一覧
const categories = computed(() => {
  if (!vocabularyData || !vocabularyData.categories) {
    logger.warn('⚠️ vocabularyData.categories が見つかりません')
    return []
  }
  return Object.entries(vocabularyData.categories).map(([key, cat]) => ({
    key,
    name: cat.name || key
  }))
})

// サブレベル一覧（カテゴリ選択時に動的取得）
const subLevels = computed(() => {
  if (!selectedCategory.value) return []
  const levels = vocabularyData.categories[selectedCategory.value]?.levels || {}
  return Object.keys(levels)
})

// サブレベルのラベル表示用
const subLevelLabels = {
  grade5: '5級', grade4: '4級', grade3: '3級', pre2: '準2級', grade2: '2級', pre1: '準1級', grade1: '1級',
  beginner: '初級', intermediate: '中級', advanced: '上級'
}

// ボタン無効化条件をデバッグ
const buttonDisabled = computed(() => {
  const interactionDisabled = isInteractionDisabled?.value || false
  
  logger.log('🔍 ボタン状態チェック:', {
    interactionDisabled,
    selectedCategory: selectedCategory.value,
    selectedSubLevel: selectedSubLevel.value,
    subLevelsLength: subLevels.value.length
  })
  
  // 簡略化: 観戦モードでなければボタンは有効
  return interactionDisabled
})

// 難易度→レベルキーのマッピング
const levelKeyMap = {
  'kids': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'eiken': { beginner: 'grade5', intermediate: 'grade3', advanced: 'pre1' },
  'toeic': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'toefl': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  'daily': { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' }
}

// 語彙データベース（旧データ）
const vocabularyDatabase = {
  beginner: [
    {
      english: 'apple',
      japanese: 'りんご',
      image: '/src/assets/images/vocabulary/apple.jpg',
      category: 'food',
      distractors: ['orange', 'banana', 'grape']
    },
    {
      english: 'book',
      japanese: '本',
      image: '/src/assets/images/vocabulary/book.jpg',
      category: 'object',
      distractors: ['pen', 'pencil', 'notebook']
    },
    {
      english: 'cat',
      japanese: '猫',
      image: '/src/assets/images/vocabulary/cat.jpg',
      category: 'animal',
      distractors: ['dog', 'bird', 'fish']
    }
  ],
  intermediate: [
    {
      english: 'computer',
      japanese: 'コンピュータ',
      image: '/src/assets/images/vocabulary/computer.jpg',
      category: 'technology',
      distractors: ['phone', 'tablet', 'camera']
    },
    {
      english: 'garden',
      japanese: '庭',
      image: '/src/assets/images/vocabulary/garden.jpg',
      category: 'place',
      distractors: ['park', 'forest', 'beach']
    }
  ],
  advanced: [
    {
      english: 'architecture',
      japanese: '建築',
      image: '/src/assets/images/vocabulary/architecture.jpg',
      category: 'art',
      distractors: ['design', 'sculpture', 'painting']
    },
    {
      english: 'philosophy',
      japanese: '哲学',
      image: '/src/assets/images/vocabulary/philosophy.jpg',
      category: 'academic',
      distractors: ['psychology', 'sociology', 'anthropology']
    }
  ]
}

// 問題タイプの重み
const questionTypeWeights = {
  'image_to_word': 0.4,
  'audio_to_word': 0.35,
  'definition_to_word': 0.25
}

// 画像キャッシュ
const preloadedImages = new Set()
const imageCache = new Map()

// 画像のプリロード
const preloadImage = (imagePath) => {
  // プリロード機能を一時的に無効化
  logger.log('📋 プリロード処理スキップ:', imagePath)
  return
}

// 次の問題の画像をプリロード
const preloadNextImages = () => {
  const vocabulary = vocabularyDatabase[difficultyLevel.value]
  const nextWords = vocabulary
    .filter(word => word.image)
    .slice(0, 3)
  nextWords.forEach(word => {
    preloadImage(word.image)
  })
}

watch(difficultyLevel, () => {
  preloadNextImages()
})
onMounted(async () => {
  // 観戦モードでゲーム開始を通知
  notifyGameStart()
  
  preloadNextImages()
  
  // ネイティブ発音システムの初期化
  try {
    await initNativeAudio()
    logger.log('WordRushGame: ネイティブ発音システム初期化完了')
  } catch (error) {
    logger.log('WordRushGame: ネイティブ発音システム初期化エラー:', error)
  }
})

// 画像の遅延読み込み - 修正版
const loadImage = (imagePath) => {
  logger.log('🖼️ loadImage called with:', imagePath)
  
  // undefinedやnullの場合はデフォルト画像を返す
  if (!imagePath) {
    logger.log('⚠️ 画像パスがundefined/null - デフォルト画像を使用')
    return '/images/vocabulary/book.jpg'
  }
  
  // 文字列に変換して安全に処理
  const pathStr = String(imagePath)
  
  // /src/assets/images/vocabulary/ から /images/vocabulary/ への変換
  if (pathStr.includes('/src/assets/images/vocabulary/')) {
    const newPath = pathStr.replace('/src/assets/images/vocabulary/', '/images/vocabulary/')
    logger.log('🔄 Path converted:', pathStr, '→', newPath)
    return newPath
  }
  
  // 既に正しいパスの場合はそのまま返す
  if (pathStr.startsWith('/images/vocabulary/')) {
    logger.log('✅ Path already correct:', pathStr)
    return pathStr
  }
  
  // ファイル名のみの場合は完全なパスを構築
  if (!pathStr.includes('/')) {
    const newPath = `/images/vocabulary/${pathStr}`
    logger.log('🔧 Building full path:', pathStr, '→', newPath)
    return newPath
  }
  
  logger.log('➡️ Using original path:', pathStr)
  return pathStr
}

// ランダム問題生成 - 大幅改良版
const generateQuestion = () => {
  imageLoadError.value = false
  imageLoadSuccess.value = false
  
  let vocabulary = []
  
  // 語彙データの取得ロジック
  if (selectedCategory.value && vocabularyData.categories[selectedCategory.value]) {
    const levels = vocabularyData.categories[selectedCategory.value].levels
    let levelKey = ''
    
    if (selectedSubLevel.value && levels[selectedSubLevel.value]) {
      levelKey = selectedSubLevel.value
    } else {
      levelKey = (levelKeyMap[selectedCategory.value] && levelKeyMap[selectedCategory.value][difficultyLevel.value]) || difficultyLevel.value
    }
    
    vocabulary = levels[levelKey] || []
    logger.log(`📚 選択された語彙: ${selectedCategory.value}/${levelKey} - ${vocabulary.length}語`)
  } else {
    vocabulary = vocabularyDatabase[difficultyLevel.value] || []
    logger.log(`📚 旧語彙データベース使用: ${difficultyLevel.value} - ${vocabulary.length}語`)
  }
  
  if (!vocabulary.length) {
    logger.error('❌ 語彙データが見つかりません')
    currentQuestionData.value = {}
    return
  }
  
  // 問題タイプをランダム選択（重み付き）
  const rand = Math.random()
  let questionType
  if (rand < questionTypeWeights.image_to_word) {
    questionType = 'image_to_word'
  } else if (rand < questionTypeWeights.image_to_word + questionTypeWeights.audio_to_word) {
    questionType = 'audio_to_word'
  } else {
    questionType = 'definition_to_word'
  }
  
  let randomWord
  
  // 問題タイプ別の単語選択
  if (questionType === 'image_to_word') {
    // 画像のある単語のみ
    const wordsWithImages = vocabulary.filter(word => word.image)
    if (wordsWithImages.length === 0) {
      logger.log('⚠️ 画像のある単語がありません - definition問題に変更')
      questionType = 'definition_to_word'
      randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    } else {
      randomWord = wordsWithImages[Math.floor(Math.random() * wordsWithImages.length)]
      logger.log('🖼️ 画像問題選択:', randomWord.english)
    }
  } else {
    // 音声・定義問題は全ての単語から選択
    randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
  }
  
  // 選択肢生成の改良
  let options = [randomWord.english]
  
  if (randomWord.distractors && randomWord.distractors.length > 0) {
    // 既存の distractors を使用
    options.push(...randomWord.distractors.slice(0, 3))
  } else {
    // distractors がない場合は同一カテゴリから生成
    const sameCategory = vocabulary.filter(word => 
      word.english !== randomWord.english && 
      (word.category === randomWord.category || !randomWord.category)
    )
    
    // ランダムに3つ選択
    while (options.length < 4 && sameCategory.length > 0) {
      const randomIndex = Math.floor(Math.random() * sameCategory.length)
      const candidate = sameCategory[randomIndex].english
      if (!options.includes(candidate)) {
        options.push(candidate)
      }
      sameCategory.splice(randomIndex, 1) // 選択済みを除去
    }
    
    // それでも足りない場合は全体から
    if (options.length < 4) {
      const remaining = vocabulary.filter(word => !options.includes(word.english))
      while (options.length < 4 && remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        options.push(remaining[randomIndex].english)
        remaining.splice(randomIndex, 1)
      }
    }
  }
  
  // 選択肢をシャッフル
  shuffleArray(options)
  
  // 問題データを設定
  currentQuestionData.value = {
    type: questionType,
    correct: randomWord.english,
    japanese: randomWord.japanese,
    image: randomWord.image,
    definition: randomWord.japanese,
    options: options.slice(0, 4), // 最大4つの選択肢
    word: randomWord
  }
  
  // UI状態リセット
  answerSelected.value = false
  showFeedback.value = false
  selectedAnswerIndex.value = -1
  
  logger.log('✅ 問題生成完了:', {
    type: questionType,
    word: randomWord.english,
    options: options,
    hasImage: !!randomWord.image
  })
}

// 配列シャッフル
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

// 回答選択
const selectAnswer = (answer, index) => {
  logger.log('🎯 解答ボタンがクリックされました:', answer, index)
  logger.log('📊 answerSelected:', answerSelected.value)
  logger.log('📊 isInteractionDisabled:', isInteractionDisabled.value)
  
  if (answerSelected.value) {
    logger.log('⚠️ 既に解答済みのためスキップ')
    return
  }
  
  if (isInteractionDisabled.value) {
    logger.log('⚠️ 観戦モードのため解答をブロック')
    return
  }
  answerSelected.value = true
  selectedAnswerIndex.value = index
  const correct = answer === currentQuestionData.value.correct
  
  // 観戦モード: 回答通知
  notifyAnswer({
    question: currentQuestionData.value.correct,
    selectedAnswer: answer,
    correctAnswer: currentQuestionData.value.correct,
    isCorrect: correct,
    questionIndex: currentQuestion.value
  })
  
  if (correct) {
    isCorrect.value = true
    correctAnswers.value++
    streak.value++
    maxStreak.value = Math.max(maxStreak.value, streak.value)
    
    // VR Academy Integration: スキルデータ記録
    recordVocabularySkill(currentQuestionData.value.correct, true, Date.now() - gameStartTime.value)
    updateWordRecognitionData(currentQuestionData.value.type, true)
    
    // スコア計算
    const basePoints = 100
    const timeBonus = Math.max(0, (timeLeft.value - 50)) * 10
    const comboBonus = getComboBonus()
    const totalPoints = basePoints + timeBonus + comboBonus
    score.value += totalPoints
    
    // 観戦モード: スコア更新通知
    notifyScoreUpdate({
      currentScore: score.value,
      questionScore: totalPoints,
      streak: streak.value,
      correctAnswers: correctAnswers.value
    })
    
    // ネイティブ発音で正解を再生
    setTimeout(() => {
      playNativeWord({
        word: answer,
        type: 'vocabulary_celebration',
        difficulty: difficultyLevel.value
      }).catch(() => {
        // フォールバック無し、正解フィードバックは視覚的のみ
      })
    }, 300)
  } else {
    isCorrect.value = false
    streak.value = 0
    score.value = Math.max(0, score.value - 50) // ペナルティ
    
    // VR Academy Integration: ミス記録
    recordMistake(answer, currentQuestionData.value.correct, Date.now() - gameStartTime.value)
    recordVocabularySkill(currentQuestionData.value.correct, false, Date.now() - gameStartTime.value)
    updateWordRecognitionData(currentQuestionData.value.type, false)
    
    // 間違えた場合は正解をネイティブ発音で再生
    setTimeout(() => {
      playNativeWord({
        word: currentQuestionData.value.correct,
        type: 'vocabulary_correction',
        difficulty: difficultyLevel.value
      }).catch(() => {
        // フォールバック無し
      })
    }, 500)
  }
  showFeedback.value = true
  // 1.5秒後に次の問題
  setTimeout(() => {
    nextQuestion()
  }, 1500)
}

// コンボボーナス計算
const getComboBonus = () => {
  if (streak.value >= 8) return 250 // 5x
  if (streak.value >= 5) return 150 // 3x
  if (streak.value >= 3) return 100 // 2x
  return 0
}

// 次の問題
const nextQuestion = () => {
  currentQuestion.value++
  if (currentQuestion.value >= QUESTIONS_PER_ROUND) {
    endGame()
  } else {
    generateQuestion()
  }
}

// ゲーム終了
const endGame = async () => {
  gameState.value = 'result'
  gameEndTime.value = Date.now()
  finalScore.value = score.value

  // パーフェクトラウンドボーナス
  const isPerfectScore = correctAnswers.value === QUESTIONS_PER_ROUND
  if (isPerfectScore) {
    finalScore.value *= 2
  }
  clearInterval(gameTimer)

  // VR対応プレイヤー進捗追跡
  const timeSpent = Math.round((gameEndTime.value - gameStartTime.value) / 1000)
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100

  // ゲーム結果を統一プレイヤープロフィールに記録
  trackGameResult({
    gameType: 'wordRush',
    score: finalScore.value,
    accuracy: accuracy,
    timeSpent: timeSpent,
    isVRSession: isVRMode.value,
    perfectScore: isPerfectScore
  })

  // 統合プログレッションシステムに記録
  const gameData = {
    gameType: 'word-rush',
    score: finalScore.value,
    accuracy: accuracy,
    timeSpent: timeSpent,
    correctAnswers: correctAnswers.value,
    totalQuestions: QUESTIONS_PER_ROUND,
    correctStreak: maxStreak.value,
    difficulty: difficultyLevel.value,
    levelCompleted: accuracy >= 80
  }

  progressStore.recordGameScore(gameData)

  logger.log('✅ 統合プログレッション記録完了:', {
    score: finalScore.value,
    accuracy: accuracy,
    skillExp: progressStore.calculateExpFromScore(gameData),
    nextRecommendation: progressStore.getRecommendedPath
  })

  // VR Academy Integration: ゲーム完了処理
  await handleGameCompletion(isPerfectScore)

  // VRアカデミー同期（VRモードの場合）
  if (isVRMode.value && playerProfileStore.academyConnectionStatus === 'connected') {
    syncVRSessionData()
  }
}

// ゲーム開始
// デバッグ用のハンドラー関数
const handleStartGame = () => {
  logger.log('🚀 戦闘開始ボタンがクリックされました')
  logger.log('📊 selectedCategory:', selectedCategory.value)
  logger.log('📊 selectedSubLevel:', selectedSubLevel.value)
  logger.log('📊 subLevels:', subLevels.value)
  logger.log('📊 isInteractionDisabled:', isInteractionDisabled.value)
  
  // 観戦モードでなければ直接ゲーム開始
  if (isInteractionDisabled.value) {
    logger.log('⚠️ 観戦モードのためゲーム開始をブロック')
    return
  }
  
  logger.log('🔄 直接startGame実行')
  startGame()
}

const startGame = () => {
  logger.log('🎮 startGame関数が実行されました')
  
  // カテゴリとサブレベルの自動設定
  if (!selectedCategory.value) {
    logger.log('🔄 カテゴリ未選択 - デフォルトカテゴリを設定')
    const firstCategory = Object.keys(vocabularyData.categories || {})[0]
    if (firstCategory) {
      selectedCategory.value = firstCategory
      logger.log('✅ デフォルトカテゴリ設定:', firstCategory)
    }
  }
  
  // サブレベルが必要な場合の自動設定
  if (subLevels.value.length > 0 && !selectedSubLevel.value) {
    const firstSubLevel = subLevels.value[0]
    selectedSubLevel.value = firstSubLevel
    logger.log('✅ デフォルトサブレベル自動設定:', firstSubLevel)
  }
  
  logger.log('✅ 条件チェック成功 - ゲーム開始処理継続')
  
  // VRモード検出
  detectVRMode()
  
  gameState.value = 'playing'
  gameStartTime.value = Date.now()
  
  // VR Academy Integration: ゲーム開始追跡
  vocabularySkillsData.value = []
  mistakesData.value = []
  wordRecognitionData.value = {
    visualRecognition: 0,
    audioProcessing: 0,
    definitionMatching: 0,
    speedAccuracy: 0
  }
  
  resetGameState()
  generateQuestion()
  startTimer()
  
  // ゲーム開始をプレイヤープロフィールに記録
  playerProfileStore.updateLoginStreak()
  
  logger.log('🎯 ゲーム開始処理完了 - gameState:', gameState.value)
}

// ゲーム状態リセット
const resetGameState = () => {
  timeLeft.value = GAME_DURATION
  currentQuestion.value = 0
  score.value = 0
  streak.value = 0
  maxStreak.value = 0
  correctAnswers.value = 0
  answerSelected.value = false
  showFeedback.value = false
}

// タイマー開始
let gameTimer = null
const startTimer = () => {
  gameTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

// ゲーム再開 - 完全修正版
const restartGame = () => {
  logger.log('🔄 restartGame called - current gameState:', gameState.value)
  
  // タイマーをクリア
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
    logger.log('⏰ Timer cleared')
  }
  
  // すべての結果画面を閉じる
  showUnifiedResult.value = false
  showVRSuggestion.value = false
  showSettings.value = false
  
  // ゲーム状態を完全リセット
  resetGameState()
  
  // 追加の状態リセット
  imageLoadError.value = false
  imageLoadSuccess.value = false
  currentQuestionData.value = {}
  vrGameResult.value = null
  gameEndTime.value = null
  
  // スタート画面に戻る（強制的に）
  setTimeout(() => {
    gameState.value = 'start'
    logger.log('✅ Game state reset to start:', gameState.value)
  }, 100)
}

// 戻るボタン
const handleBack = () => {
  if (gameState.value === 'playing') {
    if (confirm('ゲームを中断しますか？進捗は失われます。')) {
      clearInterval(gameTimer)
      router.back()
    }
  } else {
    router.back()
  }
}

const goToHome = () => {
  if (gameState.value === 'playing') {
    if (confirm('ゲームを中断してホーム画面に戻りますか？進捗は失われます。')) {
      clearInterval(gameTimer)
      router.push('/')
    }
  } else {
    router.push('/')
  }
}

// パフォーマンス評価
const getPerformanceRating = () => {
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100
  if (accuracy >= 90) return '🏆 パーフェクト！'
  if (accuracy >= 80) return '🥉 素晴らしい！'
  if (accuracy >= 70) return '🎯 良い調子！'
  if (accuracy >= 60) return '📈 まずまず'
  return '💪 次回頑張ろう！'
}

// VRモード検出
const detectVRMode = () => {
  // WebXR APIでVRディスプレイを検出
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      isVRMode.value = supported
    }).catch(() => {
      isVRMode.value = false
    })
  } else {
    // User Agentベースの検出（フォールバック）
    const vrUserAgents = ['Oculus', 'Quest', 'Vive', 'Daydream', 'Cardboard']
    isVRMode.value = vrUserAgents.some(agent => navigator.userAgent.includes(agent))
  }
  
  // URL パラメータでのVRモード強制設定
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('vr') === 'true') {
    isVRMode.value = true
  }
}

// VRセッションデータ同期
const syncVRSessionData = async () => {
  if (!isVRMode.value) return
  
  try {
    const { uploadVRSession } = await import('@/api/vrAcademySync')
    
    const sessionData = {
      sessionId: `wordRush_${Date.now()}`,
      startTime: new Date(gameStartTime.value).toISOString(),
      endTime: new Date().toISOString(),
      duration: Math.round((Date.now() - gameStartTime.value) / 1000),
      gameType: 'wordRush',
      score: finalScore.value,
      accuracy: (correctAnswers.value / QUESTIONS_PER_ROUND) * 100,
      interactionEvents: [
        {
          type: 'game_completed',
          timestamp: new Date().toISOString(),
          data: {
            questionsAnswered: QUESTIONS_PER_ROUND,
            correctAnswers: correctAnswers.value,
            maxStreak: maxStreak.value,
            category: selectedCategory.value,
            difficulty: difficultyLevel.value
          }
        }
      ]
    }
    
    await uploadVRSession(sessionData)
    logger.log('VR session data synced successfully')
  } catch (error) {
    logger.error('Failed to sync VR session data:', error)
  }
}
const getPerformanceMessage = () => {
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100
  if (accuracy >= 90) return 'あなたは語彙マスターです！'
  if (accuracy >= 80) return '素晴らしい語彙力です！'
  if (accuracy >= 70) return '順調に成長しています！'
  if (accuracy >= 60) return 'もう少しで上達します！'
  return '基礎から復習しましょう！'
}

// 画像読み込み成功
const onImageLoad = (event) => {
  logger.log('✅ 画像読み込み成功:', {
    originalPath: currentQuestionData.value.image,
    actualSrc: event.target?.src,
    naturalWidth: event.target?.naturalWidth,
    naturalHeight: event.target?.naturalHeight
  })
  imageLoadError.value = false
  imageLoadSuccess.value = true
}

// 画像エラーハンドリング
const handleImageError = (event) => {
  imageLoadError.value = true
  logger.error('❌ 画像読み込みエラー:', {
    originalPath: currentQuestionData.value.image,
    actualSrc: event.target.src,
    loadImageResult: loadImage(currentQuestionData.value.image)
  })
}

// フォールバック絵文字の取得 - 拡張版
const getFallbackEmoji = (word) => {
  const emojiMap = {
    'apple': '🍎', 'orange': '🍊', 'banana': '🍌', 'grape': '🍇',
    'book': '📚', 'pen': '🖊️', 'pencil': '✏️', 'notebook': '📓',
    'cat': '🐱', 'dog': '🐶', 'bird': '🐦', 'fish': '🐟',
    'car': '🚗', 'bus': '🚌', 'bike': '🚲', 'train': '🚆',
    'house': '🏠', 'school': '🏫', 'store': '🏪', 'park': '🏞️',
    'computer': '💻', 'phone': '📱', 'tablet': '💻', 'camera': '📷',
    'garden': '🌺', 'forest': '🌲', 'beach': '🏖️',
    'architecture': '🏛️', 'design': '🎨', 'sculpture': '🗿', 'painting': '🖼️',
    'philosophy': '🤔', 'psychology': '🧠', 'sociology': '👥', 'anthropology': '🏺',
    'ball': '⚽', 'bread': '🍞', 'chair': '🪑', 'cold': '🧊', 'drink': '🥤',
    'eat': '🍽️', 'egg': '🥚', 'eye': '👁️', 'father': '👨', 'flower': '🌸',
    'foot': '🦶', 'green': '🟢', 'hand': '✋', 'happy': '😊', 'head': '👤',
    'hot': '🔥', 'jump': '🤸', 'milk': '🥛', 'mother': '👩', 'play': '🎮',
    'run': '🏃', 'sad': '😢', 'sleep': '😴', 'small': '🤏', 'sun': '☀️',
    'tree': '🌳', 'walk': '🚶', 'water': '💧', 'yellow': '🟡'
  }
  
  if (!word) return '❓'
  return emojiMap[word.toLowerCase()] || '❓'
}

// 音声再生 - ネイティブ発音システム統合
const playAudio = async () => {
  if (!currentQuestionData.value.correct) return
  
  isPlaying.value = true
  
  try {
    // ネイティブ発音を優先的に使用
    await playNativeWord({
      word: currentQuestionData.value.correct,
      type: 'vocabulary',
      difficulty: difficultyLevel.value,
      volume: audioVolume.value
    })
  } catch (nativeError) {
    logger.log('ネイティブ発音システムエラー、フォールバック使用:', nativeError)
    
    // フォールバック: 従来のSpeech Synthesis API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestionData.value.correct)
      utterance.lang = 'en-US'
      utterance.volume = audioVolume.value
      utterance.rate = 1.0
      utterance.pitch = 1.0
      
      // 音声の品質を向上させるための設定
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(voice => 
        voice.lang === 'en-US' && 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha')
      )
      
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      
      utterance.onend = () => {
        isPlaying.value = false
      }
      
      speechSynthesis.speak(utterance)
    }
  }
  
  // 再生終了処理
  setTimeout(() => {
    isPlaying.value = false
  }, 2000)
}

// ライフサイクルフック - 観戦モード通知
onMounted(() => {
  notifyGameStart({
    gameName: 'ワード・ラッシュ・アリーナ',
    gameType: 'vocabulary',
    description: '高速語彙習得ゲーム'
  })
})

// VR Academy Integration Functions
const recordVocabularySkill = (word, isSuccess, responseTime) => {
  const existingSkill = vocabularySkillsData.value.find(skill => skill.word === word)
  
  if (existingSkill) {
    existingSkill.attempts++
    if (isSuccess) {
      existingSkill.successes++
    }
    existingSkill.accuracy = (existingSkill.successes / existingSkill.attempts) * 100
    existingSkill.responseTime = (existingSkill.responseTime + responseTime) / 2
  } else {
    vocabularySkillsData.value.push({
      word,
      accuracy: isSuccess ? 100 : 0,
      responseTime,
      attempts: 1,
      successes: isSuccess ? 1 : 0,
      difficulty: getDifficultyLevel(),
      category: selectedCategory.value
    })
  }
}

const recordMistake = (actualAnswer, expectedAnswer, timestamp) => {
  mistakesData.value.push({
    word: actualAnswer,
    expectedResponse: expectedAnswer,
    actualResponse: actualAnswer,
    timestamp,
    context: `${selectedCategory.value} - Word Rush Challenge`,
    questionType: currentQuestionData.value?.type || 'unknown'
  })
}

const updateWordRecognitionData = (questionType, isSuccess) => {
  const improvement = isSuccess ? 2 : -1
  
  switch (questionType) {
    case 'image':
      wordRecognitionData.value.visualRecognition = Math.max(0, 
        Math.min(100, wordRecognitionData.value.visualRecognition + improvement))
      break
    case 'audio':
      wordRecognitionData.value.audioProcessing = Math.max(0, 
        Math.min(100, wordRecognitionData.value.audioProcessing + improvement))
      break
    case 'definition':
      wordRecognitionData.value.definitionMatching = Math.max(0, 
        Math.min(100, wordRecognitionData.value.definitionMatching + improvement))
      break
  }
  
  // Update overall speed accuracy
  const averageImprovement = isSuccess ? 1.5 : -0.5
  wordRecognitionData.value.speedAccuracy = Math.max(0, 
    Math.min(100, wordRecognitionData.value.speedAccuracy + averageImprovement))
}

const getDifficultyLevel = () => {
  if (!selectedSubLevel.value) return 'beginner'
  
  if (selectedSubLevel.value.includes('pre') || selectedSubLevel.value.includes('beginner')) {
    return 'beginner'
  }
  if (selectedSubLevel.value.includes('intermediate')) {
    return 'intermediate'
  }
  return 'advanced'
}

const handleGameCompletion = async (isPerfectScore) => {
  const gameDuration = gameEndTime.value - gameStartTime.value
  const accuracy = (correctAnswers.value / QUESTIONS_PER_ROUND) * 100
  const vrReadinessGain = calculateVRReadinessGain(isPerfectScore, accuracy)
  const crystalReward = calculateCrystalReward(isPerfectScore, accuracy)
  
  // Build VR game result
  const resultBuilder = new VRGameResultBuilder('wordRushGame', 'ワード・ラッシュ・アリーナ')
    .setBasicStats(finalScore.value, accuracy, gameDuration)
    .setVRReadinessGain(vrReadinessGain)
    .setCrystalReward(crystalReward)
  
  // Add vocabulary skills data
  vocabularySkillsData.value.forEach(skill => {
    resultBuilder.addPhonemeSkill(
      skill.word,
      skill.accuracy,
      skill.responseTime,
      skill.attempts,
      skill.successes,
      skill.difficulty
    )
  })
  
  // Add mistakes data
  mistakesData.value.forEach(mistake => {
    resultBuilder.addMistake(
      mistake.word,
      mistake.expectedResponse,
      mistake.actualResponse,
      mistake.timestamp,
      mistake.context
    )
  })
  
  vrGameResult.value = resultBuilder.build()
  
  // Update word recognition data in the result
  vrGameResult.value.sessionData.spatialAudio = {
    spatialAccuracy: wordRecognitionData.value.speedAccuracy,
    depthPerception: wordRecognitionData.value.visualRecognition,
    multiSourceTracking: wordRecognitionData.value.audioProcessing,
    environmentalAdaptation: wordRecognitionData.value.definitionMatching
  }
  
  // Sync with VR Academy
  try {
    await vrDataSync.syncGameResult(vrGameResult.value)
    
    // Update local stores
    playerProfileStore.addCrystals(crystalReward)
    playerProfileStore.updateVRReadiness(vrReadinessGain)
    gameStore.recordGameSession('wordRushGame', {
      score: finalScore.value,
      accuracy: accuracy,
      duration: gameDuration,
      perfectScore: isPerfectScore,
      category: selectedCategory.value
    })
    
    logger.log('✅ WordRushGame VR Academy sync successful')
  } catch (error) {
    logger.error('❌ WordRushGame VR Academy sync failed:', error)
  }
  
  // Show unified result after a short delay
  setTimeout(() => {
    showUnifiedResult.value = true
  }, 2000)
}

const calculateVRReadinessGain = (isPerfectScore, accuracy) => {
  let baseGain = isPerfectScore ? 20 : 12
  
  // Bonus for high accuracy
  if (accuracy > 80) baseGain += 5
  if (accuracy > 90) baseGain += 3
  
  // Bonus for high streak
  if (maxStreak.value > 5) baseGain += 3
  if (maxStreak.value > 8) baseGain += 2
  
  // Category-specific multipliers
  const categoryMultipliers = {
    'kids': 1.0,
    'animals': 1.1,
    'food': 1.2,
    'travel': 1.3,
    'business': 1.4
  }
  
  const multiplier = categoryMultipliers[selectedCategory.value] || 1.0
  return Math.round(baseGain * multiplier)
}

const calculateCrystalReward = (isPerfectScore, accuracy) => {
  let baseCrystals = Math.floor(finalScore.value / 200)
  
  if (isPerfectScore) baseCrystals += 100
  if (accuracy > 85) baseCrystals += 50
  if (maxStreak.value > 5) baseCrystals += 25
  
  return baseCrystals
}

const handleExploreVR = () => {
  showUnifiedResult.value = false
  showVRSuggestion.value = true
}

const handleBackToMenu = () => {
  showUnifiedResult.value = false
  showVRSuggestion.value = false
  gameState.value = 'start'
}
</script>

<style scoped>
/* Galaxy background - unified */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars - unified */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
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

.galaxy-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.galaxy-stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
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

/* 追加の宇宙テーマスタイル */
.cosmic-float {
  animation: cosmic-float 6s ease-in-out infinite;
}

@keyframes cosmic-float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.cosmic-pulse {
  animation: cosmic-pulse 2s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.cosmic-title {
  animation: cosmic-shimmer 3s ease-in-out infinite;
}

@keyframes cosmic-shimmer {
  0%, 100% {
    filter: hue-rotate(0deg);
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
  }
  50% {
    filter: hue-rotate(90deg);
    text-shadow: 0 0 20px rgba(167, 139, 250, 0.7);
  }
}

.galaxy-select {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  color: #94A3B8;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.galaxy-select:focus {
  outline: none;
  border-color: rgba(79, 172, 254, 0.8);
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.3);
}

.galaxy-select option {
  background: rgba(15, 23, 42, 0.95);
  color: #94A3B8;
}

.galaxy-border {
  border-radius: 16px;
  border: 2px solid rgba(79, 172, 254, 0.6);
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.3);
}

.galaxy-card-primary {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(79, 172, 254, 0.6);
}

.galaxy-card-secondary {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.7) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.galaxy-card-accent {
  background: linear-gradient(135deg, 
    rgba(79, 172, 254, 0.2) 0%, 
    rgba(167, 139, 250, 0.2) 100%);
  border: 1px solid rgba(167, 139, 250, 0.4);
}

.galaxy-card-warning {
  background: linear-gradient(135deg, 
    rgba(251, 191, 36, 0.2) 0%, 
    rgba(245, 158, 11, 0.2) 100%);
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.text-galaxy-star {
  color: #F1F5F9;
}

.text-galaxy-primary {
  color: #60A5FA;
}

.text-galaxy-secondary {
  color: #A78BFA;
}

.text-galaxy-accent {
  color: #F472B6;
}

.bg-galaxy-star {
  background-color: #F1F5F9;
}

.galaxy-button-accent {
  background: linear-gradient(135deg, 
    rgba(244, 114, 182, 0.3) 0%, 
    rgba(251, 191, 36, 0.3) 100%);
  border: 2px solid rgba(244, 114, 182, 0.8);
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* ホバーエフェクト */
button:hover {
  transform: translateY(-2px);
}

/* 回答ボタンの特別エフェクト */
.answer-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 正解アニメーション */
@keyframes celebration {
  0% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.05) rotate(-3deg);
  }
  75% {
    transform: scale(1.08) rotate(2deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.celebration {
  animation: celebration 0.6s ease-in-out;
}

/* 不正解シェイク */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}

.shake {
  animation: shake 0.5s ease-in-out;
}

/* タイマー警告 */
.timer-warning {
  animation: pulse 0.5s ease-in-out infinite;
  background: linear-gradient(45deg, #ef4444, #dc2626) !important;
}

/* スコア増加アニメーション */
@keyframes scoreIncrease {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.score-increase {
  animation: scoreIncrease 0.3s ease-out;
}

/* ストリークエフェクト */
@keyframes streakGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
  }
}

.streak-glow {
  animation: streakGlow 1s ease-in-out infinite;
}

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .answer-button {
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  .text-8xl {
    font-size: 4rem;
  }
}

/* ダークモード対応準備 */
@media (prefers-color-scheme: dark) {
  .bg-white\/95 {
    background: rgba(31, 41, 55, 0.95);
  }
  
  .text-gray-800 {
    color: rgb(229, 231, 235);
  }
  
  .text-gray-600 {
    color: rgb(156, 163, 175);
  }
}

/* 画像のフェードインアニメーション */
img {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

img.loaded {
  opacity: 1;
}
</style>

    // 