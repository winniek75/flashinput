import type { EmotionType, Character } from './CharacterDatabase'
import logger from '@/utils/logger'

// Emotion Configuration Interface
export interface EmotionConfig {
  name: string
  intensity: number // 0-100
  duration: number // milliseconds
  triggers: EmotionTrigger[]
  visualEffects: EmotionVisualEffect
  audioEffects?: EmotionAudioEffect
  playerAffinityChange: number // +/- change to player relationship
}

export interface EmotionTrigger {
  type: 'player_choice' | 'game_result' | 'story_event' | 'time_based' | 'interaction'
  condition: string
  probability: number // 0-1
}

export interface EmotionVisualEffect {
  particles: ParticleEffect
  aura: AuraEffect
  animation: AnimationEffect
  backgroundShift?: ColorShift
}

export interface EmotionAudioEffect {
  soundFile?: string
  voiceTone: 'higher' | 'lower' | 'normal'
  speechSpeed: 'faster' | 'slower' | 'normal'
  volume: number // 0-1
}

export interface ParticleEffect {
  count: number
  symbol: string
  color: string
  pattern: 'circle' | 'heart' | 'star' | 'spiral' | 'burst'
  speed: 'slow' | 'medium' | 'fast'
}

export interface AuraEffect {
  color: string
  intensity: number // 0-1
  pulseSpeed: 'slow' | 'medium' | 'fast'
  pattern: 'pulse' | 'glow' | 'flicker' | 'steady'
}

export interface AnimationEffect {
  type: string
  duration: number
  intensity: 'subtle' | 'moderate' | 'dramatic'
}

export interface ColorShift {
  from: string
  to: string
  duration: number
}

