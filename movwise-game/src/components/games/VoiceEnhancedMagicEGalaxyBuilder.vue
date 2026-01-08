<template>
  <GameAccessGuard game-id="magicEGalaxyBuilder" game-title="Magic E Galaxy Builder">
    <div class="voice-magic-e-galaxy-game">
      <!-- Starfield Background -->
      <div class="starfield">
        <div v-for="n in 100" :key="n" class="star" :style="getStarStyle(n)"></div>
      </div>

      <!-- Game Header -->
      <div class="game-header">
        <button @click="goBack" class="back-btn glass-btn">
          <i class="fas fa-arrow-left"></i> 銀河マップへ
        </button>
        
        <div class="game-stats">
          <div class="stat-item">
            <i class="fas fa-star"></i>
            <span>{{ score }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-rocket"></i>
            <span>{{ combo }}x</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-globe"></i>
            <span>{{ currentStage }}/{{ totalStages }}</span>
          </div>
          <div class="stat-item voice-indicator" :class="{ 'listening': isListening, 'processing': isProcessing }">
            <i class="fas fa-microphone"></i>
            <span>{{ voiceStatus }}</span>
          </div>
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="galaxy-workspace">
        <!-- Planet Creation Area -->
        <div class="planet-forge">
          <h2 class="forge-title">
            <i class="fas fa-magic"></i>
            惑星変換ラボ
          </h2>
          
          <!-- Word Transformation Chamber -->
          <div class="transformation-chamber">
            <!-- Original Word Planet -->
            <div class="word-planet original" :class="{ 'pulsing': !wordTransformed }">
              <div class="planet-surface">
                <div class="word-display">{{ currentWord.cvc }}</div>
                <div class="word-meaning">{{ currentWord.cvcMeaning }}</div>
              </div>
              <div class="planet-rings"></div>
            </div>

            <!-- Transformation Beam -->
            <div class="transformation-beam" :class="{ 'active': beamActive }">
              <div class="beam-particles">
                <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
              </div>
            </div>

            <!-- Target Word Planet -->
            <div class="word-planet target" :class="{ 'transformed': wordTransformed, 'correct': isCorrect, 'incorrect': isIncorrect }">
              <div class="planet-surface">
                <div class="word-display">
                  <span v-if="wordTransformed">{{ userAnswer }}</span>
                  <span v-else class="placeholder">???</span>
                </div>
                <div class="word-meaning">
                  <span v-if="showMeaning && selectedImageIndex !== null">{{ currentWord.cvceMeaning }}</span>
                  <span v-else>？</span>
                </div>
              </div>
              <div class="planet-rings"></div>
              <div v-if="wordTransformed" class="planet-glow"></div>
            </div>
          </div>

          <!-- Magic E Launcher -->
          <div class="magic-e-launcher">
            <div class="launcher-title">Magic E 発射台</div>
            <div class="launcher-chamber">
              <div 
                class="magic-e-orb" 
                :class="{ 'ready': !wordTransformed, 'launched': wordTransformed }"
                @click="launchMagicE"
              >
                <div class="orb-core">E</div>
                <div class="orb-energy"></div>
              </div>
            </div>
            <div class="launcher-controls">
              <button 
                @click="launchMagicE" 
                class="launch-btn"
                :disabled="wordTransformed"
                v-if="!wordTransformed"
              >
                <i class="fas fa-rocket"></i>
                発射！
              </button>
            </div>
          </div>
        </div>

        <!-- Word Assembly & Image Selection Area -->
        <div class="word-assembly">
          <div class="assembly-title">単語組み立てエリア</div>
          
          <!-- Letter Assembly (Phase 1) -->
          <div v-if="gamePhase === 'transformation'" class="letter-slots">
            <!-- Original letters -->
            <div 
              v-for="(letter, index) in currentWord.cvc.split('')" 
              :key="`letter-${index}`"
              class="letter-slot filled"
              :class="{ 'glowing': wordTransformed }"
            >
              <div class="letter-card">{{ letter }}</div>
            </div>
            
            <!-- Magic E slot -->
            <div 
              class="letter-slot magic-e-slot"
              :class="{ 
                'active': !wordTransformed,
                'filled': wordTransformed
              }"
            >
              <div v-if="wordTransformed" class="letter-card magic-e">e</div>
              <div v-else class="slot-indicator">
                <i class="fas fa-plus"></i>
                <span>Magic E</span>
              </div>
            </div>
          </div>

          <!-- Image Selection (Phase 2) -->
          <div v-if="gamePhase === 'selection'" class="image-selection-area">
            <h3 class="selection-title">
              <i class="fas fa-images"></i>
              "{{ userAnswer }}" はどの画像でしょう？
            </h3>
            
            <div class="image-grid">
              <div 
                v-for="(image, index) in imageChoices" 
                :key="index"
                class="image-choice"
                :class="{ 
                  'selected': selectedImageIndex === index,
                  'correct': showResults && index === correctImageIndex,
                  'incorrect': showResults && selectedImageIndex === index && index !== correctImageIndex
                }"
                @click="selectImage(index)"
              >
                <div class="image-container">
                  <img :src="image.src" :alt="image.word" class="choice-image" />
                  <div class="image-overlay">
                    <div class="image-word">{{ image.word }}</div>
                  </div>
                </div>
                <div class="image-label">{{ image.label }}</div>
              </div>
            </div>
          </div>

          <!-- Voice Recognition (Phase 3) -->
          <div v-if="gamePhase === 'pronunciation'" class="voice-recognition-area">
            <h3 class="voice-title">
              <i class="fas fa-microphone"></i>
              "{{ userAnswer }}" を正しく発音してください
            </h3>
            
            <div class="voice-interface">
              <div class="target-image">
                <img :src="selectedImage.src" :alt="selectedImage.word" class="target-img" />
                <div class="target-word">{{ userAnswer }}</div>
                <div class="target-meaning">{{ currentWord.cvceMeaning }}</div>
              </div>
              
              <div class="voice-controls">
                <button 
                  @click="startVoiceRecognition"
                  class="voice-btn"
                  :class="{ 'listening': isListening, 'processing': isProcessing }"
                  :disabled="isProcessing"
                >
                  <i class="fas fa-microphone" v-if="!isListening && !isProcessing"></i>
                  <i class="fas fa-microphone-slash" v-if="isListening"></i>
                  <i class="fas fa-spinner fa-spin" v-if="isProcessing"></i>
                  <span>{{ voiceButtonText }}</span>
                </button>
                
                <!-- Voice Feedback -->
                <div class="voice-feedback" v-if="voiceFeedback">
                  <div class="feedback-icon" :class="voiceFeedback.type">
                    <i :class="voiceFeedback.icon"></i>
                  </div>
                  <div class="feedback-text">{{ voiceFeedback.message }}</div>
                  <div class="confidence-meter" v-if="voiceFeedback.confidence">
                    <div class="confidence-label">正確度: {{ Math.round(voiceFeedback.confidence * 100) }}%</div>
                    <div class="confidence-bar">
                      <div 
                        class="confidence-fill" 
                        :style="{ '--target-width': (voiceFeedback.confidence * 100) + '%', width: (voiceFeedback.confidence * 100) + '%' }"
                        :class="{ 'high': voiceFeedback.confidence > 0.8, 'medium': voiceFeedback.confidence > 0.6 }"
                      ></div>
                    </div>
                  </div>
                  <div class="detected-vs-target" v-if="voiceFeedback.detectedWord && voiceFeedback.targetWord">
                    <div class="detected-word">
                      <strong>認識結果:</strong> "{{ voiceFeedback.detectedWord }}"
                    </div>
                    <div class="target-word">
                      <strong>目標:</strong> "{{ voiceFeedback.targetWord }}"
                    </div>
                  </div>
                </div>
                
                <!-- Microphone Permission Warning -->
                <div class="mic-permission-warning" v-if="microphonePermission === 'denied'">
                  <i class="fas fa-microphone-slash"></i>
                  <strong>マイクアクセスが必要です</strong><br>
                  ブラウザの設定でマイクの使用を許可してください。
                </div>
                
                <!-- Voice Not Supported Warning -->
                <div class="mic-permission-warning" v-if="!isVoiceSupported">
                  <i class="fas fa-exclamation-triangle"></i>
                  <strong>音声認識非対応</strong><br>
                  このブラウザは音声認識に対応していません。スキップボタンをご利用ください。
                </div>
              </div>
              
              <!-- Pronunciation Help -->
              <div class="pronunciation-help">
                <button @click="playCorrectPronunciation" class="help-btn">
                  <i class="fas fa-volume-up"></i>
                  お手本を聞く
                </button>
                <div class="pronunciation-hint">
                  ヒント: {{ currentWord.pronunciationHint }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-panel">
            <button 
              @click="checkImageSelection" 
              class="action-btn check-btn"
              v-if="gamePhase === 'selection' && selectedImageIndex !== null && !showResults"
            >
              <i class="fas fa-search"></i>
              選択確認
            </button>
            
            <button 
              @click="proceedToPronunciation" 
              class="action-btn next-btn"
              v-if="gamePhase === 'selection' && showResults && selectedImageIndex === correctImageIndex"
            >
              <i class="fas fa-microphone"></i>
              発音テストへ
            </button>
            
            <button 
              @click="nextQuestion" 
              class="action-btn complete-btn"
              v-if="gamePhase === 'pronunciation' && pronunciationCorrect"
            >
              <i class="fas fa-forward"></i>
              次の惑星へ
            </button>
            
            <button 
              @click="retryImageSelection" 
              class="action-btn retry-btn"
              v-if="gamePhase === 'selection' && showResults && selectedImageIndex !== correctImageIndex"
            >
              <i class="fas fa-redo"></i>
              もう一度選択
            </button>
            
            <button 
              @click="retryPronunciation" 
              class="action-btn retry-btn"
              v-if="gamePhase === 'pronunciation' && voiceFeedback && !pronunciationCorrect"
            >
              <i class="fas fa-redo"></i>
              もう一度発音
            </button>
            
            <button 
              @click="skipPronunciation" 
              @keydown.enter="skipPronunciation"
              class="action-btn skip-btn"
              v-if="gamePhase === 'pronunciation' && (voiceAttempts >= 3 || !isVoiceSupported || microphonePermission === 'denied')"
              :aria-label='発音テストをスキップして次の問題に進みます'
              tabindex="0"
            >
              <i class="fas fa-forward" aria-hidden="true"></i>
              スキップ
            </button>
            
            <button 
              @click="getHint" 
              class="action-btn hint-btn"
              v-if="gamePhase === 'selection' && !showHint"
            >
              <i class="fas fa-lightbulb"></i>
              ヒント
            </button>
          </div>

          <!-- Hint Display -->
          <div v-if="showHint" class="hint-panel">
            <div class="hint-icon">💡</div>
            <div class="hint-text">{{ currentWord.hint }}</div>
          </div>
        </div>
      </div>

      <!-- Feedback System -->
      <transition name="feedback">
        <div v-if="feedbackMessage" class="feedback-system" :class="feedbackType">
          <div class="feedback-icon">
            <i :class="feedbackIcon"></i>
          </div>
          <div class="feedback-content">
            <div class="feedback-text">{{ feedbackMessage }}</div>
            <div v-if="pointsEarned > 0" class="points-display">
              +{{ pointsEarned }} <i class="fas fa-star"></i>
            </div>
          </div>
        </div>
      </transition>

      <!-- Progress System -->
      <div class="progress-system">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-text">惑星 {{ completedWords.length }} / {{ totalWords }}</div>
        </div>
        <div class="phase-indicator">
          <div class="phase-step" :class="{ 'active': gamePhase === 'transformation', 'completed': gamePhase !== 'transformation' }">
            <i class="fas fa-magic"></i>
            <span>変換</span>
          </div>
          <div class="phase-step" :class="{ 'active': gamePhase === 'selection', 'completed': gamePhase === 'pronunciation' || (gamePhase === 'selection' && selectedImageIndex === correctImageIndex) }">
            <i class="fas fa-images"></i>
            <span>選択</span>
          </div>
          <div class="phase-step" :class="{ 'active': gamePhase === 'pronunciation', 'completed': pronunciationCorrect }">
            <i class="fas fa-microphone"></i>
            <span>発音</span>
          </div>
        </div>
      </div>

      <!-- Stage Complete Modal -->
      <transition name="modal">
        <div v-if="stageCleared" class="stage-clear-modal">
          <div class="modal-content galaxy-theme">
            <div class="clear-header">
              <h2 class="clear-title">🌟 銀河征服完了！ 🌟</h2>
            </div>
            
            <div class="clear-stats">
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                  <div class="stat-value">{{ correctCount }}/{{ totalWords }}</div>
                  <div class="stat-label">惑星変換成功</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🖼️</div>
                <div class="stat-info">
                  <div class="stat-value">{{ imageCorrectCount }}/{{ totalWords }}</div>
                  <div class="stat-label">画像選択成功</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎤</div>
                <div class="stat-info">
                  <div class="stat-value">{{ pronunciationCorrectCount }}/{{ totalWords }}</div>
                  <div class="stat-label">発音成功</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-info">
                  <div class="stat-value">{{ stageScore }}</div>
                  <div class="stat-label">獲得スター</div>
                </div>
              </div>
            </div>
            
            <div class="clear-actions">
              <button @click="nextStage" class="action-btn next-stage-btn">
                <i class="fas fa-rocket"></i>
                次の銀河へ
              </button>
              <button @click="replayStage" class="action-btn replay-btn">
                <i class="fas fa-redo"></i>
                再チャレンジ
              </button>
              <button @click="goBack" class="action-btn back-btn">
                <i class="fas fa-map"></i>
                銀河マップ
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </GameAccessGuard>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GameAccessGuard from '@/components/ui/GameAccessGuard.vue'
import { useGameStore } from '@/stores/gameStore'

export default {
  name: 'VoiceEnhancedMagicEGalaxyBuilder',
  components: {
    GameAccessGuard
  },
  setup() {
    const router = useRouter()
    const gameStore = useGameStore()
    
    // Game State
    const score = ref(0)
    const combo = ref(0)
    const currentStage = ref(1)
    const totalStages = ref(5)
    const currentWordIndex = ref(0)
    const userAnswer = ref('')
    const isCorrect = ref(false)
    const isIncorrect = ref(false)
    const showHint = ref(false)
    const showMeaning = ref(false)
    const wordTransformed = ref(false)
    const beamActive = ref(false)
    
    // Game Phases: 'transformation' -> 'selection' -> 'pronunciation'
    const gamePhase = ref('transformation')
    
    // Image Selection
    const selectedImageIndex = ref(null)
    const correctImageIndex = ref(0)
    const showResults = ref(false)
    const imageChoices = ref([])
    
    // Voice Recognition
    const isListening = ref(false)
    const isProcessing = ref(false)
    const voiceFeedback = ref(null)
    const pronunciationCorrect = ref(false)
    const voiceAttempts = ref(0)
    const recognition = ref(null)
    
    // Feedback System
    const feedbackMessage = ref('')
    const feedbackType = ref('')
    const feedbackIcon = ref('')
    const pointsEarned = ref(0)
    
    // Progress
    const completedWords = ref([])
    const correctCount = ref(0)
    const imageCorrectCount = ref(0)
    const pronunciationCorrectCount = ref(0)
    const stageScore = ref(0)
    const stageCleared = ref(false)

    // Expanded Magic E Database
    const MAGIC_E_DATABASE = {
      1: [
        { 
          original: 'cap', magicE: 'cape', cvcMeaning: '帽子', cvceMeaning: 'ケープ、岬', 
          hint: 'cap（帽子）にEを追加すると、cape（ケープ）になります！',
          pronunciationHint: 'ケイプ と発音します', pronunciation: 'keɪp',
          images: [
            { word: 'cape', isCorrect: true, src: '/images/vocabulary/cape.jpg', label: 'ケープ' },
            { word: 'cap', isCorrect: false, src: '/images/vocabulary/cap.jpg', label: '帽子' },
            { word: 'cat', isCorrect: false, src: '/images/vocabulary/cat.jpg', label: '猫' },
            { word: 'cake', isCorrect: false, src: '/images/vocabulary/cake.jpg', label: 'ケーキ' }
          ]
        },
        { 
          original: 'tap', magicE: 'tape', cvcMeaning: '軽くたたく', cvceMeaning: 'テープ', 
          hint: 'tap（たたく）にEを追加すると、tape（テープ）になります！',
          pronunciationHint: 'テイプ と発音します', pronunciation: 'teɪp',
          images: [
            { word: 'tape', isCorrect: true, src: '/images/vocabulary/tape.jpg', label: 'テープ' },
            { word: 'table', isCorrect: false, src: '/images/vocabulary/table.jpg', label: 'テーブル' },
            { word: 'top', isCorrect: false, src: '/images/vocabulary/top.jpg', label: '上' },
            { word: 'tree', isCorrect: false, src: '/images/vocabulary/tree.jpg', label: '木' }
          ]
        },
        { 
          original: 'mad', magicE: 'made', cvcMeaning: '怒った', cvceMeaning: '作った', 
          hint: 'mad（怒った）にEを追加すると、made（作った）になります！',
          pronunciationHint: 'メイド と発音します', pronunciation: 'meɪd',
          images: [
            { word: 'made', isCorrect: true, src: '/images/vocabulary/made.jpg', label: '作った' },
            { word: 'mad', isCorrect: false, src: '/images/vocabulary/mad.jpg', label: '怒った' },
            { word: 'moon', isCorrect: false, src: '/images/vocabulary/moon.jpg', label: '月' },
            { word: 'mouse', isCorrect: false, src: '/images/vocabulary/mouse.jpg', label: 'ネズミ' }
          ]
        },
        { 
          original: 'hat', magicE: 'hate', cvcMeaning: '帽子', cvceMeaning: '嫌う', 
          hint: 'hat（帽子）にEを追加すると、hate（嫌う）になります！',
          pronunciationHint: 'ヘイト と発音します', pronunciation: 'heɪt',
          images: [
            { word: 'hate', isCorrect: true, src: '/images/vocabulary/hate.jpg', label: '嫌う' },
            { word: 'hat', isCorrect: false, src: '/images/vocabulary/hat.jpg', label: '帽子' },
            { word: 'house', isCorrect: false, src: '/images/vocabulary/house.jpg', label: '家' },
            { word: 'hand', isCorrect: false, src: '/images/vocabulary/hand.jpg', label: '手' }
          ]
        },
        { 
          original: 'rat', magicE: 'rate', cvcMeaning: 'ネズミ', cvceMeaning: '率、割合', 
          hint: 'rat（ネズミ）にEを追加すると、rate（割合）になります！',
          pronunciationHint: 'レイト と発音します', pronunciation: 'reɪt',
          images: [
            { word: 'rate', isCorrect: true, src: '/images/vocabulary/rate.jpg', label: '割合' },
            { word: 'rat', isCorrect: false, src: '/images/vocabulary/rat.jpg', label: 'ネズミ' },
            { word: 'run', isCorrect: false, src: '/images/vocabulary/run.jpg', label: '走る' },
            { word: 'red', isCorrect: false, src: '/images/vocabulary/red.jpg', label: '赤' }
          ]
        }
      ],
      2: [
        { 
          original: 'kit', magicE: 'kite', cvcMeaning: 'キット', cvceMeaning: '凧', 
          hint: 'kit（キット）にEを追加すると、kite（凧）になります！',
          pronunciationHint: 'カイト と発音します', pronunciation: 'kaɪt',
          images: [
            { word: 'kite', isCorrect: true, src: '/images/vocabulary/kite.jpg', label: '凧' },
            { word: 'kit', isCorrect: false, src: '/images/vocabulary/kit.jpg', label: 'キット' },
            { word: 'key', isCorrect: false, src: '/images/vocabulary/key.jpg', label: '鍵' },
            { word: 'king', isCorrect: false, src: '/images/vocabulary/king.jpg', label: '王様' }
          ]
        },
        { 
          original: 'bit', magicE: 'bite', cvcMeaning: '少し', cvceMeaning: '噛む', 
          hint: 'bit（少し）にEを追加すると、bite（噛む）になります！',
          pronunciationHint: 'バイト と発音します', pronunciation: 'baɪt',
          images: [
            { word: 'bite', isCorrect: true, src: '/images/vocabulary/bite.jpg', label: '噛む' },
            { word: 'bit', isCorrect: false, src: '/images/vocabulary/bit.jpg', label: '少し' },
            { word: 'bird', isCorrect: false, src: '/images/vocabulary/bird.jpg', label: '鳥' },
            { word: 'book', isCorrect: false, src: '/images/vocabulary/book.jpg', label: '本' }
          ]
        },
        { 
          original: 'pin', magicE: 'pine', cvcMeaning: 'ピン', cvceMeaning: '松', 
          hint: 'pin（ピン）にEを追加すると、pine（松）になります！',
          pronunciationHint: 'パイン と発音します', pronunciation: 'paɪn',
          images: [
            { word: 'pine', isCorrect: true, src: '/images/vocabulary/pine.jpg', label: '松' },
            { word: 'pin', isCorrect: false, src: '/images/vocabulary/pin.jpg', label: 'ピン' },
            { word: 'pig', isCorrect: false, src: '/images/vocabulary/pig.jpg', label: '豚' },
            { word: 'plate', isCorrect: false, src: '/images/vocabulary/plate.jpg', label: '皿' }
          ]
        },
        { 
          original: 'dim', magicE: 'dime', cvcMeaning: '薄暗い', cvceMeaning: '10セント硬貨', 
          hint: 'dim（薄暗い）にEを追加すると、dime（10セント硬貨）になります！',
          pronunciationHint: 'ダイム と発音します', pronunciation: 'daɪm',
          images: [
            { word: 'dime', isCorrect: true, src: '/images/vocabulary/dime.jpg', label: '10セント硬貨' },
            { word: 'dim', isCorrect: false, src: '/images/vocabulary/dim.jpg', label: '薄暗い' },
            { word: 'dog', isCorrect: false, src: '/images/vocabulary/dog.jpg', label: '犬' },
            { word: 'door', isCorrect: false, src: '/images/vocabulary/door.jpg', label: 'ドア' }
          ]
        },
        { 
          original: 'rid', magicE: 'ride', cvcMeaning: '取り除く', cvceMeaning: '乗る', 
          hint: 'rid（取り除く）にEを追加すると、ride（乗る）になります！',
          pronunciationHint: 'ライド と発音します', pronunciation: 'raɪd',
          images: [
            { word: 'ride', isCorrect: true, src: '/images/vocabulary/ride.jpg', label: '乗る' },
            { word: 'rid', isCorrect: false, src: '/images/vocabulary/rid.jpg', label: '取り除く' },
            { word: 'road', isCorrect: false, src: '/images/vocabulary/road.jpg', label: '道' },
            { word: 'rock', isCorrect: false, src: '/images/vocabulary/rock.jpg', label: '岩' }
          ]
        }
      ],
      3: [
        { 
          original: 'hop', magicE: 'hope', cvcMeaning: 'ホップする', cvceMeaning: '希望', 
          hint: 'hop（跳ねる）にEを追加すると、hope（希望）になります！',
          pronunciationHint: 'ホープ と発音します', pronunciation: 'hoʊp',
          images: [
            { word: 'hope', isCorrect: true, src: '/images/vocabulary/hope.jpg', label: '希望' },
            { word: 'hop', isCorrect: false, src: '/images/vocabulary/hop.jpg', label: '跳ねる' },
            { word: 'hot', isCorrect: false, src: '/images/vocabulary/hot.png', label: '暑い' },
            { word: 'house', isCorrect: false, src: '/images/vocabulary/house.jpg', label: '家' }
          ]
        },
        { 
          original: 'not', magicE: 'note', cvcMeaning: '〜ではない', cvceMeaning: 'メモ、音符', 
          hint: 'not（〜ではない）にEを追加すると、note（メモ）になります！',
          pronunciationHint: 'ノート と発音します', pronunciation: 'noʊt',
          images: [
            { word: 'note', isCorrect: true, src: '/images/vocabulary/note.jpg', label: 'メモ' },
            { word: 'not', isCorrect: false, src: '/images/vocabulary/not.jpg', label: '〜ではない' },
            { word: 'nose', isCorrect: false, src: '/images/vocabulary/nose.jpg', label: '鼻' },
            { word: 'net', isCorrect: false, src: '/images/vocabulary/net.jpg', label: '網' }
          ]
        },
        { 
          original: 'rob', magicE: 'robe', cvcMeaning: '奪う', cvceMeaning: 'ローブ', 
          hint: 'rob（奪う）にEを追加すると、robe（ローブ）になります！',
          pronunciationHint: 'ローブ と発音します', pronunciation: 'roʊb',
          images: [
            { word: 'robe', isCorrect: true, src: '/images/vocabulary/robe.jpg', label: 'ローブ' },
            { word: 'rob', isCorrect: false, src: '/images/vocabulary/rob.jpg', label: '奪う' },
            { word: 'red', isCorrect: false, src: '/images/vocabulary/red.jpg', label: '赤' },
            { word: 'rope', isCorrect: false, src: '/images/vocabulary/rope.jpg', label: 'ロープ' }
          ]
        }
      ],
      4: [
        { 
          original: 'cub', magicE: 'cube', cvcMeaning: '子熊', cvceMeaning: '立方体', 
          hint: 'cub（子熊）にEを追加すると、cube（立方体）になります！',
          pronunciationHint: 'キューブ と発音します', pronunciation: 'kjuːb',
          images: [
            { word: 'cube', isCorrect: true, src: '/images/vocabulary/cube.jpg', label: '立方体' },
            { word: 'cub', isCorrect: false, src: '/images/vocabulary/cub.jpg', label: '子熊' },
            { word: 'cup', isCorrect: false, src: '/images/vocabulary/cup.jpg', label: 'コップ' },
            { word: 'car', isCorrect: false, src: '/images/vocabulary/car.jpg', label: '車' }
          ]
        },
        { 
          original: 'cut', magicE: 'cute', cvcMeaning: '切る', cvceMeaning: 'かわいい', 
          hint: 'cut（切る）にEを追加すると、cute（かわいい）になります！',
          pronunciationHint: 'キュート と発音します', pronunciation: 'kjuːt',
          images: [
            { word: 'cute', isCorrect: true, src: '/images/vocabulary/cute.jpg', label: 'かわいい' },
            { word: 'cut', isCorrect: false, src: '/images/vocabulary/cut.jpg', label: '切る' },
            { word: 'cat', isCorrect: false, src: '/images/vocabulary/cat.jpg', label: '猫' },
            { word: 'cake', isCorrect: false, src: '/images/vocabulary/cake.jpg', label: 'ケーキ' }
          ]
        },
        { 
          original: 'tub', magicE: 'tube', cvcMeaning: '浴槽', cvceMeaning: 'チューブ', 
          hint: 'tub（浴槽）にEを追加すると、tube（チューブ）になります！',
          pronunciationHint: 'チューブ と発音します', pronunciation: 'tuːb',
          images: [
            { word: 'tube', isCorrect: true, src: '/images/vocabulary/tube.jpg', label: 'チューブ' },
            { word: 'tub', isCorrect: false, src: '/images/vocabulary/tub.jpg', label: '浴槽' },
            { word: 'top', isCorrect: false, src: '/images/vocabulary/top.jpg', label: '上' },
            { word: 'tree', isCorrect: false, src: '/images/vocabulary/tree.jpg', label: '木' }
          ]
        }
      ],
      5: [
        { 
          original: 'can', magicE: 'cane', cvcMeaning: 'できる', cvceMeaning: '杖', 
          hint: 'can（できる）にEを追加すると、cane（杖）になります！',
          pronunciationHint: 'ケイン と発音します', pronunciation: 'keɪn',
          images: [
            { word: 'cane', isCorrect: true, src: '/images/vocabulary/cane.jpg', label: '杖' },
            { word: 'can', isCorrect: false, src: '/images/vocabulary/can.jpg', label: 'できる' },
            { word: 'car', isCorrect: false, src: '/images/vocabulary/car.jpg', label: '車' },
            { word: 'cake', isCorrect: false, src: '/images/vocabulary/cake.jpg', label: 'ケーキ' }
          ]
        },
        { 
          original: 'pan', magicE: 'pane', cvcMeaning: 'フライパン', cvceMeaning: '窓ガラス', 
          hint: 'pan（フライパン）にEを追加すると、pane（窓ガラス）になります！',
          pronunciationHint: 'ペイン と発音します', pronunciation: 'peɪn',
          images: [
            { word: 'pane', isCorrect: true, src: '/images/vocabulary/pane.jpg', label: '窓ガラス' },
            { word: 'pan', isCorrect: false, src: '/images/vocabulary/pan.jpg', label: 'フライパン' },
            { word: 'park', isCorrect: false, src: '/images/vocabulary/park.jpg', label: '公園' },
            { word: 'pig', isCorrect: false, src: '/images/vocabulary/pig.jpg', label: '豚' }
          ]
        }
      ]
    }

    // Computed Properties
    const currentWords = computed(() => MAGIC_E_DATABASE[currentStage.value] || [])
    const currentWord = computed(() => {
      const word = currentWords.value[currentWordIndex.value] || {}
      // Map database structure to component expected structure
      return {
        cvc: word.original,
        cvce: word.magicE,
        cvcMeaning: word.cvcMeaning,
        cvceMeaning: word.cvceMeaning,
        hint: word.hint,
        pronunciationHint: word.pronunciationHint,
        pronunciation: word.pronunciation,
        images: word.images
      }
    })
    const totalWords = computed(() => currentWords.value.length)
    const progressPercentage = computed(() => {
      return totalWords.value > 0 ? (completedWords.value.length / totalWords.value) * 100 : 0
    })
    const selectedImage = computed(() => {
      if (selectedImageIndex.value !== null && imageChoices.value[selectedImageIndex.value]) {
        return imageChoices.value[selectedImageIndex.value]
      }
      return null
    })
    const voiceStatus = computed(() => {
      if (isListening.value) return '聞き取り中'
      if (isProcessing.value) return '分析中'
      return '待機中'
    })
    const voiceButtonText = computed(() => {
      if (isListening.value) return '聞き取り中...'
      if (isProcessing.value) return '分析中...'
      return '発音開始'
    })

    // Game Methods
    const launchMagicE = () => {
      if (wordTransformed.value) return
      
      beamActive.value = true
      setTimeout(() => {
        wordTransformed.value = true
        userAnswer.value = currentWord.value.cvce
        beamActive.value = false
        setupImageSelection()
        gamePhase.value = 'selection'
      }, 1000)
    }

    const setupImageSelection = () => {
      const images = currentWord.value.images || []
      const shuffled = [...images].sort(() => Math.random() - 0.5)
      imageChoices.value = shuffled
      // Find correct image using isCorrect flag or by matching the magic E word
      correctImageIndex.value = shuffled.findIndex(img => 
        img.isCorrect === true || img.word === currentWord.value.cvce
      )
      selectedImageIndex.value = null
      showResults.value = false
    }

    const selectImage = (index) => {
      if (showResults.value) return
      selectedImageIndex.value = index
    }

    const checkImageSelection = () => {
      showResults.value = true
      const correct = selectedImageIndex.value === correctImageIndex.value
      
      if (correct) {
        imageCorrectCount.value++
        showFeedback('correct', '正解！素晴らしい選択です！', 'fas fa-check-circle')
        pointsEarned.value = 50
        score.value += pointsEarned.value
      } else {
        showFeedback('incorrect', '惜しい！もう一度選択してみましょう', 'fas fa-times-circle')
      }
    }

    const proceedToPronunciation = () => {
      gamePhase.value = 'pronunciation'
      setupVoiceRecognition()
    }

    const retryImageSelection = () => {
      selectedImageIndex.value = null
      showResults.value = false
    }

    // Enhanced Voice Recognition Setup with Error Handling
    const isVoiceSupported = ref(false)
    const microphonePermission = ref('unknown') // 'granted', 'denied', 'unknown'
    const recognitionError = ref(null)
    
    const checkVoiceSupport = () => {
      return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    }
    
    const checkMicrophonePermission = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'microphone' })
          microphonePermission.value = permission.state
          permission.onchange = () => {
            microphonePermission.value = permission.state
          }
        }
      } catch (error) {
        logger.warn('Could not check microphone permission:', error)
      }
    }
    
    const setupVoiceRecognition = () => {
      isVoiceSupported.value = checkVoiceSupport()
      
      if (!isVoiceSupported.value) {
        voiceFeedback.value = {
          type: 'error',
          icon: 'fas fa-exclamation-triangle',
          message: 'このブラウザは音声認識に対応していません。スキップボタンを使用してください。'
        }
        return
      }
      
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition.value = new SpeechRecognition()
        
        // Enhanced configuration for better mobile support
        recognition.value.continuous = false
        recognition.value.interimResults = false
        recognition.value.lang = 'en-US'
        recognition.value.maxAlternatives = 5
        
        // Mobile-specific adjustments
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          recognition.value.grammars = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)()
          const grammar = '#JSGF V1.0; grammar magicE; public <word> = ' + 
            currentWords.value.map(w => w.magicE).join(' | ') + ' ;'
          recognition.value.grammars.addFromString(grammar, 1)
        }

        recognition.value.onstart = () => {
          isListening.value = true
          isProcessing.value = false
          recognitionError.value = null
          voiceFeedback.value = {
            type: 'listening',
            icon: 'fas fa-microphone',
            message: '聞いています... はっきりと発音してください'
          }
        }

        recognition.value.onresult = (event) => {
          isListening.value = false
          isProcessing.value = true
          
          voiceFeedback.value = {
            type: 'processing',
            icon: 'fas fa-spinner fa-spin',
            message: '音声を分析しています...'
          }
          
          const results = Array.from(event.results[0])
          const transcript = results[0].transcript.toLowerCase().trim()
          const confidence = results[0].confidence || 0.5 // Fallback confidence
          
          logger.log('Speech Recognition Result:', { transcript, confidence, alternatives: results.map(r => ({ transcript: r.transcript, confidence: r.confidence })) })
          
          // Process with slight delay for better UX
          setTimeout(() => {
            processVoiceResult(transcript, confidence, results)
            isProcessing.value = false
          }, 800)
        }

        recognition.value.onerror = (event) => {
          isListening.value = false
          isProcessing.value = false
          recognitionError.value = event.error
          
          let errorMessage = '音声認識エラーが発生しました。'
          let errorIcon = 'fas fa-exclamation-triangle'
          
          switch (event.error) {
            case 'no-speech':
              errorMessage = '音声が検出されませんでした。もう一度お試しください。'
              errorIcon = 'fas fa-microphone-slash'
              break
            case 'audio-capture':
              errorMessage = 'マイクに問題があります。設定を確認してください。'
              errorIcon = 'fas fa-microphone-slash'
              break
            case 'not-allowed':
              errorMessage = 'マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。'
              errorIcon = 'fas fa-ban'
              break
            case 'network':
              errorMessage = 'ネットワークエラーです。接続を確認してください。'
              errorIcon = 'fas fa-wifi'
              break
            case 'service-not-allowed':
              errorMessage = '音声認識サービスが利用できません。'
              errorIcon = 'fas fa-ban'
              break
            default:
              errorMessage = `音声認識エラー: ${event.error}`
          }
          
          voiceFeedback.value = {
            type: 'error',
            icon: errorIcon,
            message: errorMessage
          }
        }

        recognition.value.onend = () => {
          isListening.value = false
          if (!isProcessing.value && !voiceFeedback.value) {
            voiceFeedback.value = {
              type: 'info',
              icon: 'fas fa-info-circle',
              message: '音声認識が終了しました。もう一度お試しください。'
            }
          }
        }
      } catch (error) {
        logger.error('Voice recognition setup error:', error)
        voiceFeedback.value = {
          type: 'error',
          icon: 'fas fa-exclamation-triangle',
          message: '音声認識の初期化に失敗しました。'
        }
      }
    }

    const startVoiceRecognition = () => {
      if (!recognition.value) {
        setupVoiceRecognition()
      }
      
      if (recognition.value && !isListening.value && !isProcessing.value) {
        voiceAttempts.value++
        voiceFeedback.value = null
        try {
          recognition.value.start()
        } catch (error) {
          logger.error('Speech recognition error:', error)
        }
      }
    }

    const processVoiceResult = (transcript, confidence, allResults = []) => {
      const targetWord = currentWord.value.cvce.toLowerCase()
      const targetPronunciation = currentWord.value.pronunciation || targetWord
      
      // Check all alternative results for better accuracy
      let bestMatch = { transcript, confidence, similarity: 0 }
      
      // Check primary result
      const primarySimilarity = calculateSimilarity(transcript, targetWord)
      bestMatch.similarity = primarySimilarity
      
      // Check alternative results if available
      if (allResults.length > 1) {
        for (let i = 1; i < Math.min(allResults.length, 3); i++) {
          const altTranscript = allResults[i].transcript.toLowerCase().trim()
          const altConfidence = allResults[i].confidence || 0
          const altSimilarity = calculateSimilarity(altTranscript, targetWord)
          
          if (altSimilarity > bestMatch.similarity || 
              (altSimilarity === bestMatch.similarity && altConfidence > bestMatch.confidence)) {
            bestMatch = {
              transcript: altTranscript,
              confidence: altConfidence,
              similarity: altSimilarity
            }
          }
        }
      }
      
      logger.log('Voice Analysis:', {
        target: targetWord,
        targetPronunciation,
        bestMatch,
        allAlternatives: allResults.map(r => ({
          transcript: r.transcript,
          confidence: r.confidence,
          similarity: calculateSimilarity(r.transcript.toLowerCase(), targetWord)
        }))
      })
      
      // Determine success based on similarity and confidence
      const { transcript: finalTranscript, confidence: finalConfidence, similarity } = bestMatch
      
      // More lenient scoring for children
      const isHighAccuracy = similarity > 0.75 && finalConfidence > 0.7
      const isMediumAccuracy = similarity > 0.6 && finalConfidence > 0.5
      const isLowAccuracy = similarity > 0.4 || finalConfidence > 0.4
      
      if (isHighAccuracy) {
        pronunciationCorrect.value = true
        pronunciationCorrectCount.value++
        voiceFeedback.value = {
          type: 'success',
          icon: 'fas fa-trophy',
          message: '完璧な発音です！素晴らしい！',
          confidence: finalConfidence,
          detectedWord: finalTranscript,
          targetWord: targetWord
        }
        showFeedback('correct', 'Perfect! 発音も完璧です！', 'fas fa-trophy')
        pointsEarned.value = 150 // Higher points for perfect pronunciation
        score.value += pointsEarned.value
        correctCount.value++
        completedWords.value.push(currentWord.value)
        
        // Play success animation
        setTimeout(() => {
          playSuccessAnimation()
        }, 500)
        
      } else if (isMediumAccuracy) {
        pronunciationCorrect.value = true // Still count as correct for children
        pronunciationCorrectCount.value++
        voiceFeedback.value = {
          type: 'success',
          icon: 'fas fa-check-circle',
          message: 'とても良い発音です！',
          confidence: finalConfidence,
          detectedWord: finalTranscript,
          targetWord: targetWord
        }
        showFeedback('correct', 'Great! 良い発音です！', 'fas fa-check')
        pointsEarned.value = 100
        score.value += pointsEarned.value
        correctCount.value++
        completedWords.value.push(currentWord.value)
        
      } else if (isLowAccuracy) {
        voiceFeedback.value = {
          type: 'partial',
          icon: 'fas fa-star-half-alt',
          message: 'もう少し！頑張って！発音例を聞いてもう一度挑戦しましょう。',
          confidence: finalConfidence,
          detectedWord: finalTranscript,
          targetWord: targetWord
        }
        
      } else {
        voiceFeedback.value = {
          type: 'incorrect',
          icon: 'fas fa-redo',
          message: 'もう一度ゆっくり、はっきりと発音してみましょう。',
          confidence: finalConfidence,
          detectedWord: finalTranscript,
          targetWord: targetWord
        }
      }
      
      // Auto-play pronunciation hint for failed attempts
      if (!isHighAccuracy && !isMediumAccuracy && voiceAttempts.value >= 2) {
        setTimeout(() => {
          playCorrectPronunciation()
        }, 2000)
      }
    }

    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1
      
      if (longer.length === 0) return 1.0
      
      const editDistance = levenshteinDistance(longer, shorter)
      return (longer.length - editDistance) / longer.length
    }

    const levenshteinDistance = (str1, str2) => {
      const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0))
      
      for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
      for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
      
      for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
          const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + substitutionCost
          )
        }
      }
      
      return matrix[str2.length][str1.length]
    }

    const playCorrectPronunciation = () => {
      if ('speechSynthesis' in window) {
        // Cancel any existing speech
        speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(currentWord.value.cvce)
        utterance.lang = 'en-US'
        utterance.rate = 0.7 // Slower for children
        utterance.pitch = 1
        utterance.volume = 0.9
        
        // Use a more suitable voice for children if available
        const voices = speechSynthesis.getVoices()
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Female') || voice.name.includes('Karen') || voice.name.includes('Susan'))
        ) || voices.find(voice => voice.lang.startsWith('en'))
        
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
        
        utterance.onstart = () => {
          logger.log('Playing pronunciation example')
        }
        
        utterance.onerror = (error) => {
          logger.error('Speech synthesis error:', error)
        }
        
        speechSynthesis.speak(utterance)
      }
    }
    
    // Success Animation
    const playSuccessAnimation = () => {
      // Add fireworks or star animation class
      document.querySelector('.voice-enhanced-galaxy-game')?.classList.add('success-celebration')
      setTimeout(() => {
        document.querySelector('.voice-enhanced-galaxy-game')?.classList.remove('success-celebration')
      }, 3000)
    }

    const retryPronunciation = () => {
      voiceFeedback.value = null
      pronunciationCorrect.value = false
    }

    const skipPronunciation = () => {
      correctCount.value++
      completedWords.value.push(currentWord.value)
      showFeedback('info', 'スキップしました。次の問題に進みます。', 'fas fa-forward')
      setTimeout(() => {
        nextQuestion()
      }, 2000)
    }

    const nextQuestion = () => {
      if (currentWordIndex.value < totalWords.value - 1) {
        currentWordIndex.value++
        resetQuestion()
      } else {
        completeStage()
      }
    }

    const resetQuestion = () => {
      userAnswer.value = ''
      isCorrect.value = false
      isIncorrect.value = false
      showHint.value = false
      showMeaning.value = false
      wordTransformed.value = false
      beamActive.value = false
      gamePhase.value = 'transformation'
      selectedImageIndex.value = null
      showResults.value = false
      pronunciationCorrect.value = false
      voiceAttempts.value = 0
      voiceFeedback.value = null
      feedbackMessage.value = ''
    }

    const getHint = () => {
      showHint.value = true
    }

    const completeStage = () => {
      stageScore.value = score.value
      stageCleared.value = true
    }

    const nextStage = () => {
      if (currentStage.value < totalStages.value) {
        currentStage.value++
        currentWordIndex.value = 0
        resetStage()
      } else {
        goBack()
      }
    }

    const replayStage = () => {
      currentWordIndex.value = 0
      resetStage()
    }

    const resetStage = () => {
      score.value = 0
      combo.value = 0
      completedWords.value = []
      correctCount.value = 0
      imageCorrectCount.value = 0
      pronunciationCorrectCount.value = 0
      stageCleared.value = false
      resetQuestion()
    }

    const goBack = () => {
      router.push('/sound-adventure')
    }

    const showFeedback = (type, message, icon) => {
      feedbackType.value = type
      feedbackMessage.value = message
      feedbackIcon.value = icon
      
      setTimeout(() => {
        feedbackMessage.value = ''
      }, 3000)
    }

    // Style Generators
    const getStarStyle = (n) => {
      return {
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (Math.random() * 3 + 2) + 's'
      }
    }

    const getParticleStyle = (n) => {
      return {
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 0.5 + 's'
      }
    }

    // Lifecycle
    onMounted(() => {
      resetStage()
      checkMicrophonePermission()
      
      // Load voices for speech synthesis
      if ('speechSynthesis' in window) {
        speechSynthesis.getVoices() // Trigger voice loading
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => {
            logger.log('Voices loaded:', speechSynthesis.getVoices().length)
          }
        }
      }
    })

    onUnmounted(() => {
      if (recognition.value) {
        recognition.value.stop()
      }
    })

    return {
      // State
      score, combo, currentStage, totalStages, currentWordIndex,
      userAnswer, isCorrect, isIncorrect, showHint, showMeaning,
      wordTransformed, beamActive, gamePhase,
      
      // Image Selection
      selectedImageIndex, correctImageIndex, showResults, imageChoices,
      
      // Voice Recognition
      isListening, isProcessing, voiceFeedback, pronunciationCorrect,
      voiceAttempts, isVoiceSupported, microphonePermission, recognitionError,
      
      // Feedback
      feedbackMessage, feedbackType, feedbackIcon, pointsEarned,
      
      // Progress
      completedWords, correctCount, imageCorrectCount, pronunciationCorrectCount,
      stageScore, stageCleared,
      
      // Computed
      currentWord, totalWords, progressPercentage, selectedImage,
      voiceStatus, voiceButtonText,
      
      // Methods
      launchMagicE, selectImage, checkImageSelection, proceedToPronunciation,
      retryImageSelection, startVoiceRecognition, retryPronunciation,
      skipPronunciation, playCorrectPronunciation, nextQuestion, getHint,
      nextStage, replayStage, goBack,
      getStarStyle, getParticleStyle, playSuccessAnimation
    }
  }
}
</script>

