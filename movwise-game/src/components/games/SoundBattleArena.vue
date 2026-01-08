<template>
  <div class="sound-photo-challenge min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
    <!-- 宇宙背景エフェクト -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <!-- ゲームヘッダー -->
    <header class="relative z-20 p-4 bg-black/50 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-white hover:text-cyan-400 transition-colors">
            <i class="fas fa-arrow-left text-2xl"></i>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-cyan-400 flex items-center gap-2">
              <span class="text-4xl animate-pulse">🎯</span>
              サウンド・フォト・チャレンジ
            </h1>
            <p class="text-cyan-200 text-sm">音を聞いて正しい写真を選ぼう！</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <!-- スコア表示 -->
          <div class="text-center">
            <div class="text-yellow-400 text-2xl font-bold">{{ score }}</div>
            <div class="text-gray-300 text-xs">SCORE</div>
          </div>
          
          <!-- 正解数 -->
          <div class="text-center">
            <div class="text-green-400 text-2xl font-bold">{{ correctAnswers }}/{{ totalQuestions }}</div>
            <div class="text-gray-300 text-xs">正解</div>
          </div>
          
          <!-- コンボ -->
          <div class="text-center">
            <div class="text-orange-400 text-2xl font-bold">×{{ combo }}</div>
            <div class="text-gray-300 text-xs">COMBO</div>
          </div>
        </div>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="relative z-10 h-[calc(100vh-80px)] overflow-hidden">
      <!-- ゲーム開始前 -->
      <div v-if="gamePhase === 'intro'" class="h-full flex items-center justify-center p-6">
        <div class="cosmic-card rounded-2xl p-8 max-w-2xl w-full text-center">
          <div class="text-6xl mb-6 animate-bounce">🎧</div>
          <h2 class="text-3xl font-bold text-cyan-400 mb-6">
            サウンド・フォト・チャレンジ！
          </h2>
          
          <div class="text-gray-300 mb-8 space-y-4">
            <p class="text-lg">ターゲットサウンドを聞いて、そのサウンドが含まれている写真を選択しよう！</p>
            
            <div class="cosmic-panel rounded-lg p-4">
              <h3 class="text-cyan-300 font-bold mb-3 text-center">🎮 遊び方</h3>
              <div class="grid grid-cols-1 gap-2 text-sm">
                <div>🔊 ターゲットサウンドを聞く</div>
                <div>📸 2つの写真のうち、そのサウンドが含まれる方を選択</div>
                <div>⚡ 連続正解でコンボボーナス！</div>
                <div>🎯 時間内にできるだけ多く正解しよう</div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              @click="selectDifficulty('easy')"
              class="cosmic-button cosmic-button-green px-6 py-4 text-lg font-bold"
            >
              🌟 かんたん<br><span class="text-sm">60秒・基本音素</span>
            </button>
            <button 
              @click="selectDifficulty('normal')"
              class="cosmic-button cosmic-button-blue px-6 py-4 text-lg font-bold"
            >
              ⭐ ふつう<br><span class="text-sm">45秒・全音素</span>
            </button>
            <button 
              @click="selectDifficulty('hard')"
              class="cosmic-button cosmic-button-red px-6 py-4 text-lg font-bold"
            >
              🔥 むずかしい<br><span class="text-sm">30秒・高速</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ゲームプレイ中 -->
      <div v-else-if="gamePhase === 'playing'" class="h-full flex flex-col p-6">
        <!-- タイマーバー -->
        <div class="mb-4">
          <div class="bg-gray-800/50 rounded-full h-4 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
              :style="{ width: `${(timeRemaining / maxTime) * 100}%` }"
            ></div>
          </div>
          <div class="text-center text-white font-bold mt-1">{{ timeRemaining }}秒</div>
        </div>

        <!-- 現在の問題エリア -->
        <div class="flex-1 flex flex-col justify-center">
          <!-- ターゲットサウンド表示 -->
          <div class="text-center mb-8">
            <div class="cosmic-card rounded-2xl p-6 max-w-md mx-auto">
              <h3 class="text-xl font-bold text-cyan-400 mb-4">🎯 ターゲットサウンド</h3>
              <div class="text-4xl font-bold text-yellow-400 mb-4 animate-pulse">
                /{{ currentTargetSound }}/
              </div>
              <div class="flex gap-4 justify-center">
                <button 
                  @click="playTargetSound"
                  :disabled="isPlaying"
                  class="cosmic-button cosmic-button-blue px-6 py-3 text-lg font-bold"
                >
                  🔊 音を聞く
                </button>
                <button 
                  @click="playTargetSound"
                  :disabled="isPlaying"
                  class="cosmic-button cosmic-button-green px-4 py-3 text-sm"
                >
                  🔁 もう一度
                </button>
              </div>
            </div>
          </div>

          <!-- 写真選択エリア -->
          <div class="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              v-for="(option, index) in currentOptions"
              :key="option.word"
              @click="selectPhoto(index)"
              :class="[
                'cosmic-card p-6 cursor-pointer transition-all duration-300 transform hover:scale-105',
                selectedAnswer === index ? 'border-4 border-yellow-400 bg-yellow-400/20' : 'hover:border-cyan-400'
              ]"
            >
              <div class="text-center">
                <!-- 写真エリア -->
                <div class="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-6xl">
                  {{ option.emoji }}
                </div>
                
                <!-- 単語表示 -->
                <div class="text-2xl font-bold text-white mb-2">{{ option.word }}</div>
                <div class="text-lg text-gray-300">{{ option.meaning }}</div>
                
                <!-- 選択ボタン -->
                <div class="flex gap-2 mt-4">
                  <button 
                    @click.stop="playWordAudio(option.word)"
                    class="cosmic-button cosmic-button-green px-3 py-2 text-sm"
                    :disabled="isPlaying"
                  >
                    🔊
                  </button>
                  <button 
                    @click.stop="selectPhoto(index)"
                    class="cosmic-button cosmic-button-primary flex-1 py-3 text-lg font-bold"
                    :disabled="selectedAnswer !== null"
                  >
                    {{ selectedAnswer === index ? '選択中' : 'この写真を選ぶ' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- フィードバック表示 -->
          <div v-if="feedback" class="mt-6 text-center">
            <div 
              :class="[
                'inline-block px-8 py-4 rounded-xl font-bold text-xl',
                feedback.correct 
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-400' 
                  : 'bg-red-500/20 text-red-400 border-2 border-red-400'
              ]"
            >
              <div class="text-3xl mb-2">{{ feedback.correct ? '🎉' : '❌' }}</div>
              <div>{{ feedback.message }}</div>
            </div>
          </div>
        </div>

        <!-- 問題進行状況 -->
        <div class="mt-4">
          <div class="flex justify-center space-x-2">
            <div 
              v-for="i in totalQuestions" 
              :key="i"
              :class="[
                'w-4 h-4 rounded-full transition-all duration-300',
                i <= currentQuestionIndex + 1 
                  ? 'bg-cyan-400' 
                  : 'bg-gray-600'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- ゲーム終了 -->
      <div v-else-if="gamePhase === 'complete'" class="h-full flex items-center justify-center p-6">
        <div class="cosmic-card rounded-2xl p-8 max-w-2xl w-full text-center">
          <div class="text-6xl mb-6">{{ score >= targetScore ? '🏆' : '📈' }}</div>
          <h2 class="text-3xl font-bold text-cyan-400 mb-6">
            {{ score >= targetScore ? 'ミッション完了！' : 'お疲れ様！' }}
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="cosmic-stats-card">
              <div class="text-2xl mb-2">🎯</div>
              <div class="text-2xl font-bold text-yellow-400">{{ score }}</div>
              <div class="text-sm text-gray-400">スコア</div>
            </div>
            
            <div class="cosmic-stats-card">
              <div class="text-2xl mb-2">✅</div>
              <div class="text-2xl font-bold text-green-400">{{ correctAnswers }}/{{ totalQuestions }}</div>
              <div class="text-sm text-gray-400">正解率</div>
            </div>
            
            <div class="cosmic-stats-card">
              <div class="text-2xl mb-2">🔥</div>
              <div class="text-2xl font-bold text-orange-400">×{{ maxCombo }}</div>
              <div class="text-sm text-gray-400">最大コンボ</div>
            </div>
            
            <div class="cosmic-stats-card">
              <div class="text-2xl mb-2">⚡</div>
              <div class="text-2xl font-bold text-purple-400">{{ Math.round(accuracy) }}%</div>
              <div class="text-sm text-gray-400">正答率</div>
            </div>
          </div>

          <!-- 習得した音素 -->
          <div v-if="masteredSounds.length > 0" class="mb-8">
            <h3 class="text-xl font-bold text-cyan-400 mb-4">🎵 習得した音素</h3>
            <div class="flex flex-wrap gap-2 justify-center">
              <div 
                v-for="sound in masteredSounds" 
                :key="sound"
                class="bg-purple-600/30 border border-purple-400 rounded-lg px-3 py-2 text-sm"
              >
                /{{ sound }}/
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button 
              @click="resetGame"
              class="cosmic-button cosmic-button-blue px-6 py-3 font-bold"
            >
              🔄 もう一度
            </button>
            <button 
              @click="goBack"
              class="cosmic-button cosmic-button-gray px-6 py-3 font-bold"
            >
              🌌 メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSounds } from '@/composables/useGameSounds'
