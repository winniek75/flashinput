<template>
  <div class="parent-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
              <div class="text-3xl">👨‍👩‍👧‍👦</div>
              <div>
                <h1 class="text-2xl font-bold text-white">MovWISE 親ポータル</h1>
                <p class="text-sm text-slate-400">お子様の学習状況を確認</p>
              </div>
            </div>
          </div>

          <!-- Status & Actions -->
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Notifications -->
            <div class="relative">
              <button 
                @click="showNotifications = !showNotifications"
                class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg transition-all hover:bg-slate-600/70"
              >
                <span class="text-xl">🔔</span>
                <span v-if="unreadNotifications > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ unreadNotifications }}
                </span>
              </button>
            </div>

            <!-- Parent Info -->
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <div class="text-2xl">👨‍👩‍👧‍👦</div>
              <div class="text-left">
                <div class="text-white font-medium">保護者</div>
                <div class="text-xs text-slate-400">Parent</div>
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

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-3xl font-bold text-white">{{ totalChildren }}</h3>
                <p class="text-slate-400 mt-2">お子様の数</p>
              </div>
              <div class="text-3xl">👧👦</div>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-3xl font-bold text-white">{{ activeToday }}</h3>
                <p class="text-slate-400 mt-2">今日のアクティブ</p>
              </div>
              <div class="text-3xl">🎮</div>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-3xl font-bold text-white">{{ averageProgress }}</h3>
                <p class="text-slate-400 mt-2">平均進捗</p>
              </div>
              <div class="text-3xl">📊</div>
            </div>
          </div>

          <div class="stat-card bg-slate-800/90 p-6 rounded-lg border border-slate-700">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-3xl font-bold text-white">{{ weeklyHours }}</h3>
                <p class="text-slate-400 mt-2">週間学習時間</p>
              </div>
              <div class="text-3xl">⏰</div>
            </div>
          </div>
        </div>

        <!-- Children Progress -->
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 class="text-xl font-bold text-white mb-6">お子様の学習状況</h2>
          <div class="space-y-4">
            <div v-for="child in children" :key="child.id" class="bg-slate-700/30 p-4 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ child.avatar }}</div>
                  <div>
                    <h3 class="text-white font-medium">{{ child.name }}</h3>
                    <p class="text-slate-300 text-sm">{{ child.grade }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-white font-bold">{{ child.progress }}%</div>
                  <div class="text-slate-300 text-sm">完了</div>
                </div>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: child.progress + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-sm text-slate-300">
                <span>最後のアクティビティ: {{ child.lastActivity }}</span>
                <span>今週: {{ child.weeklyTime }}時間</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-6">最近のアクティビティ</h2>
          <div class="space-y-3">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
              <div class="text-2xl">{{ activity.icon }}</div>
              <div class="flex-1">
                <p class="text-white">{{ activity.message }}</p>
                <p class="text-sm text-slate-400">{{ activity.time }}</p>
              </div>
              <div v-if="activity.score" class="text-right">
                <div class="text-white font-bold">{{ activity.score }}点</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Tab -->
      <div v-if="activeTab === 'progress'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">進捗レポート</h2>
          <p class="text-slate-300">詳細な進捗レポート機能がここに表示されます。</p>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">設定</h2>
          <p class="text-slate-300">通知設定やアカウント管理がここに表示されます。</p>
        </div>
      </div>

      <!-- Communication Tab -->
      <div v-if="activeTab === 'communication'" class="tab-content">
        <div class="bg-slate-800/90 rounded-lg p-6 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-4">コミュニケーション</h2>
          <p class="text-slate-300">講師とのメッセージ機能がここに表示されます。</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref, onMounted } from 'vue'

export default {
  name: 'SimpleParentDashboard',
  setup() {
    const activeTab = ref('overview')
    const showNotifications = ref(false)
    const unreadNotifications = ref(2)

    const tabs = [
      { id: 'overview', name: '概要' },
      { id: 'progress', name: '進捗' },
      { id: 'communication', name: 'コミュニケーション' },
      { id: 'settings', name: '設定' }
    ]

    // Mock data
    const totalChildren = ref(2)
    const activeToday = ref(1)
    const averageProgress = ref(78)
    const weeklyHours = ref(12)

    const children = ref([
      {
        id: 1,
        name: 'Yuki',
        avatar: '👧',
        grade: '小学3年生',
        progress: 85,
        lastActivity: '2時間前',
        weeklyTime: 8
      },
      {
        id: 2,
        name: 'Taro',
        avatar: '👦',
        grade: '小学1年生',
        progress: 72,
        lastActivity: '4時間前',
        weeklyTime: 4
      }
    ])

    const recentActivities = ref([
      {
        id: 1,
        icon: '🎯',
        message: 'Yuki がPhonics Trainingを完了しました',
        time: '2時間前',
        score: 95
      },
      {
        id: 2,
        icon: '🌟',
        message: 'Taro が新しいレベルに到達しました',
        time: '4時間前'
      },
      {
        id: 3,
        icon: '👨‍🏫',
        message: '講師から新しいメッセージが届きました',
        time: '1日前'
      }
    ])

    onMounted(() => {
      logger.log('✅ SimpleParentDashboard mounted successfully')
    })

    return {
      activeTab,
      showNotifications,
      unreadNotifications,
      tabs,
      totalChildren,
      activeToday,
      averageProgress,
      weeklyHours,
      children,
      recentActivities
    }
  }
}
</script>

<style scoped>
.parent-dashboard {
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