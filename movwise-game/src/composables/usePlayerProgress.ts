import { computed, ref, watch } from 'vue'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import { vrAcademySync, syncPlayerData } from '@/api/vrAcademySync'
import logger from '@/utils/logger'

// VR準備度計算用のヘルパー関数群
export function usePlayerProgress() {
  const playerStore = usePlayerProfileStore()
  
  // VR準備度の詳細計算
  const vrReadinessDetails = computed(() => {
    const vr = playerStore.profile.vrReadiness
    const skills = playerStore.profile.skills
    const stats = playerStore.profile.stats
    
    return {
      // 基礎VRスキル分析
      foundation: {
        score: vr.foundation,
        factors: {
          phonicsStrength: skills.phonics,
          vocabularyBase: skills.vocabulary,
          basicInteraction: Math.min(100, stats.gamesPlayed * 2),
          readinessLevel: vr.foundation >= 30 ? 'ready' : vr.foundation >= 15 ? 'developing' : 'beginner'
        }
      },
      
      // 中級VRスキル分析
      intermediate: {
        score: vr.intermediate,
        factors: {
          grammarUnderstanding: skills.grammar,
          pronunciationAccuracy: skills.pronunciation,
          spatialAwareness: vr.spatialAwareness,
          readinessLevel: vr.intermediate >= 50 ? 'ready' : vr.intermediate >= 30 ? 'developing' : 'preparing'
        }
      },
      
      // 上級VRスキル分析
      advanced: {
        score: vr.advanced,
        factors: {
          listeningComprehension: skills.listening,
          rhythmMastery: skills.rhythm,
          complexInteraction: Math.min(100, stats.perfectScores * 5),
          readinessLevel: vr.advanced >= 70 ? 'ready' : vr.advanced >= 50 ? 'developing' : 'not-ready'
        }
      },
      
      // マスターVRスキル分析
      master: {
        score: vr.master,
        factors: {
          overallMastery: playerStore.averageSkillLevel,
          vrExperience: Math.min(100, stats.vrPlayTime / 3600 * 10), // 時間ベース
          immersionTolerance: vr.immersionLevel,
          readinessLevel: vr.master >= 80 ? 'master' : vr.master >= 60 ? 'advanced' : 'developing'
        }
      }
    }
  })
  
  // 総合VR準備度スコア
  const overallVRScore = computed(() => {
    return playerStore.overallVRReadiness
  })
  
  // VRアクセス推奨レベル
  const recommendedVRLevel = computed(() => {
    const score = overallVRScore.value
    const details = vrReadinessDetails.value
    
    if (score >= 80 && details.master.readinessLevel === 'master') {
      return {
        level: 'vr-master',
        description: 'フル没入型VR学習に最適',
        features: ['完全VR環境', 'ハンドトラッキング', 'ボイスコマンド', 'AI教師']
      }
    } else if (score >= 60 && details.advanced.readinessLevel === 'ready') {
      return {
        level: 'vr-advanced',
        description: '高度なVR学習機能を利用可能',
        features: ['3D学習環境', '空間インタラクション', 'ジェスチャー制御']
      }
    } else if (score >= 40 && details.intermediate.readinessLevel === 'ready') {
      return {
        level: 'vr-intermediate',
        description: '基本的なVR学習体験',
        features: ['簡単VR環境', 'コントローラー操作', '快適設定']
      }
    } else if (score >= 20 && details.foundation.readinessLevel === 'ready') {
      return {
        level: 'vr-foundation',
        description: 'VR入門レベル',
        features: ['VR体験モード', 'ガイド付き操作', '短時間セッション']
      }
    } else {
      return {
        level: 'screen-learning',
        description: '画面学習で基礎を固める段階',
        features: ['2D学習', '基礎スキル強化', 'VR準備トレーニング']
      }
    }
  })
  
  // 学習進捗の分析
  const learningAnalysis = computed(() => {
    const skills = playerStore.profile.skills
    const crystals = playerStore.profile.crystals
    const achievements = playerStore.earnedAchievements
    
    return {
      // スキル分布
      skillDistribution: {
        phonics: { level: skills.phonics, crystals: crystals.sound },
        vocabulary: { level: skills.vocabulary, crystals: crystals.word },
        grammar: { level: skills.grammar, crystals: crystals.grammar },
        pronunciation: { level: skills.pronunciation, crystals: crystals.rhythm },
        listening: { level: skills.listening, crystals: crystals.blend },
        rhythm: { level: skills.rhythm, crystals: crystals.pattern },
        blending: { level: skills.blending, crystals: crystals.master }
      },
      
      // バランス分析
      balance: {
        mostAdvanced: Object.entries(skills).reduce((a, b) => skills[a[0] as keyof typeof skills] > skills[b[0] as keyof typeof skills] ? a : b)[0],
        leastAdvanced: Object.entries(skills).reduce((a, b) => skills[a[0] as keyof typeof skills] < skills[b[0] as keyof typeof skills] ? a : b)[0],
        variance: Math.round(Math.sqrt(Object.values(skills).reduce((sum, val) => sum + Math.pow(val - playerStore.averageSkillLevel, 2), 0) / Object.values(skills).length))
      },
      
      // 成長傾向
      growthTrend: calculateGrowthTrend(),
      
      // 次の目標
      nextGoals: calculateNextGoals(),
      
      // VR移行準備度
      vrTransitionReadiness: {
        readyForVR: overallVRScore.value >= 40,
        missingSkills: identifyMissingVRSkills(),
        estimatedTimeToVR: estimateTimeToVRReadiness()
      }
    }
  })
  
  // 学習推奨事項
  const learningRecommendations = computed(() => {
    const analysis = learningAnalysis.value
    const vrLevel = recommendedVRLevel.value
    const recommendations = []
    
    // スキルバランス改善
    if (analysis.balance.variance > 20) {
      recommendations.push({
        type: 'skill-balance',
        priority: 'high',
        title: 'スキルバランスの改善',
        description: `${analysis.balance.leastAdvanced}スキルの強化が推奨されます`,
        action: `${analysis.balance.leastAdvanced}系のゲームを重点的にプレイしてください`
      })
    }
    
    // VR準備に向けた推奨
    if (vrLevel.level === 'screen-learning') {
      recommendations.push({
        type: 'vr-preparation',
        priority: 'medium',
        title: 'VR準備トレーニング',
        description: '基礎スキルを強化してVR学習に備えましょう',
        action: 'フォニックスと語彙ゲームに集中してください'
      })
    } else if (vrLevel.level === 'vr-foundation') {
      recommendations.push({
        type: 'vr-intro',
        priority: 'high',
        title: 'VR学習デビュー',
        description: 'VR学習を開始する準備が整いました！',
        action: 'VR体験モードから始めてみましょう'
      })
    }
    
    // クリスタル収集推奨
    const totalCrystals = playerStore.totalCrystals
    if (totalCrystals < playerStore.profile.level * 10) {
      recommendations.push({
        type: 'crystal-collection',
        priority: 'low',
        title: 'クリスタル収集',
        description: 'より多くのクリスタルを集めて能力を強化しましょう',
        action: '完璧なスコアを目指してゲームをプレイしてください'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    })
  })
  
  // 成長トレンド計算（仮想データベース）
  function calculateGrowthTrend() {
    // 実際の実装では過去のデータを使用
    const recentProgress = playerStore.profile.stats.gamesPlayed * 0.5
    const trend = recentProgress > 10 ? 'increasing' : recentProgress > 5 ? 'stable' : 'slow'
    
    return {
      trend,
      description: trend === 'increasing' ? '順調な成長' : trend === 'stable' ? '安定した進歩' : '成長の余地あり',
      weeklyGrowth: Math.round(recentProgress * 0.1),
      projectedLevel: Math.round(playerStore.profile.level + recentProgress * 0.05)
    }
  }
  
  // 次の目標計算
  function calculateNextGoals() {
    const goals = []
    const skills = playerStore.profile.skills
    const level = playerStore.profile.level
    
    // レベルアップ目標
    const expToNext = playerStore.nextLevelExp - (playerStore.profile.totalExp % 1000)
    if (expToNext > 0) {
      goals.push({
        type: 'level-up',
        target: level + 1,
        progress: Math.round(((playerStore.profile.totalExp % 1000) / 1000) * 100),
        description: `レベル${level + 1}まで${expToNext}EXP`
      })
    }
    
    // スキル目標
    Object.entries(skills).forEach(([skill, value]) => {
      const nextMilestone = Math.ceil(value / 10) * 10
      if (nextMilestone > value && nextMilestone <= 100) {
        goals.push({
          type: 'skill-milestone',
          target: nextMilestone,
          skill,
          progress: Math.round((value / nextMilestone) * 100),
          description: `${skill}スキル${nextMilestone}到達`
        })
      }
    })
    
    // VR準備目標
    if (overallVRScore.value < 40) {
      goals.push({
        type: 'vr-readiness',
        target: 40,
        progress: Math.round((overallVRScore.value / 40) * 100),
        description: 'VR学習準備完了'
      })
    }
    
    return goals.slice(0, 3) // 上位3つの目標
  }
  
  // VRに必要なスキル特定
  function identifyMissingVRSkills() {
    const missing = []
    const vr = playerStore.profile.vrReadiness
    const skills = playerStore.profile.skills
    
    if (vr.foundation < 30) {
      missing.push({ skill: 'phonics', current: skills.phonics, target: 30 })
      missing.push({ skill: 'vocabulary', current: skills.vocabulary, target: 30 })
    }
    
    if (vr.spatialAwareness < 50) {
      missing.push({ skill: 'spatial-awareness', current: vr.spatialAwareness, target: 50, description: 'ゲーム精度の向上が必要' })
    }
    
    if (vr.motionTolerance < 60) {
      missing.push({ skill: 'motion-tolerance', current: vr.motionTolerance, target: 60, description: 'より長時間の学習セッションに慣れる' })
    }
    
    return missing
  }
  
  // VR準備完了までの推定時間
  function estimateTimeToVRReadiness() {
    const currentScore = overallVRScore.value
    const targetScore = 40
    
    if (currentScore >= targetScore) return 0
    
    const recentGrowthRate = playerStore.profile.stats.gamesPlayed * 0.1 // 仮の成長率
    const scoreGap = targetScore - currentScore
    
    return Math.max(1, Math.round(scoreGap / Math.max(1, recentGrowthRate)))
  }
  
  // VRセッション分析
  const vrSessionAnalysis = computed(() => {
    const stats = playerStore.profile.stats
    
    return {
      totalVRTime: stats.vrPlayTime,
      averageSessionLength: stats.vrSessionsCompleted > 0 ? Math.round(stats.vrPlayTime / stats.vrSessionsCompleted / 60) : 0,
      longestSession: Math.round(stats.longestVRSession / 60),
      vrPerformance: {
        accuracy: stats.vrGamesPlayed > 0 ? Math.round((stats.totalCorrectAnswers / stats.totalAttempts) * 100) : 0,
        improvement: calculateVRImprovement(),
        motionAdaptation: playerStore.profile.vrReadiness.motionTolerance
      },
      recommendations: generateVRSessionRecommendations()
    }
  })
  
  function calculateVRImprovement() {
    // VRセッションでの改善率計算（仮想データ）
    const vrSessions = playerStore.profile.stats.vrSessionsCompleted
    return vrSessions > 3 ? Math.min(100, vrSessions * 5) : 0
  }
  
  function generateVRSessionRecommendations() {
    const analysis = vrSessionAnalysis.value
    const recommendations = []
    
    if (analysis.averageSessionLength < 10) {
      recommendations.push('セッション時間を徐々に延ばしてみましょう')
    }
    
    if (analysis.vrPerformance.accuracy < 70) {
      recommendations.push('VR環境での操作に慣れるため、簡単なゲームから始めましょう')
    }
    
    if (analysis.vrPerformance.motionAdaptation < 70) {
      recommendations.push('快適設定を調整し、モーション酔いを軽減しましょう')
    }
    
    return recommendations
  }
  
  // 統計追跡機能
  const trackGameResult = (gameResult: {
    gameType: string
    score: number
    accuracy: number
    timeSpent: number
    isVRSession?: boolean
    perfectScore?: boolean
  }) => {
    const { gameType, score, accuracy, timeSpent, isVRSession = false, perfectScore = false } = gameResult
    
    // 基本統計の更新
    playerStore.updateStats({
      gamesPlayed: playerStore.profile.stats.gamesPlayed + 1,
      totalPlayTime: playerStore.profile.stats.totalPlayTime + timeSpent,
      totalCorrectAnswers: playerStore.profile.stats.totalCorrectAnswers + Math.round(accuracy * 10 / 100),
      totalAttempts: playerStore.profile.stats.totalAttempts + 10,
      perfectScores: perfectScore ? playerStore.profile.stats.perfectScores + 1 : playerStore.profile.stats.perfectScores
    }, isVRSession)
    
    // 経験値の追加
    const baseExp = Math.round(score / 10)
    playerStore.addExp(baseExp, isVRSession)
    
    // スキルレベルの更新
    updateSkillsFromGame(gameType, accuracy, perfectScore)
    
    // クリスタルの獲得
    const crystalsEarned = calculateCrystalsFromGame(gameType, score, perfectScore)
    if (Object.values(crystalsEarned).some(v => v > 0)) {
      playerStore.addCrystals(crystalsEarned)
    }
    
    // 実績の進捗更新
    updateAchievementProgress(gameResult)
    
    // VRアカデミーとの同期（接続中の場合）
    if (playerStore.academyConnectionStatus === 'connected' && isVRSession) {
      syncVRSessionData(gameResult)
    }
  }
  
  function updateSkillsFromGame(gameType: string, accuracy: number, perfectScore: boolean) {
    const progressAmount = Math.round(accuracy / 10) + (perfectScore ? 2 : 0)
    
    // ゲームタイプに基づくスキル更新
    const gameSkillMap: Record<string, keyof typeof playerStore.profile.skills> = {
      'pureSoundLab': 'phonics',
      'singlePhoneme': 'phonics',
      'wordRush': 'vocabulary',
      'grammarColorCode': 'grammar',
      'magicCardBattle': 'pronunciation',
      'voicePuzzle': 'listening',
      'rhythmTapper': 'rhythm',
      'blendingBuilder': 'blending'
    }
    
    const skill = gameSkillMap[gameType]
    if (skill) {
      playerStore.updateSkill(skill, progressAmount)
    }
  }
  
  function calculateCrystalsFromGame(gameType: string, score: number, perfectScore: boolean) {
    const baseCrystals = Math.floor(score / 100)
    const bonusCrystals = perfectScore ? 5 : 0
    
    const crystalTypes: Record<string, keyof typeof playerStore.profile.crystals> = {
      'pureSoundLab': 'sound',
      'singlePhoneme': 'sound',
      'wordRush': 'word',
      'grammarColorCode': 'grammar',
      'rhythmTapper': 'rhythm',
      'blendingBuilder': 'blend'
    }
    
    const crystalType = crystalTypes[gameType] || 'sound'
    
    return {
      [crystalType]: baseCrystals + bonusCrystals,
      ...(perfectScore && { master: 1 })
    }
  }
  
  function updateAchievementProgress(gameResult: any) {
    // 実績進捗の更新ロジック
    if (gameResult.perfectScore) {
      playerStore.updateAchievementProgress('perfect-week', 1)
    }
    
    if (gameResult.isVRSession) {
      playerStore.updateAchievementProgress('vr-hour-milestone', gameResult.timeSpent)
      
      if (playerStore.profile.vrReadiness.motionTolerance >= 80) {
        playerStore.updateAchievementProgress('vr-motion-master', playerStore.profile.vrReadiness.motionTolerance)
      }
    }
    
    // スキルベースの実績
    Object.entries(playerStore.profile.skills).forEach(([skill, level]) => {
      if (skill === 'phonics' && level >= 10) {
        playerStore.updateAchievementProgress('phonics-beginner', level)
      }
      if (skill === 'phonics' && level >= 50) {
        playerStore.updateAchievementProgress('phonics-master', level)
      }
    })
    
    // VR準備度実績
    if (overallVRScore.value >= 40) {
      playerStore.updateAchievementProgress('vr-ready', overallVRScore.value)
    }
  }
  
  async function syncVRSessionData(sessionData: any) {
    try {
      await vrAcademySync.uploadVRSessionData({
        sessionId: `session_${Date.now()}`,
        startTime: new Date(Date.now() - sessionData.timeSpent * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: sessionData.timeSpent,
        gameType: sessionData.gameType,
        score: sessionData.score,
        accuracy: sessionData.accuracy
      })
    } catch (error) {
      logger.error('VR session sync failed:', error)
    }
  }
  
  return {
    // VR準備度関連
    vrReadinessDetails,
    overallVRScore,
    recommendedVRLevel,
    
    // 学習分析
    learningAnalysis,
    learningRecommendations,
    
    // VRセッション分析
    vrSessionAnalysis,
    
    // 追跡機能
    trackGameResult,
    
    // 同期機能
    syncPlayerData
  }
}