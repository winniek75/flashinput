<template>
  <div class="grammar-game-wrapper">
    <component
      :is="currentGameComponent"
      v-if="currentGameComponent"
      @back="handleBack"
      @complete="handleGameComplete"
    />
    <div v-else class="game-loading">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p>ゲームを読み込み中...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'GrammarGameWrapper',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentGameComponent = ref(null)
    const loading = ref(true)

    // Game component mapping
    const gameComponents = {
      'GrammarColorCodeGame': () => import('@/components/games/grammar-galaxy/GrammarColorCodeGame.vue'),
      'VerbTimeMachine': () => import('@/components/grammar/games/VerbTimeMachine.vue'),
      'GalacticQuestionNavigator': () => import('@/components/grammar/games/GalacticQuestionNavigator.vue'),
      'GrammarPuzzleCascadeGame': () => import('@/components/games/grammar-galaxy/GrammarPuzzleCascadeGame.vue'),
      'ProgressiveTenseGame': () => import('@/components/games/grammar-galaxy/ProgressiveTenseGame.vue'),
      'ModalVerbChallengeGame': () => import('@/components/games/grammar-galaxy/ModalVerbChallengeGame.vue'),
      'ComparisonMasterGame': () => import('@/components/games/grammar-galaxy/ComparisonMasterGame.vue'),
      'ConjunctionConnectionGame': () => import('@/components/games/grammar-galaxy/ConjunctionConnectionGame.vue'),
      'GrammarReflexArena': () => import('@/components/games/grammar-galaxy/GrammarReflexArena.vue'),
      'PatternHunterGame': () => import('@/components/games/grammar-galaxy/PatternHunterGame.vue'),
      'SpaceWordOrderQuest': () => import('@/components/games/grammar-galaxy/SpaceWordOrderQuest.vue'),
      'TimeZoneNavigatorGame': () => import('@/components/games/grammar-galaxy/TimeZoneNavigatorGame.vue')
    }

    const loadGameComponent = async () => {
      loading.value = true
      const componentName = route.query.component

      if (!componentName) {
        console.error('No component specified in query')
        router.push('/platforms/grammar-galaxy')
        return
      }

      try {
        const componentLoader = gameComponents[componentName]
        if (!componentLoader) {
          console.error('Game component not found:', componentName)
          router.push('/platforms/grammar-galaxy')
          return
        }

        const component = await componentLoader()
        currentGameComponent.value = component.default || component
        loading.value = false
      } catch (error) {
        console.error('Failed to load game component:', error)
        router.push('/platforms/grammar-galaxy')
      }
    }

    const handleBack = () => {
      router.push('/platforms/grammar-galaxy')
    }

    const handleGameComplete = (result) => {
      // Handle game completion
      console.log('Game completed:', result)
      // Could save progress here
      // For now, just go back to platform
      setTimeout(() => {
        router.push('/platforms/grammar-galaxy')
      }, 2000)
    }

    // Watch for route changes
    watch(() => route.query.component, () => {
      loadGameComponent()
    })

    onMounted(() => {
      loadGameComponent()
    })

    return {
      currentGameComponent,
      loading,
      handleBack,
      handleGameComplete
    }
  }
}
</script>

<style scoped>
.grammar-game-wrapper {
  min-height: 100vh;
  width: 100%;
}

.game-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1a1c5a 0%, #0a0b2e 50%, #000 100%);
  color: white;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.game-loading p {
  font-size: 1.1rem;
  color: #94a3b8;
}
</style>