<template>
  <div class="phonics-game-wrapper">
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
      <p>フォニックスゲームを読み込み中...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'PhonicsGameWrapper',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentGameComponent = ref(null)
    const loading = ref(true)

    // Game component mapping
    const gameComponents = {
      'SoundMasterGame': () => import('@/components/games/SoundMasterGame.vue'),
      'ComplexPhonemeGame': () => import('@/components/games/ComplexPhonemeGame.vue'),
      'PhonicsTrainingHub': () => import('@/components/games/PhonicsTrainingHub.vue'),
      'PhonicsBossChallenge': () => import('@/components/games/PhonicsBossChallenge.vue'),
      'SequentialBlendingGame': () => import('@/components/games/SequentialBlendingGame.vue'),
      'DoubleLetterLabGame': () => import('@/components/games/DoubleLetterLabGame.vue'),
      'FloatingLetterHunt': () => import('@/components/games/FloatingLetterHunt.vue'),
      'PhonicsPuzzleQuest': () => import('@/components/games/PhonicsPuzzleQuest.vue'),
      'RhythmPhonicsDance': () => import('@/components/games/RhythmPhonicsDance.vue'),
      'RhythmTapperGame': () => import('@/components/games/RhythmTapperGame.vue'),
      'TrueSoundImpact': () => import('@/components/games/TrueSoundImpact.vue'),
      'SoundBattleArena': () => import('@/components/games/SoundBattleArena.vue'),
      'SoundFarm': () => import('@/components/games/SoundFarm.vue'),
      'SpaceSoundAdventure': () => import('@/components/games/SpaceSoundAdventure.vue'),
      'StressPatternMasterGame': () => import('@/components/games/StressPatternMasterGame.vue'),
      'VoicePuzzleGame': () => import('@/components/games/VoicePuzzleGame.vue'),
      'CvPronunciationTrainer': () => import('@/components/games/CvPronunciationTrainer.vue'),
      'PureSoundLabBeatSaber': () => import('@/components/games/PureSoundLabBeatSaber.vue'),
      'CosmicSoundChain': () => import('@/components/games/CosmicSoundChain.vue'),
      'PhonicsPathGame': () => import('@/components/games/PhonicsPathGame.vue'),
      'CustomizablePhonicsJourney': () => import('@/components/games/CustomizablePhonicsJourney.vue'),
      'EnglishRhythmMaster': () => import('@/components/games/EnglishRhythmMaster.vue')
    }

    const loadGameComponent = async () => {
      loading.value = true
      const componentName = route.query.component

      if (!componentName) {
        console.error('No component specified in query')
        router.push('/platforms/phonics-adventure')
        return
      }

      try {
        const componentLoader = gameComponents[componentName]
        if (!componentLoader) {
          console.error('Phonics game component not found:', componentName)
          router.push('/platforms/phonics-adventure')
          return
        }

        const component = await componentLoader()
        currentGameComponent.value = component.default || component
        loading.value = false
      } catch (error) {
        console.error('Failed to load phonics game component:', error)
        router.push('/platforms/phonics-adventure')
      }
    }

    const handleBack = () => {
      router.push('/platforms/phonics-adventure')
    }

    const handleGameComplete = (result) => {
      // Handle game completion
      console.log('Phonics game completed:', result)
      // Could save progress here
      // For now, just go back to platform
      setTimeout(() => {
        router.push('/platforms/phonics-adventure')
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
.phonics-game-wrapper {
  min-height: 100vh;
  width: 100%;
}

.game-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1e3a8a 0%, #1e1b4b 50%, #000 100%);
  color: white;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(59, 130, 246, 0.3);
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