import { ref, computed } from 'vue'
import { vrReadinessSystem } from './VRReadinessSystem'
import { characterDatabase } from '../characters/CharacterDatabase'
import { gameStoryBridge } from '../integration/GameStoryBridge'
import type { VRReadinessLevel } from './VRReadinessSystem'

// VR Experience data types
export interface VRExperienceData {
  sessionId: string
  startTime: Date
  endTime: Date
  duration: number
  activitiesCompleted: VRActivity[]
  skillsLearned: VRSkill[]
  emotionalJourney: EmotionalCheckpoint[]
  interactionData: VRInteraction[]
  achievements: VRAchievement[]
  challengesFaced: VRChallenge[]
  comfortLevel: ComfortMetrics
  learningEffectiveness: EffectivenessMetrics
}

export interface VRActivity {
  id: string
  type: 'conversation' | 'exploration' | 'puzzle' | 'creative' | 'collaborative'
  name: string
  completionStatus: 'completed' | 'partial' | 'abandoned'
  timeSpent: number
  difficultyRating: number
  enjoymentRating: number
  learningValue: number
}

export interface VRSkill {
  category: 'pronunciation' | 'vocabulary' | 'grammar' | 'conversation' | 'cultural'
  skillName: string
  improvementLevel: number
  practiceTime: number
  vrSpecificBenefit: string
}

export interface EmotionalCheckpoint {
  timestamp: Date
  emotion: 'excited' | 'confident' | 'curious' | 'overwhelmed' | 'proud' | 'anxious' | 'joyful'
  intensity: number
  trigger: string
  context: string
}

export interface VRInteraction {
  characterId: string
  interactionType: '3d_conversation' | 'gesture_communication' | 'spatial_cooperation' | 'immersive_teaching'
  quality: 'natural' | 'engaging' | 'meaningful' | 'transformative'
  emotionalImpact: number
  learningOutcome: string
}

export interface VRAchievement {
  id: string
  name: string
  description: string
  category: 'technical' | 'social' | 'learning' | 'creative' | 'breakthrough'
  vrExclusive: boolean
  impact: 'minor' | 'significant' | 'major' | 'life_changing'
}

export interface VRChallenge {
  type: 'technical' | 'social' | 'cognitive' | 'emotional'
  description: string
  resolution: 'resolved' | 'adapted' | 'ongoing' | 'requires_support'
  supportProvided: string
  learningFromChallenge: string
}

export interface ComfortMetrics {
  motionComfort: number
  socialComfort: number
  technicalComfort: number
  learningComfort: number
  overallSatisfaction: number
}

export interface EffectivenessMetrics {
  learningSpeed: number
  retentionRate: number
  engagementLevel: number
  transferabilityTo2D: number
  motivationIncrease: number
}

// Feedback story types
export interface VRFeedbackStory {
  id: string
  title: string
  type: 'celebration' | 'reflection' | 'integration' | 'planning'
  characters: FeedbackCharacter[]
  scenes: FeedbackScene[]
  personalizedElements: PersonalizedElement[]
  future2DIntegration: Integration2D[]
}

export interface FeedbackCharacter {
  id: string
  role: 'celebrator' | 'reflector' | 'integrator' | 'motivator'
  emotion: string
  personalizedMessage: string
  experienceAcknowledgment: string
}

export interface FeedbackScene {
  id: string
  title: string
  setting: '2d_home' | 'vr_reflection_space' | 'dimensional_bridge' | 'future_preview'
  duration: number
  dialogue: FeedbackDialogue[]
  visualElements: FeedbackVisual[]
  emotionalTone: string
}

export interface FeedbackDialogue {
  speaker: string
  text: string
  emotion: string
  personalizationTags: string[]
  references: {
    vrExperience?: string
    specificAchievement?: string
    challengeOvercome?: string
    skillDemonstrated?: string
  }
}

export interface FeedbackVisual {
  type: 'memory_replay' | 'skill_visualization' | 'progress_comparison' | 'future_preview'
  description: string
  vrDataReference: string
  emotional_impact: string
}

