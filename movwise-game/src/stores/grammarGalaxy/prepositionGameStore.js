import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Dexie from 'dexie'
import logger from '@/utils/logger'

// IndexedDB setup for offline storage
const db = new Dexie('PrepositionGameDB')
db.version(1).stores({
  progress: 'id, userId, category, score, timestamp',
  achievements: 'id, userId, type, unlockedAt'
})

export const usePrepositionGameStore = defineStore('prepositionGame', () => {
  // Game state
  const currentCategory = ref(null)
  const currentQuestionIndex = ref(0)
  const sessionScore = ref(0)
  const sessionStartTime = ref(null)
  const isGameActive = ref(false)
  
  // User progress
  const userProgress = ref({
    totalScore: 0,
    unlockedPlanets: ['place', 'time', 'date', 'method', 'relation'], // Unlock all planets for testing
    achievements: [],
    lastPlayed: null
  })
  
  // Category progress
  const categoryProgress = ref({
    place: {
      attempted: 0,
      completed: 0,
      bestScore: 0,
      mistakes: {},
      lastAccessed: null
    },
    time: {
      attempted: 0,
      completed: 0,
      bestScore: 0,
      mistakes: {},
      lastAccessed: null
    },
    date: {
      attempted: 0,
      completed: 0,
      bestScore: 0,
      mistakes: {},
      lastAccessed: null
    },
    method: {
      attempted: 0,
      completed: 0,
      bestScore: 0,
      mistakes: {},
      lastAccessed: null
    },
    relation: {
      attempted: 0,
      completed: 0,
      bestScore: 0,
      mistakes: {},
      lastAccessed: null
    }
  })
  
  // Planet data
  const planets = ref([
    {
      id: 'place',
      name: '位置の惑星「ロケーシア」',
      nameEn: 'Locasia',
      color: '#4caf50',
      size: 2,
      position: [-8, 0, -10],
      rotation: [0, 0, 0],
      unlocked: true,
      completed: false,
      bestScore: 0,
      description: '場所を表す前置詞（at, in, on, under）をマスター',
      icon: '📍',
      theme: 'forest',
      prepositions: ['at', 'in', 'on', 'under', 'behind', 'in front of', 'between', 'next to']
    },
    {
      id: 'time',
      name: '時間の惑星「クロノス」',
      nameEn: 'Chronos',
      color: '#ff9800',
      size: 2.2,
      position: [8, 2, -8],
      rotation: [0, 0, 0],
      unlocked: true, // Temporarily unlock for testing
      completed: false,
      bestScore: 0,
      description: '時間を表す前置詞（at, in, on, during）を学習',
      icon: '⏰',
      theme: 'clocktower',
      prepositions: ['at', 'in', 'on', 'during', 'before', 'after', 'until', 'since']
    },
    {
      id: 'date',
      name: '日付の惑星「カレンディア」',
      nameEn: 'Calendia',
      color: '#2196f3',
      size: 1.8,
      position: [-5, -3, -12],
      rotation: [0, 0, 0],
      unlocked: true, // Temporarily unlock for testing
      completed: false,
      bestScore: 0,
      description: '日付と曜日の前置詞（on, in）を完璧に',
      icon: '📅',
      theme: 'calendar',
      prepositions: ['on', 'in', 'at', 'by', 'within']
    },
    {
      id: 'method',
      name: '方法の惑星「メソディア」',
      nameEn: 'Methodia',
      color: '#9e9e9e',
      size: 1.9,
      position: [6, -2, -15],
      rotation: [0, 0, 0],
      unlocked: true, // Temporarily unlock for testing
      completed: false,
      bestScore: 0,
      description: '手段や方法を表す前置詞（by, with, through）を習得',
      icon: '🔧',
      theme: 'factory',
      prepositions: ['by', 'with', 'through', 'via', 'using', 'without']
    },
    {
      id: 'relation',
      name: '関係の惑星「リレーシア」',
      nameEn: 'Relacia',
      color: '#9c27b0',
      size: 2.1,
      position: [0, 4, -20],
      rotation: [0, 0, 0],
      unlocked: true, // Temporarily unlock for testing
      completed: false,
      bestScore: 0,
      description: '人や物との関係を表す前置詞（for, to, with）を理解',
      icon: '🤝',
      theme: 'community',
      prepositions: ['for', 'to', 'with', 'about', 'from', 'of', 'against']
    }
  ])
  
  // Current session
  const currentSession = ref({
    category: null,
    questionIndex: 0,
    score: 0,
    startTime: null,
    correctAnswers: 0,
    wrongAnswers: 0,
    streak: 0,
    maxStreak: 0
  })
  
  // Computed properties
  const unlockedPlanetsCount = computed(() => 
    planets.value.filter(p => p.unlocked).length
  )
  
  const completedPlanetsCount = computed(() => 
    planets.value.filter(p => p.completed).length
  )
  
  const overallProgress = computed(() => {
    const total = planets.value.length
    const completed = completedPlanetsCount.value
    return Math.round((completed / total) * 100)
  })
  
  const currentPlanet = computed(() => 
    planets.value.find(p => p.id === currentCategory.value)
  )
  
  // Actions
  const startGame = (category) => {
    currentCategory.value = category
    currentSession.value = {
      category,
      questionIndex: 0,
      score: 0,
      startTime: Date.now(),
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      maxStreak: 0
    }
    sessionStartTime.value = Date.now()
    isGameActive.value = true
    
    // Update last accessed
    if (categoryProgress.value[category]) {
      categoryProgress.value[category].lastAccessed = Date.now()
    }
  }
  
  const endGame = async () => {
    if (!isGameActive.value) return
    
    const category = currentCategory.value
    const finalScore = currentSession.value.score
    
    // Update category progress
    if (categoryProgress.value[category]) {
      categoryProgress.value[category].attempted++
      if (finalScore >= 80) {
        categoryProgress.value[category].completed++
      }
      if (finalScore > categoryProgress.value[category].bestScore) {
        categoryProgress.value[category].bestScore = finalScore
      }
    }
    
    // Update planet data
    const planet = planets.value.find(p => p.id === category)
    if (planet) {
      if (finalScore > planet.bestScore) {
        planet.bestScore = finalScore
      }
      if (finalScore >= 80) {
        planet.completed = true
        // Unlock next planet
        unlockNextPlanet(category)
      }
    }
    
    // Save to IndexedDB
    await saveProgress()
    
    // Reset session
    isGameActive.value = false
    currentCategory.value = null
    currentSession.value = {
      category: null,
      questionIndex: 0,
      score: 0,
      startTime: null,
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      maxStreak: 0
    }
  }
  
  const unlockNextPlanet = (completedCategory) => {
    const order = ['place', 'time', 'date', 'method', 'relation']
    const currentIndex = order.indexOf(completedCategory)
    
    if (currentIndex < order.length - 1) {
      const nextPlanetId = order[currentIndex + 1]
      const nextPlanet = planets.value.find(p => p.id === nextPlanetId)
      
      if (nextPlanet && !nextPlanet.unlocked) {
        nextPlanet.unlocked = true
        userProgress.value.unlockedPlanets.push(nextPlanetId)
        
        // Achievement for unlocking new planet
        addAchievement('planet_unlocked', {
          planetId: nextPlanetId,
          planetName: nextPlanet.name
        })
      }
    }
  }
  
  const answerQuestion = (isCorrect) => {
    if (!isGameActive.value) return
    
    if (isCorrect) {
      currentSession.value.correctAnswers++
      currentSession.value.streak++
      currentSession.value.score += 10 * Math.min(currentSession.value.streak, 5)
      
      if (currentSession.value.streak > currentSession.value.maxStreak) {
        currentSession.value.maxStreak = currentSession.value.streak
      }
      
      // Achievement for streak
      if (currentSession.value.streak === 5) {
        addAchievement('streak_5', { category: currentCategory.value })
      }
      if (currentSession.value.streak === 10) {
        addAchievement('streak_10', { category: currentCategory.value })
      }
    } else {
      currentSession.value.wrongAnswers++
      currentSession.value.streak = 0
      
      // Record mistake
      const category = currentCategory.value
      const questionId = `q_${currentSession.value.questionIndex}`
      if (categoryProgress.value[category]) {
        categoryProgress.value[category].mistakes[questionId] = 
          (categoryProgress.value[category].mistakes[questionId] || 0) + 1
      }
    }
    
    currentSession.value.questionIndex++
  }
  
  const addAchievement = (type, data = {}) => {
    const achievement = {
      id: `${type}_${Date.now()}`,
      type,
      data,
      unlockedAt: Date.now()
    }
    
    userProgress.value.achievements.push(achievement)
    return achievement
  }
  
  const saveProgress = async () => {
    try {
      // Convert reactive objects to plain objects for serialization
      const plainUserProgress = JSON.parse(JSON.stringify(userProgress.value))
      const plainCategoryProgress = JSON.parse(JSON.stringify(categoryProgress.value))
      const plainPlanets = JSON.parse(JSON.stringify(planets.value))
      
      // Save to IndexedDB
      await db.progress.put({
        id: 'main_progress',
        userId: 'current_user', // Replace with actual user ID
        userProgress: plainUserProgress,
        categoryProgress: plainCategoryProgress,
        planets: plainPlanets,
        timestamp: Date.now()
      })
    } catch (error) {
      logger.error('Failed to save progress:', error)
    }
  }
  
  const loadProgress = async () => {
    try {
      const saved = await db.progress.get('main_progress')
      if (saved) {
        // Safely assign loaded data
        Object.assign(userProgress.value, saved.userProgress)
        Object.assign(categoryProgress.value, saved.categoryProgress)
        
        // Update planets array while preserving reactivity
        planets.value.forEach(planet => {
          const savedPlanet = saved.planets.find(p => p.id === planet.id)
          if (savedPlanet) {
            Object.assign(planet, savedPlanet)
          }
        })
      }
    } catch (error) {
      logger.error('Failed to load progress:', error)
    }
  }
  
  const resetProgress = () => {
    // Reset to initial state
    userProgress.value = {
      totalScore: 0,
      unlockedPlanets: ['place', 'time', 'date', 'method', 'relation'], // Keep all unlocked for testing
      achievements: [],
      lastPlayed: null
    }
    
    // Reset all category progress
    Object.keys(categoryProgress.value).forEach(key => {
      categoryProgress.value[key] = {
        attempted: 0,
        completed: 0,
        bestScore: 0,
        mistakes: {},
        lastAccessed: null
      }
    })
    
    // Reset planets
    planets.value.forEach(planet => {
      planet.unlocked = true // Keep all planets unlocked for testing
      planet.completed = false
      planet.bestScore = 0
    })
    
    // Clear IndexedDB
    db.progress.clear()
  }
  
  // Initialize store
  const initializeStore = async () => {
    await loadProgress()
  }
  
  // Load progress on store creation
  initializeStore()

  return {
    // State
    currentCategory,
    currentQuestionIndex,
    sessionScore,
    sessionStartTime,
    isGameActive,
    userProgress,
    categoryProgress,
    planets,
    currentSession,
    
    // Computed
    unlockedPlanetsCount,
    completedPlanetsCount,
    overallProgress,
    currentPlanet,
    
    // Actions
    startGame,
    endGame,
    answerQuestion,
    addAchievement,
    saveProgress,
    loadProgress,
    resetProgress,
    unlockNextPlanet,
    initializeStore
  }
})