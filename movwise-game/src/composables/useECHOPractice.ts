import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIPracticeStore } from '@/stores/aiPracticeStore'
import type { VRScenario } from '@/types/ai-practice'
import logger from '@/utils/logger'

export function useECHOPractice() {
  const aiPracticeStore = useAIPracticeStore()
  const {
    currentSession,
    echoCharacter,
    isLoading,
    error,
    isSessionActive,
    userProfile
  } = storeToRefs(aiPracticeStore)

  // Local state
  const userInput = ref('')
  const isRecording = ref(false)
  const showHints = ref(false)
  const selectedScenarioId = ref<string | null>(null)
  const conversationScrollContainer = ref<HTMLElement | null>(null)

  // Voice recognition
  const speechRecognition = ref<any>(null)
  const isListening = ref(false)
  const speechSupported = ref(false)
  const isSpeaking = ref(false)
  const lastError = ref<string | null>(null)

  // Performance monitoring
  const performanceStats = ref({
    animationFrameRate: 60,
    renderTime: 16.67,
    memoryUsage: 0,
    speechLatency: 0,
    recognitionAccuracy: 0,
    frameDropCount: 0,
    lastMeasurement: new Date()
  })

  // Computed
  const currentScenario = computed(() => {
    return currentSession.value?.scenario || null
  })

  const conversationHistory = computed(() => {
    return currentSession.value?.conversationHistory || []
  })

  const lastECHOMessage = computed(() => {
    const history = conversationHistory.value
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].speaker === 'echo') {
        return history[i]
      }
    }
    return null
  })

  const sessionStats = computed(() => {
    if (!currentSession.value) return null
    
    const userTurns = conversationHistory.value.filter(t => t.speaker === 'user').length
    const duration = currentSession.value.startTime ? 
      (Date.now() - new Date(currentSession.value.startTime).getTime()) / 1000 / 60 : 0
    
    return {
      turns: userTurns,
      duration: Math.round(duration),
      score: currentSession.value.overallScore
    }
  })

  const encouragementMessages = [
    "素晴らしい！頑張っていますね！",
    "単語を一つずつ覚えていきましょう！",
    "あなたなら必ずできます！",
    "間違えても大丈夫！それが勉強です！",
    "どんどん上手くなっています！"
  ]

  // Methods
  const startSession = async (scenarioId: string) => {
    selectedScenarioId.value = scenarioId
    await aiPracticeStore.startPracticeSession(scenarioId)
    scrollToBottom()
  }

  const sendMessage = async () => {
    if (!userInput.value.trim() || !isSessionActive.value) return
    
    const message = userInput.value
    userInput.value = ''
    
    await aiPracticeStore.sendUserMessage(message)
    scrollToBottom()
    
    // Check if user needs encouragement
    if (message.includes('sorry') || message.includes('difficult') || message.length < 5) {
      showEncouragement()
    }
  }

  const showEncouragement = () => {
    const randomMessage = encouragementMessages[
      Math.floor(Math.random() * encouragementMessages.length)
    ]
    
    aiPracticeStore.updateECHOEmotion('encouraging')
    echoCharacter.value.encouragementLevel = Math.min(100, echoCharacter.value.encouragementLevel + 10)
    
    setTimeout(() => {
      aiPracticeStore.updateECHOEmotion('normal')
    }, 3000)
  }

  const toggleHints = () => {
    showHints.value = !showHints.value
  }

  const endSession = async () => {
    await aiPracticeStore.endCurrentSession()
    selectedScenarioId.value = null
    showHints.value = false
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (conversationScrollContainer.value) {
        conversationScrollContainer.value.scrollTop = conversationScrollContainer.value.scrollHeight
      }
    }, 100)
  }

  const startVoiceRecording = () => {
    if (!speechSupported.value || !speechRecognition.value) {
      alert('申し訳ございません。この端末では音声認識がサポートされていません。')
      return
    }

    isListening.value = true
    isRecording.value = true
    echoCharacter.value.animationState.headTilt = -10
    
    try {
      speechRecognition.value.start()
    } catch (error) {
      logger.error('音声認識開始エラー:', error)
      stopVoiceRecording()
    }
  }

  const stopVoiceRecording = () => {
    if (speechRecognition.value && isListening.value) {
      speechRecognition.value.stop()
    }
    isListening.value = false
    isRecording.value = false
    echoCharacter.value.animationState.headTilt = 0
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1.1
      
      utterance.onstart = () => {
        echoCharacter.value.animationState.isSpeaking = true
      }
      
      utterance.onend = () => {
        echoCharacter.value.animationState.isSpeaking = false
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const getScenarioProgress = (scenario: VRScenario) => {
    const completedObjectives = objectives.filter(o => o.completed).length // Track completed objectives
    return (completedObjectives / scenario.objectives.length) * 100
  }

  const resetSession = () => {
    userInput.value = ''
    showHints.value = false
    selectedScenarioId.value = null
  }

  // Watch for ECHO responses to trigger speech synthesis
  watch(conversationHistory, (newHistory) => {
    if (newHistory.length > 0) {
      const lastTurn = newHistory[newHistory.length - 1]
      if (lastTurn.speaker === 'echo' && lastTurn.message) {
        // Auto-speak ECHO's responses
        setTimeout(() => {
          speakText(lastTurn.message)
        }, 500)
      }
    }
  }, { deep: true })

  // Watch for errors
  watch(error, (newError) => {
    if (newError) {
      logger.error('ECHO Practice Error:', newError)
      setTimeout(() => {
        aiPracticeStore.clearError()
      }, 5000)
    }
  })

  // Initialize on mount
  const initialize = () => {
    aiPracticeStore.initializeServices()
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      // Load voices
      speechSynthesis.getVoices()
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          speechSynthesis.getVoices()
        }
      }
    }
    
    // Set up speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      speechSupported.value = true
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      speechRecognition.value = new SpeechRecognition()
      speechRecognition.value.continuous = false
      speechRecognition.value.interimResults = false
      speechRecognition.value.lang = 'en-US'
      speechRecognition.value.maxAlternatives = 3 // Get multiple alternatives for better accuracy
      
      speechRecognition.value.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const confidence = event.results[0][0].confidence
        
        userInput.value = transcript
        
        // Show confidence indicator
        logger.log(`Speech recognition confidence: ${(confidence * 100).toFixed(1)}%`)
        
        // Auto-submit after speech recognition
        setTimeout(() => {
          sendMessage()
        }, 500)
      }
      
      speechRecognition.value.onend = () => {
        isListening.value = false
        isRecording.value = false
        echoCharacter.value.animationState.headTilt = 0
      }
      
      speechRecognition.value.onerror = (event: any) => {
        logger.error('音声認識エラー:', event.error)
        stopVoiceRecording()
        
        let errorMessage = '音声認識でエラーが発生しました。'
        let shouldSpeak = false
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = '音声が検出されませんでした。もう一度お試しください。'
            shouldSpeak = true
            break
          case 'audio-capture':
            errorMessage = 'マイクにアクセスできません。設定を確認してください。'
            break
          case 'not-allowed':
            errorMessage = 'マイクの使用が許可されていません。ブラウザの設定を確認してください。'
            break
        }
        
        if (shouldSpeak) {
          speakText("I didn't hear anything. Please try speaking again.", true)
        } else {
          alert(errorMessage)
        }
      }
    } else {
      speechSupported.value = false
      logger.warn('この端末では音声認識がサポートされていません')
    }
  }

  return {
    // State
    userInput,
    isRecording,
    showHints,
    selectedScenarioId,
    conversationScrollContainer,
    isListening,
    speechSupported,
    isSpeaking,
    performanceStats,
    lastError,
    
    // Store refs
    currentSession,
    echoCharacter,
    isLoading,
    error,
    isSessionActive,
    userProfile,
    
    // Computed
    currentScenario,
    conversationHistory,
    lastECHOMessage,
    sessionStats,
    
    // Methods
    startSession,
    sendMessage,
    toggleHints,
    endSession,
    startVoiceRecording,
    stopVoiceRecording,
    speakText,
    getScenarioProgress,
    resetSession,
    initialize,
    
    // Store methods
    getRecommendedScenarios: aiPracticeStore.getRecommendedScenarios,
    getScenariosByDifficulty: aiPracticeStore.getScenariosByDifficulty,
    updateUserProfile: aiPracticeStore.updateUserProfile
  }
}