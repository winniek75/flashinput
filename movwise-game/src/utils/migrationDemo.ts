/**
 * マイグレーションシステムのデモとテスト実行用ファイル
 */
import DataMigrationSystem from './dataMigration'
import MigrationTestSuite, { runMigrationTests } from './migrationTest'
import { usePlayerProfileStore } from '@/stores/playerProfile'
import logger from '@/utils/logger'

/**
 * デモ用のリッチなテストデータを生成
 */
export function generateRichTestData(): void {
  logger.log('🎭 Generating rich test data for migration demo...')
  
  // 基本ゲームストアデータ
  const gameStoreData = {
    playerData: {
      name: 'Demo Player',
      captainLevel: 15,
      cosmicEnergy: 7500,
      soundGems: 350,
      avatar: '🚀',
      title: 'ギャラクシー・エクスプローラー',
      navigationDays: 25,
      joinDate: '2024-01-01T00:00:00.000Z',
      lastLoginDate: new Date().toISOString(),
      explorationPoints: 1200
    },
    gameProgress: {
      wordRush: {
        completed: true,
        bestScore: 2500,
        progress: 95,
        attempts: 45,
        masteredWords: ['apple', 'book', 'cat', 'dog', 'elephant', 'fish', 'green', 'house'],
        averageAccuracy: 88
      },
      pureSoundLab: {
        completed: true,
        bestScore: 1800,
        progress: 90,
        attempts: 32,
        masteredPhonemes: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        averagePronunciation: 92
      },
      grammarColorCode: {
        completed: true,
        bestScore: 1200,
        progress: 85,
        attempts: 28,
        masteredConcepts: ['be-verb', 'present-tense', 'past-tense'],
        averageAccuracy: 85
      },
      singlePhoneme: {
        completed: true,
        bestScore: 950,
        progress: 75,
        attempts: 20,
        masteredPhonemes: ['th', 'sh', 'ch', 'ng'],
        averagePronunciation: 87
      },
      blendingBuilder: {
        completed: false,
        bestScore: 650,
        progress: 60,
        attempts: 15,
        masteredBlends: ['bl', 'cr', 'st'],
        averageAccuracy: 78
      }
    },
    gameStats: {
      totalPlayTime: 18000, // 5時間
      totalGamesPlayed: 145,
      totalCorrectAnswers: 1250,
      totalAttempts: 1450,
      wordRush: {
        gamesPlayed: 45,
        bestScore: 2500,
        averageAccuracy: 88,
        bestStreak: 12,
        spatialReadiness: 75
      },
      vrReadinessScore: 65
    },
    achievements: {
      firstStep: { earned: true, earnedDate: '2024-01-02T10:00:00.000Z' },
      streakStar: { earned: true, earnedDate: '2024-01-15T14:30:00.000Z' },
      perfectPlayer: { earned: true, earnedDate: '2024-01-20T16:45:00.000Z' },
      phonicsMaster: { earned: false, earnedDate: null },
      speedDemon: { earned: true, earnedDate: '2024-01-25T12:20:00.000Z' },
      vrReady: { earned: true, earnedDate: '2024-01-30T09:15:00.000Z' }
    }
  }

  // TypingArenaの詳細データ
  const typingArenaData = {
    character: {
      name: 'Demo Typer',
      level: 12,
      experience: 8500,
      totalExp: 8500,
      nextLevelExp: 12000,
      title: 'タイピング・レジェンド',
      stats: {
        speed: 45,
        accuracy: 42,
        stamina: 38,
        vocabulary: 50,
        focus: 35,
        leadership: 25
      },
      skills: {
        active: {
          focusMode: { level: 3, unlocked: true },
          speedBoost: { level: 2, unlocked: true },
          perfectStrike: { level: 1, unlocked: true }
        },
        passive: {
          quickRecovery: { level: 2, unlocked: true },
          comboMaster: { level: 3, unlocked: true }
        }
      }
    },
    storyMode: {
      unlocked: true,
      currentChapter: 3,
      currentStage: 5,
      completedStages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      chapters: {
        1: { completed: true, stars: 3 },
        2: { completed: true, stars: 3 },
        3: { completed: false, stars: 2 }
      },
      bosses: {
        wordEater: { defeated: true, bestTime: 45.2, attempts: 3 },
        grammarDragon: { defeated: true, bestTime: 67.8, attempts: 5 },
        sentenceKing: { defeated: false, bestTime: null, attempts: 2 }
      }
    },
    practiceStats: {
      totalSessions: 85,
      totalTime: 15600, // 4.3時間
      bestWPM: 95,
      averageAccuracy: 91,
      levelProgress: {
        eiken5: { completed: 20, total: 20, bestScore: 485 },
        eiken4: { completed: 20, total: 20, bestScore: 465 },
        eiken3: { completed: 15, total: 20, bestScore: 420 },
        eikenPre2: { completed: 8, total: 20, bestScore: 380 },
        eiken2: { completed: 3, total: 20, bestScore: 340 }
      }
    }
  }

  // Grammar Galaxyの詳細データ
  const grammarGalaxyData = {
    playerData: {
      level: 8,
      totalStars: 67,
      totalGamesCompleted: 48,
      currentStreak: 18,
      lastPlayDate: new Date().toISOString(),
      preferences: {
        difficulty: 'hard',
        soundEnabled: true,
        animationsEnabled: true
      }
    },
    planetsData: {
      beVerb: {
        id: 'beVerb',
        unlocked: true,
        stars: 24,
        maxStars: 30,
        gamesCompleted: 12,
        games: [
          { id: 'grammarColorCode', stars: 3, bestScore: 98, attempts: 5 },
          { id: 'patternHunter', stars: 3, bestScore: 95, attempts: 4 }
        ]
      },
      generalVerb: {
        id: 'generalVerb',
        unlocked: true,
        stars: 21,
        maxStars: 30,
        gamesCompleted: 10,
        games: [
          { id: 'grammarReflexArena', stars: 3, bestScore: 92, attempts: 6 },
          { id: 'patternHunter', stars: 3, bestScore: 88, attempts: 7 }
        ]
      },
      questionForm: {
        id: 'questionForm',
        unlocked: true,
        stars: 15,
        maxStars: 30,
        gamesCompleted: 8,
        games: [
          { id: 'grammarColorCode', stars: 2, bestScore: 78, attempts: 8 }
        ]
      }
    }
  }

  // AI練習データ
  const aiPracticeData = {
    sessionsCompleted: 25,
    totalPracticeTime: 7200, // 2時間
    conversationLevel: 8,
    scenarios: {
      restaurant: { completed: 5, bestScore: 88 },
      shopping: { completed: 4, bestScore: 85 },
      travel: { completed: 3, bestScore: 82 }
    },
    aiCompanions: {
      echo: { level: 3, conversations: 15 },
      sage: { level: 2, conversations: 8 }
    }
  }

  // キャラクターデータ
  const characterData = {
    selectedAvatar: '🌟',
    characterTitle: 'スペース・アカデミー・チャンピオン',
    customizations: {
      spacesuit: 'galaxy-explorer',
      helmet: 'crystal-visor',
      badge: 'language-master'
    },
    abilities: {
      speaking: 35,
      listening: 32,
      vocabulary: 45,
      grammar: 38,
      phonics: 42
    }
  }

  // VR設定データ
  const vrSettingsData = {
    deviceType: 'oculus-quest-2',
    comfortMode: true,
    teleportMovement: true,
    hapticFeedback: true,
    voiceCommands: true,
    fieldOfView: 85,
    ipd: 64,
    calibrationCompleted: true
  }

  // SightWordの進捗データ
  const sightWordData = {
    totalWordsLearned: 125,
    levelProgress: {
      1: { completed: 25, bestTime: 1200, accuracy: 92 },
      2: { completed: 23, bestTime: 1450, accuracy: 88 },
      3: { completed: 15, bestTime: 1800, accuracy: 85 }
    },
    streakRecord: 28,
    lastPlayedDate: new Date().toISOString()
  }

  // データを保存
  const testDataSets = [
    { key: 'movwiseGameData', data: gameStoreData },
    { key: 'typingArena', data: typingArenaData },
    { key: 'grammarGalaxy', data: grammarGalaxyData },
    { key: 'aiPractice', data: aiPracticeData },
    { key: 'characterStore', data: characterData },
    { key: 'vrSettings', data: vrSettingsData },
    { key: 'sightWordMaster', data: sightWordData }
  ]

  testDataSets.forEach(({ key, data }) => {
    localStorage.setItem(key, JSON.stringify(data))
    logger.log(`✓ Generated ${key} test data`)
  })

  logger.log('🎉 Rich test data generation completed!')
}

