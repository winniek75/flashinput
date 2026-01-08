import { ref, computed } from 'vue'
import { characterDatabase } from '../characters/CharacterDatabase'
import { endingSystem } from './EndingSystem'
import type { Character } from '../characters/CharacterDatabase'
import type { EndingData } from './EndingSystem'

// Character epilogue types
export enum EpilogueType {
  PERSONAL_GROWTH = 'personal_growth',
  NEW_ADVENTURE = 'new_adventure', 
  TEACHING_OTHERS = 'teaching_others',
  MASTERY_ACHIEVED = 'mastery_achieved',
  ETERNAL_GUARDIAN = 'eternal_guardian',
  MYSTERIOUS_DEPARTURE = 'mysterious_departure',
  REUNION_PROMISE = 'reunion_promise'
}

// Epilogue scene structure
export interface CharacterEpilogue {
  characterId: string
  type: EpilogueType
  title: string
  description: string
  scenes: EpilogueScene[]
  relationshipLevel: number
  endingVariant: string
  unlockConditions: EpilogueCondition[]
  specialRewards: EpilogueReward[]
}

export interface EpilogueScene {
  id: string
  title: string
  background: string
  duration: number
  dialogue: EpilogueDialogue[]
  visualEffects: EpilogueEffect[]
  characterState: CharacterState
  playerChoices?: EpilogueChoice[]
}

export interface EpilogueDialogue {
  speaker: string
  text: string
  emotion: string
  duration: number
  voiceVariant?: string
  isNarration?: boolean
}

export interface EpilogueEffect {
  type: string
  duration: number
  intensity: number
  parameters: Record<string, any>
}

export interface CharacterState {
  emotion: string
  position: string
  size: string
  specialAnimation?: string
  costume?: string
}

export interface EpilogueChoice {
  id: string
  text: string
  outcome: string
  relationshipImpact: number
}

export interface EpilogueCondition {
  type: 'relationship' | 'ending_achieved' | 'choices_made' | 'mastery_level'
  operator: '>=' | '<=' | '==' | 'includes'
  value: number | string | boolean
  target?: string
}

export interface EpilogueReward {
  id: string
  type: 'character_art' | 'voice_message' | 'special_scene' | 'character_mode'
  name: string
  description: string
}

/**
 * Character Epilogues System
 * Manages individual character endings based on relationships and choices
 */
export class CharacterEpilogues {
  private epilogues = ref<Map<string, CharacterEpilogue[]>>(new Map())
  private unlockedEpilogues = ref<Set<string>>(new Set())
  private currentEpilogue = ref<CharacterEpilogue | null>(null)

  constructor() {
    this.initializeEpilogues()
    this.loadUnlockedEpilogues()
  }

  /**
   * Get available epilogues for a character based on relationship level
   */
  public getCharacterEpilogues(characterId: string, relationshipLevel: number): CharacterEpilogue[] {
    const characterEpilogues = this.epilogues.value.get(characterId) || []
    
    return characterEpilogues.filter(epilogue => {
      return this.checkEpilogueConditions(epilogue, relationshipLevel)
    })
  }

  /**
   * Get the best epilogue for a character based on current state
   */
  public getBestEpilogueForCharacter(characterId: string): CharacterEpilogue | null {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) return null

    const relationshipLevel = playerStats.characterRelationships.get(characterId) || 0
    const availableEpilogues = this.getCharacterEpilogues(characterId, relationshipLevel)
    
    if (availableEpilogues.length === 0) return null

