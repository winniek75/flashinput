import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import { storySystemIntegration } from './StorySystemIntegration'
import { dynamicDialogueGenerator } from '../dialogue/DynamicDialogueGenerator'
import { gameStoryBridge } from './GameStoryBridge'
import type { Character } from '../characters/CharacterDatabase'
import logger from '@/utils/logger'

// Climax event types
export enum ClimaxEventType {
  CHAPTER_TRANSITION = 'chapter_transition',
  FINAL_BATTLE = 'final_battle',
  EMOTIONAL_PEAK = 'emotional_peak',
  REVELATION = 'revelation',
  TRANSFORMATION = 'transformation',
  ULTIMATE_UNITY = 'ultimate_unity',
  RESOLUTION = 'resolution'
}

// Dynamic adjustment levels
export enum DynamicLevel {
  GENTLE = 'gentle',
  MODERATE = 'moderate', 
  INTENSE = 'intense',
  EPIC = 'epic',
  TRANSCENDENT = 'transcendent'
}

export interface ClimaxConfiguration {
  playerProgress: {
    overallMastery: number // 0-100
    relationshipLevels: Map<string, number>
    learningAchievements: string[]
    playTime: number
    emotionalJourney: string[]
  }
  currentChapter: string
  targetEmotion: 'excitement' | 'wonder' | 'tension' | 'peace' | 'triumph' | 'transcendence'
  intensity: DynamicLevel
  musicSyncEnabled: boolean
  adaptiveDialogue: boolean
}

export interface ClimaxScene {
  id: string
  title: string
  type: ClimaxEventType
  duration: number
  characters: string[]
  dynamicElements: {
    backgroundMusic?: string
    particleEffects?: ParticleConfig[]
    cameraMovements?: CameraSequence[]
    lightingChanges?: LightingConfig[]
    emotionalCrescendo?: EmotionalArc[]
  }
  playerChoices?: ClimaxChoice[]
  adaptiveContent: {
    lowMastery: string[]
    mediumMastery: string[]
    highMastery: string[]
  }
}

export interface ParticleConfig {
  type: 'celebration' | 'magic' | 'energy' | 'emotion' | 'transcendence'
  intensity: number
  symbols: string[]
  colors: string[]
  duration: number
  syncWithMusic: boolean
}

export interface CameraSequence {
  movement: 'pan' | 'zoom' | 'shake' | 'orbit' | 'ascend' | 'transcend'
  duration: number
  parameters: Record<string, number>
  emotionalTiming: boolean
}

export interface LightingConfig {
  type: 'dramatic' | 'ethereal' | 'warm' | 'cosmic' | 'divine'
  intensity: number
  colorScheme: string[]
  transitionDuration: number
}

export interface EmotionalArc {
  startTime: number
  emotion: string
  intensity: number
  characterReactions: Map<string, string>
}

export interface ClimaxChoice {
  id: string
  text: string
  emotionalWeight: number
  masteryRequirement: number
  consequence: string
  alternateDialogue: string[]
}

/**
 * Climax Orchestrator
 * Manages dynamic climax scenes that adapt to player progress and choices
 */
export class ClimaxOrchestrator {
  private currentConfiguration = ref<ClimaxConfiguration | null>(null)
  private activeScenesQueue = ref<ClimaxScene[]>([])
  private emotionalState = ref<string>('neutral')
  private musicTimeline = ref<gsap.core.Timeline | null>(null)
  private effectsActive = ref<boolean>(false)

  constructor() {
    this.initializeOrchestrator()
  }

  /**
   * Initialize climax scene based on player progress
   */
  public initializeClimaxScene(
    chapterNumber: number,
    playerData: Record<string, any>
  ): ClimaxScene {
    const config = this.createConfiguration(chapterNumber, playerData)
    this.currentConfiguration.value = config
    
    const scene = this.generateAdaptiveScene(config)
    this.activeScenesQueue.value.push(scene)
    
    return scene
  }

