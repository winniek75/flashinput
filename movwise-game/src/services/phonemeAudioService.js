import logger from '@/utils/logger'

// src/services/phonemeAudioService.js - 音素音声ファイル管理サービス

export class PhonemeAudioService {
  constructor() {
    this.audioCache = new Map()
    this.baseUrl = '/sounds/'
    
    // 音素ファイルマッピング（public/soundsディレクトリのファイルに基づく）
    this.phonemeFiles = {
      // 子音
      'b': 'b.m4a',
      'd': 'd.m4a',
      'f': 'f.m4a',
      'g': 'g.m4a',
      'h': 'h.m4a',
      'j': 'j.m4a',
      'k': 'k.m4a',
      'l': 'l.m4a',
      'm': 'm.m4a',
      'n': 'n.m4a',
      'p': 'p.m4a',
      'r': 'r.m4a',
      's': 's.m4a',
      't': 't.m4a',
      'v': 'v.m4a',
      'w': 'w.m4a',
      'x': 'x.m4a',
      'y': 'y.m4a',
      'z': 'z.m4a',
      
      // 子音組み合わせ
      'ch': 'ch.m4a',
      'sh': 'sh.m4a',
      'th': 'th1.m4a', // voiceless th
      'ð': 'th2.m4a',  // voiced th
      'zh': 'zh.m4a',
      'qu': 'qu.m4a',
      'ck': 'ck.m4a',
      'ng': 'ng.m4a',
      
      // ブレンド
      'bl': 'bl.m4a',
      'br': 'br.m4a',
      'cl': 'cl.m4a',
      'cr': 'cr.m4a',
      'dr': 'dr.m4a',
      'fl': 'fl.m4a',
      'fr': 'fr.m4a',
      'gl': 'gl.m4a',
      'gr': 'gr.m4a',
      'pl': 'pl.m4a',
      'pr': 'pr.m4a',
      'sc': 'sc.m4a',
      'sk': 'sk.m4a',
      'sl': 'sl.m4a',
      'sm': 'sm.m4a',
      'sn': 'sn.m4a',
      'sp': 'sp.m4a',
      'st': 'st 2.m4a',
      'sw': 'sw.m4a',
      'tr': 'tr.m4a',
      'tw': 'tw.m4a',
      'scr': 'scr.m4a',
      'spl': 'spl.m4a',
      'spr': 'spr.m4a',
      'str': 'str.m4a',
      'thr': 'thr.m4a',
      
      // 母音（数字付きで複数バリエーション）
      'a': 'a1.m4a',
      'e': 'e1.m4a',
      'i': 'i1.m4a',
      'o': 'o1.m4a',
      'u': 'u.m4a',  // 基本的な母音uの音
      
      // 母音バリエーション
      'æ': 'a1.m4a',  // short a
      'eɪ': 'a2.m4a', // long a
      'ɑ': 'a3.m4a',  // ah
      'ɛ': 'e1.m4a',  // short e
      'iː': 'e2.m4a', // long e
      'ɪ': 'i1.m4a',  // short i
      'aɪ': 'i2.m4a', // long i
      'ɒ': 'o1.m4a',  // short o
      'oʊ': 'o2.m4a', // long o
      'ʌ': 'u1.m4a',  // short u
      'uː': 'u2.m4a', // long u
      'ʊ': 'u3.m4a',  // book u
      
      // R-controlled vowels
      'ar': 'ar.m4a',
      'er': 'er.m4a',
      'or': 'or.m4a',
      'air': 'air.m4a',
      'ear': 'ear.m4a',
      'ure': 'ure.m4a',
      
      // 二重母音
      'oi': 'oi.m4a',
      'ow': 'ow.m4a',
      
      // エンディング
      'ct': 'ct.m4a',
      'ft': 'ft.m4a',
      'ld': 'ld.m4a',
      'lf': 'lf.m4a',
      'lk': 'lk.m4a',
      'lm': 'lm.m4a',
      'lp': 'lp.m4a',
      'lt': 'lt.m4a',
      'mb': 'mb.m4a',
      'mp': 'mp.m4a',
      'nd': 'nd.m4a',
      'nk': 'nk.m4a',
      'nt': 'nt.m4a',
      'rd': 'rd.m4a',
      'rf': 'rf.m4a',
      'rk': 'rk.m4a',
      'rl': 'rl.m4a',
      'rm': 'rm.m4a',
      'rn': 'rn.m4a',
      'rt': 'rt.m4a'
    }
    
    // CV組み合わせ用のフォールバック戦略
    this.fallbackStrategy = {
      // 利用可能な子音
      consonants: ['b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'],
      // 利用可能な母音
      vowels: ['a', 'e', 'i', 'o', 'u']
    }
  }
  
