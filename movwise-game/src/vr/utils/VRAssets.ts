// VR Asset Configuration for MovWISE Phonetics Planet
export const VR_AUDIO_ASSETS = {
  BACKGROUND_MUSIC: {
    id: 'background-music',
    url: '/audio/vr/space-ambient.ogg',
    fallback: '/audio/vr/space-ambient.mp3',
    loop: true,
    volume: 0.4,
    category: 'music' as const
  },
  PHONEME_SPAWN: {
    id: 'phoneme-spawn',
    url: '/audio/vr/phoneme-spawn.ogg',
    fallback: '/audio/vr/phoneme-spawn.mp3',
    loop: false,
    volume: 0.6,
    category: 'sfx' as const
  },
  PHONEME_HIT: {
    id: 'phoneme-hit',
    url: '/audio/vr/phoneme-hit.ogg',
    fallback: '/audio/vr/phoneme-hit.mp3',
    loop: false,
    volume: 0.8,
    category: 'sfx' as const
  },
  PHONEME_MISS: {
    id: 'phoneme-miss',
    url: '/audio/vr/phoneme-miss.ogg',
    fallback: '/audio/vr/phoneme-miss.mp3',
    loop: false,
    volume: 0.5,
    category: 'sfx' as const
  },
  GAME_COMPLETE: {
    id: 'game-complete',
    url: '/audio/vr/game-complete.ogg',
    fallback: '/audio/vr/game-complete.mp3',
    loop: false,
    volume: 0.9,
    category: 'ui' as const
  }
}

export const VR_TEXTURE_ASSETS = {
  PHONICS_PLANET: {
    id: 'phonics-planet-texture',
    url: '/textures/vr/phonics-planet.jpg',
    fallback: '/textures/vr/phonics-planet.png'
  },
  SPACE_SKYBOX: {
    id: 'space-skybox',
    urls: [
      '/textures/vr/skybox/space-px.jpg',
      '/textures/vr/skybox/space-nx.jpg',
      '/textures/vr/skybox/space-py.jpg',
      '/textures/vr/skybox/space-ny.jpg',
      '/textures/vr/skybox/space-pz.jpg',
      '/textures/vr/skybox/space-nz.jpg'
    ]
  }
}

export const VR_MODEL_ASSETS = {
  CONTROLLER_MODELS: {
    // Meta Quest 3用コントローラーモデル
    QUEST_3_LEFT: '/models/vr/quest3-controller-left.glb',
    QUEST_3_RIGHT: '/models/vr/quest3-controller-right.glb',
    // 汎用コントローラー
    GENERIC_LEFT: '/models/vr/generic-controller-left.glb',
    GENERIC_RIGHT: '/models/vr/generic-controller-right.glb'
  },
  HAND_MODELS: {
    LEFT_HAND: '/models/vr/hand-left.glb',
    RIGHT_HAND: '/models/vr/hand-right.glb'
  }
}

// WebXR対応チェック用のヘルパー関数
export async function checkWebXRSupport(): Promise<{
  isSupported: boolean
  hasVRSupport: boolean
  hasARSupport: boolean
  supportedFeatures: string[]
}> {
  const result = {
    isSupported: false,
    hasVRSupport: false,
    hasARSupport: false,
    supportedFeatures: [] as string[]
  }

  if (!('xr' in navigator)) {
    return result
  }

  result.isSupported = true

  try {
    // VRサポートチェック
    result.hasVRSupport = await navigator.xr!.isSessionSupported('immersive-vr')

    // ARサポートチェック
    result.hasARSupport = await navigator.xr!.isSessionSupported('immersive-ar')

    // サポート機能の詳細チェック
    const vrSession = await navigator.xr!.requestSession('immersive-vr', {
      requiredFeatures: [],
      optionalFeatures: [
        'local-floor',
        'bounded-floor',
        'hand-tracking',
        'eye-tracking'
      ]
    }).catch(() => null)

    if (vrSession) {
      // セッションから対応機能を取得
      const supportedFeatures = vrSession.supportedFrameRates || []
      result.supportedFeatures = supportedFeatures.map(rate => `${rate}fps`)

      // ハンドトラッキング対応チェック
      if (vrSession.inputSources) {
        const hasHandTracking = Array.from(vrSession.inputSources).some(
          source => source.hand !== null
        )
        if (hasHandTracking) {
          result.supportedFeatures.push('hand-tracking')
        }
      }

      vrSession.end()
    }
  } catch (error) {
    console.warn('WebXR feature detection failed:', error)
  }

  return result
}

// デバイス推奨設定
export const DEVICE_RECOMMENDATIONS = {
  'Meta Quest 3': {
    maxFPS: 90,
    recommendedRenderScale: 1.2,
    supportsHandTracking: true,
    supportsEyeTracking: false,
    recommendedFeatures: ['local-floor', 'hand-tracking']
  },
  'Meta Quest 2': {
    maxFPS: 90,
    recommendedRenderScale: 1.0,
    supportsHandTracking: true,
    supportsEyeTracking: false,
    recommendedFeatures: ['local-floor', 'hand-tracking']
  },
  'HTC Vive': {
    maxFPS: 90,
    recommendedRenderScale: 1.0,
    supportsHandTracking: false,
    supportsEyeTracking: true,
    recommendedFeatures: ['local-floor']
  },
  'Generic VR': {
    maxFPS: 60,
    recommendedRenderScale: 0.8,
    supportsHandTracking: false,
    supportsEyeTracking: false,
    recommendedFeatures: ['local-floor']
  }
}

// デバイス検出（簡易版）
export function detectVRDevice(): string {
  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('oculus') || userAgent.includes('meta')) {
    return 'Meta Quest 3' // 最新として仮定
  }

  if (userAgent.includes('vive')) {
    return 'HTC Vive'
  }

  return 'Generic VR'
}

// パフォーマンス最適化設定
export function getOptimizedSettings(deviceName: string) {
  const device = DEVICE_RECOMMENDATIONS[deviceName as keyof typeof DEVICE_RECOMMENDATIONS]
    || DEVICE_RECOMMENDATIONS['Generic VR']

  return {
    renderer: {
      antialias: device.recommendedRenderScale >= 1.0,
      shadowMapSize: device.recommendedRenderScale >= 1.0 ? 2048 : 1024,
      pixelRatio: Math.min(window.devicePixelRatio, device.recommendedRenderScale)
    },
    scene: {
      maxParticles: device.recommendedRenderScale >= 1.0 ? 100 : 50,
      maxProjectiles: device.recommendedRenderScale >= 1.0 ? 20 : 10,
      enableAdvancedEffects: device.recommendedRenderScale >= 1.0
    },
    audio: {
      enable3DAudio: true,
      maxConcurrentSounds: device.recommendedRenderScale >= 1.0 ? 8 : 4
    }
  }
}

export default {
  VR_AUDIO_ASSETS,
  VR_TEXTURE_ASSETS,
  VR_MODEL_ASSETS,
  checkWebXRSupport,
  DEVICE_RECOMMENDATIONS,
  detectVRDevice,
  getOptimizedSettings
}