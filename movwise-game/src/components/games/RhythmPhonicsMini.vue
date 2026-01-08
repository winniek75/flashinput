<template>
  <div class="rhythm-phonics-mini">
    <!-- Background with beat visualization -->
    <div class="game-background" :class="{ 'beat-pulse': isBeatActive }">
      <div class="beat-circles">
        <div
          v-for="n in 8"
          :key="n"
          class="beat-circle"
          :style="{
            animationDelay: `${n * 0.125}s`,
            animationDuration: `${60 / currentSong.bpm}s`
          }"
        ></div>
      </div>
    </div>

    <!-- Top UI -->
    <div class="top-ui">
      <!-- Back button -->
      <button @click="exitGame" class="back-btn">
        ← 戻る
      </button>

      <!-- Streak display mini -->
      <div class="streak-mini">
        <span class="streak-flame">🔥</span>
        <span class="streak-count">{{ streakInfo.current }}</span>
      </div>

      <!-- Timer -->
      <div class="timer-display" :class="{ 'warning': remainingTime <= 30 }">
        <span class="timer-icon">⏱️</span>
        <span class="timer-text">{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Game Title -->
    <div class="game-title-area">
      <h1 class="game-title">🎵 3分リズムフォニックス</h1>
      <div class="song-info">
        <div class="song-title">{{ currentSong.title }}</div>
        <div class="song-artist">{{ currentSong.artist }}</div>
      </div>
    </div>

    <!-- Game Area -->
    <div v-if="gameState === 'menu'" class="menu-screen">
      <div class="song-selection">
        <h2>楽曲を選択</h2>
        <div class="song-grid">
          <div
            v-for="song in availableSongs"
            :key="song.id"
            @click="selectSong(song)"
            class="song-card"
            :class="{ selected: currentSong.id === song.id }"
          >
            <div class="song-cover">{{ song.emoji }}</div>
            <div class="song-info-card">
              <div class="song-name">{{ song.title }}</div>
              <div class="song-difficulty">
                <span v-for="n in song.difficulty" :key="n" class="star">⭐</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="startGame" class="start-btn" :disabled="!currentSong.id">
          🎮 ゲーム開始
        </button>
      </div>
    </div>

    <!-- Game Playing Screen -->
    <div v-else-if="gameState === 'playing'" class="game-screen">
      <!-- Score display -->
      <div class="score-area">
        <div class="score-item">
          <span class="score-label">スコア</span>
          <span class="score-value">{{ finalScore.toLocaleString() }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">コンボ</span>
          <span class="score-value combo" :class="comboClass">{{ combo }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">精度</span>
          <span class="score-value">{{ accuracy.toFixed(1) }}%</span>
        </div>
      </div>

      <!-- Current phoneme display -->
      <div class="phoneme-display">
        <div class="phoneme-card" :class="{ 'beat-active': isBeatPulse }">
          <div class="phoneme-symbol">{{ currentPhoneme.symbol }}</div>
          <div class="phoneme-example">{{ currentPhoneme.example }}</div>
        </div>
      </div>

      <!-- Beat track -->
      <div class="beat-track">
        <div class="track-line"></div>
        <div class="beat-target">🎯</div>

        <!-- Falling beats -->
        <div
          v-for="beat in fallingBeats"
          :key="beat.id"
          class="falling-beat"
          :style="{
            left: beat.lane + '%',
            top: beat.position + '%',
            transform: `scale(${beat.scale})`
          }"
          :class="{
            'beat-perfect': beat.result === 'perfect',
            'beat-good': beat.result === 'good',
            'beat-miss': beat.result === 'miss'
          }"
        >
          {{ beat.phoneme }}
        </div>
      </div>

      <!-- Input buttons -->
      <div class="input-area">
        <button
          v-for="(option, index) in currentOptions"
          :key="index"
          @click="hitBeat(index)"
          @touchstart="hitBeat(index)"
          class="input-btn"
          :class="{ 'active': activeBeat === index }"
          :disabled="!canInput"
        >
          <div class="btn-icon">{{ option.icon }}</div>
          <div class="btn-label">{{ option.label }}</div>
        </button>
      </div>

      <!-- Visual effects -->
      <div class="effects-layer">
        <div
          v-for="effect in activeEffects"
          :key="effect.id"
          class="hit-effect"
          :style="{
            left: effect.x + '%',
            top: effect.y + '%'
          }"
          :class="'effect-' + effect.type"
        >
          {{ effect.text }}
        </div>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-else-if="gameState === 'results'" class="results-screen">
      <div class="results-content">
        <div class="results-header">
          <h2>🏆 ゲーム結果</h2>
          <div class="final-score">{{ finalScore.toLocaleString() }}</div>
          <div v-if="streakBonus > 1" class="streak-bonus-display">
            🔥 ストリークボーナス ×{{ streakBonus.toFixed(1) }}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ totalHits }}</div>
            <div class="stat-label">ヒット数</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✨</div>
            <div class="stat-value">{{ perfectHits }}</div>
            <div class="stat-label">パーフェクト</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ maxCombo }}</div>
            <div class="stat-label">最大コンボ</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ accuracy.toFixed(1) }}%</div>
            <div class="stat-label">精度</div>
          </div>
        </div>

        <div class="performance-feedback">
          <div class="feedback-title">{{ getPerformanceRank() }}</div>
          <div class="feedback-message">{{ getPerformanceMessage() }}</div>
        </div>

        <div class="action-buttons">
          <button @click="playAgain" class="action-btn primary">
            🎮 もう一度
          </button>
          <button @click="changeSong" class="action-btn secondary">
            🎵 楽曲変更
          </button>
          <button @click="exitGame" class="action-btn">
            🏠 戻る
          </button>
        </div>
      </div>
    </div>

    <!-- Streak celebration -->
    <transition name="celebration">
      <div v-if="showCelebration" class="streak-celebration">
        <div class="celebration-content">
          <div class="celebration-title">{{ celebrationData?.reward.title }}</div>
          <div class="celebration-message">{{ celebrationData?.reward.message }}</div>
          <button @click="dismissCelebration" class="celebration-btn">
            🎉 受け取る
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStreakIntegration } from '@/composables/useStreakIntegration'
import logger from '@/utils/logger'