/**
 * マイグレーション前後の比較
 */
export async function runMigrationComparison(): Promise<void> {
  logger.log('📊 Running migration comparison...')
  
  // プレイヤープロフィールストアを取得
  const playerStore = usePlayerProfileStore()
  
  // 初期状態を記録
  const beforeMigration = {
    level: playerStore.profile.level,
    totalExp: playerStore.profile.totalExp,
    totalCrystals: playerStore.totalCrystals,
    averageSkillLevel: playerStore.averageSkillLevel,
    overallVRReadiness: playerStore.overallVRReadiness,
    earnedAchievements: playerStore.earnedAchievements.length,
    unlockedPlanets: playerStore.unlockedPlanets.length
  }

  logger.log('📷 Before migration snapshot:', beforeMigration)

  // リッチテストデータを生成
  generateRichTestData()

  // マイグレーション実行
  const migrationSystem = new DataMigrationSystem()
  const result = await migrationSystem.executeMigration()

  // 移行後の状態を記録
  const afterMigration = {
    level: playerStore.profile.level,
    totalExp: playerStore.profile.totalExp,
    totalCrystals: playerStore.totalCrystals,
    averageSkillLevel: playerStore.averageSkillLevel,
    overallVRReadiness: playerStore.overallVRReadiness,
    earnedAchievements: playerStore.earnedAchievements.length,
    unlockedPlanets: playerStore.unlockedPlanets.length
  }

  logger.log('📷 After migration snapshot:', afterMigration)

  // 改善を計算
  const improvements = {
    levelGain: afterMigration.level - beforeMigration.level,
    expGain: afterMigration.totalExp - beforeMigration.totalExp,
    crystalGain: afterMigration.totalCrystals - beforeMigration.totalCrystals,
    skillGain: afterMigration.averageSkillLevel - beforeMigration.averageSkillLevel,
    vrReadinessGain: afterMigration.overallVRReadiness - beforeMigration.overallVRReadiness,
    achievementGain: afterMigration.earnedAchievements - beforeMigration.earnedAchievements,
    planetGain: afterMigration.unlockedPlanets - beforeMigration.unlockedPlanets
  }

  // 結果をレポート
  logger.group('📈 Migration Comparison Report')
  logger.log('Migration Result:', result.success ? '✅ Success' : '❌ Failed')
  logger.log('Migration Data:', result.migratedData)
  logger.log('Before → After Comparison:')
  Object.entries(improvements).forEach(([key, value]) => {
    const arrow = value > 0 ? '📈' : value < 0 ? '📉' : '➡️'
    logger.log(`  ${key}: ${arrow} ${value > 0 ? '+' : ''}${value}`)
  })
  
  if (result.errors && result.errors.length > 0) {
    logger.log('Errors:', result.errors)
  }
  
  if (result.warnings && result.warnings.length > 0) {
    logger.log('Warnings:', result.warnings)
  }
  logger.groupEnd()

  return {
    success: result.success,
    beforeMigration,
    afterMigration,
    improvements,
    migrationData: result.migratedData
  }
}

