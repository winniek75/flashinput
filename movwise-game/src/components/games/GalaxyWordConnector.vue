<template>
  <div class="min-h-screen galaxy-background relative overflow-hidden">
    <!-- Animated star layers -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>
    
    <!-- 戻るボタン -->
    <button
      @click="handleBack"
      class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
    >
      ← 戻る
    </button>

    <!-- ゲームヘッダー -->
    <header class="game-header">
      <div class="flex items-center gap-4">
        <div class="game-logo">
          <div class="logo-ring">
            <div class="logo-core">🌌</div>
            <div class="logo-orbit"></div>
          </div>
          <h1 class="game-title">ワードファミリー・コネクター</h1>
        </div>
      </div>
      
      <!-- ゲーム統計 -->
      <div class="stats-panel">
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-value">{{ score }}</span>
          <span class="stat-label">スコア</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🔥</span>
          <span class="stat-value">{{ combo }}</span>
          <span class="stat-label">コンボ</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⚡</span>
          <span class="stat-value">{{ energy }}</span>
          <span class="stat-label">エネルギー</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❤️</span>
          <span class="stat-value">{{ lives }}</span>
          <span class="stat-label">ライフ</span>
        </div>
      </div>
    </header>

    <!-- How To Play モーダル -->
    <div v-if="showHowToPlay" class="modal-backdrop">
      <div class="modal-content how-to-play">
        <div class="how-to-header">
          <h2 class="how-to-title">🌌 ギャラクシー・ワードコネクター</h2>
          <p class="how-to-subtitle">ワードファミリーを見つけて宇宙ステーションを完成させよう！</p>
        </div>

        <div class="how-to-steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>🎯 ミッション</h3>
              <p>同じ語尾パターン（例：-at）を持つ単語を見つけよう！<br>
              <strong>cat</strong>, <strong>hat</strong>, <strong>bat</strong> など</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>🎮 遊び方</h3>
              <p>グリッド内の単語をクリックして選択。<br>
              正解なら<span class="correct-demo">緑色</span>に光り、間違いなら<span class="incorrect-demo">赤色</span>に！</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>🔥 コンボシステム</h3>
              <p>連続で正解するとコンボ！<br>
              スコアがどんどん上がるよ！</p>
            </div>
          </div>

          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>⚡ パワーアップ</h3>
              <div class="power-demo">
                <span class="power-item">🔍 ヒント</span>
                <span class="power-item">🔄 シャッフル</span>
                <span class="power-item">⚡ エネルギー</span>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-grid">
          <h4>📝 例：-at ファミリー</h4>
          <div class="demo-words">
            <div class="demo-word correct">cat</div>
            <div class="demo-word correct">hat</div>
            <div class="demo-word incorrect">dog</div>
            <div class="demo-word correct">bat</div>
          </div>
          <p class="demo-explanation">
            <span class="correct-demo">緑の単語</span>が「-at」ファミリー、
            <span class="incorrect-demo">赤の単語</span>は違うファミリーです
          </p>
        </div>

        <button @click="startGame" class="start-game-btn">
          🚀 ミッション開始！
        </button>
      </div>
    </div>

    <!-- メインゲームエリア（1画面完結） -->
    <main v-if="!showHowToPlay" class="game-main">
      <!-- ゲームグリッド（中央） -->
      <div class="game-grid-container">
        <div class="grid-header">
          <div class="current-pattern">
            <span class="pattern-label">ターゲット:</span>
            <span class="pattern-text">-{{ currentPattern }}</span>
          </div>
          <div class="mission-compact">
            <span class="mission-text">{{ completedWords.length }}/{{ targetWords.length }} 完了</span>
            <div class="progress-bar-mini">
              <div 
                class="progress-fill" 
                :style="{ width: `${(completedWords.length / targetWords.length) * 100}%` }"
              ></div>
            </div>
          </div>
          <div class="combo-meter" :class="{ 'active': combo > 0 }">
            <div class="combo-fill" :style="{ width: `${Math.min(combo * 20, 100)}%` }"></div>
            <span class="combo-text">{{ combo }}連鎖</span>
          </div>
        </div>

        <!-- ワードグリッド（5x4のコンパクトグリッド） -->
        <div class="word-grid">
          <div
            v-for="(word, index) in wordGrid"
            :key="`${word.text}-${index}`"
            class="word-cell"
            :class="{
              'correct-family': word.isCorrect,
              'incorrect-family': !word.isCorrect,
              'selected': selectedCells.includes(index),
              'matched': word.matched,
              'explosion': word.explosion,
              'power-up': word.powerUp
            }"
            @click="selectCell(index)"
          >
            <div class="word-content">
              <div class="word-text">{{ word.text }}</div>
              <div v-if="word.powerUp" class="power-icon">{{ word.powerUp }}</div>
            </div>
            <div class="cell-glow"></div>
          </div>
        </div>

        <!-- パワーアップボタン -->
        <div class="power-ups">
          <button
            v-for="powerUp in availablePowerUps"
            :key="powerUp.type"
            class="power-up-btn"
            :class="{ 'disabled': powerUp.count <= 0 }"
            @click="usePowerUp(powerUp.type)"
            :disabled="powerUp.count <= 0"
          >
            <div class="power-icon">{{ powerUp.icon }}</div>
            <div class="power-count">{{ powerUp.count }}</div>
          </button>
        </div>
      </div>

      <!-- サイドパネル（コンパクト） -->
      <div class="side-panel-compact">
        <!-- 宇宙ステーション -->
        <div class="space-station-mini">
          <div class="station-core-mini">
            <div class="core-ring-mini rotating"></div>
            <div class="station-pattern-mini">-{{ currentPattern }}</div>
          </div>
          
          <!-- 発見した単語（衛星） -->
          <div class="satellites-mini">
            <div
              v-for="(word, index) in completedWords.slice(0, 6)"
              :key="word"
              class="satellite-mini"
              :style="getSatelliteMiniPosition(index)"
            >
              {{ word }}
            </div>
          </div>
        </div>

        <!-- コントロールセクション -->
        <div class="controls-section">
          <!-- ヒントボタン -->
          <button 
            class="hint-btn-compact"
            @click="useHint"
            :disabled="hints <= 0"
          >
            <span class="hint-icon">🔍</span>
            <span>ヒント ({{ hints }})</span>
          </button>

          <!-- ハウツーボタン -->
          <button @click="showHowToPlay = true" class="how-to-btn">
            <span>❓</span>
            <span>遊び方</span>
          </button>
          
          <!-- ヒント表示 -->
          <div v-if="currentHint" class="hint-text-compact">
            {{ currentHint }}
          </div>
        </div>
      </div>
    </main>

    <!-- パーティクルエフェクト -->
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="particle.style"
    >
      {{ particle.icon }}
    </div>

    <!-- レベル完了モーダル -->
    <div v-if="showLevelComplete" class="modal-backdrop">
      <div class="modal-content level-complete">
        <div class="completion-celebration">
          <div class="celebration-icon">🎉</div>
          <h2 class="completion-title">ミッション完了！</h2>
          <p class="completion-message">
            「-{{ currentPattern }}」ファミリーをマスターしました！
          </p>
        </div>
        
        <div class="completion-stats">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ score }}</div>
            <div class="stat-label">最終スコア</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ maxCombo }}</div>
            <div class="stat-label">最高コンボ</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ formatTime(timeElapsed) }}</div>
            <div class="stat-label">クリア時間</div>
          </div>
        </div>

        <div class="completion-actions">
          <button @click="nextLevel" class="next-btn">
            次のファミリー 🚀
          </button>
          <button @click="restartLevel" class="restart-btn">
            もう一度プレイ 🔄
          </button>
        </div>
      </div>
    </div>

    <!-- ゲームオーバーモーダル -->
    <div v-if="showGameOver" class="modal-backdrop">
      <div class="modal-content game-over">
        <div class="game-over-content">
          <div class="game-over-icon">💫</div>
          <h2 class="game-over-title">ミッション失敗</h2>
          <p class="game-over-message">
            エネルギーが切れました...<br>
            でも大丈夫！もう一度挑戦しましょう！
          </p>
        </div>
        
        <div class="game-over-actions">
          <button @click="restartLevel" class="retry-btn">
            再挑戦 💪
          </button>
          <button @click="goToHub" class="hub-btn">
            ハブに戻る 🏠
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'GalaxyWordConnector',
  setup() {
    const router = useRouter()

    // ゲーム状態
    const currentLevel = ref(0)
    const currentPattern = ref('at')
    const score = ref(0)
    const combo = ref(0)
    const maxCombo = ref(0)
    const energy = ref(100)
    const lives = ref(3)
    const hints = ref(3)
    const timeElapsed = ref(0)

    // UI状態
    const showHowToPlay = ref(true)
    const showLevelComplete = ref(false)
    const showGameOver = ref(false)
    const selectedCells = ref([])
    const currentHint = ref('')
    const particles = ref([])

    // ワードファミリーデータ
    const wordFamilies = {
      'at': {
        correct: ['cat', 'hat', 'bat', 'rat', 'mat', 'fat', 'sat', 'pat', 'flat', 'chat'],
        incorrect: ['dog', 'run', 'big', 'sun', 'car', 'bed', 'top', 'cup', 'pen', 'log', 'gem', 'fox']
      },
      'an': {
        correct: ['can', 'man', 'ran', 'pan', 'tan', 'fan', 'van', 'ban', 'plan', 'than'],
        incorrect: ['cat', 'big', 'sun', 'top', 'red', 'wet', 'dog', 'cup', 'bat', 'fox', 'gem', 'log']
      },
      'ap': {
        correct: ['cap', 'map', 'tap', 'gap', 'nap', 'sap', 'lap', 'rap', 'snap', 'trap'],
        incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'top', 'cup', 'pen', 'fox', 'gem']
      },
      'it': {
        correct: ['sit', 'hit', 'bit', 'fit', 'pit', 'kit', 'lit', 'wit', 'split', 'grit'],
        incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'top', 'cup', 'pen', 'fox', 'gem']
      },
      'op': {
        correct: ['top', 'hop', 'cop', 'mop', 'pop', 'shop', 'stop', 'drop', 'crop', 'prop'],
        incorrect: ['cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'cup', 'pen', 'bat', 'fox', 'gem']
      }
    }

    const patterns = Object.keys(wordFamilies)
    const wordGrid = ref([])
    const completedWords = ref([])
    const newlyCompleted = ref([])
    const targetWords = computed(() => wordFamilies[currentPattern.value].correct)

    // パワーアップ
    const availablePowerUps = ref([
      { type: 'hint', icon: '🔍', name: 'ヒント', count: 3 },
      { type: 'shuffle', icon: '🔄', name: 'シャッフル', count: 2 },
      { type: 'time', icon: '⏰', name: '時間延長', count: 1 },
      { type: 'energy', icon: '⚡', name: 'エネルギー', count: 2 }
    ])

    // ゲーム初期化
    const initializeGame = () => {
      const pattern = patterns[currentLevel.value]
      currentPattern.value = pattern
      
      completedWords.value = []
      newlyCompleted.value = []
      selectedCells.value = []
      
      score.value = 0
      combo.value = 0
      maxCombo.value = 0
      energy.value = 100
      lives.value = 3
      hints.value = 3
      timeElapsed.value = 0

      generateWordGrid()
      startTimer()
    }

    // ワードグリッド生成（5x4 = 20セル）
    const generateWordGrid = () => {
      const correct = [...wordFamilies[currentPattern.value].correct]
      const incorrect = [...wordFamilies[currentPattern.value].incorrect]
      
      // 正解単語6個、不正解単語14個を配置
      const selectedCorrect = correct.slice(0, 6)
      const selectedIncorrected = incorrect.sort(() => Math.random() - 0.5).slice(0, 14)
      
      const allWords = [...selectedCorrect, ...selectedIncorrected]
      const shuffled = allWords.sort(() => Math.random() - 0.5)
      
      wordGrid.value = shuffled.map(word => ({
        text: word,
        isCorrect: selectedCorrect.includes(word),
        matched: false,
        explosion: false,
        powerUp: Math.random() < 0.1 ? getPowerUpIcon() : null
      }))
    }

    const getPowerUpIcon = () => {
      const powerUps = ['💎', '⭐', '🚀', '⚡']
      return powerUps[Math.floor(Math.random() * powerUps.length)]
    }

    // セル選択
    const selectCell = (index) => {
      const cell = wordGrid.value[index]
      if (cell.matched) return

      if (cell.isCorrect && !completedWords.value.includes(cell.text)) {
        handleCorrectWord(cell, index)
      } else {
        handleIncorrectWord(index)
      }
    }

    // 正解処理
    const handleCorrectWord = (cell, index) => {
      cell.matched = true
      completedWords.value.push(cell.text)
      newlyCompleted.value.push(cell.text)
      
      // スコア計算
      const baseScore = 100
      const comboBonus = combo.value * 50
      const energyBonus = Math.floor(energy.value / 10) * 10
      const totalScore = baseScore + comboBonus + energyBonus
      
      score.value += totalScore
      combo.value++
      maxCombo.value = Math.max(maxCombo.value, combo.value)
      energy.value = Math.min(100, energy.value + 10)

      // パーティクル効果
      createParticles(index, '✨')
      
      // パワーアップ効果
      if (cell.powerUp) {
        handlePowerUpEffect(cell.powerUp)
      }

      // 音声フィードバック
      playSuccessSound()

      // レベル完了チェック
      if (completedWords.value.length >= targetWords.value.length) {
        setTimeout(() => {
          completeLevel()
        }, 1000)
      }

      setTimeout(() => {
        newlyCompleted.value = newlyCompleted.value.filter(w => w !== cell.text)
      }, 2000)
    }

    // 不正解処理
    const handleIncorrectWord = (index) => {
      combo.value = 0
      energy.value = Math.max(0, energy.value - 15)
      
      if (energy.value <= 0) {
        lives.value--
        if (lives.value <= 0) {
          gameOver()
        } else {
          energy.value = 50 // 少し回復
        }
      }

      // エラーエフェクト
      createParticles(index, '💥')
      playErrorSound()
    }

    // パーティクル生成
    const createParticles = (gridIndex, icon) => {
      const gridElement = document.querySelector('.word-grid')
      if (!gridElement) return

      const cellElement = gridElement.children[gridIndex]
      const rect = cellElement.getBoundingClientRect()
      
      for (let i = 0; i < 5; i++) {
        const particle = {
          id: Date.now() + i,
          icon,
          style: {
            position: 'fixed',
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top + rect.height / 2}px`,
            zIndex: 1000,
            fontSize: '1.5rem',
            pointerEvents: 'none',
            animation: `particle-float-${Math.floor(Math.random() * 3)} 2s ease-out forwards`
          }
        }
        
        particles.value.push(particle)
        
        setTimeout(() => {
          particles.value = particles.value.filter(p => p.id !== particle.id)
        }, 2000)
      }
    }

    // パワーアップ使用
    const usePowerUp = (type) => {
      const powerUp = availablePowerUps.value.find(p => p.type === type)
      if (!powerUp || powerUp.count <= 0) return

      powerUp.count--

      switch (type) {
        case 'hint':
          useHint()
          break
        case 'shuffle':
          shuffleGrid()
          break
        case 'time':
          energy.value = Math.min(100, energy.value + 30)
          break
        case 'energy':
          energy.value = 100
          break
      }
    }

    // ヒント機能
    const useHint = () => {
      if (hints.value <= 0) return
      
      hints.value--
      const remaining = targetWords.value.filter(word => !completedWords.value.includes(word))
      
      if (remaining.length > 0) {
        const hintWord = remaining[0]
        currentHint.value = `「${hintWord}」を探してみよう！`
        
        // グリッド内の該当セルをハイライト
        wordGrid.value.forEach((cell, index) => {
          if (cell.text === hintWord) {
            const element = document.querySelector(`.word-grid .word-cell:nth-child(${index + 1})`)
            if (element) {
              element.classList.add('hint-highlight')
              setTimeout(() => {
                element.classList.remove('hint-highlight')
              }, 3000)
            }
          }
        })

        setTimeout(() => {
          currentHint.value = ''
        }, 5000)
      }
    }

    // グリッドシャッフル
    const shuffleGrid = () => {
      const unmatchedCells = wordGrid.value.filter(cell => !cell.matched)
      const shuffled = unmatchedCells.sort(() => Math.random() - 0.5)
      
      let shuffleIndex = 0
      wordGrid.value.forEach((cell, index) => {
        if (!cell.matched) {
          wordGrid.value[index] = { ...shuffled[shuffleIndex] }
          shuffleIndex++
        }
      })
    }

    // 衛星位置計算
    const getSatellitePosition = (index) => {
      const angle = (index * 360 / 8) * (Math.PI / 180)
      const radius = 120 + (index % 3) * 20
      const centerX = 50
      const centerY = 50
      
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      return {
        left: `${x}px`,
        top: `${y}px`,
        animationDelay: `${index * 0.5}s`
      }
    }

    // ミニ衛星位置計算（コンパクト版）
    const getSatelliteMiniPosition = (index) => {
      const angle = (index * 60) * (Math.PI / 180) // 60度間隔
      const radius = 35
      
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.8}s`,
        animationDuration: '8s'
      }
    }

    // ゲーム開始（How-To-Playを閉じる）
    const startGame = () => {
      showHowToPlay.value = false
    }

    // タイマー
    let gameTimer = null
    const startTimer = () => {
      gameTimer = setInterval(() => {
        timeElapsed.value++
        energy.value = Math.max(0, energy.value - 0.5) // エネルギー自然減少
        
        if (energy.value <= 0 && lives.value > 0) {
          lives.value--
          if (lives.value > 0) {
            energy.value = 30
          } else {
            gameOver()
          }
        }
      }, 1000)
    }

    const stopTimer = () => {
      if (gameTimer) {
        clearInterval(gameTimer)
        gameTimer = null
      }
    }

    // ゲーム完了/終了
    const completeLevel = () => {
      stopTimer()
      showLevelComplete.value = true
    }

    const gameOver = () => {
      stopTimer()
      showGameOver.value = true
    }

    const nextLevel = () => {
      currentLevel.value = (currentLevel.value + 1) % patterns.length
      showLevelComplete.value = false
      initializeGame()
    }

    const restartLevel = () => {
      showLevelComplete.value = false
      showGameOver.value = false
      initializeGame()
    }

    // 音声効果
    const playSuccessSound = () => {
      // Web Audio API実装
      console.log('Success sound')
    }

    const playErrorSound = () => {
      // Web Audio API実装
      console.log('Error sound')
    }

    // 時間フォーマット
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // ナビゲーション
    const handleBack = () => {
      stopTimer()
      router.push('/sound-adventure')
    }

    const goToHub = () => {
      stopTimer()
      router.push('/sound-adventure')
    }

    // ライフサイクル
    onMounted(() => {
      initializeGame()
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      // 状態
      currentPattern,
      score,
      combo,
      maxCombo,
      energy,
      lives,
      hints,
      timeElapsed,
      wordGrid,
      completedWords,
      newlyCompleted,
      targetWords,
      selectedCells,
      currentHint,
      particles,
      showLevelComplete,
      showGameOver,
      availablePowerUps,
      
      // メソッド
      selectCell,
      usePowerUp,
      useHint,
      getSatellitePosition,
      getSatelliteMiniPosition,
      startGame,
      nextLevel,
      restartLevel,
      handleBack,
      goToHub,
      formatTime,
      
      // UI状態
      showHowToPlay
    }
  }
}
</script>