const router = useRouter()

// ストリーク統合
const {
  streakInfo,
  startGame: startStreakGame,
  endGame: endStreakGame,
  applyStreakBonus,
  getStreakBonus,
  showCelebration,
  celebrationData,
  dismissCelebration
} = useStreakIntegration('rhythm-phonics-mini', {
  minimumPlayTime: 60, // 最低1分
  minimumScore: 100,
  trackProgress: true
})

// ゲーム状態
const gameState = ref('menu') // 'menu', 'playing', 'results'
const gameStartTime = ref(null)
const gameDuration = 180 // 3分（秒）
const remainingTime = ref(gameDuration)
const gameTimer = ref(null)

// 楽曲データ
const availableSongs = ref([
  {
    id: 'phonics_basic',
    title: 'フォニックス・ベーシック',
    artist: 'MovWISE',
    bpm: 120,
    difficulty: 1,
    emoji: '🎵',
    phonemes: ['a', 'e', 'i', 'o', 'u', 'b', 'p', 't', 'd', 'k', 'g']
  },
  {
    id: 'vowel_adventure',
    title: 'ボーカル・アドベンチャー',
    artist: 'MovWISE',
    bpm: 100,
    difficulty: 2,
    emoji: '🌟',
    phonemes: ['æ', 'ɛ', 'ɪ', 'ɒ', 'ʊ', 'ə', 'ɜ:', 'ɑ:', 'i:', 'u:']
  },
  {
    id: 'consonant_clash',
    title: 'コンソナント・クラッシュ',
    artist: 'MovWISE',
    bpm: 140,
    difficulty: 3,
    emoji: '🔥',
    phonemes: ['θ', 'ð', 'ʃ', 'ʒ', 'tʃ', 'dʒ', 'ŋ', 'j', 'w', 'r', 'l']
  }
])

const currentSong = ref({ id: null })