export interface PersonalizedElement {
  category: 'achievement_highlight' | 'growth_recognition' | 'challenge_acknowledgment' | 'future_goal'
  content: string
  vrSpecific: boolean
  encouragementLevel: 'gentle' | 'enthusiastic' | 'inspiring' | 'challenging'
}

export interface Integration2D {
  skillName: string
  vrOrigin: string
  twoDApplication: string
  practiceRecommendation: string
  characterSupport: string
}

/**
 * VR Feedback System
 * Processes VR experiences and creates meaningful feedback stories for 2D integration
 */
export class VRFeedbackSystem {
  private experienceHistory = ref<VRExperienceData[]>([])
  private currentFeedbackStory = ref<VRFeedbackStory | null>(null)
  private integratedSkills = ref<VRSkill[]>([])
  private ongoingChallenges = ref<VRChallenge[]>([])

  constructor() {
    this.initializeFeedbackSystem()
  }

  /**
   * Process VR experience and generate feedback story
   */
  public async processVRExperience(experienceData: VRExperienceData): Promise<VRFeedbackStory> {
    // Store experience data
    this.experienceHistory.value.push(experienceData)
    
    // Analyze the experience
    const analysis = this.analyzeVRExperience(experienceData)
    
    // Generate personalized feedback story
    const feedbackStory = this.createFeedbackStory(experienceData, analysis)
    
    // Update 2D world with VR learnings
    await this.integrate2DLearnings(experienceData)
    
    // Set current feedback story
    this.currentFeedbackStory.value = feedbackStory
    
    return feedbackStory
  }

  /**
   * Analyze VR experience for feedback generation
   */
  private analyzeVRExperience(experience: VRExperienceData): any {
    const analysis = {
      overallSuccess: this.calculateOverallSuccess(experience),
      keyAchievements: this.identifyKeyAchievements(experience),
      significantMoments: this.findSignificantMoments(experience),
      growthAreas: this.identifyGrowthAreas(experience),
      emotionalHighlights: this.analyzeEmotionalJourney(experience),
      skillBreakthroughs: this.identifySkillBreakthroughs(experience),
      socialConnections: this.analyzeSocialInteractions(experience),
      comfortProgression: this.analyzeComfortProgression(experience),
      vrUniqueValue: this.assessVRUniqueValue(experience)
    }

    return analysis
  }

  /**
   * Create personalized feedback story
   */
  private createFeedbackStory(experience: VRExperienceData, analysis: any): VRFeedbackStory {
    const readinessLevel = vrReadinessSystem.currentReadinessLevel
    const playerName = this.getPlayerName()

    const story: VRFeedbackStory = {
      id: `vr_feedback_${experience.sessionId}`,
      title: this.generateFeedbackTitle(analysis),
      type: this.determineFeedbackType(analysis),
      characters: this.selectFeedbackCharacters(experience, analysis),
      scenes: this.createFeedbackScenes(experience, analysis),
      personalizedElements: this.generatePersonalizedElements(experience, analysis),
      future2DIntegration: this.planFuture2DIntegration(experience)
    }

    return story
  }

  /**
   * Create feedback scenes based on experience
   */
  private createFeedbackScenes(experience: VRExperienceData, analysis: any): FeedbackScene[] {
    const scenes: FeedbackScene[] = []

    // Scene 1: Welcome back from VR
    scenes.push({
      id: 'vr_return_welcome',
      title: 'VR世界からのお帰りなさい',
      setting: '2d_home',
      duration: 15000,
      dialogue: this.createWelcomeBackDialogue(experience, analysis),
      visualElements: [
        {
          type: 'memory_replay',
          description: 'VR体験のハイライト映像',
          vrDataReference: experience.sessionId,
          emotional_impact: 'nostalgic_joy'
        }
      ],
      emotionalTone: 'warm_celebration'
    })

    // Scene 2: Experience sharing with characters
    scenes.push({
      id: 'experience_sharing',
      title: '体験の共有',
      setting: 'dimensional_bridge',
      duration: 20000,
      dialogue: this.createExperienceSharingDialogue(experience, analysis),
      visualElements: [
        {
          type: 'skill_visualization',
          description: '習得したスキルの可視化',
          vrDataReference: 'skills_learned',
          emotional_impact: 'proud_accomplishment'
        }
      ],
      emotionalTone: 'engaging_discussion'
    })

    // Scene 3: Integration planning
    scenes.push({
      id: 'integration_planning', 
      title: '2Dでの活用計画',
      setting: 'future_preview',
      duration: 18000,
      dialogue: this.createIntegrationPlanningDialogue(experience, analysis),
      visualElements: [
        {
          type: 'future_preview',
          description: '2Dでの活用方法プレビュー',
          vrDataReference: 'future_applications',
          emotional_impact: 'excited_anticipation'
        }
      ],
      emotionalTone: 'forward_looking_optimism'
    })

    return scenes
  }

