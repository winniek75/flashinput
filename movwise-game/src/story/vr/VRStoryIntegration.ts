import { ref, computed } from 'vue'
import type { StoryScene } from '../types/StoryTypes'
import logger from '@/utils/logger'

// VR Story Integration Types
export interface VRStoryScene extends StoryScene {
  vrEnabled: boolean
  spatialConfiguration: SpatialConfiguration
  immersiveElements: ImmersiveElement[]
  interactionZones: InteractionZone[]
  audioSpatialData: AudioSpatialData
  gestureControls: GestureControl[]
  viewingRestrictions: ViewingRestriction[]
  comfortSettings: ComfortSettings
}

export interface SpatialConfiguration {
  sceneLayout: '360_panorama' | 'room_scale' | 'seated' | 'standing'
  characterPositions: CharacterPosition[]
  environmentDepth: number
  skyboxTexture?: string
  floorTexture?: string
  ambientLighting: LightingConfig
  focusPoints: FocusPoint[]
}

export interface CharacterPosition {
  characterId: string
  position: Vector3
  rotation: Vector3
  scale: number
  animationSpace: number
  interactionDistance: number
  voiceDirection: Vector3
  eyeContact: boolean
}

export interface ImmersiveElement {
  id: string
  type: 'particle' | 'object' | 'effect' | 'ui_element'
  position: Vector3
  behavior: ImmersiveBehavior
  triggerCondition?: string
  duration?: number
  interactive: boolean
}

export interface ImmersiveBehavior {
  animation?: string
  particleSystem?: ParticleConfig
  sound?: SpatialSound
  hapticFeedback?: HapticPattern
}

export interface InteractionZone {
  id: string
  shape: 'sphere' | 'box' | 'cylinder'
  position: Vector3
  dimensions: Vector3
  triggerType: 'gaze' | 'proximity' | 'gesture' | 'voice'
  action: InteractionAction
  visualIndicator: boolean
  hapticOnEnter?: HapticPattern
}

export interface InteractionAction {
  type: 'dialogue' | 'examine' | 'pick_up' | 'navigate' | 'menu'
  target?: string
  parameters?: any
  feedback: InteractionFeedback
}

export interface InteractionFeedback {
  visual?: string
  audio?: string
  haptic?: HapticPattern
  duration: number
}

export interface AudioSpatialData {
  ambientSounds: SpatialSound[]
  characterVoices: Map<string, VoiceSpatialization>
  effectSounds: SpatialSound[]
  reverbZones: ReverbZone[]
  occlusionEnabled: boolean
}

export interface SpatialSound {
  source: string
  position: Vector3
  volume: number
  falloffDistance: number
  loop: boolean
  spatial: boolean
  dopplerEffect: boolean
}

export interface VoiceSpatialization {
  characterId: string
  basePosition: Vector3
  headTracking: boolean
  lipSyncData?: LipSyncData
  emotionalModulation: boolean
}

export interface ReverbZone {
  shape: 'sphere' | 'box'
  position: Vector3
  dimensions: Vector3
  reverbPreset: 'small_room' | 'large_hall' | 'outdoor' | 'cave' | 'custom'
  intensity: number
}

export interface GestureControl {
  gesture: 'point' | 'grab' | 'swipe' | 'pinch' | 'wave' | 'thumbs_up'
  action: string
  sensitivity: number
  cooldown: number
  visualFeedback: boolean
  tutorialHint?: string
}

export interface ViewingRestriction {
  minDistance: number
  maxDistance: number
  heightRange: [number, number]
  viewingAngle: number
  autoAdjust: boolean
}

export interface ComfortSettings {
  vignette: VignetteConfig
  snapTurning: boolean
  turnAngle: number
  movementSpeed: number
  teleportation: boolean
  heightAdjustment: 'automatic' | 'manual' | 'fixed'
  motionSmoothing: number
  breakReminders: boolean
  breakInterval: number
}

export interface VignetteConfig {
  enabled: boolean
  intensity: number
  color: string
  triggerOnMovement: boolean
  triggerOnRotation: boolean
}

