<template>
  <div class="preposition-gameplay" :class="`theme-${currentTheme}`">
    <TresCanvas :alpha="true" :shadows="true">
      <TresPerspectiveCamera 
        :position="[0, 5, 10]" 
        :fov="60" 
        :look-at="[0, 0, 0]"
      />
      
      <!-- Lighting -->
      <TresAmbientLight :intensity="0.4" />
      <TresDirectionalLight 
        :position="[5, 10, 5]" 
        :intensity="1"
        :cast-shadow="true"
      />
      
      <!-- Game Environment -->
      <TresGroup>
        <!-- Ground -->
        <TresMesh :position="[0, -1, 0]" :receive-shadow="true">
          <TresBoxGeometry :args="[20, 0.5, 20]" />
          <TresMeshStandardMaterial :color="groundColor" />
        </TresMesh>
        
        <!-- Player Character -->
        <TresGroup :position="playerPosition" :rotation="playerRotation" ref="playerGroup">
          <!-- Body -->
          <TresMesh 
            :position="[0, 0.5 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0]" 
            :rotation="walkingAnimation ? [0, Math.sin(Date.now() * 0.015) * 0.1, 0] : [0, Math.sin(Date.now() * 0.002) * 0.05, 0]"
          >
            <TresBoxGeometry :args="[0.8, 1, 0.6]" />
            <TresMeshStandardMaterial :color="isPlayerMoving ? 0x90ee90 : 0x4a90e2" />
          </TresMesh>
          <!-- Head -->
          <TresMesh 
            :position="[0, 1.3 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0]" 
            :rotation="walkingAnimation ? [0, Math.sin(Date.now() * 0.02) * 0.08, 0] : [0, Math.sin(Date.now() * 0.002) * 0.03, 0]"
          >
            <TresSphereGeometry :args="[0.4, 16, 16]" />
            <TresMeshStandardMaterial :color="0xfdbcb4" />
          </TresMesh>
          <!-- Arms -->
          <TresMesh 
            :position="[-0.6, 0.8 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0]" 
            :rotation="walkingAnimation ? [Math.sin(Date.now() * 0.025) * 0.5, 0, Math.sin(Date.now() * 0.025) * 0.1] : [0, 0, Math.sin(Date.now() * 0.004) * 0.05]"
          >
            <TresBoxGeometry :args="[0.3, 0.8, 0.3]" />
            <TresMeshStandardMaterial :color="0xfdbcb4" />
          </TresMesh>
          <TresMesh 
            :position="[0.6, 0.8 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0]" 
            :rotation="walkingAnimation ? [Math.sin(Date.now() * 0.025 + Math.PI) * 0.5, 0, Math.sin(Date.now() * 0.025 + Math.PI) * 0.1] : [0, 0, Math.sin(Date.now() * 0.004 + Math.PI) * 0.05]"
          >
            <TresBoxGeometry :args="[0.3, 0.8, 0.3]" />
            <TresMeshStandardMaterial :color="0xfdbcb4" />
          </TresMesh>
          <!-- Legs -->
          <TresMesh 
            :position="[-0.25, -0.2, 0]" 
            :rotation="walkingAnimation ? [Math.sin(Date.now() * 0.025) * 0.6, 0, 0] : [0, 0, 0]"
          >
            <TresBoxGeometry :args="[0.35, 0.8, 0.35]" />
            <TresMeshStandardMaterial :color="0x2c3e50" />
          </TresMesh>
          <TresMesh 
            :position="[0.25, -0.2, 0]" 
            :rotation="walkingAnimation ? [Math.sin(Date.now() * 0.025 + Math.PI) * 0.6, 0, 0] : [0, 0, 0]"
          >
            <TresBoxGeometry :args="[0.35, 0.8, 0.35]" />
            <TresMeshStandardMaterial :color="0x2c3e50" />
          </TresMesh>
          <!-- Eyes -->
          <TresMesh :position="[-0.15, 1.4 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0.35]">
            <TresSphereGeometry :args="[0.08, 8, 8]" />
            <TresMeshStandardMaterial :color="0x000000" />
          </TresMesh>
          <TresMesh :position="[0.15, 1.4 + (walkingAnimation ? 0 : Math.sin(Date.now() * 0.003) * 0.02), 0.35]">
            <TresSphereGeometry :args="[0.08, 8, 8]" />
            <TresMeshStandardMaterial :color="0x000000" />
          </TresMesh>
        </TresGroup>
        
        <!-- Three Paths -->
        <TresGroup v-for="(option, index) in currentOptions" :key="index">
          <!-- Path -->
          <TresMesh 
            :position="getPathPosition(index)"
            @click="selectAnswer(option, index)"
            @pointer-over="hoveredPath = index"
            @pointer-out="hoveredPath = null"
          >
            <TresBoxGeometry :args="[3, 0.1, 8]" />
            <TresMeshStandardMaterial 
              :color="getPathColor(index)"
              :emissive="hoveredPath === index ? 0x00ff00 : 0x000000"
              :emissive-intensity="0.2"
            />
          </TresMesh>
          
          <!-- Path Label -->
          <TresGroup :position="getLabelPosition(index)">
            <TresSprite>
              <TresSpriteMaterial 
                :color="0xffffff"
                :size="[2, 1]"
              />
            </TresSprite>
          </TresGroup>
          
          <!-- Path Gate -->
          <TresMesh :position="getGatePosition(index)">
            <TresBoxGeometry :args="[3, 3, 0.2]" />
            <TresMeshStandardMaterial 
              :color="0x666666"
              :transparent="true"
              :opacity="0.3"
            />
          </TresMesh>
        </TresGroup>
        
        <!-- Decorative Elements based on theme -->
        <TresGroup v-if="currentTheme === 'forest'">
          <!-- Trees -->
          <TresGroup v-for="i in 5" :key="`tree-${i}`">
            <TresMesh :position="getTreePosition(i)">
              <TresCylinderGeometry :args="[0.3, 0.5, 3, 8]" />
              <TresMeshStandardMaterial :color="0x8b4513" />
            </TresMesh>
            <TresMesh :position="getTreeTopPosition(i)">
              <TresConeGeometry :args="[1.5, 3, 8]" />
              <TresMeshStandardMaterial :color="0x228b22" />
            </TresMesh>
          </TresGroup>
        </TresGroup>
        
        <!-- Success/Failure Effects -->
        <TresGroup v-if="showEffect">
          <TresMesh v-if="effectType === 'success'" :position="[playerPosition[0], playerPosition[1] + 2, playerPosition[2]]">
            <TresSphereGeometry :args="[0.3, 16, 16]" />
            <TresMeshStandardMaterial 
              :color="0x00ff00"
              :transparent="true"
              :opacity="0.8"
              :emissive="0x00ff00"
              :emissive-intensity="0.5"
            />
          </TresMesh>
          <TresMesh v-if="effectType === 'failure'" :position="[playerPosition[0], playerPosition[1] + 2, playerPosition[2]]">
            <TresSphereGeometry :args="[0.3, 16, 16]" />
            <TresMeshStandardMaterial 
              :color="0xff0000"
              :transparent="true"
              :opacity="0.8"
              :emissive="0xff0000"
              :emissive-intensity="0.5"
            />
          </TresMesh>
        </TresGroup>
      </TresGroup>
      
      <!-- Camera Controls -->
      <OrbitControls 
        :enable-damping="true"
        :damping-factor="0.05"
        :min-distance="8"
        :max-distance="20"
        :max-polar-angle="Math.PI / 2.5"
        :enable-pan="false"
      />
    </TresCanvas>
    
    <!-- UI Overlay -->
    <div class="ui-overlay">
      <!-- Top Bar -->
      <div class="top-bar">
        <button @click="exitGame" class="exit-button">
          ← 戻る
        </button>
        
        <div class="planet-name">
          <span class="planet-icon">{{ currentPlanet?.icon }}</span>
          <span>{{ currentPlanet?.name }}</span>
        </div>
        
        <div class="score-display">
          スコア: {{ currentScore }}
        </div>
      </div>
      
      <!-- Question Panel -->
      <div class="question-panel">
        <div class="question-number">
          問題 {{ questionIndex + 1 }} / {{ totalQuestions }}
        </div>
        <div class="question-text">
          {{ displayQuestion }}
        </div>
        <div v-if="showHint" class="hint-text">
          💡 ヒント: {{ currentQuestion?.hint }}
        </div>
      </div>
      
      <!-- Answer Options -->
      <div class="answer-options">
        <div 
          v-for="(option, index) in currentOptions" 
          :key="index"
          class="option-card"
          :class="{
            'correct': showFeedback && option === currentQuestion?.correct,
            'incorrect': showFeedback && selectedAnswer === option && option !== currentQuestion?.correct,
            'hovered': hoveredPath === index
          }"
          @click="selectAnswer(option, index)"
        >
          <div class="option-label">{{ getPathLabel(index) }}</div>
          <div class="option-text">{{ option }}</div>
        </div>
      </div>
      
      <!-- Feedback Modal -->
      <transition name="fade">
        <div v-if="showFeedback" class="feedback-modal">
          <div class="feedback-content" :class="isCorrect ? 'success' : 'failure'">
            <div class="feedback-icon">
              {{ isCorrect ? '✅' : '❌' }}
            </div>
            <div class="feedback-message">
              {{ isCorrect ? '正解！' : '不正解...' }}
            </div>
            <div class="feedback-explanation">
              {{ currentQuestion?.explanation }}
            </div>
            <button @click="nextQuestion" class="next-button">
              {{ questionIndex < totalQuestions - 1 ? '次の問題' : '結果を見る' }}
            </button>
          </div>
        </div>
      </transition>
      
      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="streak-display" v-if="streak > 0">
          🔥 {{ streak }}連続正解中！
        </div>
      </div>
      
      <!-- Game Complete Modal -->
      <transition name="fade">
        <div v-if="isGameComplete" class="complete-modal">
          <div class="complete-content">
            <h2>ゲーム完了！</h2>
            <div class="final-score">
              <div class="score-label">最終スコア</div>
              <div class="score-value">{{ finalScore }}%</div>
            </div>
            <div class="stats">
              <div class="stat-item">
                <span class="stat-label">正解数:</span>
                <span class="stat-value">{{ correctCount }} / {{ totalQuestions }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">最大連続正解:</span>
                <span class="stat-value">{{ maxStreak }}</span>
              </div>
            </div>
            <div class="complete-actions">
              <button @click="retryGame" class="action-btn retry">
                もう一度挑戦
              </button>
              <button @click="backToStation" class="action-btn back">
                宇宙ステーションに戻る
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import '@/assets/css/preposition-game.css'
import { useRouter, useRoute } from 'vue-router'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { usePrepositionGameStore } from '@/stores/grammarGalaxy/prepositionGameStore'
import { getRandomQuestions } from '@/data/grammarGalaxy/prepositionQuestions'
import { useGameSounds } from '@/composables/useGameSounds'

const router = useRouter()
const route = useRoute()
const gameStore = usePrepositionGameStore()

// 音響システム
const {
  playSound,
  playCorrect,
  playIncorrect,
  playClick,
  playWhoosh,
  enableAudioOnUserGesture
} = useGameSounds()

// Game state
const category = ref(route.params.category)
const questions = ref([])
const questionIndex = ref(0)
const currentScore = ref(0)
const correctCount = ref(0)
const streak = ref(0)
const maxStreak = ref(0)
const selectedAnswer = ref(null)
const showFeedback = ref(false)
const isCorrect = ref(false)
const isGameComplete = ref(false)
const showHint = ref(false)

// 3D state
const playerPosition = ref([0, 0, 3])
const hoveredPath = ref(null)
const showEffect = ref(false)
const effectType = ref(null)
const isPlayerMoving = ref(false)
const playerRotation = ref([0, 0, 0])
const walkingAnimation = ref(false)

// Computed
const currentPlanet = computed(() => 
  gameStore.planets.find(p => p.id === category.value)
)

const currentTheme = computed(() => currentPlanet.value?.theme || 'default')

const groundColor = computed(() => {
  const themes = {
    forest: '#3e8e41',
    clocktower: '#8b7355',
    calendar: '#4a90e2',
    factory: '#696969',
    community: '#9c27b0'
  }
  return themes[currentTheme.value] || '#666666'
})

const currentQuestion = computed(() => questions.value[questionIndex.value])

const currentOptions = computed(() => currentQuestion.value?.options || [])

const displayQuestion = computed(() => {
  const sentence = currentQuestion.value?.sentence || ''
  return sentence.replace('___', '[  ?  ]')
})

const totalQuestions = computed(() => questions.value.length)

const progressPercentage = computed(() => 
  Math.round((questionIndex.value / totalQuestions.value) * 100)
)

const finalScore = computed(() => 
  Math.round((correctCount.value / totalQuestions.value) * 100)
)

// Methods
const getPathPosition = (index) => {
  const positions = [[-4, 0, -2], [0, 0, -2], [4, 0, -2]]
  return positions[index]
}

const getLabelPosition = (index) => {
  const positions = [[-4, 2, -5], [0, 2, -5], [4, 2, -5]]
  return positions[index]
}

const getGatePosition = (index) => {
  const positions = [[-4, 1.5, -6], [0, 1.5, -6], [4, 1.5, -6]]
  return positions[index]
}

const getPathLabel = (index) => {
  const labels = ['道 A', '道 B', '道 C']
  return labels[index]
}

const getPathColor = (index) => {
  if (showFeedback.value) {
    const option = currentOptions.value[index]
    if (option === currentQuestion.value?.correct) {
      return '#00ff00'
    }
    if (selectedAnswer.value === option) {
      return '#ff0000'
    }
  }
  if (hoveredPath.value === index) {
    return '#ffff00'
  }
  return '#888888'
}

const getTreePosition = (index) => {
  const positions = [
    [-8, 1.5, -5],
    [8, 1.5, -5],
    [-6, 1.5, 2],
    [6, 1.5, 2],
    [0, 1.5, -10]
  ]
  return positions[index - 1]
}

const getTreeTopPosition = (index) => {
  const base = getTreePosition(index)
  return [base[0], base[1] + 2, base[2]]
}


const selectAnswer = async (answer, pathIndex) => {
  if (showFeedback.value || isGameComplete.value || isPlayerMoving.value) return

  selectedAnswer.value = answer
  isCorrect.value = answer === currentQuestion.value?.correct

  // 選択時のクリック音
  playClick()

  // Start player movement animation
  isPlayerMoving.value = true
  walkingAnimation.value = true

  // 移動開始音（ヒュー音）
  playWhoosh()
  
  // Calculate target position and rotation
  const targetPositions = [[-4, 0, 0], [0, 0, 0], [4, 0, 0]]
  const targetPosition = targetPositions[pathIndex]
  const targetRotation = [0, pathIndex === 0 ? Math.PI / 6 : pathIndex === 2 ? -Math.PI / 6 : 0, 0]
  
  // Animate movement over 1 second
  const startPosition = [...playerPosition.value]
  const startRotation = [...playerRotation.value]
  const animationDuration = 1000
  const startTime = Date.now()
  
  const animateMovement = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / animationDuration, 1)
    
    // Smooth easing function
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const easedProgress = easeInOut(progress)
    
    // Interpolate position - create new arrays for reactivity
    playerPosition.value = [
      startPosition[0] + (targetPosition[0] - startPosition[0]) * easedProgress,
      startPosition[1] + (targetPosition[1] - startPosition[1]) * easedProgress,
      startPosition[2] + (targetPosition[2] - startPosition[2]) * easedProgress
    ]
    
    // Interpolate rotation
    playerRotation.value = [
      startRotation[0] + (targetRotation[0] - startRotation[0]) * easedProgress,
      startRotation[1] + (targetRotation[1] - startRotation[1]) * easedProgress,
      startRotation[2] + (targetRotation[2] - startRotation[2]) * easedProgress
    ]
    
    if (progress < 1) {
      requestAnimationFrame(animateMovement)
    } else {
      // Animation complete
      walkingAnimation.value = false
      isPlayerMoving.value = false
      
      // Show feedback after movement
      setTimeout(() => {
        showFeedback.value = true

        // 正解/不正解の音効果
        if (isCorrect.value) {
          playCorrect()
        } else {
          playIncorrect()
        }
      }, 200)
    }
  }
  
  // Start animation
  requestAnimationFrame(animateMovement)
  
  // Update score and streak
  if (isCorrect.value) {
    correctCount.value++
    streak.value++
    if (streak.value > maxStreak.value) {
      maxStreak.value = streak.value
    }
    currentScore.value += 10 * Math.min(streak.value, 5)
    effectType.value = 'success'

    // コンボ音効果（3連続正解以上）
    if (streak.value >= 3) {
      setTimeout(() => {
        playSound('combo')
      }, 800)
    }
  } else {
    streak.value = 0
    effectType.value = 'failure'
  }
  
  gameStore.answerQuestion(isCorrect.value)
  
  // Show effect after movement completes
  setTimeout(() => {
    showEffect.value = true
    // Hide effect after 1 second
    setTimeout(() => {
      showEffect.value = false
    }, 1000)
  }, 1200)
}

