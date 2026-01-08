import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// VR対応型定義
interface Crystal {
  sound: number
  word: number
  grammar: number
  rhythm: number
  blend: number
  pattern: number
  master: number
}

interface Skill {
  phonics: number
  vocabulary: number
  grammar: number
  pronunciation: number
  listening: number
  rhythm: number
  blending: number
}

interface VRReadiness {
  foundation: number      // 基礎VRスキル (0-100)
  intermediate: number    // 中級VRスキル (0-100)
  advanced: number       // 上級VRスキル (0-100)
  master: number         // マスターVRスキル (0-100)
  spatialAwareness: number     // 空間認識能力
  motionTolerance: number      // モーション耐性
  interactionSpeed: number     // インタラクション速度
  immersionLevel: number       // 没入度レベル
}

interface VirtualAcademyProfile {
  userId: string | null
  syncStatus: 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSyncDate: string | null
  academyLevel: number
  academyPoints: number
  vrDeviceType: string | null
  preferredLearningMode: 'immersive' | 'mixed' | 'screen'
}

interface Companion {
  id: string
  name: string
  type: 'guide' | 'assistant' | 'mentor' | 'vr-companion'
  level: number
  unlockedAt: string
  abilities: string[]
  vrCapable: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  category: 'phonics' | 'vocabulary' | 'grammar' | 'vr' | 'general' | 'special'
  earned: boolean
  earnedDate: string | null
  progress: number
  maxProgress: number
  vrExclusive: boolean
  rewards: {
    exp?: number
    crystals?: Partial<Crystal>
    title?: string
    companion?: string
    vrAccessLevel?: number
  }
}

interface PlayerProfile {
  // 基本情報
  name: string
  level: number
  totalExp: number
  currentPlanet: string
  avatar: string
  title: string
  joinDate: string
  lastLoginDate: string
  loginStreak: number
  
  // クリスタル収集状況
  crystals: Crystal
  
  // スキルレベル
  skills: Skill
  
  // VR準備度スコア
  vrReadiness: VRReadiness
  
  // バーチャルアカデミー連携情報
  virtualAcademyProfile: VirtualAcademyProfile
  
  // 仲間システム
  companions: Companion[]
  activeCompanion: string | null
  
  // 実績システム
  achievements: Achievement[]
  
  // 統計データ
  stats: {
    totalPlayTime: number
    vrPlayTime: number
    gamesPlayed: number
    vrGamesPlayed: number
    perfectScores: number
    totalCorrectAnswers: number
    totalAttempts: number
    averageAccuracy: number
    bestStreak: number
    vrSessionsCompleted: number
    longestVRSession: number
  }
  
  // VR設定
  vrSettings: {
    comfortMode: boolean
    teleportMovement: boolean
    smoothLocomotion: boolean
    hapticFeedback: boolean
    voiceCommands: boolean
    subtitles: boolean
    fieldOfView: number
    ipd: number // 瞳孔間距離
  }
}