// VR Preparation Types
export interface VRReadinessCheck {
  hardwareCompatible: boolean
  performanceAdequate: boolean
  spaceAvailable: boolean
  comfortSettingsConfigured: boolean
  tutorialCompleted: boolean
  warnings: VRWarning[]
}

export interface VRWarning {
  type: 'motion_sickness' | 'space_required' | 'performance' | 'accessibility'
  severity: 'info' | 'warning' | 'critical'
  message: string
  solution?: string
}

// Camera and movement types
export interface VRCameraConfig {
  defaultPosition: Vector3
  defaultRotation: Vector3
  fov: number
  nearClip: number
  farClip: number
  smoothing: number
  headBobbing: boolean
  parallaxEffect: boolean
}

export interface VRMovementPath {
  id: string
  points: Vector3[]
  duration: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  lookAtTarget?: string
  triggers?: PathTrigger[]
}

export interface PathTrigger {
  position: number // 0-1 along path
  action: string
  parameters?: any
}

// Utility types
export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface HapticPattern {
  intensity: number
  duration: number
  frequency: number
  pattern?: number[]
}

export interface ParticleConfig {
  texture: string
  count: number
  size: number
  color: string
  lifetime: number
  velocity: Vector3
  gravity: number
  spread: number
}

export interface LipSyncData {
  phonemes: Phoneme[]
  blendShapes: Map<string, number>
}

export interface Phoneme {
  time: number
  phoneme: string
  weight: number
}

/**
 * VR Story Integration System
 * Prepares story content for VR experiences
 */
export class VRStoryIntegration {
  private vrScenes = ref<Map<string, VRStoryScene>>(new Map())
  private vrReadiness = ref<VRReadinessCheck>({
    hardwareCompatible: false,
    performanceAdequate: false,
    spaceAvailable: false,
    comfortSettingsConfigured: false,
    tutorialCompleted: false,
    warnings: []
  })
  private cameraConfig = ref<VRCameraConfig>({
    defaultPosition: { x: 0, y: 1.6, z: 0 },
    defaultRotation: { x: 0, y: 0, z: 0 },
    fov: 90,
    nearClip: 0.1,
    farClip: 1000,
    smoothing: 0.1,
    headBobbing: false,
    parallaxEffect: true
  })
  private comfortPresets = ref<Map<string, ComfortSettings>>(new Map())

  constructor() {
    this.initializeVRSystem()
    this.loadComfortPresets()
  }

  /**
   * Convert regular story scene to VR-ready scene
   */
  public async convertToVRScene(scene: StoryScene): Promise<VRStoryScene> {
    const vrScene: VRStoryScene = {
      ...scene,
      vrEnabled: true,
      spatialConfiguration: this.generateSpatialConfiguration(scene),
      immersiveElements: this.generateImmersiveElements(scene),
      interactionZones: this.generateInteractionZones(scene),
      audioSpatialData: this.generateAudioSpatialData(scene),
      gestureControls: this.generateGestureControls(scene),
      viewingRestrictions: this.generateViewingRestrictions(scene),
      comfortSettings: this.getDefaultComfortSettings()
    }

    // Store converted scene
    this.vrScenes.value.set(scene.id, vrScene)

    return vrScene
  }

  /**
   * Generate spatial configuration for scene
   */
  private generateSpatialConfiguration(scene: StoryScene): SpatialConfiguration {
    const layout = this.determineSceneLayout(scene)
    const positions = this.calculateCharacterPositions(scene.characters || [])

    return {
      sceneLayout: layout,
      characterPositions: positions,
      environmentDepth: this.calculateEnvironmentDepth(layout),
      skyboxTexture: this.getSkyboxForScene(scene),
      floorTexture: this.getFloorTextureForScene(scene),
      ambientLighting: this.generateLightingConfig(scene),
      focusPoints: this.identifyFocusPoints(scene)
    }
  }

