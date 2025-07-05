<template>
  <transition name="fade">
    <div v-if="isVisible" class="onboarding-overlay">
      <div class="story-container">
        <!-- 背景アニメーション -->
        <div class="animated-background">
          <div class="stars"></div>
          <div class="galaxy-swirl"></div>
        </div>
        
        <!-- ストーリーコンテンツ -->
        <div class="story-content">
          <transition name="slide-fade" mode="out-in">
            <div :key="currentStep" class="story-step">
              <!-- ステップ1: 危機の説明 -->
              <div v-if="currentStep === 0" class="step-content">
                <div class="story-icon cosmic-glow">🌌</div>
                <h1 class="story-title">音響銀河の危機</h1>
                <p class="story-text">
                  遠い宇宙の彼方、「音響銀河」では音素エネルギーが急速に失われています。
                  言語の力が消えかけ、銀河全体が沈黙の闇に包まれようとしています...
                </p>
              </div>
              
              <!-- ステップ2: プレイヤーの使命 -->
              <div v-else-if="currentStep === 1" class="step-content">
                <div class="story-icon cosmic-glow">🛡️</div>
                <h1 class="story-title">サウンド・ガーディアンの召喚</h1>
                <p class="story-text">
                  あなたは選ばれし「サウンド・ガーディアン」です。
                  失われた44の音素エネルギーを集め、音響銀河に言語の輝きを取り戻す使命があります。
                </p>
              </div>
              
              <!-- ステップ3: キャラクター紹介 -->
              <div v-else-if="currentStep === 2" class="step-content">
                <div class="characters-intro">
                  <h1 class="story-title">あなたの仲間たち</h1>
                  <div class="character-grid">
                    <CharacterAvatar
                      v-for="char in introCharacters"
                      :key="char.id"
                      :character="char"
                      :show-level="false"
                      :show-title="true"
                      class="intro-character"
                    />
                  </div>
                  <p class="story-text">
                    これらの仲間たちが、あなたの冒険をサポートします。
                    共に音響銀河を救いましょう！
                  </p>
                </div>
              </div>
              
              <!-- ステップ4: 冒険開始 -->
              <div v-else-if="currentStep === 3" class="step-content">
                <div class="story-icon cosmic-glow">🚀</div>
                <h1 class="story-title">Sound Galaxy Academyへようこそ</h1>
                <p class="story-text">
                  さあ、壮大な冒険の始まりです！
                  5つの惑星を巡り、失われた音素エネルギーを取り戻しましょう。
                </p>
                <div class="planets-preview">
                  <div v-for="planet in planets" :key="planet.id" class="planet-item">
                    <span class="planet-icon">{{ planet.icon }}</span>
                    <span class="planet-name">{{ planet.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
          
          <!-- ナビゲーション -->
          <div class="story-navigation">
            <div class="progress-dots">
              <span
                v-for="i in totalSteps"
                :key="i"
                class="dot"
                :class="{ 'active': i - 1 === currentStep }"
              ></span>
            </div>
            
            <div class="nav-buttons">
              <button
                v-if="currentStep > 0"
                @click="previousStep"
                class="nav-button secondary"
              >
                戻る
              </button>
              
              <button
                @click="currentStep < totalSteps - 1 ? nextStep() : completeOnboarding()"
                class="nav-button primary"
              >
                {{ currentStep < totalSteps - 1 ? '次へ' : '冒険を始める' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { useGameStore } from '@/stores/gameStore'
import CharacterAvatar from './CharacterAvatar.vue'

export default {
  name: 'OnboardingStory',
  components: {
    CharacterAvatar
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['complete'],
  setup(_, { emit }) {
    const characterStore = useCharacterStore()
    const gameStore = useGameStore()
    
    const currentStep = ref(0)
    const totalSteps = 4
    
    const introCharacters = computed(() => [
      characterStore.characters.echo,
      characterStore.characters.sonic,
      { ...characterStore.characters.grammar, unlocked: true },
      { ...characterStore.characters.captain, unlocked: true }
    ])
    
    const planets = [
      { id: 'phonics', icon: '🟡', name: 'Phonics Planet' },
      { id: 'grammar', icon: '🔵', name: 'Grammar Galaxy' },
      { id: 'vocabulary', icon: '🟢', name: 'Vocabulary Village' },
      { id: 'pattern', icon: '🟣', name: 'Pattern Paradise' },
      { id: 'practice', icon: '🚀', name: 'Practice Port' }
    ]
    
    const nextStep = () => {
      if (currentStep.value < totalSteps - 1) {
        currentStep.value++
      }
    }
    
    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--
      }
    }
    
    const completeOnboarding = () => {
      // オンボーディング完了フラグを保存
      gameStore.setOnboardingCompleted()
      emit('complete')
    }
    
    return {
      currentStep,
      totalSteps,
      introCharacters,
      planets,
      nextStep,
      previousStep,
      completeOnboarding
    }
  }
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.story-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.animated-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20% 30%, white, transparent),
    radial-gradient(2px 2px at 60% 70%, white, transparent),
    radial-gradient(1px 1px at 50% 50%, white, transparent);
  background-size: 200px 200px;
  animation: stars-move 100s linear infinite;
}

.galaxy-swirl {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, 
    transparent 0%, 
    rgba(102, 126, 234, 0.1) 40%, 
    rgba(240, 147, 251, 0.1) 60%, 
    transparent 100%);
  animation: swirl 30s linear infinite;
}

@keyframes stars-move {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

@keyframes swirl {
  from { transform: rotate(0deg) scale(1.5); }
  to { transform: rotate(360deg) scale(1.5); }
}

.story-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 90%;
  text-align: center;
  color: white;
}

.story-step {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.step-content {
  animation: entrance 0.8s ease-out;
}

@keyframes entrance {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.story-icon {
  font-size: 80px;
  margin-bottom: 2rem;
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.story-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  background: linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.story-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: #e2e8f0;
  max-width: 600px;
  margin: 0 auto;
}

.characters-intro {
  width: 100%;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  justify-items: center;
}

.intro-character {
  transform: scale(0.9);
  animation: character-appear 0.5s ease-out forwards;
}

.intro-character:nth-child(1) { animation-delay: 0.1s; }
.intro-character:nth-child(2) { animation-delay: 0.2s; }
.intro-character:nth-child(3) { animation-delay: 0.3s; }
.intro-character:nth-child(4) { animation-delay: 0.4s; }

@keyframes character-appear {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(0.9) translateY(0);
  }
}

.planets-preview {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.planet-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  animation: planet-appear 0.5s ease-out forwards;
}

.planet-item:nth-child(1) { animation-delay: 0.1s; }
.planet-item:nth-child(2) { animation-delay: 0.2s; }
.planet-item:nth-child(3) { animation-delay: 0.3s; }
.planet-item:nth-child(4) { animation-delay: 0.4s; }
.planet-item:nth-child(5) { animation-delay: 0.5s; }

@keyframes planet-appear {
  from {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.planet-icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px currentColor);
}

.planet-name {
  font-size: 0.875rem;
  color: #94a3b8;
}

.story-navigation {
  margin-top: 3rem;
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: #60a5fa;
  transform: scale(1.2);
  box-shadow: 0 0 10px #60a5fa;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.nav-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.nav-button.primary {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  color: white;
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.4);
}

.nav-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(96, 165, 250, 0.6);
}

.nav-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.nav-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.cosmic-glow {
  filter: drop-shadow(0 0 20px currentColor);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>