const nextQuestion = () => {
  showFeedback.value = false
  selectedAnswer.value = null
  
  // Animate player back to starting position
  const startPosition = [...playerPosition.value]
  const startRotation = [...playerRotation.value]
  const targetPosition = [0, 0, 3]
  const targetRotation = [0, 0, 0]
  
  isPlayerMoving.value = true
  walkingAnimation.value = true
  
  const animationDuration = 800
  const startTime = Date.now()
  
  const animateReturn = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / animationDuration, 1)
    
    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const easedProgress = easeInOut(progress)
    
    // Interpolate position - create new arrays for reactivity
    playerPosition.value = [
      startPosition[0] + (targetPosition[0] - startPosition[0]) * easedProgress,
      startPosition[1] + (targetPosition[1] - startPosition[1]) * easedProgress,
      startPosition[2] + (targetPosition[2] - startPosition[2]) * easedProgress
    ]
    
    // Interpolate rotation
    playerRotation.value = [
      startRotation[0] + (targetRotation[0] - startRotation[0]) * easedProgress,
      startRotation[1] + (targetRotation[1] - startRotation[1]) * easedProgress,
      startRotation[2] + (targetRotation[2] - startRotation[2]) * easedProgress
    ]
    
    if (progress < 1) {
      requestAnimationFrame(animateReturn)
    } else {
      // Animation complete - reset all states
      walkingAnimation.value = false
      isPlayerMoving.value = false
      playerPosition.value = [0, 0, 3]
      playerRotation.value = [0, 0, 0]
      
      // Proceed to next question after animation
      if (questionIndex.value < totalQuestions.value - 1) {
        questionIndex.value++
        showHint.value = false
      } else {
        completeGame()
      }
    }
  }
  
  requestAnimationFrame(animateReturn)
}

