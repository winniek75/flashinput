import { ref, computed } from 'vue'
import logger from '@/utils/logger'

// Types
export interface BackgroundConfig {
  id: string
  name: string
  basePath: string
  variants: BackgroundVariant[]
  planetSpecific?: boolean
  effects?: BackgroundEffect[]
}

export interface BackgroundVariant {
  quality: 'mobile' | 'desktop' | '4k'
  resolution: string
  fileSize: string
  path: string
}

export interface BackgroundEffect {
  type: 'stars' | 'nebula' | 'atmosphere' | 'particles'
  intensity: number
  color?: string
  speed?: number
}

export interface PlanetBackground {
  planetId: string
  atmosphereColor: string
  effectsConfig: BackgroundEffect[]
  customTextures?: string[]
}

// Background Database
export const backgroundDatabase: Record<string, BackgroundConfig> = {
  'earth-view': {
    id: 'earth-view',
    name: 'Earth Orbit View',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.2MB',
        path: '/space/earth-view.webp'
      }
    ],
    effects: [
      { type: 'stars', intensity: 0.6 },
      { type: 'atmosphere', intensity: 0.8, color: '#87ceeb' }
    ]
  },
  
  'nebula-panorama': {
    id: 'nebula-panorama',
    name: 'Nebula Panorama',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.4MB',
        path: '/space/nebula-panorama.webp'
      }
    ],
    effects: [
      { type: 'stars', intensity: 0.8 },
      { type: 'nebula', intensity: 1.0, color: '#8b5cf6' },
      { type: 'particles', intensity: 0.6, speed: 0.3 }
    ]
  },

  'space-station': {
    id: 'space-station',
    name: 'Space Station View',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.3MB',
        path: '/space/space-station.webp'
      }
    ],
    effects: [
      { type: 'stars', intensity: 0.7 },
      { type: 'particles', intensity: 0.3, speed: 0.1 }
    ]
  },

  // Planet Surface Backgrounds
  'sound-planet': {
    id: 'sound-planet',
    name: 'Sound Planet Surface',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.4MB',
        path: '/space/planet-surfaces/sound-planet.webp'
      }
    ],
    planetSpecific: true,
    effects: [
      { type: 'atmosphere', intensity: 0.8, color: '#8b5cf6' },
      { type: 'particles', intensity: 0.7, speed: 0.4 }
    ]
  },

  'word-planet': {
    id: 'word-planet',
    name: 'Word Planet Surface',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.3MB',
        path: '/space/planet-surfaces/word-planet.webp'
      }
    ],
    planetSpecific: true,
    effects: [
      { type: 'atmosphere', intensity: 0.7, color: '#10b981' },
      { type: 'particles', intensity: 0.6, speed: 0.5 }
    ]
  },

  'grammar-planet': {
    id: 'grammar-planet',
    name: 'Grammar Planet Surface',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.2MB',
        path: '/space/planet-surfaces/grammar-planet.webp'
      }
    ],
    planetSpecific: true,
    effects: [
      { type: 'atmosphere', intensity: 0.6, color: '#dc2626' },
      { type: 'particles', intensity: 0.4, speed: 0.2 }
    ]
  },

  // Interior Backgrounds
  'spaceship-cockpit': {
    id: 'spaceship-cockpit',
    name: 'Spaceship Cockpit',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.1MB',
        path: '/interiors/spaceship-cockpit.webp'
      }
    ],
    effects: [
      { type: 'particles', intensity: 0.2, speed: 0.1 }
    ]
  },

  'control-room': {
    id: 'control-room',
    name: 'Control Room',
    basePath: '/src/assets/backgrounds',
    variants: [
      {
        quality: 'desktop',
        resolution: '2048x1024',
        fileSize: '~1.0MB',
        path: '/interiors/control-room.webp'
      }
    ],
    effects: [
      { type: 'particles', intensity: 0.1, speed: 0.05 }
    ]
  }
}

// Planet-specific configurations
export const planetBackgrounds: Record<string, PlanetBackground> = {
  'earth': {
    planetId: 'earth',
    atmosphereColor: '#87ceeb',
    effectsConfig: [
      { type: 'atmosphere', intensity: 0.7, color: '#87ceeb' },
      { type: 'stars', intensity: 0.4 }
    ]
  },
  
  'mars': {
    planetId: 'mars',
    atmosphereColor: '#cd5c5c',
    effectsConfig: [
      { type: 'atmosphere', intensity: 0.3, color: '#cd5c5c' },
      { type: 'particles', intensity: 0.2, speed: 0.1 }
    ]
  },
  
  'sound-planet': {
    planetId: 'sound-planet',
    atmosphereColor: '#8b5cf6',
    effectsConfig: [
      { type: 'atmosphere', intensity: 0.8, color: '#8b5cf6' },
      { type: 'particles', intensity: 0.6, speed: 0.3 }
    ],
    customTextures: ['/space/planet-surfaces/sound-planet-aurora.webp']
  },
  
  'word-planet': {
    planetId: 'word-planet', 
    atmosphereColor: '#10b981',
    effectsConfig: [
      { type: 'atmosphere', intensity: 0.7, color: '#10b981' },
      { type: 'particles', intensity: 0.5, speed: 0.4 }
    ],
    customTextures: ['/space/planet-surfaces/word-planet-text-particles.webp']
  },
  
  'grammar-planet': {
    planetId: 'grammar-planet',
    atmosphereColor: '#dc2626', 
    effectsConfig: [
      { type: 'atmosphere', intensity: 0.6, color: '#dc2626' },
      { type: 'particles', intensity: 0.3, speed: 0.2 }
    ],
    customTextures: ['/space/planet-surfaces/grammar-planet-symbols.webp']
  }
}