// ゲームプレイ状態
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const totalHits = ref(0)
const perfectHits = ref(0)
const goodHits = ref(0)
const missedBeats = ref(0)
const currentPhoneme = ref({ symbol: '', example: '' })
const fallingBeats = ref([])
const activeEffects = ref([])
const activeBeat = ref(-1)
const canInput = ref(true)
const isBeatActive = ref(false)
const isBeatPulse = ref(false)

// ゲームメカニクス
let beatId = 0
let effectId = 0
const beatSpeed = ref(1.0)
const beatInterval = ref(null)
const animationFrame = ref(null)

// 計算プロパティ
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const accuracy = computed(() => {
  const total = totalHits.value + missedBeats.value
  return total > 0 ? (totalHits.value / total) * 100 : 100
})

const finalScore = computed(() => {
  return applyStreakBonus(score.value)
})

const streakBonus = computed(() => getStreakBonus())

const comboClass = computed(() => {
  if (combo.value >= 50) return 'combo-legendary'
  if (combo.value >= 30) return 'combo-epic'
  if (combo.value >= 20) return 'combo-great'
  if (combo.value >= 10) return 'combo-good'
  return ''
})

const currentOptions = computed(() => {
  if (!currentSong.value.phonemes) return []

  const phonemes = currentSong.value.phonemes
  const options = []

  // 正解の音素を含む4つのオプションを生成
  const correctIndex = Math.floor(Math.random() * 4)

  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) {
      options.push({
        phoneme: currentPhoneme.value.symbol,
        icon: currentPhoneme.value.symbol,
        label: currentPhoneme.value.example,
        correct: true
      })
    } else {
      const randomPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)]
      options.push({
        phoneme: randomPhoneme,
        icon: randomPhoneme,
        label: getPhonemeExample(randomPhoneme),
        correct: false
      })
    }
  }

  return options
})

// メソッド
const selectSong = (song) => {
  currentSong.value = song
  logger.log('Song selected:', song.title)
}

const startGame = () => {
  if (!currentSong.value.id) return

  // ストリーク記録開始
  startStreakGame({
    song: currentSong.value.title,
    difficulty: currentSong.value.difficulty,
    duration: gameDuration
  })

  gameState.value = 'playing'
  gameStartTime.value = Date.now()
  remainingTime.value = gameDuration

  resetGameStats()
  startGameTimer()
  startBeatGeneration()
  generateNextPhoneme()

  logger.log('Rhythm game started')
}

const resetGameStats = () => {
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  totalHits.value = 0
  perfectHits.value = 0
  goodHits.value = 0
  missedBeats.value = 0
  fallingBeats.value = []
  activeEffects.value = []
}

const startGameTimer = () => {
  gameTimer.value = setInterval(() => {
    remainingTime.value--

    if (remainingTime.value <= 0) {
      endGame()
    }

    // BPMに合わせたビート感
    if (currentSong.value.bpm) {
      const beatInterval = 60 / currentSong.value.bpm
      isBeatActive.value = (remainingTime.value % beatInterval) < 0.2
    }
  }, 1000)
}

const startBeatGeneration = () => {
  const generateBeat = () => {
    if (gameState.value !== 'playing') return

    // ランダムな音素でビートを生成
    const phoneme = currentSong.value.phonemes[Math.floor(Math.random() * currentSong.value.phonemes.length)]
    const lane = Math.random() * 80 + 10 // 10-90%

    fallingBeats.value.push({
      id: beatId++,
      phoneme,
      lane,
      position: -10,
      scale: 1,
      result: null,
      timestamp: Date.now()
    })

    // 次のビート生成をスケジュール
    const nextBeatDelay = (60 / currentSong.value.bpm) * 1000 * (0.5 + Math.random() * 0.5)
    setTimeout(generateBeat, nextBeatDelay)
  }

  generateBeat()

  // ビートアニメーション
  const animateBeats = () => {
    fallingBeats.value = fallingBeats.value
      .map(beat => ({
        ...beat,
        position: beat.position + beatSpeed.value
      }))
      .filter(beat => {
        if (beat.position > 110) {
          // 画面外に出たビートは自動的にミス
          if (!beat.result) {
            handleMiss()
          }
          return false
        }
        return true
      })

    if (gameState.value === 'playing') {
      animationFrame.value = requestAnimationFrame(animateBeats)
    }
  }

  animateBeats()
}

