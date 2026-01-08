<template>
  <div class="cosmic-sound-chain">
    <!-- ゲームヘッダー -->
    <div class="game-header">
      <div class="level-info">
        <span class="level-label">レベル {{ currentLevel }}</span>
        <span class="group-label">グループ {{ currentGroup }}</span>
      </div>
      <div class="score-display">
        <span class="score">スコア: {{ score }}</span>
        <span class="combo" v-if="combo > 1">{{ combo }}コンボ!</span>
      </div>
      <button @click="$emit('close')" class="close-btn">×</button>
    </div>

    <!-- 宇宙空間ゲームエリア -->
    <div class="space-area" ref="gameArea">
      <!-- 背景の星 -->
      <div class="stars-background">
        <div v-for="n in 50" :key="n" class="star" 
             :style="{ 
               left: Math.random() * 100 + '%', 
               top: Math.random() * 100 + '%',
               animationDelay: Math.random() * 3 + 's'
             }"></div>
      </div>

      <!-- 宇宙船 -->
      <div class="spaceship" 
           :style="{ 
             transform: `translate(${spaceshipPos.x}px, ${spaceshipPos.y}px) rotate(${spaceshipRotation}deg)`
           }">
        <img src="/images/spaceship.svg" alt="宇宙船">
        <div class="boost-effect" v-if="isBoost"></div>
      </div>

      <!-- 音素惑星 -->
      <div v-for="(planet, index) in phonemePlanets" 
           :key="planet.id"
           class="phoneme-planet"
           :class="{ 
             'selected': selectedPlanets.includes(planet.id),
             'correct': planet.isCorrect,
             'incorrect': planet.isIncorrect,
             'consonant': planet.type === 'consonant',
             'vowel': planet.type === 'vowel'
           }"
           :style="{ 
             left: planet.x + 'px', 
             top: planet.y + 'px',
             transform: `scale(${planet.scale})`
           }"
           @click="selectPlanet(planet)">
        <span class="phoneme-text">{{ planet.phoneme }}</span>
        <div class="planet-glow"></div>
      </div>

      <!-- 接続ライン -->
      <svg class="connection-lines" v-if="connectionLines.length > 0">
        <path v-for="(line, index) in connectionLines" 
              :key="index"
              :d="line.path"
              class="connection-path"
              :class="{ 'complete': line.complete }"/>
      </svg>

      <!-- 正解時の画像表示 -->
      <transition name="fade">
        <div v-if="showWordImage" class="word-image-display">
          <img :src="currentWordImage" :alt="currentWord">
          <div class="word-text">{{ currentWord }}</div>
        </div>
      </transition>

      <!-- 目標単語表示 -->
      <div class="target-word" v-if="targetWord">
        <span class="target-label">つくる単語:</span>
        <span class="target-text">{{ showTargetWord ? targetWord : '???' }}</span>
      </div>

      <!-- チェーンプレビュー -->
      <div class="chain-preview">
        <div class="chain-container">
          <span v-for="(phoneme, index) in currentChain" 
                :key="index" 
                class="chain-phoneme">
            {{ phoneme }}
            <span v-if="index < currentChain.length - 1" class="plus">+</span>
          </span>
          <span v-if="currentChain.length > 0" class="equals">=</span>
          <span class="result-sound">{{ blendedSound }}</span>
        </div>
      </div>
    </div>

    <!-- コントロールパネル -->
    <div class="controls">
      <button @click="playBlendedSound" 
              :disabled="currentChain.length === 0"
              class="play-sound-btn">
        <span>🔊 音を聞く</span>
      </button>
      <button @click="checkAnswer" 
              :disabled="currentChain.length < minChainLength"
              class="check-btn">
        <span>✓ 確認</span>
      </button>
      <button @click="resetChain" class="reset-btn">
        <span>↻ やり直し</span>
      </button>
      <button @click="showHint" class="hint-btn">
        <span>💡 ヒント</span>
      </button>
    </div>

    <!-- 進捗バー -->
    <div class="progress-bar">
      <div class="progress-fill" 
           :style="{ width: progressPercentage + '%' }"></div>
      <span class="progress-text">{{ completedWords }}/{{ totalWords }}</span>
    </div>

    <!-- キャラクター応援 -->
    <div class="character-cheering" v-if="characterMessage">
      <img src="/images/character-happy.svg" alt="キャラクター">
      <div class="message-bubble">{{ characterMessage }}</div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameSounds } from '@/composables/useGameSounds'