import { NATIVE_PHONEME_PROGRESSION } from '@/data/native-phoneme-database.js'

const router = useRouter()
const { playSound } = useGameSounds()

// 音声再生用関数（ネイティブ音素データベースから）
const playPhonemeAudio = async (phonemeSymbol) => {
  return new Promise((resolve, reject) => {
    // 全ステージから該当する音素を探す
    const allPhonemes = [
      ...NATIVE_PHONEME_PROGRESSION.stage1A,
      ...NATIVE_PHONEME_PROGRESSION.stage1B,
      ...(NATIVE_PHONEME_PROGRESSION.stage1C || [])
    ]
    
    // 音素シンボルを正規化（スラッシュを除去）して検索
    const normalizedInput = phonemeSymbol.replace(/\//g, '')
    const phoneme = allPhonemes.find(p => 
      p.symbol === phonemeSymbol || 
      p.ipa === phonemeSymbol ||
      p.symbol === `/${normalizedInput}/` ||
      p.ipa === normalizedInput ||
      p.symbol.replace(/\//g, '') === normalizedInput
    )
    
    if (phoneme && phoneme.audioFile) {
      const audio = new Audio(`/sounds/${phoneme.audioFile}`)
      audio.onended = resolve
      audio.onerror = () => {
        logger.warn(`Audio file not found: ${phoneme.audioFile}, using fallback`)
        // フォールバック: 音声合成を使用
        const utterance = new SpeechSynthesisUtterance(phonemeSymbol)
        utterance.lang = 'en-US'
        utterance.rate = 0.6
        utterance.onend = resolve
        utterance.onerror = reject
        speechSynthesis.speak(utterance)
      }
      audio.play().catch(() => {
        logger.warn(`Failed to play audio: ${phoneme.audioFile}, using fallback`)
        // フォールバック: 音声合成を使用
        const utterance = new SpeechSynthesisUtterance(phonemeSymbol)
        utterance.lang = 'en-US'
        utterance.rate = 0.6
        utterance.onend = resolve
        utterance.onerror = reject
        speechSynthesis.speak(utterance)
      })
    } else {
      // フォールバック: 音声合成を使用
      const utterance = new SpeechSynthesisUtterance(phonemeSymbol)
      utterance.lang = 'en-US'
      utterance.rate = 0.6
      utterance.onend = resolve
      utterance.onerror = reject
      speechSynthesis.speak(utterance)
    }
  })
}

// 単語音声再生用関数
const playWordAudio = async (word) => {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    utterance.onend = resolve
    utterance.onerror = reject
    speechSynthesis.speak(utterance)
  })
}

