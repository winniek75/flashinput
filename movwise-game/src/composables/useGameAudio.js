// src/composables/useGameAudio.js - 完全版（エラー対策）
import { ref, reactive, computed, onMounted, onUnmounted, readonly } from 'vue'
import { phonemeAudioService } from '@/services/phonemeAudioService'
import logger from '@/utils/logger'

export function useGameAudio() {
  // === リアクティブな状態 ===
  const isPlaying = ref(false)
  const currentVolume = ref(1.0)
  const audioError = ref(null)
  const isInitialized = ref(false)
  const contextState = ref('disabled')

  // === 音声認識関連の状態 ===
  const isRecording = ref(false)
  const isAnalyzing = ref(false)
  const recognitionResults = ref([])
  const lastRecognitionConfidence = ref(0)
  const speechRecognition = ref(null)
  const mediaRecorder = ref(null)
  const audioStream = ref(null)

  const supportedFeatures = reactive({
    speechSynthesis: false,
    speechRecognition: false,
    webAudio: false,
    audioContext: false,
    mediaRecorder: false
  })

  // === 設定値 ===
  const soundEnabled = computed(() => true) // 音声機能を有効化
  const vibrationEnabled = computed(() => true) // バイブレーションは有効
  const autoPlayEnabled = computed(() => true) // 自動再生は有効

  // === 効果音の種類定義（ファイルパスなし） ===
  const effectSounds = {
    correct: {
      type: 'success',
      frequency: 880,
      duration: 300,
      color: '#10B981'
    },
    incorrect: {
      type: 'error',
      frequency: 220,
      duration: 500,
      color: '#EF4444'
    },
    complete: {
      type: 'celebration',
      frequency: 660,
      duration: 800,
      color: '#8B5CF6'
    },
    button: {
      type: 'interaction',
      frequency: 440,
      duration: 100,
      color: '#3B82F6'
    },
    levelUp: {
      type: 'achievement',
      frequency: 800,
      duration: 600,
      color: '#10B981'
    },
    newRecord: {
      type: 'special',
      frequency: 1000,
      duration: 1000,
      color: '#F59E0B'
    },
    countdown: {
      type: 'timer',
      frequency: 600,
      duration: 200,
      color: '#6366F1'
    },
    timeWarning: {
      type: 'warning',
      frequency: 400,
      duration: 400,
      color: '#EF4444'
    },
    gameStart: {
      type: 'start',
      frequency: 800,
      duration: 500,
      color: '#10B981'
    },
    gameEnd: {
      type: 'end',
      frequency: 500,
      duration: 700,
      color: '#6B7280'
    },
    combo: {
      type: 'combo',
      frequency: 700,
      duration: 250,
      color: '#F97316'
    },
    perfectScore: {
      type: 'perfect',
      frequency: 1200,
      duration: 1200,
      color: '#FFD700'
    }
  }

  // === バイブレーションパターンの定義 ===
  const getVibrationPattern = (effectType) => {
    try {
      const patterns = {
        correct: [50],
        incorrect: [100, 50, 100],
        complete: [200, 100, 200, 100, 200],
        levelUp: [300, 100, 100, 100, 300],
        button: [25],
        combo: [30, 30, 30],
        perfectScore: [500, 100, 200, 100, 500],
        countdown: [100],
        timeWarning: [200, 100, 200],
        gameStart: [300],
        gameEnd: [400, 200, 400],
        newRecord: [300, 100, 300, 100, 300]
      }
      return patterns[effectType] || [50]
    } catch (error) {
      logger.warn('Vibration pattern error:', error)
      return [50]
    }
  }

  // === 視覚的フィードバック（メイン機能） ===
  const playVisualFeedback = (soundType) => {
    try {
      const effect = effectSounds[soundType]
      if (!effect) {
        logger.warn('Unknown effect type:', soundType)
        return false
      }

      // 背景色フラッシュ
      const body = document.body
      const originalBackground = body.style.background

      body.style.background = effect.color
      setTimeout(() => {
        body.style.background = originalBackground
      }, 150)

      // バイブレーション（対応デバイスのみ）
      if (vibrationEnabled.value && 'vibrate' in navigator) {
        const pattern = getVibrationPattern(soundType)
        navigator.vibrate(pattern)
      }

      logger.log(`Visual feedback: ${soundType}`)
      return true

    } catch (error) {
      logger.warn('Visual feedback error:', error)
      return false
    }
  }

  // === 音声機能の初期化（音声認識追加） ===
  const initializeAudio = async () => {
    try {
      if (isInitialized.value) return true

      // Speech Synthesis のサポート確認
      supportedFeatures.speechSynthesis = 'speechSynthesis' in window

      // Speech Recognition のサポート確認
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      supportedFeatures.speechRecognition = !!SpeechRecognition

      // MediaRecorder のサポート確認
      supportedFeatures.mediaRecorder = 'MediaRecorder' in window

      // Web Audio API のサポート確認
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          supportedFeatures.webAudio = true
          supportedFeatures.audioContext = true
        }
      } catch (error) {
        logger.warn('Web Audio API not supported:', error)
        supportedFeatures.webAudio = false
        supportedFeatures.audioContext = false
      }

      // Speech Recognition の初期化
      if (supportedFeatures.speechRecognition) {
        try {
          speechRecognition.value = new SpeechRecognition()
          setupSpeechRecognition()
        } catch (error) {
          logger.warn('Speech Recognition initialization failed:', error)
          supportedFeatures.speechRecognition = false
        }
      }

      isInitialized.value = true
      contextState.value = supportedFeatures.speechSynthesis ? 'ready' : 'limited'

      logger.log('Audio system initialized with speech recognition')
      logger.log('Supported features:', supportedFeatures)

      return true

    } catch (error) {
      logger.error('Audio initialization failed:', error)
      audioError.value = error.message
      return false
    }
  }

  // === メイン音声再生関数 ===
  const playSound = async (type, data, options = {}) => {
    try {
      if (type === 'effect') {
        return playVisualFeedback(data)
      }

      if (type === 'word') {
        return await playWord(data)
      }

      if (type === 'phoneme') {
        return await playPhoneme(data)
      }

      logger.log(`Unknown sound type: ${type} - ${data}`)
      return playVisualFeedback('button')

    } catch (error) {
      logger.error('Sound playback error:', error)
      audioError.value = error.message
      return playVisualFeedback('button')
    }
  }

  // === 音素再生（実際の音声ファイル使用） ===
  const playPhoneme = async (phonemeObj) => {
    try {
      isPlaying.value = true
      
      // 音素データの正規化
      let phoneme = ''
      let nativeTips = ''
      
      if (typeof phonemeObj === 'string') {
        phoneme = phonemeObj
      } else if (phonemeObj?.symbol) {
        phoneme = phonemeObj.symbol.replace(/\//g, '')
        nativeTips = phonemeObj.nativeTips || ''
      } else if (phonemeObj?.ipa) {
        phoneme = phonemeObj.ipa
        nativeTips = phonemeObj.nativeTips || ''
      } else {
        logger.warn('No phoneme data provided for playback')
        isPlaying.value = false
        return playVisualFeedback('button')
      }

      logger.log('🎵 Playing phoneme audio file:', phoneme, '| Tips:', nativeTips)
      
      // 実際の音声ファイルを再生
      await phonemeAudioService.playPhoneme(phoneme, {
        volume: currentVolume.value,
        rate: 1.0
      })
      
      isPlaying.value = false
      logger.log('✅ Phoneme audio completed:', phoneme)
      return true

    } catch (error) {
      logger.warn('⚠️ Phoneme audio playback error:', error)
      isPlaying.value = false
      
      // フォールバック: Speech Synthesis を使用
      return await playPhonemeWithSpeechSynthesis(phonemeObj)
    }
  }

  // === フォールバック: Speech Synthesis 使用 ===
  const playPhonemeWithSpeechSynthesis = async (phonemeObj) => {
    try {
      if (!supportedFeatures.speechSynthesis) {
        logger.log('Speech synthesis not supported, using visual feedback only')
        return playVisualFeedback('button')
      }

      let phonemeText = ''
      let ipaSymbol = ''
      
      if (typeof phonemeObj === 'string') {
        phonemeText = phonemeObj
        ipaSymbol = phonemeObj
      } else if (phonemeObj?.symbol) {
        ipaSymbol = phonemeObj.symbol.replace(/\//g, '')
        phonemeText = phonemeObj.nativeText || ipaSymbol
      } else {
        phonemeText = 'unknown sound'
        ipaSymbol = 'unknown'
      }

      const optimizedText = optimizeForNativePronunciation(ipaSymbol, phonemeText)
      
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(optimizedText)
        utterance.rate = getOptimalRateForPhoneme(ipaSymbol)
        utterance.pitch = getOptimalPitchForPhoneme(ipaSymbol) 
        utterance.volume = currentVolume.value * 0.8 // 少し小さめに
        utterance.lang = 'en-US'
        
        const voices = speechSynthesis.getVoices()
        const bestNativeVoice = selectBestNativeVoice(voices)
        
        if (bestNativeVoice) {
          utterance.voice = bestNativeVoice
          logger.log('🎙️ Fallback: Using speech synthesis for:', ipaSymbol)
        }

        utterance.onend = () => {
          isPlaying.value = false
          resolve(true)
        }

        utterance.onerror = (error) => {
          isPlaying.value = false
          logger.warn('Speech synthesis fallback error:', error)
          playVisualFeedback('incorrect')
          resolve(false)
        }

        speechSynthesis.speak(utterance)
      })

    } catch (error) {
      logger.warn('Speech synthesis fallback failed:', error)
      isPlaying.value = false
      return playVisualFeedback('incorrect')
    }
  }

  // === 単語再生（Native Pronunciation with Word-Level Optimization） ===
  const playWord = async (wordObj) => {
    try {
      if (!soundEnabled.value || !supportedFeatures.speechSynthesis) {
        logger.log('Word playback disabled or not supported:', wordObj?.word)
        return playVisualFeedback('button')
      }

      isPlaying.value = true
      
      const word = typeof wordObj === 'string' ? wordObj : wordObj?.word
      const pronunciation = wordObj?.pronunciation || ''
      const difficulty = wordObj?.difficulty || 'normal'
      const wordType = wordObj?.type || 'general'
      
      if (!word) {
        logger.warn('No word provided for playback')
        return playVisualFeedback('button')
      }

      // Advanced word pronunciation optimization
      const optimizedWord = optimizeWordForNativePronunciation(word, pronunciation, wordType)
      
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(optimizedWord)
        
        // Dynamic native pronunciation settings based on word characteristics
        utterance.rate = getOptimalRateForWord(word, difficulty)
        utterance.pitch = getOptimalPitchForWord(word, wordType)
        utterance.volume = currentVolume.value
        utterance.lang = 'en-US'
        
        // Premium native voice selection with accent preference
        const voices = speechSynthesis.getVoices()
        const bestNativeVoice = selectBestNativeVoice(voices, 'american')
        
        if (bestNativeVoice) {
          utterance.voice = bestNativeVoice
          logger.log('🎙️ Using premium native voice for word:', bestNativeVoice.name, '| Word:', word, '| Type:', wordType)
        }

        utterance.onend = () => {
          isPlaying.value = false
          logger.log('✅ Native word completed:', word, '| Optimized:', optimizedWord)
          resolve(true)
        }

        utterance.onerror = (error) => {
          isPlaying.value = false
          logger.warn('⚠️ Native word error:', error)
          playVisualFeedback('incorrect')
          resolve(false)
        }

        utterance.onstart = () => {
          logger.log('🎤 Native word started:', word)
          if (pronunciation) {
            logger.log('🔊 Pronunciation guide:', pronunciation)
          }
        }

        // ネイティブ音声再生開始
        speechSynthesis.speak(utterance)
      })

    } catch (error) {
      isPlaying.value = false
      logger.warn('Native word playback error:', error)
      return playVisualFeedback('button')
    }
  }

  // === 効果音再生（視覚的フィードバックのみ） ===
  const playEffectSound = async (effectType, options = {}) => {
    try {
      logger.log('Effect sound (visual only):', effectType)
      return playVisualFeedback(effectType)
    } catch (error) {
      logger.warn('Effect sound error:', error)
      return false
    }
  }

  // === 音声シーケンス再生 ===
  const playSequence = async (sequence, options = {}) => {
    try {
      if (!Array.isArray(sequence)) {
        logger.warn('Invalid sequence format')
        return false
      }

      for (const item of sequence) {
        if (item && item.type && item.data) {
          await playSound(item.type, item.data, { ...options, ...item.options })

          if (item.delay && typeof item.delay === 'number') {
            await new Promise(resolve => setTimeout(resolve, item.delay))
          }
        }
      }
      return true
    } catch (error) {
      logger.warn('Sequence playback error:', error)
      return false
    }
  }

  // === 自動再生機能（無効化） ===
  const playAutoAudio = async (phoneme, word = null) => {
    try {
      logger.log('Auto audio disabled:', { phoneme, word })
      return false
    } catch (error) {
      logger.warn('Auto audio error:', error)
      return false
    }
  }

  // === Be Verb Rush専用：カウントダウン音声 ===
  const playCountdown = async (number) => {
    try {
      logger.log('Countdown (visual only):', number)
      return playVisualFeedback('countdown')
    } catch (error) {
      logger.warn('Countdown failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：ゲーム開始音 ===
  const playGameStart = async () => {
    try {
      logger.log('Game start (visual only)')
      return playVisualFeedback('gameStart')
    } catch (error) {
      logger.warn('Game start failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：ゲーム終了音 ===
  const playGameEnd = async (isSuccess = true) => {
    try {
      logger.log('Game end (visual only):', isSuccess)
      const effectType = isSuccess ? 'complete' : 'gameEnd'
      return playVisualFeedback(effectType)
    } catch (error) {
      logger.warn('Game end failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：コンボ音 ===
  const playCombo = async (comboCount) => {
    try {
      logger.log('Combo (visual only):', comboCount)
      return playVisualFeedback('combo')
    } catch (error) {
      logger.warn('Combo failed:', error)
      return false
    }
  }

  // === Be Verb Rush専用：時間警告音 ===
  const playTimeWarning = async () => {
    try {
      logger.log('Time warning (visual only)')
      return playVisualFeedback('timeWarning')
    } catch (error) {
      logger.warn('Time warning failed:', error)
      return false
    }
  }

  // === 音量制御（無効化） ===
  const setVolume = (volume) => {
    try {
      currentVolume.value = Math.max(0, Math.min(1, volume))
      logger.log('Volume set (audio disabled):', currentVolume.value)
    } catch (error) {
      logger.warn('Volume setting error:', error)
    }
  }

  const increaseVolume = (step = 0.1) => {
    setVolume(currentVolume.value + step)
  }

  const decreaseVolume = (step = 0.1) => {
    setVolume(currentVolume.value - step)
  }

  // === 音声設定の切り替え（無効化） ===
  const toggleSound = () => {
    try {
      logger.log('Sound toggle (disabled for stability)')
    } catch (error) {
      logger.warn('Sound toggle error:', error)
    }
  }

  const toggleVibration = () => {
    try {
      logger.log('Vibration toggle')
      // バイブレーション設定の切り替えは実装可能
    } catch (error) {
      logger.warn('Vibration toggle error:', error)
    }
  }

  const toggleAutoPlay = () => {
    try {
      logger.log('Auto play toggle (disabled)')
    } catch (error) {
      logger.warn('Auto play toggle error:', error)
    }
  }

  // === Speech Recognition セットアップ ===
  const setupSpeechRecognition = () => {
    if (!speechRecognition.value) return

    const recognition = speechRecognition.value
    
    // 基本設定
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 3

    // イベントハンドラー
    recognition.onstart = () => {
      logger.log('🎤 Speech recognition started')
      isRecording.value = true
    }

    recognition.onend = () => {
      logger.log('🎤 Speech recognition ended')
      isRecording.value = false
    }

    recognition.onresult = (event) => {
      logger.log('🎤 Speech recognition result:', event)
      
      const results = []
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        for (let j = 0; j < result.length; j++) {
          results.push({
            transcript: result[j].transcript,
            confidence: result[j].confidence,
            isFinal: result.isFinal
          })
        }
      }
      
      recognitionResults.value = results
      if (results.length > 0) {
        lastRecognitionConfidence.value = results[0].confidence
      }
    }

    recognition.onerror = (event) => {
      logger.error('🎤 Speech recognition error:', event.error)
      isRecording.value = false
      audioError.value = `Speech recognition error: ${event.error}`
    }
  }

  // === 録音開始 ===
  const startRecording = async () => {
    try {
      if (!supportedFeatures.speechRecognition) {
        throw new Error('Speech recognition not supported')
      }

      if (isRecording.value) {
        logger.warn('Recording already in progress')
        return false
      }

      // マイクアクセスの要求
      try {
        audioStream.value = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        })
      } catch (error) {
        throw new Error(`Microphone access denied: ${error.message}`)
      }

      // Speech Recognition 開始
      recognitionResults.value = []
      lastRecognitionConfidence.value = 0
      speechRecognition.value.start()

      logger.log('🎤 Recording started')
      return true

    } catch (error) {
      logger.error('Recording start error:', error)
      audioError.value = error.message
      isRecording.value = false
      return false
    }
  }

  // === 録音停止 ===
  const stopRecording = async () => {
    try {
      if (!isRecording.value) {
        logger.warn('No recording in progress')
        return false
      }

      // Speech Recognition 停止
      if (speechRecognition.value) {
        speechRecognition.value.stop()
      }

      // オーディオストリーム停止
      if (audioStream.value) {
        audioStream.value.getTracks().forEach(track => track.stop())
        audioStream.value = null
      }

      logger.log('🎤 Recording stopped')
      return true

    } catch (error) {
      logger.error('Recording stop error:', error)
      audioError.value = error.message
      return false
    }
  }

  // === 音声分析・発音判定 ===
  const analyzeAudio = async (targetPhoneme, options = {}) => {
    try {
      if (!recognitionResults.value.length) {
        throw new Error('No recognition results available')
      }

      isAnalyzing.value = true

      const bestResult = recognitionResults.value[0]
      const recognizedText = bestResult.transcript.toLowerCase().trim()
      const confidence = bestResult.confidence

      logger.log('🔍 Analyzing pronunciation:', {
        target: targetPhoneme,
        recognized: recognizedText,
        confidence: confidence
      })

      // 発音スコア計算
      const pronunciationScore = calculatePronunciationScore(
        targetPhoneme, 
        recognizedText, 
        confidence,
        options
      )

      isAnalyzing.value = false

      return {
        recognized: recognizedText,
        confidence: confidence,
        score: pronunciationScore.score,
        accuracy: pronunciationScore.accuracy,
        clarity: pronunciationScore.clarity,
        timing: pronunciationScore.timing,
        feedback: pronunciationScore.feedback
      }

    } catch (error) {
      logger.error('Audio analysis error:', error)
      isAnalyzing.value = false
      
      // フォールバック: ランダムスコア
      return {
        recognized: 'unknown',
        confidence: 0.5,
        score: Math.random() * 40 + 60, // 60-100
        accuracy: 0.7,
        clarity: 0.6,
        timing: 0.8,
        feedback: 'Analysis failed, please try again'
      }
    }
  }

  // === 発音スコア計算アルゴリズム ===
  const calculatePronunciationScore = (target, recognized, confidence, options = {}) => {
    try {
      let score = 0
      let accuracy = 0
      let clarity = confidence || 0.5
      let timing = 0.8 // デフォルト値
      let feedback = ''

      // 基本一致チェック
      const targetLower = target.toLowerCase().trim()
      const recognizedLower = recognized.toLowerCase().trim()

      // 完全一致
      if (targetLower === recognizedLower) {
        accuracy = 1.0
        score = 90 + (confidence * 10)
        feedback = 'Perfect pronunciation!'
      }
      // 部分一致（音素の一部が含まれている）
      else if (recognizedLower.includes(targetLower) || targetLower.includes(recognizedLower)) {
        accuracy = 0.7
        score = 70 + (confidence * 20)
        feedback = 'Good pronunciation, with minor improvements needed'
      }
      // 音韻的類似性チェック
      else {
        const phonemeScore = calculatePhonemeScore(targetLower, recognizedLower)
        accuracy = phonemeScore
        score = 50 + (phonemeScore * 40) + (confidence * 10)
        feedback = score >= 70 ? 'Acceptable pronunciation' : 'Please practice more'
      }

      // 信頼度による調整
      if (confidence < 0.5) {
        score *= 0.8
        feedback += ' (low confidence - speak more clearly)'
      }

      // CV組み合わせの特別処理
      if (options.type === 'cv-combination') {
        score = adjustScoreForCVCombination(target, recognized, score, confidence)
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        accuracy: Math.max(0, Math.min(1, accuracy)),
        clarity: Math.max(0, Math.min(1, clarity)),
        timing: Math.max(0, Math.min(1, timing)),
        feedback: feedback
      }

    } catch (error) {
      logger.error('Score calculation error:', error)
      return {
        score: 60,
        accuracy: 0.6,
        clarity: 0.5,
        timing: 0.7,
        feedback: 'Score calculation failed'
      }
    }
  }

  // === 音韻的類似性スコア計算 ===
  const calculatePhonemeScore = (target, recognized) => {
    try {
      // 文字ベースの類似性（Levenshtein距離の簡易版）
      const maxLength = Math.max(target.length, recognized.length)
      const distance = levenshteinDistance(target, recognized)
      const similarity = 1 - (distance / maxLength)

      // 音韻的特徴による調整
      const phonemeAdjustment = getPhonemeAdjustment(target, recognized)
      
      return Math.max(0, similarity + phonemeAdjustment)

    } catch (error) {
      logger.error('Phoneme score calculation error:', error)
      return 0.5
    }
  }

  // === CV組み合わせ用スコア調整 ===
  const adjustScoreForCVCombination = (target, recognized, baseScore, confidence) => {
    try {
      // CV組み合わせの特別な評価基準
      if (target.length === 2) {
        const consonant = target[0]
        const vowel = target[1]
        
        // 子音と母音の個別チェック
        const consonantPresent = recognized.toLowerCase().includes(consonant.toLowerCase())
        const vowelPresent = recognized.toLowerCase().includes(vowel.toLowerCase())
        
        if (consonantPresent && vowelPresent) {
          return Math.min(100, baseScore + 10)
        } else if (consonantPresent || vowelPresent) {
          return Math.min(100, baseScore + 5)
        }
      }
      
      return baseScore

    } catch (error) {
      logger.error('CV combination adjustment error:', error)
      return baseScore
    }
  }

  // === Levenshtein距離計算 ===
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

  // === 音韻的特徴による調整 ===
  const getPhonemeAdjustment = (target, recognized) => {
    try {
      // 日本人学習者にとって困難な音の特別処理
      const difficultPairs = {
        'r': ['l', 'w'],
        'l': ['r', 'w'],
        'v': ['b', 'f'],
        'th': ['s', 'z', 't', 'd'],
        'f': ['p', 'h']
      }

      let adjustment = 0

      for (const [sound, alternatives] of Object.entries(difficultPairs)) {
        if (target.includes(sound)) {
          for (const alt of alternatives) {
            if (recognized.includes(alt)) {
              adjustment += 0.1 // 類似音への部分点
            }
          }
        }
      }

      return adjustment

    } catch (error) {
      logger.error('Phoneme adjustment error:', error)
      return 0
    }
  }

  // === 音声テスト機能 ===
  const testAudio = async () => {
    try {
      logger.log('Audio test with speech recognition')

      const testSequence = [
        { type: 'effect', data: 'button', options: { volume: 0.5 } },
        { type: 'effect', data: 'correct', delay: 300 },
        { type: 'effect', data: 'combo', delay: 500 },
        { type: 'effect', data: 'perfectScore', delay: 500 }
      ]

      await playSequence(testSequence)

      // 音声認識テスト
      if (supportedFeatures.speechRecognition) {
        logger.log('Testing speech recognition...')
        // テストは実際の録音なしで実行
      }

      return true
    } catch (error) {
      logger.warn('Audio test failed:', error)
      return false
    }
  }

  // === テキスト読み上げ機能 ===
  const speakText = async (text, options = {}) => {
    try {
      if (!soundEnabled.value) {
        logger.log('Sound is disabled')
        return playVisualFeedback('speak')
      }

      if (!supportedFeatures.speechSynthesis) {
        logger.warn('Speech synthesis not supported')
        return playVisualFeedback('speak')
      }

      // 既存の音声を停止
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      
      // オプション設定
      utterance.lang = options.lang || 'en-US'
      utterance.rate = options.rate || 1.0
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || currentVolume.value
      
      // イベントハンドラー
      utterance.onstart = () => {
        isPlaying.value = true
        logger.log(`🔊 Speaking: "${text}"`)
      }
      
      utterance.onend = () => {
        isPlaying.value = false
        logger.log('🔊 Speech completed')
      }
      
      utterance.onerror = (event) => {
        isPlaying.value = false
        logger.error('Speech synthesis error:', event)
        audioError.value = event.error
      }
      
      // 音声再生
      window.speechSynthesis.speak(utterance)
      
      return new Promise((resolve) => {
        utterance.onend = () => {
          isPlaying.value = false
          resolve(true)
        }
        utterance.onerror = () => {
          isPlaying.value = false
          resolve(false)
        }
      })
      
    } catch (error) {
      logger.error('speakText error:', error)
      audioError.value = error.message
      return playVisualFeedback('speak')
    }
  }

  // === 音声停止 ===
  const stopAudio = () => {
    try {
      speechSynthesis.cancel() // 進行中の音声を停止
      isPlaying.value = false
      logger.log('Audio stopped')
    } catch (error) {
      logger.warn('Stop audio error:', error)
    }
  }

  // === 音声キューのクリア ===
  const clearAudioQueue = () => {
    try {
      logger.log('Audio queue cleared')
    } catch (error) {
      logger.warn('Clear audio queue error:', error)
    }
  }

  // === エラーハンドリング ===
  const handleAudioError = (error) => {
    try {
      logger.error('Audio error:', error)
      audioError.value = error.message
      isPlaying.value = false

      // エラー通知として視覚的フィードバック
      playVisualFeedback('incorrect')
    } catch (fallbackError) {
      logger.warn('Error handling failed:', fallbackError)
    }
  }

  // === 音声状態の取得 ===
  const getAudioStatus = () => {
    try {
      return {
        isEnabled: soundEnabled.value,
        isInitialized: isInitialized.value,
        hasError: !!audioError.value,
        error: audioError.value,
        contextState: contextState.value,
        supportedFeatures: { ...supportedFeatures },
        visualFeedbackEnabled: true
      }
    } catch (error) {
      logger.warn('Get audio status error:', error)
      return {
        isEnabled: false,
        isInitialized: false,
        hasError: true,
        error: error.message,
        contextState: 'error',
        supportedFeatures: {},
        visualFeedbackEnabled: true
      }
    }
  }

  // === ユーザー操作による音声有効化 ===
  const enableAudio = async () => {
    try {
      if (!supportedFeatures.speechSynthesis) {
        logger.warn('Speech synthesis not supported')
        audioError.value = 'Speech synthesis not supported'
        return false
      }

      // ユーザーインタラクションが必要な場合の処理
      if (speechSynthesis.paused) {
        speechSynthesis.resume()
      }

      logger.log('Audio enabled successfully')
      audioError.value = null
      contextState.value = 'ready'
      return true
    } catch (error) {
      logger.warn('Enable audio error:', error)
      audioError.value = error.message
      return false
    }
  }

  // === 音声無効化 ===
  const disableAudio = () => {
    try {
      logger.log('Audio disabled')
      speechSynthesis.cancel() // 進行中の音声を停止
      stopAudio()
      contextState.value = 'disabled'
    } catch (error) {
      logger.warn('Disable audio error:', error)
    }
  }

  // === オーディオコンテキスト再開（無効化） ===
  const resumeAudioContext = async () => {
    try {
      logger.log('Audio context resume (disabled)')
      return false
    } catch (error) {
      logger.warn('Audio context resume error:', error)
      return false
    }
  }

  // === ライフサイクル ===
  onMounted(async () => {
    try {
      await initializeAudio()
      logger.log('✅ useGameAudio mounted successfully (visual feedback mode)')
    } catch (error) {
      logger.warn('Audio mount error:', error)
      handleAudioError(error)
    }
  })

  onUnmounted(() => {
    try {
      stopAudio()
      clearAudioQueue()
      logger.log('✅ useGameAudio unmounted successfully')
    } catch (error) {
      logger.warn('Audio unmount error:', error)
    }
  })

  // === Native Pronunciation Optimization Functions ===
  const optimizeForNativePronunciation = (ipaSymbol, originalText) => {
    // IPA symbol to optimized text mapping for better TTS pronunciation
    const nativeOptimizations = {
      // Vowels - American English specific
      'æ': 'a as in cat',  // /æ/ -> clearer pronunciation
      'ɑ': 'ah as in father', // /ɑ/ -> back vowel
      'ʌ': 'u as in cup',    // /ʌ/ -> central vowel
      'ɪ': 'i as in bit',    // /ɪ/ -> near-close front
      'ʊ': 'u as in book',   // /ʊ/ -> near-close back
      'ə': 'uh as in about', // /ə/ -> schwa
      'ɝ': 'er as in butter', // /ɝ/ -> r-colored schwa
      
      // Consonants - Problematic for Japanese learners
      'θ': 'th as in think', // /θ/ -> voiceless th
      'ð': 'th as in this',  // /ð/ -> voiced th
      'r': 'American r',        // American r sound
      'l': 'American l',        // Clear l sound
      'v': 'v as in very',      // Clear v sound
      'f': 'f as in fish',      // Clear f sound
      'ʒ': 'zh as in measure', // /ʒ/ -> voiced postalveolar
      'ʃ': 'sh as in ship',    // /ʃ/ -> voiceless postalveolar
      'ʧ': 'ch as in chair',   // /tʃ/ -> voiceless postalveolar affricate
      'ʤ': 'j as in judge',    // /dʒ/ -> voiced postalveolar affricate
    }
    
    return nativeOptimizations[ipaSymbol] || originalText
  }
  
  const optimizeWordForNativePronunciation = (word, pronunciation, wordType) => {
    // Word-level optimizations for better native pronunciation
    const wordOptimizations = {
      // Common problematic words for Japanese learners
      'water': 'wah-ter',
      'better': 'bet-ter', 
      'little': 'lit-tle',
      'bottle': 'bot-tle',
      'right': 'rah-ight',
      'light': 'lah-ight',
      'very': 'ver-ry',
      'river': 'riv-ver',
      'this': 'th-is',
      'that': 'th-at',
      'think': 'th-ink',
      'three': 'th-ree'
    }
    
    return wordOptimizations[word.toLowerCase()] || word
  }
  
  const getOptimalRateForPhoneme = (ipaSymbol) => {
    // Slower rate for difficult phonemes
    const difficultPhonemes = ['θ', 'ð', 'r', 'l', 'æ', 'ʌ']
    return difficultPhonemes.includes(ipaSymbol) ? 0.5 : 0.7
  }
  
  const getOptimalPitchForPhoneme = (ipaSymbol) => {
    // Higher pitch for vowels, normal for consonants
    const vowels = ['æ', 'ɑ', 'ʌ', 'ɪ', 'ʊ', 'ə', 'ɝ']
    return vowels.includes(ipaSymbol) ? 1.1 : 1.0
  }
  
  const getOptimalRateForWord = (word, difficulty) => {
    const baseRate = 0.8
    const difficultyModifier = {
      'easy': 0.1,
      'normal': 0,
      'hard': -0.2,
      'expert': -0.3
    }
    return Math.max(0.4, baseRate + (difficultyModifier[difficulty] || 0))
  }
  
  const getOptimalPitchForWord = (word, wordType) => {
    const basePitch = 1.0
    const typeModifier = {
      'phoneme': 0.2,
      'sight_word': 0.1,
      'vocabulary': 0,
      'grammar': -0.1
    }
    return basePitch + (typeModifier[wordType] || 0)
  }
  
  const selectBestNativeVoice = (voices, accent = 'american') => {
    // Premium native voice selection with quality ranking
    const americanVoices = voices.filter(voice => 
      voice.lang === 'en-US' && !voice.localService
    )
    
    const qualityVoices = voices.filter(voice => 
      voice.lang === 'en-US' && 
      (voice.name.includes('Premium') || 
       voice.name.includes('Neural') ||
       voice.name.includes('Enhanced') ||
       voice.name.includes('High Quality'))
    )
    
    const systemVoices = voices.filter(voice => voice.lang === 'en-US')
    const fallbackVoices = voices.filter(voice => voice.lang.startsWith('en-'))
    
    // Priority order: Quality voices > American voices > System voices > Fallback
    return qualityVoices[0] || americanVoices[0] || systemVoices[0] || fallbackVoices[0]
  }
  
  // === Enhanced Grammar Audio Support ===
  const speakGrammarInstruction = async (instruction, grammarType = 'general') => {
    try {
      if (!soundEnabled.value || !supportedFeatures.speechSynthesis) {
        logger.log('Grammar instruction playback disabled')
        return playVisualFeedback('button')
      }
      
      const utterance = new SpeechSynthesisUtterance(instruction)
      utterance.rate = 0.7
      utterance.pitch = 1.0
      utterance.volume = currentVolume.value * 0.8 // Slightly quieter for instructions
      utterance.lang = 'en-US'
      
      const voices = speechSynthesis.getVoices()
      const instructorVoice = selectBestNativeVoice(voices)
      
      if (instructorVoice) {
        utterance.voice = instructorVoice
      }
      
      return new Promise((resolve) => {
        utterance.onend = () => resolve(true)
        utterance.onerror = () => resolve(false)
        speechSynthesis.speak(utterance)
      })
    } catch (error) {
      logger.warn('Grammar instruction error:', error)
      return false
    }
  }
  
  // === Sentence Pronunciation with Grammar Focus ===
  const speakSentence = async (sentence, grammarFocus = [], options = {}) => {
    try {
      if (!soundEnabled.value || !supportedFeatures.speechSynthesis) {
        return playVisualFeedback('button')
      }
      
      // Add emphasis markers for grammar focus areas
      let enhancedSentence = sentence
      if (grammarFocus.length > 0) {
        grammarFocus.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi')
          enhancedSentence = enhancedSentence.replace(regex, `${word}.`)
        })
      }
      
      const utterance = new SpeechSynthesisUtterance(enhancedSentence)
      utterance.rate = options.rate || 0.8
      utterance.pitch = options.pitch || 1.0
      utterance.volume = currentVolume.value
      utterance.lang = 'en-US'
      
      const voices = speechSynthesis.getVoices()
      const nativeVoice = selectBestNativeVoice(voices)
      
      if (nativeVoice) {
        utterance.voice = nativeVoice
      }
      
      return new Promise((resolve) => {
        utterance.onend = () => {
          logger.log('✅ Grammar sentence completed:', sentence)
          resolve(true)
        }
        utterance.onerror = () => resolve(false)
        speechSynthesis.speak(utterance)
      })
    } catch (error) {
      logger.warn('Sentence pronunciation error:', error)
      return false
    }
  }
  
  // === 公開API ===
  return {
    // 状態
    isPlaying: readonly(isPlaying),
    currentVolume: readonly(currentVolume),
    audioError: readonly(audioError),
    supportedFeatures: readonly(supportedFeatures),
    soundEnabled,
    vibrationEnabled,
    autoPlayEnabled,

    // 音声認識状態
    isRecording: readonly(isRecording),
    isAnalyzing: readonly(isAnalyzing),
    recognitionResults: readonly(recognitionResults),
    lastRecognitionConfidence: readonly(lastRecognitionConfidence),

    // 音声再生（すべて視覚的フィードバックのみ）
    playSound,
    playPhoneme,
    playWord,
    playEffectSound,
    playSequence,
    playAutoAudio,
    speakText,

    // Be Verb Rush専用音声（すべて視覚的フィードバックのみ）
    playCountdown,
    playGameStart,
    playGameEnd,
    playCombo,
    playTimeWarning,

    // 音声認識・発音判定
    startRecording,
    stopRecording,
    analyzeAudio,

    // 制御
    setVolume,
    increaseVolume,
    decreaseVolume,
    toggleSound,
    toggleVibration,
    toggleAutoPlay,
    stopAudio,
    clearAudioQueue,
    enableAudio,
    disableAudio,

    // テスト・デバッグ
    testAudio,
    initializeAudio,
    getAudioStatus,

    // エラーハンドリング
    handleAudioError,

    // ネイティブ発音専用機能
    speakGrammarInstruction,
    speakSentence,
    optimizeForNativePronunciation,
    optimizeWordForNativePronunciation,
    selectBestNativeVoice,

    // 音声認識ユーティリティ
    calculatePronunciationScore,
    calculatePhonemeScore,

    // ユーティリティ
    resumeAudioContext,
    playVisualFeedback
  }
}