export const usePlayerProfileStore = defineStore('playerProfile', () => {
  // 状態
  const profile = ref<PlayerProfile>({
    name: 'スペース・ルーキー',
    level: 1,
    totalExp: 0,
    currentPlanet: 'soundPlanet',
    avatar: '🚀',
    title: 'スペース・ルーキー',
    joinDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    loginStreak: 1,
    
    crystals: {
      sound: 0,
      word: 0,
      grammar: 0,
      rhythm: 0,
      blend: 0,
      pattern: 0,
      master: 0
    },
    
    skills: {
      phonics: 0,
      vocabulary: 0,
      grammar: 0,
      pronunciation: 0,
      listening: 0,
      rhythm: 0,
      blending: 0
    },
    
    vrReadiness: {
      foundation: 0,
      intermediate: 0,
      advanced: 0,
      master: 0,
      spatialAwareness: 0,
      motionTolerance: 50,
      interactionSpeed: 0,
      immersionLevel: 0
    },
    
    virtualAcademyProfile: {
      userId: null,
      syncStatus: 'disconnected',
      lastSyncDate: null,
      academyLevel: 0,
      academyPoints: 0,
      vrDeviceType: null,
      preferredLearningMode: 'screen'
    },
    
    companions: [],
    activeCompanion: null,
    
    achievements: [],
    
    stats: {
      totalPlayTime: 0,
      vrPlayTime: 0,
      gamesPlayed: 0,
      vrGamesPlayed: 0,
      perfectScores: 0,
      totalCorrectAnswers: 0,
      totalAttempts: 0,
      averageAccuracy: 0,
      bestStreak: 0,
      vrSessionsCompleted: 0,
      longestVRSession: 0
    },
    
    vrSettings: {
      comfortMode: true,
      teleportMovement: true,
      smoothLocomotion: false,
      hapticFeedback: true,
      voiceCommands: true,
      subtitles: true,
      fieldOfView: 90,
      ipd: 63
    }
  })

  // 計算プロパティ
  const totalCrystals = computed(() => 
    Object.values(profile.value.crystals).reduce((sum, count) => sum + count, 0)
  )

  const averageSkillLevel = computed(() => {
    const skills = Object.values(profile.value.skills)
    return skills.length > 0 ? Math.round(skills.reduce((sum, level) => sum + level, 0) / skills.length) : 0
  })

  const overallVRReadiness = computed(() => {
    const vr = profile.value.vrReadiness
    return Math.round(
      (vr.foundation * 0.4 + 
       vr.intermediate * 0.3 + 
       vr.advanced * 0.2 + 
       vr.master * 0.1) * 
      (vr.spatialAwareness / 100) * 
      (vr.motionTolerance / 100)
    )
  })

  const vrAccessLevel = computed(() => {
    const readiness = overallVRReadiness.value
    if (readiness >= 80) return 'master'
    if (readiness >= 60) return 'advanced'
    if (readiness >= 40) return 'intermediate'
    if (readiness >= 20) return 'foundation'
    return 'preparing'
  })

  const nextLevelExp = computed(() => profile.value.level * 1000)
  const currentLevelProgress = computed(() => (profile.value.totalExp % 1000) / 10)

  const unlockedPlanets = computed(() => {
    const planets = ['soundPlanet'] // 最初の惑星は常に解放
    
    if (profile.value.skills.phonics >= 20) planets.push('wordPlanet')
    if (profile.value.skills.vocabulary >= 20) planets.push('grammarPlanet')
    if (profile.value.skills.grammar >= 20) planets.push('rhythmPlanet')
    if (averageSkillLevel.value >= 30) planets.push('blendPlanet')
    if (averageSkillLevel.value >= 50) planets.push('patternPlanet')
    if (averageSkillLevel.value >= 70) planets.push('masterPlanet')
    
    // VR専用惑星
    if (overallVRReadiness.value >= 30) planets.push('vrTrainingStation')
    if (overallVRReadiness.value >= 60) planets.push('vrAcademy')
    
    return planets
  })

  const earnedAchievements = computed(() => 
    profile.value.achievements.filter(a => a.earned)
  )

  const isVRReady = computed(() => overallVRReadiness.value >= 40)

  const academyConnectionStatus = computed(() => 
    profile.value.virtualAcademyProfile.syncStatus
  )

  // メソッド
  const updateProfile = (updates: Partial<PlayerProfile>) => {
    profile.value = { ...profile.value, ...updates }
  }

  const addExp = (amount: number, isVRActivity: boolean = false) => {
    // VRアクティビティは1.5倍の経験値
    const finalAmount = isVRActivity ? Math.round(amount * 1.5) : amount
    profile.value.totalExp += finalAmount
    
    // レベルアップチェック
    while (profile.value.totalExp >= nextLevelExp.value) {
      profile.value.level++
      
      // レベルアップ報酬
      const levelRewards = getLevelRewards(profile.value.level)
      if (levelRewards.crystals) {
        addCrystals(levelRewards.crystals)
      }
      if (levelRewards.title) {
        profile.value.title = levelRewards.title
      }
      if (levelRewards.companion) {
        unlockCompanion(levelRewards.companion)
      }
      if (levelRewards.vrAccessLevel) {
        profile.value.virtualAcademyProfile.academyLevel = Math.max(
          profile.value.virtualAcademyProfile.academyLevel,
          levelRewards.vrAccessLevel
        )
      }
    }
  }

  const addCrystals = (crystals: Partial<Crystal>) => {
    Object.entries(crystals).forEach(([type, amount]) => {
      if (type in profile.value.crystals) {
        profile.value.crystals[type as keyof Crystal] += amount as number
      }
    })
  }

  const updateSkill = (skill: keyof Skill, progress: number) => {
    profile.value.skills[skill] = Math.min(100, Math.max(0, profile.value.skills[skill] + progress))
    
    // スキル更新時にVR準備度も更新
    updateVRReadinessFromSkills()
  }

  const updateVRReadiness = (updates: Partial<VRReadiness>) => {
    profile.value.vrReadiness = { ...profile.value.vrReadiness, ...updates }
  }

  const updateVRReadinessFromSkills = () => {
    const skills = profile.value.skills
    
    // 基礎VRスキルは言語基礎スキルから計算
    profile.value.vrReadiness.foundation = Math.round(
      (skills.phonics + skills.vocabulary) / 2
    )
    
    // 中級VRスキルは文法と発音から
    profile.value.vrReadiness.intermediate = Math.round(
      (skills.grammar + skills.pronunciation) / 2
    )
    
    // 上級VRスキルはリスニングとリズムから
    profile.value.vrReadiness.advanced = Math.round(
      (skills.listening + skills.rhythm) / 2
    )
    
    // マスターVRスキルは全体の習熟度から
    profile.value.vrReadiness.master = Math.round(
      averageSkillLevel.value * 0.8
    )
    
    // 空間認識能力はゲーム成績から
    profile.value.vrReadiness.spatialAwareness = Math.min(100, 
      Math.round(profile.value.stats.averageAccuracy * 0.8 + 20)
    )
    
    // インタラクション速度は反応時間から
    profile.value.vrReadiness.interactionSpeed = Math.min(100,
      Math.round((profile.value.stats.gamesPlayed / 10) * 5)
    )
  }

  const updateVirtualAcademyProfile = (updates: Partial<VirtualAcademyProfile>) => {
    profile.value.virtualAcademyProfile = { 
      ...profile.value.virtualAcademyProfile, 
      ...updates,
      lastSyncDate: new Date().toISOString()
    }
  }

  const connectToVirtualAcademy = async (userId: string, vrDeviceType: string) => {
    profile.value.virtualAcademyProfile = {
      ...profile.value.virtualAcademyProfile,
      userId,
      vrDeviceType,
      syncStatus: 'syncing'
    }
    
    // VR接続実績を解除
    unlockAchievement('vr-first-connection')
    
    return true
  }

  const unlockCompanion = (companionId: string) => {
    const companion = getCompanionData(companionId)
    if (companion && !profile.value.companions.find(c => c.id === companionId)) {
      profile.value.companions.push({
        ...companion,
        unlockedAt: new Date().toISOString()
      })
    }
  }

  const setActiveCompanion = (companionId: string | null) => {
    if (!companionId || profile.value.companions.find(c => c.id === companionId)) {
      profile.value.activeCompanion = companionId
    }
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = profile.value.achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.earned) {
      achievement.earned = true
      achievement.earnedDate = new Date().toISOString()
      
      // 実績報酬を付与
      if (achievement.rewards.exp) {
        addExp(achievement.rewards.exp)
      }
      if (achievement.rewards.crystals) {
        addCrystals(achievement.rewards.crystals)
      }
      if (achievement.rewards.title) {
        profile.value.title = achievement.rewards.title
      }
      if (achievement.rewards.companion) {
        unlockCompanion(achievement.rewards.companion)
      }
      if (achievement.rewards.vrAccessLevel) {
        profile.value.virtualAcademyProfile.academyLevel = Math.max(
          profile.value.virtualAcademyProfile.academyLevel,
          achievement.rewards.vrAccessLevel
        )
      }
    }
  }

  const updateAchievementProgress = (achievementId: string, progress: number) => {
    const achievement = profile.value.achievements.find(a => a.id === achievementId)
    if (achievement && !achievement.earned) {
      achievement.progress = Math.min(achievement.maxProgress, progress)
      
      // 達成チェック
      if (achievement.progress >= achievement.maxProgress) {
        unlockAchievement(achievementId)
      }
    }
  }

  const updateStats = (stats: Partial<typeof profile.value.stats>, isVRSession: boolean = false) => {
    profile.value.stats = { ...profile.value.stats, ...stats }
    
    // VRセッション統計の更新
    if (isVRSession) {
      profile.value.stats.vrGamesPlayed++
      profile.value.stats.vrSessionsCompleted++
      
      // VRセッション時間の記録
      if (stats.totalPlayTime) {
        profile.value.stats.vrPlayTime += stats.totalPlayTime
        profile.value.stats.longestVRSession = Math.max(
          profile.value.stats.longestVRSession,
          stats.totalPlayTime
        )
      }
    }
    
    // 正解率の再計算
    if (profile.value.stats.totalAttempts > 0) {
      profile.value.stats.averageAccuracy = Math.round(
        (profile.value.stats.totalCorrectAnswers / profile.value.stats.totalAttempts) * 100
      )
    }
    
    // VR準備度の更新
    updateVRReadinessFromStats()
  }

  const updateVRReadinessFromStats = () => {
    // 没入度レベルはVRプレイ時間から計算
    const vrHours = profile.value.stats.vrPlayTime / 3600
    profile.value.vrReadiness.immersionLevel = Math.min(100, Math.round(vrHours * 10))
    
    // モーション耐性は長時間VRセッションから
    const longestSessionMinutes = profile.value.stats.longestVRSession / 60
    if (longestSessionMinutes > 30) {
      profile.value.vrReadiness.motionTolerance = Math.min(100, 
        profile.value.vrReadiness.motionTolerance + 5
      )
    }
  }

  const updateLoginStreak = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastLogin = new Date(profile.value.lastLoginDate).toISOString().split('T')[0]
    
    if (lastLogin === today) {
      return // 今日既にログイン済み
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    if (lastLogin === yesterdayStr) {
      profile.value.loginStreak++
    } else {
      profile.value.loginStreak = 1
    }
    
    profile.value.lastLoginDate = new Date().toISOString()
    
    // 連続ログイン実績のチェック
    checkStreakAchievements()
  }

  const updateVRSettings = (settings: Partial<typeof profile.value.vrSettings>) => {
    profile.value.vrSettings = { ...profile.value.vrSettings, ...settings }
  }

  // ヘルパー関数
  const getLevelRewards = (level: number) => {
    const rewards: any = {}
    
    // 5レベルごとにクリスタル報酬
    if (level % 5 === 0) {
      rewards.crystals = { sound: 10, word: 10 }
    }
    
    // 10レベルごとに特別な称号
    const titles: Record<number, string> = {
      10: 'ギャラクシー・レンジャー',
      20: 'コズミック・マスター',
      30: 'ステラー・ヒーロー',
      40: 'ユニバース・レジェンド',
      50: 'インフィニティ・マスター',
      60: 'VRパイオニア',
      70: 'バーチャル・マスター',
      80: 'メタバース・レジェンド'
    }
    
    if (titles[level]) {
      rewards.title = titles[level]
    }
    
    // 特定レベルで仲間を解放
    const companionUnlocks: Record<number, string> = {
      5: 'echo-guide',
      15: 'phonics-mentor',
      25: 'grammar-wizard',
      35: 'vocabulary-sage',
      45: 'vr-navigator',
      55: 'hologram-tutor'
    }
    
    if (companionUnlocks[level]) {
      rewards.companion = companionUnlocks[level]
    }
    
    // VRアクセスレベル
    const vrAccessLevels: Record<number, number> = {
      20: 1,
      40: 2,
      60: 3,
      80: 4
    }
    
    if (vrAccessLevels[level]) {
      rewards.vrAccessLevel = vrAccessLevels[level]
    }
    
    return rewards
  }

  const getCompanionData = (companionId: string): Omit<Companion, 'unlockedAt'> | null => {
    const companions: Record<string, Omit<Companion, 'unlockedAt'>> = {
      'echo-guide': {
        id: 'echo-guide',
        name: 'エコー',
        type: 'guide',
        level: 1,
        abilities: ['ヒント表示', '発音サポート'],
        vrCapable: false
      },
      'phonics-mentor': {
        id: 'phonics-mentor',
        name: 'フォニー',
        type: 'mentor',
        level: 1,
        abilities: ['音素分析', 'ブレンディング支援'],
        vrCapable: false
      },
      'grammar-wizard': {
        id: 'grammar-wizard',
        name: 'グラマー',
        type: 'mentor',
        level: 1,
        abilities: ['文法解説', 'パターン認識'],
        vrCapable: false
      },
      'vocabulary-sage': {
        id: 'vocabulary-sage',
        name: 'ボキャ',
        type: 'assistant',
        level: 1,
        abilities: ['単語暗記支援', '語彙拡張'],
        vrCapable: false
      },
      'vr-navigator': {
        id: 'vr-navigator',
        name: 'ナビ',
        type: 'vr-companion',
        level: 1,
        abilities: ['VR空間案内', '3Dインタラクション支援', 'モーション最適化'],
        vrCapable: true
      },
      'hologram-tutor': {
        id: 'hologram-tutor',
        name: 'ホロ先生',
        type: 'vr-companion',
        level: 1,
        abilities: ['ホログラム授業', 'AR学習支援', '空間記憶強化'],
        vrCapable: true
      }
    }
    
    return companions[companionId] || null
  }

  const checkStreakAchievements = () => {
    const streakAchievements = [
      { id: 'streak-3', days: 3, name: '3日連続ログイン' },
      { id: 'streak-7', days: 7, name: '1週間連続ログイン' },
      { id: 'streak-30', days: 30, name: '1ヶ月連続ログイン' },
      { id: 'streak-100', days: 100, name: '100日連続ログイン' }
    ]
    
    streakAchievements.forEach(({ id, days }) => {
      if (profile.value.loginStreak >= days) {
        updateAchievementProgress(id, days)
      }
    })
  }

  // 初期実績データの設定
  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      // 連続ログイン実績
      {
        id: 'streak-3',
        name: '3日連続ログイン',
        description: '3日連続でログインする',
        category: 'general',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 3,
        vrExclusive: false,
        rewards: { exp: 100, crystals: { sound: 5 } }
      },
      {
        id: 'streak-7',
        name: '1週間連続ログイン',
        description: '7日連続でログインする',
        category: 'general',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 7,
        vrExclusive: false,
        rewards: { exp: 300, crystals: { sound: 10, word: 10 } }
      },
      // フォニックス実績
      {
        id: 'phonics-beginner',
        name: 'フォニックス初心者',
        description: 'フォニックススキルを10まで上げる',
        category: 'phonics',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 10,
        vrExclusive: false,
        rewards: { exp: 200, crystals: { sound: 15 } }
      },
      {
        id: 'phonics-master',
        name: 'フォニックスマスター',
        description: 'フォニックススキルを50まで上げる',
        category: 'phonics',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 50,
        vrExclusive: false,
        rewards: { exp: 1000, title: 'サウンドマスター', crystals: { sound: 50 } }
      },
      // VR実績
      {
        id: 'vr-first-connection',
        name: 'VRデビュー',
        description: 'バーチャルアカデミーに初めて接続する',
        category: 'vr',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 1,
        vrExclusive: true,
        rewards: { exp: 500, crystals: { master: 20 }, companion: 'vr-navigator' }
      },
      {
        id: 'vr-hour-milestone',
        name: 'VR1時間プレイ',
        description: 'VRで合計1時間プレイする',
        category: 'vr',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 3600,
        vrExclusive: true,
        rewards: { exp: 800, crystals: { master: 30 }, vrAccessLevel: 2 }
      },
      {
        id: 'vr-motion-master',
        name: 'モーションマスター',
        description: 'モーション耐性を80以上にする',
        category: 'vr',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 80,
        vrExclusive: true,
        rewards: { exp: 1200, title: 'VRマスター', companion: 'hologram-tutor' }
      },
      // 語彙実績
      {
        id: 'vocabulary-100',
        name: '100単語マスター',
        description: '100個の単語を習得する',
        category: 'vocabulary',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 100,
        vrExclusive: false,
        rewards: { exp: 500, crystals: { word: 30 } }
      },
      // 文法実績
      {
        id: 'grammar-foundation',
        name: '文法の基礎',
        description: '文法スキルを20まで上げる',
        category: 'grammar',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 20,
        vrExclusive: false,
        rewards: { exp: 400, crystals: { grammar: 20 } }
      },
      // 特別実績
      {
        id: 'perfect-week',
        name: 'パーフェクトウィーク',
        description: '1週間で7回満点を取る',
        category: 'special',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 7,
        vrExclusive: false,
        rewards: { exp: 800, crystals: { master: 10 } }
      },
      {
        id: 'vr-ready',
        name: 'VR準備完了',
        description: 'VR準備度を40以上にする',
        category: 'vr',
        earned: false,
        earnedDate: null,
        progress: 0,
        maxProgress: 40,
        vrExclusive: false,
        rewards: { exp: 1000, crystals: { master: 25 }, vrAccessLevel: 1 }
      }
    ]
    
    profile.value.achievements = defaultAchievements
  }

  // 既存データからのマイグレーション
  const migrateFromGameStore = (gameStoreData: any) => {
    if (!gameStoreData) return
    
    // プレイヤー基本情報の移行
    if (gameStoreData.playerData) {
      profile.value.name = gameStoreData.playerData.name || profile.value.name
      profile.value.level = gameStoreData.playerData.captainLevel || gameStoreData.playerData.level || 1
      profile.value.totalExp = gameStoreData.playerData.cosmicEnergy || gameStoreData.playerData.exp || 0
      profile.value.avatar = gameStoreData.playerData.avatar || profile.value.avatar
      profile.value.title = gameStoreData.playerData.title || profile.value.title
      profile.value.loginStreak = gameStoreData.playerData.navigationDays || gameStoreData.playerData.streak || 1
      
      // サウンドジェムをクリスタルに変換
      if (gameStoreData.playerData.soundGems) {
        profile.value.crystals.sound = gameStoreData.playerData.soundGems
      }
    }
    
    // ゲーム進捗からスキルレベルを計算
    if (gameStoreData.gameProgress) {
      const phonicsGames = ['pureSoundLab', 'singlePhoneme', 'soundHunter', 'phonicsTrainingHub']
      const vocabularyGames = ['wordRush', 'magicCardBattle', 'spellRacing']
      const grammarGames = ['grammarColorCode', 'beVerbRush', 'patternHunter']
      
      // 各カテゴリの平均進捗を計算
      const calculateAverageProgress = (gameIds: string[]) => {
        const progresses = gameIds
          .map(id => gameStoreData.gameProgress[id]?.progress || 0)
          .filter(p => p > 0)
        return progresses.length > 0 ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) : 0
      }
      
      profile.value.skills.phonics = calculateAverageProgress(phonicsGames)
      profile.value.skills.vocabulary = calculateAverageProgress(vocabularyGames)
      profile.value.skills.grammar = calculateAverageProgress(grammarGames)
    }
    
    // 統計データの移行
    if (gameStoreData.gameStats) {
      profile.value.stats.totalPlayTime = gameStoreData.gameStats.totalPlayTime || 0
      profile.value.stats.gamesPlayed = gameStoreData.gameStats.totalGamesPlayed || 0
      profile.value.stats.totalCorrectAnswers = gameStoreData.gameStats.totalCorrectAnswers || 0
      profile.value.stats.totalAttempts = gameStoreData.gameStats.totalAttempts || 0
      
      if (gameStoreData.gameStats.wordRush) {
        profile.value.stats.bestStreak = gameStoreData.gameStats.wordRush.bestStreak || 0
      }
      
      // VR準備度の初期計算
      if (gameStoreData.gameStats.wordRush?.spatialReadiness) {
        profile.value.vrReadiness.foundation = gameStoreData.gameStats.wordRush.spatialReadiness
      }
      
      if (gameStoreData.gameStats.vrReadinessScore) {
        profile.value.vrReadiness.foundation = Math.round(gameStoreData.gameStats.vrReadinessScore * 0.7)
        profile.value.vrReadiness.intermediate = Math.round(gameStoreData.gameStats.vrReadinessScore * 0.5)
      }
    }
    
    // 実績の移行
    if (gameStoreData.achievements) {
      Object.entries(gameStoreData.achievements).forEach(([key, value]: [string, any]) => {
        if (value.earned) {
          const achievementMap: Record<string, string> = {
            'firstStep': 'phonics-beginner',
            'streakStar': 'streak-7',
            'perfectPlayer': 'perfect-week',
            'phonicsMaster': 'phonics-master',
            'vrReady': 'vr-ready'
          }
          
          const achievementId = achievementMap[key]
          if (achievementId) {
            const achievement = profile.value.achievements.find(a => a.id === achievementId)
            if (achievement) {
              achievement.earned = true
              achievement.earnedDate = value.earnedDate || new Date().toISOString()
              achievement.progress = achievement.maxProgress
            }
          }
        }
      })
    }
    
    // スキルベースのVR準備度計算
    updateVRReadinessFromSkills()
  }

  // 初期化
  if (profile.value.achievements.length === 0) {
    initializeAchievements()
  }

  return {
    // 状態
    profile,
    
    // 計算プロパティ
    totalCrystals,
    averageSkillLevel,
    overallVRReadiness,
    vrAccessLevel,
    nextLevelExp,
    currentLevelProgress,
    unlockedPlanets,
    earnedAchievements,
    isVRReady,
    academyConnectionStatus,
    
    // メソッド
    updateProfile,
    addExp,
    addCrystals,
    updateSkill,
    updateVRReadiness,
    updateVirtualAcademyProfile,
    connectToVirtualAcademy,
    unlockCompanion,
    setActiveCompanion,
    unlockAchievement,
    updateAchievementProgress,
    updateStats,
    updateLoginStreak,
    updateVRSettings,
    migrateFromGameStore,
    initializeAchievements,
    
    // 永続化設定
    $persist: {
      key: 'movwise-player-profile-vr',
      storage: localStorage,
      paths: ['profile']
    }
  }
})