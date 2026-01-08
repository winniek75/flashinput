<template>
  <div class="vocabulary-game-wrapper">
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
      <p>語彙ゲームを読み込み中...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'VocabularyGameWrapper',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentGameComponent = ref(null)
    const loading = ref(true)

    // Game component mapping
    const gameComponents = {
      'SightWordMaster': () => import('@/components/games/SightWordMaster.vue'),
      'CvcWordGame': () => import('@/components/games/CvcWordGame.vue'),
      'WordFamilyTreeGame': () => import('@/components/games/WordFamilyTreeGame.vue'),
      'WordDictationChallenge': () => import('@/components/games/WordDictationChallenge.vue'),
      'WordRushGame': () => import('@/components/games/WordRushGame.vue'),
      'ThemeShoppingAdventure': () => import('@/components/games/ThemeShoppingAdventure.vue'),
      'RolePlayTheater': () => import('@/components/games/RolePlayTheater.vue'),
      'VoiceEnhancedMagicEGalaxyBuilder': () => import('@/components/games/VoiceEnhancedMagicEGalaxyBuilder.vue')
    }

    const loadGameComponent = async () => {
      loading.value = true
      const componentName = route.query.component

      if (!componentName) {
        console.error('No component specified in query')
        router.push('/platforms/vocabulary-world')
        return
      }

      try {
        const componentLoader = gameComponents[componentName]
        if (!componentLoader) {
          console.error('Vocabulary game component not found:', componentName)
          router.push('/platforms/vocabulary-world')
          return
        }

        const component = await componentLoader()
        currentGameComponent.value = markRaw(component.default || component)
        loading.value = false
      } catch (error) {
        console.error('Failed to load vocabulary game component:', error)
        router.push('/platforms/vocabulary-world')
      }
    }

    const handleBack = () => {
      router.push('/platforms/vocabulary-world')
    }

    const handleGameComplete = (result) => {
      // Handle game completion
      console.log('Vocabulary game completed:', result)
      // Could save progress here
      // For now, just go back to platform
      setTimeout(() => {
        router.push('/platforms/vocabulary-world')
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
.vocabulary-game-wrapper {
  min-height: 100vh;
  width: 100%;
}

.game-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #2d1b5a 0%, #1a0f3e 50%, #000 100%);
  color: white;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top: 3px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.game-loading p {
  font-size: 1.1rem;
  color: #d1d5db;
}
</style>