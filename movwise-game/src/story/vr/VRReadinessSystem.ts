import { ref, computed } from 'vue'
import { endingSystem } from '../endings/EndingSystem'
import { characterDatabase } from '../characters/CharacterDatabase'
import vrIntroStory from './VRIntroductionStory.json'
import type { Character } from '../characters/CharacterDatabase'

// VR Readiness levels
export enum VRReadinessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced',
  MASTER = 'master'
}

// Story variants for each readiness level
export interface VRStoryVariant {
  level: VRReadinessLevel
  title: string
  description: string
  encouragementMessage: string
  mentorCharacter: string
  storylineApproach: string
  difficultyAdjustments: VRDifficultyAdjustment[]
  specialFeatures: string[]
  introductionScenario: VRIntroScenario
}

export interface VRDifficultyAdjustment {
  aspect: 'tutorial_length' | 'complexity' | 'guidance_level' | 'challenge_intensity'
  value: number
  description: string
}

export interface VRIntroScenario {
  id: string
  title: string
  background: string
  duration: number
  characters: VRScenarioCharacter[]
  dialogue: VRDialogue[]
  supportLevel: 'high' | 'medium' | 'low'
  expectations: string[]
}

export interface VRScenarioCharacter {
  id: string
  role: 'mentor' | 'guide' | 'supporter' | 'companion'
  emotion: string
  supportType: string
}

export interface VRDialogue {
  speaker: string
  text: string
  emotion: string
  purpose: 'encouragement' | 'instruction' | 'reassurance' | 'challenge'
  tone: 'gentle' | 'confident' | 'exciting' | 'inspiring'
}

// Player assessment data
export interface PlayerAssessment {
  languageMastery: {
    overall: number
    pronunciation: number
    vocabulary: number
    grammar: number
    typing: number
    cooperation: number
  }
  characterRelationships: {
    average: number
    strongest: string
    weakest: string
    totalFriends: number
  }
  storyProgression: {
    chaptersCompleted: number
    totalPlayTime: number
    achievementsUnlocked: number
  }
  specialAchievements: {
    perfectScores: number
    hiddenDiscoveries: number
    friendshipMoments: number
    creativeSolutions: number
  }
  emotionalReadiness: {
    confidenceLevel: number
    anxietyLevel: number
    excitementLevel: number
    curiosityLevel: number
  }
}

/**
 * VR Readiness System
 * Assesses player readiness and customizes VR introduction experience
 */
export class VRReadinessSystem {
  private currentAssessment = ref<PlayerAssessment | null>(null)
  private readinessLevel = ref<VRReadinessLevel>(VRReadinessLevel.BEGINNER)
  private customStoryVariant = ref<VRStoryVariant | null>(null)
  private vrAnxietyFactors = ref<string[]>([])
  private supportStrategies = ref<string[]>([])

  constructor() {
    this.initializeReadinessSystem()
  }

  /**
   * Assess player's VR readiness based on comprehensive factors
   */
  public assessPlayerReadiness(): PlayerAssessment {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) {
      return this.createDefaultAssessment()
    }

    const assessment: PlayerAssessment = {
      languageMastery: {
        overall: playerStats.overallMastery,
        pronunciation: this.getPlanetMastery('sound_planet'),
        vocabulary: this.getPlanetMastery('word_planet'),
        grammar: this.getPlanetMastery('grammar_planet'),
        typing: this.getPlanetMastery('speed_station'),
        cooperation: this.getPlanetMastery('cooperation_colony')
      },
      characterRelationships: this.assessCharacterRelationships(),
      storyProgression: {
        chaptersCompleted: this.getCompletedChapters(),
        totalPlayTime: playerStats.totalPlayTime,
        achievementsUnlocked: playerStats.achievementsUnlocked.length
      },
      specialAchievements: {
        perfectScores: playerStats.perfectScores,
        hiddenDiscoveries: playerStats.hiddenStoriesFound,
        friendshipMoments: this.countFriendshipMoments(),
        creativeSolutions: this.countCreativeSolutions()
      },
      emotionalReadiness: this.assessEmotionalReadiness()
    }

