<template>
  <div class="planet-wrapper">
    <!-- 惑星テーマ背景 -->
    <div class="planet-background" :style="backgroundStyle">
      <div class="planet-overlay"></div>
    </div>
    
    <!-- 惑星ヘッダー -->
    <div class="planet-header relative z-10">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- 戻るボタン -->
          <button 
            @click="handleBack"
            class="flex items-center gap-2 bg-white/90 text-gray-800 px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeft class="w-5 h-5" />
            戻る
          </button>
          
          <!-- 惑星情報 -->
          <div class="text-center">
            <div class="text-4xl mb-2">{{ planetInfo.emoji }}</div>
            <h1 class="text-2xl font-bold text-white drop-shadow-lg">{{ planetInfo.name }}</h1>
            <p class="text-white/90 text-sm">{{ planetInfo.theme }}</p>
          </div>
          
          <!-- 投資ステータス -->
          <div class="bg-white/90 rounded-2xl px-4 py-2 min-w-[120px]">
            <div class="text-center">
              <div class="text-lg font-bold text-gray-800">{{ investmentStatus.label }}</div>
              <div class="text-sm text-gray-600">{{ investmentStatus.description }}</div>
            </div>
          </div>
        </div>
        
        <!-- 学習進捗バー -->
        <div class="mt-4 bg-white/20 rounded-full h-2">
          <div 
            class="bg-white rounded-full h-2 transition-all duration-500"
            :style="{ width: `${learningProgress}%` }"
          ></div>
        </div>
        <div class="flex justify-between text-white text-sm mt-1">
          <span>学習進捗</span>
          <span>{{ learningProgress }}% ({{ requiredProgress }}%で投資解禁)</span>
        </div>
      </div>
    </div>
    
    <!-- メインコンテンツエリア -->
    <div class="planet-content relative z-10">
      <!-- Galaxy Trading Bridge でラップした既存ゲーム -->
      <GameToTradingBridge 
        :planet-id="planetId" 
        :game-type="gameType"
      >
        <slot />
      </GameToTradingBridge>
    </div>
    
    <!-- 惑星固有のサイドパネル -->
    <div v-if="showSidePanel" class="planet-side-panel fixed right-4 top-1/2 -translate-y-1/2 z-20">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl w-64">
        <!-- 企業情報 -->
        <div class="text-center mb-4">
          <div class="text-3xl mb-2">{{ planetInfo.emoji }}</div>
          <h3 class="font-bold text-gray-800">{{ planetInfo.ceo }}</h3>
          <p class="text-sm text-gray-600">{{ planetInfo.businessType }}</p>
        </div>
        
        <!-- 投資ティア -->
        <div class="space-y-2 mb-4">
          <div class="text-sm font-bold text-gray-800">投資オプション</div>
          <div v-for="(tier, index) in investmentTiers.slice(0, 3)" :key="index" class="flex justify-between text-xs">
            <span>{{ tier.label }}</span>
            <span class="font-bold">{{ tier.cost }} EP</span>
          </div>
        </div>
        
        <!-- 文化要素 -->
        <div class="mb-4">
          <div class="text-sm font-bold text-gray-800 mb-2">文化学習要素</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="element in planetInfo.culturalElements" 
              :key="element"
              class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {{ element }}
            </span>
          </div>
        </div>
        
        <!-- アクションボタン -->
        <div class="space-y-2">
          <button
            v-if="isInvestmentUnlocked"
            @click="openInvestmentModal"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-200"
          >
            💰 投資する
          </button>
          
          <button
            v-if="hasVRAccess"
            @click="prepareVRExperience"
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-200"
          >
            🥽 VR体験準備
          </button>
          
          <button
            @click="toggleSidePanel"
            class="w-full bg-gray-200 text-gray-700 py-2 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-200"
          >
            📖 企業情報詳細
          </button>
        </div>
      </div>
    </div>
    
    <!-- 投資モーダル -->
    <div v-if="showInvestmentModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="text-center">
          <div class="text-4xl mb-4">{{ planetInfo.emoji }}</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ planetInfo.name }}への投資</h3>
          <p class="text-gray-600 mb-6">この企業を応援しませんか？</p>
          
          <!-- 投資オプション -->
          <div class="space-y-3 mb-6">
            <div 
              v-for="(tier, index) in investmentTiers" 
              :key="index"
              @click="selectInvestmentTier(index)"
              class="investment-tier-option p-3 border-2 rounded-xl cursor-pointer transition-all duration-200"
              :class="{
                'border-blue-500 bg-blue-50': selectedTier === index,
                'border-gray-200 hover:border-gray-300': selectedTier !== index,
                'opacity-50 cursor-not-allowed': availableEnergy < tier.cost
              }"
            >
              <div class="flex justify-between items-center">
                <div class="text-left">
                  <div class="font-bold text-sm">{{ tier.label }}</div>
                  <div class="text-xs text-gray-600">日次リターン: {{ tier.dailyReturn }} EP</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-lg">{{ tier.cost }}</div>
                  <div class="text-xs text-gray-600">EP</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 投資教育メッセージ -->
          <div class="bg-blue-50 rounded-2xl p-4 mb-6">
            <div class="text-sm text-blue-800">
              <div class="font-bold mb-1">💡 投資の学習ポイント</div>
              <p>{{ getEducationalMessage() }}</p>
            </div>
          </div>
          
          <!-- アクションボタン -->
          <div class="flex gap-3">
            <button
              @click="closeInvestmentModal"
              class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              @click="executeInvestment"
              :disabled="selectedTier === null || !canAffordInvestment"
              class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              投資実行
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import GameToTradingBridge from './GameToTradingBridge.vue'

