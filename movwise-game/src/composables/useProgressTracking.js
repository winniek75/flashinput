// Unified Progress Tracking Composable
// 統一学習進捗追跡とアチーブメント管理

import { ref, computed, watch } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import { grammarLevels, getPlayerLevel, getStarsToNextLevel } from '@/data/grammarLevels'
import { LEARNING_LEVELS, LEARNING_AREAS } from './useUnifiedGameEngine.js'
import logger from '@/utils/logger'

export function useProgressTracking() {
  // ストア
  const grammarStore = useGrammarGalaxyStore()
  
  // 進捗状態
  const totalStars = ref(0)
  const planetProgress = ref({})
  const gameProgress = ref({})
  const dailyProgress = ref({
    gamesPlayed: 0,
    starsEarned: 0,
    timeSpent: 0,
    streak: 0,
    targetReached: false
  })
  
  // アチーブメント
  const achievements = ref([])
  const recentAchievements = ref([])
  const availableAchievements = ref([
    {
      id: 'first_star',
      name: '初めての星',
      description: '最初の星を獲得する',
      icon: '⭐',
      type: 'milestone',
      requirement: { stars: 1 },
      unlocked: false
    },
    {
      id: 'perfect_game',
      name: 'パーフェクトマスター',
      description: '100%の正答率でゲームをクリア',
      icon: '💯',
      type: 'performance',
      requirement: { accuracy: 100 },
      unlocked: false
    },
    {
      id: 'speed_demon',
      name: 'スピードデーモン',
      description: '平均反応時間1秒以下',
      icon: '⚡',
      type: 'skill',
      requirement: { averageReactionTime: 1000 },
      unlocked: false
    },
    {
      id: 'daily_warrior',
      name: 'デイリーウォーリア',
      description: '7日連続でプレイ',
      icon: '🗡️',
      type: 'consistency',
      requirement: { dailyStreak: 7 },
      unlocked: false
    },
    {
      id: 'verb_master',
      name: '動詞マスター',
      description: 'VerbTimeMachineを完全制覇',
      icon: '🕐',
      type: 'game_completion',
      requirement: { gameId: 'verbTimeMachine', completion: 100 },
      unlocked: false
    },
    {
      id: 'detective_legend',
      name: '探偵伝説',
      description: 'QuestionWordDetectiveで連続50問正解',
      icon: '🔍',
      type: 'streak',
      requirement: { gameId: 'questionWordDetective', streak: 50 },
      unlocked: false
    },
    {
      id: 'station_commander',
      name: 'ステーション司令官',
      description: 'Galaxy Grammar Stationで文構造を100個完成',
      icon: '🛸',
      type: 'accumulation',
      requirement: { gameId: 'galaxyGrammarStation', constructions: 100 },
      unlocked: false
    },
    {
      id: 'star_collector',
      name: 'スターコレクター',
      description: '50個の星を集める',
      icon: '🌟',
      type: 'milestone',
      requirement: { stars: 50 },
      unlocked: false
    },
    {
      id: 'galaxy_explorer',
      name: '銀河探検家',
      description: 'すべての惑星を訪問',
      icon: '🚀',
      type: 'exploration',
      requirement: { planetsVisited: 3 },
      unlocked: false
    },
    {
      id: 'time_traveler',
      name: 'タイムトラベラー',
      description: '時制変換を1000回成功',
      icon: '⏰',
      type: 'accumulation',
      requirement: { tenseTransformations: 1000 },
      unlocked: false
    }
  ])
  
  // 学習統計
  const learningStats = ref({
    totalGameSessions: 0,
    totalPlayTime: 0,
    averageSessionTime: 0,
    favoritePlanet: null,
    favoriteGame: null,
    strongestSkill: null,
    improvementAreas: []
  })
  
  // 計算されたプロパティ
  const currentPlayerLevel = computed(() => {
    return getPlayerLevel(totalStars.value)
  })
  
  const starsToNextLevel = computed(() => {
    return getStarsToNextLevel(totalStars.value)
  })
  
  const overallProgress = computed(() => {
    const totalPossibleStars = Object.values(grammarLevels).reduce((sum, level) => {
      return sum + level.verbTimeMachine.length * 3 + 
                 level.questionWordDetective.length * 3 + 
                 level.grammarConstructor.length * 3
    }, 0)
    
    return totalPossibleStars > 0 ? (totalStars.value / totalPossibleStars) * 100 : 0
  })
  
  const dailyTarget = computed(() => {
    return {
      gamesPlayed: 3,
      starsEarned: 6,
      timeSpent: 20, // minutes
      progress: Math.min(
        (dailyProgress.value.gamesPlayed / 3) * 100,
        100
      )
    }
  })
  
  const weeklyStats = computed(() => {
    // ここでは仮のデータ。実際は過去7日間のデータを計算
    return {
      gamesPlayed: dailyProgress.value.gamesPlayed * 7,
      starsEarned: dailyProgress.value.starsEarned * 7,
      averageAccuracy: 85,
      improvementTrend: '+5%'
    }
  })
  
  // 進捗更新
  const updateGameProgress = (gameId, planetId, result) => {
    logger.log('📊 Updating progress:', { gameId, planetId, result })
    
    // ゲーム進捗更新
    if (!gameProgress.value[gameId]) {
      gameProgress.value[gameId] = {
        attempts: 0,
        bestScore: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        totalStars: 0,
        completions: 0
      }
    }
    
    const gameStats = gameProgress.value[gameId]
    gameStats.attempts++
    gameStats.bestScore = Math.max(gameStats.bestScore, result.score)
    gameStats.bestAccuracy = Math.max(gameStats.bestAccuracy, result.accuracy)
    gameStats.averageAccuracy = Math.round(
      (gameStats.averageAccuracy * (gameStats.attempts - 1) + result.accuracy) / gameStats.attempts
    )
    gameStats.totalStars += result.starsEarned
    
    if (result.accuracy >= 70) {
      gameStats.completions++
    }
    
    // 惑星進捗更新
    if (planetId && !planetProgress.value[planetId]) {
      planetProgress.value[planetId] = {
        visits: 0,
        gamesCompleted: 0,
        totalStars: 0,
        averagePerformance: 0
      }
    }
    
    if (planetId) {
      const planetStats = planetProgress.value[planetId]
      planetStats.visits++
      planetStats.totalStars += result.starsEarned
      
      if (result.accuracy >= 70) {
        planetStats.gamesCompleted++
      }
    }
    
    // 総合進捗更新
    totalStars.value += result.starsEarned
    
    // デイリー進捗更新
    updateDailyProgress(result)
    
    // アチーブメントチェック
    checkAchievements(result, gameId, planetId)
    
    // 学習統計更新
    updateLearningStats(result, gameId, planetId)
    
    // 進捗保存
    saveProgress()
  }
  
  // デイリー進捗更新
  const updateDailyProgress = (result) => {
    const today = new Date().toISOString().split('T')[0]
    
    // 日付チェック
    if (dailyProgress.value.date !== today) {
      resetDailyProgress()
      dailyProgress.value.date = today
    }
    
    dailyProgress.value.gamesPlayed++
    dailyProgress.value.starsEarned += result.starsEarned
    dailyProgress.value.timeSpent += Math.round((result.completionTime || 60) / 60) // 分に変換
    
    // 目標達成チェック
    if (dailyProgress.value.gamesPlayed >= dailyTarget.value.gamesPlayed &&
        dailyProgress.value.starsEarned >= dailyTarget.value.starsEarned) {
      dailyProgress.value.targetReached = true
      
      // 目標達成アチーブメント
      unlockAchievement('daily_target_reached')
    }
  }
  
  // デイリー進捗リセット
  const resetDailyProgress = () => {
    dailyProgress.value = {
      gamesPlayed: 0,
      starsEarned: 0,
      timeSpent: 0,
      streak: 0,
      targetReached: false,
      date: new Date().toISOString().split('T')[0]
    }
  }
  
  // アチーブメントチェック
  const checkAchievements = (result, gameId, planetId) => {
    availableAchievements.value.forEach(achievement => {
      if (achievement.unlocked) return
      
      let shouldUnlock = false
      const req = achievement.requirement
      
      switch (achievement.type) {
        case 'milestone':
          if (req.stars && totalStars.value >= req.stars) {
            shouldUnlock = true
          }
          break
          
        case 'performance':
          if (req.accuracy && result.accuracy >= req.accuracy) {
            shouldUnlock = true
          }
          break
          
        case 'skill':
          if (req.averageReactionTime && result.averageReactionTime <= req.averageReactionTime) {
            shouldUnlock = true
          }
          break
          
        case 'game_completion':
          if (req.gameId === gameId && gameProgress.value[gameId]?.completions >= 1) {
            shouldUnlock = true
          }
          break
          
        case 'streak':
          if (req.gameId === gameId && result.maxStreak >= req.streak) {
            shouldUnlock = true
          }
          break
      }
      
      if (shouldUnlock) {
        unlockAchievement(achievement.id)
      }
    })
  }
  
  // アチーブメント解除
  const unlockAchievement = (achievementId) => {
    const achievement = availableAchievements.value.find(a => a.id === achievementId)
    if (!achievement || achievement.unlocked) return
    
    achievement.unlocked = true
    achievement.unlockedAt = new Date().toISOString()
    
    // アチーブメントリストに追加
    achievements.value.push({ ...achievement })
    recentAchievements.value.unshift({ ...achievement })
    
    // 最新3件のみ保持
    if (recentAchievements.value.length > 3) {
      recentAchievements.value.pop()
    }
    
    logger.log('🏆 Achievement Unlocked:', achievement.name)
    
    // 通知表示（実際のUI実装では通知コンポーネントを使用）
    showAchievementNotification(achievement)
  }
  
  // アチーブメント通知表示
  const showAchievementNotification = (achievement) => {
    // ここでは単純にconsoleログ。実際の実装では通知UIを表示
    logger.log(`🎉 Achievement Unlocked: ${achievement.icon} ${achievement.name}`)
  }
  
  // 学習統計更新
  const updateLearningStats = (result, gameId, planetId) => {
    learningStats.value.totalGameSessions++
    learningStats.value.totalPlayTime += result.completionTime || 60
    learningStats.value.averageSessionTime = Math.round(
      learningStats.value.totalPlayTime / learningStats.value.totalGameSessions
    )
    
    // お気に入り惑星・ゲーム更新（最も多くプレイしているもの）
    // 実装は簡略化
  }
  
  // 進捗データ保存
  const saveProgress = () => {
    try {
      const progressData = {
        totalStars: totalStars.value,
        planetProgress: planetProgress.value,
        gameProgress: gameProgress.value,
        dailyProgress: dailyProgress.value,
        achievements: achievements.value,
        learningStats: learningStats.value,
        lastSaved: new Date().toISOString()
      }
      
      localStorage.setItem('grammarGalaxyFoundationProgress', JSON.stringify(progressData))
      logger.log('💾 Progress saved successfully')
    } catch (error) {
      logger.error('❌ Failed to save progress:', error)
    }
  }
  
  // 進捗データ読み込み
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('grammarGalaxyFoundationProgress')
      if (saved) {
        const data = JSON.parse(saved)
        
        totalStars.value = data.totalStars || 0
        planetProgress.value = data.planetProgress || {}
        gameProgress.value = data.gameProgress || {}
        dailyProgress.value = data.dailyProgress || resetDailyProgress()
        achievements.value = data.achievements || []
        learningStats.value = data.learningStats || {}
        
        // 最新のアチーブメントを設定
        recentAchievements.value = achievements.value
          .filter(a => a.unlockedAt)
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
          .slice(0, 3)
        
        logger.log('📁 Progress loaded successfully')
        return true
      }
    } catch (error) {
      logger.error('❌ Failed to load progress:', error)
    }
    return false
  }
  
  // 進捗リセット
  const resetProgress = () => {
    totalStars.value = 0
    planetProgress.value = {}
    gameProgress.value = {}
    resetDailyProgress()
    achievements.value = []
    recentAchievements.value = []
    learningStats.value = {
      totalGameSessions: 0,
      totalPlayTime: 0,
      averageSessionTime: 0,
      favoritePlanet: null,
      favoriteGame: null,
      strongestSkill: null,
      improvementAreas: []
    }
    
    // アチーブメントをリセット
    availableAchievements.value.forEach(achievement => {
      achievement.unlocked = false
      delete achievement.unlockedAt
    })
    
    saveProgress()
    logger.log('🔄 Progress reset successfully')
  }
  
  // 詳細統計取得
  const getDetailedStats = () => {
    return {
      overall: {
        totalStars: totalStars.value,
        currentLevel: currentPlayerLevel.value,
        overallProgress: overallProgress.value,
        starsToNextLevel: starsToNextLevel.value
      },
      daily: {
        ...dailyProgress.value,
        target: dailyTarget.value
      },
      weekly: weeklyStats.value,
      achievements: {
        total: achievements.value.length,
        recent: recentAchievements.value,
        unlockRate: (achievements.value.length / availableAchievements.value.length) * 100
      },
      games: gameProgress.value,
      planets: planetProgress.value,
      learning: learningStats.value
    }
  }

  // 統一ゲームエンジン用の進捗更新
  const updateProgress = (progressData) => {
    const {
      gameId,
      learningArea,
      score,
      accuracy,
      timeSpent,
      completed,
      starsEarned = calculateStars(accuracy, score),
      completionTime = timeSpent
    } = progressData

    const result = {
      score,
      accuracy,
      starsEarned,
      completionTime,
      averageReactionTime: timeSpent / (score / 100) // 概算
    }

    // 既存の進捗更新メソッドを使用
    updateGameProgress(gameId, learningArea, result)
  }

  // 星の数を計算
  const calculateStars = (accuracy, score) => {
    if (accuracy >= 95 && score >= 1000) return 3
    if (accuracy >= 80 && score >= 500) return 2
    if (accuracy >= 60 && score >= 200) return 1
    return 0
  }

  // 全体進捗取得（ロードマップ用）
  const getOverallProgress = () => {
    return {
      totalXP: totalStars.value * 100,
      level: currentPlayerLevel.value,
      overallProgress: overallProgress.value,
      areaProgress: {
        [LEARNING_AREAS.PHONICS]: getAreaProgress(LEARNING_AREAS.PHONICS),
        [LEARNING_AREAS.GRAMMAR]: getAreaProgress(LEARNING_AREAS.GRAMMAR),
        [LEARNING_AREAS.VOCABULARY]: getAreaProgress(LEARNING_AREAS.VOCABULARY),
        [LEARNING_AREAS.PRONUNCIATION]: getAreaProgress(LEARNING_AREAS.PRONUNCIATION),
        [LEARNING_AREAS.TYPING]: getAreaProgress(LEARNING_AREAS.TYPING),
        [LEARNING_AREAS.LISTENING]: getAreaProgress(LEARNING_AREAS.LISTENING),
        [LEARNING_AREAS.INTEGRATED]: getAreaProgress(LEARNING_AREAS.INTEGRATED)
      }
    }
  }

  // 分野別進捗取得
  const getAreaProgress = (area) => {
    const areaGames = Object.keys(gameProgress.value).filter(gameId => {
      // ゲームIDから学習分野を推測（実際の実装では gameConfig を使用）
      if (area === LEARNING_AREAS.GRAMMAR) return gameId.includes('verb') || gameId.includes('grammar')
      if (area === LEARNING_AREAS.PHONICS) return gameId.includes('sound') || gameId.includes('phonics')
      if (area === LEARNING_AREAS.VOCABULARY) return gameId.includes('word') || gameId.includes('vocabulary')
      if (area === LEARNING_AREAS.TYPING) return gameId.includes('typing')
      return false
    })

    const totalGames = areaGames.length || 1
    const completedGames = areaGames.filter(gameId =>
      gameProgress.value[gameId]?.completions > 0
    ).length

    return Math.round((completedGames / totalGames) * 100)
  }

  // 推奨ゲーム取得
  const getRecommendedGames = (playerLevel = null, currentArea = null) => {
    const level = playerLevel || currentPlayerLevel.value
    const recommendations = []

    // プレイヤーのレベルと弱点に基づいて推奨
    const weakAreas = Object.entries(getOverallProgress().areaProgress)
      .filter(([area, progress]) => progress < 70)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)

    weakAreas.forEach(([area, progress]) => {
      // 各分野の推奨ゲームを追加
      if (area === LEARNING_AREAS.PHONICS) {
        recommendations.push({
          gameId: 'sound-farm',
          reason: 'フォニックスの基礎を強化しましょう',
          priority: 'high'
        })
      } else if (area === LEARNING_AREAS.GRAMMAR) {
        recommendations.push({
          gameId: 'be-verb-rush',
          reason: '文法の理解を深めましょう',
          priority: 'medium'
        })
      }
    })

    return recommendations
  }
  
  return {
    // State
    totalStars,
    planetProgress,
    gameProgress,
    dailyProgress,
    achievements,
    recentAchievements,
    availableAchievements,
    learningStats,
    
    // Computed
    currentPlayerLevel,
    starsToNextLevel,
    overallProgress,
    dailyTarget,
    weeklyStats,
    
    // Methods
    updateGameProgress,
    updateDailyProgress,
    resetDailyProgress,
    checkAchievements,
    unlockAchievement,
    saveProgress,
    loadProgress,
    resetProgress,
    getDetailedStats,

    // Unified Engine Methods
    updateProgress,
    getOverallProgress,
    getAreaProgress,
    getRecommendedGames,
    getPlayerLevel: () => currentPlayerLevel.value
  }
}