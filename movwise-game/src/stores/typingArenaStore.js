import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import logger from '@/utils/logger'

export const useTypingArenaStore = defineStore('typingArena', () => {
  // Character System
  const character = ref({
    name: 'TypeMaster',
    level: 1,
    exp: 0,
    maxExp: 100,
    stats: {
      speed: 10,
      accuracy: 10,
      endurance: 10
    },
    maxCombo: 0,
    totalWords: 0,
    totalKeystrokes: 0,
    achievements: []
  })

  const characterTitle = computed(() => {
    const level = character.value.level
    if (level >= 50) return '銀河タイピングマスター'
    if (level >= 40) return 'スピードデーモン'
    if (level >= 30) return 'キーボード忍者'
    if (level >= 20) return 'ワードハンター'
    if (level >= 10) return 'タイピング戦士'
    return 'タイピング初心者'
  })

  // Story Mode Progress
  const storyMode = ref({
    currentChapter: 1,
    maxChapter: 5,
    chapters: {
      1: { completed: false, stars: 0, bestScore: 0 },
      2: { completed: false, stars: 0, bestScore: 0 },
      3: { completed: false, stars: 0, bestScore: 0 },
      4: { completed: false, stars: 0, bestScore: 0 },
      5: { completed: false, stars: 0, bestScore: 0 }
    }
  })

  const storyProgress = computed(() => {
    const completed = Object.values(storyMode.value.chapters)
      .filter(ch => ch.completed).length
    return (completed / 5) * 100
  })

  // Practice Mode Stats
  const practiceStats = ref({
    totalSessions: 0,
    totalTime: 0,
    averageWPM: 0,
    averageAccuracy: 0,
    bestWPM: 0,
    levelProgress: {
      eiken5: { completed: 0, total: 10 },
      eiken4: { completed: 0, total: 15 },
      eiken3: { completed: 0, total: 20 },
      eikenPre2: { completed: 0, total: 25 },
      eiken2: { completed: 0, total: 30 }
    }
  })

  // Session History
  const sessionHistory = ref([])
  const totalSessions = computed(() => sessionHistory.value.length)

  // High Scores
  const highScores = ref({
    story: [],
    practice: [],
    challenge: []
  })

  // Active Pet
  const activePet = ref(null)
  const unlockedPets = ref(['cat'])

  // Pet System for Enhanced Mode
  const pets = ref({
    current: 'cat',
    petData: {
      cat: {
        name: 'タイピングキャット',
        level: 1,
        exp: 0,
        abilities: [
          { id: 'hint', name: 'ヒント', cooldown: 5 }
        ]
      }
    }
  })

  // Overall Progress
  const overallProgress = computed(() => {
    const storyCompleted = Object.values(storyMode.value.chapters)
      .filter(ch => ch.completed).length
    const practiceProgress = Math.min(practiceStats.value.totalSessions / 50, 1) // Cap at 50 sessions
    return Math.round(((storyCompleted / 5) * 0.6 + practiceProgress * 0.4) * 100)
  })

  // Methods
  const addExp = (amount) => {
    character.value.exp += amount
    while (character.value.exp >= character.value.maxExp) {
      character.value.exp -= character.value.maxExp
      character.value.level++
      character.value.maxExp = Math.floor(character.value.maxExp * 1.2)
      
      // Stat increases on level up
      character.value.stats.speed += 2
      character.value.stats.accuracy += 2
      character.value.stats.endurance += 2
    }
  }

  const completeChapter = (chapter, score, stars) => {
    const ch = storyMode.value.chapters[chapter]
    ch.completed = true
    ch.stars = Math.max(ch.stars, stars)
    ch.bestScore = Math.max(ch.bestScore, score)
    
    // Unlock next chapter
    if (chapter < 5 && storyMode.value.currentChapter === chapter) {
      storyMode.value.currentChapter = chapter + 1
    }
    
    saveProgress()
  }

  const recordSession = (sessionData) => {
    sessionHistory.value.push({
      ...sessionData,
      timestamp: Date.now()
    })
    
    // Update practice stats
    practiceStats.value.totalSessions++
    practiceStats.value.totalTime += sessionData.duration || 0
    
    // Update averages
    const sessions = sessionHistory.value
    const totalWPM = sessions.reduce((sum, s) => sum + (s.wpm || 0), 0)
    const totalAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0)
    
    practiceStats.value.averageWPM = Math.round(totalWPM / sessions.length)
    practiceStats.value.averageAccuracy = Math.round(totalAccuracy / sessions.length)
    practiceStats.value.bestWPM = Math.max(practiceStats.value.bestWPM, sessionData.wpm || 0)
    
    saveProgress()
  }

  const updateHighScore = (mode, score) => {
    const scores = highScores.value[mode]
    scores.push(score)
    scores.sort((a, b) => b.score - a.score)
    highScores.value[mode] = scores.slice(0, 10) // Keep top 10
    saveProgress()
  }

  const unlockPet = (petId) => {
    if (!unlockedPets.value.includes(petId)) {
      unlockedPets.value.push(petId)
      saveProgress()
    }
  }

  const setActivePet = (petId) => {
    if (unlockedPets.value.includes(petId)) {
      activePet.value = petId
      saveProgress()
    }
  }

  const getSessionStats = () => {
    if (sessionHistory.value.length === 0) {
      return {
        averageWPM: 0,
        averageAccuracy: 0,
        totalWords: 0,
        totalTime: 0
      }
    }
    
    const stats = sessionHistory.value.reduce((acc, session) => {
      acc.totalWPM += session.wpm || 0
      acc.totalAccuracy += session.accuracy || 0
      acc.totalWords += session.wordsTyped || 0
      acc.totalTime += session.duration || 0
      return acc
    }, { totalWPM: 0, totalAccuracy: 0, totalWords: 0, totalTime: 0 })
    
    const count = sessionHistory.value.length
    return {
      averageWPM: Math.round(stats.totalWPM / count),
      averageAccuracy: Math.round(stats.totalAccuracy / count),
      totalWords: stats.totalWords,
      totalTime: stats.totalTime
    }
  }

  const saveProgress = () => {
    try {
      const saveData = {
        character: character.value,
        storyMode: storyMode.value,
        practiceStats: practiceStats.value,
        sessionHistory: sessionHistory.value.slice(-50), // Keep last 50 sessions
        highScores: highScores.value,
        activePet: activePet.value,
        unlockedPets: unlockedPets.value,
        lastSaved: Date.now()
      }
      localStorage.setItem('typingArenaProgress', JSON.stringify(saveData))
    } catch (error) {
      logger.error('Failed to save typing arena progress:', error)
    }
  }

  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem('typingArenaProgress')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        if (data.character) character.value = data.character
        if (data.storyMode) storyMode.value = data.storyMode
        if (data.practiceStats) practiceStats.value = data.practiceStats
        if (data.sessionHistory) sessionHistory.value = data.sessionHistory
        if (data.highScores) highScores.value = data.highScores
        if (data.activePet) activePet.value = data.activePet
        if (data.unlockedPets) unlockedPets.value = data.unlockedPets
        
        return true
      }
    } catch (error) {
      logger.error('Failed to load typing arena progress:', error)
    }
    return false
  }

  const resetProgress = () => {
    // Reset to initial values
    character.value = {
      name: 'TypeMaster',
      level: 1,
      exp: 0,
      maxExp: 100,
      stats: {
        speed: 10,
        accuracy: 10,
        endurance: 10
      },
      maxCombo: 0,
      totalWords: 0,
      totalKeystrokes: 0,
      achievements: []
    }
    
    storyMode.value = {
      currentChapter: 1,
      maxChapter: 5,
      chapters: {
        1: { completed: false, stars: 0, bestScore: 0 },
        2: { completed: false, stars: 0, bestScore: 0 },
        3: { completed: false, stars: 0, bestScore: 0 },
        4: { completed: false, stars: 0, bestScore: 0 },
        5: { completed: false, stars: 0, bestScore: 0 }
      }
    }
    
    practiceStats.value = {
      totalSessions: 0,
      totalTime: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      bestWPM: 0,
      levelProgress: {
        eiken5: { completed: 0, total: 10 },
        eiken4: { completed: 0, total: 15 },
        eiken3: { completed: 0, total: 20 },
        eikenPre2: { completed: 0, total: 25 },
        eiken2: { completed: 0, total: 30 }
      }
    }
    
    sessionHistory.value = []
    highScores.value = { story: [], practice: [], challenge: [] }
    activePet.value = null
    unlockedPets.value = ['cat']
    
    saveProgress()
  }

  // Initialize on store creation
  const initializeStore = () => {
    loadProgress()
  }

  return {
    // State
    character,
    storyMode,
    practiceStats,
    sessionHistory,
    highScores,
    activePet,
    unlockedPets,
    pets,

    // Computed
    characterTitle,
    storyProgress,
    totalSessions,
    overallProgress,

    // Methods
    addExp,
    completeChapter,
    recordSession,
    updateHighScore,
    unlockPet,
    setActivePet,
    getSessionStats,
    saveProgress,
    loadProgress,
    resetProgress,
    initializeStore
  }
})