const generateNextPhoneme = () => {
  const phonemes = currentSong.value.phonemes
  const phoneme = phonemes[Math.floor(Math.random() * phonemes.length)]

  currentPhoneme.value = {
    symbol: phoneme,
    example: getPhonemeExample(phoneme)
  }

  // ビートパルス効果
  isBeatPulse.value = true
  setTimeout(() => {
    isBeatPulse.value = false
  }, 200)
}

const getPhonemeExample = (phoneme) => {
  const examples = {
    'a': 'cat',
    'e': 'bed',
    'i': 'bit',
    'o': 'hot',
    'u': 'but',
    'æ': 'cat',
    'ɛ': 'bed',
    'ɪ': 'bit',
    'ɒ': 'hot',
    'ʊ': 'book',
    'ə': 'about',
    'ɜ:': 'bird',
    'ɑ:': 'car',
    'i:': 'see',
    'u:': 'blue',
    'b': 'big',
    'p': 'pen',
    't': 'ten',
    'd': 'dog',
    'k': 'cat',
    'g': 'go',
    'θ': 'think',
    'ð': 'that',
    'ʃ': 'ship',
    'ʒ': 'measure',
    'tʃ': 'chair',
    'dʒ': 'jump',
    'ŋ': 'sing',
    'j': 'yes',
    'w': 'we',
    'r': 'red',
    'l': 'love'
  }
  return examples[phoneme] || phoneme
}

const hitBeat = (optionIndex) => {
  if (!canInput.value) return

  const option = currentOptions.value[optionIndex]
  activeBeat.value = optionIndex

  // ヒット判定
  const nearestBeat = findNearestBeat()

  if (nearestBeat && option.correct && nearestBeat.phoneme === option.phoneme) {
    handleHit(nearestBeat, getHitTiming(nearestBeat))
  } else {
    handleMiss()
  }

  // ボタンアニメーションリセット
  setTimeout(() => {
    activeBeat.value = -1
  }, 200)

  // 次の音素を生成
  setTimeout(() => {
    generateNextPhoneme()
  }, 500)
}

const findNearestBeat = () => {
  const targetPosition = 85 // ヒットライン
  let nearest = null
  let minDistance = Infinity

  fallingBeats.value.forEach(beat => {
    if (beat.result) return // 既に判定済み

    const distance = Math.abs(beat.position - targetPosition)
    if (distance < minDistance && distance < 15) { // 15%以内のマージン
      minDistance = distance
      nearest = beat
    }
  })

  return nearest
}

const getHitTiming = (beat) => {
  const targetPosition = 85
  const distance = Math.abs(beat.position - targetPosition)

  if (distance < 3) return 'perfect'
  if (distance < 8) return 'good'
  return 'miss'
}

const handleHit = (beat, timing) => {
  beat.result = timing

  let points = 0
  let comboBonus = Math.floor(combo.value / 10)

  switch (timing) {
    case 'perfect':
      points = 100 + comboBonus * 10
      perfectHits.value++
      combo.value++
      break
    case 'good':
      points = 50 + comboBonus * 5
      goodHits.value++
      combo.value++
      break
    default:
      points = 0
      combo.value = 0
  }

  totalHits.value++
  score.value += points
  maxCombo.value = Math.max(maxCombo.value, combo.value)

  // エフェクト表示
  showHitEffect(timing, beat.lane, 80, points)

  // サウンド再生
  playHitSound(timing)
}

const handleMiss = () => {
  missedBeats.value++
  combo.value = 0

  showHitEffect('miss', 50, 80, 0)
  playHitSound('miss')
}

const showHitEffect = (type, x, y, points) => {
  const effect = {
    id: effectId++,
    type,
    x,
    y,
    text: type === 'perfect' ? `Perfect! +${points}` :
          type === 'good' ? `Good! +${points}` :
          type === 'miss' ? 'Miss!' : ''
  }

  activeEffects.value.push(effect)

  // 2秒後にエフェクト削除
  setTimeout(() => {
    activeEffects.value = activeEffects.value.filter(e => e.id !== effect.id)
  }, 2000)
}