  /**
   * Calculate optimal character positions for VR
   */
  private calculateCharacterPositions(characters: string[]): CharacterPosition[] {
    const positions: CharacterPosition[] = []
    const radius = 2.5 // meters
    const height = 1.6 // average eye height

    characters.forEach((characterId, index) => {
      const angle = (index / characters.length) * Math.PI * 2
      const position: CharacterPosition = {
        characterId,
        position: {
          x: Math.cos(angle) * radius,
          y: this.getCharacterHeight(characterId),
          z: Math.sin(angle) * radius
        },
        rotation: {
          x: 0,
          y: -angle + Math.PI, // Face center
          z: 0
        },
        scale: 1,
        animationSpace: 1.5,
        interactionDistance: 2,
        voiceDirection: {
          x: -Math.cos(angle),
          y: 0,
          z: -Math.sin(angle)
        },
        eyeContact: true
      }
      positions.push(position)
    })

    return positions
  }

  /**
   * Generate immersive elements for scene
   */
  private generateImmersiveElements(scene: StoryScene): ImmersiveElement[] {
    const elements: ImmersiveElement[] = []

    // Add ambient particles based on scene mood
    if (scene.mood === 'magical' || scene.mood === 'mysterious') {
      elements.push({
        id: 'ambient_particles',
        type: 'particle',
        position: { x: 0, y: 2, z: 0 },
        behavior: {
          particleSystem: {
            texture: '/textures/particles/sparkle.png',
            count: 100,
            size: 0.1,
            color: '#FFD700',
            lifetime: 5,
            velocity: { x: 0, y: 0.5, z: 0 },
            gravity: -0.1,
            spread: 5
          }
        },
        interactive: false
      })
    }

    // Add interactive objects based on scene content
    if (scene.interactiveElements) {
      scene.interactiveElements.forEach((element, index) => {
        elements.push({
          id: `interactive_${index}`,
          type: 'object',
          position: this.calculateObjectPosition(index),
          behavior: {
            animation: 'float',
            hapticFeedback: {
              intensity: 0.5,
              duration: 100,
              frequency: 200
            }
          },
          interactive: true
        })
      })
    }

    return elements
  }

  /**
   * Generate interaction zones
   */
  private generateInteractionZones(scene: StoryScene): InteractionZone[] {
    const zones: InteractionZone[] = []

    // Dialogue choice zones
    if (scene.choices) {
      scene.choices.forEach((choice, index) => {
        const angle = (index / scene.choices.length) * Math.PI * 2
        zones.push({
          id: `choice_${index}`,
          shape: 'sphere',
          position: {
            x: Math.cos(angle) * 1.5,
            y: 1.2,
            z: Math.sin(angle) * 1.5
          },
          dimensions: { x: 0.5, y: 0.5, z: 0.5 },
          triggerType: 'gaze',
          action: {
            type: 'dialogue',
            target: choice.id,
            feedback: {
              visual: 'highlight',
              audio: '/sounds/ui/select.mp3',
              haptic: {
                intensity: 0.3,
                duration: 50,
                frequency: 150
              },
              duration: 200
            }
          },
          visualIndicator: true
        })
      })
    }

    // Character interaction zones
    scene.characters?.forEach(characterId => {
      zones.push({
        id: `character_${characterId}`,
        shape: 'cylinder',
        position: this.getCharacterPosition(characterId),
        dimensions: { x: 1, y: 2, z: 1 },
        triggerType: 'proximity',
        action: {
          type: 'examine',
          target: characterId,
          feedback: {
            visual: 'outline',
            duration: 100
          }
        },
        visualIndicator: false
      })
    })

    return zones
  }

