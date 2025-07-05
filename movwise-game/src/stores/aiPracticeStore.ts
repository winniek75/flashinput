import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PracticeSession,
  VRScenario,
  UserProfile,
  ECHOCharacter,
  ConversationTurn,
  ProgressMetrics,
  WeaknessAnalysis,
  AIEngineConfig
} from '@/types/ai-practice'
import { ECHOConversationEngine } from '@/services/ai/echo-conversation-engine'
import { ScenarioPracticeSystem } from '@/services/ai/scenario-practice-system'

export const useAIPracticeStore = defineStore('aiPractice', () => {
  // State
  const userProfile = ref<UserProfile>({
    id: '',
    nativeLanguage: 'Japanese',
    targetLanguage: 'English',
    proficiencyLevel: 'A2',
    learningGoals: ['conversation', 'business', 'travel'],
    culturalBackground: 'Japanese',
    anxietyLevel: 0.7,
    preferredPracticeTime: 15,
    weaknesses: ['pronunciation', 'fluency'],
    strengths: ['grammar', 'vocabulary']
  })

  const echoCharacter = ref<ECHOCharacter>({
    id: 'echo-001',
    name: 'ECHO',
    emotion: 'normal',
    encouragementLevel: 70,
    eyeColor: '#00BFFF',
    cheekBlushOpacity: 0,
    animationState: {
      isBlinking: false,
      headTilt: 0,
      armPosition: 'rest',
      isSpeaking: false
    }
  })

  const aiEngineConfig = ref<AIEngineConfig>({
    responseDelay: 1000,
    encouragementThreshold: 0.6,
    correctionStyle: 'gentle',
    culturalSensitivity: true,
    anxietyReduction: true,
    gamificationLevel: 0.8
  })

  const currentSession = ref<PracticeSession | null>(null)
  const sessionHistory = ref<PracticeSession[]>([])
  const availableScenarios = ref<VRScenario[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Services
  let conversationEngine: ECHOConversationEngine | null = null
  let practiceSystem: ScenarioPracticeSystem | null = null

  // Computed
  const isSessionActive = computed(() => currentSession.value?.status === 'active')
  
  const totalPracticeTime = computed(() => {
    return sessionHistory.value.reduce((total, session) => {
      if (session.progressMetrics) {
        return total + session.progressMetrics.totalPracticeTime
      }
      return total
    }, 0)
  })

  const averageSessionScore = computed(() => {
    const completedSessions = sessionHistory.value.filter(s => s.status === 'completed')
    if (completedSessions.length === 0) return 0
    
    const totalScore = completedSessions.reduce((sum, session) => sum + session.overallScore, 0)
    return totalScore / completedSessions.length
  })

  const weaknesssSummary = computed(() => {
    const summary: Record<string, number> = {
      pronunciation: 0,
      grammar: 0,
      vocabulary: 0,
      fluency: 0,
      culturalAwareness: 0
    }

    const completedSessions = sessionHistory.value.filter(s => s.status === 'completed')
    if (completedSessions.length === 0) return summary

    completedSessions.forEach(session => {
      if (session.weaknessAnalysis) {
        Object.keys(summary).forEach(skill => {
          summary[skill] += session.weaknessAnalysis[skill as keyof WeaknessAnalysis].score
        })
      }
    })

    Object.keys(summary).forEach(skill => {
      summary[skill] = summary[skill] / completedSessions.length
    })

    return summary
  })

  // Actions
  const initializeServices = () => {
    if (!conversationEngine) {
      conversationEngine = new ECHOConversationEngine(aiEngineConfig.value, userProfile.value)
    }
    if (!practiceSystem) {
      practiceSystem = new ScenarioPracticeSystem(conversationEngine)
      availableScenarios.value = practiceSystem.getAllScenarios()
    }
  }

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    userProfile.value = { ...userProfile.value, ...profile }
    if (conversationEngine) {
      conversationEngine.updateUserProfile(userProfile.value)
    }
  }

  const updateAIConfig = (config: Partial<AIEngineConfig>) => {
    aiEngineConfig.value = { ...aiEngineConfig.value, ...config }
    if (conversationEngine) {
      conversationEngine.updateConfig(config)
    }
  }

  const startPracticeSession = async (scenarioId: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      initializeServices()
      
      if (!practiceSystem) {
        throw new Error('Practice system not initialized')
      }

      const session = await practiceSystem.startPracticeSession(
        userProfile.value.id,
        scenarioId
      )
      
      currentSession.value = session
      updateECHOEmotion('happy')
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to start practice session'
      console.error('Error starting practice session:', e)
    } finally {
      isLoading.value = false
    }
  }

  const sendUserMessage = async (message: string) => {
    if (!currentSession.value || !practiceSystem) return

    try {
      isLoading.value = true
      echoCharacter.value.animationState.isSpeaking = false
      
      const response = await practiceSystem.processUserInput(
        currentSession.value.id,
        message
      )
      
      if (response.emotion) {
        updateECHOEmotion(response.emotion)
      }
      
      echoCharacter.value.animationState.isSpeaking = true
      
      setTimeout(() => {
        echoCharacter.value.animationState.isSpeaking = false
      }, 2000)
      
      if (response.feedback && response.feedback.level === 'excellent') {
        echoCharacter.value.encouragementLevel = Math.min(100, echoCharacter.value.encouragementLevel + 5)
        echoCharacter.value.cheekBlushOpacity = 0.3
        setTimeout(() => {
          echoCharacter.value.cheekBlushOpacity = 0
        }, 2000)
      }
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to send message'
      console.error('Error sending message:', e)
    } finally {
      isLoading.value = false
    }
  }

  const endCurrentSession = async () => {
    if (!currentSession.value || !practiceSystem) return

    try {
      isLoading.value = true
      
      const completedSession = await practiceSystem.endSession(currentSession.value.id)
      sessionHistory.value.push(completedSession)
      currentSession.value = null
      
      updateECHOEmotion('normal')
      
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to end session'
      console.error('Error ending session:', e)
    } finally {
      isLoading.value = false
    }
  }

  const updateECHOEmotion = (emotion: ECHOCharacter['emotion']) => {
    echoCharacter.value.emotion = emotion
    
    switch (emotion) {
      case 'happy':
        echoCharacter.value.eyeColor = '#00E5FF'
        echoCharacter.value.animationState.headTilt = -5
        break
      case 'encouraging':
        echoCharacter.value.eyeColor = '#00BFFF'
        echoCharacter.value.animationState.headTilt = 5
        break
      case 'thinking':
        echoCharacter.value.eyeColor = '#0099CC'
        echoCharacter.value.animationState.headTilt = 10
        break
      case 'surprised':
        echoCharacter.value.eyeColor = '#33CCFF'
        echoCharacter.value.animationState.headTilt = -3
        break
      default:
        echoCharacter.value.eyeColor = '#00BFFF'
        echoCharacter.value.animationState.headTilt = 0
    }
  }

  const getScenariosByDifficulty = (difficulty: VRScenario['difficulty']) => {
    if (!practiceSystem) {
      initializeServices()
    }
    return practiceSystem?.getScenariosByDifficulty(difficulty) || []
  }

  const getRecommendedScenarios = () => {
    const proficiencyMap = {
      'A1': 'beginner',
      'A2': 'beginner',
      'B1': 'intermediate',
      'B2': 'intermediate',
      'C1': 'advanced',
      'C2': 'advanced'
    }
    
    const recommendedDifficulty = proficiencyMap[userProfile.value.proficiencyLevel] as VRScenario['difficulty']
    return getScenariosByDifficulty(recommendedDifficulty)
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    userProfile,
    echoCharacter,
    aiEngineConfig,
    currentSession,
    sessionHistory,
    availableScenarios,
    isLoading,
    error,
    
    // Computed
    isSessionActive,
    totalPracticeTime,
    averageSessionScore,
    weaknesssSummary,
    
    // Actions
    initializeServices,
    updateUserProfile,
    updateAIConfig,
    startPracticeSession,
    sendUserMessage,
    endCurrentSession,
    updateECHOEmotion,
    getScenariosByDifficulty,
    getRecommendedScenarios,
    clearError
  }
})