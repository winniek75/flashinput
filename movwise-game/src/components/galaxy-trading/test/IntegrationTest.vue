<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- テストヘッダー -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">
          🧪 Galaxy Trading Empire 統合テスト
        </h1>
        <p class="text-center text-gray-600">
          Phase 1 Day 1-2: コアデータ統合の動作確認
        </p>
      </div>

      <!-- テスト結果サマリー -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div class="text-center">
            <div class="text-3xl mb-2">{{ testResults.storeIntegration ? '✅' : '❌' }}</div>
            <div class="font-bold text-gray-800">ストア統合</div>
            <div class="text-sm text-gray-600">Galaxy + Game Store</div>
          </div>
        </div>
        
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div class="text-center">
            <div class="text-3xl mb-2">{{ testResults.dataFlow ? '✅' : '❌' }}</div>
            <div class="font-bold text-gray-800">データフロー</div>
            <div class="text-sm text-gray-600">学習 → 投資変換</div>
          </div>
        </div>
        
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div class="text-center">
            <div class="text-3xl mb-2">{{ testResults.energySync ? '✅' : '❌' }}</div>
            <div class="font-bold text-gray-800">エネルギー同期</div>
            <div class="text-sm text-gray-600">CosmicEnergy統合</div>
          </div>
        </div>
      </div>

      <!-- 詳細テスト結果 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 詳細テスト結果</h2>
        
        <div class="space-y-4">
          <!-- 1. ストア初期化テスト -->
          <div class="p-4 rounded-2xl" :class="testResults.storeInit ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ testResults.storeInit ? '✅' : '❌' }}</span>
              <span class="font-bold">1. ストア初期化</span>
            </div>
            <div class="text-sm text-gray-600 pl-8">
              Galaxy Trading Store: {{ galaxyStore.isEnabled ? '有効' : '無効' }}<br>
              バージョン: {{ galaxyStore.version }}<br>
              惑星データ: {{ Object.keys(galaxyStore.planetCorporations).length }}件
            </div>
          </div>

          <!-- 2. 学習進捗連携テスト -->
          <div class="p-4 rounded-2xl" :class="testResults.learningSync ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ testResults.learningSync ? '✅' : '❌' }}</span>
              <span class="font-bold">2. 学習進捗連携</span>
            </div>
            <div class="text-sm text-gray-600 pl-8">
              CVC Word進捗: {{ learningProgress.cvcWord.progress }}%<br>
              Blending進捗: {{ learningProgress.blendingBuilder.progress }}%<br>
              Grammar進捗: {{ learningProgress.grammar.progress }}%
            </div>
          </div>

          <!-- 3. 惑星解禁システムテスト -->
          <div class="p-4 rounded-2xl" :class="testResults.planetUnlock ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ testResults.planetUnlock ? '✅' : '❌' }}</span>
              <span class="font-bold">3. 惑星解禁システム</span>
            </div>
            <div class="text-sm text-gray-600 pl-8 space-y-1">
              <div v-for="(status, planetId) in planetUnlockStatus" :key="planetId">
                {{ planetId }}: {{ status.unlocked ? '🔓 解禁済み' : '🔒 未解禁' }}
                ({{ status.progress }}% / {{ status.required }}%)
              </div>
            </div>
          </div>

          <!-- 4. エネルギー統合テスト -->
          <div class="p-4 rounded-2xl" :class="testResults.energyIntegration ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-2xl">{{ testResults.energyIntegration ? '✅' : '❌' }}</span>
              <span class="font-bold">4. エネルギー統合</span>
            </div>
            <div class="text-sm text-gray-600 pl-8">
              Game Store CosmicEnergy: {{ gameStoreEnergy }}<br>
              Galaxy Store AvailableEnergy: {{ galaxyStore.availableEnergy }}<br>
              同期状態: {{ testResults.energySync ? '同期済み' : '未同期' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 手動テストエリア -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">🔧 手動テスト</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 投資テスト -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800">💰 投資機能テスト</h3>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">テスト投資</label>
              <select v-model="testInvestment.planetId" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">惑星を選択</option>
                <option v-for="planet in availablePlanets" :key="planet.id" :value="planet.id">
                  {{ planet.name }} ({{ planet.unlockStatus.unlocked ? '解禁済み' : '未解禁' }})
                </option>
              </select>
              
              <select v-model="testInvestment.tierIndex" class="w-full border border-gray-300 rounded-lg px-3 py-2" :disabled="!testInvestment.planetId">
                <option value="">投資レベルを選択</option>
                <option v-for="(tier, index) in selectedPlanetTiers" :key="index" :value="index">
                  {{ tier.label }} - {{ tier.cost }} EP
                </option>
              </select>
              
              <button 
                @click="executeTestInvestment"
                :disabled="!canExecuteTestInvestment"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                テスト投資実行
              </button>
            </div>
          </div>

          <!-- データ操作テスト -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800">🛠️ データ操作テスト</h3>
            
            <div class="space-y-2">
              <button 
                @click="generateTestData"
                class="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-bold"
              >
                🧪 テストデータ生成
              </button>
              
              <button 
                @click="simulateLearningProgress"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-bold"
              >
                📈 学習進捗シミュレート
              </button>
              
              <button 
                @click="calculateDailyReturns"
                class="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg font-bold"
              >
                💰 日次リターン計算
              </button>
              
              <button 
                @click="resetTestData"
                class="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 rounded-lg font-bold"
              >
                🔄 データリセット
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 現在のステータス表示 -->
      <div class="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">📈 現在のステータス</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- プレイヤーデータ -->
          <div>
            <h3 class="font-bold text-gray-800 mb-2">👤 プレイヤーデータ</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div>レベル: {{ gameStore.playerLevel }}</div>
              <div>コズミックエネルギー: {{ gameStore.playerData.cosmicEnergy || 0 }}</div>
              <div>サウンドジェム: {{ gameStore.playerData.soundGems || 0 }}</div>
              <div>航行日数: {{ gameStore.playerData.navigationDays || 0 }}</div>
            </div>
          </div>

          <!-- 投資ポートフォリオ -->
          <div>
            <h3 class="font-bold text-gray-800 mb-2">💼 投資ポートフォリオ</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div>投資済み惑星: {{ galaxyStore.playerInvestments.ownedPlanets.length }}</div>
              <div>総投資額: {{ galaxyStore.playerInvestments.totalInvested }}</div>
              <div>総リターン: {{ galaxyStore.playerInvestments.totalReturns }}</div>
              <div>ポートフォリオ価値: {{ portfolioStats.totalValue }}</div>
            </div>
          </div>

          <!-- システム情報 -->
          <div>
            <h3 class="font-bold text-gray-800 mb-2">⚙️ システム情報</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div>Galaxy Trading: {{ galaxyStore.isEnabled ? '有効' : '無効' }}</div>
              <div>データバージョン: {{ galaxyStore.version }}</div>
              <div>最終更新: {{ new Date().toLocaleTimeString() }}</div>
              <div>テスト環境: Phase 1 Day 1-2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'

export default {
  name: 'IntegrationTest',
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const testResults = ref({
      storeInit: false,
      storeIntegration: false,
      learningSync: false,
      planetUnlock: false,
      energyIntegration: false,
      energySync: false,
      dataFlow: false
    })
    
    const testInvestment = ref({
      planetId: '',
      tierIndex: ''
    })
    
    const refreshInterval = ref(null)
    
    // === 計算プロパティ ===
    const learningProgress = computed(() => {
      return galaxyStore.learningProgress
    })
    
    const planetUnlockStatus = computed(() => {
      return galaxyStore.planetUnlockStatus
    })
    
    const availablePlanets = computed(() => {
      return galaxyStore.availablePlanets
    })
    
    const selectedPlanetTiers = computed(() => {
      if (!testInvestment.value.planetId) return []
      const planet = galaxyStore.planetCorporations[testInvestment.value.planetId]
      return planet?.investmentTiers || []
    })
    
    const canExecuteTestInvestment = computed(() => {
      return testInvestment.value.planetId && 
             testInvestment.value.tierIndex !== '' &&
             galaxyStore.availableEnergy > 0
    })
    
    const gameStoreEnergy = computed(() => {
      return gameStore.playerData.cosmicEnergy || gameStore.playerData.exp || 0
    })
    
    const portfolioStats = computed(() => {
      return galaxyStore.portfolioStats
    })
    
    // === メソッド ===
    
    /**
     * 統合テストの実行
     */
    const runIntegrationTests = () => {
      logger.log('🧪 Galaxy Trading 統合テスト開始')
      
      // 1. ストア初期化テスト
      testResults.value.storeInit = !!(
        galaxyStore.version &&
        Object.keys(galaxyStore.planetCorporations).length > 0 &&
        galaxyStore.planetCorporations['apple-planet']
      )
      
      // 2. 学習進捗連携テスト
      const progress = learningProgress.value
      testResults.value.learningSync = !!(
        progress.cvcWord !== undefined &&
        progress.blendingBuilder !== undefined &&
        progress.grammar !== undefined
      )
      
      // 3. 惑星解禁システムテスト
      const unlockStatus = planetUnlockStatus.value
      testResults.value.planetUnlock = !!(
        unlockStatus['apple-planet'] &&
        unlockStatus['robot-planet'] &&
        unlockStatus['grammar-moon']
      )
      
      // 4. エネルギー統合テスト
      const gameEnergy = gameStoreEnergy.value
      const galaxyEnergy = galaxyStore.availableEnergy
      testResults.value.energyIntegration = !!(gameEnergy >= 0 && galaxyEnergy >= 0)
      testResults.value.energySync = gameEnergy === galaxyEnergy
      
      // 5. 総合判定
      testResults.value.storeIntegration = testResults.value.storeInit && testResults.value.learningSync
      testResults.value.dataFlow = testResults.value.learningSync && testResults.value.planetUnlock
      
      logger.log('📊 テスト結果:', testResults.value)
    }
    
    /**
     * テスト投資の実行
     */
    const executeTestInvestment = async () => {
      try {
        const investment = galaxyStore.investInPlanet(
          testInvestment.value.planetId,
          parseInt(testInvestment.value.tierIndex)
        )
        
        alert(`✅ テスト投資成功！\n投資ID: ${investment.id}\nコスト: ${investment.cost} EP`)
        
        // テスト結果の更新
        runIntegrationTests()
        
      } catch (error) {
        alert(`❌ テスト投資失敗: ${error.message}`)
        logger.error('テスト投資エラー:', error)
      }
    }
    
    /**
     * テストデータの生成
     */
    const generateTestData = () => {
      try {
        // Game Store にテストデータ追加
        gameStore.playerData.cosmicEnergy = 1000
        gameStore.playerData.exp = 1000
        gameStore.playerData.soundGems = 500
        gameStore.playerData.captainLevel = 3
        
        // ゲーム進捗をテスト用に設定
        gameStore.updateGameProgress('cvcWord', {
          progress: 25,
          bestScore: 850,
          completed: false,
          lastPlayed: new Date().toISOString()
        })
        
        gameStore.updateGameProgress('blendingBuilder', {
          progress: 45,
          bestScore: 920,
          completed: false,
          lastPlayed: new Date().toISOString()
        })
        
        // Galaxy Trading を有効化
        galaxyStore.enableGalaxyTrading()
        
        alert('🧪 テストデータ生成完了！')
        runIntegrationTests()
        
      } catch (error) {
        alert(`❌ テストデータ生成エラー: ${error.message}`)
        logger.error('テストデータ生成エラー:', error)
      }
    }
    
    /**
     * 学習進捗のシミュレート
     */
    const simulateLearningProgress = () => {
      // ランダムな進捗増加をシミュレート
      const currentCvc = learningProgress.value.cvcWord.progress || 0
      const newCvcProgress = Math.min(100, currentCvc + Math.random() * 20)
      
      gameStore.updateGameProgress('cvcWord', {
        progress: newCvcProgress,
        bestScore: Math.floor(800 + Math.random() * 200),
        accuracy: 75 + Math.random() * 25,
        lastPlayed: new Date().toISOString()
      })
      
      alert(`📈 CVC Word進捗更新: ${newCvcProgress.toFixed(1)}%`)
      runIntegrationTests()
    }
    
    /**
     * 日次リターンの計算
     */
    const calculateDailyReturns = () => {
      try {
        const returns = galaxyStore.calculateDailyReturns()
        
        if (returns > 0) {
          alert(`💰 日次リターン計算完了！\n受取額: ${returns} エネルギーポイント`)
        } else {
          alert('💡 投資がありません。まず投資を行ってください。')
        }
        
        runIntegrationTests()
        
      } catch (error) {
        alert(`❌ 日次リターン計算エラー: ${error.message}`)
        logger.error('日次リターン計算エラー:', error)
      }
    }
    
    /**
     * テストデータのリセット
     */
    const resetTestData = () => {
      if (confirm('⚠️ すべてのテストデータをリセットしますか？')) {
        try {
          galaxyStore.resetData()
          
          // Game Store の一部データもリセット
          gameStore.playerData.cosmicEnergy = 250
          gameStore.playerData.exp = 250
          gameStore.saveToLocalStorage()
          
          alert('🔄 テストデータリセット完了！')
          runIntegrationTests()
          
        } catch (error) {
          alert(`❌ リセットエラー: ${error.message}`)
          logger.error('リセットエラー:', error)
        }
      }
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log('🧪 Galaxy Trading 統合テストコンポーネント開始')
      
      // 初期テストの実行
      runIntegrationTests()
      
      // 定期的なテスト更新
      refreshInterval.value = setInterval(() => {
        runIntegrationTests()
      }, 5000)
    })
    
    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value)
      }
    })
    
    return {
      // State
      testResults,
      testInvestment,
      
      // Stores
      galaxyStore,
      gameStore,
      
      // Computed
      learningProgress,
      planetUnlockStatus,
      availablePlanets,
      selectedPlanetTiers,
      canExecuteTestInvestment,
      gameStoreEnergy,
      portfolioStats,
      
      // Methods
      runIntegrationTests,
      executeTestInvestment,
      generateTestData,
      simulateLearningProgress,
      calculateDailyReturns,
      resetTestData
    }
  }
}
</script>

<style scoped>
/* アニメーション効果 */
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

.bg-white\/95 {
  animation: fadeIn 0.5s ease-out;
}

/* テスト結果の視覚的フィードバック */
.bg-green-50 {
  animation: successPulse 0.5s ease-out;
}

.bg-red-50 {
  animation: errorPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% { background-color: rgb(240 253 244); }
  50% { background-color: rgb(187 247 208); }
  100% { background-color: rgb(240 253 244); }
}

@keyframes errorPulse {
  0% { background-color: rgb(254 242 242); }
  50% { background-color: rgb(252 165 165); }
  100% { background-color: rgb(254 242 242); }
}

/* ボタンエフェクト */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

button:disabled {
  transform: none;
  box-shadow: none;
}
</style>