<template>
  <div class="demo-login-container min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
    <div class="login-card max-w-4xl w-full bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
      <div class="login-header text-center mb-8">
        <h2 class="text-3xl font-bold text-white mb-2">🚀 Demo Login</h2>
        <p class="text-slate-400">各ダッシュボードにアクセスするためのデモログイン</p>
      </div>

      <div class="login-options">
        <h3 class="text-xl font-semibold text-white mb-6">ロール選択</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Teacher Login -->
          <div class="role-option bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-blue-500 transition-all">
            <h4 class="text-lg font-semibold text-white mb-2">
              👨‍🏫 講師 (Teacher)
            </h4>
            <p class="text-slate-400 text-sm mb-4">生徒管理、AI分析、クラス管理機能にアクセス</p>
            <button 
              @click="loginAsTeacher"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors font-medium"
            >
              講師としてログイン
            </button>
          </div>

          <!-- Parent Login -->
          <div class="role-option bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-green-500 transition-all">
            <h4 class="text-lg font-semibold text-white mb-2">
              👨‍👩‍👧‍👦 親 (Parent)
            </h4>
            <p class="text-slate-400 text-sm mb-4">お子様の進歩確認、通知管理機能にアクセス</p>
            <button 
              @click="loginAsParent"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors font-medium"
            >
              親としてログイン
            </button>
          </div>

          <!-- Student Login -->
          <div class="role-option bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-purple-500 transition-all">
            <h4 class="text-lg font-semibold text-white mb-2">
              🎮 生徒 (Student)
            </h4>
            <p class="text-slate-400 text-sm mb-4">ゲームプレイ、学習セッション機能にアクセス</p>
            <button 
              @click="loginAsStudent"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors font-medium"
            >
              生徒としてログイン
            </button>
          </div>

          <!-- Guest Access -->
          <div class="role-option bg-slate-700/50 p-6 rounded-lg border border-slate-600 hover:border-yellow-500 transition-all">
            <h4 class="text-lg font-semibold text-white mb-2">
              👤 ゲスト (Guest)
            </h4>
            <p class="text-slate-400 text-sm mb-4">基本的なゲームプレイ機能にアクセス（制限あり）</p>
            <button 
              @click="continueAsGuest"
              :disabled="isLoading"
              class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white rounded-lg transition-colors font-medium"
            >
              ゲストとして続行
            </button>
          </div>
        </div>
      </div>

      <!-- Current Status -->
      <div v-if="currentUser" class="current-status mt-8 p-6 bg-slate-700/30 rounded-lg border border-slate-600">
        <h3 class="text-lg font-semibold text-white mb-4">現在のログイン状態</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="status-item">
            <span class="label text-slate-400">ユーザー:</span>
            <span class="value text-white font-medium">{{ currentUser }}</span>
          </div>
          <div class="status-item">
            <span class="label text-slate-400">ロール:</span>
            <span class="value text-white font-medium">{{ currentRole }}</span>
          </div>
          <div class="status-item">
            <span class="label text-slate-400">アクセス:</span>
            <span class="value text-white font-medium">{{ currentAccess }}</span>
          </div>
        </div>
        <button 
          @click="logout"
          class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
        >
          ログアウト
        </button>
      </div>

      <!-- Navigation Info -->
      <div class="navigation-info mt-8 p-6 bg-blue-900/20 rounded-lg border border-blue-700/50">
        <h3 class="text-lg font-semibold text-blue-300 mb-4">アクセス方法</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="access-method flex items-center gap-3">
            <div class="text-blue-400 text-xl">🏠</div>
            <span class="text-blue-200">ホーム画面の「システムダッシュボード」セクション</span>
          </div>
          <div class="access-method flex items-center gap-3">
            <div class="text-blue-400 text-xl">⚡</div>
            <span class="text-blue-200">画面右端のクイックアクセスパネル</span>
          </div>
          <div class="access-method flex items-center gap-3">
            <div class="text-blue-400 text-xl">📱</div>
            <span class="text-blue-200">ヘッダーナビゲーション（準備中）</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="demo-actions flex flex-col sm:flex-row gap-4 mt-8">
        <button @click="goHome" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium">
          🏠 ホームに戻る
        </button>
        <button @click="openQuickAccess" class="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
          ⚡ ダッシュボード一覧を見る
        </button>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-slate-800 p-6 rounded-lg border border-slate-700 text-center">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-white">ログイン中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default {
  name: 'SimpleDemoLogin',
  setup() {
    const router = useRouter()
    const isLoading = ref(false)
    const currentUser = ref(null)
    const currentRole = ref(null)
    const currentAccess = ref(null)

    const loginAsTeacher = async () => {
      isLoading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate login
        currentUser.value = 'teacher@movwise.app'
        currentRole.value = '講師'
        currentAccess.value = 'プロプラン'
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
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate login
        currentUser.value = 'parent@movwise.app'
        currentRole.value = '親'
        currentAccess.value = 'ファミリープラン'
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
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate login
        currentUser.value = 'student@movwise.app'
        currentRole.value = '生徒'
        currentAccess.value = 'スタータープラン'
        alert('生徒としてログインしました！\n\n利用可能な機能:\n• ゲームプレイ\n• 学習セッション\n• 進歩確認')
      } catch (error) {
        logger.error('Student login failed:', error)
        alert('ログインに失敗しました')
      } finally {
        isLoading.value = false
      }
    }

    const continueAsGuest = () => {
      currentUser.value = 'ゲスト'
      currentRole.value = 'ゲスト'
      currentAccess.value = 'フリープラン'
      alert('ゲストモードで続行します！\n\n利用可能な機能:\n• 基本的なゲームプレイ\n• 制限付きアクセス')
      router.push('/')
    }

    const logout = () => {
      currentUser.value = null
      currentRole.value = null
      currentAccess.value = null
      alert('ログアウトしました')
    }

    const goHome = () => {
      router.push('/')
    }

    const openQuickAccess = () => {
      alert('画面右端の青いボタンをクリックして\nクイックアクセスパネルを開いてください！')
    }

    return {
      isLoading,
      currentUser,
      currentRole,
      currentAccess,
      loginAsTeacher,
      loginAsParent,
      loginAsStudent,
      continueAsGuest,
      logout,
      goHome,
      openQuickAccess
    }
  }
}
</script>

<style scoped>
.demo-login-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.role-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
</style>