<template>
  <div class="game-timer" :class="[size, theme, { 'timer-warning': isWarning, 'timer-critical': isCritical }]">
    <!-- タイマー表示部 -->
    <div class="timer-display">
      <!-- 円形プログレスバー -->
      <div v-if="showProgress" class="timer-progress">
        <svg class="progress-ring" :width="progressSize" :height="progressSize">
          <!-- 背景円 -->
          <circle
            class="progress-ring-background"
            :cx="progressSize / 2"
            :cy="progressSize / 2"
            :r="radius"
            stroke-width="6"
          />
          <!-- プログレス円 -->
          <circle
            class="progress-ring-progress"
            :cx="progressSize / 2"
            :cy="progressSize / 2"
            :r="radius"
            stroke-width="6"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            :style="{ stroke: progressColor }"
          />
        </svg>
        
        <!-- 中央のタイマーテキスト -->
        <div class="timer-text-center">
          <div class="time-display">{{ formattedTime }}</div>
          <div v-if="showLabel" class="time-label">{{ label }}</div>
        </div>
      </div>
      
      <!-- シンプルテキスト表示 -->
      <div v-else class="timer-simple">
        <div class="time-display">{{ formattedTime }}</div>
        <div v-if="showLabel" class="time-label">{{ label }}</div>
      </div>
      
      <!-- アイコン表示 -->
      <div v-if="showIcon" class="timer-icon">
        <div class="icon" :class="iconClass">{{ currentIcon }}</div>
      </div>
    </div>
    
    <!-- コントロールボタン -->
    <div v-if="showControls" class="timer-controls">
      <button 
        v-if="!isRunning && !isCompleted"
        @click="start"
        class="control-button start-button"
        :disabled="disabled"
      >
        ▶️ Start
      </button>
      
      <button 
        v-if="isRunning"
        @click="pause"
        class="control-button pause-button"
      >
        ⏸️ Pause
      </button>
      
      <button 
        v-if="isPaused"
        @click="resume"
        class="control-button resume-button"
      >
        ▶️ Resume
      </button>
      
      <button 
        v-if="showReset && (isRunning || isPaused || isCompleted)"
        @click="reset"
        class="control-button reset-button"
      >
        🔄 Reset
      </button>
    </div>
    
    <!-- 危険ゾーンエフェクト -->
    <div v-if="showWarningEffect && (isWarning || isCritical)" class="warning-effect">
      <div class="warning-pulse"></div>
    </div>
    
    <!-- 完了エフェクト -->
    <div v-if="showCompletionEffect && isCompleted" class="completion-effect">
      <div v-for="i in 8" :key="i" class="completion-spark" :style="getSparkStyle(i)">✨</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'GameTimer',
  props: {
    // 初期時間（秒）
    initialTime: {
      type: Number,
      default: 60,
      validator: value => value >= 0
    },
    // カウントダウン/カウントアップ
    countDown: {
      type: Boolean,
      default: true
    },
    // 自動開始
    autoStart: {
      type: Boolean,
      default: false
    },
    // サイズ
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // テーマ
    theme: {
      type: String,
      default: 'galaxy',
      validator: value => ['galaxy', 'classic', 'neon', 'minimal'].includes(value)
    },
    // プログレスバー表示
    showProgress: {
      type: Boolean,
      default: true
    },
    // ラベル表示
    showLabel: {
      type: Boolean,
      default: true
    },
    // ラベルテキスト
    label: {
      type: String,
      default: 'Time Remaining'
    },
    // アイコン表示
    showIcon: {
      type: Boolean,
      default: true
    },
    // コントロール表示
    showControls: {
      type: Boolean,
      default: false
    },
    // リセットボタン表示
    showReset: {
      type: Boolean,
      default: true
    },
    // 警告エフェクト表示
    showWarningEffect: {
      type: Boolean,
      default: true
    },
    // 完了エフェクト表示
    showCompletionEffect: {
      type: Boolean,
      default: true
    },
    // 警告時間（秒）
    warningTime: {
      type: Number,
      default: 10
    },
    // 危険時間（秒）
    criticalTime: {
      type: Number,
      default: 5
    },
    // 無効化
    disabled: {
      type: Boolean,
      default: false
    },
    // 精度（小数点表示）
    precision: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 3
    }
  },
  emits: [
    'start', 'pause', 'resume', 'reset', 'complete', 
    'tick', 'warning', 'critical', 'time-update'
  ],
  setup(props, { emit }) {
    // 状態管理
    const currentTime = ref(props.initialTime)
    const isRunning = ref(false)
    const isPaused = ref(false)
    const isCompleted = ref(false)
    const timerId = ref(null)
    const startTime = ref(null)
    const pauseTime = ref(null)
    
    // 警告状態
    const hasWarned = ref(false)
    const hasCritical = ref(false)
    
    // プログレスバー設定
    const progressSize = computed(() => {
      switch (props.size) {
        case 'small': return 80
        case 'medium': return 120
        case 'large': return 160
        default: return 120
      }
    })
    
    const radius = computed(() => (progressSize.value - 12) / 2)
    const circumference = computed(() => 2 * Math.PI * radius.value)
    
    // 計算プロパティ
    const progress = computed(() => {
      if (props.countDown) {
        return (props.initialTime - currentTime.value) / props.initialTime
      } else {
        return Math.min(currentTime.value / props.initialTime, 1)
      }
    })
    
    const progressOffset = computed(() => {
      return circumference.value * (1 - progress.value)
    })
    
    const progressColor = computed(() => {
      if (isCritical.value) return '#EF4444' // red
      if (isWarning.value) return '#F59E0B' // amber
      return '#10B981' // green
    })
    
    const isWarning = computed(() => {
      return props.countDown ? 
        currentTime.value <= props.warningTime && currentTime.value > props.criticalTime :
        currentTime.value >= (props.initialTime - props.warningTime)
    })
    
    const isCritical = computed(() => {
      return props.countDown ?
        currentTime.value <= props.criticalTime && currentTime.value > 0 :
        currentTime.value >= (props.initialTime - props.criticalTime)
    })
    
    const formattedTime = computed(() => {
      const time = Math.max(0, currentTime.value)
      
      if (props.precision > 0) {
        return time.toFixed(props.precision)
      }
      
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      } else {
        return seconds.toString()
      }
    })
    
    const currentIcon = computed(() => {
      if (isCompleted.value) return '✅'
      if (isCritical.value) return '🚨'
      if (isWarning.value) return '⚠️'
      if (isRunning.value) return '⏱️'
      if (isPaused.value) return '⏸️'
      return '⏰'
    })
    
    const iconClass = computed(() => {
      return {
        'icon-running': isRunning.value,
        'icon-warning': isWarning.value,
        'icon-critical': isCritical.value,
        'icon-completed': isCompleted.value,
        'icon-paused': isPaused.value
      }
    })
    
    // タイマー制御
    const start = () => {
      if (isRunning.value || isCompleted.value || props.disabled) return
      
      isRunning.value = true
      isPaused.value = false
      startTime.value = Date.now()
      
      startTimer()
      emit('start')
    }
    
    const pause = () => {
      if (!isRunning.value) return
      
      isRunning.value = false
      isPaused.value = true
      pauseTime.value = Date.now()
      
      clearTimer()
      emit('pause')
    }
    
    const resume = () => {
      if (!isPaused.value) return
      
      isRunning.value = true
      isPaused.value = false
      
      // 一時停止時間を調整
      const pauseDuration = Date.now() - pauseTime.value
      startTime.value += pauseDuration
      
      startTimer()
      emit('resume')
    }
    
    const reset = () => {
      isRunning.value = false
      isPaused.value = false
      isCompleted.value = false
      currentTime.value = props.initialTime
      hasWarned.value = false
      hasCritical.value = false
      
      clearTimer()
      emit('reset')
    }
    
    const complete = () => {
      isRunning.value = false
      isCompleted.value = true
      
      clearTimer()
      emit('complete')
    }
    
    // タイマー実行
    const startTimer = () => {
      clearTimer()
      
      timerId.value = setInterval(() => {
        const elapsed = (Date.now() - startTime.value) / 1000
        
        if (props.countDown) {
          currentTime.value = Math.max(0, props.initialTime - elapsed)
          
          if (currentTime.value <= 0) {
            currentTime.value = 0
            complete()
            return
          }
        } else {
          currentTime.value = elapsed
          
          if (currentTime.value >= props.initialTime) {
            currentTime.value = props.initialTime
            complete()
            return
          }
        }
        
        // 警告チェック
        checkWarnings()
        
        emit('tick', currentTime.value)
        emit('time-update', currentTime.value)
      }, props.precision > 0 ? 100 : 1000) // 精度に応じて更新頻度を調整
    }
    
    const clearTimer = () => {
      if (timerId.value) {
        clearInterval(timerId.value)
        timerId.value = null
      }
    }
    
    // 警告チェック
    const checkWarnings = () => {
      if (isWarning.value && !hasWarned.value) {
        hasWarned.value = true
        emit('warning', currentTime.value)
      }
      
      if (isCritical.value && !hasCritical.value) {
        hasCritical.value = true
        emit('critical', currentTime.value)
      }
    }
    
    // 完了エフェクト用スパークスタイル
    const getSparkStyle = (index) => {
      const angle = (index - 1) * 45 // 8分割
      const radius = 40
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.1}s`
      }
    }
    
    // 初期時間変更の監視
    watch(() => props.initialTime, (newTime) => {
      if (!isRunning.value) {
        currentTime.value = newTime
      }
    })
    
    // 自動開始
    onMounted(() => {
      if (props.autoStart) {
        start()
      }
    })
    
    // クリーンアップ
    onUnmounted(() => {
      clearTimer()
    })
    
    return {
      // State
      currentTime,
      isRunning,
      isPaused,
      isCompleted,
      hasWarned,
      hasCritical,
      
      // Computed
      progress,
      progressSize,
      radius,
      circumference,
      progressOffset,
      progressColor,
      isWarning,
      isCritical,
      formattedTime,
      currentIcon,
      iconClass,
      
      // Methods
      start,
      pause,
      resume,
      reset,
      complete,
      getSparkStyle
    }
  }
}
</script>

<style scoped>
.game-timer {
  @apply relative flex flex-col items-center justify-center;
}

/* サイズバリエーション */
.game-timer.small {
  @apply text-sm;
}

.game-timer.medium {
  @apply text-base;
}

.game-timer.large {
  @apply text-lg;
}

/* テーマバリエーション */
.game-timer.galaxy {
  background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%);
  @apply rounded-xl border border-blue-500 border-opacity-30 p-4;
}

.game-timer.classic {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border;
}

.game-timer.neon {
  background: linear-gradient(135deg, rgba(0,255,255,0.1) 0%, rgba(255,0,255,0.1) 100%);
  @apply rounded-xl border border-cyan-400 border-opacity-50 p-4;
  box-shadow: 0 0 20px rgba(0,255,255,0.3);
}

.game-timer.minimal {
  @apply p-2;
}

/* タイマー表示 */
.timer-display {
  @apply relative flex flex-col items-center justify-center;
}

.timer-progress {
  @apply relative;
}

.progress-ring {
  @apply transform -rotate-90;
}

.progress-ring-background {
  @apply fill-none stroke-current opacity-20;
}

.progress-ring-progress {
  @apply fill-none transition-all duration-1000 ease-linear;
  stroke-linecap: round;
}

.timer-text-center {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.time-display {
  @apply font-bold text-2xl md:text-3xl lg:text-4xl;
  color: var(--timer-text-color, #1F2937);
}

.time-label {
  @apply text-xs md:text-sm opacity-70 mt-1;
}

.timer-simple {
  @apply text-center;
}

/* アイコン */
.timer-icon {
  @apply mt-2;
}

.icon {
  @apply text-2xl transition-all duration-300;
}

.icon-running {
  animation: iconPulse 1s ease-in-out infinite;
}

.icon-warning {
  animation: iconBlink 0.5s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 8px #F59E0B);
}

.icon-critical {
  animation: iconShake 0.1s ease-in-out infinite;
  filter: drop-shadow(0 0 12px #EF4444);
}

.icon-completed {
  animation: iconBounce 0.6s ease-in-out;
  filter: drop-shadow(0 0 8px #10B981);
}

.icon-paused {
  @apply opacity-60;
}

/* コントロール */
.timer-controls {
  @apply flex gap-2 mt-4;
}

.control-button {
  @apply px-3 py-1 rounded-lg font-semibold text-sm transition-all duration-200;
}

.start-button, .resume-button {
  @apply bg-green-500 text-white hover:bg-green-600;
}

.pause-button {
  @apply bg-yellow-500 text-white hover:bg-yellow-600;
}

.reset-button {
  @apply bg-gray-500 text-white hover:bg-gray-600;
}

.control-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* 警告エフェクト */
.timer-warning {
  @apply border-yellow-400;
}

.timer-critical {
  @apply border-red-400;
  animation: timerCriticalPulse 0.5s ease-in-out infinite alternate;
}

.warning-effect {
  @apply absolute inset-0 pointer-events-none;
}

.warning-pulse {
  @apply absolute inset-0 rounded-xl border-2 border-red-400 opacity-70;
  animation: warningPulse 1s ease-in-out infinite;
}

/* 完了エフェクト */
.completion-effect {
  @apply absolute inset-0 pointer-events-none;
}

.completion-spark {
  @apply absolute text-lg opacity-0;
  transform: translate(-50%, -50%);
  animation: sparkAnimation 1.5s ease-out forwards;
}

/* アニメーション */
@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes iconBlink {
  0% { opacity: 1; }
  100% { opacity: 0.5; }
}

@keyframes iconShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes timerCriticalPulse {
  0% { 
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    transform: scale(1);
  }
  100% { 
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    transform: scale(1.02);
  }
}

@keyframes warningPulse {
  0% { 
    transform: scale(1); 
    opacity: 0.7; 
  }
  100% { 
    transform: scale(1.05); 
    opacity: 0.3; 
  }
}

@keyframes sparkAnimation {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) rotate(360deg);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .game-timer.large .time-display {
    @apply text-2xl;
  }
  
  .control-button {
    @apply px-2 py-1 text-xs;
  }
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  .game-timer.classic {
    --timer-text-color: #F9FAFB;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .progress-ring-progress,
  .icon,
  .control-button,
  .completion-spark {
    animation: none !important;
    transition: none !important;
  }
  
  .timer-critical {
    animation: none !important;
  }
}
</style>