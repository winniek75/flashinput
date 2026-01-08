<template>
  <div class="basic-dice-roller bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
    <!-- ヘッダー -->
    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
      🎲 惑星探索サイコロ
      <span class="text-sm font-normal text-white/60">(基本版)</span>
    </h3>

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
      
      <!-- 結果表示 -->
      <div v-if="currentResult" class="result-display bg-white/5 rounded-xl p-4">
        <div class="text-sm text-white/90 mb-2">🎯 サイコロの結果: {{ currentResult }}</div>
        <div class="text-xs text-white/70">{{ getResultMessage(currentResult) }}</div>
      </div>

      <!-- サイコロボタン -->
      <button
        @click="rollDice"
        :disabled="isRolling"
        class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
      >
        {{ isRolling ? '🎲 転がし中...' : '🎯 サイコロを振る' }}
      </button>
    </div>

    <!-- 最近の履歴 -->
    <div v-if="rollHistory.length > 0" class="mt-6 pt-4 border-t border-white/10">
      <div class="text-sm text-white/80 mb-2">📊 最近の結果:</div>
      <div class="flex justify-center gap-1 flex-wrap">
        <span 
          v-for="(roll, index) in rollHistory.slice(-6)"
          :key="index"
          class="w-8 h-8 bg-white/10 rounded text-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-all duration-200"
          :title="`${new Date(roll.timestamp).toLocaleTimeString()}: ${roll.result}`"
        >
          {{ roll.result }}
        </span>
      </div>
    </div>

    <!-- 基本統計 -->
    <div v-if="rollHistory.length >= 3" class="mt-4 grid grid-cols-2 gap-2 text-center">
      <div class="bg-white/5 rounded-lg p-2">
        <div class="text-lg font-bold text-yellow-300">{{ totalRolls }}</div>
        <div class="text-xs text-white/60">総回数</div>
      </div>
      <div class="bg-white/5 rounded-lg p-2">
        <div class="text-lg font-bold text-blue-300">{{ averageRoll.toFixed(1) }}</div>
        <div class="text-xs text-white/60">平均値</div>
      </div>
    </div>

    <!-- 基本的な説明 -->
    <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <div class="text-sm text-blue-200">
        <div class="font-bold mb-1">🎲 基本サイコロの使い方</div>
        <div class="text-xs">
          • 1-2: Apple Planet 関連活動<br>
          • 3-4: Robot Planet 関連活動<br>
          • 5-6: Grammar Moon 関連活動
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'

export default {
  name: 'BasicDiceRoller',
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    
    // === 状態管理 ===
    const isRolling = ref(false)
    const currentResult = ref(null)
    const displayValue = ref('🎲')
    const rollHistory = ref([])
    
    // === 計算プロパティ ===
    const totalRolls = computed(() => rollHistory.value.length)
    
    const averageRoll = computed(() => {
      if (rollHistory.value.length === 0) return 0
      const sum = rollHistory.value.reduce((total, roll) => total + roll.result, 0)
      return sum / rollHistory.value.length
    })
    
    // === メソッド ===
    
    /**
     * サイコロを振る
     */
    const rollDice = async () => {
      if (isRolling.value) return
      
      isRolling.value = true
      
      // アニメーション効果
      for (let i = 0; i < 8; i++) {
        displayValue.value = Math.floor(Math.random() * 6) + 1
        await new Promise(resolve => setTimeout(resolve, 120))
      }
      
      // 最終結果の取得（Galaxy Store経由）
      const finalResult = galaxyStore.rollBasicDice()
      currentResult.value = finalResult
      displayValue.value = finalResult
      
      // 履歴に追加
      const rollData = {
        result: finalResult,
        timestamp: new Date().toISOString()
      }
      
      rollHistory.value.push(rollData)
      
      // 履歴の管理（最新20回分保持）
      if (rollHistory.value.length > 20) {
        rollHistory.value = rollHistory.value.slice(-20)
      }
      
      isRolling.value = false
      
      logger.log(`🎲 サイコロ結果: ${finalResult}`)
    }
    
    /**
     * 結果メッセージの取得
     */
    const getResultMessage = (result) => {
      const messages = {
        1: 'Apple Planet でりんご農園を体験しませんか？',
        2: 'Apple Planet の投資機会をチェックしてみましょう！',
        3: 'Robot Planet でロボット技術を学んでみませんか？',
        4: 'Robot Planet の製造業投資を検討してみましょう！',
        5: 'Grammar Moon で言語スキルを向上させませんか？',
        6: 'Grammar Moon の教育事業投資を検討してみましょう！'
      }
      
      return messages[result] || 'ギャラクシーを探索しましょう！'
    }
    
    return {
      // State
      isRolling,
      currentResult,
      displayValue,
      rollHistory,
      
      // Computed
      totalRolls,
      averageRoll,
      
      // Methods
      rollDice,
      getResultMessage
    }
  }
}
</script>

<style scoped>
.basic-dice-roller {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

.result-display {
  animation: slideInDown 0.4s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 履歴アイテムのホバー効果 */
.flex.gap-1 span:hover {
  transform: scale(1.2);
  background: rgba(255, 255, 255, 0.3);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .dice {
    width: 4rem;
    height: 4rem;
    font-size: 1.5rem;
  }
  
  .grid-cols-2 {
    gap: 0.5rem;
  }
}
</style>