<style scoped>
/* Galaxy Background */
.galaxy-background {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%);
  position: relative;
  min-height: 100vh;
  overflow-y: auto;
  padding-bottom: 2rem;
}

/* Galaxy Components */
.galaxy-button {
  position: relative;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(148, 163, 184, 0.4);
}

/* Animated Stars */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.stars-layer-1 {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 3s linear infinite;
}

.stars-layer-2 {
  background-image: 
    radial-gradient(1px 1px at 40px 60px, #fff, transparent),
    radial-gradient(1px 1px at 80px 10px, rgba(255,255,255,0.7), transparent);
  background-repeat: repeat;
  background-size: 220px 120px;
  animation: sparkle 4s linear infinite reverse;
}

.stars-layer-3 {
  background-image: 
    radial-gradient(1px 1px at 60px 20px, rgba(255,255,255,0.4), transparent);
  background-repeat: repeat;
  background-size: 180px 90px;
  animation: sparkle 5s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

/* Game Header */
.game-header {
  position: relative;
  z-index: 10;
  padding: 1.5rem 2rem;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(148, 163, 184, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-ring {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(circle, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.logo-core {
  font-size: 1.8rem;
  animation: pulse 2s ease-in-out infinite;
}

.logo-orbit {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: rotate 3s linear infinite;
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.stats-panel {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e2e8f0;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Main Game Layout */
.game-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  min-height: auto;
}

/* Space Station */
.space-station {
  position: relative;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  height: fit-content;
}

.station-core {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: radial-gradient(circle, #1e293b, #0f172a);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid #667eea;
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
}

.core-ring {
  position: absolute;
  width: 220px;
  height: 220px;
  border: 2px solid rgba(102, 126, 234, 0.5);
  border-radius: 50%;
  border-top-color: #667eea;
  border-right-color: transparent;
}

.rotating {
  animation: rotate 4s linear infinite;
}

.station-pattern {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.pattern-words {
  font-size: 1.2rem;
  color: #94a3b8;
}

.satellites {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.satellite {
  position: absolute;
  animation: orbit 8s linear infinite;
}

.satellite-body {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.new-satellite {
  animation: satellite-appear 1s ease-out, orbit 8s linear infinite 1s;
}

/* Game Grid */
.game-grid {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.current-pattern {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pattern-label {
  color: #94a3b8;
  font-weight: 600;
}

.pattern-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.combo-meter {
  position: relative;
  width: 200px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.combo-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 8px;
  transition: width 0.3s ease;
}

.combo-meter.active .combo-fill {
  animation: combo-pulse 0.5s ease-in-out;
}

.combo-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Word Grid */
.word-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.word-cell {
  position: relative;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.word-cell:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.word-cell.correct-family {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.word-cell.incorrect-family {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.word-cell.matched {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  transform: scale(0.95);
}

.word-cell.hint-highlight {
  animation: hint-glow 3s ease-in-out;
}

.word-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.word-text {
  font-weight: bold;
  font-size: 1rem;
  color: #e2e8f0;
}

.power-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.2rem;
  animation: power-glow 2s ease-in-out infinite;
}

.cell-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.word-cell:hover .cell-glow {
  opacity: 1;
}

/* Power-ups */
.power-ups {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.power-up-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.power-up-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

.power-up-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.power-icon {
  font-size: 1.5rem;
}

.power-count {
  font-weight: bold;
  color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  min-width: 24px;
  text-align: center;
}

.power-name {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

/* Side Panel */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mission-panel,
.found-words,
.hint-panel {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.mission-title,
.found-title,
.hint-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.3);
}

.mission-objective {
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.mission-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-weight: bold;
  color: #667eea;
  font-size: 0.9rem;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.found-word {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  animation: word-appear 0.5s ease-out;
}

.hint-btn {
  width: 100%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hint-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.hint-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-text {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #f59e0b;
  font-weight: 600;
  text-align: center;
}

/* Particles */
.particle {
  pointer-events: none;
  z-index: 1000;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: rgba(30, 41, 59, 0.95);
  border-radius: 20px;
  padding: 3rem;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.level-complete .completion-celebration,
.game-over .game-over-content {
  margin-bottom: 2rem;
}

.celebration-icon,
.game-over-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

.completion-title,
.game-over-title {
  font-size: 2rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.completion-message,
.game-over-message {
  color: #94a3b8;
  line-height: 1.6;
  font-size: 1.1rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card .stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-card .stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 0.25rem;
}

.stat-card .stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

.completion-actions,
.game-over-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.next-btn,
.restart-btn,
.retry-btn,
.hub-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-btn,
.retry-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.restart-btn,
.hub-btn {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  color: white;
}

.next-btn:hover,
.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.restart-btn:hover,
.hub-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(148, 163, 184, 0.4);
}

/* Animations */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes satellite-appear {
  from { transform: scale(0) rotate(0deg); opacity: 0; }
  to { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes combo-pulse {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.2); }
}

@keyframes hint-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(245, 158, 11, 0); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
}

@keyframes power-glow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes word-appear {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes particle-float-0 {
  to { 
    transform: translate(20px, -40px);
    opacity: 0;
  }
}

@keyframes particle-float-1 {
  to { 
    transform: translate(-15px, -35px);
    opacity: 0;
  }
}

@keyframes particle-float-2 {
  to { 
    transform: translate(10px, -50px);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .game-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .side-panel {
    order: -1;
  }
}

@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .stats-panel {
    gap: 1rem;
  }
  
  .word-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }
  
  .power-ups {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
  
  .completion-actions,
  .game-over-actions {
    flex-direction: column;
  }
}

/* How To Play Modal */
.how-to-play {
  max-width: 800px;
  width: 90vw;
}

.how-to-header {
  text-align: center;
  margin-bottom: 2rem;
}

.how-to-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

.how-to-subtitle {
  font-size: 1.2rem;
  color: #94a3b8;
  line-height: 1.5;
}

.how-to-steps {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step-content h3 {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.correct-demo {
  color: #10b981;
  font-weight: bold;
}

.incorrect-demo {
  color: #ef4444;
  font-weight: bold;
}

.power-demo {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.power-item {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.demo-grid {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.demo-grid h4 {
  color: #e2e8f0;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.demo-words {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.demo-word {
  padding: 0.5rem;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.demo-word.correct {
  background: rgba(16, 185, 129, 0.3);
  color: #10b981;
  border: 2px solid #10b981;
}

.demo-word.incorrect {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border: 2px solid #ef4444;
}

.demo-explanation {
  font-size: 0.9rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.4;
}

.start-game-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-game-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Single-Screen Compact Layout */
.game-grid-container {
  background: rgba(30, 41, 59, 0.7);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.current-pattern {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pattern-label {
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
}

.pattern-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.mission-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mission-text {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.9rem;
}

.progress-bar-mini {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.combo-meter {
  position: relative;
  width: 120px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.combo-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ef4444);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.combo-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* Compact Word Grid (5x4) */
.word-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.word-cell {
  position: relative;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-height: 60px;
}

.word-text {
  font-weight: bold;
  font-size: 0.9rem;
  color: #e2e8f0;
}

/* Side Panel Compact */
.side-panel-compact {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  justify-content: space-between;
  align-items: flex-start;
}

.space-station-mini {
  position: relative;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  height: 180px;
  width: 250px;
  flex-shrink: 0;
}

.station-core-mini {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: radial-gradient(circle, #1e293b, #0f172a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.core-ring-mini {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 50%;
  border-top-color: #667eea;
  border-right-color: transparent;
}

.station-pattern-mini {
  font-size: 1rem;
  font-weight: bold;
  color: #667eea;
}

.satellites-mini {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.satellite-mini {
  position: absolute;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.7rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: orbit-mini 8s linear infinite;
}

.hint-btn-compact {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.hint-btn-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.hint-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-icon {
  font-size: 1rem;
}

.hint-text-compact {
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #f59e0b;
  font-weight: 600;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.3;
}

.how-to-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.how-to-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

@keyframes orbit-mini {
  from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
}

/* Controls Section */
.controls-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 200px;
  flex-shrink: 0;
}

/* Responsive for compact layout */
@media (max-width: 1200px) {
  .game-main {
    padding: 0.5rem;
    gap: 1rem;
  }
  
  .side-panel-compact {
    flex-direction: column;
    gap: 1rem;
  }
  
  .controls-section {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
  
  .space-station-mini {
    width: 100%;
    max-width: 500px;
    height: 140px;
    margin: 0 auto;
  }
  
  .station-core-mini {
    width: 60px;
    height: 60px;
  }
  
  .core-ring-mini {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 768px) {
  .game-main {
    padding: 0.5rem;
  }
  
  .word-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  
  .grid-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
  
  .side-panel-compact {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .controls-section {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .space-station-mini {
    width: 100%;
    height: 140px;
  }
  
  .hint-btn-compact,
  .how-to-btn {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>