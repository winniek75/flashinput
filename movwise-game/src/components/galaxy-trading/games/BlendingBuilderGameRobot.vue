<template>
  <div class="blending-builder-robot min-h-screen relative overflow-hidden">
    <!-- Robot Planet専用背景 -->
    <div class="absolute inset-0 robot-background">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-purple-400/20"></div>
      <!-- ロボットパーティクル -->
      <div
        v-for="robot in robotParticles"
        :key="robot.id"
        class="absolute opacity-30 text-4xl animate-pulse"
        :style="{
          left: `${robot.x}%`,
          top: `${robot.y}%`,
          animationDelay: `${robot.delay}s`,
          animationDuration: `${robot.duration}s`
        }"
      >
        🤖
      </div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto p-6">
      <!-- Robot Planet専用ヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center justify-between mb-6">
          <button
            @click="handleBack"
            class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <div class="text-center">
            <h1 class="text-4xl font-bold text-blue-700 mb-2 flex items-center gap-3">
              🤖 Robot Tech Factory
            </h1>
            <p class="text-blue-600">ロボット博士と一緒に音のブレンド技術を学ぼう！</p>
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
                  : 'linear-gradient(90deg, #3B82F6, #1D4ED8)'
              }"
            ></div>
          </div>
          <div v-if="isInvestmentUnlocked" class="text-center mt-2">
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
              🚀 Robot Tech Planet への投資が解禁されました！
            </span>
          </div>
        </div>
      </div>

      <!-- ゲーム説明（Robot Planet特化） -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="text-6xl">🤖</div>
          <div>
            <h2 class="text-2xl font-bold text-blue-700">ロボット博士からのメッセージ</h2>
            <p class="text-blue-600">
              こんにちは！ロボットテック・ファクトリーへようこそ！<br>
              音素をブレンドして新しいロボット部品を作りましょう。<br>
              上手にできると、私たちの技術企業に投資することができるようになります！
            </p>
          </div>
        </div>
        
        <!-- Robot Planet投資情報 -->
        <div v-if="isInvestmentUnlocked" class="bg-green-50 rounded-2xl p-4 mt-4">
          <div class="text-center">
            <div class="text-lg font-bold text-green-800 mb-2">🏢 Robot Tech Planet 投資情報</div>
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
        <!-- Blending Builder Game ロジック（既存をRobotテーマで拡張） -->
        <div v-if="gameState === 'playing'" class="text-center">
          <!-- ゲーム統計表示 -->
          <div class="mb-6">
            <div class="text-2xl font-bold text-blue-700 mb-4">
              🤖 ロボット部品を作ろう！ (レベル {{ currentLevel }})
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="bg-blue-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-blue-700">{{ score }}</div>
                <div class="text-blue-600">スコア</div>
              </div>
              <div class="bg-yellow-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-yellow-700">{{ lives }}</div>
                <div class="text-yellow-600">ライフ</div>
              </div>
              <div class="bg-purple-50 rounded-2xl p-4">
                <div class="text-2xl font-bold text-purple-700">{{ combo }}</div>
                <div class="text-purple-600">コンボ</div>
              </div>
            </div>
          </div>

          <!-- 現在の単語表示 -->
          <div class="mb-6">
            <div class="text-lg font-bold text-blue-700 mb-4">
              作成中: {{ currentWord.word }}
            </div>
            
            <!-- 選択した音素表示 -->
            <div class="flex justify-center gap-2 mb-6">
              <div
                v-for="(sound, index) in selectedSounds"
                :key="index"
                @click="removeSoundFromSelection(index)"
                class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
                :style="{ background: getRobotSoundColor(sound) }"
              >
                {{ sound || '?' }}
              </div>
            </div>
          </div>

          <!-- 利用可能音素 -->
          <div class="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            <button
              v-for="sound in availableSounds"
              :key="sound"
              @click="selectSound(sound)"
              :disabled="selectedSounds.length >= currentWord.sounds.length"
              class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
              :style="{ background: getRobotSoundColor(sound) }"
            >
              {{ sound }}
            </button>
          </div>

          <!-- 音再生・チェックボタン -->
          <div class="space-y-3">
            <button
              @click="playTargetSound"
              :disabled="isPlaying"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-all duration-200"
            >
              🔊 {{ isPlaying ? '再生中...' : 'ターゲット音を聞く' }}
            </button>
            
            <button
              @click="checkBlend"
              :disabled="selectedSounds.length !== currentWord.sounds.length || selectedSounds.includes('')"
              class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-all duration-200"
            >
              🤖 ロボット部品を完成させる
            </button>
          </div>
        </div>

        <!-- ゲーム開始画面 -->
        <div v-else-if="gameState === 'start'" class="text-center py-12">
          <div class="text-8xl mb-6">🤖</div>
          <h2 class="text-3xl font-bold text-blue-700 mb-4">Robot Tech Factory</h2>
          <p class="text-blue-600 mb-8 max-w-lg mx-auto">
            ロボット博士と一緒に音素をブレンドして、最先端のロボット部品を作りましょう！<br>
            正確にブレンドできると、ロボット技術企業への投資が可能になります。
          </p>
          
          <!-- 難易度選択 -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-blue-700 mb-3">🎯 技術レベルを選択</label>
            <select v-model="selectedDifficulty" class="bg-white border-2 border-blue-300 rounded-xl px-4 py-2 font-bold text-blue-700">
              <option value="easy">🔧 初級技術者 (簡単なブレンド)</option>
              <option value="medium">⚙️ 中級技術者 (基本ブレンド)</option>
              <option value="hard">🚀 上級技術者 (複雑なブレンド)</option>
            </select>
          </div>
          
          <button
            @click="startGame"
            class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform hover:scale-105"
          >
            🚀 ロボット開発開始！
          </button>
        </div>

        <!-- 結果画面 -->
        <div v-else-if="gameState === 'complete'" class="text-center py-12">
          <div class="text-8xl mb-6">🏆</div>
          <h2 class="text-3xl font-bold text-blue-700 mb-4">素晴らしいロボット開発でした！</h2>
          
          <!-- 結果統計 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-blue-50 rounded-2xl p-6">
              <div class="text-3xl font-bold text-blue-700">{{ gameResult.score }}</div>
              <div class="text-blue-600">作成部品数</div>
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
              優秀な技術開発成果です！Robot Tech Planet への投資が可能になりました。
              最先端のロボット技術企業を応援して、毎日のリターンを受け取りませんか？
            </p>
            <button
              @click="openInvestmentModal"
              class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200"
            >
              🏢 Robot Tech Planet に投資する
            </button>
          </div>

          <!-- アクションボタン -->
          <div class="space-y-3">
            <button
              @click="playAgain"
              class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              🔄 もう一度開発する
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
  name: 'BlendingBuilderGameRobot',
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
    const currentLevel = ref(1)
    const selectedSounds = ref([])
    const availableSounds = ref([])
    const score = ref(0)
    const lives = ref(3)
    const combo = ref(0)
    const isPlaying = ref(false)
    const showFeedback = ref(false)
    const feedbackData = ref({})
    const gameResult = ref({
      score: 0,
      accuracy: 0,
      maxCombo: 0,
      correctAnswers: 0,
      totalQuestions: 10
    })
    
    // Robot専用パーティクル
    const robotParticles = ref([])
    
    // ブレンディングワードデータ（Robot テーマ）
    const blendingWords = {
      easy: [
        { word: 'cat', sounds: ['c', 'at'], hint: 'ニャーと鳴く動物' },
        { word: 'bat', sounds: ['b', 'at'], hint: '野球で使う道具' },
        { word: 'hat', sounds: ['h', 'at'], hint: '頭にかぶるもの' },
        { word: 'mat', sounds: ['m', 'at'], hint: '床に敷くもの' },
        { word: 'rat', sounds: ['r', 'at'], hint: '小さなネズミ' }
      ],
      medium: [
        { word: 'plant', sounds: ['pl', 'ant'], hint: '緑の植物' },
        { word: 'stand', sounds: ['st', 'and'], hint: '立つという意味' },
        { word: 'brand', sounds: ['br', 'and'], hint: 'ブランド名' },
        { word: 'grand', sounds: ['gr', 'and'], hint: '素晴らしい' },
        { word: 'blend', sounds: ['bl', 'end'], hint: '混ぜること' }
      ],
      hard: [
        { word: 'splash', sounds: ['spl', 'ash'], hint: '水がはねる音' },
        { word: 'string', sounds: ['str', 'ing'], hint: 'ひも、糸' },
        { word: 'spring', sounds: ['spr', 'ing'], hint: '春、ばね' },
        { word: 'strong', sounds: ['str', 'ong'], hint: '強い' },
        { word: 'throw', sounds: ['thr', 'ow'], hint: '投げる' }
      ]
    }
    
    // === 計算プロパティ ===
    const planetData = computed(() => galaxyStore.planetCorporations['robot-planet'])
    const unlockStatus = computed(() => galaxyStore.planetUnlockStatus['robot-planet'])
    const learningProgress = computed(() => unlockStatus.value?.progress || 0)
    const requiredProgress = computed(() => unlockStatus.value?.required || 40)
    const isInvestmentUnlocked = computed(() => unlockStatus.value?.unlocked || false)
    const investmentTiers = computed(() => planetData.value?.investmentTiers || [])
    
    const investmentStatus = computed(() => {
      if (isInvestmentUnlocked.value) {
        return {
          label: '投資可能',
          description: 'ロボット技術を応援'
        }
      } else {
        return {
          label: '学習中',
          description: `${requiredProgress.value}%必要`
        }
      }
    })
    
    const currentWord = computed(() => {
      const words = blendingWords[selectedDifficulty.value]
      return words[0] // 簡単にするため最初の単語を使用
    })
    
    // === メソッド ===
    
    /**
     * Robot パーティクルの生成
     */
    const generateRobotParticles = () => {
      robotParticles.value = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2
      }))
    }
    
    /**
     * Robot テーマの音素色
     */
    const getRobotSoundColor = (sound) => {
      const colors = {
        'c': 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        'b': 'linear-gradient(135deg, #06B6D4, #0891B2)',
        'h': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        'm': 'linear-gradient(135deg, #10B981, #059669)',
        'r': 'linear-gradient(135deg, #F59E0B, #D97706)'
      }
      
      return colors[sound] || 'linear-gradient(135deg, #6B7280, #4B5563)'
    }
    
    /**
     * ゲーム開始
     */
    const startGame = () => {
      gameState.value = 'playing'
      currentLevel.value = 1
      selectedSounds.value = []
      score.value = 0
      lives.value = 3
      combo.value = 0
      gameResult.value = {
        score: 0,
        accuracy: 0,
        maxCombo: 0,
        correctAnswers: 0,
        totalQuestions: 5
      }
      
      generateAvailableSounds()
      logger.log('🤖 Robot Planet Blending Game 開始')
    }
    
    /**
     * 使用可能音素の生成
     */
    const generateAvailableSounds = () => {
      const word = currentWord.value
      const correctSounds = word.sounds
      const extraSounds = ['d', 'f', 'g', 'k', 'l', 'n', 'p', 's', 't', 'w']
      
      const randomExtras = extraSounds
        .filter(s => !correctSounds.includes(s))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
      
      availableSounds.value = [...correctSounds, ...randomExtras]
        .sort(() => Math.random() - 0.5)
    }
    
    /**
     * 音素選択
     */
    const selectSound = (sound) => {
      if (selectedSounds.value.length < currentWord.value.sounds.length) {
        selectedSounds.value.push(sound)
      }
    }
    
    /**
     * 音素削除
     */
    const removeSoundFromSelection = (index) => {
      selectedSounds.value.splice(index, 1)
    }
    
    /**
     * ターゲット音再生
     */
    const playTargetSound = () => {
      if (isPlaying.value) return
      
      isPlaying.value = true
      setTimeout(() => {
        isPlaying.value = false
      }, 1500)
      
      logger.log(`🔊 再生中: ${currentWord.value.word}`)
    }
    
    /**
     * ブレンドチェック
     */
    const checkBlend = () => {
      const userBlend = selectedSounds.value.join('')
      const correctBlend = currentWord.value.sounds.join('')
      const isCorrect = userBlend === correctBlend
      
      // フィードバック表示
      showFeedback.value = true
      feedbackData.value = {
        emoji: isCorrect ? '🎉' : '😔',
        title: isCorrect ? '完璧な部品！' : '惜しい！',
        message: isCorrect ? 
          `素晴らしい！「${currentWord.value.word}」部品を作成しました！` : 
          `正解は「${correctBlend}」でした。もう一度挑戦！`,
        textColor: isCorrect ? 'text-green-600' : 'text-red-600'
      }
      
      // 結果記録
      if (isCorrect) {
        score.value += 200
        combo.value++
        gameResult.value.correctAnswers++
      } else {
        combo.value = 0
        lives.value--
      }
      
      // フィードバック自動非表示
      setTimeout(() => {
        showFeedback.value = false
        if (lives.value <= 0 || gameResult.value.correctAnswers >= 5) {
          completeGame()
        } else {
          selectedSounds.value = []
          generateAvailableSounds()
        }
      }, 2000)
    }
    
    /**
     * ゲーム完了
     */
    const completeGame = () => {
      // 結果計算
      gameResult.value.score = score.value
      gameResult.value.accuracy = Math.round(
        (gameResult.value.correctAnswers / gameResult.value.totalQuestions) * 100
      )
      gameResult.value.maxCombo = combo.value
      
      // Galaxy Trading データ更新
      const progress = Math.min(100, gameResult.value.accuracy)
      gameStore.updateGameProgress('blendingBuilder', {
        progress: progress,
        bestScore: gameResult.value.score,
        accuracy: gameResult.value.accuracy,
        completed: progress >= 70,
        lastPlayed: new Date().toISOString()
      })
      
      // Galaxy Trading 学習効果記録
      gameStore.recordGalaxyTradingLearning(
        'robot-planet',
        '音素ブレンド技術',
        gameResult.value.score
      )
      
      gameState.value = 'complete'
      
      // Galaxy Game Completed イベント発火
      window.dispatchEvent(new CustomEvent('galaxy-game-completed', {
        detail: {
          gameType: 'blendingBuilder',
          planetId: 'robot-planet',
          ...gameResult.value,
          completed: gameResult.value.accuracy >= 70
        }
      }))
      
      logger.log('🏆 Robot Planet Blending Game 完了:', gameResult.value)
    }
    
    /**
     * 投資モーダルを開く
     */
    const openInvestmentModal = () => {
      router.push({
        path: '/galaxy-trading',
        query: {
          planet: 'robot-planet',
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
      logger.log('🤖 Robot Planet Blending Game 初期化')
      generateRobotParticles()
      
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
      currentLevel,
      selectedSounds,
      availableSounds,
      score,
      lives,
      combo,
      isPlaying,
      showFeedback,
      feedbackData,
      gameResult,
      robotParticles,
      
      // Computed
      planetData,
      learningProgress,
      requiredProgress,
      isInvestmentUnlocked,
      investmentTiers,
      investmentStatus,
      currentWord,
      
      // Methods
      getRobotSoundColor,
      startGame,
      selectSound,
      removeSoundFromSelection,
      playTargetSound,
      checkBlend,
      openInvestmentModal,
      playAgain,
      goToGalaxyHub,
      handleBack
    }
  }
}
</script>

<style scoped>
.blending-builder-robot {
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

.robot-background {
  background: 
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.3) 0%, transparent 50%);
}

/* ロボットパーティクルアニメーション */
.animate-pulse {
  animation: robotPulse 3s ease-in-out infinite;
}

@keyframes robotPulse {
  0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.6; transform: scale(1.1) rotate(5deg); }
}

/* 音素ボタンのホバーエフェクト */
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
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
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