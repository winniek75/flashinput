<template>
  <div class="enhanced-teacher-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- Logo & Title -->
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')"
              class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-slate-300">ホーム</span>
            </button>
            <div class="flex items-center gap-3">
              <div class="text-3xl">👨‍🏫</div>
              <div>
                <h1 class="text-2xl font-bold text-white">MovWISE 講師ダッシュボード</h1>
                <p class="text-sm text-slate-400">統合学習管理システム</p>
              </div>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Online Status -->
            <div class="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span class="text-green-400 font-medium text-sm">オンライン</span>
            </div>

            <!-- Teacher Info -->
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <div class="text-2xl">👨‍🏫</div>
              <div class="text-left">
                <div class="text-white font-medium">講師</div>
                <div class="text-xs text-slate-400">管理者</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Dashboard -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <!-- Navigation Tabs -->
      <div class="dashboard-tabs mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button px-6 py-3 mr-2 rounded-lg transition-all"
          :class="{ 'bg-blue-600 text-white': activeTab === tab.id, 'bg-slate-700 text-slate-300 hover:bg-slate-600': activeTab !== tab.id }"
        >
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Dashboard Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="stat-content">
              <div class="stat-header flex justify-between items-start">
                <h3 class="text-3xl font-bold text-white">{{ totalStudents }}</h3>
                <div class="stat-icon text-3xl">👥</div>
              </div>
              <p class="stat-label text-slate-400 mt-2">総生徒数</p>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="stat-content">
              <div class="stat-header flex justify-between items-start">
                <h3 class="text-3xl font-bold text-white">{{ activeStudents }}</h3>
                <div class="stat-icon text-3xl">🟢</div>
              </div>
              <p class="stat-label text-slate-400 mt-2">アクティブ生徒</p>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="stat-content">
              <div class="stat-header flex justify-between items-start">
                <h3 class="text-3xl font-bold text-white">{{ todaySessionsCount }}</h3>
                <div class="stat-icon text-3xl">🎮</div>
              </div>
              <p class="stat-label text-slate-400 mt-2">今日のセッション</p>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="stat-content">
              <div class="stat-header flex justify-between items-start">
                <h3 class="text-3xl font-bold text-white">{{ totalClasses }}</h3>
                <div class="stat-icon text-3xl">📚</div>
              </div>
              <p class="stat-label text-slate-400 mt-2">クラス数</p>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-red-700/50">
            <div class="stat-content">
              <div class="stat-header flex justify-between items-start">
                <h3 class="text-3xl font-bold text-red-400">{{ pendingEmergencyCalls }}</h3>
                <div class="stat-icon text-3xl">🚨</div>
              </div>
              <p class="stat-label text-red-400 mt-2">緊急コール</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">最近のアクティビティ</h2>
          <div class="space-y-3">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
              <div class="text-2xl">{{ activity.icon }}</div>
              <div class="flex-1">
                <p class="text-white">{{ activity.message }}</p>
                <p class="text-sm text-slate-400">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students Tab -->
      <div v-if="activeTab === 'students'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">生徒管理</h2>
          <p class="text-slate-300">生徒一覧と管理機能がここに表示されます。</p>
        </div>
      </div>

      <!-- Classes Tab -->
      <div v-if="activeTab === 'classes'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">クラス管理</h2>
          <p class="text-slate-300">クラス管理機能がここに表示されます。</p>
        </div>
      </div>

      <!-- Sessions Tab -->
      <div v-if="activeTab === 'sessions'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">セッション管理</h2>
          <p class="text-slate-300">セッション管理機能がここに表示されます。</p>
        </div>
      </div>

      <!-- AI Insights Tab -->
      <div v-if="activeTab === 'ai'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">AI学習分析</h2>
          <p class="text-slate-300">AI分析機能がここに表示されます。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FixedTeacherDashboard',
  setup() {
    const router = useRouter()
    
    // UI State
    const activeTab = ref('overview')
    
    // Dashboard tabs
    const tabs = [
      { id: 'overview', name: '概要' },
      { id: 'students', name: '生徒管理' },
      { id: 'classes', name: 'クラス管理' },
      { id: 'sessions', name: 'セッション' },
      { id: 'ai', name: 'AI分析' }
    ]
    
    // Mock data
    const totalStudents = ref(25)
    const activeStudents = ref(8)
    const todaySessionsCount = ref(12)
    const totalClasses = ref(3)
    const pendingEmergencyCalls = ref(0)
    
    const recentActivities = ref([
      {
        id: 1,
        icon: '👤',
        message: 'Yuki がPhonics Trainingを完了しました',
        time: '5分前'
      },
      {
        id: 2,
        icon: '🎮',
        message: 'Taro がGrammar Galaxyを開始しました',
        time: '10分前'
      },
      {
        id: 3,
        icon: '📊',
        message: 'クラスAの平均スコアが向上しました',
        time: '1時間前'
      }
    ])
    
    onMounted(() => {
      logger.log('✅ FixedTeacherDashboard mounted successfully')
    })
    
    return {
      activeTab,
      tabs,
      totalStudents,
      activeStudents,
      todaySessionsCount,
      totalClasses,
      pendingEmergencyCalls,
      recentActivities
    }
  }
}
</script>

<style scoped>
.enhanced-teacher-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.tab-button {
  font-weight: 500;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
</style>