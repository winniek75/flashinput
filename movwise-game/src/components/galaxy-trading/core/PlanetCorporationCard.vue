<template>
  <div 
    class="planet-card bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
    :class="{ 'opacity-60': !unlockStatus.unlocked }"
  >
    <!-- カードヘッダー -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-4">
        <div class="planet-icon text-5xl">{{ planet.emoji }}</div>
        <div>
          <h3 class="text-xl font-bold text-white">{{ planet.name }}</h3>
          <p class="text-white/80 text-sm">{{ planet.theme }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
              {{ planet.industryCategory }}
            </span>
            <span class="text-xs" :class="getRiskColor(planet.riskLevel)">
              {{ getRiskLabel(planet.riskLevel) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="text-right">
        <div class="unlock-status">
          <div v-if="unlockStatus.unlocked" class="text-green-300 font-bold flex items-center gap-1">
            <span class="text-lg">🔓</span>
            解禁済み
          </div>
          <div v-else class="text-yellow-300 font-bold flex items-center gap-1">
            <span class="text-lg">🔒</span>
            学習中
          </div>
        </div>
        <div class="text-xs text-white/60 mt-1">
          進捗: {{ unlockStatus.progress || 0 }}% / {{ unlockStatus.required || 0 }}%
        </div>
      </div>
    </div>

    <!-- 進捗バー -->
    <div class="mb-4">
      <div class="w-full bg-white/10 rounded-full h-2">
        <div 
          class="rounded-full h-2 transition-all duration-500"
          :style="{ 
            width: `${Math.min((unlockStatus.progress || 0), 100)}%`,
            background: unlockStatus.unlocked 
              ? 'linear-gradient(90deg, #10B981, #059669)' 
              : 'linear-gradient(90deg, #F59E0B, #D97706)'
          }"
        ></div>
      </div>
    </div>

    <!-- CEO & 事業情報 -->
    <div class="bg-white/5 rounded-2xl p-4 mb-4">
      <div class="flex items-center justify-between mb-2">
        <div>
          <div class="text-white font-bold text-sm">👨‍💼 CEO: {{ planet.ceo }}</div>
          <div class="text-white/80 text-xs">{{ planet.businessType }}</div>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-1 text-yellow-300">
            <span v-for="star in Math.floor(planet.popularityRating)" :key="star">⭐</span>
            <span class="text-xs text-white/60 ml-1">{{ planet.popularityRating }}</span>
          </div>
          <div class="text-xs text-white/60">人気度</div>
        </div>
      </div>
    </div>

    <!-- 投資情報 -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-white/80 text-sm font-bold">💰 投資オプション</span>
        <span class="text-white/60 text-xs">成長率: {{ planet.growthPotential }}%</span>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div 
          v-for="(tier, index) in planet.investmentTiers.slice(0, 4)" 
          :key="index"
          class="bg-white/10 rounded-xl p-2 text-center"
        >
          <div class="text-white font-bold text-sm">{{ tier.cost }} EP</div>
          <div class="text-white/70 text-xs">+{{ tier.dailyReturn }}/日</div>
        </div>
      </div>
    </div>

    <!-- 投資ステータス -->
    <div v-if="investmentStatus.hasInvestment" class="bg-green-500/20 border border-green-500/30 rounded-2xl p-3 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-green-300 font-bold text-sm flex items-center gap-1">
            <span>💼</span>
            投資済み
          </div>
          <div class="text-green-200 text-xs">
            {{ investmentStatus.investmentCount }}件の投資
          </div>
        </div>
        <div class="text-right">
          <div class="text-green-300 font-bold">{{ investmentStatus.totalValue.toLocaleString() }}</div>
          <div class="text-green-200 text-xs">資産価値</div>
        </div>
      </div>
    </div>

    <!-- 文化学習要素 -->
    <div class="mb-4">
      <div class="text-white/80 text-sm font-bold mb-2">🌍 文化学習要素</div>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="element in planet.culturalElements" 
          :key="element"
          class="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30"
        >
          {{ element }}
        </span>
      </div>
    </div>

    <!-- アクションボタン -->
    <div class="space-y-2">
      <!-- 学習ボタン -->
      <button
        v-if="!unlockStatus.unlocked"
        @click="$emit('learn', planet.requiredGame)"
        class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span>📚</span>
        {{ getGameLabel(planet.requiredGame) }}で学習する
      </button>

      <!-- 投資ボタン -->
      <button
        v-if="unlockStatus.unlocked"
        @click="$emit('invest', planet)"
        class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span>💰</span>
        {{ planet.name }}に投資する
      </button>

      <!-- VRボタン -->
      <button
        v-if="unlockStatus.unlocked && investmentStatus.hasInvestment"
        @click="$emit('view-vr', planet.id)"
        class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <span>🥽</span>
        VR体験を準備
      </button>
    </div>

    <!-- 追加情報 -->
    <div class="mt-4 pt-4 border-t border-white/10">
      <div class="flex justify-between text-xs text-white/60">
        <span>準備時間: {{ planet.preparationTime }}分</span>
        <span>カテゴリ: {{ planet.industryCategory }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanetCorporationCard',
  props: {
    planet: {
      type: Object,
      required: true
    },
    unlockStatus: {
      type: Object,
      required: true
    },
    investmentStatus: {
      type: Object,
      required: true
    }
  },
  emits: ['invest', 'learn', 'view-vr'],
  setup() {
    const getRiskColor = (riskLevel) => {
      const colors = {
        low: 'text-green-300',
        medium: 'text-yellow-300',
        high: 'text-red-300'
      }
      return colors[riskLevel] || 'text-gray-300'
    }
    
    const getRiskLabel = (riskLevel) => {
      const labels = {
        low: '低リスク',
        medium: '中リスク',
        high: '高リスク'
      }
      return labels[riskLevel] || 'リスク不明'
    }
    
    const getGameLabel = (gameType) => {
      const labels = {
        cvcWord: 'CVC Word Game',
        blendingBuilder: 'Blending Builder',
        grammarGalaxy: 'Grammar Galaxy'
      }
      return labels[gameType] || 'ゲーム'
    }
    
    return {
      getRiskColor,
      getRiskLabel,
      getGameLabel
    }
  }
}
</script>

<style scoped>
.planet-card {
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

.planet-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.planet-card:hover .planet-icon {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

/* ボタンホバーエフェクト */
button:hover {
  transform: translateY(-2px);
}

/* グロー効果 */
.planet-card:hover {
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

/* 解禁状態のビジュアル効果 */
.unlock-status {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 投資済みステータスのグロー */
.bg-green-500\/20 {
  animation: greenGlow 3s ease-in-out infinite;
}

@keyframes greenGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .planet-card {
    padding: 1rem;
  }
  
  .planet-icon {
    font-size: 2.5rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}
</style>