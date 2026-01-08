<template>
  <div class="sound-radar-vr-container" ref="vrContainer">
    <!-- VR Canvas -->
    <canvas ref="vrCanvas" class="vr-canvas"></canvas>

    <!-- 2D UI Overlay for non-VR fallback -->
    <div v-if="!isVRActive" class="ui-overlay">
      <div class="vr-status-bar">
        <div class="status-item">
          <span class="status-label">状態:</span>
          <span class="status-value">{{ vrStatus }}</span>
        </div>
        <button
          v-if="vrSupported && !isVRActive"
          @click="enterVR"
          class="vr-enter-button"
        >
          🥽 VRモードで開始
        </button>
      </div>
    </div>

    <!-- Game HUD (visible in both VR and non-VR) -->
    <div class="game-hud" ref="hudElement">
      <div class="hud-score">
        <div class="score-label">スコア</div>
        <div class="score-value">{{ totalScore }}</div>
      </div>
      <div class="hud-phoneme">
        <div class="phoneme-label">ターゲット音素</div>
        <div class="phoneme-value">{{ currentPhoneme?.symbol || '---' }}</div>
      </div>
      <div class="hud-radar-status">
        <div class="radar-label">レーダー</div>
        <div class="radar-value" :class="{ active: isScanning }">
          {{ isScanning ? 'スキャン中...' : '待機中' }}
        </div>
      </div>
    </div>

    <!-- Audio Feedback -->
    <audio ref="radarPing" preload="auto">
      <source src="/audio/radar-ping.mp3" type="audio/mpeg">
    </audio>
    <audio ref="phonemeDetected" preload="auto">
      <source src="/audio/phoneme-detected.mp3" type="audio/mpeg">
    </audio>
    <audio ref="successSound" preload="auto">
      <source src="/audio/success.mp3" type="audio/mpeg">
    </audio>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed, reactive, watch } from 'vue'
import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'
import { useCooperativeGameStore } from '@/stores/cooperativeGame'
import { useGameStore } from '@/stores/gameStore'
import { useTicketStore } from '@/stores/ticketStore'
import logger from '@/utils/logger'

