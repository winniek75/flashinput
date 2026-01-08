import { ref, computed, shallowRef, unref, watchEffect } from 'vue'
import { useIntersectionObserver, useStorage, useEventListener } from '@vueuse/core'
import logger from '@/utils/logger'

// Performance optimization types
export interface OptimizationConfig {
  lazyLoadImages: boolean
  preloadNextScene: boolean
  cacheStrategy: CacheStrategy
  compressionLevel: CompressionLevel
  performanceMode: PerformanceMode
  saveInterval: number
  maxCacheSize: number
  imageOptimization: ImageOptimizationConfig
}

export enum CacheStrategy {
  AGGRESSIVE = 'aggressive',
  BALANCED = 'balanced',
  MINIMAL = 'minimal',
  DISABLED = 'disabled'
}

export enum CompressionLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NONE = 'none'
}

export enum PerformanceMode {
  HIGH_QUALITY = 'high_quality',
  BALANCED = 'balanced',
  POWER_SAVING = 'power_saving',
  ULTRA_LOW = 'ultra_low'
}

export interface ImageOptimizationConfig {
  format: 'webp' | 'jpeg' | 'png' | 'avif'
  quality: number
  maxWidth: number
  maxHeight: number
  lazy: boolean
  placeholder: 'blur' | 'skeleton' | 'none'
  srcset: boolean
}

// Save system types
export interface SaveData {
  version: string
  timestamp: number
  checksum: string
  compressed: boolean
  data: {
    playerProgress: PlayerProgress
    storyStates: Map<string, StoryState>
    achievements: Achievement[]
    settings: GameSettings
    eventData: EventSaveData
  }
}

export interface PlayerProgress {
  currentStoryId: string
  currentSceneId: string
  completedStories: string[]
  completedScenes: Map<string, string[]>
  choices: Map<string, any>
  relationships: Map<string, number>
  stats: PlayerStats
}

export interface StoryState {
  storyId: string
  currentScene: string
  flags: Map<string, boolean>
  variables: Map<string, any>
  sceneHistory: string[]
  lastSaved: number
}

export interface PlayerStats {
  totalPlayTime: number
  scenesViewed: number
  choicesMade: number
  storiesCompleted: number
  achievementsUnlocked: number
}

export interface GameSettings {
  language: string
  textSpeed: number
  autoPlaySpeed: number
  skipMode: 'all' | 'read' | 'none'
  soundVolume: number
  musicVolume: number
  voiceVolume: number
  displayMode: 'window' | 'fullscreen'
  accessibility: AccessibilitySettings
}

export interface AccessibilitySettings {
  fontSize: number
  fontFamily: string
  highContrast: boolean
  reduceMotion: boolean
  screenReaderMode: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  dyslexiaFont: boolean
}

export interface EventSaveData {
  activeEvents: string[]
  eventProgress: Map<string, any>
  eventChoices: Map<string, any>
  rewards: string[]
}

// Skip functionality types
export interface SkipConfig {
  enabled: boolean
  mode: 'all' | 'read' | 'none'
  speed: number
  stopOnChoice: boolean
  stopOnUnread: boolean
  indicator: boolean
}

// Performance monitoring
export interface PerformanceMetrics {
  fps: number
  loadTime: number
  memoryUsage: number
  cacheHitRate: number
  renderTime: number
  networkLatency: number
}

/**
 * Story System Optimizer
 * Handles technical optimizations for the story system
 */
export class StorySystemOptimizer {
  private config = ref<OptimizationConfig>({
    lazyLoadImages: true,
    preloadNextScene: true,
    cacheStrategy: CacheStrategy.BALANCED,
    compressionLevel: CompressionLevel.MEDIUM,
    performanceMode: PerformanceMode.BALANCED,
    saveInterval: 30000, // 30 seconds
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    imageOptimization: {
      format: 'webp',
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      lazy: true,
      placeholder: 'blur',
      srcset: true
    }
  })

  private saveData = useStorage<SaveData>('language_galaxy_save', this.createEmptySaveData())
  private autoSaveTimer = ref<NodeJS.Timeout | null>(null)
  private imageCache = new Map<string, HTMLImageElement>()
  private audioCache = new Map<string, HTMLAudioElement>()
  private sceneCache = new Map<string, any>()
  private performanceMetrics = ref<PerformanceMetrics>({
    fps: 60,
    loadTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    renderTime: 0,
    networkLatency: 0
  })

  private skipConfig = ref<SkipConfig>({
    enabled: false,
    mode: 'read',
    speed: 50,
    stopOnChoice: true,
    stopOnUnread: true,
    indicator: true
  })

