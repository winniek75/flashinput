import DataMigrationSystem from './dataMigration'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import logger from '@/utils/logger'

/**
 * マイグレーションシステムのテスト機能
 */
export class MigrationTestSuite {
  private migrationSystem: DataMigrationSystem

  constructor() {
    this.migrationSystem = new DataMigrationSystem()
  }

  /**
   * 完全なテストスイートの実行
   */
  async runFullTestSuite(): Promise<{ success: boolean; results: any[] }> {
    logger.log('🧪 Running full migration test suite...')
    
    const results = []
    
    try {
      // 1. テストデータ生成
      results.push(await this.testDataGeneration())
      
      // 2. データ検出テスト
      results.push(await this.testDataDetection())
      
      // 3. バックアップ機能テスト
      results.push(await this.testBackupFunctionality())
      
      // 4. 個別マイグレーションテスト
      results.push(await this.testGameStoreMigration())
      results.push(await this.testTypingArenaMigration())
      results.push(await this.testGrammarGalaxyMigration())
      
      // 5. 統合マイグレーションテスト
      results.push(await this.testFullMigration())
      
      // 6. VR準備度計算テスト
      results.push(await this.testVRReadinessCalculation())
      
      // 7. バックアップ復元テスト
      results.push(await this.testBackupRestoration())
      
      const success = results.every(result => result.success)
      
      logger.log(`✅ Test suite completed: ${success ? 'PASS' : 'FAIL'}`)
      return { success, results }
      
    } catch (error) {
      logger.error('❌ Test suite failed:', error)
      return { 
        success: false, 
        results: [{ testName: 'Test Suite Execution', success: false, error: error.message }]
      }
    }
  }

