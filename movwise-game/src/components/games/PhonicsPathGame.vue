<template>
  <div class="phonics-path-game">
    <!-- レベル選択画面 -->
    <div v-if="showLevelSelect" class="level-select-screen">
      <div class="level-select-background">
        <div v-for="n in 50" :key="`star-${n}`" class="floating-star" 
             :style="{ 
               left: Math.random() * 100 + '%', 
               top: Math.random() * 100 + '%',
               animationDelay: Math.random() * 3 + 's',
               animationDuration: (2 + Math.random() * 2) + 's'
             }"></div>
      </div>
      
      <div class="level-select-content">
        <div class="level-select-title">
          <h1 class="rainbow-text">🌟 ジョリーフォニックス・アドベンチャー 🌟</h1>
          <p class="subtitle">グループを選んで宇宙の旅に出発しよう！</p>
        </div>

        <div class="groups-grid">
          <div v-for="group in jollyPhonicsGroups" :key="group.id"
               @click="selectGroup(group)"
               :class="[
                 'group-card',
                 { 'unlocked': group.unlocked, 'locked': !group.unlocked }
               ]">
            <div class="group-header">
              <div class="group-icon">{{ group.icon }}</div>
              <div class="group-title">グループ {{ group.id }}</div>
            </div>
            
            <div class="phonemes-preview">
              <span v-for="phoneme in group.phonemes" :key="phoneme" class="phoneme-badge">
                {{ phoneme }}
              </span>
            </div>
            
            <div class="group-stats">
              <div class="stat">
                <span class="stat-icon">📚</span>
                <span>{{ group.wordCount }}単語</span>
              </div>
              <div class="stat">
                <span class="stat-icon">⭐</span>
                <span>{{ group.difficulty }}</span>
              </div>
            </div>
            
            <div v-if="!group.unlocked" class="lock-overlay">
              <div class="lock-icon">🔒</div>
              <div class="unlock-text">グループ{{ group.id - 1 }}をクリア</div>
            </div>
          </div>
        </div>

        <div class="select-actions">
          <button @click="$emit('close')" class="back-btn magical-btn">
            <span class="btn-icon">🏠</span>
            <span>ホームに戻る</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ゲームメイン画面 -->
    <div v-else class="game-main">
      <!-- ゲームヘッダー -->
      <div class="game-header">
        <div class="player-info">
          <div class="player-avatar animated-avatar">
            <div class="avatar-glow"></div>
            🚀
          </div>
          <div class="player-stats">
            <div class="level">グループ {{ currentGroup }}</div>
            <div class="score">
              <span class="score-icon">💎</span>
              {{ score }}
            </div>
            <div class="lives">
              <span v-for="n in playerLives" :key="n" class="heart">❤️</span>
              <span v-for="n in (3 - playerLives)" :key="`empty-${n}`" class="heart empty">🤍</span>
            </div>
          </div>
        </div>
        
        <div class="game-title">
          <h1 class="rainbow-text">{{ selectedGroupData?.name || 'フォニックス・アドベンチャー' }}</h1>
          <p>{{ selectedGroupData?.description || '正しく発音してゴールを目指そう！' }}</p>
        </div>
        
        <div class="header-actions">
          <button @click="showLevelSelect = true" class="level-btn magical-btn">
            <span class="btn-icon">🔄</span>
            <span>グループ変更</span>
          </button>
          <button @click="$emit('close')" class="close-btn">×</button>
        </div>
      </div>

    <!-- ゲームボード（双六風） -->
    <div class="game-board" ref="gameBoard">
      <!-- 背景の宇宙効果 -->
      <div class="space-background">
        <div v-for="n in 40" :key="`bg-star-${n}`" class="bg-star" 
             :style="{ 
               left: Math.random() * 100 + '%', 
               top: Math.random() * 100 + '%',
               animationDelay: Math.random() * 3 + 's'
             }"></div>
        
        <!-- 流れ星 -->
        <div v-for="n in 3" :key="`meteor-${n}`" class="meteor"
             :style="{
               animationDelay: Math.random() * 10 + 's',
               animationDuration: (3 + Math.random() * 2) + 's'
             }"></div>
      </div>

      <!-- パスの道 -->
      <svg class="game-path" viewBox="0 0 800 600">
        <!-- 背景のグラデーション定義 -->
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
            <stop offset="33%" style="stop-color:#ffd700;stop-opacity:1" />
            <stop offset="66%" style="stop-color:#4ecdc4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#a8e6cf;stop-opacity:1" />
          </linearGradient>
          
          <filter id="stationGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path :d="pathData" class="path-line" stroke="url(#pathGradient)" />
        
        <!-- ステーション（マス目） -->
        <g v-for="(station, index) in stations" :key="station.id">
          <!-- ステーション背景円 -->
          <circle 
            :cx="station.x" 
            :cy="station.y" 
            :r="station.radius + 5"
            :class="['station-bg', station.stationType]"
            :opacity="station.stationType === 'special' ? 0.8 : 0.3"
          />
          
          <!-- メインステーション -->
          <circle 
            :cx="station.x" 
            :cy="station.y" 
            :r="station.radius"
            :class="[
              'station',
              station.stationType,
              { 
                'current': currentStation === index,
                'completed': index < currentStation,
                'locked': index > currentStation && index > currentStation + 1
              }
            ]"
            @click="selectStation(station, index)"
            filter="url(#stationGlow)"
          />
          
          <!-- 特別ステーションのアイコン -->
          <text v-if="station.stationType === 'special'"
            :x="station.x" 
            :y="station.y + 2" 
            class="special-icon"
          >
            {{ station.specialIcon }}
          </text>
          
          <!-- 通常ステーションの文字表示 -->
          <text v-else
            :x="station.x" 
            :y="station.y + 5" 
            class="station-text"
            :class="station.stationType"
          >
            {{ station.word }}
          </text>
          
          <!-- ステーション番号 -->
          <text 
            :x="station.x" 
            :y="station.y - station.radius - 15" 
            class="station-number"
          >
            {{ index + 1 }}
          </text>
          
          <!-- 特別ステーションの説明 -->
          <text v-if="station.stationType === 'special'"
            :x="station.x" 
            :y="station.y + station.radius + 20" 
            class="special-label"
          >
            {{ station.specialName }}
          </text>
        </g>
        
        <!-- プレイヤーの位置 -->
        <g :transform="`translate(${playerPosition.x - 30}, ${playerPosition.y - 30})`">
          <!-- プレイヤーのオーラ -->
          <circle cx="30" cy="30" r="25" class="player-aura" />
          <!-- プレイヤーピース -->
          <circle cx="30" cy="30" r="22" class="player-piece" />
          <!-- プレイヤーのアイコン -->
          <text x="30" y="35" class="player-emoji">🚀</text>
          <!-- 移動エフェクト -->
          <circle v-if="isMoving" cx="30" cy="30" r="35" class="move-effect" />
        </g>
        
        <!-- 完了したパスのキラキラエフェクト -->
        <g v-for="n in Math.min(currentStation * 3, 15)" :key="`sparkle-${n}`">
          <circle 
            :cx="50 + Math.random() * 700" 
            :cy="50 + Math.random() * 500" 
            :r="2 + Math.random() * 3"
            class="sparkle"
            :style="{ animationDelay: Math.random() * 2 + 's' }"
          />
        </g>
      </svg>
    </div>

    <!-- 現在のチャレンジ表示 -->
    <div v-if="currentChallenge" class="challenge-panel">
      <div class="challenge-card">
        <div class="challenge-word">
          <span class="word-display">{{ currentChallenge.word }}</span>
          <span class="word-type">({{ currentChallenge.type }})</span>
        </div>
        
        <div class="pronunciation-guide">
          <div class="phoneme-breakdown">
            <span v-for="(phoneme, i) in currentChallenge.phonemes" 
                  :key="i" 
                  class="phoneme">
              {{ phoneme }}
            </span>
          </div>
        </div>

        <!-- マイクボタン -->
        <div class="speech-controls">
          <button 
            @click="startListening" 
            :disabled="isListening"
            :class="['mic-button', { 'listening': isListening, 'disabled': isListening }]"
          >
            <span class="mic-icon">🎤</span>
            <span class="mic-text">
              {{ isListening ? '聞いています...' : '発音してね！' }}
            </span>
          </button>
          
          <!-- 録音状況表示 -->
          <div v-if="isListening" class="listening-indicator">
            <div class="sound-waves">
              <div class="wave"></div>
              <div class="wave"></div>
              <div class="wave"></div>
            </div>
            <span>{{ listeningTimeLeft }}秒</span>
          </div>
        </div>

        <!-- 結果表示 -->
        <div v-if="lastResult" class="result-display">
          <div :class="['result-badge', lastResult.correct ? 'correct' : 'incorrect']">
            <span class="result-icon">{{ lastResult.correct ? '✅' : '❌' }}</span>
            <span class="result-text">
              {{ lastResult.correct ? 'すばらしい！正解です！' : '惜しい！もう一度チャレンジ！' }}
            </span>
          </div>
          
          <div class="recognition-feedback">
            <div class="comparison-display">
              <div class="target-word">
                <span class="label">正解:</span>
                <span class="word">{{ lastResult.target }}</span>
                <button @click="playTargetWord" class="play-btn" title="正解の発音を聞く">
                  🔊
                </button>
              </div>
              <div class="vs-divider">VS</div>
              <div class="recognized-word">
                <span class="label">あなたの発音:</span>
                <span class="word">{{ lastResult.recognized || '聞き取れませんでした' }}</span>
                <button v-if="lastResult.recognized" @click="playRecognizedWord" class="play-btn" title="認識された発音を聞く">
                  🔊
                </button>
              </div>
            </div>
            
            <div class="accuracy-meter">
              <div class="accuracy-label">正確度:</div>
              <div class="accuracy-bar">
                <div class="accuracy-fill" :style="{ 
                  width: lastResult.accuracy + '%',
                  backgroundColor: getAccuracyColor(lastResult.accuracy)
                }"></div>
              </div>
              <div class="accuracy-text">{{ lastResult.accuracy }}%</div>
            </div>

            <div v-if="lastResult.confidence" class="confidence">
              音声認識信頼度: {{ Math.round(lastResult.confidence * 100) }}%
            </div>

            <div v-if="!lastResult.correct" class="hint-section">
              <div class="hint-title">💡 ヒント:</div>
              <div class="phoneme-hint">
                <span v-for="(phoneme, i) in currentChallenge.phonemes" 
                      :key="i" 
                      class="phoneme-sound"
                      @click="playPhoneme(phoneme)">
                  {{ phoneme }}
                  <span class="sound-icon">🔊</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- スキップボタン -->
        <div class="action-buttons">
          <button @click="skipChallenge" class="skip-btn">スキップ</button>
          <button v-if="lastResult && lastResult.correct" @click="nextStation" class="next-btn">
            次に進む
          </button>
        </div>
      </div>
    </div>

    <!-- 進捗表示 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-text">
        ステーション {{ currentStation + 1 }}/{{ stations.length }} 
        ({{ currentLevel === 1 ? '子音+母音' : '3文字単語' }})
      </div>
    </div>

    <!-- 音声認識エラー表示 -->
    <div v-if="speechError" class="error-message">
      <p>🔊 {{ speechError }}</p>
      <button @click="speechError = ''" class="error-close">OK</button>
    </div>
    </div> <!-- Close game-main div -->
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'PhonicsPathGame',
  emits: ['close', 'complete'],
  props: {
    initialLevel: {
      type: Number,
      default: 1
    }
  },
  setup(props, { emit }) {
    // ゲーム状態
    const currentLevel = ref(props.initialLevel)
    const currentStation = ref(0)
    const currentGroup = ref(1)
    const score = ref(0)
    const playerLives = ref(3)
    const gameBoard = ref(null)
    const showLevelSelect = ref(true)
    const isMoving = ref(false)
    
    // 音声認識
    const isListening = ref(false)
    const listeningTimeLeft = ref(5)
    const speechError = ref('')
    const lastResult = ref(null)
    
    // ゲームデータ
    const currentChallenge = ref(null)
    const speechRecognition = ref(null)
    const listeningTimer = ref(null)

    // ジョリーフォニックス・グループデータ（2-4文字の多様な単語）
    const jollyPhonicsGroups = ref([
      {
        id: 1,
        name: 'グループ1 - s.a.t.i.p.n',
        description: '最初の6つの音で単語を作ろう！',
        icon: '🌟',
        phonemes: ['s', 'a', 't', 'i', 'p', 'n'],
        wordCount: 15,
        difficulty: '⭐',
        unlocked: true,
        words: [
          // 2文字単語
          { word: 'at', phonemes: ['a', 't'], type: 'CV', station: 'normal' },
          { word: 'in', phonemes: ['i', 'n'], type: 'CV', station: 'normal' },
          { word: 'is', phonemes: ['i', 's'], type: 'CV', station: 'special', specialType: 'word-builder' },
          { word: 'it', phonemes: ['i', 't'], type: 'CV', station: 'normal' },
          // 3文字単語
          { word: 'sat', phonemes: ['s', 'a', 't'], type: 'CVC', station: 'normal' },
          { word: 'pat', phonemes: ['p', 'a', 't'], type: 'CVC', station: 'normal' },
          { word: 'tap', phonemes: ['t', 'a', 'p'], type: 'CVC', station: 'normal' },
          { word: 'pit', phonemes: ['p', 'i', 't'], type: 'CVC', station: 'special', specialType: 'sound-match' },
          { word: 'sip', phonemes: ['s', 'i', 'p'], type: 'CVC', station: 'normal' },
          { word: 'tip', phonemes: ['t', 'i', 'p'], type: 'CVC', station: 'normal' },
          { word: 'nap', phonemes: ['n', 'a', 'p'], type: 'CVC', station: 'normal' },
          { word: 'pin', phonemes: ['p', 'i', 'n'], type: 'CVC', station: 'normal' },
          { word: 'tin', phonemes: ['t', 'i', 'n'], type: 'CVC', station: 'special', specialType: 'rhythm-game' },
          { word: 'sit', phonemes: ['s', 'i', 't'], type: 'CVC', station: 'normal' },
          // 4文字単語
          { word: 'spin', phonemes: ['s', 'p', 'i', 'n'], type: 'CCVC', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 2,
        name: 'グループ2 - c.k.e.h.r.m.d',
        description: 'グループ1の音に新しい音を加えよう！',
        icon: '🚀',
        phonemes: ['c', 'k', 'e', 'h', 'r', 'm', 'd'],
        wordCount: 16,
        difficulty: '⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語 (グループ1+2の音を使用)
          { word: 'me', phonemes: ['m', 'e'], type: 'CV', station: 'normal' },
          { word: 'he', phonemes: ['h', 'e'], type: 'CV', station: 'normal' },
          // 3文字単語
          { word: 'cat', phonemes: ['c', 'a', 't'], type: 'CVC', station: 'normal' },
          { word: 'rat', phonemes: ['r', 'a', 't'], type: 'CVC', station: 'normal' },
          { word: 'hat', phonemes: ['h', 'a', 't'], type: 'CVC', station: 'special', specialType: 'word-builder' },
          { word: 'mat', phonemes: ['m', 'a', 't'], type: 'CVC', station: 'normal' },
          { word: 'red', phonemes: ['r', 'e', 'd'], type: 'CVC', station: 'normal' },
          { word: 'hen', phonemes: ['h', 'e', 'n'], type: 'CVC', station: 'normal' },
          { word: 'met', phonemes: ['m', 'e', 't'], type: 'CVC', station: 'normal' },
          { word: 'den', phonemes: ['d', 'e', 'n'], type: 'CVC', station: 'special', specialType: 'sound-match' },
          { word: 'pet', phonemes: ['p', 'e', 't'], type: 'CVC', station: 'normal' },
          { word: 'net', phonemes: ['n', 'e', 't'], type: 'CVC', station: 'normal' },
          { word: 'hit', phonemes: ['h', 'i', 't'], type: 'CVC', station: 'normal' },
          { word: 'him', phonemes: ['h', 'i', 'm'], type: 'CVC', station: 'special', specialType: 'rhythm-game' },
          // 4文字単語
          { word: 'them', phonemes: ['th', 'e', 'm'], type: 'CVC+', station: 'normal' },
          { word: 'camp', phonemes: ['c', 'a', 'm', 'p'], type: 'CVCC', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 3,
        name: 'グループ3 - g.o.u.l.f.b',
        description: 'さらに多くの音で語彙を広げよう！',
        icon: '🎭',
        phonemes: ['g', 'o', 'u', 'l', 'f', 'b'],
        wordCount: 16,
        difficulty: '⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語
          { word: 'go', phonemes: ['g', 'o'], type: 'CV', station: 'normal' },
          { word: 'of', phonemes: ['o', 'f'], type: 'CV', station: 'normal' },
          // 3文字単語
          { word: 'dog', phonemes: ['d', 'o', 'g'], type: 'CVC', station: 'normal' },
          { word: 'log', phonemes: ['l', 'o', 'g'], type: 'CVC', station: 'normal' },
          { word: 'fog', phonemes: ['f', 'o', 'g'], type: 'CVC', station: 'normal' },
          { word: 'big', phonemes: ['b', 'i', 'g'], type: 'CVC', station: 'special', specialType: 'word-builder' },
          { word: 'bag', phonemes: ['b', 'a', 'g'], type: 'CVC', station: 'normal' },
          { word: 'bug', phonemes: ['b', 'u', 'g'], type: 'CVC', station: 'normal' },
          { word: 'fun', phonemes: ['f', 'u', 'n'], type: 'CVC', station: 'normal' },
          { word: 'sun', phonemes: ['s', 'u', 'n'], type: 'CVC', station: 'normal' },
          { word: 'but', phonemes: ['b', 'u', 't'], type: 'CVC', station: 'special', specialType: 'sound-match' },
          { word: 'cut', phonemes: ['c', 'u', 't'], type: 'CVC', station: 'normal' },
          { word: 'got', phonemes: ['g', 'o', 't'], type: 'CVC', station: 'normal' },
          { word: 'lot', phonemes: ['l', 'o', 't'], type: 'CVC', station: 'special', specialType: 'rhythm-game' },
          // 4文字単語
          { word: 'flag', phonemes: ['f', 'l', 'a', 'g'], type: 'CCVC', station: 'normal' },
          { word: 'golf', phonemes: ['g', 'o', 'l', 'f'], type: 'CVCC', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 4,
        name: 'グループ4 - ai.j.oa.ie.ee.or',
        description: '二文字音と新しい音に挑戦！',
        icon: '🔍',
        phonemes: ['ai', 'j', 'oa', 'ie', 'ee', 'or'],
        wordCount: 14,
        difficulty: '⭐⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語
          { word: 'or', phonemes: ['or'], type: 'V+', station: 'normal' },
          // 3文字単語
          { word: 'jam', phonemes: ['j', 'a', 'm'], type: 'CVC', station: 'normal' },
          { word: 'jog', phonemes: ['j', 'o', 'g'], type: 'CVC', station: 'normal' },
          { word: 'jet', phonemes: ['j', 'e', 't'], type: 'CVC', station: 'special', specialType: 'word-builder' },
          { word: 'see', phonemes: ['s', 'ee'], type: 'CV+', station: 'normal' },
          { word: 'bee', phonemes: ['b', 'ee'], type: 'CV+', station: 'normal' },
          { word: 'for', phonemes: ['f', 'or'], type: 'CV+', station: 'normal' },
          // 4文字単語
          { word: 'rain', phonemes: ['r', 'ai', 'n'], type: 'CVC+', station: 'normal' },
          { word: 'pain', phonemes: ['p', 'ai', 'n'], type: 'CVC+', station: 'normal' },
          { word: 'tail', phonemes: ['t', 'ai', 'l'], type: 'CVC+', station: 'special', specialType: 'sound-match' },
          { word: 'boat', phonemes: ['b', 'oa', 't'], type: 'CVC+', station: 'normal' },
          { word: 'coat', phonemes: ['c', 'oa', 't'], type: 'CVC+', station: 'normal' },
          { word: 'feet', phonemes: ['f', 'ee', 't'], type: 'CVC+', station: 'special', specialType: 'rhythm-game' },
          { word: 'meet', phonemes: ['m', 'ee', 't'], type: 'CVC+', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 5,
        name: 'グループ5 - z.w.ng.v.oo(短).oo(長)',
        description: '難しい音の組み合わせをマスター！',
        icon: '🎯',
        phonemes: ['z', 'w', 'ng', 'v', 'oo', 'oo'],
        wordCount: 14,
        difficulty: '⭐⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語
          { word: 'we', phonemes: ['w', 'e'], type: 'CV', station: 'normal' },
          // 3文字単語
          { word: 'zip', phonemes: ['z', 'i', 'p'], type: 'CVC', station: 'normal' },
          { word: 'win', phonemes: ['w', 'i', 'n'], type: 'CVC', station: 'normal' },
          { word: 'wig', phonemes: ['w', 'i', 'g'], type: 'CVC', station: 'special', specialType: 'word-builder' },
          { word: 'van', phonemes: ['v', 'a', 'n'], type: 'CVC', station: 'normal' },
          { word: 'vet', phonemes: ['v', 'e', 't'], type: 'CVC', station: 'normal' },
          { word: 'zoo', phonemes: ['z', 'oo'], type: 'CV+', station: 'normal' },
          { word: 'too', phonemes: ['t', 'oo'], type: 'CV+', station: 'special', specialType: 'sound-match' },
          // 4文字単語
          { word: 'book', phonemes: ['b', 'oo', 'k'], type: 'CVC+', station: 'normal' },
          { word: 'look', phonemes: ['l', 'oo', 'k'], type: 'CVC+', station: 'normal' },
          { word: 'moon', phonemes: ['m', 'oo', 'n'], type: 'CVC+', station: 'special', specialType: 'rhythm-game' },
          { word: 'ring', phonemes: ['r', 'i', 'ng'], type: 'CVC+', station: 'normal' },
          { word: 'long', phonemes: ['l', 'o', 'ng'], type: 'CVC+', station: 'normal' },
          { word: 'wing', phonemes: ['w', 'i', 'ng'], type: 'CVC+', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 6,
        name: 'グループ6 - y.x.ch.sh.th(無).th(有)',
        description: '複雑な音のパターンに挑戦！',
        icon: '🌈',
        phonemes: ['y', 'x', 'ch', 'sh', 'th', 'th'],
        wordCount: 14,
        difficulty: '⭐⭐⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語
          { word: 'my', phonemes: ['m', 'y'], type: 'CV', station: 'normal' },
          // 3文字単語
          { word: 'yes', phonemes: ['y', 'e', 's'], type: 'CVC', station: 'normal' },
          { word: 'yet', phonemes: ['y', 'e', 't'], type: 'CVC', station: 'normal' },
          { word: 'mix', phonemes: ['m', 'i', 'x'], type: 'CVC', station: 'special', specialType: 'word-builder' },
          { word: 'fox', phonemes: ['f', 'o', 'x'], type: 'CVC', station: 'normal' },
          { word: 'six', phonemes: ['s', 'i', 'x'], type: 'CVC', station: 'normal' },
          // 4文字単語
          { word: 'shop', phonemes: ['sh', 'o', 'p'], type: 'CVC+', station: 'normal' },
          { word: 'ship', phonemes: ['sh', 'i', 'p'], type: 'CVC+', station: 'normal' },
          { word: 'chip', phonemes: ['ch', 'i', 'p'], type: 'CVC+', station: 'special', specialType: 'sound-match' },
          { word: 'chat', phonemes: ['ch', 'a', 't'], type: 'CVC+', station: 'normal' },
          { word: 'thin', phonemes: ['th', 'i', 'n'], type: 'CVC+', station: 'normal' },
          { word: 'that', phonemes: ['th', 'a', 't'], type: 'CVC+', station: 'special', specialType: 'rhythm-game' },
          { word: 'they', phonemes: ['th', 'e', 'y'], type: 'CVC+', station: 'normal' },
          { word: 'much', phonemes: ['m', 'u', 'ch'], type: 'CVC+', station: 'special', specialType: 'bonus-points' }
        ]
      },
      {
        id: 7,
        name: 'グループ7 - qu.ou.oi.ue.er.ar',
        description: '最終チャレンジ！全ての音をマスター！',
        icon: '👑',
        phonemes: ['qu', 'ou', 'oi', 'ue', 'er', 'ar'],
        wordCount: 12,
        difficulty: '⭐⭐⭐⭐⭐',
        unlocked: false,
        words: [
          // 2文字単語
          { word: 'or', phonemes: ['or'], type: 'V+', station: 'normal' },
          // 3文字単語
          { word: 'out', phonemes: ['ou', 't'], type: 'V+C', station: 'special', specialType: 'word-builder' },
          { word: 'oil', phonemes: ['oi', 'l'], type: 'V+C', station: 'normal' },
          { word: 'her', phonemes: ['h', 'er'], type: 'CV+', station: 'normal' },
          { word: 'car', phonemes: ['c', 'ar'], type: 'CV+', station: 'normal' },
          { word: 'our', phonemes: ['ou', 'r'], type: 'V+C', station: 'special', specialType: 'sound-match' },
          // 4文字単語
          { word: 'quit', phonemes: ['qu', 'i', 't'], type: 'CVC+', station: 'normal' },
          { word: 'coin', phonemes: ['c', 'oi', 'n'], type: 'CVC+', station: 'normal' },
          { word: 'blue', phonemes: ['b', 'l', 'ue'], type: 'CCV+', station: 'normal' },
          { word: 'true', phonemes: ['t', 'r', 'ue'], type: 'CCV+', station: 'special', specialType: 'rhythm-game' },
          { word: 'your', phonemes: ['y', 'ou', 'r'], type: 'CV+C', station: 'normal' },
          { word: 'near', phonemes: ['n', 'ear'], type: 'CV+', station: 'special', specialType: 'bonus-points' }
        ]
      }
    ])

    // 選択されたグループデータ
    const selectedGroupData = computed(() => {
      return jollyPhonicsGroups.value.find(g => g.id === currentGroup.value)
    })

    // ステーション生成（特別ステーション含む）
    const stations = computed(() => {
      const selectedGroup = selectedGroupData.value
      if (!selectedGroup) return []
      
      const words = selectedGroup.words
      const stationList = []
      
      // 双六風のパス座標を生成
      const pathPoints = generatePathPoints(words.length)
      
      words.forEach((wordData, index) => {
        const isSpecial = wordData.station === 'special'
        
        stationList.push({
          id: index,
          word: wordData.word,
          phonemes: wordData.phonemes,
          type: wordData.type,
          stationType: wordData.station || 'normal',
          specialType: wordData.specialType || null,
          specialIcon: getSpecialIcon(wordData.specialType),
          specialName: getSpecialName(wordData.specialType),
          x: pathPoints[index].x,
          y: pathPoints[index].y,
          radius: isSpecial ? 30 : 25
        })
      })
      
      return stationList
    })

    // パスデータ生成（SVGパス）
    const pathData = computed(() => {
      if (stations.value.length === 0) return ''
      
      let path = `M ${stations.value[0].x} ${stations.value[0].y}`
      
      for (let i = 1; i < stations.value.length; i++) {
        const station = stations.value[i]
        path += ` L ${station.x} ${station.y}`
      }
      
      return path
    })

    // プレイヤーの現在位置
    const playerPosition = computed(() => {
      if (stations.value.length === 0) return { x: 0, y: 0 }
      return {
        x: stations.value[currentStation.value].x,
        y: stations.value[currentStation.value].y
      }
    })

    // 進捗率
    const progressPercentage = computed(() => {
      if (stations.value.length === 0) return 0
      return (currentStation.value / (stations.value.length - 1)) * 100
    })

    // パス座標生成関数（双六風の蛇行パス）
    const generatePathPoints = (count) => {
      const points = []
      const width = 800
      const height = 600
      const margin = 80
      
      // 蛇行パターンで座標を生成
      const cols = 5 // 横方向のステーション数
      const stepX = (width - margin * 2) / (cols - 1)
      const stepY = (height - margin * 2) / Math.ceil(count / cols)
      
      for (let i = 0; i < count; i++) {
        const row = Math.floor(i / cols)
        const col = i % cols
        
        // 偶数行は左から右、奇数行は右から左
        const actualCol = row % 2 === 0 ? col : cols - 1 - col
        
        points.push({
          x: margin + actualCol * stepX,
          y: margin + row * stepY
        })
      }
      
      return points
    }

    // ステーション選択
    const selectStation = (station, index) => {
      logger.log('Station selected:', index, 'Current:', currentStation.value)
      
      if (index === currentStation.value) {
        // 現在のステーションならチャレンジ開始（すでに表示されていても再表示）
        if (station.stationType === 'special') {
          logger.log('Special station selected:', station.specialType)
          // 特別ステーションの場合、自動で成功
          if (handleSpecialStation(station)) {
            setTimeout(() => {
              nextStation()
            }, 1500)
          }
        } else {
          logger.log('Starting challenge from station click')
          startChallenge(station)
        }
      } else if (index === currentStation.value + 1 && lastResult.value && lastResult.value.correct) {
        // 次のステーションは、現在の問題が正解済みの場合のみ移動可能
        logger.log('Moving to next station via click')
        isMoving.value = true
        setTimeout(() => {
          currentStation.value = index
          isMoving.value = false
          
          if (station.stationType === 'special') {
            if (handleSpecialStation(station)) {
              setTimeout(() => {
                nextStation()
              }, 1500)
            }
          } else {
            startChallenge(station)
          }
        }, 800)
      } else if (index < currentStation.value) {
        // 既にクリアしたステーション
        logger.log('Already cleared station')
      } else {
        // まだ到達できないステーション
        logger.log('Station locked')
      }
    }

    // チャレンジ開始
    const startChallenge = (station) => {
      logger.log('Starting challenge for station:', station)
      currentChallenge.value = {
        word: station.word,
        phonemes: station.phonemes,
        type: station.type
      }
      lastResult.value = null
      speechError.value = ''
      
      // 音声認識の準備状態を確認
      if (!speechRecognition.value) {
        logger.log('Initializing speech recognition for challenge')
        initSpeechRecognition()
      }
    }

    // 音声認識初期化
    const initSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
        speechRecognition.value = new SpeechRecognition()
        
        speechRecognition.value.continuous = false
        speechRecognition.value.interimResults = true // 中間結果も取得
        speechRecognition.value.lang = 'en-US'
        speechRecognition.value.maxAlternatives = 3 // 複数の候補を取得
        
        speechRecognition.value.onstart = () => {
          logger.log('Speech recognition started')
          isListening.value = true
          listeningTimeLeft.value = 5
          startListeningTimer()
        }
        
        speechRecognition.value.onresult = (event) => {
          logger.log('Speech recognition result event:', event)
          
          // 最終結果を優先的に処理
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            
            if (result.isFinal) {
              const transcript = result[0].transcript.toLowerCase().trim()
              const confidence = result[0].confidence || 0.5 // デフォルト値を設定
              
              logger.log('Final result - Recognized:', transcript, 'Confidence:', confidence)
              processSpeechResult(transcript, confidence)
              
              // 認識成功後、自動的に停止
              if (speechRecognition.value && isListening.value) {
                speechRecognition.value.stop()
              }
              break
            } else {
              // 中間結果を表示（デバッグ用）
              logger.log('Interim result:', result[0].transcript)
            }
          }
        }
        
        speechRecognition.value.onnomatch = () => {
          logger.log('No speech was detected')
          speechError.value = '音声が認識できませんでした。もう一度はっきりと発音してください。'
          isListening.value = false
        }
        
        speechRecognition.value.onerror = (event) => {
          logger.error('Speech recognition error:', event.error, event)
          isListening.value = false
          clearInterval(listeningTimer.value) // clearTimeoutではなくclearInterval
          
          const errorMessages = {
            'no-speech': '音声が検出されませんでした。マイクに向かって発音してください',
            'audio-capture': 'マイクが利用できません。ブラウザの設定を確認してください',
            'not-allowed': 'マイクの使用を許可してください。ブラウザの設定から許可できます',
            'network': 'ネットワークエラーが発生しました。インターネット接続を確認してください',
            'aborted': '音声認識が中断されました',
            'service-not-allowed': '音声認識サービスが利用できません'
          }
          
          speechError.value = errorMessages[event.error] || `音声認識エラー: ${event.error}`
          
          // エラー時は自動的にリセット
          setTimeout(() => {
            speechError.value = ''
          }, 5000)
        }
        
        speechRecognition.value.onend = () => {
          logger.log('Speech recognition ended')
          isListening.value = false
          clearInterval(listeningTimer.value)
          listeningTimeLeft.value = 5
        }
        
        logger.log('Speech recognition initialized successfully')
      } else {
        speechError.value = 'お使いのブラウザは音声認識に対応していません。Chrome、Edge、Safariなどをお使いください。'
        logger.error('Speech recognition not supported')
      }
    }

    // 音声認識開始
    const startListening = () => {
      logger.log('startListening called, isListening:', isListening.value)
      
      // 既に聞いている場合は無視
      if (isListening.value) {
        logger.log('Already listening, ignoring')
        return
      }
      
      // 音声認識が初期化されていない場合は初期化
      if (!speechRecognition.value) {
        logger.log('Speech recognition not initialized, initializing...')
        initSpeechRecognition()
        if (!speechRecognition.value) {
          speechError.value = '音声認識の初期化に失敗しました'
          return
        }
      }
      
      speechError.value = ''
      lastResult.value = null
      
      try {
        // マイクの許可を確認
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              logger.log('Microphone permission granted')
              // マイク許可後に音声認識開始
              speechRecognition.value.start()
              logger.log('Speech recognition started successfully')
            })
            .catch((error) => {
              logger.error('Microphone permission denied:', error)
              speechError.value = 'マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。'
              isListening.value = false
            })
        } else {
          // fallback: 直接開始を試みる
          speechRecognition.value.start()
          logger.log('Speech recognition started (fallback)')
        }
      } catch (error) {
        logger.error('Failed to start speech recognition:', error)
        if (error.message && error.message.includes('already started')) {
          // 既に開始されている場合は一度停止してから再開始
          speechRecognition.value.stop()
          setTimeout(() => {
            try {
              speechRecognition.value.start()
              logger.log('Speech recognition restarted')
            } catch (e) {
              logger.error('Failed to restart:', e)
              speechError.value = '音声認識の再開に失敗しました'
            }
          }, 100)
        } else {
          speechError.value = '音声認識を開始できませんでした: ' + error.message
        }
        isListening.value = false
      }
    }

    // リスニングタイマー
    const startListeningTimer = () => {
      // 既存のタイマーをクリア
      if (listeningTimer.value) {
        clearInterval(listeningTimer.value)
      }
      
      listeningTimeLeft.value = 5
      
      listeningTimer.value = setInterval(() => {
        listeningTimeLeft.value--
        logger.log('Listening time left:', listeningTimeLeft.value)
        
        if (listeningTimeLeft.value <= 0) {
          clearInterval(listeningTimer.value)
          if (speechRecognition.value && isListening.value) {
            logger.log('Time up, stopping speech recognition')
            speechRecognition.value.stop()
            
            // タイムアウトメッセージ
            if (!lastResult.value) {
              speechError.value = '時間切れです。もう一度お試しください。'
              setTimeout(() => {
                speechError.value = ''
              }, 3000)
            }
          }
        }
      }, 1000)
    }

    // 音声結果処理（強化版）
    const processSpeechResult = (transcript, confidence) => {
      const targetWord = currentChallenge.value.word.toLowerCase()
      const recognizedWord = transcript.toLowerCase().trim()
      
      // より詳細な正確度計算
      const accuracy = calculateAccuracy(recognizedWord, targetWord)
      const isCorrect = accuracy >= 80 // 80%以上で正解とする

      lastResult.value = {
        recognized: transcript,
        correct: isCorrect,
        confidence: confidence,
        target: targetWord,
        accuracy: accuracy
      }

      if (isCorrect) {
        score.value += Math.round(100 * (accuracy / 100))
        // 正解時の処理は nextStation で行う
      }
    }

    // 正確度計算（レーベンシュタイン距離ベース）
    const calculateAccuracy = (recognized, target) => {
      if (!recognized) return 0
      if (recognized === target) return 100
      
      const maxLength = Math.max(recognized.length, target.length)
      const distance = levenshteinDistance(recognized, target)
      const accuracy = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100))
      
      return accuracy
    }

    // 正確度に応じた色を取得
    const getAccuracyColor = (accuracy) => {
      if (accuracy >= 90) return '#4caf50' // 緑
      if (accuracy >= 70) return '#ffd700' // 黄色
      if (accuracy >= 50) return '#ff9800' // オレンジ
      return '#f44336' // 赤
    }

    // 音声合成用のユーティリティ
    const speak = (text, rate = 0.8, pitch = 1.0) => {
      if ('speechSynthesis' in window) {
        // 既存の音声を停止
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.lang = 'en-US'
        
        speechSynthesis.speak(utterance)
      }
    }

    // 正解単語の発音再生
    const playTargetWord = () => {
      if (lastResult.value && lastResult.value.target) {
        speak(lastResult.value.target, 0.7, 1.1)
      }
    }

    // 認識された単語の発音再生
    const playRecognizedWord = () => {
      if (lastResult.value && lastResult.value.recognized) {
        speak(lastResult.value.recognized, 0.7, 0.9)
      }
    }

    // 個別の音素再生
    const playPhoneme = (phoneme) => {
      // 二文字音素の場合の特別な発音
      const phonemeMap = {
        'ai': 'ay',
        'oa': 'oh',
        'ee': 'eee',
        'or': 'orr',
        'oo': 'ooo',
        'ng': 'ng',
        'ch': 'ch',
        'sh': 'sh',
        'th': 'th',
        'qu': 'kw',
        'ou': 'ow',
        'oi': 'oy',
        'ue': 'ue',
        'er': 'er',
        'ar': 'ar'
      }
      
      const soundToPlay = phonemeMap[phoneme] || phoneme
      speak(soundToPlay, 0.6, 1.2)
    }

    // レーベンシュタイン距離（類似度判定用）
    const levenshteinDistance = (str1, str2) => {
      const matrix = []
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      
      return matrix[str2.length][str1.length]
    }

    // 次のステーションへ
    const nextStation = () => {
      logger.log('Moving to next station from:', currentStation.value)
      
      // 現在のチャレンジをクリア
      currentChallenge.value = null
      lastResult.value = null
      speechError.value = ''
      
      // 次のステーションへ移動
      currentStation.value++
      
      // ゲーム完了チェック
      if (currentStation.value >= stations.value.length) {
        logger.log('Game completed! All stations cleared.')
        
        // グループクリア - 次のグループを解除
        const nextGroupIndex = jollyPhonicsGroups.value.findIndex(g => g.id === currentGroup.value + 1)
        if (nextGroupIndex >= 0) {
          jollyPhonicsGroups.value[nextGroupIndex].unlocked = true
        }
        
        // レベル選択に戻る
        showLevelSelect.value = true
        
        // ゲーム完了通知
        emit('complete', {
          score: score.value,
          group: currentGroup.value,
          nextGroupUnlocked: nextGroupIndex >= 0
        })
      } else {
        // 次のステーションの問題を自動的に開始
        logger.log('Starting next station:', currentStation.value)
        const nextStationData = stations.value[currentStation.value]
        
        if (nextStationData) {
          // アニメーション後に次の問題を表示
          isMoving.value = true
          setTimeout(() => {
            isMoving.value = false
            
            // 特別ステーションか通常ステーションかチェック
            if (nextStationData.stationType === 'special') {
              logger.log('Next station is special:', nextStationData.specialType)
              if (handleSpecialStation(nextStationData)) {
                // 特別ステーションの処理後、さらに次へ
                setTimeout(() => {
                  nextStation()
                }, 1500)
              }
            } else {
              // 通常ステーションの問題を開始
              logger.log('Starting challenge for next station')
              startChallenge(nextStationData)
            }
          }, 800)
        }
      }
    }

    // 特別ステーションアイコン取得
    const getSpecialIcon = (specialType) => {
      const icons = {
        'word-builder': '🏗️',
        'sound-match': '🎵',
        'rhythm-game': '🥁',
        'bonus-points': '💎'
      }
      return icons[specialType] || '⭐'
    }

    // 特別ステーション名取得
    const getSpecialName = (specialType) => {
      const names = {
        'word-builder': '単語工房',
        'sound-match': '音合わせ',
        'rhythm-game': 'リズム',
        'bonus-points': 'ボーナス'
      }
      return names[specialType] || '特別'
    }

    // グループ選択
    const selectGroup = (group) => {
      if (!group.unlocked) return
      
      logger.log('Group selected:', group.id)
      currentGroup.value = group.id
      currentStation.value = 0
      score.value = 0
      playerLives.value = 3
      showLevelSelect.value = false
      currentChallenge.value = null
      lastResult.value = null
      
      // 最初のチャレンジ開始
      setTimeout(() => {
        if (stations.value.length > 0) {
          logger.log('Starting first challenge for group')
          const firstStation = stations.value[0]
          
          if (firstStation.stationType === 'special') {
            // 特別ステーションの場合
            if (handleSpecialStation(firstStation)) {
              setTimeout(() => {
                nextStation()
              }, 1500)
            }
          } else {
            // 通常ステーションの場合
            startChallenge(firstStation)
          }
        }
      }, 500)
    }

    // 特別ステーション処理
    const handleSpecialStation = (station) => {
      switch (station.specialType) {
        case 'word-builder':
          return handleWordBuilder(station)
        case 'sound-match':
          return handleSoundMatch(station)
        case 'rhythm-game':
          return handleRhythmGame(station)
        case 'bonus-points':
          return handleBonusPoints(station)
        default:
          return false
      }
    }

    // 単語工房ミニゲーム
    const handleWordBuilder = (station) => {
      // 文字を組み合わせて単語を作るゲーム
      score.value += 200
      return true
    }

    // 音合わせミニゲーム  
    const handleSoundMatch = (station) => {
      // 音を聞いて正しい文字を選ぶゲーム
      score.value += 150
      return true
    }

    // リズムミニゲーム
    const handleRhythmGame = (station) => {
      // リズムに合わせて発音するゲーム
      score.value += 175
      return true
    }

    // ボーナスポイント
    const handleBonusPoints = (station) => {
      // ボーナスポイント獲得
      score.value += 300
      return true
    }

    // チャレンジスキップ
    const skipChallenge = () => {
      logger.log('Skipping challenge')
      
      if (playerLives.value > 0) {
        playerLives.value--
      }
      
      // ライフがなくなったらゲームオーバー
      if (playerLives.value <= 0) {
        logger.log('Game over - no lives left')
        currentChallenge.value = null
        lastResult.value = null
        showLevelSelect.value = true
      } else {
        // まだライフがある場合は次の問題へ
        logger.log('Moving to next after skip')
        nextStation()
      }
    }

    // 初期化
    onMounted(() => {
      initSpeechRecognition()
      if (stations.value.length > 0) {
        startChallenge(stations.value[0])
      }
    })

    // クリーンアップ
    onUnmounted(() => {
      if (speechRecognition.value) {
        try {
          speechRecognition.value.stop()
          speechRecognition.value.abort()
        } catch (e) {
          logger.log('Cleanup error (safe to ignore):', e)
        }
      }
      if (listeningTimer.value) {
        clearInterval(listeningTimer.value)
      }
      // 音声合成も停止
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
    })

    return {
      // 状態
      currentLevel,
      currentStation,
      currentGroup,
      score,
      playerLives,
      showLevelSelect,
      isMoving,
      gameBoard,
      
      // 音声認識
      isListening,
      listeningTimeLeft,
      speechError,
      lastResult,
      
      // ゲームデータ
      jollyPhonicsGroups,
      selectedGroupData,
      currentChallenge,
      stations,
      pathData,
      playerPosition,
      progressPercentage,
      
      // 関数
      selectGroup,
      selectStation,
      startListening,
      nextStation,
      skipChallenge,
      handleSpecialStation,
      playTargetWord,
      playRecognizedWord,
      playPhoneme,
      getAccuracyColor
    }
  }
}
</script>

