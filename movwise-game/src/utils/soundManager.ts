import { ref, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import logger from '@/utils/logger'

// Audio types and interfaces
export interface AudioSettings {
  masterVolume: number        // 0-100
  musicVolume: number        // 0-100
  sfxVolume: number         // 0-100
  voiceVolume: number       // 0-100
  ambientVolume: number     // 0-100
  muted: boolean
  musicEnabled: boolean
  sfxEnabled: boolean
  voiceEnabled: boolean
  ambientEnabled: boolean
  spatialAudio: boolean
  audioQuality: 'low' | 'medium' | 'high'
  crossfade: boolean
  crossfadeDuration: number  // milliseconds
}

export interface AudioTrack {
  id: string
  url: string
  type: AudioType
  volume: number
  loop: boolean
  preload: boolean
  category: AudioCategory
  fadeIn?: number
  fadeOut?: number
  crossfade?: boolean
}

export interface PlaylistTrack extends AudioTrack {
  title: string
  artist?: string
  duration?: number
  bpm?: number
  mood?: string[]
  themes?: string[]
}

export interface SpatialAudioConfig {
  enabled: boolean
  listenerPosition: Vector3D
  listenerOrientation: Vector3D
  distanceModel: 'linear' | 'inverse' | 'exponential'
  maxDistance: number
  rolloffFactor: number
}

export interface AudioSource {
  id: string
  position: Vector3D
  volume: number
  maxDistance: number
  rolloffFactor: number
  coneInnerAngle?: number
  coneOuterAngle?: number
  coneOuterGain?: number
}

export interface Vector3D {
  x: number
  y: number
  z: number
}

export enum AudioType {
  MUSIC = 'music',
  SFX = 'sfx',
  VOICE = 'voice',
  AMBIENT = 'ambient',
  UI = 'ui'
}

export enum AudioCategory {
  BACKGROUND_MUSIC = 'bgm',
  GAME_SFX = 'game_sfx',
  UI_SFX = 'ui_sfx',
  CHARACTER_VOICE = 'character_voice',
  NARRATION = 'narration',
  AMBIENT_SOUND = 'ambient',
  FEEDBACK = 'feedback'
}

export interface AudioContext {
  context: AudioContext | null
  masterGain: GainNode | null
  musicGain: GainNode | null
  sfxGain: GainNode | null
  voiceGain: GainNode | null
  ambientGain: GainNode | null
  compressor: DynamicsCompressorNode | null
  spatialListener: AudioListener | null
}

export interface LoadedAudio {
  buffer: AudioBuffer
  lastUsed: number
  priority: number
  size: number
}

/**
 * Sound Manager
 * Comprehensive audio management system for Language Galaxy
 */
export class SoundManager {
  private audioSettings = useStorage<AudioSettings>('language_galaxy_audio', this.getDefaultSettings())
  private audioContext = ref<AudioContext>({
    context: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    voiceGain: null,
    ambientGain: null,
    compressor: null,
    spatialListener: null
  })
  
  private audioCache = new Map<string, LoadedAudio>()
  private activeAudio = new Map<string, AudioBufferSourceNode>()
  private playlists = new Map<string, PlaylistTrack[]>()
  private currentMusic = ref<string | null>(null)
  private currentPlaylist = ref<string | null>(null)
  private playlistIndex = ref(0)
  
  private spatialSources = new Map<string, AudioSource>()
  private fadeIntervals = new Map<string, NodeJS.Timeout>()
  
  private maxCacheSize = 50 * 1024 * 1024 // 50MB
  private currentCacheSize = ref(0)
  private preloadQueue: string[] = []
  private isInitialized = ref(false)

  constructor() {
    this.initializeAudioSystem()
    this.setupEventListeners()
    this.loadAudioAssets()
  }

  /**
   * Initialize Web Audio API and audio system
   */
  private async initializeAudioSystem(): Promise<void> {
    try {
      // Create audio context
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.audioContext.value.context = context

      // Create master gain node
      const masterGain = context.createGain()
      masterGain.connect(context.destination)
      this.audioContext.value.masterGain = masterGain

      // Create category gain nodes
      const musicGain = context.createGain()
      const sfxGain = context.createGain()
      const voiceGain = context.createGain()
      const ambientGain = context.createGain()

      musicGain.connect(masterGain)
      sfxGain.connect(masterGain)
      voiceGain.connect(masterGain)
      ambientGain.connect(masterGain)

      this.audioContext.value.musicGain = musicGain
      this.audioContext.value.sfxGain = sfxGain
      this.audioContext.value.voiceGain = voiceGain
      this.audioContext.value.ambientGain = ambientGain

      // Create compressor for audio quality
      const compressor = context.createDynamicsCompressor()
      compressor.threshold.value = -50
      compressor.knee.value = 40
      compressor.ratio.value = 12
      compressor.attack.value = 0
      compressor.release.value = 0.25
      
      masterGain.disconnect()
      masterGain.connect(compressor)
      compressor.connect(context.destination)
      this.audioContext.value.compressor = compressor

      // Setup spatial audio
      if (this.audioSettings.value.spatialAudio) {
        this.setupSpatialAudio()
      }

      // Apply initial settings
      this.applyAudioSettings()

      this.isInitialized.value = true
      logger.log('Sound Manager initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize audio system:', error)
      this.isInitialized.value = false
    }
  }

  /**
   * Setup spatial audio
   */
  private setupSpatialAudio(): void {
    const context = this.audioContext.value.context
    if (!context) return

    const listener = context.listener
    this.audioContext.value.spatialListener = listener

    // Set default listener position and orientation
    if (listener.positionX) {
      listener.positionX.value = 0
      listener.positionY.value = 0
      listener.positionZ.value = 0
      listener.forwardX.value = 0
      listener.forwardY.value = 0
      listener.forwardZ.value = -1
      listener.upX.value = 0
      listener.upY.value = 1
      listener.upZ.value = 0
    }
  }

  /**
   * Load audio file and cache it
   */
  public async loadAudio(url: string, priority: number = 5): Promise<AudioBuffer | null> {
    if (this.audioCache.has(url)) {
      const cached = this.audioCache.get(url)!
      cached.lastUsed = Date.now()
      return cached.buffer
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      const context = this.audioContext.value.context
      if (!context) throw new Error('Audio context not initialized')

      const audioBuffer = await context.decodeAudioData(arrayBuffer)
      
      // Cache management
      const size = arrayBuffer.byteLength
      if (this.currentCacheSize.value + size > this.maxCacheSize) {
        this.cleanupCache()
      }

      this.audioCache.set(url, {
        buffer: audioBuffer,
        lastUsed: Date.now(),
        priority,
        size
      })
      
      this.currentCacheSize.value += size
      
      return audioBuffer
    } catch (error) {
      logger.warn(`Failed to load audio: ${url}`, error)
      // Try fallback URL if original fails
      if (url.includes('/sounds/')) {
        const fallbackUrl = url.replace('/sounds/', '/audio/')
        try {
          const fallbackResponse = await fetch(fallbackUrl)
          if (fallbackResponse.ok) {
            const fallbackArrayBuffer = await fallbackResponse.arrayBuffer()
            const fallbackAudioBuffer = await context.decodeAudioData(fallbackArrayBuffer)
            logger.log(`✅ Fallback audio loaded: ${fallbackUrl}`)
            return fallbackAudioBuffer
          }
        } catch (fallbackError) {
          logger.warn(`Fallback audio also failed: ${fallbackUrl}`)
        }
      }
      
      // Silent failure for missing optional audio files
      return null
    }
  }

  /**
   * Play audio with full configuration
   */
  public async playAudio(
    track: AudioTrack,
    options: PlayAudioOptions = {}
  ): Promise<string | null> {
    if (!this.isInitialized.value) {
      await this.initializeAudioSystem()
    }

    const context = this.audioContext.value.context
    if (!context) return null

    // Check if audio type is enabled
    if (!this.isAudioTypeEnabled(track.type)) {
      return null
    }

    try {
      const buffer = await this.loadAudio(track.url)
      if (!buffer) return null

      const source = context.createBufferSource()
      const gainNode = context.createGain()
      
      source.buffer = buffer
      source.loop = track.loop

      // Connect to appropriate gain node
      const categoryGain = this.getCategoryGainNode(track.type)
      if (categoryGain) {
        source.connect(gainNode)
        gainNode.connect(categoryGain)
      }

      // Apply volume
      const volume = (track.volume / 100) * (this.getCategoryVolume(track.type) / 100)
      gainNode.gain.value = options.muted ? 0 : volume

      // Apply fade in
      if (track.fadeIn) {
        gainNode.gain.setValueAtTime(0, context.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + track.fadeIn / 1000)
      }

      // Setup spatial audio if enabled
      if (this.audioSettings.value.spatialAudio && options.spatialConfig) {
        this.applySpatialAudio(source, gainNode, options.spatialConfig)
      }

      // Start playing
      const startTime = options.startTime || 0
      const duration = options.duration
      
      if (duration) {
        source.start(context.currentTime, startTime, duration)
      } else {
        source.start(context.currentTime, startTime)
      }

      // Generate unique ID for this audio instance
      const audioId = `${track.id}_${Date.now()}_${Math.random()}`
      this.activeAudio.set(audioId, source)

      // Handle audio end
      source.onended = () => {
        this.activeAudio.delete(audioId)
        if (options.onEnd) {
          options.onEnd()
        }
      }

      // Auto-stop if duration specified
      if (duration) {
        setTimeout(() => {
          this.stopAudio(audioId)
        }, duration * 1000)
      }

      return audioId
    } catch (error) {
      logger.error('Failed to play audio:', error)
      return null
    }
  }

  /**
   * Play music with playlist support
   */
  public async playMusic(trackId: string, options: PlayMusicOptions = {}): Promise<boolean> {
    const track = this.getMusicTrack(trackId)
    if (!track) return false

    // Stop current music if crossfade is disabled
    if (this.currentMusic.value && !this.audioSettings.value.crossfade) {
      await this.stopMusic()
    }

    const audioId = await this.playAudio(track, {
      ...options,
      onEnd: () => {
        this.currentMusic.value = null
        if (options.onEnd) options.onEnd()
        
        // Auto-play next track in playlist
        if (this.currentPlaylist.value && options.autoNext !== false) {
          this.playNextInPlaylist()
        }
      }
    })

    if (audioId) {
      // Handle crossfade
      if (this.currentMusic.value && this.audioSettings.value.crossfade) {
        await this.crossfadeMusic(this.currentMusic.value, audioId)
      }
      
      this.currentMusic.value = audioId
      return true
    }

    return false
  }

  /**
   * Play sound effect
   */
  public async playSFX(
    soundId: string, 
    volume: number = 100,
    options: PlaySFXOptions = {}
  ): Promise<string | null> {
    try {
      const track: AudioTrack = {
        id: soundId,
        url: this.getSFXUrl(soundId),
        type: AudioType.SFX,
        volume,
        loop: false,
        preload: false,
        category: AudioCategory.GAME_SFX,
        ...options.trackOverrides
      }

      const result = await this.playAudio(track, options)
      if (!result) {
        logger.log(`🔇 SFX '${soundId}' not available, continuing silently`)
      }
      return result
    } catch (error) {
      logger.warn(`SFX playback failed for '${soundId}':`, error)
      return null
    }
  }

  /**
   * Play character voice
   */
  public async playVoice(
    characterId: string,
    lineId: string,
    options: PlayVoiceOptions = {}
  ): Promise<string | null> {
    const voiceUrl = this.getVoiceUrl(characterId, lineId)
    
    const track: AudioTrack = {
      id: `${characterId}_${lineId}`,
      url: voiceUrl,
      type: AudioType.VOICE,
      volume: options.volume || 100,
      loop: false,
      preload: true,
      category: AudioCategory.CHARACTER_VOICE,
      fadeIn: options.fadeIn
    }

    return await this.playAudio(track, {
      ...options,
      spatialConfig: options.characterPosition ? {
        id: characterId,
        position: options.characterPosition,
        volume: options.volume || 100,
        maxDistance: 10,
        rolloffFactor: 1
      } : undefined
    })
  }

  /**
   * Stop specific audio
   */
  public stopAudio(audioId: string, fadeOut: number = 0): void {
    const source = this.activeAudio.get(audioId)
    if (!source) return

    if (fadeOut > 0) {
      this.fadeOutAudio(audioId, fadeOut)
    } else {
      try {
        source.stop()
        this.activeAudio.delete(audioId)
      } catch (error) {
        // Audio might already be stopped or disconnected
        this.activeAudio.delete(audioId)
      }
    }
  }

  /**
   * Stop all audio of a specific type
   */
  public stopAllAudio(type?: AudioType, fadeOut: number = 0): void {
    const audioToStop: string[] = []

    for (const [audioId] of this.activeAudio) {
      if (!type || this.getAudioType(audioId) === type) {
        audioToStop.push(audioId)
      }
    }

    audioToStop.forEach(audioId => this.stopAudio(audioId, fadeOut))
  }

  /**
   * Stop current music
   */
  public async stopMusic(fadeOut: number = 1000): Promise<void> {
    if (this.currentMusic.value) {
      this.stopAudio(this.currentMusic.value, fadeOut)
      this.currentMusic.value = null
    }
  }

  /**
   * Pause/Resume audio
   */
  public pauseAudio(audioId: string): void {
    const context = this.audioContext.value.context
    if (context && context.state === 'running') {
      context.suspend()
    }
  }

  public resumeAudio(): void {
    const context = this.audioContext.value.context
    if (context && context.state === 'suspended') {
      context.resume()
    }
  }

  /**
   * Volume controls
   */
  public setMasterVolume(volume: number): void {
    this.audioSettings.value.masterVolume = Math.max(0, Math.min(100, volume))
    this.applyVolumeSettings()
  }

  public setMusicVolume(volume: number): void {
    this.audioSettings.value.musicVolume = Math.max(0, Math.min(100, volume))
    this.applyVolumeSettings()
  }

  public setSFXVolume(volume: number): void {
    this.audioSettings.value.sfxVolume = Math.max(0, Math.min(100, volume))
    this.applyVolumeSettings()
  }

  public setVoiceVolume(volume: number): void {
    this.audioSettings.value.voiceVolume = Math.max(0, Math.min(100, volume))
    this.applyVolumeSettings()
  }

  public setAmbientVolume(volume: number): void {
    this.audioSettings.value.ambientVolume = Math.max(0, Math.min(100, volume))
    this.applyVolumeSettings()
  }

  /**
   * Mute controls
   */
  public toggleMute(): void {
    this.audioSettings.value.muted = !this.audioSettings.value.muted
    this.applyVolumeSettings()
  }

  public mute(): void {
    this.audioSettings.value.muted = true
    this.applyVolumeSettings()
  }

  public unmute(): void {
    this.audioSettings.value.muted = false
    this.applyVolumeSettings()
  }

  /**
   * Playlist management
   */
  public createPlaylist(name: string, tracks: PlaylistTrack[]): void {
    this.playlists.set(name, tracks)
  }

  public playPlaylist(name: string, shuffle: boolean = false): boolean {
    const playlist = this.playlists.get(name)
    if (!playlist || playlist.length === 0) return false

    this.currentPlaylist.value = name
    this.playlistIndex.value = 0

    if (shuffle) {
      this.shufflePlaylist(name)
    }

    return this.playMusic(playlist[0].id, { autoNext: true })
  }

  public playNextInPlaylist(): void {
    if (!this.currentPlaylist.value) return

    const playlist = this.playlists.get(this.currentPlaylist.value)
    if (!playlist) return

    this.playlistIndex.value = (this.playlistIndex.value + 1) % playlist.length
    this.playMusic(playlist[this.playlistIndex.value].id, { autoNext: true })
  }

  public playPreviousInPlaylist(): void {
    if (!this.currentPlaylist.value) return

    const playlist = this.playlists.get(this.currentPlaylist.value)
    if (!playlist) return

    this.playlistIndex.value = this.playlistIndex.value === 0 
      ? playlist.length - 1 
      : this.playlistIndex.value - 1
    
    this.playMusic(playlist[this.playlistIndex.value].id, { autoNext: true })
  }

  /**
   * Spatial audio management
   */
  public updateListenerPosition(position: Vector3D, orientation?: Vector3D): void {
    const listener = this.audioContext.value.spatialListener
    if (!listener || !this.audioSettings.value.spatialAudio) return

    if (listener.positionX) {
      listener.positionX.value = position.x
      listener.positionY.value = position.y
      listener.positionZ.value = position.z

      if (orientation) {
        listener.forwardX.value = orientation.x
        listener.forwardY.value = orientation.y
        listener.forwardZ.value = orientation.z
      }
    }
  }

  public updateSpatialSource(audioId: string, position: Vector3D): void {
    const source = this.spatialSources.get(audioId)
    if (source) {
      source.position = position
    }
  }

  /**
   * Audio preloading
   */
  public preloadAudio(urls: string[], priority: number = 5): Promise<void[]> {
    return Promise.all(urls.map(url => this.loadAudio(url, priority)))
  }

  public preloadGameAssets(gameId: string): Promise<void[]> {
    const assets = this.getGameAudioAssets(gameId)
    return this.preloadAudio(assets.map(asset => asset.url))
  }

  /**
   * Apply audio settings
   */
  private applyAudioSettings(): void {
    this.applyVolumeSettings()
    
    // Apply spatial audio settings
    if (this.audioSettings.value.spatialAudio && !this.audioContext.value.spatialListener) {
      this.setupSpatialAudio()
    }
  }

  private applyVolumeSettings(): void {
    const { masterVolume, musicVolume, sfxVolume, voiceVolume, ambientVolume, muted } = this.audioSettings.value
    const masterGain = this.audioContext.value.masterGain
    const musicGain = this.audioContext.value.musicGain
    const sfxGain = this.audioContext.value.sfxGain
    const voiceGain = this.audioContext.value.voiceGain
    const ambientGain = this.audioContext.value.ambientGain

    if (!masterGain) return

    const masterLevel = muted ? 0 : masterVolume / 100

    masterGain.gain.value = masterLevel
    if (musicGain) musicGain.gain.value = musicVolume / 100
    if (sfxGain) sfxGain.gain.value = sfxVolume / 100
    if (voiceGain) voiceGain.gain.value = voiceVolume / 100
    if (ambientGain) ambientGain.gain.value = ambientVolume / 100
  }

  /**
   * Audio asset management
   */
  private loadAudioAssets(): void {
    // Load common UI sounds
    this.preloadAudio([
      '/audio/ui/button_click.mp3',
      '/audio/ui/button_hover.mp3',
      '/audio/ui/success.mp3',
      '/audio/ui/error.mp3',
      '/audio/ui/notification.mp3'
    ], 10)

    // Load background music playlists
    this.loadMusicPlaylists()
  }

  private loadMusicPlaylists(): void {
    // Home screen music
    this.createPlaylist('home', [
      {
        id: 'galaxy_runner',
        title: 'Galaxy Runner',
        url: '/audio/music/Galaxy_Runner.mp3',
        type: AudioType.MUSIC,
        volume: 80,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['epic', 'welcoming'],
        themes: ['home', 'menu']
      }
    ])

    // Game music
    this.createPlaylist('game', [
      {
        id: 'matrix_crisis',
        title: 'Matrix Crisis',
        url: '/audio/music/Matrix_Crisis.mp3',
        type: AudioType.MUSIC,
        volume: 75,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['intense', 'action'],
        themes: ['game', 'challenge']
      }
    ])

    // Galaxy exploration music
    this.createPlaylist('galaxy', [
      {
        id: 'galaxy_runner',
        title: 'Galaxy Runner',
        url: '/audio/music/Galaxy_Runner.mp3',
        type: AudioType.MUSIC,
        volume: 80,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['mysterious', 'expansive'],
        themes: ['space', 'exploration']
      },
      {
        id: 'matrix_crisis',
        title: 'Matrix Crisis',
        url: '/audio/music/Matrix_Crisis.mp3',
        type: AudioType.MUSIC,
        volume: 75,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['intense', 'action'],
        themes: ['space', 'battle']
      }
    ])

    // Game-specific playlists
    this.createPlaylist('sound_planet', [
      {
        id: 'matrix_crisis',
        title: 'Matrix Crisis',
        url: '/audio/music/Matrix_Crisis.mp3',
        type: AudioType.MUSIC,
        volume: 70,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['educational', 'rhythmic'],
        themes: ['sound', 'learning']
      }
    ])

    this.createPlaylist('word_planet', [
      {
        id: 'matrix_crisis',
        title: 'Matrix Crisis',
        url: '/audio/music/Matrix_Crisis.mp3',
        type: AudioType.MUSIC,
        volume: 75,
        loop: true,
        preload: true,
        category: AudioCategory.BACKGROUND_MUSIC,
        mood: ['upbeat', 'encouraging'],
        themes: ['words', 'adventure']
      }
    ])
  }

  /**
   * Helper methods
   */
  private getCategoryGainNode(type: AudioType): GainNode | null {
    switch (type) {
      case AudioType.MUSIC:
        return this.audioContext.value.musicGain
      case AudioType.SFX:
      case AudioType.UI:
        return this.audioContext.value.sfxGain
      case AudioType.VOICE:
        return this.audioContext.value.voiceGain
      case AudioType.AMBIENT:
        return this.audioContext.value.ambientGain
      default:
        return this.audioContext.value.sfxGain
    }
  }

  private getCategoryVolume(type: AudioType): number {
    switch (type) {
      case AudioType.MUSIC:
        return this.audioSettings.value.musicVolume
      case AudioType.SFX:
      case AudioType.UI:
        return this.audioSettings.value.sfxVolume
      case AudioType.VOICE:
        return this.audioSettings.value.voiceVolume
      case AudioType.AMBIENT:
        return this.audioSettings.value.ambientVolume
      default:
        return this.audioSettings.value.sfxVolume
    }
  }

  private isAudioTypeEnabled(type: AudioType): boolean {
    switch (type) {
      case AudioType.MUSIC:
        return this.audioSettings.value.musicEnabled
      case AudioType.SFX:
      case AudioType.UI:
        return this.audioSettings.value.sfxEnabled
      case AudioType.VOICE:
        return this.audioSettings.value.voiceEnabled
      case AudioType.AMBIENT:
        return this.audioSettings.value.ambientEnabled
      default:
        return true
    }
  }

  private getMusicTrack(trackId: string): PlaylistTrack | null {
    for (const playlist of this.playlists.values()) {
      const track = playlist.find(t => t.id === trackId)
      if (track) return track
    }
    return null
  }

  private getSFXUrl(soundId: string): string {
    // Map specific sound IDs to existing files
    const soundMap: { [key: string]: string } = {
      'object_interact': '/sounds/ui/click.mp3',
      'button_click': '/sounds/ui/click.mp3',
      'hover': '/sounds/ui/hover.mp3',
      'select': '/sounds/ui/select.mp3',
      'locked': '/sounds/ui/locked.mp3',
      'correct': '/sounds/game/correct.mp3',
      'incorrect': '/sounds/game/incorrect.mp3',
      'achievement': '/sounds/game/achievement.mp3',
      'level_up': '/sounds/game/level-up.mp3'
    }
    
    return soundMap[soundId] || `/sounds/ui/${soundId}.mp3`
  }

  private getVoiceUrl(characterId: string, lineId: string): string {
    return `/sounds/voices/${characterId}/${lineId}.mp3`
  }

  private getAudioType(audioId: string): AudioType {
    // Extract type from audio ID format
    if (audioId.includes('music')) return AudioType.MUSIC
    if (audioId.includes('voice')) return AudioType.VOICE
    if (audioId.includes('ambient')) return AudioType.AMBIENT
    return AudioType.SFX
  }

  private applySpatialAudio(
    source: AudioBufferSourceNode, 
    gainNode: GainNode, 
    config: AudioSource
  ): void {
    const context = this.audioContext.value.context
    if (!context) return

    const panner = context.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 1
    panner.maxDistance = config.maxDistance
    panner.rolloffFactor = config.rolloffFactor

    // Set position
    panner.positionX.value = config.position.x
    panner.positionY.value = config.position.y
    panner.positionZ.value = config.position.z

    // Connect through panner
    gainNode.disconnect()
    gainNode.connect(panner)
    panner.connect(this.getCategoryGainNode(AudioType.SFX) || this.audioContext.value.masterGain!)

    // Store spatial source for updates
    this.spatialSources.set(config.id, config)
  }

  private async crossfadeMusic(fromAudioId: string, toAudioId: string): Promise<void> {
    const duration = this.audioSettings.value.crossfadeDuration
    
    // Fade out current music
    this.fadeOutAudio(fromAudioId, duration)
    
    // Fade in new music (assuming it starts at 0 volume)
    setTimeout(() => {
      this.fadeInAudio(toAudioId, duration)
    }, 100)
  }

  private fadeOutAudio(audioId: string, duration: number): void {
    const source = this.activeAudio.get(audioId)
    if (!source) return

    const context = this.audioContext.value.context
    if (!context) return

    // This is a simplified fade out - in a real implementation,
    // you'd need to access the gain node connected to this source
    setTimeout(() => {
      this.stopAudio(audioId)
    }, duration)
  }

  private fadeInAudio(audioId: string, duration: number): void {
    // Similar to fadeOutAudio, this would need proper gain node access
    // This is a placeholder for the fade in implementation
  }

  private shufflePlaylist(name: string): void {
    const playlist = this.playlists.get(name)
    if (!playlist) return

    for (let i = playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]]
    }
  }

  private cleanupCache(): void {
    // Sort by last used time and priority
    const cacheEntries = Array.from(this.audioCache.entries())
      .sort((a, b) => {
        const priorityDiff = a[1].priority - b[1].priority
        if (priorityDiff !== 0) return priorityDiff
        return a[1].lastUsed - b[1].lastUsed
      })

    // Remove oldest/lowest priority entries until under size limit
    while (this.currentCacheSize.value > this.maxCacheSize * 0.8 && cacheEntries.length > 0) {
      const [url, cached] = cacheEntries.shift()!
      this.audioCache.delete(url)
      this.currentCacheSize.value -= cached.size
    }
  }

  private getGameAudioAssets(gameId: string): AudioTrack[] {
    // Return game-specific audio assets based on game ID
    const assetMap: Record<string, AudioTrack[]> = {
      'pronunciation_trainer': [
        { id: 'correct', url: '/audio/sfx/correct.mp3', type: AudioType.SFX, volume: 80, loop: false, preload: true, category: AudioCategory.FEEDBACK },
        { id: 'incorrect', url: '/audio/sfx/incorrect.mp3', type: AudioType.SFX, volume: 80, loop: false, preload: true, category: AudioCategory.FEEDBACK }
      ],
      'word_rush': [
        { id: 'timer_tick', url: '/audio/sfx/timer_tick.mp3', type: AudioType.SFX, volume: 60, loop: false, preload: true, category: AudioCategory.GAME_SFX },
        { id: 'word_complete', url: '/audio/sfx/word_complete.mp3', type: AudioType.SFX, volume: 70, loop: false, preload: true, category: AudioCategory.FEEDBACK }
      ]
    }

    return assetMap[gameId] || []
  }

  private setupEventListeners(): void {
    // Handle visibility change to pause/resume audio
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAudio('')
      } else {
        this.resumeAudio()
      }
    })

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.stopAllAudio()
    })

    // Handle settings changes
    watch(this.audioSettings, () => {
      this.applyAudioSettings()
    }, { deep: true })
  }

  private getDefaultSettings(): AudioSettings {
    return {
      masterVolume: 80,
      musicVolume: 70,
      sfxVolume: 80,
      voiceVolume: 90,
      ambientVolume: 60,
      muted: false,
      musicEnabled: true,
      sfxEnabled: true,
      voiceEnabled: true,
      ambientEnabled: true,
      spatialAudio: false,
      audioQuality: 'medium',
      crossfade: true,
      crossfadeDuration: 2000
    }
  }

  // Public getters
  public get settings(): AudioSettings {
    return this.audioSettings.value
  }

  public get initialized(): boolean {
    return this.isInitialized.value
  }

  public get currentlyPlaying(): string[] {
    return Array.from(this.activeAudio.keys())
  }

  public get cacheSize(): number {
    return this.currentCacheSize.value
  }

  public get availablePlaylists(): string[] {
    return Array.from(this.playlists.keys())
  }
}

// Additional interfaces for options
interface PlayAudioOptions {
  startTime?: number
  duration?: number
  muted?: boolean
  spatialConfig?: AudioSource
  onEnd?: () => void
}

interface PlayMusicOptions extends PlayAudioOptions {
  autoNext?: boolean
}

interface PlaySFXOptions extends PlayAudioOptions {
  trackOverrides?: Partial<AudioTrack>
}

interface PlayVoiceOptions extends PlayAudioOptions {
  volume?: number
  fadeIn?: number
  characterPosition?: Vector3D
}

// Export singleton instance
export const soundManager = new SoundManager()
export default soundManager