// ゲーム状態
const gamePhase = ref('intro') // intro, playing, complete
const difficulty = ref('normal')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const correctAnswers = ref(0)
const totalQuestions = ref(10)
const currentQuestionIndex = ref(0)
const timeRemaining = ref(60)
const maxTime = ref(60)
const targetScore = ref(500)

// 問題データ
const currentTargetSound = ref('')
const currentOptions = ref([])
const selectedAnswer = ref(null)
const feedback = ref(null)
const isPlaying = ref(false)
const masteredSounds = ref([])

// タイマー
let gameTimer = null
let feedbackTimer = null

// ネイティブ音素データベースから音素と単語のマッピングを生成
const generateSoundWordPairs = () => {
  const pairs = {}
  const allPhonemes = [
    ...NATIVE_PHONEME_PROGRESSION.stage1A,
    ...NATIVE_PHONEME_PROGRESSION.stage1B,
    ...(NATIVE_PHONEME_PROGRESSION.stage1C || [])
  ]

  // 絵文字マッピング
  const emojiMap = {
    'sun': '☀️', 'sit': '🪑', 'bass': '🐟', 'class': '🏫', 'miss': '💔', 'cat': '🐱', 'hat': '🎩', 'bad': '👎', 'man': '👨', 'back': '⬅️',
    'top': '🔝', 'better': '⬆️', 'water': '💧', 'time': '⏰', 'little': '🤏', 'big': '🐘', 'pig': '🐷', 'fish': '🐟', 'ship': '🚢', 'hit': '👊',
    'dog': '🐕', 'box': '📦', 'hot': '🔥', 'not': '❌', 'got': '✅', 'up': '⬆️', 'cup': '☕', 'but': '❌', 'cut': '✂️', 'run': '🏃',
    'bed': '🛏️', 'pen': '✒️', 'ten': '🔟', 'red': '🔴', 'get': '📥', 'see': '👀', 'tree': '🌳', 'green': '💚', 'free': '🆓', 'three': '3️⃣',
    'go': '🚶', 'no': '❌', 'show': '👁️', 'know': '🧠', 'home': '🏠', 'book': '📚', 'look': '👀', 'good': '👍', 'put': '📍', 'full': '🔵',
    'do': '✅', 'you': '👤', 'new': '🆕', 'blue': '🔵', 'true': '✅', 'my': '👤', 'by': '📍', 'try': '💪', 'why': '❓', 'cry': '😢',
    'how': '❓', 'now': '⏰', 'down': '⬇️', 'brown': '🤎', 'house': '🏠', 'boy': '👦', 'toy': '🧸', 'voice': '🗣️', 'choice': '🤔', 'join': '🤝',
    'car': '🚗', 'far': '📏', 'star': '⭐', 'park': '🏞️', 'dark': '🌙', 'for': '👉', 'or': '🤔', 'more': '➕', 'door': '🚪', 'four': '4️⃣',
    'her': '👩', 'bird': '🐦', 'first': '1️⃣', 'word': '📝', 'work': '💼', 'all': '💯', 'call': '📞', 'ball': '⚽', 'small': '🤏', 'wall': '🧱'
  }

  allPhonemes.forEach(phoneme => {
    if (phoneme.examples && phoneme.examples.length > 0) {
      pairs[phoneme.symbol] = phoneme.examples.slice(0, 4).map(word => ({
        word: word,
        meaning: getJapaneseMeaning(word),
        emoji: emojiMap[word] || '📝',
        phoneme: phoneme.symbol
      }))
    }
  })

  return pairs
}

