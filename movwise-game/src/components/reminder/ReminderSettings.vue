<template>
  <div class="reminder-settings">
    <!-- ヘッダー -->
    <div class="settings-header">
      <h3>🔔 スマートリマインダー設定</h3>
      <div class="toggle-main">
        <label class="toggle-switch">
          <input
            type="checkbox"
            v-model="settings.enabled"
            @change="updateSettings"
          />
          <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">{{ settings.enabled ? 'ON' : 'OFF' }}</span>
      </div>
    </div>

    <!-- 通知権限セクション -->
    <div class="permission-section" v-if="settings.enabled">
      <div class="permission-status" :class="permissionClass">
        <span class="status-icon">{{ permissionIcon }}</span>
        <span class="status-text">{{ permissionText }}</span>
      </div>
      <button
        v-if="notificationPermission === 'default'"
        @click="requestPermission"
        class="permission-btn"
      >
        通知を許可する
      </button>
      <button
        v-if="notificationPermission === 'granted'"
        @click="sendTestNotification"
        class="test-btn"
      >
        テスト通知を送信
      </button>
    </div>

    <!-- 詳細設定 -->
    <div class="settings-content" v-if="settings.enabled && notificationPermission === 'granted'">
      <!-- 通知チャンネル -->
      <div class="setting-group">
        <h4>通知方法</h4>
        <div class="channel-options">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="settings.channels.browser"
              @change="updateSettings"
            />
            <span>ブラウザ通知</span>
          </label>
          <label class="checkbox-label disabled">
            <input
              type="checkbox"
              v-model="settings.channels.email"
              disabled
            />
            <span>メール (Coming Soon)</span>
          </label>
          <label class="checkbox-label disabled">
            <input
              type="checkbox"
              v-model="settings.channels.push"
              disabled
            />
            <span>プッシュ通知 (Coming Soon)</span>
          </label>
        </div>
      </div>

      <!-- スマートタイミング -->
      <div class="setting-group">
        <h4>スマートタイミング</h4>
        <label class="toggle-setting">
          <input
            type="checkbox"
            v-model="settings.smartTiming"
            @change="updateSettings"
          />
          <span>学習パターンに基づく最適化</span>
        </label>
        <p class="setting-description">
          あなたの学習習慣を分析して、最適なタイミングで通知します
        </p>
      </div>

      <!-- 静音時間 -->
      <div class="setting-group">
        <h4>静音時間</h4>
        <div class="quiet-hours">
          <div class="time-input">
            <label>開始:</label>
            <select v-model.number="settings.quietHours.start" @change="updateSettings">
              <option v-for="h in 24" :key="h" :value="h-1">
                {{ String(h-1).padStart(2, '0') }}:00
              </option>
            </select>
          </div>
          <div class="time-input">
            <label>終了:</label>
            <select v-model.number="settings.quietHours.end" @change="updateSettings">
              <option v-for="h in 24" :key="h" :value="h-1">
                {{ String(h-1).padStart(2, '0') }}:00
              </option>
            </select>
          </div>
        </div>
        <p class="setting-description">
          この時間帯は通知を送信しません
        </p>
      </div>

      <!-- 1日の最大通知数 -->
      <div class="setting-group">
        <h4>通知頻度</h4>
        <div class="frequency-control">
          <label>1日の最大通知数:</label>
          <select v-model.number="settings.maxPerDay" @change="updateSettings">
            <option :value="1">1回</option>
            <option :value="2">2回</option>
            <option :value="3">3回</option>
            <option :value="5">5回</option>
          </select>
        </div>
      </div>

      <!-- 学習パターン分析 -->
      <div class="setting-group">
        <h4>学習パターン分析</h4>
        <div class="pattern-analysis">
          <div class="analysis-card">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <div class="card-title">離脱リスク</div>
              <div class="card-value" :class="'risk-' + currentRiskLevel">
                {{ churnRiskText }}
              </div>
            </div>
          </div>
          <div class="analysis-card">
            <div class="card-icon">⏰</div>
            <div class="card-content">
              <div class="card-title">最適時間</div>
              <div class="card-value">{{ nextOptimalTimeText }}</div>
            </div>
          </div>
          <div class="analysis-card">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <div class="card-title">今日の通知</div>
              <div class="card-value">{{ todayReminderCount }}回</div>
            </div>
          </div>
        </div>
      </div>

      <!-- スケジュール済みリマインダー -->
      <div class="setting-group" v-if="scheduledReminders.length > 0">
        <h4>予定されている通知</h4>
        <div class="scheduled-list">
          <div
            v-for="reminder in scheduledReminders"
            :key="reminder.id"
            class="scheduled-item"
          >
            <span class="reminder-time">{{ formatTime(reminder.scheduledFor) }}</span>
            <span class="reminder-type">{{ getReminderTypeLabel(reminder.type) }}</span>
            <span class="reminder-priority" :class="'priority-' + reminder.priority">
              {{ reminder.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useReminderStore } from '@/stores/reminderStore'
import { useNotification } from '@/services/notificationService'
import logger from '@/utils/logger'

const reminderStore = useReminderStore()
const { requestPermission, sendTestNotification: sendTest, updateSettings: updateService } = useNotification()

// リアクティブデータ
const settings = ref({ ...reminderStore.settings })
const notificationPermission = computed(() => reminderStore.notificationPermission)
const currentRiskLevel = computed(() => reminderStore.currentRiskLevel)
const nextOptimalTime = computed(() => reminderStore.nextOptimalTime)
const todayReminderCount = computed(() => reminderStore.todayReminderCount)
const scheduledReminders = computed(() => reminderStore.scheduledReminders)
const churnRisk = computed(() => reminderStore.predictions.churnRisk)

// 計算プロパティ
const permissionClass = computed(() => {
  switch (notificationPermission.value) {
    case 'granted': return 'permission-granted'
    case 'denied': return 'permission-denied'
    default: return 'permission-default'
  }
})

const permissionIcon = computed(() => {
  switch (notificationPermission.value) {
    case 'granted': return '✅'
    case 'denied': return '❌'
    default: return '❓'
  }
})

const permissionText = computed(() => {
  switch (notificationPermission.value) {
    case 'granted': return '通知が有効です'
    case 'denied': return '通知がブロックされています'
    default: return '通知権限が必要です'
  }
})

const churnRiskText = computed(() => {
  const risk = churnRisk.value
  if (risk >= 80) return `${risk}% (危険)`
  if (risk >= 60) return `${risk}% (高)`
  if (risk >= 40) return `${risk}% (中)`
  if (risk >= 20) return `${risk}% (低)`
  return `${risk}% (なし)`
})

const nextOptimalTimeText = computed(() => {
  const time = nextOptimalTime.value
  if (!time) return '未定'

  const now = new Date()
  const diff = time - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}時間${minutes}分後`
  } else if (minutes > 0) {
    return `${minutes}分後`
  } else {
    return '間もなく'
  }
})

// メソッド
const updateSettings = () => {
  reminderStore.updateSettings(settings.value)
  updateService(settings.value)
  logger.log('⚙️ Reminder settings updated')
}

const requestNotificationPermission = async () => {
  const granted = await requestPermission()
  if (granted) {
    logger.log('✅ Notification permission granted')
  }
}

const sendTestNotification = async () => {
  const success = await sendTest('これはテスト通知です。正常に動作しています！')
  if (success) {
    logger.log('📤 Test notification sent')
  }
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

const getReminderTypeLabel = (type) => {
  const labels = {
    'streak_risk': 'ストリーク警告',
    'quest_progress': 'クエスト進捗',
    'learning_pattern': '学習時間',
    'custom': 'カスタム'
  }
  return labels[type] || type
}

// ライフサイクル
onMounted(() => {
  // ストア初期化
  reminderStore.initializeStore()
  logger.log('🔔 Reminder settings component mounted')
})

// 設定の変更を監視
watch(() => reminderStore.settings, (newSettings) => {
  settings.value = { ...newSettings }
}, { deep: true })
</script>

<style scoped>
.reminder-settings {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

/* ヘッダー */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #2d3748;
}

.toggle-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #48bb78;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.toggle-label {
  font-weight: bold;
  color: #4a5568;
}

/* 権限セクション */
.permission-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.permission-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.permission-status.permission-granted {
  color: #48bb78;
}

.permission-status.permission-denied {
  color: #f56565;
}

.permission-status.permission-default {
  color: #ed8936;
}

.status-icon {
  font-size: 1.2rem;
}

.permission-btn, .test-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.permission-btn:hover, .test-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 設定グループ */
.setting-group {
  margin-bottom: 2rem;
}

.setting-group h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.setting-description {
  margin: 0.5rem 0 0 0;
  color: #718096;
  font-size: 0.9rem;
}

/* チャンネルオプション */
.channel-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  color: #4a5568;
}

/* トグル設定 */
.toggle-setting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-setting input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 静音時間 */
.quiet-hours {
  display: flex;
  gap: 2rem;
  margin-bottom: 0.5rem;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input label {
  color: #4a5568;
  font-weight: 500;
}

.time-input select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

/* 頻度コントロール */
.frequency-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.frequency-control label {
  color: #4a5568;
  font-weight: 500;
}

.frequency-control select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

/* パターン分析 */
.pattern-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.analysis-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.card-icon {
  font-size: 2rem;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2d3748;
}

.card-value.risk-critical {
  color: #f56565;
}

.card-value.risk-high {
  color: #ed8936;
}

.card-value.risk-medium {
  color: #f6ad55;
}

.card-value.risk-low {
  color: #48bb78;
}

.card-value.risk-none {
  color: #38a169;
}

/* スケジュール済みリマインダー */
.scheduled-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scheduled-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.reminder-time {
  font-weight: bold;
  color: #2d3748;
  min-width: 60px;
}

.reminder-type {
  flex: 1;
  color: #4a5568;
}

.reminder-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high {
  background: #fed7d7;
  color: #c53030;
}

.priority-medium {
  background: #feebc8;
  color: #c05621;
}

.priority-low {
  background: #c6f6d5;
  color: #276749;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .reminder-settings {
    padding: 1rem;
  }

  .quiet-hours {
    flex-direction: column;
    gap: 1rem;
  }

  .pattern-analysis {
    grid-template-columns: 1fr;
  }
}
</style>