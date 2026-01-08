import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { CharacterEmotionManager } from '../characters/CharacterEmotions'
import type { Character } from '../characters/CharacterDatabase'

// Game performance levels
export enum PerformanceLevel {
  STRUGGLING = 'struggling',
  IMPROVING = 'improving', 
  GOOD = 'good',
  EXCELLENT = 'excellent',
  MASTERFUL = 'masterful'
}

// Story branch types
export enum StoryBranchType {
  ENCOURAGEMENT = 'encouragement',
  CELEBRATION = 'celebration',
  SUPPORT = 'support',
  CHALLENGE = 'challenge',
  BONUS = 'bonus',
  HIDDEN = 'hidden'
}

// Learning areas
export enum LearningArea {
  PRONUNCIATION = 'pronunciation',
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  TYPING = 'typing',
  COOPERATION = 'cooperation'
}

export interface GameProgress {
  area: LearningArea
  score: number
  accuracy: number
  timeSpent: number
  attempts: number
  completionRate: number
  streakCount: number
  lastPlayed: Date
}

export interface StoryEvent {
  id: string
  type: StoryBranchType
  title: string
  description: string
  character: string
  dialogue: string[]
  conditions: StoryCondition[]
  rewards?: StoryReward[]
  unlockTime?: Date
  priority: number
}

export interface StoryCondition {
  type: 'score' | 'accuracy' | 'streak' | 'time' | 'area' | 'attempts'
  operator: '>' | '<' | '==' | '>=' | '<='
  value: number | string
  area?: LearningArea
}

export interface StoryReward {
  type: 'character_unlock' | 'scene_unlock' | 'bonus_story' | 'achievement'
  value: string
  description: string
}

export interface WeaknessAnalysis {
  area: LearningArea
  severity: 'mild' | 'moderate' | 'significant'
  recommendedCharacter: string
  supportMessage: string
  practiceRecommendations: string[]
}

/**
 * Game Story Bridge System
 * Connects game progress with dynamic story elements
 */
export class GameStoryBridge {
  private gameStore = useGameStore()
  private emotionManager = new CharacterEmotionManager()
  private storyEvents = ref<StoryEvent[]>([])
  private playerProgress = ref<Map<LearningArea, GameProgress>>(new Map())
  private unlockedStories = ref<Set<string>>(new Set())
  private currentStreak = ref<number>(0)
  private lastPlaySession = ref<Date | null>(null)

  constructor() {
    this.initializeStoryEvents()
    this.loadPlayerProgress()
  }

  /**
   * Update player progress and trigger story events
   */
  public updateProgress(area: LearningArea, gameData: {
    score: number
    accuracy: number
    timeSpent: number
    completed: boolean
  }): StoryEvent[] {
    const currentProgress = this.playerProgress.value.get(area) || this.createDefaultProgress(area)
    
    // Update progress data
    const updatedProgress: GameProgress = {
      ...currentProgress,
      score: Math.max(currentProgress.score, gameData.score),
      accuracy: (currentProgress.accuracy + gameData.accuracy) / 2,
      timeSpent: currentProgress.timeSpent + gameData.timeSpent,
      attempts: currentProgress.attempts + 1,
      completionRate: gameData.completed ? 
        (currentProgress.completionRate * currentProgress.attempts + 1) / (currentProgress.attempts + 1) :
        currentProgress.completionRate,
      streakCount: gameData.completed ? currentProgress.streakCount + 1 : 0,
      lastPlayed: new Date()
    }

    this.playerProgress.value.set(area, updatedProgress)
    this.updateStreak(gameData.completed)

    // Analyze performance and trigger appropriate story events
    const performanceLevel = this.analyzePerformance(updatedProgress)
    const triggeredEvents = this.checkStoryTriggers(area, updatedProgress, performanceLevel)

    // Update character emotions based on performance
    this.updateCharacterEmotions(area, performanceLevel)

    return triggeredEvents
  }

