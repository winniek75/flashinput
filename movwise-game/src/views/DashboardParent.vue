<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-slate-800 to-slate-900">
    <!-- Header -->
    <header class="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo & Title -->
          <div class="flex items-center gap-4">
            <button
              @click="$router.push('/user-type-selection')"
              class="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-lg transition-all border border-slate-600/50"
            >
              <span class="text-xl">↩️</span>
              <span class="text-sm text-slate-300">戻る</span>
            </button>
            <div class="flex items-center gap-3">
              <div class="text-3xl">👨‍👩‍👧‍👦</div>
              <div>
                <h1 class="text-2xl font-bold text-white">MovWISE 保護者ポータル</h1>
                <p class="text-sm text-slate-400">お子様の学習進捗をサポート</p>
              </div>
            </div>
          </div>

          <!-- Parent Info -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 px-4 py-2 bg-slate-700/50 rounded-lg">
              <div class="text-2xl">👨‍👩‍👧‍👦</div>
              <div class="text-left">
                <div class="text-white font-medium">保護者 様</div>
                <div class="text-xs text-slate-400">お子様の学習をサポート</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Child Selection -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span class="text-3xl">👶</span>
          お子様選択
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="child in children"
            :key="child.id"
            @click="selectChild(child)"
            class="child-selector-card fade-in-up cursor-pointer"
            :class="{ 'selected': selectedChild?.id === child.id }"
            :style="{ animationDelay: `${child.id * 0.1}s` }"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="text-3xl">{{ child.avatar }}</div>
              <div class="flex-1">
                <div class="font-bold text-white">{{ child.name }}</div>
                <div class="text-sm text-slate-400">{{ child.age }}歳 • レベル {{ child.level }}</div>
              </div>
              <div
                class="w-3 h-3 rounded-full"
                :class="child.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'"
              ></div>
            </div>

            <div class="text-sm text-slate-300">
              今日の学習時間: <span class="font-bold text-blue-400">{{ child.todayStudyTime }}分</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Selected Child Dashboard -->
      <div v-if="selectedChild" class="space-y-8">
        <!-- Overview Cards -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="stats-card fade-in-up" style="animation-delay: 0.1s">
            <div class="flex items-center justify-between mb-4">
              <div class="text-2xl">⏱️</div>
              <div class="text-2xl font-bold text-blue-400">{{ selectedChild.todayStudyTime }}分</div>
            </div>
            <h3 class="text-white font-semibold mb-1">今日の学習時間</h3>
            <p class="text-slate-400 text-sm">目標: {{ selectedChild.dailyTarget }}分</p>
            <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                :style="{ width: `${Math.min((selectedChild.todayStudyTime / selectedChild.dailyTarget) * 100, 100)}%` }"
              ></div>
            </div>
          </div>

          <div class="stats-card fade-in-up" style="animation-delay: 0.2s">
            <div class="flex items-center justify-between mb-4">
              <div class="text-2xl">🔥</div>
              <div class="text-2xl font-bold text-orange-400">{{ selectedChild.streak }}</div>
            </div>
            <h3 class="text-white font-semibold mb-1">連続学習日数</h3>
            <p class="text-slate-400 text-sm">素晴らしい継続力！</p>
          </div>

          <div class="stats-card fade-in-up" style="animation-delay: 0.3s">
            <div class="flex items-center justify-between mb-4">
              <div class="text-2xl">🏆</div>
              <div class="text-2xl font-bold text-yellow-400">{{ selectedChild.level }}</div>
            </div>
            <h3 class="text-white font-semibold mb-1">現在のレベル</h3>
            <p class="text-slate-400 text-sm">次のレベルまであと{{ selectedChild.xpToNext }}XP</p>
            <div class="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                class="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                :style="{ width: `${selectedChild.levelProgress}%` }"
              ></div>
            </div>
          </div>

          <div class="stats-card fade-in-up" style="animation-delay: 0.4s">
            <div class="flex items-center justify-between mb-4">
              <div class="text-2xl">📊</div>
              <div class="text-2xl font-bold text-green-400">{{ selectedChild.weeklyProgress }}%</div>
            </div>
            <h3 class="text-white font-semibold mb-1">今週の進捗</h3>
            <p class="text-slate-400 text-sm">先週より{{ selectedChild.improvementRate }}%向上</p>
          </div>
        </section>

        <!-- Learning Activities -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">📚</span>
            今週の学習活動
          </h2>

          <div class="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Learning Chart -->
              <div>
                <h3 class="text-lg font-bold text-white mb-4">学習時間の推移</h3>
                <div class="learning-chart">
                  <div
                    v-for="(day, index) in weeklyData"
                    :key="index"
                    class="chart-bar-container"
                  >
                    <div class="chart-bar-label">{{ day.day }}</div>
                    <div class="chart-bar-wrapper">
                      <div
                        class="chart-bar"
                        :style="{ height: `${(day.minutes / 60) * 100}%` }"
                      ></div>
                    </div>
                    <div class="chart-bar-value">{{ day.minutes }}分</div>
                  </div>
                </div>
              </div>

              <!-- Achievement Summary -->
              <div>
                <h3 class="text-lg font-bold text-white mb-4">今週の達成項目</h3>
                <div class="space-y-3">
                  <div
                    v-for="achievement in selectedChild.weeklyAchievements"
                    :key="achievement.id"
                    class="achievement-item"
                  >
                    <div class="text-2xl">{{ achievement.icon }}</div>
                    <div class="flex-1">
                      <div class="font-bold text-white">{{ achievement.title }}</div>
                      <div class="text-sm text-slate-400">{{ achievement.description }}</div>
                    </div>
                    <div class="text-sm text-green-400 font-bold">{{ achievement.date }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recommended Actions -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">💡</span>
            おすすめのサポート
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="recommendation-card fade-in-up"
              :style="{ animationDelay: `${recommendation.id * 0.1}s` }"
            >
              <div class="text-3xl mb-3">{{ recommendation.icon }}</div>
              <h3 class="font-bold text-white mb-2">{{ recommendation.title }}</h3>
              <p class="text-slate-400 text-sm mb-4">{{ recommendation.description }}</p>
              <button
                @click="applyRecommendation(recommendation)"
                class="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 font-bold text-sm transition-all"
              >
                {{ recommendation.action }}
              </button>
            </div>
          </div>
        </section>

        <!-- Settings & Controls -->
        <section>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">⚙️</span>
            学習設定
          </h2>

          <div class="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Time Settings -->
              <div>
                <h3 class="text-lg font-bold text-white mb-4">学習時間設定</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm text-slate-400 mb-2">1日の目標学習時間</label>
                    <select
                      v-model="selectedChild.dailyTarget"
                      class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="15">15分</option>
                      <option value="30">30分</option>
                      <option value="45">45分</option>
                      <option value="60">60分</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm text-slate-400 mb-2">学習可能時間帯</label>
                    <div class="flex gap-2">
                      <select class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                        <option value="18:00">18:00</option>
                      </select>
                      <span class="text-white self-center">〜</span>
                      <select class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white">
                        <option value="19:00">19:00</option>
                        <option value="20:00">20:00</option>
                        <option value="21:00">21:00</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notification Settings -->
              <div>
                <h3 class="text-lg font-bold text-white mb-4">通知設定</h3>
                <div class="space-y-3">
                  <label class="flex items-center gap-3">
                    <input type="checkbox" checked class="w-4 h-4 text-purple-500 rounded">
                    <span class="text-white">学習開始リマインダー</span>
                  </label>
                  <label class="flex items-center gap-3">
                    <input type="checkbox" checked class="w-4 h-4 text-purple-500 rounded">
                    <span class="text-white">目標達成通知</span>
                  </label>
                  <label class="flex items-center gap-3">
                    <input type="checkbox" class="w-4 h-4 text-purple-500 rounded">
                    <span class="text-white">週次進捗レポート</span>
                  </label>
                  <label class="flex items-center gap-3">
                    <input type="checkbox" checked class="w-4 h-4 text-purple-500 rounded">
                    <span class="text-white">レベルアップ通知</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-slate-600 flex justify-end">
              <button class="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all">
                設定を保存
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- No Child Selected -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">👶</div>
        <h3 class="text-xl font-bold text-white mb-2">お子様を選択してください</h3>
        <p class="text-slate-400">上記からお子様を選択すると、詳細な学習状況を確認できます。</p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logger from '@/utils/logger'

export default {
  name: 'DashboardParent',
  setup() {
    const router = useRouter()
    const selectedChild = ref(null)

    // 子供のデータ
    const children = ref([
      {
        id: 1,
        name: '太郎',
        avatar: '👦',
        age: 8,
        level: 5,
        isActive: true,
        todayStudyTime: 32,
        dailyTarget: 45,
        streak: 7,
        xpToNext: 180,
        levelProgress: 65,
        weeklyProgress: 85,
        improvementRate: 12,
        weeklyAchievements: [
          {
            id: 1,
            icon: '🎯',
            title: '音韻ミッション達成',
            description: '3つの音素を完璧に習得しました',
            date: '12/15'
          },
          {
            id: 2,
            icon: '🔥',
            title: '連続学習記録更新',
            description: '7日連続で学習を継続中',
            date: '12/14'
          },
          {
            id: 3,
            icon: '⚡',
            title: 'タイピング速度向上',
            description: '1分間に25文字の新記録達成',
            date: '12/13'
          }
        ]
      },
      {
        id: 2,
        name: '花子',
        avatar: '👧',
        age: 10,
        level: 7,
        isActive: false,
        todayStudyTime: 0,
        dailyTarget: 60,
        streak: 3,
        xpToNext: 220,
        levelProgress: 45,
        weeklyProgress: 70,
        improvementRate: 8,
        weeklyAchievements: [
          {
            id: 1,
            icon: '🌌',
            title: '文法レベルアップ',
            description: 'Be動詞をマスターしました',
            date: '12/14'
          },
          {
            id: 2,
            icon: '🏆',
            title: 'VRチャレンジ完了',
            description: '初回VR学習を完了しました',
            date: '12/12'
          }
        ]
      }
    ])

    // 週間学習データ
    const weeklyData = ref([
      { day: '月', minutes: 35 },
      { day: '火', minutes: 42 },
      { day: '水', minutes: 28 },
      { day: '木', minutes: 38 },
      { day: '金', minutes: 45 },
      { day: '土', minutes: 50 },
      { day: '日', minutes: 32 }
    ])

    // 推奨アクション
    const recommendations = ref([
      {
        id: 1,
        icon: '⏰',
        title: '学習時間を増やす',
        description: '目標達成のため、あと10分の学習時間を追加することをお勧めします。',
        action: '時間を調整'
      },
      {
        id: 2,
        icon: '🎮',
        title: 'ゲーム要素を活用',
        description: 'VRゲームやタイピングゲームでモチベーションアップを図りましょう。',
        action: 'ゲームを始める'
      },
      {
        id: 3,
        icon: '👨‍👩‍👧‍👦',
        title: '一緒に学習',
        description: '親子で一緒に英語学習することで、より効果的な学習が期待できます。',
        action: '共同学習を始める'
      }
    ])

    // メソッド
    const selectChild = (child) => {
      selectedChild.value = child
      logger.log(`👶 Selected child: ${child.name}`)
    }

    const applyRecommendation = (recommendation) => {
      logger.log(`💡 Applying recommendation: ${recommendation.title}`)

      switch (recommendation.id) {
        case 1:
          alert('学習時間の調整機能は開発中です。\n\n⏰ 実装予定機能:\n• 学習スケジュール調整\n• 自動リマインダー設定\n• 進捗目標の再設定')
          break
        case 2:
          router.push({ name: 'VRAcademy' })
          break
        case 3:
          alert('共同学習機能は開発中です。\n\n👨‍👩‍👧‍👦 実装予定機能:\n• 親子学習モード\n• 共同ミッション\n• 家族対戦ゲーム')
          break
        default:
          alert('この機能は開発中です。')
      }
    }

    onMounted(() => {
      // デフォルトで最初の子供を選択
      if (children.value.length > 0) {
        selectedChild.value = children.value[0]
      }
      logger.log('👨‍👩‍👧‍👦 Parent dashboard loaded')
    })

    return {
      selectedChild,
      children,
      weeklyData,
      recommendations,
      selectChild,
      applyRecommendation
    }
  }
}
</script>

<style scoped>
.child-selector-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 2px solid rgba(147, 51, 234, 0.3);
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.child-selector-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(147, 51, 234, 0.6);
}

.child-selector-card.selected {
  border-color: rgba(147, 51, 234, 0.8);
  background: linear-gradient(135deg,
    rgba(147, 51, 234, 0.2) 0%,
    rgba(15, 23, 42, 0.95) 100%);
}

.stats-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(147, 51, 234, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.learning-chart {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  height: 120px;
  padding: 1rem 0;
}

.chart-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar-label {
  color: #94A3B8;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.chart-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
}

.chart-bar {
  width: 20px;
  background: linear-gradient(to top, #8B5CF6, #A855F7);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 10px;
}

.chart-bar-value {
  color: white;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  font-weight: bold;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.recommendation-card {
  background: linear-gradient(135deg,
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(147, 51, 234, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
  .stats-card,
  .recommendation-card {
    padding: 1rem;
  }

  .learning-chart {
    height: 100px;
    gap: 0.25rem;
  }

  .chart-bar {
    width: 16px;
  }
}
</style>