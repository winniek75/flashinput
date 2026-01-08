import logger from '@/utils/logger'

import type { 
  ECHOResponse, 
  ConversationTurn, 
  VRScenario, 
  UserProfile,
  ECHOEmotion,
  ConversationFeedback,
  AIEngineConfig
} from '@/types/ai-practice'

export class ECHOConversationEngine {
  private config: AIEngineConfig
  private userProfile: UserProfile
  private conversationContext: Map<string, any> = new Map()
  
  constructor(config: AIEngineConfig, userProfile: UserProfile) {
    this.config = config
    this.userProfile = userProfile
  }

  async generateResponse(
    userInput: string,
    scenario: VRScenario,
    conversationHistory: ConversationTurn[]
  ): Promise<ECHOResponse> {
    try {
      const analysis = await this.analyzeUserInput(userInput, conversationHistory)
      const emotion = this.determineEmotion(analysis)
      const response = await this.craftResponse(userInput, scenario, analysis, emotion)
      
      return response
    } catch (error) {
      logger.error('Error generating ECHO response:', error)
      return this.getFallbackResponse()
    }
  }

  private async analyzeUserInput(
    input: string,
    history: ConversationTurn[]
  ): Promise<{
    sentiment: number
    confidence: number
    errors: string[]
    intent: string
  }> {
    const sentiment = this.analyzeSentiment(input)
    const confidence = this.detectConfidence(input, history)
    const errors = this.detectErrors(input)
    const intent = this.detectIntent(input)

    return { sentiment, confidence, errors, intent }
  }

  private analyzeSentiment(input: string): number {
    const positiveWords = ['good', 'great', 'yes', 'sure', 'okay', 'thank']
    const negativeWords = ['no', 'sorry', 'difficult', 'hard', 'confused', "don't"]
    
    let score = 0
    const lowerInput = input.toLowerCase()
    
    positiveWords.forEach(word => {
      if (lowerInput.includes(word)) score += 0.2
    })
    
    negativeWords.forEach(word => {
      if (lowerInput.includes(word)) score -= 0.2
    })
    
    return Math.max(-1, Math.min(1, score))
  }

  private detectConfidence(input: string, history: ConversationTurn[]): number {
    let confidence = 0.5
    
    if (input.includes('?')) confidence -= 0.1
    if (input.includes('...')) confidence -= 0.15
    if (input.includes('um') || input.includes('uh')) confidence -= 0.1
    if (input.length < 10) confidence -= 0.1
    if (input.length > 50) confidence += 0.2
    
    const hesitationPhrases = ['I think', 'maybe', 'perhaps', 'not sure']
    hesitationPhrases.forEach(phrase => {
      if (input.toLowerCase().includes(phrase)) confidence -= 0.1
    })
    
    return Math.max(0, Math.min(1, confidence))
  }

  private detectErrors(input: string): string[] {
    const errors: string[] = []
    
    // Grammar errors
    if (!/^[A-Z]/.test(input.trim()) && input.trim().length > 0) {
      errors.push('Remember to start sentences with a capital letter')
    }
    
    if (input.includes(' dont ') || input.includes(' doesnt ') || input.includes(' cant ') || input.includes(' wont ')) {
      errors.push('Contractions need apostrophes: don\'t, doesn\'t, can\'t, won\'t')
    }
    
    if (input.includes(' your welcome')) {
      errors.push('It should be "you\'re welcome" (you are) not "your welcome"')
    }
    
    if (input.includes(' there house') || input.includes(' there car')) {
      errors.push('Use "their" for possession, not "there"')
    }
    
    if (input.includes(' to much') || input.includes(' to many')) {
      errors.push('Use "too much" or "too many" when meaning "excessive"')
    }
    
    // Common speaking errors
    if (input.includes(' me and ')) {
      errors.push('Try "[Name] and I" instead of "me and [Name]" when you\'re the subject')
    }
    
    if (input.includes(' good') && (input.includes(' very good') || input.includes(' really good'))) {
      errors.push('Try "well" instead of "good" when describing how you do something')
    }
    
    // Missing articles
    if (input.match(/\b(want|need|have)\s+(book|car|house|job)\b/) && !input.match(/\b(a|an|the)\s+(book|car|house|job)\b/)) {
      errors.push('Don\'t forget articles: "a", "an", or "the" before nouns')
    }
    
    return errors
  }