export default {
  name: 'SoundRadarVR',
  setup() {
    // Stores
    const cooperativeStore = useCooperativeGameStore()
    const gameStore = useGameStore()
    const ticketStore = useTicketStore()

    // VR State
    const vrContainer = ref(null)
    const vrCanvas = ref(null)
    const hudElement = ref(null)
    const isVRActive = ref(false)
    const vrSupported = ref(false)
    const vrStatus = ref('初期化中...')

    // Three.js Objects
    let renderer = null
    let scene = null
    let camera = null
    let vrSession = null
    let radarMesh = null
    let phonemeTargets = []
    let controllers = []
    let raycaster = null
    let tempMatrix = new THREE.Matrix4()

    // Audio
    const radarPing = ref(null)
    const phonemeDetected = ref(null)
    const successSound = ref(null)
    let audioListener = null
    let positionalAudios = []

    // Game State
    const gameState = reactive({
      currentPhoneme: null,
      isScanning: false,
      detectedPhonemes: [],
      score: 0,
      captainScore: 0,
      copilotScore: 0,
      currentLevel: 1,
      radarRange: 10,
      scanSpeed: 0.02,
      phonemePool: [
        { id: 1, symbol: 'æ', sound: 'cat', position: null, detected: false },
        { id: 2, symbol: 'ɪ', sound: 'sit', position: null, detected: false },
        { id: 3, symbol: 'ʌ', sound: 'cup', position: null, detected: false },
        { id: 4, symbol: 'ə', sound: 'about', position: null, detected: false },
        { id: 5, symbol: 'θ', sound: 'think', position: null, detected: false },
        { id: 6, symbol: 'ð', sound: 'this', position: null, detected: false },
        { id: 7, symbol: 'ʃ', sound: 'ship', position: null, detected: false },
        { id: 8, symbol: 'ʒ', sound: 'measure', position: null, detected: false },
        { id: 9, symbol: 'tʃ', sound: 'chair', position: null, detected: false },
        { id: 10, symbol: 'dʒ', sound: 'judge', position: null, detected: false }
      ]
    })

    // Computed
    const currentPhoneme = computed(() => gameState.currentPhoneme)
    const isScanning = computed(() => gameState.isScanning)
    const totalScore = computed(() => gameState.captainScore + gameState.copilotScore)

    // VR Initialization
    const initVR = async () => {
      try {
        // Check VR Support
        if ('xr' in navigator) {
          vrSupported.value = await navigator.xr.isSessionSupported('immersive-vr')

          if (vrSupported.value) {
            vrStatus.value = 'VR準備完了'
            logger.log('🥽 VR support detected')
          } else {
            vrStatus.value = 'VRサポートなし'
            logger.warn('VR not supported on this device')
          }
        } else {
          vrStatus.value = 'WebXR非対応'
          logger.warn('WebXR API not available')
        }

        // Initialize Three.js Scene
        setupScene()

        // Start render loop
        animate()

      } catch (error) {
        logger.error('VR initialization failed:', error)
        vrStatus.value = 'VR初期化エラー'
      }
    }

    // Setup Three.js Scene
    const setupScene = () => {
      // Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: vrCanvas.value,
        antialias: true,
        alpha: true
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.xr.enabled = true
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      // Scene
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000814)
      scene.fog = new THREE.Fog(0x000814, 10, 50)

      // Camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.set(0, 1.6, 3)

      // Lighting
      setupLighting()

      // Radar System
      createRadarSystem()

      // Phoneme Targets
      spawnPhonemeTargets()

      // VR Controllers
      if (vrSupported.value) {
        setupVRControllers()
      }

      // Audio
      setupAudio()

      // Stars Background
      createStarField()

      // Grid Floor
      createFloor()
    }

    // Setup Lighting
    const setupLighting = () => {
      // Ambient Light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
      scene.add(ambientLight)

      // Directional Light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 10, 5)
      directionalLight.castShadow = true
      directionalLight.shadow.camera.near = 0.1
      directionalLight.shadow.camera.far = 50
      directionalLight.shadow.camera.left = -20
      directionalLight.shadow.camera.right = 20
      directionalLight.shadow.camera.top = 20
      directionalLight.shadow.camera.bottom = -20
      scene.add(directionalLight)

      // Point Lights for Radar Glow
      const radarLight = new THREE.PointLight(0x00ffff, 2, 10)
      radarLight.position.set(0, 2, 0)
      scene.add(radarLight)
    }

    // Create Radar System
    const createRadarSystem = () => {
      // Radar Base
      const radarGeometry = new THREE.CylinderGeometry(3, 3, 0.2, 32)
      const radarMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x004466,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      })
      radarMesh = new THREE.Mesh(radarGeometry, radarMaterial)
      radarMesh.position.set(0, 0.5, 0)
      radarMesh.receiveShadow = true
      scene.add(radarMesh)

      // Radar Grid Lines
      const gridHelper = new THREE.PolarGridHelper(3, 8, 6, 64, 0x00ffff, 0x004466)
      gridHelper.position.y = 0.6
      scene.add(gridHelper)

      // Scanning Beam
      const beamGeometry = new THREE.PlaneGeometry(6, 0.1)
      const beamMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const scanBeam = new THREE.Mesh(beamGeometry, beamMaterial)
      scanBeam.position.y = 0.7
      scanBeam.name = 'scanBeam'
      scene.add(scanBeam)

      // Radar Rings Animation
      for (let i = 1; i <= 3; i++) {
        const ringGeometry = new THREE.RingGeometry(i * 0.8, i * 0.8 + 0.05, 32)
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.5 - i * 0.1,
          side: THREE.DoubleSide
        })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.position.y = 0.61
        ring.rotation.x = -Math.PI / 2
        ring.name = `radarRing${i}`
        scene.add(ring)
      }
    }

    // Spawn Phoneme Targets in 3D Space
    const spawnPhonemeTargets = () => {
      phonemeTargets = []

      gameState.phonemePool.forEach((phoneme, index) => {
        // Random position around the player
        const angle = (index / gameState.phonemePool.length) * Math.PI * 2
        const radius = 5 + Math.random() * 5
        const height = 0.5 + Math.random() * 2

        // Create phoneme orb
        const orbGeometry = new THREE.SphereGeometry(0.3, 32, 16)
        const orbMaterial = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(index * 0.1, 0.8, 0.5),
          emissive: new THREE.Color().setHSL(index * 0.1, 0.8, 0.3),
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: 0
        })

        const orbMesh = new THREE.Mesh(orbGeometry, orbMaterial)
        orbMesh.position.set(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        )
        orbMesh.userData = {
          phoneme: phoneme,
          detected: false,
          originalY: height
        }
        orbMesh.castShadow = true

        // Add text label
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 256
        canvas.height = 128
        context.fillStyle = '#00ffff'
        context.font = 'bold 48px Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(phoneme.symbol, 128, 64)

        const texture = new THREE.CanvasTexture(canvas)
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0
        })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(1, 0.5, 1)
        sprite.position.copy(orbMesh.position)
        sprite.position.y += 0.8

        scene.add(orbMesh)
        scene.add(sprite)

        phonemeTargets.push({
          mesh: orbMesh,
          sprite: sprite,
          phoneme: phoneme
        })

        // Store position in phoneme data
        phoneme.position = orbMesh.position.clone()
      })
    }

    // Setup VR Controllers
    const setupVRControllers = () => {
      const controllerModelFactory = new XRControllerModelFactory()

      // Controller 1 (Right Hand)
      const controller1 = renderer.xr.getController(0)
      controller1.addEventListener('selectstart', onControllerSelectStart)
      controller1.addEventListener('selectend', onControllerSelectEnd)
      scene.add(controller1)

      const controllerGrip1 = renderer.xr.getControllerGrip(0)
      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
      scene.add(controllerGrip1)

      // Controller 2 (Left Hand)
      const controller2 = renderer.xr.getController(1)
      controller2.addEventListener('selectstart', onControllerSelectStart)
      controller2.addEventListener('selectend', onControllerSelectEnd)
      scene.add(controller2)

      const controllerGrip2 = renderer.xr.getControllerGrip(1)
      controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
      scene.add(controllerGrip2)

      // Add laser pointers
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -5)
      ])

      const material = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        linewidth: 2
      })

      const line1 = new THREE.Line(geometry, material)
      controller1.add(line1)

      const line2 = new THREE.Line(geometry, material)
      controller2.add(line2)

      controllers = [controller1, controller2]

      // Raycaster for interaction
      raycaster = new THREE.Raycaster()
    }

    // Controller Interaction
    const onControllerSelectStart = (event) => {
      const controller = event.target

      // Check for radar interaction
      tempMatrix.identity().extractRotation(controller.matrixWorld)
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

      // Check radar intersection
      const radarIntersects = raycaster.intersectObject(radarMesh)
      if (radarIntersects.length > 0) {
        startRadarScan()
        return
      }

      // Check phoneme target intersection
      const targetMeshes = phonemeTargets.map(t => t.mesh)
      const intersects = raycaster.intersectObjects(targetMeshes)

      if (intersects.length > 0) {
        const target = intersects[0].object
        if (target.userData.phoneme && !target.userData.detected) {
          detectPhoneme(target.userData.phoneme)
        }
      }
    }

    const onControllerSelectEnd = (event) => {
      // Handle select end if needed
    }

    // Start Radar Scan
    const startRadarScan = () => {
      if (gameState.isScanning) return

      gameState.isScanning = true
      vrStatus.value = 'レーダースキャン中...'

      // Play radar ping sound
      if (radarPing.value) {
        radarPing.value.play()
      }

      // Animate radar scan
      let scanAngle = 0
      const scanInterval = setInterval(() => {
        scanAngle += gameState.scanSpeed

        const scanBeam = scene.getObjectByName('scanBeam')
        if (scanBeam) {
          scanBeam.rotation.y = scanAngle
        }

        // Check for phoneme detection
        phonemeTargets.forEach(target => {
          const distance = target.mesh.position.distanceTo(camera.position)
          if (distance < gameState.radarRange && !target.phoneme.detected) {
            // Calculate angle to target
            const angleToTarget = Math.atan2(
              target.mesh.position.z - camera.position.z,
              target.mesh.position.x - camera.position.x
            )

            // Check if scan beam is near target
            const scanBeamAngle = scanAngle % (Math.PI * 2)
            const angleDiff = Math.abs(scanBeamAngle - angleToTarget)

            if (angleDiff < 0.2) {
              // Reveal phoneme
              target.mesh.material.opacity = 1
              target.sprite.material.opacity = 1
              target.phoneme.detected = true

              // Play detection sound with 3D positioning
              playPositionalSound(target.mesh.position)
            }
          }
        })

        // Complete scan after full rotation
        if (scanAngle >= Math.PI * 2) {
          clearInterval(scanInterval)
          gameState.isScanning = false
          vrStatus.value = 'スキャン完了'

          // Select random phoneme as target
          selectRandomPhoneme()
        }
      }, 50)
    }

    // Select Random Phoneme Target
    const selectRandomPhoneme = () => {
      const detectedPhonemes = gameState.phonemePool.filter(p => p.detected)
      if (detectedPhonemes.length > 0) {
        const randomIndex = Math.floor(Math.random() * detectedPhonemes.length)
        gameState.currentPhoneme = detectedPhonemes[randomIndex]

        // Highlight target
        const target = phonemeTargets.find(t => t.phoneme.id === gameState.currentPhoneme.id)
        if (target) {
          target.mesh.material.emissiveIntensity = 1
          target.mesh.material.emissive = new THREE.Color(0xffff00)
        }

        logger.log(`🎯 Target phoneme selected: ${gameState.currentPhoneme.symbol}`)
      }
    }

    // Detect Phoneme (when user interacts with it)
    const detectPhoneme = (phoneme) => {
      if (phoneme.id !== gameState.currentPhoneme?.id) {
        // Wrong phoneme
        logger.log(`❌ Wrong phoneme: ${phoneme.symbol}`)
        return
      }

      // Correct phoneme detected!
      logger.log(`✅ Correct phoneme detected: ${phoneme.symbol}`)

      // Update score
      gameState.copilotScore += 100

      // Play success sound
      if (successSound.value) {
        successSound.value.play()
      }

      // Visual feedback
      const target = phonemeTargets.find(t => t.phoneme.id === phoneme.id)
      if (target) {
        // Particle explosion effect
        createParticleExplosion(target.mesh.position)

        // Remove target
        scene.remove(target.mesh)
        scene.remove(target.sprite)
      }

      // Check for level completion
      if (gameState.detectedPhonemes.length >= 5) {
        completeLevel()
      } else {
        // Continue to next phoneme
        setTimeout(() => {
          startRadarScan()
        }, 2000)
      }
    }

    // Setup 3D Audio
    const setupAudio = () => {
      audioListener = new THREE.AudioListener()
      camera.add(audioListener)

      // Create positional audio sources for phoneme targets
      phonemeTargets.forEach(target => {
        const sound = new THREE.PositionalAudio(audioListener)
        sound.setRefDistance(1)
        sound.setDistanceModel('exponential')
        sound.setMaxDistance(10)
        sound.setRolloffFactor(2)

        target.mesh.add(sound)
        positionalAudios.push(sound)
      })
    }

    // Play 3D Positioned Sound
    const playPositionalSound = (position) => {
      if (phonemeDetected.value) {
        const audio = new THREE.PositionalAudio(audioListener)
        audio.setBuffer(phonemeDetected.value)
        audio.setRefDistance(1)
        audio.position.copy(position)
        audio.play()

        setTimeout(() => {
          audio.stop()
          scene.remove(audio)
        }, 2000)
      }
    }

    // Create Particle Explosion Effect
    const createParticleExplosion = (position) => {
      const particleCount = 50
      const particles = []

      for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
          transparent: true,
          opacity: 1
        })

        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        particle.position.copy(position)

        // Random velocity
        particle.userData.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.2 + 0.1,
          (Math.random() - 0.5) * 0.2
        )

        scene.add(particle)
        particles.push(particle)
      }

      // Animate particles
      let frame = 0
      const animateParticles = () => {
        frame++

        particles.forEach(particle => {
          particle.position.add(particle.userData.velocity)
          particle.userData.velocity.y -= 0.01 // Gravity
          particle.material.opacity = Math.max(0, 1 - frame * 0.02)

          if (particle.material.opacity <= 0) {
            scene.remove(particle)
          }
        })

        if (frame < 50) {
          requestAnimationFrame(animateParticles)
        }
      }

      animateParticles()
    }

    // Create Star Field Background
    const createStarField = () => {
      const starsGeometry = new THREE.BufferGeometry()
      const starPositions = []

      for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 200
        const y = (Math.random() - 0.5) * 200
        const z = (Math.random() - 0.5) * 200
        starPositions.push(x, y, z)
      }

      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))

      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
      })

      const stars = new THREE.Points(starsGeometry, starsMaterial)
      scene.add(stars)
    }

    // Create Floor Grid
    const createFloor = () => {
      const floorGeometry = new THREE.PlaneGeometry(50, 50)
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x001122,
        metalness: 0.8,
        roughness: 0.2
      })

      const floor = new THREE.Mesh(floorGeometry, floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      scene.add(floor)

      // Grid overlay
      const gridHelper = new THREE.GridHelper(50, 50, 0x004466, 0x002233)
      scene.add(gridHelper)
    }

    // Complete Level
    const completeLevel = () => {
      logger.log('🎉 Level completed!')

      // Award VR ticket
      ticketStore.earnTicket('game_clear', {
        game: 'SoundRadarVR',
        score: totalScore.value
      })

      // Update game progress
      gameStore.updateGameProgress('soundRadarVR', {
        completed: true,
        bestScore: Math.max(gameStore.getGameProgress('soundRadarVR').bestScore || 0, totalScore.value),
        captainScore: gameState.captainScore,
        copilotScore: gameState.copilotScore
      })

      vrStatus.value = 'レベルクリア！'

      // Reset for next level
      setTimeout(() => {
        gameState.currentLevel++
        gameState.detectedPhonemes = []
        gameState.phonemePool.forEach(p => p.detected = false)
        spawnPhonemeTargets()
        startRadarScan()
      }, 3000)
    }

    // Enter VR Mode
    const enterVR = async () => {
      try {
        // Check if VR ticket is available
        if (!ticketStore.canUseTicket) {
          alert('VRチケットが不足しています')
          return
        }

        // Request VR session
        vrSession = await navigator.xr.requestSession('immersive-vr', {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
        })

        // Set the session to the renderer
        await renderer.xr.setSession(vrSession)

        // Use VR ticket
        ticketStore.useTicket('vr_session', {
          game: 'SoundRadarVR'
        })

        isVRActive.value = true
        vrStatus.value = 'VRモード'

        // Handle session end
        vrSession.addEventListener('end', () => {
          isVRActive.value = false
          vrStatus.value = 'VR終了'
          vrSession = null
        })

        logger.log('🥽 Entered VR mode')

      } catch (error) {
        logger.error('Failed to enter VR:', error)
        alert('VRモードの開始に失敗しました: ' + error.message)
      }
    }

    // Animation Loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        // Update animations
        const time = Date.now() * 0.001

        // Rotate radar rings
        for (let i = 1; i <= 3; i++) {
          const ring = scene.getObjectByName(`radarRing${i}`)
          if (ring) {
            ring.scale.x = 1 + Math.sin(time * 2 + i) * 0.1
            ring.scale.y = 1 + Math.sin(time * 2 + i) * 0.1
            ring.material.opacity = 0.5 - Math.sin(time * 2 + i) * 0.2
          }
        }

        // Float phoneme targets
        phonemeTargets.forEach((target, index) => {
          if (target.mesh) {
            target.mesh.position.y = target.mesh.userData.originalY + Math.sin(time + index) * 0.1
            target.mesh.rotation.y = time * 0.5
          }
        })

        // Render scene
        renderer.render(scene, camera)
      })
    }

    // Handle Window Resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    // Lifecycle
    onMounted(async () => {
      await initVR()
      window.addEventListener('resize', handleResize)

      // Add VR button if supported
      if (vrSupported.value && vrContainer.value) {
        const vrButton = VRButton.createButton(renderer)
        vrButton.style.position = 'absolute'
        vrButton.style.bottom = '20px'
        vrButton.style.left = '50%'
        vrButton.style.transform = 'translateX(-50%)'
        vrContainer.value.appendChild(vrButton)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)

      if (renderer) {
        renderer.dispose()
        renderer.xr.enabled = false
        renderer.setAnimationLoop(null)
      }

      if (vrSession) {
        vrSession.end()
      }

      // Clean up Three.js resources
      scene?.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })

    return {
      // Template refs
      vrContainer,
      vrCanvas,
      hudElement,
      radarPing,
      phonemeDetected,
      successSound,

      // State
      isVRActive,
      vrSupported,
      vrStatus,

      // Game state
      currentPhoneme,
      isScanning,
      totalScore,

      // Methods
      enterVR
    }
  }
}
</script>

<style scoped>
.sound-radar-vr-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #000814 0%, #001d3d 100%);
}

.vr-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
}

.vr-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(to bottom, rgba(0, 8, 20, 0.9), transparent);
  pointer-events: auto;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
}

.status-label {
  opacity: 0.7;
  font-size: 0.875rem;
}

.status-value {
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.vr-enter-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00ffff 0%, #0066ff 100%);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 2rem;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.vr-enter-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
}

.game-hud {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
  padding: 1rem 2rem;
  background: rgba(0, 8, 20, 0.9);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.hud-score,
.hud-phoneme,
.hud-radar-status {
  text-align: center;
  color: white;
}

.score-label,
.phoneme-label,
.radar-label {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.phoneme-value {
  font-size: 2rem;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.radar-value {
  font-size: 1rem;
  color: #ff6b6b;
  transition: all 0.3s ease;
}

.radar-value.active {
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .game-hud {
    bottom: 1rem;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }

  .score-value,
  .phoneme-value {
    font-size: 1.25rem;
  }
}
</style>