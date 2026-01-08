import { ref, computed } from 'vue'
import type { Character } from '../characters/CharacterDatabase'
import { gameStoryBridge, type GameProgress, LearningArea, PerformanceLevel } from '../integration/GameStoryBridge'

// Time periods for contextual greetings
export enum TimePeriod {
  EARLY_MORNING = 'early_morning', // 5-8
  MORNING = 'morning',             // 8-12
  AFTERNOON = 'afternoon',         // 12-17
  EVENING = 'evening',             // 17-21
  NIGHT = 'night',                 // 21-24
  LATE_NIGHT = 'late_night'        // 0-5
}

// Seasonal events
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

// Special occasions
export enum SpecialOccasion {
  BIRTHDAY = 'birthday',
  NEW_YEAR = 'new_year',
  CHRISTMAS = 'christmas',
  HALLOWEEN = 'halloween',
  VALENTINE = 'valentine',
  FIRST_TIME = 'first_time',
  LONG_ABSENCE = 'long_absence'
}

export interface DialogueContext {
  playerName?: string
  currentTime: Date
  season: Season
  occasion?: SpecialOccasion
  progress?: Map<LearningArea, GameProgress>
  recentPerformance?: PerformanceLevel
  streakCount?: number
  lastPlayed?: Date
  emotionalState?: 'happy' | 'frustrated' | 'excited' | 'tired' | 'focused'
}

export interface DialogueTemplate {
  id: string
  character: string
  category: 'greeting' | 'encouragement' | 'celebration' | 'guidance' | 'casual' | 'farewell'
  conditions: DialogueCondition[]
  templates: string[]
  priority: number
  cooldown?: number // minutes before can be used again
}

export interface DialogueCondition {
  type: 'time' | 'season' | 'performance' | 'streak' | 'occasion' | 'first_time' | 'progress'
  value: string | number
  operator?: '>' | '<' | '==' | '>=' | '<=' | 'includes'
}

export interface GeneratedDialogue {
  text: string
  character: string
  emotion: string
  context: string
  timestamp: Date
}

/**
 * Dynamic Dialogue Generation System
 * Creates personalized dialogue based on player progress and context
 */
export class DynamicDialogueGenerator {
  private dialogueTemplates = ref<DialogueTemplate[]>([])
  private usedDialogues = ref<Set<string>>(new Set())
  private lastUsageTime = ref<Map<string, Date>>(new Map())
  private playerName = ref<string>('プレイヤー')

  constructor() {
    this.initializeTemplates()
    this.loadPlayerData()
  }

  /**
   * Generate personalized dialogue based on context
   */
  public generateDialogue(
    character: string, 
    category: string, 
    context: DialogueContext
  ): GeneratedDialogue | null {
    const availableTemplates = this.getAvailableTemplates(character, category, context)
    
    if (availableTemplates.length === 0) {
      return this.getFallbackDialogue(character, category, context)
    }

    // Sort by priority and select the best match
    availableTemplates.sort((a, b) => b.priority - a.priority)
    const selectedTemplate = availableTemplates[0]
    
    const processedText = this.processTemplate(selectedTemplate.templates[0], context)
    const emotion = this.determineEmotion(context, selectedTemplate.category)

    // Mark as used and set cooldown
    this.markAsUsed(selectedTemplate.id)

    return {
      text: processedText,
      character: selectedTemplate.character,
      emotion,
      context: selectedTemplate.category,
      timestamp: new Date()
    }
  }

  /**
   * Generate contextual greeting based on time and player state
   */
  public generateGreeting(character: string, context: DialogueContext): GeneratedDialogue | null {
    return this.generateDialogue(character, 'greeting', context)
  }

  /**
   * Generate encouragement based on performance
   */
  public generateEncouragement(character: string, area: LearningArea, context: DialogueContext): GeneratedDialogue | null {
    const enhancedContext = {
      ...context,
      currentArea: area,
      recentPerformance: this.analyzeRecentPerformance(area, context.progress)
    }
    
    return this.generateDialogue(character, 'encouragement', enhancedContext)
  }

