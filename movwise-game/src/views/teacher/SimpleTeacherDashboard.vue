<template>
  <div class="simple-teacher-dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
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
                <p class="text-sm text-slate-400">シンプル版</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-6">
      <div class="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 class="text-xl font-bold text-white mb-4">講師ダッシュボード - テスト版</h2>
        <p class="text-slate-300 mb-4">このページは正常に表示されています。</p>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div class="bg-slate-700/50 p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">総生徒数</p>
                <p class="text-3xl font-bold text-white">25</p>
              </div>
              <div class="text-3xl opacity-60">👥</div>
            </div>
          </div>
          
          <div class="bg-slate-700/50 p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">アクティブ生徒</p>
                <p class="text-3xl font-bold text-white">8</p>
              </div>
              <div class="text-3xl opacity-60">🟢</div>
            </div>
          </div>
          
          <div class="bg-slate-700/50 p-6 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-400 text-sm">今日のセッション</p>
                <p class="text-3xl font-bold text-white">12</p>
              </div>
              <div class="text-3xl opacity-60">📊</div>
            </div>
          </div>
        </div>

        <!-- Test Info -->
        <div class="mt-8 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
          <p class="text-blue-300">
            ✅ Vue コンポーネントは正常に動作しています<br>
            ✅ スタイルが適用されています<br>
            ✅ ルーティングは機能しています
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import logger from '@/utils/logger'

export default {
  name: 'SimpleTeacherDashboard',
  mounted() {
    logger.log('✅ SimpleTeacherDashboard mounted successfully')
  }
}
</script>

<style scoped>
.simple-teacher-dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>