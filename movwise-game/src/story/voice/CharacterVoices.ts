import type { Character, VoiceTone } from '@/story/characters/CharacterDatabase'
import type { EmotionType } from '@/story/characters/CharacterEmotions'
import logger from '@/utils/logger'

// Voice Configuration Interface
export interface VoiceConfig {
  characterId: string
  language: string
  voiceId: string // For TTS services
  pitch: number // 0.5 - 2.0
  rate: number // 0.5 - 2.0
  volume: number // 0.0 - 1.0
  emphasis: EmphasisLevel
  audioFiles: VoiceAudioFiles
  ttsSettings: TTSSettings
}

export interface VoiceAudioFiles {
  greetings: string[]
  farewells: string[]
  reactions: Record<EmotionType, string[]>
  catchphrases: string[]
  gameSpecific: {
    encouragement: string[]
    praise: string[]
    hints: string[]
    corrections: string[]
  }
}

export interface TTSSettings {
  provider: 'web-speech' | 'elevenlabs' | 'azure' | 'google'
  voiceModel?: string
  stability?: number // For ElevenLabs
  clarity?: number // For ElevenLabs
  style?: string // For Azure
  speakingStyle?: string // For Azure
}

export type EmphasisLevel = 'none' | 'reduced' | 'moderate' | 'strong'

export type SupportedLanguage = 'ja-JP' | 'en-US' | 'en-GB' | 'ko-KR' | 'zh-CN'