  /**
   * Execute climax scene with full orchestration
   */
  public async executeClimaxScene(scene: ClimaxScene): Promise<void> {
    this.effectsActive.value = true
    
    // Start music timeline
    if (scene.dynamicElements.backgroundMusic) {
      await this.startMusicTimeline(scene)
    }
    
    // Initialize particle effects
    if (scene.dynamicElements.particleEffects) {
      this.startParticleEffects(scene.dynamicElements.particleEffects)
    }
    
    // Execute camera movements
    if (scene.dynamicElements.cameraMovements) {
      this.executeCameraSequences(scene.dynamicElements.cameraMovements)
    }
    
    // Apply lighting changes
    if (scene.dynamicElements.lightingChanges) {
      this.applyLightingEffects(scene.dynamicElements.lightingChanges)
    }
    
    // Process emotional crescendo
    if (scene.dynamicElements.emotionalCrescendo) {
      this.processEmotionalArc(scene.dynamicElements.emotionalCrescendo)
    }
    
    // Handle adaptive dialogue
    this.processAdaptiveDialogue(scene)
  }

  /**
   * Generate scene based on player mastery and emotional journey
   */
  private generateAdaptiveScene(config: ClimaxConfiguration): ClimaxScene {
    const sceneTemplates = this.getSceneTemplates()
    const template = sceneTemplates[config.currentChapter]
    
    if (!template) {
      return this.createDefaultScene(config)
    }
    
    // Adapt scene based on player mastery
    const adaptiveContent = this.selectContentByMastery(
      template.adaptiveContent,
      config.playerProgress.overallMastery
    )
    
    // Adjust intensity based on emotional journey
    const adjustedIntensity = this.calculateIntensity(config)
    
    // Generate dynamic elements
    const dynamicElements = this.generateDynamicElements(config, adjustedIntensity)
    
    return {
      ...template,
      dynamicElements,
      adaptiveContent: {
        lowMastery: adaptiveContent,
        mediumMastery: adaptiveContent,
        highMastery: adaptiveContent
      }
    }
  }

  /**
   * Start synchronized music timeline
   */
  private async startMusicTimeline(scene: ClimaxScene): Promise<void> {
    this.musicTimeline.value = gsap.timeline()
    
    // Load and play background music
    const audio = new Audio(scene.dynamicElements.backgroundMusic!)
    audio.volume = 0.6
    
    try {
      await audio.play()
      
      // Sync effects with music beats
      if (scene.dynamicElements.particleEffects) {
        this.syncEffectsWithMusic(audio, scene.dynamicElements.particleEffects)
      }
      
    } catch (error) {
      logger.warn('Audio playback failed:', error)
    }
  }

  /**
   * Start particle effects with intensity scaling
   */
  private startParticleEffects(effects: ParticleConfig[]): void {
    effects.forEach((effect, index) => {
      setTimeout(() => {
        this.createParticleSystem(effect)
      }, index * 1000) // Stagger effect starts
    })
  }