<style scoped>
.phonics-path-game {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #2a2a6e 100%);
  overflow: hidden;
  font-family: 'Noto Sans JP', sans-serif;
}

/* レベル選択画面スタイル */
.level-select-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.level-select-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.floating-star {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.level-select-content {
  position: relative;
  max-width: 1200px;
  width: 95%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.level-select-title {
  text-align: center;
  margin-bottom: 40px;
}

.rainbow-text {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 15px 0;
  background: linear-gradient(45deg, #ff6b6b, #ffd700, #4ecdc4, #a8e6cf, #ff8a80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-shift 3s ease-in-out infinite;
}

@keyframes rainbow-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  25% { filter: hue-rotate(90deg); }
  50% { filter: hue-rotate(180deg); }
  75% { filter: hue-rotate(270deg); }
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.group-card {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.group-card.unlocked:hover {
  transform: translateY(-8px) scale(1.02);
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.group-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.group-icon {
  font-size: 40px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.group-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.phonemes-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.phoneme-badge {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.group-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.stat-icon {
  font-size: 18px;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.unlock-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
}

.select-actions {
  text-align: center;
}

.magical-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px 30px;
  background: linear-gradient(45deg, #ff6b6b, #ffd700);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  text-decoration: none;
}

.magical-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.back-btn {
  background: linear-gradient(45deg, #667eea, #764ba2) !important;
}

.level-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d) !important;
}

.btn-icon {
  font-size: 20px;
}

.game-main {
  position: relative;
  width: 100%;
  height: 100vh;
}

.animated-avatar {
  position: relative;
  animation: avatar-bounce 2s ease-in-out infinite;
}

@keyframes avatar-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.avatar-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
}

.lives {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.heart {
  font-size: 16px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.heart.empty {
  opacity: 0.3;
}

/* ゲームヘッダー */
.game-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.player-avatar {
  font-size: 32px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.player-stats {
  color: white;
}

.level {
  font-size: 18px;
  font-weight: bold;
}

.score {
  font-size: 16px;
  color: #ffd700;
}

.game-title {
  text-align: center;
  color: white;
}

.game-title h1 {
  font-size: 24px;
  margin: 0 0 5px 0;
  background: linear-gradient(45deg, #ff6b6b, #ffd700, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-title p {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* ゲームボード */
.game-board {
  position: absolute;
  top: 80px;
  left: 20px;
  right: 20px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.2);
}

.space-background {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star, .bg-star {
  position: absolute;
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  animation: star-twinkle 3s infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.5); }
  25% { opacity: 1; transform: scale(1.2); }
  50% { opacity: 0.6; transform: scale(0.8); }
  75% { opacity: 1; transform: scale(1.5); }
}

.meteor {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  border-radius: 50%;
  animation: meteor-fall 5s linear infinite;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

@keyframes meteor-fall {
  0% {
    opacity: 0;
    transform: translateX(-100px) translateY(-100px);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(900px) translateY(700px);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.game-path {
  width: 100%;
  height: 100%;
}

.path-line {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 4;
  stroke-dasharray: 10, 5;
  animation: pathFlow 20s linear infinite;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

@keyframes pathFlow {
  to { stroke-dashoffset: -300; }
}

/* ステーション（強化版） */
.station {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
}

.station.normal {
  fill: #4ecdc4;
  stroke: #26d0ce;
  stroke-width: 3;
}

.station.special {
  fill: #ff6b6b;
  stroke: #ff4757;
  stroke-width: 4;
  animation: special-glow 2s ease-in-out infinite;
}

@keyframes special-glow {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(255, 107, 107, 1));
  }
}

.station-bg {
  fill: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.station-bg.special {
  fill: rgba(255, 107, 107, 0.3);
  animation: bg-pulse 3s ease-in-out infinite;
}

@keyframes bg-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.station.current {
  fill: #ffd700;
  stroke: #ffb347;
  animation: current-pulse 1.5s infinite;
  transform-origin: center;
}

@keyframes current-pulse {
  0%, 100% { 
    transform: scale(1);
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  }
  50% { 
    transform: scale(1.3);
    filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1));
  }
}

.station.completed {
  fill: #4caf50;
  stroke: #2e7d32;
  opacity: 0.8;
}

.station.locked {
  fill: #666;
  stroke: #444;
  opacity: 0.3;
  cursor: not-allowed;
}

.special-icon {
  fill: white;
  font-size: 20px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.special-label {
  fill: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  text-anchor: middle;
  font-weight: bold;
  pointer-events: none;
}


.station-text {
  fill: white;
  font-size: 14px;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.station-number {
  fill: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  text-anchor: middle;
  pointer-events: none;
}

/* プレイヤーピース */
.player-piece {
  fill: #ff6b6b;
  stroke: #ff4757;
  stroke-width: 3;
  filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8));
  animation: player-glow 2s ease-in-out infinite;
}

@keyframes player-glow {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(255, 107, 107, 1));
  }
}

.player-aura {
  fill: rgba(255, 107, 107, 0.2);
  animation: aura-pulse 2s ease-in-out infinite;
}

@keyframes aura-pulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.move-effect {
  fill: none;
  stroke: #ffd700;
  stroke-width: 3;
  opacity: 0.7;
  animation: move-ripple 0.8s ease-out;
}

@keyframes move-ripple {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.player-emoji {
  fill: white;
  font-size: 24px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.sparkle {
  fill: #ffd700;
  animation: sparkle-twinkle 2s ease-in-out infinite;
}

@keyframes sparkle-twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

/* チャレンジパネル */
.challenge-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 50;
}

.challenge-card {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 25px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  text-align: center;
}

.challenge-word {
  margin-bottom: 20px;
}

.word-display {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  margin-right: 15px;
}

.word-type {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.pronunciation-guide {
  margin-bottom: 25px;
}

.phoneme-breakdown {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.phoneme {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 音声コントロール */
.speech-controls {
  margin-bottom: 20px;
}

.mic-button {
  padding: 15px 30px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(45deg, #ff6b6b, #ff4757);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 15px;
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
}

.mic-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 25px rgba(255, 107, 107, 0.6);
}

.mic-button.listening {
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  animation: listening-pulse 1.5s infinite;
}

.mic-button.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes listening-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.mic-icon {
  font-size: 24px;
}

.listening-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #4caf50;
  font-weight: bold;
}

.sound-waves {
  display: flex;
  gap: 3px;
}

.wave {
  width: 4px;
  height: 20px;
  background: #4caf50;
  border-radius: 2px;
  animation: wave-animation 1.5s infinite;
}

.wave:nth-child(2) { animation-delay: 0.2s; }
.wave:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave-animation {
  0%, 100% { height: 10px; opacity: 0.3; }
  50% { height: 25px; opacity: 1; }
}

/* 結果表示（強化版） */
.result-display {
  margin-bottom: 20px;
}

.result-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
  animation: result-appear 0.5s ease-out;
}

@keyframes result-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.result-badge.correct {
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  color: white;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.result-badge.incorrect {
  background: linear-gradient(45deg, #ff6b6b, #ff4757);
  color: white;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.result-icon {
  font-size: 28px;
  animation: icon-bounce 0.6s ease-out 0.2s;
}

@keyframes icon-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.recognition-feedback {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.comparison-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
}

.target-word, .recognized-word {
  flex: 1;
  text-align: center;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.target-word {
  border: 2px solid #4caf50;
}

.recognized-word {
  border: 2px solid #ff9800;
}

.label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
}

.word {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 10px;
}

.play-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.vs-divider {
  font-size: 16px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
  padding: 10px;
}

.accuracy-meter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.accuracy-label {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  min-width: 60px;
}

.accuracy-bar {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.accuracy-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s ease-out;
  position: relative;
}

.accuracy-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.accuracy-text {
  font-weight: bold;
  color: white;
  min-width: 40px;
  text-align: right;
}

.hint-section {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 12px;
  border-left: 4px solid #ffc107;
}

.hint-title {
  font-weight: bold;
  color: #ffc107;
  margin-bottom: 12px;
  font-size: 16px;
}

.phoneme-hint {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.phoneme-sound {
  position: relative;
  padding: 8px 12px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.phoneme-sound:hover {
  background: rgba(255, 193, 7, 0.3);
  border-color: #ffc107;
  transform: translateY(-2px);
}

.sound-icon {
  margin-left: 5px;
  font-size: 12px;
  opacity: 0.7;
}

.confidence {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-top: 10px;
  text-align: center;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.skip-btn, .next-btn {
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.skip-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.next-btn {
  background: linear-gradient(45deg, #4caf50, #2e7d32);
  color: white;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
}

/* 進捗表示 */
.progress-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ffd700);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* エラーメッセージ */
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 107, 107, 0.95);
  color: white;
  padding: 20px 30px;
  border-radius: 15px;
  text-align: center;
  z-index: 200;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.error-close {
  margin-top: 15px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .game-title h1 {
    font-size: 20px;
  }
  
  .challenge-card {
    padding: 20px;
  }
  
  .word-display {
    font-size: 36px;
  }
  
  .phoneme {
    font-size: 16px;
    padding: 6px 10px;
  }
}
</style>