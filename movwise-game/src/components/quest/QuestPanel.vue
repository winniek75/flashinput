<template>
  <div class="quest-panel" :class="{ 'minimized': isMinimized }">
    <!-- ヘッダー -->
    <div class="quest-header" @click="toggleMinimize">
      <div class="header-left">
        <span class="quest-icon">🎯</span>
        <h3 class="quest-title">デイリークエスト</h3>
        <div class="progress-indicator">
          {{ questProgress.completed }}/{{ questProgress.total }}
        </div>
      </div>
      <button class="minimize-btn" :class="{ 'rotated': isMinimized }">
        ▲
      </button>
    </div>

    <!-- プログレスバー -->
    <div class="progress-section" v-if="!isMinimized">
      <div class="progress-bar-container">
        <div
          class="progress-bar"
          :style="{ width: questProgress.percentage + '%' }"
        ></div>
      </div>
      <div class="progress-text">
        {{ questProgress.percentage.toFixed(0) }}% 完了
      </div>
    </div>

    <!-- クエストリスト -->
    <div class="quest-content" v-if="!isMinimized">
      <div class="quest-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'daily' }"
          @click="activeTab = 'daily'"
        >
          デイリー
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'weekly' }"
          @click="activeTab = 'weekly'"
        >
          ウィークリー
        </button>
      </div>

      <!-- デイリークエスト -->
      <div v-if="activeTab === 'daily'" class="quest-list">
        <div
          v-for="quest in dailyQuests"
          :key="quest.id"
          class="quest-item"
          :class="{
            completed: quest.completed,
            'reward-available': quest.completed && !quest.rewardClaimed
          }"
        >
          <div class="quest-icon-large">{{ quest.icon }}</div>

          <div class="quest-details">
            <h4 class="quest-name">{{ formatQuestTitle(quest) }}</h4>
            <p class="quest-description">{{ formatQuestDescription(quest) }}</p>

            <!-- プログレス -->
            <div class="quest-progress">
              <div class="progress-bar-mini">
                <div
                  class="progress-fill"
                  :style="{ width: (quest.progress / quest.target * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-numbers">
                {{ Math.min(quest.progress, quest.target) }}/{{ quest.target }}
              </span>
            </div>

            <!-- 報酬表示 -->
            <div class="quest-rewards">
              <span v-if="quest.reward.exp" class="reward-item">
                ⭐ {{ quest.reward.exp }}
              </span>
              <span v-if="quest.reward.gems" class="reward-item">
                💎 {{ quest.reward.gems }}
              </span>
              <span v-if="quest.reward.streakShield" class="reward-item">
                🛡️ {{ quest.reward.streakShield }}
              </span>
            </div>
          </div>

          <!-- ステータス -->
          <div class="quest-status">
            <button
              v-if="quest.completed && !quest.rewardClaimed"
              @click="claimReward(quest.id)"
              class="claim-btn"
            >
              受取
            </button>
            <div v-else-if="quest.completed" class="completed-badge">
              ✅ 完了
            </div>
            <div v-else class="progress-badge">
              進行中
            </div>
          </div>
        </div>
      </div>

      <!-- ウィークリークエスト -->
      <div v-if="activeTab === 'weekly'" class="quest-list">
        <div
          v-for="quest in weeklyQuests"
          :key="quest.id"
          class="quest-item weekly"
          :class="{
            completed: quest.completed,
            'reward-available': quest.completed && !quest.rewardClaimed
          }"
        >
          <div class="quest-icon-large">{{ quest.icon }}</div>

          <div class="quest-details">
            <h4 class="quest-name">{{ formatQuestTitle(quest) }}</h4>
            <p class="quest-description">{{ formatQuestDescription(quest) }}</p>

            <!-- プログレス -->
            <div class="quest-progress">
              <div class="progress-bar-mini weekly">
                <div
                  class="progress-fill"
                  :style="{ width: (quest.progress / quest.target * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-numbers">
                {{ Math.min(quest.progress, quest.target) }}/{{ quest.target }}
              </span>
            </div>

            <!-- 報酬表示 -->
            <div class="quest-rewards">
              <span v-if="quest.reward.exp" class="reward-item">
                ⭐ {{ quest.reward.exp }}
              </span>
              <span v-if="quest.reward.gems" class="reward-item">
                💎 {{ quest.reward.gems }}
              </span>
              <span v-if="quest.reward.badge" class="reward-item">
                🏆 {{ quest.reward.badge }}
              </span>
              <span v-if="quest.reward.streakShield" class="reward-item">
                🛡️ {{ quest.reward.streakShield }}
              </span>
            </div>

            <!-- 期限表示 -->
            <div class="quest-deadline">
              ⏰ {{ formatTimeRemaining(quest.expiresAt) }}
            </div>
          </div>

          <!-- ステータス -->
          <div class="quest-status">
            <button
              v-if="quest.completed && !quest.rewardClaimed"
              @click="claimReward(quest.id)"
              class="claim-btn weekly"
            >
              受取
            </button>
            <div v-else-if="quest.completed" class="completed-badge">
              ✅ 完了
            </div>
            <div v-else class="progress-badge weekly">
              進行中
            </div>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-if="currentQuests.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>利用可能なクエストがありません</p>
        <button @click="refreshQuests" class="refresh-btn">
          🔄 更新
        </button>
      </div>

      <!-- アクションボタン -->
      <div class="quest-actions" v-if="hasUnclaimedRewards">
        <button @click="claimAllRewards" class="claim-all-btn">
          🎁 全ての報酬を受け取る
        </button>
      </div>
    </div>

    <!-- 報酬通知 -->
    <transition name="reward-notification">
      <div v-if="showRewardNotification" class="reward-notification">
        <div class="notification-content">
          <div class="notification-icon">🎉</div>
          <div class="notification-text">
            <h4>報酬を獲得！</h4>
            <p>{{ lastRewardMessage }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, shallowRef, markRaw } from 'vue'
