<template>
  <div 
    v-if="isActive" 
    class="minigame-cutscene"
    :class="{ 'fullscreen': fullscreen }"
  >
    <!-- Game Canvas -->
    <div class="game-container" ref="gameContainer">
      <!-- Background -->
      <div 
        class="game-background"
        :style="backgroundStyle"
      ></div>

      <!-- Minigame Content -->
      <div class="game-content">
        <!-- QTE (Quick Time Event) Mode -->
        <div v-if="gameMode === 'qte'" class="qte-container">
          <div class="qte-prompt">
            <h3 class="qte-title">{{ qteData.prompt }}</h3>
            <div class="qte-button-area">
              <button
                v-for="button in qteData.buttons"
                :key="button.key"
                class="qte-button"
                :class="{ 
                  'active': button.key === activeButton,
                  'success': button.key === lastPressed && isCorrect,
                  'fail': button.key === lastPressed && !isCorrect
                }"
                @click="handleQTE(button.key)"
              >
                <span class="button-key">{{ button.key }}</span>
                <span class="button-label">{{ button.label }}</span>
              </button>
            </div>
            
            <!-- Timer Circle -->
            <div class="timer-container">
              <svg class="timer-circle" width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  class="timer-background"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  class="timer-progress"
                  :style="{ 
                    strokeDasharray: `${2 * Math.PI * 45}`,
                    strokeDashoffset: `${2 * Math.PI * 45 * (1 - timeProgress)}`
                  }"
                />
              </svg>
              <div class="timer-text">{{ Math.ceil(timeRemaining / 1000) }}</div>
            </div>
          </div>
        </div>

        <!-- Puzzle Mode -->
        <div v-else-if="gameMode === 'puzzle'" class="puzzle-container">
          <div class="puzzle-title">
            <h3>{{ puzzleData.title }}</h3>
            <p>{{ puzzleData.description }}</p>
          </div>
          
          <div class="puzzle-grid">
            <div
              v-for="(piece, index) in puzzlePieces"
              :key="index"
              class="puzzle-piece"
              :class="{ 
                'selected': selectedPiece === index,
                'correct': piece.isCorrect,
                'dragging': draggedPiece === index
              }"
              @click="selectPuzzlePiece(index)"
              @dragstart="startDrag(index, $event)"
              @dragover.prevent
              @drop="handleDrop(index, $event)"
              draggable="true"
            >
              <div class="piece-content">
                {{ piece.content }}
              </div>
              <div v-if="piece.isCorrect" class="piece-check">✓</div>
            </div>
          </div>
          
          <div class="puzzle-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: puzzleProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ Math.round(puzzleProgress) }}% Complete</span>
          </div>
        </div>

        <!-- Rhythm Mode -->
        <div v-else-if="gameMode === 'rhythm'" class="rhythm-container">
          <div class="rhythm-title">
            <h3>{{ rhythmData.title }}</h3>
            <p>Hit the notes in time!</p>
          </div>
          
          <div class="rhythm-track">
            <div class="track-line"></div>
            <div
              v-for="note in activeNotes"
              :key="note.id"
              class="rhythm-note"
              :class="{ 
                'hit': note.hit,
                'missed': note.missed,
                [`note-${note.type}`]: true
              }"
              :style="{ 
                left: note.position + '%',
                animationDuration: note.speed + 'ms'
              }"
            >
              {{ note.symbol }}
            </div>
          </div>
          
          <div class="rhythm-controls">
            <button
              v-for="control in rhythmControls"
              :key="control.key"
              class="rhythm-button"
              :class="{ 'pressed': control.pressed }"
              @mousedown="hitRhythm(control.key)"
              @mouseup="releaseRhythm(control.key)"
            >
              {{ control.label }}
            </button>
          </div>
          
          <div class="rhythm-score">
            <div class="score-display">
              <span>Score: {{ rhythmScore }}</span>
              <span>Combo: {{ rhythmCombo }}</span>
            </div>
            <div class="accuracy-display">
              <span>Accuracy: {{ Math.round(rhythmAccuracy) }}%</span>
            </div>
          </div>
        </div>

        <!-- Memory Mode -->
        <div v-else-if="gameMode === 'memory'" class="memory-container">
          <div class="memory-title">
            <h3>{{ memoryData.title }}</h3>
            <p>{{ memoryData.instruction }}</p>
          </div>
          
          <div class="memory-sequence" v-if="showingSequence">
            <div class="sequence-display">
              <div
                v-for="(item, index) in memorySequence"
                :key="index"
                class="sequence-item"
                :class="{ 
                  'active': index === currentSequenceIndex,
                  'revealed': index <= revealedIndex
                }"
              >
                {{ item.symbol }}
              </div>
            </div>
          </div>
          
          <div class="memory-input" v-else>
            <div class="input-grid">
              <button
                v-for="option in memoryOptions"
                :key="option.id"
                class="memory-option"
                :class="{ 
                  'selected': selectedMemoryItems.includes(option.id),
                  'correct': option.correct,
                  'incorrect': option.incorrect
                }"
                @click="selectMemoryItem(option.id)"
              >
                {{ option.symbol }}
              </button>
            </div>
          </div>
          
          <div class="memory-progress">
            <div class="lives-container">
              <span v-for="n in memoryLives" :key="n" class="life-heart">❤️</span>
              <span v-for="n in (3 - memoryLives)" :key="n + 10" class="life-heart lost">💔</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Game UI Overlay -->
      <div class="game-ui-overlay">
        <!-- Skip Button -->
        <button 
          v-if="allowSkip"
          @click="skipMinigame"
          class="skip-button"
        >
          Skip <span>⏭️</span>
        </button>

        <!-- Score Display -->
        <div class="score-overlay">
          <div class="score-item">
            <span class="score-label">Score</span>
            <span class="score-value">{{ currentScore }}</span>
          </div>
          <div class="score-item">
            <span class="score-label">Goal</span>
            <span class="score-value">{{ targetScore }}</span>
          </div>
        </div>

        <!-- Result Modal -->
        <div v-if="showResult" class="result-modal">
          <div class="result-content">
            <div class="result-icon">
              {{ isSuccess ? '🎉' : '😅' }}
            </div>
            <h3 class="result-title">
              {{ isSuccess ? 'Success!' : 'Try Again!' }}
            </h3>
            <div class="result-stats">
              <p>Final Score: {{ currentScore }} / {{ targetScore }}</p>
              <p>Accuracy: {{ Math.round(accuracy) }}%</p>
              <p v-if="completionTime">Time: {{ Math.round(completionTime / 1000) }}s</p>
            </div>
            <div class="result-actions">
              <button 
                v-if="!isSuccess && allowRetry"
                @click="retryMinigame"
                class="retry-button"
              >
                Try Again
              </button>
              <button 
                @click="completeMinigame"
                class="continue-button"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props
