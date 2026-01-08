<template>
  <div class="min-h-screen galaxy-background overflow-hidden">
    <!-- Dynamic Background -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
      <div class="nebula-overlay"></div>
    </div>

    <!-- Loading State -->
    <div v-if="isCheckingAuth" class="relative z-10 min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4 animate-pulse">🌌</div>
        <h2 class="text-2xl font-bold galaxy-text-primary mb-2">MovWISE Academy</h2>
        <p class="text-galaxy-moon-silver">初期化中...</p>
      </div>
    </div>

    <!-- User Type Selection (未認証ユーザー用) -->
    <div v-else-if="showUserTypeSelection" class="relative z-10 min-h-screen px-6 py-8">
      <div class="max-w-7xl w-full mx-auto">
        <!-- Header -->
        <div class="text-center mb-8 fade-in-down">
          <h1
            @click="handleSecretClick"
            class="text-4xl md:text-6xl font-bold mb-2 galaxy-text-glow cursor-pointer select-none"
            title="Triple click for admin mode"
          >
            <span class="inline-block hover:scale-105 transition-transform duration-300">🌌</span>
            <span class="ml-2">MovWISE Academy</span>
          </h1>
          <p class="text-lg md:text-xl text-galaxy-moon-silver/90 font-light">
            音響銀河を救う英語習得の旅
          </p>
        </div>

        <!-- AI Smart Recommendations -->
        <div class="mb-8">
          <SmartRecommendationWidget
            :userId="getCurrentUserId()"
            @gameSelected="handleGameSelection"
            @showAIDashboard="showAIDashboard"
            @showAIDemo="showAIDemo"
          />
        </div>

        <!-- Platform Hub Integration for Preview -->
        <div class="mb-8">
          <PlatformHub />
        </div>

        <!-- User Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Student Card -->
          <button
            @click="selectUserType('student')"
            class="user-type-card border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 group"
          >
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🚀</div>
            <h3 class="text-xl font-bold galaxy-text-primary mb-2">生徒として学習</h3>
            <p class="text-sm text-galaxy-moon-silver">宇宙を冒険しながら英語を習得</p>
          </button>

          <!-- Teacher Card -->
          <button
            @click="selectUserType('teacher')"
            class="user-type-card border-green-500/50 bg-gradient-to-br from-green-900/30 to-emerald-900/30 group"
          >
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">👨‍🏫</div>
            <h3 class="text-xl font-bold galaxy-text-primary mb-2">講師として管理</h3>
            <p class="text-sm text-galaxy-moon-silver">生徒の学習状況をリアルタイム管理</p>
          </button>

          <!-- Parent Card -->
          <button
            @click="selectUserType('parent')"
            class="user-type-card border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30 group"
          >
            <div class="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">👨‍👩‍👧‍👦</div>
            <h3 class="text-xl font-bold galaxy-text-primary mb-2">保護者として確認</h3>
            <p class="text-sm text-galaxy-moon-silver">お子様の学習進捗や成果を確認</p>
          </button>
        </div>

        <!-- Note -->
        <div class="text-center">
          <p class="text-sm text-galaxy-moon-silver/60">
            ※ 後からダッシュボードの種類は変更できます
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import PlatformHub from '@/components/platforms/PlatformHub.vue'
import SmartRecommendationWidget from '@/components/ai/SmartRecommendationWidget.vue'
import logger from '@/utils/logger'