  private detectIntent(input: string): string {
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('order') || lowerInput.includes('menu')) {
      return 'ordering'
    } else if (lowerInput.includes('check') || lowerInput.includes('room')) {
      return 'accommodation'
    } else if (lowerInput.includes('buy') || lowerInput.includes('price')) {
      return 'shopping'
    } else if (lowerInput.includes('help') || lowerInput.includes('?')) {
      return 'question'
    } else {
      return 'general'
    }
  }

  private determineEmotion(analysis: any): ECHOEmotion {
    if (analysis.confidence < 0.3) {
      return 'encouraging'
    } else if (analysis.errors.length > 2) {
      return 'thinking'
    } else if (analysis.sentiment > 0.5) {
      return 'happy'
    } else if (analysis.intent === 'question') {
      return 'surprised'
    } else {
      return 'normal'
    }
  }

  private async craftResponse(
    userInput: string,
    scenario: VRScenario,
    analysis: any,
    emotion: ECHOEmotion
  ): Promise<ECHOResponse> {
    const response: ECHOResponse = {
      message: '',
      emotion,
      hints: [],
      corrections: [],
      encouragement: '',
      nextPrompt: '',
      culturalTip: ''
    }

    if (analysis.confidence < 0.4 && this.config.anxietyReduction) {
      response.encouragement = this.getEncouragementMessage(analysis.confidence)
    }

    response.message = this.generateContextualResponse(userInput, scenario, analysis)
    
    if (analysis.errors.length > 0) {
      response.corrections = analysis.errors.slice(0, 2)
      // Add verbal correction to the response
      if (analysis.errors.length === 1) {
        response.message += ` By the way, ${analysis.errors[0]}.`
      } else if (analysis.errors.length > 1) {
        response.message += ` Just a quick tip: ${analysis.errors[0]}.`
      }
    }

    if (scenario.culturalNotes && Math.random() > 0.7) {
      response.culturalTip = scenario.culturalNotes[
        Math.floor(Math.random() * scenario.culturalNotes.length)
      ]
    }

    response.hints = this.generateHints(scenario, analysis.intent)
    response.nextPrompt = this.generateNextPrompt(scenario, analysis.intent)

    return response
  }

  private getEncouragementMessage(confidence: number): string {
    const messages = [
      "よくできました！頑張っていますね！🌟",
      "大丈夫です！間違いも学習の一部ですよ！",
      "一緒に練習しましょう！ECHOがサポートします！",
      "その調子です！どんどん上達していますね！",
      "勇気を出して話してください！きっとできます！"
    ]
    
    return messages[Math.floor(Math.random() * messages.length)]
  }

  private generateContextualResponse(
    userInput: string,
    scenario: VRScenario,
    analysis: any
  ): string {
    const input = userInput.toLowerCase().trim()
    
    // Greetings
    if (input.includes('hello') || input.includes('hi') || input.includes('good morning') || input.includes('good afternoon')) {
      const greetings = scenario.type === 'restaurant' 
        ? ["Hello! Welcome to our restaurant. Here's your table. May I start you with something to drink?", "Good evening! I'm your server tonight. Have you had a chance to look at our menu?"]
        : scenario.type === 'hotel'
        ? ["Hello! Welcome to our hotel. How may I assist you today?", "Good afternoon! Are you checking in with us today?"]
        : ["Hello! Welcome to our store. Is there anything specific you're looking for today?", "Hi there! Feel free to browse around. Let me know if you need any help."]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }
    
    // Restaurant responses
    if (scenario.type === 'restaurant') {
      if (input.includes('order') || input.includes('would like') || input.includes('want') || input.includes('have')) {
        if (input.includes('pizza')) return "Great choice! Would you like our margherita or pepperoni pizza? And what size would you prefer?"
        if (input.includes('burger')) return "Excellent! Our burgers come with fries. Would you like cheese on that? And how would you like it cooked?"
        if (input.includes('salad')) return "Perfect! We have Caesar salad and garden salad. Which one would you prefer? Any dressing?"
        if (input.includes('drink') || input.includes('water') || input.includes('soda')) return "Of course! We have water, sodas, and fresh juices. What would you like to drink?"
        return "Wonderful! Let me get that started for you. Anything else I can bring you today?"
      }
      if (input.includes('menu') || input.includes('recommend')) return "I'd be happy to recommend something! Our chef's special today is grilled salmon with vegetables. Very popular!"
      if (input.includes('check') || input.includes('bill') || input.includes('pay')) return "Certainly! I'll bring your check right away. Did you enjoy everything tonight?"
      if (input.includes('bathroom') || input.includes('restroom')) return "Of course! The restrooms are just past the bar area, on your left."
    }
    
    // Hotel responses
    if (scenario.type === 'hotel') {
      if (input.includes('check in') || input.includes('reservation') || input.includes('room')) {
        return "Perfect! May I have your name and confirmation number? I'll get you checked in right away."
      }
      if (input.includes('wifi') || input.includes('internet')) return "Our WiFi password is 'HotelGuest2024'. You should see our network listed as 'Hotel-WiFi'."
      if (input.includes('breakfast') || input.includes('restaurant')) return "Breakfast is served from 6:30 to 10:30 AM in our dining room on the first floor. It's included with your stay!"
      if (input.includes('pool') || input.includes('gym')) return "Our pool and fitness center are on the 2nd floor, open 24 hours. You'll need your room key to access them."
      if (input.includes('checkout')) return "Checkout time is 11 AM. Would you like me to arrange a late checkout for you?"
    }
    
    // Shopping responses
    if (scenario.type === 'shopping') {
      if (input.includes('looking for') || input.includes('need') || input.includes('want')) {
        if (input.includes('shirt') || input.includes('top')) return "Great! What size are you looking for? We have some beautiful new arrivals in the clothing section."
        if (input.includes('dress')) return "Perfect timing! We just got our new spring collection. What size and color are you interested in?"
        if (input.includes('shoes')) return "Wonderful! Our shoe department is right over here. What size do you wear?"
        return "I'd be happy to help you find that! What size are you looking for?"
      }
      if (input.includes('try on') || input.includes('fitting')) return "Absolutely! The fitting rooms are right behind me. I'll get you set up with a room."
      if (input.includes('price') || input.includes('cost') || input.includes('much')) return "That item is on sale today for $29.99. We also have a 20% off promotion running this week!"
      if (input.includes('size')) return "What size are you looking for? We have sizes from XS to XXL in stock."
    }
    
    // Thank you responses
    if (input.includes('thank') || input.includes('thanks')) {
      return "You're very welcome! Is there anything else I can help you with today?"
    }
    
    // Questions
    if (input.includes('?') || input.includes('how') || input.includes('what') || input.includes('where') || input.includes('when')) {
      return "That's a great question! Let me help you with that information."
    }
    
    // Default contextual responses
    const contextResponses = scenario.type === 'restaurant'
      ? ["Absolutely! Let me take care of that for you.", "Of course! I'll make sure that's perfect for you.", "Great choice! Anything else I can get started for you?"]
      : scenario.type === 'hotel' 
      ? ["I'd be happy to help you with that!", "Certainly! Let me check on that for you.", "Of course! I'll take care of that right away."]
      : ["Perfect! Let me help you find exactly what you're looking for.", "That sounds great! I can definitely help you with that.", "Wonderful! Let me show you what we have."]
    
    return contextResponses[Math.floor(Math.random() * contextResponses.length)]
  }

  private generateHints(scenario: VRScenario, intent: string): string[] {
    const hints: string[] = []
    
    if (scenario.type === 'restaurant' && intent === 'ordering') {
      hints.push("「I would like...」（アイ ウッド ライク）= 〜を ください")
      hints.push("「please」（プリーズ）を わすれずに！")
      hints.push("れい: I would like pizza, please! 🍕")
    } else if (scenario.type === 'hotel' && intent === 'accommodation') {
      hints.push("「I have a reservation」（アイ ハブ ア リザベーション）= よやくが あります")
      hints.push("「My name is...」（マイ ネーム イズ）= わたしの なまえは...")
    } else if (scenario.type === 'shopping') {
      hints.push("「How much is this?」（ハウ マッチ イズ ディス）= これは いくらですか？")
      hints.push("「Can I try this on?」（キャン アイ トライ ディス オン）= しちゃくしても いいですか？")
    }
    
    return hints
  }

  private generateNextPrompt(scenario: VRScenario, intent: string): string {
    const prompts: Record<string, string> = {
      ordering: "Would you like anything to drink with that?",
      accommodation: "May I have your name and booking reference?",
      shopping: "Are you looking for anything specific today?",
      question: "Is there anything else I can help clarify?",
      general: "What would you like to do next?"
    }
    
    return prompts[intent] || prompts.general
  }

  private getFallbackResponse(): ECHOResponse {
    return {
      message: "いっしょに れんしゅうしよう！なにを したいか おしえてね！",
      emotion: 'encouraging',
      hints: ["ゆっくりで いいよ", "エコーが てつだうよ"],
      encouragement: "がんばってるね！いっしょに れんしゅうを つづけよう！"
    }
  }

  async provideFeedback(
    conversationTurn: ConversationTurn
  ): Promise<ConversationFeedback> {
    const feedback: ConversationFeedback = {
      type: 'fluency',
      level: 'good',
      message: '',
      suggestions: [],
      confidence: 0.8
    }

    const errors = this.detectErrors(conversationTurn.message)
    
    if (errors.length === 0) {
      feedback.level = 'excellent'
      feedback.message = 'Perfect! Your English is very natural!'
    } else if (errors.length <= 2) {
      feedback.level = 'good'
      feedback.message = 'Good job! Just a few small things to note.'
      feedback.suggestions = errors
    } else {
      feedback.level = 'needsWork'
      feedback.message = "Let's work on these areas together."
      feedback.suggestions = errors.slice(0, 3)
    }

    return feedback
  }

  updateUserProfile(profile: UserProfile): void {
    this.userProfile = profile
  }

  updateConfig(config: Partial<AIEngineConfig>): void {
    this.config = { ...this.config, ...config }
  }
}