// 日本語意味の簡易マッピング
const getJapaneseMeaning = (word) => {
  const meanings = {
    'sun': 'たいよう', 'sit': 'すわる', 'bass': 'さかな', 'class': 'クラス', 'miss': 'ミス', 'cat': 'ねこ', 'hat': 'ぼうし', 'bad': 'わるい', 'man': 'おとこ', 'back': 'うしろ',
    'top': 'うえ', 'better': 'より良い', 'water': 'みず', 'time': 'じかん', 'little': 'ちいさい', 'big': 'おおきい', 'pig': 'ぶた', 'fish': 'さかな', 'ship': 'ふね', 'hit': 'たたく',
    'dog': 'いぬ', 'box': 'はこ', 'hot': 'あつい', 'not': 'ちがう', 'got': 'とった', 'up': 'うえ', 'cup': 'カップ', 'but': 'でも', 'cut': 'きる', 'run': 'はしる',
    'bed': 'ベッド', 'pen': 'ペン', 'ten': '10', 'red': 'あか', 'get': 'とる', 'see': 'みる', 'tree': 'き', 'green': 'みどり', 'free': 'ただ', 'three': '3',
    'go': 'いく', 'no': 'いいえ', 'show': 'みせる', 'know': 'しる', 'home': 'いえ', 'book': 'ほん', 'look': 'みる', 'good': 'いい', 'put': 'おく', 'full': 'いっぱい',
    'do': 'する', 'you': 'あなた', 'new': 'あたらしい', 'blue': 'あお', 'true': 'ほんとう', 'my': 'わたしの', 'by': 'によって', 'try': 'ためす', 'why': 'なぜ', 'cry': 'なく',
    'how': 'どう', 'now': 'いま', 'down': 'した', 'brown': 'ちゃいろ', 'house': 'いえ', 'boy': 'おとこのこ', 'toy': 'おもちゃ', 'voice': 'こえ', 'choice': 'えらぶ', 'join': 'さんか',
    'car': 'くるま', 'far': 'とおい', 'star': 'ほし', 'park': 'こうえん', 'dark': 'くらい', 'for': 'ために', 'or': 'または', 'more': 'もっと', 'door': 'ドア', 'four': '4',
    'her': 'かのじょ', 'bird': 'とり', 'first': 'はじめ', 'word': 'ことば', 'work': 'しごと', 'all': 'ぜんぶ', 'call': 'よぶ', 'ball': 'ボール', 'small': 'ちいさい', 'wall': 'かべ'
  }
  return meanings[word] || word
}

