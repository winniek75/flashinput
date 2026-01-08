<template>
  <div
    class="floating-choice"
    :class="{
      'correct-choice': isCorrect && showFeedback,
      'incorrect-choice': !isCorrect && showFeedback && isSelected,
      'shake-animation': showIncorrectShake,
      'glow-animation': showCorrectGlow
    }"
    :style="choiceStyle"
    @click="handleClick"
    @mouseenter="handleHover"
    @mouseleave="handleLeave"
  >
    <!-- 石ころの背景 -->
    <div class="stone-background">
      <svg viewBox="0 0 160 120" class="stone-svg">
        <defs>
          <radialGradient id="stoneGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" :stop-color="stoneHighlightColor" />
            <stop offset="50%" :stop-color="stoneFillColor" />
            <stop offset="100%" :stop-color="stoneShadowColor" />
          </radialGradient>
        </defs>
        <path
          d="M25,60 C18,35 30,20 50,18 C65,12 80,20 95,22 C110,18 125,28 135,45 C140,55 138,70 128,80 C120,95 100,100 85,98 C70,105 55,95 45,88 C35,85 20,75 18,65 C15,55 20,50 25,60 Z"
          fill="url(#stoneGradient)"
          :stroke="stoneStrokeColor"
          stroke-width="2.5"
        />
        <!-- 石の質感を出すための細かい線 -->
        <path
          d="M40,35 C50,38 60,42 70,40"
          stroke="rgba(107, 114, 128, 0.4)"
          stroke-width="1"
          fill="none"
        />
        <path
          d="M50,55 C65,58 75,65 85,62"
          stroke="rgba(107, 114, 128, 0.3)"
          stroke-width="1"
          fill="none"
        />
        <path
          d="M35,70 C45,72 55,75 65,73"
          stroke="rgba(107, 114, 128, 0.3)"
          stroke-width="0.8"
          fill="none"
        />
      </svg>
    </div>

    <!-- グロー効果 -->
    <div class="glow-effect" :style="glowStyle"></div>

    <!-- テキスト -->
    <div class="choice-text">
      {{ phrase }}
    </div>

    <!-- パーティクル効果（正解時） -->
    <div v-if="showParticles" class="particles">
      <div
        v-for="n in 8"
        :key="n"
        class="particle"
        :style="getParticleStyle(n)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { FloatingChoicePosition } from '@/types/phraseGalaxy'

interface Props {
  phrase: string
  isCorrect: boolean
  position: FloatingChoicePosition
  isSelected?: boolean
  showFeedback?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  showFeedback: false,
  disabled: false
})

const emit = defineEmits<{
  click: [phrase: string]
  positionUpdate: [position: FloatingChoicePosition]
}>()

// Animation state
const isHovered = ref(false)
const showIncorrectShake = ref(false)
const showCorrectGlow = ref(false)
const showParticles = ref(false)
const currentPosition = ref<FloatingChoicePosition>({ ...props.position })

// Container dimensions (will be set by parent)
const containerWidth = ref(800)
const containerHeight = ref(600)
const choiceSize = ref(160)

// Animation frame ID
let animationFrameId: number | null = null

// Computed styles
const choiceStyle = computed(() => ({
  position: 'absolute',
  left: `${currentPosition.value.x}px`,
  top: `${currentPosition.value.y}px`,
  width: `${choiceSize.value}px`,
  height: `${choiceSize.value}px`,
  transform: `
    rotate(${currentPosition.value.rotation || 0}deg)
    scale(${isHovered.value ? 1.1 : (currentPosition.value.scale || 1)})
  `,
  zIndex: isHovered.value ? 10 : 1,
  transition: isHovered.value ? 'transform 0.2s ease-out' : 'none'
}))

const stoneFillColor = computed(() => {
  // フィードバック表示時：選択された石のみ色が変わる
  if (props.showFeedback && props.isSelected) {
    return props.isCorrect ? '#10b981' : '#ef4444'
  }
  // ホバー時
  if (isHovered.value) {
    return '#9ca3af'
  }
  // 通常時
  return '#d1d5db'
})

