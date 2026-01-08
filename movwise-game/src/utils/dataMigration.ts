import { usePlayerProfileStore } from '@/stores/playerProfile'
import logger from '@/utils/logger'

// マイグレーション対象のストアキー
const LEGACY_STORE_KEYS = [
  'movwiseGameData',           // 基本ゲームストア
  'typingArena',               // TypingArenaStore
  'grammarGalaxy',             // GrammarGalaxyStore  
  'beVerbRushStore',           // BeVerbRushStore
  'grammarMastery',            // GrammarMasteryStore
  'aiPractice',                // AIPracticeStore
  'soundAdventure',            // SoundAdventureAPI
  'characterStore',            // CharacterStore
  'sightWordMaster',           // SightWordMaster進捗
  'phonicsTrainingHub',        // PhonicsTrainingHub
  'wordRushHighScores',        // WordRush個別スコア
  'vrSettings',                // VR設定
  'spectatorMode'              // SpectatorMode設定
]

// バックアップキー
const BACKUP_KEY = 'movwise-data-backup'
const MIGRATION_STATUS_KEY = 'movwise-migration-status'
const MIGRATION_VERSION = '1.0.0'

interface MigrationStatus {
  completed: boolean
  version: string
  timestamp: string
  backupCreated: boolean
  migratedStores: string[]
  errors: string[]
}

interface LegacyGameData {
  [key: string]: any
}

interface MigrationResult {
  success: boolean
  migratedData: {
    gamesProcessed: number
    skillsUpdated: number
    achievementsUnlocked: number
    crystalsAwarded: number
    experienceGained: number
  }
  errors: string[]
  warnings: string[]
}

/**
 * 包括的データマイグレーションシステム
 */
export class DataMigrationSystem {
  private playerProfileStore = usePlayerProfileStore()
  private migrationStatus: MigrationStatus = {
    completed: false,
    version: MIGRATION_VERSION,
    timestamp: new Date().toISOString(),
    backupCreated: false,
    migratedStores: [],
    errors: []
  }

