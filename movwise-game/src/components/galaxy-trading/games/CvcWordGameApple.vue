<template>
  <div class="cvc-word-game-apple min-h-screen relative overflow-hidden">
    <!-- Apple Planet専用背景 -->
    <div class="absolute inset-0 apple-background">
      <div class="absolute inset-0 bg-gradient-to-br from-red-400/20 via-green-400/20 to-yellow-400/20"></div>
      <!-- りんごパーティクル -->
      <div
        v-for="apple in appleParticles"
        :key="apple.id"
        class="absolute opacity-30 text-4xl animate-pulse"
        :style="{
          left: `${apple.x}%`,
          top: `${apple.y}%`,
          animationDelay: `${apple.delay}s`,
          animationDuration: `${apple.duration}s`
        }"
      >
        🍎
      </div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto p-6">
      <!-- Apple Planet専用ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-red-700 mb-2 flex items-center gap-3">
              🍎 Apple Garden CVC Factory
            </h1>
            <p class="text-red-600">アップルちゃんと一緒にCVC単語を作ろう！</p>
          </div>
          
          <!-- Galaxy Trading統合ステータス -->
          <div class="bg-green-100 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-green-800">{{ investmentStatus.label }}</div>
              <div class="text-sm text-green-600">{{ investmentStatus.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- 学習進捗 → 投資解禁バー -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>🎓 学習進捗 → 🏢 投資解禁</span>
            <span>{{ learningProgress }}% / {{ requiredProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="rounded-full h-3 transition-all duration-500"
              :style="{ 
                width: `${Math.min(learningProgress, 100)}%`,
                background: isInvestmentUnlocked 
                  ? 'linear-gradient(90deg, #10B981, #059669)' 
                  : 'linear-gradient(90deg, #F59E0B, #D97706)'
              }"
            ></div>
          </div>
          <div v-if="isInvestmentUnlocked" class="text-center mt-2">
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              🚀 Apple Garden Planet への投資が解禁されました！
            </span>
          </div>
        </div>
      </div>

      <!-- ゲーム説明（Apple Planet特化） -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="text-6xl">🧑‍🌾</div>
          <div>
            <h2 class="text-2xl font-bold text-red-700">アップルちゃんからのメッセージ</h2>
            <p class="text-red-600">
              こんにちは！アップルガーデンへようこそ！<br>
              CVC単語を正しく作って、りんご農園のお手伝いをしてね。<br>
              上手にできると、私たちの農園に投資することができるようになるよ！
            </p>
          </div>
        </div>
        
        <!-- Apple Planet投資情報 -->
        <div v-if="isInvestmentUnlocked" class="bg-green-50 rounded-2xl p-4 mt-4">
          <div class="text-center">
            <div class="text-lg font-bold text-green-800 mb-2">🏢 Apple Garden Planet 投資情報</div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                v-for="(tier, index) in investmentTiers.slice(0, 4)" 
                :key="index"
                class="bg-white rounded-xl p-3 border border-green-200"
              >
                <div class="text-green-800 font-bold text-sm">{{ tier.label }}</div>
                <div class="text-green-600 text-xs">{{ tier.cost }} EP</div>
                <div class="text-green-700 text-xs">+{{ tier.dailyReturn }}/日</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- メインゲームエリア -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
        <!-- CVC Word Game ロジック（既存を Apple テーマで拡張） -->
        <div v-if="gameState === 'playing'" class="text-center">
          <!-- 現在の問題表示 -->
          <div class="mb-6">
            <div class="text-2xl font-bold text-red-700 mb-4">
              🍎 りんごの単語を作ろう！ ({{ currentQuestionIndex + 1 }}/{{ totalQuestions }})
            </div>
            
            <!-- 音声再生ボタン -->
            <button
              @click="playWordSound"
              :disabled="isPlaying"
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 mx-auto mb-6"
            >
              <Volume2 class="w-5 h-5" />
              {{ isPlaying ? '再生中...' : '🔊 単語を聞く' }}
            </button>
          </div>

          <!-- 選択した文字表示 -->
          <div class="flex justify-center gap-3 mb-6">
            <div
              v-for="(letter, index) in selectedLetters"
              :key="index"
              @click="removeLetter(index)"
              class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
              :style="{ background: getAppleLetterColor(letter) }"
            >
              {{ letter || '?' }}
            </div>
          </div>

          <!-- 文字選択肢 -->
          <div class="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            <button
              v-for="letter in availableLetters"
              :key="letter"
              @click="selectLetter(letter)"
              :disabled="selectedLetters.filter(l => l).length >= 3"
              class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
              :style="{ background: getAppleLetterColor(letter) }"
            >
              {{ letter }}
            </button>
          </div>

          <!-- チェックボタン -->
          <button
            @click="checkAnswer"
            :disabled="selectedLetters.filter(l => l).length !== 3"
            class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50 transition-all duration-200"
          >
            🍎 りんごを収穫する
          </button>
        </div>

        <!-- ゲーム開始画面 -->
        <div v-else-if="gameState === 'start'" class="text-center py-12">
          <div class="text-8xl mb-6">🍎</div>
          <h2 class="text-3xl font-bold text-red-700 mb-4">Apple Garden CVC Factory</h2>
          <p class="text-red-600 mb-8 max-w-lg mx-auto">
            アップルちゃんと一緒にCVC単語を作って、りんご農園を手伝いましょう！
            正解するたびに美味しいりんごを収穫できます。
          </p>
          
          <!-- 難易度選択 -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-red-700 mb-3">🎯 難易度を選択</label>
            <select v-model="selectedDifficulty" class="bg-white border-2 border-red-300 rounded-xl px-4 py-2 font-bold text-red-700">
              <option value="easy">🌱 はじめて (簡単な単語)</option>
              <option value="medium">🌿 なれてきた (基本的な単語)</option>
              <option value="hard">🌳 上級者 (難しい単語)</option>
            </select>
          </div>
          
          <button
            @click="startGame"
            class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 りんご収穫開始！
          </button>
        </div>

        <!-- 結果画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="text-8xl mb-6">🏆</div>
          <h2 class="text-3xl font-bold text-red-700 mb-4">素晴らしい収穫でした！</h2>
          
          <!-- 結果統計 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-red-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-red-700">{{ gameResult.score }}</div>
              <div class="text-red-600">収穫したりんご</div>
            </div>
            <div class="bg-green-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-green-700">{{ gameResult.accuracy }}%</div>
              <div class="text-green-600">正解率</div>
            </div>
            <div class="bg-yellow-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-yellow-700">{{ gameResult.maxStreak }}</div>
              <div class="text-yellow-600">最大連続正解</div>
            </div>
          </div>

          <!-- Galaxy Trading 統合結果 -->
          <div v-if="gameResult.accuracy >= 70" class="bg-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6">
            <div class="text-2xl font-bold text-green-800 mb-3">🎉 投資解禁達成！</div>
            <p class="text-green-700 mb-4">
              素晴らしい学習成果です！Apple Garden Planet への投資が可能になりました。
              りんご農園を応援して、毎日のリターンを受け取りませんか？
            </p>
            <button
              @click="openInvestmentModal"
              class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
            >
              🏢 Apple Garden Planet に投資する
            </button>
          </div>

          <!-- アクションボタン -->
          <div class="space-y-3">
            <button
              @click="playAgain"
              class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              🔄 もう一度プレイ
            </button>
            <button
              @click="goToGalaxyHub"
              class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              🌌 Galaxy Trading Hub に戻る
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- フィードバック表示 -->
    <div v-if="showFeedback" class="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div class="bg-white rounded-3xl p-8 text-center shadow-2xl">
        <div class="text-6xl mb-4">{{ feedbackData.emoji }}</div>
        <div class="text-2xl font-bold mb-2" :class="feedbackData.textColor">{{ feedbackData.title }}</div>
        <div class="text-gray-600">{{ feedbackData.message }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Volume2 } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export default {
  name: 'CvcWordGameApple',
  components: {
    ArrowLeft,
    Volume2
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const gameState = ref('start') // start, playing, complete
    const selectedDifficulty = ref('easy')
    const currentQuestionIndex = ref(0)
    const selectedLetters = ref(['', '', ''])
    const availableLetters = ref([])
    const isPlaying = ref(false)
    const showFeedback = ref(false)
    const feedbackData = ref({})
    const gameResult = ref({
      score: 0,
      accuracy: 0,
      maxStreak: 0,
      correctAnswers: 0,
      totalQuestions: 10
    })
    
    // Apple専用パーティクル
    const appleParticles = ref([])
    
    // CVC単語データ（Apple テーマ）
    const cvcWords = {
      easy: [
        { word: 'cat', sounds: ['c', 'a', 't'], hint: 'ニャーと鳴く動物' },
        { word: 'dog', sounds: ['d', 'o', 'g'], hint: 'ワンワンと鳴く動物' },
        { word: 'hat', sounds: ['h', 'a', 't'], hint: '頭にかぶるもの' },
        { word: 'pen', sounds: ['p', 'e', 'n'], hint: '字を書く道具' },
        { word: 'cup', sounds: ['c', 'u', 'p'], hint: '飲み物を入れる' }
      ],
      medium: [
        { word: 'bag', sounds: ['b', 'a', 'g'], hint: '物を入れる袋' },
        { word: 'sun', sounds: ['s', 'u', 'n'], hint: '空にある明るいもの' },
        { word: 'red', sounds: ['r', 'e', 'd'], hint: 'りんごの色' },
        { word: 'big', sounds: ['b', 'i', 'g'], hint: '大きいという意味' },
        { word: 'run', sounds: ['r', 'u', 'n'], hint: '早く移動すること' }
      ],
      hard: [
        { word: 'fox', sounds: ['f', 'o', 'x'], hint: 'オレンジ色の動物' },
        { word: 'box', sounds: ['b', 'o', 'x'], hint: '四角い容器' },
        { word: 'zip', sounds: ['z', 'i', 'p'], hint: 'ファスナーの音' },
        { word: 'jam', sounds: ['j', 'a', 'm'], hint: 'パンに塗る甘いもの' },
        { word: 'web', sounds: ['w', 'e', 'b'], hint: 'クモの巣' }
      ]
    }
    
    // === 計算プロパティ ===
    const planetData = computed(() => galaxyStore.planetCorporations['apple-planet'])
    const unlockStatus = computed(() => galaxyStore.planetUnlockStatus['apple-planet'])
    const learningProgress = computed(() => unlockStatus.value?.progress || 0)
    const requiredProgress = computed(() => unlockStatus.value?.required || 20)
    const isInvestmentUnlocked = computed(() => unlockStatus.value?.unlocked || false)
    const investmentTiers = computed(() => planetData.value?.investmentTiers || [])
    
    const investmentStatus = computed(() => {
      if (isInvestmentUnlocked.value) {
        return {
          label: '投資可能',
          description: 'りんご農園を応援'
        }
      } else {
        return {
          label: '学習中',
          description: `${requiredProgress.value}%必要`
        }
      }
    })
    
    const currentWord = computed(() => {
      const words = cvcWords[selectedDifficulty.value]
      return words[currentQuestionIndex.value % words.length]
    })
    
    const totalQuestions = computed(() => {
      return Math.min(10, cvcWords[selectedDifficulty.value].length)
    })
    
    // === メソッド ===
    
    /**
     * Apple パーティクルの生成
     */
    const generateAppleParticles = () => {
      appleParticles.value = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
      }))
    }
    
    /**
     * Apple テーマの文字色
     */
    const getAppleLetterColor = (letter) => {
      const colors = {
        'a': 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
        'e': 'linear-gradient(135deg, #10B981, #34D399)',
        'i': 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        'o': 'linear-gradient(135deg, #EF4444, #F87171)',
        'u': 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
      }
      
      // 母音は特別色、子音は基本色
      return colors[letter] || 'linear-gradient(135deg, #6B7280, #9CA3AF)'
    }
    
    /**
     * ゲーム開始
     */
    const startGame = () => {
      gameState.value = 'playing'
      currentQuestionIndex.value = 0
      selectedLetters.value = ['', '', '']
      gameResult.value = {
        score: 0,
        accuracy: 0,
        maxStreak: 0,
        correctAnswers: 0,
        totalQuestions: totalQuestions.value
      }
      
      generateAvailableLetters()
      logger.log('🍎 Apple Planet CVC Game 開始')
    }
    
    /**
     * 使用可能文字の生成
     */
    const generateAvailableLetters = () => {
      const word = currentWord.value
      const correctLetters = word.sounds
      const extraLetters = ['b', 'd', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z']
      
      // 正解文字 + ランダムな追加文字
      const randomExtras = extraLetters
        .filter(l => !correctLetters.includes(l))
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
      
      availableLetters.value = [...correctLetters, ...randomExtras]
        .sort(() => Math.random() - 0.5)
    }
    
    /**
     * 文字選択
     */
    const selectLetter = (letter) => {
      const emptyIndex = selectedLetters.value.findIndex(l => !l)
      if (emptyIndex !== -1) {
        selectedLetters.value[emptyIndex] = letter
      }
    }
    
    /**
     * 文字削除
     */
    const removeLetter = (index) => {
      selectedLetters.value[index] = ''
    }
    
    /**
     * 音声再生
     */
    const playWordSound = () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      // 実際の音声再生ロジックはここに実装
      setTimeout(() => {
        isPlaying.value = false
      }, 1500)
      
      logger.log(`🔊 再生中: ${currentWord.value.word}`)
    }
    
    /**
     * 回答チェック
     */
    const checkAnswer = () => {
      const userAnswer = selectedLetters.value.join('')
      const correctAnswer = currentWord.value.sounds.join('')
      const isCorrect = userAnswer === correctAnswer
      
      // フィードバック表示
      showFeedback.value = true
      feedbackData.value = {
        emoji: isCorrect ? '🎉' : '😔',
        title: isCorrect ? '正解！' : '惜しい！',
        message: isCorrect ? 
          `素晴らしい！"${currentWord.value.word}"を作れました！` : 
          `正解は"${correctAnswer}"でした。もう一度挑戦！`,
        textColor: isCorrect ? 'text-green-600' : 'text-red-600'
      }
      
      // 結果記録
      if (isCorrect) {
        gameResult.value.score += 100
        gameResult.value.correctAnswers++
      }
      
      // フィードバック自動非表示
      setTimeout(() => {
        showFeedback.value = false
        nextQuestion()
      }, 2000)
    }
    
    /**
     * 次の問題
     */
    const nextQuestion = () => {
      currentQuestionIndex.value++
      
      if (currentQuestionIndex.value >= totalQuestions.value) {
        completeGame()
      } else {
        selectedLetters.value = ['', '', '']
        generateAvailableLetters()
      }
    }
    
    /**
     * ゲーム完了
     */
    const completeGame = () => {
      // 結果計算
      gameResult.value.accuracy = Math.round(
        (gameResult.value.correctAnswers / gameResult.value.totalQuestions) * 100
      )
      
      // Galaxy Trading データ更新
      const progress = Math.min(100, gameResult.value.accuracy)
      gameStore.updateGameProgress('cvcWord', {
        progress: progress,
        bestScore: gameResult.value.score,
        accuracy: gameResult.value.accuracy,
        completed: progress >= 70,
        lastPlayed: new Date().toISOString()
      })
      
      // Galaxy Trading 学習効果記録
      gameStore.recordGalaxyTradingLearning(
        'apple-planet',
        'CVC単語理解',
        gameResult.value.score
      )
      
      gameState.value = 'complete'
      
      // Galaxy Game Completed イベント発火
      window.dispatchEvent(new CustomEvent('galaxy-game-completed', {
        detail: {
          gameType: 'cvcWord',
          planetId: 'apple-planet',
          ...gameResult.value,
          completed: gameResult.value.accuracy >= 70
        }
      }))
      
      logger.log('🏆 Apple Planet CVC Game 完了:', gameResult.value)
    }
    
    /**
     * 投資モーダルを開く
     */
    const openInvestmentModal = () => {
      router.push({
        path: '/galaxy-trading',
        query: {
          planet: 'apple-planet',
          action: 'invest'
        }
      })
    }
    
    /**
     * もう一度プレイ
     */
    const playAgain = () => {
      gameState.value = 'start'
      currentQuestionIndex.value = 0
    }
    
    /**
     * Galaxy Hub に戻る
     */
    const goToGalaxyHub = () => {
      router.push('/galaxy-trading')
    }
    
    /**
     * 戻るボタン
     */
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🍎 Apple Planet CVC Word Game 初期化')
      generateAppleParticles()
      
      // Galaxy Trading システム有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
      }
    })
    
    onUnmounted(() => {
      // Galaxy Bridge Ready イベント発火
      window.dispatchEvent(new CustomEvent('galaxy-game-completed', {
        detail: null // クリーンアップ
      }))
    })
    
    return {
      // State
      gameState,
      selectedDifficulty,
      currentQuestionIndex,
      selectedLetters,
      availableLetters,
      isPlaying,
      showFeedback,
      feedbackData,
      gameResult,
      appleParticles,
      
      // Computed
      planetData,
      learningProgress,
      requiredProgress,
      isInvestmentUnlocked,
      investmentTiers,
      investmentStatus,
      currentWord,
      totalQuestions,
      
      // Methods
      getAppleLetterColor,
      startGame,
      selectLetter,
      removeLetter,
      playWordSound,
      checkAnswer,
      openInvestmentModal,
      playAgain,
      goToGalaxyHub,
      handleBack
    }
  }
}
</script>

<style scoped>
.cvc-word-game-apple {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.apple-background {
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 107, 107, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(251, 191, 36, 0.3) 0%, transparent 50%);
}

/* りんごパーティクルアニメーション */
.animate-pulse {
  animation: applePulse 3s ease-in-out infinite;
}

@keyframes applePulse {
  0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.6; transform: scale(1.1) rotate(5deg); }
}

/* 文字ボタンのホバーエフェクト */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* フィードバックアニメーション */
.fixed.inset-0 > div {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

/* 進捗バーのグロー効果 */
.rounded-full.h-3 > div {
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .grid-cols-4.md\\:grid-cols-6 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .w-16.h-16 {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
  
  .w-14.h-14 {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }
}
</style>