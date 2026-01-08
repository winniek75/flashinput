import { gsap } from 'gsap'

// Transition Types
export type TransitionType = 
  | 'fade' 
  | 'slide' 
  | 'zoom' 
  | 'warp' 
  | 'dissolve' 
  | 'portal' 
  | 'starfield'
  | 'planet_approach'
  | 'hyperspace'
  | 'crystal_teleport'

export interface TransitionConfig {
  duration: number
  ease?: string
  direction?: 'in' | 'out' | 'cross'
  parameters?: Record<string, any>
}

export interface TransitionResult {
  timeline: gsap.core.Timeline
  promise: Promise<void>
}

// Star field configuration
interface StarFieldConfig {
  starCount: number
  speed: number
  colors: string[]
  size: number
  depth: number
}

// Warp effect configuration
interface WarpConfig {
  lineCount: number
  speed: number
  intensity: number
  color: string
}

// Planet approach configuration
interface PlanetConfig {
  planetImage: string
  approachSpeed: number
  rotationSpeed: number
  atmosphereColor: string
}

/**
 * Scene Transition Manager
 * Handles all types of scene transitions with animations
 */
export class SceneTransitionManager {
  private container: HTMLElement
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private animationFrame: number | null = null
  private stars: Star[] = []
  private warpLines: WarpLine[] = []

  constructor(container: HTMLElement) {
    this.container = container
    this.initializeCanvas()
  }

  private initializeCanvas(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.pointerEvents = 'none'
    this.canvas.style.zIndex = '1000'
    
    this.ctx = this.canvas.getContext('2d')
    this.resizeCanvas()
    
    window.addEventListener('resize', () => this.resizeCanvas())
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx) return
    
