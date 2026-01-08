import { usePlayerProfileStore } from '@/stores/playerProfile'
import { useGameStore } from '@/stores/gameStore'
import logger from '@/utils/logger'

/**
 * 既存のMovWISEデータをVR対応プレイヤープロフィールにマイグレーション
 */
export class ProfileMigration {
  private playerProfileStore = usePlayerProfileStore()
  private gameStore = useGameStore()

  /**
   * マイグレーション実行
   */
  async migrateFromLegacyData(): Promise<boolean> {
    try {
      logger.log('🔄 Starting profile migration to VR-ready system...')
      
      // 既存のローカルストレージデータを取得
      const legacyData = this.loadLegacyData()
      if (!legacyData) {
        logger.log('ℹ️ No legacy data found, using fresh profile')
        return true
      }

      // ゲームストアのデータをマイグレーション
      await this.migrateGameStoreData(legacyData)
      
      // 個別ゲームの進捗データをマイグレーション
      this.migrateIndividualGameProgress(legacyData)
      
      // 実績データのマイグレーション
      this.migrateAchievements(legacyData)
      
      // 統計データのマイグレーション
      this.migrateStatistics(legacyData)
      
      // VR準備度の初期計算
      this.calculateInitialVRReadiness()
      
      // マイグレーション完了フラグを設定
      localStorage.setItem('movwise-migration-completed', 'true')
      localStorage.setItem('movwise-migration-date', new Date().toISOString())
      
      logger.log('✓ Profile migration completed successfully')
      return true
    } catch (error) {
      logger.error('❌ Profile migration failed:', error)
      return false
    }
  }

  /**
   * 既存データの読み込み
   */
  private loadLegacyData(): any {
    try {
      const gameStoreData = localStorage.getItem('movwiseGameData')
      return gameStoreData ? JSON.parse(gameStoreData) : null
    } catch (error) {
      logger.error('Failed to load legacy data:', error)
      return null
    }
  }

  /**
   * ゲームストアデータのマイグレーション
   */
  private async migrateGameStoreData(legacyData: any): Promise<void> {
    if (!legacyData.playerData) return

    const playerData = legacyData.playerData
    
    // 基本プレイヤー情報の移行
    this.playerProfileStore.updateProfile({
      name: playerData.name || 'スペース・ルーキー',
      level: playerData.captainLevel || playerData.level || 1,
      totalExp: playerData.cosmicEnergy || playerData.exp || 0,
      avatar: playerData.avatar || '🚀',
      title: playerData.title || 'スペース・ルーキー',
      joinDate: playerData.joinDate || new Date().toISOString(),
      lastLoginDate: playerData.lastLoginDate || new Date().toISOString(),
      loginStreak: playerData.navigationDays || playerData.streak || 1
    })

    // クリスタル変換（サウンドジェム → クリスタル）
    if (playerData.soundGems) {
      this.playerProfileStore.addCrystals({
        sound: playerData.soundGems,
        word: Math.floor(playerData.soundGems * 0.8),
        grammar: Math.floor(playerData.soundGems * 0.6)
      })
    }

    // 探査ポイントをクリスタルに変換
    if (playerData.explorationPoints) {
      this.playerProfileStore.addCrystals({
        master: Math.floor(playerData.explorationPoints / 100)
      })
    }
  }

