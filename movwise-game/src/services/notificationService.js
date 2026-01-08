// src/services/notificationService.js - 通知サービス
import { useReminderStore } from '@/stores/reminderStore'
import logger from '@/utils/logger'

class NotificationService {
  constructor() {
    this.reminderStore = null
    this.serviceWorkerRegistration = null
    this.activeTimers = new Map()
    this.initialized = false
  }

  // 初期化
  async initialize() {
    if (this.initialized) return

    logger.log('🔔 Initializing notification service')

    // Service Worker登録（PWA対応）
    await this.registerServiceWorker()

    // ストア初期化
    this.reminderStore = useReminderStore()
    await this.reminderStore.initializeStore()

    // ページ表示/非表示イベント
    this.setupVisibilityHandlers()

    // アクティビティ追跡
    this.setupActivityTracking()

    this.initialized = true
    logger.log('✅ Notification service initialized')
  }

  // Service Worker登録
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // 既存のservice workerを確認
        const registrations = await navigator.serviceWorker.getRegistrations()
        if (registrations.length > 0) {
          this.serviceWorkerRegistration = registrations[0]
          logger.log('📱 Using existing service worker')
        } else {
          // 新規登録が必要な場合（将来的な実装）
          logger.log('ℹ️ No service worker found, skipping registration')
        }
      } catch (error) {
        logger.warn('Service Worker registration not available:', error)
      }
    }
  }

  // ページ表示状態ハンドラー
  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // ページが表示された時
        this.onPageVisible()
      } else {
        // ページが隠れた時
        this.onPageHidden()
      }
    })

    // ウィンドウフォーカス
    window.addEventListener('focus', () => {
      this.onWindowFocus()
    })

    window.addEventListener('blur', () => {
      this.onWindowBlur()
    })
  }

  // アクティビティ追跡
  setupActivityTracking() {
    // マウス移動、クリック、キー入力を追跡
    let lastActivity = Date.now()
    let activityTimer = null

    const trackActivity = () => {
      lastActivity = Date.now()

      // 5分間隔でアクティビティを記録
      if (!activityTimer) {
        activityTimer = setTimeout(() => {
          if (this.reminderStore) {
            const duration = Math.floor((Date.now() - lastActivity) / 60000)
            this.reminderStore.recordActivity('web_session', duration)
          }
          activityTimer = null
        }, 5 * 60 * 1000)
      }
    }

    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true })
    })
  }

  // ページ表示時の処理
  onPageVisible() {
    logger.log('👁️ Page became visible')

    // リマインダーの再スケジュール
    if (this.reminderStore && this.reminderStore.isNotificationEnabled) {
      this.reminderStore.scheduleSmartReminders()
    }
  }

  // ページ非表示時の処理
  onPageHidden() {
    logger.log('👁️ Page became hidden')

    // アクティビティ記録
    if (this.reminderStore) {
      this.reminderStore.recordActivity('page_hidden', 0)
    }
  }

  // ウィンドウフォーカス時
  onWindowFocus() {
    // 通知をクリアする可能性がある処理
    this.clearActiveNotifications()
  }

  // ウィンドウブラー時
  onWindowBlur() {
    // 特に処理なし
  }

  // 通知権限リクエスト（UIから呼び出し）
  async requestPermission() {
    if (!this.reminderStore) {
      await this.initialize()
    }

    return await this.reminderStore.requestNotificationPermission()
  }

  // 即座に通知を送信（テスト用）
  async sendTestNotification(message = 'テスト通知です！') {
    if (!('Notification' in window)) {
      logger.error('このブラウザは通知をサポートしていません')
      return false
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        logger.warn('通知権限が付与されませんでした')
        return false
      }
    }

    try {
      const notification = new Notification('MovWISE テスト通知', {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        vibrate: [200, 100, 200]
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      logger.log('✅ テスト通知を送信しました')
      return true
    } catch (error) {
      logger.error('通知送信エラー:', error)
      return false
    }
  }

  // カスタムリマインダー送信
  async sendCustomReminder(type, message, options = {}) {
    if (!this.reminderStore || !this.reminderStore.isNotificationEnabled) {
      logger.warn('通知が無効です')
      return false
    }

    const reminder = {
      id: `custom_${Date.now()}`,
      type,
      message,
      priority: options.priority || 'medium',
      scheduledFor: new Date(),
      ...options
    }

    await this.reminderStore.sendReminder(reminder)
    return true
  }

  // スケジュールリマインダー設定
  scheduleReminder(reminder, delay) {
    // 既存のタイマーをキャンセル
    if (this.activeTimers.has(reminder.id)) {
      clearTimeout(this.activeTimers.get(reminder.id))
    }

    // 新しいタイマー設定
    const timerId = setTimeout(async () => {
      await this.reminderStore.sendReminder(reminder)
      this.activeTimers.delete(reminder.id)
    }, delay)

    this.activeTimers.set(reminder.id, timerId)

    logger.log(`⏰ Reminder ${reminder.id} scheduled for ${delay}ms later`)
  }

  // 全てのスケジュール済みリマインダーをキャンセル
  cancelAllScheduled() {
    this.activeTimers.forEach((timerId, reminderId) => {
      clearTimeout(timerId)
      logger.log(`❌ Cancelled reminder ${reminderId}`)
    })
    this.activeTimers.clear()
  }

  // アクティブな通知をクリア
  async clearActiveNotifications() {
    if ('getNotifications' in ServiceWorkerRegistration.prototype) {
      try {
        if (this.serviceWorkerRegistration) {
          const notifications = await this.serviceWorkerRegistration.getNotifications()
          notifications.forEach(notification => notification.close())
          logger.log(`🧹 Cleared ${notifications.length} active notifications`)
        }
      } catch (error) {
        logger.error('Failed to clear notifications:', error)
      }
    }
  }

  // 設定更新
  updateSettings(settings) {
    if (this.reminderStore) {
      this.reminderStore.updateSettings(settings)
    }
  }

  // クリーンアップ
  cleanup() {
    this.cancelAllScheduled()
    this.initialized = false
  }
}

// シングルトンインスタンス
const notificationService = new NotificationService()

// エクスポート
export default notificationService

// Vue用のプラグイン
export const NotificationPlugin = {
  install(app) {
    app.config.globalProperties.$notification = notificationService
    app.provide('notificationService', notificationService)
  }
}

// Composable
import { inject, onMounted, onUnmounted } from 'vue'

export function useNotification() {
  const service = inject('notificationService', notificationService)

  onMounted(async () => {
    await service.initialize()
  })

  onUnmounted(() => {
    // 必要に応じてクリーンアップ
  })

  return {
    requestPermission: () => service.requestPermission(),
    sendTestNotification: (message) => service.sendTestNotification(message),
    sendCustomReminder: (type, message, options) =>
      service.sendCustomReminder(type, message, options),
    updateSettings: (settings) => service.updateSettings(settings),
    isInitialized: () => service.initialized
  }
}