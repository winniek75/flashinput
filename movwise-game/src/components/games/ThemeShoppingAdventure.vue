<template>
  <div class="theme-shopping-adventure">
    <!-- Galaxy Background -->
    <div class="galaxy-background">
      <div class="stars-layer stars-layer-1"></div>
      <div class="stars-layer stars-layer-2"></div>
      <div class="stars-layer stars-layer-3"></div>
    </div>

    <!-- Menu Screen -->
    <div v-if="gameState === 'menu'" class="galaxy-hub">
      <div class="central-hub">
        <div class="hub-header">
          <button @click="handleBack" class="space-nav-button">
            ← Vocabulary World
          </button>
          <h1 class="galaxy-title">🛸 テーマ・ショッピング・アドベンチャー</h1>
          <div class="captain-info">
            <span class="captain-rank">🚀 キャプテン</span>
            <span class="current-score">スコア: {{ score }}</span>
          </div>
        </div>

        <!-- Level Selection -->
        <div class="level-selection">
          <h2>🏪 音声で判断！宇宙ショッピングモール</h2>
          <p class="game-description">アイテムの音声を聞いて、ミッションテーマに合うものを集めよう！</p>

          <div class="level-grid">
            <div
              v-for="level in difficultyLevels"
              :key="level.id"
              class="level-card"
              :class="level.id"
              @click="startGame(level.id)"
            >
              <div class="level-icon">{{ level.icon }}</div>
              <h3>{{ level.name }}</h3>
              <p>{{ level.description }}</p>
              <div class="level-details">
                <span>カテゴリー: {{ level.categories }}種類</span>
                <span>制限時間: {{ level.timeLimit }}秒</span>
                <span>アイテム: {{ level.itemsPerCategory }}個</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Panel -->
        <div class="progress-dashboard">
          <div class="stats-panel">
            <div class="stat-item">
              <span class="stat-icon">🏆</span>
              <span class="stat-label">ハイスコア</span>
              <span class="stat-value">{{ highScore || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-label">正確率</span>
              <span class="stat-value">{{ Math.round(overallAccuracy) }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <span class="stat-label">連続正解</span>
              <span class="stat-value">{{ bestCombo }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📦</span>
              <span class="stat-label">総収集</span>
              <span class="stat-value">{{ totalItemsCollected }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Screen -->
    <div v-else-if="gameState === 'playing'" class="game-container">
      <div class="game-header">
        <button @click="backToMenu" class="space-nav-button">
          ← メニュー
        </button>
        <div class="mission-panel">
          <div class="mission-content">
            <span class="mission-label">ミッション</span>
            <span class="mission-description">{{ currentMission.description }}</span>
          </div>
          <div class="mission-status">
            <div class="status-item">
              <span class="status-icon">📦</span>
              <span class="status-value">{{ collectedItems.length }}/{{ currentMission.target }}</span>
            </div>
            <div class="status-item timer" :class="{ warning: timeLeft < 20 }">
              <span class="status-icon">⏱️</span>
              <span class="status-value">{{ timeLeft }}秒</span>
            </div>
            <div class="status-item">
              <span class="status-icon">⭐</span>
              <span class="status-value">{{ score }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Shopping Mall Area -->
      <div class="shopping-mall-container">
        <div class="shopping-mall-grid">
          <div
            v-for="item in availableItems"
            :key="item.id"
            @click="selectItem(item)"
            class="shopping-item-card"
            :class="{
              'collected': item.collected,
              'wrong': item.wrongAnimation,
              'audio-played': item.audioPlayed,
              'special': item.special
            }"
          >
            <div class="item-card-content">
              <div class="mystery-box-icon">
                {{ item.collected ? '✅' : item.audioPlayed ? '📦' : '❓' }}
              </div>
              <button
                @click.stop="playAudio(item)"
                class="audio-play-button"
                :disabled="item.collected"
              >
                <span class="audio-icon">🔊</span>
                <span class="audio-label">{{ item.audioPlayed ? '再生' : '聞く' }}</span>
              </button>
            </div>
            <div v-if="item.special" class="special-badge">⭐</div>
          </div>
        </div>

        <!-- Collection Tracker -->
        <div class="collection-tracker">
          <h3 class="tracker-title">🛒 収集アイテム</h3>
          <div class="collected-items-row">
            <div
              v-for="(item, index) in collectedItems"
              :key="index"
              class="collected-badge"
            >
              {{ item.emoji || '📦' }}
            </div>
            <div
              v-for="n in (currentMission.target - collectedItems.length)"
              :key="'empty-' + n"
              class="collected-badge empty"
            >
              ⭕
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Results Screen -->
    <div v-else-if="gameState === 'results'" class="results-screen">
      <div class="results-container">
        <div class="results-header">
          <div class="results-icon">{{ gameResult.success ? '🎉' : '😅' }}</div>
          <h2>{{ gameResult.title }}</h2>
          <p>{{ gameResult.message }}</p>
        </div>

        <div class="results-stats">
          <div class="stat-item">
            <span class="stat-label">スコア</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">正答率</span>
            <span class="stat-value">{{ Math.round(accuracy) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">収集アイテム</span>
            <span class="stat-value">{{ collectedItems.length }}/{{ currentMission.target }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">時間</span>
            <span class="stat-value">{{ currentLevel === 'beginner' ? 90 - timeLeft : currentLevel === 'intermediate' ? 75 - timeLeft : 60 - timeLeft }}秒</span>
          </div>
        </div>

        <div class="results-actions">
          <button @click="restartGame" class="restart-btn">
            <span class="btn-icon">🔄</span>
            <span>もう一度</span>
          </button>
          <button @click="backToMenu" class="menu-btn">
            <span class="btn-icon">📋</span>
            <span>メニューへ</span>
          </button>
          <button @click="handleBack" class="exit-btn">
            <span class="btn-icon">🏠</span>
            <span>終了</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio ref="audioPlayer" @ended="onAudioEnded"></audio>

    <!-- Floating Combo Display -->
    <div v-if="showCombo && comboCount > 2" class="combo-display">
      <span class="combo-text">{{ comboCount }} COMBO!</span>
      <span class="combo-bonus">+{{ comboBonusScore }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'ThemeShoppingAdventure',
  emits: ['back', 'complete'],
  setup(props, { emit }) {
    // Game state
    const gameState = ref('menu') // 'menu', 'playing', 'results'
    const currentLevel = ref('beginner')
    const score = ref(0)
    const timeLeft = ref(90)
    const gameTimer = ref(null)
    const collectedItems = ref([])
    const availableItems = ref([])
    const wrongAttempts = ref(0)
    const comboCount = ref(0)
    const comboBonusScore = ref(0)
    const availablePowerups = ref([])
    const audioPlayer = ref(null)
    const showCombo = ref(false)
    const comboTimer = ref(null)

    // Statistics
    const highScore = ref(localStorage.getItem('shopping_highScore') || 0)
    const bestCombo = ref(0)
    const totalItemsCollected = ref(0)
    const overallAccuracy = ref(100)

    // Game data
    const difficultyLevels = ref([
      {
        id: 'beginner',
        name: '初級',
        description: '3カテゴリー、90秒',
        icon: '🟢',
        categories: 3,
        timeLimit: 90,
        itemsPerCategory: 5
      },
      {
        id: 'intermediate',
        name: '中級',
        description: '5カテゴリー、75秒',
        icon: '🟡',
        categories: 5,
        timeLimit: 75,
        itemsPerCategory: 7
      },
      {
        id: 'advanced',
        name: '上級',
        description: '8カテゴリー、60秒',
        icon: '🔴',
        categories: 8,
        timeLimit: 60,
        itemsPerCategory: 8
      }
    ])

    const itemDatabase = ref({
      food: {
        name: '食べ物',
        emoji: '🍎',
        items: [
          { id: 'apple', name: 'apple', emoji: '🍎', audio: 'apple' },
          { id: 'banana', name: 'banana', emoji: '🍌', audio: 'banana' },
          { id: 'pizza', name: 'pizza', emoji: '🍕', audio: 'pizza' },
          { id: 'cake', name: 'cake', emoji: '🎂', audio: 'cake' },
          { id: 'fish', name: 'fish', emoji: '🐟', audio: 'fish' },
          { id: 'bread', name: 'bread', emoji: '🍞', audio: 'bread' },
          { id: 'cheese', name: 'cheese', emoji: '🧀', audio: 'cheese' },
          { id: 'rice', name: 'rice', emoji: '🍚', audio: 'rice' }
        ]
      },
      animals: {
        name: '動物',
        emoji: '🐱',
        items: [
          { id: 'cat', name: 'cat', emoji: '🐱', audio: 'cat' },
          { id: 'dog', name: 'dog', emoji: '🐶', audio: 'dog' },
          { id: 'bird', name: 'bird', emoji: '🐦', audio: 'bird' },
          { id: 'elephant', name: 'elephant', emoji: '🐘', audio: 'elephant' },
          { id: 'lion', name: 'lion', emoji: '🦁', audio: 'lion' },
          { id: 'monkey', name: 'monkey', emoji: '🐵', audio: 'monkey' },
          { id: 'rabbit', name: 'rabbit', emoji: '🐰', audio: 'rabbit' },
          { id: 'bear', name: 'bear', emoji: '🐻', audio: 'bear' }
        ]
      },
      colors: {
        name: '色',
        emoji: '🌈',
        items: [
          { id: 'red', name: 'red', emoji: '🔴', audio: 'red' },
          { id: 'blue', name: 'blue', emoji: '🔵', audio: 'blue' },
          { id: 'green', name: 'green', emoji: '🟢', audio: 'green' },
          { id: 'yellow', name: 'yellow', emoji: '🟡', audio: 'yellow' },
          { id: 'purple', name: 'purple', emoji: '🟣', audio: 'purple' },
          { id: 'orange', name: 'orange', emoji: '🟠', audio: 'orange' },
          { id: 'pink', name: 'pink', emoji: '🩷', audio: 'pink' },
          { id: 'black', name: 'black', emoji: '⚫', audio: 'black' }
        ]
      },
      clothing: {
        name: '服',
        emoji: '👕',
        items: [
          { id: 'shirt', name: 'shirt', emoji: '👕', audio: 'shirt' },
          { id: 'pants', name: 'pants', emoji: '👖', audio: 'pants' },
          { id: 'shoes', name: 'shoes', emoji: '👟', audio: 'shoes' },
          { id: 'hat', name: 'hat', emoji: '👒', audio: 'hat' },
          { id: 'dress', name: 'dress', emoji: '👗', audio: 'dress' },
          { id: 'jacket', name: 'jacket', emoji: '🧥', audio: 'jacket' },
          { id: 'socks', name: 'socks', emoji: '🧦', audio: 'socks' },
          { id: 'gloves', name: 'gloves', emoji: '🧤', audio: 'gloves' }
        ]
      },
      places: {
        name: '場所',
        emoji: '🏠',
        items: [
          { id: 'house', name: 'house', emoji: '🏠', audio: 'house' },
          { id: 'school', name: 'school', emoji: '🏫', audio: 'school' },
          { id: 'park', name: 'park', emoji: '🏞️', audio: 'park' },
          { id: 'hospital', name: 'hospital', emoji: '🏥', audio: 'hospital' },
          { id: 'restaurant', name: 'restaurant', emoji: '🍽️', audio: 'restaurant' },
          { id: 'library', name: 'library', emoji: '📚', audio: 'library' },
          { id: 'store', name: 'store', emoji: '🏪', audio: 'store' },
          { id: 'beach', name: 'beach', emoji: '🏖️', audio: 'beach' }
        ]
      },
      emotions: {
        name: '感情',
        emoji: '😊',
        items: [
          { id: 'happy', name: 'happy', emoji: '😊', audio: 'happy' },
          { id: 'sad', name: 'sad', emoji: '😢', audio: 'sad' },
          { id: 'angry', name: 'angry', emoji: '😠', audio: 'angry' },
          { id: 'excited', name: 'excited', emoji: '🤩', audio: 'excited' },
          { id: 'tired', name: 'tired', emoji: '😴', audio: 'tired' },
          { id: 'surprised', name: 'surprised', emoji: '😲', audio: 'surprised' },
          { id: 'confused', name: 'confused', emoji: '😕', audio: 'confused' },
          { id: 'proud', name: 'proud', emoji: '😎', audio: 'proud' }
        ]
      },
      weather: {
        name: '天気',
        emoji: '☀️',
        items: [
          { id: 'sunny', name: 'sunny', emoji: '☀️', audio: 'sunny' },
          { id: 'rainy', name: 'rainy', emoji: '🌧️', audio: 'rainy' },
          { id: 'snowy', name: 'snowy', emoji: '❄️', audio: 'snowy' },
          { id: 'cloudy', name: 'cloudy', emoji: '☁️', audio: 'cloudy' },
          { id: 'windy', name: 'windy', emoji: '💨', audio: 'windy' },
          { id: 'stormy', name: 'stormy', emoji: '⛈️', audio: 'stormy' },
          { id: 'foggy', name: 'foggy', emoji: '🌫️', audio: 'foggy' },
          { id: 'hot', name: 'hot', emoji: '🔥', audio: 'hot' }
        ]
      },
      jobs: {
        name: '職業',
        emoji: '👨‍⚕️',
        items: [
          { id: 'doctor', name: 'doctor', emoji: '👨‍⚕️', audio: 'doctor' },
          { id: 'teacher', name: 'teacher', emoji: '👨‍🏫', audio: 'teacher' },
          { id: 'chef', name: 'chef', emoji: '👨‍🍳', audio: 'chef' },
          { id: 'pilot', name: 'pilot', emoji: '👨‍✈️', audio: 'pilot' },
          { id: 'artist', name: 'artist', emoji: '👨‍🎨', audio: 'artist' },
          { id: 'nurse', name: 'nurse', emoji: '👩‍⚕️', audio: 'nurse' },
          { id: 'farmer', name: 'farmer', emoji: '👨‍🌾', audio: 'farmer' },
          { id: 'police', name: 'police', emoji: '👮', audio: 'police' }
        ]
      }
    })

    // Current mission
    const currentMission = ref({
      category: '',
      description: '',
      target: 5
    })

    // Computed properties
    const accuracy = computed(() => {
      const totalAttempts = collectedItems.value.length + wrongAttempts.value
      return totalAttempts > 0 ? (collectedItems.value.length / totalAttempts) * 100 : 0
    })

    const gameResult = computed(() => {
      const success = collectedItems.value.length >= currentMission.value.target
      return {
        success,
        title: success ? 'ミッション完了！' : 'タイムアップ！',
        message: success
          ? 'すべてのアイテムを正しく集めました！'
          : 'もう少しでした。もう一度挑戦してみましょう！'
      }
    })

    // Methods
    const startGame = (difficulty) => {
      currentLevel.value = difficulty
      const level = difficultyLevels.value.find(l => l.id === difficulty)

      // Reset game state
      score.value = 0
      collectedItems.value = []
      wrongAttempts.value = 0
      comboCount.value = 0
      showCombo.value = false
      timeLeft.value = level.timeLimit

      // Clear any existing combo timer
      if (comboTimer.value) {
        clearTimeout(comboTimer.value)
        comboTimer.value = null
      }

      // Generate mission
      generateMission(level)

      // Generate items
      generateItems(level)

      // Initialize powerups
      initializePowerups()

      // Start timer
      startTimer()

      gameState.value = 'playing'
    }

    const generateMission = (level) => {
      const categories = Object.keys(itemDatabase.value)
      const availableCategories = categories.slice(0, level.categories)
      const missionCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]

      currentMission.value = {
        category: missionCategory,
        description: `${itemDatabase.value[missionCategory].name}を${level.itemsPerCategory}つ集めて！`,
        target: level.itemsPerCategory
      }
    }

    const generateItems = (level) => {
      const categories = Object.keys(itemDatabase.value)
      const selectedCategories = categories.slice(0, level.categories)
      const items = []

      // Add target category items
      const targetItems = itemDatabase.value[currentMission.value.category].items
        .slice(0, level.itemsPerCategory)
        .map(item => ({ ...item, category: currentMission.value.category, correct: true }))

      // Add decoy items from other categories
      selectedCategories.forEach(category => {
        if (category !== currentMission.value.category) {
          const decoyItems = itemDatabase.value[category].items
            .slice(0, 3)
            .map(item => ({ ...item, category: category, correct: false }))
          items.push(...decoyItems)
        }
      })

      items.push(...targetItems)

      // Shuffle items
      availableItems.value = items
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          ...item,
          id: `${item.category}_${item.id}_${index}`,
          collected: false,
          wrongAnimation: false,
          audioPlayed: false,
          special: Math.random() < 0.1 // 10% chance for special items
        }))
    }

    const initializePowerups = () => {
      availablePowerups.value = [
        {
          id: 'time-boost',
          name: '時間延長',
          icon: '⏰',
          effect: () => { timeLeft.value += 15 },
          used: false
        },
        {
          id: 'hint',
          name: 'ヒント',
          icon: '💡',
          effect: () => highlightCorrectItems(),
          used: false
        }
      ]
    }

    const startTimer = () => {
      gameTimer.value = setInterval(() => {
        timeLeft.value--
        if (timeLeft.value <= 0) {
          endGame()
        }
      }, 1000)
    }

    const selectItem = (item) => {
      if (item.collected) return

      // Check if audio has been played
      if (!item.audioPlayed) {
        // First play audio, don't select yet
        playAudio(item)
        return
      }

      if (item.correct) {
        // Correct selection
        item.collected = true
        collectedItems.value.push(item)
        comboCount.value++

        // Calculate score
        let points = 100
        if (item.special) points *= 2
        if (comboCount.value >= 3) {
          comboBonusScore.value = comboCount.value * 10
          points += comboBonusScore.value

          // Show combo display
          showCombo.value = true

          // Clear existing timer
          if (comboTimer.value) {
            clearTimeout(comboTimer.value)
          }

          // Hide combo after 2 seconds
          comboTimer.value = setTimeout(() => {
            showCombo.value = false
          }, 2000)
        }
        score.value += points

        // Check win condition
        if (collectedItems.value.length >= currentMission.value.target) {
          setTimeout(() => endGame(), 500)
        }
      } else {
        // Wrong selection
        wrongAttempts.value++
        comboCount.value = 0
        showCombo.value = false

        // Clear combo timer
        if (comboTimer.value) {
          clearTimeout(comboTimer.value)
          comboTimer.value = null
        }

        item.wrongAnimation = true
        setTimeout(() => {
          item.wrongAnimation = false
        }, 1000)
      }
    }

    const playAudio = (item) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(item.name)
        utterance.lang = 'en-US'
        utterance.rate = 0.8

        utterance.onend = () => {
          // Mark audio as played after speech ends
          item.audioPlayed = true
        }

        speechSynthesis.speak(utterance)

        // Also mark as played immediately for immediate UI feedback
        item.audioPlayed = true
      } else {
        // Fallback if speech synthesis is not available
        item.audioPlayed = true
      }
    }

    const usePowerup = (powerup) => {
      if (powerup.used) return
      powerup.effect()
      powerup.used = true
    }

    const highlightCorrectItems = () => {
      availableItems.value.forEach(item => {
        if (item.correct && !item.collected) {
          item.highlighted = true
          setTimeout(() => {
            item.highlighted = false
          }, 3000)
        }
      })
    }

    const endGame = () => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
        gameTimer.value = null
      }

      // Clear combo display and timer
      showCombo.value = false
      if (comboTimer.value) {
        clearTimeout(comboTimer.value)
        comboTimer.value = null
      }

      gameState.value = 'results'
    }

    const restartGame = () => {
      startGame(currentLevel.value)
    }

    const backToMenu = () => {
      // Clear combo display and timer
      showCombo.value = false
      if (comboTimer.value) {
        clearTimeout(comboTimer.value)
        comboTimer.value = null
      }
      gameState.value = 'menu'
    }

    const handleBack = () => {
      emit('back')
    }

    const onAudioEnded = () => {
      // Audio playback ended
    }

    // Lifecycle
    onUnmounted(() => {
      if (gameTimer.value) {
        clearInterval(gameTimer.value)
      }
      if (comboTimer.value) {
        clearTimeout(comboTimer.value)
      }
    })

    return {
      gameState,
      currentLevel,
      score,
      timeLeft,
      collectedItems,
      availableItems,
      currentMission,
      difficultyLevels,
      accuracy,
      gameResult,
      comboCount,
      comboBonusScore,
      availablePowerups,
      audioPlayer,
      showCombo,
      highScore,
      bestCombo,
      totalItemsCollected,
      overallAccuracy,
      startGame,
      selectItem,
      playAudio,
      usePowerup,
      restartGame,
      backToMenu,
      handleBack,
      onAudioEnded
    }
  }
}
</script>

