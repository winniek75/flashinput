import logger from '@/utils/logger'

// AudioManager.js - 無効化版（エラー対策）
class AudioManager {
  constructor() {
    this.audioContext = null
    this.soundEffects = new Map()
    this.isEnabled = false // 音声を無効化
    this.volume = 0.7
    this.isInitialized = true // 初期化済みとして扱う

    // 音声ファイルは読み込まない（エラー回避）
    this.soundFiles = {}

    logger.log('🔇 AudioManager initialized in silent mode (error prevention)')
  }

  async init() {
    try {
      // 音声初期化をスキップ
      logger.log('🔇 Audio initialization skipped for stability')
      this.isInitialized = true
      return Promise.resolve()
    } catch (error) {
      logger.warn('AudioManager initialization failed:', error)
      this.isInitialized = false
    }
  }

  async preloadSounds() {
    // 音声読み込みをスキップ（エラー回避）
    logger.log('🔇 Sound preloading skipped')
    return Promise.resolve()
  }

  createFallbackSound(key) {
    // フォールバック音声も無効化
    const dummySound = {
      play: () => {
        logger.log(`🔇 [Silent] ${key} sound`)
        return Promise.resolve()
      }
    }
    this.soundEffects.set(key, dummySound)
  }

  playTone(frequency, duration) {
    // トーン再生も無効化
    logger.log(`🔇 [Silent] Tone: ${frequency}Hz for ${duration}s`)
  }

  async play(soundKey) {
    // 音声再生を無効化
    logger.log(`🔇 [Silent] Playing: ${soundKey}`)
    return Promise.resolve()
  }

  async playSequence(soundKeys, interval = 200) {
    // 音声シーケンス再生を無効化
    logger.log(`🔇 [Silent] Playing sequence: ${soundKeys.join(', ')}`)
    return Promise.resolve()
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    logger.log(`🔇 [Silent] Volume set to: ${this.volume}`)
  }

  setEnabled(enabled) {
    this.isEnabled = false // 常に無効
    logger.log(`🔇 [Silent] Audio remains disabled for stability`)
  }

  async playCombo(comboCount) {
    logger.log(`🔇 [Silent] Combo sound: ${comboCount}`)
    return Promise.resolve()
  }

  async playCorrect(level = 1) {
    logger.log(`🔇 [Silent] Correct sound (level ${level})`)
    return Promise.resolve()
  }

  async initializeOnUserGesture() {
    logger.log('🔇 [Silent] User gesture audio initialization skipped')
    return Promise.resolve()
  }

  destroy() {
    logger.log('🔇 AudioManager destroyed (silent mode)')
    this.soundEffects.clear()
  }

  // 追加のメソッド（互換性のため）
  playIncorrect() {
    logger.log('🔇 [Silent] Incorrect sound')
    return Promise.resolve()
  }

  playClick() {
    logger.log('🔇 [Silent] Click sound')
    return Promise.resolve()
  }

  playHover() {
    logger.log('🔇 [Silent] Hover sound')
    return Promise.resolve()
  }

  playGameStart() {
    logger.log('🔇 [Silent] Game start sound')
    return Promise.resolve()
  }

  playGameEnd() {
    logger.log('🔇 [Silent] Game end sound')
    return Promise.resolve()
  }

  playSuccess() {
    logger.log('🔇 [Silent] Success sound')
    return Promise.resolve()
  }

  playFail() {
    logger.log('🔇 [Silent] Fail sound')
    return Promise.resolve()
  }

  speak(text) {
    logger.log(`🔇 [Silent] TTS: ${text}`)
    return Promise.resolve()
  }

  playNotification() {
    logger.log('🔇 [Silent] Notification sound')
    return Promise.resolve()
  }

  playLevelUp() {
    logger.log('🔇 [Silent] Level up sound')
    return Promise.resolve()
  }

  playStar() {
    logger.log('🔇 [Silent] Star sound')
    return Promise.resolve()
  }

  playCountdown() {
    logger.log('🔇 [Silent] Countdown sound')
    return Promise.resolve()
  }
}

// シングルトンインスタンス（無効化版）
const audioManager = new AudioManager()

export default audioManager