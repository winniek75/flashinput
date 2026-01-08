/**
 * Galaxy Trading Empire - Learning Analytics System
 * 学習分析と個別最適化推奨システム
 */

/**
 * 学習パターン分析エンジン
 */
export class LearningAnalytics {
  constructor(gameStore, galaxyStore) {
    this.gameStore = gameStore
    this.galaxyStore = galaxyStore
  }

  /**
   * 総合学習分析の実行
   */
  analyzeOverallProgress() {
    const progress = this.gameStore.getGalaxyTradingData()
    const investmentData = this.galaxyStore.playerInvestments
    
    return {
      learningVelocity: this.calculateLearningVelocity(progress),
      skillBalance: this.analyzeSkillBalance(progress),
      retentionRate: this.calculateRetentionRate(progress),
      investmentReadiness: this.assessInvestmentReadiness(progress, investmentData),
      recommendedPath: this.generateOptimalLearningPath(progress),
      riskProfile: this.assessLearnerRiskProfile(progress, investmentData)
    }
  }

  /**
   * 学習速度の計算
   */
  calculateLearningVelocity(progress) {
    const games = ['cvcWord', 'blendingBuilder', 'grammarPattern']
    let totalVelocity = 0
    let validGames = 0

    games.forEach(gameType => {
      const gameProgress = progress[gameType]
      if (gameProgress?.lastPlayed) {
        const daysSinceStart = this.getDaysSince(gameProgress.firstPlayed || gameProgress.lastPlayed)
        const progressRate = (gameProgress.progress || 0) / Math.max(daysSinceStart, 1)
        totalVelocity += progressRate
        validGames++
      }
    })

    const averageVelocity = validGames > 0 ? totalVelocity / validGames : 0
    
    return {
      overall: averageVelocity,
      category: this.categorizeVelocity(averageVelocity),
      trend: this.calculateVelocityTrend(progress),
      recommendation: this.getVelocityRecommendation(averageVelocity)
    }
  }

  /**
   * スキルバランス分析
   */
  analyzeSkillBalance(progress) {
    const skills = {
      phonics: progress.cvcWord?.progress || 0,
      blending: progress.blendingBuilder?.progress || 0,
      grammar: progress.grammarPattern?.progress || 0
    }

    const average = Object.values(skills).reduce((sum, val) => sum + val, 0) / 3
    const variance = Object.values(skills).reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 3
    const standardDeviation = Math.sqrt(variance)

    const weakestSkill = Object.entries(skills).reduce((min, [skill, score]) => 
      score < min.score ? { skill, score } : min, { skill: '', score: 100 }
    )

    const strongestSkill = Object.entries(skills).reduce((max, [skill, score]) => 
      score > max.score ? { skill, score } : max, { skill: '', score: 0 }
    )

    return {
      skills,
      balance: standardDeviation < 15 ? 'balanced' : standardDeviation < 30 ? 'moderate' : 'unbalanced',
      weakestSkill,
      strongestSkill,
      variance: standardDeviation,
      recommendation: this.getBalanceRecommendation(weakestSkill, strongestSkill, standardDeviation)
    }
  }

  /**
   * 記憶定着率の計算
   */
  calculateRetentionRate(progress) {
    const retentionData = []
    
    Object.entries(progress).forEach(([gameType, gameData]) => {
      if (gameData.sessions && gameData.sessions.length > 1) {
        // 過去のセッションから記憶定着率を推定
        const recentSessions = gameData.sessions.slice(-5)
        const improvementTrend = this.calculateImprovementTrend(recentSessions)
        retentionData.push({
          gameType,
          retention: improvementTrend,
          consistency: this.calculateConsistency(recentSessions)
        })
      }
    })

    const averageRetention = retentionData.length > 0 
      ? retentionData.reduce((sum, data) => sum + data.retention, 0) / retentionData.length
      : 75 // デフォルト値

    return {
      overall: averageRetention,
      byGame: retentionData,
      category: this.categorizeRetention(averageRetention),
      recommendation: this.getRetentionRecommendation(averageRetention)
    }
  }

