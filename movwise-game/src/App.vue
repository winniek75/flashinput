<template>
  <div id="app">
    <RouterView />
    <AudioManager
      ref="globalAudioManager"
      :settings="audioSettings"
      @audio-ready="onAudioReady"
    />
    <!-- 観戦モードオーバーレイ -->
    <SpectatorOverlay />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AudioManager from '@/components/games/grammar-galaxy/shared/AudioManager.vue'
import SpectatorOverlay from '@/components/spectator/SpectatorOverlay.vue'
import { useAudioStore } from '@/stores/audioStore'
import { ref, computed } from 'vue'

const audioStore = useAudioStore()
const globalAudioManager = ref(null)
const audioSettings = computed(() => audioStore.settings)

const onAudioReady = () => {
  console.log('Global audio system ready')
  audioStore.setAudioManager(globalAudioManager.value)
}
</script>

<style>
#app {
  min-height: 100vh;
}

/* 全体的なスタイル調整 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  /* iOS Safari スクロール最適化 */
  -webkit-overflow-scrolling: touch;
  overflow-x: hidden;
  min-height: 100vh;
  height: auto;
}

/* iOS スクロール問題解決 */
html {
  -webkit-text-size-adjust: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  height: auto;
  overflow-x: hidden;
  position: relative;
}

/* iOS Safari でのビューポート問題解決 */
@supports (-webkit-touch-callout: none) {
  body {
    min-height: -webkit-fill-available;
  }
  
  #app {
    min-height: -webkit-fill-available;
  }
}

/* タッチデバイス最適化 */
@media (max-width: 768px) {
  .game-button {
    @apply text-base px-4 py-3;
    min-height: 44px; /* タッチターゲット最小サイズ */
    touch-action: manipulation; /* ダブルタップズーム無効化 */
  }
  
  .phonics-option {
    @apply text-xl h-16;
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .score-display {
    @apply text-2xl px-4 py-2;
  }
  
  /* モバイル専用スタイル */
  .galaxy-card {
    margin-bottom: 1rem;
    touch-action: manipulation;
  }
  
  /* テキスト選択無効化（ゲーム要素） */
  .game-element {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  
  /* スクロール改善 */
  .scrollable-content {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
    transform: translateZ(0); /* GPU加速 */
  }
}

/* アニメーション */
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

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>