import { useQuestStore } from '@/stores/questStore'
import logger from '@/utils/logger'

const questStore = useQuestStore()

// UI状態
const isMinimized = ref(false)
const activeTab = ref('daily')
const showRewardNotification = ref(false)
const lastRewardMessage = ref('')

// 計算プロパティ
const questProgress = computed(() => questStore.todayProgress)
const dailyQuests = computed(() => questStore.dailyQuests)
const weeklyQuests = computed(() => questStore.weeklyQuests)

const currentQuests = computed(() => {
  return activeTab.value === 'daily' ? dailyQuests.value : weeklyQuests.value
})

const hasUnclaimedRewards = computed(() => {
  return [...dailyQuests.value, ...weeklyQuests.value]
    .some(q => q.completed && !q.rewardClaimed)
})

// メソッド
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  localStorage.setItem('quest_panel_minimized', isMinimized.value.toString())
}

const formatQuestTitle = (quest) => {
  return quest.title.replace('{count}', quest.target)
}

const formatQuestDescription = (quest) => {
  return quest.description.replace('{count}', quest.target)
}

const formatTimeRemaining = (expiresAt) => {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires - now

  if (diff <= 0) return '期限切れ'

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

  if (days > 0) return `${days}日と${hours}時間`
  if (hours > 0) return `${hours}時間${minutes}分`
  return `${minutes}分`
}

const claimReward = async (questId) => {
  try {
    const success = questStore.claimRewards(questId)
    if (success) {
      const quest = [...dailyQuests.value, ...weeklyQuests.value]
        .find(q => q.id === questId)

      if (quest) {
        lastRewardMessage.value = `${quest.title}の報酬を受け取りました！`
        showRewardNotification.value = true

        setTimeout(() => {
          showRewardNotification.value = false
        }, 3000)
      }
    }
  } catch (error) {
    logger.error('Failed to claim reward:', error)
  }
}

const claimAllRewards = async () => {
  try {
    const totalRewards = questStore.claimAllRewards()

    lastRewardMessage.value = `経験値 ${totalRewards.exp}、ジェム ${totalRewards.gems} を獲得！`
    showRewardNotification.value = true

    setTimeout(() => {
      showRewardNotification.value = false
    }, 3000)
  } catch (error) {
    logger.error('Failed to claim all rewards:', error)
  }
}

