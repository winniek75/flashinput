<template>
  <div class="apple-planet-view">
    <!-- Apple Planet特化のPlanetWrapper -->
    <PlanetWrapper 
      planet-id="apple-planet" 
      game-type="cvcWord"
    >
      <!-- CvcWordGameをApple Planetテーマでラップ -->
      <CvcWordGameApple />
    </PlanetWrapper>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { onMounted } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import PlanetWrapper from '@/components/galaxy-trading/wrappers/PlanetWrapper.vue'
import CvcWordGameApple from '@/components/galaxy-trading/games/CvcWordGameApple.vue'

export default {
  name: 'ApplePlanetView',
  components: {
    PlanetWrapper,
    CvcWordGameApple
  },
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    onMounted(() => {
      logger.log('🍎 Apple Planet View 初期化')
      
      // Galaxy Trading システム有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
      }
      
      // Apple Planet解禁チェック
      const unlockStatus = galaxyStore.planetUnlockStatus['apple-planet']
      logger.log('🔒 Apple Planet解禁状況:', unlockStatus)
    })
    
    return {
      galaxyStore,
      gameStore
    }
  }
}
</script>

<style scoped>
.apple-planet-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E, #FFA8A8);
}
</style>