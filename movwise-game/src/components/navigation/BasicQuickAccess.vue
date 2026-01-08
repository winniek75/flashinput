<template>
  <div class="basic-quick-access">
    <!-- Visible Toggle Button -->
    <button 
      @click="togglePanel"
      class="basic-toggle-btn"
      :class="{ 'panel-open': isOpen }"
    >
      {{ isOpen ? '✕' : '📊' }}
    </button>

    <!-- Slide-out Panel -->
    <div v-if="isOpen" class="basic-panel">
      <div class="panel-header">
        <h3>🚀 クイックアクセス</h3>
        <button @click="closePanel" class="close-btn">✕</button>
      </div>

      <div class="panel-section">
        <h4>📊 ダッシュボード</h4>
        <button @click="navigate('/student-session')" class="panel-btn">
          🎮 学習セッション
        </button>
        <button @click="navigate('/teacher-dashboard')" class="panel-btn">
          👨‍🏫 講師ダッシュボード
        </button>
        <button @click="navigate('/parent/dashboard')" class="panel-btn">
          👨‍👩‍👧‍👦 親ポータル
        </button>
      </div>

      <div class="panel-section">
        <h4>🎮 学習エリア</h4>
        <button @click="navigate('/platforms/phonics-adventure')" class="panel-btn">
          🎵 サウンドラボ
        </button>
        <button @click="navigate('/grammar-galaxy')" class="panel-btn">
          🌌 グラマーギャラクシー
        </button>
        <button @click="navigate('/galaxy-map')" class="panel-btn">
          🗺️ 銀河マップ
        </button>
      </div>

      <div class="panel-section">
        <h4>⚙️ 設定</h4>
        <button @click="navigate('/profile')" class="panel-btn">
          👤 プロフィール
        </button>
        <button @click="navigate('/subscription')" class="panel-btn">
          💳 サブスクリプション
        </button>
        <button @click="navigate('/demo-login')" class="panel-btn">
          🔐 デモログイン
        </button>
      </div>

      <div class="panel-footer">
        <div class="status-info">
          <div>👤 ユーザー</div>
          <div>👑 フリープラン</div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="isOpen" class="backdrop" @click="closePanel"></div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'BasicQuickAccess',
  setup() {
    const router = useRouter()
    const isOpen = ref(false)

    const togglePanel = () => {
      logger.log('BasicQuickAccess toggle clicked!')
      isOpen.value = !isOpen.value
    }

    const closePanel = () => {
      isOpen.value = false
    }

    const navigate = (path) => {
      logger.log('Navigating to:', path)
      router.push(path)
      closePanel()
    }

    return {
      isOpen,
      togglePanel,
      closePanel,
      navigate
    }
  }
}
</script>

<style scoped>
.basic-quick-access {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1000;
}

.basic-toggle-btn {
  position: relative;
  right: -2px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 50% 0 0 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: -3px 0 15px rgba(139, 92, 246, 0.4);
  z-index: 1002;
}

.basic-toggle-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  right: 0;
  box-shadow: -5px 0 20px rgba(139, 92, 246, 0.6);
}

.basic-toggle-btn.panel-open {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 0;
  right: 300px;
  display: none; /* パネルが開いているときはトグルボタンを非表示 */
}

.basic-panel {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%);
  width: 300px;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px 0 0 12px;
  backdrop-filter: blur(10px);
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4);
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50%) translateX(100%);
  }
  to {
    transform: translateY(-50%) translateX(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}


.panel-section {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section h4 {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.panel-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.panel-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  color: white;
}

.panel-footer {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.2);
}

.status-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.status-info div {
  margin-bottom: 0.25rem;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
}

/* Mobile Optimization */
@media (max-width: 768px) {
  .basic-toggle-btn {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .basic-panel {
    width: 280px;
    right: 50px;
  }

  .basic-toggle-btn.panel-open {
    right: 280px;
  }
}
</style>