  /**
   * テストデータ生成のテスト
   */
  private async testDataGeneration(): Promise<any> {
    try {
      logger.log('🔍 Testing data generation...')
      
      // 既存データをクリア
      this.clearTestData()
      
      // テストデータ生成
      DataMigrationSystem.generateTestData()
      
      // 生成されたデータの検証
      const gameData = localStorage.getItem('movwiseGameData')
      const typingData = localStorage.getItem('typingArena')
      const grammarData = localStorage.getItem('grammarGalaxy')
      
      const success = !!(gameData && typingData && grammarData)
      
      return {
        testName: 'Data Generation',
        success,
        details: {
          gameDataGenerated: !!gameData,
          typingDataGenerated: !!typingData, 
          grammarDataGenerated: !!grammarData
        }
      }
    } catch (error) {
      return {
        testName: 'Data Generation',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * データ検出機能のテスト
   */
  private async testDataDetection(): Promise<any> {
    try {
      logger.log('🔍 Testing data detection...')
      
      // プライベートメソッドにアクセスするため、リフレクションを使用
      const migrationSystem = new DataMigrationSystem()
      const detectMethod = migrationSystem['detectLegacyData']
      
      if (!detectMethod) {
        throw new Error('detectLegacyData method not accessible')
      }
      
      const detectedData = detectMethod.call(migrationSystem)
      const detectedKeys = Object.keys(detectedData)
      
      return {
        testName: 'Data Detection',
        success: detectedKeys.length > 0,
        details: {
          detectedStores: detectedKeys,
          totalStores: detectedKeys.length
        }
      }
    } catch (error) {
      return {
        testName: 'Data Detection',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * バックアップ機能のテスト
   */
  private async testBackupFunctionality(): Promise<any> {
    try {
      logger.log('💾 Testing backup functionality...')
      
      // バックアップキーをクリア
      localStorage.removeItem('movwise-data-backup')
      
      // マイグレーション実行（バックアップが作成される）
      const migrationSystem = new DataMigrationSystem()
      
      // プライベートメソッドへのアクセス
      await migrationSystem['createBackup']()
      
      const backup = localStorage.getItem('movwise-data-backup')
      const backupExists = !!backup
      
      let backupValid = false
      if (backup) {
        try {
          const parsed = JSON.parse(backup)
          backupValid = !!(parsed.timestamp && parsed.data)
        } catch (e) {
          backupValid = false
        }
      }
      
      return {
        testName: 'Backup Functionality',
        success: backupExists && backupValid,
        details: {
          backupExists,
          backupValid,
          backupSize: backup ? backup.length : 0
        }
      }
    } catch (error) {
      return {
        testName: 'Backup Functionality',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * ゲームストアマイグレーションのテスト
   */
  private async testGameStoreMigration(): Promise<any> {
    try {
      logger.log('🎮 Testing game store migration...')
      
      // プレイヤープロフィールストアの初期化
      const playerStore = usePlayerProfileStore()
      const initialLevel = playerStore.profile.level
      const initialExp = playerStore.profile.totalExp
      
      // テストデータでマイグレーション実行
      const migrationSystem = new DataMigrationSystem()
      const result = await migrationSystem.executeMigration()
      
      // 結果の検証
      const levelIncreased = playerStore.profile.level > initialLevel
      const expIncreased = playerStore.profile.totalExp > initialExp
      const skillsUpdated = result.migratedData.skillsUpdated > 0
      
      return {
        testName: 'Game Store Migration',
        success: result.success && (levelIncreased || expIncreased || skillsUpdated),
        details: {
          migrationSuccess: result.success,
          levelBefore: initialLevel,
          levelAfter: playerStore.profile.level,
          expBefore: initialExp,
          expAfter: playerStore.profile.totalExp,
          skillsUpdated: result.migratedData.skillsUpdated,
          crystalsAwarded: result.migratedData.crystalsAwarded
        }
      }
    } catch (error) {
      return {
        testName: 'Game Store Migration',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * TypingArenaマイグレーションのテスト
   */
  private async testTypingArenaMigration(): Promise<any> {
    try {
      logger.log('⌨️ Testing TypingArena migration...')
      
      // TypingArena特有のテストデータを作成
      const typingTestData = {
        character: {
          name: 'テストタイパー',
          level: 10,
          totalExp: 5000,
          title: 'タイピング・マスター',
          stats: {
            vocabulary: 40,
            accuracy: 35,
            speed: 50
          }
        },
        storyMode: {
          completedStages: [1, 2, 3, 4, 5, 6, 7, 8],
          bosses: {
            wordEater: { defeated: true },
            grammarDragon: { defeated: true }
          }
        },
        practiceStats: {
          totalTime: 10800, // 3時間
          bestWPM: 85,
          levelProgress: {
            eiken5: { completed: 20, bestScore: 500 },
            eiken4: { completed: 18, bestScore: 450 }
          }
        }
      }
      
      localStorage.setItem('typingArena', JSON.stringify(typingTestData))
      
      const playerStore = usePlayerProfileStore()
      const initialVocabSkill = playerStore.profile.skills.vocabulary
      
      // マイグレーション実行
      const migrationSystem = new DataMigrationSystem()
      const result = await migrationSystem.executeMigration()
      
      const vocabSkillImproved = playerStore.profile.skills.vocabulary > initialVocabSkill
      
      return {
        testName: 'TypingArena Migration',
        success: result.success && vocabSkillImproved,
        details: {
          vocabSkillBefore: initialVocabSkill,
          vocabSkillAfter: playerStore.profile.skills.vocabulary,
          gamesProcessed: result.migratedData.gamesProcessed,
          crystalsAwarded: result.migratedData.crystalsAwarded
        }
      }
    } catch (error) {
      return {
        testName: 'TypingArena Migration',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * GrammarGalaxyマイグレーションのテスト
   */
  private async testGrammarGalaxyMigration(): Promise<any> {
    try {
      logger.log('🌌 Testing Grammar Galaxy migration...')
      
      // GrammarGalaxy特有のテストデータを作成
      const grammarTestData = {
        playerData: {
          totalStars: 45,
          totalGamesCompleted: 32,
          currentStreak: 12
        },
        planetsData: {
          beVerb: {
            stars: 15,
            games: [
              { stars: 3, bestScore: 98 },
              { stars: 3, bestScore: 95 },
              { stars: 2, bestScore: 85 }
            ]
          },
          generalVerb: {
            stars: 18,
            games: [
              { stars: 3, bestScore: 100 },
              { stars: 3, bestScore: 92 }
            ]
          }
        }
      }
      
      localStorage.setItem('grammarGalaxy', JSON.stringify(grammarTestData))
      
      const playerStore = usePlayerProfileStore()
      const initialGrammarSkill = playerStore.profile.skills.grammar
      
      // マイグレーション実行
      const migrationSystem = new DataMigrationSystem()
      const result = await migrationSystem.executeMigration()
      
      const grammarSkillImproved = playerStore.profile.skills.grammar > initialGrammarSkill
      const grammarCrystalsAwarded = playerStore.profile.crystals.grammar > 0
      
      return {
        testName: 'Grammar Galaxy Migration',
        success: result.success && grammarSkillImproved,
        details: {
          grammarSkillBefore: initialGrammarSkill,
          grammarSkillAfter: playerStore.profile.skills.grammar,
          grammarCrystals: playerStore.profile.crystals.grammar,
          achievementsUnlocked: result.migratedData.achievementsUnlocked
        }
      }
    } catch (error) {
      return {
        testName: 'Grammar Galaxy Migration',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 統合マイグレーションのテスト
   */
  private async testFullMigration(): Promise<any> {
    try {
      logger.log('🚀 Testing full migration integration...')
      
      // すべてのテストデータを再生成
      this.clearTestData()
      DataMigrationSystem.generateTestData()
      
      const playerStore = usePlayerProfileStore()
      
      // 初期状態を記録
      const initialState = {
        level: playerStore.profile.level,
        totalExp: playerStore.profile.totalExp,
        crystals: { ...playerStore.profile.crystals },
        skills: { ...playerStore.profile.skills },
        achievements: playerStore.earnedAchievements.length
      }
      
      // フル マイグレーション実行
      const migrationSystem = new DataMigrationSystem()
      const result = await migrationSystem.executeMigration()
      
      // 最終状態を記録
      const finalState = {
        level: playerStore.profile.level,
        totalExp: playerStore.profile.totalExp,
        crystals: { ...playerStore.profile.crystals },
        skills: { ...playerStore.profile.skills },
        achievements: playerStore.earnedAchievements.length
      }
      
      // 改善を確認
      const improvements = {
        levelGain: finalState.level - initialState.level,
        expGain: finalState.totalExp - initialState.totalExp,
        crystalGain: Object.values(finalState.crystals).reduce((a, b) => a + b, 0) - 
                     Object.values(initialState.crystals).reduce((a, b) => a + b, 0),
        skillGain: Object.values(finalState.skills).reduce((a, b) => a + b, 0) - 
                   Object.values(initialState.skills).reduce((a, b) => a + b, 0),
        achievementGain: finalState.achievements - initialState.achievements
      }
      
      const hasImprovements = Object.values(improvements).some(gain => gain > 0)
      
      return {
        testName: 'Full Migration Integration',
        success: result.success && hasImprovements,
        details: {
          migrationResult: result,
          initialState,
          finalState,
          improvements
        }
      }
    } catch (error) {
      return {
        testName: 'Full Migration Integration',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * VR準備度計算のテスト
   */
  private async testVRReadinessCalculation(): Promise<any> {
    try {
      logger.log('🥽 Testing VR readiness calculation...')
      
      const playerStore = usePlayerProfileStore()
      
      // スキルを意図的に設定
      playerStore.updateSkill('phonics', 30)
      playerStore.updateSkill('vocabulary', 25)
      playerStore.updateSkill('grammar', 20)
      playerStore.updateSkill('pronunciation', 15)
      
      // VR準備度の再計算
      const migrationSystem = new DataMigrationSystem()
      migrationSystem['recalculateVRReadiness']()
      
      const vrReadiness = playerStore.profile.vrReadiness
      const overallScore = playerStore.overallVRReadiness
      
      const vrReadinessValid = vrReadiness.foundation > 0 && overallScore > 0
      
      return {
        testName: 'VR Readiness Calculation',
        success: vrReadinessValid,
        details: {
          vrReadiness,
          overallScore,
          recommendedLevel: playerStore.vrAccessLevel
        }
      }
    } catch (error) {
      return {
        testName: 'VR Readiness Calculation',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * バックアップ復元のテスト
   */
  private async testBackupRestoration(): Promise<any> {
    try {
      logger.log('♻️ Testing backup restoration...')
      
      // 現在のデータをバックアップ
      const originalData = {}
      const keys = ['movwiseGameData', 'typingArena', 'grammarGalaxy']
      keys.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) originalData[key] = data
      })
      
      // データを変更
      localStorage.setItem('testKey', 'testValue')
      
      // バックアップから復元
      const restored = await DataMigrationSystem.restoreFromBackup()
      
      // 復元後の検証
      const testKeyExists = localStorage.getItem('testKey') !== null
      
      return {
        testName: 'Backup Restoration',
        success: restored && !testKeyExists, // テストキーが削除されていることを確認
        details: {
          restorationSucceeded: restored,
          testKeyRemoved: !testKeyExists,
          originalDataKeys: Object.keys(originalData)
        }
      }
    } catch (error) {
      return {
        testName: 'Backup Restoration',
        success: false,
        error: error.message
      }
    }
  }

  /**
   * テストデータのクリア
   */
  private clearTestData(): void {
    const keysToRemove = [
      'movwiseGameData',
      'typingArena',
      'grammarGalaxy',
      'sightWordMaster',
      'aiPractice',
      'characterStore',
      'vrSettings',
      'movwise-data-backup',
      'movwise-migration-status',
      'movwise-player-profile-vr'
    ]
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  /**
   * テストレポートの生成
   */
  generateTestReport(results: any[]): string {
    const passedTests = results.filter(r => r.success).length
    const totalTests = results.length
    
    let report = `
# MovWISE データマイグレーション テストレポート

## 概要
- 実行日時: ${new Date().toLocaleString()}
- 総テスト数: ${totalTests}
- 成功: ${passedTests}
- 失敗: ${totalTests - passedTests}
- 成功率: ${Math.round((passedTests / totalTests) * 100)}%

## 詳細結果
`
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      report += `
### ${index + 1}. ${result.testName} ${status}
`
      
      if (result.details) {
        report += '**詳細:**\n'
        Object.entries(result.details).forEach(([key, value]) => {
          report += `- ${key}: ${JSON.stringify(value)}\n`
        })
      }
      
      if (result.error) {
        report += `**エラー:** ${result.error}\n`
      }
    })
    
    return report
  }
}

/**
 * テストの実行と結果表示
 */
export const runMigrationTests = async (): Promise<void> => {
  logger.log('🧪 Starting migration test suite...')
  
  const testSuite = new MigrationTestSuite()
  const { success, results } = await testSuite.runFullTestSuite()
  
  const report = testSuite.generateTestReport(results)
  logger.log(report)
  
  if (success) {
    logger.log('🎉 All tests passed!')
  } else {
    logger.error('💥 Some tests failed. Check the report above.')
  }
  
  return { success, results, report }
}

export default MigrationTestSuite