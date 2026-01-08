<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <!-- ヘッダー -->
          <div class="modal-header">
            <h2 class="modal-title">🎉 ゲーム完了報酬</h2>
            <button @click="close" class="close-btn">✕</button>
          </div>

          <!-- 報酬内容 -->
          <div class="modal-body">
            <!-- メイン報酬表示 -->
            <div class="main-rewards">
              <div class="reward-item tickets" v-if="rewards.tickets > 0">
                <div class="reward-icon">🎫</div>
                <div class="reward-info">
                  <div class="reward-amount">+{{ rewards.tickets }}</div>
                  <div class="reward-label">VRチケット</div>
                </div>
              </div>

              <div class="reward-item xp" v-if="rewards.xp > 0">
                <div class="reward-icon">⚡</div>
                <div class="reward-info">
                  <div class="reward-amount">+{{ rewards.xp }}</div>
                  <div class="reward-label">XP</div>
                </div>
              </div>
            </div>

            <!-- 詳細な獲得理由 -->
            <div class="reward-details" v-if="rewards.reasons.length > 0">
              <h3 class="details-title">📋 獲得詳細</h3>
              <div class="reasons-list">
                <div
                  v-for="(reason, index) in rewards.reasons"
                  :key="index"
                  class="reason-item"
                >
                  <span class="reason-icon">✓</span>
                  <span class="reason-text">{{ reason }}</span>
                </div>
              </div>
            </div>

            <!-- アチーブメント -->
            <div class="achievements-section" v-if="rewards.achievements && rewards.achievements.length > 0">
              <h3 class="details-title">🏆 アチーブメント達成</h3>
              <div class="achievements-list">
                <div
                  v-for="(achievement, index) in rewards.achievements"
                  :key="index"
                  class="achievement-item"
                >
                  <span class="achievement-icon">🏆</span>
                  <span class="achievement-text">{{ achievement }}</span>
                </div>
              </div>
            </div>

            <!-- 次のアクション -->
            <div class="next-actions">
              <h3 class="details-title">🎯 おすすめのアクション</h3>
              <div class="action-buttons">
                <button @click="goToTicketShop" class="action-btn primary">
                  <span class="btn-icon">🛒</span>
                  <span class="btn-text">チケットを使う</span>
                </button>
                <button @click="continuePlaying" class="action-btn secondary">
                  <span class="btn-icon">🎮</span>
                  <span class="btn-text">別のゲームをプレイ</span>
                </button>
                <button v-if="canPlayVR" @click="startVRSession" class="action-btn vr">
                  <span class="btn-icon">🥽</span>
                  <span class="btn-text">VRで学習</span>
                </button>
              </div>
            </div>
          </div>

          <!-- フッター -->
          <div class="modal-footer">
            <button @click="close" class="finish-btn">
              完了
            </button>
          </div>

          <!-- パーティクルエフェクト -->
          <div class="celebration-particles">
            <div
              v-for="i in particleCount"
              :key="i"
              class="particle"
              :style="getParticleStyle(i)"
            >
              {{ getParticleEmoji(i) }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticketStore'
import type { RewardSummary } from '@/composables/useGameRewards'

interface Props {
  show: boolean
  rewards: RewardSummary
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'ticket-shop': []
  'continue-playing': []
  'start-vr': []
}>()

const router = useRouter()
const ticketStore = useTicketStore()

// リアクティブ変数
const particleCount = 20

// 計算プロパティ
const canPlayVR = computed(() => ticketStore.currentTickets >= 1)

// メソッド
function close() {
  emit('close')
}

function goToTicketShop() {
  emit('ticket-shop')
  // チケット詳細パネルを開く処理
  window.dispatchEvent(new CustomEvent('show-ticket-details'))
  close()
}

function continuePlaying() {
  emit('continue-playing')
  router.push({ name: 'GameLibrary' })
  close()
}

function startVRSession() {
  if (canPlayVR.value) {
    emit('start-vr')
    // VRセッション開始処理
    router.push({ name: 'VRAcademy' })
    close()
  }
}

function getParticleStyle(index: number) {
  const angle = (360 / particleCount) * index
  const radius = 150 + Math.random() * 100
  const duration = 3 + Math.random() * 2
  const delay = Math.random() * 1

  return {
    '--angle': `${angle}deg`,
    '--radius': `${radius}px`,
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    left: '50%',
    top: '50%'
  }
}

function getParticleEmoji(index: number): string {
  const emojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎁', '🏆', '🥳', '🎈']
  return emojis[index % emojis.length]
}

// パーティクルアニメーション開始
watch(() => props.show, (newShow) => {
  if (newShow && (props.rewards.tickets > 0 || props.rewards.xp > 0)) {
    // 報酬がある場合のみパーティクルを表示
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-container {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  border-radius: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 30px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.main-rewards {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.reward-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  min-width: 140px;
}

.reward-item.tickets {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  border: 2px solid rgba(139, 92, 246, 0.5);
}

.reward-item.xp {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
}

.reward-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounce 2s infinite;
}

.reward-amount {
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-align: center;
}

.reward-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.reward-details,
.achievements-section,
.next-actions {
  margin-bottom: 25px;
}

.details-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reasons-list,
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-item,
.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
}

.achievement-item {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
  border-color: rgba(245, 158, 11, 0.5);
}

.reason-icon,
.achievement-icon {
  font-size: 16px;
  color: #10b981;
}

.achievement-icon {
  color: #f59e0b;
}

.reason-text,
.achievement-text {
  font-size: 14px;
  color: white;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  border: 2px solid rgba(59, 130, 246, 0.5);
  color: white;
}

.action-btn.vr {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 14px;
}

.modal-footer {
  padding: 20px 30px;
  border-top: 1px solid rgba(59, 130, 246, 0.3);
  display: flex;
  justify-content: center;
}

.finish-btn {
  padding: 12px 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.finish-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.celebration-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  font-size: 24px;
  animation: particleFloat var(--duration) ease-out infinite;
  animation-delay: var(--delay);
}

@keyframes particleFloat {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateY(0) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translateY(var(--radius)) scale(1.5);
    opacity: 0;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* スクロールバーのスタイリング */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 3px;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }

  .main-rewards {
    flex-direction: column;
    gap: 20px;
  }

  .reward-item {
    min-width: auto;
  }

  .action-buttons {
    gap: 8px;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>