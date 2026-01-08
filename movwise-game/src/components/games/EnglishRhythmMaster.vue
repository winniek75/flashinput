<template>
  <div class="english-rhythm-master">
    <!-- Cosmic Background -->
    <div class="cosmic-background">
      <div class="stars-layer"></div>
      <div class="rhythm-waves"></div>
    </div>

    <!-- Header -->
    <div class="game-header">
      <div class="header-left">
        <button @click="goBack" class="cosmic-button">
          <ArrowLeft class="w-5 h-5" />
          戻る
        </button>
      </div>

      <div class="header-center">
        <h1 class="game-title">🎵 English Rhythm Master</h1>
        <p class="game-subtitle">英語の強弱リズムをマスターしよう！</p>
      </div>

      <div class="header-right">
        <div class="score-display">
          <div class="score-item">
            <span class="score-label">スコア</span>
            <span class="score-value">{{ gameStats.score }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">連続</span>
            <span class="score-value">{{ gameStats.streak }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Menu -->
    <div v-if="gameState === 'menu'" class="game-menu">
      <div class="menu-card">
        <h2 class="menu-title">学習モードを選択</h2>

        <div class="mode-grid">
          <button
            v-for="mode in gameModes"
            :key="mode.id"
            @click="selectMode(mode.id)"
            :class="['mode-card', { locked: mode.locked }]"
            :disabled="mode.locked"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <h3 class="mode-name">{{ mode.name }}</h3>
            <p class="mode-description">{{ mode.description }}</p>
            <div class="mode-stats">
              <div class="difficulty-stars">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= mode.difficulty }]">
                  {{ i <= mode.difficulty ? '★' : '☆' }}
                </span>
              </div>
              <div class="mode-progress">{{ mode.progress }}% 完了</div>
            </div>
            <div v-if="mode.locked" class="lock-overlay">
              <div class="lock-icon">🔒</div>
              <div class="unlock-requirement">{{ mode.unlockRequirement }}</div>
            </div>
          </button>
        </div>

        <div class="learning-tips">
          <h3>💡 学習のコツ</h3>
          <ul>
            <li><strong>強勢音（●）</strong>: 大きく、はっきりと発音される音節</li>
            <li><strong>弱勢音（○）</strong>: 小さく、短く発音される音節</li>
            <li><strong>機能語</strong>: 前置詞や代名詞は弱く発音されます</li>
            <li><strong>リズム</strong>: 強勢音の間隔が一定になるのが英語の特徴</li>
          </ul>
        </div>

        <!-- Audio Test Section -->
        <div class="audio-test-section">
          <h3>🔊 音声テスト</h3>
          <p class="audio-note">ゲームを始める前に音声が正常に動作することを確認してください</p>
          <div class="audio-test-buttons">
            <button @click="testAudio('speech')" class="test-button">
              📢 音声合成テスト
            </button>
            <button @click="testAudio('strong')" class="test-button">
              🥁 強勢音テスト
            </button>
            <button @click="testAudio('weak')" class="test-button">
              🔔 弱勢音テスト
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stress Beat Game (Mode 1) -->
    <div v-else-if="gameState === 'playing' && selectedMode === 'stress-beat'" class="stress-beat-game">
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${gameProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ currentChallengeIndex + 1 }} / {{ currentLevelChallenges.length }}</div>
      </div>

      <!-- Current Word/Phrase Display -->
      <div class="word-display">
        <div class="word-card">
          <div class="word-text">{{ currentChallenge?.word }}</div>
          <div class="word-meaning">{{ currentChallenge?.meaning }}</div>
          <div class="word-phonetics">{{ currentChallenge?.phonetics }}</div>

          <!-- Audio Play Button -->
          <button
            @click="playAudio"
            :disabled="isPlayingAudio"
            class="audio-button"
          >
            <Volume2 class="w-6 h-6" />
            {{ isPlayingAudio ? '再生中...' : '音声を聞く' }}
          </button>
        </div>
      </div>

      <!-- Rhythm Pattern Display -->
      <div class="rhythm-pattern">
        <h3 class="pattern-title">正しいリズムパターンを叩こう！</h3>
        <div class="syllables-container">
          <div
            v-for="(syllable, index) in currentChallenge?.syllables"
            :key="index"
            :class="['syllable-item', syllable.stress, {
              active: index === activeSyllableIndex,
              completed: index < completedSyllables,
              incorrect: incorrectSyllables.includes(index)
            }]"
          >
            <div class="syllable-text">{{ syllable.text }}</div>
            <div class="beat-indicator">
              {{ syllable.stress === 'strong' ? '●' : '○' }}
            </div>
            <div class="stress-label">
              {{ syllable.stress === 'strong' ? 'STRONG' : 'weak' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Countdown Display -->
      <div v-if="showCountdown" class="countdown-overlay">
        <div class="countdown-circle">
          <div class="countdown-number">{{ countdownValue || 'START!' }}</div>
        </div>
      </div>

      <!-- Rhythm Progress Indicator -->
      <div v-if="isRhythmPlaying" class="rhythm-progress">
        <div class="rhythm-timeline">
          <div
            v-for="(beat, index) in upcomingBeats"
            :key="index"
            :class="['timeline-beat', beat.stress, {
              current: index === activeSyllableIndex,
              completed: index < completedSyllables
            }]"
            :style="{ left: `${beat.timing * 100}%` }"
          >
            <div class="timeline-syllable">{{ beat.text }}</div>
            <div class="timeline-indicator">{{ beat.stress === 'strong' ? '●' : '○' }}</div>
          </div>
          <div class="rhythm-cursor" :style="{ left: `${currentBeatPosition * 10}%` }"></div>
        </div>
      </div>

      <!-- Beat Controls -->
      <div class="beat-controls">
        <div class="metronome-display">
          <div :class="['metronome-beat', { active: metronomeActive }]">
            <div class="beat-circle">♪</div>
            <div class="bpm-display">{{ currentBPM }} BPM</div>
            <div class="tolerance-display">許容範囲: ±{{ beatTolerance }}ms</div>
          </div>
        </div>

        <div class="beat-buttons">
          <button
            @click="tapBeat('strong')"
            :class="['beat-button', 'strong-beat', {
              highlighted: expectedBeat === 'strong',
              pressed: pressedButton === 'strong'
            }]"
            :disabled="!gameActive"
          >
            <div class="button-icon">🥁</div>
            <div class="button-label">STRONG</div>
            <div class="button-desc">強勢</div>
          </button>

          <button
            @click="tapBeat('weak')"
            :class="['beat-button', 'weak-beat', {
              highlighted: expectedBeat === 'weak',
              pressed: pressedButton === 'weak'
            }]"
            :disabled="!gameActive"
          >
            <div class="button-icon">🔔</div>
            <div class="button-label">weak</div>
            <div class="button-desc">弱勢</div>
          </button>
        </div>
      </div>

      <!-- Feedback Display -->
      <div v-if="showFeedback" class="feedback-display">
        <div :class="['feedback-card', feedbackType]">
          <div class="feedback-icon">
            {{ feedbackType === 'perfect' ? '🎉' :
               feedbackType === 'good' ? '👍' :
               feedbackType === 'miss' ? '😅' : '💪' }}
          </div>
          <div class="feedback-text">{{ feedbackMessage }}</div>
          <div v-if="feedbackType === 'miss'" class="feedback-hint">
            <strong>ヒント:</strong> {{ feedbackHint }}
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="game-controls">
        <button @click="pauseGame" class="control-button">
          <Pause class="w-5 h-5" />
          一時停止
        </button>
        <button @click="restartChallenge" class="control-button">
          <RefreshCw class="w-5 h-5" />
          やり直し
        </button>
        <button @click="skipChallenge" class="control-button">
          <SkipForward class="w-5 h-5" />
          スキップ
        </button>
      </div>
    </div>

    <!-- Results Screen -->
    <div v-else-if="gameState === 'results'" class="results-screen">
      <div class="results-card">
        <h2 class="results-title">🎉 レベル完了！</h2>

        <div class="results-stats">
          <div class="stat-item">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">{{ Math.round(gameStats.accuracy) }}%</div>
            <div class="stat-label">正確性</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⚡</div>
            <div class="stat-value">{{ gameStats.streak }}</div>
            <div class="stat-label">最高連続</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ gameStats.score }}</div>
            <div class="stat-label">総スコア</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">{{ Math.round(gameStats.averageResponseTime) }}ms</div>
            <div class="stat-label">平均反応時間</div>
          </div>
        </div>

        <div class="performance-feedback">
          <h3>パフォーマンス分析</h3>
          <div class="feedback-list">
            <div v-for="feedback in performanceFeedback" :key="feedback.type" class="feedback-item">
              <span class="feedback-emoji">{{ feedback.emoji }}</span>
              <span class="feedback-text">{{ feedback.message }}</span>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button @click="nextLevel" :disabled="!canAdvance" class="action-button primary">
            {{ canAdvance ? '次のレベルへ' : 'レベルロック中' }}
          </button>
          <button @click="retryLevel" class="action-button secondary">
            もう一度挑戦
          </button>
          <button @click="backToMenu" class="action-button secondary">
            メニューに戻る
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Volume2, Pause, RefreshCw, SkipForward } from 'lucide-vue-next'