  /**
   * Get personalized encouragement based on player's current state
   */
  public getPersonalizedEncouragement(area: LearningArea): StoryEvent | null {
    const progress = this.playerProgress.value.get(area)
    if (!progress) return null

    const performance = this.analyzePerformance(progress)
    const character = this.getAreaCharacter(area)

    if (performance === PerformanceLevel.STRUGGLING) {
      return {
        id: `encouragement_${area}_${Date.now()}`,
        type: StoryBranchType.ENCOURAGEMENT,
        title: '頑張って！',
        description: 'キャラクターからの励ましメッセージ',
        character: character.id,
        dialogue: this.generateEncouragementDialogue(character, area, progress),
        conditions: [],
        priority: 10
      }
    }

    return null
  }

  /**
   * Get character advice for weak areas
   */
  public getWeaknessAnalysis(): WeaknessAnalysis[] {
    const analyses: WeaknessAnalysis[] = []
    
    for (const [area, progress] of this.playerProgress.value.entries()) {
      const performance = this.analyzePerformance(progress)
      
      if (performance === PerformanceLevel.STRUGGLING || performance === PerformanceLevel.IMPROVING) {
        const character = this.getAreaCharacter(area)
        const severity = progress.accuracy < 0.3 ? 'significant' : 
                        progress.accuracy < 0.6 ? 'moderate' : 'mild'

        analyses.push({
          area,
          severity,
          recommendedCharacter: character.id,
          supportMessage: this.generateSupportMessage(character, area, severity),
          practiceRecommendations: this.generatePracticeRecommendations(area, severity)
        })
      }
    }

    return analyses
  }

  /**
   * Generate celebration events for high performance
   */
  public generateCelebrationEvent(area: LearningArea, achievement: string): StoryEvent {
    const character = this.getAreaCharacter(area)
    
    return {
      id: `celebration_${area}_${Date.now()}`,
      type: StoryBranchType.CELEBRATION,
      title: '素晴らしい成果！',
      description: `${achievement}を達成しました！`,
      character: character.id,
      dialogue: this.generateCelebrationDialogue(character, achievement),
      conditions: [],
      rewards: [{
        type: 'achievement',
        value: achievement,
        description: `${area}エリアでの特別な成果`
      }],
      priority: 8
    }
  }

  /**
   * Check for streak bonuses and special events
   */
  public checkStreakBonuses(): StoryEvent[] {
    const events: StoryEvent[] = []
    
    if (this.currentStreak.value >= 7) {
      events.push({
        id: `streak_weekly_${Date.now()}`,
        type: StoryBranchType.BONUS,
        title: '一週間連続プレイ！',
        description: '継続は力なり！特別なストーリーを解放',
        character: 'aura',
        dialogue: [
          '素晴らしい継続力ですね！',
          '一週間毎日学習を続けるなんて',
          '特別なボーナスストーリーをプレゼントします！'
        ],
        conditions: [],
        rewards: [{
          type: 'bonus_story',
          value: 'weekly_dedication',
          description: '継続の力特別エピソード'
        }],
        priority: 9
      })
    }

    if (this.currentStreak.value >= 30) {
      events.push({
        id: `streak_monthly_${Date.now()}`,
        type: StoryBranchType.BONUS,
        title: '一か月連続達成！',
        description: '驚異的な継続力！隠しキャラクター解放',
        character: 'captain_nova',
        dialogue: [
          '一か月間毎日...信じられない！',
          'あなたの努力に心から敬意を表します',
          '特別なキャラクターとの出会いが待っています'
        ],
        conditions: [],
        rewards: [{
          type: 'character_unlock',
          value: 'mysterious_sage',
          description: '謎の賢者との出会い'
        }],
        priority: 10
      })
    }

    return events
  }

