<template>
  <div class="verb-pattern-galaxy-hub min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
    <!-- Cosmic Background -->
    <div class="cosmic-stars absolute inset-0 opacity-30"></div>
    <div class="cosmic-nebula absolute inset-0 opacity-20"></div>

    <!-- ヘッダー -->
    <header class="relative z-10 flex items-center justify-between p-4 md:p-6">
      <button
        @click="goBack"
        class="galaxy-nav-button flex items-center gap-2 text-white hover:text-yellow-300 transition-all duration-300"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="font-semibold text-sm md:text-base">文法銀河に戻る</span>
      </button>

      <div class="flex items-center gap-3 md:gap-6 text-white">
        <div class="stat-display flex items-center gap-1 md:gap-2">
          <span class="text-lg md:text-2xl">⭐</span>
          <span class="font-bold text-sm md:text-xl">{{ totalScore }}</span>
        </div>
        <div class="stat-display flex items-center gap-1 md:gap-2">
          <span class="text-lg md:text-2xl">📊</span>
          <span class="font-bold text-sm md:text-lg">{{ Math.round(collectionRate) }}%</span>
        </div>
        <div class="stat-display flex items-center gap-1 md:gap-2">
          <span class="text-lg md:text-2xl">🎯</span>
          <span class="font-bold text-sm md:text-lg">{{ overallAccuracy }}%</span>
        </div>
      </div>
    </header>

    <!-- タイトル -->
    <div class="relative z-10 text-center py-4 md:py-6">
      <div class="cosmic-title-container">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 cosmic-glow">
          動詞パターン銀河
        </h1>
        <div class="level-indicator mt-3 max-w-xs mx-auto">
          <span class="text-sm md:text-base text-yellow-300">Level {{ currentLevel }}</span>
          <div class="progress-bar mt-1">
            <div
              class="progress-fill"
              :style="{ width: `${nextLevelProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ステージ選択 -->
    <div class="relative z-10 container mx-auto px-4 py-4 md:py-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <!-- Stage 1: Verb Collector -->
        <div
          class="stage-card collector-stage"
          :class="{
            'unlocked': true,
            'completed': gameProgress.stage1Completed,
            'locked': false
          }"
          @click="startStage(1)"
        >
          <div class="stage-icon">🛸</div>
          <h3 class="stage-title">Verb Collector</h3>
          <p class="stage-subtitle">動詞収集ミッション</p>
          <div class="stage-description">
            宇宙を飛び回って動詞を正しいポッドに収集しよう！
          </div>
          <div class="stage-stats">
            <span class="difficulty">初級 - 中級</span>
            <span class="reward">+100-500 ポイント</span>
          </div>
          <div v-if="gameProgress.stage1Completed" class="completion-badge">
            ✅ Complete
          </div>
        </div>

        <!-- Stage 2: Pattern Builder -->
        <div
          class="stage-card builder-stage"
          :class="{
            'unlocked': true,
            'completed': gameProgress.stage2Completed,
            'locked': false
          }"
          @click="startStage(2)"
        >
          <div class="stage-icon">🏗️</div>
          <h3 class="stage-title">Pattern Builder</h3>
          <p class="stage-subtitle">文構築チャレンジ</p>
          <div class="stage-description">
            正しい文型を構築して宇宙ステーションを建設！
          </div>
          <div class="stage-stats">
            <span class="difficulty">中級 - 上級</span>
            <span class="reward">+200-800 ポイント</span>
          </div>
          <div v-if="gameProgress.stage2Completed" class="completion-badge">
            ✅ Complete
          </div>
        </div>

        <!-- Stage 3: Meaning Duel -->
        <div
          class="stage-card duel-stage"
          :class="{
            'unlocked': true,
            'completed': gameProgress.stage3Completed,
            'locked': false
          }"
          @click="startStage(3)"
        >
          <div class="stage-icon">⚔️</div>
          <h3 class="stage-title">Meaning Duel</h3>
          <p class="stage-subtitle">意味の違い対決</p>
          <div class="stage-description">
            remember/forget/stop/try の微妙な意味の違いをマスター！
          </div>
          <div class="stage-stats">
            <span class="difficulty">上級 - エキスパート</span>
            <span class="reward">+500-1500 ポイント</span>
          </div>
          <div v-if="gameProgress.stage3Completed" class="completion-badge">
            ✅ Complete
          </div>
        </div>
      </div>
    </div>

    <!-- コレクションセクション -->
    <div class="relative z-10 container mx-auto px-4 py-4">
      <div class="collection-section">
        <h2 class="section-title">🎴 My Verb Collection</h2>
        <div class="collection-stats">
          <div class="stat-card">
            <span class="stat-number">{{ collectedVerbs.length }}</span>
            <span class="stat-label">収集済み</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ unlockedVerbs.length }}</span>
            <span class="stat-label">アンロック済み</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ masteredVerbs.length }}</span>
            <span class="stat-label">マスター済み</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ weakVerbs.length }}</span>
            <span class="stat-label">要練習</span>
          </div>
        </div>
        <button
          @click="showCollection = true"
          class="collection-button"
        >
          📚 コレクションを見る
        </button>
      </div>
    </div>

    <!-- 苦手動詞クイック練習 -->
    <div v-if="weakVerbs.length > 0" class="relative z-10 container mx-auto px-4 py-4">
      <div class="weak-verbs-section">
        <h3 class="text-lg md:text-xl font-bold text-white mb-2">⚠️ 苦手動詞クイック練習</h3>
        <div class="weak-verbs-grid">
          <div
            v-for="verbId in weakVerbs.slice(0, 6)"
            :key="verbId"
            class="weak-verb-card"
            @click="practiceWeakVerb(verbId)"
          >
            <span class="verb-text">{{ getVerbById(verbId)?.verb }}</span>
            <span class="accuracy">{{ getAccuracyForVerb(verbId) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- カードコレクションモーダル -->
    <VerbCardCollection v-if="showCollection" @close="showCollection = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVerbPatternStore } from '@/stores/verbPatternStore'
import VerbCardCollection from './VerbCardCollection.vue'

const router = useRouter()
const store = useVerbPatternStore()

const {
  totalScore,
  collectionRate,
  overallAccuracy,
  currentLevel,
  nextLevelProgress,
  gameProgress,
  collectedVerbs,
  unlockedVerbs,
  masteredVerbs,
  weakVerbs,
  getVerbById
} = store

const showCollection = ref(false)

function goBack() {
  router.push({ name: 'GrammarGalaxy' })
}

function startStage(stageNumber) {
  const routes = {
    1: { name: 'verb-collector-game' },
    2: { name: 'pattern-builder-game' },
    3: { name: 'meaning-duel-game' }
  }

  // 開発用: ロック状態チェックを無効化
  // if (stageNumber === 2 && !gameProgress.stage1Completed) {
  //   alert('Stage 1 を先にクリアしてください！')
  //   return
  // }
  // if (stageNumber === 3 && !gameProgress.stage2Completed) {
  //   alert('Stage 2 を先にクリアしてください！')
  //   return
  // }

  router.push(routes[stageNumber])
}

function practiceWeakVerb(verbId) {
  // 苦手動詞の個別練習モードに移行
  router.push(`/verb-pattern-galaxy/practice/${verbId}`)
}

function getAccuracyForVerb(verbId) {
  const acc = store.accuracy[verbId]
  return acc ? Math.round((acc.correct / acc.total) * 100) : 0
}
</script>

<style scoped>
.verb-pattern-galaxy-hub {
  position: relative;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
}

.cosmic-stars {
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: twinkle 20s linear infinite;
}

.cosmic-nebula {
  background:
    radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
  animation: drift 30s ease-in-out infinite;
}

.galaxy-nav-button {
  transition: all 0.3s ease;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.galaxy-nav-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stat-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.75rem;
  backdrop-filter: blur(10px);
}

.cosmic-title-container {
  text-align: center;
}

.cosmic-glow {
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.3);
}

.level-indicator {
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #facc15, #f59e0b);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stage-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stage-card.unlocked:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.5);
}

.stage-card.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.stage-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.stage-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

.stage-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25rem;
}

.stage-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
}

.stage-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.stage-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.difficulty, .reward {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

.completion-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 0.875rem;
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.lock-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.lock-text {
  color: white;
  font-weight: 600;
}

.collection-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
}

.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.75rem;
}

.collection-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #facc15;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.collection-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.collection-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
}

.weak-verbs-section {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 1rem;
  padding: 1rem;
}

.weak-verbs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.weak-verb-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.weak-verb-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.verb-text {
  font-weight: bold;
  color: white;
  font-size: 0.875rem;
}

.accuracy {
  color: #ef4444;
  font-size: 0.875rem;
}

/* Animations */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes drift {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  33% { transform: translateX(30px) translateY(-30px) rotate(120deg); }
  66% { transform: translateX(-20px) translateY(20px) rotate(240deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-10px); }
  70% { transform: translateY(-5px); }
  90% { transform: translateY(-2px); }
}

/* Responsive Design */
@media (max-width: 640px) {
  .stage-stats {
    font-size: 0.625rem;
  }

  .collection-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .weak-verbs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stage-card {
    padding: 1.5rem;
  }

  .stage-icon {
    font-size: 3rem;
  }

  .stage-title {
    font-size: 1.5rem;
  }
}
</style>