  /**
   * Generate celebration message for achievements
   */
  public generateCelebration(character: string, achievement: string, context: DialogueContext): GeneratedDialogue | null {
    const celebrationContext = {
      ...context,
      achievement
    }
    
    return this.generateDialogue(character, 'celebration', celebrationContext)
  }

  /**
   * Generate casual conversation for character interactions
   */
  public generateCasualDialogue(character: string, topic?: string): GeneratedDialogue | null {
    const context: DialogueContext = {
      currentTime: new Date(),
      season: this.getCurrentSeason(),
      playerName: this.playerName.value
    }

    if (topic) {
      (context as any).topic = topic
    }

    return this.generateDialogue(character, 'casual', context)
  }

  /**
   * Generate seasonal dialogue
   */
  public generateSeasonalDialogue(character: string): GeneratedDialogue | null {
    const context: DialogueContext = {
      currentTime: new Date(),
      season: this.getCurrentSeason(),
      playerName: this.playerName.value
    }

    // Check for special occasions
    const occasion = this.checkSpecialOccasion(context.currentTime)
    if (occasion) {
      context.occasion = occasion
    }

    return this.generateDialogue(character, 'casual', context)
  }

  /**
   * Set player name for personalization
   */
  public setPlayerName(name: string): void {
    this.playerName.value = name
    localStorage.setItem('language_galaxy_player_name', name)
  }

  /**
   * Get current player name
   */
  public getPlayerName(): string {
    return this.playerName.value
  }

  // Private helper methods

