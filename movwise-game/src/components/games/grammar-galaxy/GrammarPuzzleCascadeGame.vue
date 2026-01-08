<template>
  <div class="grammar-puzzle-cascade-game galaxy-background min-h-screen relative overflow-hidden">
    <!-- 背景の星 -->
    <div class="stars-layer-1"></div>
    <div class="stars-layer-2"></div>
    <div class="stars-layer-3"></div>

    <!-- ヘッダー -->
    <div class="game-header galaxy-card p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <button @click="goBack" class="galaxy-button galaxy-button-secondary">
            <span class="cosmic-glow">←</span> 戻る
          </button>
          <h1 class="galaxy-text-primary text-2xl font-bold cosmic-glow">パズルカスケード</h1>
        </div>
        <div class="game-stats flex space-x-6">
          <div class="stat-item">
            <span class="stat-label text-galaxy-moon-silver">スコア</span>
            <span class="stat-value galaxy-text-primary font-bold">{{ score }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label text-galaxy-moon-silver">レベル</span>
            <span class="stat-value galaxy-text-primary font-bold">{{ level }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label text-galaxy-moon-silver">時間</span>
            <span class="stat-value galaxy-text-primary font-bold">{{ formatTime(timeLeft) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲームコンテンツ -->
    <div class="game-content max-w-6xl mx-auto px-4">
      <!-- 準備画面 -->
      <div v-if="gameState === 'ready'" class="ready-screen text-center">
        <div class="galaxy-card p-8 mb-6">
          <div class="intro-icon cosmic-glow text-6xl mb-4">🧩✨</div>
          <h2 class="galaxy-text-primary text-3xl font-bold cosmic-glow mb-4">パズルカスケード</h2>
          <p class="text-galaxy-moon-silver text-lg mb-6">
            落ちてくる文法ブロックを配置して、正しい英文パターンを作り上げる文法パズルゲーム！
          </p>
          
          <div class="game-rules mb-6">
            <h3 class="text-lg font-bold mb-3 cosmic-glow galaxy-text-primary">ゲームの進め方</h3>
            <ol class="rules-list-galaxy text-left">
              <li>🟦 青=主語、🟥 赤=Be動詞、🟪 紫=一般動詞、🟩 緑=目的語・補語</li>
              <li>正しい文法パターンを水平・垂直に3つ並べよう</li>
              <li>例：「I am happy」「You are student」など</li>
              <li>パターンが完成すると消去されて高得点！</li>
              <li>ブロックが上端に到達するとゲームオーバー</li>
            </ol>
          </div>
          
          <div class="target-patterns mb-6">
            <h4 class="text-md font-bold mb-2 cosmic-glow galaxy-text-primary">🎯 ターゲットパターン例</h4>
            <div class="patterns-grid text-sm">
              <div class="pattern-example">I am happy (300点)</div>
              <div class="pattern-example">You are student (300点)</div>
              <div class="pattern-example">I like cats (400点)</div>
              <div class="pattern-example">We play games (400点)</div>
            </div>
          </div>

          <button @click="startGame" class="galaxy-button galaxy-button-primary text-xl px-8 py-4">
            <span class="cosmic-glow">🚀</span> ゲーム開始
          </button>
        </div>
      </div>

      <!-- ゲーム画面 -->
      <div v-else-if="gameState === 'playing'" class="game-board">
        <div class="flex justify-center">
          <div class="game-area galaxy-card p-4">
            <div class="grid-container">
              <!-- ゲームグリッド -->
              <div class="game-grid">
                <div 
                  v-for="(row, rowIndex) in gameBoard" 
                  :key="rowIndex"
                  class="grid-row"
                >
                  <div 
                    v-for="(cell, colIndex) in row" 
                    :key="colIndex"
                    class="grid-cell"
                    :class="getCellClass(cell, rowIndex, colIndex)"
                  >
                    <span v-if="getCellContent(cell, rowIndex, colIndex)" class="cell-text">
                      {{ getCellContent(cell, rowIndex, colIndex) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- コントロール -->
        <div class="game-controls mt-6 text-center">
          <div class="control-buttons flex justify-center space-x-4">
            <button @click="moveLeft" class="galaxy-button galaxy-button-secondary">
              ← 左
            </button>
            <button @click="moveRight" class="galaxy-button galaxy-button-secondary">
              右 →
            </button>
            <button @click="rotateBlock" class="galaxy-button galaxy-button-secondary">
              🔄 回転
            </button>
            <button @click="dropBlock" class="galaxy-button galaxy-button-primary">
              ⬇ 落下
            </button>
          </div>
        </div>
      </div>

      <!-- ゲームオーバー画面 -->
      <div v-else-if="gameState === 'gameOver'" class="game-over-screen text-center">
        <div class="galaxy-card p-8">
          <h2 class="galaxy-text-primary text-3xl font-bold cosmic-glow mb-4">ゲームオーバー</h2>
          <div class="final-stats mb-6">
            <p class="text-galaxy-moon-silver text-lg">最終スコア: <span class="galaxy-text-primary font-bold">{{ score }}</span></p>
            <p class="text-galaxy-moon-silver text-lg">到達レベル: <span class="galaxy-text-primary font-bold">{{ level }}</span></p>
          </div>
          <div class="action-buttons space-x-4">
            <button @click="restartGame" class="galaxy-button galaxy-button-primary">
              🔄 リスタート
            </button>
            <button @click="goBack" class="galaxy-button galaxy-button-secondary">
              ← 戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// ゲーム状態
const gameState = ref('ready') // 'ready', 'playing', 'gameOver'
const score = ref(0)
const level = ref(1)
const timeLeft = ref(300) // 5分

// ゲームボード
const BOARD_WIDTH = 8
const BOARD_HEIGHT = 12
const gameBoard = ref([])

// 現在のブロック
const currentBlock = ref(null)
const currentBlockPosition = ref({ x: 0, y: 0 })

// ゲームタイマー
let gameTimer = null
let dropTimer = null

// 初期化
const initializeGame = () => {
  // ゲームボードを初期化
  gameBoard.value = Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(null)
  )
  
  score.value = 0
  level.value = 1
  timeLeft.value = 300
  gameState.value = 'ready'
}

// ゲーム開始
const startGame = () => {
  logger.log('[GrammarPuzzleCascade] Starting game')
  gameState.value = 'playing'
  spawnNewBlock()
  startGameTimer()
  startDropTimer()
}

// ゲームタイマー開始
const startGameTimer = () => {
  gameTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      endGame()
    }
  }, 1000)
}

// ドロップタイマー開始
const startDropTimer = () => {
  const dropInterval = Math.max(1000 - (level.value - 1) * 100, 200)
  dropTimer = setInterval(() => {
    if (gameState.value === 'playing') {
      moveBlockDown()
    }
  }, dropInterval)
}

// 文法パターン定義
const grammarPatterns = [
  { pattern: ['I', 'am', 'happy'], points: 300, type: 'be_verb' },
  { pattern: ['You', 'are', 'student'], points: 300, type: 'be_verb' },
  { pattern: ['She', 'is', 'kind'], points: 300, type: 'be_verb' },
  { pattern: ['I', 'like', 'cats'], points: 400, type: 'general_verb' },
  { pattern: ['We', 'play', 'games'], points: 400, type: 'general_verb' },
  { pattern: ['They', 'study', 'English'], points: 500, type: 'complex' }
]

// 文法ブロック定義（パターンに基づいて生成）
const grammarBlocks = [
  // 主語 (青)
  { text: 'I', color: 'blue', type: 'subject' },
  { text: 'You', color: 'blue', type: 'subject' },
  { text: 'She', color: 'blue', type: 'subject' },
  { text: 'We', color: 'blue', type: 'subject' },
  { text: 'They', color: 'blue', type: 'subject' },
  
  // Be動詞 (赤)
  { text: 'am', color: 'red', type: 'be_verb' },
  { text: 'are', color: 'red', type: 'be_verb' },
  { text: 'is', color: 'red', type: 'be_verb' },
  
  // 一般動詞 (紫)
  { text: 'like', color: 'purple', type: 'verb' },
  { text: 'play', color: 'purple', type: 'verb' },
  { text: 'study', color: 'purple', type: 'verb' },
  
  // 補語・目的語 (緑)
  { text: 'happy', color: 'green', type: 'complement' },
  { text: 'kind', color: 'green', type: 'complement' },
  { text: 'student', color: 'green', type: 'object' },
  { text: 'cats', color: 'green', type: 'object' },
  { text: 'games', color: 'green', type: 'object' },
  { text: 'English', color: 'green', type: 'object' }
]

// 新しいブロックを生成
const spawnNewBlock = () => {
  const randomBlock = grammarBlocks[Math.floor(Math.random() * grammarBlocks.length)]
  currentBlock.value = { ...randomBlock }
  currentBlockPosition.value = { x: Math.floor(BOARD_WIDTH / 2), y: 0 }
  
  logger.log('[GrammarPuzzleCascade] New block spawned:', randomBlock, 'at position:', currentBlockPosition.value)
  
  // ブロックが上端に到達したらゲームオーバー
  if (!canPlaceBlock(currentBlockPosition.value.x, currentBlockPosition.value.y)) {
    logger.log('[GrammarPuzzleCascade] Game Over - cannot place block')
    endGame()
  }
}

// ブロック配置可能かチェック
const canPlaceBlock = (x, y) => {
  if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false
  if (y < 0) return true
  return !gameBoard.value[y][x]
}

// ブロックを左に移動
const moveLeft = () => {
  if (gameState.value !== 'playing') return
  const newX = currentBlockPosition.value.x - 1
  if (canPlaceBlock(newX, currentBlockPosition.value.y)) {
    currentBlockPosition.value.x = newX
  }
}

// ブロックを右に移動
const moveRight = () => {
  if (gameState.value !== 'playing') return
  const newX = currentBlockPosition.value.x + 1
  if (canPlaceBlock(newX, currentBlockPosition.value.y)) {
    currentBlockPosition.value.x = newX
  }
}

// ブロックを下に移動
const moveBlockDown = () => {
  if (gameState.value !== 'playing') return
  const newY = currentBlockPosition.value.y + 1
  if (canPlaceBlock(currentBlockPosition.value.x, newY)) {
    currentBlockPosition.value.y = newY
  } else {
    placeBlock()
    checkLines()
    spawnNewBlock()
  }
}

// ブロックを即座に落下
const dropBlock = () => {
  if (gameState.value !== 'playing') return
  while (canPlaceBlock(currentBlockPosition.value.x, currentBlockPosition.value.y + 1)) {
    currentBlockPosition.value.y++
  }
  placeBlock()
  checkLines()
  spawnNewBlock()
}

// ブロックを回転
const rotateBlock = () => {
  // シンプルな実装のため、回転は無効化
  logger.log('Block rotation not implemented in this version')
}

// ブロックを配置
const placeBlock = () => {
  const { x, y } = currentBlockPosition.value
  if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
    gameBoard.value[y][x] = currentBlock.value
  }
}

// 文法パターンをチェック
const checkGrammarPatterns = () => {
  let patternsFound = []
  
  // 水平方向のパターンチェック
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x <= BOARD_WIDTH - 3; x++) {
      const sequence = []
      for (let i = 0; i < 3; i++) {
        if (gameBoard.value[y][x + i]) {
          sequence.push(gameBoard.value[y][x + i].text)
        }
      }
      
      if (sequence.length === 3) {
        const matchedPattern = grammarPatterns.find(p => 
          JSON.stringify(p.pattern) === JSON.stringify(sequence)
        )
        
        if (matchedPattern) {
          patternsFound.push({
            pattern: matchedPattern,
            positions: [
              { x: x, y: y },
              { x: x + 1, y: y },
              { x: x + 2, y: y }
            ]
          })
        }
      }
    }
  }
  
  // 垂直方向のパターンチェック
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y <= BOARD_HEIGHT - 3; y++) {
      const sequence = []
      for (let i = 0; i < 3; i++) {
        if (gameBoard.value[y + i][x]) {
          sequence.push(gameBoard.value[y + i][x].text)
        }
      }
      
      if (sequence.length === 3) {
        const matchedPattern = grammarPatterns.find(p => 
          JSON.stringify(p.pattern) === JSON.stringify(sequence)
        )
        
        if (matchedPattern) {
          patternsFound.push({
            pattern: matchedPattern,
            positions: [
              { x: x, y: y },
              { x: x, y: y + 1 },
              { x: x, y: y + 2 }
            ]
          })
        }
      }
    }
  }
  
  // パターンを消去してスコア加算
  patternsFound.forEach(found => {
    score.value += found.pattern.points
    found.positions.forEach(pos => {
      gameBoard.value[pos.y][pos.x] = null
    })
    logger.log(`[GrammarPuzzleCascade] Pattern found: ${found.pattern.pattern.join(' ')} (+${found.pattern.points} points)`)
  })
  
  // ブロックを落下させる
  if (patternsFound.length > 0) {
    dropFloatingBlocks()
    // 再帰的にパターンチェック
    setTimeout(() => checkGrammarPatterns(), 300)
  }
  
  return patternsFound.length > 0
}