<style scoped>
.theme-shopping-adventure {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #0d1421 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

/* Galaxy Background Animation */
.galaxy-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: 200px 200px;
}

.stars-layer-1 {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                    radial-gradient(2px 2px at 40px 70px, #eee, transparent),
                    radial-gradient(1px 1px at 50px 50px, #eee, transparent);
  animation: stars-move 200s linear infinite;
}

.stars-layer-2 {
  background-image: radial-gradient(3px 3px at 50px 160px, #ddd, transparent),
                    radial-gradient(1px 1px at 100px 40px, #fff, transparent);
  animation: stars-move 300s linear infinite;
}

.stars-layer-3 {
  background-image: radial-gradient(2px 2px at 130px 80px, #fff, transparent);
  animation: stars-move 400s linear infinite;
}

@keyframes stars-move {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

/* Galaxy Hub Style */
.galaxy-hub {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.central-hub {
  max-width: 1200px;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.space-nav-button {
  background: rgba(33, 150, 243, 0.2);
  border: 2px solid #2196f3;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.space-nav-button:hover {
  background: rgba(33, 150, 243, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
}

.galaxy-title {
  font-size: clamp(1rem, 4vw, 1.8rem);
  font-weight: bold;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffc107);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.captain-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.captain-rank {
  background: linear-gradient(45deg, #ff9800, #ff5722);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.current-score {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.1rem;
}

.level-selection {
  margin-bottom: 2rem;
}

.level-selection h2 {
  text-align: center;
  font-size: 1.8rem;
  color: #64b5f6;
  margin-bottom: 0.5rem;
}

.game-description {
  text-align: center;
  color: #b3e5fc;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.level-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  backdrop-filter: blur(10px);
}

.level-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.level-card.beginner:hover {
  border-color: #4caf50;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.2);
}

.level-card.intermediate:hover {
  border-color: #ff9800;
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.2);
}

.level-card.advanced:hover {
  border-color: #f44336;
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.2);
}

.level-icon {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.level-card h3 {
  color: #ffd700;
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
}

.level-card p {
  color: #b3e5fc;
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
}

.level-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #90a4ae;
}

.progress-dashboard {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-label {
  color: #b3e5fc;
  font-size: 0.9rem;
}

.stat-value {
  color: #ffd700;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: auto;
}

/* Game Container */
.game-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.mission-panel {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.mission-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.mission-label {
  color: #64b5f6;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.mission-description {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: bold;
}

.mission-status {
  display: flex;
  gap: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item.timer {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
}

.status-item.timer.warning {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-icon {
  font-size: 1.2rem;
}

.status-value {
  font-weight: bold;
  color: #ffd700;
}

.shopping-mall-container {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1.5rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shopping-mall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.shopping-item-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  backdrop-filter: blur(5px);
}

.shopping-item-card:hover {
  transform: translateY(-3px);
  border-color: #64b5f6;
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.2);
}

.shopping-item-card.audio-played {
  border-color: #64b5f6;
  background: rgba(33, 150, 243, 0.1);
}

.shopping-item-card.collected {
  opacity: 0.5;
  pointer-events: none;
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.shopping-item-card.wrong {
  animation: shake 0.6s;
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.shopping-item-card.special {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.item-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.mystery-box-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.audio-play-button {
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid rgba(33, 150, 243, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.audio-play-button:hover:not(:disabled) {
  background: rgba(33, 150, 243, 0.4);
  transform: scale(1.05);
}

.audio-play-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-icon {
  font-size: 1.1rem;
}

.special-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #1a1a2e;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.collection-tracker {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tracker-title {
  color: #64b5f6;
  margin: 0 0 1rem 0;
  text-align: center;
}

.collected-items-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.collected-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid #4caf50;
}

.collected-badge.empty {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  opacity: 0.5;
}

.combo-indicator {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: comboAppear 1s ease-out;
}

.combo-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.combo-bonus {
  font-size: 1.5rem;
  color: #4caf50;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}






/* Results Screen */
.results-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.results-container {
  max-width: 600px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.results-header {
  margin-bottom: 2rem;
}

.results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.results-header h2 {
  color: #ffd700;
  margin: 0 0 1rem 0;
}

.results-header p {
  color: #b3e5fc;
  font-size: 1.1rem;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #b3e5fc;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.restart-btn, .menu-btn, .exit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 2px solid;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.restart-btn {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
}

.restart-btn:hover {
  background: rgba(76, 175, 80, 0.4);
}

.menu-btn {
  background: rgba(33, 150, 243, 0.2);
  border-color: #2196f3;
}

.menu-btn:hover {
  background: rgba(33, 150, 243, 0.4);
}

.exit-btn {
  background: rgba(158, 158, 158, 0.2);
  border-color: #9e9e9e;
}

.exit-btn:hover {
  background: rgba(158, 158, 158, 0.4);
}

/* Combo Display */
.combo-display {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  pointer-events: none;
  animation: comboAppear 1s ease-out;
}

@keyframes comboAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.combo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.combo-bonus {
  font-size: 1.5rem;
  color: #4caf50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .galaxy-title {
    font-size: clamp(0.9rem, 3.5vw, 1.6rem);
  }

  .hub-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .level-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .galaxy-title {
    font-size: clamp(0.8rem, 3vw, 1.4rem);
  }

  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .game-title {
    font-size: 1.5rem;
  }

  .mission-panel {
    flex-direction: column;
    gap: 1rem;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
  }

  .level-grid {
    grid-template-columns: 1fr;
  }

  .results-stats {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .galaxy-title {
    font-size: clamp(0.7rem, 2.5vw, 1.2rem);
  }

  .hub-header {
    padding: 1rem;
  }

  .space-nav-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .captain-rank {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>