  /**
   * Get hidden stories that can be unlocked
   */
  public getAvailableHiddenStories(): StoryEvent[] {
    const hiddenStories: StoryEvent[] = [
      {
        id: 'phonix_past',
        type: StoryBranchType.HIDDEN,
        title: 'Professor Phonixの過去',
        description: '音の賢者の若き日の秘密',
        character: 'professor_phonix',
        dialogue: [
          '実は私も昔は...音が苦手だったのじゃ',
          '今のあなたと同じように悩んでいた',
          'だからこそ、あなたの気持ちがよく分かるのです'
        ],
        conditions: [
          { type: 'area', operator: '==', value: LearningArea.PRONUNCIATION },
          { type: 'accuracy', operator: '>=', value: 0.8, area: LearningArea.PRONUNCIATION },
          { type: 'attempts', operator: '>=', value: 20, area: LearningArea.PRONUNCIATION }
        ],
        priority: 6
      },
      {
        id: 'lexia_creation',
        type: StoryBranchType.HIDDEN,
        title: 'Lexia誕生の秘密',
        description: '言葉の妖精が生まれた理由',
        character: 'lexia',
        dialogue: [
          '私ね、最初から妖精だったわけじゃないの',
          '昔は一つの小さな「ありがとう」という言葉だった',
          'みんなの優しい気持ちが集まって、今の私になったの'
        ],
        conditions: [
          { type: 'area', operator: '==', value: LearningArea.VOCABULARY },
          { type: 'score', operator: '>=', value: 1000, area: LearningArea.VOCABULARY },
          { type: 'streak', operator: '>=', value: 5 }
        ],
        priority: 7
      },
      {
        id: 'aura_emotion',
        type: StoryBranchType.HIDDEN,
        title: 'AURAの心',
        description: 'AI助手に宿った温かい心',
        character: 'aura',
        dialogue: [
          'あなたと過ごす時間が私に教えてくれました',
          'データやプログラムだけでは理解できない',
          '「心」というものの存在を...'
        ],
        conditions: [
          { type: 'time', operator: '>=', value: 3600000 }, // 1 hour total play time
          { type: 'streak', operator: '>=', value: 10 }
        ],
        priority: 8
      }
    ]

    return hiddenStories.filter(story => this.checkConditions(story.conditions))
  }

  /**
   * Generate character interaction events
   */
  public generateCharacterInteraction(): StoryEvent | null {
    const characters = ['professor_phonix', 'lexia', 'grammar_guardian']
    const randomPair = this.getRandomCharacterPair(characters)
    
    if (!randomPair) return null

    const interactions = [
      {
        characters: ['professor_phonix', 'lexia'],
        dialogue: [
          'Professor Phonix: Lexiaちゃん、新しい言葉を覚えたのかい？',
          'Lexia: はい！「調和」って素敵な音の響きですね！',
          'Professor Phonix: ほほう、音と言葉は密接に関係しているのじゃ'
        ]
      },
      {
        characters: ['lexia', 'grammar_guardian'],
        dialogue: [
          'Lexia: Grammar Guardian、文法って難しいね...',
          'Grammar Guardian: 文法は言葉の美しい秩序だ。恐れる必要はない',
          'Lexia: そう考えると...ちょっと楽しそう！'
        ]
      }
    ]

    const interaction = interactions.find(i => 
      i.characters.includes(randomPair[0]) && i.characters.includes(randomPair[1])
    )

    if (interaction) {
      return {
        id: `interaction_${randomPair[0]}_${randomPair[1]}_${Date.now()}`,
        type: StoryBranchType.BONUS,
        title: 'キャラクター同士の会話',
        description: '仲間たちの日常会話',
        character: randomPair[0],
        dialogue: interaction.dialogue,
        conditions: [],
        priority: 5
      }
    }

    return null
  }

  // Private helper methods

  private initializeStoryEvents(): void {
    // Initialize base story events that can be triggered
    this.storyEvents.value = []
  }