// ジョリーフォニックスのグループ定義
const JOLLY_PHONICS_GROUPS = {
  1: ['s', 'a', 't', 'i', 'p', 'n'],
  2: ['c', 'k', 'e', 'h', 'r', 'm', 'd'],
  3: ['g', 'o', 'u', 'l', 'f', 'b'],
  4: ['ai', 'j', 'oa', 'ie', 'ee', 'or'],
  5: ['z', 'w', 'ng', 'v', 'oo', 'oo'],
  6: ['y', 'x', 'ch', 'sh', 'th', 'th'],
  7: ['qu', 'ou', 'oi', 'ue', 'er', 'ar']
}

// レベル別の単語データ
const WORD_PATTERNS = {
  level1: { // 2文字 (CV)
    patterns: ['sa', 'ta', 'pa', 'si', 'ti', 'pi'],
    images: false
  },
  level2: { // 3文字 (CVC)
    patterns: ['sat', 'pat', 'tap', 'pin', 'tin', 'pan'],
    images: true,
    imageMap: {
      'sat': '/images/vocabulary/sit.jpg',
      'pat': '/images/vocabulary/pat.jpg',
      'tap': '/images/vocabulary/tap.jpg',
      'pin': '/images/vocabulary/pin.jpg',
      'tin': '/images/vocabulary/tin.jpg',
      'pan': '/images/vocabulary/pan.jpg'
    }
  },
  level3: { // 4文字 (CVCC, CCVC)
    patterns: ['sand', 'hand', 'jump', 'help', 'tent', 'lamp'],
    images: true,
    imageMap: {
      'sand': '/images/vocabulary/sand.jpg',
      'hand': '/images/vocabulary/hand.jpg',
      'jump': '/images/vocabulary/jump.jpg',
      'help': '/images/vocabulary/help.jpg',
      'tent': '/images/vocabulary/tent.jpg',
      'lamp': '/images/vocabulary/lamp.jpg'
    }
  }
}

