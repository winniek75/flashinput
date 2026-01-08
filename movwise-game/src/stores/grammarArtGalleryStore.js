import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import artifactsData from '@/data/grammar-art-gallery/artifacts.json'
import logger from '@/utils/logger'

export const useGrammarArtGalleryStore = defineStore('grammarArtGallery', () => {
  // ===== State =====
  const currentWingId = ref('wing-1')
  const currentArtifactId = ref(null)
  const currentGameState = ref('entrance') // 'entrance', 'wing', 'artifact', 'reading', 'barriers'
  const unlockedWings = ref(['wing-1'])
  const unlockedArtifacts = ref([])

  const artifactProgress = ref({})
  // Example: { 'artifact-1-1': { readingAttempts: 2, completedBarriers: [true, false, false], stars: 0 } }

  const spaceshipUpgrades = ref({
    scanner: {
      level: 1,
      maxLevel: 3,
      effects: ['Better hints', 'Faster energy regen', 'Bonus rewards'],
      costs: [300, 800, 1500]
    },
    energyShield: {
      level: 1,
      maxLevel: 4,
      effects: ['Energy protection', 'Mistake tolerance', 'Combo protection', 'Perfect shield'],
      costs: [400, 900, 1800, 3600]
    },
    translationCore: {
      level: 1,
      maxLevel: 5,
      effects: ['Better explanations', 'Context hints', 'Advanced analysis', 'AI assistance', 'Master insights'],
      costs: [500, 1000, 2000, 4000, 8000]
    }
  })

  const playerStats = ref({
    totalStars: 0,
    stellarGems: 0,
    energy: 100, // cosmicEnergy から energy に変更
    maxEnergy: 100, // maxCosmicEnergy から maxEnergy に変更
    cosmicEnergy: 100, // 下位互換のため残す
    maxCosmicEnergy: 100, // 下位互換のため残す
    totalScore: 0, // GrammarArtGalleryView.vue で使用
    currentScore: 0, // GrammarArtGalleryView.vue で使用
    explorerRank: 'Rookie Pilot',
    artifactsCollected: 0,
    grammarCards: [],
    totalReadingTime: 0,
    perfectRuns: 0,
    achievementsUnlocked: [],
    currentStreak: 0,
    longestStreak: 0,
    experiencePoints: 0,
    level: 1
  })

  const sessionStats = ref({
    startTime: null,
    artifactsAttempted: 0,
    totalReadingAttempts: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    energyUsed: 0
  })

  // ===== Getters =====
  const currentWing = computed(() => {
    return artifactsData.wings.find(w => w.id === currentWingId.value)
  })

  const currentArtifact = computed(() => {
    if (!currentWing.value || !currentArtifactId.value) return null
    return currentWing.value.artifacts.find(a => a.id === currentArtifactId.value)
  })

  const isArtifactUnlocked = computed(() => (artifactId) => {
    return unlockedArtifacts.value.includes(artifactId)
  })

  const getArtifactProgress = computed(() => (artifactId) => {
    return artifactProgress.value[artifactId] || {
      readingAttempts: 0,
      completedBarriers: [],
      stars: 0,
      fluencyScore: 0,
      bestTime: null,
      completed: false
    }
  })

  const totalProgress = computed(() => {
    const totalArtifacts = artifactsData.wings.reduce((sum, wing) => sum + wing.artifacts.length, 0)
    if (totalArtifacts === 0) return 0
    return Math.round((playerStats.value.artifactsCollected / totalArtifacts) * 100)
  })

  const energyPercentage = computed(() => {
    return (playerStats.value.energy / playerStats.value.maxEnergy) * 100
  })

  const currentLevelProgress = computed(() => {
    const expForCurrentLevel = playerStats.value.level * 100
    const expForNextLevel = (playerStats.value.level + 1) * 100
    const currentExp = playerStats.value.experiencePoints

    const progressInCurrentLevel = currentExp - expForCurrentLevel
    const expNeededForNext = expForNextLevel - expForCurrentLevel

    return Math.max(0, Math.min(100, (progressInCurrentLevel / expNeededForNext) * 100))
  })

  // ===== Actions =====
  function initializeSession() {
    sessionStats.value = {
      startTime: Date.now(),
      artifactsAttempted: 0,
      totalReadingAttempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      energyUsed: 0
    }
    logger.log('🚀 Grammar Art Gallery session started')
  }

  function selectWing(wingId) {
    if (unlockedWings.value.includes(wingId)) {
      currentWingId.value = wingId
      currentGameState.value = 'wing'
      logger.log(`🪐 Entered wing: ${wingId}`)
    }
  }

  function selectArtifact(artifactId) {
    if (isArtifactUnlocked.value(artifactId)) {
      currentArtifactId.value = artifactId
      currentGameState.value = 'artifact'
      logger.log(`🏺 Selected artifact: ${artifactId}`)
    }
  }

  function startArtifactDecryption(artifactId) {
    if (!artifactProgress.value[artifactId]) {
      artifactProgress.value[artifactId] = {
        readingAttempts: 0,
        completedBarriers: [],
        stars: 0,
        fluencyScore: 0,
        startedAt: Date.now(),
        bestTime: null,
        completed: false
      }
    }

    sessionStats.value.artifactsAttempted++
    currentGameState.value = 'reading'
    logger.log(`📖 Started decryption: ${artifactId}`)
  }

  function recordReadingAttempt(artifactId, fluencyScore, readingTime) {
    const progress = artifactProgress.value[artifactId]
    progress.readingAttempts++
    progress.fluencyScore = Math.max(progress.fluencyScore, fluencyScore)

    if (!progress.bestTime || readingTime < progress.bestTime) {
      progress.bestTime = readingTime
    }

    sessionStats.value.totalReadingAttempts++
    playerStats.value.totalReadingTime += readingTime

    // 音読完了判定（改良: より柔軟な判定）
    const artifact = currentArtifact.value
    if (artifact && progress.readingAttempts >= artifact.readingAttempts) {
      // エネルギー消費
      const energyCost = Math.max(1, artifact.energyLevel - spaceshipUpgrades.value.energyShield.level)
      consumeEnergy(energyCost)

      currentGameState.value = 'barriers'
      logger.log(`✅ Reading phase completed for ${artifactId}`)
      return true
    }
    return false
  }

  function completeBarrier(artifactId, barrierIndex, isCorrect, timeTaken = 0) {
    const progress = artifactProgress.value[artifactId]

    if (!progress.completedBarriers) {
      progress.completedBarriers = []
    }

    if (isCorrect) {
      progress.completedBarriers[barrierIndex] = true
      sessionStats.value.correctAnswers++

      // 報酬付与（アップグレードによる効果も考慮）
      const artifact = currentArtifact.value
      if (artifact && artifact.barriers[barrierIndex]) {
        const barrier = artifact.barriers[barrierIndex]
        let energyReward = barrier.energyReward

        // Scanner upgrade bonus
        if (spaceshipUpgrades.value.scanner.level >= 2) {
          energyReward = Math.floor(energyReward * 1.2)
        }

        addEnergy(energyReward)

        // Speed bonus
        if (timeTaken < 10000) { // 10秒以内
          addExperience(10)
        }

        logger.log(`⚡ Barrier ${barrierIndex} completed: +${energyReward} energy`)
      }

      // コンボシステム
      playerStats.value.currentStreak++
      if (playerStats.value.currentStreak > playerStats.value.longestStreak) {
        playerStats.value.longestStreak = playerStats.value.currentStreak
      }
    } else {
      // ミス時のペナルティ（シールドアップグレードで軽減）
      if (spaceshipUpgrades.value.energyShield.level < 2) {
        playerStats.value.currentStreak = 0
      }
    }

    sessionStats.value.totalQuestions++

    // 全バリア突破チェック
    const allCompleted = artifact.barriers.every((_, index) =>
      progress.completedBarriers[index] === true
    )

    if (allCompleted) {
      completeArtifact(artifactId)
    }
  }

  function completeArtifact(artifactId) {
    const artifact = artifactsData.wings
      .flatMap(w => w.artifacts)
      .find(a => a.id === artifactId)

    if (!artifact) return

    const progress = artifactProgress.value[artifactId]
    progress.completed = true

    // スター判定（改良版）
    let stars = 1
    const fluencyThreshold = 70 + (spaceshipUpgrades.value.translationCore.level * 5)
    const perfectThreshold = 90 + (spaceshipUpgrades.value.translationCore.level * 2)

    if (progress.fluencyScore >= fluencyThreshold) stars = 2
    if (progress.fluencyScore >= perfectThreshold &&
        progress.completedBarriers.every(b => b) &&
        progress.readingAttempts <= 2) {
      stars = 3
      playerStats.value.perfectRuns++
    }

    progress.stars = stars

    // 報酬付与（レベル補正あり）
    const levelMultiplier = 1 + (playerStats.value.level - 1) * 0.1
    const rewardMultiplier = artifactsData.globalSettings.difficultyMultipliers[artifact.difficulty] || 1

    const finalRewards = {
      stellarGems: Math.floor(artifact.rewards.stellarGems * rewardMultiplier * levelMultiplier),
      cosmicEnergy: Math.floor(artifact.rewards.cosmicEnergy * rewardMultiplier),
      experiencePoints: Math.floor(artifact.rewards.experiencePoints * rewardMultiplier * levelMultiplier)
    }

    playerStats.value.stellarGems += finalRewards.stellarGems
    addEnergy(finalRewards.cosmicEnergy)
    addExperience(finalRewards.experiencePoints)
    playerStats.value.totalStars += stars
    playerStats.value.artifactsCollected++

    if (artifact.rewards.grammarCard && !playerStats.value.grammarCards.includes(artifact.rewards.grammarCard)) {
      playerStats.value.grammarCards.push(artifact.rewards.grammarCard)
    }

    // アチーブメントチェック
    checkAchievements(artifactId)

    // 次のアーティファクト解禁
    unlockNextContent(artifactId)

    // ランク更新
    updateExplorerRank()

    currentGameState.value = 'completed'

    logger.log(`🏆 Artifact completed: ${artifactId} with ${stars} stars`)
    logger.log(`💎 Rewards: ${finalRewards.stellarGems} gems, ${finalRewards.cosmicEnergy} energy, ${finalRewards.experiencePoints} exp`)
  }

  function unlockNextContent(currentArtifactId) {
    const allArtifacts = artifactsData.wings.flatMap(w => w.artifacts)
    const currentIndex = allArtifacts.findIndex(a => a.id === currentArtifactId)

    // 次のアーティファクト解禁
    if (currentIndex >= 0 && currentIndex < allArtifacts.length - 1) {
      const nextArtifact = allArtifacts[currentIndex + 1]
      if (!unlockedArtifacts.value.includes(nextArtifact.id)) {
        unlockedArtifacts.value.push(nextArtifact.id)
        logger.log(`🔓 Unlocked artifact: ${nextArtifact.id}`)
      }
    }

    // 新しいウィング解禁チェック
    artifactsData.wings.forEach(wing => {
      if (!unlockedWings.value.includes(wing.id) &&
          playerStats.value.totalStars >= wing.requiredStars &&
          playerStats.value.energy >= wing.cosmicEnergyCost) {
        unlockedWings.value.push(wing.id)
        logger.log(`🪐 Unlocked wing: ${wing.id}`)
      }
    })
  }

  function checkAchievements(artifactId) {
    const achievements = artifactsData.globalSettings.achievements

    // First Discovery
    if (playerStats.value.artifactsCollected === 1 &&
        !playerStats.value.achievementsUnlocked.includes('first-discovery')) {
      unlockAchievement('first-discovery')
    }

    // Speed Reader (3 consecutive speed bonuses)
    if (playerStats.value.currentStreak >= 3 &&
        !playerStats.value.achievementsUnlocked.includes('speed-reader')) {
      unlockAchievement('speed-reader')
    }

    // Grammar Master (perfect run on advanced artifact)
    if (currentArtifact.value?.difficulty === 'advanced' &&
        getArtifactProgress.value(artifactId).stars === 3 &&
        !playerStats.value.achievementsUnlocked.includes('grammar-master')) {
      unlockAchievement('grammar-master')
    }
  }

  function unlockAchievement(achievementId) {
    if (!playerStats.value.achievementsUnlocked.includes(achievementId)) {
      playerStats.value.achievementsUnlocked.push(achievementId)

      const achievement = artifactsData.globalSettings.achievements[achievementId]
      if (achievement) {
        logger.log(`🏆 Achievement unlocked: ${achievement.name}`)

        // Achievement rewards
        switch (achievement.reward) {
          case 'specialAvatar':
            // TODO: 特別アバター付与
            break
          case 'energyBoost':
            playerStats.value.maxCosmicEnergy += 20
            addEnergy(20)
            break
          case 'masterBadge':
            playerStats.value.stellarGems += 500
            break
        }
      }
    }
  }

  function updateExplorerRank() {
    const collected = playerStats.value.artifactsCollected
    const experience = playerStats.value.experiencePoints

    let newRank = 'Rookie Pilot'

    if (collected >= 50 || experience >= 5000) {
      newRank = 'Universe Master'
    } else if (collected >= 30 || experience >= 3000) {
      newRank = 'Galaxy Explorer'
    } else if (collected >= 15 || experience >= 1500) {
      newRank = 'Grammar Ranger'
    } else if (collected >= 5 || experience >= 500) {
      newRank = 'Space Cadet'
    }

    if (newRank !== playerStats.value.explorerRank) {
      playerStats.value.explorerRank = newRank
      logger.log(`🎖️ Rank promoted to: ${newRank}`)
    }
  }

  function upgradeSpaceship(upgradeType) {
    const upgrade = spaceshipUpgrades.value[upgradeType]
    if (upgrade.level < upgrade.maxLevel) {
      const cost = upgrade.costs[upgrade.level - 1]

      if (playerStats.value.stellarGems >= cost) {
        playerStats.value.stellarGems -= cost
        upgrade.level++

        // Upgrade effects
        if (upgradeType === 'energyShield' && upgrade.level === 2) {
          playerStats.value.maxCosmicEnergy += 25
        }

        logger.log(`🔧 Upgraded ${upgradeType} to level ${upgrade.level}`)
        return true
      }
    }
    return false
  }

  function addEnergy(amount) {
    const newEnergy = Math.min(
      playerStats.value.maxEnergy,
      playerStats.value.energy + amount
    )
    playerStats.value.energy = newEnergy
    playerStats.value.cosmicEnergy = newEnergy // 下位互換のため同期
  }

  function consumeEnergy(amount) {
    const newEnergy = Math.max(0, playerStats.value.energy - amount)
    playerStats.value.energy = newEnergy
    playerStats.value.cosmicEnergy = newEnergy // 下位互換のため同期
    sessionStats.value.energyUsed += amount
  }

  function addExperience(amount) {
    playerStats.value.experiencePoints += amount

    // Level up check
    const expForNextLevel = (playerStats.value.level + 1) * 100
    if (playerStats.value.experiencePoints >= expForNextLevel) {
      levelUp()
    }
  }

  function levelUp() {
    playerStats.value.level++
    playerStats.value.maxEnergy += 10
    playerStats.value.maxCosmicEnergy += 10 // 下位互換のため同期
    addEnergy(playerStats.value.maxEnergy) // Full energy restore on level up
    playerStats.value.stellarGems += playerStats.value.level * 10 // Level bonus gems

    logger.log(`🆙 Level up! Now level ${playerStats.value.level}`)
  }

  // 追加のヘルパー関数
  function getArtifactById(artifactId) {
    if (!artifactId) {
      logger.log('⚠️ getArtifactById called with empty artifactId')
      return null
    }

    for (const wing of artifactsData.wings) {
      const artifact = wing.artifacts.find(a => a.id === artifactId)
      if (artifact) {
        // ReadingPanel用のreadingSectionsを生成
        const progress = artifactProgress.value[artifactId]
        const completedSections = progress?.completedSections || []

        const readingSections = [
          {
            id: `${artifactId}-reading`,
            title: artifact.title || "読解セクション",
            content: artifact.text || "",
            estimatedTime: 5,
            questions: [], // 後で理解度チェック問題を追加可能
            completed: completedSections.includes(0), // セクション0の完了状態
            unlocked: true // 最初のセクションは常にアンロック
          }
        ]

        // アンロック状態とその他の計算プロパティを追加
        const isUnlocked = unlockedArtifacts.value.includes(artifactId)
        logger.log(`📚 Artifact ${artifactId} - unlocked: ${isUnlocked}, energy: ${artifact.energyLevel}`)

        return {
          ...artifact,
          unlocked: isUnlocked,
          completed: artifactProgress.value[artifactId]?.completed || false,
          progress: artifactProgress.value[artifactId]?.stars ? artifactProgress.value[artifactId].stars * 33.33 : 0,
          energyCost: artifact.energyLevel || 0,
          name: artifact.title,
          description: artifact.subtitle,
          readingSections // ReadingPanel用のセクション
        }
      }
    }
    logger.log(`⚠️ Artifact ${artifactId} not found`)
    return null
  }

  function visitWing(wingId) {
    currentWingId.value = wingId
    logger.log(`🏛️ Visiting wing: ${wingId}`)
  }

  function viewArtifact(artifactId) {
    currentArtifactId.value = artifactId
    logger.log(`👁️ Viewing artifact: ${artifactId}`)
  }

  function startArtifactReading(artifactId) {
    if (!unlockedArtifacts.value.includes(artifactId)) {
      unlockedArtifacts.value.push(artifactId)
    }
    logger.log(`📖 Starting to read artifact: ${artifactId}`)
  }

  function updateReadingProgress(artifactId, sectionIndex, progress) {
    if (!artifactProgress.value[artifactId]) {
      artifactProgress.value[artifactId] = { readingAttempts: 0, completedBarriers: [], stars: 0 }
    }
    artifactProgress.value[artifactId].progress = progress
    logger.log(`📊 Progress updated for ${artifactId}: ${progress}%`)
  }

  function startSection(artifactId, sectionIndex) {
    logger.log(`▶️ Starting section ${sectionIndex} of artifact ${artifactId}`)
  }

  function completeSection(artifactId, sectionIndex) {
    // セクション完了をartifactProgressに記録
    if (!artifactProgress.value[artifactId]) {
      artifactProgress.value[artifactId] = {
        readingAttempts: 0,
        completedBarriers: [],
        stars: 0,
        fluencyScore: 0,
        completed: false,
        completedSections: []
      }
    }

    // セクション完了をマーク
    if (!artifactProgress.value[artifactId].completedSections) {
      artifactProgress.value[artifactId].completedSections = []
    }

    if (!artifactProgress.value[artifactId].completedSections.includes(sectionIndex)) {
      artifactProgress.value[artifactId].completedSections.push(sectionIndex)
    }

    logger.log(`✅ Completed section ${sectionIndex} of artifact ${artifactId}`)
  }

  function addScore(points) {
    playerStats.value.currentScore += points
    playerStats.value.totalScore += points
    logger.log(`🎯 Added ${points} points`)
  }

  function regenerateEnergy() {
    if (playerStats.value.energy < playerStats.value.maxEnergy) {
      const regenRate = artifactsData.globalSettings.energyRegenRate +
                       (spaceshipUpgrades.value.scanner.level >= 2 ? 2 : 0)
      addEnergy(regenRate)
    }
  }

  function resetToEntrance() {
    currentGameState.value = 'entrance'
    currentArtifactId.value = null
  }

  function getSessionSummary() {
    if (!sessionStats.value.startTime) return null

    const sessionDuration = Date.now() - sessionStats.value.startTime
    const accuracy = sessionStats.value.totalQuestions > 0
      ? (sessionStats.value.correctAnswers / sessionStats.value.totalQuestions) * 100
      : 0

    return {
      duration: sessionDuration,
      artifactsAttempted: sessionStats.value.artifactsAttempted,
      readingAttempts: sessionStats.value.totalReadingAttempts,
      accuracy: Math.round(accuracy),
      energyUsed: sessionStats.value.energyUsed,
      experienceGained: sessionStats.value.correctAnswers * 10 // Rough estimate
    }
  }

  // 初期化
  function initialize() {
    // 最初のウィングの全アーティファクトを解禁（デモ用）
    if (artifactsData.wings.length > 0) {
      const firstWing = artifactsData.wings[0]
      firstWing.artifacts.forEach(artifact => {
        if (!unlockedArtifacts.value.includes(artifact.id)) {
          unlockedArtifacts.value.push(artifact.id)
          logger.log(`🔓 Unlocked artifact: ${artifact.id}`)
        }
      })
    }

    // Energy regeneration timer
    setInterval(regenerateEnergy, 60000) // Every minute

    logger.log('🌌 Grammar Art Gallery initialized')
  }

  function initializeEnergyBarriers() {
    // エネルギーバリア（文法クイズ）の初期化
    logger.log('⚡ Energy Barriers initialized')
  }

  function startEnergyBarrierChallenge(challengeId) {
    // エネルギーバリアチャレンジの開始
    logger.log(`🎯 Starting energy barrier challenge: ${challengeId}`)

    // セッション統計を更新
    if (sessionStats.value) {
      sessionStats.value.totalQuestions++
    }
  }

  function updateEnergyBarrierProgress(challengeId, questionIndex) {
    // エネルギーバリアの進捗を更新
    logger.log(`📊 Updated progress for ${challengeId}: question ${questionIndex}`)
  }

  function completeEnergyBarrierChallenge(challengeId) {
    // エネルギーバリアチャレンジの完了
    logger.log(`✅ Completed energy barrier challenge: ${challengeId}`)

    // 報酬を付与
    addExperience(50)
    addEnergy(20)
  }

  initialize()

  return {
    // State
    currentWingId,
    currentArtifactId,
    currentGameState,
    unlockedWings,
    unlockedArtifacts,
    artifactProgress,
    spaceshipUpgrades,
    playerStats,
    sessionStats,
    artifacts: artifactsData, // アーティファクトデータを直接公開

    // Getters
    currentWing,
    currentArtifact,
    isArtifactUnlocked,
    getArtifactProgress,
    totalProgress,
    energyPercentage,
    currentLevelProgress,

    // Actions
    initializeSession,
    initializeGallery: initialize, // 初期化関数のエイリアス
    initializeEnergyBarriers,
    startEnergyBarrierChallenge,
    updateEnergyBarrierProgress,
    completeEnergyBarrierChallenge,
    selectWing,
    selectArtifact,
    startArtifactDecryption,
    recordReadingAttempt,
    completeBarrier,
    completeArtifact,
    upgradeSpaceship,
    addEnergy,
    consumeEnergy,
    addExperience,
    resetToEntrance,
    getSessionSummary,

    // 追加のヘルパー関数
    getArtifactById,
    visitWing,
    viewArtifact,
    startArtifactReading,
    updateReadingProgress,
    startSection,
    completeSection,
    addScore
  }
}, {
  persist: {
    key: 'grammarArtGalleryStore',
    paths: [
      'currentWingId',
      'unlockedWings',
      'unlockedArtifacts',
      'artifactProgress',
      'spaceshipUpgrades',
      'playerStats'
    ]
  }
})