const playHitSound = (type) => {
  // 効果音再生（オプション）
  try {
    if (window.AudioManager?.play) {
      const soundMap = {
        perfect: 'perfect_hit',
        good: 'good_hit',
        miss: 'miss_sound'
      }
      window.AudioManager.play(soundMap[type] || 'click')
    }
  } catch (error) {
    // サウンド再生失敗は無視
  }
}

const endGame = () => {
  gameState.value = 'results'

  // タイマーとアニメーションを停止
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
    gameTimer.value = null
  }

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }

  // ストリーク記録（クエスト進捗も自動記録される）
  const gameResult = endStreakGame({
    score: finalScore.value,
    accuracy: accuracy.value,
    completed: true,
    perfectHits: perfectHits.value,
    goodHits: goodHits.value,
    maxCombo: maxCombo.value,
    song: currentSong.value.title,
    // クエスト用データ
    studyTime: Math.floor((Date.now() - gameStartTime.value) / 1000 / 60), // 分単位
    newWords: Math.floor(totalHits.value / 5), // 5ヒットで1新単語相当
    correctAnswers: perfectHits.value + goodHits.value
  })

  logger.log('Game ended with result:', gameResult)
}

const getPerformanceRank = () => {
  const acc = accuracy.value
  if (acc >= 95) return 'PERFECT!'
  if (acc >= 90) return 'EXCELLENT!'
  if (acc >= 85) return 'GREAT!'
  if (acc >= 80) return 'GOOD!'
  if (acc >= 70) return 'OK!'
  return 'TRY AGAIN!'
}

const getPerformanceMessage = () => {
  const acc = accuracy.value
  if (acc >= 95) return 'パーフェクト！あなたはリズムマスターです！'
  if (acc >= 90) return 'エクセレント！素晴らしいリズム感です！'
  if (acc >= 85) return 'グレート！とても上手になりました！'
  if (acc >= 80) return 'グッド！良いリズムを刻んでいます！'
  if (acc >= 70) return 'オーケー！練習を続けましょう！'
  return 'もう一度チャレンジしてみましょう！'
}

const playAgain = () => {
  gameState.value = 'menu'
  resetGameStats()
}

const changeSong = () => {
  gameState.value = 'menu'
  currentSong.value = { id: null }
  resetGameStats()
}

const exitGame = () => {
  // 進行中のゲームがあれば記録
  if (gameState.value === 'playing') {
    endGame()
  }

  router.back()
}

// ライフサイクル
onMounted(() => {
  // デフォルト楽曲選択
  if (availableSongs.value.length > 0) {
    currentSong.value = availableSongs.value[0]
  }

  logger.log('Rhythm Phonics Mini mounted')
})

onUnmounted(() => {
  // クリーンアップ
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
})
</script>

<style scoped>
.rhythm-phonics-mini {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}

/* Background */
.game-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  transition: all 0.2s ease;
}

.game-background.beat-pulse {
  filter: brightness(1.2);
}

.beat-circles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.beat-circle {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 50%;
  animation: float-beat infinite ease-in-out;
}

@keyframes float-beat {
  0%, 100% {
    transform: translateY(0) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 0.8;
  }
}

