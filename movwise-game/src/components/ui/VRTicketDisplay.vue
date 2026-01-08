<template>
  <div class="vr-ticket-container">
    <!-- メインチケット表示 -->
    <div
      class="ticket-display"
      @click="showDetails = !showDetails"
      :class="{ 'expanded': showDetails }"
    >
      <div class="ticket-icon">
        <span class="icon-emoji">🎫</span>
        <div v-if="recentlyEarned > 0" class="earn-animation">
          +{{ recentlyEarned }}
        </div>
      </div>
      <div class="ticket-count">
        <span class="count-number">{{ animatedCount }}</span>
        <span class="count-label">VRチケット</span>
      </div>
    </div>

    <!-- 詳細パネル -->
    <transition name="slide-down">
      <div v-if="showDetails" class="details-panel">
        <!-- 統計情報 -->
        <div class="stats-section">
          <h3 class="section-title">📊 チケット統計</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">今日の獲得</span>
              <span class="stat-value">{{ ticketStore.todayEarned }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">累計獲得</span>
              <span class="stat-value">{{ ticketStore.totalEarned }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">累計使用</span>
              <span class="stat-value">{{ ticketStore.totalUsed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">連続ログイン</span>
              <span class="stat-value">{{ ticketStore.consecutiveLogins }}日</span>
            </div>
          </div>
        </div>

        <!-- 利用可能な特典 -->
        <div class="rewards-section">
          <h3 class="section-title">🎁 利用可能な特典</h3>
          <div class="rewards-list">
            <div
              v-for="reward in availableRewards"
              :key="reward.id"
              class="reward-item"
              :class="{ 'affordable': ticketStore.canAfford(reward.cost), 'locked': !isRewardAvailable(reward) }"
              @click="purchaseReward(reward)"
            >
              <div class="reward-icon">{{ reward.icon }}</div>
              <div class="reward-info">
                <div class="reward-name">{{ reward.name }}</div>
                <div class="reward-description">{{ reward.description }}</div>
              </div>
              <div class="reward-cost">
                <span class="cost-number">{{ reward.cost }}</span>
                <span class="cost-label">枚</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近の履歴 -->
        <div class="history-section">
          <h3 class="section-title">📜 最近の履歴</h3>
          <div class="history-list">
            <div
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              class="history-item"
              :class="transaction.type"
            >
              <div class="history-icon">
                {{ transaction.type === 'earn' ? '➕' : '➖' }}
              </div>
              <div class="history-info">
                <div class="history-reason">{{ getReasonText(transaction.reason) }}</div>
                <div class="history-time">{{ formatTime(transaction.timestamp) }}</div>
              </div>
              <div class="history-amount" :class="transaction.type">
                {{ transaction.type === 'earn' ? '+' : '-' }}{{ transaction.amount }}
              </div>
            </div>
          </div>
        </div>

        <!-- デバッグ機能（開発環境のみ） -->
        <div v-if="isDev" class="debug-section">
          <h3 class="section-title">🛠️ デバッグ</h3>
          <div class="debug-buttons">
            <button @click="addDebugTickets(5)" class="debug-btn">+5枚追加</button>
            <button @click="addDebugTickets(10)" class="debug-btn">+10枚追加</button>
            <button @click="resetTickets" class="debug-btn danger">リセット</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 獲得アニメーション用のパーティクル -->
    <div v-if="showParticles" class="particles-container">
      <div
        v-for="i in 10"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      >
        ✨
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTicketStore } from '@/stores/ticketStore'
import { useUserStore } from '@/stores/userStore'

// ストア
const ticketStore = useTicketStore()
const userStore = useUserStore()

// リアクティブ変数
const showDetails = ref(false)
const animatedCount = ref(0)
const recentlyEarned = ref(0)
const showParticles = ref(false)

// 環境変数
const isDev = import.meta.env.DEV

// 計算プロパティ
const availableRewards = computed(() =>
  ticketStore.availableRewards.filter(r =>
    !r.unlockLevel || (userStore.stats?.level || 1) >= r.unlockLevel
  )
)

const recentTransactions = computed(() =>
  ticketStore.recentTransactions.slice(0, 5)
)

// メソッド
function isRewardAvailable(reward: any) {
  if (reward.unlockLevel && (userStore.stats?.level || 1) < reward.unlockLevel) {
    return false
  }
  return reward.available
}

function purchaseReward(reward: any) {
  if (!isRewardAvailable(reward)) {
    alert(`この特典はレベル${reward.unlockLevel}で解放されます`)
    return
  }

  if (!ticketStore.canAfford(reward.cost)) {
    alert(`チケットが不足しています。必要: ${reward.cost}枚`)
    return
  }

  if (confirm(`${reward.name}を${reward.cost}枚のチケットと交換しますか？`)) {
    ticketStore.purchaseReward(reward.id)
  }
}

function getReasonText(reason: string): string {
  const reasonMap: Record<string, string> = {
    login_bonus: 'ログインボーナス',
    game_clear: 'ゲームクリア',
    streak_bonus: '連続正解ボーナス',
    mission_complete: 'ミッション完了',
    level_up: 'レベルアップ',
    achievement: 'アチーブメント達成',
    daily_challenge: 'デイリーチャレンジ',
    vr_session: 'VRセッション利用',
    avatar_unlock: 'アバター解放',
    bonus_game: 'ボーナスゲーム',
    hint_purchase: 'ヒント購入',
    debug_add: 'デバッグ追加'
  }
  return reasonMap[reason] || reason
}

function formatTime(timestamp: Date | string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'たった今'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`

  return date.toLocaleDateString('ja-JP')
}

function getParticleStyle(index: number) {
  const angle = (360 / 10) * index
  const distance = 50 + Math.random() * 50
  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance
  const duration = 0.5 + Math.random() * 0.5

  return {
    '--x': `${x}px`,
    '--y': `${y}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${index * 0.05}s`
  }
}

// デバッグメソッド
function addDebugTickets(amount: number) {
  ticketStore.addDebugTickets(amount)
}

function resetTickets() {
  if (confirm('本当にチケットをリセットしますか？')) {
    ticketStore.resetTickets()
  }
}

// チケット獲得時のアニメーション
function handleTicketEarned(event: CustomEvent) {
  const { amount } = event.detail
  recentlyEarned.value = amount
  showParticles.value = true

  setTimeout(() => {
    recentlyEarned.value = 0
    showParticles.value = false
  }, 2000)
}

// カウントアニメーション
watch(() => ticketStore.currentTickets, (newVal, oldVal) => {
  const diff = newVal - oldVal
  const duration = 500
  const steps = 20
  const stepValue = diff / steps
  const stepDuration = duration / steps

  for (let i = 0; i <= steps; i++) {
    setTimeout(() => {
      animatedCount.value = Math.round(oldVal + stepValue * i)
    }, stepDuration * i)
  }
})

// ライフサイクル
onMounted(async () => {
  await ticketStore.initialize()
  animatedCount.value = ticketStore.currentTickets

  // イベントリスナー登録
  window.addEventListener('ticket-earned', handleTicketEarned as any)
})

onUnmounted(() => {
  window.removeEventListener('ticket-earned', handleTicketEarned as any)
})
</script>

<style scoped>
.vr-ticket-container {
  position: relative;
  user-select: none;
}

.ticket-display {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(88, 28, 135, 0.2) 100%);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.ticket-display:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(88, 28, 135, 0.3) 100%);
  border-color: rgba(139, 92, 246, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.ticket-display.expanded {
  border-radius: 20px 20px 0 0;
}

.ticket-icon {
  position: relative;
  font-size: 28px;
}

.earn-animation {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  animation: bounce 0.5s ease;
}

.ticket-count {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.count-number {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.count-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.details-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-top: none;
  border-radius: 0 0 20px 20px;
  padding: 20px;
  z-index: 1000;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.rewards-section {
  margin-bottom: 20px;
}

.rewards-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reward-item.affordable:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateX(4px);
}

.reward-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.reward-icon {
  font-size: 24px;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}

.reward-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.reward-cost {
  text-align: center;
}

.cost-number {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
}

.cost-label {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.history-section {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 8px;
}

.history-icon {
  font-size: 16px;
}

.history-info {
  flex: 1;
}

.history-reason {
  font-size: 13px;
  color: white;
}

.history-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.history-amount {
  font-size: 16px;
  font-weight: bold;
}

.history-amount.earn {
  color: #10b981;
}

.history-amount.use {
  color: #ef4444;
}

.debug-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-buttons {
  display: flex;
  gap: 8px;
}

.debug-btn {
  flex: 1;
  padding: 8px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.debug-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

.debug-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.debug-btn.danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  z-index: 1001;
}

.particle {
  position: absolute;
  animation: particleBurst 1s ease-out forwards;
  font-size: 20px;
}

@keyframes particleBurst {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) scale(1.5);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* スクロールバーのスタイリング */
.details-panel::-webkit-scrollbar {
  width: 6px;
}

.details-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

.details-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}
</style>