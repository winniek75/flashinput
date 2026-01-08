import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { gameStoryBridge, type GameProgress, LearningArea, PerformanceLevel } from './GameStoryBridge'
import { dynamicDialogueGenerator, type DialogueContext } from '../dialogue/DynamicDialogueGenerator'
import { sideStoryDatabase, type SideStory } from '../sidestories/SideStoryDatabase'
import { CharacterEmotionManager } from '../characters/CharacterEmotions'
import type { Character } from '../characters/CharacterDatabase'

// Integration events
export enum IntegrationEventType {
  GAME_COMPLETED = 'game_completed',
  MILESTONE_REACHED = 'milestone_reached',
  STREAK_BONUS = 'streak_bonus',
  CHARACTER_INTERACTION = 'character_interaction',
  STORY_UNLOCK = 'story_unlock',
  SEASON_CHANGE = 'season_change',
  DAILY_LOGIN = 'daily_login'
}

export interface IntegrationEvent {
  id: string
  type: IntegrationEventType
  timestamp: Date
  data: Record<string, any>
  processed: boolean
}

export interface StoryRecommendation {
  story: SideStory
  reason: string
  priority: number
  urgency: 'low' | 'medium' | 'high'
}

export interface DynamicContent {
  dialogue?: string
  characterId?: string
  emotion?: string
  storyUnlock?: string
  cutsceneId?: string
  specialEffect?: string
}

/**
 * Story System Integration
 * Orchestrates all story systems to create a cohesive narrative experience
 */
export class StorySystemIntegration {
  private router = useRouter()
  private emotionManager = new CharacterEmotionManager()
  private pendingEvents = ref<IntegrationEvent[]>([])
  private activeStoryContent = ref<DynamicContent | null>(null)
  private lastInteractionTime = ref<Date>(new Date())
  private sessionStartTime = ref<Date>(new Date())

  constructor() {
    this.initializeIntegration()
    this.setupEventListeners()
  }

  /**
   * Process game completion and trigger appropriate story content
   */
  public async processGameCompletion(
    area: LearningArea,
    gameData: {
      score: number
      accuracy: number
      timeSpent: number
      completed: boolean
    }
  ): Promise<DynamicContent | null> {
    // Update game progress
    const triggeredEvents = gameStoryBridge.updateProgress(area, gameData)
    
    // Generate appropriate response based on performance
    const performance = this.analyzeGamePerformance(gameData)
    const context = this.createDialogueContext(area, performance)
    
    let dynamicContent: DynamicContent | null = null

    // Determine appropriate character and response
    const characterId = this.getAreaCharacter(area)
    
    if (performance === PerformanceLevel.STRUGGLING) {
      // Generate encouragement
      const encouragement = dynamicDialogueGenerator.generateEncouragement(characterId, area, context)
      if (encouragement) {
        dynamicContent = {
          dialogue: encouragement.text,
          characterId: encouragement.character,
          emotion: encouragement.emotion
        }
      }
      
      // Check for support stories
      const supportStories = this.getSupportStories(area, performance)
      if (supportStories.length > 0) {
        dynamicContent = {
          ...dynamicContent,
          storyUnlock: supportStories[0].id
        }
      }
      
    } else if (performance === PerformanceLevel.EXCELLENT || performance === PerformanceLevel.MASTERFUL) {
      // Generate celebration
      const celebration = dynamicDialogueGenerator.generateCelebration(
        characterId, 
        '高得点達成', 
        context
      )
      if (celebration) {
        dynamicContent = {
          dialogue: celebration.text,
          characterId: celebration.character,
          emotion: celebration.emotion,
          specialEffect: 'celebration_particles'
        }
      }
      
      // Check for achievement stories
      const achievementStories = this.getAchievementStories(gameData.score, gameData.accuracy)
      if (achievementStories.length > 0) {
        dynamicContent = {
          ...dynamicContent,
          storyUnlock: achievementStories[0].id
        }
      }
    }

    // Check for streak bonuses
    const streakEvents = gameStoryBridge.checkStreakBonuses()
    if (streakEvents.length > 0) {
      dynamicContent = {
        ...dynamicContent,
        cutsceneId: 'streak_celebration'
      }
    }

    // Store dynamic content for display
    this.activeStoryContent.value = dynamicContent
    this.lastInteractionTime.value = new Date()

    return dynamicContent
  }

