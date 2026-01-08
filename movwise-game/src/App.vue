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

    <!-- テスト用クイックアクセスパネル -->
    <TestQuickAccess />

    <!-- クエストパネル -->
    <QuestPanel v-if="shouldShowQuests" />

    <!-- ストリーク表示 -->
    <StreakDisplay v-if="shouldShowStreak" />
    
  </div>
</template>

<script setup>
import logger from '@/utils/logger'

import { RouterView, useRoute } from 'vue-router'
import AudioManager from '@/components/games/grammar-galaxy/shared/AudioManager.vue'
import SpectatorOverlay from '@/components/spectator/SpectatorOverlay.vue'
import TestQuickAccess from '@/components/navigation/TestQuickAccess.vue'
import QuestPanel from '@/components/quest/QuestPanel.vue'
import StreakDisplay from '@/components/streak/StreakDisplay.vue'
import { useAudioStore } from '@/stores/audioStore'
import { useQuestStore } from '@/stores/questStore'
import { useStreakStore } from '@/stores/streakStore'
import { useReminderStore } from '@/stores/reminderStore'
import notificationService from '@/services/notificationService'
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const audioStore = useAudioStore()
const questStore = useQuestStore()
const streakStore = useStreakStore()
const reminderStore = useReminderStore()

const globalAudioManager = ref(null)
const audioSettings = computed(() => audioStore.settings)

// UI表示条件
const shouldShowQuests = computed(() => {
  // ログイン画面やランディングページでは非表示
  const hideOnRoutes = ['/login', '/demo-login', '/user-type-selection', '/']
  return !hideOnRoutes.includes(route.path)
})

const shouldShowStreak = computed(() => {
  // クエストパネルと同様の条件
  const hideOnRoutes = ['/login', '/demo-login', '/user-type-selection', '/']
  return !hideOnRoutes.includes(route.path)
})

const onAudioReady = () => {
  logger.log('Global audio system ready')
  audioStore.setAudioManager(globalAudioManager.value)
}

// ライフサイクル
onMounted(async () => {
  // ストアを初期化
  questStore.initializeStore()
  streakStore.initializeStore()
  reminderStore.initializeStore()

  // 通知サービスを初期化
  await notificationService.initialize()

  // 離脱リスクに基づいてスマートリマインダーをスケジュール
  if (reminderStore.isNotificationEnabled) {
    reminderStore.scheduleSmartReminders()
  }

  logger.log('🚀 MovWISE app initialized with quest, streak & reminder systems')
})
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
  min-height: -webkit-fill-available;
  height: auto;
  width: 100%;
  position: relative;
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

/* レスポンシブデザイン基本設定 */
.responsive-wrapper {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* タッチデバイス最適化 */
@media (max-width: 768px) {
  #app {
    padding: 0;
    touch-action: pan-y;
  }
  
  .game-button {
    @apply text-base px-4 py-3;
    min-height: 44px;
    touch-action: manipulation;
    width: 100%;
    max-width: 100%;
  }
  
  .phonics-option {
    @apply text-lg sm:text-xl h-14 sm:h-16;
    min-height: 44px;
    touch-action: manipulation;
  }
  
  .score-display {
    @apply text-xl sm:text-2xl px-3 sm:px-4 py-2;
  }
  
  /* モバイル専用スタイル */
  .galaxy-card {
    margin-bottom: 1rem;
    touch-action: manipulation;
    width: 100%;
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
    overflow-x: hidden;
    transform: translateZ(0);
  }
  
  /* モバイルナビゲーション */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    padding: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
}

/* タブレット専用スタイル */
@media (min-width: 769px) and (max-width: 1024px) {
  #app {
    padding: 0;
  }
  
  .game-button {
    @apply text-lg px-5 py-3;
    min-height: 48px;
  }
  
  .phonics-option {
    @apply text-xl h-20;
    min-height: 48px;
  }
  
  .score-display {
    @apply text-2xl px-5 py-3;
  }
  
  /* タブレットグリッド */
  .tablet-grid {
    @apply grid grid-cols-2 gap-4;
  }
}

/* 横向きモバイル対応 */
@media (orientation: landscape) and (max-height: 600px) {
  #app {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .landscape-compact {
    @apply py-1 sm:py-2;
  }
  
  .landscape-hidden-mobile {
    @apply hidden sm:block;
  }
}

/* 小型スマートフォン対応 */
@media (max-width: 375px) {
  .game-button {
    @apply text-sm px-3 py-2;
    font-size: 14px;
  }
  
  .phonics-option {
    @apply text-base h-12;
    font-size: 16px;
  }
  
  .score-display {
    @apply text-lg px-3 py-1;
    font-size: 18px;
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

/* アニメーション削減対応 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>