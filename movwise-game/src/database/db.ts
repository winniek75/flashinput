import Dexie, { Table } from 'dexie'

// データベースインターフェース定義
export interface TicketTransaction {
  id?: number
  type: 'earn' | 'use'
  amount: number
  reason: string
  purpose?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface GameProgress {
  id?: number
  gameId: string
  userId: string
  bestScore: number
  playCount: number
  lastPlayed: Date
  achievements?: string[]
  metadata?: Record<string, any>
}

export interface UserProfile {
  id?: number
  userId: string
  username: string
  level: number
  totalXP: number
  createdAt: Date
  updatedAt: Date
  settings?: Record<string, any>
}

export interface Achievement {
  id?: number
  achievementId: string
  userId: string
  unlockedAt: Date
  progress: number
  metadata?: Record<string, any>
}

// Dexieデータベースクラス
class MovWiseDatabase extends Dexie {
  tickets!: Table<TicketTransaction>
  gameProgress!: Table<GameProgress>
  userProfiles!: Table<UserProfile>
  achievements!: Table<Achievement>

  constructor() {
    super('MovWiseDatabase')

    // スキーマ定義
    this.version(1).stores({
      tickets: '++id, type, timestamp, reason',
      gameProgress: '++id, gameId, userId, lastPlayed',
      userProfiles: '++id, userId, username, level, createdAt',
      achievements: '++id, achievementId, userId, unlockedAt'
    })

    // バージョン2: 新しいインデックスを追加
    this.version(2).stores({
      tickets: '++id, type, timestamp, reason, purpose',
      gameProgress: '++id, [gameId+userId], lastPlayed, bestScore',
      userProfiles: '++id, userId, username, level, totalXP, createdAt',
      achievements: '++id, [achievementId+userId], unlockedAt, progress'
    })
  }
}

// データベースインスタンスをエクスポート
export const db = new MovWiseDatabase()

// データベース初期化関数
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open()
    console.log('🗃️ Database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    // フォールバック処理
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing old data...')
      await clearOldData()
    }
  }
}

// 古いデータをクリアする関数
async function clearOldData(): Promise<void> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // 30日以上前のチケットトランザクションを削除
    await db.tickets
      .where('timestamp')
      .below(thirtyDaysAgo)
      .delete()

    console.log('Old ticket transactions cleared')
  } catch (error) {
    console.error('Failed to clear old data:', error)
  }
}

// チケット関連のヘルパー関数
export async function getTicketBalance(): Promise<number> {
  try {
    const transactions = await db.tickets.toArray()
    const earned = transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.amount, 0)
    const used = transactions
      .filter(t => t.type === 'use')
      .reduce((sum, t) => sum + t.amount, 0)
    return earned - used
  } catch (error) {
    console.error('Failed to get ticket balance:', error)
    return 0
  }
}

// ゲーム進捗関連のヘルパー関数
export async function saveGameProgress(
  gameId: string,
  userId: string,
  score: number
): Promise<void> {
  try {
    const existing = await db.gameProgress
      .where(['gameId', 'userId'])
      .equals([gameId, userId])
      .first()

    if (existing) {
      // 既存の記録を更新
      await db.gameProgress.update(existing.id!, {
        bestScore: Math.max(existing.bestScore, score),
        playCount: existing.playCount + 1,
        lastPlayed: new Date()
      })
    } else {
      // 新規記録を作成
      await db.gameProgress.add({
        gameId,
        userId,
        bestScore: score,
        playCount: 1,
        lastPlayed: new Date()
      })
    }
  } catch (error) {
    console.error('Failed to save game progress:', error)
  }
}

// ユーザープロフィール関連のヘルパー関数
export async function getUserProfile(userId: string): Promise<UserProfile | undefined> {
  try {
    return await db.userProfiles
      .where('userId')
      .equals(userId)
      .first()
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return undefined
  }
}

export async function updateUserLevel(
  userId: string,
  level: number,
  totalXP: number
): Promise<void> {
  try {
    const profile = await getUserProfile(userId)

    if (profile) {
      await db.userProfiles.update(profile.id!, {
        level,
        totalXP,
        updatedAt: new Date()
      })
    }
  } catch (error) {
    console.error('Failed to update user level:', error)
  }
}

// アチーブメント関連のヘルパー関数
export async function unlockAchievement(
  achievementId: string,
  userId: string,
  progress = 100
): Promise<void> {
  try {
    const existing = await db.achievements
      .where(['achievementId', 'userId'])
      .equals([achievementId, userId])
      .first()

    if (!existing) {
      await db.achievements.add({
        achievementId,
        userId,
        unlockedAt: new Date(),
        progress
      })
      console.log(`🏆 Achievement unlocked: ${achievementId}`)
    } else if (existing.progress < progress) {
      await db.achievements.update(existing.id!, {
        progress,
        unlockedAt: progress >= 100 ? new Date() : existing.unlockedAt
      })
    }
  } catch (error) {
    console.error('Failed to unlock achievement:', error)
  }
}

// データベースのクリア（開発用）
export async function clearDatabase(): Promise<void> {
  if (import.meta.env.DEV) {
    await db.tickets.clear()
    await db.gameProgress.clear()
    await db.userProfiles.clear()
    await db.achievements.clear()
    console.log('🗑️ Database cleared')
  }
}

// エクスポート
export default db