  /**
   * 投資準備度の評価
   */
  assessInvestmentReadiness(progress, investmentData) {
    const skillScore = this.calculateOverallSkillScore(progress)
    const experienceScore = this.calculateExperienceScore(progress)
    const riskUnderstanding = this.assessRiskUnderstanding(investmentData)
    
    const readinessScore = (skillScore * 0.4 + experienceScore * 0.3 + riskUnderstanding * 0.3)

    return {
      score: readinessScore,
      level: this.categorizeReadiness(readinessScore),
      components: {
        skills: skillScore,
        experience: experienceScore,
        riskUnderstanding
      },
      recommendation: this.getReadinessRecommendation(readinessScore)
    }
  }

  /**
   * 最適学習パスの生成
   */
  generateOptimalLearningPath(progress) {
    const skillBalance = this.analyzeSkillBalance(progress)
    const velocity = this.calculateLearningVelocity(progress)
    
    const path = []

    // 基礎スキルが不足している場合の優先順位
    if (skillBalance.skills.phonics < 60) {
      path.push({
        priority: 'high',
        planet: 'apple-planet',
        skill: 'phonics',
        estimatedDays: Math.ceil((60 - skillBalance.skills.phonics) / Math.max(velocity.overall, 2)),
        reason: 'CVC単語認識は全ての学習の基礎となります'
      })
    }

    if (skillBalance.skills.blending < 60) {
      path.push({
        priority: skillBalance.skills.phonics >= 60 ? 'high' : 'medium',
        planet: 'robot-planet',
        skill: 'blending',
        estimatedDays: Math.ceil((60 - skillBalance.skills.blending) / Math.max(velocity.overall, 2)),
        reason: '音素ブレンディングは読解力向上に必要です'
      })
    }

    if (skillBalance.skills.grammar < 60) {
      path.push({
        priority: skillBalance.skills.phonics >= 60 && skillBalance.skills.blending >= 60 ? 'high' : 'low',
        planet: 'grammar-moon',
        skill: 'grammar',
        estimatedDays: Math.ceil((60 - skillBalance.skills.grammar) / Math.max(velocity.overall, 1.5)),
        reason: '文法パターン理解は高度な投資判断に必要です'
      })
    }

    return path.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * 学習者リスクプロファイルの評価
   */
  assessLearnerRiskProfile(progress, investmentData) {
    const decisionSpeed = this.analyzeDecisionSpeed(progress)
    const consistencyScore = this.calculateLearningConsistency(progress)
    const investmentPattern = this.analyzeInvestmentPattern(investmentData)
    
    const conservativeScore = consistencyScore * 0.4 + (100 - decisionSpeed) * 0.3 + investmentPattern.conservative * 0.3
    const aggressiveScore = decisionSpeed * 0.4 + investmentPattern.aggressive * 0.6
    
    let profile = 'moderate'
    if (conservativeScore > 70) profile = 'conservative'
    else if (aggressiveScore > 70) profile = 'aggressive'

    return {
      profile,
      scores: {
        conservative: conservativeScore,
        moderate: 100 - Math.abs(conservativeScore - aggressiveScore),
        aggressive: aggressiveScore
      },
      traits: this.getProfileTraits(profile),
      recommendation: this.getProfileRecommendation(profile)
    }
  }

  // === ヘルパーメソッド ===

  getDaysSince(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    return Math.max(1, Math.floor((now - date) / (1000 * 60 * 60 * 24)))
  }

  categorizeVelocity(velocity) {
    if (velocity > 10) return 'very_fast'
    if (velocity > 5) return 'fast'
    if (velocity > 2) return 'moderate'
    return 'slow'
  }

  categorizeRetention(retention) {
    if (retention > 85) return 'excellent'
    if (retention > 70) return 'good'
    if (retention > 55) return 'fair'
    return 'needs_improvement'
  }

  categorizeReadiness(score) {
    if (score > 85) return 'ready'
    if (score > 70) return 'nearly_ready'
    if (score > 55) return 'developing'
    return 'not_ready'
  }

  calculateOverallSkillScore(progress) {
    const skills = ['cvcWord', 'blendingBuilder', 'grammarPattern']
    const scores = skills.map(skill => progress[skill]?.progress || 0)
    return scores.reduce((sum, score) => sum + score, 0) / skills.length
  }

  calculateExperienceScore(progress) {
    const totalSessions = Object.values(progress).reduce((sum, game) => 
      sum + (game.sessions?.length || 0), 0
    )
    return Math.min(100, totalSessions * 5) // 20セッションで満点
  }

  assessRiskUnderstanding(investmentData) {
    const investments = investmentData.ownedPlanets || []
    if (investments.length === 0) return 30 // 経験なし

    const diversification = Math.min(100, (investments.length / 3) * 100)
    const avgRiskLevel = this.calculateAverageRiskLevel(investments)
    
    return (diversification + avgRiskLevel) / 2
  }

  getVelocityRecommendation(velocity) {
    const recommendations = {
      very_fast: '素晴らしいペースです！より高度な挑戦を検討してみましょう。',
      fast: '良好な学習ペースです。継続して成長していきましょう。',
      moderate: '安定した学習ペースです。少しずつ挑戦レベルを上げてみましょう。',
      slow: '学習ペースを上げることを検討してみましょう。短時間の集中学習が効果的です。'
    }
    return recommendations[this.categorizeVelocity(velocity)]
  }

  getBalanceRecommendation(weakest, strongest, variance) {
    if (variance < 15) {
      return 'バランスの取れた学習ができています。全体的なレベルアップを目指しましょう。'
    } else {
      return `${this.getSkillDisplayName(weakest.skill)}の強化を重点的に行うことをお勧めします。`
    }
  }

  getSkillDisplayName(skill) {
    const names = {
      phonics: 'フォニックス（CVC単語）',
      blending: '音素ブレンディング',
      grammar: '文法パターン認識'
    }
    return names[skill] || skill
  }

  getProfileTraits(profile) {
    const traits = {
      conservative: ['慎重な判断', '安定性重視', 'リスク回避型', '長期的視点'],
      moderate: ['バランス型', '適度なリスク許容', '柔軟な判断', '実用的アプローチ'],
      aggressive: ['積極的', '高リスク許容', '迅速な判断', '成長重視']
    }
    return traits[profile] || []
  }

  getProfileRecommendation(profile) {
    const recommendations = {
      conservative: '安定性の高い投資から始めて、徐々に経験を積んでいきましょう。',
      moderate: 'バランスの取れた投資ポートフォリオを構築することをお勧めします。',
      aggressive: '多様な投資機会を活用して、積極的な成長を目指しましょう。'
    }
    return recommendations[profile]
  }

  // その他の分析メソッド...
  calculateVelocityTrend(progress) {
    // 学習速度のトレンド分析
    return 'improving' // 簡略化
  }

  calculateImprovementTrend(sessions) {
    // セッション間の改善傾向
    return 75 // 簡略化
  }

  calculateConsistency(sessions) {
    // 学習の一貫性
    return 80 // 簡略化
  }

  analyzeDecisionSpeed(progress) {
    // 意思決定の速度分析
    return 60 // 簡略化
  }

  calculateLearningConsistency(progress) {
    // 学習の一貫性計算
    return 75 // 簡略化
  }

  analyzeInvestmentPattern(investmentData) {
    // 投資パターン分析
    return { conservative: 60, aggressive: 40 } // 簡略化
  }

  calculateAverageRiskLevel(investments) {
    // 平均リスクレベル計算
    return 60 // 簡略化
  }
}

/**
 * スマート推奨エンジン
 */
export class SmartRecommendationEngine {
  constructor(analytics) {
    this.analytics = analytics
  }