export default {
  name: 'PlanetWrapper',
  components: {
    ArrowLeft,
    GameToTradingBridge
  },
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
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    // === 状態管理 ===
    const showSidePanel = ref(false)
    const showInvestmentModal = ref(false)
    const selectedTier = ref(null)
    
    // === 計算プロパティ ===
    const planetInfo = computed(() => {
      return galaxyStore.planetCorporations[props.planetId] || {}
    })
    
    const investmentTiers = computed(() => {
      return planetInfo.value.investmentTiers || []
    })
    
    const unlockStatus = computed(() => {
      return galaxyStore.planetUnlockStatus[props.planetId] || {}
    })
    
    const learningProgress = computed(() => {
      return unlockStatus.value.progress || 0
    })
    
    const requiredProgress = computed(() => {
      return unlockStatus.value.required || 0
    })
    
    const isInvestmentUnlocked = computed(() => {
      return unlockStatus.value.unlocked || false
    })
    
    const availableEnergy = computed(() => {
      return galaxyStore.availableEnergy || 0
    })
    
    const investmentStatus = computed(() => {
      if (isInvestmentUnlocked.value) {
        const investments = galaxyStore.playerInvestments.ownedPlanets.filter(
          inv => inv.planetId === props.planetId
        )
        
        if (investments.length > 0) {
          return {
            label: '投資済み',
            description: `${investments.length}件の投資`
          }
        } else {
          return {
            label: '投資可能',
            description: '応援できます'
          }
        }
      } else {
        return {
          label: '学習中',
          description: `${requiredProgress.value}%必要`
        }
      }
    })
    
    const backgroundStyle = computed(() => {
      const colors = {
        'apple-planet': 'linear-gradient(135deg, #FF6B6B, #FF8E8E, #FFA8A8)',
        'robot-planet': 'linear-gradient(135deg, #4ECDC4, #6EE2D9, #8EEAED)',
        'grammar-moon': 'linear-gradient(135deg, #96CEB4, #A8D8C8, #BAE2DC)'
      }
      
      return {
        background: colors[props.planetId] || colors['apple-planet']
      }
    })
    
    const hasVRAccess = computed(() => {
      // VRアクセスは投資済みかつ一定の学習進捗で解禁
      const hasInvestment = galaxyStore.playerInvestments.ownedPlanets.some(
        inv => inv.planetId === props.planetId
      )
      return hasInvestment && learningProgress.value >= 60
    })
    
    const canAffordInvestment = computed(() => {
      if (selectedTier.value === null) return false
      const tier = investmentTiers.value[selectedTier.value]
      return availableEnergy.value >= tier.cost
    })
    
    // === メソッド ===
    
    const handleBack = () => {
      router.push('/galaxy-trading')
    }
    
    const toggleSidePanel = () => {
      showSidePanel.value = !showSidePanel.value
    }
    
    const openInvestmentModal = () => {
      if (!isInvestmentUnlocked.value) {
        alert(`この惑星への投資には学習進捗${requiredProgress.value}%が必要です`)
        return
      }
      showInvestmentModal.value = true
      selectedTier.value = null
    }
    
    const closeInvestmentModal = () => {
      showInvestmentModal.value = false
      selectedTier.value = null
    }
    
    const selectInvestmentTier = (tierIndex) => {
      const tier = investmentTiers.value[tierIndex]
      if (availableEnergy.value >= tier.cost) {
        selectedTier.value = tierIndex
      }
    }
    
    const executeInvestment = async () => {
      if (selectedTier.value === null || !canAffordInvestment.value) return
      
      try {
        const investment = galaxyStore.investInPlanet(props.planetId, selectedTier.value)
        
        // 投資成功通知
        const tier = investmentTiers.value[selectedTier.value]
        alert(`🎉 投資成功！\n${planetInfo.value.name}の「${tier.label}」に投資しました。\n日次リターン: ${tier.dailyReturn} エネルギーポイント`)
        
        closeInvestmentModal()
        
        logger.log('✅ 投資実行成功:', investment)
      } catch (error) {
        alert(`❌ 投資実行エラー: ${error.message}`)
        logger.error('投資実行エラー:', error)
      }
    }
    
    const getEducationalMessage = () => {
      if (selectedTier.value === null) {
        return '投資は応援の気持ちです。リスクとリターンを理解して選択しましょう。'
      }
      
      const tier = investmentTiers.value[selectedTier.value]
      const roi = ((tier.dailyReturn * 30) / tier.cost * 100).toFixed(1)
      
      return `この投資の月次リターン率は約${roi}%です。長期的な視点で考えてみましょう。`
    }
    
    const prepareVRExperience = () => {
      // VR体験準備画面に遷移
      router.push({
        path: '/vr-academy',
        query: {
          planet: props.planetId,
          preparation: 'true'
        }
      })
    }
    
    // === ライフサイクル ===
    onMounted(() => {
      logger.log(`🌍 Planet Wrapper 初期化: ${props.planetId}`)
      
      // 側面パネルを少し遅れて表示（UX改善）
      setTimeout(() => {
        showSidePanel.value = true
      }, 1000)
      
      // Galaxy Trading が無効な場合の警告
      if (!galaxyStore.isEnabled) {
        logger.warn('⚠️ Galaxy Trading システムが無効です')
      }
    })
    
    return {
      // State
      showSidePanel,
      showInvestmentModal,
      selectedTier,
      
      // Computed
      planetInfo,
      investmentTiers,
      learningProgress,
      requiredProgress,
      isInvestmentUnlocked,
      availableEnergy,
      investmentStatus,
      backgroundStyle,
      hasVRAccess,
      canAffordInvestment,
      
      // Methods
      handleBack,
      toggleSidePanel,
      openInvestmentModal,
      closeInvestmentModal,
      selectInvestmentTier,
      executeInvestment,
      getEducationalMessage,
      prepareVRExperience
    }
  }
}
</script>

<style scoped>
.planet-wrapper {
  min-height: 100vh;
  position: relative;
}

.planet-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.planet-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

.planet-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.planet-content {
  position: relative;
  z-index: 5;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.95) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  min-height: calc(100vh - 120px);
}

.planet-side-panel {
  animation: slideInRight 0.5s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%) translateY(-50%);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateY(-50%);
    opacity: 1;
  }
}

.investment-tier-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .planet-side-panel {
    position: fixed;
    bottom: 4px;
    right: 4px;
    top: auto;
    transform: none;
  }
  
  .planet-side-panel .w-64 {
    width: calc(100vw - 2rem);
  }
}
</style>