<template>
  <div class="simple-quick-access">
    <!-- Visible Toggle Button -->
    <button 
      @click="togglePanel"
      class="simple-toggle-btn"
      :class="{ 'panel-open': isOpen }"
    >
      {{ isOpen ? '✕' : '📊' }}
    </button>

    <!-- Slide-out Panel -->
    <transition name="slide-right">
      <div v-if="isOpen" class="simple-panel">
        <div class="panel-header">
          <h3>🚀 クイックアクセス</h3>
          <button @click="closePanel" class="close-btn">✕</button>
        </div>

        <div class="panel-section">
          <h4>📊 ダッシュボード</h4>
          <button 
            v-for="dashboard in dashboards" 
            :key="dashboard.path"
            @click="navigate(dashboard)"
            class="panel-btn"
            :class="{ 'disabled': dashboard.disabled }"
          >
            {{ dashboard.icon }} {{ dashboard.name }}
            <span v-if="dashboard.disabled" class="disabled-text">({{ dashboard.upgradeText }})</span>
          </button>
        </div>

        <div class="panel-section">
          <h4>🎮 学習エリア</h4>
          <button 
            v-for="area in learningAreas" 
            :key="area.path"
            @click="navigate(area)"
            class="panel-btn"
          >
            {{ area.icon }} {{ area.name }}
          </button>
        </div>

        <div class="panel-section">
          <h4>⚙️ 設定</h4>
          <button 
            v-for="setting in settings" 
            :key="setting.path"
            @click="navigate(setting)"
            class="panel-btn"
          >
            {{ setting.icon }} {{ setting.name }}
          </button>
        </div>

        <div class="panel-footer">
          <div class="status-info">
            <div>👤 {{ authStore.currentUser?.displayName || 'ゲスト' }}</div>
            <div>👑 {{ currentPlan }}</div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Backdrop -->
    <div v-if="isOpen" class="backdrop" @click="closePanel"></div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export default {
  name: 'SimpleQuickAccess',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    
    const isOpen = ref(false)

    const currentPlan = computed(() => {
      const plan = subscriptionStore.currentPlan
      return plan ? plan.name : 'フリープラン'
    })

    const dashboards = computed(() => [
      {
        name: '学習セッション',
        path: '/student-session',
        icon: '🎮',
        disabled: false
      },
      {
        name: '講師ダッシュボード',
        path: '/teacher-dashboard',
        icon: '👨‍🏫',
        disabled: !subscriptionStore.checkFeatureAccess('teacher_dashboard'),
        upgradeText: 'プロプラン+'
      },
      {
        name: '親ポータル',
        path: '/parent/dashboard',
        icon: '👨‍👩‍👧‍👦',
        disabled: !subscriptionStore.checkFeatureAccess('parent_portal'),
        upgradeText: 'ファミリープラン+'
      }
    ])

    const learningAreas = [
      { name: 'サウンドラボ', path: '/platforms/phonics-adventure', icon: '🎵' },
      { name: 'グラマーギャラクシー', path: '/grammar-galaxy', icon: '🌌' },
      { name: '銀河マップ', path: '/galaxy-map', icon: '🗺️' }
    ]

    const settings = computed(() => [
      { name: 'プロフィール', path: '/profile', icon: '👤' },
      { name: 'サブスクリプション', path: '/subscription', icon: '💳' },
      { name: 'デモログイン', path: '/demo-login', icon: '🔐' },
      ...(authStore.isAuthenticated ? [
        { name: 'ログアウト', path: '/logout', icon: '🚪' }
      ] : [
        { name: 'ログイン', path: '/login', icon: '🔑' }
      ])
    ])

    const togglePanel = () => {
      logger.log('SimpleQuickAccess toggle clicked!')
      isOpen.value = !isOpen.value
    }

    const closePanel = () => {
      isOpen.value = false
    }

    const navigate = (item) => {
      logger.log('Navigating to:', item.path)
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
      currentPlan,
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
.simple-quick-access {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1000;
}

.simple-toggle-btn {
  position: relative;
  right: -2px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 50% 0 0 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: -3px 0 15px rgba(139, 92, 246, 0.4);
  z-index: 1002;
}

.simple-toggle-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  right: 0;
  box-shadow: -5px 0 20px rgba(139, 92, 246, 0.6);
}

.simple-toggle-btn.panel-open {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 0;
  right: 300px;
}

.simple-panel {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%);
  width: 300px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px 0 0 12px;
  backdrop-filter: blur(10px);
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.panel-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section h4 {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.panel-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.panel-btn:hover:not(.disabled) {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.panel-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disabled-text {
  font-size: 0.75rem;
  color: rgba(251, 191, 36, 0.8);
}

.panel-footer {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
}

.status-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.status-info div {
  margin-bottom: 0.25rem;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

/* Slide Animation */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateY(-50%) translateX(100%);
}

.slide-right-leave-to {
  transform: translateY(-50%) translateX(100%);
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .simple-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .simple-panel {
    width: 280px;
    right: 50px;
  }

  .simple-toggle-btn.panel-open {
    right: 280px;
  }
}
</style>