export default {
  name: 'HomeView',
  components: {
    PlatformHub,
    SmartRecommendationWidget
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const progressStore = useProgressStore()

    // Data
    const secretClickCount = ref(0)
    const secretClickTimer = ref(null)
    const isCheckingAuth = ref(true)
    const showUserTypeSelection = ref(false)

    // Methods
    const handleSecretClick = () => {
      secretClickCount.value++

      if (secretClickTimer.value) {
        clearTimeout(secretClickTimer.value)
      }

      if (secretClickCount.value >= 3) {
        logger.log('🎭 Secret admin mode activated!')
        selectUserType('teacher')
        secretClickCount.value = 0
        return
      }

      secretClickTimer.value = setTimeout(() => {
        secretClickCount.value = 0
      }, 2000)
    }

    const selectUserType = async (userType) => {
      try {
        console.log('=== selectUserType called ===', userType)
        logger.log(`🎯 User type selected: ${userType}`)

        // ユーザータイプを保存
        await userStore.setUserType(userType)

        // ログイン画面へ遷移（実際の認証が必要）
        console.log('Navigating to login page...')
        await router.push({
          name: 'login',
          query: { userType }
        })
        console.log('Navigation complete')
      } catch (error) {
        logger.error('Failed to select user type:', error)
        alert('ユーザータイプの選択中にエラーが発生しました。')
      }
    }

    // 認証状態をチェックして適切な画面にリダイレクト
    const checkAuthAndRedirect = async () => {
      try {
        logger.log('🔍 Checking authentication state...')

        // 少し待機して認証状態を確認
        await new Promise(resolve => setTimeout(resolve, 100))

        // 認証状態を詳細にチェック
        const user = authStore.currentUser
        const isAuthenticated = authStore.isAuthenticated
        const firebaseUser = authStore.firebaseUser

        logger.log('Auth check details:', {
          user: !!user,
          isAuthenticated,
          firebaseUser: !!firebaseUser,
          uid: user?.uid
        })

        if (user?.uid && isAuthenticated) {
          // ログイン済みユーザー
          logger.log('🔐 User is authenticated, redirecting to main platform')

          // Firebase から進捗データを読み込み
          await progressStore.loadFromFirebase()

          // 生徒ダッシュボードにリダイレクト
          router.push('/dashboard/student')
        } else {
          // 未認証ユーザー：ユーザータイプ選択を表示
          showUserTypeSelection.value = true
          logger.log('👋 Unauthenticated user, showing type selection')
        }
      } catch (error) {
        logger.error('Auth check failed:', error)
        // エラー時はユーザータイプ選択を表示
        showUserTypeSelection.value = true
      } finally {
        isCheckingAuth.value = false
      }
    }

    // マウント時に認証チェック
    onMounted(async () => {
      await checkAuthAndRedirect()
    })

    // AI widget methods
    const getCurrentUserId = () => {
      return authStore.currentUser?.uid || 'guest'
    }

    const handleGameSelection = (recommendation) => {
      logger.log('🎮 Game selected from AI recommendation:', recommendation)
      // Game selection is handled by the widget's navigation
    }

    const showAIDashboard = () => {
      router.push('/ai-demo')
    }

    const showAIDemo = () => {
      router.push('/ai-testing')
    }

    return {
      handleSecretClick,
      selectUserType,
      isCheckingAuth,
      showUserTypeSelection,
      getCurrentUserId,
      handleGameSelection,
      showAIDashboard,
      showAIDemo
    }
  }
}
</script>

<style scoped>
/* Galaxy Background */
.galaxy-background {
  background: radial-gradient(ellipse at center, #1a1c5a 0%, #0a0b2e 50%, #000 100%);
  color: white;
  position: relative;
}

/* Stars Animation */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 160px 30px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
}

.stars-layer-1 {
  animation: stars-move 120s linear infinite;
  opacity: 0.6;
}

.stars-layer-2 {
  animation: stars-move 180s linear infinite reverse;
  opacity: 0.4;
  background-size: 250px 120px;
}

.stars-layer-3 {
  animation: stars-move 240s linear infinite;
  opacity: 0.2;
  background-size: 300px 150px;
}

.nebula-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1), transparent 70%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1), transparent 70%),
              radial-gradient(circle at 40% 40%, rgba(200, 119, 255, 0.05), transparent 70%);
  animation: nebula-drift 60s ease-in-out infinite alternate;
}

@keyframes stars-move {
  0% { transform: translateY(0); }
  100% { transform: translateY(-100px); }
}

@keyframes nebula-drift {
  0% { opacity: 0.3; transform: scale(1) rotate(0deg); }
  100% { opacity: 0.6; transform: scale(1.1) rotate(1deg); }
}

/* Typography */
.galaxy-text-glow {
  background: linear-gradient(45deg, #fff 0%, #e0e7ff 50%, #c7d2fe 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(199, 210, 254, 0.5);
  filter: drop-shadow(0 0 10px rgba(199, 210, 254, 0.3));
}

.galaxy-text-primary {
  color: #c7d2fe;
}

.galaxy-moon-silver {
  color: #94a3b8;
}

/* User Type Cards */
.user-type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: rgba(15, 23, 42, 0.9);
}

/* カード内のテキストスタイル強化 */
.user-type-card h3 {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 700;
}

.user-type-card p {
  color: #e2e8f0 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}


/* Animations */
.fade-in-down {
  animation: fade-in-down 0.8s ease-out;
}

.fade-in-up {
  animation: fade-in-up 0.8s ease-out;
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .galaxy-text-glow {
    font-size: 2.5rem;
  }

  .user-type-card {
    padding: 1.5rem 1rem;
  }
}
</style>