<style scoped>
/* Base styles (same as previous version) */
.voice-magic-e-galaxy-game {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  color: white;
  font-family: 'Orbitron', 'Arial', sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Starfield Background */
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* Game Header */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.game-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
  font-weight: bold;
}

.voice-indicator {
  position: relative;
}

.voice-indicator.listening {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid #ff6b6b;
  animation: voicePulse 1s ease-in-out infinite;
}

.voice-indicator.processing {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
}

@keyframes voicePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Galaxy Workspace */
.galaxy-workspace {
  padding: 2rem;
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 80vh;
}

/* Planet Forge (same as before) */
.planet-forge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.forge-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: #64ffda;
  text-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
}

.transformation-chamber {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

/* Word Planets */
.word-planet {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s ease;
}

.word-planet.original {
  background: radial-gradient(circle, #ff6b6b, #ff8e53);
  box-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
}

.word-planet.target {
  background: radial-gradient(circle, #4ecdc4, #44a08d);
  box-shadow: 0 0 30px rgba(78, 205, 196, 0.5);
}

.word-planet.transformed {
  animation: planetTransform 1s ease;
}

.word-planet.correct {
  background: radial-gradient(circle, #a8e6cf, #56ab2f);
  box-shadow: 0 0 50px rgba(168, 230, 207, 0.8);
}

.word-planet.pulsing {
  animation: planetPulse 2s ease-in-out infinite;
}

@keyframes planetTransform {
  0% { transform: scale(1); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes planetPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.planet-surface {
  text-align: center;
  z-index: 2;
  position: relative;
}

.word-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.word-meaning {
  font-size: 0.8rem;
  opacity: 0.8;
}

.planet-rings {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.planet-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { opacity: 0.5; }
  to { opacity: 1; }
}

/* Transformation Beam */
.transformation-beam {
  width: 100px;
  height: 20px;
  background: linear-gradient(90deg, transparent, #64ffda, transparent);
  position: relative;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.transformation-beam.active {
  opacity: 1;
  animation: beamPulse 0.5s ease-in-out infinite;
}

@keyframes beamPulse {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(2); }
}

.beam-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #64ffda;
  border-radius: 50%;
  animation: particleMove 1s ease-in-out infinite;
}

@keyframes particleMove {
  0% { left: 0; opacity: 0; }
  50% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}

/* Magic E Launcher */
.magic-e-launcher {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(100, 255, 218, 0.3);
}

.launcher-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #64ffda;
}

.magic-e-orb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffd93d, #ff6b6b);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 0 30px rgba(255, 217, 61, 0.5);
}

.magic-e-orb.ready {
  animation: orbReady 2s ease-in-out infinite;
}

.magic-e-orb.launched {
  transform: scale(0.5);
  opacity: 0.5;
}

@keyframes orbReady {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.orb-energy {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid rgba(255, 217, 61, 0.5);
  border-radius: 50%;
  animation: energyPulse 1.5s ease-in-out infinite;
}

@keyframes energyPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Word Assembly */
.word-assembly {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.assembly-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  color: #ff6b6b;
}

.letter-slots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.letter-slot {
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.letter-slot.filled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.letter-slot.glowing {
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
  border-color: #64ffda;
}

.letter-slot.magic-e-slot {
  border-color: #ffd93d;
  background: rgba(255, 217, 61, 0.1);
}

.letter-slot.magic-e-slot.active {
  animation: slotReady 2s ease-in-out infinite;
}

@keyframes slotReady {
  0%, 100% { border-color: #ffd93d; }
  50% { border-color: #ff6b6b; }
}

.letter-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem;
  border-radius: 0.3rem;
  backdrop-filter: blur(5px);
}

.letter-card.magic-e {
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.slot-indicator {
  text-align: center;
  color: #ffd93d;
  font-size: 0.8rem;
}

/* Image Selection Area */
.image-selection-area {
  margin-bottom: 2rem;
}

.selection-title {
  text-align: center;
  color: #64ffda;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.image-choice {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.image-choice:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.image-choice.selected {
  border-color: #64ffda;
  background: rgba(100, 255, 218, 0.2);
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
}

.image-choice.correct {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
}

.image-choice.incorrect {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.5);
}

.image-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.choice-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 0.3rem;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 0.5rem;
  border-radius: 0 0 0.3rem 0.3rem;
}

.image-word {
  color: white;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.image-label {
  color: #ccc;
  font-size: 0.9rem;
}

/* Voice Recognition Area */
.voice-recognition-area {
  text-align: center;
  margin-bottom: 2rem;
}

.voice-title {
  color: #ffd93d;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.voice-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.target-image {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid rgba(255, 217, 61, 0.3);
}

.target-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.target-word {
  font-size: 2rem;
  font-weight: bold;
  color: #ffd93d;
  margin-bottom: 0.5rem;
}

.target-meaning {
  color: #ccc;
  font-size: 1.1rem;
}

.voice-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.voice-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  justify-content: center;
}

.voice-btn:not(.listening):not(.processing) {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  color: white;
}

.voice-btn.listening {
  background: linear-gradient(45deg, #f44336, #ff8a65);
  color: white;
  animation: voiceListening 1s ease-in-out infinite;
}

.voice-btn.processing {
  background: linear-gradient(45deg, #ffc107, #ffeb3b);
  color: #333;
}

@keyframes voiceListening {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.voice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.voice-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-feedback {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 300px;
  text-align: center;
}

.feedback-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feedback-icon.success {
  color: #4caf50;
}

.feedback-icon.partial {
  color: #ff9800;
}

.feedback-icon.incorrect {
  color: #f44336;
}

.feedback-icon.error {
  color: #9e9e9e;
}

.feedback-text {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.confidence-meter {
  margin-top: 0.5rem;
}

.confidence-label {
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 0.3rem;
}

.confidence-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: #f44336;
  transition: width 0.5s ease;
}

.confidence-fill.medium {
  background: #ff9800;
}

.confidence-fill.high {
  background: #4caf50;
}

.pronunciation-help {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.help-btn {
  padding: 0.5rem 1rem;
  background: rgba(100, 255, 218, 0.2);
  border: 1px solid #64ffda;
  border-radius: 0.3rem;
  color: #64ffda;
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-btn:hover {
  background: rgba(100, 255, 218, 0.3);
}

.pronunciation-hint {
  color: #ccc;
  font-style: italic;
  text-align: center;
}

/* Action Panel */
.action-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.launch-btn {
  background: linear-gradient(45deg, #ffd93d, #ff6b6b);
  color: white;
}

.check-btn {
  background: linear-gradient(45deg, #64ffda, #4ecdc4);
  color: white;
}

.next-btn {
  background: linear-gradient(45deg, #a8e6cf, #56ab2f);
  color: white;
}

.complete-btn {
  background: linear-gradient(45deg, #81c784, #4caf50);
  color: white;
}

.retry-btn {
  background: linear-gradient(45deg, #ff8a65, #ff5722);
  color: white;
}

.skip-btn {
  background: linear-gradient(45deg, #9e9e9e, #757575);
  color: white;
}

.hint-btn {
  background: linear-gradient(45deg, #ffb74d, #ff9800);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Hint Panel */
.hint-panel {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hint-icon {
  font-size: 1.5rem;
}

.hint-text {
  flex: 1;
  color: #fff3cd;
}

/* Progress System */
.progress-system {
  position: fixed;
  bottom: 1rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.progress-bar {
  flex: 1;
  margin-right: 1rem;
  position: relative;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #64ffda, #4ecdc4);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.phase-indicator {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.phase-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem;
  border-radius: 0.3rem;
  transition: all 0.3s ease;
  opacity: 0.5;
}

.phase-step.active {
  opacity: 1;
  background: rgba(100, 255, 218, 0.2);
  border: 1px solid #64ffda;
}

.phase-step.completed {
  opacity: 1;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #4caf50;
}

.phase-step span {
  font-size: 0.7rem;
  font-weight: bold;
}

/* Feedback System */
.feedback-system {
  position: fixed;
  top: 20%;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 300px;
}

.feedback-system.correct {
  border: 2px solid #4caf50;
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.3);
}

.feedback-system.incorrect {
  border: 2px solid #f44336;
  box-shadow: 0 0 30px rgba(244, 67, 54, 0.3);
}

.feedback-system.info {
  border: 2px solid #2196f3;
  box-shadow: 0 0 30px rgba(33, 150, 243, 0.3);
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-system.correct .feedback-icon {
  color: #4caf50;
}

.feedback-system.incorrect .feedback-icon {
  color: #f44336;
}

.feedback-system.info .feedback-icon {
  color: #2196f3;
}

.feedback-content {
  flex: 1;
}

.feedback-text {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.points-display {
  color: #ffd93d;
  font-size: 1.2rem;
  font-weight: bold;
}

/* Stage Clear Modal */
.stage-clear-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.modal-content.galaxy-theme {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid #64ffda;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 50px rgba(100, 255, 218, 0.3);
}

.clear-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #64ffda;
  text-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
}

.clear-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #64ffda;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.clear-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .galaxy-workspace {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .game-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .transformation-chamber {
    flex-direction: column;
    gap: 1rem;
  }
  
  .word-planet {
    width: 120px;
    height: 120px;
  }
  
  .transformation-beam {
    width: 20px;
    height: 50px;
    transform: rotate(90deg);
  }
  
  .image-grid {
    grid-template-columns: 1fr;
  }
  
  .clear-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .voice-interface {
    gap: 1rem;
  }
  
  .target-img {
    width: 120px;
    height: 120px;
  }
}

/* Animations */
.feedback-enter-active, .feedback-leave-active {
  transition: all 0.5s ease;
}

.feedback-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.feedback-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Enhanced Animation Effects */
.success-celebration {
  position: relative;
  overflow: hidden;
}

.success-celebration::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="20">🎉</text></svg>') repeat;
  animation: fireworks 3s ease-out;
  pointer-events: none;
  z-index: 1000;
}

@keyframes fireworks {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  20% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(1.5) rotate(360deg);
  }
}

/* Enhanced Voice Recognition Animations */
.voice-btn.listening {
  position: relative;
  overflow: hidden;
}

.voice-btn.listening::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, transparent 70%);
  animation: voiceWave 2s ease-in-out infinite;
  transform: translate(-50%, -50%);
}

@keyframes voiceWave {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

/* Rocket Launch Animation */
@keyframes rocketLaunch {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-50px) rotate(10deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-200px) rotate(0deg);
    opacity: 0;
  }
}

.rocket-launch {
  animation: rocketLaunch 2s ease-out forwards;
}

/* Star Sparkle Effect */
@keyframes sparkle {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

.sparkle-effect {
  position: relative;
}

.sparkle-effect::after {
  content: '✨';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  animation: sparkle 1.5s ease-in-out infinite;
}

/* Improved Image Selection Animations */
.image-choice {
  position: relative;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.image-choice:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.image-choice.selected {
  transform: translateY(-5px) scale(1.02);
  animation: selectedPulse 0.6s ease-in-out;
}

@keyframes selectedPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(100, 255, 218, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(100, 255, 218, 0.6);
  }
}

.image-choice.correct {
  animation: correctBounce 0.8s ease-out;
}

@keyframes correctBounce {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.05) rotate(-2deg);
  }
  75% {
    transform: scale(1.08) rotate(1deg);
  }
  100% {
    transform: scale(1.05) rotate(0deg);
  }
}

.image-choice.incorrect {
  animation: incorrectShake 0.5s ease-in-out;
}

@keyframes incorrectShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

/* Enhanced Confidence Meter Animation */
.confidence-fill {
  animation: confidenceFill 1s ease-out;
}

@keyframes confidenceFill {
  0% {
    width: 0;
  }
  100% {
    width: var(--target-width, 0%);
  }
}

/* Loading Dots Animation */
.loading-dots::after {
  content: '';
  display: inline-block;
  width: 20px;
  text-align: left;
  animation: loadingDots 1.5s step-end infinite;
}

@keyframes loadingDots {
  0%, 25% {
    content: '.';
  }
  26%, 50% {
    content: '..';
  }
  51%, 75% {
    content: '...';
  }
  76%, 100% {
    content: '';
  }
}

/* Microphone Permission Warning */
.mic-permission-warning {
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border: 2px solid #ff8a65;
  border-radius: 1rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 107, 107, 0.6);
  }
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .success-celebration::before {
    background-size: 30px 30px;
  }
  
  .voice-btn {
    min-width: 180px;
    padding: 1rem 1.5rem;
  }
  
  .image-choice:hover {
    transform: translateY(-4px) scale(1.02);
  }
  
  .confidence-meter {
    margin-top: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .voice-btn {
    border: 2px solid white;
  }
  
  .image-choice {
    border-width: 3px;
  }
  
  .confidence-fill {
    background: white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .voice-btn.listening::before,
  .sparkle-effect::after,
  .success-celebration::before {
    animation: none;
  }
  
  .image-choice {
    transition: none;
  }
  
  .image-choice:hover {
    transform: none;
  }
}
</style>