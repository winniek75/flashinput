// src/composables/useGameSounds.js - 完全自動生成版音響システム
import { ref, onMounted, onUnmounted } from 'vue'
import logger from '@/utils/logger'

export function useGameSounds() {
  const isEnabled = ref(true)
  const volume = ref(0.7)
  const audioContext = ref(null)
  const isInitialized = ref(false)
  const bgmAudio = ref(null)
  const bgmOscillators = ref([])

  // 音響パラメータ定義（すべて自動生成）
  const soundDefinitions = {
    // 効果音
    whoosh: {
      type: 'sweep',
      startFreq: 200,
      endFreq: 800,
      duration: 600,
      waveType: 'sawtooth',
      description: '単語飛来音 "ヒュー"'
    },
    correct: {
      type: 'chord',
      frequencies: [523, 659, 784], // C-E-G
      duration: 400,
      waveType: 'sine',
      description: '正解音（和音）'
    },
    incorrect: {
      type: 'buzz',
      frequency: 150,
      duration: 600,
      waveType: 'square',
      description: '不正解音（ブザー）'
    },
    click: {
      type: 'pop',
      frequency: 800,
      duration: 80,
      waveType: 'sine',
      description: 'ボタンクリック音'
    },
    countdown: {
      type: 'beep',
      frequency: 880,
      duration: 150,
      waveType: 'square',
      description: 'カウントダウン音'
    },
    gameStart: {
      type: 'fanfare',
      frequencies: [523, 659, 784, 1047], // C-E-G-C
      duration: 800,
      waveType: 'triangle',
      description: 'ゲーム開始ファンファーレ'
    },
    gameEnd: {
      type: 'descend',
      startFreq: 800,
      endFreq: 200,
      duration: 1000,
      waveType: 'sine',
      description: 'ゲーム終了音'
    },
    combo: {
      type: 'sparkle',
      frequencies: [1047, 1319, 1568], // C-E-G（高音）
      duration: 250,
      waveType: 'sine',
      description: 'コンボ音（キラキラ）'
    },
    levelUp: {
      type: 'achievement',
      frequencies: [523, 659, 784, 1047, 1319], // 上昇音階
      duration: 600,
      waveType: 'triangle',
      description: 'レベルアップ音'
    },
    newRecord: {
      type: 'victory',
      frequencies: [1047, 1047, 1047, 1319], // 勝利音
      duration: 1200,
      waveType: 'sine',
      description: '新記録音'
    },
    select: {
      type: 'pop',
      frequency: 600,
      duration: 120,
      waveType: 'sine',
      description: '選択音（惑星クリック時）'
    },
    hover: {
      type: 'pop',
      frequency: 400,
      duration: 60,
      waveType: 'triangle',
      description: 'ホバー音'
    },
    connect: {
      type: 'sweep',
      startFreq: 300,
      endFreq: 500,
      duration: 200,
      waveType: 'sine',
      description: '接続音（惑星間の線）'
    }
  }

  // BGM用の和音進行（自動生成）- 宇宙・SF風
  const bgmChordProgression = [
    [82, 123, 164, 246],   // E (低音ベース・神秘的)
    [87, 130, 174, 261],   // F (浮遊感)
    [73, 110, 146, 220],   // D (深宇宙)
    [98, 147, 196, 294],   // G (展開)
    [65, 98, 130, 195],    // C (ダークな低音)
    [77, 116, 155, 233],   // Eb (異次元感)
    [92, 138, 185, 277],   // F# (緊張感)
    [82, 123, 164, 246]    // E (回帰)
  ]

  // Rush Zone用のポップで楽しいBGM進行（明るく弾むような音楽）
  const rushZoneBgmProgression = [
    [261, 329, 392, 523],   // C (明るいベース・ドミソド)
    [349, 440, 523, 659],   // F (弾むような・ファラドミ)
    [392, 493, 587, 784],   // G (エネルギッシュ・ソシレソ)
    [261, 329, 392, 523],   // C (リフレイン)
    [440, 554, 659, 880],   // A (高揚感・ラドミラ)
    [349, 440, 523, 659],   // F (楽しい展開)
    [392, 493, 587, 784],   // G (クライマックス)
    [261, 329, 392, 523]    // C (解決)
  ]

  // ポップなアルペジオパターン（Rush Zone用）
  const rushArpeggioPattern = [
    { freq: 261, delay: 0 },     // C
    { freq: 329, delay: 100 },   // E
    { freq: 392, delay: 200 },   // G
    { freq: 523, delay: 300 },   // C (octave)
    { freq: 392, delay: 400 },   // G
    { freq: 329, delay: 500 }    // E
  ]

  // Web Audio API初期化
  const initializeAudio = async () => {
    try {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
      isInitialized.value = true
      logger.log('🎵 Web Audio API initialized (full auto-generation mode)')
      return true
    } catch (error) {
      logger.warn('Audio initialization failed:', error)
      return false
    }
  }

  // 基本トーン生成
  const createTone = (frequency, duration, type = 'sine', volumeMultiplier = 1) => {
    if (!audioContext.value) return Promise.resolve()

    return new Promise((resolve) => {
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.value.currentTime)
      oscillator.type = type

      const finalVolume = volume.value * volumeMultiplier

      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(finalVolume, audioContext.value.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration / 1000)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration / 1000)

      setTimeout(resolve, duration)
    })
  }

  // 周波数スイープ（ヒュー音用）
  const createSweep = (startFreq, endFreq, duration, waveType = 'sawtooth') => {
    if (!audioContext.value) return Promise.resolve()

    return new Promise((resolve) => {
      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.type = waveType
      oscillator.frequency.setValueAtTime(startFreq, audioContext.value.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.value.currentTime + duration / 1000)

      gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume.value * 0.3, audioContext.value.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration / 1000)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration / 1000)

      setTimeout(resolve, duration)
    })
  }

  // 和音生成
  const createChord = (frequencies, duration, waveType = 'sine', volumeMultiplier = 0.6) => {
    if (!audioContext.value || !frequencies.length) return Promise.resolve()

    const promises = frequencies.map((freq, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          createTone(freq, duration, waveType, volumeMultiplier / frequencies.length)
          resolve()
        }, index * 50) // 少しずつずらして豊かな響きに
      })
    })

    return Promise.all(promises)
  }

  // 音階シーケンス生成
  const createSequence = (frequencies, noteDuration, waveType = 'sine') => {
    if (!audioContext.value) return Promise.resolve()

    return frequencies.reduce((promise, freq, index) => {
      return promise.then(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            createTone(freq, noteDuration, waveType, 0.5)
            resolve()
          }, index * (noteDuration * 0.8)) // 少し重ねる
        })
      })
    }, Promise.resolve())
  }

  // BGM生成（和音進行のループ）
  const generateBGM = (isRushZone = false) => {
    if (!audioContext.value || !isEnabled.value) return

    const chordProgression = isRushZone ? rushZoneBgmProgression : bgmChordProgression
    const tempo = isRushZone ? 800 : 1500 // Rush Zoneは速いテンポ
    const chordDuration = isRushZone ? 1200 : 3000 // Rush Zoneは短い持続時間

    const playChord = (chordFreqs, duration) => {
      const oscillators = chordFreqs.map((freq, index) => {
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()
        const filter = audioContext.value.createBiquadFilter()
        const panner = audioContext.value.createStereoPanner()

        // 接続: oscillator -> filter -> panner -> gain -> destination
        oscillator.connect(filter)
        filter.connect(panner)
        panner.connect(gainNode)
        gainNode.connect(audioContext.value.destination)

        oscillator.frequency.setValueAtTime(freq, audioContext.value.currentTime)
        
        // 音色の設定（Rush Zoneは明るくポップな音色）
        if (isRushZone) {
          // Rush Zone用の明るいポップな音色
          if (index === 0) {
            oscillator.type = 'square' // パンチのあるベース
            gainNode.gain.setValueAtTime(volume.value * 0.15, audioContext.value.currentTime)
          } else if (index === 1) {
            oscillator.type = 'sawtooth' // 明るい中音域
            gainNode.gain.setValueAtTime(volume.value * 0.12, audioContext.value.currentTime)
          } else {
            oscillator.type = 'sine' // クリアな高音
            gainNode.gain.setValueAtTime(volume.value * 0.10, audioContext.value.currentTime)
          }
        } else {
          // 通常の宇宙的な音色
          if (index === 0) {
            oscillator.type = 'sawtooth' // ベース音（太い音）
            gainNode.gain.setValueAtTime(volume.value * 0.12, audioContext.value.currentTime)
          } else if (index === 1) {
            oscillator.type = 'triangle' // 中音域（温かみ）
            gainNode.gain.setValueAtTime(volume.value * 0.08, audioContext.value.currentTime)
          } else {
            oscillator.type = 'sine' // 高音域（クリア）
            gainNode.gain.setValueAtTime(volume.value * 0.06, audioContext.value.currentTime)
          }
        }

        // フィルター設定（Rush Zoneは明るく開放的）
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(
          isRushZone ? 2000 + (index * 400) : 600 + (index * 300),
          audioContext.value.currentTime
        )
        filter.Q.setValueAtTime(isRushZone ? 5 : 10, audioContext.value.currentTime)

        // ステレオ効果（音の広がり）
        panner.pan.setValueAtTime((index - 1.5) * 0.3, audioContext.value.currentTime)

        // フェードイン・アウト（Rush Zoneは速いアタック）
        const attackTime = isRushZone ? 0.05 : 0.3
        const releaseTime = isRushZone ? 0.2 : 0.5
        gainNode.gain.exponentialRampToValueAtTime(
          gainNode.gain.value, 
          audioContext.value.currentTime + attackTime
        )
        gainNode.gain.exponentialRampToValueAtTime(
          0.001, 
          audioContext.value.currentTime + duration / 1000 - releaseTime
        )

        oscillator.start(audioContext.value.currentTime)
        oscillator.stop(audioContext.value.currentTime + duration / 1000)

        return oscillator
      })

      return oscillators
    }

    // Rush Zone用のアルペジオ追加
    const playArpeggio = () => {
      if (!isRushZone || !isEnabled.value) return

      rushArpeggioPattern.forEach(({ freq, delay }) => {
        setTimeout(() => {
          if (isEnabled.value) {
            createTone(freq, 200, 'sine', 0.08)
          }
        }, delay)
      })
    }

    const playBGMLoop = () => {
      if (!isEnabled.value) return

      chordProgression.forEach((chord, index) => {
        setTimeout(() => {
          if (isEnabled.value) {
            const oscillators = playChord(chord, chordDuration)
            bgmOscillators.value.push(...oscillators)
            
            // Rush Zoneでアルペジオを追加（リズミカルな要素）
            if (isRushZone && index % 2 === 0) {
              playArpeggio()
            }
          }
        }, index * tempo)
      })

      // ループタイミング調整
      const loopTime = isRushZone ? 6400 : 12000 // Rush Zoneは速いループ
      setTimeout(() => {
        if (isEnabled.value) {
          playBGMLoop()
        }
      }, loopTime)
    }

    playBGMLoop()
  }

  // BGM停止
  const stopBGM = () => {
    bgmOscillators.value.forEach(oscillator => {
      try {
        oscillator.stop()
      } catch (error) {
        // 既に停止済みの場合は無視
      }
    })
    bgmOscillators.value = []
  }

  // メイン音声再生関数
  const playSound = async (soundKey, options = {}) => {
    if (!isEnabled.value || !isInitialized.value) return

    const soundDef = soundDefinitions[soundKey]
    if (!soundDef) {
      logger.warn(`Unknown sound: ${soundKey}`)
      return
    }

    try {
      switch (soundDef.type) {
        case 'sweep':
          await createSweep(soundDef.startFreq, soundDef.endFreq, soundDef.duration, soundDef.waveType)
          break

        case 'chord':
          await createChord(soundDef.frequencies, soundDef.duration, soundDef.waveType)
          break

        case 'buzz':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.4)
          break

        case 'pop':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.6)
          break

        case 'beep':
          await createTone(soundDef.frequency, soundDef.duration, soundDef.waveType, 0.5)
          break

        case 'fanfare':
          await createSequence(soundDef.frequencies, soundDef.duration / soundDef.frequencies.length, soundDef.waveType)
          break

        case 'descend':
          await createSweep(soundDef.startFreq, soundDef.endFreq, soundDef.duration, soundDef.waveType)
          break

        case 'sparkle':
          await createChord(soundDef.frequencies, soundDef.duration, soundDef.waveType, 0.4)
          break

        case 'achievement':
          await createSequence(soundDef.frequencies, soundDef.duration / soundDef.frequencies.length, soundDef.waveType)
          break

        case 'victory':
          // 勝利音は特別に豪華に
          await createChord([soundDef.frequencies[0]], 300, soundDef.waveType)
          setTimeout(() => createChord(soundDef.frequencies, soundDef.duration - 300, soundDef.waveType), 300)
          break

        default:
          await createTone(soundDef.frequency || 440, soundDef.duration || 200, soundDef.waveType || 'sine')
      }
    } catch (error) {
      logger.warn(`Failed to play sound: ${soundKey}`, error)
    }
  }

  // BGM制御
  const playBGM = async (isRushZone = false) => {
    if (!isEnabled.value || !isInitialized.value) return
    stopBGM() // 既存のBGMを停止
    generateBGM(isRushZone)
  }

  // Rush Zone専用BGM
  const playRushZoneBGM = async () => {
    return playBGM(true)
  }

  const pauseBGM = () => stopBGM()

  // 特定ゲーム用の効果音
  const playWhoosh = () => playSound('whoosh')
  const playCorrect = () => playSound('correct')
  const playIncorrect = () => playSound('incorrect')
  const playClick = () => playSound('click')
  const playCountdown = () => playSound('countdown')
  const playGameStart = () => playSound('gameStart')
  const playGameEnd = () => playSound('gameEnd')
  const playCombo = () => playSound('combo')
  const playLevelUp = () => playSound('levelUp')
  const playNewRecord = () => playSound('newRecord')

  // 複合音効果
  const playCorrectCombo = async (comboCount) => {
    await playCorrect()
    if (comboCount >= 5) {
      setTimeout(() => playCombo(), 200)
    }
    if (comboCount >= 10) {
      setTimeout(() => playLevelUp(), 400)
    }
    if (comboCount >= 20) {
      setTimeout(() => playNewRecord(), 600)
    }
  }

  // 動的音効果（単語の難易度によって音を変える）
  const playWordAppear = (difficulty = 1) => {
    const difficultySettings = {
      1: { startFreq: 200, endFreq: 600 },  // 簡単：低い音
      2: { startFreq: 300, endFreq: 800 },  // 普通：中くらいの音
      3: { startFreq: 400, endFreq: 1000 }  // 難しい：高い音
    }

    const setting = difficultySettings[difficulty] || difficultySettings[2]
    createSweep(setting.startFreq, setting.endFreq, 600, 'sawtooth')
  }

  // 音量制御
  const setVolume = (newVolume) => {
    volume.value = Math.max(0, Math.min(1, newVolume))
  }

  const toggleSound = () => {
    isEnabled.value = !isEnabled.value
    if (!isEnabled.value) {
      stopBGM()
    }
  }

  // ユーザージェスチャー後の初期化
  const enableAudioOnUserGesture = async () => {
    if (!isInitialized.value) {
      await initializeAudio()
    }

    if (audioContext.value && audioContext.value.state === 'suspended') {
      await audioContext.value.resume()
    }
  }

  // テスト用サウンドプレビュー
  const testAllSounds = async () => {
    logger.log('🎵 Testing all generated sounds...')

    for (const [soundKey, soundDef] of Object.entries(soundDefinitions)) {
      logger.log(`🔊 Playing: ${soundKey} - ${soundDef.description}`)
      await playSound(soundKey)
      await new Promise(resolve => setTimeout(resolve, 800)) // 間隔を空ける
    }

    logger.log('✅ Sound test completed')
  }

  // サウンド一覧取得
  const getSoundList = () => {
    return Object.entries(soundDefinitions).map(([key, def]) => ({
      key,
      description: def.description,
      type: def.type
    }))
  }

  // ライフサイクル
  onMounted(() => {
    // ユーザーの最初のクリックで音声を有効化
    const enableAudio = () => {
      enableAudioOnUserGesture()
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('touchstart', enableAudio)
    }

    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('touchstart', enableAudio, { once: true })
  })

  onUnmounted(() => {
    stopBGM()
    if (audioContext.value) {
      audioContext.value.close()
    }
  })

  return {
    // 状態
    isEnabled,
    volume,
    isInitialized,

    // 制御
    initializeAudio,
    enableAudioOnUserGesture,
    setVolume,
    toggleSound,

    // BGM
    playBGM,
    playRushZoneBGM,
    pauseBGM,
    stopBGM,

    // 効果音
    playSound,
    playWhoosh,
    playCorrect,
    playIncorrect,
    playClick,
    playCountdown,
    playGameStart,
    playGameEnd,
    playCombo,
    playLevelUp,
    playNewRecord,

    // 特殊効果
    playCorrectCombo,
    playWordAppear,

    // 開発・テスト用
    testAllSounds,
    getSoundList,
    createTone,
    createSweep,
    createChord
  }
}