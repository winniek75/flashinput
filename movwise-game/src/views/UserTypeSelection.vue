<template>
  <div class="min-h-screen galaxy-background flex items-center justify-center px-4">
    <!-- Background Stars -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <div class="relative z-10 w-full max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 fade-in-up">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 galaxy-text-primary cosmic-title">
          🌌 MovWISE Academy
        </h1>
        <p class="text-xl md:text-2xl text-galaxy-moon-silver mb-4">
          ようこそ！音響銀河アカデミーへ
        </p>
        <p class="text-lg text-galaxy-moon-silver/80">
          あなたの学習スタイルに合わせたダッシュボードを選択してください
        </p>
      </div>

      <!-- User Type Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Student Card -->
        <div
          @click="selectUserType('student')"
          class="galaxy-card p-8 cursor-pointer transition-all hover-lift border-blue-500/50 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 group fade-in-up"
          style="animation-delay: 0.1s"
        >
          <div class="text-center">
            <div class="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
            <h3 class="text-2xl font-bold galaxy-text-primary mb-4">
              生徒として学習
            </h3>
            <p class="text-galaxy-moon-silver mb-6 leading-relaxed">
              宇宙を冒険しながら英語を習得！今日のミッションや進捗を確認して、楽しく学習を進めよう。
            </p>
            <div class="space-y-2 mb-6">
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                <span>今日のミッション管理</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                <span>学習進捗の確認</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                <span>VRチケット残高表示</span>
              </div>
            </div>
            <button class="w-full galaxy-button galaxy-button-primary text-white font-bold py-3 px-6 rounded-lg">
              学習を始める
            </button>
          </div>
        </div>

        <!-- Teacher Card -->
        <div
          @click="selectUserType('teacher')"
          class="galaxy-card p-8 cursor-pointer transition-all hover-lift border-green-500/50 bg-gradient-to-br from-green-900/30 to-emerald-900/30 group fade-in-up"
          style="animation-delay: 0.2s"
        >
          <div class="text-center">
            <div class="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👨‍🏫
            </div>
            <h3 class="text-2xl font-bold galaxy-text-primary mb-4">
              講師として管理
            </h3>
            <p class="text-galaxy-moon-silver mb-6 leading-relaxed">
              生徒の学習状況をリアルタイムで把握し、協力学習セッションを管理できます。
            </p>
            <div class="space-y-2 mb-6">
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                <span>生徒進捗の監視</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                <span>協力学習セッション</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                <span>学習分析レポート</span>
              </div>
            </div>
            <button class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
              管理を始める
            </button>
          </div>
        </div>

        <!-- Parent Card -->
        <div
          @click="selectUserType('parent')"
          class="galaxy-card p-8 cursor-pointer transition-all hover-lift border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30 group fade-in-up"
          style="animation-delay: 0.3s"
        >
          <div class="text-center">
            <div class="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
              👨‍👩‍👧‍👦
            </div>
            <h3 class="text-2xl font-bold galaxy-text-primary mb-4">
              保護者として確認
            </h3>
            <p class="text-galaxy-moon-silver mb-6 leading-relaxed">
              お子様の学習進捗や成果を確認し、学習をサポートできます。
            </p>
            <div class="space-y-2 mb-6">
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                <span>子どもの進捗確認</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                <span>学習時間の管理</span>
              </div>
              <div class="flex items-center text-sm text-galaxy-moon-silver/80">
                <span class="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                <span>成果レポート</span>
              </div>
            </div>
            <button class="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
              確認を始める
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="text-center fade-in-up" style="animation-delay: 0.4s">
        <p class="text-sm text-galaxy-moon-silver/60 mb-4">
          ※ 後からダッシュボードの種類は変更できます
        </p>
        <button
          @click="$router.push('/')"
          class="text-galaxy-moon-silver/80 hover:text-white transition-colors underline"
        >
          元のホーム画面に戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import logger from '@/utils/logger'

export default {
  name: 'UserTypeSelection',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const selectUserType = async (userType) => {
      try {
        logger.log(`🎯 User type selected: ${userType}`)

        // ユーザータイプを保存
        await userStore.setUserType(userType)

        // 対応するダッシュボードにリダイレクト
        switch (userType) {
          case 'student':
            router.push({ name: 'DashboardStudent' })
            break
          case 'teacher':
            router.push({ name: 'DashboardTeacher' })
            break
          case 'parent':
            router.push({ name: 'DashboardParent' })
            break
          default:
            router.push('/')
        }
      } catch (error) {
        logger.error('Failed to select user type:', error)
        alert('ユーザータイプの選択中にエラーが発生しました。')
      }
    }

    return {
      selectUserType
    }
  }
}
</script>

<style scoped>
.galaxy-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

.galaxy-text-primary {
  background: linear-gradient(45deg,
    #60A5FA 0%,
    #A78BFA 25%,
    #F472B6 50%,
    #FBBF24 75%,
    #60A5FA 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 300% 300%;
  animation: cosmic-text-flow 4s ease-in-out infinite;
}

.text-galaxy-moon-silver {
  color: #94A3B8;
}

.galaxy-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.galaxy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(59, 130, 246, 0.8) 50%,
    transparent 100%);
  animation: data-stream 3s linear infinite;
}

.galaxy-button {
  background: linear-gradient(135deg,
    rgba(79, 172, 254, 0.3) 0%,
    rgba(0, 242, 254, 0.3) 100%);
  border: 2px solid rgba(79, 172, 254, 0.8);
  box-shadow:
    0 0 20px rgba(79, 172, 254, 0.4),
    inset 0 0 20px rgba(0, 242, 254, 0.2);
  position: relative;
  overflow: hidden;
}

.galaxy-button-primary {
  background: linear-gradient(135deg,
    rgba(79, 172, 254, 0.5) 0%,
    rgba(0, 242, 254, 0.5) 100%);
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .cosmic-title {
    font-size: 3rem;
  }

  .galaxy-card {
    padding: 1.5rem;
  }

  .text-6xl {
    font-size: 3rem;
  }
}
</style>