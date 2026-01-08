// stores/gameStore.js - 修正版
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import logger from '@/utils/logger'

export const useGameStore = defineStore('game', () => {
  // オンボーディング完了フラグ
  const hasCompletedOnboarding = ref(false)
  
  // プレイヤーデータ（統一レベルシステム対応）
  const playerData = ref({
    // 統一レベルシステム
    unifiedLevel: 1,
    skillLevels: {
      phonics: 1,
      vocabulary: 1,
      grammar: 1,
      communication: 1
    },
    totalExperience: 250,
    levelExperience: 0,
    eikenLevel: '英検5級準備',
    eikenGrade: '小学1-2年',
    
    // 宇宙テーマデータ
    captainLevel: 1,
    cosmicEnergy: 250,
    soundGems: 150,
    avatar: '🦸‍♂️',
    title: 'スペース・レンジャー',
    joinDate: Date.now(),
    lastLoginDate: Date.now(),
    loginStreak: 1,
    totalPlayTime: 0,
    lastPlayed: null,
    navigationDays: 1,
    explorationPoints: 750,
    
    // レベルアップ履歴
    levelUpHistory: [],
    lastLevelUp: null,
    unlockedContent: ['Basic Phonics Games'],
    
    // 後方互換性のための旧フィールド
    level: 1,
    exp: 250,
    streak: 1
  })

  // ゲーム進捗データ
  const gameProgress = ref({
    // フォニックスゲーム
    pureSoundLab: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPhonemes: [],
      progress: 0
    },
    singlePhoneme: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPhonemes: [],
      progress: 0
    },
    soundHunter: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredSounds: [],
      progress: 0
    },
    phonicsTrainingHub: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    sequentialBlending: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredBlends: [],
      progress: 0
    },
    blendingBuilder: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    cvcWord: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    rhyming: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    rhythmTapper: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredRhythms: [],
      progress: 0
    },
    magicCastleJump: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0
    },
    magicCardBattle: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      averagePronunciation: 0,
      progress: 0
    },
    spellRacing: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredCommands: [],
      averageAccuracy: 0,
      progress: 0
    },
    magicCooking: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredMagic: [],
      averagePronunciation: 0,
      completedDishes: 0,
      progress: 0
    },
    voicePuzzle: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      overallAccuracy: 0,
      completedPuzzles: 0,
      progress: 0
    },
    // その他のフォニックスゲーム
    silentLetterDetective: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    complexPhonemePatterns: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    magicEGalaxyBuilder: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      completedPlanets: [],
      masteredPatterns: [],
      progress: 0,
      galaxiesCreated: 0,
      totalBlocksPlaced: 0,
      magicETransformations: 0,
      currentLevel: 1,
      unlockedGalaxies: ['novice']
    },
    // 文法ゲーム
    grammarColorCode: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredConcepts: [],
      progress: 0
    },
    beVerbRush: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    patternHunter: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredPatterns: [],
      progress: 0
    },
    modalVerbChallenge: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredModals: [],
      progress: 0
    },
    timeZoneNavigator: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredTenses: [],
      progress: 0
    },
    // 語彙ゲーム
    wordRush: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredWords: [],
      progress: 0,
      difficultyProgress: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      }
    },
    // 新規代名詞学習ゲーム
    holographicStoryDeck: {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      completedScenarios: 0,
      totalScenarios: 10,
      accuracy: 0,
      masteredPronouns: [],
      progress: 0
    },
  })

  // 統計データ
  const gameStats = ref({
    totalPlayTime: 0,
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalAttempts: 0,
    dailyStats: {},
    weeklyStats: {},
    monthlyStats: {},
    wordRush: {
      gamesPlayed: 0,
      totalScore: 0,
      bestScore: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      vocabularyMastery: {
        beginner: 0,
        intermediate: 0,
        advanced: 0
      },
      spatialReadiness: 0
    }
  })

  // 実績データ
  const achievements = ref({
    firstStep: { earned: false, earnedDate: null },
    streakStar: { earned: false, earnedDate: null },
    perfectPlayer: { earned: false, earnedDate: null },
    phonicsMaster: { earned: false, earnedDate: null },
    speedDemon: { earned: false, earnedDate: null },
    comboKing: { earned: false, earnedDate: null },
    wordRushChampion: { earned: false, earnedDate: null },
    speedMaster: { earned: false, earnedDate: null },
    vocabularyExpert: { earned: false, earnedDate: null },
    vrReady: { earned: false, earnedDate: null }
  })

  // ゲーム設定（音声・バイブ・自動再生など）
  const gameSettings = ref({
    soundEnabled: true,
    vibrationEnabled: true,
    autoPlayAudio: false,
    volume: 1.0
  })

  // 計算プロパティ（宇宙テーマ）
  const playerLevel = computed(() => playerData.value.captainLevel || playerData.value.level)
  const playerExp = computed(() => playerData.value.cosmicEnergy || playerData.value.exp)
  const playerSoundGems = computed(() => playerData.value.soundGems)
  const playerStreak = computed(() => playerData.value.navigationDays || playerData.value.streak)

  // 宇宙船ステータス計算
  const spaceshipStatus = computed(() => ({
    captainLevel: Math.floor((playerData.value.cosmicEnergy || playerData.value.exp) / 1000) + 1,
    exploredPlanets: Math.floor((playerData.value.explorationPoints || 0) / 500),
    navigationDays: playerData.value.navigationDays || playerData.value.streak || 0,
    energyLevel: Math.min(100, ((playerData.value.cosmicEnergy || playerData.value.exp) % 1000) / 10),
    cosmicEnergy: playerData.value.cosmicEnergy || playerData.value.exp || 0,
    explorationPoints: playerData.value.explorationPoints || 0
  }))

  // ゲーム進捗の取得
  const getGameProgress = (gameId) => {
    return gameProgress.value[gameId] || {
      completed: false,
      bestScore: 0,
      attempts: 0,
      lastPlayed: null,
      masteredItems: [],
      progress: 0
    }
  }

  // ステージ進捗の計算
  const getStageProgress = (stageId) => {
    const stageGames = {
      beginnerBeach: ['singlePhoneme'],
      blendingBay: ['blendingBuilder', 'cvcWord'],
      rhythmRidge: ['rhyming', 'rhythmTapper'],
      masterMountain: ['phonicsBoss', 'speedChallenge']
    }

    const games = stageGames[stageId] || []
    if (games.length === 0) return 0

    const totalProgress = games.reduce((sum, gameId) => {
      const progress = gameProgress.value[gameId]
      return sum + (progress ? progress.progress : 0)
    }, 0)

    return Math.round(totalProgress / games.length)
  }

  // ゲーム完了率の計算
  const getCompletionRate = () => {
    const totalGames = Object.keys(gameProgress.value).length
    const completedGames = Object.values(gameProgress.value).filter(game => game.completed).length
    return totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0
  }

  // メソッド
  const updatePlayerData = (data) => {
    playerData.value = { ...playerData.value, ...data }
    saveToLocalStorage()
  }

  // Magic E Galaxy Builder専用の進捗更新
  const updatePhonicsProgress = (data) => {
    if (data.magicEGalaxyBuilder) {
      const magicEData = data.magicEGalaxyBuilder
      gameProgress.value.magicEGalaxyBuilder = {
        ...gameProgress.value.magicEGalaxyBuilder,
        ...magicEData,
        lastPlayed: new Date().toISOString()
      }
      
      // レベルとスコアに基づいて経験値を付与
      const expGain = Math.floor(magicEData.totalScore / 100) || 0
      const gemGain = Math.floor(expGain / 10) || 0
      
      playerData.value.exp += expGain
      playerData.value.cosmicEnergy += expGain
      playerData.value.soundGems += gemGain
      
      // 統一レベルシステム更新
      updateUnifiedLevel('magicEGalaxyBuilder', gameProgress.value.magicEGalaxyBuilder)
      
      saveToLocalStorage()
    }
  }

  const updateGameProgress = (gameId, data) => {
    if (!gameProgress.value[gameId]) {
      gameProgress.value[gameId] = {
        completed: false,
        bestScore: 0,
        attempts: 0,
        lastPlayed: null,
        masteredItems: [],
        progress: 0
      }
    }

    // 前回のベストスコアと比較
    const previousBest = gameProgress.value[gameId].bestScore
    const newScore = data.bestScore || 0

    gameProgress.value[gameId] = {
      ...gameProgress.value[gameId],
      ...data,
      lastPlayed: new Date().toISOString(),
      attempts: (gameProgress.value[gameId].attempts || 0) + 1
    }

    // VR準備度サービス用に最後のゲーム結果を保存
    lastGameResult.value = {
      gameType: normalizeGameType(gameId),
      gameId,
      ...data,
      timestamp: new Date().toISOString()
    }

    // ベストスコア更新時の報酬
    if (newScore > previousBest) {
      const expGain = Math.floor((newScore - previousBest) * 0.1)
      const gemGain = Math.floor(expGain / 10)

      playerData.value.exp += expGain
      playerData.value.soundGems += gemGain

      logger.log(`🎉 新記録！ +${expGain}EXP, +${gemGain}ジェム`)
    }

    // 統一レベルシステム更新
    updateUnifiedLevel(gameId, gameProgress.value[gameId])

    // レベルアップチェック（後方互換性）
    checkLevelUp()

    // 実績チェック
    checkAchievements(gameId, data)

    saveToLocalStorage()
  }

  const updateGameStats = (gameId, stats) => {
    const today = new Date().toISOString().split('T')[0]
    const week = getWeekNumber(new Date())
    const month = new Date().toISOString().slice(0, 7) // YYYY-MM

    // 日次統計の更新
    if (!gameStats.value.dailyStats[today]) {
      gameStats.value.dailyStats[today] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 週次統計の更新
    if (!gameStats.value.weeklyStats[week]) {
      gameStats.value.weeklyStats[week] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 月次統計の更新
    if (!gameStats.value.monthlyStats[month]) {
      gameStats.value.monthlyStats[month] = {
        gamesPlayed: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        playTime: 0
      }
    }

    // 統計データの更新
    gameStats.value.totalGamesPlayed++
    gameStats.value.totalCorrectAnswers += stats.correctAnswers || 0
    gameStats.value.totalAttempts += stats.totalAttempts || 0
    gameStats.value.totalPlayTime += stats.playTime || 0

    gameStats.value.dailyStats[today].gamesPlayed++
    gameStats.value.dailyStats[today].correctAnswers += stats.correctAnswers || 0
    gameStats.value.dailyStats[today].totalAttempts += stats.totalAttempts || 0
    gameStats.value.dailyStats[today].playTime += stats.playTime || 0

    gameStats.value.weeklyStats[week].gamesPlayed++
    gameStats.value.weeklyStats[week].correctAnswers += stats.correctAnswers || 0
    gameStats.value.weeklyStats[week].totalAttempts += stats.totalAttempts || 0
    gameStats.value.weeklyStats[week].playTime += stats.playTime || 0

    gameStats.value.monthlyStats[month].gamesPlayed++
    gameStats.value.monthlyStats[month].correctAnswers += stats.correctAnswers || 0
    gameStats.value.monthlyStats[month].totalAttempts += stats.totalAttempts || 0
    gameStats.value.monthlyStats[month].playTime += stats.playTime || 0

    saveToLocalStorage()
  }

  const checkLevelUp = () => {
    const currentLevel = playerData.value.captainLevel || playerData.value.level
    const currentEnergy = playerData.value.cosmicEnergy || playerData.value.exp
    const expNeeded = currentLevel * 1000
    
    if (currentEnergy >= expNeeded) {
      const newLevel = currentLevel + 1
      playerData.value.captainLevel = newLevel
      playerData.value.level = newLevel  // 後方互換性
      
      const energyRemaining = currentEnergy - expNeeded
      playerData.value.cosmicEnergy = energyRemaining
      playerData.value.exp = energyRemaining  // 後方互換性

      // レベルアップ報酬
      const gemReward = newLevel * 50
      playerData.value.soundGems += gemReward

      logger.log(`🚀 船長レベルアップ！ Lv.${newLevel} (+${gemReward}ジェム)`)

      // レベルアップ時のタイトル更新
      updatePlayerTitle(newLevel)
    }
  }

  const updatePlayerTitle = (level) => {
    const titles = {
      1: 'スペース・ルーキー',
      5: 'ギャラクシー・レンジャー',
      10: 'コズミック・マスター',
      15: 'ステラー・ヒーロー',
      20: 'ギャラクシー・レジェンド'
    }

    if (titles[level]) {
      playerData.value.title = titles[level]
      logger.log(`👑 新しい称号獲得: ${titles[level]}`)
    }
  }

  const checkAchievements = (gameId, gameData) => {
    // 初回ゲームクリア
    if (!achievements.value.firstStep.earned && gameData.completed) {
      achievements.value.firstStep = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      logger.log('🏆 実績獲得: ファースト・ステップ')
    }

    // パーフェクトスコア
    if (!achievements.value.perfectPlayer.earned && gameData.bestScore >= 100) {
      achievements.value.perfectPlayer = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      logger.log('🏆 実績獲得: パーフェクト・プレイヤー')
    }

    // フォニックス・マスター（全音素習得）
    if (!achievements.value.phonicsMaster.earned && gameId === 'singlePhoneme') {
      const masteredPhonemes = gameData.masteredPhonemes || []
      if (masteredPhonemes.length >= 44) {
        achievements.value.phonicsMaster = {
          earned: true,
          earnedDate: new Date().toISOString()
        }
        logger.log('🏆 実績獲得: フォニックス・マスター')
      }
    }
  }

  const updateStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastPlayed = playerData.value.lastPlayed

    if (lastPlayed) {
      const lastPlayedDate = new Date(lastPlayed).toISOString().split('T')[0]
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastPlayedDate === yesterdayStr) {
        // 昨日プレイしていた場合、航行日数継続
        playerData.value.navigationDays++
        playerData.value.streak = playerData.value.navigationDays  // 後方互換性
      } else if (lastPlayedDate !== today) {
        // 1日以上空いた場合、航行日数リセット
        playerData.value.navigationDays = 1
        playerData.value.streak = 1  // 後方互換性
      }
      // 今日既にプレイ済みの場合は何もしない
    } else {
      // 初回プレイ
      playerData.value.navigationDays = 1
      playerData.value.streak = 1  // 後方互換性
    }

    playerData.value.lastPlayed = today

    // 航行日数実績チェック
    const currentDays = playerData.value.navigationDays || playerData.value.streak
    if (currentDays >= 7 && !achievements.value.streakStar.earned) {
      achievements.value.streakStar = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      logger.log('🏆 実績獲得: ギャラクシー・ナビゲーター')
    }

    saveToLocalStorage()
  }

  // デイリークエストの進捗更新
  const updateDailyQuest = (questType, progress = 1) => {
    const today = new Date().toISOString().split('T')[0]

    if (!gameStats.value.dailyQuests) {
      gameStats.value.dailyQuests = {}
    }

    if (!gameStats.value.dailyQuests[today]) {
      gameStats.value.dailyQuests[today] = {
        phonics: 0,
        blending: 0,
        perfect: 0
      }
    }

    gameStats.value.dailyQuests[today][questType] =
      Math.min((gameStats.value.dailyQuests[today][questType] || 0) + progress, 10)

    saveToLocalStorage()
  }
  
  // 統一レベルシステム機能
  const updateUnifiedLevel = (gameId, gameData) => {
    // スキル別進捗を更新
    updateSkillLevels(gameId, gameData)
    
    // 統一レベルを再計算
    const newUnifiedLevel = calculateUnifiedLevel()
    
    // レベルアップチェック
    if (newUnifiedLevel > playerData.value.unifiedLevel) {
      handleLevelUp(playerData.value.unifiedLevel, newUnifiedLevel)
      playerData.value.unifiedLevel = newUnifiedLevel
    }
    
    // 英検レベル更新
    updateEikenLevel()
    
    saveToLocalStorage()
  }

  const updateSkillLevels = (gameId, gameData) => {
    // スキルレベルの初期化を確認
    if (!playerData.value.skillLevels) {
      playerData.value.skillLevels = {
        phonics: 1,
        vocabulary: 1,
        grammar: 1,
        communication: 1
      }
    }
    
    const progress = gameData.progress || 0
    const masteredCount = getMasteredCount(gameId, gameData)
    
    // ゲームカテゴリに基づいてスキルレベル更新
    const gameCategory = getGameCategory(gameId)
    let skillBonus = Math.floor(progress / 10) + Math.floor(masteredCount / 5)
    
    switch (gameCategory) {
      case 'phonics':
        playerData.value.skillLevels.phonics = Math.min(100, 
          (playerData.value.skillLevels.phonics || 1) + skillBonus)
        break
      case 'vocabulary':
        playerData.value.skillLevels.vocabulary = Math.min(100, 
          (playerData.value.skillLevels.vocabulary || 1) + skillBonus)
        break
      case 'grammar':
        playerData.value.skillLevels.grammar = Math.min(100, 
          (playerData.value.skillLevels.grammar || 1) + skillBonus)
        break
      case 'communication':
        playerData.value.skillLevels.communication = Math.min(100, 
          (playerData.value.skillLevels.communication || 1) + skillBonus)
        break
    }
  }

  const calculateUnifiedLevel = () => {
    // スキルレベルの初期化を確認
    if (!playerData.value.skillLevels) {
      playerData.value.skillLevels = {
        phonics: 1,
        vocabulary: 1,
        grammar: 1,
        communication: 1
      }
    }
    
    const skills = playerData.value.skillLevels
    const weights = { phonics: 0.3, vocabulary: 0.25, grammar: 0.25, communication: 0.2 }
    
    const weightedSum = 
      (skills.phonics || 1) * weights.phonics +
      (skills.vocabulary || 1) * weights.vocabulary +
      (skills.grammar || 1) * weights.grammar +
      (skills.communication || 1) * weights.communication
    
    return Math.min(100, Math.max(1, Math.round(weightedSum)))
  }

  const getGameCategory = (gameId) => {
    const phonicsGames = [
      'pureSoundLab', 'singlePhoneme', 'soundHunter', 'phonicsTrainingHub',
      'sequentialBlending', 'blendingBuilder', 'silentLetterDetective', 'complexPhonemePatterns',
      'magicEGalaxyBuilder'
    ]
    const vocabularyGames = [
      'wordRush', 'sightWordMaster', 'cosmicWordFactory', 'cvcWord'
    ]
    const grammarGames = [
      'grammarColorCode', 'beVerbRush', 'patternHunter', 'modalVerbChallenge',
      'comparisonMaster', 'conjunctionConnection', 'progressiveTense'
    ]
    const communicationGames = [
      'cvPronunciationTrainer', 'trueSoundImpact', 'rhythmPhonicsDance'
    ]
    
    if (phonicsGames.includes(gameId)) return 'phonics'
    if (vocabularyGames.includes(gameId)) return 'vocabulary'
    if (grammarGames.includes(gameId)) return 'grammar'
    if (communicationGames.includes(gameId)) return 'communication'
    return 'phonics' // デフォルト
  }

  const getMasteredCount = (gameId, gameData) => {
    return (gameData.masteredPhonemes?.length || 0) +
           (gameData.masteredSounds?.length || 0) +
           (gameData.masteredPatterns?.length || 0) +
           (gameData.masteredWords?.length || 0) +
           (gameData.masteredConcepts?.length || 0) +
           (gameData.masteredModals?.length || 0) +
           (gameData.masteredBlends?.length || 0)
  }

  const handleLevelUp = (oldLevel, newLevel) => {
    // レベルアップ履歴を記録
    playerData.value.levelUpHistory.push({
      oldLevel,
      newLevel,
      date: new Date().toISOString(),
      rewards: {
        cosmicEnergy: 50 * (newLevel - oldLevel),
        soundGems: 25 * (newLevel - oldLevel)
      }
    })
    
    // 報酬付与
    playerData.value.cosmicEnergy += 50 * (newLevel - oldLevel)
    playerData.value.soundGems += 25 * (newLevel - oldLevel)
    playerData.value.lastLevelUp = new Date().toISOString()
    
    // 新コンテンツ解放
    const newContent = getUnlockedContentForLevel(newLevel)
    newContent.forEach(content => {
      if (!playerData.value.unlockedContent.includes(content)) {
        playerData.value.unlockedContent.push(content)
      }
    })
    
    logger.log(`🎉 レベルアップ! ${oldLevel} → ${newLevel}`)
    logger.log(`💰 報酬: エネルギー +${50 * (newLevel - oldLevel)}, ジェム +${25 * (newLevel - oldLevel)}`)
    if (newContent.length > 0) {
      logger.log(`🔓 新コンテンツ解放: ${newContent.join(', ')}`)
    }
  }

  const getUnlockedContentForLevel = (level) => {
    const content = []
    if (level >= 10 && level < 15) content.push('VR Basic Experience')
    if (level >= 15 && level < 25) content.push('Vocabulary Building Advanced')
    if (level >= 25 && level < 40) content.push('Grammar Galaxy')
    if (level >= 40 && level < 50) content.push('Intermediate VR')
    if (level >= 50 && level < 60) content.push('Advanced VR Scenarios')
    if (level >= 60 && level < 75) content.push('Pronunciation Training')
    if (level >= 75 && level < 90) content.push('Conversation Roleplay')
    if (level >= 90) content.push('Expert Content')
    return content
  }

  const updateEikenLevel = () => {
    const level = playerData.value.unifiedLevel
    const eikenLevels = {
      1: { min: 1, max: 5, name: '英検5級準備', grade: '小学1-2年' },
      2: { min: 6, max: 15, name: '英検5級', grade: '小学3-4年' },
      3: { min: 16, max: 25, name: '英検4級準備', grade: '小学5-6年' },
      4: { min: 26, max: 40, name: '英検4級', grade: '中学1-2年' },
      5: { min: 41, max: 60, name: '英検3級', grade: '中学3年' },
      6: { min: 61, max: 75, name: '英検準2級', grade: '高校1-2年' },
      7: { min: 76, max: 85, name: '英検2級', grade: '高校3年' },
      8: { min: 86, max: 95, name: '英検準1級', grade: '大学1-2年' },
      9: { min: 96, max: 100, name: '英検1級', grade: '大学3-4年+' }
    }
    
    for (const [key, info] of Object.entries(eikenLevels)) {
      if (level >= info.min && level <= info.max) {
        playerData.value.eikenLevel = info.name
        playerData.value.eikenGrade = info.grade
        break
      }
    }
  }

  // オンボーディング完了設定
  const setOnboardingCompleted = () => {
    hasCompletedOnboarding.value = true
    saveToLocalStorage()
  }

  // VR準備度システムとの統合
  let vrReadinessService = null
  
  // VR準備度サービスの初期化（遅延読み込み）
  const initVRReadinessService = async () => {
    if (!vrReadinessService) {
      try {
        const { vrReadinessAssessment } = await import('@/services/vrReadinessAssessment')
        vrReadinessService = vrReadinessAssessment
      } catch (error) {
        logger.warn('VR Readiness service not available:', error)
      }
    }
    return vrReadinessService
  }

  // ゲーム結果のVR準備度への反映
  const processVRSkillGains = async (gameType, gameResult) => {
    try {
      const service = await initVRReadinessService()
      if (service && gameResult) {
        // ゲーム結果データの標準化
        const standardizedResult = {
          gameType,
          score: gameResult.score || gameResult.bestScore || 0,
          maxScore: gameResult.maxScore || 100,
          accuracy: gameResult.accuracy || ((gameResult.correctAnswers || 0) / (gameResult.totalAttempts || 1)) * 100,
          streak: gameResult.streak || gameResult.maxStreak || 0,
          timeBonus: gameResult.timeBonus || 0,
          mistakes: gameResult.mistakes || gameResult.wrongAnswers || 0,
          wordsCollected: gameResult.wordsCollected || gameResult.masteredWords?.length || 0,
          totalWords: gameResult.totalWords || 10,
          categoriesCompleted: gameResult.categoriesCompleted || 0,
          averageSentenceLength: gameResult.averageSentenceLength || 5,
          grammarErrors: gameResult.grammarErrors || 0,
          flowScore: gameResult.flowScore || 0,
          registerScore: gameResult.registerScore || 0,
          topicDifficulty: gameResult.difficulty || 'beginner',
          completed: gameResult.completed || false
        }

        // VR準備度サービスに結果を送信
        await service.updateSkillsFromGame(standardizedResult)
        logger.log('🎯 VR準備度が更新されました')
      }
    } catch (error) {
      logger.warn('VR skill update failed:', error)
    }
  }

  // 拡張されたゲーム進捗更新（VR準備度統合）
  const updateGameProgressWithVR = async (gameId, data) => {
    // 既存のゲーム進捗更新
    updateGameProgress(gameId, data)
    
    // VR準備度への反映
    await processVRSkillGains(gameId, {
      ...data,
      completed: data.completed || false,
      accuracy: data.accuracy || 0,
      streak: data.streak || 0
    })
  }

  // VR対応ゲーム結果の処理
  const trackVRCompatibleGameResult = async (gameType, results) => {
    // 基本の結果追跡
    if (gameType === 'wordRush') {
      trackWordRushResults(results)
    } else {
      updateGameStats(gameType, results)
    }

    // VR準備度スキル獲得処理
    await processVRSkillGains(gameType, results)

    // VR準備度に基づく特別報酬
    const service = await initVRReadinessService()
    if (service) {
      const currentReport = service.currentReport.value
      if (currentReport) {
        // VR準備度レベルに応じたボーナス経験値
        const vrBonusMultiplier = getVRBonusMultiplier(currentReport.level)
        const bonusExp = Math.floor((results.score || 0) * vrBonusMultiplier * 0.1)
        
        if (bonusExp > 0) {
          playerData.value.cosmicEnergy += bonusExp
          playerData.value.exp += bonusExp
          logger.log(`🚀 VR準備度ボーナス: +${bonusExp}EXP`)
        }

        // VR準備度マイルストーン達成チェック
        checkVRReadinessMilestones(currentReport)
      }
    }
  }

  // VR準備度レベルに応じたボーナス倍率
  const getVRBonusMultiplier = (vrLevel) => {
    const multipliers = {
      'beginner': 1.0,
      'foundation': 1.1,
      'intermediate': 1.2,
      'advanced': 1.3,
      'master': 1.5
    }
    return multipliers[vrLevel] || 1.0
  }

  // VR準備度マイルストーン達成チェック
  const checkVRReadinessMilestones = (report) => {
    // Foundation レベル達成
    if (report.level === 'foundation' && !achievements.value.vrFoundation?.earned) {
      achievements.value.vrFoundation = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 200
      logger.log('🏆 VR実績獲得: ファウンデーション達成')
    }

    // Intermediate レベル達成
    if (report.level === 'intermediate' && !achievements.value.vrIntermediate?.earned) {
      achievements.value.vrIntermediate = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 300
      logger.log('🏆 VR実績獲得: インターミディエイト達成')
    }

    // Advanced レベル達成
    if (report.level === 'advanced' && !achievements.value.vrAdvanced?.earned) {
      achievements.value.vrAdvanced = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 500
      logger.log('🏆 VR実績獲得: アドバンスド達成')
    }

    // Master レベル達成
    if (report.level === 'master' && !achievements.value.vrMaster?.earned) {
      achievements.value.vrMaster = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 1000
      playerData.value.title = 'VR マスター'
      logger.log('🏆 VR実績獲得: マスター達成')
    }

    // VRアカデミー準備完了
    if (report.vrAcademyRecommendation?.isReady && !achievements.value.vrAcademyReady?.earned) {
      achievements.value.vrAcademyReady = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 750
      logger.log('🏆 VR実績獲得: VRアカデミー準備完了')
    }
  }

  // 最後のゲーム結果（VR準備度サービス用）
  const lastGameResult = ref(null)

  // ゲームタイプの正規化
  const normalizeGameType = (gameId) => {
    const gameTypeMap = {
      // フォニックスゲーム
      'singlePhoneme': 'CvPronunciationTrainer',
      'pureSoundLab': 'CvPronunciationTrainer',
      'soundHunter': 'CvPronunciationTrainer',
      'phonicsTrainingHub': 'CvPronunciationTrainer',
      
      // 語彙ゲーム
      'wordRush': 'WordCollector',
      'magicCastleJump': 'WordCollector',
      'magicCardBattle': 'WordCollector',
      
      // 文法ゲーム
      'grammarColorCode': 'GrammarSentenceBuilder',
      'beVerbRush': 'GrammarSentenceBuilder',
      'patternHunter': 'GrammarSentenceBuilder',
      'modalVerbChallenge': 'GrammarSentenceBuilder',
      'timeZoneNavigator': 'GrammarSentenceBuilder',
      
      // 会話ゲーム
      'spellRacing': 'ConversationSimulator',
      'magicCooking': 'ConversationSimulator',
      'voicePuzzle': 'ConversationSimulator'
    }
    
    return gameTypeMap[gameId] || gameId
  }

  // ローカルストレージ関連
  const saveToLocalStorage = () => {
    const data = {
      playerData: playerData.value,
      gameProgress: gameProgress.value,
      gameStats: gameStats.value,
      achievements: achievements.value,
      hasCompletedOnboarding: hasCompletedOnboarding.value,
      version: '1.0.0', // データバージョン管理
      lastSaved: new Date().toISOString()
    }

    try {
      localStorage.setItem('movwiseGameData', JSON.stringify(data))
      logger.log('💾 データ保存完了')
    } catch (error) {
      logger.error('❌ データ保存エラー:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const data = localStorage.getItem('movwiseGameData')
      if (data) {
        const parsed = JSON.parse(data)

        // データバージョンチェック
        if (parsed.version) {
          playerData.value = { ...playerData.value, ...parsed.playerData }
          gameProgress.value = { ...gameProgress.value, ...parsed.gameProgress }
          gameStats.value = { ...gameStats.value, ...parsed.gameStats }
          achievements.value = { ...achievements.value, ...parsed.achievements }
          hasCompletedOnboarding.value = parsed.hasCompletedOnboarding || false
          logger.log('📂 データ読み込み完了')
        } else {
          logger.log('⚠️ 古いデータ形式のため初期化')
          saveToLocalStorage() // 新形式で保存
        }
      }
    } catch (error) {
      logger.error('❌ データ読み込みエラー:', error)
      logger.log('🔄 データを初期化します')
    }
  }

  // データリセット
  const resetAllData = () => {
    if (confirm('⚠️ 全てのゲームデータを削除しますか？\nこの操作は元に戻せません。')) {
      localStorage.removeItem('movwiseGameData')
      location.reload()
    }
  }

  // ユーティリティ関数
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  }

  // Word Rush 専用の統計追跡
  const trackWordRushResults = (results) => {
    const { score, correctAnswers, maxStreak, difficulty, timeSpent } = results

    // 基本統計更新
    gameStats.value.totalGamesPlayed++
    gameStats.value.wordRush.gamesPlayed++
    gameStats.value.wordRush.totalScore += score
    gameStats.value.wordRush.bestScore = Math.max(gameStats.value.wordRush.bestScore, score)
    gameStats.value.wordRush.bestStreak = Math.max(gameStats.value.wordRush.bestStreak, maxStreak)

    // 正解率の移動平均計算
    const currentAccuracy = (correctAnswers / 10) * 100
    gameStats.value.wordRush.averageAccuracy =
      (gameStats.value.wordRush.averageAccuracy * (gameStats.value.wordRush.gamesPlayed - 1) + currentAccuracy)
      / gameStats.value.wordRush.gamesPlayed

    // 難易度別習熟度更新
    gameStats.value.wordRush.vocabularyMastery[difficulty] =
      Math.min(100, gameStats.value.wordRush.vocabularyMastery[difficulty] + (currentAccuracy / 10))

    // Spatial.io VR準備度計算
    gameStats.value.wordRush.spatialReadiness = Math.round(
      (gameStats.value.wordRush.vocabularyMastery.beginner * 0.3 +
        gameStats.value.wordRush.vocabularyMastery.intermediate * 0.5 +
        gameStats.value.wordRush.vocabularyMastery.advanced * 0.2)
    )

    // 経験値とレベル更新
    const expGained = Math.round(score / 10)
    playerData.value.exp += expGained

    // MovWISE統合分析データ更新
    updateCrossGameAnalytics('wordRush', {
      vocabularyStrength: currentAccuracy,
      learningVelocity: score / timeSpent,
      patternRecognition: maxStreak / 10
    })

    // デイリークエスト進捗更新
    updateDailyQuest('wordRush', { accuracy: currentAccuracy, streak: maxStreak })

    // 実績チェック
    checkWordRushAchievements(score, maxStreak, currentAccuracy)

    // ローカルストレージに保存
    saveToLocalStorage()
  }

  // MovWISE他ゲームとの連携分析
  const updateCrossGameAnalytics = (gameType, metrics) => {
    if (!gameStats.value.crossGameAnalytics) {
      gameStats.value.crossGameAnalytics = {}
    }
    gameStats.value.crossGameAnalytics[gameType] = metrics

    // フォニックス学習との相関分析
    if (gameType === 'wordRush' && gameStats.value.crossGameAnalytics.phonics) {
      analyzePhonicsVocabularyCorrelation()
    }

    // VR準備度総合評価
    calculateOverallVRReadiness()
  }

  // フォニックスと語彙の相関分析
  const analyzePhonicsVocabularyCorrelation = () => {
    const phonicsStrength = gameStats.value.crossGameAnalytics.phonics?.soundRecognition || 0
    const vocabularyStrength = gameStats.value.crossGameAnalytics.wordRush?.vocabularyStrength || 0

    // 相関係数計算
    if (!gameStats.value.learningInsights) {
      gameStats.value.learningInsights = {}
    }
    gameStats.value.learningInsights.phonicsVocabCorrelation = Math.round(
      (phonicsStrength + vocabularyStrength) / 2
    )

    // 学習推奨事項生成
    if (phonicsStrength > vocabularyStrength + 20) {
      gameStats.value.learningInsights.recommendation = 'vocabulary_focus'
    } else if (vocabularyStrength > phonicsStrength + 20) {
      gameStats.value.learningInsights.recommendation = 'phonics_review'
    } else {
      gameStats.value.learningInsights.recommendation = 'balanced_progress'
    }
  }

  // VR準備度総合計算
  const calculateOverallVRReadiness = () => {
    const phonicsReadiness = gameStats.value.crossGameAnalytics.phonics?.overallMastery || 0
    const vocabularyReadiness = gameStats.value.wordRush?.spatialReadiness || 0
    const grammarReadiness = gameStats.value.crossGameAnalytics.grammar?.structureUnderstanding || 0

    if (!gameStats.value.vrReadinessScore) {
      gameStats.value.vrReadinessScore = 0
    }
    gameStats.value.vrReadinessScore = Math.round(
      (phonicsReadiness * 0.3 + vocabularyReadiness * 0.4 + grammarReadiness * 0.3)
    )
  }

  // Word Rush 実績チェック
  const checkWordRushAchievements = (score, maxStreak, accuracy) => {
    // ワード・ラッシュ・チャンピオン
    if (score >= 3000 && !achievements.value.wordRushChampion.earned) {
      achievements.value.wordRushChampion = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 500
    }

    // スピード・マスター
    if (maxStreak >= 8 && !achievements.value.speedMaster.earned) {
      achievements.value.speedMaster = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 300
    }

    // ボキャブラリー・エキスパート
    if (accuracy >= 80 && !achievements.value.vocabularyExpert.earned) {
      achievements.value.vocabularyExpert = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 400
    }

    // VR準備完了
    if (gameStats.value.wordRush.spatialReadiness >= 90 && !achievements.value.vrReady.earned) {
      achievements.value.vrReady = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 600
    }
  }

  // 初期化
  loadFromLocalStorage()

  // === Galaxy Trading統合メソッド（最小限追加） ===
  
  /**
   * Galaxy Trading用の学習データ取得
   */
  const getGalaxyTradingData = () => {
    return {
      cvcWordProgress: gameProgress.value.cvcWord?.progress || 0,
      blendingProgress: gameProgress.value.blendingBuilder?.progress || 0,
      grammarProgress: gameProgress.value.grammarColorCode?.progress || 0,
      overallCompletion: getCompletionRate(),
      cosmicEnergy: playerData.value.cosmicEnergy || playerData.value.exp || 0,
      soundGems: playerData.value.soundGems || 0,
      currentLevel: playerData.value.captainLevel || playerData.value.level || 1
    }
  }
  
  /**
   * Galaxy Trading投資によるエネルギー消費
   */
  const consumeEnergyForInvestment = (amount) => {
    if ((playerData.value.cosmicEnergy || playerData.value.exp || 0) < amount) {
      throw new Error('エネルギーポイントが不足しています')
    }
    
    playerData.value.cosmicEnergy = (playerData.value.cosmicEnergy || 0) - amount
    playerData.value.exp = (playerData.value.exp || 0) - amount
    
    logger.log(`💸 投資実行: ${amount}エネルギーポイント消費`)
    saveToLocalStorage()
  }
  
  /**
   * Galaxy Trading投資リターンの受け取り
   */
  const receiveInvestmentReturns = (amount, source = 'galaxy-trading') => {
    playerData.value.cosmicEnergy = (playerData.value.cosmicEnergy || 0) + amount
    playerData.value.exp = (playerData.value.exp || 0) + amount
    
    // 投資リターンによる特別ボーナス
    const bonusGems = Math.floor(amount / 20)
    if (bonusGems > 0) {
      playerData.value.soundGems = (playerData.value.soundGems || 0) + bonusGems
    }
    
    logger.log(`💰 投資リターン: ${amount}エネルギー + ${bonusGems}ジェム受取`)
    saveToLocalStorage()
  }
  
  /**
   * Galaxy Trading学習効果の記録
   */
  const recordGalaxyTradingLearning = (planetId, educationalConcept, amount) => {
    // 統計にGalaxy Trading学習を記録
    if (!gameStats.value.galaxyTradingLearning) {
      gameStats.value.galaxyTradingLearning = {
        totalInvestments: 0,
        totalAmount: 0,
        conceptsLearned: [],
        planetsExperienced: []
      }
    }
    
    gameStats.value.galaxyTradingLearning.totalInvestments++
    gameStats.value.galaxyTradingLearning.totalAmount += amount
    
    if (!gameStats.value.galaxyTradingLearning.conceptsLearned.includes(educationalConcept)) {
      gameStats.value.galaxyTradingLearning.conceptsLearned.push(educationalConcept)
    }
    
    if (!gameStats.value.galaxyTradingLearning.planetsExperienced.includes(planetId)) {
      gameStats.value.galaxyTradingLearning.planetsExperienced.push(planetId)
    }
    
    // 投資教育実績チェック
    checkGalaxyTradingAchievements()
    
    saveToLocalStorage()
  }
  
  /**
   * Galaxy Trading実績チェック
   */
  const checkGalaxyTradingAchievements = () => {
    const tradingData = gameStats.value.galaxyTradingLearning
    if (!tradingData) return
    
    // 初回投資実績
    if (tradingData.totalInvestments >= 1 && !achievements.value.firstInvestor?.earned) {
      achievements.value.firstInvestor = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 100
      logger.log('🏆 実績獲得: ファースト・インベスター')
    }
    
    // 分散投資実績
    if (tradingData.planetsExperienced.length >= 2 && !achievements.value.diversifiedInvestor?.earned) {
      achievements.value.diversifiedInvestor = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 250
      logger.log('🏆 実績獲得: 分散投資マスター')
    }
    
    // 投資教育修了実績
    if (tradingData.conceptsLearned.length >= 5 && !achievements.value.investmentEducationComplete?.earned) {
      achievements.value.investmentEducationComplete = {
        earned: true,
        earnedDate: new Date().toISOString()
      }
      playerData.value.soundGems += 500
      playerData.value.title = 'ギャラクシー投資アドバイザー'
      logger.log('🏆 実績獲得: 投資教育修了')
    }
  }

  return {
    // 状態
    playerData,
    gameProgress,
    gameStats,
    achievements,
    gameSettings,
    hasCompletedOnboarding,
    lastGameResult,  // VR準備度サービス用

    // 計算プロパティ
    playerLevel,
    playerExp,
    playerSoundGems,
    playerStreak,
    spaceshipStatus,  // 新規追加

    // メソッド
    updatePlayerData,
    updateGameProgress,
    updateGameStats,
    getGameProgress,
    getStageProgress,
    getCompletionRate,
    updateStreak,
    updateDailyQuest,
    checkAchievements,
    resetAllData,
    trackWordRushResults,
    updateCrossGameAnalytics,
    analyzePhonicsVocabularyCorrelation,
    calculateOverallVRReadiness,
    setOnboardingCompleted,
    updatePhonicsProgress,
    
    // VR準備度統合メソッド
    updateGameProgressWithVR,
    trackVRCompatibleGameResult,
    processVRSkillGains,
    normalizeGameType,
    initVRReadinessService,
    
    // 統一レベルシステム
    updateUnifiedLevel,
    updateSkillLevels,
    calculateUnifiedLevel,
    handleLevelUp,
    updateEikenLevel,
    
    // Galaxy Trading統合メソッド（最小限追加）
    getGalaxyTradingData,
    consumeEnergyForInvestment,
    receiveInvestmentReturns,
    recordGalaxyTradingLearning,
    checkGalaxyTradingAchievements
  }
})