  // 音素の音声ファイルパスを取得
  getPhonemeFilePath(phoneme) {
    const cleanPhoneme = phoneme.toLowerCase().trim()
    
    // 直接マッピングが存在する場合
    if (this.phonemeFiles[cleanPhoneme]) {
      return this.baseUrl + this.phonemeFiles[cleanPhoneme]
    }
    
    // CV組み合わせの場合の分解
    if (cleanPhoneme.length === 2) {
      const consonant = cleanPhoneme[0]
      const vowel = cleanPhoneme[1]
      
      // 子音と母音それぞれが利用可能かチェック
      if (this.phonemeFiles[consonant] && this.phonemeFiles[vowel]) {
        return {
          consonant: this.baseUrl + this.phonemeFiles[consonant],
          vowel: this.baseUrl + this.phonemeFiles[vowel],
          combination: cleanPhoneme
        }
      }
    }
    
    // フォールバック: 最も近い音素を検索
    return this.findClosestPhoneme(cleanPhoneme)
  }
  
  // 最も近い音素を検索
  findClosestPhoneme(phoneme) {
    // 簡単な類似性マッチング
    const availablePhonemes = Object.keys(this.phonemeFiles)
    
    // 完全一致の部分文字列検索
    for (const available of availablePhonemes) {
      if (phoneme.includes(available) || available.includes(phoneme)) {
        return this.baseUrl + this.phonemeFiles[available]
      }
    }
    
    // デフォルトフォールバック
    return this.baseUrl + this.phonemeFiles['a']
  }
  
  // 音声ファイルの存在確認
  async checkFileExists(filePath) {
    try {
      const response = await fetch(filePath, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      logger.warn('File check failed:', filePath, error)
      return false
    }
  }
  
  // 音声ファイルをプリロード
  async preloadPhoneme(phoneme) {
    const filePath = this.getPhonemeFilePath(phoneme)
    
    if (typeof filePath === 'string') {
      return this.loadAudioFile(filePath, phoneme)
    } else if (filePath.consonant && filePath.vowel) {
      // CV組み合わせの場合、両方をプリロード
      const consonantAudio = await this.loadAudioFile(filePath.consonant, phoneme + '_consonant')
      const vowelAudio = await this.loadAudioFile(filePath.vowel, phoneme + '_vowel')
      return { consonant: consonantAudio, vowel: vowelAudio }
    }
    
    return null
  }
  
  // 音声ファイルを読み込み
  async loadAudioFile(filePath, cacheKey) {
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)
    }
    