/**
 * インタラクティブなマイグレーションデモ
 */
export async function runInteractiveMigrationDemo(): Promise<void> {
  logger.log('🎮 Starting interactive migration demo...')
  
  // 1. 初期状態の表示
  logger.group('1️⃣ Initial State')
  const playerStore = usePlayerProfileStore()
  logger.log('Player Profile:', {
    name: playerStore.profile.name,
    level: playerStore.profile.level,
    totalExp: playerStore.profile.totalExp,
    title: playerStore.profile.title
  })
  logger.groupEnd()

  // 2. テストデータ生成
  logger.group('2️⃣ Generating Test Data')
  generateRichTestData()
  logger.log('✅ Rich test data generated')
  logger.groupEnd()

  // 3. データ検出デモ
  logger.group('3️⃣ Data Detection')
  const migrationSystem = new DataMigrationSystem()
  const detectedData = migrationSystem['detectLegacyData']()
  logger.log('Detected legacy stores:', Object.keys(detectedData))
  logger.groupEnd()

  // 4. バックアップデモ
  logger.group('4️⃣ Backup Creation')
  await migrationSystem['createBackup']()
  const backup = localStorage.getItem('movwise-data-backup')
  logger.log('Backup created:', !!backup)
  logger.groupEnd()

  // 5. マイグレーション実行
  logger.group('5️⃣ Migration Execution')
  const result = await migrationSystem.executeMigration()
  logger.log('Migration completed:', result.success)
  logger.log('Migration results:', result.migratedData)
  logger.groupEnd()

  // 6. 最終状態の表示
  logger.group('6️⃣ Final State')
  logger.log('Updated Player Profile:', {
    name: playerStore.profile.name,
    level: playerStore.profile.level,
    totalExp: playerStore.profile.totalExp,
    title: playerStore.profile.title,
    totalCrystals: playerStore.totalCrystals,
    vrReadiness: playerStore.overallVRReadiness
  })
  logger.groupEnd()

  logger.log('🎉 Interactive migration demo completed!')
  return result
}

