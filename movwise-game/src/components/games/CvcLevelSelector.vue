<template>
  <div class="min-h-screen galaxy-background p-6">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>
    
    <div class="max-w-4xl mx-auto relative z-10">
      <!-- 戻るボタン -->
      <button
        @click="$router.push('/sound-adventure')"
        class="fixed top-4 left-4 z-50 galaxy-button galaxy-button-secondary px-4 py-2 rounded-2xl font-bold hover:shadow-lg transition-all duration-200"
      >
        ← 戻る
      </button>
      
      <h1 class="text-4xl font-bold galaxy-text-primary mb-8 text-center cosmic-glow">🏭 CVC ワード・ファクトリー</h1>
      
      <!-- レベル選択 -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-6">レベルを選択</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            v-for="level in levels"
            :key="level.id"
            @click="selectLevel(level.id)"
            class="relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105"
            :class="[
              selectedLevel === level.id 
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl' 
                : 'bg-galaxy-deep-space/50 hover:bg-galaxy-deep-space/70 text-galaxy-moon-silver'
            ]"
          >
            <div class="relative z-10">
              <div class="text-6xl mb-4">{{ level.emoji }}</div>
              <h3 class="text-xl font-bold mb-2">レベル {{ level.id }}</h3>
              <p class="text-lg mb-3">{{ level.name }}</p>
              <p class="text-sm mb-4 opacity-90">{{ level.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm">{{ level.words }}問</span>
                <span class="text-sm">制限時間: {{ level.timeLimit }}秒</span>
              </div>
            </div>
            
            <!-- 選択時の光るエフェクト -->
            <div
              v-if="selectedLevel === level.id"
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"
            ></div>
          </button>
        </div>
      </div>
      
      <!-- 問題数選択 -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-4">問題数</h2>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="count in questionCounts"
            :key="count"
            @click="selectedQuestionCount = count"
            class="p-4 rounded-xl text-center transition-all duration-200"
            :class="[
              selectedQuestionCount === count 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                : 'bg-galaxy-deep-space/50 hover:bg-galaxy-deep-space/70 text-galaxy-moon-silver'
            ]"
          >
            {{ count }}問
          </button>
        </div>
      </div>
      
      <!-- プレビュー -->
      <div class="galaxy-card rounded-3xl p-6 shadow-2xl mb-6">
        <h2 class="text-2xl font-bold galaxy-text-primary mb-4">選択内容</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-lg galaxy-text-primary">
              <span class="font-bold">レベル:</span> {{ getLevelInfo().name }}
            </p>
            <p class="text-sm text-galaxy-moon-silver mt-1">{{ getLevelInfo().description }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg galaxy-text-primary">
              <span class="font-bold">問題数:</span> {{ selectedQuestionCount }}問
            </p>
            <p class="text-sm text-galaxy-moon-silver mt-1">
              最大{{ getLevelInfo().words }}問から出題
            </p>
          </div>
        </div>
      </div>
      
      <!-- 開始ボタン -->
      <div class="text-center">
        <button
          @click="startGame"
          class="galaxy-button galaxy-button-primary px-12 py-4 rounded-xl font-bold text-xl hover:shadow-lg transition-all duration-200"
        >
          <span class="mr-2">🚀</span>
          ゲーム開始
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSettingsStore } from '@/stores/gameSettings'

export default {
  name: 'CvcLevelSelector',
  setup() {
    const router = useRouter()
    const store = useGameSettingsStore()
    
    const selectedLevel = ref(1)
    const selectedQuestionCount = ref(10)
    
    const levels = [
      {
        id: 1,
        name: '基本CVC工場',
        emoji: '🏭',
        description: '子音-母音-子音の基本パターンを学ぼう！',
        timeLimit: 20,
        words: 26
      },
      {
        id: 2,
        name: 'アドバンス工場',
        emoji: '🏗️',
        description: 'より多様なCVCパターンに挑戦！',
        timeLimit: 18,
        words: 23
      },
      {
        id: 3,
        name: 'マスター工場',
        emoji: '🏰',
        description: '難易度の高いCVCパターンを完璧に！',
        timeLimit: 15,
        words: 32
      }
    ]
    
    const questionCounts = [5, 10, 15, 20]
    
    const selectLevel = (level) => {
      selectedLevel.value = level
    }
    
    const getLevelInfo = () => {
      return levels.find(l => l.id === selectedLevel.value) || levels[0]
    }
    
    const startGame = () => {
      // ストアに設定を保存
      store.currentLevel = selectedLevel.value
      store.questionCount = selectedQuestionCount.value
      store.gameMode = 'level'
      
      // ゲーム画面へ遷移
      router.push('/games/cvc-word-factory')
    }
    
    return {
      selectedLevel,
      selectedQuestionCount,
      levels,
      questionCounts,
      selectLevel,
      getLevelInfo,
      startGame
    }
  }
}
</script>

<style scoped>
/* Galaxy Theme Styles */
.galaxy-background {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 75%, #000000 100%);
  position: relative;
}

.galaxy-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.galaxy-button {
  position: relative;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.galaxy-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.galaxy-button:hover::before {
  left: 100%;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.galaxy-button-primary:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(148, 163, 184, 0.4);
}

.galaxy-text-primary {
  color: #e2e8f0;
  text-shadow: 0 0 10px rgba(226, 232, 240, 0.5);
}

.text-galaxy-moon-silver {
  color: #94a3b8;
}

.bg-galaxy-deep-space {
  background-color: #1e293b;
}

.cosmic-glow {
  filter: drop-shadow(0 0 10px rgba(147, 197, 253, 0.5));
}

/* Animated Stars */
.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.stars-layer-1 {
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: sparkle 3s linear infinite;
}

.stars-layer-2 {
  background-image: 
    radial-gradient(1px 1px at 40px 60px, #fff, transparent),
    radial-gradient(1px 1px at 80px 10px, rgba(255,255,255,0.7), transparent);
  background-repeat: repeat;
  background-size: 220px 120px;
  animation: sparkle 4s linear infinite reverse;
}

.stars-layer-3 {
  background-image: 
    radial-gradient(1px 1px at 60px 20px, rgba(255,255,255,0.4), transparent);
  background-repeat: repeat;
  background-size: 180px 90px;
  animation: sparkle 5s linear infinite;
}

@keyframes sparkle {
  from { transform: translateX(0); }
  to { transform: translateX(-200px); }
}

@keyframes shimmer {
  from { transform: translateX(-100%) skewX(-12deg); }
  to { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 3s ease-out infinite;
}
</style>