import * as THREE from 'three'
import WebXRManager, { VRController } from '../utils/WebXRManager'
import VRAudioManager, { AudioClip } from '../utils/VRAudioManager'
import PhonemeProjectile from '../components/PhonemeProjectile'
import logger from '@/utils/logger'
import { useTicketStore } from '@/stores/ticketStore'
import { useGameRewards, GameResult } from '@/composables/useGameRewards'

export interface PhoneticsGameConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: number // seconds
  phonemeSet: string[]
  spawnRate: number // phonemes per second
  targetAccuracy: number // 0-1
}

export interface GameStats {
  score: number
  accuracy: number
  correctHits: number
  totalShots: number
  phonemesHit: number
  phonemesMissed: number
  timeRemaining: number
}

export class PhoneticsPlanet {
  // Three.js Core
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public renderer: THREE.WebGLRenderer

  // VR管理
  public webxrManager: WebXRManager
  public audioManager: VRAudioManager

  // ゲーム状態
  public gameConfig: PhoneticsGameConfig
  public gameStats: GameStats
  public isGameActive: boolean = false
  public isPaused: boolean = false

  // ゲームオブジェクト
  private phonemeProjectiles: Map<string, PhonemeProjectile> = new Map()
  private spaceBackground: THREE.Mesh
  private planet: THREE.Group
  private stars: THREE.Points

  // ゲームロジック
  private gameTimer: number = 0
  private lastSpawnTime: number = 0
  private spawnInterval: number = 1000 // ms

  // ストア統合
  private ticketStore: any
  private gameRewards: any

  // UI要素
  private scoreDisplay: THREE.Mesh
  private timerDisplay: THREE.Mesh

  constructor(container: HTMLElement, config: Partial<PhoneticsGameConfig> = {}) {
    // デフォルト設定
    this.gameConfig = {
      difficulty: 'beginner',
      duration: 120, // 2分
      phonemeSet: ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko'],
      spawnRate: 0.5,
      targetAccuracy: 0.7,
      ...config
    }

    // 初期統計
    this.gameStats = {
      score: 0,
      accuracy: 0,
      correctHits: 0,
      totalShots: 0,
      phonemesHit: 0,
      phonemesMissed: 0,
      timeRemaining: this.gameConfig.duration
    }

    // Three.js初期化
    this.initializeThreeJS(container)

    // VR管理初期化
    this.initializeVR()

    // オーディオ初期化
    this.initializeAudio()

    // シーン構築
    this.createSpaceEnvironment()
    this.createPlanet()
    this.createUI()

    // ストア初期化
    this.initializeStores()

    // イベントリスナー設定
    this.setupEventListeners()

    // ゲームループ開始
    this.startGameLoop()

    logger.log('🌌 PhoneticsPlanet VR scene initialized')
  }

  private initializeThreeJS(container: HTMLElement): void {
    // シーン作成
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x000011)