export default {
  name: 'EnglishRhythmMaster',
  components: {
    ArrowLeft,
    Volume2,
    Pause,
    RefreshCw,
    SkipForward
  },
  setup() {
    const router = useRouter()

    // Game State
    const gameState = ref('menu') // menu, playing, results, paused
    const selectedMode = ref('')
    const gameActive = ref(false)
    const currentChallengeIndex = ref(0)
    const activeSyllableIndex = ref(0)
    const completedSyllables = ref(0)
    const incorrectSyllables = ref([])
    const metronomeActive = ref(false)
    const isPlayingAudio = ref(false)
    const showFeedback = ref(false)
    const feedbackType = ref('')
    const feedbackMessage = ref('')
    const feedbackHint = ref('')
    const pressedButton = ref('')
    const currentBPM = ref(100)

    // Real-time Rhythm System
    const gameStartTime = ref(0)
    const rhythmStartTime = ref(0)
    const isRhythmPlaying = ref(false)
    const currentBeatPosition = ref(0)
    const countdownValue = ref(0)
    const showCountdown = ref(false)
    const upcomingBeats = ref([])
    const beatTolerance = ref(200) // ms
    const currentLevelBPM = computed(() => {
      return stressBeatLevels.value[currentLevel.value]?.bpm || 100
    })

    // Game Statistics
    const gameStats = reactive({
      score: 0,
      streak: 0,
      maxStreak: 0,
      accuracy: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      averageResponseTime: 0,
      responseTimes: []
    })

    // Game Modes
    const gameModes = ref([
      {
        id: 'stress-beat',
        name: 'ストレス・ビート',
        description: '基本的な強勢パターンを学習',
        icon: '🥁',
        difficulty: 1,
        progress: 45,
        locked: false,
        unlockRequirement: ''
      },
      {
        id: 'function-words',
        name: '機能語フェード',
        description: '前置詞・代名詞の弱化を練習',
        icon: '🔇',
        difficulty: 2,
        progress: 0,
        locked: true,
        unlockRequirement: 'ストレス・ビートを80%以上でクリア'
      },
      {
        id: 'phrase-rhythm',
        name: 'フレーズ・リズム',
        description: '実用的なフレーズでリズム練習',
        icon: '💬',
        difficulty: 3,
        progress: 0,
        locked: true,
        unlockRequirement: '機能語フェードを70%以上でクリア'
      },
      {
        id: 'conversation-flow',
        name: '会話フロー',
        description: '自然な会話でのリズム習得',
        icon: '🗣️',
        difficulty: 4,
        progress: 0,
        locked: true,
        unlockRequirement: 'フレーズ・リズムを75%以上でクリア'
      }
    ])

    // Stress Beat Game Data - Corrected and Enhanced
    const stressBeatLevels = ref([
      {
        level: 1,
        name: '2音節語',
        bpm: 100,
        challenges: [
          {
            word: 'TABLE',
            meaning: 'テーブル',
            phonetics: '/ˈteɪbəl/',
            syllables: [
              { text: 'TA', stress: 'strong', timing: 0.0, duration: 0.6 },
              { text: 'ble', stress: 'weak', timing: 0.6, duration: 0.4 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/table.mp3'
          },
          {
            word: 'HAPPY',
            meaning: '幸せな',
            phonetics: '/ˈhæpi/',
            syllables: [
              { text: 'HAP', stress: 'strong', timing: 0.0, duration: 0.6 },
              { text: 'py', stress: 'weak', timing: 0.6, duration: 0.4 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/happy.mp3'
          },
          {
            word: 'BETWEEN',
            meaning: '〜の間に',
            phonetics: '/bɪˈtwiːn/',
            syllables: [
              { text: 'be', stress: 'weak', timing: 0.0, duration: 0.4 },
              { text: 'TWEEN', stress: 'strong', timing: 0.4, duration: 0.6 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/between.mp3'
          },
          {
            word: 'ABOUT',
            meaning: '〜について',
            phonetics: '/əˈbaʊt/',
            syllables: [
              { text: 'a', stress: 'weak', timing: 0.0, duration: 0.4 },
              { text: 'BOUT', stress: 'strong', timing: 0.4, duration: 0.6 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/about.mp3'
          },
          {
            word: 'WATER',
            meaning: '水',
            phonetics: '/ˈwɔːtər/',
            syllables: [
              { text: 'WA', stress: 'strong', timing: 0.0, duration: 0.6 },
              { text: 'ter', stress: 'weak', timing: 0.6, duration: 0.4 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/water.mp3'
          }
        ]
      },
      {
        level: 2,
        name: '3音節語',
        bpm: 120,
        challenges: [
          {
            word: 'BEAUTIFUL',
            meaning: '美しい',
            phonetics: '/ˈbjuːtɪfəl/',
            syllables: [
              { text: 'BEAU', stress: 'strong', timing: 0.0, duration: 0.5 },
              { text: 'ti', stress: 'weak', timing: 0.5, duration: 0.25 },
              { text: 'ful', stress: 'weak', timing: 0.75, duration: 0.25 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/beautiful.mp3'
          },
          {
            word: 'IMPORTANT',
            meaning: '重要な',
            phonetics: '/ɪmˈpɔːtənt/',
            syllables: [
              { text: 'im', stress: 'weak', timing: 0.0, duration: 0.25 },
              { text: 'POR', stress: 'strong', timing: 0.25, duration: 0.5 },
              { text: 'tant', stress: 'weak', timing: 0.75, duration: 0.25 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/important.mp3'
          },
          {
            word: 'COMPUTER',
            meaning: 'コンピューター',
            phonetics: '/kəmˈpjuːtər/',
            syllables: [
              { text: 'com', stress: 'weak', timing: 0.0, duration: 0.25 },
              { text: 'PU', stress: 'strong', timing: 0.25, duration: 0.5 },
              { text: 'ter', stress: 'weak', timing: 0.75, duration: 0.25 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/computer.mp3'
          },
          {
            word: 'BANANA',
            meaning: 'バナナ',
            phonetics: '/bəˈnænə/',
            syllables: [
              { text: 'ba', stress: 'weak', timing: 0.0, duration: 0.25 },
              { text: 'NA', stress: 'strong', timing: 0.25, duration: 0.5 },
              { text: 'na', stress: 'weak', timing: 0.75, duration: 0.25 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/banana.mp3'
          }
        ]
      },
      {
        level: 3,
        name: '4音節語',
        bpm: 140,
        challenges: [
          {
            word: 'UNIVERSITY',
            meaning: '大学',
            phonetics: '/ˌjuːnɪˈvɜːsəti/',
            syllables: [
              { text: 'u', stress: 'weak', timing: 0.0, duration: 0.2 },
              { text: 'ni', stress: 'weak', timing: 0.2, duration: 0.2 },
              { text: 'VER', stress: 'strong', timing: 0.4, duration: 0.4 },
              { text: 'si', stress: 'weak', timing: 0.8, duration: 0.2 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/university.mp3'
          },
          {
            word: 'CATEGORY',
            meaning: 'カテゴリー',
            phonetics: '/ˈkætəɡɔːri/',
            syllables: [
              { text: 'CAT', stress: 'strong', timing: 0.0, duration: 0.4 },
              { text: 'e', stress: 'weak', timing: 0.4, duration: 0.2 },
              { text: 'go', stress: 'weak', timing: 0.6, duration: 0.2 },
              { text: 'ry', stress: 'weak', timing: 0.8, duration: 0.2 }
            ],
            totalDuration: 1.0,
            audioUrl: '/audio/category.mp3'
          }
        ]
      }
    ])

    const currentLevel = ref(0)
    const currentLevelChallenges = computed(() => {
      return stressBeatLevels.value[currentLevel.value]?.challenges || []
    })

    const currentChallenge = computed(() => {
      return currentLevelChallenges.value[currentChallengeIndex.value]
    })

    const expectedBeat = computed(() => {
      if (!currentChallenge.value || activeSyllableIndex.value >= currentChallenge.value.syllables.length) {
        return null
      }
      return currentChallenge.value.syllables[activeSyllableIndex.value].stress
    })

    const gameProgress = computed(() => {
      if (currentLevelChallenges.value.length === 0) return 0
      return ((currentChallengeIndex.value + 1) / currentLevelChallenges.value.length) * 100
    })

    const canAdvance = computed(() => {
      return gameStats.accuracy >= 70 // 70%以上で次レベル解禁
    })

    const performanceFeedback = computed(() => {
      const feedback = []

      if (gameStats.accuracy >= 90) {
        feedback.push({ emoji: '🏆', message: '素晴らしい！完璧なリズム感です！' })
      } else if (gameStats.accuracy >= 80) {
        feedback.push({ emoji: '🎯', message: 'とても良い！もう少しで完璧です！' })
      } else if (gameStats.accuracy >= 70) {
        feedback.push({ emoji: '👍', message: '良い調子！練習を続けましょう！' })
      } else {
        feedback.push({ emoji: '💪', message: '復習して再挑戦しましょう！' })
      }

      if (gameStats.maxStreak >= 5) {
        feedback.push({ emoji: '🔥', message: `${gameStats.maxStreak}連続正解！リズム感が向上しています！` })
      }

      if (gameStats.averageResponseTime < 500) {
        feedback.push({ emoji: '⚡', message: '反応速度が素晴らしい！直感的にリズムを掴んでいます！' })
      }

      return feedback
    })

    // Game Logic
    let gameTimer = null
    let beatTimer = null
    let metronomeTimer = null
    let rhythmTimer = null
    let challengeStartTime = 0

    // Timing Judgment System
    const judgeTimingAccuracy = (userInputTime, expectedTime, tolerance = beatTolerance.value) => {
      const diff = Math.abs(userInputTime - expectedTime)

      if (diff <= tolerance * 0.3) return { rating: 'perfect', points: 200, feedback: '完璧なタイミング！' }
      if (diff <= tolerance * 0.6) return { rating: 'great', points: 150, feedback: '素晴らしい！' }
      if (diff <= tolerance) return { rating: 'good', points: 100, feedback: '良い！' }
      if (diff <= tolerance * 1.5) return { rating: 'late', points: 50, feedback: '少し遅い' }
      return { rating: 'miss', points: 0, feedback: 'タイミングを合わせて！' }
    }

    // Rhythm Countdown System
    const startCountdown = (callback) => {
      showCountdown.value = true
      countdownValue.value = 3

      // Audio countdown
      speakInstruction('3, 2, 1')

      const countdownTimer = setInterval(() => {
        countdownValue.value--
        if (countdownValue.value <= 0) {
          clearInterval(countdownTimer)
          showCountdown.value = false
          speakInstruction('タップしてリズムに合わせてください!')
          callback()
        }
      }, 1000)
    }

    // Enhanced Audio Guide System
    const speakInstruction = async (text) => {
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'ja-JP'
          utterance.rate = 0.9
          utterance.pitch = 1.1
          utterance.volume = 0.8

          // Try to use a Japanese voice
          const voices = speechSynthesis.getVoices()
          const japaneseVoice = voices.find(voice =>
            voice.lang.startsWith('ja') ||
            voice.name.includes('Japanese') ||
            voice.name.includes('Kyoko')
          )
          if (japaneseVoice) {
            utterance.voice = japaneseVoice
          }

          speechSynthesis.speak(utterance)
        } catch (error) {
          console.log('Voice instruction failed:', error)
        }
      }
    }

    const provideRhythmGuidance = () => {
      if (!currentChallenge.value) return

      const word = currentChallenge.value.word
      const syllables = currentChallenge.value.syllables
      const pattern = syllables.map(s => s.stress === 'strong' ? '強' : '弱').join('、')

      speakInstruction(
        `${word}のリズムパターンは: ${pattern} です。メトロノームに合わせてタップしてください。`
      )
    }

    // Adaptive BPM System
    const adaptBPM = () => {
      const accuracy = gameStats.accuracy
      const currentLevelBaseBPM = currentLevelBPM.value

      if (accuracy >= 90) {
        // Increase BPM for advanced players
        currentBPM.value = Math.min(currentLevelBaseBPM + 20, 180)
        beatTolerance.value = Math.max(150, beatTolerance.value - 10)
      } else if (accuracy >= 70) {
        // Standard BPM
        currentBPM.value = currentLevelBaseBPM
        beatTolerance.value = 200
      } else {
        // Slower BPM for beginners
        currentBPM.value = Math.max(currentLevelBaseBPM - 20, 60)
        beatTolerance.value = Math.min(300, beatTolerance.value + 20)
      }
    }

    const selectMode = (modeId) => {
      selectedMode.value = modeId
      gameState.value = 'playing'
      startGame()
    }

    const startGame = () => {
      resetGameStats()
      currentLevel.value = 0
      currentChallengeIndex.value = 0
      activeSyllableIndex.value = 0
      completedSyllables.value = 0
      incorrectSyllables.value = []
      startChallenge()
    }

    const startChallenge = () => {
      gameActive.value = false // Disabled until countdown finishes
      activeSyllableIndex.value = 0
      completedSyllables.value = 0
      incorrectSyllables.value = []
      currentBeatPosition.value = 0

      // Adapt BPM based on performance
      adaptBPM()

      // Start with countdown
      startCountdown(() => {
        // Play the word first
        playAudio().then(() => {
          // Provide rhythm guidance
          setTimeout(() => {
            provideRhythmGuidance()
          }, 500)

          setTimeout(() => {
            startRhythmCycle()
          }, 2000)
        })
      })
    }

    const startRhythmCycle = () => {
      if (!currentChallenge.value) return

      gameActive.value = true
      isRhythmPlaying.value = true
      rhythmStartTime.value = Date.now()
      challengeStartTime = rhythmStartTime.value

      // Calculate beat timings based on current BPM
      const beatInterval = 60000 / currentBPM.value // ms per beat
      const totalBeats = Math.ceil(currentChallenge.value.totalDuration * currentBPM.value / 60)

      // Generate upcoming beats for visual preview
      upcomingBeats.value = currentChallenge.value.syllables.map((syllable, index) => ({
        ...syllable,
        expectedTime: rhythmStartTime.value + (syllable.timing * beatInterval * totalBeats),
        index
      }))

      // Start interactive metronome
      startInteractiveMetronome()

      // Auto-advance the rhythm cycle
      rhythmTimer = setTimeout(() => {
        if (activeSyllableIndex.value < currentChallenge.value.syllables.length - 1) {
          // Continue to next syllable
          nextSyllable()
        } else {
          // Complete the challenge
          completeRhythmCycle()
        }
      }, beatInterval * totalBeats)
    }

    const startInteractiveMetronome = () => {
      const beatInterval = 60000 / currentBPM.value

      metronomeTimer = setInterval(() => {
        metronomeActive.value = true
        playMetronomeSound()

        // Update current beat position
        currentBeatPosition.value = (Date.now() - rhythmStartTime.value) / beatInterval

        setTimeout(() => {
          metronomeActive.value = false
        }, 200)
      }, beatInterval)
    }

    const nextSyllable = () => {
      activeSyllableIndex.value++
      if (activeSyllableIndex.value < currentChallenge.value.syllables.length) {
        // Continue rhythm cycle
        startRhythmCycle()
      }
    }

    const completeRhythmCycle = () => {
      isRhythmPlaying.value = false
      gameActive.value = false
      stopMetronome()

      // Move to next challenge after a brief pause
      setTimeout(() => {
        nextChallenge()
      }, 1500)
    }

    const startMetronome = () => {
      const interval = 60000 / currentBPM.value // Convert BPM to ms

      metronomeTimer = setInterval(() => {
        metronomeActive.value = true
        playMetronomeSound() // Add metronome sound
        setTimeout(() => {
          metronomeActive.value = false
        }, 200)
      }, interval)
    }

    const stopMetronome = () => {
      if (metronomeTimer) {
        clearInterval(metronomeTimer)
        metronomeTimer = null
      }
      metronomeActive.value = false
    }

    const tapBeat = (beatType) => {
      if (!gameActive.value || !currentChallenge.value || !isRhythmPlaying.value) return

      const currentTime = Date.now()
      const currentSyllable = currentChallenge.value.syllables[activeSyllableIndex.value]

      if (!currentSyllable) return

      // Calculate expected timing
      const beatInterval = 60000 / currentBPM.value
      const totalBeats = Math.ceil(currentChallenge.value.totalDuration * currentBPM.value / 60)
      const expectedTime = rhythmStartTime.value + (currentSyllable.timing * beatInterval * totalBeats)

      // Play sound feedback
      playBeatSound(beatType)

      pressedButton.value = beatType
      setTimeout(() => {
        pressedButton.value = ''
      }, 200)

      // Judge timing accuracy
      const timingResult = judgeTimingAccuracy(currentTime, expectedTime)
      const isCorrectBeat = beatType === currentSyllable.stress

      gameStats.totalAttempts++
      gameStats.responseTimes.push(currentTime - expectedTime)

      if (isCorrectBeat && timingResult.rating !== 'miss') {
        handleCorrectBeat(timingResult)
      } else {
        handleIncorrectBeat(beatType, currentSyllable.stress, timingResult)
      }
    }

    const handleCorrectBeat = (timingResult) => {
      gameStats.correctAttempts++
      gameStats.streak++
      gameStats.maxStreak = Math.max(gameStats.maxStreak, gameStats.streak)

      // Enhanced score calculation
      let points = timingResult.points
      points += gameStats.streak * 10 // Streak bonus

      gameStats.score += points

      // Visual feedback with timing rating
      const message = `${timingResult.feedback} (+${points})`
      showFeedbackMessage(timingResult.rating, message, `連続: ${gameStats.streak}`)

      // Mark syllable as completed
      completedSyllables.value++

      // Auto-advance to next syllable (handled by rhythm cycle)
    }

    const handleIncorrectBeat = (userBeat, correctBeat, timingResult) => {
      gameStats.streak = 0
      incorrectSyllables.value.push(activeSyllableIndex.value)

      let errorMessage = ''
      let hint = ''

      if (timingResult.rating === 'miss') {
        errorMessage = 'タイミングが外れています！'
        hint = 'メトロノームに合わせてタップしてください'
      } else {
        errorMessage = 'ビートタイプが間違っています！'
        hint = correctBeat === 'strong'
          ? 'この音節は強勢です（●） - 強いボタンを押してください'
          : 'この音節は弱勢です（○） - 弱いボタンを押してください'
      }

      showFeedbackMessage('miss', errorMessage, hint)

      // Clear incorrect marking after feedback
      setTimeout(() => {
        incorrectSyllables.value = incorrectSyllables.value.filter(i => i !== activeSyllableIndex.value)
      }, 2000)
    }

    const showFeedbackMessage = (type, message, hint = '') => {
      feedbackType.value = type
      feedbackMessage.value = message
      feedbackHint.value = hint
      showFeedback.value = true

      setTimeout(() => {
        showFeedback.value = false
      }, type === 'miss' ? 3000 : 1500)
    }

    const nextChallenge = () => {
      currentChallengeIndex.value++

      if (currentChallengeIndex.value >= currentLevelChallenges.value.length) {
        // Level completed
        completeLevel()
      } else {
        startChallenge()
      }
    }

    const completeLevel = () => {
      gameActive.value = false
      stopMetronome()

      // Calculate final statistics
      gameStats.accuracy = (gameStats.correctAttempts / gameStats.totalAttempts) * 100
      gameStats.averageResponseTime = gameStats.responseTimes.reduce((a, b) => a + b, 0) / gameStats.responseTimes.length

      gameState.value = 'results'
    }

    // Audio System
    let audioContext = null
    let currentAudio = null

    const initAudioContext = async () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
      }

      // Resume context if suspended (required by browser policies)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume()
          console.log('AudioContext resumed successfully')
        } catch (error) {
          console.error('Failed to resume AudioContext:', error)
        }
      }
    }

    const playAudio = async () => {
      if (!currentChallenge.value) return

      isPlayingAudio.value = true

      try {
        await initAudioContext()

        // For now, we'll use Text-to-Speech as a fallback
        // since we don't have actual audio files
        if ('speechSynthesis' in window) {
          // Load voices if not already loaded
          let voices = speechSynthesis.getVoices()
          if (voices.length === 0) {
            // Wait for voices to load
            await new Promise(resolve => {
              speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices()
                resolve()
              }
              // Fallback timeout
              setTimeout(resolve, 1000)
            })
          }

          const utterance = new SpeechSynthesisUtterance(currentChallenge.value.word)
          utterance.lang = 'en-US'
          utterance.rate = 0.8
          utterance.pitch = 1.0
          utterance.volume = 1.0

          // Try to use a more natural voice
          const englishVoice = voices.find(voice =>
            voice.lang.startsWith('en') &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('English'))
          )
          if (englishVoice) {
            utterance.voice = englishVoice
          }

          utterance.onend = () => {
            isPlayingAudio.value = false
            console.log('Speech synthesis completed')
          }

          utterance.onerror = (error) => {
            isPlayingAudio.value = false
            console.error('Speech synthesis failed:', error)
            // Fallback to syllable tones
            playSyllableTones()
          }

          console.log('Starting speech synthesis for:', currentChallenge.value.word)
          speechSynthesis.speak(utterance)
        } else {
          // Fallback: generate synthetic audio tones for syllables
          console.log('Speech synthesis not available, using syllable tones')
          await playSyllableTones()
        }
      } catch (error) {
        console.error('Audio playback failed:', error)
        isPlayingAudio.value = false
      }
    }

    const playSyllableTones = async () => {
      if (!currentChallenge.value || !audioContext) return

      const syllables = currentChallenge.value.syllables
      const totalDuration = 2000 // 2 seconds total
      const syllableDuration = totalDuration / syllables.length

      for (let i = 0; i < syllables.length; i++) {
        const syllable = syllables[i]
        const isStrong = syllable.stress === 'strong'

        // Create oscillator for tone
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Different frequencies and volumes for strong/weak syllables
        oscillator.frequency.setValueAtTime(
          isStrong ? 440 : 330, // A4 for strong, E4 for weak
          audioContext.currentTime
        )

        oscillator.type = 'sine'

        // Volume envelope
        const startTime = audioContext.currentTime + (i * syllableDuration / 1000)
        const duration = syllableDuration / 1000 * 0.8 // 80% of syllable time

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(isStrong ? 0.3 : 0.15, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)

        // Visual feedback during playback
        setTimeout(() => {
          // Highlight current syllable
          activeSyllableIndex.value = i
          setTimeout(() => {
            if (i === syllables.length - 1) {
              activeSyllableIndex.value = 0
              isPlayingAudio.value = false
            }
          }, syllableDuration * 0.8)
        }, i * syllableDuration)
      }
    }

    const playBeatSound = async (beatType) => {
      try {
        await initAudioContext()

        if (!audioContext) {
          console.error('AudioContext not available')
          return
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        if (beatType === 'strong') {
          // Deep drum sound for strong beats
          oscillator.frequency.setValueAtTime(80, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
        } else {
          // Higher bell sound for weak beats
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        }

        oscillator.type = beatType === 'strong' ? 'square' : 'sine'

        // Quick envelope
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)

        console.log(`Played ${beatType} beat sound`)
      } catch (error) {
        console.error('Failed to play beat sound:', error)
      }
    }

    const playMetronomeSound = async () => {
      try {
        await initAudioContext()

        if (!audioContext) return

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.type = 'square'

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        console.error('Failed to play metronome sound:', error)
      }
    }

    const resetGameStats = () => {
      Object.assign(gameStats, {
        score: 0,
        streak: 0,
        maxStreak: 0,
        accuracy: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        averageResponseTime: 0,
        responseTimes: []
      })
    }

    const pauseGame = () => {
      gameActive.value = false
      stopMetronome()
      gameState.value = 'paused'
    }

    const restartChallenge = () => {
      stopMetronome()
      startChallenge()
    }

    const skipChallenge = () => {
      nextChallenge()
    }

    const nextLevel = () => {
      if (!canAdvance.value) return

      currentLevel.value++
      if (currentLevel.value >= stressBeatLevels.value.length) {
        // All levels completed, unlock next mode
        gameModes.value[1].locked = false // Unlock function words mode
        backToMenu()
      } else {
        currentChallengeIndex.value = 0
        gameState.value = 'playing'
        startGame()
      }
    }

    const retryLevel = () => {
      gameState.value = 'playing'
      startGame()
    }

    const backToMenu = () => {
      gameState.value = 'menu'
      gameActive.value = false
      stopMetronome()
    }

    const goBack = () => {
      router.push('/platforms/phonics-adventure')
    }

    const testAudio = async (type) => {
      console.log(`Testing audio type: ${type}`)

      try {
        await initAudioContext()

        switch (type) {
          case 'speech':
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance('Hello World')
              utterance.lang = 'en-US'
              utterance.rate = 0.8
              utterance.volume = 1.0

              utterance.onend = () => {
                console.log('Speech test completed successfully')
                alert('音声合成テスト成功！')
              }

              utterance.onerror = (error) => {
                console.error('Speech test failed:', error)
                alert('音声合成テスト失敗: ' + error.error)
              }

              speechSynthesis.speak(utterance)
            } else {
              alert('音声合成がサポートされていません')
            }
            break

          case 'strong':
            await playBeatSound('strong')
            alert('強勢音テスト完了！低い太鼓音が聞こえましたか？')
            break

          case 'weak':
            await playBeatSound('weak')
            alert('弱勢音テスト完了！高いベル音が聞こえましたか？')
            break
        }
      } catch (error) {
        console.error('Audio test failed:', error)
        alert('音声テスト失敗: ' + error.message)
      }
    }

    // Cleanup
    onUnmounted(() => {
      if (gameTimer) clearInterval(gameTimer)
      if (beatTimer) clearInterval(beatTimer)
      if (rhythmTimer) clearTimeout(rhythmTimer)
      stopMetronome()
    })

    return {
      // State
      gameState,
      selectedMode,
      gameActive,
      currentChallengeIndex,
      activeSyllableIndex,
      completedSyllables,
      incorrectSyllables,
      metronomeActive,
      isPlayingAudio,
      showFeedback,
      feedbackType,
      feedbackMessage,
      feedbackHint,
      pressedButton,
      currentBPM,

      // Real-time Rhythm State
      isRhythmPlaying,
      currentBeatPosition,
      countdownValue,
      showCountdown,
      upcomingBeats,
      beatTolerance,
      currentLevelBPM,

      // Data
      gameStats,
      gameModes,
      currentLevel,
      currentLevelChallenges,
      currentChallenge,
      expectedBeat,
      gameProgress,
      canAdvance,
      performanceFeedback,

      // Methods
      selectMode,
      startGame,
      tapBeat,
      playAudio,
      pauseGame,
      restartChallenge,
      skipChallenge,
      nextLevel,
      retryLevel,
      backToMenu,
      goBack,
      testAudio,
      speakInstruction,
      provideRhythmGuidance
    }
  }
}
</script>

<style scoped>
.english-rhythm-master {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(ellipse at center, #1e3a8a 0%, #1e1b4b 50%, #000 100%);
  color: white;
  overflow-x: hidden;
}

/* Cosmic Background */
.cosmic-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #3b82f6, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(59, 130, 246, 0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #60a5fa, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: stars-twinkle 120s linear infinite;
  opacity: 0.6;
}

.rhythm-waves {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 60%, rgba(59, 130, 246, 0.15), transparent 70%),
              radial-gradient(circle at 70% 30%, rgba(147, 197, 253, 0.1), transparent 60%);
  animation: wave-pulse 8s ease-in-out infinite alternate;
}

@keyframes stars-twinkle {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

@keyframes wave-pulse {
  0% { opacity: 0.1; transform: scale(1); }
  100% { opacity: 0.3; transform: scale(1.1); }
}

/* Header */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.cosmic-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.cosmic-button:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.header-center {
  text-align: center;
}

.game-title {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ffffff 0%, #93c5fd 50%, #3b82f6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.game-subtitle {
  color: #cbd5e1;
  font-size: 1rem;
}

.score-display {
  display: flex;
  gap: 1rem;
}

.score-item {
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.score-label {
  display: block;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.score-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #3b82f6;
}

/* Game Menu */
.game-menu {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.menu-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  backdrop-filter: blur(20px);
}

.menu-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 2rem;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.mode-card {
  position: relative;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.mode-card:hover:not(.locked) {
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
}

.mode-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.mode-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.mode-description {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.mode-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.difficulty-stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  color: #fbbf24;
}

.star:not(.filled) {
  color: #6b7280;
}

.mode-progress {
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: bold;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.lock-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.unlock-requirement {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.learning-tips {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.learning-tips h3 {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.learning-tips ul {
  list-style: none;
  padding: 0;
}

.learning-tips li {
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  line-height: 1.5;
}

/* Audio Test Section */
.audio-test-section {
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.audio-test-section h3 {
  color: #10b981;
  margin-bottom: 1rem;
  text-align: center;
}

.audio-note {
  color: #cbd5e1;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.audio-test-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.test-button {
  padding: 0.75rem 1.5rem;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.test-button:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
  transform: translateY(-2px);
}

/* Stress Beat Game */
.stress-beat-game {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-section {
  text-align: center;
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.word-display {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.word-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(20px);
  min-width: 300px;
}

.word-text {
  font-size: 3rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1em;
}

.word-meaning {
  font-size: 1.2rem;
  color: #93c5fd;
  margin-bottom: 0.5rem;
}

.word-phonetics {
  font-size: 1rem;
  color: #cbd5e1;
  font-family: 'Courier New', monospace;
  margin-bottom: 1.5rem;
}

.audio-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 2rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.audio-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
}

.audio-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rhythm-pattern {
  margin-bottom: 2rem;
}

.pattern-title {
  text-align: center;
  color: #ffffff;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
}

.syllables-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.syllable-item {
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  min-width: 80px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.syllable-item.strong {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.syllable-item.weak {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.syllable-item.active {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.syllable-item.completed {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.syllable-item.incorrect {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.syllable-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.beat-indicator {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.stress-label {
  font-size: 0.7rem;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Countdown Overlay */
.countdown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.countdown-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, #3b82f6, #1e40af);
  border: 4px solid #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: countdown-pulse 1s ease-in-out infinite;
}

.countdown-number {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

@keyframes countdown-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Rhythm Progress Indicator */
.rhythm-progress {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 1rem;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.rhythm-timeline {
  position: relative;
  height: 60px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 30px;
  overflow: hidden;
}

.timeline-beat {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  border-radius: 50%;
  border: 2px solid;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  min-width: 60px;
  transition: all 0.3s ease;
}

.timeline-beat.strong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.timeline-beat.weak {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.timeline-beat.current {
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  z-index: 10;
}

.timeline-beat.completed {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.timeline-syllable {
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.timeline-indicator {
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.rhythm-cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #fbbf24, #f59e0b);
  box-shadow: 0 0 10px #fbbf24;
  animation: cursor-glow 1s ease-in-out infinite alternate;
}

@keyframes cursor-glow {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}

.beat-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.metronome-display {
  text-align: center;
}

.metronome-beat {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(59, 130, 246, 0.3);
  margin: 0 auto 0.5rem;
  transition: all 0.2s ease;
}

.metronome-beat.active {
  background: rgba(59, 130, 246, 0.4);
  border-color: rgba(59, 130, 246, 0.6);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.beat-circle {
  font-size: 2rem;
  color: #3b82f6;
}

.bpm-display {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.tolerance-display {
  color: #94a3b8;
  font-size: 0.7rem;
  opacity: 0.8;
}

.beat-buttons {
  display: flex;
  gap: 2rem;
}

.beat-button {
  padding: 1.5rem 2rem;
  border-radius: 1.5rem;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-width: 120px;
}

.beat-button.strong-beat {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ffffff;
}

.beat-button.weak-beat {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

.beat-button.highlighted {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.beat-button.pressed {
  transform: scale(0.95);
}

.beat-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.beat-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.button-label {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.button-desc {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.feedback-display {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.feedback-card {
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  text-align: center;
  backdrop-filter: blur(20px);
  max-width: 400px;
}

.feedback-card.perfect {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.feedback-card.good {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.feedback-card.miss {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.feedback-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feedback-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.feedback-hint {
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(75, 85, 99, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-button:hover {
  background: rgba(75, 85, 99, 0.5);
  border-color: rgba(75, 85, 99, 0.7);
}

/* Results Screen */
.results-screen {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.results-card {
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 2rem;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(20px);
  max-width: 600px;
  width: 100%;
}

.results-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 2rem;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1rem;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.9rem;
}

.performance-feedback {
  margin-bottom: 2rem;
  text-align: left;
}

.performance-feedback h3 {
  color: #ffffff;
  margin-bottom: 1rem;
  text-align: center;
}

.feedback-list {
  space-y: 0.5rem;
}

.feedback-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.feedback-emoji {
  font-size: 1.2rem;
}

.feedback-text {
  color: #cbd5e1;
  line-height: 1.4;
}

.results-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
}

.action-button.primary {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #ffffff;
}

.action-button.primary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.6);
}

.action-button.secondary {
  background: rgba(75, 85, 99, 0.2);
  border-color: rgba(75, 85, 99, 0.4);
  color: #cbd5e1;
}

.action-button.secondary:hover {
  background: rgba(75, 85, 99, 0.3);
  border-color: rgba(75, 85, 99, 0.6);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .score-display {
    justify-content: center;
  }

  .mode-grid {
    grid-template-columns: 1fr;
  }

  .syllables-container {
    flex-direction: column;
    align-items: center;
  }

  .beat-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .results-stats {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>