<template>
  <div class="streak-display-container">
    <!-- メインストリーク表示 -->
    <div class="streak-badge" :class="[`streak-${streakStore.streakLevel}`, streakAnimationClass]">
      <!-- 炎のアニメーション -->
      <div class="flame-container">
        <span
          v-for="n in flameCount"
          :key="n"
          class="flame-icon"
          :style="{
            animationDelay: `${n * 0.1}s`,
            fontSize: `${1.5 + (n * 0.1)}rem`
          }"
        >
          🔥
        </span>
      </div>

      <!-- カウンター -->
      <div class="streak-count-container">
        <transition name="count-change" mode="out-in">
          <div :key="streakStore.currentStreak" class="streak-count">
            {{ streakStore.currentStreak }}
          </div>
        </transition>
        <div class="streak-label">日連続</div>
      </div>

      <!-- レベル表示 -->
      <div v-if="streakStore.streakLevel !== 'none'" class="streak-level-badge">
        {{ levelTitles[streakStore.streakLevel] }}
      </div>
    </div>

    <!-- 危機アラート -->
    <transition name="slide-down">
      <div v-if="streakStore.streakStatus === 'at_risk'" class="streak-alert danger">
        <div class="alert-content">
          <span class="alert-icon animate-pulse">⚠️</span>
          <div class="alert-text">
            <div class="alert-title">ストリーク危機！</div>
            <div class="alert-subtitle">
              あと <span class="time-remaining">{{ formattedTimeRemaining }}</span> で途切れます
            </div>
          </div>
          <button @click="$emit('quick-play')" class="quick-play-btn pulse-glow">
            今すぐプレイ
          </button>
        </div>
      </div>
    </transition>

    <!-- 今日の進捗 -->
    <div class="daily-progress-card">
      <div class="progress-header">
        <span class="progress-title">今日の目標</span>
        <span class="progress-count">
          {{ streakStore.dailyGoal.gamesPlayed }}/{{ streakStore.dailyGoal.requiredGames }}
        </span>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :class="{ 'completed': streakStore.dailyGoal.completed }"
            :style="{ width: `${streakStore.todayProgress}%` }"
          >
            <span v-if="streakStore.todayProgress > 0" class="progress-sparkle">✨</span>
          </div>
        </div>
        <div class="progress-markers">
          <span
            v-for="n in streakStore.dailyGoal.requiredGames"
            :key="n"
            class="marker"
            :class="{ 'achieved': n <= streakStore.dailyGoal.gamesPlayed }"
            :style="{ left: `${(n - 1) * (100 / (streakStore.dailyGoal.requiredGames - 1))}%` }"
          ></span>
        </div>
      </div>

      <!-- 完了メッセージ -->
      <transition name="fade">
        <div v-if="streakStore.dailyGoal.completed" class="completion-message">
          <span class="completion-icon">🎉</span>
          今日の目標達成！素晴らしい！
        </div>
      </transition>
    </div>

    <!-- シールドとマイルストーン -->
    <div class="streak-extras">
      <!-- シールド表示 -->
      <div v-if="streakStore.streakShields > 0" class="shield-display">
        <span class="shield-icon">🛡️</span>
        <span class="shield-count">×{{ streakStore.streakShields }}</span>
        <button
          v-if="streakStore.streakStatus === 'at_risk' && !streakStore.freezeUsedToday"
          @click="useShield"
          class="use-shield-btn"
        >
          使用
        </button>
      </div>

      <!-- 次のマイルストーン -->
      <div v-if="streakStore.nextMilestone" class="milestone-preview">
        <div class="milestone-icon">🎯</div>
        <div class="milestone-info">
          <div class="milestone-days">{{ streakStore.nextMilestone }}日まで</div>
          <div class="milestone-remaining">あと{{ streakStore.daysToNextMilestone }}日</div>
        </div>
        <div class="milestone-progress-mini">
          <div
            class="milestone-progress-fill"
            :style="{ width: `${(streakStore.currentStreak / streakStore.nextMilestone) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 週間カレンダー -->
    <div class="week-calendar">
      <div class="calendar-title">今週の学習</div>
      <div class="calendar-days">
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="calendar-day"
          :class="{
            'completed': day.completed,
            'today': day.isToday,
            'protected': day.protected
          }"
        >
          <div class="day-label">{{ day.label }}</div>
          <div class="day-status">
            <span v-if="day.completed">✅</span>
            <span v-else-if="day.protected">🛡️</span>
            <span v-else-if="day.isToday && !streakStore.dailyGoal.completed">⏳</span>
            <span v-else>⬜</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 報酬通知 -->
    <transition name="bounce">
      <div v-if="showRewardNotification" class="reward-notification">
        <div class="reward-content">
          <div class="reward-icon">🏆</div>
          <div class="reward-text">
            <div class="reward-title">{{ currentReward.title }}</div>
            <div class="reward-message">{{ currentReward.message }}</div>
          </div>
          <button @click="claimReward" class="claim-btn">
            受け取る
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStreakStore } from '@/stores/streakStore'
import logger from '@/utils/logger'