    // カメラ作成
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 1.6, 2)

    // レンダラー作成
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2

    container.appendChild(this.renderer.domElement)

    // ライティング
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)
  }

  private initializeVR(): void {
    this.webxrManager = new WebXRManager(
      this.renderer,
      this.scene,
      this.camera,
      {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'bounded-floor']
      }
    )

    // VRコントローラー設定
    this.webxrManager.setupControllers()

    // VRボタン作成
    const vrButton = this.webxrManager.createVRButton()
    if (vrButton) {
      document.body.appendChild(vrButton)
    }
  }

  private initializeAudio(): void {
    this.audioManager = new VRAudioManager(this.camera, {
      enablePositionalAudio: true,
      masterVolume: 0.8,
      sfxVolume: 0.9,
      musicVolume: 0.6,
      voiceVolume: 1.0
    })

    // オーディオクリップ読み込み
    this.loadAudioAssets()
  }

  private async loadAudioAssets(): Promise<void> {
    const audioClips: AudioClip[] = [
      {
        id: 'background-music',
        url: '/audio/vr/space-ambient.ogg',
        loop: true,
        volume: 0.4,
        category: 'music'
      },
      {
        id: 'phoneme-spawn',
        url: '/audio/vr/phoneme-spawn.ogg',
        loop: false,
        volume: 0.6,
        category: 'sfx'
      },
      {
        id: 'phoneme-hit',
        url: '/audio/vr/phoneme-hit.ogg',
        loop: false,
        volume: 0.8,
        category: 'sfx'
      },
      {
        id: 'phoneme-miss',
        url: '/audio/vr/phoneme-miss.ogg',
        loop: false,
        volume: 0.5,
        category: 'sfx'
      },
      {
        id: 'game-complete',
        url: '/audio/vr/game-complete.ogg',
        loop: false,
        volume: 0.9,
        category: 'ui'
      }
    ]

    for (const clip of audioClips) {
      await this.audioManager.loadAudioClip(clip)
    }

    logger.log('🎵 VR Audio assets loaded')
  }

  private createSpaceEnvironment(): void {
    // 星空背景
    const starGeometry = new THREE.BufferGeometry()
    const starCount = 2000

    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)

    for (let i = 0; i < starCount; i++) {
      // ランダムな球体座標
      const radius = 400 + Math.random() * 600
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // 星の色（白～青白～黄色）
      const starColor = new THREE.Color()
      const hue = 0.15 + Math.random() * 0.1 // 黄色～白
      const saturation = Math.random() * 0.3
      const lightness = 0.8 + Math.random() * 0.2

      starColor.setHSL(hue, saturation, lightness)

      colors[i * 3] = starColor.r
      colors[i * 3 + 1] = starColor.g
      colors[i * 3 + 2] = starColor.b
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const starMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: false,
      size: 2
    })

    this.stars = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(this.stars)

    // ネビュラ効果
    this.createNebula()
  }

  private createNebula(): void {
    const nebulaGeometry = new THREE.SphereGeometry(800, 32, 32)
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x1a0033) },
        color2: { value: new THREE.Color(0x000011) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          float noise = sin(uv.x * 10.0 + time * 0.5) * sin(uv.y * 10.0 + time * 0.3) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, noise);
          gl_FragColor = vec4(color, 0.3);
        }
      `,
      transparent: true,
      side: THREE.BackSide
    })

    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial)
    this.scene.add(nebula)

    // アニメーション
    const animateNebula = () => {
      nebulaMaterial.uniforms.time.value += 0.01
      requestAnimationFrame(animateNebula)
    }
    animateNebula()
  }

  private createPlanet(): void {
    this.planet = new THREE.Group()

    // 惑星本体
    const planetGeometry = new THREE.SphereGeometry(2, 64, 64)
    const planetTexture = new THREE.TextureLoader().load('/textures/vr/phonics-planet.jpg')
    const planetMaterial = new THREE.MeshPhongMaterial({
      map: planetTexture,
      normalScale: new THREE.Vector2(0.5, 0.5)
    })

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial)
    planetMesh.position.set(0, -5, -8)
    planetMesh.receiveShadow = true
    this.planet.add(planetMesh)

    // 大気効果
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 32, 32)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x4488ff) },
        viewVector: { value: this.camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 0.6);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    atmosphere.position.copy(planetMesh.position)
    this.planet.add(atmosphere)

    this.scene.add(this.planet)

    // 惑星回転アニメーション
    const rotatePlanet = () => {
      planetMesh.rotation.y += 0.002
      atmosphere.rotation.y += 0.001
      requestAnimationFrame(rotatePlanet)
    }
    rotatePlanet()
  }

  private createUI(): void {
    this.createScoreDisplay()
    this.createTimerDisplay()
  }

  private createScoreDisplay(): void {
    // キャンバスでスコア表示作成
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 512
    canvas.height = 256

    const updateScoreTexture = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.8)'
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.font = 'bold 48px Arial'
      context.fillStyle = '#00ffff'
      context.textAlign = 'center'
      context.fillText(`Score: ${this.gameStats.score}`, canvas.width / 2, 80)

      context.font = 'bold 32px Arial'
      context.fillText(
        `Accuracy: ${Math.round(this.gameStats.accuracy * 100)}%`,
        canvas.width / 2,
        140
      )
      context.fillText(
        `Hits: ${this.gameStats.phonemesHit}`,
        canvas.width / 2,
        180
      )

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    const scoreGeometry = new THREE.PlaneGeometry(2, 1)
    const scoreMaterial = new THREE.MeshBasicMaterial({
      map: updateScoreTexture(),
      transparent: true
    })

    this.scoreDisplay = new THREE.Mesh(scoreGeometry, scoreMaterial)
    this.scoreDisplay.position.set(-3, 3, -5)
    this.scene.add(this.scoreDisplay)

    // スコア更新関数を保存
    this.scoreDisplay.userData.updateTexture = updateScoreTexture
  }

  private createTimerDisplay(): void {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 512
    canvas.height = 128

    const updateTimerTexture = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.8)'
      context.fillRect(0, 0, canvas.width, canvas.height)

      const minutes = Math.floor(this.gameStats.timeRemaining / 60)
      const seconds = Math.floor(this.gameStats.timeRemaining % 60)
      const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`

      context.font = 'bold 64px Arial'
      context.fillStyle = this.gameStats.timeRemaining < 30 ? '#ff4444' : '#ffff00'
      context.textAlign = 'center'
      context.fillText(timeText, canvas.width / 2, 80)

      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }

    const timerGeometry = new THREE.PlaneGeometry(2, 0.5)
    const timerMaterial = new THREE.MeshBasicMaterial({
      map: updateTimerTexture(),
      transparent: true
    })

    this.timerDisplay = new THREE.Mesh(timerGeometry, timerMaterial)
    this.timerDisplay.position.set(3, 3, -5)
    this.scene.add(this.timerDisplay)

    this.timerDisplay.userData.updateTexture = updateTimerTexture
  }

  private initializeStores(): void {
    this.ticketStore = useTicketStore()
    this.gameRewards = useGameRewards()
  }

  private setupEventListeners(): void {
    // WebXRイベント
    this.webxrManager.addEventListener('controller-connected', this.onControllerConnected.bind(this))
    this.webxrManager.addEventListener('trigger-pressed', this.onTriggerPressed.bind(this))
    this.webxrManager.addEventListener('vr-session-start', this.onVRSessionStart.bind(this))
    this.webxrManager.addEventListener('vr-session-end', this.onVRSessionEnd.bind(this))

    // 音素イベント
    window.addEventListener('vr-phoneme-hit', this.onPhonemeHit.bind(this))
    window.addEventListener('vr-phoneme-missed', this.onPhonemeMissed.bind(this))

    // 音声認識イベント
    window.addEventListener('vr-speech-recognized', this.onSpeechRecognized.bind(this))

    // ウィンドウリサイズ
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  private onControllerConnected(event: any): void {
    const { controller, index } = event
    logger.log(`🎮 Controller ${index} connected for PhoneticsPlanet`)
  }

  private onTriggerPressed(event: any): void {
    const { controller, index } = event

    if (!this.isGameActive) return

    // コントローラーからレイキャスト
    const intersections = this.webxrManager.createRaycast(
      index,
      Array.from(this.phonemeProjectiles.values())
    )

    if (intersections.length > 0) {
      const hitObject = intersections[0].object

      // 音素プロジェクタイルを探す
      let phonemeProjectile: PhonemeProjectile | null = null
      this.phonemeProjectiles.forEach((projectile) => {
        if (projectile.children.includes(hitObject) || projectile === hitObject.parent) {
          phonemeProjectile = projectile
        }
      })

      if (phonemeProjectile) {
        phonemeProjectile.onSelect(intersections[0].point)
      }
    }

    this.gameStats.totalShots++
    this.updateAccuracy()
  }

  private onPhonemeHit(event: CustomEvent): void {
    const { phoneme, projectileId } = event.detail

    this.gameStats.correctHits++
    this.gameStats.phonemesHit++
    this.gameStats.score += this.calculateHitScore(phoneme)

    // プロジェクタイルを削除
    const projectile = this.phonemeProjectiles.get(projectileId)
    if (projectile) {
      this.phonemeProjectiles.delete(projectileId)
    }

    // 音響効果
    this.audioManager.playAudio('phoneme-hit')

    this.updateAccuracy()
    this.updateUI()

    logger.log(`✅ Phoneme hit: ${phoneme}, Score: ${this.gameStats.score}`)
  }

  private onPhonemeMissed(event: CustomEvent): void {
    const { phoneme, projectileId } = event.detail

    this.gameStats.phonemesMissed++

    // プロジェクタイルを削除
    this.phonemeProjectiles.delete(projectileId)

    // 音響効果
    this.audioManager.playAudio('phoneme-miss')

    this.updateAccuracy()
    this.updateUI()

    logger.log(`❌ Phoneme missed: ${phoneme}`)
  }

  private onSpeechRecognized(event: CustomEvent): void {
    const { transcript, confidence } = event.detail

    // 発音の正確性をチェック
    this.phonemeProjectiles.forEach((projectile) => {
      const result = projectile.checkPronunciation(transcript)
      if (result.isCorrect && result.confidence > 0.8) {
        // 音声認識による正解
        projectile.onSelect(projectile.position)
      }
    })
  }

  private onVRSessionStart(): void {
    logger.log('🥽 VR session started for PhoneticsPlanet')

    // 背景音楽開始
    this.audioManager.playAudio('background-music')

    // 音声認識開始
    this.audioManager.startSpeechRecognition('ja-JP')
  }

  private onVRSessionEnd(): void {
    logger.log('🥽 VR session ended for PhoneticsPlanet')

    // 音響停止
    this.audioManager.stopAudio('background-music')
    this.audioManager.stopSpeechRecognition()
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private calculateHitScore(phoneme: string): number {
    const baseScore = 100
    const difficultyMultiplier = {
      beginner: 1.0,
      intermediate: 1.2,
      advanced: 1.5,
      expert: 2.0
    }

    return Math.round(baseScore * difficultyMultiplier[this.gameConfig.difficulty])
  }

  private updateAccuracy(): void {
    if (this.gameStats.totalShots > 0) {
      this.gameStats.accuracy = this.gameStats.correctHits / this.gameStats.totalShots
    }
  }

  private updateUI(): void {
    // スコア表示更新
    if (this.scoreDisplay.userData.updateTexture) {
      this.scoreDisplay.material.map = this.scoreDisplay.userData.updateTexture()
    }

    // タイマー表示更新
    if (this.timerDisplay.userData.updateTexture) {
      this.timerDisplay.material.map = this.timerDisplay.userData.updateTexture()
    }
  }

  public startGame(): void {
    if (this.isGameActive) return

    this.isGameActive = true
    this.isPaused = false
    this.gameTimer = 0

    // 統計リセット
    this.gameStats = {
      score: 0,
      accuracy: 0,
      correctHits: 0,
      totalShots: 0,
      phonemesHit: 0,
      phonemesMissed: 0,
      timeRemaining: this.gameConfig.duration
    }

    // スポーン間隔計算
    this.spawnInterval = 1000 / this.gameConfig.spawnRate
    this.lastSpawnTime = 0

    logger.log('🎮 PhoneticsPlanet game started')
  }

  public pauseGame(): void {
    this.isPaused = !this.isPaused
    logger.log(`🎮 Game ${this.isPaused ? 'paused' : 'resumed'}`)
  }

  public endGame(): void {
    if (!this.isGameActive) return

    this.isGameActive = false

    // 全プロジェクタイル削除
    this.phonemeProjectiles.forEach((projectile) => {
      projectile.destroy()
    })
    this.phonemeProjectiles.clear()

    // ゲーム結果処理
    this.processGameResult()

    // 音響効果
    this.audioManager.playAudio('game-complete')

    logger.log('🏁 PhoneticsPlanet game ended')
  }

  private async processGameResult(): Promise<void> {
    const gameResult: GameResult = {
      gameId: 'phonetics-planet-vr',
      score: this.gameStats.score,
      accuracy: this.gameStats.accuracy,
      correctAnswers: this.gameStats.phonemesHit,
      totalQuestions: this.gameStats.phonemesHit + this.gameStats.phonemesMissed,
      timeElapsed: this.gameConfig.duration - this.gameStats.timeRemaining,
      difficulty: this.gameConfig.difficulty
    }

    // 報酬処理
    const rewards = await this.gameRewards.processGameCompletion(gameResult)

    // VRセッション完了イベント
    window.dispatchEvent(new CustomEvent('vr-game-completed', {
      detail: {
        gameId: 'phonetics-planet-vr',
        result: gameResult,
        rewards
      }
    }))
  }

  private spawnPhoneme(): void {
    const phoneme = this.gameConfig.phonemeSet[
      Math.floor(Math.random() * this.gameConfig.phonemeSet.length)
    ]

    // スポーン位置（カメラの周りのランダムな位置）
    const spawnDistance = 15
    const angle = Math.random() * Math.PI * 2
    const height = -2 + Math.random() * 4

    const spawnPosition = new THREE.Vector3(
      Math.cos(angle) * spawnDistance,
      height,
      Math.sin(angle) * spawnDistance
    )

    // ターゲット位置（プレイヤーの近く）
    const targetPosition = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2,
      -3
    )

    // 色を音素によって決定
    const phonemeColors = {
      'a': 0xff4444, 'i': 0x44ff44, 'u': 0x4444ff, 'e': 0xffff44, 'o': 0xff44ff,
      'ka': 0xff8888, 'ki': 0x88ff88, 'ku': 0x8888ff, 'ke': 0xffff88, 'ko': 0xff88ff
    }

    const projectile = new PhonemeProjectile({
      phoneme,
      speed: 2 + Math.random() * 2,
      lifetime: 8,
      position: spawnPosition,
      color: phonemeColors[phoneme as keyof typeof phonemeColors] || 0x00ffff,
      targetPosition
    })

    this.scene.add(projectile)
    this.phonemeProjectiles.set(projectile.id, projectile)

    // スポーン音
    this.audioManager.playAudio('phoneme-spawn', spawnPosition)
  }

  private startGameLoop(): void {
    this.webxrManager.startRenderLoop(() => {
      const deltaTime = this.renderer.xr.getFrame()?.getSession()?.frameRate
        ? 1 / 90 // 90fps for VR
        : 1 / 60 // 60fps for desktop

      this.update(deltaTime)
    })
  }

  private update(deltaTime: number): void {
    if (!this.isGameActive || this.isPaused) return

    // ゲームタイマー更新
    this.gameTimer += deltaTime
    this.gameStats.timeRemaining = Math.max(0, this.gameConfig.duration - this.gameTimer)

    // ゲーム終了チェック
    if (this.gameStats.timeRemaining <= 0) {
      this.endGame()
      return
    }

    // 音素スポーン
    if (this.gameTimer * 1000 - this.lastSpawnTime >= this.spawnInterval) {
      this.spawnPhoneme()
      this.lastSpawnTime = this.gameTimer * 1000
    }

    // プロジェクタイル更新
    this.phonemeProjectiles.forEach((projectile) => {
      projectile.update(deltaTime)
    })

    // UI更新
    this.updateUI()

    // 星の回転
    if (this.stars) {
      this.stars.rotation.y += deltaTime * 0.1
    }
  }

  public dispose(): void {
    // ゲーム停止
    this.endGame()

    // WebXR停止
    this.webxrManager.dispose()

    // オーディオ停止
    this.audioManager.dispose()

    // レンダラー停止
    this.webxrManager.stopRenderLoop()

    // Three.js クリーンアップ
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      }
    })

    this.renderer.dispose()

    logger.log('🌌 PhoneticsPlanet disposed')
  }
}

export default PhoneticsPlanet