  /**
   * Create dynamic particle system
   */
  private createParticleSystem(config: ParticleConfig): void {
    const container = document.querySelector('.climax-scene-container')
    if (!container) return
    
    for (let i = 0; i < config.intensity * 10; i++) {
      const particle = document.createElement('div')
      particle.className = 'climax-particle'
      particle.textContent = config.symbols[Math.floor(Math.random() * config.symbols.length)]
      particle.style.color = config.colors[Math.floor(Math.random() * config.colors.length)]
      particle.style.position = 'absolute'
      particle.style.fontSize = `${1 + Math.random()}rem`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '1000'
      
      container.appendChild(particle)
      
      // Animate particle
      gsap.to(particle, {
        y: -100 - Math.random() * 200,
        x: (Math.random() - 0.5) * 200,
        opacity: 0,
        rotation: Math.random() * 360,
        scale: Math.random() * 2,
        duration: config.duration / 1000,
        ease: 'power2.out',
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        }
      })
    }
  }

  /**
   * Execute camera movement sequences
   */
  private executeCameraSequences(sequences: CameraSequence[]): void {
    const cameraElement = document.querySelector('.scene-camera')
    if (!cameraElement) return
    
    const timeline = gsap.timeline()
    
    sequences.forEach((sequence, index) => {
      const startTime = index * (sequence.duration / 1000)
      
      switch (sequence.movement) {
        case 'pan':
          timeline.to(cameraElement, {
            x: sequence.parameters.x || 0,
            y: sequence.parameters.y || 0,
            duration: sequence.duration / 1000,
            ease: 'power2.inOut'
          }, startTime)
          break
          
        case 'zoom':
          timeline.to(cameraElement, {
            scale: sequence.parameters.scale || 1,
            duration: sequence.duration / 1000,
            ease: 'power2.inOut'
          }, startTime)
          break
          
        case 'shake':
          timeline.to(cameraElement, {
            x: `+=${sequence.parameters.intensity || 10}`,
            duration: 0.1,
            ease: 'power2.inOut',
            yoyo: true,
            repeat: Math.floor((sequence.duration / 1000) * 10)
          }, startTime)
          break
          
        case 'orbit':
          timeline.to(cameraElement, {
            rotation: 360,
            transformOrigin: 'center center',
            duration: sequence.duration / 1000,
            ease: 'none'
          }, startTime)
          break
          
        case 'ascend':
          timeline.to(cameraElement, {
            y: -(sequence.parameters.height || 100),
            scale: sequence.parameters.scale || 1.2,
            duration: sequence.duration / 1000,
            ease: 'power2.out'
          }, startTime)
          break
          
        case 'transcend':
          timeline.to(cameraElement, {
            y: -200,
            scale: 1.5,
            opacity: 0.8,
            filter: 'brightness(1.5) blur(2px)',
            duration: sequence.duration / 1000,
            ease: 'power3.out'
          }, startTime)
          break
      }
    })
  }

  /**
   * Apply dynamic lighting effects
   */
  private applyLightingEffects(lightingConfigs: LightingConfig[]): void {
    const sceneElement = document.querySelector('.climax-scene')
    if (!sceneElement) return
    
    lightingConfigs.forEach((config, index) => {
      setTimeout(() => {
        const filter = this.createLightingFilter(config)
        gsap.to(sceneElement, {
          filter,
          duration: config.transitionDuration / 1000,
          ease: 'power2.inOut'
        })
      }, index * 2000)
    })
  }

  /**
   * Create lighting filter string
   */
  private createLightingFilter(config: LightingConfig): string {
    const filters: string[] = []
    
    switch (config.type) {
      case 'dramatic':
        filters.push(`contrast(${1 + config.intensity * 0.5})`)
        filters.push(`brightness(${0.8 + config.intensity * 0.4})`)
        break
        
      case 'ethereal':
        filters.push(`brightness(${1.2 + config.intensity * 0.3})`)
        filters.push(`blur(${config.intensity}px)`)
        filters.push('saturate(1.3)')
        break
        
      case 'warm':
        filters.push(`sepia(${config.intensity * 0.3})`)
        filters.push(`brightness(${1.1 + config.intensity * 0.2})`)
        break
        
      case 'cosmic':
        filters.push(`hue-rotate(${config.intensity * 60}deg)`)
        filters.push(`saturate(${1.5 + config.intensity * 0.5})`)
        break
        
      case 'divine':
        filters.push(`brightness(${1.5 + config.intensity * 0.5})`)
        filters.push(`contrast(${1.3 + config.intensity * 0.3})`)
        filters.push('saturate(1.2)')
        break
    }
    
    return filters.join(' ')
  }

  /**
   * Process emotional arc throughout scene
   */
  private processEmotionalArc(arc: EmotionalArc[]): void {
    arc.forEach(point => {
      setTimeout(() => {
        this.emotionalState.value = point.emotion
        this.triggerCharacterReactions(point.characterReactions, point.intensity)
      }, point.startTime)
    })
  }

  /**
   * Trigger character emotional reactions
   */
  private triggerCharacterReactions(
    reactions: Map<string, string>,
    intensity: number
  ): void {
    reactions.forEach((emotion, characterId) => {
      const characterElement = document.querySelector(`[data-character="${characterId}"]`)
      if (characterElement) {
        // Apply emotion-based animation
        gsap.to(characterElement, {
          scale: 1 + intensity * 0.1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          yoyo: true,
          repeat: 1
        })
        
        // Add emotion class for visual feedback
        characterElement.classList.add(`emotion-${emotion}`)
        setTimeout(() => {
          characterElement.classList.remove(`emotion-${emotion}`)
        }, 2000)
      }
    })
  }

  /**
   * Process adaptive dialogue based on player progress
   */
  private processAdaptiveDialogue(scene: ClimaxScene): void {
    if (!this.currentConfiguration.value?.adaptiveDialogue) return
    
    const mastery = this.currentConfiguration.value.playerProgress.overallMastery
    const relationships = this.currentConfiguration.value.playerProgress.relationshipLevels
    
    // Generate contextual dialogue for each character
    scene.characters.forEach(characterId => {
      const relationshipLevel = relationships.get(characterId) || 0
      const context = {
        playerName: dynamicDialogueGenerator.getPlayerName(),
        currentTime: new Date(),
        season: this.getCurrentSeason(),
        emotionalState: this.emotionalState.value as any,
        streakCount: gameStoryBridge.streakCount
      }
      
      // Generate dialogue based on relationship and mastery
      const dialogue = dynamicDialogueGenerator.generateDialogue(
        characterId,
        this.getDialogueCategoryForScene(scene.type),
        context
      )
      
      if (dialogue) {
        this.displayAdaptiveDialogue(characterId, dialogue.text, relationshipLevel)
      }
    })
  }

  /**
   * Display adaptive dialogue with relationship-based styling
   */
  private displayAdaptiveDialogue(
    characterId: string,
    text: string,
    relationshipLevel: number
  ): void {
    const dialogueElement = document.querySelector(`#dialogue-${characterId}`)
    if (!dialogueElement) return
    
    // Style based on relationship level
    const intimacyClass = relationshipLevel > 80 ? 'intimate' :
                         relationshipLevel > 60 ? 'close' :
                         relationshipLevel > 40 ? 'friendly' : 'formal'
    
    dialogueElement.classList.add(`relationship-${intimacyClass}`)
    dialogueElement.textContent = text
    
    // Animate text appearance
    gsap.fromTo(dialogueElement, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  }

  /**
   * Sync effects with music beats (simplified)
   */
  private syncEffectsWithMusic(audio: HTMLAudioElement, effects: ParticleConfig[]): void {
    // Create audio context for beat detection (simplified)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const source = audioContext.createMediaElementSource(audio)
    const analyser = audioContext.createAnalyser()
    
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const checkBeat = () => {
      analyser.getByteFrequencyData(dataArray)
      
      // Simple beat detection (sum of low frequencies)
      const bass = dataArray.slice(0, 5).reduce((sum, value) => sum + value, 0)
      
      if (bass > 600) { // Beat detected
        effects.forEach(effect => {
          if (effect.syncWithMusic) {
            this.createParticleSystem({
              ...effect,
              intensity: effect.intensity * 0.5 // Reduced intensity for beat sync
            })
          }
        })
      }
      
      if (this.effectsActive.value) {
        requestAnimationFrame(checkBeat)
      }
    }
    
    checkBeat()
  }

  // Helper methods

  private createConfiguration(chapterNumber: number, playerData: Record<string, any>): ClimaxConfiguration {
    return {
      playerProgress: {
        overallMastery: playerData.overallMastery || 50,
        relationshipLevels: new Map(Object.entries(playerData.relationships || {})),
        learningAchievements: playerData.achievements || [],
        playTime: playerData.playTime || 0,
        emotionalJourney: playerData.emotionalJourney || []
      },
      currentChapter: `chapter${chapterNumber}`,
      targetEmotion: this.getTargetEmotionForChapter(chapterNumber),
      intensity: this.calculateDynamicLevel(playerData.overallMastery || 50),
      musicSyncEnabled: true,
      adaptiveDialogue: true
    }
  }

  private getTargetEmotionForChapter(chapterNumber: number): 'excitement' | 'wonder' | 'tension' | 'peace' | 'triumph' | 'transcendence' {
    const emotions = ['excitement', 'wonder', 'tension', 'peace', 'triumph', 'transcendence'] as const
    return emotions[Math.min(chapterNumber - 1, emotions.length - 1)] || 'excitement'
  }

  private calculateDynamicLevel(mastery: number): DynamicLevel {
    if (mastery >= 90) return DynamicLevel.TRANSCENDENT
    if (mastery >= 75) return DynamicLevel.EPIC
    if (mastery >= 50) return DynamicLevel.INTENSE
    if (mastery >= 25) return DynamicLevel.MODERATE
    return DynamicLevel.GENTLE
  }

  private calculateIntensity(config: ClimaxConfiguration): number {
    const baseIntensity = {
      [DynamicLevel.GENTLE]: 0.3,
      [DynamicLevel.MODERATE]: 0.5,
      [DynamicLevel.INTENSE]: 0.7,
      [DynamicLevel.EPIC]: 0.9,
      [DynamicLevel.TRANSCENDENT]: 1.0
    }[config.intensity]
    
    // Adjust based on emotional journey
    const emotionalBoost = config.playerProgress.emotionalJourney.length * 0.05
    
    return Math.min(1.0, baseIntensity + emotionalBoost)
  }

  private generateDynamicElements(config: ClimaxConfiguration, intensity: number): any {
    return {
      backgroundMusic: this.selectMusicForEmotion(config.targetEmotion),
      particleEffects: this.generateParticleEffects(config.targetEmotion, intensity),
      cameraMovements: this.generateCameraMovements(config.intensity),
      lightingChanges: this.generateLightingChanges(config.targetEmotion, intensity),
      emotionalCrescendo: this.generateEmotionalArc(config)
    }
  }

  private selectMusicForEmotion(emotion: string): string {
    const musicMap = {
      'excitement': '/audio/music/climax_excitement.mp3',
      'wonder': '/audio/music/climax_wonder.mp3',
      'tension': '/audio/music/climax_tension.mp3',
      'peace': '/audio/music/climax_peace.mp3',
      'triumph': '/audio/music/climax_triumph.mp3',
      'transcendence': '/audio/music/climax_transcendence.mp3'
    }
    
    return musicMap[emotion as keyof typeof musicMap] || musicMap.excitement
  }

  private generateParticleEffects(emotion: string, intensity: number): ParticleConfig[] {
    const effectMap = {
      'excitement': [
        {
          type: 'energy' as const,
          intensity: intensity * 8,
          symbols: ['⚡', '🔥', '💥', '✨'],
          colors: ['#FFD700', '#FF4500', '#FF69B4'],
          duration: 3000,
          syncWithMusic: true
        }
      ],
      'transcendence': [
        {
          type: 'transcendence' as const,
          intensity: intensity * 12,
          symbols: ['🌟', '✨', '💫', '🕊️', '👼'],
          colors: ['#FFFFFF', '#FFD700', '#87CEEB'],
          duration: 5000,
          syncWithMusic: true
        }
      ]
    }
    
    return effectMap[emotion as keyof typeof effectMap] || effectMap.excitement
  }

  private generateCameraMovements(intensity: DynamicLevel): CameraSequence[] {
    const movementMap = {
      [DynamicLevel.GENTLE]: [
        { movement: 'pan' as const, duration: 3000, parameters: { x: 20, y: 10 }, emotionalTiming: true }
      ],
      [DynamicLevel.TRANSCENDENT]: [
        { movement: 'ascend' as const, duration: 4000, parameters: { height: 200, scale: 1.5 }, emotionalTiming: true },
        { movement: 'transcend' as const, duration: 6000, parameters: { scale: 2 }, emotionalTiming: true }
      ]
    }
    
    return movementMap[intensity] || movementMap[DynamicLevel.GENTLE]
  }

  private generateLightingChanges(emotion: string, intensity: number): LightingConfig[] {
    return [
      {
        type: emotion === 'transcendence' ? 'divine' : 'dramatic',
        intensity,
        colorScheme: ['#FFD700', '#FFFFFF', '#87CEEB'],
        transitionDuration: 2000
      }
    ]
  }

  private generateEmotionalArc(config: ClimaxConfiguration): EmotionalArc[] {
    return [
      {
        startTime: 0,
        emotion: 'anticipation',
        intensity: 0.5,
        characterReactions: new Map([
          ['captain_nova', 'focused'],
          ['aura', 'analytical']
        ])
      },
      {
        startTime: 15000,
        emotion: config.targetEmotion,
        intensity: 0.9,
        characterReactions: new Map([
          ['captain_nova', config.targetEmotion],
          ['the_translator', 'moved']
        ])
      }
    ]
  }

  private getDialogueCategoryForScene(sceneType: ClimaxEventType): string {
    const categoryMap = {
      [ClimaxEventType.FINAL_BATTLE]: 'encouragement',
      [ClimaxEventType.EMOTIONAL_PEAK]: 'celebration',
      [ClimaxEventType.REVELATION]: 'guidance',
      [ClimaxEventType.TRANSFORMATION]: 'celebration',
      [ClimaxEventType.RESOLUTION]: 'farewell'
    }
    
    return categoryMap[sceneType] || 'casual'
  }

  private selectContentByMastery(adaptiveContent: any, mastery: number): string[] {
    if (mastery >= 75) return adaptiveContent.highMastery || []
    if (mastery >= 50) return adaptiveContent.mediumMastery || []
    return adaptiveContent.lowMastery || []
  }

  private getSceneTemplates(): Record<string, any> {
    // This would normally load from the chapter JSON files
    return {
      'chapter4': { id: 'speed_climax', type: ClimaxEventType.FINAL_BATTLE },
      'chapter5': { id: 'unity_climax', type: ClimaxEventType.ULTIMATE_UNITY },
      'chapter6': { id: 'truth_climax', type: ClimaxEventType.REVELATION },
      'chapter7': { id: 'master_climax', type: ClimaxEventType.TRANSFORMATION }
    }
  }

  private createDefaultScene(config: ClimaxConfiguration): ClimaxScene {
    return {
      id: 'default_climax',
      title: 'Ultimate Challenge',
      type: ClimaxEventType.FINAL_BATTLE,
      duration: 30000,
      characters: ['captain_nova', 'aura'],
      dynamicElements: this.generateDynamicElements(config, 0.7),
      adaptiveContent: {
        lowMastery: ['Basic encouragement'],
        mediumMastery: ['Moderate challenge'],
        highMastery: ['Master level content']
      }
    }
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }

  private initializeOrchestrator(): void {
    // Initialize any required systems
    logger.log('Climax Orchestrator initialized')
  }

  // Public API methods
  public stopAllEffects(): void {
    this.effectsActive.value = false
    if (this.musicTimeline.value) {
      this.musicTimeline.value.kill()
    }
  }

  public get isActive(): boolean {
    return this.effectsActive.value
  }

  public get currentEmotion(): string {
    return this.emotionalState.value
  }
}

// Export singleton instance
export const climaxOrchestrator = new ClimaxOrchestrator()
export default climaxOrchestrator