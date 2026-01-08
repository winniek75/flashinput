<template>
  <div class="galaxy-trading-view">
    <!-- Galaxy Trading Dashboard -->
    <GalaxyTradingDashboard />
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { onMounted } from 'vue'
import { useGalaxyTradingStore } from '@/stores/galaxyTradingStore.js'
import GalaxyTradingDashboard from '@/components/galaxy-trading/core/GalaxyTradingDashboard.vue'

export default {
  name: 'GalaxyTradingView',
  components: {
    GalaxyTradingDashboard
  },
  setup() {
    const galaxyStore = useGalaxyTradingStore()
    
    onMounted(() => {
      logger.log('🌌 Galaxy Trading View 初期化')
      
      // Galaxy Trading システムが無効な場合は有効化
      if (!galaxyStore.isEnabled) {
        galaxyStore.enableGalaxyTrading()
        logger.log('⚡ Galaxy Trading システムを有効化しました')
      }
    })
    
    return {
      // Stores for debugging
      galaxyStore
    }
  }
}
</script>

<style scoped>
.galaxy-trading-view {
  min-height: 100vh;
}
</style>