<template>
  <div class="participants-list">
    <div class="list-header">
      <h3 class="list-title">参加者</h3>
      <span class="participant-count">{{ studentCount }}/10</span>
    </div>

    <div class="participants-container">
      <!-- 生徒リスト -->
      <div v-if="students.length > 0" class="students-list">
        <div
          v-for="student in students"
          :key="student.id"
          :class="[
            'participant-item',
            { 
              'selected': student.id === selectedStudentId,
              'disconnected': !student.connected
            }
          ]"
          @click="selectStudent(student.id)"
        >
          <div class="participant-info">
            <div class="participant-avatar">
              <span class="avatar-icon">🎓</span>
              <span 
                v-if="student.connected" 
                class="status-indicator online"
                title="オンライン"
              ></span>
              <span 
                v-else 
                class="status-indicator offline"
                title="オフライン"
              ></span>
            </div>
            
            <div class="participant-details">
              <h4 class="participant-name">{{ student.name }}</h4>
              <p class="participant-status">
                <span v-if="student.connected" class="status-text">
                  {{ getStudentStatus(student.id) }}
                </span>
                <span v-else class="status-text offline-text">
                  接続が切断されました
                </span>
              </p>
            </div>
          </div>

          <div class="participant-actions">
            <button 
              v-if="student.connected"
              @click.stop="viewStudent(student.id)"
              class="action-btn view-btn"
              title="画面を表示"
            >
              👁️
            </button>
          </div>
        </div>
      </div>

      <!-- 生徒がいない場合 -->
      <div v-else class="empty-state">
        <div class="empty-icon">👥</div>
        <p class="empty-text">生徒が参加するのを待っています</p>
        <p class="empty-hint">ルームコード: <strong>{{ roomCode }}</strong></p>
      </div>
    </div>

    <!-- 統計情報 -->
    <div v-if="students.length > 0" class="stats-section">
      <h4 class="stats-title">統計</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">オンライン</span>
          <span class="stat-value">{{ onlineCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">ゲーム中</span>
          <span class="stat-value">{{ playingCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSpectatorStore } from '@/stores/spectatorStore';

// Props
const props = defineProps({
  participants: {
    type: Object,
    required: true
  },
  selectedStudentId: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['select-student']);

// Store
const spectatorStore = useSpectatorStore();

// Computed
const students = computed(() => props.participants.students || []);
const studentCount = computed(() => students.value.length);
const roomCode = computed(() => spectatorStore.roomCode);

const onlineCount = computed(() => {
  return students.value.filter(s => s.connected).length;
});

const playingCount = computed(() => {
  return students.value.filter(s => {
    const gameState = spectatorStore.gameStates.get(s.id);
    return gameState && gameState.currentGame;
  }).length;
});

// Methods
function selectStudent(studentId) {
  emit('select-student', studentId);
}

function viewStudent(studentId) {
  emit('select-student', studentId);
}

function getStudentStatus(studentId) {
  const gameState = spectatorStore.gameStates.get(studentId);
  if (!gameState) {
    return '待機中';
  }
  
  if (gameState.currentGame) {
    return `${gameState.currentGame}をプレイ中`;
  }
  
  return 'ゲーム選択中';
}
</script>

<style scoped>
.participants-list {
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-title {
  margin: 0;
  font-size: 1.25rem;
  color: white;
}

.participant-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.participants-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.participant-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.participant-item.selected {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.participant-item.disconnected {
  opacity: 0.6;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.participant-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.avatar-icon {
  font-size: 1.5rem;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #000;
}

.status-indicator.online {
  background: #28a745;
}

.status-indicator.offline {
  background: #dc3545;
}

.participant-details {
  flex: 1;
}

.participant-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: white;
}

.participant-status {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.offline-text {
  color: #dc3545;
}

.participant-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-hint {
  margin: 0;
  font-size: 0.9rem;
}

.empty-hint strong {
  color: white;
  font-weight: bold;
}

/* 統計情報 */
.stats-section {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

/* スクロールバー */
.participants-container::-webkit-scrollbar {
  width: 6px;
}

.participants-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.participants-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.participants-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .participants-list {
    position: fixed;
    left: 0;
    top: 80px;
    bottom: 0;
    width: 250px;
    transform: translateX(-100%);
    transition: transform 0.3s;
    z-index: 100;
    background: rgba(0, 0, 0, 0.95);
  }

  .participants-list.show {
    transform: translateX(0);
  }
}
</style>