  /**
   * サイコロ結果に基づく高度な推奨生成
   */
  generateAdvancedRecommendation(diceResult, currentContext) {
    const analysis = this.analytics.analyzeOverallProgress()
    const timeOfDay = new Date().getHours()
    const dayOfWeek = new Date().getDay()
    
    // コンテキストアウェア推奨
    const baseRecommendation = this.getBaseRecommendation(diceResult, analysis)
    const contextualModifier = this.getContextualModifier(timeOfDay, dayOfWeek, analysis)
    const personalizedGuidance = this.getPersonalizedGuidance(analysis)

    return {
      ...baseRecommendation,
      contextualMessage: contextualModifier.message,
      personalizedTips: personalizedGuidance,
      confidence: this.calculateConfidence(analysis),
      adaptiveActions: this.generateAdaptiveActions(diceResult, analysis)
    }
  }

  getBaseRecommendation(diceResult, analysis) {
    const path = analysis.recommendedPath[0] // 最優先の学習パス
    
    if (!path) {
      return {
        icon: '🎉',
        title: '素晴らしい進歩です！',
        message: '全てのスキルがバランス良く成長しています。新しい挑戦を始めましょう。',
        priority: 'celebration'
      }
    }

    const planetIcons = {
      'apple-planet': '🍎',
      'robot-planet': '🤖',
      'grammar-moon': '🌙'
    }

    return {
      icon: planetIcons[path.planet],
      title: `${path.skill} スキル強化推奨`,
      message: `${path.reason} (推定${path.estimatedDays}日で達成可能)`,
      priority: path.priority,
      planet: path.planet
    }
  }