const emit = defineEmits(['quick-play', 'reward-claimed'])

const streakStore = useStreakStore()

// リアクティブな状態
const showRewardNotification = ref(false)
const currentReward = ref(null)
const streakAnimationClass = ref('')
const updateTimer = ref(null)

// レベルタイトル
const levelTitles = {
  none: '',
  starter: '火花',
  common: '炎',
  uncommon: '火炎',
  rare: '業火',
  epic: '煉獄',
  legendary: '永遠の炎'
}

// 計算プロパティ
const flameCount = computed(() => {
  const level = streakStore.streakLevel
  const counts = {
    none: 0,
    starter: 1,
    common: 2,
    uncommon: 3,
    rare: 4,
    epic: 5,
    legendary: 7
  }
  return counts[level] || 0
})

const formattedTimeRemaining = computed(() => {
  const ms = streakStore.timeUntilStreakBreak
  if (!ms) return ''

  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  if (hours > 0) {
    return `${hours}時間${minutes}分`
  } else if (minutes > 0) {
    return `${minutes}分${seconds}秒`
  } else {
    return `${seconds}秒`
  }
})

const weekDays = computed(() => {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const today = new Date()
  const currentDay = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - currentDay)

  return days.map((label, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    return {
      label,
      date: dateStr,
      isToday: dateStr === todayStr,
      completed: streakStore.activityCalendar[dateStr]?.completed || false,
      protected: streakStore.activityCalendar[dateStr]?.shieldUsed || false
    }
  })
})

// メソッド
const useShield = () => {
  if (streakStore.useStreakShield(true)) {
    logger.log('Shield used successfully')
    // アニメーション
    streakAnimationClass.value = 'shield-animation'
    setTimeout(() => {
      streakAnimationClass.value = ''
    }, 1000)
  }
}

const checkForRewards = () => {
  const pendingRewards = streakStore.pendingRewards.filter(r => !r.claimed)
  if (pendingRewards.length > 0 && !showRewardNotification.value) {
    currentReward.value = pendingRewards[0].reward
    showRewardNotification.value = true
  }
}

const claimReward = () => {
  const pendingRewards = streakStore.pendingRewards.filter(r => !r.claimed)
  if (pendingRewards.length > 0) {
    const reward = streakStore.claimReward(0)
    emit('reward-claimed', reward)
    showRewardNotification.value = false

    // 次の報酬をチェック
    setTimeout(checkForRewards, 500)
  }
}

// ウォッチャー
watch(() => streakStore.currentStreak, (newVal, oldVal) => {
  if (newVal > oldVal) {
    // ストリーク増加アニメーション
    streakAnimationClass.value = 'streak-increase'
    setTimeout(() => {
      streakAnimationClass.value = ''
    }, 1000)

    // 報酬チェック
    setTimeout(checkForRewards, 1500)
  }
})

watch(() => streakStore.dailyGoal.completed, (completed) => {
  if (completed) {
    // 目標達成アニメーション
    streakAnimationClass.value = 'goal-complete'
    setTimeout(() => {
      streakAnimationClass.value = ''
    }, 2000)
  }
})

// ライフサイクル
onMounted(() => {
  // ストア初期化
  streakStore.initializeStore()

  // 報酬チェック
  checkForRewards()

  // 1秒ごとに残り時間を更新
  updateTimer.value = setInterval(() => {
    // 残り時間の更新はcomputedで自動的に行われる
    if (streakStore.streakStatus === 'at_risk' && streakStore.timeUntilStreakBreak < 3600000) {
      // 1時間を切ったら更新頻度を上げる
      // ここで必要に応じて警告を表示
    }
  }, 1000)

  logger.log('StreakDisplay mounted', {
    currentStreak: streakStore.currentStreak,
    status: streakStore.streakStatus
  })
})

onUnmounted(() => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value)
  }
})
</script>

<style scoped>
.streak-display-container {
  --primary-color: #6b46c1;
  --danger-color: #ef4444;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --bg-dark: #1e1b4b;
  --bg-card: rgba(30, 27, 75, 0.8);

  padding: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

/* メインストリークバッジ */
.streak-badge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--primary-color) 100%);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(107, 70, 193, 0.3);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.streak-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(107, 70, 193, 0.4);
}

/* 炎のアニメーション */
.flame-container {
  position: absolute;
  top: -20px;
  display: flex;
  gap: 0.2rem;
}

.flame-icon {
  animation: flame-flicker 1.5s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 100, 0, 0.8));
}

@keyframes flame-flicker {
  0%, 100% { transform: scale(1) translateY(0); }
  25% { transform: scale(1.1) translateY(-3px); }
  75% { transform: scale(0.95) translateY(2px); }
}

