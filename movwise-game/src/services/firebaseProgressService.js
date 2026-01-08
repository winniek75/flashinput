// Firebase Progress Service
// Firebaseと連携して実際の進捗データを管理

import { ref as dbRef, set, get, update, onValue, push } from 'firebase/database'
import { database } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import logger from '@/utils/logger'

class FirebaseProgressService {
  constructor() {
    this.listeners = []
  }

  // ユーザーの進捗データを初期化
  async initializeUserProgress(userId) {
    try {
      const userRef = dbRef(database, `users/${userId}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        // 新規ユーザーの場合、初期データを作成
        const initialData = {
          profile: {
            displayName: '',
            email: '',
            role: 'student',
            createdAt: Date.now()
          },
          progress: {
            level: 1,
            exp: 0,
            totalExp: 0,
            skills: {
              phonics: { level: 1, exp: 0, maxExp: 100 },
              vocabulary: { level: 1, exp: 0, maxExp: 100 },
              grammar: { level: 1, exp: 0, maxExp: 100 },
              pronunciation: { level: 1, exp: 0, maxExp: 100 },
              listening: { level: 1, exp: 0, maxExp: 100 },
              rhythm: { level: 1, exp: 0, maxExp: 100 },
              blending: { level: 1, exp: 0, maxExp: 100 }
            },
            sections: {
              phonicsAdventure: {
                level: 1,
                exp: 0,
                maxExp: 100,
                unlockedGames: ['sound-master'],
                masteredGames: []
              },
              grammarGalaxy: {
                level: 1,
                exp: 0,
                maxExp: 100,
                unlockedGames: ['be-verb-rush'],
                masteredGames: []
              },
              vocabularyWorld: {
                level: 1,
                exp: 0,
                maxExp: 100,
                unlockedGames: ['word-rush'],
                masteredGames: []
              },
              typingArena: {
                level: 1,
                exp: 0,
                maxExp: 100,
                unlockedGames: ['typing-arena'],
                masteredGames: []
              }
            },
            streakData: {
              current: 0,
              longest: 0,
              lastActivityDate: null
            },
            badges: [],
            totalStudyTime: 0,
            gamesPlayed: 0
          },
          gameScores: [],
          vrTickets: {
            balance: 3, // 初期チケット
            earned: 3,
            used: 0
          }
        }

        await set(userRef, initialData)
        logger.log('✅ Created initial user data in Firebase')
        return initialData
      }

      return snapshot.val()
    } catch (error) {
      logger.error('Failed to initialize user progress:', error)
      throw error
    }
  }

  // 経験値を追加
  async addExperience(userId, expGained, skillType = null) {
    try {
      const userRef = dbRef(database, `users/${userId}/progress`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const currentProgress = snapshot.val()

        // 総経験値を更新
        const newTotalExp = (currentProgress.totalExp || 0) + expGained
        const newLevel = Math.floor(newTotalExp / 100) + 1 // 100 EXPごとにレベルアップ

        const updates = {
          exp: newTotalExp % 100,
          totalExp: newTotalExp,
          level: newLevel
        }

        // 特定スキルの経験値も更新
        if (skillType && currentProgress.skills?.[skillType]) {
          const skill = currentProgress.skills[skillType]
          const newSkillExp = skill.exp + expGained
          const newSkillLevel = Math.floor(newSkillExp / skill.maxExp) + skill.level

          updates[`skills/${skillType}/exp`] = newSkillExp % skill.maxExp
          updates[`skills/${skillType}/level`] = newSkillLevel
        }

        await update(userRef, updates)

        logger.log(`✅ Added ${expGained} EXP to user ${userId}`)

        // レベルアップチェック
        if (newLevel > currentProgress.level) {
          await this.handleLevelUp(userId, newLevel)
        }

        return { success: true, newLevel, newTotalExp }
      }
    } catch (error) {
      logger.error('Failed to add experience:', error)
      return { success: false, error }
    }
  }

  // レベルアップ処理
  async handleLevelUp(userId, newLevel) {
    try {
      // レベルアップ報酬
      const rewards = {
        vrTickets: Math.floor(newLevel / 5), // 5レベルごとにVRチケット
        unlockedGames: this.getUnlockedGamesForLevel(newLevel)
      }

      // 報酬を付与
      if (rewards.vrTickets > 0) {
        await this.addVRTickets(userId, rewards.vrTickets)
      }

      // 新ゲームをアンロック
      if (rewards.unlockedGames.length > 0) {
        await this.unlockGames(userId, rewards.unlockedGames)
      }

      logger.log(`🎉 Level up! User ${userId} is now level ${newLevel}`)

      return rewards
    } catch (error) {
      logger.error('Failed to handle level up:', error)
    }
  }

  // レベルに応じた解放ゲームを取得
  getUnlockedGamesForLevel(level) {
    const unlockedGames = []

    if (level >= 2) unlockedGames.push('cvc-word-game')
    if (level >= 3) unlockedGames.push('sight-word-master')
    if (level >= 5) unlockedGames.push('grammar-color-code')
    if (level >= 7) unlockedGames.push('typing-arena-enhanced')
    if (level >= 10) unlockedGames.push('vr-academy')

    return unlockedGames
  }

  // ゲームをアンロック
  async unlockGames(userId, gameIds) {
    try {
      const updates = {}

      for (const gameId of gameIds) {
        // ゲームのセクションを特定
        const section = this.getGameSection(gameId)
        if (section) {
          updates[`users/${userId}/progress/sections/${section}/unlockedGames`] = gameId
        }
      }

      if (Object.keys(updates).length > 0) {
        await update(dbRef(database), updates)
        logger.log(`✅ Unlocked games: ${gameIds.join(', ')}`)
      }
    } catch (error) {
      logger.error('Failed to unlock games:', error)
    }
  }

  // ゲームのセクションを特定
  getGameSection(gameId) {
    const gameSections = {
      'cvc-word-game': 'phonicsAdventure',
      'sight-word-master': 'vocabularyWorld',
      'grammar-color-code': 'grammarGalaxy',
      'typing-arena-enhanced': 'typingArena',
      'be-verb-rush': 'grammarGalaxy',
      'word-rush': 'vocabularyWorld',
      'sound-master': 'phonicsAdventure'
    }

    return gameSections[gameId] || null
  }

  // VRチケットを追加
  async addVRTickets(userId, amount) {
    try {
      const ticketRef = dbRef(database, `users/${userId}/vrTickets`)
      const snapshot = await get(ticketRef)

      if (snapshot.exists()) {
        const current = snapshot.val()
        await update(ticketRef, {
          balance: current.balance + amount,
          earned: current.earned + amount
        })

        logger.log(`✅ Added ${amount} VR tickets to user ${userId}`)
      }
    } catch (error) {
      logger.error('Failed to add VR tickets:', error)
    }
  }

  // ゲームスコアを保存
  async saveGameScore(userId, gameData) {
    try {
      const scoresRef = dbRef(database, `users/${userId}/gameScores`)

      const scoreData = {
        gameId: gameData.gameId,
        gameName: gameData.gameName,
        score: gameData.score,
        accuracy: gameData.accuracy || 0,
        timeSpent: gameData.timeSpent || 0,
        timestamp: Date.now(),
        expEarned: gameData.expEarned || 0
      }

      await push(scoresRef, scoreData)

      // 経験値を付与
      if (scoreData.expEarned > 0) {
        await this.addExperience(userId, scoreData.expEarned, gameData.skillType)
      }

      logger.log(`✅ Saved game score for ${gameData.gameName}`)

      return { success: true, scoreData }
    } catch (error) {
      logger.error('Failed to save game score:', error)
      return { success: false, error }
    }
  }

  // リアルタイムリスナーを設定
  listenToUserProgress(userId, callback) {
    const userRef = dbRef(database, `users/${userId}`)

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val())
      }
    })

    this.listeners.push(unsubscribe)

    return unsubscribe
  }

  // 全リスナーを解除
  removeAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners = []
  }

  // 講師用: 生徒リストを取得
  async getStudentsList(teacherId) {
    try {
      const usersRef = dbRef(database, 'users')
      const snapshot = await get(usersRef)

      if (snapshot.exists()) {
        const allUsers = snapshot.val()
        const students = []

        for (const [userId, userData] of Object.entries(allUsers)) {
          if (userData.profile?.role === 'student' || userData.profile?.role === 'copilot') {
            students.push({
              id: userId,
              name: userData.profile.displayName || '名前未設定',
              email: userData.profile.email,
              level: userData.progress?.level || 1,
              totalExp: userData.progress?.totalExp || 0,
              lastActive: userData.progress?.lastActivityDate || null,
              isOnline: this.checkIfOnline(userData.progress?.lastActivityDate)
            })
          }
        }

        return students
      }

      return []
    } catch (error) {
      logger.error('Failed to get students list:', error)
      return []
    }
  }

  // オンライン状態をチェック（5分以内の活動）
  checkIfOnline(lastActivityDate) {
    if (!lastActivityDate) return false
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    return lastActivityDate > fiveMinutesAgo
  }

  // アクティビティを更新
  async updateActivity(userId) {
    try {
      const activityRef = dbRef(database, `users/${userId}/progress/lastActivityDate`)
      await set(activityRef, Date.now())
    } catch (error) {
      logger.error('Failed to update activity:', error)
    }
  }
}

export default new FirebaseProgressService()