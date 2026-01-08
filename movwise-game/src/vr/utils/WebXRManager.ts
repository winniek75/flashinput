import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory'
import logger from '@/utils/logger'

export interface VRController {
  controller: THREE.Group
  grip: THREE.Group
  hand?: THREE.Group
  isConnected: boolean
  handedness: string
}

export interface WebXROptions {
  requiredFeatures?: string[]
  optionalFeatures?: string[]
  referenceSpaceType?: 'local-floor' | 'local' | 'bounded-floor'
}

export class WebXRManager extends THREE.EventDispatcher {
  public renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera: THREE.PerspectiveCamera
  public isVRSupported: boolean = false
  public isVRActive: boolean = false
  public controllers: VRController[] = []

  private controllerModelFactory: XRControllerModelFactory
  private handModelFactory: XRHandModelFactory
  private frameId: number = 0
  private onAnimateCallback?: () => void

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    options: WebXROptions = {}
  ) {
    super()

    this.renderer = renderer
    this.scene = scene
    this.camera = camera

    // WebXR設定
    this.setupWebXR(options)

    // コントローラーファクトリー初期化
    this.controllerModelFactory = new XRControllerModelFactory()
    this.handModelFactory = new XRHandModelFactory()

    // VRサポート確認
    this.checkVRSupport()
  }

  private setupWebXR(options: WebXROptions): void {
    // WebGLRenderer WebXR設定
    this.renderer.xr.enabled = true
    this.renderer.xr.setReferenceSpaceType(options.referenceSpaceType || 'local-floor')

    // VR機能設定
    const sessionInit = {
      requiredFeatures: options.requiredFeatures || ['local-floor'],
      optionalFeatures: options.optionalFeatures || [
        'hand-tracking',
        'bounded-floor',
        'local-floor-offset'
      ]
    }

    // WebXRセッションリクエスト設定
    if (navigator.xr) {
      navigator.xr.requestSession?.('immersive-vr', sessionInit)
        .then(() => {
          logger.log('🥽 WebXR session available')
          this.isVRSupported = true
        })
        .catch((error) => {
          logger.warn('WebXR session not available:', error)
          this.isVRSupported = false
        })
    }
  }

  private async checkVRSupport(): Promise<void> {
    if (!navigator.xr) {
      logger.warn('WebXR not supported in this browser')
      return
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      this.isVRSupported = supported

      if (supported) {
        logger.log('🥽 WebXR VR support confirmed')
        this.dispatchEvent({ type: 'vr-support-detected' })
      } else {
        logger.warn('VR session not supported on this device')
      }
    } catch (error) {
      logger.error('Error checking VR support:', error)
      this.isVRSupported = false
    }
  }

  public createVRButton(container?: HTMLElement): HTMLElement | null {
    if (!this.isVRSupported) {
      logger.warn('Cannot create VR button - VR not supported')
      return null
    }

    const button = VRButton.createButton(this.renderer)

    if (container) {
      container.appendChild(button)
    }

    // VRセッション状態監視
    button.addEventListener('click', () => {
      if (this.renderer.xr.isPresenting) {
        this.onVRSessionEnd()
      } else {
        this.onVRSessionStart()
      }
    })

    return button
  }

  public setupControllers(): void {
    // コントローラー0（通常は右手）
    const controller0 = this.renderer.xr.getController(0)
    const grip0 = this.renderer.xr.getControllerGrip(0)
    const hand0 = this.renderer.xr.getHand(0)

    // コントローラー1（通常は左手）
    const controller1 = this.renderer.xr.getController(1)
    const grip1 = this.renderer.xr.getControllerGrip(1)
    const hand1 = this.renderer.xr.getHand(1)

    // コントローラーモデル設定
    grip0.add(this.controllerModelFactory.createControllerModel(grip0))
    grip1.add(this.controllerModelFactory.createControllerModel(grip1))

    // ハンドモデル設定（ハンドトラッキング用）
    hand0.add(this.handModelFactory.createHandModel(hand0))
    hand1.add(this.handModelFactory.createHandModel(hand1))

    // シーンに追加
    this.scene.add(controller0, grip0, hand0)
    this.scene.add(controller1, grip1, hand1)

    // コントローラー情報を保存
    this.controllers = [
      {
        controller: controller0,
        grip: grip0,
        hand: hand0,
        isConnected: false,
        handedness: 'right'
      },
      {
        controller: controller1,
        grip: grip1,
        hand: hand1,
        isConnected: false,
        handedness: 'left'
      }
    ]

    // イベントリスナー設定
    this.setupControllerEvents()
  }

  private setupControllerEvents(): void {
    this.controllers.forEach((vrController, index) => {
      const { controller, grip } = vrController

      // コントローラー接続イベント
      controller.addEventListener('connected', (event) => {
        const xrInputSource = event.data as XRInputSource
        vrController.isConnected = true
        vrController.handedness = xrInputSource.handedness

        logger.log(`🎮 Controller ${index} connected (${xrInputSource.handedness})`)
        this.dispatchEvent({
          type: 'controller-connected',
          controller: vrController,
          index
        })

        // レーザーポインター作成
        this.createLaserPointer(controller)
      })

      // コントローラー切断イベント
      controller.addEventListener('disconnected', () => {
        vrController.isConnected = false
        logger.log(`🎮 Controller ${index} disconnected`)
        this.dispatchEvent({
          type: 'controller-disconnected',
          controller: vrController,
          index
        })
      })

      // ボタンイベント
      controller.addEventListener('selectstart', () => {
        this.dispatchEvent({
          type: 'trigger-pressed',
          controller: vrController,
          index
        })
      })

      controller.addEventListener('selectend', () => {
        this.dispatchEvent({
          type: 'trigger-released',
          controller: vrController,
          index
        })
      })

      controller.addEventListener('squeezestart', () => {
        this.dispatchEvent({
          type: 'grip-pressed',
          controller: vrController,
          index
        })
      })

      controller.addEventListener('squeezeend', () => {
        this.dispatchEvent({
          type: 'grip-released',
          controller: vrController,
          index
        })
      })
    })
  }

  private createLaserPointer(controller: THREE.Group): void {
    // レーザーポインター用のライン
    const geometry = new THREE.BufferGeometry()
    geometry.setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    ])

    const material = new THREE.LineBasicMaterial({
      color: 0xff4444,
      transparent: true,
      opacity: 0.8
    })

    const line = new THREE.Line(geometry, material)
    line.scale.z = 5 // レーザーの長さ
    controller.add(line)
  }

  public startRenderLoop(animate: () => void): void {
    this.onAnimateCallback = animate
    this.renderer.setAnimationLoop(() => {
      this.frameId++

      // メインアニメーションループ
      if (this.onAnimateCallback) {
        this.onAnimateCallback()
      }

      // レンダリング
      this.renderer.render(this.scene, this.camera)
    })
  }

  public stopRenderLoop(): void {
    this.renderer.setAnimationLoop(null)
    this.onAnimateCallback = undefined
  }

  private onVRSessionStart(): void {
    this.isVRActive = true
    logger.log('🥽 VR session started')
    this.dispatchEvent({ type: 'vr-session-start' })
  }

  private onVRSessionEnd(): void {
    this.isVRActive = false
    logger.log('🥽 VR session ended')
    this.dispatchEvent({ type: 'vr-session-end' })
  }

  public getControllerWorldPosition(index: number): THREE.Vector3 | null {
    if (index >= this.controllers.length || !this.controllers[index].isConnected) {
      return null
    }

    const worldPosition = new THREE.Vector3()
    this.controllers[index].controller.getWorldPosition(worldPosition)
    return worldPosition
  }

  public getControllerWorldDirection(index: number): THREE.Vector3 | null {
    if (index >= this.controllers.length || !this.controllers[index].isConnected) {
      return null
    }

    const controller = this.controllers[index].controller
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(controller.quaternion)
    return direction
  }

  public createRaycast(controllerIndex: number, objects: THREE.Object3D[]): THREE.Intersection[] {
    const position = this.getControllerWorldPosition(controllerIndex)
    const direction = this.getControllerWorldDirection(controllerIndex)

    if (!position || !direction) {
      return []
    }

    const raycaster = new THREE.Raycaster(position, direction)
    return raycaster.intersectObjects(objects, true)
  }

  public dispose(): void {
    this.stopRenderLoop()

    // コントローラーをシーンから削除
    this.controllers.forEach(vrController => {
      this.scene.remove(vrController.controller)
      this.scene.remove(vrController.grip)
      if (vrController.hand) {
        this.scene.remove(vrController.hand)
      }
    })

    // リスナーをクリア
    this.removeAllEventListeners()
  }

  // ヘルパーメソッド
  public getTeleportPoint(controllerIndex: number, floor: THREE.Object3D): THREE.Vector3 | null {
    const intersections = this.createRaycast(controllerIndex, [floor])
    return intersections.length > 0 ? intersections[0].point : null
  }

  public isHandTrackingActive(): boolean {
    return this.controllers.some(controller =>
      controller.hand && controller.hand.visible
    )
  }

  public getHandPose(handedness: 'left' | 'right'): any {
    const controller = this.controllers.find(c => c.handedness === handedness)
    return controller?.hand?.userData?.pose || null
  }
}

export default WebXRManager