const completeGame = async () => {
  isGameComplete.value = true

  // ゲーム完了音
  playSound('gameEnd')

  await gameStore.endGame()
}

const retryGame = () => {
  // Reset game state
  questionIndex.value = 0
  currentScore.value = 0
  correctCount.value = 0
  streak.value = 0
  maxStreak.value = 0
  isGameComplete.value = false
  showFeedback.value = false
  selectedAnswer.value = null
  
  // Reset player animation state
  isPlayerMoving.value = false
  walkingAnimation.value = false
  playerPosition.value = [0, 0, 3]
  playerRotation.value = [0, 0, 0]
  
  // Get new questions
  questions.value = getRandomQuestions(category.value, 10)
  gameStore.startGame(category.value)
}

const backToStation = () => {
  router.push('/grammar-galaxy/preposition-master')
}

const exitGame = () => {
  if (confirm('ゲームを終了しますか？進捗は保存されません。')) {
    gameStore.endGame()
    router.push('/grammar-galaxy/preposition-master')
  }
}

// Initialize
onMounted(async () => {
  // Reset all animation states on mount
  isPlayerMoving.value = false
  walkingAnimation.value = false
  playerPosition.value = [0, 0, 3]
  playerRotation.value = [0, 0, 0]

  // ユーザージェスチャーで音声を有効化
  await enableAudioOnUserGesture()

  questions.value = getRandomQuestions(category.value, 10)
  gameStore.startGame(category.value)

  // ゲーム開始音（少し遅らせて）
  setTimeout(() => {
    playSound('gameStart')
  }, 500)
})