  /**
   * Generate spatial audio configuration
   */
  private generateAudioSpatialData(scene: StoryScene): AudioSpatialData {
    const ambientSounds: SpatialSound[] = []
    const characterVoices = new Map<string, VoiceSpatialization>()
    const effectSounds: SpatialSound[] = []
    const reverbZones: ReverbZone[] = []

    // Setup ambient sounds
    if (scene.ambientSound) {
      ambientSounds.push({
        source: scene.ambientSound,
        position: { x: 0, y: 0, z: 0 },
        volume: 0.3,
        falloffDistance: 100,
        loop: true,
        spatial: false,
        dopplerEffect: false
      })
    }

    // Setup character voices
    scene.characters?.forEach(characterId => {
      const position = this.getCharacterPosition(characterId)
      characterVoices.set(characterId, {
        characterId,
        basePosition: position,
        headTracking: true,
        emotionalModulation: true
      })
    })

    // Determine reverb based on environment
    const reverbPreset = this.getReverbPreset(scene.location)
    reverbZones.push({
      shape: 'box',
      position: { x: 0, y: 0, z: 0 },
      dimensions: { x: 10, y: 5, z: 10 },
      reverbPreset,
      intensity: 0.5
    })

    return {
      ambientSounds,
      characterVoices,
      effectSounds,
      reverbZones,
      occlusionEnabled: true
    }
  }

  /**
   * Generate gesture controls for scene
   */
  private generateGestureControls(scene: StoryScene): GestureControl[] {
    const controls: GestureControl[] = [
      {
        gesture: 'point',
        action: 'select_choice',
        sensitivity: 0.8,
        cooldown: 500,
        visualFeedback: true,
        tutorialHint: '選択肢を指差して選択'
      },
      {
        gesture: 'swipe',
        action: 'next_dialogue',
        sensitivity: 0.7,
        cooldown: 300,
        visualFeedback: true,
        tutorialHint: 'スワイプで次へ進む'
      },
      {
        gesture: 'pinch',
        action: 'open_menu',
        sensitivity: 0.9,
        cooldown: 1000,
        visualFeedback: true,
        tutorialHint: 'ピンチでメニューを開く'
      }
    ]

    // Add scene-specific gestures
    if (scene.vrGestures) {
      controls.push(...scene.vrGestures)
    }

    return controls
  }

  /**
   * Generate viewing restrictions
   */
  private generateViewingRestrictions(scene: StoryScene): ViewingRestriction[] {
    return [{
      minDistance: 0.5,
      maxDistance: 5,
      heightRange: [0.5, 2.5],
      viewingAngle: 180,
      autoAdjust: true
    }]
  }

  /**
   * Get default comfort settings
   */
  private getDefaultComfortSettings(): ComfortSettings {
    return {
      vignette: {
        enabled: true,
        intensity: 0.4,
        color: '#000000',
        triggerOnMovement: true,
        triggerOnRotation: true
      },
      snapTurning: true,
      turnAngle: 30,
      movementSpeed: 2,
      teleportation: true,
      heightAdjustment: 'automatic',
      motionSmoothing: 0.8,
      breakReminders: true,
      breakInterval: 30 * 60 * 1000 // 30 minutes
    }
  }

  /**
   * Prepare scene for VR viewing
   */
  public async prepareSceneForVR(sceneId: string): Promise<VRStoryScene | null> {
    // Check VR readiness
    const readiness = await this.checkVRReadiness()
    if (!readiness.hardwareCompatible) {
      logger.error('VR hardware not compatible')
      return null
    }

    // Get or convert scene
    let vrScene = this.vrScenes.value.get(sceneId)
    if (!vrScene) {
      const regularScene = await this.fetchSceneData(sceneId)
      if (!regularScene) return null
      vrScene = await this.convertToVRScene(regularScene)
    }

    // Apply comfort settings
    vrScene.comfortSettings = this.getUserComfortSettings()

    // Optimize for current hardware
    await this.optimizeForHardware(vrScene)

    return vrScene
  }

  /**
   * Check VR readiness
   */
  public async checkVRReadiness(): Promise<VRReadinessCheck> {
    const check: VRReadinessCheck = {
      hardwareCompatible: await this.checkHardwareCompatibility(),
      performanceAdequate: await this.checkPerformance(),
      spaceAvailable: await this.checkPlaySpace(),
      comfortSettingsConfigured: this.areComfortSettingsConfigured(),
      tutorialCompleted: this.isTutorialCompleted(),
      warnings: []
    }

    // Add warnings
    if (!check.performanceAdequate) {
      check.warnings.push({
        type: 'performance',
        severity: 'warning',
        message: 'パフォーマンスが最適ではありません',
        solution: '画質設定を下げることをお勧めします'
      })
    }

    if (!check.spaceAvailable) {
      check.warnings.push({
        type: 'space_required',
        severity: 'info',
        message: '立ち上がってプレイする十分なスペースがありません',
        solution: '座ってプレイモードを使用してください'
      })
    }

    this.vrReadiness.value = check
    return check
  }

