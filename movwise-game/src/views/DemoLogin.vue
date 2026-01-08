<template>
  <div class="demo-login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>🚀 Demo Login</h2>
        <p>各ダッシュボードにアクセスするためのデモログイン</p>
      </div>

      <div class="login-options">
        <h3>ロール選択</h3>
        
        <!-- Teacher Login -->
        <div class="role-option">
          <h4>
            <i class="fas fa-chalkboard-teacher"></i>
            講師 (Teacher)
          </h4>
          <p>生徒管理、AI分析、クラス管理機能にアクセス</p>
          <button 
            @click="loginAsTeacher"
            :disabled="isLoading"
            class="login-btn teacher-btn"
          >
            <i class="fas fa-sign-in-alt"></i>
            講師としてログイン
          </button>
        </div>

        <!-- Parent Login -->
        <div class="role-option">
          <h4>
            <i class="fas fa-users"></i>
            親 (Parent)
          </h4>
          <p>お子様の進歩確認、通知管理機能にアクセス</p>
          <button 
            @click="loginAsParent"
            :disabled="isLoading"
            class="login-btn parent-btn"
          >
            <i class="fas fa-sign-in-alt"></i>
            親としてログイン
          </button>
        </div>

        <!-- Student Login -->
        <div class="role-option">
          <h4>
            <i class="fas fa-gamepad"></i>
            生徒 (Student)
          </h4>
          <p>ゲームプレイ、学習セッション機能にアクセス</p>
          <button 
            @click="loginAsStudent"
            :disabled="isLoading"
            class="login-btn student-btn"
          >
            <i class="fas fa-sign-in-alt"></i>
            生徒としてログイン
          </button>
        </div>

        <!-- Guest Access -->
        <div class="role-option">
          <h4>
            <i class="fas fa-user"></i>
            ゲスト (Guest)
          </h4>
          <p>基本的なゲームプレイ機能にアクセス（制限あり）</p>
          <button 
            @click="continueAsGuest"
            :disabled="isLoading"
            class="login-btn guest-btn"
          >
            <i class="fas fa-play"></i>
            ゲストとして続行
          </button>
        </div>
      </div>

      <div class="current-status" v-if="authStore.isAuthenticated">
        <h3>現在のログイン状態</h3>
        <div class="status-info">
          <div class="status-item">
            <span class="label">ユーザー:</span>
            <span class="value">{{ authStore.currentUser?.displayName || 'Unknown' }}</span>
          </div>
          <div class="status-item">
            <span class="label">ロール:</span>
            <span class="value">{{ getUserRoleText() }}</span>
          </div>
          <div class="status-item">
            <span class="label">アクセス:</span>
            <span class="value">{{ getAccessLevelText() }}</span>
          </div>
        </div>
        <button 
          @click="logout"
          class="login-btn logout-btn"
        >
          <i class="fas fa-sign-out-alt"></i>
          ログアウト
        </button>
      </div>

      <div class="navigation-info">
        <h3>アクセス方法</h3>
        <div class="access-methods">
          <div class="access-method">
            <i class="fas fa-home"></i>
            <span>ホーム画面の「システムダッシュボード」セクション</span>
          </div>
          <div class="access-method">
            <i class="fas fa-tachometer-alt"></i>
            <span>画面右端のクイックアクセスパネル</span>
          </div>
          <div class="access-method">
            <i class="fas fa-bars"></i>
            <span>ヘッダーナビゲーション（準備中）</span>
          </div>
        </div>
      </div>

      <div class="demo-actions">
        <button @click="goHome" class="demo-btn">
          <i class="fas fa-home"></i>
          ホームに戻る
        </button>
        <button @click="openQuickAccess" class="demo-btn">
          <i class="fas fa-external-link-alt"></i>
          ダッシュボード一覧を見る
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
  name: 'DemoLogin',
  setup() {
    const authStore = useAuthStore()
    const subscriptionStore = useSubscriptionStore()
    const router = useRouter()
    const isLoading = ref(false)

    const loginAsTeacher = async () => {
      isLoading.value = true
      try {
        await authStore.login('teacher@movwise.app', 'demo123')
        // Set subscription to pro level for teacher features
        subscriptionStore.subscriptionStatus = 'active'
        subscriptionStore.currentPlan = subscriptionStore.pricingPlans.pro
        alert('講師としてログインしました！\n\n利用可能な機能:\n• 生徒管理\n• AI分析\n• クラス管理\n• セッション監視')
      } catch (error) {
        logger.error('Teacher login failed:', error)
        alert('ログインに失敗しました')
      } finally {
        isLoading.value = false
      }
    }

    const loginAsParent = async () => {
      isLoading.value = true
      try {
        await authStore.login('parent@movwise.app', 'demo123')
        // Set subscription to family level for parent features
        subscriptionStore.subscriptionStatus = 'active'
        subscriptionStore.currentPlan = subscriptionStore.pricingPlans.family
        alert('親としてログインしました！\n\n利用可能な機能:\n• お子様の進歩確認\n• 通知管理\n• 成績レポート')
      } catch (error) {
        logger.error('Parent login failed:', error)
        alert('ログインに失敗しました')
      } finally {
        isLoading.value = false
      }
    }

    const loginAsStudent = async () => {
      isLoading.value = true
      try {
        await authStore.login('student@movwise.app', 'demo123')
        // Set subscription to basic level
        subscriptionStore.subscriptionStatus = 'active'
        subscriptionStore.currentPlan = subscriptionStore.pricingPlans.starter
        alert('生徒としてログインしました！\n\n利用可能な機能:\n• ゲームプレイ\n• 学習セッション\n• 進歩確認')
      } catch (error) {
        logger.error('Student login failed:', error)
        alert('ログインに失敗しました')
      } finally {
        isLoading.value = false
      }
    }

    const continueAsGuest = () => {
      // Set guest mode (no login required)
      subscriptionStore.subscriptionStatus = 'free'
      subscriptionStore.currentPlan = null
      alert('ゲストモードで続行します！\n\n利用可能な機能:\n• 基本的なゲームプレイ\n• 制限付きアクセス')
      router.push('/')
    }

    const logout = async () => {
      try {
        await authStore.logout()
        subscriptionStore.subscriptionStatus = 'free'
        subscriptionStore.currentPlan = null
        alert('ログアウトしました')
      } catch (error) {
        logger.error('Logout failed:', error)
      }
    }

    const getUserRoleText = () => {
      if (!authStore.isAuthenticated) return 'ゲスト'
      if (authStore.isTeacher) return '講師'
      if (authStore.currentUser?.email?.includes('parent')) return '親'
      return '生徒'
    }

    const getAccessLevelText = () => {
      const plan = subscriptionStore.currentPlan
      if (!plan) return 'フリープラン'
      return plan.name
    }

    const goHome = () => {
      router.push('/')
    }

    const openQuickAccess = () => {
      alert('画面右端の青いボタンをクリックして\nクイックアクセスパネルを開いてください！')
    }

    return {
      authStore,
      subscriptionStore,
      isLoading,
      loginAsTeacher,
      loginAsParent,
      loginAsStudent,
      continueAsGuest,
      logout,
      getUserRoleText,
      getAccessLevelText,
      goHome,
      openQuickAccess
    }
  }
}
</script>

<style scoped>
.demo-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #60A5FA, #A78BFA, #F472B6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: rgba(255, 255, 255, 0.7);
}

.login-options h3 {
  color: white;
  margin-bottom: 1.5rem;
  text-align: center;
}

.role-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.role-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.role-option h4 {
  color: white;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-option p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.teacher-btn {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
}

.teacher-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a, #15803d);
  transform: translateY(-1px);
}

.parent-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
}

.parent-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.student-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.student-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-1px);
}

.guest-btn {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.guest-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #374151, #1f2937);
  transform: translateY(-1px);
}

.logout-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.logout-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.current-status {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
}

.current-status h3 {
  color: #22c55e;
  margin-bottom: 1rem;
}

.status-info {
  margin-bottom: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.label {
  font-weight: 500;
}

.value {
  color: #22c55e;
  font-weight: 600;
}

.navigation-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.navigation-info h3 {
  color: #60a5fa;
  margin-bottom: 1rem;
}

.access-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.access-method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.access-method i {
  color: #60a5fa;
  width: 1.25rem;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.demo-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
}

@media (max-width: 768px) {
  .demo-login-container {
    padding: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .demo-actions {
    flex-direction: column;
  }
  
  .access-methods {
    font-size: 0.85rem;
  }
}
</style>