// Emotion Database
export const EmotionDatabase: Record<EmotionType, EmotionConfig> = {
  normal: {
    name: '通常',
    intensity: 50,
    duration: 0,
    triggers: [],
    visualEffects: {
      particles: { count: 0, symbol: '', color: '', pattern: 'circle', speed: 'medium' },
      aura: { color: '#3b82f6', intensity: 0.3, pulseSpeed: 'slow', pattern: 'steady' },
      animation: { type: 'idle', duration: 0, intensity: 'subtle' }
    },
    playerAffinityChange: 0
  },

  happy: {
    name: '喜び',
    intensity: 80,
    duration: 3000,
    triggers: [
      { type: 'game_result', condition: 'score > 80', probability: 0.9 },
      { type: 'player_choice', condition: 'positive_choice', probability: 0.7 },
      { type: 'story_event', condition: 'achievement_unlocked', probability: 1.0 }
    ],
    visualEffects: {
      particles: { count: 8, symbol: '✨', color: '#fbbf24', pattern: 'burst', speed: 'medium' },
      aura: { color: '#fbbf24', intensity: 0.6, pulseSpeed: 'medium', pattern: 'pulse' },
      animation: { type: 'bounce', duration: 1000, intensity: 'moderate' },
      backgroundShift: { from: 'normal', to: '#fff9e6', duration: 500 }
    },
    audioEffects: {
      voiceTone: 'higher',
      speechSpeed: 'normal',
      volume: 0.8
    },
    playerAffinityChange: 5
  },

  excited: {
    name: '興奮',
    intensity: 95,
    duration: 4000,
    triggers: [
      { type: 'story_event', condition: 'major_discovery', probability: 1.0 },
      { type: 'game_result', condition: 'perfect_score', probability: 0.8 },
      { type: 'interaction', condition: 'surprise_reveal', probability: 0.9 }
    ],
    visualEffects: {
      particles: { count: 12, symbol: '⭐', color: '#f472b6', pattern: 'spiral', speed: 'fast' },
      aura: { color: '#f472b6', intensity: 0.8, pulseSpeed: 'fast', pattern: 'flicker' },
      animation: { type: 'vibrate', duration: 2000, intensity: 'dramatic' },
      backgroundShift: { from: 'normal', to: '#fef7ff', duration: 300 }
    },
    audioEffects: {
      voiceTone: 'higher',
      speechSpeed: 'faster',
      volume: 0.9
    },
    playerAffinityChange: 8
  },

  surprised: {
    name: '驚き',
    intensity: 70,
    duration: 2500,
    triggers: [
      { type: 'story_event', condition: 'plot_twist', probability: 1.0 },
      { type: 'player_choice', condition: 'unexpected_choice', probability: 0.8 },
      { type: 'game_result', condition: 'sudden_improvement', probability: 0.6 }
    ],
    visualEffects: {
      particles: { count: 6, symbol: '💫', color: '#06b6d4', pattern: 'burst', speed: 'fast' },
      aura: { color: '#06b6d4', intensity: 0.5, pulseSpeed: 'fast', pattern: 'pulse' },
      animation: { type: 'jump', duration: 800, intensity: 'dramatic' }
    },
    audioEffects: {
      voiceTone: 'higher',
      speechSpeed: 'normal',
      volume: 0.7
    },
    playerAffinityChange: 2
  },

  sad: {
    name: '悲しみ',
    intensity: 30,
    duration: 5000,
    triggers: [
      { type: 'game_result', condition: 'score < 40', probability: 0.7 },
      { type: 'player_choice', condition: 'negative_choice', probability: 0.8 },
      { type: 'story_event', condition: 'failure_event', probability: 0.9 }
    ],
    visualEffects: {
      particles: { count: 4, symbol: '💧', color: '#6b7280', pattern: 'circle', speed: 'slow' },
      aura: { color: '#6b7280', intensity: 0.4, pulseSpeed: 'slow', pattern: 'glow' },
      animation: { type: 'slump', duration: 2000, intensity: 'moderate' },
      backgroundShift: { from: 'normal', to: '#f3f4f6', duration: 1000 }
    },
    audioEffects: {
      voiceTone: 'lower',
      speechSpeed: 'slower',
      volume: 0.6
    },
    playerAffinityChange: -3
  },

  angry: {
    name: '怒り',
    intensity: 85,
    duration: 4000,
    triggers: [
      { type: 'player_choice', condition: 'rude_choice', probability: 0.9 },
      { type: 'story_event', condition: 'injustice_event', probability: 0.8 },
      { type: 'interaction', condition: 'repeated_mistakes', probability: 0.6 }
    ],
    visualEffects: {
      particles: { count: 10, symbol: '💥', color: '#ef4444', pattern: 'burst', speed: 'fast' },
      aura: { color: '#ef4444', intensity: 0.7, pulseSpeed: 'fast', pattern: 'flicker' },
      animation: { type: 'shake', duration: 1500, intensity: 'dramatic' },
      backgroundShift: { from: 'normal', to: '#fef2f2', duration: 400 }
    },
    audioEffects: {
      voiceTone: 'lower',
      speechSpeed: 'faster',
      volume: 0.9
    },
    playerAffinityChange: -8
  },

  confused: {
    name: '困惑',
    intensity: 40,
    duration: 3000,
    triggers: [
      { type: 'player_choice', condition: 'unclear_choice', probability: 0.7 },
      { type: 'story_event', condition: 'complex_situation', probability: 0.8 },
      { type: 'game_result', condition: 'unexpected_result', probability: 0.5 }
    ],
    visualEffects: {
      particles: { count: 3, symbol: '❓', color: '#a855f7', pattern: 'circle', speed: 'slow' },
      aura: { color: '#a855f7', intensity: 0.4, pulseSpeed: 'medium', pattern: 'pulse' },
      animation: { type: 'tilt', duration: 2000, intensity: 'moderate' }
    },
    audioEffects: {
      voiceTone: 'normal',
      speechSpeed: 'slower',
      volume: 0.7
    },
    playerAffinityChange: 0
  },

  determined: {
    name: '決意',
    intensity: 75,
    duration: 6000,
    triggers: [
      { type: 'story_event', condition: 'challenge_accepted', probability: 0.9 },
      { type: 'player_choice', condition: 'brave_choice', probability: 0.8 },
      { type: 'game_result', condition: 'overcome_difficulty', probability: 0.7 }
    ],
    visualEffects: {
      particles: { count: 5, symbol: '🔥', color: '#10b981', pattern: 'star', speed: 'medium' },
      aura: { color: '#10b981', intensity: 0.6, pulseSpeed: 'medium', pattern: 'glow' },
      animation: { type: 'firm_stance', duration: 3000, intensity: 'moderate' },
      backgroundShift: { from: 'normal', to: '#f0fdf4', duration: 800 }
    },
    audioEffects: {
      voiceTone: 'normal',
      speechSpeed: 'normal',
      volume: 0.8
    },
    playerAffinityChange: 6
  },

  worried: {
    name: '心配',
    intensity: 35,
    duration: 4000,
    triggers: [
      { type: 'story_event', condition: 'danger_approaching', probability: 0.8 },
      { type: 'game_result', condition: 'declining_performance', probability: 0.6 },
      { type: 'player_choice', condition: 'risky_choice', probability: 0.7 }
    ],
    visualEffects: {
      particles: { count: 3, symbol: '😰', color: '#f59e0b', pattern: 'circle', speed: 'slow' },
      aura: { color: '#f59e0b', intensity: 0.3, pulseSpeed: 'slow', pattern: 'pulse' },
      animation: { type: 'nervous', duration: 2500, intensity: 'subtle' }
    },
    audioEffects: {
      voiceTone: 'lower',
      speechSpeed: 'slower',
      volume: 0.6
    },
    playerAffinityChange: -1
  }
}