// 浮いているブロックを落下させる
const dropFloatingBlocks = () => {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    const column = []
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (gameBoard.value[y][x]) {
        column.push(gameBoard.value[y][x])
        gameBoard.value[y][x] = null
      }
    }
    
    // 下から詰め直す
    for (let i = 0; i < column.length; i++) {
      gameBoard.value[BOARD_HEIGHT - 1 - i][x] = column[i]
    }
  }
}

// ライン消去チェック（従来のテトリス式は削除）
const checkLines = () => {
  // 文法パターンチェックに置き換え
  const foundPatterns = checkGrammarPatterns()
  
  // レベルアップ
  if (score.value >= level.value * 1000) {
    level.value++
    // ドロップ速度を更新
    clearInterval(dropTimer)
    startDropTimer()
    logger.log(`[GrammarPuzzleCascade] Level up! Now level ${level.value}`)
  }
  
  return foundPatterns
}

// セルのクラスを取得
const getCellClass = (cell, rowIndex, colIndex) => {
  // 現在のブロックの位置をチェック
  const isCurrentBlock = currentBlock.value && 
    currentBlockPosition.value.x === colIndex && 
    currentBlockPosition.value.y === rowIndex

  if (isCurrentBlock) {
    return `cell-${currentBlock.value.color} cell-falling`
  }
  
  if (!cell) return 'cell-empty'
  return `cell-${cell.color} cell-placed`
}