  /**
   * Generate welcome back dialogue
   */
  private createWelcomeBackDialogue(experience: VRExperienceData, analysis: any): FeedbackDialogue[] {
    const dialogue: FeedbackDialogue[] = []
    const topAchievement = analysis.keyAchievements[0]
    const significantMoment = analysis.significantMoments[0]

    // Character selection based on strongest VR interaction
    const strongestInteraction = experience.interactionData
      .sort((a, b) => b.emotionalImpact - a.emotionalImpact)[0]
    const welcomeCharacter = strongestInteraction?.characterId || 'aura'

    dialogue.push({
      speaker: welcomeCharacter,
      text: `お帰りなさい！VRでの冒険はいかがでしたか？`,
      emotion: 'excited_welcome',
      personalizationTags: ['vr_return', 'experience_inquiry'],
      references: {}
    })

    dialogue.push({
      speaker: 'captain_nova',
      text: `すごかった！特に${topAchievement?.name || 'すべて'}が印象的だった`,
      emotion: 'enthusiastic_sharing',
      personalizationTags: ['experience_highlight'],
      references: {
        specificAchievement: topAchievement?.id
      }
    })

    if (significantMoment) {
      dialogue.push({
        speaker: welcomeCharacter,
        text: `${significantMoment.description}の瞬間は、私も感動しました`,
        emotion: 'moved',
        personalizationTags: ['shared_emotion', 'moment_acknowledgment'],
        references: {
          vrExperience: significantMoment.id
        }
      })
    }

    return dialogue
  }

  /**
   * Create experience sharing dialogue
   */
  private createExperienceSharingDialogue(experience: VRExperienceData, analysis: any): FeedbackDialogue[] {
    const dialogue: FeedbackDialogue[] = []
    const skillBreakthrough = analysis.skillBreakthroughs[0]
    const emotionalHighlight = analysis.emotionalHighlights[0]

    // Add skill-specific sharing
    if (skillBreakthrough) {
      const skillCharacter = this.getSkillExpertCharacter(skillBreakthrough.category)
      dialogue.push({
        speaker: skillCharacter,
        text: `${skillBreakthrough.skillName}での成長が素晴らしいですね！VRならではの体験でしたね`,
        emotion: 'professional_pride',
        personalizationTags: ['skill_recognition', 'vr_specific_growth'],
        references: {
          skillDemonstrated: skillBreakthrough.skillName
        }
      })
    }

    // Add emotional journey acknowledgment
    if (emotionalHighlight) {
      dialogue.push({
        speaker: 'unity',
        text: `あなたの${emotionalHighlight.emotion}な気持ちが、素晴らしい学習体験を生み出しましたね`,
        emotion: 'empathetic_understanding',
        personalizationTags: ['emotional_validation', 'learning_connection'],
        references: {
          vrExperience: emotionalHighlight.trigger
        }
      })
    }

    return dialogue
  }

  /**
   * Create integration planning dialogue
   */
  private createIntegrationPlanningDialogue(experience: VRExperienceData, analysis: any): FeedbackDialogue[] {
    const dialogue: FeedbackDialogue[] = []
    const integrableSkills = experience.skillsLearned.filter(skill => skill.vrSpecificBenefit)

    dialogue.push({
      speaker: 'aura',
      text: `VRで学んだことを2Dでも活用する方法を考えましょう`,
      emotion: 'analytical_planning',
      personalizationTags: ['integration_focus', 'practical_application'],
      references: {}
    })

    integrableSkills.forEach((skill, index) => {
      if (index < 2) { // Limit to top 2 skills
        const application = this.suggest2DApplication(skill)
        dialogue.push({
          speaker: 'professor_phonix',
          text: `${skill.skillName}は、2Dでは${application}として活用できますな`,
          emotion: 'wise_guidance',
          personalizationTags: ['skill_transfer', 'practical_suggestion'],
          references: {
            skillDemonstrated: skill.skillName
          }
        })
      }
    })

    return dialogue
  }