    const rect = this.container.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
  }

  /**
   * Execute a scene transition
   */
  public executeTransition(
    type: TransitionType, 
    config: TransitionConfig = { duration: 1000 }
  ): TransitionResult {
    const timeline = gsap.timeline()
    
    // Add canvas to container if not already added
    if (this.canvas && !this.container.contains(this.canvas)) {
      this.container.appendChild(this.canvas)
    }

    let promise: Promise<void>

    switch (type) {
      case 'fade':
        promise = this.createFadeTransition(timeline, config)
        break
      case 'slide':
        promise = this.createSlideTransition(timeline, config)
        break
      case 'zoom':
        promise = this.createZoomTransition(timeline, config)
        break
      case 'warp':
        promise = this.createWarpTransition(timeline, config)
        break
      case 'dissolve':
        promise = this.createDissolveTransition(timeline, config)
        break
      case 'portal':
        promise = this.createPortalTransition(timeline, config)
        break
      case 'starfield':
        promise = this.createStarfieldTransition(timeline, config)
        break
      case 'planet_approach':
        promise = this.createPlanetApproachTransition(timeline, config)
        break
      case 'hyperspace':
        promise = this.createHyperspaceTransition(timeline, config)
        break
      case 'crystal_teleport':
        promise = this.createCrystalTeleportTransition(timeline, config)
        break
      default:
        promise = this.createFadeTransition(timeline, config)
    }

    return { timeline, promise }
  }

  /**
   * Fade Transition
   */
  private async createFadeTransition(
    timeline: gsap.core.Timeline, 
    config: TransitionConfig
  ): Promise<void> {
    const overlay = this.createOverlay()
    
    if (config.direction === 'out') {
      timeline.to(overlay, {
        opacity: 1,
        duration: config.duration / 1000,
        ease: config.ease || 'power2.inOut'
      })
    } else if (config.direction === 'in') {
      overlay.style.opacity = '1'
      timeline.to(overlay, {
        opacity: 0,
        duration: config.duration / 1000,
        ease: config.ease || 'power2.inOut',
        onComplete: () => overlay.remove()
      })
    } else {
      // Cross fade
      timeline
        .to(overlay, {
          opacity: 1,
          duration: config.duration / 2000,
          ease: config.ease || 'power2.inOut'
        })
        .to(overlay, {
          opacity: 0,
          duration: config.duration / 2000,
          ease: config.ease || 'power2.inOut',
          onComplete: () => overlay.remove()
        })
    }

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  /**
   * Slide Transition
   */
  private async createSlideTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    const overlay = this.createOverlay()
    const direction = config.parameters?.direction || 'left'
    
    const transforms = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)'
    }

    overlay.style.transform = transforms[direction as keyof typeof transforms]

    timeline
      .to(overlay, {
        transform: 'translate(0, 0)',
        duration: config.duration / 2000,
        ease: config.ease || 'power2.inOut'
      })
      .to(overlay, {
        transform: transforms[direction === 'left' ? 'right' : 
                             direction === 'right' ? 'left' :
                             direction === 'up' ? 'down' : 'up' as keyof typeof transforms],
        duration: config.duration / 2000,
        ease: config.ease || 'power2.inOut',
        onComplete: () => overlay.remove()
      })

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  /**
   * Zoom Transition
   */
  private async createZoomTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    const overlay = this.createOverlay()
    overlay.style.borderRadius = '50%'
    overlay.style.transform = 'scale(0)'

    timeline
      .to(overlay, {
        scale: 3,
        duration: config.duration / 1000,
        ease: config.ease || 'power2.inOut',
        onComplete: () => overlay.remove()
      })

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  /**
   * Warp Transition (Hyperspace effect)
   */
  private async createWarpTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    if (!this.canvas || !this.ctx) return Promise.resolve()

    const warpConfig: WarpConfig = {
      lineCount: config.parameters?.lineCount || 100,
      speed: config.parameters?.speed || 20,
      intensity: config.parameters?.intensity || 5,
      color: config.parameters?.color || '#00FFFF'
    }

    this.initializeWarpLines(warpConfig)
    this.canvas.style.opacity = '1'

    const animateWarp = () => {
      this.updateWarpLines(warpConfig)
      this.renderWarpLines(warpConfig)
    }

    timeline.call(() => {
      this.animationFrame = requestAnimationFrame(function animate() {
        animateWarp()
        requestAnimationFrame(animate)
      })
    })

    return new Promise(resolve => {
      timeline.call(() => {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame)
        }
        if (this.canvas) {
          this.canvas.style.opacity = '0'
        }
        resolve()
      }, [], config.duration / 1000)
    })
  }

  /**
   * Starfield Transition
   */
  private async createStarfieldTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    if (!this.canvas || !this.ctx) return Promise.resolve()

    const starConfig: StarFieldConfig = {
      starCount: config.parameters?.starCount || 200,
      speed: config.parameters?.speed || 2,
      colors: config.parameters?.colors || ['#FFFFFF', '#87CEEB', '#FFD700'],
      size: config.parameters?.size || 2,
      depth: config.parameters?.depth || 1000
    }

    this.initializeStars(starConfig)
    this.canvas.style.opacity = '1'

    const animateStars = () => {
      this.updateStars(starConfig)
      this.renderStars(starConfig)
    }

    timeline.call(() => {
      this.animationFrame = requestAnimationFrame(function animate() {
        animateStars()
        requestAnimationFrame(animate)
      })
    })

    return new Promise(resolve => {
      timeline.call(() => {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame)
        }
        if (this.canvas) {
          this.canvas.style.opacity = '0'
        }
        resolve()
      }, [], config.duration / 1000)
    })
  }

  /**
   * Planet Approach Transition
   */
  private async createPlanetApproachTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    const planetOverlay = this.createPlanetOverlay(config.parameters as PlanetConfig)

    timeline
      .fromTo(planetOverlay, {
        scale: 0.1,
        opacity: 0.5
      }, {
        scale: 2,
        opacity: 1,
        duration: config.duration / 1000,
        ease: config.ease || 'power2.inOut',
        onComplete: () => planetOverlay.remove()
      })

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  /**
   * Hyperspace Transition
   */
  private async createHyperspaceTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    return this.createWarpTransition(timeline, {
      ...config,
      parameters: {
        lineCount: 150,
        speed: 30,
        intensity: 8,
        color: '#00FFFF'
      }
    })
  }

  /**
   * Crystal Teleport Transition
   */
  private async createCrystalTeleportTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    const crystalOverlay = this.createCrystalOverlay()

    timeline
      .fromTo(crystalOverlay, {
        scale: 0,
        rotation: 0,
        opacity: 0
      }, {
        scale: 1.5,
        rotation: 360,
        opacity: 1,
        duration: config.duration / 2000,
        ease: 'back.out(1.7)',
      })
      .to(crystalOverlay, {
        scale: 3,
        opacity: 0,
        duration: config.duration / 2000,
        ease: 'power2.in',
        onComplete: () => crystalOverlay.remove()
      })

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  /**
   * Dissolve Transition
   */
  private async createDissolveTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfig
  ): Promise<void> {
    if (!this.canvas || !this.ctx) return Promise.resolve()

    this.canvas.style.opacity = '1'

    // Create dissolve effect using canvas manipulation
    const createDissolveEffect = () => {
      if (!this.ctx || !this.canvas) return

      const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.5) {
          data[i] = 255     // Red
          data[i + 1] = 255 // Green  
          data[i + 2] = 255 // Blue
          data[i + 3] = Math.random() * 255 // Alpha
        }
      }

      this.ctx.putImageData(imageData, 0, 0)
    }

    timeline.call(() => {
      this.animationFrame = requestAnimationFrame(function animate() {
        createDissolveEffect()
        requestAnimationFrame(animate)
      })
    })

    return new Promise(resolve => {
      timeline.call(() => {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame)
        }
        if (this.canvas) {
          this.canvas.style.opacity = '0'
        }
        resolve()
      }, [], config.duration / 1000)
    })
  }

  /**
   * Portal Transition
   */
  private async createPortalTransition(
    timeline: gsap.core.Timeline,
    config: TransitionConfiguration
  ): Promise<void> {
    const portalOverlay = this.createPortalOverlay()

    timeline
      .fromTo(portalOverlay, {
        scale: 0,
        rotation: 0
      }, {
        scale: 1,
        rotation: 720,
        duration: config.duration / 1000,
        ease: 'power2.inOut',
        onComplete: () => portalOverlay.remove()
      })

    return new Promise(resolve => {
      timeline.call(resolve, [], config.duration / 1000)
    })
  }

  // Helper Methods

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.style.position = 'absolute'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = '#000000'
    overlay.style.opacity = '0'
    overlay.style.zIndex = '999'
    overlay.style.pointerEvents = 'none'
    
    this.container.appendChild(overlay)
    return overlay
  }

  private createPlanetOverlay(config: PlanetConfig): HTMLElement {
    const overlay = document.createElement('div')
    overlay.style.position = 'absolute'
    overlay.style.top = '50%'
    overlay.style.left = '50%'
    overlay.style.width = '400px'
    overlay.style.height = '400px'
    overlay.style.borderRadius = '50%'
    overlay.style.backgroundImage = `url(${config.planetImage})`
    overlay.style.backgroundSize = 'cover'
    overlay.style.backgroundPosition = 'center'
    overlay.style.transform = 'translate(-50%, -50%)'
    overlay.style.zIndex = '999'
    overlay.style.pointerEvents = 'none'
    overlay.style.boxShadow = `0 0 100px ${config.atmosphereColor}`
    
    this.container.appendChild(overlay)
    return overlay
  }

  private createCrystalOverlay(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.style.position = 'absolute'
    overlay.style.top = '50%'
    overlay.style.left = '50%'
    overlay.style.width = '200px'
    overlay.style.height = '200px'
    overlay.style.background = 'linear-gradient(45deg, #8B5CF6, #A855F7, #C084FC)'
    overlay.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
    overlay.style.transform = 'translate(-50%, -50%)'
    overlay.style.zIndex = '999'
    overlay.style.pointerEvents = 'none'
    overlay.style.boxShadow = '0 0 50px #8B5CF6'
    
    this.container.appendChild(overlay)
    return overlay
  }

  private createPortalOverlay(): HTMLElement {
    const overlay = document.createElement('div')
    overlay.style.position = 'absolute'
    overlay.style.top = '50%'
    overlay.style.left = '50%'
    overlay.style.width = '300px'
    overlay.style.height = '300px'
    overlay.style.borderRadius = '50%'
    overlay.style.background = 'conic-gradient(from 0deg, #00FFFF, #0080FF, #8000FF, #FF0080, #FF8000, #FFFF00, #80FF00, #00FF80, #00FFFF)'
    overlay.style.transform = 'translate(-50%, -50%)'
    overlay.style.zIndex = '999'
    overlay.style.pointerEvents = 'none'
    overlay.style.boxShadow = '0 0 100px #00FFFF'
    
    this.container.appendChild(overlay)
    return overlay
  }

  // Star field animation helpers
  private initializeStars(config: StarFieldConfig): void {
    this.stars = []
    for (let i = 0; i < config.starCount; i++) {
      this.stars.push({
        x: Math.random() * (this.canvas?.width || 800) - (this.canvas?.width || 800) / 2,
        y: Math.random() * (this.canvas?.height || 600) - (this.canvas?.height || 600) / 2,
        z: Math.random() * config.depth,
        color: config.colors[Math.floor(Math.random() * config.colors.length)]
      })
    }
  }

  private updateStars(config: StarFieldConfig): void {
    this.stars.forEach(star => {
      star.z -= config.speed
      if (star.z <= 0) {
        star.x = Math.random() * (this.canvas?.width || 800) - (this.canvas?.width || 800) / 2
        star.y = Math.random() * (this.canvas?.height || 600) - (this.canvas?.height || 600) / 2
        star.z = config.depth
      }
    })
  }

  private renderStars(config: StarFieldConfig): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    this.stars.forEach(star => {
      const x = (star.x / star.z) * config.depth + centerX
      const y = (star.y / star.z) * config.depth + centerY
      const size = (1 - star.z / config.depth) * config.size

      this.ctx!.fillStyle = star.color
      this.ctx!.beginPath()
      this.ctx!.arc(x, y, size, 0, Math.PI * 2)
      this.ctx!.fill()
    })
  }

  // Warp line animation helpers
  private initializeWarpLines(config: WarpConfig): void {
    this.warpLines = []
    for (let i = 0; i < config.lineCount; i++) {
      this.warpLines.push({
        x: Math.random() * (this.canvas?.width || 800) - (this.canvas?.width || 800) / 2,
        y: Math.random() * (this.canvas?.height || 600) - (this.canvas?.height || 600) / 2,
        z: Math.random() * 1000,
        prevX: 0,
        prevY: 0
      })
    }
  }

  private updateWarpLines(config: WarpConfig): void {
    this.warpLines.forEach(line => {
      line.prevX = line.x / line.z * 1000 + (this.canvas?.width || 800) / 2
      line.prevY = line.y / line.z * 1000 + (this.canvas?.height || 600) / 2
      
      line.z -= config.speed
      if (line.z <= 0) {
        line.x = Math.random() * (this.canvas?.width || 800) - (this.canvas?.width || 800) / 2
        line.y = Math.random() * (this.canvas?.height || 600) - (this.canvas?.height || 600) / 2
        line.z = 1000
      }
    })
  }

  private renderWarpLines(config: WarpConfig): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    this.warpLines.forEach(line => {
      const x = line.x / line.z * 1000 + centerX
      const y = line.y / line.z * 1000 + centerY

      this.ctx!.strokeStyle = config.color
      this.ctx!.lineWidth = (1 - line.z / 1000) * config.intensity
      this.ctx!.beginPath()
      this.ctx!.moveTo(line.prevX, line.prevY)
      this.ctx!.lineTo(x, y)
      this.ctx!.stroke()
    })
  }

  // Cleanup
  public cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    if (this.canvas && this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas)
    }
    window.removeEventListener('resize', () => this.resizeCanvas())
  }
}