// セルの内容を取得
const getCellContent = (cell, rowIndex, colIndex) => {
  // 現在のブロックの位置をチェック
  const isCurrentBlock = currentBlock.value && 
    currentBlockPosition.value.x === colIndex && 
    currentBlockPosition.value.y === rowIndex

  if (isCurrentBlock) {
    return currentBlock.value.text
  }
  
  return cell ? cell.text : null
}

// ゲーム終了
const endGame = () => {
  gameState.value = 'gameOver'
  clearInterval(gameTimer)
  clearInterval(dropTimer)
}

// ゲーム再開始
const restartGame = () => {
  clearInterval(gameTimer)
  clearInterval(dropTimer)
  initializeGame()
  startGame()
}

// 戻る
const goBack = () => {
  clearInterval(gameTimer)
  clearInterval(dropTimer)
  router.push('/platforms/grammar-galaxy')
}

// 時間フォーマット
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// キーボードイベント
const handleKeydown = (event) => {
  if (gameState.value !== 'playing') return
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      moveLeft()
      break
    case 'ArrowRight':
      event.preventDefault()
      moveRight()
      break
    case 'ArrowDown':
      event.preventDefault()
      moveBlockDown()
      break
    case ' ':
      event.preventDefault()
      dropBlock()
      break
    case 'ArrowUp':
      event.preventDefault()
      rotateBlock()
      break
  }
}

