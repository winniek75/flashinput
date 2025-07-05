import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGrammarGalaxyStore } from './grammarGalaxyStore'

export const useGrammarProgressStore = defineStore('grammarProgress', () => {
  // === 学習データ管理 ===
  
  // 詳細な学習統計
  const learningStats = ref({
    totalStudyTime: 0, // 総学習時間（分）
    sessionsCompleted: 0, // 完了セッション数
    streakDays: 0, // 連続学習日数
    lastStudyDate: null, // 最後の学習日
    weeklyGoal: 60, // 週間目標時間（分）
    dailyGoal: 10, // 日間目標時間（分）
    currentWeekStudyTime: 0, // 今週の学習時間
    currentDayStudyTime: 0, // 今日の学習時間
    bestStreak: 0, // 最高連続日数
    totalCorrectAnswers: 0, // 総正解数
    totalQuestionsSeen: 0, // 総問題数
    averageAccuracy: 0, // 平均正答率
    preferredDifficulty: 'intermediate' // 好みの難易度
  })
  
  // 詳細なゲーム履歴
  const gameHistory = ref([])
  
  // スキル分析データ
  const skillAnalysis = ref({
    verbConjugation: {
      name: '動詞活用',
      level: 1,
      experience: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      weakAreas: [],
      strengths: [],
      lastPracticed: null
    },
    questionWords: {
      name: '疑問詞',
      level: 1,
      experience: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      weakAreas: [],
      strengths: [],
      lastPracticed: null
    },
    sentenceConstruction: {
      name: '文構造',
      level: 1,
      experience: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      weakAreas: [],
      strengths: [],
      lastPracticed: null
    }
  })
  
  // アチーブメントシステム
  const achievements = ref([
    {
      id: 'first_perfect_score',
      name: '完璧な開始',
      description: '初めて満点を獲得',
      icon: '⭐',
      category: 'milestone',
      unlocked: false,
      unlockedAt: null,
      rarity: 'common'
    },
    {
      id: 'time_traveler',
      name: 'タイムトラベラー',
      description: 'Verb Time Machineで10回連続正解',
      icon: '🕐',
      category: 'game_specific',
      unlocked: false,
      unlockedAt: null,
      rarity: 'uncommon'
    },
    {
      id: 'master_detective',
      name: '名探偵',
      description: 'Question Word Detectiveで95%以上の正答率を達成',
      icon: '🔍',
      category: 'game_specific',
      unlocked: false,
      unlockedAt: null,
      rarity: 'rare'
    },
    {
      id: 'grammar_architect',
      name: '文法建築家',
      description: 'Grammar Constructorで50個の文を完成',
      icon: '🏗️',
      category: 'game_specific',
      unlocked: false,
      unlockedAt: null,
      rarity: 'epic'
    },
    {
      id: 'streak_warrior',
      name: 'ストリーク戦士',
      description: '7日連続で学習',
      icon: '🔥',
      category: 'consistency',
      unlocked: false,
      unlockedAt: null,
      rarity: 'rare'
    },
    {
      id: 'speed_demon',
      name: 'スピードデーモン',
      description: '平均回答時間3秒以内を達成',
      icon: '⚡',
      category: 'performance',
      unlocked: false,
      unlockedAt: null,
      rarity: 'legendary'
    },
    {
      id: 'galaxy_explorer',
      name: '銀河探検家',
      description: '全てのゲームで星を獲得',
      icon: '🌌',
      category: 'completion',
      unlocked: false,
      unlockedAt: null,
      rarity: 'epic'
    }
  ])
  
  // 学習パターン分析
  const learningPatterns = ref({
    preferredTimeOfDay: null, // 'morning', 'afternoon', 'evening', 'night'
    averageSessionLength: 0, // 分
    bestPerformanceTime: null, // 最も成績の良い時間帯
    difficultyProgression: [], // 難易度の変遷
    motivationalFactors: [], // モチベーション要因
    learningVelocity: 0 // 学習速度（経験値/分）
  })
  
  // === 計算されたプロパティ ===
  
  // 今日の学習進捗
  const todayProgress = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = gameHistory.value.filter(session => 
      session.date.startsWith(today)
    )
    
    return {
      gamesPlayed: todaySessions.length,
      timeSpent: todaySessions.reduce((total, session) => total + session.duration, 0),
      starsEarned: todaySessions.reduce((total, session) => total + session.starsEarned, 0),
      averageAccuracy: todaySessions.length > 0 ? 
        todaySessions.reduce((total, session) => total + session.accuracy, 0) / todaySessions.length : 0,
      goalProgress: Math.min((learningStats.value.currentDayStudyTime / learningStats.value.dailyGoal) * 100, 100)
    }
  })
  
  // 今週の学習進捗
  const weekProgress = computed(() => {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    const weekSessions = gameHistory.value.filter(session => 
      new Date(session.date) >= startOfWeek
    )
    
    return {
      totalTime: weekSessions.reduce((total, session) => total + session.duration, 0),
      goalProgress: Math.min((learningStats.value.currentWeekStudyTime / learningStats.value.weeklyGoal) * 100, 100),
      bestDay: findBestDayOfWeek(weekSessions),
      consistency: calculateWeeklyConsistency(weekSessions)
    }
  })
  
  // スキルレベル総合
  const overallSkillLevel = computed(() => {
    const skills = Object.values(skillAnalysis.value)
    const totalLevel = skills.reduce((sum, skill) => sum + skill.level, 0)
    const averageLevel = totalLevel / skills.length
    return Math.floor(averageLevel)
  })
  
  // 推奨されるスキル練習
  const recommendedPractice = computed(() => {
    const skills = Object.values(skillAnalysis.value)
    
    // 最も弱いスキルを特定
    const weakestSkill = skills.reduce((weakest, current) => 
      current.accuracy < weakest.accuracy ? current : weakest
    )
    
    // 最も久しく練習していないスキルを特定
    const stalestSkill = skills.reduce((stalest, current) => {
      const currentDate = current.lastPracticed ? new Date(current.lastPracticed) : new Date(0)
      const stalestDate = stalest.lastPracticed ? new Date(stalest.lastPracticed) : new Date(0)
      return currentDate < stalestDate ? current : stalest
    })
    
    return {
      weakest: weakestSkill,
      stalest: stalestSkill,
      suggestion: generatePracticeSuggestion(weakestSkill, stalestSkill)
    }
  })
  
  // 最新のアチーブメント
  const recentAchievements = computed(() => {
    return achievements.value
      .filter(achievement => achievement.unlocked)
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
      .slice(0, 3)
  })
  
  // === アクション ===
  
  /**
   * ゲームセッション完了時のデータ記録
   */
  const recordGameSession = (sessionData) => {
    const {
      gameId,
      planetId,
      duration, // 分
      score,
      accuracy,
      starsEarned,
      difficulty,
      correctAnswers,
      totalQuestions,
      averageReactionTime,
      details
    } = sessionData
    
    // ゲーム履歴に追加
    const session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      gameId,
      planetId,
      duration,
      score,
      accuracy,
      starsEarned,
      difficulty,
      correctAnswers,
      totalQuestions,
      averageReactionTime,
      details: details || {}
    }
    
    gameHistory.value.unshift(session)
    
    // 履歴が1000件を超えたら古いものを削除
    if (gameHistory.value.length > 1000) {
      gameHistory.value = gameHistory.value.slice(0, 1000)
    }
    
    // 学習統計を更新
    updateLearningStats(session)
    
    // スキル分析を更新
    updateSkillAnalysis(session)
    
    // アチーブメントをチェック
    checkAchievements(session)
    
    // 学習パターンを更新
    updateLearningPatterns(session)
    
    // データを保存
    saveProgressData()
    
    console.log(`📊 Game session recorded: ${gameId} - ${accuracy}% accuracy`)
  }
  
  /**
   * 学習統計を更新
   */
  const updateLearningStats = (session) => {
    const stats = learningStats.value
    const today = new Date().toISOString().split('T')[0]
    
    // 基本統計更新
    stats.totalStudyTime += session.duration
    stats.sessionsCompleted += 1
    stats.totalCorrectAnswers += session.correctAnswers
    stats.totalQuestionsSeen += session.totalQuestions
    
    // 正答率更新
    if (stats.totalQuestionsSeen > 0) {
      stats.averageAccuracy = (stats.totalCorrectAnswers / stats.totalQuestionsSeen) * 100
    }
    
    // 今日の学習時間更新
    if (session.date.startsWith(today)) {
      stats.currentDayStudyTime += session.duration
    }
    
    // 連続学習日数更新
    updateStreakDays(session.date)
    
    // 最後の学習日更新
    stats.lastStudyDate = session.date
  }
  
  /**
   * スキル分析を更新
   */
  const updateSkillAnalysis = (session) => {
    let skill = null
    
    // ゲームIDに基づいてスキルを特定
    switch (session.gameId) {
      case 'verbTimeMachine':
        skill = skillAnalysis.value.verbConjugation
        break
      case 'questionWordDetective':
        skill = skillAnalysis.value.questionWords
        break
      case 'grammarConstructor':
        skill = skillAnalysis.value.sentenceConstruction
        break
      default:
        return
    }
    
    // スキル統計を更新
    skill.totalAttempts += session.totalQuestions
    skill.correctAttempts += session.correctAnswers
    skill.accuracy = (skill.correctAttempts / skill.totalAttempts) * 100
    skill.averageTime = session.averageReactionTime
    skill.lastPracticed = session.date
    
    // 経験値を追加（正解数と難易度に基づく）
    const expGain = calculateExperienceGain(session)
    skill.experience += expGain
    
    // レベルアップチェック
    const newLevel = calculateSkillLevel(skill.experience)
    if (newLevel > skill.level) {
      skill.level = newLevel
      console.log(`🎉 Skill level up! ${skill.name} is now level ${newLevel}`)
    }
    
    // 弱点と強みを分析
    analyzeSkillAreas(skill, session.details)
  }
  
  /**
   * 連続学習日数を更新
   */
  const updateStreakDays = (sessionDate) => {
    const stats = learningStats.value
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    if (!stats.lastStudyDate) {
      // 初回学習
      stats.streakDays = 1
    } else {
      const lastDate = stats.lastStudyDate.split('T')[0]
      
      if (lastDate === today) {
        // 今日既に学習済み（ストリーク維持）
        return
      } else if (lastDate === yesterday) {
        // 昨日が最後の学習日（ストリーク継続）
        stats.streakDays += 1
      } else {
        // ストリーク途切れ
        stats.streakDays = 1
      }
    }
    
    // 最高連続日数更新
    if (stats.streakDays > stats.bestStreak) {
      stats.bestStreak = stats.streakDays
    }
  }
  
  /**
   * アチーブメントをチェック
   */
  const checkAchievements = (session) => {
    achievements.value.forEach(achievement => {
      if (achievement.unlocked) return
      
      let shouldUnlock = false
      
      switch (achievement.id) {
        case 'first_perfect_score':
          shouldUnlock = session.accuracy === 100
          break
          
        case 'time_traveler':
          shouldUnlock = session.gameId === 'verbTimeMachine' && 
                        session.details?.maxStreak >= 10
          break
          
        case 'master_detective':
          shouldUnlock = session.gameId === 'questionWordDetective' && 
                        session.accuracy >= 95
          break
          
        case 'grammar_architect':
          const constructorSessions = gameHistory.value.filter(s => 
            s.gameId === 'grammarConstructor'
          )
          const totalSentences = constructorSessions.reduce((total, s) => 
            total + (s.correctAnswers || 0), 0
          )
          shouldUnlock = totalSentences >= 50
          break
          
        case 'streak_warrior':
          shouldUnlock = learningStats.value.streakDays >= 7
          break
          
        case 'speed_demon':
          shouldUnlock = session.averageReactionTime <= 3000 && 
                        session.totalQuestions >= 10
          break
          
        case 'galaxy_explorer':
          const grammarGalaxyStore = useGrammarGalaxyStore()
          const allGamesHaveStars = Object.values(grammarGalaxyStore.planetsData.grammarFoundation.games)
            .every(game => game.stars > 0)
          shouldUnlock = allGamesHaveStars
          break
      }
      
      if (shouldUnlock) {
        unlockAchievement(achievement.id)
      }
    })
  }
  
  /**
   * アチーブメントをアンロック
   */
  const unlockAchievement = (achievementId) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date().toISOString()
      
      console.log(`🏆 Achievement unlocked: ${achievement.name}`)
      
      // アチーブメント通知を表示（実装は別途必要）
      // showAchievementNotification(achievement)
    }
  }
  
  /**
   * 学習パターンを更新
   */
  const updateLearningPatterns = (session) => {
    const patterns = learningPatterns.value
    const hour = new Date(session.date).getHours()
    
    // 時間帯の分析
    let timeOfDay = 'morning'
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening'
    else if (hour >= 22 || hour < 6) timeOfDay = 'night'
    
    // セッション長の平均を更新
    const totalDuration = gameHistory.value.reduce((sum, s) => sum + s.duration, 0)
    patterns.averageSessionLength = totalDuration / gameHistory.value.length
    
    // 学習速度を計算（経験値/分）
    const totalExp = Object.values(skillAnalysis.value)
      .reduce((sum, skill) => sum + skill.experience, 0)
    patterns.learningVelocity = totalExp / learningStats.value.totalStudyTime
  }
  
  /**
   * データの保存
   */
  const saveProgressData = () => {
    try {
      const saveData = {
        learningStats: learningStats.value,
        gameHistory: gameHistory.value.slice(0, 500), // 最新500件のみ保存
        skillAnalysis: skillAnalysis.value,
        achievements: achievements.value,
        learningPatterns: learningPatterns.value,
        lastSaved: new Date().toISOString()
      }
      
      localStorage.setItem('grammarProgressData', JSON.stringify(saveData))
      console.log('✅ Grammar progress data saved successfully')
    } catch (error) {
      console.error('❌ Failed to save grammar progress data:', error)
    }
  }
  
  /**
   * データの読み込み
   */
  const loadProgressData = () => {
    try {
      const savedData = localStorage.getItem('grammarProgressData')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        if (data.learningStats) {
          Object.assign(learningStats.value, data.learningStats)
        }
        
        if (Array.isArray(data.gameHistory)) {
          gameHistory.value = data.gameHistory
        }
        
        if (data.skillAnalysis) {
          Object.assign(skillAnalysis.value, data.skillAnalysis)
        }
        
        if (Array.isArray(data.achievements)) {
          // 既存のアチーブメントとマージ
          data.achievements.forEach(savedAchievement => {
            const existing = achievements.value.find(a => a.id === savedAchievement.id)
            if (existing) {
              Object.assign(existing, savedAchievement)
            }
          })
        }
        
        if (data.learningPatterns) {
          Object.assign(learningPatterns.value, data.learningPatterns)
        }
        
        console.log('✅ Grammar progress data loaded successfully')
        return true
      }
    } catch (error) {
      console.error('❌ Failed to load grammar progress data:', error)
    }
    return false
  }
  
  /**
   * データのリセット
   */
  const resetProgressData = () => {
    // 学習統計をリセット
    Object.assign(learningStats.value, {
      totalStudyTime: 0,
      sessionsCompleted: 0,
      streakDays: 0,
      lastStudyDate: null,
      weeklyGoal: 60,
      dailyGoal: 10,
      currentWeekStudyTime: 0,
      currentDayStudyTime: 0,
      bestStreak: 0,
      totalCorrectAnswers: 0,
      totalQuestionsSeen: 0,
      averageAccuracy: 0,
      preferredDifficulty: 'intermediate'
    })
    
    // ゲーム履歴をクリア
    gameHistory.value = []
    
    // スキル分析をリセット
    Object.values(skillAnalysis.value).forEach(skill => {
      skill.level = 1
      skill.experience = 0
      skill.totalAttempts = 0
      skill.correctAttempts = 0
      skill.accuracy = 0
      skill.averageTime = 0
      skill.weakAreas = []
      skill.strengths = []
      skill.lastPracticed = null
    })
    
    // アチーブメントをリセット
    achievements.value.forEach(achievement => {
      achievement.unlocked = false
      achievement.unlockedAt = null
    })
    
    // 学習パターンをリセット
    Object.assign(learningPatterns.value, {
      preferredTimeOfDay: null,
      averageSessionLength: 0,
      bestPerformanceTime: null,
      difficultyProgression: [],
      motivationalFactors: [],
      learningVelocity: 0
    })
    
    saveProgressData()
    console.log('✅ Grammar progress data reset successfully')
  }
  
  // === ヘルパー関数 ===
  
  const calculateExperienceGain = (session) => {
    const baseExp = session.correctAnswers * 10
    const difficultyMultiplier = {
      'beginner': 1.0,
      'intermediate': 1.5,
      'advanced': 2.0
    }
    const accuracyBonus = session.accuracy >= 90 ? 1.2 : 1.0
    
    return Math.floor(baseExp * (difficultyMultiplier[session.difficulty] || 1.0) * accuracyBonus)
  }
  
  const calculateSkillLevel = (experience) => {
    // 経験値からレベルを計算（指数関数的成長）
    return Math.floor(Math.log(experience / 100 + 1) / Math.log(1.5)) + 1
  }
  
  const analyzeSkillAreas = (skill, details) => {
    // ゲームの詳細データに基づいて弱点と強みを分析
    // これは各ゲームが提供する詳細データに依存
    if (details && details.incorrectPatterns) {
      skill.weakAreas = [...new Set([...skill.weakAreas, ...details.incorrectPatterns])]
    }
    
    if (details && details.strongPatterns) {
      skill.strengths = [...new Set([...skill.strengths, ...details.strongPatterns])]
    }
  }
  
  const generatePracticeSuggestion = (weakestSkill, stalestSkill) => {
    if (weakestSkill.accuracy < 70) {
      return {
        type: 'improvement',
        skill: weakestSkill.name,
        message: `${weakestSkill.name}の練習をお勧めします。正答率を向上させましょう。`
      }
    }
    
    if (stalestSkill.lastPracticed) {
      const daysSinceLastPractice = (Date.now() - new Date(stalestSkill.lastPracticed)) / (1000 * 60 * 60 * 24)
      if (daysSinceLastPractice >= 3) {
        return {
          type: 'maintenance',
          skill: stalestSkill.name,
          message: `${stalestSkill.name}の復習をお勧めします。スキルの維持に重要です。`
        }
      }
    }
    
    return {
      type: 'balanced',
      skill: 'all',
      message: 'バランス良く全てのスキルを練習しましょう。'
    }
  }
  
  const findBestDayOfWeek = (weekSessions) => {
    const dayPerformance = {}
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    weekSessions.forEach(session => {
      const dayOfWeek = new Date(session.date).getDay()
      const dayName = days[dayOfWeek]
      
      if (!dayPerformance[dayName]) {
        dayPerformance[dayName] = { totalAccuracy: 0, sessions: 0 }
      }
      
      dayPerformance[dayName].totalAccuracy += session.accuracy
      dayPerformance[dayName].sessions += 1
    })
    
    let bestDay = null
    let bestAverage = 0
    
    Object.entries(dayPerformance).forEach(([day, data]) => {
      const average = data.totalAccuracy / data.sessions
      if (average > bestAverage) {
        bestAverage = average
        bestDay = day
      }
    })
    
    return bestDay
  }
  
  const calculateWeeklyConsistency = (weekSessions) => {
    const daysWithSessions = new Set(
      weekSessions.map(session => new Date(session.date).toDateString())
    ).size
    
    return (daysWithSessions / 7) * 100
  }
  
  // 初期化時にデータを読み込み
  loadProgressData()
  
  return {
    // State
    learningStats,
    gameHistory,
    skillAnalysis,
    achievements,
    learningPatterns,
    
    // Computed
    todayProgress,
    weekProgress,
    overallSkillLevel,
    recommendedPractice,
    recentAchievements,
    
    // Actions
    recordGameSession,
    unlockAchievement,
    saveProgressData,
    loadProgressData,
    resetProgressData
  }
})