  constructor() {
    this.initializeOptimizer()
    this.startAutoSave()
    this.startPerformanceMonitoring()
  }

  /**
   * Save game progress with integrity checks
   */
  public async saveGame(quick: boolean = false): Promise<boolean> {
    try {
      const saveData = this.prepareSaveData()
      
      // Validate save data integrity
      if (!this.validateSaveData(saveData)) {
        logger.error('Save data validation failed')
        return false
      }

      // Compress if needed
      if (this.config.value.compressionLevel !== CompressionLevel.NONE) {
        saveData.compressed = true
        saveData.data = await this.compressData(saveData.data)
      }

      // Generate checksum
      saveData.checksum = await this.generateChecksum(saveData.data)

      // Save to storage
      this.saveData.value = saveData

      // Backup save
      if (!quick) {
        await this.createBackupSave(saveData)
      }

      return true
    } catch (error) {
      logger.error('Save failed:', error)
      return false
    }
  }

  /**
   * Load game with integrity verification
   */
  public async loadGame(): Promise<boolean> {
    try {
      const saveData = this.saveData.value
      
      if (!saveData || !saveData.data) {
        logger.log('No save data found')
        return false
      }

      // Verify checksum
      const calculatedChecksum = await this.generateChecksum(saveData.data)
      if (calculatedChecksum !== saveData.checksum) {
        logger.error('Save data corrupted')
        return false
      }

      // Decompress if needed
      let data = saveData.data
      if (saveData.compressed) {
        data = await this.decompressData(data)
      }

      // Apply loaded data
      await this.applyLoadedData(data)

      return true
    } catch (error) {
      logger.error('Load failed:', error)
      return false
    }
  }

