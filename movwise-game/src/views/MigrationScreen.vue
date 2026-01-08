<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden flex items-center justify-center">
    <!-- 背景パーティクル -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in backgroundParticles"
        :key="particle.id"
        class="absolute bg-white rounded-full opacity-20"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animation: `float ${particle.duration}s ease-in-out infinite`,
          animationDelay: `${particle.delay}s`
        }"
      />
    </div>

    <!-- 宇宙背景エフェクト -->
    <div class="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent"></div>
    <div class="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-pulse"></div>
    <div class="absolute bottom-20 left-20 w-24 h-24 border border-white/10 rounded-full animate-pulse" style="animation-delay: 1s;"></div>

    <!-- メインコンテンツ -->
    <div class="relative z-10 w-full max-w-4xl mx-auto px-6">
      <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
        
        <!-- ヘッダー -->
        <div class="text-center mb-8">
          <div class="text-8xl mb-4 animate-bounce">🚀</div>
          <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            MovWISE データ移行
          </h1>
          <p class="text-white/80 text-lg">
            VR対応統一プレイヤープロフィールシステムへようこそ
          </p>
        </div>

        <!-- 移行前の情報表示 -->
        <div v-if="migrationPhase === 'detection'" class="space-y-6">
          <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div class="animate-spin text-2xl">🔍</div>
              既存データの検出中...
            </h3>
            
            <div class="grid gap-4">
              <div v-for="(detection, index) in dataDetections" :key="index" 
                   class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{{ detection.icon }}</div>
                  <div>
                    <div class="text-white font-medium">{{ detection.name }}</div>
                    <div class="text-white/60 text-sm">{{ detection.description }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div v-if="detection.found" class="text-green-400 text-2xl">✅</div>
                  <div v-else class="text-gray-500 text-2xl">⭕</div>
                  <div class="text-white/80 text-sm">
                    {{ detection.found ? `${detection.dataSize} items` : 'No data' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 検出結果サマリー -->
          <div v-if="detectionComplete" class="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-300/30">
            <h3 class="text-xl font-bold text-white mb-4">検出結果</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-blue-400">{{ totalGamesFound }}</div>
                <div class="text-white/70 text-sm">ゲームデータ</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-green-400">{{ totalProgressFound }}</div>
                <div class="text-white/70 text-sm">進捗データ</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-purple-400">{{ totalAchievementsFound }}</div>
                <div class="text-white/70 text-sm">実績データ</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-yellow-400">{{ totalScoresFound }}</div>
                <div class="text-white/70 text-sm">スコアデータ</div>
              </div>
            </div>
            
            <div class="mt-6 flex gap-4">
              <button
                @click="startMigration"
                class="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <div class="text-xl">🚀</div>
                データ移行を開始
              </button>
              <button
                @click="skipMigration"
                class="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
              >
                スキップ
              </button>
            </div>
          </div>
        </div>

        <!-- 移行中の進捗表示 -->
        <div v-if="migrationPhase === 'migrating'" class="space-y-6">
          <div class="text-center">
            <div class="text-6xl mb-4 animate-spin">⚙️</div>
            <h3 class="text-2xl font-bold text-white mb-2">データ移行中...</h3>
            <p class="text-white/70">しばらくお待ちください</p>
          </div>

          <!-- 進捗バー -->
          <div class="bg-white/10 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-white font-medium">{{ currentMigrationStep }}</span>
              <span class="text-white/70">{{ Math.round(migrationProgress) }}%</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                :style="{ width: migrationProgress + '%' }"
              ></div>
            </div>
            
            <!-- 詳細ログ -->
            <div class="mt-4 max-h-32 overflow-y-auto">
              <div v-for="(log, index) in migrationLogs" :key="index" 
                   class="text-sm text-white/60 py-1">
                {{ log }}
              </div>
            </div>
          </div>

          <!-- 統計リアルタイム更新 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-green-400">{{ migrationStats.gamesProcessed }}</div>
              <div class="text-white/70 text-sm">処理済みゲーム</div>
            </div>
            <div class="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-blue-400">{{ migrationStats.skillsUpdated }}</div>
              <div class="text-white/70 text-sm">スキル更新</div>
            </div>
            <div class="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-purple-400">{{ migrationStats.achievementsUnlocked }}</div>
              <div class="text-white/70 text-sm">実績解除</div>
            </div>
            <div class="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-yellow-400">{{ migrationStats.crystalsAwarded }}</div>
              <div class="text-white/70 text-sm">クリスタル獲得</div>
            </div>
          </div>
        </div>

        <!-- 移行完了画面 -->
        <div v-if="migrationPhase === 'completed'" class="space-y-6 text-center">
          <div class="text-8xl mb-4 animate-bounce">🎉</div>
          <h3 class="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
            移行完了！
          </h3>
          <p class="text-white/80 text-lg mb-6">
            データの移行が正常に完了しました。新しいVR対応プレイヤープロフィールをお楽しみください！
          </p>

          <!-- 移行結果サマリー -->
          <div class="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-green-300/30">
            <h4 class="text-xl font-bold text-white mb-4">移行結果</h4>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-green-400">{{ finalStats.gamesProcessed }}</div>
                <div class="text-white/70 text-sm">ゲーム移行</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-blue-400">{{ finalStats.skillsUpdated }}</div>
                <div class="text-white/70 text-sm">スキル向上</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-purple-400">{{ finalStats.achievementsUnlocked }}</div>
                <div class="text-white/70 text-sm">実績獲得</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-yellow-400">{{ finalStats.crystalsAwarded }}</div>
                <div class="text-white/70 text-sm">クリスタル</div>
              </div>
              <div class="bg-white/10 rounded-lg p-3">
                <div class="text-2xl font-bold text-pink-400">{{ finalStats.experienceGained }}</div>
                <div class="text-white/70 text-sm">経験値</div>
              </div>
            </div>

            <!-- プレイヤーレベル表示 -->
            <div class="mt-6 bg-white/10 rounded-lg p-4">
              <div class="flex items-center justify-center gap-4">
                <div class="text-4xl">{{ playerProfile.avatar }}</div>
                <div class="text-left">
                  <div class="text-xl font-bold text-white">{{ playerProfile.name }}</div>
                  <div class="text-white/70">{{ playerProfile.title }}</div>
                  <div class="text-sm text-white/60">
                    レベル {{ playerProfile.level }} | VR準備度: {{ vrReadiness }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- VR準備状況 -->
          <div v-if="vrReadiness >= 40" class="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-300/30">
            <div class="text-4xl mb-2">🥽</div>
            <h4 class="text-xl font-bold text-white mb-2">VR学習準備完了！</h4>
            <p class="text-white/80 text-sm">
              VR準備度が{{ vrReadiness }}%に達しています。VRアカデミーでの学習体験をお楽しみください！
            </p>
          </div>

          <button
            @click="enterApplication"
            class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            <div class="text-2xl">🚀</div>
            MovWISEを開始
          </button>
        </div>

        <!-- エラー画面 -->
        <div v-if="migrationPhase === 'error'" class="space-y-6 text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-2xl font-bold text-red-400 mb-4">移行エラー</h3>
          <p class="text-white/80 mb-6">
            データ移行中にエラーが発生しました。バックアップから復元するか、新しいプロフィールで開始できます。
          </p>

          <div class="bg-red-500/20 border border-red-400/30 rounded-lg p-4 text-left">
            <h4 class="font-bold text-red-400 mb-2">エラー詳細:</h4>
            <div class="text-white/70 text-sm space-y-1">
              <div v-for="error in migrationErrors" :key="error">• {{ error }}</div>
            </div>
          </div>

          <div class="flex gap-4">
            <button
              @click="restoreFromBackup"
              class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-xl font-bold transition-colors"
            >
              バックアップから復元
            </button>
            <button
              @click="startFresh"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-bold transition-colors"
            >
              新しく開始
            </button>
          </div>
        </div>

        <!-- フッター -->
        <div class="mt-8 text-center">
          <div class="text-white/40 text-sm">
            MovWISE VR対応統一プレイヤープロフィールシステム v{{ migrationVersion }}
          </div>
          <div v-if="backupCreated" class="text-green-400/70 text-xs mt-1">
            ✓ データバックアップ作成済み
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataMigrationSystem from '@/utils/dataMigration'
import { usePlayerProfileStore } from '@/stores/playerProfile'

const router = useRouter()
const playerProfileStore = usePlayerProfileStore()

// 状態管理
const migrationPhase = ref('detection') // 'detection', 'migrating', 'completed', 'error'
const migrationProgress = ref(0)
const currentMigrationStep = ref('初期化中...')
const detectionComplete = ref(false)
const backupCreated = ref(false)
const migrationVersion = '1.0.0'

// データ検出結果
const dataDetections = ref([
  { name: 'ゲーム基本データ', description: 'プレイヤー情報、進捗、実績', icon: '🎮', found: false, dataSize: 0 },
  { name: 'TypingArena', description: 'キャラクター、ストーリー進捗', icon: '⌨️', found: false, dataSize: 0 },
  { name: 'Grammar Galaxy', description: '文法学習の進捗', icon: '🌌', found: false, dataSize: 0 },
  { name: 'SightWord Master', description: '重要単語の習得状況', icon: '👁️', found: false, dataSize: 0 },
  { name: 'AI練習データ', description: 'AI会話の練習記録', icon: '🤖', found: false, dataSize: 0 },
  { name: 'キャラクター設定', description: 'アバター、称号設定', icon: '👤', found: false, dataSize: 0 },
  { name: 'VR設定', description: 'VR関連の設定情報', icon: '🥽', found: false, dataSize: 0 }
])

// 統計データ
const migrationStats = ref({
  gamesProcessed: 0,
  skillsUpdated: 0,
  achievementsUnlocked: 0,
  crystalsAwarded: 0,
  experienceGained: 0
})

const finalStats = ref({
  gamesProcessed: 0,
  skillsUpdated: 0,
  achievementsUnlocked: 0,
  crystalsAwarded: 0,
  experienceGained: 0
})

const migrationLogs = ref([])
const migrationErrors = ref([])

// 背景パーティクル
const backgroundParticles = ref(Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 10 + 5,
  delay: Math.random() * 5
})))

// 計算プロパティ
const totalGamesFound = computed(() => 
  dataDetections.value.reduce((sum, detection) => sum + (detection.found ? detection.dataSize : 0), 0)
)

const totalProgressFound = computed(() => 
  dataDetections.value.filter(d => d.found && d.name.includes('進捗')).length
)

const totalAchievementsFound = computed(() => 
  dataDetections.value.filter(d => d.found && d.name.includes('実績')).length
)

const totalScoresFound = computed(() => 
  dataDetections.value.filter(d => d.found && d.name.includes('スコア')).length
)

const playerProfile = computed(() => ({
  name: playerProfileStore.profile.name,
  title: playerProfileStore.profile.title,
  level: playerProfileStore.profile.level,
  avatar: playerProfileStore.profile.avatar
}))

const vrReadiness = computed(() => playerProfileStore.overallVRReadiness)

// メソッド
const detectExistingData = async () => {
  currentMigrationStep.value = 'データ検出中...'
  
  const storeKeys = [
    { key: 'movwiseGameData', index: 0 },
    { key: 'typingArena', index: 1 },
    { key: 'grammarGalaxy', index: 2 },
    { key: 'sightWordMaster', index: 3 },
    { key: 'aiPractice', index: 4 },
    { key: 'characterStore', index: 5 },
    { key: 'vrSettings', index: 6 }
  ]

  for (const { key, index } of storeKeys) {
    await new Promise(resolve => setTimeout(resolve, 300)) // アニメーション用の遅延
    
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        dataDetections.value[index].found = true
        dataDetections.value[index].dataSize = Object.keys(parsed).length
      } catch {
        // JSONでない場合もデータとして認識
        dataDetections.value[index].found = true
        dataDetections.value[index].dataSize = 1
      }
    }
  }

  detectionComplete.value = true
  currentMigrationStep.value = '検出完了'
}

