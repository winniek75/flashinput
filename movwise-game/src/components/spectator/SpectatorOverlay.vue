<template>
  <Teleport to="body">
    <transition name="spectator-fade">
      <div v-if="isSpectatorMode && isConnected" class="spectator-overlay">
        <!-- 講師ビュー -->
        <div v-if="isTeacher" class="teacher-view">
          <div class="spectator-header">
            <h3 class="spectator-title">観戦モード - 講師</h3>
            <div class="room-info">
              <span class="room-code-label">ルームコード:</span>
              <span class="room-code">{{ roomCode }}</span>
              <button @click="copyRoomCode" class="copy-btn" title="コピー">
                📋
              </button>
            </div>
            <button @click="exitSpectatorMode" class="exit-btn">
              観戦モードを終了
            </button>
          </div>

          <div class="spectator-content">
            <!-- 参加者リスト -->
            <ParticipantsList 
              :participants="participants"
              :selectedStudentId="selectedStudentId"
              @select-student="selectStudent"
            />

            <!-- 選択された生徒のゲーム画面 -->
            <div class="game-view-container">
              <div v-if="selectedStudent" class="selected-student-info">
                <h4>{{ selectedStudent.name }}のゲーム画面</h4>
                <span v-if="selectedStudentGameState" class="game-status">
                  {{ selectedStudentGameState.currentGame || 'ゲーム未開始' }}
                </span>
              </div>
              <div v-else class="no-student-selected">
                生徒を選択してください
              </div>
            </div>
          </div>
        </div>

        <!-- 生徒ビュー -->
        <div v-else-if="isStudent" class="student-view">
          <div class="spectator-status">
            <span class="status-icon">👁️</span>
            <span class="status-text">講師が観戦中</span>
            <span class="room-code-small">{{ roomCode }}</span>
          </div>
        </div>

        <!-- 接続エラー表示 -->
        <div v-if="connectionError" class="connection-error">
          <span class="error-icon">⚠️</span>
          <span class="error-message">{{ connectionError }}</span>
          <button @click="attemptReconnect" class="reconnect-btn">
            再接続
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useSpectatorStore } from '@/stores/spectatorStore';
import { spectatorService } from '@/services/spectatorService';
import ParticipantsList from './ParticipantsList.vue';

const spectatorStore = useSpectatorStore();

// 計算プロパティ
const isSpectatorMode = computed(() => spectatorStore.isSpectatorMode);
const isConnected = computed(() => spectatorStore.isConnected);
const isTeacher = computed(() => spectatorStore.isTeacher);
const isStudent = computed(() => spectatorStore.isStudent);
const roomCode = computed(() => spectatorStore.roomCode);
const participants = computed(() => spectatorStore.participants);
const selectedStudentId = computed(() => spectatorStore.selectedStudentId);
const selectedStudent = computed(() => spectatorStore.selectedStudent);
const selectedStudentGameState = computed(() => spectatorStore.selectedStudentGameState);
const connectionError = computed(() => spectatorStore.connectionError);

// メソッド
function copyRoomCode() {
  navigator.clipboard.writeText(roomCode.value).then(() => {
    alert('ルームコードをコピーしました');
  }).catch(err => {
    console.error('コピーに失敗しました:', err);
  });
}

function selectStudent(studentId) {
  spectatorService.selectStudent(roomCode.value, studentId);
}

function exitSpectatorMode() {
  if (confirm('観戦モードを終了しますか？')) {
    spectatorService.leaveRoom();
    spectatorStore.exitSpectatorMode();
  }
}

function attemptReconnect() {
  spectatorService.attemptReconnect();
}

// 生徒のアクションを監視
if (isTeacher.value) {
  window.addEventListener('spectator:action', (event) => {
    const { studentId, action } = event.detail;
    // アクションのビジュアル表示などを実装可能
    console.log(`Student ${studentId} performed action:`, action);
  });
}
</script>

<style scoped>
.spectator-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  font-family: 'Noto Sans JP', sans-serif;
}

/* 講師ビュー */
.teacher-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.spectator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.spectator-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.room-code-label {
  opacity: 0.8;
}

.room-code {
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.1em;
}

.copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.copy-btn:hover {
  opacity: 1;
}

.exit-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.exit-btn:hover {
  background: #c82333;
}

.spectator-content {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 80px);
}

.game-view-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.selected-student-info {
  text-align: center;
  margin-bottom: 2rem;
}

.selected-student-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.game-status {
  opacity: 0.8;
  font-size: 1.1rem;
}

.no-student-selected {
  font-size: 1.2rem;
  opacity: 0.6;
}

/* 生徒ビュー */
.student-view {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10000;
}

.spectator-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.status-icon {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
}

.room-code-small {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-left: 0.5rem;
}

/* 接続エラー */
.connection-error {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #dc3545;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.error-icon {
  font-size: 1.5rem;
}

.error-message {
  font-size: 1rem;
}

.reconnect-btn {
  background: white;
  color: #dc3545;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
}

.reconnect-btn:hover {
  transform: scale(1.05);
}

/* アニメーション */
.spectator-fade-enter-active,
.spectator-fade-leave-active {
  transition: opacity 0.3s ease;
}

.spectator-fade-enter-from,
.spectator-fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .spectator-content {
    grid-template-columns: 1fr;
  }

  .spectator-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .room-info {
    width: 100%;
    justify-content: center;
  }

  .student-view {
    top: 0;
    right: 0;
    left: 0;
    border-radius: 0;
  }

  .spectator-status {
    justify-content: center;
    border-radius: 0;
  }
}
</style>