// Show hint after 10 seconds
watch(questionIndex, () => {
  setTimeout(() => {
    if (!showFeedback.value && !isGameComplete.value) {
      showHint.value = true
    }
  }, 10000)
})
</script>

<style scoped>
.preposition-gameplay {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Theme backgrounds */
.theme-forest {
  background: linear-gradient(180deg, #87ceeb 0%, #98d98e 100%);
}

.theme-clocktower {
  background: linear-gradient(180deg, #ff9800 0%, #ff5722 100%);
}

.theme-calendar {
  background: linear-gradient(180deg, #2196f3 0%, #03a9f4 100%);
}

.theme-factory {
  background: linear-gradient(180deg, #757575 0%, #424242 100%);
}

.theme-community {
  background: linear-gradient(180deg, #9c27b0 0%, #673ab7 100%);
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.ui-overlay > * {
  pointer-events: auto;
}

/* Top Bar */
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
}

.exit-button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.exit-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.planet-name {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.planet-icon {
  font-size: 1.5rem;
}

.score-display {
  padding: 10px 20px;
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  color: white;
  font-weight: bold;
}

/* Question Panel */
.question-panel {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.question-number {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.question-text {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  line-height: 1.5;
}

.hint-text {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: 8px;
  color: #ffc107;
  font-size: 0.9rem;
  animation: fadeIn 0.5s;
}

/* Answer Options */
.answer-options {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.option-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
  text-align: center;
}

.option-card:hover,
.option-card.hovered {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffff00;
  transform: scale(1.05);
}

.option-card.correct {
  background: rgba(0, 255, 0, 0.3);
  border-color: #00ff00;
}

.option-card.incorrect {
  background: rgba(255, 0, 0, 0.3);
  border-color: #ff0000;
}

.option-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.option-text {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Feedback Modal */
.feedback-modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.feedback-content {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 20px;
  padding: 30px;
  min-width: 300px;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
}

.feedback-content.success {
  border: 2px solid #00ff00;
}

.feedback-content.failure {
  border: 2px solid #ff0000;
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.feedback-message {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.feedback-explanation {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 20px;
}

.next-button {
  padding: 12px 30px;
  background: linear-gradient(45deg, #00ffff, #0066ff);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.next-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

/* Progress Bar */
.progress-bar-container {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0066ff);
  transition: width 0.5s ease;
}

.streak-display {
  text-align: center;
  color: #ffc107;
  margin-top: 10px;
  font-weight: bold;
  animation: pulse 1s infinite;
}

/* Complete Modal */
.complete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.complete-content {
  background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
  border: 2px solid rgba(0, 102, 255, 0.5);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 102, 255, 0.5);
}

.complete-content h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 20px;
}

.final-score {
  margin-bottom: 30px;
}

.score-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
  margin-bottom: 10px;
}

.score-value {
  color: #00ffff;
  font-size: 3rem;
  font-weight: bold;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.stat-value {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.complete-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.retry {
  background: linear-gradient(45deg, #ffc107, #ff9800);
  color: white;
}

.action-btn.back {
  background: linear-gradient(45deg, #00ffff, #0066ff);
  color: white;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .question-text {
    font-size: 1.2rem;
  }
  
  .answer-options {
    flex-direction: column;
    bottom: 40px;
    gap: 10px;
  }
  
  .option-card {
    min-width: 200px;
  }
}
</style>