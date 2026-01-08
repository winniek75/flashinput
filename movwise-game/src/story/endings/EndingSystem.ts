import { ref, computed } from 'vue'
import { gameStoryBridge } from '../integration/GameStoryBridge'
import { sideStoryDatabase } from '../sidestories/SideStoryDatabase'
import type { Character } from '../characters/CharacterDatabase'

// Ending types
export enum EndingType {
  TRUE_ENDING = 'true_ending',
  GOOD_ENDING = 'good_ending',
  NORMAL_ENDING = 'normal_ending',
  SPECIAL_ENDING = 'special_ending',
  SECRET_ENDING = 'secret_ending'
}

// Ending conditions
export interface EndingCondition {
  type: 'score' | 'relationship' | 'achievement' | 'choice' | 'hidden' | 'time'
  target?: string
  operator: '>' | '<' | '==' | '>=' | '<=' | 'includes' | 'excludes'
  value: number | string | boolean
  weight?: number
}

// Important choices tracked
export interface ImportantChoice {
  id: string
  chapterId: string
  choice: string
  consequence: string
  timestamp: Date
}

// Ending data structure
export interface EndingData {
  id: string
  type: EndingType
  title: string
  subtitle: string
  description: string
  conditions: EndingCondition[]
  priority: number // Higher priority endings are checked first
  unlocked: boolean
  scriptPath: string
  specialRewards: EndingReward[]
  epilogueCharacters: string[]
  bgmPath: string
  duration: number // minutes
}

// Ending rewards
export interface EndingReward {
  id: string
  type: 'newgame_plus' | 'hidden_story' | 'vr_academy' | 'special_mode' | 'artwork' | 'soundtrack'
  name: string
  description: string
  unlockCondition?: string
}

// Player statistics for ending
export interface PlayerEndingStats {
  totalPlayTime: number
  overallMastery: number
  planetMasteries: Map<string, number>
  characterRelationships: Map<string, number>
  importantChoices: ImportantChoice[]
  achievementsUnlocked: string[]
  hiddenStoriesFound: number
  perfectScores: number
  totalDeaths: number
  cooperationScore: number
}

/**
 * Ending System
 * Manages multiple endings based on player choices and performance
 */
export class EndingSystem {
  private endings = ref<EndingData[]>([])
  private playerStats = ref<PlayerEndingStats | null>(null)
  private unlockedEndings = ref<Set<string>>(new Set())
  private currentEnding = ref<EndingData | null>(null)
  private importantChoices = ref<ImportantChoice[]>([])

  constructor() {
    this.initializeEndings()
    this.loadPlayerData()
  }

  /**
   * Determine which ending the player has earned
   */
  public determineEnding(): EndingData {
    // Calculate player stats
    this.playerStats.value = this.calculatePlayerStats()
    
    // Sort endings by priority (highest first)
    const sortedEndings = [...this.endings.value].sort((a, b) => b.priority - a.priority)
    
    // Check each ending's conditions
    for (const ending of sortedEndings) {
      if (this.checkEndingConditions(ending)) {
        this.currentEnding.value = ending
        this.unlockedEndings.value.add(ending.id)
        this.saveUnlockedEndings()
        return ending
      }
    }
    
    // Default to normal ending if no conditions met
    return this.getEndingByType(EndingType.NORMAL_ENDING)!
  }

  /**
   * Check if player meets conditions for specific ending
   */
  private checkEndingConditions(ending: EndingData): boolean {
    if (!this.playerStats.value) return false
    
    return ending.conditions.every(condition => {
      switch (condition.type) {
        case 'score':
          return this.checkScoreCondition(condition)
        case 'relationship':
          return this.checkRelationshipCondition(condition)
        case 'achievement':
          return this.checkAchievementCondition(condition)
        case 'choice':
          return this.checkChoiceCondition(condition)
        case 'hidden':
          return this.checkHiddenCondition(condition)
        case 'time':
          return this.checkTimeCondition(condition)
        default:
          return false
      }
    })
  }

  /**
   * Track important story choice
   */
  public recordImportantChoice(
    choiceId: string,
    chapterId: string,
    choice: string,
    consequence: string
  ): void {
    this.importantChoices.value.push({
      id: choiceId,
      chapterId,
      choice,
      consequence,
      timestamp: new Date()
    })
    this.saveImportantChoices()
  }

  /**
   * Get specific ending by type
   */
  public getEndingByType(type: EndingType): EndingData | null {
    return this.endings.value.find(ending => ending.type === type) || null
  }

  /**
   * Get all unlocked endings
   */
  public getUnlockedEndings(): EndingData[] {
    return this.endings.value.filter(ending => 
      this.unlockedEndings.value.has(ending.id)
    )
  }