// ライフサイクル
onMounted(() => {
  initializeGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(gameTimer)
  clearInterval(dropTimer)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Galaxy background */
.galaxy-background {
  background: var(--space-void);
  color: white;
}

/* Animated stars */
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

/* Galaxy-themed components */
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
  text-shadow: 0 0 30px rgba(96, 165, 250, 0.5);
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
  @apply px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105;
  position: relative;
  overflow: hidden;
}

.galaxy-button-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  border: 1px solid rgba(59, 130, 246, 0.5);
}

.galaxy-button-secondary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
  color: #60A5FA;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.cosmic-glow {
  text-shadow: 0 0 10px currentColor;
}

@keyframes cosmic-text-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Game specific styles */
.game-area {
  display: inline-block;
}

.game-grid {
  display: grid;
  grid-template-rows: repeat(12, 1fr);
  gap: 2px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  padding: 8px;
}

.grid-row {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.grid-cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.cell-empty {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.cell-falling {
  animation: pulse 0.5s ease-in-out infinite alternate;
  box-shadow: 0 0 8px currentColor;
}

.cell-placed {
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

.cell-blue {
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  color: white;
}

.cell-red {
  background: linear-gradient(135deg, #EF4444, #B91C1C);
  color: white;
}

.cell-green {
  background: linear-gradient(135deg, #10B981, #047857);
  color: white;
}

.cell-yellow {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
}

.cell-purple {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
}

.cell-text {
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
}

@keyframes pulse {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 8px currentColor;
  }
  100% { 
    transform: scale(1.1);
    box-shadow: 0 0 12px currentColor;
  }
}

.game-controls {
  margin-top: 1rem;
}

.control-buttons button {
  min-width: 80px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
}

.rules-list-galaxy {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-list-galaxy li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  padding-left: 2rem;
}

.rules-list-galaxy li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #60A5FA;
  font-weight: bold;
}

.rules-list-galaxy li:last-child {
  border-bottom: none;
}

.patterns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.pattern-example {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  padding: 0.5rem;
  text-align: center;
  color: #60A5FA;
  font-weight: 500;
}

.grid-container {
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 10px;
  overflow: hidden;
}

.game-grid {
  display: grid;
  grid-template-rows: repeat(20, 30px);
  grid-template-columns: repeat(10, 30px);
  gap: 1px;
  background: rgba(15, 23, 42, 0.8);
}

.grid-row {
  display: contents;
}

.grid-cell {
  @apply flex items-center justify-center text-sm font-bold;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.cell-blue {
  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
  color: white;
  border-color: #60A5FA;
}

.cell-red {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  border-color: #F87171;
}

.cell-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border-color: #34D399;
}

.cell-text {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.game-stats {
  @apply flex space-x-6;
}

.stat-item {
  @apply flex flex-col items-center;
}

.stat-label {
  @apply text-xs mb-1;
}

.stat-value {
  @apply text-lg;
}

.rules-list-galaxy {
  @apply space-y-2;
}

.rules-list-galaxy li {
  @apply flex items-start space-x-2;
}

.rules-list-galaxy li::before {
  content: '🌟';
  @apply flex-shrink-0;
}

.control-buttons {
  @apply flex justify-center space-x-4;
}

.action-buttons {
  @apply flex justify-center space-x-4;
}
</style> 