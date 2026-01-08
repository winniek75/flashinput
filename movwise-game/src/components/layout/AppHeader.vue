<template>
  <header class="app-header">
    <div class="header-container">
      <!-- 左側: ロゴ・ナビゲーション -->
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">🌌</span>
          <span class="logo-text">MovWISE</span>
        </router-link>
      </div>

      <!-- 中央: ステータス表示 -->
      <div class="header-center">
        <!-- レベル表示 -->
        <div class="status-item">
          <span class="status-icon">🏆</span>
          <span class="status-value">Lv.{{ userStore.stats?.level || 1 }}</span>
        </div>

        <!-- XP表示 -->
        <div class="status-item">
          <span class="status-icon">⚡</span>
          <span class="status-value">{{ userStore.stats?.totalXP || 0 }} XP</span>
        </div>

        <!-- 連続学習日数 -->
        <div class="status-item">
          <span class="status-icon">🔥</span>
          <span class="status-value">{{ userStore.stats?.streak || 0 }}日</span>
        </div>
      </div>

      <!-- 右側: チケット表示・ユーザーメニュー -->
      <div class="header-right">
        <!-- VRチケット表示 -->
        <VRTicketDisplay />

        <!-- ユーザーメニュー -->
        <div class="user-menu">
          <button class="user-menu-btn" @click="toggleUserMenu">
            <span class="user-avatar">{{ userAvatar }}</span>
          </button>

          <transition name="dropdown">
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/profile" class="dropdown-item">
                <span>👤</span>
                <span>プロフィール</span>
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <span>⚙️</span>
                <span>設定</span>
              </router-link>
              <router-link to="/game-library" class="dropdown-item">
                <span>🎮</span>
                <span>ゲームライブラリ</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item">
                <span>🚪</span>
                <span>ログアウト</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- チケット獲得通知 -->
    <transition-group name="notification">
      <div
        v-for="notification in ticketNotifications"
        :key="notification.id"
        class="ticket-notification"
      >
        <span class="notification-icon">🎫</span>
        <span class="notification-text">+{{ notification.amount }} {{ notification.reason }}</span>
      </div>
    </transition-group>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useTicketStore } from '@/stores/ticketStore'
import VRTicketDisplay from '@/components/ui/VRTicketDisplay.vue'

const router = useRouter()
const userStore = useUserStore()
const ticketStore = useTicketStore()

// リアクティブ変数
const showUserMenu = ref(false)
const ticketNotifications = ref<Array<{ id: number; amount: number; reason: string }>>([])

// 計算プロパティ
const userAvatar = computed(() => {
  // ユーザーのアバターを返す（デフォルトは👤）
  return '👤'
})

// メソッド
function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  if (confirm('ログアウトしますか？')) {
    // ログアウト処理
    userStore.resetUserType()
    ticketStore.resetTickets()
    router.push('/')
  }
}

// チケット獲得通知を表示
function showTicketNotification(event: CustomEvent) {
  const { amount, reason } = event.detail
  const id = Date.now() + Math.random()

  const reasonText = getReasonText(reason)
  ticketNotifications.value.push({ id, amount, reason: reasonText })

  // 3秒後に通知を削除
  setTimeout(() => {
    ticketNotifications.value = ticketNotifications.value.filter(n => n.id !== id)
  }, 3000)
}

function getReasonText(reason: string): string {
  const reasonMap: Record<string, string> = {
    login_bonus: 'ログインボーナス',
    game_clear: 'ゲームクリア',
    streak_bonus: '連続正解ボーナス',
    mission_complete: 'ミッション完了',
    level_up: 'レベルアップ',
    achievement: 'アチーブメント'
  }
  return reasonMap[reason] || ''
}

// クリックイベント外でメニューを閉じる
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

// ライフサイクル
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('ticket-earned', showTicketNotification as any)

  // ログインボーナスチェック
  ticketStore.checkLoginBonus()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('ticket-earned', showTicketNotification as any)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(45deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.status-icon {
  font-size: 16px;
}

.status-value {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-menu {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: scale(1.05);
}

.user-avatar {
  font-size: 20px;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(139, 92, 246, 0.2);
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.ticket-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 12px;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification-icon {
  font-size: 20px;
}

.notification-text {
  font-size: 14px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .header-container {
    padding: 8px 16px;
  }

  .header-center {
    display: none;
  }

  .logo-text {
    display: none;
  }
}
</style>