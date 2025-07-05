<template>
  <div class="galaxy-map-view">
    <!-- キャラクターナビゲーター -->
    <div class="character-navigator">
      <CharacterAvatar
        :character="activeCharacter"
        :message="navigatorMessage"
        :show-abilities="false"
        :show-level="false"
      />
    </div>
    
    <!-- 惑星セレクター -->
    <AdvancedPlanetSelector
      @select-planet="handlePlanetSelect"
      @enter-planet="handlePlanetEnter"
      @enter-recommended-mission="handleRecommendedMission"
      @back="goBack"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStore } from '@/stores/gameStore'
import CharacterAvatar from '@/components/ui/CharacterAvatar.vue'
import AdvancedPlanetSelector from '@/components/ui/AdvancedPlanetSelector.vue'

export default {
  name: 'GalaxyMapView',
  components: {
    CharacterAvatar,
    AdvancedPlanetSelector
  },
  setup() {
    const router = useRouter()
    const characterStore = useCharacterStore()
    const gameStore = useGameStore()
    
    const musicEnabled = ref(true)
    const navigatorMessage = ref('')
    
    const activeCharacter = computed(() => characterStore.characters.echo)
    
    const handlePlanetSelect = (planet) => {
      // 惑星選択時のメッセージ
      const messages = {
        phonics: '音素の惑星は基礎学習に最適です。44の音を一つずつマスターしましょう！',
        grammar: '文法銀河では言語構造を学べます。魔法のような文法パターンを習得しましょう！',
        vocabulary: '語彙の村では実用的な単語を学べます。お買い物しながら楽しく覚えましょう！',
        pattern: 'パターン楽園は上級者向けです。英語の規則性を発見する冒険が待っています！',
        practice: '実践港はVRアカデミーへの玄関口です。リアルな場面で英語を使いこなしましょう！'
      }
      
      navigatorMessage.value = messages[planet.id] || ''
      
      // 3秒後にメッセージを消す
      setTimeout(() => {
        navigatorMessage.value = ''
      }, 5000)
    }
    
    const handlePlanetEnter = (planet) => {
      // 惑星に入る際の処理
      console.log(`Entering ${planet.name}`)
      
      // ルーティング先を決定
      const routes = {
        phonics: 'SoundAdventureHub',
        grammar: 'grammar-galaxy-hub',
        vocabulary: 'WordRushGame',
        pattern: 'MultiLayerHub',
        practice: 'VRAcademy'
      }
      
      const routeName = routes[planet.id]
      if (routeName) {
        router.push({ name: routeName })
      } else {
        alert(`${planet.name}は準備中です！`)
      }
    }
    
    const handleRecommendedMission = (planet) => {
      // 推奨ミッションへの直接ルーティング
      console.log(`Starting recommended mission for ${planet.name}`)
      
      // 推奨ミッション用の特定のルート
      const recommendedRoutes = {
        phonics: { name: 'BeVerbRush' },
        grammar: { name: 'grammar-galaxy-hub', query: { mode: 'recommended' } },
        vocabulary: { name: 'WordRushGame', query: { level: 'beginner' } }
      }
      
      const route = recommendedRoutes[planet.id]
      if (route) {
        router.push(route)
      } else {
        // フォールバック：通常のルートに進む
        handlePlanetEnter(planet)
      }
    }
    
    const goBack = () => {
      router.push({ name: 'home' })
    }
    
    const toggleMusic = () => {
      musicEnabled.value = !musicEnabled.value
      // TODO: 実際の音楽制御を実装
    }
    
    onMounted(() => {
      // 初期メッセージ
      navigatorMessage.value = 'ようこそ、サウンド・ガーディアン！どの惑星から探索を始めますか？'
      setTimeout(() => {
        navigatorMessage.value = ''
      }, 5000)
      
      // 背景音楽を再生（実装予定）
      if (musicEnabled.value) {
        // playBackgroundMusic()
      }
    })
    
    onUnmounted(() => {
      // 背景音楽を停止（実装予定）
      // stopBackgroundMusic()
    })
    
    return {
      activeCharacter,
      navigatorMessage,
      musicEnabled,
      handlePlanetSelect,
      handlePlanetEnter,
      handleRecommendedMission,
      goBack,
      toggleMusic
    }
  }
}
</script>

<style scoped>
.galaxy-map-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.character-navigator {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}
</style>