/**
 * 開発者向けのクイックテスト
 */
export function quickMigrationTest(): void {
  logger.log('⚡ Running quick migration test...')
  
  // マイグレーション状態をリセット
  DataMigrationSystem.resetMigration()
  
  // テストデータを生成
  generateRichTestData()
  
  // テストスイートを実行
  runMigrationTests()
    .then(({ success, results }) => {
      if (success) {
        logger.log('✅ Quick test passed!')
      } else {
        logger.log('❌ Quick test failed!')
        logger.log('Failed tests:', results.filter(r => !r.success).map(r => r.testName))
      }
    })
    .catch(error => {
      logger.error('Quick test error:', error)
    })
}

// ブラウザのグローバルオブジェクトに関数を追加（開発用）
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.movwiseMigration = {
    generateRichTestData,
    runMigrationComparison,
    runInteractiveMigrationDemo,
    quickMigrationTest,
    runMigrationTests,
    resetMigration: DataMigrationSystem.resetMigration,
    generateTestData: DataMigrationSystem.generateTestData
  }
  
  logger.log(`
🛠️ MovWISE Migration Developer Tools loaded!
Available in console:
- window.movwiseMigration.generateRichTestData()
- window.movwiseMigration.runMigrationComparison()
- window.movwiseMigration.runInteractiveMigrationDemo()
- window.movwiseMigration.quickMigrationTest()
- window.movwiseMigration.runMigrationTests()
- window.movwiseMigration.resetMigration()
  `)
}

export default {
  generateRichTestData,
  runMigrationComparison,
  runInteractiveMigrationDemo,
  quickMigrationTest
}