  /**
   * 個別ゲームの進捗データマイグレーション
   */
  private migrateIndividualGameProgress(legacyData: any): void {
    if (!legacyData.gameProgress) return

    const gameProgress = legacyData.gameProgress
    
    // ゲームカテゴリマッピング
    const gameToSkillMap: Record<string, keyof typeof this.playerProfileStore.profile.skills> = {
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

    // 各ゲームの進捗からスキルレベルを計算
    Object.entries(gameProgress).forEach(([gameId, progress]: [string, any]) => {
      const skill = gameToSkillMap[gameId]
      if (skill && progress?.progress) {
        const skillIncrease = Math.round(progress.progress * 0.3) // 進捗の30%をスキルレベルに
        this.playerProfileStore.updateSkill(skill, skillIncrease)
      }

      // マスター済みアイテム数をクリスタルに変換
      if (progress?.masteredItems?.length) {
        const crystalAmount = Math.floor(progress.masteredItems.length / 5)
        if (crystalAmount > 0) {
          this.playerProfileStore.addCrystals({
            [this.getGameCrystalType(gameId)]: crystalAmount
          })
        }
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
   * 実績データのマイグレーション
   */
  private migrateAchievements(legacyData: any): void {
    if (!legacyData.achievements) return

    // 旧実績IDと新実績IDのマッピング
    const achievementMapping: Record<string, string> = {
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

    Object.entries(legacyData.achievements).forEach(([oldId, achievement]: [string, any]) => {
      const newId = achievementMapping[oldId]
      if (newId && achievement.earned) {
        this.playerProfileStore.unlockAchievement(newId)
      }
    })
  }

  /**
   * 統計データのマイグレーション
   */
  private migrateStatistics(legacyData: any): void {
    if (!legacyData.gameStats) return

    const stats = legacyData.gameStats
    
    this.playerProfileStore.updateStats({
      totalPlayTime: stats.totalPlayTime || 0,
      gamesPlayed: stats.totalGamesPlayed || 0,
      totalCorrectAnswers: stats.totalCorrectAnswers || 0,
      totalAttempts: stats.totalAttempts || 0,
      bestStreak: stats.wordRush?.bestStreak || 0
    })

    // Word Rush専用統計の移行
    if (stats.wordRush) {
      const wordRushStats = stats.wordRush
      if (wordRushStats.spatialReadiness) {
        // Spatial.io準備度をVR準備度の基礎値として使用
        this.playerProfileStore.updateVRReadiness({
          foundation: Math.round(wordRushStats.spatialReadiness * 0.8),
          spatialAwareness: wordRushStats.spatialReadiness
        })
      }
    }

    // VR関連統計の初期化
    if (stats.vrReadinessScore) {
      this.playerProfileStore.updateVRReadiness({
        foundation: Math.round(stats.vrReadinessScore * 0.7),
        intermediate: Math.round(stats.vrReadinessScore * 0.5),
        advanced: Math.round(stats.vrReadinessScore * 0.3)
      })
    }
  }

  /**
   * VR準備度の初期計算
   */
  private calculateInitialVRReadiness(): void {
    const skills = this.playerProfileStore.profile.skills
    const stats = this.playerProfileStore.profile.stats
    
    // スキルベースのVR準備度計算
    const phonicsAvg = (skills.phonics + skills.blending) / 2
    const vocabularyStrength = skills.vocabulary
    const grammarUnderstanding = skills.grammar
    const overallSkill = this.playerProfileStore.averageSkillLevel
    
    this.playerProfileStore.updateVRReadiness({
      foundation: Math.max(this.playerProfileStore.profile.vrReadiness.foundation, Math.round(phonicsAvg * 0.8)),
      intermediate: Math.max(this.playerProfileStore.profile.vrReadiness.intermediate, Math.round((vocabularyStrength + grammarUnderstanding) / 2 * 0.7)),
      advanced: Math.max(this.playerProfileStore.profile.vrReadiness.advanced, Math.round(overallSkill * 0.6)),
      master: Math.max(this.playerProfileStore.profile.vrReadiness.master, Math.round(overallSkill * 0.4)),
      
      // 統計ベースの計算
      spatialAwareness: Math.min(100, Math.max(
        this.playerProfileStore.profile.vrReadiness.spatialAwareness,
        Math.round(stats.averageAccuracy * 0.8 + 20)
      )),
      
      interactionSpeed: Math.min(100, Math.max(
        this.playerProfileStore.profile.vrReadiness.interactionSpeed,
        Math.round((stats.gamesPlayed / 10) * 5)
      ))
    })
  }

  /**
   * マイグレーション状態の確認
   */
  static isMigrationCompleted(): boolean {
    return localStorage.getItem('movwise-migration-completed') === 'true'
  }

  /**
   * マイグレーションの強制実行
   */
  static async forceMigration(): Promise<boolean> {
    localStorage.removeItem('movwise-migration-completed')
    const migration = new ProfileMigration()
    return await migration.migrateFromLegacyData()
  }

  /**
   * 開発用: データリセット
   */
  static resetMigrationFlag(): void {
    localStorage.removeItem('movwise-migration-completed')
    localStorage.removeItem('movwise-migration-date')
  }
}

/**
 * アプリ起動時の自動マイグレーション実行
 */
export const initializeProfileMigration = async (): Promise<void> => {
  if (!ProfileMigration.isMigrationCompleted()) {
    logger.log('🔄 Initializing automatic profile migration...')
    const migration = new ProfileMigration()
    const success = await migration.migrateFromLegacyData()
    
    if (success) {
      logger.log('✅ Profile migration completed successfully')
    } else {
      logger.error('❌ Profile migration failed, using default profile')
    }
  } else {
    logger.log('ℹ️ Profile migration already completed')
  }
}

export default ProfileMigration