  /**
   * Generate VR camera path for cinematic moments
   */
  public generateCameraPath(
    startPos: Vector3,
    endPos: Vector3,
    duration: number,
    lookAtTarget?: string
  ): VRMovementPath {
    const path: VRMovementPath = {
      id: `path_${Date.now()}`,
      points: this.interpolatePoints(startPos, endPos, 10),
      duration,
      easing: 'ease-in-out',
      lookAtTarget,
      triggers: []
    }

    return path
  }

  /**
   * Apply comfort preset
   */
  public applyComfortPreset(presetName: string): void {
    const preset = this.comfortPresets.value.get(presetName)
    if (preset) {
      // Apply preset settings
      Object.assign(this.getDefaultComfortSettings(), preset)
    }
  }

  // Helper methods
  private determineSceneLayout(scene: StoryScene): SpatialConfiguration['sceneLayout'] {
    // Determine best layout based on scene type
    if (scene.type === 'dialogue') return 'seated'
    if (scene.type === 'exploration') return 'room_scale'
    if (scene.type === 'cinematic') return '360_panorama'
    return 'standing'
  }

  private calculateEnvironmentDepth(layout: SpatialConfiguration['sceneLayout']): number {
    const depthMap = {
      '360_panorama': 100,
      'room_scale': 10,
      'seated': 5,
      'standing': 7
    }
    return depthMap[layout]
  }

  private getSkyboxForScene(scene: StoryScene): string {
    // Return appropriate skybox based on scene location
    return `/textures/skybox/${scene.location || 'default'}.hdr`
  }

  private getFloorTextureForScene(scene: StoryScene): string {
    return `/textures/floor/${scene.location || 'default'}.jpg`
  }

  private generateLightingConfig(scene: StoryScene): LightingConfig {
    return {
      ambientIntensity: 0.4,
      ambientColor: '#FFFFFF',
      directionalIntensity: 0.6,
      directionalColor: '#FFFACD',
      directionalPosition: { x: 5, y: 10, z: 5 }
    }
  }

  private identifyFocusPoints(scene: StoryScene): FocusPoint[] {
    const points: FocusPoint[] = []
    
    // Add character positions as focus points
    scene.characters?.forEach(characterId => {
      points.push({
        id: `character_${characterId}`,
        position: this.getCharacterPosition(characterId),
        importance: 'high',
        label: characterId
      })
    })

    return points
  }

  private getCharacterHeight(characterId: string): number {
    // Return character-specific height
    const heights: Record<string, number> = {
      'captain_nova': 1.75,
      'professor_phonix': 1.70,
      'lexia': 1.60,
      'aura': 1.65,
      'unity': 1.68,
      'grammar_guardian': 1.80
    }
    return heights[characterId] || 1.65
  }

  private calculateObjectPosition(index: number): Vector3 {
    const angle = (index / 4) * Math.PI * 2
    return {
      x: Math.cos(angle) * 1,
      y: 1,
      z: Math.sin(angle) * 1
    }
  }

  private getCharacterPosition(characterId: string): Vector3 {
    // This would get actual character position from spatial configuration
    return { x: 0, y: 1.6, z: 2 }
  }

  private getReverbPreset(location?: string): ReverbZone['reverbPreset'] {
    const presetMap: Record<string, ReverbZone['reverbPreset']> = {
      'indoor': 'small_room',
      'hall': 'large_hall',
      'outdoor': 'outdoor',
      'cave': 'cave'
    }
    return presetMap[location || 'indoor'] || 'small_room'
  }