    this.currentAssessment.value = assessment
    this.readinessLevel.value = this.calculateReadinessLevel(assessment)
    this.customStoryVariant.value = this.createCustomStoryVariant()

    return assessment
  }

  /**
   * Calculate VR readiness level based on assessment
   */
  private calculateReadinessLevel(assessment: PlayerAssessment): VRReadinessLevel {
    const weights = {
      languageMastery: 0.4,
      relationships: 0.25,
      progression: 0.2,
      achievements: 0.15
    }

    const languageScore = assessment.languageMastery.overall
    const relationshipScore = assessment.characterRelationships.average
    const progressionScore = Math.min(100, (assessment.storyProgression.chaptersCompleted / 7) * 100)
    const achievementScore = Math.min(100, 
      (assessment.specialAchievements.perfectScores * 10) +
      (assessment.specialAchievements.hiddenDiscoveries * 5) +
      (assessment.specialAchievements.friendshipMoments * 3)
    )

    const totalScore = 
      (languageScore * weights.languageMastery) +
      (relationshipScore * weights.relationships) +
      (progressionScore * weights.progression) +
      (achievementScore * weights.achievements)

    // Apply emotional readiness modifiers
    const confidenceModifier = (assessment.emotionalReadiness.confidenceLevel - 50) * 0.2
    const anxietyPenalty = Math.max(0, (assessment.emotionalReadiness.anxietyLevel - 50) * 0.1)
    
    const finalScore = Math.max(0, Math.min(100, totalScore + confidenceModifier - anxietyPenalty))

    if (finalScore >= 90) return VRReadinessLevel.MASTER
    if (finalScore >= 70) return VRReadinessLevel.ADVANCED
    if (finalScore >= 40) return VRReadinessLevel.INTERMEDIATE
    return VRReadinessLevel.BEGINNER
  }

  /**
   * Create customized story variant based on readiness level
   */
  private createCustomStoryVariant(): VRStoryVariant {
    const level = this.readinessLevel.value
    const assessment = this.currentAssessment.value!

    const storyVariants: Record<VRReadinessLevel, VRStoryVariant> = {
      [VRReadinessLevel.BEGINNER]: {
        level: VRReadinessLevel.BEGINNER,
        title: 'やさしいVR体験への招待',
        description: '一歩ずつ、安心してVRの世界を体験しましょう',
        encouragementMessage: 'いまの学習レベルで十分です。VRでもっと楽しく学べますよ',
        mentorCharacter: this.getBestMentorForBeginner(),
        storylineApproach: 'gentle_guidance',
        difficultyAdjustments: [
          {
            aspect: 'tutorial_length',
            value: 1.5,
            description: '丁寧で長めのチュートリアル'
          },
          {
            aspect: 'guidance_level',
            value: 0.9,
            description: '手厚いサポートとガイダンス'
          },
          {
            aspect: 'complexity',
            value: 0.6,
            description: 'シンプルで分かりやすい操作'
          },
          {
            aspect: 'challenge_intensity',
            value: 0.4,
            description: '負担の少ない優しいチャレンジ'
          }
        ],
        specialFeatures: [
          'constant_reassurance',
          'break_reminders',
          'simplified_ui',
          'voice_guidance',
          'friend_support'
        ],
        introductionScenario: this.createBeginnerScenario()
      },

      [VRReadinessLevel.INTERMEDIATE]: {
        level: VRReadinessLevel.INTERMEDIATE,
        title: '次のステップへの扉',
        description: '素晴らしい基礎力です。VRで新しい可能性を発見しましょう',
        encouragementMessage: 'あなたの学習への取り組みが素晴らしいです。VRでさらに成長できますね',
        mentorCharacter: this.getBestMentorForIntermediate(),
        storylineApproach: 'encouraging_progress',
        difficultyAdjustments: [
          {
            aspect: 'tutorial_length',
            value: 1.0,
            description: '標準的な長さのチュートリアル'
          },
          {
            aspect: 'guidance_level',
            value: 0.7,
            description: '適度なサポートと自立性のバランス'
          },
          {
            aspect: 'complexity',
            value: 0.8,
            description: '段階的に複雑になる操作'
          },
          {
            aspect: 'challenge_intensity',
            value: 0.7,
            description: 'やりがいのあるチャレンジ'
          }
        ],
        specialFeatures: [
          'progress_celebration',
          'skill_building_focus',
          'choice_options',
          'peer_comparison',
          'achievement_tracking'
        ],
        introductionScenario: this.createIntermediateScenario()
      },

      [VRReadinessLevel.ADVANCED]: {
        level: VRReadinessLevel.ADVANCED,
        title: '真の冒険への招待',
        description: '高い実力をお持ちです。VRで本格的な言語冒険を始めましょう',
        encouragementMessage: 'あなたの言語能力なら、VRで驚くような体験ができるでしょう',
        mentorCharacter: this.getBestMentorForAdvanced(),
        storylineApproach: 'adventure_challenge',
        difficultyAdjustments: [
          {
            aspect: 'tutorial_length',
            value: 0.8,
            description: '効率的で要点を絞ったチュートリアル'
          },
          {
            aspect: 'guidance_level',
            value: 0.5,
            description: '必要最小限のガイダンスで自立性重視'
          },
          {
            aspect: 'complexity',
            value: 1.1,
            description: '複雑で高度な操作や機能'
          },
          {
            aspect: 'challenge_intensity',
            value: 0.9,
            description: '手応えのある本格的チャレンジ'
          }
        ],
        specialFeatures: [
          'advanced_mechanics',
          'competitive_elements',
          'creative_mode',
          'mastery_tracking',
          'mentor_role_opportunity'
        ],
        introductionScenario: this.createAdvancedScenario()
      },

      [VRReadinessLevel.MASTER]: {
        level: VRReadinessLevel.MASTER,
        title: '伝説の探検家への道',
        description: '言語マスターとして、VRで伝説的な学習体験を創造しましょう',
        encouragementMessage: 'あなたは既に言語の達人です。VRで新たな次元の探検に挑戦しませんか',
        mentorCharacter: 'the_translator',
        storylineApproach: 'master_collaboration',
        difficultyAdjustments: [
          {
            aspect: 'tutorial_length',
            value: 0.5,
            description: '最小限のチュートリアル、すぐに本格体験'
          },
          {
            aspect: 'guidance_level',
            value: 0.3,
            description: 'ほぼ完全な自立、創造的自由'
          },
          {
            aspect: 'complexity',
            value: 1.3,
            description: '最高レベルの複雑性と深度'
          },
          {
            aspect: 'challenge_intensity',
            value: 1.2,
            description: 'マスター級の極限チャレンジ'
          }
        ],
        specialFeatures: [
          'creator_tools',
          'teaching_mode',
          'research_projects',
          'beta_features',
          'developer_collaboration'
        ],
        introductionScenario: this.createMasterScenario()
      }
    }

    return storyVariants[level]
  }

  /**
   * Get personalized VR introduction story
   */
  public getPersonalizedIntroStory(): any {
    const variant = this.customStoryVariant.value
    if (!variant) return null

    return {
      ...vrIntroStory,
      personalizedContent: {
        readinessLevel: variant.level,
        customScenario: variant.introductionScenario,
        mentorCharacter: variant.mentorCharacter,
        difficultySettings: variant.difficultyAdjustments,
        supportFeatures: variant.specialFeatures,
        encouragementMessages: this.generateEncouragementMessages(),
        anxietyRelief: this.generateAnxietyReliefContent(),
        excitementBuilders: this.generateExcitementContent()
      }
    }
  }

  /**
   * Generate anxiety relief content based on player concerns
   */
  public identifyVRAnxieties(): string[] {
    const anxieties: string[] = []
    const assessment = this.currentAssessment.value

    if (!assessment) return anxieties

    if (assessment.emotionalReadiness.anxietyLevel > 60) {
      anxieties.push('general_vr_anxiety')
    }

    if (assessment.languageMastery.overall < 50) {
      anxieties.push('performance_anxiety')
    }

    if (assessment.characterRelationships.average < 40) {
      anxieties.push('social_interaction_concern')
    }

    if (assessment.storyProgression.totalPlayTime < 7200000) { // Less than 2 hours
      anxieties.push('technology_intimidation')
    }

    return anxieties
  }

  /**
   * Generate support strategies for identified anxieties
   */
  public generateSupportStrategies(): string[] {
    const anxieties = this.identifyVRAnxieties()
    const strategies: string[] = []

    anxieties.forEach(anxiety => {
      switch (anxiety) {
        case 'general_vr_anxiety':
          strategies.push('gradual_exposure', 'comfort_breaks', 'exit_anytime_assurance')
          break
        case 'performance_anxiety':
          strategies.push('no_judgment_zone', 'practice_mode', 'progress_celebration')
          break
        case 'social_interaction_concern':
          strategies.push('one_on_one_start', 'familiar_characters', 'social_skills_building')
          break
        case 'technology_intimidation':
          strategies.push('simple_start', 'voice_commands', 'gesture_alternatives')
          break
      }
    })

    return [...new Set(strategies)] // Remove duplicates
  }

  /**
   * Create readiness-appropriate dialogue
   */
  public generateReadinessDialogue(characterId: string, situation: string): VRDialogue[] {
    const level = this.readinessLevel.value
    const character = characterDatabase.getCharacter(characterId)
    
    const dialogueTemplates = {
      [VRReadinessLevel.BEGINNER]: {
        greeting: {
          text: `${character?.name}です。VRは初めてでも大丈夫ですよ。一緒にゆっくり始めましょう`,
          emotion: 'gentle',
          purpose: 'reassurance' as const,
          tone: 'gentle' as const
        },
        encouragement: {
          text: 'いまのペースで完璧です。焦る必要はありません',
          emotion: 'supportive',
          purpose: 'encouragement' as const,
          tone: 'gentle' as const
        }
      },
      [VRReadinessLevel.INTERMEDIATE]: {
        greeting: {
          text: `素晴らしい学習の成果ですね！VRでさらに楽しい体験をしましょう`,
          emotion: 'proud',
          purpose: 'encouragement' as const,
          tone: 'confident' as const
        },
        encouragement: {
          text: 'あなたの基礎力なら、VRでもきっと素晴らしい成果を上げられます',
          emotion: 'confident',
          purpose: 'encouragement' as const,
          tone: 'confident' as const
        }
      },
      [VRReadinessLevel.ADVANCED]: {
        greeting: {
          text: `高い言語能力をお持ちですね！VRで本格的な冒険を始めましょう`,
          emotion: 'excited',
          purpose: 'challenge' as const,
          tone: 'exciting' as const
        },
        encouragement: {
          text: 'あなたなら、VRでも新しい可能性を発見できるでしょう',
          emotion: 'inspiring',
          purpose: 'challenge' as const,
          tone: 'inspiring' as const
        }
      },
      [VRReadinessLevel.MASTER]: {
        greeting: {
          text: `言語マスターとして、VRでの伝説的体験をお約束します`,
          emotion: 'reverent',
          purpose: 'challenge' as const,
          tone: 'inspiring' as const
        },
        encouragement: {
          text: 'あなたの技能は、VRで新たな次元に到達するでしょう',
          emotion: 'epic',
          purpose: 'challenge' as const,
          tone: 'inspiring' as const
        }
      }
    }

    const template = dialogueTemplates[level]
    return Object.entries(template).map(([key, dialogue]) => ({
      speaker: characterId,
      ...dialogue
    }))
  }

  // Helper methods
  private getPlanetMastery(planetId: string): number {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) return 0
    return playerStats.planetMasteries.get(planetId) || 0
  }

  private assessCharacterRelationships(): PlayerAssessment['characterRelationships'] {
    const playerStats = endingSystem.currentPlayerStats
    if (!playerStats) {
      return { average: 0, strongest: '', weakest: '', totalFriends: 0 }
    }

    const relationships = Array.from(playerStats.characterRelationships.entries())
    const average = relationships.reduce((sum, [_, value]) => sum + value, 0) / relationships.length
    
    let strongest = ''
    let weakest = ''
    let maxRel = 0
    let minRel = 100

    relationships.forEach(([charId, value]) => {
      if (value > maxRel) {
        maxRel = value
        strongest = charId
      }
      if (value < minRel) {
        minRel = value
        weakest = charId
      }
    })

    const totalFriends = relationships.filter(([_, value]) => value >= 60).length

    return { average, strongest, weakest, totalFriends }
  }

  private getCompletedChapters(): number {
    // This would integrate with story progression system
    return 5 // Placeholder
  }

  private countFriendshipMoments(): number {
    // Count special friendship interactions
    return 8 // Placeholder
  }

  private countCreativeSolutions(): number {
    // Count creative problem-solving instances
    return 3 // Placeholder
  }

  private assessEmotionalReadiness(): PlayerAssessment['emotionalReadiness'] {
    const assessment = this.currentAssessment.value
    const playerStats = endingSystem.currentPlayerStats

    // Base emotional readiness on performance and engagement patterns
    let confidenceLevel = 50
    let anxietyLevel = 50
    let excitementLevel = 50
    let curiosityLevel = 50

    if (playerStats) {
      // Higher mastery = higher confidence
      confidenceLevel = Math.min(100, 30 + (playerStats.overallMastery * 0.7))
      
      // More perfect scores = lower anxiety
      anxietyLevel = Math.max(10, 70 - (playerStats.perfectScores * 5))
      
      // Hidden discoveries = higher curiosity
      curiosityLevel = Math.min(100, 40 + (playerStats.hiddenStoriesFound * 8))
      
      // Story engagement = higher excitement
      excitementLevel = Math.min(100, 40 + (this.getCompletedChapters() * 10))
    }

    return { confidenceLevel, anxietyLevel, excitementLevel, curiosityLevel }
  }

  private getBestMentorForBeginner(): string {
    const assessment = this.currentAssessment.value
    if (!assessment) return 'aura'

    // Choose most supportive character based on relationships
    const strongest = assessment.characterRelationships.strongest
    const supportiveCharacters = ['aura', 'unity', 'lexia']
    
    return supportiveCharacters.includes(strongest) ? strongest : 'aura'
  }

  private getBestMentorForIntermediate(): string {
    const assessment = this.currentAssessment.value
    if (!assessment) return 'professor_phonix'

    const strongest = assessment.characterRelationships.strongest
    const mentorCharacters = ['professor_phonix', 'grammar_guardian', 'unity']
    
    return mentorCharacters.includes(strongest) ? strongest : 'professor_phonix'
  }

  private getBestMentorForAdvanced(): string {
    const assessment = this.currentAssessment.value
    if (!assessment) return 'grammar_guardian'

    const strongest = assessment.characterRelationships.strongest
    const challengingCharacters = ['grammar_guardian', 'speed_racer', 'the_translator']
    
    return challengingCharacters.includes(strongest) ? strongest : 'grammar_guardian'
  }

  private createBeginnerScenario(): VRIntroScenario {
    return {
      id: 'gentle_first_vr',
      title: 'はじめてのVR体験',
      background: '/images/vr/gentle_garden.jpg',
      duration: 45000,
      characters: [
        {
          id: this.getBestMentorForBeginner(),
          role: 'mentor',
          emotion: 'gentle',
          supportType: 'constant_encouragement'
        },
        {
          id: 'aura',
          role: 'guide',
          emotion: 'patient',
          supportType: 'technical_assistance'
        }
      ],
      dialogue: [
        {
          speaker: this.getBestMentorForBeginner(),
          text: 'VRの世界へようこそ。ゆっくりでいいですよ',
          emotion: 'welcoming',
          purpose: 'reassurance',
          tone: 'gentle'
        },
        {
          speaker: 'aura',
          text: 'いつでも休憩できます。無理をしないでくださいね',
          emotion: 'caring',
          purpose: 'reassurance',
          tone: 'gentle'
        }
      ],
      supportLevel: 'high',
      expectations: [
        '完璧である必要はありません',
        'いつでも休憩可能',
        '一つずつゆっくり学習',
        '質問はいつでもどうぞ'
      ]
    }
  }

  private createIntermediateScenario(): VRIntroScenario {
    return {
      id: 'progress_celebration_vr',
      title: '成長の実感',
      background: '/images/vr/achievement_hall.jpg',
      duration: 35000,
      characters: [
        {
          id: this.getBestMentorForIntermediate(),
          role: 'mentor',
          emotion: 'proud',
          supportType: 'skill_recognition'
        }
      ],
      dialogue: [
        {
          speaker: this.getBestMentorForIntermediate(),
          text: 'あなたの成長ぶりは素晴らしいです！VRでさらに伸びますね',
          emotion: 'encouraging',
          purpose: 'encouragement',
          tone: 'confident'
        }
      ],
      supportLevel: 'medium',
      expectations: [
        '今のスキルを活かしましょう',
        '新しいチャレンジも楽しめます',
        '自分のペースで進歩',
        '仲間と一緒に成長'
      ]
    }
  }

  private createAdvancedScenario(): VRIntroScenario {
    return {
      id: 'adventure_challenge_vr',
      title: '真の冒険の始まり',
      background: '/images/vr/adventure_portal.jpg',
      duration: 30000,
      characters: [
        {
          id: this.getBestMentorForAdvanced(),
          role: 'companion',
          emotion: 'excited',
          supportType: 'challenge_partnership'
        }
      ],
      dialogue: [
        {
          speaker: this.getBestMentorForAdvanced(),
          text: 'ついに本格的な冒険の時が来ましたね！一緒に新しい領域を探検しましょう',
          emotion: 'adventurous',
          purpose: 'challenge',
          tone: 'exciting'
        }
      ],
      supportLevel: 'low',
      expectations: [
        '高度な機能を活用',
        'クリエイティブな学習',
        '他の学習者の手本に',
        'VRの可能性を最大限活用'
      ]
    }
  }

  private createMasterScenario(): VRIntroScenario {
    return {
      id: 'master_collaboration_vr',
      title: '伝説の探検家として',
      background: '/images/vr/master_dimension.jpg',
      duration: 25000,
      characters: [
        {
          id: 'the_translator',
          role: 'companion',
          emotion: 'respectful',
          supportType: 'peer_collaboration'
        }
      ],
      dialogue: [
        {
          speaker: 'the_translator',
          text: '言語マスターとして、あなたとVRの新次元を創造できることを光栄に思います',
          emotion: 'reverent',
          purpose: 'challenge',
          tone: 'inspiring'
        }
      ],
      supportLevel: 'low',
      expectations: [
        '創造的リーダーシップ',
        '他の学習者への指導',
        '新しい学習方法の開発',
        'VRの可能性の拡張'
      ]
    }
  }

  private generateEncouragementMessages(): string[] {
    const level = this.readinessLevel.value
    const messages = {
      [VRReadinessLevel.BEGINNER]: [
        'あなたのペースで大丈夫です',
        '学習の喜びを一緒に見つけましょう',
        '小さな成功も大切な一歩です',
        '完璧を目指さず、楽しさを重視しましょう'
      ],
      [VRReadinessLevel.INTERMEDIATE]: [
        'あなたの成長が素晴らしいです',
        'VRで新しい可能性を発見しましょう',
        '今までの努力が実を結んでいます',
        'さらなる高みを目指しましょう'
      ],
      [VRReadinessLevel.ADVANCED]: [
        'あなたの実力は本物です',
        'VRで真の冒険が始まります',
        '新しいチャレンジも楽しめるでしょう',
        '他の学習者の良いお手本になってください'
      ],
      [VRReadinessLevel.MASTER]: [
        'あなたは既に言語の達人です',
        'VRで伝説的な体験を創造しましょう',
        '新しい学習の地平を開いてください',
        'あなたの知識で他の人を導いてください'
      ]
    }
    return messages[level]
  }

  private generateAnxietyReliefContent(): any {
    const anxieties = this.identifyVRAnxieties()
    const strategies = this.generateSupportStrategies()
    
    return {
      identifiedConcerns: anxieties,
      supportStrategies: strategies,
      reassuranceMessages: this.getReassuranceForAnxieties(anxieties),
      comfortFeatures: this.getComfortFeatures()
    }
  }

  private generateExcitementContent(): string[] {
    const level = this.readinessLevel.value
    const baseExcitement = [
      '3D空間での言葉との出会い',
      'キャラクターとのリアルな交流',
      '世界中を旅しながらの学習',
      '想像を超えた学習体験'
    ]

    const levelSpecific = {
      [VRReadinessLevel.BEGINNER]: [
        '優しい環境での安心学習',
        '一歩ずつの成長実感'
      ],
      [VRReadinessLevel.INTERMEDIATE]: [
        '新しいスキルの発見',
        '仲間との協力学習'
      ],
      [VRReadinessLevel.ADVANCED]: [
        '高度な言語チャレンジ',
        'クリエイティブな表現活動'
      ],
      [VRReadinessLevel.MASTER]: [
        '創造的学習方法の開発',
        '他の学習者への指導機会'
      ]
    }

    return [...baseExcitement, ...levelSpecific[level]]
  }

  private getReassuranceForAnxieties(anxieties: string[]): Record<string, string> {
    const reassurance: Record<string, string> = {}
    
    anxieties.forEach(anxiety => {
      switch (anxiety) {
        case 'general_vr_anxiety':
          reassurance[anxiety] = '最新技術で快適性を重視。いつでも2Dに戻れます'
          break
        case 'performance_anxiety':
          reassurance[anxiety] = '評価されることはありません。学ぶ楽しさが一番大切です'
          break
        case 'social_interaction_concern':
          reassurance[anxiety] = 'まずは親しいキャラクターとの一対一から始めましょう'
          break
        case 'technology_intimidation':
          reassurance[anxiety] = 'シンプルな操作から始めて、段階的に慣れていきます'
          break
      }
    })

    return reassurance
  }

  private getComfortFeatures(): string[] {
    return [
      'いつでも休憩可能',
      '2D世界への即座復帰',
      '音量・明度調整',
      '快適性優先設計',
      '24時間サポート対応'
    ]
  }

  private createDefaultAssessment(): PlayerAssessment {
    return {
      languageMastery: {
        overall: 30,
        pronunciation: 25,
        vocabulary: 35,
        grammar: 30,
        typing: 25,
        cooperation: 20
      },
      characterRelationships: {
        average: 40,
        strongest: 'aura',
        weakest: 'the_translator',
        totalFriends: 2
      },
      storyProgression: {
        chaptersCompleted: 2,
        totalPlayTime: 1800000, // 30 minutes
        achievementsUnlocked: 3
      },
      specialAchievements: {
        perfectScores: 1,
        hiddenDiscoveries: 0,
        friendshipMoments: 2,
        creativeSolutions: 1
      },
      emotionalReadiness: {
        confidenceLevel: 45,
        anxietyLevel: 60,
        excitementLevel: 70,
        curiosityLevel: 80
      }
    }
  }

  private initializeReadinessSystem(): void {
    // Initialize with current player data
    this.assessPlayerReadiness()
  }

  // Public getters
  public get currentReadinessLevel(): VRReadinessLevel {
    return this.readinessLevel.value
  }

  public get currentAssessmentData(): PlayerAssessment | null {
    return this.currentAssessment.value
  }

  public get storyVariant(): VRStoryVariant | null {
    return this.customStoryVariant.value
  }

  public get readinessScore(): number {
    const assessment = this.currentAssessment.value
    if (!assessment) return 0
    
    return Math.round(
      (assessment.languageMastery.overall * 0.4) +
      (assessment.characterRelationships.average * 0.25) +
      (Math.min(100, (assessment.storyProgression.chaptersCompleted / 7) * 100) * 0.2) +
      (Math.min(100, assessment.specialAchievements.perfectScores * 10) * 0.15)
    )
  }
}

// Export singleton instance
export const vrReadinessSystem = new VRReadinessSystem()
export default vrReadinessSystem