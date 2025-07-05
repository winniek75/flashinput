<template>
  <div class="star-rating" :class="[size, { interactive: interactive }]">
    <div 
      v-for="star in maxStars" 
      :key="star"
      class="star"
      :class="getStarClass(star)"
      @click="interactive && selectStar(star)"
      @mouseenter="interactive && hoverStar(star)"
      @mouseleave="interactive && resetHover()"
    >
      <div class="star-background">⭐</div>
      <div class="star-fill" :style="getStarFillStyle(star)">⭐</div>
      <div class="star-glow" v-if="shouldShowGlow(star)"></div>
    </div>
    
    <!-- 星の数値表示 -->
    <div v-if="showCount" class="star-count">
      {{ currentStars }}/{{ maxStars }}
    </div>
    
    <!-- アニメーション効果 -->
    <div 
      v-if="showSparkle" 
      class="sparkle-effect"
      :class="{ active: sparkleActive }"
    >
      <div v-for="i in 5" :key="i" class="sparkle" :style="getSparkleStyle(i)">✨</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'StarRating',
  props: {
    // 現在の星数
    stars: {
      type: Number,
      default: 0,
      validator: value => value >= 0
    },
    // 最大星数
    maxStars: {
      type: Number,
      default: 3,
      validator: value => value > 0
    },
    // インタラクティブかどうか（クリック・ホバー有効）
    interactive: {
      type: Boolean,
      default: false
    },
    // 小数点の星表示（0.5星など）
    allowHalf: {
      type: Boolean,
      default: false
    },
    // サイズ
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'xlarge'].includes(value)
    },
    // 星の数値を表示するか
    showCount: {
      type: Boolean,
      default: false
    },
    // スパークル効果を表示するか
    showSparkle: {
      type: Boolean,
      default: true
    },
    // カスタムカラー
    color: {
      type: String,
      default: '#FBBF24' // golden
    },
    // アニメーション設定
    animationDelay: {
      type: Number,
      default: 100 // milliseconds
    }
  },
  emits: ['update:stars', 'star-selected', 'star-hover'],
  setup(props, { emit }) {
    // リアクティブな状態
    const currentStars = ref(props.stars)
    const hoverStars = ref(0)
    const sparkleActive = ref(false)
    const animating = ref(false)
    
    // 星が実際に表示される数（ホバー中は一時的に変更）
    const displayStars = computed(() => {
      if (props.interactive && hoverStars.value > 0) {
        return hoverStars.value
      }
      return currentStars.value
    })
    
    // propsの星数変更を監視
    watch(() => props.stars, (newStars) => {
      if (newStars !== currentStars.value) {
        animateStarsChange(newStars)
      }
    }, { immediate: true })
    
    // 星のクラスを取得
    const getStarClass = (starIndex) => {
      const isFilled = starIndex <= displayStars.value
      const isHalfFilled = props.allowHalf && 
        starIndex === Math.ceil(displayStars.value) && 
        displayStars.value % 1 !== 0
      
      return {
        'star-filled': isFilled && !isHalfFilled,
        'star-half': isHalfFilled,
        'star-empty': !isFilled && !isHalfFilled,
        'star-hovering': props.interactive && hoverStars.value >= starIndex,
        'star-animating': animating.value
      }
    }
    
    // 星の塗りつぶしスタイルを取得
    const getStarFillStyle = (starIndex) => {
      const fillPercentage = Math.max(0, Math.min(1, displayStars.value - starIndex + 1)) * 100
      
      return {
        background: `linear-gradient(90deg, ${props.color} ${fillPercentage}%, transparent ${fillPercentage}%)`,
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': fillPercentage > 0 ? 'transparent' : '#E5E7EB',
        'filter': fillPercentage > 0 ? `drop-shadow(0 0 8px ${props.color}40)` : 'none'
      }
    }
    
    // グローエフェクトを表示するか
    const shouldShowGlow = (starIndex) => {
      return starIndex <= displayStars.value && props.showSparkle
    }
    
    // スパークルエフェクトのスタイルを取得
    const getSparkleStyle = (index) => {
      const angle = (index - 1) * 72 // 360度を5分割
      const radius = 30
      const x = Math.cos(angle * Math.PI / 180) * radius
      const y = Math.sin(angle * Math.PI / 180) * radius
      
      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.1}s`
      }
    }
    
    // 星をクリック
    const selectStar = (starIndex) => {
      if (!props.interactive || animating.value) return
      
      const newStars = props.allowHalf && starIndex === currentStars.value ? 
        starIndex - 0.5 : starIndex
      
      currentStars.value = newStars
      emit('update:stars', newStars)
      emit('star-selected', newStars)
      
      // スパークル効果をトリガー
      triggerSparkle()
    }
    
    // 星にホバー
    const hoverStar = (starIndex) => {
      if (!props.interactive || animating.value) return
      
      hoverStars.value = starIndex
      emit('star-hover', starIndex)
    }
    
    // ホバーリセット
    const resetHover = () => {
      if (!props.interactive) return
      hoverStars.value = 0
    }
    
    // 星の変更をアニメーション
    const animateStarsChange = async (newStars) => {
      if (animating.value) return
      
      animating.value = true
      
      // 星を1つずつアニメーション
      const oldStars = currentStars.value
      const steps = Math.abs(newStars - oldStars)
      const direction = newStars > oldStars ? 1 : -1
      
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => {
          setTimeout(() => {
            currentStars.value += direction
            resolve()
          }, props.animationDelay)
        })
      }
      
      // 新しい星数が半分の場合は直接設定
      if (newStars % 1 !== 0) {
        currentStars.value = newStars
      }
      
      animating.value = false
      
      // 星が増えた場合はスパークル効果
      if (newStars > oldStars) {
        triggerSparkle()
      }
    }
    
    // スパークル効果をトリガー
    const triggerSparkle = () => {
      if (!props.showSparkle) return
      
      sparkleActive.value = true
      setTimeout(() => {
        sparkleActive.value = false
      }, 1000)
    }
    
    return {
      currentStars,
      hoverStars,
      sparkleActive,
      animating,
      displayStars,
      getStarClass,
      getStarFillStyle,
      shouldShowGlow,
      getSparkleStyle,
      selectStar,
      hoverStar,
      resetHover,
      triggerSparkle
    }
  }
}
</script>

<style scoped>
.star-rating {
  @apply relative flex items-center justify-center gap-1;
}

.star-rating.interactive {
  @apply cursor-pointer;
}

/* サイズバリエーション */
.star-rating.small .star {
  @apply text-lg;
}

.star-rating.medium .star {
  @apply text-2xl;
}

.star-rating.large .star {
  @apply text-4xl;
}

.star-rating.xlarge .star {
  @apply text-6xl;
}

/* 星の基本スタイル */
.star {
  @apply relative transition-all duration-200 ease-in-out;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.star-background,
.star-fill {
  @apply absolute inset-0 pointer-events-none;
}

.star-background {
  @apply text-gray-300;
}

.star-fill {
  @apply transition-all duration-300 ease-in-out;
}

/* 星の状態 */
.star-filled .star-fill {
  transform: scale(1.1);
}

.star-half .star-fill {
  transform: scale(1.05);
}

.star-empty .star-fill {
  transform: scale(0.95);
  opacity: 0.3;
}

/* インタラクティブ状態 */
.star-rating.interactive .star:hover {
  transform: scale(1.2);
}

.star-hovering {
  transform: scale(1.15) !important;
}

/* アニメーション状態 */
.star-animating {
  animation: starPulse 0.3s ease-in-out;
}

@keyframes starPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* グローエフェクト */
.star-glow {
  @apply absolute inset-0 rounded-full opacity-60 pointer-events-none;
  background: radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  animation: starGlow 2s ease-in-out infinite alternate;
}

@keyframes starGlow {
  0% { 
    transform: scale(0.8); 
    opacity: 0.3; 
  }
  100% { 
    transform: scale(1.2); 
    opacity: 0.6; 
  }
}

/* 星数表示 */
.star-count {
  @apply ml-3 text-sm font-semibold text-gray-600 dark:text-gray-300;
}

/* スパークルエフェクト */
.sparkle-effect {
  @apply absolute inset-0 pointer-events-none;
}

.sparkle {
  @apply absolute text-xs opacity-0 pointer-events-none;
  transform: translate(-50%, -50%);
}

.sparkle-effect.active .sparkle {
  animation: sparkleAnimation 1s ease-out forwards;
}

@keyframes sparkleAnimation {
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

/* レスポンシブ調整 */
@media (max-width: 768px) {
  .star-rating.large .star {
    @apply text-3xl;
  }
  
  .star-rating.xlarge .star {
    @apply text-5xl;
  }
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  .star-background {
    @apply text-gray-600;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .star,
  .star-fill,
  .sparkle {
    animation: none !important;
    transition: none !important;
  }
  
  .star-rating.interactive .star:hover {
    transform: none;
  }
}

/* 高コントラスト対応 */
@media (prefers-contrast: high) {
  .star-background {
    @apply text-gray-800;
  }
  
  .star-filled .star-fill {
    filter: drop-shadow(0 0 4px #000);
  }
}</style>