  private async checkHardwareCompatibility(): Promise<boolean> {
    // Check for WebXR support
    if ('xr' in navigator) {
      try {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-vr')
        return supported
      } catch {
        return false
      }
    }
    return false
  }

  private async checkPerformance(): Promise<boolean> {
    // Simple performance check
    const frameRate = this.measureFrameRate()
    return frameRate > 72 // Minimum for comfortable VR
  }

  private async checkPlaySpace(): Promise<boolean> {
    // This would check actual play space if available
    return true
  }

  private areComfortSettingsConfigured(): boolean {
    return localStorage.getItem('vr_comfort_configured') === 'true'
  }

  private isTutorialCompleted(): boolean {
    return localStorage.getItem('vr_tutorial_completed') === 'true'
  }

  private measureFrameRate(): number {
    // Simplified frame rate measurement
    return 90
  }

  private getUserComfortSettings(): ComfortSettings {
    const saved = localStorage.getItem('vr_comfort_settings')
    if (saved) {
      return JSON.parse(saved)
    }
    return this.getDefaultComfortSettings()
  }

  private async fetchSceneData(sceneId: string): Promise<StoryScene | null> {
    // This would fetch actual scene data
    return null
  }

  private async optimizeForHardware(scene: VRStoryScene): Promise<void> {
    // Optimize based on detected hardware capabilities
    const gpuTier = this.detectGPUTier()
    
    if (gpuTier === 'low') {
      // Reduce particle counts
      scene.immersiveElements.forEach(element => {
        if (element.behavior.particleSystem) {
          element.behavior.particleSystem.count = Math.floor(element.behavior.particleSystem.count * 0.5)
        }
      })
      
      // Simplify lighting
      scene.spatialConfiguration.ambientLighting.ambientIntensity = 0.6
    }
  }

  private detectGPUTier(): 'high' | 'medium' | 'low' {
    // Simplified GPU detection
    return 'medium'
  }

  private interpolatePoints(start: Vector3, end: Vector3, steps: number): Vector3[] {
    const points: Vector3[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      points.push({
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
        z: start.z + (end.z - start.z) * t
      })
    }
    return points
  }

  private loadComfortPresets(): void {
    // Comfort preset for sensitive users
    this.comfortPresets.value.set('comfort', {
      vignette: {
        enabled: true,
        intensity: 0.6,
        color: '#000000',
        triggerOnMovement: true,
        triggerOnRotation: true
      },
      snapTurning: true,
      turnAngle: 15,
      movementSpeed: 1.5,
      teleportation: true,
      heightAdjustment: 'automatic',
      motionSmoothing: 0.9,
      breakReminders: true,
      breakInterval: 20 * 60 * 1000
    })

    // Preset for experienced users
    this.comfortPresets.value.set('experienced', {
      vignette: {
        enabled: false,
        intensity: 0,
        color: '#000000',
        triggerOnMovement: false,
        triggerOnRotation: false
      },
      snapTurning: false,
      turnAngle: 45,
      movementSpeed: 3,
      teleportation: false,
      heightAdjustment: 'manual',
      motionSmoothing: 0.3,
      breakReminders: true,
      breakInterval: 60 * 60 * 1000
    })
  }

  private initializeVRSystem(): void {
    logger.log('VR Story Integration System initialized')
  }

  // Public getters
  public get readinessStatus(): VRReadinessCheck {
    return this.vrReadiness.value
  }

  public get camera(): VRCameraConfig {
    return this.cameraConfig.value
  }

  public getVRScene(sceneId: string): VRStoryScene | undefined {
    return this.vrScenes.value.get(sceneId)
  }
}

// Additional interfaces
interface LightingConfig {
  ambientIntensity: number
  ambientColor: string
  directionalIntensity: number
  directionalColor: string
  directionalPosition: Vector3
}

interface FocusPoint {
  id: string
  position: Vector3
  importance: 'high' | 'medium' | 'low'
  label?: string
}

// Export singleton instance
export const vrStoryIntegration = new VRStoryIntegration()
export default vrStoryIntegration