// src/stores/reminderStore.js - スマートリマインダーシステム
import { defineStore } from 'pinia'
import { useStreakStore } from './streakStore'
import { useQuestStore } from './questStore'
import logger from '@/utils/logger'

export const useReminderStore = defineStore('reminder', {
  state: () => ({
    // リマインダー設定
    settings: {
      enabled: true,
      channels: {
        browser: true,
        email: false,
        push: false
      },
      smartTiming: true,
      quietHours: {
        start: 22, // 22:00
        end: 8     // 08:00
      },
      maxPerDay: 3
    },

    // 学習パターンデータ
    learningPatterns: {
      // 曜日別の活動時間 (0=日曜日, 6=土曜日)
      weeklyActivity: {
        0: [], // 日曜日の学習時間帯
        1: [], // 月曜日
        2: [], // 火曜日
        3: [], // 水曜日
        4: [], // 木曜日
        5: [], // 金曜日
        6: []  // 土曜日
      },
      // 最も活発な時間帯
      peakHours: [],
      // 平均セッション時間
      averageSessionLength: 0,
      // 最終学習時刻
      lastActiveTime: null
    },

    // スケジュール済みリマインダー
    scheduledReminders: [],

    // 送信履歴
    sentReminders: [],

    // 通知権限状態
    notificationPermission: 'default', // 'granted', 'denied', 'default'

    // AIによる予測データ
    predictions: {
      churnRisk: 0, // 離脱リスク (0-100%)
      optimalTime: null, // 最適な通知時間
      messageType: 'standard', // 'motivational', 'urgent', 'reward'
      nextSessionPrediction: null // 次回学習予測時刻
    },

    // メッセージテンプレート
    messageTemplates: {
      streak: {
        at_risk: [
          '🔥 ストリークが切れそう！今日も頑張ろう！',
          '⚠️ {streak}日連続記録を守ろう！',
          '💪 あと少し！今日の学習を完了させよう！'
        ],
        milestone_close: [
          '🎯 あと{days}日で{milestone}日達成！',
          '🏆 マイルストーンまであと少し！',
          '✨ 素晴らしい！もうすぐ{milestone}日記録！'
        ],
        protected: [
          '🛡️ ストリークシールド使用可能！今日も学習しよう',
          '💫 シールドがあるから安心！でも学習は大切',
          '🔒 保護期間中でも継続が大事！'
        ]
      },
      quest: {
        almost_complete: [
          '📋 デイリークエストあと{remaining}個！',
          '🎮 もう少しでクエスト完了！',
          '⭐ あと一歩で今日の目標達成！'
        ],
        unclaimed_rewards: [
          '🎁 未受取の報酬があります！',
          '💎 {gems}ジェムが待ってます！',
          '🎉 クエスト報酬を受け取ろう！'
        ],
        new_quests: [
          '🆕 新しいクエストが利用可能！',
          '📋 今日のクエストをチェック！',
          '🎯 新しいチャレンジが待ってる！'
        ]
      },
      learning: {
        morning: [
          '☀️ おはよう！朝の学習で脳を活性化！',
          '🌅 朝の3分で今日をスタート！',
          '🎵 朝のリズム学習はいかが？'
        ],
        afternoon: [
          '☕ 休憩時間に3分学習！',
          '🎮 午後のリフレッシュに最適！',
          '📚 短時間でも効果的な学習を！'
        ],
        evening: [
          '🌙 夜の学習タイム！',
          '🎯 今日の目標を達成しよう！',
          '✨ 寝る前の復習が効果的！'
        ],
        weekend: [
          '🎉 週末も楽しく学習！',
          '🌈 リラックスしながら学ぼう！',
          '🎮 週末のゲーム学習タイム！'
        ]
      },
      motivational: {
        encouragement: [
          '💪 君ならできる！',
          '🌟 一歩ずつ前進しよう！',
          '🚀 今日も成長のチャンス！'
        ],
        comeback: [
          '😊 おかえり！また会えて嬉しい！',
          '🎯 久しぶり！一緒に頑張ろう！',
          '✨ 戻ってきてくれてありがとう！'
        ]
      }
    }
  }),

  getters: {
    // 通知が有効か
    isNotificationEnabled: (state) => {
      return state.settings.enabled &&
             state.notificationPermission === 'granted'
    },

    // 現在の離脱リスクレベル
    currentRiskLevel: (state) => {
      const risk = state.predictions.churnRisk
      if (risk >= 80) return 'critical'
      if (risk >= 60) return 'high'
      if (risk >= 40) return 'medium'
      if (risk >= 20) return 'low'
      return 'none'
    },

    // 次回の最適通知時間
    nextOptimalTime: (state) => {
      const now = new Date()
      const hour = now.getHours()

      // Quiet hours check
      if (state.settings.quietHours) {
        const { start, end } = state.settings.quietHours
        if (hour >= start || hour < end) {
          // Quiet hours中は翌朝に設定
          const nextTime = new Date()
          nextTime.setHours(end, 0, 0, 0)
          if (nextTime <= now) nextTime.setDate(nextTime.getDate() + 1)
          return nextTime
        }
      }

      // 学習パターンから最適時間を計算
      const dayOfWeek = now.getDay()
      const todayPattern = state.learningPatterns.weeklyActivity[dayOfWeek]

      if (todayPattern && todayPattern.length > 0) {
        // 今日の学習パターンから次の時間を予測
        const futureHours = todayPattern.filter(h => h > hour)
        if (futureHours.length > 0) {
          const nextHour = Math.min(...futureHours)
          const nextTime = new Date()
          nextTime.setHours(nextHour, 0, 0, 0)
          return nextTime
        }
      }

      // デフォルト: 3時間後
      return new Date(now.getTime() + 3 * 60 * 60 * 1000)
    },

    // 今日送信したリマインダー数
    todayReminderCount: (state) => {
      const today = new Date().toDateString()
      return state.sentReminders.filter(r =>
        new Date(r.sentAt).toDateString() === today
      ).length
    }
  },

  actions: {
    // 初期化
    async initializeStore() {
      logger.log('🔔 Initializing reminder store')

      // 通知権限チェック
      await this.checkNotificationPermission()

      // 学習パターンの復元
      this.loadLearningPatterns()

      // 離脱リスク計算
      this.calculateChurnRisk()

      // リマインダースケジュール
      if (this.isNotificationEnabled) {
        this.scheduleSmartReminders()
      }
    },

    // 通知権限チェック
    async checkNotificationPermission() {
      if ('Notification' in window) {
        this.notificationPermission = Notification.permission

        if (Notification.permission === 'default') {
          // 権限がまだ付与されていない場合
          logger.log('📢 Notification permission not granted yet')
        }
      } else {
        logger.warn('Browser does not support notifications')
      }
    },

    // 通知権限リクエスト
    async requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission()
          this.notificationPermission = permission

          if (permission === 'granted') {
            logger.log('✅ Notification permission granted')
            this.scheduleSmartReminders()
            return true
          }
        } catch (error) {
          logger.error('Failed to request notification permission:', error)
        }
      }
      return false
    },

    // 学習パターン記録
    recordActivity(gameId, duration) {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const hour = now.getHours()

      // 曜日別の活動時間を記録
      if (!this.learningPatterns.weeklyActivity[dayOfWeek].includes(hour)) {
        this.learningPatterns.weeklyActivity[dayOfWeek].push(hour)
      }

      // ピーク時間の更新
      this.updatePeakHours(hour)

      // 平均セッション時間の更新
      this.updateAverageSession(duration)

      // 最終活動時刻
      this.learningPatterns.lastActiveTime = now.toISOString()

      // パターン保存
      this.saveLearningPatterns()

      logger.log(`📊 Activity recorded: ${gameId} for ${duration}min at ${hour}:00`)
    },

    // ピーク時間更新
    updatePeakHours(hour) {
      const hourCounts = {}

      // 全曜日の活動時間を集計
      Object.values(this.learningPatterns.weeklyActivity).forEach(hours => {
        hours.forEach(h => {
          hourCounts[h] = (hourCounts[h] || 0) + 1
        })
      })

      // 上位3時間を抽出
      this.learningPatterns.peakHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour))
    },

    // 平均セッション時間更新
    updateAverageSession(duration) {
      const current = this.learningPatterns.averageSessionLength
      if (current === 0) {
        this.learningPatterns.averageSessionLength = duration
      } else {
        // 移動平均
        this.learningPatterns.averageSessionLength =
          (current * 0.7 + duration * 0.3)
      }
    },

    // 離脱リスク計算
    calculateChurnRisk() {
      const streakStore = useStreakStore()
      const questStore = useQuestStore()

      let risk = 0

      // ストリーク状態によるリスク
      if (streakStore.streakStatus === 'at_risk') {
        risk += 40
      } else if (streakStore.streakStatus === 'none') {
        risk += 20
      }

      // 最終活動からの経過時間
      if (this.learningPatterns.lastActiveTime) {
        const hoursSinceActive =
          (Date.now() - new Date(this.learningPatterns.lastActiveTime)) / (1000 * 60 * 60)

        if (hoursSinceActive > 48) risk += 30
        else if (hoursSinceActive > 24) risk += 20
        else if (hoursSinceActive > 12) risk += 10
      }

      // クエスト完了率
      const questProgress = questStore.todayProgress
      if (questProgress.percentage < 30) risk += 15

      // シールドの有無
      if (streakStore.streakShields === 0) risk += 15

      this.predictions.churnRisk = Math.min(100, risk)

      logger.log(`📊 Churn risk calculated: ${risk}%`)

      return risk
    },

    // スマートリマインダースケジュール
    scheduleSmartReminders() {
      // 既存のスケジュールをクリア
      this.clearScheduledReminders()

      const streakStore = useStreakStore()
      const questStore = useQuestStore()

      const reminders = []

      // 1. ストリークリスクベースのリマインダー
      if (streakStore.streakStatus === 'at_risk') {
        const urgentTime = this.getUrgentReminderTime()
        reminders.push({
          id: `streak_${Date.now()}`,
          type: 'streak_risk',
          scheduledFor: urgentTime,
          priority: 'high',
          message: this.generateMessage('streak', 'at_risk', {
            streak: streakStore.currentStreak
          })
        })
      }

      // 2. クエスト進捗ベースのリマインダー
      const questProgress = questStore.todayProgress
      if (questProgress.completed < questProgress.total && questProgress.percentage > 50) {
        const questTime = this.getOptimalQuestReminderTime()
        reminders.push({
          id: `quest_${Date.now()}`,
          type: 'quest_progress',
          scheduledFor: questTime,
          priority: 'medium',
          message: this.generateMessage('quest', 'almost_complete', {
            remaining: questProgress.total - questProgress.completed
          })
        })
      }

      // 3. 学習パターンベースのリマインダー
      if (this.learningPatterns.peakHours.length > 0) {
        const patternTime = this.getPatternBasedReminderTime()
        if (patternTime) {
          reminders.push({
            id: `pattern_${Date.now()}`,
            type: 'learning_pattern',
            scheduledFor: patternTime,
            priority: 'low',
            message: this.generateTimeBasedMessage()
          })
        }
      }

      // 最大数制限
      const maxReminders = Math.min(
        this.settings.maxPerDay - this.todayReminderCount,
        reminders.length
      )

      // 優先度でソートして上位を選択
      this.scheduledReminders = reminders
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
        .slice(0, maxReminders)

      // タイマー設定
      this.scheduledReminders.forEach(reminder => {
        this.setReminderTimer(reminder)
      })

      logger.log(`📅 Scheduled ${this.scheduledReminders.length} smart reminders`)
    },

    // 緊急リマインダー時間
    getUrgentReminderTime() {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      // 今日の終わりまでの75%の時点
      const remainingTime = endOfDay - now
      const urgentTime = new Date(now.getTime() + remainingTime * 0.75)

      // Quiet hours考慮
      const { start, end } = this.settings.quietHours
      const urgentHour = urgentTime.getHours()

      if (urgentHour >= start) {
        // 翌朝に設定
        urgentTime.setDate(urgentTime.getDate() + 1)
        urgentTime.setHours(end, 0, 0, 0)
      }

      return urgentTime
    },

    // クエストリマインダー最適時間
    getOptimalQuestReminderTime() {
      const now = new Date()
      const hour = now.getHours()

      // 午後の最適時間 (14-17時)
      if (hour < 14) {
        const optimalTime = new Date()
        optimalTime.setHours(14, 30, 0, 0)
        return optimalTime
      } else if (hour < 17) {
        // 2時間後
        return new Date(now.getTime() + 2 * 60 * 60 * 1000)
      } else {
        // 明日の午後
        const optimalTime = new Date()
        optimalTime.setDate(optimalTime.getDate() + 1)
        optimalTime.setHours(14, 30, 0, 0)
        return optimalTime
      }
    },

    // パターンベースのリマインダー時間
    getPatternBasedReminderTime() {
      const now = new Date()
      const hour = now.getHours()
      const dayOfWeek = now.getDay()

      // 今日の学習パターン
      const todayPattern = this.learningPatterns.weeklyActivity[dayOfWeek]

      if (todayPattern.length > 0) {
        // 次の予測時間
        const futureHours = todayPattern.filter(h => h > hour)
        if (futureHours.length > 0) {
          const nextHour = Math.min(...futureHours)
          const reminderTime = new Date()
          reminderTime.setHours(nextHour - 1, 45, 0, 0) // 15分前に通知
          return reminderTime
        }
      }

      // ピーク時間から予測
      if (this.learningPatterns.peakHours.length > 0) {
        const nextPeak = this.learningPatterns.peakHours.find(h => h > hour)
        if (nextPeak) {
          const reminderTime = new Date()
          reminderTime.setHours(nextPeak - 1, 45, 0, 0)
          return reminderTime
        }
      }

      return null
    },

    // メッセージ生成
    generateMessage(category, type, params = {}) {
      const templates = this.messageTemplates[category][type]
      if (!templates || templates.length === 0) return ''

      let message = templates[Math.floor(Math.random() * templates.length)]

      // パラメータ置換
      Object.keys(params).forEach(key => {
        message = message.replace(`{${key}}`, params[key])
      })

      return message
    },

    // 時間帯別メッセージ
    generateTimeBasedMessage() {
      const hour = new Date().getHours()
      const day = new Date().getDay()

      // 週末チェック
      if (day === 0 || day === 6) {
        return this.generateMessage('learning', 'weekend')
      }

      // 時間帯別
      if (hour < 12) {
        return this.generateMessage('learning', 'morning')
      } else if (hour < 17) {
        return this.generateMessage('learning', 'afternoon')
      } else {
        return this.generateMessage('learning', 'evening')
      }
    },

    // リマインダータイマー設定
    setReminderTimer(reminder) {
      const now = Date.now()
      const scheduledTime = new Date(reminder.scheduledFor).getTime()
      const delay = scheduledTime - now

      if (delay > 0) {
        setTimeout(() => {
          this.sendReminder(reminder)
        }, delay)

        logger.log(`⏰ Reminder scheduled for ${reminder.scheduledFor}`)
      }
    },

    // リマインダー送信
    async sendReminder(reminder) {
      try {
        if (!this.isNotificationEnabled) {
          logger.warn('Notifications are disabled')
          return
        }

        // ブラウザ通知
        if (this.settings.channels.browser) {
          const notification = new Notification('MovWISE Learning Reminder', {
            body: reminder.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: reminder.id,
            requireInteraction: reminder.priority === 'high',
            vibrate: [200, 100, 200]
          })

          notification.onclick = () => {
            window.focus()
            notification.close()
            // ゲームページへ遷移
            if (reminder.type === 'streak_risk') {
              window.location.href = '/games/rhythm-phonics-mini'
            } else {
              window.location.href = '/home'
            }
          }
        }

        // 送信履歴記録
        this.sentReminders.push({
          ...reminder,
          sentAt: new Date().toISOString()
        })

        // スケジュールから削除
        this.scheduledReminders = this.scheduledReminders.filter(
          r => r.id !== reminder.id
        )

        logger.log(`📤 Reminder sent: ${reminder.type}`)

      } catch (error) {
        logger.error('Failed to send reminder:', error)
      }
    },

    // スケジュール済みリマインダーをクリア
    clearScheduledReminders() {
      // Note: 実際のタイマーキャンセルは
      // より高度な実装が必要（タイマーIDの管理等）
      this.scheduledReminders = []
    },

    // 学習パターン保存
    saveLearningPatterns() {
      try {
        localStorage.setItem(
          'reminder_patterns',
          JSON.stringify(this.learningPatterns)
        )
      } catch (error) {
        logger.error('Failed to save learning patterns:', error)
      }
    },

    // 学習パターン読み込み
    loadLearningPatterns() {
      try {
        const saved = localStorage.getItem('reminder_patterns')
        if (saved) {
          const patterns = JSON.parse(saved)
          this.learningPatterns = { ...this.learningPatterns, ...patterns }
          logger.log('📊 Learning patterns loaded')
        }
      } catch (error) {
        logger.error('Failed to load learning patterns:', error)
      }
    },

    // 設定更新
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings }

      if (this.settings.enabled && this.isNotificationEnabled) {
        this.scheduleSmartReminders()
      } else {
        this.clearScheduledReminders()
      }
    }
  }
}, {
  persist: {
    key: 'reminder-store',
    storage: localStorage,
    paths: ['settings', 'sentReminders']
  }
})