  private initializeTemplates(): void {
    this.dialogueTemplates.value = [
      // Greeting templates
      {
        id: 'aura_morning_greeting',
        character: 'aura',
        category: 'greeting',
        conditions: [
          { type: 'time', value: 'morning' }
        ],
        templates: [
          'おはようございます、{playerName}さん！今日も一緒に学習を頑張りましょう！',
          '今日はいい天気ですね、{playerName}さん。学習日和です！',
          'おはようございます！今日は何から始めますか？'
        ],
        priority: 8
      },
      {
        id: 'aura_evening_greeting',
        character: 'aura',
        category: 'greeting',
        conditions: [
          { type: 'time', value: 'evening' }
        ],
        templates: [
          'お疲れさまです、{playerName}さん！今日はどんな一日でしたか？',
          '夕方の学習も効果的ですよ、{playerName}さん',
          'こんばんは！リラックスしながら学習しましょう'
        ],
        priority: 8
      },
      {
        id: 'phonix_wise_greeting',
        character: 'professor_phonix',
        category: 'greeting',
        conditions: [],
        templates: [
          'ほほう、{playerName}よ。今日も音の世界を探求するのかい？',
          '音の調べが聞こえてくるのう、{playerName}',
          'ようこそ、{playerName}。今日はどんな音を学ぶのじゃ？'
        ],
        priority: 7
      },
      {
        id: 'lexia_cheerful_greeting',
        character: 'lexia',
        category: 'greeting',
        conditions: [],
        templates: [
          '{playerName}〜！今日もいっぱい言葉で遊ぼうね！',
          'やっほー{playerName}！新しい言葉、覚えた？',
          '{playerName}！今日はどんな言葉に出会えるかな？'
        ],
        priority: 7
      },

      // Encouragement templates
      {
        id: 'encouragement_struggling',
        character: 'aura',
        category: 'encouragement',
        conditions: [
          { type: 'performance', value: 'struggling' }
        ],
        templates: [
          '{playerName}さん、大丈夫です。学習は一歩ずつ進むものです',
          '焦らないでくださいね。あなたのペースで進めましょう',
          '最初は誰でも難しく感じるものです。継続が大切ですよ'
        ],
        priority: 10
      },
      {
        id: 'phonix_sound_encouragement',
        character: 'professor_phonix',
        category: 'encouragement',
        conditions: [
          { type: 'progress', value: 'pronunciation' },
          { type: 'performance', value: 'struggling' }
        ],
        templates: [
          '{playerName}よ、音は生き物じゃ。ゆっくりと友達になればよい',
          '焦ることはない。音の美しさを感じることから始めるのじゃ',
          'わしも昔は音が苦手じゃった。あなたなら必ずできる'
        ],
        priority: 9
      },
      {
        id: 'lexia_word_encouragement',
        character: 'lexia',
        category: 'encouragement',
        conditions: [
          { type: 'progress', value: 'vocabulary' },
          { type: 'performance', value: 'struggling' }
        ],
        templates: [
          '{playerName}、言葉はね、友達なの。怖がらないで',
          '大丈夫！私が{playerName}の言葉の冒険を応援するから',
          '一つ覚えるたびに、世界が広がるよ！'
        ],
        priority: 9
      },

      // Celebration templates
      {
        id: 'celebration_excellent',
        character: 'aura',
        category: 'celebration',
        conditions: [
          { type: 'performance', value: 'excellent' }
        ],
        templates: [
          '素晴らしい成果です、{playerName}さん！',
          '完璧な成績ですね。努力が実を結んでいます',
          'この調子で頑張れば、どんな目標も達成できますよ'
        ],
        priority: 9
      },
      {
        id: 'celebration_streak',
        character: 'aura',
        category: 'celebration',
        conditions: [
          { type: 'streak', value: 7, operator: '>=' }
        ],
        templates: [
          '{streakCount}日連続！継続は力なりですね、{playerName}さん',
          '素晴らしい継続力です。学習習慣がしっかり身についていますね',
          '毎日の努力が大きな成果につながっています'
        ],
        priority: 10
      },

      // Seasonal templates
      {
        id: 'spring_casual',
        character: 'lexia',
        category: 'casual',
        conditions: [
          { type: 'season', value: 'spring' }
        ],
        templates: [
          '春だね〜！新しい言葉もたくさん芽吹いてるよ',
          '桜の季節！「さくら」って美しい言葉だと思わない？',
          '春風に乗って、新しい言葉を覚えましょ！'
        ],
        priority: 6
      },
      {
        id: 'winter_casual',
        character: 'professor_phonix',
        category: 'casual',
        conditions: [
          { type: 'season', value: 'winter' }
        ],
        templates: [
          '冬の静寂も美しい音じゃのう、{playerName}',
          '雪の結晶のように、一つ一つの音も美しいのじゃ',
          '寒い季節こそ、心温まる音を学ぼうではないか'
        ],
        priority: 6
      },

      // Special occasion templates
      {
        id: 'first_time_welcome',
        character: 'captain_nova',
        category: 'greeting',
        conditions: [
          { type: 'first_time', value: true }
        ],
        templates: [
          'ようこそ、Language Galaxy Adventureへ！私はCaptain Nova',
          '新しい冒険者の到着だ！一緒に宇宙を探検しよう',
          '君が{playerName}だね。素晴らしい旅が始まるよ'
        ],
        priority: 15
      },
      {
        id: 'long_absence_return',
        character: 'aura',
        category: 'greeting',
        conditions: [
          { type: 'occasion', value: 'long_absence' }
        ],
        templates: [
          'お帰りなさい、{playerName}さん！お久しぶりです',
          'しばらくお見かけしませんでしたね。また一緒に学習しましょう',
          '久しぶりですね。みんな{playerName}さんを待っていました'
        ],
        priority: 12
      }
    ]
  }

  private loadPlayerData(): void {
    const savedName = localStorage.getItem('language_galaxy_player_name')
    if (savedName) {
      this.playerName.value = savedName
    }

    const savedUsage = localStorage.getItem('language_galaxy_dialogue_usage')
    if (savedUsage) {
      const data = JSON.parse(savedUsage)
      this.usedDialogues.value = new Set(data.used || [])
      this.lastUsageTime.value = new Map(
        Object.entries(data.lastUsage || {}).map(([k, v]) => [k, new Date(v as string)])
      )
    }
  }