export default {
  name: 'CosmicSoundChain',
  emits: ['close', 'complete'],
  props: {
    initialLevel: {
      type: Number,
      default: 1
    },
    initialGroup: {
      type: Number,
      default: 1
    }
  },
  setup(props, { emit }) {
    const { playSound, playCorrect, playIncorrect } = useGameSounds()
    
    // ゲーム状態
    const currentLevel = ref(props.initialLevel)
    const currentGroup = ref(props.initialGroup)
    const score = ref(0)
    const combo = ref(0)
    const completedWords = ref(0)
    const totalWords = ref(10)
    
    // 宇宙船の位置
    const spaceshipPos = ref({ x: 100, y: 200 })
    const spaceshipRotation = ref(0)
    const isBoost = ref(false)
    
    // 音素惑星
    const phonemePlanets = ref([])
    const selectedPlanets = ref([])
    const currentChain = ref([])
    const blendedSound = ref('')
    
    // 接続ライン
    const connectionLines = ref([])
    
    // 目標単語
    const targetWord = ref('')
    const showTargetWord = ref(false)
    const minChainLength = ref(2)
    
    // 画像表示
    const showWordImage = ref(false)
    const currentWordImage = ref('')
    const currentWord = ref('')
    
    // キャラクターメッセージ
    const characterMessage = ref('')
    
    // 進捗率
    const progressPercentage = computed(() => {
      return (completedWords.value / totalWords.value) * 100
    })
    
    // 音素惑星を生成
    const generatePhonemePlanets = () => {
      const availablePhonemes = JOLLY_PHONICS_GROUPS[currentGroup.value] || JOLLY_PHONICS_GROUPS[1]
      const planets = []
      
      // 現在のレベルに応じた単語パターンを取得
      const levelKey = `level${currentLevel.value}`
      const wordPattern = WORD_PATTERNS[levelKey]
      
      if (wordPattern) {
        // ランダムに目標単語を選択
        const randomWord = wordPattern.patterns[Math.floor(Math.random() * wordPattern.patterns.length)]
        targetWord.value = randomWord
        minChainLength.value = randomWord.length
        logger.log('🎯 New target word:', randomWord, 'Length:', randomWord.length)
        
        // 目標単語の音素を惑星として配置
        const wordPhonemes = randomWord.split('')
        wordPhonemes.forEach((phoneme, index) => {
          const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(phoneme)
          planets.push({
            id: `planet-${index}`,
            phoneme: phoneme,
            type: isVowel ? 'vowel' : 'consonant',
            x: 150 + (index * 120) + Math.random() * 40 - 20,
            y: 100 + Math.random() * 200,
            scale: 1,
            isCorrect: false,
            isIncorrect: false
          })
        })
        
        // ダミーの音素も追加（難易度調整）- 目標単語に含まれない音素のみ
        if (currentLevel.value > 1) {
          const targetPhonemes = randomWord.split('')
          const availableDummyPhonemes = availablePhonemes.filter(phoneme => 
            !targetPhonemes.includes(phoneme)
          )
          
          for (let i = 0; i < Math.min(2, availableDummyPhonemes.length); i++) {
            const dummyPhoneme = availableDummyPhonemes[Math.floor(Math.random() * availableDummyPhonemes.length)]
            const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(dummyPhoneme)
            planets.push({
              id: `dummy-${i}`,
              phoneme: dummyPhoneme,
              type: isVowel ? 'vowel' : 'consonant',
              x: 150 + Math.random() * 400,
              y: 100 + Math.random() * 200,
              scale: 0.9,
              isCorrect: false,
              isIncorrect: false
            })
          }
        }
      }
      
      // シャッフル配置
      planets.sort(() => Math.random() - 0.5)
      phonemePlanets.value = planets
    }
    
    // 惑星を選択
    const selectPlanet = (planet) => {
      if (selectedPlanets.value.includes(planet.id)) {
        return
      }
      
      selectedPlanets.value.push(planet.id)
      currentChain.value.push(planet.phoneme)
      
      // 宇宙船を移動
      moveSpaceshipTo(planet.x, planet.y)
      
      // ブレンド音を更新
      updateBlendedSound()
      
      // 接続ラインを追加
      addConnectionLine(planet)
      
      // サウンド再生
      playSound('select')
      
      // 個別音素の発音
      setTimeout(() => {
        playPhonemeSound(planet.phoneme)
      }, 200) // 選択音の後に再生
    }
    
    // 宇宙船を移動
    const moveSpaceshipTo = (x, y) => {
      const dx = x - spaceshipPos.value.x
      const dy = y - spaceshipPos.value.y
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      
      spaceshipRotation.value = angle
      spaceshipPos.value = { x, y }
      
      // ブースト効果
      isBoost.value = true
      setTimeout(() => {
        isBoost.value = false
      }, 300)
    }
    
    // ブレンド音を更新
    const updateBlendedSound = () => {
      blendedSound.value = currentChain.value.join('')
    }
    
    // 接続ラインを追加
    const addConnectionLine = (planet) => {
      if (selectedPlanets.value.length > 1) {
        const prevPlanetId = selectedPlanets.value[selectedPlanets.value.length - 2]
        const prevPlanet = phonemePlanets.value.find(p => p.id === prevPlanetId)
        
        if (prevPlanet) {
          const path = `M ${prevPlanet.x} ${prevPlanet.y} L ${planet.x} ${planet.y}`
          connectionLines.value.push({
            path,
            complete: false
          })
        }
      }
    }
    
    // 全てのオーディオを停止
    const stopAllAudio = () => {
      // 音声合成を停止
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
    
    // ブレンド音を再生（段階的ブレンディング学習）- 統一音声合成使用
    const playBlendedSound = async () => {
      try {
        // 既存の音声を停止
        stopAllAudio()
        window.speechSynthesis.cancel()
        
        const phonemes = blendedSound.value.split('')
        logger.log('Playing blended sound:', phonemes)
        
        // ステップ1: 個別音素をゆっくり再生
        logger.log('Step 1: Individual phonemes')
        for (let i = 0; i < phonemes.length; i++) {
          const phoneme = phonemes[i].toLowerCase()
          await playTextToSpeech(phoneme, { rate: 0.6, pause: 600 })
        }
        
        // 短い休憩
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // ステップ2: より速くつなげて再生
        logger.log('Step 2: Faster blending')
        for (let i = 0; i < phonemes.length; i++) {
          const phoneme = phonemes[i].toLowerCase()
          setTimeout(() => {
            playTextToSpeech(phoneme, { rate: 0.8, pause: 0 })
          }, i * 250)
        }
        
        // 少し待つ
        await new Promise(resolve => setTimeout(resolve, phonemes.length * 250 + 800))
        
        // ステップ3: 実際の単語として発音
        logger.log('Step 3: Complete word')
        await playTextToSpeech(blendedSound.value, { rate: 0.8, pause: 0 })
        
      } catch (error) {
        logger.warn('Audio playback failed:', error)
        // フォールバック：音声合成のみ
        await playTextToSpeech(blendedSound.value)
      }
    }
    
    
    // フォニックス音韻マッピング（文字名ではなく音韻音）
    const getPhoneticSound = (text) => {
      // 個別文字の音韻変換
      if (text.length === 1) {
        const phoneticMap = {
          // 子音の音韻表現
          'b': 'buh',
          'c': 'kuh', 
          'd': 'duh',
          'f': 'fuh',
          'g': 'guh',
          'h': 'huh',
          'j': 'juh',
          'k': 'kuh',
          'l': 'luh',
          'm': 'muh',
          'n': 'nuh',
          'p': 'puh',
          'qu': 'kwuh',
          'r': 'ruh',
          's': 'suh',
          't': 'tuh',
          'v': 'vuh',
          'w': 'wuh',
          'x': 'kss',
          'y': 'yuh',
          'z': 'zuh',
          'ch': 'chuh',
          'sh': 'shuh',
          'th': 'thuh',
          'ng': 'nguh',
          
          // 短母音
          'a': 'ah',
          'e': 'eh', 
          'i': 'ih',
          'o': 'oh',
          'u': 'uh'
        }
        
        const phoneme = text.toLowerCase()
        return phoneticMap[phoneme] || text
      }
      
      // 複数文字の場合はそのまま返す（単語として発音）
      return text
    }
    
    // 統一音声合成関数
    const playTextToSpeech = (text, options = {}) => {
      return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
          // 音韻表記に変換
          const phoneticText = getPhoneticSound(text)
          logger.log(`Speaking: "${text}" as "${phoneticText}"`)
          
          const utterance = new SpeechSynthesisUtterance(phoneticText)
          utterance.lang = 'en-US'
          utterance.rate = options.rate || 0.7
          utterance.pitch = options.pitch || 1.0
          utterance.volume = options.volume || 0.8
          
          // 適切な声を選択
          const voices = window.speechSynthesis.getVoices()
          const preferredVoice = voices.find(voice => 
            voice.lang.includes('en') && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft'))
          )
          if (preferredVoice) {
            utterance.voice = preferredVoice
          }
          
          utterance.onend = () => {
            if (options.pause) {
              setTimeout(resolve, options.pause)
            } else {
              resolve()
            }
          }
          
          utterance.onerror = () => {
            logger.warn(`Failed to speak: ${phoneticText}`)
            if (options.pause) {
              setTimeout(resolve, options.pause)
            } else {
              resolve()
            }
          }
          
          // タイムアウト設定
          setTimeout(() => {
            resolve()
          }, 5000)
          
          window.speechSynthesis.speak(utterance)
        } else {
          resolve()
        }
      })
    }
    
    // 個別音素の発音（惑星選択時用）- Web Speech API使用
    const playPhonemeSound = (phoneme) => {
      // 既存の音声を停止してから新しい音を再生
      stopAllAudio()
      playTextToSpeech(phoneme.toLowerCase())
    }
    
    // 答えをチェック
    const checkAnswer = () => {
      const answer = currentChain.value.join('')
      logger.log('🔍 Checking answer:', answer, 'vs target:', targetWord.value)
      logger.log('Current chain:', currentChain.value)
      logger.log('Min chain length:', minChainLength.value)
      
      if (answer === targetWord.value) {
        logger.log('✅ Correct answer!')
        // 正解処理
        handleCorrectAnswer()
      } else {
        logger.log('❌ Incorrect answer')
        // 不正解処理
        handleIncorrectAnswer()
      }
    }
    
    // 正解処理
    const handleCorrectAnswer = () => {
      playCorrect()
      score.value += 100 * (combo.value + 1)
      combo.value++
      completedWords.value++
      
      // 接続ラインを完成させる
      connectionLines.value.forEach(line => {
        line.complete = true
      })
      
      // 画像を表示（レベル2以上）
      if (currentLevel.value >= 2) {
        const levelKey = `level${currentLevel.value}`
        const wordPattern = WORD_PATTERNS[levelKey]
        if (wordPattern.images && wordPattern.imageMap[targetWord.value]) {
          currentWordImage.value = wordPattern.imageMap[targetWord.value]
          currentWord.value = targetWord.value
          showWordImage.value = true
          
          setTimeout(() => {
            showWordImage.value = false
          }, 2000)
        }
      }
      
      // キャラクターメッセージ
      const messages = [
        'すごい！よくできました！',
        'パーフェクト！',
        'その調子！',
        'ばっちり！',
        'えらい！'
      ]
      characterMessage.value = messages[Math.floor(Math.random() * messages.length)]
      
      setTimeout(() => {
        characterMessage.value = ''
        resetChain()
        generatePhonemePlanets()
      }, 2500)
      
      // レベルアップチェック
      if (completedWords.value >= totalWords.value) {
        handleLevelComplete()
      }
    }
    
    // 不正解処理
    const handleIncorrectAnswer = () => {
      playIncorrect()
      combo.value = 0
      
      // 惑星を赤く光らせる
      selectedPlanets.value.forEach(planetId => {
        const planet = phonemePlanets.value.find(p => p.id === planetId)
        if (planet) {
          planet.isIncorrect = true
          setTimeout(() => {
            planet.isIncorrect = false
          }, 1000)
        }
      })
      
      // キャラクターメッセージ
      characterMessage.value = 'もう一度チャレンジしてみよう！'
      
      setTimeout(() => {
        characterMessage.value = ''
        resetChain()
      }, 2000)
    }
    
    // チェーンをリセット
    const resetChain = () => {
      selectedPlanets.value = []
      currentChain.value = []
      blendedSound.value = ''
      connectionLines.value = []
      
      // 宇宙船を初期位置に戻す
      spaceshipPos.value = { x: 100, y: 200 }
      spaceshipRotation.value = 0
    }
    
    // ヒントを表示
    const showHint = () => {
      showTargetWord.value = true
      setTimeout(() => {
        showTargetWord.value = false
      }, 3000)
      
      // 最初の音素をハイライト
      if (currentChain.value.length === 0 && targetWord.value) {
        const firstPhoneme = targetWord.value[0]
        const hintPlanet = phonemePlanets.value.find(p => p.phoneme === firstPhoneme)
        if (hintPlanet) {
          hintPlanet.scale = 1.3
          setTimeout(() => {
            hintPlanet.scale = 1
          }, 1500)
        }
      }
    }
    
    // レベルクリア処理
    const handleLevelComplete = () => {
      playCorrect()
      
      // 次のレベルへ
      if (currentLevel.value < 3) {
        currentLevel.value++
        completedWords.value = 0
        characterMessage.value = `レベル${currentLevel.value}へ進みます！`
        
        setTimeout(() => {
          characterMessage.value = ''
          generatePhonemePlanets()
        }, 2000)
      } else if (currentGroup.value < 7) {
        // 次のグループへ
        currentGroup.value++
        currentLevel.value = 1
        completedWords.value = 0
        characterMessage.value = `グループ${currentGroup.value}へ進みます！`
        
        setTimeout(() => {
          characterMessage.value = ''
          generatePhonemePlanets()
        }, 2000)
      } else {
        // ゲームクリア
        emit('complete', {
          score: score.value,
          group: currentGroup.value,
          level: currentLevel.value
        })
      }
    }
    
    // 初期化
    onMounted(() => {
      generatePhonemePlanets()
    })
    
    // クリーンアップ
    onUnmounted(() => {
      stopAllAudio()
    })
    
    return {
      currentLevel,
      currentGroup,
      score,
      combo,
      completedWords,
      totalWords,
      progressPercentage,
      spaceshipPos,
      spaceshipRotation,
      isBoost,
      phonemePlanets,
      selectedPlanets,
      currentChain,
      blendedSound,
      connectionLines,
      targetWord,
      showTargetWord,
      minChainLength,
      showWordImage,
      currentWordImage,
      currentWord,
      characterMessage,
      selectPlanet,
      playBlendedSound,
      playPhonemeSound,
      playTextToSpeech,
      getPhoneticSound,
      stopAllAudio,
      checkAnswer,
      resetChain,
      showHint
    }
  }
}
</script>