// 音素と単語のデータを生成
const soundWordPairs = generateSoundWordPairs()

// デバッグ: 利用可能な音素シンボルをログ出力
logger.log('Available phoneme symbols:', Object.keys(soundWordPairs))

// 計算されたプロパティ
const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return (correctAnswers.value / currentQuestionIndex.value) * 100
})

// 似た音素を取得する関数（聞き分けを難しくするため）
const getSimilarSounds = (targetSound, availableSounds) => {
  // 音素の類似グループ
  const similarGroups = {
    // 短母音と長母音
    'a': ['æ', 'ɑː', 'e'],
    'e': ['a', 'ɪ', 'eɪ'],
    'i': ['ɪ', 'iː', 'e'],
    'o': ['ɒ', 'ɔː', 'u'],
    'u': ['ʊ', 'uː', 'o'],
    
    // 長母音
    'eɪ': ['e', 'aɪ', 'æ'],
    'iː': ['i', 'ɪ', 'eɪ'],
    'aɪ': ['eɪ', 'a', 'ɔɪ'],
    'oʊ': ['o', 'ɔː', 'aʊ'],
    'uː': ['u', 'ʊ', 'oʊ'],
    
    // 子音 - 有声無声の対
    'b': ['p', 'd', 'g'],
    'p': ['b', 't', 'k'],
    't': ['d', 'p', 'k'],
    'd': ['t', 'b', 'g'],
    'k': ['g', 'p', 't'],
    'g': ['k', 'd', 'b'],
    
    // 摩擦音
    'f': ['v', 'θ', 's'],
    'v': ['f', 'ð', 'z'],
    's': ['z', 'ʃ', 'f'],
    'z': ['s', 'ʒ', 'v'],
    
    // その他の似た音
    'l': ['r', 'w', 'j'],
    'r': ['l', 'w'],
    'w': ['r', 'v'],
    'm': ['n', 'ŋ'],
    'n': ['m', 'ŋ'],
    'ŋ': ['n', 'm']
  }
  
  // ターゲット音素の類似音素を取得
  const similarList = similarGroups[targetSound] || []
  
  // 利用可能な音素の中から類似音素を抽出
  const availableSimilar = similarList.filter(sound => 
    availableSounds.includes(sound) && soundWordPairs[sound]
  )
  
  // 類似音素がない場合は、ランダムに異なる音素を選択
  if (availableSimilar.length === 0) {
    return availableSounds.filter(s => s !== targetSound)
  }
  
  return availableSimilar
}

