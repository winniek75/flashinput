import * as THREE from 'three'
import logger from '@/utils/logger'

export interface VRAudioConfig {
  enablePositionalAudio: boolean
  masterVolume: number
  sfxVolume: number
  musicVolume: number
  voiceVolume: number
}

export interface AudioClip {
  id: string
  url: string
  loop: boolean
  volume: number
  category: 'sfx' | 'music' | 'voice' | 'ui'
}

export class VRAudioManager {
  private listener: THREE.AudioListener
  private camera: THREE.Camera
  private audioLoader: THREE.AudioLoader
  private audioClips: Map<string, THREE.Audio | THREE.PositionalAudio> = new Map()
  private config: VRAudioConfig
  private isInitialized: boolean = false

  // 音声認識関連
  private speechRecognition: any = null
  private isListening: boolean = false
  private recognitionLanguage: string = 'ja-JP'

  constructor(camera: THREE.Camera, config: Partial<VRAudioConfig> = {}) {
    this.camera = camera
    this.config = {
      enablePositionalAudio: true,
      masterVolume: 0.8,
      sfxVolume: 0.7,
      musicVolume: 0.5,
      voiceVolume: 1.0,
      ...config
    }

    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()

    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      // カメラにオーディオリスナーを追加
      this.camera.add(this.listener)

      // 音声認識を初期化
      await this.initializeSpeechRecognition()

      this.isInitialized = true
      logger.log('🎵 VR Audio Manager initialized')
    } catch (error) {
      logger.error('Failed to initialize VR Audio Manager:', error)
    }
  }

  private async initializeSpeechRecognition(): Promise<void> {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      logger.warn('Speech Recognition not supported in this browser')
      return
    }

    this.speechRecognition = new SpeechRecognition()
    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = true
    this.speechRecognition.lang = this.recognitionLanguage

    // 音声認識イベント設定
    this.speechRecognition.onstart = () => {
      this.isListening = true
      logger.log('🎤 Speech recognition started')
    }

    this.speechRecognition.onend = () => {
      this.isListening = false
      logger.log('🎤 Speech recognition ended')
    }

    this.speechRecognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // カスタムイベントを発火
      if (finalTranscript) {
        window.dispatchEvent(new CustomEvent('vr-speech-recognized', {
          detail: {
            transcript: finalTranscript.trim(),
            confidence: event.results[event.results.length - 1][0].confidence,
            language: this.recognitionLanguage
          }
        }))
      }

      if (interimTranscript) {
        window.dispatchEvent(new CustomEvent('vr-speech-interim', {
          detail: {
            transcript: interimTranscript,
            language: this.recognitionLanguage
          }
        }))
      }
    }

    this.speechRecognition.onerror = (event: any) => {
      logger.error('Speech recognition error:', event.error)
      window.dispatchEvent(new CustomEvent('vr-speech-error', {
        detail: { error: event.error }
      }))
    }
  }

  public async loadAudioClip(audioClip: AudioClip): Promise<boolean> {
    try {
      const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
        this.audioLoader.load(
          audioClip.url,
          resolve,
          undefined,
          reject
        )
      })

      let audio: THREE.Audio | THREE.PositionalAudio

      if (this.config.enablePositionalAudio && audioClip.category === 'sfx') {
        // 3D位置オーディオ
        audio = new THREE.PositionalAudio(this.listener)
        audio.setRefDistance(1)
        audio.setRolloffFactor(2)
      } else {
        // 通常のオーディオ
        audio = new THREE.Audio(this.listener)
      }

      audio.setBuffer(audioBuffer)
      audio.setLoop(audioClip.loop)
      audio.setVolume(this.calculateVolume(audioClip))

      this.audioClips.set(audioClip.id, audio)

      logger.log(`🎵 Audio clip loaded: ${audioClip.id}`)
      return true
    } catch (error) {
      logger.error(`Failed to load audio clip ${audioClip.id}:`, error)
      return false
    }
  }

  private calculateVolume(audioClip: AudioClip): number {
    const categoryMultiplier = {
      sfx: this.config.sfxVolume,
      music: this.config.musicVolume,
      voice: this.config.voiceVolume,
      ui: this.config.sfxVolume
    }

    return audioClip.volume * categoryMultiplier[audioClip.category] * this.config.masterVolume
  }

  public playAudio(
    clipId: string,
    position?: THREE.Vector3,
    options: { fadeIn?: number; delay?: number } = {}
  ): boolean {
    const audio = this.audioClips.get(clipId)
    if (!audio) {
      logger.warn(`Audio clip not found: ${clipId}`)
      return false
    }

    // 位置設定（PositionalAudioの場合）
    if (position && audio instanceof THREE.PositionalAudio) {
      // 仮の親オブジェクトを作成して位置を設定
      const tempParent = new THREE.Object3D()
      tempParent.position.copy(position)
      tempParent.add(audio)
    }

    // 遅延再生
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        this.doPlayAudio(audio, options.fadeIn)
      }, options.delay * 1000)
    } else {
      this.doPlayAudio(audio, options.fadeIn)
    }

    return true
  }

  private doPlayAudio(audio: THREE.Audio | THREE.PositionalAudio, fadeIn?: number): void {
    if (fadeIn && fadeIn > 0) {
      // フェードイン
      const originalVolume = audio.getVolume()
      audio.setVolume(0)
      audio.play()

      const fadeSteps = 20
      const fadeStepTime = (fadeIn * 1000) / fadeSteps
      const volumeStep = originalVolume / fadeSteps

      let currentStep = 0
      const fadeInterval = setInterval(() => {
        currentStep++
        const newVolume = volumeStep * currentStep
        audio.setVolume(Math.min(newVolume, originalVolume))

        if (currentStep >= fadeSteps) {
          clearInterval(fadeInterval)
        }
      }, fadeStepTime)
    } else {
      audio.play()
    }
  }

  public stopAudio(clipId: string, fadeOut?: number): boolean {
    const audio = this.audioClips.get(clipId)
    if (!audio || !audio.isPlaying) {
      return false
    }

    if (fadeOut && fadeOut > 0) {
      // フェードアウト
      const originalVolume = audio.getVolume()
      const fadeSteps = 20
      const fadeStepTime = (fadeOut * 1000) / fadeSteps
      const volumeStep = originalVolume / fadeSteps

      let currentStep = 0
      const fadeInterval = setInterval(() => {
        currentStep++
        const newVolume = originalVolume - (volumeStep * currentStep)
        audio.setVolume(Math.max(newVolume, 0))

        if (currentStep >= fadeSteps) {
          clearInterval(fadeInterval)
          audio.stop()
          audio.setVolume(originalVolume) // 元の音量に戻す
        }
      }, fadeStepTime)
    } else {
      audio.stop()
    }

    return true
  }

  public pauseAudio(clipId: string): boolean {
    const audio = this.audioClips.get(clipId)
    if (!audio || !audio.isPlaying) {
      return false
    }

    audio.pause()
    return true
  }

  public resumeAudio(clipId: string): boolean {
    const audio = this.audioClips.get(clipId)
    if (!audio) {
      return false
    }

    audio.play()
    return true
  }

  public setVolume(clipId: string, volume: number): boolean {
    const audio = this.audioClips.get(clipId)
    if (!audio) {
      return false
    }

    audio.setVolume(volume)
    return true
  }

  public setMasterVolume(volume: number): void {
    this.config.masterVolume = THREE.MathUtils.clamp(volume, 0, 1)

    // すべてのオーディオクリップの音量を更新
    this.audioClips.forEach((audio, clipId) => {
      // 元のクリップ情報が必要だが、簡易的に現在の音量を維持
      const currentVolume = audio.getVolume()
      audio.setVolume(currentVolume * this.config.masterVolume)
    })
  }

  // 音声認識メソッド
  public startSpeechRecognition(language: string = 'ja-JP'): boolean {
    if (!this.speechRecognition) {
      logger.warn('Speech recognition not available')
      return false
    }

    if (this.isListening) {
      logger.warn('Speech recognition already running')
      return false
    }

    this.recognitionLanguage = language
    this.speechRecognition.lang = language

    try {
      this.speechRecognition.start()
      return true
    } catch (error) {
      logger.error('Failed to start speech recognition:', error)
      return false
    }
  }

  public stopSpeechRecognition(): boolean {
    if (!this.speechRecognition || !this.isListening) {
      return false
    }

    try {
      this.speechRecognition.stop()
      return true
    } catch (error) {
      logger.error('Failed to stop speech recognition:', error)
      return false
    }
  }

  public isSpeechRecognitionAvailable(): boolean {
    return this.speechRecognition !== null
  }

  public isSpeechRecognitionListening(): boolean {
    return this.isListening
  }

  // 音素の発音フィードバック
  public analyzePhoneme(targetPhoneme: string, spokenText: string): {
    isCorrect: boolean
    confidence: number
    feedback: string
  } {
    // 簡易的な音素マッチング（実際にはより高度な音声解析が必要）
    const normalizedTarget = targetPhoneme.toLowerCase().replace(/[^a-z]/g, '')
    const normalizedSpoken = spokenText.toLowerCase().replace(/[^a-z]/g, '')

    const similarity = this.calculateSimilarity(normalizedTarget, normalizedSpoken)
    const isCorrect = similarity > 0.7

    let feedback = ''
    if (isCorrect) {
      feedback = '素晴らしい発音です！'
    } else if (similarity > 0.4) {
      feedback = 'もう少しです。もう一度試してみてください。'
    } else {
      feedback = `「${targetPhoneme}」の音を意識して発音してみてください。`
    }

    return {
      isCorrect,
      confidence: similarity,
      feedback
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length
    const len2 = str2.length
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0))

    for (let i = 0; i <= len1; i++) matrix[i][0] = i
    for (let j = 0; j <= len2; j++) matrix[0][j] = j

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }

    const distance = matrix[len1][len2]
    const maxLength = Math.max(len1, len2)
    return maxLength === 0 ? 1 : 1 - (distance / maxLength)
  }

  public dispose(): void {
    // オーディオクリップを停止・クリア
    this.audioClips.forEach((audio, clipId) => {
      if (audio.isPlaying) {
        audio.stop()
      }
      audio.disconnect()
    })
    this.audioClips.clear()

    // 音声認識を停止
    if (this.isListening) {
      this.stopSpeechRecognition()
    }

    // リスナーをカメラから削除
    this.camera.remove(this.listener)

    this.isInitialized = false
    logger.log('🎵 VR Audio Manager disposed')
  }
}

export default VRAudioManager