  private saveDialogueData(): void {
    const data = {
      used: Array.from(this.usedDialogues.value),
      lastUsage: Object.fromEntries(
        Array.from(this.lastUsageTime.value.entries()).map(([k, v]) => [k, v.toISOString()])
      )
    }
    localStorage.setItem('language_galaxy_dialogue_usage', JSON.stringify(data))
  }

  private getAvailableTemplates(
    character: string,
    category: string,
    context: DialogueContext
  ): DialogueTemplate[] {
    return this.dialogueTemplates.value.filter(template => {
      // Check character match
      if (template.character !== character) return false
      
      // Check category match
      if (template.category !== category) return false
      
      // Check cooldown
      if (this.isOnCooldown(template.id)) return false
      
      // Check conditions
      return this.checkConditions(template.conditions, context)
    })
  }

  private checkConditions(conditions: DialogueCondition[], context: DialogueContext): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          return this.getTimePeriod(context.currentTime) === condition.value
        case 'season':
          return context.season === condition.value
        case 'performance':
          return context.recentPerformance === condition.value
        case 'streak':
          if (!context.streakCount) return false
          return this.compareValues(context.streakCount, condition.operator || '==', condition.value as number)
        case 'occasion':
          return context.occasion === condition.value
        case 'first_time':
          return this.isFirstTime()
        case 'progress':
          return context.progress?.has(condition.value as LearningArea) || false
        default:
          return true
      }
    })
  }

  private processTemplate(template: string, context: DialogueContext): string {
    let processed = template
    
    // Replace player name
    processed = processed.replace(/{playerName}/g, context.playerName || this.playerName.value)
    
    // Replace streak count
    if (context.streakCount) {
      processed = processed.replace(/{streakCount}/g, context.streakCount.toString())
    }
    
    // Replace season
    processed = processed.replace(/{season}/g, this.getSeasonName(context.season))
    
    // Replace time period
    processed = processed.replace(/{time}/g, this.getTimePeriodName(this.getTimePeriod(context.currentTime)))
    
    return processed
  }

  private determineEmotion(context: DialogueContext, category: string): string {
    if (context.emotionalState) {
      return context.emotionalState
    }

    switch (category) {
      case 'celebration': return 'joyful'
      case 'encouragement': return 'supportive'
      case 'greeting': return 'friendly'
      case 'casual': return 'relaxed'
      default: return 'neutral'
    }
  }

  private getFallbackDialogue(character: string, category: string, context: DialogueContext): GeneratedDialogue {
    const fallbacks = {
      greeting: `こんにちは、${context.playerName || this.playerName.value}さん！`,
      encouragement: '頑張ってください！きっとできますよ',
      celebration: '素晴らしいですね！',
      casual: '今日もお疲れさまです',
      farewell: 'また会いましょう！'
    }

    return {
      text: fallbacks[category as keyof typeof fallbacks] || 'こんにちは！',
      character,
      emotion: 'neutral',
      context: 'fallback',
      timestamp: new Date()
    }
  }

  private analyzeRecentPerformance(area: LearningArea, progress?: Map<LearningArea, GameProgress>): PerformanceLevel {
    if (!progress || !progress.has(area)) {
      return PerformanceLevel.IMPROVING
    }

    const areaProgress = progress.get(area)!
    
    if (areaProgress.accuracy >= 0.9) return PerformanceLevel.MASTERFUL
    if (areaProgress.accuracy >= 0.8) return PerformanceLevel.EXCELLENT
    if (areaProgress.accuracy >= 0.6) return PerformanceLevel.GOOD
    if (areaProgress.accuracy >= 0.4) return PerformanceLevel.IMPROVING
    return PerformanceLevel.STRUGGLING
  }

  private getTimePeriod(date: Date): TimePeriod {
    const hour = date.getHours()
    
    if (hour >= 5 && hour < 8) return TimePeriod.EARLY_MORNING
    if (hour >= 8 && hour < 12) return TimePeriod.MORNING
    if (hour >= 12 && hour < 17) return TimePeriod.AFTERNOON
    if (hour >= 17 && hour < 21) return TimePeriod.EVENING
    if (hour >= 21 && hour < 24) return TimePeriod.NIGHT
    return TimePeriod.LATE_NIGHT
  }

  private getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1
    
    if (month >= 3 && month <= 5) return Season.SPRING
    if (month >= 6 && month <= 8) return Season.SUMMER
    if (month >= 9 && month <= 11) return Season.AUTUMN
    return Season.WINTER
  }

  private checkSpecialOccasion(date: Date): SpecialOccasion | undefined {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    if (month === 1 && day === 1) return SpecialOccasion.NEW_YEAR
    if (month === 12 && day === 25) return SpecialOccasion.CHRISTMAS
    if (month === 10 && day === 31) return SpecialOccasion.HALLOWEEN
    if (month === 2 && day === 14) return SpecialOccasion.VALENTINE
    
    // Check for long absence
    const lastPlayed = localStorage.getItem('language_galaxy_last_played')
    if (lastPlayed) {
      const daysSinceLastPlay = (Date.now() - new Date(lastPlayed).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastPlay >= 7) return SpecialOccasion.LONG_ABSENCE
    }
    
    return undefined
  }

  private isFirstTime(): boolean {
    return !localStorage.getItem('language_galaxy_player_name') || 
           !localStorage.getItem('language_galaxy_first_visit_complete')
  }

  private isOnCooldown(templateId: string): boolean {
    const lastUsed = this.lastUsageTime.value.get(templateId)
    if (!lastUsed) return false
    
    const template = this.dialogueTemplates.value.find(t => t.id === templateId)
    if (!template?.cooldown) return false
    
    const timeDiff = (Date.now() - lastUsed.getTime()) / (1000 * 60) // minutes
    return timeDiff < template.cooldown
  }

  private markAsUsed(templateId: string): void {
    this.usedDialogues.value.add(templateId)
    this.lastUsageTime.value.set(templateId, new Date())
    this.saveDialogueData()
  }

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

  private getSeasonName(season: Season): string {
    const names = {
      [Season.SPRING]: '春',
      [Season.SUMMER]: '夏',
      [Season.AUTUMN]: '秋',
      [Season.WINTER]: '冬'
    }
    return names[season]
  }

  private getTimePeriodName(period: TimePeriod): string {
    const names = {
      [TimePeriod.EARLY_MORNING]: '早朝',
      [TimePeriod.MORNING]: '朝',
      [TimePeriod.AFTERNOON]: '午後',
      [TimePeriod.EVENING]: '夕方',
      [TimePeriod.NIGHT]: '夜',
      [TimePeriod.LATE_NIGHT]: '深夜'
    }
    return names[period]
  }

  // Public API methods
  public markFirstVisitComplete(): void {
    localStorage.setItem('language_galaxy_first_visit_complete', 'true')
  }

  public updateLastPlayed(): void {
    localStorage.setItem('language_galaxy_last_played', new Date().toISOString())
  }

  public getDialogueHistory(): GeneratedDialogue[] {
    const saved = localStorage.getItem('language_galaxy_dialogue_history')
    if (saved) {
      return JSON.parse(saved).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
    }
    return []
  }

  public saveDialogueToHistory(dialogue: GeneratedDialogue): void {
    const history = this.getDialogueHistory()
    history.push(dialogue)
    
    // Keep only last 50 dialogues
    if (history.length > 50) {
      history.splice(0, history.length - 50)
    }
    
    localStorage.setItem('language_galaxy_dialogue_history', JSON.stringify(history))
  }
}

// Export singleton instance
export const dynamicDialogueGenerator = new DynamicDialogueGenerator()
export default dynamicDialogueGenerator