// Character Voice Database
export const CharacterVoiceDatabase: Record<string, VoiceConfig> = {
  captain_nova: {
    characterId: 'captain_nova',
    language: 'ja-JP',
    voiceId: 'ja-JP-KeitaNeural', // Azure Voice
    pitch: 1.0,
    rate: 1.0,
    volume: 0.8,
    emphasis: 'moderate',
    audioFiles: {
      greetings: [
        '/audio/voices/captain_nova/greeting_01.mp3',
        '/audio/voices/captain_nova/greeting_02.mp3',
        '/audio/voices/captain_nova/greeting_03.mp3'
      ],
      farewells: [
        '/audio/voices/captain_nova/farewell_01.mp3',
        '/audio/voices/captain_nova/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/captain_nova/normal_01.mp3'],
        happy: [
          '/audio/voices/captain_nova/happy_01.mp3',
          '/audio/voices/captain_nova/happy_02.mp3'
        ],
        excited: ['/audio/voices/captain_nova/excited_01.mp3'],
        surprised: ['/audio/voices/captain_nova/surprised_01.mp3'],
        sad: ['/audio/voices/captain_nova/sad_01.mp3'],
        angry: ['/audio/voices/captain_nova/angry_01.mp3'],
        confused: ['/audio/voices/captain_nova/confused_01.mp3'],
        determined: [
          '/audio/voices/captain_nova/determined_01.mp3',
          '/audio/voices/captain_nova/determined_02.mp3'
        ],
        worried: ['/audio/voices/captain_nova/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/captain_nova/catchphrase_01.mp3',
        '/audio/voices/captain_nova/catchphrase_02.mp3',
        '/audio/voices/captain_nova/catchphrase_03.mp3',
        '/audio/voices/captain_nova/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/captain_nova/encourage_01.mp3',
          '/audio/voices/captain_nova/encourage_02.mp3',
          '/audio/voices/captain_nova/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/captain_nova/praise_01.mp3',
          '/audio/voices/captain_nova/praise_02.mp3',
          '/audio/voices/captain_nova/praise_03.mp3'
        ],
        hints: [
          '/audio/voices/captain_nova/hint_01.mp3',
          '/audio/voices/captain_nova/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/captain_nova/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-KeitaNeural',
      style: 'cheerful',
      speakingStyle: 'friendly'
    }
  },

  aura: {
    characterId: 'aura',
    language: 'ja-JP',
    voiceId: 'ja-JP-NanamiNeural',
    pitch: 1.1,
    rate: 1.0,
    volume: 0.7,
    emphasis: 'reduced',
    audioFiles: {
      greetings: [
        '/audio/voices/aura/greeting_01.mp3',
        '/audio/voices/aura/greeting_02.mp3'
      ],
      farewells: [
        '/audio/voices/aura/farewell_01.mp3',
        '/audio/voices/aura/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/aura/normal_01.mp3'],
        happy: ['/audio/voices/aura/happy_01.mp3'],
        excited: ['/audio/voices/aura/excited_01.mp3'],
        surprised: ['/audio/voices/aura/surprised_01.mp3'],
        sad: ['/audio/voices/aura/sad_01.mp3'],
        angry: ['/audio/voices/aura/angry_01.mp3'],
        confused: ['/audio/voices/aura/confused_01.mp3'],
        determined: ['/audio/voices/aura/determined_01.mp3'],
        worried: ['/audio/voices/aura/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/aura/catchphrase_01.mp3',
        '/audio/voices/aura/catchphrase_02.mp3',
        '/audio/voices/aura/catchphrase_03.mp3',
        '/audio/voices/aura/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/aura/encourage_01.mp3',
          '/audio/voices/aura/encourage_02.mp3',
          '/audio/voices/aura/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/aura/praise_01.mp3',
          '/audio/voices/aura/praise_02.mp3',
          '/audio/voices/aura/praise_03.mp3'
        ],
        hints: [
          '/audio/voices/aura/hint_01.mp3',
          '/audio/voices/aura/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/aura/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-NanamiNeural',
      style: 'assistant',
      speakingStyle: 'calm'
    }
  },

  professor_phonix: {
    characterId: 'professor_phonix',
    language: 'ja-JP',
    voiceId: 'ja-JP-MasaruNeural',
    pitch: 0.8,
    rate: 0.9,
    volume: 0.8,
    emphasis: 'moderate',
    audioFiles: {
      greetings: [
        '/audio/voices/professor_phonix/greeting_01.mp3',
        '/audio/voices/professor_phonix/greeting_02.mp3'
      ],
      farewells: [
        '/audio/voices/professor_phonix/farewell_01.mp3',
        '/audio/voices/professor_phonix/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/professor_phonix/normal_01.mp3'],
        happy: ['/audio/voices/professor_phonix/happy_01.mp3'],
        excited: ['/audio/voices/professor_phonix/excited_01.mp3'],
        surprised: ['/audio/voices/professor_phonix/surprised_01.mp3'],
        sad: ['/audio/voices/professor_phonix/sad_01.mp3'],
        angry: ['/audio/voices/professor_phonix/angry_01.mp3'],
        confused: ['/audio/voices/professor_phonix/confused_01.mp3'],
        determined: ['/audio/voices/professor_phonix/determined_01.mp3'],
        worried: ['/audio/voices/professor_phonix/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/professor_phonix/catchphrase_01.mp3',
        '/audio/voices/professor_phonix/catchphrase_02.mp3',
        '/audio/voices/professor_phonix/catchphrase_03.mp3',
        '/audio/voices/professor_phonix/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/professor_phonix/encourage_01.mp3',
          '/audio/voices/professor_phonix/encourage_02.mp3',
          '/audio/voices/professor_phonix/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/professor_phonix/praise_01.mp3',
          '/audio/voices/professor_phonix/praise_02.mp3'
        ],
        hints: [
          '/audio/voices/professor_phonix/hint_01.mp3',
          '/audio/voices/professor_phonix/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/professor_phonix/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-MasaruNeural',
      style: 'gentle',
      speakingStyle: 'wise'
    }
  },

  lexia: {
    characterId: 'lexia',
    language: 'ja-JP',
    voiceId: 'ja-JP-AoiNeural',
    pitch: 1.3,
    rate: 1.2,
    volume: 0.8,
    emphasis: 'strong',
    audioFiles: {
      greetings: [
        '/audio/voices/lexia/greeting_01.mp3',
        '/audio/voices/lexia/greeting_02.mp3',
        '/audio/voices/lexia/greeting_03.mp3'
      ],
      farewells: [
        '/audio/voices/lexia/farewell_01.mp3',
        '/audio/voices/lexia/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/lexia/normal_01.mp3'],
        happy: [
          '/audio/voices/lexia/happy_01.mp3',
          '/audio/voices/lexia/happy_02.mp3',
          '/audio/voices/lexia/happy_03.mp3'
        ],
        excited: [
          '/audio/voices/lexia/excited_01.mp3',
          '/audio/voices/lexia/excited_02.mp3'
        ],
        surprised: ['/audio/voices/lexia/surprised_01.mp3'],
        sad: ['/audio/voices/lexia/sad_01.mp3'],
        angry: ['/audio/voices/lexia/angry_01.mp3'],
        confused: ['/audio/voices/lexia/confused_01.mp3'],
        determined: ['/audio/voices/lexia/determined_01.mp3'],
        worried: ['/audio/voices/lexia/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/lexia/catchphrase_01.mp3',
        '/audio/voices/lexia/catchphrase_02.mp3',
        '/audio/voices/lexia/catchphrase_03.mp3',
        '/audio/voices/lexia/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/lexia/encourage_01.mp3',
          '/audio/voices/lexia/encourage_02.mp3',
          '/audio/voices/lexia/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/lexia/praise_01.mp3',
          '/audio/voices/lexia/praise_02.mp3',
          '/audio/voices/lexia/praise_03.mp3'
        ],
        hints: [
          '/audio/voices/lexia/hint_01.mp3',
          '/audio/voices/lexia/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/lexia/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-AoiNeural',
      style: 'cheerful',
      speakingStyle: 'excited'
    }
  },

  grammar_guardian: {
    characterId: 'grammar_guardian',
    language: 'ja-JP',
    voiceId: 'ja-JP-DaichiNeural',
    pitch: 0.7,
    rate: 0.8,
    volume: 0.9,
    emphasis: 'strong',
    audioFiles: {
      greetings: [
        '/audio/voices/grammar_guardian/greeting_01.mp3',
        '/audio/voices/grammar_guardian/greeting_02.mp3'
      ],
      farewells: [
        '/audio/voices/grammar_guardian/farewell_01.mp3',
        '/audio/voices/grammar_guardian/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/grammar_guardian/normal_01.mp3'],
        happy: ['/audio/voices/grammar_guardian/happy_01.mp3'],
        excited: ['/audio/voices/grammar_guardian/excited_01.mp3'],
        surprised: ['/audio/voices/grammar_guardian/surprised_01.mp3'],
        sad: ['/audio/voices/grammar_guardian/sad_01.mp3'],
        angry: [
          '/audio/voices/grammar_guardian/angry_01.mp3',
          '/audio/voices/grammar_guardian/angry_02.mp3'
        ],
        confused: ['/audio/voices/grammar_guardian/confused_01.mp3'],
        determined: [
          '/audio/voices/grammar_guardian/determined_01.mp3',
          '/audio/voices/grammar_guardian/determined_02.mp3'
        ],
        worried: ['/audio/voices/grammar_guardian/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/grammar_guardian/catchphrase_01.mp3',
        '/audio/voices/grammar_guardian/catchphrase_02.mp3',
        '/audio/voices/grammar_guardian/catchphrase_03.mp3',
        '/audio/voices/grammar_guardian/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/grammar_guardian/encourage_01.mp3',
          '/audio/voices/grammar_guardian/encourage_02.mp3',
          '/audio/voices/grammar_guardian/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/grammar_guardian/praise_01.mp3',
          '/audio/voices/grammar_guardian/praise_02.mp3'
        ],
        hints: [
          '/audio/voices/grammar_guardian/hint_01.mp3',
          '/audio/voices/grammar_guardian/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/grammar_guardian/correction_01.mp3',
          '/audio/voices/grammar_guardian/correction_02.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-DaichiNeural',
      style: 'serious',
      speakingStyle: 'authoritative'
    }
  },

  speed_racer: {
    characterId: 'speed_racer',
    language: 'ja-JP',
    voiceId: 'ja-JP-NaokiNeural',
    pitch: 1.2,
    rate: 1.3,
    volume: 0.9,
    emphasis: 'strong',
    audioFiles: {
      greetings: [
        '/audio/voices/speed_racer/greeting_01.mp3',
        '/audio/voices/speed_racer/greeting_02.mp3'
      ],
      farewells: [
        '/audio/voices/speed_racer/farewell_01.mp3',
        '/audio/voices/speed_racer/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/speed_racer/normal_01.mp3'],
        happy: ['/audio/voices/speed_racer/happy_01.mp3'],
        excited: [
          '/audio/voices/speed_racer/excited_01.mp3',
          '/audio/voices/speed_racer/excited_02.mp3',
          '/audio/voices/speed_racer/excited_03.mp3'
        ],
        surprised: ['/audio/voices/speed_racer/surprised_01.mp3'],
        sad: ['/audio/voices/speed_racer/sad_01.mp3'],
        angry: ['/audio/voices/speed_racer/angry_01.mp3'],
        confused: ['/audio/voices/speed_racer/confused_01.mp3'],
        determined: [
          '/audio/voices/speed_racer/determined_01.mp3',
          '/audio/voices/speed_racer/determined_02.mp3'
        ],
        worried: ['/audio/voices/speed_racer/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/speed_racer/catchphrase_01.mp3',
        '/audio/voices/speed_racer/catchphrase_02.mp3',
        '/audio/voices/speed_racer/catchphrase_03.mp3',
        '/audio/voices/speed_racer/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/speed_racer/encourage_01.mp3',
          '/audio/voices/speed_racer/encourage_02.mp3',
          '/audio/voices/speed_racer/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/speed_racer/praise_01.mp3',
          '/audio/voices/speed_racer/praise_02.mp3',
          '/audio/voices/speed_racer/praise_03.mp3'
        ],
        hints: [
          '/audio/voices/speed_racer/hint_01.mp3',
          '/audio/voices/speed_racer/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/speed_racer/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-NaokiNeural',
      style: 'excited',
      speakingStyle: 'energetic'
    }
  },

  unity: {
    characterId: 'unity',
    language: 'ja-JP',
    voiceId: 'ja-JP-MayuNeural',
    pitch: 1.0,
    rate: 0.95,
    volume: 0.8,
    emphasis: 'moderate',
    audioFiles: {
      greetings: [
        '/audio/voices/unity/greeting_01.mp3',
        '/audio/voices/unity/greeting_02.mp3',
        '/audio/voices/unity/greeting_03.mp3'
      ],
      farewells: [
        '/audio/voices/unity/farewell_01.mp3',
        '/audio/voices/unity/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/unity/normal_01.mp3'],
        happy: [
          '/audio/voices/unity/happy_01.mp3',
          '/audio/voices/unity/happy_02.mp3'
        ],
        excited: ['/audio/voices/unity/excited_01.mp3'],
        surprised: ['/audio/voices/unity/surprised_01.mp3'],
        sad: ['/audio/voices/unity/sad_01.mp3'],
        angry: ['/audio/voices/unity/angry_01.mp3'],
        confused: ['/audio/voices/unity/confused_01.mp3'],
        determined: [
          '/audio/voices/unity/determined_01.mp3',
          '/audio/voices/unity/determined_02.mp3'
        ],
        worried: ['/audio/voices/unity/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/unity/catchphrase_01.mp3',
        '/audio/voices/unity/catchphrase_02.mp3',
        '/audio/voices/unity/catchphrase_03.mp3',
        '/audio/voices/unity/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/unity/encourage_01.mp3',
          '/audio/voices/unity/encourage_02.mp3',
          '/audio/voices/unity/encourage_03.mp3'
        ],
        praise: [
          '/audio/voices/unity/praise_01.mp3',
          '/audio/voices/unity/praise_02.mp3',
          '/audio/voices/unity/praise_03.mp3'
        ],
        hints: [
          '/audio/voices/unity/hint_01.mp3',
          '/audio/voices/unity/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/unity/correction_01.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-MayuNeural',
      style: 'gentle',
      speakingStyle: 'nurturing'
    }
  },

  the_translator: {
    characterId: 'the_translator',
    language: 'ja-JP',
    voiceId: 'ja-JP-KeitaNeural',
    pitch: 0.6,
    rate: 0.7,
    volume: 0.9,
    emphasis: 'strong',
    audioFiles: {
      greetings: [
        '/audio/voices/the_translator/greeting_01.mp3',
        '/audio/voices/the_translator/greeting_02.mp3'
      ],
      farewells: [
        '/audio/voices/the_translator/farewell_01.mp3',
        '/audio/voices/the_translator/farewell_02.mp3'
      ],
      reactions: {
        normal: ['/audio/voices/the_translator/normal_01.mp3'],
        happy: ['/audio/voices/the_translator/happy_01.mp3'],
        excited: ['/audio/voices/the_translator/excited_01.mp3'],
        surprised: ['/audio/voices/the_translator/surprised_01.mp3'],
        sad: ['/audio/voices/the_translator/sad_01.mp3'],
        angry: [
          '/audio/voices/the_translator/angry_01.mp3',
          '/audio/voices/the_translator/angry_02.mp3'
        ],
        confused: ['/audio/voices/the_translator/confused_01.mp3'],
        determined: [
          '/audio/voices/the_translator/determined_01.mp3',
          '/audio/voices/the_translator/determined_02.mp3'
        ],
        worried: ['/audio/voices/the_translator/worried_01.mp3']
      },
      catchphrases: [
        '/audio/voices/the_translator/catchphrase_01.mp3',
        '/audio/voices/the_translator/catchphrase_02.mp3',
        '/audio/voices/the_translator/catchphrase_03.mp3',
        '/audio/voices/the_translator/catchphrase_04.mp3'
      ],
      gameSpecific: {
        encouragement: [
          '/audio/voices/the_translator/encourage_01.mp3',
          '/audio/voices/the_translator/encourage_02.mp3'
        ],
        praise: [
          '/audio/voices/the_translator/praise_01.mp3',
          '/audio/voices/the_translator/praise_02.mp3'
        ],
        hints: [
          '/audio/voices/the_translator/hint_01.mp3',
          '/audio/voices/the_translator/hint_02.mp3'
        ],
        corrections: [
          '/audio/voices/the_translator/correction_01.mp3',
          '/audio/voices/the_translator/correction_02.mp3'
        ]
      }
    },
    ttsSettings: {
      provider: 'azure',
      voiceModel: 'ja-JP-KeitaNeural',
      style: 'serious',
      speakingStyle: 'mysterious'
    }
  }
}

// Voice Manager Class
export class CharacterVoiceManager {
  private audioContext: AudioContext | null = null
  private audioCache: Map<string, AudioBuffer> = new Map()
  private currentPlayback: Map<string, AudioPlayback> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeAudioContext()
  }

  // Initialize audio context
  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.isInitialized = true
    } catch (error) {
      logger.error('Failed to initialize audio context:', error)
    }
  }

  // Load and cache audio file
  private async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      
      if (!this.audioContext) {
        throw new Error('Audio context not initialized')
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.audioCache.set(url, audioBuffer)
      return audioBuffer
    } catch (error) {
      logger.error(`Failed to load audio file: ${url}`, error)
      return null
    }
  }

  // Play character voice
  async playCharacterVoice(
    characterId: string,
    type: 'greeting' | 'farewell' | 'reaction' | 'catchphrase' | 'gameSpecific',
    subType?: string,
    emotion?: EmotionType
  ): Promise<void> {
    const voiceConfig = CharacterVoiceDatabase[characterId]
    if (!voiceConfig || !this.audioContext) return

    let audioFiles: string[] = []

    switch (type) {
      case 'greeting':
        audioFiles = voiceConfig.audioFiles.greetings
        break
      case 'farewell':
        audioFiles = voiceConfig.audioFiles.farewells
        break
      case 'reaction':
        if (emotion) {
          audioFiles = voiceConfig.audioFiles.reactions[emotion] || []
        }
        break
      case 'catchphrase':
        audioFiles = voiceConfig.audioFiles.catchphrases
        break
      case 'gameSpecific':
        if (subType && subType in voiceConfig.audioFiles.gameSpecific) {
          audioFiles = voiceConfig.audioFiles.gameSpecific[subType as keyof typeof voiceConfig.audioFiles.gameSpecific]
        }
        break
    }

    if (audioFiles.length === 0) {
      // Fallback to TTS
      await this.playTextToSpeech(characterId, this.getDefaultText(type, subType), emotion)
      return
    }

    // Play random audio file
    const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)]
    await this.playAudioFile(characterId, randomFile, voiceConfig)
  }

  // Play audio file
  private async playAudioFile(
    characterId: string,
    url: string,
    voiceConfig: VoiceConfig
  ): Promise<void> {
    if (!this.audioContext) return

    // Stop current playback for this character
    this.stopCharacterVoice(characterId)

    const audioBuffer = await this.loadAudioFile(url)
    if (!audioBuffer) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = audioBuffer
    gainNode.gain.value = voiceConfig.volume

    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    const playback: AudioPlayback = {
      source,
      gainNode,
      startTime: this.audioContext.currentTime
    }

    this.currentPlayback.set(characterId, playback)

    source.onended = () => {
      this.currentPlayback.delete(characterId)
    }

    source.start()
  }

  // Text-to-Speech fallback
  async playTextToSpeech(
    characterId: string,
    text: string,
    emotion?: EmotionType
  ): Promise<void> {
    const voiceConfig = CharacterVoiceDatabase[characterId]
    if (!voiceConfig) return

    // Stop current playback
    this.stopCharacterVoice(characterId)

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Apply voice settings
      utterance.lang = voiceConfig.language
      utterance.pitch = this.adjustPitchForEmotion(voiceConfig.pitch, emotion)
      utterance.rate = this.adjustRateForEmotion(voiceConfig.rate, emotion)
      utterance.volume = voiceConfig.volume

      // Try to find matching voice
      const voices = speechSynthesis.getVoices()
      const matchingVoice = voices.find(voice => 
        voice.lang === voiceConfig.language && 
        voice.name.includes(voiceConfig.voiceId)
      ) || voices.find(voice => voice.lang === voiceConfig.language)

      if (matchingVoice) {
        utterance.voice = matchingVoice
      }

      speechSynthesis.speak(utterance)
    }
  }

  // Stop character voice
  stopCharacterVoice(characterId: string): void {
    const playback = this.currentPlayback.get(characterId)
    if (playback) {
      playback.source.stop()
      this.currentPlayback.delete(characterId)
    }

    // Also stop TTS if active
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }

  // Stop all voices
  stopAllVoices(): void {
    for (const characterId of this.currentPlayback.keys()) {
      this.stopCharacterVoice(characterId)
    }

    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }

  // Adjust pitch based on emotion
  private adjustPitchForEmotion(basePitch: number, emotion?: EmotionType): number {
    if (!emotion) return basePitch

    const emotionModifiers: Record<EmotionType, number> = {
      normal: 1.0,
      happy: 1.1,
      excited: 1.2,
      surprised: 1.15,
      sad: 0.9,
      angry: 0.8,
      confused: 1.05,
      determined: 1.0,
      worried: 0.95
    }

    return basePitch * (emotionModifiers[emotion] || 1.0)
  }

  // Adjust rate based on emotion
  private adjustRateForEmotion(baseRate: number, emotion?: EmotionType): number {
    if (!emotion) return baseRate

    const emotionModifiers: Record<EmotionType, number> = {
      normal: 1.0,
      happy: 1.05,
      excited: 1.15,
      surprised: 1.1,
      sad: 0.9,
      angry: 1.1,
      confused: 0.95,
      determined: 1.0,
      worried: 0.9
    }

    return baseRate * (emotionModifiers[emotion] || 1.0)
  }

  // Get default text for TTS fallback
  private getDefaultText(type: string, subType?: string): string {
    const defaultTexts: Record<string, string> = {
      greeting: 'こんにちは！',
      farewell: 'また会いましょう！',
      encouragement: '頑張って！',
      praise: '素晴らしい！',
      hint: 'ヒント: もう一度試してみてください',
      correction: '少し違います。もう一度やってみましょう'
    }

    return defaultTexts[subType || type] || defaultTexts[type] || 'こんにちは！'
  }

  // Get voice configuration
  getVoiceConfig(characterId: string): VoiceConfig | null {
    return CharacterVoiceDatabase[characterId] || null
  }

  // Preload character voices
  async preloadCharacterVoices(characterIds: string[]): Promise<void> {
    const loadPromises: Promise<void>[] = []

    for (const characterId of characterIds) {
      const voiceConfig = CharacterVoiceDatabase[characterId]
      if (voiceConfig) {
        // Preload essential audio files
        const essentialFiles = [
          ...voiceConfig.audioFiles.greetings.slice(0, 1),
          ...voiceConfig.audioFiles.farewells.slice(0, 1),
          ...voiceConfig.audioFiles.reactions.normal.slice(0, 1),
          ...voiceConfig.audioFiles.reactions.happy.slice(0, 1)
        ]

        for (const file of essentialFiles) {
          loadPromises.push(
            this.loadAudioFile(file).then(() => {})
          )
        }
      }
    }

    await Promise.all(loadPromises)
  }

  // Clean up resources
  cleanup(): void {
    this.stopAllVoices()
    this.audioCache.clear()
    this.currentPlayback.clear()
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }
}