  /**
   * Check if player can unlock New Game+
   */
  public canUnlockNewGamePlus(): boolean {
    const trueEnding = this.getEndingByType(EndingType.TRUE_ENDING)
    const goodEnding = this.getEndingByType(EndingType.GOOD_ENDING)
    
    return (trueEnding && this.unlockedEndings.value.has(trueEnding.id)) ||
           (goodEnding && this.unlockedEndings.value.has(goodEnding.id))
  }

  /**
   * Get ending-specific rewards
   */
  public getEndingRewards(endingId: string): EndingReward[] {
    const ending = this.endings.value.find(e => e.id === endingId)
    return ending?.specialRewards || []
  }

  /**
   * Calculate comprehensive player statistics
   */
  private calculatePlayerStats(): PlayerEndingStats {
    const progress = gameStoryBridge.currentProgress
    const relationships = new Map<string, number>()
    
    // Get character relationships from save data
    const savedRelationships = this.loadRelationshipData()
    savedRelationships.forEach((value, key) => {
      relationships.set(key, value)
    })
    
    // Calculate planet masteries
    const planetMasteries = new Map<string, number>()
    const planets = ['sound_planet', 'word_planet', 'grammar_planet', 'speed_station', 'cooperation_colony']
    
    planets.forEach(planet => {
      const areaProgress = this.getAreaProgressForPlanet(planet)
      if (areaProgress) {
        const mastery = this.calculateMastery(areaProgress)
        planetMasteries.set(planet, mastery)
      }
    })
    
    // Calculate overall mastery
    const masteryValues = Array.from(planetMasteries.values())
    const overallMastery = masteryValues.length > 0 
      ? masteryValues.reduce((sum, val) => sum + val, 0) / masteryValues.length
      : 0
    
    return {
      totalPlayTime: this.getTotalPlayTime(),
      overallMastery,
      planetMasteries,
      characterRelationships: relationships,
      importantChoices: this.importantChoices.value,
      achievementsUnlocked: this.getUnlockedAchievements(),
      hiddenStoriesFound: sideStoryDatabase.completedCount,
      perfectScores: this.getPerfectScoreCount(),
      totalDeaths: 0, // Would track game overs if implemented
      cooperationScore: this.getCooperationScore()
    }
  }