const stoneHighlightColor = computed(() => {
  // フィードバック表示時：選択された石のみ色が変わる
  if (props.showFeedback && props.isSelected) {
    return props.isCorrect ? '#34d399' : '#f87171'
  }
  // ホバー時
  if (isHovered.value) {
    return '#e5e7eb'
  }
  // 通常時
  return '#f3f4f6'
})

const stoneShadowColor = computed(() => {
  // フィードバック表示時：選択された石のみ色が変わる
  if (props.showFeedback && props.isSelected) {
    return props.isCorrect ? '#047857' : '#b91c1c'
  }
  // ホバー時
  if (isHovered.value) {
    return '#6b7280'
  }
  // 通常時
  return '#9ca3af'
})

const stoneStrokeColor = computed(() => {
  // フィードバック表示時：選択された石のみ色が変わる
  if (props.showFeedback && props.isSelected) {
    return props.isCorrect ? '#047857' : '#b91c1c'
  }
  // 通常時
  return '#4b5563'
})

const glowStyle = computed(() => ({
  opacity: isHovered.value || (props.showFeedback && props.isSelected) ? 1 : 0.3,
  boxShadow: `0 0 ${isHovered.value ? '30px' : '20px'} ${
    props.showFeedback && props.isSelected
      ? props.isCorrect ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'
      : 'rgba(156, 163, 175, 0.6)'
  }`
}))

// Methods
function handleClick() {
  if (props.disabled) return

  if (props.isCorrect) {
    showCorrectGlow.value = true
    showParticles.value = true

    setTimeout(() => {
      showCorrectGlow.value = false
      showParticles.value = false
    }, 1500)
  } else {
    showIncorrectShake.value = true
    setTimeout(() => {
      showIncorrectShake.value = false
    }, 500)
  }

  emit('click', props.phrase)
}

function handleHover() {
  if (!props.disabled) {
    isHovered.value = true
  }
}

function handleLeave() {
  isHovered.value = false
}

function updatePosition() {
  // 動的に安全マージンを設定（画面サイズに応じて）
  const margin = Math.max(20, Math.min(40, containerWidth.value * 0.05))

  // コンテナサイズが有効かチェック
  if (containerWidth.value <= 0 || containerHeight.value <= 0) {
    // 次のフレームをスケジュール
    if (!props.disabled) {
      animationFrameId = requestAnimationFrame(updatePosition)
    }
    return
  }

  const maxX = Math.max(margin, containerWidth.value - choiceSize.value - margin)
  const maxY = Math.max(margin, containerHeight.value - choiceSize.value - margin)
  const minX = margin
  const minY = margin

  // 境界が無効な場合の処理
  if (maxX <= minX || maxY <= minY) {
    // 石を中央に配置
    currentPosition.value.x = containerWidth.value / 2 - choiceSize.value / 2
    currentPosition.value.y = containerHeight.value / 2 - choiceSize.value / 2
    currentPosition.value.vx = 0
    currentPosition.value.vy = 0

    emit('positionUpdate', currentPosition.value)

    if (!props.disabled) {
      animationFrameId = requestAnimationFrame(updatePosition)
    }
    return
  }

  // 壁との衝突判定と反射（改良版）
  if (currentPosition.value.x <= minX) {
    currentPosition.value.vx = Math.abs(currentPosition.value.vx) // 必ず右向きに
    currentPosition.value.x = minX
  } else if (currentPosition.value.x >= maxX) {
    currentPosition.value.vx = -Math.abs(currentPosition.value.vx) // 必ず左向きに
    currentPosition.value.x = maxX
  }

  if (currentPosition.value.y <= minY) {
    currentPosition.value.vy = Math.abs(currentPosition.value.vy) // 必ず下向きに
    currentPosition.value.y = minY
  } else if (currentPosition.value.y >= maxY) {
    currentPosition.value.vy = -Math.abs(currentPosition.value.vy) // 必ず上向きに
    currentPosition.value.y = maxY
  }

  // 位置更新
  currentPosition.value.x += currentPosition.value.vx
  currentPosition.value.y += currentPosition.value.vy

  // 位置を確実に範囲内にクランプ（二重チェック）
  currentPosition.value.x = Math.max(minX, Math.min(maxX, currentPosition.value.x))
  currentPosition.value.y = Math.max(minY, Math.min(maxY, currentPosition.value.y))

  // 回転更新（より遅く）
  if (currentPosition.value.rotation !== undefined) {
    currentPosition.value.rotation += 0.3
    if (currentPosition.value.rotation >= 360) {
      currentPosition.value.rotation = 0
    }
  }

  emit('positionUpdate', currentPosition.value)

  // 次のフレームをスケジュール（フィードバック表示中以外は常にアニメーション）
  if (!props.disabled) {
    animationFrameId = requestAnimationFrame(updatePosition)
  }
}

