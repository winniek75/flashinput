<template>
  <nav class="header-navigation">
    <div class="nav-container">
      <!-- Main Logo -->
      <div class="nav-logo" @click="router.push('/')">
        <span class="logo-text">🌌 Sound Galaxy</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="nav-desktop">
        <div class="nav-links">
          <button 
            v-for="link in mainLinks" 
            :key="link.path"
            @click="router.push(link.path)"
            class="nav-link"
            :class="{ 'active': isActiveRoute(link.path) }"
          >
            <i :class="link.icon"></i>
            <span>{{ link.name }}</span>
          </button>
        </div>

        <!-- Dashboard Access -->
        <div class="nav-dashboard-access">
          <div class="dropdown" v-if="showDashboardDropdown">
            <button 
              @click="toggleDashboardDropdown"
              class="dropdown-toggle"
              :class="{ 'active': isDashboardDropdownOpen }"
            >
              <i class="fas fa-tachometer-alt"></i>
              <span>ダッシュボード</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            
            <div v-if="isDashboardDropdownOpen" class="dropdown-menu">
              <button 
                v-for="dashboard in dashboardOptions" 
                :key="dashboard.path"
                @click="navigateToDashboard(dashboard)"
                class="dropdown-item"
                :class="{ 'disabled': dashboard.disabled }"
              >
                <i :class="dashboard.icon"></i>
                <span>{{ dashboard.name }}</span>
                <span v-if="dashboard.disabled" class="upgrade-tag">{{ dashboard.upgradeText }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- User Menu -->
        <div class="nav-user-menu">
          <div class="dropdown">
            <button 
              @click="toggleUserDropdown"
              class="user-menu-toggle"
              :class="{ 'active': isUserDropdownOpen }"
            >
              <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
              </div>
              <div v-if="authStore.isAuthenticated" class="user-info">
                <span class="user-name">{{ authStore.currentUser?.name || 'ユーザー' }}</span>
                <span class="user-plan">{{ currentPlan }}</span>
              </div>
              <div v-else class="user-info">
                <span class="user-name">ゲスト</span>
                <span class="user-plan">未ログイン</span>
              </div>
            </button>
            
            <div v-if="isUserDropdownOpen" class="dropdown-menu user-dropdown">
              <template v-if="authStore.isAuthenticated">
                <button @click="router.push('/profile')" class="dropdown-item">
                  <i class="fas fa-user"></i>
                  <span>プロフィール</span>
                </button>
                <button @click="router.push('/subscription')" class="dropdown-item">
                  <i class="fas fa-credit-card"></i>
                  <span>サブスクリプション</span>
                </button>
                <div class="dropdown-divider"></div>
                <button @click="handleLogout" class="dropdown-item logout">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>ログアウト</span>
                </button>
              </template>
              <template v-else>
                <button @click="router.push('/login')" class="dropdown-item">
                  <i class="fas fa-sign-in-alt"></i>
                  <span>ログイン</span>
                </button>
                <button @click="router.push('/subscription')" class="dropdown-item">
                  <i class="fas fa-credit-card"></i>
                  <span>プラン選択</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <div class="nav-mobile-toggle">
        <button @click="toggleMobileMenu" class="mobile-menu-btn">
          <i class="fas fa-bars" v-if="!isMobileMenuOpen"></i>
          <i class="fas fa-times" v-else></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <div class="mobile-menu-links">
        <button 
          v-for="link in mainLinks" 
          :key="link.path"
          @click="handleMobileNavigation(link.path)"
          class="mobile-nav-link"
        >
          <i :class="link.icon"></i>
          <span>{{ link.name }}</span>
        </button>
      </div>
      
      <div class="mobile-dashboard-section">
        <h3 class="mobile-section-title">ダッシュボード</h3>
        <button 
          v-for="dashboard in dashboardOptions" 
          :key="dashboard.path"
          @click="handleMobileDashboard(dashboard)"
          class="mobile-nav-link"
          :class="{ 'disabled': dashboard.disabled }"
        >
          <i :class="dashboard.icon"></i>
          <span>{{ dashboard.name }}</span>
          <span v-if="dashboard.disabled" class="upgrade-tag">{{ dashboard.upgradeText }}</span>
        </button>
      </div>

      <div class="mobile-user-section">
        <h3 class="mobile-section-title">アカウント</h3>
        <template v-if="authStore.isAuthenticated">
          <div class="mobile-user-info">
            <span class="mobile-user-name">{{ authStore.currentUser?.name || 'ユーザー' }}</span>
            <span class="mobile-user-plan">{{ currentPlan }}</span>
          </div>
          <button @click="handleMobileNavigation('/profile')" class="mobile-nav-link">
            <i class="fas fa-user"></i>
            <span>プロフィール</span>
          </button>
          <button @click="handleMobileNavigation('/subscription')" class="mobile-nav-link">
            <i class="fas fa-credit-card"></i>
            <span>サブスクリプション</span>
          </button>
          <button @click="handleMobileLogout" class="mobile-nav-link logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>ログアウト</span>
          </button>
        </template>
        <template v-else>
          <button @click="handleMobileNavigation('/login')" class="mobile-nav-link">
            <i class="fas fa-sign-in-alt"></i>
            <span>ログイン</span>
          </button>
          <button @click="handleMobileNavigation('/subscription')" class="mobile-nav-link">
            <i class="fas fa-credit-card"></i>
            <span>プラン選択</span>
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import logger from '@/utils/logger'

import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export default {
  name: 'HeaderNavigation',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()

    // State
    const isDashboardDropdownOpen = ref(false)
    const isUserDropdownOpen = ref(false)
    const isMobileMenuOpen = ref(false)

    // Computed
    const currentPlan = computed(() => {
      const plan = subscriptionStore.currentPlan
      return plan ? plan.name : 'フリープラン'
    })

    const showDashboardDropdown = computed(() => {
      return authStore.isAuthenticated || subscriptionStore.subscriptionStatus !== 'free'
    })

    const mainLinks = [
      { name: 'ホーム', path: '/', icon: 'fas fa-home' },
      { name: '銀河マップ', path: '/galaxy-map', icon: 'fas fa-globe-americas' },
      { name: 'サウンドラボ', path: '/platforms/phonics-adventure', icon: 'fas fa-music' },
      { name: 'グラマーギャラクシー', path: '/grammar-galaxy', icon: 'fas fa-star' }
    ]

    const dashboardOptions = computed(() => [
      {
        name: '生徒セッション',
        path: '/student-session',
        icon: 'fas fa-gamepad',
        disabled: false,
        upgradeText: ''
      },
      {
        name: '講師ダッシュボード',
        path: '/teacher-dashboard',
        icon: 'fas fa-chalkboard-teacher',
        disabled: !subscriptionStore.checkFeatureAccess('teacher_dashboard'),
        upgradeText: 'プロプラン+'
      },
      {
        name: '親ポータル',
        path: '/parent/dashboard',
        icon: 'fas fa-users',
        disabled: !subscriptionStore.checkFeatureAccess('parent_portal'),
        upgradeText: 'ファミリープラン+'
      }
    ])

    // Methods
    const isActiveRoute = (path) => {
      return route.path === path
    }

    const toggleDashboardDropdown = () => {
      isDashboardDropdownOpen.value = !isDashboardDropdownOpen.value
      isUserDropdownOpen.value = false
    }

    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value
      isDashboardDropdownOpen.value = false
    }

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    const navigateToDashboard = (dashboard) => {
      if (dashboard.disabled) {
        router.push('/subscription')
      } else {
        router.push(dashboard.path)
      }
      isDashboardDropdownOpen.value = false
    }

    const handleMobileNavigation = (path) => {
      router.push(path)
      isMobileMenuOpen.value = false
    }

    const handleMobileDashboard = (dashboard) => {
      if (dashboard.disabled) {
        router.push('/subscription')
      } else {
        router.push(dashboard.path)
      }
      isMobileMenuOpen.value = false
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
        isUserDropdownOpen.value = false
      } catch (error) {
        logger.error('Logout failed:', error)
      }
    }

    const handleMobileLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
        isMobileMenuOpen.value = false
      } catch (error) {
        logger.error('Logout failed:', error)
      }
    }

    // Close dropdowns when clicking outside
    const closeDropdowns = () => {
      isDashboardDropdownOpen.value = false
      isUserDropdownOpen.value = false
    }

    return {
      router,
      authStore,
      subscriptionStore,
      currentPlan,
      showDashboardDropdown,
      mainLinks,
      dashboardOptions,
      isDashboardDropdownOpen,
      isUserDropdownOpen,
      isMobileMenuOpen,
      isActiveRoute,
      toggleDashboardDropdown,
      toggleUserDropdown,
      toggleMobileMenu,
      navigateToDashboard,
      handleMobileNavigation,
      handleMobileDashboard,
      handleLogout,
      handleMobileLogout,
      closeDropdowns
    }
  }
}
</script>

