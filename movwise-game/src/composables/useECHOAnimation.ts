import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref, type ComputedRef, type UnwrapRef } from 'vue'
import type { 
  ECHOCharacter, 
  ECHOEmotion, 
  AnimationState, 
  AnimationTrigger,
  PerformanceStats,
  ArmPosition,
  ECHOError
} from '@/types/ai-practice'

// 厳密な型定義でractive stateの型推論を完全対応
export function useECHOAnimation(character: Ref<ECHOCharacter | undefined>) {
  // 早期ガード: characterが存在しない場合の処理
  if (!character) {
    console.warn('useECHOAnimation: character ref is required')
    // 最小限の戻り値を返す
    return {
      isAnimating: ref(false),
      currentAnimation: ref(null),
      performanceStats: ref({
        renderTime: 0,
        animationFrameRate: 60,
        memoryUsage: 0,
        speechLatency: 0,
        recognitionAccuracy: 0,
        frameDropCount: 0,
        lastMeasurement: new Date()
      }),
      isActive: ref(false),
      currentError: ref(null),
      isBlinking: computed(() => false),
      isSpeaking: computed(() => false),
      isListening: computed(() => false),
      currentEmotion: computed(() => 'normal' as const),
      hasError: computed(() => false),
      animationState: computed(() => null),
      startBlinking: () => {},
      animateArms: () => {},
      updateEmotion: () => {},
      cleanup: () => {},
      queueAnimation: () => {},
      startSpeaking: () => {},
      stopSpeaking: () => {},
      startListening: () => {},
      stopListening: () => {},
      triggerBlink: () => {},
      handleAnimationError: () => {}
    }
  }

  // アニメーション状態管理（厳密な型指定）
  const isAnimating = ref<boolean>(false)
  const isActive = ref<boolean>(true)
  const currentAnimation = ref<AnimationTrigger | null>(null)
  const animationQueue = ref<readonly AnimationTrigger[]>([])
  
  // パフォーマンス統計（readonly型で型安全性を強化）
  const performanceStats = ref<PerformanceStats>({
    renderTime: 0,
    animationFrameRate: 60,
    memoryUsage: 0,
    speechLatency: 0,
    recognitionAccuracy: 0,
    frameDropCount: 0,
    lastMeasurement: new Date()
  })

  // タイマー管理（厳密な型指定でメモリリーク防止）
  const timers = {
    blinkTimer: null as NodeJS.Timeout | null,
    animationFrame: null as number | null,
    breathingFrame: null as number | null,
    gestureTimeout: null as NodeJS.Timeout | null,
    transitionFrame: null as number | null,
    emotionTimeout: null as NodeJS.Timeout | null,
    armAnimationTimeouts: [] as readonly NodeJS.Timeout[]
  }

  // パフォーマンス監視（厳密な型指定）
  const frameCount = ref<number>(0)
  const lastFrameTime = ref<number>(0)
  const averageFrameTime = ref<number>(16.67) // 60fps baseline
  const currentError = ref<ECHOError | null>(null)

  // Computed properties（型推論完全対応・null安全）
  const isBlinking: ComputedRef<boolean> = computed(() => character.value?.animationState?.isBlinking ?? false)
  const isSpeaking: ComputedRef<boolean> = computed(() => character.value?.animationState?.isSpeaking ?? false)
  const isListening: ComputedRef<boolean> = computed(() => character.value?.animationState?.isListening ?? false)
  const currentEmotion: ComputedRef<ECHOEmotion> = computed(() => character.value?.emotion ?? 'normal')
  const hasError: ComputedRef<boolean> = computed(() => currentError.value !== null)
  
  // 型安全なアニメーション状態アクセサー
  const animationState: ComputedRef<AnimationState | null> = computed(() => character.value?.animationState ?? null)

  // エラーハンドリング関数（型安全）
  const handleAnimationError = (error: Partial<ECHOError>): void => {
    const fullError: ECHOError = {
      code: error.code || 'ANIMATION_FAILED',
      message: error.message || 'Animation error occurred',
      timestamp: error.timestamp || new Date(),
      recoverable: error.recoverable ?? true,
      severity: error.severity || 'medium',
      source: error.source || 'animation',
      ...error
    }
    
    currentError.value = fullError
    console.error('ECHOAnimation Error:', fullError)
    
    // 自動回復処理
    if (fullError.recoverable) {
      setTimeout(() => {
        currentError.value = null
      }, 3000)
    }
  }

  // デフォルトアニメーション状態の作成（厳密な型）
  const createDefaultAnimationState = (): AnimationState => ({
    isBlinking: false,
    isSpeaking: false,
    isListening: false,
    headTilt: 0,
    armPosition: 'neutral' as const,
    eyeIntensity: 0.8,
    chestLightPulse: 0.5,
    bodyScale: 1.0,
    blinkSpeed: 3000
  })

  // 初期化（エラーハンドリング・null安全付き）
  const initializeAnimation = (): void => {
    try {
      // character.valueが存在しない場合は早期リターン
      if (!character.value) {
        console.warn('ECHOAnimation: Character not provided, skipping initialization')
        return
      }

      if (!character.value.animationState) {
        character.value.animationState = createDefaultAnimationState()
      }
      
      startBlinking()
      startBreathingEffect()
      startPerformanceMonitoring()
    } catch (error) {
      handleAnimationError({
        code: 'ANIMATION_FAILED',
        message: `Failed to initialize animation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        severity: 'high'
      })
    }
  }

  // 最適化されたまばたきシステム（型安全・エラーハンドリング付き）
  const startBlinking = (): void => {
    if (!isActive.value || !character.value) return
    
    try {
      const scheduleNextBlink = (): void => {
        if (!isActive.value || !character.value) return
        
        const blinkInterval: number = character.value.animationState.blinkSpeed + Math.random() * 2000
        
        timers.blinkTimer = setTimeout(() => {
          if (!isActive.value || !character.value || character.value.animationState.isSpeaking) {
            scheduleNextBlink()
            return
          }
          
          // まばたき実行
          character.value.animationState.isBlinking = true
          
          // まばたき終了
          const blinkEndTimeout: NodeJS.Timeout = setTimeout(() => {
            if (isActive.value && character.value) {
              character.value.animationState.isBlinking = false
            }
          }, 150)
          
          // 型安全な配列操作
          timers.armAnimationTimeouts = [...timers.armAnimationTimeouts, blinkEndTimeout]
          scheduleNextBlink()
          
        }, blinkInterval)
      }
      
      scheduleNextBlink()
    } catch (error) {
      handleAnimationError({
        code: 'ANIMATION_FAILED',
        message: `Failed to start blinking: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error },
        severity: 'medium'
      })
    }
  }

  // スムーズな腕の動きアニメーション
  const animateArms = (position: ArmPosition, intensity: number = 1) => {
    if (!isActive.value) return
    
    // 既存のアームアニメーションタイマーをクリア
    timers.armAnimationTimeouts.forEach(timer => clearTimeout(timer))
    timers.armAnimationTimeouts = []
    
    const addAnimationTimeout = (callback: () => void, delay: number) => {
      const timeout = setTimeout(() => {
        if (isActive.value) {
          callback()
        }
      }, delay * intensity) // intensityで速度調整
      timers.armAnimationTimeouts.push(timeout)
    }
    
    // アームポジション更新
    character.value.animationState.armPosition = position
    
    // 各ポジションに応じたアニメーション
    switch (position) {
      case 'wave':
        // 波のような動き
        addAnimationTimeout(() => {
          // 第1段階：腕を上げる
        }, 0)
        addAnimationTimeout(() => {
          // 第2段階：振る動作1
        }, 300)
        addAnimationTimeout(() => {
          // 第3段階：振る動作2
        }, 600)
        addAnimationTimeout(() => {
          // 完了：元に戻す
          if (character.value.animationState.armPosition === 'wave') {
            character.value.animationState.armPosition = 'neutral'
          }
        }, 900)
        break
        
      case 'clap':
        // 拍手アニメーション
        for (let i = 0; i < 3; i++) {
          addAnimationTimeout(() => {
            // 拍手動作
          }, i * 200)
        }
        addAnimationTimeout(() => {
          if (character.value.animationState.armPosition === 'clap') {
            character.value.animationState.armPosition = 'neutral'
          }
        }, 800)
        break
        
      case 'thumbsUp':
        // サムズアップ（一定時間保持）
        addAnimationTimeout(() => {
          if (character.value.animationState.armPosition === 'thumbsUp') {
            character.value.animationState.armPosition = 'neutral'
          }
        }, 2000)
        break
        
      case 'thinking':
        // 考えるポーズ（アゴに手）
        // 自動リセットなし（明示的に変更されるまで保持）
        break
        
      case 'gesture':
        // ジェスチャー（説明時の手振り）
        addAnimationTimeout(() => {
          if (character.value.animationState.armPosition === 'gesture') {
            character.value.animationState.armPosition = 'neutral'
          }
        }, 1500)
        break
        
      default:
        // neutral または不明なポジション
        character.value.animationState.armPosition = 'neutral'
    }
  }

  // 感情変化アニメーションシステム
  const updateEmotion = (emotion: ECHOEmotion, intensity: number = 1, duration: number = 1000) => {
    if (!isActive.value) return
    
    // 既存の感情アニメーションをキャンセル
    if (timers.emotionTimeout) {
      clearTimeout(timers.emotionTimeout)
    }
    
    // 感情を即座に更新
    character.value.emotion = emotion
    
    // 感情に応じたアニメーション状態の設定
    const emotionAnimations: Record<ECHOEmotion, Partial<AnimationState> & { armPosition?: ArmPosition }> = {
      normal: {
        headTilt: 0,
        eyeIntensity: 0.8,
        chestLightPulse: 0.5,
        armPosition: 'neutral'
      },
      happy: {
        headTilt: 2 * intensity,
        eyeIntensity: 1.0,
        chestLightPulse: 0.8,
        armPosition: 'clap'
      },
      encouraging: {
        headTilt: 1 * intensity,
        eyeIntensity: 0.9,
        chestLightPulse: 0.7,
        armPosition: 'thumbsUp'
      },
      surprised: {
        headTilt: -2 * intensity,
        eyeIntensity: 1.0,
        chestLightPulse: 0.9,
        armPosition: 'gesture'
      },
      thinking: {
        headTilt: 3 * intensity,
        eyeIntensity: 0.6,
        chestLightPulse: 0.3,
        armPosition: 'thinking'
      },
      speaking: {
        headTilt: 0,
        eyeIntensity: 0.8,
        chestLightPulse: 0.6,
        isSpeaking: true,
        isListening: false
      },
      listening: {
        headTilt: -1 * intensity,
        eyeIntensity: 0.9,
        chestLightPulse: 0.4,
        isSpeaking: false,
        isListening: true
      },
      confused: {
        headTilt: 4 * intensity,
        eyeIntensity: 0.7,
        chestLightPulse: 0.3,
        armPosition: 'thinking'
      },
      excited: {
        headTilt: -1 * intensity,
        eyeIntensity: 1.0,
        chestLightPulse: 1.0,
        armPosition: 'wave'
      }
    }
    
    const targetState = emotionAnimations[emotion]
    if (targetState) {
      // アニメーション状態を滑らかに遷移
      smoothTransition(targetState, duration * intensity)
      
      // アームポジションが指定されている場合、アニメーション実行
      if (targetState.armPosition && targetState.armPosition !== character.value.animationState.armPosition) {
        animateArms(targetState.armPosition, intensity)
      }
    }
    
    // 一定時間後に通常状態に戻す（speaking, listening, thinking以外）
    if (!['speaking', 'listening', 'thinking', 'normal'].includes(emotion)) {
      timers.emotionTimeout = setTimeout(() => {
        if (isActive.value && character.value.emotion === emotion) {
          updateEmotion('normal', 0.5, 500)
        }
      }, duration + 1000)
    }
  }

  // RequestAnimationFrame-based 呼吸エフェクト
  const startBreathingEffect = () => {
    let breathDirection = 1
    let lastBreathTime = 0
    
    const breathe = (currentTime: number) => {
      if (!isActive.value) return
      
      // 20fps（50ms間隔）で呼吸エフェクト
      if (currentTime - lastBreathTime > 50) {
        if (!character.value.animationState.isSpeaking) {
          const breathAmount = 0.002 * breathDirection
          character.value.animationState.bodyScale += breathAmount
          
          if (character.value.animationState.bodyScale >= 1.01) {
            breathDirection = -1
          } else if (character.value.animationState.bodyScale <= 0.99) {
            breathDirection = 1
          }
        }
        lastBreathTime = currentTime
      }
      
      if (isActive.value) {
        timers.breathingFrame = requestAnimationFrame(breathe)
      }
    }
    
    timers.breathingFrame = requestAnimationFrame(breathe)
  }

  // パフォーマンス監視システム
  const startPerformanceMonitoring = () => {
    let frameTimeSum = 0
    let frameTimeCount = 0
    
    const updateStats = (currentTime: number) => {
      if (!isActive.value) return
      
      if (lastFrameTime.value) {
        const deltaTime = currentTime - lastFrameTime.value
        frameCount.value++
        frameTimeSum += deltaTime
        frameTimeCount++
        
        // 60フレームごとに統計更新
        if (frameCount.value % 60 === 0) {
          const avgFrameTime = frameTimeSum / frameTimeCount
          performanceStats.value.animationFrameRate = 1000 / avgFrameTime
          performanceStats.value.renderTime = avgFrameTime
          
          // メモリ使用量監視（可能な場合）
          if ('memory' in performance) {
            performanceStats.value.memoryUsage = (performance as any).memory.usedJSHeapSize
          }
          
          // パフォーマンス劣化検出
          if (performanceStats.value.animationFrameRate < 30) {
            console.warn('ECHOAnimation: パフォーマンス劣化を検出', {
              fps: performanceStats.value.animationFrameRate.toFixed(1),
              renderTime: performanceStats.value.renderTime.toFixed(2)
            })
          }
          
          // 統計リセット
          frameTimeSum = 0
          frameTimeCount = 0
        }
      }
      
      lastFrameTime.value = currentTime
      
      if (isActive.value) {
        timers.animationFrame = requestAnimationFrame(updateStats)
      }
    }
    
    timers.animationFrame = requestAnimationFrame(updateStats)
  }

  // スムーズトランジション（最適化版）
  const smoothTransition = (targetState: Partial<AnimationState>, duration: number) => {
    if (!isActive.value) return
    
    // 既存のトランジションをキャンセル
    if (timers.transitionFrame) {
      cancelAnimationFrame(timers.transitionFrame)
    }
    
    const startState = { ...character.value.animationState }
    const startTime = performance.now()
    
    const animate = (currentTime: number) => {
      if (!isActive.value) return
      
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // イージング関数（ease-out-cubic）
      const eased = 1 - Math.pow(1 - progress, 3)
      
      // 数値プロパティの補間
      Object.keys(targetState).forEach(key => {
        const typedKey = key as keyof AnimationState
        const target = targetState[typedKey]
        const start = startState[typedKey]
        
        if (typeof target === 'number' && typeof start === 'number') {
          character.value.animationState[typedKey] = start + (target - start) * eased as any
        } else if (typeof target === 'boolean' || typeof target === 'string') {
          // ブール値や文字列は即座に適用
          character.value.animationState[typedKey] = target as any
        }
      })
      
      if (progress < 1 && isActive.value) {
        timers.transitionFrame = requestAnimationFrame(animate)
      } else {
        timers.transitionFrame = null
      }
    }
    
    timers.transitionFrame = requestAnimationFrame(animate)
  }

  // アニメーションキューシステム
  const queueAnimation = (trigger: AnimationTrigger) => {
    animationQueue.value.push(trigger)
    if (!isAnimating.value) {
      processAnimationQueue()
    }
  }

  const processAnimationQueue = async () => {
    if (animationQueue.value.length === 0 || !isActive.value) {
      isAnimating.value = false
      return
    }

    isAnimating.value = true
    const animation = animationQueue.value.shift()!
    currentAnimation.value = animation

    // アニメーション実行
    updateEmotion(animation.emotion, animation.intensity, animation.duration)
    
    // アニメーション完了まで待機
    await new Promise(resolve => setTimeout(resolve, animation.duration))
    
    currentAnimation.value = null
    
    // 次のアニメーションを処理
    processAnimationQueue()
  }

  // 発話開始
  const startSpeaking = () => {
    character.value.animationState.isSpeaking = true
    character.value.animationState.isListening = false
    updateEmotion('speaking', 1, 0) // 即座に遷移
  }

  // 発話停止
  const stopSpeaking = () => {
    character.value.animationState.isSpeaking = false
    updateEmotion('normal', 0.7, 300)
  }

  // 聞き取り開始
  const startListening = () => {
    character.value.animationState.isListening = true
    character.value.animationState.isSpeaking = false
    updateEmotion('listening', 1, 200)
  }

  // 聞き取り停止
  const stopListening = () => {
    character.value.animationState.isListening = false
    updateEmotion('normal', 0.7, 300)
  }

  // まばたきトリガー（手動）
  const triggerBlink = () => {
    if (!isActive.value || character.value.animationState.isSpeaking) return
    
    character.value.animationState.isBlinking = true
    setTimeout(() => {
      if (isActive.value) {
        character.value.animationState.isBlinking = false
      }
    }, 150)
  }

  // メモリリーク防止の完全なクリーンアップ
  const cleanup = () => {
    isActive.value = false
    isAnimating.value = false
    
    // すべてのタイマーをクリア
    Object.keys(timers).forEach(key => {
      const timer = timers[key as keyof typeof timers]
      
      if (key === 'armAnimationTimeouts' && Array.isArray(timer)) {
        timer.forEach(timeout => clearTimeout(timeout))
      } else if (typeof timer === 'number') {
        cancelAnimationFrame(timer)
      } else if (timer) {
        clearTimeout(timer)
      }
    })
    
    // タイマー参照をクリア
    timers.blinkTimer = null
    timers.animationFrame = null
    timers.breathingFrame = null
    timers.gestureTimeout = null
    timers.transitionFrame = null
    timers.emotionTimeout = null
    timers.armAnimationTimeouts = []
    
    // アニメーションキューをクリア
    animationQueue.value = []
    currentAnimation.value = null
  }

  // ウォッチャー（null安全・存在チェック付き）
  watch(
    () => character.value, 
    (newCharacter) => {
      if (newCharacter && isActive.value) {
        // キャラクターが利用可能になったときの初期化
        if (!newCharacter.animationState) {
          newCharacter.animationState = createDefaultAnimationState()
        }
      }
    }, 
    { immediate: true }
  )

  watch(
    () => character.value?.emotion, 
    (newEmotion) => {
      if (isActive.value && !isAnimating.value && newEmotion && character.value) {
        updateEmotion(newEmotion)
      }
    }, 
    { immediate: false, flush: 'post' }
  )

  watch(
    () => character.value?.encouragementLevel, 
    (level) => {
      if (isActive.value && character.value && typeof level === 'number') {
        try {
          character.value.animationState.chestLightPulse = Math.max(0.3, level / 100)
        } catch (error) {
          handleAnimationError({
            code: 'ANIMATION_FAILED',
            message: `Failed to update chest light: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'low'
          })
        }
      }
    }, 
    { immediate: false, flush: 'post' }
  )

  // ライフサイクル管理
  onMounted(() => {
    initializeAnimation()
  })

  onUnmounted(() => {
    cleanup()
  })

  // 型安全な戻り値インターface
  interface ECHOAnimationComposable {
    readonly isAnimating: Ref<boolean>
    readonly currentAnimation: Ref<AnimationTrigger | null>
    readonly performanceStats: Ref<PerformanceStats>
    readonly isActive: Ref<boolean>
    readonly currentError: Ref<ECHOError | null>
    readonly isBlinking: ComputedRef<boolean>
    readonly isSpeaking: ComputedRef<boolean>
    readonly isListening: ComputedRef<boolean>
    readonly currentEmotion: ComputedRef<ECHOEmotion>
    readonly hasError: ComputedRef<boolean>
    readonly animationState: ComputedRef<AnimationState>
    readonly startBlinking: () => void
    readonly animateArms: (position: ArmPosition, intensity?: number) => void
    readonly updateEmotion: (emotion: ECHOEmotion, intensity?: number, duration?: number) => void
    readonly cleanup: () => void
    readonly queueAnimation: (trigger: AnimationTrigger) => void
    readonly startSpeaking: () => void
    readonly stopSpeaking: () => void
    readonly startListening: () => void
    readonly stopListening: () => void
    readonly triggerBlink: () => void
    readonly handleAnimationError: (error: Partial<ECHOError>) => void
  }

  const composableReturn: ECHOAnimationComposable = {
    // 状態（読み取り専用として公開）
    isAnimating,
    currentAnimation,
    performanceStats,
    isActive,
    currentError,
    
    // Computed（型推論完全対応）
    isBlinking,
    isSpeaking,
    isListening,
    currentEmotion,
    hasError,
    animationState,
    
    // 主要メソッド（型安全）
    startBlinking,
    animateArms,
    updateEmotion,
    cleanup,
    
    // アニメーション制御（型安全）
    queueAnimation,
    startSpeaking,
    stopSpeaking,
    startListening,
    stopListening,
    triggerBlink,
    
    // エラーハンドリング
    handleAnimationError
  }

  return composableReturn
}