// Character-specific Emotion Modifiers
export const CharacterEmotionModifiers: Record<string, Partial<Record<EmotionType, Partial<EmotionConfig>>>> = {
  captain_nova: {
    determined: {
      intensity: 85,
      playerAffinityChange: 8,
      visualEffects: {
        particles: { count: 7, symbol: '⭐', color: '#2563eb', pattern: 'star', speed: 'medium' },
        aura: { color: '#2563eb', intensity: 0.7, pulseSpeed: 'medium', pattern: 'glow' }
      }
    }
  },

  aura: {
    happy: {
      visualEffects: {
        particles: { count: 10, symbol: '🔹', color: '#06b6d4', pattern: 'spiral', speed: 'medium' },
        aura: { color: '#06b6d4', intensity: 0.5, pulseSpeed: 'medium', pattern: 'pulse' }
      }
    }
  },

  professor_phonix: {
    happy: {
      intensity: 60,
      visualEffects: {
        particles: { count: 5, symbol: '🎵', color: '#8b5cf6', pattern: 'circle', speed: 'slow' }
      }
    }
  },

  lexia: {
    excited: {
      intensity: 100,
      duration: 5000,
      visualEffects: {
        particles: { count: 15, symbol: '✨', color: '#10b981', pattern: 'spiral', speed: 'fast' }
      }
    }
  },

  grammar_guardian: {
    angry: {
      intensity: 90,
      visualEffects: {
        particles: { count: 8, symbol: '⚡', color: '#dc2626', pattern: 'burst', speed: 'fast' }
      }
    }
  },

  speed_racer: {
    excited: {
      visualEffects: {
        particles: { count: 12, symbol: '💨', color: '#f59e0b', pattern: 'spiral', speed: 'fast' }
      }
    }
  },

  unity: {
    happy: {
      visualEffects: {
        particles: { count: 10, symbol: '🤝', color: '#a855f7', pattern: 'heart', speed: 'medium' }
      }
    }
  },

  the_translator: {
    angry: {
      intensity: 95,
      visualEffects: {
        particles: { count: 15, symbol: '💥', color: '#374151', pattern: 'burst', speed: 'fast' },
        backgroundShift: { from: 'normal', to: '#1f2937', duration: 300 }
      }
    }
  }
}

// Emotion Management Class
export class CharacterEmotionManager {
  private currentEmotions: Map<string, EmotionType> = new Map()
  private emotionTimers: Map<string, NodeJS.Timeout> = new Map()
  private emotionHistory: Map<string, EmotionType[]> = new Map()

  constructor() {
    this.currentEmotions = new Map()
    this.emotionTimers = new Map()
    this.emotionHistory = new Map()
  }

