<template>
  <div class="vr-phonetics-container">
    <!-- VRシーンコンテナ -->
    <div ref="vrContainer" class="vr-scene-container"></div>

    <!-- VR準備画面 -->
    <div v-if="!isVRReady && !isGameActive" class="vr-setup-overlay">
      <div class="setup-card">
        <h2 class="setup-title">
          🥽 Phonetics Planet VR
        </h2>
        <p class="setup-description">
          音素が飛んでくる宇宙空間で発音練習！Meta Quest 3対応のWebXR体験
        </p>

        <!-- VR要件チェック -->
        <div class="vr-requirements">
          <div class="requirement-item" :class="{ 'met': vrSupport.webxr }">
            <span class="req-icon">{{ vrSupport.webxr ? '✅' : '❌' }}</span>
            <span>WebXR対応ブラウザ</span>
          </div>
          <div class="requirement-item" :class="{ 'met': vrSupport.device }">
            <span class="req-icon">{{ vrSupport.device ? '✅' : '⚠️' }}</span>
            <span>VRデバイス接続</span>
          </div>
          <div class="requirement-item" :class="{ 'met': hasRequiredTickets }">
            <span class="req-icon">{{ hasRequiredTickets ? '✅' : '🎫' }}</span>
            <span>VRチケット ({{ requiredTickets }}枚必要)</span>
          </div>
        </div>

        <!-- チケット情報 -->
        <div class="ticket-info" v-if="!hasRequiredTickets">
          <div class="ticket-status">
            <span class="ticket-icon">🎫</span>
            <span class="ticket-count">{{ ticketStore.currentTickets }}</span>
            <span class="ticket-label">/ {{ requiredTickets }}</span>
          </div>
          <p class="ticket-message">
            VRチケットが不足しています。ゲームをプレイしてチケットを獲得してください。
          </p>
          <button @click="$router.push('/game-library')" class="ticket-earn-btn">
            チケットを獲得する
          </button>
        </div>

        <!-- 設定オプション -->
        <div class="game-settings" v-if="hasRequiredTickets">
          <h3>ゲーム設定</h3>

          <div class="setting-group">
            <label>難易度</label>
            <select v-model="gameConfig.difficulty" class="setting-select">
              <option value="beginner">初心者</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
              <option value="expert">エキスパート</option>
            </select>
          </div>

          <div class="setting-group">
            <label>ゲーム時間</label>
            <select v-model="gameConfig.duration" class="setting-select">
              <option value="60">1分</option>
              <option value="120">2分</option>
              <option value="180">3分</option>
              <option value="300">5分</option>
            </select>
          </div>

          <div class="setting-group">
            <label>音素セット</label>
            <select v-model="gameConfig.phonemeSet" class="setting-select">
              <option value="basic">基本母音 (a,i,u,e,o)</option>
              <option value="hiragana">ひらがな基本</option>
              <option value="katakana">カタカナ基本</option>
              <option value="mixed">混合セット</option>
            </select>
          </div>
        </div>

        <!-- 開始ボタン -->
        <div class="action-buttons">
          <button
            @click="initializeVRScene"
            :disabled="!canStartGame"
            class="start-btn"
            :class="{ 'disabled': !canStartGame }"
          >
            <span v-if="isInitializing">🔄 初期化中...</span>
            <span v-else-if="!hasRequiredTickets">チケット不足</span>
            <span v-else-if="!vrSupport.webxr">WebXR未対応</span>
            <span v-else>🚀 VR体験を開始</span>
          </button>

          <button @click="$router.push('/vr-academy')" class="back-btn">
            🏠 VRアカデミーに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- ゲーム中UI -->
    <div v-if="isGameActive" class="game-overlay">
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">スコア</span>
          <span class="stat-value">{{ gameStats.score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正解率</span>
          <span class="stat-value">{{ Math.round(gameStats.accuracy * 100) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">残り時間</span>
          <span class="stat-value">{{ formatTime(gameStats.timeRemaining) }}</span>
        </div>
      </div>

      <div class="game-controls">
        <button @click="pauseGame" class="control-btn">
          {{ isPaused ? '▶️ 再開' : '⏸️ 一時停止' }}
        </button>
        <button @click="endGame" class="control-btn danger">
          🛑 終了
        </button>
      </div>
    </div>

    <!-- 結果モーダル -->
    <div v-if="showResultModal" class="result-overlay">
      <div class="result-modal">
        <h2 class="result-title">🎉 ゲーム完了！</h2>

        <div class="result-stats">
          <div class="result-stat">
            <span class="result-label">最終スコア</span>
            <span class="result-value">{{ gameStats.score }}</span>
          </div>
          <div class="result-stat">
            <span class="result-label">正解率</span>
            <span class="result-value">{{ Math.round(gameStats.accuracy * 100) }}%</span>
          </div>
          <div class="result-stat">
            <span class="result-label">音素ヒット</span>
            <span class="result-value">{{ gameStats.phonemesHit }}</span>
          </div>
        </div>

        <div class="rewards-section" v-if="gameRewards">
          <h3>🎁 獲得報酬</h3>
          <div class="reward-items">
            <div v-if="gameRewards.tickets > 0" class="reward-item">
              <span class="reward-icon">🎫</span>
              <span class="reward-text">+{{ gameRewards.tickets }} VRチケット</span>
            </div>
            <div v-if="gameRewards.xp > 0" class="reward-item">
              <span class="reward-icon">⚡</span>
              <span class="reward-text">+{{ gameRewards.xp }} XP</span>
            </div>
          </div>

          <div v-if="gameRewards.achievements && gameRewards.achievements.length > 0" class="achievements">
            <h4>🏆 アチーブメント</h4>
            <div v-for="achievement in gameRewards.achievements" :key="achievement" class="achievement-item">
              {{ achievement }}
            </div>
          </div>
        </div>

        <div class="result-actions">
          <button @click="restartGame" class="action-btn primary">
            🔄 もう一度プレイ
          </button>
          <button @click="exitToAcademy" class="action-btn secondary">
            🏠 VRアカデミーに戻る
          </button>
        </div>
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
    </div>

    <!-- デバッグパネル（開発環境のみ） -->
    <VRDebugPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticketStore'
import { useGameRewards } from '@/composables/useGameRewards'
import PhoneticsPlanet, { PhoneticsGameConfig } from '@/vr/scenes/PhoneticsPlanet'
import VRDebugPanel from '@/components/debug/VRDebugPanel.vue'
import logger from '@/utils/logger'

// ルーターとストア
const router = useRouter()
const ticketStore = useTicketStore()
const gameRewards = useGameRewards()

// VRシーンの参照
const vrContainer = ref<HTMLElement>()
let vrScene: PhoneticsPlanet | null = null

// 状態管理
const isVRReady = ref(false)
const isGameActive = ref(false)
const isPaused = ref(false)
const isInitializing = ref(false)
const showResultModal = ref(false)
const errorMessage = ref('')

// VRサポート状況
const vrSupport = ref({
  webxr: false,
  device: false
})

// チケット要件
const requiredTickets = ref(1)

// ゲーム設定
const gameConfig = ref<PhoneticsGameConfig>({
  difficulty: 'beginner',
  duration: 120,
  phonemeSet: ['a', 'i', 'u', 'e', 'o'],
  spawnRate: 0.5,
  targetAccuracy: 0.7
})

// ゲーム統計
const gameStats = ref({
  score: 0,
  accuracy: 0,
  correctHits: 0,
  totalShots: 0,
  phonemesHit: 0,
  phonemesMissed: 0,
  timeRemaining: 120
})

// ゲーム報酬
const currentGameRewards = ref<any>(null)

// 計算プロパティ
const hasRequiredTickets = computed(() =>
  ticketStore.currentTickets >= requiredTickets.value
)

const canStartGame = computed(() =>
  hasRequiredTickets.value &&
  vrSupport.value.webxr &&
  !isInitializing.value
)

// メソッド
async function checkVRSupport() {
  try {
    // WebXRサポートチェック
    if ('xr' in navigator) {
      vrSupport.value.webxr = await navigator.xr!.isSessionSupported('immersive-vr')
    }

    // デバイス接続チェック（簡易的）
    vrSupport.value.device = vrSupport.value.webxr

    logger.log('🥽 VR support check completed', vrSupport.value)
  } catch (error) {
    logger.error('VR support check failed:', error)
    vrSupport.value.webxr = false
    vrSupport.value.device = false
  }
}

async function initializeVRScene() {
  if (!canStartGame.value) {
    showError('ゲームを開始できません。要件を確認してください。')
    return
  }

  isInitializing.value = true

  try {
    // チケット消費
    const ticketConsumed = await ticketStore.useTicket(requiredTickets.value, 'vr_session', {
      game: 'phonetics-planet-vr',
      duration: gameConfig.value.duration
    })

    if (!ticketConsumed) {
      throw new Error('チケットの消費に失敗しました')
    }

    // VRシーン初期化
    await nextTick()

    if (vrContainer.value) {
      // 音素セット設定
      const phonemeSets = {
        basic: ['a', 'i', 'u', 'e', 'o'],
        hiragana: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'],
        katakana: ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ'],
        mixed: ['a', 'i', 'u', 'e', 'o', 'あ', 'い', 'う', 'え', 'お']
      }

      const config = {
        ...gameConfig.value,
        phonemeSet: phonemeSets[gameConfig.value.phonemeSet as keyof typeof phonemeSets] || phonemeSets.basic
      }

      vrScene = new PhoneticsPlanet(vrContainer.value, config)

      // VRシーンイベントリスナー
      setupVREventListeners()

      isVRReady.value = true
      logger.log('🌌 VR scene initialized successfully')

      // ゲーム開始
      setTimeout(() => {
        startGame()
      }, 1000)

    } else {
      throw new Error('VRコンテナが見つかりません')
    }
  } catch (error) {
    logger.error('VR scene initialization failed:', error)
    showError('VR環境の初期化に失敗しました: ' + error.message)

    // チケット返金
    await ticketStore.earnTicket(requiredTickets.value, 'vr_session_refund', {
      reason: 'initialization_failed'
    })
  } finally {
    isInitializing.value = false
  }
}

function setupVREventListeners() {
  if (!vrScene) return

  // ゲーム完了イベント
  window.addEventListener('vr-game-completed', handleGameCompleted)

  // ゲーム統計更新（カスタムイベントで受信）
  window.addEventListener('vr-stats-updated', (event: CustomEvent) => {
    gameStats.value = { ...gameStats.value, ...event.detail }
  })
}

function startGame() {
  if (!vrScene) return

  vrScene.startGame()
  isGameActive.value = true
  isPaused.value = false

  logger.log('🎮 Phonetics Planet VR game started')
}

function pauseGame() {
  if (!vrScene) return

  vrScene.pauseGame()
  isPaused.value = !isPaused.value
}

function endGame() {
  if (!vrScene) return

  if (confirm('本当にゲームを終了しますか？進捗は保存されます。')) {
    vrScene.endGame()
    isGameActive.value = false
  }
}

async function handleGameCompleted(event: CustomEvent) {
  const { result, rewards } = event.detail

  // 統計更新
  gameStats.value = {
    score: result.score,
    accuracy: result.accuracy,
    correctHits: result.correctAnswers,
    totalShots: result.totalQuestions,
    phonemesHit: result.correctAnswers,
    phonemesMissed: result.totalQuestions - result.correctAnswers,
    timeRemaining: 0
  }

  // 報酬保存
  currentGameRewards.value = rewards

  // ゲーム状態更新
  isGameActive.value = false
  showResultModal.value = true

  logger.log('🏁 VR game completed with rewards:', rewards)
}

function restartGame() {
  showResultModal.value = false

  if (hasRequiredTickets.value) {
    // 新しいゲームセッション開始
    initializeVRScene()
  } else {
    showError('チケットが不足しています。ゲームをプレイしてチケットを獲得してください。')
  }
}

function exitToAcademy() {
  showResultModal.value = false

  if (vrScene) {
    vrScene.dispose()
    vrScene = null
  }

  router.push('/vr-academy')
}

function showError(message: string) {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ライフサイクル
onMounted(async () => {
  // チケットストア初期化
  await ticketStore.initialize()

  // VRサポートチェック
  await checkVRSupport()

  logger.log('🥽 PhoneticsPlanetVR component mounted')
})

onUnmounted(() => {
  if (vrScene) {
    vrScene.dispose()
    vrScene = null
  }

  // イベントリスナークリーンアップ
  window.removeEventListener('vr-game-completed', handleGameCompleted)
  window.removeEventListener('vr-stats-updated', () => {})

  logger.log('🥽 PhoneticsPlanetVR component unmounted')
})
</script>

<style scoped>
.vr-phonetics-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  overflow: hidden;
}

.vr-scene-container {
  width: 100%;
  height: 100%;
}

.vr-setup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.setup-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  backdrop-filter: blur(20px);
}

.setup-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.setup-description {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-bottom: 32px;
  line-height: 1.6;
}

.vr-requirements {
  margin-bottom: 32px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.requirement-item.met {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.5);
  color: #22c55e;
}

.req-icon {
  font-size: 1.5rem;
}

.ticket-info {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
}

.ticket-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.ticket-icon {
  font-size: 1.5rem;
}

.ticket-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #a855f7;
}

.ticket-label {
  color: #94a3b8;
}

.ticket-message {
  color: #94a3b8;
  margin-bottom: 16px;
}

.ticket-earn-btn {
  background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ticket-earn-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.game-settings {
  text-align: left;
  margin-bottom: 32px;
}

.game-settings h3 {
  color: #fbbf24;
  margin-bottom: 16px;
  text-align: center;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-group label {
  display: block;
  color: #e2e8f0;
  font-weight: bold;
  margin-bottom: 8px;
}

.setting-select {
  width: 100%;
  padding: 10px 12px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.start-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 250px;
}

.start-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
}

.start-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #6b7280;
}

.back-btn {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  padding: 16px 32px;
  border-radius: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

.game-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 100;
  pointer-events: none;
}

.game-stats {
  display: flex;
  gap: 16px;
  background: rgba(15, 23, 42, 0.8);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.game-controls {
  display: flex;
  gap: 12px;
  pointer-events: auto;
}

.control-btn {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
}

.control-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.result-modal {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 24px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
}

.result-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fbbf24;
  margin-bottom: 24px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.result-stat {
  text-align: center;
  padding: 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
}

.result-label {
  display: block;
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.result-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.rewards-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.rewards-section h3 {
  color: #22c55e;
  margin-bottom: 16px;
}

.reward-items {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 16px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
}

.reward-icon {
  font-size: 1.2rem;
}

.achievements h4 {
  color: #f59e0b;
  margin-bottom: 8px;
}

.achievement-item {
  color: #fbbf24;
  margin-bottom: 4px;
}

.result-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-btn.secondary {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.5);
  color: #60a5fa;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.error-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  z-index: 3000;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .setup-card {
    padding: 24px;
  }

  .setup-title {
    font-size: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }

  .reward-items {
    flex-direction: column;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>