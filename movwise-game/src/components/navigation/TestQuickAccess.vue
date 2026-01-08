<template>
  <div class="test-quick-access">
    <button 
      @click="togglePanel"
      class="test-toggle-btn"
    >
      {{ isOpen ? '✕' : '📊' }}
    </button>

    <div v-if="isOpen" class="test-panel">
      <h3>クイックアクセス</h3>
      <div class="test-links">
        <a href="/ai-testing" class="ai-test-link">🤖 AI System Testing</a>
        <a href="/ai-demo" class="ai-demo-link">🎮 AI Game Demo</a>
        <a href="/demo-login">🔐 デモログイン</a>
        <a href="/teacher-dashboard">👨‍🏫 講師ダッシュボード</a>
        <a href="/student-session">🎮 学習セッション</a>
        <a href="/parent/dashboard">👨‍👩‍👧‍👦 親ポータル</a>
        <a href="/subscription">💳 サブスクリプション</a>
      </div>
      <button @click="closePanel">閉じる</button>
    </div>

    <div v-if="isOpen" class="test-backdrop" @click="closePanel"></div>
  </div>
</template>

<script>
import logger from '@/utils/logger'

import { ref } from 'vue'

export default {
  name: 'TestQuickAccess',
  setup() {
    const isOpen = ref(false)

    const togglePanel = () => {
      logger.log('Test toggle clicked!')
      isOpen.value = !isOpen.value
    }

    const closePanel = () => {
      isOpen.value = false
    }

    return {
      isOpen,
      togglePanel,
      closePanel
    }
  }
}
</script>

<style scoped>
.test-quick-access {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 1000;
}

.test-toggle-btn {
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
  box-shadow: -3px 0 15px rgba(139, 92, 246, 0.4);
}

.test-toggle-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  right: 0;
}

.test-panel {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%);
  width: 300px;
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px 0 0 12px;
  padding: 1.5rem;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.4);
}

.test-panel h3 {
  color: white;
  margin: 0 0 1rem 0;
  text-align: center;
}

.test-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.test-links a {
  display: block;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.test-links a:hover {
  background: rgba(139, 92, 246, 0.3);
}

.ai-test-link {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)) !important;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.ai-test-link:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.4)) !important;
}

.ai-demo-link {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2)) !important;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.ai-demo-link:hover {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(139, 92, 246, 0.4)) !important;
}

.test-panel button {
  width: 100%;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.test-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}
</style>