  // Set character emotion with optional duration
  setEmotion(characterId: string, emotion: EmotionType, duration?: number): void {
    const prevEmotion = this.currentEmotions.get(characterId)
    this.currentEmotions.set(characterId, emotion)

    // Record in history
    const history = this.emotionHistory.get(characterId) || []
    history.push(emotion)
    if (history.length > 10) history.shift() // Keep last 10 emotions
    this.emotionHistory.set(characterId, history)

    // Clear existing timer
    const existingTimer = this.emotionTimers.get(characterId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer if duration specified
    const emotionConfig = EmotionDatabase[emotion]
    const effectiveDuration = duration || emotionConfig.duration

    if (effectiveDuration > 0) {
      const timer = setTimeout(() => {
        this.setEmotion(characterId, 'normal')
      }, effectiveDuration)
      this.emotionTimers.set(characterId, timer)
    }

    // Apply player affinity change if applicable
    this.applyAffinityChange(characterId, emotion)
  }

  // Get current emotion for character
  getCurrentEmotion(characterId: string): EmotionType {
    return this.currentEmotions.get(characterId) || 'normal'
  }

  // Get emotion configuration with character-specific modifiers
  getEmotionConfig(characterId: string, emotion: EmotionType): EmotionConfig {
    const baseConfig = EmotionDatabase[emotion]
    const characterModifiers = CharacterEmotionModifiers[characterId]?.[emotion]

    if (!characterModifiers) return baseConfig

    // Deep merge configuration
    return this.deepMerge(baseConfig, characterModifiers)
  }

  // Trigger emotion based on game event
  triggerEmotionByEvent(
    characterId: string,
    eventType: EmotionTrigger['type'],
    condition: string,
    intensity: number = 1
  ): EmotionType | null {
    for (const [emotionType, config] of Object.entries(EmotionDatabase)) {
      const triggers = config.triggers.filter(
        trigger => trigger.type === eventType && trigger.condition === condition
      )

      for (const trigger of triggers) {
        const probability = trigger.probability * intensity
        if (Math.random() < probability) {
          this.setEmotion(characterId, emotionType as EmotionType)
          return emotionType as EmotionType
        }
      }
    }

    return null
  }

  // Get emotion history for character
  getEmotionHistory(characterId: string): EmotionType[] {
    return this.emotionHistory.get(characterId) || []
  }

  // Calculate emotion compatibility between characters
  getEmotionCompatibility(char1Id: string, char2Id: string): number {
    const emotion1 = this.getCurrentEmotion(char1Id)
    const emotion2 = this.getCurrentEmotion(char2Id)

    const compatibilityMatrix: Record<EmotionType, Record<EmotionType, number>> = {
      normal: { normal: 1, happy: 0.8, excited: 0.6, surprised: 0.7, sad: 0.5, angry: 0.3, confused: 0.6, determined: 0.7, worried: 0.5 },
      happy: { normal: 0.8, happy: 1, excited: 0.9, surprised: 0.7, sad: 0.2, angry: 0.1, confused: 0.4, determined: 0.8, worried: 0.3 },
      excited: { normal: 0.6, happy: 0.9, excited: 1, surprised: 0.8, sad: 0.1, angry: 0.2, confused: 0.3, determined: 0.9, worried: 0.2 },
      surprised: { normal: 0.7, happy: 0.7, excited: 0.8, surprised: 1, sad: 0.4, angry: 0.3, confused: 0.6, determined: 0.6, worried: 0.5 },
      sad: { normal: 0.5, happy: 0.2, excited: 0.1, surprised: 0.4, sad: 1, angry: 0.6, confused: 0.7, determined: 0.3, worried: 0.8 },
      angry: { normal: 0.3, happy: 0.1, excited: 0.2, surprised: 0.3, sad: 0.6, angry: 1, confused: 0.4, determined: 0.5, worried: 0.4 },
      confused: { normal: 0.6, happy: 0.4, excited: 0.3, surprised: 0.6, sad: 0.7, angry: 0.4, confused: 1, determined: 0.4, worried: 0.7 },
      determined: { normal: 0.7, happy: 0.8, excited: 0.9, surprised: 0.6, sad: 0.3, angry: 0.5, confused: 0.4, determined: 1, worried: 0.4 },
      worried: { normal: 0.5, happy: 0.3, excited: 0.2, surprised: 0.5, sad: 0.8, angry: 0.4, confused: 0.7, determined: 0.4, worried: 1 }
    }

    return compatibilityMatrix[emotion1]?.[emotion2] || 0.5
  }

  // Apply player affinity change based on emotion
  private applyAffinityChange(characterId: string, emotion: EmotionType): void {
    const config = this.getEmotionConfig(characterId, emotion)
    if (config.playerAffinityChange !== 0) {
      // This would integrate with the character database to update relationships
      logger.log(`Character ${characterId} affinity change: ${config.playerAffinityChange}`)
    }
  }

  // Deep merge utility for configuration objects
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }

  // Clean up timers
  cleanup(): void {
    for (const timer of this.emotionTimers.values()) {
      clearTimeout(timer)
    }
    this.emotionTimers.clear()
  }
}

// Singleton instance
export const emotionManager = new CharacterEmotionManager()

// Utility functions
export const getEmotionIntensityColor = (emotion: EmotionType, intensity: number): string => {
  const baseColors: Record<EmotionType, string> = {
    normal: '#3b82f6',
    happy: '#fbbf24',
    excited: '#f472b6',
    surprised: '#06b6d4',
    sad: '#6b7280',
    angry: '#ef4444',
    confused: '#a855f7',
    determined: '#10b981',
    worried: '#f59e0b'
  }

  const baseColor = baseColors[emotion]
  const alpha = Math.max(0.3, Math.min(1, intensity / 100))
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const getEmotionDisplayName = (emotion: EmotionType): string => {
  return EmotionDatabase[emotion].name
}

export const isPositiveEmotion = (emotion: EmotionType): boolean => {
  return ['happy', 'excited', 'determined'].includes(emotion)
}

export const isNegativeEmotion = (emotion: EmotionType): boolean => {
  return ['sad', 'angry', 'worried'].includes(emotion)
}

export const isNeutralEmotion = (emotion: EmotionType): boolean => {
  return ['normal', 'surprised', 'confused'].includes(emotion)
}