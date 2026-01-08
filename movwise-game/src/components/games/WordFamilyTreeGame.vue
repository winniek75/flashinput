<template>
  <div class="word-family-galaxy">
    <!-- Galaxy Hub Mode Selection Screen -->
    <div v-if="currentScreen === 'hub'" class="galaxy-hub">
      <div class="galaxy-background">
        <!-- Animated stars -->
        <div class="stars-layer stars-layer-1"></div>
        <div class="stars-layer stars-layer-2"></div>
        <div class="stars-layer stars-layer-3"></div>

        <!-- Central Hub -->
        <div class="central-hub">
          <div class="hub-header">
            <button @click="goBack" class="space-nav-button">
              ← Vocabulary World
            </button>
            <h1 class="galaxy-title">
              📚 ワード・ファミリー
            </h1>
            <div class="captain-info">
              <span class="captain-rank">🚀 船長</span>
              <span class="current-mission">ミッション: -{{ currentPattern }} システム</span>
            </div>
          </div>


          <!-- Difficulty Level Selection -->
          <div class="level-selection">
            <h2>🌱 音韻パターン学習 - レベル選択</h2>
            <div class="level-grid">
              <!-- Beginner Level -->
              <div class="level-card beginner" @click="startGardenLevel('beginner')">
                <div class="level-icon">🌱</div>
                <h3>初級</h3>
                <p>基本的な音韻パターン<br>3つの選択肢</p>
                <div class="level-details">
                  <span>パターン: -at, -an, -ap</span>
                  <span>制限時間: なし</span>
                </div>
              </div>

              <!-- Intermediate Level -->
              <div class="level-card intermediate" @click="startGardenLevel('intermediate')">
                <div class="level-icon">🌿</div>
                <h3>中級</h3>
                <p>複雑な音韻パターン<br>4つの選択肢</p>
                <div class="level-details">
                  <span>パターン: -it, -op, -in, -ig</span>
                  <span>制限時間: 30秒</span>
                </div>
              </div>

              <!-- Advanced Level -->
              <div class="level-card advanced" @click="startGardenLevel('advanced')">
                <div class="level-icon">🌳</div>
                <h3>上級</h3>
                <p>高難度音韻パターン<br>5つの選択肢</p>
                <div class="level-details">
                  <span>パターン: -ug, -un, -et</span>
                  <span>制限時間: 20秒</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Dashboard -->
          <div class="progress-dashboard">
            <div class="stats-panel">
              <div class="stat-item">
                <span class="stat-icon">⭐</span>
                <span class="stat-label">総獲得星数</span>
                <span class="stat-value">{{ totalStarsCollected }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🎯</span>
                <span class="stat-label">正確率</span>
                <span class="stat-value">{{ overallAccuracy }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🔥</span>
                <span class="stat-label">Best Streak</span>
                <span class="stat-value">{{ bestStreak }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🚀</span>
                <span class="stat-label">Missions</span>
                <span class="stat-value">{{ completedMissions }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 1: Stellar Garden -->
    <div v-if="currentScreen === 'game' && currentMode === 'garden'" class="stellar-garden">
      <div class="galaxy-background">
        <div class="stars-layer stars-layer-1"></div>
        <div class="stars-layer stars-layer-2"></div>
        <div class="stars-layer stars-layer-3"></div>

        <!-- Game Header -->
        <div class="game-header">
          <button @click="returnToHub" class="space-nav-button">
            📚 ワード・ファミリー
          </button>
          <div class="mission-info">
            <h1>🌱 音韻パターン学習</h1>
            <h2>📚 -{{ currentPattern }} ファミリー ({{ currentDifficulty }})</h2>
          </div>
          <div class="game-stats">
            <span class="stat">🔋 エネルギー: {{ lives }}/3</span>
            <span class="stat">⭐ 星: {{ collectedStars }}/{{ totalStarsInSystem }}</span>
            <span class="stat">🎯 スコア: {{ score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Main Game Area -->
        <div class="garden-main">
          <!-- Word Cultivation Panel -->
          <div class="cultivation-panel">
            <div class="current-challenge">
              <div v-if="currentTargetWord" class="target-word-display">
                <div class="mission-header">
                  <h3>🎯 ミッション</h3>
                  <span class="inline-instruction">👆 同じ音韻パターン (-{{ currentPattern }}) の単語を見つけてクリック</span>
                </div>
                <div class="word-capsule" :class="{ 'listening': isListening }" @click="playTargetWord">
                  {{ currentTargetWord }}
                  <span class="audio-icon">🔊</span>
                </div>
                <div class="word-hint">{{ currentWordHint }}</div>

                <!-- Voice Recognition Button -->
                <button
                  v-if="speechSupported"
                  @click="startVoiceRecognition"
                  :disabled="isListening"
                  class="voice-button"
                  :class="{ 'listening': isListening, 'success': recognitionSuccess }"
                >
                  <span class="voice-icon">{{ isListening ? '🎙️' : '🗣️' }}</span>
                  <span class="voice-text">
                    {{ isListening ? '聞いています...' : '単語を声に出して！' }}
                  </span>
                </button>

                <!-- Fallback Button -->
                <button @click="skipWithPenalty" class="skip-button">
                  スキップ (-10 ポイント)
                </button>
              </div>

              <div v-else class="mission-complete">
                <div class="completion-icon">🎉</div>
                <h3>システム完成！</h3>
                <p>すべての星が軌道に配置されました。</p>
                <button @click="nextSystem" class="next-system-button">
                  次のシステム 🚀
                </button>
              </div>
            </div>

            <!-- Available Word Capsules -->
            <div class="word-capsules" v-if="availableWords.length > 0">
              <h4>🛸 単語カプセル発見 ({{ availableWords.length }}個)</h4>
              <div class="capsule-grid">
                <div
                  v-for="(word, index) in availableWords"
                  :key="word"
                  class="word-capsule mystery-capsule"
                  :class="{ 'used': usedWords.includes(word) }"
                  :data-word="word"
                >
                  <div class="capsule-content">
                    <div class="capsule-number">{{ index + 1 }}</div>
                    <div class="mystery-indicator">?</div>
                  </div>
                  <div class="capsule-actions">
                    <button class="audio-button" @click="playWord(word)" title="音を聞く">
                      🔊
                    </button>
                    <button
                      class="select-button"
                      @click="handleWordCapsuleClick(word)"
                      :disabled="usedWords.includes(word)"
                      title="この単語を選択"
                    >
                      選択
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Help when no words available -->
            <div v-else class="no-words-help">
              <h4>🎯 ミッション完了間近！</h4>
              <p>全ての単語を確認しました。新しいパターンに進みましょう！</p>
              <button @click="nextSystem" class="next-pattern-btn">
                次のパターンへ (-{{ allPatterns[(allPatterns.indexOf(currentPattern) + 1) % allPatterns.length] }})
              </button>
            </div>

            <!-- Game Progress -->
            <div class="game-progress">
              <div class="progress-stats">
                <div class="stat">
                  <span class="stat-label">スコア</span>
                  <span class="stat-value">{{ score }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">ライフ</span>
                  <span class="stat-value">{{ '❤️'.repeat(lives) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">パターン</span>
                  <span class="stat-value">-{{ currentPattern }}</span>
                </div>
              </div>
            </div>

            <!-- Voice Recognition Status -->
            <div v-if="speechSupported" class="voice-status">
              <div class="voice-indicator" :class="{ 'active': isListening }">
                <div class="voice-wave"></div>
                <div class="voice-wave"></div>
                <div class="voice-wave"></div>
              </div>
              <p class="voice-help">
                {{ voiceStatusText }}
              </p>
            </div>

            <div v-else class="voice-not-supported">
              <p>🔇 Voice recognition not available. Use click mode instead.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 2: Constellation Rush -->
    <div v-if="currentScreen === 'game' && currentMode === 'rush'" class="constellation-rush">
      <div class="galaxy-background">
        <div class="stars-layer stars-layer-1"></div>
        <div class="stars-layer stars-layer-2"></div>
        <div class="stars-layer stars-layer-3"></div>

        <!-- Game Header -->
        <div class="game-header">
          <button @click="returnToHub" class="space-nav-button">
            📚 ワード・ファミリー
          </button>
          <div class="mission-info">
            <h1>⚡ 星座レーシング</h1>
            <h2>-{{ currentPattern }} スピードチャレンジ</h2>
          </div>
          <div class="game-stats">
            <span class="stat">⚡ コンボ: ×{{ currentCombo }}</span>
            <span class="stat">🔥 スピード: {{ gameSpeed }}</span>
            <span class="stat">🎯 スコア: {{ score.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Rush Game Area -->
        <div class="rush-main">
          <div class="floating-stars">
            <div
              v-for="(star, index) in floatingStars"
              :key="star.id"
              class="floating-star"
              :style="star.style"
              :class="{ 'target': star.isTarget, 'captured': star.captured }"
            >
              <div class="star-body">✨</div>
              <div class="star-word">{{ star.word }}</div>
            </div>
          </div>

          <div class="rush-target">
            <div class="target-display">
              <h3>🎯 この星をキャッチ：</h3>
              <div class="target-word">{{ currentRushTarget }}</div>
              <button
                v-if="speechSupported"
                @click="startRushVoice"
                :disabled="isListening"
                class="rush-voice-button"
                :class="{ 'listening': isListening }"
              >
                {{ isListening ? '🎙️ 聞いています...' : '🗣️ 今話して！' }}
              </button>
            </div>

            <div class="combo-display" :class="{ 'active': currentCombo > 1 }">
              <span class="combo-text">コンボ</span>
              <span class="combo-number">×{{ currentCombo }}</span>
            </div>
          </div>

          <!-- Speed Meter -->
          <div class="speed-meter">
            <div class="speed-label">スピードレベル</div>
            <div class="speed-bar">
              <div class="speed-fill" :style="{ width: `${speedPercentage}%` }"></div>
            </div>
            <div class="speed-text">{{ gameSpeed }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 3: Lab Station -->
    <div v-if="currentScreen === 'game' && currentMode === 'lab'" class="lab-station">
      <div class="galaxy-background">
        <div class="stars-layer stars-layer-1"></div>
        <div class="stars-layer stars-layer-2"></div>

        <!-- Lab Header -->
        <div class="game-header">
          <button @click="returnToHub" class="space-nav-button">
            📚 ワード・ファミリー
          </button>
          <div class="mission-info">
            <h1>🔬 音韻研究所</h1>
            <h2>研究モジュール: -{{ currentPattern }}</h2>
          </div>
          <div class="game-stats">
            <span class="stat">🧪 サンプル: {{ labSamples }}/{{ totalSamples }}</span>
            <span class="stat">📊 分析: {{ analysisComplete }}%</span>
          </div>
        </div>

        <!-- Lab Main Area -->
        <div class="lab-main">
          <div class="research-station">
            <div class="sample-analysis">
              <h3>🧪 サンプル収集</h3>
              <div v-if="currentLabWord" class="current-sample">
                <div class="sample-word">{{ currentLabWord }}</div>
                <div class="sample-controls">
                  <button
                    v-if="navigator && navigator.mediaDevices && window.MediaRecorder"
                    @click="recordSample"
                    class="record-button"
                    :class="{ 'recording': isRecording }"
                  >
                    <span class="record-icon">{{ isRecording ? '⏹️' : '🎙️' }}</span>
                    {{ isRecording ? '停止 (録音中)' : 'サンプル録音' }}
                  </button>
                  <div
                    v-else
                    class="recording-unavailable"
                  >
                    ⚠️ このブラウザでは録音機能が利用できません
                  </div>
                  <button @click="playbackSample" :disabled="!hasRecording" class="playback-button">
                    🔊 再生
                  </button>
                </div>

                <!-- Waveform Visualization -->
                <div class="waveform-container" v-if="isRecording || hasRecording">
                  <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
                </div>

                <!-- Analysis Results -->
                <div v-if="analysisResult" class="analysis-result">
                  <h4>🧬 AI 分析結果:</h4>
                  <div class="phonetic-breakdown">
                    <span class="phonetic">{{ analysisResult.phonetic }}</span>
                    <span class="accuracy">{{ analysisResult.accuracy }}% 一致</span>
                  </div>
                  <div class="pattern-dna">
                    <div class="dna-strand">
                      <span v-for="(sound, i) in analysisResult.sounds" :key="i" class="dna-base">
                        {{ sound }}
                      </span>
                    </div>
                  </div>
                  <button @click="storeSample" class="store-button">
                    💾 データベースに保存
                  </button>
                </div>
              </div>
            </div>

            <!-- Pattern Collection -->
            <div class="pattern-collection">
              <h3>📊 Pattern Collection</h3>
              <div class="collection-grid">
                <div
                  v-for="word in wordFamilies[currentPattern].correct"
                  :key="word"
                  class="collection-item"
                  :class="{ 'collected': storedSamples.includes(word) }"
                >
                  <div class="item-word">{{ word }}</div>
                  <div class="item-status">
                    {{ storedSamples.includes(word) ? '✅' : '⏳' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DNA Pattern Visualization -->
          <div class="dna-visualization">
            <h3>🧬 Family Pattern DNA</h3>
            <div class="dna-helix">
              <div
                v-for="(word, index) in storedSamples.slice(0, 6)"
                :key="word"
                class="dna-connection"
                :style="{ '--index': index }"
              >
                <span class="dna-word">{{ word }}</span>
                <div class="dna-bond"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 4: Galactic Race -->
    <div v-if="currentScreen === 'game' && currentMode === 'race'" class="galactic-race">
      <div class="galaxy-background">
        <div class="stars-layer stars-layer-1"></div>
        <div class="stars-layer stars-layer-2"></div>

        <!-- Race Header -->
        <div class="game-header">
          <button @click="returnToHub" class="space-nav-button">
            📚 ワード・ファミリー
          </button>
          <div class="mission-info">
            <h1>🏁 銀河レース</h1>
            <h2>スピード読み上げ選手権</h2>
          </div>
          <div class="game-stats">
            <span class="stat">🏃 あなたのスピード: {{ playerSpeed }} WPM</span>
            <span class="stat">⏱️ 時間: {{ raceTime }}秒</span>
          </div>
        </div>

        <!-- Race Track -->
        <div class="race-main">
          <div class="race-track">
            <div class="start-line">スタート</div>
            <div class="finish-line">🏁 ゴール</div>

            <!-- Player Ship -->
            <div class="player-ship" :style="{ left: `${playerProgress}%` }">
              <div class="ship-body">🛸</div>
              <div class="ship-label">あなた</div>
              <div class="progress-text">{{ Math.round(playerProgress) }}%</div>
            </div>

            <!-- AI Ship -->
            <div class="ai-ship" :style="{ left: `${aiProgress}%` }">
              <div class="ship-body">🤖</div>
              <div class="ship-label">AI</div>
              <div class="progress-text">{{ Math.round(aiProgress) }}%</div>
            </div>

            <!-- Fuel Stations (Words) -->
            <div
              v-for="(station, index) in fuelStations"
              :key="station.id"
              class="fuel-station"
              :style="{ left: `${station.position}%` }"
              :class="{ 'used': station.used }"
            >
              <div class="station-word">{{ station.word }}</div>
            </div>
          </div>

          <!-- Race Controls -->
          <div class="race-controls">
            <div class="next-fuel">
              <h3>🛸 次の燃料ステーション:</h3>
              <div class="fuel-word">{{ nextFuelWord }}</div>
              <button
                v-if="speechSupported"
                @click="startRaceVoice"
                :disabled="isListening || raceFinished"
                class="race-voice-button"
                :class="{ 'listening': isListening }"
              >
                {{ isListening ? '🎙️ 聞いています...' : '🗣️ 燃料補給！' }}
              </button>
            </div>

            <!-- Fuel Gauge -->
            <div class="fuel-gauge">
              <div class="gauge-label">⛽ 燃料</div>
              <div class="gauge-bar">
                <div class="fuel-fill" :style="{ height: `${fuelLevel}%` }"></div>
              </div>
              <div class="gauge-text">{{ fuelLevel }}%</div>
            </div>
          </div>

          <!-- Race Results -->
          <div v-if="raceFinished" class="race-results">
            <div class="results-modal">
              <h2>🏁 レース完了！</h2>
              <div class="winner-announcement">
                <div class="winner-icon">{{ raceWinner === 'player' ? '🏆' : '🥈' }}</div>
                <div class="winner-text">
                  {{ raceWinner === 'player' ? 'Victory!' : 'Good effort!' }}
                </div>
              </div>
              <div class="race-stats">
                <div class="stat-row">
                  <span>Your Time:</span>
                  <span>{{ finalTime }}s</span>
                </div>
                <div class="stat-row">
                  <span>Words Read:</span>
                  <span>{{ wordsRead }}</span>
                </div>
                <div class="stat-row">
                  <span>Average WPM:</span>
                  <span>{{ averageWPM }}</span>
                </div>
              </div>
              <div class="results-actions">
                <button @click="raceAgain" class="race-again-button">
                  🔄 Race Again
                </button>
                <button @click="returnToHub" class="hub-button">
                  🌌 Return to Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Feedback Modal -->
    <transition name="modal">
      <div v-if="showFeedback" class="feedback-modal" @click="closeFeedback">
        <div class="feedback-content" :class="feedbackType" @click.stop>
          <div class="feedback-icon">
            {{ feedbackType === 'success' ? '✅' : feedbackType === 'info' ? '💫' : '❌' }}
          </div>
          <h3 class="feedback-title">{{ feedbackTitle }}</h3>
          <p class="feedback-message">{{ feedbackMessage }}</p>
          <button @click="closeFeedback" class="feedback-button">
            {{ feedbackAction === 'microphone' ? '🎤 マイクを許可する' : '続ける' }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Settings Modal -->
    <transition name="modal">
      <div v-if="showSettings" class="settings-modal" @click="toggleSettings">
        <div class="settings-content" @click.stop>
          <h3>⚙️ Galaxy Settings</h3>
          <div class="settings-list">
            <div class="setting-item">
              <label>🔊 Sound Effects</label>
              <button @click="toggleSound" :class="{ 'active': soundEnabled }">
                {{ soundEnabled ? 'ON' : 'OFF' }}
              </button>
            </div>
            <div class="setting-item">
              <label>🎙️ 音声認識</label>
              <button @click="toggleVoice" :class="{ 'active': voiceEnabled }">
                {{ voiceEnabled ? 'オン' : 'オフ' }}
              </button>
            </div>
            <div class="setting-item">
              <label>🌟 難易度</label>
              <select v-model="difficulty" class="difficulty-select">
                <option value="easy">士官候補生</option>
                <option value="medium">船長</option>
                <option value="hard">提督</option>
              </select>
            </div>
          </div>
          <button @click="closeSettings" class="close-settings">
            閉じる
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

// Router and Store
const router = useRouter()
const gameStore = useGameStore()

// =================
// STATE MANAGEMENT
// =================

// Screen and Mode Management
const currentScreen = ref('hub') // 'hub' | 'game'
const currentMode = ref(null) // 'garden' only
const currentDifficulty = ref('beginner') // 'beginner' | 'intermediate' | 'advanced'
const timeLimit = ref(null) // Time limit in seconds (null for no limit)
const choiceCount = ref(3) // Number of choices to show

// Current Game State
const currentPattern = ref('at')

// Function to initialize random starting pattern
const initializeRandomPattern = () => {
  if (randomPatternMode.value) {
    const shuffledPatterns = [...allPatterns].sort(() => Math.random() - 0.5)
    currentPattern.value = shuffledPatterns[0]
    availablePatterns.value = shuffledPatterns
    console.log('Random starting pattern:', currentPattern.value)
    console.log('Shuffled pattern order:', availablePatterns.value)
  }
}
const currentLevel = ref(0)
const score = ref(0)
const lives = ref(3)

// Word Family Data - Massively Expanded
const wordFamilies = reactive({
  'at': {
    correct: [
      // Basic words
      'cat', 'hat', 'bat', 'rat', 'mat', 'fat', 'sat', 'pat', 'vat', 'gnat',
      // Compound and longer words
      'flat', 'chat', 'that', 'scat', 'brat', 'spat', 'splat', 'format', 'combat', 'habitat',
      // Additional words
      'acrobat', 'diplomat', 'thermostat', 'democrat', 'aristocrat'
    ],
    incorrect: [
      'dog', 'run', 'big', 'sun', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'house', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'an': {
    correct: [
      // Basic words
      'can', 'man', 'ran', 'pan', 'tan', 'fan', 'van', 'ban', 'span', 'clan',
      // Compound and longer words
      'plan', 'than', 'scan', 'began', 'japan', 'organ', 'human', 'woman', 'roman', 'urban',
      // Additional words
      'caravan', 'veteran', 'librarian', 'barbarian', 'vegetarian'
    ],
    incorrect: [
      'cat', 'big', 'sun', 'top', 'red', 'wet', 'dog', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'ap': {
    correct: [
      // Basic words
      'cap', 'map', 'tap', 'gap', 'nap', 'sap', 'lap', 'rap', 'zap', 'yap',
      // Compound and longer words
      'clap', 'trap', 'snap', 'wrap', 'slap', 'flap', 'strap', 'scrap', 'adapt', 'mishap',
      // Additional words
      'overlap', 'handicap', 'bootstrap', 'wiretap', 'kidnap'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'house', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'it': {
    correct: [
      // Basic words
      'sit', 'hit', 'bit', 'fit', 'pit', 'kit', 'lit', 'wit', 'quit', 'knit',
      // Compound and longer words
      'split', 'admit', 'commit', 'permit', 'submit', 'transmit', 'inherit', 'exhibit', 'benefit', 'deficit',
      // Additional words
      'deposit', 'recruit', 'circuit', 'pursuit', 'biscuit'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'house', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'op': {
    correct: [
      // Basic words
      'top', 'hop', 'cop', 'mop', 'pop', 'shop', 'stop', 'drop', 'crop', 'prop',
      // Compound and longer words
      'flop', 'chop', 'plop', 'slop', 'swap', 'bishop', 'laptop', 'desktop', 'rooftop', 'hilltop',
      // Additional words
      'workshop', 'backdrop', 'barbershop', 'mountaintop', 'raindrop'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'house', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'in': {
    correct: [
      // Basic words
      'pin', 'win', 'tin', 'bin', 'fin', 'sin', 'gin', 'kin', 'din', 'chin',
      // Compound and longer words
      'thin', 'spin', 'grin', 'skin', 'twin', 'begin', 'origin', 'margin', 'raisin', 'cousin',
      // Additional words
      'penguin', 'vitamin', 'dolphin', 'muffin', 'bulletin'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'ig': {
    correct: [
      // Basic words
      'big', 'pig', 'dig', 'fig', 'wig', 'jig', 'rig', 'gig', 'sig', 'zig',
      // Compound and longer words
      'twig', 'sprig', 'thig', 'swig', 'whig', 'guinea pig', 'zigzag', 'bigwig', 'config', 'shindig',
      // Additional words
      'earwig', 'figjam', 'rigging', 'digging', 'wigging'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'hat', 'sun', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'ug': {
    correct: [
      // Basic words
      'bug', 'hug', 'mug', 'rug', 'tug', 'jug', 'dug', 'lug', 'pug', 'chug',
      // Compound and longer words
      'drug', 'plug', 'slug', 'snug', 'shrug', 'smug', 'debug', 'unplug', 'bedbug', 'firebug',
      // Additional words
      'ladybug', 'humbug', 'earplug', 'sparkplug', 'tugboat'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'un': {
    correct: [
      // Basic words
      'run', 'sun', 'fun', 'gun', 'bun', 'nun', 'pun', 'dun', 'hun', 'stun',
      // Compound and longer words
      'spun', 'begun', 'outrun', 'rerun', 'homerun', 'shotgun', 'someone', 'everyone', 'anyone', 'undone',
      // Additional words
      'honeybun', 'cinnamon', 'skeleton', 'champion', 'dragoon'
    ],
    incorrect: [
      'cat', 'dog', 'hat', 'big', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'house', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  },
  'et': {
    correct: [
      // Basic words
      'pet', 'wet', 'net', 'set', 'get', 'let', 'bet', 'jet', 'met', 'vet',
      // Compound and longer words
      'yet', 'debt', 'nest', 'west', 'best', 'test', 'rest', 'chest', 'quest', 'forest',
      // Additional words
      'basket', 'bucket', 'market', 'target', 'carpet'
    ],
    incorrect: [
      'cat', 'dog', 'run', 'big', 'sun', 'car', 'bed', 'cup', 'pen', 'box', 'fish', 'book', 'tree', 'bird',
      'ship', 'moon', 'star', 'wind', 'rain', 'snow', 'rock', 'sand', 'lake', 'hill'
    ]
  }
})

const allPatterns = Object.keys(wordFamilies)
const masteredPatterns = ref(['at', 'an']) // Example mastered patterns

// Random pattern selection options
const randomPatternMode = ref(true) // Enable random pattern selection
const availablePatterns = ref([...allPatterns]) // Patterns not yet completed in this session

// Difficulty level configurations
const difficultySettings = {
  beginner: {
    patterns: ['at', 'an', 'ap'],
    choiceCount: 3,
    timeLimit: null,
    icon: '🌱',
    description: '基本的な音韻パターン'
  },
  intermediate: {
    patterns: ['it', 'op', 'in', 'ig'],
    choiceCount: 4,
    timeLimit: 30,
    icon: '🌿',
    description: '複雑な音韻パターン'
  },
  advanced: {
    patterns: ['ug', 'un', 'et'],
    choiceCount: 5,
    timeLimit: 20,
    icon: '🌳',
    description: '高難度音韻パターン'
  }
}

// =================
// VOICE RECOGNITION
// =================

const speechSupported = ref(false)
const voiceEnabled = ref(true)
const isListening = ref(false)
const recognitionSuccess = ref(false)
const voiceStatusText = ref('音声認識を初期化中...')
const microphonePermission = ref('prompt') // 'granted', 'denied', 'prompt'
let recognition = null

// =================
// MODE 1: STELLAR GARDEN
// =================

const placedStars = ref([])
const availableWords = ref([])
const usedWords = ref([])
const currentTargetWord = ref('')
const currentWordHint = ref('')
const collectedStars = ref(0)

// =================
// MODE 2: CONSTELLATION RUSH
// =================

const currentCombo = ref(0)
const gameSpeed = ref('Normal')
const floatingStars = ref([])
const currentRushTarget = ref('')
const speedPercentage = ref(25)

// =================
// MODE 3: LAB STATION
// =================

const labSamples = ref(0)
const totalSamples = ref(8)
const analysisComplete = ref(0)
const currentLabWord = ref('')
const isRecording = ref(false)
const hasRecording = ref(false)
const analysisResult = ref(null)
const storedSamples = ref([])
const waveformCanvas = ref(null)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const recordedAudioUrl = ref(null)

// =================
// MODE 4: GALACTIC RACE
// =================

const playerProgress = ref(0)
const aiProgress = ref(0)
const fuelLevel = ref(100)
const playerSpeed = ref(0)
const raceTime = ref(0)
const raceFinished = ref(false)
const raceWinner = ref(null)
const nextFuelWord = ref('')
const fuelStations = ref([])
const finalTime = ref(0)
const wordsRead = ref(0)
const averageWPM = ref(0)

// =================
// UI STATE
// =================

const showFeedback = ref(false)
const showSettings = ref(false)
const feedbackType = ref('success')
const feedbackTitle = ref('')
const feedbackMessage = ref('')
const feedbackAction = ref('') // 'microphone' for mic permission requests
const soundEnabled = ref(true)
const difficulty = ref('medium')

// =================
// COMPUTED PROPERTIES
// =================

const totalStarsCollected = computed(() => {
  return masteredPatterns.value.reduce((total, pattern) => {
    return total + wordFamilies[pattern].correct.length
  }, 0) + placedStars.value.length
})

const overallAccuracy = computed(() => {
  // This would typically come from stored game data
  return 87 // Example value
})

const bestStreak = computed(() => {
  // This would typically come from stored game data
  return 12 // Example value
})

const completedMissions = computed(() => {
  return masteredPatterns.value.length
})

const totalStarsInSystem = computed(() => {
  return wordFamilies[currentPattern.value].correct.length
})

// =================
// MICROPHONE PERMISSION CHECK
// =================

const checkMicrophonePermission = async () => {
  try {
    if (!navigator.permissions) {
      console.log('Permissions API not supported')
      return 'unsupported'
    }

    const result = await navigator.permissions.query({ name: 'microphone' })
    microphonePermission.value = result.state
    console.log('Microphone permission:', result.state)

    result.addEventListener('change', () => {
      microphonePermission.value = result.state
      console.log('Microphone permission changed:', result.state)

      if (result.state === 'denied') {
        stopVoiceRecognition()
        voiceStatusText.value = 'マイクの使用が拒否されています'
        showFeedbackMessage('error', 'マイク許可必須', 'ブラウザの設定でマイクの使用を許可してください。')
      } else if (result.state === 'granted') {
        voiceStatusText.value = '音声認識が利用可能です'
      }
    })

    return result.state
  } catch (error) {
    console.error('Error checking microphone permission:', error)
    return 'unknown'
  }
}

const requestMicrophoneAccess = async () => {
  try {
    console.log('Requesting microphone access...')
    console.log('location.protocol:', location.protocol)
    console.log('location.hostname:', location.hostname)

    // ブラウザ互換性チェック - より安全にチェック
    if (!navigator || !navigator.mediaDevices) {
      console.error('navigator.mediaDevices is undefined')
      throw new Error('MediaDevices API is not supported by this browser')
    }

    console.log('navigator.mediaDevices:', navigator.mediaDevices)

    if (!navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported by this browser')
    }

    // HTTPSチェック（開発環境を除く）
    if (location.protocol !== 'https:' && !['localhost', '127.0.0.1', '::1'].includes(location.hostname)) {
      throw new Error('Microphone access requires HTTPS connection')
    }

    // セキュアコンテキストチェック
    if (typeof window.isSecureContext !== 'undefined' && !window.isSecureContext) {
      throw new Error('Microphone access requires secure context (HTTPS)')
    }

    // MediaStreamを要求してマイクアクセスを明示的に許可させる
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    console.log('Microphone access granted')

    // ストリームを停止（音声認識で使用するため）
    stream.getTracks().forEach(track => track.stop())

    microphonePermission.value = 'granted'
    voiceStatusText.value = '音声認識が利用可能です'

    return true
  } catch (error) {
    console.error('Microphone access denied:', error)
    microphonePermission.value = 'denied'

    // より詳細なエラー処理
    let errorMessage = 'マイクへのアクセスが拒否されました。'
    let errorTitle = 'マイクエラー'

    if (error.message.includes('MediaDevices API is not supported') ||
        error.message.includes('getUserMedia is not supported')) {
      // ブラウザが非対応の場合は、エラーモーダルを表示せずに音声認識を無効にする
      speechSupported.value = false
      voiceStatusText.value = '音声認識未対応（クリックモードをご利用ください）'
      console.warn('MediaDevices API not supported, falling back to click mode')
      return false
    } else if (error.message.includes('HTTPS connection') || error.message.includes('secure context')) {
      errorMessage = 'マイク機能にはHTTPS接続が必要です。セキュアな接続でアクセスしてください。'
      errorTitle = 'セキュア接続必要'
    } else if (error.name === 'NotAllowedError') {
      errorMessage = 'マイクアクセスが拒否されました。ブラウザ設定でマイクアクセスを許可してください。'
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'マイクが見つかりません。マイクが接続されているか確認してください。'
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'マイクが他のアプリケーションで使用中です。他のアプリを閉じてから再試行してください。'
    }

    // ブラウザ非対応以外のエラーの場合のみモーダルを表示
    if (!error.message.includes('MediaDevices API is not supported') &&
        !error.message.includes('getUserMedia is not supported')) {
      showFeedbackMessage('error', errorTitle, errorMessage, 'microphone')
      voiceStatusText.value = 'マイクアクセスが拒否されています'
    }

    return false
  }
}

// =================
// VOICE RECOGNITION SETUP
// =================

const initializeSpeechRecognition = () => {
  try {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speechSupported.value = false
      voiceStatusText.value = 'Voice recognition not supported in this browser'
      console.warn('Speech recognition not supported')
      return
    }

    speechSupported.value = true
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      speechSupported.value = false
      voiceStatusText.value = 'Speech recognition not available'
      return
    }

    recognition = new SpeechRecognition()

    // Configure recognition settings
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      console.log('Speech recognition started')
      isListening.value = true
      voiceStatusText.value = '聞いています... はっきりと話してください'
    }

    recognition.onresult = (event) => {
      try {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript.toLowerCase().trim()
          console.log('Speech recognition result:', transcript)
          processVoiceInput(transcript)
        } else {
          console.warn('No speech results received')
          showFeedbackMessage('error', '音声エラー', '音声が認識できませんでした。もう一度お試しください。')
        }
      } catch (error) {
        console.error('Error processing speech result:', error)
        showFeedbackMessage('error', '音声処理エラー', '音声の処理中にエラーが発生しました。')
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false

      let errorMessage = '音声認識でエラーが発生しました。'
      switch (event.error) {
        case 'no-speech':
          errorMessage = '音声が検出されませんでした。マイクに向かって話してください。'
          break
        case 'audio-capture':
          errorMessage = '🎙️ マイクデバイスにアクセスできません。\n\n📋 確認事項：\n1. マイクが正しく接続されているか\n2. 他のアプリがマイクを使用していないか\n3. システムのマイク設定を確認'
          break
        case 'not-allowed':
          errorMessage = '🎤 マイクアクセスが拒否されています。\n\n📋 解決方法：\n1. アドレスバーの🔒アイコンをクリック\n2. 「マイク」を「許可」に変更\n3. ページを再読み込みしてください'
          break
        case 'network':
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。'
          break
        case 'aborted':
          errorMessage = '音声認識が中断されました。'
          break
        default:
          errorMessage = `音声認識エラー: ${event.error}`
      }

      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        showFeedbackMessage('error', '音声エラー', errorMessage, 'microphone')
      } else {
        showFeedbackMessage('error', '音声エラー', errorMessage)
      }
      voiceStatusText.value = 'クリックして音声認識を再開'
    }

    recognition.onend = () => {
      console.log('Speech recognition ended')
      isListening.value = false
      voiceStatusText.value = 'クリックして音声認識を開始'
    }

    voiceStatusText.value = '音声認識が利用可能です'
    console.log('Speech recognition initialized successfully')

  } catch (error) {
    console.error('Failed to initialize speech recognition:', error)
    speechSupported.value = false
    voiceStatusText.value = '音声認識の初期化に失敗しました'
    showFeedbackMessage('error', '初期化エラー', '音声認識の初期化に失敗しました。ページを再読み込みしてください。')
  }
}

// =================
// GAME LOGIC METHODS
// =================

const startGardenLevel = (difficulty) => {
  currentDifficulty.value = difficulty
  currentMode.value = 'garden'
  currentScreen.value = 'game'

  // Apply difficulty settings
  const settings = difficultySettings[difficulty]
  choiceCount.value = settings.choiceCount
  timeLimit.value = settings.timeLimit
  availablePatterns.value = [...settings.patterns]

  // Start with a random pattern from the difficulty level
  const randomPattern = settings.patterns[Math.floor(Math.random() * settings.patterns.length)]
  currentPattern.value = randomPattern

  console.log(`Starting ${difficulty} level with pattern:`, randomPattern)
  console.log('Difficulty settings:', settings)

  initializeStellarGarden()
}

const returnToHub = () => {
  currentScreen.value = 'hub'
  currentMode.value = null
  // Reset any game-specific state
  resetGameState()
}

const resetGameState = () => {
  isListening.value = false
  placedStars.value = []
  availableWords.value = []
  usedWords.value = []
  currentTargetWord.value = ''
  collectedStars.value = 0
  currentCombo.value = 0
  floatingStars.value = []
  labSamples.value = 0
  storedSamples.value = []
  playerProgress.value = 0
  aiProgress.value = 0
  fuelLevel.value = 100
  raceFinished.value = false
}

// =================
// MODE 1: STELLAR GARDEN METHODS
// =================

const initializeStellarGarden = () => {
  console.log('=== Initializing Stellar Garden ===')

  if (!wordFamilies[currentPattern.value]) {
    console.error('No word family data found for pattern:', currentPattern.value)
    return
  }

  const correctWords = [...wordFamilies[currentPattern.value].correct]
  const incorrectWords = [...wordFamilies[currentPattern.value].incorrect]

  // Initialize with a mix of correct and incorrect words for the first round
  // Enhanced randomization with multiple shuffles
  const shuffledCorrect = [...correctWords].sort(() => Math.random() - 0.5)
  const shuffledIncorrect = [...incorrectWords].sort(() => Math.random() - 0.5)

  const correctChoicesCount = 1
  const incorrectChoicesCount = choiceCount.value - 1

  const selectedCorrect = shuffledCorrect.slice(0, correctChoicesCount)
  const selectedIncorrect = shuffledIncorrect.slice(0, incorrectChoicesCount)

  // Final randomization of choice order
  const allInitialChoices = [...selectedCorrect, ...selectedIncorrect]
  availableWords.value = [...allInitialChoices].sort(() => Math.random() - 0.5)

  console.log('Initial choices set to:', availableWords.value)
  console.log('Correct word in initial choices:', selectedCorrect[0])
  console.log('Choice count:', availableWords.value.length)

  // Set first target word
  setNextTargetWord()

  // Show tutorial for first time
  if (score.value === 0 && lives.value === 3) {
    setTimeout(() => {
      showFeedbackMessage('info', '🎯 音韻パターン学習へようこそ!',
        '🔊ボタンで発音を聞いて、ターゲット単語と同じ音韻パターンの単語を見つけよう！音だけで判断してください。',
        null, 5000)
    }, 1000)
  }
}

const setNextTargetWord = () => {
  const remainingCorrectWords = wordFamilies[currentPattern.value].correct
    .filter(word => !placedStars.value.includes(word))

  console.log('Setting next target word...')
  console.log('Remaining correct words:', remainingCorrectWords)

  if (remainingCorrectWords.length === 0) {
    currentTargetWord.value = ''
    console.log('No remaining words, advancing to next pattern')
    nextSystem()
    return
  }

  // Select target word (NOT included in choices) - improved randomization
  const shuffledRemaining = [...remainingCorrectWords].sort(() => Math.random() - 0.5)
  const targetWord = shuffledRemaining[0]
  currentTargetWord.value = targetWord
  currentWordHint.value = getWordHint(targetWord)

  // Generate choice selection for phoneme family matching
  // Target word is NOT in choices - user must find same pattern word
  const incorrectWords = [...wordFamilies[currentPattern.value].incorrect]
  const otherCorrectWords = wordFamilies[currentPattern.value].correct
    .filter(word => word !== targetWord) // Exclude target word

  // Need: 1 correct family word + (choiceCount-1) incorrect words
  const shuffledCorrect = [...otherCorrectWords].sort(() => Math.random() - 0.5)
  const shuffledIncorrect = [...incorrectWords].sort(() => Math.random() - 0.5)

  const correctChoicesCount = 1
  const incorrectChoicesCount = choiceCount.value - 1

  const choiceCorrect = shuffledCorrect.slice(0, correctChoicesCount)
  const choiceIncorrect = shuffledIncorrect.slice(0, incorrectChoicesCount)

  // Final shuffle of all choices
  const allChoices = [...choiceCorrect, ...choiceIncorrect]
  availableWords.value = [...allChoices].sort(() => Math.random() - 0.5)

  console.log('Target word (NOT in choices):', currentTargetWord.value)
  console.log('Available choices:', availableWords.value)
  console.log('Correct family choice:', choiceCorrect[0])
  console.log('Target in choices?', availableWords.value.includes(currentTargetWord.value))
  console.log('Choice count:', availableWords.value.length)
}

const getWordHint = (word) => {
  const hints = {
    // -at family
    'cat': '🐱 Meows and purrs',
    'hat': '🎩 Wear on your head',
    'bat': '🦇 Flies at night',
    'rat': '🐭 Small rodent',
    'mat': '🪆 Step on it',
    'fat': '🍔 Opposite of thin',
    'sat': '🪑 Past tense of sit',
    'pat': '👋 Gentle touch',
    'vat': '🏭 Large container',
    'flat': '🏠 Apartment',
    'chat': '💬 Talk casually',
    'that': '👉 Pointing word',
    'brat': '😤 Spoiled child',
    'combat': '⚔️ Fighting',
    'habitat': '🏡 Where animals live',

    // -an family
    'can': '🥫 Metal container',
    'man': '👨 Adult male',
    'ran': '🏃 Past tense of run',
    'pan': '🍳 Cooking utensil',
    'fan': '💨 Cooling device',
    'van': '🚐 Large vehicle',
    'plan': '📋 Strategy',
    'than': '↔️ Comparison word',
    'scan': '👀 Look carefully',
    'human': '👤 Person',
    'organ': '🎹 Musical instrument',
    'urban': '🏙️ City-related',

    // -ap family
    'cap': '🧢 Hat',
    'map': '🗺️ Shows directions',
    'tap': '🚰 Water faucet',
    'gap': '↔️ Empty space',
    'nap': '😴 Short sleep',
    'lap': '🏃 One circuit',
    'clap': '👏 Applaud',
    'trap': '🪤 Catches animals',
    'snap': '📸 Take a photo',
    'wrap': '🎁 Cover with paper',

    // -it family
    'sit': '🪑 Rest on chair',
    'hit': '👊 Strike',
    'bit': '🦷 Small piece',
    'fit': '💪 In good shape',
    'pit': '🕳️ Deep hole',
    'kit': '🧰 Set of tools',
    'lit': '🔥 On fire',
    'wit': '🧠 Clever humor',
    'quit': '🚪 Stop doing',
    'split': '✂️ Divide in half',
    'admit': '✅ Confess',
    'permit': '📄 Allow',

    // -op family
    'top': '⬆️ Highest part',
    'hop': '🐰 Jump',
    'cop': '👮 Police officer',
    'mop': '🧽 Clean floors',
    'pop': '🎈 Burst',
    'shop': '🏪 Store',
    'stop': '🛑 Halt',
    'drop': '💧 Fall down',
    'crop': '🌾 Farm plants',
    'chop': '🪓 Cut with axe',

    // -in family
    'pin': '📌 Sharp fastener',
    'win': '🏆 Be victorious',
    'tin': '🥫 Metal material',
    'bin': '🗑️ Trash container',
    'fin': '🐟 Fish body part',
    'sin': '😈 Bad deed',
    'chin': '😊 Below mouth',
    'thin': '📏 Not thick',
    'spin': '🌀 Rotate',
    'grin': '😄 Big smile',
    'skin': '👋 Body covering',
    'twin': '👫 Same birth',

    // -ig family
    'big': '🐘 Large size',
    'pig': '🐷 Farm animal',
    'dig': '⛏️ Make hole',
    'fig': '🍇 Sweet fruit',
    'wig': '👩‍🦲 Fake hair',
    'jig': '💃 Lively dance',
    'twig': '🌿 Small branch',

    // -ug family
    'bug': '🐛 Small insect',
    'hug': '🤗 Embrace',
    'mug': '☕ Coffee cup',
    'rug': '🧿 Floor carpet',
    'tug': '💪 Pull hard',
    'jug': '🏺 Water container',
    'drug': '💊 Medicine',
    'plug': '🔌 Electric connector',
    'slug': '🐌 Slow creature',
    'snug': '🛏️ Cozy',

    // -un family
    'run': '🏃 Move fast',
    'sun': '☀️ Bright star',
    'fun': '🎉 Enjoyable',
    'gun': '🔫 Weapon',
    'bun': '🍞 Bread roll',
    'nun': '👩‍💼 Religious woman',
    'spun': '🌀 Past of spin',
    'stun': '😵 Shock',

    // -et family
    'pet': '🐕 Domestic animal',
    'wet': '💧 Not dry',
    'net': '🕸️ Mesh trap',
    'set': '📦 Group of things',
    'get': '👋 Obtain',
    'let': '✅ Allow',
    'bet': '🎰 Gamble',
    'jet': '✈️ Fast plane',
    'met': '🤝 Past of meet',
    'vet': '👩‍⚕️ Animal doctor',
    'yet': '⏰ Still',
    'nest': '🪺 Bird home',
    'west': '🌅 Direction',
    'best': '🏆 Top quality',
    'test': '📝 Exam',
    'rest': '😴 Relax'
  }
  return hints[word] || `Word ending in -${currentPattern.value}`
}

const startVoiceRecognition = async () => {
  try {
    if (!speechSupported.value) {
      console.warn('Speech recognition not supported, cannot start voice recognition')
      return
    }

    if (!voiceEnabled.value) {
      showFeedbackMessage('error', '音声認識無効', '設定で音声認識を有効にしてください。')
      return
    }

    // Browser compatibility check before attempting microphone access
    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('MediaDevices API not available, cannot start voice recognition')
      speechSupported.value = false
      voiceStatusText.value = '音声認識未対応（クリックモードをご利用ください）'
      return
    }

    if (!recognition) {
      showFeedbackMessage('error', '音声認識未初期化', '音声認識が初期化されていません。ページを再読み込みしてください。')
      return
    }

    if (isListening.value) {
      console.log('Voice recognition already in progress')
      return
    }

    // マイクアクセスが許可されていない場合は明示的に要求
    if (microphonePermission.value === 'denied' || microphonePermission.value === 'prompt') {
      const accessGranted = await requestMicrophoneAccess()
      if (!accessGranted) {
        return
      }
    }

    console.log('Starting voice recognition...')
    recognition.start()

  } catch (error) {
    console.error('Error starting voice recognition:', error)
    isListening.value = false

    let errorMessage = '音声認識の開始に失敗しました。'
    if (error.name === 'InvalidStateError') {
      errorMessage = '音声認識が既に実行中です。しばらく待ってからもう一度お試しください。'
    } else if (error.name === 'NotAllowedError') {
      errorMessage = '🎤 マイクアクセスが拒否されています。\n\n📋 解決方法：\n1. アドレスバーの🔒アイコンをクリック\n2. 「マイク」を「許可」に変更\n3. ページを再読み込みしてください'
    }

    if (error.name === 'NotAllowedError') {
      showFeedbackMessage('error', '音声認識エラー', errorMessage, 'microphone')
    } else {
      showFeedbackMessage('error', '音声認識エラー', errorMessage)
    }
  }
}

const processVoiceInput = (transcript) => {
  console.log('Voice input:', transcript)

  if (currentMode.value === 'garden') {
    processGardenVoiceInput(transcript)
  } else if (currentMode.value === 'rush') {
    processRushVoiceInput(transcript)
  } else if (currentMode.value === 'race') {
    processRaceVoiceInput(transcript)
  }
}

const processGardenVoiceInput = (transcript) => {
  if (usedWords.value.includes(transcript)) {
    showFeedbackMessage('error', 'Already Used', `"${transcript}" has already been used.`)
    return
  }

  if (transcript === currentTargetWord.value) {
    recognitionSuccess.value = true
    setTimeout(() => { recognitionSuccess.value = false }, 1000)

    // Successfully captured the word
    placedStars.value.push(currentTargetWord.value)
    collectedStars.value++
    score.value += 100
    usedWords.value.push(currentTargetWord.value)

    showFeedbackMessage('success', 'Star Captured!', `"${currentTargetWord.value}" has been placed in orbit!`)

    // Play success sound
    if (soundEnabled.value) {
      playSuccessSound()
    }

    setNextTargetWord()
  } else {
    // Check if it's a valid word from available words
    if (availableWords.value.includes(transcript)) {
      usedWords.value.push(transcript)

      if (isCorrectFamily(transcript)) {
        // Correct family but not the target
        showFeedbackMessage('error', 'Wrong Target', `"${transcript}" is from the right family, but the target is "${currentTargetWord.value}".`)
      } else {
        // Wrong family
        lives.value--
        showFeedbackMessage('error', 'Wrong Family', `"${transcript}" is not from the -${currentPattern.value} family.`)

        if (lives.value <= 0) {
          gameOver()
        }
      }
    } else {
      showFeedbackMessage('error', 'Not Recognized', `"${transcript}" is not available. Try "${currentTargetWord.value}".`)
    }
  }
}

// Audio playback functions
const playTargetWord = () => {
  if (currentTargetWord.value) {
    playWord(currentTargetWord.value)
  }
}

const playWord = (word) => {
  console.log('Playing word:', word)
  if (soundEnabled.value && 'speechSynthesis' in window) {
    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 0.8
    utterance.lang = 'en-US'

    speechSynthesis.speak(utterance)
  }
}

const handleWordCapsuleClick = (word) => {
  // First play the word pronunciation
  playWord(word)

  // Small delay then process the selection
  setTimeout(() => {
    selectWordCapsule(word)
  }, 100)
}

const selectWordCapsule = (word) => {
  console.log('Word capsule selected:', word)
  console.log('Current target word:', currentTargetWord.value)

  if (usedWords.value.includes(word)) {
    showFeedbackMessage('info', 'Already Used', `"${word}" has already been selected.`)
    return
  }

  // Check if word belongs to the same phoneme family as target
  if (isCorrectFamily(word)) {
    // Correct! Selected a word from the same phoneme family
    placedStars.value.push(word)
    collectedStars.value++
    score.value += 100
    usedWords.value.push(word)

    showFeedbackMessage('success', '🎉 正解！', `"${word}" ✅\n"${currentTargetWord.value}" と同じ -${currentPattern.value} パターンです！\n\n音韻を正しく識別できました！`)

    // Play success sound
    if (soundEnabled.value) {
      playSuccessSound()
    }

    setTimeout(() => {
      setNextTargetWord()
    }, 2000)
  } else {
    // Wrong choice - different phoneme family
    lives.value--

    const targetWord = currentTargetWord.value
    showFeedbackMessage('error', '❌ 不正解', `選択: "${word}"\nターゲット: "${targetWord}" (-${currentPattern.value}パターン)\n\n"${word}" は違う音韻パターンです。\n🔊で発音の違いを確認しよう！`)

    if (lives.value <= 0) {
      gameOver()
    } else {
      // Mark wrong choice as used, but keep it visible for learning
      usedWords.value = [...usedWords.value, word]
    }
  }
}

const skipWithPenalty = () => {
  score.value = Math.max(0, score.value - 10)
  setNextTargetWord()
  showFeedbackMessage('error', 'Word Skipped', 'Try using your voice next time!')
}

const getOrbitPosition = (index) => {
  const radius = 120 + (index % 3) * 40
  const angle = (index * 45) % 360
  const x = Math.cos(angle * Math.PI / 180) * radius
  const y = Math.sin(angle * Math.PI / 180) * radius

  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 0.5}s`
  }
}

const reviewStar = (word) => {
  if (soundEnabled.value) {
    speakWord(word)
  }
}

// =================
// MODE 2: CONSTELLATION RUSH METHODS
// =================

const initializeConstellationRush = () => {
  currentCombo.value = 0
  gameSpeed.value = 'Normal'
  speedPercentage.value = 25
  generateFloatingStars()
  setNextRushTarget()
  startRushTimer()
}

const generateFloatingStars = () => {
  const correctWords = wordFamilies[currentPattern.value].correct
  const incorrectWords = wordFamilies[currentPattern.value].incorrect
  const allWords = [...correctWords.slice(0, 4), ...incorrectWords.slice(0, 2)]

  floatingStars.value = allWords.map((word, index) => ({
    id: `star-${index}`,
    word,
    isTarget: false,
    captured: false,
    style: {
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 60 + 20}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${3 + Math.random() * 2}s`
    }
  }))
}

const setNextRushTarget = () => {
  const availableTargets = floatingStars.value
    .filter(star => !star.captured && wordFamilies[currentPattern.value].correct.includes(star.word))

  if (availableTargets.length === 0) {
    // Regenerate stars
    generateFloatingStars()
    return
  }

  // Clear previous target
  floatingStars.value.forEach(star => { star.isTarget = false })

  // Set new target
  const targetStar = availableTargets[Math.floor(Math.random() * availableTargets.length)]
  targetStar.isTarget = true
  currentRushTarget.value = targetStar.word
}

const startRushVoice = () => {
  if (!speechSupported.value) {
    console.warn('Speech recognition not supported, cannot start rush voice')
    return
  }

  if (!voiceEnabled.value) {
    showFeedbackMessage('error', '音声認識無効', '設定で音声認識を有効にしてください。')
    return
  }

  startVoiceRecognition()
}

const processRushVoiceInput = (transcript) => {
  if (transcript === currentRushTarget.value) {
    // Success! Capture the star
    const targetStar = floatingStars.value.find(star => star.word === currentRushTarget.value)
    if (targetStar) {
      targetStar.captured = true
      currentCombo.value++
      score.value += 50 + (currentCombo.value * 10)

      // Increase speed based on combo
      if (currentCombo.value > 5) {
        gameSpeed.value = 'Fast'
        speedPercentage.value = 75
      } else if (currentCombo.value > 10) {
        gameSpeed.value = 'Hyper'
        speedPercentage.value = 100
      }

      setNextRushTarget()
    }
  } else {
    // Wrong word - break combo
    currentCombo.value = 0
    gameSpeed.value = 'Normal'
    speedPercentage.value = 25
    showFeedbackMessage('error', 'Combo Broken', `Target was "${currentRushTarget.value}", not "${transcript}".`)
  }
}

const startRushTimer = () => {
  // Auto-generate new targets every few seconds
  const rushInterval = setInterval(() => {
    if (currentMode.value !== 'rush') {
      clearInterval(rushInterval)
      return
    }

    // Randomly move stars around
    floatingStars.value.forEach(star => {
      if (!star.captured) {
        star.style.left = `${Math.random() * 80 + 10}%`
        star.style.top = `${Math.random() * 60 + 20}%`
      }
    })
  }, 3000)
}

// =================
// MODE 3: LAB STATION METHODS
// =================

const initializeLabStation = () => {
  labSamples.value = 0
  analysisComplete.value = 0
  storedSamples.value = []
  setNextLabWord()
}

const setNextLabWord = () => {
  const remainingWords = wordFamilies[currentPattern.value].correct
    .filter(word => !storedSamples.value.includes(word))

  if (remainingWords.length === 0) {
    currentLabWord.value = ''
    analysisComplete.value = 100
    return
  }

  currentLabWord.value = remainingWords[0]
}

const recordSample = async () => {
  if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showFeedbackMessage('error', 'Recording Unavailable', 'Microphone access is required for this mode.')
    return
  }

  try {
    if (isRecording.value) {
      // Stop recording
      stopRecording()
      return
    }

    // Start recording
    console.log('Starting audio recording...')
    isRecording.value = true
    recordedChunks.value = []

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder not supported in this browser')
    }

    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
    })

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      console.log('Recording stopped, processing audio...')
      const blob = new Blob(recordedChunks.value, { type: 'audio/webm' })
      recordedAudioUrl.value = URL.createObjectURL(blob)
      hasRecording.value = true

      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop())

      generateAnalysis()
      drawWaveform()
    }

    mediaRecorder.value.onerror = (event) => {
      console.error('MediaRecorder error:', event.error)
      showFeedbackMessage('error', 'Recording Error', 'An error occurred during recording.')
      isRecording.value = false
    }

    mediaRecorder.value.start()

    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (isRecording.value) {
        stopRecording()
      }
    }, 5000)

  } catch (err) {
    console.error('Recording failed:', err)
    isRecording.value = false

    let errorMessage = 'Could not access microphone.'
    if (err.name === 'NotAllowedError') {
      errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No microphone found. Please connect a microphone and try again.'
    } else if (err.message.includes('MediaRecorder not supported')) {
      errorMessage = 'Audio recording not supported in this browser.'
    }

    showFeedbackMessage('error', 'Recording Failed', errorMessage)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

const generateAnalysis = () => {
  // Simulate AI analysis
  const accuracy = Math.floor(Math.random() * 20) + 80 // 80-100%
  const phonetic = generatePhonetic(currentLabWord.value)
  const sounds = currentLabWord.value.split('')

  analysisResult.value = {
    phonetic,
    accuracy,
    sounds
  }
}

const generatePhonetic = (word) => {
  const phoneticMap = {
    'cat': '/kæt/',
    'hat': '/hæt/',
    'bat': '/bæt/',
    'rat': '/ræt/',
    'mat': '/mæt/',
    'fat': '/fæt/',
    'sat': '/sæt/',
    'pat': '/pæt/',
  }
  return phoneticMap[word] || `/${word}/`
}

const playbackSample = () => {
  if (!hasRecording.value || !recordedAudioUrl.value) {
    showFeedbackMessage('error', 'No Recording', 'No audio recording available to play back.')
    return
  }

  try {
    console.log('Playing back recorded audio...')
    const audio = new Audio(recordedAudioUrl.value)

    audio.onplay = () => {
      console.log('Playback started')
    }

    audio.onended = () => {
      console.log('Playback completed')
    }

    audio.onerror = (error) => {
      console.error('Playback error:', error)
      showFeedbackMessage('error', 'Playback Error', 'Could not play the recorded audio.')
    }

    audio.play().catch(err => {
      console.error('Audio play failed:', err)
      showFeedbackMessage('error', 'Playback Failed', 'Could not start audio playback.')
    })

  } catch (err) {
    console.error('Playback setup failed:', err)
    showFeedbackMessage('error', 'Playback Error', 'Could not set up audio playback.')
  }
}

const drawWaveform = () => {
  if (!waveformCanvas.value) return

  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width = 300
  const height = canvas.height = 100

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#00ff88'
  ctx.lineWidth = 2

  // Draw a simple waveform simulation
  ctx.beginPath()
  for (let i = 0; i < width; i++) {
    const y = height / 2 + Math.sin(i * 0.1) * Math.random() * 20
    if (i === 0) {
      ctx.moveTo(i, y)
    } else {
      ctx.lineTo(i, y)
    }
  }
  ctx.stroke()
}

const storeSample = () => {
  storedSamples.value.push(currentLabWord.value)
  labSamples.value++
  analysisComplete.value = Math.round((labSamples.value / totalSamples.value) * 100)
  score.value += 200

  hasRecording.value = false
  analysisResult.value = null

  showFeedbackMessage('success', 'Sample Stored!', `"${currentLabWord.value}" added to research database.`)
  setNextLabWord()
}

// =================
// MODE 4: GALACTIC RACE METHODS
// =================

const initializeGalacticRace = () => {
  playerProgress.value = 0
  aiProgress.value = 0
  fuelLevel.value = 100
  playerSpeed.value = 0
  raceTime.value = 0
  raceFinished.value = false
  wordsRead.value = 0

  generateFuelStations()
  setNextFuelWord()
  startRaceTimer()
}

const generateFuelStations = () => {
  const words = wordFamilies[currentPattern.value].correct
  fuelStations.value = words.map((word, index) => ({
    id: `station-${index}`,
    word,
    position: (index + 1) * (100 / words.length),
    used: false
  }))
}

const setNextFuelWord = () => {
  const nextStation = fuelStations.value.find(station => !station.used)
  nextFuelWord.value = nextStation ? nextStation.word : ''
}

const startRaceVoice = () => {
  if (!speechSupported.value) {
    console.warn('Speech recognition not supported, cannot start race voice')
    return
  }

  if (!voiceEnabled.value) {
    showFeedbackMessage('error', '音声認識無効', '設定で音声認識を有効にしてください。')
    return
  }

  startVoiceRecognition()
}

const processRaceVoiceInput = (transcript) => {
  if (transcript === nextFuelWord.value) {
    // Successful refuel
    const station = fuelStations.value.find(s => s.word === transcript)
    if (station && !station.used) {
      station.used = true
      wordsRead.value++
      fuelLevel.value = Math.min(100, fuelLevel.value + 20)
      playerProgress.value = Math.min(100, playerProgress.value + 12.5)

      // Calculate speed
      playerSpeed.value = Math.round(wordsRead.value * 60 / raceTime.value)

      setNextFuelWord()

      if (playerProgress.value >= 100) {
        finishRace('player')
      }
    }
  } else {
    // Wrong word - fuel penalty
    fuelLevel.value = Math.max(0, fuelLevel.value - 10)
    showFeedbackMessage('error', 'Wrong Fuel', `Need "${nextFuelWord.value}", not "${transcript}".`)
  }
}

const startRaceTimer = () => {
  const raceInterval = setInterval(() => {
    if (currentMode.value !== 'race' || raceFinished.value) {
      clearInterval(raceInterval)
      return
    }

    raceTime.value++

    // AI progress simulation
    const aiSpeed = 0.3 + Math.random() * 0.2 // Slightly slower than optimal
    aiProgress.value = Math.min(100, aiProgress.value + aiSpeed)

    // Fuel consumption
    if (fuelLevel.value > 0) {
      fuelLevel.value = Math.max(0, fuelLevel.value - 0.5)
    }

    // Check if AI wins
    if (aiProgress.value >= 100) {
      finishRace('ai')
    }

    // Check if player runs out of fuel
    if (fuelLevel.value <= 0 && playerProgress.value < 100) {
      finishRace('ai')
    }
  }, 1000)
}

const finishRace = (winner) => {
  raceFinished.value = true
  raceWinner.value = winner
  finalTime.value = raceTime.value
  averageWPM.value = Math.round(wordsRead.value * 60 / raceTime.value)

  if (winner === 'player') {
    score.value += 500 + Math.max(0, (60 - raceTime.value) * 10)
    showFeedbackMessage('success', 'Victory!', 'You won the galactic race!')
  } else {
    showFeedbackMessage('error', 'Race Lost', 'The AI reached the finish line first!')
  }
}

// =================
// HELPER METHODS
// =================

const isCorrectFamily = (word) => {
  return wordFamilies[currentPattern.value].correct.includes(word)
}


const nextSystem = () => {
  if (randomPatternMode.value) {
    // Random pattern selection
    const uncompletedPatterns = availablePatterns.value.filter(pattern => pattern !== currentPattern.value)

    if (uncompletedPatterns.length === 0) {
      // All patterns completed, reset and shuffle
      availablePatterns.value = [...allPatterns].sort(() => Math.random() - 0.5)
      console.log('All patterns completed! Starting new randomized cycle:', availablePatterns.value)
    }

    // Select random pattern from available ones
    const randomPattern = uncompletedPatterns.length > 0
      ? uncompletedPatterns[Math.floor(Math.random() * uncompletedPatterns.length)]
      : availablePatterns.value[0]

    currentPattern.value = randomPattern
    console.log('Random pattern selected:', randomPattern)
  } else {
    // Sequential pattern selection (original behavior)
    const currentIndex = allPatterns.indexOf(currentPattern.value)
    const nextIndex = (currentIndex + 1) % allPatterns.length
    currentPattern.value = allPatterns[nextIndex]
    console.log('Sequential pattern selected:', currentPattern.value)
  }

  initializeStellarGarden()
}

const gameOver = () => {
  showFeedbackMessage('error', 'Mission Failed', 'Energy depleted! Returning to base...')
  setTimeout(() => {
    returnToHub()
  }, 3000)
}

// =================
// FEEDBACK AND UI
// =================

const showFeedbackMessage = (type, title, message, action = '') => {
  feedbackType.value = type
  feedbackTitle.value = title
  feedbackMessage.value = message
  feedbackAction.value = action
  showFeedback.value = true
}

const closeFeedback = async () => {
  if (feedbackAction.value === 'microphone') {
    // マイク許可エラーの場合、続けるボタンで再度許可を要求
    showFeedback.value = false
    feedbackAction.value = ''

    try {
      const accessGranted = await requestMicrophoneAccess()
      if (accessGranted) {
        showFeedbackMessage('success', '🎉 マイクアクセス許可完了', 'マイクが正常に設定されました。音声認識をお試しください。')
      }
    } catch (error) {
      console.error('Error in closeFeedback while requesting microphone access:', error)
      // requestMicrophoneAccess already handles showing error messages
    }
  } else {
    showFeedback.value = false
    feedbackAction.value = ''
  }
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const closeSettings = () => {
  showSettings.value = false
}

const speakWord = (word) => {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.volume = 0.7
      window.speechSynthesis.speak(utterance)
    }
  } catch (error) {
    console.error('Error speaking word:', error)
  }
}

const raceAgain = () => {
  initializeGalacticRace()
  raceFinished.value = false
  raceWinner.value = null
}

// =================
// AUDIO METHODS
// =================

const playSuccessSound = () => {
  // This would play a success sound effect
  console.log('Playing success sound')
}

// =================
// NAVIGATION
// =================

const goBack = () => {
  router.push('/platforms/vocabulary-world')
}

// =================
// LIFECYCLE
// =================

// =================
// BROWSER COMPATIBILITY CHECK
// =================
const checkBrowserCompatibility = () => {
  console.log('Checking browser compatibility...')

  // Check if MediaDevices API is supported
  const hasMediaDevices = !!(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

  // Check if Speech Recognition is supported
  const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  console.log('MediaDevices API supported:', hasMediaDevices)
  console.log('Speech Recognition supported:', hasSpeechRecognition)

  if (!hasMediaDevices || !hasSpeechRecognition) {
    speechSupported.value = false
    voiceStatusText.value = '音声認識未対応（クリックモードをご利用ください）'
    console.warn('Browser does not support required APIs, falling back to click mode')
    return false
  }

  return true
}

onMounted(async () => {
  console.log('Initializing 音韻パターン学習...')

  // Check browser compatibility first
  const isCompatible = checkBrowserCompatibility()

  if (isCompatible) {
    // Check microphone permissions
    await checkMicrophonePermission()

    // Initialize speech recognition
    initializeSpeechRecognition()
  }

  // Start with level selection screen (hub)
  currentMode.value = null
  currentScreen.value = 'hub'

  // Add watchers for debugging
  watch(availableWords, (newWords) => {
    console.log('Available words changed to:', newWords)
  }, { immediate: true })

  watch(currentTargetWord, (newTarget) => {
    console.log('Target word changed to:', newTarget)
  }, { immediate: true })

  // Don't initialize garden immediately - wait for level selection

  console.log('音韻パターン学習 initialized')
  console.log('Current mode:', currentMode.value)
  console.log('Current screen:', currentScreen.value)
})

onUnmounted(() => {
  console.log('Cleaning up 音韻パターン学習...')

  // Stop any ongoing recording
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop()
  }

  // Clean up audio URLs to prevent memory leaks
  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
    recordedAudioUrl.value = null
  }

  // Stop speech recognition
  if (recognition && isListening.value) {
    recognition.stop()
  }
})

// Voice Recognition Cleanup
const stopVoiceRecognition = () => {
  try {
    if (recognition && isListening.value) {
      console.log('Stopping voice recognition...')
      recognition.stop()
    }
    isListening.value = false
  } catch (error) {
    console.error('Error stopping voice recognition:', error)
    isListening.value = false
  }
}

const resetVoiceRecognition = () => {
  stopVoiceRecognition()
  recognitionSuccess.value = false
  voiceStatusText.value = speechSupported.value ? 'クリックして音声認識を開始' : '音声認識未対応'
}

const toggleVoice = () => {
  voiceEnabled.value = !voiceEnabled.value

  if (!voiceEnabled.value) {
    stopVoiceRecognition()
    voiceStatusText.value = '音声認識が無効化されています'
  } else {
    voiceStatusText.value = speechSupported.value ? 'クリックして音声認識を開始' : '音声認識未対応'
  }

  console.log('Voice recognition toggled:', voiceEnabled.value)
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  console.log('Sound toggled:', soundEnabled.value)
}

onUnmounted(() => {
  stopVoiceRecognition()
  if (recognition) {
    recognition = null
  }
})
</script>

<style scoped>
/* ===========================================
   音韻パターン学習 Styles
   Theme: Space/Universe - Unified with MovWISE
   ========================================== */

/* CSS Variables for Space Theme */
.word-family-galaxy {
  --space-black: #0A0A1A;
  --nebula-purple: #6366F1;
  --star-gold: #FBBF24;
  --planet-blue: #3B82F6;
  --energy-green: #10B981;
  --moon-silver: #E5E7EB;
  --cosmic-red: #EF4444;
  --deep-space: #0F172A;
  --starlight: #F8FAFC;
}

/* Main Container */
.word-family-galaxy {
  min-height: 100vh;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: var(--starlight);
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Galaxy Background */
.galaxy-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, var(--deep-space) 0%, var(--space-black) 100%);
  z-index: 1;
}

/* Animated Stars */
.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.stars-layer-1 {
  background-image:
    radial-gradient(2px 2px at 20px 30px, var(--starlight), transparent),
    radial-gradient(2px 2px at 40px 70px, var(--star-gold), transparent),
    radial-gradient(1px 1px at 90px 40px, var(--starlight), transparent),
    radial-gradient(1px 1px at 130px 80px, var(--star-gold), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 4s linear infinite;
}

.stars-layer-2 {
  background-image:
    radial-gradient(1px 1px at 40px 60px, var(--planet-blue), transparent),
    radial-gradient(1px 1px at 80px 10px, var(--starlight), transparent),
    radial-gradient(1px 1px at 120px 50px, var(--star-gold), transparent);
  background-repeat: repeat;
  background-size: 220px 120px;
  animation: twinkle 6s linear infinite reverse;
}

.stars-layer-3 {
  background-image:
    radial-gradient(1px 1px at 60px 20px, var(--nebula-purple), transparent),
    radial-gradient(1px 1px at 100px 90px, var(--starlight), transparent);
  background-repeat: repeat;
  background-size: 180px 90px;
  animation: twinkle 8s linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ===========================================
   GALAXY HUB STYLES
   ========================================== */

.galaxy-hub {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  padding: 2rem;
}

.central-hub {
  max-width: 1200px;
  margin: 0 auto;
}

.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.space-nav-button {
  background: linear-gradient(135deg, var(--nebula-purple), var(--planet-blue));
  color: var(--starlight);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.space-nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.galaxy-title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  background: linear-gradient(45deg, var(--star-gold), var(--starlight), var(--star-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.captain-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.captain-rank {
  font-weight: bold;
  color: var(--star-gold);
}

.current-mission {
  color: var(--moon-silver);
  font-size: 0.9rem;
}



/* Game Mode Selection */
.game-modes {
  margin-bottom: 1.5rem;
  padding: 1.2rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.game-modes h2 {
  text-align: center;
  color: var(--energy-green);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.level-card {
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.level-card:hover {
  transform: translateY(-5px);
  border-color: var(--energy-green);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.level-card.beginner {
  border-color: rgba(34, 197, 94, 0.5);
}

.level-card.beginner:hover {
  border-color: #22c55e;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
}

.level-card.intermediate {
  border-color: rgba(251, 191, 36, 0.5);
}

.level-card.intermediate:hover {
  border-color: #fbbf24;
  box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
}

.level-card.advanced {
  border-color: rgba(239, 68, 68, 0.5);
}

.level-card.advanced:hover {
  border-color: #ef4444;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
}

.level-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.level-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.level-details span {
  color: var(--moon-silver);
  font-size: 0.85rem;
}

.mode-card {
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-5px);
  border-color: var(--energy-green);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent);
  transition: left 0.5s;
}

.mode-card:hover::before {
  left: 100%;
}

.mode-card h3 {
  color: var(--starlight);
  margin-bottom: 0.6rem;
  font-size: 1rem;
  font-weight: 600;
}

.mode-card p {
  color: var(--moon-silver);
  margin-bottom: 0.8rem;
  line-height: 1.4;
  font-size: 0.8rem;
}

.mode-difficulty {
  background: rgba(16, 185, 129, 0.2);
  color: var(--energy-green);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  display: inline-block;
}

/* Progress Dashboard */
.progress-dashboard {
  padding: 1.2rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 15px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat-item {
  background: rgba(30, 41, 59, 0.8);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.4rem;
}

.stat-label {
  display: block;
  color: var(--moon-silver);
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.stat-value {
  display: block;
  color: var(--star-gold);
  font-size: 1.4rem;
  font-weight: bold;
}

/* ===========================================
   GAME MODE SPECIFIC STYLES
   ========================================== */

/* Common Game Header */
.game-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
}

.mission-info h1 {
  font-size: 1.4rem;
  margin: 0 0 0.3rem 0;
  color: var(--star-gold);
}

.mission-info h2 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--moon-silver);
}

.game-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  background: rgba(30, 41, 59, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

/* ===========================================
   MODE 1: STELLAR GARDEN
   ========================================== */

.stellar-garden {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.garden-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 120px);
}

/* Planet System Display */
.planet-system {
  position: relative;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.central-planet {
  position: relative;
  width: 120px;
  height: 120px;
  z-index: 3;
}

.planet-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, var(--planet-blue), var(--nebula-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--starlight);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  animation: float 4s ease-in-out infinite;
}

.planet-core[data-pattern="at"] {
  background: radial-gradient(circle at 30% 30%, #FF6B6B, #FF8E8E);
  box-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
}

.planet-atmosphere {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, transparent 60%, rgba(59, 130, 246, 0.2) 100%);
  animation: rotate 20s linear infinite;
}

/* Star Orbits */
.star-orbits {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.star-in-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  animation: orbit 15s linear infinite;
  z-index: 4;
}

.star-glow {
  font-size: 2rem;
  text-shadow: 0 0 15px var(--star-gold);
  animation: star-twinkle 2s ease-in-out infinite;
}

.star-label {
  background: rgba(0, 0, 0, 0.8);
  color: var(--star-gold);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  border: 1px solid var(--star-gold);
}

.star-audio {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--energy-green);
  border: none;
  color: white;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.star-in-orbit:hover .star-audio {
  opacity: 1;
}

@keyframes orbit {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(120px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(120px) rotate(-360deg); }
}

@keyframes star-twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* Orbit Lines */
.orbit-lines {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.orbit-line {
  position: absolute;
  border: 1px dashed rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.orbit-1 {
  width: 240px;
  height: 240px;
}

.orbit-2 {
  width: 320px;
  height: 320px;
}

.orbit-3 {
  width: 400px;
  height: 400px;
}

/* Cultivation Panel */
.cultivation-panel {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  border: 2px solid rgba(16, 185, 129, 0.4);
  backdrop-filter: blur(20px);
  height: fit-content;
  position: relative;
  z-index: 20;
}

.current-challenge h3 {
  color: var(--energy-green);
  margin-bottom: 1rem;
  text-align: center;
}

.mission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mission-header h3 {
  margin: 0;
  flex-shrink: 0;
}

.inline-instruction {
  color: var(--moon-silver);
  font-size: 0.95rem;
  font-weight: 500;
  background: rgba(251, 191, 36, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

/* Mobile responsive for mission header */
@media (max-width: 768px) {
  .mission-header {
    flex-direction: column;
    text-align: center;
  }

  .inline-instruction {
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
  }
}

.target-word-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.word-capsule {
  background: linear-gradient(135deg, var(--nebula-purple), var(--planet-blue));
  color: var(--starlight);
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  border: 2px solid rgba(251, 191, 36, 0.5);
  display: inline-block;
  transition: all 0.3s ease;
}

.word-capsule.listening {
  animation: pulse 1s ease-in-out infinite;
  border-color: var(--energy-green);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.word-hint {
  color: var(--moon-silver);
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.voice-button {
  background: linear-gradient(135deg, var(--energy-green), #059669);
  color: var(--starlight);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.voice-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.voice-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-button.listening {
  background: linear-gradient(135deg, var(--cosmic-red), #DC2626);
  animation: pulse 1s ease-in-out infinite;
}

.voice-button.success {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
}

.voice-icon {
  font-size: 1.3rem;
}

.click-mode-indicator {
  background: linear-gradient(135deg, var(--nebula-blue), #3B82F6);
  color: var(--starlight);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  opacity: 0.8;
}

.click-icon {
  font-size: 1.4rem;
}

.click-text {
  font-size: 1rem;
}

.skip-button {
  background: rgba(239, 68, 68, 0.8);
  color: var(--starlight);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-button:hover {
  background: rgba(239, 68, 68, 1);
}

/* Mission Complete */
.mission-complete {
  text-align: center;
  padding: 2rem;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: celebration 1s ease-in-out;
}

@keyframes celebration {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.mission-complete h3 {
  color: var(--star-gold);
  margin-bottom: 1rem;
}

.next-system-button {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.next-system-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}

/* Word Capsules Grid */
.word-capsules {
  margin-top: 2rem;
}

.word-capsules h4 {
  color: var(--nebula-purple);
  margin-bottom: 1rem;
  text-align: center;
}

.capsule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.word-capsules .word-capsule {
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.4);
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 25;
}

.word-capsules .word-capsule:hover:not(.used) {
  transform: translateY(-2px);
  border-color: var(--star-gold);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.word-capsules .word-capsule.correct-family {
  border-color: var(--energy-green);
  background: rgba(16, 185, 129, 0.1);
}

.word-capsules .word-capsule.used {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.capsule-word {
  font-weight: bold;
}

.capsule-status {
  font-size: 0.8rem;
}

.audio-icon {
  margin-left: 0.5rem;
  opacity: 0.7;
  font-size: 0.9rem;
}

.word-capsule:hover .audio-icon {
  opacity: 1;
}

.game-instructions {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.game-instructions p {
  margin: 0.5rem 0;
}

.audio-play {
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 3px;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  opacity: 0.7;
}

.audio-play:hover {
  background: rgba(59, 130, 246, 0.2);
  opacity: 1;
}

.game-progress {
  margin-top: 1.5rem;
}

.progress-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  padding: 0.8rem;
  min-width: 80px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--moon-silver);
  margin-bottom: 0.3rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--star-gold);
}

.no-words-help {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  margin: 1rem 0;
}

.next-pattern-btn {
  background: linear-gradient(135deg, var(--energy-green), #059669);
  color: var(--starlight);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.next-pattern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.word-capsule.clickable {
  transform: scale(1);
  transition: all 0.3s ease;
}

.word-capsule.clickable:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.mystery-capsule {
  position: relative;
  background: linear-gradient(135deg, #2D3748, #4A5568) !important;
  border: 2px solid #718096 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 120px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.mystery-capsule:hover:not(.used) {
  background: linear-gradient(135deg, #4A5568, #2D3748) !important;
  border-color: var(--star-gold) !important;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.capsule-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
}

.capsule-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--star-gold);
  margin-bottom: 0.5rem;
}

.mystery-indicator {
  font-size: 1.2rem;
  color: #A0AEC0;
}

.capsule-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.audio-button, .select-button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.audio-button {
  background: linear-gradient(135deg, var(--energy-green), #059669);
  color: white;
  min-width: 40px;
}

.audio-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
}

.select-button {
  background: linear-gradient(135deg, var(--star-gold), #D97706);
  color: white;
  font-weight: 600;
}

.select-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(251, 191, 36, 0.4);
}

.select-button:disabled {
  background: #4A5568;
  color: #A0AEC0;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Voice Status */
.voice-status {
  margin-top: 2rem;
  text-align: center;
}

.voice-indicator {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.voice-wave {
  width: 4px;
  height: 20px;
  background: var(--moon-silver);
  border-radius: 2px;
  animation: voice-idle 2s ease-in-out infinite;
}

.voice-indicator.active .voice-wave {
  background: var(--energy-green);
  animation: voice-active 0.3s ease-in-out infinite alternate;
}

.voice-wave:nth-child(2) {
  animation-delay: 0.1s;
}

.voice-wave:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes voice-idle {
  0%, 100% { height: 20px; }
  50% { height: 10px; }
}

@keyframes voice-active {
  0% { height: 10px; }
  100% { height: 30px; }
}

.voice-help {
  color: var(--moon-silver);
  font-size: 0.9rem;
}

.voice-not-supported {
  text-align: center;
  color: var(--cosmic-red);
  margin-top: 2rem;
}

/* ===========================================
   MODE 2: CONSTELLATION RUSH
   ========================================== */

.constellation-rush {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.rush-main {
  position: relative;
  padding: 2rem;
  min-height: calc(100vh - 120px);
}

.floating-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.floating-star {
  position: absolute;
  animation: float-drift 4s ease-in-out infinite;
  cursor: pointer;
  transition: all 0.3s ease;
}

.floating-star.target {
  animation: target-glow 1s ease-in-out infinite alternate;
}

.floating-star.captured {
  animation: capture-burst 0.5s ease-out forwards;
}

@keyframes float-drift {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes target-glow {
  0% { transform: scale(1); filter: brightness(1); }
  100% { transform: scale(1.2); filter: brightness(1.5); }
}

@keyframes capture-burst {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}

.star-body {
  font-size: 2rem;
  text-shadow: 0 0 10px var(--star-gold);
}

.star-word {
  background: rgba(0, 0, 0, 0.8);
  color: var(--starlight);
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  border: 1px solid var(--star-gold);
}

.rush-target {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  padding: 2rem;
  border-radius: 20px;
  border: 2px solid rgba(16, 185, 129, 0.4);
  backdrop-filter: blur(20px);
  text-align: center;
}

.target-display h3 {
  color: var(--energy-green);
  margin-bottom: 1rem;
}

.target-word {
  font-size: 2rem;
  font-weight: bold;
  color: var(--star-gold);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px var(--star-gold);
}

.rush-voice-button {
  background: linear-gradient(135deg, var(--cosmic-red), #DC2626);
  color: var(--starlight);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.rush-voice-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.rush-voice-button.listening {
  animation: pulse 1s ease-in-out infinite;
  background: linear-gradient(135deg, var(--energy-green), #059669);
}

.combo-display {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  opacity: 0;
  transition: all 0.3s ease;
}

.combo-display.active {
  opacity: 1;
  animation: combo-pop 0.5s ease-out;
}

@keyframes combo-pop {
  0% { transform: translateX(-50%) scale(0.8); }
  50% { transform: translateX(-50%) scale(1.2); }
  100% { transform: translateX(-50%) scale(1); }
}

.combo-text {
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.combo-number {
  font-size: 1.2rem;
}

.speed-meter {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(15, 23, 42, 0.9);
  padding: 1rem;
  border-radius: 15px;
  border: 2px solid rgba(99, 102, 241, 0.4);
  backdrop-filter: blur(20px);
  min-width: 150px;
}

.speed-label {
  color: var(--moon-silver);
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.speed-bar {
  width: 100%;
  height: 8px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.speed-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--energy-green), var(--star-gold), var(--cosmic-red));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.speed-text {
  color: var(--starlight);
  font-weight: bold;
  text-align: center;
  font-size: 0.9rem;
}

/* ===========================================
   MODE 3: LAB STATION
   ========================================== */

.lab-station {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.lab-main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  padding: 2rem;
  min-height: calc(100vh - 120px);
}

.research-station {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(16, 185, 129, 0.4);
  backdrop-filter: blur(20px);
}

.sample-analysis h3 {
  color: var(--energy-green);
  margin-bottom: 1.5rem;
  text-align: center;
}

.current-sample {
  background: rgba(30, 41, 59, 0.8);
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid rgba(99, 102, 241, 0.4);
  margin-bottom: 2rem;
}

.sample-word {
  font-size: 2rem;
  font-weight: bold;
  color: var(--star-gold);
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px var(--star-gold);
}

.sample-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.record-button, .playback-button {
  background: linear-gradient(135deg, var(--cosmic-red), #DC2626);
  color: var(--starlight);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.record-button:hover:not(:disabled), .playback-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.playback-button {
  background: linear-gradient(135deg, var(--planet-blue), var(--nebula-purple));
}

.playback-button:hover:not(:disabled) {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.record-button:disabled, .playback-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.record-button.recording {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  animation: pulse 1s ease-in-out infinite;
}

.recording-unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: #FCA5A5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  text-align: center;
  font-size: 0.9rem;
}

.record-icon {
  font-size: 1.2rem;
}

.waveform-container {
  background: var(--space-black);
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid var(--energy-green);
}

.waveform-canvas {
  width: 100%;
  height: 100px;
  display: block;
}

.analysis-result {
  background: rgba(16, 185, 129, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  border: 2px solid var(--energy-green);
  margin-top: 1rem;
}

.analysis-result h4 {
  color: var(--energy-green);
  margin-bottom: 1rem;
}

.phonetic-breakdown {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.phonetic {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--star-gold);
}

.accuracy {
  color: var(--energy-green);
  font-weight: bold;
}

.pattern-dna {
  margin: 1rem 0;
}

.dna-strand {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dna-base {
  background: linear-gradient(135deg, var(--nebula-purple), var(--planet-blue));
  color: var(--starlight);
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: dna-pulse 2s ease-in-out infinite;
}

.dna-base:nth-child(even) {
  animation-delay: 0.5s;
}

@keyframes dna-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.store-button {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.store-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.pattern-collection {
  margin-top: 2rem;
}

.pattern-collection h3 {
  color: var(--star-gold);
  margin-bottom: 1rem;
  text-align: center;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.8rem;
}

.collection-item {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(99, 102, 241, 0.4);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.collection-item.collected {
  border-color: var(--energy-green);
  background: rgba(16, 185, 129, 0.1);
}

.item-word {
  font-weight: bold;
  color: var(--starlight);
  margin-bottom: 0.5rem;
}

.item-status {
  font-size: 1.2rem;
}

.dna-visualization {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(251, 191, 36, 0.4);
  backdrop-filter: blur(20px);
  height: fit-content;
}

.dna-visualization h3 {
  color: var(--star-gold);
  margin-bottom: 2rem;
  text-align: center;
}

.dna-helix {
  position: relative;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.dna-connection {
  display: flex;
  align-items: center;
  animation: dna-float 3s ease-in-out infinite;
  animation-delay: calc(var(--index) * 0.5s);
}

@keyframes dna-float {
  0%, 100% { transform: translateX(0px); }
  50% { transform: translateX(10px); }
}

.dna-word {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  margin-right: 1rem;
}

.dna-bond {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, var(--star-gold), var(--energy-green));
  position: relative;
}

.dna-bond::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 8px solid var(--energy-green);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

/* ===========================================
   MODE 4: GALACTIC RACE
   ========================================== */

.galactic-race {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.race-main {
  padding: 2rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.race-track {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(59, 130, 246, 0.4);
  backdrop-filter: blur(20px);
  position: relative;
  height: 200px;
  overflow: hidden;
}

.start-line, .finish-line {
  position: absolute;
  top: 1rem;
  font-weight: bold;
  color: var(--star-gold);
  font-size: 1.2rem;
}

.start-line {
  left: 2rem;
}

.finish-line {
  right: 2rem;
}

.player-ship, .ai-ship {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.5s ease;
  text-align: center;
  z-index: 2;
}

.player-ship {
  top: 40%;
}

.ai-ship {
  top: 60%;
}

.ship-body {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: ship-hover 2s ease-in-out infinite;
}

@keyframes ship-hover {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.ship-label {
  font-weight: bold;
  color: var(--starlight);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.progress-text {
  color: var(--star-gold);
  font-size: 0.8rem;
  font-weight: bold;
}

.fuel-station {
  position: absolute;
  top: 30%;
  transform: translateY(-50%);
  text-align: center;
  z-index: 1;
  transition: all 0.3s ease;
}

.fuel-station.used {
  opacity: 0.3;
  transform: translateY(-50%) scale(0.8);
}

.station-word {
  background: rgba(16, 185, 129, 0.8);
  color: var(--starlight);
  padding: 0.5rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.8rem;
  border: 1px solid var(--energy-green);
  animation: fuel-glow 2s ease-in-out infinite;
}

@keyframes fuel-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
}

.race-controls {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.next-fuel {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(16, 185, 129, 0.4);
  backdrop-filter: blur(20px);
  text-align: center;
}

.next-fuel h3 {
  color: var(--energy-green);
  margin-bottom: 1rem;
}

.fuel-word {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--star-gold);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 15px var(--star-gold);
}

.race-voice-button {
  background: linear-gradient(135deg, var(--cosmic-red), #DC2626);
  color: var(--starlight);
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.race-voice-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.race-voice-button.listening {
  animation: pulse 1s ease-in-out infinite;
  background: linear-gradient(135deg, var(--energy-green), #059669);
}

.fuel-gauge {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(251, 191, 36, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.gauge-label {
  color: var(--star-gold);
  font-weight: bold;
  font-size: 1.1rem;
}

.gauge-bar {
  width: 40px;
  height: 200px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--star-gold);
}

.fuel-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(0deg, var(--cosmic-red), var(--star-gold), var(--energy-green));
  border-radius: 0 0 18px 18px;
  transition: height 0.5s ease;
}

.gauge-text {
  color: var(--starlight);
  font-weight: bold;
  font-size: 1.1rem;
}

.race-results {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.results-modal {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 20px;
  padding: 3rem;
  border: 2px solid var(--star-gold);
  backdrop-filter: blur(20px);
  text-align: center;
  max-width: 500px;
  width: 90%;
  animation: modal-appear 0.5s ease-out;
}

@keyframes modal-appear {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.results-modal h2 {
  color: var(--star-gold);
  margin-bottom: 2rem;
  font-size: 2rem;
}

.winner-announcement {
  margin-bottom: 2rem;
}

.winner-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.winner-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--starlight);
}

.race-stats {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  color: var(--starlight);
}

.stat-row:last-child {
  margin-bottom: 0;
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.race-again-button, .hub-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.race-again-button {
  background: linear-gradient(135deg, var(--energy-green), #059669);
  color: var(--starlight);
}

.race-again-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.hub-button {
  background: linear-gradient(135deg, var(--nebula-purple), var(--planet-blue));
  color: var(--starlight);
}

.hub-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

/* ===========================================
   MODAL STYLES
   ========================================== */

.feedback-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.feedback-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  backdrop-filter: blur(20px);
  animation: modal-appear 0.3s ease-out;
}

.feedback-content.success {
  border: 2px solid var(--energy-green);
}

.feedback-content.error {
  border: 2px solid var(--cosmic-red);
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feedback-title {
  color: var(--starlight);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.feedback-content.success .feedback-title {
  color: var(--energy-green);
}

.feedback-content.error .feedback-title {
  color: var(--cosmic-red);
}

.feedback-message {
  color: var(--moon-silver);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  white-space: pre-line;
  text-align: left;
}

.feedback-button {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedback-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.settings-content {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid var(--nebula-purple);
  backdrop-filter: blur(20px);
  max-width: 400px;
  width: 100%;
  animation: modal-appear 0.3s ease-out;
}

.settings-content h3 {
  color: var(--star-gold);
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  color: var(--starlight);
  font-weight: bold;
}

.setting-item button {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(99, 102, 241, 0.4);
  color: var(--moon-silver);
  padding: 0.5rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.setting-item button.active {
  background: linear-gradient(135deg, var(--energy-green), #059669);
  border-color: var(--energy-green);
  color: var(--starlight);
}

.difficulty-select {
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(99, 102, 241, 0.4);
  color: var(--starlight);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.close-settings {
  background: linear-gradient(135deg, var(--star-gold), #F59E0B);
  color: var(--space-black);
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.close-settings:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

/* ===========================================
   RESPONSIVE DESIGN
   ========================================== */

@media (max-width: 1024px) {
  .garden-main, .lab-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .level-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hub-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .galaxy-title {
    font-size: 1.5rem;
  }

  .game-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .game-stats {
    flex-wrap: wrap;
    justify-content: center;
  }

  .level-grid {
    grid-template-columns: 1fr;
  }

  .stats-panel {
    grid-template-columns: 1fr;
  }

  .race-controls {
    grid-template-columns: 1fr;
  }

  .fuel-gauge {
    padding: 1rem;
  }

  .gauge-bar {
    width: 100%;
    height: 40px;
  }

  .fuel-fill {
    width: 100%;
    height: 100%;
    border-radius: 18px;
  }

  .capsule-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .collection-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .central-hub, .garden-main, .lab-main, .race-main {
    padding: 1rem;
  }

  .galaxy-title {
    font-size: 1.3rem;
  }

  .target-word, .fuel-word {
    font-size: 1.8rem;
  }

  .voice-button, .rush-voice-button, .race-voice-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .word-capsule {
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
  }

  .results-modal, .feedback-content, .settings-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}

/* ===========================================
   MODAL TRANSITIONS
   ========================================== */

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* ===========================================
   ACCESSIBILITY & DARK MODE
   ========================================== */

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .word-capsule, .level-card {
    border-width: 3px;
  }

  .voice-button, .rush-voice-button, .race-voice-button {
    border: 2px solid var(--starlight);
  }
}

/* Print Styles */
@media print {
  .word-family-galaxy {
    background: white;
    color: black;
  }

  .feedback-modal, .settings-modal, .voice-status {
    display: none !important;
  }
}
</style>