  /**
   * マイグレーションの実行
   */
  async executeMigration(): Promise<MigrationResult> {
    logger.log('🚀 Starting comprehensive data migration...')
    
    const result: MigrationResult = {
      success: false,
      migratedData: {
        gamesProcessed: 0,
        skillsUpdated: 0,
        achievementsUnlocked: 0,
        crystalsAwarded: 0,
        experienceGained: 0
      },
      errors: [],
      warnings: []
    }

    try {
      // 1. バックアップ作成
      await this.createBackup()
      
      // 2. 既存データの検出と読み込み
      const legacyData = this.detectLegacyData()
      
      if (Object.keys(legacyData).length === 0) {
        logger.log('ℹ️ No legacy data found, using fresh profile')
        this.migrationStatus.completed = true
        this.saveMigrationStatus()
        result.success = true
        return result
      }

      // 3. 各ストアデータのマイグレーション
      await this.migrateMainGameStore(legacyData.movwiseGameData, result)
      await this.migrateTypingArenaData(legacyData.typingArena, result)
      await this.migrateGrammarGalaxyData(legacyData.grammarGalaxy, result)
      await this.migrateSightWordData(legacyData.sightWordMaster, result)
      await this.migrateCharacterData(legacyData.characterStore, result)
      await this.migrateAIPracticeData(legacyData.aiPractice, result)
      await this.migrateSpecializedGameData(legacyData, result)

      // 4. VR準備度の再計算
      this.recalculateVRReadiness()

      // 5. マイグレーション完了
      this.migrationStatus.completed = true
      this.migrationStatus.timestamp = new Date().toISOString()
      this.saveMigrationStatus()
      
      result.success = true
      logger.log('✅ Data migration completed successfully!')
      
    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : String(error)}`
      logger.error('❌', errorMsg)
      result.errors.push(errorMsg)
      this.migrationStatus.errors.push(errorMsg)
    }

    return result
  }

  /**
   * バックアップの作成
   */
  private async createBackup(): Promise<void> {
    try {
      const backupData: { [key: string]: any } = {}
      
      LEGACY_STORE_KEYS.forEach(key => {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            backupData[key] = JSON.parse(data)
          } catch {
            backupData[key] = data // JSONでない場合は文字列として保存
          }
        }
      })

      if (Object.keys(backupData).length > 0) {
        const backup = {
          timestamp: new Date().toISOString(),
          version: MIGRATION_VERSION,
          data: backupData
        }
        
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
        this.migrationStatus.backupCreated = true
        logger.log('💾 Backup created successfully')
      }
    } catch (error) {
      logger.error('Failed to create backup:', error)
      throw new Error('Backup creation failed')
    }
  }

  /**
   * 既存データの検出
   */
  private detectLegacyData(): LegacyGameData {
    const legacyData: LegacyGameData = {}
    
    LEGACY_STORE_KEYS.forEach(key => {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          legacyData[key] = JSON.parse(data)
          this.migrationStatus.migratedStores.push(key)
        } catch (error) {
          logger.warn(`Failed to parse data for ${key}:`, error)
        }
      }
    })

    logger.log(`📊 Detected ${Object.keys(legacyData).length} legacy data stores`)
    return legacyData
  }

  /**
   * メインゲームストアのマイグレーション
   */
  private async migrateMainGameStore(data: any, result: MigrationResult): Promise<void> {
    if (!data) return

    logger.log('🎮 Migrating main game store data...')

    // プレイヤー基本情報
    if (data.playerData) {
      this.playerProfileStore.updateProfile({
        name: data.playerData.name || 'スペース・ルーキー',
        level: data.playerData.captainLevel || data.playerData.level || 1,
        totalExp: data.playerData.cosmicEnergy || data.playerData.exp || 0,
        avatar: data.playerData.avatar || '🚀',
        title: data.playerData.title || 'スペース・ルーキー',
        loginStreak: data.playerData.navigationDays || data.playerData.streak || 1
      })
      
      // 宇宙エネルギー→経験値変換
      if (data.playerData.cosmicEnergy) {
        result.migratedData.experienceGained += data.playerData.cosmicEnergy
      }
      
      // サウンドジェム→クリスタル変換
      if (data.playerData.soundGems) {
        this.playerProfileStore.addCrystals({
          sound: data.playerData.soundGems,
          word: Math.floor(data.playerData.soundGems * 0.6),
          master: Math.floor(data.playerData.soundGems * 0.1)
        })
        result.migratedData.crystalsAwarded += data.playerData.soundGems
      }
    }

    // ゲーム進捗データ
    if (data.gameProgress) {
      await this.migrateGameProgress(data.gameProgress, result)
    }

    // 統計データ
    if (data.gameStats) {
      this.playerProfileStore.updateStats({
        totalPlayTime: data.gameStats.totalPlayTime || 0,
        gamesPlayed: data.gameStats.totalGamesPlayed || 0,
        totalCorrectAnswers: data.gameStats.totalCorrectAnswers || 0,
        totalAttempts: data.gameStats.totalAttempts || 0,
        bestStreak: data.gameStats.wordRush?.bestStreak || 0
      })
    }

    // 実績データ
    if (data.achievements) {
      this.migrateAchievements(data.achievements, result)
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * ゲーム進捗データのマイグレーション
   */
  private async migrateGameProgress(gameProgress: any, result: MigrationResult): Promise<void> {
    const gameSkillMapping: { [key: string]: keyof typeof this.playerProfileStore.profile.skills } = {
      // フォニックス系
      'pureSoundLab': 'phonics',
      'singlePhoneme': 'phonics', 
      'soundHunter': 'phonics',
      'phonicsTrainingHub': 'phonics',
      'complexPhonemePatterns': 'phonics',
      'silentLetterDetective': 'phonics',
      
      // 語彙系
      'wordRush': 'vocabulary',
      'magicCardBattle': 'vocabulary',
      'spellRacing': 'vocabulary',
      'voicePuzzle': 'vocabulary',
      
      // 文法系
      'grammarColorCode': 'grammar',
      'beVerbRush': 'grammar',
      'patternHunter': 'grammar',
      'modalVerbChallenge': 'grammar',
      'timeZoneNavigator': 'grammar',
      
      // 発音系
      'magicCooking': 'pronunciation',
      'cvcWord': 'pronunciation',
      
      // リスニング系
      'rhyming': 'listening',
      'rhythmTapper': 'listening',
      
      // ブレンディング系
      'sequentialBlending': 'blending',
      'blendingBuilder': 'blending'
    }

    Object.entries(gameProgress).forEach(([gameId, progress]: [string, any]) => {
      if (!progress) return

      const skill = gameSkillMapping[gameId]
      if (skill && progress.progress) {
        const skillIncrease = Math.min(20, Math.round(progress.progress * 0.4))
        this.playerProfileStore.updateSkill(skill, skillIncrease)
        result.migratedData.skillsUpdated++
      }

      // ベストスコアからクリスタル付与
      if (progress.bestScore && progress.bestScore > 50) {
        const crystalAmount = Math.floor(progress.bestScore / 100)
        const crystalType = this.getGameCrystalType(gameId)
        this.playerProfileStore.addCrystals({ [crystalType]: crystalAmount })
        result.migratedData.crystalsAwarded += crystalAmount
      }

      // 習得済みアイテムからスキル向上
      if (progress.masteredItems?.length || progress.masteredPhonemes?.length || progress.masteredWords?.length) {
        const masteredCount = progress.masteredItems?.length || progress.masteredPhonemes?.length || progress.masteredWords?.length || 0
        if (skill && masteredCount > 0) {
          const skillBonus = Math.min(15, Math.floor(masteredCount / 3))
          this.playerProfileStore.updateSkill(skill, skillBonus)
          result.migratedData.skillsUpdated++
        }
      }
    })
  }

  /**
   * TypingArenaデータのマイグレーション
   */
  private async migrateTypingArenaData(data: any, result: MigrationResult): Promise<void> {
    if (!data) return

    logger.log('⌨️ Migrating TypingArena data...')

    // キャラクターデータ
    if (data.character) {
      const char = data.character
      
      // レベルと経験値
      if (char.level > 1) {
        const expFromLevel = char.level * 150 + (char.totalExp || 0)
        this.playerProfileStore.addExp(expFromLevel)
        result.migratedData.experienceGained += expFromLevel
      }

      // キャラクタータイトルを移行
      if (char.title && char.title !== 'タイピング・ルーキー') {
        this.playerProfileStore.updateProfile({ title: char.title })
      }

      // スキル統計をプレイヤースキルに変換
      if (char.stats) {
        // タイピング能力を語彙スキルに
        if (char.stats.vocabulary > 10) {
          this.playerProfileStore.updateSkill('vocabulary', Math.floor(char.stats.vocabulary * 0.8))
          result.migratedData.skillsUpdated++
        }
        // 正確性を全般的なスキルアップ
        if (char.stats.accuracy > 10) {
          this.playerProfileStore.updateSkill('grammar', Math.floor(char.stats.accuracy * 0.6))
          result.migratedData.skillsUpdated++
        }
      }
    }

    // ストーリーモード進捗
    if (data.storyMode) {
      const story = data.storyMode
      
      // 完了したステージ数からクリスタル付与
      if (story.completedStages?.length) {
        const crystalAmount = Math.floor(story.completedStages.length / 2)
        this.playerProfileStore.addCrystals({ 
          word: crystalAmount,
          grammar: Math.floor(crystalAmount / 2)
        })
        result.migratedData.crystalsAwarded += crystalAmount
      }

      // ボス撃破実績
      if (story.bosses) {
        Object.entries(story.bosses).forEach(([bossId, boss]: [string, any]) => {
          if (boss.defeated) {
            // ボス撃破実績を解除
            this.playerProfileStore.unlockAchievement('grammar-foundation')
            result.migratedData.achievementsUnlocked++
          }
        })
      }
    }

    // 練習モード統計
    if (data.practiceStats) {
      const practice = data.practiceStats
      
      // 総プレイ時間を移行
      if (practice.totalTime) {
        this.playerProfileStore.updateStats({
          totalPlayTime: this.playerProfileStore.profile.stats.totalPlayTime + practice.totalTime
        })
      }

      // WPM（Words Per Minute）を語彙スキルに変換
      if (practice.bestWPM > 30) {
        const skillBonus = Math.min(25, Math.floor(practice.bestWPM / 10))
        this.playerProfileStore.updateSkill('vocabulary', skillBonus)
        result.migratedData.skillsUpdated++
      }

      // レベル進捗からスキル向上
      if (practice.levelProgress) {
        Object.entries(practice.levelProgress).forEach(([level, progress]: [string, any]) => {
          if (progress.completed > 0) {
            const skillBonus = Math.floor(progress.completed / 2)
            this.playerProfileStore.updateSkill('grammar', skillBonus)
            result.migratedData.skillsUpdated++
          }
        })
      }
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * GrammarGalaxyデータのマイグレーション
   */
  private async migrateGrammarGalaxyData(data: any, result: MigrationResult): Promise<void> {
    if (!data) return

    logger.log('🌌 Migrating Grammar Galaxy data...')

    // プレイヤーデータ
    if (data.playerData) {
      const player = data.playerData
      
      // レベルと星の数から経験値計算
      if (player.totalStars > 0) {
        const expFromStars = player.totalStars * 50
        this.playerProfileStore.addExp(expFromStars)
        result.migratedData.experienceGained += expFromStars
      }

      // 完了ゲーム数からスキル向上
      if (player.totalGamesCompleted > 0) {
        const grammarSkillBonus = Math.min(30, player.totalGamesCompleted * 2)
        this.playerProfileStore.updateSkill('grammar', grammarSkillBonus)
        result.migratedData.skillsUpdated++
      }

      // 連続プレイからストリーク実績
      if (player.currentStreak >= 7) {
        this.playerProfileStore.unlockAchievement('streak-7')
        result.migratedData.achievementsUnlocked++
      }
    }

    // 惑星データ
    if (data.planetsData) {
      Object.entries(data.planetsData).forEach(([planetId, planet]: [string, any]) => {
        if (!planet) return

        // 星の数をクリスタルに変換
        if (planet.stars > 0) {
          this.playerProfileStore.addCrystals({ 
            grammar: planet.stars,
            master: Math.floor(planet.stars / 3)
          })
          result.migratedData.crystalsAwarded += planet.stars
        }

        // ゲーム進捗
        if (planet.games) {
          planet.games.forEach((game: any) => {
            if (game.stars > 0) {
              // 高スコアから追加経験値
              const expBonus = game.bestScore ? Math.floor(game.bestScore / 20) : game.stars * 25
              this.playerProfileStore.addExp(expBonus)
              result.migratedData.experienceGained += expBonus
            }

            // 満点ゲームの実績
            if (game.stars === 3) {
              this.playerProfileStore.unlockAchievement('perfect-week')
              result.migratedData.achievementsUnlocked++
            }
          })
        }
      })
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * SightWordデータのマイグレーション
   */
  private async migrateSightWordData(data: any, result: MigrationResult): Promise<void> {
    if (!data) {
      // コンポーネントから直接データを抽出する場合の処理
      const sightWordProgress = localStorage.getItem('sightWordProgress')
      if (sightWordProgress) {
        try {
          data = JSON.parse(sightWordProgress)
        } catch (error) {
          logger.warn('Failed to parse sight word progress:', error)
          return
        }
      } else {
        return
      }
    }

    logger.log('👁️ Migrating SightWord Master data...')

    // レベル別進捗データ
    if (data.levelProgress) {
      Object.entries(data.levelProgress).forEach(([level, progress]: [string, any]) => {
        if (progress.completed > 0) {
          // 完了した単語数から語彙スキル向上
          const vocabBonus = Math.floor(progress.completed / 5)
          this.playerProfileStore.updateSkill('vocabulary', vocabBonus)
          result.migratedData.skillsUpdated++

          // 完了数からクリスタル付与
          const crystalAmount = Math.floor(progress.completed / 10)
          if (crystalAmount > 0) {
            this.playerProfileStore.addCrystals({ word: crystalAmount })
            result.migratedData.crystalsAwarded += crystalAmount
          }
        }

        // 高速認識スコアから追加ボーナス
        if (progress.bestTime && progress.bestTime < 2000) { // 2秒以下
          this.playerProfileStore.updateSkill('vocabulary', 5)
          result.migratedData.skillsUpdated++
        }
      })
    }

    // 総合統計
    if (data.totalWords && data.totalWords > 50) {
      // 大量の単語習得実績
      this.playerProfileStore.unlockAchievement('vocabulary-100')
      result.migratedData.achievementsUnlocked++
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * キャラクターデータのマイグレーション
   */
  private async migrateCharacterData(data: any, result: MigrationResult): Promise<void> {
    if (!data) return

    logger.log('👤 Migrating character data...')

    // アバターとタイトルの移行
    if (data.selectedAvatar) {
      this.playerProfileStore.updateProfile({ avatar: data.selectedAvatar })
    }

    if (data.characterTitle) {
      this.playerProfileStore.updateProfile({ title: data.characterTitle })
    }

    // キャラクター能力値の移行
    if (data.abilities) {
      Object.entries(data.abilities).forEach(([ability, level]: [string, any]) => {
        if (typeof level === 'number' && level > 0) {
          // 能力値をスキルに変換
          const skillMapping: { [key: string]: keyof typeof this.playerProfileStore.profile.skills } = {
            'speaking': 'pronunciation',
            'listening': 'listening',
            'vocabulary': 'vocabulary',
            'grammar': 'grammar',
            'phonics': 'phonics'
          }
          
          const skill = skillMapping[ability]
          if (skill) {
            this.playerProfileStore.updateSkill(skill, Math.min(15, level))
            result.migratedData.skillsUpdated++
          }
        }
      })
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * AI練習データのマイグレーション
   */
  private async migrateAIPracticeData(data: any, result: MigrationResult): Promise<void> {
    if (!data) return

    logger.log('🤖 Migrating AI Practice data...')

    // 会話セッション数から経験値
    if (data.sessionsCompleted && data.sessionsCompleted > 0) {
      const expFromSessions = data.sessionsCompleted * 75
      this.playerProfileStore.addExp(expFromSessions)
      result.migratedData.experienceGained += expFromSessions
    }

    // 会話スキルレベル
    if (data.conversationLevel && data.conversationLevel > 1) {
      this.playerProfileStore.updateSkill('pronunciation', Math.min(20, data.conversationLevel * 3))
      this.playerProfileStore.updateSkill('listening', Math.min(15, data.conversationLevel * 2))
      result.migratedData.skillsUpdated += 2
    }

    // AI練習実績
    if (data.practiceHours && data.practiceHours > 5) {
      this.playerProfileStore.unlockAchievement('phonics-master')
      result.migratedData.achievementsUnlocked++
    }

    result.migratedData.gamesProcessed++
  }

  /**
   * 特殊化されたゲームデータのマイグレーション
   */
  private async migrateSpecializedGameData(legacyData: LegacyGameData, result: MigrationResult): Promise<void> {
    // BeVerbRush専用データ
    if (legacyData.beVerbRushStore) {
      const beVerbData = legacyData.beVerbRushStore
      if (beVerbData.bestScore > 80) {
        this.playerProfileStore.updateSkill('grammar', 10)
        this.playerProfileStore.addCrystals({ grammar: 5 })
        result.migratedData.skillsUpdated++
        result.migratedData.crystalsAwarded += 5
      }
    }

    // 個別のハイスコアデータ
    if (legacyData.wordRushHighScores) {
      const highScores = legacyData.wordRushHighScores
      Object.values(highScores).forEach((score: any) => {
        if (typeof score === 'number' && score > 1000) {
          this.playerProfileStore.addCrystals({ word: Math.floor(score / 500) })
          result.migratedData.crystalsAwarded += Math.floor(score / 500)
        }
      })
    }

    // VR設定の移行
    if (legacyData.vrSettings) {
      this.playerProfileStore.updateVRSettings(legacyData.vrSettings)
    }

    // スペクテーターモード設定
    if (legacyData.spectatorMode?.preferences) {
      // スペクテーター体験を特別実績として付与
      this.playerProfileStore.unlockAchievement('vr-first-connection')
      result.migratedData.achievementsUnlocked++
    }
  }

  /**
   * 実績データのマイグレーション
   */
  private migrateAchievements(achievements: any, result: MigrationResult): void {
    const achievementMapping: { [key: string]: string } = {
      'firstStep': 'phonics-beginner',
      'streakStar': 'streak-7', 
      'perfectPlayer': 'perfect-week',
      'phonicsMaster': 'phonics-master',
      'speedDemon': 'vocabulary-100',
      'comboKing': 'grammar-foundation',
      'wordRushChampion': 'vocabulary-100',
      'speedMaster': 'vr-ready',
      'vocabularyExpert': 'vocabulary-100',
      'vrReady': 'vr-ready'
    }

    Object.entries(achievements).forEach(([oldId, achievement]: [string, any]) => {
      const newId = achievementMapping[oldId]
      if (newId && achievement.earned) {
        this.playerProfileStore.unlockAchievement(newId)
        result.migratedData.achievementsUnlocked++
      }
    })
  }

  /**
   * ゲームIDに対応するクリスタルタイプを取得
   */
  private getGameCrystalType(gameId: string): keyof typeof this.playerProfileStore.profile.crystals {
    if (gameId.includes('phonics') || gameId.includes('sound') || gameId.includes('phoneme')) {
      return 'sound'
    } else if (gameId.includes('word') || gameId.includes('vocabulary')) {
      return 'word'
    } else if (gameId.includes('grammar')) {
      return 'grammar'
    } else if (gameId.includes('rhythm') || gameId.includes('rhyme')) {
      return 'rhythm'
    } else if (gameId.includes('blend')) {
      return 'blend'
    } else if (gameId.includes('pattern')) {
      return 'pattern'
    }
    return 'sound' // デフォルト
  }

  /**
   * VR準備度の再計算
   */
  private recalculateVRReadiness(): void {
    const skills = this.playerProfileStore.profile.skills
    const stats = this.playerProfileStore.profile.stats
    const currentVR = this.playerProfileStore.profile.vrReadiness

    // スキルベースの再計算
    const phonicsStrength = (skills.phonics + skills.blending) / 2
    const vocabGrammarStrength = (skills.vocabulary + skills.grammar) / 2
    const advancedSkills = (skills.listening + skills.rhythm + skills.pronunciation) / 3
    const overallSkill = this.playerProfileStore.averageSkillLevel

    this.playerProfileStore.updateVRReadiness({
      foundation: Math.max(currentVR.foundation, Math.round(phonicsStrength * 0.9)),
      intermediate: Math.max(currentVR.intermediate, Math.round(vocabGrammarStrength * 0.8)),
      advanced: Math.max(currentVR.advanced, Math.round(advancedSkills * 0.7)),
      master: Math.max(currentVR.master, Math.round(overallSkill * 0.6)),
      spatialAwareness: Math.max(currentVR.spatialAwareness, Math.min(100, Math.round(stats.averageAccuracy * 0.9 + 25))),
      interactionSpeed: Math.max(currentVR.interactionSpeed, Math.min(100, Math.round((stats.gamesPlayed / 8) * 5)))
    })
  }

  /**
   * マイグレーション状態の保存
   */
  private saveMigrationStatus(): void {
    localStorage.setItem(MIGRATION_STATUS_KEY, JSON.stringify(this.migrationStatus))
  }

  /**
   * バックアップからの復元
   */
  static async restoreFromBackup(): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(BACKUP_KEY)
      if (!backupData) {
        logger.error('No backup found')
        return false
      }

      const backup = JSON.parse(backupData)
      
      // バックアップデータを復元
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      })

      logger.log('✅ Data restored from backup successfully')
      return true
    } catch (error) {
      logger.error('Failed to restore from backup:', error)
      return false
    }
  }

  /**
   * マイグレーション状態の確認
   */
  static getMigrationStatus(): MigrationStatus | null {
    try {
      const status = localStorage.getItem(MIGRATION_STATUS_KEY)
      return status ? JSON.parse(status) : null
    } catch (error) {
      logger.error('Failed to get migration status:', error)
      return null
    }
  }

  /**
   * マイグレーション完了チェック
   */
  static isMigrationCompleted(): boolean {
    const status = DataMigrationSystem.getMigrationStatus()
    return status?.completed === true && status?.version === MIGRATION_VERSION
  }

  /**
   * マイグレーションのリセット（開発用）
   */
  static resetMigration(): void {
    localStorage.removeItem(MIGRATION_STATUS_KEY)
    logger.log('🔄 Migration status reset')
  }

  /**
   * テストデータの生成
   */
  static generateTestData(): void {
    const testData = {
      movwiseGameData: {
        playerData: {
          name: 'テストプレイヤー',
          level: 5,
          cosmicEnergy: 2500,
          soundGems: 150,
          avatar: '🚀',
          title: 'テスト・ヒーロー',
          navigationDays: 12
        },
        gameProgress: {
          wordRush: {
            bestScore: 1500,
            progress: 85,
            masteredWords: ['apple', 'book', 'cat', 'dog', 'elephant']
          },
          pureSoundLab: {
            bestScore: 950,
            progress: 72,
            masteredPhonemes: ['a', 'b', 'c', 'd']
          },
          grammarColorCode: {
            bestScore: 800,
            progress: 60,
            masteredConcepts: ['be-verb', 'present-tense']
          }
        },
        achievements: {
          firstStep: { earned: true, earnedDate: '2024-01-01T00:00:00.000Z' },
          perfectPlayer: { earned: true, earnedDate: '2024-01-15T00:00:00.000Z' }
        }
      },
      typingArena: {
        character: {
          name: 'テストタイパー',
          level: 8,
          totalExp: 3200,
          title: 'スピード・マスター',
          stats: {
            vocabulary: 25,
            accuracy: 30,
            speed: 35
          }
        },
        storyMode: {
          completedStages: [1, 2, 3, 4, 5, 6],
          bosses: {
            wordEater: { defeated: true }
          }
        },
        practiceStats: {
          totalTime: 7200,
          bestWPM: 65,
          levelProgress: {
            eiken5: { completed: 15, bestScore: 450 },
            eiken4: { completed: 10, bestScore: 380 }
          }
        }
      },
      grammarGalaxy: {
        playerData: {
          totalStars: 25,
          totalGamesCompleted: 18,
          currentStreak: 9
        },
        planetsData: {
          beVerb: {
            stars: 12,
            games: [
              { stars: 3, bestScore: 95 },
              { stars: 2, bestScore: 78 }
            ]
          }
        }
      }
    }

    // テストデータを保存
    Object.entries(testData).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })

    logger.log('🧪 Test data generated successfully')
  }
}

export default DataMigrationSystem