interface Props {
  gameMode: 'qte' | 'puzzle' | 'rhythm' | 'memory'
  gameData: any
  targetScore?: number
  timeLimit?: number
  allowSkip?: boolean
  allowRetry?: boolean
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  targetScore: 100,
  timeLimit: 30000,
  allowSkip: true,
  allowRetry: true,
  fullscreen: true
})

// Emits
const emit = defineEmits<{
  complete: [success: boolean, score: number, data: any]
  skip: []
  retry: []
}>()

// Reactive State
const isActive = ref(true)
const currentScore = ref(0)
const accuracy = ref(100)
const completionTime = ref(0)
const showResult = ref(false)
const isSuccess = ref(false)

// QTE State
const activeButton = ref('')
const lastPressed = ref('')
const isCorrect = ref(false)
const timeRemaining = ref(props.timeLimit)
const timeProgress = ref(1)

// Puzzle State
const selectedPiece = ref(-1)
const draggedPiece = ref(-1)
const puzzlePieces = ref<any[]>([])
const puzzleProgress = ref(0)

// Rhythm State
const activeNotes = ref<any[]>([])
const rhythmScore = ref(0)
const rhythmCombo = ref(0)
const rhythmAccuracy = ref(100)
const rhythmControls = ref([
  { key: 'A', label: '♪', pressed: false },
  { key: 'S', label: '♫', pressed: false },
  { key: 'D', label: '♬', pressed: false },
  { key: 'F', label: '♩', pressed: false }
])