  /**
   * Get personalized story recommendations based on player state
   */
  public getStoryRecommendations(): StoryRecommendation[] {
    const recommendations: StoryRecommendation[] = []
    
    // Get player progress
    const progress = gameStoryBridge.currentProgress
    const streakCount = gameStoryBridge.streakCount
    
    // Daily recommendation
    const dailyStory = sideStoryDatabase.getDailyRecommendation()
    if (dailyStory) {
      recommendations.push({
        story: dailyStory,
        reason: '今日のおすすめストーリー',
        priority: 8,
        urgency: 'medium'
      })
    }

    // Emotional support stories for struggling areas
    for (const [area, areaProgress] of progress.entries()) {
      if (areaProgress.accuracy < 0.5) {
        const supportStories = sideStoryDatabase.getStoriesByCharacter(this.getAreaCharacter(area))
        const emotionalStories = supportStories.filter(story => 
          ['heartwarming', 'inspiring', 'emotional'].includes(story.mood)
        )
        
        if (emotionalStories.length > 0) {
          recommendations.push({
            story: emotionalStories[0],
            reason: `${this.getLearningAreaName(area)}で苦戦中のためのサポート`,
            priority: 10,
            urgency: 'high'
          })
        }
      }
    }

    // Comedy stories for stress relief
    if (this.detectStressIndicators()) {
      const comedyStories = sideStoryDatabase.getComedyStories()
      if (comedyStories.length > 0) {
        recommendations.push({
          story: comedyStories[0],
          reason: 'リラックスのためのコメディ',
          priority: 7,
          urgency: 'medium'
        })
      }
    }

    // Character interaction stories
    const interactionStories = sideStoryDatabase.getCharacterInteractions()
    if (interactionStories.length > 0) {
      recommendations.push({
        story: interactionStories[0],
        reason: 'キャラクター同士の掛け合い',
        priority: 6,
        urgency: 'low'
      })
    }

    // Seasonal content
    const seasonalStory = this.getSeasonalRecommendation()
    if (seasonalStory) {
      recommendations.push({
        story: seasonalStory,
        reason: '季節限定コンテンツ',
        priority: 9,
        urgency: 'medium'
      })
    }

    // Sort by priority and urgency
    return recommendations.sort((a, b) => {
      if (a.urgency !== b.urgency) {
        const urgencyOrder = { high: 3, medium: 2, low: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      }
      return b.priority - a.priority
    })
  }

  /**
   * Generate contextual dialogue for any situation
   */
  public generateContextualDialogue(
    characterId: string,
    situation: string,
    customContext?: Partial<DialogueContext>
  ): string | null {
    const baseContext = this.createCurrentDialogueContext()
    const mergedContext = { ...baseContext, ...customContext }
    
    let category = 'casual'
    
    // Map situations to dialogue categories
    switch (situation) {
      case 'greeting':
      case 'first_meeting':
        category = 'greeting'
        break
      case 'encouragement':
      case 'support':
        category = 'encouragement'
        break
      case 'celebration':
      case 'achievement':
        category = 'celebration'
        break
      case 'farewell':
      case 'goodbye':
        category = 'farewell'
        break
    }
    
    const dialogue = dynamicDialogueGenerator.generateDialogue(characterId, category, mergedContext)
    return dialogue?.text || null
  }

  /**
   * Process special events (login, season change, etc.)
   */
  public processSpecialEvent(eventType: IntegrationEventType, eventData: Record<string, any>): void {
    const event: IntegrationEvent = {
      id: `${eventType}_${Date.now()}`,
      type: eventType,
      timestamp: new Date(),
      data: eventData,
      processed: false
    }
    
    this.pendingEvents.value.push(event)
    this.processEvent(event)
  }

  /**
   * Get current active story content
   */
  public getActiveContent(): DynamicContent | null {
    return this.activeStoryContent.value
  }

  /**
   * Clear active content
   */
  public clearActiveContent(): void {
    this.activeStoryContent.value = null
  }

  /**
   * Check if player should see story content now
   */
  public shouldShowStoryContent(): boolean {
    const timeSinceLastInteraction = Date.now() - this.lastInteractionTime.value.getTime()
    const minimumInterval = 5 * 60 * 1000 // 5 minutes
    
    return timeSinceLastInteraction >= minimumInterval || this.activeStoryContent.value !== null
  }

  /**
   * Get story content for specific game state
   */
  public getContentForGameState(
    currentRoute: string,
    gameData?: Record<string, any>
  ): DynamicContent | null {
    // Route-specific content
    switch (currentRoute) {
      case 'sound-planet':
        return this.getSoundPlanetContent(gameData)
      case 'word-planet':
        return this.getWordPlanetContent(gameData)
      case 'grammar-planet':
        return this.getGrammarPlanetContent(gameData)
      case 'speed-station':
        return this.getSpeedStationContent(gameData)
      case 'cooperation-colony':
        return this.getCooperationContent(gameData)
      default:
        return this.getGeneralContent(gameData)
    }
  }

  // Private helper methods

  private initializeIntegration(): void {
    // Load any saved integration state
    const saved = localStorage.getItem('language_galaxy_integration')
    if (saved) {
      const data = JSON.parse(saved)
      this.lastInteractionTime.value = new Date(data.lastInteraction || Date.now())
      this.sessionStartTime.value = new Date(data.sessionStart || Date.now())
    }
    
    // Set up periodic story content checks
    setInterval(() => {
      this.checkForStoryOpportunities()
    }, 60000) // Check every minute
  }

  private setupEventListeners(): void {
    // Listen to route changes
    watch(() => this.router.currentRoute.value, (newRoute) => {
      this.processSpecialEvent(IntegrationEventType.GAME_COMPLETED, {
        route: newRoute.name,
        timestamp: new Date()
      })
    })
  }

  private processEvent(event: IntegrationEvent): void {
    switch (event.type) {
      case IntegrationEventType.DAILY_LOGIN:
        this.processDailyLogin(event.data)
        break
      case IntegrationEventType.STREAK_BONUS:
        this.processStreakBonus(event.data)
        break
      case IntegrationEventType.SEASON_CHANGE:
        this.processSeasonChange(event.data)
        break
      // Add more event processors as needed
    }
    
    event.processed = true
    this.saveIntegrationState()
  }

  private processDailyLogin(data: Record<string, any>): void {
    const greetingCharacter = this.selectGreetingCharacter()
    const context = this.createCurrentDialogueContext()
    
    const greeting = dynamicDialogueGenerator.generateGreeting(greetingCharacter, context)
    if (greeting) {
      this.activeStoryContent.value = {
        dialogue: greeting.text,
        characterId: greeting.character,
        emotion: greeting.emotion
      }
    }
  }

  private processStreakBonus(data: Record<string, any>): void {
    // Trigger streak celebration cutscene or dialogue
    this.activeStoryContent.value = {
      cutsceneId: 'streak_celebration',
      specialEffect: 'fireworks'
    }
  }

  private processSeasonChange(data: Record<string, any>): void {
    // Generate seasonal dialogue from random character
    const characters = ['aura', 'professor_phonix', 'lexia', 'grammar_guardian']
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
    
    const seasonalDialogue = dynamicDialogueGenerator.generateSeasonalDialogue(randomCharacter)
    if (seasonalDialogue) {
      this.activeStoryContent.value = {
        dialogue: seasonalDialogue.text,
        characterId: seasonalDialogue.character,
        emotion: seasonalDialogue.emotion
      }
    }
  }

  private analyzeGamePerformance(gameData: {
    score: number
    accuracy: number
    timeSpent: number
    completed: boolean
  }): PerformanceLevel {
    const { accuracy, completed } = gameData
    
    if (!completed) return PerformanceLevel.STRUGGLING
    if (accuracy >= 0.9) return PerformanceLevel.MASTERFUL
    if (accuracy >= 0.8) return PerformanceLevel.EXCELLENT
    if (accuracy >= 0.6) return PerformanceLevel.GOOD
    if (accuracy >= 0.4) return PerformanceLevel.IMPROVING
    return PerformanceLevel.STRUGGLING
  }

  private createDialogueContext(area?: LearningArea, performance?: PerformanceLevel): DialogueContext {
    return {
      playerName: dynamicDialogueGenerator.getPlayerName(),
      currentTime: new Date(),
      season: this.getCurrentSeason(),
      progress: gameStoryBridge.currentProgress,
      recentPerformance: performance,
      streakCount: gameStoryBridge.streakCount,
      lastPlayed: this.lastInteractionTime.value
    }
  }

  private createCurrentDialogueContext(): DialogueContext {
    return this.createDialogueContext()
  }

  private getAreaCharacter(area: LearningArea): string {
    const characterMap = {
      [LearningArea.PRONUNCIATION]: 'professor_phonix',
      [LearningArea.VOCABULARY]: 'lexia',
      [LearningArea.GRAMMAR]: 'grammar_guardian',
      [LearningArea.TYPING]: 'speed_racer',
      [LearningArea.COOPERATION]: 'unity'
    }
    
    return characterMap[area] || 'aura'
  }

  private getLearningAreaName(area: LearningArea): string {
    const names = {
      [LearningArea.PRONUNCIATION]: '発音',
      [LearningArea.VOCABULARY]: '語彙',
      [LearningArea.GRAMMAR]: '文法',
      [LearningArea.TYPING]: 'タイピング',
      [LearningArea.COOPERATION]: '協力'
    }
    
    return names[area] || area
  }

  private getSupportStories(area: LearningArea, performance: PerformanceLevel): SideStory[] {
    const characterId = this.getAreaCharacter(area)
    return sideStoryDatabase.getStoriesByCharacter(characterId)
      .filter(story => ['heartwarming', 'inspiring', 'emotional'].includes(story.mood))
  }

  private getAchievementStories(score: number, accuracy: number): SideStory[] {
    if (score >= 1000 || accuracy >= 0.95) {
      return sideStoryDatabase.getStoriesByType('achievement_bonus' as any)
    }
    return []
  }

  private detectStressIndicators(): boolean {
    // Simple heuristic: frequent failures or long session time
    const sessionTime = Date.now() - this.sessionStartTime.value.getTime()
    const longSession = sessionTime > 2 * 60 * 60 * 1000 // 2 hours
    
    // Could also check recent game performance trends
    return longSession
  }

  private getSeasonalRecommendation(): SideStory | null {
    const seasonalStories = sideStoryDatabase.getStoriesByType('seasonal_event' as any)
    const currentSeason = this.getCurrentSeason()
    
    return seasonalStories.find(story => 
      story.tags.includes(currentSeason) || story.tags.includes('seasonal')
    ) || null
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth() + 1
    
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'autumn'
    return 'winter'
  }

  private selectGreetingCharacter(): string {
    // Select based on time of day and player progress
    const hour = new Date().getHours()
    
    if (hour < 10) return 'aura' // Morning efficiency
    if (hour < 15) return 'professor_phonix' // Afternoon learning
    if (hour < 20) return 'lexia' // Evening creativity
    return 'grammar_guardian' // Night focus
  }

  private checkForStoryOpportunities(): void {
    // Periodic check for story opportunities
    if (this.shouldShowStoryContent()) {
      const recommendations = this.getStoryRecommendations()
      if (recommendations.length > 0 && recommendations[0].urgency === 'high') {
        // Auto-trigger high-priority content
        const story = recommendations[0].story
        this.activeStoryContent.value = {
          storyUnlock: story.id
        }
      }
    }
  }

  private getSoundPlanetContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'professor_phonix',
      dialogue: this.generateContextualDialogue('professor_phonix', 'greeting'),
      emotion: 'wise'
    }
  }

  private getWordPlanetContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'lexia',
      dialogue: this.generateContextualDialogue('lexia', 'greeting'),
      emotion: 'excited'
    }
  }

  private getGrammarPlanetContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'grammar_guardian',
      dialogue: this.generateContextualDialogue('grammar_guardian', 'greeting'),
      emotion: 'serious'
    }
  }

  private getSpeedStationContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'speed_racer',
      dialogue: this.generateContextualDialogue('speed_racer', 'greeting'),
      emotion: 'energetic'
    }
  }

  private getCooperationContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'unity',
      dialogue: this.generateContextualDialogue('unity', 'greeting'),
      emotion: 'serene'
    }
  }

  private getGeneralContent(gameData?: Record<string, any>): DynamicContent | null {
    return {
      characterId: 'aura',
      dialogue: this.generateContextualDialogue('aura', 'greeting'),
      emotion: 'friendly'
    }
  }

  private saveIntegrationState(): void {
    const data = {
      lastInteraction: this.lastInteractionTime.value.toISOString(),
      sessionStart: this.sessionStartTime.value.toISOString(),
      events: this.pendingEvents.value.slice(-10) // Keep last 10 events
    }
    
    localStorage.setItem('language_galaxy_integration', JSON.stringify(data))
  }

  // Public getters
  public get sessionDuration(): number {
    return Date.now() - this.sessionStartTime.value.getTime()
  }

  public get timeSinceLastInteraction(): number {
    return Date.now() - this.lastInteractionTime.value.getTime()
  }

  public get pendingEventCount(): number {
    return this.pendingEvents.value.filter(e => !e.processed).length
  }
}

// Export singleton instance
export const storySystemIntegration = new StorySystemIntegration()
export default storySystemIntegration