const refreshQuests = () => {
  questStore.generateDailyQuests()
  logger.log('🔄 Quests refreshed manually')
}

// ライフサイクル
onMounted(() => {
  // ストア初期化
  questStore.initializeStore()

  // 最小化状態の復元
  const savedMinimized = localStorage.getItem('quest_panel_minimized')
  if (savedMinimized !== null) {
    isMinimized.value = savedMinimized === 'true'
  }

  logger.log('🎯 Quest panel mounted')
})

// クエスト完了の監視
watch(() => questProgress.value.completed, (newCompleted, oldCompleted) => {
  if (newCompleted > oldCompleted) {
    lastRewardMessage.value = 'クエストを完了しました！'
    showRewardNotification.value = true

    setTimeout(() => {
      showRewardNotification.value = false
    }, 2000)
  }
}, { immediate: false })
</script>

<style scoped>
.quest-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 350px;
  max-height: 70vh;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  font-family: 'Arial', sans-serif;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow: hidden;
}

.quest-panel.minimized {
  max-height: 60px;
}

/* ヘッダー */
.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quest-icon {
  font-size: 1.5rem;
}

.quest-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.progress-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.minimize-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.minimize-btn.rotated {
  transform: rotate(180deg);
}

/* プログレスセクション */
.progress-section {
  padding: 0 1rem 1rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* コンテンツ */
.quest-content {
  max-height: calc(70vh - 140px);
  overflow-y: auto;
}

/* タブ */
.quest-tabs {
  display: flex;
  padding: 0 1rem;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-btn {
  flex: 1;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.2);
}

/* クエストリスト */
.quest-list {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quest-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.quest-item.completed {
  background: rgba(72, 187, 120, 0.2);
  border-color: rgba(72, 187, 120, 0.5);
}

.quest-item.reward-available {
  background: rgba(255, 193, 7, 0.2);
  border-color: rgba(255, 193, 7, 0.5);
  animation: reward-pulse 2s ease-in-out infinite;
}

@keyframes reward-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.quest-item.weekly {
  background: rgba(138, 43, 226, 0.1);
}

.quest-item.weekly.completed {
  background: rgba(138, 43, 226, 0.2);
  border-color: rgba(138, 43, 226, 0.5);
}

.quest-icon-large {
  font-size: 2rem;
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
}

.quest-details {
  flex: 1;
}

.quest-name {
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.25rem 0;
  color: #e2e8f0;
}

.quest-description {
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  opacity: 0.8;
  line-height: 1.3;
}

.quest-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.progress-bar-mini {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-mini.weekly {
  background: rgba(138, 43, 226, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.progress-numbers {
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 40px;
}

.quest-rewards {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.reward-item {
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  white-space: nowrap;
}

.quest-deadline {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.quest-status {
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
}

.claim-btn {
  background: linear-gradient(135deg, #f6ad55, #ed8936);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.claim-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(246, 173, 85, 0.4);
}

.claim-btn.weekly {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
}

.completed-badge {
  background: rgba(72, 187, 120, 0.3);
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: bold;
}

.progress-badge {
  background: rgba(74, 85, 104, 0.5);
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.progress-badge.weekly {
  background: rgba(138, 43, 226, 0.3);
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 2rem;
  opacity: 0.7;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* アクション */
.quest-actions {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.claim-all-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 0.75rem;
  color: white;
  font-weight: bold;
  padding: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.claim-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 通知 */
.reward-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  max-width: 300px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.notification-icon {
  font-size: 2rem;
}

.notification-text h4 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 1rem;
}

.notification-text p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
}

/* トランジション */
.reward-notification-enter-active,
.reward-notification-leave-active {
  transition: all 0.3s ease;
}

.reward-notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.reward-notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* スクロールバー */
.quest-content::-webkit-scrollbar {
  width: 4px;
}

.quest-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.quest-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .quest-panel {
    width: calc(100vw - 40px);
    max-width: 350px;
    right: 20px;
  }
}

@media (max-height: 600px) {
  .quest-panel {
    max-height: 80vh;
  }

  .quest-content {
    max-height: calc(80vh - 140px);
  }
}
</style>