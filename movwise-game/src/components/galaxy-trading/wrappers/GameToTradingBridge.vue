<template>
  <div class="galaxy-trading-bridge">
    <!-- 既存ゲームコンポーネントをそのまま表示 -->
    <slot />
    
    <!-- Galaxy Trading統合オーバーレイ -->
    <div v-if="showTradingOverlay" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center">
          <!-- 惑星テーマヘッダー -->
          <div class="text-6xl mb-4">{{ planetData.emoji }}</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ planetData.name }}</h3>
          <p class="text-gray-600 mb-6">{{ planetData.theme }}での学習が完了しました！</p>
          
          <!-- 学習成果 -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
            <div class="text-lg font-bold text-gray-800 mb-2">🎓 学習成果</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>正解率:</span>
                <span class="font-bold">{{ gameResult.accuracy }}%</span>
              </div>
              <div class="flex justify-between">
                <span>獲得ポイント:</span>
                <span class="font-bold">{{ gameResult.score }}</span>
              </div>
              <div class="flex justify-between">
                <span>習得レベル:</span>
                <span class="font-bold">{{ getLearningLevel() }}</span>
              </div>
            </div>
          </div>
          
          <!-- 投資解禁通知 -->
          <div v-if="isInvestmentUnlocked" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
            <div class="text-lg font-bold text-green-800 mb-2">🚀 投資機会解禁！</div>
            <p class="text-green-700 text-sm mb-3">
              この惑星企業への投資が可能になりました。お気に入りのお店を応援してみませんか？
            </p>
            <div class="text-xs text-green-600">
              💡 投資は応援の気持ちです。リターンで更なる学習が可能になります。
            </div>
          </div>
          
          <!-- アクションボタン -->
          <div class="space-y-3">
            <button
              v-if="isInvestmentUnlocked"
              @click="openInvestmentView"
              class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🏢 {{ planetData.name }}に投資する
            </button>
            
            <button
              @click="continueToHub"
              class="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🌌 ギャラクシーハブに戻る
            </button>
            
            <button
              @click="playAgain"
              class="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              🔄 もう一度プレイ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore.js'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'