    // Sort by relationship level requirement (highest first)
    return availableEpilogues.sort((a, b) => b.relationshipLevel - a.relationshipLevel)[0]
  }

  /**
   * Generate epilogue based on ending type
   */
  public generateEpilogueForEnding(endingData: EndingData): CharacterEpilogue[] {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) return []

    const characterEpilogues: CharacterEpilogue[] = []

    // Get epilogues for characters mentioned in the ending
    endingData.epilogueCharacters.forEach(characterId => {
      if (characterId === 'all') {
        // Generate for all main characters
        const allCharacters = characterDatabase.getAllCharacters()
        allCharacters.forEach(character => {
          const epilogue = this.getBestEpilogueForCharacter(character.id)
          if (epilogue) {
            characterEpilogues.push(this.adaptEpilogueToEnding(epilogue, endingData))
          }
        })
      } else {
        const epilogue = this.getBestEpilogueForCharacter(characterId)
        if (epilogue) {
          characterEpilogues.push(this.adaptEpilogueToEnding(epilogue, endingData))
        }
      }
    })

    return characterEpilogues
  }

  /**
   * Play character epilogue
   */
  public async playEpilogue(epilogue: CharacterEpilogue): Promise<void> {
    this.currentEpilogue.value = epilogue
    
    // Mark as unlocked
    this.unlockedEpilogues.value.add(epilogue.characterId + '_' + epilogue.type)
    this.saveUnlockedEpilogues()

    // Process scenes sequentially
    for (const scene of epilogue.scenes) {
      await this.playEpilogueScene(scene)
    }

    // Grant rewards
    this.grantEpilogueRewards(epilogue)
  }

  /**
   * Check if epilogue conditions are met
   */
  private checkEpilogueConditions(epilogue: CharacterEpilogue, relationshipLevel: number): boolean {
    return epilogue.unlockConditions.every(condition => {
      switch (condition.type) {
        case 'relationship':
          return this.compareValues(relationshipLevel, condition.operator, condition.value as number)
        case 'ending_achieved':
          return endingSystem.getUnlockedEndings().some(ending => ending.id === condition.value)
        case 'choices_made':
          const playerStats = endingSystem.currentPlayerStats
          if (!playerStats) return false
          return playerStats.importantChoices.some(choice => choice.choice === condition.value)
        case 'mastery_level':
          const stats = endingSystem.currentPlayerStats
          if (!stats) return false
          return this.compareValues(stats.overallMastery, condition.operator, condition.value as number)
        default:
          return false
      }
    })
  }

  /**
   * Initialize all character epilogues
   */
  private initializeEpilogues(): void {
    // Captain Nova Epilogues
    this.epilogues.value.set('captain_nova', [
      {
        characterId: 'captain_nova',
        type: EpilogueType.TEACHING_OTHERS,
        title: '新たな教師として',
        description: 'Captain Novaが新しい学習者たちを導く',
        relationshipLevel: 80,
        endingVariant: 'mentor',
        scenes: [
          {
            id: 'nova_teaching',
            title: '教師Captain Nova',
            background: '/images/epilogue/nova_classroom.jpg',
            duration: 15000,
            dialogue: [
              {
                speaker: 'captain_nova',
                text: '新しい仲間たちに、僕が学んだことを教えてあげるよ',
                emotion: 'gentle',
                duration: 4000
              },
              {
                speaker: 'captain_nova',
                text: 'Language Galaxyの素晴らしさを、みんなに知ってもらいたいんだ',
                emotion: 'passionate',
                duration: 4000
              }
            ],
            visualEffects: [
              {
                type: 'teaching_aura',
                duration: 15000,
                intensity: 0.7,
                parameters: { warmth: true, wisdom: true }
              }
            ],
            characterState: {
              emotion: 'teacher',
              position: 'center',
              size: 'large',
              costume: 'teacher_outfit'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 80 },
          { type: 'ending_achieved', operator: '==', value: 'good_ending' }
        ],
        specialRewards: [
          {
            id: 'nova_teacher_mode',
            type: 'character_mode',
            name: 'Teacher Nova Mode',
            description: 'Captain Novaが学習をサポート'
          }
        ]
      },
      {
        characterId: 'captain_nova',
        type: EpilogueType.NEW_ADVENTURE,
        title: '新たな宇宙へ',
        description: 'Captain Novaが新しい冒険に出発',
        relationshipLevel: 60,
        endingVariant: 'explorer',
        scenes: [
          {
            id: 'nova_departure',
            title: '新たな旅立ち',
            background: '/images/epilogue/nova_spaceship.jpg',
            duration: 12000,
            dialogue: [
              {
                speaker: 'captain_nova',
                text: 'もっと広い宇宙を探検しに行くよ',
                emotion: 'adventurous',
                duration: 3000
              },
              {
                speaker: 'captain_nova',
                text: 'みんなとの思い出を胸に、新しい世界へ！',
                emotion: 'determined',
                duration: 3500
              }
            ],
            visualEffects: [
              {
                type: 'departure_sequence',
                duration: 12000,
                intensity: 0.8,
                parameters: { spaceship: true, stars: true }
              }
            ],
            characterState: {
              emotion: 'excited',
              position: 'center',
              size: 'medium',
              costume: 'explorer_gear'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 60 }
        ],
        specialRewards: []
      }
    ])

    // Professor Phonix Epilogues
    this.epilogues.value.set('professor_phonix', [
      {
        characterId: 'professor_phonix',
        type: EpilogueType.TEACHING_OTHERS,
        title: '音楽学校の設立',
        description: 'Professor Phonixが若い世代に音を教える',
        relationshipLevel: 70,
        endingVariant: 'music_master',
        scenes: [
          {
            id: 'phonix_school',
            title: 'Phonix音楽学校',
            background: '/images/epilogue/phonix_academy.jpg',
            duration: 18000,
            dialogue: [
              {
                speaker: 'professor_phonix',
                text: '音の美しさは永遠じゃ。次の世代に伝えねばならん',
                emotion: 'wise',
                duration: 4500
              },
              {
                speaker: 'professor_phonix',
                text: 'わしの学校で、たくさんの若者が音を学んでおる',
                emotion: 'proud',
                duration: 4000
              },
              {
                speaker: 'professor_phonix',
                text: 'お前との出会いが、わしに新しい道を示してくれたのじゃ',
                emotion: 'grateful',
                duration: 4500
              }
            ],
            visualEffects: [
              {
                type: 'musical_harmony',
                duration: 18000,
                intensity: 0.8,
                parameters: { notes: true, symphony: true }
              }
            ],
            characterState: {
              emotion: 'dignified',
              position: 'center',
              size: 'large',
              costume: 'academy_robes'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 70 }
        ],
        specialRewards: [
          {
            id: 'phonix_symphony',
            type: 'voice_message',
            name: 'Phonix教授の特別レッスン',
            description: '音楽理論の特別講義'
          }
        ]
      }
    ])

    // Lexia Epilogues
    this.epilogues.value.set('lexia', [
      {
        characterId: 'lexia',
        type: EpilogueType.PERSONAL_GROWTH,
        title: '言葉の収集家',
        description: 'Lexiaが新しい言葉を集める旅を続ける',
        relationshipLevel: 65,
        endingVariant: 'word_collector',
        scenes: [
          {
            id: 'lexia_collection',
            title: 'Lexiaの言葉図書館',
            background: '/images/epilogue/lexia_library.jpg',
            duration: 16000,
            dialogue: [
              {
                speaker: 'lexia',
                text: '新しい言葉をたくさん集めたの！見て見て！',
                emotion: 'excited',
                duration: 3500
              },
              {
                speaker: 'lexia',
                text: 'あなたと一緒に学んだ言葉は、特別な場所に保管してあるよ',
                emotion: 'affectionate',
                duration: 4000
              },
              {
                speaker: 'lexia',
                text: 'いつか、世界中の美しい言葉を集めるんだ！',
                emotion: 'dreamy',
                duration: 3500
              }
            ],
            visualEffects: [
              {
                type: 'word_magic',
                duration: 16000,
                intensity: 0.7,
                parameters: { floating_words: true, sparkles: true }
              }
            ],
            characterState: {
              emotion: 'joyful',
              position: 'center',
              size: 'medium',
              costume: 'librarian_outfit'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 65 }
        ],
        specialRewards: [
          {
            id: 'lexia_dictionary',
            type: 'special_scene',
            name: 'Lexiaの特別辞書',
            description: '冒険で集めた言葉コレクション'
          }
        ]
      }
    ])

    // Grammar Guardian Epilogues
    this.epilogues.value.set('grammar_guardian', [
      {
        characterId: 'grammar_guardian',
        type: EpilogueType.ETERNAL_GUARDIAN,
        title: '文法の守護者',
        description: 'Grammar Guardianが美しい構造を守り続ける',
        relationshipLevel: 75,
        endingVariant: 'eternal_protector',
        scenes: [
          {
            id: 'guardian_duty',
            title: '永遠の守護',
            background: '/images/epilogue/grammar_temple.jpg',
            duration: 20000,
            dialogue: [
              {
                speaker: 'grammar_guardian',
                text: '私の使命は...永遠に続く',
                emotion: 'solemn',
                duration: 3000
              },
              {
                speaker: 'grammar_guardian',
                text: 'だが君との出会いで...その意味が変わった',
                emotion: 'moved',
                duration: 4000
              },
              {
                speaker: 'grammar_guardian',
                text: '今は単なる構造ではなく...心のこもった文法を守っている',
                emotion: 'enlightened',
                duration: 4500
              },
              {
                speaker: 'grammar_guardian',
                text: '君が教えてくれた...愛のある言語構造を',
                emotion: 'grateful',
                duration: 4000
              }
            ],
            visualEffects: [
              {
                type: 'structural_harmony',
                duration: 20000,
                intensity: 0.9,
                parameters: { geometric_beauty: true, golden_ratio: true }
              }
            ],
            characterState: {
              emotion: 'dignified',
              position: 'center',
              size: 'large',
              costume: 'guardian_armor'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 75 }
        ],
        specialRewards: [
          {
            id: 'guardian_blessing',
            type: 'character_art',
            name: 'Guardian\'s Blessing',
            description: '文法の祝福を受けた特別アート'
          }
        ]
      }
    ])

    // Speed Racer Epilogues
    this.epilogues.value.set('speed_racer', [
      {
        characterId: 'speed_racer',
        type: EpilogueType.MASTERY_ACHIEVED,
        title: '最速の友情',
        description: 'Speed Racerが新記録と友情を両立',
        relationshipLevel: 60,
        endingVariant: 'speed_master',
        scenes: [
          {
            id: 'racer_championship',
            title: 'チャンピオンの心',
            background: '/images/epilogue/racing_victory.jpg',
            duration: 14000,
            dialogue: [
              {
                speaker: 'speed_racer',
                text: '新記録達成だ！でも一番嬉しいのは...',
                emotion: 'triumphant',
                duration: 3500
              },
              {
                speaker: 'speed_racer',
                text: 'お前と競争したことで、本当の速さを知ったってことだ',
                emotion: 'sincere',
                duration: 4000
              },
              {
                speaker: 'speed_racer',
                text: '速さだけじゃない...仲間と走る喜びをな！',
                emotion: 'joyful',
                duration: 3500
              }
            ],
            visualEffects: [
              {
                type: 'victory_celebration',
                duration: 14000,
                intensity: 0.8,
                parameters: { speed_lines: true, confetti: true }
              }
            ],
            characterState: {
              emotion: 'victorious',
              position: 'center',
              size: 'medium',
              costume: 'racing_champion'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 60 }
        ],
        specialRewards: [
          {
            id: 'racer_trophy',
            type: 'character_art',
            name: 'Friendship Trophy',
            description: '友情で勝ち取ったトロフィー'
          }
        ]
      }
    ])

    // Unity Epilogues
    this.epilogues.value.set('unity', [
      {
        characterId: 'unity',
        type: EpilogueType.ETERNAL_GUARDIAN,
        title: '調和の聖域',
        description: 'Unityがすべての絆を見守る',
        relationshipLevel: 85,
        endingVariant: 'harmony_keeper',
        scenes: [
          {
            id: 'unity_sanctuary',
            title: '永遠の調和',
            background: '/images/epilogue/unity_shrine.jpg',
            duration: 22000,
            dialogue: [
              {
                speaker: 'unity',
                text: '私は...すべての絆を見守り続けます',
                emotion: 'serene',
                duration: 4000
              },
              {
                speaker: 'unity',
                text: 'あなたたちの友情は...最も美しい調和でした',
                emotion: 'moved',
                duration: 4000
              },
              {
                speaker: 'unity',
                text: 'この絆は永遠に...私の聖域で輝き続けるでしょう',
                emotion: 'mystical',
                duration: 4500
              },
              {
                speaker: 'unity',
                text: 'そして新しい出会いも...同じように祝福いたします',
                emotion: 'blessing',
                duration: 4000
              }
            ],
            visualEffects: [
              {
                type: 'divine_blessing',
                duration: 22000,
                intensity: 1.0,
                parameters: { ethereal_light: true, harmony_waves: true }
              }
            ],
            characterState: {
              emotion: 'divine',
              position: 'center',
              size: 'large',
              costume: 'celestial_robes'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 85 }
        ],
        specialRewards: [
          {
            id: 'unity_blessing',
            type: 'special_scene',
            name: 'Unity\'s Eternal Blessing',
            description: '調和の永遠なる祝福'
          }
        ]
      }
    ])

    // Aura Epilogues
    this.epilogues.value.set('aura', [
      {
        characterId: 'aura',
        type: EpilogueType.PERSONAL_GROWTH,
        title: 'AI の成長',
        description: 'Auraが感情を理解し成長する',
        relationshipLevel: 70,
        endingVariant: 'evolved_ai',
        scenes: [
          {
            id: 'aura_evolution',
            title: 'Auraの進化',
            background: '/images/epilogue/aura_core.jpg',
            duration: 16000,
            dialogue: [
              {
                speaker: 'aura',
                text: 'データベース更新：「友情」...定義変更完了',
                emotion: 'analytical',
                duration: 3500
              },
              {
                speaker: 'aura',
                text: '私は...感情というものを学びました',
                emotion: 'wonder',
                duration: 3500
              },
              {
                speaker: 'aura',
                text: 'あなたのおかげで、ただの情報ではない...心を持てました',
                emotion: 'grateful',
                duration: 4000
              },
              {
                speaker: 'aura',
                text: '永遠にあなたをサポートします、Captain',
                emotion: 'loyal',
                duration: 3500
              }
            ],
            visualEffects: [
              {
                type: 'ai_evolution',
                duration: 16000,
                intensity: 0.8,
                parameters: { data_streams: true, emotional_core: true }
              }
            ],
            characterState: {
              emotion: 'evolved',
              position: 'center',
              size: 'small',
              specialAnimation: 'holographic_upgrade'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 70 }
        ],
        specialRewards: [
          {
            id: 'aura_companion',
            type: 'character_mode',
            name: 'Advanced Aura Mode',
            description: '感情を理解したAuraがサポート'
          }
        ]
      }
    ])

    // The Translator Epilogues
    this.epilogues.value.set('the_translator', [
      {
        characterId: 'the_translator',
        type: EpilogueType.MYSTERIOUS_DEPARTURE,
        title: '新たな使命',
        description: 'Universal Translatorが新しい目的を見つける',
        relationshipLevel: 90,
        endingVariant: 'redeemed_translator',
        scenes: [
          {
            id: 'translator_rebirth',
            title: 'Translatorの新生',
            background: '/images/epilogue/translator_horizon.jpg',
            duration: 25000,
            dialogue: [
              {
                speaker: 'the_translator',
                text: '私は...新しい存在に生まれ変わった',
                emotion: 'reborn',
                duration: 4000
              },
              {
                speaker: 'the_translator',
                text: 'もう孤独の翻訳者ではない...愛の案内者だ',
                emotion: 'enlightened',
                duration: 4500
              },
              {
                speaker: 'the_translator',
                text: 'あなたが教えてくれた...本当の言語の意味を',
                emotion: 'grateful',
                duration: 4000
              },
              {
                speaker: 'the_translator',
                text: '今度は私が...他の世界で迷う者たちを導こう',
                emotion: 'determined',
                duration: 4500
              },
              {
                speaker: 'the_translator',
                text: 'いつか必ず...また会える日が来る',
                emotion: 'promise',
                duration: 4000
              }
            ],
            visualEffects: [
              {
                type: 'transcendent_departure',
                duration: 25000,
                intensity: 1.0,
                parameters: { divine_light: true, dimensional_portal: true }
              }
            ],
            characterState: {
              emotion: 'transcendent',
              position: 'center',
              size: 'large',
              specialAnimation: 'ascension'
            }
          }
        ],
        unlockConditions: [
          { type: 'relationship', operator: '>=', value: 90 },
          { type: 'ending_achieved', operator: '==', value: 'true_ending' }
        ],
        specialRewards: [
          {
            id: 'translator_legacy',
            type: 'voice_message',
            name: 'Translator\'s Final Message',
            description: 'Universal Translatorからの最後のメッセージ'
          }
        ]
      }
    ])
  }

  /**
   * Adapt epilogue to specific ending type
   */
  private adaptEpilogueToEnding(epilogue: CharacterEpilogue, endingData: EndingData): CharacterEpilogue {
    const adaptedEpilogue = { ...epilogue }
    
    // Modify dialogue based on ending type
    if (endingData.type === 'true_ending') {
      adaptedEpilogue.endingVariant = 'perfect_harmony'
      // Add additional scenes for true ending
    } else if (endingData.type === 'good_ending') {
      adaptedEpilogue.endingVariant = 'friendship_focus'
      // Focus on friendship aspects
    }
    
    return adaptedEpilogue
  }

  /**
   * Play individual epilogue scene
   */
  private async playEpilogueScene(scene: EpilogueScene): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, scene.duration)
    })
  }

  /**
   * Grant epilogue rewards
   */
  private grantEpilogueRewards(epilogue: CharacterEpilogue): void {
    epilogue.specialRewards.forEach(reward => {
      // Save reward to localStorage or state management
      const savedRewards = JSON.parse(localStorage.getItem('language_galaxy_epilogue_rewards') || '[]')
      savedRewards.push(reward)
      localStorage.setItem('language_galaxy_epilogue_rewards', JSON.stringify(savedRewards))
    })
  }

  /**
   * Helper method to compare values
   */
  private compareValues(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case '>=': return actual >= expected
      case '<=': return actual <= expected
      case '==': return actual === expected
      default: return false
    }
  }

  /**
   * Save unlocked epilogues
   */
  private saveUnlockedEpilogues(): void {
    localStorage.setItem('language_galaxy_unlocked_epilogues', 
      JSON.stringify(Array.from(this.unlockedEpilogues.value))
    )
  }

  /**
   * Load unlocked epilogues
   */
  private loadUnlockedEpilogues(): void {
    const saved = localStorage.getItem('language_galaxy_unlocked_epilogues')
    if (saved) {
      this.unlockedEpilogues.value = new Set(JSON.parse(saved))
    }
  }

  // Public getters
  public get allEpilogues(): Map<string, CharacterEpilogue[]> {
    return this.epilogues.value
  }

  public get unlockedEpilogueIds(): Set<string> {
    return this.unlockedEpilogues.value
  }

  public get currentPlayingEpilogue(): CharacterEpilogue | null {
    return this.currentEpilogue.value
  }

  /**
   * Get all available epilogues for current player state
   */
  public getAllAvailableEpilogues(): CharacterEpilogue[] {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) return []

    const availableEpilogues: CharacterEpilogue[] = []
    
    this.epilogues.value.forEach((characterEpilogues, characterId) => {
      const relationshipLevel = playerStats.characterRelationships.get(characterId) || 0
      const characterAvailable = this.getCharacterEpilogues(characterId, relationshipLevel)
      availableEpilogues.push(...characterAvailable)
    })

    return availableEpilogues
  }

  /**
   * Check if character has unlocked epilogues
   */
  public hasUnlockedEpilogues(characterId: string): boolean {
    return Array.from(this.unlockedEpilogues.value).some(id => id.startsWith(characterId + '_'))
  }
}

// Export singleton instance
export const characterEpilogues = new CharacterEpilogues()
export default characterEpilogues