<template>
  <div class="grammar-moon-view">
    <!-- Grammar Moon特化のPlanetWrapper -->
    <PlanetWrapper 
      planet-id="grammar-moon" 
      game-type="grammarPattern"
    >
      <!-- PatternHunterGameをGrammar Moonテーマでラップ -->
      <PatternHunterGameMoon />
    </PlanetWrapper>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { onMounted } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import PlanetWrapper from '@/components/galaxy-trading/wrappers/PlanetWrapper.vue'
import PatternHunterGameMoon from '@/components/galaxy-trading/games/PatternHunterGameMoon.vue'

export default {
  name: 'GrammarMoonView',
  components: {
    PlanetWrapper,
    PatternHunterGameMoon
  },
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    onMounted(() => {
      logger.log('🌙 Grammar Moon View 初期化')
      
      // Galaxy Trading システム有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
      }
      
      // Grammar Moon解禁チェック
      const unlockStatus = galaxyStore.planetUnlockStatus['grammar-moon']
      logger.log('🔒 Grammar Moon解禁状況:', unlockStatus)
    })
    
    return {
      galaxyStore,
      gameStore
    }
  }
}
</script>

<style scoped>
.grammar-moon-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED, #6D28D9);
}
</style>