export default {
  name: 'GameToTradingBridge',
  props: {
    planetId: {
      type: String,
      required: true
    },
    gameType: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const gameStore = useGameStore()
    const galaxyStore = useGalaxyTradingStore()
    
    // === 状態管理 ===
    const showTradingOverlay = ref(false)
    const gameResult = ref({})
    const isInitialized = ref(false)
    
    // === 計算プロパティ ===
    const planetData = computed(() => {
      return galaxyStore.planetCorporations[props.planetId] || {}
    })
    
    const isInvestmentUnlocked = computed(() => {
      const unlockStatus = galaxyStore.planetUnlockStatus[props.planetId]
      return unlockStatus?.unlocked || false
    })
    
    const learningProgress = computed(() => {
      const progress = galaxyStore.learningProgress
      switch (props.gameType) {
        case 'cvcWord':
          return progress.cvcWord
        case 'blendingBuilder':
          return progress.blendingBuilder
        case 'grammar':
          return progress.grammar
        default:
          return { progress: 0, bestScore: 0 }
      }
    })
    
    // === メソッド ===
    
    /**
     * ゲーム完了イベントの監視
     */
    const handleGameCompletion = (event) => {
      logger.log('🎮 ゲーム完了イベント受信:', event.detail)
      
      const result = event.detail
      gameResult.value = {
        score: result.score || result.bestScore || 0,
        accuracy: result.accuracy || 0,
        timeSpent: result.timeSpent || 0,
        level: result.level || 1,
        completed: result.completed || false
      }
      
      // Galaxy Tradingの学習効果を記録
      recordLearningEffect(result)
      
      // オーバーレイ表示
      showTradingOverlay.value = true
    }
    
    /**
     * 学習効果の記録
     */
    const recordLearningEffect = (result) => {
      try {
        // 既存gameStoreに記録
        gameStore.updateGameProgress(props.gameType, {
          bestScore: result.score || result.bestScore || 0,
          accuracy: result.accuracy || 0,
          completed: result.completed || false,
          lastPlayed: new Date().toISOString()
        })
        
        // Galaxy Trading学習効果を記録
        const educationalConcept = getEducationalConcept(result)
        gameStore.recordGalaxyTradingLearning(
          props.planetId,
          educationalConcept,
          result.score || 0
        )
        
        logger.log(`📊 学習効果記録: ${props.planetId} - ${educationalConcept}`)
      } catch (error) {
        logger.error('❌ 学習効果記録エラー:', error)
      }
    }
    
    /**
     * 学習結果から教育概念を取得
     */
    const getEducationalConcept = (result) => {
      const accuracy = result.accuracy || 0
      
      if (accuracy >= 90) return '完全理解達成'
      if (accuracy >= 80) return '高度理解達成'
      if (accuracy >= 70) return '基本理解達成'
      if (accuracy >= 60) return '初歩理解達成'
      return '学習体験完了'
    }
    
    /**
     * 学習レベルの取得
     */
    const getLearningLevel = () => {
      const accuracy = gameResult.value.accuracy || 0
      
      if (accuracy >= 95) return '🌟 マスター'
      if (accuracy >= 85) return '🔥 エキスパート'
      if (accuracy >= 75) return '⭐ アドバンス'
      if (accuracy >= 65) return '💪 インターミディエイト'
      return '🌱 ビギナー'
    }
    
    /**
     * 投資画面を開く
     */
    const openInvestmentView = () => {
      showTradingOverlay.value = false
      router.push({
        path: '/galaxy-trading',
        query: {
          planet: props.planetId,
          action: 'invest'
        }
      })
    }
    
    /**
     * ハブに戻る
     */
    const continueToHub = () => {
      showTradingOverlay.value = false
      router.push('/galaxy-trading')
    }
    
    /**
     * ゲーム再プレイ
     */
    const playAgain = () => {
      showTradingOverlay.value = false
      // ゲームコンポーネントのリセットイベントを発火
      window.dispatchEvent(new CustomEvent('galaxy-game-restart'))
    }
    
    /**
     * 初期化
     */
    const initialize = () => {
      if (isInitialized.value) return
      
      // Galaxy Trading システムが有効でない場合は何もしない
      if (!galaxyStore.isEnabled) {
        logger.log('⚠️ Galaxy Trading システムが無効です')
        return
      }
      
      logger.log(`🌟 Galaxy Trading Bridge 初期化: ${props.planetId} - ${props.gameType}`)
      isInitialized.value = true
    }
    
    /**
     * クリーンアップ
     */
    const cleanup = () => {
      showTradingOverlay.value = false
      window.removeEventListener('galaxy-game-completed', handleGameCompletion)
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      initialize()
      
      // ゲーム完了イベントの監視開始
      window.addEventListener('galaxy-game-completed', handleGameCompletion)
      
      // 既存ゲームにGalaxy Trading Bridge の存在を通知
      window.dispatchEvent(new CustomEvent('galaxy-bridge-ready', {
        detail: {
          planetId: props.planetId,
          gameType: props.gameType,
          bridgeVersion: '1.0.0'
        }
      }))
    })
    
    onUnmounted(() => {
      cleanup()
    })
    
    return {
      // State
      showTradingOverlay,
      gameResult,
      
      // Computed
      planetData,
      isInvestmentUnlocked,
      learningProgress,
      
      // Methods
      getLearningLevel,
      openInvestmentView,
      continueToHub,
      playAgain
    }
  }
}
</script>

<style scoped>
.galaxy-trading-bridge {
  position: relative;
  width: 100%;
  height: 100%;
}

/* フェードインアニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.galaxy-trading-bridge .fixed {
  animation: fadeIn 0.3s ease-out;
}

/* ボタンホバーエフェクト */
.galaxy-trading-bridge button:hover {
  transform: translateY(-1px);
}

/* グラデーション背景 */
.galaxy-trading-bridge .bg-gradient-to-r {
  transition: all 0.2s ease;
}
</style>