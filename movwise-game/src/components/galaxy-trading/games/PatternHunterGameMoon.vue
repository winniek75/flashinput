<template>
  <div class="pattern-hunter-moon min-h-screen relative overflow-hidden">
    <!-- Grammar Moon専用背景 -->
    <div class="absolute inset-0 moon-background">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-indigo-400/20 to-pink-400/20"></div>
      <!-- 月と星のパーティクル -->
      <div
        v-for="star in moonParticles"
        :key="star.id"
        class="absolute opacity-30 text-3xl animate-pulse"
        :style="{
          left: `${star.x}%`,
          top: `${star.y}%`,
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`
        }"
      >
        {{ star.symbol }}
      </div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto p-6">
      <!-- Grammar Moon専用ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-purple-700 mb-2 flex items-center gap-3">
              🌙 Grammar Moon Academy
            </h1>
            <p class="text-purple-600">月の博士と一緒に文法パターンの謎を解こう！</p>
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
                  : 'linear-gradient(90deg, #8B5CF6, #7C3AED)'
              }"
            ></div>
          </div>
          <div v-if="isInvestmentUnlocked" class="text-center mt-2">
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              🚀 Grammar Moon Academy への投資が解禁されました！
            </span>
          </div>
        </div>
      </div>

      <!-- ゲーム説明（Grammar Moon特化） -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="text-6xl">🌙</div>
          <div>
            <h2 class="text-2xl font-bold text-purple-700">月の博士からのメッセージ</h2>
            <p class="text-purple-600">
              こんにちは！Grammar Moon Academyへようこそ！<br>
              月面の文法研究所で隠された文法パターンを発見しましょう。<br>
              優秀な研究成果を残すと、私たちの教育機関に投資することができます！
            </p>
          </div>
        </div>
        
        <!-- Grammar Moon投資情報 -->
        <div v-if="isInvestmentUnlocked" class="bg-green-50 rounded-2xl p-4 mt-4">
          <div class="text-center">
            <div class="text-lg font-bold text-green-800 mb-2">🏢 Grammar Moon Academy 投資情報</div>
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
        <!-- Pattern Hunter Game ロジック（既存をMoonテーマで拡張） -->
        <div v-if="gameState === 'playing'" class="text-center">
          <!-- ゲーム統計表示 -->
          <div class="mb-6">
            <div class="text-2xl font-bold text-purple-700 mb-4">
              🌙 文法パターンを発見しよう！
            </div>
            
            <div class="grid grid-cols-4 gap-4 mb-4">
              <div class="bg-purple-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-purple-700">{{ score }}</div>
                <div class="text-purple-600">スコア</div>
              </div>
              <div class="bg-blue-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-blue-700">{{ timeLeft }}s</div>
                <div class="text-blue-600">残り時間</div>
              </div>
              <div class="bg-green-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-green-700">{{ correctPatterns }}</div>
                <div class="text-green-600">正解数</div>
              </div>
              <div class="bg-yellow-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-yellow-700">{{ combo }}</div>
                <div class="text-yellow-600">コンボ</div>
              </div>
            </div>
          </div>

          <!-- ターゲットパターン表示 -->
          <div class="mb-6">
            <div class="text-lg font-bold text-purple-700 mb-4">
              🎯 発見すべきパターン: {{ currentPattern.description }}
            </div>
            <div class="text-lg text-purple-600 mb-4">
              例: {{ currentPattern.example }}
            </div>
          </div>

          <!-- 単語グリッド -->
          <div class="grid grid-cols-4 gap-3 mb-6">
            <button
              v-for="(word, index) in wordGrid"
              :key="index"
              @click="selectWord(word, index)"
              :disabled="word.selected"
              class="p-4 rounded-xl text-lg font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
              :class="getWordButtonClass(word)"
            >
              {{ word.text }}
            </button>
          </div>

          <!-- 選択した単語列 -->
          <div class="mb-6">
            <div class="text-lg font-bold text-purple-700 mb-2">選択した単語:</div>
            <div class="flex justify-center gap-2 flex-wrap">
              <span
                v-for="(word, index) in selectedWords"
                :key="index"
                @click="removeFromSelection(index)"
                class="bg-purple-100 text-purple-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-purple-200 transition-all duration-200"
              >
                {{ word.text }}
              </span>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="space-y-3">
            <button
              @click="checkPattern"
              :disabled="selectedWords.length === 0"
              class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-all duration-200"
            >
              🌙 パターンをチェック
            </button>
            
            <button
              @click="clearSelection"
              class="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              🔄 選択をリセット
            </button>
          </div>
        </div>

        <!-- ゲーム開始画面 -->
        <div v-else-if="gameState === 'start'" class="text-center py-12">
          <div class="text-8xl mb-6">🌙</div>
          <h2 class="text-3xl font-bold text-purple-700 mb-4">Grammar Moon Academy</h2>
          <p class="text-purple-600 mb-8 max-w-lg mx-auto">
            月の博士と一緒に文法パターンの研究をしましょう！<br>
            隠された文法の法則を発見して、言語学習を深めよう。<br>
            優秀な成果を出すと、教育機関への投資が可能になります。
          </p>
          
          <!-- 難易度選択 -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-purple-700 mb-3">🎯 研究レベルを選択</label>
            <select v-model="selectedDifficulty" class="bg-white border-2 border-purple-300 rounded-xl px-4 py-2 font-bold text-purple-700">
              <option value="easy">🌙 新月研究員 (基本パターン)</option>
              <option value="medium">🌓 半月研究員 (標準パターン)</option>
              <option value="hard">🌕 満月研究員 (複雑パターン)</option>
            </select>
          </div>
          
          <button
            @click="startGame"
            class="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 文法研究開始！
          </button>
        </div>

        <!-- 結果画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="text-8xl mb-6">🏆</div>
          <h2 class="text-3xl font-bold text-purple-700 mb-4">素晴らしい研究成果でした！</h2>
          
          <!-- 結果統計 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-purple-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-purple-700">{{ gameResult.score }}</div>
              <div class="text-purple-600">研究スコア</div>
            </div>
            <div class="bg-green-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-green-700">{{ gameResult.accuracy }}%</div>
              <div class="text-green-600">精度</div>
            </div>
            <div class="bg-yellow-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-yellow-700">{{ gameResult.maxCombo }}</div>
              <div class="text-yellow-600">最大コンボ</div>
            </div>
          </div>

          <!-- Galaxy Trading 統合結果 -->
          <div v-if="gameResult.accuracy >= 70" class="bg-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6">
            <div class="text-2xl font-bold text-green-800 mb-3">🎉 投資解禁達成！</div>
            <p class="text-green-700 mb-4">
              卓越した研究成果です！Grammar Moon Academy への投資が可能になりました。
              最先端の言語教育機関を応援して、毎日のリターンを受け取りませんか？
            </p>
            <button
              @click="openInvestmentModal"
              class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
            >
              🏢 Grammar Moon Academy に投資する
            </button>
          </div>

          <!-- アクションボタン -->
          <div class="space-y-3">
            <button
              @click="playAgain"
              class="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              🔄 もう一度研究する
            </button>
            <button
              @click="goToGalaxyHub"
              class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
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
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export default {
  name: 'PatternHunterGameMoon',
  components: {
    ArrowLeft
  },
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const gameState = ref('start') // start, playing, complete
    const selectedDifficulty = ref('easy')
    const score = ref(0)
    const timeLeft = ref(120)
    const correctPatterns = ref(0)
    const combo = ref(0)
    const selectedWords = ref([])
    const wordGrid = ref([])
    const showFeedback = ref(false)
    const feedbackData = ref({})
    const gameResult = ref({
      score: 0,
      accuracy: 0,
      maxCombo: 0,
      correctAnswers: 0,
      totalQuestions: 8
    })
    
    // Moon専用パーティクル
    const moonParticles = ref([])
    
    // 文法パターンデータ（Moon テーマ）
    const grammarPatterns = {
      easy: [
        { 
          description: "主語 + be動詞", 
          example: "I am happy", 
          pattern: ["I", "am", "happy"],
          words: ["I", "am", "happy", "you", "is", "sad", "we", "are"]
        },
        { 
          description: "名詞 + 複数形", 
          example: "cats play", 
          pattern: ["cats", "play"],
          words: ["cat", "cats", "play", "plays", "dog", "dogs", "run", "runs"]
        }
      ],
      medium: [
        { 
          description: "現在進行形", 
          example: "She is running", 
          pattern: ["She", "is", "running"],
          words: ["She", "is", "running", "run", "He", "are", "playing", "play"]
        },
        { 
          description: "疑問文", 
          example: "Are you happy?", 
          pattern: ["Are", "you", "happy", "?"],
          words: ["Are", "you", "happy", "?", "Is", "he", "sad", "."]
        }
      ],
      hard: [
        { 
          description: "完了形", 
          example: "I have finished", 
          pattern: ["I", "have", "finished"],
          words: ["I", "have", "finished", "finish", "has", "completed", "complete", "am"]
        }
      ]
    }
    
    const currentPattern = ref({})
    let gameTimer = null
    
    // === 計算プロパティ ===
    const planetData = computed(() => galaxyStore.planetCorporations['grammar-moon'])
    const unlockStatus = computed(() => galaxyStore.planetUnlockStatus['grammar-moon'])
    const learningProgress = computed(() => unlockStatus.value?.progress || 0)
    const requiredProgress = computed(() => unlockStatus.value?.required || 60)
    const isInvestmentUnlocked = computed(() => unlockStatus.value?.unlocked || false)
    const investmentTiers = computed(() => planetData.value?.investmentTiers || [])
    
    const investmentStatus = computed(() => {
      if (isInvestmentUnlocked.value) {
        return {
          label: '投資可能',
          description: '教育機関を応援'
        }
      } else {
        return {
          label: '学習中',
          description: `${requiredProgress.value}%必要`
        }
      }
    })
    
    // === メソッド ===
    
    /**
     * Moon パーティクルの生成
     */
    const generateMoonParticles = () => {
      const symbols = ['🌙', '⭐', '✨', '🌟']
      moonParticles.value = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        symbol: symbols[Math.floor(Math.random() * symbols.length)]
      }))
    }
    
    /**
     * ゲーム開始
     */
    const startGame = () => {
      gameState.value = 'playing'
      score.value = 0
      timeLeft.value = 120
      correctPatterns.value = 0
      combo.value = 0
      selectedWords.value = []
      gameResult.value = {
        score: 0,
        accuracy: 0,
        maxCombo: 0,
        correctAnswers: 0,
        totalQuestions: 8
      }
      
      generateNewPattern()
      startTimer()
      logger.log('🌙 Grammar Moon Pattern Hunter 開始')
    }
    
    /**
     * 新しいパターンを生成
     */
    const generateNewPattern = () => {
      const patterns = grammarPatterns[selectedDifficulty.value]
      currentPattern.value = patterns[Math.floor(Math.random() * patterns.length)]
      
      // 単語グリッドを生成
      const allWords = [...currentPattern.value.words]
      const shuffledWords = allWords.sort(() => Math.random() - 0.5)
      
      wordGrid.value = shuffledWords.map(word => ({
        text: word,
        selected: false,
        isCorrect: currentPattern.value.pattern.includes(word)
      }))
    }
    
    /**
     * タイマー開始
     */
    const startTimer = () => {
      gameTimer = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          completeGame()
        }
      }, 1000)
    }
    
    /**
     * 単語選択
     */
    const selectWord = (word, index) => {
      if (!word.selected) {
        word.selected = true
        selectedWords.value.push(word)
      }
    }
    
    /**
     * 選択から削除
     */
    const removeFromSelection = (index) => {
      const word = selectedWords.value[index]
      const gridIndex = wordGrid.value.findIndex(w => w.text === word.text && w.selected)
      if (gridIndex !== -1) {
        wordGrid.value[gridIndex].selected = false
      }
      selectedWords.value.splice(index, 1)
    }
    
    /**
     * 選択をクリア
     */
    const clearSelection = () => {
      wordGrid.value.forEach(word => word.selected = false)
      selectedWords.value = []
    }
    
    /**
     * 単語ボタンのクラス
     */
    const getWordButtonClass = (word) => {
      if (word.selected) {
        return 'bg-purple-200 text-purple-800 border-2 border-purple-400'
      }
      return 'bg-white text-purple-700 border-2 border-purple-300 hover:bg-purple-50'
    }
    
    /**
     * パターンチェック
     */
    const checkPattern = () => {
      const selectedTexts = selectedWords.value.map(w => w.text)
      const isCorrect = JSON.stringify(selectedTexts) === JSON.stringify(currentPattern.value.pattern)
      
      // フィードバック表示
      showFeedback.value = true
      feedbackData.value = {
        emoji: isCorrect ? '🎉' : '😔',
        title: isCorrect ? '素晴らしい発見！' : '惜しい！',
        message: isCorrect ? 
          `完璧なパターンを発見しました！` : 
          `正解は: ${currentPattern.value.pattern.join(' ')}`,
        textColor: isCorrect ? 'text-green-600' : 'text-red-600'
      }
      
      // 結果記録
      if (isCorrect) {
        score.value += 300
        combo.value++
        correctPatterns.value++
        gameResult.value.correctAnswers++
      } else {
        combo.value = 0
      }
      
      // フィードバック自動非表示
      setTimeout(() => {
        showFeedback.value = false
        if (correctPatterns.value >= 8 || timeLeft.value <= 0) {
          completeGame()
        } else {
          clearSelection()
          generateNewPattern()
        }
      }, 2000)
    }
    
    /**
     * ゲーム完了
     */
    const completeGame = () => {
      if (gameTimer) {
        clearInterval(gameTimer)
        gameTimer = null
      }
      
      // 結果計算
      gameResult.value.score = score.value
      gameResult.value.accuracy = Math.round(
        (gameResult.value.correctAnswers / gameResult.value.totalQuestions) * 100
      )
      gameResult.value.maxCombo = combo.value
      
      // Galaxy Trading データ更新
      const progress = Math.min(100, gameResult.value.accuracy)
      gameStore.updateGameProgress('grammarPattern', {
        progress: progress,
        bestScore: gameResult.value.score,
        accuracy: gameResult.value.accuracy,
        completed: progress >= 70,
        lastPlayed: new Date().toISOString()
      })
      
      // Galaxy Trading 学習効果記録
      gameStore.recordGalaxyTradingLearning(
        'grammar-moon',
        '文法パターン認識',
        gameResult.value.score
      )
      
      gameState.value = 'complete'
      
      // Galaxy Game Completed イベント発火
      window.dispatchEvent(new CustomEvent('galaxy-game-completed', {
        detail: {
          gameType: 'grammarPattern',
          planetId: 'grammar-moon',
          ...gameResult.value,
          completed: gameResult.value.accuracy >= 70
        }
      }))
      
      logger.log('🏆 Grammar Moon Pattern Hunter 完了:', gameResult.value)
    }
    
    /**
     * 投資モーダルを開く
     */
    const openInvestmentModal = () => {
      router.push({
        path: '/galaxy-trading',
        query: {
          planet: 'grammar-moon',
          action: 'invest'
        }
      })
    }
    
    /**
     * もう一度プレイ
     */
    const playAgain = () => {
      gameState.value = 'start'
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
      logger.log('🌙 Grammar Moon Pattern Hunter 初期化')
      generateMoonParticles()
      
      // Galaxy Trading システム有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
      }
    })
    
    onUnmounted(() => {
      if (gameTimer) {
        clearInterval(gameTimer)
      }
      
      // Galaxy Bridge Ready イベント発火
      window.dispatchEvent(new CustomEvent('galaxy-game-completed', {
        detail: null // クリーンアップ
      }))
    })
    
    return {
      // State
      gameState,
      selectedDifficulty,
      score,
      timeLeft,
      correctPatterns,
      combo,
      selectedWords,
      wordGrid,
      showFeedback,
      feedbackData,
      gameResult,
      moonParticles,
      currentPattern,
      
      // Computed
      planetData,
      learningProgress,
      requiredProgress,
      isInvestmentUnlocked,
      investmentTiers,
      investmentStatus,
      
      // Methods
      startGame,
      selectWord,
      removeFromSelection,
      clearSelection,
      getWordButtonClass,
      checkPattern,
      openInvestmentModal,
      playAgain,
      goToGalaxyHub,
      handleBack
    }
  }
}
</script>

<style scoped>
.pattern-hunter-moon {
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

.moon-background {
  background: 
    radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.3) 0%, transparent 50%);
}

/* 月と星のパーティクルアニメーション */
.animate-pulse {
  animation: moonPulse 3s ease-in-out infinite;
}

@keyframes moonPulse {
  0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.6; transform: scale(1.1) rotate(5deg); }
}

/* ボタンのホバーエフェクト */
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
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-1.md\\:grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>