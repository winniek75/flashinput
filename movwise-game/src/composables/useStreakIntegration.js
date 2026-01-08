// src/composables/useStreakIntegration.js - ゲームとストリークの統合ヘルパー
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStreakStore, useStreakHelper } from '@/stores/streakStore'
import { useQuestIntegration } from '@/stores/questStore'
import { useReminderStore } from '@/stores/reminderStore'
import { useLearningRecommendationEngine } from '@/services/learningRecommendationEngine'
import { useAdaptiveDifficultySystem } from '@/services/adaptiveDifficultySystem'
import { useBehaviorAnalysisStore } from '@/stores/behaviorAnalysisStore'
import logger from '@/utils/logger'

export function useStreakIntegration(gameId, options = {}) {
  const streakStore = useStreakStore()
  const streakHelper = useStreakHelper()
  const { recordQuestProgress } = useQuestIntegration()
  const reminderStore = useReminderStore()
  const recommendationEngine = useLearningRecommendationEngine()
  const difficultySystem = useAdaptiveDifficultySystem()
  const behaviorStore = useBehaviorAnalysisStore()

  // オプションのデフォルト値
  const config = {
    showStreakDisplay: true,
    autoRecord: true,
    minimumPlayTime: 0, // 秒
    minimumScore: 0,
    trackProgress: true,
    celebrateMillestones: true,
    ...options
  }

  // リアクティブ状態
  const gameStartTime = ref(null)
  const gameEndTime = ref(null)
  const isGameActive = ref(false)
  const gameScore = ref(0)
  const streakBefore = ref(0)
  const showCelebration = ref(false)
  const celebrationData = ref(null)

  // AI統合状態
  const aiDifficultyConfig = ref(null)
  const recommendations = ref(null)
  const adaptiveDifficulty = ref(0.5)
  const currentUserId = ref(null)

  // 計算プロパティ
  const playTime = computed(() => {
    if (!gameStartTime.value || !gameEndTime.value) return 0
    return Math.floor((gameEndTime.value - gameStartTime.value) / 1000)
  })

  const streakInfo = computed(() => ({
    current: streakStore.currentStreak,
    longest: streakStore.longestStreak,
    status: streakStore.streakStatus,
    level: streakStore.streakLevel,
    progress: streakStore.todayProgress,
    nextMilestone: streakStore.nextMilestone,
    shields: streakStore.streakShields
  }))

  const gameProgress = computed(() => ({
    dailyProgress: streakStore.todayProgress,
    gamesPlayedToday: streakStore.dailyGoal.gamesPlayed,
    gamesRequired: streakStore.dailyGoal.requiredGames,
    goalCompleted: streakStore.dailyGoal.completed
  }))

  // メソッド
  const startGame = async (gameData = {}) => {
    logger.log(`🎮 Starting AI-enhanced streak-integrated game: ${gameId}`)

    gameStartTime.value = Date.now()
    isGameActive.value = true
    streakBefore.value = streakStore.currentStreak
    gameScore.value = 0
    currentUserId.value = gameData.userId || 'guest'

    // AI推薦エンジンから推薦を取得
    try {
      recommendations.value = await recommendationEngine.generateRecommendations(
        currentUserId.value,
        {
          gameId,
          sessionType: gameData.sessionType || 'regular',
          availableTime: gameData.availableTime || 15,
          energyLevel: gameData.energyLevel || 'medium'
        }
      )

      logger.log('🎯 AI Recommendations generated:', {
        count: recommendations.value.recommendations.length,
        confidence: recommendations.value.confidence
      })
    } catch (error) {
      logger.warn('Failed to generate AI recommendations:', error)
      recommendations.value = null
    }

    // 適応的難易度システム初期化
    try {
      aiDifficultyConfig.value = await difficultySystem.initializeGameDifficulty(
        gameId,
        currentUserId.value,
        {
          sessionType: gameData.sessionType || 'regular',
          energyLevel: gameData.energyLevel || 'medium',
          timeConstraint: gameData.availableTime < 10 ? 'tight' : 'relaxed'
        }
      )

      adaptiveDifficulty.value = aiDifficultyConfig.value.difficulty

      logger.log('🎚️ Adaptive difficulty initialized:', {
        difficulty: adaptiveDifficulty.value.toFixed(3),
        settings: aiDifficultyConfig.value.settings
      })
    } catch (error) {
      logger.warn('Failed to initialize adaptive difficulty:', error)
      aiDifficultyConfig.value = { difficulty: 0.5, settings: {} }
    }

    // 行動分析ストアに学習セッション開始を記録
    behaviorStore.recordGameSession(gameId, 'started', {
      difficulty: adaptiveDifficulty.value,
      recommendations: recommendations.value?.recommendations?.length || 0,
      streakLevel: streakStore.streakLevel
    })

    // ゲーム開始時の統計記録
    recordGameEvent('game_started', {
      gameId,
      timestamp: new Date().toISOString(),
      streakStatus: streakStore.streakStatus,
      dailyProgress: streakStore.todayProgress,
      aiDifficulty: adaptiveDifficulty.value,
      hasRecommendations: !!recommendations.value,
      ...gameData
    })

    return {
      streakInfo: streakInfo.value,
      encouragement: generateEncouragement('start'),
      aiConfig: {
        difficulty: adaptiveDifficulty.value,
        settings: aiDifficultyConfig.value?.settings || {},
        recommendations: recommendations.value?.recommendations?.slice(0, 3) || []
      }
    }
  }

  const endGame = (gameResult = {}) => {
    if (!isGameActive.value) {
      logger.warn('Cannot end game - no active game session')
      return null
    }

    logger.log(`🏁 Ending streak-integrated game: ${gameId}`)

    gameEndTime.value = Date.now()
    isGameActive.value = false

    // ゲームスコア更新
    if (gameResult.score !== undefined) {
      gameScore.value = gameResult.score
    }

    // プレイ時間計算
    const totalPlayTime = playTime.value

    // リマインダーストアに学習アクティビティを記録
    if (reminderStore && totalPlayTime > 0) {
      reminderStore.recordActivity(gameId, Math.floor(totalPlayTime / 60)) // 分単位で記録
    }

    // 自動記録条件チェック
    if (config.autoRecord) {
      const shouldRecord =
        totalPlayTime >= config.minimumPlayTime &&
        gameScore.value >= config.minimumScore

      if (shouldRecord) {
        recordGameActivity({
          score: gameScore.value,
          playTime: totalPlayTime,
          completed: gameResult.completed || false,
          accuracy: gameResult.accuracy || 0,
          ...gameResult
        })
      } else {
        logger.log('Game did not meet recording criteria', {
          playTime: totalPlayTime,
          minimumPlayTime: config.minimumPlayTime,
          score: gameScore.value,
          minimumScore: config.minimumScore
        })
      }
    }

    // ゲーム終了時の統計記録
    recordGameEvent('game_ended', {
      gameId,
      duration: totalPlayTime,
      score: gameScore.value,
      result: gameResult,
      streakAfter: streakStore.currentStreak
    })

    // AI分析データを行動ストアに記録
    if (currentUserId.value && currentUserId.value !== 'guest') {
      behaviorStore.recordGameSession(gameId, 'completed', {
        duration: totalPlayTime,
        score: gameScore.value,
        difficulty: adaptiveDifficulty.value,
        result: gameResult,
        streakImprovement: streakStore.currentStreak > streakBefore.value
      })
    }

    return {
      streakInfo: streakInfo.value,
      playTime: totalPlayTime,
      encouragement: generateEncouragement('end', gameResult),
      progression: {
        streakBefore: streakBefore.value,
        streakAfter: streakStore.currentStreak,
        improved: streakStore.currentStreak > streakBefore.value
      },
      aiAnalysis: {
        finalDifficulty: adaptiveDifficulty.value,
        performanceVsExpected: gameResult.score ?
          (gameScore.value / 100) - adaptiveDifficulty.value : 0,
        recommendationsUsed: recommendations.value ?
          recommendations.value.recommendations.length : 0
      }
    }
  }

  const recordGameActivity = (gameData = {}) => {
    logger.log(`📊 Recording game activity for: ${gameId}`)

    try {
      const result = streakStore.recordActivity(gameId, {
        score: gameScore.value,
        playTime: playTime.value,
        timestamp: new Date().toISOString(),
        ...gameData
      })

      // クエスト進捗記録
      const questData = {
        gameCompleted: true,
        gameId,
        score: gameScore.value,
        playTime: playTime.value,
        accuracy: gameData.accuracy || 0,
        perfectHits: gameData.perfectHits || 0,
        correctAnswers: gameData.correctAnswers || 0,
        newWords: gameData.newWords || 0,
        studyTime: Math.floor(playTime.value / 60), // 分単位
        streakMaintained: result.streak >= streakBefore.value,
        ...gameData
      }

      recordQuestProgress(questData)

      // マイルストーン達成チェック
      if (config.celebrateMillestones && result.streak > streakBefore.value) {
        checkForCelebration(result)
      }

      return result
    } catch (error) {
      logger.error('Failed to record game activity:', error)
      return null
    }
  }

  const manualRecord = (customData = {}) => {
    return recordGameActivity(customData)
  }

  const updateScore = (newScore) => {
    gameScore.value = newScore
  }

  const checkForCelebration = (result) => {
    const milestones = streakStore.milestones
    const currentStreak = result.streak || streakStore.currentStreak

    // 新しいマイルストーンに到達したかチェック
    const newMilestone = milestones.find(m =>
      m <= currentStreak &&
      m > streakBefore.value &&
      !streakStore.claimedMilestones.includes(m)
    )

    if (newMilestone) {
      const reward = streakStore.getMilestoneReward(newMilestone)

      celebrationData.value = {
        milestone: newMilestone,
        reward,
        previousStreak: streakBefore.value,
        currentStreak
      }

      showCelebration.value = true

      logger.log(`🎉 Celebration triggered for ${newMilestone} days!`)
    }
  }

  const dismissCelebration = () => {
    showCelebration.value = false
    celebrationData.value = null
  }

  const generateEncouragement = (phase, result = {}) => {
    const messages = {
      start: {
        none: [
          "さあ始めよう！新しいストリークの始まり！",
          "今日も頑張ろう！✨",
          "学習の冒険に出発！🚀"
        ],
        at_risk: [
          `${streakStore.currentStreak}日の記録を守ろう！💪`,
          "ストリークを継続するチャンス！",
          "あと少しで今日の目標達成！🔥"
        ],
        active: [
          `素晴らしい！${streakStore.currentStreak}日連続中！`,
          "調子がいいね！このまま続けよう！",
          "学習習慣が身についてる！👏"
        ]
      },
      end: {
        good_score: [
          "素晴らしい結果！ストリークも継続中！🎉",
          "完璧！学習効果が出てるね！⭐",
          "この調子で頑張ろう！🔥"
        ],
        milestone: [
          `🏆 ${streakStore.currentStreak}日達成！新記録！`,
          "マイルストーン到達！すごいぞ！",
          "継続は力なり！素晴らしい！"
        ],
        regular: [
          "お疲れ様！今日もよく頑張った！",
          "毎日の積み重ねが大切！👍",
          "また明日も一緒に学習しよう！"
        ]
      }
    }

    const status = streakStore.streakStatus

    if (phase === 'start') {
      const options = messages.start[status] || messages.start.none
      return options[Math.floor(Math.random() * options.length)]
    } else if (phase === 'end') {
      let category = 'regular'

      if (result.score > 90) category = 'good_score'
      if (streakStore.currentStreak > streakBefore.value) category = 'milestone'

      const options = messages.end[category]
      return options[Math.floor(Math.random() * options.length)]
    }

    return "頑張ろう！"
  }

  const recordGameEvent = (eventType, data) => {
    // 分析用のイベント記録（オプション）
    if (config.trackProgress) {
      try {
        const event = {
          type: eventType,
          gameId,
          timestamp: new Date().toISOString(),
          ...data
        }

        // 分析システムに送信（将来的にAnalyticsStoreと連携）
        logger.log('Game event recorded:', event)
      } catch (error) {
        logger.error('Failed to record game event:', error)
      }
    }
  }

  const getStreakBonus = () => {
    // ストリークレベルに基づくボーナス計算
    const level = streakStore.streakLevel
    const bonuses = {
      none: 1.0,
      starter: 1.1,    // 10% ボーナス
      common: 1.2,     // 20% ボーナス
      uncommon: 1.3,   // 30% ボーナス
      rare: 1.5,       // 50% ボーナス
      epic: 2.0,       // 100% ボーナス
      legendary: 3.0   // 300% ボーナス
    }

    return bonuses[level] || 1.0
  }

  const applyStreakBonus = (baseScore) => {
    const bonus = getStreakBonus()
    return Math.floor(baseScore * bonus)
  }

  // リアルタイム難易度調整メソッド
  const adjustDifficultyRealtime = async (performanceData) => {
    if (!aiDifficultyConfig.value) return null

    try {
      const adjustmentResult = await difficultySystem.adjustDifficultyRealtime(gameId, {
        ...performanceData,
        expectedResponseTime: aiDifficultyConfig.value.settings.responseTime || 3000,
        currentDifficulty: adaptiveDifficulty.value
      })

      if (adjustmentResult && adjustmentResult.adjusted) {
        adaptiveDifficulty.value = adjustmentResult.difficulty
        aiDifficultyConfig.value.settings = adjustmentResult.settings

        logger.log(`⚡ Real-time difficulty adjusted to ${adaptiveDifficulty.value.toFixed(3)}`)

        return {
          newDifficulty: adaptiveDifficulty.value,
          newSettings: adjustmentResult.settings,
          reason: adjustmentResult.reason
        }
      }

      return null
    } catch (error) {
      logger.warn('Failed to adjust difficulty in real-time:', error)
      return null
    }
  }

  // AI推薦を取得
  const getAIRecommendations = () => {
    return recommendations.value?.recommendations || []
  }

  // 現在の難易度設定取得
  const getCurrentDifficultySettings = () => {
    return aiDifficultyConfig.value?.settings || {}
  }

  // ライフサイクル
  onMounted(() => {
    // ストア初期化
    streakStore.initializeStore()

    logger.log(`📱 Streak integration mounted for game: ${gameId}`, {
      config,
      streakInfo: streakInfo.value
    })
  })

  onUnmounted(() => {
    // 未完了のゲームがあれば記録
    if (isGameActive.value) {
      logger.log('Cleaning up active game session')
      endGame({ completed: false, reason: 'component_unmounted' })
    }
  })

  // 公開API
  return {
    // 状態
    isGameActive,
    gameScore,
    playTime,
    streakInfo,
    gameProgress,
    showCelebration,
    celebrationData,

    // AI状態
    adaptiveDifficulty,
    recommendations,
    aiDifficultyConfig,

    // メソッド
    startGame,
    endGame,
    recordGameActivity,
    manualRecord,
    updateScore,
    dismissCelebration,
    getStreakBonus,
    applyStreakBonus,

    // AI統合メソッド
    adjustDifficultyRealtime,
    getAIRecommendations,
    getCurrentDifficultySettings,

    // ヘルパー
    generateEncouragement,

    // ストリークヘルパー（再エクスポート）
    recordGame: streakHelper.recordGame,
    getStreakInfo: streakHelper.getStreakInfo,
    getRewards: streakHelper.getRewards
  }
}

// ゲーム結果計算用ユーティリティ
export function calculateGameScore(rawScore, gameConfig = {}) {
  const {
    baseMultiplier = 1.0,
    accuracyWeight = 0.3,
    speedWeight = 0.2,
    completionWeight = 0.5
  } = gameConfig

  // 基本スコア計算
  let finalScore = rawScore * baseMultiplier

  // 精度ボーナス
  if (gameConfig.accuracy !== undefined) {
    finalScore += (rawScore * accuracyWeight * (gameConfig.accuracy / 100))
  }

  // 速度ボーナス
  if (gameConfig.averageTime && gameConfig.targetTime) {
    const speedRatio = gameConfig.targetTime / gameConfig.averageTime
    const speedBonus = Math.max(0, speedRatio - 1) * speedWeight
    finalScore += (rawScore * speedBonus)
  }

  // 完了ボーナス
  if (gameConfig.completed) {
    finalScore += (rawScore * completionWeight)
  }

  return Math.floor(finalScore)
}