  /**
   * Implement lazy loading for images
   */
  public setupImageLazyLoading(imageElement: HTMLImageElement, src: string): void {
    if (!this.config.value.lazyLoadImages) {
      imageElement.src = src
      return
    }

    const { stop } = useIntersectionObserver(
      imageElement,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          this.loadImage(src).then(img => {
            imageElement.src = img.src
            stop()
          })
        }
      },
      { threshold: 0.1 }
    )
  }

  /**
   * Preload next scene assets
   */
  public async preloadNextScene(nextSceneId: string): Promise<void> {
    if (!this.config.value.preloadNextScene) return

    try {
      // Check cache first
      if (this.sceneCache.has(nextSceneId)) return

      // Load scene data
      const sceneData = await this.fetchSceneData(nextSceneId)
      
      // Preload images
      const imagePromises = sceneData.images?.map((src: string) => this.preloadImage(src)) || []
      
      // Preload audio
      const audioPromises = sceneData.audio?.map((src: string) => this.preloadAudio(src)) || []
      
      // Wait for all assets
      await Promise.all([...imagePromises, ...audioPromises])
      
      // Cache scene data
      this.cacheScene(nextSceneId, sceneData)
    } catch (error) {
      logger.error('Failed to preload scene:', error)
    }
  }

  /**
   * Implement skip functionality
   */
  public startSkipping(): void {
    if (!this.skipConfig.value.enabled) return
    
    const skipInterval = setInterval(() => {
      if (!this.skipConfig.value.enabled) {
        clearInterval(skipInterval)
        return
      }

      // Check skip conditions
      if (this.shouldStopSkipping()) {
        this.stopSkipping()
        clearInterval(skipInterval)
        return
      }

      // Advance to next dialogue/scene
      this.advanceStory()
    }, 1000 / this.skipConfig.value.speed)
  }

  public stopSkipping(): void {
    this.skipConfig.value.enabled = false
  }

  /**
   * Optimize image loading
   */
  private async loadImage(src: string): Promise<HTMLImageElement> {
    // Check cache
    if (this.imageCache.has(src)) {
      this.updateCacheHitRate(true)
      return this.imageCache.get(src)!
    }

    this.updateCacheHitRate(false)

    // Create optimized image URL
    const optimizedSrc = this.getOptimizedImageUrl(src)

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.cacheImage(src, img)
        resolve(img)
      }
      img.onerror = reject
      img.src = optimizedSrc
    })
  }

  /**
   * Get optimized image URL based on settings
   */
  private getOptimizedImageUrl(src: string): string {
    const { format, quality, maxWidth, maxHeight } = this.config.value.imageOptimization
    
    // Build optimization parameters
    const params = new URLSearchParams({
      format,
      q: quality.toString(),
      w: maxWidth.toString(),
      h: maxHeight.toString()
    })

    // Return optimized URL (assumes image optimization service)
    return `/api/optimize-image?src=${encodeURIComponent(src)}&${params}`
  }

  /**
   * Performance monitoring
   */
  private startPerformanceMonitoring(): void {
    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        this.performanceMetrics.value.fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime
      }

      requestAnimationFrame(measureFPS)
    }

    measureFPS()

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.performanceMetrics.value.memoryUsage = memory.usedJSHeapSize / 1048576 // MB
      }, 5000)
    }
  }

  /**
   * Auto-save functionality
   */
  private startAutoSave(): void {
    this.autoSaveTimer.value = setInterval(() => {
      this.saveGame(true)
    }, this.config.value.saveInterval)
  }

  /**
   * Prepare save data
   */
  private prepareSaveData(): SaveData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      checksum: '',
      compressed: false,
      data: {
        playerProgress: this.getCurrentProgress(),
        storyStates: this.getStoryStates(),
        achievements: this.getAchievements(),
        settings: this.getSettings(),
        eventData: this.getEventData()
      }
    }
  }

  /**
   * Validate save data integrity
   */
  private validateSaveData(saveData: SaveData): boolean {
    // Check required fields
    if (!saveData.version || !saveData.timestamp || !saveData.data) {
      return false
    }

    // Validate data structure
    const { playerProgress, storyStates, achievements, settings, eventData } = saveData.data
    
    if (!playerProgress || !storyStates || !achievements || !settings || !eventData) {
      return false
    }

    return true
  }

  /**
   * Generate checksum for data integrity
   */
  private async generateChecksum(data: any): Promise<string> {
    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Compress data
   */
  private async compressData(data: any): Promise<any> {
    // Use CompressionStream API if available
    if ('CompressionStream' in window) {
      const stream = new Response(JSON.stringify(data)).body!
      const compressedStream = stream.pipeThrough(new (window as any).CompressionStream('gzip'))
      const compressedResponse = new Response(compressedStream)
      const compressedBlob = await compressedResponse.blob()
      return await compressedBlob.text()
    }
    
    // Fallback to simple compression
    return data
  }

  /**
   * Decompress data
   */
  private async decompressData(data: any): Promise<any> {
    // Use DecompressionStream API if available
    if ('DecompressionStream' in window) {
      const stream = new Response(data).body!
      const decompressedStream = stream.pipeThrough(new (window as any).DecompressionStream('gzip'))
      const decompressedResponse = new Response(decompressedStream)
      const decompressedText = await decompressedResponse.text()
      return JSON.parse(decompressedText)
    }
    
    // Fallback
    return data
  }

  /**
   * Create backup save
   */
  private async createBackupSave(saveData: SaveData): Promise<void> {
    const backupKey = `language_galaxy_backup_${Date.now()}`
    localStorage.setItem(backupKey, JSON.stringify(saveData))
    
    // Keep only last 3 backups
    const backups = Object.keys(localStorage)
      .filter(key => key.startsWith('language_galaxy_backup_'))
      .sort()
    
    if (backups.length > 3) {
      backups.slice(0, -3).forEach(key => localStorage.removeItem(key))
    }
  }

  /**
   * Cache management
   */
  private cacheImage(src: string, img: HTMLImageElement): void {
    if (this.config.value.cacheStrategy === CacheStrategy.DISABLED) return
    
    this.imageCache.set(src, img)
    this.manageCacheSize()
  }

  private cacheScene(sceneId: string, data: any): void {
    if (this.config.value.cacheStrategy === CacheStrategy.DISABLED) return
    
    this.sceneCache.set(sceneId, data)
    this.manageCacheSize()
  }

  private manageCacheSize(): void {
    // Estimate cache size
    const estimatedSize = (this.imageCache.size * 500000) + (this.sceneCache.size * 10000) // rough estimate
    
    if (estimatedSize > this.config.value.maxCacheSize) {
      // Remove oldest entries
      const imagesToRemove = Math.floor(this.imageCache.size * 0.2)
      const scenesToRemove = Math.floor(this.sceneCache.size * 0.2)
      
      const imageKeys = Array.from(this.imageCache.keys())
      const sceneKeys = Array.from(this.sceneCache.keys())
      
      imageKeys.slice(0, imagesToRemove).forEach(key => this.imageCache.delete(key))
      sceneKeys.slice(0, scenesToRemove).forEach(key => this.sceneCache.delete(key))
    }
  }

  /**
   * Performance optimizations based on mode
   */
  public applyPerformanceMode(mode: PerformanceMode): void {
    this.config.value.performanceMode = mode
    
    switch (mode) {
      case PerformanceMode.HIGH_QUALITY:
        this.config.value.imageOptimization.quality = 95
        this.config.value.compressionLevel = CompressionLevel.LOW
        this.config.value.cacheStrategy = CacheStrategy.AGGRESSIVE
        break
        
      case PerformanceMode.BALANCED:
        this.config.value.imageOptimization.quality = 85
        this.config.value.compressionLevel = CompressionLevel.MEDIUM
        this.config.value.cacheStrategy = CacheStrategy.BALANCED
        break
        
      case PerformanceMode.POWER_SAVING:
        this.config.value.imageOptimization.quality = 70
        this.config.value.compressionLevel = CompressionLevel.HIGH
        this.config.value.cacheStrategy = CacheStrategy.MINIMAL
        break
        
      case PerformanceMode.ULTRA_LOW:
        this.config.value.imageOptimization.quality = 50
        this.config.value.compressionLevel = CompressionLevel.HIGH
        this.config.value.cacheStrategy = CacheStrategy.DISABLED
        this.config.value.lazyLoadImages = false
        this.config.value.preloadNextScene = false
        break
    }
  }

  // Helper methods
  private createEmptySaveData(): SaveData {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      checksum: '',
      compressed: false,
      data: {
        playerProgress: {
          currentStoryId: '',
          currentSceneId: '',
          completedStories: [],
          completedScenes: new Map(),
          choices: new Map(),
          relationships: new Map(),
          stats: {
            totalPlayTime: 0,
            scenesViewed: 0,
            choicesMade: 0,
            storiesCompleted: 0,
            achievementsUnlocked: 0
          }
        },
        storyStates: new Map(),
        achievements: [],
        settings: {
          language: 'ja',
          textSpeed: 50,
          autoPlaySpeed: 30,
          skipMode: 'read',
          soundVolume: 100,
          musicVolume: 80,
          voiceVolume: 100,
          displayMode: 'window',
          accessibility: {
            fontSize: 16,
            fontFamily: 'default',
            highContrast: false,
            reduceMotion: false,
            screenReaderMode: false,
            colorBlindMode: 'none',
            dyslexiaFont: false
          }
        },
        eventData: {
          activeEvents: [],
          eventProgress: new Map(),
          eventChoices: new Map(),
          rewards: []
        }
      }
    }
  }

  private getCurrentProgress(): PlayerProgress {
    // This would get actual progress from game state
    return this.saveData.value.data.playerProgress
  }

  private getStoryStates(): Map<string, StoryState> {
    // This would get actual story states
    return this.saveData.value.data.storyStates
  }

  private getAchievements(): Achievement[] {
    // This would get actual achievements
    return this.saveData.value.data.achievements
  }

  private getSettings(): GameSettings {
    // This would get actual settings
    return this.saveData.value.data.settings
  }

  private getEventData(): EventSaveData {
    // This would get actual event data
    return this.saveData.value.data.eventData
  }

  private async fetchSceneData(sceneId: string): Promise<any> {
    // This would fetch actual scene data
    return {}
  }

  private async preloadImage(src: string): Promise<void> {
    return this.loadImage(src).then(() => {})
  }

  private async preloadAudio(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.oncanplaythrough = () => resolve()
      audio.onerror = reject
      audio.src = src
    })
  }

  private shouldStopSkipping(): boolean {
    // Check stop conditions
    return false
  }

  private advanceStory(): void {
    // This would advance the story
  }

  private updateCacheHitRate(hit: boolean): void {
    // Update cache hit rate metric
  }

  private async applyLoadedData(data: any): Promise<void> {
    // Apply loaded save data to game state
  }

  private initializeOptimizer(): void {
    logger.log('Story System Optimizer initialized')
  }

  // Public getters
  public get optimization(): OptimizationConfig {
    return this.config.value
  }

  public get metrics(): PerformanceMetrics {
    return this.performanceMetrics.value
  }

  public get skipSettings(): SkipConfig {
    return this.skipConfig.value
  }

  // Cleanup
  public destroy(): void {
    if (this.autoSaveTimer.value) {
      clearInterval(this.autoSaveTimer.value)
    }
    this.imageCache.clear()
    this.audioCache.clear()
    this.sceneCache.clear()
  }
}

// Achievement interface
export interface Achievement {
  id: string
  name: string
  description: string
  unlockedAt?: number
  progress: number
  maxProgress: number
}

// Export singleton instance
export const storySystemOptimizer = new StorySystemOptimizer()
export default storySystemOptimizer