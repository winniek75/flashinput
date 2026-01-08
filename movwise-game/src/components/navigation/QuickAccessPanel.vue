<template>
  <div class="quick-access-panel" :class="{ 'open': isOpen }">
    <!-- Toggle Button -->
    <button 
      @click="togglePanel"
      class="quick-access-toggle"
      :class="{ 'active': isOpen }"
      title="クイックアクセスパネルを開く"
    >
      <i class="fas fa-tachometer-alt" v-if="!isOpen"></i>
      <i class="fas fa-times" v-else></i>
    </button>

    <!-- Panel Content -->
    <div class="panel-content" v-if="isOpen">
      <div class="panel-header">
        <h3>クイックアクセス</h3>
        <span class="panel-subtitle">システム管理</span>
      </div>

      <div class="access-sections">
        <!-- Dashboard Section -->
        <div class="access-section">
          <h4 class="section-title">
            <i class="fas fa-chart-line"></i>
            ダッシュボード
          </h4>
          <div class="access-buttons">
            <button 
              v-for="dashboard in dashboards" 
              :key="dashboard.path"
              @click="navigate(dashboard)"
              class="access-btn"
              :class="{ 'disabled': dashboard.disabled, 'premium': dashboard.premium }"
            >
              <i :class="dashboard.icon"></i>
              <span>{{ dashboard.name }}</span>
              <span v-if="dashboard.disabled" class="upgrade-text">{{ dashboard.upgradeText }}</span>
            </button>
          </div>
        </div>

        <!-- Learning Section -->
        <div class="access-section">
          <h4 class="section-title">
            <i class="fas fa-graduation-cap"></i>
            学習エリア
          </h4>
          <div class="access-buttons">
            <button 
              v-for="area in learningAreas" 
              :key="area.path"
              @click="navigate(area)"
              class="access-btn"
            >
              <i :class="area.icon"></i>
              <span>{{ area.name }}</span>
            </button>
          </div>
        </div>

        <!-- Settings Section -->
        <div class="access-section">
          <h4 class="section-title">
            <i class="fas fa-cog"></i>
            設定・管理
          </h4>
          <div class="access-buttons">
            <button 
              v-for="setting in settings" 
              :key="setting.path"
              @click="navigate(setting)"
              class="access-btn"
            >
              <i :class="setting.icon"></i>
              <span>{{ setting.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Status Info -->
      <div class="status-info">
        <div class="status-item">
          <i class="fas fa-user"></i>
          <span>{{ authStore.isAuthenticated ? authStore.currentUser?.name || 'ユーザー' : 'ゲスト' }}</span>
        </div>
        <div class="status-item">
          <i class="fas fa-crown"></i>
          <span>{{ currentPlan }}</span>
        </div>
        <div class="status-item" :class="connectionStatusClass">
          <i class="fas fa-wifi"></i>
          <span>{{ connectionStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" class="panel-backdrop" @click="closePanel"></div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export default {
  name: 'QuickAccessPanel',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    const isOpen = ref(false)

    const currentPlan = computed(() => {
      const plan = subscriptionStore.currentPlan
      return plan ? plan.name : 'フリープラン'
    })

    const connectionStatus = computed(() => {
      return navigator.onLine ? 'オンライン' : 'オフライン'
    })

    const connectionStatusClass = computed(() => {
      return navigator.onLine ? 'status-online' : 'status-offline'
    })

    const dashboards = computed(() => [
      {
        name: '学習セッション',
        path: '/student-session',
        icon: 'fas fa-gamepad',
        disabled: false,
        premium: false
      },
      {
        name: '講師ダッシュボード',
        path: '/teacher-dashboard',
        icon: 'fas fa-chalkboard-teacher',
        disabled: !subscriptionStore.checkFeatureAccess('teacher_dashboard'),
        premium: true,
        upgradeText: 'プロプラン+'
      },
      {
        name: '親ポータル',
        path: '/parent/dashboard',
        icon: 'fas fa-users',
        disabled: !subscriptionStore.checkFeatureAccess('parent_portal'),
        premium: true,
        upgradeText: 'ファミリープラン+'
      }
    ])

    const learningAreas = [
      { name: 'サウンドラボ', path: '/platforms/phonics-adventure', icon: 'fas fa-music' },
      { name: 'グラマーギャラクシー', path: '/grammar-galaxy', icon: 'fas fa-star' },
      { name: '銀河マップ', path: '/galaxy-map', icon: 'fas fa-globe-americas' },
      { name: 'VR Academy', path: '/vr-academy', icon: 'fas fa-vr-cardboard' }
    ]

    const settings = computed(() => [
      { name: 'デモログイン', path: '/demo-login', icon: 'fas fa-rocket' },
      { name: 'プロフィール', path: '/profile', icon: 'fas fa-user' },
      { name: 'サブスクリプション', path: '/subscription', icon: 'fas fa-credit-card' },
      { name: '設定', path: '/settings', icon: 'fas fa-cog' },
      ...(authStore.isAuthenticated ? [
        { name: 'ログアウト', path: '/logout', icon: 'fas fa-sign-out-alt' }
      ] : [
        { name: 'ログイン', path: '/login', icon: 'fas fa-sign-in-alt' }
      ])
    ])

    const togglePanel = () => {
      logger.log('QuickAccess toggle clicked, current state:', isOpen.value)
      isOpen.value = !isOpen.value
      logger.log('QuickAccess new state:', isOpen.value)
    }

    const closePanel = () => {
      isOpen.value = false
    }

    const navigate = (item) => {
      if (item.disabled) {
        router.push('/subscription')
      } else if (item.path === '/logout') {
        handleLogout()
      } else {
        router.push(item.path)
      }
      closePanel()
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
        closePanel()
      } catch (error) {
        logger.error('Logout failed:', error)
      }
    }

    return {
      isOpen,
      authStore,
      subscriptionStore,
      currentPlan,
      connectionStatus,
      connectionStatusClass,
      dashboards,
      learningAreas,
      settings,
      togglePanel,
      closePanel,
      navigate
    }
  }
}
</script>

<style scoped>
.quick-access-panel {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1000;
}

.quick-access-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
  border-radius: 25px 0 0 25px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: -2px 0 10px rgba(79, 70, 229, 0.3);
  z-index: 1001;
  outline: none;
  user-select: none;
}

.quick-access-toggle:hover {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  width: 55px;
  box-shadow: -3px 0 15px rgba(79, 70, 229, 0.4);
}

.quick-access-toggle.active {
  border-radius: 0;
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

.panel-content {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 12px 0 0 12px;
  backdrop-filter: blur(10px);
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50%) translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateY(-50%) translateX(0);
    opacity: 1;
  }
}

.panel-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.panel-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.access-sections {
  padding: 1rem 0;
}

.access-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 1.5rem 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.access-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 1rem;
}

.access-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
}

.access-btn:hover {
  background: rgba(79, 70, 229, 0.2);
  color: white;
}

.access-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.access-btn.premium {
  border-left: 3px solid #f59e0b;
}

.upgrade-text {
  font-size: 0.7rem;
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-left: auto;
}

.status-info {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-online {
  color: #10b981;
}

.status-offline {
  color: #f87171;
}

.panel-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .quick-access-panel {
    position: fixed;
    bottom: 80px;
    right: 1rem;
    top: auto;
    transform: none;
  }

  .quick-access-toggle {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    border-radius: 25px;
    margin-bottom: 0.5rem;
  }

  .panel-content {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    width: 280px;
    max-height: 60vh;
    border-radius: 12px;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

/* Scrollbar Styling */
.panel-content::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.5);
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 70, 229, 0.7);
}
</style>