  /**
   * Generate personalized elements
   */
  private generatePersonalizedElements(experience: VRExperienceData, analysis: any): PersonalizedElement[] {
    const elements: PersonalizedElement[] = []

    // Achievement highlights
    analysis.keyAchievements.forEach((achievement: VRAchievement) => {
      elements.push({
        category: 'achievement_highlight',
        content: `VRで${achievement.name}を達成！これは${achievement.impact}な成果です`,
        vrSpecific: achievement.vrExclusive,
        encouragementLevel: this.getEncouragementLevel(achievement.impact)
      })
    })

    // Growth recognition
    if (analysis.overallSuccess > 0.7) {
      elements.push({
        category: 'growth_recognition',
        content: `VR環境での適応力が素晴らしく、学習効果も${Math.round(experience.learningEffectiveness.learningSpeed * 100)}%向上しました`,
        vrSpecific: true,
        encouragementLevel: 'enthusiastic'
      })
    }

    // Challenge acknowledgment
    experience.challengesFaced.forEach(challenge => {
      if (challenge.resolution === 'resolved') {
        elements.push({
          category: 'challenge_acknowledgment',
          content: `${challenge.description}の課題を見事に克服されました`,
          vrSpecific: true,
          encouragementLevel: 'inspiring'
        })
      }
    })

    return elements
  }

  /**
   * Plan future 2D integration
   */
  private planFuture2DIntegration(experience: VRExperienceData): Integration2D[] {
    const integrations: Integration2D[] = []

    experience.skillsLearned.forEach(skill => {
      const integration: Integration2D = {
        skillName: skill.skillName,
        vrOrigin: skill.vrSpecificBenefit,
        twoDApplication: this.suggest2DApplication(skill),
        practiceRecommendation: this.generatePracticeRecommendation(skill),
        characterSupport: this.assignCharacterSupport(skill.category)
      }
      integrations.push(integration)
    })

    return integrations
  }

  /**
   * Actually integrate VR learnings into 2D world
   */
  private async integrate2DLearnings(experience: VRExperienceData): Promise<void> {
    // Update character relationships based on VR interactions
    experience.interactionData.forEach(interaction => {
      if (interaction.quality === 'transformative' || interaction.quality === 'meaningful') {
        this.updateCharacterRelationship(interaction.characterId, interaction.emotionalImpact)
      }
    })

    // Add new skills to 2D progression
    experience.skillsLearned.forEach(skill => {
      gameStoryBridge.updateProgress(skill.category as any, {
        score: skill.improvementLevel * 100,
        accuracy: 0.9,
        timeSpent: skill.practiceTime,
        completed: true
      })
    })

    // Store integrated skills for future reference
    this.integratedSkills.value.push(...experience.skillsLearned)

    // Create memory markers for VR experiences
    this.createVRMemoryMarkers(experience)
  }

