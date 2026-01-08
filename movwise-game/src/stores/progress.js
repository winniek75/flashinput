// src/stores/progress.js
import { defineStore } from 'pinia'
import logger from '@/utils/logger'
import firebaseProgressService from '@/services/firebaseProgressService'
import { useAuthStore } from './auth'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    // ゲーム進捗データ
    gameScores: [],
    gameProgress: {},

    // 統合スキルレベルシステム（完全初期状態）
    skills: {
      phonics: { level: 1, exp: 0, maxExp: 100 },
      vocabulary: { level: 1, exp: 0, maxExp: 100 },
      grammar: { level: 1, exp: 0, maxExp: 100 },
      pronunciation: { level: 1, exp: 0, maxExp: 100 },
      listening: { level: 1, exp: 0, maxExp: 100 },
      rhythm: { level: 1, exp: 0, maxExp: 100 },
      blending: { level: 1, exp: 0, maxExp: 100 }
    },

    // セクション別レベルシステム（完全初期状態）
    sections: {
      phonicsAdventure: {
        level: 1,
        exp: 0,
        maxExp: 100, // 最初は100EXPでレベル2に
        unlockedGames: ['sound-master'], // 最初は1ゲームのみ
        masteredGames: [],
        title: 'フォニックス見習い',
        badge: '🔤'
      },
      grammarGalaxy: {
        level: 1,
        exp: 0,
        maxExp: 100,
        unlockedGames: ['be-verb-rush'], // 最初は1ゲームのみ
        masteredGames: [],
        title: '文法初心者',
        badge: '📝'
      },
      vocabularyWorld: {
        level: 1,
        exp: 0,
        maxExp: 100,
        unlockedGames: ['word-rush'], // 最初は1ゲームのみ
        masteredGames: [],
        title: '語彙学習者',
        badge: '📚'
      },
      typingArena: {
        level: 1,
        exp: 0,
        maxExp: 100,
        unlockedGames: ['typing-arena'], // 最初は1ゲームのみ
        masteredGames: [],
        title: 'タイピング初心者',
        badge: '⌨️'
      },
      comprehensiveSkill: {
        level: 1,
        exp: 0,
        maxExp: 200, // 総合スキルは最初からロック
        unlockedGames: [], // 完全にロック状態
        masteredGames: [],
        title: '未解放',
        badge: '🔒'
      }
    },

    // 総合レベル（完全初期状態）
    overallLevel: 1,
    totalExp: 0,

    // 学習パス推奨システム（完全初期状態）
    learningPath: {
      currentFocus: null,
      recommendedGames: [],
      weakestSkill: null,
      dailyGoals: [
        {
          id: 'first-game',
          description: '初回ゲームプレイ',
          target: 1,
          current: 0,
          reward: 50
        }
      ],
      completedToday: 0
    },

    // マイクロ達成システム（完全初期状態）
    microAchievements: {
      sessionStreak: 0,
      lastMicroReward: null,
      pendingRewards: []
    },

    totalStudyTime: 0,
    dailyActivities: {},
    streakData: {
      current: 0,
      longest: 0,
      lastActivityDate: null
    },
    badges: [],
    preferences: {
      soundEnabled: true,
      difficulty: 'normal',
      theme: 'light'
    }
  }),

  getters: {
    getTotalScore() {
      return this.gameScores.reduce((total, score) => total + score.score, 0)
    },

    getCompletedGamesCount() {
      return this.gameScores.length
    },

    getStreakDays() {
      return this.streakData.current
    },

    getAverageAccuracy() {
      if (this.gameScores.length === 0) return 0
      const totalAccuracy = this.gameScores.reduce((total, score) => total + (score.accuracy || 0), 0)
      return totalAccuracy / this.gameScores.length
    },

    getTotalStudyTime() {
      return this.totalStudyTime
    },

    getHighScore() {
      return this.gameScores.length > 0
        ? Math.max(...this.gameScores.map(score => score.score))
        : 0
    },

    getRecentScores() {
      return (limit = 10) => {
        return [...this.gameScores]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit)
      }
    },

    getGameProgress() {
      return (gameType) => this.gameProgress[gameType] || 0
    },

    hasBadge() {
      return (badgeId) => this.badges.includes(badgeId)
    },

    hasActivityOnDate() {
      return (dateString) => {
        return this.dailyActivities[dateString] && this.dailyActivities[dateString].length > 0
      }
    },

    getActivitiesOnDate() {
      return (dateString) => {
        return this.dailyActivities[dateString] || []
      }
    },

    // 統合レベルシステムのゲッター
    getOverallLevel() {
      const totalLevels = Object.values(this.skills).reduce((sum, skill) => sum + skill.level, 0)
      return Math.floor(totalLevels / Object.keys(this.skills).length)
    },

    getSkillProgress() {
      return (skillName) => {
        const skill = this.skills[skillName]
        return skill ? (skill.exp / skill.maxExp) * 100 : 0
      }
    },

    getWeakestSkill() {
      let weakest = null
      let lowestLevel = Infinity

      Object.entries(this.skills).forEach(([name, skill]) => {
        if (skill.level < lowestLevel) {
          lowestLevel = skill.level
          weakest = { name, ...skill }
        }
      })

      return weakest
    },

    getStrongestSkill() {
      let strongest = null
      let highestLevel = 0

      Object.entries(this.skills).forEach(([name, skill]) => {
        if (skill.level > highestLevel) {
          highestLevel = skill.level
          strongest = { name, ...skill }
        }
      })

      return strongest
    },

    getRecommendedPath() {
      const weakest = this.getWeakestSkill
      const strongest = this.getStrongestSkill

      // スキルギャップが大きい場合は弱点を優先
      if (weakest && strongest && weakest.level < strongest.level * 0.6) {
        return {
          priority: 'urgent',
          skill: weakest.name,
          games: this.getGamesForSkill(weakest.name),
          reason: `${this.getSkillDisplayName(weakest.name)}を強化しましょう`
        }
      }

      // バランスよく成長させる
      return {
        priority: 'balanced',
        skill: weakest ? weakest.name : 'phonics',
        games: this.getGamesForSkill(weakest ? weakest.name : 'phonics'),
        reason: 'バランスよく成長しています'
      }
    },

    getNextMilestone() {
      const currentLevel = this.getOverallLevel
      const milestones = {
        5: '初心者卒業',
        10: 'ブロンズマスター',
        15: 'シルバーマスター',
        20: 'ゴールドマスター',
        25: 'プラチナマスター',
        30: 'ダイヤモンドマスター',
        40: 'レジェンドマスター',
        50: 'グランドマスター'
      }

      for (const [level, title] of Object.entries(milestones)) {
        if (parseInt(level) > currentLevel) {
          return {
            level: parseInt(level),
            title,
            remaining: parseInt(level) - currentLevel
          }
        }
      }

      return null
    },

    // セクション別レベルシステムのゲッター
    getSectionLevel() {
      return (sectionName) => this.sections[sectionName]?.level || 1
    },

    getSectionProgress() {
      return (sectionName) => {
        const section = this.sections[sectionName]
        return section ? (section.exp / section.maxExp) * 100 : 0
      }
    },

    getSectionTitle() {
      return (sectionName) => this.sections[sectionName]?.title || '学習者'
    },

    getSectionBadge() {
      return (sectionName) => this.sections[sectionName]?.badge || '📖'
    },

    getUnlockedGames() {
      return (sectionName) => this.sections[sectionName]?.unlockedGames || []
    },

    getMasteredGames() {
      return (sectionName) => this.sections[sectionName]?.masteredGames || []
    },

    getAllSections() {
      return Object.entries(this.sections).map(([key, section]) => ({
        id: key,
        name: this.getSectionDisplayName(key),
        level: section.level,
        progress: (section.exp / section.maxExp) * 100,
        title: section.title,
        badge: section.badge,
        unlockedGames: section.unlockedGames.length,
        masteredGames: section.masteredGames.length
      }))
    }
  },

  actions: {
    // スキル別のゲームマッピング
    getGamesForSkill(skillName) {
      const gameMapping = {
        phonics: ['sound-master', 'phonics-training', 'sound-farm', 'pure-sound-lab'],
        vocabulary: ['word-rush', 'sight-word-master', 'word-family-tree'],
        grammar: ['grammar-color-code', 'be-verb-rush', 'pattern-hunter', 'verb-pattern-galaxy'],
        pronunciation: ['voice-puzzle', 'rhythm-tapper', 'native-pronunciation'],
        listening: ['sound-radar', 'phoneme-detector', 'sound-battle-arena'],
        rhythm: ['rhythm-phonics-dance', 'stress-pattern-master'],
        blending: ['sequential-blending', 'cvc-word-game', 'complex-phoneme']
      }

      return gameMapping[skillName] || []
    },

    getSkillDisplayName(skillName) {
      const displayNames = {
        phonics: 'フォニックス',
        vocabulary: '語彙',
        grammar: '文法',
        pronunciation: '発音',
        listening: 'リスニング',
        rhythm: 'リズム',
        blending: 'ブレンディング'
      }

      return displayNames[skillName] || skillName
    },

    getSectionDisplayName(sectionName) {
      const displayNames = {
        phonicsAdventure: 'フォニックスアドベンチャー',
        grammarGalaxy: '文法ギャラクシー',
        vocabularyWorld: '語彙ワールド',
        typingArena: 'タイピングアリーナ',
        comprehensiveSkill: '総合スキルチャレンジ'
      }

      return displayNames[sectionName] || sectionName
    },

    // スキル経験値を追加
    addSkillExp(skillName, expAmount, gameType = null) {
      if (!this.skills[skillName]) return

      const skill = this.skills[skillName]
      skill.exp += expAmount

      // レベルアップチェック
      while (skill.exp >= skill.maxExp) {
        skill.exp -= skill.maxExp
        skill.level++
        skill.maxExp = Math.floor(skill.maxExp * 1.2) // 次のレベルは20%増加

        // レベルアップ報酬
        this.processMicroReward({
          type: 'levelup',
          skill: skillName,
          level: skill.level,
          reward: 50 * skill.level
        })
      }

      // 総合経験値も更新
      this.totalExp += expAmount
      this.updateOverallLevel()

      // 学習パスを更新
      this.updateLearningPath()
    },

    // 総合レベルの更新
    updateOverallLevel() {
      const avgLevel = Math.floor(
        Object.values(this.skills).reduce((sum, skill) => sum + skill.level, 0) /
        Object.keys(this.skills).length
      )
      this.overallLevel = avgLevel
    },

    // 学習パスの更新
    updateLearningPath() {
      const weakest = this.getWeakestSkill
      const recommended = this.getRecommendedPath

      this.learningPath = {
        ...this.learningPath,
        weakestSkill: weakest ? weakest.name : null,
        recommendedGames: recommended.games.slice(0, 3),
        currentFocus: recommended.skill
      }
    },

    // マイクロ報酬の処理
    processMicroReward(reward) {
      this.microAchievements.pendingRewards.push({
        ...reward,
        timestamp: Date.now()
      })

      this.microAchievements.lastMicroReward = reward

      // 即座に報酬を付与
      if (reward.type === 'streak') {
        this.totalExp += reward.reward || 5
      } else if (reward.type === 'levelup') {
        this.totalExp += reward.reward || 50
      } else if (reward.type === 'perfect') {
        this.totalExp += reward.reward || 10
      }
    },

    // 30秒ごとのマイクロ達成チェック
    checkMicroAchievements(gameData) {
      const now = Date.now()

      // 連続正解チェック
      if (gameData.correctStreak >= 3) {
        this.processMicroReward({
          type: 'streak',
          count: gameData.correctStreak,
          reward: 5 * Math.floor(gameData.correctStreak / 3)
        })
      }

      // パーフェクトスコア
      if (gameData.accuracy === 100 && gameData.totalQuestions >= 5) {
        this.processMicroReward({
          type: 'perfect',
          reward: 15
        })
      }

      // セッションストリーク更新
      this.microAchievements.sessionStreak++

      // 5分ごとのボーナス
      if (this.microAchievements.sessionStreak % 10 === 0) {
        this.processMicroReward({
          type: 'milestone',
          minutes: this.microAchievements.sessionStreak * 0.5,
          reward: 20
        })
      }
    },

    // デイリーゴールの設定
    setDailyGoals() {
      const weakest = this.getWeakestSkill

      this.learningPath.dailyGoals = [
        {
          id: 'play3',
          description: '3ゲームプレイ',
          target: 3,
          current: this.learningPath.completedToday,
          reward: 30
        },
        {
          id: 'accuracy80',
          description: '正解率80%以上',
          target: 80,
          current: 0,
          reward: 25
        },
        {
          id: 'weakSkill',
          description: `${this.getSkillDisplayName(weakest?.name || 'phonics')}を練習`,
          target: 1,
          current: 0,
          reward: 20
        }
      ]
    },

    // ゲームからスキル経験値を追加
    addSkillExpFromGame(gameData) {
      const skillMapping = {
        'sound-master': ['phonics', 'listening'],
        'phonics-training': ['phonics'],
        'sound-farm': ['phonics', 'rhythm'],
        'word-rush': ['vocabulary', 'blending'],
        'sight-word-master': ['vocabulary'],
        'word-family-tree': ['vocabulary', 'phonics'],
        'grammar-color-code': ['grammar'],
        'be-verb-rush': ['grammar'],
        'pattern-hunter': ['grammar'],
        'verb-pattern-galaxy': ['grammar', 'vocabulary'],
        'voice-puzzle': ['pronunciation'],
        'rhythm-tapper': ['rhythm', 'pronunciation'],
        'sound-radar': ['listening', 'phonics'],
        'phoneme-detector': ['listening', 'blending'],
        'sequential-blending': ['blending', 'phonics'],
        'cvc-word-game': ['blending', 'vocabulary'],
        'complex-phoneme': ['blending', 'pronunciation']
      }

      const skills = skillMapping[gameData.gameType] || ['phonics']
      const baseExp = this.calculateExpFromScore(gameData)

      skills.forEach(skillName => {
        this.addSkillExp(skillName, baseExp, gameData.gameType)
      })
    },

    // スコアから経験値を計算
    calculateExpFromScore(gameData) {
      let baseExp = 5

      // 正解率ボーナス
      if (gameData.accuracy >= 100) baseExp += 10
      else if (gameData.accuracy >= 90) baseExp += 7
      else if (gameData.accuracy >= 80) baseExp += 5
      else if (gameData.accuracy >= 70) baseExp += 3

      // 連続正解ボーナス
      if (gameData.correctStreak >= 5) baseExp += 5
      else if (gameData.correctStreak >= 3) baseExp += 2

      // 難易度ボーナス
      if (gameData.difficulty === 'hard') baseExp *= 1.5
      else if (gameData.difficulty === 'normal') baseExp *= 1.2

      return Math.round(baseExp)
    },

    // デイリー進捗の更新
    updateDailyProgress(gameData) {
      this.learningPath.completedToday++

      // デイリーゴールチェック
      this.learningPath.dailyGoals.forEach(goal => {
        if (goal.id === 'play3') {
          goal.current = this.learningPath.completedToday
          if (goal.current >= goal.target && !goal.completed) {
            goal.completed = true
            this.totalExp += goal.reward
            this.processMicroReward({
              type: 'daily-goal',
              goal: goal.description,
              reward: goal.reward
            })
          }
        } else if (goal.id === 'accuracy80' && gameData.accuracy >= 80) {
          goal.current = gameData.accuracy
          if (!goal.completed) {
            goal.completed = true
            this.totalExp += goal.reward
          }
        }
      })
    },

    // セクション経験値を追加
    addSectionExp(sectionName, expAmount) {
      if (!this.sections[sectionName]) return

      const section = this.sections[sectionName]
      const oldLevel = section.level
      section.exp += expAmount

      // レベルアップチェック
      while (section.exp >= section.maxExp) {
        section.exp -= section.maxExp
        section.level++
        section.maxExp = Math.floor(section.maxExp * 1.3) // 次のレベルは30%増加

        // セクションレベルアップ報酬
        const reward = this.processSectionLevelUp(sectionName, section.level)

        this.processMicroReward({
          type: 'section-levelup',
          section: sectionName,
          level: section.level,
          reward: reward.exp,
          unlocked: reward.unlockedGames
        })
      }

      // セクションレベルが上がった場合
      if (section.level > oldLevel) {
        this.updateSectionUnlocks(sectionName, section.level)
      }
    },

    // セクションレベルアップ処理
    processSectionLevelUp(sectionName, newLevel) {
      const section = this.sections[sectionName]
      const rewards = { exp: newLevel * 50, unlockedGames: [] }

      // レベル別報酬とアンロック（簡潔で分かりやすい進行）
      const levelRewards = {
        phonicsAdventure: {
          2: { title: 'フォニックス学習者', games: ['phonics-training'], badge: '🎵' },
          3: { title: 'サウンド探検家', games: ['sound-farm'], badge: '🔍' },
          4: { title: 'フォニックス戦士', games: ['phonics-puzzle'], badge: '⚔️' },
          5: { title: 'サウンドマスター', games: ['pure-sound-lab'], badge: '🔊' },
          7: { title: 'フォニックス博士', games: ['complex-phoneme'], badge: '🎓' },
          10: { title: 'フォニックス伝説', games: ['sound-battle-arena'], badge: '👑' }
        },
        grammarGalaxy: {
          2: { title: '文法学習者', games: ['grammar-color-code'], badge: '🟦' },
          3: { title: '文法探検家', games: ['pattern-hunter'], badge: '🔍' },
          4: { title: '文法戦士', games: ['verb-pattern-galaxy'], badge: '⚔️' },
          5: { title: '文法マスター', games: ['comparison-master'], badge: '🌟' },
          7: { title: '文法博士', games: ['conjunction-connection'], badge: '🎓' },
          10: { title: '文法伝説', games: ['grammar-puzzle-cascade'], badge: '👑' }
        },
        vocabularyWorld: {
          2: { title: '語彙学習者', games: ['sight-word-master'], badge: '📖' },
          3: { title: 'ワード探検家', games: ['word-family-tree'], badge: '🌱' },
          4: { title: 'ワード戦士', games: ['word-dictation'], badge: '⚔️' },
          5: { title: 'ワードマスター', games: ['vocabulary-galaxy'], badge: '🌟' },
          7: { title: '語彙博士', games: ['holographic-story'], badge: '🎓' },
          10: { title: '語彙伝説', games: ['word-magic-arena'], badge: '👑' }
        },
        typingArena: {
          2: { title: 'タイピング学習者', games: ['typing-enhanced'], badge: '⌨️' },
          3: { title: 'キーボード探検家', games: ['typing-speed'], badge: '🔍' },
          4: { title: 'タイピング戦士', games: ['typing-accuracy'], badge: '⚔️' },
          5: { title: 'スピードタイパー', games: ['typing-battle'], badge: '⚡' },
          7: { title: 'タイピングマスター', games: ['typing-ninja'], badge: '🥷' },
          10: { title: 'タイピング伝説', games: ['ultimate-typing'], badge: '👑' }
        },
        comprehensiveSkill: {
          2: { title: '総合挑戦者', games: ['skill-mix-basic'], badge: '🎯' },
          5: { title: '総合戦士', games: ['skill-challenge'], badge: '⚔️' },
          10: { title: '総合マスター', games: ['ultimate-challenge'], badge: '👑' }
        }
      }

      const sectionRewards = levelRewards[sectionName]
      if (sectionRewards && sectionRewards[newLevel]) {
        const reward = sectionRewards[newLevel]
        section.title = reward.title
        section.badge = reward.badge

        // ゲームをアンロック
        reward.games.forEach(game => {
          if (!section.unlockedGames.includes(game)) {
            section.unlockedGames.push(game)
            rewards.unlockedGames.push(game)
          }
        })
      }

      return rewards
    },

    // セクションアンロック更新
    updateSectionUnlocks(sectionName, level) {
      // 総合スキルチャレンジのアンロック条件
      if (level >= 3) {
        // 任意のセクションがレベル3で総合スキルが解放される
        if (this.sections.comprehensiveSkill.unlockedGames.length === 0) {
          this.sections.comprehensiveSkill.unlockedGames.push('skill-mix-basic')
          this.sections.comprehensiveSkill.title = '総合挑戦者'
          this.sections.comprehensiveSkill.badge = '🎯'

          this.processMicroReward({
            type: 'section-unlock',
            section: 'comprehensiveSkill',
            reward: 100
          })
        }
      }

      // クロスセクション特別ボーナス
      const totalSectionsLevel3Plus = Object.values(this.sections)
        .filter(section => section.level >= 3 && section !== this.sections.comprehensiveSkill)
        .length

      // 3つのセクションがレベル3以上で特別報酬
      if (totalSectionsLevel3Plus >= 3) {
        this.sections.comprehensiveSkill.unlockedGames.push('advanced-skill-challenge')
      }
    },

    // ゲームスコアを記録（既存メソッドを拡張）
    recordGameScore(gameData) {
      const scoreRecord = {
        id: Date.now(),
        gameType: gameData.gameType,
        score: gameData.score,
        accuracy: gameData.accuracy,
        timeSpent: gameData.timeSpent || 0,
        level: gameData.level || 1,
        date: new Date().toISOString(),
        correctAnswers: gameData.correctAnswers || 0,
        totalQuestions: gameData.totalQuestions || 0
      }

      this.gameScores.push(scoreRecord)

      // スキル経験値を追加
      this.addSkillExpFromGame(gameData)

      // セクション経験値を追加
      this.addSectionExpFromGame(gameData)

      // マイクロ達成をチェック
      this.checkMicroAchievements({
        correctStreak: gameData.correctStreak || 0,
        accuracy: scoreRecord.accuracy,
        totalQuestions: scoreRecord.totalQuestions
      })

      // デイリー進捗を更新
      this.updateDailyProgress(gameData)

      // 学習時間を更新
      this.totalStudyTime += scoreRecord.timeSpent

      // ゲーム進捗を更新
      if (gameData.levelCompleted) {
        this.gameProgress[gameData.gameType] = Math.max(
          this.gameProgress[gameData.gameType],
          gameData.level
        )
      }

      // 日別アクティビティを記録
      this.recordDailyActivity(scoreRecord)

      // 連続学習日数を更新
      this.updateStreak()

      // バッジをチェック
      this.checkAndAwardBadges()

      // データを永続化
      this.saveProgress()
    },

    // ゲームからセクション経験値を計算
    addSectionExpFromGame(gameData) {
      const sectionMapping = {
        'sound-master': 'phonicsAdventure',
        'phonics-training': 'phonicsAdventure',
        'sound-farm': 'phonicsAdventure',
        'word-rush': 'vocabularyWorld',
        'sight-word-master': 'vocabularyWorld',
        'word-family-tree': 'vocabularyWorld',
        'be-verb-rush': 'grammarGalaxy',
        'grammar-color-code': 'grammarGalaxy',
        'pattern-hunter': 'grammarGalaxy',
        'verb-pattern-galaxy': 'grammarGalaxy',
        'typing-arena': 'typingArena',
        'typing-practice': 'typingArena'
      }

      const sectionName = sectionMapping[gameData.gameType]
      if (sectionName) {
        const baseExp = this.calculateExpFromScore(gameData)
        const sectionExp = Math.round(baseExp * 2) // セクションEXPは2倍
        this.addSectionExp(sectionName, sectionExp)
      }
    },

    // 日別アクティビティを記録
    recordDailyActivity(scoreRecord) {
      const dateKey = scoreRecord.date.split('T')[0]

      if (!this.dailyActivities[dateKey]) {
        this.dailyActivities[dateKey] = []
      }

      this.dailyActivities[dateKey].push({
        id: scoreRecord.id,
        gameType: scoreRecord.gameType,
        score: scoreRecord.score,
        accuracy: scoreRecord.accuracy,
        time: new Date(scoreRecord.date).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    },

    // 連続学習日数を更新
    updateStreak() {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (!this.streakData.lastActivityDate) {
        // 初回学習
        this.streakData.current = 1
        this.streakData.lastActivityDate = today
      } else if (this.streakData.lastActivityDate === today) {
        // 今日はすでに学習済み（何もしない）
        return
      } else if (this.streakData.lastActivityDate === yesterday) {
        // 連続学習
        this.streakData.current += 1
        this.streakData.lastActivityDate = today
      } else {
        // 連続が途切れた
        this.streakData.current = 1
        this.streakData.lastActivityDate = today
      }

      // 最長連続記録を更新
      this.streakData.longest = Math.max(
        this.streakData.longest,
        this.streakData.current
      )
    },

    // バッジの獲得をチェック
    checkAndAwardBadges() {
      const newBadges = []

      // 初回プレイバッジ
      if (!this.hasBadge('first-game') && this.gameScores.length >= 1) {
        newBadges.push('first-game')
      }

      // ハイスコアラーバッジ
      if (!this.hasBadge('high-scorer') && this.getHighScore >= 1000) {
        newBadges.push('high-scorer')
      }

      // 連続学習バッジ
      if (!this.hasBadge('streak-week') && this.streakData.current >= 7) {
        newBadges.push('streak-week')
      }

      // パーフェクトスコアバッジ
      if (!this.hasBadge('perfect-score') &&
        this.gameScores.some(score => score.accuracy === 100)) {
        newBadges.push('perfect-score')
      }

      // ゲームマスターバッジ
      if (!this.hasBadge('game-master') &&
        Object.values(this.gameProgress).every(progress => progress >= 10)) {
        newBadges.push('game-master')
      }

      // スピードランナーバッジ
      if (!this.hasBadge('speed-runner') &&
        this.gameScores.some(score => score.timeSpent < 60 && score.accuracy >= 90)) {
        newBadges.push('speed-runner')
      }

      // 新しいバッジを追加
      newBadges.forEach(badge => {
        if (!this.badges.includes(badge)) {
          this.badges.push(badge)
        }
      })

      return newBadges
    },

    // レベル完了を記録
    completeLevel(gameType, level) {
      this.gameProgress[gameType] = Math.max(this.gameProgress[gameType], level)
      this.saveProgress()
    },

    // 設定を更新
    updatePreferences(newPreferences) {
      this.preferences = { ...this.preferences, ...newPreferences }
      this.saveProgress()
    },

    // データをローカルストレージに保存
    saveProgress() {
      try {
        const progressData = {
          gameScores: this.gameScores,
          gameProgress: this.gameProgress,
          totalStudyTime: this.totalStudyTime,
          dailyActivities: this.dailyActivities,
          streakData: this.streakData,
          badges: this.badges,
          preferences: this.preferences
        }
        localStorage.setItem('movwise-progress', JSON.stringify(progressData))
      } catch (error) {
        logger.error('進捗データの保存に失敗しました:', error)
      }
    },

    // データをローカルストレージから読み込み
    loadProgress() {
      try {
        const savedData = localStorage.getItem('movwise-progress')
        if (savedData) {
          const progressData = JSON.parse(savedData)

          this.gameScores = progressData.gameScores || []
          this.gameProgress = { ...this.gameProgress, ...progressData.gameProgress }
          this.totalStudyTime = progressData.totalStudyTime || 0
          this.dailyActivities = progressData.dailyActivities || {}
          this.streakData = { ...this.streakData, ...progressData.streakData }
          this.badges = progressData.badges || []
          this.preferences = { ...this.preferences, ...progressData.preferences }
        }
      } catch (error) {
        logger.error('進捗データの読み込みに失敗しました:', error)
      }
    },

    // データを完全リセット（レベル1からやり直し）
    resetProgress() {
      this.gameScores = []
      this.gameProgress = {}
      this.totalStudyTime = 0
      this.dailyActivities = {}
      this.streakData = {
        current: 0,
        longest: 0,
        lastActivityDate: null
      }
      this.badges = []

      // スキルレベルリセット
      Object.keys(this.skills).forEach(skill => {
        this.skills[skill] = { level: 1, exp: 0, maxExp: 100 }
      })

      // セクションレベルリセット
      this.sections = {
        phonicsAdventure: {
          level: 1,
          exp: 0,
          maxExp: 100,
          unlockedGames: ['sound-master'],
          masteredGames: [],
          title: 'フォニックス見習い',
          badge: '🔤'
        },
        grammarGalaxy: {
          level: 1,
          exp: 0,
          maxExp: 100,
          unlockedGames: ['be-verb-rush'],
          masteredGames: [],
          title: '文法初心者',
          badge: '📝'
        },
        vocabularyWorld: {
          level: 1,
          exp: 0,
          maxExp: 100,
          unlockedGames: ['word-rush'],
          masteredGames: [],
          title: '語彙学習者',
          badge: '📚'
        },
        typingArena: {
          level: 1,
          exp: 0,
          maxExp: 100,
          unlockedGames: ['typing-arena'],
          masteredGames: [],
          title: 'タイピング初心者',
          badge: '⌨️'
        },
        comprehensiveSkill: {
          level: 1,
          exp: 0,
          maxExp: 200,
          unlockedGames: [],
          masteredGames: [],
          title: '未解放',
          badge: '🔒'
        }
      }

      // 学習パスリセット
      this.learningPath = {
        currentFocus: null,
        recommendedGames: [],
        weakestSkill: null,
        dailyGoals: [
          {
            id: 'first-game',
            description: '初回ゲームプレイ',
            target: 1,
            current: 0,
            reward: 50
          }
        ],
        completedToday: 0
      }

      // マイクロ達成リセット
      this.microAchievements = {
        sessionStreak: 0,
        lastMicroReward: null,
        pendingRewards: []
      }

      this.overallLevel = 1
      this.totalExp = 0

      localStorage.removeItem('movwise-progress')
      console.log('✅ 進捗データを完全リセットしました - レベル1からスタート！')
    },

    // 統計データを取得
    getStatistics() {
      const stats = {
        totalGames: this.gameScores.length,
        totalScore: this.getTotalScore,
        averageScore: this.gameScores.length > 0
          ? Math.round(this.getTotalScore / this.gameScores.length)
          : 0,
        highScore: this.getHighScore,
        averageAccuracy: Math.round(this.getAverageAccuracy),
        totalStudyTime: this.totalStudyTime,
        currentStreak: this.streakData.current,
        longestStreak: this.streakData.longest,
        badgeCount: this.badges.length,
        gamesThisWeek: this.getGamesThisWeek(),
        favoriteGame: this.getFavoriteGame()
      }

      return stats
    },

    // 今週のゲーム数を取得
    getGamesThisWeek() {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.gameScores.filter(score =>
        new Date(score.date) >= oneWeekAgo
      ).length
    },

    // お気に入りゲームを取得
    getFavoriteGame() {
      if (this.gameScores.length === 0) return null

      const gameCount = {}
      this.gameScores.forEach(score => {
        gameCount[score.gameType] = (gameCount[score.gameType] || 0) + 1
      })

      const mostPlayedGame = Object.keys(gameCount).reduce((a, b) =>
        gameCount[a] > gameCount[b] ? a : b
      )

      const gameNames = {
        'sound-master': 'サウンドマスター',
        'word-rush': 'ワードラッシュ',
        'pattern-builder': 'パターンビルダー'
      }

      return gameNames[mostPlayedGame] || mostPlayedGame
    },

    // ================== Firebase連携メソッド ==================

    // Firebaseからデータを読み込み
    async loadFromFirebase() {
      try {
        const authStore = useAuthStore()
        const userId = authStore.currentUser?.uid

        if (!userId) {
          logger.warn('No user ID available for loading progress')
          return
        }

        // Firebase から初期データを取得
        const userData = await firebaseProgressService.initializeUserProgress(userId)

        if (userData?.progress) {
          // ストアの状態を更新
          this.skills = userData.progress.skills || this.skills
          this.sections = userData.progress.sections || this.sections
          this.overallLevel = userData.progress.level || 1
          this.totalExp = userData.progress.totalExp || 0
          this.streakData = userData.progress.streakData || this.streakData
          this.badges = userData.progress.badges || []
          this.totalStudyTime = userData.progress.totalStudyTime || 0
        }

        // リアルタイムリスナーを設定
        firebaseProgressService.listenToUserProgress(userId, (userData) => {
          if (userData?.progress) {
            this.skills = userData.progress.skills || this.skills
            this.sections = userData.progress.sections || this.sections
            this.overallLevel = userData.progress.level || 1
            this.totalExp = userData.progress.totalExp || 0
            this.streakData = userData.progress.streakData || this.streakData
            this.badges = userData.progress.badges || []
            this.totalStudyTime = userData.progress.totalStudyTime || 0
          }
        })

        logger.log('✅ Progress loaded from Firebase')
      } catch (error) {
        logger.error('Failed to load progress from Firebase:', error)
      }
    },

    // ゲーム結果を保存
    async saveGameResult(gameData) {
      try {
        const authStore = useAuthStore()
        const userId = authStore.currentUser?.uid

        if (!userId) {
          // ローカルストレージに保存
          this.saveGameScore(gameData)
          return
        }

        // Firebaseに保存
        const result = await firebaseProgressService.saveGameScore(userId, gameData)

        if (result.success) {
          // ローカルストアも更新
          this.saveGameScore(gameData)

          // アクティビティを更新
          await firebaseProgressService.updateActivity(userId)
        }

        return result
      } catch (error) {
        logger.error('Failed to save game result:', error)
        // エラー時はローカルに保存
        this.saveGameScore(gameData)
      }
    },

    // 経験値を追加（Firebase連携）
    async addExpWithFirebase(expAmount, skillType = null) {
      try {
        const authStore = useAuthStore()
        const userId = authStore.currentUser?.uid

        if (!userId) {
          // ローカルのみ更新
          this.addSkillExp(skillType, expAmount)
          return
        }

        // Firebaseに保存
        const result = await firebaseProgressService.addExperience(userId, expAmount, skillType)

        if (result.success) {
          // レベルアップ通知
          if (result.newLevel > this.overallLevel) {
            logger.log(`🎉 レベルアップ！ レベル ${result.newLevel} に到達！`)
          }
        }
      } catch (error) {
        logger.error('Failed to add experience to Firebase:', error)
        // エラー時はローカルに保存
        this.addSkillExp(skillType, expAmount)
      }
    }
  }
})