// Reactive state
const currentBackground = ref<string>('earth-view')
const currentPlanet = ref<string>()
const currentQuality = ref<'mobile' | 'desktop' | '4k'>('desktop')
const loadedBackgrounds = ref<Set<string>>(new Set())
const loadingProgress = ref<Record<string, number>>({})

// Device detection
export const detectOptimalQuality = (): 'mobile' | 'desktop' | '4k' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const { devicePixelRatio, screen } = window
  const { width, height } = screen
  const totalPixels = width * height * (devicePixelRatio || 1)
  
  // Mobile devices or low-end hardware
  if (totalPixels < 2073600 || width < 1024) { // Less than 1920x1080
    return 'mobile'
  }
  
  // High-end displays
  if (totalPixels > 8294400 && devicePixelRatio > 1.5) { // More than 4K equivalent
    return '4k'
  }
  
  // Standard desktop
  return 'desktop'
}

// Network detection
export const detectNetworkSpeed = async (): Promise<'slow' | 'medium' | 'fast'> => {
  if (!navigator.connection) return 'medium'
  
  const { effectiveType, downlink } = navigator.connection as any
  
  if (effectiveType === '4g' && downlink > 10) return 'fast'
  if (effectiveType === '3g' || downlink > 1.5) return 'medium'
  return 'slow'
}

// Background loading utilities
export const preloadBackground = async (
  backgroundId: string, 
  quality?: 'mobile' | 'desktop' | '4k'
): Promise<boolean> => {
  const config = backgroundDatabase[backgroundId]
  if (!config) {
    logger.warn(`Background configuration not found: ${backgroundId}`)
    return false
  }
  
  const targetQuality = quality || currentQuality.value
  const variant = config.variants.find(v => v.quality === targetQuality)
  if (!variant) {
    logger.warn(`Quality variant not found: ${targetQuality} for ${backgroundId}`)
    return false
  }
  
  const fullPath = config.basePath + variant.path
  
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      loadedBackgrounds.value.add(`${backgroundId}-${targetQuality}`)
      loadingProgress.value[backgroundId] = 100
      resolve(true)
    }
    
    img.onerror = () => {
      logger.error(`Failed to load background: ${fullPath}`)
      resolve(false)
    }
    
    img.onprogress = (event: any) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        loadingProgress.value[backgroundId] = progress
      }
    }
    
    img.src = fullPath
  })
}

// Progressive loading strategy
export const progressiveLoadBackground = async (
  backgroundId: string
): Promise<void> => {
  const config = backgroundDatabase[backgroundId]
  if (!config) return
  
  const networkSpeed = await detectNetworkSpeed()
  const optimalQuality = detectOptimalQuality()
  
  // Load strategy based on network and device capabilities
  if (networkSpeed === 'slow') {
    // Load mobile first, then upgrade if needed
    await preloadBackground(backgroundId, 'mobile')
    if (optimalQuality !== 'mobile') {
      setTimeout(() => preloadBackground(backgroundId, optimalQuality), 2000)
    }
  } else if (networkSpeed === 'fast') {
    // Load optimal quality directly
    await preloadBackground(backgroundId, optimalQuality)
  } else {
    // Load desktop first, then upgrade/downgrade as needed
    await preloadBackground(backgroundId, 'desktop')
    if (optimalQuality !== 'desktop') {
      setTimeout(() => preloadBackground(backgroundId, optimalQuality), 1000)
    }
  }
}

// Background management composable
export const useBackgroundManager = () => {
  const setBackground = async (backgroundId: string, planet?: string) => {
    currentBackground.value = backgroundId
    currentPlanet.value = planet
    
    await progressiveLoadBackground(backgroundId)
    
    // Load planet-specific background if needed
    if (planet && planetBackgrounds[planet]) {
      const planetBgId = `${backgroundId}-${planet}`
      await preloadBackground(planetBgId)
    }
  }
  
  const getBackgroundUrl = (
    backgroundId: string,
    quality?: 'mobile' | 'desktop' | '4k'
  ): string => {
    const config = backgroundDatabase[backgroundId]
    if (!config) return ''
    
    const targetQuality = quality || currentQuality.value
    const variant = config.variants.find(v => v.quality === targetQuality)
    if (!variant) return ''
    
    return config.basePath + variant.path
  }
  
  const getPlanetEffects = (planetId: string): BackgroundEffect[] => {
    const planet = planetBackgrounds[planetId]
    return planet?.effectsConfig || []
  }
  
  const isBackgroundLoaded = (backgroundId: string, quality?: string): boolean => {
    const targetQuality = quality || currentQuality.value
    return loadedBackgrounds.value.has(`${backgroundId}-${targetQuality}`)
  }
  
  const getLoadingProgress = (backgroundId: string): number => {
    return loadingProgress.value[backgroundId] || 0
  }
  
  // Computed properties
  const currentBackgroundConfig = computed(() => {
    return backgroundDatabase[currentBackground.value]
  })
  
  const currentPlanetConfig = computed(() => {
    return currentPlanet.value ? planetBackgrounds[currentPlanet.value] : undefined
  })
  
  return {
    // State
    currentBackground,
    currentPlanet,
    currentQuality,
    
    // Methods
    setBackground,
    getBackgroundUrl,
    getPlanetEffects,
    isBackgroundLoaded,
    getLoadingProgress,
    preloadBackground,
    progressiveLoadBackground,
    
    // Computed
    currentBackgroundConfig,
    currentPlanetConfig,
    
    // Utilities
    detectOptimalQuality,
    detectNetworkSpeed
  }
}

// Export for direct usage
export {
  currentBackground,
  currentPlanet,
  currentQuality,
  loadedBackgrounds,
  loadingProgress
}