  /**
   * Create dialogue for specific characters sharing VR experience
   */
  public generateCharacterVRReaction(characterId: string, experience: VRExperienceData): string[] {
    const character = characterDatabase.getCharacter(characterId)
    if (!character) return []

    const relevantInteraction = experience.interactionData.find(i => i.characterId === characterId)
    const reactions: string[] = []

    // Character-specific reactions based on their personality
    switch (characterId) {
      case 'professor_phonix':
        reactions.push('VRでの音響体験はどうじゃったかな？立体音響は格別じゃろう')
        if (relevantInteraction?.quality === 'transformative') {
          reactions.push('わしとの3D会話が君を変えたのじゃな。感慨深いのう')
        }
        break

      case 'lexia':
        reactions.push('VRで新しい言葉に触れられた？きっと飛び出してきそうだったでしょ！')
        if (relevantInteraction) {
          reactions.push('3次元での私との会話、楽しかった？今度はもっと面白い言葉教えるね！')
        }
        break

      case 'grammar_guardian':
        reactions.push('VRでは文法構造が立体的に見えたでしょう。美しいでしょう？')
        if (relevantInteraction?.quality === 'meaningful') {
          reactions.push('君が構造の美しさを理解してくれて...私は嬉しい')
        }
        break

      case 'aura':
        reactions.push('データ分析：VR体験による学習効率向上率85%...素晴らしい結果です')
        if (experience.comfortLevel.technicalComfort > 80) {
          reactions.push('技術的適応力も優秀でした。私のサポートシステム設計の甲斐がありました')
        }
        break

      case 'unity':
        reactions.push('VRでの調和...新しい次元の美しさを感じられましたね')
        if (experience.emotionalJourney.some(e => e.emotion === 'joyful')) {
          reactions.push('あなたの喜びが、VR空間全体を輝かせました')
        }
        break
    }

    return reactions
  }

  /**
   * Generate goals based on VR experience
   */
  public generateFutureGoals(experience: VRExperienceData): string[] {
    const goals: string[] = []
    const readinessLevel = vrReadinessSystem.currentReadinessLevel

    // Base goals
    goals.push('VRで学んだスキルの2D環境での活用')
    goals.push('次回VR体験での更なる挑戦')

    // Readiness-level specific goals
    switch (readinessLevel) {
      case 'beginner':
        goals.push('VR環境での快適性向上')
        goals.push('基本操作の習熟')
        break
      case 'intermediate':  
        goals.push('より複雑なVR学習活動への参加')
        goals.push('他の学習者との協力体験')
        break
      case 'advanced':
        goals.push('VR環境でのクリエイティブ活動')
        goals.push('新しい学習方法の開発参加')
        break
      case 'master':
        goals.push('VR学習環境の改善提案')
        goals.push('他の学習者への指導とサポート')
        break
    }

    // Experience-specific goals
    if (experience.comfortLevel.overallSatisfaction > 85) {
      goals.push('より長時間のVR学習セッション')
    }

    if (experience.achievements.some(a => a.category === 'social')) {
      goals.push('VRでの多人数協力学習')
    }

    return goals
  }

  // Helper methods
  private calculateOverallSuccess(experience: VRExperienceData): number {
    const factors = [
      experience.comfortLevel.overallSatisfaction / 100,
      experience.learningEffectiveness.engagementLevel / 100,
      experience.activitiesCompleted.filter(a => a.completionStatus === 'completed').length / experience.activitiesCompleted.length,
      experience.achievements.filter(a => a.impact !== 'minor').length / Math.max(1, experience.achievements.length)
    ]

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length
  }

  private identifyKeyAchievements(experience: VRExperienceData): VRAchievement[] {
    return experience.achievements
      .filter(a => a.impact === 'major' || a.impact === 'life_changing' || a.vrExclusive)
      .sort((a, b) => this.getImpactWeight(b.impact) - this.getImpactWeight(a.impact))
      .slice(0, 3)
  }

  private findSignificantMoments(experience: VRExperienceData): any[] {
    return experience.emotionalJourney
      .filter(e => e.intensity > 0.8)
      .map(e => ({
        id: `moment_${e.timestamp.getTime()}`,
        description: `${e.emotion}を感じた${e.context}`,
        trigger: e.trigger,
        impact: e.intensity
      }))
  }

  private identifyGrowthAreas(experience: VRExperienceData): string[] {
    const areas: string[] = []
    
    if (experience.comfortLevel.technicalComfort < 70) {
      areas.push('VR技術操作の習熟')
    }
    
    if (experience.comfortLevel.socialComfort < 60) {
      areas.push('VR環境での社会的交流')
    }

    const incompleteActivities = experience.activitiesCompleted.filter(a => a.completionStatus !== 'completed')
    if (incompleteActivities.length > 0) {
      areas.push('活動完遂力の向上')
    }

    return areas
  }