// Audio playback interface
interface AudioPlayback {
  source: AudioBufferSourceNode
  gainNode: GainNode
  startTime: number
}

// Singleton instance
export const voiceManager = new CharacterVoiceManager()

// Utility functions
export const getCharacterVoiceConfig = (characterId: string): VoiceConfig | null => {
  return CharacterVoiceDatabase[characterId] || null
}

export const playCharacterGreeting = async (characterId: string): Promise<void> => {
  await voiceManager.playCharacterVoice(characterId, 'greeting')
}

export const playCharacterReaction = async (
  characterId: string,
  emotion: EmotionType
): Promise<void> => {
  await voiceManager.playCharacterVoice(characterId, 'reaction', undefined, emotion)
}

export const playCharacterPraise = async (characterId: string): Promise<void> => {
  await voiceManager.playCharacterVoice(characterId, 'gameSpecific', 'praise')
}

export const playCharacterEncouragement = async (characterId: string): Promise<void> => {
  await voiceManager.playCharacterVoice(characterId, 'gameSpecific', 'encouragement')
}

// Language support utilities
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return ['ja-JP', 'en-US', 'en-GB', 'ko-KR', 'zh-CN']
}

export const getAvailableVoices = (language: SupportedLanguage): string[] => {
  const voicesByLanguage: Record<SupportedLanguage, string[]> = {
    'ja-JP': ['ja-JP-KeitaNeural', 'ja-JP-NanamiNeural', 'ja-JP-AoiNeural', 'ja-JP-DaichiNeural', 'ja-JP-MayuNeural', 'ja-JP-NaokiNeural', 'ja-JP-MasaruNeural'],
    'en-US': ['en-US-AriaNeural', 'en-US-JennyNeural', 'en-US-GuyNeural', 'en-US-ChristopherNeural'],
    'en-GB': ['en-GB-LibbyNeural', 'en-GB-MiaNeural', 'en-GB-RyanNeural'],
    'ko-KR': ['ko-KR-SunHiNeural', 'ko-KR-InJoonNeural'],
    'zh-CN': ['zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural', 'zh-CN-YunjianNeural']
  }

  return voicesByLanguage[language] || []
}