<style scoped>
.cosmic-sound-chain {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%);
  overflow: hidden;
  font-family: 'Noto Sans JP', sans-serif;
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
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.level-info {
  display: flex;
  gap: 20px;
  font-size: 18px;
  color: #fff;
}

.level-label, .group-label {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.score-display {
  display: flex;
  gap: 20px;
  align-items: center;
}

.score {
  font-size: 24px;
  color: #ffd700;
  font-weight: bold;
}

.combo {
  font-size: 20px;
  color: #ff6b6b;
  animation: pulse 0.5s ease-in-out;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 宇宙空間エリア */
.space-area {
  position: relative;
  width: 100%;
  height: calc(100% - 180px);
  margin-top: 80px;
}

/* 星の背景 */
.stars-background {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 宇宙船 */
.spaceship {
  position: absolute;
  width: 60px;
  height: 60px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
}

.spaceship img {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.8));
}

.boost-effect {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 40px;
  background: linear-gradient(180deg, #ff6b6b, #ffd700, transparent);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: boost 0.3s ease-out;
}

@keyframes boost {
  0% { 
    opacity: 0;
    transform: translateX(-50%) scaleY(0.5);
  }
  50% { 
    opacity: 1;
    transform: translateX(-50%) scaleY(1.2);
  }
  100% { 
    opacity: 0;
    transform: translateX(-50%) scaleY(0.8);
  }
}

/* 音素惑星 */
.phoneme-planet {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 30;
}

.phoneme-planet.consonant {
  background: radial-gradient(circle at 30% 30%, #6b5b95, #4a4063);
  border: 3px solid #8b7bb8;
}

.phoneme-planet.vowel {
  background: radial-gradient(circle at 30% 30%, #ff6b6b, #ff4757);
  border: 3px solid #ff8787;
}

.phoneme-planet.selected {
  transform: scale(1.2);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
}

.phoneme-planet.correct {
  animation: correctPulse 0.5s ease;
  background: radial-gradient(circle at 30% 30%, #4caf50, #2e7d32) !important;
}

.phoneme-planet.incorrect {
  animation: shake 0.5s ease;
  background: radial-gradient(circle at 30% 30%, #f44336, #c62828) !important;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.phoneme-text {
  font-size: 28px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 2;
  position: relative;
}

.planet-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* 接続ライン */
.connection-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

.connection-path {
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 3;
  fill: none;
  stroke-dasharray: 10, 5;
  animation: dash 20s linear infinite;
}

.connection-path.complete {
  stroke: #ffd700;
  stroke-width: 4;
  stroke-dasharray: none;
  filter: drop-shadow(0 0 10px #ffd700);
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}

/* 単語画像表示 */
.word-image-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  text-align: center;
  animation: fadeInScale 0.5s ease;
}

.word-image-display img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 20px;
  border: 4px solid #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
}

.word-text {
  margin-top: 10px;
  font-size: 32px;
  color: #ffd700;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 目標単語表示 */
.target-word {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 90;
}

.target-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-right: 10px;
}

.target-text {
  color: #ffd700;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
}

/* チェーンプレビュー */
.chain-preview {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  z-index: 90;
}

.chain-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  color: white;
}

.chain-phoneme {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-weight: bold;
}

.plus {
  margin-left: 10px;
  color: #ffd700;
}

.equals {
  color: #ffd700;
  font-size: 28px;
  margin: 0 10px;
}

.result-sound {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  font-weight: bold;
  font-size: 28px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* コントロールパネル */
.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 100;
}

.controls button {
  padding: 12px 24px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.play-sound-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.play-sound-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.check-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.check-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
}

.reset-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 107, 107, 0.4);
}

.hint-btn {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
}

.hint-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 進捗バー */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 10px;
  top: -25px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

/* キャラクター応援 */
.character-cheering {
  position: absolute;
  bottom: 200px;
  right: 30px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  animation: bounceIn 0.5s ease;
  z-index: 80;
}

.character-cheering img {
  width: 80px;
  height: 80px;
  animation: bounce 2s infinite;
}

.message-bubble {
  padding: 10px 20px;
  background: white;
  border-radius: 20px;
  color: #333;
  font-weight: bold;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.message-bubble::after {
  content: '';
  position: absolute;
  bottom: 10px;
  right: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid white;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .phoneme-planet {
    width: 60px;
    height: 60px;
  }
  
  .phoneme-text {
    font-size: 20px;
  }
  
  .controls {
    flex-wrap: wrap;
    bottom: 10px;
  }
  
  .controls button {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .chain-container {
    font-size: 18px;
  }
  
  .result-sound {
    font-size: 20px;
  }
}

/* フェードトランジション */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>