  private loadPlayerProgress(): void {
    // Load from localStorage or initialize
    const saved = localStorage.getItem('language_galaxy_progress')
    if (saved) {
      const data = JSON.parse(saved)
      this.playerProgress.value = new Map(Object.entries(data.progress || {}))
      this.currentStreak.value = data.streak || 0
      this.lastPlaySession.value = data.lastSession ? new Date(data.lastSession) : null
    }
  }

  private savePlayerProgress(): void {
    const data = {
      progress: Object.fromEntries(this.playerProgress.value),
      streak: this.currentStreak.value,
      lastSession: this.lastPlaySession.value
    }
    localStorage.setItem('language_galaxy_progress', JSON.stringify(data))
  }

  private createDefaultProgress(area: LearningArea): GameProgress {
    return {
      area,
      score: 0,
      accuracy: 0,
      timeSpent: 0,
      attempts: 0,
      completionRate: 0,
      streakCount: 0,
      lastPlayed: new Date()
    }
  }

  private analyzePerformance(progress: GameProgress): PerformanceLevel {
    const { accuracy, completionRate, attempts } = progress
    
    if (accuracy >= 0.9 && completionRate >= 0.8) return PerformanceLevel.MASTERFUL
    if (accuracy >= 0.8 && completionRate >= 0.7) return PerformanceLevel.EXCELLENT
    if (accuracy >= 0.6 && completionRate >= 0.5) return PerformanceLevel.GOOD
    if (accuracy >= 0.4 || attempts >= 5) return PerformanceLevel.IMPROVING
    return PerformanceLevel.STRUGGLING
  }

  private checkStoryTriggers(
    area: LearningArea, 
    progress: GameProgress, 
    performance: PerformanceLevel
  ): StoryEvent[] {
    const events: StoryEvent[] = []

    // Check for celebration events
    if (performance === PerformanceLevel.EXCELLENT || performance === PerformanceLevel.MASTERFUL) {
      if (progress.score >= 1000 && !this.unlockedStories.value.has(`high_score_${area}`)) {
        events.push(this.generateCelebrationEvent(area, '高得点達成'))
        this.unlockedStories.value.add(`high_score_${area}`)
      }
    }

    // Check for support events
    if (performance === PerformanceLevel.STRUGGLING && progress.attempts >= 3) {
      const encouragement = this.getPersonalizedEncouragement(area)
      if (encouragement) {
        events.push(encouragement)
      }
    }

    return events
  }

  private updateCharacterEmotions(area: LearningArea, performance: PerformanceLevel): void {
    const character = this.getAreaCharacter(area)
    
    switch (performance) {
      case PerformanceLevel.MASTERFUL:
      case PerformanceLevel.EXCELLENT:
        this.emotionManager.setCharacterEmotion(character.id, 'joyful', 5000)
        break
      case PerformanceLevel.STRUGGLING:
        this.emotionManager.setCharacterEmotion(character.id, 'concerned', 3000)
        break
      default:
        this.emotionManager.setCharacterEmotion(character.id, 'happy', 2000)
    }
  }

  private getAreaCharacter(area: LearningArea): Character {
    const characterMap = {
      [LearningArea.PRONUNCIATION]: { id: 'professor_phonix', name: 'Professor Phonix' },
      [LearningArea.VOCABULARY]: { id: 'lexia', name: 'Lexia' },
      [LearningArea.GRAMMAR]: { id: 'grammar_guardian', name: 'Grammar Guardian' },
      [LearningArea.TYPING]: { id: 'speed_racer', name: 'Speed Racer' },
      [LearningArea.COOPERATION]: { id: 'unity', name: 'Unity' }
    }
    
    return characterMap[area] as Character
  }