  /**
   * Initialize all possible endings
   */
  private initializeEndings(): void {
    this.endings.value = [
      {
        id: 'true_ending',
        type: EndingType.TRUE_ENDING,
        title: '真実の調和',
        subtitle: '完璧な理解と新たな始まり',
        description: 'すべての力を極め、Universal Translatorと共に新しい未来を創造する',
        conditions: [
          { type: 'score', operator: '>=', value: 90, target: 'all_planets' },
          { type: 'relationship', operator: '>=', value: 80, target: 'the_translator' },
          { type: 'choice', operator: 'includes', value: 'save_translator' },
          { type: 'achievement', operator: 'includes', value: 'language_architect' },
          { type: 'hidden', operator: '>=', value: 10 }
        ],
        priority: 100,
        unlocked: false,
        scriptPath: '/src/story/endings/true_ending.json',
        specialRewards: [
          {
            id: 'newgame_plus_master',
            type: 'newgame_plus',
            name: 'Master Mode',
            description: '最高難易度でのNew Game+モード'
          },
          {
            id: 'translator_companion',
            type: 'special_mode',
            name: 'Translator Companion Mode',
            description: 'Universal Translatorと共に冒険'
          },
          {
            id: 'developer_commentary',
            type: 'hidden_story',
            name: '開発者コメンタリー',
            description: '制作秘話と裏話'
          }
        ],
        epilogueCharacters: ['all'],
        bgmPath: '/audio/music/true_ending_theme.mp3',
        duration: 25
      },
      {
        id: 'good_ending',
        type: EndingType.GOOD_ENDING,
        title: '永遠の絆',
        subtitle: 'みんなとの約束',
        description: '仲間たちとの深い絆を育み、Language Galaxyに平和をもたらす',
        conditions: [
          { type: 'score', operator: '>=', value: 70, target: 'all_planets' },
          { type: 'relationship', operator: '>=', value: 70, target: 'average' },
          { type: 'choice', operator: 'includes', value: 'friendship_first' },
          { type: 'achievement', operator: 'includes', value: 'eternal_friend' }
        ],
        priority: 80,
        unlocked: false,
        scriptPath: '/src/story/endings/good_ending.json',
        specialRewards: [
          {
            id: 'newgame_plus_friendship',
            type: 'newgame_plus',
            name: 'Friendship Mode',
            description: 'キャラクターとの絆を深めるモード'
          },
          {
            id: 'character_stories',
            type: 'hidden_story',
            name: 'キャラクター秘話',
            description: '各キャラクターの特別エピソード'
          }
        ],
        epilogueCharacters: ['captain_nova', 'professor_phonix', 'lexia', 'grammar_guardian', 'speed_racer', 'unity'],
        bgmPath: '/audio/music/good_ending_theme.mp3',
        duration: 20
      },
      {
        id: 'normal_ending',
        type: EndingType.NORMAL_ENDING,
        title: '冒険の完結',
        subtitle: '新たな一歩',
        description: 'Language Galaxyでの冒険を完遂し、成長の証を手にする',
        conditions: [
          { type: 'score', operator: '>=', value: 50, target: 'all_planets' }
        ],
        priority: 50,
        unlocked: false,
        scriptPath: '/src/story/endings/normal_ending.json',
        specialRewards: [
          {
            id: 'newgame_plus_basic',
            type: 'newgame_plus',
            name: 'New Game+',
            description: '獲得スキルを引き継いで再スタート'
          }
        ],
        epilogueCharacters: ['captain_nova', 'aura'],
        bgmPath: '/audio/music/normal_ending_theme.mp3',
        duration: 15
      },
      {
        id: 'special_ending',
        type: EndingType.SPECIAL_ENDING,
        title: '運命の分岐点',
        subtitle: '予期せぬ真実',
        description: '隠された条件を満たし、Language Galaxyの別の側面を発見',
        conditions: [
          { type: 'hidden', operator: '>=', value: 15 },
          { type: 'choice', operator: 'includes', value: 'question_reality' },
          { type: 'time', operator: '>=', value: 7200000 }, // 2 hours
          { type: 'achievement', operator: 'includes', value: 'truth_seeker' }
        ],
        priority: 90,
        unlocked: false,
        scriptPath: '/src/story/endings/special_ending.json',
        specialRewards: [
          {
            id: 'vr_academy_invitation',
            type: 'vr_academy',
            name: 'VR Language Academy',
            description: '次世代学習システムへの招待'
          },
          {
            id: 'sequel_preview',
            type: 'hidden_story',
            name: '続編プレビュー',
            description: 'Language Galaxy 2の予告編'
          },
          {
            id: 'secret_soundtrack',
            type: 'soundtrack',
            name: '秘密のサウンドトラック',
            description: '未使用楽曲コレクション'
          }
        ],
        epilogueCharacters: ['the_translator', 'mysterious_entity'],
        bgmPath: '/audio/music/special_ending_theme.mp3',
        duration: 18
      },
      {
        id: 'secret_ending',
        type: EndingType.SECRET_ENDING,
        title: '???',
        subtitle: '真の覚醒',
        description: '誰も知らない最後の秘密',
        conditions: [
          { type: 'score', operator: '==', value: 100, target: 'all_planets' },
          { type: 'hidden', operator: '==', value: 20 },
          { type: 'choice', operator: 'includes', value: 'secret_path' },
          { type: 'achievement', operator: 'includes', value: 'perfectionist' },
          { type: 'time', operator: '<=', value: 3600000 } // Speedrun under 1 hour
        ],
        priority: 110,
        unlocked: false,
        scriptPath: '/src/story/endings/secret_ending.json',
        specialRewards: [
          {
            id: 'developer_mode',
            type: 'special_mode',
            name: 'Developer Mode',
            description: 'ゲーム開発者の視点でプレイ'
          },
          {
            id: 'concept_art',
            type: 'artwork',
            name: 'コンセプトアート集',
            description: '開発初期のアートワーク'
          }
        ],
        epilogueCharacters: ['meta_character'],
        bgmPath: '/audio/music/secret_ending_theme.mp3',
        duration: 30
      }
    ]
  }

  // Condition checkers

  private checkScoreCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    if (condition.target === 'all_planets') {
      const allPlanetScores = Array.from(this.playerStats.value.planetMasteries.values())
      const allMeetCondition = allPlanetScores.every(score => 
        this.compareValues(score, condition.operator, condition.value as number)
      )
      return allMeetCondition
    } else if (condition.target) {
      const score = this.playerStats.value.planetMasteries.get(condition.target) || 0
      return this.compareValues(score, condition.operator, condition.value as number)
    }
    