  private analyzeEmotionalJourney(experience: VRExperienceData): any[] {
    return experience.emotionalJourney
      .filter(e => ['excited', 'proud', 'joyful'].includes(e.emotion) && e.intensity > 0.7)
      .sort((a, b) => b.intensity - a.intensity)
  }

  private identifySkillBreakthroughs(experience: VRExperienceData): VRSkill[] {
    return experience.skillsLearned
      .filter(skill => skill.improvementLevel > 0.8)
      .sort((a, b) => b.improvementLevel - a.improvementLevel)
  }

  private analyzeSocialInteractions(experience: VRExperienceData): any {
    const interactions = experience.interactionData
    const meaningfulInteractions = interactions.filter(i => 
      i.quality === 'meaningful' || i.quality === 'transformative'
    )

    return {
      totalInteractions: interactions.length,
      meaningfulCount: meaningfulInteractions.length,
      averageImpact: interactions.reduce((sum, i) => sum + i.emotionalImpact, 0) / interactions.length,
      strongestConnection: interactions.sort((a, b) => b.emotionalImpact - a.emotionalImpact)[0]
    }
  }

  private analyzeComfortProgression(experience: VRExperienceData): any {
    // This would track comfort over time during the session
    return {
      initialComfort: 60, // Would be calculated from early session data
      finalComfort: experience.comfortLevel.overallSatisfaction,
      improvement: experience.comfortLevel.overallSatisfaction - 60,
      adaptationRate: 'fast' // Would be calculated from progression curve
    }
  }

  private assessVRUniqueValue(experience: VRExperienceData): any {
    const vrExclusiveAchievements = experience.achievements.filter(a => a.vrExclusive)
    const vrSpecificSkills = experience.skillsLearned.filter(s => s.vrSpecificBenefit)
    
    return {
      exclusiveAchievements: vrExclusiveAchievements.length,
      vrSpecificLearning: vrSpecificSkills.length,
      immersionBenefit: experience.learningEffectiveness.engagementLevel - 70, // Compared to 2D baseline
      spatialLearningAdvantage: vrSpecificSkills.reduce((sum, s) => sum + s.improvementLevel, 0)
    }
  }

  private generateFeedbackTitle(analysis: any): string {
    if (analysis.overallSuccess > 0.9) {
      return 'VRでの素晴らしい成功体験'
    } else if (analysis.overallSuccess > 0.7) {
      return 'VRでの充実した学習体験'
    } else if (analysis.overallSuccess > 0.5) {
      return 'VRでの貴重な体験'
    } else {
      return 'VRでの新しい発見'
    }
  }

  private determineFeedbackType(analysis: any): 'celebration' | 'reflection' | 'integration' | 'planning' {
    if (analysis.keyAchievements.length > 2) return 'celebration'
    if (analysis.emotionalHighlights.length > 3) return 'reflection'
    if (analysis.skillBreakthroughs.length > 1) return 'integration'
    return 'planning'
  }

  private selectFeedbackCharacters(experience: VRExperienceData, analysis: any): FeedbackCharacter[] {
    const characters: FeedbackCharacter[] = []

    // Always include the character with strongest VR interaction
    const strongestInteraction = analysis.socialConnections.strongestConnection
    if (strongestInteraction) {
      characters.push({
        id: strongestInteraction.characterId,
        role: 'celebrator',
        emotion: 'proud',
        personalizedMessage: `VRでの私たちの交流は特別でした`,
        experienceAcknowledgment: strongestInteraction.learningOutcome
      })
    }

    // Add skill-specific character
    const topSkill = analysis.skillBreakthroughs[0]
    if (topSkill) {
      const skillExpert = this.getSkillExpertCharacter(topSkill.category)
      characters.push({
        id: skillExpert,
        role: 'integrator',
        emotion: 'professional_pride',
        personalizedMessage: `あなたの${topSkill.skillName}の成長が素晴らしい`,
        experienceAcknowledgment: topSkill.vrSpecificBenefit
      })
    }

    // Add supportive character for comfort
    characters.push({
      id: 'aura',
      role: 'reflector',
      emotion: 'analytical_care',
      personalizedMessage: 'データから見るあなたの成長は驚異的です',
      experienceAcknowledgment: `快適度${experience.comfortLevel.overallSatisfaction}%達成`
    })

    return characters
  }