function getParticleStyle(index: number) {
  const angle = (index * 45) * Math.PI / 180
  const distance = 80
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance

  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 100}ms`
  }
}

function setContainerDimensions(width: number, height: number) {
  containerWidth.value = width
  containerHeight.value = height
}

function setChoiceSize(size: number) {
  choiceSize.value = size
}

function restartAnimation() {
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(updatePosition)
  }
}

// Watch for position changes from parent
watch(() => props.position, (newPosition) => {
  currentPosition.value = { ...newPosition }
}, { deep: true })

// Watch for disabled state changes to restart animation
watch(() => [props.disabled, props.showFeedback], ([disabled, showFeedback]) => {
  // フィードバックが終了したら、アニメーションを再開
  if (!showFeedback && !disabled && !animationFrameId) {
    console.log('Restarting animation for choice:', props.phrase)
    animationFrameId = requestAnimationFrame(updatePosition)
  }
}, { deep: true })

// Start animation on mount
onMounted(() => {
  // 少し遅延してアニメーション開始（初期位置設定のため）
  setTimeout(() => {
    updatePosition()
  }, 100)
})

// Clean up animation on unmount
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

// Expose methods to parent
defineExpose({
  setContainerDimensions,
  setChoiceSize,
  restartAnimation
})
</script>

<style scoped>
.floating-choice {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.floating-choice:hover {
  filter: brightness(1.1);
}

.floating-choice.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 石ころの背景 */
.stone-background {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stone-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2));
}

/* グロー効果 */
.glow-effect {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  transition: all 0.3s ease;
  pointer-events: none;
}

/* テキスト */
.choice-text {
  position: relative;
  z-index: 2;
  color: #1f2937;
  font-weight: 800;
  font-size: 1.5rem;
  text-align: center;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
  padding: 1rem;
  line-height: 1.2;
  max-width: 85%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 正解時のグロー */
.correct-choice .glow-effect {
  animation: correct-glow 1.5s ease-in-out;
}

/* 不正解時のシェイク */
.incorrect-choice.shake-animation {
  animation: shake 0.5s ease-in-out;
}

/* グロー アニメーション */
.glow-animation .glow-effect {
  animation: continuous-glow 2s ease-in-out infinite;
}

/* パーティクル */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #fbbf24, #f59e0b);
  border-radius: 50%;
  animation: particle-burst 1.5s ease-out forwards;
}

/* アニメーション定義 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

@keyframes correct-glow {
  0% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.9), 0 0 60px rgba(16, 185, 129, 0.6);
  }
  100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
  }
}

@keyframes continuous-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(156, 163, 175, 0.6);
  }
  50% {
    box-shadow: 0 0 30px rgba(156, 163, 175, 0.8);
  }
}

@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .choice-text {
    font-size: 1.4rem;
    padding: 1.2rem;
    max-width: 95%;
  }
}

@media (max-width: 480px) {
  .choice-text {
    font-size: 1.3rem;
    padding: 1rem;
    border-width: 4px;
    max-width: 95%;
  }
}
</style>

<style>
/* SVGグラデーション定義（グローバル） */
svg {
  position: absolute;
  width: 0;
  height: 0;
}

.star-gradient-defs {
  position: absolute;
  width: 0;
  height: 0;
}
</style>