    return this.compareValues(
      this.playerStats.value.overallMastery,
      condition.operator,
      condition.value as number
    )
  }

  private checkRelationshipCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    if (condition.target === 'average') {
      const relationships = Array.from(this.playerStats.value.characterRelationships.values())
      const average = relationships.reduce((sum, val) => sum + val, 0) / relationships.length
      return this.compareValues(average, condition.operator, condition.value as number)
    } else if (condition.target) {
      const relationship = this.playerStats.value.characterRelationships.get(condition.target) || 0
      return this.compareValues(relationship, condition.operator, condition.value as number)
    }
    
    return false
  }

  private checkAchievementCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    const hasAchievement = this.playerStats.value.achievementsUnlocked.includes(condition.value as string)
    return condition.operator === 'includes' ? hasAchievement : !hasAchievement
  }

  private checkChoiceCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    const madeChoice = this.playerStats.value.importantChoices.some(
      choice => choice.choice === condition.value
    )
    return condition.operator === 'includes' ? madeChoice : !madeChoice
  }

  private checkHiddenCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    return this.compareValues(
      this.playerStats.value.hiddenStoriesFound,
      condition.operator,
      condition.value as number
    )
  }

  private checkTimeCondition(condition: EndingCondition): boolean {
    if (!this.playerStats.value) return false
    
    return this.compareValues(
      this.playerStats.value.totalPlayTime,
      condition.operator,
      condition.value as number
    )
  }

  // Helper methods

  private compareValues(actual: number, operator: string, expected: number): boolean {
    switch (operator) {
      case '>': return actual > expected
      case '<': return actual < expected
      case '>=': return actual >= expected
      case '<=': return actual <= expected
      case '==': return actual === expected
      default: return false
    }
  }

  private getAreaProgressForPlanet(planet: string): any {
    // Map planets to learning areas
    const planetAreaMap = {
      'sound_planet': 'pronunciation',
      'word_planet': 'vocabulary',
      'grammar_planet': 'grammar',
      'speed_station': 'typing',
      'cooperation_colony': 'cooperation'
    }
    
    const area = planetAreaMap[planet as keyof typeof planetAreaMap]
    return gameStoryBridge.currentProgress.get(area as any)
  }

  private calculateMastery(progress: any): number {
    if (!progress) return 0
    
    // Weight different factors
    const accuracyWeight = 0.4
    const completionWeight = 0.3
    const scoreWeight = 0.3
    
    const normalizedScore = Math.min(progress.score / 1000, 1) * 100
    const accuracy = progress.accuracy * 100
    const completion = progress.completionRate * 100
    
    return (accuracy * accuracyWeight) + 
           (completion * completionWeight) + 
           (normalizedScore * scoreWeight)
  }

  private getTotalPlayTime(): number {
    const saved = localStorage.getItem('language_galaxy_play_time')
    return saved ? parseInt(saved) : 0
  }

  private loadRelationshipData(): Map<string, number> {
    const saved = localStorage.getItem('language_galaxy_relationships')
    if (saved) {
      const data = JSON.parse(saved)
      return new Map(Object.entries(data))
    }
    return new Map()
  }

  private getUnlockedAchievements(): string[] {
    const saved = localStorage.getItem('language_galaxy_achievements')
    return saved ? JSON.parse(saved) : []
  }

  private getPerfectScoreCount(): number {
    const saved = localStorage.getItem('language_galaxy_perfect_scores')
    return saved ? parseInt(saved) : 0
  }

  private getCooperationScore(): number {
    const saved = localStorage.getItem('language_galaxy_cooperation_score')
    return saved ? parseInt(saved) : 0
  }

  private loadPlayerData(): void {
    const savedChoices = localStorage.getItem('language_galaxy_important_choices')
    if (savedChoices) {
      this.importantChoices.value = JSON.parse(savedChoices).map((choice: any) => ({
        ...choice,
        timestamp: new Date(choice.timestamp)
      }))
    }
    
    const savedEndings = localStorage.getItem('language_galaxy_unlocked_endings')
    if (savedEndings) {
      this.unlockedEndings.value = new Set(JSON.parse(savedEndings))
    }
  }

  private saveImportantChoices(): void {
    localStorage.setItem('language_galaxy_important_choices', JSON.stringify(this.importantChoices.value))
  }

  private saveUnlockedEndings(): void {
    localStorage.setItem('language_galaxy_unlocked_endings', 
      JSON.stringify(Array.from(this.unlockedEndings.value))
    )
  }

  // Public getters
  public get allEndings(): EndingData[] {
    return this.endings.value
  }

  public get currentPlayerStats(): PlayerEndingStats | null {
    return this.playerStats.value
  }

  public get selectedEnding(): EndingData | null {
    return this.currentEnding.value
  }

  public get totalEndingsUnlocked(): number {
    return this.unlockedEndings.value.size
  }

  public get completionPercentage(): number {
    return (this.unlockedEndings.value.size / this.endings.value.length) * 100
  }
}

// Export singleton instance
export const endingSystem = new EndingSystem()
export default endingSystem