<style scoped>
.header-navigation {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.nav-logo {
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(59, 130, 246, 0.2);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.dropdown {
  position: relative;
}

.dropdown-toggle,
.user-menu-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover,
.user-menu-toggle:hover,
.dropdown-toggle.active,
.user-menu-toggle.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: white;
}

.user-menu-toggle {
  min-width: 180px;
  justify-content: flex-start;
}

.user-avatar {
  font-size: 1.5rem;
  color: #60A5FA;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.user-plan {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  min-width: 200px;
  z-index: 100;
}

.user-dropdown {
  min-width: 220px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.2);
  color: white;
}

.dropdown-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: rgba(248, 113, 113, 0.2);
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.upgrade-tag {
  font-size: 0.7rem;
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-left: auto;
}

.nav-mobile-toggle {
  display: none;
}

.mobile-menu-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

.mobile-menu {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.mobile-menu-links,
.mobile-dashboard-section,
.mobile-user-section {
  margin-bottom: 1.5rem;
}

.mobile-section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  border-radius: 8px;
  margin-bottom: 0.25rem;
}

.mobile-nav-link:hover {
  background: rgba(59, 130, 246, 0.2);
  color: white;
}

.mobile-nav-link.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mobile-nav-link.logout {
  color: #f87171;
}

.mobile-nav-link.logout:hover {
  background: rgba(248, 113, 113, 0.2);
}

.mobile-user-info {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 0.5rem;
}

.mobile-user-name {
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.mobile-user-plan {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 1024px) {
  .nav-desktop {
    display: none;
  }
  
  .nav-mobile-toggle {
    display: block;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
    height: 3.5rem;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
}
</style>