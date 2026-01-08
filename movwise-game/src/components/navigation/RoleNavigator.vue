<template>
  <div class="role-navigator">
    <div class="navigation-header">
      <h2 class="text-2xl font-bold text-white mb-6">
        ダッシュボード選択
      </h2>
    </div>

    <div class="role-cards-grid">
      <!-- Teacher Dashboard -->
      <div 
        class="role-card teacher-card"
        @click="navigateToTeacher"
        :class="{ 'disabled': !canAccessTeacher }"
      >
        <div class="role-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <h3>講師ダッシュボード</h3>
        <p>生徒管理、クラス運営、AI分析</p>
        <div v-if="!canAccessTeacher" class="upgrade-badge">
          プロプラン以上で利用可能
        </div>
        <div class="access-info">
          <span class="access-path">/teacher-dashboard</span>
        </div>
      </div>

      <!-- Parent Portal -->
      <div 
        class="role-card parent-card"
        @click="navigateToParent"
        :class="{ 'disabled': !canAccessParent }"
      >
        <div class="role-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3>親ポータル</h3>
        <p>お子様の進歩確認、通知管理</p>
        <div v-if="!canAccessParent" class="upgrade-badge">
          ファミリープラン以上で利用可能
        </div>
        <div class="access-info">
          <span class="access-path">/parent/dashboard</span>
        </div>
      </div>

      <!-- Student Session -->
      <div 
        class="role-card student-card"
        @click="navigateToStudent"
      >
        <div class="role-icon">
          <i class="fas fa-gamepad"></i>
        </div>
        <h3>学習セッション</h3>
        <p>ゲームプレイ、進歩確認</p>
        <div class="access-info">
          <span class="access-path">/student-session</span>
        </div>
      </div>

      <!-- Galaxy Map -->
      <div 
        class="role-card galaxy-card"
        @click="navigateToGalaxy"
      >
        <div class="role-icon">
          <i class="fas fa-globe-americas"></i>
        </div>
        <h3>ギャラクシーマップ</h3>
        <p>学習コンテンツ探索</p>
        <div class="access-info">
          <span class="access-path">/galaxy-map</span>
        </div>
      </div>

      <!-- Subscription Management -->
      <div 
        class="role-card subscription-card"
        @click="navigateToSubscription"
      >
        <div class="role-icon">
          <i class="fas fa-credit-card"></i>
        </div>
        <h3>サブスクリプション</h3>
        <p>プラン管理、支払い設定</p>
        <div class="subscription-status">
          <span :class="subscriptionStatusClass">
            {{ currentPlan }}
          </span>
        </div>
        <div class="access-info">
          <span class="access-path">/subscription</span>
        </div>
      </div>

      <!-- Login/Profile -->
      <div 
        class="role-card profile-card"
        @click="navigateToProfile"
      >
        <div class="role-icon">
          <i class="fas fa-user-circle"></i>
        </div>
        <h3>プロフィール</h3>
        <p>アカウント設定、ログイン</p>
        <div v-if="authStore.isAuthenticated" class="user-info">
          <span class="user-name">{{ authStore.currentUser?.name || 'ユーザー' }}</span>
        </div>
        <div class="access-info">
          <span class="access-path">{{ authStore.isAuthenticated ? '/profile' : '/login' }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Access Links -->
    <div class="quick-access-section">
      <h3 class="text-lg font-semibold text-white mb-4">クイックアクセス</h3>
      <div class="quick-links">
        <button 
          v-for="link in quickLinks" 
          :key="link.path"
          @click="router.push(link.path)"
          class="quick-link-btn"
          :class="{ 'disabled': link.disabled }"
        >
          <i :class="link.icon"></i>
          {{ link.name }}
        </button>
      </div>
    </div>

    <!-- System Status -->
    <div class="system-status">
      <div class="status-item">
        <i class="fas fa-server"></i>
        <span>サーバー状態: </span>
        <span class="status-online">オンライン</span>
      </div>
      <div class="status-item">
        <i class="fas fa-shield-alt"></i>
        <span>認証状態: </span>
        <span :class="authStore.isAuthenticated ? 'status-online' : 'status-offline'">
          {{ authStore.isAuthenticated ? 'ログイン済み' : '未ログイン' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export default {
  name: 'RoleNavigator',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()

    const canAccessTeacher = computed(() => {
      return subscriptionStore.checkFeatureAccess('teacher_dashboard')
    })

    const canAccessParent = computed(() => {
      return subscriptionStore.checkFeatureAccess('parent_portal')
    })

    const currentPlan = computed(() => {
      const plan = subscriptionStore.currentPlan
      return plan ? plan.name : 'フリープラン'
    })

    const subscriptionStatusClass = computed(() => {
      const status = subscriptionStore.subscriptionStatus
      return {
        'status-active': status === 'active',
        'status-trial': status === 'trial',
        'status-expired': status === 'expired',
        'status-free': status === 'free'
      }
    })

    const quickLinks = computed(() => [
      {
        name: 'サウンドラボ',
        path: '/sound-lab',
        icon: 'fas fa-music',
        disabled: false
      },
      {
        name: 'フォニックス',
        path: '/phonics-hub',
        icon: 'fas fa-volume-up',
        disabled: false
      },
      {
        name: 'グラマーギャラクシー',
        path: '/grammar-galaxy',
        icon: 'fas fa-star',
        disabled: false
      },
      {
        name: 'AI分析',
        path: '/teacher-dashboard#ai-insights',
        icon: 'fas fa-brain',
        disabled: !canAccessTeacher.value
      }
    ])

    const navigateToTeacher = () => {
      if (canAccessTeacher.value) {
        router.push('/teacher-dashboard')
      } else {
        router.push('/subscription')
      }
    }

    const navigateToParent = () => {
      if (canAccessParent.value) {
        router.push('/parent/dashboard')
      } else {
        router.push('/subscription')
      }
    }

    const navigateToStudent = () => {
      router.push('/student-session')
    }

    const navigateToGalaxy = () => {
      router.push('/galaxy-map')
    }

    const navigateToSubscription = () => {
      router.push('/subscription')
    }

    const navigateToProfile = () => {
      if (authStore.isAuthenticated) {
        router.push('/profile')
      } else {
        router.push('/login')
      }
    }

    return {
      router,
      authStore,
      subscriptionStore,
      canAccessTeacher,
      canAccessParent,
      currentPlan,
      subscriptionStatusClass,
      quickLinks,
      navigateToTeacher,
      navigateToParent,
      navigateToStudent,
      navigateToGalaxy,
      navigateToSubscription,
      navigateToProfile
    }
  }
}
</script>

<style scoped>
.role-navigator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.navigation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.role-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
}

.role-card:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.role-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.role-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #fff;
}

.teacher-card .role-icon { color: #4ade80; }
.parent-card .role-icon { color: #60a5fa; }
.student-card .role-icon { color: #fbbf24; }
.galaxy-card .role-icon { color: #a78bfa; }
.subscription-card .role-icon { color: #f87171; }
.profile-card .role-icon { color: #34d399; }

.role-card h3 {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.role-card p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.upgrade-badge {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
}

.access-info {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
}

.access-path {
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
}

.subscription-status {
  margin-bottom: 1rem;
}

.status-active { color: #4ade80; font-weight: 600; }
.status-trial { color: #fbbf24; font-weight: 600; }
.status-expired { color: #f87171; font-weight: 600; }
.status-free { color: rgba(255, 255, 255, 0.7); }

.user-info {
  margin-bottom: 1rem;
}

.user-name {
  color: #4ade80;
  font-weight: 500;
}

.quick-access-section {
  margin-bottom: 2rem;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quick-link-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-link-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.quick-link-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.system-status {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.status-online {
  color: #4ade80;
  font-weight: 500;
}

.status-offline {
  color: #f87171;
  font-weight: 500;
}

@media (max-width: 768px) {
  .role-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-links {
    justify-content: center;
  }
  
  .system-status {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>