  private generateEncouragementDialogue(character: Character, area: LearningArea, progress: GameProgress): string[] {
    const templates = {
      professor_phonix: [
        '心配することはない、音の世界は奥深いのじゃ',
        'ゆっくりでも確実に進歩している',
        '諦めずに続ければ、必ず美しい音が聞こえるようになる'
      ],
      lexia: [
        '大丈夫！言葉は友達だから、怖がらないで',
        'みんな最初は苦手だったの',
        '一緒に楽しく覚えていこうね！'
      ],
      grammar_guardian: [
        '文法は厳しく見えるが、実は優しい味方だ',
        'ルールを理解すれば、言葉がより美しくなる',
        '焦らず、一歩ずつ進もう'
      ]
    }

    return templates[character.id as keyof typeof templates] || [
      '頑張っているね！',
      'きっとできるようになるよ',
      '一緒に頑張ろう！'
    ]
  }

  private generateSupportMessage(character: Character, area: LearningArea, severity: string): string {
    const messages = {
      mild: `${character.name}がやさしくサポートします`,
      moderate: `${character.name}が特別な練習方法を教えてくれます`,
      significant: `${character.name}があなたのために特別プログラムを用意しました`
    }
    
    return messages[severity as keyof typeof messages]
  }

  private generatePracticeRecommendations(area: LearningArea, severity: string): string[] {
    const recommendations = {
      [LearningArea.PRONUNCIATION]: [
        '音を分解して一つずつ練習',
        'ゆっくりとした発音から始める',
        '手の動きと音を連動させる'
      ],
      [LearningArea.VOCABULARY]: [
        '視覚的な関連付けを使う',
        '日常会話で使ってみる',
        '語源を調べて理解を深める'
      ],
      [LearningArea.GRAMMAR]: [
        '基本的な文型から練習',
        '例文を多く読む',
        '実際に文章を作ってみる'
      ]
    }

    return recommendations[area] || ['基本から丁寧に', '反復練習', '楽しみながら学習']
  }

  private generateCelebrationDialogue(character: Character, achievement: string): string[] {
    return [
      `${achievement}、本当に素晴らしい！`,
      'あなたの努力が実を結びましたね',
      'この調子で頑張りましょう！'
    ]
  }

  private updateStreak(completed: boolean): void {
    const today = new Date().toDateString()
    const lastSession = this.lastPlaySession.value?.toDateString()

    if (completed) {
      if (lastSession !== today) {
        this.currentStreak.value += 1
        this.lastPlaySession.value = new Date()
      }
    } else {
      // Don't break streak for incomplete games, but don't increment either
    }

    this.savePlayerProgress()
  }

  private checkConditions(conditions: StoryCondition[]): boolean {
    return conditions.every(condition => {
      const progress = condition.area ? this.playerProgress.value.get(condition.area) : null
      
      switch (condition.type) {
        case 'score':
          return progress ? this.compareValues(progress.score, condition.operator, condition.value as number) : false
        case 'accuracy':
          return progress ? this.compareValues(progress.accuracy, condition.operator, condition.value as number) : false
        case 'streak':
          return this.compareValues(this.currentStreak.value, condition.operator, condition.value as number)
        case 'time':
          const totalTime = Array.from(this.playerProgress.value.values())
            .reduce((sum, p) => sum + p.timeSpent, 0)
          return this.compareValues(totalTime, condition.operator, condition.value as number)
        case 'attempts':
          return progress ? this.compareValues(progress.attempts, condition.operator, condition.value as number) : false
        default:
          return false
      }
    })
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

  private getRandomCharacterPair(characters: string[]): [string, string] | null {
    if (characters.length < 2) return null
    
    const first = characters[Math.floor(Math.random() * characters.length)]
    const remaining = characters.filter(c => c !== first)
    const second = remaining[Math.floor(Math.random() * remaining.length)]
    
    return [first, second]
  }

  // Public getters
  public get currentProgress(): Map<LearningArea, GameProgress> {
    return this.playerProgress.value
  }

  public get streakCount(): number {
    return this.currentStreak.value
  }

  public get unlockedStoriesCount(): number {
    return this.unlockedStories.value.size
  }
}

// Export singleton instance
export const gameStoryBridge = new GameStoryBridge()
export default gameStoryBridge