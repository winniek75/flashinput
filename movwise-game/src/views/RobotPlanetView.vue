<template>
  <div class="robot-planet-view">
    <!-- Robot Planet特化のPlanetWrapper -->
    <PlanetWrapper 
      planet-id="robot-planet" 
      game-type="blendingBuilder"
    >
      <!-- BlendingBuilderGameをRobot Planetテーマでラップ -->
      <BlendingBuilderGameRobot />
    </PlanetWrapper>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { onMounted } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import { useGameStore } from '@/stores/gameStore.js'
import PlanetWrapper from '@/components/galaxy-trading/wrappers/PlanetWrapper.vue'
import BlendingBuilderGameRobot from '@/components/galaxy-trading/games/BlendingBuilderGameRobot.vue'

export default {
  name: 'RobotPlanetView',
  components: {
    PlanetWrapper,
    BlendingBuilderGameRobot
  },
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    const gameStore = useGameStore()
    
    onMounted(() => {
      logger.log('🤖 Robot Planet View 初期化')
      
      // Galaxy Trading システム有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
      }
      
      // Robot Planet解禁チェック
      const unlockStatus = galaxyStore.planetUnlockStatus['robot-planet']
      logger.log('🔒 Robot Planet解禁状況:', unlockStatus)
    })
    
    return {
      galaxyStore,
      gameStore
    }
  }
}
</script>

<style scoped>
.robot-planet-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #3B82F6, #1D4ED8, #1E40AF);
}
</style>