// 難易度選択
const selectDifficulty = (level) => {
  difficulty.value = level
  
  const settings = {
    easy: { time: 60, questions: 8, sounds: ['s', 'æ', 't', 'ɪ', 'ɒ', 'ʌ'] },
    normal: { time: 45, questions: 10, sounds: ['s', 'æ', 't', 'ɪ', 'ɒ', 'ʌ', 'ɛ', 'i', 'oʊ', 'ʊ', 'u', 'aɪ'] },
    hard: { time: 30, questions: 12, sounds: Object.keys(soundWordPairs) }
  }
  
  const setting = settings[level]
  timeRemaining.value = setting.time
  maxTime.value = setting.time
  totalQuestions.value = setting.questions
  targetScore.value = setting.questions * 50
  
  startGame()
}

// ゲーム開始
const startGame = () => {
  gamePhase.value = 'playing'
  resetGameStats()
  generateQuestion()
  startTimer()
}

// ゲーム統計リセット
const resetGameStats = () => {
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  correctAnswers.value = 0
  currentQuestionIndex.value = 0
  masteredSounds.value = []
  selectedAnswer.value = null
  feedback.value = null
}

// 新しい問題を生成
const generateQuestion = () => {
  selectedAnswer.value = null
  feedback.value = null
  
  // 実際のデータベースから基本的な音素を選択
  const availableSymbols = Object.keys(soundWordPairs)
  const basicPhonemes = availableSymbols.filter(s => ['/s/', '/æ/', '/t/', '/ɪ/', '/ɒ/', '/ʌ/'].includes(s))
  const intermediatePhonemes = availableSymbols.filter(s => ['/s/', '/æ/', '/t/', '/ɪ/', '/ɒ/', '/ʌ/', '/ɛ/', '/i/', '/oʊ/', '/ʊ/', '/u/', '/aɪ/'].includes(s))
  
  const settings = {
    easy: basicPhonemes.length > 0 ? basicPhonemes : availableSymbols.slice(0, 6),
    normal: intermediatePhonemes.length > 0 ? intermediatePhonemes : availableSymbols.slice(0, 12),
    hard: availableSymbols
  }
  
  logger.log('Difficulty settings:', settings)
  
  const availableSounds = settings[difficulty.value]
  currentTargetSound.value = availableSounds[Math.floor(Math.random() * availableSounds.length)]
  
  // ターゲットサウンドを含む単語を1つ選択
  const targetWords = soundWordPairs[currentTargetSound.value]
  const wordWithTarget = targetWords[Math.floor(Math.random() * targetWords.length)]
  
  // ターゲットサウンドを含まない単語を1つ選択
  const otherSounds = availableSounds.filter(sound => sound !== currentTargetSound.value)
  const otherSound = otherSounds[Math.floor(Math.random() * otherSounds.length)]
  const otherWords = soundWordPairs[otherSound]
  const wordWithoutTarget = otherWords[Math.floor(Math.random() * otherWords.length)]
  
  // ランダムに配置（50%の確率でどちらが左か右かを決める）
  const options = Math.random() < 0.5 
    ? [wordWithTarget, wordWithoutTarget] 
    : [wordWithoutTarget, wordWithTarget]
  
  currentOptions.value = options
  
  // ターゲットサウンドを含む単語のインデックスを記録
  currentOptions.correctIndex = options.findIndex(option => option.word === wordWithTarget.word)
  
  // デバッグログ
  logger.log('Generated question:', {
    targetSound: currentTargetSound.value,
    wordWithTarget: wordWithTarget,
    wordWithoutTarget: wordWithoutTarget,
    options: options,
    correctIndex: currentOptions.correctIndex
  })
}

// ターゲットサウンドを再生
const playTargetSound = async () => {
  if (isPlaying.value) return
  
  isPlaying.value = true
  
  try {
    // ネイティブ音素データベースから音素を再生
    await playPhonemeAudio(currentTargetSound.value)
  } catch (error) {
    logger.error('Error playing target sound:', error)
  } finally {
    setTimeout(() => {
      isPlaying.value = false
    }, 1000)
  }
}

