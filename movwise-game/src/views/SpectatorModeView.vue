<template>
  <div class="spectator-mode-view">
    <RoomControls 
      v-if="!roomJoined"
      @room-created="onRoomCreated"
      @room-joined="onRoomJoined"
    />
    
    <div v-else class="spectator-active">
      <!-- 講師はオーバーレイで観戦画面を表示 -->
      <div v-if="isTeacher" class="teacher-message">
        <h2>観戦モード準備完了</h2>
        <p>生徒がゲームを開始するのを待っています...</p>
        <p class="room-code">ルームコード: <strong>{{ roomCode }}</strong></p>
      </div>
      
      <!-- 生徒は通常のゲーム画面へ -->
      <div v-else class="student-message">
        <h2>ルームに参加しました</h2>
        <p>ゲームを選択して開始してください</p>
        <button @click="goToGameHub" class="start-btn">
          ゲームを始める
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSpectatorStore } from '@/stores/spectatorStore';
import RoomControls from '@/components/spectator/RoomControls.vue';

const router = useRouter();
const spectatorStore = useSpectatorStore();

// 状態
const roomJoined = ref(false);

// 計算プロパティ
const isTeacher = computed(() => spectatorStore.isTeacher);
const roomCode = computed(() => spectatorStore.roomCode);

// メソッド
function onRoomCreated(data) {
  console.log('Room created:', data);
  roomJoined.value = true;
  
  // 講師もホーム画面へ遷移（SpectatorOverlayが表示される）
  setTimeout(() => {
    goToGameHub();
  }, 1500);
}

function onRoomJoined(data) {
  console.log('Room joined:', data);
  roomJoined.value = true;
  
  // 生徒は自動的にゲームハブへ遷移
  setTimeout(() => {
    goToGameHub();
  }, 1500);
}

function goToGameHub() {
  router.push('/');
}
</script>

<style scoped>
.spectator-mode-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spectator-active {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.teacher-message,
.student-message {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1rem;
}

.room-code {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.room-code strong {
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  color: #667eea;
}

.start-btn {
  margin-top: 2rem;
  padding: 1rem 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: translateY(-2px);
}
</style>