    try {
      const audio = new Audio(filePath)
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(cacheKey, audio)
          logger.log('✅ Audio loaded:', filePath)
          resolve(audio)
        })
        
        audio.addEventListener('error', (error) => {
          logger.error('❌ Audio load failed:', filePath, error)
          reject(error)
        })
        
        audio.load()
      })
      
    } catch (error) {
      logger.error('Audio creation failed:', filePath, error)
      throw error
    }
  }
  
  // 音素を再生
  async playPhoneme(phoneme, options = {}) {
    try {
      const filePath = this.getPhonemeFilePath(phoneme)
      
      if (typeof filePath === 'string') {
        // 単一ファイルの再生
        const audio = await this.loadAudioFile(filePath, phoneme)
        return this.playAudioWithOptions(audio, options)
      } else if (filePath.consonant && filePath.vowel) {
        // CV組み合わせの再生
        return this.playCVCombination(filePath, options)
      }
      
      throw new Error(`No audio file found for phoneme: ${phoneme}`)
      
    } catch (error) {
      logger.error('Phoneme playback failed:', phoneme, error)
      throw error
    }
  }
  
  // CV組み合わせの再生
  async playCVCombination(filePaths, options = {}) {
    try {
      logger.log('🎯 Playing CV combination:', filePaths.combination)
      logger.log('📁 Consonant file:', filePaths.consonant)
      logger.log('📁 Vowel file:', filePaths.vowel)
      
      const consonantAudio = await this.loadAudioFile(filePaths.consonant, filePaths.combination + '_consonant')
      const vowelAudio = await this.loadAudioFile(filePaths.vowel, filePaths.combination + '_vowel')
      
      // 子音を再生
      logger.log('🎵 Playing consonant...')
      await this.playAudioWithOptions(consonantAudio, { ...options, volume: options.volume || 0.8 })
      
      // 短い間隔をあけて母音を再生
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            logger.log('🎵 Playing vowel...')
            await this.playAudioWithOptions(vowelAudio, options)
            logger.log('✅ CV combination playback completed')
            resolve(true)
          } catch (error) {
            logger.error('❌ Vowel playback failed:', error)
            reject(error)
          }
        }, options.delay || 200)
      })
      
    } catch (error) {
      logger.error('❌ CV combination playback failed:', error)
      throw error
    }
  }
  
  // オプション付きで音声再生
  async playAudioWithOptions(audio, options = {}) {
    return new Promise((resolve, reject) => {
      // 音声設定
      audio.volume = Math.max(0, Math.min(1, options.volume || 0.8))
      audio.playbackRate = Math.max(0.5, Math.min(2, options.rate || 1.0))
      
      logger.log('🎵 Playing audio with options:', {
        volume: audio.volume,
        rate: audio.playbackRate,
        src: audio.src
      })
      
      // Track current audio
      this.currentAudio = audio
      
      // イベントリスナー
      const onEnded = () => {
        logger.log('✅ Audio playback ended successfully')
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
        this.currentAudio = null
        resolve(true)
      }
      
      const onError = (error) => {
        logger.error('❌ Audio playback error:', error)
        audio.removeEventListener('ended', onEnded)
        audio.removeEventListener('error', onError)
        this.currentAudio = null
        reject(error)
      }
      
      audio.addEventListener('ended', onEnded)
      audio.addEventListener('error', onError)
      
      // 再生開始
      audio.currentTime = 0
      audio.play()
        .then(() => logger.log('🎵 Audio play() succeeded'))
        .catch((error) => {
          logger.error('❌ Audio play() failed:', error)
          reject(error)
        })
    })
  }
  
  // Stop all currently playing audio
  stopAll() {
    logger.log('🛑 Stopping all audio playback')
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
  }

  // 利用可能な音素リストを取得
  getAvailablePhonemes() {
    return Object.keys(this.phonemeFiles)
  }
  
  // CV組み合わせで利用可能な組み合わせを生成
  getAvailableCVCombinations() {
    const combinations = []
    
    for (const consonant of this.fallbackStrategy.consonants) {
      for (const vowel of this.fallbackStrategy.vowels) {
        const cv = consonant + vowel
        combinations.push({
          combination: cv,
          consonant: consonant,
          vowel: vowel,
          hasAudio: this.phonemeFiles[consonant] && this.phonemeFiles[vowel]
        })
      }
    }
    
    return combinations
  }
  
  // キャッシュをクリア
  clearCache() {
    this.audioCache.clear()
    logger.log('Audio cache cleared')
  }
  
  // リソースを解放
  dispose() {
    for (const audio of this.audioCache.values()) {
      if (audio && typeof audio.pause === 'function') {
        audio.pause()
        audio.src = ''
      }
    }
    this.clearCache()
  }
}

// シングルトンインスタンス
export const phonemeAudioService = new PhonemeAudioService()