<template>
  <div class="room-controls">
    <div class="controls-container">
      <!-- 初期選択画面 -->
      <div v-if="!roleSelected" class="role-selection">
        <h2 class="title">観戦モード</h2>
        <p class="description">役割を選択してください</p>
        
        <div class="role-buttons">
          <button @click="selectRole('teacher')" class="role-btn teacher-btn">
            <span class="role-icon">👨‍🏫</span>
            <span class="role-label">講師として開始</span>
            <span class="role-desc">ルームを作成して生徒を観戦</span>
          </button>
          
          <button @click="selectRole('student')" class="role-btn student-btn">
            <span class="role-icon">🎓</span>
            <span class="role-label">生徒として参加</span>
            <span class="role-desc">ルームコードで参加</span>
          </button>
        </div>
      </div>

      <!-- 講師用：ルーム作成 -->
      <div v-else-if="role === 'teacher' && !roomCreated" class="teacher-setup">
        <button @click="goBack" class="back-btn">← 戻る</button>
        <h2 class="title">ルーム作成</h2>
        
        <form @submit.prevent="createRoom" class="form">
          <div class="form-group">
            <label for="teacherName">講師名</label>
            <input
              id="teacherName"
              v-model="teacherName"
              type="text"
              placeholder="お名前を入力"
              required
              class="form-input"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">ルームを作成</span>
            <span v-else>作成中...</span>
          </button>
        </form>
      </div>

      <!-- 講師用：ルーム作成完了 -->
      <div v-else-if="role === 'teacher' && roomCreated" class="room-created">
        <h2 class="title">ルーム作成完了</h2>
        
        <div class="room-code-display">
          <p class="code-label">ルームコード</p>
          <div class="code-box">
            <span class="code-text">{{ roomCode }}</span>
            <button @click="copyCode" class="copy-btn" title="コピー">
              📋
            </button>
          </div>
          <p class="code-hint">このコードを生徒に共有してください</p>
        </div>

        <!-- QRコード表示（オプション） -->
        <div v-if="showQR" class="qr-section">
          <canvas ref="qrCanvas"></canvas>
          <p class="qr-hint">QRコードをスキャンして参加</p>
        </div>

        <button @click="startSpectating" class="start-btn">
          観戦を開始
        </button>
      </div>

      <!-- 生徒用：ルーム参加 -->
      <div v-else-if="role === 'student'" class="student-join">
        <button @click="goBack" class="back-btn">← 戻る</button>
        <h2 class="title">ルームに参加</h2>
        
        <form @submit.prevent="joinRoom" class="form">
          <div class="form-group">
            <label for="studentName">生徒名</label>
            <input
              id="studentName"
              v-model="studentName"
              type="text"
              placeholder="お名前を入力"
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="roomCode">ルームコード</label>
            <input
              id="roomCode"
              v-model="inputRoomCode"
              type="text"
              placeholder="6桁のコード"
              maxlength="6"
              required
              class="form-input code-input"
              @input="formatRoomCode"
            />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">参加する</span>
            <span v-else>参加中...</span>
          </button>
        </form>
      </div>

      <!-- エラー表示 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useSpectatorStore } from '@/stores/spectatorStore';
import { spectatorService } from '@/services/spectatorService';
import { useRouter } from 'vue-router';

const router = useRouter();
const spectatorStore = useSpectatorStore();

