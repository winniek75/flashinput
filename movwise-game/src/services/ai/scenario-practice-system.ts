import type {
  VRScenario,
  PracticeSession,
  ConversationTurn,
  WeaknessAnalysis,
  ProgressMetrics,
  PerformanceMetrics,
  ScenarioContext
} from '@/types/ai-practice'
import { ECHOConversationEngine } from './echo-conversation-engine'

export class ScenarioPracticeSystem {
  private scenarios: Map<string, VRScenario> = new Map()
  private activeSessions: Map<string, PracticeSession> = new Map()
  private conversationEngine: ECHOConversationEngine

  constructor(conversationEngine: ECHOConversationEngine) {
    this.conversationEngine = conversationEngine
    this.initializeScenarios()
  }

  private initializeScenarios(): void {
    const scenarios: VRScenario[] = [
      {
        id: 'restaurant-beginner',
        type: 'restaurant',
        title: 'レストランで注文',
        description: 'レストランで食べ物や飲み物を注文する練習',
        difficulty: 'beginner',
        culturalNotes: [
          '海外のレストランではチップを支払います',
          '注文するとき目を見て話しましょう',
          'Please（プリーズ）とThank you（サンキュー）をたくさん使いましょう'
        ],
        objectives: [
          '食べ物を注文する',
          'メニューについて質問する',
          'お会計をお願いする'
        ],
        estimatedDuration: 10
      },
      {
        id: 'hotel-beginner',
        type: 'hotel',
        title: 'ホテルにチェックイン',
        description: 'ホテルに泊まるときの英語を練習',
        difficulty: 'beginner',
        culturalNotes: [
          'パスポートとクレジットカードを用意しましょう',
          'ホテルの設備について質問しても大丈夫',
          'スタッフに笑顔で挨拶しましょう'
        ],
        objectives: [
          'チェックインをする',
          'WiFi（ワイファイ）と朝食について聞く',
          '部屋の鍵をもらう'
        ],
        estimatedDuration: 8
      },
      {
        id: 'shopping-beginner',
        type: 'shopping',
        title: 'お買い物',
        description: '洋服を買うときの英語を練習',
        difficulty: 'beginner',
        culturalNotes: [
          '見るだけでも大丈夫です',
          '店員さんが声をかけてきたら"Just looking"（ジャスト ルッキング）と言いましょう',
          'サイズが日本と違うことがあります'
        ],
        objectives: [
          'サイズを聞く',
          '試着をする',
          'お買い物をする'
        ],
        estimatedDuration: 12
      },
      {
        id: 'restaurant-intermediate',
        type: 'restaurant',
        title: 'Fine Dining Experience',
        description: 'Navigate a formal dining experience with multiple courses',
        difficulty: 'intermediate',
        culturalNotes: [
          'Wait to be seated',
          'Napkin goes on your lap',
          'Use utensils from outside in'
        ],
        objectives: [
          'Make a reservation',
          'Order multiple courses',
          'Handle special requests'
        ],
        estimatedDuration: 15
      },
      {
        id: 'business-advanced',
        type: 'business',
        title: 'Business Meeting Introduction',
        description: 'Practice professional introductions and small talk',
        difficulty: 'advanced',
        culturalNotes: [
          'Firm handshake is important',
          'Business cards are exchanged casually, not with both hands',
          'Small talk before business is common'
        ],
        objectives: [
          'Introduce yourself professionally',
          'Exchange business cards appropriately',
          'Engage in small talk'
        ],
        estimatedDuration: 20
      }
    ]

    scenarios.forEach(scenario => {
      this.scenarios.set(scenario.id, scenario)
    })
  }

