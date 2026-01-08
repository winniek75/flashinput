<template>
  <div class="difficulty-debug-panel" v-if="debugConfig.enabled">
    <div class="debug-header">
      <h3>🔧 Difficulty Debug Panel</h3>
      <button @click="togglePanel" class="toggle-btn">
        {{ panelExpanded ? '▼' : '▶' }}
      </button>
    </div>

    <div v-show="panelExpanded" class="debug-content">
      <!-- Debug Status -->
      <div class="debug-section">
        <h4>Debug Status</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">Log Level:</span>
            <select v-model="debugConfig.logLevel" @change="updateDebugConfig">
              <option value="none">None</option>
              <option value="basic">Basic</option>
              <option value="detailed">Detailed</option>
              <option value="verbose">Verbose</option>
            </select>
          </div>
          <div class="status-item">
            <span class="label">Simulation Mode:</span>
            <input 
              type="checkbox" 
              v-model="debugConfig.simulationMode" 
              @change="updateDebugConfig"
            >
          </div>
          <div class="status-item">
            <span class="label">Player Level Override:</span>
            <input 
              type="number" 
              v-model.number="debugConfig.playerLevelOverride" 
              @change="updateDebugConfig"
              min="1" 
              max="10"
            >
          </div>
        </div>
      </div>

      <!-- Quick Presets -->
      <div class="debug-section">
        <h4>Quick Presets</h4>
        <div class="preset-buttons">
          <button 
            v-for="(preset, key) in debugPresets" 
            :key="key"
            @click="applyPreset(key)"
            class="preset-btn"
            :class="{ active: currentPreset === key }"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>

      <!-- Current Game Parameters -->
      <div class="debug-section" v-if="currentGameId">
        <h4>Current Game: {{ currentGameId }}</h4>
        <div class="parameters-grid">
          <div 
            v-for="(value, param) in currentParameters" 
            :key="param"
            class="parameter-item"
          >
            <label>{{ formatParameterName(param) }}:</label>
            <input 
              v-if="typeof value === 'number'"
              type="number"
              :value="value"
              @input="updateParameter(param, $event.target.value)"
              class="param-input"
            >
            <input 
              v-else-if="typeof value === 'boolean'"
              type="checkbox"
              :checked="value"
              @change="updateParameter(param, $event.target.checked)"
              class="param-checkbox"
            >
            <select 
              v-else-if="isSelectableParameter(param)"
              :value="value"
              @change="updateParameter(param, $event.target.value)"
              class="param-select"
            >
              <option v-for="option in getParameterOptions(param)" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <input 
              v-else
              type="text"
              :value="value"
              @input="updateParameter(param, $event.target.value)"
              class="param-input"
            >
          </div>
        </div>
      </div>

      <!-- Player Performance -->
      <div class="debug-section" v-if="playerPerformance">
        <h4>Player Performance</h4>
        <div class="performance-stats">
          <div class="stat">
            <span class="stat-label">Average Accuracy:</span>
            <span class="stat-value">{{ playerPerformance.overallStats.averageAccuracy.toFixed(1) }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Learning Velocity:</span>
            <span class="stat-value">{{ playerPerformance.overallStats.learningVelocity.toFixed(2) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Consistency:</span>
            <span class="stat-value">{{ playerPerformance.overallStats.consistencyScore.toFixed(1) }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Sessions:</span>
            <span class="stat-value">{{ playerPerformance.overallStats.totalSessions }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Adjustments -->
      <div class="debug-section" v-if="recentAdjustments.length > 0">
        <h4>Recent Adjustments</h4>
        <div class="adjustments-list">
          <div 
            v-for="adjustment in recentAdjustments" 
            :key="adjustment.timestamp"
            class="adjustment-item"
          >
            <div class="adjustment-header">
              <span class="timestamp">{{ formatTimestamp(adjustment.timestamp) }}</span>
              <span class="reason" :class="adjustment.reason">{{ adjustment.reason }}</span>
            </div>
            <div class="adjustment-details">
              <span class="performance">Performance: {{ adjustment.playerPerformance.toFixed(1) }}%</span>
              <div class="changes">
                <div v-for="(value, param) in adjustment.newParameters" :key="param" class="change">
                  {{ formatParameterName(param) }}: {{ value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- A/B Test Info -->
      <div class="debug-section" v-if="activeTests.length > 0">
        <h4>Active A/B Tests</h4>
        <div class="ab-tests">
          <div v-for="test in activeTests" :key="test.testId" class="test-item">
            <div class="test-header">
              <span class="test-name">{{ test.name }}</span>
              <span class="participant-count">{{ test.currentParticipants }}/{{ test.sampleSize }}</span>
            </div>
            <div class="test-variants">
              <span v-for="variant in test.variants" :key="variant.id" class="variant">
                {{ variant.name }} ({{ variant.weight }}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="debug-section">
        <h4>Actions</h4>
        <div class="action-buttons">
          <button @click="forceAdjustment" class="action-btn warning">
            Force Adjustment
          </button>
          <button @click="resetParameters" class="action-btn danger">
            Reset Parameters
          </button>
          <button @click="simulateSession" class="action-btn">
            Simulate Session
          </button>
          <button @click="exportDebugData" class="action-btn">
            Export Debug Data
          </button>
        </div>
      </div>

      <!-- Console Output -->
      <div class="debug-section">
        <h4>Debug Console</h4>
        <div class="console-output" ref="consoleOutput">
          <div 
            v-for="(log, index) in consoleLogs" 
            :key="index"
            class="console-line"
            :class="log.level"
          >
            <span class="timestamp">{{ formatTimestamp(log.timestamp) }}</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
        <button @click="clearConsole" class="clear-console-btn">Clear Console</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { difficultyManager } from '@/utils/difficultyManager'
import { useGameStore } from '@/stores/gameStore'
import type { GameParameters, PlayerPerformance, AdaptiveAdjustment, ABTestConfig } from '@/utils/difficultyManager'

// Props and emits
interface Props {
  gameId?: string
  playerId?: string
}

const props = withDefaults(defineProps<Props>(), {
  gameId: '',
  playerId: 'debug_player'
})

// Reactive state
const panelExpanded = ref(false)
const currentPreset = ref('')
const currentParameters = ref<GameParameters>({} as GameParameters)
const playerPerformance = ref<PlayerPerformance | null>(null)
const recentAdjustments = ref<AdaptiveAdjustment[]>([])
const activeTests = ref<ABTestConfig[]>([])
const consoleLogs = ref<DebugLog[]>([])

interface DebugLog {
  timestamp: number
  level: 'info' | 'warn' | 'error'
  message: string
}

// Computed properties
const debugConfig = computed(() => difficultyManager.debugSettings)
const currentGameId = computed(() => props.gameId)

const debugPresets = computed(() => ({
  easy_mode: {
    name: 'Easy Mode',
    description: 'All games set to easiest settings'
  },
  hard_mode: {
    name: 'Hard Mode',
    description: 'All games set to hardest settings'
  },
  speed_test: {
    name: 'Speed Test',
    description: 'Fast-paced testing mode'
  },
  learning_mode: {
    name: 'Learning Mode',
    description: 'Optimized for learning with maximum support'
  }
}))

// Game store
const gameStore = useGameStore()

// Methods
const togglePanel = () => {
  panelExpanded.value = !panelExpanded.value
}

const updateDebugConfig = () => {
  difficultyManager.setDebugMode(true, debugConfig.value)
  addLog('info', 'Debug configuration updated')
}

const applyPreset = async (presetKey: string) => {
  try {
    // Load preset from gameBalance.json
    const response = await fetch('/src/config/gameBalance.json')
    const gameBalance = await response.json()
    const preset = gameBalance.debugPresets[presetKey]
    
    if (preset) {
      debugConfig.value.parameterOverrides = { ...preset.overrides }
      currentPreset.value = presetKey
      updateDebugConfig()
      await refreshCurrentParameters()
      addLog('info', `Applied preset: ${preset.name}`)
    }
  } catch (error) {
    addLog('error', `Failed to apply preset: ${error}`)
  }
}

const updateParameter = (param: string, value: any) => {
  debugConfig.value.parameterOverrides[param] = value
  updateDebugConfig()
  addLog('info', `Updated ${param} to ${value}`)
}

const formatParameterName = (param: string): string => {
  return param.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

const isSelectableParameter = (param: string): boolean => {
  const selectableParams = ['vocabularyLevel', 'grammarComplexity']
  return selectableParams.includes(param)
}

const getParameterOptions = (param: string): string[] => {
  const options: Record<string, string[]> = {
    vocabularyLevel: ['beginner', 'intermediate', 'advanced', 'mixed'],
    grammarComplexity: ['simple', 'moderate', 'complex']
  }
  return options[param] || []
}

const forceAdjustment = () => {
  if (!currentGameId.value) {
    addLog('warn', 'No game selected for forced adjustment')
    return
  }

  const adjustments = {
    hintAvailability: Math.random() * 100,
    timeLimit: 20000 + Math.random() * 40000,
    problemCount: 5 + Math.floor(Math.random() * 10)
  }

  difficultyManager.forceAdjustment(
    currentGameId.value,
    props.playerId,
    adjustments,
    'Debug panel forced adjustment'
  )

  addLog('info', 'Forced adjustment applied')
  refreshData()
}

const resetParameters = async () => {
  debugConfig.value.parameterOverrides = {}
  currentPreset.value = ''
  updateDebugConfig()
  await refreshCurrentParameters()
  addLog('info', 'Parameters reset to defaults')
}

const simulateSession = () => {
  if (!currentGameId.value) {
    addLog('warn', 'No game selected for simulation')
    return
  }

  // Simulate a game session with random results
  const simulatedSession = {
    sessionId: `sim_${Date.now()}`,
    timestamp: Date.now(),
    gameId: currentGameId.value,
    parameters: { ...currentParameters.value },
    results: {
      totalProblems: currentParameters.value.problemCount,
      correctAnswers: Math.floor(Math.random() * currentParameters.value.problemCount),
      timeSpent: Math.random() * currentParameters.value.timeLimit,
      hintsUsed: Math.floor(Math.random() * 3),
      retries: Math.floor(Math.random() * 2),
      score: Math.floor(Math.random() * 1000),
      accuracy: 50 + Math.random() * 50,
      averageResponseTime: 1000 + Math.random() * 5000,
      conceptsMastered: ['concept1', 'concept2'],
      struggledConcepts: ['concept3']
    }
  }

  difficultyManager.recordSessionResults(
    currentGameId.value,
    props.playerId,
    simulatedSession
  )

  addLog('info', `Simulated session: ${simulatedSession.results.accuracy.toFixed(1)}% accuracy`)
  refreshData()
}

const exportDebugData = () => {
  const debugData = {
    timestamp: Date.now(),
    gameId: currentGameId.value,
    playerId: props.playerId,
    debugConfig: debugConfig.value,
    currentParameters: currentParameters.value,
    playerPerformance: playerPerformance.value,
    recentAdjustments: recentAdjustments.value,
    consoleLogs: consoleLogs.value
  }

  const blob = new Blob([JSON.stringify(debugData, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `difficulty-debug-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  addLog('info', 'Debug data exported')
}

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

const addLog = (level: 'info' | 'warn' | 'error', message: string) => {
  consoleLogs.value.push({
    timestamp: Date.now(),
    level,
    message
  })

  // Limit console logs to 100 entries
  if (consoleLogs.value.length > 100) {
    consoleLogs.value = consoleLogs.value.slice(-100)
  }

  // Auto-scroll console
  nextTick(() => {
    const consoleElement = document.querySelector('.console-output')
    if (consoleElement) {
      consoleElement.scrollTop = consoleElement.scrollHeight
    }
  })
}

const clearConsole = () => {
  consoleLogs.value = []
}

const refreshCurrentParameters = async () => {
  if (!currentGameId.value) return

  try {
    const params = await difficultyManager.getGameParameters(
      currentGameId.value,
      props.playerId,
      debugConfig.value.playerLevelOverride || 1
    )
    currentParameters.value = params
  } catch (error) {
    addLog('error', `Failed to get game parameters: ${error}`)
  }
}

const refreshData = () => {
  // Refresh player performance
  const analytics = difficultyManager.getPlayerAnalytics(props.playerId, currentGameId.value)
  if (analytics.length > 0) {
    playerPerformance.value = analytics[0]
    recentAdjustments.value = analytics[0].adaptiveHistory.slice(-5)
  }

  // Refresh active A/B tests
  activeTests.value = difficultyManager.activeABTests

  // Refresh current parameters
  refreshCurrentParameters()
}

// Watchers
watch(() => props.gameId, () => {
  refreshData()
}, { immediate: true })

watch(() => debugConfig.value.enabled, (enabled) => {
  if (!enabled) {
    panelExpanded.value = false
  }
})

// Lifecycle
onMounted(() => {
  // Initial data load
  refreshData()

  // Set up periodic refresh
  setInterval(refreshData, 5000)

  // Listen for console messages
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn
  const originalConsoleError = console.error

  console.log = (...args) => {
    originalConsoleLog(...args)
    if (args[0] && args[0].includes('[DifficultyManager]')) {
      addLog('info', args.join(' '))
    }
  }

  console.warn = (...args) => {
    originalConsoleWarn(...args)
    if (args[0] && args[0].includes('[DifficultyManager]')) {
      addLog('warn', args.join(' '))
    }
  }

  console.error = (...args) => {
    originalConsoleError(...args)
    if (args[0] && args[0].includes('[DifficultyManager]')) {
      addLog('error', args.join(' '))
    }
  }
})
</script>

<style scoped>
.difficulty-debug-panel {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  border-radius: 8px;
  border: 2px solid #333;
  z-index: 10000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow: hidden;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #333;
  border-bottom: 1px solid #555;
}

.debug-header h3 {
  margin: 0;
  font-size: 14px;
}

.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
}

.debug-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}

.debug-section {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
}

.debug-section h4 {
  margin: 0 0 8px 0;
  color: #4CAF50;
  font-size: 13px;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: bold;
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.preset-btn {
  padding: 5px 8px;
  background: #444;
  color: #fff;
  border: 1px solid #666;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.preset-btn:hover {
  background: #555;
}

.preset-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.parameters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
}

.parameter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.parameter-item label {
  font-size: 11px;
  color: #ccc;
}

.param-input,
.param-select {
  width: 80px;
  padding: 2px 4px;
  background: #333;
  border: 1px solid #555;
  color: #fff;
  border-radius: 2px;
  font-size: 11px;
}

.param-checkbox {
  width: auto;
}

.performance-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3px;
}

.stat {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #ccc;
  font-size: 11px;
}

.stat-value {
  color: #4CAF50;
  font-weight: bold;
}

.adjustments-list {
  max-height: 150px;
  overflow-y: auto;
}

.adjustment-item {
  margin-bottom: 8px;
  padding: 5px;
  background: #222;
  border-radius: 3px;
}

.adjustment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.timestamp {
  color: #888;
  font-size: 10px;
}

.reason {
  color: #FF9800;
  font-size: 10px;
  text-transform: uppercase;
}

.reason.low_success_rate {
  color: #f44336;
}

.reason.high_success_rate {
  color: #4CAF50;
}

.adjustment-details {
  font-size: 10px;
}

.performance {
  color: #2196F3;
  margin-bottom: 2px;
}

.changes {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.change {
  background: #333;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
}

.ab-tests {
  max-height: 100px;
  overflow-y: auto;
}

.test-item {
  margin-bottom: 5px;
  padding: 4px;
  background: #222;
  border-radius: 3px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.test-name {
  font-weight: bold;
  font-size: 11px;
}

.participant-count {
  color: #888;
  font-size: 10px;
}

.test-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.variant {
  background: #333;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 9px;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.action-btn {
  padding: 5px 8px;
  background: #2196F3;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn.warning {
  background: #FF9800;
}

.action-btn.danger {
  background: #f44336;
}

.console-output {
  height: 150px;
  overflow-y: auto;
  background: #111;
  border: 1px solid #333;
  padding: 5px;
  font-family: 'Courier New', monospace;
  font-size: 10px;
}

.console-line {
  margin-bottom: 2px;
  display: flex;
  gap: 8px;
}

.console-line.info {
  color: #fff;
}

.console-line.warn {
  color: #FF9800;
}

.console-line.error {
  color: #f44336;
}

.console-line .timestamp {
  color: #666;
  min-width: 60px;
}

.clear-console-btn {
  margin-top: 5px;
  padding: 3px 6px;
  background: #666;
  color: #fff;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-size: 9px;
}

.clear-console-btn:hover {
  background: #777;
}
</style>