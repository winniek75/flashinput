<template>
  <div class="ghost-letter-hunters min-h-screen bg-gradient-to-b from-purple-900 via-black to-indigo-900 relative overflow-hidden">
    <!-- 幽霊っぽい背景エフェクト -->
    <div class="fog-effect"></div>
    <div class="stars"></div>
    
    <!-- ゲームヘッダー -->
    <header class="relative z-20 p-4 bg-black/50 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="text-white hover:text-purple-400 transition-colors">
            <i class="fas fa-arrow-left text-2xl"></i>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-purple-400 flex items-center gap-2">
              <span class="text-4xl">👻</span>
              ゴーストレターハンターズ
            </h1>
            <p class="text-purple-200 text-sm">サイレントレターを捕まえろ！</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-6">
          <!-- スコア表示 -->
          <div class="text-center">
            <div class="text-yellow-400 text-2xl font-bold">{{ score }}</div>
            <div class="text-gray-300 text-xs">SCORE</div>
          </div>
          
          <!-- コンボ表示 -->
          <div class="text-center">
            <div class="text-orange-400 text-2xl font-bold">×{{ combo }}</div>
            <div class="text-gray-300 text-xs">COMBO</div>
          </div>
          
          <!-- 捕獲数 -->
          <div class="text-center">
            <div class="text-green-400 text-2xl font-bold">{{ capturedGhosts }}/{{ totalGhosts }}</div>
            <div class="text-gray-300 text-xs">捕獲</div>
          </div>
        </div>
      </div>
    </header>

    <!-- メインゲームエリア -->
    <main class="relative z-10 p-6">
      <!-- ゲーム開始前 -->
      <div v-if="gamePhase === 'intro'" class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <h2 class="text-4xl font-bold text-purple-400 mb-6">
            👻 ゴーストレターを捕まえよう！
          </h2>
          <div class="text-gray-300 mb-8 space-y-4">
            <p class="text-lg">サイレントレター（黙字）が幽霊になって逃げ出した！</p>
            <p>正しく発音して、ゴーストを捕獲しよう</p>
            
            <div class="bg-purple-900/50 rounded-lg p-4 mt-6">
              <h3 class="text-purple-300 font-bold mb-3">🎮 遊び方</h3>
              <ol class="text-left space-y-2 max-w-md mx-auto">
                <li>1. 画面に現れるゴーストレターを見つける</li>
                <li>2. 単語を正しく発音（サイレントレターは発音しない）</li>
                <li>3. 3回連続で正しく発音すると捕獲成功！</li>
                <li>4. コンボを繋げて高得点を狙おう</li>
              </ol>
            </div>
          </div>
          
          <div class="flex gap-4 justify-center">
            <button 
              @click="selectDifficulty('easy')"
              class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              🌟 かんたん
            </button>
            <button 
              @click="selectDifficulty('normal')"
              class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              ⭐ ふつう
            </button>
            <button 
              @click="selectDifficulty('hard')"
              class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
            >
              🔥 むずかしい
            </button>
          </div>
        </div>
      </div>

      <!-- ゲームプレイ中 -->
      <div v-else-if="gamePhase === 'playing'" class="relative">
        <!-- ゴースト出現エリア -->
        <div class="ghost-field relative h-[500px] bg-gradient-to-b from-transparent via-purple-900/20 to-transparent rounded-3xl overflow-hidden">
          <!-- 浮遊するゴースト -->
          <div 
            v-for="ghost in activeGhosts" 
            :key="ghost.id"
            class="ghost-letter absolute transition-all duration-1000"
            :style="{ 
              left: ghost.x + '%', 
              top: ghost.y + '%',
              animation: `float ${ghost.speed}s ease-in-out infinite`
            }"
            :class="{ 
              'captured': ghost.captured,
              'escaping': ghost.escaping 
            }"
            @click="selectGhost(ghost)"
          >
            <div class="ghost-container" :class="{ 'selected': selectedGhost?.id === ghost.id }">
              <!-- ゴースト本体 -->
              <div class="ghost-body text-6xl">👻</div>
              <!-- サイレントレター表示 -->
              <div class="silent-letter text-2xl font-bold text-red-500">
                {{ ghost.silentLetter }}
              </div>
              <!-- 単語表示 -->
              <div class="word-label text-white bg-black/70 px-2 py-1 rounded">
                {{ ghost.word }}
              </div>
            </div>
          </div>

          <!-- 魔法陣（捕獲エリア） -->
          <div v-if="selectedGhost" class="capture-circle absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div class="magic-circle">
              <div class="circle-ring ring-1"></div>
              <div class="circle-ring ring-2"></div>
              <div class="circle-ring ring-3"></div>
              <div class="capture-text text-purple-300 text-center">
                <p class="text-sm">呪文を唱えよう！</p>
                <p class="text-2xl font-bold">{{ selectedGhost.word }}</p>
                <p class="text-xs text-gray-400">（{{ selectedGhost.pronunciation }}）</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 発音コントロール -->
        <div v-if="selectedGhost" class="mt-8 max-w-2xl mx-auto">
          <div class="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30">
            <h3 class="text-xl font-bold text-purple-400 mb-4 text-center">
              🎤 ゴースト捕獲チャレンジ
            </h3>
            
            <!-- 発音進捗 -->
            <div class="mb-6">
              <div class="flex justify-center gap-2 mb-3">
                <div 
                  v-for="i in 3" 
                  :key="i"
                  class="pronunciation-dot"
                  :class="{ 
                    'completed': pronunciationAttempts >= i,
                    'current': pronunciationAttempts === i - 1
                  }"
                >
                  {{ pronunciationAttempts >= i ? '✓' : i }}
                </div>
              </div>
              <p class="text-center text-gray-300">
                あと{{ 3 - pronunciationAttempts }}回正しく発音しよう！
              </p>
            </div>

            <!-- マイクボタン -->
            <div class="flex justify-center gap-4">
              <button 
                @click="startListening"
                class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full font-bold transition-all transform hover:scale-105 disabled:opacity-50"
                :disabled="isListening"
              >
                <i class="fas fa-microphone text-2xl"></i>
                <span class="ml-2">{{ isListening ? '聞いています...' : '発音する' }}</span>
              </button>
              
              <button 
                @click="playExample"
                class="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all"
              >
                <i class="fas fa-volume-up text-2xl"></i>
              </button>
            </div>

            <!-- フィードバック -->
            <div v-if="feedback" class="mt-6 text-center">
              <div 
                class="inline-block px-6 py-3 rounded-lg font-bold"
                :class="feedback.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
              >
                {{ feedback.message }}
              </div>
            </div>
          </div>
        </div>

        <!-- タイマーバー -->
        <div class="mt-6 max-w-4xl mx-auto">
          <div class="bg-gray-800/50 rounded-full h-4 overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              :style="{ width: `${(timeRemaining / maxTime) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- ゲーム終了 -->
      <div v-else-if="gamePhase === 'complete'" class="max-w-2xl mx-auto text-center py-12">
        <div class="bg-black/60 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30">
          <h2 class="text-4xl font-bold text-purple-400 mb-6">
            🎉 ミッション完了！
          </h2>
          
          <div class="space-y-4 mb-8">
            <div class="text-3xl font-bold text-yellow-400">
              スコア: {{ score }}
            </div>
            <div class="text-xl text-gray-300">
              捕獲したゴースト: {{ capturedGhosts }}/{{ totalGhosts }}
            </div>
            <div class="text-xl text-orange-400">
              最大コンボ: ×{{ maxCombo }}
            </div>
          </div>

          <!-- 捕獲したゴーストギャラリー -->
          <div class="mb-8">
            <h3 class="text-purple-300 font-bold mb-4">📚 捕獲したゴースト図鑑</h3>
            <div class="grid grid-cols-4 gap-2">
              <div 
                v-for="ghost in capturedGhostsList" 
                :key="ghost.word"
                class="bg-purple-900/50 rounded-lg p-2 text-center"
              >
                <div class="text-2xl mb-1">👻</div>
                <div class="text-xs text-gray-300">{{ ghost.word }}</div>
                <div class="text-xs text-red-400">({{ ghost.silentLetter }})</div>
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button 
              @click="resetGame"
              class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold transition-all"
            >
              もう一度挑戦
            </button>
            <button 
              @click="goBack"
              class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
            >
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameSounds } from '@/composables/useGameSounds'

const router = useRouter()
const { playSound, speak } = useGameSounds()

// ゲーム状態
const gamePhase = ref('intro') // intro, playing, complete
const difficulty = ref('normal')
const score = ref(0)
const combo = ref(0)
const maxCombo = ref(0)
const capturedGhosts = ref(0)
const totalGhosts = ref(0)
const timeRemaining = ref(60)
const maxTime = ref(60)

// ゴースト管理
const activeGhosts = ref([])
const selectedGhost = ref(null)
const capturedGhostsList = ref([])

// 発音認識
const isListening = ref(false)
const pronunciationAttempts = ref(0)
const feedback = ref(null)

// ゲームループ
let gameInterval = null
let ghostSpawnInterval = null

// サイレントレターのデータ
const silentLetterWords = {
  easy: [
    { word: 'know', silentLetter: 'k', pronunciation: 'ノウ' },
    { word: 'write', silentLetter: 'w', pronunciation: 'ライト' },
    { word: 'hour', silentLetter: 'h', pronunciation: 'アワー' },
    { word: 'knee', silentLetter: 'k', pronunciation: 'ニー' },
    { word: 'knife', silentLetter: 'k', pronunciation: 'ナイフ' }
  ],
  normal: [
    { word: 'castle', silentLetter: 't', pronunciation: 'キャッスル' },
    { word: 'listen', silentLetter: 't', pronunciation: 'リッスン' },
    { word: 'island', silentLetter: 's', pronunciation: 'アイランド' },
    { word: 'climb', silentLetter: 'b', pronunciation: 'クライム' },
    { word: 'thumb', silentLetter: 'b', pronunciation: 'サム' },
    { word: 'ghost', silentLetter: 'h', pronunciation: 'ゴースト' },
    { word: 'honest', silentLetter: 'h', pronunciation: 'オネスト' }
  ],
  hard: [
    { word: 'daughter', silentLetter: 'gh', pronunciation: 'ドーター' },
    { word: 'through', silentLetter: 'gh', pronunciation: 'スルー' },
    { word: 'thought', silentLetter: 'gh', pronunciation: 'ソート' },
    { word: 'foreign', silentLetter: 'g', pronunciation: 'フォーリン' },
    { word: 'sign', silentLetter: 'g', pronunciation: 'サイン' },
    { word: 'design', silentLetter: 'g', pronunciation: 'デザイン' },
    { word: 'wrestle', silentLetter: 't', pronunciation: 'レッスル' }
  ]
}

// 難易度選択
const selectDifficulty = (level) => {
  difficulty.value = level
  startGame()
}

// ゲーム開始
const startGame = () => {
  gamePhase.value = 'playing'
  score.value = 0
  combo.value = 0
  maxCombo.value = 0
  capturedGhosts.value = 0
  pronunciationAttempts.value = 0
  activeGhosts.value = []
  capturedGhostsList.value = []
  
  // 難易度に応じた設定
  const settings = {
    easy: { time: 90, spawnRate: 4000, ghostSpeed: 8 },
    normal: { time: 60, spawnRate: 3000, ghostSpeed: 6 },
    hard: { time: 45, spawnRate: 2000, ghostSpeed: 4 }
  }
  
  const currentSettings = settings[difficulty.value]
  timeRemaining.value = currentSettings.time
  maxTime.value = currentSettings.time
  
  // 初期ゴースト生成
  const words = silentLetterWords[difficulty.value]
  totalGhosts.value = words.length
  
  // ゲームループ開始
  gameInterval = setInterval(() => {
    updateGame()
  }, 100)
  
  // ゴースト生成
  ghostSpawnInterval = setInterval(() => {
    spawnGhost()
  }, currentSettings.spawnRate)
  
  // 初回ゴースト生成
  setTimeout(() => spawnGhost(), 500)
  
  playSound('gameStart')
}

// ゴースト生成
const spawnGhost = () => {
  const words = silentLetterWords[difficulty.value]
  const availableWords = words.filter(w => 
    !activeGhosts.value.some(g => g.word === w.word) &&
    !capturedGhostsList.value.some(g => g.word === w.word)
  )
  
  if (availableWords.length === 0) return
  
  const word = availableWords[Math.floor(Math.random() * availableWords.length)]
  const ghost = {
    id: Date.now() + Math.random(),
    ...word,
    x: Math.random() * 80 + 10,
    y: Math.random() * 30 + 10,
    speed: 3 + Math.random() * 2,
    captured: false,
    escaping: false
  }
  
  activeGhosts.value.push(ghost)
}

// ゴースト選択
const selectGhost = (ghost) => {
  if (ghost.captured || ghost.escaping) return
  
  selectedGhost.value = ghost
  pronunciationAttempts.value = 0
  feedback.value = null
  playSound('select')
}

// 音声認識開始
const startListening = async () => {
  if (isListening.value) return
  
  isListening.value = true
  feedback.value = null
  
  // 実際の音声認識実装
  // ここでは擬似的に実装
  setTimeout(() => {
    const success = Math.random() > 0.3 // 70%の確率で成功
    handlePronunciation(success)
    isListening.value = false
  }, 2000)
}

// 発音処理
const handlePronunciation = (correct) => {
  if (!selectedGhost.value) return
  
  if (correct) {
    pronunciationAttempts.value++
    combo.value++
    if (combo.value > maxCombo.value) {
      maxCombo.value = combo.value
    }
    
    feedback.value = {
      correct: true,
      message: `正解！ (${pronunciationAttempts.value}/3)`
    }
    
    playSound('correct')
    
    // 3回成功で捕獲
    if (pronunciationAttempts.value >= 3) {
      captureGhost()
    }
  } else {
    combo.value = 0
    feedback.value = {
      correct: false,
      message: 'もう一度挑戦！'
    }
    playSound('incorrect')
  }
}

// ゴースト捕獲
const captureGhost = () => {
  if (!selectedGhost.value) return
  
  const ghost = selectedGhost.value
  ghost.captured = true
  
  // スコア計算
  const baseScore = 100
  const comboBonus = combo.value * 10
  const timeBonus = Math.floor(timeRemaining.value)
  const totalScore = baseScore + comboBonus + timeBonus
  score.value += totalScore
  
  capturedGhosts.value++
  capturedGhostsList.value.push(ghost)
  
  // エフェクト
  playSound('capture')
  
  // ゴーストを削除
  setTimeout(() => {
    activeGhosts.value = activeGhosts.value.filter(g => g.id !== ghost.id)
    selectedGhost.value = null
    pronunciationAttempts.value = 0
    
    // 全て捕獲したら終了
    if (capturedGhosts.value >= totalGhosts.value) {
      endGame()
    }
  }, 1000)
}

// お手本を聞く
const playExample = () => {
  if (!selectedGhost.value) return
  speak(selectedGhost.value.pronunciation)
}

// ゲーム更新
const updateGame = () => {
  if (gamePhase.value !== 'playing') return
  
  // タイマー更新
  timeRemaining.value -= 0.1
  if (timeRemaining.value <= 0) {
    endGame()
  }
  
  // ゴースト移動
  activeGhosts.value.forEach(ghost => {
    if (!ghost.captured && !ghost.escaping) {
      // ランダムな動き
      if (Math.random() < 0.01) {
        ghost.x += (Math.random() - 0.5) * 10
        ghost.y += (Math.random() - 0.5) * 5
        
        // 画面内に収める
        ghost.x = Math.max(5, Math.min(95, ghost.x))
        ghost.y = Math.max(5, Math.min(70, ghost.y))
      }
    }
  })
}

// ゲーム終了
const endGame = () => {
  gamePhase.value = 'complete'
  
  // インターバルクリア
  if (gameInterval) {
    clearInterval(gameInterval)
    gameInterval = null
  }
  if (ghostSpawnInterval) {
    clearInterval(ghostSpawnInterval)
    ghostSpawnInterval = null
  }
  
  playSound('gameEnd')
}

// ゲームリセット
const resetGame = () => {
  gamePhase.value = 'intro'
}

// 戻るボタン
const goBack = () => {
  router.push('/sound-adventure')
}

// クリーンアップ
onUnmounted(() => {
  if (gameInterval) clearInterval(gameInterval)
  if (ghostSpawnInterval) clearInterval(ghostSpawnInterval)
})
</script>

<style scoped>
/* 背景エフェクト */
.fog-effect {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%);
  animation: fogMove 20s ease-in-out infinite;
}

.stars {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 40px 70px, white, transparent),
    radial-gradient(1px 1px at 50px 50px, white, transparent),
    radial-gradient(1px 1px at 80px 10px, white, transparent);
  background-size: 200px 200px;
  animation: sparkle 10s linear infinite;
}

@keyframes fogMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes sparkle {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

/* ゴーストアニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.ghost-container {
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.ghost-container:hover {
  transform: scale(1.1);
}

.ghost-container.selected {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.ghost-body {
  filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8));
}

.ghost-letter.captured .ghost-body {
  animation: capture 1s ease-out;
  opacity: 0;
}

@keyframes capture {
  0% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.5) rotate(180deg); }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
}

.silent-letter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
}

.word-label {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* 魔法陣 */
.magic-circle {
  width: 200px;
  height: 200px;
  position: relative;
}

.circle-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(147, 51, 234, 0.6);
  border-radius: 50%;
}

.ring-1 {
  animation: rotate 3s linear infinite;
}

.ring-2 {
  animation: rotate 4s linear infinite reverse;
  transform: scale(0.8);
}

.ring-3 {
  animation: rotate 5s linear infinite;
  transform: scale(0.6);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.capture-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 発音ドット */
.pronunciation-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(147, 51, 234, 0.3);
  border: 2px solid rgba(147, 51, 234, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: all 0.3s;
}

.pronunciation-dot.completed {
  background: rgba(34, 197, 94, 0.8);
  border-color: rgb(34, 197, 94);
}

.pronunciation-dot.current {
  animation: pulse 1s infinite;
  background: rgba(251, 146, 60, 0.8);
  border-color: rgb(251, 146, 60);
}
</style>