/* Top UI */
.top-ui {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  color: white;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.streak-mini {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: rgba(255, 100, 0, 0.2);
  border-radius: 1rem;
  font-weight: bold;
}

.streak-flame {
  font-size: 1.2rem;
  animation: flicker 1s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.timer-display.warning {
  background: rgba(255, 0, 0, 0.3);
  animation: timer-warning 1s ease-in-out infinite;
}

@keyframes timer-warning {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Game Title Area */
.game-title-area {
  text-align: center;
  padding: 1rem;
  color: white;
}

.game-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.song-info {
  margin-top: 0.5rem;
}

.song-title {
  font-size: 1.2rem;
  font-weight: bold;
}

.song-artist {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Menu Screen */
.menu-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  padding: 2rem;
}

.song-selection h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;
}

.song-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.song-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.song-card.selected {
  border-color: #ffa500;
  background: rgba(255, 165, 0, 0.2);
}

.song-cover {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.song-info-card {
  text-align: center;
}

.song-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.song-difficulty {
  display: flex;
  justify-content: center;
  gap: 0.1rem;
}

.star {
  font-size: 0.8rem;
}

.start-btn {
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 2rem;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Game Screen */
.game-screen {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
  color: white;
  padding: 0 1rem;
}

.score-area {
  display: flex;
  justify-content: space-around;
  padding: 1rem 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1rem;
  margin-bottom: 1rem;
}

.score-item {
  text-align: center;
}

.score-label {
  display: block;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.score-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
}

.score-value.combo.combo-good {
  color: #90EE90;
}

.score-value.combo.combo-great {
  color: #FFD700;
}

.score-value.combo.combo-epic {
  color: #FF69B4;
}

.score-value.combo.combo-legendary {
  color: #FF4500;
  animation: legendary-glow 1s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% { text-shadow: 0 0 10px currentColor; }
  50% { text-shadow: 0 0 20px currentColor; }
}

/* Phoneme Display */
.phoneme-display {
  text-align: center;
  margin: 1rem 0;
}

.phoneme-card {
  display: inline-block;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.phoneme-card.beat-active {
  background: rgba(255, 165, 0, 0.3);
  border-color: #ffa500;
  transform: scale(1.05);
}

.phoneme-symbol {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.phoneme-example {
  font-size: 1rem;
  opacity: 0.8;
}

/* Beat Track */
.beat-track {
  position: relative;
  flex: 1;
  margin: 1rem 0;
  min-height: 200px;
}

.track-line {
  position: absolute;
  bottom: 20%;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #ffa500, transparent);
  border-radius: 2px;
}

.beat-target {
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  z-index: 5;
}

.falling-beat {
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.1s ease;
  z-index: 3;
}

.falling-beat.beat-perfect {
  background: linear-gradient(135deg, #90EE90, #32CD32);
  color: white;
  animation: perfect-flash 0.5s ease;
}

.falling-beat.beat-good {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  animation: good-flash 0.5s ease;
}

.falling-beat.beat-miss {
  background: linear-gradient(135deg, #FF6B6B, #FF4444);
  color: white;
  animation: miss-flash 0.5s ease;
}

@keyframes perfect-flash {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

@keyframes good-flash {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes miss-flash {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.8); }
}

/* Input Area */
.input-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
}

.input-btn {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.input-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.input-btn:active,
.input-btn.active {
  background: rgba(255, 165, 0, 0.4);
  border-color: #ffa500;
  transform: scale(0.95);
}

.input-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.btn-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Effects */
.effects-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 100;
}

.hit-effect {
  position: absolute;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: hit-effect-animation 2s ease-out forwards;
}

.effect-perfect {
  color: #90EE90;
}

.effect-good {
  color: #FFD700;
}

.effect-miss {
  color: #FF6B6B;
}

@keyframes hit-effect-animation {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-50px) scale(1.2);
    opacity: 0;
  }
}

/* Results Screen */
.results-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  color: white;
  padding: 2rem;
}

.results-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.results-header {
  margin-bottom: 2rem;
}

.results-header h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.final-score {
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.streak-bonus-display {
  font-size: 1.2rem;
  color: #FF6B35;
  font-weight: bold;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  display: block;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.performance-feedback {
  margin-bottom: 2rem;
}

.feedback-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #FFD700;
}

.feedback-message {
  font-size: 1rem;
  opacity: 0.9;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #6B73FF, #9370DB);
  color: white;
}

.action-btn:not(.primary):not(.secondary) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* Celebrations */
.streak-celebration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.celebration-content {
  background: white;
  padding: 3rem;
  border-radius: 2rem;
  text-align: center;
  max-width: 400px;
  animation: bounce-in 0.5s ease;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.celebration-title {
  font-size: 2rem;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 1rem;
}

.celebration-message {
  color: #333;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.celebration-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  border: none;
  border-radius: 1rem;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.celebration-btn:hover {
  transform: scale(1.05);
}

/* Transitions */
.celebration-enter-active,
.celebration-leave-active {
  transition: opacity 0.5s ease;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .input-area {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .input-btn {
    min-height: 60px;
    padding: 0.75rem 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>