  async startPracticeSession(
    userId: string,
    scenarioId: string
  ): Promise<PracticeSession> {
    const scenario = this.scenarios.get(scenarioId)
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`)
    }

    const session: PracticeSession = {
      id: `session-${Date.now()}`,
      userId,
      scenario,
      startTime: new Date(),
      conversationHistory: [],
      overallScore: 0,
      weaknessAnalysis: this.createEmptyWeaknessAnalysis(),
      progressMetrics: this.createEmptyProgressMetrics(),
      status: 'active'
    }

    this.activeSessions.set(session.id, session)

    const welcomeTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      speaker: 'echo',
      message: this.getScenarioIntroduction(scenario),
      timestamp: new Date(),
      emotion: 'happy'
    }
    session.conversationHistory.push(welcomeTurn)

    return session
  }

  private getScenarioIntroduction(scenario: VRScenario): string {
    const introductions: Record<string, string> = {
      'restaurant-beginner': "Hello! Welcome to Friendly Fork restaurant! I'm your server today. Have you had a chance to look at our menu yet?",
      'hotel-beginner': "Good afternoon! Welcome to Comfort Inn. How may I help you today? Are you checking in?",
      'shopping-beginner': "Hello! Welcome to Fashion Forward! Is there anything specific you're looking for today?",
      'restaurant-intermediate': "Good evening! Welcome to Le Jardin. Do you have a reservation with us tonight?",
      'business-advanced': "Hello! You must be here for the 2 o'clock meeting. I'm Sarah from Marketing. Nice to meet you!"
    }

    return introductions[scenario.id] || "Hello! I'm ECHO, your conversation practice partner. Let's start practicing together!"
  }

  async processUserInput(
    sessionId: string,
    userInput: string
  ): Promise<ConversationTurn> {
    const session = this.activeSessions.get(sessionId)
    if (!session || session.status !== 'active') {
      throw new Error('Session not found or inactive')
    }

    const userTurn: ConversationTurn = {
      id: `turn-${Date.now()}`,
      speaker: 'user',
      message: userInput,
      timestamp: new Date()
    }
    session.conversationHistory.push(userTurn)

    const echoResponse = await this.conversationEngine.generateResponse(
      userInput,
      session.scenario,
      session.conversationHistory
    )

    const feedback = await this.conversationEngine.provideFeedback(userTurn)
    userTurn.feedback = feedback

    const echoTurn: ConversationTurn = {
      id: `turn-${Date.now() + 1}`,
      speaker: 'echo',
      message: echoResponse.message,
      timestamp: new Date(),
      emotion: echoResponse.emotion
    }
    session.conversationHistory.push(echoTurn)

    this.updateSessionMetrics(session, feedback)

    return echoTurn
  }

  private updateSessionMetrics(session: PracticeSession, feedback: any): void {
    const score = feedback.level === 'excellent' ? 1 : 
                  feedback.level === 'good' ? 0.7 : 0.4
    
    const turnCount = session.conversationHistory.filter(t => t.speaker === 'user').length
    session.overallScore = ((session.overallScore * (turnCount - 1)) + score) / turnCount
  }

  async endSession(sessionId: string): Promise<PracticeSession> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    session.endTime = new Date()
    session.status = 'completed'
    session.weaknessAnalysis = await this.analyzeWeaknesses(session)
    session.progressMetrics = this.calculateProgressMetrics(session)

    this.activeSessions.delete(sessionId)

    return session
  }

  private async analyzeWeaknesses(session: PracticeSession): Promise<WeaknessAnalysis> {
    const userTurns = session.conversationHistory.filter(t => t.speaker === 'user')
    
    const analysis: WeaknessAnalysis = {
      pronunciation: {
        score: 0.75,
        issues: [],
        improvements: ['Practice rhythm and intonation'],
        exerciseRecommendations: ['Listen and repeat exercises', 'Shadowing practice']
      },
      grammar: {
        score: 0,
        issues: [],
        improvements: [],
        exerciseRecommendations: []
      },
      vocabulary: {
        score: 0,
        issues: [],
        improvements: [],
        exerciseRecommendations: []
      },
      fluency: {
        score: 0,
        issues: [],
        improvements: [],
        exerciseRecommendations: []
      },
      culturalAwareness: {
        score: 0.8,
        issues: [],
        improvements: ['Remember to use polite phrases more frequently'],
        exerciseRecommendations: ['Cultural etiquette videos']
      }
    }

    let grammarErrors = 0
    let vocabularyIssues = 0
    let fluencyScore = 0

    userTurns.forEach(turn => {
      if (turn.feedback) {
        if (turn.feedback.type === 'grammar') grammarErrors++
        if (turn.feedback.type === 'vocabulary') vocabularyIssues++
        fluencyScore += turn.feedback.level === 'excellent' ? 1 : 
                       turn.feedback.level === 'good' ? 0.7 : 0.4
      }
    })

    analysis.grammar.score = Math.max(0, 1 - (grammarErrors / userTurns.length))
    analysis.vocabulary.score = Math.max(0, 1 - (vocabularyIssues / userTurns.length))
    analysis.fluency.score = fluencyScore / userTurns.length

    if (analysis.grammar.score < 0.7) {
      analysis.grammar.issues = ['Sentence structure needs work', 'Tense consistency']
      analysis.grammar.improvements = ['Review basic grammar patterns']
      analysis.grammar.exerciseRecommendations = ['Grammar worksheets', 'Pattern practice']
    }

    return analysis
  }

  private calculateProgressMetrics(session: PracticeSession): ProgressMetrics {
    const duration = session.endTime ? 
      (session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60 : 0

    return {
      totalPracticeTime: duration,
      sessionsCompleted: 1,
      averageScore: session.overallScore,
      improvementRate: 0.05,
      streakDays: 1,
      confidenceLevel: session.overallScore * 0.8 + 0.2
    }
  }

  private createEmptyWeaknessAnalysis(): WeaknessAnalysis {
    const emptySkill = {
      score: 0,
      issues: [],
      improvements: [],
      exerciseRecommendations: []
    }

    return {
      pronunciation: { ...emptySkill },
      grammar: { ...emptySkill },
      vocabulary: { ...emptySkill },
      fluency: { ...emptySkill },
      culturalAwareness: { ...emptySkill }
    }
  }

  private createEmptyProgressMetrics(): ProgressMetrics {
    return {
      totalPracticeTime: 0,
      sessionsCompleted: 0,
      averageScore: 0,
      improvementRate: 0,
      streakDays: 0,
      confidenceLevel: 0
    }
  }

  getScenario(id: string): VRScenario | undefined {
    return this.scenarios.get(id)
  }

  getAllScenarios(): VRScenario[] {
    return Array.from(this.scenarios.values())
  }

  getScenariosByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): VRScenario[] {
    return Array.from(this.scenarios.values()).filter(s => s.difficulty === difficulty)
  }

  getScenariosByType(type: string): VRScenario[] {
    return Array.from(this.scenarios.values()).filter(s => s.type === type)
  }

  getActiveSession(sessionId: string): PracticeSession | undefined {
    return this.activeSessions.get(sessionId)
  }
}