  getContextualModifier(hour, day, analysis) {
    // 時間・曜日に基づくコンテキスト修正
    if (hour < 12 && analysis.learningVelocity.category === 'fast') {
      return {
        message: '朝の集中力を活かして、挑戦的な学習に取り組みましょう！',
        energyBonus: 1.2
      }
    } else if (hour > 18 && analysis.retentionRate.overall < 70) {
      return {
        message: '夕方は復習に最適な時間です。今日学んだことを振り返りましょう。',
        reviewFocus: true
      }
    }

    return { message: '', energyBonus: 1.0 }
  }

  getPersonalizedGuidance(analysis) {
    const tips = []
    
    if (analysis.learningVelocity.category === 'slow') {
      tips.push('💡 短時間（10-15分）の集中学習を複数回行うと効果的です')
    }
    
    if (analysis.skillBalance.balance === 'unbalanced') {
      tips.push(`🎯 ${analysis.skillBalance.weakestSkill.skill}に重点を置いた学習をお勧めします`)
    }
    
    if (analysis.retentionRate.category === 'needs_improvement') {
      tips.push('🔄 学習後の復習時間を増やすことで定着率が向上します')
    }

    return tips
  }

  calculateConfidence(analysis) {
    // 推奨の信頼度計算
    const dataPoints = analysis.investmentReadiness.components.experience
    const balanceScore = 100 - analysis.skillBalance.variance
    return Math.min(100, (dataPoints + balanceScore) / 2)
  }

  generateAdaptiveActions(diceResult, analysis) {
    // 適応的アクション生成
    const actions = []
    const path = analysis.recommendedPath[0]

    if (path) {
      actions.push({
        id: 'optimal-learning',
        icon: '🎯',
        label: `${path.skill}を重点学習`,
        color: this.getPlanetColor(path.planet),
        action: 'learn',
        target: path.planet,
        confidence: 'high'
      })
    }

    // リスクプロファイルに応じた投資推奨
    if (analysis.investmentReadiness.level !== 'not_ready') {
      const profile = analysis.riskProfile.profile
      actions.push({
        id: 'risk-appropriate-investment',
        icon: '💼',
        label: this.getRiskAppropriateLabel(profile),
        color: 'linear-gradient(90deg, #10B981, #059669)',
        action: 'invest',
        target: this.getRecommendedPlanet(profile),
        confidence: 'medium'
      })
    }

    return actions
  }

  getPlanetColor(planet) {
    const colors = {
      'apple-planet': 'linear-gradient(90deg, #FF6B6B, #FF8E8E)',
      'robot-planet': 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
      'grammar-moon': 'linear-gradient(90deg, #8B5CF6, #7C3AED)'
    }
    return colors[planet] || 'linear-gradient(90deg, #6B7280, #9CA3AF)'
  }

  getRiskAppropriateLabel(profile) {
    const labels = {
      conservative: '安定投資を検討',
      moderate: 'バランス投資を検討',
      aggressive: '成長投資を検討'
    }
    return labels[profile]
  }

  getRecommendedPlanet(profile) {
    const planets = {
      conservative: 'apple-planet',
      moderate: 'robot-planet',
      aggressive: 'grammar-moon'
    }
    return planets[profile]
  }
}

// ファクトリー関数
export function createLearningAnalytics(gameStore, galaxyStore) {
  return new LearningAnalytics(gameStore, galaxyStore)
}

export function createSmartRecommendationEngine(analytics) {
  return new SmartRecommendationEngine(analytics)
}