// 写真を選択
const selectPhoto = (index) => {
  if (selectedAnswer.value !== null) return
  
  selectedAnswer.value = index
  
  const isCorrect = index === currentOptions.correctIndex
  
  if (isCorrect) {
    correctAnswers.value++
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    
    // スコア計算
    const baseScore = 50
    const comboBonus = combo.value * 10
    const timeBonus = Math.floor(timeRemaining.value / 2)
    score.value += baseScore + comboBonus + timeBonus
    
    // 音素を習得リストに追加
    if (!masteredSounds.value.includes(currentTargetSound.value)) {
      masteredSounds.value.push(currentTargetSound.value)
    }
    
    feedback.value = {
      correct: true,
      message: `正解！ +${baseScore + comboBonus + timeBonus}点`
    }
    
    playSound('correct')
  } else {
    combo.value = 0
    feedback.value = {
      correct: false,
      message: `不正解... 正解は「${currentOptions.value[currentOptions.correctIndex].word}」でした`
    }
    
    playSound('incorrect')
  }
  
  // 次の問題へ進む
  feedbackTimer = setTimeout(() => {
    currentQuestionIndex.value++
    
    if (currentQuestionIndex.value >= totalQuestions.value) {
      endGame()
    } else {
      generateQuestion()
    }
  }, 2000)
}

// タイマー開始
const startTimer = () => {
  gameTimer = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      endGame()
    }
  }, 1000)
}

// ゲーム終了
const endGame = () => {
  gamePhase.value = 'complete'
  
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
  
  // 最終スコア調整
  if (correctAnswers.value === totalQuestions.value) {
    score.value += 200 // パーフェクトボーナス
  }
  
  playSound(score.value >= targetScore.value ? 'victory' : 'complete')
}

// ゲームリセット
const resetGame = () => {
  gamePhase.value = 'intro'
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
}

// 戻る
const goBack = () => {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
  router.push('/platforms/phonics-adventure')
}

// クリーンアップ
onUnmounted(() => {
  clearInterval(gameTimer)
  clearTimeout(feedbackTimer)
})
</script>

<style scoped>
/* 宇宙背景エフェクト */
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

/* 宇宙テーマカード */
.cosmic-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(79, 172, 254, 0.4);
  box-shadow: 0 8px 32px rgba(0, 191, 255, 0.1);
  backdrop-filter: blur(10px);
}

.cosmic-panel {
  background: linear-gradient(135deg, 
    rgba(20, 30, 60, 0.8) 0%, 
    rgba(10, 20, 40, 0.9) 100%);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(100, 149, 237, 0.3);
}

.cosmic-stats-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.6) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

/* 宇宙テーマボタン */
.cosmic-button {
  position: relative;
  border: 2px solid rgba(79, 172, 254, 0.8);
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.cosmic-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.cosmic-button:hover::before {
  transform: translateX(100%);
}

.cosmic-button-blue {
  background: linear-gradient(135deg, #1E90FF, #4169E1);
  color: white;
  border-color: #00BFFF;
}

.cosmic-button-blue:hover {
  background: linear-gradient(135deg, #4169E1, #0000FF);
  box-shadow: 0 0 20px rgba(30, 144, 255, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-green {
  background: linear-gradient(135deg, #32CD32, #228B22);
  color: white;
  border-color: #00FF00;
}

.cosmic-button-green:hover {
  background: linear-gradient(135deg, #228B22, #006400);
  box-shadow: 0 0 20px rgba(50, 205, 50, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-red {
  background: linear-gradient(135deg, #FF4500, #DC143C);
  color: white;
  border-color: #FF0000;
}

.cosmic-button-red:hover {
  background: linear-gradient(135deg, #DC143C, #B22222);
  box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  color: white;
  border-color: #A855F7;
}

.cosmic-button-primary:hover {
  background: linear-gradient(135deg, #8B5CF6, #A855F7);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.cosmic-button-gray {
  background: linear-gradient(135deg, #6B7280, #4B5563);
  color: white;
  border-color: #9CA3AF;
}

.cosmic-button-gray:hover {
  background: linear-gradient(135deg, #4B5563, #374151);
  box-shadow: 0 0 20px rgba(107, 114, 128, 0.5);
  transform: translateY(-2px);
}

/* ホバーエフェクト */
.cosmic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(79, 172, 254, 0.6);
}

/* アニメーション */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  /* 写真選択エリアは常に2列を維持 */
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  /* モバイルでも写真は小さくして2つ表示 */
  .w-48 {
    width: 8rem; /* 写真サイズを小さく */
  }
  
  .h-48 {
    height: 8rem;
  }
}
</style>