  private getSkillExpertCharacter(skillCategory: string): string {
    const expertMap: Record<string, string> = {
      'pronunciation': 'professor_phonix',
      'vocabulary': 'lexia',
      'grammar': 'grammar_guardian',
      'conversation': 'unity',
      'cultural': 'unity'
    }
    return expertMap[skillCategory] || 'aura'
  }

  private suggest2DApplication(skill: VRSkill): string {
    const applicationMap: Record<string, string> = {
      'pronunciation': '音読練習での立体的イメージ再現',
      'vocabulary': '単語カードでの3Dイメージ想起',
      'grammar': '文構造の立体的理解応用',
      'conversation': '会話練習での空間的コンテキスト活用',
      'cultural': '文化的背景の多角的理解'
    }
    return applicationMap[skill.category] || '総合的な言語理解の向上'
  }

  private generatePracticeRecommendation(skill: VRSkill): string {
    return `毎日${Math.ceil(skill.practiceTime / 60000)}分間、${skill.vrSpecificBenefit}を意識した練習`
  }

  private assignCharacterSupport(skillCategory: string): string {
    return this.getSkillExpertCharacter(skillCategory)
  }

  private updateCharacterRelationship(characterId: string, impact: number): void {
    // This would integrate with the character relationship system
    const currentRelationship = gameStoryBridge.getCharacterRelationship?.(characterId) || 50
    const newRelationship = Math.min(100, currentRelationship + (impact * 10))
    // Update relationship in the system
  }

  private createVRMemoryMarkers(experience: VRExperienceData): void {
    // Create special memory items that can be accessed in 2D
    const memories = experience.emotionalJourney
      .filter(e => e.intensity > 0.8)
      .map(e => ({
        id: `vr_memory_${e.timestamp.getTime()}`,
        title: `VRでの${e.emotion}な瞬間`,
        description: e.context,
        trigger: e.trigger,
        accessibleIn2D: true
      }))
    
    // Store memories for later access
    localStorage.setItem('language_galaxy_vr_memories', JSON.stringify(memories))
  }

  private getImpactWeight(impact: string): number {
    const weights = {
      'minor': 1,
      'significant': 2,
      'major': 3,
      'life_changing': 4
    }
    return weights[impact as keyof typeof weights] || 1
  }

  private getEncouragementLevel(impact: string): 'gentle' | 'enthusiastic' | 'inspiring' | 'challenging' {
    const levelMap = {
      'minor': 'gentle' as const,
      'significant': 'enthusiastic' as const,
      'major': 'inspiring' as const,
      'life_changing': 'challenging' as const
    }
    return levelMap[impact as keyof typeof levelMap] || 'gentle'
  }

  private getPlayerName(): string {
    return 'Captain Nova' // This would be retrieved from player data
  }

  private initializeFeedbackSystem(): void {
    // Load previous experience history
    const savedHistory = localStorage.getItem('language_galaxy_vr_history')
    if (savedHistory) {
      this.experienceHistory.value = JSON.parse(savedHistory).map((exp: any) => ({
        ...exp,
        startTime: new Date(exp.startTime),
        endTime: new Date(exp.endTime),
        emotionalJourney: exp.emotionalJourney.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }))
      }))
    }
  }

  // Public getters
  public get experienceHistoryData(): VRExperienceData[] {
    return this.experienceHistory.value
  }

  public get latestFeedbackStory(): VRFeedbackStory | null {
    return this.currentFeedbackStory.value
  }

  public get totalVRTime(): number {
    return this.experienceHistory.value.reduce((total, exp) => total + exp.duration, 0)
  }

  public get vrSkillsLearned(): VRSkill[] {
    return this.integratedSkills.value
  }

  public getVRMemories(): any[] {
    const saved = localStorage.getItem('language_galaxy_vr_memories')
    return saved ? JSON.parse(saved) : []
  }
}

// Export singleton instance
export const vrFeedbackSystem = new VRFeedbackSystem()
export default vrFeedbackSystem