<template>
  <div class="smart-dice-roller bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-white flex items-center gap-2">
        🎲 学習ガイド付きサイコロ
      </h3>
      
      <!-- ガイドモード切り替え -->
      <button
        @click="toggleGuidanceMode"
        class="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition-all duration-200"
        :class="{ 'bg-yellow-500/30': isGuidanceEnabled }"
      >
        {{ isGuidanceEnabled ? '🧭 ガイド中' : '🎯 フリー' }}
      </button>
    </div>

    <!-- メインサイコロエリア -->
    <div class="text-center space-y-4">
      <!-- サイコロ本体 -->
      <div 
        @click="rollDice"
        class="dice-container w-20 h-20 mx-auto cursor-pointer"
        :class="{ 'rolling': isRolling }"
      >
        <div class="dice bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-2xl hover:scale-110 transition-all duration-200">
          {{ displayValue }}
        </div>
      </div>
      
      <!-- 学習ガイダンス表示 -->
      <div v-if="currentGuidance" class="guidance-panel bg-white/5 rounded-xl p-4 border border-white/10">
        <div class="text-sm text-white/90 mb-2 flex items-center gap-2">
          <span class="text-lg">{{ currentGuidance.icon }}</span>
          <span class="font-bold">{{ currentGuidance.title }}</span>
        </div>
        <div class="text-xs text-white/70 mb-3">{{ currentGuidance.message }}</div>
        
        <!-- 推奨アクション -->
        <div class="space-y-2">
          <button
            v-for="action in currentGuidance.actions"
            :key="action.id"
            @click="executeAction(action)"
            class="w-full bg-gradient-to-r text-white py-2 rounded-lg font-bold text-sm hover:shadow-lg transition-all duration-200"
            :style="{ background: action.color }"
          >
            {{ action.icon }} {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- 基本的な惑星選択（ガイドなし時） -->
      <div v-else-if="currentDiceResult && !isGuidanceEnabled" class="planet-options space-y-2">
        <div class="text-sm text-white/90 mb-2">🌟 選択可能な惑星:</div>
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="planet in availablePlanetsForResult"
            :key="planet.id"
            @click="selectPlanet(planet)"
            class="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {{ planet.emoji }} {{ planet.name }}
          </button>
        </div>
      </div>

      <!-- サイコロボタン -->
      <button
        @click="rollDice"
        :disabled="isRolling"
        class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
      >
        {{ isRolling ? '🎲 転がし中...' : (currentDiceResult ? '🔄 もう一度振る' : '🎯 サイコロを振る') }}
      </button>
    </div>

    <!-- 統計・履歴エリア -->
    <div class="mt-6 pt-4 border-t border-white/10">
      <!-- 最近の結果 -->
      <div v-if="diceHistory.length > 0" class="mb-4">
        <div class="text-sm text-white/80 mb-2">📊 最近の結果:</div>
        <div class="flex justify-center gap-1 flex-wrap">
          <span 
            v-for="(result, index) in diceHistory.slice(-8)"
            :key="index"
            class="w-8 h-8 bg-white/10 rounded text-xs flex items-center justify-center text-white/80 hover:bg-white/20 transition-all duration-200"
            :title="`${index + 1}回前: ${result.result}`"
          >
            {{ result.result }}
          </span>
        </div>
      </div>

      <!-- 学習統計 -->
      <div v-if="learningStats" class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-white/5 rounded-lg p-2">
          <div class="text-lg font-bold text-green-300">{{ learningStats.completionRate }}%</div>
          <div class="text-xs text-white/60">学習完了率</div>
        </div>
        <div class="bg-white/5 rounded-lg p-2">
          <div class="text-lg font-bold text-blue-300">{{ learningStats.weakestArea }}</div>
          <div class="text-xs text-white/60">強化推奨</div>
        </div>
        <div class="bg-white/5 rounded-lg p-2">
          <div class="text-lg font-bold text-purple-300">{{ learningStats.nextGoal }}</div>
          <div class="text-xs text-white/60">次の目標</div>
        </div>
      </div>
    </div>

    <!-- 緊急学習ガイド -->
    <div v-if="emergencyGuidance" class="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">⚠️</span>
        <span class="font-bold text-red-300">学習サポートが必要です</span>
      </div>
      <div class="text-sm text-red-200 mb-3">{{ emergencyGuidance.message }}</div>
      <button
        @click="acceptEmergencyGuidance"
        class="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all duration-200"
      >
        🚨 学習サポートを受ける
      </button>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import { createLearningAnalytics, createSmartRecommendationEngine } from '@/utils/learningAnalytics.js'

export default {
  name: 'SmartDiceRoller',
  setup() {
    const router = useRouter()
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // Phase 2: Advanced Analytics
    const analytics = createLearningAnalytics(gameStore, galaxyStore)
    const recommendationEngine = createSmartRecommendationEngine(analytics)
    
    // === 状態管理 ===
    const isRolling = ref(false)
    const currentDiceResult = ref(null)
    const displayValue = ref('🎲')
    const isGuidanceEnabled = ref(false) // Phase 2で true に変更予定
    const currentGuidance = ref(null)
    const emergencyGuidance = ref(null)
    const diceHistory = ref([])
    
    // === 計算プロパティ ===
    const learningProgress = computed(() => galaxyStore.learningProgress)
    const planetUnlockStatus = computed(() => galaxyStore.planetUnlockStatus)
    const availablePlanets = computed(() => galaxyStore.availablePlanets)
    
    const availablePlanetsForResult = computed(() => {
      if (!currentDiceResult.value) return []
      
      // サイコロの結果に基づいて惑星を選択（基本版）
      const planets = availablePlanets.value
      const result = currentDiceResult.value
      
      // 1-2: Apple Planet, 3-4: Robot Planet, 5-6: Grammar Moon
      if (result <= 2) {
        return planets.filter(p => p.id === 'apple-planet')
      } else if (result <= 4) {
        return planets.filter(p => p.id === 'robot-planet')
      } else {
        return planets.filter(p => p.id === 'grammar-moon')
      }
    })
    
    const learningStats = computed(() => {
      const progress = learningProgress.value
      const totalProgress = Object.values(progress).reduce((sum, p) => sum + (p.progress || 0), 0)
      const averageProgress = totalProgress / Object.keys(progress).length
      
      // 最も進捗の低い分野を特定
      const weakestGame = Object.entries(progress).reduce((weakest, [game, data]) => {
        return (data.progress || 0) < (weakest.progress || 0) ? { game, progress: data.progress || 0 } : weakest
      }, { game: 'none', progress: 100 })
      
      const gameLabels = {
        cvcWord: 'CVC',
        blendingBuilder: 'Blending',
        grammar: 'Grammar'
      }
      
      return {
        completionRate: Math.round(averageProgress),
        weakestArea: gameLabels[weakestGame.game] || 'バランス良好',
        nextGoal: averageProgress < 50 ? '基礎固め' : averageProgress < 80 ? '応用力向上' : '完全制覇'
      }
    })
    
    // === メソッド ===
    
    /**
     * サイコロを振る
     */
    const rollDice = async () => {
      if (isRolling.value) return
      
      isRolling.value = true
      currentGuidance.value = null
      
      // アニメーション効果
      for (let i = 0; i < 10; i++) {
        displayValue.value = Math.floor(Math.random() * 6) + 1
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 最終結果の取得
      const finalResult = galaxyStore.rollBasicDice()
      currentDiceResult.value = finalResult
      displayValue.value = finalResult
      
      // 履歴に追加
      const rollData = {
        result: finalResult,
        timestamp: new Date().toISOString(),
        guidance: null
      }
      
      diceHistory.value.push(rollData)
      
      // 履歴の管理（最新20回分保持）
      if (diceHistory.value.length > 20) {
        diceHistory.value = diceHistory.value.slice(-20)
      }
      
      // ガイダンス生成
      if (isGuidanceEnabled.value) {
        generateSmartGuidance(finalResult)
      }
      
      // 緊急ガイダンスチェック
      checkEmergencyGuidance()
      
      isRolling.value = false
    }
    
    /**
     * スマートガイダンスの生成（Phase 2機能のプレビュー）
     */
    const generateSmartGuidance = (diceResult) => {
      const progress = learningProgress.value
      const unlockStatus = planetUnlockStatus.value
      
      // 学習状況分析
      const needsPhonicsWork = (progress.cvcWord?.progress || 0) < 60
      const needsBlendingWork = (progress.blendingBuilder?.progress || 0) < 60
      const needsGrammarWork = (progress.grammar?.progress || 0) < 60
      
      let guidance = null
      
      if (needsPhonicsWork && diceResult <= 2) {
        guidance = {
          icon: '🍎',
          title: 'Apple Planet 集中学習推奨',
          message: 'CVC Word の習得率が60%未満です。基礎固めに集中しましょう！',
          actions: [
            {
              id: 'apple-focus',
              icon: '📚',
              label: 'Apple Planet で学習開始',
              color: 'linear-gradient(90deg, #FF6B6B, #FF8E8E)',
              action: 'learn',
              target: 'apple-planet'
            },
            {
              id: 'cvc-practice',
              icon: '🎯',
              label: 'CVC Word 練習',
              color: 'linear-gradient(90deg, #4ECDC4, #6EE2D9)',
              action: 'game',
              target: 'cvcWord'
            }
          ]
        }
      } else if (needsBlendingWork && diceResult <= 4) {
        guidance = {
          icon: '🤖',
          title: 'Robot Planet 技術向上推奨',
          message: 'Blending Builder の習得率向上が推奨されます。',
          actions: [
            {
              id: 'robot-focus',
              icon: '🔧',
              label: 'Robot Planet で学習',
              color: 'linear-gradient(90deg, #4ECDC4, #6EE2D9)',
              action: 'learn',
              target: 'robot-planet'
            }
          ]
        }
      } else {
        // バランス良好時の推奨
        guidance = {
          icon: '⭐',
          title: '学習進捗良好！',
          message: '素晴らしい進歩です。投資や VR 体験を検討してみましょう。',
          actions: [
            {
              id: 'explore-investment',
              icon: '💰',
              label: '投資機会を探す',
              color: 'linear-gradient(90deg, #10B981, #059669)',
              action: 'explore',
              target: 'investment'
            }
          ]
        }
      }
      
      currentGuidance.value = guidance
    }
    
    /**
     * 緊急ガイダンスのチェック
     */
    const checkEmergencyGuidance = () => {
      const progress = learningProgress.value
      const avgProgress = Object.values(progress).reduce((sum, p) => sum + (p.progress || 0), 0) / Object.keys(progress).length
      
      // 学習進捗が著しく低い場合
      if (avgProgress < 20) {
        emergencyGuidance.value = {
          message: '学習進捗が20%未満です。基礎学習から始めることをお勧めします。',
          action: 'basic-learning',
          target: 'phonics-adventure'
        }
      } else {
        emergencyGuidance.value = null
      }
    }
    
    /**
     * ガイダンスモードの切り替え
     */
    const toggleGuidanceMode = () => {
      isGuidanceEnabled.value = !isGuidanceEnabled.value
      
      if (isGuidanceEnabled.value && currentDiceResult.value) {
        generateSmartGuidance(currentDiceResult.value)
      } else {
        currentGuidance.value = null
      }
    }
    
    /**
     * アクションの実行
     */
    const executeAction = (action) => {
      switch (action.action) {
        case 'learn':
          goToLearning(action.target)
          break
        case 'game':
          goToGame(action.target)
          break
        case 'explore':
          exploreFeature(action.target)
          break
        default:
          logger.log('アクション実行:', action)
      }
    }
    
    /**
     * 惑星選択
     */
    const selectPlanet = (planet) => {
      router.push({
        path: `/planet/${planet.id}`,
        query: { from: 'dice' }
      })
    }
    
    /**
     * 学習画面への移動
     */
    const goToLearning = (target) => {
      if (target === 'apple-planet') {
        router.push('/apple-planet')
      } else if (target === 'robot-planet') {
        router.push('/robot-planet')
      } else if (target === 'grammar-moon') {
        router.push('/grammar-moon')
      } else {
        router.push('/platforms/phonics-adventure')
      }
    }
    
    /**
     * ゲーム画面への移動
     */
    const goToGame = (gameType) => {
      const gameRoutes = {
        cvcWord: '/games/cvc-word',
        blendingBuilder: '/games/blending-builder',
        grammar: '/grammar-galaxy'
      }
      router.push(gameRoutes[gameType] || '/platforms/phonics-adventure')
    }
    
    /**
     * 機能探索
     */
    const exploreFeature = (feature) => {
      if (feature === 'investment') {
        // 投資可能な惑星がある場合はそちらに、なければダッシュボード
        const available = availablePlanets.value
        if (available.length > 0) {
          selectPlanet(available[0])
        }
      }
    }
    
    /**
     * 緊急ガイダンスの受け入れ
     */
    const acceptEmergencyGuidance = () => {
      if (emergencyGuidance.value) {
        router.push('/platforms/phonics-adventure')
        emergencyGuidance.value = null
      }
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🎲 Smart Dice Roller 初期化')
      
      // 初期学習状況チェック
      checkEmergencyGuidance()
    })
    
    return {
      // State
      isRolling,
      currentDiceResult,
      displayValue,
      isGuidanceEnabled,
      currentGuidance,
      emergencyGuidance,
      diceHistory,
      
      // Computed
      learningProgress,
      availablePlanetsForResult,
      learningStats,
      
      // Methods
      rollDice,
      toggleGuidanceMode,
      executeAction,
      selectPlanet,
      acceptEmergencyGuidance
    }
  }
}
</script>

<style scoped>
.smart-dice-roller {
  animation: slideInRight 0.6s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dice-container.rolling .dice {
  animation: diceRoll 1s ease-in-out;
}

@keyframes diceRoll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1.2); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

.dice:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

.guidance-panel {
  animation: fadeInUp 0.4s ease-out;
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

.planet-options button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

/* 履歴アイテムのアニメーション */
.flex.gap-1 span {
  animation: historyItemPop 0.3s ease-out;
}

@keyframes historyItemPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 緊急ガイダンスの点滅効果 */
.bg-red-500\/20 {
  animation: urgentPulse 2s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .dice {
    width: 4rem;
    height: 4rem;
    font-size: 1.5rem;
  }
  
  .grid-cols-3 {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem;
  }
}
</style>