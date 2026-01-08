import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useGameStore } from './gameStore.js'
import logger from '@/utils/logger'

/**
 * Galaxy Trading Empire メインストア
 * 既存gameStoreとの安全な統合を重視した設計
 */
export const useGalaxyTradingStore = defineStore('galaxyTrading', () => {
  // === 基本設定 ===
  const isEnabled = ref(false) // 機能の段階的有効化制御
  const version = ref('1.0.0-alpha')
  
  // === 惑星企業データベース ===
  const planetCorporations = ref({
    'apple-planet': {
      id: 'apple-planet',
      name: 'Apple Garden Planet',
      ceo: 'アップルちゃん（りんご妖精）',
      theme: '農業・食品産業',
      businessType: 'りんご生産・販売',
      industryCategory: '第一次産業',
      emoji: '🍎',
      color: '#FF6B6B',
      
      // 投資データ
      investmentTiers: [
        { cost: 100, dailyReturn: 8, label: 'りんご畑スポンサー' },
        { cost: 300, dailyReturn: 25, label: 'オーガニック農園パートナー' },
        { cost: 500, dailyReturn: 45, label: '加工工場投資家' },
        { cost: 1000, dailyReturn: 90, label: 'ブランド共同開発者' },
        { cost: 2000, dailyReturn: 180, label: 'グローバル展開パートナー' }
      ],
      
      // 学習連携データ
      requiredGame: 'cvcWord',
      unlockThreshold: 20, // ゲーム進捗20%で解禁
      preparationTime: 15, // 分
      
      // VR連携データ
      vrSceneId: 'apple-planet-farm-tour',
      vrPreparationQR: null, // 後で生成
      vrReviewQR: null,
      culturalElements: ['農業の大切さ', '食べ物への感謝', '自然の恵み'],
      
      // リスクレベル
      riskLevel: 'low',
      popularityRating: 4.5,
      growthPotential: 85
    },
    
    'robot-planet': {
      id: 'robot-planet',
      name: 'Robot Manufacturing Planet',
      ceo: 'Dr.メカニック（ロボット博士）',
      theme: '技術・製造業',
      businessType: 'ロボット開発・製造',
      industryCategory: '第二次産業',
      emoji: '🤖',
      color: '#4ECDC4',
      
      investmentTiers: [
        { cost: 200, dailyReturn: 15, label: '部品サプライヤー' },
        { cost: 500, dailyReturn: 40, label: '開発チーム支援者' },
        { cost: 800, dailyReturn: 70, label: '製造ライン投資家' },
        { cost: 1500, dailyReturn: 135, label: 'AI技術パートナー' },
        { cost: 3000, dailyReturn: 270, label: '宇宙ロボット共同開発者' }
      ],
      
      requiredGame: 'blendingBuilder',
      unlockThreshold: 40,
      preparationTime: 20,
      
      vrSceneId: 'robot-planet-factory-tour',
      vrPreparationQR: null,
      vrReviewQR: null,
      culturalElements: ['技術革新', 'ものづくり精神', '未来への挑戦'],
      
      riskLevel: 'medium',
      popularityRating: 4.2,
      growthPotential: 95
    },
    
    'grammar-moon': {
      id: 'grammar-moon',
      name: 'Grammar Moon Station',
      ceo: 'Professor Grammar（文法博士）',
      theme: '教育・言語サービス',
      businessType: '言語学習システム開発',
      industryCategory: '第三次産業',
      emoji: '📚',
      color: '#96CEB4',
      
      investmentTiers: [
        { cost: 150, dailyReturn: 12, label: '教材開発サポーター' },
        { cost: 400, dailyReturn: 32, label: 'カリキュラム設計者' },
        { cost: 700, dailyReturn: 60, label: 'AI学習システム投資家' },
        { cost: 1200, dailyReturn: 110, label: 'グローバル教育パートナー' },
        { cost: 2500, dailyReturn: 225, label: '次世代学習革命リーダー' }
      ],
      
      requiredGame: 'grammarGalaxy',
      unlockThreshold: 60,
      preparationTime: 25,
      
      vrSceneId: 'grammar-moon-academy-tour',
      vrPreparationQR: null,
      vrReviewQR: null,
      culturalElements: ['学習の喜び', '知識の共有', '国際理解'],
      
      riskLevel: 'low',
      popularityRating: 4.7,
      growthPotential: 80
    }
  })
  
  // === プレイヤー投資データ ===
  const playerInvestments = ref({
    ownedPlanets: [], // [{ planetId, tier, purchaseDate, totalReturns }]
    totalInvested: 0,
    totalReturns: 0,
    lastReturnCalculation: null, // 最後のリターン計算時刻
    investmentHistory: [], // 投資履歴
    portfolioValue: 0,
    riskTolerance: 'conservative', // conservative, moderate, aggressive
    investmentStrategy: 'diversified' // diversified, focused, growth
  })
  
  // === 学習ガイドデータ ===
  const learningGuide = ref({
    recommendedPath: [],
    completedPlanets: [],
    nextObjectives: [],
    learningInsights: {},
    masteryThresholds: {
      'apple-planet': { phonics: 80, vocabulary: 75, blending: 70 },
      'robot-planet': { phonics: 85, vocabulary: 80, blending: 85 },
      'grammar-moon': { grammar: 80, sentence: 75, communication: 80 }
    }
  })
  
  // === サイコロシステム（基本版） ===
  const diceSystem = ref({
    lastRoll: null,
    rollHistory: [],
    guidanceEnabled: false, // Phase 2で有効化
    forcedGuidance: false   // 緊急時の学習ガイド強制
  })
  
  // === VR統合データ ===
  const vrIntegration = ref({
    preparationStatus: {},
    experienceHistory: [],
    nextRecommendations: [],
    qrCodeCache: new Map(),
    spatialIntegration: {
      enabled: false,
      connectionStatus: 'disconnected',
      lastSync: null
    }
  })
  
  // === 計算プロパティ ===
  
  /**
   * 既存gameStoreからの学習進捗データ取得
   */
  const learningProgress = computed(() => {
    const gameStore = useGameStore()
    return {
      cvcWord: gameStore.getGameProgress('cvcWord'),
      blendingBuilder: gameStore.getGameProgress('blendingBuilder'),
      grammar: gameStore.getGameProgress('grammarColorCode'),
      overallCompletion: gameStore.getCompletionRate()
    }
  })
  
  /**
   * 惑星解禁状況
   */
  const planetUnlockStatus = computed(() => {
    const progress = learningProgress.value
    
    return {
      'apple-planet': {
        unlocked: progress.cvcWord.progress >= 20,
        progress: progress.cvcWord.progress,
        required: 20
      },
      'robot-planet': {
        unlocked: progress.blendingBuilder.progress >= 40,
        progress: progress.blendingBuilder.progress,
        required: 40
      },
      'grammar-moon': {
        unlocked: progress.grammar.progress >= 60,
        progress: progress.grammar.progress,
        required: 60
      }
    }
  })
  
  /**
   * 利用可能エネルギーポイント（既存cosmicEnergyから取得）
   */
  const availableEnergy = computed(() => {
    const gameStore = useGameStore()
    return gameStore.playerData.cosmicEnergy || gameStore.playerData.exp || 0
  })
  
  /**
   * 投資可能な惑星リスト
   */
  const availablePlanets = computed(() => {
    const unlockStatus = planetUnlockStatus.value
    return Object.entries(planetCorporations.value).filter(([planetId]) => {
      return unlockStatus[planetId]?.unlocked
    }).map(([planetId, planetData]) => ({
      ...planetData,
      unlockStatus: unlockStatus[planetId]
    }))
  })
  
  /**
   * ポートフォリオ統計
   */
  const portfolioStats = computed(() => {
    const investments = playerInvestments.value.ownedPlanets
    
    return {
      totalPlanets: investments.length,
      totalValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
      dailyIncome: investments.reduce((sum, inv) => {
        const planet = planetCorporations.value[inv.planetId]
        const tier = planet.investmentTiers[inv.tier]
        return sum + tier.dailyReturn
      }, 0),
      diversificationScore: Math.min(100, (investments.length / 3) * 100),
      riskLevel: calculatePortfolioRisk(investments)
    }
  })
  
  // === アクション ===
  
  /**
   * 基本サイコロロール
   */
  const rollBasicDice = () => {
    const result = Math.floor(Math.random() * 6) + 1
    const timestamp = new Date().toISOString()
    
    diceSystem.value.lastRoll = {
      result,
      timestamp,
      guidance: null // Phase 2で学習ガイド追加
    }
    
    diceSystem.value.rollHistory.push(diceSystem.value.lastRoll)
    
    // 履歴の管理（最新50回分保持）
    if (diceSystem.value.rollHistory.length > 50) {
      diceSystem.value.rollHistory = diceSystem.value.rollHistory.slice(-50)
    }
    
    return result
  }
  
  /**
   * 惑星への投資実行
   */
  const investInPlanet = (planetId, tierIndex) => {
    const gameStore = useGameStore()
    const planet = planetCorporations.value[planetId]
    const tier = planet.investmentTiers[tierIndex]
    
    // 資金チェック
    if (availableEnergy.value < tier.cost) {
      throw new Error('エネルギーポイントが不足しています')
    }
    
    // 解禁チェック
    if (!planetUnlockStatus.value[planetId]?.unlocked) {
      throw new Error('この惑星はまだ解禁されていません')
    }
    
    // 投資実行
    const investment = {
      id: Date.now().toString(),
      planetId,
      tier: tierIndex,
      cost: tier.cost,
      dailyReturn: tier.dailyReturn,
      purchaseDate: new Date().toISOString(),
      totalReturns: 0,
      currentValue: tier.cost
    }
    
    // データ更新
    playerInvestments.value.ownedPlanets.push(investment)
    playerInvestments.value.totalInvested += tier.cost
    playerInvestments.value.investmentHistory.push({
      type: 'purchase',
      ...investment
    })
    
    // 既存gameStoreのエネルギー減算
    gameStore.playerData.cosmicEnergy -= tier.cost
    if (gameStore.playerData.exp) {
      gameStore.playerData.exp -= tier.cost
    }
    
    // 投資教育効果の記録
    recordInvestmentLearning(planetId, tierIndex, tier.cost)
    
    // データ永続化
    saveData()
    
    return investment
  }
  
  /**
   * 投資教育効果の記録
   */
  const recordInvestmentLearning = (planetId, tierIndex, cost) => {
    const planet = planetCorporations.value[planetId]
    const educationalImpact = {
      timestamp: new Date().toISOString(),
      planet: planet.name,
      concept: getEducationalConcept(tierIndex),
      amount: cost,
      riskLevel: planet.riskLevel
    }
    
    // 学習インサイトの更新
    if (!learningGuide.value.learningInsights[planetId]) {
      learningGuide.value.learningInsights[planetId] = []
    }
    learningGuide.value.learningInsights[planetId].push(educationalImpact)
    
    logger.log(`📈 投資教育記録: ${planet.name} - ${educationalImpact.concept}`)
  }
  
  /**
   * 投資レベルから教育概念を取得
   */
  const getEducationalConcept = (tierIndex) => {
    const concepts = [
      '基本投資の理解',
      '分散投資の概念',
      'リスクとリターンの関係',
      '複利効果の体験',
      '長期投資戦略の学習'
    ]
    return concepts[tierIndex] || concepts[0]
  }
  
  // この関数は506行目に完全版があるため、ここでは削除
  // calculateDailyReturns は下部で定義
  
  /**
   * ポートフォリオリスクの計算
   */
  const calculatePortfolioRisk = (investments) => {
    if (investments.length === 0) return 'none'
    
    const riskLevels = investments.map(inv => {
      const planet = planetCorporations.value[inv.planetId]
      return planet.riskLevel
    })
    
    const lowRisk = riskLevels.filter(r => r === 'low').length
    const mediumRisk = riskLevels.filter(r => r === 'medium').length
    const highRisk = riskLevels.filter(r => r === 'high').length
    
    if (highRisk > lowRisk && highRisk > mediumRisk) return 'high'
    if (mediumRisk > lowRisk) return 'medium'
    return 'low'
  }
  
  /**
   * Galaxy Trading システムの有効化
   */
  const enableGalaxyTrading = () => {
    isEnabled.value = true
    logger.log('🚀 Galaxy Trading Empire が有効化されました')
  }
  
  /**
   * VRとの統合データ取得
   */
  const getVRIntegrationData = () => {
    return {
      investmentExperience: playerInvestments.value.ownedPlanets.length,
      riskUnderstanding: calculateRiskUnderstanding(),
      planetExperience: learningGuide.value.completedPlanets,
      portfolioComplexity: portfolioStats.value.diversificationScore,
      culturalReadiness: calculateCulturalReadiness()
    }
  }
  
  const calculateRiskUnderstanding = () => {
    const history = playerInvestments.value.investmentHistory
    const riskFactors = {
      diversification: portfolioStats.value.diversificationScore > 50 ? 20 : 0,
      experience: Math.min(30, history.length * 3),
      riskAwareness: learningGuide.value.learningInsights ? 25 : 0,
      timeHorizon: playerInvestments.value.ownedPlanets.length > 0 ? 25 : 0
    }
    
    return Object.values(riskFactors).reduce((sum, score) => sum + score, 0)
  }
  
  const calculateCulturalReadiness = () => {
    const completedPlanets = learningGuide.value.completedPlanets
    const culturalExposure = completedPlanets.reduce((total, planetId) => {
      const planet = planetCorporations.value[planetId]
      return total + (planet?.culturalElements?.length || 0)
    }, 0)
    
    return Math.min(100, culturalExposure * 10)
  }
  
  /**
   * データの永続化
   */
  const saveData = () => {
    try {
      const saveData = {
        playerInvestments: playerInvestments.value,
        learningGuide: learningGuide.value,
        diceSystem: diceSystem.value,
        vrIntegration: vrIntegration.value,
        isEnabled: isEnabled.value,
        version: version.value,
        lastSaved: new Date().toISOString()
      }
      
      localStorage.setItem('movwise-galaxy-trading', JSON.stringify(saveData))
      logger.log('💾 Galaxy Trading データ保存完了')
    } catch (error) {
      logger.error('❌ Galaxy Trading データ保存エラー:', error)
    }
  }
  
  /**
   * データの読み込み
   */
  const loadData = () => {
    try {
      const savedData = localStorage.getItem('movwise-galaxy-trading')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        // バージョンチェック
        if (data.version === version.value) {
          playerInvestments.value = { ...playerInvestments.value, ...data.playerInvestments }
          learningGuide.value = { ...learningGuide.value, ...data.learningGuide }
          diceSystem.value = { ...diceSystem.value, ...data.diceSystem }
          vrIntegration.value = { ...vrIntegration.value, ...data.vrIntegration }
          isEnabled.value = data.isEnabled || false
          
          logger.log('📂 Galaxy Trading データ読み込み完了')
          return true
        } else {
          logger.log('⚠️ データバージョンが異なるため初期化')
        }
      }
    } catch (error) {
      logger.error('❌ Galaxy Trading データ読み込みエラー:', error)
    }
    return false
  }
  
  /**
   * デイリーリターン計算システム
   */
  const calculateDailyReturns = () => {
    if (!isEnabled.value) {
      logger.log('🚫 Galaxy Trading システムが無効のため、リターン計算をスキップ')
      return
    }
    
    const currentTime = new Date()
    const lastCalculated = new Date(playerInvestments.value.lastReturnCalculation || 0)
    
    // 最後の計算から24時間以上経過している場合のみ実行
    const timeDiff = currentTime - lastCalculated
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    if (hoursDiff < 24) {
      logger.log(`⏰ デイリーリターン計算：まだ${(24 - hoursDiff).toFixed(1)}時間待つ必要があります`)
      return {
        calculated: false,
        nextCalculation: new Date(lastCalculated.getTime() + 24 * 60 * 60 * 1000),
        hoursRemaining: 24 - hoursDiff
      }
    }
    
    let totalDailyReturn = 0
    const gameStore = useGameStore()
    
    // 各投資の日次リターンを計算
    playerInvestments.value.ownedPlanets.forEach(investment => {
      const planet = planetCorporations.value[investment.planetId]
      if (!planet) {
        logger.warn(`⚠️ 惑星データが見つかりません: ${investment.planetId}`)
        return
      }
      
      const tier = planet.investmentTiers[investment.tier]
      if (!tier) {
        logger.warn(`⚠️ 投資階層データが見つかりません: ${investment.planetId} tier ${investment.tier}`)
        return
      }
      
      const dailyReturn = tier.dailyReturn
      investment.totalReturns += dailyReturn
      investment.currentValue += dailyReturn
      totalDailyReturn += dailyReturn
      
      logger.log(`💰 ${planet.name} から ${dailyReturn} EP のリターン`)
    })
    
    if (totalDailyReturn > 0) {
      // プレイヤーのエナジーポイントに追加
      playerInvestments.value.totalReturns += totalDailyReturn
      gameStore.addCosmicEnergy(totalDailyReturn)
      
      // 最終計算時刻を更新
      playerInvestments.value.lastReturnCalculation = currentTime.toISOString()
      
      // VR統合データも更新
      vrIntegration.value.lastReturnDistribution = currentTime.toISOString()
      vrIntegration.value.totalVRReturns += totalDailyReturn
      
      saveData()
      
      logger.log(`🎉 デイリーリターン計算完了: 総額 ${totalDailyReturn} EP を受け取りました`)
      
      // 成功通知イベントを発火
      window.dispatchEvent(new CustomEvent('galaxy-daily-returns', {
        detail: {
          totalReturn: totalDailyReturn,
          newBalance: gameStore.playerData.cosmicEnergy,
          timestamp: currentTime.toISOString(),
          investments: playerInvestments.value.ownedPlanets.length
        }
      }))
      
      return {
        calculated: true,
        totalReturn: totalDailyReturn,
        newBalance: gameStore.playerData.cosmicEnergy,
        nextCalculation: new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
      }
    } else {
      logger.log('📊 デイリーリターン計算：投資がないか、リターンがありません')
      playerInvestments.value.lastReturnCalculation = currentTime.toISOString()
      saveData()
      
      return {
        calculated: true,
        totalReturn: 0,
        message: '投資がまだありません',
        nextCalculation: new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  }
  
  /**
   * 手動リターン計算トリガー（開発・テスト用）
   */
  const triggerDailyReturns = () => {
    // 最終計算時刻をリセット
    playerInvestments.value.lastReturnCalculation = new Date(0).toISOString()
    return calculateDailyReturns()
  }
  
  /**
   * 自動デイリーリターンチェック（アプリ起動時）
   */
  const checkDailyReturnsOnStartup = () => {
    if (!isEnabled.value) return
    
    logger.log('🕒 アプリ起動時デイリーリターンチェック開始')
    const result = calculateDailyReturns()
    
    if (result?.calculated && result.totalReturn > 0) {
      // 遅延してユーザーに通知
      setTimeout(() => {
        logger.log('🎊 起動時にデイリーリターンが発生しました！')
        // 通知表示ロジックはUI側で実装
      }, 2000)
    }
    
    return result
  }
  
  /**
   * テスト用データ生成
   */
  const generateTestData = () => {
    // Apple Planet への基本投資
    playerInvestments.value.ownedPlanets = [
      {
        id: 'test-apple-1',
        planetId: 'apple-planet',
        tier: 0,
        cost: 100,
        dailyReturn: 8,
        purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalReturns: 56,
        currentValue: 107
      }
    ]
    
    playerInvestments.value.totalInvested = 100
    playerInvestments.value.totalReturns = 56
    playerInvestments.value.lastReturnCalculation = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25時間前
    
    learningGuide.value.completedPlanets = ['apple-planet']
    
    isEnabled.value = true
    
    saveData()
    logger.log('🧪 Galaxy Trading テストデータ生成完了')
  }
  
  /**
   * データリセット
   */
  const resetData = () => {
    playerInvestments.value = {
      ownedPlanets: [],
      totalInvested: 0,
      totalReturns: 0,
      lastReturnCalculation: null,
      investmentHistory: [],
      portfolioValue: 0,
      riskTolerance: 'conservative',
      investmentStrategy: 'diversified'
    }
    
    learningGuide.value = {
      recommendedPath: [],
      completedPlanets: [],
      nextObjectives: [],
      learningInsights: {},
      masteryThresholds: {
        'apple-planet': { phonics: 80, vocabulary: 75, blending: 70 },
        'robot-planet': { phonics: 85, vocabulary: 80, blending: 85 },
        'grammar-moon': { grammar: 80, sentence: 75, communication: 80 }
      }
    }
    
    diceSystem.value = {
      lastRoll: null,
      rollHistory: [],
      guidanceEnabled: false,
      forcedGuidance: false
    }
    
    vrIntegration.value = {
      preparationStatus: {},
      experienceHistory: [],
      nextRecommendations: [],
      qrCodeCache: new Map(),
      spatialIntegration: {
        enabled: false,
        connectionStatus: 'disconnected',
        lastSync: null
      }
    }
    
    localStorage.removeItem('movwise-galaxy-trading')
    logger.log('🔄 Galaxy Trading データリセット完了')
  }
  
  // 初期化時にデータを読み込み
  loadData()
  
  return {
    // State
    isEnabled,
    version,
    planetCorporations,
    playerInvestments,
    learningGuide,
    diceSystem,
    vrIntegration,
    
    // Computed
    learningProgress,
    planetUnlockStatus,
    availableEnergy,
    availablePlanets,
    portfolioStats,
    
    // Actions
    rollBasicDice,
    investInPlanet,
    calculateDailyReturns,
    triggerDailyReturns,
    checkDailyReturnsOnStartup,
    enableGalaxyTrading,
    getVRIntegrationData,
    saveData,
    loadData,
    generateTestData,
    resetData,
    
    // Private helpers (exported for testing)
    recordInvestmentLearning,
    calculatePortfolioRisk,
    calculateRiskUnderstanding,
    calculateCulturalReadiness
  }
})

/**
 * Galaxy Trading と既存システムの統合ブリッジ
 */
export const GalaxyTradingBridge = {
  /**
   * 既存gameStoreとの学習データ同期
   */
  syncWithGameStore: (galaxyStore, gameStore) => {
    const learningData = galaxyStore.learningProgress
    const unlockStatus = galaxyStore.planetUnlockStatus
    
    return {
      success: true,
      syncedData: {
        learningProgress: learningData,
        unlockedPlanets: Object.keys(unlockStatus).filter(p => unlockStatus[p].unlocked),
        energyPoints: galaxyStore.availableEnergy
      },
      lastSync: new Date().toISOString()
    }
  },
  
  /**
   * VR準備度システムとの連携
   */
  prepareVRIntegration: (galaxyStore) => {
    const vrData = galaxyStore.getVRIntegrationData()
    
    return {
      vrReadiness: vrData.riskUnderstanding >= 70,
      recommendedScenarios: vrData.planetExperience,
      culturalPreparation: vrData.culturalReadiness >= 60,
      difficultyLevel: vrData.investmentExperience > 3 ? 'advanced' : 'beginner'
    }
  },
  
  /**
   * システム統合の検証
   */
  validateIntegration: (galaxyStore, gameStore) => {
    const energySync = galaxyStore.availableEnergy > 0
    const progressSync = Object.keys(galaxyStore.learningProgress).length > 0
    const dataIntegrity = galaxyStore.playerInvestments.ownedPlanets.every(inv => 
      galaxyStore.planetCorporations[inv.planetId]
    )
    
    return {
      energySync,
      progressSync,
      dataIntegrity,
      overall: energySync && progressSync && dataIntegrity,
      timestamp: new Date().toISOString()
    }
  }
}