// Props
const props = defineProps({
  initialRole: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['room-created', 'room-joined']);

// State
const roleSelected = ref(!!props.initialRole);
const role = ref(props.initialRole);
const teacherName = ref('');
const studentName = ref('');
const inputRoomCode = ref('');
const roomCreated = ref(false);
const isLoading = ref(false);
const error = ref('');
const showQR = ref(false);
const qrCanvas = ref(null);

// Computed
const roomCode = computed(() => spectatorStore.roomCode);

// Methods
function selectRole(selectedRole) {
  role.value = selectedRole;
  roleSelected.value = true;
  error.value = '';
}

function goBack() {
  if (roomCreated.value) {
    roomCreated.value = false;
  } else {
    roleSelected.value = false;
    role.value = null;
  }
  error.value = '';
}

async function createRoom() {
  if (!teacherName.value.trim()) {
    error.value = '講師名を入力してください';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Socket.ioサーバーに接続
    await spectatorService.connect();
    
    // ルームを作成
    const teacherId = `teacher-${Date.now()}`;
    await spectatorService.createRoom(teacherId, teacherName.value);
    
    roomCreated.value = true;
    
    // QRコードを生成（オプション）
    // generateQRCode();
    
    emit('room-created', {
      roomCode: roomCode.value,
      teacherName: teacherName.value
    });
  } catch (err) {
    console.error('Room creation error:', err);
    error.value = err.message || 'ルームの作成に失敗しました';
  } finally {
    isLoading.value = false;
  }
}

async function joinRoom() {
  if (!studentName.value.trim()) {
    error.value = '生徒名を入力してください';
    return;
  }
  
  if (inputRoomCode.value.length !== 6) {
    error.value = 'ルームコードは6桁で入力してください';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    console.log('Attempting to join room with code:', inputRoomCode.value.toUpperCase());
    
    // Socket.ioサーバーに接続
    await spectatorService.connect();
    console.log('Connected to Socket.io server');
    
    // ルームに参加
    const studentId = `student-${Date.now()}`;
    console.log('Joining room as student:', studentId);
    
    await spectatorService.joinRoom(
      inputRoomCode.value.toUpperCase(),
      studentId,
      studentName.value
    );
    
    console.log('Successfully joined room');
    
    emit('room-joined', {
      roomCode: inputRoomCode.value,
      studentName: studentName.value
    });
    
    // ゲーム画面へ遷移
    // router.push('/');
  } catch (err) {
    console.error('Room join error:', err);
    console.error('Error stack:', err.stack);
    error.value = err.message || 'ルームへの参加に失敗しました';
  } finally {
    isLoading.value = false;
  }
}

function formatRoomCode(event) {
  // 大文字に変換
  inputRoomCode.value = event.target.value.toUpperCase();
}

function copyCode() {
  navigator.clipboard.writeText(roomCode.value).then(() => {
    // 一時的に成功メッセージを表示
    const originalText = '📋';
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.textContent = '✅';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 1000);
  }).catch(err => {
    console.error('Copy failed:', err);
    error.value = 'コピーに失敗しました';
  });
}

function startSpectating() {
  // 観戦画面を表示
  emit('room-created', {
    roomCode: roomCode.value,
    teacherName: teacherName.value
  });
}

// QRコード生成（実装は省略）
function generateQRCode() {
  // QRコード生成ライブラリを使用して実装
  // 例: qrcode.js
}
</script>

<style scoped>
.room-controls {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.controls-container {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

/* 役割選択 */
.role-buttons {
  display: grid;
  gap: 1rem;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.teacher-btn:hover {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
}

.student-btn:hover {
  background: linear-gradient(135deg, #f09310 0%, #ff6b6b10 100%);
}

.role-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.role-label {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.role-desc {
  font-size: 0.9rem;
  color: #666;
}

/* フォーム */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.code-input {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.submit-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ルーム作成完了 */
.room-code-display {
  text-align: center;
  margin: 2rem 0;
}

.code-label {
  color: #666;
  margin-bottom: 1rem;
}

.code-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
}

.code-text {
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 0.3em;
  color: #333;
}

.copy-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.copy-btn:hover {
  transform: scale(1.1);
}

.code-hint {
  font-size: 0.9rem;
  color: #666;
}

.start-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.start-btn:hover {
  background: #218838;
}

/* 戻るボタン */
.back-btn {
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.8;
}

/* エラー表示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1.2rem;
}

/* QRコード */
.qr-section {
  text-align: center;
  margin: 2rem 0;
}

.qr-section canvas {
  margin: 0 auto;
}

.qr-hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .controls-container {
    padding: 2rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .code-text {
    font-size: 2rem;
  }
}
</style>