// Memory State
const showingSequence = ref(true)
const currentSequenceIndex = ref(0)
const revealedIndex = ref(-1)
const memorySequence = ref<any[]>([])
const selectedMemoryItems = ref<string[]>([])
const memoryLives = ref(3)
const memoryOptions = ref<any[]>([])

// Refs
const gameContainer = ref<HTMLElement>()

// Game Data
const qteData = computed(() => props.gameData.qte || {
  prompt: 'Press the correct button!',
  buttons: [
    { key: 'A', label: 'Action' },
    { key: 'B', label: 'Block' },
    { key: 'X', label: 'Jump' },
    { key: 'Y', label: 'Magic' }
  ]
})

const puzzleData = computed(() => props.gameData.puzzle || {
  title: 'Solve the Puzzle',
  description: 'Arrange the pieces correctly',
  pieces: ['A', 'B', 'C', 'D']
})

const rhythmData = computed(() => props.gameData.rhythm || {
  title: 'Rhythm Challenge',
  notes: []
})

const memoryData = computed(() => props.gameData.memory || {
  title: 'Memory Test',
  instruction: 'Remember the sequence',
  sequence: ['🎵', '🎶', '🎼', '🎹']
})

const backgroundStyle = computed(() => ({
  backgroundImage: props.gameData.background ? `url(${props.gameData.background})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}))

// Game Timers
let gameTimer: NodeJS.Timeout | null = null
let qteTimer: NodeJS.Timeout | null = null
let rhythmTimer: NodeJS.Timeout | null = null
let memoryTimer: NodeJS.Timeout | null = null

// Methods
const initializeGame = () => {
  switch (props.gameMode) {
    case 'qte':
      initializeQTE()
      break
    case 'puzzle':
      initializePuzzle()
      break
    case 'rhythm':
      initializeRhythm()
      break
    case 'memory':
      initializeMemory()
      break
  }

  // Start game timer
  const startTime = Date.now()
  gameTimer = setInterval(() => {
    const elapsed = Date.now() - startTime
    completionTime.value = elapsed
    
    if (props.timeLimit && elapsed >= props.timeLimit) {
      endGame(false)
    }
  }, 100)
}

// QTE Methods
const initializeQTE = () => {
  startQTESequence()
}

const startQTESequence = () => {
  const buttons = qteData.value.buttons
  activeButton.value = buttons[Math.floor(Math.random() * buttons.length)].key
  
  timeRemaining.value = 3000 // 3 seconds per QTE
  timeProgress.value = 1
  
  qteTimer = setInterval(() => {
    timeRemaining.value -= 100
    timeProgress.value = timeRemaining.value / 3000
    
    if (timeRemaining.value <= 0) {
      handleQTETimeout()
    }
  }, 100)
}

const handleQTE = (buttonKey: string) => {
  lastPressed.value = buttonKey
  isCorrect.value = buttonKey === activeButton.value
  
  if (isCorrect.value) {
    currentScore.value += 20
    setTimeout(() => {
      if (currentScore.value >= props.targetScore) {
        endGame(true)
      } else {
        startQTESequence()
      }
    }, 500)
  } else {
    accuracy.value = Math.max(0, accuracy.value - 10)
    setTimeout(() => {
      startQTESequence()
    }, 500)
  }
  
  clearQTETimer()
}

const handleQTETimeout = () => {
  accuracy.value = Math.max(0, accuracy.value - 15)
  startQTESequence()
}

const clearQTETimer = () => {
  if (qteTimer) {
    clearInterval(qteTimer)
    qteTimer = null
  }
}

// Puzzle Methods
const initializePuzzle = () => {
  const pieces = puzzleData.value.pieces.map((content: string, index: number) => ({
    id: index,
    content,
    correctPosition: index,
    currentPosition: index,
    isCorrect: false
  }))
  
  // Shuffle pieces
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = pieces[i].currentPosition
    pieces[i].currentPosition = pieces[j].currentPosition
    pieces[j].currentPosition = temp
  }
  
  puzzlePieces.value = pieces
  updatePuzzleProgress()
}

const selectPuzzlePiece = (index: number) => {
  if (selectedPiece.value === -1) {
    selectedPiece.value = index
  } else if (selectedPiece.value === index) {
    selectedPiece.value = -1
  } else {
    // Swap pieces
    const piece1 = puzzlePieces.value[selectedPiece.value]
    const piece2 = puzzlePieces.value[index]
    
    const temp = piece1.currentPosition
    piece1.currentPosition = piece2.currentPosition
    piece2.currentPosition = temp
    
    selectedPiece.value = -1
    updatePuzzleProgress()
  }
}

const startDrag = (index: number, event: DragEvent) => {
  draggedPiece.value = index
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleDrop = (index: number, event: DragEvent) => {
  event.preventDefault()
  const draggedIndex = parseInt(event.dataTransfer?.getData('text/plain') || '-1')
  
  if (draggedIndex !== -1 && draggedIndex !== index) {
    selectPuzzlePiece(draggedIndex)
    selectPuzzlePiece(index)
  }
  
  draggedPiece.value = -1
}

const updatePuzzleProgress = () => {
  let correctCount = 0
  puzzlePieces.value.forEach(piece => {
    piece.isCorrect = piece.correctPosition === piece.currentPosition
    if (piece.isCorrect) correctCount++
  })
  
  puzzleProgress.value = (correctCount / puzzlePieces.value.length) * 100
  currentScore.value = puzzleProgress.value
  
  if (puzzleProgress.value === 100) {
    endGame(true)
  }
}

// Rhythm Methods
const initializeRhythm = () => {
  rhythmScore.value = 0
  rhythmCombo.value = 0
  rhythmAccuracy.value = 100
  
  // Start spawning notes
  spawnRhythmNotes()
}

const spawnRhythmNotes = () => {
  const spawnNote = () => {
    const noteTypes = ['A', 'S', 'D', 'F']
    const symbols = ['♪', '♫', '♬', '♩']
    const type = noteTypes[Math.floor(Math.random() * noteTypes.length)]
    
    activeNotes.value.push({
      id: Date.now() + Math.random(),
      type,
      symbol: symbols[noteTypes.indexOf(type)],
      position: -10,
      speed: 3000,
      hit: false,
      missed: false,
      timestamp: Date.now()
    })
  }
  
  // Spawn notes periodically
  rhythmTimer = setInterval(spawnNote, 1000)
  
  // Move notes
  const moveNotes = () => {
    activeNotes.value.forEach(note => {
      note.position += 0.5
      
      // Check if note is in hit zone (around 90%)
      if (note.position > 95 && !note.hit && !note.missed) {
        note.missed = true
        rhythmCombo.value = 0
        accuracy.value = Math.max(0, accuracy.value - 2)
      }
      
      // Remove notes that are off screen
      if (note.position > 110) {
        const index = activeNotes.value.indexOf(note)
        if (index > -1) {
          activeNotes.value.splice(index, 1)
        }
      }
    })
    
    requestAnimationFrame(moveNotes)
  }
  
  moveNotes()
}

const hitRhythm = (key: string) => {
  const control = rhythmControls.value.find(c => c.key === key)
  if (control) {
    control.pressed = true
  }
  
  // Check for notes in hit zone
  const hitZone = { min: 85, max: 95 }
  const noteInZone = activeNotes.value.find(note => 
    note.type === key &&
    note.position >= hitZone.min &&
    note.position <= hitZone.max &&
    !note.hit &&
    !note.missed
  )
  
  if (noteInZone) {
    noteInZone.hit = true
    rhythmScore.value += 10 + rhythmCombo.value
    rhythmCombo.value++
    currentScore.value = rhythmScore.value
    
    if (currentScore.value >= props.targetScore) {
      endGame(true)
    }
  }
}

const releaseRhythm = (key: string) => {
  const control = rhythmControls.value.find(c => c.key === key)
  if (control) {
    control.pressed = false
  }
}

// Memory Methods
const initializeMemory = () => {
  memoryLives.value = 3
  selectedMemoryItems.value = []
  showingSequence.value = true
  
  // Create sequence
  const symbols = ['🎵', '🎶', '🎼', '🎹', '🎤', '🎧', '🎺', '🎻']
  memorySequence.value = []
  for (let i = 0; i < 4; i++) {
    memorySequence.value.push({
      id: i,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    })
  }
  
  // Create options (sequence + decoys)
  memoryOptions.value = [...memorySequence.value]
  while (memoryOptions.value.length < 8) {
    memoryOptions.value.push({
      id: memoryOptions.value.length,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      correct: false,
      incorrect: false
    })
  }
  
  // Shuffle options
  memoryOptions.value.sort(() => Math.random() - 0.5)
  
  // Show sequence
  showMemorySequence()
}

const showMemorySequence = () => {
  currentSequenceIndex.value = 0
  revealedIndex.value = -1
  
  const revealNext = () => {
    if (revealedIndex.value < memorySequence.value.length - 1) {
      revealedIndex.value++
      setTimeout(revealNext, 800)
    } else {
      setTimeout(() => {
        showingSequence.value = false
      }, 1000)
    }
  }
  
  setTimeout(revealNext, 500)
}

const selectMemoryItem = (itemId: string) => {
  if (selectedMemoryItems.value.includes(itemId)) return
  
  selectedMemoryItems.value.push(itemId)
  
  const selectedOption = memoryOptions.value.find(opt => opt.id.toString() === itemId)
  const expectedItem = memorySequence.value[selectedMemoryItems.value.length - 1]
  
  if (selectedOption && selectedOption.symbol === expectedItem.symbol) {
    selectedOption.correct = true
    currentScore.value += 25
    
    if (selectedMemoryItems.value.length === memorySequence.value.length) {
      endGame(true)
    }
  } else {
    if (selectedOption) {
      selectedOption.incorrect = true
    }
    memoryLives.value--
    accuracy.value = Math.max(0, accuracy.value - 20)
    
    if (memoryLives.value <= 0) {
      endGame(false)
    } else {
      // Reset and try again
      setTimeout(() => {
        selectedMemoryItems.value = []
        memoryOptions.value.forEach(opt => {
          opt.correct = false
          opt.incorrect = false
        })
        showingSequence.value = true
        showMemorySequence()
      }, 1500)
    }
  }
}

// Game Control Methods
const endGame = (success: boolean) => {
  isSuccess.value = success
  showResult.value = true
  clearAllTimers()
}

const skipMinigame = () => {
  clearAllTimers()
  emit('skip')
}

const retryMinigame = () => {
  // Reset state
  currentScore.value = 0
  accuracy.value = 100
  completionTime.value = 0
  showResult.value = false
  
  // Reinitialize
  initializeGame()
}

const completeMinigame = () => {
  emit('complete', isSuccess.value, currentScore.value, {
    accuracy: accuracy.value,
    completionTime: completionTime.value,
    gameMode: props.gameMode
  })
}

const clearAllTimers = () => {
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
  clearQTETimer()
  if (rhythmTimer) {
    clearInterval(rhythmTimer)
    rhythmTimer = null
  }
  if (memoryTimer) {
    clearInterval(memoryTimer)
    memoryTimer = null
  }
}

// Keyboard Event Handling
const handleKeyPress = (event: KeyboardEvent) => {
  const key = event.key.toUpperCase()
  
  if (props.gameMode === 'qte') {
    handleQTE(key)
  } else if (props.gameMode === 'rhythm') {
    hitRhythm(key)
  }
}

const handleKeyRelease = (event: KeyboardEvent) => {
  const key = event.key.toUpperCase()
  
  if (props.gameMode === 'rhythm') {
    releaseRhythm(key)
  }
}

// Lifecycle
onMounted(() => {
  initializeGame()
  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('keyup', handleKeyRelease)
})

onUnmounted(() => {
  clearAllTimers()
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('keyup', handleKeyRelease)
})

// Expose methods
defineExpose({
  retryMinigame,
  skipMinigame
})
</script>

<style scoped>
.minigame-cutscene {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1000;
  overflow: hidden;
}

.game-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.game-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* QTE Styles */
.qte-container {
  text-align: center;
  color: white;
}

.qte-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.qte-button-area {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.qte-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.qte-button.active {
  background: rgba(0, 255, 255, 0.3);
  border-color: #00ffff;
  box-shadow: 0 0 20px #00ffff;
  animation: pulse-glow 1s infinite;
}

.qte-button.success {
  background: rgba(0, 255, 0, 0.3);
  border-color: #00ff00;
}

.qte-button.fail {
  background: rgba(255, 0, 0, 0.3);
  border-color: #ff0000;
}

.button-key {
  font-size: 1.5rem;
  font-weight: bold;
}

.button-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.timer-container {
  position: relative;
  display: inline-block;
}

.timer-circle {
  transform: rotate(-90deg);
}

.timer-background {
  fill: none;
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: #00ffff;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Puzzle Styles */
.puzzle-container {
  color: white;
  max-width: 600px;
}

.puzzle-title {
  text-align: center;
  margin-bottom: 2rem;
}

.puzzle-title h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.puzzle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.puzzle-piece {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.puzzle-piece.selected {
  border-color: #00ffff;
  box-shadow: 0 0 15px #00ffff;
}

.puzzle-piece.correct {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.2);
}

.puzzle-piece.dragging {
  opacity: 0.5;
  transform: scale(1.1);
}

.piece-content {
  font-size: 1.5rem;
  font-weight: bold;
}

.piece-check {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #00ff00;
  font-size: 1.2rem;
}

.puzzle-progress {
  text-align: center;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.2);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  background: linear-gradient(90deg, #00ffff, #0080ff);
  height: 100%;
  transition: width 0.3s ease;
}

/* Rhythm Styles */
.rhythm-container {
  color: white;
  width: 80%;
  max-width: 800px;
}

.rhythm-title {
  text-align: center;
  margin-bottom: 2rem;
}

.rhythm-track {
  position: relative;
  height: 100px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.track-line {
  position: absolute;
  right: 10%;
  top: 0;
  width: 4px;
  height: 100%;
  background: #00ffff;
  box-shadow: 0 0 10px #00ffff;
}

.rhythm-note {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  animation: slide-note linear;
  z-index: 5;
}

.rhythm-note.hit {
  color: #00ff00;
  animation: none;
}

.rhythm-note.missed {
  color: #ff0000;
  animation: none;
}

@keyframes slide-note {
  from { left: -10%; }
  to { left: 100%; }
}

.rhythm-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.rhythm-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.1s ease;
}

.rhythm-button.pressed {
  background: rgba(0, 255, 255, 0.3);
  border-color: #00ffff;
  transform: scale(0.95);
}

.rhythm-score {
  text-align: center;
}

.score-display {
  display: flex;
  justify-content: space-around;
  margin-bottom: 0.5rem;
}

/* Memory Styles */
.memory-container {
  color: white;
  max-width: 600px;
}

.memory-title {
  text-align: center;
  margin-bottom: 2rem;
}

.sequence-display {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sequence-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.sequence-item.active {
  border-color: #00ffff;
  box-shadow: 0 0 20px #00ffff;
  animation: pulse-glow 0.8s infinite;
}

.sequence-item.revealed {
  opacity: 1;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.memory-option {
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.memory-option.selected {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.2);
}

.memory-option.correct {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.2);
}

.memory-option.incorrect {
  border-color: #ff0000;
  background: rgba(255, 0, 0, 0.2);
}

.lives-container {
  text-align: center;
  font-size: 1.5rem;
}

.life-heart.lost {
  filter: grayscale(100%);
  opacity: 0.5;
}

/* Game UI Overlay */
.game-ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

.skip-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid #fff;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s ease;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.score-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 2rem;
}

.score-item {
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  text-align: center;
}

.score-label {
  display: block;
  font-size: 0.8rem;
  color: #ccc;
}

.score-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #00ffff;
}

/* Result Modal */
.result-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.result-content {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(30, 30, 50, 0.9));
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  color: white;
  max-width: 400px;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #00ffff;
}

.result-stats {
  margin-bottom: 2rem;
}

.result-stats p {
  margin: 0.5rem 0;
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.retry-button,
.continue-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.retry-button {
  background: rgba(255, 165, 0, 0.2);
  border-color: #ffa500;
  color: #ffa500;
}

.continue-button {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
  color: #00ffff;
}

.retry-button:hover,
.continue-button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .qte-button-area {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .qte-button {
    min-width: 60px;
    padding: 0.75rem;
  }
  
  .puzzle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rhythm-controls {
    gap: 0.5rem;
  }
  
  .rhythm-button {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }
  
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .result-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>