import * as THREE from 'three'

export interface VRGameObjectOptions {
  position?: THREE.Vector3
  rotation?: THREE.Euler
  scale?: THREE.Vector3
  visible?: boolean
  interactive?: boolean
  collidable?: boolean
}

export abstract class VRGameObject extends THREE.Group {
  public id: string
  public isInteractive: boolean
  public isCollidable: boolean
  public isActive: boolean = true
  protected boundingBox: THREE.Box3
  protected originalPosition: THREE.Vector3
  protected originalRotation: THREE.Euler
  protected originalScale: THREE.Vector3

  // アニメーション関連
  protected animations: Map<string, THREE.AnimationClip> = new Map()
  protected mixer?: THREE.AnimationMixer
  protected activeActions: Map<string, THREE.AnimationAction> = new Map()

  constructor(id: string, options: VRGameObjectOptions = {}) {
    super()

    this.id = id
    this.name = id

    // オプション設定
    this.isInteractive = options.interactive ?? false
    this.isCollidable = options.collidable ?? true

    // 位置・回転・スケール設定
    if (options.position) this.position.copy(options.position)
    if (options.rotation) this.rotation.copy(options.rotation)
    if (options.scale) this.scale.copy(options.scale)
    if (options.visible !== undefined) this.visible = options.visible

    // 初期値を保存
    this.originalPosition = this.position.clone()
    this.originalRotation = this.rotation.clone()
    this.originalScale = this.scale.clone()

    // バウンディングボックス初期化
    this.boundingBox = new THREE.Box3()

    // 初期化処理
    this.initialize()
  }

  // 抽象メソッド - 子クラスで実装
  protected abstract initialize(): void
  public abstract update(deltaTime: number): void

  // バウンディングボックス更新
  public updateBoundingBox(): void {
    this.boundingBox.setFromObject(this)
  }

  // 衝突判定
  public checkCollision(other: VRGameObject): boolean {
    if (!this.isCollidable || !other.isCollidable) return false

    this.updateBoundingBox()
    other.updateBoundingBox()

    return this.boundingBox.intersectsBox(other.boundingBox)
  }

  // レイキャスト判定
  public raycast(ray: THREE.Ray): THREE.Intersection[] {
    if (!this.isInteractive) return []

    const raycaster = new THREE.Raycaster()
    raycaster.ray = ray

    return raycaster.intersectObject(this, true)
  }

  // インタラクション処理
  public onHover(point: THREE.Vector3): void {
    // オーバーライド可能
  }

  public onSelect(point: THREE.Vector3): void {
    // オーバーライド可能
  }

  public onGrab(): void {
    // オーバーライド可能
  }

  public onRelease(): void {
    // オーバーライド可能
  }

  // アニメーション管理
  public addAnimation(name: string, clip: THREE.AnimationClip): void {
    this.animations.set(name, clip)

    if (!this.mixer) {
      this.mixer = new THREE.AnimationMixer(this)
    }

    const action = this.mixer.clipAction(clip)
    this.activeActions.set(name, action)
  }

  public playAnimation(
    name: string,
    options: {
      loop?: THREE.AnimationActionLoopStyles
      duration?: number
      fadeIn?: number
      fadeOut?: number
    } = {}
  ): boolean {
    const action = this.activeActions.get(name)
    if (!action) return false

    // オプション設定
    if (options.loop !== undefined) {
      action.setLoop(options.loop, Infinity)
    }

    if (options.duration !== undefined) {
      action.setDuration(options.duration)
    }

    // フェードイン
    if (options.fadeIn && options.fadeIn > 0) {
      action.reset()
      action.fadeIn(options.fadeIn)
    } else {
      action.reset()
    }

    action.play()
    return true
  }

  public stopAnimation(name: string, fadeOut?: number): boolean {
    const action = this.activeActions.get(name)
    if (!action) return false

    if (fadeOut && fadeOut > 0) {
      action.fadeOut(fadeOut)
    } else {
      action.stop()
    }

    return true
  }

  public pauseAnimation(name: string): boolean {
    const action = this.activeActions.get(name)
    if (!action) return false

    action.paused = true
    return true
  }

  public resumeAnimation(name: string): boolean {
    const action = this.activeActions.get(name)
    if (!action) return false

    action.paused = false
    return true
  }

  // トゥイーン（簡易アニメーション）
  public tweenTo(
    target: { position?: THREE.Vector3; rotation?: THREE.Euler; scale?: THREE.Vector3 },
    duration: number,
    easing: (t: number) => number = (t) => t
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      const startPosition = this.position.clone()
      const startRotation = this.rotation.clone()
      const startScale = this.scale.clone()

      const animate = () => {
        const currentTime = performance.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const easedProgress = easing(progress)

        if (target.position) {
          this.position.lerpVectors(startPosition, target.position, easedProgress)
        }

        if (target.rotation) {
          this.rotation.copy(startRotation)
          const targetQuaternion = new THREE.Quaternion().setFromEuler(target.rotation)
          const startQuaternion = new THREE.Quaternion().setFromEuler(startRotation)
          const currentQuaternion = new THREE.Quaternion().slerpQuaternions(
            startQuaternion,
            targetQuaternion,
            easedProgress
          )
          this.rotation.setFromQuaternion(currentQuaternion)
        }

        if (target.scale) {
          this.scale.lerpVectors(startScale, target.scale, easedProgress)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      animate()
    })
  }

  // 位置・回転リセット
  public resetTransform(): void {
    this.position.copy(this.originalPosition)
    this.rotation.copy(this.originalRotation)
    this.scale.copy(this.originalScale)
  }

  // ライフサイクル
  public activate(): void {
    this.isActive = true
    this.visible = true
  }

  public deactivate(): void {
    this.isActive = false
    this.visible = false
  }

  public destroy(): void {
    // アニメーションミキサーを停止
    if (this.mixer) {
      this.mixer.stopAllAction()
    }

    // メモリクリーンアップ
    this.animations.clear()
    this.activeActions.clear()

    // 子オブジェクトも再帰的にクリーンアップ
    this.traverse((child) => {
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

    // 親から削除
    if (this.parent) {
      this.parent.remove(this)
    }
  }

  // ヘルパーメソッド
  public getWorldPosition(): THREE.Vector3 {
    const worldPosition = new THREE.Vector3()
    this.getWorldPosition(worldPosition)
    return worldPosition
  }

  public getDistanceTo(target: THREE.Vector3 | VRGameObject): number {
    const targetPosition = target instanceof VRGameObject
      ? target.getWorldPosition()
      : target

    return this.getWorldPosition().distanceTo(targetPosition)
  }

  public lookAt(target: THREE.Vector3 | VRGameObject): void {
    const targetPosition = target instanceof VRGameObject
      ? target.getWorldPosition()
      : target

    super.lookAt(targetPosition)
  }

  // ミキサー更新（フレーム毎に呼び出し）
  protected updateAnimations(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }
  }

  // 基本更新処理（子クラスから呼び出し）
  protected baseUpdate(deltaTime: number): void {
    if (!this.isActive) return

    this.updateAnimations(deltaTime)
    this.updateBoundingBox()
  }
}

export default VRGameObject