const startMigration = async () => {
  migrationPhase.value = 'migrating'
  migrationProgress.value = 0
  migrationLogs.value = []
  
  const migrationSystem = new DataMigrationSystem()
  
  try {
    // 進捗更新をシミュレート
    const steps = [
      { step: 'バックアップ作成中...', progress: 10 },
      { step: 'ゲーム基本データ移行中...', progress: 25 },
      { step: 'TypingArenaデータ移行中...', progress: 40 },
      { step: 'Grammar Galaxyデータ移行中...', progress: 55 },
      { step: 'その他のゲームデータ移行中...', progress: 70 },
      { step: 'VR準備度計算中...', progress: 85 },
      { step: '最終処理中...', progress: 100 }
    ]

    for (const { step, progress } of steps) {
      currentMigrationStep.value = step
      migrationProgress.value = progress
      migrationLogs.value.push(`${new Date().toLocaleTimeString()}: ${step}`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // 実際のマイグレーション実行
    const result = await migrationSystem.executeMigration()
    
    if (result.success) {
      finalStats.value = result.migratedData
      migrationStats.value = result.migratedData
      backupCreated.value = true
      migrationPhase.value = 'completed'
      
      migrationLogs.value.push(`${new Date().toLocaleTimeString()}: 移行完了！`)
    } else {
      migrationErrors.value = result.errors
      migrationPhase.value = 'error'
    }
    
  } catch (error) {
    logger.error('Migration failed:', error)
    migrationErrors.value = [error.message || 'Unknown error occurred']
    migrationPhase.value = 'error'
  }
}

const skipMigration = () => {
  // 新しいプロフィールで開始
  playerProfileStore.initializeAchievements()
  enterApplication()
}

const restoreFromBackup = async () => {
  try {
    const restored = await DataMigrationSystem.restoreFromBackup()
    if (restored) {
      migrationPhase.value = 'completed'
      // 統計をリセット
      finalStats.value = {
        gamesProcessed: 0,
        skillsUpdated: 0,
        achievementsUnlocked: 0,
        crystalsAwarded: 0,
        experienceGained: 0
      }
    } else {
      migrationErrors.value.push('バックアップファイルが見つかりません')
    }
  } catch (error) {
    migrationErrors.value.push(`復元エラー: ${error.message}`)
  }
}

const startFresh = () => {
  // データをクリアして新規開始
  localStorage.clear()
  playerProfileStore.initializeAchievements()
  enterApplication()
}

const enterApplication = () => {
  router.push('/')
}

// テスト用メソッド
const generateTestData = () => {
  DataMigrationSystem.generateTestData()
  // データ検出を再実行
  detectExistingData()
}

// ライフサイクル
onMounted(async () => {
  // 開発環境でのテストデータ生成
  if (import.meta.env.DEV) {
    logger.log('🧪 Development mode: Generating test data')
    generateTestData()
  }
  
  await detectExistingData()
})
</script>

<style scoped>
/* カスタムアニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
}

/* 背景グラデーション */
.bg-gradient-radial {
  background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
}

/* パーティクルアニメーション */
.particle {
  animation: float 6s ease-in-out infinite;
}

/* カスタムスクロールバー */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* ホバーエフェクト */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* 進捗バー */
.transition-all {
  transition: all 0.3s ease;
}
</style>