/* ストリークカウント */
.streak-count-container {
  text-align: center;
  color: white;
}

.streak-count {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.streak-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* レベルバッジ */
.streak-level-badge {
  position: absolute;
  bottom: -10px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

/* レベル別スタイル */
.streak-legendary {
  background: linear-gradient(135deg, #a855f7, #6b46c1, #312e81);
  animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% { box-shadow: 0 10px 30px rgba(168, 85, 247, 0.5); }
  50% { box-shadow: 0 15px 50px rgba(168, 85, 247, 0.8); }
}

/* 危機アラート */
.streak-alert {
  background: linear-gradient(135deg, var(--danger-color), #dc2626);
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  animation: alert-pulse 2s ease-in-out infinite;
}

@keyframes alert-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-weight: bold;
  font-size: 0.9rem;
}

.alert-subtitle {
  font-size: 0.8rem;
  opacity: 0.9;
}

.time-remaining {
  font-weight: bold;
  color: #fef3c7;
}

.quick-play-btn {
  padding: 0.5rem 1rem;
  background: white;
  color: var(--danger-color);
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.pulse-glow {
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); }
}

/* デイリー進捗 */
.daily-progress-card {
  background: var(--bg-card);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(107, 70, 193, 0.2);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: white;
}

.progress-title {
  font-weight: 600;
}

.progress-count {
  font-weight: bold;
  color: var(--warning-color);
}

.progress-bar-container {
  position: relative;
}

.progress-bar {
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--warning-color));
  border-radius: 12px;
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
}

.progress-fill.completed {
  background: linear-gradient(90deg, var(--success-color), #34d399);
  animation: complete-pulse 1s ease;
}

@keyframes complete-pulse {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.02); }
}

.progress-sparkle {
  animation: sparkle 1s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.progress-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s;
}

.marker.achieved {
  background: white;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* 完了メッセージ */
.completion-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--success-color), #34d399);
  color: white;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: bold;
  animation: fade-in 0.5s ease;
}

/* 週間カレンダー */
.week-calendar {
  background: var(--bg-card);
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(107, 70, 193, 0.2);
}

.calendar-title {
  color: white;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-align: center;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  text-align: center;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.calendar-day.today {
  background: rgba(107, 70, 193, 0.2);
  border: 1px solid var(--primary-color);
}

.calendar-day.completed {
  background: rgba(16, 185, 129, 0.2);
}

.day-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.day-status {
  font-size: 1.2rem;
}

/* エクストラ */
.streak-extras {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.shield-display,
.milestone-preview {
  flex: 1;
  background: var(--bg-card);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(107, 70, 193, 0.2);
  color: white;
}

.shield-icon {
  font-size: 1.5rem;
}

.shield-count {
  font-weight: bold;
}

.use-shield-btn {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.milestone-icon {
  font-size: 1.5rem;
}

.milestone-info {
  flex: 1;
}

.milestone-days {
  font-weight: bold;
  font-size: 0.9rem;
}

.milestone-remaining {
  font-size: 0.75rem;
  opacity: 0.8;
}

.milestone-progress-mini {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0 0 0.75rem 0.75rem;
  overflow: hidden;
}

.milestone-progress-fill {
  height: 100%;
  background: var(--warning-color);
  transition: width 0.5s ease;
}

/* 報酬通知 */
.reward-notification {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 400px;
}

.reward-content {
  text-align: center;
}

.reward-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reward-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.reward-message {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.claim-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(107, 70, 193, 0.4);
}

/* アニメーション */
.streak-increase {
  animation: increase-bounce 0.5s ease;
}

@keyframes increase-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.goal-complete {
  animation: complete-celebration 1s ease;
}

@keyframes complete-celebration {
  0%, 100% { transform: scale(1) rotate(0); }
  25% { transform: scale(1.05) rotate(-2deg); }
  75% { transform: scale(1.05) rotate(2deg); }
}

.shield-animation {
  animation: shield-activate 1s ease;
}

@keyframes shield-activate {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.5) hue-rotate(180deg); }
  100% { filter: brightness(1); }
}

/* トランジション */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s ease;
}

.bounce-leave-active {
  animation: bounce-out 0.5s ease;
}

@keyframes bounce-in {
  0% { transform: translate(-50%, -50%) scale(0); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes bounce-out {
  0% { transform: translate(-50%, -50%) scale(1); }
  100% { transform: translate(-50%, -50%) scale(0); }
}

.count-change-enter-active,
.count-change-leave-active {
  transition: all 0.3s ease;
}

.count-change-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.count-change-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* レスポンシブ */
@media (max-width: 640px) {
  .streak-display-container {
    padding: 0.5rem;
  }

  .streak-badge {
    padding: 1.5rem;
  }

  .streak-count {
    font-size: 2.5rem;
  }

  .reward-notification {
    width: 90%;
    padding: 1.5rem;
  }
}
</style>