// Interfaces for animation objects
interface Star {
  x: number
  y: number
  z: number
  color: string
}

interface WarpLine {
  x: number
  y: number
  z: number
  prevX: number
  prevY: number
}

// Convenience functions
export const createTransitionManager = (container: HTMLElement): SceneTransitionManager => {
  return new SceneTransitionManager(container)
}

export const executeTransition = (
  manager: SceneTransitionManager,
  type: TransitionType,
  config?: TransitionConfig
): TransitionResult => {
  return manager.executeTransition(type, config)
}

// Predefined transition configurations
export const TransitionPresets = {
  quickFade: { duration: 500, ease: 'power2.inOut' },
  slowFade: { duration: 2000, ease: 'power2.inOut' },
  slideLeft: { duration: 800, ease: 'power2.inOut', parameters: { direction: 'left' } },
  slideRight: { duration: 800, ease: 'power2.inOut', parameters: { direction: 'right' } },
  zoomIn: { duration: 1000, ease: 'back.out(1.7)' },
  warpSpeed: { duration: 1500, parameters: { speed: 25, intensity: 6 } },
  starfieldTravel: { duration: 3000, parameters: { starCount: 300, speed: 3 } },
  planetApproach: { duration: 2500, parameters: { approachSpeed: 2, atmosphereColor: '#87CEEB' } },
  crystalTeleport: { duration: 1200, ease: 'back.inOut(1.7)' }
} as const

export default SceneTransitionManager