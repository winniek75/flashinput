import * as THREE from 'three'
import VRGameObject, { VRGameObjectOptions } from './VRGameObject'
import logger from '@/utils/logger'

export interface PhonemeProjectileOptions extends VRGameObjectOptions {
  phoneme: string
  speed: number
  lifetime: number
  color?: number
  size?: number
  targetPosition?: THREE.Vector3
}

export class PhonemeProjectile extends VRGameObject {
  public phoneme: string
  public speed: number
  public lifetime: number
  public maxLifetime: number

  private mesh: THREE.Mesh
  private textMesh: THREE.Mesh
  private direction: THREE.Vector3
  private targetPosition?: THREE.Vector3
  private trailPoints: THREE.Vector3[] = []
  private trailMesh?: THREE.Line
  private isDestroyed: boolean = false

  // エフェクト用
  private particleSystem?: THREE.Points
  private glowMaterial: THREE.MeshBasicMaterial

  constructor(options: PhonemeProjectileOptions) {
    super(`phoneme-${options.phoneme}-${Date.now()}`, {
      ...options,
      interactive: true,
      collidable: true
    })

    this.phoneme = options.phoneme
    this.speed = options.speed
    this.lifetime = options.lifetime
    this.maxLifetime = options.lifetime
    this.targetPosition = options.targetPosition

    // 初期方向設定
    this.direction = new THREE.Vector3(0, 0, -1)
    if (this.targetPosition) {
      this.direction.subVectors(this.targetPosition, this.position).normalize()
    }

    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: options.color || 0x00ffff,
      transparent: true,
      opacity: 0.8
    })
  }

  protected initialize(): void {
    this.createPhonemeVisual()
    this.createTrailEffect()
    this.createParticleEffect()
  }

  private createPhonemeVisual(): void {
    // メイン球体
    const geometry = new THREE.SphereGeometry(0.05, 16, 16)
    const material = new THREE.MeshPhongMaterial({
      color: this.glowMaterial.color,
      transparent: true,
      opacity: 0.9,
      emissive: this.glowMaterial.color.clone().multiplyScalar(0.2)
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.add(this.mesh)

    // 音素テキスト表示
    this.createTextDisplay()

    // グロー効果
    this.createGlowEffect()
  }

  private createTextDisplay(): void {
    // キャンバスでテキストテクスチャ作成
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 128
    canvas.height = 128

    // テキスト描画
    context.fillStyle = 'rgba(255, 255, 255, 0)'
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.font = 'bold 48px Arial'
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(this.phoneme, canvas.width / 2, canvas.height / 2)

    // テクスチャ作成
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // テキストメッシュ
    const textGeometry = new THREE.PlaneGeometry(0.1, 0.1)
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    })

    this.textMesh = new THREE.Mesh(textGeometry, textMaterial)
    this.textMesh.position.y = 0.08
    this.add(this.textMesh)
  }

  private createGlowEffect(): void {
    // アウターグロー
    const glowGeometry = new THREE.SphereGeometry(0.08, 16, 16)
    this.glowMaterial.side = THREE.BackSide

    const glowMesh = new THREE.Mesh(glowGeometry, this.glowMaterial)
    this.add(glowMesh)

    // パルスアニメーション
    this.addPulseAnimation()
  }

  private addPulseAnimation(): void {
    const pulseClip = new THREE.AnimationClip('pulse', 1, [
      new THREE.NumberKeyframeTrack(
        '.scale[x]',
        [0, 0.5, 1],
        [1, 1.2, 1]
      ),
      new THREE.NumberKeyframeTrack(
        '.scale[y]',
        [0, 0.5, 1],
        [1, 1.2, 1]
      ),
      new THREE.NumberKeyframeTrack(
        '.scale[z]',
        [0, 0.5, 1],
        [1, 1.2, 1]
      )
    ])

    this.addAnimation('pulse', pulseClip)
    this.playAnimation('pulse', { loop: THREE.LoopRepeat })
  }

  private createTrailEffect(): void {
    const trailGeometry = new THREE.BufferGeometry()
    const trailMaterial = new THREE.LineBasicMaterial({
      color: this.glowMaterial.color,
      transparent: true,
      opacity: 0.6,
      linewidth: 3
    })

    this.trailMesh = new THREE.Line(trailGeometry, trailMaterial)
    this.add(this.trailMesh)
  }

  private updateTrail(): void {
    if (!this.trailMesh) return

    // 現在位置をトレイルに追加
    this.trailPoints.push(this.position.clone())

    // トレイルの長さを制限
    const maxTrailLength = 20
    if (this.trailPoints.length > maxTrailLength) {
      this.trailPoints.shift()
    }

    // トレイルジオメトリ更新
    const positions = new Float32Array(this.trailPoints.length * 3)
    for (let i = 0; i < this.trailPoints.length; i++) {
      positions[i * 3] = this.trailPoints[i].x
      positions[i * 3 + 1] = this.trailPoints[i].y
      positions[i * 3 + 2] = this.trailPoints[i].z
    }

    this.trailMesh.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.trailMesh.geometry.attributes.position.needsUpdate = true
  }

  private createParticleEffect(): void {
    const particleCount = 20
    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const color = new THREE.Color(this.glowMaterial.color)

    for (let i = 0; i < particleCount; i++) {
      // ランダムな位置（球体の周りに配置）
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 0.02 + Math.random() * 0.03

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = Math.random() * 0.01 + 0.005
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    })

    this.particleSystem = new THREE.Points(geometry, material)
    this.add(this.particleSystem)
  }

  public update(deltaTime: number): void {
    this.baseUpdate(deltaTime)

    if (this.isDestroyed) return

    // 移動
    const moveDistance = this.speed * deltaTime
    this.position.add(this.direction.clone().multiplyScalar(moveDistance))

    // トレイル更新
    this.updateTrail()

    // パーティクル回転
    if (this.particleSystem) {
      this.particleSystem.rotation.y += deltaTime * 2
    }

    // テキストを常にカメラに向ける
    if (this.textMesh) {
      // VRでは両目の中間点に向ける（簡易実装）
      this.textMesh.lookAt(this.position.clone().add(new THREE.Vector3(0, 0, 1)))
    }

    // ライフタイム減少
    this.lifetime -= deltaTime
    if (this.lifetime <= 0) {
      this.explode()
    }

    // フェードアウト効果
    const lifetimeRatio = this.lifetime / this.maxLifetime
    if (lifetimeRatio < 0.3) {
      const opacity = lifetimeRatio / 0.3
      this.mesh.material.opacity = opacity
      this.glowMaterial.opacity = opacity * 0.8
      if (this.textMesh.material instanceof THREE.MeshBasicMaterial) {
        this.textMesh.material.opacity = opacity
      }
    }
  }

  public onSelect(point: THREE.Vector3): void {
    logger.log(`📢 Phoneme selected: ${this.phoneme}`)

    // 正解時のエフェクト
    this.createHitEffect()

    // カスタムイベント発火
    window.dispatchEvent(new CustomEvent('vr-phoneme-hit', {
      detail: {
        phoneme: this.phoneme,
        position: this.position.clone(),
        projectileId: this.id
      }
    }))

    // プロジェクタイル破壊
    this.explode()
  }

  private createHitEffect(): void {
    // 爆発パーティクル
    const explosionGeometry = new THREE.BufferGeometry()
    const explosionCount = 30
    const explosionPositions = new Float32Array(explosionCount * 3)
    const explosionVelocities: THREE.Vector3[] = []

    for (let i = 0; i < explosionCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 0.1

      explosionPositions[i * 3] = this.position.x + radius * Math.sin(phi) * Math.cos(theta)
      explosionPositions[i * 3 + 1] = this.position.y + radius * Math.sin(phi) * Math.sin(theta)
      explosionPositions[i * 3 + 2] = this.position.z + radius * Math.cos(phi)

      explosionVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ))
    }

    explosionGeometry.setAttribute('position', new THREE.BufferAttribute(explosionPositions, 3))

    const explosionMaterial = new THREE.PointsMaterial({
      color: this.glowMaterial.color,
      transparent: true,
      opacity: 1.0,
      size: 0.02
    })

    const explosionParticles = new THREE.Points(explosionGeometry, explosionMaterial)

    // 親シーンに追加（プロジェクタイルが削除される前に）
    if (this.parent) {
      this.parent.add(explosionParticles)

      // アニメーション
      const animationDuration = 0.5
      const startTime = performance.now()

      const animateExplosion = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const progress = elapsed / animationDuration

        if (progress < 1) {
          // パーティクル移動
          const positions = explosionParticles.geometry.attributes.position.array as Float32Array
          for (let i = 0; i < explosionCount; i++) {
            const velocity = explosionVelocities[i]
            positions[i * 3] += velocity.x * 0.016
            positions[i * 3 + 1] += velocity.y * 0.016
            positions[i * 3 + 2] += velocity.z * 0.016
          }
          explosionParticles.geometry.attributes.position.needsUpdate = true

          // フェードアウト
          explosionMaterial.opacity = 1 - progress

          requestAnimationFrame(animateExplosion)
        } else {
          // クリーンアップ
          this.parent?.remove(explosionParticles)
          explosionGeometry.dispose()
          explosionMaterial.dispose()
        }
      }

      animateExplosion()
    }
  }

  private explode(): void {
    if (this.isDestroyed) return

    this.createHitEffect()

    // ミス時のイベント（ライフタイム切れ）
    if (this.lifetime <= 0) {
      window.dispatchEvent(new CustomEvent('vr-phoneme-missed', {
        detail: {
          phoneme: this.phoneme,
          position: this.position.clone(),
          projectileId: this.id
        }
      }))
    }

    this.isDestroyed = true

    // 少し遅らせて破壊
    setTimeout(() => {
      this.destroy()
    }, 100)
  }

  // 音素の正確性をチェック
  public checkPronunciation(spokenText: string): {
    isCorrect: boolean
    confidence: number
  } {
    const normalizedPhoneme = this.phoneme.toLowerCase().replace(/[^a-z]/g, '')
    const normalizedSpoken = spokenText.toLowerCase().replace(/[^a-z]/g, '')

    // 簡易的なマッチング
    const similarity = this.calculateStringSimilarity(normalizedPhoneme, normalizedSpoken)
    const isCorrect = similarity > 0.7

    return { isCorrect, confidence: similarity }
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1

    const len1 = str1.length
    const len2 = str2.length
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0))

    for (let i = 0; i <= len1; i++) matrix[i][0] = i
    for (let j = 0; j <= len2; j++) matrix[0][j] = j

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }

    const distance = matrix[len1][len2]
    const maxLength = Math.max(len1, len2)
    return maxLength === 0 ? 1 : 1 - (distance / maxLength)
  }

  public destroy(): void {
    // 爆発エフェクトクリーンアップ
    if (this.particleSystem) {
      this.particleSystem.geometry.dispose()
      if (this.particleSystem.material instanceof THREE.Material) {
        this.particleSystem.material.dispose()
      }
    }

    if (this.trailMesh) {
      this.trailMesh.geometry.dispose()
      if (this.trailMesh.material instanceof THREE.Material) {
        this.trailMesh.material.dispose()
      }
    }

    this.glowMaterial.dispose()

    super.destroy()
  }
}

export default PhonemeProjectile